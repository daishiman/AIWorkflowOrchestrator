# 公開レベルメタデータ テスト仕様書

## メタ情報

| 項目       | 内容                                                        |
| ---------- | ----------------------------------------------------------- |
| 文書       | Phase 4 - タスク1 成果物                                    |
| タスクID   | TASK-SKILL-LIFECYCLE-08                                     |
| 作成日     | 2026-03-17                                                  |
| 設計参照   | `outputs/phase-2/publishing-metadata-design.md`             |
| 受入基準   | AC-1                                                        |
| テスト対象 | `SkillVisibility` 型バリデーション・StateChart 遷移ロジック |

---

## 1. 概要

本テスト仕様書は `SkillVisibility` 型バリデーション、`SkillPublishingMetadata` インターフェースの各公開レベル必須フィールドバリデーション、および StateChart の昇格・降格遷移を検証するテストケースを定義する。

Phase 2 設計書 (`publishing-metadata-design.md`) のセクション 2〜3 で定義された型定義・StateChart が実装通りに動作することを保証する。

---

## 2. テストケース一覧テーブル

### 2.1 SkillVisibility 型バリデーション

| ID      | テスト名                                                      | 入力                     | 期待出力                                                  | 検証条件                                 |
| ------- | ------------------------------------------------------------- | ------------------------ | --------------------------------------------------------- | ---------------------------------------- |
| PUB-V-1 | 有効値 "local" が受け入れられる                               | `visibility = "local"`   | バリデーション成功（エラーなし）                          | `isValidVisibility("local") === true`    |
| PUB-V-2 | 有効値 "team" が受け入れられる                                | `visibility = "team"`    | バリデーション成功（エラーなし）                          | `isValidVisibility("team") === true`     |
| PUB-V-3 | 有効値 "public" が受け入れられる                              | `visibility = "public"`  | バリデーション成功（エラーなし）                          | `isValidVisibility("public") === true`   |
| PUB-V-4 | 無効値 "private" がバリデーションエラーを返す                 | `visibility = "private"` | `{ success: false, error: { code: "VALIDATION_ERROR" } }` | `isValidVisibility("private") === false` |
| PUB-V-5 | 空文字列がバリデーションエラーを返す（P42 1段目）             | `visibility = ""`        | `{ success: false, error: { code: "VALIDATION_ERROR" } }` | `isValidVisibility("") === false`        |
| PUB-V-6 | null がバリデーションエラーを返す                             | `visibility = null`      | `{ success: false, error: { code: "VALIDATION_ERROR" } }` | `isValidVisibility(null) === false`      |
| PUB-V-7 | undefined がバリデーションエラーを返す                        | `visibility = undefined` | `{ success: false, error: { code: "VALIDATION_ERROR" } }` | `isValidVisibility(undefined) === false` |
| PUB-V-8 | スペースのみの文字列がバリデーションエラーを返す（P42 3段目） | `visibility = "   "`     | `{ success: false, error: { code: "VALIDATION_ERROR" } }` | `isValidVisibility("   ") === false`     |

### 2.2 LocalMetadata 必須フィールドバリデーション（P42準拠3段バリデーション）

