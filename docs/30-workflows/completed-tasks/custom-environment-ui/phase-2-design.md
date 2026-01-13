# Phase 2: 設計

## メタ情報

| 項目   | 値                    |
| ------ | --------------------- |
| Phase  | 2                     |
| 機能名 | custom-environment-ui |
| 作成日 | 2026-01-13            |

## 目的

要件を実現可能な構造に落とし込む。

## 実行タスク

- アーキテクチャ設計: システム構造の設計とパターン選定
- ドメインモデリング: エンティティ・関係の定義
- コンポーネント設計: UIコンポーネント階層の設計
- セキュリティ設計: iframe sandbox/CSP設計

## 参照資料

| 資料名     | パス                                         | 説明          |
| ---------- | -------------------------------------------- | ------------- |
| 要件定義書 | `outputs/phase-1/requirements-definition.md` | Phase 1成果物 |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料               | パス                                                                         | 内容                   |
| ---------------------- | ---------------------------------------------------------------------------- | ---------------------- |
| UIコンポーネントガイド | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`      | Atomic Design準拠      |
| Agent Execution UI仕様 | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`      | AgentExecutionView構造 |
| Zustand Sliceパターン  | `.claude/skills/aiworkflow-requirements/references/architecture-patterns.md` | agentSlice拡張方法     |
| Electronセキュリティ   | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md` | CSP/sandbox設定        |

---

## 型定義設計

### 環境タイプ

```typescript
// packages/shared/src/types/agent.ts に追加

export type EnvironmentType =
  | "none" // プレビューなし
  | "html" // HTMLプレビュー
  | "markdown" // Markdownプレビュー
  | "terminal" // ターミナル（将来）
  | "code"; // コード実行（将来）

export interface EnvironmentConfig {
  type: EnvironmentType;
  autoRefresh: boolean;
  refreshDebounce: number; // ms
  sandboxFlags?: string[]; // iframe sandbox flags
}

export interface PreviewContent {
  type: EnvironmentType;
  content: string;
  timestamp: Date;
}
```

### Skill型拡張

```typescript
// packages/shared/src/types/skill.ts 拡張

