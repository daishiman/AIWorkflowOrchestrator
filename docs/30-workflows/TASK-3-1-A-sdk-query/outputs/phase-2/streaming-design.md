# TASK-3-1-A ストリーミング設計書

## メタ情報

| 項目       | 内容       |
| ---------- | ---------- |
| タスクID   | TASK-3-1-A |
| Phase      | 2          |
| 作成日     | 2026-01-24 |
| ステータス | 完了       |

---

## ストリーミング処理フロー

### シーケンス図

```
Renderer Process          Main Process              Claude Agent SDK
     │                         │                          │
     │  skill:execute          │                          │
     │ ─────────────────────▶  │                          │
     │                         │                          │
     │                         │  query(prompt, options)  │
     │                         │ ─────────────────────▶   │
     │                         │                          │
     │                         │  ◀─ AsyncIterable ──     │
     │                         │                          │
     │                         │ ┌─────────────────────┐  │
     │                         │ │ for await (msg)     │  │
     │                         │ │   handleStream()    │  │
     │                         │ │   convertMessage()  │  │
     │                         │ │   sendStream()      │  │
     │                         │ └─────────────────────┘  │
     │                         │                          │
     │  skill:stream (text)    │                          │
     │ ◀─────────────────────  │                          │
     │                         │                          │
     │  skill:stream (text)    │                          │
     │ ◀─────────────────────  │                          │
     │                         │                          │
     │  skill:stream (complete)│                          │
     │ ◀─────────────────────  │                          │
     │                         │                          │
     │  skill:executeResult    │                          │
     │ ◀─────────────────────  │                          │
     │                         │                          │
```

---

## 処理詳細

### 1. execute() メソッド

```typescript
async execute(
  request: SkillExecutionRequest,
  skill: SkillMetadata
): Promise<SkillExecutionResponse> {
  // 1. 同時実行数チェック
  if (this.activeExecutions.size >= this.maxConcurrentExecutions) {
    return {
      executionId: "",
      success: false,
      error: {
        code: "MAX_CONCURRENT_EXCEEDED",
        message: `Maximum concurrent executions (${this.maxConcurrentExecutions}) exceeded`,
      },
    };
  }

  // 2. executionId 生成
  const executionId = uuidv4();

  // 3. AbortController 作成
  const abortController = new AbortController();

  // 4. ExecutionContext 登録
  const context: ExecutionContext = {
    id: executionId,
    skillId: skill.id,
    abortController,
    state: "pending",
    startedAt: Date.now(),
  };
  this.activeExecutions.set(executionId, context);

  // 5. 状態更新: running
  this.updateExecutionState(executionId, "running");

  try {
    // 6. プロンプト構築
    const fullPrompt = await this.buildPrompt(request.prompt, skill);

    // 7. query() API 呼び出し
    const response = await query(fullPrompt, {
      signal: abortController.signal,
      timeout: request.timeout ?? this.defaultTimeout,
      allowedTools: skill.allowedTools,
    });

    // 8. ストリーミング処理
    for await (const message of response.stream()) {
      await this.handleStreamMessage(executionId, message);
    }

    // 9. 完了通知
    this.sendStream({
      executionId,
      id: uuidv4(),
      type: "complete",
      content: "",
      timestamp: Date.now(),
      isComplete: true,
    });

    // 10. 状態更新: completed
    this.updateExecutionState(executionId, "completed");

    return {
      executionId,
      success: true,
    };
  } catch (error) {
    // エラーハンドリング（別ドキュメント参照）
    return this.handleExecutionError(executionId, error);
  } finally {
    // 11. クリーンアップ
    this.cleanup(executionId);
  }
}
```

### 2. handleStreamMessage() メソッド

```typescript
private async handleStreamMessage(
  executionId: string,
  message: unknown
): Promise<void> {
  // 1. メッセージ変換
  const streamMessage = this.convertToStreamMessage(executionId, message);

  // 2. null の場合はスキップ（未知のメッセージタイプ）
  if (!streamMessage) {
    return;
  }

  // 3. IPC 経由で Renderer に送信
  this.sendStream(streamMessage);
}
```

### 3. convertToStreamMessage() メソッド

```typescript
private convertToStreamMessage(
  executionId: string,
  message: unknown
): SkillStreamMessage | null {
  // SDK のメッセージ構造に基づいて変換
  const msg = message as {
    type?: string;
    content?: string;
    tool_use?: { name: string; input: unknown };
    error?: { message: string };
  };

  // メッセージタイプの判定
  let type: SkillStreamMessage["type"];
  let content: string;

  if (msg.type === "text" && msg.content) {
    type = "text";
    content = msg.content;
  } else if (msg.type === "tool_use" && msg.tool_use) {
    type = "tool_use";
    content = JSON.stringify({
      name: msg.tool_use.name,
      input: msg.tool_use.input,
    });
  } else if (msg.type === "error" || msg.error) {
    type = "error";
    content = msg.error?.message ?? "Unknown error";
  } else {
    // 未知のメッセージタイプ
    return null;
  }

  return {
    executionId,
    id: uuidv4(),
    type,
    content,
    timestamp: Date.now(),
    isComplete: false,
  };
}
```

### 4. sendStream() メソッド

```typescript
private sendStream(message: SkillStreamMessage): void {
  // BrowserWindow が有効かチェック
  if (this.mainWindow.isDestroyed()) {
    return;
  }

  // IPC 経由で Renderer に送信
  this.mainWindow.webContents.send("skill:stream", message);
}
```

---

## メッセージタイプ

| タイプ     | 説明               | 内容                          |
| ---------- | ------------------ | ----------------------------- |
| `text`     | テキストメッセージ | AIからの回答テキスト          |
| `tool_use` | ツール使用         | ツール名と入力パラメータ      |
| `error`    | エラー発生         | エラーメッセージ              |
| `complete` | 完了通知           | 空文字列（isComplete = true） |

---

## IPC 連携ポイント

### Main Process → Renderer Process

| チャンネル     | 送信タイミング         | ペイロード         |
| -------------- | ---------------------- | ------------------ |
| `skill:stream` | 各ストリームメッセージ | SkillStreamMessage |

### Renderer Process での受信

```typescript
// Preload API
window.skillExecutionAPI.onMessage((message: SkillStreamMessage) => {
  // メッセージ処理
  switch (message.type) {
    case "text":
      // テキスト追加
      break;
    case "tool_use":
      // ツール使用表示
      break;
    case "error":
      // エラー表示
      break;
    case "complete":
      // 完了処理
      break;
  }
});
```

---

## バッファリング設計

### 目的

ネットワーク状況によるメッセージ遅延を最小限に抑える。

### 設計

1. **即時送信**: 各メッセージは受信次第即座に IPC 送信
2. **バッチなし**: バッファリングせず低遅延を優先
3. **バックプレッシャー**: Renderer が処理できない場合も送信継続（Electron IPC は自動バッファ）

---

## 中断処理

### abort() メソッド

```typescript
abort(executionId: string): boolean {
  const context = this.activeExecutions.get(executionId);

  if (!context) {
    return false;
  }

  // AbortController でキャンセル
  context.abortController.abort();

  // 状態更新
  this.updateExecutionState(executionId, "aborted");

  // 中断通知を Renderer に送信
  this.sendStream({
    executionId,
    id: uuidv4(),
    type: "error",
    content: "Execution aborted by user",
    timestamp: Date.now(),
    isComplete: true,
  });

  return true;
}
```

---

## 変更履歴

| バージョン | 日付       | 変更内容 |
| ---------- | ---------- | -------- |
| 1.0.0      | 2026-01-24 | 初版作成 |
