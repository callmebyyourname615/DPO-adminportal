import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ResourceForm } from "@/components/admin/ResourceForm";

const { createBanner, createPage, uploadMedia, getBanner, updateBanner } = vi.hoisted(() => ({ getBanner: vi.fn().mockResolvedValue({ id: "legacy-banner-1", title: "Existing banner", imageUrl: "/existing.png", linkUrl: "https://example.org", order: 2, status: "draft" }), updateBanner: vi.fn().mockResolvedValue({ id: "legacy-banner-1" }), createBanner: vi.fn().mockResolvedValue({ id: "banner-1" }), createPage: vi.fn().mockResolvedValue({ id: "page-1" }), uploadMedia: vi.fn().mockResolvedValue({ url: "/api/media/image/content", fileName: "image.png", size: 5 }) }));
vi.mock("@tanstack/react-router", () => ({ Link: ({ children }: any) => <a href="#">{children}</a>, useNavigate: () => vi.fn() }));
vi.mock("@/lib/api/client", () => ({ canUseData: () => true, getApiBaseUrl: () => "http://localhost:3000", ApiNotConnectedError: class extends Error {} }));
vi.mock("@/lib/api/services", () => ({ services: { banners: { create: createBanner, get: getBanner, update: updateBanner }, pages: { create: createPage } }, uploadMedia }));
vi.mock("@/components/admin/LoadingSkeleton", () => ({ LoadingSkeleton: () => <span>loading</span> }));

function mount(resourceKey: string, id = "new") {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={client}><ResourceForm resourceKey={resourceKey} id={id} /></QueryClientProvider>);
}

describe("site content creation", () => {
  it("uploads the banner image and submits its URL", async () => {
    mount("banners");
    fireEvent.change(screen.getByLabelText(/ຊື່ປ້າຍໂຄສະນາ/), { target: { value: "Banner" } });
    fireEvent.change(screen.getByLabelText("ຮູບ *"), { target: { files: [new File(["image"], "image.png", { type: "image/png" })] } });
    await waitFor(() => expect(screen.getByRole("button", { name: "ບັນທຶກ" })).toBeEnabled());
    fireEvent.click(screen.getByRole("button", { name: "ບັນທຶກ" }));
    await waitFor(() => expect(createBanner).toHaveBeenCalledWith(expect.objectContaining({ title: "Banner", imageUrl: "/api/media/image/content" })));
  });
  it("submits the page title, slug and content", async () => {
    mount("pages");
    fireEvent.change(screen.getByLabelText(/ຊື່ໜ້າ/), { target: { value: "About" } });
    fireEvent.change(screen.getByLabelText(/^Slug/), { target: { value: "about" } });
    fireEvent.change(screen.getByLabelText(/ເນື້ອໃນ/), { target: { value: "About the office" } });
    fireEvent.click(screen.getByRole("button", { name: "ບັນທຶກ" }));
    await waitFor(() => expect(createPage).toHaveBeenCalledWith(expect.objectContaining({ title: "About", slug: "about", content: "About the office" })));
  });
  it("loads an existing banner and saves changes through the update API", async () => {
    mount("banners", "legacy-banner-1");
    const title = await screen.findByDisplayValue("Existing banner");
    expect(getBanner).toHaveBeenCalledWith("legacy-banner-1");
    expect(screen.getAllByRole("img").some(image => image.getAttribute("src") === "/existing.png")).toBe(true);
    fireEvent.change(title, { target: { value: "Updated banner" } });
    fireEvent.click(screen.getByRole("button", { name: "ບັນທຶກ" }));
    await waitFor(() => expect(updateBanner).toHaveBeenCalledWith("legacy-banner-1", expect.objectContaining({ title: "Updated banner", imageUrl: "/existing.png", order: 2 })));
  });

});
