# Phase 12: ドキュメント更新 - タスク仕様書

## メタ情報

| 項目       | 内容                |
| ---------- | ------------------- |
| Phase      | 12                  |
| Phase名    | ドキュメント更新    |
| 前提Phase  | Phase 11            |
| 後続Phase  | Phase 13            |
| ステータス | 未実施              |
| 作成日     | 2026-01-10          |
| 機能名     | skill-management-ui |

---

## 目的

実装完了後、ドキュメントを最新の実装に合わせて更新し、保守性を確保する。

## 背景

ドキュメントは実装と同期していることが重要。実装完了後に設計書・API仕様・使い方ガイドを更新し、将来の保守・拡張を容易にする。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 設計書の更新

**目的**: Phase 2で作成した設計書を実装に合わせて更新する

**実行手順**:

1. `outputs/phase-2/design.md`を確認
2. 実装との差異を特定
3. 以下の項目を更新:

| 更新項目                      | 確認 |
| ----------------------------- | ---- |
| コンポーネント構成図          | [ ]  |
| 型定義（Skill型、State型）    | [ ]  |
| IPC APIインターフェース       | [ ]  |
| 状態管理設計（Zustand Slice） | [ ]  |
| レイアウト設計                | [ ]  |
| 実装上の変更点の反映          | [ ]  |

**期待される成果物**:

- 更新済み設計書（`outputs/phase-12/updated-design.md`）

---

### タスク2: コンポーネントドキュメントの作成

**目的**: 各コンポーネントの使い方・Props・使用例を文書化する

**実行手順**:

1. 各コンポーネントのドキュメントを作成:

```markdown
## SkillCard

### 概要

スキル情報をカード形式で表示するコンポーネント。

### Props

| Prop       | Type       | Required | Default | Description              |
| ---------- | ---------- | -------- | ------- | ------------------------ |
| skill      | Skill      | Yes      | -       | 表示するスキル情報       |
| isSelected | boolean    | No       | false   | 選択状態                 |
| onClick    | () => void | No       | -       | クリック時のコールバック |

### 使用例

\`\`\`tsx
<SkillCard
skill={skill}
isSelected={selectedId === skill.id}
onClick={() => handleSelect(skill.id)}
/>
\`\`\`
```

2. 以下のコンポーネントについてドキュメント作成:

| コンポーネント      | ドキュメント | 確認 |
| ------------------- | ------------ | ---- |
| SkillCard           | [ ]          | [ ]  |
| SkillList           | [ ]          | [ ]  |
| SkillDetailPanel    | [ ]          | [ ]  |
| SkillImportDialog   | [ ]          | [ ]  |
| SkillSearchBar      | [ ]          | [ ]  |
| SkillCategoryFilter | [ ]          | [ ]  |

**期待される成果物**:

- コンポーネントドキュメント（`outputs/phase-12/component-docs.md`）

---

### タスク3: IPC APIドキュメントの作成

**目的**: IPC通信のAPIインターフェースを文書化する

**実行手順**:

1. IPC APIドキュメントを作成:

```markdown
## Skill IPC API

### skill:list

インポート済みスキル一覧を取得する。

**Request**
\`\`\`typescript
// パラメータなし
ipcRenderer.invoke('skill:list')
\`\`\`

**Response**
\`\`\`typescript
interface SkillListResponse {
skills: Skill[];
}
\`\`\`

**エラー**
| Code | Message | 対処 |
| ---- | ------- | ---- |
| SKILL_DIR_NOT_FOUND | スキルディレクトリが見つかりません | パス設定を確認 |
```

2. 以下のAPIについてドキュメント作成:

| API             | ドキュメント | 確認 |
| --------------- | ------------ | ---- |
| skill:list      | [ ]          | [ ]  |
| skill:available | [ ]          | [ ]  |
| skill:import    | [ ]          | [ ]  |
| skill:remove    | [ ]          | [ ]  |
| skill:search    | [ ]          | [ ]  |
| config:get      | [ ]          | [ ]  |
| config:set      | [ ]          | [ ]  |

