# 互換性チェック設計書（Phase 2 Task 2）

## メタ情報

| 項目       | 内容                                                                          |
| ---------- | ----------------------------------------------------------------------------- |
| 文書       | Phase 2 - Task 2 成果物（semver・schema・依存バージョン互換性チェックの設計） |
| タスクID   | TASK-SKILL-LIFECYCLE-08                                                       |
| 作成日     | 2026-03-17                                                                    |
| 受入基準   | AC-2                                                                          |
| 前提Phase  | Phase 1（要件定義）完了                                                       |
| 関連成果物 | `outputs/phase-1/compatibility-requirements.md`                               |

---

## 1. 概要

本文書は TASK-SKILL-LIFECYCLE-08 の Phase 2 Task 2 の設計成果物として、以下の3領域にわたる互換性チェック機構を設計する。

1. **Semver 比較ロジック**: スキル更新時の major/minor/patch バンプ自動判定
2. **Schema 互換性チェッカー**: `inputSchema`/`outputSchema` の diff 検出と breaking change 自動判定
3. **依存バージョン制約チェック**: 依存スキル間の semver range 検証と conflict 検出

本文書は設計仕様であり、プロダクションコードは含まない（実装は Phase 5 以降）。

---

## 2. 型定義

### 2.1 コア型定義（packages/shared 配置）

```typescript
/**
 * 互換性レベル
 *
 * - "compatible"         : breaking change なし。patch バンプで公開可能
 * - "minor-incompatible" : 後方互換な追加変更のみ。minor バンプで公開可能
 * - "breaking"           : breaking change あり。major バンプが必須
 */
type CompatibilityLevel = "compatible" | "minor-incompatible" | "breaking";

/**
 * 破壊的変更の詳細
 *
 * type フィールド:
 * - "removed"        : 既存フィールドが削除された（M-1, M-4 条件）
 * - "type-changed"   : 既存フィールドの型が変更された（M-2, M-5 条件）
 * - "required-added" : 任意フィールドが必須化された（M-3 条件）
 */
interface BreakingChange {
  /** 対象フィールドパス（例: "input.query", "output.score"） */
  field: string;
  /** 変更種別（3値のユニオン） */
  type: "removed" | "type-changed" | "required-added";
  /** 人間可読な変更説明（例: "フィールド 'query' が削除されました"） */
  description: string;
  /** 深刻度（breaking change は常に "error"） */
  severity: "error";
}

/**
 * 互換性警告（breaking ではないが注意が必要な変更）
 *
 * type フィールド:
 * - "optional-added"    : 任意フィールドが追加された（m-1, m-2 条件）
 * - "deprecated"        : フィールドが非推奨になった
 * - "behavior-changed"  : プロンプトや内部動作が変更されたが、インターフェースは同一
 */
interface CompatibilityWarning {
  /** 対象フィールドパス（例: "input.limit", "output.confidence"） */
  field: string;
  /** 警告種別 */
  type: "optional-added" | "deprecated" | "behavior-changed";
  /** 人間可読な説明（例: "任意フィールド 'limit' が追加されました（minor 変更）"） */
  description: string;
  /** 深刻度（warning は常に "warning"） */
  severity: "warning";
}

/**
 * 互換性チェック結果
 *
 * 事後条件（不変条件）:
 * - level === "breaking"          → breakingChanges.length >= 1
 * - level === "minor-incompatible" → breakingChanges.length === 0 かつ warnings.length >= 1
 * - level === "compatible"         → breakingChanges.length === 0 かつ warnings.length === 0
 * - suggestedBump は level に対して一意に決定される:
 *     "breaking" → "major", "minor-incompatible" → "minor", "compatible" → "patch"
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

### 2.2 Schema 互換性チェッカー型定義（Domain Logic 内部）

```typescript
/**
 * スキーマフィールドの記述
 */
interface SchemaField {
  /** フィールド名（例: "query", "limit"） */
  name: string;
  /** JSON Schema type（例: "string", "number", "boolean", "object", "array"） */
  type: string;
  /** 必須フィールドかどうか */
  isRequired: boolean;
}

/**
 * スキーマフィールドの変更記録
 */
interface SchemaFieldChange {
  /** フィールド名 */
  name: string;
  /** 変更前の型 */
  oldType: string;
  /** 変更後の型 */
  newType: string;
  /** 変更前の必須フラグ */
  wasRequired: boolean;
  /** 変更後の必須フラグ */
  isRequired: boolean;
}

