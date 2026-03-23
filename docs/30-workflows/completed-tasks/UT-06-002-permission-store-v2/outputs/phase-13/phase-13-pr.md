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

## 参照資料

| 資料名       | パス                                          | 説明            |
| ------------ | --------------------------------------------- | --------------- |
| 最終レビュー | `outputs/phase-10/final-review-result.md`     | Phase 10 成果物 |
| 手動テスト   | `outputs/phase-11/phase-11-manual-test.md`    | Phase 11 成果物 |
| ドキュメント | `outputs/phase-12/documentation-changelog.md` | Phase 12 成果物 |

## 実行手順

### 1. ユーザーにローカル動作確認を依頼

PR 作成前に、ユーザーにローカル環境での動作確認を依頼する。

**確認依頼内容**:

- `pnpm --filter @repo/desktop test` で全テスト PASS を確認
- `pnpm typecheck` で型エラー 0件を確認
- `pnpm lint` で ESLint エラー 0件を確認

### 2. 変更サマリーの提示と許可確認

**変更サマリー**:

| #   | 変更ファイル                                              | 変更内容                                                      |
| --- | --------------------------------------------------------- | ------------------------------------------------------------- |
| 1   | `packages/shared/src/types/permission-store.ts`           | AllowedToolEntryV2, calcExpiresAt, IPermissionStoreV2 型追加  |
| 2   | `apps/desktop/src/main/services/skill/PermissionStore.ts` | V2 拡張（6分岐 isToolAllowed, allowToolV2, マイグレーション） |
| 3   | `apps/desktop/src/main/ipc/permission-store-handlers.ts`  | permission:clear-session ハンドラ追加                         |
| 4   | `apps/desktop/src/preload/channels.ts`                    | PERMISSION_CLEAR_SESSION チャンネル追加                       |
| 5   | テストファイル                                            | V2 テスト追加                                                 |

**重要**: ユーザーから明示的な許可を得るまで PR 作成を実行しないこと。

### 3. `/ai:diff-to-pr` を実行

ユーザーの許可を得た後、PR 作成を実行する。

```
/ai:diff-to-pr
```

**PR 本文に含める内容**:

- Issue: Closes #1297
- 変更タイプ: feat（新機能）
- テスト: V2 テスト全 PASS、既存テスト回帰なし
- 破壊的変更: なし（V1 後方互換性あり）

**PR コメント**:

1. 実装の詳細・レビュー注意点
2. `implementation-guide.md` の全文

### 4. 実行結果の確認

- PR が作成されていること
- CI が通過していること

### 5. タスク完了処理

```bash
mv docs/30-workflows/UT-06-002-permission-store-v2/ docs/30-workflows/completed-tasks/
git add docs/30-workflows/
git commit -m "docs(workflows): UT-06-002-permission-store-v2をcompleted-tasksに移動"
```

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
