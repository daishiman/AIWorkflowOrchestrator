# エッジケースと対応パターン

## 概要

マルチターン対話で発生しうるエッジケースと、その対応パターンを整理したガイド。

## エッジケース1: コンテキスト喪失

### 発生条件

- セッションタイムアウト
- サーバー再起動
- ストレージ障害
- ユーザーのブラウザクリア

### 症状

- 過去の対話履歴が参照できない
- ユーザー意図が不明
- 対話の連続性が失われる

### 対応パターン

#### パターンA: グレースフルデグラデーション

```typescript
class GracefulDegradation {
  async handleContextLoss(sessionId: string): Promise<void> {
    // 1. ユーザーに状況を説明
    await this.notifyUser("前回の会話の内容が失われました。");

    // 2. 最小限の情報で対話を再開
    await this.askUserIntent("改めて、どのようなお手伝いができますか？");

    // 3. 新しいセッションを開始
    await this.createNewSession(sessionId);
  }
}
```

#### パターンB: 部分復元

```typescript
class PartialRecovery {
  async recoverContext(sessionId: string): Promise<void> {
    // 1. 永続化されたサマリーから復元
    const summary = await this.loadSummary(sessionId);

    if (summary) {
      // 2. サマリーベースで対話を継続
      await this.notifyUser("前回の会話を部分的に復元しました。");
      await this.showSummary(summary);
    } else {
      // 3. 復元不可能な場合は新規開始
      await this.handleContextLoss(sessionId);
    }
  }
}
```

### 予防策

- 定期的なコンテキスト永続化
- サマリーの自動生成
- クリティカルな情報の優先保存
- セッションタイムアウトの警告

## エッジケース2: 超長対話

### 発生条件

- 対話ターン数が想定を大幅に超える（50ターン以上）
- コンテキストウィンドウが限界に達する
- メモリ使用量が増大

### 症状

- レスポンスが遅延
- メモリ不足エラー
- コンテキスト参照の精度低下

### 対応パターン

#### パターンA: 自動要約

```typescript
class AutoSummarization {
  private readonly TURN_THRESHOLD = 30;

  async handleLongConversation(turns: Turn[]): Promise<void> {
    if (turns.length >= this.TURN_THRESHOLD) {
      // 1. ユーザーに通知
      await this.notifyUser(
        "会話が長くなってきました。重要な内容を整理します。",
      );

      // 2. 古いターンを要約
      const oldTurns = turns.slice(0, turns.length - 10);
      const summary = await this.summarize(oldTurns);

      // 3. 最新ターンと要約を保持
      const recentTurns = turns.slice(-10);
      await this.updateContext(summary, recentTurns);

      // 4. 要約をユーザーに提示（確認用）
      await this.showSummary(summary);
    }
  }
}
```

#### パターンB: セッション分割

```typescript
class SessionSplitting {
  async splitSession(currentSession: Session): Promise<void> {
    // 1. 現在のセッションを終了
    await this.finalizeSession(currentSession);

    // 2. サマリーを作成
    const summary = await this.createSessionSummary(currentSession);

    // 3. 新しいセッションを開始（サマリーを引き継ぎ）
    const newSession = await this.createSession({
      previousSessionId: currentSession.id,
      inheritedSummary: summary,
    });

    // 4. ユーザーに通知
    await this.notifyUser(
      "新しい会話セッションを開始しました。これまでの内容は保持されています。",
    );
  }
}
```

### 予防策

- ターン数の監視
- 自動要約のトリガー設定
- ユーザーへの定期的な進捗確認
- セッション分割の提案

## エッジケース3: 意図の曖昧さ

### 発生条件

- ユーザーの発言が不明瞭
- 複数の解釈が可能
- コンテキスト不足

### 症状

- 意図の信頼度が低い
- 複数の意図候補が拮抗
- 適切な応答を生成できない

### 対応パターン

#### パターンA: 明確化質問

```typescript
class ClarificationStrategy {
  async handleAmbiguousIntent(candidates: UserIntent[]): Promise<void> {
    // 1. 候補をユーザーに提示
    await this.askUser(
      "以下のどれをお手伝いしましょうか？",
      candidates.map((c) => c.primary),
    );

    // 2. ユーザーの選択を待つ
    const selectedIntent = await this.waitForSelection();

    // 3. 選択された意図で処理を継続
    await this.processIntent(selectedIntent);
  }
}
```

#### パターンB: コンテキストベース推論

