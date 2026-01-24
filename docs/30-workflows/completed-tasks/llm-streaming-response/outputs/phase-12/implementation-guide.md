# LLMストリーミングレスポンス 実装ガイド

## メタ情報

| 項目       | 内容              |
| ---------- | ----------------- |
| タスクID   | UT-LLM-STREAM-001 |
| Phase      | 12                |
| 作成日     | 2026-01-24        |
| ステータス | 完了              |

---

# Part 1: 概念的説明（初学者・非技術者向け）

## 1. ストリーミングとは

### 1.1 機能の概要

ストリーミングレスポンスは、AIからの応答を**リアルタイムで表示**する機能です。従来の方式では、AIが回答全体を生成し終わるまで待つ必要がありましたが、ストリーミングでは**文字が打ち込まれるように**少しずつ表示されます。

```
【従来の方式】
ユーザー: 質問送信 → [数秒待機...] → AIの回答が一度に全部表示

【ストリーミング方式】
ユーザー: 質問送信 → A → AI → AIが → AIが考えた → AIが考えた回答...
                     ↑ 即座に文字が流れるように表示
```

### 1.2 ユーザーにとっての価値

| メリット           | 説明                                               |
| ------------------ | -------------------------------------------------- |
| 待ち時間の体感短縮 | すぐに反応が見えるため、待っている感覚が軽減される |
| 途中確認が可能     | 回答の方向性を早い段階で確認できる                 |
| キャンセル機能     | 期待と違う場合、途中で止めて別の質問ができる       |
| 自然な会話体験     | 人間が話すように徐々に文字が現れる                 |

### 1.3 基本的な使い方

```
┌─────────────────────────────────────┐
│ チャット画面                         │
├─────────────────────────────────────┤
│                                     │
│  ユーザー: TypeScriptとは何ですか？  │
│                                     │
│  AI: TypeScriptは、JavaScriptに    │
│      静的型付けを追加した言語で▌    │
│                       ↑            │
│              カーソル点滅中          │
│      [キャンセル]                   │
│         ↑ ストリーミング中のみ表示   │
│                                     │
└─────────────────────────────────────┘
```

**操作方法**:

1. **メッセージ送信**: 通常通りメッセージを入力して送信
2. **応答確認**: 文字が徐々に表示される様子を確認
3. **キャンセル（任意）**: `キャンセル`ボタンまたは`Escape`キーで中断

### 1.4 対応AIプロバイダー

本機能は以下の4つのAIプロバイダーで利用可能です：

| プロバイダー | 代表モデル          | 特徴                   |
| ------------ | ------------------- | ---------------------- |
| OpenAI       | GPT-4o, GPT-4-turbo | 汎用性が高く安定       |
| Anthropic    | Claude 3.5 Sonnet   | 長文処理に強い         |
| Google       | Gemini 1.5 Pro      | マルチモーダル対応     |
| xAI          | Grok-2              | リアルタイム情報に強い |

---

# Part 2: 技術的詳細（開発者向け）

## 2. アーキテクチャ概要

### 2.1 データフロー

```
┌──────────────────────────────────────────────────────────────┐
│                    Renderer Process (UI)                      │
│  ┌────────────┐    ┌──────────────┐    ┌────────────────┐    │
│  │ ChatInput  │───→│  useLLMChat  │───→│StreamingMessage│    │
│  └────────────┘    │   (hook)     │    └────────────────┘    │
│                    └──────┬───────┘                          │
└───────────────────────────┼──────────────────────────────────┘
                            │ IPC (llm:stream-chat)
┌───────────────────────────┼──────────────────────────────────┐
│                    Main Process                               │
│  ┌──────────────┐  ┌─────┴─────┐  ┌──────────────────────┐   │
│  │ IPCHandler   │──│  Factory   │──│  LLMAdapter          │   │
│  │ (llm.ts)     │  │            │  │  ├─OpenAIAdapter      │   │
│  └──────────────┘  └───────────┘  │  ├─AnthropicAdapter   │   │
│                                    │  ├─GoogleAdapter      │   │
│                                    │  └─xAIAdapter         │   │
│                                    └──────────┬─────────────┘   │
└───────────────────────────────────────────────┼─────────────────┘
                                                │ SSE (HTTP)
                                    ┌───────────┴───────────┐
                                    │  Provider API Server   │
                                    └───────────────────────┘
```