**期待される成果物**:

- IPC APIドキュメント（`outputs/phase-12/ipc-api-docs.md`）

---

### タスク4: 状態管理ドキュメントの作成

**目的**: Zustand Sliceの状態管理パターンを文書化する

**実行手順**:

1. 状態管理ドキュメントを作成:

```markdown
## Skill State Management

### SkillSlice

\`\`\`typescript
interface SkillSlice {
// State
skills: Skill[];
selectedSkillId: string | null;
searchQuery: string;
categoryFilter: SkillCategory | null;
isLoading: boolean;
error: string | null;

// Actions
fetchSkills: () => Promise<void>;
selectSkill: (id: string) => void;
setSearchQuery: (query: string) => void;
setCategoryFilter: (category: SkillCategory | null) => void;
importSkill: (skillId: string) => Promise<void>;
removeSkill: (skillId: string) => Promise<void>;
}
\`\`\`

### 使用パターン

\`\`\`tsx
const { skills, isLoading, fetchSkills } = useSkillStore();

useEffect(() => {
fetchSkills();
}, [fetchSkills]);
\`\`\`
```

2. ドキュメント内容確認:

| 項目                       | 確認 |
| -------------------------- | ---- |
| State定義                  | [ ]  |
| Actions定義                | [ ]  |
| Selectors定義              | [ ]  |
| 使用パターン例             | [ ]  |
| エラーハンドリングパターン | [ ]  |

**期待される成果物**:

- 状態管理ドキュメント（`outputs/phase-12/state-management-docs.md`）

---

### タスク5: 実装ガイドの作成

**目的**: 今後の保守・拡張のための実装ガイドを作成する

**実行手順**:

1. 実装ガイドを作成:

```markdown
# スキル管理UI 実装ガイド

## 概要

このドキュメントは、スキル管理UIの実装・保守・拡張のためのガイドです。

## アーキテクチャ

[アーキテクチャ図]

## ディレクトリ構成

\`\`\`
apps/desktop/src/renderer/
├── components/
│ ├── molecules/
│ │ ├── SkillCard/
│ │ ├── SkillSearchBar/
│ │ └── SkillCategoryFilter/
│ └── organisms/
│ ├── SkillList/
│ ├── SkillDetailPanel/
│ └── SkillImportDialog/
├── views/
│ └── AgentView/
└── store/
└── slices/
└── skillSlice.ts
\`\`\`

## 拡張ポイント

- 新しいスキルカテゴリの追加
- カスタムフィルターの追加
- スキル詳細表示項目の拡張
```

2. ガイド内容確認:

| セクション             | 確認 |
| ---------------------- | ---- |
| 概要                   | [ ]  |
| アーキテクチャ         | [ ]  |
| ディレクトリ構成       | [ ]  |
| コンポーネント一覧     | [ ]  |
| 状態管理               | [ ]  |
| IPC通信                | [ ]  |
| テスト戦略             | [ ]  |
| 拡張ポイント           | [ ]  |
| トラブルシューティング | [ ]  |

**期待される成果物**:

- 実装ガイド（`outputs/phase-12/implementation-guide.md`）

---

### タスク6: テストドキュメントの作成

**目的**: テスト戦略・テストケース・実行方法を文書化する

**実行手順**:

1. テストドキュメントを作成:

```markdown
# スキル管理UI テストドキュメント

## テスト戦略

- ユニットテスト: Vitest + React Testing Library
- 統合テスト: Vitest + MSW
- E2Eテスト: Playwright

## テスト実行方法

\`\`\`bash

# ユニットテスト

pnpm --filter @repo/desktop test

# カバレッジレポート

pnpm --filter @repo/desktop test:coverage

# E2Eテスト

pnpm --filter @repo/desktop test:e2e
\`\`\`

## テストカバレッジ目標

| 指標     | 最低基準 | 推奨基準 |
| -------- | -------- | -------- |
| Line     | 80%      | 90%      |
| Branch   | 60%      | 70%      |
| Function | 80%      | 90%      |
```

