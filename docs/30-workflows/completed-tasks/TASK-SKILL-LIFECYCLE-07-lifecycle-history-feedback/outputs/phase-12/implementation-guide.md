# 実装ガイド: ライフサイクル履歴・フィードバック統合

## メタ情報

| 項目     | 内容                    |
| -------- | ----------------------- |
| Phase    | 12 Task 12-1            |
| タスクID | TASK-SKILL-LIFECYCLE-07 |
| 作成日   | 2026-03-16              |

---

## Part 1: 概念説明（中学生でも分かるように）

### なぜライフサイクル履歴が必要なのか -- 「料理の記録帳」

あなたが毎日料理をしていると想像してください。最初はレシピ本を見ながら作り、うまくいったりいかなかったりします。もし料理の記録帳を付けていたら、「どの料理が何回成功したか」「どの料理の味がだんだん良くなっているか」「家族がどの料理を気に入ったか」が一目で分かります。

ライフサイクル履歴は、まさにこの**料理の記録帳**です。
たとえば学校の教室で使う連絡帳の例えと同じで、「何が起きたか」を時系列で残すことで次の改善判断がしやすくなります。

| 料理の世界         | ソフトウェアの世界                    |
| ------------------ | ------------------------------------- |
| レシピ             | スキル（AI に指示を出すテンプレート） |
| 料理した記録       | ライフサイクルイベント                |
| 味見の結果（点数） | 評価スコア                            |
| レシピの修正       | 改善アクション                        |
| 家族の感想         | ユーザーフィードバック                |
| 記録帳全体         | 集約ビュー（SkillAggregateView）      |

### この機能でできること（何が変わるか）

- どのスキルが安定して使えるかを、履歴とスコア推移から判断できる
- 改善前後の差分（score delta）を履歴で追跡できる
- Task08 の公開判断に必要な指標を自動で供給できる

### 5つのイベントカテゴリ -- 料理の記録を分類する

### 1. 作成（Creation）-- レシピを書く

新しいレシピを書いたり、誰かのレシピを参考にして自分のレシピを作ったりする段階です。

- `skill:created` -- 新しいレシピを書いた
- `skill:draft_saved` -- 下書きを保存した
- `skill:template_applied` -- テンプレートを土台にした

### 2. 評価（Evaluation）-- 味見する

料理を食べてみて、何点か付ける段階です。

- `skill:evaluated` -- 味見をした（スコアを付けた）
- `skill:score_updated` -- 前回と比べて点数が変わった
- `skill:gate_passed` -- 合格ラインを超えた
- `skill:gate_failed` -- 合格ラインに届かなかった

### 3. 実行（Execution）-- 実際に料理する

レシピを使って実際に料理する段階です。

- `skill:executed` -- 料理を開始した
- `skill:execution_succeeded` -- うまくできた
- `skill:execution_failed` -- 失敗した
- `skill:execution_timeout` -- 時間がかかりすぎた

### 4. 改善（Improvement）-- レシピを修正する

失敗や感想をもとに、レシピをもっと良くする段階です。

- `skill:improved` -- レシピを改善した
- `skill:version_bumped` -- バージョン番号を上げた
- `skill:feedback_applied` -- 感想を改善に反映した

### 5. 再利用（Reuse）-- レシピを他の人と共有する

良いレシピを他の人にも使ってもらう段階です。

- `skill:reused` -- 他の人が実際に使った
- `skill:recommended` -- 「おすすめレシピ」に選ばれた
- `skill:imported` -- 他のレシピとして取り込まれた
- `skill:forked` -- 派生レシピとして分岐した

### フィードバック還流 -- 「感想をもとにレシピを良くする仕組み」

家族が料理を食べて「もう少し塩が少ないほうがいい」と言ったら、次はそれを反映してレシピを修正しますよね。

これがフィードバック還流です:

```
料理する（実行）
    |
    v
家族が感想を言う（フィードバック）
    |
    v
「塩を減らす」と決める（改善アクション）
    |
    v
レシピを修正する（改善）
    |
    v
また料理する（再実行）
    |
    v
家族が「前より美味しい!」（再評価）
```

4種類のフィードバック:

