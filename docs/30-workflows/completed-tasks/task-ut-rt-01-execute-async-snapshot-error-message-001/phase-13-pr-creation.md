# Phase 13: PR 作成

## メタ情報

| 項目       | 内容                                                   |
| ---------- | ------------------------------------------------------ |
| Phase      | 13                                                     |
| Phase 名   | PR 作成                                                |
| 前提 Phase | Phase 12（ドキュメント更新）完了                       |
| 後続 Phase | -（最終フェーズ）                                      |
| ステータス | **BLOCKED**（ユーザーの明示的な承認待ち）              |
| 作成日     | 2026-04-06                                             |
| 機能名     | task-ut-rt-01-execute-async-snapshot-error-message-001 |

---

## 目的

変更をコミットし、ユーザーの明示的な許可を得てから Pull Request を作成し、CI を確認する。

---

## BLOCKED 条件

以下のいずれかに該当する場合、PR 作成は blocked とする。PR 作成の実行前に全条件をクリアしていることを確認すること。

| #   | 条件                                                           | 確認方法                                                                                                      |
| --- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| 1   | AC-1〜AC-4 のいずれかが未達                                    | Phase 10 最終レビュー結果を確認                                                                               |
| 2   | TypeScript コンパイルエラーが残存している                      | `pnpm --filter @repo/desktop typecheck` の結果を確認                                                          |
| 3   | T-01〜T-06 のいずれかのテストが FAIL                           | `pnpm --filter @repo/desktop test -- --testPathPattern "RuntimeSkillCreatorFacade.executeAsync"` の結果を確認 |
| 4   | Phase 10 最終レビューで MAJOR または CRITICAL が検出されている | `outputs/phase-10/final-review-result.md` を確認                                                              |
| 5   | **ユーザーの明示的な承認が得られていない**                     | ユーザーに確認を取る（最重要）                                                                                |

**現状**: Phase 4〜12 が未実施のため、全条件が未クリア状態。

---

## 実行タスク

- ローカル動作確認依頼: ユーザーにローカルでの動作確認を依頼
- 変更サマリー提示: 変更内容のサマリーを提示し PR 作成の許可を確認
- PR 作成: ユーザーの許可後に `/ai:diff-to-pr` を実行
- CI 確認: CI が通過したことを確認

---

## 参照資料

| 資料名           | パス                                          | 説明            |
| ---------------- | --------------------------------------------- | --------------- |
| 最終レビュー     | `outputs/phase-10/final-review-result.md`     | Phase 10 成果物 |
| 手動テスト結果   | `outputs/phase-11/manual-test-result.md`      | Phase 11 成果物 |
| 手動テスト一覧   | `outputs/phase-11/manual-test-checklist.md`   | Phase 11 成果物 |
| 手動テスト報告   | `outputs/phase-11/manual-test-report.md`      | Phase 11 成果物 |
| 発見課題一覧     | `outputs/phase-11/discovered-issues.md`       | Phase 11 成果物 |
| ドキュメント変更 | `outputs/phase-12/documentation-changelog.md` | Phase 12 成果物 |
| 実装ガイド       | `outputs/phase-12/implementation-guide.md`    | PR コメント用   |

---

## 実行手順

### 手順 1: ユーザーにローカル動作確認を依頼【必須】

PR 作成前に、ユーザーにローカル環境での動作確認を依頼する。

確認依頼内容の例:

> Phase 4〜12 が完了しました。PR 作成前に以下の動作確認をお願いします。
>
> 1. `pnpm --filter @repo/desktop typecheck` が PASS すること
> 2. `pnpm --filter @repo/desktop test -- --testPathPattern "RuntimeSkillCreatorFacade.executeAsync"` で T-01〜T-06 が全て PASS すること
> 3. ローカルで実際にスキル実行を試し、エラー時にエラーメッセージが IPC 経由で届くことを確認すること（任意）

### 手順 2: 変更サマリーの提示と許可確認【必須】

ユーザーに以下のサマリーを提示し、PR 作成の許可を得る。

**重要**: ユーザーから明示的な「PR を作成してください」等の許可発言を得るまで、PR 作成コマンドを実行しないこと。

---

### PR タイトル（承認後に使用）

```
fix(runtime): executeAsync() でのエラーメッセージ伝搬パス統一 (TASK-UT-RT-01-EXECUTE-ASYNC-SNAPSHOT-ERROR-MESSAGE-001)
```

---

### PR 本文テンプレート（承認後に使用）

````markdown
## 変更サマリー

- `RuntimeSkillCreatorFacade.executeAsync()` の structured error パスと catch パスにおいて、`onWorkflowStateSnapshot` へのエラーメッセージ伝搬が `snapshot` の有無に依存していた問題を修正
- `if (!snapshot)` 条件を削除し、snapshot の有無に関わらず常に `onWorkflowStateSnapshot` を呼び出すよう統一
- IPC シグネチャ・型定義の変更なし（内部ロジックのみの修正）

## 修正箇所

### Before（structured error パス）

```typescript
if (isStructuredError) {
  const errorResponse =
    executeResult as RuntimeSkillCreatorExecuteErrorResponse;
  const snapshot = this.workflowEngine.getWorkflowState(planId);
  if (!snapshot) {
    this.onWorkflowStateSnapshot?.(planId, null, errorResponse.error.message);
  }
}
```
````

