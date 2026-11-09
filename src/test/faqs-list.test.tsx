import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ResourceList } from "@/components/admin/ResourceList";

const { remove, removePartner, success, error } = vi.hoisted(() => ({ remove: vi.fn(), removePartner: vi.fn(), success: vi.fn(), error: vi.fn() }));
vi.mock("@tanstack/react-router", () => ({ Link: ({ children }: any) => <a href="#">{children}</a>, useNavigate: () => vi.fn() }));
vi.mock("@/lib/notifications", () => ({ notify: { success, error } }));
vi.mock("@/lib/api/services", () => ({ services: {
  faqs: {
    list: vi.fn().mockResolvedValue({ data: [{ id: "faq-1", question: "First question?", order: 1, status: "draft" }, { id: "faq-2", question: "Second question?", order: 2, status: "draft" }], page: 1, totalPages: 1, total: 2 }),
    remove,
  },
  partners: { list: vi.fn().mockResolvedValue({ data: [{ id: "partner-1", name: "Partner", url: "https://example.com", order: 1, status: "draft" }], page: 1, totalPages: 1, total: 1 }), remove: removePartner },
  banners: { list: vi.fn().mockResolvedValue({ data: [{ id: "banner-1", title: "Banner", order: 1, status: "draft" }], page: 1, totalPages: 1, total: 1 }) },
} }));

function mount(resourceKey = "faqs") {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(<QueryClientProvider client={client}><ResourceList resourceKey={resourceKey} search={{}} /></QueryClientProvider>);
  return client;
}

describe("FAQ list deletion", () => {
  beforeEach(() => { vi.clearAllMocks(); remove.mockResolvedValue(undefined); removePartner.mockResolvedValue(undefined); });
  it("cancels without deleting and confirms only the selected question", async () => {
    const client = mount();
    const invalidate = vi.spyOn(client, "invalidateQueries");
    fireEvent.click(await screen.findByRole("button", { name: "ລຶບ First question?" }));
    expect(screen.getByRole("alertdialog")).toHaveTextContent("First question?");
    expect(remove).not.toHaveBeenCalled();
    fireEvent.click(within(screen.getByRole("alertdialog")).getByRole("button", { name: "ຍົກເລີກ" }));
    expect(remove).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "ລຶບ Second question?" }));
    fireEvent.click(within(screen.getByRole("alertdialog")).getByRole("button", { name: "ລຶບ" }));
    await waitFor(() => expect(remove).toHaveBeenCalledExactlyOnceWith("faq-2"));
    await waitFor(() => expect(success).toHaveBeenCalled());
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ["faqs"] });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ["stats"] });
  });
  it("uses the error container alert when deletion fails", async () => {
    remove.mockRejectedValueOnce(new Error("Forbidden"));
    mount();
    fireEvent.click(await screen.findByRole("button", { name: "ລຶບ First question?" }));
    fireEvent.click(within(screen.getByRole("alertdialog")).getByRole("button", { name: "ລຶບ" }));
    await waitFor(() => expect(error).toHaveBeenCalledWith(expect.stringContaining("Forbidden")));
    expect(success).not.toHaveBeenCalled();
  });
  it("confirms the partner name and deletes through the partner service", async () => {
    mount("partners");
    fireEvent.click(await screen.findByRole("button", { name: "ລຶບ Partner" }));
    const dialog = screen.getByRole("alertdialog");
    expect(dialog).toHaveTextContent("Partner");
    expect(dialog).toHaveTextContent("ຢືນຢັນການລຶບອົງການ?");
    fireEvent.click(within(dialog).getByRole("button", { name: "ລຶບ" }));
    await waitFor(() => expect(removePartner).toHaveBeenCalledExactlyOnceWith("partner-1"));
    expect(remove).not.toHaveBeenCalled();
    await waitFor(() => expect(success).toHaveBeenCalled());
  });
  it("leaves other resource lists unchanged", async () => {
    mount("banners");
    await screen.findByText("Banner");
    expect(screen.queryByRole("button", { name: /^ລຶບ / })).not.toBeInTheDocument();
  });
});
