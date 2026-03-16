# UT-06-005-B: revokeSessionEntries セッション別本格実装

## メタ情報

| 項目     | 内容                                  |
| -------- | ------------------------------------- |
| タスクID | UT-06-005-B                           |
| 優先度   | 中                                    |
| 検出元   | UT-06-005 Phase 12 レビュー（GAP-04） |
| 関連     | UT-06-005                             |
| 作成日   | 2026-03-16                            |

## 概要

現在の `revokeSessionEntries` は全エントリクリアのスタブ実装になっている。`AllowedToolEntry` に `sessionId` フィールドを追加し、セッション別フィルタリングを実装する。

## 目的

- abort 時に現在のセッションのエントリのみを revoke し、他のセッションの許可が影響を受けないようにする
- セッション分離により、複数スキルの並行実行時に誤った許可剥奪が起きないようにする

## 要件

1. `AllowedToolEntry` に `sessionId?: string` フィールドを追加する
2. `PermissionStore.revokeSessionEntries` で `sessionId` に基づくフィルタリングを実装する（全クリアではなく、当該 sessionId のエントリのみ削除）
3. abort 時に他のセッションの許可が影響を受けないことをテストで検証する
4. `sessionId` 未設定エントリの後方互換性を保つこと（`sessionId` が undefined の場合のふるまいを定義する）

## 対象ファイル

- `apps/desktop/src/main/services/skill/PermissionStore.ts`
- `packages/shared/src/types/permission-store.ts`（または型定義が存在するファイル）

## 依存タスク

- UT-06-005（完了済み: revokeSessionEntries スタブ実装）

## 完了条件

- [ ] `AllowedToolEntry` に `sessionId?: string` フィールドが追加されていること
- [ ] `revokeSessionEntries(sessionId)` が当該 sessionId のエントリのみを削除すること
- [ ] セッション A の abort がセッション B のエントリに影響しないことがテストで検証されること
- [ ] `sessionId` 未設定時の後方互換性が文書化されていること
- [ ] 既存テストが全 PASS であること

## 参照資料

- `docs/30-workflows/UT-06-005-abort-skip-retry-fallback/` （本タスクの完了成果物）
- `apps/desktop/src/main/services/skill/PermissionStore.ts`