| 種類           | 料理で言うと               | ソフトウェアでは           |
| -------------- | -------------------------- | -------------------------- |
| 自動計量       | 体重計で材料の量を記録     | 実行時間や成功率の自動収集 |
| 星レーティング | 料理に星を付ける（1〜5）   | ユーザーが5段階で評価      |
| コメント       | 「辛すぎた」と一言書く     | テキストでフィードバック   |
| 改善提案       | 「塩を半分にして」と具体案 | 構造化された改善提案       |

### Task05/Task08 連携 -- スキルの成長と公開

- **Task05（利用導線）**: レシピの使い方を案内する「料理教室の先生」。どのレシピが人気か、最近使ったレシピは何か、記録帳から情報を提供する
- **Task08（公開・互換性）**: レシピを「レシピ本として出版」するかの判断。十分に試して、みんなの評価が高くて、問題がないことを記録帳で確認する

---

## Part 2: 技術者向け実装詳細

### APIシグネチャ

```typescript
export interface LifecycleHistoryAPI {
  recordEvent: (event: SkillLifecycleEvent) => Promise<void>;
  queryEvents: (
    skillId: SkillName,
    limit?: number,
  ) => Promise<SkillLifecycleEvent[]>;
  getAggregateView: (skillId: SkillName) => Promise<SkillAggregateView | null>;
  getPublishReadiness: (skillId: SkillName) => Promise<PublishReadinessMetrics>;
}
```

### 使用例

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase12-implementation-guide.js \
  --workflow docs/30-workflows/skill-lifecycle-unification/tasks/step-05-par-task-07-lifecycle-history-feedback
```

```typescript
const metrics = await lifecycleHistoryAPI.getPublishReadiness(skillName);
if (metrics.qualityScore !== null && metrics.qualityScore >= 80) {
  console.log("Task08 判定候補: ready");
}
```

### エラーハンドリング方針

- EventQueue への enqueue 失敗は `errorCode` を付与して `skill:execution_failed` として記録する
- SQLite 書き込み失敗時は retry を実施し、最終失敗は `discovered-issues.md` / 未タスクへ記録する
- Renderer 側は `error: string | null` を状態として保持し、UI で recoverable 表示を行う

### エッジケース

- 初回評価前（`latestScore = null`）では trend を `"stable"` として扱う
- `skill:score_updated` の `newScore` 欠落時は `score` フィールドへフォールバックする
- `skill:execution_timeout` 連続発生時は recommendationScore を減衰させる

### 設定項目・定数一覧

- `LIFECYCLE_RECENT_EVENT_LIMIT = 50`
- `SCORE_HISTORY_LIMIT = 200`
- `PUBLISH_MIN_USAGE_COUNT = 5`
- `RECOMMENDATION_WEIGHTS = { successRate: 0.4, qualityScore: 0.4, recency: 0.2 }`

## 1. SkillLifecycleEvent 型定義

### 1.1 コア型

```typescript
// packages/shared/src/skill/lifecycle/types.ts

/** Branded型: スキル名（ファイルシステム上のディレクトリ名と一致） */
declare const _skillNameBrand: unique symbol;
export type SkillName = string & { readonly [_skillNameBrand]: "SkillName" };

/** イベントカテゴリ（5種別） */
export type LifecycleEventCategory =
  | "creation"
  | "evaluation"
  | "execution"
  | "improvement"
  | "reuse";

/** 全18イベント種別 */
export type LifecycleEventType =
  // creation (3)
  | "skill:created"
  | "skill:draft_saved"
  | "skill:template_applied"
  // evaluation (4)
  | "skill:evaluated"
  | "skill:score_updated"
  | "skill:gate_passed"
  | "skill:gate_failed"
  // execution (4)
  | "skill:executed"
  | "skill:execution_succeeded"
  | "skill:execution_failed"
  | "skill:execution_timeout"
  // improvement (3)
  | "skill:improved"
  | "skill:version_bumped"
  | "skill:feedback_applied"
  // reuse (4)
  | "skill:reused"
  | "skill:recommended"
  | "skill:imported"
  | "skill:forked";
