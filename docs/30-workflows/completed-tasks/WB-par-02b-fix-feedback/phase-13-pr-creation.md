# Phase 13: PR作成

## メタ情報

| 項目       | 内容                                                           |
| ---------- | -------------------------------------------------------------- |
| Phase      | 13                                                             |
| タスクID   | TASK-SW-FIX-FEEDBACK-001                                       |
| 機能名     | スキル一覧リアルタイム反映・skillPath nullガード・成功表示修正 |
| 前提Phase  | Phase 12（ドキュメント更新完了）                               |
| 後続Phase  | -（最終Phase）                                                 |
| 作成日     | 2026-04-12                                                     |
| ステータス | blocked                                                        |

## Blocked

- 理由: ユーザーの明示的承認が未取得のため、PR 作成コマンドを実行しない
- 再開条件: Phase 11/12 の成果物が揃い、ユーザーが PR 作成を明示指示した後
- 実行禁止: `git push` / `gh pr create`

## 重要: PR作成はユーザーの明示的承認後のみ実施

**このPhaseは自動実行しない。**
ユーザーから「PRを作成してください」という明示的な指示を受けてから実施する。

承認なしに以下のコマンドを実行してはならない：

```bash
# 禁止（承認前）
git push
gh pr create
```

## PR作成前チェックリスト

### Phase 11/12完了確認

- [ ] `outputs/phase-11/manual-test-result.md`が存在する
- [ ] `outputs/phase-11/manual-test-checklist.md`が存在する
- [ ] `outputs/phase-11/screenshots/`にスクリーンショット（4枚）が存在する
- [ ] `outputs/phase-12/implementation-guide.md`が存在する
- [ ] `outputs/phase-12/system-spec-update-summary.md`が存在する
- [ ] `outputs/phase-12/documentation-changelog.md`が存在する
- [ ] `outputs/phase-12/unassigned-task-detection.md`が存在する
- [ ] `outputs/phase-12/skill-feedback-report.md`が存在する
- [ ] `outputs/phase-12/phase12-task-spec-compliance-check.md`が存在する
- [ ] LOGS.md 2ファイルが更新されている
- [ ] `artifacts.json` / `outputs/artifacts.json`が`phase13_blocked`で同期されている

### コード品質確認

```bash
# lint確認
pnpm --filter @repo/desktop lint

# 型チェック
pnpm --filter @repo/desktop typecheck

# テスト全件実行
pnpm --filter @repo/desktop vitest run --reporter=verbose
```

### ブランチ確認

```bash
# 現在ブランチの確認
git branch --show-current

# 変更差分の確認（2ファイルのみであること）
git diff --name-only main

# コミット履歴の確認
git log --oneline -5
```

## PR本文テンプレート

```markdown
## 概要

スキルウィザードのフィードバックループ欠如問題（問題6・8・14・20）を修正する。

- LLMモード（`handleExecutePlan`）完了後に`fetchSkills()`を追加してスキル一覧をリアルタイム更新
- `CompleteStep`に`skillPath === null`のnullガードを追加してサイレント失敗を解消
- `skillPath !== null`の場合のみ成功ヘッダーを表示するよう変更

## 変更内容

- [ ] `SkillCreateWizard.tsx`: `handleExecutePlan`成功パスに`await fetchSkills()`追加（問題6・8）
- [ ] `CompleteStep.tsx`: `skillPath`nullガード追加・成功ヘッダー条件表示（問題14・20）

## テスト結果

- TC-FEEDBACK-001〜013: 全件PASS
- templateモード回帰テスト: PASS
- VISUAL手動テスト（シナリオ1〜4）: PASS

## 関連

- Wave B並列タスク: TASK-SW-FIX-MODE-MGMT-001
- 依存タスク: TASK-SW-FIX-DATAFLOW-001（Wave A）
```

## PR作成コマンド（ユーザー承認後のみ実行）

