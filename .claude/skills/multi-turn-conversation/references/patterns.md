# マルチターン対話 - 実装パターン

## 概要

マルチターン対話の実装における設計パターンと実装戦略。
コンテキスト管理パターンの詳細は `context-patterns.md` を参照。

## 状態管理パターン

### 状態マシンパターン

```typescript
type DialoguePhase =
  | "greeting"
  | "intent_recognition"
  | "slot_filling"
  | "confirmation"
  | "execution"
  | "completion";

const transitions: Record<DialoguePhase, DialoguePhase[]> = {
  greeting: ["intent_recognition"],
  intent_recognition: ["slot_filling", "execution"],
  slot_filling: ["confirmation", "slot_filling"],
  confirmation: ["execution", "slot_filling"],
  execution: ["completion", "slot_filling"],
  completion: ["greeting"],
};

function canTransition(from: DialoguePhase, to: DialoguePhase): boolean {
  return transitions[from]?.includes(to) ?? false;
}
```

### スロットフィリングパターン

```typescript
interface Slot {
  name: string;
  type: "string" | "number" | "date" | "enum";
  required: boolean;
  value?: any;
  prompt: string;
}

interface SlotFillingState {
  slots: Slot[];
  currentSlotIndex: number;
}

function getNextSlot(state: SlotFillingState): Slot | null {
  return (
    state.slots.find((slot) => slot.required && slot.value === undefined) ??
    null
  );
}

function fillSlot(
  state: SlotFillingState,
  slotName: string,
  value: any,
): SlotFillingState {
  return {
    ...state,
    slots: state.slots.map((slot) =>
      slot.name === slotName ? { ...slot, value } : slot,
    ),
  };
}
```

## ターン管理パターン

### ターンIDジェネレータ

```typescript
class TurnIdGenerator {
  private sessionId: string;
  private counter: number = 0;

  constructor(sessionId: string) {
    this.sessionId = sessionId;
  }

  generate(): string {
    return `${this.sessionId}-${++this.counter}`;
  }
}
```

### ターンペアリング

```typescript
interface TurnPair {
  userTurn: Turn;
  assistantTurn: Turn;
  processingTimeMs: number;
}

class TurnPairManager {
  private pairs: TurnPair[] = [];
  private pendingUserTurn: Turn | null = null;

  addUserTurn(turn: Turn): void {
    this.pendingUserTurn = turn;
  }

  addAssistantTurn(turn: Turn): void {
    if (this.pendingUserTurn) {
      this.pairs.push({
        userTurn: this.pendingUserTurn,
        assistantTurn: turn,
        processingTimeMs:
          turn.timestamp.getTime() - this.pendingUserTurn.timestamp.getTime(),
      });
      this.pendingUserTurn = null;
    }
  }
}
```

## 応答生成パターン

### テンプレート応答

```typescript
const responseTemplates: Record<string, string> = {
  greeting: "こんにちは！{userName}さん、本日はどのようなご用件でしょうか？",
  slot_prompt: "{slotName}をお教えください。",
  confirmation: "{summary}でよろしいでしょうか？",
  completion: "ご利用ありがとうございました。{result}",
};

function generateResponse(
  template: string,
  context: Record<string, string>,
): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => context[key] ?? "");
}
```

### 動的応答生成

```typescript
interface ResponseGenerator {
  generate(state: DialogueState, context: ConversationContext): Promise<string>;
}

class LLMResponseGenerator implements ResponseGenerator {
  async generate(
    state: DialogueState,
    context: ConversationContext,
  ): Promise<string> {
    const prompt = this.buildPrompt(state, context);
    return await this.callLLM(prompt);
  }

  private buildPrompt(
    state: DialogueState,
    context: ConversationContext,
  ): string {
    const recentTurns = context.turns.slice(-5);
    return `
対話状態: ${JSON.stringify(state)}
最近の対話:
${recentTurns.map((t) => `${t.role}: ${t.content}`).join("\n")}

適切な応答を生成してください。
    `;
  }
}
```

## エラーハンドリングパターン

### 理解不能ハンドリング

```typescript
interface UnderstandingFailure {
  type: "no_intent" | "ambiguous" | "invalid_value";
  message: string;
  suggestions?: string[];
}

function handleUnderstanding(failure: UnderstandingFailure): string {
  switch (failure.type) {
    case "no_intent":
      return (
        "申し訳ありません、ご質問の意図を理解できませんでした。" +
        "もう少し具体的にお聞かせいただけますか？"
      );

    case "ambiguous":
      return (
        `ご質問が曖昧です。${failure.suggestions?.join("、")}` +
        "のいずれでしょうか？"
      );

    case "invalid_value":
      return `${failure.message}。正しい形式で入力してください。`;
  }
}
```