```

### 1.2 EventMetadataByType 条件型

各イベント種別に応じたメタデータを条件型で定義する。

```typescript
/**
 * イベント種別ごとのメタデータ型マッピング
 * Record<LifecycleEventType, MetadataShape> で網羅性を保証
 */
export type EventMetadataByType = {
  "skill:created": {
    source: "manual" | "template" | "ai_generated";
    templateId?: string;
  };
  "skill:draft_saved": { draftNumber: number; changedFields: string[] };
  "skill:template_applied": { templateId: string; templateVersion: string };
  "skill:evaluated": { evaluatorId: string; score: number; criteria: string[] };
  "skill:score_updated": {
    previousScore: number;
    newScore: number;
    reason: string;
  };
  "skill:gate_passed": {
    score: number;
    thresholdScore: number;
    gateId: string;
  };
  "skill:gate_failed": {
    score: number;
    thresholdScore: number;
    gateId: string;
  };
  "skill:executed": { executionId: string; inputSummary: string };
  "skill:execution_succeeded": {
    executionId: string;
    durationMs: number;
    outputSummary: string;
  };
  "skill:execution_failed": {
    executionId: string;
    durationMs: number;
    errorCode: string;
    errorMessage: string;
  };
  "skill:execution_timeout": { executionId: string; timeoutMs: number };
  "skill:improved": {
    changeType: "prompt" | "config" | "examples" | "context";
    changeSummary: string;
  };
  "skill:version_bumped": {
    previousVersion: string;
    newVersion: string;
    bumpType: "major" | "minor" | "patch";
  };
  "skill:feedback_applied": {
    feedbackEventId: string;
    feedbackType: "rating" | "text" | "improvement_proposal";
  };
  "skill:reused": { reusedBy: string; context: string };
  "skill:recommended": { recommendedTo: string; reason: string; score: number };
  "skill:imported": { sourceUrl: string; originalAuthor: string };
  "skill:forked": { parentSkillId: string; parentVersion: string };
};
```

### 1.3 SkillLifecycleEvent 本体

```typescript
export interface SkillLifecycleEvent<
  T extends LifecycleEventType = LifecycleEventType,
