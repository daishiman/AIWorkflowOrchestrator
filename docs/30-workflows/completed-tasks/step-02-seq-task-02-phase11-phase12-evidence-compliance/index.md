# UT-IMP-TASK-SDK-02-PHASE11-PHASE12-EVIDENCE-COMPLIANCE-001

## 概要

`TASK-SDK-02` の Phase 11 / Phase 12 成果物が、task-specification-creator の実質要件を満たしていない問題を是正する corrective workflow である。主眼はコード修正ではなく、手動テスト証跡と documentation wave の品質を current workflow 上で追跡可能に戻すことにある。

## この task で固定すること

- Phase 11 を visual / non-visual のどちらで閉じるかの判定基準
- `TC-ID -> evidence path -> result` の 1:1 トレーサビリティ
- `implementation-guide.md` の Part 1 / Part 2 必須骨格
- `phase12-task-spec-compliance-check.md` を存在確認ではなく内容完了確認にする判定ルール
- placeholder 依存を current workflow から除去する運用

## 非対象

- `TASK-SDK-02` の runtime 実装ロジック変更
- aiworkflow-requirements の same-wave 仕様更新そのもの
- commit / PR 作成

## メタ情報

| 項目       | 内容                                                       |
| ---------- | ---------------------------------------------------------- |
| タスクID   | UT-IMP-TASK-SDK-02-PHASE11-PHASE12-EVIDENCE-COMPLIANCE-001 |
| 親タスク   | TASK-SDK-02                                                |
| 種別       | 改善 / docs-hardening                                      |
| 優先度     | 高                                                         |
| ステータス | spec_created                                               |
| 作成日     | 2026-03-26                                                 |
| issue      | #1649                                                      |

## 背景

親 workflow [`step-02-seq-task-02-workflow-engine-runtime-orchestration`](../step-02-seq-task-02-workflow-engine-runtime-orchestration/index.md) は validator 通過済みだが、Phase 11/12 の human-authored 成果物に次の drift が残っている。

- `implementation-guide.md` に Part 1 / Part 2 の必須要素が不足
- `phase-11-manual-test.md` に testcase と coverage matrix の要求が不足
- `manual-test-checklist.md` / `manual-test-result.md` に TC-ID と証跡の紐付け要求が不足
- placeholder 画像依存のまま current workflow が閉じられる余地がある
- compliance check が存在確認寄りで、Task 12-1〜12-5 の内容完了を担保していない

## 一次結論

### 真の論点

validator を通したことと、Phase 11 / 12 が human-authored evidence として閉じていることが混同されている点が主問題である。

### 依存関係・責務境界の問題点

- 親 workflow は runtime orchestration の正本だが、今回の corrective workflow は docs contract hardening に責務を限定する
- validator は構造確認を担い、manual review は内容完了確認を担う
- Phase 11 は evidence contract、Phase 12 は documentation wave contract を担い、両者を compliance check が横断で閉じる

### 価値とコストの不均衡

- 最小コストで効く是正は、Phase 11 / 12 の仕様書と成果物責務を再定義すること
- runtime 実装変更は高コストかつ今回の主問題ではないため、スコープ外に維持する

### 改善優先順位

1. Phase 12 の内容完了判定を強化する
2. Phase 11 の TC-ID / evidence 契約を固定する
3. validator / human review / same-wave 記録の役割分離を明文化する

## 4条件評価

| 条件   | 現状リスク                                            | 是正方針                                                                    |
| ------ | ----------------------------------------------------- | --------------------------------------------------------------------------- |
| 価値性 | validator PASS だけでは docs close-out の信頼性が低い | evidence contract と completion contract を分離する                         |
| 実現性 | runtime 実装修正まで広げると過剰                      | docs-only corrective workflow に限定する                                    |
| 整合性 | Phase 11 / 12 / compliance の責務境界が曖昧           | 6成果物の役割と判定粒度を固定する                                           |
| 運用性 | placeholder や present-only 判定が再発しやすい        | non-visual 根拠、same-wave no-op 理由、Task 12-1〜12-5 内容完了を必須化する |

## 30思考法の適用要約

