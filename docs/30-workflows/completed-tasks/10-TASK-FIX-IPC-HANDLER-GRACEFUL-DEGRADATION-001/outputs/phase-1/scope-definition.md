# スコープ定義: IPC Handler Graceful Degradation

## メタ情報

| 項目     | 値                                               |
| -------- | ------------------------------------------------ |
| タスクID | 10-TASK-FIX-IPC-HANDLER-GRACEFUL-DEGRADATION-001 |
| Phase    | 1 - 要件定義                                     |
| 作成日   | 2026-03-08                                       |

## 実装範囲（In Scope）

### IS-01: safeRegister ヘルパー関数の新規作成

- `apps/desktop/src/main/ipc/index.ts` 内にモジュールスコープの関数として定義
- 引数: `handlerName: string`, `registerFn: () => void`
- 戻り値: `HandlerRegistrationFailure | null`
- try-catch で `registerFn()` を実行し、例外時に構造化されたエラー情報を返却

### IS-02: registerAllIpcHandlers のリファクタリング

- 各 `registerXxxHandlers()` 呼び出しを `safeRegister()` でラップ
- 依存関係のあるハンドラ群（Supabase条件分岐、authKeyService依存等）は1つの `safeRegister` ブロックで囲むか、依存元の失敗時に依存先をスキップするロジックを導入
- `themeWatcherUnsubscribe` のキャプチャは `safeRegister` 外で個別 try-catch
- 戻り値として `IpcHandlerRegistrationResult` を返却

### IS-03: 型定義の追加

- `HandlerRegistrationFailure` インターフェース
- `IpcHandlerRegistrationResult` インターフェース
- 同ファイル内に定義（エクスポートあり）

### IS-04: ログ出力の追加

- 個別失敗時: `console.error` でハンドラ名・エラー詳細を出力
- 全体サマリー（失敗あり）: `console.warn` で失敗数と失敗ハンドラ名一覧を出力
- 全体サマリー（全成功）: `console.info` で正常完了ログを出力

## 除外範囲（Out of Scope）

### OS-01: unregisterAllIpcHandlers の変更

- `ipcMain.removeHandler()` は未登録チャンネルでもエラーを出さないため、変更不要
- 一部ハンドラが未登録の状態でも安全に全チャンネルを走査できる

### OS-02: 各 registerXxxHandlers 関数の内部変更

- 各ハンドラ登録関数の内部実装は変更しない
- 例外隔離は `registerAllIpcHandlers` レベルで行う

### OS-03: リトライ機構の導入

- 失敗したハンドラの再登録を自動的に試みるリトライ機構は本タスクの範囲外
- 将来のタスクとして検討可能

### OS-04: Renderer への失敗通知

- ハンドラ登録失敗を Renderer プロセスに通知する機構は本タスクの範囲外
- 失敗情報は Main Process のログに記録するのみ

### OS-05: ハンドラ登録関数のユニットテストの追加

- 各 `registerXxxHandlers` 関数自体のテストは本タスクの範囲外
- 本タスクでは `safeRegister` ヘルパーと `registerAllIpcHandlers` の例外隔離のテストのみ

### OS-06: electron-log 等のロガーライブラリ導入

- ログ出力は `console.error` / `console.warn` / `console.info` を使用
- 構造化ログライブラリの導入は本タスクの範囲外

## 依存関係

| 依存先                               | 種別     | 影響                                                     |
| ------------------------------------ | -------- | -------------------------------------------------------- |
| `apps/desktop/src/main/ipc/index.ts` | 変更対象 | `registerAllIpcHandlers` のリファクタリング              |
| 各 `registerXxxHandlers` 関数        | 参照のみ | インターフェース変更なし                                 |
| `unregisterAllIpcHandlers`           | 参照のみ | 変更なし                                                 |
| 既存の呼び出し元                     | 後方互換 | 戻り値追加のみ（既存コードは戻り値未使用のため影響なし） |