> {
  /** UUID v4 */
  id: string;
  /** スキル識別子（SkillName branded型） */
  skillId: SkillName;
  /** イベント種別 */
  eventType: T;
  /** イベントカテゴリ（eventType から決定論的に導出） */
  category: LifecycleEventCategory;
  /** イベント固有メタデータ */
  metadata: EventMetadataByType[T];
  /** 発生日時（ISO 8601 UTC） */
  timestamp: string;
  /** スキルバージョン（semver） */
  version: string;
  /** 因果関係の親イベントID（ルートイベントの場合は null） */
  parentEventId: string | null;
  /** イベント発行元のアクターID（ユーザー / システム） */
  actorId: string;
}
```

## 2. SkillAggregateView 集約ロジック

### 2.1 集約ビュー型

```typescript
export interface SkillAggregateView {
  skillId: SkillName;
  skillName: string;
  totalExecutions: number;
  successCount: number;
  failureCount: number;
  successRate: number; // 0.0〜1.0
  latestScore: number | null; // 0〜100, null=未評価
  scoreHistory: ScoreDataPoint[]; // 最大200件
  trend: Trend; // "improving" | "stable" | "declining"
  recommendationScore: number; // 0.0〜1.0
  lastExecutedAt: string | null; // ISO 8601 UTC
  recentEvents: SkillLifecycleEvent[]; // 最新10件
  updatedAt: string; // 集約計算日時
}
```

### 2.2 成功率計算

```typescript
function calculateSuccessRate(
  events: SkillLifecycleEvent[],
  periodDays: number = 30,
): number {
  const cutoff = new Date(Date.now() - periodDays * 86400000).toISOString();
  const recent = events.filter(
    (e) => e.category === "execution" && e.timestamp >= cutoff,
  );
  const succeeded = recent.filter(
    (e) => e.eventType === "skill:execution_succeeded",
  ).length;
  const total = recent.filter(
    (e) => e.eventType !== "skill:executed", // 開始イベントは除外
  ).length;
  return total === 0 ? 0 : succeeded / total;
}
```

### 2.3 トレンド計算（線形回帰）

直近5回の評価スコアから傾きを算出する。

```typescript
function calculateTrend(scoreHistory: ScoreDataPoint[]): Trend {
  const recent = scoreHistory.slice(-5);
  if (recent.length < 2) return "stable";

  // 線形回帰: y = ax + b の a（傾き）を計算
  const n = recent.length;
  const xs = recent.map((_, i) => i);
  const ys = recent.map((p) => p.score);
  const sumX = xs.reduce((a, b) => a + b, 0);
  const sumY = ys.reduce((a, b) => a + b, 0);
  const sumXY = xs.reduce((a, x, i) => a + x * ys[i], 0);
  const sumXX = xs.reduce((a, x) => a + x * x, 0);
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);

  if (slope > 2.0) return "improving";
  if (slope < -2.0) return "declining";
  return "stable";
}
```

### 2.4 推薦スコア計算式

```typescript
function calculateRecommendationScore(params: RecommendationParams): number {
  const { successRate, latestScore, lastExecutedAt, referenceDate } = params;

  // 正規化: latestScore を 0〜1 範囲に変換
  const normalizedScore = latestScore / 100;

  // 新近性: 最終実行から何日経過したかで 0〜1 を算出
  const recency =
    lastExecutedAt === null
      ? 0.0
      : Math.max(0, 1 - daysSince(lastExecutedAt, referenceDate) / 30);

  // 重み付き合成
  return successRate * 0.4 + normalizedScore * 0.4 + recency * 0.2;
}
```

## 3. SkillFeedback 型とステータス遷移

### 3.1 型定義

```typescript
export interface SkillFeedback {
  id: string; // UUID v4
  skillId: string; // 対象スキルID
  feedbackType:
    | "auto_metric"
    | "user_rating"
    | "user_text"
    | "improvement_suggestion";
  value: number | string | ImprovementSuggestion;
  sourceEventId: string | null; // トリガーとなったイベントのID
  status: "pending" | "applied" | "dismissed";
  createdAt: string; // ISO 8601 UTC
  updatedAt: string; // ISO 8601 UTC
}
```

### 3.2 ステータス遷移

```
                 +-----------+
                 |  pending  |  <--- 初期状態（フィードバック記録時）
                 +-----------+
                   /       \
                  v         v
          +---------+   +-----------+
          | applied |   | dismissed |
          +---------+   +-----------+
```

- **pending -> applied**: フィードバックをもとに改善アクションが実行された
- **pending -> dismissed**: フィードバックが不採用と判断された（理由記録必須）

### 3.3 改善優先度計算式

```typescript
function calculateImprovementPriority(
  successRate: number,
  avgRating: number, // 1〜5
  feedbackCount: number,
  hasCriticalFeedback: boolean,
): number {
  const weight_sr = 0.4; // 成功率の重み
  const weight_ar = 0.3; // 平均レーティングの重み
  const weight_fc = 0.2; // フィードバック数の重み
  const weight_cf = 0.1; // クリティカルフィードバックの重み

  const normalizedRating = (5 - avgRating) / 4; // 低評価ほど高優先度
  const normalizedFc = Math.min(feedbackCount / 10, 1.0);
  const criticalBoost = hasCriticalFeedback ? 1.0 : 0.0;

  return (
    (1 - successRate) * weight_sr +
    normalizedRating * weight_ar +
    normalizedFc * weight_fc +
    criticalBoost * weight_cf
  );
}
```

## 4. PublishReadinessMetrics と Task08 契約境界

### 4.1 型定義

```typescript
export interface PublishReadinessMetrics {
  skillId: string;
  skillName: string;
  qualityScore: number | null; // 0〜100
  stabilityScore: number | null; // 0.0〜1.0
  stabilityWindowSize: number; // 実績値
  usageCount: number; // 累計実行回数
  hasCriticalFeedback: boolean;
  lastEvaluatedAt: string | null;
  calculatedAt: string;
}
```

### 4.2 readinessLevel 判定（Task08 の責務）

Task07 はデータ提供のみを責務とする。readinessLevel の判定ロジックは Task08 が定義する。

```typescript
// Task08 側で定義する判定ロジック（参考）
type ReadinessLevel = "ready" | "needs_improvement" | "not_ready";

