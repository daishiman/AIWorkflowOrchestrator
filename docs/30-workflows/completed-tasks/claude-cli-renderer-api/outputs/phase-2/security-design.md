# Claude CLI Renderer API セキュリティ設計書

## メタ情報

| 項目       | 内容       |
| ---------- | ---------- |
| バージョン | 1.0.0      |
| 作成日     | 2026-01-17 |
| Phase      | 2          |
| ステータス | 完了       |

---

## 1. セキュリティ概要

Claude CLI Renderer APIは、Electronのセキュリティベストプラクティスに従って設計されている。主要なセキュリティ対策は以下の通り:

1. **Context Isolation** - Renderer ProcessとPreload Scriptのコンテキスト分離
2. **Channel Whitelisting** - 許可されたIPCチャンネルのみ使用可能
3. **contextBridge** - 安全なAPI公開パターン

---

## 2. Context Isolation

### 2.1 設計原則

- Renderer ProcessはPreload Scriptのコンテキストに直接アクセスできない
- `nodeIntegration: false`で設定
- `contextIsolation: true`で設定

### 2.2 実装確認

```typescript
// apps/desktop/src/preload/index.ts (462-486行)
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld("claudeCliAPI", claudeCliAPI);
  } catch (error) {
    console.error("Failed to expose APIs:", error);
  }
}
```

---

## 3. Channel Whitelisting

### 3.1 設計原則

- すべてのIPCチャンネルは明示的にホワイトリストに登録
- 許可されていないチャンネルへのアクセスは拒否
- Invokeチャンネルとイベントチャンネルを分離

### 3.2 safeInvoke 実装

```typescript
// apps/desktop/src/preload/index.ts (97-102行)
function safeInvoke<T>(channel: string, ...args: unknown[]): Promise<T> {
  if (!ALLOWED_INVOKE_CHANNELS.includes(channel)) {
    return Promise.reject(new Error(`Channel ${channel} is not allowed`));
  }
  return ipcRenderer.invoke(channel, ...args);
}
```

### 3.3 safeOn 実装

```typescript
// apps/desktop/src/preload/index.ts (105-121行)
function safeOn<T>(channel: string, callback: (data: T) => void): () => void {
  if (!ALLOWED_ON_CHANNELS.includes(channel)) {
    console.error(`Channel ${channel} is not allowed`);
    return () => {};
  }

  const listener = (_event: IpcRendererEvent, data: T) => {
    callback(data);
  };

  ipcRenderer.on(channel, listener);

  return () => {
    ipcRenderer.removeListener(channel, listener);
  };
}
```

---

## 4. 許可チャンネル一覧

### 4.1 Invokeチャンネル

| チャンネル                      | 操作     | リスクレベル |
| ------------------------------- | -------- | ------------ |
| `claude-cli:check-installation` | 読み取り | 低           |
| `claude-cli:list-skills`        | 読み取り | 低           |
| `claude-cli:get-skill-detail`   | 読み取り | 低           |
| `claude-cli:execute-script`     | 実行     | **中**       |
| `claude-cli:terminate-session`  | 制御     | 低           |
| `claude-cli:list-sessions`      | 読み取り | 低           |
| `claude-cli:get-session`        | 読み取り | 低           |

### 4.2 イベントチャンネル

| チャンネル                  | 方向          | リスクレベル |
| --------------------------- | ------------- | ------------ |
| `claude-cli:session-output` | Main→Renderer | 低           |
| `claude-cli:session-status` | Main→Renderer | 低           |

---

## 5. リスク分析

### 5.1 executeScript のリスク

**リスク**: 任意のスクリプト実行による悪意あるコード実行

**対策**:

- Main Process側での入力バリデーション
- ClaudeCliManagerでのサンドボックス実行
- ユーザー確認なしでの自動実行禁止

### 5.2 情報漏洩リスク

**リスク**: セッション出力に機密情報が含まれる可能性

**対策**:

- ストリーミングイベントはセッションIDでスコープ
- 認証されたRenderer Processのみがイベントを受信

---

## 6. メモリリーク対策

### 6.1 イベントリスナー管理

すべてのイベント購読関数は、unsubscribe関数を返す:

```typescript
const unsubscribe = window.claudeCliAPI.onSessionOutput((event) => {
  // ハンドラー処理
});

// コンポーネントアンマウント時に必ず呼び出す
unsubscribe();
```

### 6.2 React Hooksでの使用例

```typescript
useEffect(() => {
  const unsubscribe = window.claudeCliAPI.onSessionOutput(handleOutput);
  return () => unsubscribe(); // クリーンアップ
}, []);
```

---

## 7. セキュリティチェックリスト

| 項目                     | 状態        |
| ------------------------ | ----------- |
| Context Isolation有効    | ✅ 確認済み |
| Node Integration無効     | ✅ 確認済み |
| チャンネルホワイトリスト | ✅ 実装済み |
| safeInvoke使用           | ✅ 実装済み |
| safeOn使用               | ✅ 実装済み |
| contextBridge使用        | ✅ 実装済み |
| unsubscribe関数提供      | ✅ 実装済み |

---

## 8. 変更履歴

| バージョン | 日付       | 変更内容 |
| ---------- | ---------- | -------- |
| 1.0.0      | 2026-01-17 | 初版作成 |
