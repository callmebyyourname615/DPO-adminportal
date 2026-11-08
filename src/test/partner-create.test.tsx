import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ResourceForm } from "@/components/admin/ResourceForm";
const { create, uploadMedia } = vi.hoisted(() => ({ create: vi.fn().mockResolvedValue({ id: "partner-1" }), uploadMedia: vi.fn() }));
vi.mock("@tanstack/react-router", () => ({ Link: ({children}: any) => <a href="#">{children}</a>, useNavigate: () => vi.fn() }));
vi.mock("@/lib/api/client", () => ({ canUseData: () => true, ApiNotConnectedError: class extends Error {} }));
vi.mock("@/lib/api/services", () => ({ services: { partners: { create } }, uploadMedia }));
vi.mock("@/components/admin/LoadingSkeleton", () => ({ LoadingSkeleton: () => <span>loading</span> }));
describe("partner creation", () => {
  it("uploads the logo and submits the partner fields", async () => {
    uploadMedia.mockResolvedValue({ fileName: "logo.png", size: 5, url: "/api/media/logo/content" });
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(<QueryClientProvider client={client}><ResourceForm resourceKey="partners" id="new" /></QueryClientProvider>);
    fireEvent.change(screen.getByLabelText(/ຊື່ອົງການ/), { target: { value: "Partner office" } });
    fireEvent.change(screen.getByLabelText(/URL ເວັບໄຊທ໌/), { target: { value: "https://example.org" } });
    fireEvent.change(screen.getByLabelText("ໂລໂກ້"), { target: { files: [new File(["image"], "logo.png", { type: "image/png" })] } });
    await waitFor(() => expect(screen.getByRole("button", { name: "ບັນທຶກ" })).toBeEnabled());
    fireEvent.click(screen.getByRole("button", { name: "ບັນທຶກ" }));
    await waitFor(() => expect(create).toHaveBeenCalledWith(expect.objectContaining({ name: "Partner office", url: "https://example.org", logoUrl: "/api/media/logo/content" })));
  });
});
