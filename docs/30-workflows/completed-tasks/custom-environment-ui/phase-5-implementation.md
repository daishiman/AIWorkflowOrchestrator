# Phase 5: 実装（Green）

## メタ情報

| 項目   | 値                    |
| ------ | --------------------- |
| Phase  | 5                     |
| 機能名 | custom-environment-ui |
| 作成日 | 2026-01-13            |

## 目的

テストをパスする最小限の実装を行う（TDDのGreenフェーズ）。

## 実行タスク

- 型定義実装: EnvironmentType, EnvironmentConfig, PreviewContent
- agentSlice拡張: previewContent, selectedEnvironment, splitRatio状態追加
- UIコンポーネント実装: SplitLayout, EnvironmentSelector, ExecutionEnvironment
- プレビュー環境実装: HTMLPreviewEnvironment, MarkdownPreviewEnvironment
- セキュリティ実装: sanitizeHTML, sandbox設定, CSP適用

## 参照資料

| 資料名             | パス                                     | 説明           |
| ------------------ | ---------------------------------------- | -------------- |
| 設計書             | `outputs/phase-2/architecture-design.md` | アーキテクチャ |
| コンポーネント設計 | `outputs/phase-2/component-design.md`    | UI設計         |
| セキュリティ設計   | `outputs/phase-2/security-design.md`     | sandbox/CSP    |
| テストファイル     | `outputs/phase-4/`                       | 失敗テスト     |

### システム仕様（aiworkflow-requirements）

> 実装時に以下の仕様を厳守してください。

| 参照資料               | パス                                                                         | 内容               |
| ---------------------- | ---------------------------------------------------------------------------- | ------------------ |
| UIコンポーネントガイド | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`      | Atomic Design準拠  |
| Zustand Sliceパターン  | `.claude/skills/aiworkflow-requirements/references/architecture-patterns.md` | agentSlice拡張方法 |
| Electronセキュリティ   | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md` | CSP/sandbox設定    |

---

## 実装順序

### Step 1: 型定義（packages/shared）

```typescript
// packages/shared/src/types/agent.ts

// 1. EnvironmentType追加
export type EnvironmentType =
  | "none" // プレビューなし
  | "html" // HTMLプレビュー
  | "markdown" // Markdownプレビュー
  | "terminal" // ターミナル（将来）
  | "code"; // コード実行（将来）

// 2. EnvironmentConfig追加
export interface EnvironmentConfig {
  type: EnvironmentType;
  autoRefresh: boolean;
  refreshDebounce: number; // ms
  sandboxFlags?: string[];
}

// 3. PreviewContent追加
export interface PreviewContent {
  type: EnvironmentType;
  content: string;
  timestamp: Date;
}
```

```typescript
// packages/shared/src/types/skill.ts

// Skill型にenvironmentフィールド追加
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

  // 追加フィールド
  environment?: EnvironmentConfig;
}
```

### Step 2: agentSlice拡張

```typescript
// apps/desktop/src/renderer/store/slices/agentSlice.ts

import { EnvironmentType, PreviewContent } from "@repo/shared/types";

// 状態型拡張
interface AgentState {
  // 既存フィールド...

  // 追加フィールド
  previewContent: PreviewContent | null;
  selectedEnvironment: EnvironmentType;
  splitRatio: number;
}

// アクション追加
interface AgentActions {
  // 既存アクション...

  // 追加アクション
  setPreviewContent: (content: PreviewContent | null) => void;
  setSelectedEnvironment: (type: EnvironmentType) => void;
  setSplitRatio: (ratio: number) => void;
  clearPreview: () => void;
}

// 初期状態
const initialState: AgentState = {
  // 既存...
  previewContent: null,
  selectedEnvironment: "none",
  splitRatio: 50,
};
```

### Step 3: ユーティリティ関数

```typescript
// apps/desktop/src/renderer/utils/sanitize.ts

import DOMPurify from "dompurify";

const DOMPURIFY_CONFIG = {
  FORBID_TAGS: ["script", "iframe", "object", "embed"],
  FORBID_ATTR: ["onerror", "onload", "onclick", "onmouseover"],
  ALLOW_DATA_ATTR: false,
};

export const sanitizeHTML = (html: string): string => {
  return DOMPurify.sanitize(html, DOMPURIFY_CONFIG);
};
```

### Step 4: SplitLayout

