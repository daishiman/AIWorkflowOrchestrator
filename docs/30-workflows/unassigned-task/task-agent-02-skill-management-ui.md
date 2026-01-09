# スキル管理UI - タスク指示書

## メタ情報

| 項目         | 内容             |
| ------------ | ---------------- |
| タスクID     | AGENT-002        |
| タスク名     | スキル管理UI     |
| 分類         | 要件             |
| 対象機能     | エージェント機能 |
| 優先度       | 高               |
| 見積もり規模 | 中規模           |
| ステータス   | 未実施           |
| 発見元       | ユーザー要求     |
| 発見日       | 2026-01-09       |

---

## 依存関係と並行実行

### 依存関係マップ

```
task-agent-01-dashboard-foundation.md (AGENT-001)
    │
    ├──► task-agent-02-skill-management-ui.md (AGENT-002/本タスク)
    │
    └──► task-agent-03-skill-management-backend.md (AGENT-003) ※本タスクと並行可能
              │
              └──► task-agent-04-execution-ui.md (AGENT-004)
```

### 本タスクの位置づけ

| 項目                     | 内容                                                         |
| ------------------------ | ------------------------------------------------------------ |
| 直接依存                 | AGENT-001（エージェントダッシュボード基盤）                  |
| 並行実行可能             | AGENT-003（スキル管理バックエンド）※モックデータで並行開発可 |
| 本タスク完了後に開始可能 | AGENT-004（エージェント実行UI）                              |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

Claude Codeの`.claude/skills/`ディレクトリに存在するスキルをユーザーが視覚的に確認・選択・管理できるUIが必要。現状、スキルはCLI経由でのみアクセス可能で、GUIからの管理機能がない。

### 1.2 問題点・課題

- スキルの一覧を確認するUIがない
- スキルの詳細情報（Trigger、Anchor、説明）を表示する手段がない
- スキルを検索・フィルタリングする機能がない
- スキルを選択して実行する導線がない

### 1.3 放置した場合の影響

- ユーザーが利用可能なスキルを把握できない
- スキル選択が困難になり、エージェント機能の利用率が低下
- スキル管理のためにCLIへ戻る必要があり、UXが悪化

---

## 2. 何を達成するか（What）

### 2.1 目的

AgentView内にスキルインポート・一覧・検索・詳細表示機能を実装し、ユーザーが必要なスキルを選択的にインポートして管理・実行できるようにする。

### 2.2 最終ゴール

- `.claude/skills/`から利用可能なスキルを一覧表示し、インポートするスキルを選択できる
- インポート済みスキルがカード形式で表示される
- スキルを名前・Triggerキーワードで検索できる
- スキルをカテゴリでフィルタリングできる
- スキルをクリックすると詳細パネルが表示される
- 詳細パネルから実行画面へ遷移できる
- インポートしたスキル設定が永続化される

### 2.3 スコープ

#### 含むもの

- SkillImportDialogコンポーネント（スキルインポート選択ダイアログ）
- SkillListコンポーネント（インポート済みカード一覧）
- SkillCardコンポーネント（個別カード）
- SkillDetailPanelコンポーネント（詳細表示）
- SkillSearchBarコンポーネント（検索バー）
- SkillCategoryFilterコンポーネント（カテゴリフィルター）
- スキルインポート/削除のIPC呼び出し
- インポート設定の永続化

#### 含まないもの

- スキル実行機能（別タスク: AGENT-004）
- スキル編集機能（スコープ外）
- スキル新規作成機能（スコープ外）
- バックエンド実装（別タスク: AGENT-003）

### 2.4 成果物

| 成果物              | パス                                                                           |
| ------------------- | ------------------------------------------------------------------------------ |
| SkillImportDialog   | `apps/desktop/src/renderer/components/organisms/SkillImportDialog/index.tsx`   |
| SkillList           | `apps/desktop/src/renderer/components/organisms/SkillList/index.tsx`           |
| SkillCard           | `apps/desktop/src/renderer/components/molecules/SkillCard/index.tsx`           |
| SkillDetailPanel    | `apps/desktop/src/renderer/components/organisms/SkillDetailPanel/index.tsx`    |
| SkillSearchBar      | `apps/desktop/src/renderer/components/molecules/SkillSearchBar/index.tsx`      |
| SkillCategoryFilter | `apps/desktop/src/renderer/components/molecules/SkillCategoryFilter/index.tsx` |
| AgentView更新       | `apps/desktop/src/renderer/views/AgentView/index.tsx`                          |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- AGENT-001（エージェントダッシュボード基盤）が完了している
- AGENT-005（スキル管理バックエンド）が完了している、またはモックデータで開発

