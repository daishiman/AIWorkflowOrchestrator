# Task08 公開判断メトリクス要件定義

## メタ情報

| 項目       | 内容                                          |
| ---------- | --------------------------------------------- |
| Phase      | 1                                             |
| タスク番号 | タスク4                                       |
| タスクID   | TASK-SKILL-LIFECYCLE-07                       |
| 作成日     | 2026-03-16                                    |
| 依存関係   | Task08（TASK-SKILL-LIFECYCLE-08）への提供仕様 |

---

## 1. 最小指標セットテーブル

Task08（公開・互換性）が公開可否を判断するために Task07 が提供する最小指標セットを定義する。

| 指標名                | 説明                                             | データ型             | 計算方法                                                                             | データソース                     |
| --------------------- | ------------------------------------------------ | -------------------- | ------------------------------------------------------------------------------------ | -------------------------------- |
| `qualityScore`        | 最新の評価スコア（0〜100）                       | `number`             | 最新の `skill:evaluated` / `skill:score_updated` イベントの `score` メタデータを取得 | ライフサイクル履歴の評価イベント |
| `stabilityScore`      | 直近N回の実行成功率（0.0〜1.0）                  | `number`             | 直近N件の `execution` カテゴリイベントのうち `skill:execution_succeeded` 件数 / N    | ライフサイクル履歴の実行イベント |
| `usageCount`          | 累計実行回数                                     | `number`             | `execution` カテゴリイベント（`skill:executed`）の総件数を集計                       | ライフサイクル履歴の実行イベント |
| `hasCriticalFeedback` | severity='critical' のフィードバックが存在するか | `boolean`            | `SkillFeedback` テーブルで当該スキルの `severity='critical'` レコードの有無を確認    | SkillFeedback ストア             |
| `lastEvaluatedAt`     | 最終評価日時                                     | `string`（ISO 8601） | 最新の評価イベントの `timestamp` を取得                                              | ライフサイクル履歴の評価イベント |
| `stabilityWindowSize` | 安定性計算に使用した直近N回の実績数              | `number`             | 実際に取得できた実行イベント件数（N以下の場合も含む）                                | ライフサイクル履歴の実行イベント |

---

## 2. デフォルト閾値テーブル

Task07 が提供するデフォルト閾値。Task08 はこれをベースに公開ポリシーに応じたオーバーライドが可能。

| 指標名                | デフォルト閾値           | Task08 オーバーライド可否 | 備考                                              |
| --------------------- | ------------------------ | ------------------------- | ------------------------------------------------- |
| `qualityScore`        | 70（100点満点中）        | 可能                      | Task04 の scoring gate 閾値を参照点として設定     |
| `stabilityScore`      | 0.8（80%以上）           | 可能                      | 直近N回（デフォルト N=10）の成功率                |
| `stabilityWindowSize` | 10（直近10回）           | 可能                      | 実行回数が10未満の場合は実際の件数で計算          |
| `usageCount`          | 3（最低3回実行）         | 可能                      | ゼロ実行スキルの公開防止                          |
| `hasCriticalFeedback` | false でなければならない | 不可（安全側固定）        | critical フィードバックがある場合は公開不可とする |

---

## 3. readinessLevel 判定ロジック

Task07 はデータ提供のみを行い、判定ロジックは Task08 の責務とする。ただし、Task07 は以下の判定フローを参考仕様として提供する。

```
readinessLevel 判定フロー:

入力: PublishReadinessMetrics（Task07 提供）+ PublishThresholds（Task08 設定）

Step 1: 即時 not_ready 条件チェック
  if (hasCriticalFeedback === true)
    → readinessLevel = 'not_ready'
    → reason = 'CRITICAL_FEEDBACK_EXISTS'
    → 終了

Step 2: 最低実行回数チェック
  if (usageCount < thresholds.minUsageCount)
    → readinessLevel = 'not_ready'
    → reason = 'INSUFFICIENT_USAGE'
    → 終了

Step 3: 品質スコアチェック
  if (qualityScore < thresholds.minQualityScore)
    → readinessLevel = 'not_ready'
    → reason = 'QUALITY_SCORE_BELOW_THRESHOLD'
    → 終了

Step 4: 安定性チェック（閾値未満だが not_ready ではない）
  if (stabilityScore < thresholds.minStabilityScore)
    → readinessLevel = 'review_needed'
    → reason = 'STABILITY_BELOW_THRESHOLD'
    → 終了

Step 5: 全条件クリア
  → readinessLevel = 'ready'
  → reason = null
  → 終了
```

