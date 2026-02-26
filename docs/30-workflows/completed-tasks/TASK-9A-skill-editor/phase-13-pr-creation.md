# Phase 13: PR作成

## メタ情報

| 項目      | 値                                                   |
| --------- | ---------------------------------------------------- |
| Phase     | 13                                                   |
| 機能名    | TASK-9A-skill-editor                                 |
| 作成日    | 2026-02-26                                           |
| 前提Phase | Phase 12（ドキュメント更新）完了                     |
| 目的      | ユーザー許可を得てPRを作成し、CIを確認してタスク完了 |

## 目的

変更をコミットし、ユーザーの明示的な許可を得てからPull Requestを作成し、CIを確認する。

## 実行タスク

- ローカル動作確認依頼: ユーザーにローカルでの動作確認を依頼
- 変更サマリー提示: 変更内容のサマリーを提示しPR作成の許可を確認
- PR作成: ユーザーの許可後に `/ai:diff-to-pr` を実行
- CI確認: CIが通過したことを確認
- タスク完了処理: タスクディレクトリを completed-tasks に移動

## 参照資料

| 資料名                   | パス                                          | 説明           |
| ------------------------ | --------------------------------------------- | -------------- |
| Phase 2 設計成果物       | `outputs/phase-2/`                            | 設計仕様       |
| Phase 5 実装成果物       | `outputs/phase-5/`                            | 実装コード概要 |
| Phase 6 テスト成果物     | `outputs/phase-6/`                            | 拡張テスト結果 |
| Phase 7 カバレッジ       | `outputs/phase-7/`                            | カバレッジ判定 |
| Phase 8 リファクタ成果物 | `outputs/phase-8/`                            | リファクタ結果 |
| Phase 9 品質成果物       | `outputs/phase-9/`                            | 品質保証結果   |
| 最終レビュー結果         | `outputs/phase-10/final-review-result.md`     | Phase 10成果物 |
| 手動テスト結果           | `outputs/phase-11/manual-test-result.md`      | Phase 11成果物 |
| ドキュメント更新履歴     | `outputs/phase-12/documentation-changelog.md` | Phase 12成果物 |
| artifacts.json           | `outputs/artifacts.json`                      | 全Phase成果物  |

## 実行手順

### ステップ1: ユーザーにローカル動作確認を依頼【必須】

PR作成前に、ユーザーにローカル環境での動作確認を依頼する。

**依頼内容**:

1. `pnpm --filter @repo/desktop dev` でアプリを起動
2. スキルエディター画面を開く
3. 以下の基本操作を確認:
   - SKILL.mdの読み込みと表示
   - ファイルの編集と保存
   - バックアップからの復元
   - `~/.claude/skills/` のスキルが読み取り専用であること

**重要**: ユーザーから動作確認完了の報告を受けるまで次のステップに進まないこと。

### ステップ2: 変更サマリーの提示と許可確認【必須】

変更内容のサマリーを提示し、PRを作成してよいかユーザーに確認する。

**提示内容**:

- 変更ファイル数と変更行数（`git diff --stat` の結果）
- 主要な変更内容:
  - TASK-9A-A: SkillFileManager実装（バックアップ・リストア付き）
  - TASK-9A-B: ファイル編集IPCハンドラー（6チャンネル、65テストPASS）
  - TASK-9A-C: SkillEditor UIコンポーネント
- テスト結果サマリー（自動テスト数 + 手動テスト12項目）
- Phase 10最終レビュー結果

**重要**: ユーザーから明示的な許可を得るまでPR作成を実行しないこと。

### ステップ3: PR作成（ユーザー許可後）

ユーザーの許可を得た後、PR作成を実行する。

```
/ai:diff-to-pr
```

**フォールバック（`/ai:diff-to-pr` が使えない場合）**:

```bash
# 1. ブランチ確認
git branch --show-current

# 2. 全変更をステージング
git add -A

# 3. コミット
git commit -m "feat(skill-editor): スキルエディター機能実装 (TASK-9A)

- SkillFileManager: バックアップ・リストア付きファイル管理
- IPC: skill:readFile/writeFile/createFile/deleteFile/listBackups/restoreBackup
- SkillEditor UI: ファイルツリー+エディターコンポーネント
- 65テストPASS、手動テスト12項目確認済み"

# 4. プッシュ
git push -u origin $(git branch --show-current)

# 5. PR作成
gh pr create \
  --title "feat(skill-editor): スキルエディター機能実装 (TASK-9A)" \
  --body "$(cat <<'EOF'
## Summary
- SkillFileManager実装（バックアップ・リストア付きファイル管理）
- ファイル編集IPCハンドラー6チャンネル実装（65テストPASS）
- SkillEditor UIコンポーネント（ファイルツリー+エディター）

## Test plan
- [ ] 自動テスト: `pnpm --filter @repo/desktop test` がPASS
- [ ] 手動テスト: Phase 11の12項目がPASS
- [ ] 型チェック: `pnpm typecheck` がPASS
- [ ] Lint: `pnpm lint` がPASS

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

### ステップ4: CI確認

- PRが作成されていること
- CIが通過していること
- CIが失敗した場合は原因を調査し、修正後に再プッシュ

### ステップ5: タスク完了処理【必須】

PRが作成され、CIが通過した後、タスクディレクトリを完了タスクフォルダに移動する。

```bash
# タスクディレクトリをcompleted-tasksに移動
mv docs/30-workflows/TASK-9A-skill-editor/ docs/30-workflows/completed-tasks/

# 移動を確認
ls docs/30-workflows/completed-tasks/ | grep TASK-9A-skill-editor

# 変更をコミット
git add docs/30-workflows/
git commit -m "docs(workflows): TASK-9A-skill-editorをcompleted-tasksに移動"
git push
```

## 成果物

| 成果物 | パス                          | 必須 | 説明                 |
| ------ | ----------------------------- | ---- | -------------------- |
| PR情報 | `outputs/phase-13/pr-info.md` | ✅   | PR URL・番号・CI結果 |

### pr-info.md テンプレート

```markdown
## PR情報

| 項目     | 値              |
| -------- | --------------- |
| PR番号   | #{{PR_NUMBER}}  |
| PR URL   | {{PR_URL}}      |
| ブランチ | {{BRANCH_NAME}} |
| CI結果   | PASS / FAIL     |
| 作成日   | 2026-02-26      |

## 変更サマリー

- 変更ファイル数: {{N}}
- 追加行数: {{N}}
- 削除行数: {{N}}

## CIチェック結果

| チェック項目 | 結果 |
| ------------ | ---- |
| TypeCheck    | PASS |
| Lint         | PASS |
| Test         | PASS |
| Build        | PASS |
```

## 完了条件

- [ ] ユーザーにローカル動作確認を依頼し、確認完了の報告を受けている
- [ ] 変更サマリーを提示し、PR作成の明示的な許可を得ている
- [ ] 全変更がコミットされている
- [ ] PRが作成されている
- [ ] CIが通過している
- [ ] `outputs/phase-13/pr-info.md` が作成されている
- [ ] タスクディレクトリが `docs/30-workflows/completed-tasks/TASK-9A-skill-editor/` に移動されている
- [ ] 移動後のコミット・プッシュが完了している
- [ ] **本Phase内の全作業を100%完了（PR作成・CI確認・ディレクトリ移動）**

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. ユーザーにローカル動作確認を依頼
2. 変更サマリーの提示と許可確認
3. PR作成（`/ai:diff-to-pr` 実行）
4. CI確認
5. タスクディレクトリ移動
6. 完了条件の検証

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次のPhase

なし（ワークフロー完了）
