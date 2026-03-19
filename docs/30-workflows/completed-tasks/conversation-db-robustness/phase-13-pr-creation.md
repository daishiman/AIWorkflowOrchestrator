# Phase 13: PR作成

## メタ情報

| 項目     | 内容                                    |
| -------- | --------------------------------------- |
| Phase    | 13                                      |
| 機能名   | conversation-db-robustness              |
| 作成日   | 2026-03-18                              |
| タスクID | TASK-FIX-CONVERSATION-DB-ROBUSTNESS-001 |
| 前Phase  | Phase 12（ドキュメント）                |
| 次Phase  | なし                                    |

## 目的

成果物を最終確認し、PR を準備する。

## 前提条件

- Phase 1-12 が全て完了していること
- ユーザーの明示的な承認を得ていること

## PR 情報

| 項目           | 内容                                                                        |
| -------------- | --------------------------------------------------------------------------- |
| ブランチ名     | `fix/conversation-db-robustness`                                            |
| PRタイトル     | `fix(database): Conversation DB初期化堅牢化 - app.getPath + DI + lifecycle` |
| ベースブランチ | `main`                                                                      |

## 参照資料

### 前Phase成果物

| 成果物                   | パス                                             |
| ------------------------ | ------------------------------------------------ |
| 設計サマリー             | `outputs/phase-2/design-summary.md`              |
| 実装計画                 | `outputs/phase-5/implementation-plan.md`         |
| 回帰テスト計画           | `outputs/phase-6/regression-plan.md`             |
| カバレッジ計画           | `outputs/phase-7/coverage-plan.md`               |
| リファクタリング計画     | `outputs/phase-8/refactor-plan.md`               |
| QAチェックリスト         | `outputs/phase-9/qa-checklist.md`                |
| 最終レビュー結果         | `outputs/phase-10/final-review-result.md`        |
| 手動テスト結果           | `outputs/phase-11/manual-test-result.md`         |
| 実装ガイド               | `outputs/phase-12/implementation-guide.md`       |
| 仕様更新サマリー         | `outputs/phase-12/spec-update-summary.md`        |
| システム仕様更新サマリー | `outputs/phase-12/system-spec-update-summary.md` |
| 更新履歴                 | `outputs/phase-12/documentation-changelog.md`    |
| 未タスク検出             | `outputs/phase-12/unassigned-task-detection.md`  |
| スキルフィードバック     | `outputs/phase-12/skill-feedback-report.md`      |

### システム仕様（aiworkflow-requirements）

| 参照資料              | パス                                                                         | 内容         |
| --------------------- | ---------------------------------------------------------------------------- | ------------ |
| architecture-overview | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md` | 全体責務境界 |

## 実行タスク

- タスク1: Phase 1-12 の全成果物最終確認
- タスク2: ユーザーからの PR 作成承認取得
- タスク3: 全テスト・Lint・TypeCheck の最終実行
- タスク4: PR 作成

## 実行手順

### ステップ1: 成果物最終確認

Phase 1-12 の全成果物が存在し、完了条件を満たしていることを確認する。

### ステップ2: ユーザー承認

ユーザーに PR 作成の可否を確認する。明示的な承認なしに PR を作成しない。

### ステップ3: 最終テスト実行

```bash
cd apps/desktop
pnpm lint
pnpm typecheck
pnpm vitest run
```

### ステップ4: PR作成

`/ai:diff-to-pr fix/conversation-db-robustness` を実行する。

フォールバック（手動対応）:

```bash
git push -u origin fix/conversation-db-robustness
gh pr create --title "fix: Conversation DB 初期化堅牢化" --body "$(cat <<'EOF'
## Summary
- DB初期化を registerAllIpcHandlers() から分離し、app.whenReady() 直後に実行する initializeConversationDatabase() を新設
- DBパスを app.getPath('userData') ベースに変更し、ディレクトリ自動作成を追加
- DBライフサイクル管理（before-quit でのクローズ + WALチェックポイント）を追加

## Test Plan
- [ ] 初回起動時に conversations.db が自動作成されること
- [ ] アプリ終了時にDBが安全にクローズされること
- [ ] 既存 conversation テスト133件が全てPASSすること
- [ ] カバレッジ基準を満たすこと
EOF
)"
```

## 成果物

| 成果物  | パス                          |
| ------- | ----------------------------- |
| PR      | GitHub Pull Request           |
| PR 情報 | `outputs/phase-13/pr-info.md` |

## 統合テスト連携【必須】

既存 conversation テスト133件の回帰確認（PR 作成前の最終テスト実行で全件 PASS を確認）。

## タスク完了処理【必須】

PR マージ後に以下を実行:

```bash
mv docs/30-workflows/conversation-db-robustness/ docs/30-workflows/completed-tasks/
git add docs/30-workflows/
git commit -m "chore: move conversation-db-robustness to completed-tasks"
```

P56 対策: 再評価クローズした未タスクがある場合は `gh issue close <number> --comment "再評価クローズ"` で同時に Close する。

## 多角的チェック観点（AIが判断）

| 観点             | チェック項目                                                                       |
| ---------------- | ---------------------------------------------------------------------------------- |
| PR タイトル規約  | PR タイトルが70文字以内であること（07-git-and-tooling.md 準拠）                    |
| ブランチ名規約   | ブランチ名が `fix/` プレフィックスで始まっていること（07-git-and-tooling.md 準拠） |
| PR 本文          | Summary（1-3箇条書き）+ Test Plan を含んでいること                                 |
| --no-verify 禁止 | コミット・プッシュで `--no-verify` を使用していないこと                            |

## タスク100%実行確認【必須】

- [ ] タスク1: Phase 1-12 の全成果物最終確認
- [ ] タスク2: ユーザーからの PR 作成承認取得
- [ ] タスク3: 全テスト・Lint・TypeCheck の最終実行
- [ ] タスク4: PR 作成
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている

## 完了条件

- [ ] ユーザーから PR 作成の明示的承認を得ている
- [ ] 全テスト PASS
- [ ] Lint・TypeCheck エラー 0 件
- [ ] PR が作成されている
- [ ] タスクディレクトリが completed-tasks に移動されている（PRマージ後）
- [ ] 再評価クローズした未タスクの GitHub Issue が Close 済み（P56対策）
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の実施
4. 成果物の作成・配置
5. 完了条件の検証

## 注意

PR作成は自動実行しない。必ずユーザーの明示的な許可を得てから実行すること。
