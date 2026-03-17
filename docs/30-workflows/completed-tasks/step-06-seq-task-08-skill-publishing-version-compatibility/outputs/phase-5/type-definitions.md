# 型定義確定書

## メタ情報

| 項目       | 内容                                                                                                                                            |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| 文書       | Phase 5 - タスク1 成果物                                                                                                                        |
| タスクID   | TASK-SKILL-LIFECYCLE-08                                                                                                                         |
| 作成日     | 2026-03-17                                                                                                                                      |
| 依存成果物 | `outputs/phase-2/publishing-metadata-design.md`、`outputs/phase-2/compatibility-check-design.md`、`outputs/phase-2/publish-readiness-design.md` |
| 前提Phase  | Phase 4（テスト作成）完了                                                                                                                       |

---

## 目的

Phase 2 で設計した全 TypeScript 型定義を確定し、配置先ファイルパスを決定する。型定義は `packages/shared`（IPC 境界を跨いで Main/Renderer 両プロセスから参照する型）と `apps/desktop/src/main/domain/`（Main プロセス内部のみで使用する型）に配置する。TypeScript `strict: true` に準拠し、識別ユニオン型（discriminated union）で公開レベル別のメタデータ型安全を保証する。

---

## 1. packages/shared/src/skill/publishing-types.ts

### 1.1 SkillVisibility 型

```typescript
/**
 * スキルの公開レベルを表す型。
 * - "local" : 作成者のローカル環境のみ。Skill Center に表示されない
 * - "team"  : 指定ワークスペースメンバーに表示・実行可能
 * - "public": Skill Center の公開カタログに掲載。全ユーザーが検索・インポート可能
 *
 * デフォルト値: "local"（新規作成スキルは必ず "local" から開始する）
 * ファイル配置: packages/shared/src/skill/publishing-types.ts
 */
type SkillVisibility = "local" | "team" | "public";
```

**配置先**: `packages/shared/src/skill/publishing-types.ts`

**配置判断根拠**: Main プロセス（SkillRegistryService）と Renderer プロセス（UI コンポーネント）の両方から参照。IPC 境界を跨ぐためを `packages/shared` に配置（DIP 準拠）。

**M-AC-1 対応（isDeprecated フィールド管理）**: Phase 3 MINOR M-AC-1 の指摘（`"deprecated"` 状態の未収録）は、`SkillVisibility` 型に `"deprecated"` を追加するのではなく、StateChart の `S_DEPRECATED` 状態は `visibility: "team"` で表現する設計を継続する。`isDeprecated: boolean` フィールドを `SkillPublishingMetadata` に追加する対応は後続タスクとして未タスク化する。

---

### 1.2 SkillPublishingMetadata 型（識別ユニオン型）

Phase 2 設計書（`publishing-metadata-design.md`）の識別ユニオン型設計を確定する。

