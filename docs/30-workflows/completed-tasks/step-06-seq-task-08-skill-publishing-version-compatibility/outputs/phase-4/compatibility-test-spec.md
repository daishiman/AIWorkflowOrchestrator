# 互換性チェック テスト仕様書

## メタ情報

| 項目       | 内容                                                                      |
| ---------- | ------------------------------------------------------------------------- |
| 文書       | Phase 4 - タスク2 成果物                                                  |
| タスクID   | TASK-SKILL-LIFECYCLE-08                                                   |
| 作成日     | 2026-03-17                                                                |
| 設計参照   | `outputs/phase-2/compatibility-check-design.md`                           |
| 受入基準   | AC-2                                                                      |
| テスト対象 | semver 比較ロジック・Breaking Change 自動判定・依存バージョン制約チェック |

---

## 1. 概要

本テスト仕様書は `CompatibilityChecker`、`SchemaCompatibilityChecker`、`DependencyResolver` インターフェースの動作を検証するテストケースを定義する。

Phase 2 設計書 (`compatibility-check-design.md`) のセクション 3〜5 で定義された semver 判定ロジック・Schema diff 検出・依存解決アルゴリズムが仕様通りに動作することを保証する。

---

## 2. テストケース一覧テーブル

### 2.1 Semver 比較テスト（CompatibilityChecker.suggestVersionBump）

| ID       | テスト名                                           | 入力 (oldSchema → newSchema)                                                                                             | 期待出力                                                  | 検証条件                                                                 |
| -------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------- | ------------------------------------------------------------------------ |
| CMP-S-1  | major 判定: input 必須フィールドが削除された場合   | `{ properties: { a: "string", b: "string" }, required: ["a","b"] }` → `{ properties: { a: "string" }, required: ["a"] }` | `{ level: "breaking", suggestedBump: "major" }`           | M-1 条件: diff.removed.length > 0                                        |
| CMP-S-2  | major 判定: input フィールドの型が変更された場合   | `{ properties: { a: "string" } }` → `{ properties: { a: "number" } }`                                                    | `{ level: "breaking", suggestedBump: "major" }`           | M-2 条件: diff.modified に type-changed が含まれる                       |
| CMP-S-3  | major 判定: 任意フィールドが必須化された場合       | `{ properties: { a: "string", b: "string" }, required: ["a"] }` → 同 properties + `required: ["a","b"]`                  | `{ level: "breaking", suggestedBump: "major" }`           | M-3 条件: diff.modified に required-added が含まれる                     |
| CMP-S-4  | major 判定: output フィールドが削除された場合      | `outputSchema: { properties: { result: "string", metadata: "object" } }` → `{ properties: { result: "string" } }`        | `{ level: "breaking", suggestedBump: "major" }`           | M-4 条件: outputSchema diff.removed.length > 0                           |
| CMP-S-5  | major 判定: output フィールドの型が変更された場合  | `outputSchema: { properties: { score: "number" } }` → `{ properties: { score: "string" } }`                              | `{ level: "breaking", suggestedBump: "major" }`           | M-5 条件: outputSchema diff.modified に type-changed が含まれる          |
| CMP-S-6  | minor 判定: input に任意フィールドが追加された場合 | `{ properties: { a: "string" } }` → `{ properties: { a: "string", b: "number" } }`                                       | `{ level: "minor-incompatible", suggestedBump: "minor" }` | m-1 条件: diff.added に b が含まれ、required に含まれない                |
| CMP-S-7  | minor 判定: output に新フィールドが追加された場合  | `outputSchema: { properties: { result: "string" } }` → 同 + `{ confidence: "number" }`                                   | `{ level: "minor-incompatible", suggestedBump: "minor" }` | m-2 条件: outputSchema diff.added に confidence が含まれる               |
| CMP-S-8  | minor 判定: 必須フィールドが任意に緩和された場合   | `required: ["a","b"]` → `required: ["a"]`（bが任意化）                                                                   | `{ level: "minor-incompatible", suggestedBump: "minor" }` | m-3 条件: diff.modified に wasRequired=true, isRequired=false が含まれる |
| CMP-S-9  | patch 判定: スキーマ変更なし・説明のみ変更         | 同一スキーマ（description フィールドのみ変更）                                                                           | `{ level: "compatible", suggestedBump: "patch" }`         | p-1/p-2 条件: diff が空（added/removed/modified 全て空配列）             |
| CMP-S-10 | patch 判定: input/output スキーマが完全に同一      | 変更なし（全フィールドの型・required が一致）                                                                            | `{ level: "compatible", suggestedBump: "patch" }`         | p-1 条件: 全 diff が空                                                   |

