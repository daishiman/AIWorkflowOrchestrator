# Hooks システム リファレンス

## イベント一覧

| イベント名         | タイミング             | 用途                       |
| ------------------ | ---------------------- | -------------------------- |
| PreToolUse         | ツール実行前           | バリデーション、承認フロー |
| PostToolUse        | ツール実行後           | ロギング、副作用処理       |
| PostToolUseFailure | ツール実行失敗後       | エラーハンドリング         |
| Notification       | 通知発生時             | ユーザー通知               |
| UserPromptSubmit   | プロンプト送信時       | 入力バリデーション         |
| SessionStart       | セッション開始時       | 初期化処理                 |
| SessionEnd         | セッション終了時       | クリーンアップ             |
| Stop               | 停止要求時             | 終了処理                   |
| SubagentStart      | サブエージェント起動時 | サブエージェント管理       |
| SubagentStop       | サブエージェント停止時 | サブエージェント管理       |
| PreCompact         | コンパクト処理前       | コンテキスト管理           |
| PermissionRequest  | 権限要求時             | 動的権限制御               |

---

## Hook コールバック型

```typescript
type HookCallback = (
  input: HookInput,
  toolUseID: string | undefined,
  options: { signal: AbortSignal },
) => Promise<HookJSONOutput>;

interface HookJSONOutput {
  proceed?: boolean;     // 処理続行フラグ
  message?: string;      // フィードバックメッセージ
  error?: string;        // エラーメッセージ
  data?: Record<string, unknown>;  // 追加データ
}
```

---

## 実装パターン

### PreToolUse: 危険コマンドのブロック

```typescript
const options: Options = {
  hooks: {
    PreToolUse: async (input, toolUseID, { signal }) => {
      // 危険なBashコマンドをブロック
      if (input.toolName === "Bash") {
        const dangerousPatterns = ["rm -rf", "sudo", "chmod 777", "dd if="];
        const command = input.args.command as string;

        for (const pattern of dangerousPatterns) {
          if (command.includes(pattern)) {
            return {
              proceed: false,
              message: `危険なコマンド "${pattern}" は許可されていません`,
            };
          }
        }
      }
      return { proceed: true };
    },
  },
};
```

### PostToolUse: ロギングとステータス更新

```typescript
const options: Options = {
  hooks: {
    PostToolUse: async (input, toolUseID, { signal }) => {
      // ツール使用をログに記録
      console.log(`[${new Date().toISOString()}] Tool: ${input.toolName}`);

      // 統計情報を更新
      toolUsageStats[input.toolName] = (toolUsageStats[input.toolName] || 0) + 1;

      return {};
    },
  },
};
```

### PermissionRequest: UI確認フロー

```typescript
const options: Options = {
  hooks: {
    PermissionRequest: async (input, toolUseID, { signal }) => {
      // UIダイアログを表示して承認を待つ
      const approved = await showPermissionDialog({
        toolName: input.toolName,
        args: input.args,
      });

      return { proceed: approved };
    },
  },
};
```

### SessionStart/SessionEnd: ライフサイクル管理

```typescript
const options: Options = {
  hooks: {
    SessionStart: async (input, toolUseID, { signal }) => {
      console.log("Session started:", input.sessionId);
      await initializeSession(input.sessionId);
      return {};
    },

    SessionEnd: async (input, toolUseID, { signal }) => {
      console.log("Session ended:", input.sessionId);
      await cleanupSession(input.sessionId);
      return {};
    },
  },
};
```

### PostToolUseFailure: エラーハンドリング

```typescript
const options: Options = {
  hooks: {
    PostToolUseFailure: async (input, toolUseID, { signal }) => {
      console.error(`Tool ${input.toolName} failed:`, input.error);

      // エラーメトリクスを記録
      await recordMetric("tool_failure", {
        toolName: input.toolName,
        error: input.error?.message,
      });

      return {};
    },
  },
};
```

### Notification: ユーザー通知

```typescript
const options: Options = {
  hooks: {
    Notification: async (input, toolUseID, { signal }) => {
      // デスクトップ通知を表示
      await showDesktopNotification({
        title: input.title,
        body: input.message,
      });

      return {};
    },
  },
};
```

### SubagentStart/SubagentStop: サブエージェント管理

```typescript
const options: Options = {
  hooks: {
    SubagentStart: async (input, toolUseID, { signal }) => {
      console.log(`Subagent started: ${input.subagentId}`);
      subagentRegistry.add(input.subagentId);
      return {};
    },

    SubagentStop: async (input, toolUseID, { signal }) => {
      console.log(`Subagent stopped: ${input.subagentId}`);
      subagentRegistry.delete(input.subagentId);
      return {};
    },
  },
};
```

---

## 複合Hook実装例

### Electron統合での完全なHook設定

```typescript
const options: Options = {
  hooks: {
    PreToolUse: async (input, toolUseID, { signal }) => {
      // 危険コマンドのブロック
      if (shouldBlockTool(input)) {
        return {
          proceed: false,
          message: "このツール使用は許可されていません",
        };
      }

      // UIで権限確認が必要な場合
      if (requiresUserApproval(input)) {
        const approved = await requestPermission(mainWindow, input);
        return { proceed: approved };
      }

      return { proceed: true };
    },

    PostToolUse: async (input, toolUseID) => {
      // ステータス更新
      mainWindow.webContents.send("agent:status", {
        type: "tool_completed",
        tool: input.toolName,
        timestamp: Date.now(),
      });
      return {};
    },

    PermissionRequest: async (input, toolUseID, { signal }) => {
      const approved = await requestPermission(mainWindow, input);
      return { proceed: approved };
    },

    SessionStart: async (input, toolUseID, { signal }) => {
      mainWindow.webContents.send("agent:status", {
        type: "session_started",
        sessionId: input.sessionId,
      });
      return {};
    },

    SessionEnd: async (input, toolUseID, { signal }) => {
      mainWindow.webContents.send("agent:status", {
        type: "session_ended",
      });
      return {};
    },
  },
};
```

---

## ベストプラクティス

### すべきこと

- signal.abortedを定期的にチェックする
- 非同期処理には適切なタイムアウトを設定する
- エラーは適切にログに記録する
- UIフィードバックを提供する

### 避けるべきこと

- Hookで長時間ブロッキング処理を行う
- signal.abortedのチェックを省略する
- エラーを握りつぶす
- 機密情報をログに出力する

---

## 関連ドキュメント

- [query-api.md](./query-api.md) - query() API
- [permission-control.md](./permission-control.md) - Permission Control
- [error-handling.md](./error-handling.md) - エラーハンドリング
- [electron-ipc.md](./electron-ipc.md) - Electron IPC統合
