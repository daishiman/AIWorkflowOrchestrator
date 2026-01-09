# カスタム実行環境UI - タスク指示書

## メタ情報

| 項目         | 内容               |
| ------------ | ------------------ |
| タスクID     | AGENT-006          |
| タスク名     | カスタム実行環境UI |
| 分類         | 要件               |
| 対象機能     | エージェント機能   |
| 優先度       | 中                 |
| 見積もり規模 | 大規模             |
| ステータス   | 未実施             |
| 発見元       | ユーザー要求       |
| 発見日       | 2026-01-09         |

---

## 依存関係と並行実行

### 依存関係マップ

```
task-agent-01-dashboard-foundation.md (AGENT-001)
    │
    ├──► task-agent-02-skill-management-ui.md (AGENT-002)
    │
    └──► task-agent-03-skill-management-backend.md (AGENT-003)
              │
              ├──► task-agent-04-execution-ui.md (AGENT-004)
              │
              └──► task-agent-05-claude-code-integration.md (AGENT-005)
                        │
                        ├──► task-agent-06-custom-environment-ui.md (AGENT-006/本タスク)
                        │
                        └──► task-agent-07-environment-backend.md (AGENT-007) ※本タスクと並行可能
```

### 本タスクの位置づけ

| 項目                     | 内容                                                                   |
| ------------------------ | ---------------------------------------------------------------------- |
| 直接依存                 | AGENT-004（エージェント実行UI）, AGENT-005（Claude Code統合）          |
| 並行実行可能             | AGENT-007（実行環境管理バックエンド）※バックエンドはモックで並行開発可 |
| 本タスク完了後に開始可能 | なし（最終タスク）                                                     |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

エージェントが生成した成果物（HTMLスライド、コード、ドキュメント等）をリアルタイムでプレビュー・検証するための専用実行環境が必要。例えば、HTMLスライド作成スキルを使用した場合、生成されたHTMLをその場でプレビューできる環境が求められる。

### 1.2 問題点・課題

- 生成されたHTMLをプレビューする機能がない
- スキルごとに異なる実行環境（HTML、Markdown、コード実行等）を提供する仕組みがない
- エージェントの出力結果を視覚的に確認する手段がチャット表示のみ

### 1.3 放置した場合の影響

- 生成物の確認のために外部ツールへの切り替えが必要
- 開発フローが断片化し、生産性が低下
- エージェント機能の価値が大幅に減少

---

## 2. 何を達成するか（What）

### 2.1 目的

スキルの種類に応じたカスタム実行環境（HTMLプレビュー、Markdownプレビュー等）を提供し、エージェントの出力結果をリアルタイムで確認できるようにする。

### 2.2 最終ゴール

- スキル設定に基づいて適切な実行環境が自動選択される
- HTMLプレビュー環境でHTMLコンテンツを表示できる
- プレビューがリアルタイムで更新される
- プレビューと チャットが分割表示される
- 将来的な環境拡張が容易な設計

### 2.3 スコープ

#### 含むもの

- ExecutionEnvironmentコンテナコンポーネント
- HTMLPreviewEnvironmentコンポーネント
- MarkdownPreviewEnvironmentコンポーネント（基本実装）
- 環境切り替えロジック
- 分割レイアウト（チャット + プレビュー）
- 環境設定のスキルメタデータ定義

#### 含まないもの

- コード実行環境（サンドボックス必要、将来タスク）
- ターミナルエミュレータ（将来タスク）
- バックエンド実行環境管理（別タスク: AGENT-007）

### 2.4 成果物

| 成果物                     | パス                                                                                  |
| -------------------------- | ------------------------------------------------------------------------------------- |
| ExecutionEnvironment       | `apps/desktop/src/renderer/components/organisms/ExecutionEnvironment/index.tsx`       |
| HTMLPreviewEnvironment     | `apps/desktop/src/renderer/components/organisms/HTMLPreviewEnvironment/index.tsx`     |
| MarkdownPreviewEnvironment | `apps/desktop/src/renderer/components/organisms/MarkdownPreviewEnvironment/index.tsx` |
| EnvironmentSelector        | `apps/desktop/src/renderer/components/molecules/EnvironmentSelector/index.tsx`        |
| SplitLayout                | `apps/desktop/src/renderer/components/organisms/SplitLayout/index.tsx`                |
| AgentExecutionView更新     | `apps/desktop/src/renderer/views/AgentExecutionView/index.tsx`                        |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- AGENT-001（エージェントダッシュボード基盤）が完了している
- AGENT-002（スキル管理UI）が完了している
- AGENT-003（エージェント実行UI）が完了している

