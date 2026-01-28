# Phase 2: 設計 - SkillSlice実装

## 設計概要

### アーキテクチャ層

| 層         | 責務                       | 該当ファイル           |
| ---------- | -------------------------- | ---------------------- |
| Renderer層 | UI状態管理、アクション定義 | skillSlice.ts          |
| IPC層      | プロセス間通信             | setupSkillListeners.ts |
| Store層    | グローバル状態統合         | store/index.ts         |

## 詳細設計

### 1. SkillSlice インターフェース

```typescript
// apps/desktop/src/renderer/store/slices/skillSlice.ts

import { StateCreator } from "zustand";
import type {
  SkillMetadata,
  ImportedSkill,
  SkillExecutionStatus,
  SkillStreamMessage,
  SkillPermissionRequest,
} from "@repo/shared";

export interface SkillSlice {
  // ===== 状態 =====
  /** 利用可能なスキル一覧（未インポート） */
  availableSkills: SkillMetadata[];

  /** インポート済みスキル一覧 */
  importedSkills: ImportedSkill[];

  /** 選択中のスキル名（nullは未選択） */
  selectedSkillName: string | null;

  /** 実行中フラグ */
  isExecuting: boolean;

  /** 実行ID（nullは未実行） */
  executionId: string | null;

  /** 実行ステータス */
  executionStatus: SkillExecutionStatus | null;

  /** ストリーミングメッセージ一覧 */
  streamingMessages: SkillStreamMessage[];

  /** 保留中の権限リクエスト */
  pendingPermission: SkillPermissionRequest | null;

  /** エラー情報 */
  skillError: string | null;

  // ===== ローディング状態 =====
  /** スキル一覧読み込み中 */
  isLoadingSkills: boolean;

  /** スキャン中 */
  isScanning: boolean;

  /** インポート中 */
  isImporting: boolean;

  /** インポート中のスキル名 */
  importingSkillName: string | null;

  // ===== アクション =====
  /** スキル一覧を取得 */
  fetchSkills: () => Promise<void>;

  /** スキルを再スキャン */
  rescanSkills: () => Promise<void>;

  /** スキルをインポート */
  importSkill: (skillName: string) => Promise<void>;

  /** スキルを削除 */
  removeSkill: (skillName: string) => Promise<void>;

  /** スキルを選択 */
  selectSkill: (skillName: string | null) => void;

  /** スキルを実行 */
  executeSkill: (prompt: string) => Promise<void>;

  /** 実行を中断 */
  abortExecution: () => void;

  /** 権限リクエストに応答 */
  respondToPermission: (approved: boolean, remember?: boolean) => void;

  /** エラーをクリア */
  clearError: () => void;

  /** ストリーミングメッセージをクリア */
  clearStreamingMessages: () => void;

  // ===== 内部アクション（IPCイベントハンドラ用） =====
  _handleStreamMessage: (msg: SkillStreamMessage) => void;
  _handleComplete: (executionId: string) => void;
  _handleError: (executionId: string, error: string) => void;
  _handlePermissionRequest: (req: SkillPermissionRequest) => void;
}
```

### 2. 初期状態

```typescript
const initialSkillState = {
  // 状態
  availableSkills: [],
  importedSkills: [],
  selectedSkillName: null,
  isExecuting: false,
  executionId: null,
  executionStatus: null,
  streamingMessages: [],
  pendingPermission: null,
  skillError: null,

  // ローディング状態
  isLoadingSkills: false,
  isScanning: false,
  isImporting: false,
  importingSkillName: null,
};
```

### 3. アクション実装設計

#### 3.1 fetchSkills

```typescript
fetchSkills: async () => {
  set({ isLoadingSkills: true, skillError: null });
  try {
    const [available, imported] = await Promise.all([
      window.electronAPI.skill.list(),
      window.electronAPI.skill.getImported(),
    ]);
    set({
      availableSkills: available,
      importedSkills: imported,
      isLoadingSkills: false,
    });
  } catch (error) {
    set({
      skillError: `スキル一覧の取得に失敗: ${error}`,
      isLoadingSkills: false,
    });
  }
};
```

#### 3.2 rescanSkills

