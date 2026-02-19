/**
 * Skill File IPC Handlers - Integration Tests (TASK-9A-B Phase 4)
 *
 * 9 test cases covering end-to-end flow with real SkillFileManager:
 * - I-01: readFile 実ファイル読み込み
 * - I-02: writeFile → readFile 往復
 * - I-03: writeFile バックアップ作成確認
 * - I-04: createFile → readFile 新規作成往復
 * - I-05: createFile 既存ファイル重複エラー
 * - I-06: deleteFile → readFile エラー確認
 * - I-07: deleteFile → listBackups バックアップ存在確認
 * - I-08: write → listBackups → restoreBackup → readFile 完全サイクル
 * - I-09: 読み取り専用スキルへの writeFile
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import * as fs from "fs/promises";
import * as path from "path";
import * as os from "os";
import { randomUUID } from "crypto";
import type { IpcMainInvokeEvent } from "electron";
import { IPC_CHANNELS } from "../../../preload/channels";
import { SkillFileManager } from "../../services/skill/SkillFileManager";

// Handler map for testing
type IpcHandler = (...args: unknown[]) => unknown;
const handlerMap = new Map<string, IpcHandler>();

// Mock electron
vi.mock("electron", () => ({
  ipcMain: {
    handle: vi.fn((channel: string, handler: IpcHandler) => {
      handlerMap.set(channel, handler);
    }),
    removeHandler: vi.fn((channel: string) => {
      handlerMap.delete(channel);
    }),
  },
  BrowserWindow: {
    fromWebContents: vi.fn(),
  },
}));

// Mock ipc-validator (always valid for integration tests)
vi.mock("../../infrastructure/security/ipc-validator", () => ({
  validateIpcSender: vi.fn().mockReturnValue({ valid: true }),
  toIPCValidationError: vi.fn().mockImplementation((result) => ({
    success: false,
    error: {
      code: result.errorCode ?? "IPC_UNAUTHORIZED",
      message: result.errorMessage ?? "Unauthorized IPC call",
    },
  })),
}));

// Factory functions
function createMockMainWindow() {
  return {
    id: 1,
    webContents: {
      id: 1,
      getType: () => "window",
      isDevToolsOpened: () => false,
    },
    isDestroyed: () => false,
  };
}

function createMockEvent() {
  return {
    sender: {
      id: 1,
      getType: () => "window",
      isDevToolsOpened: () => false,
    },
  } as unknown as IpcMainInvokeEvent;
}

describe("skillFileHandlers - Integration", () => {
  let tmpDir: string;
  let aiworkflowSkillsDir: string;
  let claudeSkillsDir: string;
  let skillFileManager: SkillFileManager;
  let mainWindow: ReturnType<typeof createMockMainWindow>;
  let mockEvent: IpcMainInvokeEvent;

  beforeEach(async () => {
    handlerMap.clear();
    vi.clearAllMocks();

    // テスト用一時ディレクトリを作成
    tmpDir = path.join(os.tmpdir(), `skill-ipc-integration-${randomUUID()}`);
    aiworkflowSkillsDir = path.join(tmpDir, "aiworkflow-skills");
    claudeSkillsDir = path.join(tmpDir, "claude-skills");

    await fs.mkdir(aiworkflowSkillsDir, { recursive: true });
    await fs.mkdir(claudeSkillsDir, { recursive: true });

    // テスト用スキルディレクトリを作成
    const testSkillDir = path.join(aiworkflowSkillsDir, "test-skill");
    await fs.mkdir(testSkillDir, { recursive: true });
    await fs.writeFile(
      path.join(testSkillDir, "SKILL.md"),
      "# Test Skill\nOriginal content",
    );

    // 読み取り専用スキル（claude-skills に配置）
    const readonlySkillDir = path.join(claudeSkillsDir, "readonly-skill");
    await fs.mkdir(readonlySkillDir, { recursive: true });
    await fs.writeFile(
      path.join(readonlySkillDir, "SKILL.md"),
      "# Readonly Skill",
    );

    // SkillFileManager を実インスタンスで作成
    skillFileManager = new SkillFileManager({
      aiworkflowSkillsDir,
      claudeSkillsDir,
    });

    mainWindow = createMockMainWindow();
    mockEvent = createMockEvent();

    const { registerSkillFileHandlers } = await import("../skillFileHandlers");
    registerSkillFileHandlers(mainWindow as never, skillFileManager);
  });

  afterEach(async () => {
    const { unregisterSkillFileHandlers } =
      await import("../skillFileHandlers");
    unregisterSkillFileHandlers();
    handlerMap.clear();

    // 一時ディレクトリを削除
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  // I-01
  it("readFile: 実ファイルを読み込む", async () => {
    const handler = handlerMap.get(IPC_CHANNELS.SKILL_READ_FILE);
    const result = await handler!(mockEvent, {
      skillName: "test-skill",
      relativePath: "SKILL.md",
    });
    expect(result.success).toBe(true);
    expect(result.data).toBe("# Test Skill\nOriginal content");
  });

  // I-02
  it("writeFile → readFile: 書き込み後に正しい内容が読み込める", async () => {
    const writeHandler = handlerMap.get(IPC_CHANNELS.SKILL_WRITE_FILE);
    const writeResult = await writeHandler!(mockEvent, {
      skillName: "test-skill",
      relativePath: "SKILL.md",
      content: "Updated content",
    });
    expect(writeResult.success).toBe(true);

    const readHandler = handlerMap.get(IPC_CHANNELS.SKILL_READ_FILE);
    const readResult = await readHandler!(mockEvent, {
      skillName: "test-skill",
      relativePath: "SKILL.md",
    });
    expect(readResult.success).toBe(true);
    expect(readResult.data).toBe("Updated content");
  });

  // I-03
  it("writeFile: 既存ファイル書き込み時にバックアップが作成される", async () => {
    const writeHandler = handlerMap.get(IPC_CHANNELS.SKILL_WRITE_FILE);
    await writeHandler!(mockEvent, {
      skillName: "test-skill",
      relativePath: "SKILL.md",
      content: "Modified content",
    });

    const backupsHandler = handlerMap.get(IPC_CHANNELS.SKILL_LIST_BACKUPS);
    const backupsResult = await backupsHandler!(mockEvent, {
      skillName: "test-skill",
    });
    expect(backupsResult.success).toBe(true);

    const backupEntries = backupsResult.data.filter(
      (b: { type: string }) => b.type === "backup",
    );
    expect(backupEntries.length).toBeGreaterThanOrEqual(1);
  });

  // I-04
  it("createFile → readFile: 新規作成後に読み込む", async () => {
    const createHandler = handlerMap.get(IPC_CHANNELS.SKILL_CREATE_FILE);
    const createResult = await createHandler!(mockEvent, {
      skillName: "test-skill",
      relativePath: "new-file.md",
      content: "New file content",
    });
    expect(createResult.success).toBe(true);

    const readHandler = handlerMap.get(IPC_CHANNELS.SKILL_READ_FILE);
    const readResult = await readHandler!(mockEvent, {
      skillName: "test-skill",
      relativePath: "new-file.md",
    });
    expect(readResult.success).toBe(true);
    expect(readResult.data).toBe("New file content");
  });

  // I-05
  it("createFile: 既存ファイルに対して実行するとエラー", async () => {
    const handler = handlerMap.get(IPC_CHANNELS.SKILL_CREATE_FILE);
    const result = await handler!(mockEvent, {
      skillName: "test-skill",
      relativePath: "SKILL.md",
      content: "duplicate",
    });
    expect(result.success).toBe(false);
    expect(result.error).toContain("File already exists");
  });

  // I-06
  it("deleteFile → readFile: 削除後に読み込むとエラー", async () => {
    const deleteHandler = handlerMap.get(IPC_CHANNELS.SKILL_DELETE_FILE);
    const deleteResult = await deleteHandler!(mockEvent, {
      skillName: "test-skill",
      relativePath: "SKILL.md",
    });
    expect(deleteResult.success).toBe(true);

    const readHandler = handlerMap.get(IPC_CHANNELS.SKILL_READ_FILE);
    const readResult = await readHandler!(mockEvent, {
      skillName: "test-skill",
      relativePath: "SKILL.md",
    });
    expect(readResult.success).toBe(false);
    expect(readResult.error).toContain("File not found");
  });

  // I-07
  it("deleteFile → listBackups: 削除後にバックアップが存在する", async () => {
    const deleteHandler = handlerMap.get(IPC_CHANNELS.SKILL_DELETE_FILE);
    await deleteHandler!(mockEvent, {
      skillName: "test-skill",
      relativePath: "SKILL.md",
    });

    const backupsHandler = handlerMap.get(IPC_CHANNELS.SKILL_LIST_BACKUPS);
    const backupsResult = await backupsHandler!(mockEvent, {
      skillName: "test-skill",
    });
    expect(backupsResult.success).toBe(true);

    const deletedEntries = backupsResult.data.filter(
      (b: { type: string }) => b.type === "deleted",
    );
    expect(deletedEntries.length).toBeGreaterThanOrEqual(1);
  });

  // I-08
  it("write → listBackups → restoreBackup → readFile: 完全サイクル", async () => {
    // 元の内容を記録
    const originalContent = "# Test Skill\nOriginal content";

    // 書き込みでバックアップ作成
    const writeHandler = handlerMap.get(IPC_CHANNELS.SKILL_WRITE_FILE);
    await writeHandler!(mockEvent, {
      skillName: "test-skill",
      relativePath: "SKILL.md",
      content: "Modified for backup test",
    });

    // バックアップ一覧を取得
    const backupsHandler = handlerMap.get(IPC_CHANNELS.SKILL_LIST_BACKUPS);
    const backupsResult = await backupsHandler!(mockEvent, {
      skillName: "test-skill",
    });
    expect(backupsResult.success).toBe(true);
    expect(backupsResult.data.length).toBeGreaterThanOrEqual(1);

    // バックアップから復元
    const backupEntry = backupsResult.data.find(
      (b: { type: string }) => b.type === "backup",
    );
    expect(backupEntry).toBeDefined();

    const restoreHandler = handlerMap.get(IPC_CHANNELS.SKILL_RESTORE_BACKUP);
    const restoreResult = await restoreHandler!(mockEvent, {
      skillName: "test-skill",
      backupPath: backupEntry.relativePath,
    });
    expect(restoreResult.success).toBe(true);

    // 復元後にオリジナル内容が読み込めることを確認
    const readHandler = handlerMap.get(IPC_CHANNELS.SKILL_READ_FILE);
    const readResult = await readHandler!(mockEvent, {
      skillName: "test-skill",
      relativePath: "SKILL.md",
    });
    expect(readResult.success).toBe(true);
    expect(readResult.data).toBe(originalContent);
  });

  // I-09
  it("読み取り専用スキルへの writeFile はエラーを返す", async () => {
    const handler = handlerMap.get(IPC_CHANNELS.SKILL_WRITE_FILE);
    const result = await handler!(mockEvent, {
      skillName: "readonly-skill",
      relativePath: "SKILL.md",
      content: "attempt to modify",
    });
    expect(result.success).toBe(false);
    expect(result.error).toContain("Cannot modify readonly skill");
  });

  // =========================================================================
  // 統合テスト拡充 (IE-01 ~ IE-04) — Phase 6
  // =========================================================================

  // IE-01
  it("writeFile 後に scanAvailableSkills が呼び出される", async () => {
    // IE-01 はスキルサービスのモックが必要なため、別途ハンドラーを登録
    const { unregisterSkillFileHandlers, registerSkillFileHandlers } =
      await import("../skillFileHandlers");
    unregisterSkillFileHandlers();
    handlerMap.clear();

    const mockSkillService = {
      scanAvailableSkills: vi.fn().mockResolvedValue({ skills: [] }),
    };

    registerSkillFileHandlers(
      mainWindow as never,
      skillFileManager,
      mockSkillService as never,
    );

    const writeHandler = handlerMap.get(IPC_CHANNELS.SKILL_WRITE_FILE);
    await writeHandler!(mockEvent, {
      skillName: "test-skill",
      relativePath: "SKILL.md",
      content: "Updated for IE-01",
    });

    expect(mockSkillService.scanAvailableSkills).toHaveBeenCalledTimes(1);
  });

  // IE-02
  it("createFile → writeFile → readFile: 新規作成後に上書き → 読み込み", async () => {
    const createHandler = handlerMap.get(IPC_CHANNELS.SKILL_CREATE_FILE);
    await createHandler!(mockEvent, {
      skillName: "test-skill",
      relativePath: "multi-step.md",
      content: "First version",
    });

    const writeHandler = handlerMap.get(IPC_CHANNELS.SKILL_WRITE_FILE);
    await writeHandler!(mockEvent, {
      skillName: "test-skill",
      relativePath: "multi-step.md",
      content: "Second version",
    });

    const readHandler = handlerMap.get(IPC_CHANNELS.SKILL_READ_FILE);
    const result = await readHandler!(mockEvent, {
      skillName: "test-skill",
      relativePath: "multi-step.md",
    });
    expect(result.success).toBe(true);
    expect(result.data).toBe("Second version");
  });

  // IE-03
  it("複数ファイルの連続バックアップ → listBackups のソート順検証", async () => {
    const writeHandler = handlerMap.get(IPC_CHANNELS.SKILL_WRITE_FILE);

    // 複数回書き込みでバックアップを生成
    await writeHandler!(mockEvent, {
      skillName: "test-skill",
      relativePath: "SKILL.md",
      content: "Version 1",
    });
    // 少し待ってタイムスタンプを変える
    await new Promise((resolve) => setTimeout(resolve, 10));
    await writeHandler!(mockEvent, {
      skillName: "test-skill",
      relativePath: "SKILL.md",
      content: "Version 2",
    });

    const backupsHandler = handlerMap.get(IPC_CHANNELS.SKILL_LIST_BACKUPS);
    const result = await backupsHandler!(mockEvent, {
      skillName: "test-skill",
    });
    expect(result.success).toBe(true);

    const backups = result.data.filter(
      (b: { type: string }) => b.type === "backup",
    );
    expect(backups.length).toBeGreaterThanOrEqual(2);

    // タイムスタンプが降順（最新が先頭）であることを確認
    for (let i = 0; i < backups.length - 1; i++) {
      expect(backups[i].timestamp).toBeGreaterThanOrEqual(
        backups[i + 1].timestamp,
      );
    }
  });

  // IE-04
  it("deleteFile → restoreBackup → deleteFile: 復元後の再削除", async () => {
    // 1. 削除
    const deleteHandler = handlerMap.get(IPC_CHANNELS.SKILL_DELETE_FILE);
    const deleteResult1 = await deleteHandler!(mockEvent, {
      skillName: "test-skill",
      relativePath: "SKILL.md",
    });
    expect(deleteResult1.success).toBe(true);

    // 2. バックアップ一覧取得
    const backupsHandler = handlerMap.get(IPC_CHANNELS.SKILL_LIST_BACKUPS);
    const backupsResult = await backupsHandler!(mockEvent, {
      skillName: "test-skill",
    });
    const deletedEntry = backupsResult.data.find(
      (b: { type: string }) => b.type === "deleted",
    );
    expect(deletedEntry).toBeDefined();

    // 3. 復元
    const restoreHandler = handlerMap.get(IPC_CHANNELS.SKILL_RESTORE_BACKUP);
    const restoreResult = await restoreHandler!(mockEvent, {
      skillName: "test-skill",
      backupPath: deletedEntry.relativePath,
    });
    expect(restoreResult.success).toBe(true);

    // 4. 読み込み確認
    const readHandler = handlerMap.get(IPC_CHANNELS.SKILL_READ_FILE);
    const readResult = await readHandler!(mockEvent, {
      skillName: "test-skill",
      relativePath: "SKILL.md",
    });
    expect(readResult.success).toBe(true);

    // 5. 再削除
    const deleteResult2 = await deleteHandler!(mockEvent, {
      skillName: "test-skill",
      relativePath: "SKILL.md",
    });
    expect(deleteResult2.success).toBe(true);
  });
});
