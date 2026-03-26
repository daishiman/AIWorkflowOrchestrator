# Phase 11: 手動テスト

## メタ情報

| 項目       | 内容                                                                    |
| ---------- | ----------------------------------------------------------------------- |
| タスクID   | TASK-SDK-01                                                             |
| Phase      | 11                                                                      |
| Phase名    | 手動テスト                                                              |
| ステータス | spec_created                                                            |
| 前提Phase  | Phase 1, Phase 2, Phase 5, Phase 6, Phase 7, Phase 8, Phase 9, Phase 10 |
| 後続Phase  | Phase 12                                                                |
| 作成日     | 2026-03-26                                                              |

## 目的

実装者とレビュー担当者が、manifest の責務と非責務を文書だけで読み分けられるかを確認する。画像証跡の採取は不要で、文書 walkthrough を主対象とする。

## タスク種別判定

| タスク種別       | 判定条件                              | 判定結果 |
| ---------------- | ------------------------------------- | -------- |
| 設計タスク       | `spec_created` の仕様書作成が主である | 該当     |
| docs-only タスク | Renderer UI の追加・変更がない        | 該当     |
| UI タスク        | 画面差分の screenshot を主証跡にする  | 非該当   |

本タスクは manifest contract の仕様整理であり、UI 実装差分を伴わないため NON_VISUAL walkthrough とする。

## NON_VISUAL 判定記録

| 状況                        | 対応                                                    |
| --------------------------- | ------------------------------------------------------- |
| current workflow が文書中心 | checklist / result / discovered-issues を正本証跡にする |
| Renderer UI 差分なし        | screenshot / review board を必須にしない                |
| 読解可能性の確認が主目的    | 文章による根拠記録を優先する                            |

## 実行タスク

- reader walkthrough: index と Phase 1、2、10 を読み、manifest scope を説明できるか確認する
- anchor walkthrough: current code anchor map と authority split matrix の対応を確認する
- downstream walkthrough: Task02、Task03、Task04 へ渡す handoff が迷わず読めるか確認する
- issue capture: 読み間違い、用語衝突、抜けを記録する

## 参照資料

| 資料名                   | パス                                           | 説明                   |
| ------------------------ | ---------------------------------------------- | ---------------------- |
| Phase 1                  | `phase-1-requirements.md`                      | scope 説明元           |
| Phase 2                  | `phase-2-design.md`                            | schema / loader 説明元 |
| Phase 10                 | `phase-10-final-review.md`                     | final gate             |
| current-code-anchor-map  | `outputs/phase-1/current-code-anchor-map.md`   | anchor walkthrough     |
| authority-split-matrix   | `outputs/phase-2/authority-split-matrix.md`    | responsibility map     |
| task02-handoff-checklist | `outputs/phase-10/task02-handoff-checklist.md` | downstream readiness   |

### システム仕様（aiworkflow-requirements）

| 参照資料                             | パス                                                                                        | 内容                            |
| ------------------------------------ | ------------------------------------------------------------------------------------------- | ------------------------------- |
| api-ipc-system-core                  | `.claude/skills/aiworkflow-requirements/references/api-ipc-system-core.md`                  | current public IPC との読み分け |
| arch-electron-services-details-part2 | `.claude/skills/aiworkflow-requirements/references/arch-electron-services-details-part2.md` | facade authority との読み分け   |
| task-workflow                        | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                        | Phase 12 sync 先                |

## 実行手順

1. index、Phase 1、Phase 2 を読み、manifest の責務を 3 文以内で説明できるか確認する。
2. current-code-anchor-map を見て、loader が IPC や permission を扱わない理由を説明できるか確認する。
3. task02-handoff-checklist を見て、Task02、Task03、Task04 の入力が不足していないか確認する。
4. 読み間違いと open issue を discovered-issues に記録する。

## テストケース

| テストケース | 対象                     | 期待結果                                 | 結果記録先                               |
| ------------ | ------------------------ | ---------------------------------------- | ---------------------------------------- |
| TC-11-01     | index + Phase 1          | manifest scope を 3 文以内で説明できる   | `outputs/phase-11/manual-test-result.md` |
| TC-11-02     | current-code-anchor-map  | loader 非責務を根拠付きで説明できる      | `outputs/phase-11/manual-test-result.md` |
| TC-11-03     | task02-handoff-checklist | Task02/03/04 の handoff 欠落を指摘できる | `outputs/phase-11/manual-test-result.md` |

## 画面カバレッジマトリクス

| テストケース | 対象                     | 区分      | 証跡                                     | 備考                       |
| ------------ | ------------------------ | --------- | ---------------------------------------- | -------------------------- |
| TC-11-01     | index + Phase 1          | docs-only | `outputs/phase-11/manual-test-result.md` | 画像証跡は採取しない       |
| TC-11-02     | current-code-anchor-map  | docs-only | `outputs/phase-11/manual-test-result.md` | 根拠説明を文章で残す       |
| TC-11-03     | task02-handoff-checklist | docs-only | `outputs/phase-11/manual-test-result.md` | handoff 読解結果を記録する |

## 統合テスト連携

- Phase 12 は manual walkthrough で出た issue だけを同期対象に加える。
- Phase 13 は Phase 11 の結果が揃うまで blocked のままにする。
- NON_VISUAL task のため screenshot-plan.json や `screenshots/` は初期成果物に含めない。後続で画面確認が必要になった場合のみ current workflow 配下へ追加する。

## 成果物

| 成果物                | パス                                        | 説明             |
| --------------------- | ------------------------------------------- | ---------------- |
| manual-test-checklist | `outputs/phase-11/manual-test-checklist.md` | walkthrough 手順 |
| manual-test-result    | `outputs/phase-11/manual-test-result.md`    | 実施結果         |
| discovered-issues     | `outputs/phase-11/discovered-issues.md`     | 発見事項         |

## 完了条件

- [ ] manifest scope を 3 文以内で説明できる手順が checklist にある
- [ ] current code anchor と authority split の読み分け確認が記録されている
- [ ] Task02、Task03、Task04 の handoff 読解結果が記録されている
- [ ] discovered-issues に発見事項が記録されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 多角的チェック観点

| 観点         | このPhaseでの確認内容                                              | 根拠                      |
| ------------ | ------------------------------------------------------------------ | ------------------------- |
| システム思考 | manifest と runtime authority の境界が読み手にも分かるか           | index / Phase 1 / Phase 2 |
| 価値提案思考 | 読解コストを下げる説明順になっているか                             | checklist / result        |
| 改善思考     | 読み間違いを発見したときに downstream へ波及させる前に止められるか | discovered-issues         |

## サブタスク管理

1. 参照資料の確認
2. reader / anchor / downstream walkthrough の実施
3. 手動テスト結果の記録
4. 発見事項の整理
5. 完了条件の検証

## タスク100%実行確認

- [ ] walkthrough 対象の参照資料を全て確認した
- [ ] `outputs/phase-11/manual-test-checklist.md` を更新した
- [ ] `outputs/phase-11/manual-test-result.md` を更新した
- [ ] `outputs/phase-11/discovered-issues.md` を更新した
- [ ] `artifacts.json` と `outputs/artifacts.json` の参照整合を確認した

## 次のPhase

Phase 12: ドキュメント更新
