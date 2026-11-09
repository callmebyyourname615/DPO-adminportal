import { useState } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FieldInput } from "@/components/admin/FormFields";
import { mediaUrl } from "@/lib/api/media";
import { uploadMedia } from "@/lib/api/services";

vi.mock("@/lib/api/services", () => ({ uploadMedia: vi.fn() }));
beforeEach(() => { vi.stubEnv("VITE_DPO_API_BASE_URL", "https://api.example.com/"); });
afterEach(() => { vi.unstubAllEnvs(); vi.clearAllMocks(); });

describe("API asset URLs", () => {
  it.each([
    ["/api/assets/images/photo.jpg", "https://api.example.com/api/assets/images/photo.jpg"],
    ["/api/assets/dpo/photo.jpg", "https://api.example.com/api/assets/dpo/photo.jpg"],
    ["/api/assets/documents/report.pdf#page=3", "https://api.example.com/api/assets/documents/report.pdf#page=3"],
    ["/api/assets/audio/spot.mp3", "https://api.example.com/api/assets/audio/spot.mp3"],
    ["/api/media/file-id/content", "https://api.example.com/api/media/file-id/content"],
    ["/assets/dpo/photo.jpg", "https://api.example.com/api/assets/dpo/photo.jpg"],
    ["https://cdn.example.com/photo.jpg", "https://cdn.example.com/photo.jpg"],
    [null, ""],
  ])("resolves %s", (value, expected) => { expect(mediaUrl(value)).toBe(expected); });
  it("keeps API paths relative when using the same origin", () => {
    vi.stubEnv("VITE_DPO_API_BASE_URL", "");
    expect(mediaUrl("/api/assets/images/photo.jpg")).toBe("/api/assets/images/photo.jpg");
  });
  it("previews migrated gallery images and appends uploads without rewriting saved URLs", async () => {
    const changed = vi.fn();
    vi.mocked(uploadMedia).mockResolvedValue({ id: "image", url: "/api/media/image/content", fileName: "new.png", mimeType: "image/png", size: 5, createdAt: "", updatedAt: "" });
    function Gallery() {
      const [value, setValue] = useState<unknown>(["/api/assets/images/original.png"]);
      return <FieldInput visualMedia field={{ name: "gallery", label: "Gallery", type: "gallery", accept: ["png"], maxMb: 5 }} values={{}} value={value} onChange={next => { changed(next); setValue(next); }} />;
    }
    render(<Gallery />);
    expect(screen.getByAltText("Gallery 1")).toHaveAttribute("src", "https://api.example.com/api/assets/images/original.png");
    fireEvent.change(screen.getByLabelText("Gallery"), { target: { files: [new File(["image"], "new.png", { type: "image/png" })] } });
    await waitFor(() => expect(changed).toHaveBeenCalledWith(["/api/assets/images/original.png", "/api/media/image/content"]));
    expect(screen.getByAltText("Gallery 2").getAttribute("src")).toMatch(/^blob:/);
  });
  it("previews the selected file before upload finishes and releases it on unmount", async () => {
    const changed = vi.fn();
    const previewChanged = vi.fn();
    let finish!: (media: Awaited<ReturnType<typeof uploadMedia>>) => void;
    vi.mocked(uploadMedia).mockReturnValueOnce(new Promise(resolve => { finish = resolve; }));
    const view = render(<FieldInput visualMedia field={{ name: "coverImageUrl", label: "Cover", type: "image", accept: ["png"], maxMb: 5 }} values={{}} value="" onChange={changed} onPreviewChange={previewChanged} />);
    fireEvent.change(screen.getByLabelText("Cover"), { target: { files: [new File(["image"], "cover.png", { type: "image/png" })] } });
    const preview = screen.getByAltText("Cover 1").getAttribute("src");
    expect(preview).toMatch(/^blob:/);
    expect(previewChanged).toHaveBeenCalledWith(preview);
    expect(changed).not.toHaveBeenCalled();
    finish({ id: "image", url: "/api/media/image/content", fileName: "cover.png", mimeType: "image/png", size: 5, createdAt: "", updatedAt: "" });
    await waitFor(() => expect(changed).toHaveBeenCalledWith("/api/media/image/content", expect.any(Object)));
    view.unmount();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith(preview);
  });
  it("restores the stored image when an upload fails", async () => {
    vi.mocked(uploadMedia).mockRejectedValueOnce(new Error("Upload failed"));
    const previewChanged = vi.fn();
    const changed = vi.fn();
    render(<FieldInput visualMedia field={{ name: "coverImageUrl", label: "Cover", type: "image", accept: ["png"], maxMb: 5 }} values={{}} value="/api/assets/images/original.png" onChange={changed} onPreviewChange={previewChanged} />);
    fireEvent.change(screen.getByLabelText("Cover"), { target: { files: [new File(["image"], "cover.png", { type: "image/png" })] } });
    await screen.findByText(/Upload failed/);
    expect(screen.getByAltText("Cover 1")).toHaveAttribute("src", "https://api.example.com/api/assets/images/original.png");
    expect(previewChanged).toHaveBeenLastCalledWith("");
    expect(changed).not.toHaveBeenCalled();
  });
});
