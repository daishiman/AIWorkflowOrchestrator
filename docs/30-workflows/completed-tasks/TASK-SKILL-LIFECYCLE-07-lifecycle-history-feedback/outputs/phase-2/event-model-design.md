# ライフサイクルイベントモデル設計

## メタ情報

| 項目     | 内容                                                                                                                                       |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Phase    | 2 タスク1                                                                                                                                  |
| タスクID | TASK-SKILL-LIFECYCLE-07                                                                                                                    |
| 作成日   | 2026-03-16                                                                                                                                 |
| 入力     | `outputs/phase-1/lifecycle-event-catalog.md`（18イベント種別・5カテゴリ・共通メタデータスキーマ）                                          |
| 出力パス | `docs/30-workflows/skill-lifecycle-unification/tasks/step-05-par-task-07-lifecycle-history-feedback/outputs/phase-2/event-model-design.md` |

---

## 1. TypeScript 型定義

### 1-1. コア型定義

```typescript
// packages/shared/src/skill/lifecycle/types.ts

/**
 * Branded type: スキル名（ファイルシステム上のディレクトリ名と一致）
 * UUID ではなく人間可読なスキル名文字列を識別子として使用する。
 * 例: "code-review", "summarize-pr"
 */
declare const _skillNameBrand: unique symbol;
export type SkillName = string & { readonly [_skillNameBrand]: "SkillName" };

/**
 * SkillName へのキャスト用ファクトリ。
 * バリデーション（非空・安全文字のみ）を通過した値のみ生成可能。
 */
export function toSkillName(value: string): SkillName {
  if (value.trim() === "") {
    throw new Error("SkillName must be a non-empty string");
  }
  if (!/^[a-z0-9_-]+$/i.test(value.trim())) {
    throw new Error(
      "SkillName must contain only alphanumeric characters, hyphens, or underscores",
    );
  }
  return value.trim() as SkillName;
}

// ---------------------------------------------------------------------------
// イベントカテゴリ
// ---------------------------------------------------------------------------

/**
 * スキルライフサイクルの5大カテゴリ。
 * フィルタリング・集計・Zustand スライス分割に使用。
 */
export type EventCategory =
  | "creation"
  | "evaluation"
  | "execution"
  | "improvement"
  | "reuse";

// ---------------------------------------------------------------------------
// イベント種別（18種）
// ---------------------------------------------------------------------------

/** 作成カテゴリのイベント種別 (3種) */
export type CreationEventType =
  | "skill:created"
  | "skill:draft_saved"
  | "skill:template_applied";

/** 評価カテゴリのイベント種別 (4種) */
export type EvaluationEventType =
  | "skill:evaluated"
  | "skill:score_updated"
  | "skill:gate_passed"
  | "skill:gate_failed";

/** 実行カテゴリのイベント種別 (4種) */
export type ExecutionEventType =
  | "skill:executed"
  | "skill:execution_succeeded"
  | "skill:execution_failed"
  | "skill:execution_timeout";

/** 改善カテゴリのイベント種別 (3種) */
export type ImprovementEventType =
  | "skill:improved"
  | "skill:version_bumped"
  | "skill:feedback_applied";

/** 再利用カテゴリのイベント種別 (4種) */
export type ReuseEventType =
  | "skill:reused"
  | "skill:recommended"
  | "skill:imported"
  | "skill:forked";

/**
 * 全18イベント種別の Union 型。
 * exhaustive switch で全種別を網羅する際の基底型として使用。
 */
export type SkillEventType =
  | CreationEventType
  | EvaluationEventType
  | ExecutionEventType
  | ImprovementEventType
  | ReuseEventType;

// ---------------------------------------------------------------------------
// イベント発生元
// ---------------------------------------------------------------------------

/**
 * イベントが生成されたプロセス。
 * セキュリティ監査・デバッグ用に必ず記録する。
 */
export type EventSource = "main" | "renderer" | "cli";

// ---------------------------------------------------------------------------
// 採点ディメンション
// ---------------------------------------------------------------------------

/**
 * 評価スコアの内訳（評価カテゴリ用）。
 * 例: { dimension: "clarity", score: 80, weight: 0.3 }
 */
export interface ScoringDimension {
  /** ディメンション識別子。例: "clarity", "completeness", "efficiency" */
  dimension: string;
  /** 0–100 のスコア */
  score: number;
  /** 加重平均計算用の重み (0.0–1.0)。全ディメンションの合計は 1.0 */
  weight: number;
}

// ---------------------------------------------------------------------------
// コアイベント型
// ---------------------------------------------------------------------------

/**
 * スキルライフサイクルイベントの共通構造。
 *
 * 設計方針:
 * - metadata は category ごとの専用インターフェースで型付けする（後述）
 * - parentEventId は因果グラフ構築に使用し、null は単発イベントを意味する
 * - SQLite / Zustand persist の両永続化レイヤーで同一構造を使用する
 */
export interface SkillLifecycleEvent {
  /** イベント固有識別子 (UUID v4)。重複排除キー。 */
  id: string;
  /**
   * 対象スキルの識別子。
   * スキル名（SkillName branded type）を文字列として格納する。
   * SQLite の skill_lifecycle_events.skill_id カラムと対応。
   */
  skillId: SkillName;
  /** イベント発生時点のスキルバージョン (semver: MAJOR.MINOR.PATCH)。 */
  skillVersion: string;
  /** イベント種別識別子 (18種の union 型)。 */
  eventType: SkillEventType;
  /** イベントカテゴリ。フィルタリング・集計に使用。 */
  category: EventCategory;
  /** イベント発生日時 (ISO 8601 UTC)。例: "2026-03-16T07:17:53.000Z" */
  timestamp: string;
  /**
   * 操作ユーザーの識別子 (UUID v4)。
   * CLI バッチ実行等でユーザー特定不能な場合は null。
   */
  userId: string | null;
  /** イベント発生プロセス。 */
  source: EventSource;
  /**
   * カテゴリ固有の追加データ。
   * 型安全な参照には CategoryMetadataMap を使用する。
   */
  metadata: SkillEventMetadata;
  /**
   * 因果関係のある先行イベントの id (UUID v4)。
   * 単発イベントは null。詳細は「因果関係ルール」セクション参照。
   */
  parentEventId: string | null;
}
```

---

### 1-2. カテゴリ別 metadata インターフェース定義