| readinessLevel    | 意味                               | 推奨アクション（Task08 が決定）            |
| ----------------- | ---------------------------------- | ------------------------------------------ |
| `'not_ready'`     | 公開不可。必須条件を満たしていない | 公開ボタン非活性、改善を促すメッセージ表示 |
| `'review_needed'` | 要検討。任意条件が閾値未満         | レビュアー承認フローへ誘導                 |
| `'ready'`         | 公開可。全条件をクリアしている     | 公開ボタン活性化                           |

---

## 4. Task08 契約インターフェース定義（TypeScript）

```typescript
/**
 * Task07 が Task08 へ提供する公開準備度メトリクス
 * データ収集・計算は Task07 の責務
 */
export interface PublishReadinessMetrics {
  /** スキルID */
  skillId: string;
  /** スキル名 */
  skillName: string;
  /** 最新の評価スコア（0〜100）。評価未実施の場合は null */
  qualityScore: number | null;
  /** 直近N回の実行成功率（0.0〜1.0）。実行履歴がない場合は null */
  stabilityScore: number | null;
  /** 安定性計算に使用した実行履歴件数 */
  stabilityWindowSize: number;
  /** 累計実行回数 */
  usageCount: number;
  /** severity='critical' のフィードバックが存在するか */
  hasCriticalFeedback: boolean;
  /** 最終評価日時（ISO 8601）。評価未実施の場合は null */
  lastEvaluatedAt: string | null;
  /** メトリクス計算日時（ISO 8601） */
  calculatedAt: string;
}

/**
 * Task08 が設定する公開判断閾値
 * Task07 が提供するデフォルト値をベースに Task08 がオーバーライド可能
 */
export interface PublishThresholds {
  /** 公開に必要な最低品質スコア（デフォルト: 70） */
  minQualityScore: number;
  /** 公開に必要な最低安定性スコア（デフォルト: 0.8） */
  minStabilityScore: number;
  /** 安定性計算に使用する直近N回の実行数（デフォルト: 10） */
  stabilityWindowSize: number;
  /** 公開に必要な最低実行回数（デフォルト: 3） */
  minUsageCount: number;
}

/**
 * Task07 が Task08 へ提供するデフォルト閾値
 * Task08 はこれをベースに PublishThresholds をオーバーライドする
 */
export const DEFAULT_PUBLISH_THRESHOLDS: PublishThresholds = {
  minQualityScore: 70,
  minStabilityScore: 0.8,
  stabilityWindowSize: 10,
  minUsageCount: 3,
} as const;

/**
 * readinessLevel の3段階判定結果
 */
export type ReadinessLevel = "not_ready" | "review_needed" | "ready";

/**
 * readinessLevel 判定結果（Task08 が計算して保持する）
 */
export interface ReadinessResult {
  level: ReadinessLevel;
  /** not_ready / review_needed の場合の理由コード。ready の場合は null */
  reason:
    | "CRITICAL_FEEDBACK_EXISTS"
    | "INSUFFICIENT_USAGE"
    | "QUALITY_SCORE_BELOW_THRESHOLD"
    | "STABILITY_BELOW_THRESHOLD"
    | null;
}

/**
 * Task07 が Task08 へ提供するスキル総合ヘルスレポート
 * PublishReadinessMetrics + 履歴サマリーを統合したビュー
 */
export interface SkillHealthReport {
  /** スキルID */
  skillId: string;
  /** スキル名 */
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
    /** 直近30日の平均実行時間（ミリ秒） */
    avgDurationMs: number | null;
  };
  /** スコア推移（評価イベント順） */
  scoreHistory: Array<{
    /** 評価日時（ISO 8601） */
    evaluatedAt: string;
    /** スコア（0〜100） */
    score: number;
    /** スキルバージョン */
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
  /** レポート生成日時（ISO 8601） */
  generatedAt: string;
}
```

---

## 5. 責務分担マトリクス

