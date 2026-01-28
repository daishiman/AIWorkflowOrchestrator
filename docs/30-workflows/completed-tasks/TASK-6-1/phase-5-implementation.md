# Phase 5: 実装（TDD Green Phase） - SkillSlice実装

## 実装概要

Phase 4で作成したテストを通過させるために、SkillSlice の実装を行う。

## 実装タスク

### Task 1: skillSlice.ts の作成

**パス**: `apps/desktop/src/renderer/store/slices/skillSlice.ts`

```typescript
/**
 * @file SkillSlice - スキル機能の状態管理
 * @description スキルのインポート・実行・権限管理の状態を管理するZustandスライス
 * @feature skill-import-agent-system
 */

import { StateCreator } from "zustand";
import type {
  SkillMetadata,
  ImportedSkill,
  SkillExecutionStatus,
  SkillStreamMessage,
  SkillPermissionRequest,
} from "@repo/shared";

// ============================================
// Types
// ============================================

export interface SkillSlice {
  // 状態
  availableSkills: SkillMetadata[];
  importedSkills: ImportedSkill[];
  selectedSkillName: string | null;
  isExecuting: boolean;
  executionId: string | null;
  executionStatus: SkillExecutionStatus | null;
  streamingMessages: SkillStreamMessage[];
  pendingPermission: SkillPermissionRequest | null;
  skillError: string | null;

  // ローディング状態
  isLoadingSkills: boolean;
  isScanning: boolean;
  isImporting: boolean;
  importingSkillName: string | null;

  // アクション
  fetchSkills: () => Promise<void>;
  rescanSkills: () => Promise<void>;
  importSkill: (skillName: string) => Promise<void>;
  removeSkill: (skillName: string) => Promise<void>;
  selectSkill: (skillName: string | null) => void;
  executeSkill: (prompt: string) => Promise<void>;
  abortExecution: () => void;
  respondToPermission: (approved: boolean, remember?: boolean) => void;
  clearError: () => void;
  clearStreamingMessages: () => void;

  // 内部アクション（IPCイベントハンドラ用）
  _handleStreamMessage: (msg: SkillStreamMessage) => void;
  _handleComplete: (executionId: string) => void;
  _handleError: (executionId: string, error: string) => void;
  _handlePermissionRequest: (req: SkillPermissionRequest) => void;
}

// ============================================
// Slice Creator
// ============================================

export const createSkillSlice: StateCreator<SkillSlice, [], [], SkillSlice> = (
  set,
  get,
) => ({
  // 初期状態
  availableSkills: [],
  importedSkills: [],
  selectedSkillName: null,
  isExecuting: false,
  executionId: null,
  executionStatus: null,
  streamingMessages: [],
  pendingPermission: null,
  skillError: null,

  isLoadingSkills: false,
  isScanning: false,
  isImporting: false,
  importingSkillName: null,

  // アクション実装
  fetchSkills: async () => {
    // Phase 4のテストTS-6-1-11〜15を通過させる実装
  },

  rescanSkills: async () => {
    // Phase 4のテストTS-6-1-16〜20を通過させる実装
  },

  importSkill: async (skillName) => {
    // Phase 4のテストTS-6-1-21〜26を通過させる実装
  },

  removeSkill: async (skillName) => {
    // Phase 4のテストTS-6-1-27〜30を通過させる実装
  },

  selectSkill: (skillName) => {
    // Phase 4のテストTS-6-1-31〜33を通過させる実装
  },

  executeSkill: async (prompt) => {
    // Phase 4のテストTS-6-1-34〜39を通過させる実装
  },

  abortExecution: () => {
    // Phase 4のテストTS-6-1-40〜42を通過させる実装
  },

  respondToPermission: (approved, remember = false) => {
    // Phase 4のテストTS-6-1-43〜46を通過させる実装
  },

  clearError: () => set({ skillError: null }),

  clearStreamingMessages: () => set({ streamingMessages: [] }),

  // 内部ハンドラ
  _handleStreamMessage: (msg) => {
    // Phase 4のテストTS-6-1-47を通過させる実装
  },

  _handleComplete: (_executionId) => {
    // Phase 4のテストTS-6-1-48〜49を通過させる実装
  },

  _handleError: (_executionId, error) => {
    // Phase 4のテストTS-6-1-50〜52を通過させる実装
  },

  _handlePermissionRequest: (req) => {
    // Phase 4のテストTS-6-1-53を通過させる実装
  },
});
```

### Task 2: setupSkillListeners.ts の作成

**パス**: `apps/desktop/src/renderer/store/setupSkillListeners.ts`

