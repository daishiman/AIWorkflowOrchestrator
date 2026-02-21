# skill:ハンドラバリデーション形式統一 - タスク指示書

## メタ情報

| 項目         | 内容                                                       |
| ------------ | ---------------------------------------------------------- |
| タスクID     | UT-FIX-SKILL-VALIDATION-CONSISTENCY-001                    |
| タスク名     | skill:ハンドラP42準拠バリデーション形式統一                |
| 分類         | セキュリティ                                               |
| 対象機能     | skill:ハンドラ群のバリデーション処理                       |
| 優先度       | 中                                                         |
| 見積もり規模 | 小規模                                                     |
| ステータス   | 未実施                                                     |
| 発見元       | Phase 12（UT-FIX-SKILL-IMPORT-RETURN-TYPE-001 コード調査） |
| 発見日       | 2026-02-21                                                 |
| issue_number | 862                                                        |

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

UT-FIX-SKILL-IMPORT-RETURN-TYPE-001およびUT-FIX-SKILL-IMPORT-INTERFACE-001で、skill:importとskill:removeハンドラにP42準拠の3段バリデーション（型チェック→空文字列→トリム空文字列）が導入された。しかし、同じskillHandlers.ts内の他のハンドラでは、バリデーション形式が統一されていない。

### 1.2 問題点・課題

skillHandlers.ts内のバリデーション状況：

| ハンドラ                       | バリデーション                                                    | P42準拠 | 問題点                                   |
| ------------------------------ | ----------------------------------------------------------------- | ------- | ---------------------------------------- |
| skill:import (L130-136)        | `typeof !== "string" \|\| .trim() === ""`                         | ✅      | -                                        |
| skill:remove (L170-176)        | `typeof !== "string" \|\| .trim() === ""`                         | ✅      | -                                        |
| skill:get-detail (L193)        | `typeof args?.skillId !== "string"`                               | ❌      | trim()チェックなし、空文字列チェックなし |
| skill:execute (L225)           | `typeof args?.skillId !== "string" \|\| args.skillId === ""`      | ❌      | trim()チェックなし                       |
| skill:abort (L254)             | `typeof executionId !== "string" \|\| executionId === ""`         | ❌      | trim()チェックなし                       |
| skill:get-status (L278)        | `typeof executionId !== "string" \|\| executionId === ""`         | ❌      | trim()チェックなし                       |
| skill:analyze (L308)           | `typeof args?.skillName !== "string" \|\| args.skillName === ""`  | ❌      | trim()チェックなし                       |
| skill:improve (L338)           | `typeof args?.skillName !== "string" \|\| args.skillName === ""`  | ❌      | trim()チェックなし                       |
| skill:optimize (L371)          | `typeof args?.prompt !== "string" \|\| args.prompt.trim() === ""` | ✅      | -                                        |
| skill:optimize:variants (L403) | `typeof args?.prompt !== "string" \|\| args.prompt.trim() === ""` | ✅      | -                                        |
| skill:optimize:evaluate (L438) | `typeof args?.prompt !== "string" \|\| args.prompt.trim() === ""` | ✅      | -                                        |

P42準拠のハンドラ: 5/11（skill:import, skill:remove, skill:optimize, skill:optimize:variants, skill:optimize:evaluate）
未準拠のハンドラ: 6/11（skill:get-detail, skill:execute, skill:abort, skill:get-status, skill:analyze, skill:improve）

### 1.3 放置した場合の影響

- スペースのみの入力（`"   "`）がバリデーションを通過し、サービス層で予期しないエラーが発生する（P42で記録された既知の問題）
- IPC層で早期拒否すべき入力がサービス層まで到達し、不要な処理コストが発生する
- セキュリティ監査でバリデーション不備として指摘される可能性がある

## 2. 何を達成するか（What）

### 2.1 目的

skillHandlers.ts内の全ハンドラの文字列引数バリデーションをP42準拠の3段バリデーションに統一する。

### 2.2 最終ゴール

- 全11ハンドラの文字列引数にP42準拠の3段バリデーション（型チェック→空文字列→トリム空文字列）が適用されている
- バリデーション失敗時のエラーレスポンス形式が統一されている（throw形式）
- 新規追加されたバリデーションテストが全PASS

