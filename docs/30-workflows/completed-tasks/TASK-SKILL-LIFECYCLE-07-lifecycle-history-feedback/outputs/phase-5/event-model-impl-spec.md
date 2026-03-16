# イベントモデル実装仕様書

## メタ情報

| 項目       | 内容                                                                                                                                          |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Phase      | 5                                                                                                                                             |
| タスクID   | TASK-SKILL-LIFECYCLE-07                                                                                                                       |
| 作成日     | 2026-03-16                                                                                                                                    |
| 入力成果物 | `outputs/phase-2/event-model-design.md`                                                                                                       |
| 出力パス   | `docs/30-workflows/skill-lifecycle-unification/tasks/step-05-par-task-07-lifecycle-history-feedback/outputs/phase-5/event-model-impl-spec.md` |
| 配置先     | `packages/shared/src/skill/lifecycle-types.ts`, `packages/shared/src/skill/lifecycle-event-factory.ts`                                        |

---

## 1. 概要

本ドキュメントは `SkillLifecycleEvent` 型および関連型の TypeScript 実装仕様を定義する。
Phase 2 設計書 `event-model-design.md` を入力とし、実装者が迷わず実装できるレベルの詳細仕様を提供する。

---

## 2. 配置ファイル構成

```
packages/shared/src/skill/
  lifecycle-types.ts          # 全型定義・定数（本仕様書の主対象）
  lifecycle-event-factory.ts  # createLifecycleEvent() ファクトリ関数
  index.ts                    # re-export
```

---

## 3. `lifecycle-types.ts` 型定義仕様

### 3-1. SkillName Branded Type

```typescript
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
 * P42準拠: 型チェック → 空文字列 → トリム空文字列 の3段バリデーション。
 *
 * @throws {Error} 空文字列またはトリム後空文字列の場合
 * @throws {Error} 許可文字（a-z, 0-9, _, -）以外を含む場合
 */
export function toSkillName(value: string): SkillName {
  // Stage 1: 型チェック（呼び出し元が string を渡す前提だが念のため）
  if (typeof value !== "string") {
    throw new Error("SkillName must be a string");
  }
  // Stage 2: 空文字列チェック
  if (value === "") {
    throw new Error("SkillName must not be empty");
  }
  // Stage 3: トリム後空文字列チェック
  if (value.trim() === "") {
    throw new Error("SkillName must not be blank");
  }
  // 安全文字チェック（パストラバーサル防止）
  if (!/^[a-z0-9_-]+$/i.test(value.trim())) {
    throw new Error(
      "SkillName must contain only alphanumeric characters, hyphens, or underscores",
    );
  }
  return value.trim() as SkillName;
}
```

**制約サマリー**:

| フィールド | 型       | 制約                                  | デフォルト値 |
| ---------- | -------- | ------------------------------------- | ------------ |
| value      | `string` | 非空・トリム後非空・`[a-z0-9_-]` のみ | なし（必須） |

---

### 3-2. SkillEventType Union（18種別）

```typescript
/**
 * スキルライフサイクルイベント種別 Union型（18種別）
 * カテゴリ別にグルーピングして可読性を確保する。
 */
export type SkillEventType =
  // --- creation カテゴリ（3種）---
  | "skill:created" // スキル新規作成
  | "skill:imported" // スキルインポート（外部ソースから）
  | "skill:cloned" // 既存スキルからのクローン作成

  // --- execution カテゴリ（4種）---
  | "skill:executed" // 実行開始
  | "skill:execution_succeeded" // 実行成功
  | "skill:execution_failed" // 実行失敗
  | "skill:execution_timeout" // 実行タイムアウト

  // --- evaluation カテゴリ（3種）---
  | "skill:evaluated" // スコアゲートによる評価実施
  | "skill:score_updated" // スコア手動更新
  | "skill:reviewed" // 人間レビュー実施

  // --- improvement カテゴリ（4種）---
  | "skill:improved" // 改善適用
  | "skill:version_bumped" // バージョン更新
  | "skill:deprecated" // 非推奨化
  | "skill:archived" // アーカイブ

  // --- reuse カテゴリ（4種）---
  | "skill:reused" // 再利用（fork/参照）
  | "skill:shared" // 共有（別ユーザーへ）
  | "skill:exported" // エクスポート
  | "skill:template_created"; // テンプレート化
```

