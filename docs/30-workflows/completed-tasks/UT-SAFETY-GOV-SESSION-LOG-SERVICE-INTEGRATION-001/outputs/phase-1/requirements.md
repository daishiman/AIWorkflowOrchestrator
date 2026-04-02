# Phase 1 成果物: 要件定義サマリ

## 調査結果

- **placeholder 箇所**: `apps/desktop/src/main/ipc/index.ts:920-929`
- **セッションログの実体**: `SessionManager.Session.output: string[]`
- **接続手段の問題**: `ClaudeCliManager` が `claude-cli/ipc-handler.ts` のモジュールスコープに閉鎖

## 確定した要件

| FR   | 内容                                                                          |
| ---- | ----------------------------------------------------------------------------- |
| FR-1 | `getTerminalLog(sessionId)` → `SessionManager.getSession(id).output`          |
| FR-2 | `getCopyCommand(sessionId)` → `["node", scriptPath, ...args].join(" ")`       |
| FR-3 | セッション未存在時: `SESSION_NOT_FOUND` エラーコードで throw                  |
| FR-4 | 全レスポンスに `sanitizeForApiKeys()` 適用（既存実装を維持）                  |
| FR-5 | `getClaudeCliManager()` ゲッターを `claude-cli/ipc-handler.ts` にエクスポート |

## 変更スコープ（最小）

- `apps/desktop/src/main/claude-cli/ipc-handler.ts` (+4 行)
- `apps/desktop/src/main/ipc/index.ts` (+20 行、placeholder 9 行を差し替え)
