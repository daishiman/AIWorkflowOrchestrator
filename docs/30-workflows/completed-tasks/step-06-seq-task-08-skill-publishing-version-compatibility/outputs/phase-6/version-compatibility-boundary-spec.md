# バージョン互換性境界テスト仕様書

## メタ情報

| 項目        | 内容                                                     |
| ----------- | -------------------------------------------------------- |
| 文書        | Phase 6 - テスト拡充 成果物 1/5                          |
| タスクID    | TASK-SKILL-LIFECYCLE-08                                  |
| 作成日      | 2026-03-17                                               |
| 設計参照    | `outputs/phase-2/compatibility-check-design.md`          |
| Phase 4参照 | `outputs/phase-4/compatibility-test-spec.md`             |
| 受入基準    | AC-2（互換性チェック）                                   |
| テスト対象  | 旧バージョンスキルとの互換性境界・昇格バリデーション連携 |

---

## 1. 目的

Phase 4 の互換性テスト仕様（CMP-S-1〜CMP-D-9）は、単一バージョンペア間の semver 比較・Schema diff・依存解決の基本動作を検証している。

本仕様書は Phase 4 でカバーされていない以下の境界シナリオを追加する。

- **N-1 バージョン互換性**: 直近のメジャーバージョン間（例: v2.0.0 vs v1.9.0）での互換性判定と fork 時の parentRef 保持
- **N-2 バージョン互換性**: 2 世代前のメジャーバージョン間（例: v3.0.0 vs v1.x.x）での breaking 判定と import 拒否
- **非互換バージョン遷移と公開レベル昇格の連携**: CompatibilityLevel="breaking" 時の local → public 昇格ブロック

---

## 2. テストケース一覧テーブル

| ID     | テスト名                                            | 入力                                                                                                                  | 期待結果                                                                             | 対応AC |
| ------ | --------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | ------ |
| VCB-01 | N-1互換: v2.0.0 vs v1.9.0 で compatible 判定        | oldSchema: v1.9.0（フィールド a:string, b:number）、newSchema: v2.0.0（同一フィールド、description のみ変更）         | `{ level: "compatible", breakingChanges: [], warnings: [], suggestedBump: "patch" }` | AC-2   |
| VCB-02 | N-1互換: fork 時に parentRef が保持される           | forkSkill(skillId=v2.0.0スキル), newName="fork-v2"                                                                    | `{ success: true, data: { parentRef: <元skillId>, forkedAt: ISO8601 } }`             | AC-2   |
| VCB-03 | N-2非互換: v3.0.0 vs v1.0.0 で breaking 判定        | oldSchema: v1.0.0（フィールド a:string, b:number, c:boolean）、newSchema: v3.0.0（b 削除、c の型変更 boolean→string） | `{ level: "breaking", breakingChanges.length >= 2, suggestedBump: "major" }`         | AC-2   |
| VCB-04 | N-2非互換: import 拒否確認                          | importSkill(sourceUrl=v1.0.0スキル, ターゲットアプリ=v3.0.0互換のみ)                                                  | `{ success: false, error: { code: "SKILL_DIST_DEPENDENCY_ERROR", message: "..." } }` | AC-2   |
| VCB-05 | breaking 時の local→public 昇格バリデーションエラー | CompatibilityChecker.check() が level="breaking" を返す状態で register(visibility="public") を実行                    | `{ success: false, error: { code: "BREAKING_CHANGE_ERROR", message: "..." } }`       | AC-2   |
| VCB-06 | breaking 時の local→team 昇格バリデーションエラー   | CompatibilityChecker.check() が level="breaking" を返す状態で register(visibility="team") を実行                      | `{ success: false, error: { code: "BREAKING_CHANGE_ERROR", message: "..." } }`       | AC-2   |
| VCB-07 | compatible 時の local→public 昇格成功               | CompatibilityChecker.check() が level="compatible" を返す状態で register(visibility="public") を実行                  | `{ success: true, data: { skillId: string, visibility: "public" } }`                 | AC-2   |
| VCB-08 | minor-incompatible 時の local→public 昇格成功       | CompatibilityChecker.check() が level="minor-incompatible" を返す状態で register(visibility="public") を実行          | `{ success: true, data: { skillId: string, visibility: "public" } }`                 | AC-2   |