**種別数確認**: creation(3) + execution(4) + evaluation(3) + improvement(4) + reuse(4) = **18種別**

---

### 3-3. EventCategory（5種）

```typescript
/**
 * イベントカテゴリ（5種）
 * 複数のイベント種別をグルーピングするための分類軸。
 * SQLite インデックスや Zustand セレクタのフィルタリングに使用する。
 */
export type EventCategory =
  | "creation" // スキル作成・インポート・クローン
  | "execution" // 実行・成功・失敗・タイムアウト
  | "evaluation" // 評価・スコア更新・レビュー
  | "improvement" // 改善・バージョン更新・非推奨・アーカイブ
  | "reuse"; // 再利用・共有・エクスポート・テンプレート化

/**
 * SkillEventType から EventCategory へのマッピング定数。
 * Record<SkillEventType, EventCategory> で網羅性を型で保証する（P02-code-quality 準拠）。
 */
export const EVENT_CATEGORY_MAP: Record<SkillEventType, EventCategory> = {
  "skill:created": "creation",
  "skill:imported": "creation",
  "skill:cloned": "creation",
  "skill:executed": "execution",
  "skill:execution_succeeded": "execution",
  "skill:execution_failed": "execution",
  "skill:execution_timeout": "execution",
  "skill:evaluated": "evaluation",
  "skill:score_updated": "evaluation",
  "skill:reviewed": "evaluation",
  "skill:improved": "improvement",
  "skill:version_bumped": "improvement",
  "skill:deprecated": "improvement",
  "skill:archived": "improvement",
  "skill:reused": "reuse",
  "skill:shared": "reuse",
  "skill:exported": "reuse",
  "skill:template_created": "reuse",
} as const;
```

---

### 3-4. EventSource（3種）

```typescript
/**
 * イベント発生源（3種）
 * イベントがどのプロセス・主体から発生したかを示す。
 */
export type EventSource =
  | "system" // Main Process 自動処理（SkillExecutor / ScoringGate）
  | "user" // ユーザー操作（Renderer 経由の UI 操作）
  | "api"; // 外部 API / スクリプト呼び出し（将来拡張用）
```

---

### 3-5. カテゴリ別 metadata スキーマ

各カテゴリのメタデータは discriminated union で表現する。

```typescript
// ================================================================
// creation カテゴリ metadata
// ================================================================

export interface CreationMetadata {
  /** スキルの初期バージョン（semver）。例: "1.0.0" */
  initialVersion: string;
  /** 作成元テンプレート名（クローン・テンプレートから作成した場合のみ）*/
  sourceTemplateName?: string;
  /** インポート元パス（importedイベントのみ）*/
  importSourcePath?: string;
}

// ================================================================
// execution カテゴリ metadata
// ================================================================

export interface ExecutionMetadata {
  /** 実行セッションID（UUID v4）。一連の実行を追跡する */
  sessionId: string;
  /**
   * 実行所要時間（ミリ秒）。
   * skill:executed 時点では undefined（完了時に設定される）。
   * skill:execution_succeeded / failed / timeout 時に設定。
   */
  durationMs?: number;
  /** 失敗・タイムアウト時のエラーコード */
  errorCode?: string;
  /**
   * 失敗・タイムアウト時のエラーメッセージ（PII除外済み）。
   * セキュリティ原則（security-principles.md）に従い PII を含めない。
   */
  errorMessage?: string;
  /** 実行入力のトークン数（推定）*/
  inputTokenCount?: number;
  /** 実行出力のトークン数（推定）*/
  outputTokenCount?: number;
}

// ================================================================
// evaluation カテゴリ metadata
// ================================================================

export interface EvaluationMetadata {
  /** 評価スコア（0〜100）。skill:evaluated / skill:reviewed 時に設定 */
  score?: number;
  /**
   * スコア更新前の値（skill:score_updated 時のみ）。
   * INT-M-02 解決: score は number | undefined とし、null ではなく未設定時は undefined。
   */
  previousScore?: number;
  /** スコア更新後の値（skill:score_updated 時のみ）*/
  newScore?: number;
  /** 評価者識別子（human review の場合のみ）*/
  reviewerId?: string;
  /** 評価コメント（最大500文字）*/
  comment?: string;
}

// ================================================================
// improvement カテゴリ metadata
// ================================================================

export interface ImprovementMetadata {
  /** 改善前バージョン（semver）*/
  previousVersion?: string;
  /** 改善後バージョン（semver）*/
  newVersion?: string;
  /** 改善対象セクション */
  targetSection?:
    | "prompt_template"
    | "examples"
    | "context"
    | "output_format"
    | "other";
  /** 改善の説明（最大500文字）*/
  description?: string;
  /** 起因となったフィードバックID（UUID v4）*/
  sourceFeedbackId?: string;
}

// ================================================================
// reuse カテゴリ metadata
// ================================================================

export interface ReuseMetadata {
  /** 再利用先スキル名（reused / cloned 時）*/
  targetSkillName?: string;
  /** 共有先ユーザーID（shared 時）*/
  targetUserId?: string;
  /** エクスポート先パス（exported 時）*/
  exportPath?: string;
  /** テンプレート名（template_created 時）*/
  templateName?: string;
}

// ================================================================
// カテゴリ別 metadata Union
// ================================================================

export type LifecycleEventMetadata =
  | CreationMetadata
  | ExecutionMetadata
  | EvaluationMetadata
  | ImprovementMetadata
  | ReuseMetadata;
```

