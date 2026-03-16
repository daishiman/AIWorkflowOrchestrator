# データフロー設計書

## メタ情報

| 項目       | 内容                                                  |
| ---------- | ----------------------------------------------------- |
| Phase      | 2                                                     |
| タスク番号 | タスク5                                               |
| タスクID   | TASK-SKILL-LIFECYCLE-07                               |
| 作成日     | 2026-03-16                                            |
| 依存成果物 | `outputs/phase-1/feedback-collection-spec.md`         |
| 依存成果物 | `outputs/phase-1/lifecycle-event-catalog.md`          |
| 依存成果物 | `outputs/phase-2/publish-metrics-interface-design.md` |

---

## 1. 自動収集パイプライン

### 1.1 パイプライン概要図

```
[Main Process: SkillExecutor]
       |
       | 実行イベント発火
       | (skill:executed / skill:execution_succeeded
       |  skill:execution_failed / skill:execution_timeout)
       v
[Main Process: LifecycleEventRecorder]
       |
       | イベントオブジェクト生成
       | (SkillLifecycleEvent with metadata)
       v
+----------------------------------------------+
|  インメモリキュー（EventQueue）              |
|  - イベントを一時バッファ                    |
|  - バッチフラッシュ閾値: 10件 or 5秒         |
+----------------------------------------------+
       |
       | バッチ書き込み（SQLite）
       v
+----------------------------------------------+
|  SQLite: lifecycle_events テーブル           |
|  - 全ライフサイクルイベントの永続化          |
+----------------------------------------------+
       |
       | 日次集計バッチ（0:00 JST）
       v
+----------------------------------------------+
|  SQLite: usage_frequency_aggregates テーブル |
|  - 日次 / 週次 / 月次の集計値               |
+----------------------------------------------+
       |
       | IPC 通知（skill:lifecycle_event_emitted）
       v
[Renderer: lifecycleHistorySlice (Zustand)]
       |
       | Store 更新
       v
[UI コンポーネント（セレクタ経由）]
```

### 1.2 自動収集トリガーと記録対象

| 収集トリガー                | 記録イベント                | 記録先                  | 更新タイミング |
| --------------------------- | --------------------------- | ----------------------- | -------------- |
| SkillExecutor: 実行開始     | `skill:executed`            | SQLite lifecycle_events | リアルタイム   |
| SkillExecutor: 実行成功     | `skill:execution_succeeded` | SQLite lifecycle_events | リアルタイム   |
| SkillExecutor: 実行失敗     | `skill:execution_failed`    | SQLite lifecycle_events | リアルタイム   |
| SkillExecutor: タイムアウト | `skill:execution_timeout`   | SQLite lifecycle_events | リアルタイム   |
| ScoringGate: 評価実施       | `skill:evaluated`           | SQLite lifecycle_events | リアルタイム   |
| ScoringGate: スコア更新     | `skill:score_updated`       | SQLite lifecycle_events | リアルタイム   |
| 日次バッチ（0:00 JST）      | 集計処理                    | SQLite usage_aggregates | バッチ（日次） |

### 1.3 EventQueue バッファ設計

- バッファ容量: 100 件（超過時は即時フラッシュ）
- 自動フラッシュ間隔: 5 秒（setInterval）
- フラッシュ閾値: バッファ内 10 件以上に達した時点で即時フラッシュ
- 書き込み失敗時: 指数バックオフでリトライ（最大3回）、3回失敗時はイベントを破棄してエラーログ記録

---

## 2. 手動フィードバック UI 入力点テーブル

| 入力点                               | コンポーネント                                                | データ型                          | IPCチャンネル                                         | 発火タイミング                                     |
| ------------------------------------ | ------------------------------------------------------------- | --------------------------------- | ----------------------------------------------------- | -------------------------------------------------- |
| 実行直後の星レーティング             | `PostExecutionActionBar`                                      | `UserRating`                      | `skill:submitUserRating`                              | `skill:execution_succeeded` 後にアクションバー表示 |
| 実行直後の一言コメント               | `PostExecutionActionBar` 内テキスト入力                       | `UserTextFeedback`                | `skill:submitTextFeedback`                            | レーティングと同時送信（任意）                     |
| スキル詳細からのフィードバック       | `SkillDetailPanel`                                            | `UserRating` / `UserTextFeedback` | `skill:submitUserRating` / `skill:submitTextFeedback` | ユーザーが任意で入力（実行に依存しない）           |
| スキル詳細からの改善提案             | `SkillDetailPanel` 内「改善提案」ボタン → `ImprovementDialog` | `ImprovementSuggestion`           | `skill:submitImprovementSuggestion`                   | ユーザーが任意で入力                               |
| 履歴画面からの過去実行評価           | `HistorySearchView` タイムライン行                            | `UserRating`                      | `skill:submitUserRating`                              | 履歴リスト上の「評価」アクション選択時             |
| 履歴画面からのテキストフィードバック | `HistorySearchView` 詳細パネル                                | `UserTextFeedback`                | `skill:submitTextFeedback`                            | 履歴詳細パネルの「フィードバック」ボタン選択時     |

