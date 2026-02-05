# Phase 13: PR作成

## メタ情報

| 項目   | 値               |
| ------ | ---------------- |
| Phase  | 13               |
| 機能名 | TASK-AUTH-UI-002 |
| 作成日 | 2026-02-04       |

## 目的

変更をコミットし、ユーザーの明示的な許可を得てからPull Requestを作成し、CIを確認する。

## 実行タスク

- ローカル動作確認依頼: ユーザーにローカルでの動作確認を依頼
- 変更サマリー提示: 変更内容のサマリーを提示しPR作成の許可を確認
- PR作成: ユーザーの許可後に`/ai:diff-to-pr`を実行
- CI確認: CIが通過したことを確認

## 参照資料

| 資料名       | パス                                          | 説明           |
| ------------ | --------------------------------------------- | -------------- |
| 最終レビュー | `outputs/phase-10/final-review-result.md`     | Phase 10成果物 |
| 手動テスト   | `outputs/phase-11/manual-test-result.md`      | Phase 11成果物 |
| ドキュメント | `outputs/phase-12/documentation-changelog.md` | Phase 12成果物 |

## 実行手順

### 1. ユーザーにローカル動作確認を依頼【必須】

```
以下の動作確認をお願いします:
1. pnpm --filter @repo/desktop dev でアプリを起動
2. ログイン
3. アバター編集ボタンをクリック
4. メニューが連携サービスセクションの上に表示されることを確認
5. メニュー内のボタンがクリック可能であることを確認
```

### 2. 変更サマリーの提示と許可確認【必須】

**変更サマリー（本タスクの場合）**:

本タスクは実装済み機能の検証とドキュメント整備です:

| カテゴリ     | 変更内容                         |
| ------------ | -------------------------------- |
| ドキュメント | タスク仕様書（Phase 1-13）作成   |
| ドキュメント | 実装ガイド作成                   |
| ドキュメント | 未タスク検出レポート作成         |
| テスト       | 既存テストの確認・カバレッジ確認 |

**重要**: ユーザーから明示的な許可を得るまでPR作成を実行しないこと。

### 3. `/ai:diff-to-pr` を実行

ユーザーの許可を得た後、PR作成を実行する。

```
/ai:diff-to-pr
```

### 4. 実行結果の確認

- PRが作成されていること
- CIが通過していること

### 5. フォールバック（必要時）

`/ai:diff-to-pr` が使えない場合は、git/gh CLIで手動対応する。

```bash
# ブランチ作成（既存の場合はスキップ）
git checkout -b task/auth-ui-002-avatar-menu-z-index

# 変更をコミット
git add docs/30-workflows/TASK-AUTH-UI-002/
git commit -m "docs(workflows): TASK-AUTH-UI-002タスク仕様書作成

- Phase 1-13のタスク仕様書を作成
- Portal実装パターンに基づく検証手順を定義
- 実装ガイドと未タスク検出レポートを含む

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"

# プッシュ
git push -u origin task/auth-ui-002-avatar-menu-z-index

# PR作成
gh pr create --title "docs(workflows): TASK-AUTH-UI-002 アバターメニューz-index修正 タスク仕様書" --body "$(cat <<'EOF'
## Summary
- アバターメニューz-index修正（AUTH-UI-002）のタスク仕様書を作成
- Portal実装パターンに基づく検証手順を定義
- 実装ガイドと未タスク検出レポートを含む

## Test plan
- [ ] タスク仕様書のフォーマット確認
- [ ] Phase構成の妥当性確認

🤖 Generated with [Claude Code](https://claude.com/claude-code)
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
- [ ] **本Phase内の全作業を100%完了（PR作成・CI確認）**

## タスク完了処理【必須】

**PRが作成され、CIが通過した後、タスクディレクトリを完了タスクフォルダに移動する。**

```bash
# タスクディレクトリをcompleted-tasksに移動
mv docs/30-workflows/TASK-AUTH-UI-002/ docs/30-workflows/completed-tasks/

# 移動を確認
ls docs/30-workflows/completed-tasks/ | grep TASK-AUTH-UI-002

# 変更をコミット
git add docs/30-workflows/
git commit -m "docs(workflows): TASK-AUTH-UI-002をcompleted-tasksに移動"
git push
```

## 次のPhase

なし（ワークフロー完了）
