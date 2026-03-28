# Documentation Changelog

## 変更サマリー

| 区分                     | 件数 | 内容                                                                                           |
| ------------------------ | ---- | ---------------------------------------------------------------------------------------------- |
| workflow 本文            | 2    | `phase-12-documentation.md` と `artifacts.json` を current fact に追随                         |
| Phase 11 evidence 補強   | 3    | `manual-test-result.md`、`screenshot-coverage.md`、`phase11-capture-metadata.json` を追加/是正 |
| Phase 12 出力更新        | 5    | guide / spec summary / changelog / compliance / feedback を false green 是正へ更新             |
| verification report 是正 | 1    | Phase 11 / 13 の blocked を反映                                                                |

## 主要変更ファイル

| ファイル                                                     | 変更内容                                                               |
| ------------------------------------------------------------ | ---------------------------------------------------------------------- |
| `phase-12-documentation.md`                                  | docs-only 前提を廃止し、code wave / evidence / Step 2 再判定方針へ更新 |
| `artifacts.json`                                             | Phase 11 status を `blocked` に是正                                    |
| `outputs/phase-11/manual-test-result.md`                     | 実装未存在ではなく evidence blocker として再記録                       |
| `outputs/phase-11/screenshot-coverage.md`                    | capture plan と fallback evidence chain を明文化                       |
| `outputs/phase-11/screenshots/phase11-capture-metadata.json` | Phase 11 証跡の metadata を追加                                        |
| `outputs/phase-12/implementation-guide.md`                   | screenshot reference と current contract を追記                        |
| `outputs/phase-12/system-spec-update-summary.md`             | docs-only 表現を廃止し、Step 2 同期済みへ更新                          |
| `outputs/phase-12/phase12-task-spec-compliance-check.md`     | partial screenshot coverage blocker を反映                             |
| `outputs/verification-report.md`                             | Phase 11 / 13 blocked を反映                                           |

## validator 結果

| 観点                                  | 結果    |
| ------------------------------------- | ------- |
| `validate-phase-output.js --phase 12` | PASS    |
| screenshot file requirement           | PASS    |
| root / outputs `artifacts.json` 同期  | PASS    |
| actual screenshot evidence            | BLOCKED |

## residual risk

- fallback evidence chain は追加し、`MT-01` 相当の PNG はあるが capture plan 全体は未充足
- したがって runtime evidence は residual ではなく open blocker として管理する
