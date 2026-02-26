# Phase 8 可読性正規化ルール

## メタ情報

- タスクID: UT-FIX-SKILL-EXECUTE-INTERFACE-001
- Phase: 8（リファクタリング）
- 作成日: 2026-02-25
- 前提: Phase 8 refactoring-policy.md

## バリデーション記述統一（Task 8-2）

### P42準拠 3段バリデーション標準テンプレート

全ての文字列引数に対して以下の3段階チェックを適用する。

```typescript
// 標準テンプレート: 3段バリデーション
if (typeof value !== "string" || value.trim() === "") {
  throw {
    code: "VALIDATION_ERROR",
    message: "<fieldName> must be a non-empty string",
  };
}
```

注意: 実コードでは `typeof value !== "string"` で型チェックと空文字列チェックを兼ね、`value.trim() === ""` でトリム空文字列チェックを行う。`value === ""` の明示的チェックは `trim() === ""` に包含されるため省略可能。

### 実コードのバリデーションパターン

#### skillName パス（L240-L248）

```typescript
if (typeof args.skillName !== "string" || args.skillName.trim() === "") {
  throw {
    code: "VALIDATION_ERROR",
    message: "skillName must be a non-empty string",
  };
}
```

#### skillId パス（L249-L253）

```typescript
} else if (typeof args?.skillId !== "string" || args.skillId.trim() === "") {
  throw {
    code: "VALIDATION_ERROR",
    message: "skillId must be a non-empty string",
  };
}
```

#### skill:import / skill:remove（回帰比較用）

```typescript
// skill:import (L132)
if (typeof skillName !== "string" || skillName.trim() === "") {
  throw {
    code: "VALIDATION_ERROR",
    message: "skillName must be a non-empty string",
  };
}

// skill:remove (L172)
if (typeof skillName !== "string" || skillName.trim() === "") {
  throw {
    code: "VALIDATION_ERROR",
    message: "skillName must be a non-empty string",
  };
}
```

### パターンの統一性確認

| ハンドラ                  | typeof チェック                       | trim チェック                  | エラーコード     | エラーメッセージ       | 統一状態 |
| ------------------------- | ------------------------------------- | ------------------------------ | ---------------- | ---------------------- | -------- |
| skill:import              | `typeof skillName !== "string"`       | `skillName.trim() === ""`      | VALIDATION_ERROR | skillName must be...   | 統一済み |
| skill:remove              | `typeof skillName !== "string"`       | `skillName.trim() === ""`      | VALIDATION_ERROR | skillName must be...   | 統一済み |
| skill:execute (skillName) | `typeof args.skillName !== "string"`  | `args.skillName.trim() === ""` | VALIDATION_ERROR | skillName must be...   | 統一済み |
| skill:execute (skillId)   | `typeof args?.skillId !== "string"`   | `args.skillId.trim() === ""`   | VALIDATION_ERROR | skillId must be...     | 統一済み |
| skill:get-detail          | `typeof args?.skillId !== "string"`   | `args.skillId.trim() === ""`   | VALIDATION_ERROR | skillId must be...     | 統一済み |
| skill:abort               | `typeof executionId !== "string"`     | `executionId.trim() === ""`    | VALIDATION_ERROR | executionId must be... | 統一済み |
| skill:get-status          | `typeof executionId !== "string"`     | `executionId.trim() === ""`    | VALIDATION_ERROR | executionId must be... | 統一済み |
| skill:analyze             | `typeof args?.skillName !== "string"` | `args.skillName.trim() === ""` | VALIDATION_ERROR | skillName must be...   | 統一済み |
| skill:improve             | `typeof args?.skillName !== "string"` | `args.skillName.trim() === ""` | VALIDATION_ERROR | skillName must be...   | 統一済み |

## 可読性ルール

### 構造的ルール

1. **1責務1関数**: バリデーション、解決（名前→ID）、実行をそれぞれ分離可能な単位にする
2. **変換処理と実行処理の分離**: `isSkillNameRequest` 判定後の `scanAvailableSkills → find` は「解決」、`executeSkill` は「実行」
3. **早期return/throwでネストを浅く保つ**: バリデーション失敗は即座に throw し、正常パスのネストを削減

### 実コードの可読性評価

| 項目       | 現状                                                                                                  | 評価     |
| ---------- | ----------------------------------------------------------------------------------------------------- | -------- |
| 早期throw  | バリデーション失敗で即throw                                                                           | 良好     |
| ネスト深度 | 最大3段（handler → if/else → try/catch）                                                              | 許容範囲 |
| コメント   | 変換点コメント「Main service executes by skillId; resolve from name to align with preload contract.」 | 良好     |
| 分岐構造   | if (hasSkillName) { ... } else { ... } + try/catch                                                    | 明確     |

## レビュー観点チェックリスト

- [ ] バリデーションの3段が欠けていないか（typeof → trim() === ""）
- [ ] エラーメッセージがフィールド名と一致するか（skillName/skillId/executionId）
- [ ] throw 形式が統一されているか（`{ code, message }` オブジェクト）
- [ ] テスト名がケースの意図を表しているか（SH-EXE-V00: skillName契約、SH-EXE-V02: 空文字列skillId）
- [ ] isSkillNameRequest 型ガードの true/false 両パスがテストで網羅されているか
- [ ] sender 検証が全ハンドラで実施されているか（validateIpcSender + toIPCValidationError）

## 完了条件

- [x] 3段バリデーション標準テンプレートを定義
- [x] 実コードのバリデーションパターンを全ハンドラで確認（9ハンドラ統一済み）
- [x] 可読性ルールを3項目で定義
- [x] 実コードの可読性を4項目で評価
- [x] レビュー観点チェックリストを6項目で定義