| 責務項目                      | Task07 の責務                      | Task08 の責務    |
| ----------------------------- | ---------------------------------- | ---------------- |
| ライフサイクルイベントの記録  | 実装・管理                         | 参照のみ         |
| SkillFeedback の保存          | 実装・管理                         | 参照のみ         |
| qualityScore の計算           | 実装（評価イベントから抽出）       | 閾値比較のみ     |
| stabilityScore の計算         | 実装（実行イベントから算出）       | 閾値比較のみ     |
| usageCount の集計             | 実装（実行イベントをカウント）     | 閾値比較のみ     |
| hasCriticalFeedback の判定    | 実装（フィードバックを照会）       | 公開ブロック判断 |
| デフォルト閾値の提供          | 実装（DEFAULT_PUBLISH_THRESHOLDS） | オーバーライド   |
| readinessLevel の判定ロジック | 参考フロー提供のみ                 | 実装・決定       |
| PublishThresholds の設定      | デフォルト値提供                   | 最終値決定・管理 |
| 公開アクション（UI・IPC）     | 対象外                             | 実装             |
| Skill Center との連携         | 対象外                             | 実装             |
| バージョン互換性チェック      | 対象外                             | 実装             |

---

## 6. API 仕様

### `getPublishReadiness`

**目的**: 特定スキルの公開準備度メトリクスを取得する。

| 項目           | 内容                                                                        |
| -------------- | --------------------------------------------------------------------------- |
| 呼び出し元     | Task08（TASK-SKILL-LIFECYCLE-08）                                           |
| 実装責務       | Task07（TASK-SKILL-LIFECYCLE-07）                                           |
| IPC チャンネル | `skill:getPublishReadiness`（Task07 実装時に確定）                          |
| 引数           | `skillName: string`（スキル識別子）                                         |
| 戻り値         | `Promise<PublishReadinessMetrics>`                                          |
| エラー         | スキルが存在しない場合: `{ code: 'NOT_FOUND', message: 'Skill not found' }` |

**処理手順**:

1. `skillName` を引数にライフサイクル履歴を照会する
2. 評価イベント（`skill:evaluated`, `skill:score_updated`）から最新 `qualityScore` を抽出する
3. 実行イベント（`skill:executed`, `skill:execution_succeeded`, `skill:execution_failed`）から直近N回を取得し `stabilityScore` を算出する
4. 実行イベント総数から `usageCount` を集計する
5. `SkillFeedback` ストアで `severity='critical'` の存在を確認し `hasCriticalFeedback` を設定する
6. `PublishReadinessMetrics` オブジェクトを返す

---

### `getSkillHealthReport`

**目的**: 公開判断に必要な全データを集約したヘルスレポートを取得する。

| 項目           | 内容                                                                        |
| -------------- | --------------------------------------------------------------------------- |
| 呼び出し元     | Task08（TASK-SKILL-LIFECYCLE-08）またはスキル詳細画面                       |
| 実装責務       | Task07（TASK-SKILL-LIFECYCLE-07）                                           |
| IPC チャンネル | `skill:getSkillHealthReport`（Task07 実装時に確定）                         |
| 引数           | `skillName: string`（スキル識別子）                                         |
| 戻り値         | `Promise<SkillHealthReport>`                                                |
| エラー         | スキルが存在しない場合: `{ code: 'NOT_FOUND', message: 'Skill not found' }` |

**処理手順**:

1. `getPublishReadiness(skillName)` を呼び出し `PublishReadinessMetrics` を取得する
2. 直近30日の実行イベントを集計し `recentExecutionSummary` を構築する
3. 評価イベントを時系列順に並べ `scoreHistory` 配列を構築する
4. `SkillFeedback` ストアを集計し `feedbackSummary` を構築する（平均ユーザーレーティングを含む）
5. `SkillHealthReport` オブジェクトを返す

---

## 7. データソース接続関係

```
ライフサイクル履歴ストア（Task07 管理）
  ├── 評価イベント  → qualityScore, lastEvaluatedAt, scoreHistory
  ├── 実行イベント  → stabilityScore, usageCount, recentExecutionSummary
  └── 改善イベント  → scoreHistory（バージョン情報）

SkillFeedback ストア（Task07 管理）
  ├── severity='critical' 件数 → hasCriticalFeedback, feedbackSummary.criticalCount
  ├── severity='warning' 件数  → feedbackSummary.warningCount
  └── user_rating 集計          → feedbackSummary.avgUserRating

PublishReadinessMetrics（Task07 → Task08 に提供）
  └── Task08 が PublishThresholds と照合 → ReadinessResult
```
