# Phase 6: テスト拡充

## メタ情報

| 項目     | 値                                |
| -------- | --------------------------------- |
| Phase    | 6                                 |
| タスクID | TASK-FIX-6-1-STATE-CENTRALIZATION |
| 機能名   | state-centralization              |
| 作成日   | 2026-02-09                        |
| 分類     | リファクタリング                  |

## 目的

Phase 5の実装に対してテストを拡充し、カバレッジ目標を達成する。
境界値、エラーケース、並行処理シナリオのテストを追加する。

## 実行タスク

- **Task 6-1**: カバレッジ分析 - 現在のテストカバレッジを測定し不足領域を特定
- **Task 6-2**: 境界値テスト追加 - エッジケースのテストを追加
- **Task 6-3**: エラーケーステスト追加 - 異常系・例外ハンドリングのテストを追加
- **Task 6-4**: 並行処理テスト追加 - 並行メッセージ受信・中断時のクリーンアップテストを追加
- **Task 6-5**: 統合テスト拡充 - setupSkillListenersの統合テストを追加

## 参照資料

| 資料名               | パス                                                                                    | 説明          |
| -------------------- | --------------------------------------------------------------------------------------- | ------------- |
| Phase 4テスト仕様書  | `phase-4-test-creation.md`                                                              | Phase 4成果物 |
| Phase 5実装          | `apps/desktop/src/renderer/store/slices/agentSlice.ts`                                  | Phase 5成果物 |
| 既存テスト           | `apps/desktop/src/renderer/store/slices/__tests__/agentSlice.skill-integration.test.ts` | Phase 4で作成 |
| 既存skillSliceテスト | `apps/desktop/src/renderer/store/slices/__tests__/skillSlice.edge-cases.test.ts`        | 参考用        |

## ユニットテストカバレッジ基準

| 指標              | 最低基準 | 推奨基準 |
| ----------------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      |
| Branch Coverage   | 60%      | 70%      |
| Function Coverage | 80%      | 90%      |

## 結合テストカバレッジ基準

| 指標                         | 目標 |
| ---------------------------- | ---- |
| APIエンドポイント            | 100% |
| モジュール間インターフェース | 100% |
| 正常系シナリオ               | 100% |
| 異常系シナリオ               | 80%+ |
| 外部連携ポイント             | 100% |

## 実行手順

### ステップ1: カバレッジ測定（Task 6-1）

```bash
# カバレッジ測定コマンド
pnpm --filter @repo/desktop test:run --coverage apps/desktop/src/renderer/store/slices/__tests__/agentSlice.skill-integration.test.ts

# 全体カバレッジ確認
pnpm --filter @repo/desktop test:coverage
```

### ステップ2: 境界値テスト追加（Task 6-2）

以下のテストケースを追加する:

```typescript
describe("agentSlice - 境界値テスト", () => {
  describe("fetchSkills - 境界値", () => {
    it("TS-6-1-57: 空配列が返された場合の処理", async () => {
      const store = createTestStore();
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
      const store = createTestStore();
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
      const store = createTestStore();
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
      const store = createTestStore();

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
      const store = createTestStore();
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
      const store = createTestStore();

      store.selectSkillByName("");

      expect(store.selectedSkillName).toBe("");
    });

    it("TS-6-1-63: 特殊文字を含むスキル名の処理", async () => {
      const store = createTestStore();
      const specialName = "skill-with-特殊-characters_123";
      store.selectedSkillName = specialName;
      setupMockElectronAPI({
        skillExecute: { executionId: "exec-special", success: true },
      });

      await store.executeSkill("test prompt");

      expect(store.executionId).toBe("exec-special");
    });
  });
});
```

### ステップ3: エラーケーステスト追加（Task 6-3）

以下のテストケースを追加する:

```typescript
describe("agentSlice - エラーケース", () => {
  describe("fetchSkills - エラーハンドリング", () => {
    it("TS-6-1-64: electronAPIが未定義の場合", async () => {
      const store = createTestStore();
      Object.defineProperty(window, "electronAPI", {
        value: undefined,
        writable: true,
      });

      await store.fetchSkills();

      expect(store.skillError).toContain("Skill API not available");
      expect(store.isLoadingSkills).toBe(false);
    });

    it("TS-6-1-65: skill.listが未定義の場合", async () => {
      const store = createTestStore();
      Object.defineProperty(window, "electronAPI", {
        value: { skill: {} },
        writable: true,
      });

      await store.fetchSkills();

      expect(store.skillError).toBeDefined();
      expect(store.isLoadingSkills).toBe(false);
    });

    it("TS-6-1-66: ネットワークエラーの場合", async () => {
      const store = createTestStore();
      setupMockElectronAPI({
        skillListError: new Error("Network error"),
      });

      await store.fetchSkills();

      expect(store.skillError).toContain("スキル一覧の取得に失敗");
      expect(store.skillError).toContain("Network error");
    });

    it("TS-6-1-67: タイムアウトエラーの場合", async () => {
      const store = createTestStore();
      setupMockElectronAPI({
        skillListError: new Error("Timeout"),
      });

      await store.fetchSkills();

      expect(store.skillError).toContain("スキル一覧の取得に失敗");
    });
  });

  describe("importSkill - エラーハンドリング", () => {
    it("TS-6-1-68: 存在しないスキルのインポート", async () => {
      const store = createTestStore();
      setupMockElectronAPI({
        skillImportError: new Error("Skill not found"),
      });

      await store.importSkill("non-existent-skill");

      expect(store.skillError).toContain("スキルのインポートに失敗");
      expect(store.isImporting).toBe(false);
    });

    it("TS-6-1-69: 既にインポート済みのスキルを再インポート", async () => {
      const store = createTestStore();
      store.importedSkills = mockImportedSkills;
      setupMockElectronAPI({
        skillImportError: new Error("Already imported"),
      });

      await store.importSkill("test-skill-1");

      expect(store.skillError).toContain("スキルのインポートに失敗");
    });
  });

  describe("executeSkill - エラーハンドリング", () => {
    it("TS-6-1-70: 実行中に接続が切断された場合", async () => {
      const store = createTestStore();
      store.selectedSkillName = "test-skill-1";
      setupMockElectronAPI({
        skillExecuteError: new Error("Connection lost"),
      });

      await store.executeSkill("test prompt");

      expect(store.skillExecutionStatus).toBe("error");
      expect(store.skillError).toContain("実行開始に失敗");
    });

    it("TS-6-1-71: 実行中にスキルが削除された場合", async () => {
      const store = createTestStore();
      store.selectedSkillName = "test-skill-1";
      store.isExecuting = true;

      // スキル削除をシミュレート
      await store.removeSkill("test-skill-1");

      expect(store.selectedSkillName).toBeNull();
    });

    it("TS-6-1-72: 権限リクエスト中のタイムアウト", () => {
      const store = createTestStore();
      store.pendingPermission = mockPermissionRequest;
      store.skillExecutionStatus = "permission_pending";

      // タイムアウトをシミュレート
      store._handleError("exec-123", "Permission request timed out");

      expect(store.skillExecutionStatus).toBe("error");
      expect(store.pendingPermission).toBeNull();
    });
  });

  describe("removeSkill - エラーハンドリング", () => {
    it("TS-6-1-73: 削除中にエラーが発生した場合", async () => {
      const store = createTestStore();
      store.importedSkills = mockImportedSkills;
      Object.defineProperty(window, "electronAPI", {
        value: {
          skill: {
            remove: vi.fn().mockRejectedValue(new Error("Delete failed")),
          },
        },
        writable: true,
      });

      await store.removeSkill("test-skill-1");

      expect(store.skillError).toContain("スキルの削除に失敗");
      // 削除に失敗した場合、リストは変更されない
      expect(store.importedSkills).toEqual(mockImportedSkills);
    });
  });
});
```

### ステップ4: 並行処理テスト追加（Task 6-4）

以下のテストケースを追加する:

