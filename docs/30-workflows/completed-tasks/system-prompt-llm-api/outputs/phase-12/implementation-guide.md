# 実装ガイド - システムプロンプトのLLM API統合

## メタ情報

| 項目       | 内容                        |
| ---------- | --------------------------- |
| タスクID   | TASK-CHAT-SYSPROMPT-LLM-001 |
| Phase      | 12                          |
| 作成日     | 2026-01-23                  |
| ステータス | 完了                        |

---

# Part 1: 概念的説明（中学生でもわかる版）

## 1. システムプロンプトとは何か

### 1.1 簡単な説明

システムプロンプトは、AIに「あなたはこういう役割です」と最初に伝える指示のことです。

例えば:

- 「あなたは翻訳アシスタントです」と伝えると、AIは翻訳に特化した回答をします
- 「あなたは関西弁で話してください」と伝えると、AIは関西弁で回答します

### 1.2 身近な例で理解する

レストランで注文するときを考えてみましょう:

| シナリオ           | システムプロンプト相当                     | 結果                     |
| ------------------ | ------------------------------------------ | ------------------------ |
| 普通に注文         | なし                                       | 通常のメニューから選ぶ   |
| 「辛いものが好き」 | 「辛い料理を優先してください」             | 辛いメニューを勧められる |
| 「ベジタリアン」   | 「お肉を使わない料理だけ提案してください」 | 野菜料理だけを勧められる |

AIチャットでも同じように、最初に「こういう風に答えてね」と伝えることで、AIの回答を調整できます。

## 2. なぜこの機能が必要か

### 2.1 問題点（Before）

システムプロンプトなしの場合:

```
ユーザー: Hello
AI: Hello! How can I assist you today?
```

→ ユーザーが「日本語で答えて」と毎回伝える必要がある

### 2.2 解決策（After）

システムプロンプトありの場合:

```
システムプロンプト: 「あなたは日本語翻訳アシスタントです」
ユーザー: Hello
AI: こんにちは！今日はどのようにお手伝いできますか？
```

→ 最初に一度設定すれば、ずっと日本語で答えてくれる

## 3. どのように動作するか

### 3.1 処理の流れ（図解）

```
┌─────────────────────────────────────────────────────────────┐
│                      ユーザーの操作                          │
├─────────────────────────────────────────────────────────────┤
│  1. システムプロンプトを設定                                 │
│     例: 「あなたは翻訳アシスタントです」                    │
│                                                             │
│  2. メッセージを入力                                        │
│     例: 「Hello」                                           │
│                                                             │
│  3. 送信ボタンをクリック                                    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      アプリ内部の処理                        │
├─────────────────────────────────────────────────────────────┤
│  1. システムプロンプトとメッセージを組み合わせる            │
│                                                             │
│  2. AIサービス（OpenAI/Anthropic等）に送信                  │
│                                                             │
│  3. AIからの回答を受け取る                                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      AIからの回答                            │
├─────────────────────────────────────────────────────────────┤
│  「こんにちは！何をお手伝いしましょうか？」                 │
└─────────────────────────────────────────────────────────────┘
```

## 4. ユースケース例

### 4.1 翻訳アシスタント

```
システムプロンプト: あなたは英日翻訳の専門家です。英語の文章を自然な日本語に翻訳してください。
ユーザー: The quick brown fox jumps over the lazy dog.
AI: 素早い茶色のキツネが怠惰な犬を飛び越える。
```

### 4.2 プログラミングヘルパー

```
システムプロンプト: あなたはTypeScriptの専門家です。コード例を示しながら説明してください。
ユーザー: 配列をソートするには？
AI: TypeScriptで配列をソートするには、sort()メソッドを使います：
    const numbers = [3, 1, 4, 1, 5];
    numbers.sort((a, b) => a - b); // 昇順ソート
```

### 4.3 関西弁キャラクター

```
システムプロンプト: あなたは大阪出身で、関西弁で話します。
ユーザー: 今日の天気は？
AI: 今日はめっちゃええ天気やで！外出るんやったら日焼け止め塗った方がええかもしれんな〜
```

---

# Part 2: 技術的詳細（開発者向け）

## 1. アーキテクチャ概要

### 1.1 データフロー

```
[Renderer Process]
      │
      │ IPC: AI_CHAT
      │ { message, systemPrompt, ragEnabled, conversationId }
      ▼
[Main Process: aiHandlers.ts]
      │
      │ buildMessages(message, systemPrompt)
      ▼
[buildMessages.ts]
      │
      │ LLMMessage[]
      ▼
[aiHandlers.ts]
      │
      │ getSelectedLLMConfig()
      ▼
[llmConfigProvider.ts]
      │
      │ { providerId, modelId }
      ▼
[aiHandlers.ts]
      │
      │ LLMAdapterFactory.getAdapter(providerId)
      ▼
[LLMAdapterFactory]
      │
      │ adapter.sendChat({ messages, modelId, providerId })
      ▼
[LLM API (OpenAI/Anthropic/Google/xAI)]
      │
      │ AdapterChatResponse
      ▼
[aiHandlers.ts]
      │
      │ AIChatResponse
      ▼
[Renderer Process]
```

## 2. 型定義

### 2.1 入力型