```typescript
// packages/shared/src/skill/lifecycle/metadata.ts

import type { ScoringDimension } from "./types";

// ===========================================================================
// creation カテゴリ metadata
// ===========================================================================

/** skill:created のメタデータ */
export interface CreatedEventMetadata {
  /** スキル表示名 */
  skillName: string;
  /** 作成手段 */
  creationMethod: "manual" | "template" | "fork" | "import";
  /** 使用したテンプレートID。手動作成は null */
  templateId: string | null;
  /** 初期プロンプトの文字数 */
  initialPromptLength: number;
  /** 初期タグ一覧。タグなしは空配列 [] */
  tags: string[];
  /** 作成時点の公開フラグ（初期値は常に false） */
  isPublic: boolean;
}

/** skill:draft_saved のメタデータ */
export interface DraftSavedEventMetadata {
  /** 同一スキルの通算ドラフト保存回数（1始まり） */
  draftNumber: number;
  /** ドラフト保存時点のプロンプト文字数 */
  promptLength: number;
  /** 前回保存からの変更フィールド名一覧。例: ["name", "prompt"] */
  changedFields: string[];
  /** 自動保存か手動保存かの区別 */
  autoSaved: boolean;
}

/** skill:template_applied のメタデータ */
export interface TemplateAppliedEventMetadata {
  /** 適用したテンプレートのID */
  templateId: string;
  /** テンプレート表示名 */
  templateName: string;
  /** 適用時点のテンプレートバージョン (semver) */
  templateVersion: string;
  /** テンプレートのデフォルト値をユーザーが上書きしたフィールド一覧 */
  overriddenFields: string[];
}

/** creation カテゴリ metadata の union */
export type CreationEventMetadata =
  | CreatedEventMetadata
  | DraftSavedEventMetadata
  | TemplateAppliedEventMetadata;

// ===========================================================================
// evaluation カテゴリ metadata
// ===========================================================================

/** skill:evaluated のメタデータ */
export interface EvaluatedEventMetadata {
  /** 評価スコア (0–100) */
  score: number;
  /** 評価に使用した LLM モデル名。例: "claude-sonnet-4" */
  evaluatorModel: string;
  /** 評価処理所要時間（ミリ秒） */
  evaluationDurationMs: number;
  /** 採点ディメンション別スコアと重み */
  scoringDimensions: ScoringDimension[];
  /** 評価プロセスで消費したプロンプトトークン数 */
  promptTokensUsed: number;
  /** 評価プロセスで消費した補完トークン数 */
  completionTokensUsed: number;
  /** 同一バージョンの通算評価回数（1始まり） */
  evaluationRound: number;
}

/** skill:score_updated のメタデータ */
export interface ScoreUpdatedEventMetadata {
  /** 更新前のスコア (0–100) */
  previousScore: number;
  /** 更新後のスコア (0–100) */
  newScore: number;
  /** スコア変化量 (newScore - previousScore)。正値は改善、負値は劣化 */
  scoreDelta: number;
  /** スコア更新理由 */
  updateReason: "re_evaluation" | "manual_correction" | "model_change";
  /** 更新者のユーザーID または "system" */
  updatedBy: string;
}

/** skill:gate_passed のメタデータ */
export interface GatePassedEventMetadata {
  /** ゲート通過時点のスコア (0–100) */
  score: number;
  /** 適用された閾値スコア (0–100) */
  thresholdScore: number;
  /** 通過したゲートの識別子。例: "publish_gate" */
  gateId: string;
  /** ゲート通過で解放されたアクション一覧。例: ["publish", "recommend"] */
  unlockedActions: string[];
}

/** skill:gate_failed のメタデータ */
export interface GateFailedEventMetadata {
  /** ゲート失敗時点のスコア (0–100) */
  score: number;
  /** 適用された閾値スコア (0–100) */
  thresholdScore: number;
  /** 失敗したゲートの識別子 */
  gateId: string;
  /** 閾値との差分 (thresholdScore - score)。改善目標値として使用 */
  scoreDeficit: number;
  /** ゲート失敗でブロックされたアクション一覧 */
  blockedActions: string[];
  /** 評価モデルが提案した改善箇所（最大5件） */
  suggestedImprovements: string[];
}

/** evaluation カテゴリ metadata の union */
export type EvaluationEventMetadata =
  | EvaluatedEventMetadata
  | ScoreUpdatedEventMetadata
  | GatePassedEventMetadata
  | GateFailedEventMetadata;

// ===========================================================================
// execution カテゴリ metadata
// ===========================================================================

/**
 * 実行コンテキスト。
 * 実行が紐づくチャット/タスクを特定するための識別子セット。
 */
export interface ExecutionContext {
  /** 紐づくチャット ID。チャットと無関係な実行は null */
  chatId: string | null;
  /** 紐づくタスク ID。タスクと無関係な実行は null */
  taskId: string | null;
}

/** skill:executed のメタデータ */
export interface ExecutedEventMetadata {
  /**
   * 実行セッション固有ID (UUID v4)。
   * 完了/失敗/タイムアウトイベントの parentEventId として使用。
   * また execution_succeeded / execution_failed / execution_timeout の
   * metadata.executionId と同一値（二重インデックス）。
   */
  executionId: string;
  /** 実行トリガー種別 */
  triggerSource: "user_initiated" | "scheduled" | "api" | "recommendation";
  /** 実行入力のトークン数（推定値） */
  inputTokenCount: number;
  /** 実行が紐づくチャット/タスクのID */
  executionContext: ExecutionContext;
  /** 実行に使用する LLM モデル名 */
  modelId: string;
  /** 実行時のパーミッションモード */
  permissionMode:
    | "default"
    | "acceptEdits"
    | "bypassPermissions"
    | "plan"
    | "delegate"
    | "dontAsk";
}

/** skill:execution_succeeded のメタデータ */
export interface ExecutionSucceededEventMetadata {
  /** 対応する skill:executed イベントの executionId */
  executionId: string;
  /** 実行開始から完了までの所要時間（ミリ秒） */
  durationMs: number;
  /** 実行出力のトークン数 */
  outputTokenCount: number;
  /** 入力 + 出力の合計トークン数 */
  totalTokenCount: number;
  /** 実行中に呼び出したツールの総回数 */
  toolCallCount: number;
  /** 実行後 UI で収集した簡易満足度。未収集は null */
  userSatisfactionHint: "positive" | "negative" | "neutral" | null;
}

/** skill:execution_failed のメタデータ */
export interface ExecutionFailedEventMetadata {
  /** 対応する skill:executed イベントの executionId */
  executionId: string;
  /** 開始から失敗検出までの所要時間（ミリ秒） */
  durationMs: number;
  /** エラーコード。例: "TOOL_CALL_FAILED", "LLM_API_ERROR" */
  errorCode: string;
  /**
   * エラーカテゴリ（02-code-quality.md 準拠）
   * 1000-1999: validation, 2000-2999: business,
   * 3000-3999: external_service, 4000-4999: infrastructure, 5000-5999: internal
   */
  errorCategory:
    | "validation"
    | "business"
    | "external_service"
    | "infrastructure"
    | "internal";
  /**
   * サニタイズ済みエラーメッセージ（機密情報を除去）。
   * Zustand persist への格納は除外する（security-principles.md 準拠）。
   */
  errorMessage: string;
  /** リトライ可能かどうか */
  retryable: boolean;
  /** 失敗時点までのリトライ回数（初回失敗は 0） */
  retryCount: number;
}

/** skill:execution_timeout のメタデータ */
export interface ExecutionTimeoutEventMetadata {
  /** 対応する skill:executed イベントの executionId */
  executionId: string;
  /** 設定されていたタイムアウト時間（ミリ秒） */
  timeoutMs: number;
  /** タイムアウト検出時点での経過時間（ミリ秒） */
  elapsedMs: number;
  /** タイムアウト時点で最後に完了していたステップ名。特定不能は null */
  lastCompletedStep: string | null;
  /** 部分的な出力が保存されたかどうか */
  partialOutputSaved: boolean;
}

/** execution カテゴリ metadata の union */
export type ExecutionEventMetadata =
  | ExecutedEventMetadata
  | ExecutionSucceededEventMetadata
  | ExecutionFailedEventMetadata
  | ExecutionTimeoutEventMetadata;

// ===========================================================================
// improvement カテゴリ metadata
// ===========================================================================

/** フィードバック反映の変更内容エントリ */
export interface AppliedChange {
  /** 変更されたフィールド名 */
  field: string;
  /** 変更内容の説明 */
  description: string;
}

/** skill:improved のメタデータ */
export interface ImprovedEventMetadata {
  /** 改善前のバージョン (semver) */
  previousVersion: string;
  /** 改善の種別 */
  improvementType:
    | "prompt_edit"
    | "config_change"
    | "tag_update"
    | "description_edit";
  /** 変更されたフィールド名一覧 */
  changedFields: string[];
  /** プロンプト変更の文字数差分（prompt_edit 時のみ。それ以外は undefined） */
  promptDiffLength?: number;
  /** 改善のきっかけとなった起点 */
  improvementSource: "manual" | "feedback_driven" | "ai_suggested";
  /** 改善のもとになったフィードバックイベント ID 一覧（なしは空配列） */
  relatedFeedbackIds: string[];
}

/** skill:version_bumped のメタデータ */
export interface VersionBumpedEventMetadata {
  /** バージョンアップ前のバージョン (semver) */
  previousVersion: string;
  /** バージョンアップ後のバージョン (semver) */
  newVersion: string;
  /** セマンティックバージョニングのバンプ種別 */
  bumpType: "major" | "minor" | "patch";
  /** バージョンアップ内容の要約（最大200文字） */
  changelogSummary: string;
  /** 後方互換性を破る変更かどうか */
  isBreakingChange: boolean;
  /** バージョンアップを実行したユーザーID または "system" */
  triggeredByUserId: string;
}

/** skill:feedback_applied のメタデータ */
export interface FeedbackAppliedEventMetadata {
  /** 反映対象のフィードバックイベント ID */
  feedbackEventId: string;
  /** フィードバックの種別 */
  feedbackType: "rating" | "text" | "improvement_proposal";
  /** フィードバックを受けて変更した内容の一覧 */
  appliedChanges: AppliedChange[];
  /** フィードバック適用方式 */
  applicationMethod: "direct_apply" | "ai_assisted" | "partial";
  /** 適用前の評価スコア (0–100)。未評価は null */
  scoreBeforeApply: number | null;
}

/** improvement カテゴリ metadata の union */
export type ImprovementEventMetadata =
  | ImprovedEventMetadata
  | VersionBumpedEventMetadata
  | FeedbackAppliedEventMetadata;

// ===========================================================================
// reuse カテゴリ metadata
// ===========================================================================

/** 推薦コンテキストシグナルエントリ */
export interface ContextSignal {
  /** シグナル識別子。例: "recent_usage", "current_task_type" */
  signal: string;
  /** シグナルの値 */
  value: unknown;
}

/** skill:reused のメタデータ */
export interface ReusedEventMetadata {
  /** 再利用が発生したコンテキスト */
  reuseContext: "chat_init" | "task_start" | "manual_select" | "api";
  /** この再利用前までの通算利用回数 */
  previousUseCount: number;
  /** 前回利用からの経過日数。初回利用は null */
  daysSinceLastUse: number | null;
  /** 選択主体（ユーザー手動か推薦経由か） */
  selectedBy: "user" | "system" | "recommendation";
  /** 紐づくチャット/タスクセッション ID。なしは null */
  sessionId: string | null;
}

/** skill:recommended のメタデータ */
export interface RecommendedEventMetadata {
  /** 推薦一覧内での順位（1が最上位） */
  recommendationRank: number;
  /** 使用した推薦アルゴリズム */
  recommendationAlgorithm:
    | "usage_frequency"
    | "score_based"
    | "collaborative"
    | "hybrid";
  /** 推薦スコア (0.0–1.0) */
  recommendationScore: number;
  /** 推薦判断に使用したコンテキストシグナル一覧 */
  contextSignals: ContextSignal[];
  /**
   * 推薦がユーザーに受け入れられたか。
   * 未確定（推薦提示直後）は null。後から更新する。
   */
  wasAccepted: boolean | null;
}

/** skill:imported のメタデータ */
export interface ImportedEventMetadata {
  /** インポート元の種別 */
  importSource: "file" | "url" | "clipboard" | "marketplace";
  /** インポート時のスキル名（変更前） */
  importedSkillName: string;
  /** インポートしたスキルファイルの SHA-256 ハッシュ（重複検出用） */
  skillFileHash: string;
  /** インポートしたスキルのバージョン (semver)。バージョン情報なしは null */
  importedVersion: string | null;
  /** インポート時のバリデーション結果 */
  validationResult: "passed" | "warning" | "failed";
  /** バリデーション警告/エラーメッセージ一覧（なしは空配列） */
  validationMessages: string[];
}

/** skill:forked のメタデータ */
export interface ForkedEventMetadata {
  /** フォーク元スキルの ID (SkillName) */
  sourceSkillId: string;
  /** フォーク元のバージョン (semver) */
  sourceVersion: string;
  /** 新規作成されたフォーク先スキルの ID (SkillName) */
  forkedSkillId: string;
  /** フォーク理由の自由記述（最大200文字） */
  forkReason: string;
  /** フォーク元から引き継いだフィールド一覧 */
  inheritedFields: string[];
  /** フォーク時点で変更されたフィールド一覧 */
  divergedFields: string[];
}

/** reuse カテゴリ metadata の union */
export type ReuseEventMetadata =
  | ReusedEventMetadata
  | RecommendedEventMetadata
  | ImportedEventMetadata
  | ForkedEventMetadata;

// ===========================================================================
// 全カテゴリ metadata の union（SkillLifecycleEvent.metadata の型）
// ===========================================================================

export type SkillEventMetadata =
  | CreationEventMetadata
  | EvaluationEventMetadata
  | ExecutionEventMetadata
  | ImprovementEventMetadata
  | ReuseEventMetadata;

// ===========================================================================
// カテゴリ × EventType × Metadata のマッピング型（型安全参照用）
// ===========================================================================

/**
 * eventType から対応する metadata 型を導出する discriminated union ヘルパー。
 * イベントファクトリ・バリデータ・テストでの型安全な参照に使用する。
 *
 * 使用例:
 *   function handleEvent<T extends SkillEventType>(
 *     eventType: T,
 *     metadata: EventMetadataByType<T>
 *   ) { ... }
 */
export type EventMetadataByType<T extends SkillEventType> =
  T extends "skill:created"
    ? CreatedEventMetadata
    : T extends "skill:draft_saved"
      ? DraftSavedEventMetadata
      : T extends "skill:template_applied"
        ? TemplateAppliedEventMetadata
        : T extends "skill:evaluated"
          ? EvaluatedEventMetadata
          : T extends "skill:score_updated"
            ? ScoreUpdatedEventMetadata
            : T extends "skill:gate_passed"
              ? GatePassedEventMetadata
              : T extends "skill:gate_failed"
                ? GateFailedEventMetadata
                : T extends "skill:executed"
                  ? ExecutedEventMetadata
                  : T extends "skill:execution_succeeded"
                    ? ExecutionSucceededEventMetadata
                    : T extends "skill:execution_failed"
                      ? ExecutionFailedEventMetadata
                      : T extends "skill:execution_timeout"
                        ? ExecutionTimeoutEventMetadata
                        : T extends "skill:improved"
                          ? ImprovedEventMetadata
                          : T extends "skill:version_bumped"
                            ? VersionBumpedEventMetadata
                            : T extends "skill:feedback_applied"
                              ? FeedbackAppliedEventMetadata
                              : T extends "skill:reused"
                                ? ReusedEventMetadata
                                : T extends "skill:recommended"
                                  ? RecommendedEventMetadata
                                  : T extends "skill:imported"
                                    ? ImportedEventMetadata
                                    : T extends "skill:forked"
                                      ? ForkedEventMetadata
                                      : never;
```