| 系統         | 適用した思考法                                                       | この workflow で固定した判断                                                  |
| ------------ | -------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| 論理分析系   | 批判的思考、演繹思考、帰納的思考、アブダクション、垂直思考           | validator PASS と evidence 完了は別条件だと再定義する                         |
| 構造分解系   | 要素分解、MECE、2軸思考、プロセス思考                                | Phase 11 / 12 / compliance / same-wave を重複なく分離する                     |
| メタ・抽象系 | メタ思考、抽象化思考、ダブル・ループ思考                             | 今回の失敗を「文書不足」ではなく「完了判定の設計不備」と捉え直す              |
| 発想・拡張系 | ブレインストーミング、水平思考、逆説思考、類推思考、if思考、素人思考 | screenshot 必須化ではなく visual / non-visual gate と fallback 根拠を固定する |
| システム系   | システム思考、因果関係分析、因果ループ                               | placeholder 許容が future drift を増幅する強化ループを断つ                    |
| 戦略・価値系 | トレードオン思考、プラスサム思考、価値提案思考、戦略的思考           | 実装変更を避けつつ docs quality を最大化する                                  |
| 問題解決系   | why思考、改善思考、仮説思考、論点思考、KJ法                          | 真因を「存在確認で閉じられる設計」に集約し、改善順を固定する                  |

## 受入基準

| ID   | 基準                                                                              |
| ---- | --------------------------------------------------------------------------------- |
| AC-1 | Phase 11 仕様書が visual / non-visual 判定ゲートを明示する                        |
| AC-2 | Phase 11 仕様書が `## テストケース` と `## 画面カバレッジマトリクス` を要求する   |
| AC-3 | Phase 12 仕様書が `implementation-guide.md` の Part 1 / Part 2 必須要件を明示する |
| AC-4 | Phase 12 仕様書が 6 成果物の役割差分を明示する                                    |
| AC-5 | compliance check が存在確認のみで PASS にできない設計になっている                 |
| AC-6 | placeholder 除去または non-visual 例外根拠の固定が完了条件に含まれる              |
| AC-7 | validator 実行計画が Phase 4 / 6 / 9 / 10 / 12 に分散配置されている               |
| AC-8 | aiworkflow-requirements の親契約と current workflow の docs 是正が矛盾しない      |

## ディレクトリ構成

```text
step-02-seq-task-02-phase11-phase12-evidence-compliance/
├── index.md
├── artifacts.json
├── phase-1-requirements.md
├── phase-2-design.md
├── phase-3-design-review.md
├── phase-4-test-creation.md
├── phase-5-implementation.md
├── phase-6-test-expansion.md
├── phase-7-coverage-check.md
├── phase-8-refactoring.md
├── phase-9-quality-assurance.md
├── phase-10-final-review.md
├── phase-11-manual-test.md
├── phase-12-documentation.md
├── phase-13-pr-creation.md
└── outputs/
    └── artifacts.json
```

## 依存関係

| 種別        | 参照先                                                                                                          | 役割                                      |
| ----------- | --------------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| predecessor | `../step-02-seq-task-02-workflow-engine-runtime-orchestration/index.md`                                         | 是正対象の current workflow               |
| reference   | `../unassigned-task/task-imp-task-sdk-02-phase11-phase12-evidence-compliance-001.md`                            | 是正要求の原票                            |
| canonical   | `.claude/skills/aiworkflow-requirements/references/api-ipc-system-core.md`                                      | RuntimeSkillCreatorFacade / engine の正本 |
| canonical   | `.claude/skills/aiworkflow-requirements/references/architecture-overview-core.md`                               | state owner / public bridge の正本        |
| canonical   | `.claude/skills/aiworkflow-requirements/references/arch-electron-services-details-part2.md`                     | Task02 反映後の current fact              |
| canonical   | `.claude/skills/aiworkflow-requirements/references/lessons-learned-auth-ipc-skill-creator-sync-auth-timeout.md` | docs drift 再発防止の教訓                 |

## Phase 一覧

- [phase-1-requirements.md](./phase-1-requirements.md)
- [phase-2-design.md](./phase-2-design.md)
- [phase-3-design-review.md](./phase-3-design-review.md)
- [phase-4-test-creation.md](./phase-4-test-creation.md)
- [phase-5-implementation.md](./phase-5-implementation.md)
- [phase-6-test-expansion.md](./phase-6-test-expansion.md)
- [phase-7-coverage-check.md](./phase-7-coverage-check.md)
- [phase-8-refactoring.md](./phase-8-refactoring.md)
- [phase-9-quality-assurance.md](./phase-9-quality-assurance.md)
- [phase-10-final-review.md](./phase-10-final-review.md)
- [phase-11-manual-test.md](./phase-11-manual-test.md)
- [phase-12-documentation.md](./phase-12-documentation.md)
- [phase-13-pr-creation.md](./phase-13-pr-creation.md)
