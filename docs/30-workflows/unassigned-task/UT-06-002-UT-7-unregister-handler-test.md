# UT-06-002-UT-7: unregisterPermissionStoreHandlers テスト追加

| 項目     | 値             |
| -------- | -------------- |
| タスクID | UT-06-002-UT-7 |
| 優先度   | 低             |
| 元タスク | UT-06-002      |
| 検出日   | 2026-03-23     |

---

## 概要

`permission-store-handlers.ts` の `unregisterPermissionStoreHandlers()` 関数がテストされていないため、Function Coverage が 50%（基準80%未達）。`ipcMain.removeHandler` が4チャンネル分呼ばれることを確認するテストを追加する。

## 背景・苦戦箇所

2関数中1関数のみテスト済みの状態である。登録（`registerPermissionStoreHandlers`）のテストは充実しているが、解除（`unregisterPermissionStoreHandlers`）のテストが完全に欠落している。

P5（リスナー二重登録防止）の対策として unregister は重要な機能であり、テストがないと二重登録問題が検出できない。`ipcMain.handle()` は同一チャンネルへの二重登録で例外を送出するため、`unregisterPermissionStoreHandlers` が正しく全チャンネルを解除できているかの検証は必須である。

Function Coverage の基準は最低 80%・推奨 90% であり、現状の 50% は最低基準を大きく下回っている。

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
