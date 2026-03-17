# 公開停止・再公開境界テスト仕様書

## メタ情報

| 項目        | 内容                                                                  |
| ----------- | --------------------------------------------------------------------- |
| 文書        | Phase 6 - テスト拡充 成果物 3/5                                       |
| タスクID    | TASK-SKILL-LIFECYCLE-08                                               |
| 作成日      | 2026-03-17                                                            |
| 設計参照    | `outputs/phase-2/skill-center-flow-design.md`                         |
| Phase 4参照 | `outputs/phase-4/skill-center-test-spec.md`                           |
| 受入基準    | AC-4（Skill Center 登録・更新・公開停止フロー）                       |
| テスト対象  | deprecation grace period 境界・再公開バージョン整合性・依存スキル通知 |

---

## 1. 目的

Phase 4 の Skill Center テスト仕様（SC-15〜SC-24）は、deprecate/remove の基本操作と P42 バリデーションを検証している。

本仕様書は Phase 4 でカバーされていない以下の境界シナリオを追加する。

- **grace period 境界での import 動作**: 30 日以内と 30 日経過後の import 成否の違い
- **既存ユーザーへの影響なし保証**: grace period 内に import 済みのスキルが経過後も使用可能であること
- **再公開時のバージョン整合性**: 再公開バージョンが deprecation 時バージョンより大きいことの強制
- **依存スキル存在時の deprecate 通知**: getDependents が非空の場合の DeprecationNotice に依存一覧が含まれること
- **gracePeriodDays の下限バリデーション**: 30 日未満（emergency 以外）の拒否

---

## 2. テストケース一覧テーブル

| ID     | テスト名                                                         | 入力                                                                        | 期待結果                                                                             | 対応AC |
| ------ | ---------------------------------------------------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | ------ |
| DRB-01 | grace period 内（29日目）の import 成功 + 警告                   | deprecatedAt=29日前のスキルに importSkill() を実行                          | `{ success: true, data: { skillId, importedAt } }` + 警告メッセージ付き              | AC-4   |
| DRB-02 | grace period 境界（30日目）の import 成功 + 警告                 | deprecatedAt=30日前（当日が最終日）のスキルに importSkill() を実行          | `{ success: true, data: { skillId, importedAt } }` + 警告メッセージ付き              | AC-4   |
| DRB-03 | grace period 経過後（31日目）の import 失敗                      | deprecatedAt=31日前のスキルに importSkill() を実行                          | `{ success: false, error: { code: "SKILL_DIST_IMPORT_BLOCKED_DEPRECATED" } }`        | AC-4   |
| DRB-04 | 既存ユーザーの import 済みスキルは grace period 経過後も使用可能 | grace period 内に importSkill() が成功 → 31日経過後にそのスキルの実行を試行 | スキル実行が成功する（import 済みスキルは削除されない）                              | AC-4   |
| DRB-05 | 再公開: version > deprecation時version で成功                    | deprecation時 version="1.0.0"、再公開 version="1.1.0"                       | `{ success: true, data: { skillId, visibility: "public" } }`                         | AC-4   |
| DRB-06 | 再公開: version === deprecation時version でエラー                | deprecation時 version="1.0.0"、再公開 version="1.0.0"                       | `{ success: false, error: { code: "VALIDATION_ERROR" } }`                            | AC-4   |
| DRB-07 | 再公開: version < deprecation時version でエラー                  | deprecation時 version="2.0.0"、再公開 version="1.5.0"                       | `{ success: false, error: { code: "VALIDATION_ERROR" } }`                            | AC-4   |
| DRB-08 | 依存スキル存在時の deprecate: 依存一覧が通知に含まれる           | getDependents() が ["skill-B", "skill-C"] を返すスキルを deprecate          | deprecate 成功、DeprecationNotice の dependents に ["skill-B", "skill-C"] が含まれる | AC-4   |
| DRB-09 | 依存スキルなしの deprecate: 正常完了                             | getDependents() が空配列を返すスキルを deprecate                            | `{ success: true }`（依存一覧なし）                                                  | AC-4   |
| DRB-10 | gracePeriodDays=29 でバリデーションエラー（emergency以外）       | `gracePeriodDays: 29, emergency: false`                                     | `{ success: false, error: { code: "VALIDATION_ERROR" } }`                            | AC-4   |
| DRB-11 | gracePeriodDays=30 で正常完了                                    | `gracePeriodDays: 30, emergency: false`                                     | `{ success: true }`                                                                  | AC-4   |
| DRB-12 | gracePeriodDays=0 + emergency=true で正常完了（緊急停止）        | `gracePeriodDays: 0, emergency: true`                                       | `{ success: true }`                                                                  | AC-4   |
| DRB-13 | gracePeriodDays=0 + emergency=false でバリデーションエラー       | `gracePeriodDays: 0, emergency: false`                                      | `{ success: false, error: { code: "VALIDATION_ERROR" } }`                            | AC-4   |

---

## 3. テストケース詳細仕様

### DRB-01: grace period 内（29日目）の import 成功 + 警告

**前提条件**:

- スキル "deprecated-skill" が 29 日前に deprecate 済み（gracePeriodDays=30）
- visibility は "public" のまま（grace period 中は公開状態が維持される）

**実行手順**:

1. `SkillDistributionService.importSkill(sourceUrl, { autoResolveDependencies: false })` を呼び出す

**期待される結果**:

- `success` が `true` である
- `data.skillId` が非空文字列である
- `data.importedAt` が ISO 8601 形式である
- レスポンスに deprecation 警告が含まれる（`data.warnings` 配列に deprecation 情報が 1 件以上）

**アサーション**:

```typescript
expect(result.success).toBe(true);
expect(result.data.skillId).not.toBe("");
expect(result.data.importedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
expect(result.data.warnings.length).toBeGreaterThanOrEqual(1);
expect(result.data.warnings[0]).toContain("deprecated");
```

---

### DRB-02: grace period 境界（30日目）の import 成功 + 警告

**前提条件**:

- スキル "deprecated-skill" が 30 日前に deprecate 済み（gracePeriodDays=30、当日が最終日）

**実行手順**:

1. `SkillDistributionService.importSkill(sourceUrl, { autoResolveDependencies: false })` を呼び出す

**期待される結果**:

- `success` が `true` である（30 日目はまだ grace period 内）
- deprecation 警告が含まれる

**アサーション**:

```typescript
expect(result.success).toBe(true);
expect(result.data.warnings.length).toBeGreaterThanOrEqual(1);
```

---

### DRB-03: grace period 経過後（31日目）の import 失敗

**前提条件**:

- スキル "deprecated-skill" が 31 日前に deprecate 済み（gracePeriodDays=30、期限超過）

**実行手順**:

1. `SkillDistributionService.importSkill(sourceUrl, { autoResolveDependencies: false })` を呼び出す

**期待される結果**:

- `success` が `false` である
- `error.code` が `"SKILL_DIST_IMPORT_BLOCKED_DEPRECATED"` である（エラーコード範囲: 2000-2999、Business Error）

**アサーション**:

```typescript
expect(result.success).toBe(false);
expect(result.error.code).toBe("SKILL_DIST_IMPORT_BLOCKED_DEPRECATED");
```

---

### DRB-04: 既存ユーザーの import 済みスキルは grace period 経過後も使用可能

**前提条件**:

- DRB-01 で grace period 内に importSkill() が成功済み（importedSkillId を保持）
- その後 31 日が経過（grace period 超過）

**実行手順**:

1. importedSkillId のスキルが使用可能かを確認する（スキルの存在確認・実行可能確認）

**期待される結果**:

- import 済みスキルはローカルに保持されており、削除されていない
- スキルの実行が成功する

**アサーション**:

```typescript
// import済みスキルの存在確認
const skillExists = await skillService.exists(importedSkillId);
expect(skillExists).toBe(true);
```

---

### DRB-05: 再公開 - version > deprecation時version で成功

**前提条件**:

- スキル "my-analyzer" が version="1.0.0" で deprecate 済み
- grace period 経過後に remove 済み
- 再公開用メタデータ: version="1.1.0"、全必須フィールドが有効

**実行手順**:

1. `SkillRegistryService.register(republishMetadata)` を呼び出す（version: "1.1.0", visibility: "public"）

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

### DRB-06: 再公開 - version === deprecation時version でエラー

**前提条件**:

- スキル "my-analyzer" が version="1.0.0" で deprecate 済み・remove 済み
- 再公開用メタデータ: version="1.0.0"（同一バージョン）

**実行手順**:

1. `SkillRegistryService.register(republishMetadata)` を呼び出す（version: "1.0.0"）

**期待される結果**:

- `success` が `false` である
- `error.code` が `"VALIDATION_ERROR"` である（エラーコード範囲: 1000-1999）

**アサーション**:

```typescript
expect(result.success).toBe(false);
expect(result.error.code).toBe("VALIDATION_ERROR");
```

---

### DRB-07: 再公開 - version < deprecation時version でエラー

**前提条件**:

- スキル "my-analyzer" が version="2.0.0" で deprecate 済み・remove 済み
- 再公開用メタデータ: version="1.5.0"（ダウングレード）

**実行手順**:

1. `SkillRegistryService.register(republishMetadata)` を呼び出す（version: "1.5.0"）

**期待される結果**:

- `success` が `false` である
- `error.code` が `"VALIDATION_ERROR"` である

**アサーション**:

```typescript
expect(result.success).toBe(false);
expect(result.error.code).toBe("VALIDATION_ERROR");
```

---

### DRB-08: 依存スキル存在時の deprecate - 依存一覧が通知に含まれる

**前提条件**:

- スキル "base-skill"（skillId: "skill-base-001"）が公開中
- `getDependents("skill-base-001")` が `["skill-B", "skill-C"]` を返す

**実行手順**:

1. `SkillRegistryService.deprecate("skill-base-001", notice)` を呼び出す
   - notice: `{ reason: "新バージョンに移行", gracePeriodDays: 30 }`

**期待される結果**:

- deprecate が成功する（`success: true`）
- DeprecationNotice のレスポンスに依存スキル一覧が含まれる
- 依存一覧に `"skill-B"` と `"skill-C"` が含まれる