### 2.2 主要コンポーネント

| コンポーネント   | 責務                   | ファイルパス                                        |
| ---------------- | ---------------------- | --------------------------------------------------- |
| BaseLLMAdapter   | 共通ストリーミング処理 | `src/main/adapters/llm/BaseLLMAdapter.ts`           |
| OpenAIAdapter    | OpenAI SSE処理         | `src/main/adapters/llm/OpenAIAdapter.ts`            |
| AnthropicAdapter | Anthropic イベント処理 | `src/main/adapters/llm/AnthropicAdapter.ts`         |
| GoogleAdapter    | Gemini SSE処理         | `src/main/adapters/llm/GoogleAdapter.ts`            |
| xAIAdapter       | xAI SSE処理            | `src/main/adapters/llm/xAIAdapter.ts`               |
| IPCハンドラー    | IPC通信管理            | `src/main/handlers/llm.ts`                          |
| StreamingMessage | UI表示                 | `src/renderer/components/chat/StreamingMessage.tsx` |

### 2.3 デザインパターン

| パターン        | 適用箇所                    | 目的                               |
| --------------- | --------------------------- | ---------------------------------- |
| Template Method | `BaseLLMAdapter.fetchSSE()` | SSE処理の共通化                    |
| Factory         | `LLMAdapterFactory`         | プロバイダーに応じたアダプター生成 |
| Strategy        | 各Adapter                   | プロバイダー固有のSSE解析          |
| Observer        | IPC通信                     | チャンク送信の非同期通知           |

---

## 3. コード例と解説

### 3.1 ストリーミングチャットの開始（Renderer側）

```typescript
// useLLMChat.ts
import { useCallback } from "react";

export function useLLMChat() {
  const sendStreamingMessage = useCallback(
    async (
      request: LLMChatRequest,
      onChunk: (chunk: StreamChunk) => void,
      signal?: AbortSignal,
    ) => {
      // IPC経由でストリーミング開始
      const streamId = await window.api.llm.streamChat(request);

      // チャンク受信リスナー登録
      window.api.llm.onStreamChunk(streamId, (chunk) => {
        onChunk(chunk);
      });

      // キャンセル処理
      signal?.addEventListener("abort", () => {
        window.api.llm.cancelStream(streamId);
      });

      return streamId;
    },
    [],
  );

  return { sendStreamingMessage };
}
```

### 3.2 SSEストリーム処理（Main Process側）

```typescript
// BaseLLMAdapter.ts
protected async *fetchSSE(
  url: string,
  options: RequestInit,
  parseChunk: (line: string) => string | null
): AsyncGenerator<string, void, unknown> {
  const response = await fetch(url, {
    ...options,
    signal: options.signal,
  });

  if (!response.ok) {
    throw await this.handleHttpError(response);
  }

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (reader) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const content = parseChunk(line);
      if (content) {
        yield content;
      }
    }
  }
}
```

### 3.3 OpenAI SSE解析

```typescript
// OpenAIAdapter.ts
async *streamChat(
  request: LLMChatRequest,
  signal?: AbortSignal
): AsyncGenerator<StreamChunk, LLMChatResponse, unknown> {
  const response = { content: '' };

  for await (const chunk of this.fetchSSE(
    `${this.baseUrl}/chat/completions`,
    {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        ...this.buildRequestBody(request),
        stream: true,
      }),
      signal,
    },
    (line) => {
      // OpenAI形式: data: {"choices":[{"delta":{"content":"..."}}]}
      if (!line.startsWith('data: ')) return null;
      const data = line.slice(6);
      if (data === '[DONE]') return null;
      const json = JSON.parse(data);
      return json.choices?.[0]?.delta?.content || null;
    }
  )) {
    response.content += chunk;
    yield { type: 'content', content: chunk };
  }

  return {
    success: true,
    data: {
      content: response.content,
      model: request.modelId,
      usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
    },
  };
}
```

### 3.4 UIコンポーネント（StreamingMessage）

