# 状態管理ガイド

## 概要

マルチターン対話における状態管理の設計指針とパターンを整理したガイド。

## 状態管理の基本原則

### 1. 状態の明示性

すべての状態は明示的に定義し、暗黙的な状態遷移を避ける。

### 2. 単一責任の原則

各状態は単一の責任を持ち、複数の意味を持たせない。

### 3. 追跡可能性

状態遷移の履歴を記録し、デバッグ可能にする。

### 4. 冪等性

同じ入力に対しては常に同じ状態遷移を行う。

## アプローチ1: 有限状態機械（FSM）

### 概要

明確に定義された状態と遷移ルールを持つ方式。

### 適用場面

- ウィザード型対話
- タスク完了型対話
- 状態数が限定的（< 20状態）

### 実装例

```typescript
enum ConversationState {
  INITIAL = "INITIAL",
  GATHERING_INFO = "GATHERING_INFO",
  CONFIRMING = "CONFIRMING",
  PROCESSING = "PROCESSING",
  COMPLETED = "COMPLETED",
  ERROR = "ERROR",
}

interface StateTransition {
  from: ConversationState;
  to: ConversationState;
  condition: (context: any) => boolean;
}

class FSMStateManager {
  private currentState: ConversationState = ConversationState.INITIAL;
  private transitions: StateTransition[] = [];
  private stateHistory: ConversationState[] = [];

  addTransition(transition: StateTransition): void {
    this.transitions.push(transition);
  }

  transition(context: any): boolean {
    const validTransitions = this.transitions.filter(
      (t) => t.from === this.currentState && t.condition(context),
    );

    if (validTransitions.length === 0) {
      return false;
    }

    // 最初に一致した遷移を実行
    const transition = validTransitions[0];
    this.stateHistory.push(this.currentState);
    this.currentState = transition.to;
    return true;
  }

  getCurrentState(): ConversationState {
    return this.currentState;
  }

  getHistory(): ConversationState[] {
    return this.stateHistory;
  }
}
```

### メリット

- 状態遷移が明確
- テストしやすい
- デバッグしやすい

### デメリット

- 柔軟性に欠ける
- 複雑な対話には不向き
- 状態爆発のリスク

## アプローチ2: イベント駆動

### 概要

イベントに応じて状態を更新する方式。

### 適用場面

- 柔軟な対話フロー
- 複数の並行タスク
- 非線形な対話パターン

### 実装例

```typescript
interface ConversationEvent {
  type: string;
  payload: any;
  timestamp: Date;
}

interface ConversationState {
  userIntent: string | null;
  collectedData: Record<string, any>;
  currentTasks: string[];
  completedTasks: string[];
  errors: string[];
}

class EventDrivenStateManager {
  private state: ConversationState = {
    userIntent: null,
    collectedData: {},
    currentTasks: [],
    completedTasks: [],
    errors: [],
  };
  private eventHandlers: Map<
    string,
    (state: ConversationState, event: ConversationEvent) => ConversationState
  >;

  constructor() {
    this.eventHandlers = new Map();
  }

  registerHandler(
    eventType: string,
    handler: (
      state: ConversationState,
      event: ConversationEvent,
    ) => ConversationState,
  ): void {
    this.eventHandlers.set(eventType, handler);
  }

  handleEvent(event: ConversationEvent): void {
    const handler = this.eventHandlers.get(event.type);
    if (handler) {
      this.state = handler(this.state, event);
    }
  }

  getState(): ConversationState {
    return { ...this.state };
  }
}
```

### メリット

- 柔軟性が高い
- 拡張しやすい
- 並行処理に対応

### デメリット

- 実装が複雑
- デバッグが難しい
- イベント順序の管理が必要

## アプローチ3: ルールベース

### 概要

条件とアクションのルールセットで状態を管理する方式。

### 適用場面

- ビジネスロジックが複雑
- ルールが頻繁に変更される
- ドメインエキスパートがルールを定義

### 実装例

```typescript
interface Rule {
  id: string;
  condition: (state: any) => boolean;
  action: (state: any) => any;
  priority: number;
}

class RuleBasedStateManager {
  private state: any = {};
  private rules: Rule[] = [];

  addRule(rule: Rule): void {
    this.rules.push(rule);
    this.rules.sort((a, b) => b.priority - a.priority);
  }

  applyRules(): void {
    for (const rule of this.rules) {
      if (rule.condition(this.state)) {
        this.state = rule.action(this.state);
      }
    }
  }

  updateState(updates: any): void {
    this.state = { ...this.state, ...updates };
    this.applyRules();
  }

  getState(): any {
    return { ...this.state };
  }
}
```

### メリット

- ビジネスロジックが明確
- ルール変更が容易
- 非プログラマーでも理解しやすい

### デメリット

- ルール競合のリスク
- パフォーマンスオーバーヘッド
- ルール数が増えると管理が困難

## ユーザー意図の追跡

### 意図の分類

```typescript
interface UserIntent {
  primary: string; // 主要な意図
  secondary: string[]; // 副次的な意図
  confidence: number; // 確信度 (0-1)
  entities: Record<string, any>; // 抽出されたエンティティ
}
```

### 意図の更新戦略

#### 戦略1: 上書き型

新しいターンごとに意図を完全に上書き。

**適用**: 単純な対話、意図が頻繁に変わる場合

#### 戦略2: 累積型

過去の意図を保持しつつ、新しい意図を追加。

**適用**: 複数タスク並行、長期対話

#### 戦略3: 優先度型

意図に優先度を付け、高優先度の意図を保持。

**適用**: タスク指向対話、重要度が異なるタスク

## 状態永続化

### パターン1: セッションストレージ

```typescript
class SessionStateStorage {
  async save(sessionId: string, state: any): Promise<void> {
    // セッションストレージに保存
  }

  async load(sessionId: string): Promise<any> {
    // セッションストレージから読み込み
  }
}
```

### パターン2: データベース

```typescript
class DatabaseStateStorage {
  async save(sessionId: string, state: any): Promise<void> {
    // DBに保存（トランザクション使用）
  }

  async load(sessionId: string): Promise<any> {
    // DBから読み込み
  }
}
```

## ベストプラクティス

### すべきこと

- 状態の型を明確に定義
- 状態遷移をログに記録
- 状態の検証を実装
- デフォルト状態を用意
- 状態の復元メカニズムを実装

### 避けるべきこと

- グローバル変数での状態管理
- 暗黙的な状態遷移
- 状態の直接変更（immutableを推奨）
- 状態の過度な細分化
- 永続化なしの重要な状態管理
