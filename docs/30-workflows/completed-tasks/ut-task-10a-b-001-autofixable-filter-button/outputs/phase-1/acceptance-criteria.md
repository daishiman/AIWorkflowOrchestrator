# Phase 1 受け入れ基準: 自動修正可能フィルタボタン

## メタ情報

| 項目     | 内容              |
| -------- | ----------------- |
| タスクID | UT-TASK-10A-B-001 |
| Phase    | 1                 |
| 作成日   | 2026-03-05        |

## AC（Gherkin）

```gherkin
Scenario: autoFixable が混在する提案を一括選択する
  Given 提案が3件あり autoFixable は [true, false, true] である
  When ユーザーが「自動修正可能を選択」ボタンを押す
  Then 選択状態はインデックス [0, 2] のみになる
  And 「選択を適用」ボタンが有効化される

Scenario: autoFixable が0件のときのガード
  Given 提案が3件あり autoFixable は [false, false, false] である
  Then 「自動修正可能を選択」ボタンは disabled である
  When ユーザーがボタンを押そうとしても
  Then 選択状態は変化しない

Scenario: 提案が0件のときの安全性
  Given 提案が0件である
  Then 改善提案の空状態表示が維持される
  And 一括選択操作で例外が発生しない

Scenario: 既存の個別選択との共存
  Given 提案が3件ありユーザーが個別選択できる
  When ユーザーが任意のチェックボックスをトグルする
  Then 既存の選択トグル挙動は維持される
```

## トレーサビリティ

| AC   | 対応FR     |
| ---- | ---------- |
| AC-1 | FR-1, FR-2 |
| AC-2 | FR-3       |
| AC-3 | FR-3       |
| AC-4 | FR-4       |

## 引き継ぎ（Phase 4 へ）

- AC-1/2 は `SuggestionList.test.tsx` と `SkillAnalysisView.test.tsx` の両方で検証する。
- AC-3/4 は回帰ケースとして保持し、境界テストに含める。