/**
 * スキーマ差分
 */
interface SchemaDiff {
  /** 追加されたフィールド（after にのみ存在） */
  added: SchemaField[];
  /** 削除されたフィールド（before にのみ存在） */
  removed: SchemaField[];
  /** 変更されたフィールド（型または必須フラグが異なる） */
  modified: SchemaFieldChange[];
}

/**
 * Schema 互換性チェッカー（Port 同階層 / Domain Logic 内部）
 *
 * 配置: `apps/desktop/src/main/domain/schema-compatibility-checker.ts`
 * 具象クラス: `DefaultSchemaCompatibilityChecker`
 */
interface SchemaCompatibilityChecker {
  /**
   * 入力スキーマの差分を検出する
   *
   * @param oldSchema - 旧バージョンのスキル設定（inputSchema を含む）
   * @param newSchema - 新バージョンのスキル設定（inputSchema を含む）
   * @returns 入力スキーマの差分
   */
  checkInputSchema(oldSchema: SkillSchema, newSchema: SkillSchema): SchemaDiff;

  /**
   * 出力スキーマの差分を検出する
   *
   * @param oldSchema - 旧バージョンのスキル設定（outputSchema を含む）
   * @param newSchema - 新バージョンのスキル設定（outputSchema を含む）
   * @returns 出力スキーマの差分
   *
   * 注意: 出力スキーマでは required 概念を適用しない（全フィールドを任意として扱う）
   */
  checkOutputSchema(oldSchema: SkillSchema, newSchema: SkillSchema): SchemaDiff;

  /**
   * SchemaDiff から BreakingChange[] を抽出する
   *
   * @param diff - checkInputSchema または checkOutputSchema の戻り値
   * @returns 破壊的変更の一覧（0件の場合は空配列）
   *
   * 判定ルール:
   * - diff.removed の各フィールド → type: "removed" の BreakingChange
   * - diff.modified で oldType !== newType → type: "type-changed" の BreakingChange
   * - diff.modified で !wasRequired && isRequired → type: "required-added" の BreakingChange
   */
  detectBreakingChanges(diff: SchemaDiff): BreakingChange[];
}

/**
 * SchemaCompatibilityChecker が参照するスキル設定の最小型
 *
 * SkillConfig の inputSchema/outputSchema フィールドに対応する。
 * JSON Schema 形式のサブセット（properties と required のみ使用）。
 */
interface SkillSchema {
  properties?: Record<string, { type: string }>;
  required?: string[];
}
```

### 2.3 依存解決型定義（Domain Logic 内部）

```typescript
/**
 * 依存スキルのバージョン制約
 */
interface DependencyConstraint {
  /** 依存先スキルの一意識別子 */
  skillId: string;
  /**
   * semver range 記法
   * サポート記法（npm semver 準拠）:
   * - "^1.0.0"         : minor・patch 更新を許容（>= 1.0.0 < 2.0.0）
   * - "~1.2.0"         : patch 更新のみ許容（>= 1.2.0 < 1.3.0）
   * - ">=1.0.0 <2.0.0" : 明示的な範囲指定
   */
  versionRange: string;
}

/**
 * 依存 conflict の詳細
 */
interface DependencyConflict {
  /** conflict が発生した依存スキルのID */
  skillId: string;
  /** conflict を起こしている制約の一覧（2件以上） */
  constraints: DependencyConstraint[];
  /** 人間可読なエラーメッセージ */
  message: string;
}

/**
 * 依存解決結果
 *
 * resolved: true  → 全制約が満足可能（解決済みバージョンの Map を返す）
 * resolved: false → 1件以上の conflict が存在（conflict 詳細を返す）
 */
type DependencyResolutionResult =
  | { resolved: true; versions: Map<string, string> }
  | { resolved: false; conflicts: DependencyConflict[] };

/**
 * 依存解決器（Port 同階層 / Domain Logic 内部）
 *
 * 配置: `apps/desktop/src/main/domain/dependency-resolver.ts`
 * 具象クラス: `DefaultDependencyResolver`
 */
