# Phase 3: 設計レビュー

## メタ情報

| 項目       | 内容             |
| ---------- | ---------------- |
| タスクID   | TASK-SDK-01      |
| Phase      | 3                |
| Phase名    | 設計レビュー     |
| ステータス | spec_created     |
| 前提Phase  | Phase 1, Phase 2 |
| 後続Phase  | Phase 4          |
| 作成日     | 2026-03-26       |

## 目的

Phase 1 と Phase 2 の設計に漏れがないかを確認し、manifest 契約が foundation task として十分な粒度になっているかを gate 判定する。

## 実行タスク

- scope discipline review: manifest が `phase / resource / entry-exit` を越えていないかを監査する
- authority split review: loader と runtime authority の重なりがないかを監査する
- downstream handoff review: Task02、Task03、Task04 が受け取る成果物が不足していないかを監査する
- gate decision 記録: PASS / MINOR / MAJOR / CRITICAL を付けて戻り先を定義する

## 参照資料

| 資料名                 | パス                                                                           | 説明                           |
| ---------------------- | ------------------------------------------------------------------------------ | ------------------------------ |
| Phase 1                | `phase-1-requirements.md`                                                      | scope / non-scope 監査元       |
| Phase 2                | `phase-2-design.md`                                                            | schema / loader / cache 監査元 |
| manifest-schema-design | `outputs/phase-2/manifest-schema-design.md`                                    | field 完全性確認               |
| authority-split-matrix | `outputs/phase-2/authority-split-matrix.md`                                    | authority 衝突確認             |
| review gate criteria   | `.claude/skills/task-specification-creator/references/review-gate-criteria.md` | 判定基準                       |

### システム仕様（aiworkflow-requirements）

| 参照資料                             | パス                                                                                        | 内容                               |
| ------------------------------------ | ------------------------------------------------------------------------------------------- | ---------------------------------- |
| api-ipc-system-core                  | `.claude/skills/aiworkflow-requirements/references/api-ipc-system-core.md`                  | current public IPC と整合するか    |
| arch-electron-services-details-part2 | `.claude/skills/aiworkflow-requirements/references/arch-electron-services-details-part2.md` | facade union response との衝突確認 |
| arch-execution-capability-contract   | `.claude/skills/aiworkflow-requirements/references/arch-execution-capability-contract.md`   | route authority の混入確認         |
| quality-requirements                 | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                 | gate 観点                          |

## 実行手順

1. scope definition と authority-split-matrix を照合し、manifest に禁止フィールドが入っていないかを確認する。
2. loader-boundary-design と current code anchor map を照合し、loader が IPC、permission、session に侵入していないかを確認する。
3. Task02、Task03、Task04 の handoff 項目が `phase topology / resource descriptor / entry-exit hook` で揃っているかを確認する。
4. 指摘ごとに戻り先 Phase を付け、PASS / MINOR / MAJOR / CRITICAL を gate-decision に記録する。

## 統合テスト連携

- Phase 4 は本レビューで残った negative case を red case へ落とし込む。
- Phase 5 は PASS か MINOR のときだけ着手する。
- Phase 10 は本レビューの指摘消化状況を再確認する。

## 成果物

| 成果物               | パス                                      | 説明                     |
| -------------------- | ----------------------------------------- | ------------------------ |
| design-review-result | `outputs/phase-3/design-review-result.md` | 判定サマリー             |
| review-findings      | `outputs/phase-3/review-findings.md`      | 指摘一覧                 |
| downstream-handoff   | `outputs/phase-3/downstream-handoff.md`   | Task02-04 へ渡す確定事項 |

## 完了条件

- [ ] scope discipline の判定が記録されている
- [ ] authority split の判定が記録されている
- [ ] Task02、Task03、Task04 への handoff が3本で整理されている
- [ ] PASS / MINOR / MAJOR / CRITICAL の判定と戻り先が記録されている
- [ ] **本Phase内の全タスクを100%実行完了**
