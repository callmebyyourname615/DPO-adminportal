import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ResourceForm } from "@/components/admin/ResourceForm";

const { get, update, uploadMedia } = vi.hoisted(() => ({
  get: vi.fn().mockResolvedValue({ id: "doc-1", title: "Original document", category: "decree", documentDate: null, fileUrl: "/api/media/old/content", fileName: "old.pdf", fileType: "pdf", fileSize: 100, fileStatus: "available", status: "published" }),
  update: vi.fn().mockResolvedValue({ id: "doc-1" }),
  uploadMedia: vi.fn(),
}));
vi.mock("@tanstack/react-router", () => ({ Link: ({ children }: any) => <a href="#">{children}</a>, useNavigate: () => vi.fn() }));
vi.mock("@/lib/api/client", () => ({ canUseData: () => true, getApiBaseUrl: () => "http://localhost:3000", ApiNotConnectedError: class extends Error {} }));
vi.mock("@/lib/api/services", () => ({ services: { documents: { get, update } }, uploadMedia }));
vi.mock("@/components/admin/LoadingSkeleton", () => ({ LoadingSkeleton: () => <span>loading</span> }));

describe("document editing", () => {
  it("loads the document and preserves the file while saving changes", async () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(<QueryClientProvider client={client}><ResourceForm resourceKey="documents" id="doc-1" /></QueryClientProvider>);
    const title = await screen.findByDisplayValue("Original document");
    expect(screen.getByRole("link", { name: "ເປີດໄຟລ໌ເອກະສານ" })).toHaveAttribute("href", "http://localhost:3000/api/media/old/content");
    fireEvent.change(title, { target: { value: "Updated document" } });
    fireEvent.click(screen.getByRole("button", { name: "ບັນທຶກ" }));
    await waitFor(() => expect(update).toHaveBeenCalledWith("doc-1", expect.objectContaining({ title: "Updated document", fileUrl: "/api/media/old/content", fileName: "old.pdf", status: "published" })));
  });
  it("waits for a replacement file upload before saving its metadata", async () => {
    let finish!: (value: unknown) => void;
    uploadMedia.mockReturnValueOnce(new Promise(resolve => { finish = resolve; }));
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(<QueryClientProvider client={client}><ResourceForm resourceKey="documents" id="doc-1" /></QueryClientProvider>);
    const fileInput = await screen.findByLabelText(/ໄຟລ໌ \(PDF\/XLSX\)/);
    fireEvent.change(fileInput, { target: { files: [new File(["%PDF-"], "replacement.pdf", { type: "application/pdf" })] } });
    expect(screen.getByRole("button", { name: "ບັນທຶກ" })).toBeDisabled();
    finish({ fileName: "replacement.pdf", size: 5, url: "/api/media/new/content" });
    await waitFor(() => expect(screen.getByRole("button", { name: "ບັນທຶກ" })).toBeEnabled());
    fireEvent.click(screen.getByRole("button", { name: "ບັນທຶກ" }));
    await waitFor(() => expect(update).toHaveBeenCalledWith("doc-1", expect.objectContaining({ fileName: "replacement.pdf", fileSize: 5, fileUrl: "/api/media/new/content" })));
  });
});
