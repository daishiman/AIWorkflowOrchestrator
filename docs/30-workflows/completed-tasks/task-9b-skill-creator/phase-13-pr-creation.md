# Phase 13: PR作成

## メタ情報

| 項目      | 値                           |
| --------- | ---------------------------- |
| Phase     | 13                           |
| タスク    | TASK-9B                      |
| 機能名    | task-9b-skill-creator        |
| 作成日    | 2026-02-26                   |
| 前提Phase | Phase 12（ドキュメント更新） |
| 次Phase   | なし（ワークフロー完了）     |

## 目的

変更をコミットし、ユーザーの明示的な許可を得てからPull Requestを作成し、CIを確認する。

## 実行タスク

- Task 13-1: ユーザーにローカル動作確認を依頼
- Task 13-2: 変更サマリー提示と許可確認
- Task 13-3: PR作成
- Task 13-4: CI確認
- Task 13-5: タスクディレクトリ移動

## 参照資料

| 資料名                       | パス                                                                         | 説明                |
| ---------------------------- | ---------------------------------------------------------------------------- | ------------------- |
| Phase 2設計成果物            | `outputs/phase-2/architecture-design.md`                                     | 設計意図の最終確認  |
| Phase 5実装成果物            | `outputs/phase-5/design-changes.md`                                          | 実装変更点の要約    |
| Phase 6テスト拡充結果        | `outputs/phase-6/coverage-report.md`                                         | 追加テスト実績      |
| Phase 7カバレッジ結果        | `outputs/phase-7/coverage-report.md`                                         | カバレッジ基準達成  |
| Phase 8リファクタ結果        | `outputs/phase-8/refactoring-report.md`                                      | リファクタ影響範囲  |
| Phase 9品質結果              | `outputs/phase-9/quality-report.md`                                          | 品質ゲート判定      |
| 最終レビュー結果             | `outputs/phase-10/final-review-result.md`                                    | Phase 10成果物      |
| 手動テスト結果               | `outputs/phase-11/manual-test-result.md`                                     | Phase 11成果物      |
| ドキュメント更新履歴         | `outputs/phase-12/documentation-changelog.md`                                | Phase 12成果物      |
| 実装ガイド                   | `outputs/phase-12/implementation-guide.md`                                   | Phase 12成果物      |
| 未タスク検出レポート         | `outputs/phase-12/unassigned-task-detection.md`                              | Phase 12成果物      |
| スキルフィードバックレポート | `outputs/phase-12/skill-feedback-report.md`                                  | Phase 12成果物      |
| Agent IPC仕様                | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`         | IPC契約最終確認     |
| Electron APIセキュリティ     | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md` | Preload公開制約確認 |

## 実行手順

### Task 13-1: ユーザーにローカル動作確認を依頼【必須】

PR作成前に、ユーザーにローカル環境での動作確認を依頼する。

**確認依頼項目**:

| #   | 確認コマンド                            | 期待結果     |
| --- | --------------------------------------- | ------------ |
| 1   | `pnpm --filter @repo/desktop test`      | 全テストPASS |
| 2   | `pnpm --filter @repo/desktop typecheck` | エラーなし   |
| 3   | `pnpm --filter @repo/desktop lint`      | エラーなし   |
| 4   | `pnpm --filter @repo/shared build`      | ビルド成功   |

### Task 13-2: 変更サマリーの提示と許可確認【必須】

変更内容のサマリーを提示し、PRを作成してよいかユーザーに確認する。

**変更サマリー**:

| カテゴリ              | 変更内容                                                                                                                        |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| 新規サービス          | SkillCreatorService（Facade）、HearingFacilitator、TaskGenerator、CodeGenerator、APIIntegrator、Validator                       |
| 12コマンド            | chat, api, improve, execute, use, chain, fork, share, schedule, debug, docs, stats                                              |
| IPCハンドラ           | skillCreatorHandlers.ts にskill-creator関連IPCチャンネル追加                                                                    |
| Preload API           | skill-creator-api.ts にskill-creator関連API追加                                                                                 |
| 型定義                | SkillCreatorMode, CreateSkillOptions, ExecutionReport, SkillCreatorConfig等                                                     |
| テストファイル        | SkillCreatorService.test.ts、各サブコンポーネントのテスト                                                                       |
| ドキュメント          | implementation-guide.md, documentation-changelog.md, unassigned-task-detection.md, skill-feedback-report.md                     |
| skill-creatorリソース | SKILL.md, agents/hearing-facilitator.md, agents/task-generator.md, agents/code-generator.md, agents/validator.md, references/\* |

