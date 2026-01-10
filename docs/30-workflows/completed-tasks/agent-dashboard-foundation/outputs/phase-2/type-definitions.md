# 型定義設計書 - エージェントダッシュボード基盤

## 概要情報

| 項目     | 内容                       |
| -------- | -------------------------- |
| タスクID | AGENT-001                  |
| 機能名   | agent-dashboard-foundation |
| Phase    | 2                          |
| 作成日   | 2026-01-10                 |

---

## ViewType拡張

### 更新後の型定義

```typescript
// apps/desktop/src/renderer/store/types.ts

// 更新前
export type ViewType = "dashboard" | "editor" | "chat" | "graph" | "settings";

// 更新後
export type ViewType =
  | "dashboard"
  | "editor"
  | "chat"
  | "graph"
  | "settings"
  | "agent";
```

### 影響を受けるファイル

| ファイル                                 | 変更内容               |
| ---------------------------------------- | ---------------------- |
| `store/types.ts`                         | ViewType型定義更新     |
| `store/slices/navigationSlice.ts`        | 型参照のみ（変更不要） |
| `components/organisms/AppDock/index.tsx` | ローカルViewType更新   |

---

## agentSlice型定義

### 状態型

```typescript
// apps/desktop/src/renderer/store/slices/agentSlice.ts

/**
 * スキルのアンカー情報
 * 参照文献と適用方法を定義
 */
export interface Anchor {
  /** 参照元（書籍、ドキュメント等） */
  source: string;
  /** 適用方法 */
  application: string;
  /** 目的 */
  purpose: string;
}

/**
 * スキル基本情報
 */
export interface Skill {
  /** 一意識別子 */
  id: string;
  /** スキル名 */
  name: string;
  /** 説明文 */
  description: string;
  /** スキルファイルパス */
  path: string;
  /** トリガーキーワード */
  triggers: string[];
  /** カテゴリ（任意） */
  category?: string;
}

/**
 * スキル詳細情報（Skill拡張）
 */
export interface SkillDetail extends Skill {
  /** アンカー情報 */
  anchors: Anchor[];
  /** ワークフロー定義（任意） */
  workflow?: string;
  /** ベストプラクティス（任意） */
  bestPractices?: string[];
}

/**
 * エージェント実行状態
 */
export type AgentExecutionStatus =
  | "idle"
  | "executing"
  | "completed"
  | "error"
  | "aborted";

/**
 * agentSlice状態インターフェース
 */
export interface AgentState {
  // スキル関連
  /** スキル一覧 */
  skills: Skill[];
  /** 選択中のスキル */
  selectedSkill: Skill | null;
  /** スキルフィルター文字列 */
  skillFilter: string;
  /** スキルカテゴリフィルター */
  skillCategory: string | null;

  // 実行関連
  /** 実行状態 */
  executionStatus: AgentExecutionStatus;
  /** 現在の実行ID */
  currentExecutionId: string | null;
  /** 実行出力 */
  executionOutput: string[];

  // 共通状態
  /** ローディング状態 */
  isLoading: boolean;
  /** エラーメッセージ */
  error: string | null;
}
```

### アクション型

```typescript
/**
 * agentSliceアクションインターフェース
 */
export interface AgentActions {
  // スキル操作
  /** スキル一覧を設定 */
  setSkills: (skills: Skill[]) => void;
  /** スキルを選択 */
  selectSkill: (skill: Skill | null) => void;
  /** フィルター文字列を設定 */
  setSkillFilter: (filter: string) => void;
  /** カテゴリフィルターを設定 */
  setSkillCategory: (category: string | null) => void;

  // 実行操作
  /** 実行状態を設定 */
  setExecutionStatus: (status: AgentExecutionStatus) => void;
  /** 実行IDを設定 */
  setCurrentExecutionId: (id: string | null) => void;
  /** 出力を追加 */
  appendOutput: (output: string) => void;
  /** 実行をクリア */
  clearExecution: () => void;

  // 共通操作
  /** ローディング状態を設定 */
  setLoading: (isLoading: boolean) => void;
  /** エラーを設定 */
  setError: (error: string | null) => void;
  /** 状態をリセット */
  resetAgentState: () => void;
}

/**
 * agentSlice統合インターフェース
 */
export interface AgentSlice extends AgentState, AgentActions {}
```

