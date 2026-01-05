/**
 * ファイル選択IPCハンドラ テスト
 *
 * T-03-2: TDD Red Phase
 *
 * @see docs/30-workflows/file-selection/step04-ipc-design.md
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ipcMain, dialog, BrowserWindow, app } from "electron";
import * as fs from "fs/promises";
import {
  registerFileSelectionHandlers,
  resetRateLimiter,
} from "./fileSelectionHandlers";
import { IPC_CHANNELS } from "../../preload/channels";

// =============================================================================
// Mock: Electron
// =============================================================================

vi.mock("electron", () => ({
  ipcMain: {
    handle: vi.fn(),
    removeHandler: vi.fn(),
  },
  dialog: {
    showOpenDialog: vi.fn(),
  },
  BrowserWindow: {
    getFocusedWindow: vi.fn(),
  },
  app: {
    getPath: vi.fn(),
  },
}));

// =============================================================================
// Mock: Node.js modules
// =============================================================================

vi.mock("fs/promises", () => ({
  stat: vi.fn(),
  realpath: vi.fn(),
}));

vi.mock("uuid", () => ({
  v4: vi.fn(() => "test-uuid-1234-5678-abcd"),
}));

// =============================================================================
// Test Suite
// =============================================================================

describe("fileSelectionHandlers", () => {
  let handlers: Map<string, (...args: unknown[]) => Promise<unknown>>;
  let mockWindow: BrowserWindow;
  let mockEvent: { sender: { id: number; getURL: () => string } };

  beforeEach(() => {
    vi.clearAllMocks();
    handlers = new Map();

    // レート制限をリセット
    resetRateLimiter();

    // Mock BrowserWindow
    mockWindow = {
      webContents: { id: 1 },
    } as unknown as BrowserWindow;

    vi.mocked(BrowserWindow.getFocusedWindow).mockReturnValue(mockWindow);

    // Mock app.getPath for allowed directories
    vi.mocked(app.getPath).mockImplementation((name) => {
      const paths: Record<string, string> = {
        home: "/Users/test",
        documents: "/Users/test/Documents",
        downloads: "/Users/test/Downloads",
        pictures: "/Users/test/Pictures",
        music: "/Users/test/Music",
        videos: "/Users/test/Videos",
        desktop: "/Users/test/Desktop",
        logs: "/Users/test/Library/Logs",
      };
      return paths[name] || `/Users/test/${name}`;
    });

    // Mock IPC event
    mockEvent = {
      sender: {
        id: 1,
        getURL: () => "file:///app/index.html",
      },
    };

    // Capture registered handlers
    vi.mocked(ipcMain.handle).mockImplementation(
      (channel: string, handler: any) => {
        handlers.set(channel, handler);
        return undefined as unknown as void;
      },
    );

    registerFileSelectionHandlers();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // ===========================================================================
  // Handler Registration Tests
  // ===========================================================================

  describe("registerFileSelectionHandlers", () => {
    it("すべてのファイル選択チャネルのハンドラを登録する", () => {
      expect(ipcMain.handle).toHaveBeenCalledTimes(4);
      expect(handlers.has(IPC_CHANNELS.FILE_SELECTION_OPEN_DIALOG)).toBe(true);
      expect(handlers.has(IPC_CHANNELS.FILE_SELECTION_GET_METADATA)).toBe(true);
      expect(
        handlers.has(IPC_CHANNELS.FILE_SELECTION_GET_MULTIPLE_METADATA),
      ).toBe(true);
      expect(handlers.has(IPC_CHANNELS.FILE_SELECTION_VALIDATE_PATH)).toBe(
        true,
      );
    });
  });

  // ===========================================================================
  // FILE_SELECTION_OPEN_DIALOG Tests
  // ===========================================================================

  describe("FILE_SELECTION_OPEN_DIALOG handler", () => {
    describe("正常系", () => {
      it("ファイル選択ダイアログを表示し、選択結果を返す", async () => {
        vi.mocked(dialog.showOpenDialog).mockResolvedValue({
          canceled: false,
          filePaths: ["/Users/test/Documents/file.pdf"],
        });

        const handler = handlers.get(IPC_CHANNELS.FILE_SELECTION_OPEN_DIALOG);
        const result = await handler!(mockEvent, {
          title: "ファイルを選択",
          multiSelections: false,
        });

        expect(dialog.showOpenDialog).toHaveBeenCalledWith(
          mockWindow,
          expect.objectContaining({
            title: "ファイルを選択",
            properties: ["openFile"],
          }),
        );
        expect(result).toEqual({
          success: true,
          data: {
            canceled: false,
            filePaths: ["/Users/test/Documents/file.pdf"],
          },
        });
      });

      it("複数選択が有効な場合、multiSelectionsプロパティを追加する", async () => {
        vi.mocked(dialog.showOpenDialog).mockResolvedValue({
          canceled: false,
          filePaths: [
            "/Users/test/Documents/file1.pdf",
            "/Users/test/Documents/file2.pdf",
          ],
        });

        const handler = handlers.get(IPC_CHANNELS.FILE_SELECTION_OPEN_DIALOG);
        await handler!(mockEvent, {
          multiSelections: true,
        });

        expect(dialog.showOpenDialog).toHaveBeenCalledWith(
          mockWindow,
          expect.objectContaining({
            properties: ["openFile", "multiSelections"],
          }),
        );
      });

      it("filterCategoryを指定すると対応するフィルターが適用される", async () => {
        vi.mocked(dialog.showOpenDialog).mockResolvedValue({
          canceled: false,
          filePaths: [],
        });

        const handler = handlers.get(IPC_CHANNELS.FILE_SELECTION_OPEN_DIALOG);
        await handler!(mockEvent, {
          filterCategory: "office",
        });

        expect(dialog.showOpenDialog).toHaveBeenCalledWith(
          mockWindow,
          expect.objectContaining({
            filters: expect.arrayContaining([
              expect.objectContaining({
                name: expect.any(String),
                extensions: expect.arrayContaining(["pdf", "doc", "docx"]),
              }),
            ]),
          }),
        );
      });

      it("customFiltersはfilterCategoryより優先される", async () => {
        vi.mocked(dialog.showOpenDialog).mockResolvedValue({
          canceled: false,
          filePaths: [],
        });

        const customFilters = [{ name: "Custom", extensions: ["xyz"] }];
        const handler = handlers.get(IPC_CHANNELS.FILE_SELECTION_OPEN_DIALOG);
        await handler!(mockEvent, {
          filterCategory: "office",
          customFilters,
        });

        expect(dialog.showOpenDialog).toHaveBeenCalledWith(
          mockWindow,
          expect.objectContaining({
            filters: customFilters,
          }),
        );
      });

      it("defaultPathが指定された場合、ダイアログに渡される", async () => {
        vi.mocked(dialog.showOpenDialog).mockResolvedValue({
          canceled: false,
          filePaths: [],
        });

        const handler = handlers.get(IPC_CHANNELS.FILE_SELECTION_OPEN_DIALOG);
        await handler!(mockEvent, {
          defaultPath: "/Users/test/Documents",
        });

        expect(dialog.showOpenDialog).toHaveBeenCalledWith(
          mockWindow,
          expect.objectContaining({
            defaultPath: "/Users/test/Documents",
          }),
        );
      });
    });

    describe("キャンセル", () => {
      it("ユーザーがキャンセルした場合、canceled: trueを返す", async () => {
        vi.mocked(dialog.showOpenDialog).mockResolvedValue({
          canceled: true,
          filePaths: [],
        });

        const handler = handlers.get(IPC_CHANNELS.FILE_SELECTION_OPEN_DIALOG);
        const result = await handler!(mockEvent, {});

        expect(result).toEqual({
          success: true,
          data: {
            canceled: true,
            filePaths: [],
          },
        });
      });
    });

    describe("エラー系", () => {
      it("dialogがエラーをスローした場合、success: falseを返す", async () => {
        vi.mocked(dialog.showOpenDialog).mockRejectedValue(
          new Error("Dialog error"),
        );

        const handler = handlers.get(IPC_CHANNELS.FILE_SELECTION_OPEN_DIALOG);
        const result = await handler!(mockEvent, {});

        expect(result).toEqual({
          success: false,
          error: "Dialog error",
        });
      });

      it("バリデーションエラー時、success: falseを返す", async () => {
        const handler = handlers.get(IPC_CHANNELS.FILE_SELECTION_OPEN_DIALOG);
        const result = await handler!(mockEvent, {
          filterCategory: "invalid_category" as any,
        });

        expect(result).toEqual({
          success: false,
          error: expect.stringContaining("バリデーション"),
        });
      });

      it("defaultPathにパストラバーサルが含まれる場合、拒否する", async () => {
        const handler = handlers.get(IPC_CHANNELS.FILE_SELECTION_OPEN_DIALOG);
        const result = await handler!(mockEvent, {
          defaultPath: "/Users/test/../../../etc/passwd",
        });

        expect(result).toEqual({
          success: false,
          error: expect.stringMatching(/パス|トラバーサル|不正/),
        });
      });
    });
  });

  // ===========================================================================
  // FILE_SELECTION_GET_METADATA Tests
  // ===========================================================================

  describe("FILE_SELECTION_GET_METADATA handler", () => {
    const validFilePath = "/Users/test/Documents/test.pdf";

    describe("正常系", () => {
      it("ファイルのメタ情報を返す", async () => {
        const mockStats = {
          size: 1024,
          mtime: new Date("2025-01-01T00:00:00Z"),
          isFile: () => true,
          isDirectory: () => false,
        };
        vi.mocked(fs.stat).mockResolvedValue(mockStats as any);
        vi.mocked(fs.realpath).mockResolvedValue(validFilePath);

        const handler = handlers.get(IPC_CHANNELS.FILE_SELECTION_GET_METADATA);
        const result = await handler!(mockEvent, { filePath: validFilePath });

        expect(result).toEqual({
          success: true,
          data: {
            id: "test-uuid-1234-5678-abcd",
            path: validFilePath,
            name: "test.pdf",
            extension: ".pdf",
            size: 1024,
            mimeType: "application/pdf",
            lastModified: "2025-01-01T00:00:00.000Z",
            createdAt: expect.any(String),
          },
        });
      });

      it("未知の拡張子の場合、application/octet-streamを返す", async () => {
        const unknownFilePath = "/Users/test/Documents/file.xyz";
        const mockStats = {
          size: 512,
          mtime: new Date("2025-01-01T00:00:00Z"),
          isFile: () => true,
          isDirectory: () => false,
        };
        vi.mocked(fs.stat).mockResolvedValue(mockStats as any);
        vi.mocked(fs.realpath).mockResolvedValue(unknownFilePath);

        const handler = handlers.get(IPC_CHANNELS.FILE_SELECTION_GET_METADATA);
        const result = await handler!(mockEvent, {
          filePath: unknownFilePath,
        });

        expect(result).toEqual(
          expect.objectContaining({
            success: true,
            data: expect.objectContaining({
              mimeType: "application/octet-stream",
            }),
          }),
        );
      });
    });

    describe("エラー系", () => {
      it("ファイルが存在しない場合、エラーを返す", async () => {
        vi.mocked(fs.stat).mockRejectedValue(
          Object.assign(new Error("ENOENT"), { code: "ENOENT" }),
        );
        vi.mocked(fs.realpath).mockRejectedValue(
          Object.assign(new Error("ENOENT"), { code: "ENOENT" }),
        );

        const handler = handlers.get(IPC_CHANNELS.FILE_SELECTION_GET_METADATA);
        const result = await handler!(mockEvent, { filePath: validFilePath });

        expect(result).toEqual({
          success: false,
          error: expect.stringContaining(""),
        });
      });

      it("パストラバーサルを含むパスは拒否する", async () => {
        const handler = handlers.get(IPC_CHANNELS.FILE_SELECTION_GET_METADATA);
        const result = await handler!(mockEvent, {
          filePath: "/Users/test/../../../etc/passwd",
        });

        expect(result).toEqual({
          success: false,
          error: expect.stringMatching(/パス|トラバーサル|不正/),
        });
      });

      it("許可されていないディレクトリのファイルは拒否する", async () => {
        vi.mocked(fs.realpath).mockResolvedValue("/etc/passwd");

        const handler = handlers.get(IPC_CHANNELS.FILE_SELECTION_GET_METADATA);
        const result = await handler!(mockEvent, { filePath: "/etc/passwd" });

        expect(result).toEqual({
          success: false,
          error: expect.stringMatching(/許可|ディレクトリ|アクセス/),
        });
      });

      it("空のパスはバリデーションエラーになる", async () => {
        const handler = handlers.get(IPC_CHANNELS.FILE_SELECTION_GET_METADATA);
        const result = await handler!(mockEvent, { filePath: "" });

        expect(result).toEqual({
          success: false,
          error: expect.any(String),
        });
      });
    });
  });

  // ===========================================================================
  // FILE_SELECTION_GET_MULTIPLE_METADATA Tests
  // ===========================================================================

  describe("FILE_SELECTION_GET_MULTIPLE_METADATA handler", () => {
    const validFilePaths = [
      "/Users/test/Documents/file1.pdf",
      "/Users/test/Documents/file2.docx",
    ];

    describe("正常系", () => {
      it("複数ファイルのメタ情報を並列で取得する", async () => {
        const mockStats = {
          size: 1024,
          mtime: new Date("2025-01-01T00:00:00Z"),
          isFile: () => true,
          isDirectory: () => false,
        };
        vi.mocked(fs.stat).mockResolvedValue(mockStats as any);
        vi.mocked(fs.realpath).mockImplementation((p) =>
          Promise.resolve(p as string),
        );

        const handler = handlers.get(
          IPC_CHANNELS.FILE_SELECTION_GET_MULTIPLE_METADATA,
        );
        const result = await handler!(mockEvent, { filePaths: validFilePaths });

        expect(result).toEqual({
          success: true,
          data: {
            files: expect.arrayContaining([
              expect.objectContaining({ name: "file1.pdf" }),
              expect.objectContaining({ name: "file2.docx" }),
            ]),
            errors: [],
          },
        });
      });

      it("一部のファイルが失敗しても、成功したファイルの情報は返す", async () => {
        const mockStats = {
          size: 1024,
          mtime: new Date("2025-01-01T00:00:00Z"),
          isFile: () => true,
          isDirectory: () => false,
        };
        vi.mocked(fs.stat)
          .mockResolvedValueOnce(mockStats as any)
          .mockRejectedValueOnce(
            Object.assign(new Error("ENOENT"), { code: "ENOENT" }),
          );
        vi.mocked(fs.realpath).mockImplementation((p) =>
          Promise.resolve(p as string),
        );

        const handler = handlers.get(
          IPC_CHANNELS.FILE_SELECTION_GET_MULTIPLE_METADATA,
        );
        const result = await handler!(mockEvent, { filePaths: validFilePaths });

        expect(result).toEqual({
          success: true,
          data: {
            files: expect.arrayContaining([
              expect.objectContaining({ name: "file1.pdf" }),
            ]),
            errors: expect.arrayContaining([
              expect.objectContaining({
                filePath: validFilePaths[1],
                error: expect.any(String),
              }),
            ]),
          },
        });
      });
    });

    describe("エラー系", () => {
      it("空の配列はバリデーションエラーになる", async () => {
        const handler = handlers.get(
          IPC_CHANNELS.FILE_SELECTION_GET_MULTIPLE_METADATA,
        );
        const result = await handler!(mockEvent, { filePaths: [] });

        expect(result).toEqual({
          success: false,
          error: expect.any(String),
        });
      });

      it("100件を超えるファイルパスは拒否する", async () => {
        const tooManyPaths = Array.from(
          { length: 101 },
          (_, i) => `/Users/test/Documents/file${i}.pdf`,
        );

        const handler = handlers.get(
          IPC_CHANNELS.FILE_SELECTION_GET_MULTIPLE_METADATA,
        );
        const result = await handler!(mockEvent, { filePaths: tooManyPaths });

        expect(result).toEqual({
          success: false,
          error: expect.stringMatching(/100|件|超/),
        });
      });

      it("パストラバーサルを含むパスがある場合、そのファイルはエラーになる", async () => {
        const mockStats = {
          size: 1024,
          mtime: new Date("2025-01-01T00:00:00Z"),
          isFile: () => true,
          isDirectory: () => false,
        };
        vi.mocked(fs.stat).mockResolvedValue(mockStats as any);
        vi.mocked(fs.realpath).mockImplementation((p) =>
          Promise.resolve(p as string),
        );

        const pathsWithTraversal = [
          "/Users/test/Documents/valid.pdf",
          "/Users/test/../../../etc/passwd",
        ];

        const handler = handlers.get(
          IPC_CHANNELS.FILE_SELECTION_GET_MULTIPLE_METADATA,
        );
        const result = await handler!(mockEvent, {
          filePaths: pathsWithTraversal,
        });

        expect(result).toEqual({
          success: true,
          data: {
            files: expect.arrayContaining([
              expect.objectContaining({ name: "valid.pdf" }),
            ]),
            errors: expect.arrayContaining([
              expect.objectContaining({
                filePath: pathsWithTraversal[1],
                error: expect.stringMatching(/パス|トラバーサル|不正/),
              }),
            ]),
          },
        });
      });
    });
  });

  // ===========================================================================
  // FILE_SELECTION_VALIDATE_PATH Tests
  // ===========================================================================

  describe("FILE_SELECTION_VALIDATE_PATH handler", () => {
    describe("正常系", () => {
      it("有効なファイルパスの場合、valid: trueを返す", async () => {
        const filePath = "/Users/test/Documents/test.pdf";
        vi.mocked(fs.stat).mockResolvedValue({
          isFile: () => true,
          isDirectory: () => false,
        } as any);
        vi.mocked(fs.realpath).mockResolvedValue(filePath);

        const handler = handlers.get(IPC_CHANNELS.FILE_SELECTION_VALIDATE_PATH);
        const result = await handler!(mockEvent, { filePath });

        expect(result).toEqual({
          success: true,
          data: {
            valid: true,
            exists: true,
            isFile: true,
            isDirectory: false,
          },
        });
      });

      it("ディレクトリパスの場合、isDirectory: trueを返す", async () => {
        const dirPath = "/Users/test/Documents";
        vi.mocked(fs.stat).mockResolvedValue({
          isFile: () => false,
          isDirectory: () => true,
        } as any);
        vi.mocked(fs.realpath).mockResolvedValue(dirPath);

        const handler = handlers.get(IPC_CHANNELS.FILE_SELECTION_VALIDATE_PATH);
        const result = await handler!(mockEvent, { filePath: dirPath });

        expect(result).toEqual({
          success: true,
          data: {
            valid: true,
            exists: true,
            isFile: false,
            isDirectory: true,
          },
        });
      });

      it("存在しないパスの場合、exists: falseを返す", async () => {
        const nonExistentPath = "/Users/test/Documents/nonexistent.pdf";
        vi.mocked(fs.stat).mockRejectedValue(
          Object.assign(new Error("ENOENT"), { code: "ENOENT" }),
        );
        vi.mocked(fs.realpath).mockRejectedValue(
          Object.assign(new Error("ENOENT"), { code: "ENOENT" }),
        );

        const handler = handlers.get(IPC_CHANNELS.FILE_SELECTION_VALIDATE_PATH);
        const result = await handler!(mockEvent, { filePath: nonExistentPath });

        expect(result).toEqual({
          success: true,
          data: {
            valid: true,
            exists: false,
            isFile: false,
            isDirectory: false,
          },
        });
      });
    });

    describe("エラー系", () => {
      it("パストラバーサルを含むパスはvalid: falseを返す", async () => {
        const handler = handlers.get(IPC_CHANNELS.FILE_SELECTION_VALIDATE_PATH);
        const result = await handler!(mockEvent, {
          filePath: "/Users/test/../../../etc/passwd",
        });

        expect(result).toEqual({
          success: true,
          data: {
            valid: false,
            exists: false,
            isFile: false,
            isDirectory: false,
            error: expect.stringMatching(/パス|トラバーサル|不正/),
          },
        });
      });

      it("許可されていないディレクトリはvalid: falseを返す", async () => {
        vi.mocked(fs.realpath).mockResolvedValue("/etc/passwd");

        const handler = handlers.get(IPC_CHANNELS.FILE_SELECTION_VALIDATE_PATH);
        const result = await handler!(mockEvent, { filePath: "/etc/passwd" });

        expect(result).toEqual({
          success: true,
          data: {
            valid: false,
            exists: false,
            isFile: false,
            isDirectory: false,
            error: expect.stringMatching(/許可|ディレクトリ|アクセス/),
          },
        });
      });

      it("空のパスはバリデーションエラーになる", async () => {
        const handler = handlers.get(IPC_CHANNELS.FILE_SELECTION_VALIDATE_PATH);
        const result = await handler!(mockEvent, { filePath: "" });

        expect(result).toEqual({
          success: false,
          error: expect.any(String),
        });
      });
    });
  });

  // ===========================================================================
  // Security Tests (SEC-M1, SEC-M2)
  // ===========================================================================

  describe("セキュリティ", () => {
    describe("送信元検証 (SEC-M1)", () => {
      it("不正な送信元からのリクエストは拒否する", async () => {
        const maliciousEvent = {
          sender: {
            id: 999,
            getURL: () => "https://malicious.com/attack",
          },
        };

        const handler = handlers.get(IPC_CHANNELS.FILE_SELECTION_OPEN_DIALOG);
        const result = await handler!(maliciousEvent, {});

        expect(result).toEqual({
          success: false,
          error: expect.stringMatching(/許可|不正|unauthorized/i),
        });
      });

      it("localhostからのリクエストは許可する（開発環境）", async () => {
        vi.mocked(dialog.showOpenDialog).mockResolvedValue({
          canceled: false,
          filePaths: [],
        });

        const devEvent = {
          sender: {
            id: 1,
            getURL: () => "http://localhost:3000",
          },
        };

        const handler = handlers.get(IPC_CHANNELS.FILE_SELECTION_OPEN_DIALOG);
        const result = await handler!(devEvent, {});

        expect(result).toEqual(
          expect.objectContaining({
            success: true,
          }),
        );
      });
    });

    describe("拡張子サニタイゼーション (SEC-M2)", () => {
      it("危険な拡張子を含むカスタムフィルターは拒否する", async () => {
        const handler = handlers.get(IPC_CHANNELS.FILE_SELECTION_OPEN_DIALOG);
        const result = await handler!(mockEvent, {
          customFilters: [{ name: "Executables", extensions: ["exe", "bat"] }],
        });

        expect(result).toEqual({
          success: false,
          error: expect.stringMatching(/拡張子|セキュリティ|許可/),
        });
      });

      it("安全な拡張子のカスタムフィルターは許可する", async () => {
        vi.mocked(dialog.showOpenDialog).mockResolvedValue({
          canceled: false,
          filePaths: [],
        });

        const handler = handlers.get(IPC_CHANNELS.FILE_SELECTION_OPEN_DIALOG);
        const result = await handler!(mockEvent, {
          customFilters: [{ name: "Documents", extensions: ["pdf", "docx"] }],
        });

        expect(result).toEqual(
          expect.objectContaining({
            success: true,
          }),
        );
      });
    });

    describe("パストラバーサル検出 (SEC-MAJOR-1)", () => {
      const traversalPatterns = [
        ["../etc/passwd", "相対パストラバーサル"],
        ["..\\etc\\passwd", "Windows形式相対パストラバーサル"],
        ["/path/../../../etc/passwd", "中間トラバーサル"],
        ["/path/./../../etc/passwd", "ドット含むトラバーサル"],
        ["....//....//etc/passwd", "エンコードされたトラバーサル"],
      ];

      it.each(traversalPatterns)(
        "パストラバーサル攻撃を検出: %s (%s)",
        async (filePath) => {
          const handler = handlers.get(
            IPC_CHANNELS.FILE_SELECTION_GET_METADATA,
          );
          const result = await handler!(mockEvent, { filePath });

          expect(result).toEqual({
            success: false,
            error: expect.stringMatching(/パス|トラバーサル|不正/),
          });
        },
      );
    });
  });

  // ===========================================================================
  // Rate Limiting Tests
  // ===========================================================================

  describe("レート制限", () => {
    it("短時間に大量のリクエストを送ると拒否される", async () => {
      vi.mocked(dialog.showOpenDialog).mockResolvedValue({
        canceled: false,
        filePaths: [],
      });

      const handler = handlers.get(IPC_CHANNELS.FILE_SELECTION_OPEN_DIALOG);

      // 10回のリクエストは成功
      for (let i = 0; i < 10; i++) {
        await handler!(mockEvent, {});
      }

      // 11回目以降はレート制限でエラー
      const result = await handler!(mockEvent, {});

      expect(result).toEqual({
        success: false,
        error: expect.stringMatching(/リクエスト|多すぎ|待/),
      });
    });
  });
});