```typescript
rescanSkills: async () => {
  set({ isScanning: true, skillError: null });
  try {
    const available = await window.electronAPI.skill.rescan();
    const imported = await window.electronAPI.skill.getImported();
    set({
      availableSkills: available,
      importedSkills: imported,
      isScanning: false,
    });
  } catch (error) {
    set({
      skillError: `スキル再スキャンに失敗: ${error}`,
      isScanning: false,
    });
  }
};
```

#### 3.3 importSkill

```typescript
importSkill: async (skillName) => {
  set({ isImporting: true, importingSkillName: skillName, skillError: null });
  try {
    const imported = await window.electronAPI.skill.import(skillName);
    set((state) => ({
      importedSkills: [...state.importedSkills, imported],
      availableSkills: state.availableSkills.filter(
        (s) => s.name !== skillName,
      ),
      isImporting: false,
      importingSkillName: null,
    }));
  } catch (error) {
    set({
      skillError: `スキルのインポートに失敗: ${error}`,
      isImporting: false,
      importingSkillName: null,
    });
  }
};
```

#### 3.4 removeSkill

```typescript
removeSkill: async (skillName) => {
  try {
    await window.electronAPI.skill.remove(skillName);
    set((state) => ({
      importedSkills: state.importedSkills.filter((s) => s.name !== skillName),
      selectedSkillName:
        state.selectedSkillName === skillName ? null : state.selectedSkillName,
    }));
  } catch (error) {
    set({ skillError: `スキルの削除に失敗: ${error}` });
  }
};
```

#### 3.5 executeSkill

```typescript
executeSkill: async (prompt) => {
  const { selectedSkillName } = get();
  if (!selectedSkillName) return;

  try {
    set({
      isExecuting: true,
      executionStatus: "running",
      streamingMessages: [],
      skillError: null,
    });

    const response = await window.electronAPI.skill.execute({
      skillName: selectedSkillName,
      prompt,
    });

    set({ executionId: response.executionId });
  } catch (error) {
    set({
      isExecuting: false,
      executionStatus: "error",
      skillError: `実行開始に失敗: ${error}`,
    });
  }
};
```

#### 3.6 abortExecution

```typescript
abortExecution: () => {
  const { executionId } = get();
  if (executionId) {
    window.electronAPI.skill.abort(executionId);
    set({
      isExecuting: false,
      executionStatus: "cancelled",
    });
  }
};
```

#### 3.7 respondToPermission

```typescript
respondToPermission: (approved, remember = false) => {
  const { pendingPermission } = get();
  if (pendingPermission) {
    window.electronAPI.skill.respondToPermission({
      requestId: pendingPermission.requestId,
      approved,
      rememberChoice: remember,
    });
    set({ pendingPermission: null });
  }
};
```

### 4. 内部ハンドラ設計

```typescript
_handleStreamMessage: (msg) => {
  set((state) => ({
    streamingMessages: [...state.streamingMessages, msg],
  }));
};

_handleComplete: (_executionId) => {
  set({
    isExecuting: false,
    executionStatus: "completed",
  });
};

_handleError: (_executionId, error) => {
  set({
    isExecuting: false,
    executionStatus: "error",
    skillError: error,
  });
};

_handlePermissionRequest: (req) => {
  set({
    pendingPermission: req,
    executionStatus: "permission_pending",
  });
};
```

### 5. IPCイベントリスナー設計

```typescript
// apps/desktop/src/renderer/store/setupSkillListeners.ts

import { useAppStore } from "./index";

export function setupSkillListeners(): () => void {
  const store = useAppStore.getState();

  // リスナー登録
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

  // クリーンアップ関数を返す
  return () => {
    unsubStream();
    unsubComplete();
    unsubError();
    unsubPermission();
  };
}
```

### 6. Store統合設計

```typescript
// apps/desktop/src/renderer/store/index.ts に追加

import { createSkillSlice, type SkillSlice } from "./slices/skillSlice";

// AppStore型に追加
type AppStore = NavigationSlice &
  EditorSlice &
  ChatSlice &
  // ... 既存のSlice
  SkillSlice; // ← 追加

// createで追加
export const useAppStore = create<AppStore>()(
  devtools(
    persist(
      (...args) => ({
        ...createNavigationSlice(...args),
        // ... 既存のSlice
        ...createSkillSlice(...args), // ← 追加
      }),
      {
        name: "knowledge-studio-store",
        // ...
        partialize: (state) => ({
          // SkillSliceは永続化対象外
          // 既存のフィールドのみ
        }),
      },
    ),
    { name: "KnowledgeStudio" },
  ),
);
```

