import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DocumentsList } from "@/components/admin/DocumentsList";

const { remove, success, error } = vi.hoisted(() => ({ remove: vi.fn(), success: vi.fn(), error: vi.fn() }));
vi.mock("@tanstack/react-router", () => ({ Link: ({ children, ...props }: any) => <a href="#" aria-label={props["aria-label"]}>{children}</a>, useNavigate: () => vi.fn() }));
vi.mock("@/lib/notifications", () => ({ notify: { success, error } }));
vi.mock("@/lib/api/services", () => ({ services: { documents: {
  list: vi.fn().mockResolvedValue({ data: [{ id: "doc-1", title: "Test document", category: "decree", fileType: "pdf", fileName: "test.pdf", fileUrl: "/api/assets/documents/test.pdf", fileSize: 100, fileStatus: "available", documentDate: null, status: "draft" }], page: 1, totalPages: 1, total: 1 }),
  remove,
} } }));

function mount() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(<QueryClientProvider client={client}><DocumentsList search={{}} /></QueryClientProvider>);
  return client;
}

describe("document action deletion", () => {
  beforeEach(() => { vi.clearAllMocks(); remove.mockResolvedValue(undefined); });
  it("keeps open/edit actions and cancels deletion without calling the API", async () => {
    mount();
    expect(await screen.findByRole("link", { name: "ເປີດ Test document" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "ແກ້ໄຂ Test document" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "ລຶບ Test document" }));
    const dialog = screen.getByRole("alertdialog");
    expect(dialog).toHaveTextContent("Test document");
    expect(remove).not.toHaveBeenCalled();
    fireEvent.click(within(dialog).getByRole("button", { name: "ຍົກເລີກ" }));
    expect(remove).not.toHaveBeenCalled();
  });
  it("deletes only after confirmation and refreshes the list and statistics", async () => {
    const client = mount();
    const invalidate = vi.spyOn(client, "invalidateQueries");
    fireEvent.click(await screen.findByRole("button", { name: "ລຶບ Test document" }));
    fireEvent.click(within(screen.getByRole("alertdialog")).getByRole("button", { name: "ລຶບ" }));
    await waitFor(() => expect(remove).toHaveBeenCalledWith("doc-1"));
    await waitFor(() => expect(success).toHaveBeenCalled());
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ["documents"] });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ["stats"] });
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });
  it("reports deletion errors using the container alert notification API", async () => {
    remove.mockRejectedValueOnce(new Error("Forbidden"));
    mount();
    fireEvent.click(await screen.findByRole("button", { name: "ລຶບ Test document" }));
    fireEvent.click(within(screen.getByRole("alertdialog")).getByRole("button", { name: "ລຶບ" }));
    await waitFor(() => expect(error).toHaveBeenCalledWith(expect.stringContaining("Forbidden")));
    expect(success).not.toHaveBeenCalled();
    expect(screen.getByRole("alertdialog")).toHaveTextContent("Test document");
  });
});
