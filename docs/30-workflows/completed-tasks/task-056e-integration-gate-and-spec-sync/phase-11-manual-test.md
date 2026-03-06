# Phase 11: 手動テスト検証

## メタ情報

| 項目         | 内容                                                                    |
| ------------ | ----------------------------------------------------------------------- |
| Phase        | 11                                                                      |
| Phase名      | 手動テスト検証                                                          |
| 前提Phase    | Phase 1, Phase 2, Phase 5, Phase 6, Phase 7, Phase 8, Phase 9, Phase 10 |
| 後続Phase    | Phase 12                                                                |
| ステータス   | completed                                                               |
| 作成日       | 2026-03-06                                                              |
| 機能名       | task-056e-integration-gate-and-spec-sync                                |
| 担当SubAgent | SubAgent-E3 / E4                                                        |

## 目的

統合レビューゲート文書、仕様同期対象一覧、下流引き渡し条件の実在性と参照性を手動で確認する。あわせて、`TASK-UI-01-A/C/D` が接続する代表 UI 画面を branch-level integration smoke として再撮影し、Apple UI/UX 観点で視覚的に監査する。

## 実行タスク

- 参照経路検証: 上流正本、下流参照先、aiworkflow 更新先、parent docs の canonical path を確認する。
- 内容検証: 判定表、更新区分、引き渡し条件が文書に存在することを確認する。
- 画面検証: `AppDock`、`NotificationCenter`、`HistorySearchView`、`/chat/history`、`/history/:fileId` を current branch 上で撮影する。
- 視覚監査: Apple HIG 相当の観点で、情報階層、余白、操作の明瞭さ、空状態、モバイル密度を確認する。
- 証跡記録: コマンド結果、確認ログ、スクリーンショット、発見事項を証跡ファイルへ記録する。

## 参照資料

| 参照資料             | パス                                                                      | 内容                                    |
| -------------------- | ------------------------------------------------------------------------- | --------------------------------------- |
| Phase 1要件          | `phase-1-requirements.md`                                                 | 検証基準                                |
| Phase 2設計          | `phase-2-design.md`                                                       | 検証基準                                |
| Phase 5実装          | `phase-5-implementation.md`                                               | 検証対象                                |
| Phase 6拡充          | `phase-6-test-expansion.md`                                               | 回帰観点                                |
| Phase 7判定          | `phase-7-coverage-check.md`                                               | 網羅基準                                |
| Phase 8リファクタ    | `phase-8-refactoring.md`                                                  | 命名整合基準                            |
| Phase 9品質保証      | `phase-9-quality-assurance.md`                                            | 品質基準                                |
| Phase 10最終レビュー | `phase-10-final-review.md`                                                | 解放条件                                |
| 最終レビュー結果     | `outputs/phase-10/final-review-result.md`                                 | Phase 10 成果物                         |
| 差し戻し判断ログ     | `outputs/phase-10/rework-decision-log.md`                                 | Phase 10 成果物                         |
| キャプチャスクリプト | `apps/desktop/scripts/capture-task-056e-integration-gate-screenshots.mjs` | current workflow 向け Phase 11 画面証跡 |

## システム仕様（aiworkflow-requirements）

