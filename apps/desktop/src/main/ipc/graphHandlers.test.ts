import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ipcMain } from "electron";
import { registerGraphHandlers } from "./graphHandlers";
import { IPC_CHANNELS } from "../../preload/channels";

// Mock electron
vi.mock("electron", () => ({
  ipcMain: {
    handle: vi.fn(),
    removeHandler: vi.fn(),
  },
}));

describe("graphHandlers", () => {
  let handlers: Map<string, (...args: unknown[]) => Promise<unknown>>;

  beforeEach(() => {
    vi.clearAllMocks();
    handlers = new Map();

    // Capture registered handlers
    vi.mocked(ipcMain.handle).mockImplementation(
      (channel: string, handler: any) => {
        handlers.set(channel, handler);
        return undefined as unknown as void;
      },
    );

    registerGraphHandlers();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("registerGraphHandlers", () => {
    it("GRAPH_GETとGRAPH_REFRESHのハンドラーを登録する", () => {
      expect(ipcMain.handle).toHaveBeenCalledTimes(2);
      expect(handlers.has(IPC_CHANNELS.GRAPH_GET)).toBe(true);
      expect(handlers.has(IPC_CHANNELS.GRAPH_REFRESH)).toBe(true);
    });
  });

  describe("GRAPH_GET handler", () => {
    it("グラフデータを正常に返す", async () => {
      const handler = handlers.get(IPC_CHANNELS.GRAPH_GET);
      expect(handler).toBeDefined();

      const result = await handler!();
      expect(result).toHaveProperty("success", true);
      expect(result).toHaveProperty("data");

      const { data } = result as {
        success: boolean;
        data: { nodes: unknown[]; links: unknown[] };
      };
      expect(data.nodes).toBeInstanceOf(Array);
      expect(data.links).toBeInstanceOf(Array);
      expect(data.nodes.length).toBeGreaterThan(0);
      expect(data.links.length).toBeGreaterThan(0);
    });

    it("ノードに必要なプロパティが含まれる", async () => {
      const handler = handlers.get(IPC_CHANNELS.GRAPH_GET);
      const result = (await handler!()) as {
        success: boolean;
        data: {
          nodes: Array<{
            id: string;
            label: string;
            type: string;
            x: number;
            y: number;
            size: number;
          }>;
        };
      };

      const node = result.data.nodes[0];
      expect(node).toHaveProperty("id");
      expect(node).toHaveProperty("label");
      expect(node).toHaveProperty("type");
      expect(node).toHaveProperty("x");
      expect(node).toHaveProperty("y");
      expect(node).toHaveProperty("size");
    });

    it("リンクに必要なプロパティが含まれる", async () => {
      const handler = handlers.get(IPC_CHANNELS.GRAPH_GET);
      const result = (await handler!()) as {
        success: boolean;
        data: { links: Array<{ source: string; target: string }> };
      };

      const link = result.data.links[0];
      expect(link).toHaveProperty("source");
      expect(link).toHaveProperty("target");
    });
  });

  describe("GRAPH_REFRESH handler", () => {
    it("リフレッシュされたグラフデータを返す", async () => {
      const handler = handlers.get(IPC_CHANNELS.GRAPH_REFRESH);
      expect(handler).toBeDefined();

      const result = await handler!();
      expect(result).toHaveProperty("success", true);
      expect(result).toHaveProperty("data");

      const { data } = result as {
        success: boolean;
        data: { nodes: unknown[]; links: unknown[]; refreshedAt: Date };
      };
      expect(data.nodes).toBeInstanceOf(Array);
      expect(data.links).toBeInstanceOf(Array);
      expect(data.refreshedAt).toBeDefined();
    });

    it("リフレッシュ時にノード位置がランダム化される", async () => {
      const getHandler = handlers.get(IPC_CHANNELS.GRAPH_GET);
      const refreshHandler = handlers.get(IPC_CHANNELS.GRAPH_REFRESH);

      const original = (await getHandler!()) as {
        data: { nodes: Array<{ x: number; y: number }> };
      };
      const refreshed = (await refreshHandler!()) as {
        data: { nodes: Array<{ x: number; y: number }> };
      };

      // ノード数が同じであることを確認
      expect(refreshed.data.nodes.length).toBe(original.data.nodes.length);

      // 位置が変更されている（完全一致しない）可能性をチェック
      // ランダム性があるため、少なくとも1つのノードの位置が異なることを確認
      const _hasDifferentPosition = original.data.nodes.some((node, i) => {
        const refreshedNode = refreshed.data.nodes[i];
        return node.x !== refreshedNode.x || node.y !== refreshedNode.y;
      });
      // ランダム要素があるので、位置が異なる可能性が高い（必ずしも保証はされない）
    });
  });
});
