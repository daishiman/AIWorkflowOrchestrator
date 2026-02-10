# Phase 5: 実装（TDD: Green）

## メタ情報

| 項目     | 値                                |
| -------- | --------------------------------- |
| Phase    | 5                                 |
| タスクID | TASK-FIX-6-1-STATE-CENTRALIZATION |
| 機能名   | state-centralization              |
| 作成日   | 2026-02-09                        |
| 分類     | リファクタリング                  |

## 目的

Phase 4で作成したテストを通すための最小限の実装を行い、skillSliceの状態・アクションをagentSliceに統合する。

## 実行タスク

- **Task 5-1**: agentSlice状態拡張 - skillSliceの状態をagentSliceに追加
- **Task 5-2**: agentSliceアクション拡張 - skillSliceのアクションをagentSliceに移行
- **Task 5-3**: race condition対策実装 - executeSkill内でexecutionId事前生成
- **Task 5-4**: IPCリスナー統合 - setupSkillListeners関数の作成
- **Task 5-5**: 既存参照の更新 - skillSliceを使用している箇所の更新

## 参照資料

| 資料名                      | パス                                                                                    | 説明                                                 |
| --------------------------- | --------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| Phase 4テスト仕様書         | `phase-4-test-creation.md`                                                              | Phase 4成果物                                        |
| 既存agentSlice              | `apps/desktop/src/renderer/store/slices/agentSlice.ts`                                  | 統合先のSlice                                        |
| 既存skillSlice              | `apps/desktop/src/renderer/store/slices/skillSlice.ts`                                  | 統合元のSlice                                        |
| 共有型定義                  | `packages/shared/src/types/skill.ts`                                                    | SkillMetadata等の型                                  |
| security-electron-ipc.md    | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`            | IPC通信のセキュリティ原則、safeInvoke/safeOnパターン |
| security-skill-execution.md | `.claude/skills/aiworkflow-requirements/references/security-skill-execution.md`         | スキル実行セキュリティ                               |
| arch-ipc-persistence.md     | `.claude/skills/aiworkflow-requirements/references/arch-ipc-persistence.md`             | IPC通信パターン、Zustand Slice設計原則               |
| SkillStreamDisplay仕様      | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-skill-stream.md`       | SkillStreamDisplay UI仕様                            |
| スキル関連インターフェース  | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-integration.md` | 型定義（SkillMetadata等）                            |

## 実行手順

### ステップ1: agentSlice状態インターフェース拡張（Task 5-1）

`agentSlice.ts`の`AgentState`インターフェースに以下を追加する:

```typescript
// apps/desktop/src/renderer/store/slices/agentSlice.ts

import type {
  SkillMetadata,
  ImportedSkill,
  SkillExecutionStatus,
  SkillStreamMessage,
  SkillPermissionRequest,
} from "@repo/shared";

export interface AgentState {
  // === 既存の状態（維持） ===
  skills: Skill[];
  availableSkills: Skill[];
  importedSkillIds: string[];
  selectedSkill: Skill | null;
  skillFilter: string;
  skillCategory: SkillCategory | null;
  isImportDialogOpen: boolean;
  toastMessage: { type: "success" | "error"; message: string } | null;
  executionStatus: AgentExecutionStatus;
  currentExecutionId: string | null;
  executionOutput: string[];
  executionState: AgentExecutionState;
  isLoading: boolean;
  error: string | null;
  previewContent: PreviewContent | null;
  selectedEnvironment: EnvironmentType;
  splitRatio: number;

  // === skillSliceから統合する状態（新規） ===
  /** 利用可能なスキルメタデータ一覧（未インポート） */
  availableSkillsMetadata: SkillMetadata[];

  /** インポート済みスキル一覧 */
  importedSkills: ImportedSkill[];

  /** 選択中のスキル名（nullは未選択） */
  selectedSkillName: string | null;

  /** スキル実行中フラグ */
  isExecuting: boolean;

  /** 実行ID（nullは未実行） */
  executionId: string | null;

  /** スキル実行ステータス */
  skillExecutionStatus: SkillExecutionStatus | null;

