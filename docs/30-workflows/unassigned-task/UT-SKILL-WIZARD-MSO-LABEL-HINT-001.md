# スキルウィザード設問「複数選択可」ラベル追加 - タスク指示書

## メタ情報

```yaml
issue_number: 2070
task_id: UT-SKILL-WIZARD-MSO-LABEL-HINT-001
task_name: スキルウィザード設問ラベルへの「複数選択可」明示案内追加
category: UX改善
target_feature: skill-wizard/question-label-hint
priority: 低
scale: 小規模
status: 未実施
created_date: 2026-04-09
dependencies: []
origin_task: skill-wizard-multi-select-options（OPT-MSO-001 として登録）
```

## メタ情報

| 項目         | 内容                                                                                                |
| ------------ | --------------------------------------------------------------------------------------------------- |
| タスクID     | UT-SKILL-WIZARD-MSO-LABEL-HINT-001                                                                  |
| タスク名     | スキルウィザード設問ラベルへの「複数選択可」明示案内追加                                            |
| 分類         | UX改善                                                                                              |
| 対象機能     | スキル作成ウィザード - ConversationRoundStep 設問表示                                               |
| 優先度       | 低                                                                                                  |
| 見積もり規模 | 小規模                                                                                              |
| ステータス   | 未実施                                                                                              |
| 発見元       | skill-wizard-multi-select-options Phase 11 AI UX評価（OPT-MSO-001 として登録）                      |
| 発見日       | 2026-04-09                                                                                          |
| タスク分類   | VISUAL（設問ラベルのテキスト変更 / スクリーンショット証跡が必要）                                   |
| 参照タスク   | `docs/30-workflows/skill-wizard-multi-select-options/outputs/phase-12/unassigned-task-detection.md` |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`skill-wizard-multi-select-options` タスクにより、Q1〜Q6 の設問回答が複数選択可能になった。
ただし、現在の設問ラベルには「複数選択可能」という案内が一切表示されていない。

Phase 11 AI UX評価にて「選択肢が複数選べることがラベルから読み取れない」という
アフォーダンス不足が指摘された。これにより以下の問題が生じる可能性がある：

- ユーザーが「1つしか選べない」と思い込み、複数選択を試みない
- 複数選択が可能であることに気づかず、フリーテキストで追記しようとする
- アクセシビリティ基準（WCAG 2.1 1.3.1 情報と関係性）への対応が不完全

### 1.2 問題点・課題

- `ConversationRoundStep.tsx` の設問ラベルには選択方式の案内がない
- `aria-label` や `aria-describedby` に「複数選択可」の情報がない
- Phase 11 AI UX評価で指摘されたが、当時は OPT（ブロッカーでない改善案）として後回しに

### 1.3 放置した場合の影響

- 複数選択 UX を実装したにもかかわらず、ユーザーがその機能に気づかない
- 複数ツール統合・複数実行モード選択などの価値が十分に活用されない

---

## 2. 何を達成するか（What）

### 2.1 目的

設問ラベルに「（複数選択可）」などの案内テキストを追加し、
ユーザーが複数選択できることを視覚的・アクセシビリティ的に明示する。

### 2.2 受入条件（AC）

| AC   | 内容                                                                       |
| ---- | -------------------------------------------------------------------------- |
| AC-1 | 設問ラベルに「複数選択可」（または同等の案内）が表示される                 |
| AC-2 | `aria-label` または `aria-describedby` に複数選択可能であることが含まれる  |
| AC-3 | 単一選択専用の設問（存在する場合）では案内が表示されない（設問ごとの制御） |
| AC-4 | Phase 11 と同等のスクリーンショット証跡で視覚的変更が確認される            |
| AC-5 | `ConversationRoundStep.test.tsx` が案内テキストの表示・非表示を検証する    |

### 2.3 スコープ

含むもの:

- `ConversationRoundStep.tsx` の設問ラベル表示ロジック変更
- i18n 対応（日本語・英語の案内テキスト）
- アクセシビリティ属性（`aria-describedby` 等）の追加
- 対応テスト追加・更新

含まないもの:

- 選択肢の最大選択数制限 UI（別タスク `task-multi-select-checkbox-max-select.md` でカバー）
- 設問の並び替えや設問数の変更

---

## 3. 苦戦箇所・実装上の注意

### 3.1 発見元タスクでの教訓

Phase 11 AI UX評価での指摘内容：
「選択肢が複数選べることがラベルから読み取れない」というアフォーダンス不足。

### 3.2 設計上の考慮点

- 案内テキストはラベルの末尾 `（複数選択可）` か、ラベル下部の説明文として追加するか
  デザインシステムとの整合を確認すること
- 設問ごとに「複数選択可 / 単一選択」を制御できる型定義（`QuestionDefinition` への
  `multiSelect?: boolean` 追加など）を設計段階で確認すること
- i18n キーの命名は既存 `ConversationRoundStep` の i18n パターンに合わせること

---

## 4. 関連情報

| 項目         | 内容                                                                                         |
| ------------ | -------------------------------------------------------------------------------------------- |
| 関連タスク   | task-multi-select-checkbox-max-select.md（最大選択数制限 UI）                                |
| 参照ファイル | `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx`                |
| 参照テスト   | `apps/desktop/src/renderer/components/skill/wizard/__tests__/ConversationRoundStep.test.tsx` |
