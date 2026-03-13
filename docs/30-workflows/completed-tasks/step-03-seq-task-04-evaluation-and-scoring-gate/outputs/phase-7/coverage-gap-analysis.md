# Phase 7: Coverage Gap Analysis

## 要約

- Task04 の core helper / slice / SkillCenterView は目標値を満たした。
- repo 全体 coverage gate は unrelated files を含むため FAIL。
- Task04 固有の残 gap は 3 件で、いずれも Medium 以下。

## Gap 一覧

| 優先度 | gap                                                                        | 根拠                             | 対応方針                                      |
| ------ | -------------------------------------------------------------------------- | -------------------------------- | --------------------------------------------- |
| Medium | `SkillLifecyclePanel` の onReevaluate inline callback が coverage 上未到達 | lcov で 0 hit                    | Task05 本流 UI 実装時に integration test 追加 |
| Medium | `SkillEvaluationPanel` 単体の表示分岐は component 直テスト未作成           | Task04 では親 component 経由のみ | 将来 `SkillEvaluationPanel.test.tsx` を追加   |
| Low    | `SkillCenterView` 再評価後の `use_ready` 遷移は manual 証跡中心            | TC-11-06 で確認済み              | Task05 本実装時に DOM test を追加             |

## 非 Task04 起因の FAIL

| 項目                  | 内容                                                            |
| --------------------- | --------------------------------------------------------------- |
| repo global threshold | unrelated files を含むため lines 2.86%, branches 27.75% で FAIL |
| 判断                  | Task04 対象範囲の targeted coverage と screenshot を採用        |

## Phase 8 への引き継ぎ

1. badge / summary / nextSurface の表現重複を維持せず共通化する
2. `SkillEvaluationPanel` 単体テストは将来の UI 拡張で追加する
3. Task05 本流実装が始まったら `SkillCenterView` 以外の usage surface も coverage 対象へ含める
