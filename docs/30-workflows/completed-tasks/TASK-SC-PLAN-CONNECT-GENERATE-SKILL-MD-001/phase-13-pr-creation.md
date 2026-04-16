# Phase 13: PR作成・CI確認

## メタ情報

| 項目       | 内容                                         |
| ---------- | -------------------------------------------- |
| Phase      | 13                                           |
| タスクID   | TASK-SC-PLAN-CONNECT-GENERATE-SKILL-MD-001   |
| 機能名     | runCreateWorkflow-to-generateSkillMd-connect |
| 前提Phase  | Phase 12                                     |
| 後続Phase  | なし（完了）                                 |
| 作成日     | 2026-04-16                                   |
| ステータス | blocked                                      |

## 目的

PR を作成し、CI が全て PASS することを確認してマージ準備を完了する。

**このPhaseはユーザー承認が必須である。ユーザーの明示的な承認なしに PR を作成・push しない。**

## PR BLOCKED ルール

- ユーザーの明示的な承認なしに PR を作成・push しない
- CI が FAIL している状態でマージしない
- commit / push / PR 作成を自動実行してはならない

## 実行タスク

### タスク1: 変更サマリー作成

`outputs/phase-13/pr-checklist.md` に以下を記録する。

**変更ファイル**:

- `apps/desktop/src/main/services/skill/SkillCreatorService.ts`

**変更内容**:

- `void structurePlan;` を `if (structurePlan) { await generateSkillMd(skillDir, structurePlan) }` に置き換え
- structurePlan が null の場合はエラーログを出力してスキップ

**テスト追加内容**:

- `runCreateWorkflow` 戻り値を `generateSkillMd` へ渡す統合テスト
- structurePlan が null の場合のエラーログ出力テスト

```bash
# 変更ファイル確認
git diff --stat

# 型チェック最終確認
pnpm --filter @repo/desktop typecheck

# テスト最終確認
pnpm --filter @repo/desktop test

# ビルド最終確認
pnpm --filter @repo/desktop build
```

### タスク2: PR 作成（ユーザー承認後）

**ブランチ名**:

```
feat/TASK-SC-PLAN-CONNECT-GENERATE-SKILL-MD-001
```

**PR タイトル**:

```
feat(skill-creator): TASK-SC-PLAN-CONNECT-GENERATE-SKILL-MD-001 runCreateWorkflow戻り値をgenerateSkillMdへ接続
```

**PR 本文テンプレート**:

```markdown
## Summary

- `runCreateWorkflow` の戻り値 `StructurePlanJson` を `generateSkillMd(skillDir, structurePlan)` の引数として接続
- `void structurePlan;` を `if (structurePlan) { await generateSkillMd(...) }` に置き換え
- `structurePlan` が null の場合はエラーログを出力してスキップ
- 接続後の統合テストを追加

## Test plan

- [ ] `pnpm --filter @repo/desktop typecheck` が PASS すること
- [ ] `pnpm --filter @repo/desktop test` が全件 PASS すること
- [ ] `pnpm --filter @repo/desktop build` が PASS すること
- [ ] create モードでスキル作成を実行し、SKILL.md が生成されること
- [ ] structurePlan が null の場合にエラーログが出力されること
- [ ] 既存の collaborative / orchestrate モードが影響を受けないこと

## Related Issue

Closes #2180
```

**PR 作成コマンド（ユーザー承認後のみ実行）**:

```bash
# ブランチ作成
git checkout -b feat/TASK-SC-PLAN-CONNECT-GENERATE-SKILL-MD-001

# コミット（pre-commit フックを通す）
git add apps/desktop/src/main/services/skill/SkillCreatorService.ts
git add apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.test.ts
git commit -m "feat(skill-creator): TASK-SC-PLAN-CONNECT-GENERATE-SKILL-MD-001 runCreateWorkflow戻り値をgenerateSkillMdへ接続

- void structurePlan; を if (structurePlan) { await generateSkillMd(...) } に置き換え
- structurePlan が null の場合はエラーログを出力してスキップ
- 接続後の統合テストを追加

Closes #2180
Task: TASK-SC-PLAN-CONNECT-GENERATE-SKILL-MD-001"

# プッシュ
git push -u origin feat/TASK-SC-PLAN-CONNECT-GENERATE-SKILL-MD-001

# PR 作成
gh pr create \
  --title "feat(skill-creator): TASK-SC-PLAN-CONNECT-GENERATE-SKILL-MD-001 runCreateWorkflow戻り値をgenerateSkillMdへ接続" \
  --body "$(cat <<'EOF'
## Summary

- `runCreateWorkflow` の戻り値 `StructurePlanJson` を `generateSkillMd(skillDir, structurePlan)` の引数として接続
- `void structurePlan;` を `if (structurePlan) { await generateSkillMd(...) }` に置き換え
- `structurePlan` が null の場合はエラーログを出力してスキップ
- 接続後の統合テストを追加

## Test plan

- [ ] `pnpm --filter @repo/desktop typecheck` が PASS すること
- [ ] `pnpm --filter @repo/desktop test` が全件 PASS すること
- [ ] `pnpm --filter @repo/desktop build` が PASS すること
- [ ] create モードでスキル作成を実行し、SKILL.md が生成されること
- [ ] structurePlan が null の場合にエラーログが出力されること
- [ ] 既存の collaborative / orchestrate モードが影響を受けないこと

## Related Issue

Closes #2180
EOF
)"
```

