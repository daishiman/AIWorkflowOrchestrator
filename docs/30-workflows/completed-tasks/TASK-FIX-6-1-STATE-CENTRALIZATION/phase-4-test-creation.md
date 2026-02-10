# Phase 4: テスト作成（TDD: Red）

## メタ情報

| 項目     | 値                                |
| -------- | --------------------------------- |
| Phase    | 4                                 |
| タスクID | TASK-FIX-6-1-STATE-CENTRALIZATION |
| 機能名   | state-centralization              |
| 作成日   | 2026-02-09                        |
| 分類     | リファクタリング                  |

## 目的

skillSliceからagentSliceへの状態統合に関するテストを、実装より先に作成する（TDD Red状態）。

テストは以下の観点で設計:

1. 統合後の状態構造が正しいこと
2. 既存のagentSlice機能が維持されること
3. skillSliceの機能がagentSliceに正しく移行されること
4. race condition対策（executionId事前生成）が機能すること

## 実行タスク

- **Task 4-1**: テストシナリオ設計 - 受け入れ基準からテストシナリオを導出
- **Task 4-2**: 状態統合テスト作成 - 統合後の状態構造のユニットテスト
- **Task 4-3**: アクション移行テスト作成 - skillSliceアクションのagentSlice移行テスト
- **Task 4-4**: race condition対策テスト作成 - executionId事前生成のテスト
- **Task 4-5**: IPCリスナー統合テスト作成 - setupSkillListenersの統合テスト

## 参照資料

| 資料名               | パス                                                                    | 説明                |
| -------------------- | ----------------------------------------------------------------------- | ------------------- |
| 既存agentSlice       | `apps/desktop/src/renderer/store/slices/agentSlice.ts`                  | 統合先のSlice       |
| 既存skillSlice       | `apps/desktop/src/renderer/store/slices/skillSlice.ts`                  | 統合元のSlice       |
| 既存skillSliceテスト | `apps/desktop/src/renderer/store/slices/__tests__/skillSlice.*.test.ts` | 既存テスト          |
| 既存authSliceテスト  | `apps/desktop/src/renderer/store/slices/authSlice.test.ts`              | テストパターン参考  |
| 共有型定義           | `packages/shared/src/types/skill.ts`                                    | SkillMetadata等の型 |

## 実行手順

### ステップ1: テストファイル作成

新規テストファイルを作成する:

```bash
# ファイルパス
apps/desktop/src/renderer/store/slices/__tests__/agentSlice.skill-integration.test.ts
```

### ステップ2: モックデータ定義

以下のモックデータを定義する:

```typescript
import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import type {
  SkillMetadata,
  ImportedSkill,
  SkillStreamMessage,
  SkillPermissionRequest,
  SkillExecutionStatus,
} from "@repo/shared";

// ==========================================================================
// モックデータ
// ==========================================================================

const mockAvailableSkills: SkillMetadata[] = [
  {
    name: "test-skill-1",
    description: "テストスキル1の説明",
    path: "~/.claude/skills/test-skill-1",
    updatedAt: new Date("2026-01-01"),
    agents: [],
    references: [],
    scripts: [],
    assets: [],
    schemas: [],
    indexes: [],
    otherFiles: [],
  },
  {
    name: "test-skill-2",
    description: "テストスキル2の説明",
    path: "~/.claude/skills/test-skill-2",
    updatedAt: new Date("2026-01-02"),
    agents: [],
    references: [],
    scripts: [],
    assets: [],
    schemas: [],
    indexes: [],
    otherFiles: [],
  },
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
```

### ステップ3: 状態統合テスト作成（Task 4-2）

以下のテストケースを作成する:

```typescript
describe("agentSlice - スキル状態統合", () => {
  describe("統合後の初期状態", () => {
    it("TS-6-1-01: availableSkillsMetadataの初期値は空配列", () => {
      // Arrange
      const store = createTestStore();

      // Assert
      expect(store.availableSkillsMetadata).toEqual([]);
    });

    it("TS-6-1-02: importedSkillsの初期値は空配列", () => {
      const store = createTestStore();
      expect(store.importedSkills).toEqual([]);
    });

    it("TS-6-1-03: selectedSkillNameの初期値はnull", () => {
      const store = createTestStore();
      expect(store.selectedSkillName).toBeNull();
    });

    it("TS-6-1-04: skillExecutionStatusの初期値はnull", () => {
      const store = createTestStore();
      expect(store.skillExecutionStatus).toBeNull();
    });

    it("TS-6-1-05: streamingMessagesの初期値は空配列", () => {
      const store = createTestStore();
      expect(store.streamingMessages).toEqual([]);
    });

    it("TS-6-1-06: pendingPermissionの初期値はnull", () => {
      const store = createTestStore();
      expect(store.pendingPermission).toBeNull();
    });

    it("TS-6-1-07: skillErrorの初期値はnull", () => {
      const store = createTestStore();
      expect(store.skillError).toBeNull();
    });

    it("TS-6-1-08: isLoadingSkillsの初期値はfalse", () => {
      const store = createTestStore();
      expect(store.isLoadingSkills).toBe(false);
    });

    it("TS-6-1-09: isScanningの初期値はfalse", () => {
      const store = createTestStore();
      expect(store.isScanning).toBe(false);
    });

    it("TS-6-1-10: isImportingの初期値はfalse", () => {
      const store = createTestStore();
      expect(store.isImporting).toBe(false);
    });
  });

  describe("既存agentSlice状態との共存", () => {
    it("TS-6-1-11: 既存のskills配列が維持される", () => {
      const store = createTestStore();
      expect(store.skills).toBeDefined();
      expect(Array.isArray(store.skills)).toBe(true);
    });

    it("TS-6-1-12: 既存のexecutionStateが維持される", () => {
      const store = createTestStore();
      expect(store.executionState).toBeDefined();
      expect(store.executionState.status).toBe("idle");
    });

    it("TS-6-1-13: 既存のpreviewContentが維持される", () => {
      const store = createTestStore();
      expect("previewContent" in store).toBe(true);
    });
  });
});
```

### ステップ4: アクション移行テスト作成（Task 4-3）

以下のテストケースを作成する:

```typescript
describe("agentSlice - スキルアクション", () => {
  describe("fetchSkills", () => {
    it("TS-6-1-14: fetchSkillsメソッドが存在する", () => {
      const store = createTestStore();
      expect(typeof store.fetchSkills).toBe("function");
    });

    it("TS-6-1-15: fetchSkills呼び出し時にisLoadingSkillsがtrueになる", async () => {
      const store = createTestStore();
      setupMockElectronAPI();

      const fetchPromise = store.fetchSkills();
      expect(store.isLoadingSkills).toBe(true);

      await fetchPromise;
    });

    it("TS-6-1-16: fetchSkills成功時にavailableSkillsMetadataが設定される", async () => {
      const store = createTestStore();
      setupMockElectronAPI({
        skillList: mockAvailableSkills,
        skillGetImported: mockImportedSkills,
      });

      await store.fetchSkills();

      expect(store.availableSkillsMetadata).toEqual(mockAvailableSkills);
    });

    it("TS-6-1-17: fetchSkills成功時にimportedSkillsが設定される", async () => {
      const store = createTestStore();
      setupMockElectronAPI({
        skillList: mockAvailableSkills,
        skillGetImported: mockImportedSkills,
      });

      await store.fetchSkills();

      expect(store.importedSkills).toEqual(mockImportedSkills);
    });

    it("TS-6-1-18: fetchSkills失敗時にskillErrorが設定される", async () => {
      const store = createTestStore();
      setupMockElectronAPI({
        skillListError: new Error("API error"),
      });

      await store.fetchSkills();

      expect(store.skillError).toContain("スキル一覧の取得に失敗");
    });
  });

  describe("importSkill", () => {
    it("TS-6-1-19: importSkillメソッドが存在する", () => {
      const store = createTestStore();
      expect(typeof store.importSkill).toBe("function");
    });

    it("TS-6-1-20: importSkill呼び出し時にisImportingがtrueになる", async () => {
      const store = createTestStore();
      setupMockElectronAPI();

      const importPromise = store.importSkill("test-skill-1");
      expect(store.isImporting).toBe(true);

      await importPromise;
    });

    it("TS-6-1-21: importSkill成功時にimportedSkillsに追加される", async () => {
      const store = createTestStore();
      store.availableSkillsMetadata = mockAvailableSkills;
      setupMockElectronAPI({
        skillImport: mockImportedSkills[0],
      });

      await store.importSkill("test-skill-1");

      expect(store.importedSkills).toContainEqual(
        expect.objectContaining({ name: "test-skill-1" }),
      );
    });
  });

  describe("removeSkill", () => {
    it("TS-6-1-22: removeSkillメソッドが存在する", () => {
      const store = createTestStore();
      expect(typeof store.removeSkill).toBe("function");
    });

    it("TS-6-1-23: removeSkill成功時にimportedSkillsから削除される", async () => {
      const store = createTestStore();
      store.importedSkills = mockImportedSkills;
      setupMockElectronAPI();

      await store.removeSkill("test-skill-1");

      expect(store.importedSkills).not.toContainEqual(
        expect.objectContaining({ name: "test-skill-1" }),
      );
    });

    it("TS-6-1-24: 選択中のスキルが削除された場合、selectedSkillNameがnullになる", async () => {
      const store = createTestStore();
      store.importedSkills = mockImportedSkills;
      store.selectedSkillName = "test-skill-1";
      setupMockElectronAPI();

      await store.removeSkill("test-skill-1");

      expect(store.selectedSkillName).toBeNull();
    });
  });

  describe("selectSkillByName", () => {
    it("TS-6-1-25: selectSkillByNameメソッドが存在する", () => {
      const store = createTestStore();
      expect(typeof store.selectSkillByName).toBe("function");
    });

    it("TS-6-1-26: selectSkillByName呼び出し時にselectedSkillNameが設定される", () => {
      const store = createTestStore();

      store.selectSkillByName("test-skill-1");

      expect(store.selectedSkillName).toBe("test-skill-1");
    });

    it("TS-6-1-27: selectSkillByName(null)でselectedSkillNameがnullになる", () => {
      const store = createTestStore();
      store.selectedSkillName = "test-skill-1";

      store.selectSkillByName(null);

      expect(store.selectedSkillName).toBeNull();
    });
  });
});
```