interface DependencyResolver {
  /**
   * 依存スキルのバージョン制約を解決する
   *
   * @param dependencies - 解決対象の依存制約一覧
   * @returns 解決成功時は { resolved: true, versions: Map }、
   *          conflict 検出時は { resolved: false, conflicts: [...] }
   *
   * 事後条件:
   * - 同一 skillId に対して2件以上の versionRange が存在し、それらの積集合が空の場合
   *   → resolved: false, conflicts に該当 DependencyConflict を含む
   * - 全制約が満足可能な場合 → resolved: true, versions に { skillId: resolvedVersion } を含む
   */
  resolve(dependencies: DependencyConstraint[]): DependencyResolutionResult;
}
```

### 2.4 統合インターフェース（Domain Logic 内部）

```typescript
/**
 * 互換性チェッカー統合インターフェース
 *
 * SkillRegistryService と SkillDistributionService の両方が依存する。
 * P61 準拠: IPC ハンドラ登録関数の引数型はこのインターフェース（具象クラスではない）。
 *
 * 配置: `apps/desktop/src/main/domain/compatibility-checker.ts`
 * 具象クラス: `DefaultCompatibilityChecker`
 */
interface CompatibilityChecker {
  /**
   * スキーマの互換性レベルとバンプ提案を返す
   *
   * @param oldVersion - 旧バージョン文字列（semver 形式、例: "1.2.3"）
   * @param newVersion - 新バージョン文字列（semver 形式、例: "2.0.0"）
   * @param diff       - checkInputSchema + checkOutputSchema の統合差分
   * @returns 互換性チェック結果
   *
   * 事後条件:
   * - diff.removed.length > 0 または diff.modified に type-changed/required-added が含まれる
   *   → result.level === "breaking" かつ result.suggestedBump === "major"
   * - diff.added.length > 0 のみで diff.removed.length === 0 かつ breaking なし
   *   → result.level === "minor-incompatible" かつ result.suggestedBump === "minor"
   * - diff が空（added/removed/modified が全て空）
   *   → result.level === "compatible" かつ result.suggestedBump === "patch"
   */
  checkVersion(
    oldVersion: string,
    newVersion: string,
    diff: SchemaDiff,
  ): CompatibilityCheckResult;

  /**
   * 依存スキルのバージョン制約を解決する
   *
   * @param dependencies - 解決対象の依存制約一覧
   * @returns 依存解決結果
   */
  checkDependencies(
    dependencies: DependencyConstraint[],
  ): DependencyResolutionResult;

  /**
   * SchemaDiff から推奨バンプ種別を決定する
   *
   * @param changes - checkInputSchema + checkOutputSchema の統合差分
   * @returns "major"（breaking あり）| "minor"（warning のみ）| "patch"（変更なし）
   */
  suggestVersionBump(changes: SchemaDiff): "major" | "minor" | "patch";
}
```

---

## 3. Semver 比較ロジック

### 3.1 判定条件テーブル

スキルの `version` フィールドは `MAJOR.MINOR.PATCH` 形式（例: `1.2.3`）の semver 準拠文字列とする。

#### major 判定条件（breaking change）

以下のいずれか1件以上が検出された場合、`suggestedBump = "major"` かつ `level = "breaking"` を返す。

| 条件ID | 判定式                                                                         | 例                                                           | BreakingChange.type |
| ------ | ------------------------------------------------------------------------------ | ------------------------------------------------------------ | ------------------- |
| M-1    | `inputSchema.properties` の既存フィールドが `after` に存在しない               | `{ query: string }` → `{ keyword: string }` (query が消えた) | `"removed"`         |
| M-2    | `inputSchema.properties[f].type` が変更された（`before.type !== after.type`）  | `query: string` → `query: number`                            | `"type-changed"`    |
| M-3    | `inputSchema.required` に既存の任意フィールドが追加された（必須化）            | `options?: string` → `options: string`（必須化）             | `"required-added"`  |
| M-4    | `outputSchema.properties` の既存フィールドが `after` に存在しない              | `{ result, metadata }` → `{ result }` (metadata が消えた)    | `"removed"`         |
| M-5    | `outputSchema.properties[f].type` が変更された（`before.type !== after.type`） | `score: number` → `score: string`                            | `"type-changed"`    |

#### minor 判定条件（後方互換の機能追加）

major 条件に該当しない場合で、以下のいずれか1件以上が検出された場合、`suggestedBump = "minor"` かつ `level = "minor-incompatible"` を返す。

| 条件ID | 判定式                                                                         | 例                                              | CompatibilityWarning.type |
| ------ | ------------------------------------------------------------------------------ | ----------------------------------------------- | ------------------------- |
| m-1    | `inputSchema.properties` に新しいフィールドが追加され、`required` に含まれない | `{ query }` → `{ query, limit?: number }`       | `"optional-added"`        |
| m-2    | `outputSchema.properties` に新しいフィールドが追加された                       | `{ result }` → `{ result, confidence: number }` | `"optional-added"`        |
| m-3    | `inputSchema.required` から既存フィールドが削除された（必須 → 任意に緩和）     | `query: string` → `query?: string`（任意化）    | `"optional-added"`        |

#### patch 判定条件（バグ修正）

major 条件にも minor 条件にも該当しない場合、`suggestedBump = "patch"` かつ `level = "compatible"` を返す。

| 条件ID | 判定式                                                                      |
| ------ | --------------------------------------------------------------------------- |
| p-1    | `inputSchema` と `outputSchema` が同一（全フィールドの型・required が一致） |
| p-2    | `description`/`tags` 等スキーマ以外のフィールドのみ変更                     |

### 3.2 判定フロー図

```
[旧スキーマ / 新スキーマ 入力]
       │
       ▼