### 2.2 CompatibilityCheckResult フィールド検証

| ID      | テスト名                                                         | 入力                                                                        | 期待する結果フィールド                                                    | 検証条件                                                          |
| ------- | ---------------------------------------------------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| CMP-R-1 | breaking 時に breakingChanges が1件以上含まれる                  | M-1 条件（フィールド削除）                                                  | `breakingChanges: [{ field: "b", type: "removed", severity: "error" }]`   | `breakingChanges.length >= 1` かつ `warnings.length === 0`        |
| CMP-R-2 | breaking 時に suggestedBump が "major" になる                    | M-2 条件（型変更）                                                          | `suggestedBump: "major"`                                                  | level と suggestedBump の対応が一意（breaking → major）           |
| CMP-R-3 | minor-incompatible 時に warnings が1件以上含まれる               | m-1 条件（任意フィールド追加）                                              | `warnings: [{ field: "b", type: "optional-added", severity: "warning" }]` | `breakingChanges.length === 0` かつ `warnings.length >= 1`        |
| CMP-R-4 | minor-incompatible 時に suggestedBump が "minor" になる          | m-1 条件                                                                    | `suggestedBump: "minor"`                                                  | level と suggestedBump の対応が一意（minor-incompatible → minor） |
| CMP-R-5 | compatible 時に breakingChanges と warnings が空配列になる       | p-1 条件（変更なし）                                                        | `breakingChanges: [], warnings: []`                                       | 両配列の長さが 0                                                  |
| CMP-R-6 | compatible 時に suggestedBump が "patch" になる                  | p-1 条件                                                                    | `suggestedBump: "patch"`                                                  | level と suggestedBump の対応が一意（compatible → patch）         |
| CMP-R-7 | BreakingChange に description が含まれる                         | M-1 条件（フィールド 'b' が削除）                                           | `breakingChanges[0].description` に "b" が含まれる文字列                  | description は人間可読な説明であること                            |
| CMP-R-8 | 出力スキーマでは required-added 型の BreakingChange が発生しない | outputSchema の required 追加（出力スキーマには required 概念を適用しない） | `breakingChanges` に type: "required-added" が含まれない                  | 出力スキーマ設計: required 常に false で扱う                      |

### 2.3 Schema 互換性チェック（SchemaCompatibilityChecker）

| ID       | テスト名                                                           | 入力                                                               | 期待出力                                                                     | 検証条件                              |
| -------- | ------------------------------------------------------------------ | ------------------------------------------------------------------ | ---------------------------------------------------------------------------- | ------------------------------------- |
| CMP-BC-1 | required フィールド削除で BreakingChange が検出される              | `before: { required: ["a"] }` → `after: {}` (required なし)        | `breakingChanges: [{ field: "a", type: "removed" }]`                         | M-1: 削除フィールドは全て breaking    |
| CMP-BC-2 | 型変更で BreakingChange が検出される                               | `before: a: "string"` → `after: a: "number"`                       | `breakingChanges: [{ field: "a", type: "type-changed", severity: "error" }]` | M-2: oldType !== newType              |
| CMP-BC-3 | 任意フィールド追加で BreakingChange が発生しない                   | `before: {}` → `after: { optional: "b" }`（required に含まれない） | `breakingChanges: []`, `warnings: [{ type: "optional-added" }]`              | m-1: 追加フィールドは breaking でない |
| CMP-BC-4 | 必須→任意への緩和で BreakingChange が発生しない（warnings に記録） | `before: required: ["a","b"]` → `after: required: ["a"]`           | `breakingChanges: []`, `warnings: [{ field: "b", type: "optional-added" }]`  | m-3: 必須→任意は warning のみ         |
| CMP-BC-5 | 複数の breaking change が同時に検出される                          | フィールド削除 + 型変更の複合                                      | `breakingChanges.length >= 2`                                                | 複数条件が重なっても全て検出される    |

### 2.4 依存バージョン制約テスト（DependencyResolver）