```typescript
/**
 * 全レベル共通の基底インターフェース。
 * 配置先: packages/shared/src/skill/publishing-types.ts
 */
interface SkillPublishingMetadataBase {
  /** スキル名（全レベル必須）。1文字以上100文字以下の非空文字列 */
  name: string;

  /** スキルの説明（全レベル必須）。20文字以上500文字以下の非空文字列 */
  description: string;

  /**
   * バージョン番号（全レベル必須）。semver 形式（例: "1.2.3"）に準拠。
   * 正規表現: /^\d+\.\d+\.\d+(-[a-zA-Z0-9.]+)?(\+[a-zA-Z0-9.]+)?$/
   */
  version: string;
}

/** local レベルのメタデータ */
interface LocalMetadata extends SkillPublishingMetadataBase {
  visibility: "local";
}

/** team レベルのメタデータ */
interface TeamMetadata extends SkillPublishingMetadataBase {
  visibility: "team";
  /** 作成者識別子（team レベルから必須）。1〜200文字 */
  author: string;
  /**
   * タグ一覧（team レベルから必須）。
   * 各タグは1〜50文字の非空文字列。最大10件。要素の重複不可。
   */
  tags: string[];
  /** チームID（team レベル必須）。1〜200文字 */
  teamId: string;
}

/** public レベルのメタデータ */
interface PublicMetadata extends SkillPublishingMetadataBase {
  visibility: "public";
  /** 作成者識別子（public レベル必須）。1〜200文字 */
  author: string;
  /**
   * タグ一覧（public レベル必須）。
   * 各タグは1〜50文字の非空文字列。最大10件。要素の重複不可。
   */
  tags: string[];
  /** チームID（public レベル必須）。1〜200文字 */
  teamId: string;
  /**
   * ライセンス識別子（public レベル必須）。例: "MIT", "Apache-2.0"。
   * 一度 public に昇格した後は変更不可。1〜100文字。
   */
  license: string;
  /** README 本文（public レベル必須）。Markdown 形式。100文字以上10000文字以下。*/
  readme: string;
  /** 変更履歴本文（public レベル必須）。Markdown 形式。1文字以上5000文字以下。*/
  changelog: string;
  /** 動作保証する最小アプリバージョン（public レベル必須）。semver 形式。*/
  minAppVersion: string;
  /** ソースコードリポジトリ URL（public レベル任意）。https:// または http:// で始まる。*/
  repository?: string;
}

/**
 * スキルの公開レベルに応じたメタデータを表す識別ユニオン型。
 * `visibility` フィールドで型を絞り込む（discriminated union）。
 * 配置先: packages/shared/src/skill/publishing-types.ts
 *
 * @example
 * function handleMetadata(meta: SkillPublishingMetadata) {
 *   if (meta.visibility === "public") {
 *     console.log(meta.license); // PublicMetadata として型が絞り込まれる
 *   }
 * }
 */
type SkillPublishingMetadata = LocalMetadata | TeamMetadata | PublicMetadata;
```

**配置先**: `packages/shared/src/skill/publishing-types.ts`

---

### 1.3 visibility 別必須フィールド表

| フィールド    | local | team | public | 制約                                               |
| ------------- | :---: | :--: | :----: | -------------------------------------------------- |
| name          | 必須  | 必須 |  必須  | 1〜100文字、非空文字列（P42準拠3段バリデーション） |
| description   | 必須  | 必須 |  必須  | 20文字以上500文字以下                              |
| version       | 必須  | 必須 |  必須  | semver 形式 `/^\d+\.\d+\.\d+.../`                  |
| author        | 不要  | 必須 |  必須  | 1〜200文字                                         |
| tags          | 不要  | 必須 |  必須  | 1件以上10件以下、各タグ1〜50文字、重複不可         |
| teamId        | 不要  | 必須 |  必須  | 1〜200文字                                         |
| license       | 不要  | 不要 |  必須  | 1〜100文字（昇格後変更不可）                       |
| readme        | 不要  | 不要 |  必須  | 100文字以上10000文字以下                           |
| changelog     | 不要  | 不要 |  必須  | 1文字以上5000文字以下                              |
| minAppVersion | 不要  | 不要 |  必須  | semver 形式                                        |
| repository    | 不要  | 不要 |  任意  | https:// または http:// 形式の URL                 |

---

### 1.4 バリデーション関連型定義

```typescript
/**
 * 文字列フィールドの3段バリデーション（P42 準拠）。
 * 1段目: typeof チェック
 * 2段目: 空文字列チェック（=== ""）
 * 3段目: トリム後の空文字列チェック（.trim() === ""）
 * 配置先: packages/shared/src/skill/publishing-types.ts
 */
function isValidString(value: unknown): value is string {
  return typeof value === "string" && value !== "" && value.trim() !== "";
}

/**
 * IPC レスポンス形式（P60 準拠: { success, data/error } wrapper）。
 * 全 IPC ハンドラは本形式でレスポンスを返す。
 * 配置先: packages/shared/src/types/ipc-response.ts
 */
type IpcResponse<T> =
  | { success: true; data: T }
  | { success: false; error: { code: string; message: string } };

/**
 * フィルタ状態の型定義。"all" はフィルタなし（全件表示）を表す。
 * 配置先: packages/shared/src/skill/publishing-types.ts
 */
type VisibilityFilter = SkillVisibility | "all";

const DEFAULT_VISIBILITY_FILTER: VisibilityFilter = "all";
```

