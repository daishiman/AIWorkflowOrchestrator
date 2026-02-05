# Phase 13: PR作成

## メタ情報

| 項目   | 値                             |
| ------ | ------------------------------ |
| Phase  | 13                             |
| 機能名 | TASK-FIX-4-1-IPC-CONSOLIDATION |
| 作成日 | 2026-02-04                     |

## 目的

変更をコミットし、ユーザーの明示的な許可を得てからPull Requestを作成し、CIを確認する。

## 実行タスク

### Task 1: ローカル動作確認依頼【必須】

PR作成前に、ユーザーにローカル環境での動作確認を依頼する。

**確認依頼内容**:

- アプリケーション起動確認
- スキル一覧取得の動作確認
- スキル実行の動作確認

### Task 2: 変更サマリー提示【必須】

変更内容のサマリーを提示し、PRを作成してよいかユーザーに確認する。

**変更サマリー（予定）**:

| カテゴリ       | 変更内容                              |
| -------------- | ------------------------------------- |
| チャンネル定義 | IPC_CHANNELS定数を単一ファイルに集約  |
| ホワイトリスト | ALLOWED\_\*\_CHANNELSを仕様準拠に更新 |
| Preload API    | ハードコード文字列を定数に置換        |
| ハンドラー     | 新チャンネル名に対応                  |
| テスト         | チャンネル統一に関するテスト追加      |

**重要**: ユーザーから明示的な許可を得るまでPR作成を実行しないこと。

### Task 3: PR作成

ユーザーの許可を得た後、PR作成を実行する。

```
/ai:diff-to-pr
```

### Task 4: 実行結果の確認

- PRが作成されていること
- CIが通過していること

### Task 5: フォールバック（必要時）

`/ai:diff-to-pr` が使えない場合は、git/gh CLIで手動対応する。

## 参照資料

| 資料名       | パス                                          | 説明           |
| ------------ | --------------------------------------------- | -------------- |
| 最終レビュー | `outputs/phase-10/final-review-result.md`     | Phase 10成果物 |
| 手動テスト   | `outputs/phase-11/manual-test-result.md`      | Phase 11成果物 |
| ドキュメント | `outputs/phase-12/documentation-changelog.md` | Phase 12成果物 |

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

### 移動手順

```bash
# タスクディレクトリをcompleted-tasksに移動
mv docs/30-workflows/TASK-FIX-4-1-IPC-CONSOLIDATION/ docs/30-workflows/completed-tasks/

# 移動を確認
ls docs/30-workflows/completed-tasks/ | grep TASK-FIX-4-1-IPC-CONSOLIDATION

# 変更をコミット
git add docs/30-workflows/
git commit -m "docs(workflows): TASK-FIX-4-1-IPC-CONSOLIDATIONをcompleted-tasksに移動"
git push
```

## 次のPhase

なし（ワークフロー完了）
