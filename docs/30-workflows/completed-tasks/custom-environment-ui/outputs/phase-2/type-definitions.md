# 型定義設計: Custom Execution Environment UI

## メタ情報

| 項目     | 値                              |
| -------- | ------------------------------- |
| タスクID | AGENT-006                       |
| タスク名 | Custom Execution Environment UI |
| Phase    | 2                               |
| 作成日   | 2026-01-13                      |

---

## 型定義一覧

| 型名              | 定義場所                                               | 説明                 |
| ----------------- | ------------------------------------------------------ | -------------------- |
| EnvironmentType   | `packages/shared/src/types/agent.ts`                   | 環境タイプ列挙       |
| EnvironmentConfig | `packages/shared/src/types/agent.ts`                   | 環境設定             |
| PreviewContent    | `packages/shared/src/types/agent.ts`                   | プレビューコンテンツ |
| AgentState        | `apps/desktop/src/renderer/store/slices/agentSlice.ts` | 状態（拡張）         |
| AgentActions      | `apps/desktop/src/renderer/store/slices/agentSlice.ts` | アクション（拡張）   |

---

## 環境タイプ定義

```typescript
// packages/shared/src/types/agent.ts に追加

/**
 * カスタム実行環境のタイプ
 */
export type EnvironmentType =
  | "none" // プレビューなし（デフォルト）
  | "html" // HTMLプレビュー
  | "markdown" // Markdownプレビュー
  | "terminal" // ターミナル（将来実装）
  | "code"; // コード実行（将来実装）

/**
 * 環境タイプの表示名マッピング
 */
export const ENVIRONMENT_TYPE_LABELS: Record<EnvironmentType, string> = {
  none: "なし",
  html: "HTML",
  markdown: "Markdown",
  terminal: "Terminal",
  code: "Code",
};

/**
 * 現在サポートされている環境タイプ
 */
export const SUPPORTED_ENVIRONMENT_TYPES: EnvironmentType[] = [
  "none",
  "html",
  "markdown",
];
```

---

## 環境設定定義

```typescript
// packages/shared/src/types/agent.ts に追加

/**
 * スキルの環境設定
 */
export interface EnvironmentConfig {
  /** 環境タイプ */
  type: EnvironmentType;
  /** 自動更新を有効にするか */
  autoRefresh: boolean;
  /** 更新のデバウンス時間（ミリ秒） */
  refreshDebounce: number;
  /** iframe sandbox属性（オプション） */
  sandboxFlags?: string[];
}

/**
 * デフォルトの環境設定
 */
export const DEFAULT_ENVIRONMENT_CONFIG: EnvironmentConfig = {
  type: "none",
  autoRefresh: true,
  refreshDebounce: 500,
};
```

---

## プレビューコンテンツ定義

```typescript
// packages/shared/src/types/agent.ts に追加

/**
 * プレビュー表示用のコンテンツ
 */
export interface PreviewContent {
  /** コンテンツの環境タイプ */
  type: EnvironmentType;
  /** コンテンツ本体（HTMLまたはMarkdown文字列） */
  content: string;
  /** 更新タイムスタンプ */
  timestamp: Date;
}
```

---

## Skill型拡張

```typescript
// packages/shared/src/types/skill.ts 拡張

import type { EnvironmentConfig } from "./agent";

/**
 * スキル定義
 */
export interface Skill {
  // 既存フィールド
  id: string;
  name: string;
  slug: string;
  description: string;
  path: string;
  triggers: string[];
  anchors: Anchor[];
  category?: SkillCategory;

  // 新規追加：環境設定（オプション）
  environment?: EnvironmentConfig;
}
```

---

## agentSlice状態拡張

```typescript
// apps/desktop/src/renderer/store/slices/agentSlice.ts 拡張

import type { EnvironmentType, PreviewContent } from "@repo/shared";

/**
 * エージェント状態（拡張）
 */
export interface AgentState {
  // 既存フィールド
  status: AgentExecutionStatus;
  currentSkill: Skill | null;
  messages: AgentMessage[];
  currentExecutionId: string | null;
  executionOutput: string[];
  isLoading: boolean;
  error: string | null;

  // 新規追加：プレビュー状態
  /** プレビューコンテンツ */
  previewContent: PreviewContent | null;
  /** 選択中の環境タイプ */
  selectedEnvironment: EnvironmentType;
  /** 分割比率（0-100、左パネルの幅%） */
  splitRatio: number;
}

/**
 * 初期状態（拡張）
 */
export const initialAgentState: AgentState = {
  // 既存
  status: "idle",
  currentSkill: null,
  messages: [],
  currentExecutionId: null,
  executionOutput: [],
  isLoading: false,
  error: null,

  // 新規追加
  previewContent: null,
  selectedEnvironment: "none",
  splitRatio: 50,
};
```

