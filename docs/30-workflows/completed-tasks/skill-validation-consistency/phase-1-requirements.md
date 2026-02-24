# Phase 1: 要件定義 — skill:ハンドラP42準拠バリデーション形式統一

## メタ情報

| 項目          | 内容                                        |
| ------------- | ------------------------------------------- |
| タスクID      | UT-FIX-SKILL-VALIDATION-CONSISTENCY-001     |
| タスク名      | skill:ハンドラP42準拠バリデーション形式統一 |
| Phase         | 1 — 要件定義                                |
| 分類          | セキュリティ                                |
| 優先度        | 中                                          |
| 規模          | 小規模                                      |
| Issue         | #874                                        |
| 作成日        | 2026-02-24                                  |
| 前Phase成果物 | なし（初回Phase）                           |

## 目的

skillHandlers.ts 内の6つの未準拠ハンドラに対して、P42準拠の3段バリデーション（型チェック→空文字列→トリム空文字列）と throw 形式エラーレスポンスを追加し、全ハンドラのバリデーション形式を統一する。

## 実行タスク

- 機能要件定義: P42準拠バリデーションの機能要件を明文化する。
- 非機能要件定義: 品質・セキュリティ・互換性の基準を定義する。
- 受入基準策定: 全ハンドラ統一完了の判定基準を定義する。
- 対象ハンドラ確定: 未準拠6ハンドラの現状を確認する。
- スコープ外明確化: 対象外タスクとの境界を固定する。

| #   | タスク                 | 説明                                            |
| --- | ---------------------- | ----------------------------------------------- |
| 1   | 機能要件の定義         | P42準拠バリデーションの具体的な要件を明文化     |
| 2   | 非機能要件の定義       | 品質基準・セキュリティ基準の明文化              |
| 3   | 受入基準の策定         | 全ハンドラのバリデーション統一完了の判定基準    |
| 4   | 対象ハンドラの最終確認 | 未準拠6ハンドラの現状バリデーションコードの確認 |
| 5   | スコープ外事項の明確化 | 本タスクに含まないものを明示的に定義            |

## 参照資料

### システム仕様

- `.claude/rules/06-known-pitfalls.md` — P42: 文字列引数の.trim()バリデーション漏れ
- `.claude/rules/04-electron-security.md` — IPCセキュリティ原則
- `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md` — スキルIPCセキュリティ仕様
- `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md` — IPC契約チェックリスト
- `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` — Skill API契約の正本
- `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md` — IPCチャネル仕様の正本
- `.claude/skills/aiworkflow-requirements/references/error-handling.md` — VALIDATION_ERROR分類とエラーポリシー
- `docs/30-workflows/completed-tasks/task-skill-validation-consistency.md` — 元タスク指示書（完了後移管）

### 関連Pitfall

- P42: 文字列引数の.trim()バリデーション漏れ（TASK-9A-B で発見）
- P44: skill:import/remove IPCインターフェース不整合（✅解決済み）
- P45: IPC引数命名の契約ドリフト（✅解決済み）

### 関連完了タスク

- UT-FIX-SKILL-IMPORT-RETURN-TYPE-001 — P42パターン適用の先例（skill:import）
- UT-FIX-SKILL-IMPORT-INTERFACE-001 — P42パターン適用の先例（skill:import + skill:remove）
- TASK-9A-B — P42パターン発見元

## 実行手順

### Step 1: 対象ハンドラの現状確認

skillHandlers.ts 内の全11ハンドラのバリデーション状況を確認し、未準拠の6ハンドラを特定する。

#### 現状のバリデーション状況（確認済み）