  /** ストリーミングメッセージ一覧 */
  streamingMessages: SkillStreamMessage[];

  /** 保留中の権限リクエスト */
  pendingPermission: SkillPermissionRequest | null;

  /** スキルエラー情報 */
  skillError: string | null;

  /** スキル一覧読み込み中 */
  isLoadingSkills: boolean;

  /** スキャン中 */
  isScanning: boolean;

  /** インポート中 */
  isImporting: boolean;

  /** インポート中のスキル名 */
  importingSkillName: string | null;
}
```

### ステップ2: 初期状態更新

`initialAgentState`に統合する状態の初期値を追加する:

```typescript
const initialAgentState: AgentState = {
  // === 既存の初期状態（維持） ===
  skills: [],
  availableSkills: [],
  importedSkillIds: [],
  selectedSkill: null,
  skillFilter: "",
  skillCategory: null,
  isImportDialogOpen: false,
  toastMessage: null,
  executionStatus: "idle",
  currentExecutionId: null,
  executionOutput: [],
  executionState: {
    status: "idle",
    currentSkill: null,
    messages: [],
    currentStreamingContent: "",
    error: null,
    startedAt: null,
    completedAt: null,
    pendingPermission: null,
    rememberedChoices: {},
  },
  isLoading: false,
  error: null,
  previewContent: null,
  selectedEnvironment: "none",
  splitRatio: 50,

  // === skillSliceから統合する初期状態（新規） ===
  availableSkillsMetadata: [],
  importedSkills: [],
  selectedSkillName: null,
  isExecuting: false,
  executionId: null,
  skillExecutionStatus: null,
  streamingMessages: [],
  pendingPermission: null,
  skillError: null,
  isLoadingSkills: false,
  isScanning: false,
  isImporting: false,
  importingSkillName: null,
};
```

### ステップ3: agentSliceアクション拡張（Task 5-2）

`AgentActions`インターフェースに以下を追加する:

```typescript
export interface AgentActions {
  // === 既存のアクション（維持） ===
  // ... 省略 ...

  // === skillSliceから統合するアクション（新規） ===
  /** スキル一覧を取得 */
  fetchSkills: () => Promise<void>;

  /** スキルを再スキャン */
  rescanSkills: () => Promise<void>;

  /** スキルをインポート */
  importSkill: (skillName: string) => Promise<void>;

  /** スキルを削除 */
  removeSkill: (skillName: string) => Promise<void>;

  /** スキルを選択 */
  selectSkillByName: (skillName: string | null) => void;

  /** スキルを実行（race condition対策版） */
  executeSkill: (prompt: string) => Promise<void>;

  /** 実行を中断 */
  abortExecution: () => void;

  /** 権限リクエストに応答 */
  respondToSkillPermission: (approved: boolean, remember?: boolean) => void;

  /** スキルエラーをクリア */
  clearSkillError: () => void;

  /** ストリーミングメッセージをクリア */
  clearStreamingMessages: () => void;

  // === 内部アクション（IPCイベントハンドラ用） ===
  _handleStreamMessage: (msg: SkillStreamMessage) => void;
  _handleComplete: (executionId: string) => void;
  _handleError: (executionId: string, error: string) => void;
  _handlePermissionRequest: (req: SkillPermissionRequest) => void;
}
```

### ステップ4: エラーメッセージ定数定義

```typescript
// エラーメッセージ定数
const SKILL_ERRORS = {
  FETCH_FAILED: "スキル一覧の取得に失敗",
  SCAN_FAILED: "スキル再スキャンに失敗",
  IMPORT_FAILED: "スキルのインポートに失敗",
  REMOVE_FAILED: "スキルの削除に失敗",
  EXECUTE_FAILED: "実行開始に失敗",
} as const;

/**
 * エラーメッセージをフォーマット
 */
function formatErrorMessage(prefix: string, error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  return `${prefix}: ${message}`;
}
```

### ステップ5: UUID生成関数追加

race condition対策のためにUUID生成関数を追加する:

```typescript
/**
 * executionIdを生成（UUID v4形式）
 * crypto.randomUUIDが利用可能な場合はそれを使用、
 * そうでない場合はフォールバック実装を使用
 */
