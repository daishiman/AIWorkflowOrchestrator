# Phase 2: 設計 — name/description 空フィールドガード追加

## メタ情報

| 項目               | 値                                                                               |
| ------------------ | -------------------------------------------------------------------------------- |
| タスクID           | UT-IMP-QUICK-VALIDATE-EMPTY-FIELD-GUARD-001                                      |
| Phase              | 2 — 設計                                                                         |
| 機能名             | quick_validate.js name/description 空フィールドガード                            |
| 作成日             | 2026-02-27                                                                       |
| 前提Phase          | Phase 1（要件定義）                                                              |
| 目的               | P42 準拠の3段バリデーション実装方針とテストケース設計を行う                      |
| 成果物ディレクトリ | `docs/30-workflows/completed-tasks/ut-imp-quick-validate-empty-field-guard-001/` |

## 目的

Phase 1 で定義した機能要件（FR-1, FR-2, FR-3）と受け入れ基準（AC-1 〜 AC-15）を満たすための詳細設計を行う。修正箇所の特定、バリデーションロジックの設計、エラーメッセージの定義、テストケースの設計を行う。

## 実行タスク

- 修正箇所設計: `validateSkill()` の name/description 検証ブロックを設計する
- バリデーション設計: `typeof` / 空文字 / `trim()` の3段チェックを定義する
- エラーメッセージ設計: 既存メッセージとの互換と追加メッセージを定義する
- テスト設計: エッジケースを含むテストケース一覧を作成する
- フィクスチャ設計: YAML型変換を考慮した入力パターンを定義する

## 参照資料

| 種別       | 資料名                                    | パス                                                                                |
| ---------- | ----------------------------------------- | ----------------------------------------------------------------------------------- |
| 前提       | Phase 1 要件定義                          | `phase-1-requirements.md`                                                           |
| ルール     | P42: .trim() バリデーション漏れ           | `.claude/rules/06-known-pitfalls.md#P42`                                            |
| 仕様       | claude-code-skills-structure.md           | `.claude/skills/aiworkflow-requirements/references/claude-code-skills-structure.md` |
| 仕様       | claude-code-skills-process.md             | `.claude/skills/aiworkflow-requirements/references/claude-code-skills-process.md`   |
| 仕様       | error-handling.md（Validation Error分類） | `.claude/skills/aiworkflow-requirements/references/error-handling.md`               |
| 仕様       | security-input-validation.md（型強制）    | `.claude/skills/aiworkflow-requirements/references/security-input-validation.md`    |
| 対象コード | quick_validate.js                         | `.claude/skills/skill-creator/scripts/quick_validate.js`                            |
| 既存テスト | quick_validate.test.js                    | `.claude/skills/skill-creator/scripts/__tests__/quick_validate.test.js`             |

## 実行手順

### 1. 修正箇所の特定

#### 1.1 修正対象: name フィールドバリデーション（L140-155）

**現在のコード:**

```javascript
// 4. name フィールドの検証
if (!frontmatter.name) {
  result.addError("name フィールドが存在しません");
} else {
  const name = frontmatter.name;
  if (name.length > 64) {
    result.addError(`name が 64 文字を超えています (${name.length}文字)`);
  } else if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(name)) {
    result.addError(`name がハイフンケースではありません: ${name}`);
  } else if (name !== skillName) {
    result.addWarning(
      `name (${name}) がディレクトリ名 (${skillName}) と一致しません`,
    );
  } else {
    result.addPassed(`name がハイフンケース: ${name}`);
  }
}
```

**修正後のコード（設計）:**

```javascript
// 4. name フィールドの検証（P42準拠3段バリデーション）
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
  if (name.length > 64) {
    result.addError(`name が 64 文字を超えています (${name.length}文字)`);
  } else if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(name)) {
    result.addError(`name がハイフンケースではありません: ${name}`);
  } else if (name !== skillName) {
    result.addWarning(
      `name (${name}) がディレクトリ名 (${skillName}) と一致しません`,
    );
  } else {
    result.addPassed(`name がハイフンケース: ${name}`);
  }
}
```

#### 1.2 修正対象: description フィールドバリデーション（L158-193）

**現在のコード:**

```javascript
// 5. description フィールドの検証
if (!frontmatter.description) {
  result.addError("description フィールドが存在しません");
} else {
  const desc = frontmatter.description;
  if (desc.length > 1024) {
    /* ... */
  }
  if (desc.includes("<") || desc.includes(">")) {
    /* ... */
  }
  if (!desc.includes("Anchors:") && !desc.includes("•")) {
    /* ... */
  }
  if (!desc.toLowerCase().includes("use when")) {
    /* ... */
  }
}
```

**修正後のコード（設計）:**