### After（structured error パス）

```typescript
if (isStructuredError) {
  const errorResponse =
    executeResult as RuntimeSkillCreatorExecuteErrorResponse;
  const snapshot = this.workflowEngine.getWorkflowState(planId);
  this.onWorkflowStateSnapshot?.(
    planId,
    snapshot ?? null,
    errorResponse.error.message,
  );
}
```

catch パスも同様の修正（`if (!snapshot)` 条件の削除）。

## テスト結果

| テスト ID | シナリオ                                     | 結果 |
| --------- | -------------------------------------------- | ---- |
| T-01      | structured error パス: エラーメッセージ伝搬  | PASS |
| T-02      | structured error パス: snapshot あり時も伝搬 | PASS |
| T-03      | terminal_handoff パス: 第3引数は undefined   | PASS |
| T-04      | success パス: 第3引数は undefined            | PASS |
| T-05      | catch パス: 例外スロー時の伝搬               | PASS |
| T-06      | catch パス: snapshot あり時も伝搬            | PASS |

## 関連 Issue

Closes #1897

## テストプラン

- [ ] `pnpm --filter @repo/desktop typecheck` が PASS すること（AC-3）
- [ ] `pnpm --filter @repo/desktop lint` が PASS すること
- [ ] `pnpm --filter @repo/desktop test -- --testPathPattern "RuntimeSkillCreatorFacade.executeAsync"` で T-01〜T-06 が全て PASS すること（AC-4）
- [ ] structured error（`success: false`）時に `onWorkflowStateSnapshot` にエラーメッセージが渡されることを確認（AC-1）
- [ ] catch 例外時に `onWorkflowStateSnapshot` にエラーメッセージが渡されることを確認（AC-2）
- [ ] 既存の terminal_handoff / success パスの動作が壊れていないことを回帰テストで確認

```

---

### 手順 3: `/ai:diff-to-pr` を実行

ユーザーの許可を得た後、以下のコマンドで PR 作成を実行する。

```

/ai:diff-to-pr

````

`/ai:diff-to-pr` 実行時の自動投稿内容:

1. **PR 本文**（上記テンプレート準拠）
2. **PR コメント 1**: 実装詳細・レビュー注意点・テスト方法
3. **PR コメント 2**: `outputs/phase-12/implementation-guide.md` の全文
4. スクリーンショットギャラリー: **なし**（NON_VISUAL タスクのため）

> UI/UX 変更がないため PR 本文の `## スクリーンショット` セクションは削除する。

### 手順 4: 実行結果の確認

- [ ] PR が作成されていること
- [ ] CI（GitHub Actions）が通過していること
- [ ] レビュー担当者がアサインされていること

### 手順 5: タスクディレクトリの移動【PR 承認・マージ後】

PR がマージされた後、タスクディレクトリを完了タスクフォルダに移動する。

```bash
# タスクディレクトリを completed-tasks に移動
mv docs/30-workflows/task-ut-rt-01-execute-async-snapshot-error-message-001/ \
   docs/30-workflows/completed-tasks/

# 移動を確認
ls docs/30-workflows/completed-tasks/ | grep task-ut-rt-01-execute-async-snapshot-error-message-001

# 変更をコミット
git add docs/30-workflows/
git commit -m "docs(workflows): task-ut-rt-01-execute-async-snapshot-error-message-001 を completed-tasks に移動"
git push
````

---

## 成果物

| 成果物           | パス                                     | 説明                               |
| ---------------- | ---------------------------------------- | ---------------------------------- |
| PR 情報          | `outputs/phase-13/pr-info.md`            | PR URL・PR 番号・CI ステータス     |
| ローカル確認結果 | `outputs/phase-13/local-check-result.md` | typecheck / lint / test の実行結果 |
| 変更サマリー     | `outputs/phase-13/change-summary.md`     | ユーザーへ提示した変更サマリー     |
| PR 作成結果      | `outputs/phase-13/pr-creation-result.md` | PR 作成成功・CI 通過の確認ログ     |

---

## 完了条件

- [ ] ユーザーにローカル動作確認を依頼している
- [ ] 変更サマリーを提示し PR 作成の許可を得ている
- [ ] AC-1〜AC-4 が全て達成されている
- [ ] TypeScript コンパイルエラーが 0 件（typecheck PASS）
- [ ] T-01〜T-06 が全て PASS
- [ ] 全変更がコミットされている
- [ ] PR が作成されている（タイトル・本文テンプレート準拠）
- [ ] CI が通過している
- [ ] レビュー準備が完了している
- [ ] タスクディレクトリが `completed-tasks/` に移動されている（マージ後）
- [ ] **本 Phase 内の全作業を 100% 完了（PR 作成・CI 確認・移動）**

---

## Phase 末端アクション【必須】

- [ ] Phase 13 内の全作業を 100% 実行完了
- [ ] `outputs/phase-13/pr-info.md` に PR URL を記録
- [ ] CI 通過を確認し記録
- [ ] タスクディレクトリの移動完了を確認

---

## 次 Phase

Phase 13 はタスクの最終フェーズ。完了後、タスクは closed となる。
