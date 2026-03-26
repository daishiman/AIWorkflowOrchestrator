# [#1532] [UT-06-002-UT-6] ハンドラ引数型 IPermissionStoreV2 化 + as unknown as キャスト解消

## メタ情報

```yaml
issue_number: 1532
title: [UT-06-002-UT-6] ハンドラ引数型 IPermissionStoreV2 化 + as unknown as キャスト解消
state: OPEN
priority: 低
scale: -
category: リファクタリング
status: 未実施
created_date: 2026-03-23
updated_date: 2026-03-23
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/1532
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 低     |
| 規模       | -      |
| ステータス | 未実施 |

---

## 概要

以下の2点を解消する。

1. `registerPermissionStoreHandlers` の引数型が `IPermissionStore`（V1）のままで `IPermissionStoreV2` に変更が必要。
2. `updateStore()` 内の `this.store.set(schema as unknown as PermissionStoreSchema)` キャストが型安全でない。

## 対応方針

1. `registerPermissionStoreHandlers` の引数型を `IPermissionStore` から `IPermissionStoreV2` に変更する。
2. `revokeSessionEntries?.()` のオプショナルチェーン（`?.`）を通常の呼び出し（`.`）に変更する。
3. `new ElectronStore<PermissionStoreSchema>` の型パラメータを `new ElectronStore<PermissionStoreSchemaV2>` に変更する。
4. `this.store.set(schema as unknown as PermissionStoreSchema)` の `as unknown as` キャストを除去する。

## 変更対象ファイル

| ファイル                                                                 | 変更種別 |
| ------------------------------------------------------------------------ | -------- |
| `apps/desktop/src/main/ipc/permission-store-handlers.ts`                 | 修正     |
| `apps/desktop/src/main/services/skill/PermissionStore.ts`                | 修正     |
| `apps/desktop/src/main/ipc/__tests__/permission-store-handlers.test.ts`  | 修正     |
| `apps/desktop/src/main/services/skill/__tests__/PermissionStore.test.ts` | 修正     |

## 完了条件

- [ ] `registerPermissionStoreHandlers` の引数型が `IPermissionStoreV2` になっている
- [ ] `revokeSessionEntries?.()` のオプショナルチェーンが除去されている
- [ ] `as unknown as` キャストが除去されている
- [ ] `pnpm typecheck` が PASS する
- [ ] 関連テストが PASS する

---

**元タスク**: UT-06-002 | **検出日**: 2026-03-23
