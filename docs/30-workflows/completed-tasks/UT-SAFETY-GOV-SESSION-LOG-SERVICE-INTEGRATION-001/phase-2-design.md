# Phase 2: 設計

## メタ情報

| 項目     | 値                                                |
| -------- | ------------------------------------------------- |
| Phase    | 2                                                 |
| 機能名   | Advanced Console 実セッションログ接続             |
| タスクID | UT-SAFETY-GOV-SESSION-LOG-SERVICE-INTEGRATION-001 |
| 作成日   | 2026-04-02                                        |

## 設計概要

Phase 1 で確定した「`ClaudeCliManager` がモジュール閉鎖になっている」問題を解決するため、
`claude-cli/ipc-handler.ts` に `getClaudeCliManager()` ゲッターをエクスポートし、
`ipc/index.ts` から参照できるようにする。

## アーキテクチャ設計

### 変更 1: `claude-cli/ipc-handler.ts` — manager ゲッター追加

**現状:**

```typescript
let manager: ClaudeCliManager | null = null;
// manager は外部から参照不可
```

**変更後:**

```typescript
let manager: ClaudeCliManager | null = null;

/** Main プロセス内の他モジュールが ClaudeCliManager へアクセスするためのゲッター */
export function getClaudeCliManager(): ClaudeCliManager | null {
  return manager;
}
```

設計根拠:

- `manager` を直接エクスポートすると外部から上書き可能になるため、ゲッター関数でカプセル化
- `null` を返す可能性を型に明示し、呼び出し側で未初期化を安全に処理させる
- `registerClaudeCliHandlers` 呼び出し前は `null` → DI 注入時に `null` チェックを行う

---

### 変更 2: `ipc/index.ts` — placeholder callback を実実装に差し替え

**現状 (ipc/index.ts:920-929):**

```typescript
// TODO(DI): Replace getTerminalLog / getCopyCommand with actual session log service when available.
track("registerAdvancedConsoleHandlers", () =>
  registerAdvancedConsoleHandlers({
    mainWindow,
    getTerminalLog: async (_sessionId: string) => [],
    getCopyCommand: async (_sessionId: string) => null,
  }),
);
```

**変更後:**

```typescript
import { getClaudeCliManager } from "../claude-cli/ipc-handler";

// SESSION_NOT_FOUND エラーコード定数
const SESSION_NOT_FOUND = "SESSION_NOT_FOUND" as const;

track("registerAdvancedConsoleHandlers", () =>
  registerAdvancedConsoleHandlers({
    mainWindow,
    getTerminalLog: async (sessionId: string) => {
      const mgr = getClaudeCliManager();
      if (!mgr) return [];
      const result = await mgr.getSession({ sessionId });
      if (!result.success || !result.data) {
        throw Object.assign(new Error(`Session not found: ${sessionId}`), {
          code: SESSION_NOT_FOUND,
        });
      }
      return result.data.output;
    },
    getCopyCommand: async (sessionId: string) => {
      const mgr = getClaudeCliManager();
      if (!mgr) return null;
      const result = await mgr.getSession({ sessionId });
      if (!result.success || !result.data) {
        throw Object.assign(new Error(`Session not found: ${sessionId}`), {
          code: SESSION_NOT_FOUND,
        });
      }
      const { scriptPath, args } = result.data;
      return ["node", scriptPath, ...args].join(" ");
    },
  }),
);
```

---

### エラーコード設計

| エラーコード         | 発生条件                                                        | レスポンス                            |
| -------------------- | --------------------------------------------------------------- | ------------------------------------- |
| `SESSION_NOT_FOUND`  | `mgr.getSession()` が `success: false` または `data: undefined` | `throw Error` with `.code` プロパティ |
| `TERMINAL_LOG_ERROR` | ハンドラ内の catch（既存実装）                                  | IPC エラーレスポンス                  |
| `COPY_COMMAND_ERROR` | ハンドラ内の catch（既存実装）                                  | IPC エラーレスポンス                  |

`SESSION_NOT_FOUND` は callback 内で throw → `advancedConsoleHandlers.ts` の既存 catch ブロックが
`TERMINAL_LOG_ERROR` / `COPY_COMMAND_ERROR` として Renderer に返す設計のため、
handler 側の変更は不要。

---

### getCopyCommand のフォーマット

`SessionManager.createSession()` が `node` を executable に使っているため、
Copy Command も同じ launch context を返す:

```
node /path/to/skill-name.js --arg1 value1
```

`["node", scriptPath, ...args].join(" ")` で生成。将来の拡張（シェル引用符対応）は本タスクのスコープ外。

---

## 変更ファイルサマリ

| ファイル                                          | 変更行数（概算）                   | 変更内容                                 |
| ------------------------------------------------- | ---------------------------------- | ---------------------------------------- |
| `apps/desktop/src/main/claude-cli/ipc-handler.ts` | +4行                               | `getClaudeCliManager()` エクスポート追加 |
| `apps/desktop/src/main/ipc/index.ts`              | +20行（placeholder 9行を差し替え） | import 追加 + callback 実装              |

## シーケンス図

```
Renderer                  Main (advancedConsoleHandlers)       ipc/index.ts callback       ClaudeCliManager/SessionManager
   |                              |                                    |                              |
   |-- execution:get-terminal-log(sessionId) -->                       |                              |
   |                              |-- validateSender() -->             |                              |
   |                              |-- getTerminalLog(sessionId) -----> |                              |
   |                              |                                    |-- getClaudeCliManager() ---> |
   |                              |                                    |-- mgr.getSession(sessionId) >|
   |                              |                                    |<-- { success, data.output } -|
   |                              |<-- output: string[] -------------- |                              |
   |                              |-- sanitizeForApiKeys(output) -->   |                              |
   |<-- sanitized output[] ------ |                                    |                              |
```

## 完了条件チェックリスト

- [ ] `getClaudeCliManager()` の設計が完了している
- [ ] `ipc/index.ts` の差し替え実装が設計されている
- [ ] `SESSION_NOT_FOUND` エラーコードの設計が完了している
- [ ] `getCopyCommand` のフォーマットが定義されている
- [ ] シーケンス図が作成されている
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## 目的

実データ取得の入口を `getClaudeCliManager()` に集約し、`ipc/index.ts` の callback を安全に差し替える設計を固定する。

## 実行タスク

- `claude-cli/ipc-handler.ts` の manager getter を定義する。
- `ipc/index.ts` の placeholder callback を実装案へ差し替える。
- `SESSION_NOT_FOUND` の扱いと copy command 形式を定義する。

## 参照資料

- `phase-1-requirements.md`
- `apps/desktop/src/main/claude-cli/ClaudeCliManager.ts`
- `apps/desktop/src/main/claude-cli/SessionManager.ts`
- `apps/desktop/src/main/ipc/index.ts`
- `apps/desktop/src/main/ipc/advancedConsoleHandlers.ts`

## 成果物/実行手順

- 設計内容を `phase-3-design-review.md` に引き渡す。
- `outputs/artifacts.json` を root `artifacts.json` と同一内容に保つ。

## 統合テスト連携

- `apps/desktop/src/main/ipc/__tests__/advancedConsoleIpc.test.ts`
- `apps/desktop/src/main/claude-cli/__tests__/ipc-handler.test.ts`
