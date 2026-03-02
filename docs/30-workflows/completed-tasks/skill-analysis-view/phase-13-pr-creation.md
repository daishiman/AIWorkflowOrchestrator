# Phase 13: 完了・PR 作成

## メタ情報

| 項目      | 値                                       |
| --------- | ---------------------------------------- |
| Phase     | 13                                       |
| タスクID  | TASK-10A-B                               |
| 機能名    | SkillAnalysisView（スキル分析ビュー）    |
| 作成日    | 2026-03-02                               |
| 状態      | **未着手**                               |
| 依存Phase | Phase 12（ドキュメント更新）完了後に実行 |

## 目的

全 Phase（1〜12）の成果物を最終確認し、変更をコミットし、ユーザーの明示的な許可を得てから Pull Request を作成し、CI を確認する。

---

## 参照資料

| 資料名                   | パス                                                                 | 説明                  |
| ------------------------ | -------------------------------------------------------------------- | --------------------- |
| Phase 2 設計書           | `phase-2-design.md`                                                  | 設計基準確認          |
| Phase 5 実装             | `phase-5-implementation.md`                                          | 実装差分確認          |
| Phase 6 テスト拡充       | `phase-6-test-expansion.md`                                          | 追加テスト内容確認    |
| Phase 7 カバレッジ       | `phase-7-coverage-check.md`                                          | カバレッジ証跡確認    |
| Phase 8 リファクタリング | `phase-8-refactoring.md`                                             | リファクタ差分確認    |
| Phase 9 品質保証         | `phase-9-quality-assurance.md`                                       | 品質ゲート確認        |
| 最終レビュー結果         | `outputs/phase-10/final-review-result.md`                            | Phase 10 成果物       |
| 手動テスト結果           | `outputs/phase-11/manual-test-result.md`                             | Phase 11 成果物       |
| ドキュメント更新履歴     | `outputs/phase-12/documentation-changelog.md`                        | Phase 12 成果物       |
| 未タスク検出レポート     | `outputs/phase-12/unassigned-task-detection.md`                      | Phase 12 成果物       |
| aiworkflow ワークフロー  | `.claude/skills/aiworkflow-requirements/references/task-workflow.md` | 完了/未タスク運用確認 |

---

## 実行タスク

- 成果物監査: Phase 1〜12 の成果物実体と参照整合を確認する
- 品質再確認: テスト/Lint/Typecheck の最終結果を確認する
- 変更統制: コミット対象と機密情報混入有無を確認する
- ユーザー確認: ローカル動作確認と PR 作成許可を取得する
- PR準備: Summary/Test Plan を整備して PR 生成準備を行う
- 完了処理: CI 完了後に移管手順を実行する

### Task 1: 成果物最終確認

#### 1-1: Phase 成果物存在確認

| Phase | 成果物                     | パス                                            | 存在確認   |
| ----- | -------------------------- | ----------------------------------------------- | ---------- |
| 1     | 要件定義書                 | `outputs/phase-1/requirements-definition.md`    | [ ] 未確認 |
| 1     | 受け入れ基準               | `outputs/phase-1/acceptance-criteria.md`        | [ ] 未確認 |
| 2     | アーキテクチャ設計         | `outputs/phase-2/architecture-design.md`        | [ ] 未確認 |
| 2     | コンポーネント設計         | `outputs/phase-2/component-design.md`           | [ ] 未確認 |
| 2     | API仕様                    | `outputs/phase-2/api-specification.md`          | [ ] 未確認 |
| 3     | 設計レビュー結果           | `outputs/phase-3/design-review-result.md`       | [ ] 未確認 |
| 4     | テスト仕様書               | `outputs/phase-4/test-specification.md`         | [ ] 未確認 |
| 5     | 実装サマリー               | `outputs/phase-5/implementation-summary.md`     | [ ] 未確認 |
| 6     | テスト拡充カバレッジ       | `outputs/phase-6/coverage-report.md`            | [ ] 未確認 |
| 6     | 統合テスト記録             | `outputs/phase-6/integration-test.md`           | [ ] 未確認 |
| 7     | カバレッジレポート         | `outputs/phase-7/coverage-report.md`            | [ ] 未確認 |
| 8     | リファクタリングログ       | `outputs/phase-8/refactoring-log.md`            | [ ] 未確認 |
| 9     | 品質保証レポート           | `outputs/phase-9/quality-report.md`             | [ ] 未確認 |
| 10    | 最終レビュー結果           | `outputs/phase-10/final-review-result.md`       | [ ] 未確認 |
| 11    | 手動テスト結果             | `outputs/phase-11/manual-test-result.md`        | [ ] 未確認 |
| 11    | 発見課題一覧               | `outputs/phase-11/discovered-issues.md`         | [ ] 未確認 |
| 12    | 実装ガイド                 | `outputs/phase-12/implementation-guide.md`      | [ ] 未確認 |
| 12    | コンポーネントドキュメント | `outputs/phase-12/component-documentation.md`   | [ ] 未確認 |
| 12    | 仕様書更新サマリー         | `outputs/phase-12/spec-update-summary.md`       | [ ] 未確認 |
| 12    | ドキュメント更新履歴       | `outputs/phase-12/documentation-changelog.md`   | [ ] 未確認 |
| 12    | 未タスク検出レポート       | `outputs/phase-12/unassigned-task-detection.md` | [ ] 未確認 |
| 12    | スキルフィードバック       | `outputs/phase-12/skill-feedback-report.md`     | [ ] 未確認 |
| 13    | PR情報                     | `outputs/phase-13/pr-info.md`                   | [ ] 未確認 |