### 3.2 依存タスク

- AGENT-001: エージェントダッシュボード基盤
- AGENT-005: スキル管理バックエンド（並行開発可能、モック使用）

### 3.3 必要な知識・スキル

- React/TypeScript
- Atomic Design（molecules/organisms）
- Tailwind CSS
- Zustand状態管理

### 3.4 推奨アプローチ

1. Skill型定義を共有パッケージに追加
2. モックデータでUIコンポーネントを先行開発
3. SkillCardから実装開始（最小単位）
4. SkillListでカード一覧を構成
5. 検索・フィルター機能を追加
6. SkillDetailPanelを実装
7. AgentViewに統合

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
Feature: スキル管理UI

Scenario: スキルインポートダイアログを開く
  Given ユーザーがAgentViewを開いている
  When 「スキルをインポート」ボタンをクリックする
  Then スキルインポートダイアログが表示される
  And .claude/skills/配下の利用可能なスキル一覧が表示される

Scenario: スキルを選択してインポートする
  Given スキルインポートダイアログが表示されている
  And 3つのスキルにチェックを入れている
  When 「インポート」ボタンをクリックする
  Then 選択した3つのスキルがインポートされる
  And AgentViewのスキル一覧に追加される
  And インポート設定が永続化される

Scenario: インポート済みスキル一覧が表示される
  Given ユーザーがAgentViewを開いている
  And 5件のスキルがインポート済みである
  When 画面が読み込まれる
  Then インポート済みスキルがカード形式で一覧表示される
  And 各カードにスキル名と説明が表示される

Scenario: スキルを名前で検索できる
  Given ユーザーがスキル一覧を表示している
  When 検索バーに「tdd」と入力する
  Then 名前またはTriggerに「tdd」を含むスキルのみ表示される

Scenario: スキルをカテゴリでフィルタリングできる
  Given ユーザーがスキル一覧を表示している
  When カテゴリフィルターで「テスト」を選択する
  Then テストカテゴリのスキルのみ表示される

Scenario: スキル詳細を表示できる
  Given ユーザーがスキル一覧を表示している
  When スキルカードをクリックする
  Then 右側にスキル詳細パネルが表示される
  And スキル名、説明、Trigger、Anchorsが表示される

Scenario: スキル詳細から実行画面へ遷移できる
  Given ユーザーがスキル詳細パネルを表示している
  When 「実行」ボタンをクリックする
  Then エージェント実行画面に遷移する
  And 選択したスキルが実行対象として設定される

Scenario: インポート済みスキルを削除できる
  Given ユーザーがスキル詳細パネルを表示している
  When 「削除」ボタンをクリックする
  And 確認ダイアログで「はい」を選択する
  Then スキルがインポート一覧から削除される
  And 設定が永続化される
```

#### 成果物

- `outputs/phase-1/requirements.md`

#### 完了条件

- [ ] 受け入れ基準がGiven-When-Then形式で定義されている
- [ ] UIワイヤーフレームが作成されている

---

### Phase 2: 設計

#### 使用スキル

| スキル名          | パス                                        | 選定理由                         |
| ----------------- | ------------------------------------------- | -------------------------------- |
| responsive-design | `.claude/skills/responsive-design/SKILL.md` | レスポンシブUIコンポーネント設計 |
| domain-modeling   | `.claude/skills/domain-modeling/SKILL.md`   | Skillドメインモデル設計          |

#### 設計内容

**1. Skill型定義（packages/shared）**

```typescript
// packages/shared/src/types/agent.ts
export interface Skill {
  id: string; // ユニーク識別子（パスのハッシュ）
  name: string; // スキル名（SKILL.md解析）
  slug: string; // ディレクトリ名
  description: string; // 概要説明
  path: string; // .claude/skills/xxx/SKILL.md
  triggers: string[]; // Triggerキーワード
  anchors: Anchor[]; // Anchor一覧
  category?: string; // カテゴリ（推論または手動設定）
  lastUpdated?: string; // 最終更新日
}