---

## 2. metadata スキーマ一覧テーブル

### 2-1. creation カテゴリ

| カテゴリ | eventType              | フィールド          | 型                                           | 必須 |
| -------- | ---------------------- | ------------------- | -------------------------------------------- | ---- |
| creation | skill:created          | skillName           | string                                       | 必須 |
| creation | skill:created          | creationMethod      | "manual" \| "template" \| "fork" \| "import" | 必須 |
| creation | skill:created          | templateId          | string \| null                               | 必須 |
| creation | skill:created          | initialPromptLength | number                                       | 必須 |
| creation | skill:created          | tags                | string[]                                     | 必須 |
| creation | skill:created          | isPublic            | boolean                                      | 必須 |
| creation | skill:draft_saved      | draftNumber         | number                                       | 必須 |
| creation | skill:draft_saved      | promptLength        | number                                       | 必須 |
| creation | skill:draft_saved      | changedFields       | string[]                                     | 必須 |
| creation | skill:draft_saved      | autoSaved           | boolean                                      | 必須 |
| creation | skill:template_applied | templateId          | string                                       | 必須 |
| creation | skill:template_applied | templateName        | string                                       | 必須 |
| creation | skill:template_applied | templateVersion     | string (semver)                              | 必須 |
| creation | skill:template_applied | overriddenFields    | string[]                                     | 必須 |