```typescript
class ContextualInference {
  async inferIntentFromContext(
    ambiguousIntent: UserIntent,
    conversationHistory: Turn[],
  ): Promise<UserIntent> {
    // 1. 過去の対話から関連性の高い意図を検索
    const relatedIntents = this.findRelatedIntents(conversationHistory);

    // 2. 関連性スコアを計算
    const scores = this.calculateRelevanceScores(
      ambiguousIntent,
      relatedIntents,
    );

    // 3. 最もスコアが高い意図を採用
    return this.selectBestIntent(scores);
  }
}
```

### 予防策

- 詳細な意図分類の定義
- コンテキストの十分な保持
- ユーザーガイダンスの提供
- フォールバック応答の準備

## エッジケース4: 並行タスク

### 発生条件

- ユーザーが複数のタスクを同時に要求
- タスクの優先度が不明確
- タスク間に依存関係がある

### 症状

- 状態管理が複雑化
- どのタスクに注力すべきか不明
- タスクの完了判定が困難

### 対応パターン

#### パターンA: 優先度確認

```typescript
class PriorityManagement {
  async handleConcurrentTasks(tasks: Task[]): Promise<void> {
    // 1. タスクをユーザーに提示
    await this.showTasks(tasks);

    // 2. 優先度を確認
    await this.askUser("どのタスクから進めましょうか？");

    // 3. 優先度順に処理
    const prioritizedTasks = await this.getPrioritizedOrder();
    await this.processTasks(prioritizedTasks);
  }
}
```

#### パターンB: タスクキュー管理

```typescript
class TaskQueueManager {
  private taskQueue: Task[] = [];
  private currentTask: Task | null = null;

  async addTask(task: Task): Promise<void> {
    this.taskQueue.push(task);
    await this.notifyUser(`タスク「${task.name}」をキューに追加しました。`);

    if (!this.currentTask) {
      await this.processNextTask();
    }
  }

  async processNextTask(): Promise<void> {
    if (this.taskQueue.length === 0) return;

    this.currentTask = this.taskQueue.shift();
    await this.notifyUser(`タスク「${this.currentTask.name}」を開始します。`);

    // タスク処理
    await this.executeTask(this.currentTask);

    // 次のタスクへ
    this.currentTask = null;
    await this.processNextTask();
  }
}
```

### 予防策

- タスク管理機能の実装
- 優先度付けのガイダンス
- タスクの可視化
- 依存関係の明示

## エッジケース5: タイムアウト

### 発生条件

- ユーザーの長時間無応答
- 処理時間の超過
- ネットワーク遅延

### 症状

- セッションの無効化
- コンテキストの喪失
- ユーザー体験の悪化

### 対応パターン

#### パターンA: ソフトタイムアウト

```typescript
class SoftTimeout {
  private readonly WARNING_THRESHOLD = 5 * 60 * 1000; // 5分
  private readonly TIMEOUT_THRESHOLD = 10 * 60 * 1000; // 10分

  async monitorActivity(sessionId: string): Promise<void> {
    const lastActivity = await this.getLastActivity(sessionId);
    const elapsed = Date.now() - lastActivity.getTime();

    if (elapsed >= this.WARNING_THRESHOLD && elapsed < this.TIMEOUT_THRESHOLD) {
      // 警告を送信
      await this.notifyUser(
        "しばらく操作がありません。セッションを継続しますか？",
      );
    } else if (elapsed >= this.TIMEOUT_THRESHOLD) {
      // タイムアウト処理
      await this.handleTimeout(sessionId);
    }
  }
}
```

#### パターンB: 状態保存型タイムアウト

```typescript
class StatefulTimeout {
  async handleTimeout(sessionId: string): Promise<void> {
    // 1. 現在の状態を保存
    const state = await this.getCurrentState(sessionId);
    await this.saveState(sessionId, state);

    // 2. ユーザーに通知
    await this.notifyUser(
      "セッションがタイムアウトしました。状態は保存されています。",
    );

    // 3. セッションを終了
    await this.closeSession(sessionId);
  }

  async resumeSession(sessionId: string): Promise<void> {
    // 保存された状態から復元
    const state = await this.loadState(sessionId);
    await this.restoreState(sessionId, state);
    await this.notifyUser("前回のセッションを復元しました。");
  }
}
```

### 予防策

- 適切なタイムアウト時間の設定
- ユーザーへの事前警告
- 自動状態保存
- 簡単なセッション復元機能

## ベストプラクティス

### すべきこと

- エッジケースを事前に想定
- ユーザーへの明確な通知
- 状態の定期的な永続化
- フォールバック処理の実装
- エラーログの記録

### 避けるべきこと

- エラーの無視
- ユーザーへの説明なし状態変更
- 予期しない状態での処理継続
- エッジケースのテスト不足