### Task 2: 品質最終確認

```bash
# テスト実行
cd apps/desktop && pnpm vitest run src/renderer/components/skill/

# Lint
pnpm lint

# TypeCheck
pnpm typecheck
```

- [ ] テスト全 PASS
- [ ] Lint エラー 0 件
- [ ] TypeCheck エラー 0 件

### Task 3: コミット前チェックリスト

- [ ] `git status` で変更ファイル一覧を確認
- [ ] `.env` / 認証情報 / APIキーがコミット対象に含まれていない
- [ ] `--no-verify` を使用していない
- [ ] コミットメッセージが規約に準拠している

### Task 4: PR 情報

#### ブランチ名

```
feature/task-10a-b-skill-analysis-view
```

#### PR タイトル（70文字以内）

```
feat(skill): TASK-10A-B SkillAnalysisView実装
```

#### PR 本文

```markdown
## Summary

- スキル分析結果表示UIの実装（SkillAnalysisView）
- 分析スコア表示、改善提案リスト、リスクパネルのコンポーネント
- 選択改善適用と全自動改善機能

## Test Plan

- [ ] ユニットテスト全PASS
- [ ] カバレッジ基準達成（Line 80%+, Branch 60%+, Function 80%+）
- [ ] ESLint/Prettier/TypeCheck通過
- [ ] 手動テスト全シナリオ確認（TC-01〜TC-08）

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

### Task 5: PR 作成（ユーザー許可必須）

**PR 作成は自動実行しない。必ずユーザーの明示的な許可を得てから実行する。**

```bash
# ユーザー許可後に実行
gh pr create \
  --title "feat(skill): TASK-10A-B SkillAnalysisView実装" \
  --body "$(cat <<'EOF'
## Summary
- スキル分析結果表示UIの実装（SkillAnalysisView）
- 分析スコア表示、改善提案リスト、リスクパネルのコンポーネント
- 選択改善適用と全自動改善機能

## Test Plan
- [ ] ユニットテスト全PASS
- [ ] カバレッジ基準達成（Line 80%+, Branch 60%+, Function 80%+）
- [ ] ESLint/Prettier/TypeCheck通過
- [ ] 手動テスト全シナリオ確認（TC-01〜TC-08）

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

### Task 6: CI 確認

- [ ] PR 作成後に CI が自動実行されることを確認
- [ ] CI の全ジョブが PASS
- [ ] レビュー依頼を設定（該当する場合）

---

## 成果物

- `outputs/phase-13/pr-info.md`

## 完了条件

- [ ] Phase 1〜12 の全成果物が存在確認済み
- [ ] テスト/Lint/TypeCheck が最終 PASS
- [ ] コミットが作成済み
- [ ] PR が作成済み（ユーザー許可後）
- [ ] CI が PASS

## 完了後の移管手順

1. `task-workflow.md` の TASK-10A-B ステータスを `pr_created` に更新
2. PR URL を `outputs/phase-13/pr-info.md` に記録
3. ワークフローディレクトリを `completed-tasks/` に移動（マージ後）
