# スキルウィザード Q5 複数選択時「主ツール」UI表示 - タスク指示書

## メタ情報

```yaml
issue_number: 2071
task_id: UT-SKILL-WIZARD-MSO-MAIN-TOOL-UI-001
task_name: スキルウィザード Q5 複数選択時の「主ツール」UI表示
category: UI改善
target_feature: skill-wizard/q5-primary-tool-indicator
priority: 低
scale: 小規模
status: 未実施
created_date: 2026-04-09
dependencies: []
origin_task: skill-wizard-multi-select-options（OPT-MSO-002 として登録）
```

## メタ情報

| 項目         | 内容                                                                                                |
| ------------ | --------------------------------------------------------------------------------------------------- |
| タスクID     | UT-SKILL-WIZARD-MSO-MAIN-TOOL-UI-001                                                                |
| タスク名     | スキルウィザード Q5 複数選択時の「主ツール」UI表示                                                  |
| 分類         | UI改善                                                                                              |
| 対象機能     | スキル作成ウィザード - Q5 外部ツール選択表示                                                        |
| 優先度       | 低                                                                                                  |
| 見積もり規模 | 小規模                                                                                              |
| ステータス   | 未実施                                                                                              |
| 発見元       | skill-wizard-multi-select-options Phase 12 未タスク検出（OPT-MSO-002 として登録）                   |
| 発見日       | 2026-04-09                                                                                          |
| タスク分類   | VISUAL（Q5 選択状態の UI 変更 / スクリーンショット証跡が必要）                                      |
| 参照タスク   | `docs/30-workflows/skill-wizard-multi-select-options/outputs/phase-12/unassigned-task-detection.md` |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`skill-wizard-multi-select-options` タスクにより、Q5「どの外部ツールを統合しますか？」で
複数ツールを選択できるようになった。

しかし現在の `resolveExternalIntegration` は先頭値（`selectedOptions[0]`）を
「主ツール」として参照する設計を採用している：

```typescript
// 先頭値を主ツールとして参照
const selected = (q5Answer.selectedOptions[0] ?? "").trim();
```

UI 上では複数のチェックボックスが同等に表示されているが、
内部的には先頭に選択されたツールが「主ツール」として扱われる。
この非対称性がユーザーに伝わっていない。

### 1.2 問題点・課題

- 複数ツールを選択した際に「どれが主ツールとして使われるか」が UI から読み取れない
- 選択順序によって主ツールが変わるが、ユーザーは選択順序を意識していない
- `UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001`（並列統合対応）が実装されるまでの
  暫定的な「主ツール明示」として必要

### 1.3 放置した場合の影響

- 複数選択可能になったが「最初に選んだものが主ツール」というルールが不透明なまま
- 並列統合対応タスク（CONST_FUTURE-001）実装前の UX ギャップが放置される

---

## 2. 何を達成するか（What）

### 2.1 目的

Q5 で複数ツールを選択した際に、先頭選択項目を「主ツール」として
視覚的にユーザーに示すバッジ・ラベルを追加する。

### 2.2 受入条件（AC）

| AC   | 内容                                                                                              |
| ---- | ------------------------------------------------------------------------------------------------- |
| AC-1 | Q5 で2つ以上のツールが選択された際に、最初の選択肢に「主ツール」バッジが表示される                |
| AC-2 | 1つのみ選択されている場合は「主ツール」バッジが表示されない                                       |
| AC-3 | `aria-label` に「主ツールとして使用される」情報が含まれる                                         |
| AC-4 | `UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001` 完了後にバッジ表示が不要になった場合の削除が容易な設計 |
| AC-5 | Phase 11 と同等のスクリーンショット証跡で視覚的変更が確認される                                   |
| AC-6 | `ConversationRoundStep.test.tsx` が Q5 複数選択時のバッジ表示を検証する                           |

### 2.3 スコープ

含むもの:

- `ConversationRoundStep.tsx` の Q5 設問における選択肢レンダリング変更
- 「主ツール」バッジコンポーネントの追加（インライン実装 or 既存 UI atoms 利用）
- `aria-label` への主ツール情報追加
- 対応テスト追加・更新

含まないもの:

- 選択順序の変更 UI（ドラッグ&ドロップ等による主ツール変更操作）
- Q5 以外の設問への変更
- `resolveExternalIntegration` のロジック変更（`UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001` のスコープ）

---

## 3. 苦戦箇所・実装上の注意

### 3.1 発見元タスクでの教訓

`skill-wizard-multi-select-options` 実装ガイドより：

```typescript
// 複数選択時は先頭値を主ツールとして参照する。
// 複数ツールの並列統合対応は別タスクのスコープ。
const selected = (q5Answer.selectedOptions[0] ?? "").trim();
```

Q5 だけ他の設問と異なる「先頭優先」ロジックを持つため、
Q5 の UI だけバッジ表示を追加する際は Q3/Q4 の汎用 `renderQuestion` との
共通化を崩さないよう注意すること。

### 3.2 設計上の考慮点

- Q5 の設問定義で `showPrimaryIndicator: true` などのフラグで制御するか、
  Q5 のケースのみ分岐するかを Phase 2 設計段階で決定すること
- 「主ツール」という概念が `UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001` 完了後に
  廃止されることを見越し、ラベルテキスト・コンポーネントを簡単に削除できる構造にすること
- Tailwind CSS トークンを活用し、`packages/ui` の既存バッジスタイルを優先的に再利用すること

---

## 4. 関連情報

| 項目         | 内容                                                                                               |
| ------------ | -------------------------------------------------------------------------------------------------- |
| 関連タスク   | UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001（並列統合対応、このタスク完了後にバッジ不要になる可能性） |
| 参照ファイル | `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx`                      |
| 参照テスト   | `apps/desktop/src/renderer/components/skill/wizard/__tests__/ConversationRoundStep.test.tsx`       |
| 参照実装     | `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`（resolveExternalIntegration）   |
