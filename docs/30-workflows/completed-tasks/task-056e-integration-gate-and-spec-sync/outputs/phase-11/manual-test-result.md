# Phase 11 手動テスト結果

## 実施情報

| 項目         | 内容                                                                                             |
| ------------ | ------------------------------------------------------------------------------------------------ |
| 実施日       | 2026-03-06                                                                                       |
| 実施者       | SubAgent-E3 / E4                                                                                 |
| 実行コマンド | `node apps/desktop/scripts/capture-task-056e-integration-gate-screenshots.mjs`                   |
| 観点         | パス実在、文書内容、AppDock、NotificationCenter、HistorySearch、履歴ルート、Apple UI/UX 視覚監査 |

## テスト結果

| TC-ID    | シナリオ                                                     | 結果 | 証跡                                                     | Apple UI/UX 判定                                                       |
| -------- | ------------------------------------------------------------ | ---- | -------------------------------------------------------- | ---------------------------------------------------------------------- |
| TC-11-01 | Dashboard / AppDock の導線と unread badge を確認             | PASS | `screenshots/TC-11-01-dashboard-desktop.png`             | PASS: primary navigation が左端に集約され、通知 badge が主張しすぎない |
| TC-11-02 | NotificationCenter popover の階層と action affordance を確認 | PASS | `screenshots/TC-11-02-notification-popover-desktop.png`  | PASS: title / timestamp / action の主従が明確                          |
| TC-11-03 | HistorySearch desktop の stats / search / results を確認     | PASS | `screenshots/TC-11-03-history-search-desktop.png`        | PASS: card separation と余白が読みやすい                               |
| TC-11-04 | `/chat/history` 空状態の説明性を確認                         | PASS | `screenshots/TC-11-04-chat-history-route-desktop.png`    | PASS: disabled export とメッセージの意味が一致                         |
| TC-11-05 | `/history/file-123` の split layout を確認                   | PASS | `screenshots/TC-11-05-version-history-route-desktop.png` | PASS: list/detail の役割分離が明瞭                                     |
| TC-11-06 | mobile HistorySearch の bottom navigation 密度を確認         | PASS | `screenshots/TC-11-06-history-search-mobile.png`         | PASS: 主要操作が画面下部で詰まりすぎない                               |

## 補助確認（非視覚）

| ID       | シナリオ                                                                                                    | 結果 | 証跡       |
| -------- | ----------------------------------------------------------------------------------------------------------- | ---- | ---------- |
| NV-11-01 | A/B/C/D、downstream 3件、`task-workflow.md`、`lessons-learned.md` の実在確認                                | PASS | `EV-11-04` |
| NV-11-02 | `review-gate.md`、`spec-sync-targets.md`、`dependency-handoff-plan.md`、`final-review-result.md` の実在確認 | PASS | `EV-11-04` |
| NV-11-03 | parent docs が current workflow path を参照することを確認                                                   | PASS | `EV-11-03` |
| NV-11-04 | `review-gate.md` の 5軸、`spec-sync-targets.md` の 3区分を確認                                              | PASS | `EV-11-05` |

## Apple UI/UX 視覚検証

| 観点                  | 判定 | コメント                                                                                     |
| --------------------- | ---- | -------------------------------------------------------------------------------------------- |
| 情報階層              | PASS | AppDock、通知、検索結果、履歴一覧で主従が素直に読める                                        |
| 余白と密度            | PASS | desktop は呼吸感があり、mobile も主要操作は維持。ただし side rail 残存で本文幅の余裕は限定的 |
| 主要操作の明瞭さ      | PASS | bell、History 導線、検索、load more の affordance が一貫している                             |
| 空状態 / 補助状態     | PASS | `/chat/history` の空状態は説明的で、誤操作防止の disabled state も自然                       |
| 視認性 / コントラスト | PASS | badge、card、divider の役割が分離され、情報の埋没がない                                      |
| 総合評価              | PASS | `spec_created` タスクであっても branch-level integration visual smoke として十分             |

## 総括

- 参照経路、更新先、主要成果物の実在はすべて確認できた。
- current/completed/parent の path ドリフトは parent docs の canonical path 修正で解消した。
- representative UI surfaces 6件の再撮影を行い、Apple UI/UX 観点でも block する問題は検出されなかった。
- mobile 履歴検索では side rail が残るため横幅効率は改善余地があるが、今回の integration visual recheck では未タスク化を要する破綻には達していない。