### フォールバック戦略

```typescript
const fallbackStrategies: Record<string, () => string> = {
  retry: () => "もう一度お聞かせいただけますか？",
  clarify: () => "より詳しくお聞かせください。",
  escalate: () => "オペレーターにおつなぎします。",
  reset: () => "最初からやり直しましょう。何かお手伝いできることはありますか？",
};

function getFallbackResponse(failureCount: number): string {
  if (failureCount === 1) return fallbackStrategies.retry();
  if (failureCount === 2) return fallbackStrategies.clarify();
  if (failureCount >= 3) return fallbackStrategies.escalate();
  return fallbackStrategies.reset();
}
```

## セッション管理パターン

### セッションタイムアウト

```typescript
interface SessionConfig {
  maxIdleTimeMs: number;
  maxSessionTimeMs: number;
  warningBeforeTimeoutMs: number;
}

class SessionManager {
  private lastActivityTime: Date;
  private sessionStartTime: Date;
  private config: SessionConfig;

  constructor(config: SessionConfig) {
    this.config = config;
    this.sessionStartTime = new Date();
    this.lastActivityTime = new Date();
  }

  recordActivity(): void {
    this.lastActivityTime = new Date();
  }

  getStatus(): "active" | "warning" | "expired" {
    const now = new Date();
    const idleTime = now.getTime() - this.lastActivityTime.getTime();
    const sessionTime = now.getTime() - this.sessionStartTime.getTime();

    if (sessionTime > this.config.maxSessionTimeMs) return "expired";
    if (idleTime > this.config.maxIdleTimeMs) return "expired";
    if (
      idleTime >
      this.config.maxIdleTimeMs - this.config.warningBeforeTimeoutMs
    ) {
      return "warning";
    }
    return "active";
  }
}
```

### セッション再開

```typescript
interface SessionSnapshot {
  sessionId: string;
  state: DialogueState;
  recentTurns: Turn[];
  savedAt: Date;
}

class SessionResumer {
  async resume(snapshot: SessionSnapshot): Promise<string> {
    const timeSinceSave = Date.now() - snapshot.savedAt.getTime();

    if (timeSinceSave > 24 * 60 * 60 * 1000) {
      return (
        "前回のセッションから時間が経過しています。" +
        "最初からやり直しますか？"
      );
    }

    const lastTopic = this.extractTopic(snapshot.recentTurns);
    return (
      `お帰りなさい！前回は「${lastTopic}」についてお話ししていました。` +
      "続きをお手伝いしましょうか？"
    );
  }
}
```

## モニタリングパターン

### 対話メトリクス

```typescript
interface DialogueMetrics {
  sessionId: string;
  turnCount: number;
  avgResponseTimeMs: number;
  intentRecognitionAccuracy: number;
  taskCompletionRate: number;
  userSatisfaction?: number;
}

function calculateMetrics(session: ConversationContext): DialogueMetrics {
  const pairs = extractTurnPairs(session.turns);

  return {
    sessionId: session.sessionId,
    turnCount: session.turns.length,
    avgResponseTimeMs: calculateAvgResponseTime(pairs),
    intentRecognitionAccuracy: calculateIntentAccuracy(pairs),
    taskCompletionRate: session.currentState.taskProgress / 100,
  };
}
```

## アンチパターン

| パターン          | 問題           | 解決策                   |
| ----------------- | -------------- | ------------------------ |
| Global State      | 状態の競合     | セッション単位の状態管理 |
| Context Explosion | メモリ圧迫     | コンテキスト上限設定     |
| Intent Drift      | 意図の同期ズレ | 毎ターン明示的更新       |
| Silent Failure    | エラーの隠蔽   | 適切なエラーメッセージ   |
| Infinite Retry    | 無限リトライ   | リトライ上限設定         |

## チェックリスト

### 設計時

- [ ] 対話フェーズを定義したか
- [ ] 状態遷移を明確にしたか
- [ ] コンテキスト管理方式を選定したか
- [ ] エラーハンドリング戦略を決定したか

### 実装時

- [ ] ターンIDを付与しているか
- [ ] タイムスタンプを記録しているか
- [ ] セッションタイムアウトを実装したか
- [ ] フォールバック応答を用意したか

### 運用時

- [ ] メトリクスを収集しているか
- [ ] エラーログを記録しているか
- [ ] セッション再開を実装したか
