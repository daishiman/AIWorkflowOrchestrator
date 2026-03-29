# Phase 1: 仕様抽出マップ

## 抽出対象

### SkillExecutor.ts (L467-487, L899-938)

```typescript
// L467-477: ローカル SDKMessage interface
interface SDKMessage {
  type?: string;
  content?: string;
  tool_use?: { name: string; input: unknown };
  error?: { message: string };
}

// L482-487: ローカル型ガード
function isValidSDKMessage(message: unknown): message is SDKMessage {
  if (message === null || typeof message !== "object") {
    return false;
  }
  return true;
}

// L899-938: convertToStreamMessage() - msg.type による分岐
```

### sdkMessageNormalizer.ts (L29-55)

```typescript
// L34: null/非オブジェクト判定
if (rawMessage == null || typeof rawMessage !== "object") { ... }

// L38: Record へのキャスト
const msg = rawMessage as Record<string, unknown>;

// L39: type フィールドの安全な読取り
const msgType = typeof msg.type === "string" ? msg.type : undefined;
```

## 共通化対象の確定

| 抽出ロジック          | 抽出先関数             | 備考                           |
| --------------------- | ---------------------- | ------------------------------ |
| null/非object排除     | `asSdkMessageRecord()` | 配列も排除する                 |
| type フィールド読取り | `getSdkMessageType()`  | string 以外は undefined を返す |

## 共通化しない対象

- `SDKMessage` interface → SkillExecutor 内でのみ使用される lane 固有型
- `convertToStreamMessage()` の分岐ロジック → lane 固有
- `normalizeSystemMessage()` 等の helper → lane 固有