```javascript
// 5. description フィールドの検証（P42準拠3段バリデーション）
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
  if (desc.length > 1024) {
    result.addError(
      `description が 1024 文字を超えています (${desc.length}文字)`,
    );
  } else {
    result.addPassed(`description が 1024 文字以内 (${desc.length}文字)`);
  }
  if (desc.includes("<") || desc.includes(">")) {
    result.addError("description に角括弧 (<>) が含まれています");
  }
  if (!desc.includes("Anchors:") && !desc.includes("•")) {
    result.addWarning(
      "description に Anchors が含まれていない可能性があります",
    );
  } else {
    result.addPassed("description に Anchors が含まれている");
  }
  if (!desc.toLowerCase().includes("use when") && !desc.includes("Trigger:")) {
    result.addWarning(
      "description に Trigger が含まれていない可能性があります",
    );
  } else {
    result.addPassed("description に Trigger が含まれている");
  }
}
```

### 2. 3段バリデーション設計

P42 準拠の3段バリデーションパターン:

```
Step 1: typeof チェック   → 非文字列型を早期拒否
Step 2: 空文字チェック    → "" を拒否
Step 3: trim() チェック   → スペースのみ文字列を拒否
```

**判定フローチャート:**

```
frontmatter.name / frontmatter.description
  │
  ├─ typeof !== "string"
  │   ├─ == null (undefined/null) → "〜が存在しません"
  │   └─ else (数値/boolean/obj)  → "〜が文字列ではありません"
  │
  ├─ === "" → "〜が存在しません" (既存メッセージ互換)
  │
  ├─ .trim() === "" → "〜が空です" (スペースのみ)
  │
  └─ else → 既存バリデーションロジックへ進む
```

**設計判断:**

- `undefined` / `null` / `""` の場合は既存の「〜が存在しません」メッセージを維持（NFR-1 後方互換性）
- スペースのみ文字列は新メッセージ「〜が空です」（既存と区別可能に）
- 非文字列型は新メッセージ「〜が文字列ではありません」（型エラーを明示）

### 3. エラーメッセージ設計

| 入力値                  | name エラーメッセージ                 | description エラーメッセージ                 |
| ----------------------- | ------------------------------------- | -------------------------------------------- |
| `undefined`             | name フィールドが存在しません         | description フィールドが存在しません         |
| `null`                  | name フィールドが存在しません         | description フィールドが存在しません         |
| `""`（空文字）          | name フィールドが存在しません         | description フィールドが存在しません         |
| `"   "`（スペースのみ） | name フィールドが空です               | description フィールドが空です               |
| `123`（数値）           | name フィールドが文字列ではありません | description フィールドが文字列ではありません |
| `true`（boolean）       | name フィールドが文字列ではありません | description フィールドが文字列ではありません |
| `{}`（オブジェクト）    | name フィールドが文字列ではありません | description フィールドが文字列ではありません |
| `[]`（配列）            | name フィールドが文字列ではありません | description フィールドが文字列ではありません |

### 4. テストケース設計

#### 4.1 新規テストケース（Phase 4 で作成）

| テストID   | 入力              | 期待する動作                                                        | 受け入れ基準 |
| ---------- | ----------------- | ------------------------------------------------------------------- | ------------ |
| TC-EFG-001 | name: `undefined` | エラー「name フィールドが存在しません」、終了コード4                | AC-1         |
| TC-EFG-002 | name: `null`      | エラー「name フィールドが存在しません」、終了コード4                | AC-2         |
| TC-EFG-003 | name: `""`        | エラー「name フィールドが存在しません」、終了コード4                | AC-3         |
| TC-EFG-004 | name: `"   "`     | エラー「name フィールドが空です」、終了コード4                      | AC-4         |
| TC-EFG-005 | name: `123`       | エラー「name フィールドが文字列ではありません」、終了コード4        | AC-5         |
| TC-EFG-006 | name: `true`      | エラー「name フィールドが文字列ではありません」、終了コード4        | AC-6         |
| TC-EFG-007 | desc: `undefined` | エラー「description フィールドが存在しません」、終了コード4         | AC-8         |
| TC-EFG-008 | desc: `""`        | エラー「description フィールドが存在しません」、終了コード4         | AC-9         |
| TC-EFG-009 | desc: `"   "`     | エラー「description フィールドが空です」、終了コード4               | AC-10        |
| TC-EFG-010 | desc: `123`       | エラー「description フィールドが文字列ではありません」、終了コード4 | AC-11        |
| TC-EFG-011 | desc: `true`      | エラー「description フィールドが文字列ではありません」、終了コード4 | AC-12        |
| TC-EFG-012 | 正常 name + desc  | 既存バリデーション結果と同一、終了コード0                           | AC-13        |

#### 4.2 既存テスト更新