### 3.2 依存タスク

- AGENT-001: エージェントダッシュボード基盤
- AGENT-002: スキル管理UI
- AGENT-003: エージェント実行UI
- AGENT-007: 実行環境管理バックエンド（並行開発可能）

### 3.3 必要な知識・スキル

- React/TypeScript
- Electron webview / iframe セキュリティ
- サンドボックス化
- 分割レイアウト実装

### 3.4 推奨アプローチ

1. 環境タイプの型定義
2. SplitLayoutコンポーネント実装
3. ExecutionEnvironmentコンテナ実装
4. HTMLPreviewEnvironment実装（iframe + sandbox）
5. MarkdownPreviewEnvironment実装
6. AgentExecutionViewへの統合
7. スキルメタデータへの環境設定追加

---

## 4. 実行手順

### Phase構成

Phase 1-13の標準フローに従って実装する。

### Phase 1: 要件定義

#### 使用スキル

| スキル名                    | パス                                                  | 選定理由                                |
| --------------------------- | ----------------------------------------------------- | --------------------------------------- |
| acceptance-criteria-writing | `.claude/skills/acceptance-criteria-writing/SKILL.md` | Given-When-Then形式で受け入れ基準を定義 |

#### 受け入れ基準（Given-When-Then）

```gherkin
Feature: カスタム実行環境UI

Scenario: HTMLスキルでHTMLプレビューが表示される
  Given ユーザーがHTMLスライド作成スキルを選択している
  When エージェントがHTMLコンテンツを生成する
  Then 右側パネルにHTMLプレビューが表示される
  And プレビューはサンドボックス化されている

Scenario: プレビューがリアルタイムで更新される
  Given ユーザーがHTMLプレビュー環境を使用している
  When エージェントが追加のHTMLコンテンツを生成する
  Then プレビューが自動的に更新される

Scenario: チャットとプレビューが分割表示される
  Given ユーザーがカスタム環境対応スキルを実行している
  When 実行画面が表示される
  Then 画面が左右に分割される
  And 左側にチャット、右側にプレビューが表示される

Scenario: 分割比率を調整できる
  Given 分割レイアウトが表示されている
  When 分割バーをドラッグする
  Then 左右のパネル比率が変更される

Scenario: 環境を手動で切り替えられる
  Given 複数の環境タイプがサポートされている
  When 環境セレクターで別の環境を選択する
  Then 右側パネルの環境が切り替わる

Scenario: プレビュー内でスクリプトが隔離されている
  Given HTMLプレビューが表示されている
  When HTMLに悪意のあるスクリプトが含まれている
  Then スクリプトは親ウィンドウにアクセスできない
  And アラートやリダイレクトは抑制される
```

#### 成果物

- `outputs/phase-1/requirements.md`

#### 完了条件

- [ ] 受け入れ基準がGiven-When-Then形式で定義されている
- [ ] セキュリティ要件が定義されている

---

### Phase 2: 設計

#### 使用スキル

| スキル名          | パス                                        | 選定理由           |
| ----------------- | ------------------------------------------- | ------------------ |
| responsive-design | `.claude/skills/responsive-design/SKILL.md` | 分割レイアウト設計 |
| domain-modeling   | `.claude/skills/domain-modeling/SKILL.md`   | 環境モデル設計     |

#### 設計内容

**1. 環境タイプの型定義**

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

export interface Skill {
  // 既存フィールド...
  environment?: EnvironmentConfig; // 追加
}

export interface PreviewContent {
  type: EnvironmentType;
  content: string;
  timestamp: Date;
}
```

**2. agentSlice拡張**

```typescript
// agentSlice.ts 追加
export interface AgentSlice {
  // 既存フィールド...