```typescript
// リクエスト型（既存）
interface AIChatRequest {
  message: string;
  systemPrompt?: string;
  ragEnabled: boolean;
  conversationId?: string;
}
```

### 2.2 メッセージ型

```typescript
// LLMメッセージ型（@repo/shared）
interface LLMMessage {
  role: "system" | "user" | "assistant";
  content: string;
}
```

### 2.3 設定型

```typescript
// LLM設定型（llmConfigProvider.ts）
interface SelectedLLMConfig {
  providerId: LLMProviderId; // "openai" | "anthropic" | "google" | "xai"
  modelId: string;
}
```

### 2.4 出力型

```typescript
// レスポンス型（既存）
interface AIChatResponse {
  success: boolean;
  data?: {
    message: string;
    conversationId: string;
    ragSources?: string[];
  };
  error?: string;
}
```

## 3. API仕様

### 3.1 buildMessages関数

```typescript
/**
 * ユーザーメッセージとシステムプロンプトからメッセージ配列を構築する
 * @param userMessage ユーザーのメッセージ
 * @param systemPrompt システムプロンプト（オプション）
 * @returns メッセージ配列
 */
function buildMessages(
  userMessage: string,
  systemPrompt?: string,
): LLMMessage[];
```

**動作仕様**:

- `systemPrompt`が空白のみの場合は無視される
- `systemPrompt`が存在する場合、`role: "system"`として最初に配置
- `userMessage`は常に`role: "user"`として追加

**例**:

```typescript
// システムプロンプトあり
buildMessages("Hello", "You are a translator");
// => [
//   { role: "system", content: "You are a translator" },
//   { role: "user", content: "Hello" }
// ]

// システムプロンプトなし
buildMessages("Hello");
// => [
//   { role: "user", content: "Hello" }
// ]
```

### 3.2 getSelectedLLMConfig関数

```typescript
/**
 * 選択されたLLM設定を取得する
 * @returns 選択されたプロバイダーとモデルの設定
 */
async function getSelectedLLMConfig(): Promise<SelectedLLMConfig | null>;
```

### 3.3 AI_CHATハンドラー

```typescript
// IPCハンドラー
ipcMain.handle(
  IPC_CHANNELS.AI_CHAT,
  async (_event, request: AIChatRequest): Promise<AIChatResponse>
);
```

## 4. 使用例

### 4.1 Renderer側からの呼び出し

```typescript
// Renderer Process
const response = await window.api.chat({
  message: "Hello",
  systemPrompt: "You are a helpful assistant",
  ragEnabled: false,
});

if (response.success) {
  console.log(response.data.message);
} else {
  console.error(response.error);
}
```

### 4.2 テストでの使用

```typescript
import { buildMessages } from "../utils/buildMessages";

describe("buildMessages", () => {
  it("should include system prompt when provided", () => {
    const messages = buildMessages("Hello", "Be helpful");
    expect(messages).toEqual([
      { role: "system", content: "Be helpful" },
      { role: "user", content: "Hello" },
    ]);
  });
});
```

## 5. エラーハンドリング

### 5.1 エラーコードとメッセージ

| エラーコード            | 日本語メッセージ                                                         |
| ----------------------- | ------------------------------------------------------------------------ |
| API_KEY_MISSING         | APIキーが設定されていません。設定画面でAPIキーを登録してください。       |
| API_KEY_INVALID         | APIキーが無効です。正しいAPIキーを設定してください。                     |
| NETWORK_ERROR           | ネットワークエラーが発生しました。接続を確認してください。               |
| TIMEOUT                 | リクエストがタイムアウトしました。再度お試しください。                   |
| RATE_LIMIT              | レート制限に達しました。しばらく待ってから再度お試しください。           |
| CONTEXT_LENGTH_EXCEEDED | メッセージが長すぎます。短くして再度お試しください。                     |
| CONTENT_FILTER          | コンテンツフィルターによりブロックされました。                           |
| MODEL_NOT_FOUND         | 指定されたモデルが見つかりません。                                       |
| SERVICE_UNAVAILABLE     | サービスが一時的に利用できません。しばらく待ってから再度お試しください。 |
| UNKNOWN                 | エラーが発生しました。                                                   |

### 5.2 エラー処理フロー

```typescript
try {
  const response = await adapter.sendChat(request);
  return { success: true, data: { message: response.content, ... } };
} catch (error) {
  if (isLLMError(error)) {
    return { success: false, error: convertLLMErrorToMessage(error) };
  }
  return { success: false, error: "Unknown error" };
}
```

## 6. ファイル構成

```
apps/desktop/src/main/
├── utils/
│   ├── buildMessages.ts          # メッセージ構築関数
│   └── __tests__/
│       └── buildMessages.test.ts # テスト（24件）
├── ipc/
│   ├── aiHandlers.ts             # IPCハンドラー（更新）
│   ├── llmConfigProvider.ts      # LLM設定プロバイダー
│   └── __tests__/
│       └── aiHandlers.llm.test.ts # テスト（30件）
└── adapters/
    └── llm/
        └── LLMAdapterFactory.ts  # アダプターファクトリー（既存）
```

---

## 更新履歴

| 日付       | 版  | 変更内容 | 作成者 |
| ---------- | --- | -------- | ------ |
| 2026-01-23 | 1.0 | 初版作成 | Claude |
