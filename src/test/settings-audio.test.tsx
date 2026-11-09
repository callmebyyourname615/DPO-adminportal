import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SettingsPage } from "@/routes/settings";

const { get, update, list, upload, success, error } = vi.hoisted(() => ({ get: vi.fn(), update: vi.fn(), list: vi.fn(), upload: vi.fn(), success: vi.fn(), error: vi.fn() }));
vi.mock("@tanstack/react-router", () => ({ createFileRoute: () => (options: unknown) => options, Link: ({ children, to }: any) => <a href={to}>{children}</a> }));
vi.mock("@/lib/api/client", () => ({ canUseData: () => true, getApiBaseUrl: () => "http://localhost:3000", ApiNotConnectedError: class extends Error {} }));
vi.mock("@/lib/api/services", () => ({ settingsService: { get, update }, audioOptionsService: { list }, uploadMedia: upload }));
vi.mock("@/lib/notifications", () => ({ notify: { success, error } }));

const old1 = { url: "/api/assets/dpo/old1.mp3", fileName: "old1.mp3" };
const old2 = { url: "/api/assets/dpo/old2.mp3", fileName: "old2.mp3" };
const saved = { email: "info@example.com", phone: "12345678", address: "Vientiane", footerAudioUrl: old1.url, footerAudioUrl2: old2.url };
const newSound = { url: "http://localhost:3000/api/media/new/content", fileName: "new.mp3", mimeType: "audio/mpeg", size: 10, id: "new" };
function mount() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={client}><SettingsPage /></QueryClientProvider>);
}
describe("settings audio selection", () => {
  beforeEach(() => { vi.clearAllMocks(); get.mockResolvedValue(saved); list.mockResolvedValue([old1, old2]); update.mockImplementation(async data => data); });
  it("previews existing sounds and saves another selection without removing either sound", async () => {
    const view = mount();
    const first = await screen.findByLabelText("ໄຟລ໌ສຽງ 1");
    await waitFor(() => expect(first).toBeEnabled());
    expect(first).toHaveValue(old1.url);
    expect(screen.getByLabelText("ໄຟລ໌ສຽງ 2")).toHaveValue(old2.url);
    expect(view.container.querySelector("audio")).toHaveAttribute("src", `http://localhost:3000${old1.url}`);
    fireEvent.change(first, { target: { value: old2.url } });
    fireEvent.click(screen.getByRole("button", { name: "ບັນທຶກ" }));
    await waitFor(() => expect(update).toHaveBeenCalledWith(expect.objectContaining({ footerAudioUrl: old2.url, footerAudioUrl2: old2.url })));
    expect(within(first).getByRole("option", { name: old1.fileName })).toBeInTheDocument();
    expect(within(first).getByRole("option", { name: old2.fileName })).toBeInTheDocument();
    expect(upload).not.toHaveBeenCalled();
  });
  it("blocks saving during upload, adds the new sound, and keeps the old options", async () => {
    let finish!: (result: unknown) => void;
    upload.mockReturnValueOnce(new Promise(resolve => { finish = resolve; }));
    mount();
    const first = await screen.findByLabelText("ໄຟລ໌ສຽງ 1");
    await waitFor(() => expect(first).toBeEnabled());
    fireEvent.change(screen.getByLabelText("Browse ໄຟລ໌ສຽງ 1"), { target: { files: [new File(["ID3-test"], "new.mp3", { type: "audio/mpeg" })] } });
    await waitFor(() => expect(screen.getByRole("button", { name: "ບັນທຶກ" })).toBeDisabled());
    expect(first).toHaveValue(old1.url);
    list.mockResolvedValue([newSound, old1, old2]);
    finish(newSound);
    await waitFor(() => expect(first).toHaveValue(newSound.url));
    expect(within(first).getByRole("option", { name: old1.fileName })).toBeInTheDocument();
    expect(within(first).getByRole("option", { name: old2.fileName })).toBeInTheDocument();
    expect(update).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "ບັນທຶກ" }));
    await waitFor(() => expect(update).toHaveBeenCalledWith(expect.objectContaining({ footerAudioUrl: newSound.url, footerAudioUrl2: old2.url })));
  });
  it("preserves the selected sound after invalid files or upload failure", async () => {
    upload.mockRejectedValueOnce(new Error("Connection failed"));
    mount();
    const first = await screen.findByLabelText("ໄຟລ໌ສຽງ 1");
    await waitFor(() => expect(first).toBeEnabled());
    const picker = screen.getByLabelText("Browse ໄຟລ໌ສຽງ 1");
    fireEvent.change(picker, { target: { files: [new File(["bad"], "bad.txt")] } });
    expect(upload).not.toHaveBeenCalled();
    expect(first).toHaveValue(old1.url);
    fireEvent.change(picker, { target: { files: [new File(["ID3-test"], "new.mp3", { type: "audio/mpeg" })] } });
    await waitFor(() => expect(error).toHaveBeenCalledWith(expect.stringContaining("Connection failed")));
    expect(first).toHaveValue(old1.url);
    expect(screen.getByRole("button", { name: "ບັນທຶກ" })).toBeEnabled();
    expect(update).not.toHaveBeenCalled();
  });
});
