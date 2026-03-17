# エラーハンドリング拡充テスト仕様書

## メタ情報

| 項目        | 内容                                                                 |
| ----------- | -------------------------------------------------------------------- |
| 文書        | Phase 6 - テスト拡充 成果物 5/5                                      |
| タスクID    | TASK-SKILL-LIFECYCLE-08                                              |
| 作成日      | 2026-03-17                                                           |
| 設計参照    | `outputs/phase-2/distribution-operations-design.md`                  |
|             | `outputs/phase-2/publishing-metadata-design.md`                      |
| Phase 4参照 | `outputs/phase-4/distribution-test-spec.md`                          |
|             | `outputs/phase-4/publishing-test-spec.md`                            |
| 受入基準    | AC-1（公開レベルメタデータ）、AC-4（Skill Center フロー）            |
| テスト対象  | ネットワーク障害・メタデータ不整合・権限不足のエラーハンドリング拡充 |

---

## 1. 目的

Phase 4 のテスト仕様は、各操作の基本的な正常系・バリデーション異常系を検証している。

本仕様書は Phase 4 でカバーされていない以下のエラーハンドリングシナリオを追加する。

- **ネットワーク障害**: importSkill 中の接続断絶、リトライ可能エラーコードの検証、部分ダウンロードのロールバック保証
- **メタデータ不整合**: name 長制限超過、tags 件数超過、license の非 SPDX/非 "proprietary" バリデーション
- **権限不足**: teamId 未所属ユーザーの share エラー、他ユーザー所有スキルの deprecate エラー

---

## 2. テストケース一覧テーブル

| ID     | テスト名                                                       | 入力                                                                | 期待結果                                                             | 対応AC |
| ------ | -------------------------------------------------------------- | ------------------------------------------------------------------- | -------------------------------------------------------------------- | ------ |
| EHE-01 | ネットワーク障害: importSkill 中の接続断絶                     | importSkill() 実行中にネットワーク接続が切断される                  | `{ success: false, error: { code: "SKILL_DIST_NETWORK_ERROR" } }`    | AC-4   |
| EHE-02 | ネットワーク障害: エラーコードが External Service Error 範囲   | EHE-01 のエラーコードを確認                                         | エラーコード範囲: 3000-3999（リトライ可能）                          | AC-4   |
| EHE-03 | ネットワーク障害: 部分ダウンロードのロールバック               | importSkill() がダウンロード途中で失敗した場合                      | 一時ファイルが削除され、ローカルストレージに不完全なスキルが残らない | AC-4   |
| EHE-04 | ネットワーク障害: エラーメッセージにリトライ可否情報が含まれる | EHE-01 のエラーメッセージを確認                                     | `error.message` にリトライ可能であることを示す情報が含まれる         | AC-4   |
| EHE-05 | メタデータ不整合: name が 201 文字でバリデーションエラー       | `metadata.name` が 201 文字の文字列                                 | `{ success: false, error: { code: "VALIDATION_ERROR" } }`            | AC-1   |
| EHE-06 | メタデータ不整合: name が 200 文字で正常（境界値）             | `metadata.name` が 200 文字の文字列                                 | バリデーション成功                                                   | AC-1   |
| EHE-07 | メタデータ不整合: tags が 11 件でバリデーションエラー          | `metadata.tags` が 11 要素の配列                                    | `{ success: false, error: { code: "VALIDATION_ERROR" } }`            | AC-1   |
| EHE-08 | メタデータ不整合: tags が 10 件で正常（境界値）                | `metadata.tags` が 10 要素の配列                                    | バリデーション成功                                                   | AC-1   |
| EHE-09 | メタデータ不整合: license が非 SPDX かつ非 "proprietary"       | `metadata.license = "CUSTOM-LICENSE"`                               | `{ success: false, error: { code: "VALIDATION_ERROR" } }`            | AC-1   |
| EHE-10 | メタデータ不整合: license が "MIT"（有効な SPDX）で正常        | `metadata.license = "MIT"`                                          | バリデーション成功                                                   | AC-1   |
| EHE-11 | メタデータ不整合: license が "Apache-2.0"（有効な SPDX）で正常 | `metadata.license = "Apache-2.0"`                                   | バリデーション成功                                                   | AC-1   |
| EHE-12 | メタデータ不整合: license が "proprietary" で正常              | `metadata.license = "proprietary"`                                  | バリデーション成功                                                   | AC-1   |
| EHE-13 | 権限不足: teamId 未所属ユーザーの share エラー                 | ユーザーが teamId="team-beta-001" に所属していない状態で shareSkill | `{ success: false, error: { code: "SKILL_DIST_PERMISSION_ERROR" } }` | AC-4   |
| EHE-14 | 権限不足: share エラーコードが Business Error 範囲             | EHE-13 のエラーコードを確認                                         | エラーコード範囲: 2000-2999                                          | AC-4   |
| EHE-15 | 権限不足: 他ユーザー所有スキルの deprecate エラー              | ユーザーA が所有するスキルをユーザーB が deprecate しようとする     | `{ success: false, error: { code: "SKILL_DIST_PERMISSION_ERROR" } }` | AC-4   |
| EHE-16 | 権限不足: deprecate エラーコードが Business Error 範囲         | EHE-15 のエラーコードを確認                                         | エラーコード範囲: 2000-2999                                          | AC-4   |
| EHE-17 | 権限不足: エラーレスポンスが P60 準拠                          | EHE-13/EHE-15 のレスポンス形式を確認                                | `{ success: false, error: { code: string, message: string } }` 形式  | AC-4   |

