# [#1773] [UT] verify→improve ループの feedback memory 構造化改善

## メタ情報

| 項目         | 内容                                               |
| ------------ | -------------------------------------------------- |
| タスクID     | task-ut-p0-02-001-repeat-feedback-memory           |
| タスク名     | verify→improve ループの feedback memory 構造化改善 |
| 分類         | 改善                                               |
| 対象機能     | RuntimeSkillCreatorFacade.verifyAndImproveLoop()   |
| 優先度       | 中                                                 |
| 見積もり規模 | 小規模                                             |
| ステータス   | 完了                                               |
| 発見元       | TASK-P0-02 Phase 3 MR-01（Phase 12 で部分吸収）    |
| 発見日       | 2026-03-30                                         |

## Section 1: なぜこのタスクが必要か（Why）

`RuntimeSkillCreatorFacade.verifyAndImproveLoop()` 内で、improve 試行間のコンテキスト引き継ぎに使用している `previousImproveSummary` は**文字列型**として定義されており、直前 1 回分の改善要約しか保持しない。

`maxImproveRetry` が 3 の場合、試行 3 は試行 1 に何を試みたかを知ることができない。

### 問題点

- 同一の失敗チェックに対して、試行 1 と試行 3 が同じ修正提案を行うリスクがある。
- LLM はフィードバックとして渡された直前 1 回の要約しか参照できないため、3 回ループを有効に活用できない。
- 改善提案の多様性が損なわれ、結果的にスキルの verify 通過率が低下する。

### 放置した場合の影響

- LLM が同じ修正を繰り返すことでループが実質 1 回分の試行にしかならない。
- `maxImproveRetry` を増加させても改善効果が頭打ちになる。

## Section 2: 何を達成するか（What）

### 目的

feedback memory を構造化し、全試行の失敗履歴を次回 improve の入力に含めることで、LLM が過去の試みを把握した上で新しい改善策を提案できるようにする。

### 最終ゴール

- 3 回ループ実行時に、試行 N において試行 1〜N-1 の失敗チェックと改善要約を参照できること。
- LLM への feedback プロンプトに「過去の試行で試みた内容」が明示されること。
- 重複提案を防止し、各試行で異なるアプローチが取られること。

### スコープ（含むもの）

- `ImproveFeedbackHistory` 型の定義
- `verifyAndImproveLoop()` 内の feedback 蓄積ロジック実装
- `buildImproveFeedback()` 関数の引数・実装更新
- 上記に対応するユニットテストの追加

---

仕様書: docs/30-workflows/improve-feedback-memory-structuring/index.md
