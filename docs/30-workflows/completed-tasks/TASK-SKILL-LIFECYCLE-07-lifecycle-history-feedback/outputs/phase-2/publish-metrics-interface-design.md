# 公開メトリクスインターフェース設計書

## メタ情報

| 項目       | 内容                                           |
| ---------- | ---------------------------------------------- |
| Phase      | 2                                              |
| タスク番号 | タスク4                                        |
| タスクID   | TASK-SKILL-LIFECYCLE-07                        |
| 作成日     | 2026-03-16                                     |
| 依存成果物 | `outputs/phase-1/task08-metrics-definition.md` |
| 提供先     | Task08（TASK-SKILL-LIFECYCLE-08）              |

---

## 1. TypeScript 型定義

### 1.1 `PublishReadinessMetrics`

Task07 が Task08 へ提供する公開準備度メトリクスの主型。データ収集・計算は Task07 の責務。

```typescript
/**
 * Task07 が Task08 へ提供する公開準備度メトリクス
 * データ収集・計算は Task07 の責務
 * readinessLevel の判定ロジックは Task08 の責務
 */
export interface PublishReadinessMetrics {
  /** スキル識別子（SkillName 形式） */
  skillId: string;
  /** スキル名（表示用） */
  skillName: string;
  /** 最新の評価スコア（0〜100）。評価未実施の場合は null */
  qualityScore: number | null;
  /** 直近 stabilityWindowSize 回の実行成功率（0.0〜1.0）。実行履歴がない場合は null */
  stabilityScore: number | null;
  /** 安定性計算に使用した実行履歴件数（stabilityWindowSize 以下の実績値） */
  stabilityWindowSize: number;
  /** 累計実行回数 */
  usageCount: number;
  /** severity='critical' のフィードバックが存在するか */
  hasCriticalFeedback: boolean;
  /** 最終評価日時（ISO 8601 UTC）。評価未実施の場合は null */
  lastEvaluatedAt: string | null;
  /** メトリクス計算日時（ISO 8601 UTC） */
  calculatedAt: string;
}
```

### 1.2 `SkillHealthReport`

Task08 またはスキル詳細画面が要求する統合ヘルスレポート。`PublishReadinessMetrics` を内包する。

```typescript
/**
 * Task07 が Task08 またはスキル詳細画面へ提供するスキル総合ヘルスレポート
 * PublishReadinessMetrics + 履歴サマリーを統合したビュー
 */
export interface SkillHealthReport {
  /** スキル識別子（SkillName 形式） */
  skillId: string;
  /** スキル名（表示用） */
  skillName: string;
  /** 公開準備度メトリクス */
  publishReadiness: PublishReadinessMetrics;
  /** 直近30日の実行サマリー */
  recentExecutionSummary: {
    /** 直近30日の総実行回数 */
    totalExecutions: number;
    /** 直近30日の成功回数 */
    successCount: number;
    /** 直近30日の失敗回数 */
    failureCount: number;
    /** 直近30日のタイムアウト回数 */
    timeoutCount: number;
    /** 直近30日の平均実行時間（ミリ秒）。実行0件時は null */
    avgDurationMs: number | null;
  };
  /** スコア推移（評価イベント昇順） */
  scoreHistory: Array<{
    /** 評価日時（ISO 8601 UTC） */
    evaluatedAt: string;
    /** スコア（0〜100） */
    score: number;
    /** スキルバージョン（semver） */
    version: string;
  }>;
  /** フィードバックサマリー */
  feedbackSummary: {
    /** 全フィードバック件数 */
    total: number;
    /** severity='critical' 件数 */
    criticalCount: number;
    /** severity='warning' 件数 */
    warningCount: number;
    /** 平均ユーザーレーティング（1〜5）。未評価の場合は null */
    avgUserRating: number | null;
  };
  /** レポート生成日時（ISO 8601 UTC） */
  generatedAt: string;
}
```

### 1.3 `PublishThresholds`

Task08 が公開判断に使用する閾値セット。Task07 が提供するデフォルト値をベースに Task08 がオーバーライドする。

