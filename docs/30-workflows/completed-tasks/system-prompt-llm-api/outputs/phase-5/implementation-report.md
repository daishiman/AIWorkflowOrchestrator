# 実装レポート - システムプロンプトのLLM API統合

## メタ情報

| 項目       | 内容                        |
| ---------- | --------------------------- |
| タスクID   | TASK-CHAT-SYSPROMPT-LLM-001 |
| Phase      | 5                           |
| 作成日     | 2026-01-23                  |
| ステータス | 完了                        |

---

## 1. 実装概要

Phase 5では、TDDのGreenフェーズとして以下の実装を行いました：

1. **buildMessages関数** - システムプロンプトとユーザーメッセージからLLMメッセージ配列を構築
2. **llmConfigProvider** - 選択されたLLMプロバイダー/モデル設定を提供
3. **aiHandlers更新** - モックレスポンスからLLM API呼び出しへの切り替え

---

## 2. 実装ファイル

### 2.1 buildMessages.ts（新規）

**ファイル**: `apps/desktop/src/main/utils/buildMessages.ts`

```typescript
export function buildMessages(
  userMessage: string,
  systemPrompt?: string,
): LLMMessage[] {
  const messages: LLMMessage[] = [];

  // システムプロンプトがあり、空白以外の文字を含む場合のみ追加
  if (systemPrompt && systemPrompt.trim()) {
    messages.push({
      role: "system",
      content: systemPrompt.trim(),
    });
  }

  messages.push({
    role: "user",
    content: userMessage,
  });

  return messages;
}
```

**機能**:

- システムプロンプトの空白処理（トリム、空文字無視）
- systemメッセージをuserメッセージの前に配置
- LLMMessage型を使用した型安全な実装

### 2.2 llmConfigProvider.ts（新規）

**ファイル**: `apps/desktop/src/main/ipc/llmConfigProvider.ts`

```typescript
export interface SelectedLLMConfig {
  providerId: LLMProviderId;
  modelId: string;
}

export async function getSelectedLLMConfig(): Promise<SelectedLLMConfig | null>;
export function setSelectedLLMConfig(config: SelectedLLMConfig | null): void;
export function resetLLMConfig(): void;
```

**機能**:

- 選択されたプロバイダー/モデル設定の取得
- デフォルト設定（OpenAI GPT-4o）のフォールバック
- 設定更新・リセット関数

### 2.3 aiHandlers.ts（更新）

**ファイル**: `apps/desktop/src/main/ipc/aiHandlers.ts`

**主な変更点**:

1. `LLMAdapterFactory`のインポートと使用
2. `buildMessages`関数でメッセージ配列を構築
3. `getSelectedLLMConfig`で選択されたLLM設定を取得
4. `adapter.sendChat()`でLLM APIを呼び出し
5. LLMErrorの日本語変換とエラーハンドリング

---

## 3. テスト結果

### 3.1 buildMessagesテスト

```
 ✓ src/main/utils/__tests__/buildMessages.test.ts (14 tests) 20ms

 Test Files  1 passed (1)
      Tests  14 passed (14)
```

### 3.2 aiHandlers LLM統合テスト

```
 ✓ src/main/ipc/__tests__/aiHandlers.llm.test.ts (13 tests) 7ms

 Test Files  1 passed (1)
      Tests  13 passed (13)
```

### 3.3 合計

| テストスイート     | テスト数 | 結果 |
| ------------------ | -------- | ---- |
| buildMessages      | 14       | PASS |
| aiHandlers LLM統合 | 13       | PASS |
| **合計**           | **27**   | PASS |

---

## 4. 完了条件チェック

- [x] buildMessages関数が実装されている
- [x] llmConfigProvider（getSelectedLLMConfig）が実装されている
- [x] aiHandlersがLLMAdapterFactoryを使用するよう更新されている
- [x] すべてのテストが成功状態（Green）
- [x] 既存のエラーハンドリングパターンを踏襲
- [x] 本Phase内の全タスクを100%実行完了

---

## 5. 設計判断

### 5.1 既存アダプターの活用

Phase 5仕様書ではVercel AI SDKによる新規実装を提案していましたが、既存の`LLMAdapterFactory`と各プロバイダーアダプターが既に完成・テスト済みであることが判明したため、以下の設計判断を行いました：

- **採用**: 既存の`LLMAdapterFactory`パターンを活用
- **理由**: コード重複の防止、既存テストの活用、一貫したアーキテクチャの維持

### 5.2 エラー変換

`LLMError`の`code`を日本語メッセージに変換する`convertLLMErrorToMessage`関数を追加：

```typescript
function convertLLMErrorToMessage(error: LLMError): string {
  const errorMessages: Record<string, string> = {
    RATE_LIMIT:
      "レート制限に達しました。しばらく待ってから再度お試しください。",
    NETWORK_ERROR: "ネットワークエラーが発生しました。接続を確認してください。",
    // ...
  };
  return errorMessages[error.code] ?? error.message;
}
```

---

## 更新履歴

| 日付       | 版  | 変更内容 | 作成者 |
| ---------- | --- | -------- | ------ |
| 2026-01-23 | 1.0 | 初版作成 | Claude |