export interface Anchor {
  source: string; // 参考文献名
  application: string; // 適用方法
  purpose: string; // 目的
}

export interface SkillExecutionRequest {
  skillId: string;
  args?: string;
  workingDirectory?: string;
}

export interface SkillExecutionResult {
  success: boolean;
  output: string[];
  error?: string;
  exitCode?: number;
}
```

**2. コンポーネント構造**

```
AgentView
├── SkillSearchBar (molecule)
├── SkillCategoryFilter (molecule)
├── SkillList (organism)
│   └── SkillCard[] (molecule)
└── SkillDetailPanel (organism)
    ├── SkillHeader
    ├── SkillDescription
    ├── SkillTriggers
    ├── SkillAnchors
    └── ExecuteButton
```

**3. レイアウト設計**

```
┌──────────────────────────────────────────────────────────────┐
│ Agent Dashboard                                              │
├──────────────────────────────────────────────────────────────┤
│ [🔍 Search skills...        ] [Category ▼]                   │
├────────────────────────────────────┬─────────────────────────┤
│ ┌──────────┐ ┌──────────┐ ┌──────┐│ Skill Details           │
│ │ Skill 1  │ │ Skill 2  │ │ ...  ││                         │
│ │ desc...  │ │ desc...  │ │      ││ Name: tdd-principles    │
│ └──────────┘ └──────────┘ └──────┘│ Description: ...        │
│ ┌──────────┐ ┌──────────┐         │ Triggers: tdd, test...  │
│ │ Skill 4  │ │ Skill 5  │         │ Anchors:                │
│ │ desc...  │ │ desc...  │         │  - Clean Code           │
│ └──────────┘ └──────────┘         │  - TDD by Example       │
│                                   │                         │
│                                   │ [🚀 Execute]            │
└────────────────────────────────────┴─────────────────────────┘
```

**4. SkillCardコンポーネント**

```typescript
interface SkillCardProps {
  skill: Skill;
  isSelected: boolean;
  onClick: () => void;
}
```

**5. agentSlice更新**

```typescript
// agentSlice.ts に追加
isLoadingSkills: boolean;
skillLoadError: string | null;
fetchSkills: () => Promise<void>;
```

#### 成果物

- `outputs/phase-2/design.md`
- UIワイヤーフレーム

#### 完了条件

- [ ] 型定義が完成している
- [ ] コンポーネント構造が設計されている
- [ ] レイアウトが設計されている

---

### Phase 3: 設計レビューゲート

#### 使用スキル

| スキル名             | パス                                           | 選定理由             |
| -------------------- | ---------------------------------------------- | -------------------- |
| code-smell-detection | `.claude/skills/code-smell-detection/SKILL.md` | 設計品質チェック     |
| accessibility-wcag   | `.claude/skills/accessibility-wcag/SKILL.md`   | アクセシビリティ確認 |

#### 完了条件

- [ ] Atomic Design原則に従っている
- [ ] アクセシビリティ要件を満たしている
- [ ] レスポンシブ設計されている

---

### Phase 4: テスト作成

#### 使用スキル

| スキル名       | パス                                     | 選定理由        |
| -------------- | ---------------------------------------- | --------------- |
| tdd-principles | `.claude/skills/tdd-principles/SKILL.md` | TDDでテスト先行 |

#### テストケース

```typescript
// SkillCard.test.tsx
describe("SkillCard", () => {
  it("should display skill name and description", () => {});
  it("should highlight when selected", () => {});
  it("should call onClick when clicked", () => {});
  it("should display trigger badges", () => {});
});

// SkillList.test.tsx
describe("SkillList", () => {
  it("should render skill cards", () => {});
  it("should display loading state", () => {});
  it("should display empty state when no skills", () => {});
  it("should filter skills by search term", () => {});
  it("should filter skills by category", () => {});
});

// SkillDetailPanel.test.tsx
describe("SkillDetailPanel", () => {
  it("should display skill details", () => {});
  it("should display anchors list", () => {});
  it("should call onExecute when button clicked", () => {});
});