### 2-2. evaluation カテゴリ

| カテゴリ   | eventType           | フィールド            | 型                                                       | 必須 |
| ---------- | ------------------- | --------------------- | -------------------------------------------------------- | ---- |
| evaluation | skill:evaluated     | score                 | number (0–100)                                           | 必須 |
| evaluation | skill:evaluated     | evaluatorModel        | string                                                   | 必須 |
| evaluation | skill:evaluated     | evaluationDurationMs  | number                                                   | 必須 |
| evaluation | skill:evaluated     | scoringDimensions     | ScoringDimension[]                                       | 必須 |
| evaluation | skill:evaluated     | promptTokensUsed      | number                                                   | 必須 |
| evaluation | skill:evaluated     | completionTokensUsed  | number                                                   | 必須 |
| evaluation | skill:evaluated     | evaluationRound       | number                                                   | 必須 |
| evaluation | skill:score_updated | previousScore         | number (0–100)                                           | 必須 |
| evaluation | skill:score_updated | newScore              | number (0–100)                                           | 必須 |
| evaluation | skill:score_updated | scoreDelta            | number                                                   | 必須 |
| evaluation | skill:score_updated | updateReason          | "re_evaluation" \| "manual_correction" \| "model_change" | 必須 |
| evaluation | skill:score_updated | updatedBy             | string                                                   | 必須 |
| evaluation | skill:gate_passed   | score                 | number (0–100)                                           | 必須 |
| evaluation | skill:gate_passed   | thresholdScore        | number (0–100)                                           | 必須 |
| evaluation | skill:gate_passed   | gateId                | string                                                   | 必須 |
| evaluation | skill:gate_passed   | unlockedActions       | string[]                                                 | 必須 |
| evaluation | skill:gate_failed   | score                 | number (0–100)                                           | 必須 |
| evaluation | skill:gate_failed   | thresholdScore        | number (0–100)                                           | 必須 |
| evaluation | skill:gate_failed   | gateId                | string                                                   | 必須 |
| evaluation | skill:gate_failed   | scoreDeficit          | number                                                   | 必須 |
| evaluation | skill:gate_failed   | blockedActions        | string[]                                                 | 必須 |
| evaluation | skill:gate_failed   | suggestedImprovements | string[] (最大5件)                                       | 必須 |

