# Phase 11: 手動テスト検証

## メタ情報

| 項目     | 値                                            |
| -------- | --------------------------------------------- |
| Phase    | 11                                            |
| タスクID | TASK-FIX-IPC-HANDLER-GRACEFUL-DEGRADATION-001 |
| 機能名   | ipc-handler-graceful-degradation              |
| 作成日   | 2026-03-08                                    |

## 目的

`registerAllIpcHandlers()` の Graceful Degradation 実装後も、代表 UI surface が起動時に崩れず表示されることをスクリーンショット付きで確認する。今回の変更は Main Process 側の登録制御であり Renderer 実装の直接変更ではないため、影響範囲の広い代表画面を選んで検証する。

## 実行タスク

- 代表画面定義: Dashboard / Settings / Skill Center を代表 surface として固定する
- スクリーンショット取得: Playwright + Vite harness で Phase 11 証跡を取得する
- 結果記録: TC-ID ごとに証跡・取得日時・妥当性確認を `manual-test-result.md` に残す

## 参照資料

| 資料名                       | パス                                                                                        | 説明                                |
| ---------------------------- | ------------------------------------------------------------------------------------------- | ----------------------------------- |
| 実装コード                   | `apps/desktop/src/main/ipc/index.ts`                                                        | Main Process の対象実装             |
| キャプチャスクリプト         | `apps/desktop/scripts/capture-ipc-graceful-degradation-phase11.mjs`                         | Phase 11 証跡取得                   |
| スクリーンショット検証手順   | `.claude/skills/task-specification-creator/references/screenshot-verification-procedure.md` | S-1〜S-4 検証の正本                 |
| Phase 2 設計書               | `outputs/phase-2/design-document.md`                                                        | 代表画面選定と影響範囲の設計根拠    |
| Phase 5 実装レポート         | `outputs/phase-5/implementation-report.md`                                                  | Main Process 側の実装差分と影響範囲 |
| Phase 6 カバレッジレポート   | `outputs/phase-6/coverage-report.md`                                                        | 追加テストの到達範囲確認            |
| Phase 7 カバレッジ結果       | `outputs/phase-7/coverage-result.md`                                                        | 閾値充足の確認                      |
| Phase 8 リファクタリングログ | `outputs/phase-8/refactoring-log.md`                                                        | 実装整理後も UI 影響がない前提確認  |
| Phase 9 品質検証結果         | `outputs/phase-9/quality-report.md`                                                         | 手動検証前の品質ゲート結果          |
| Phase 10 最終レビュー結果    | `outputs/phase-10/final-review.md`                                                          | 手動検証の入力                      |
| Phase 10 要件充足マトリクス  | `outputs/phase-10/requirements-matrix.md`                                                   | Phase 10 成果物                     |

### 前提Phase成果物

| 資料名          | パス                | 用途                                   |
| --------------- | ------------------- | -------------------------------------- |
| Phase 2 成果物  | `outputs/phase-2/`  | 代表画面と影響範囲の設計根拠を参照する |
| Phase 5 成果物  | `outputs/phase-5/`  | 実装差分を参照する                     |
| Phase 6 成果物  | `outputs/phase-6/`  | テスト拡充結果を参照する               |
| Phase 7 成果物  | `outputs/phase-7/`  | カバレッジ閾値の充足を参照する         |
| Phase 8 成果物  | `outputs/phase-8/`  | リファクタリング後の構成を参照する     |
| Phase 9 成果物  | `outputs/phase-9/`  | 品質ゲート結果を参照する               |
| Phase 10 成果物 | `outputs/phase-10/` | 最終レビュー結果を参照する             |

## 実行手順

### ステップ1: スクリーンショット取得

`pnpm --filter @repo/desktop exec node scripts/capture-ipc-graceful-degradation-phase11.mjs` を実行し、`outputs/phase-11/screenshots/` に証跡を出力する。

### ステップ2: 画面内容確認

取得した 3 画面について、代表 surface が崩れていないこと、主要 UI 要素が描画されていることを確認する。

### ステップ3: 証跡妥当性確認

各スクリーンショットについて、S-1（実在）/ S-2（取得日）/ S-3（合理性）/ S-4（内容一致）を確認する。

## テストケース

| TC-ID    | 観点                | 手順                                           | 期待結果                                                                               |
| -------- | ------------------- | ---------------------------------------------- | -------------------------------------------------------------------------------------- |
| TC-11-01 | Dashboard 起動面    | ルート画面を開き、Dashboard surface を表示する | `dashboard-view` が表示され、統計カードとアクティビティ領域が崩れず描画される          |
| TC-11-02 | Settings 認証面     | `phase11-auth-mode.html` harness を開く        | `settings-view` が表示され、認証方式・API Key・プロフィール関連の surface が描画される |
| TC-11-03 | Skill Center 単独面 | `/advanced/skill-center` を開く                | `skill-center-view` が表示され、検索・カテゴリ・カード領域が描画される                 |

## 画面カバレッジマトリクス

| TC-ID    | 証跡                                                          | 判定       |
| -------- | ------------------------------------------------------------- | ---------- |
| TC-11-01 | `screenshots/TC-11-01-dashboard-root-2026-03-08.png`          | SCREENSHOT |
| TC-11-02 | `screenshots/TC-11-02-settings-auth-surfaces-2026-03-08.png`  | SCREENSHOT |
| TC-11-03 | `screenshots/TC-11-03-skill-center-standalone-2026-03-08.png` | SCREENSHOT |

## 統合テスト連携

| 観点           | 内容                                                                |
| -------------- | ------------------------------------------------------------------- |
| 自動テスト連携 | Main Process の 19 テストと UI surface の目視結果を突き合わせる     |
| 画面証跡連携   | TC-ID とスクリーンショットを 1:1 で紐付ける                         |
| Phase 12 連携  | Phase 11 証跡を `validate-phase11-screenshot-coverage` の入力にする |

## 成果物

| 成果物         | パス                                     | 説明              |
| -------------- | ---------------------------------------- | ----------------- |
| 手動テスト結果 | `outputs/phase-11/manual-test-result.md` | TC-ID ごとの結果  |
| 発見課題一覧   | `outputs/phase-11/discovered-issues.md`  | 0件でも必須で記録 |

## 完了条件

- [x] TC-11-01〜03 が定義されている
- [x] 各 TC-ID にスクリーンショット証跡が紐付いている
- [x] S-1〜S-4 の証跡確認を `manual-test-result.md` に記録する前提が明記されている
- [x] Phase 12 の validator 入力形式に整合している
- [x] 本Phase内の全タスクを100%実行完了

## 次のPhase

Phase 12: ドキュメント更新
