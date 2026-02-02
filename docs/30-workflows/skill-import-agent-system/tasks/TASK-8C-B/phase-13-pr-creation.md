# Phase 13: PR作成

## メタ情報

| 項目     | 値                           |
| -------- | ---------------------------- |
| Phase    | 13                           |
| タスクID | TASK-8C-B                    |
| タスク名 | E2Eテスト - スキル選択フロー |
| 作成日   | 2026-02-02                   |

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
以下のコマンドでE2Eテストを実行し、動作を確認してください：

pnpm --filter @repo/desktop test:e2e skillSelection.e2e.ts

期待結果: 6件以上のテストがPASS
```

### 2. 変更サマリーの提示と許可確認【必須】

**変更サマリー**:

| カテゴリ     | 変更内容                                |
| ------------ | --------------------------------------- |
| 新規ファイル | `skillSelection.e2e.ts` - E2Eテスト6件+ |
| テスト対象   | スキル選択UI（ChatPanel内）             |
| 依存         | TASK-7D, TASK-8C-E                      |

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
# ブランチ作成
git checkout -b feat/task-8c-b-e2e-selection

# コミット
git add apps/desktop/src/__tests__/skillSelection.e2e.ts
git commit -m "test(e2e): スキル選択フローE2Eテスト追加 (TASK-8C-B)"

# プッシュ
git push -u origin feat/task-8c-b-e2e-selection

# PR作成
gh pr create --title "test(e2e): スキル選択フローE2Eテスト追加" --body "..."
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
- [ ] タスクディレクトリがcompleted-tasksに移動されている
- [ ] **本Phase内の全作業を100%完了（PR作成・CI確認・移動）**

## タスク完了処理【必須】

**PRが作成され、CIが通過した後、タスクディレクトリを完了タスクフォルダに移動する。**

### 移動手順

```bash
# タスクディレクトリをcompleted-tasksに移動
mv docs/30-workflows/skill-import-agent-system/tasks/TASK-8C-B/ docs/30-workflows/completed-tasks/

# 移動を確認
ls docs/30-workflows/completed-tasks/ | grep TASK-8C-B

# 変更をコミット
git add docs/30-workflows/
git commit -m "docs(workflows): TASK-8C-Bをcompleted-tasksに移動"
git push
```

## 次のPhase

なし（ワークフロー完了）
