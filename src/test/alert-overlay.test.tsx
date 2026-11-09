import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { gsap } from "gsap";
import { AlertOverlay } from "@/components/AlertOverlay";
import { notify } from "@/lib/notifications";

const player = vi.hoisted(() => ({ loadAnimation: vi.fn(), destroy: vi.fn(), stop: vi.fn() }));
vi.mock("@/lib/lottie-player", () => ({
  loadLottiePlayer: () => Promise.resolve({ loadAnimation: player.loadAnimation }),
}));

beforeEach(() => {
  notify.dismiss();
  player.loadAnimation.mockReset().mockImplementation(() => ({
    totalFrames: 50,
    goToAndStop: player.stop,
    destroy: player.destroy,
    addEventListener: (event: string, callback: () => void) => {
      if (event === "DOMLoaded") callback();
    },
  }));
  player.destroy.mockClear();
  player.stop.mockClear();
});
afterEach(() => {
  act(() => notify.dismiss());
  cleanup();
  vi.restoreAllMocks();
});

describe("Alert overlay", () => {
  it("uses the supplied success/error animations, queues messages and closes with GSAP", async () => {
    const enter = vi.spyOn(gsap, "fromTo");
    const { container } = render(<AlertOverlay />);
    act(() => {
      notify.success("Saved", { duration: Infinity });
      notify.error("Failed");
    });
    const success = await screen.findByRole("dialog", { name: "ສຳເລັດ" });
    expect(success).toHaveAttribute("data-alert-kind", "success");
    expect(container.querySelector("[data-sonner-toaster]")).toBeNull();
    await waitFor(() =>
      expect(player.loadAnimation).toHaveBeenCalledWith(
        expect.objectContaining({ path: expect.stringContaining("check.json"), loop: false }),
      ),
    );
    expect(enter).toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "ຕົກລົງ" }));
    const error = await screen.findByRole("alertdialog", { name: "ບໍ່ສຳເລັດ" });
    expect(error).toHaveTextContent("Failed");
    await waitFor(() =>
      expect(player.loadAnimation).toHaveBeenLastCalledWith(
        expect.objectContaining({ path: expect.stringContaining("VMC-EQUIS.json") }),
      ),
    );
    fireEvent.keyDown(error, { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument());
    expect(player.destroy).toHaveBeenCalledTimes(2);
  });

  it("shows the final animation frame with reduced motion and cleans up on unmount", async () => {
    vi.spyOn(window, "matchMedia").mockImplementation((query) => ({
      matches: query.includes("reduce"),
      media: query,
      onchange: null,
      addListener() {},
      removeListener() {},
      addEventListener() {},
      removeEventListener() {},
      dispatchEvent: () => true,
    }));
    const { unmount } = render(<AlertOverlay />);
    act(() => {
      notify.error("Offline");
    });
    expect(await screen.findByRole("alertdialog")).toHaveTextContent("Offline");
    await waitFor(() => expect(player.stop).toHaveBeenCalledWith(49, true));
    unmount();
    expect(player.destroy).toHaveBeenCalledOnce();
  });
});