---

## 3. 統合データフロー図

```
[Renderer層]
+-----------------------------------------------------------+
|                                                           |
|  PostExecutionActionBar                                   |
|    - 星レーティング入力（1-5）                            |
|    - 一言コメント入力（最大500文字）                      |
|                                                           |
|  SkillDetailPanel                                         |
|    - フィードバックフォーム                               |
|    - ImprovementDialog（改善提案フォーム）                |
|                                                           |
|  HistorySearchView                                        |
|    - タイムライン行のアクションボタン                     |
|    - 過去実行へのレーティング入力                         |
|                                                           |
+-----------------------------------------------------------+
          |
          | safeInvoke(IPC_CHANNELS.SKILL_SUBMIT_*)
          | payload: { skillName, sessionId?, rating?, text? }
          v
[Preload層: contextBridge]
+-----------------------------------------------------------+
|  skillAPI.submitUserRating(payload)                       |
|  skillAPI.submitTextFeedback(payload)                     |
|  skillAPI.submitImprovementSuggestion(payload)            |
|  skillAPI.getPublishReadiness(skillName)                  |
|  skillAPI.getSkillHealthReport(skillName)                 |
|                                                           |
|  P42 バリデーション（型チェック → 空文字列 → トリム）   |
+-----------------------------------------------------------+
          |
          | IPC（ipcRenderer.invoke）
          v
[Main Process層]
+-----------------------------------------------------------+
|  IPCハンドラ（skill-lifecycle-handlers.ts）              |
|    - skill:submitUserRating                               |
|    - skill:submitTextFeedback                             |
|    - skill:submitImprovementSuggestion                    |
|    - skill:getPublishReadiness                            |
|    - skill:getSkillHealthReport                           |
|                                                           |
|  SkillLifecycleService                                    |
|    - submitFeedback(type, payload)                        |
|    - getPublishReadiness(skillName)                       |
|    - getSkillHealthReport(skillName)                      |
|                                                           |
|  SkillExecutor（自動収集トリガー）                       |
|    - onExecutionStarted() → LifecycleEventRecorder        |
|    - onExecutionCompleted() → LifecycleEventRecorder      |
+-----------------------------------------------------------+
          |
          | SQLite 書き込み（Drizzle ORM）
          v
[SQLite層]
+-----------------------------------------------------------+
|  lifecycle_events テーブル                               |
|    - 全ライフサイクルイベントの永続化                     |
|                                                           |
|  skill_feedback テーブル                                  |
|    - UserRating / UserTextFeedback / ImprovementSuggestion |
|                                                           |
|  usage_frequency_aggregates テーブル                     |
|    - 日次 / 週次 / 月次の集計値                          |
+-----------------------------------------------------------+
          |
          | 集約クエリ（SkillAggregateQueryService）
          v
[集約ビュー層]
+-----------------------------------------------------------+
|  PublishReadinessMetrics 計算                            |
|    - qualityScore: 最新評価イベントのスコア              |
|    - stabilityScore: 直近N回の成功率                     |
|    - usageCount: 累計実行回数                            |
|    - hasCriticalFeedback: critical フィードバック有無    |
|                                                           |
|  SkillAggregateView 計算                                 |
|    - successRate: 直近30日の成功率                       |
|    - trend: 直近5回スコア傾き                            |
|    - recentEvents: 最新10件のイベント                    |
+-----------------------------------------------------------+
          |
          | IPC 通知（skill:lifecycle_event_emitted）
          | または IPC レスポンス（getPublishReadiness 等）
          v
[Zustand Store層: lifecycleHistorySlice]
+-----------------------------------------------------------+
|  State                                                    |
|    - lifecycleEvents: Map<skillId, SkillLifecycleEvent[]> |
|    - aggregateViews: Map<skillId, SkillAggregateView>     |
|    - feedbackBySkill: Map<skillId, SkillFeedback[]>       |
|    - publishReadiness: Map<skillId, PublishReadinessMetrics> |
|    - isLoading: boolean                                   |
|    - error: string | null                                 |
|                                                           |
|  Actions                                                  |
|    - addLifecycleEvent(event)                             |
|    - updateAggregateView(skillId, view)                   |
|    - addFeedback(feedback)                                |
|    - setPublishReadiness(skillId, metrics)                |
|    - fetchPublishReadiness(skillId)                       |
+-----------------------------------------------------------+
          |
          | 個別セレクタ（P31対策）/ useShallow（P48対策）
          v
[UI コンポーネント層]
+-----------------------------------------------------------+
|  ScoreGateBadge                                           |
|    - useLatestQualityScore(skillId)                       |
|                                                           |
|  PostExecutionActionBar                                   |
|    - useLatestExecutionStatus(skillId)                    |
|    - useSuccessRate(skillId)                              |
|                                                           |
|  SkillManagementPanel (RecentlyUsedSection)               |
|    - useRecentlyUsedSkillsAggregates() ← useShallow 適用 |
|                                                           |
|  SkillDetailPanel                                         |
|    - useSkillAggregateView(skillId)                       |
|    - usePublishReadiness(skillId)                         |
+-----------------------------------------------------------+
```