| ID       | テスト名                                                     | 入力                                                                                                 | 期待出力                                                                              | 検証条件                          |
| -------- | ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | --------------------------------- |
| PUB-L-1  | 正常系: 必須フィールド全て入力済み                           | `{ visibility: "local", name: "my-skill", description: "説明20文字以上ここです", version: "1.0.0" }` | バリデーション成功                                                                    | 全フィールドが非空かつ形式準拠    |
| PUB-L-2  | name が undefined の場合エラー（P42 1段目: 型チェック）      | `{ visibility: "local", name: undefined, ... }`                                                      | `{ success: false, error: { code: "VALIDATION_ERROR", message: "name は必須です" } }` | `typeof name !== "string"`        |
| PUB-L-3  | name が空文字列の場合エラー（P42 2段目: 空文字列チェック）   | `{ visibility: "local", name: "", ... }`                                                             | `{ success: false, error: { code: "VALIDATION_ERROR" } }`                             | `name === ""`                     |
| PUB-L-4  | name がスペースのみの場合エラー（P42 3段目: trim後空文字列） | `{ visibility: "local", name: "   ", ... }`                                                          | `{ success: false, error: { code: "VALIDATION_ERROR" } }`                             | `name.trim() === ""`              |
| PUB-L-5  | description が undefined の場合エラー                        | `{ visibility: "local", description: undefined, ... }`                                               | `{ success: false, error: { code: "VALIDATION_ERROR" } }`                             | `typeof description !== "string"` |
| PUB-L-6  | description が空文字列の場合エラー（P42 2段目）              | `{ visibility: "local", description: "", ... }`                                                      | `{ success: false, error: { code: "VALIDATION_ERROR" } }`                             | `description === ""`              |
| PUB-L-7  | description がスペースのみの場合エラー（P42 3段目）          | `{ visibility: "local", description: "  ", ... }`                                                    | `{ success: false, error: { code: "VALIDATION_ERROR" } }`                             | `description.trim() === ""`       |
| PUB-L-8  | version が semver 形式でない場合エラー                       | `{ visibility: "local", version: "not-semver", ... }`                                                | `{ success: false, error: { code: "VALIDATION_ERROR" } }`                             | semver 正規表現不一致             |
| PUB-L-9  | version が "1.0.0" で正常                                    | `{ visibility: "local", version: "1.0.0", ... }`                                                     | バリデーション成功                                                                    | `/^\d+\.\d+\.\d+/.test(version)`  |
| PUB-L-10 | version が "1.2.3-alpha.1" で正常（プレリリース）            | `{ visibility: "local", version: "1.2.3-alpha.1", ... }`                                             | バリデーション成功                                                                    | プレリリース記法が有効            |

### 2.3 TeamMetadata 必須フィールドバリデーション（P42準拠3段バリデーション）

| ID       | テスト名                                                   | 入力                                                                                                                                                  | 期待出力                                                  | 検証条件                     |
| -------- | ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- | ---------------------------- |
| PUB-T-1  | 正常系: team 必須フィールド全て入力済み                    | `{ visibility: "team", name: "...", description: "20文字以上の説明...", version: "1.0.0", author: "user-1", tags: ["tag1"], teamId: "team-abc-123" }` | バリデーション成功                                        | 全必須フィールド充足         |
| PUB-T-2  | author が undefined の場合エラー（P42 1段目）              | `{ visibility: "team", author: undefined, ... }`                                                                                                      | `{ success: false, error: { code: "VALIDATION_ERROR" } }` | `typeof author !== "string"` |
| PUB-T-3  | author が空文字列の場合エラー（P42 2段目）                 | `{ visibility: "team", author: "", ... }`                                                                                                             | `{ success: false, error: { code: "VALIDATION_ERROR" } }` | `author === ""`              |
| PUB-T-4  | author がスペースのみの場合エラー（P42 3段目）             | `{ visibility: "team", author: "   ", ... }`                                                                                                          | `{ success: false, error: { code: "VALIDATION_ERROR" } }` | `author.trim() === ""`       |
| PUB-T-5  | tags が空配列の場合エラー                                  | `{ visibility: "team", tags: [], ... }`                                                                                                               | `{ success: false, error: { code: "VALIDATION_ERROR" } }` | `tags.length === 0`          |
| PUB-T-6  | tags に空文字列要素が含まれる場合エラー                    | `{ visibility: "team", tags: ["valid", ""], ... }`                                                                                                    | `{ success: false, error: { code: "VALIDATION_ERROR" } }` | 要素バリデーション失敗       |
| PUB-T-7  | tags にスペースのみの要素が含まれる場合エラー（P42 3段目） | `{ visibility: "team", tags: ["valid", "  "], ... }`                                                                                                  | `{ success: false, error: { code: "VALIDATION_ERROR" } }` | 要素 trim 後空文字列         |
| PUB-T-8  | tags が11件以上の場合エラー                                | `{ visibility: "team", tags: ["t1","t2","t3","t4","t5","t6","t7","t8","t9","t10","t11"], ... }`                                                       | `{ success: false, error: { code: "VALIDATION_ERROR" } }` | `tags.length > 10`           |
| PUB-T-9  | teamId が undefined の場合エラー（P42 1段目）              | `{ visibility: "team", teamId: undefined, ... }`                                                                                                      | `{ success: false, error: { code: "VALIDATION_ERROR" } }` | `typeof teamId !== "string"` |
| PUB-T-10 | teamId が空文字列の場合エラー（P42 2段目）                 | `{ visibility: "team", teamId: "", ... }`                                                                                                             | `{ success: false, error: { code: "VALIDATION_ERROR" } }` | `teamId === ""`              |
| PUB-T-11 | teamId がスペースのみの場合エラー（P42 3段目）             | `{ visibility: "team", teamId: "   ", ... }`                                                                                                          | `{ success: false, error: { code: "VALIDATION_ERROR" } }` | `teamId.trim() === ""`       |

