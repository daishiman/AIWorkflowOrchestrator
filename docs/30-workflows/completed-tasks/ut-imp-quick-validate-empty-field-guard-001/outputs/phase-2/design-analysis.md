# Phase 2 出力: 設計分析結果

## メタ情報

| 項目       | 値                                          |
| ---------- | ------------------------------------------- |
| タスクID   | UT-IMP-QUICK-VALIDATE-EMPTY-FIELD-GUARD-001 |
| Phase      | 2 — 設計                                    |
| 作成日     | 2026-02-27                                  |
| 参照仕様書 | `phase-2-design.md`                         |

## 1. 設計方針の確認

### P42 準拠3段バリデーション

設計書は `.claude/rules/06-known-pitfalls.md#P42` に準拠した3段バリデーションパターンを適用している。

| ステップ | チェック内容    | 実装方式                               | 確認結果 |
| -------- | --------------- | -------------------------------------- | -------- |
| Step 1   | typeof チェック | `typeof frontmatter.name !== "string"` | PASS     |
| Step 2   | 空文字チェック  | `frontmatter.name === ""`              | PASS     |
| Step 3   | trim() チェック | `frontmatter.name.trim() === ""`       | PASS     |

**設計の判定フロー:**

```
frontmatter.name / frontmatter.description
  │
  ├─ typeof !== "string"
  │   ├─ == null (undefined/null) → "〜が存在しません"（既存メッセージ互換）
  │   └─ else (数値/boolean/obj)  → "〜が文字列ではありません"（新メッセージ）
  │
  ├─ === "" → "〜が存在しません"（既存メッセージ互換）
  │
  ├─ .trim() === "" → "〜が空です"（新メッセージ）
  │
  └─ else → 既存バリデーションロジックへ進む
```

**設計判断の妥当性確認:**

- `undefined`/`null`/`""` は既存メッセージ「〜が存在しません」を維持（NFR-1 後方互換性を充足）
- スペースのみ文字列は新メッセージ「〜が空です」（既存と区別可能）
- 非文字列型は新メッセージ「〜が文字列ではありません」（型エラーを明示）

## 2. 修正箇所の特定

### L140: name フィールドバリデーション（L140-155）

**修正前（falsy チェック）:**

```javascript
if (!frontmatter.name) {
  result.addError("name フィールドが存在しません");
} else {
  const name = frontmatter.name;
  // name.length, .test(), name !== skillName
}
```

**修正後（P42準拠3段バリデーション）:**

```javascript
if (typeof frontmatter.name !== "string") {
  if (frontmatter.name == null) {
    result.addError("name フィールドが存在しません");
  } else {
    result.addError("name フィールドが文字列ではありません");
  }
} else if (frontmatter.name.trim() === "") {
  if (frontmatter.name === "") {
    result.addError("name フィールドが存在しません");
  } else {
    result.addError("name フィールドが空です");
  }
} else {
  const name = frontmatter.name;
  // 既存バリデーションロジック（変更なし）
}
```

**修正の意義:** `typeof` ガードが最初に評価されることで、非文字列型が else 分岐に到達して `.length`・`.test()` が予期しない動作をするリスクが排除される。

### L158: description フィールドバリデーション（L158-193）

**修正前（falsy チェック）:**

```javascript
if (!frontmatter.description) {
  result.addError("description フィールドが存在しません");
} else {
  const desc = frontmatter.description;
  if (desc.length > 1024) {
    /* ... */
  }
  if (desc.includes("<") || desc.includes(">")) {
    /* ... */
  } // ← 非文字列で TypeError
  if (!desc.includes("Anchors:") && !desc.includes("•")) {
    /* ... */
  } // ← 非文字列で TypeError
  if (!desc.toLowerCase().includes("use when")) {
    /* ... */
  } // ← 非文字列で TypeError
}
```

**修正後（P42準拠3段バリデーション）:**

```javascript
if (typeof frontmatter.description !== "string") {
  if (frontmatter.description == null) {
    result.addError("description フィールドが存在しません");
  } else {
    result.addError("description フィールドが文字列ではありません");
  }
} else if (frontmatter.description.trim() === "") {
  if (frontmatter.description === "") {
    result.addError("description フィールドが存在しません");
  } else {
    result.addError("description フィールドが空です");
  }
} else {
  const desc = frontmatter.description;
  // 既存バリデーションロジック（変更なし）
}
```

