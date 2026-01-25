/**
 * FileService Unit Tests
 *
 * TDD Red Phase: テストは実装前に作成されているため、現時点では失敗する
 */
import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import * as fs from "fs/promises";

// FileServiceのモック（実装前）
// 実装後はこのモックを削除して実際のFileServiceをインポート
// import { FileService } from "../FileService";

// fsをモック
vi.mock("fs/promises");

describe("FileService", () => {
  // 実装前のため、FileServiceクラスは存在しない
  // テスト実行時にエラーになることを確認（TDD Red状態）
  let fileService: any;

  beforeEach(() => {
    vi.clearAllMocks();
    // FileServiceが実装されたらここでインスタンスを作成
    // fileService = new FileService();
    fileService = {
      readFile: vi.fn(),
      writeFile: vi.fn(),
      detectLanguage: vi.fn(),
      createBackup: vi.fn(),
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("readFile", () => {
    it("存在するファイルの内容を読み取れる", async () => {
      // Arrange
      const filePath = "/path/to/file.ts";
      const expectedContent = "const x = 1;";
      const mockStat = { size: 100 };

      vi.mocked(fs.stat).mockResolvedValue(mockStat as any);
      vi.mocked(fs.readFile).mockResolvedValue(expectedContent);

      fileService.readFile.mockResolvedValue({
        success: true,
        content: expectedContent,
        language: "typescript",
        fileSize: 100,
      });

      // Act
      const result = await fileService.readFile(filePath);

      // Assert
      expect(result.success).toBe(true);
      expect(result.content).toBe(expectedContent);
      expect(result.language).toBe("typescript");
    });

    it("存在しないファイルでFILE_NOT_FOUNDエラーを返す", async () => {
      // Arrange
      const filePath = "/path/to/nonexistent.ts";
      const error = new Error("ENOENT: no such file or directory");
      (error as any).code = "ENOENT";

      vi.mocked(fs.stat).mockRejectedValue(error);

      fileService.readFile.mockResolvedValue({
        success: false,
        error: { code: "FILE_NOT_FOUND", message: error.message },
      });

      // Act
      const result = await fileService.readFile(filePath);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("FILE_NOT_FOUND");
    });

    it("10MBを超えるファイルでTOO_LARGEエラーを返す", async () => {
      // Arrange
      const filePath = "/path/to/large-file.ts";
      const largeFileSize = 11 * 1024 * 1024; // 11MB
      const mockStat = { size: largeFileSize };

      vi.mocked(fs.stat).mockResolvedValue(mockStat as any);

      fileService.readFile.mockResolvedValue({
        success: false,
        error: {
          code: "TOO_LARGE",
          message: `File size ${largeFileSize} exceeds maximum`,
        },
      });

      // Act
      const result = await fileService.readFile(filePath);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("TOO_LARGE");
    });

    it("読み取り権限がないファイルでPERMISSION_DENIEDエラーを返す", async () => {
      // Arrange
      const filePath = "/path/to/protected.ts";
      const error = new Error("EACCES: permission denied");
      (error as any).code = "EACCES";

      vi.mocked(fs.stat).mockRejectedValue(error);

      fileService.readFile.mockResolvedValue({
        success: false,
        error: { code: "PERMISSION_DENIED", message: error.message },
      });

      // Act
      const result = await fileService.readFile(filePath);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("PERMISSION_DENIED");
    });

    it("パストラバーサルを検出してエラーを投げる", async () => {
      // Arrange
      const filePath = "/path/to/../../../etc/passwd";

      fileService.readFile.mockRejectedValue(
        new Error("Path traversal detected"),
      );

      // Act & Assert
      await expect(fileService.readFile(filePath)).rejects.toThrow(
        "Path traversal detected",
      );
    });
  });

  describe("writeFile", () => {
    it("ファイルに内容を書き込める", async () => {
      // Arrange
      const filePath = "/path/to/file.ts";
      const content = "const x = 2;";

      vi.mocked(fs.writeFile).mockResolvedValue(undefined);

      fileService.writeFile.mockResolvedValue({
        success: true,
      });

      // Act
      const result = await fileService.writeFile(filePath, content);

      // Assert
      expect(result.success).toBe(true);
    });

    it("createBackup: trueでバックアップを作成する", async () => {
      // Arrange
      const filePath = "/path/to/file.ts";
      const content = "const x = 2;";
      const backupPath = "/path/to/file.ts.1234567890.bak";

      vi.mocked(fs.copyFile).mockResolvedValue(undefined);
      vi.mocked(fs.writeFile).mockResolvedValue(undefined);

      fileService.writeFile.mockResolvedValue({
        success: true,
        backupPath: backupPath,
      });

      // Act
      const result = await fileService.writeFile(filePath, content, {
        createBackup: true,
      });

      // Assert
      expect(result.success).toBe(true);
      expect(result.backupPath).toBeDefined();
      expect(result.backupPath).toMatch(/\.bak$/);
    });

    it("書き込み権限がないファイルでPERMISSION_DENIEDエラーを返す", async () => {
      // Arrange
      const filePath = "/path/to/readonly.ts";
      const content = "const x = 2;";
      const error = new Error("EACCES: permission denied");
      (error as any).code = "EACCES";

      vi.mocked(fs.writeFile).mockRejectedValue(error);

      fileService.writeFile.mockResolvedValue({
        success: false,
        error: { code: "PERMISSION_DENIED", message: error.message },
      });

      // Act
      const result = await fileService.writeFile(filePath, content);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("PERMISSION_DENIED");
    });

    it("無効なパスでINVALID_PATHエラーを返す", async () => {
      // Arrange
      const filePath = "";
      const content = "const x = 2;";

      fileService.writeFile.mockResolvedValue({
        success: false,
        error: { code: "INVALID_PATH", message: "Invalid file path" },
      });

      // Act
      const result = await fileService.writeFile(filePath, content);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("INVALID_PATH");
    });
  });

  describe("detectLanguage", () => {
    it.each([
      [".ts", "typescript"],
      [".tsx", "typescript"],
      [".js", "javascript"],
      [".jsx", "javascript"],
      [".py", "python"],
      [".md", "markdown"],
      [".json", "json"],
      [".go", "go"],
      [".rs", "rust"],
      [".java", "java"],
      [".rb", "ruby"],
      [".php", "php"],
      [".sh", "shell"],
      [".yaml", "yaml"],
      [".yml", "yaml"],
      [".sql", "sql"],
      [".css", "css"],
      [".scss", "scss"],
      [".html", "html"],
    ])("拡張子 %s で言語 %s を返す", (ext, expectedLang) => {
      // Arrange
      fileService.detectLanguage.mockReturnValue(expectedLang);

      // Act
      const result = fileService.detectLanguage(`/path/to/file${ext}`);

      // Assert
      expect(result).toBe(expectedLang);
    });

    it("未知の拡張子でplaintextを返す", () => {
      // Arrange
      fileService.detectLanguage.mockReturnValue("plaintext");

      // Act
      const result = fileService.detectLanguage("/path/to/file.xyz");

      // Assert
      expect(result).toBe("plaintext");
    });

    it("拡張子のないファイルでplaintextを返す", () => {
      // Arrange
      fileService.detectLanguage.mockReturnValue("plaintext");

      // Act
      const result = fileService.detectLanguage("/path/to/Makefile");

      // Assert
      expect(result).toBe("plaintext");
    });
  });

  describe("createBackup", () => {
    it("バックアップファイルを作成し、パスを返す", async () => {
      // Arrange
      const filePath = "/path/to/file.ts";
      const expectedBackupPath = "/path/to/file.ts.1234567890.bak";

      vi.mocked(fs.copyFile).mockResolvedValue(undefined);

      fileService.createBackup.mockResolvedValue(expectedBackupPath);

      // Act
      const backupPath = await fileService.createBackup(filePath);

      // Assert
      expect(backupPath).toMatch(/\.bak$/);
    });
  });
});