---

### 3-6. SkillLifecycleEvent コア型

```typescript
/**
 * スキルライフサイクルイベントの基底型。
 * 全18種別のイベントが共通して持つフィールドを定義する。
 */
export interface SkillLifecycleEvent {
  // --- 識別情報 ---
  /**
   * イベント固有識別子（UUID v4）。
   * createLifecycleEvent() が自動生成する。
   */
  id: string;

  /**
   * 対象スキル名（SkillName Branded Type）。
   * ファイルシステム上のディレクトリ名と一致する。
   */
  skillId: SkillName;

  // --- 分類情報 ---
  /** イベント種別（18種別の Union）*/
  eventType: SkillEventType;

  /** イベントカテゴリ（EVENT_CATEGORY_MAP から自動導出）*/
  category: EventCategory;

  /** イベント発生源（system / user / api）*/
  source: EventSource;

  // --- 時刻情報 ---
  /**
   * イベント発生日時（ISO 8601 UTC）。
   * 例: "2026-03-16T07:17:53.000Z"
   * createLifecycleEvent() が new Date().toISOString() で自動生成する。
   */
  timestamp: string;

  // --- バージョン情報 ---
  /**
   * イベント発生時のスキルバージョン（semver）。
   * 例: "1.2.0"
   */
  skillVersion: string;

  // --- 関連イベント ---
  /**
   * 親イベントID（UUID v4）。
   * skill:execution_succeeded / failed / timeout は対応する skill:executed の id を参照する。
   * 親イベントがない場合は null。
   */
  parentEventId: string | null;

  // --- メタデータ ---
  /**
   * イベント種別固有のメタデータ。
   * カテゴリに応じた型は §3-5 を参照。
   * メタデータがないイベント種別では {} を設定する。
   */
  metadata: LifecycleEventMetadata | Record<string, never>;
}
```

**全フィールド制約一覧**:

| フィールド      | 型                                      | 制約                                      | デフォルト値         |
| --------------- | --------------------------------------- | ----------------------------------------- | -------------------- |
| `id`            | `string`                                | UUID v4 形式、非空                        | 自動生成（uuid v4）  |
| `skillId`       | `SkillName`                             | Branded Type。`[a-z0-9_-]` のみ、非空     | なし（必須）         |
| `eventType`     | `SkillEventType`                        | 18種別 Union の1つ                        | なし（必須）         |
| `category`      | `EventCategory`                         | EVENT_CATEGORY_MAP から自動導出           | 自動設定             |
| `source`        | `EventSource`                           | `"system"` / `"user"` / `"api"` の1つ     | なし（必須）         |
| `timestamp`     | `string`                                | ISO 8601 UTC 形式（"Z"終端）              | 自動生成（現在時刻） |
| `skillVersion`  | `string`                                | semver 形式。例: `"1.2.0"`                | なし（必須）         |
| `parentEventId` | `string \| null`                        | UUID v4 形式または null                   | `null`               |
| `metadata`      | `LifecycleEventMetadata \| Record<...>` | カテゴリ別スキーマ準拠。メタなし時は `{}` | `{}`                 |

