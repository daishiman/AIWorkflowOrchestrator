# フィードバック収集要件定義書

## メタ情報

| 項目       | 内容                                  |
| ---------- | ------------------------------------- |
| Phase      | 1                                     |
| タスク     | タスク2: フィードバック収集要件の定義 |
| タスクID   | TASK-SKILL-LIFECYCLE-07               |
| 作成日     | 2026-03-16                            |
| ステータス | 完了                                  |

---

## 1. 概要

スキルライフサイクルにおけるフィードバック収集の要件を定義する。
自動収集（実行メトリクス: Main Process が記録）と手動入力（主観評価: Renderer からユーザーが入力）を明確に分離し、
再利用推薦・改善優先度判断・Task08 公開判断の基礎データを整備する。

---

## 2. 自動収集データ一覧

### 2-1. 実行結果メトリクス

| データ名             | 収集タイミング                                                  | データ型                              | 収集元プロセス | 説明                                                   |
| -------------------- | --------------------------------------------------------------- | ------------------------------------- | -------------- | ------------------------------------------------------ |
| executionResult      | skill:execution_succeeded / failed / timeout のいずれかの発火時 | `"success" \| "failure" \| "timeout"` | Main Process   | 実行の最終結果区分                                     |
| executionStartedAt   | skill:executed イベント発火時                                   | `number` (Unix timestamp ms)          | Main Process   | 実行開始時刻                                           |
| executionCompletedAt | skill:execution_succeeded / failed / timeout イベント発火時     | `number` (Unix timestamp ms)          | Main Process   | 実行完了（または中断）時刻                             |
| durationMs           | 実行完了時に算出                                                | `number`                              | Main Process   | executionCompletedAt - executionStartedAt              |
| errorCode            | skill:execution_failed 発火時のみ                               | `string \| null`                      | Main Process   | 失敗時のエラーコード（例: "TIMEOUT", "PARSE_ERROR"）   |
| errorMessage         | skill:execution_failed 発火時のみ                               | `string \| null`                      | Main Process   | 失敗時のエラーメッセージ（サニタイズ済み）             |
| skillId              | 全実行イベント発火時                                            | `string`                              | Main Process   | 実行対象スキルの識別子                                 |
| skillVersion         | 全実行イベント発火時                                            | `string`                              | Main Process   | 実行時のスキルバージョン                               |
| sessionId            | 全実行イベント発火時                                            | `string`                              | Main Process   | セッション識別子（同一セッション内の複数実行を紐付け） |

### 2-2. スコア変化メトリクス

| データ名     | 収集タイミング                         | データ型                                                                  | 収集元プロセス | 説明                                        |
| ------------ | -------------------------------------- | ------------------------------------------------------------------------- | -------------- | ------------------------------------------- |
| scoreBefore  | skill:score_updated イベント発火時     | `number \| null`                                                          | Main Process   | 改善前のスコア（0-100）。初回評価時は null  |
| scoreAfter   | skill:score_updated イベント発火時     | `number`                                                                  | Main Process   | 改善後のスコア（0-100）                     |
| scoreDelta   | scoreBefore / scoreAfter 算出時        | `number \| null`                                                          | Main Process   | scoreAfter - scoreBefore。初回評価時は null |
| scoringGate  | skill:gate_passed / gate_failed 発火時 | `"NEEDS_IMPROVEMENT" \| "SAVE_ALLOWED" \| "USE_ALLOWED" \| "RECOMMENDED"` | Main Process   | ScoringGate 判定結果（Task04 契約）         |
| evaluationId | skill:evaluated 発火時                 | `string`                                                                  | Main Process   | 評価セッション識別子                        |
| evaluatedAt  | skill:evaluated 発火時                 | `number` (Unix timestamp ms)                                              | Main Process   | 評価実施時刻                                |

### 2-3. 利用頻度メトリクス