---

## 3. テストケース詳細仕様

### EHE-01: ネットワーク障害 - importSkill 中の接続断絶

**前提条件**:

- 有効な sourceUrl が設定されている
- ネットワーク接続が利用可能な状態でダウンロードを開始する
- ダウンロード途中でネットワーク接続を切断するモックを設定する

**実行手順**:

1. ネットワーク切断モックを設定する（ダウンロード開始後 500ms で接続断絶）
2. `SkillDistributionService.importSkill(sourceUrl, { autoResolveDependencies: false })` を呼び出す

**期待される結果**:

- `success` が `false` である
- `error.code` が `"SKILL_DIST_NETWORK_ERROR"` である

**アサーション**:

```typescript
expect(result.success).toBe(false);
expect(result.error.code).toBe("SKILL_DIST_NETWORK_ERROR");
```

---

### EHE-02: ネットワーク障害 - エラーコードが External Service Error 範囲

**前提条件**:

- EHE-01 と同一

**実行手順**:

1. EHE-01 のエラーレスポンスを確認する

**期待される結果**:

- エラーコードが External Service Error 範囲（3000-3999）に属する
- リトライ可能なエラーである

**アサーション**:

```typescript
expect(result.success).toBe(false);
expect(result.error.code).toBe("SKILL_DIST_NETWORK_ERROR");
// エラーコードが External Service Error カテゴリであることの確認
// 02-code-quality.md: External Service Error = 3000-3999 = リトライ可能
```

---

### EHE-03: ネットワーク障害 - 部分ダウンロードのロールバック

**前提条件**:

- EHE-01 でダウンロードが途中で失敗した後の状態

**実行手順**:

1. ダウンロード先ディレクトリの一時ファイルを確認する
2. ローカルスキル一覧を取得し、不完全なスキルが登録されていないことを確認する

**期待される結果**:

- 一時ファイルが存在しない（クリーンアップ済み）
- ローカルスキル一覧に不完全なスキルが含まれない

**アサーション**:

```typescript
// 一時ファイルが残っていないことを確認
const tempFiles = await fs.readdir(tempDownloadDir);
const orphanedFiles = tempFiles.filter((f) => f.startsWith("skill-import-"));
expect(orphanedFiles).toHaveLength(0);

// ローカルスキル一覧に不完全なスキルが含まれないことを確認
const localSkills = await skillService.listLocal();
const incompleteSkills = localSkills.filter((s) => s.status === "incomplete");
expect(incompleteSkills).toHaveLength(0);
```

---

### EHE-04: ネットワーク障害 - エラーメッセージにリトライ可否情報が含まれる

**前提条件**:

- EHE-01 と同一

**実行手順**:

1. EHE-01 のエラーメッセージを確認する

**期待される結果**:

- `error.message` が非空文字列である
- メッセージにネットワーク障害であることを示す情報が含まれる

**アサーション**:

```typescript
expect(typeof result.error.message).toBe("string");
expect(result.error.message.length).toBeGreaterThan(0);
```

---

### EHE-05: メタデータ不整合 - name が 201 文字でバリデーションエラー

**前提条件**:

- `metadata.name` に 201 文字の文字列を設定する（`"a".repeat(201)`）

**実行手順**:

1. メタデータバリデーション関数に `{ ...validMetadata, name: "a".repeat(201) }` を渡す

**期待される結果**:

- `success` が `false` である
- `error.code` が `"VALIDATION_ERROR"` である（エラーコード範囲: 1000-1999）

**アサーション**:

```typescript
expect(result.success).toBe(false);
expect(result.error.code).toBe("VALIDATION_ERROR");
```

---