| #   | ハンドラ                | 現行バリデーション                                            | P42準拠 | 問題点                                   |
| --- | ----------------------- | ------------------------------------------------------------- | ------- | ---------------------------------------- |
| 1   | skill:import            | `typeof !== "string" \|\| .trim() === ""`、throw形式          | ✅      | —                                        |
| 2   | skill:remove            | `typeof !== "string" \|\| .trim() === ""`、throw形式          | ✅      | —                                        |
| 3   | skill:get-detail        | `typeof args?.skillId !== "string"`、return形式               | ❌      | trim()チェックなし、空文字列チェックなし |
| 4   | skill:execute           | `typeof args?.skillId !== "string" \|\| === ""`、return形式   | ❌      | trim()チェックなし                       |
| 5   | skill:abort             | `typeof executionId !== "string" \|\| === ""`、return形式     | ❌      | trim()チェックなし                       |
| 6   | skill:get-status        | `typeof executionId !== "string" \|\| === ""`、return形式     | ❌      | trim()チェックなし                       |
| 7   | skill:analyze           | `typeof args?.skillName !== "string" \|\| === ""`、return形式 | ❌      | trim()チェックなし                       |
| 8   | skill:improve           | `typeof args?.skillName !== "string" \|\| === ""`、return形式 | ❌      | trim()チェックなし                       |
| 9   | skill:optimize          | `typeof args?.prompt !== "string" \|\| .trim() === ""`        | ✅      | —                                        |
| 10  | skill:optimize:variants | `typeof args?.prompt !== "string" \|\| .trim() === ""`        | ✅      | —                                        |
| 11  | skill:optimize:evaluate | `typeof args?.prompt !== "string" \|\| .trim() === ""`        | ✅      | —                                        |

**P42準拠: 5/11、未準拠: 6/11**

### Step 2: 機能要件の定義

#### FR1: P42準拠3段バリデーション追加

未準拠の6ハンドラの全文字列引数に、P42準拠の3段バリデーションを追加する。

**3段バリデーションの定義:**

1. **型チェック**: `typeof value !== "string"` — 文字列型であることを検証
2. **空文字列チェック**: `value === ""` — 空文字列を拒否（trim()に内包されるため明示不要）
3. **トリム空文字列チェック**: `value.trim() === ""` — スペースのみの入力を拒否

**統一パターン:**

```typescript
if (typeof value !== "string" || value.trim() === "") {
  throw {
    code: "VALIDATION_ERROR",
    message: `${paramName} must be a non-empty string`,
  };
}
```

> 注: `value.trim() === ""` は `value === ""` を内包するため、条件式は `typeof !== "string" || .trim() === ""` の2条件で3段チェックを達成する。

#### FR2: エラーレスポンス形式の統一（throw形式）

バリデーション失敗時のレスポンスを全ハンドラで throw 形式に統一する。

| ハンドラ         | 修正前のエラー形式                                                 | 修正後のエラー形式                                                                      |
| ---------------- | ------------------------------------------------------------------ | --------------------------------------------------------------------------------------- |
| skill:get-detail | `return { success: false, error: "skillId must be a string" }`     | `throw { code: "VALIDATION_ERROR", message: "skillId must be a non-empty string" }`     |
| skill:execute    | `return { success: false, error: "skillId must be a string" }`     | `throw { code: "VALIDATION_ERROR", message: "skillId must be a non-empty string" }`     |
| skill:abort      | `return false`                                                     | `throw { code: "VALIDATION_ERROR", message: "executionId must be a non-empty string" }` |
| skill:get-status | `return null`                                                      | `throw { code: "VALIDATION_ERROR", message: "executionId must be a non-empty string" }` |
| skill:analyze    | `return { success: false, error: "スキル名が指定されていません" }` | `throw { code: "VALIDATION_ERROR", message: "skillName must be a non-empty string" }`   |
| skill:improve    | `return { success: false, error: "スキル名が指定されていません" }` | `throw { code: "VALIDATION_ERROR", message: "skillName must be a non-empty string" }`   |

#### FR3: スペースのみ入力の拒否

全6ハンドラで、スペースのみの入力（`"   "`）が VALIDATION_ERROR として拒否されること。

**テスト対象の入力パターン:**

| 入力                   | 期待結果         |
| ---------------------- | ---------------- |
| 正常な文字列           | 正常処理         |
| `""` (空文字列)        | VALIDATION_ERROR |
| `"   "` (スペースのみ) | VALIDATION_ERROR |
| `null`                 | VALIDATION_ERROR |
| `undefined`            | VALIDATION_ERROR |
| `123` (数値型)         | VALIDATION_ERROR |

### Step 3: 非機能要件の定義