| データ名            | 収集タイミング                                      | データ型                     | 収集元プロセス | 説明                                         |
| ------------------- | --------------------------------------------------- | ---------------------------- | -------------- | -------------------------------------------- |
| executionCountDay   | 日次集計バッチ（0:00 JST）                          | `number`                     | Main Process   | 当日の実行回数（成功 + 失敗 + タイムアウト） |
| executionCountWeek  | 週次集計バッチ（月曜 0:00 JST）                     | `number`                     | Main Process   | 当週の実行回数                               |
| executionCountMonth | 月次集計バッチ（月初 0:00 JST）                     | `number`                     | Main Process   | 当月の実行回数                               |
| successRateDay      | 日次集計バッチ                                      | `number`                     | Main Process   | 当日の成功率（0.0-1.0）。実行0件時は null    |
| successRateWeek     | 週次集計バッチ                                      | `number`                     | Main Process   | 当週の成功率                                 |
| successRateMonth    | 月次集計バッチ                                      | `number`                     | Main Process   | 当月の成功率                                 |
| lastExecutedAt      | skill:execution_succeeded / failed / timeout 発火時 | `number` (Unix timestamp ms) | Main Process   | 最終実行日時（ソート用）                     |

---

## 3. 手動フィードバック入力仕様

### 3-1. ユーザー評価（5段階レーティング）

| 項目           | 仕様                                                               |
| -------------- | ------------------------------------------------------------------ |
| 入力種別       | 5段階レーティング（星マーク UI）                                   |
| UI 入力点      | PostExecutionActionBar の「評価する」ボタン → RatingDialog         |
| 入力トリガー   | skill:execution_succeeded 後、ユーザーが任意で入力（強制ではない） |
| 有効値         | 1 / 2 / 3 / 4 / 5（整数）                                          |
| デフォルト値   | なし（未評価状態 = null）                                          |
| バリデーション | 1 以上 5 以下の整数であること。小数・0・負数は拒否                 |
| エラー表示     | 「1〜5 の整数を選択してください」                                  |
| データスキーマ | `UserRating` 型（§4 参照）                                         |

### 3-2. テキストフィードバック（自由記述）

| 項目           | 仕様                                                            |
| -------------- | --------------------------------------------------------------- |
| 入力種別       | テキストエリア（自由記述）                                      |
| UI 入力点      | RatingDialog 内のテキストエリア（レーティングと同一ダイアログ） |
| 最大文字数     | 500文字（多バイト文字も1文字としてカウント）                    |
| 必須/任意      | 任意                                                            |
| バリデーション | 501文字以上は入力不可（文字数カウンター表示: 現在文字数 / 500） |
| 改行           | 許可（最大5行程度を想定）                                       |
| エラー表示     | 「500文字以内で入力してください」                               |
| データスキーマ | `UserTextFeedback` 型（§4 参照）                                |

### 3-3. 改善提案（構造化フォーム）

| 項目           | 仕様                                                          |
| -------------- | ------------------------------------------------------------- |
| 入力種別       | 構造化フォーム（対象箇所 / 提案内容 / 優先度）                |
| UI 入力点      | SkillManagementPanel の「改善提案」ボタン → ImprovementDialog |
| 入力トリガー   | ユーザーが任意で入力（実行後・非実行後を問わず入力可能）      |
| フィールド定義 | 下記「改善提案フィールド詳細」参照                            |
| データスキーマ | `ImprovementSuggestion` 型（§4 参照）                         |

#### 改善提案フィールド詳細

| フィールド名        | 入力形式             | 必須/任意 | バリデーション                                          | 選択肢/制約                                                                  |
| ------------------- | -------------------- | --------- | ------------------------------------------------------- | ---------------------------------------------------------------------------- |
| targetSection       | セレクトボックス     | 必須      | 選択肢のいずれかであること                              | `"prompt_template" \| "examples" \| "context" \| "output_format" \| "other"` |
| suggestionText      | テキストエリア       | 必須      | 1文字以上 500文字以下。空文字列・トリム後空文字列は拒否 | 最大500文字                                                                  |
| priority            | ラジオボタン         | 必須      | 選択肢のいずれかであること                              | `"low" \| "medium" \| "high"`                                                |
| relatedSkillVersion | テキスト（読取専用） | 自動付与  | -                                                       | 提案時点のスキルバージョンを自動付与                                         |