### ステップ5: race condition対策テスト作成（Task 4-4）

以下のテストケースを作成する:

```typescript
describe("agentSlice - スキル実行（race condition対策）", () => {
  describe("executeSkill", () => {
    it("TS-6-1-28: executeSkillメソッドが存在する", () => {
      const store = createTestStore();
      expect(typeof store.executeSkill).toBe("function");
    });

    it("TS-6-1-29: executeSkill呼び出し前にexecutionIdが事前生成される", async () => {
      const store = createTestStore();
      store.selectedSkillName = "test-skill-1";
      store.importedSkills = mockImportedSkills;

      let capturedExecutionId: string | null = null;
      setupMockElectronAPI({
        skillExecute: async (params: {
          skillName: string;
          prompt: string;
          tempExecutionId?: string;
        }) => {
          capturedExecutionId = params.tempExecutionId ?? null;
          return { executionId: "server-exec-123", success: true };
        },
      });

      const executePromise = store.executeSkill("テストプロンプト");

      // IPC呼び出し前にexecutionIdが設定されていることを確認
      expect(store.executionId).not.toBeNull();
      expect(store.executionId).toMatch(/^[a-f0-9-]{36}$/); // UUID形式

      await executePromise;

      // tempExecutionIdがIPCに渡されたことを確認
      expect(capturedExecutionId).toBe(store.executionId);
    });

    it("TS-6-1-30: executeSkill呼び出し直後にisExecutingがtrueになる", async () => {
      const store = createTestStore();
      store.selectedSkillName = "test-skill-1";
      store.importedSkills = mockImportedSkills;
      setupMockElectronAPI();

      const executePromise = store.executeSkill("テストプロンプト");

      expect(store.isExecuting).toBe(true);

      await executePromise;
    });

    it("TS-6-1-31: executeSkill呼び出し直後にstreamingMessagesがクリアされる", async () => {
      const store = createTestStore();
      store.selectedSkillName = "test-skill-1";
      store.importedSkills = mockImportedSkills;
      store.streamingMessages = [mockStreamMessage];
      setupMockElectronAPI();

      const executePromise = store.executeSkill("テストプロンプト");

      expect(store.streamingMessages).toEqual([]);

      await executePromise;
    });

    it("TS-6-1-32: executeSkill呼び出し直後にskillExecutionStatusがrunningになる", async () => {
      const store = createTestStore();
      store.selectedSkillName = "test-skill-1";
      store.importedSkills = mockImportedSkills;
      setupMockElectronAPI();

      const executePromise = store.executeSkill("テストプロンプト");

      expect(store.skillExecutionStatus).toBe("running");

      await executePromise;
    });

    it("TS-6-1-33: IPC応答後にexecutionIdがサーバー値で更新される", async () => {
      const store = createTestStore();
      store.selectedSkillName = "test-skill-1";
      store.importedSkills = mockImportedSkills;
      setupMockElectronAPI({
        skillExecute: { executionId: "server-exec-456", success: true },
      });

      await store.executeSkill("テストプロンプト");

      expect(store.executionId).toBe("server-exec-456");
    });

    it("TS-6-1-34: selectedSkillNameがnullの場合、executeSkillは早期リターンする", async () => {
      const store = createTestStore();
      store.selectedSkillName = null;
      const mockExecute = vi.fn();
      setupMockElectronAPI({ skillExecute: mockExecute });

      await store.executeSkill("テストプロンプト");

      expect(mockExecute).not.toHaveBeenCalled();
      expect(store.isExecuting).toBe(false);
    });

    it("TS-6-1-35: executeSkill失敗時にskillExecutionStatusがerrorになる", async () => {
      const store = createTestStore();
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

  describe("abortExecution", () => {
    it("TS-6-1-36: abortExecutionメソッドが存在する", () => {
      const store = createTestStore();
      expect(typeof store.abortExecution).toBe("function");
    });

    it("TS-6-1-37: abortExecution呼び出し時にisExecutingがfalseになる", () => {
      const store = createTestStore();
      store.executionId = "exec-123";
      store.isExecuting = true;
      setupMockElectronAPI();

      store.abortExecution();

      expect(store.isExecuting).toBe(false);
    });

    it("TS-6-1-38: abortExecution呼び出し時にskillExecutionStatusがcancelledになる", () => {
      const store = createTestStore();
      store.executionId = "exec-123";
      store.isExecuting = true;
      store.skillExecutionStatus = "running";
      setupMockElectronAPI();

      store.abortExecution();

      expect(store.skillExecutionStatus).toBe("cancelled");
    });

    it("TS-6-1-39: executionIdがnullの場合、abortは呼び出されない", () => {
      const store = createTestStore();
      store.executionId = null;
      const mockAbort = vi.fn();
      setupMockElectronAPI({ skillAbort: mockAbort });

      store.abortExecution();

      expect(mockAbort).not.toHaveBeenCalled();
    });
  });
});
```

