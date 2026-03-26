# [#1533] [UT-06-002-UT-7] unregisterPermissionStoreHandlers テスト追加

## メタ情報

```yaml
issue_number: 1533
title: [UT-06-002-UT-7] unregisterPermissionStoreHandlers テスト追加
state: OPEN
priority: 低
scale: -
category: -
status: 未実施
created_date: 2026-03-23
updated_date: 2026-03-23
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/1533
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 低     |
| 規模       | -      |
| ステータス | 未実施 |

---

## 概要

`permission-store-handlers.ts` の `unregisterPermissionStoreHandlers()` 関数がテストされていないため、Function Coverage が 50%（基準80%未達）。`ipcMain.removeHandler` が4チャンネル分呼ばれることを確認するテストを追加する。

## 対応方針

`permission-store-handlers.test.ts` に `describe("unregisterPermissionStoreHandlers")` ブロックを追加する。`vi.spyOn(ipcMain, "removeHandler")` でモックし、以下の4チャンネル分の呼び出しを検証する。

- `permission:getStore`
- `permission:revokeTool`
- `permission:clearSession`（UT-06-002 で追加）
- その他 UT-06-002 で追加されたチャンネル

## 変更対象ファイル

| ファイル                                                                | 変更種別 |
| ----------------------------------------------------------------------- | -------- |
| `apps/desktop/src/main/ipc/__tests__/permission-store-handlers.test.ts` | 修正     |

## 完了条件

- [ ] `unregisterPermissionStoreHandlers` のテストが追加されている
- [ ] `ipcMain.removeHandler` が全チャンネル分（4チャンネル以上）呼ばれることを検証している
- [ ] Function Coverage が 80% 以上になっている
- [ ] 関連テストが PASS する

---

**元タスク**: UT-06-002 | **検出日**: 2026-03-23
