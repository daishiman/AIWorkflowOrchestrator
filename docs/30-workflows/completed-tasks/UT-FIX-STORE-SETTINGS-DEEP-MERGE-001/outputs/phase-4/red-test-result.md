# Red テスト結果（Phase 4 時点）

## 概要

deepMerge 実装前（shallow merge）の状態でテストを実行した場合の想定 Fail 結果

## 想定 Fail ケース

| TC    | 理由                                                                           |
| ----- | ------------------------------------------------------------------------------ |
| TC-01 | `{ ...current, ...updates }` では `theme: { color: "light" }` で `size` が消失 |
| TC-04 | null 上書きは shallow merge でも動作するが deepMerge 専用テスト                |
| TC-05 | `{ ...current, ...{ theme: { size: "large" } } }` では `color` が消失          |

## 実際の状況

テスト追加と同時に実装も完了したため、実際の Red 状態は観測していない。
設計上 TC-01, TC-05 は shallow merge で Fail することが理論的に証明されている。
TC-02, TC-03 は shallow merge でも PASS する（トップレベル・配列上書きは shallow merge と同結果）。

## Phase 5 での Green 移行

deepMerge 実装後、全テスト PASS（Green）を確認済み。