### 2-3. execution カテゴリ

| カテゴリ  | eventType                 | フィールド           | 型                                                                                     | 必須 |
| --------- | ------------------------- | -------------------- | -------------------------------------------------------------------------------------- | ---- |
| execution | skill:executed            | executionId          | string (UUID v4)                                                                       | 必須 |
| execution | skill:executed            | triggerSource        | "user_initiated" \| "scheduled" \| "api" \| "recommendation"                           | 必須 |
| execution | skill:executed            | inputTokenCount      | number                                                                                 | 必須 |
| execution | skill:executed            | executionContext     | ExecutionContext                                                                       | 必須 |
| execution | skill:executed            | modelId              | string                                                                                 | 必須 |
| execution | skill:executed            | permissionMode       | "default" \| "acceptEdits" \| "bypassPermissions" \| "plan" \| "delegate" \| "dontAsk" | 必須 |
| execution | skill:execution_succeeded | executionId          | string                                                                                 | 必須 |
| execution | skill:execution_succeeded | durationMs           | number                                                                                 | 必須 |
| execution | skill:execution_succeeded | outputTokenCount     | number                                                                                 | 必須 |
| execution | skill:execution_succeeded | totalTokenCount      | number                                                                                 | 必須 |
| execution | skill:execution_succeeded | toolCallCount        | number                                                                                 | 必須 |
| execution | skill:execution_succeeded | userSatisfactionHint | "positive" \| "negative" \| "neutral" \| null                                          | 任意 |
| execution | skill:execution_failed    | executionId          | string                                                                                 | 必須 |
| execution | skill:execution_failed    | durationMs           | number                                                                                 | 必須 |
| execution | skill:execution_failed    | errorCode            | string                                                                                 | 必須 |
| execution | skill:execution_failed    | errorCategory        | "validation" \| "business" \| "external_service" \| "infrastructure" \| "internal"     | 必須 |
| execution | skill:execution_failed    | errorMessage         | string (Zustand persist から除外)                                                      | 必須 |
| execution | skill:execution_failed    | retryable            | boolean                                                                                | 必須 |
| execution | skill:execution_failed    | retryCount           | number                                                                                 | 必須 |
| execution | skill:execution_timeout   | executionId          | string                                                                                 | 必須 |
| execution | skill:execution_timeout   | timeoutMs            | number                                                                                 | 必須 |
| execution | skill:execution_timeout   | elapsedMs            | number                                                                                 | 必須 |
| execution | skill:execution_timeout   | lastCompletedStep    | string \| null                                                                         | 必須 |
| execution | skill:execution_timeout   | partialOutputSaved   | boolean                                                                                | 必須 |

### 2-4. improvement カテゴリ

| カテゴリ    | eventType              | フィールド         | 型                                                                     | 必須 |
| ----------- | ---------------------- | ------------------ | ---------------------------------------------------------------------- | ---- |
| improvement | skill:improved         | previousVersion    | string (semver)                                                        | 必須 |
| improvement | skill:improved         | improvementType    | "prompt_edit" \| "config_change" \| "tag_update" \| "description_edit" | 必須 |
| improvement | skill:improved         | changedFields      | string[]                                                               | 必須 |
| improvement | skill:improved         | promptDiffLength   | number                                                                 | 任意 |
| improvement | skill:improved         | improvementSource  | "manual" \| "feedback_driven" \| "ai_suggested"                        | 必須 |
| improvement | skill:improved         | relatedFeedbackIds | string[]                                                               | 必須 |
| improvement | skill:version_bumped   | previousVersion    | string (semver)                                                        | 必須 |
| improvement | skill:version_bumped   | newVersion         | string (semver)                                                        | 必須 |
| improvement | skill:version_bumped   | bumpType           | "major" \| "minor" \| "patch"                                          | 必須 |
| improvement | skill:version_bumped   | changelogSummary   | string (最大200文字)                                                   | 必須 |
| improvement | skill:version_bumped   | isBreakingChange   | boolean                                                                | 必須 |
| improvement | skill:version_bumped   | triggeredByUserId  | string                                                                 | 必須 |
| improvement | skill:feedback_applied | feedbackEventId    | string (UUID v4)                                                       | 必須 |
| improvement | skill:feedback_applied | feedbackType       | "rating" \| "text" \| "improvement_proposal"                           | 必須 |
| improvement | skill:feedback_applied | appliedChanges     | AppliedChange[]                                                        | 必須 |
| improvement | skill:feedback_applied | applicationMethod  | "direct_apply" \| "ai_assisted" \| "partial"                           | 必須 |
| improvement | skill:feedback_applied | scoreBeforeApply   | number \| null                                                         | 任意 |

### 2-5. reuse カテゴリ

| カテゴリ | eventType         | フィールド              | 型                                                                | 必須 |
| -------- | ----------------- | ----------------------- | ----------------------------------------------------------------- | ---- |
| reuse    | skill:reused      | reuseContext            | "chat_init" \| "task_start" \| "manual_select" \| "api"           | 必須 |
| reuse    | skill:reused      | previousUseCount        | number                                                            | 必須 |
| reuse    | skill:reused      | daysSinceLastUse        | number \| null                                                    | 必須 |
| reuse    | skill:reused      | selectedBy              | "user" \| "system" \| "recommendation"                            | 必須 |
| reuse    | skill:reused      | sessionId               | string \| null                                                    | 任意 |
| reuse    | skill:recommended | recommendationRank      | number (1始まり)                                                  | 必須 |
| reuse    | skill:recommended | recommendationAlgorithm | "usage_frequency" \| "score_based" \| "collaborative" \| "hybrid" | 必須 |
| reuse    | skill:recommended | recommendationScore     | number (0.0–1.0)                                                  | 必須 |
| reuse    | skill:recommended | contextSignals          | ContextSignal[]                                                   | 必須 |
| reuse    | skill:recommended | wasAccepted             | boolean \| null                                                   | 必須 |
| reuse    | skill:imported    | importSource            | "file" \| "url" \| "clipboard" \| "marketplace"                   | 必須 |
| reuse    | skill:imported    | importedSkillName       | string                                                            | 必須 |
| reuse    | skill:imported    | skillFileHash           | string (SHA-256)                                                  | 必須 |
| reuse    | skill:imported    | importedVersion         | string \| null                                                    | 必須 |
| reuse    | skill:imported    | validationResult        | "passed" \| "warning" \| "failed"                                 | 必須 |
| reuse    | skill:imported    | validationMessages      | string[]                                                          | 必須 |
| reuse    | skill:forked      | sourceSkillId           | string                                                            | 必須 |
| reuse    | skill:forked      | sourceVersion           | string (semver)                                                   | 必須 |
| reuse    | skill:forked      | forkedSkillId           | string                                                            | 必須 |
| reuse    | skill:forked      | forkReason              | string (最大200文字)                                              | 必須 |
| reuse    | skill:forked      | inheritedFields         | string[]                                                          | 必須 |
| reuse    | skill:forked      | divergedFields          | string[]                                                          | 必須 |

