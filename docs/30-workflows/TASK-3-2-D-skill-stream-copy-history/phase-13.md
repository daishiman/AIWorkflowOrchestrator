# Phase 13: PR作成

## メタ情報

| 項目   | 値                                   |
| ------ | ------------------------------------ |
| Phase  | 13                                   |
| 機能名 | TASK-3-2-D-skill-stream-copy-history |
| 作成日 | 2026-01-28                           |

## 目的

変更をコミットし、ユーザーの明示的な許可を得てからPull Requestを作成し、CIを確認する。

## 実行タスク

- ローカル動作確認依頼: ユーザーにローカルでの動作確認を依頼
- 変更サマリー提示: 変更内容のサマリーを提示しPR作成の許可を確認
- PR作成: ユーザーの許可後に`/ai:diff-to-pr`を実行
- CI確認: CIが通過したことを確認
- タスク完了処理: completed-tasksへの移動

## 参照資料

| 資料名       | パス                                          | 説明           |
| ------------ | --------------------------------------------- | -------------- |
| 最終レビュー | `outputs/phase-10/final-review-result.md`     | Phase 10成果物 |
| 手動テスト   | `outputs/phase-11/manual-test-result.md`      | Phase 11成果物 |
| ドキュメント | `outputs/phase-12/documentation-changelog.md` | Phase 12成果物 |
| artifacts    | `outputs/artifacts.json`                      | Phase 12成果物 |

## 実行手順

### ステップ1: ユーザーにローカル動作確認を依頼【必須】

PR作成前に、ユーザーにローカル環境での動作確認を依頼する。

**確認依頼内容**:

1. `pnpm --filter @repo/desktop dev` で開発サーバーを起動
2. SkillStreamDisplay でメッセージをコピー
3. 履歴パネルを開いて動作確認
4. 既存機能（CopyButton、タイムスタンプ）が正常動作することを確認

### ステップ2: 変更サマリーの提示と許可確認【必須】

変更内容のサマリーを提示し、PRを作成してよいかユーザーに確認する。

**変更サマリー（例）**:

```markdown
## 変更概要

TASK-3-2-D: SkillStreamDisplay コピー履歴機能を実装

### 新規ファイル

- `apps/desktop/src/renderer/contexts/CopyHistoryContext.tsx`
- `apps/desktop/src/renderer/hooks/useCopyHistory.ts`
- `apps/desktop/src/renderer/components/AgentView/CopyHistoryPanel.tsx`
- 関連テストファイル

### 変更ファイル

- `apps/desktop/src/renderer/components/AgentView/SkillStreamDisplay.tsx`

### ドキュメント更新

- `ui-ux-feature-components.md`（コピー履歴機能仕様追加）
- 実装ガイド作成
```

**重要**: ユーザーから明示的な許可を得るまでPR作成を実行しないこと。

### ステップ3: PR作成（許可後）

ユーザーの許可を得た後、PR作成を実行する。

```
/ai:diff-to-pr
```

### ステップ4: 実行結果の確認

- PRが作成されていること
- CIが通過していること

### ステップ5: フォールバック（必要時）

`/ai:diff-to-pr` が使えない場合は、git/gh CLIで手動対応する:

```bash
# ブランチをプッシュ
git push -u origin task/TASK-3-2-D-skill-stream-copy-history

# PRを作成
gh pr create --title "[TASK-3-2-D] SkillStreamDisplay コピー履歴機能" --body "$(cat <<'EOF'
## Summary
- コピー履歴パネル機能を追加
- CopyHistoryContext / useCopyHistory Hook を実装
- 最大50件の履歴保持、複数選択一括コピー機能

## Test plan
- [ ] `pnpm --filter @repo/desktop test` が成功すること
- [ ] 手動テストで履歴機能が正常動作すること
- [ ] 既存機能（CopyButton、タイムスタンプ）に影響がないこと

🤖 Generated with Claude Code
EOF
)"
```

## 成果物

| 成果物 | パス                          | 説明     |
| ------ | ----------------------------- | -------- |
| PR情報 | `outputs/phase-13/pr-info.md` | PR URL等 |

## 完了条件

- [ ] ユーザーにローカル動作確認を依頼している
- [ ] 変更サマリーを提示しPR作成の許可を得ている
- [ ] 全変更がコミットされている
- [ ] PRが作成されている
- [ ] CIが通過している
- [ ] レビュー準備が完了している
- [ ] タスクディレクトリがcompleted-tasksに移動されている
- [ ] **本Phase内の全作業を100%完了（PR作成・CI確認・移動）**

## タスク完了処理【必須】

**PRが作成され、CIが通過した後、タスクディレクトリを完了タスクフォルダに移動する。**

### 移動手順

```bash
# タスクディレクトリをcompleted-tasksに移動
mv docs/30-workflows/TASK-3-2-D-skill-stream-copy-history/ docs/30-workflows/completed-tasks/

# 移動を確認
ls docs/30-workflows/completed-tasks/ | grep TASK-3-2-D

# 変更をコミット
git add docs/30-workflows/
git commit -m "docs(workflows): TASK-3-2-D-skill-stream-copy-historyをcompleted-tasksに移動"
git push
```

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. ローカル動作確認依頼
2. 変更サマリー提示
3. ユーザー許可確認
4. PR作成実行
5. CI通過確認
6. タスクディレクトリ移動
7. 完了条件の検証

## 次のPhase

なし（ワークフロー完了）
