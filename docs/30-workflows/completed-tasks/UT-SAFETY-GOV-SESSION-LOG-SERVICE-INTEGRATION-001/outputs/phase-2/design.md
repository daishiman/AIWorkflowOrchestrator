# Phase 2 成果物: 設計サマリ

## 設計方針

Phase 1 の「ClaudeCliManager がモジュール閉鎖になっている」問題をゲッター関数で解決。

## 変更内容

### 1. `claude-cli/ipc-handler.ts`

```typescript
export function getClaudeCliManager(): ClaudeCliManager | null {
  return manager;
}
```

- `manager` を直接エクスポートすると外部から上書き可能なため、ゲッターでカプセル化
- null を返す可能性を型に明示し、呼び出し側で未初期化を安全に処理

### 2. `ipc/index.ts`

- `getClaudeCliManager()` をインポート
- `registerAdvancedConsoleHandlers` の callback を実実装に差し替え
- `sessionNotFoundError()` ヘルパー関数で重複排除（Phase 8 リファクタリングを前倒し）

## エラーコード設計

| コード               | 発生条件                             |
| -------------------- | ------------------------------------ |
| `SESSION_NOT_FOUND`  | `mgr.getSession()` が success: false |
| `TERMINAL_LOG_ERROR` | handler catch での変換後コード       |
| `COPY_COMMAND_ERROR` | handler catch での変換後コード       |

## 承認: PASS → Phase 4 へ進む