2. ドキュメント内容確認:

| セクション       | 確認 |
| ---------------- | ---- |
| テスト戦略       | [ ]  |
| テスト実行方法   | [ ]  |
| カバレッジ目標   | [ ]  |
| テストケース一覧 | [ ]  |
| モック設定       | [ ]  |
| CI/CD統合        | [ ]  |

**期待される成果物**:

- テストドキュメント（`outputs/phase-12/test-docs.md`）

---

### タスク7: 変更履歴の更新

**目的**: 変更履歴を更新し、今回の実装を記録する

**実行手順**:

1. CHANGELOG形式で変更を記録:

```markdown
## [Unreleased]

### Added

- スキル管理UI（AGENT-002）
  - SkillListコンポーネント: インポート済みスキル一覧表示
  - SkillCardコンポーネント: スキルカード表示
  - SkillDetailPanelコンポーネント: スキル詳細表示
  - SkillImportDialogコンポーネント: スキルインポートダイアログ
  - SkillSearchBarコンポーネント: スキル検索機能
  - SkillCategoryFilterコンポーネント: カテゴリフィルター
  - SkillSlice: 状態管理（Zustandスライス）
  - IPC API: スキル操作用IPC通信

### Changed

- AgentView: スキル管理UIを統合

### Fixed

- なし
```

2. 変更履歴確認:

| 項目         | 確認 |
| ------------ | ---- |
| Added一覧    | [ ]  |
| Changed一覧  | [ ]  |
| Fixed一覧    | [ ]  |
| Breaking変更 | [ ]  |

**期待される成果物**:

- 変更履歴更新（`outputs/phase-12/changelog-update.md`）

---

### タスク8: ドキュメント整合性の確認

**目的**: 全ドキュメントの整合性を確認する

**実行手順**:

1. ドキュメント整合性チェック:

| 確認項目                                 | 結果 |
| ---------------------------------------- | ---- |
| 設計書と実装の整合性                     | [ ]  |
| APIドキュメントと実装の整合性            | [ ]  |
| コンポーネントドキュメントと実装の整合性 | [ ]  |
| テストドキュメントとテストコードの整合性 | [ ]  |
| 変更履歴の網羅性                         | [ ]  |

2. リンク切れ・参照エラーの確認
3. スペルチェック・文法チェック

**期待される成果物**:

- ドキュメント整合性確認結果（`outputs/phase-12/doc-consistency-check.md`）

---

## 成果物

| 成果物                     | パス                                        | 内容               |
| -------------------------- | ------------------------------------------- | ------------------ |
| 更新済み設計書             | `outputs/phase-12/updated-design.md`        | 設計書更新         |
| コンポーネントドキュメント | `outputs/phase-12/component-docs.md`        | コンポーネント仕様 |
| IPC APIドキュメント        | `outputs/phase-12/ipc-api-docs.md`          | API仕様            |
| 状態管理ドキュメント       | `outputs/phase-12/state-management-docs.md` | 状態管理仕様       |
| 実装ガイド                 | `outputs/phase-12/implementation-guide.md`  | 実装ガイド         |
| テストドキュメント         | `outputs/phase-12/test-docs.md`             | テスト仕様         |
| 変更履歴更新               | `outputs/phase-12/changelog-update.md`      | CHANGELOG          |
| ドキュメント整合性確認結果 | `outputs/phase-12/doc-consistency-check.md` | 整合性確認         |

---

## 完了条件

- [ ] 設計書が最新の実装に更新されている
- [ ] コンポーネントドキュメントが作成されている
- [ ] IPC APIドキュメントが作成されている
- [ ] 状態管理ドキュメントが作成されている
- [ ] 実装ガイドが作成されている
- [ ] テストドキュメントが作成されている
- [ ] 変更履歴が更新されている
- [ ] ドキュメント整合性が確認されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 11（手動テスト）が完了していること
- **後続**: Phase 13（PR作成・CI確認）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/skill-management-ui/phase-13-pr-creation.md`