**テスト結果サマリー**:

| 指標              | 結果                |
| ----------------- | ------------------- |
| ユニットテスト    | {{TEST_COUNT}} PASS |
| Line Coverage     | {{LINE_COV}}%       |
| Branch Coverage   | {{BRANCH_COV}}%     |
| Function Coverage | {{FUNC_COV}}%       |
| Lint              | {{LINT_STATUS}}     |
| TypeCheck         | {{TYPE_STATUS}}     |
| 手動テスト        | 全42ケースPASS      |

**重要**: ユーザーから明示的な許可を得るまでPR作成を実行しないこと。

### Task 13-3: `/ai:diff-to-pr` を実行【ユーザー許可後】

> **PR作成は自動実行しない。必ずユーザーの明示的な許可を得てから実行すること。**

ユーザーの許可を得た後、PR作成を実行する。

```
/ai:diff-to-pr
```

**PR情報**:

| 項目           | 値                                                                            |
| -------------- | ----------------------------------------------------------------------------- |
| ブランチ名     | `feature/task-9b-skill-creator`                                               |
| PRタイトル     | `feat(skill-creator): メタスキルskill-creator全12コマンド実装` （70文字以内） |
| ベースブランチ | `main`                                                                        |

**PR本文テンプレート**:

```markdown
## Summary

- メタスキル「skill-creator」を実装（12コマンド: chat/api/improve/execute/use/chain/fork/share/schedule/debug/docs/stats）
- SkillCreatorServiceをFacadeとし、5つのサブコンポーネント（HearingFacilitator/TaskGenerator/CodeGenerator/APIIntegrator/Validator）で構成
- Claude Agent SDK連携、IPC通信、セキュリティ対策（3段バリデーション・sender検証）を実装

## Test plan

- [ ] ユニットテスト全PASS（Line 80%+, Branch 60%+, Function 80%+）
- [ ] 統合テスト全PASS
- [ ] 手動テスト全42ケースPASS
- [ ] TypeCheck / Lint エラーなし
- [ ] リグレッションテスト（既存SkillService/SkillExecutor機能への影響なし）

## Related Issues

- TASK-9B: skill-creator スキル実装
- 依存: TASK-7D, TASK-8C
- ブロック: TASK-10A

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

### フォールバック（/ai:diff-to-prが使えない場合）

```bash
# 変更をステージング
git add apps/desktop/src/main/services/skill/
git add apps/desktop/src/main/ipc/skillCreatorHandlers.ts
git add apps/desktop/src/preload/skill-creator-api.ts
git add apps/desktop/src/preload/channels.ts
git add packages/shared/src/types/skillCreator.ts
git add docs/30-workflows/completed-tasks/task-9b-skill-creator/

# コミット
git commit -m "$(cat <<'EOF'
feat(skill-creator): メタスキルskill-creator全12コマンド実装

- SkillCreatorService（Facade）と5つのサブコンポーネント実装
- 12コマンド: chat/api/improve/execute/use/chain/fork/share/schedule/debug/docs/stats
- Claude Agent SDK連携、IPC通信、3段バリデーション・sender検証
- テスト・ドキュメント・手動テスト完了

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"

# プッシュ
git push -u origin feature/task-9b-skill-creator

# PR作成
gh pr create --title "feat(skill-creator): メタスキルskill-creator全12コマンド実装" --body "$(cat <<'EOF'
## Summary
- メタスキル「skill-creator」を実装（12コマンド: chat/api/improve/execute/use/chain/fork/share/schedule/debug/docs/stats）
- SkillCreatorServiceをFacadeとし、5つのサブコンポーネントで構成
- Claude Agent SDK連携、IPC通信、セキュリティ対策を実装

## Test plan
- [ ] ユニットテスト全PASS（Line 80%+, Branch 60%+, Function 80%+）
- [ ] 統合テスト全PASS
- [ ] 手動テスト全42ケースPASS
- [ ] TypeCheck / Lint エラーなし

## Related Issues
- TASK-9B: skill-creator スキル実装

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

### Task 13-4: 実行結果の確認【必須】

| #   | 確認項目           | 確認方法                        | 期待結果           |
| --- | ------------------ | ------------------------------- | ------------------ |
| 1   | PRが作成されている | `gh pr list --state open`       | PR一覧に表示される |
| 2   | CIが通過している   | `gh pr checks` または GitHub UI | 全チェックPASS     |
| 3   | PR本文が正しい     | GitHub UIで確認                 | Summary+Test Plan  |