**アサーション**:

```typescript
expect(result.success).toBe(true);
expect(result.data.affectedDependents).toContain("skill-B");
expect(result.data.affectedDependents).toContain("skill-C");
expect(result.data.affectedDependents).toHaveLength(2);
```

---

### DRB-09: 依存スキルなしの deprecate - 正常完了

**前提条件**:

- スキル "standalone-skill" が公開中
- `getDependents()` が空配列 `[]` を返す

**実行手順**:

1. `SkillRegistryService.deprecate("standalone-skill", notice)` を呼び出す

**期待される結果**:

- deprecate が成功する（`success: true`）
- 依存スキル一覧が空またはフィールドが省略される

**アサーション**:

```typescript
expect(result.success).toBe(true);
```

---

### DRB-10: gracePeriodDays=29 でバリデーションエラー（emergency以外）

**前提条件**:

- `emergency: false`（通常の deprecation）
- `gracePeriodDays: 29`（30 日未満）

**実行手順**:

1. `SkillRegistryService.deprecate(skillId, { reason: "廃止", gracePeriodDays: 29 })` を呼び出す

**期待される結果**:

- `success` が `false` である
- `error.code` が `"VALIDATION_ERROR"` である（エラーコード範囲: 1000-1999）
- `error.message` に grace period の最小値に関する情報が含まれる

**アサーション**:

```typescript
expect(result.success).toBe(false);
expect(result.error.code).toBe("VALIDATION_ERROR");
```

---

### DRB-11: gracePeriodDays=30 で正常完了

**前提条件**:

- `emergency: false`（通常の deprecation）
- `gracePeriodDays: 30`（最小値ちょうど）
- reason が有効な文字列

**実行手順**:

1. `SkillRegistryService.deprecate(skillId, { reason: "後継バージョンに移行", gracePeriodDays: 30 })` を呼び出す

**期待される結果**:

- `success` が `true` である

**アサーション**:

```typescript
expect(result.success).toBe(true);
```

---

### DRB-12: gracePeriodDays=0 + emergency=true で正常完了（緊急停止）

**前提条件**:

- `emergency: true`（緊急停止）
- `gracePeriodDays: 0`

**実行手順**:

1. `SkillRegistryService.deprecate(skillId, { reason: "セキュリティ脆弱性", gracePeriodDays: 0, emergency: true })` を呼び出す

**期待される結果**:

- `success` が `true` である（emergency=true の場合は gracePeriodDays=0 が許可される）

**アサーション**:

```typescript
expect(result.success).toBe(true);
```

---

### DRB-13: gracePeriodDays=0 + emergency=false でバリデーションエラー

**前提条件**:

- `emergency: false`（通常の deprecation）
- `gracePeriodDays: 0`（30 日未満かつ emergency ではない）

**実行手順**:

1. `SkillRegistryService.deprecate(skillId, { reason: "廃止", gracePeriodDays: 0, emergency: false })` を呼び出す

**期待される結果**:

- `success` が `false` である
- `error.code` が `"VALIDATION_ERROR"` である

**アサーション**:

```typescript
expect(result.success).toBe(false);
expect(result.error.code).toBe("VALIDATION_ERROR");
```

---

## 4. Phase 4 との差分

| 観点                         | Phase 4 カバー範囲                                       | Phase 6 追加範囲                                                           |
| ---------------------------- | -------------------------------------------------------- | -------------------------------------------------------------------------- |
| deprecate 基本操作           | SC-15〜SC-20（reason バリデーション、gracePeriodDays=0） | DRB-10〜DRB-13（gracePeriodDays 下限の境界値、emergency フラグとの組合せ） |
| grace period 中の import     | なし                                                     | DRB-01〜DRB-03（29日目/30日目/31日目の import 成否境界）                   |
| 既存ユーザー影響             | なし                                                     | DRB-04（import 済みスキルの grace period 経過後の使用可能確認）            |
| 再公開バージョン整合性       | なし                                                     | DRB-05〜DRB-07（version の大小比較による再公開の成否）                     |
| 依存スキル存在時の deprecate | SC-25〜SC-27（getDependents の基本テスト）               | DRB-08〜DRB-09（依存一覧が DeprecationNotice に含まれることの検証）        |

---

## 5. Phase 7 カバレッジ確認への引き継ぎ

- DRB-01〜DRB-03: `importSkill()` 内の deprecation 日付チェック分岐（grace period 内/境界/超過）
- DRB-04: import 済みスキルのローカル保持パス（削除されないことの確認）
- DRB-05〜DRB-07: `register()` 内のバージョン比較分岐（再公開時の version > previousVersion チェック）
- DRB-08〜DRB-09: `deprecate()` 内の `getDependents()` 呼び出しと結果の DeprecationNotice への組み込みパス
- DRB-10〜DRB-13: `deprecate()` 内の `gracePeriodDays` バリデーション分岐（emergency フラグによる条件分岐）
- Phase 7 では DRB-01〜DRB-03 の日付境界分岐が Branch Coverage に反映されていることを重点確認する