```typescript
// apps/desktop/src/renderer/components/organisms/SplitLayout/index.tsx

interface SplitLayoutProps {
  leftPanel: React.ReactNode;
  rightPanel: React.ReactNode;
  initialRatio?: number;
  minRatio?: number;
  maxRatio?: number;
  onRatioChange?: (ratio: number) => void;
  showRightPanel?: boolean;
}

export const SplitLayout: React.FC<SplitLayoutProps> = ({
  leftPanel,
  rightPanel,
  initialRatio = 50,
  minRatio = 20,
  maxRatio = 80,
  onRatioChange,
  showRightPanel = true,
}) => {
  // ドラッグハンドリング実装
  // リサイズ処理実装
  // キーボードアクセシビリティ実装
};
```

### Step 5: EnvironmentSelector

```typescript
// apps/desktop/src/renderer/components/molecules/EnvironmentSelector/index.tsx

interface EnvironmentSelectorProps {
  currentEnvironment: EnvironmentType;
  availableEnvironments: EnvironmentType[];
  onEnvironmentChange: (type: EnvironmentType) => void;
  onRefresh?: () => void;
  onFullscreen?: () => void;
  disabled?: boolean;
}

export const EnvironmentSelector: React.FC<EnvironmentSelectorProps> = ({
  currentEnvironment,
  availableEnvironments,
  onEnvironmentChange,
  onRefresh,
  onFullscreen,
  disabled = false,
}) => {
  // ドロップダウン実装
  // ボタン実装
};
```

### Step 6: ExecutionEnvironment

```typescript
// apps/desktop/src/renderer/components/organisms/ExecutionEnvironment/index.tsx

interface ExecutionEnvironmentProps {
  environmentType: EnvironmentType;
  content: PreviewContent | null;
  onRefresh?: () => void;
}

export const ExecutionEnvironment: React.FC<ExecutionEnvironmentProps> = ({
  environmentType,
  content,
  onRefresh,
}) => {
  switch (environmentType) {
    case "html":
      return <HTMLPreviewEnvironment content={content?.content || ""} />;
    case "markdown":
      return <MarkdownPreviewEnvironment content={content?.content || ""} />;
    case "none":
    default:
      return <NoPreviewPlaceholder />;
  }
};
```

### Step 7: HTMLPreviewEnvironment

```typescript
// apps/desktop/src/renderer/components/organisms/HTMLPreviewEnvironment/index.tsx

const SANDBOX_FLAGS = "allow-same-origin";

const CSP_DIRECTIVES = {
  "default-src": "'self'",
  "script-src": "'none'",
  "style-src": "'self' 'unsafe-inline'",
  "img-src": "'self' data: https:",
  "connect-src": "'none'",
  "form-action": "'none'",
};

interface HTMLPreviewEnvironmentProps {
  content: string;
  sandboxFlags?: string;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

export const HTMLPreviewEnvironment: React.FC<HTMLPreviewEnvironmentProps> = ({
  content,
  sandboxFlags = SANDBOX_FLAGS,
  onLoad,
  onError,
}) => {
  const sanitizedContent = useMemo(() => sanitizeHTML(content), [content]);

  // CSPメタタグを追加したHTML生成
  // srcdoc経由でiframeに表示
  // onLoad/onErrorハンドリング
};
```

### Step 8: MarkdownPreviewEnvironment

```typescript
// apps/desktop/src/renderer/components/organisms/MarkdownPreviewEnvironment/index.tsx

import { marked } from "marked";

interface MarkdownPreviewEnvironmentProps {
  content: string;
  className?: string;
}

export const MarkdownPreviewEnvironment: React.FC<MarkdownPreviewEnvironmentProps> = ({
  content,
  className,
}) => {
  const html = useMemo(() => marked.parse(content), [content]);
  const sanitizedHtml = useMemo(() => sanitizeHTML(html), [html]);

  return (
    <div
      className={cn("markdown-preview", className)}
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
};
```

### Step 9: AgentExecutionView統合

```typescript
// apps/desktop/src/renderer/views/AgentExecutionView/index.tsx

export const AgentExecutionView: React.FC = () => {
  const { previewContent, selectedEnvironment, splitRatio } = useAgentStore();
  const hasPreview = selectedEnvironment !== "none";

  return (
    <div className="agent-execution-view">
      <Header />

      {hasPreview ? (
        <SplitLayout
          leftPanel={<AgentChatInterface />}
          rightPanel={
            <>
              <EnvironmentSelector
                currentEnvironment={selectedEnvironment}
                availableEnvironments={["none", "html", "markdown"]}
                onEnvironmentChange={setSelectedEnvironment}
              />
              <ExecutionEnvironment
                environmentType={selectedEnvironment}
                content={previewContent}
              />
            </>
          }
          initialRatio={splitRatio}
          onRatioChange={setSplitRatio}
        />
      ) : (
        <AgentChatInterface />
      )}

      <AgentExecutionControls />
      <AgentMessageInput />
    </div>
  );
};
```