### 2.4 PublicMetadata 必須フィールドバリデーション（P42準拠3段バリデーション）

| ID      | テスト名                                        | 入力                                                                                                                                                 | 期待出力                                                  | 検証条件                      |
| ------- | ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- | ----------------------------- |
| PUB-P-1 | 正常系: public 必須フィールド全て入力済み       | `{ visibility: "public", ...<team全必須フィールド>, license: "MIT", readme: "100文字以上の説明...", changelog: "変更履歴", minAppVersion: "2.0.0" }` | バリデーション成功                                        | 全必須フィールド充足          |
| PUB-P-2 | license が undefined の場合エラー（P42 1段目）  | `{ visibility: "public", license: undefined, ... }`                                                                                                  | `{ success: false, error: { code: "VALIDATION_ERROR" } }` | `typeof license !== "string"` |
| PUB-P-3 | license が空文字列の場合エラー（P42 2段目）     | `{ visibility: "public", license: "", ... }`                                                                                                         | `{ success: false, error: { code: "VALIDATION_ERROR" } }` | `license === ""`              |
| PUB-P-4 | license がスペースのみの場合エラー（P42 3段目） | `{ visibility: "public", license: "   ", ... }`                                                                                                      | `{ success: false, error: { code: "VALIDATION_ERROR" } }` | `license.trim() === ""`       |
| PUB-P-5 | readme が undefined の場合エラー（P42 1段目）   | `{ visibility: "public", readme: undefined, ... }`                                                                                                   | `{ success: false, error: { code: "VALIDATION_ERROR" } }` | `typeof readme !== "string"`  |
| PUB-P-6 | readme が空文字列の場合エラー（P42 2段目）      | `{ visibility: "public", readme: "", ... }`                                                                                                          | `{ success: false, error: { code: "VALIDATION_ERROR" } }` | `readme === ""`               |
| PUB-P-7 | readme がスペースのみの場合エラー（P42 3段目）  | `{ visibility: "public", readme: "   ", ... }`                                                                                                       | `{ success: false, error: { code: "VALIDATION_ERROR" } }` | `readme.trim() === ""`        |
| PUB-P-8 | changelog が空文字列の場合エラー                | `{ visibility: "public", changelog: "", ... }`                                                                                                       | `{ success: false, error: { code: "VALIDATION_ERROR" } }` | `changelog === ""`            |
| PUB-P-9 | minAppVersion が semver 形式でない場合エラー    | `{ visibility: "public", minAppVersion: "2.x", ... }`                                                                                                | `{ success: false, error: { code: "VALIDATION_ERROR" } }` | semver 正規表現不一致         |

### 2.5 StateChart 遷移テスト

