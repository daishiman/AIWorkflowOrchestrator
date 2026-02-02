# Phase 13: PR作成

## メタ情報

| 項目   | 値                     |
| ------ | ---------------------- |
| Phase  | 13                     |
| 機能名 | TASK-WCE-WORKSPACE-001 |
| 作成日 | 2026-02-02             |

## 目的

変更をコミットし、ユーザーの明示的な許可を得てからPull Requestを作成し、CIを確認する。

## 実行タスク

### Task 1: ローカル動作確認依頼

PR作成前に、ユーザーにローカル環境での動作確認を依頼する。

**確認依頼項目**:

1. アプリケーション起動確認
2. ワークスペースにフォルダを追加
3. chat-edit機能でファイルを読み込み
4. ワークスペース外ファイルへのアクセス試行（エラー確認）

### Task 2: 変更サマリー提示

PR作成前に変更内容のサマリーを提示し、許可を確認する。

**変更ファイル一覧**:

| ファイル                                                                         | 変更内容                |
| -------------------------------------------------------------------------------- | ----------------------- |
| `apps/desktop/src/main/handlers/chatEditHandlers.ts`                             | getWorkspacePath()修正  |
| `apps/desktop/src/renderer/features/workspace-chat-edit/hooks/useFileContext.ts` | getAvailableFiles()修正 |
| `apps/desktop/src/renderer/features/workspace-chat-edit/utils/fileTreeUtils.ts`  | 新規追加                |
| テストファイル（複数）                                                           | 新規追加                |

### Task 3: PR作成（ユーザー許可後）

```
/ai:diff-to-pr
```

**PR内容**:

| 項目     | 内容                                        |
| -------- | ------------------------------------------- |
| タイトル | feat(chat-edit): Workspace管理との統合 #660 |
| ブランチ | task-wce-workspace-001                      |
| ベース   | main                                        |

### Task 4: CI確認

- [ ] GitHub Actions CI通過
- [ ] TypeCheckパス
- [ ] ESLintパス
- [ ] テスト全パス

## 参照資料

| 資料名       | パス                                          | 説明           |
| ------------ | --------------------------------------------- | -------------- |
| 最終レビュー | `outputs/phase-10/final-review-result.md`     | Phase 10成果物 |
| 手動テスト   | `outputs/phase-11/manual-test-result.md`      | Phase 11成果物 |
| ドキュメント | `outputs/phase-12/documentation-changelog.md` | Phase 12成果物 |

## 実行手順

### 1. ユーザーにローカル動作確認を依頼【必須】

PR作成前に、ユーザーにローカル環境での動作確認を依頼する。

### 2. 変更サマリーの提示と許可確認【必須】

変更内容のサマリーを提示し、PRを作成してよいかユーザーに確認する。

**重要**: ユーザーから明示的な許可を得るまでPR作成を実行しないこと。

### 3. `/ai:diff-to-pr` を実行

ユーザーの許可を得た後、PR作成を実行する。

### 4. 実行結果の確認

- PRが作成されていること
- CIが通過していること

### 5. フォールバック（必要時）

`/ai:diff-to-pr` が使えない場合は、git/gh CLIで手動対応する。

```bash
# ブランチプッシュ
git push -u origin task-wce-workspace-001

# PR作成
gh pr create --title "feat(chat-edit): Workspace管理との統合 #660" --body "..."
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

PRが作成され、CIが通過した後、タスクディレクトリを完了タスクフォルダに移動する。

### 移動手順

```bash
# タスクディレクトリをcompleted-tasksに移動
mv docs/30-workflows/TASK-WCE-WORKSPACE-001/ docs/30-workflows/completed-tasks/

# 移動を確認
ls docs/30-workflows/completed-tasks/ | grep TASK-WCE-WORKSPACE-001

# 変更をコミット
git add docs/30-workflows/
git commit -m "docs(workflows): TASK-WCE-WORKSPACE-001をcompleted-tasksに移動"
git push
```

## 次のPhase

なし（ワークフロー完了）
