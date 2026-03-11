# Phase 11: 手動テスト

## メタ情報

| 項目       | 値                                                       |
| ---------- | -------------------------------------------------------- |
| Phase      | 11                                                       |
| Phase名    | 手動テスト                                               |
| タスクID   | TASK-SKILL-LIFECYCLE-01                                  |
| タスク名   | スキルライフサイクル一次導線・画面責務基盤               |
| 前提Phase  | [phase-10-final-review.md](./phase-10-final-review.md)   |
| 後続Phase  | [phase-12-documentation.md](./phase-12-documentation.md) |
| ステータス | completed                                                |
| 作成日     | 2026-03-11                                               |

## 目的

設計通りに一次導線を人手でたどり、開始地点の分かりやすさ、画面責務、advanced 導線の補助化を確認する。

## 実行タスク

- 主要導線確認: `作る` `使う` `改善する` の入口と完了地点を確認する
- 画面責務確認: 主要画面が定義外の責務を持っていないか確認する
- advanced 導線確認: advanced が主要導線の代替になっていないか確認する
- 視覚証跡取得: route / shell / representative surface の screenshot を取得する

## 参照資料

| 参照資料                 | パス                                                                            | 内容                                |
| ------------------------ | ------------------------------------------------------------------------------- | ----------------------------------- |
| primary journey sequence | `outputs/phase-2/primary-journey-sequence.md`                                   | 導線期待値                          |
| implementation log       | `outputs/phase-5/implementation-log.md`                                         | 実装差分                            |
| test expansion result    | `outputs/phase-6/test-expansion-result.md`                                      | 追加テスト結果                      |
| coverage report          | `outputs/phase-7/coverage-report.md`                                            | coverage 抜け                       |
| refactoring log          | `outputs/phase-8/refactoring-log.md`                                            | 最終構造                            |
| quality report           | `outputs/phase-9/quality-report.md`                                             | 品質監査結果                        |
| final review             | `outputs/phase-10/final-review-result.md`                                       | 持ち込み論点                        |
| test cases               | `outputs/phase-4/test-cases.md`                                                 | TC-ID 基本表                        |
| phase 11/12 guide        | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`     | screenshot / coverage 必須条件      |
| UI navigation            | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`         | shell と route 期待値               |
| feature components       | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md` | representative surface              |
| state management         | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`    | `settings` bypass / reset exclusion |

## 実行手順

1. 関連する自動テストを再確認する。
2. TC-ID ごとに実行経路、期待結果、証跡ファイル名を確定する。
3. route ベースと representative surface ベースの screenshot を取得し、責務比較は selector-based element capture を優先する。
4. 視認性、用語、責務分離、advanced 導線の非主要化をレビューする。
5. 発見課題を `discovered-issues.md` へ記録する。

## テストケース

| テストケース | 対象                     | 期待結果                                                                           | 証跡ファイル                         |
| ------------ | ------------------------ | ---------------------------------------------------------------------------------- | ------------------------------------ |
| TC-11-01     | 「スキルを作る」入口     | `Skill Creator` への開始地点が主要導線上で分かる                                   | `TC-11-01-create-entry.png`          |
| TC-11-02     | 「スキルを使う」入口     | `Agent` または `Workspace` の実行導線が一意に分かる                                | `TC-11-02-execute-entry.png`         |
| TC-11-03     | 「スキルを改善する」入口 | `SkillAnalysisView` を起点とする改善導線への接続が自然である                       | `TC-11-03-improve-entry.png`         |
| TC-11-04     | advanced 導線            | advanced / hidden 導線が主要導線の代替になっていない                               | `TC-11-04-advanced-supporting.png`   |
| TC-11-05     | 画面責務                 | `Skill Center` `Workspace` `Agent` `Chat` `Skill Creator` の責務が定義どおり見える | `TC-11-05-surface-ownership.png`     |
| TC-11-06     | 公開ビュー例外           | `settings` が AuthGuard bypass / reset exclusion を満たしつつ主要導線を壊さない    | `TC-11-06-settings-public-shell.png` |

## 画面カバレッジマトリクス

| テストケース | 画面/状態                   | 種別       | 優先度 | 証跡                                 | 備考                                   |
| ------------ | --------------------------- | ---------- | ------ | ------------------------------------ | -------------------------------------- |
| TC-11-01     | Global nav 上の create 導線 | SCREENSHOT | A      | `TC-11-01-create-entry.png`          | desktop/tablet 代表                    |
| TC-11-02     | execute 導線の主入口        | SCREENSHOT | A      | `TC-11-02-execute-entry.png`         | route 表示                             |
| TC-11-03     | improve 導線の handoff      | SCREENSHOT | A      | `TC-11-03-improve-entry.png`         | lifecycle handoff                      |
| TC-11-04     | advanced 補助導線           | SCREENSHOT | B      | `TC-11-04-advanced-supporting.png`   | fallback 扱い                          |
| TC-11-05     | 代表画面責務の比較          | SCREENSHOT | B      | `TC-11-05-surface-ownership.png`     | surface ownership board を要素 capture |
| TC-11-06     | settings 公開 shell         | SCREENSHOT | B      | `TC-11-06-settings-public-shell.png` | bypass / reset exclusion               |

## 統合テスト連携

| 観点                   | 連携内容                                                                                                                                                             |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| route contract         | `skillLifecycleJourney.test.ts` と `navContract.test.ts` で canonical view / advanced policy を自動確認し、Phase 11 では人手で入口の分かりやすさを補完する           |
| Skill Center surface   | `SkillCenterView.test.tsx` で journey panel と surface ownership panel の存在を固定し、Phase 11 では create / use / improve の視認性と責務カードの役割分離を確認する |
| public shell exception | `shouldResetUnauthenticatedView.test.ts` で `settings` 公開 shell 契約を固定し、Phase 11 では screenshot で導線破綻がないことを確認する                              |

## 成果物

| 成果物                | パス                                      | 説明           |
| --------------------- | ----------------------------------------- | -------------- |
| 手動テスト結果        | `outputs/phase-11/manual-test-result.md`  | TC-ID 結果     |
| 発見事項              | `outputs/phase-11/discovered-issues.md`   | 問題一覧       |
| screenshot 計画       | `outputs/phase-11/screenshot-plan.json`   | 撮影対象       |
| screenshot カバレッジ | `outputs/phase-11/screenshot-coverage.md` | カバレッジ集計 |

## 完了条件

- [x] `## テストケース` と `## 画面カバレッジマトリクス` が埋まっている
- [x] 主要導線 3 本と advanced 導線の screenshot 証跡がある
- [x] `settings` 公開 shell の screenshot 証跡がある
- [x] 画面責務の迷いポイントが記録されている
- [x] 発見課題が 0 件でも結果が記録されている
- [x] 本Phase内の全タスクを100%実行完了

## 依存関係

- 前提: [phase-10-final-review.md](./phase-10-final-review.md)
- 後続: [phase-12-documentation.md](./phase-12-documentation.md)

## サブタスク管理

- [x] 参照資料確認
- [x] TC-ID 実行
- [x] screenshot 取得
- [x] 発見事項記録
- [x] 完了条件検証

## タスク100%実行確認

- [x] 本Phase内の全タスクを100%実行完了
- [x] TC-ID と screenshot が対応している
- [x] Phase 12 で引用できる証跡が揃っている

## 次のPhase

Phase 12: [phase-12-documentation.md](./phase-12-documentation.md)