---

## 4. データスキーマ案（TypeScript 型定義）

```typescript
// ============================================================
// 自動収集メトリクス
// ============================================================

/** 実行結果区分 */
export type ExecutionResult = "success" | "failure" | "timeout";

/** ScoringGate 判定結果（Task04 契約と同一定義） */
export type ScoringGate =
  | "NEEDS_IMPROVEMENT"
  | "SAVE_ALLOWED"
  | "USE_ALLOWED"
  | "RECOMMENDED";

/** 実行メトリクス（1回の実行ごとに自動記録） */
export interface AutoMetric {
  /** メトリクスレコード識別子 */
  metricId: string;
  /** 対象スキル識別子 */
  skillId: string;
  /** 実行時のスキルバージョン */
  skillVersion: string;
  /** セッション識別子 */
  sessionId: string;
  /** 実行結果区分 */
  executionResult: ExecutionResult;
  /** 実行開始時刻（Unix timestamp ms） */
  executionStartedAt: number;
  /** 実行完了（または中断）時刻（Unix timestamp ms） */
  executionCompletedAt: number;
  /** 実行所要時間（ms） */
  durationMs: number;
  /** 失敗時エラーコード（成功時は null） */
  errorCode: string | null;
  /** 失敗時エラーメッセージ（成功時は null、サニタイズ済み） */
  errorMessage: string | null;
  /** 記録日時（Unix timestamp ms） */
  recordedAt: number;
}

/** スコア変化メトリクス（評価イベントごとに自動記録） */
export interface ScoreChangeMetric {
  /** メトリクスレコード識別子 */
  metricId: string;
  /** 対象スキル識別子 */
  skillId: string;
  /** 評価セッション識別子 */
  evaluationId: string;
  /** 改善前スコア（0-100）。初回評価時は null */
  scoreBefore: number | null;
  /** 改善後スコア（0-100） */
  scoreAfter: number;
  /** スコア差分（scoreAfter - scoreBefore）。初回評価時は null */
  scoreDelta: number | null;
  /** ScoringGate 判定結果 */
  scoringGate: ScoringGate;
  /** 評価実施時刻（Unix timestamp ms） */
  evaluatedAt: number;
}

/** 利用頻度集計（日次・週次・月次） */
export interface UsageFrequencyAggregate {
  /** 集計レコード識別子 */
  aggregateId: string;
  /** 対象スキル識別子 */
  skillId: string;
  /** 集計粒度 */
  granularity: "daily" | "weekly" | "monthly";
  /** 集計期間の開始日時（Unix timestamp ms、0:00 JST） */
  periodStartAt: number;
  /** 集計期間の終了日時（Unix timestamp ms、終日） */
  periodEndAt: number;
  /** 期間内実行回数（成功 + 失敗 + タイムアウトの合計） */
  executionCount: number;
  /** 期間内成功率（0.0-1.0）。実行0件時は null */
  successRate: number | null;
  /** 最終実行日時（Unix timestamp ms）。実行0件時は null */
  lastExecutedAt: number | null;
}

// ============================================================
// 手動フィードバック入力
// ============================================================

/** ユーザー評価（5段階レーティング） */
export interface UserRating {
  /** フィードバックレコード識別子 */
  feedbackId: string;
  /** 対象スキル識別子 */
  skillId: string;
  /** 対象スキルバージョン */
  skillVersion: string;
  /** 関連セッション識別子（評価対象の実行セッション） */
  sessionId: string;
  /** 評価値（1-5 の整数） */
  rating: 1 | 2 | 3 | 4 | 5;
  /** 入力日時（Unix timestamp ms） */
  submittedAt: number;
}

/** テキストフィードバック（自由記述） */
export interface UserTextFeedback {
  /** フィードバックレコード識別子 */
  feedbackId: string;
  /** 対象スキル識別子 */
  skillId: string;
  /** 対象スキルバージョン */
  skillVersion: string;
  /** 関連セッション識別子 */
  sessionId: string;
  /** フィードバックテキスト（最大500文字） */
  feedbackText: string;
  /** 入力日時（Unix timestamp ms） */
  submittedAt: number;
}

/** 改善提案の対象箇所区分 */
export type ImprovementTargetSection =
  | "prompt_template"
  | "examples"
  | "context"
  | "output_format"
  | "other";

/** 改善提案の優先度 */
export type ImprovementPriority = "low" | "medium" | "high";

/** 改善提案（構造化フォーム） */
export interface ImprovementSuggestion {
  /** 改善提案レコード識別子 */
  suggestionId: string;
  /** 対象スキル識別子 */
  skillId: string;
  /** 提案時点のスキルバージョン（自動付与） */
  relatedSkillVersion: string;
  /** 対象箇所区分 */
  targetSection: ImprovementTargetSection;
  /** 提案内容（1-500文字） */
  suggestionText: string;
  /** 優先度 */
  priority: ImprovementPriority;
  /** 提案日時（Unix timestamp ms） */
  submittedAt: number;
}
```

