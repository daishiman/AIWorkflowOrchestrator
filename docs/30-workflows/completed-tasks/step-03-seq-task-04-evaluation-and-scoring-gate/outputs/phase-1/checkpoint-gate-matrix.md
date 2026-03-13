# Phase 1: checkpoint / gate マトリクス

## checkpoint 定義

| checkpoint | stage          | 主入力                      | 主要出力            | next surface                    |
| ---------- | -------------- | --------------------------- | ------------------- | ------------------------------- |
| CP-1       | `draft`        | 作成依頼文                  | prompt gate         | `skillCreator`                  |
| CP-2       | `post_create`  | create 結果 + 初回 analysis | 保存可否 / 改善要否 | `skillCenter` or `skillCreator` |
| CP-3       | `post_execute` | execute 結果 + stream       | 利用可否 / warning  | `agent`                         |
| CP-4       | `post_improve` | improve 後の再分析          | 差分付き再判定      | `workspace` / `skillCenter`     |

## gate 状態

| status              | 条件                                                                | 画面ラベル       | next surface               |
| ------------------- | ------------------------------------------------------------------- | ---------------- | -------------------------- |
| `revise_required`   | hard block あり、または `totalScore < 60`                           | 改善必須         | `skillCreator`             |
| `save_with_warning` | `60 <= totalScore < 80`                                             | 保存可・警告あり | `skillCenter`              |
| `use_with_warning`  | `post_execute` かつ `60 <= totalScore < 80`                         | 利用可・警告あり | `agent`                    |
| `use_ready`         | `totalScore >= 80`                                                  | 利用可           | `workspace` または `agent` |
| `recommended`       | `post_improve` かつ `deltaFromPrevious > 0` かつ `totalScore >= 80` | 推奨             | `workspace`                |

## 重み

| stage          | prompt | skill | execution | 実装注記                       |
| -------------- | ------ | ----- | --------- | ------------------------------ |
| `draft`        | 100    | 0     | 0         | prompt 単独評価                |
| `post_create`  | 35     | 65    | 0         | create 後の保存判断            |
| `post_execute` | 20     | 40    | 40        | 実行品質を加味                 |
| `post_improve` | 20     | 50    | 30        | 実装では欠損軸を除外して正規化 |

## hard block

| 条件                         | block 文言                                            | 禁止状態                   |
| ---------------------------- | ----------------------------------------------------- | -------------------------- |
| security < 70                | `prompt security が閾値を下回っています。`            | `use_ready`, `recommended` |
| critical risk あり           | `critical risk が残っているため利用できません。`      | `save_with_warning` 以上   |
| permissionSafety < 70        | `permission 境界が不足しているため再評価が必要です。` | `use_with_warning` 以上    |
| reliability / retry 根拠不足 | `実行失敗時の再試行根拠が不足しています。`            | `use_ready`, `recommended` |

## Task03 / Task05 handoff

| from                      | to     | payload                                                          |
| ------------------------- | ------ | ---------------------------------------------------------------- |
| Task03 prepare            | Task04 | prompt, draft decision                                           |
| Task03 create             | Task04 | skill path, skill name, analysis, post_create decision           |
| Task03 execute            | Task04 | prompt, stream messages, executionQuality, post_execute decision |
| Task03 improve            | Task04 | improved analysis, delta, post_improve decision                  |
| Task04 latestGateDecision | Task05 | banner summary, status, totalScore, snapshot delta               |