**修正の意義:** `typeof` ガードで非文字列型を早期拒否することで、`desc.includes()`・`desc.toLowerCase()` の TypeError が防止される。

## 3. エラーメッセージ設計の確認

| 入力値                  | name エラーメッセージ                 | description エラーメッセージ                 | 確認結果 |
| ----------------------- | ------------------------------------- | -------------------------------------------- | -------- |
| `undefined`             | name フィールドが存在しません         | description フィールドが存在しません         | PASS     |
| `null`                  | name フィールドが存在しません         | description フィールドが存在しません         | PASS     |
| `""`（空文字）          | name フィールドが存在しません         | description フィールドが存在しません         | PASS     |
| `"   "`（スペースのみ） | name フィールドが空です               | description フィールドが空です               | PASS     |
| `123`（数値）           | name フィールドが文字列ではありません | description フィールドが文字列ではありません | PASS     |
| `true`（boolean）       | name フィールドが文字列ではありません | description フィールドが文字列ではありません | PASS     |
| `{}`（オブジェクト）    | name フィールドが文字列ではありません | description フィールドが文字列ではありません | PASS     |
| `[]`（配列）            | name フィールドが文字列ではありません | description フィールドが文字列ではありません | PASS     |

**確認内容:** エラーメッセージは日本語・具体的・既存フォーマット準拠であり、NFR-5 を充足している。全入力パターンに対してメッセージが定義されており、漏れはない。

## 4. テストケース設計の確認

### 新規テストケース（TC-EFG-001〜TC-EFG-012）

| テストID   | 入力              | 期待動作                                                            | 対応AC | 確認結果 |
| ---------- | ----------------- | ------------------------------------------------------------------- | ------ | -------- |
| TC-EFG-001 | name: `undefined` | エラー「name フィールドが存在しません」、終了コード4                | AC-1   | PASS     |
| TC-EFG-002 | name: `null`      | エラー「name フィールドが存在しません」、終了コード4                | AC-2   | PASS     |
| TC-EFG-003 | name: `""`        | エラー「name フィールドが存在しません」、終了コード4                | AC-3   | PASS     |
| TC-EFG-004 | name: `"   "`     | エラー「name フィールドが空です」、終了コード4                      | AC-4   | PASS     |
| TC-EFG-005 | name: `123`       | エラー「name フィールドが文字列ではありません」、終了コード4        | AC-5   | PASS     |
| TC-EFG-006 | name: `true`      | エラー「name フィールドが文字列ではありません」、終了コード4        | AC-6   | PASS     |
| TC-EFG-007 | desc: `undefined` | エラー「description フィールドが存在しません」、終了コード4         | AC-8   | PASS     |
| TC-EFG-008 | desc: `""`        | エラー「description フィールドが存在しません」、終了コード4         | AC-9   | PASS     |
| TC-EFG-009 | desc: `"   "`     | エラー「description フィールドが空です」、終了コード4               | AC-10  | PASS     |
| TC-EFG-010 | desc: `123`       | エラー「description フィールドが文字列ではありません」、終了コード4 | AC-11  | PASS     |
| TC-EFG-011 | desc: `true`      | エラー「description フィールドが文字列ではありません」、終了コード4 | AC-12  | PASS     |
| TC-EFG-012 | 正常 name + desc  | 既存バリデーション結果と同一、終了コード0                           | AC-13  | PASS     |

**確認内容:** TC-EFG-001〜012 は AC-1〜AC-13 のすべてをカバーしている。ただし、AC-7（name オブジェクト `{}`）に対応するテストケースが Phase 2 設計の時点では TC-EFG-001〜012 に含まれていない（Phase 3 レビューで MINOR 指摘 M1 として検出）。

### 既存テスト更新

| テストID  | 変更内容                                              | 確認結果 |
| --------- | ----------------------------------------------------- | -------- |
| TC-EC-004 | 緩いアサーション → 厳密な検証エラーアサーションに変更 | PASS     |

**確認内容:** TC-EC-004 は現在「クラッシュまたはエラー」を許容する `/name.*存在しません|Error|エラー|not a function/` という緩いアサーションを使用している。修正後は「検証エラーとして明示的に返る」ことを厳密に検証するアサーションに変更される。

