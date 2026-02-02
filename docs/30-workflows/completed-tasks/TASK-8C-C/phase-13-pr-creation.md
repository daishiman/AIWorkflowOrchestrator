# Phase 13: PR作成

## メタ情報

| 項目   | 値                           |
| ------ | ---------------------------- |
| Phase  | 13                           |
| 機能名 | TASK-8C-C-e2e-import-execute |
| 作成日 | 2026-02-02                   |

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

```bash
# ローカル確認コマンド
pnpm install
pnpm --filter @repo/desktop build
pnpm --filter @repo/desktop test:e2e skillImportExecution
```

### 2. 変更サマリーの提示【必須】

**変更ファイル一覧**:

| ファイル                                                 | 変更種別 | 説明              |
| -------------------------------------------------------- | -------- | ----------------- |
| `apps/desktop/src/__tests__/skillImportExecution.e2e.ts` | 新規作成 | E2Eテストファイル |
| `docs/30-workflows/TASK-8C-C/`                           | 新規作成 | Phase 1-13仕様書  |

**テスト結果サマリー**:

| メトリクス        | 値                 |
| ----------------- | ------------------ |
| E2Eテストケース数 | 7件（6基本+1追加） |
| テスト成功率      | 100%               |

### 3. PR作成（許可後）

```
/ai:diff-to-pr
```

### 4. CI確認

- [ ] ビルドが成功
- [ ] テストが成功
- [ ] Lintが成功

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
- [ ] **本Phase内の全作業を100%完了**

## タスク完了処理【必須】

PRが作成され、CIが通過した後、タスクディレクトリを完了タスクフォルダに移動する。

```bash
# タスクディレクトリをcompleted-tasksに移動
mv docs/30-workflows/TASK-8C-C/ docs/30-workflows/completed-tasks/

# 移動を確認
ls docs/30-workflows/completed-tasks/ | grep TASK-8C-C

# 変更をコミット
git add docs/30-workflows/
git commit -m "docs(workflows): TASK-8C-Cをcompleted-tasksに移動"
git push
```

## 次のPhase

なし（ワークフロー完了）
