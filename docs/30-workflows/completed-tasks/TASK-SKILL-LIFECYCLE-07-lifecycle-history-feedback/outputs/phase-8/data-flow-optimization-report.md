# Phase 8: データフロー最適化レポート

> タスク: TASK-SKILL-LIFECYCLE-07（Skill Lifecycle History & Feedback）
> フェーズ: Phase 8 - リファクタリング
> 作成日: 2026-03-16
> 種別: ドキュメント専用設計タスク（コード実行なし）

---

## 1. 目的

Phase 5 で定義されたデータフロー（SkillExecutor → EventQueue → SQLite → IPC → Zustand → UI）を可視化し、不要な変換・非効率な計算パスを特定して最適化方針を定義する。

---

## 2. データフロー全体図

```
[Main Process]
  SkillExecutor
      │ createLifecycleEvent()
      ▼
  EventQueue (in-memory buffer)
      │ batch flush (100ms debounce)
      ▼
  SQLite (source of truth)
      │ INSERT → notify via IPC
      ▼
  IPC Channel: lifecycle:events:updated
      │
[Renderer Process]
      │ safeOn() listener
      ▼
  lifecycleHistorySlice (Zustand)
      │ events[] (max 1000, LRU)
      │ aggregateViews (computed, not persisted - TECH-M-01)
      ▼
  UI Components
      ├── ScoreGateBadge (Task05)
      ├── PostExecutionActionBar (Task05)
      └── SkillManagementPanel (Task05)
```

### 2.1 フィードバックフロー

```
[Renderer Process]
  UI: フィードバック入力
      │ createFeedback()
      ▼
  IPC Channel: feedback:submit
      │
[Main Process]
      │ P42バリデーション
      ▼
  SQLite (feedback table)
      │ evaluateFeedbackRules()
      ▼
  FeedbackAction[] 生成
      │ IPC: feedback:actions:updated
      ▼
[Renderer Process]
  feedbackSlice (Zustand)
      │ pendingActions (not persisted)
      ▼
  UI: アクション表示
```

### 2.2 公開準備メトリクスフロー

```
[Renderer Process]
  UI: メトリクス表示要求
      │ IPC: publish-metrics:get
      ▼
[Main Process]
      │ buildPublishReadinessMetrics()
      │   ├── SQLite: 実行イベント取得
      │   ├── SQLite: 評価イベント取得
      │   └── SQLite: フィードバック取得
      ▼
  PublishReadinessMetrics 生成
      │ IPC response
      ▼
[Renderer Process]
  UI: メトリクス表示
```

---

## 3. 不要な変換の検出

### 3.1 aggregateViews の再計算頻度

**問題**: `buildAggregateView()` は `events[]` が更新されるたびに全スキルの集約ビューを再計算する。1000件のイベントがある場合、1件追加で全集約ビューが再計算される。

**最適化提案**: 差分計算パターン

```typescript
// 現状: 全件再計算
function onEventsUpdated(events: SkillLifecycleEvent[]) {
  const allSkills = new Set(events.map((e) => e.skillName));
  aggregateViews = Object.fromEntries(
    [...allSkills].map((name) => [name, buildAggregateView(name, events)]),
  );
}

// 最適化: 変更されたスキルのみ再計算
function onEventAdded(
  newEvent: SkillLifecycleEvent,
  events: SkillLifecycleEvent[],
) {
  aggregateViews[newEvent.skillName] = buildAggregateView(
    newEvent.skillName,
    events.filter((e) => e.skillName === newEvent.skillName),
  );
}
```

**効果**: O(N \* M) → O(M)（N: スキル数、M: 対象スキルのイベント数）

### 3.2 IPC 転送データ量

**問題**: `lifecycle:events:updated` チャンネルで全イベント配列を転送すると、structured clone のコストが高い。

**最適化提案**: 差分転送パターン

```typescript
// 現状: 全件転送
ipcRenderer.send("lifecycle:events:updated", allEvents);

// 最適化: 新規イベントのみ転送
ipcRenderer.send("lifecycle:event:added", newEvent);
// Renderer側で既存配列にマージ
```

**効果**: IPC転送データ量を O(N) → O(1) に削減

### 3.3 SQLite → Zustand の初期ロード

**問題**: アプリ起動時に SQLite から全履歴をロードすると、大量データの場合に起動が遅延する。

**最適化提案**: 遅延ロード + ページネーション

