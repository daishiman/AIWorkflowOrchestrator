import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Stats } from "node:fs";
import { ipcMain } from "electron";

// Mock electron modules
vi.mock("electron", () => ({
  ipcMain: {
    handle: vi.fn(),
  },
  app: {
    getPath: vi.fn((name: string) => {
      const paths: Record<string, string> = {
        documents: "/Users/test/Documents",
        userData: "/Users/test/Library/Application Support",
        home: "/Users/test",
      };
      return paths[name] || "";
    }),
  },
}));

// Mock fs/promises
vi.mock("fs/promises", () => ({
  readdir: vi.fn(),
  readFile: vi.fn(),
  writeFile: vi.fn(),
  stat: vi.fn(),
  access: vi.fn(),
  rename: vi.fn(),
}));

import { registerFileHandlers } from "./fileHandlers";
import * as fs from "fs/promises";
import { IPC_CHANNELS } from "../../preload/channels";

describe("fileHandlers", () => {
  let handlers: Map<string, (...args: unknown[]) => Promise<unknown>>;

  beforeEach(() => {
    vi.clearAllMocks();
    handlers = new Map();

    // Capture registered handlers
    (ipcMain.handle as ReturnType<typeof vi.fn>).mockImplementation(
      (channel: string, handler: (...args: unknown[]) => Promise<unknown>) => {
        handlers.set(channel, handler);
      },
    );

    registerFileHandlers();
  });

  describe("registerFileHandlers", () => {
    it("FILE_GET_TREEハンドラーを登録する", () => {
      expect(handlers.has(IPC_CHANNELS.FILE_GET_TREE)).toBe(true);
    });

    it("FILE_READハンドラーを登録する", () => {
      expect(handlers.has(IPC_CHANNELS.FILE_READ)).toBe(true);
    });

    it("FILE_WRITEハンドラーを登録する", () => {
      expect(handlers.has(IPC_CHANNELS.FILE_WRITE)).toBe(true);
    });
  });

  describe("FILE_GET_TREE handler", () => {
    it("許可されたパスでファイルツリーを取得する", async () => {
      const handler = handlers.get(IPC_CHANNELS.FILE_GET_TREE)!;

      (fs.readdir as ReturnType<typeof vi.fn>).mockResolvedValue([
        { name: "file.ts", isDirectory: () => false },
        { name: "folder", isDirectory: () => true },
      ]);

      const result = await handler(
        {},
        {
          rootPath: "/Users/test/Documents/project",
          depth: 1,
        },
      );

      expect(result).toEqual({
        success: true,
        data: expect.any(Array),
      });
    });

    it("許可されていないパスでエラーを返す", async () => {
      const handler = handlers.get(IPC_CHANNELS.FILE_GET_TREE)!;

      const result = await handler(
        {},
        {
          rootPath: "/etc/passwd",
          depth: 1,
        },
      );

      expect(result).toEqual({
        success: false,
        error: "Validation error: Access denied: path is not allowed",
      });
    });

    it("隠しファイルとnode_modulesをスキップする", async () => {
      const handler = handlers.get(IPC_CHANNELS.FILE_GET_TREE)!;

      (fs.readdir as ReturnType<typeof vi.fn>).mockResolvedValue([
        { name: ".hidden", isDirectory: () => false },
        { name: "node_modules", isDirectory: () => true },
        { name: "src", isDirectory: () => true },
      ]);

      const result = (await handler(
        {},
        {
          rootPath: "/Users/test/Documents/project",
          depth: 1,
        },
      )) as { success: boolean; data: { name: string }[] };

      expect(result.success).toBe(true);
      // 隠しファイルとnode_modulesは除外される
      expect(result.data.find((n) => n.name === ".hidden")).toBeUndefined();
      expect(
        result.data.find((n) => n.name === "node_modules"),
      ).toBeUndefined();
    });

    it("エラー時にエラーレスポンスを返す", async () => {
      const handler = handlers.get(IPC_CHANNELS.FILE_GET_TREE)!;

      vi.mocked(fs.readdir).mockRejectedValue(new Error("Permission denied"));

      const result = await handler(
        {},
        {
          rootPath: "/Users/test/Documents/project",
          depth: 1,
        },
      );

      expect(result).toEqual({
        success: false,
        error: "Permission denied",
      });
    });
  });

  describe("FILE_READ handler", () => {
    it("許可されたパスでファイルを読み取る", async () => {
      const handler = handlers.get(IPC_CHANNELS.FILE_READ)!;

      vi.mocked(fs.readFile).mockResolvedValue("file content");
      vi.mocked(fs.stat).mockResolvedValue({
        size: 12,
        mtime: new Date("2024-01-15T10:00:00"),
      } as Stats);

      const result = await handler(
        {},
        {
          filePath: "/Users/test/Documents/file.ts",
        },
      );

      expect(result).toEqual({
        success: true,
        data: {
          content: "file content",
          metadata: {
            size: 12,
            lastModified: expect.any(Date),
            encoding: "utf-8",
          },
        },
      });
    });

    it("許可されていないパスでエラーを返す", async () => {
      const handler = handlers.get(IPC_CHANNELS.FILE_READ)!;

      const result = await handler(
        {},
        {
          filePath: "/etc/passwd",
        },
      );

      expect(result).toEqual({
        success: false,
        error: "Validation error: Access denied: path is not allowed",
      });
    });

    it("カスタムエンコーディングを使用する", async () => {
      const handler = handlers.get(IPC_CHANNELS.FILE_READ)!;

      vi.mocked(fs.readFile).mockResolvedValue("file content");
      vi.mocked(fs.stat).mockResolvedValue({
        size: 12,
        mtime: new Date(),
      } as Stats);

      const result = (await handler(
        {},
        {
          filePath: "/Users/test/Documents/file.ts",
          encoding: "latin1",
        },
      )) as { success: boolean; data: { metadata: { encoding: string } } };

      expect(result.data.metadata.encoding).toBe("latin1");
    });

    it("エラー時にエラーレスポンスを返す", async () => {
      const handler = handlers.get(IPC_CHANNELS.FILE_READ)!;

      vi.mocked(fs.readFile).mockRejectedValue(new Error("File not found"));

      const result = await handler(
        {},
        {
          filePath: "/Users/test/Documents/file.ts",
        },
      );

      expect(result).toEqual({
        success: false,
        error: "File not found",
      });
    });
  });

  describe("FILE_WRITE handler", () => {
    it("許可されたパスでファイルを書き込む", async () => {
      const handler = handlers.get(IPC_CHANNELS.FILE_WRITE)!;

      vi.mocked(fs.writeFile).mockResolvedValue(undefined);

      const result = await handler(
        {},
        {
          filePath: "/Users/test/Documents/file.ts",
          content: "new content",
        },
      );

      expect(result).toEqual({ success: true });
      expect(fs.writeFile).toHaveBeenCalledWith(
        "/Users/test/Documents/file.ts",
        "new content",
        { encoding: "utf-8" },
      );
    });

    it("許可されていないパスでエラーを返す", async () => {
      const handler = handlers.get(IPC_CHANNELS.FILE_WRITE)!;

      const result = await handler(
        {},
        {
          filePath: "/etc/passwd",
          content: "malicious content",
        },
      );

      expect(result).toEqual({
        success: false,
        error: "Validation error: Access denied: path is not allowed",
      });
      expect(fs.writeFile).not.toHaveBeenCalled();
    });

    it("カスタムエンコーディングを使用する", async () => {
      const handler = handlers.get(IPC_CHANNELS.FILE_WRITE)!;

      vi.mocked(fs.writeFile).mockResolvedValue(undefined);

      await handler(
        {},
        {
          filePath: "/Users/test/Documents/file.ts",
          content: "content",
          encoding: "latin1",
        },
      );

      expect(fs.writeFile).toHaveBeenCalledWith(
        "/Users/test/Documents/file.ts",
        "content",
        { encoding: "latin1" },
      );
    });

    it("エラー時にエラーレスポンスを返す", async () => {
      const handler = handlers.get(IPC_CHANNELS.FILE_WRITE)!;

      vi.mocked(fs.writeFile).mockRejectedValue(new Error("Disk full"));

      const result = await handler(
        {},
        {
          filePath: "/Users/test/Documents/file.ts",
          content: "content",
        },
      );

      expect(result).toEqual({
        success: false,
        error: "Disk full",
      });
    });
  });

  describe("FILE_RENAME handler", () => {
    it("FILE_RENAMEハンドラーを登録する", () => {
      expect(handlers.has(IPC_CHANNELS.FILE_RENAME)).toBe(true);
    });

    it("許可されたパスでファイルをリネームする", async () => {
      const handler = handlers.get(IPC_CHANNELS.FILE_RENAME)!;

      // ファイルが存在する
      vi.mocked(fs.access).mockResolvedValueOnce(undefined);
      // 新しいパスにはファイルが存在しない
      vi.mocked(fs.access).mockRejectedValueOnce(new Error("ENOENT"));
      vi.mocked(fs.rename).mockResolvedValue(undefined);

      const result = await handler(
        {},
        {
          oldPath: "/Users/test/Documents/oldfile.ts",
          newPath: "/Users/test/Documents/newfile.ts",
        },
      );

      expect(result).toEqual({
        success: true,
        data: {
          oldPath: "/Users/test/Documents/oldfile.ts",
          newPath: "/Users/test/Documents/newfile.ts",
        },
      });
      expect(fs.rename).toHaveBeenCalledWith(
        "/Users/test/Documents/oldfile.ts",
        "/Users/test/Documents/newfile.ts",
      );
    });

    it("許可されていないパス（oldPath）でエラーを返す", async () => {
      const handler = handlers.get(IPC_CHANNELS.FILE_RENAME)!;

      const result = await handler(
        {},
        {
          oldPath: "/etc/passwd",
          newPath: "/Users/test/Documents/newfile.ts",
        },
      );

      expect(result).toEqual({
        success: false,
        error: "Validation error: Access denied: path is not allowed",
      });
      expect(fs.rename).not.toHaveBeenCalled();
    });

    it("許可されていないパス（newPath）でエラーを返す", async () => {
      const handler = handlers.get(IPC_CHANNELS.FILE_RENAME)!;

      const result = await handler(
        {},
        {
          oldPath: "/Users/test/Documents/oldfile.ts",
          newPath: "/etc/newfile.ts",
        },
      );

      expect(result).toEqual({
        success: false,
        error: "Validation error: Access denied: path is not allowed",
      });
      expect(fs.rename).not.toHaveBeenCalled();
    });

    it("元のファイルが存在しない場合エラーを返す", async () => {
      const handler = handlers.get(IPC_CHANNELS.FILE_RENAME)!;

      // ファイルが存在しない
      vi.mocked(fs.access).mockRejectedValueOnce(new Error("ENOENT"));

      const result = await handler(
        {},
        {
          oldPath: "/Users/test/Documents/nonexistent.ts",
          newPath: "/Users/test/Documents/newfile.ts",
        },
      );

      expect(result).toEqual({
        success: false,
        error:
          "File or folder does not exist: /Users/test/Documents/nonexistent.ts",
      });
      expect(fs.rename).not.toHaveBeenCalled();
    });

    it("新しいパスにファイルが既に存在する場合エラーを返す", async () => {
      const handler = handlers.get(IPC_CHANNELS.FILE_RENAME)!;

      // 元ファイルが存在する
      vi.mocked(fs.access).mockResolvedValueOnce(undefined);
      // 新しいパスにもファイルが存在する
      vi.mocked(fs.access).mockResolvedValueOnce(undefined);

      const result = await handler(
        {},
        {
          oldPath: "/Users/test/Documents/oldfile.ts",
          newPath: "/Users/test/Documents/existingfile.ts",
        },
      );

      expect(result).toEqual({
        success: false,
        error:
          "A file or folder already exists at: /Users/test/Documents/existingfile.ts",
      });
      expect(fs.rename).not.toHaveBeenCalled();
    });

    it("リネーム操作が失敗した場合エラーを返す", async () => {
      const handler = handlers.get(IPC_CHANNELS.FILE_RENAME)!;

      // ファイルが存在する
      vi.mocked(fs.access).mockResolvedValueOnce(undefined);
      // 新しいパスにはファイルが存在しない
      vi.mocked(fs.access).mockRejectedValueOnce(new Error("ENOENT"));
      // リネーム操作が失敗
      vi.mocked(fs.rename).mockRejectedValue(new Error("Permission denied"));

      const result = await handler(
        {},
        {
          oldPath: "/Users/test/Documents/oldfile.ts",
          newPath: "/Users/test/Documents/newfile.ts",
        },
      );

      expect(result).toEqual({
        success: false,
        error: "Permission denied",
      });
    });

    it("フォルダのリネームができる", async () => {
      const handler = handlers.get(IPC_CHANNELS.FILE_RENAME)!;

      // フォルダが存在する
      vi.mocked(fs.access).mockResolvedValueOnce(undefined);
      // 新しいパスには存在しない
      vi.mocked(fs.access).mockRejectedValueOnce(new Error("ENOENT"));
      vi.mocked(fs.rename).mockResolvedValue(undefined);

      const result = await handler(
        {},
        {
          oldPath: "/Users/test/Documents/oldfolder",
          newPath: "/Users/test/Documents/newfolder",
        },
      );

      expect(result).toEqual({
        success: true,
        data: {
          oldPath: "/Users/test/Documents/oldfolder",
          newPath: "/Users/test/Documents/newfolder",
        },
      });
    });

    it("異なる親ディレクトリへの移動ができる", async () => {
      const handler = handlers.get(IPC_CHANNELS.FILE_RENAME)!;

      // ファイルが存在する
      vi.mocked(fs.access).mockResolvedValueOnce(undefined);
      // 新しいパスには存在しない
      vi.mocked(fs.access).mockRejectedValueOnce(new Error("ENOENT"));
      vi.mocked(fs.rename).mockResolvedValue(undefined);

      const result = await handler(
        {},
        {
          oldPath: "/Users/test/Documents/folder1/file.ts",
          newPath: "/Users/test/Documents/folder2/file.ts",
        },
      );

      expect(result).toEqual({
        success: true,
        data: {
          oldPath: "/Users/test/Documents/folder1/file.ts",
          newPath: "/Users/test/Documents/folder2/file.ts",
        },
      });
    });
  });
});
