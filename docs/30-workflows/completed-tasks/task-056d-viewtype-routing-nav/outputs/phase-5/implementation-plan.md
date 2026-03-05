# Phase 5 実装計画（SubAgent-B）

## 編集順序（実施済み）

1. `navigation/navContract.ts` 新規作成
2. `AppDock/index.tsx` で契約参照化
3. `App.tsx` にショートカットイベント処理追加
4. テスト追加（`navigation/navContract.test.ts`）
5. 既存integrationテスト更新

## 実装対象外

- GlobalNavStrip本体
- IPC/Preload/Mainのチャンネル追加
