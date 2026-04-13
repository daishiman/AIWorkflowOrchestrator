# Phase 13: PR 作成

## メタ情報

| 項目       | 内容                                                        |
| ---------- | ----------------------------------------------------------- |
| Phase      | 13                                                          |
| タスクID   | TASK-SW-FIX-DATAFLOW-001                                    |
| 機能名     | Step 1回答→スキル生成連携（Q1〜Q6コンテキストブリッジ実装） |
| タスク種別 | -                                                           |
| 前提Phase  | Phase 12（ドキュメント更新完了）                            |
| 後続Phase  | -（最終 Phase）                                             |
| 作成日     | 2026-04-12                                                  |
| ステータス | blocked                                                     |

## 重要: PR 作成はユーザーの明示的承認後のみ実施

**このPhaseは自動実行しない。**
ユーザーから「PR を作成してください」という明示的な指示を受けてから実施する。

承認なしに以下のコマンドを実行してはならない：

```bash
# 禁止（承認前）
git push
gh pr create
```

## PR 作成前チェックリスト

### Phase 11/12 完了確認

- [ ] `outputs/phase-11/manual-test-result.md` が存在する
- [ ] `outputs/phase-11/manual-test-checklist.md` が存在する
- [ ] `outputs/phase-11/screenshots/TC-11-UI-01.png` が存在する（VISUAL確認）
- [ ] `outputs/phase-12/implementation-guide.md` が存在する
- [ ] `outputs/phase-12/system-spec-update-summary.md` が存在する
- [ ] `outputs/phase-12/documentation-changelog.md` が存在する
- [ ] `outputs/phase-12/unassigned-task-detection.md` が存在する
- [ ] `outputs/phase-12/skill-feedback-report.md` が存在する
- [ ] `outputs/phase-12/phase12-task-spec-compliance-check.md` が存在する
- [ ] LOGS.md 2 ファイルが更新されている
- [ ] `artifacts.json` / `outputs/artifacts.json` が同期されている

### コード品質確認

```bash
# lint 確認
pnpm lint

# 型チェック
pnpm typecheck

# テスト全件実行（TC-01〜TC-18 全件 PASS 確認）
pnpm vitest run --reporter=verbose

# shared パッケージビルド確認
pnpm --filter @repo/shared build
```

### ブランチ確認

```bash
# 現在ブランチの確認
git branch --show-current

# 変更差分の確認
git diff --name-only main

# コミット履歴の確認
git log --oneline -5
```

## PR 本文テンプレート

```markdown
## 概要

SkillCreateWizard で Step 1（Q1〜Q6）の回答がスキル生成に渡されないバグを修正する。

- `SkillCreateWizard.tsx:553` の `handleGenerate` が Q1〜Q6 回答を無視していた問題を解消
- `buildSkillContext()` 変換関数を追加し、ウィザード入力を `SkillCreationContext` に変換
- `createSkill` Thunk シグネチャを拡張（`context?: SkillCreationContext`、後方互換維持）
- IPC ハンドラで `context` 全フィールドをプロンプトに組み込む

## 変更内容

- [ ] `packages/shared/src/types/skillCreator.ts`: `SkillCreationContext` 型追加
- [ ] `SkillCreateWizard.tsx`: `buildSkillContext()` 追加・`handleGenerate` 修正
- [ ] `agentSlice.ts`: `createSkill` シグネチャに `context?: SkillCreationContext` 追加
- [ ] `skillHandler.ts`: `buildSkillGenerationPrompt()` 追加・IPC ハンドラ修正

## テスト結果

- TC-01〜TC-18: 全件 PASS
- 後方互換テスト（TC-10・TC-17）: PASS
- E2E 相当テスト（TC-18）: PASS
- 手動テスト（TC-11-VISUAL-01〜03）: PASS

## 関連情報

- タスク: TASK-SW-FIX-DATAFLOW-001
- 対象バグ: SkillCreateWizard.tsx:553 handleGenerate が answers を渡さない
```

## PR 作成コマンド（ユーザー承認後のみ実行）

```bash
# ブランチ作成・push（承認後）
git checkout -b fix/task-sw-fix-dataflow-001-skill-context-bridge
git add \
  packages/shared/src/types/skillCreator.ts \
  apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx \
  apps/desktop/src/renderer/store/slices/agentSlice.ts \
  apps/desktop/src/main/ipc/handlers/skillHandler.ts
git commit -m "fix(skill-wizard): Step1 Q1〜Q6回答をスキル生成に連携するコンテキストブリッジを実装 (TASK-SW-FIX-DATAFLOW-001)"
git push -u origin fix/task-sw-fix-dataflow-001-skill-context-bridge

# PR 作成（承認後）
gh pr create \
  --title "fix(skill-wizard): Step 1 Q1〜Q6回答→スキル生成連携（コンテキストブリッジ実装）" \
  --body "$(cat <<'EOF'
## 概要

SkillCreateWizard で Step 1（Q1〜Q6）の回答がスキル生成に渡されないバグを修正する。

- TASK-SW-FIX-DATAFLOW-001

## 変更内容
- SkillCreationContext 型追加（packages/shared）
- buildSkillContext() 変換関数追加・handleGenerate 修正
- createSkill Thunk シグネチャ拡張（後方互換維持）
- buildSkillGenerationPrompt() 追加・IPC ハンドラ修正

## テスト結果
- TC-01〜TC-18: 全件 PASS
- 後方互換テスト: PASS

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

## CI 確認（PR 作成後）

```bash
# CI 状態確認
gh pr checks

# CI が失敗した場合の調査
gh run view --log-failed
```

## タスク完了処理

PR 作成・CI 確認完了後：

```bash
# artifacts.json を completed へ更新
node .claude/skills/task-specification-creator/scripts/complete-phase.js \
  docs/30-workflows/skill-wizard-bugfix-wave/WA-seq-01-fix-dataflow 13
```

## 参照資料

| 資料名                  | パス                                                                             | 用途            |
| ----------------------- | -------------------------------------------------------------------------------- | --------------- |
| Phase 11 手動テスト結果 | `outputs/phase-11/manual-test-result.md`                                         | Phase 11 主証跡 |
| Phase 12 成果物一覧     | `outputs/phase-12/`                                                              | PR 前確認       |
| Phase 12 準拠確認       | `outputs/phase-12/phase12-task-spec-compliance-check.md`                         | root evidence   |
| phase-template-phase13  | `.claude/skills/task-specification-creator/references/phase-template-phase13.md` | PR 手順詳細     |
| review-gate-criteria    | `.claude/skills/task-specification-creator/references/review-gate-criteria.md`   | 承認ルール確認  |

## 成果物

| 成果物            | パス                               | 説明                               |
| ----------------- | ---------------------------------- | ---------------------------------- |
| PR チェックリスト | `outputs/phase-13/pr-checklist.md` | PR 作成前確認・PR URL・CI 結果記録 |

## 完了条件

- [ ] ユーザーの明示的承認を得ていること
- [ ] Phase 11/12 完了確認チェックリストが全件 PASS
- [ ] コード品質確認（lint・typecheck・test）が全件 PASS
- [ ] PR 作成・CI 確認が完了していること
- [ ] PR チェックリストが作成されていること
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] ユーザー承認を得た上で PR 作成完了
- [ ] 実行記録を残した
