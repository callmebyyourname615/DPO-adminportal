import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ResourceForm } from "@/components/admin/ResourceForm";

const { create, uploadMedia } = vi.hoisted(() => ({ create: vi.fn().mockResolvedValue({ id: "doc-1" }), uploadMedia: vi.fn() }));
vi.mock("@tanstack/react-router", () => ({ Link: ({children}: any) => <a href="#">{children}</a>, useNavigate: () => vi.fn() }));
vi.mock("@/lib/api/client", () => ({ canUseData: () => true, getApiBaseUrl: () => "http://localhost:3000", ApiNotConnectedError: class extends Error {} }));
vi.mock("@/lib/api/services", () => ({ services: { documents: { create } }, uploadMedia }));
vi.mock("@/components/admin/LoadingSkeleton", () => ({ LoadingSkeleton: () => <span>loading</span> }));

describe("document creation", () => {
  it("waits for upload and sends file metadata with the document", async () => {
    let finish!: (value: unknown) => void;
    uploadMedia.mockReturnValue(new Promise(resolve => { finish = resolve; }));
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(<QueryClientProvider client={client}><ResourceForm resourceKey="documents" id="new" /></QueryClientProvider>);
    fireEvent.change(screen.getByLabelText(/ຊື່ເອກະສານ/), { target: { value: "Document title" } });
    fireEvent.change(screen.getByLabelText(/ໄຟລ໌ \(PDF\/XLSX\)/), { target: { files: [new File(["%PDF-"], "report.pdf", { type: "application/pdf" })] } });
    expect(screen.getByRole("button", { name: "ບັນທຶກ" })).toBeDisabled();
    finish({ fileName: "report.pdf", size: 5, url: "/api/media/file/content" });
    await waitFor(() => expect(screen.getByRole("button", { name: "ບັນທຶກ" })).toBeEnabled());
    fireEvent.click(screen.getByRole("button", { name: "ບັນທຶກ" }));
    await waitFor(() => expect(create).toHaveBeenCalledWith(expect.objectContaining({ title: "Document title", fileName: "report.pdf", fileType: "pdf", fileSize: 5, fileStatus: "available", fileUrl: "/api/media/file/content" })));
  });
});
