import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

let previewId = 0;
URL.createObjectURL = vi.fn(() => `blob:test-preview-${++previewId}`);
URL.revokeObjectURL = vi.fn();

Object.defineProperty(window, "scrollTo", {
  writable: true,
  value: () => {},
});

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});