---

## 5. 自動/手動の境界定義マトリクス

| データ名                   | 自動収集 | 手動入力 | 記録プロセス    | 入力元        | 根拠                                                 |
| -------------------------- | :------: | :------: | --------------- | ------------- | ---------------------------------------------------- |
| executionResult            |    ✅    |          | Main Process    | SkillExecutor | 実行エンジンが結果を直接知る。ユーザー判断不要       |
| executionStartedAt         |    ✅    |          | Main Process    | SkillExecutor | 実行開始はシステム管理タイムスタンプ                 |
| executionCompletedAt       |    ✅    |          | Main Process    | SkillExecutor | 実行終了はシステム管理タイムスタンプ                 |
| durationMs                 |    ✅    |          | Main Process    | 算出値        | 開始〜完了の差分を自動算出                           |
| errorCode / errorMessage   |    ✅    |          | Main Process    | SkillExecutor | エラー情報はシステムが生成。ユーザーは知る立場にない |
| scoreBefore / scoreAfter   |    ✅    |          | Main Process    | ScoringGate   | Task04 の評価エンジンが算出                          |
| scoreDelta                 |    ✅    |          | Main Process    | 算出値        | before/after の差分を自動算出                        |
| scoringGate                |    ✅    |          | Main Process    | ScoringGate   | Task04 契約に基づく自動判定                          |
| executionCount（日/週/月） |    ✅    |          | Main Process    | 集計バッチ    | 実行ログから機械的に集計                             |
| successRate（日/週/月）    |    ✅    |          | Main Process    | 集計バッチ    | 実行ログから機械的に集計                             |
| lastExecutedAt             |    ✅    |          | Main Process    | SkillExecutor | 最終実行時刻はシステム管理タイムスタンプ             |
| UserRating（rating）       |          |    ✅    | Renderer → Main | ユーザー入力  | 実行品質の主観評価はユーザーのみが判断できる         |
| UserTextFeedback           |          |    ✅    | Renderer → Main | ユーザー入力  | 自由記述の感想・気づきはユーザーが表現する           |
| ImprovementSuggestion      |          |    ✅    | Renderer → Main | ユーザー入力  | 改善の内容・優先度はユーザーが構造化して表現する     |

### 境界定義の原則

- **自動収集**: 実行エンジン（SkillExecutor）や評価エンジン（ScoringGate）が客観的に観測できる数値・状態を Main Process で記録する。ユーザーの操作なしに収集される
- **手動入力**: ユーザーの主観的評価・感想・改善提案を Renderer からの IPC 経由で受け取り Main Process が保存する。入力は任意であり強制しない
- **IPC フロー**: Renderer（UI）→ Preload（contextBridge）→ Main Process（永続化）の一方向。Main Process は手動入力を受け取るサーバーとして機能する