---

## 3. 因果関係ルール（parentEventId）

### 3-1. ルール一覧テーブル

| パターン | 親イベント             | 子イベント                | parentEventId の値        | ルール説明                                                           |
| -------- | ---------------------- | ------------------------- | ------------------------- | -------------------------------------------------------------------- |
| A        | skill:executed         | skill:execution_succeeded | skill:executed.id         | 実行完了は開始イベントを親とする                                     |
| A        | skill:executed         | skill:execution_failed    | skill:executed.id         | 実行失敗は開始イベントを親とする                                     |
| A        | skill:executed         | skill:execution_timeout   | skill:executed.id         | タイムアウトは開始イベントを親とする                                 |
| B        | skill:evaluated        | skill:gate_passed         | skill:evaluated.id        | ゲート通過は直前の評価イベントを親とする                             |
| B        | skill:evaluated        | skill:gate_failed         | skill:evaluated.id        | ゲート失敗は直前の評価イベントを親とする                             |
| B        | skill:evaluated        | skill:score_updated       | skill:evaluated.id        | 再評価によるスコア更新は元評価を親とする（手動修正の場合は null 可） |
| C        | フィードバックイベント | skill:feedback_applied    | フィードバックイベント.id | フィードバック適用はフィードバック収集イベントを親とする             |
| C        | skill:feedback_applied | skill:improved            | skill:feedback_applied.id | フィードバック起因の改善は適用イベントを親とする                     |
| C        | skill:improved         | skill:version_bumped      | skill:improved.id         | 改善を契機としたバージョンアップは改善イベントを親とする             |
| D        | skill:template_applied | skill:created             | skill:template_applied.id | テンプレート起源の作成はテンプレート適用を親とする                   |
| D        | skill:forked           | skill:created             | skill:forked.id           | フォーク起源の作成はフォークイベントを親とする                       |
| E        | skill:recommended      | skill:reused              | skill:recommended.id      | 推薦経由の再利用は推薦イベントを親とする                             |
| -        | なし                   | skill:executed            | null                      | 実行開始は因果元がないため null                                      |
| -        | なし                   | skill:evaluated           | null                      | 評価開始は因果元がないため null                                      |
| -        | なし                   | skill:recommended         | null                      | 推薦提示は因果元がないため null（推薦トリガーはシステム内部）        |
| -        | なし                   | skill:reused（手動選択）  | null                      | 推薦を経由しない手動再利用は null                                    |
| -        | なし                   | skill:created（手動作成） | null                      | テンプレート/フォーク起源でない手動作成は null                       |

### 3-2. metadata.executionId との二重インデックス関係

実行系イベントでは `parentEventId` と `metadata.executionId` が連携する：

- `skill:executed` の `id` は `skill:execution_succeeded` / `skill:execution_failed` / `skill:execution_timeout` の `parentEventId` と等しい
- 同時に、各結果イベントの `metadata.executionId` にも同じ値が格納される
- これにより、`parentEventId` による因果グラフ探索と `executionId` による直接検索の両方が可能

### 3-3. `parentEventId` の制約

1. 自己参照禁止: `parentEventId !== id`
2. 循環参照禁止: 祖先を辿ると必ず null に到達すること
3. カテゴリ跨ぎ許可: パターン B（evaluation → gate）・C（improvement → version_bumped）のように異なるカテゴリ間の因果関係は許可
4. 存在保証なし: 親イベントの削除を防ぐ外部キー制約は SQLite では設けない（集計クエリでの LEFT JOIN で対応）

---

## 4. 永続化設計

### 4-1. Zustand persist 設計（Renderer 層）

```typescript
// packages/shared/src/skill/lifecycle/store-slice.ts（設計イメージ）

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { SkillLifecycleEvent } from "./types";

/**
 * Zustand persist の最大キャッシュ件数。
 * UI リアルタイム表示用の直近イベントのみ保持する。
 */
export const LIFECYCLE_CACHE_MAX = 50;

/**
 * Zustand persist のストレージキー。
 */
export const LIFECYCLE_CACHE_STORAGE_KEY = "skill-lifecycle-events-cache";

/**
 * Zustand スライスの状態型。
 */
export interface LifecycleCacheSliceState {
  /** 最新 LIFECYCLE_CACHE_MAX 件のイベントキャッシュ（新しい順） */
  cachedEvents: LifecycleEventForCache[];
  /** IPC 受信後に同期追加するアクション */
  addEvent: (event: SkillLifecycleEvent) => void;
  /** スライスのリセット */
  clearCache: () => void;
}

/**
 * Zustand persist に格納するイベント型。
 *
 * セキュリティ上の理由により execution:failed の errorMessage を除外する。
 * （security-principles.md 準拠）
 */
export type LifecycleEventForCache = Omit<SkillLifecycleEvent, "metadata"> & {
  /**
   * metadata から errorMessage を除外したキャッシュ用型。
   * ExecutionFailedEventMetadata.errorMessage は Renderer に送出しない。
   */
  metadata: Omit<
    SkillLifecycleEvent["metadata"],
    // ランタイム時に型ナローイングで除外するため、型レベルでは Record として扱う
    never
  >;
};

/**
 * Zustand persist 設定（arch-state-management.md 準拠）
 *
 * customStorage: Set 型を含まないため標準 JSON で十分だが、
 * 将来の metadata 拡張で Set が入る場合は customStorage へ移行する。
 */
export const lifecycleCachePersistConfig = {
  name: LIFECYCLE_CACHE_STORAGE_KEY,
  storage: createJSONStorage(() => localStorage),
  partialize: (state: LifecycleCacheSliceState) => ({
    cachedEvents: state.cachedEvents,
  }),
};
```

**persist 動作仕様:**

