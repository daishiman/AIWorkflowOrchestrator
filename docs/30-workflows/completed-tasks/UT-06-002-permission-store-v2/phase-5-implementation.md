# Phase 5: 実装

## メタ情報

| 項目     | 値                            |
| -------- | ----------------------------- |
| Phase    | 5                             |
| 機能名   | UT-06-002-permission-store-v2 |
| 作成日   | 2026-03-23                    |
| タスクID | UT-06-002                     |

## 目的

Phase 2 設計書と Phase 4 テストケースに基づき、PermissionStore V2 のプロダクションコードを実装する（TDD: Green フェーズ）。

## 実行タスク

- Task 5-1: 共有型定義の拡張（`@repo/shared`） — AllowedToolEntryV2, ExpiryPolicy, calcExpiresAt, IPermissionStoreV2, PermissionStoreSchemaV2 追加
- Task 5-2: PermissionStore V2 実装 — isToolAllowed 6分岐フロー、allowToolV2、revokeSessionEntries、V1→V2 マイグレーション
- Task 5-3: IPC チャンネル追加 — channels.ts に PERMISSION_CLEAR_SESSION 定数追加
- Task 5-4: IPC ハンドラ追加 — permission:clear-session ハンドラ実装（P42準拠 3段バリデーション + sender 検証）
- Task 5-5: セッション終了フック — app.on('before-quit') で revokeSessionEntries("app-quit") を呼び出し

## 参照資料

| 資料名     | パス                                                                                                                              | 説明                        |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------- | --------------------------- |
| 設計書     | `outputs/phase-2/design.md`                                                                                                       | Phase 2 設計                |
| テスト設計 | `outputs/phase-4/test-design.md`                                                                                                  | Phase 4 テスト              |
| Phase 5 IF | `docs/30-workflows/completed-tasks/step-05-par-task-06-trust-permission-governance/outputs/phase-5/permission-store-interface.ts` | V2 インターフェース正式定義 |

## 実行手順

### ステップ1: 共有型定義の拡張

`packages/shared/src/types/permission-store.ts` に V2 型定義を追加し、`pnpm --filter @repo/shared build` で確認。

### ステップ2: PermissionStore V2 実装

既存 `PermissionStore.ts` をその場で拡張。実装順序: Task 5-1 → 5-2 → 5-3 → 5-4 → 5-5。

### ステップ3: テスト実行

各 Task 完了後にテストを実行し、Green 状態を確認する。

## 統合テスト連携

```bash
# Task 5-1 完了後
pnpm --filter @repo/shared test

# Task 5-2 完了後
pnpm --filter @repo/desktop test src/main/services/skill/__tests__/PermissionStore.test.ts

# Task 5-4 完了後
pnpm --filter @repo/desktop test src/main/ipc/__tests__/permission-store-handlers.test.ts
```

## 多角的チェック観点

| 観点                 | 適用 | 確認内容                                                          |
| -------------------- | ---- | ----------------------------------------------------------------- |
| セキュリティ         | 適用 | P42準拠 3段バリデーション実装、sender 検証実装                    |
| アーキテクチャ       | 適用 | レイヤー依存方向、DIP 準拠                                        |
| IPC通信              | 適用 | チャンネル定数使用、ホワイトリスト登録、ハンドラ登録/解除の対称性 |
| Preload/セキュリティ | 適用 | channels.ts のホワイトリスト追加                                  |
| ローカルストレージ   | 適用 | electron-store スキーマ V2 + マイグレーション                     |

## 成果物

| 成果物     | パス                                | 説明         |
| ---------- | ----------------------------------- | ------------ |
| 実装仕様書 | `outputs/phase-5/implementation.md` | 実装結果記録 |

## 完了条件

- [ ] AllowedToolEntryV2 型が `@repo/shared` からエクスポートされている
- [ ] calcExpiresAt() が正しく動作する
- [ ] PermissionStore.isToolAllowed() が6分岐フローで動作する
- [ ] PermissionStore.allowToolV2() が V2 エントリを保存する
- [ ] PermissionStore.revokeSessionEntries() が session スコープのみ削除する
- [ ] permission:clear-session IPC チャンネルが登録されている
- [ ] before-quit でセッションエントリがクリアされる
- [ ] V1→V2 マイグレーションが動作する
- [ ] Phase 4 のテストが全て PASS する
- [ ] pnpm typecheck が PASS する
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 6: テスト拡充