| ID        | テスト名                                                      | 入力状態   | 遷移条件                                                            | 期待出力状態           | 検証条件                                                     |
| --------- | ------------------------------------------------------------- | ---------- | ------------------------------------------------------------------- | ---------------------- | ------------------------------------------------------------ |
| PUB-SC-1  | 昇格正常系: local → team（全条件充足）                        | `S_LOCAL`  | team 昇格条件 1〜7 全て充足、互換性チェック PASS                    | `S_TEAM`               | 遷移後 `visibility === "team"`                               |
| PUB-SC-2  | 昇格異常系: local → team で name が空の場合ブロック           | `S_LOCAL`  | `name = ""` でその他条件は充足                                      | 遷移ブロック（エラー） | `{ success: false, error: { code: "VALIDATION_ERROR" } }`    |
| PUB-SC-3  | 昇格異常系: local → team で teamId が欠如している場合ブロック | `S_LOCAL`  | `teamId = undefined` でその他条件は充足                             | 遷移ブロック（エラー） | `{ success: false, error: { code: "VALIDATION_ERROR" } }`    |
| PUB-SC-4  | 昇格異常系: local → team で tags が空配列の場合ブロック       | `S_LOCAL`  | `tags = []` でその他条件は充足                                      | 遷移ブロック（エラー） | `{ success: false, error: { code: "VALIDATION_ERROR" } }`    |
| PUB-SC-5  | 昇格正常系: team → public（全条件充足、SafetyGate 承認済み）  | `S_TEAM`   | public 昇格条件 1〜8 全て充足、`safetyGateApproval.approved = true` | `S_PUBLIC`             | 遷移後 `visibility === "public"`                             |
| PUB-SC-6  | 昇格異常系: team → public で license が空文字列の場合ブロック | `S_TEAM`   | `license = ""` でその他条件は充足                                   | 遷移ブロック（エラー） | `{ success: false, error: { code: "VALIDATION_ERROR" } }`    |
| PUB-SC-7  | 昇格異常系: team → public で SafetyGate 未承認の場合ブロック  | `S_TEAM`   | `safetyGateApproval.approved = false` でその他条件は充足            | 遷移ブロック（エラー） | `{ success: false, error: { code: "SAFETY_GATE_BLOCKED" } }` |
| PUB-SC-8  | 降格正常系: team → local（作成者が明示的に取り下げ）          | `S_TEAM`   | `requestorRole = "author"`, `unshareAction = "demote_to_local"`     | `S_LOCAL`              | 遷移後 `visibility === "local"`                              |
| PUB-SC-9  | 降格正常系: team → local（teamId が無効化された場合）         | `S_TEAM`   | `teamIdValidationResult.valid = false`                              | `S_LOCAL`              | 遷移後 `visibility === "local"`                              |
| PUB-SC-10 | 降格正常系: public → deprecated（作成者が通常取り下げ申請）   | `S_PUBLIC` | `requestorRole = "author"`, `unpublishAction = "request_approval"`  | `S_DEPRECATED`         | 遷移後 `visibility === "team"` かつ deprecated バッジ表示    |
| PUB-SC-11 | 降格正常系: public → local（P1インシデント緊急取り下げ）      | `S_PUBLIC` | `incidentLevel = "P1"`                                              | `S_LOCAL`              | 遷移後 `visibility === "local"`（S_TEAM をスキップ）         |
| PUB-SC-12 | 降格正常系: public → local（P2インシデント緊急取り下げ）      | `S_PUBLIC` | `incidentLevel = "P2"`                                              | `S_LOCAL`              | 遷移後 `visibility === "local"`（S_TEAM をスキップ）         |

---

## 3. モックデータ定義

### 3.1 正常系モック（最小有効データ）

```typescript
// LOCAL レベル最小有効メタデータ
const validLocalMetadata = {
  visibility: "local" as const,
  name: "my-skill",
  description: "これは20文字以上の説明テキストです。",
  version: "1.0.0",
};

// TEAM レベル最小有効メタデータ
const validTeamMetadata = {
  visibility: "team" as const,
  name: "my-team-skill",
  description: "これは20文字以上の説明テキストです。",
  version: "1.0.0",
  author: "user-abc-123",
  tags: ["analysis", "data"],
  teamId: "team-xyz-456",
};

// PUBLIC レベル最小有効メタデータ
const validPublicMetadata = {
  visibility: "public" as const,
  name: "my-public-skill",
  description: "これは20文字以上の説明テキストです。",
  version: "1.0.0",
  author: "user-abc-123",
  tags: ["analysis", "data"],
  teamId: "team-xyz-456",
  license: "MIT",
  readme:
    "# My Skill\n\n100文字以上のREADMEコンテンツ。このスキルは分析タスクを自動化します。詳細な説明を追記してください。",
  changelog: "## 1.0.0\n\n- 初期リリース",
  minAppVersion: "2.0.0",
};

// SafetyGate 承認済みモック
const approvedSafetyGate = {
  approved: true,
};

// 互換性チェック PASS モック
const compatibilityPassed = {
  passed: true,
  level: "compatible" as const,
};
```

### 3.2 異常系モック

```typescript
// P42 バリデーション違反パターン（全文字列フィールド共通）
const invalidStringPatterns = {
  undefined: undefined,
  null: null,
  empty: "",
  whitespace: "   ",
  tabOnly: "\t",
  newlineOnly: "\n",
};

// 無効な visibility 値
const invalidVisibilityValues = ["private", "protected", "admin", ""];

// 無効な semver 文字列
const invalidSemverStrings = ["not-semver", "1.0", "1.0.0.0", "v1.0.0", ""];

// 空の tags 配列
const emptyTagsArray: string[] = [];

// 11件超の tags 配列（最大10件を超過）
const tooManyTags = [
  "t1",
  "t2",
  "t3",
  "t4",
  "t5",
  "t6",
  "t7",
  "t8",
  "t9",
  "t10",
  "t11",
];
```