```bash
# ブランチ作成・push（承認後）
git checkout -b fix/skill-wizard-feedback-001-fetchskills-null-guard
git add \
  apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx \
  apps/desktop/src/renderer/components/skill/wizard/CompleteStep.tsx
git commit -m "fix(skill-wizard): LLMモードfetchSkills追加・CompleteStep skillPath nullガード (#ISSUE番号)"
git push -u origin fix/skill-wizard-feedback-001-fetchskills-null-guard

# PR作成（承認後）
gh pr create \
  --title "fix(skill-wizard): スキル一覧リアルタイム反映・skillPath nullガード・成功表示修正 [TASK-SW-FIX-FEEDBACK-001]" \
  --body "$(cat <<'EOF'
## 概要

スキルウィザードのフィードバックループ欠如問題（問題6・8・14・20）を修正する。

- LLMモード（`handleExecutePlan`）完了後に`fetchSkills()`を追加してスキル一覧をリアルタイム更新
- `CompleteStep`に`skillPath === null`のnullガードを追加してサイレント失敗を解消
- `skillPath !== null`の場合のみ成功ヘッダーを表示するよう変更

## 変更内容

- `SkillCreateWizard.tsx`: `handleExecutePlan`成功パスに`await fetchSkills()`追加（問題6・8）
- `CompleteStep.tsx`: `skillPath`nullガード追加・成功ヘッダー条件表示（問題14・20）

## テスト結果

- TC-FEEDBACK-001〜013: 全件PASS
- templateモード回帰テスト: PASS
- VISUAL手動テスト（シナリオ1〜4）: PASS

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

## CI確認（PR作成後）

```bash
# CI状態確認
gh pr checks

# CIが失敗した場合の調査
gh run view --log-failed
```

## タスク完了処理

PR作成・CI確認完了後：

```bash
# artifacts.json を phase13_completed へ更新
node .claude/skills/task-specification-creator/scripts/complete-phase.js \
  docs/30-workflows/WB-par-02b-fix-feedback 13
```

## 参照資料

| 資料名                  | パス                                                                             | 用途            |
| ----------------------- | -------------------------------------------------------------------------------- | --------------- |
| Phase 11 手動テスト結果 | `outputs/phase-11/manual-test-result.md`                                         | Phase 11 主証跡 |
| Phase 11 チェックリスト | `outputs/phase-11/manual-test-checklist.md`                                      | VISUAL検証      |
| Phase 12 成果物一覧     | `outputs/phase-12/`                                                              | PR前確認        |
| Phase 12 準拠確認       | `outputs/phase-12/phase12-task-spec-compliance-check.md`                         | root evidence   |
| phase-template-phase13  | `.claude/skills/task-specification-creator/references/phase-template-phase13.md` | PR手順詳細      |
| review-gate-criteria    | `.claude/skills/task-specification-creator/references/review-gate-criteria.md`   | 承認ルール確認  |

## 成果物

| 成果物               | パス                                     | 説明                             |
| -------------------- | ---------------------------------------- | -------------------------------- |
| ローカルチェック結果 | `outputs/phase-13/local-check-result.md` | PR 前の自己検証結果              |
| 変更サマリー         | `outputs/phase-13/change-summary.md`     | 変更点の要約                     |
| PR情報               | `outputs/phase-13/pr-info.md`            | PR タイトル / URL / メタ情報     |
| PR作成結果           | `outputs/phase-13/pr-creation-result.md` | PR 作成実行ログ                  |
| PRチェックリスト     | `outputs/phase-13/pr-checklist.md`       | PR作成前確認・PR URL・CI結果記録 |

## 完了条件

- [ ] ユーザーの明示的承認を得ていること
- [ ] Phase 11/12完了確認チェックリストが全件PASS
- [ ] コード品質確認（lint・typecheck・test）が全件PASS
- [ ] PR作成・CI確認が完了していること
- [ ] PRチェックリストが作成されていること
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] ユーザー承認を得た上でPR作成完了
- [ ] 実行記録を残した
