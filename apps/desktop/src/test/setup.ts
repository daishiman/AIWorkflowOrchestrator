import "@testing-library/jest-dom";
import { vi } from "vitest";

// グローバルモック
// Electronのモジュールをモック
vi.mock("electron", () => ({
  ipcRenderer: {
    invoke: vi.fn(),
    on: vi.fn(),
    removeListener: vi.fn(),
  },
  ipcMain: {
    handle: vi.fn(),
    on: vi.fn(),
  },
}));