---

## 4. 正常系テスト詳細

### 4.1 SkillVisibility 型 - 正常系

**テスト ID: PUB-V-1, PUB-V-2, PUB-V-3**

```
前提条件:
  - SkillVisibility 型は "local" | "team" | "public" のユニオン型
  - isValidVisibility(value) 関数が型チェックを実施する

実行手順:
  1. isValidVisibility("local") を呼び出す
  2. isValidVisibility("team") を呼び出す
  3. isValidVisibility("public") を呼び出す

期待結果:
  - 全て true を返す
  - エラーが発生しない

後処理:
  - テスト間の状態共有なし（P9 対策: テスト独立）
```

### 4.2 LocalMetadata - 正常系

**テスト ID: PUB-L-1, PUB-L-9, PUB-L-10**

```
前提条件:
  - validLocalMetadata モックを使用
  - validatePublishingMetadata(metadata) 関数が存在する

実行手順:
  1. validatePublishingMetadata(validLocalMetadata) を呼び出す
  2. version に "1.0.0" を設定して検証
  3. version に "1.2.3-alpha.1" を設定して検証

期待結果:
  - 戻り値は { valid: true } または エラーなし
  - 全必須フィールドが充足されていることが確認できる

後処理:
  - テスト間の状態共有なし（P9 対策）
```

### 4.3 StateChart 昇格遷移 - 正常系

**テスト ID: PUB-SC-1, PUB-SC-5**

```
前提条件:
  - validLocalMetadata / validTeamMetadata モックを使用
  - approvedSafetyGate, compatibilityPassed モックを使用
  - transitionVisibility(current, target, conditions) 関数が存在する

実行手順 (PUB-SC-1: local → team):
  1. conditions = { metadata: validTeamMetadata, compatibilityResult: compatibilityPassed }
  2. transitionVisibility("local", "team", conditions) を呼び出す
  3. 戻り値の visibility が "team" であることを確認する

実行手順 (PUB-SC-5: team → public):
  1. conditions = { metadata: validPublicMetadata, safetyGateApproval: approvedSafetyGate, ... }
  2. transitionVisibility("team", "public", conditions) を呼び出す
  3. 戻り値の visibility が "public" であることを確認する

期待結果:
  - 遷移後の visibility が目的のレベルになっている
  - エラーが発生しない

後処理:
  - テスト間の状態共有なし（P9 対策）
```

---

## 5. 異常系テスト詳細

### 5.1 SkillVisibility 型 - 異常系（P42 準拠3段バリデーション）

**テスト ID: PUB-V-4 〜 PUB-V-8**

```
前提条件:
  - isValidVisibility(value) 関数が 3 段バリデーションを実施する

実行手順:
  1. 各無効値（"private", "", null, undefined, "   "）で呼び出す
  2. 戻り値が false であることを確認する
  3. エラー情報に code: "VALIDATION_ERROR" が含まれることを確認する

期待結果:
  - 全て false を返す
  - P60 準拠: エラーは result.error.code でアサーション
    expect(result.success).toBe(false)
    expect(result.error.code).toBe("VALIDATION_ERROR")

後処理:
  - テスト間の状態共有なし（P9 対策）
```

### 5.2 LocalMetadata - P42 準拠3段バリデーション

**テスト ID: PUB-L-2 〜 PUB-L-8**

```
前提条件:
  - P42 準拠: 全文字列引数に3段バリデーションを実施する
    段1: typeof value !== "string"
    段2: value === ""
    段3: value.trim() === ""

実行手順 (name の3段バリデーション例):
  - validateMetadataField("name", undefined) → VALIDATION_ERROR（段1）
  - validateMetadataField("name", "")         → VALIDATION_ERROR（段2）
  - validateMetadataField("name", "   ")      → VALIDATION_ERROR（段3）

期待結果 (P60 準拠アサーション):
  expect(result.success).toBe(false)
  expect(result.error.code).toBe("VALIDATION_ERROR")
  expect(result.error.message).toContain("name")

後処理:
  - テスト間の状態共有なし（P9 対策）
```

### 5.3 StateChart 遷移 - 異常系

**テスト ID: PUB-SC-2 〜 PUB-SC-4, PUB-SC-6 〜 PUB-SC-7**