function generateExecutionId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // フォールバック: RFC 4122準拠のUUID v4生成
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
```

### ステップ6: アクション実装（Task 5-2 & Task 5-3）

以下のアクションを`createAgentSlice`内に実装する:

```typescript
export const createAgentSlice: StateCreator<AgentSlice, [], [], AgentSlice> = (
  set,
  get,
) => ({
  // === 既存の実装（維持） ===
  ...initialAgentState,
  // ... 既存アクション省略 ...

  // === skillSliceから統合するアクション（新規） ===

  fetchSkills: async () => {
    set({ isLoadingSkills: true, skillError: null });
    try {
      if (typeof window === "undefined" || !window.electronAPI?.skill) {
        throw new Error("Skill API not available");
      }
      const [available, imported] = await Promise.all([
        window.electronAPI.skill.list(),
        window.electronAPI.skill.getImported(),
      ]);
      set({
        availableSkillsMetadata: available,
        importedSkills: imported,
        isLoadingSkills: false,
      });
    } catch (error) {
      set({
        skillError: formatErrorMessage(SKILL_ERRORS.FETCH_FAILED, error),
        isLoadingSkills: false,
      });
    }
  },

  rescanSkills: async () => {
    set({ isScanning: true, skillError: null });
    try {
      if (!window.electronAPI?.skill) {
        throw new Error("Skill API not available");
      }
      const available = await window.electronAPI.skill.rescan();
      const imported = await window.electronAPI.skill.getImported();
      set({
        availableSkillsMetadata: available,
        importedSkills: imported,
        isScanning: false,
      });
    } catch (error) {
      set({
        skillError: formatErrorMessage(SKILL_ERRORS.SCAN_FAILED, error),
        isScanning: false,
      });
    }
  },

  importSkill: async (skillName) => {
    set({ isImporting: true, importingSkillName: skillName, skillError: null });
    try {
      if (!window.electronAPI?.skill) {
        throw new Error("Skill API not available");
      }
      const imported = await window.electronAPI.skill.import(skillName);
      set((state) => ({
        importedSkills: [...state.importedSkills, imported],
        availableSkillsMetadata: state.availableSkillsMetadata.filter(
          (s) => s.name !== skillName,
        ),
        isImporting: false,
        importingSkillName: null,
      }));
    } catch (error) {
      set({
        skillError: formatErrorMessage(SKILL_ERRORS.IMPORT_FAILED, error),
        isImporting: false,
        importingSkillName: null,
      });
    }
  },

  removeSkill: async (skillName) => {
    try {
      if (!window.electronAPI?.skill) {
        throw new Error("Skill API not available");
      }
      await window.electronAPI.skill.remove(skillName);
      set((state) => ({
        importedSkills: state.importedSkills.filter(
          (s) => s.name !== skillName,
        ),
        selectedSkillName:
          state.selectedSkillName === skillName
            ? null
            : state.selectedSkillName,
      }));
    } catch (error) {
      set({
        skillError: formatErrorMessage(SKILL_ERRORS.REMOVE_FAILED, error),
      });
    }
  },

  selectSkillByName: (skillName) => {
    set({ selectedSkillName: skillName });
  },

  // race condition対策版 executeSkill
  executeSkill: async (prompt) => {
    const { selectedSkillName } = get();
    if (!selectedSkillName) return;

    // race condition対策: IPC呼び出し前にexecutionIdを事前生成
    const tempExecutionId = generateExecutionId();

    try {
      set({
        isExecuting: true,
        skillExecutionStatus: "running",
        streamingMessages: [],
        skillError: null,
        executionId: tempExecutionId, // 事前設定
      });

      if (!window.electronAPI?.skill) {
        throw new Error("Skill API not available");
      }

      const response = await window.electronAPI.skill.execute({
        skillName: selectedSkillName,
        prompt,
        tempExecutionId, // サーバーに渡してマッピングに使用
      });

      // サーバーからの正式なexecutionIdで更新
      set({ executionId: response.executionId });
    } catch (error) {
      set({
        isExecuting: false,
        skillExecutionStatus: "error",
        skillError: formatErrorMessage(SKILL_ERRORS.EXECUTE_FAILED, error),
      });
    }
  },

  abortExecution: () => {
    const { executionId } = get();
    if (executionId) {
      window.electronAPI?.skill?.abort(executionId);
      set({
        isExecuting: false,
        skillExecutionStatus: "cancelled",
      });
    }
  },

  respondToSkillPermission: (approved, remember = false) => {
    const state = get();
    const { pendingPermission } = state;
    if (pendingPermission) {
      // 権限履歴記録（PermissionHistorySliceが統合されている場合）
      const addHistoryEntry = (
        state as unknown as { addHistoryEntry?: (entry: unknown) => void }
      ).addHistoryEntry;
      if (addHistoryEntry) {
        const decision = !approved
          ? "denied"
          : remember
            ? "approved"
            : "approved_once";
        addHistoryEntry({
          toolName: pendingPermission.toolName,
          args: (pendingPermission.args ?? {}) as Record<string, unknown>,
          decision,
          timestamp: new Date(),
        });
      }

      window.electronAPI?.skill?.sendPermissionResponse({
        requestId: pendingPermission.requestId,
        approved,
        rememberChoice: remember,
      });
      set({ pendingPermission: null });
    }
  },

  clearSkillError: () => {
    set({ skillError: null });
  },

  clearStreamingMessages: () => {
    set({ streamingMessages: [] });
  },

  // === 内部ハンドラ ===

  _handleStreamMessage: (msg) => {
    set((state) => ({
      streamingMessages: [...state.streamingMessages, msg],
    }));
  },

  _handleComplete: (_executionId) => {
    set({
      isExecuting: false,
      skillExecutionStatus: "completed",
    });
  },

  _handleError: (_executionId, error) => {
    set({
      isExecuting: false,
      skillExecutionStatus: "error",
      skillError: error,
    });
  },

  _handlePermissionRequest: (req) => {
    set({
      pendingPermission: req,
      skillExecutionStatus: "permission_pending",
    });
  },
});
```

### ステップ7: IPCリスナー統合（Task 5-4）

**参照**: security-skill-ipc.md の safeInvoke/safeOn パターンに準拠すること。

- チャンネル名は定数を使用（ハードコード禁止）
- エラーはサニタイズしてからRenderer Processに送信
- sender検証はMain Process側で実施

新規ファイル`setupSkillListeners.ts`を作成する:

```typescript
// apps/desktop/src/renderer/store/setupSkillListeners.ts