---

## 2. packages/shared/src/skill/compatibility-types.ts

### 2.1 CompatibilityLevel 型

```typescript
/**
 * 互換性レベル
 * - "compatible"         : breaking change なし。patch バンプで公開可能
 * - "minor-incompatible" : 後方互換な追加変更のみ。minor バンプで公開可能
 * - "breaking"           : breaking change あり。major バンプが必須
 * 配置先: packages/shared/src/skill/compatibility-types.ts
 */
type CompatibilityLevel = "compatible" | "minor-incompatible" | "breaking";
```

**配置先**: `packages/shared/src/skill/compatibility-types.ts`

---

### 2.2 BreakingChange インターフェース

```typescript
/**
 * 破壊的変更の詳細
 * 配置先: packages/shared/src/skill/compatibility-types.ts
 *
 * changeType フィールド:
 * - "removed"        : 既存フィールドが削除された（M-1, M-4 条件）
 * - "type-changed"   : 既存フィールドの型が変更された（M-2, M-5 条件）
 * - "required-added" : 任意フィールドが必須化された（M-3 条件）
 */
interface BreakingChange {
  /** 対象フィールドパス（例: "input.query", "output.score"） */
  field: string;
  /** 変更種別 */
  changeType: "removed" | "type-changed" | "required-added";
  /** 変更前の値/型の説明 */
  before: string;
  /** 変更後の値/型の説明 */
  after: string;
}
```

**注記**: Phase 2 設計書（`compatibility-check-design.md`）の `type` フィールドを `changeType` に改名している（P45 準拠: フィールド名が値のセマンティクスに一致するよう命名）。

---

### 2.3 CompatibilityWarning インターフェース

```typescript
/**
 * 互換性警告（breaking ではないが注意が必要な変更）
 * 配置先: packages/shared/src/skill/compatibility-types.ts
 */
interface CompatibilityWarning {
  /** 対象フィールドパス（例: "input.limit", "output.confidence"） */
  field: string;
  /** 警告の内容 */
  message: string;
}
```

---

### 2.4 CompatibilityCheckResult インターフェース

```typescript
/**
 * 互換性チェック結果
 *
 * 不変条件:
 * - level === "breaking"           → breakingChanges.length >= 1
 * - level === "minor-incompatible" → breakingChanges.length === 0 かつ warnings.length >= 1
 * - level === "compatible"         → breakingChanges.length === 0 かつ warnings.length === 0
 * - suggestedBump は level に対して一意に決定される:
 *     "breaking" → "major", "minor-incompatible" → "minor", "compatible" → "patch"
 *
 * 配置先: packages/shared/src/skill/compatibility-types.ts
 */
interface CompatibilityCheckResult {
  /** 互換性レベル */
  level: CompatibilityLevel;
  /** 破壊的変更の一覧（level が "breaking" の場合のみ1件以上） */
  breakingChanges: BreakingChange[];
  /** 警告の一覧（level が "minor-incompatible" の場合のみ1件以上） */
  warnings: CompatibilityWarning[];
  /** 推奨バンプ種別（level から自動決定） */
  suggestedBump: "major" | "minor" | "patch";
}
```

**配置先**: `packages/shared/src/skill/compatibility-types.ts`

---

## 3. packages/shared/src/types/publish-eligibility.ts

### 3.1 PublishReadiness 型

```typescript
/**
 * 公開可否判定の結果型。
 * PublishReadinessChecker.check() の戻り値として使用する。
 * 配置先: packages/shared/src/types/publish-eligibility.ts
 */
type PublishReadiness =
  | { status: "auto-approved" }
  | { status: "review-required"; reasons: string[] }
  | { status: "manual-approval-required"; reasons: string[] }
  | { status: "blocked"; reasons: string[] };
```

**配置先**: `packages/shared/src/types/publish-eligibility.ts`

---

### 3.2 ToolRiskLevel 型

```typescript
/**
 * スキルが使用するツールの最高リスクレベル。
 * Task-06 の SafetyGateResult.overallGrade と details から変換して得る。
 * 配置先: packages/shared/src/types/publish-eligibility.ts
 */
type ToolRiskLevel = "low" | "medium" | "high" | "critical";
```