---

## 3. テストケース詳細仕様

### VCB-01: N-1互換 - v2.0.0 vs v1.9.0 で compatible 判定

**前提条件**:

- oldSchema（v1.9.0）: `{ properties: { a: "string", b: "number" }, required: ["a"] }`
- newSchema（v2.0.0）: `{ properties: { a: "string", b: "number" }, required: ["a"] }`（description フィールドのみ変更）

**実行手順**:

1. `CompatibilityChecker.check(oldSchema, newSchema)` を呼び出す

**期待される結果**:

- 戻り値の `level` が `"compatible"` である
- `breakingChanges` が空配列（`length === 0`）である
- `warnings` が空配列（`length === 0`）である
- `suggestedBump` が `"patch"` である

**アサーション**:

```typescript
expect(result.level).toBe("compatible");
expect(result.breakingChanges).toHaveLength(0);
expect(result.warnings).toHaveLength(0);
expect(result.suggestedBump).toBe("patch");
```

---

### VCB-02: N-1互換 - fork 時に parentRef が保持される

**前提条件**:

- v2.0.0 のスキル（skillId: "skill-v2-abc"）が登録済み
- VCB-01 で v1.9.0 との互換性が compatible であることが確認済み

**実行手順**:

1. `SkillDistributionService.forkSkill("skill-v2-abc", "fork-v2")` を呼び出す

**期待される結果**:

- `success` が `true` である
- `data.parentRef` が `"skill-v2-abc"` と一致する
- `data.forkedAt` が ISO 8601 形式の文字列である
- `data.newSkillId` が非空文字列である

**アサーション**:

```typescript
expect(result.success).toBe(true);
expect(result.data.parentRef).toBe("skill-v2-abc");
expect(result.data.forkedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
expect(result.data.newSkillId).not.toBe("");
```

---

### VCB-03: N-2非互換 - v3.0.0 vs v1.0.0 で breaking 判定

**前提条件**:

- oldSchema（v1.0.0）: `{ properties: { a: "string", b: "number", c: "boolean" }, required: ["a", "b"] }`
- newSchema（v3.0.0）: `{ properties: { a: "string", c: "string" }, required: ["a"] }`（b 削除、c の型変更）

**実行手順**:

1. `CompatibilityChecker.check(oldSchema, newSchema)` を呼び出す

**期待される結果**:

- `level` が `"breaking"` である
- `breakingChanges` が 2 件以上含まれる（b の削除 + c の型変更）
- `breakingChanges` に `{ field: "b", type: "removed" }` が含まれる
- `breakingChanges` に `{ field: "c", type: "type-changed" }` が含まれる
- `suggestedBump` が `"major"` である

**アサーション**:

```typescript
expect(result.level).toBe("breaking");
expect(result.breakingChanges.length).toBeGreaterThanOrEqual(2);
expect(result.breakingChanges).toContainEqual(
  expect.objectContaining({ field: "b", type: "removed" }),
);
expect(result.breakingChanges).toContainEqual(
  expect.objectContaining({ field: "c", type: "type-changed" }),
);
expect(result.suggestedBump).toBe("major");
```

---

### VCB-04: N-2非互換 - import 拒否確認

**前提条件**:

- ターゲット環境が v3.0.0 互換のスキルのみ受け入れる設定
- インポート対象は v1.0.0 のスキル（VCB-03 で breaking と判定済み）
- `autoResolveDependencies: false`

**実行手順**:

1. `SkillDistributionService.importSkill(sourceUrl, { autoResolveDependencies: false })` を呼び出す

**期待される結果**:

- `success` が `false` である
- `error.code` が `"SKILL_DIST_DEPENDENCY_ERROR"` である
- `error.message` にバージョン不整合を示す情報が含まれる

**アサーション**:

```typescript
expect(result.success).toBe(false);
expect(result.error.code).toBe("SKILL_DIST_DEPENDENCY_ERROR");
expect(typeof result.error.message).toBe("string");
expect(result.error.message.length).toBeGreaterThan(0);
```

