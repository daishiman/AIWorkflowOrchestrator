# Phase 13: PR作成

## メタ情報

| 項目   | 値                      |
| ------ | ----------------------- |
| Phase  | 13                      |
| 機能名 | CI テスト並列実行最適化 |
| 作成日 | 2026-02-02              |

## 目的

変更をコミットし、ユーザーの明示的な許可を得てからPull Requestを作成し、CIを確認する。

## 実行タスク

### Task 1: ユーザーにローカル動作確認を依頼【必須】

PR作成前に、ユーザーにローカル環境での動作確認を依頼する。

**確認依頼項目**:

1. ローカルでのテスト実行が成功すること
2. vitest.config.ts の変更がローカル環境に影響しないこと
3. 変更内容の最終確認

### Task 2: 変更サマリーの提示と許可確認【必須】

**変更サマリー**:

| ファイル                        | 変更内容                                         |
| ------------------------------- | ------------------------------------------------ |
| `.github/workflows/ci.yml`      | シャード8→16、キャッシュ導入、カバレッジ条件分岐 |
| `apps/desktop/vitest.config.ts` | maxForks 2→4、fileParallelism有効化              |

**期待効果**:

- 各シャード実行時間: 19-20分 → 10分以下
- 全体CI時間: 22分 → 12分以下

**重要**: ユーザーから明示的な許可を得るまでPR作成を実行しないこと。

### Task 3: `/ai:diff-to-pr` を実行

ユーザーの許可を得た後、PR作成を実行する。

```
/ai:diff-to-pr
```

### Task 4: 実行結果の確認

- [ ] PRが作成されている
- [ ] CIが正常に起動している
- [ ] 16シャードが並列実行されている
- [ ] 全テストがPASSしている

### Task 5: タスク完了処理【必須】

**PRが作成され、CIが通過した後、タスクディレクトリを完了タスクフォルダに移動する。**

```bash
# タスクディレクトリをcompleted-tasksに移動
mv docs/30-workflows/TASK-OPT-CI-TEST-PARALLEL-001/ docs/30-workflows/completed-tasks/

# 移動を確認
ls docs/30-workflows/completed-tasks/ | grep TASK-OPT-CI-TEST-PARALLEL-001

# 変更をコミット
git add docs/30-workflows/
git commit -m "docs(workflows): TASK-OPT-CI-TEST-PARALLEL-001をcompleted-tasksに移動"
git push
```

## 参照資料

| 資料名               | パス                                          | 説明           |
| -------------------- | --------------------------------------------- | -------------- |
| 手動テスト結果       | `outputs/phase-11/manual-test-result.md`      | Phase 11成果物 |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`    | Phase 12成果物 |
| ドキュメント更新履歴 | `outputs/phase-12/documentation-changelog.md` | Phase 12成果物 |

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

## 次のPhase

なし（ワークフロー完了）
