# Phase 3: 設計レビュー

## メタ情報

| 項目     | 値                                                         |
| -------- | ---------------------------------------------------------- |
| Phase    | 3                                                          |
| タスクID | UT-IMP-TASK-SDK-02-PHASE11-PHASE12-EVIDENCE-COMPLIANCE-001 |
| 機能名   | task-sdk-02-phase11-phase12-evidence-compliance            |
| 作成日   | 2026-03-26                                                 |
| 前Phase  | [Phase 2: 設計](./phase-2-design.md)                       |

## 目的

docs 是正設計が「validator を通すだけ」の設計になっていないかを確認し、Phase 4 に進めるか判定する。

## 実行タスク

- evidence quality と validator quality の分離を確認する
- compliance check が内容完了判定になっているか確認する
- same-wave 更新の扱いが過不足ないか確認する
- PASS / MINOR / MAJOR を判定する

## 参照資料

| 資料名            | パス                                          | 説明      |
| ----------------- | --------------------------------------------- | --------- |
| Phase 1 要件      | `outputs/phase-1/requirements.md`             | AC 正本   |
| Phase 2 設計      | `outputs/phase-2/remediation-lane-plan.md`    | lane 設計 |
| evidence decision | `outputs/phase-2/evidence-decision-record.md` | 判定基準  |

### システム仕様（aiworkflow-requirements）

| 参照資料                                   | パス                                                                                              | 内容                     |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------- | ------------------------ |
| architecture-overview-core                 | `.claude/skills/aiworkflow-requirements/references/architecture-overview-core.md`                 | 親機能との不整合確認     |
| task-workflow-completed                    | `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md`                    | 完了済み事実との齟齬確認 |
| lessons-learned-phase12-workflow-lifecycle | `.claude/skills/aiworkflow-requirements/references/lessons-learned-phase12-workflow-lifecycle.md` | Phase 12 再発観点        |

## レビュー観点

| ID    | 確認項目                                                                       | 判定 |
| ----- | ------------------------------------------------------------------------------ | ---- |
| REV-1 | Phase 11 が `TC-ID -> evidence` の欠落を防げる設計か                           |      |
| REV-2 | placeholder 除去ルールが current workflow に適用されるか                       |      |
| REV-3 | `implementation-guide.md` が validator literal と内容品質の両方を満たす設計か  |      |
| REV-4 | `phase12-task-spec-compliance-check.md` が存在確認のみで PASS にできない設計か |      |
| REV-5 | system spec same-wave 更新不要時の記録場所が明確か                             |      |
| REV-6 | Phase 10 / 13 で completed 移動禁止条件を保持できるか                          |      |

## 判定基準

| 判定  | 条件                          | 対応                        |
| ----- | ----------------------------- | --------------------------- |
| PASS  | 重大な抜け漏れなし            | Phase 4 へ進む              |
| MINOR | wording や配置の軽微修正のみ  | 指摘記録後に Phase 4 へ進む |
| MAJOR | AC-1〜AC-8 を落とす恐れがある | Phase 1 または 2 に戻る     |

## 実行手順

1. `outputs/phase-2/remediation-lane-plan.md` を読み、lane 依存を確認する。
2. `outputs/phase-2/evidence-decision-record.md` を読み、placeholder 余地が残っていないか確認する。
3. レビュー観点表を埋める。
4. PASS / MINOR / MAJOR を決める。
5. MINOR があれば `Phase 6` までの解消先を明記する。

## 統合テスト連携

Phase 3 ではコマンド実行よりも gate 設計の妥当性を確認する。とくに `validate-phase11-screenshot-coverage.js` と `validate-phase12-implementation-guide.js` が「十分条件ではない」ことを明記する。

## 成果物

| 成果物               | パス                                      | 説明                      |
| -------------------- | ----------------------------------------- | ------------------------- |
| design review result | `outputs/phase-3/design-review-result.md` | PASS / MINOR / MAJOR 記録 |
| review prompt        | `outputs/phase-3/review-prompt.txt`       | review 実行入力           |

## 完了条件

- [ ] REV-1〜REV-6 を評価済み
- [ ] PASS / MINOR / MAJOR を決定済み
- [ ] MINOR の解消先を定義済み
- [ ] **本Phase内の全タスクを100%実行完了**

## 次Phase

Phase 4: テスト作成（[phase-4-test-creation.md](./phase-4-test-creation.md)）
