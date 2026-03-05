# Phase 5 実装計画書

## 実装順序（実施済み）

1. Main IPC 契約整合（`skillHandlers.share.ts`）
2. Main IPC テスト更新（`skillHandlers.share.test.ts`）
3. Preload 契約テスト更新（`skill-api.contract.test.ts`）
4. 手動証跡取得スクリプト追加（`capture-task-043a-phase11-screenshots.mjs`）

## 変更内容

| 項目               | 内容                                                           |
| ------------------ | -------------------------------------------------------------- |
| チャネル参照統一   | unregister/register のハードコードを `IPC_CHANNELS` へ統一     |
| senderエラーコード | sender拒否時 `ERR_2004` を付与                                 |
| 内部例外正規化     | 例外を `INTERNAL_ERROR` + `ERR_5001` + `Internal error` に統一 |
| テスト強化         | Main/Preload 両側で契約境界テストを追加                        |

## ロールバック条件

- 既存 `skill:import` 正常系が失敗する場合
- Preload whitelist で既存チャネルが欠落する場合
