import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { NewsList } from "@/components/admin/NewsList";

const { remove } = vi.hoisted(() => ({ remove: vi.fn().mockResolvedValue(undefined) }));
vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, ...props }: any) => <a href="#" aria-label={props["aria-label"]}>{children}</a>,
  useNavigate: () => vi.fn(),
}));
vi.mock("@/lib/api/services", () => ({
  services: { news: { list: vi.fn().mockResolvedValue({ data: [{ id: "item-1", title: "Test news", slug: "test", category: "news", coverImageUrl: null, excerpt: "", publishedAt: null, createdAt: "2026-01-01", status: "draft" }], page: 1, totalPages: 1, total: 1 }), remove } },
  statsService: { get: vi.fn().mockResolvedValue({ newsTotal: 1, newsPublished: 0 }) },
}));
vi.mock("@/components/admin/LoadingSkeleton", () => ({ LoadingSkeleton: () => <span>loading</span> }));

describe("news list deletion", () => {
  it("asks for confirmation and deletes the selected news item", async () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(<QueryClientProvider client={client}><NewsList search={{}} /></QueryClientProvider>);
    fireEvent.click(await screen.findByRole("button", { name: "ລຶບ Test news" }));
    expect(screen.getByRole("alertdialog")).toHaveTextContent("Test news");
    expect(remove).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: /^ລຶບ$/ }));
    await waitFor(() => expect(remove).toHaveBeenCalledWith("item-1"));
  });
});
