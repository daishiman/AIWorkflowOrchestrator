# Phase 13: PR作成（blocked）

## メタ情報

| 項目       | 値                        |
| ---------- | ------------------------- |
| Phase      | 13                        |
| 機能名     | ut-rt-02-exhaustive-check |
| 作成日     | 2026-04-07                |
| ステータス | blocked                   |
| 前提Phase  | Phase 12                  |
| 後続Phase  | なし                      |

## 目的

ユーザーの明示的な許可がある場合だけ commit / Pull Request を作成し、CI を確認する。許可がない場合は blocked を維持する。

**重要**: この workflow ではユーザー承認がない限り commit / PR を実行しない。

## 実行タスク

- 承認状態確認: ユーザーの明示的な許可有無を確認
- blocked 理由記録: 許可がない場合の blocked 理由を記録
- ローカル動作確認依頼: ユーザーに最終確認を依頼
- 変更サマリー提示: 変更内容を要約し PR 作成の許可を確認
- PR作成: ユーザーの許可後にのみ `/ai:diff-to-pr` を実行
- CI確認: PR 作成後に CI が通過したことを確認

## 参照資料

| 資料名               | パス                                                     | 説明                   |
| -------------------- | -------------------------------------------------------- | ---------------------- |
| 最終レビュー結果     | `outputs/phase-10/final-review.md`                       | Phase 10 成果物        |
| 手動テスト結果       | `outputs/phase-11/manual-test-result.md`                 | Phase 11 成果物        |
| ドキュメント更新履歴 | `outputs/phase-12/documentation-changelog.md`            | Phase 12 成果物        |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`               | Phase 12 成果物        |
| コンプライアンス     | `outputs/phase-12/phase12-task-spec-compliance-check.md` | Phase 12 root evidence |

## 実行手順

### 1. ユーザーへのローカル動作確認依頼【必須】

PR 作成前に、ユーザーにローカル環境での動作確認を依頼する。

確認依頼内容：

- `pnpm --filter @repo/desktop exec vitest run src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.executeAsync.test.ts` の実行
- `pnpm --filter @repo/desktop typecheck` の実行
- `pnpm --filter @repo/desktop lint` の実行

### 2. 変更サマリーの提示と許可確認【必須】

以下のサマリーを提示し、PR 作成の許可をユーザーに確認する：

**変更サマリー**:

| 変更種別 | ファイル                                                                                          | 変更内容                                                                                                 |
| -------- | ------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| 修正     | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`                             | executeAsync() を exhaustive switch 化し、`classifyExecuteResult()` と module-local `assertNever` を導入 |
| 修正     | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.executeAsync.test.ts` | TC-07〜TC-12 追加                                                                                        |

**品質指標**:

- 全テスト（T-01〜T-06 + TC-07〜TC-12）: PASS
- TypeScript 型チェック: エラー 0 件
- ESLint: エラー 0 件
- Branch Coverage: 基準達成

> **重要**: ユーザーから明示的な許可を得るまで PR 作成を実行しないこと。

### 3. PR作成（ユーザー許可後）

```
/ai:diff-to-pr
```

PR タイトル例:

```
refactor(runtime): RuntimeSkillCreatorFacade.executeAsync() にexhaustive switchパターンを導入
```

PR 本文のポイント：

- 変更の動機（mixed union を normalize して exhaustive check を成立させるため）
- module-local assertNever パターンの説明
- 既存テストの回帰確認（T-01〜T-06 全 PASS）
- 型レベルの安全性確認方法
- 関連 Issue: #1946

### 4. 実行結果の確認

- PR が作成されていること
- CI が通過していること

### 5. タスク完了処理

PR がマージされた後、タスクディレクトリを completed-tasks に移動する：

```bash
mv docs/30-workflows/ut-rt-02-exhaustive-check/ \
   docs/30-workflows/completed-tasks/

ls docs/30-workflows/completed-tasks/ | grep ut-rt-02-exhaustive-check
```

## 成果物

| 成果物 | パス                          | 説明     |
| ------ | ----------------------------- | -------- |
| PR情報 | `outputs/phase-13/pr-info.md` | PR URL等 |

## 完了条件

- [ ] ユーザーにローカル動作確認を依頼している
- [ ] 変更サマリーを提示し PR 作成の許可を得ている
- [ ] 全変更がコミットされている
- [ ] PR が作成されている（ユーザー承認後）
- [ ] CI が通過している
- [ ] blocked 理由が記録されている
- [ ] タスクディレクトリが `completed-tasks` に移動されている
- [ ] **本Phase内の全作業を100%完了（PR作成・CI確認・移動）**