---

## 4. IPC チャンネル一覧テーブル

| チャンネル名                        | 方向            | 引数型                                                                                                                  | レスポンス型                                       | 説明                               |
| ----------------------------------- | --------------- | ----------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- | ---------------------------------- |
| `skill:submitUserRating`            | Renderer → Main | `{ skillName: string; sessionId?: string; rating: 1\|2\|3\|4\|5 }`                                                      | `{ success: boolean; feedbackId: string }`         | ユーザー星レーティングを記録       |
| `skill:submitTextFeedback`          | Renderer → Main | `{ skillName: string; sessionId?: string; feedbackText: string }`                                                       | `{ success: boolean; feedbackId: string }`         | テキストフィードバックを記録       |
| `skill:submitImprovementSuggestion` | Renderer → Main | `{ skillName: string; targetSection: ImprovementTargetSection; suggestionText: string; priority: ImprovementPriority }` | `{ success: boolean; suggestionId: string }`       | 改善提案を記録                     |
| `skill:getPublishReadiness`         | Renderer → Main | `skillName: string`                                                                                                     | `PublishReadinessMetrics`                          | 公開準備度メトリクスを取得         |
| `skill:getSkillHealthReport`        | Renderer → Main | `skillName: string`                                                                                                     | `SkillHealthReport`                                | スキル総合ヘルスレポートを取得     |
| `skill:getLifecycleEvents`          | Renderer → Main | `{ skillName: string; limit?: number; offset?: number }`                                                                | `{ events: SkillLifecycleEvent[]; total: number }` | ライフサイクルイベント一覧を取得   |
| `skill:lifecycle_event_emitted`     | Main → Renderer | `SkillLifecycleEvent`                                                                                                   | -（通知のみ）                                      | 新規ライフサイクルイベント発生通知 |

### 4.1 IPC_CHANNELS 定数定義（Phase 5 実装時に追加予定）

```typescript
// packages/shared/src/ipc/channels.ts に追加
export const IPC_CHANNELS = {
  // ... 既存 ...
  SKILL_SUBMIT_USER_RATING: "skill:submitUserRating",
  SKILL_SUBMIT_TEXT_FEEDBACK: "skill:submitTextFeedback",
  SKILL_SUBMIT_IMPROVEMENT_SUGGESTION: "skill:submitImprovementSuggestion",
  SKILL_GET_PUBLISH_READINESS: "skill:getPublishReadiness",
  SKILL_GET_SKILL_HEALTH_REPORT: "skill:getSkillHealthReport",
  SKILL_GET_LIFECYCLE_EVENTS: "skill:getLifecycleEvents",
  SKILL_LIFECYCLE_EVENT_EMITTED: "skill:lifecycle_event_emitted",
} as const;
```

---

## 5. Zustand `lifecycleHistorySlice` 設計概要

### 5.1 State