┌──────────────────────────────────────────────────────────────┐
│ Step 1: checkInputSchema(old, new) → inputDiff               │
│ Step 2: checkOutputSchema(old, new) → outputDiff             │
│ Step 3: 統合 diff = merge(inputDiff, outputDiff)             │
└──────────────────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│ M-1〜M-5 のいずれかが検出されたか？                      │
│ （diff.removed.length > 0 OR                            │
│   diff.modified に type-changed/required-added が含まれる）│
└─────────────────────────────────────────────────────────┘
       │ YES                              │ NO
       ▼                                  ▼
  level = "breaking"             ┌────────────────────────────────┐
  suggestedBump = "major"        │ m-1〜m-3 のいずれかが検出されたか？ │
  breakingChanges: [...]         │ (diff.added.length > 0 OR      │
  warnings: []                   │  diff.modified に "optional-   │
  [RETURN]                       │  added" が含まれる)             │
                                 └────────────────────────────────┘
                                        │ YES              │ NO
                                        ▼                  ▼
                                 level =            level = "compatible"
                                 "minor-            suggestedBump = "patch"
                                  incompatible"     breakingChanges: []
                                 suggestedBump      warnings: []
                                 = "minor"          [RETURN]
                                 breakingChanges:
                                 []
                                 warnings: [...]
                                 [RETURN]
```

### 3.3 判定擬似コード

```
function suggestVersionBump(diff: SchemaDiff): "major" | "minor" | "patch":
  breakingChanges = detectBreakingChanges(diff)   // SchemaCompatibilityChecker 委譲
  if breakingChanges.length > 0:
    return "major"
  if diff.added.length > 0 OR hasOptionalRelaxed(diff.modified):
    return "minor"
  return "patch"

function hasOptionalRelaxed(modified: SchemaFieldChange[]): boolean:
  return modified.some(c => c.wasRequired === true AND c.isRequired === false)
```

---

## 4. Schema 互換性チェック設計

### 4.1 入力スキーマ diff 検出（checkInputSchema）

対象フィールド: `SkillConfig.inputSchema`（JSON Schema 形式 `{ properties, required }` のサブセット）

**Step 1: フィールド列挙**

```
oldFields = Object.keys(oldSchema.inputSchema.properties ?? {})
newFields = Object.keys(newSchema.inputSchema.properties ?? {})
allFields = union(oldFields, newFields)
```

**Step 2: 差分分類**

```
added   = []
removed = []
modified = []

for each field in allFields:
  inOld = oldFields.includes(field)
  inNew = newFields.includes(field)

  if NOT inOld AND inNew:
    // 追加フィールド
    newIsReq = isRequired(field, newSchema.inputSchema)
    added.push({ name: field, type: newSchema.inputSchema.properties[field].type, isRequired: newIsReq })

  else if inOld AND NOT inNew:
    // 削除フィールド
    oldIsReq = isRequired(field, oldSchema.inputSchema)
    removed.push({ name: field, type: oldSchema.inputSchema.properties[field].type, isRequired: oldIsReq })

  else:  // inOld AND inNew
    oldType    = oldSchema.inputSchema.properties[field].type
    newType    = newSchema.inputSchema.properties[field].type
    wasReq     = isRequired(field, oldSchema.inputSchema)
    isReq      = isRequired(field, newSchema.inputSchema)
    if oldType != newType OR wasReq != isReq:
      modified.push({ name: field, oldType, newType, wasRequired: wasReq, isRequired: isReq })

return SchemaDiff { added, removed, modified }
```

**ヘルパー関数**:

```
function isRequired(fieldName: string, schema: SkillSchema): boolean:
  return Array.isArray(schema.required) AND schema.required.includes(fieldName)
```

### 4.2 出力スキーマ diff 検出（checkOutputSchema）

対象フィールド: `SkillConfig.outputSchema`

入力スキーマと同一アルゴリズムを適用するが、**required 概念を適用しない**（出力フィールドは全て任意として扱う）。

```
// 出力スキーマでは isRequired を常に false として扱う
wasRequired = false
isRequired  = false
```

これにより出力スキーマでは `required-added` 型の BreakingChange は発生しない。

### 4.3 Breaking Change 自動判定（detectBreakingChanges）

`SchemaDiff` から `BreakingChange[]` を抽出するアルゴリズム。

```
function detectBreakingChanges(diff: SchemaDiff): BreakingChange[]:
  result = []

  // 削除フィールド → 全て breaking
  for each field in diff.removed:
    result.push({
      field: field.name,
      type: "removed",
      description: "フィールド '{field.name}' が削除されました",
      severity: "error"
    })

  // 変更フィールド → 型変更または必須化の場合のみ breaking
  for each change in diff.modified:
    if change.oldType != change.newType:
      result.push({
        field: change.name,
        type: "type-changed",
        description: "フィールド '{change.name}' の型が {change.oldType} から {change.newType} に変更されました",
        severity: "error"
      })
    else if NOT change.wasRequired AND change.isRequired:
      result.push({
        field: change.name,
        type: "required-added",
        description: "フィールド '{change.name}' が任意から必須に変更されました",
        severity: "error"
      })

  return result
```

Warning 抽出（BreakingChange ではないが記録する変更）:

```
function extractWarnings(diff: SchemaDiff): CompatibilityWarning[]:
  result = []

  // 追加フィールド（任意） → warning
  for each field in diff.added:
    result.push({
      field: field.name,
      type: "optional-added",
      description: "任意フィールド '{field.name}' が追加されました（minor 変更）",
      severity: "warning"
    })

  // 必須 → 任意 の緩和 → warning
  for each change in diff.modified:
    if change.wasRequired AND NOT change.isRequired:
      result.push({
        field: change.name,
        type: "optional-added",
        description: "フィールド '{change.name}' が必須から任意に緩和されました",
        severity: "warning"
      })

  return result
```

### 4.4 CompatibilityCheckResult 構築擬似コード

```
function computeCompatibilityCheckResult(
  oldSchema: SkillSchema,
  newSchema: SkillSchema,
  checker: SchemaCompatibilityChecker
): CompatibilityCheckResult:

  inputDiff  = checker.checkInputSchema(oldSchema, newSchema)
  outputDiff = checker.checkOutputSchema(oldSchema, newSchema)

  // 差分を統合（prefix で input/output を区別）
  mergedDiff = SchemaDiff {
    added:    [...inputDiff.added,    ...outputDiff.added],
    removed:  [...inputDiff.removed,  ...outputDiff.removed],
    modified: [...inputDiff.modified, ...outputDiff.modified],
  }

  breakingChanges = checker.detectBreakingChanges(mergedDiff)
  warnings        = extractWarnings(mergedDiff)

  if breakingChanges.length > 0:
    return { level: "breaking", breakingChanges, warnings, suggestedBump: "major" }

  if warnings.length > 0:
    return { level: "minor-incompatible", breakingChanges: [], warnings, suggestedBump: "minor" }

  return { level: "compatible", breakingChanges: [], warnings: [], suggestedBump: "patch" }
```

---

## 5. 依存解決アルゴリズム

### 5.1 semver range 記法サポート仕様

サポートする range 記法は以下の3種類に限定する（npm semver パッケージ仕様に準拠）。

| 記法             | 意味                                      | 許容範囲（base: 1.2.3）       |
| ---------------- | ----------------------------------------- | ----------------------------- |
| `^1.0.0`         | minor・patch 更新を許容（major は固定）   | `>= 1.0.0 < 2.0.0`            |
| `~1.2.0`         | patch 更新のみ許容（minor・major は固定） | `>= 1.2.0 < 1.3.0`            |
| `>=1.0.0 <2.0.0` | 明示的な範囲指定                          | `1.0.0` 以上かつ `2.0.0` 未満 |

### 5.2 依存解決アルゴリズム（resolve）

import 時および公開時に自動実行する。

```
function resolve(dependencies: DependencyConstraint[]): DependencyResolutionResult:

  // Step 1: 同一 skillId ごとにグループ化
  grouped = groupBy(dependencies, (d) => d.skillId)
  // grouped: { [skillId]: DependencyConstraint[] }

  // Step 2: conflict 検出
  conflicts = []
  for each [skillId, constraints] in grouped:
    if constraints.length > 1:
      // 複数の range が同一 skillId に対して存在 → 積集合を計算
      intersection = computeIntersection(constraints.map(c => c.versionRange))
      if intersection === null:  // 満足可能なバージョンが存在しない
        conflicts.push({
          skillId,
          constraints,
          message: "スキル '{skillId}' に対する依存制約が競合しています: {constraints.map(c=>c.versionRange).join(' vs ')}"
        })

  if conflicts.length > 0:
    return { resolved: false, conflicts }

  // Step 3: 解決済みバージョンの決定
  // 各 skillId について、制約を全て満たす最小バージョンを選択する
  versions = new Map<string, string>()
  for each [skillId, constraints] in grouped:
    // constraints は conflict がないことが保証されている
    resolvedVersion = selectMinSatisfying(constraints.map(c => c.versionRange))
    versions.set(skillId, resolvedVersion)

  return { resolved: true, versions }
```

### 5.3 Conflict Detection ロジック

```
function computeIntersection(ranges: string[]): string | null:
  // 各 range を [minVersion, maxVersion) の区間に変換する
  intervals = ranges.map(parseRangeToInterval)
  // intervals: Array<{ min: semver, maxExclusive: semver }>

  // 区間の積集合を計算する
  intersectMin = max(intervals.map(i => i.min))
  intersectMax = min(intervals.map(i => i.maxExclusive))

  // 積集合が空 → conflict
  if intersectMin >= intersectMax:
    return null

  return "{intersectMin} <= v < {intersectMax}"
```

**具体例**:

| 依存元 | 依存先 skillId | versionRange | 区間             |
| ------ | -------------- | ------------ | ---------------- |
| A      | skill-X        | `^1.0.0`     | `[1.0.0, 2.0.0)` |
| B      | skill-X        | `^2.0.0`     | `[2.0.0, 3.0.0)` |

積集合: `max(1.0.0, 2.0.0)=2.0.0` から `min(2.0.0, 3.0.0)=2.0.0` → `2.0.0 <= v < 2.0.0` は空 → **conflict**

| 依存元 | 依存先 skillId | versionRange     | 区間             |
| ------ | -------------- | ---------------- | ---------------- |
| A      | skill-Y        | `^1.0.0`         | `[1.0.0, 2.0.0)` |
| B      | skill-Y        | `>=1.5.0 <2.0.0` | `[1.5.0, 2.0.0)` |

積集合: `max(1.0.0, 1.5.0)=1.5.0` から `min(2.0.0, 2.0.0)=2.0.0` → `[1.5.0, 2.0.0)` は非空 → **解決可能**（resolvedVersion: `1.5.0`）

---

## 6. DI 境界配置テーブル

### 6.1 型配置

| 型名                                           | 配置先                                    | 配置理由                                                                                         |
| ---------------------------------------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `CompatibilityLevel`                           | `packages/shared`                         | Registry/Distribution 両サービスが参照。Renderer への IPC レスポンスにも含まれる                 |
| `CompatibilityCheckResult`                     | `packages/shared`                         | Registry/Distribution 両サービスが戻り値として使用。IPC レスポンスの `data` フィールドに含まれる |
| `BreakingChange`                               | `packages/shared`                         | `CompatibilityCheckResult.breakingChanges` の要素型。外部参照（Renderer 表示）あり               |
| `CompatibilityWarning`                         | `packages/shared`                         | `CompatibilityCheckResult.warnings` の要素型。外部参照（Renderer 表示）あり                      |
| `SchemaCompatibilityChecker`                   | Port 同階層（Domain Logic 内部）          | Main プロセス内のみ使用。`SkillRegistryService` から参照                                         |
| `DependencyResolver`                           | Port 同階層（Domain Logic 内部）          | Main プロセス内のみ使用。`SkillDistributionService` から参照                                     |
| `SchemaDiff`                                   | `SchemaCompatibilityChecker` と同ファイル | Checker 内部型。外部公開不要                                                                     |
| `SchemaField`                                  | `SchemaCompatibilityChecker` と同ファイル | `SchemaDiff` の要素型。同上                                                                      |
| `SchemaFieldChange`                            | `SchemaCompatibilityChecker` と同ファイル | `SchemaDiff` の要素型。同上                                                                      |
| `DependencyConstraint`                         | Port 同階層（Domain Logic 内部）          | `DependencyResolver` の引数型。IPC 経由で Renderer から受け取る場合は validation 後に使用        |
| `DependencyConflict`                           | Port 同階層（Domain Logic 内部）          | `DependencyResolutionResult` の内部型。IPC レスポンスに変換して返す                              |
| `DependencyResolutionResult`                   | Port 同階層（Domain Logic 内部）          | `DependencyResolver` の戻り値型                                                                  |
| `CompatibilityChecker`（統合インターフェース） | Port 同階層（Domain Logic 内部）          | IPC ハンドラ登録関数の引数型。P61 準拠で具象クラスではなくインターフェースを使用                 |

### 6.2 実装クラス配置（Phase 5 以降）

| インターフェース             | 具象クラス名                        | 配置パス（想定）                                                       |
| ---------------------------- | ----------------------------------- | ---------------------------------------------------------------------- |
| `SchemaCompatibilityChecker` | `DefaultSchemaCompatibilityChecker` | `apps/desktop/src/main/domain/default-schema-compatibility-checker.ts` |
| `DependencyResolver`         | `DefaultDependencyResolver`         | `apps/desktop/src/main/domain/default-dependency-resolver.ts`          |
| `CompatibilityChecker`       | `DefaultCompatibilityChecker`       | `apps/desktop/src/main/domain/default-compatibility-checker.ts`        |

### 6.3 IPC ハンドラ設計（P61 準拠）

```typescript
// P61 準拠: 引数型はインターフェース（具象クラスではない）
function registerSkillCompatibilityHandlers(
  compatibilityChecker: CompatibilityChecker, // NOT DefaultCompatibilityChecker
): void {
  ipcMain.handle(
    IPC_CHANNELS.SKILL_COMPATIBILITY_CHECK,
    async (event, args) => {
      // ... P42 準拠の3段バリデーション後に呼び出し
      const result = compatibilityChecker.checkVersion(
        args.oldVersion,
        args.newVersion,
        args.diff,
      );
      // P60 準拠: IPC レスポンスは wrapper 形式
      if (result.level === "breaking") {
        return {
          success: false,
          error: {
            code: "BREAKING_CHANGE_ERROR",
            message: `破壊的変更が ${result.breakingChanges.length} 件検出されました。major バージョンを増加してください`,
          },
        };
      }
      return { success: true, data: result };
    },
  );
}
```

---

## 7. Phase 1 参照トレーサビリティ

### 7.1 受入基準 AC-2 との対応

| AC-2 要件項目                                        | 本設計書での対応箇所                                               | 充足状況 |
| ---------------------------------------------------- | ------------------------------------------------------------------ | -------- |
| semver の major/minor/patch 定義                     | セクション 3.1「判定条件テーブル」M-1〜M-5 / m-1〜m-3 / p-1〜p-2   | 充足     |
| breaking change 判定条件（`inputSchema` の変更内容） | セクション 3.1 M-1〜M-3 / セクション 4.3 detectBreakingChanges     | 充足     |
| 後方互換性の保持世代数（public: 2世代, team: 1世代） | Phase 1 `compatibility-requirements.md` 参照（本設計書スコープ外） | 参照済み |
| schema 互換性チェックの自動実行タイミング            | セクション 4「Schema 互換性チェック設計」冒頭記述                  | 充足     |
| 依存スキル間のバージョン制約                         | セクション 5「依存解決アルゴリズム」                               | 充足     |

### 7.2 Phase 1 Task 2（バージョン・互換性要件の定義）との対応

| Phase 1 Task 2 の実行手順                                     | 本設計書での型/ロジック                                      |
| ------------------------------------------------------------- | ------------------------------------------------------------ |
| 手順 2: semver の major/minor/patch 定義                      | セクション 3.1（M-1〜M-5, m-1〜m-3, p-1〜p-2）               |
| 手順 3: schema 互換性チェック仕様（自動実行・ブロック条件）   | セクション 4（SchemaCompatibilityChecker）                   |
| 手順 4: 依存スキル間のバージョン制約（minVersion/maxVersion） | セクション 5（DependencyConstraint.versionRange）            |
| 手順 5: 後方互換性の保証範囲（public: 2世代, team: 1世代）    | 本文書スコープ外（保持ポリシーは SkillRegistryService 責務） |

### 7.3 他の Phase 2 成果物との依存関係

| 依存先成果物                        | 参照理由                                                                |
| ----------------------------------- | ----------------------------------------------------------------------- |
| `publishing-metadata-design.md`     | `SkillSchema` の `inputSchema`/`outputSchema` フィールド定義を参照      |
| `publish-readiness-design.md`       | `CompatibilityCheckResult` を `PublishEligibility` 判定の入力として使用 |
| `skill-center-flow-design.md`       | 登録フロー Step 2 の互換性チェック自動実行トリガーを参照                |
| `distribution-operations-design.md` | import 時の依存解決アルゴリズム（`DependencyResolver.resolve`）を参照   |

### 7.4 既知の落とし穴対応（.claude/rules/06-known-pitfalls.md）

| Pitfall ID | 本設計書での対応                                                                                             |
| ---------- | ------------------------------------------------------------------------------------------------------------ |
| P60        | IPC レスポンスは `{ success, data/error }` wrapper 形式で統一（セクション 6.3）                              |
| P61        | `registerSkillCompatibilityHandlers` の引数型は `CompatibilityChecker`（インターフェース）（セクション 6.3） |
| P42        | IPC ハンドラの引数バリデーションに `.trim() === ""` チェックを含む3段バリデーションを明記（セクション 6.3）  |

---

## 付録: 型階層サマリー

```
packages/shared:
  CompatibilityLevel             ("compatible" | "minor-incompatible" | "breaking")
  CompatibilityCheckResult
  ├── level: CompatibilityLevel
  ├── breakingChanges: BreakingChange[]
  │   ├── field: string
  │   ├── type: "removed" | "type-changed" | "required-added"
  │   ├── description: string
  │   └── severity: "error"
  ├── warnings: CompatibilityWarning[]
  │   ├── field: string
  │   ├── type: "optional-added" | "deprecated" | "behavior-changed"
  │   ├── description: string
  │   └── severity: "warning"
  └── suggestedBump: "major" | "minor" | "patch"

Port 同階層（apps/desktop/src/main/domain/）:
  SchemaCompatibilityChecker（インターフェース）
  ├── checkInputSchema(old, new): SchemaDiff
  ├── checkOutputSchema(old, new): SchemaDiff
  └── detectBreakingChanges(diff): BreakingChange[]

  DependencyResolver（インターフェース）
  └── resolve(dependencies): DependencyResolutionResult
        = { resolved: true,  versions: Map<string, string> }
        | { resolved: false, conflicts: DependencyConflict[] }

  CompatibilityChecker（統合インターフェース）
  ├── checkVersion(oldVer, newVer, diff): CompatibilityCheckResult
  ├── checkDependencies(deps): DependencyResolutionResult
  └── suggestVersionBump(changes): "major" | "minor" | "patch"

SchemaCompatibilityChecker と同ファイル（内部型）:
  SchemaDiff
  ├── added:    SchemaField[]
  ├── removed:  SchemaField[]
  └── modified: SchemaFieldChange[]

  SchemaField
  ├── name: string
  ├── type: string
  └── isRequired: boolean

  SchemaFieldChange
  ├── name: string
  ├── oldType: string
  ├── newType: string
  ├── wasRequired: boolean
  └── isRequired: boolean

DependencyResolver と同ファイル（内部型）:
  DependencyConstraint
  ├── skillId: string
  └── versionRange: string

  DependencyConflict
  ├── skillId: string
  ├── constraints: DependencyConstraint[]
  └── message: string
```