### EHE-06: メタデータ不整合 - name が 200 文字で正常（境界値）

**前提条件**:

- `metadata.name` に 200 文字の文字列を設定する（`"a".repeat(200)`）

**実行手順**:

1. メタデータバリデーション関数に `{ ...validMetadata, name: "a".repeat(200) }` を渡す

**期待される結果**:

- バリデーション成功

**アサーション**:

```typescript
expect(result.success).toBe(true);
```

---

### EHE-07: メタデータ不整合 - tags が 11 件でバリデーションエラー

**前提条件**:

- `metadata.tags` に 11 要素の配列を設定する

**実行手順**:

1. メタデータバリデーション関数に `{ ...validMetadata, tags: Array.from({ length: 11 }, (_, i) => "tag-" + (i + 1).toString()) }` を渡す

**期待される結果**:

- `success` が `false` である
- `error.code` が `"VALIDATION_ERROR"` である

**アサーション**:

```typescript
expect(result.success).toBe(false);
expect(result.error.code).toBe("VALIDATION_ERROR");
```

---

### EHE-08: メタデータ不整合 - tags が 10 件で正常（境界値）

**前提条件**:

- `metadata.tags` に 10 要素の配列を設定する

**実行手順**:

1. メタデータバリデーション関数に `{ ...validMetadata, tags: Array.from({ length: 10 }, (_, i) => "tag-" + (i + 1).toString()) }` を渡す

**期待される結果**:

- バリデーション成功

**アサーション**:

```typescript
expect(result.success).toBe(true);
```

---

### EHE-09: メタデータ不整合 - license が非 SPDX かつ非 "proprietary"

**前提条件**:

- `metadata.license` に `"CUSTOM-LICENSE"` を設定する（SPDX 識別子に存在せず、"proprietary" でもない）

**実行手順**:

1. メタデータバリデーション関数に `{ ...validMetadata, license: "CUSTOM-LICENSE" }` を渡す

**期待される結果**:

- `success` が `false` である
- `error.code` が `"VALIDATION_ERROR"` である

**アサーション**:

```typescript
expect(result.success).toBe(false);
expect(result.error.code).toBe("VALIDATION_ERROR");
```

---

### EHE-10: メタデータ不整合 - license が "MIT"（有効な SPDX）で正常

**前提条件**:

- `metadata.license` に `"MIT"` を設定する

**実行手順**:

1. メタデータバリデーション関数に `{ ...validMetadata, license: "MIT" }` を渡す

**期待される結果**:

- バリデーション成功

**アサーション**:

```typescript
expect(result.success).toBe(true);
```

---

### EHE-11: メタデータ不整合 - license が "Apache-2.0"（有効な SPDX）で正常

**前提条件**:

- `metadata.license` に `"Apache-2.0"` を設定する

**実行手順**:

1. メタデータバリデーション関数に `{ ...validMetadata, license: "Apache-2.0" }` を渡す

**期待される結果**:

- バリデーション成功

**アサーション**:

```typescript
expect(result.success).toBe(true);
```

---

### EHE-12: メタデータ不整合 - license が "proprietary" で正常

**前提条件**:

- `metadata.license` に `"proprietary"` を設定する

**実行手順**:

1. メタデータバリデーション関数に `{ ...validMetadata, license: "proprietary" }` を渡す

**期待される結果**:

- バリデーション成功

**アサーション**:

```typescript
expect(result.success).toBe(true);
```

---

### EHE-13: 権限不足 - teamId 未所属ユーザーの share エラー

**前提条件**:

- ユーザー "user-gamma" が teamId="team-beta-001" に所属していない
- スキル "my-tool"（有効な skillId）が存在する

**実行手順**:

1. ユーザー "user-gamma" のコンテキストで `SkillDistributionService.shareSkill(skillId, { teamId: "team-beta-001", expiresIn: 86400 })` を呼び出す

**期待される結果**:

- `success` が `false` である
- `error.code` が `"SKILL_DIST_PERMISSION_ERROR"` である（エラーコード範囲: 2000-2999、Business Error）

**アサーション**:

```typescript
expect(result.success).toBe(false);
expect(result.error.code).toBe("SKILL_DIST_PERMISSION_ERROR");
```

---

### EHE-14: 権限不足 - share エラーコードが Business Error 範囲

**前提条件**:

- EHE-13 と同一

**実行手順**:

1. EHE-13 のエラーレスポンスを確認する

**期待される結果**:

- エラーコードが Business Error 範囲（2000-2999）に属する
- リトライ不可のエラーである

**アサーション**:

```typescript
expect(result.success).toBe(false);
expect(result.error.code).toBe("SKILL_DIST_PERMISSION_ERROR");
// 02-code-quality.md: Business Error = 2000-2999 = リトライ不可
```

---

### EHE-15: 権限不足 - 他ユーザー所有スキルの deprecate エラー

**前提条件**:

- スキル "user-a-tool"（skillId: "skill-user-a-001"）がユーザー A によって公開済み
- ユーザー B がこのスキルを deprecate しようとする

**実行手順**:

1. ユーザー B のコンテキストで `SkillRegistryService.deprecate("skill-user-a-001", { reason: "不要", gracePeriodDays: 30 })` を呼び出す

**期待される結果**:

- `success` が `false` である
- `error.code` が `"SKILL_DIST_PERMISSION_ERROR"` である（エラーコード範囲: 2000-2999、Business Error）

**アサーション**:

```typescript
expect(result.success).toBe(false);
expect(result.error.code).toBe("SKILL_DIST_PERMISSION_ERROR");
```

---

### EHE-16: 権限不足 - deprecate エラーコードが Business Error 範囲

**前提条件**:

- EHE-15 と同一

**実行手順**:

1. EHE-15 のエラーレスポンスを確認する

**期待される結果**:

- エラーコードが Business Error 範囲（2000-2999）に属する

**アサーション**:

```typescript
expect(result.success).toBe(false);
expect(result.error.code).toBe("SKILL_DIST_PERMISSION_ERROR");
```

---

### EHE-17: 権限不足 - エラーレスポンスが P60 準拠

**前提条件**:

- EHE-13 または EHE-15 のエラーレスポンス

**実行手順**:

1. エラーレスポンスの構造を検証する

**期待される結果**:

- レスポンスが `{ success: false, error: { code: string, message: string } }` 形式である
- `error.code` が文字列型である
- `error.message` が文字列型かつ非空である
- レスポンスに内部情報（スタックトレース、ファイルパス）が含まれない

**アサーション**:

```typescript
expect(result.success).toBe(false);
expect(typeof result.error.code).toBe("string");
expect(typeof result.error.message).toBe("string");
expect(result.error.message.length).toBeGreaterThan(0);
// 内部情報漏洩がないことを確認（04-electron-security.md準拠）
expect(result.error.message).not.toMatch(/\/Users\//);
expect(result.error.message).not.toMatch(/at\s+\w+\s+\(/);
```

---

## 4. Phase 4 との差分

| 観点                     | Phase 4 カバー範囲                        | Phase 6 追加範囲                                                         |
| ------------------------ | ----------------------------------------- | ------------------------------------------------------------------------ |
| ネットワーク障害         | DT-07（基本的なネットワークエラー）       | EHE-01〜EHE-04（接続断絶、ロールバック、リトライ可能エラーコード確認）   |
| name 長制限              | PUB-L-2〜PUB-L-4（空文字列/スペースのみ） | EHE-05〜EHE-06（200文字/201文字の境界値テスト）                          |
| tags 件数制限            | PUB-T-8（11件のエラー）                   | EHE-07〜EHE-08（10件/11件の境界値テスト、正常側も明示的に検証）          |
| license バリデーション   | PUB-P-2〜PUB-P-4（空文字列/スペースのみ） | EHE-09〜EHE-12（SPDX 識別子/proprietary/非 SPDX のバリデーション）       |
| 権限不足エラー           | DT-19（fork 権限なし）                    | EHE-13〜EHE-17（share の teamId 未所属、他ユーザー所有の deprecate）     |
| エラーコードカテゴリ検証 | なし（暗黙的）                            | EHE-02, EHE-14, EHE-16（02-code-quality.md のエラーコードカテゴリ準拠）  |
| 内部情報漏洩防止         | なし                                      | EHE-17（エラーメッセージにパス・スタックトレースが含まれないことの確認） |

---

## 5. Phase 7 カバレッジ確認への引き継ぎ

- EHE-01〜EHE-04: `importSkill()` 内のネットワークエラーハンドリングパス（catch 分岐、一時ファイルクリーンアップ処理）
- EHE-05〜EHE-06: メタデータバリデーション関数内の name 長チェック分岐（`name.length > 200`）
- EHE-07〜EHE-08: メタデータバリデーション関数内の tags 件数チェック分岐（`tags.length > 10`）
- EHE-09〜EHE-12: メタデータバリデーション関数内の license SPDX チェック分岐
- EHE-13〜EHE-17: `shareSkill()` / `deprecate()` 内の権限チェック分岐
- Phase 7 では EHE-03 のロールバックパス（finally ブロック内のクリーンアップ処理）が Line Coverage に反映されていることを重点確認する