```typescript
/**
 * Task08 が設定する公開判断閾値
 * Task07 が DEFAULT_PUBLISH_THRESHOLDS を提供し、Task08 がポリシーに応じてオーバーライドする
 */
export interface PublishThresholds {
  /** 公開に必要な最低品質スコア（デフォルト: 70） */
  minQualityScore: number;
  /** 公開に必要な最低安定性スコア（デフォルト: 0.8） */
  minStabilityScore: number;
  /** 安定性計算に使用する直近N回の実行数（デフォルト: 10） */
  stabilityWindowSize: number;
  /** 公開に必要な最低実行回数（デフォルト: 5） */
  minUsageCount: number;
}

/**
 * Task07 が提供するデフォルト閾値
 * Task08 はこれを PublishThresholds としてオーバーライド可能
 */
export const DEFAULT_PUBLISH_THRESHOLDS: Readonly<PublishThresholds> = {
  minQualityScore: 70,
  minStabilityScore: 0.8,
  stabilityWindowSize: 10,
  minUsageCount: 5,
} as const;
```

### 1.4 `ReadinessLevel` / `ReadinessResult`

readinessLevel の3段階判定結果型。Task08 が `PublishReadinessMetrics` と `PublishThresholds` を照合して算出する。

```typescript
/** readinessLevel の3段階判定 */
export type ReadinessLevel = "not_ready" | "review_needed" | "ready";

/** readinessLevel 判定理由コード */
export type ReadinessReasonCode =
  | "CRITICAL_FEEDBACK_EXISTS"
  | "INSUFFICIENT_USAGE"
  | "QUALITY_SCORE_BELOW_THRESHOLD"
  | "STABILITY_BELOW_THRESHOLD"
  | null;

/**
 * readinessLevel 判定結果（Task08 が算出して保持する）
 * Task07 はデータ提供のみ。判定結果オブジェクトは Task08 が生成する
 */
export interface ReadinessResult {
  level: ReadinessLevel;
  /**
   * not_ready / review_needed の場合の理由コード
   * ready の場合は null
   */
  reason: ReadinessReasonCode;
}
```

---

## 2. `calculatePublishReadiness` 関数仕様

> この関数は Task08 の実装対象。Task07 が提供する `PublishReadinessMetrics` と `PublishThresholds` を受け取り `ReadinessResult` を返す。Task07 は参考フローとして定義のみ行い、実装しない。

### 2.1 シグネチャ

```typescript
/**
 * PublishReadinessMetrics と PublishThresholds を照合して ReadinessResult を返す
 * @param metrics - Task07 が提供する公開準備度メトリクス
 * @param thresholds - Task08 が設定する公開判断閾値（省略時は DEFAULT_PUBLISH_THRESHOLDS）
 * @returns ReadinessResult - readinessLevel と reason を含む判定結果
 */
function calculatePublishReadiness(
  metrics: PublishReadinessMetrics,
  thresholds: PublishThresholds = DEFAULT_PUBLISH_THRESHOLDS,
): ReadinessResult;
```

### 2.2 判定アルゴリズム（フロー）

```
入力: metrics: PublishReadinessMetrics, thresholds: PublishThresholds

Step 1: 即時 not_ready 条件チェック（critical フィードバック）
  if (metrics.hasCriticalFeedback === true)
    return { level: "not_ready", reason: "CRITICAL_FEEDBACK_EXISTS" }

Step 2: 最低実行回数チェック
  if (metrics.usageCount < thresholds.minUsageCount)
    return { level: "not_ready", reason: "INSUFFICIENT_USAGE" }

Step 3: 品質スコアチェック
  qualityScore = metrics.qualityScore ?? 0  // null は 0 として扱う
  if (qualityScore < thresholds.minQualityScore)
    return { level: "not_ready", reason: "QUALITY_SCORE_BELOW_THRESHOLD" }

Step 4: 安定性チェック（review_needed）
  stabilityScore = metrics.stabilityScore ?? 0  // null は 0 として扱う
  if (stabilityScore < thresholds.minStabilityScore)
    return { level: "review_needed", reason: "STABILITY_BELOW_THRESHOLD" }

Step 5: 全条件クリア
  return { level: "ready", reason: null }
```