  // プレビュー状態
  previewContent: PreviewContent | null;
  selectedEnvironment: EnvironmentType;
  splitRatio: number; // 0-100 (左パネル比率)

  // アクション
  setPreviewContent: (content: PreviewContent) => void;
  setSelectedEnvironment: (type: EnvironmentType) => void;
  setSplitRatio: (ratio: number) => void;
  clearPreview: () => void;
}
```

**3. コンポーネント構造**

```
AgentExecutionView
├── SplitLayout (organism)
│   ├── LeftPanel
│   │   └── AgentChatInterface (existing)
│   ├── Divider (ドラッグ可能)
│   └── RightPanel
│       ├── EnvironmentSelector (molecule)
│       └── ExecutionEnvironment (organism)
│           ├── HTMLPreviewEnvironment
│           ├── MarkdownPreviewEnvironment
│           └── (future environments...)
```

**4. レイアウト設計**

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

**5. HTMLプレビューのセキュリティ**

```typescript
// HTMLPreviewEnvironment
const sandboxFlags = [
  "allow-same-origin", // CSSが動作するために必要
  // 'allow-scripts',   // スクリプト無効化
  // 'allow-popups',    // ポップアップ禁止
  // 'allow-top-navigation', // トップナビゲーション禁止
];

// Content Security Policy
const csp = `
  default-src 'self';
  script-src 'none';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
`;
```

**6. スキルへの環境設定追加**

```markdown
<!-- SKILL.md に追加 -->

## Environment

| Type | AutoRefresh | Debounce |
| ---- | ----------- | -------- |
| html | true        | 500ms    |
```

#### 成果物

- `outputs/phase-2/design.md`
- セキュリティ設計書

#### 完了条件

- [ ] 型定義が完成している
- [ ] セキュリティ設計が完成している
- [ ] コンポーネント構造が設計されている

---

### Phase 3: 設計レビューゲート

#### 使用スキル

| スキル名             | パス                                           | 選定理由         |
| -------------------- | ---------------------------------------------- | ---------------- |
| code-smell-detection | `.claude/skills/code-smell-detection/SKILL.md` | 設計品質チェック |

#### セキュリティレビュー項目

- [ ] iframe sandboxフラグが適切
- [ ] CSPが適切に設定されている
- [ ] XSS対策が考慮されている
- [ ] 親ウィンドウへのアクセスが制限されている

#### 完了条件

- [ ] セキュリティレビューが完了している
- [ ] 拡張性が確保されている

---

### Phase 4: テスト作成

#### 使用スキル

| スキル名       | パス                                     | 選定理由        |
| -------------- | ---------------------------------------- | --------------- |
| tdd-principles | `.claude/skills/tdd-principles/SKILL.md` | TDDでテスト先行 |

#### テストケース

```typescript
// SplitLayout.test.tsx
describe("SplitLayout", () => {
  it("should render left and right panels", () => {});
  it("should handle divider drag", () => {});
  it("should respect min/max ratios", () => {});
  it("should persist ratio to store", () => {});
});

// ExecutionEnvironment.test.tsx
describe("ExecutionEnvironment", () => {
  it("should render correct environment based on type", () => {});
  it("should show placeholder when no content", () => {});
});

// HTMLPreviewEnvironment.test.tsx
describe("HTMLPreviewEnvironment", () => {
  it("should render HTML content in iframe", () => {});
  it("should apply sandbox flags", () => {});
  it("should update on content change", () => {});
  it("should debounce updates", () => {});
});