```typescript
describe("agentSlice - 並行処理", () => {
  describe("並行メッセージ受信", () => {
    it("TS-6-1-74: 複数の実行IDからのメッセージ混在", () => {
      const store = createTestStore();
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

      // 両方のメッセージが記録される（フィルタリングは呼び出し側で行う）
      expect(store.streamingMessages).toHaveLength(2);
    });

    it("TS-6-1-75: 高頻度メッセージ受信（100ms間隔で100件）", async () => {
      const store = createTestStore();
      const messages: SkillStreamMessage[] = [];

      for (let i = 0; i < 100; i++) {
        messages.push({
          executionId: "exec-123",
          type: "assistant",
          content: { text: `msg-${i}`, isPartial: i < 99 },
          timestamp: Date.now() + i,
        });
      }

      // 同時に全メッセージを処理
      messages.forEach((msg) => store._handleStreamMessage(msg));

      expect(store.streamingMessages).toHaveLength(100);
    });
  });

  describe("中断時のクリーンアップ", () => {
    it("TS-6-1-76: 実行中に中断した場合、状態がリセットされる", () => {
      const store = createTestStore();
      store.isExecuting = true;
      store.executionId = "exec-123";
      store.skillExecutionStatus = "running";
      store.streamingMessages = [mockStreamMessage];
      setupMockElectronAPI();

      store.abortExecution();

      expect(store.isExecuting).toBe(false);
      expect(store.skillExecutionStatus).toBe("cancelled");
      // streamingMessagesは中断時にクリアしない（履歴保持）
    });

    it("TS-6-1-77: 権限待ち中に中断した場合", () => {
      const store = createTestStore();
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
      const store = createTestStore();
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
      const store = createTestStore();
      let callCount = 0;
      setupMockElectronAPI({
        skillList: mockAvailableSkills,
        skillGetImported: mockImportedSkills,
      });

      // 3回連続呼び出し
      await Promise.all([
        store.fetchSkills(),
        store.fetchSkills(),
        store.fetchSkills(),
      ]);

      // 最終状態が正しいことを確認
      expect(store.availableSkillsMetadata).toEqual(mockAvailableSkills);
      expect(store.isLoadingSkills).toBe(false);
    });

    it("TS-6-1-80: importとremoveの連続操作", async () => {
      const store = createTestStore();
      store.availableSkillsMetadata = mockAvailableSkills;
      setupMockElectronAPI({
        skillImport: mockImportedSkills[0],
      });

      await store.importSkill("test-skill-1");
      await store.removeSkill("test-skill-1");

      expect(store.importedSkills).toEqual([]);
    });
  });
});
```

### ステップ5: 統合テスト拡充（Task 6-5）

新規テストファイル`setupSkillListeners.test.ts`を作成する:

```typescript
// apps/desktop/src/renderer/store/__tests__/setupSkillListeners.test.ts

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { createStore } from "zustand";
import { setupSkillListeners } from "../setupSkillListeners";
import { createAgentSlice, type AgentSlice } from "../slices/agentSlice";
import type { SkillStreamMessage, SkillPermissionRequest } from "@repo/shared";

describe("setupSkillListeners", () => {
  let store: ReturnType<typeof createStore<AgentSlice>>;
  let mockOnStreamMessage: ReturnType<typeof vi.fn>;
  let mockOnComplete: ReturnType<typeof vi.fn>;
  let mockOnError: ReturnType<typeof vi.fn>;
  let mockOnPermissionRequest: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    store = createStore<AgentSlice>(createAgentSlice);

    mockOnStreamMessage = vi.fn().mockReturnValue(vi.fn());
    mockOnComplete = vi.fn().mockReturnValue(vi.fn());
    mockOnError = vi.fn().mockReturnValue(vi.fn());
    mockOnPermissionRequest = vi.fn().mockReturnValue(vi.fn());

    Object.defineProperty(window, "electronAPI", {
      value: {
        skill: {
          onStreamMessage: mockOnStreamMessage,
          onComplete: mockOnComplete,
          onError: mockOnError,
          onPermissionRequest: mockOnPermissionRequest,
        },
      },
      writable: true,
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("リスナー登録", () => {
    it("TS-6-1-81: 全てのリスナーが登録される", () => {
      setupSkillListeners(store);

      expect(mockOnStreamMessage).toHaveBeenCalled();
      expect(mockOnComplete).toHaveBeenCalled();
      expect(mockOnError).toHaveBeenCalled();
      expect(mockOnPermissionRequest).toHaveBeenCalled();
    });

    it("TS-6-1-82: electronAPIが未定義の場合、エラーなく終了する", () => {
      Object.defineProperty(window, "electronAPI", {
        value: undefined,
        writable: true,
      });

      const cleanup = setupSkillListeners(store);

      expect(cleanup).toBeInstanceOf(Function);
      cleanup(); // エラーなく実行できる
    });
  });

  describe("メッセージハンドリング", () => {
    it("TS-6-1-83: onStreamMessageコールバックでstreamingMessagesが更新される", () => {
      setupSkillListeners(store);

      // コールバックを取得して呼び出し
      const callback = mockOnStreamMessage.mock.calls[0][0];
      const msg: SkillStreamMessage = {
        executionId: "exec-123",
        type: "assistant",
        content: { text: "test", isPartial: false },
        timestamp: Date.now(),
      };

      callback(msg);

      expect(store.getState().streamingMessages).toContainEqual(msg);
    });

    it("TS-6-1-84: onCompleteコールバックでisExecutingがfalseになる", () => {
      store.setState({ isExecuting: true });
      setupSkillListeners(store);

      const callback = mockOnComplete.mock.calls[0][0];
      callback({ executionId: "exec-123" });

      expect(store.getState().isExecuting).toBe(false);
      expect(store.getState().skillExecutionStatus).toBe("completed");
    });

    it("TS-6-1-85: onErrorコールバックでskillErrorが設定される", () => {
      setupSkillListeners(store);

      const callback = mockOnError.mock.calls[0][0];
      callback({ executionId: "exec-123", error: "Test error" });

      expect(store.getState().skillError).toBe("Test error");
      expect(store.getState().skillExecutionStatus).toBe("error");
    });

    it("TS-6-1-86: onPermissionRequestコールバックでpendingPermissionが設定される", () => {
      setupSkillListeners(store);

      const callback = mockOnPermissionRequest.mock.calls[0][0];
      const req: SkillPermissionRequest = {
        executionId: "exec-123",
        requestId: "req-456",
        toolName: "Bash",
        args: { command: "ls" },
      };

      callback(req);

      expect(store.getState().pendingPermission).toEqual(req);
      expect(store.getState().skillExecutionStatus).toBe("permission_pending");
    });
  });

  describe("クリーンアップ", () => {
    it("TS-6-1-87: cleanup関数を呼び出すと全リスナーが解除される", () => {
      const unsubStream = vi.fn();
      const unsubComplete = vi.fn();
      const unsubError = vi.fn();
      const unsubPermission = vi.fn();

      mockOnStreamMessage.mockReturnValue(unsubStream);
      mockOnComplete.mockReturnValue(unsubComplete);
      mockOnError.mockReturnValue(unsubError);
      mockOnPermissionRequest.mockReturnValue(unsubPermission);

      const cleanup = setupSkillListeners(store);
      cleanup();

      expect(unsubStream).toHaveBeenCalled();
      expect(unsubComplete).toHaveBeenCalled();
      expect(unsubError).toHaveBeenCalled();
      expect(unsubPermission).toHaveBeenCalled();
    });

    it("TS-6-1-88: 一部のリスナーがundefinedでもクリーンアップが正常に動作する", () => {
      mockOnStreamMessage.mockReturnValue(undefined);
      mockOnComplete.mockReturnValue(vi.fn());
      mockOnError.mockReturnValue(undefined);
      mockOnPermissionRequest.mockReturnValue(vi.fn());

      const cleanup = setupSkillListeners(store);

      expect(() => cleanup()).not.toThrow();
    });
  });
});
```

