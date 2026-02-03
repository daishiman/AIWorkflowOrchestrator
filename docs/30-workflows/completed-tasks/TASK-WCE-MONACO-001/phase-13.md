# Phase 13: PR作成

## メタ情報

| 項目   | 値                  |
| ------ | ------------------- |
| Phase  | 13                  |
| 機能名 | TASK-WCE-MONACO-001 |
| 作成日 | 2026-02-03          |

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

PR作成前に、ユーザーにローカル環境での動作確認を依頼する。

**確認依頼内容**:

```
以下の動作確認をお願いします：

1. アプリケーションを起動
2. Monaco Editorでファイルを開く
3. テキストを選択
4. 選択範囲取得API（chat-edit:get-selection）が正しく動作することを確認

問題がなければPR作成に進みます。
```

### 2. 変更サマリーの提示と許可確認【必須】

変更内容のサマリーを提示し、PRを作成してよいかユーザーに確認する。

**変更サマリー例**:

```
## 変更内容サマリー

### 新規ファイル
- apps/desktop/src/renderer/utils/editorSelection.ts

### 変更ファイル
- apps/desktop/src/main/ipc/chatEditHandlers.ts
- apps/desktop/src/main/ipc/index.ts
- apps/desktop/src/preload/chatEditApi.ts

### テスト追加
- 選択範囲取得のユニットテスト
- IPC統合テスト

### 解消されたTODO
- chatEditHandlers.ts:331 "Monaco Editorとの連携を実装"

PR作成を実行してもよろしいですか？
```

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
# ブランチ作成・プッシュ
git checkout -b feat/TASK-WCE-MONACO-001-monaco-editor-selection
git add .
git commit -m "feat(chat-edit): Monaco Editor選択範囲取得機能を実装

- editorSelection.tsユーティリティを追加
- handleGetSelectionを実装
- chatEditHandlersをIPC登録に追加
- 関連テストを追加

Closes #659

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"

git push -u origin feat/TASK-WCE-MONACO-001-monaco-editor-selection

# PR作成
gh pr create --title "feat(chat-edit): Monaco Editor選択範囲取得機能を実装" --body "..."
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

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. ユーザーにローカル動作確認を依頼
3. 変更サマリー提示とPR作成許可確認
4. /ai:diff-to-pr実行
5. CI確認
6. タスクディレクトリ移動
7. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/TASK-WCE-MONACO-001 --phase 13
```

## タスク完了処理【必須】

**PRが作成され、CIが通過した後、タスクディレクトリを完了タスクフォルダに移動する。**

### 移動手順

```bash
# タスクディレクトリをcompleted-tasksに移動
mv docs/30-workflows/TASK-WCE-MONACO-001/ docs/30-workflows/completed-tasks/

# 移動を確認
ls docs/30-workflows/completed-tasks/ | grep TASK-WCE-MONACO-001

# 変更をコミット
git add docs/30-workflows/
git commit -m "docs(workflows): TASK-WCE-MONACO-001をcompleted-tasksに移動"
git push
```

## 次のPhase

なし（ワークフロー完了）
