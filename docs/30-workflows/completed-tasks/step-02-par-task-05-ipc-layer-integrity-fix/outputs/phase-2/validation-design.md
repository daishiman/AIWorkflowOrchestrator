# Phase 2: バリデーション設計（P42準拠パターン集）

## メタ情報

| 項目     | 内容                                     |
| -------- | ---------------------------------------- |
| タスクID | TASK-IMP-IPC-LAYER-INTEGRITY-FIX-001     |
| Phase    | 2 — 設計（バリデーション詳細）           |
| 作成日   | 2026-03-19                               |
| 参照     | `.claude/rules/06-known-pitfalls.md` P42 |

## P42準拠3段バリデーションパターン

P42の教訓: `typeof === "string"` と `=== ""` のみでは、スペースのみ（`"   "`）がすり抜ける。

```typescript
// 標準パターン（全文字列引数に適用）
if (typeof value !== "string" || value === "" || value.trim() === "") {
  throw {
    code: "VALIDATION_ERROR",
    message: "fieldName must be a non-empty string",
  };
}
```

3段の意味:

1. `typeof value !== "string"` — undefined / null / 数値 / オブジェクト等を排除
2. `value === ""` — 明示的な空文字列を排除（高速チェック）
3. `value.trim() === ""` — スペースのみ入力を排除（P42本質チェック）

---

## SKILL_UPDATE ハンドラのバリデーション設計

### フィールド: `args.skillName`（必須文字列）

```typescript
if (
  typeof args?.skillName !== "string" ||
  args.skillName === "" ||
  args.skillName.trim() === ""
) {
  throw {
    code: "VALIDATION_ERROR",
    message: "skillName must be a non-empty string",
  };
}
```

**テストケース（全パターン）**:

| 入力値            | 期待結果                           |
| ----------------- | ---------------------------------- |
| `undefined`       | VALIDATION_ERROR throw             |
| `null`            | VALIDATION_ERROR throw             |
| `123`             | VALIDATION_ERROR throw             |
| `{}`              | VALIDATION_ERROR throw             |
| `""`              | VALIDATION_ERROR throw             |
| `"   "`           | VALIDATION_ERROR throw（P42本質）  |
| `"\t"`            | VALIDATION_ERROR throw             |
| `"valid-skill"`   | バリデーション通過                 |
| `" valid-skill "` | バリデーション通過（trim後に処理） |

### フィールド: `args` 全体（先行チェック）

実装では `skillName` のチェック前に `args` 自体を検証する:

```typescript
if (args === null || typeof args !== "object" || Array.isArray(args)) {
  throw {
    code: "VALIDATION_ERROR",
    message: "payload must be a non-null object",
  };
}
```

### フィールド: `args.updates`（必須オブジェクト）

```typescript
if (updates === null || typeof updates !== "object" || Array.isArray(updates)) {
  throw {
    code: "VALIDATION_ERROR",
    message: "updates must be a non-null object",
  };
}
```

> 注: 実装では `updates` の型を `Record<string, unknown>` とし、`description`/`enabled` の個別フィールドチェックは SkillService 層に委譲する方式を採用した。

**テストケース**:

| 入力値                                   | 期待結果                                            |
| ---------------------------------------- | --------------------------------------------------- |
| `undefined`                              | VALIDATION_ERROR throw                              |
| `null`                                   | VALIDATION_ERROR throw                              |
| `"string"`                               | VALIDATION_ERROR throw                              |
| `123`                                    | VALIDATION_ERROR throw                              |
| `[]`                                     | VALIDATION_ERROR throw（配列は不可）                |
| `{}`                                     | バリデーション通過（空オブジェクトはOK — 更新なし） |
| `{ description: "..." }`                 | バリデーション通過                                  |
| `{ enabled: true }`                      | バリデーション通過                                  |
| `{ description: "...", enabled: false }` | バリデーション通過                                  |

### フィールド: `args.updates.description`（省略可能文字列）

```typescript
if (
  args.updates.description !== undefined &&
  (typeof args.updates.description !== "string" ||
    args.updates.description.trim() === "")
) {
  throw {
    code: "VALIDATION_ERROR",
    message: "description must be a non-empty string if provided",
  };
}
```

### フィールド: `args.updates.enabled`（省略可能boolean）

```typescript
if (
  args.updates.enabled !== undefined &&
  typeof args.updates.enabled !== "boolean"
) {
  throw {
    code: "VALIDATION_ERROR",
    message: "enabled must be a boolean if provided",
  };
}
```

---

## バリデーション順序（全体フロー）

```
skill:update invoke
  │
  ▼
1. validateIpcSender() — IPC送信元ウィンドウ検証
  │ FAIL → throw toIPCValidationError()
  ▼
2. args.skillName 3段バリデーション
  │ FAIL → throw VALIDATION_ERROR
  ▼
3. args.updates 型チェック
  │ FAIL → throw VALIDATION_ERROR
  ▼
4. args.updates.description（提供時のみ）
  │ FAIL → throw VALIDATION_ERROR
  ▼
5. args.updates.enabled（提供時のみ）
  │ FAIL → throw VALIDATION_ERROR
  ▼
6. skillService.updateSkill() 呼び出し
  │ throw → { success: false, error: sanitizedErrorMessage }
  ▼
7. return { success: true, data: undefined }
```

---

## 既存ハンドラのバリデーション比較

| ハンドラ                 | バリデーションパターン                                              | P42準拠                                    |
| ------------------------ | ------------------------------------------------------------------- | ------------------------------------------ |
| skill:get-detail（既存） | `typeof args?.skillId !== "string" \|\| args.skillId.trim() === ""` | 2段（`=== ""` 省略だが trim チェックあり） |
| skill:import（修正済み） | `typeof skillName !== "string" \|\| skillName.trim() === ""`        | 2段（P44解決済み）                         |
| skill:remove（修正済み） | `typeof skillName !== "string" \|\| skillName.trim() === ""`        | 2段（P44/P45解決済み）                     |
| skill:update（新規）     | 3段（型 → `=== ""` → `.trim() === ""`）                             | **完全準拠**                               |

新規ハンドラでは完全P42準拠（3段）を採用する。