```typescript
// 初期ロード: 直近50件のみ
const initialEvents = await db.query(
  "SELECT * FROM lifecycle_events ORDER BY createdAt DESC LIMIT 50",
);

// スクロール時に追加ロード
async function loadMoreEvents(offset: number, limit: number) {
  return db.query(
    "SELECT * FROM lifecycle_events ORDER BY createdAt DESC LIMIT ? OFFSET ?",
    [limit, offset],
  );
}
```

**効果**: 起動時間の短縮（全件ロード不要）

---

## 4. 計算効率の改善提案

### 4.1 calculateSuccessRate のキャッシュ

**問題**: 同一スキルの成功率が複数箇所（AggregateView、PublishMetrics、FeedbackRules）で重複計算される。

**最適化提案**: メモ化パターン

```typescript
const successRateCache = new Map<string, { value: number; expiry: number }>();

function getCachedSuccessRate(
  skillName: SkillName,
  events: readonly SkillLifecycleEvent[],
  periodDays: number,
): number {
  const key = `${skillName}:${periodDays}`;
  const cached = successRateCache.get(key);
  if (cached && cached.expiry > Date.now()) {
    return cached.value;
  }
  const rate = calculateSuccessRate(events, skillName, periodDays);
  successRateCache.set(key, { value: rate, expiry: Date.now() + 60000 }); // 1分キャッシュ
  return rate;
}
```

**効果**: 同一レンダーサイクル内の重複計算を排除

### 4.2 calculateTrend の線形回帰最適化

**問題**: 傾き計算で毎回 windowSize 件のデータポイントに対して線形回帰を実行する。

**最適化提案**: 増分計算（オンラインアルゴリズム）

新しいデータポイント追加時に、前回の計算結果を利用して O(1) で更新可能。ただし、windowSize=5 であれば計算量は微小であり、最適化の優先度は低い。

**判定**: windowSize が小さいため、現状の実装で十分。将来 windowSize を拡大する場合に検討。

---

## 5. Zustand Store の最適化

### 5.1 events 配列の上限管理

Phase 5 で `events[]` の上限を1000件と定義済み。LRU（Least Recently Used）方式で古いイベントを除去。

**最適化提案**: 除去時の aggregateViews 整合性

```typescript
function pruneEvents(events: SkillLifecycleEvent[], maxSize: number) {
  if (events.length <= maxSize) return events;
  const pruned = events.slice(-maxSize);
  // 除去されたイベントに関連するスキルの aggregateViews を再計算
  const removedSkills = new Set(
    events.slice(0, events.length - maxSize).map((e) => e.skillName),
  );
  for (const skillName of removedSkills) {
    recalculateAggregateView(skillName, pruned);
  }
  return pruned;
}
```

### 5.2 P48準拠セレクタの最適化

Phase 5 で `useShallow` を適用済みだが、追加の最適化が可能。

```typescript
// 現状: useShallow で shallow 比較
const events = useAppStore(
  useShallow((state) => state.lifecycleHistory.events.filter(...))
);

// 追加最適化: useMemo と組み合わせてフィルタリングをメモ化
const filter = useMemo(() => createEventFilter(skillName, category), [skillName, category]);
const events = useAppStore(useShallow((state) => state.lifecycleHistory.events.filter(filter)));
```

---

## 6. 最適化サマリ

| 最適化項目            | 現状の問題     | 提案           | 効果         | 優先度 |
| --------------------- | -------------- | -------------- | ------------ | ------ |
| aggregateViews再計算  | 全スキル再計算 | 差分計算       | O(N\*M)→O(M) | 高     |
| IPC転送データ量       | 全件転送       | 差分転送       | O(N)→O(1)    | 高     |
| 初期ロード            | 全件ロード     | 遅延ロード     | 起動時間短縮 | 中     |
| successRateキャッシュ | 重複計算       | メモ化         | 計算量削減   | 中     |
| events pruning        | 整合性未保証   | 再計算トリガー | データ整合性 | 中     |
| trend計算             | 毎回線形回帰   | 現状維持       | -            | 低     |

---

## 7. Phase 3 MINOR 指摘との関連

| MINOR ID  | データフロー観点での影響                                                                                                        |
| --------- | ------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| TECH-M-01 | aggregateViews を persist しないことで、起動時の再計算コストが発生する。遅延ロードと組み合わせることで許容範囲内                |
| REQ-M-01  | minUsageCount=5 は計算ロジックのパラメータであり、データフローに影響なし                                                        |
| INT-M-01  | 期間ベースと件数ベースの両方をサポートするため、フィルタリングユーティリティの共通化が有効（deduplication-report.md 4.2節参照） |
| INT-M-02  | latestScore: number                                                                                                             | null はUI表示時のnullチェックが必要だが、データフロー自体に影響なし |