### ステップ6: IPCリスナー統合テスト作成（Task 4-5）

以下のテストケースを作成する:

```typescript
describe("agentSlice - IPCリスナーハンドラ", () => {
  describe("_handleStreamMessage", () => {
    it("TS-6-1-40: _handleStreamMessageメソッドが存在する", () => {
      const store = createTestStore();
      expect(typeof store._handleStreamMessage).toBe("function");
    });

    it("TS-6-1-41: _handleStreamMessage呼び出し時にstreamingMessagesに追加される", () => {
      const store = createTestStore();

      store._handleStreamMessage(mockStreamMessage);

      expect(store.streamingMessages).toContainEqual(mockStreamMessage);
    });

    it("TS-6-1-42: 複数の_handleStreamMessage呼び出しで順序が維持される", () => {
      const store = createTestStore();
      const msg1 = { ...mockStreamMessage, timestamp: 1 };
      const msg2 = { ...mockStreamMessage, timestamp: 2 };

      store._handleStreamMessage(msg1);
      store._handleStreamMessage(msg2);

      expect(store.streamingMessages).toHaveLength(2);
      expect(store.streamingMessages[0].timestamp).toBe(1);
      expect(store.streamingMessages[1].timestamp).toBe(2);
    });
  });

  describe("_handleComplete", () => {
    it("TS-6-1-43: _handleCompleteメソッドが存在する", () => {
      const store = createTestStore();
      expect(typeof store._handleComplete).toBe("function");
    });

    it("TS-6-1-44: _handleComplete呼び出し時にisExecutingがfalseになる", () => {
      const store = createTestStore();
      store.isExecuting = true;

      store._handleComplete("exec-123");

      expect(store.isExecuting).toBe(false);
    });

    it("TS-6-1-45: _handleComplete呼び出し時にskillExecutionStatusがcompletedになる", () => {
      const store = createTestStore();
      store.skillExecutionStatus = "running";

      store._handleComplete("exec-123");

      expect(store.skillExecutionStatus).toBe("completed");
    });
  });

  describe("_handleError", () => {
    it("TS-6-1-46: _handleErrorメソッドが存在する", () => {
      const store = createTestStore();
      expect(typeof store._handleError).toBe("function");
    });

    it("TS-6-1-47: _handleError呼び出し時にisExecutingがfalseになる", () => {
      const store = createTestStore();
      store.isExecuting = true;

      store._handleError("exec-123", "エラーメッセージ");

      expect(store.isExecuting).toBe(false);
    });

    it("TS-6-1-48: _handleError呼び出し時にskillExecutionStatusがerrorになる", () => {
      const store = createTestStore();
      store.skillExecutionStatus = "running";

      store._handleError("exec-123", "エラーメッセージ");

      expect(store.skillExecutionStatus).toBe("error");
    });

    it("TS-6-1-49: _handleError呼び出し時にskillErrorが設定される", () => {
      const store = createTestStore();

      store._handleError("exec-123", "テストエラー");

      expect(store.skillError).toBe("テストエラー");
    });
  });

  describe("_handlePermissionRequest", () => {
    it("TS-6-1-50: _handlePermissionRequestメソッドが存在する", () => {
      const store = createTestStore();
      expect(typeof store._handlePermissionRequest).toBe("function");
    });

    it("TS-6-1-51: _handlePermissionRequest呼び出し時にpendingPermissionが設定される", () => {
      const store = createTestStore();

      store._handlePermissionRequest(mockPermissionRequest);

      expect(store.pendingPermission).toEqual(mockPermissionRequest);
    });

    it("TS-6-1-52: _handlePermissionRequest呼び出し時にskillExecutionStatusがpermission_pendingになる", () => {
      const store = createTestStore();
      store.skillExecutionStatus = "running";

      store._handlePermissionRequest(mockPermissionRequest);

      expect(store.skillExecutionStatus).toBe("permission_pending");
    });
  });

  describe("respondToSkillPermission", () => {
    it("TS-6-1-53: respondToSkillPermissionメソッドが存在する", () => {
      const store = createTestStore();
      expect(typeof store.respondToSkillPermission).toBe("function");
    });

    it("TS-6-1-54: respondToSkillPermission(true)呼び出し時にpendingPermissionがnullになる", () => {
      const store = createTestStore();
      store.pendingPermission = mockPermissionRequest;
      setupMockElectronAPI();

      store.respondToSkillPermission(true);

      expect(store.pendingPermission).toBeNull();
    });

    it("TS-6-1-55: respondToSkillPermission(false)呼び出し時にpendingPermissionがnullになる", () => {
      const store = createTestStore();
      store.pendingPermission = mockPermissionRequest;
      setupMockElectronAPI();

      store.respondToSkillPermission(false);

      expect(store.pendingPermission).toBeNull();
    });

    it("TS-6-1-56: pendingPermissionがnullの場合、IPCは呼び出されない", () => {
      const store = createTestStore();
      store.pendingPermission = null;
      const mockSendPermission = vi.fn();
      setupMockElectronAPI({ skillSendPermissionResponse: mockSendPermission });

      store.respondToSkillPermission(true);

      expect(mockSendPermission).not.toHaveBeenCalled();
    });
  });
});
```

