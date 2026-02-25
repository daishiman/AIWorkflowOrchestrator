# Phase 1 要件定義

## 1. 目的

`AUTH_*` の `ipcMain.handle` 登録重複式（5件）を一元化し、認証IPC契約の追跡性と監査再現性を向上させる。

## 2. 現状調査結果

### 2.1 重複式の対象（5件で固定）

`apps/desktop/src/main/ipc/authHandlers.ts` にて、同一パターン
`ipcMain.handle(IPC_CHANNELS.AUTH_*, withValidation(...))` が5件存在する。

- `AUTH_LOGIN`
- `AUTH_LOGOUT`
- `AUTH_GET_SESSION`
- `AUTH_REFRESH`
- `AUTH_CHECK_ONLINE`

確認コマンド:

```bash
rg -n "ipcMain\.handle\(" apps/desktop/src/main/ipc/authHandlers.ts
```

### 2.2 実施範囲

- `apps/desktop/src/main/ipc/authHandlers.ts` の `AUTH_*` 登録を宣言的に一元化
- `apps/desktop/src/main/ipc/index.ts` の fallback `AUTH_*` 登録も同一方針で一元化
- 既存契約（チャネル名/引数/戻り値/エラー形式）を不変維持
- 既存テストに加えて一元化固有の回帰観点を追加

### 2.3 非範囲

- OAuthフロー仕様変更
- 認証ロジック（Supabase呼び出し、トークン管理）の機能変更
- Renderer UI/Preload API のインターフェース変更
- `AUTH_*` 以外のIPCチャネル整理

## 3. 機能要件

- FR-1: `AUTH_*` 5チャネルを単一の登録フローで登録できること
- FR-2: 既存の `withValidation` 適用を維持すること（通常ハンドラ）
- FR-3: fallbackモードでも5チャネルが同様に宣言的に登録されること
- FR-4: 既存戻り値型（`IPCResponse<T>`）を維持すること
- FR-5: 既存エラーコードとメッセージ構造を維持すること

## 4. 非機能要件

- NFR-1: 重複登録式5件を0件にする（対象ファイル内）
- NFR-2: 既存ユニットテストを破壊しない
- NFR-3: 実装差分は認証IPC登録層に局所化する
- NFR-4: 再監査コマンドで同一結果を再現できる

## 5. 統合テスト連携要件

- Main→Preload契約:
  `IPC_CHANNELS.AUTH_*` と `preload/index.ts` の `safeInvoke` 呼び出しを不変維持
- エラー伝播:
  `AUTH_ERROR_CODES` と `error.message` 形式を維持
- 監査再現性:
  `rg` による重複式検出で改善前後の差分が確認可能

## 6. 完了判定

- 対象範囲: 5件固定（達成）
- 非範囲: 明文化済み（達成）
- 受入基準: 別紙 `acceptance-criteria.md` に定義（達成）
- 統合テスト連携: 記録済み（達成）
- 本Phaseタスク100%実行: 達成
