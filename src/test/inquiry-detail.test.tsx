import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ResourceForm } from "@/components/admin/ResourceForm";

const { get, update, success, error } = vi.hoisted(() => ({ get: vi.fn(), update: vi.fn(), success: vi.fn(), error: vi.fn() }));
vi.mock("@tanstack/react-router", () => ({ Link: ({ children, to, ...props }: any) => <a href={to} {...props}>{children}</a>, useNavigate: () => vi.fn() }));
vi.mock("@/lib/notifications", () => ({ notify: { success, error } }));
vi.mock("@/lib/api/client", () => ({ canUseData: () => true, ApiNotConnectedError: class extends Error {} }));
vi.mock("@/lib/api/services", () => ({ services: { inquiries: { get, update } }, uploadMedia: vi.fn() }));

const inquiry = { id: "inquiry-1", name: "ຜູ້ຕິດຕໍ່", email: "sender@example.com", subject: "ສອບຖາມຂໍ້ມູນ", message: "First paragraph\nSecond paragraph", source: "contact", status: "new", createdAt: "2026-11-08T13:00:00Z", updatedAt: "2026-11-08T13:00:00Z" };
function mount() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={client}><ResourceForm resourceKey="inquiries" id="inquiry-1" /></QueryClientProvider>);
}

describe("inquiry detail workspace", () => {
  beforeEach(() => { vi.clearAllMocks(); get.mockResolvedValue(inquiry); });
  it("shows the message, sender and a real email action without editing sender data", async () => {
    const view = mount();
    expect(await screen.findByRole("heading", { name: inquiry.subject })).toBeInTheDocument();
    expect(screen.getByText(inquiry.name)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: inquiry.email })).toHaveAttribute("href", "mailto:sender%40example.com");
    expect(screen.getByRole("link", { name: "ຕອບກັບທາງອີເມວ" })).toHaveAttribute("href", expect.stringContaining("subject=Re%3A"));
    expect(screen.getByText(/First paragraph/)).toHaveTextContent("Second paragraph");
    expect(view.container.querySelector('svg[data-prefix="fas"]')).toBeInTheDocument();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "ບັນທຶກ" })).toBeDisabled();
  });
  it("saves only the status, blocks a second save while pending and shows success", async () => {
    let finish!: (value: unknown) => void;
    update.mockReturnValueOnce(new Promise(resolve => { finish = resolve; }));
    mount();
    const status = await screen.findByLabelText("ສະຖານະ *");
    fireEvent.change(status, { target: { value: "resolved" } });
    fireEvent.click(screen.getByRole("button", { name: "ບັນທຶກ" }));
    await waitFor(() => expect(update).toHaveBeenCalledExactlyOnceWith("inquiry-1", { status: "resolved" }));
    expect(status).toBeDisabled();
    expect(screen.getByRole("button", { busy: true })).toBeDisabled();
    const saved = { ...inquiry, status: "resolved" };
    get.mockResolvedValue(saved);
    finish(saved);
    await waitFor(() => expect(success).toHaveBeenCalled());
    await waitFor(() => expect(screen.getByRole("button", { name: "ບັນທຶກ" })).toBeDisabled());
  });
  it("retains the selected status and permits retry after a save failure", async () => {
    update.mockRejectedValueOnce(new Error("Connection failed"));
    mount();
    const status = await screen.findByLabelText("ສະຖານະ *");
    fireEvent.change(status, { target: { value: "in_progress" } });
    fireEvent.click(screen.getByRole("button", { name: "ບັນທຶກ" }));
    await waitFor(() => expect(error).toHaveBeenCalledWith(expect.stringContaining("Connection failed")));
    expect(status).toHaveValue("in_progress");
    expect(screen.getByRole("button", { name: "ບັນທຶກ" })).toBeEnabled();
    expect(success).not.toHaveBeenCalled();
  });
  it("handles an empty subject and identifies FAQ inquiries", async () => {
    get.mockResolvedValueOnce({ ...inquiry, subject: "", source: "faq" });
    mount();
    expect(await screen.findByRole("heading", { name: "ຂໍ້ຄວາມຕິດຕໍ່" })).toBeInTheDocument();
    expect(screen.getByText("FAQ")).toBeInTheDocument();
  });
});
