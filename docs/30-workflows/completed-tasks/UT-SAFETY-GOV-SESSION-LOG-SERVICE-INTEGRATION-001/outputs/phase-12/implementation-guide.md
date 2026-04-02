# Phase 12 Implementation Guide

## Part 1: なぜこの変更が必要か

### 日常生活の例え

たとえば、図書館で本を借りたのに、返却窓口に貸出記録が出てこないと、どの本を返せばよいか分かりません。  
いまの Advanced Console も同じで、入口はあるのに、実セッションの記録につながっていません。

なぜ先に理由を説明するかというと、目的がずれると `[]` や `null` のままの仮実装を残しやすいからです。  
先に「何を解決するのか」を固定すれば、後から実装を読んだ人も迷いません。

### この変更で何が変わるか

| いま                                | 変更後                                                             | 利用者への意味                   |
| ----------------------------------- | ------------------------------------------------------------------ | -------------------------------- |
| `getTerminalLog()` が空配列を返す   | 実セッションの `output` を返す                                     | 実際のログが見える               |
| `getCopyCommand()` が `null` を返す | 実起動形式（`node` + `scriptPath` + `args`）を文字列化して返す     | コピーしてそのまま再実行しやすい |
| session 不在の扱いが曖昧            | 内部では `SESSION_NOT_FOUND`、外向きには handler error code を返す | 実装境界と利用者向け契約が分かる |
| 出力の安全性が handler 依存         | `sanitizeForApiKeys()` を維持する                                  | 機密情報を隠せる                 |

## Part 2: 開発者向け詳細

### current contract

- `registerAdvancedConsoleHandlers(...)` は `getTerminalLog` と `getCopyCommand` を受け取る。
- `advancedConsoleHandlers.ts` は返却値に `sanitizeForApiKeys()` を適用する。
- `claude-cli/ipc-handler.ts` は `manager` を保持しているが、外部から取得する getter がない。
- `SessionManager.getSession(sessionId)` は `Session | undefined` を返す。

### target delta

- `ipc/index.ts` から `getClaudeCliManager()` を呼び出す。
- `getSession()` が見つからない場合は callback 内で `SESSION_NOT_FOUND` を throw する。
- `getCopyCommand()` は `node` + `scriptPath` + `args` で実起動形式を復元する。
- `getTerminalLog()` は `output` 配列をそのまま返す。
- `manager` が未初期化でもクラッシュせず、既存の fallback を保つ。

### APIシグネチャ

```typescript
interface AdvancedConsoleHandlerDependencies {
  mainWindow: BrowserWindow;
  getTerminalLog: (sessionId: string) => Promise<string[]>;
  getCopyCommand: (sessionId: string) => Promise<string | null>;
}

type SessionNotFoundError = Error & {
  code: "SESSION_NOT_FOUND";
};

export function getClaudeCliManager(): ClaudeCliManager | null;
```

### 使用例

```typescript
import { getClaudeCliManager } from "../claude-cli/ipc-handler";

async function resolveTerminalLog(sessionId: string): Promise<string[]> {
  const mgr = getClaudeCliManager();
  if (!mgr) return [];

  const result = await mgr.getSession({ sessionId });
  if (!result.success || !result.data) {
    const error = new Error(
      `Session not found: ${sessionId}`,
    ) as SessionNotFoundError;
    error.code = "SESSION_NOT_FOUND";
    throw error;
  }

  return result.data.output;
}
```

### エラーハンドリング

- `getClaudeCliManager()` が `null` のときは、既存の fallback と同じく `[]` / `null` を返す。
- `mgr.getSession()` が `success: false` または `data: undefined` のときは内部的に `SESSION_NOT_FOUND` を throw する。
- `advancedConsoleHandlers.ts` の catch が外向きには `TERMINAL_LOG_ERROR` / `COPY_COMMAND_ERROR` に変換する。
- 返却前の `sanitizeForApiKeys()` は維持する。

### エッジケース

- `sessionId` が空文字でも、`getSession()` の結果で判定する。
- `scriptPath` に空白がある場合、現行契約ではシェル引用符を付けない。
- `args` が 0 件の場合でも、`node <scriptPath>` を返せるようにする。
- `args` が複数件の場合は、順序を保ったまま結合する。

### 設定項目と定数

| 項目                   | 用途                                            |
| ---------------------- | ----------------------------------------------- |
| `SESSION_NOT_FOUND`    | セッション未発見時のエラーコード                |
| `TERMINAL_LOG_ERROR`   | ターミナルログ取得失敗時の handler エラーコード |
| `COPY_COMMAND_ERROR`   | Copy Command 取得失敗時の handler エラーコード  |
| `sanitizeForApiKeys()` | API キーを返却前に隠す関数                      |
| `BrowserWindow`        | sender 検証と依存注入の基点                     |

### 実装ノート

- `getCopyCommand()` の文字列化は、現行契約として `["node", scriptPath, ...args].join(" ")` を使う。
- 空白を含むパスや引用符対応はこの phase の対象外として残す。
- この wave では `SESSION_NOT_FOUND` の内外契約、`manager` の公開、copy command の launch fidelity を最小変更で通す。