// EnvironmentSelector.test.tsx
describe("EnvironmentSelector", () => {
  it("should display current environment", () => {});
  it("should show available environments", () => {});
  it("should call onChange when selected", () => {});
});
```

#### 完了条件

- [ ] 各コンポーネントのテストがある
- [ ] セキュリティテストがある
- [ ] すべてのテストが失敗状態（Red）

---

### Phase 5: 実装

#### 使用スキル

| スキル名          | パス                                        | 選定理由           |
| ----------------- | ------------------------------------------- | ------------------ |
| responsive-design | `.claude/skills/responsive-design/SKILL.md` | 分割レイアウト実装 |

#### 実装ファイル

1. `packages/shared/src/types/agent.ts`（更新）
2. `apps/desktop/src/renderer/store/slices/agentSlice.ts`（更新）
3. `apps/desktop/src/renderer/components/organisms/SplitLayout/index.tsx`
4. `apps/desktop/src/renderer/components/molecules/EnvironmentSelector/index.tsx`
5. `apps/desktop/src/renderer/components/organisms/ExecutionEnvironment/index.tsx`
6. `apps/desktop/src/renderer/components/organisms/HTMLPreviewEnvironment/index.tsx`
7. `apps/desktop/src/renderer/components/organisms/MarkdownPreviewEnvironment/index.tsx`
8. `apps/desktop/src/renderer/views/AgentExecutionView/index.tsx`（更新）

#### 完了条件

- [ ] 全コンポーネントが実装されている
- [ ] 分割レイアウトが動作する
- [ ] HTMLプレビューが表示される
- [ ] セキュリティ対策が実装されている
- [ ] テストがすべて通過（Green）

---

### Phase 6-13: 標準フロー

標準のPhase 6-13フローに従って実装を完了する。

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] HTMLプレビューが表示される
- [ ] プレビューがリアルタイムで更新される
- [ ] チャットとプレビューが分割表示される
- [ ] 分割比率を調整できる
- [ ] 環境を手動で切り替えられる

### セキュリティ要件

- [ ] iframe sandboxが適用されている
- [ ] スクリプト実行が無効化されている
- [ ] 親ウィンドウへのアクセスが制限されている

### 品質要件

- [ ] テストカバレッジ: Line 80%以上
- [ ] TypeScript型エラーなし
- [ ] ESLint/Prettierエラーなし

### ドキュメント要件

- [ ] セキュリティガイドラインが文書化されている
- [ ] 新規環境追加手順が文書化されている

---

## 6. 検証方法

### テストケース

```bash
# ユニットテスト
pnpm --filter @repo/desktop test src/renderer/components/organisms/SplitLayout/
pnpm --filter @repo/desktop test src/renderer/components/organisms/HTMLPreviewEnvironment/
```

### 検証手順

1. HTMLスキルを選択して実行
2. エージェントにHTMLを生成させる
3. 右側パネルにプレビューが表示されることを確認
4. 分割バーをドラッグして比率変更を確認
5. 環境セレクターで切り替えを確認
6. DevToolsでiframe sandboxが適用されていることを確認

### セキュリティ検証

```html
<!-- テスト用悪意のあるHTML -->
<script>
  alert("XSS");
</script>
<script>
  window.parent.location = "https://evil.com";
</script>
<a href="javascript:alert('XSS')">Click</a>
```

上記が実行されないことを確認する。

---

## 7. リスクと対策

| リスク                         | 影響度 | 発生確率 | 対策                             |
| ------------------------------ | ------ | -------- | -------------------------------- |
| XSS攻撃                        | 高     | 中       | sandbox + CSP + スクリプト無効化 |
| iframe内のリソース読み込み失敗 | 中     | 中       | data URLまたはblob URLを使用     |
| 大量HTMLでのパフォーマンス低下 | 中     | 中       | debounce + 仮想化検討            |

---

## 8. 参照情報

### 関連ドキュメント

- [MDN: iframe sandbox](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe#attr-sandbox)
- [Electron Security](https://www.electronjs.org/docs/latest/tutorial/security)

### 参考資料

- [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [react-split-pane](https://github.com/tomkp/react-split-pane)

---

## 9. 備考

### 補足事項

- 初期実装はHTML/Markdownのみ対応
- コード実行環境は将来タスクとして分離（サンドボックス実装が複雑）
- プレビュー内でのインタラクション（クリック等）は基本的に無効化
- フルスクリーン表示機能は追加検討

### 将来の拡張候補

| 環境タイプ | 概要                         | 優先度 |
| ---------- | ---------------------------- | ------ |
| terminal   | ターミナルエミュレータ       | 中     |
| code       | コード実行（サンドボックス） | 低     |
| diagram    | Mermaid/PlantUML表示         | 低     |
| pdf        | PDF表示                      | 低     |
