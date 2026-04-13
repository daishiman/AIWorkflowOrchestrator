# Phase 13: PR作成

## メタ情報

| 項目       | 内容                                                             |
| ---------- | ---------------------------------------------------------------- |
| Phase      | 13                                                               |
| タスクID   | UT-SKILL-WIZARD-FB-03-FALLBACK-SPEC-CLARIFICATION-001            |
| 機能名     | SmartDefault AC-4 フォールバック仕様のフィールド独立推論性明示化 |
| 前提Phase  | Phase 12（ドキュメント更新完了）                                 |
| 後続Phase  | -（最終Phase）                                                   |
| 作成日     | 2026-04-11                                                       |
| ステータス | pending                                                          |

## ⚠️ 重要: PR作成はユーザーの明示的承認後のみ実施

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

- [ ] `outputs/phase-11/manual-test-result.md` が存在する
- [ ] `outputs/phase-11/manual-test-checklist.md` が存在する
- [ ] `outputs/phase-12/implementation-guide.md` が存在する
- [ ] `outputs/phase-12/system-spec-update-summary.md` が存在する
- [ ] `outputs/phase-12/documentation-changelog.md` が存在する
- [ ] `outputs/phase-12/unassigned-task-detection.md` が存在する
- [ ] `outputs/phase-12/skill-feedback-report.md` が存在する
- [ ] `outputs/phase-12/phase12-task-spec-compliance-check.md` が存在する
- [ ] LOGS.md 2ファイルが更新されている
- [ ] `artifacts.json` / `outputs/artifacts.json` が `phase13_blocked` で同期されている

### コード品質確認

```bash
# lint確認
pnpm lint

# 型チェック
pnpm typecheck

# テスト全件実行
pnpm vitest run --reporter=verbose
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

## PR本文テンプレート

```markdown
## 概要

SmartDefault AC-4 フォールバック仕様のフィールド独立推論性を明示化する。

- `UT-SKILL-WIZARD-W0-SMART-DEFAULT-REASONING-001` フィードバック（FB-03）対応
- purpose空でもcategoryが有効な場合のformat推論独立性が仕様書で揺れた問題を解決
- Closes #2032

## 変更内容

- [ ] task-specification-creator SKILL.md の AC-4定義にフィールド独立性を追記
- [ ] フォールバック仕様書テンプレートに「フィールド間独立性」セクションを追加
- [ ] TC-FB03-01〜09（フィールド独立推論性テストケース）を追加

## テスト結果

- TC-FB03-01〜09: 全件PASS
- 既存テスト: 回帰影響なし

## 関連Issue

- Closes #2032
- 検出元: UT-SKILL-WIZARD-W0-SMART-DEFAULT-REASONING-001 Phase 4〜11 FB-03
```

## PR作成コマンド（ユーザー承認後のみ実行）

```bash
# ブランチ作成・push（承認後）
git checkout -b fix/ut-skill-wizard-fb-03-fallback-spec-clarification
git add .
git commit -m "fix(skill-wizard): SmartDefault AC-4 フォールバック仕様のフィールド独立推論性明示化 (#2032)"
git push -u origin fix/ut-skill-wizard-fb-03-fallback-spec-clarification

# PR作成（承認後）
gh pr create \
  --title "[UT-SKILL-WIZARD-FB-03] SmartDefault AC-4 フォールバック仕様のフィールド独立推論性明示化" \
  --body "$(cat <<'EOF'
## 概要
SmartDefault AC-4 フォールバック仕様のフィールド独立推論性を明示化する。

- Closes #2032
- 検出元: UT-SKILL-WIZARD-W0-SMART-DEFAULT-REASONING-001 Phase 4〜11 FB-03

## 変更内容
- AC-4定義にフィールド独立性を追記
- フォールバックテンプレートに「フィールド間独立性」セクション追加
- TC-FB03-01〜09追加（全件PASS）

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
  docs/30-workflows/ut-skill-wizard-fb-03-fallback-spec-clarification-001 13
```

## 参照資料

| 資料名                  | パス                                                                             | 用途            |
| ----------------------- | -------------------------------------------------------------------------------- | --------------- |
| Phase 11 手動テスト結果 | `outputs/phase-11/manual-test-result.md`                                         | Phase 11 主証跡 |
| Phase 11 チェックリスト | `outputs/phase-11/manual-test-checklist.md`                                      | docs-only 検証  |
| Phase 12 成果物一覧     | `outputs/phase-12/`                                                              | PR前確認        |
| Phase 12 準拠確認       | `outputs/phase-12/phase12-task-spec-compliance-check.md`                         | root evidence   |
| phase-template-phase13  | `.claude/skills/task-specification-creator/references/phase-template-phase13.md` | PR手順詳細      |
| review-gate-criteria    | `.claude/skills/task-specification-creator/references/review-gate-criteria.md`   | 承認ルール確認  |

## 成果物

| 成果物           | パス                               | 説明                             |
| ---------------- | ---------------------------------- | -------------------------------- |
| PRチェックリスト | `outputs/phase-13/pr-checklist.md` | PR作成前確認・PR URL・CI結果記録 |

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