---

## agentSliceアクション拡張

```typescript
// apps/desktop/src/renderer/store/slices/agentSlice.ts 拡張

/**
 * エージェントアクション（拡張）
 */
export interface AgentActions {
  // 既存アクション
  setExecutionStatus: (status: AgentExecutionStatus) => void;
  selectSkill: (skill: Skill | null) => void;
  addMessage: (message: AgentMessage) => void;
  clearMessages: () => void;
  appendOutput: (output: string) => void;
  clearExecution: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // 新規追加：プレビューアクション
  /** プレビューコンテンツを設定 */
  setPreviewContent: (content: PreviewContent | null) => void;
  /** 環境タイプを設定 */
  setSelectedEnvironment: (type: EnvironmentType) => void;
  /** 分割比率を設定 */
  setSplitRatio: (ratio: number) => void;
  /** プレビューをクリア */
  clearPreview: () => void;
}
```

---

## コンポーネントProps型

### SplitLayoutProps

```typescript
// apps/desktop/src/renderer/components/organisms/SplitLayout/types.ts

export interface SplitLayoutProps {
  /** 左パネルのコンテンツ */
  leftPanel: React.ReactNode;
  /** 右パネルのコンテンツ */
  rightPanel: React.ReactNode;
  /** 初期分割比率（0-100） */
  initialRatio?: number;
  /** 最小分割比率 */
  minRatio?: number;
  /** 最大分割比率 */
  maxRatio?: number;
  /** 比率変更時のコールバック */
  onRatioChange?: (ratio: number) => void;
  /** 右パネルの表示/非表示 */
  showRightPanel?: boolean;
}
```

### EnvironmentSelectorProps

```typescript
// apps/desktop/src/renderer/components/molecules/EnvironmentSelector/types.ts

export interface EnvironmentSelectorProps {
  /** 現在選択中の環境タイプ */
  currentEnvironment: EnvironmentType;
  /** 利用可能な環境タイプ一覧 */
  availableEnvironments: EnvironmentType[];
  /** 環境変更時のコールバック */
  onEnvironmentChange: (type: EnvironmentType) => void;
  /** 更新ボタン押下時のコールバック */
  onRefresh?: () => void;
  /** フルスクリーンボタン押下時のコールバック */
  onFullscreen?: () => void;
  /** 無効化フラグ */
  disabled?: boolean;
}
```

### ExecutionEnvironmentProps

```typescript
// apps/desktop/src/renderer/components/organisms/ExecutionEnvironment/types.ts

export interface ExecutionEnvironmentProps {
  /** 表示する環境タイプ */
  environmentType: EnvironmentType;
  /** プレビューコンテンツ */
  content: PreviewContent | null;
  /** 更新時のコールバック */
  onRefresh?: () => void;
}
```

### HTMLPreviewEnvironmentProps

```typescript
// apps/desktop/src/renderer/components/organisms/HTMLPreviewEnvironment/types.ts

export interface HTMLPreviewEnvironmentProps {
  /** 表示するHTMLコンテンツ */
  content: string;
  /** sandbox属性フラグ */
  sandboxFlags?: string[];
  /** Content Security Policy */
  csp?: string;
  /** ロード完了時のコールバック */
  onLoad?: () => void;
  /** エラー時のコールバック */
  onError?: (error: Error) => void;
}
```

### MarkdownPreviewEnvironmentProps

```typescript
// apps/desktop/src/renderer/components/organisms/MarkdownPreviewEnvironment/types.ts

export interface MarkdownPreviewEnvironmentProps {
  /** Markdownコンテンツ */
  content: string;
  /** 追加CSSクラス */
  className?: string;
}
```

---

## ユーティリティ型

```typescript
// packages/shared/src/types/agent.ts

/**
 * プレビューコンテンツ作成ヘルパー
 */
export const createPreviewContent = (
  type: EnvironmentType,
  content: string,
): PreviewContent => ({
  type,
  content,
  timestamp: new Date(),
});

/**
 * 環境タイプがプレビュー可能か判定
 */
export const isPreviewable = (type: EnvironmentType): boolean => {
  return type !== "none";
};

/**
 * 環境タイプがサポートされているか判定
 */
export const isSupportedEnvironment = (type: EnvironmentType): boolean => {
  return SUPPORTED_ENVIRONMENT_TYPES.includes(type);
};
```

---

## 完了確認

- [x] EnvironmentType型が定義されている
- [x] EnvironmentConfig型が定義されている
- [x] PreviewContent型が定義されている
- [x] Skill型の拡張が定義されている
- [x] AgentState拡張が定義されている
- [x] AgentActions拡張が定義されている
- [x] 全コンポーネントのProps型が定義されている
- [x] ユーティリティ型/関数が定義されている