---

## Storeへの統合

### Store型定義の更新

```typescript
// apps/desktop/src/renderer/store/index.ts

import { AgentSlice, createAgentSlice } from "./slices/agentSlice";

// AppStore型にAgentSliceを追加
export type AppStore =
  & NavigationSlice
  & UISlice
  & AgentSlice  // 新規追加
  & /* 他のslice */;

// store生成時にagentSliceを統合
export const useAppStore = create<AppStore>()(
  persist(
    (...args) => ({
      ...createNavigationSlice(...args),
      ...createUISlice(...args),
      ...createAgentSlice(...args),  // 新規追加
      // ...
    }),
    {
      name: "knowledge-studio-store",
      partialize: (state) => ({
        // agentSliceは永続化対象外
        theme: state.theme,
        // ...
      }),
    }
  )
);
```

---

## 初期状態定義

```typescript
// agentSlice.ts

const initialAgentState: AgentState = {
  // スキル関連
  skills: [],
  selectedSkill: null,
  skillFilter: "",
  skillCategory: null,

  // 実行関連
  executionStatus: "idle",
  currentExecutionId: null,
  executionOutput: [],

  // 共通状態
  isLoading: false,
  error: null,
};
```

---

## createAgentSlice実装

```typescript
// apps/desktop/src/renderer/store/slices/agentSlice.ts

import { StateCreator } from "zustand";

export const createAgentSlice: StateCreator<AgentSlice, [], [], AgentSlice> = (
  set,
  get,
) => ({
  // Initial state
  ...initialAgentState,

  // スキル操作
  setSkills: (skills) => set({ skills }),

  selectSkill: (skill) => set({ selectedSkill: skill }),

  setSkillFilter: (filter) => set({ skillFilter: filter }),

  setSkillCategory: (category) => set({ skillCategory: category }),

  // 実行操作
  setExecutionStatus: (status) => set({ executionStatus: status }),

  setCurrentExecutionId: (id) => set({ currentExecutionId: id }),

  appendOutput: (output) =>
    set((state) => ({
      executionOutput: [...state.executionOutput, output],
    })),

  clearExecution: () =>
    set({
      executionStatus: "idle",
      currentExecutionId: null,
      executionOutput: [],
    }),

  // 共通操作
  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  resetAgentState: () => set(initialAgentState),
});
```

---

## 型エクスポート

```typescript
// apps/desktop/src/renderer/store/slices/agentSlice.ts

// 型エクスポート
export type {
  Anchor,
  Skill,
  SkillDetail,
  AgentExecutionStatus,
  AgentState,
  AgentActions,
  AgentSlice,
};

// 関数エクスポート
export { createAgentSlice };
```

---

## 型の使用例

### コンポーネントでの使用

```typescript
// AgentView/index.tsx

import { useAppStore } from "../../store";
import type { Skill } from "../../store/slices/agentSlice";

const AgentView: React.FC = () => {
  // 型安全なセレクタ
  const skills = useAppStore((state) => state.skills);
  const isLoading = useAppStore((state) => state.isLoading);
  const error = useAppStore((state) => state.error);

  // アクション
  const setSkillFilter = useAppStore((state) => state.setSkillFilter);

  // ...
};
```

### テストでの使用

```typescript
// agentSlice.test.ts

import { createAgentSlice, AgentSlice, Skill } from "./agentSlice";

const mockSkill: Skill = {
  id: "test-skill",
  name: "Test Skill",
  description: "Test description",
  path: "/path/to/skill",
  triggers: ["test"],
};

describe("agentSlice", () => {
  it("should set skills", () => {
    // テスト実装
  });
});
```