| 参照資料            | パス                                                                          | 内容               |
| ------------------- | ----------------------------------------------------------------------------- | ------------------ |
| タスク台帳          | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`          | 台帳更新先の確認   |
| 品質要件            | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`   | 検証基準           |
| Preloadセキュリティ | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`  | 公開API境界の確認  |
| エラーハンドリング  | `.claude/skills/aiworkflow-requirements/references/error-handling.md`         | FAIL記録形式の確認 |
| 履歴統合            | `.claude/skills/aiworkflow-requirements/references/ui-history-integration.md` | history導線の確認  |
| ナビゲーションUI    | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`       | nav導線の確認      |
| 教訓集              | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`        | 証跡不足の再発防止 |

## 実行手順

### ステップ1: パス実在確認

`test -f` と `rg -n` で上流正本、下流参照先、aiworkflow 更新先、parent docs の current workflow path を確認する。

### ステップ2: 文書内容確認

`review-gate.md` と `spec-sync-targets.md` に 5軸、3区分、downstream 3件の条件が存在することを目視で確認する。

### ステップ3: 代表画面のスクリーンショット取得

`apps/desktop/scripts/capture-task-056e-integration-gate-screenshots.mjs` を実行し、`outputs/phase-11/screenshots/` に 6 枚の証跡を出力する。

### ステップ4: Apple UI/UX 視覚監査

取得した 6 枚を対象に、情報階層、余白、主要操作の視認性、空状態、モバイルナビゲーション密度を確認する。

### ステップ5: 証跡整理

手動確認の結果を `manual-test-result.md`、`evidence-index.md`、`screenshot-matrix.md`、`discovered-issues.md` に同期する。

## テストケース

| TC-ID    | 観点                  | 手順                                                           | 期待結果                                     |
| -------- | --------------------- | -------------------------------------------------------------- | -------------------------------------------- |
| TC-11-01 | Dashboard / AppDock   | `/` を表示し、desktop AppDock と notification badge を確認する | 主要導線が一画面で把握できる                 |
| TC-11-02 | NotificationCenter    | bell から popover を開き、未読表示と詳細展開を確認する         | 情報階層とアクションが明確である             |
| TC-11-03 | HistorySearch desktop | `History` 導線から履歴検索画面へ遷移する                       | 統計、検索、結果一覧が同時に視認できる       |
| TC-11-04 | Chat history route    | `/chat/history` の空状態を確認する                             | 空状態が説明的で誤操作を誘発しない           |
| TC-11-05 | Version history route | `/history/file-123` の一覧画面を確認する                       | 履歴一覧と詳細領域の役割が分離されている     |
| TC-11-06 | HistorySearch mobile  | mobile viewport で `History` を開く                            | bottom navigation と結果一覧が過密にならない |

## 画面カバレッジマトリクス

| 画面 / コンポーネント | 状態                           | TC-ID    | 優先度 | 必須証跡                                                 |
| --------------------- | ------------------------------ | -------- | ------ | -------------------------------------------------------- |
| Dashboard + AppDock   | desktop default                | TC-11-01 | A      | `screenshots/TC-11-01-dashboard-desktop.png`             |
| NotificationCenter    | popover open + detail expanded | TC-11-02 | A      | `screenshots/TC-11-02-notification-popover-desktop.png`  |
| HistorySearchView     | desktop results loaded         | TC-11-03 | A      | `screenshots/TC-11-03-history-search-desktop.png`        |
| Chat history route    | empty state                    | TC-11-04 | B      | `screenshots/TC-11-04-chat-history-route-desktop.png`    |
| HistoryPage           | version history list visible   | TC-11-05 | B      | `screenshots/TC-11-05-version-history-route-desktop.png` |
| HistorySearchView     | mobile responsive              | TC-11-06 | A      | `screenshots/TC-11-06-history-search-mobile.png`         |

## 統合テスト連携

| 観点     | 内容                                                                    |
| -------- | ----------------------------------------------------------------------- |
| パス整合 | 上流正本、下流参照先、aiworkflow 更新先の実在を確認する                 |
| 内容整合 | 判定表、更新区分、引き渡し条件の存在を確認する                          |
| 画面整合 | representative UI surfaces が current branch の実装に一致するか確認する |
| 証跡整合 | コマンド結果と手動確認結果が証跡に反映されているか確認する              |

## 成果物

| 成果物                       | パス                                     | 内容                      |
| ---------------------------- | ---------------------------------------- | ------------------------- |
| 手動テスト計画               | `outputs/phase-11/manual-test-plan.md`   | 手動確認手順              |
| 手動テスト結果               | `outputs/phase-11/manual-test-result.md` | 手動確認結果              |
| 証跡インデックス             | `outputs/phase-11/evidence-index.md`     | コマンドと確認項目の一覧  |
| スクリーンショットマトリクス | `outputs/phase-11/screenshot-matrix.md`  | UI証跡と Apple UI/UX 判定 |
| 発見事項一覧                 | `outputs/phase-11/discovered-issues.md`  | 手動確認で見つかった問題  |

## 完了条件

- [x] 上流正本、下流参照先、aiworkflow 更新先のパス実在確認結果が記録されている
- [x] 判定表、更新区分、引き渡し条件の存在確認結果が記録されている
- [x] representative UI screens のスクリーンショットが `outputs/phase-11/screenshots/` に出力されている
- [x] Apple UI/UX 視覚監査結果が `manual-test-result.md` と `screenshot-matrix.md` に記録されている
- [x] `evidence-index.md` に確認コマンドと結果が記録されている
- [x] `screenshot-matrix.md` に UI証跡の対応関係が記録されている
- [x] 発見事項が0件でも `discovered-issues.md` が作成される

## 次のPhase

Phase 12: ドキュメント更新

## 多角的チェック観点（AIが判断）

| 観点               | 適用判断                                                              | 仕様参照先                                                                                              |
| ------------------ | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| パス実在           | 正本導線と更新先の実在を確認するため適用                              | `phase-5-implementation.md`                                                                             |
| 台帳整合           | task-workflow / lessons の更新先実在を確認するため適用                | `aiworkflow-requirements: task-workflow.md`, `lessons-learned.md`                                       |
| 証跡整合           | 手動確認結果の証跡化を確認するため適用                                | `aiworkflow-requirements: quality-requirements.md`, `error-handling.md`                                 |
| Preload / 導線整合 | 公開API境界と history / nav 導線を確認するため適用                    | `aiworkflow-requirements: security-api-electron.md`, `ui-history-integration.md`, `ui-ux-navigation.md` |
| UI証跡分岐         | docs-heavy task でも upstream UI の統合再確認が必要か判断するため適用 | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`                             |

## サブタスク管理

Phase実行開始時に、TodoWriteツールまたは同等のタスク管理手段で以下のサブタスクを作成し、完了後ただちに `completed` へ更新する。

1. パス実在確認
2. 文書内容確認
3. 画面キャプチャ
4. Apple UI/UX 視覚監査
5. 証跡整理
6. 発見事項の記録
7. 完了条件の検証

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 手動テスト結果と証跡インデックスを成果物へ反映
- [x] representative UI screens と Apple UI/UX 視覚監査結果を成果物へ反映
- [x] `artifacts.json` の対象Phaseステータス更新内容を確認

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/completed-tasks/task-056e-integration-gate-and-spec-sync \
  --phase 11
```