## 5. フィクスチャ設計の確認

| フィクスチャ名             | frontmatter 内容                           | 目的                     | 確認結果 |
| -------------------------- | ------------------------------------------ | ------------------------ | -------- |
| `empty-name-desc/`（既存） | `name: ""`、`description: ""`              | 空文字テスト（既存更新） | PASS     |
| `numeric-name/`（新規）    | `name: 123`（YAML で数値として解釈）       | 数値型 name テスト       | PASS     |
| `numeric-desc/`（新規）    | `name: valid-name`、`description: 123`     | 数値型 desc テスト       | PASS     |
| `boolean-name/`（新規）    | `name: true`（YAML で boolean として解釈） | boolean 型 name テスト   | PASS     |
| `whitespace-name/`（新規） | `name: "   "`                              | スペースのみ name テスト | PASS     |
| `whitespace-desc/`（新規） | `name: valid-name`、`description: "   "`   | スペースのみ desc テスト | PASS     |

**YAML 型変換の注意点（確認済み）:**

- YAML の `name: 123` は数値型として `parseFrontmatter()` から返される
- YAML の `name: true` は boolean 型として返される
- `name: "123"` と `name: 123` は異なる型になることを設計が正しく考慮している

## 6. 変更影響の確認

| ファイル                            | 変更種別        | 変更行数（見積もり） | 確認結果 |
| ----------------------------------- | --------------- | -------------------- | -------- |
| `quick_validate.js`                 | 修正            | +20行, -4行          | PASS     |
| `quick_validate.test.js`            | 追加 + 既存更新 | +80行                | PASS     |
| `fixtures/numeric-name/SKILL.md`    | 新規作成        | 10行                 | PASS     |
| `fixtures/numeric-desc/SKILL.md`    | 新規作成        | 10行                 | PASS     |
| `fixtures/boolean-name/SKILL.md`    | 新規作成        | 10行                 | PASS     |
| `fixtures/whitespace-name/SKILL.md` | 新規作成        | 10行                 | PASS     |
| `fixtures/whitespace-desc/SKILL.md` | 新規作成        | 10行                 | PASS     |
| `fixtures/empty-name-desc/SKILL.md` | 変更なし        | 0行                  | PASS     |

**合計見積もり:** +100行, -4行（小規模修正として妥当）

## 7. 多角的チェック観点の確認

| 観点                   | 確認事項                                                          | 結果 |
| ---------------------- | ----------------------------------------------------------------- | ---- |
| P42 準拠               | 3段バリデーション（typeof → 空文字 → trim()）が適用されている     | PASS |
| 後方互換性             | undefined/null/空文字は既存メッセージ「〜が存在しません」を維持   | PASS |
| エラーメッセージ一貫性 | 新メッセージが既存フォーマットに準拠（日本語、具体的）            | PASS |
| YAML 型変換対応        | `parseFrontmatter()` の返す非文字列型を正しく処理                 | PASS |
| テストカバレッジ       | 全エッジケース（undefined, null, "", " ", 数値, boolean）をカバー | PASS |
| 既存テスト影響         | TC-EC-004 の更新のみ、他テストは変更不要                          | PASS |
| Electron 層            | 非該当                                                            | N/A  |
| IPC                    | 非該当                                                            | N/A  |

## 8. 完了条件の充足確認

| チェック項目                                                      | 充足状況 |
| ----------------------------------------------------------------- | -------- |
| 修正箇所（name: L140-155、description: L158-193）が特定されている | PASS     |
| 3段バリデーションの判定フローが定義されている                     | PASS     |
| エラーメッセージが全入力パターンに対して定義されている            | PASS     |
| テストケース（TC-EFG-001〜TC-EFG-012）が設計されている            | PASS     |
| フィクスチャの一覧と内容が設計されている                          | PASS     |
| 変更影響（行数見積もり）が整理されている                          | PASS     |
| 後方互換性の維持方針が明確                                        | PASS     |

**総合評価:** Phase 2 の全完了条件を充足している。P42 準拠の3段バリデーションが name（L140）と description（L158）の両方の修正箇所に適用され、エラーメッセージ設計・テストケース設計・フィクスチャ設計が揃っている。Phase 3（設計レビュー）への移行条件を満たす。