---

### 3.3 SafetyGateStatus 型

```typescript
/**
 * 安全性ゲートの承認状態。PermissionStore のセッション権限エントリから判定する。
 * 配置先: packages/shared/src/types/publish-eligibility.ts
 */
type SafetyGateStatus = "approved" | "pending" | "rejected";
```

---

### 3.4 SafetyGateInput インターフェース（Task-08 入力型）

```typescript
/**
 * Task-06 出力を公開可否判定用に変換した入力型。
 * Phase 5 でアダプタ関数を実装し、SafetyGateResult + PermissionStore から合成する。
 * 配置先: packages/shared/src/types/publish-eligibility.ts
 */
interface SafetyGateInput {
  /** スキルが要求するツールの最高リスクレベル */
  riskLevel: ToolRiskLevel;
  /** 安全性ゲートの承認状態 */
  gateStatus: SafetyGateStatus;
  /** セキュリティスキャンの集計結果 */
  securityScan: {
    passed: boolean;
    criticalFindings: number;
    warnings: number;
  };
}
```

---

### 3.5 QualityTrend 型

```typescript
/**
 * 品質スコアの時系列変化を表す型。
 * Task-07 の SkillAggregateView.trend を直接マッピングする。
 * 配置先: packages/shared/src/types/publish-eligibility.ts
 */
type QualityTrend = "improving" | "stable" | "declining";
```

---

### 3.6 ObservabilityMetrics インターフェース

```typescript
/**
 * Task-07 出力を公開可否判定用に変換した入力型。
 * 配置先: packages/shared/src/types/publish-eligibility.ts
 */
interface ObservabilityMetrics {
  /** 実行成功率（0〜100の整数値）。直近30日間の成功率。実行履歴がない場合は 0 */
  successRate: number;
  /** 品質スコアトレンド */
  qualityTrend: QualityTrend;
  /** ユーザーフィードバックスコア（0〜5）。データなしの場合は 0 */
  feedbackScore: number;
}
```

---

## 4. packages/shared/src/index.ts からの re-export 計画

```typescript
// publishing-types.ts から re-export
export type {
  SkillVisibility,
  SkillPublishingMetadata,
  SkillPublishingMetadataBase,
  LocalMetadata,
  TeamMetadata,
  PublicMetadata,
  VisibilityFilter,
} from "./skill/publishing-types";

export { DEFAULT_VISIBILITY_FILTER } from "./skill/publishing-types";

// compatibility-types.ts から re-export
export type {
  CompatibilityLevel,
  BreakingChange,
  CompatibilityWarning,
  CompatibilityCheckResult,
} from "./skill/compatibility-types";

// publish-eligibility.ts から re-export
export type {
  PublishReadiness,
  ToolRiskLevel,
  SafetyGateStatus,
  SafetyGateInput,
  QualityTrend,
  ObservabilityMetrics,
} from "./types/publish-eligibility";
```

---

## 5. M-AC-2 後方互換保持世代数（Phase 3 MINOR 対応）

Phase 3 MINOR M-AC-2（後方互換保持世代数のポリシー実装方針が未定義）に対する確定事項:

| 公開レベル | 保持世代数 | 実装方針                                                                                                                                       |
| ---------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `"public"` | N-2 世代   | `SkillRegistryService.update()` が互換性チェック結果の `breakingChanges` を参照し、major バンプ時に旧2世代を「非推奨（deprecated）」マークする |
| `"team"`   | N-1 世代   | 同様に直前世代のみ保持し、それ以前は削除対象とする                                                                                             |
| `"local"`  | 制限なし   | ローカルスキルの世代管理はユーザーの裁量に委ねる                                                                                               |

この方針は `SkillRegistryService` インターフェースの `update()` メソッドの事後条件として `service-interfaces.md` に反映する。

---

## 6. M-AC-3 カテゴリ固定値（Phase 3 MINOR 対応）

Phase 3 MINOR M-AC-3（カテゴリ固定値の列挙が未収録）に対する確定事項:

カテゴリは `tags` フィールドで代替する設計を採用する。固定カテゴリ値の列挙型は定義しない。