| ID      | テスト名                                                  | 入力                                                                                                        | 期待出力                                                                 | 検証条件                                        |
| ------- | --------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ | ----------------------------------------------- |
| CMP-D-1 | ^1.0.0 range に 1.2.3 が適合する                          | `constraints: [{ skillId: "A", versionRange: "^1.0.0" }]` + available: `1.2.3`                              | `{ resolved: true, versions: Map { "A" → "1.2.3" } }`                    | `^1.0.0` の範囲: >= 1.0.0 < 2.0.0               |
| CMP-D-2 | ^1.0.0 range に 2.0.0 が非適合                            | `constraints: [{ skillId: "A", versionRange: "^1.0.0" }]` + available: `2.0.0`                              | `{ resolved: false, conflicts: [...] }`                                  | 2.0.0 は ^1.0.0 の範囲外（>= 2.0.0 は上限超過） |
| CMP-D-3 | ~1.0.0 range に 1.0.5 が適合する                          | `constraints: [{ skillId: "B", versionRange: "~1.0.0" }]` + available: `1.0.5`                              | `{ resolved: true, versions: Map { "B" → "1.0.5" } }`                    | `~1.0.0` の範囲: >= 1.0.0 < 1.1.0               |
| CMP-D-4 | ~1.0.0 range に 1.1.0 が非適合                            | `constraints: [{ skillId: "B", versionRange: "~1.0.0" }]` + available: `1.1.0`                              | `{ resolved: false, conflicts: [...] }`                                  | 1.1.0 は ~1.0.0 の範囲外（>= 1.1.0 は上限超過） |
| CMP-D-5 | 同一スキルへの ^1.0.0 と ^2.0.0 の競合が検出される        | `constraints: [{ skillId: "X", versionRange: "^1.0.0" }, { skillId: "X", versionRange: "^2.0.0" }]`         | `{ resolved: false, conflicts: [{ skillId: "X", constraints: [...] }] }` | 積集合が空 → conflict                           |
| CMP-D-6 | ^1.0.0 と >=1.5.0 <2.0.0 の互換性が解決される             | `constraints: [{ skillId: "Y", versionRange: "^1.0.0" }, { skillId: "Y", versionRange: ">=1.5.0 <2.0.0" }]` | `{ resolved: true, versions: Map { "Y" → "1.5.0" } }`                    | 積集合 [1.5.0, 2.0.0) は非空 → 解決可能         |
| CMP-D-7 | 依存がない場合（空配列）は resolved: true を返す          | `constraints: []`                                                                                           | `{ resolved: true, versions: Map {} }`                                   | 空の依存リストは常に解決成功                    |
| CMP-D-8 | 単一依存は常に解決される（conflict 不発生）               | `constraints: [{ skillId: "Z", versionRange: "^1.0.0" }]` + available: `1.0.0`                              | `{ resolved: true, versions: Map { "Z" → "1.0.0" } }`                    | 単一制約は conflict が発生しない                |
| CMP-D-9 | conflict の message に skillId と versionRange が含まれる | CMP-D-5 と同入力                                                                                            | `conflicts[0].message` に "X", "^1.0.0", "^2.0.0" が含まれる             | 人間可読なエラーメッセージが生成される          |

---

## 3. モックデータ定義

### 3.1 スキーマモック

```typescript
// 基本スキーマ（変更前）
const baseInputSchema = {
  properties: {
    a: { type: "string" },
    b: { type: "string" },
  },
  required: ["a", "b"],
};

// フィールド削除スキーマ（M-1 条件: breaking）
const fieldRemovedSchema = {
  properties: {
    a: { type: "string" },
  },
  required: ["a"],
};

// 型変更スキーマ（M-2 条件: breaking）
const typeChangedSchema = {
  properties: {
    a: { type: "number" }, // string → number に変更
    b: { type: "string" },
  },
  required: ["a", "b"],
};

// 必須化スキーマ（M-3 条件: breaking）
const requiredAddedSchema = {
  properties: {
    a: { type: "string" },
    b: { type: "string" },
  },
  required: ["a", "b"], // b が required に追加
};

// 任意フィールド追加スキーマ（m-1 条件: minor）
const optionalFieldAddedSchema = {
  properties: {
    a: { type: "string" },
    b: { type: "string" },
    c: { type: "number" }, // 新規追加・required に含まれない
  },
  required: ["a", "b"],
};

// 必須→任意への緩和スキーマ（m-3 条件: minor）
const requiredRelaxedSchema = {
  properties: {
    a: { type: "string" },
    b: { type: "string" },
  },
  required: ["a"], // b が required から削除（任意化）
};

// 変更なしスキーマ（p-1 条件: patch）
const unchangedSchema = {
  properties: {
    a: { type: "string" },
    b: { type: "string" },
  },
  required: ["a", "b"],
};
```

### 3.2 依存制約モック

```typescript
// 競合する依存制約
const conflictingDependencies = [
  { skillId: "skill-x", versionRange: "^1.0.0" },
  { skillId: "skill-x", versionRange: "^2.0.0" },
];

// 互換性のある依存制約
const compatibleDependencies = [
  { skillId: "skill-y", versionRange: "^1.0.0" },
  { skillId: "skill-y", versionRange: ">=1.5.0 <2.0.0" },
];

// 空の依存リスト
const emptyDependencies: DependencyConstraint[] = [];

// 単一依存
const singleDependency = [{ skillId: "skill-z", versionRange: "^1.0.0" }];
```