```typescript
interface LifecycleHistoryState {
  /**
   * スキルIDをキーとしたライフサイクルイベントリスト
   * - リアルタイム受信分を保持（最大100件/スキル）
   * - 全件はSQLiteに永続化
   */
  lifecycleEvents: Record<string, SkillLifecycleEvent[]>;

  /**
   * スキルIDをキーとした集約ビューキャッシュ
   * - 実行イベント発生時にインクリメンタル更新
   */
  aggregateViews: Record<string, SkillAggregateView>;

  /**
   * スキルIDをキーとしたフィードバックリスト
   * - 手動入力直後にローカル追記（楽観的更新）
   */
  feedbackBySkill: Record<string, SkillFeedback[]>;

  /**
   * スキルIDをキーとした公開準備度メトリクスキャッシュ
   */
  publishReadiness: Record<string, PublishReadinessMetrics>;

  /** メトリクス取得中フラグ */
  isLoadingMetrics: boolean;

  /** フィードバック送信中フラグ（skillId をキーとした Map） */
  isSubmittingFeedback: Record<string, boolean>;

  /** エラーメッセージ（null = エラーなし） */
  error: string | null;
}
```

### 5.2 Actions

```typescript
interface LifecycleHistoryActions {
  /**
   * Main Process からの IPC 通知でライフサイクルイベントを追加する
   * - State にインメモリ追記
   * - 集約ビューのインクリメンタル更新をトリガー
   */
  addLifecycleEvent: (event: SkillLifecycleEvent) => void;

  /**
   * 集約ビューを更新する
   * - addLifecycleEvent の後続処理として呼び出す
   */
  updateAggregateView: (skillId: string, view: SkillAggregateView) => void;

  /**
   * フィードバックをローカル State に追記する（楽観的更新）
   */
  addFeedback: (feedback: SkillFeedback) => void;

  /**
   * 公開準備度メトリクスをキャッシュに保存する
   */
  setPublishReadiness: (
    skillId: string,
    metrics: PublishReadinessMetrics,
  ) => void;

  /**
   * IPC 経由で公開準備度メトリクスを取得し State を更新する
   */
  fetchPublishReadiness: (skillId: string) => Promise<void>;

  /**
   * ユーザーレーティングを IPC 経由で送信し State を楽観的更新する
   */
  submitUserRating: (
    skillId: string,
    sessionId: string | undefined,
    rating: 1 | 2 | 3 | 4 | 5,
  ) => Promise<void>;

  /**
   * テキストフィードバックを IPC 経由で送信し State を楽観的更新する
   */
  submitTextFeedback: (
    skillId: string,
    sessionId: string | undefined,
    feedbackText: string,
  ) => Promise<void>;

  /**
   * エラーをクリアする
   */
  clearError: () => void;
}
```

### 5.3 セレクタ（P31 / P48 対策済み）

| セレクタ名                          | 戻り値型                          | useShallow 適用 | 用途                                      |
| ----------------------------------- | --------------------------------- | --------------- | ----------------------------------------- |
| `useLatestQualityScore(skillId)`    | `number \| null`                  | 不要            | ScoreGateBadge のスコア表示               |
| `useSuccessRate(skillId)`           | `number \| null`                  | 不要            | PostExecutionActionBar の成功率表示       |
| `useAggregateView(skillId)`         | `SkillAggregateView \| null`      | 不要            | SkillDetailPanel の集約データ表示         |
| `usePublishReadiness(skillId)`      | `PublishReadinessMetrics \| null` | 不要            | Task08 との連携・SkillDetailPanel 表示    |
| `useRecentLifecycleEvents(skillId)` | `SkillLifecycleEvent[]`           | 必要（配列）    | HistorySearchView のタイムライン表示      |
| `useFeedbackBySkill(skillId)`       | `SkillFeedback[]`                 | 必要（配列）    | SkillDetailPanel のフィードバック一覧表示 |
| `useIsLoadingMetrics()`             | `boolean`                         | 不要            | ローディング状態表示                      |
| `useIsSubmittingFeedback(skillId)`  | `boolean`                         | 不要            | フィードバック送信中表示                  |

### 5.4 Persist 設定

```typescript
// lifecycleHistorySlice の persist 設定
const persistConfig = {
  name: "lifecycle-history-store",
  // State の一部のみ永続化（重いデータはメモリのみ）
  partialize: (state: LifecycleHistoryState) => ({
    // 最新の集約ビューのみ persist（イベント詳細は SQLite が正本）
    aggregateViews: state.aggregateViews,
    publishReadiness: state.publishReadiness,
  }),
};
```

---

## 6. エラーハンドリング方針

### 6.1 各層でのエラー処理

