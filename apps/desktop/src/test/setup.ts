import "@testing-library/jest-dom";
import { vi, beforeAll, afterEach, afterAll } from "vitest";
import { server } from "./mocks/server";

// MSWサーバー設定
beforeAll(() => server.listen({ onUnhandledRequest: "warn" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

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