## 状態遷移図

### 実行状態遷移

```
                    selectSkill()
    ┌──────────┐  ─────────────→  ┌──────────────┐
    │   idle   │                   │   selected   │
    └──────────┘  ←─────────────  └──────────────┘
                    selectSkill(null)      │
                                           │ executeSkill()
                                           ▼
                                    ┌──────────────┐
                                    │   running    │
                                    └──────────────┘
                                           │
            ┌──────────────────────────────┼──────────────────────────────┐
            │                              │                              │
            ▼                              ▼                              ▼
    ┌──────────────┐              ┌──────────────┐              ┌──────────────┐
    │  completed   │              │    error     │              │  cancelled   │
    └──────────────┘              └──────────────┘              └──────────────┘
            │                              │                              │
            └──────────────────────────────┴──────────────────────────────┘
                                           │
                                    clearError() /
                                    selectSkill() で selected へ戻る
```

### 権限リクエスト状態遷移

```
    ┌──────────────┐  _handlePermissionRequest()  ┌────────────────────┐
    │   running    │  ──────────────────────────→  │ permission_pending │
    └──────────────┘                               └────────────────────┘
                                                            │
                               ┌────────────────────────────┼────────────────────────────┐
                               │                            │                            │
                               ▼                            ▼                            │
                    respondToPermission(true)    respondToPermission(false)              │
                               │                            │                            │
                               ▼                            ▼                            ▼
                        ┌──────────────┐            ┌──────────────┐              タイムアウト
                        │   running    │            │    error     │                    │
                        └──────────────┘            └──────────────┘                    ▼
                                                                                  ┌──────────────┐
                                                                                  │    error     │
                                                                                  └──────────────┘
```

## データフロー

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           Renderer Process                               │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                      UI Components                                 │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐               │  │
│  │  │ SkillList   │  │ SkillDetail │  │ ExecutionUI │               │  │
│  │  └─────┬───────┘  └─────┬───────┘  └─────┬───────┘               │  │
│  │        │                │                │                        │  │
│  │        ▼                ▼                ▼                        │  │
│  │  ┌─────────────────────────────────────────────────────────────┐ │  │
│  │  │                     useAppStore (Zustand)                   │ │  │
│  │  │  ┌──────────────────────────────────────────────────────┐  │ │  │
│  │  │  │                    SkillSlice                        │  │ │  │
│  │  │  │  state: availableSkills, importedSkills, ...         │  │ │  │
│  │  │  │  actions: fetchSkills, importSkill, executeSkill,... │  │ │  │
│  │  │  └──────────────────────────────────────────────────────┘  │ │  │
│  │  └─────────────────────────────────────────────────────────────┘ │  │
│  │                              │                                    │  │
│  │                              ▼                                    │  │
│  │  ┌─────────────────────────────────────────────────────────────┐ │  │
│  │  │               setupSkillListeners()                         │ │  │
│  │  │  - onStream → _handleStreamMessage                          │ │  │
│  │  │  - onComplete → _handleComplete                             │ │  │
│  │  │  - onError → _handleError                                   │ │  │
│  │  │  - onPermissionRequest → _handlePermissionRequest           │ │  │
│  │  └─────────────────────────────────────────────────────────────┘ │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                              │ IPC                                       │
└──────────────────────────────┼───────────────────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                           Main Process                                    │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │                      Skill IPC Handlers                             │  │
│  │  - skill:list, skill:import, skill:execute, skill:abort, ...       │  │
│  └────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────┘
```

## ファイル構成

```
apps/desktop/src/renderer/store/
├── index.ts                          # ← 修正（SkillSlice追加）
├── setupSkillListeners.ts            # ← 新規作成
└── slices/
    ├── skillSlice.ts                 # ← 新規作成
    └── __tests__/
        └── skillSlice.test.ts        # ← 新規作成
```

## 参照先

| 参照      | パス                                    |
| --------- | --------------------------------------- |
| 仕様書    | specification.md §5.5 Zustand Store設計 |
| ChatSlice | store/slices/chatSlice.ts               |
| LLMSlice  | store/slices/llmSlice.ts                |
| 型定義    | @repo/shared/types/skill.ts             |
