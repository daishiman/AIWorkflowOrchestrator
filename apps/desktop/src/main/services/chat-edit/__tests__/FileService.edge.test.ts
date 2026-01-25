/**
 * FileService Edge Case Tests
 *
 * Phase 6: 追加のエッジケーステスト
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import * as fs from "fs/promises";
import { FileService } from "../FileService";

// fsをモック
vi.mock("fs/promises");

describe("FileService - エッジケース", () => {
  let fileService: FileService;

  beforeEach(() => {
    vi.clearAllMocks();
    fileService = new FileService();
  });

  describe("readFile - エッジケース", () => {
    it("空ファイルを正常に読み取れる", async () => {
      // Arrange
      vi.mocked(fs.stat).mockResolvedValue({ size: 0 } as any);
      vi.mocked(fs.readFile).mockResolvedValue("");

      // Act
      const result = await fileService.readFile("/path/to/empty.ts");

      // Assert
      expect(result.success).toBe(true);
      expect(result.content).toBe("");
    });

    it("改行のみのファイルを正常に読み取れる", async () => {
      // Arrange
      vi.mocked(fs.stat).mockResolvedValue({ size: 3 } as any);
      vi.mocked(fs.readFile).mockResolvedValue("\n\n\n");

      // Act
      const result = await fileService.readFile("/path/to/newlines.ts");

      // Assert
      expect(result.success).toBe(true);
      expect(result.content).toBe("\n\n\n");
    });

    it("ちょうど10MBのファイルを読み取れる", async () => {
      // Arrange
      const exactLimit = 10 * 1024 * 1024;
      vi.mocked(fs.stat).mockResolvedValue({ size: exactLimit } as any);
      vi.mocked(fs.readFile).mockResolvedValue("content");

      // Act
      const result = await fileService.readFile("/path/to/exact-limit.ts");

      // Assert
      expect(result.success).toBe(true);
    });

    it("10MB + 1バイトでTOO_LARGEエラーを返す", async () => {
      // Arrange
      const overLimit = 10 * 1024 * 1024 + 1;
      vi.mocked(fs.stat).mockResolvedValue({ size: overLimit } as any);

      // Act
      const result = await fileService.readFile("/path/to/over-limit.ts");

      // Assert
      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("TOO_LARGE");
    });

    it("UTF-8のマルチバイト文字を含むファイルを読み取れる", async () => {
      // Arrange
      const japaneseContent = "日本語のテストコンテンツ";
      vi.mocked(fs.stat).mockResolvedValue({ size: 100 } as any);
      vi.mocked(fs.readFile).mockResolvedValue(japaneseContent);

      // Act
      const result = await fileService.readFile("/path/to/japanese.ts");

      // Assert
      expect(result.success).toBe(true);
      expect(result.content).toBe(japaneseContent);
    });

    it("絵文字を含むファイルを読み取れる", async () => {
      // Arrange
      const emojiContent = "🎉 test 🚀";
      vi.mocked(fs.stat).mockResolvedValue({ size: 100 } as any);
      vi.mocked(fs.readFile).mockResolvedValue(emojiContent);

      // Act
      const result = await fileService.readFile("/path/to/emoji.ts");

      // Assert
      expect(result.success).toBe(true);
      expect(result.content).toBe(emojiContent);
    });
  });

  describe("writeFile - エッジケース", () => {
    it("親ディレクトリが存在しない場合にエラーを返す", async () => {
      // Arrange
      const error = new Error("ENOENT: no such file or directory");
      (error as any).code = "ENOENT";
      vi.mocked(fs.writeFile).mockRejectedValue(error);

      // Act
      const result = await fileService.writeFile(
        "/nonexistent/dir/file.ts",
        "content",
      );

      // Assert
      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("WRITE_ERROR");
    });

    it("既存ファイルを上書きできる", async () => {
      // Arrange
      vi.mocked(fs.writeFile).mockResolvedValue(undefined);

      // Act
      const result = await fileService.writeFile(
        "/path/to/existing.ts",
        "new content",
      );

      // Assert
      expect(result.success).toBe(true);
    });

    it("Unicode文字を含むパスを処理できる", async () => {
      // Arrange
      vi.mocked(fs.writeFile).mockResolvedValue(undefined);

      // Act
      const result = await fileService.writeFile(
        "/path/to/日本語.ts",
        "content",
      );

      // Assert
      expect(result.success).toBe(true);
    });

    it("バックアップ作成時に元ファイルが存在しない場合はバックアップなしで書き込む", async () => {
      // Arrange
      const error = new Error("ENOENT");
      (error as any).code = "ENOENT";
      vi.mocked(fs.access).mockRejectedValue(error);
      vi.mocked(fs.writeFile).mockResolvedValue(undefined);

      // Act
      const result = await fileService.writeFile(
        "/path/to/new-file.ts",
        "content",
        {
          createBackup: true,
        },
      );

      // Assert
      expect(result.success).toBe(true);
      expect(result.backupPath).toBeUndefined();
    });

    it("バックアップ作成時に元ファイルが存在する場合はバックアップを作成して書き込む", async () => {
      // Arrange
      vi.mocked(fs.access).mockResolvedValue(undefined);
      vi.mocked(fs.copyFile).mockResolvedValue(undefined);
      vi.mocked(fs.writeFile).mockResolvedValue(undefined);

      // Act
      const result = await fileService.writeFile(
        "/path/to/existing.ts",
        "new content",
        {
          createBackup: true,
        },
      );

      // Assert
      expect(result.success).toBe(true);
      expect(result.backupPath).toMatch(/\/path\/to\/existing\.\d+\.bak$/);
      expect(fs.copyFile).toHaveBeenCalled();
    });

    it("書き込み権限がない場合PERMISSION_DENIEDエラーを返す", async () => {
      // Arrange
      const error = new Error("EACCES: permission denied");
      (error as any).code = "EACCES";
      vi.mocked(fs.writeFile).mockRejectedValue(error);

      // Act
      const result = await fileService.writeFile(
        "/path/to/readonly.ts",
        "content",
      );

      // Assert
      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("PERMISSION_DENIED");
    });

    it("空文字列のパスでINVALID_PATHエラーを返す", async () => {
      // Act
      const result = await fileService.writeFile("", "content");

      // Assert
      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("INVALID_PATH");
    });

    it("空白のみのパスでINVALID_PATHエラーを返す", async () => {
      // Act
      const result = await fileService.writeFile("   ", "content");

      // Assert
      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("INVALID_PATH");
    });
  });

  describe("detectLanguage - 全拡張子カバレッジ", () => {
    const allExtensions = [
      [".ts", "typescript"],
      [".tsx", "typescript"],
      [".js", "javascript"],
      [".jsx", "javascript"],
      [".py", "python"],
      [".md", "markdown"],
      [".json", "json"],
      [".css", "css"],
      [".scss", "scss"],
      [".html", "html"],
      [".vue", "vue"],
      [".go", "go"],
      [".rs", "rust"],
      [".java", "java"],
      [".rb", "ruby"],
      [".php", "php"],
      [".sh", "shell"],
      [".yaml", "yaml"],
      [".yml", "yaml"],
      [".sql", "sql"],
      [".graphql", "graphql"],
    ] as const;

    it.each(allExtensions)("拡張子 %s で言語 %s を返す", (ext, lang) => {
      expect(fileService.detectLanguage(`file${ext}`)).toBe(lang);
    });

    it("大文字拡張子を正しく処理する", () => {
      expect(fileService.detectLanguage("file.TS")).toBe("typescript");
      expect(fileService.detectLanguage("file.JS")).toBe("javascript");
    });

    it("複数ドットを含むファイル名を正しく処理する", () => {
      expect(fileService.detectLanguage("file.test.ts")).toBe("typescript");
      expect(fileService.detectLanguage("file.spec.js")).toBe("javascript");
    });

    it("拡張子なしでplaintextを返す", () => {
      expect(fileService.detectLanguage("Makefile")).toBe("plaintext");
      expect(fileService.detectLanguage("Dockerfile")).toBe("plaintext");
    });
  });

  describe("createBackup", () => {
    it("バックアップファイルを正しい形式で作成する", async () => {
      // Arrange
      vi.mocked(fs.copyFile).mockResolvedValue(undefined);

      // Act
      const backupPath = await fileService.createBackup("/path/to/file.ts");

      // Assert
      expect(backupPath).toMatch(/^\/path\/to\/file\.\d+\.bak$/);
    });
  });
});
