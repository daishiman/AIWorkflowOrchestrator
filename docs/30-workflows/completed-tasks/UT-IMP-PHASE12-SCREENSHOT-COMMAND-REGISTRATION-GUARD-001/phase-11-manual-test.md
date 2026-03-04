# Phase 11: 手動テスト検証

## メタ情報

| 項目       | 値                                                                      |
| ---------- | ----------------------------------------------------------------------- |
| Phase      | 11                                                                      |
| 名称       | 手動テスト検証                                                          |
| タスクID   | UT-IMP-PHASE12-SCREENSHOT-COMMAND-REGISTRATION-GUARD-001                |
| 作成日     | 2026-03-04                                                              |
| 依存       | Phase 1, Phase 2, Phase 5, Phase 6, Phase 7, Phase 8, Phase 9, Phase 10 |
| ステータス | Draft                                                                   |

## 目的

コマンド公開運用が実際の作業手順で再現できることを手動テストで確認し、Phase 12 の文書更新証跡を確保する。

## 実行タスク

- 手動テスト実行: TC-01〜TC-06 の実行結果を記録する。
- screenshot 証跡確認: 実行コマンドで証跡が再取得されることを確認する。
- 監査結果確認: coverage validator と監査結果を記録する。

## 参照資料

| 資料                   | パス                                                                                                             | 用途            |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------- | --------------- |
| Phase 10               | `phase-10-final-review.md`                                                                                       | ゲート結果参照  |
| Phase 2成果物          | `outputs/phase-2/verification-commands.md`                                                                       | 実行順序確認    |
| Phase 5成果物          | `outputs/phase-5/implementation-summary.md`                                                                      | 実装結果確認    |
| Phase 7成果物          | `outputs/phase-7/coverage-report.md`                                                                             | カバレッジ確認  |
| Phase 8成果物          | `outputs/phase-8/refactoring-log.md`                                                                             | 手順統一確認    |
| Phase 9成果物          | `outputs/phase-9/quality-report.md`                                                                              | 品質判定確認    |
| Phase 4成果物          | `outputs/phase-4/test-cases.md`                                                                                  | TC 参照         |
| Phase 6成果物          | `outputs/phase-6/regression-matrix.md`                                                                           | 追加TC参照      |
| screenshot script      | `apps/desktop/scripts/capture-skill-import-idempotency-guard-screenshots.mjs`                                    | 実行対象        |
| workflow02 screenshots | `docs/30-workflows/completed-tasks/02-TASK-FIX-SKILL-IMPORT-IDEMPOTENCY-GUARD-001/outputs/phase-11/screenshots/` | 生成先確認      |
| aiworkflow台帳         | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                                             | 証跡同期先      |
| 最終レビュー結果       | `outputs/phase-10/final-review-result.md`                                                                        | Phase 10 成果物 |
| 最終レビューコメント   | `outputs/phase-10/final-review-comments.md`                                                                      | Phase 10 成果物 |

### システム仕様（aiworkflow-requirements）

| 参照資料      | パス                                                                            | 内容             |
| ------------- | ------------------------------------------------------------------------------- | ---------------- |
| UI/UX機能仕様 | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md` | 画面証跡の扱い   |
| 教訓          | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`          | 再撮影時の注意点 |

## 実行手順

### Step 1: 実行前確認

1. `pnpm --filter @repo/desktop run | rg screenshot` で対象コマンド表示を確認する。
2. workflow02 の screenshot 保存先が存在することを確認する。

### Step 2: 手動テストケース実行

| TC    | 手順                    | 期待結果                  |
| ----- | ----------------------- | ------------------------- |
| TC-01 | run 一覧確認            | 対象コマンドが 1 行で表示 |
| TC-02 | screenshot コマンド実行 | screenshot 取得が開始     |
| TC-03 | 出力先確認              | TC-01〜TC-04 の証跡が存在 |
| TC-04 | Phase 11 文書確認       | 新コマンド表記が存在      |
| TC-05 | Phase 12 文書確認       | 新コマンド表記が存在      |
| TC-06 | coverage validator 実行 | PASS                      |

### Step 3: 結果記録

1. `outputs/phase-11/manual-test-result.md` に TC ごとの結果を記録する。
2. 失敗がある場合は `outputs/phase-11/discovered-issues.md` に記録する。

## 統合テスト連携

| 連携対象 | 連携内容                                              |
| -------- | ----------------------------------------------------- |
| Phase 12 | manual-test-result と screenshot 証跡を更新入力へ渡す |

## 成果物

| 成果物         | パス                                     | 説明       |
| -------------- | ---------------------------------------- | ---------- |
| 手動テスト結果 | `outputs/phase-11/manual-test-result.md` | TC結果     |
| 発見課題       | `outputs/phase-11/discovered-issues.md`  | 失敗記録   |
| 証跡一覧       | `outputs/phase-11/screenshot-index.md`   | 画像対応表 |

## 完了条件

- [ ] TC-01〜TC-06 の結果が記録されている
- [ ] screenshot 証跡の保存先が確認されている
- [ ] coverage validator 判定が記録されている
- [ ] discovered-issues の有無が記録されている
- [ ] Phase 12 へ渡す証跡一覧が作成されている
- [ ] 本Phase内の全タスクを100%実行完了

## 次のPhase

Phase 12 で実装ガイドと仕様同期ドキュメントを作成する。

## 多角的チェック観点

| 観点           | 適用内容                                                | 参照仕様                                                                                    |
| -------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| セキュリティ   | 実行コマンドの公開範囲が限定されているか                | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                |
| UI/UX証跡      | Phase 11 の証跡取得コマンドが一意か                     | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`             |
| アーキテクチャ | スクリプト実体と公開コマンドの責務が分離されているか    | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` |
| 品質           | verify/validate/coverage/audit の検証順序が維持されるか | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                 |

## サブタスク管理

| サブタスク         | 状態    |
| ------------------ | ------- |
| 参照資料確認       | pending |
| 実行タスク実施     | pending |
| 統合テスト連携確認 | pending |
| 成果物定義確認     | pending |
| 完了条件確認       | pending |

## タスク100%実行確認【必須】

- [ ] 本Phaseの実行タスクをすべて実行した
- [ ] 本Phaseの成果物定義と参照資料を照合した
- [ ] 本Phaseの完了条件を全て満たした
- [ ] 次Phaseへ渡す入力を明記した