根拠: カテゴリの固定化はスキルエコシステムの拡張性を制限するため、自由記述のタグシステムで柔軟性を確保する。`tags` の制約（最大10件、各1〜50文字）のみで管理する。

---

## 7. Phase 1/2 トレーサビリティ

| 型名                     | Phase 1 受入基準 | Phase 2 設計書                     | Phase 5 確定ファイル                             |
| ------------------------ | ---------------- | ---------------------------------- | ------------------------------------------------ |
| SkillVisibility          | AC-1             | publishing-metadata-design.md §2.1 | packages/shared/src/skill/publishing-types.ts    |
| SkillPublishingMetadata  | AC-1             | publishing-metadata-design.md §2.2 | packages/shared/src/skill/publishing-types.ts    |
| CompatibilityLevel       | AC-2             | compatibility-check-design.md §2.1 | packages/shared/src/skill/compatibility-types.ts |
| BreakingChange           | AC-2             | compatibility-check-design.md §2.1 | packages/shared/src/skill/compatibility-types.ts |
| CompatibilityWarning     | AC-2             | compatibility-check-design.md §2.1 | packages/shared/src/skill/compatibility-types.ts |
| CompatibilityCheckResult | AC-2             | compatibility-check-design.md §2.1 | packages/shared/src/skill/compatibility-types.ts |
| PublishReadiness         | AC-3             | publish-readiness-design.md §3.1   | packages/shared/src/types/publish-eligibility.ts |
| ToolRiskLevel            | AC-3             | publish-readiness-design.md §1.1   | packages/shared/src/types/publish-eligibility.ts |
| SafetyGateStatus         | AC-3             | publish-readiness-design.md §1.2   | packages/shared/src/types/publish-eligibility.ts |
| SafetyGateInput          | AC-3             | publish-readiness-design.md §1.4   | packages/shared/src/types/publish-eligibility.ts |
| QualityTrend             | AC-3             | publish-readiness-design.md §2.1   | packages/shared/src/types/publish-eligibility.ts |
| ObservabilityMetrics     | AC-3             | publish-readiness-design.md §2.2   | packages/shared/src/types/publish-eligibility.ts |

---

## 8. Phase 3 MINOR 対応状況（全10件）

| MINOR ID | 指摘内容                           | 対応状況   | 本文書での対応内容                                                                              |
| -------- | ---------------------------------- | ---------- | ----------------------------------------------------------------------------------------------- |
| M-AC-1   | `"deprecated"` 状態の型未収録      | 解決済み   | セクション1.1 で isDeprecated フィールドを後続未タスクとして管理する方針を確定                  |
| M-AC-2   | 後方互換保持世代数ポリシー未定義   | 解決済み   | セクション5 で public: N-2世代、team: N-1世代、local: 制限なしの方針を確定                      |
| M-AC-3   | カテゴリ固定値の列挙未収録         | 解決済み   | セクション6 で tags フィールドで代替し、固定カテゴリ列挙型は定義しない方針を確定                |
| M-SS-1   | CSS変数衝突確認                    | 未対象     | 型定義に直接影響なし。実装タスクで grep 確認する                                                |
| M-SS-2   | フィルタUI配置先コンポーネント確定 | 未対象     | 型定義に直接影響なし。zustand-slice-design.md で対応済み                                        |
| M-SS-3   | 型名重複確認                       | 解決済み   | 配置先パスを `publishing-types.ts` / `compatibility-types.ts` / `publish-eligibility.ts` に確定 |
| M-DQ-1   | semver ライブラリ未定義            | 未対象     | 型定義に直接影響なし。service-interfaces.md で対応済み                                          |
| M-DQ-2   | update() 内通知の責務越境          | 未対象     | 型定義に直接影響なし。service-interfaces.md で対応済み                                          |
| M-DQ-3   | reasons フィールドの日本語固定     | 未タスク化 | i18n 対応として未タスク化（Phase 3 確定済み）                                                   |
| M-DQ-4   | SkillDependency DI境界配置先未確定 | 未対象     | 型定義に直接影響なし。service-interfaces.md で対応済み                                          |