### 3.3 CompatibilityCheckResult モック（テスト期待値用）

```typescript
// breaking 結果モック
const breakingResult = {
  level: "breaking" as const,
  breakingChanges: [
    {
      field: "b",
      type: "removed" as const,
      description: "フィールド 'b' が削除されました",
      severity: "error" as const,
    },
  ],
  warnings: [],
  suggestedBump: "major" as const,
};

// minor-incompatible 結果モック
const minorIncompatibleResult = {
  level: "minor-incompatible" as const,
  breakingChanges: [],
  warnings: [
    {
      field: "c",
      type: "optional-added" as const,
      description: "任意フィールド 'c' が追加されました（minor 変更）",
      severity: "warning" as const,
    },
  ],
  suggestedBump: "minor" as const,
};

// compatible 結果モック
const compatibleResult = {
  level: "compatible" as const,
  breakingChanges: [],
  warnings: [],
  suggestedBump: "patch" as const,
};
```

---

## 4. 正常系テスト詳細

### 4.1 Semver 判定 - 正常系

**テスト ID: CMP-S-9, CMP-S-10（patch）, CMP-S-6, CMP-S-7（minor）**

```
前提条件:
  - SchemaCompatibilityChecker モックをインジェクション
  - 各テスト前に beforeEach でモックをリセット（P9 対策）

実行手順 (patch 判定: CMP-S-9, CMP-S-10):
  1. checker.checkInputSchema(unchangedSchema, unchangedSchema) を呼び出す
  2. checker.checkOutputSchema(unchangedSchema, unchangedSchema) を呼び出す
  3. checker.suggestVersionBump(emptyDiff) を呼び出す

期待結果:
  - diff.added, diff.removed, diff.modified が全て空配列
  - suggestVersionBump が "patch" を返す
  - CompatibilityCheckResult: { level: "compatible", suggestedBump: "patch", breakingChanges: [], warnings: [] }

実行手順 (minor 判定: CMP-S-6):
  1. checker.checkInputSchema(baseInputSchema, optionalFieldAddedSchema) を呼び出す
  2. diff.added に新フィールドが含まれることを確認する
  3. checker.suggestVersionBump(diff) を呼び出す

期待結果:
  - diff.added.length === 1（c フィールド）
  - suggestVersionBump が "minor" を返す
```

### 4.2 依存解決 - 正常系

**テスト ID: CMP-D-1, CMP-D-3, CMP-D-6, CMP-D-7, CMP-D-8**

```
前提条件:
  - DependencyResolver モックをインジェクション
  - 各テスト前に beforeEach でモックをリセット（P9 対策）

実行手順 (CMP-D-1: ^1.0.0 に 1.2.3 が適合):
  1. resolver.resolve([{ skillId: "A", versionRange: "^1.0.0" }]) を呼び出す（available: 1.2.3 と仮定）
  2. 戻り値が { resolved: true, versions: Map } であることを確認する
  3. versions.get("A") が "1.2.3" であることを確認する

実行手順 (CMP-D-6: 互換性のある複数制約):
  1. resolver.resolve(compatibleDependencies) を呼び出す
  2. 戻り値が { resolved: true, versions } であることを確認する
  3. versions.get("skill-y") が "1.5.0" であることを確認する
```

---

## 5. 異常系テスト詳細

### 5.1 Semver 判定 - breaking change 検出

**テスト ID: CMP-S-1 〜 CMP-S-5, CMP-BC-1 〜 CMP-BC-2**

```
前提条件:
  - SchemaCompatibilityChecker モックをインジェクション
  - 各テスト前に beforeEach でモックをリセット（P9 対策）

実行手順 (CMP-S-1: フィールド削除):
  1. checker.checkInputSchema(baseInputSchema, fieldRemovedSchema) を呼び出す
  2. diff.removed.length >= 1 であることを確認する
  3. checker.detectBreakingChanges(diff) を呼び出す
  4. breakingChanges[0].type === "removed" であることを確認する
  5. compatibilityChecker.checkVersion("1.0.0", "2.0.0", diff) を呼び出す

期待結果 (P60 準拠アサーション形式):
  result.level === "breaking"
  result.suggestedBump === "major"
  result.breakingChanges.length >= 1
  result.breakingChanges[0].field === "b"
  result.breakingChanges[0].type === "removed"
  result.breakingChanges[0].severity === "error"

後処理:
  - beforeEach で SchemaCompatibilityChecker モックをリセット
  - テスト間の状態共有なし（P9 対策）
```

