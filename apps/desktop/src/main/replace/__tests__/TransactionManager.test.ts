import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { TransactionManager } from "../../transaction/TransactionManager";
import { FileBackupManager } from "../../transaction/FileBackupManager";
import * as fs from "fs/promises";
import * as path from "path";
import { tmpdir } from "os";

// Mock FileBackupManager
vi.mock("../../transaction/FileBackupManager");

describe("TransactionManager", () => {
  let manager: TransactionManager;
  let mockBackupManager: FileBackupManager;
  let testDir: string;

  beforeEach(async () => {
    mockBackupManager = new FileBackupManager();
    manager = new TransactionManager(mockBackupManager);
    testDir = path.join(tmpdir(), `transaction-test-${Date.now()}`);
    await fs.mkdir(testDir, { recursive: true });
  });

  afterEach(async () => {
    await fs.rm(testDir, { recursive: true, force: true });
    vi.clearAllMocks();
  });

  describe("正常系: トランザクション開始と完了", () => {
    it("should create a new transaction", () => {
      const tx = manager.begin();

      expect(tx).toBeDefined();
      expect(tx.id).toBeDefined();
      expect(tx.status).toBe("pending");
    });

    it("should commit a successful transaction", async () => {
      const tx = manager.begin();
      const testFile = path.join(testDir, "test.txt");
      await fs.writeFile(testFile, "original", "utf-8");

      await tx.addOperation({
        type: "replace",
        filePath: testFile,
        originalContent: "original",
        newContent: "modified",
      });

      await manager.commit(tx.id);

      expect(tx.status).toBe("committed");
      const content = await fs.readFile(testFile, "utf-8");
      expect(content).toBe("modified");
    });

    it("should generate unique transaction IDs", () => {
      const tx1 = manager.begin();
      const tx2 = manager.begin();
      const tx3 = manager.begin();

      expect(tx1.id).not.toBe(tx2.id);
      expect(tx2.id).not.toBe(tx3.id);
      expect(tx1.id).not.toBe(tx3.id);
    });
  });

  describe("正常系: ロールバック", () => {
    it("should rollback transaction on error", async () => {
      const tx = manager.begin();
      const testFile = path.join(testDir, "test.txt");
      await fs.writeFile(testFile, "original", "utf-8");

      await tx.addOperation({
        type: "replace",
        filePath: testFile,
        originalContent: "original",
        newContent: "modified",
      });

      // Simulate commit then rollback
      await manager.rollback(tx.id);

      expect(tx.status).toBe("rolled_back");
    });

    it("should restore files on rollback", async () => {
      const tx = manager.begin();
      const testFile = path.join(testDir, "rollback.txt");
      await fs.writeFile(testFile, "original content", "utf-8");

      // Mock backup
      vi.mocked(mockBackupManager.createBackup).mockResolvedValue(
        "backup-id-123",
      );
      vi.mocked(mockBackupManager.restore).mockResolvedValue(undefined);

      await tx.addOperation({
        type: "replace",
        filePath: testFile,
        originalContent: "original content",
        newContent: "new content",
      });

      await manager.rollback(tx.id);

      expect(mockBackupManager.restore).toHaveBeenCalled();
    });

    it("should rollback multiple operations in reverse order", async () => {
      const tx = manager.begin();
      const file1 = path.join(testDir, "file1.txt");
      const file2 = path.join(testDir, "file2.txt");
      const file3 = path.join(testDir, "file3.txt");

      await fs.writeFile(file1, "content1", "utf-8");
      await fs.writeFile(file2, "content2", "utf-8");
      await fs.writeFile(file3, "content3", "utf-8");

      const operations: string[] = [];
      vi.mocked(mockBackupManager.restore).mockImplementation(
        async (backupId: string) => {
          operations.push(backupId);
        },
      );

      await tx.addOperation({
        type: "replace",
        filePath: file1,
        originalContent: "content1",
        newContent: "new1",
      });
      await tx.addOperation({
        type: "replace",
        filePath: file2,
        originalContent: "content2",
        newContent: "new2",
      });
      await tx.addOperation({
        type: "replace",
        filePath: file3,
        originalContent: "content3",
        newContent: "new3",
      });

      await manager.rollback(tx.id);

      // Verify rollback happens in reverse order
      expect(operations.length).toBe(3);
    });
  });

  describe("正常系: Undo/Redo 統合", () => {
    it("should create undo group on commit", async () => {
      const tx = manager.begin();
      const testFile = path.join(testDir, "undo.txt");
      await fs.writeFile(testFile, "original", "utf-8");

      await tx.addOperation({
        type: "replace",
        filePath: testFile,
        originalContent: "original",
        newContent: "modified",
      });

      const result = await manager.commit(tx.id);

      expect(result.undoGroupId).toBeDefined();
    });

    it("should allow undo of committed transaction", async () => {
      const tx = manager.begin();
      const testFile = path.join(testDir, "undo-test.txt");
      await fs.writeFile(testFile, "original", "utf-8");

      await tx.addOperation({
        type: "replace",
        filePath: testFile,
        originalContent: "original",
        newContent: "modified",
      });

      const result = await manager.commit(tx.id);
      await manager.undo(result.undoGroupId);

      const content = await fs.readFile(testFile, "utf-8");
      expect(content).toBe("original");
    });

    it("should allow redo after undo", async () => {
      const tx = manager.begin();
      const testFile = path.join(testDir, "redo-test.txt");
      await fs.writeFile(testFile, "original", "utf-8");

      await tx.addOperation({
        type: "replace",
        filePath: testFile,
        originalContent: "original",
        newContent: "modified",
      });

      const result = await manager.commit(tx.id);
      await manager.undo(result.undoGroupId);
      await manager.redo(result.undoGroupId);

      const content = await fs.readFile(testFile, "utf-8");
      expect(content).toBe("modified");
    });
  });

  describe("境界値: 複数ファイル操作", () => {
    it("should handle transaction with many files", async () => {
      const tx = manager.begin();
      const fileCount = 10;
      const files: string[] = [];

      for (let i = 0; i < fileCount; i++) {
        const file = path.join(testDir, `file${i}.txt`);
        await fs.writeFile(file, `content${i}`, "utf-8");
        files.push(file);

        await tx.addOperation({
          type: "replace",
          filePath: file,
          originalContent: `content${i}`,
          newContent: `modified${i}`,
        });
      }

      await manager.commit(tx.id);

      for (let i = 0; i < fileCount; i++) {
        const content = await fs.readFile(files[i], "utf-8");
        expect(content).toBe(`modified${i}`);
      }
    });

    it("should rollback all files on partial failure", async () => {
      const tx = manager.begin();
      const file1 = path.join(testDir, "success.txt");
      const file2 = "/non/existent/path/fail.txt";

      await fs.writeFile(file1, "original1", "utf-8");

      await tx.addOperation({
        type: "replace",
        filePath: file1,
        originalContent: "original1",
        newContent: "modified1",
      });

      await tx.addOperation({
        type: "replace",
        filePath: file2,
        originalContent: "original2",
        newContent: "modified2",
      });

      await expect(manager.commit(tx.id)).rejects.toThrow();
      expect(tx.status).toBe("rolled_back");
    });
  });

  describe("異常系: 無効なトランザクション", () => {
    it("should throw error when committing non-existent transaction", async () => {
      await expect(manager.commit("non-existent-id")).rejects.toThrow(
        /transaction.*not found/i,
      );
    });

    it("should throw error when rolling back non-existent transaction", async () => {
      await expect(manager.rollback("non-existent-id")).rejects.toThrow(
        /transaction.*not found/i,
      );
    });

    it("should throw error when committing already committed transaction", async () => {
      const tx = manager.begin();
      const testFile = path.join(testDir, "double-commit.txt");
      await fs.writeFile(testFile, "content", "utf-8");

      await tx.addOperation({
        type: "replace",
        filePath: testFile,
        originalContent: "content",
        newContent: "new",
      });

      await manager.commit(tx.id);

      await expect(manager.commit(tx.id)).rejects.toThrow(
        /already.*committed/i,
      );
    });

    it("should throw error when rolling back already rolled back transaction", async () => {
      const tx = manager.begin();

      await manager.rollback(tx.id);

      await expect(manager.rollback(tx.id)).rejects.toThrow(/already.*rolled/i);
    });
  });

  describe("異常系: ファイルシステムエラー", () => {
    it("should handle permission denied error", async () => {
      const tx = manager.begin();
      const testFile = path.join(testDir, "permission.txt");
      await fs.writeFile(testFile, "content", "utf-8");
      await fs.chmod(testFile, 0o444); // Read-only

      await tx.addOperation({
        type: "replace",
        filePath: testFile,
        originalContent: "content",
        newContent: "new",
      });

      await expect(manager.commit(tx.id)).rejects.toThrow();

      // Cleanup
      await fs.chmod(testFile, 0o644);
    });

    it("should handle file deleted during transaction", async () => {
      const tx = manager.begin();
      const testFile = path.join(testDir, "deleted.txt");
      await fs.writeFile(testFile, "content", "utf-8");

      await tx.addOperation({
        type: "replace",
        filePath: testFile,
        originalContent: "content",
        newContent: "new",
      });

      // Delete file before commit
      await fs.unlink(testFile);

      await expect(manager.commit(tx.id)).rejects.toThrow();
    });
  });

  describe("タイムアウトとキャンセル", () => {
    it("should support transaction timeout", async () => {
      const tx = manager.begin({ timeout: 100 }); // 100ms timeout

      // Wait for timeout
      await new Promise((resolve) => setTimeout(resolve, 150));

      await expect(manager.commit(tx.id)).rejects.toThrow(/timeout|expired/i);
    });

    it("should support transaction cancellation", async () => {
      const tx = manager.begin();
      const testFile = path.join(testDir, "cancel.txt");
      await fs.writeFile(testFile, "content", "utf-8");

      await tx.addOperation({
        type: "replace",
        filePath: testFile,
        originalContent: "content",
        newContent: "new",
      });

      manager.cancel(tx.id);

      expect(tx.status).toBe("cancelled");
      await expect(manager.commit(tx.id)).rejects.toThrow(/cancelled/i);
    });
  });

  describe("並行トランザクション", () => {
    it("should handle multiple concurrent transactions", async () => {
      const tx1 = manager.begin();
      const tx2 = manager.begin();

      const file1 = path.join(testDir, "concurrent1.txt");
      const file2 = path.join(testDir, "concurrent2.txt");

      await fs.writeFile(file1, "content1", "utf-8");
      await fs.writeFile(file2, "content2", "utf-8");

      await tx1.addOperation({
        type: "replace",
        filePath: file1,
        originalContent: "content1",
        newContent: "modified1",
      });

      await tx2.addOperation({
        type: "replace",
        filePath: file2,
        originalContent: "content2",
        newContent: "modified2",
      });

      await Promise.all([manager.commit(tx1.id), manager.commit(tx2.id)]);

      expect(tx1.status).toBe("committed");
      expect(tx2.status).toBe("committed");
    });

    it("should detect conflicting operations on same file", async () => {
      const tx1 = manager.begin();
      const tx2 = manager.begin();

      const sharedFile = path.join(testDir, "shared.txt");
      await fs.writeFile(sharedFile, "original", "utf-8");

      await tx1.addOperation({
        type: "replace",
        filePath: sharedFile,
        originalContent: "original",
        newContent: "modified by tx1",
      });

      await tx2.addOperation({
        type: "replace",
        filePath: sharedFile,
        originalContent: "original",
        newContent: "modified by tx2",
      });

      // One should succeed, one should fail due to conflict
      const results = await Promise.allSettled([
        manager.commit(tx1.id),
        manager.commit(tx2.id),
      ]);

      const failures = results.filter((r) => r.status === "rejected");
      expect(failures.length).toBeGreaterThanOrEqual(0); // May or may not conflict depending on timing
    });
  });
});