### ステップ7: ヘルパー関数作成

テストで使用するヘルパー関数を作成する:

```typescript
// ==========================================================================
// テストヘルパー
// ==========================================================================

/**
 * テスト用ストア作成
 */
function createTestStore(): AgentSlice {
  let internalState: Partial<AgentSlice> = {};

  const set = (
    fn: ((state: AgentSlice) => Partial<AgentSlice>) | Partial<AgentSlice>,
  ) => {
    const partial =
      typeof fn === "function" ? fn(internalState as AgentSlice) : fn;
    internalState = { ...internalState, ...partial };
    Object.assign(store, internalState);
  };

  const get = () => internalState as AgentSlice;

  const store = createAgentSlice(set as never, get as never, {} as never);
  return store;
}

/**
 * ElectronAPI モックセットアップ
 */
interface MockElectronAPIOptions {
  skillList?: SkillMetadata[];
  skillListError?: Error;
  skillGetImported?: ImportedSkill[];
  skillImport?: ImportedSkill;
  skillImportError?: Error;
  skillExecute?:
    | { executionId: string; success: boolean }
    | ((params: {
        skillName: string;
        prompt: string;
        tempExecutionId?: string;
      }) => Promise<{ executionId: string; success: boolean }>);
  skillExecuteError?: Error;
  skillAbort?: () => void;
  skillSendPermissionResponse?: (params: {
    requestId: string;
    approved: boolean;
    rememberChoice?: boolean;
  }) => void;
}

function setupMockElectronAPI(options: MockElectronAPIOptions = {}): void {
  const mockSkillAPI = {
    list: options.skillListError
      ? vi.fn().mockRejectedValue(options.skillListError)
      : vi.fn().mockResolvedValue(options.skillList ?? []),
    getImported: vi.fn().mockResolvedValue(options.skillGetImported ?? []),
    import: options.skillImportError
      ? vi.fn().mockRejectedValue(options.skillImportError)
      : vi.fn().mockResolvedValue(options.skillImport ?? mockImportedSkills[0]),
    remove: vi.fn().mockResolvedValue(undefined),
    execute: options.skillExecuteError
      ? vi.fn().mockRejectedValue(options.skillExecuteError)
      : typeof options.skillExecute === "function"
        ? vi.fn().mockImplementation(options.skillExecute)
        : vi.fn().mockResolvedValue(
            options.skillExecute ?? {
              executionId: "exec-123",
              success: true,
            },
          ),
    abort: options.skillAbort ?? vi.fn(),
    rescan: vi.fn().mockResolvedValue(options.skillList ?? []),
    sendPermissionResponse: options.skillSendPermissionResponse ?? vi.fn(),
  };

  Object.defineProperty(window, "electronAPI", {
    value: { skill: mockSkillAPI },
    writable: true,
  });
}
```

