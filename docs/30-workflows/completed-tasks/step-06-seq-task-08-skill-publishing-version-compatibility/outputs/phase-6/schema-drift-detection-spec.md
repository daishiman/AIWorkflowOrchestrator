# Schema Drift 検出テスト仕様書

## メタ情報

| 項目        | 内容                                                           |
| ----------- | -------------------------------------------------------------- |
| 文書        | Phase 6 - テスト拡充 成果物 2/5                                |
| タスクID    | TASK-SKILL-LIFECYCLE-08                                        |
| 作成日      | 2026-03-17                                                     |
| 設計参照    | `outputs/phase-2/compatibility-check-design.md`                |
| Phase 4参照 | `outputs/phase-4/compatibility-test-spec.md`                   |
| 受入基準    | AC-2（互換性チェック）                                         |
| テスト対象  | Schema drift の段階的蓄積・metadata 破損フォールバック・冪等性 |

---

## 1. 目的

Phase 4 の互換性テスト仕様は、2 時点間（oldSchema → newSchema）の単一 diff を検証している。

本仕様書は Phase 4 でカバーされていない以下のシナリオを追加する。

- **段階的 Schema drift**: 3 バージョン以上にわたるスキーマ変更の累積判定
- **breakingChanges の累積確認**: 中間バージョンの互換変更が最終的に breaking に帰結するケース
- **metadata 破損フォールバック**: semver 非準拠文字列、tags 非配列入力時のバリデーションエラーとフェイルセキュア動作
- **冪等性**: 同一入力での複数回呼び出しが同一結果を返すことの保証

---

## 2. テストケース一覧テーブル

| ID     | テスト名                                                        | 入力                                                                                                          | 期待結果                                                                                          | 対応AC |
| ------ | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | ------ |
| SDD-01 | 段階的drift: v1.0.0→v1.1.0（互換）→v1.2.0（非互換）でbreaking   | v1.0.0: {a:string, b:number}、v1.1.0: {a:string, b:number, c:boolean}、v1.2.0: {a:string, c:boolean}（b削除） | v1.0.0→v1.2.0 の最終比較で `level: "breaking"`                                                    | AC-2   |
| SDD-02 | breakingChanges は最新 diff のみ反映（中間 diff は含まない）    | SDD-01 と同一入力                                                                                             | breakingChanges に `{ field: "b", type: "removed" }` のみ含まれ、c の optional-added は含まれない | AC-2   |
| SDD-03 | version が非 semver 文字列 "latest" でバリデーションエラー      | `metadata.version = "latest"`                                                                                 | `{ success: false, error: { code: "VALIDATION_ERROR" } }`                                         | AC-2   |
| SDD-04 | version が非 semver 文字列 "v1.0" でバリデーションエラー        | `metadata.version = "v1.0"`                                                                                   | `{ success: false, error: { code: "VALIDATION_ERROR" } }`                                         | AC-2   |
| SDD-05 | version が空文字列でバリデーションエラー（P42 2段目）           | `metadata.version = ""`                                                                                       | `{ success: false, error: { code: "VALIDATION_ERROR" } }`                                         | AC-2   |
| SDD-06 | tags が非配列（文字列）でバリデーションエラー                   | `metadata.tags = "tag1,tag2"` (string)                                                                        | `{ success: false, error: { code: "VALIDATION_ERROR" } }`                                         | AC-2   |
| SDD-07 | tags が非配列（number）でバリデーションエラー                   | `metadata.tags = 123` (number)                                                                                | `{ success: false, error: { code: "VALIDATION_ERROR" } }`                                         | AC-2   |
| SDD-08 | フェイルセキュア: schema 解析失敗時は breaking にフォールバック | oldSchema が不正な JSON 構造（`{ properties: null }`）                                                        | `{ level: "breaking", breakingChanges.length >= 1, suggestedBump: "major" }`                      | AC-2   |
| SDD-09 | フェイルセキュア: newSchema が undefined の場合 breaking        | `newSchema = undefined`                                                                                       | `{ level: "breaking", suggestedBump: "major" }`                                                   | AC-2   |
| SDD-10 | 冪等性: 同一入力で 2 回呼び出し→同一結果                        | 同一の oldSchema と newSchema で check() を 2 回呼び出す                                                      | 1 回目と 2 回目の戻り値が深い等価比較で一致する                                                   | AC-2   |
| SDD-11 | 冪等性: breaking 判定の安定性確認                               | M-1 条件（フィールド削除）で check() を 3 回呼び出す                                                          | 3 回全てで `level: "breaking"` かつ breakingChanges の内容が一致する                              | AC-2   |

---

## 3. テストケース詳細仕様

### SDD-01: 段階的 drift - v1.0.0→v1.1.0（互換）→v1.2.0（非互換）で breaking

**前提条件**:

- v1.0.0 schema: `{ properties: { a: "string", b: "number" }, required: ["a", "b"] }`
- v1.1.0 schema: `{ properties: { a: "string", b: "number", c: "boolean" }, required: ["a", "b"] }`（c を任意フィールドとして追加）
- v1.2.0 schema: `{ properties: { a: "string", c: "boolean" }, required: ["a"] }`（b を削除）

**実行手順**:

1. `CompatibilityChecker.check(schema_v1_0_0, schema_v1_1_0)` を呼び出す → 中間確認（互換）
2. `CompatibilityChecker.check(schema_v1_0_0, schema_v1_2_0)` を呼び出す → 最終判定

**期待される結果**:

- 手順 1 の結果: `level: "minor-incompatible"`（c の追加）
- 手順 2 の結果: `level: "breaking"`（b の削除）
- 手順 2 の `suggestedBump` が `"major"` である

**アサーション**:

```typescript
// 中間確認
const mid = checker.check(schema_v1_0_0, schema_v1_1_0);
expect(mid.level).toBe("minor-incompatible");

// 最終判定
const final = checker.check(schema_v1_0_0, schema_v1_2_0);
expect(final.level).toBe("breaking");
expect(final.suggestedBump).toBe("major");
```

---

### SDD-02: breakingChanges は最新 diff のみ反映

**前提条件**:

- SDD-01 と同一のスキーマセット

**実行手順**:

1. `CompatibilityChecker.check(schema_v1_0_0, schema_v1_2_0)` を呼び出す

**期待される結果**:

- `breakingChanges` に `{ field: "b", type: "removed" }` が含まれる
- `breakingChanges` に `{ field: "c", type: "optional-added" }` が含まれない（c は中間で追加されたが最終スキーマにも存在するため breaking ではない）
- `warnings` に c の追加が含まれる可能性がある（ただし breaking ではない）

**アサーション**:

```typescript
const result = checker.check(schema_v1_0_0, schema_v1_2_0);
expect(result.breakingChanges).toContainEqual(
  expect.objectContaining({ field: "b", type: "removed" }),
);
const breakingFields = result.breakingChanges.map((bc) => bc.field);
expect(breakingFields).not.toContain("c");
```

---

### SDD-03: version が非 semver 文字列 "latest" でバリデーションエラー

**前提条件**:

- `SkillPublishingMetadata` の version フィールドに `"latest"` を設定

**実行手順**:

1. メタデータバリデーション関数に `{ ...validMetadata, version: "latest" }` を渡す

**期待される結果**:

- `success` が `false` である
- `error.code` が `"VALIDATION_ERROR"` である（エラーコード範囲: 1000-1999）

**アサーション**:

```typescript
expect(result.success).toBe(false);
expect(result.error.code).toBe("VALIDATION_ERROR");
```

---

### SDD-04: version が非 semver 文字列 "v1.0" でバリデーションエラー

**前提条件**:

- version フィールドに `"v1.0"` を設定（"v" プレフィックス付き、パッチバージョン欠如）

**実行手順**:

1. メタデータバリデーション関数に `{ ...validMetadata, version: "v1.0" }` を渡す

**期待される結果**:

- `success` が `false` である
- `error.code` が `"VALIDATION_ERROR"` である

**アサーション**:

```typescript
expect(result.success).toBe(false);
expect(result.error.code).toBe("VALIDATION_ERROR");
```

---

### SDD-05: version が空文字列でバリデーションエラー（P42 2段目）

**前提条件**:

- version フィールドに `""` を設定

**実行手順**:

1. メタデータバリデーション関数に `{ ...validMetadata, version: "" }` を渡す

**期待される結果**:

- `success` が `false` である
- `error.code` が `"VALIDATION_ERROR"` である

**アサーション**:

```typescript
expect(result.success).toBe(false);
expect(result.error.code).toBe("VALIDATION_ERROR");
```

---

### SDD-06: tags が非配列（文字列）でバリデーションエラー

**前提条件**:

- tags フィールドに `"tag1,tag2"` (string) を設定

**実行手順**:

1. メタデータバリデーション関数に `{ ...validMetadata, tags: "tag1,tag2" as unknown as string[] }` を渡す

**期待される結果**:

- `success` が `false` である
- `error.code` が `"VALIDATION_ERROR"` である
- バリデーションは `Array.isArray(tags)` で実行時型検証する（P48 準拠）

**アサーション**:

```typescript
expect(result.success).toBe(false);
expect(result.error.code).toBe("VALIDATION_ERROR");
```

---

### SDD-07: tags が非配列（number）でバリデーションエラー

**前提条件**:

- tags フィールドに `123` (number) を設定

**実行手順**:

1. メタデータバリデーション関数に `{ ...validMetadata, tags: 123 as unknown as string[] }` を渡す

**期待される結果**:

- `success` が `false` である
- `error.code` が `"VALIDATION_ERROR"` である

**アサーション**:

```typescript
expect(result.success).toBe(false);
expect(result.error.code).toBe("VALIDATION_ERROR");
```

---

### SDD-08: フェイルセキュア - schema 解析失敗時は breaking にフォールバック

**前提条件**:

- oldSchema が不正な構造: `{ properties: null }`（properties が null）
- newSchema は有効な構造

**実行手順**:

1. `CompatibilityChecker.check(invalidOldSchema, validNewSchema)` を呼び出す

**期待される結果**:

- 例外をスローせず、結果を返す
- `level` が `"breaking"` である（フェイルセキュア原則: 障害時は安全側に倒す）
- `breakingChanges` が 1 件以上含まれる
- `suggestedBump` が `"major"` である

**アサーション**:

```typescript
expect(result.level).toBe("breaking");
expect(result.breakingChanges.length).toBeGreaterThanOrEqual(1);
expect(result.suggestedBump).toBe("major");
```

---

### SDD-09: フェイルセキュア - newSchema が undefined の場合 breaking

**前提条件**:

- oldSchema は有効な構造
- newSchema が `undefined`

**実行手順**:

1. `CompatibilityChecker.check(validOldSchema, undefined)` を呼び出す

**期待される結果**:

- 例外をスローせず、結果を返す
- `level` が `"breaking"` である（フェイルセキュア原則）
- `suggestedBump` が `"major"` である

**アサーション**:

```typescript
expect(result.level).toBe("breaking");
expect(result.suggestedBump).toBe("major");
```

---

### SDD-10: 冪等性 - 同一入力で 2 回呼び出し→同一結果

**前提条件**:

- oldSchema: `{ properties: { a: "string" }, required: ["a"] }`
- newSchema: `{ properties: { a: "string", b: "number" }, required: ["a"] }`（b を任意追加）

**実行手順**:

1. `CompatibilityChecker.check(oldSchema, newSchema)` を呼び出す → result1
2. `CompatibilityChecker.check(oldSchema, newSchema)` を呼び出す → result2

**期待される結果**:

- result1 と result2 が深い等価比較で一致する
- `level`、`breakingChanges`、`warnings`、`suggestedBump` の全フィールドが一致する

**アサーション**:

```typescript
expect(result1).toEqual(result2);
```

---

### SDD-11: 冪等性 - breaking 判定の安定性確認

**前提条件**:

- oldSchema: `{ properties: { a: "string", b: "number" }, required: ["a", "b"] }`
- newSchema: `{ properties: { a: "string" }, required: ["a"] }`（b を削除）

**実行手順**:

1. `CompatibilityChecker.check(oldSchema, newSchema)` を 3 回呼び出す → result1, result2, result3

**期待される結果**:

- 3 回全てで `level` が `"breaking"` である
- 3 回全ての `breakingChanges` が深い等価比較で一致する

**アサーション**:

```typescript
expect(result1.level).toBe("breaking");
expect(result2.level).toBe("breaking");
expect(result3.level).toBe("breaking");
expect(result1.breakingChanges).toEqual(result2.breakingChanges);
expect(result2.breakingChanges).toEqual(result3.breakingChanges);
```

---

## 4. Phase 4 との差分

| 観点                    | Phase 4 カバー範囲                                           | Phase 6 追加範囲                                                                |
| ----------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------- |
| Schema diff 範囲        | 2 時点間の単一 diff（CMP-S-1〜CMP-S-10, CMP-BC-1〜CMP-BC-5） | 3 バージョン以上の段階的 drift（SDD-01, SDD-02）                                |
| metadata バリデーション | semver 形式（PUB-L-8〜PUB-L-10）、tags 件数（PUB-T-8）       | 非 semver 文字列の具体パターン（SDD-03〜SDD-05）、tags 型検証（SDD-06〜SDD-07） |
| フェイルセキュア        | なし                                                         | schema 破損・undefined 入力時の breaking フォールバック（SDD-08, SDD-09）       |
| 冪等性                  | なし                                                         | 同一入力での複数回呼び出し安定性（SDD-10, SDD-11）                              |

---

## 5. Phase 7 カバレッジ確認への引き継ぎ

- SDD-01〜SDD-02: `CompatibilityChecker.check()` の段階的 diff 処理パス
- SDD-03〜SDD-07: メタデータバリデーション関数の非正常入力パス（semver 正規表現不一致分岐、`Array.isArray()` 分岐）
- SDD-08〜SDD-09: `CompatibilityChecker.check()` のフェイルセキュアフォールバックパス（try-catch 内部のデフォルト breaking 返却）
- SDD-10〜SDD-11: 副作用なし確認（状態変更がないことの間接検証）
- Phase 7 では SDD-08〜SDD-09 のフォールバックパスが Branch Coverage に反映されていることを重点確認する
