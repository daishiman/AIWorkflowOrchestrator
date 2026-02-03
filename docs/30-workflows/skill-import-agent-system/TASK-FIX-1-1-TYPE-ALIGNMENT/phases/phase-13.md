# Phase 13: PR作成

## メタ情報

| 項目   | 値                          |
| ------ | --------------------------- |
| Phase  | 13                          |
| 機能名 | TASK-FIX-1-1-TYPE-ALIGNMENT |
| 作成日 | 2026-02-04                  |

## 目的

変更をコミットし、ユーザーの明示的な許可を得てからPull Requestを作成し、CIを確認する。

## 実行タスク

### Task 1: ローカル動作確認依頼

ユーザーにローカルでの動作確認を依頼する。

**確認項目**:

1. `pnpm typecheck` がエラーなし
2. `pnpm test` が全PASS
3. デスクトップアプリの起動・動作確認

### Task 2: 変更サマリー提示

**変更概要**:

| 変更種別     | ファイル                                       | 内容                           |
| ------------ | ---------------------------------------------- | ------------------------------ |
| 型統合       | `packages/shared/src/types/skill.ts`           | skill-execution.tsの型を統合   |
| ファイル削除 | `packages/shared/src/types/skill-execution.ts` | 重複型定義を削除               |
| import修正   | 複数ファイル                                   | @repo/sharedからのimportに統一 |
| テスト追加   | `packages/shared/src/types/__tests__/`         | 型ガードテスト追加             |
| ドキュメント | `outputs/phase-12/`                            | 実装ガイド・更新履歴           |

### Task 3: PR作成（ユーザー許可後）

```bash
/ai:diff-to-pr
```

### Task 4: CI確認

- PRが作成されていること
- CIが通過していること

## 参照資料

| 資料名       | パス                                       | 説明           |
| ------------ | ------------------------------------------ | -------------- |
| 最終レビュー | `outputs/phase-10/final-review-result.md`  | Phase 10成果物 |
| 手動テスト   | `outputs/phase-11/manual-test-result.md`   | Phase 11成果物 |
| 実装ガイド   | `outputs/phase-12/implementation-guide.md` | Phase 12成果物 |

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

```bash
# タスクディレクトリをcompleted-tasksに移動
mv docs/30-workflows/skill-import-agent-system/TASK-FIX-1-1-TYPE-ALIGNMENT/ docs/30-workflows/completed-tasks/

# 移動を確認
ls docs/30-workflows/completed-tasks/ | grep TASK-FIX-1-1-TYPE-ALIGNMENT

# 変更をコミット
git add docs/30-workflows/
git commit -m "docs(workflows): TASK-FIX-1-1-TYPE-ALIGNMENTをcompleted-tasksに移動"
git push
```

## 次のPhase

なし（ワークフロー完了）