### 2.3 スコープ

#### 含むもの

- skill:get-detail, skill:execute, skill:abort, skill:get-status, skill:analyze, skill:improveの6ハンドラにtrim()チェック追加
- バリデーション失敗時のエラーレスポンス形式統一（throw { code: "VALIDATION_ERROR", message: "..." }）
- 各ハンドラのバリデーションテスト追加

#### 含まないもの

- レスポンス形式の統一（UT-FIX-SKILL-IPC-RESPONSE-CONSISTENCY-001で対応）
- 引数名の修正（UT-FIX-SKILL-GETDETAIL-NAMING-DRIFT-001で対応）
- skill:list, skill:scan, skill:getImportedの修正（引数なしまたはオプショナル引数のため対象外）

### 2.4 成果物

| 成果物                   | パス                                                      |
| ------------------------ | --------------------------------------------------------- |
| 修正済みskillHandlers.ts | apps/desktop/src/main/ipc/skillHandlers.ts                |
| 更新済みテストファイル   | apps/desktop/src/main/ipc/**tests**/skillHandlers.test.ts |

## 3. どのように実行するか（How）

### 3.1 前提条件

- UT-FIX-SKILL-IMPORT-RETURN-TYPE-001が完了していること
- P42（3段バリデーション）パターンの理解

### 3.2 依存タスク

| タスクID                            | 状態 | 依存内容              |
| ----------------------------------- | ---- | --------------------- |
| UT-FIX-SKILL-IMPORT-RETURN-TYPE-001 | 完了 | P42パターンの適用先例 |

### 3.3 必要な知識

- P42（文字列引数の.trim()バリデーション漏れ）パターン
- IPC入力バリデーションの基本原則（04-electron-security.md）

### 3.4 推奨アプローチ

1. 未準拠の6ハンドラに`.trim() === ""`チェックを追加
2. バリデーション失敗時のレスポンスを`throw { code: "VALIDATION_ERROR", message: "..." }`に統一
3. 各ハンドラに対してスペースのみの入力をテストするテストケースを追加

修正パターン（各ハンドラ共通）：

```typescript
// ❌ 修正前（trim()チェックなし）
if (typeof args?.skillId !== "string" || args.skillId === "") {
  return { success: false, error: "skillId must be a string" };
}

// ✅ 修正後（P42準拠3段バリデーション + throw形式）
if (typeof args?.skillId !== "string" || args.skillId.trim() === "") {
  throw {
    code: "VALIDATION_ERROR",
    message: "skillId must be a non-empty string",
  };
}
```

### 3.5 実装課題と解決策（親タスクからの教訓）

| 課題                                        | 発見経緯                                                                 | 解決策                                     | 教訓                                                |
| ------------------------------------------- | ------------------------------------------------------------------------ | ------------------------------------------ | --------------------------------------------------- |
| スペースのみ入力のバリデーション漏れ（P42） | TASK-9A-Bで`"   "`がバリデーション通過しSkillFileManager側エラーとなった | 全文字列引数に`.trim() === ""`チェック追加 | IPC層で早期拒否すべき入力はサービス層に到達させない |
| バリデーションエラーのレスポンス形式不統一  | 一部は`return { success: false }`、一部は`throw`で返していた             | 全ハンドラでthrow形式に統一                | エラーハンドリングの一貫性がデバッグ効率に直結する  |

**参照**:

- [06-known-pitfalls.md P42](../../.claude/rules/06-known-pitfalls.md)
- [04-electron-security.md](../../.claude/rules/04-electron-security.md) - IPCセキュリティ原則

## 4. 実行手順

### Phase構成

本タスクは小規模のため、Phase 1-13の簡略版で実行する。

| Phase | 名称                           | 概要                                         |
| ----- | ------------------------------ | -------------------------------------------- |
| 1-3   | 要件定義・設計・レビュー       | 対象ハンドラの特定と修正方針決定             |
| 4-5   | テスト作成・実装               | バリデーションテスト追加、trim()チェック追加 |
| 6-10  | テスト拡充・品質検証           | カバレッジ確認、Lint/型チェック              |
| 11-13 | 手動テスト・ドキュメント・完了 | 検証・文書化・PR                             |

