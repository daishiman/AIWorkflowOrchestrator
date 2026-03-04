/**
 * @file agentSlice スキル統合テスト
 * @description TASK-FIX-6-1-STATE-CENTRALIZATION Phase 6: テスト拡充
 * @testIds TS-6-1-57〜TS-6-1-80
 * @feature skill-import-agent-system
 */

import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { createAgentSlice, type AgentSlice } from "../agentSlice";
import type {
  SkillMetadata,
  ImportedSkill,
  SkillStreamMessage,
  SkillPermissionRequest,
} from "@repo/shared";

// ==========================================================================
// モックデータ
// ==========================================================================

const createMockSkillMetadata = (name: string): SkillMetadata => ({
  name,
  description: `${name}の説明`,
  path: `~/.claude/skills/${name}`,
  updatedAt: new Date("2026-01-01"),
  agents: [],
  references: [],
  scripts: [],
  assets: [],
  schemas: [],
  indexes: [],
  otherFiles: [],
});

const mockAvailableSkills: SkillMetadata[] = [
  createMockSkillMetadata("test-skill-1"),
  createMockSkillMetadata("test-skill-2"),
];

const mockImportedSkills: ImportedSkill[] = [
  {
    ...mockAvailableSkills[0],
    importedAt: new Date("2026-01-10"),
    status: "active",
  },
];

const mockStreamMessage: SkillStreamMessage = {
  executionId: "exec-123",
  type: "assistant",
  content: { text: "テストメッセージ", isPartial: false },
  timestamp: Date.now(),
};

const mockPermissionRequest: SkillPermissionRequest = {
  executionId: "exec-123",
  requestId: "req-456",
  toolName: "Bash",
  args: { command: "ls -la" },
};

// ==========================================================================
// ヘルパー関数
// ==========================================================================

/**
 * テスト用ストアを作成
 * 注意: storeオブジェクトは直接変更されるため、
 * set()を通じた状態更新が正しく反映される
 */
function createTestStore(): AgentSlice {
  // store オブジェクトを保持する参照
  const storeRef: { current: AgentSlice | null } = { current: null };

  const mockSet = (
    fn: ((state: AgentSlice) => Partial<AgentSlice>) | Partial<AgentSlice>,
  ) => {
    if (!storeRef.current) return;
    const partial =
      typeof fn === "function"
        ? fn(storeRef.current)
        : (fn as Partial<AgentSlice>);
    // 元のオブジェクトを直接更新（参照を維持）
    Object.assign(storeRef.current, partial);
  };

  const mockGet = () => storeRef.current!;

  // 初期スライスを作成
  const initialStore = createAgentSlice(
    mockSet as never,
    mockGet as never,
    {} as never,
  );

  // 参照を設定
  storeRef.current = initialStore;

  return initialStore;
}

interface MockElectronAPIOptions {
  skillList?: SkillMetadata[];
  skillListError?: Error;
  skillGetImported?: ImportedSkill[];
  skillImport?: ImportedSkill;
  skillImportError?: Error;
  skillExecute?: { executionId: string; success: boolean };
  skillExecuteError?: Error;
  skillAbort?: () => void;
}

function setupMockElectronAPI(options: MockElectronAPIOptions = {}) {
  const mockSkillAPI = {
    list: options.skillListError
      ? vi.fn().mockRejectedValue(options.skillListError)
      : vi.fn().mockResolvedValue(options.skillList ?? mockAvailableSkills),
    getImported: vi
      .fn()
      .mockResolvedValue(options.skillGetImported ?? mockImportedSkills),
    rescan: vi.fn().mockResolvedValue(options.skillList ?? mockAvailableSkills),
    import: options.skillImportError
      ? vi.fn().mockRejectedValue(options.skillImportError)
      : vi.fn().mockResolvedValue(
          options.skillImport ?? {
            ...mockAvailableSkills[0],
            importedAt: new Date(),
            status: "active",
          },
        ),
    remove: vi.fn().mockResolvedValue(undefined),
    execute: options.skillExecuteError
      ? vi.fn().mockRejectedValue(options.skillExecuteError)
      : vi
          .fn()
          .mockResolvedValue(
            options.skillExecute ?? { executionId: "exec-123", success: true },
          ),
    abort: options.skillAbort ?? vi.fn(),
    sendPermissionResponse: vi.fn(),
    onStream: vi.fn().mockReturnValue(() => {}),
    onComplete: vi.fn().mockReturnValue(() => {}),
    onError: vi.fn().mockReturnValue(() => {}),
    onPermissionRequest: vi.fn().mockReturnValue(() => {}),
  };

  (
    global as unknown as {
      window: { electronAPI: { skill: typeof mockSkillAPI } };
    }
  ).window = {
    electronAPI: {
      skill: mockSkillAPI,
    },
  };

  return mockSkillAPI;
}