```typescript
/**
 * @file setupSkillListeners - スキルIPCイベントリスナー設定
 * @description Main ProcessからのIPCイベントをSkillSliceに接続
 * @feature skill-import-agent-system
 */

import { useAppStore } from "./index";

export function setupSkillListeners(): () => void {
  const store = useAppStore.getState();

  const unsubStream = window.electronAPI.skill.onStream(
    store._handleStreamMessage,
  );
  const unsubComplete = window.electronAPI.skill.onComplete(({ executionId }) =>
    store._handleComplete(executionId),
  );
  const unsubError = window.electronAPI.skill.onError(
    ({ executionId, error }) => store._handleError(executionId, error),
  );
  const unsubPermission = window.electronAPI.skill.onPermissionRequest(
    store._handlePermissionRequest,
  );

  return () => {
    unsubStream();
    unsubComplete();
    unsubError();
    unsubPermission();
  };
}
```

### Task 3: store/index.ts の修正

**修正箇所**:

1. SkillSlice のインポート追加
2. AppStore 型定義に SkillSlice 追加
3. createSkillSlice の呼び出し追加

```typescript
// インポート追加
import { createSkillSlice, type SkillSlice } from "./slices/skillSlice";

// 型定義修正
export type AppStore = NavigationSlice &
  EditorSlice &
  ChatSlice &
  GraphSlice &
  SettingsSlice &
  UISlice &
  DashboardSlice &
  AuthSlice &
  WorkspaceSlice &
  FileSelectionSlice &
  SystemPromptTemplateSlice &
  LLMSlice &
  AgentSlice &
  ChatEditSlice &
  SkillSlice; // ← 追加

// create内に追加
export const useAppStore = create<AppStore>()(
  devtools(
    persist(
      (...args) => ({
        ...createNavigationSlice(...args),
        ...createEditorSlice(...args),
        ...createChatSlice(...args),
        ...createGraphSlice(...args),
        ...createSettingsSlice(...args),
        ...createUISlice(...args),
        ...createDashboardSlice(...args),
        ...createAuthSlice(...args),
        ...createWorkspaceSlice(...args),
        ...createFileSelectionSlice(...args),
        ...createSystemPromptTemplateSlice(...args),
        ...createLLMSlice(...args),
        ...createAgentSlice(...args),
        ...createChatEditSlice(...args),
        ...createSkillSlice(...args), // ← 追加
      }),
      // ... persist設定（SkillSliceは永続化対象外）
    ),
  ),
);
```

## 実装チェックリスト

### skillSlice.ts

| チェック項目                   | 状態 |
| ------------------------------ | ---- |
| インターフェース定義           | [ ]  |
| 初期状態定義                   | [ ]  |
| fetchSkills 実装               | [ ]  |
| rescanSkills 実装              | [ ]  |
| importSkill 実装               | [ ]  |
| removeSkill 実装               | [ ]  |
| selectSkill 実装               | [ ]  |
| executeSkill 実装              | [ ]  |
| abortExecution 実装            | [ ]  |
| respondToPermission 実装       | [ ]  |
| clearError 実装                | [ ]  |
| clearStreamingMessages 実装    | [ ]  |
| \_handleStreamMessage 実装     | [ ]  |
| \_handleComplete 実装          | [ ]  |
| \_handleError 実装             | [ ]  |
| \_handlePermissionRequest 実装 | [ ]  |

### setupSkillListeners.ts

| チェック項目                     | 状態 |
| -------------------------------- | ---- |
| onStream リスナー登録            | [ ]  |
| onComplete リスナー登録          | [ ]  |
| onError リスナー登録             | [ ]  |
| onPermissionRequest リスナー登録 | [ ]  |
| クリーンアップ関数               | [ ]  |

### store/index.ts

| チェック項目              | 状態 |
| ------------------------- | ---- |
| SkillSlice インポート     | [ ]  |
| AppStore 型に追加         | [ ]  |
| createSkillSlice 呼び出し | [ ]  |

## 完了条件

| 条件                              | 状態 |
| --------------------------------- | ---- |
| Phase 4の全56テストが通過する     | [ ]  |
| TypeScriptコンパイルエラーなし    | [ ]  |
| ESLint警告なし                    | [ ]  |
| store/index.ts のビルドが成功する | [ ]  |

## 実行コマンド

```bash
# 型チェック
pnpm --filter @repo/desktop typecheck

# テスト実行
pnpm --filter @repo/desktop test skillSlice

# ビルド確認
pnpm --filter @repo/desktop build
```

## 実装上の注意点

### 1. IPC API呼び出し

- `window.electronAPI.skill` が利用可能かチェックする
- エラーハンドリングを適切に行う
- 非同期処理の状態を正しく管理する

### 2. 状態更新

- 関数形式の `set` を使用して前の状態を参照する
- 配列の不変更新（スプレッド演算子）を使用する
- 必要な状態のみを更新する

### 3. エラーハンドリング

- try-catch で全ての非同期処理をラップする
- エラーメッセージは日本語で統一する
- ローディング状態を確実にリセットする

### 4. 既存パターンへの準拠

- ChatSlice, LLMSlice のパターンを参照
- 命名規則を統一する
- ドキュメントコメントを追加する
