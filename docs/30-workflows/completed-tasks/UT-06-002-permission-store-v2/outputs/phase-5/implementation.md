# Phase 5: 実装結果

## メタ情報

| 項目     | 値                            |
| -------- | ----------------------------- |
| Phase    | 5                             |
| 機能名   | UT-06-002-permission-store-v2 |
| 完了日   | 2026-03-23                    |
| タスクID | UT-06-002                     |

## 実行結果

### Task 5-1: 共有型定義の拡張 — 完了

`packages/shared/src/types/permission-store.ts` に以下を追加:

- `ExpiryPolicy` 型
- `AllowedToolEntryV2` インターフェース
- `calcExpiresAt()` 関数
- `IPermissionStoreV2` インターフェース
- `PermissionStoreSchemaV2` インターフェース
- `PERMISSION_HISTORY_MAX_ENTRIES` 定数
- `ClearSessionResponse` 型

`packages/shared/src/types/index.ts` にエクスポート追加済み。

### Task 5-2: PermissionStore V2 実装 — 完了

`apps/desktop/src/main/services/skill/PermissionStore.ts`:

- `IPermissionStoreV2` を implements
- `toolCache` 型を `Map<string, AllowedToolEntryV2>` に変更
- `isToolAllowed(toolName, skillName?)` 6分岐フロー実装
- `allowToolV2(entry)` 実装（session/permanent の expiresAt 強制リセット含む）
- `revokeSessionEntries(sessionId)` を session スコープ限定削除に変更
- `getAllowedToolEntriesV2()` 実装（期限切れ自動削除）
- `migrateV1ToV2()` 実装
- `initializeCache()` に V1→V2 マイグレーション判定追加
- `updateStore()` を V2 スキーマ出力に更新
- `calcExpiresAtLocal()` ローカル実装（ESM/CJS 解決問題の回避）

### Task 5-3: IPC チャンネル追加 — 完了

`apps/desktop/src/preload/channels.ts`:

- `PERMISSION_CLEAR_SESSION: "permission:clear-session"` 追加
- `ALLOWED_INVOKE_CHANNELS` ホワイトリストに追加

### Task 5-4: IPC ハンドラ追加 — 完了

`apps/desktop/src/main/ipc/permission-store-handlers.ts`:

- `permission:clear-session` ハンドラ追加（P42準拠 3段バリデーション）
- `unregisterPermissionStoreHandlers()` にクリーンアップ追加
- ハンドラ数: 3 → 4

### Task 5-5: セッション終了フック — 保留

`app.on('before-quit')` フックは `apps/desktop/src/main/index.ts` への変更が必要。
このタスクのスコープでは PermissionStore に `revokeSessionEntries` メソッドが実装済みなので、
フックの配線は index.ts の構造を確認した上で Phase 8 以降で対応。

## テスト結果

| テストファイル                                                           | テスト数 | 結果         |
| ------------------------------------------------------------------------ | -------- | ------------ |
| `packages/shared/src/types/__tests__/permission-store.test.ts`           | 10       | ALL PASS     |
| `apps/desktop/src/main/services/skill/__tests__/PermissionStore.test.ts` | 52       | ALL PASS     |
| `apps/desktop/src/main/ipc/__tests__/permission-store-handlers.test.ts`  | 26       | ALL PASS     |
| **合計**                                                                 | **88**   | **ALL PASS** |

## 完了条件

- [x] AllowedToolEntryV2 型が @repo/shared からエクスポートされている
- [x] calcExpiresAt() が正しく動作する
- [x] PermissionStore.isToolAllowed() が6分岐フローで動作する
- [x] PermissionStore.allowToolV2() が V2 エントリを保存する
- [x] PermissionStore.revokeSessionEntries() が session スコープのみ削除する
- [x] permission:clear-session IPC チャンネルが登録されている
- [ ] before-quit でセッションエントリがクリアされる（Phase 8 で配線）
- [x] V1→V2 マイグレーションが動作する
- [x] Phase 4 のテストが全て PASS する
