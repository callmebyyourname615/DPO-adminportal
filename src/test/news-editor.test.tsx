import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ResourceForm } from "@/components/admin/ResourceForm";

const { update } = vi.hoisted(() => ({ update: vi.fn().mockResolvedValue({ id: "news-1" }) }));
vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, ...props }: any) => <a href="#" aria-label={props["aria-label"]}>{children}</a>,
  useNavigate: () => vi.fn(),
}));
vi.mock("@/lib/api/client", () => ({ canUseData: () => true, ApiNotConnectedError: class extends Error {} }));
vi.mock("@/lib/api/services", () => ({
  services: { news: { get: vi.fn().mockResolvedValue({ id: "news-1", title: "Original title", slug: "news-1", category: "news", content: "Article content", excerpt: "", gallery: ["https://example.com/photo.jpg"], coverImageUrl: null, publishedAt: null, status: "draft" }), update } },
  uploadMedia: vi.fn(),
}));
vi.mock("@/components/admin/LoadingSkeleton", () => ({ LoadingSkeleton: () => <span>loading</span> }));

describe("news editor", () => {
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
