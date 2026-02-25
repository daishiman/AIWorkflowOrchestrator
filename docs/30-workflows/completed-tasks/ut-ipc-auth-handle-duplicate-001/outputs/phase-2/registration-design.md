# Phase 2 一元化設計書

## 1. 設計目標

- `AUTH_*` 5チャネルの登録処理を宣言的に一元化
- 既存 `withValidation`・戻り値型・エラー構造を維持
- 変更差分を登録層に局所化

## 2. 候補方式比較

| 方式 | 概要                                                   | 長所                 | 短所                   | 判定   |
| ---- | ------------------------------------------------------ | -------------------- | ---------------------- | ------ |
| A    | `authHandlers.ts` に登録エントリ配列を定義しループ登録 | 変更範囲が小さく安全 | ファイル内責務が増える | 採用   |
| B    | 共通ユーティリティへ汎用化（全IPC向け）                | 横展開性が高い       | 今回スコープを超える   | 不採用 |
| C    | 現状維持（重複許容）                                   | 変更リスクなし       | 監査ノイズが解消しない | 不採用 |

## 3. 採用方式（A）

### 3.1 設計要点

- `AuthHandlerRegistration` 相当のエントリ配列を作成
- 各エントリは `channel` と `handler` を持つ
- ループで `ipcMain.handle(channel, withValidation(...))` を適用
- fallback 側も同様に宣言的マップで登録

### 3.2 互換性要件

- チャネル定数: `IPC_CHANNELS.AUTH_*` は変更しない
- 引数型: `AuthLoginRequest` 等の既存形状を維持
- 戻り値: `IPCResponse<T>` 形式を維持
- エラー: `AUTH_ERROR_CODES.*` を維持

### 3.3 拡張手順（将来チャネル追加）

1. エントリ配列へ1行追加
2. 対応ハンドラ関数を追加
3. 回帰ケース（正常系/異常系）を1件ずつ追加

## 4. 実装対象ファイル

- `apps/desktop/src/main/ipc/authHandlers.ts`
- `apps/desktop/src/main/ipc/index.ts`（fallback登録）
- `apps/desktop/src/main/ipc/authHandlers.test.ts`（必要に応じて）
- `apps/desktop/src/main/ipc/__tests__/index.auth-fallback.test.ts`（新規）
