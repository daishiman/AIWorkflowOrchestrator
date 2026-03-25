# UT-06-002-UT-1: permission-store-handlers sender 検証追加

| 項目     | 値             |
| -------- | -------------- |
| タスクID | UT-06-002-UT-1 |
| 優先度   | 中             |
| 元タスク | UT-06-002      |
| 検出日   | 2026-03-23     |

---

## 概要

`permission-store-handlers.ts` の全4ハンドラに `validateIpcSender` を適用する。現在は sender 検証が一切なく、任意の BrowserWindow からのリクエストを受け付けてしまう。

## 背景・苦戦箇所

UT-06-002 の Phase 3 設計レビューで sender 検証不足が MINOR-01 として指摘されたが、既存3ハンドラにも sender 検証がないため本タスクのスコープ外とされた。Phase 10 最終レビューでも再指摘（MINOR-01）。IPC セキュリティの基本原則（04-electron-security.md: 「全ハンドラで送信元ウィンドウを検証」）に従い、既存ハンドラも含めて一括対応が必要。

## 対応方針

各ハンドラの第1引数 `event` から `event.sender` を取得し、`validateIpcSender(event, { getAllowedWindows: () => [mainWindow] })` を呼び出す。mainWindow は DI パターンで注入（P34 参照）。

## 変更対象ファイル

| ファイル                                                                | 変更種別 |
| ----------------------------------------------------------------------- | -------- |
| `apps/desktop/src/main/ipc/permission-store-handlers.ts`                | 修正     |
| `apps/desktop/src/main/ipc/__tests__/permission-store-handlers.test.ts` | 修正     |

## 完了条件

- [ ] 全4ハンドラに validateIpcSender が適用されている
- [ ] 不正 sender からのリクエストが拒否される
- [ ] 関連テストが PASS する