function determineReadinessLevel(
  metrics: PublishReadinessMetrics,
): ReadinessLevel {
  // Task08 が閾値と判定ロジックを定義する
  // Task07 は getPublishReadiness(skillId) で PublishReadinessMetrics を返すのみ
}
```

### 4.3 契約境界

| 責務           | Task07                         | Task08                   |
| -------------- | ------------------------------ | ------------------------ |
| データ収集     | ライフサイクル履歴の集約       | -                        |
| メトリクス計算 | 成功率・安定性・品質スコア     | -                        |
| API 提供       | `getPublishReadiness(skillId)` | 消費のみ                 |
| 判定ロジック   | -                              | readinessLevel の判定    |
| 閾値定義       | -                              | minUsageCount=5 等の基準 |
| 公開実行       | -                              | 公開・バージョニング     |

## 5. データフロー

```
[Renderer: UI コンポーネント]
        |
        | ユーザー操作（実行、フィードバック入力）
        v
[Renderer: lifecycleHistorySlice (Zustand)]
        |
        | IPC チャンネル経由
        | (skill:lifecycle_event_emitted, skill:submitUserRating, etc.)
        v
[Preload: contextBridge]
        |
        | safeInvoke / safeOn
        v
[Main Process: LifecycleEventRecorder]
        |
        | イベントオブジェクト生成 + EventQueue バッファ
        v
[Main Process: SQLite]
        |
        | lifecycle_events テーブルに永続化
        | usage_frequency_aggregates テーブルに日次集計
        v
[Main Process: buildAggregateView()]
        |
        | 集約計算（O(n), n <= 50 直近イベント）
        v
[Main Process -> IPC -> Renderer]
        |
        | SkillAggregateView をキャッシュとして Zustand に保存
        v
[Renderer: UI 描画（セレクタ経由）]
```

## 6. 設計決定事項と根拠

### 6.1 ハイブリッド永続化（Zustand + SQLite）

**決定**: SQLite を正本、Zustand をキャッシュとして使用する二層構造を採用。

**根拠**:

- SQLite は全イベントの永続化に適しており、SQL クエリで集計が可能
- Zustand は Renderer 側の高速な UI 描画に必要（IPC 往復を毎回避ける）
- イベントの追加は Main Process で SQLite に書き込み、集約結果を IPC 経由で Renderer に送信する
- Zustand の persist ミドルウェアは events / aggregateViews を対象外とし、SQLite からの復元を優先する

### 6.2 Event Sourcing vs CRUD の選択

**決定**: ライフサイクルイベントは Event Sourcing パターンで記録し、削除しない。

**根拠**:

- ライフサイクル履歴は「何が起きたか」の完全な記録であり、後から遡って分析する必要がある
- CRUD パターンでは更新・削除により履歴が失われるリスクがある
- 集約ビュー（SkillAggregateView）はイベントストアから都度再計算可能で、べき等性が保証される
- ストレージ制約: events は 1000 件上限、scoreHistory は 200 件上限で古いものから破棄（パフォーマンス担保）

### 6.3 aggregateViews を persist から除外した理由

**決定**: Zustand の persist partialize から aggregateViews を除外する。

**根拠**:

- 集約ビューは派生データであり、SQLite のイベントストアから再計算可能
- persist に含めると localStorage のサイズが肥大化する
- Phase 3 MINOR TECH-M-01 で指摘された persist 設定矛盾を解決する方針として採用

### 6.4 minUsageCount = 5 の統計的根拠

**決定**: 公開判断に必要な最小実行回数を 5 とする。

**根拠**:

- Phase 1 では当初 3 を提案、Phase 2 で 5 に変更（Phase 3 MINOR REQ-M-01 で確定）
- 5 回は二項検定で成功率 80% 以上を p < 0.05 で棄却するための最小サンプルサイズ
- 少なすぎると偶然の成功/失敗でメトリクスが不安定になるリスクが高い

---

_作成日: 2026-03-16_
_タスクID: TASK-SKILL-LIFECYCLE-07 / Phase 12 Task 12-1_