```
前提条件:
  - 各異常パターンごとに独立したテストを実施する

実行手順 (PUB-SC-2: local → team で name が空):
  1. metadata = { ...validTeamMetadata, name: "" }
  2. transitionVisibility("local", "team", { metadata, ... }) を呼び出す
  3. 遷移がブロックされることを確認する

実行手順 (PUB-SC-7: team → public で SafetyGate 未承認):
  1. conditions = { ..., safetyGateApproval: { approved: false } }
  2. transitionVisibility("team", "public", conditions) を呼び出す
  3. エラーコードが "SAFETY_GATE_BLOCKED" であることを確認する

期待結果 (P60 準拠アサーション):
  expect(result.success).toBe(false)
  expect(result.error.code).toBe("VALIDATION_ERROR") // または "SAFETY_GATE_BLOCKED"

後処理:
  - beforeEach でリセット（テスト間の状態共有なし, P9 対策）
```

---

## 6. Phase 2 設計書との対応（トレーサビリティ）

| テスト ID        | Phase 2 設計書参照箇所                                                 | 検証する設計要件                                         |
| ---------------- | ---------------------------------------------------------------------- | -------------------------------------------------------- |
| PUB-V-1〜V-3     | `publishing-metadata-design.md` §2.1 SkillVisibility 型定義            | 有効な3値（local/team/public）のみ受け付ける             |
| PUB-V-4〜V-8     | `publishing-metadata-design.md` §2.3 バリデーション型                  | P42 準拠の3段バリデーション                              |
| PUB-L-1〜L-10    | `publishing-metadata-design.md` §2.2 LocalMetadata インターフェース    | local レベルの必須フィールド（name/description/version） |
| PUB-T-1〜T-11    | `publishing-metadata-design.md` §2.2 TeamMetadata インターフェース     | team レベルの追加必須フィールド（author/tags/teamId）    |
| PUB-P-1〜P-9     | `publishing-metadata-design.md` §2.2 PublicMetadata インターフェース   | public レベルの追加必須フィールド（license/readme 等）   |
| PUB-SC-1〜SC-5   | `publishing-metadata-design.md` §3.2〜3.3 StateChart 遷移条件          | 昇格遷移の正常系（全条件充足時）                         |
| PUB-SC-2〜SC-4   | `publishing-metadata-design.md` §3.2 昇格遷移条件（S_LOCAL→S_TEAM）    | 必須フィールド未入力時の遷移ブロック                     |
| PUB-SC-6〜SC-7   | `publishing-metadata-design.md` §3.2 昇格遷移条件（S_TEAM→S_PUBLIC）   | license 未入力・SafetyGate 未承認時の遷移ブロック        |
| PUB-SC-8〜SC-9   | `publishing-metadata-design.md` §3.3 降格遷移（S_TEAM→S_LOCAL）        | 作成者操作・teamId 無効化時の降格                        |
| PUB-SC-10        | `publishing-metadata-design.md` §3.3 降格遷移（S_PUBLIC→S_DEPRECATED） | 通常取り下げ申請後の deprecated 遷移                     |
| PUB-SC-11〜SC-12 | `publishing-metadata-design.md` §3.3 降格遷移（S_PUBLIC→S_LOCAL 緊急） | P1/P2 インシデント時の緊急降格（S_TEAM スキップ）        |

---

## 7. 完了条件チェックリスト

- [ ] SkillVisibility 型の有効値3件（PUB-V-1〜V-3）が定義されている
- [ ] SkillVisibility 型の無効値テスト（PUB-V-4〜V-8）が定義されている
- [ ] local レベルの P42 準拠3段バリデーションテスト（PUB-L-2〜L-4, L-5〜L-7）が定義されている
- [ ] team レベルの P42 準拠3段バリデーションテスト（PUB-T-2〜T-4, T-7, T-9〜T-11）が定義されている
- [ ] public レベルの P42 準拠3段バリデーションテスト（PUB-P-2〜P-9）が定義されている
- [ ] StateChart 昇格正常系3パス（local→team, team→public）が定義されている
- [ ] StateChart 昇格異常系（必須フィールド欠如、SafetyGate 未承認）が定義されている
- [ ] StateChart 降格正常系（team→local x2, public→deprecated, public→local 緊急 x2）が定義されている
- [ ] IPC レスポンスのアサーションは `result.error.code` 形式（P60 準拠）
- [ ] テスト間の状態共有なし（P9 対策 → beforeEach でリセット）
