# Phase 5: 実装レポート

## タスク情報

- **タスクID**: TASK-FIX-IPC-HANDLER-GRACEFUL-DEGRADATION-001
- **Phase**: 5 (実装)
- **対象ファイル**: `apps/desktop/src/main/ipc/index.ts`

## 実装内容

### 1. Graceful Degradation の導入

- `HandlerRegistrationFailure` と `IpcHandlerRegistrationResult` を追加
- `registerAllIpcHandlers()` が失敗を蓄積しながら後続登録を継続する構造へ変更
- `setupThemeWatcher()` は unsubscribe を保持する都合上、個別 try-catch で管理

### 2. ログと失敗情報の最小化

- `safeRegister()` が失敗ハンドラ名とサニタイズ済みエラーメッセージを記録
- ユーザーホーム配下の絶対パスは `~` にマスクし、スタックトレースは出力しない
- 失敗サマリーは登録完了後に 1 回だけ出力する

### 3. 解除対称性の維持

- `unregisterAllIpcHandlers()` の既存責務は維持
- 一部未登録状態でも `removeHandler` / `removeAllListeners` / `themeWatcherUnsubscribe` が安全に実行される

## テスト結果

### 実装直後

```text
Test Files  2 passed (2)
Tests       26 passed (26)
```

- 新規テスト: 12 tests (`ipc-graceful-degradation.test.ts`)
- 既存回帰: 14 tests (`ipc-double-registration.test.ts`)

### 2026-03-08 再監査時

```text
Test Files  2 passed (2)
Tests       33 passed (33)
```

- Graceful Degradation テスト: 19 tests
- 二重登録防止回帰: 14 tests

## 変更ファイル

| ファイル                                                               | 変更内容                                       |
| ---------------------------------------------------------------------- | ---------------------------------------------- |
| `apps/desktop/src/main/ipc/index.ts`                                   | `safeRegister` / 結果返却 / ログサニタイズ追加 |
| `apps/desktop/src/main/ipc/__tests__/ipc-graceful-degradation.test.ts` | Graceful Degradation とログサニタイズの検証    |
