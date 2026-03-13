# Phase 2: gate decision 設計

## 判定アルゴリズム

1. `buildExecutionQualityEvaluation()` で stream / status / permission を 4 指標へ変換する。
2. `calculateLifecycleTotalScore()` で stage ごとの重み付き合成を行う。
3. `detectLifecycleHardBlocks()` で security / critical risk / permission / retry 根拠不足を抽出する。
4. `buildLifecycleEvaluationSnapshot()` で `deltaFromPrevious` を確定する。
5. `buildLifecycleGateDecision()` で status / nextSurface / summary を決める。

## 閾値

| 定数        | 値  | 用途                                |
| ----------- | --- | ----------------------------------- |
| `warning`   | 60  | revise / warning の境界             |
| `ready`     | 80  | warning / ready の境界              |
| `hardBlock` | 70  | security / permission の block 境界 |

## 重み

| stage          | prompt | skill | execution | 実装時の扱い                       |
| -------------- | ------ | ----- | --------- | ---------------------------------- |
| `draft`        | 100    | 0     | 0         | prompt 単独                        |
| `post_create`  | 35     | 65    | 0         | create 後の初回判定                |
| `post_execute` | 20     | 40    | 40        | execute 完了後                     |
| `post_improve` | 20     | 50    | 30        | improve 後、欠損軸は除外して正規化 |

## 正規化ルール

`post_improve` では executionQuality がまだ存在しないケースがある。0 点扱いにすると `recommended` に到達できないため、実装では「存在する軸の重みだけで再正規化」する方式を採用した。

例:

- prompt 84, skill 91, execution 未取得
- 生の重み: 20 / 50 / 30
- 実装計算: `(84*20 + 91*50) / (20+50) = 89`

## Gate 判定

| status              | 条件                                         | summary                | nextSurface           |
| ------------------- | -------------------------------------------- | ---------------------- | --------------------- |
| `revise_required`   | hard block あり、または `< 60`               | 改善が必要             | `skillCreator`        |
| `save_with_warning` | `60-79`                                      | 保存可だが改善余地あり | `skillCenter`         |
| `use_with_warning`  | `post_execute` で `60-79`                    | 利用可だが警告あり     | `agent`               |
| `use_ready`         | `>= 80`                                      | 利用に進める           | `workspace` / `agent` |
| `recommended`       | `post_improve` かつ `delta > 0` かつ `>= 80` | 推奨利用へ進める       | `workspace`           |

## hard block

| source    | 条件                                      | block 文言                                            |
| --------- | ----------------------------------------- | ----------------------------------------------------- |
| prompt    | `security < 70`                           | `prompt security が閾値を下回っています。`            |
| skill     | `critical risk`                           | `critical risk が残っているため利用できません。`      |
| execution | `permissionSafety < 70`                   | `permission 境界が不足しているため再評価が必要です。` |
| execution | `reliability < 60 && retryReadiness < 70` | `実行失敗時の再試行根拠が不足しています。`            |

## UI ラベル

| status              | label            |
| ------------------- | ---------------- |
| `revise_required`   | 改善必須         |
| `save_with_warning` | 保存可・警告あり |
| `use_with_warning`  | 利用可・警告あり |
| `use_ready`         | 利用可           |
| `recommended`       | 推奨             |