---

## 4. `lifecycle-event-factory.ts` ファクトリ関数仕様

### 4-1. createLifecycleEvent パラメータ型

```typescript
import { v4 as uuidv4 } from "uuid";

/**
 * createLifecycleEvent() の入力パラメータ型。
 * 自動生成フィールド（id, timestamp, category）は省略可能。
 */
export interface CreateLifecycleEventParams {
  /** 対象スキル名（SkillName）。toSkillName() でバリデーション済みのものを渡す */
  skillId: SkillName;
  /** イベント種別（18種別）*/
  eventType: SkillEventType;
  /** イベント発生源 */
  source: EventSource;
  /** スキルバージョン（semver）*/
  skillVersion: string;
  /**
   * 親イベントID（UUID v4）。
   * skill:execution_succeeded / failed / timeout の場合は対応する skill:executed の id を渡す。
   * 省略時は null。
   */
  parentEventId?: string | null;
  /**
   * カテゴリ別メタデータ。
   * 省略時は {} を設定する。
   */
  metadata?: LifecycleEventMetadata | Record<string, never>;
  /**
   * タイムスタンプ（ISO 8601 UTC）。
   * テスト用に固定値を渡す場合に使用。
   * 省略時は new Date().toISOString() を使用。
   */
  timestamp?: string;
}
```

### 4-2. createLifecycleEvent 関数実装仕様

```typescript
/**
 * SkillLifecycleEvent を生成するファクトリ関数。
 *
 * 自動生成:
 *   - id: UUID v4（crypto.randomUUID() またはuuid ライブラリ）
 *   - timestamp: ISO 8601 UTC（省略時は現在時刻）
 *   - category: EVENT_CATEGORY_MAP[eventType] から自動導出
 *
 * P42 バリデーション（3段階）:
 *   - skillId: toSkillName() 内でバリデーション済みの SkillName を受け取る
 *   - skillVersion: 非空チェック（Stage 1-3）
 *   - eventType: SkillEventType Union に含まれることを確認（実行時ガード）
 *
 * @throws {Error} skillVersion が空文字列またはトリム後空文字列の場合
 * @throws {Error} eventType が SkillEventType に含まれない場合
 */
export function createLifecycleEvent(
  params: CreateLifecycleEventParams,
): SkillLifecycleEvent {
  const {
    skillId,
    eventType,
    source,
    skillVersion,
    parentEventId = null,
    metadata = {},
    timestamp,
  } = params;

  // --- P42 バリデーション: skillVersion ---
  // Stage 1: 型チェック
  if (typeof skillVersion !== "string") {
    throw new Error("skillVersion must be a string");
  }
  // Stage 2: 空文字列チェック
  if (skillVersion === "") {
    throw new Error("skillVersion must not be empty");
  }
  // Stage 3: トリム後空文字列チェック
  if (skillVersion.trim() === "") {
    throw new Error("skillVersion must not be blank");
  }

  // --- eventType 実行時ガード ---
  if (!(eventType in EVENT_CATEGORY_MAP)) {
    throw new Error(`Unknown eventType: ${eventType}`);
  }

  // --- 自動生成フィールド ---
  const id = uuidv4();
  const resolvedTimestamp = timestamp ?? new Date().toISOString();
  const category = EVENT_CATEGORY_MAP[eventType];

  return {
    id,
    skillId,
    eventType,
    category,
    source,
    timestamp: resolvedTimestamp,
    skillVersion: skillVersion.trim(),
    parentEventId,
    metadata,
  };
}
```

### 4-3. バリデーション詳細

**P42準拠 3段バリデーション適用フィールド**:

