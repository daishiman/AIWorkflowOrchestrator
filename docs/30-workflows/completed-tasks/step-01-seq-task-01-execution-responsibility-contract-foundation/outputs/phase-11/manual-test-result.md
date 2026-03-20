# Phase 11: 手動テスト結果

## メタ情報

| 項目     | 内容                                                      |
| -------- | --------------------------------------------------------- |
| タスクID | TASK-IMP-EXECUTION-RESPONSIBILITY-CONTRACT-FOUNDATION-001 |
| Phase    | 11                                                        |
| 実行日   | 2026-03-20                                                |
| 実行方式 | dedicated review-board harness + Playwright capture       |

## テスト結果

| テストケース | 観点                                                                              | 結果 | 証跡                                                                 | 備考                             |
| ------------ | --------------------------------------------------------------------------------- | ---- | -------------------------------------------------------------------- | -------------------------------- |
| TC-01        | integratedRuntime ready / primary=`AI で実行` / secondary=`設定を開く`            | PASS | `outputs/phase-11/screenshots/TC-01-integrated-runtime-ready.png`    | capture: 2026-03-20 13:10:41 JST |
| TC-02        | terminalSurface ready / primary=`ターミナルで実行` / secondary=`コマンドをコピー` | PASS | `outputs/phase-11/screenshots/TC-02-terminal-surface-ready.png`      | capture: 2026-03-20 13:10:42 JST |
| TC-03        | both ready / dual lane 表示順が integrated -> terminal                            | PASS | `outputs/phase-11/screenshots/TC-03-both-ready.png`                  | capture: 2026-03-20 13:10:43 JST |
| TC-04        | none unavailable / primary CTA hidden / secondary=`セットアップガイド`            | PASS | `outputs/phase-11/screenshots/TC-04-none-unavailable.png`            | capture: 2026-03-20 13:10:44 JST |
| TC-05        | none blocked -> integratedRuntime ready transition                                | PASS | `outputs/phase-11/screenshots/TC-05-blocked-to-ready-transition.png` | capture: 2026-03-20 13:10:44 JST |
| TC-06        | silent fallback guard / no-primary guard                                          | PASS | `outputs/phase-11/screenshots/TC-06-silent-fallback-guard.png`       | capture: 2026-03-20 13:10:45 JST |

## 仕様照合サマリー

| 確認項目                                    | 結果 |
| ------------------------------------------- | ---- |
| capability 4状態の visual contract          | PASS |
| uiState 3語彙の visual contract             | PASS |
| primary / secondary CTA 契約                | PASS |
| `none + unavailable` の primary hidden 契約 | PASS |
| silent fallback 禁止ガード                  | PASS |

## 補足

- screenshot は `phase11-capture-metadata.json` と 1:1 で対応している
- review-board harness は `execution-capability.ts` の current 実装を描画している