### Phase 4: テスト作成

#### 手順

1. 各ハンドラに対してスペースのみ入力（`"   "`）のテストケースを追加
2. バリデーション失敗時にVALIDATION_ERRORがthrowされることを検証するテスト追加

### Phase 5: 実装

#### 手順

1. skill:get-detailに`.trim() === ""`チェックとthrow形式エラーを追加
2. skill:executeに`.trim() === ""`チェックとthrow形式エラーを追加
3. skill:abortに`.trim() === ""`チェックを追加
4. skill:get-statusに`.trim() === ""`チェックを追加
5. skill:analyzeに`.trim() === ""`チェックを追加
6. skill:improveに`.trim() === ""`チェックを追加
7. 全テスト実行で全PASS確認

## 5. 完了条件チェックリスト

### 機能要件

- [ ] 全11ハンドラの文字列引数にP42準拠の3段バリデーションが適用されている
- [ ] バリデーション失敗時のエラーレスポンスがthrow形式で統一されている
- [ ] スペースのみ入力（`"   "`）が全ハンドラでVALIDATION_ERRORとして拒否される

### 品質要件

- [ ] TypeCheck 0エラー
- [ ] ESLint 0エラー
- [ ] 全テストPASS
- [ ] バリデーション関連テストカバレッジ100%

### ドキュメント要件

- [ ] Phase 12 実装ガイド作成
- [ ] システム仕様書更新

## 6. 検証方法

### テストケース

各ハンドラに対して以下をテスト：

1. 正常な文字列引数 → 正常処理
2. 空文字列 `""` → VALIDATION_ERROR
3. スペースのみ `"   "` → VALIDATION_ERROR
4. null/undefined → VALIDATION_ERROR
5. 数値型 → VALIDATION_ERROR

### 検証手順

```bash
pnpm typecheck
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers.test.ts
pnpm lint
```

## 7. リスクと対策

| リスク                                                    | 影響度 | 発生確率 | 対策                                                                             |
| --------------------------------------------------------- | ------ | -------- | -------------------------------------------------------------------------------- |
| バリデーション強化により既存の正常な呼び出しが拒否される  | 中     | 低       | 既存テストで回帰確認。trim()は前後の空白のみ除去するため、有効な文字列は影響なし |
| throw形式への変更でRenderer側のエラーハンドリングが壊れる | 中     | 中       | 呼び出し元のtry-catch/safeInvokeのエラーハンドリングを確認                       |
| テストモックの更新量が多い（P21パターン）                 | 低     | 中       | バリデーション部分のみの変更のため影響範囲は限定的                               |

## 8. 参照情報

### 関連ドキュメント

- [06-known-pitfalls.md P42](../../.claude/rules/06-known-pitfalls.md) - 文字列引数の.trim()バリデーション漏れ
- [04-electron-security.md](../../.claude/rules/04-electron-security.md) - IPCセキュリティ原則
- [security-skill-ipc.md](../../.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md) - スキルIPCセキュリティ仕様
- [ipc-contract-checklist.md](../../.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md) - IPC契約チェックリスト

### 関連Pitfall

- P42: 文字列引数の.trim()バリデーション漏れ
- P44: skill:import/remove IPCインターフェース不整合（解決済み）

### 関連完了タスク

- UT-FIX-SKILL-IMPORT-RETURN-TYPE-001（P42パターン適用の先例）
- UT-FIX-SKILL-IMPORT-INTERFACE-001（P42パターン適用の先例）
- TASK-9A-B（P42パターン発見元）

## 9. 備考

### P42準拠の3段バリデーション標準パターン

```typescript
// 標準パターン（全ハンドラ共通）
if (typeof value !== "string" || value.trim() === "") {
  throw {
    code: "VALIDATION_ERROR",
    message: `${paramName} must be a non-empty string`,
  };
}
```

### 補足事項

本タスクはセキュリティ分類ですが、緊急性は低いです。スペースのみの入力はサービス層で別のエラーとして処理されるため、ユーザー影響は限定的です。ただし、IPC層での早期拒否はセキュリティのベストプラクティスであり、コードの一貫性向上にも寄与します。
