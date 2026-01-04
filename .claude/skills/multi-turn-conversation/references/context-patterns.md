# コンテキスト管理パターン集

## 概要

マルチターン対話におけるコンテキスト管理の実装パターンを整理したガイド。

## パターン1: スライディングウィンドウ

### 概要

最新N個のターンのみを保持し、古いターンは破棄する方式。

### 適用場面

- メモリ制約が厳しい環境
- 短期的な対話（5-10ターン程度）
- リアルタイム性が重要なケース

### 実装例

```typescript
interface Turn {
  id: number;
  userMessage: string;
  agentResponse: string;
  timestamp: Date;
}

class SlidingWindowContext {
  private turns: Turn[] = [];
  private readonly windowSize: number;

  constructor(windowSize: number = 5) {
    this.windowSize = windowSize;
  }

  addTurn(turn: Turn): void {
    this.turns.push(turn);
    if (this.turns.length > this.windowSize) {
      this.turns.shift(); // 最古のターンを削除
    }
  }

  getContext(): Turn[] {
    return this.turns;
  }
}
```

### メリット

- 実装がシンプル
- メモリ使用量が一定
- 処理速度が安定

### デメリット

- 古い情報が失われる
- 長期的な文脈が必要な対話には不向き

## パターン2: サマリーベース

### 概要

古いターンを要約して保持し、詳細は破棄する方式。

### 適用場面

- 長期対話（20ターン以上）
- 過去の文脈が重要なケース
- 要約可能な内容（タスク管理、プロジェクト進捗等）

### 実装例

```typescript
interface ConversationSummary {
  totalTurns: number;
  keyPoints: string[];
  userGoals: string[];
  completedActions: string[];
}

class SummaryBasedContext {
  private recentTurns: Turn[] = [];
  private summary: ConversationSummary;
  private readonly recentWindow: number = 3;

  constructor() {
    this.summary = {
      totalTurns: 0,
      keyPoints: [],
      userGoals: [],
      completedActions: [],
    };
  }

  addTurn(turn: Turn): void {
    this.recentTurns.push(turn);
    this.summary.totalTurns++;

    if (this.recentTurns.length > this.recentWindow) {
      const oldestTurn = this.recentTurns.shift();
      this.updateSummary(oldestTurn);
    }
  }

  private updateSummary(turn: Turn): void {
    // LLMを使用してターンから重要情報を抽出し、サマリーを更新
    // 実装は省略
  }

  getContext(): { recent: Turn[]; summary: ConversationSummary } {
    return {
      recent: this.recentTurns,
      summary: this.summary,
    };
  }
}
```

### メリット

- 長期対話に対応可能
- 重要情報を保持
- メモリ効率が良い

### デメリット

- 要約処理のコストが発生
- 情報の欠損リスク
- 実装が複雑

## パターン3: 階層ストレージ

### 概要

ホットストレージ（メモリ）とコールドストレージ（DB）を組み合わせる方式。

### 適用場面

- 非常に長期的な対話
- 監査要件がある場合
- セッション再開が必要なケース

### 実装例

```typescript
interface StorageLayer {
  save(turns: Turn[]): Promise<void>;
  load(sessionId: string, limit: number): Promise<Turn[]>;
}

class HierarchicalContext {
  private hotStorage: Turn[] = [];
  private coldStorage: StorageLayer;
  private readonly hotLimit: number = 10;
  private sessionId: string;

  constructor(sessionId: string, coldStorage: StorageLayer) {
    this.sessionId = sessionId;
    this.coldStorage = coldStorage;
  }

  async addTurn(turn: Turn): Promise<void> {
    this.hotStorage.push(turn);

    if (this.hotStorage.length > this.hotLimit) {
      const toArchive = this.hotStorage.slice(0, this.hotLimit / 2);
      await this.coldStorage.save(toArchive);
      this.hotStorage = this.hotStorage.slice(this.hotLimit / 2);
    }
  }

  async getContext(depth: "hot" | "full"): Promise<Turn[]> {
    if (depth === "hot") {
      return this.hotStorage;
    }

    const archivedTurns = await this.coldStorage.load(this.sessionId, 50);
    return [...archivedTurns, ...this.hotStorage];
  }
}
```

### メリット

- 完全な履歴保持
- セッション再開可能
- 監査要件を満たせる

### デメリット

- 実装が最も複雑
- DBアクセスのオーバーヘッド
- インフラコストが発生

## パターン選定ガイド

| 要件                    | 推奨パターン                     |
| ----------------------- | -------------------------------- |
| 短期対話（< 10ターン）  | スライディングウィンドウ         |
| 中期対話（10-30ターン） | サマリーベース                   |
| 長期対話（> 30ターン）  | 階層ストレージ                   |
| メモリ制約が厳しい      | スライディングウィンドウ         |
| 監査要件あり            | 階層ストレージ                   |
| リアルタイム性重視      | スライディングウィンドウ         |
| 過去の文脈が重要        | サマリーベース or 階層ストレージ |

## ベストプラクティス

### すべきこと

- ターンごとにタイムスタンプを記録
- コンテキストサイズの上限を設定
- 定期的にコンテキストをクリーンアップ
- ユーザーにコンテキストの状態を通知（必要に応じて）

### 避けるべきこと

- 無制限にコンテキストを保持
- コンテキストの一貫性チェックを怠る
- サマリー化時の情報欠損を考慮しない
- コンテキスト取得時のパフォーマンスを無視