---

## 6. 集計仕様（利用頻度の集計方法）

### 6-1. 集計粒度と集計タイミング

| 粒度 | 集計タイミング              | 集計期間の定義                             | 保持期間 |
| ---- | --------------------------- | ------------------------------------------ | -------- |
| 日次 | 毎日 0:00 JST（前日分）     | 前日 0:00 JST 〜 前日 23:59:59 JST         | 90日     |
| 週次 | 毎週月曜 0:00 JST（前週分） | 前週月曜 0:00 JST 〜 前週日曜 23:59:59 JST | 52週     |
| 月次 | 毎月1日 0:00 JST（前月分）  | 前月1日 0:00 JST 〜 前月末日 23:59:59 JST  | 24ヶ月   |

### 6-2. 集計アルゴリズム

```
executionCount = COUNT(AutoMetric WHERE skillId = ? AND executionStartedAt BETWEEN periodStart AND periodEnd)

successRate =
  IF executionCount = 0 THEN NULL
  ELSE COUNT(AutoMetric WHERE skillId = ? AND executionResult = "success" AND ...) / executionCount

lastExecutedAt = MAX(AutoMetric.executionCompletedAt WHERE skillId = ? AND executionStartedAt BETWEEN ...)
```

### 6-3. 集計データの用途

| 粒度 | 主な用途                                                        |
| ---- | --------------------------------------------------------------- |
| 日次 | 当日のスキル利用状況モニタリング、異常検知                      |
| 週次 | 週単位のトレンド分析、「よく使ったスキル」ランキング            |
| 月次 | 長期利用傾向分析、Task08 公開判断の利用実績指標（最低実行回数） |

### 6-4. リアルタイム集計 vs バッチ集計の分離

- **リアルタイム**: `lastExecutedAt`、`executionCount`（当日暫定値）はイベント発生時にインクリメンタル更新する。Task05 の「最近使ったスキル」リスト（最新10件、最終実行日時降順）に利用する
- **バッチ集計**: `executionCountDay/Week/Month`、`successRateDay/Week/Month` は集計バッチで確定値を算出する。Task08 の公開判断メトリクスに利用する

---

## 7. まとめ・次Phase への引継ぎ

### 定義確認チェックリスト

- [x] 自動収集データ一覧テーブル（データ名、収集タイミング、データ型、収集元プロセス）が定義されている
- [x] 手動フィードバック入力仕様テーブル（入力種別、UI入力点、バリデーション、データスキーマ）が定義されている
- [x] `AutoMetric` 型が TypeScript 型定義として定義されている
- [x] `ScoreChangeMetric` 型が TypeScript 型定義として定義されている
- [x] `UsageFrequencyAggregate` 型が TypeScript 型定義として定義されている
- [x] `UserRating` 型が TypeScript 型定義として定義されている
- [x] `UserTextFeedback` 型が TypeScript 型定義として定義されている
- [x] `ImprovementSuggestion` 型が TypeScript 型定義として定義されている
- [x] 自動/手動の境界定義マトリクスが定義されている
- [x] 集計仕様（日次/週次/月次）が定義されている

### Phase 2（設計）への引継ぎ事項

1. `AutoMetric` / `ScoreChangeMetric` / `UsageFrequencyAggregate` は永続化レイヤー（SQLite + Drizzle）に格納する。Phase 2 でスキーマ設計を行うこと
2. `UserRating` / `UserTextFeedback` / `ImprovementSuggestion` の IPC チャンネル名と payload 形式は Phase 2 の IPC 設計で確定すること
3. 集計バッチの実行タイミング（setInterval vs electron-cron 等）は Phase 2 のアーキテクチャ設計で決定すること
4. `ScoringGate` 型は Task04（`packages/shared/src/types/skill-improver.ts`）の既存定義を再利用すること
