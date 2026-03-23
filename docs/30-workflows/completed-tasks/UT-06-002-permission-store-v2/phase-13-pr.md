# Phase 13: PR作成

## メタ情報

| 項目     | 値                            |
| -------- | ----------------------------- |
| Phase    | 13                            |
| 機能名   | UT-06-002-permission-store-v2 |
| 作成日   | 2026-03-23                    |
| タスクID | UT-06-002                     |

## 目的

変更をコミットし、ユーザーの明示的な許可を得てから Pull Request を作成し、CI を確認する。

## 実行タスク

- Task 13-1: ローカル動作確認依頼 — ユーザーにローカルでの動作確認を依頼
- Task 13-2: 変更サマリー提示 — 変更内容のサマリーを提示し PR 作成の許可を確認
- Task 13-3: PR作成 — ユーザーの許可後に `/ai:diff-to-pr` を実行
- Task 13-4: CI確認 — CI が通過したことを確認
- Task 13-5: タスク完了処理 — タスクディレクトリを completed-tasks に移動

## 参照資料

| 資料名       | パス                                          | 説明            |
| ------------ | --------------------------------------------- | --------------- |
| 最終レビュー | `outputs/phase-10/final-review-result.md`     | Phase 10 成果物 |
| 手動テスト   | `outputs/phase-11/phase-11-manual-test.md`    | Phase 11 成果物 |
| ドキュメント | `outputs/phase-12/documentation-changelog.md` | Phase 12 成果物 |

## 実行手順

### ステップ1: ユーザーにローカル動作確認を依頼

```bash
pnpm --filter @repo/desktop test
pnpm typecheck
pnpm lint
```

### ステップ2: 変更サマリーの提示と許可確認

| #   | 変更ファイル                                              | 変更内容                                                     |
| --- | --------------------------------------------------------- | ------------------------------------------------------------ |
| 1   | `packages/shared/src/types/permission-store.ts`           | AllowedToolEntryV2, calcExpiresAt, IPermissionStoreV2 型追加 |
| 2   | `apps/desktop/src/main/services/skill/PermissionStore.ts` | V2 拡張                                                      |
| 3   | `apps/desktop/src/main/ipc/permission-store-handlers.ts`  | permission:clear-session ハンドラ追加                        |
| 4   | `apps/desktop/src/preload/channels.ts`                    | PERMISSION_CLEAR_SESSION チャンネル追加                      |
| 5   | テストファイル                                            | V2 テスト追加                                                |

**重要**: ユーザーから明示的な許可を得るまで PR 作成を実行しないこと。

### ステップ3: `/ai:diff-to-pr` を実行

PR 本文に含める内容:

- Issue: Closes #1297
- 変更タイプ: feat（新機能）
- テスト: V2 テスト全 PASS、既存テスト回帰なし
- 破壊的変更: なし（V1 後方互換性あり）

### ステップ4: タスク完了処理

```bash
mv docs/30-workflows/UT-06-002-permission-store-v2/ docs/30-workflows/completed-tasks/
git add docs/30-workflows/
git commit -m "docs(workflows): UT-06-002-permission-store-v2をcompleted-tasksに移動"
```

## 多角的チェック観点

| 観点           | 適用   | 確認内容                |
| -------------- | ------ | ----------------------- |
| セキュリティ   | 非適用 | Phase 13 は PR 作成のみ |
| アーキテクチャ | 非適用 | コード変更なし          |

## 成果物

| 成果物 | パス                          | 説明     |
| ------ | ----------------------------- | -------- |
| PR情報 | `outputs/phase-13/pr-info.md` | PR URL等 |

## 完了条件

- [ ] ユーザーにローカル動作確認を依頼している
- [ ] 変更サマリーを提示し PR 作成の許可を得ている
- [ ] 全変更がコミットされている
- [ ] PR が作成されている
- [ ] CI が通過している
- [ ] タスクディレクトリが completed-tasks に移動されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

なし（最終Phase）