## 統合テスト連携【必須】

統合テストシナリオを全カテゴリで設計する:

| シナリオカテゴリ     | 検証内容                                           | テストファイル                         |
| -------------------- | -------------------------------------------------- | -------------------------------------- |
| 状態統合テスト       | skillSlice状態がagentSliceに正しく統合されること   | `agentSlice.skill-integration.test.ts` |
| アクション移行テスト | skillSliceアクションがagentSliceで動作すること     | `agentSlice.skill-integration.test.ts` |
| race conditionテスト | executionId事前生成が機能すること                  | `agentSlice.skill-integration.test.ts` |
| IPCハンドラテスト    | ストリーミングメッセージ受信が正しく処理されること | `agentSlice.skill-integration.test.ts` |

## アーキテクチャ層別テスト

| 層               | テスト観点                  | テストファイル配置                                               |
| ---------------- | --------------------------- | ---------------------------------------------------------------- |
| Renderer Process | Zustand状態管理、アクション | `apps/desktop/src/renderer/store/slices/__tests__/*.test.ts`     |
| IPC通信          | リスナーハンドラの動作      | `apps/desktop/src/renderer/store/slices/__tests__/*.ipc.test.ts` |

## 成果物

| 成果物             | パス                                                                                    | 説明               |
| ------------------ | --------------------------------------------------------------------------------------- | ------------------ |
| テスト仕様書       | `outputs/phase-4/test-specification.md`                                                 | テスト設計         |
| テストケース一覧   | `outputs/phase-4/test-cases.md`                                                         | ケース一覧         |
| 統合テストシナリオ | `outputs/phase-4/integration-test-design.md`                                            | 統合テスト設計     |
| テストファイル     | `apps/desktop/src/renderer/store/slices/__tests__/agentSlice.skill-integration.test.ts` | 実際のテストコード |

## 完了条件

- [ ] テストファイル `agentSlice.skill-integration.test.ts` が作成されている
- [ ] 全56のテストケース（TS-6-1-01〜TS-6-1-56）が定義されている
- [ ] モックデータ（mockAvailableSkills, mockImportedSkills等）が定義されている
- [ ] ヘルパー関数（createTestStore, setupMockElectronAPI）が作成されている
- [ ] すべてのテストが失敗状態（Red）である
- [ ] テストカバレッジ目標が設定されている（Line 80%+, Branch 60%+, Function 80%+）
- [ ] **本Phase内の全タスクを100%実行完了**

## TDD検証

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test:run apps/desktop/src/renderer/store/slices/__tests__/agentSlice.skill-integration.test.ts

# 確認項目
# - [ ] テストが失敗することを確認（Red状態）
# - [ ] 失敗理由が「メソッド/プロパティが存在しない」であること
```

## 次のPhase

Phase 5: 実装（TDD: Green）