import type { StoreApi } from "zustand";
import type { AgentSlice } from "./slices/agentSlice";
import type { SkillStreamMessage, SkillPermissionRequest } from "@repo/shared";

/**
 * スキル関連IPCリスナーを設定
 *
 * @param store Zustandストアインスタンス
 * @returns クリーンアップ関数
 */
export function setupSkillListeners(store: StoreApi<AgentSlice>): () => void {
  if (typeof window === "undefined" || !window.electronAPI?.skill) {
    return () => {};
  }

  const { getState } = store;

  // ストリーミングメッセージリスナー
  const unsubStream = window.electronAPI.skill.onStreamMessage?.(
    (msg: SkillStreamMessage) => {
      getState()._handleStreamMessage(msg);
    },
  );

  // 完了リスナー
  const unsubComplete = window.electronAPI.skill.onComplete?.(
    (data: { executionId: string }) => {
      getState()._handleComplete(data.executionId);
    },
  );

  // エラーリスナー
  const unsubError = window.electronAPI.skill.onError?.(
    (data: { executionId: string; error: string }) => {
      getState()._handleError(data.executionId, data.error);
    },
  );

  // 権限リクエストリスナー
  const unsubPermission = window.electronAPI.skill.onPermissionRequest?.(
    (req: SkillPermissionRequest) => {
      getState()._handlePermissionRequest(req);
    },
  );

  // クリーンアップ関数を返す
  return () => {
    unsubStream?.();
    unsubComplete?.();
    unsubError?.();
    unsubPermission?.();
  };
}
```

### ステップ8: 既存参照の更新（Task 5-5）

以下のファイルでskillSliceの参照をagentSliceに更新する:

#### 8.1 ストア定義の更新

```typescript
// apps/desktop/src/renderer/store/index.ts