### タスク3: CI 確認

PR 作成後は以下の CI チェックを確認する。

| CI チェック項目          | 確認コマンド                                          | 期待結果 |
| ------------------------ | ----------------------------------------------------- | -------- |
| TypeScript 型チェック    | `gh run view --repo daishiman/AIWorkflowOrchestrator` | PASS     |
| ESLint                   | CI ログを確認                                         | PASS     |
| Vitest（ユニットテスト） | CI ログを確認                                         | PASS     |
| ビルド（desktop）        | CI ログを確認                                         | PASS     |

```bash
# PR 作成後の CI ステータス確認
gh pr checks <PR番号> --repo daishiman/AIWorkflowOrchestrator

# CI 実行履歴の確認
gh run list --repo daishiman/AIWorkflowOrchestrator --limit 5
```

失敗ジョブがある場合は修正して再 push する。

## 禁止事項

- commit（ユーザー承認なしに実行禁止）
- push（ユーザー承認なしに実行禁止）
- PR 作成（ユーザー承認なしに実行禁止）

## 参照資料

| 資料名                       | パス                                                     | 説明            |
| ---------------------------- | -------------------------------------------------------- | --------------- |
| 最終レビュー                 | `outputs/phase-10/final-review-result.md`                | Phase 10 成果物 |
| 手動テスト                   | `outputs/phase-11/manual-test-result.md`                 | Phase 11 成果物 |
| ドキュメント更新履歴         | `outputs/phase-12/documentation-changelog.md`            | Phase 12 成果物 |
| 手動テストチェックリスト     | `outputs/phase-11/manual-test-checklist.md`              | Phase 11 成果物 |
| 発見事項                     | `outputs/phase-11/discovered-issues.md`                  | Phase 11 成果物 |
| 実装ガイド                   | `outputs/phase-12/implementation-guide.md`               | Phase 12 成果物 |
| システム仕様更新サマリー     | `outputs/phase-12/system-spec-update-summary.md`         | Phase 12 成果物 |
| 未タスク検出レポート         | `outputs/phase-12/unassigned-task-detection.md`          | Phase 12 成果物 |
| スキルフィードバックレポート | `outputs/phase-12/skill-feedback-report.md`              | Phase 12 成果物 |
| Phase12準拠チェック          | `outputs/phase-12/phase12-task-spec-compliance-check.md` | Phase 12 成果物 |

## 統合テスト連携【必須】

| 判定項目                      | 基準     | 結果 |
| ----------------------------- | -------- | ---- |
| 変更サマリーが作成されている  | 確認済み | -    |
| ユーザー承認を得ている        | 承認待ち | -    |
| PR が作成されている（承認後） | -        | -    |
| CI 全ジョブ PASS（PR 作成後） | PASS     | -    |

## 成果物

| 成果物            | パス                               | 説明                                    |
| ----------------- | ---------------------------------- | --------------------------------------- |
| PR チェックリスト | `outputs/phase-13/pr-checklist.md` | 変更サマリー・CI 確認項目・blocked 記録 |
| GitHub PR         | -                                  | 条件: ユーザー承認後のみ作成可          |

## 完了条件

- [ ] 変更サマリーが作成されている
- [ ] `outputs/phase-13/pr-checklist.md` 作成済み
- [ ] ユーザー承認を得ている
- [ ] PR が作成されている（承認後）
- [ ] CI 全ジョブ PASS
- [ ] commit / push / PR を実行していない（承認前）
- [ ] blocked 状態を記録した
- [ ] 本 Phase 内の全タスクを 100% 実行完了（blocked gate）

## タスク 100% 実行確認【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] ユーザーの許可なしに commit / push / PR を実行していない
- [ ] 実行記録を残した

## タスク完了

Phase 13 は **blocked**。ユーザー承認後にのみ別途 PR 作成へ進む。