---

### VCB-05: breaking 時の local→public 昇格バリデーションエラー

**前提条件**:

- スキル "my-analyzer" が local visibility で登録済み（version: "1.0.0"）
- 更新後バージョン（version: "1.1.0"）で CompatibilityChecker.check() が `level: "breaking"` を返す
- major バンプが実施されていない（version が "1.1.0" のまま）

**実行手順**:

1. `SkillRegistryService.register(metadata)` を呼び出す（visibility: "public", version: "1.1.0"）

**期待される結果**:

- `success` が `false` である
- `error.code` が `"BREAKING_CHANGE_ERROR"` である（エラーコード範囲: 2000-2999、Business Error）

**アサーション**:

```typescript
expect(result.success).toBe(false);
expect(result.error.code).toBe("BREAKING_CHANGE_ERROR");
```

---

### VCB-06: breaking 時の local→team 昇格バリデーションエラー

**前提条件**:

- VCB-05 と同一の前提条件（breaking change が検出済み、major バンプ未実施）

**実行手順**:

1. `SkillRegistryService.register(metadata)` を呼び出す（visibility: "team", version: "1.1.0", teamId: "team-123"）

**期待される結果**:

- `success` が `false` である
- `error.code` が `"BREAKING_CHANGE_ERROR"` である

**アサーション**:

```typescript
expect(result.success).toBe(false);
expect(result.error.code).toBe("BREAKING_CHANGE_ERROR");
```

---

### VCB-07: compatible 時の local→public 昇格成功

**前提条件**:

- CompatibilityChecker.check() が `level: "compatible"` を返す
- 全必須フィールド（name, description, version, author, tags, teamId, license, readme, changelog, minAppVersion）が有効

**実行手順**:

1. `SkillRegistryService.register(validPublicMetadata)` を呼び出す

**期待される結果**:

- `success` が `true` である
- `data.visibility` が `"public"` である
- `data.skillId` が非空文字列である

**アサーション**:

```typescript
expect(result.success).toBe(true);
expect(result.data.visibility).toBe("public");
expect(result.data.skillId).not.toBe("");
```

---

### VCB-08: minor-incompatible 時の local→public 昇格成功

**前提条件**:

- CompatibilityChecker.check() が `level: "minor-incompatible"` を返す
- version が minor バンプ済み（例: "1.0.0" → "1.1.0"）
- 全必須フィールドが有効

**実行手順**:

1. `SkillRegistryService.register(validPublicMetadata)` を呼び出す（version: "1.1.0"）

**期待される結果**:

- `success` が `true` である
- `data.visibility` が `"public"` である

**アサーション**:

```typescript
expect(result.success).toBe(true);
expect(result.data.visibility).toBe("public");
```

---

## 4. Phase 4 との差分

| 観点                    | Phase 4 カバー範囲                                   | Phase 6 追加範囲                                           |
| ----------------------- | ---------------------------------------------------- | ---------------------------------------------------------- |
| バージョンペア          | 同一メジャーバージョン内の diff（CMP-S-1〜CMP-S-10） | N-1/N-2 メジャーバージョン間の diff（VCB-01, VCB-03）      |
| fork の parentRef 保持  | DT-15, DT-20（基本 fork テスト）                     | VCB-02（互換性確認済みスキルの fork で parentRef 検証）    |
| import のバージョン拒否 | DT-06（依存未解決エラー）                            | VCB-04（N-2 非互換によるバージョン不整合での import 拒否） |
| 互換性と昇格の連携      | なし                                                 | VCB-05〜VCB-08（breaking/compatible/minor と昇格の組合せ） |

---

## 5. Phase 7 カバレッジ確認への引き継ぎ

- VCB-01〜VCB-03: `CompatibilityChecker.check()` の分岐カバレッジ（N-1/N-2 パス）
- VCB-04: `SkillDistributionService.importSkill()` のバージョン不整合エラーパス
- VCB-05〜VCB-08: `SkillRegistryService.register()` の互換性チェック連携パス（breaking ブロック / compatible 通過 / minor-incompatible 通過）
- Phase 7 では上記パスが Branch Coverage に反映されていることを確認する