import { createAgentSlice, type AgentSlice } from "./slices/agentSlice";
// skillSliceのimportを削除（または非推奨コメントを追加）
// import { createSkillSlice, type SkillSlice } from "./slices/skillSlice"; // 削除

// ストア型定義からSkillSliceを除外
export type RootState = AgentSlice & /* 他のSlice */;

// createStoreからcreateSkillSliceを除外
export const useStore = create<RootState>()(
  devtools(
    (...args) => ({
      ...createAgentSlice(...args),
      // ...createSkillSlice(...args), // 削除
      // 他のSlice
    }),
  ),
);
```

#### 8.2 コンポーネント参照の更新

skillSliceを使用しているコンポーネントの参照を更新する。
以下のパターンで検索し、更新する:

```bash
# 検索コマンド
grep -rn "useStore.*skillSlice\|from.*skillSlice\|SkillSlice" apps/desktop/src/renderer/
```

## 統合テスト連携【必須】

フロント/バック接続の実装とテスト支援コード整備:

| 実装項目           | 内容                                        |
| ------------------ | ------------------------------------------- |
| 状態統合           | skillSlice状態をagentSliceに統合            |
| アクション統合     | skillSliceアクションをagentSliceに統合      |
| race condition対策 | executeSkill内でexecutionId事前生成         |
| IPCリスナー        | setupSkillListeners関数でリスナーを一元管理 |

## aiworkflow-requirements 仕様準拠チェック

| 仕様書                              | 準拠項目                                                   |
| ----------------------------------- | ---------------------------------------------------------- |
| arch-state-management.md            | Zustand設計原則（ドメインごとに独立したSlice）             |
| interfaces-agent-sdk-integration.md | 型定義（SkillMetadata, ImportedSkill, SkillStreamMessage） |
| security-electron-ipc.md            | IPCセキュリティ（チャンネル定数化、contextBridge経由）     |
| security-skill-execution.md         | スキル実行セキュリティ原則                                 |
| arch-ipc-persistence.md             | IPC通信パターン（safeInvoke/safeOn）                       |
| .claude/rules/02-code-quality.md    | エラーカテゴリ（1000-5999範囲）                            |

## アーキテクチャ層別実装

| 層               | 実装観点                    | 実装ファイル配置                                         |
| ---------------- | --------------------------- | -------------------------------------------------------- |
| Renderer Process | Zustand状態管理、アクション | `apps/desktop/src/renderer/store/slices/agentSlice.ts`   |
| IPC通信          | リスナーセットアップ        | `apps/desktop/src/renderer/store/setupSkillListeners.ts` |

## 成果物

| 成果物                  | パス                                                     | 説明          |
| ----------------------- | -------------------------------------------------------- | ------------- |
| 拡張agentSlice          | `apps/desktop/src/renderer/store/slices/agentSlice.ts`   | 統合後のSlice |
| IPCリスナーセットアップ | `apps/desktop/src/renderer/store/setupSkillListeners.ts` | リスナー管理  |
| 更新されたストア定義    | `apps/desktop/src/renderer/store/index.ts`               | ストア統合    |

## 完了条件

- [ ] agentSliceにskillSliceの全状態が追加されている
- [ ] agentSliceにskillSliceの全アクションが追加されている
- [ ] executeSkillにrace condition対策（executionId事前生成）が実装されている
- [ ] setupSkillListeners関数が作成されている
- [ ] すべてのテストが成功状態（Green）である
- [ ] ストア定義からskillSliceが除外されている
- [ ] **本Phase内の全タスクを100%実行完了**

## TDD検証

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test:run apps/desktop/src/renderer/store/slices/__tests__/agentSlice.skill-integration.test.ts

# 確認項目
# - [ ] テストが成功することを確認（Green状態）
# - [ ] 全56のテストケースがPASSすること
```

## 次のPhase

Phase 6: テスト拡充
