# Phase 13: PR作成 — IPCハンドラ単位カバレッジ測定基盤構築

## メタ情報

| 項目       | 値                                                                     |
| ---------- | ---------------------------------------------------------------------- |
| Phase      | 13（PR作成）                                                           |
| タスクID   | UT-IMP-IPC-HANDLER-COVERAGE-GRANULAR-001                               |
| 機能名     | ut-imp-ipc-handler-coverage-granular-001                               |
| 前提Phase  | Phase 12                                                               |
| 後続Phase  | なし                                                                   |
| ステータス | 未実施                                                                 |
| Issue      | [#854](https://github.com/daishiman/AIWorkflowOrchestrator/issues/854) |
| 作成日     | 2026-02-28                                                             |

## 目的

変更内容を最終確認し、ユーザーの明示的な承認を得た場合のみコミット・PR作成を実行する。CI通過確認後、タスクディレクトリを`completed-tasks`に移動して完了とする。

## 背景

Phase 12までの全成果物と変更差分を最終確認し、ユーザーの明示的な承認を得た場合のみコミット・PR作成を実行する。ユーザー承認なしでのコミット/PRは禁止。

## 実行ガード【絶対遵守】

以下のガードを厳守すること:

- **コミット禁止**: ユーザーの明示的許可なしにコミットしない
- **PR作成禁止**: ユーザーの明示的許可なしにPRを作成しない
- **push禁止**: ユーザーの明示的許可なしにpushしない
- **`--no-verify` 使用禁止**: いかなる場合も使用しない

## 実行タスク

- SubAgent-A（差分整理）: 変更ファイルと成果物の整合を確認する。
- SubAgent-B（最終確認）: リンク切れ、検証漏れ、不要差分を確認する。
- Lead（承認管理）: ユーザーの明示許可取得後にのみPR手順へ進む。

## 参照資料

| 参照資料           | パス                                                               | 内容                   |
| ------------------ | ------------------------------------------------------------------ | ---------------------- |
| Phase 2            | `phase-2-design.md`                                                | 設計根拠の確認         |
| Phase 5            | `phase-5-implementation.md`                                        | 実装差分の確認         |
| Phase 6            | `phase-6-test-expansion.md`                                        | 検証差分の確認         |
| Phase 7            | `phase-7-coverage-check.md`                                        | 網羅結果の確認         |
| Phase 8            | `phase-8-refactoring.md`                                           | 構造変更の確認         |
| Phase 9            | `phase-9-quality-assurance.md`                                     | 品質保証の確認         |
| Phase 10           | `phase-10-final-review.md`                                         | 最終レビュー結果の確認 |
| Phase 11           | `phase-11-manual-test.md`                                          | 手動検証結果の確認     |
| Phase 12           | `phase-12-documentation.md`                                        | 完了要件の確認         |
| 更新サマリー       | `outputs/phase-12/spec-update-summary.md`                          | 変更根拠               |
| PR手順             | `.claude/skills/task-specification-creator/references/commands.md` | 実行コマンド参照       |
| Phase 10 結果      | `outputs/phase-10/final-review-result.md`                          | Phase 10 成果物        |
| Phase 11 結果      | `outputs/phase-11/manual-test-result.md`                           | Phase 11 成果物        |
| Phase 11 発見事項  | `outputs/phase-11/manual-findings.md`                              | Phase 11 成果物        |
| Phase 11 実行証跡  | `outputs/phase-11/command-transcript.md`                           | Phase 11 成果物        |
| 実装ガイド         | `outputs/phase-12/implementation-guide.md`                         | Phase 12 成果物        |
| 更新履歴           | `outputs/phase-12/documentation-changelog.md`                      | Phase 12 成果物        |
| 未タスク検出       | `outputs/phase-12/unassigned-task-detection.md`                    | Phase 12 成果物        |
| スキル改善レポート | `outputs/phase-12/skill-feedback-report.md`                        | Phase 12 成果物        |
| リンク整合ログ     | `outputs/phase-12/verify-unassigned-links.log`                     | Phase 12 成果物        |
| 集計スクリプト     | `apps/desktop/scripts/coverage-by-handler.ts`                      | 実装済みスクリプト     |
| テストコード       | `apps/desktop/scripts/coverage-by-handler.test.ts`                 | テストコード           |

### システム仕様（aiworkflow-requirements）

> 実装前に以下のシステム仕様を確認し、既存運用との整合を確保してください。

| 参照資料            | パス                                                                       | 内容                       |
| ------------------- | -------------------------------------------------------------------------- | -------------------------- |
| task-workflow-rules | `.claude/skills/aiworkflow-requirements/references/task-workflow-rules.md` | コミット前品質ゲートの要件 |

## 変更サマリー概要

### 新規ファイル

| ファイル                                           | 説明                                 |
| -------------------------------------------------- | ------------------------------------ |
| `apps/desktop/scripts/coverage-by-handler.ts`      | ハンドラ単位カバレッジ集計スクリプト |
| `apps/desktop/scripts/coverage-by-handler.test.ts` | 集計スクリプトのユニットテスト       |

### 更新ファイル

| ファイル                                                                    | 更新内容                                    |
| --------------------------------------------------------------------------- | ------------------------------------------- |
| `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` | Phase 7ハンドラ単位カバレッジ判定ルール追加 |
| `.claude/skills/task-specification-creator/references/phase-templates.md`   | Phase 7テンプレートにセクション追加         |

### ドキュメント

| ファイル                                                              | 説明                |
| --------------------------------------------------------------------- | ------------------- |
| `docs/30-workflows/ut-imp-ipc-handler-coverage-granular-001/`         | Phase 1-13 全仕様書 |
| `docs/30-workflows/ut-imp-ipc-handler-coverage-granular-001/outputs/` | 各Phase成果物       |

## 実行手順

### Task 13-1: ユーザーへのローカル動作確認依頼

ユーザーに以下のローカル動作確認を依頼する。

```bash
# 1. テスト実行
cd apps/desktop && pnpm vitest run scripts/coverage-by-handler.test.ts

# 2. 集計スクリプト実行（実際のskillHandlers.tsに対して）
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers.test.ts --coverage
npx tsx scripts/coverage-by-handler.ts --file src/main/ipc/skillHandlers.ts

# 3. 型チェック
pnpm typecheck

# 4. リント
pnpm lint
```

### Task 13-2: 変更サマリーの提示と許可確認

1. `git status`と`git diff --stat`で変更差分を確認する。
2. 変更サマリーをユーザーに提示する。
3. ユーザーの明示的許可を待つ（**許可なしに先へ進まない**）。

### Task 13-3: `/ai:diff-to-pr`の実行

ユーザーの許可を得た後、`/ai:diff-to-pr`を使用してPRを作成する。

**PR本文に含める内容:**

- Summary（1-3箇条書き）
  - v8カバレッジJSONを解析してIPCハンドラ単位のカバレッジを算出するスクリプトを新規作成
  - Phase 7判定ルールを策定し、ハンドラ単位でカバレッジ基準を判定するフローを文書化
  - Phase 7テンプレートにハンドラ単位カバレッジレポートセクションを追加
- Test Plan
  - 集計スクリプトのユニットテスト全PASS確認
  - 実際の`skillHandlers.ts`（23ハンドラ）に対する手動実行確認
  - エラーケース3パターン（ファイル不在、カバレッジJSON不在、引数なし）の動作検証
- 関連Issue: #854

### Task 13-4: CI確認

- [ ] PRのCIチェックが全て通過していることを確認する
- [ ] 失敗した場合は原因を調査し修正する

### Task 13-5: タスク完了処理

CI通過後、タスクディレクトリを`completed-tasks`に移動する。

```bash
# タスクディレクトリを移動
mv docs/30-workflows/ut-imp-ipc-handler-coverage-granular-001 \
   docs/30-workflows/completed-tasks/ut-imp-ipc-handler-coverage-granular-001
```

### Task 13-6: 完了記録

- [ ] `artifacts.json`の全Phaseステータスを`completed`に更新する
- [ ] 最終サマリーを記録する

## 多角的チェック観点（AIが判断）

| 観点               | 適用判断                                 | 仕様参照先                                                                                                                        |
| ------------------ | ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| セキュリティ       | 機密情報が差分に含まれていないことを確認 | `.claude/skills/aiworkflow-requirements/references/security-*.md`                                                                 |
| アーキテクチャ     | 適用外（PR作成のため）                   | `.claude/skills/aiworkflow-requirements/references/architecture-*.md`                                                             |
| API/IPC契約        | 適用外（PR作成のため）                   | `.claude/skills/aiworkflow-requirements/references/api-*.md`, `.claude/skills/aiworkflow-requirements/references/interfaces-*.md` |
| エラーハンドリング | 適用外（PR作成のため）                   | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                                                             |
| 品質保証           | 変更差分と成果物の整合性を最終確認       | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                                                       |

## 成果物

| 成果物       | パス                                    | 説明               |
| ------------ | --------------------------------------- | ------------------ |
| PR情報       | `outputs/phase-13/pr-info.md`           | PR URL・番号・状態 |
| 変更サマリー | `outputs/phase-13/change-summary.md`    | PR説明用要約       |
| 承認ログ     | `outputs/phase-13/user-approval-log.md` | ユーザー承認証跡   |

## 完了条件

- [ ] 変更差分がすべて説明可能である
- [ ] 想定外差分がないことを確認している
- [ ] ユーザーのローカル動作確認が完了している
- [ ] ユーザーの明示的許可を得ている
- [ ] ユーザー承認なしでコミット/PRを実施していない
- [ ] PRが作成されている
- [ ] CIチェックが全て通過している
- [ ] タスクディレクトリが`completed-tasks`に移動されている
- [ ] `artifacts.json`の全Phaseステータスが更新されている
- [ ] 本Phase内の全タスクを100%実行完了

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各成果物が所定パスに生成済み
- [ ] 実行結果と完了条件の一致を確認済み

## 依存関係

- **前提**: Phase 12
- **後続**: なし

## サブタスク管理

- [ ] 参照資料の確認を完了
- [ ] 実行タスク（SubAgent担当）を完了
- [ ] 成果物作成と配置を完了
- [ ] 完了条件の自己検証を完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスク成果物が生成済み
- [ ] `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/ut-imp-ipc-handler-coverage-granular-001 --phase 13` 実行で問題なし

## Phase実行記録（全Phase共通）

Phase完了後、以下を記録する。

- 実行タスク別の完了可否
- 発見事項（良かった点 / 問題点 / 改善提案）
- 次Phaseへの引き継ぎ事項

## 次のPhase

完了（ユーザー承認後にコミット/PR判断）