| 層                       | エラー種別                   | 処理方針                                                                                                                                                |
| ------------------------ | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Renderer（UI）           | フォームバリデーションエラー | ローカルで即時フィードバック（文字数カウンター、エラーメッセージ表示）。IPC 送信しない                                                                  |
| Preload（contextBridge） | P42 バリデーションエラー     | 型チェック → 空文字列 → トリム空文字列の3段階バリデーション。失敗時は `{ success: false, error: { code: "VALIDATION_ERROR", message: string } }` を返す |
| Main Process（IPC）      | バリデーションエラー         | Preload と同一のP42バリデーション。失敗時は `{ success: false, error }` を返す                                                                          |
| Main Process（IPC）      | スキル未存在エラー           | `{ success: false, error: { code: "NOT_FOUND", message: "Skill not found" } }` を返す                                                                   |
| Main Process（SQLite）   | 書き込みエラー               | 指数バックオフでリトライ（最大3回）。3回失敗時はエラーログ記録・イベント破棄（データ損失許容）                                                          |
| Main Process（集計）     | 集計クエリエラー             | エラーログ記録後、`null` / 空配列を返す（部分的なデータ欠損を許容）                                                                                     |
| Zustand Store            | fetchPublishReadiness 失敗   | `isLoadingMetrics = false`、`error` にエラーメッセージを設定。UI でエラートーストを表示                                                                 |
| Zustand Store            | submitFeedback 失敗          | `isSubmittingFeedback[skillId] = false`、楽観的更新を rollback。UI でエラートーストを表示                                                               |

### 6.2 フィードバック送信の楽観的更新と rollback

```
1. UI: フィードバック送信ボタン押下
2. Store: isSubmittingFeedback[skillId] = true
3. Store: addFeedback(optimisticFeedback)  // 楽観的追記
4. IPC: skill:submitUserRating / skill:submitTextFeedback
5a. 成功時:
      Store: feedbackId を optimisticFeedback.id に更新
      Store: isSubmittingFeedback[skillId] = false
5b. 失敗時:
      Store: feedbackBySkill[skillId] から optimisticFeedback を削除（rollback）
      Store: isSubmittingFeedback[skillId] = false
      Store: error = "フィードバックの送信に失敗しました"
      UI: エラートーストを表示
```

### 6.3 EventQueue フラッシュ失敗時のフォールバック

```
1. EventQueue: バッファに新規イベント追加
2. SQLite 書き込み試行
3a. 成功時: バッファからイベント削除
3b. 失敗時 (1回目): 1秒後にリトライ（指数バックオフ）
3c. 失敗時 (2回目): 2秒後にリトライ
3d. 失敗時 (3回目): イベント破棄 + エラーログ記録
     - electron-log でエラーレベルのログを出力
     - PII を含む metadata はサニタイズしてからログ出力
```

### 6.4 IPC 通知受信失敗時の対応

- `skill:lifecycle_event_emitted` の受信失敗: Renderer は次回の IPC 呼び出し（`skill:getLifecycleEvents`）時にデータを再取得する
- Store のインメモリキャッシュが古くなる可能性があるが、SQLite が正本データソースであるため整合性は保たれる
- `HistorySearchView` を開いた時点で `skill:getLifecycleEvents` を IPC 呼び出しして最新データを取得するポーリング方式を採用する

---

## 7. 自動収集と手動フィードバックの役割分担サマリー

| 区分     | 収集元                 | 記録プロセス | 入力タイミング                     | 対応する IPC チャンネル                                                                     |
| -------- | ---------------------- | ------------ | ---------------------------------- | ------------------------------------------------------------------------------------------- |
| 自動収集 | SkillExecutor          | Main Process | 実行イベント発生時（リアルタイム） | なし（Main 内部で直接記録）                                                                 |
| 自動収集 | ScoringGate            | Main Process | 評価イベント発生時（リアルタイム） | なし（Main 内部で直接記録）                                                                 |
| 自動収集 | 集計バッチ             | Main Process | 日次 0:00 JST                      | なし（setInterval または electron-cron で定期実行）                                         |
| 手動入力 | PostExecutionActionBar | Renderer     | 実行直後（任意）                   | `skill:submitUserRating` / `skill:submitTextFeedback`                                       |
| 手動入力 | SkillDetailPanel       | Renderer     | 任意タイミング                     | `skill:submitUserRating` / `skill:submitTextFeedback` / `skill:submitImprovementSuggestion` |
| 手動入力 | HistorySearchView      | Renderer     | 履歴閲覧時（任意）                 | `skill:submitUserRating` / `skill:submitTextFeedback`                                       |