### 2.3 readinessLevel 判定マトリクス

| readinessLevel  | 条件（すべて満たす場合）                                                               | 推奨アクション（Task08 が実装）      |
| --------------- | -------------------------------------------------------------------------------------- | ------------------------------------ |
| `ready`         | qualityScore >= 70 && stabilityScore >= 0.8 && usageCount >= 5 && !hasCriticalFeedback | 公開ボタン活性化                     |
| `review_needed` | qualityScore >= 70 && usageCount >= 5 && !hasCriticalFeedback && stabilityScore < 0.8  | レビュアー承認フローへ誘導           |
| `not_ready`     | 上記以外（hasCriticalFeedback, usageCount < 5, qualityScore < 70 のいずれかを満たす）  | 公開ボタン非活性・改善メッセージ表示 |

### 2.4 境界値の定義

| 指標                  | 評価未実施（null）扱い               | 境界値                   | Task08 オーバーライド可否 |
| --------------------- | ------------------------------------ | ------------------------ | ------------------------- |
| `qualityScore`        | 0 として判定（not_ready になる）     | 70 未満で not_ready      | 可能                      |
| `stabilityScore`      | 0 として判定（review_needed になる） | 0.8 未満で review_needed | 可能                      |
| `usageCount`          | 0（0 件は not_ready）                | 5 未満で not_ready       | 可能                      |
| `hasCriticalFeedback` | -                                    | true は即時 not_ready    | 不可（安全側固定）        |

---

## 3. IPCハンドラ仕様

### 3.1 チャンネル一覧

| チャンネル名                 | 方向            | 説明                           |
| ---------------------------- | --------------- | ------------------------------ |
| `skill:getPublishReadiness`  | Renderer → Main | 公開準備度メトリクスを取得     |
| `skill:getSkillHealthReport` | Renderer → Main | スキル総合ヘルスレポートを取得 |

### 3.2 `skill:getPublishReadiness`

**目的**: 特定スキルの `PublishReadinessMetrics` を取得する。

| 項目             | 内容                                                                                                |
| ---------------- | --------------------------------------------------------------------------------------------------- |
| チャンネル名     | `skill:getPublishReadiness`                                                                         |
| 実装責務         | Task07（TASK-SKILL-LIFECYCLE-07）Main Process ハンドラ                                              |
| 呼び出し元       | Task08（TASK-SKILL-LIFECYCLE-08）または SkillDetailPanel                                            |
| 引数型           | `skillName: string`（スキル識別子。SkillName 形式）                                                 |
| レスポンス型     | `Promise<PublishReadinessMetrics>`                                                                  |
| エラーレスポンス | `{ code: 'NOT_FOUND', message: 'Skill not found' }` / `{ code: 'INTERNAL_ERROR', message: string }` |

**P42バリデーション（3段階）**:

```typescript
ipcMain.handle(
  IPC_CHANNELS.SKILL_GET_PUBLISH_READINESS,
  async (event, skillName: unknown) => {
    // Stage 1: 型チェック
    if (typeof skillName !== "string") {
      return {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "skillName must be a string",
        },
      };
    }
    // Stage 2: 空文字列チェック
    if (skillName === "") {
      return {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "skillName must not be empty",
        },
      };
    }
    // Stage 3: トリム後空文字列チェック
    if (skillName.trim() === "") {
      return {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "skillName must not be blank",
        },
      };
    }
    // 処理本体
    return skillLifecycleService.getPublishReadiness(skillName.trim());
  },
);
```

**処理手順**:

