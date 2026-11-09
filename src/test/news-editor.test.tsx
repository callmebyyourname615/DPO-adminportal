import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ResourceForm } from "@/components/admin/ResourceForm";

const { update, create } = vi.hoisted(() => ({ update: vi.fn().mockResolvedValue({ id: "news-1" }), create: vi.fn().mockResolvedValue({ id: "created-news" }) }));
vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, ...props }: any) => <a href="#" aria-label={props["aria-label"]}>{children}</a>,
  useNavigate: () => vi.fn(),
}));
vi.mock("@/lib/api/client", () => ({ canUseData: () => true, getApiBaseUrl: () => "http://localhost:3000", ApiNotConnectedError: class extends Error {} }));
vi.mock("@/lib/api/services", () => ({
  services: { news: { get: vi.fn().mockResolvedValue({ id: "news-1", title: "Original title", slug: "news-1", category: "news", content: "Article content", excerpt: "", gallery: ["https://example.com/photo.jpg"], coverImageUrl: null, publishedAt: null, status: "draft" }), update, create } },
  uploadMedia: vi.fn(),
}));
vi.mock("@/components/admin/LoadingSkeleton", () => ({ LoadingSkeleton: () => <span>loading</span> }));

describe("news editor", () => {
  beforeEach(() => { vi.clearAllMocks(); });
  it.each([
    ["ຂ່າວ ສປງ", "", "ຂ່າວ-ສປງ"],
    ["DPO News", "", "dpo-news"],
    ["DPO News", " ຂ່າວ_ໃໝ່ ", "ຂ່າວ_ໃໝ່"],
  ])("creates news from %s with a usable slug", async (title, slug, expected) => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(<QueryClientProvider client={client}><ResourceForm resourceKey="news" id="new" /></QueryClientProvider>);
    fireEvent.change(screen.getByLabelText(/^ຫົວຂໍ້/), { target: { value: title } });
    fireEvent.change(screen.getByLabelText(/^ເນື້ອຫາຂ່າວ/), { target: { value: "Article content" } });
    if (slug) fireEvent.change(screen.getByLabelText(/^Slug/), { target: { value: slug } });
    fireEvent.click(screen.getByRole("button", { name: "ບັນທຶກ" }));
    await waitFor(() => expect(create).toHaveBeenCalledWith(expect.objectContaining({ title, slug: expected, content: "Article content", gallery: [], status: "draft" })));
  });
  it("shows a duplicate slug conflict beside the field and focuses it", async () => {
    create.mockRejectedValueOnce(Object.assign(new Error("Duplicate slug"), { status: 409 }));
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(<QueryClientProvider client={client}><ResourceForm resourceKey="news" id="new" /></QueryClientProvider>);
    fireEvent.change(screen.getByLabelText(/^ຫົວຂໍ້/), { target: { value: "DPO News" } });
    fireEvent.change(screen.getByLabelText(/^ເນື້ອຫາຂ່າວ/), { target: { value: "Article content" } });
    fireEvent.click(screen.getByRole("button", { name: "ບັນທຶກ" }));
    await screen.findByText("Slug ນີ້ຖືກໃຊ້ແລ້ວ");
    expect(screen.getByLabelText(/^Slug/)).toHaveFocus();
  });
  it("keeps required content validation and focuses the missing field", () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(<QueryClientProvider client={client}><ResourceForm resourceKey="news" id="new" /></QueryClientProvider>);
    fireEvent.change(screen.getByLabelText(/^ຫົວຂໍ້/), { target: { value: "DPO News" } });
    fireEvent.click(screen.getByRole("button", { name: "ບັນທຶກ" }));
    expect(create).not.toHaveBeenCalled();
    expect(screen.getByLabelText(/^ເນື້ອຫາຂ່າວ/)).toHaveFocus();
  });
  it("edits and saves the news fields in the reorganized form", async () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(<QueryClientProvider client={client}><ResourceForm resourceKey="news" id="news-1" /></QueryClientProvider>);
    expect(await screen.findByRole("heading", { name: "Original title" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "ແກ້ໄຂຂ່າວ" }));
    const title = await screen.findByDisplayValue("Original title");
    fireEvent.change(title, { target: { value: "Updated title" } });
    fireEvent.click(screen.getByRole("button", { name: "ລຶບ ຄັງຮູບ 1" }));
    fireEvent.click(screen.getByRole("button", { name: "ບັນທຶກ" }));
    await waitFor(() => expect(update).toHaveBeenCalledWith("news-1", expect.objectContaining({ title: "Updated title", content: "Article content", gallery: [] })));
    expect(update.mock.calls[0]![1]).not.toHaveProperty("id");
  });
});