// SkillSearchBar.test.tsx
describe("SkillSearchBar", () => {
  it("should update filter on input", () => {});
  it("should debounce input", () => {});
});
```

#### 完了条件

- [ ] 各コンポーネントのユニットテストがある
- [ ] フィルタリングロジックのテストがある
- [ ] すべてのテストが失敗状態（Red）

---

### Phase 5: 実装

#### 使用スキル

| スキル名          | パス                                        | 選定理由           |
| ----------------- | ------------------------------------------- | ------------------ |
| responsive-design | `.claude/skills/responsive-design/SKILL.md` | レスポンシブUI実装 |

#### 実装ファイル

1. `packages/shared/src/types/agent.ts`
2. `apps/desktop/src/renderer/components/molecules/SkillCard/index.tsx`
3. `apps/desktop/src/renderer/components/molecules/SkillSearchBar/index.tsx`
4. `apps/desktop/src/renderer/components/molecules/SkillCategoryFilter/index.tsx`
5. `apps/desktop/src/renderer/components/organisms/SkillList/index.tsx`
6. `apps/desktop/src/renderer/components/organisms/SkillDetailPanel/index.tsx`
7. `apps/desktop/src/renderer/views/AgentView/index.tsx`（更新）
8. `apps/desktop/src/renderer/store/slices/agentSlice.ts`（更新）

#### 完了条件

- [ ] 全コンポーネントが実装されている
- [ ] スキル一覧が表示される
- [ ] 検索・フィルタリングが動作する
- [ ] 詳細パネルが表示される
- [ ] テストがすべて通過（Green）

---

### Phase 6-13: 標準フロー

標準のPhase 6-13フローに従って実装を完了する。

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] スキル一覧がカード形式で表示される
- [ ] スキルを名前・Triggerで検索できる
- [ ] スキルをカテゴリでフィルタリングできる
- [ ] スキル詳細パネルが表示される
- [ ] 「実行」ボタンから実行画面へ遷移できる

### 品質要件

- [ ] テストカバレッジ: Line 80%以上
- [ ] TypeScript型エラーなし
- [ ] ESLint/Prettierエラーなし
- [ ] WCAGアクセシビリティ基準を満たす

### ドキュメント要件

- [ ] コンポーネントにJSDocコメントがある
- [ ] Storybookストーリーがある（任意）

---

## 6. 検証方法

### テストケース

```bash
# ユニットテスト
pnpm --filter @repo/desktop test src/renderer/components/molecules/SkillCard/
pnpm --filter @repo/desktop test src/renderer/components/organisms/SkillList/
pnpm --filter @repo/desktop test src/renderer/components/organisms/SkillDetailPanel/
```

### 検証手順

1. AgentViewを開く
2. スキル一覧が表示されることを確認
3. 検索バーに文字を入力してフィルタリングされることを確認
4. カテゴリフィルターでフィルタリングされることを確認
5. スキルカードをクリックして詳細パネルが表示されることを確認
6. 「実行」ボタンをクリックして実行画面へ遷移することを確認

---

## 7. リスクと対策

| リスク                                 | 影響度 | 発生確率 | 対策                           |
| -------------------------------------- | ------ | -------- | ------------------------------ |
| スキルが大量にある場合のパフォーマンス | 中     | 中       | 仮想スクロール実装を検討       |
| SKILL.md形式の不統一                   | 中     | 高       | 堅牢なパーサーと fallback 実装 |
| モバイル表示での詳細パネル             | 低     | 中       | モーダル表示に切り替え         |

---

## 8. 参照情報

### 関連ドキュメント

- `.claude/skills/skill-list.md` - 既存スキル一覧
- `apps/desktop/src/renderer/components/` - 既存コンポーネント参照
- `apps/desktop/src/renderer/views/DashboardView/` - 類似ビュー実装例

### 参考資料

- [Tailwind CSS](https://tailwindcss.com/docs)
- [Lucide Icons](https://lucide.dev/icons/)

---

## 9. 備考

### 補足事項

- スキルカードのデザインはGlassPanelスタイルを踏襲
- カテゴリは自動推論（Triggerキーワードベース）+ 手動オーバーライド
- 検索はdebounce 300ms で実装