1. `skillName` でライフサイクル履歴を照会する
2. 評価イベント（`skill:evaluated`, `skill:score_updated`）から最新 `qualityScore` を抽出する（存在しない場合は `null`）
3. 実行イベント（`skill:executed`, `skill:execution_succeeded`, `skill:execution_failed`）から直近 `stabilityWindowSize` 件を取得し `stabilityScore` を算出する（存在しない場合は `null`）
4. 実行イベント総数から `usageCount` を集計する
5. `SkillFeedback` ストアで `severity='critical'` の存在を確認し `hasCriticalFeedback` を設定する
6. `PublishReadinessMetrics` オブジェクトを生成して返す

---

### 3.3 `skill:getSkillHealthReport`

**目的**: 公開判断に必要な全データを集約した `SkillHealthReport` を取得する。

| 項目             | 内容                                                                                                |
| ---------------- | --------------------------------------------------------------------------------------------------- |
| チャンネル名     | `skill:getSkillHealthReport`                                                                        |
| 実装責務         | Task07（TASK-SKILL-LIFECYCLE-07）Main Process ハンドラ                                              |
| 呼び出し元       | Task08（TASK-SKILL-LIFECYCLE-08）またはスキル詳細画面                                               |
| 引数型           | `skillName: string`（スキル識別子。SkillName 形式）                                                 |
| レスポンス型     | `Promise<SkillHealthReport>`                                                                        |
| エラーレスポンス | `{ code: 'NOT_FOUND', message: 'Skill not found' }` / `{ code: 'INTERNAL_ERROR', message: string }` |

**P42バリデーション**: `skill:getPublishReadiness` と同一の3段階バリデーションを適用する。

**処理手順**:

1. `getPublishReadiness(skillName)` を呼び出し `PublishReadinessMetrics` を取得する
2. 直近30日の実行イベントを集計し `recentExecutionSummary` を構築する
3. 評価イベントを時系列昇順に並べ `scoreHistory` 配列を構築する
4. `SkillFeedback` ストアを集計し `feedbackSummary` を構築する（平均ユーザーレーティングを含む）
5. `SkillHealthReport` オブジェクトを返す

---

## 4. Task08 契約境界の定義

### 4.1 責務分担マトリクス

| 責務項目                            | Task07 の責務                    | Task08 の責務    |
| ----------------------------------- | -------------------------------- | ---------------- |
| ライフサイクルイベントの記録        | 実装・管理                       | 参照のみ         |
| SkillFeedback の保存                | 実装・管理                       | 参照のみ         |
| `qualityScore` の計算               | 実装（評価イベントから抽出）     | 閾値比較のみ     |
| `stabilityScore` の計算             | 実装（実行イベントから算出）     | 閾値比較のみ     |
| `usageCount` の集計                 | 実装（実行イベントをカウント）   | 閾値比較のみ     |
| `hasCriticalFeedback` の判定        | 実装（フィードバックを照会）     | 公開ブロック判断 |
| `DEFAULT_PUBLISH_THRESHOLDS` の提供 | 実装（定数として公開）           | オーバーライド   |
| `readinessLevel` の判定ロジック     | 参考フロー提供のみ（実装対象外） | 実装・決定       |
| `PublishThresholds` の最終設定      | デフォルト値提供のみ             | 最終値決定・管理 |
| 公開アクション（UI・IPC）           | 対象外                           | 実装             |
| Skill Center との連携               | 対象外                           | 実装             |
| バージョン互換性チェック            | 対象外                           | 実装             |

### 4.2 データフロー境界図

```
[Task07 の責務範囲]
  LifecycleEventStore
    ├── skill:evaluated       → qualityScore, lastEvaluatedAt, scoreHistory
    ├── skill:executed        → usageCount, recentExecutionSummary
    ├── skill:execution_succeeded / failed → stabilityScore
    └── skill:score_updated   → scoreHistory

  SkillFeedback ストア
    ├── severity='critical'   → hasCriticalFeedback, feedbackSummary.criticalCount
    ├── severity='warning'    → feedbackSummary.warningCount
    └── user_rating 集計      → feedbackSummary.avgUserRating

  [IPC 境界: skill:getPublishReadiness / skill:getSkillHealthReport]
                    ↓
[Task08 の責務範囲]
  PublishReadinessMetrics  +  PublishThresholds
    └── calculatePublishReadiness()
          └── ReadinessResult → 公開ボタン状態制御・承認フロー制御
```

