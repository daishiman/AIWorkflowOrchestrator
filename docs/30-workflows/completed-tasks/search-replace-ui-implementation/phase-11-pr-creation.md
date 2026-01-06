# Phase 11: PR作成

## メタ情報

| 項目   | 値                    |
| ------ | --------------------- |
| Phase  | 11                    |
| 機能名 | 検索・置換機能 UI実装 |
| 作成日 | 2026-01-05            |

## 目的

変更をコミットし、Pull Requestを作成してCIを確認する。

## 使用スキル

- なし（git/gh CLIで直接実行）

## 参照資料

| 資料名         | パス                                       | 説明          |
| -------------- | ------------------------------------------ | ------------- |
| Phase 10成果物 | `outputs/phase-10/implementation-guide.md` | 実装ガイド    |
| 最終レビュー   | `outputs/phase-8/final-review-result.md`   | Phase 8成果物 |
| 手動テスト     | `outputs/phase-9/manual-test-result.md`    | Phase 9成果物 |

## 実行手順

### ステップ1: 変更の確認

```bash
git status
git diff --stat
```

### ステップ2: コミット

```bash
git add .
git commit -m "feat(search): 検索・置換機能 UI実装

- SearchPanel コンポーネント実装
- WorkspaceSearchPanel コンポーネント実装
- useSearchStore (Zustand) 実装
- キーボードショートカット実装 (Cmd+F, Cmd+Shift+F)
- E2Eテスト追加

Closes #XXX"
```

### ステップ3: プッシュとPR作成

```bash
# リモートにプッシュ
git push -u origin $(git branch --show-current)

# PR作成
gh pr create \
  --title "feat(search): 検索・置換機能 UI実装" \
  --body "## 概要

検索・置換機能のフロントエンドUI実装です。

## 変更内容

### 機能
- ファイル内検索パネル (SearchPanel)
- ワークスペース検索パネル (WorkspaceSearchPanel)
- キーボードショートカット (Cmd+F / Ctrl+F, Cmd+Shift+F / Ctrl+Shift+F)
- 検索オプション（大文字小文字区別、単語単位、正規表現）
- 置換機能（単一置換、全置換）

### 技術
- Zustand による状態管理
- WCAG 2.1 AA 準拠
- テストカバレッジ 80%以上

## テスト結果

- ユニットテスト: XX/XX 成功
- E2Eテスト: XX/XX 成功
- 手動テスト: 22/22 成功

## スクリーンショット

<!-- スクリーンショットを貼り付け -->

## 関連タスク

- バックエンド実装: TASK-SEARCH-REPLACE-001 (完了)
- 本タスク: task-imp-search-ui-001
"
```

### ステップ4: CI確認

```bash
# PRステータス確認
gh pr checks

# CI完了待ち
gh pr checks --watch
```

### ステップ5: タスク完了処理【必須】

**PRが作成され、CIが通過した後、タスクディレクトリを完了タスクフォルダに移動する。**

```bash
# 1. タスクディレクトリをcompleted-tasksに移動
mv docs/30-workflows/search-replace-ui-implementation/ docs/30-workflows/completed-tasks/

# 2. 移動を確認
ls docs/30-workflows/completed-tasks/ | grep search-replace-ui-implementation

# 3. 元の未タスク指示書を削除（タスク完了のため不要）
rm docs/30-workflows/unassigned-task/task-search-replace-ui-implementation.md

# 4. artifacts.jsonのstatus更新
# "status": "completed" に変更

# 5. 変更をコミット
git add docs/30-workflows/
git commit -m "docs(workflows): search-replace-ui-implementationを完了、未タスク指示書を削除"
git push
```

## 成果物

| 成果物   | パス                          | 説明           |
| -------- | ----------------------------- | -------------- |
| PR情報   | `outputs/phase-11/pr-info.md` | PR URL・番号等 |
| コミット | Git履歴                       | 変更コミット   |

## 完了条件

- [ ] 全変更がコミットされている
- [ ] PRが作成されている
- [ ] CIが通過している
- [ ] レビュー準備が完了している
- [ ] タスクディレクトリが `completed-tasks/` に移動されている
- [ ] 元の未タスク指示書が削除されている
- [ ] artifacts.json の status が "completed"

## PRテンプレート確認

以下の項目がPRに含まれていることを確認:

- [ ] 概要セクション
- [ ] 変更内容セクション
- [ ] テスト結果セクション
- [ ] スクリーンショット（該当する場合）
- [ ] 関連タスク/Issue番号

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 変更確認
2. コミット作成
3. PR作成
4. CI確認
5. タスクディレクトリ移動
6. 未タスク指示書削除
7. artifacts.json更新
8. PR情報出力

## 次のPhase

なし（ワークフロー完了）