export interface Skill {
  // 既存フィールド...
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

---

## agentSlice拡張設計

```typescript
// apps/desktop/src/renderer/store/slices/agentSlice.ts 拡張

export interface AgentState {
  // 既存フィールド...
  status: AgentExecutionStatus;
  currentSkill: Skill | null;
  messages: AgentMessage[];

  // 追加フィールド（プレビュー状態）
  previewContent: PreviewContent | null;
  selectedEnvironment: EnvironmentType;
  splitRatio: number; // 0-100 (左パネル比率)
}

export interface AgentActions {
  // 既存アクション...

  // 追加アクション
  setPreviewContent: (content: PreviewContent | null) => void;
  setSelectedEnvironment: (type: EnvironmentType) => void;
  setSplitRatio: (ratio: number) => void;
  clearPreview: () => void;
}

// 初期状態
export const initialAgentState: AgentState = {
  // 既存...
  previewContent: null,
  selectedEnvironment: "none",
  splitRatio: 50, // 50%で初期化
};
```

---

## コンポーネント階層設計

```
AgentExecutionView (views)
├── Header
│   ├── BackButton
│   └── SkillInfo
├── SplitLayout (organisms) ← 新規
│   ├── LeftPanel
│   │   └── AgentChatInterface (既存)
│   ├── Divider (ドラッグ可能)
│   └── RightPanel
│       ├── EnvironmentSelector (molecules) ← 新規
│       │   ├── Dropdown (環境選択)
│       │   ├── RefreshButton
│       │   └── FullscreenButton
│       └── ExecutionEnvironment (organisms) ← 新規
│           ├── HTMLPreviewEnvironment ← 新規
│           ├── MarkdownPreviewEnvironment ← 新規
│           └── NoPreviewPlaceholder ← 新規
├── AgentExecutionControls (既存)
├── AgentMessageInput (既存)
└── PermissionDialog (既存)
```

### コンポーネント配置

| コンポーネント             | パス                                                                                  | 種別     |
| -------------------------- | ------------------------------------------------------------------------------------- | -------- |
| SplitLayout                | `apps/desktop/src/renderer/components/organisms/SplitLayout/index.tsx`                | organism |
| EnvironmentSelector        | `apps/desktop/src/renderer/components/molecules/EnvironmentSelector/index.tsx`        | molecule |
| ExecutionEnvironment       | `apps/desktop/src/renderer/components/organisms/ExecutionEnvironment/index.tsx`       | organism |
| HTMLPreviewEnvironment     | `apps/desktop/src/renderer/components/organisms/HTMLPreviewEnvironment/index.tsx`     | organism |
| MarkdownPreviewEnvironment | `apps/desktop/src/renderer/components/organisms/MarkdownPreviewEnvironment/index.tsx` | organism |

---

## レイアウト設計

### 分割レイアウト

```
┌──────────────────────────────────────────────────────────────────┐
│ ← Back   slide-creator                           [⚙️ Settings]   │
├─────────────────────────────┬──┬─────────────────────────────────┤
│                             │  │ [HTML ▼] [↻ Refresh] [⛶ Full]  │
│ ┌─────────────────────────┐ │  │ ┌─────────────────────────────┐ │
│ │ 👤 User                  │ │  │ │                             │ │
│ │ スライドを作成して      │ │  │ │     HTML Preview            │ │
│ └─────────────────────────┘ │◄►│ │                             │ │
│ ┌─────────────────────────┐ │  │ │   <h1>Title</h1>            │ │
│ │ 🤖 Agent                 │ │  │ │   <p>Content...</p>         │ │
│ │ HTMLスライドを生成中... │ │  │ │                             │ │
│ └─────────────────────────┘ │  │ └─────────────────────────────┘ │
│                             │  │                                 │
├─────────────────────────────┴──┴─────────────────────────────────┤
│ [メッセージを入力...                              ] [Send]        │
└──────────────────────────────────────────────────────────────────┘
```

### プレビューなしレイアウト

```
┌──────────────────────────────────────────────────────────────────┐
│ ← Back   general-assistant                       [⚙️ Settings]   │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│ ┌──────────────────────────────────────────────────────────────┐ │
│ │ 👤 User                                                       │ │
│ │ コードをレビューして                                         │ │
│ └──────────────────────────────────────────────────────────────┘ │
│ ┌──────────────────────────────────────────────────────────────┐ │
│ │ 🤖 Agent                                                      │ │
│ │ コードをレビューしています...                                │ │
│ └──────────────────────────────────────────────────────────────┘ │
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│ [メッセージを入力...                              ] [Send]        │
└──────────────────────────────────────────────────────────────────┘
```

---

## セキュリティ設計

### iframe sandbox設定

```typescript
// HTMLPreviewEnvironment

// 許可するsandbox属性
const ALLOWED_SANDBOX_FLAGS = [
  "allow-same-origin", // CSSが動作するために必要
  // 以下は明示的に禁止（デフォルトで無効だが明記）
  // 'allow-scripts',        // スクリプト無効化
  // 'allow-popups',         // ポップアップ禁止
  // 'allow-top-navigation', // トップナビゲーション禁止
  // 'allow-forms',          // フォーム送信禁止
];

// sandbox属性値
const sandboxValue = ALLOWED_SANDBOX_FLAGS.join(" ");
// 結果: "allow-same-origin"
```

### Content Security Policy

```typescript
// HTMLPreviewEnvironment用CSP

const CSP_DIRECTIVES = {
  "default-src": "'self'",
  "script-src": "'none'", // スクリプト完全禁止
  "style-src": "'self' 'unsafe-inline'", // インラインCSS許可
  "img-src": "'self' data: https:", // 画像ソース制限
  "font-src": "'self' https:", // フォントソース制限
  "connect-src": "'none'", // 外部接続禁止
  "frame-ancestors": "'none'", // クリックジャッキング対策
  "base-uri": "'none'", // base要素禁止
  "form-action": "'none'", // フォーム送信禁止
};

const cspString = Object.entries(CSP_DIRECTIVES)
  .map(([key, value]) => `${key} ${value}`)
  .join("; ");
```

### HTMLサニタイズ

```typescript
// プレビュー前のサニタイズ処理

const sanitizeHTML = (html: string): string => {
  // DOMPurify使用を推奨
  // 1. <script>タグの除去
  // 2. onerror等のイベントハンドラ除去
  // 3. javascript: URLの除去
  // 4. data: URL（スクリプト）の除去
  return DOMPurify.sanitize(html, {
    FORBID_TAGS: ["script", "iframe", "object", "embed"],
    FORBID_ATTR: ["onerror", "onload", "onclick", "onmouseover"],
    ALLOW_DATA_ATTR: false,
  });
};
```

---

## データフロー設計

### プレビュー更新フロー

```
1. エージェントがHTMLコンテンツを生成
   ↓
2. ストリーミングハンドラがコンテンツを検出
   ↓
3. agentSlice.setPreviewContent() 呼び出し
   ↓
4. SplitLayout が previewContent を受け取る
   ↓
5. ExecutionEnvironment が環境タイプに応じてレンダリング
   ↓
6. HTMLPreviewEnvironment がサニタイズ後にiframeに表示
```

### 状態管理フロー

```typescript
// 状態更新のシーケンス

// 1. スキル選択時
onSkillSelect(skill) {
  setCurrentSkill(skill);
  setSelectedEnvironment(skill.environment?.type ?? "none");
  clearPreview();
}

// 2. プレビュー更新時（デバウンス適用）
const debouncedSetPreview = useMemo(
  () => debounce((content: PreviewContent) => {
    setPreviewContent(content);
  }, 500),
  []
);

// 3. 環境手動切り替え時
onEnvironmentChange(type) {
  setSelectedEnvironment(type);
}

// 4. 分割比率変更時
onSplitRatioChange(ratio) {
  setSplitRatio(ratio);
  // LocalStorageに永続化
  localStorage.setItem("splitRatio", String(ratio));
}
```

---

## コンポーネントProps設計

### SplitLayout

```typescript
interface SplitLayoutProps {
  leftPanel: React.ReactNode;
  rightPanel: React.ReactNode;
  initialRatio?: number; // 0-100
  minRatio?: number; // 最小比率（デフォルト20）
  maxRatio?: number; // 最大比率（デフォルト80）
  onRatioChange?: (ratio: number) => void;
  showRightPanel?: boolean;
}
```

### EnvironmentSelector

```typescript
interface EnvironmentSelectorProps {
  currentEnvironment: EnvironmentType;
  availableEnvironments: EnvironmentType[];
  onEnvironmentChange: (type: EnvironmentType) => void;
  onRefresh?: () => void;
  onFullscreen?: () => void;
  disabled?: boolean;
}
```

### ExecutionEnvironment

```typescript
interface ExecutionEnvironmentProps {
  environmentType: EnvironmentType;
  content: PreviewContent | null;
  onRefresh?: () => void;
}
```

### HTMLPreviewEnvironment

```typescript
interface HTMLPreviewEnvironmentProps {
  content: string;
  sandboxFlags?: string[];
  csp?: string;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}
```

### MarkdownPreviewEnvironment

```typescript
interface MarkdownPreviewEnvironmentProps {
  content: string;
  className?: string;
}
```

---

## スキルメタデータ拡張

### SKILL.md での環境設定

```markdown
<!-- SKILL.md に追加するセクション -->

## Environment

| 項目        | 値   |
| ----------- | ---- |
| Type        | html |
| AutoRefresh | true |
| Debounce    | 500  |
```

### パース結果の型

```typescript
interface ParsedEnvironmentConfig {
  type: EnvironmentType;
  autoRefresh: boolean;
  debounce: number;
}
```

---

## 統合テスト連携【必須】

統合ポイント/契約（agentSlice拡張、コンポーネント間通信）を設計に反映する:

| 統合ポイント           | 契約定義                                        |
| ---------------------- | ----------------------------------------------- |
| agentSlice拡張         | previewContent, selectedEnvironment, splitRatio |
| SplitLayout↔親         | Props: leftPanel, rightPanel, initialRatio      |
| ExecutionEnvironment   | Props: environmentType, content                 |
| HTMLPreviewEnvironment | Props: content, sandboxFlags, csp               |

---

## 成果物

| 成果物             | パス                                     | 説明             |
| ------------------ | ---------------------------------------- | ---------------- |
| アーキテクチャ     | `outputs/phase-2/architecture-design.md` | システム構造     |
| コンポーネント設計 | `outputs/phase-2/component-design.md`    | UIコンポーネント |
| セキュリティ設計   | `outputs/phase-2/security-design.md`     | sandbox/CSP設計  |
| 型定義設計         | `outputs/phase-2/type-definitions.md`    | TypeScript型     |

---

## 完了条件

- [ ] アーキテクチャが定義されている
- [ ] コンポーネント階層が設計されている
- [ ] 型定義が完成している
- [ ] セキュリティ設計（sandbox/CSP）が完成している
- [ ] agentSlice拡張設計が完成している
- [ ] 要件との整合性が確認されている
- [ ] 統合ポイント/契約が設計に反映されている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 型定義設計（EnvironmentType, EnvironmentConfig, PreviewContent）
3. agentSlice拡張設計
4. コンポーネント階層設計
5. レイアウト設計
6. セキュリティ設計（sandbox/CSP）
7. データフロー設計
8. 成果物の作成・配置
9. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.mjs docs/30-workflows/custom-environment-ui --phase 2
```

## 次のPhase

Phase 3: 設計レビューゲート