---

## 実装チェックリスト

| 実装項目                   | ファイルパス                                                                 | 状態 |
| -------------------------- | ---------------------------------------------------------------------------- | ---- |
| EnvironmentType型          | `packages/shared/src/types/agent.ts`                                         | [ ]  |
| EnvironmentConfig型        | `packages/shared/src/types/agent.ts`                                         | [ ]  |
| PreviewContent型           | `packages/shared/src/types/agent.ts`                                         | [ ]  |
| Skill型拡張                | `packages/shared/src/types/skill.ts`                                         | [ ]  |
| agentSlice拡張             | `apps/desktop/src/renderer/store/slices/agentSlice.ts`                       | [ ]  |
| sanitizeHTML               | `apps/desktop/src/renderer/utils/sanitize.ts`                                | [ ]  |
| SplitLayout                | `apps/desktop/src/renderer/components/organisms/SplitLayout/`                | [ ]  |
| EnvironmentSelector        | `apps/desktop/src/renderer/components/molecules/EnvironmentSelector/`        | [ ]  |
| ExecutionEnvironment       | `apps/desktop/src/renderer/components/organisms/ExecutionEnvironment/`       | [ ]  |
| HTMLPreviewEnvironment     | `apps/desktop/src/renderer/components/organisms/HTMLPreviewEnvironment/`     | [ ]  |
| MarkdownPreviewEnvironment | `apps/desktop/src/renderer/components/organisms/MarkdownPreviewEnvironment/` | [ ]  |
| AgentExecutionView統合     | `apps/desktop/src/renderer/views/AgentExecutionView/`                        | [ ]  |

---

## 依存ライブラリ

```bash
# DOMPurify（HTMLサニタイズ）
pnpm --filter @repo/desktop add dompurify
pnpm --filter @repo/desktop add -D @types/dompurify

# marked（Markdownパース）
pnpm --filter @repo/desktop add marked
pnpm --filter @repo/desktop add -D @types/marked
```

---

## 統合テスト連携【必須】

統合ポイントを実装で確実に連携させる:

| 統合ポイント               | 実装確認事項                                  |
| -------------------------- | --------------------------------------------- |
| agentSlice拡張             | 既存状態との競合なし、アクションが正しく動作  |
| SplitLayout↔親             | onRatioChangeが正しく伝播、splitRatioが永続化 |
| ExecutionEnvironment       | 環境タイプに応じた正しいコンポーネント表示    |
| HTMLPreviewEnvironment     | sandbox/CSPが正しく適用、サニタイズが機能     |
| MarkdownPreviewEnvironment | markedとsanitizeHTMLの連携                    |

---

## 成果物

| 成果物         | パス                                      | 説明             |
| -------------- | ----------------------------------------- | ---------------- |
| 型定義         | `packages/shared/src/types/`              | TypeScript型     |
| agentSlice     | `apps/desktop/src/renderer/store/slices/` | 状態管理         |
| コンポーネント | `apps/desktop/src/renderer/components/`   | UIコンポーネント |
| ユーティリティ | `apps/desktop/src/renderer/utils/`        | ヘルパー関数     |
| 実装ログ       | `outputs/phase-5/implementation-log.md`   | 実装履歴         |

---

## 完了条件

- [ ] すべての型定義が実装されている
- [ ] agentSlice拡張が完了している
- [ ] すべてのUIコンポーネントが実装されている
- [ ] セキュリティ対策（sandbox/CSP/sanitize）が実装されている
- [ ] Phase 4のテストがすべてパスする（Green状態）
- [ ] 統合ポイントが正しく動作している
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 依存ライブラリのインストール
2. 型定義の実装（EnvironmentType, EnvironmentConfig, PreviewContent）
3. Skill型の拡張
4. agentSlice拡張の実装
5. sanitizeHTML関数の実装
6. SplitLayoutコンポーネントの実装
7. EnvironmentSelectorコンポーネントの実装
8. ExecutionEnvironmentコンポーネントの実装
9. HTMLPreviewEnvironmentコンポーネントの実装
10. MarkdownPreviewEnvironmentコンポーネントの実装
11. AgentExecutionView統合
12. 全テストがパスすることを確認
13. 成果物の作成・配置
14. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# テスト実行（Green確認）
pnpm --filter @repo/desktop test

# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.mjs docs/30-workflows/custom-environment-ui --phase 5
```

## 次のPhase

Phase 6: テスト拡充