### 4.3 設計上の不変条件

1. Task07 は `PublishReadinessMetrics` を提供するが、`readinessLevel` フィールドを持たない。`readinessLevel` の算出は Task08 の責務とする
2. `hasCriticalFeedback = true` の場合の公開ブロックは Task07 の判定フロー参照仕様で必須条件として定義する。Task08 はこれを安全側固定として受け入れ、オーバーライドしない
3. IPC チャンネル名は `IPC_CHANNELS` 定数（`packages/shared/src/ipc/channels.ts` に配置予定）で管理し、文字列リテラルを直接使用しない

### 4.4 IPC_CHANNELS 定数定義（Phase 5 実装時に確定）

```typescript
// packages/shared/src/ipc/channels.ts（Phase 5 で追加予定）
export const IPC_CHANNELS = {
  // ... 既存チャンネル ...
  SKILL_GET_PUBLISH_READINESS: "skill:getPublishReadiness",
  SKILL_GET_SKILL_HEALTH_REPORT: "skill:getSkillHealthReport",
} as const;
```

---

## 5. データソース接続関係

```
LifecycleEventStore（Task07 管理）
  ├── 評価イベント
  │     skill:evaluated / skill:score_updated
  │     → qualityScore, lastEvaluatedAt, scoreHistory
  │
  ├── 実行イベント
  │     skill:executed
  │     → usageCount, recentExecutionSummary.totalExecutions
  │
  ├── 実行結果イベント
  │     skill:execution_succeeded / skill:execution_failed / skill:execution_timeout
  │     → stabilityScore, recentExecutionSummary.successCount / failureCount / timeoutCount
  │     → recentExecutionSummary.avgDurationMs
  │
  └── 改善イベント
        skill:improved
        → scoreHistory（バージョン情報の補完）

SkillFeedback ストア（Task07 管理）
  ├── severity='critical'    → hasCriticalFeedback, feedbackSummary.criticalCount
  ├── severity='warning'     → feedbackSummary.warningCount
  └── user_rating 集計       → feedbackSummary.avgUserRating

                  [IPC 境界]
                       ↓
PublishReadinessMetrics（Task07 → Task08 に提供）
  └── Task08 が PublishThresholds と照合
        └── ReadinessResult（level, reason）
              └── UI 状態制御（公開ボタン活性/非活性・承認フロー）
```

---

## 6. 設計考慮事項

### 6.1 null 安全性

- `qualityScore` / `stabilityScore` / `lastEvaluatedAt` は評価・実行履歴がない場合に `null` となる。Task08 の `calculatePublishReadiness` は `null` を 0 として扱い、必ず `not_ready` に落とすこと
- `avgUserRating` は手動フィードバック未入力時は `null`。`null` は公開判断に影響しない（必須指標ではない）

### 6.2 `packages/shared` への型配置

- `PublishReadinessMetrics` / `SkillHealthReport` / `PublishThresholds` / `ReadinessLevel` / `ReadinessResult` / `DEFAULT_PUBLISH_THRESHOLDS` は `packages/shared/src/types/skill-lifecycle.ts` に配置する
- Task07 の Main Process と Task08 の Renderer 双方から import するため shared への配置が必須

### 6.3 P31/P48 対策

- Zustand Store で `PublishReadinessMetrics` を保持する場合、セレクタは個別フィールドセレクタ（`usePublishReadinessQualityScore(skillId)` 等）を使用する
- `scoreHistory` 配列を返すセレクタには `useShallow` を適用する（P48 対策）

### 6.4 キャッシュ戦略

- `PublishReadinessMetrics` は実行イベントごとに更新が必要なため、Zustand Store ではスキルIDをキーとして最新値をキャッシュする
- `SkillHealthReport` は重い集計を含むため、IPC 呼び出しのたびに Main Process で再計算し、Renderer側はキャッシュしない（ステール回避）