### Task 13-5: タスクディレクトリ移動【必須】

PRが作成され、CIが通過した後、タスクディレクトリを完了タスクフォルダに移動する。

```bash
# タスクディレクトリをcompleted-tasksに移動
mv docs/30-workflows/completed-tasks/task-9b-skill-creator/ docs/30-workflows/completed-tasks/

# 移動を確認
ls docs/30-workflows/completed-tasks/ | grep task-9b-skill-creator

# 変更をコミット
git add docs/30-workflows/
git commit -m "$(cat <<'EOF'
docs(workflows): task-9b-skill-creatorをcompleted-tasksに移動

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"
```

## 統合テスト連携【必須】

| テスト項目         | 確認内容                               | 期待結果             | 実行結果   |
| ------------------ | -------------------------------------- | -------------------- | ---------- |
| CI全テストPASS     | GitHub ActionsのCI結果                 | 全チェック緑         | {{RESULT}} |
| PR本文の完全性     | Summary/Test Plan/Related Issuesの記載 | 全セクション記載あり | {{RESULT}} |
| ブランチ名の適切性 | `feature/` プレフィックス付き          | 規約準拠             | {{RESULT}} |

## 多角的チェック観点（AIが判断）

| 観点         | 適用判断                           | 仕様参照先                                                                  |
| ------------ | ---------------------------------- | --------------------------------------------------------------------------- |
| PR品質       | PR本文のSummary/Test Plan完全性    | `07-git-and-tooling.md#PR作成ルール`                                        |
| CI/CD        | 自動検証の成功確認                 | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` |
| ブランチ戦略 | `feature/` プレフィックス使用      | `07-git-and-tooling.md#PR作成ルール`                                        |
| コミット履歴 | 意味のある単位でコミット           | -                                                                           |
| セキュリティ | 機密情報がコミットに含まれていない | `.claude/skills/aiworkflow-requirements/references/security-principles.md`  |

## Electronデスクトップアプリ観点

| 観点              | 確認内容                                                                                     | 仕様参照先                              |
| ----------------- | -------------------------------------------------------------------------------------------- | --------------------------------------- |
| ビルド成功        | `pnpm --filter @repo/shared build` および `pnpm --filter @repo/desktop build` が成功すること | `.claude/rules/07-git-and-tooling.md`   |
| テスト全PASS      | `pnpm --filter @repo/desktop test` が全テストPASSすること                                    | `.claude/rules/02-code-quality.md`      |
| 型安全            | `pnpm --filter @repo/desktop typecheck` でエラーがないこと                                   | `.claude/rules/02-code-quality.md`      |
| 機密情報未混入    | APIキー・トークン・パスワードがコミットに含まれていないこと                                  | `.claude/rules/04-electron-security.md` |
| --no-verify未使用 | git commit/pushで`--no-verify`を使用していないこと                                           | `CLAUDE.md`                             |

## 成果物

| 成果物 | パス                          | 説明                       |
| ------ | ----------------------------- | -------------------------- |
| PR情報 | `outputs/phase-13/pr-info.md` | PR URL・ブランチ名・CI結果 |

## 完了条件

- [ ] ユーザーにローカル動作確認を依頼している
- [ ] 変更サマリー（12コマンド・SkillCreatorService・サブコンポーネント・IPCハンドラ・テスト結果）を提示している
- [ ] ユーザーから明示的なPR作成許可を得ている
- [ ] 全変更がコミットされている
- [ ] PRが作成されている
- [ ] CIが通過している
- [ ] タスクディレクトリが `docs/30-workflows/completed-tasks/` に移動されている
- [ ] `outputs/phase-13/pr-info.md` が作成されている
- [ ] **本Phase内の全作業を100%完了（PR作成・CI確認・移動）**

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. Task 13-1: ユーザーにローカル動作確認を依頼
2. Task 13-2: 変更サマリー提示と許可確認
3. Task 13-3: PR作成（ユーザー許可後）
4. Task 13-4: CI確認
5. Task 13-5: タスクディレクトリ移動
6. 完了条件の検証

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] PRが作成されている
- [ ] CIが通過している
- [ ] タスクディレクトリが `docs/30-workflows/completed-tasks/` に移動されている
- [ ] `outputs/phase-13/pr-info.md` が作成されている

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/task-9b-skill-creator --phase 13
```

## 次のPhase

なし（ワークフロー完了）

---

## 次のタスク

TASK-10A: ライフサイクル管理