// ==========================================================================
// テストスイート
// ==========================================================================

describe("agentSlice - スキル統合テスト（Phase 6）", () => {
  let store: AgentSlice;

  beforeEach(() => {
    store = createTestStore();
    setupMockElectronAPI();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // ==========================================================================
  // CAT-01: 初期状態テスト（TS-6-1-01〜TS-6-1-10）
  // ==========================================================================
  describe("CAT-01: 初期状態テスト", () => {
    it("TS-6-1-01: availableSkillsMetadataの初期値は空配列", () => {
      expect(store.availableSkillsMetadata).toEqual([]);
    });

    it("TS-6-1-02: importedSkillsの初期値は空配列", () => {
      expect(store.importedSkills).toEqual([]);
    });

    it("TS-6-1-03: selectedSkillNameの初期値はnull", () => {
      expect(store.selectedSkillName).toBeNull();
    });

    it("TS-6-1-04: skillExecutionStatusの初期値はnull", () => {
      expect(store.skillExecutionStatus).toBeNull();
    });

    it("TS-6-1-05: streamingMessagesの初期値は空配列", () => {
      expect(store.streamingMessages).toEqual([]);
    });

    it("TS-6-1-06: pendingPermissionの初期値はnull", () => {
      expect(store.pendingPermission).toBeNull();
    });

    it("TS-6-1-07: skillErrorの初期値はnull", () => {
      expect(store.skillError).toBeNull();
    });

    it("TS-6-1-08: isLoadingSkillsの初期値はfalse", () => {
      expect(store.isLoadingSkills).toBe(false);
    });

    it("TS-6-1-09: isScanningの初期値はfalse", () => {
      expect(store.isScanning).toBe(false);
    });

    it("TS-6-1-10: isImportingの初期値はfalse", () => {
      expect(store.isImporting).toBe(false);
    });
  });

  // ==========================================================================
  // 境界値テスト（TS-6-1-57〜TS-6-1-63）
  // ==========================================================================
  describe("境界値テスト", () => {
    describe("fetchSkills - 境界値", () => {
      it("TS-6-1-57: 空配列が返された場合の処理", async () => {
        setupMockElectronAPI({
          skillList: [],
          skillGetImported: [],
        });

        await store.fetchSkills();

        expect(store.availableSkillsMetadata).toEqual([]);
        expect(store.importedSkills).toEqual([]);
        expect(store.isLoadingSkills).toBe(false);
      });

      it("TS-6-1-58: 大量のスキル（100件）が返された場合の処理", async () => {
        const manySkills = Array.from({ length: 100 }, (_, i) =>
          createMockSkillMetadata(`skill-${i}`),
        );
        setupMockElectronAPI({
          skillList: manySkills,
          skillGetImported: [],
        });

        await store.fetchSkills();

        expect(store.availableSkillsMetadata).toHaveLength(100);
      });
    });

    describe("streamingMessages - 境界値", () => {
      it("TS-6-1-59: 空のメッセージコンテンツの処理", () => {
        const emptyMessage: SkillStreamMessage = {
          executionId: "exec-123",
          type: "assistant",
          content: { text: "", isPartial: false },
          timestamp: Date.now(),
        };

        store._handleStreamMessage(emptyMessage);

        expect(store.streamingMessages).toHaveLength(1);
        expect(store.streamingMessages[0].content.text).toBe("");
      });

      it("TS-6-1-60: 大量のメッセージ（1000件）の蓄積", () => {
        for (let i = 0; i < 1000; i++) {
          store._handleStreamMessage({
            executionId: "exec-123",
            type: "assistant",
            content: { text: `message-${i}`, isPartial: false },
            timestamp: Date.now() + i,
          });
        }

        expect(store.streamingMessages).toHaveLength(1000);
        expect(store.streamingMessages[0].content.text).toBe("message-0");
        expect(store.streamingMessages[999].content.text).toBe("message-999");
      });

      it("TS-6-1-61: 非常に長いメッセージコンテンツの処理", () => {
        const longText = "a".repeat(100000); // 100KB
        const longMessage: SkillStreamMessage = {
          executionId: "exec-123",
          type: "assistant",
          content: { text: longText, isPartial: false },
          timestamp: Date.now(),
        };

        store._handleStreamMessage(longMessage);

        expect(store.streamingMessages[0].content.text.length).toBe(100000);
      });
    });

    describe("skillName - 境界値", () => {
      it("TS-6-1-62: 空文字列のスキル名選択", () => {
        store.selectSkillByName("");

        expect(store.selectedSkillName).toBe("");
      });

      it("TS-6-1-63: 特殊文字を含むスキル名の処理", async () => {
        store.selectedSkillName = "skill-with-特殊-characters_123";
        setupMockElectronAPI({
          skillExecute: { executionId: "exec-special", success: true },
        });

        await store.executeSkill("test prompt");

        expect(store.executionId).toBe("exec-special");
      });
    });
  });

  // ==========================================================================
  // エラーケーステスト（TS-6-1-64〜TS-6-1-73）
  // ==========================================================================
  describe("エラーケーステスト", () => {
    describe("fetchSkills - エラーハンドリング", () => {
      it("TS-6-1-64: electronAPIが未定義の場合", async () => {
        (global as unknown as { window: { electronAPI: undefined } }).window = {
          electronAPI: undefined,
        };

        await store.fetchSkills();

        expect(store.skillError).toContain("Skill API not available");
        expect(store.isLoadingSkills).toBe(false);
      });

      it("TS-6-1-65: skill.listが未定義の場合", async () => {
        (
          global as unknown as {
            window: { electronAPI: { skill: Record<string, never> } };
          }
        ).window = {
          electronAPI: { skill: {} },
        };

        await store.fetchSkills();

        expect(store.skillError).toBeDefined();
        expect(store.isLoadingSkills).toBe(false);
      });

      it("TS-6-1-66: ネットワークエラーの場合", async () => {
        setupMockElectronAPI({
          skillListError: new Error("Network error"),
        });

        await store.fetchSkills();

        expect(store.skillError).toContain("スキル一覧の取得に失敗");
        expect(store.skillError).toContain("Network error");
      });

      it("TS-6-1-67: タイムアウトエラーの場合", async () => {
        setupMockElectronAPI({
          skillListError: new Error("Timeout"),
        });

        await store.fetchSkills();

        expect(store.skillError).toContain("スキル一覧の取得に失敗");
      });
    });

    describe("importSkill - エラーハンドリング", () => {
      it("TS-6-1-68: 存在しないスキルのインポート", async () => {
        setupMockElectronAPI({
          skillImportError: new Error("Skill not found"),
        });

        await store.importSkill("non-existent-skill");

        expect(store.skillError).toContain("スキルのインポートに失敗");
        expect(store.isImporting).toBe(false);
      });

      it("TS-6-1-69: 既にインポート済みのスキルは再インポートAPIを呼ばない", async () => {
        store.importedSkills = [...mockImportedSkills];
        const skillApi = setupMockElectronAPI({
          skillImportError: new Error("Already imported"),
        });

        await store.importSkill("test-skill-1");

        expect(skillApi.import).not.toHaveBeenCalled();
        expect(store.skillError).toBeNull();
        expect(store.importedSkills).toEqual(mockImportedSkills);
      });
    });

    describe("executeSkill - エラーハンドリング", () => {
      it("TS-6-1-70: 実行中に接続が切断された場合", async () => {
        store.selectedSkillName = "test-skill-1";
        setupMockElectronAPI({
          skillExecuteError: new Error("Connection lost"),
        });

        await store.executeSkill("test prompt");

        expect(store.skillExecutionStatus).toBe("error");
        expect(store.skillError).toContain("実行開始に失敗");
      });

      it("TS-6-1-71: 実行中にスキルが削除された場合", async () => {
        store.selectedSkillName = "test-skill-1";
        store.isExecuting = true;
        store.importedSkills = [...mockImportedSkills];

        await store.removeSkill("test-skill-1");

        expect(store.selectedSkillName).toBeNull();
      });

      it("TS-6-1-72: 権限リクエスト中のタイムアウト", () => {
        store.pendingPermission = mockPermissionRequest;
        store.skillExecutionStatus = "permission_pending";

        store._handleError("exec-123", "Permission request timed out");

        expect(store.skillExecutionStatus).toBe("error");
      });
    });

    describe("removeSkill - エラーハンドリング", () => {
      it("TS-6-1-73: 削除中にエラーが発生した場合", async () => {
        store.importedSkills = [...mockImportedSkills];
        (
          global as unknown as {
            window: {
              electronAPI: { skill: { remove: ReturnType<typeof vi.fn> } };
            };
          }
        ).window = {
          electronAPI: {
            skill: {
              remove: vi.fn().mockRejectedValue(new Error("Delete failed")),
            },
          },
        };

        await store.removeSkill("test-skill-1");

        expect(store.skillError).toContain("スキルの削除に失敗");
        expect(store.importedSkills).toEqual(mockImportedSkills);
      });
    });
  });

  // ==========================================================================
  // 並行処理テスト（TS-6-1-74〜TS-6-1-80）
  // ==========================================================================
  describe("並行処理テスト", () => {
    describe("並行メッセージ受信", () => {
      it("TS-6-1-74: 複数の実行IDからのメッセージ混在", () => {
        store.executionId = "exec-current";

        const msg1: SkillStreamMessage = {
          executionId: "exec-current",
          type: "assistant",
          content: { text: "current message", isPartial: false },
          timestamp: 1,
        };
        const msg2: SkillStreamMessage = {
          executionId: "exec-old",
          type: "assistant",
          content: { text: "old message", isPartial: false },
          timestamp: 2,
        };

        store._handleStreamMessage(msg1);
        store._handleStreamMessage(msg2);

        expect(store.streamingMessages).toHaveLength(2);
      });

      it("TS-6-1-75: 高頻度メッセージ受信（100ms間隔で100件）", () => {
        const messages: SkillStreamMessage[] = [];

        for (let i = 0; i < 100; i++) {
          messages.push({
            executionId: "exec-123",
            type: "assistant",
            content: { text: `msg-${i}`, isPartial: i < 99 },
            timestamp: Date.now() + i,
          });
        }

        messages.forEach((msg) => store._handleStreamMessage(msg));

        expect(store.streamingMessages).toHaveLength(100);
      });
    });

    describe("中断時のクリーンアップ", () => {
      it("TS-6-1-76: 実行中に中断した場合、状態がリセットされる", () => {
        store.isExecuting = true;
        store.executionId = "exec-123";
        store.skillExecutionStatus = "running";
        store.streamingMessages = [mockStreamMessage];
        setupMockElectronAPI();

        store.abortExecution();

        expect(store.isExecuting).toBe(false);
        expect(store.skillExecutionStatus).toBe("cancelled");
      });

      it("TS-6-1-77: 権限待ち中に中断した場合", () => {
        store.isExecuting = true;
        store.executionId = "exec-123";
        store.skillExecutionStatus = "permission_pending";
        store.pendingPermission = mockPermissionRequest;
        setupMockElectronAPI();

        store.abortExecution();

        expect(store.isExecuting).toBe(false);
        expect(store.skillExecutionStatus).toBe("cancelled");
      });

      it("TS-6-1-78: 中断後に新しい実行を開始できる", async () => {
        store.isExecuting = true;
        store.executionId = "exec-old";
        store.skillExecutionStatus = "running";
        store.selectedSkillName = "test-skill-1";
        setupMockElectronAPI({
          skillExecute: { executionId: "exec-new", success: true },
        });

        store.abortExecution();
        await store.executeSkill("new prompt");

        expect(store.executionId).toBe("exec-new");
        expect(store.isExecuting).toBe(true);
      });
    });

    describe("連続操作", () => {
      it("TS-6-1-79: fetchSkillsの連続呼び出し", async () => {
        setupMockElectronAPI({
          skillList: mockAvailableSkills,
          skillGetImported: mockImportedSkills,
        });

        await Promise.all([
          store.fetchSkills(),
          store.fetchSkills(),
          store.fetchSkills(),
        ]);

        expect(store.availableSkillsMetadata).toEqual(mockAvailableSkills);
        expect(store.isLoadingSkills).toBe(false);
      });

      it("TS-6-1-80: importとremoveの連続操作", async () => {
        store.availableSkillsMetadata = [...mockAvailableSkills];
        setupMockElectronAPI({
          skillImport: mockImportedSkills[0],
        });

        await store.importSkill("test-skill-1");
        await store.removeSkill("test-skill-1");

        expect(store.importedSkills).toEqual([]);
      });
    });
  });

  // ==========================================================================
  // CAT-07: スキル実行テスト（race condition対策）
  // ==========================================================================
  describe("CAT-07: スキル実行テスト（race condition対策）", () => {
    it("TS-6-1-28: executeSkillメソッドが存在する", () => {
      expect(typeof store.executeSkill).toBe("function");
    });

    it("TS-6-1-29: executeSkill呼び出し前にexecutionIdが事前生成される", async () => {
      store.selectedSkillName = "test-skill-1";
      store.importedSkills = mockImportedSkills;
      setupMockElectronAPI({
        skillExecute: { executionId: "server-exec-123", success: true },
      });

      const executePromise = store.executeSkill("テストプロンプト");

      // IPC呼び出し前にexecutionIdが設定されていることを確認
      expect(store.executionId).not.toBeNull();
      expect(store.executionId).toMatch(/^[a-f0-9-]{36}$/); // UUID形式

      await executePromise;
    });

    it("TS-6-1-30: executeSkill呼び出し直後にisExecutingがtrueになる", async () => {
      store.selectedSkillName = "test-skill-1";
      store.importedSkills = mockImportedSkills;
      setupMockElectronAPI();

      const executePromise = store.executeSkill("テストプロンプト");

      expect(store.isExecuting).toBe(true);

      await executePromise;
    });

    it("TS-6-1-31: executeSkill呼び出し直後にstreamingMessagesがクリアされる", async () => {
      store.selectedSkillName = "test-skill-1";
      store.importedSkills = mockImportedSkills;
      store.streamingMessages = [mockStreamMessage];
      setupMockElectronAPI();

      const executePromise = store.executeSkill("テストプロンプト");

      expect(store.streamingMessages).toEqual([]);

      await executePromise;
    });

    it("TS-6-1-32: executeSkill呼び出し直後にskillExecutionStatusがrunningになる", async () => {
      store.selectedSkillName = "test-skill-1";
      store.importedSkills = mockImportedSkills;
      setupMockElectronAPI();

      const executePromise = store.executeSkill("テストプロンプト");

      expect(store.skillExecutionStatus).toBe("running");

      await executePromise;
    });

    it("TS-6-1-33: IPC応答後にexecutionIdがサーバー値で更新される", async () => {
      store.selectedSkillName = "test-skill-1";
      store.importedSkills = mockImportedSkills;
      setupMockElectronAPI({
        skillExecute: { executionId: "server-exec-456", success: true },
      });

      await store.executeSkill("テストプロンプト");

      expect(store.executionId).toBe("server-exec-456");
    });

    it("TS-6-1-34: selectedSkillNameがnullの場合、executeSkillは早期リターンする", async () => {
      store.selectedSkillName = null;
      setupMockElectronAPI();

      await store.executeSkill("テストプロンプト");

      expect(store.isExecuting).toBe(false);
    });

    it("TS-6-1-35: executeSkill失敗時にskillExecutionStatusがerrorになる", async () => {
      store.selectedSkillName = "test-skill-1";
      store.importedSkills = mockImportedSkills;
      setupMockElectronAPI({
        skillExecuteError: new Error("実行失敗"),
      });

      await store.executeSkill("テストプロンプト");

      expect(store.skillExecutionStatus).toBe("error");
      expect(store.skillError).toContain("実行開始に失敗");
    });
  });

  // ==========================================================================
  // CAT-09: ストリームハンドラテスト
  // ==========================================================================
  describe("CAT-09: ストリームハンドラテスト", () => {
    it("TS-6-1-40: _handleStreamMessageメソッドが存在する", () => {
      expect(typeof store._handleStreamMessage).toBe("function");
    });

    it("TS-6-1-41: _handleStreamMessage呼び出し時にstreamingMessagesに追加される", () => {
      store._handleStreamMessage(mockStreamMessage);

      expect(store.streamingMessages).toContainEqual(mockStreamMessage);
    });

    it("TS-6-1-42: 複数の_handleStreamMessage呼び出しで順序が維持される", () => {
      const msg1 = { ...mockStreamMessage, timestamp: 1 };
      const msg2 = { ...mockStreamMessage, timestamp: 2 };

      store._handleStreamMessage(msg1);
      store._handleStreamMessage(msg2);

      expect(store.streamingMessages).toHaveLength(2);
      expect(store.streamingMessages[0].timestamp).toBe(1);
      expect(store.streamingMessages[1].timestamp).toBe(2);
    });

    it("TS-6-1-43: _handleCompleteメソッドが存在する", () => {
      expect(typeof store._handleComplete).toBe("function");
    });

    it("TS-6-1-44: _handleComplete呼び出し時にisExecutingがfalseになる", () => {
      store.isExecuting = true;

      store._handleComplete("exec-123");

      expect(store.isExecuting).toBe(false);
    });

    it("TS-6-1-45: _handleComplete呼び出し時にskillExecutionStatusがcompletedになる", () => {
      store.skillExecutionStatus = "running";

      store._handleComplete("exec-123");

      expect(store.skillExecutionStatus).toBe("completed");
    });

    it("TS-6-1-46: _handleErrorメソッドが存在する", () => {
      expect(typeof store._handleError).toBe("function");
    });

    it("TS-6-1-47: _handleError呼び出し時にisExecutingがfalseになる", () => {
      store.isExecuting = true;

      store._handleError("exec-123", "エラーメッセージ");

      expect(store.isExecuting).toBe(false);
    });

    it("TS-6-1-48: _handleError呼び出し時にskillExecutionStatusがerrorになる", () => {
      store.skillExecutionStatus = "running";

      store._handleError("exec-123", "エラーメッセージ");

      expect(store.skillExecutionStatus).toBe("error");
    });

    it("TS-6-1-49: _handleError呼び出し時にskillErrorが設定される", () => {
      store._handleError("exec-123", "テストエラー");

      expect(store.skillError).toBe("テストエラー");
    });
  });

  // ==========================================================================
  // CAT-10: 権限管理テスト
  // ==========================================================================
  describe("CAT-10: 権限管理テスト", () => {
    it("TS-6-1-50: _handlePermissionRequestメソッドが存在する", () => {
      expect(typeof store._handlePermissionRequest).toBe("function");
    });

    it("TS-6-1-51: _handlePermissionRequest呼び出し時にpendingPermissionが設定される", () => {
      store._handlePermissionRequest(mockPermissionRequest);

      expect(store.pendingPermission).toEqual(mockPermissionRequest);
    });

    it("TS-6-1-52: _handlePermissionRequest呼び出し時にskillExecutionStatusがpermission_pendingになる", () => {
      store.skillExecutionStatus = "running";

      store._handlePermissionRequest(mockPermissionRequest);

      expect(store.skillExecutionStatus).toBe("permission_pending");
    });

    it("TS-6-1-53: respondToSkillPermissionメソッドが存在する", () => {
      expect(typeof store.respondToSkillPermission).toBe("function");
    });

    it("TS-6-1-54: respondToSkillPermission(true)呼び出し時にpendingPermissionがnullになる", () => {
      store.pendingPermission = mockPermissionRequest;
      setupMockElectronAPI();

      store.respondToSkillPermission(true);

      expect(store.pendingPermission).toBeNull();
    });

    it("TS-6-1-55: respondToSkillPermission(false)呼び出し時にpendingPermissionがnullになる", () => {
      store.pendingPermission = mockPermissionRequest;
      setupMockElectronAPI();

      store.respondToSkillPermission(false);

      expect(store.pendingPermission).toBeNull();
    });

    it("TS-6-1-56: pendingPermissionがnullの場合、IPCは呼び出されない", () => {
      store.pendingPermission = null;
      const mockSendPermissionResponse = vi.fn();
      (
        global as unknown as {
          window: {
            electronAPI: {
              skill: {
                sendPermissionResponse: typeof mockSendPermissionResponse;
              };
            };
          };
        }
      ).window = {
        electronAPI: {
          skill: { sendPermissionResponse: mockSendPermissionResponse },
        },
      };

      store.respondToSkillPermission(true);

      expect(mockSendPermissionResponse).not.toHaveBeenCalled();
    });
  });
});