| 項目           | 仕様                                                                       |
| -------------- | -------------------------------------------------------------------------- |
| 保存対象       | 最新 50 件のライフサイクルイベントキャッシュ                               |
| ストレージキー | `"skill-lifecycle-events-cache"`                                           |
| シリアライズ   | JSON（Set 型は metadata に含まれないため標準 JSON で対応可能）             |
| 除外フィールド | `ExecutionFailedEventMetadata.errorMessage`（security-principles.md 準拠） |
| 更新タイミング | IPC `skill:lifecycle-event` チャンネル受信時に同期的にスライスへ反映       |
| 超過時の処理   | 追加時に 51 件目以降（最古側）を切り捨て、常に最新 50 件を維持             |

---

### 4-2. SQLite テーブルスキーマ（Main Process 層）

```sql
-- skill_lifecycle_events テーブル
-- packages/shared/src/db/schema/ に Drizzle ORM スキーマを追加する（Task 実装時）

CREATE TABLE skill_lifecycle_events (
  -- 主キー
  id          TEXT PRIMARY KEY NOT NULL,
    -- UUID v4: crypto.randomUUID()

  -- スキル識別子
  skill_id    TEXT NOT NULL,
    -- SkillName (branded type の実体は string)

  -- バージョン
  skill_version TEXT NOT NULL,
    -- semver: "MAJOR.MINOR.PATCH"

  -- イベント分類
  event_type  TEXT NOT NULL,
    -- CHECK 制約: SkillEventType 18種の値のみ許可
  category    TEXT NOT NULL,
    -- CHECK 制約: 'creation'|'evaluation'|'execution'|'improvement'|'reuse'

  -- 時刻
  timestamp   TEXT NOT NULL,
    -- ISO 8601 UTC: "YYYY-MM-DDTHH:mm:ss.sssZ"

  -- ユーザー情報
  user_id     TEXT,
    -- UUID v4 or NULL（CLI バッチ実行等）

  -- 発生元プロセス
  source      TEXT NOT NULL,
    -- CHECK 制約: 'main'|'renderer'|'cli'

  -- 因果関係
  parent_event_id TEXT,
    -- UUID v4 or NULL: 外部キー制約は設けない（削除時の参照整合性は集計クエリで対応）

  -- カテゴリ固有の追加データ
  metadata    TEXT NOT NULL,
    -- JSON 文字列: SkillEventMetadata をシリアライズ

  -- 監査
  created_at  INTEGER NOT NULL DEFAULT (unixepoch())
    -- Unix timestamp: SQLite 格納用
);
```

**CHECK 制約（Drizzle ORM スキーマでの実装時に追加）:**

```sql
-- event_type 制約
CONSTRAINT chk_event_type CHECK (event_type IN (
  'skill:created', 'skill:draft_saved', 'skill:template_applied',
  'skill:evaluated', 'skill:score_updated', 'skill:gate_passed', 'skill:gate_failed',
  'skill:executed', 'skill:execution_succeeded', 'skill:execution_failed', 'skill:execution_timeout',
  'skill:improved', 'skill:version_bumped', 'skill:feedback_applied',
  'skill:reused', 'skill:recommended', 'skill:imported', 'skill:forked'
)),

-- category 制約
CONSTRAINT chk_category CHECK (category IN (
  'creation', 'evaluation', 'execution', 'improvement', 'reuse'
)),

-- source 制約
CONSTRAINT chk_source CHECK (source IN ('main', 'renderer', 'cli'))
```

### 4-3. インデックス設計

```sql
-- インデックス 1: スキルID + 時刻降順（最頻クエリ: スキル別イベント一覧）
CREATE INDEX idx_sle_skill_id_timestamp
  ON skill_lifecycle_events (skill_id, timestamp DESC);

-- インデックス 2: イベント種別（種別フィルタ集計）
CREATE INDEX idx_sle_event_type
  ON skill_lifecycle_events (event_type);

-- インデックス 3: カテゴリ + 時刻降順（カテゴリ別フィルタ一覧）
CREATE INDEX idx_sle_category_timestamp
  ON skill_lifecycle_events (category, timestamp DESC);

-- インデックス 4: 因果関係グラフ探索（子イベント → 親イベント参照）
CREATE INDEX idx_sle_parent_event_id
  ON skill_lifecycle_events (parent_event_id)
  WHERE parent_event_id IS NOT NULL;

-- インデックス 5: ユーザー別集計（ユーザー統計クエリ）
CREATE INDEX idx_sle_user_id_timestamp
  ON skill_lifecycle_events (user_id, timestamp DESC)
  WHERE user_id IS NOT NULL;
```

**インデックス選択根拠:**

| インデックス               | 対象クエリパターン                           | 更新コスト |
| -------------------------- | -------------------------------------------- | ---------- |
| (skill_id, timestamp DESC) | スキル詳細画面のタイムライン表示             | 中（主軸） |
| (event_type)               | 実行成功率・評価スコア分布の集計             | 低         |
| (category, timestamp DESC) | カテゴリフィルタのリアルタイムフィード       | 中         |
| (parent_event_id)          | 実行シーケンスのツリー展開・因果グラフ可視化 | 低         |
| (user_id, timestamp DESC)  | ユーザーアクティビティレポート               | 低         |

---

## 5. イベント生成ファクトリのインターフェース定義