| ID   | 要件                     | 基準                                               |
| ---- | ------------------------ | -------------------------------------------------- |
| NFR1 | TypeScript型安全         | TypeCheck 0エラー                                  |
| NFR2 | コード品質               | ESLint 0エラー                                     |
| NFR3 | テスト品質               | 全テストPASS                                       |
| NFR4 | バリデーションカバレッジ | 修正対象6ハンドラのバリデーション分岐100%カバー    |
| NFR5 | 後方互換性               | Renderer側のsafeInvokeエラーハンドリングが正常動作 |

### Step 4: スコープ外事項

以下は本タスクのスコープに含めない:

| スコープ外事項                         | 対応タスク                                | 理由                               |
| -------------------------------------- | ----------------------------------------- | ---------------------------------- |
| レスポンス形式の統一（成功時の戻り値） | UT-FIX-SKILL-IPC-RESPONSE-CONSISTENCY-001 | 別タスクで対応                     |
| 引数名の修正（skillId→skillName等）    | UT-FIX-SKILL-GETDETAIL-NAMING-DRIFT-001   | 本タスクはバリデーション形式のみ   |
| skill:list/scan/getImportedの修正      | 対象外                                    | 引数なしまたはオプショナル引数     |
| Preload側の修正                        | 対象外                                    | バリデーションはMain Process側のみ |

### Step 5: セキュリティ要件

#### IPCセキュリティ原則（04-electron-security.md 準拠）

- 引数はMain側でバリデーション（パストラバーサル攻撃を含む）
- IPC層で早期拒否すべき入力がサービス層に到達しない
- エラーはサニタイズしてからRendererに送る（内部情報を漏洩しない）

#### P42パターン準拠

- 全文字列引数に `.trim() === ""` チェックを追加して3段バリデーションを標準化
- バリデーション失敗時は `throw { code: "VALIDATION_ERROR", message: "..." }` で一貫したエラー形式

## 統合テスト連携【必須】

### Renderer側への影響

throw形式への変更により、safeInvoke経由でRendererに返されるエラー形式が変更される。

| 変更前                                                | 変更後                                               |
| ----------------------------------------------------- | ---------------------------------------------------- |
| `{ success: false, error: "..." }` / `false` / `null` | `throw { code: "VALIDATION_ERROR", message: "..." }` |

safeInvoke はハンドラが throw した場合、reject された Promise を返す。Renderer側では try-catch または `.catch()` でエラーをハンドリングしている。この動作はsafeInvokeの設計に沿ったものであり、Renderer側の修正は不要（safeInvokeが内部でエラーをラップして返すため）。

### 回帰テスト

- 既存テスト: バリデーション部分のテストがreturn形式を期待している場合は、throw形式に合わせて更新が必要
- 新規テスト: スペースのみ入力のテストケースを6ハンドラ分追加

## 多角的チェック観点

| 観点             | 確認事項                                                   |
| ---------------- | ---------------------------------------------------------- |
| セキュリティ     | P42準拠3段バリデーションが全対象ハンドラに適用されているか |
| 後方互換性       | throw形式変更によるRenderer側のエラーハンドリングへの影響  |
| コード一貫性     | skill:import/remove（準拠済み）と同じパターンであること    |
| テスト網羅性     | 各ハンドラの全バリデーション分岐がテストされているか       |
| エラーメッセージ | パラメータ名が各ハンドラで正確に反映されているか           |

## 成果物

| #   | 成果物     | パス                                                                                   | 形式     |
| --- | ---------- | -------------------------------------------------------------------------------------- | -------- |
| 1   | 要件定義書 | docs/30-workflows/completed-tasks/skill-validation-consistency/phase-1-requirements.md | Markdown |

## 完了条件チェックリスト

- [ ] 対象ハンドラ6つが特定・確認されている
- [ ] 機能要件FR1-FR3が明文化されている
- [ ] 非機能要件NFR1-NFR5が明文化されている
- [ ] スコープ外事項が明確に定義されている
- [ ] セキュリティ要件がP42/04-electron-security.mdに準拠している
- [ ] 統合テスト連携の影響分析が完了している
- [ ] 受入基準（テスト入力パターン表）が定義されている

## 次のPhase

→ Phase 2: 設計（`phase-2-design.md`）