```tsx
// StreamingMessage.tsx
export function StreamingMessage({
  content,
  isStreaming,
  onCancel,
}: StreamingMessageProps) {
  // Escapeキーでキャンセル
  useEffect(() => {
    if (!isStreaming) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCancel?.();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isStreaming, onCancel]);

  return (
    <div role="status" aria-live="polite" aria-busy={isStreaming}>
      <div className="message-content">
        {content}
        {isStreaming && <span className="cursor" aria-label="入力中" />}
      </div>
      {isStreaming && (
        <button onClick={onCancel} aria-label="応答をキャンセル">
          キャンセル
        </button>
      )}
    </div>
  );
}
```

---

## 4. トラブルシューティング

### 4.1 よくある問題と解決策

| 問題                         | 原因                 | 解決策                   |
| ---------------------------- | -------------------- | ------------------------ |
| ストリーミングが開始されない | APIキー未設定        | 設定画面でAPIキーを確認  |
| 途中で停止する               | ネットワーク切断     | 接続を確認し再試行       |
| エラー表示される             | レート制限           | しばらく待ってから再試行 |
| 文字化けする                 | エンコーディング問題 | UTF-8設定を確認          |

### 4.2 エラーコードと対処

| コード                | 説明                 | リトライ | 対処                           |
| --------------------- | -------------------- | -------- | ------------------------------ |
| `NETWORK_ERROR`       | ネットワーク切断     | 可能     | 接続確認後に再試行             |
| `TIMEOUT`             | タイムアウト         | 可能     | 再試行ボタンをクリック         |
| `RATE_LIMIT`          | レート制限           | 可能     | 表示時間待機後に自動リトライ   |
| `API_KEY_INVALID`     | APIキー無効          | 不可     | 設定画面でAPIキーを再設定      |
| `CONTENT_FILTER`      | コンテンツフィルター | 不可     | 質問内容を変更                 |
| `SERVICE_UNAVAILABLE` | サービス停止         | 可能     | プロバイダーのステータスを確認 |

### 4.3 デバッグ方法

```typescript
// コンソールでストリーミング状態を確認
window.api.llm.onStreamChunk("*", (chunk) => {
  console.log("Chunk received:", chunk);
});

// エラーをキャッチ
window.api.llm.onStreamError("*", (error) => {
  console.error("Stream error:", error);
});
```

---

## 5. パフォーマンス考慮事項

### 5.1 メモリ管理

| 考慮点                   | 対策                                     |
| ------------------------ | ---------------------------------------- |
| イベントリスナーのリーク | コンポーネントのアンマウント時に必ず解除 |
| 大量チャンクの蓄積       | バッファサイズの制限を設定               |
| AbortControllerの解放    | キャンセル後は必ずabort()を呼び出す      |

### 5.2 UI最適化

```typescript
// 頻繁な再レンダリングを防ぐためのデバウンス
const debouncedContent = useDeferredValue(content);

// 仮想スクロールの活用（長い会話）
<VirtualList items={messages} itemHeight={100} />
```

### 5.3 ベストプラクティス

1. **AbortControllerの適切な使用**: 全てのストリームにシグナルを渡す
2. **エラーバウンダリの設置**: ストリーミングエラーをキャッチ
3. **プログレス表示**: ストリーミング状態をユーザーに明示
4. **自動スクロール**: 新しいコンテンツに追従

---

## 6. 拡張ポイント

### 6.1 新規プロバイダーの追加

1. `BaseLLMAdapter`を継承した新アダプタークラスを作成
2. `streamChat()`メソッドでSSE解析ロジックを実装
3. `LLMAdapterFactory`にプロバイダーを登録
4. 型定義に新プロバイダーIDを追加

### 6.2 カスタムUIの実装

```tsx
// カスタムストリーミング表示
function CustomStreamingView({ content }: { content: string }) {
  return (
    <div className="custom-streaming">
      <MarkdownRenderer content={content} />
      <LoadingDots />
    </div>
  );
}
```

---

## 変更履歴

| Version | Date       | Changes  |
| ------- | ---------- | -------- |
| 1.0.0   | 2026-01-24 | 初版作成 |
