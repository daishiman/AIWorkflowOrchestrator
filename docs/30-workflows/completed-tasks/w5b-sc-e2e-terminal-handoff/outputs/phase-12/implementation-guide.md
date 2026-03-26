# 実装ガイド: Skill Creator E2E テスト + TerminalHandoff 検証

## 概要

Skill Creator LLM 統合の E2E テストスイート。IPC ハンドラー経由で RuntimeSkillCreatorFacade の全操作（plan, execute, improve, applyImprovement）と TerminalHandoff 経路を検証する。

## アーキテクチャ

```
Renderer (preload)
    |
    v  ipcRenderer.invoke("skill-creator:plan", args)
IPC Layer (creatorHandlers.ts)
    |  validateSender() → isBlank() validation → facade.plan()
    v
RuntimeSkillCreatorFacade
    |  → PlanResult | { type: "terminal_handoff", guidance }
    v
IPC Layer → { success: true, data: result } or { success: false, error: string }
```

## テスト構成

### ファイル構成

```
apps/desktop/src/test/
  e2e/
    skill-creator-integration.test.ts  # Scenario A, C, D, E (25 tests)
    terminal-handoff.test.ts           # Scenario B (11 tests)
  helpers/
    skill-creator-test-helpers.ts      # 共通ヘルパー
```

### モック戦略

- **Facade モック**: LLM API を直接モックせず、RuntimeSkillCreatorFacade をモック
- **Electron モック**: `ipcMain.handle` を `handlerMap` で捕捉し、直接呼び出し
- **BrowserWindow モック**: `fromWebContents` でセンダー検証を通過させる

### テストシナリオ

| Scenario | 内容            | AC     | テスト数 |
| -------- | --------------- | ------ | -------- |
| A        | 正常フロー      | AC-1,2 | 5        |
| B        | TerminalHandoff | AC-4   | 11       |
| C        | LLMエラー回復   | AC-7   | 5        |
| D        | improve機能     | AC-5   | 8        |
| E        | 後方互換        | AC-8   | 4        |

## IPC レスポンス形式

```typescript
interface IpcResult<T> {
  success: boolean;
  data?: T;
  error?: string; // 注意: string 型（P60）
}
```

## TerminalHandoff レスポンス

```typescript
// plan() が API Key 未設定等の場合に返す
{
  success: true,
  data: {
    type: "terminal_handoff",
    guidance: {
      terminalCommand: "claude -p \"...\""  // CLI コマンド
      contextSummary: "...",
      reason: "..."
    }
  }
}
```

## テスト実行

```bash
cd apps/desktop && pnpm vitest run src/test/e2e/
```

## 既知の制約

- `skill-creator:verify` チャネルは未実装（FR-4 は別タスクスコープ）
- パフォーマンス計測（NFR-2）はモック環境では不可
- AC-3（進捗更新）は webContents.send の UI テストで対応