### ステップ6: カバレッジ再測定

```bash
# 拡充後のカバレッジ測定
pnpm --filter @repo/desktop test:run --coverage apps/desktop/src/renderer/store/slices/__tests__/agentSlice.skill-integration.test.ts apps/desktop/src/renderer/store/__tests__/setupSkillListeners.test.ts
```

## 統合テスト連携【必須】

統合テストの拡充（全カテゴリのカバレッジ向上）:

| テストカテゴリ       | 検証項目                                         | 目標 |
| -------------------- | ------------------------------------------------ | ---- |
| 状態統合テスト       | skillSlice状態がagentSliceに正しく統合されること | 100% |
| アクション移行テスト | skillSliceアクションがagentSliceで動作すること   | 100% |
| エラーハンドリング   | API障害時の状態更新・リカバリ                    | 80%+ |
| 境界値テスト         | 空配列、大量データ、特殊文字                     | 100% |
| 並行処理テスト       | 複数メッセージ受信、中断時クリーンアップ         | 100% |

## 成果物

| 成果物                    | パス                                                                                    | 説明               |
| ------------------------- | --------------------------------------------------------------------------------------- | ------------------ |
| カバレッジレポート        | `outputs/phase-6/coverage-report.md`                                                    | カバレッジ分析結果 |
| 統合テスト結果            | `outputs/phase-6/integration-test.md`                                                   | 統合テスト実行結果 |
| 拡充テストファイル        | `apps/desktop/src/renderer/store/slices/__tests__/agentSlice.skill-integration.test.ts` | 追加テストコード   |
| setupSkillListenersテスト | `apps/desktop/src/renderer/store/__tests__/setupSkillListeners.test.ts`                 | リスナーテスト     |

## 完了条件

- [ ] ユニットテストカバレッジ基準を達成（Line 80%+, Branch 60%+, Function 80%+）
- [ ] 境界値テスト（TS-6-1-57〜TS-6-1-63）が追加されている
- [ ] エラーケーステスト（TS-6-1-64〜TS-6-1-73）が追加されている
- [ ] 並行処理テスト（TS-6-1-74〜TS-6-1-80）が追加されている
- [ ] setupSkillListenersテスト（TS-6-1-81〜TS-6-1-88）が追加されている
- [ ] 全テストがPASSしている
- [ ] カバレッジレポートが出力されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 7: テストカバレッジ確認