### 5.2 依存解決 - conflict 検出

**テスト ID: CMP-D-2, CMP-D-4, CMP-D-5, CMP-D-9**

```
前提条件:
  - DependencyResolver モックをインジェクション
  - 各テスト前に beforeEach でモックをリセット（P9 対策）

実行手順 (CMP-D-5: ^1.0.0 と ^2.0.0 の競合):
  1. resolver.resolve(conflictingDependencies) を呼び出す
  2. 戻り値が { resolved: false, conflicts } であることを確認する
  3. conflicts[0].skillId === "skill-x" であることを確認する
  4. conflicts[0].constraints.length === 2 であることを確認する
  5. conflicts[0].message に "skill-x", "^1.0.0", "^2.0.0" が含まれることを確認する

期待結果:
  result.resolved === false
  result.conflicts.length >= 1
  result.conflicts[0].skillId === "skill-x"
  result.conflicts[0].message は人間可読なテキスト

後処理:
  - beforeEach で DependencyResolver モックをリセット
  - テスト間の状態共有なし（P9 対策）
```

### 5.3 CompatibilityCheckResult 不変条件検証

**テスト ID: CMP-R-1 〜 CMP-R-8**

```
前提条件:
  - computeCompatibilityCheckResult 関数が存在する

不変条件検証:
  - level === "breaking" → breakingChanges.length >= 1 (CMP-R-1)
  - level === "minor-incompatible" → breakingChanges.length === 0 かつ warnings.length >= 1 (CMP-R-3)
  - level === "compatible" → breakingChanges.length === 0 かつ warnings.length === 0 (CMP-R-5)
  - suggestedBump は level から一意に決定される (CMP-R-2, R-4, R-6)
  - 出力スキーマで required-added は発生しない (CMP-R-8)

境界条件:
  - 複数の breaking change が同時に存在する場合 (CMP-BC-5)
    → breakingChanges.length >= 2
    → level === "breaking"（複数 breaking の場合も "breaking" は1つ）
    → suggestedBump === "major"
```

---

## 6. Phase 2 設計書との対応（トレーサビリティ）

| テスト ID      | Phase 2 設計書参照箇所                                                        | 検証する設計要件                                                   |
| -------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| CMP-S-1〜S-5   | `compatibility-check-design.md` §3.1 major 判定条件（M-1〜M-5）               | major バンプが必要な変更の自動検出                                 |
| CMP-S-6〜S-8   | `compatibility-check-design.md` §3.1 minor 判定条件（m-1〜m-3）               | minor バンプで済む後方互換の変更の検出                             |
| CMP-S-9〜S-10  | `compatibility-check-design.md` §3.1 patch 判定条件（p-1〜p-2）               | 変更なし・patch バンプの判定                                       |
| CMP-R-1〜R-8   | `compatibility-check-design.md` §2.1 CompatibilityCheckResult 不変条件        | level・suggestedBump・配列の対応関係の保証                         |
| CMP-BC-1〜BC-5 | `compatibility-check-design.md` §4.3 detectBreakingChanges アルゴリズム       | BreakingChange の種類（removed/type-changed/required-added）の判定 |
| CMP-D-1〜D-4   | `compatibility-check-design.md` §5.1 semver range 記法サポート仕様            | ^/~ 記法による range チェック                                      |
| CMP-D-5〜D-9   | `compatibility-check-design.md` §5.2〜5.3 依存解決アルゴリズム・conflict 検出 | 同一 skillId への競合する range の conflict 検出                   |

---

## 7. 完了条件チェックリスト

- [ ] semver major 判定（M-1〜M-5）の全テストケースが定義されている（CMP-S-1〜S-5）
- [ ] semver minor 判定（m-1〜m-3）の全テストケースが定義されている（CMP-S-6〜S-8）
- [ ] semver patch 判定（p-1〜p-2）のテストケースが定義されている（CMP-S-9〜S-10）
- [ ] CompatibilityCheckResult 不変条件テストが定義されている（CMP-R-1〜R-8）
- [ ] BreakingChange 検出テストが定義されている（CMP-BC-1〜BC-5）
- [ ] 依存 range テスト（^/~）が定義されている（CMP-D-1〜D-4）
- [ ] 依存 conflict 検出テストが定義されている（CMP-D-5〜D-9）
- [ ] 出力スキーマで required-added が発生しないことが検証されている（CMP-R-8）
- [ ] テスト間の状態共有なし（P9 対策 → beforeEach でモックをリセット）