```typescript
// packages/shared/src/skill/lifecycle/factory.ts

import type {
  SkillLifecycleEvent,
  SkillEventType,
  EventCategory,
  EventSource,
  SkillName,
  EventMetadataByType,
} from "./types";

/**
 * イベント生成に必要な共通パラメータ。
 * id と timestamp はファクトリが自動付与するため省略可能。
 */
export interface CreateEventParams<T extends SkillEventType> {
  /** 対象スキルの SkillName */
  skillId: SkillName;
  /** イベント発生時点のスキルバージョン (semver) */
  skillVersion: string;
  /** イベント種別 */
  eventType: T;
  /** イベントカテゴリ */
  category: EventCategory;
  /** 操作ユーザーID (UUID v4)。特定不能な場合は null */
  userId: string | null;
  /** イベント発生プロセス */
  source: EventSource;
  /** イベント種別固有のメタデータ（型安全） */
  metadata: EventMetadataByType<T>;
  /**
   * 因果関係のある先行イベントの id。
   * 単発イベントは省略（undefined → null として格納）。
   */
  parentEventId?: string;
}

/**
 * SkillLifecycleEvent のファクトリインターフェース。
 *
 * 設計意図:
 * - id (UUID v4) と timestamp (ISO 8601) をファクトリが一元生成する
 * - EventMetadataByType<T> により型安全な metadata 付与を強制する
 * - parentEventId は省略可能（省略時は null）
 */
export interface SkillLifecycleEventFactory {
  /**
   * 新規ライフサイクルイベントを生成する。
   *
   * @param params イベント生成パラメータ
   * @returns 完全な SkillLifecycleEvent（id・timestamp 付き）
   * @throws Error skillVersion が semver 形式でない場合
   * @throws Error metadata が eventType の必須フィールドを満たさない場合
   */
  create<T extends SkillEventType>(
    params: CreateEventParams<T>,
  ): SkillLifecycleEvent;
}

/**
 * デフォルトファクトリ実装（ランタイム依存なし・テスト可能）。
 *
 * 使用例:
 *   const factory = createSkillLifecycleEventFactory();
 *   const event = factory.create({
 *     skillId: toSkillName("code-review"),
 *     skillVersion: "1.0.0",
 *     eventType: "skill:executed",
 *     category: "execution",
 *     userId: "user-uuid-xxx",
 *     source: "main",
 *     metadata: {
 *       executionId: crypto.randomUUID(),
 *       triggerSource: "user_initiated",
 *       inputTokenCount: 512,
 *       executionContext: { chatId: "chat-uuid", taskId: null },
 *       modelId: "claude-sonnet-4-5",
 *       permissionMode: "default",
 *     },
 *   });
 */
export function createSkillLifecycleEventFactory(
  options: {
    /**
     * UUID v4 生成関数（テスト時に注入して決定論的にする）。
     * @default crypto.randomUUID
     */
    generateId?: () => string;
    /**
     * ISO 8601 UTC 日時取得関数（テスト時に注入して固定日時にする）。
     * @default () => new Date().toISOString()
     */
    getTimestamp?: () => string;
  } = {},
): SkillLifecycleEventFactory {
  const generateId = options.generateId ?? (() => crypto.randomUUID());
  const getTimestamp = options.getTimestamp ?? (() => new Date().toISOString());

  return {
    create<T extends SkillEventType>(
      params: CreateEventParams<T>,
    ): SkillLifecycleEvent {
      return {
        id: generateId(),
        skillId: params.skillId,
        skillVersion: params.skillVersion,
        eventType: params.eventType,
        category: params.category,
        timestamp: getTimestamp(),
        userId: params.userId,
        source: params.source,
        metadata: params.metadata as SkillLifecycleEvent["metadata"],
        parentEventId: params.parentEventId ?? null,
      };
    },
  };
}
```

---

## 6. 配置先ディレクトリ計画

```
packages/shared/src/skill/
├── lifecycle/
│   ├── types.ts          # SkillLifecycleEvent / SkillEventType / EventCategory / EventSource
│   ├── metadata.ts       # カテゴリ別 metadata インターフェース定義 (18種)
│   ├── factory.ts        # SkillLifecycleEventFactory インターフェース + デフォルト実装
│   ├── constants.ts      # LIFECYCLE_CACHE_MAX / LIFECYCLE_CACHE_STORAGE_KEY / IPC チャンネル名
│   ├── store-slice.ts    # Zustand スライス型定義 + persist 設定
│   └── index.ts          # 公開 API の re-export
│
└── index.ts              # packages/shared/src/skill/ の公開 API
```

**各ファイルの公開 API 概要:**

| ファイル       | 公開するもの                                                                                                                                      |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| types.ts       | `SkillLifecycleEvent`, `SkillEventType`, `EventCategory`, `EventSource`, `SkillName`, `toSkillName`, `EventMetadataByType<T>`, `ScoringDimension` |
| metadata.ts    | 18種の metadata インターフェース、カテゴリ別 union 型、`SkillEventMetadata`                                                                       |
| factory.ts     | `SkillLifecycleEventFactory`, `CreateEventParams<T>`, `createSkillLifecycleEventFactory`                                                          |
| constants.ts   | `LIFECYCLE_CACHE_MAX`, `LIFECYCLE_CACHE_STORAGE_KEY`, `LIFECYCLE_IPC_CHANNELS`                                                                    |
| store-slice.ts | `LifecycleCacheSliceState`, `LifecycleEventForCache`, `lifecycleCachePersistConfig`                                                               |

**依存関係:**

```
metadata.ts  →  types.ts（ScoringDimension）
factory.ts   →  types.ts（全型）, metadata.ts（SkillEventMetadata）
store-slice.ts → types.ts（SkillLifecycleEvent）
constants.ts   → （依存なし）
index.ts     →  全ファイルの re-export
```

**Drizzle ORM スキーマ配置先（Phase 5 実装時）:**

```
packages/shared/src/db/schema/
└── skill-lifecycle-events.ts   # SQLite テーブル定義 + インデックス定義
```

---

## 7. 設計上の決定事項と根拠

| 決定事項                     | 採用案                                                                  | 根拠・背景                                                                                                       |
| ---------------------------- | ----------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| skillId の型                 | SkillName (branded type)                                                | P44/P45 の教訓から「ID と名前の混在」を型レベルで防止。スキルはUUIDではなく名前で識別されるため                  |
| metadata の型付け            | 個別 interface + EventMetadataByType<T>                                 | `Record<string, unknown>` のままでは factory での型安全が失われる。exhaustive check も不可能                     |
| errorMessage の Zustand 除外 | persist partialize で除外                                               | security-principles.md: 機密情報をログ・Renderer に漏洩しない。errorCode / errorCategory で UI 表示に十分        |
| parentEventId の外部キー制約 | 設けない                                                                | SQLite でのイベント削除は想定外だが、将来のアーカイブ処理で参照整合性エラーを避けるため LEFT JOIN で対応         |
| permissionMode の値セット    | SDK 実型（default/acceptEdits/bypassPermissions/plan/delegate/dontAsk） | P36 の教訓: カスタム declare module のカスタム値（auto/ask/deny）は SDK インストール後に無効になった             |
| Zustand キャッシュの件数     | 50件                                                                    | UI タイムライン表示は「直近の操作履歴」が主目的。全履歴は SQLite から IPC クエリで取得する                       |
| timestamp の型               | string (ISO 8601)                                                       | Electron Main/Renderer 間の IPC serialization で Date オブジェクトは structured clone で変換される。文字列が確実 |

---

_作成日: 2026-03-16_
_タスクID: TASK-SKILL-LIFECYCLE-07 / Phase 2 タスク1_