| テストID  | 変更内容                                              |
| --------- | ----------------------------------------------------- |
| TC-EC-004 | 緩いアサーション → 厳密な検証エラーアサーションに変更 |

#### 4.3 リグレッションテスト（既存テストの PASS 確認）

既存の全テストカテゴリ（TC-N-_, TC-E-_, TC-B-_, TC-OP-_, TC-WC-_, TC-RG-_, TC-EC-_, TC-IT-_）が PASS することを確認。

### 5. フィクスチャ設計

テストは YAML frontmatter を含むフィクスチャファイルを使用する。非文字列型のフィクスチャは YAML の型変換特性を利用する:

| フィクスチャ名             | SKILL.md の frontmatter 内容               | 目的                     |
| -------------------------- | ------------------------------------------ | ------------------------ |
| `empty-name-desc/`（既存） | `name: ""`、`description: ""`              | 空文字テスト（既存更新） |
| `numeric-name/`（新規）    | `name: 123`（YAML で数値として解釈）       | 数値型 name テスト       |
| `numeric-desc/`（新規）    | `name: valid-name`、`description: 123`     | 数値型 desc テスト       |
| `boolean-name/`（新規）    | `name: true`（YAML で boolean として解釈） | boolean 型 name テスト   |
| `whitespace-name/`（新規） | `name: "   "`                              | スペースのみ name テスト |
| `whitespace-desc/`（新規） | `name: valid-name`、`description: "   "`   | スペースのみ desc テスト |

**YAML 型変換の注意点:**

- YAML では `name: 123` は数値として、`name: true` は boolean としてパースされる
- `name: "123"` と `name: 123` は異なる型になる
- `parseFrontmatter()` がこの型変換をそのまま返すことを前提とする

### 6. 変更影響の整理

| ファイル                            | 変更種別        | 変更行数（見積もり） |
| ----------------------------------- | --------------- | -------------------- |
| `quick_validate.js`                 | 修正            | +20行, -4行          |
| `quick_validate.test.js`            | 追加 + 既存更新 | +80行                |
| `fixtures/numeric-name/SKILL.md`    | 新規作成        | 10行                 |
| `fixtures/numeric-desc/SKILL.md`    | 新規作成        | 10行                 |
| `fixtures/boolean-name/SKILL.md`    | 新規作成        | 10行                 |
| `fixtures/whitespace-name/SKILL.md` | 新規作成        | 10行                 |
| `fixtures/whitespace-desc/SKILL.md` | 新規作成        | 10行                 |
| `fixtures/empty-name-desc/SKILL.md` | 変更なし        | 0行                  |

**合計見積もり:** 修正 +100行, -4行

## 統合テスト連携

このタスクは独立した Node.js スクリプトの修正であり、他のモジュールとの統合テストは不要。
リグレッションテスト（TC-RG-001 〜 TC-RG-003）で既存スキルとの互換性を確認する。

## 多角的チェック観点

| 観点                   | 確認事項                                                               | 結果 |
| ---------------------- | ---------------------------------------------------------------------- | ---- |
| P42 準拠               | 3段バリデーション（typeof → 空文字 → trim()）が適用されている          | OK   |
| 後方互換性             | undefined/null/空文字は既存メッセージ「〜が存在しません」を維持        | OK   |
| エラーメッセージ一貫性 | 新メッセージが既存フォーマットに準拠（日本語、具体的）                 | OK   |
| YAML 型変換対応        | parseFrontmatter() の返す非文字列型を正しく処理                        | OK   |
| テストカバレッジ       | 全エッジケース（undefined, null, "", " ", 数値, boolean, obj）をカバー | OK   |
| 既存テスト影響         | TC-EC-004 の更新のみ、他テストは変更不要                               | OK   |
| Electron 層            | 非該当                                                                 | N/A  |
| IPC                    | 非該当                                                                 | N/A  |

## 成果物

| 成果物 | パス                                  |
| ------ | ------------------------------------- |
| 設計書 | `phase-2-design.md`（本ドキュメント） |

## 完了条件

- [ ] 修正箇所（name: L140-155, description: L158-193）が特定されている
- [ ] 3段バリデーションの判定フローが定義されている
- [ ] エラーメッセージが全入力パターンに対して定義されている
- [ ] テストケース（TC-EFG-001 〜 TC-EFG-012）が設計されている
- [ ] フィクスチャの一覧と内容が設計されている
- [ ] 変更影響（行数見積もり）が整理されている
- [ ] 後方互換性の維持方針が明確

## 次の Phase

Phase 3（設計レビュー）へ進む。

- Phase 1（要件）と Phase 2（設計）の整合性検証
- P42 準拠バリデーションパターンの適用確認
- 既存機能への影響評価
