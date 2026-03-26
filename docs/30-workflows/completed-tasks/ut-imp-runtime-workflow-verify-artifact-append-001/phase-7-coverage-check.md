# Phase 7: テストカバレッジ確認

## メタ情報

| 項目       | 値                                                 |
| ---------- | -------------------------------------------------- |
| Phase      | 7                                                  |
| タスクID   | UT-IMP-RUNTIME-WORKFLOW-VERIFY-ARTIFACT-APPEND-001 |
| 機能名     | ut-imp-runtime-workflow-verify-artifact-append-001 |
| 前提Phase  | Phase 5, Phase 6                                   |
| 後続Phase  | Phase 8                                            |
| ステータス | 完了                                               |
| 作成日     | 2026-03-26                                         |

## 目的

Phase 1 AC が test へ到達していることを確認し、failure append に抜けがないかを可視化する。

## Traceability Matrix

| AC                         | engine test                      | facade test | manual check                 | 状態    |
| -------------------------- | -------------------------------- | ----------- | ---------------------------- | ------- |
| AC-01 failure append       | TC-04-01                         | TC-04-02    | Phase 11 順序確認            | covered |
| AC-02 payload 同値         | TC-04-01                         | TC-04-02    | Phase 11 state/artifact 照合 | covered |
| AC-03 engine/facade 両確認 | TC-04-01                         | TC-04-02    | Phase 11 result 記録         | covered |
| AC-04 契約不変             | targeted vitest + spec validator | N/A         | Phase 10 gate                | covered |

## 実行タスク

- AC と test case の追跡表を作る
- failure append、payload 同値、repeated failure の各観点を確認する
- 未網羅項目が残る場合は Phase 6 へ差し戻す

## 参照資料

| 参照資料 | パス                        | 内容      |
| -------- | --------------------------- | --------- |
| Phase 1  | `phase-1-requirements.md`   | AC        |
| Phase 6  | `phase-6-test-expansion.md` | 追加 test |

### システム仕様（aiworkflow-requirements）

| 参照資料             | パス                                                                        | 内容            |
| -------------------- | --------------------------------------------------------------------------- | --------------- |
| quality requirements | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` | coverage の観点 |

## 統合テスト連携

| 観点         | 連携内容                         |
| ------------ | -------------------------------- |
| traceability | AC と test case の対応を確認する |

## 成果物

| 成果物        | パス                                       | 説明              |
| ------------- | ------------------------------------------ | ----------------- |
| coverage 確認 | `outputs/phase-7/coverage-traceability.md` | AC と test の突合 |

## 完了条件

- [ ] AC が全件テストへ対応づいている
- [ ] failure append の未網羅がない
- [ ] test 観点の重複と欠落が整理されている
- [ ] 差戻し条件が明記されている