| フィールド     | Stage 1 (型)        | Stage 2 (空文字)   | Stage 3 (トリム後空) | エラーコード    |
| -------------- | ------------------- | ------------------ | -------------------- | --------------- |
| `skillId`      | `toSkillName()` 内  | `toSkillName()` 内 | `toSkillName()` 内   | `Error` (throw) |
| `skillVersion` | `typeof !== string` | `=== ""`           | `.trim() === ""`     | `Error` (throw) |
| `eventType`    | Union 型保証        | N/A                | 実行時: `in` 演算子  | `Error` (throw) |

**境界値処理**:

| 条件                              | 処理                              | 返値・動作       |
| --------------------------------- | --------------------------------- | ---------------- |
| `parentEventId` が省略            | `null` を設定                     | `null`           |
| `metadata` が省略                 | `{}` を設定                       | `{}`             |
| `timestamp` が省略                | `new Date().toISOString()` を使用 | 現在時刻（UTC）  |
| `eventType` が未知の値            | `Error` を throw                  | 例外             |
| `skillVersion` にホワイトスペース | `.trim()` 後の値を使用            | トリム済み文字列 |

---

## 5. re-export 設計（index.ts）

```typescript
// packages/shared/src/skill/index.ts
export type {
  SkillName,
  SkillEventType,
  EventCategory,
  EventSource,
  CreationMetadata,
  ExecutionMetadata,
  EvaluationMetadata,
  ImprovementMetadata,
  ReuseMetadata,
  LifecycleEventMetadata,
  SkillLifecycleEvent,
  CreateLifecycleEventParams,
} from "./lifecycle-types";

export { toSkillName, EVENT_CATEGORY_MAP } from "./lifecycle-types";

export { createLifecycleEvent } from "./lifecycle-event-factory";
```

---

## 6. 実装上の注意事項

### 6-1. UUID 生成ライブラリ

`uuidv4()` は `uuid` パッケージ（v9以降）の `v4` 関数を使用する。
`crypto.randomUUID()` は Node.js 14.17.0+ / ブラウザ対応があるが、Electron の Preload 環境での動作確認が必要なため、`uuid` パッケージを推奨する。

```typescript
import { v4 as uuidv4 } from "uuid";
```

### 6-2. ISO 8601 タイムスタンプ形式

`new Date().toISOString()` は常に `"Z"` 終端の UTC 文字列を返す。
例: `"2026-03-16T07:17:53.123Z"`

ローカル時刻への変換は UI 表示レイヤーの責務とし、ストア・IPC・SQLite では常に UTC 文字列で保持する。

### 6-3. Branded Type の運用

`SkillName` は型レベルで `string` と区別されるが、JSON シリアライズ時は通常の文字列として扱われる。
Zustand persist や IPC 経由のデータは `as SkillName` ではなく `toSkillName()` を経由して復元すること（P19 型キャストバイパス防止）。

### 6-4. metadata の型安全アクセス

`metadata` フィールドへのアクセスは `in` 演算子で実行時型チェックを行う（P49対策）。

```typescript
// ❌ P49 違反: as キャストでバイパス
const score = (event.metadata as EvaluationMetadata).score;

// ✅ in 演算子で実行時検証
if ("score" in event.metadata && typeof event.metadata.score === "number") {
  const score = event.metadata.score;
}
```

---

## 7. テスト対象一覧

| テスト対象                                        | テストファイル                    |
| ------------------------------------------------- | --------------------------------- |
| `toSkillName()` P42バリデーション（3段階）        | `lifecycle-types.test.ts`         |
| `EVENT_CATEGORY_MAP` 全18種別のマッピング確認     | `lifecycle-types.test.ts`         |
| `createLifecycleEvent()` 自動フィールド生成       | `lifecycle-event-factory.test.ts` |
| `createLifecycleEvent()` P42バリデーション        | `lifecycle-event-factory.test.ts` |
| `createLifecycleEvent()` 未知 eventType エラー    | `lifecycle-event-factory.test.ts` |
| `createLifecycleEvent()` parentEventId デフォルト | `lifecycle-event-factory.test.ts` |
| metadata アクセスの型ガード（P49対策）            | `lifecycle-event-factory.test.ts` |

---

_作成日: 2026-03-16_
_タスクID: TASK-SKILL-LIFECYCLE-07 / Phase 5 成果物1_
