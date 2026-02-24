# Phase 2: 設計 -- skill:ハンドラP42準拠バリデーション形式統一

## メタ情報

| 項目          | 内容                                                                                     |
| ------------- | ---------------------------------------------------------------------------------------- |
| タスクID      | UT-FIX-SKILL-VALIDATION-CONSISTENCY-001                                                  |
| タスク名      | skill:ハンドラP42準拠バリデーション形式統一                                              |
| Phase         | 2 -- 設計                                                                                |
| 分類          | セキュリティ                                                                             |
| 優先度        | 中                                                                                       |
| 規模          | 小規模                                                                                   |
| Issue         | #874                                                                                     |
| 作成日        | 2026-02-24                                                                               |
| 前Phase成果物 | `docs/30-workflows/completed-tasks/skill-validation-consistency/phase-1-requirements.md` |

## 目的

Phase 1 で定義した機能要件（FR1-FR3）と非機能要件（NFR1-NFR5）を満たすために、6つの未準拠ハンドラの具体的な修正設計を行う。修正パターンの統一、エラーレスポンス形式の設計、既存テストへの影響分析を実施する。

## 実行タスク

- バリデーション設計: P42準拠3段バリデーションの統一パターンを確定する。
- ハンドラ修正方針決定: 6ハンドラごとの修正差分を設計する。
- エラー形式設計: return から throw への統一方針を定義する。
- テスト設計方針: 追加テストと既存テスト修正方針を設計する。
- 共通化判断: 共通ヘルパー抽出の可否を判断する。

| #   | タスク                           | 説明                                                |
| --- | -------------------------------- | --------------------------------------------------- |
| 1   | バリデーション統一パターンの設計 | P42準拠3段バリデーションの統一コードパターンを定義  |
| 2   | 各ハンドラの修正方針決定         | 6ハンドラ x 修正内容の詳細テーブル作成              |
| 3   | エラーレスポンス形式の設計       | return -> throw変更の影響分析とRenderer側互換性検証 |
| 4   | テスト設計方針                   | 追加テストケースの設計と既存テスト修正方針          |
| 5   | バリデーション関数の共通化検討   | 共通ヘルパー関数の抽出可否を判断                    |

## 参照資料

### 前Phase成果物

- `docs/30-workflows/completed-tasks/skill-validation-consistency/phase-1-requirements.md` -- 要件定義書

### システム仕様

- `.claude/rules/06-known-pitfalls.md` -- P42: 文字列引数の.trim()バリデーション漏れ
- `.claude/rules/04-electron-security.md` -- IPCセキュリティ原則
- `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md` -- スキルIPCセキュリティ仕様
- `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md` -- IPC契約チェックリスト
- `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` -- Skill API契約の正本
- `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md` -- IPCチャネル仕様の正本
- `.claude/skills/aiworkflow-requirements/references/error-handling.md` -- VALIDATION_ERROR分類とエラーポリシー
- `docs/30-workflows/completed-tasks/task-skill-validation-consistency.md` -- 元タスク指示書（完了後移管）

### 参考実装（P42準拠済みハンドラ）

- `apps/desktop/src/main/ipc/skillHandlers.ts` L130-136 -- skill:import（準拠パターン）
- `apps/desktop/src/main/ipc/skillHandlers.ts` L170-176 -- skill:remove（準拠パターン）

### 修正対象ファイル

- `apps/desktop/src/main/ipc/skillHandlers.ts` -- 6ハンドラのバリデーション修正

### テスト対象ファイル（既存テスト修正 + 新規テスト追加）

| #   | ファイル                                                                | 影響範囲                                                                            |
| --- | ----------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| 1   | `apps/desktop/src/main/ipc/__tests__/skillHandlers.test.ts`             | skill:get-detail のバリデーションテスト（SH-GD-03）の期待値修正 + 新規P42テスト追加 |
| 2   | `apps/desktop/src/main/ipc/__tests__/skillHandlers.execute.test.ts`     | skill:execute のバリデーション関連テストの期待値修正（return -> throw形式）         |
| 3   | `apps/desktop/src/main/ipc/__tests__/skillHandlers.improve.test.ts`     | skill:analyze / skill:improve のバリデーション関連テストの期待値修正                |
| 4   | `apps/desktop/src/main/ipc/__tests__/skillHandlers.delegate.test.ts`    | skill:abort / skill:get-status の既存テスト影響確認                                 |
| 5   | `apps/desktop/src/main/ipc/__tests__/skillHandlers.integration.test.ts` | 統合テストのバリデーション関連テスト影響確認                                        |

## 実行手順

### Step 1: バリデーション統一パターンの設計

#### 1.1 P42準拠3段バリデーション標準パターン

既に skill:import / skill:remove で適用されているパターンを標準とする:

```typescript
// P42準拠: 3段バリデーション（型チェック -> 空文字列 -> トリム空文字列）
if (typeof value !== "string" || value.trim() === "") {
  throw {
    code: "VALIDATION_ERROR",
    message: `${paramName} must be a non-empty string`,
  };
}
```

**設計判断:**

- `value.trim() === ""` は空文字列 `""` を内包するため、別途 `value === ""` チェックは不要
- `typeof` チェックは `null` / `undefined` / 数値型を全て拒否
- throw 形式は safeInvoke の Error ハンドリングと整合

#### 1.2 引数アクセスパターンの分類

対象6ハンドラの引数アクセスパターンは2種類存在する:

| パターン       | 引数形式                       | 値アクセス         | 対象ハンドラ                                                  |
| -------------- | ------------------------------ | ------------------ | ------------------------------------------------------------- |
| オブジェクト型 | `args: { skillId: string }` 等 | `args?.skillId` 等 | skill:get-detail, skill:execute, skill:analyze, skill:improve |
| 直接引数型     | `executionId: string`          | `executionId`      | skill:abort, skill:get-status                                 |

#### 1.3 バリデーション関数の共通化判断

**判断: 共通関数を抽出しない。**

理由:

1. 各ハンドラの引数アクセスパターンが2種類（オブジェクト型 / 直接引数型）あり、共通関数にすると分岐が増え可読性が低下する
2. skill:import / skill:remove は既にインライン記述で準拠済みであり、同一パターンでインライン記述する方が一貫性が高い
3. 修正対象は条件式とthrow文の2行のみであり、共通化の恩恵が限定的
4. 将来的にバリデーションパターンが複雑化した場合（追加チェック項目等）に共通化を再検討する

### Step 2: 各ハンドラの修正方針

#### 2.1 修正詳細テーブル

| #   | ハンドラ         | 引数パターン   | パラメータ名 | 値アクセス        | 修正前条件                                                       | 修正後条件                                                              | エラーメッセージ                         |
| --- | ---------------- | -------------- | ------------ | ----------------- | ---------------------------------------------------------------- | ----------------------------------------------------------------------- | ---------------------------------------- |
| 1   | skill:get-detail | オブジェクト型 | skillId      | `args?.skillId`   | `typeof args?.skillId !== "string"`                              | `typeof args?.skillId !== "string" \|\| args.skillId.trim() === ""`     | `skillId must be a non-empty string`     |
| 2   | skill:execute    | オブジェクト型 | skillId      | `args?.skillId`   | `typeof args?.skillId !== "string" \|\| args.skillId === ""`     | `typeof args?.skillId !== "string" \|\| args.skillId.trim() === ""`     | `skillId must be a non-empty string`     |
| 3   | skill:abort      | 直接引数型     | executionId  | `executionId`     | `typeof executionId !== "string" \|\| executionId === ""`        | `typeof executionId !== "string" \|\| executionId.trim() === ""`        | `executionId must be a non-empty string` |
| 4   | skill:get-status | 直接引数型     | executionId  | `executionId`     | `typeof executionId !== "string" \|\| executionId === ""`        | `typeof executionId !== "string" \|\| executionId.trim() === ""`        | `executionId must be a non-empty string` |
| 5   | skill:analyze    | オブジェクト型 | skillName    | `args?.skillName` | `typeof args?.skillName !== "string" \|\| args.skillName === ""` | `typeof args?.skillName !== "string" \|\| args.skillName.trim() === ""` | `skillName must be a non-empty string`   |
| 6   | skill:improve    | オブジェクト型 | skillName    | `args?.skillName` | `typeof args?.skillName !== "string" \|\| args.skillName === ""` | `typeof args?.skillName !== "string" \|\| args.skillName.trim() === ""` | `skillName must be a non-empty string`   |

#### 2.2 各ハンドラの具体的修正内容

##### ハンドラ1: skill:get-detail（L193付近）

```typescript
// --- 修正前 ---
if (typeof args?.skillId !== "string") {
  return { success: false, error: "skillId must be a string" };
}

// +++ 修正後 +++
// P42準拠: 3段バリデーション（型チェック -> 空文字列 -> トリム空文字列）
if (typeof args?.skillId !== "string" || args.skillId.trim() === "") {
  throw {
    code: "VALIDATION_ERROR",
    message: "skillId must be a non-empty string",
  };
}
```

**変更点:**

1. `.trim() === ""` チェック追加（空文字列 + スペースのみを拒否）
2. `return { success: false }` -> `throw { code, message }` 形式に変更

##### ハンドラ2: skill:execute（L225付近）

```typescript
// --- 修正前 ---
if (typeof args?.skillId !== "string" || args.skillId === "") {
  return { success: false, error: "skillId must be a string" };
}

// +++ 修正後 +++
// P42準拠: 3段バリデーション（型チェック -> 空文字列 -> トリム空文字列）
if (typeof args?.skillId !== "string" || args.skillId.trim() === "") {
  throw {
    code: "VALIDATION_ERROR",
    message: "skillId must be a non-empty string",
  };
}
```

**変更点:**

1. `=== ""` -> `.trim() === ""` に変更（スペースのみも拒否）
2. `return { success: false }` -> `throw { code, message }` 形式に変更

##### ハンドラ3: skill:abort（L254付近）

```typescript
// --- 修正前 ---
if (typeof executionId !== "string" || executionId === "") {
  return false;
}

// +++ 修正後 +++
// P42準拠: 3段バリデーション（型チェック -> 空文字列 -> トリム空文字列）
if (typeof executionId !== "string" || executionId.trim() === "") {
  throw {
    code: "VALIDATION_ERROR",
    message: "executionId must be a non-empty string",
  };
}
```

**変更点:**

1. `=== ""` -> `.trim() === ""` に変更
2. `return false` -> `throw { code, message }` 形式に変更

##### ハンドラ4: skill:get-status（L278付近）

```typescript
// --- 修正前 ---
if (typeof executionId !== "string" || executionId === "") {
  return null;
}

// +++ 修正後 +++
// P42準拠: 3段バリデーション（型チェック -> 空文字列 -> トリム空文字列）
if (typeof executionId !== "string" || executionId.trim() === "") {
  throw {
    code: "VALIDATION_ERROR",
    message: "executionId must be a non-empty string",
  };
}
```

**変更点:**

1. `=== ""` -> `.trim() === ""` に変更
2. `return null` -> `throw { code, message }` 形式に変更

##### ハンドラ5: skill:analyze（L308付近）

```typescript
// --- 修正前 ---
if (typeof args?.skillName !== "string" || args.skillName === "") {
  return { success: false, error: "スキル名が指定されていません" };
}

// +++ 修正後 +++
// P42準拠: 3段バリデーション（型チェック -> 空文字列 -> トリム空文字列）
if (typeof args?.skillName !== "string" || args.skillName.trim() === "") {
  throw {
    code: "VALIDATION_ERROR",
    message: "skillName must be a non-empty string",
  };
}
```

**変更点:**

1. `=== ""` -> `.trim() === ""` に変更
2. `return { success: false }` -> `throw { code, message }` 形式に変更
3. エラーメッセージを英語・統一形式に変更（`"スキル名が指定されていません"` -> `"skillName must be a non-empty string"`）

##### ハンドラ6: skill:improve（L338付近）

```typescript
// --- 修正前 ---
if (typeof args?.skillName !== "string" || args.skillName === "") {
  return { success: false, error: "スキル名が指定されていません" };
}

// +++ 修正後 +++
// P42準拠: 3段バリデーション（型チェック -> 空文字列 -> トリム空文字列）
if (typeof args?.skillName !== "string" || args.skillName.trim() === "") {
  throw {
    code: "VALIDATION_ERROR",
    message: "skillName must be a non-empty string",
  };
}
```

**変更点:**

1. `=== ""` -> `.trim() === ""` に変更
2. `return { success: false }` -> `throw { code, message }` 形式に変更
3. エラーメッセージを英語・統一形式に変更

**注意: skill:improve の第2バリデーション（`args.analysis`チェック）について:**

skill:improve にはスキル名バリデーションの後に `args.analysis` の存在チェック（L341: `if (!args.analysis)`）がある。このチェックは本タスクのスコープ外とする。理由: `args.analysis` はオブジェクト型であり、P42の文字列バリデーションパターン（3段バリデーション）の対象外。ただし、エラーレスポンス形式の統一（return -> throw）は以下のとおり適用する:

```typescript
// --- 修正前 ---
if (!args.analysis) {
  return { success: false, error: "分析結果が指定されていません" };
}

// +++ 修正後 +++
if (!args.analysis) {
  throw {
    code: "VALIDATION_ERROR",
    message: "analysis must be provided",
  };
}
```

### Step 3: エラーレスポンス形式の設計

#### 3.1 throw形式変更の影響分析

##### IPC通信におけるthrowの動作

Electron の `ipcMain.handle()` でハンドラが throw すると、`ipcRenderer.invoke()` 側で reject された Promise が返される。safeInvoke はこの reject を catch してエラーハンドリングする。

```
ハンドラ throw -> ipcMain が reject -> ipcRenderer.invoke() reject -> safeInvoke catch
```

##### 変更前後のRenderer側の受け取り方

| ハンドラ         | 変更前のRenderer受取値                                            | 変更後のRenderer受取値                                 |
| ---------------- | ----------------------------------------------------------------- | ------------------------------------------------------ |
| skill:get-detail | `{ success: false, error: "skillId must be a string" }` (resolve) | reject: `{ code: "VALIDATION_ERROR", message: "..." }` |
| skill:execute    | `{ success: false, error: "skillId must be a string" }` (resolve) | reject: `{ code: "VALIDATION_ERROR", message: "..." }` |
| skill:abort      | `false` (resolve)                                                 | reject: `{ code: "VALIDATION_ERROR", message: "..." }` |
| skill:get-status | `null` (resolve)                                                  | reject: `{ code: "VALIDATION_ERROR", message: "..." }` |
| skill:analyze    | `{ success: false, error: "..." }` (resolve)                      | reject: `{ code: "VALIDATION_ERROR", message: "..." }` |
| skill:improve    | `{ success: false, error: "..." }` (resolve)                      | reject: `{ code: "VALIDATION_ERROR", message: "..." }` |

##### Renderer側互換性の判断

safeInvoke はハンドラのthrowを reject として受け取り、エラーハンドリングする設計になっている。Renderer側のコードは既に try-catch / .catch() でエラーをハンドリングしているため、throw形式への変更はsafeInvokeの設計に沿った正常な動作であり、**Renderer側の修正は不要**。

ただし、以下のケースでは注意が必要:

- skill:abort の `return false` -> throw 変更: 呼び出し元が `false` を正常応答として処理している場合、エラーハンドリングフローが変わる
- skill:get-status の `return null` -> throw 変更: 呼び出し元が `null` をデータなしとして処理している場合、同様

**リスク軽減策:** バリデーションエラーは通常、Renderer側から不正な入力が送信された場合にのみ発生する。正常な使用フローでは空文字列やスペースのみの入力は送信されないため、実質的な影響は限定的。

#### 3.2 エラーオブジェクト形式

統一エラーオブジェクト:

```typescript
{
  code: "VALIDATION_ERROR",
  message: `${paramName} must be a non-empty string`
}
```

- `code`: エラーカテゴリ識別子。VALIDATION_ERRORはエラーカテゴリ1000-1999（リトライ不可）に対応
- `message`: 英語メッセージ。パラメータ名を含む形式で統一

#### 3.3 エラーメッセージ統一テーブル

| ハンドラ         | 修正前メッセージ                 | 修正後メッセージ                           |
| ---------------- | -------------------------------- | ------------------------------------------ |
| skill:get-detail | `"skillId must be a string"`     | `"skillId must be a non-empty string"`     |
| skill:execute    | `"skillId must be a string"`     | `"skillId must be a non-empty string"`     |
| skill:abort      | なし（`return false`）           | `"executionId must be a non-empty string"` |
| skill:get-status | なし（`return null`）            | `"executionId must be a non-empty string"` |
| skill:analyze    | `"スキル名が指定されていません"` | `"skillName must be a non-empty string"`   |
| skill:improve    | `"スキル名が指定されていません"` | `"skillName must be a non-empty string"`   |
| skill:improve    | `"分析結果が指定されていません"` | `"analysis must be provided"`              |

### Step 4: テスト設計方針

#### 4.1 追加テストケース設計

各ハンドラに対して以下のバリデーションテストを追加:

| テストケース                             | 入力                  | 期待結果               |
| ---------------------------------------- | --------------------- | ---------------------- |
| バリデーション: スペースのみの入力を拒否 | `"   "` (スペース3つ) | throw VALIDATION_ERROR |
| バリデーション: 空文字列を拒否           | `""`                  | throw VALIDATION_ERROR |
| バリデーション: null入力を拒否           | `null`                | throw VALIDATION_ERROR |
| バリデーション: undefined入力を拒否      | `undefined`           | throw VALIDATION_ERROR |
| バリデーション: 数値型入力を拒否         | `123`                 | throw VALIDATION_ERROR |

テストではハンドラが throw することを検証するため、`rejects.toMatchObject()` パターンを使用する。

#### 4.2 既存テスト修正方針

既存テストがバリデーションエラー時に return 形式（`{ success: false }` / `false` / `null`）を期待している場合、throw 形式に合わせて更新する。

**修正対象の特定済み既存テスト:**

| ファイル                | テストID                                     | 現在の期待値                                               | 修正後の期待値                                                                                                                                                                                              |
| ----------------------- | -------------------------------------------- | ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `skillHandlers.test.ts` | SH-GD-03 (`skill:get-detail` バリデーション) | try-catch で error を検出（`expect(error).toBeDefined()`） | `rejects.toMatchObject({ code: "VALIDATION_ERROR" })` に修正。ただし現在のテストは空文字列 `""` を渡して try-catch しているため、throw 形式に変わっても PASS する可能性がある。テスト期待値をより明確にする |

**注意:** 既存テストの中には、バリデーションエラーを try-catch で捕捉しているケースがある（例: SH-GD-03）。この場合、return形式からthrow形式への変更により「テストがPASSする理由が変わる」が結果は同じPASSとなる。明確性のために `rejects.toMatchObject()` 形式に統一する。

```typescript
// --- 修正前のテスト期待値 ---
try {
  await handler({}, { skillId: "" });
  throw new Error("Expected validation error");
} catch (error) {
  expect(error).toBeDefined();
}

// +++ 修正後のテスト期待値 +++
await expect(handler({}, { skillId: "" })).rejects.toMatchObject({
  code: "VALIDATION_ERROR",
  message: "skillId must be a non-empty string",
});
```

#### 4.3 テスト構造

```typescript
describe("skillHandlers - P42 validation consistency", () => {
  describe.each([
    { handler: "skill:get-detail", param: "skillId", argKey: "skillId" },
    { handler: "skill:execute", param: "skillId", argKey: "skillId" },
    { handler: "skill:abort", param: "executionId", isDirect: true },
    { handler: "skill:get-status", param: "executionId", isDirect: true },
    { handler: "skill:analyze", param: "skillName", argKey: "skillName" },
    { handler: "skill:improve", param: "skillName", argKey: "skillName" },
  ])("$handler", ({ param, argKey, isDirect }) => {
    it("スペースのみの入力を VALIDATION_ERROR で拒否する", ...);
    it("空文字列を VALIDATION_ERROR で拒否する", ...);
    it("null を VALIDATION_ERROR で拒否する", ...);
    it("undefined を VALIDATION_ERROR で拒否する", ...);
    it("数値型を VALIDATION_ERROR で拒否する", ...);
  });
});
```

> `describe.each` を使用して6ハンドラ分のテストを DRY に記述する。

#### 4.4 テスト配置先

新規P42バリデーションテストは `skillHandlers.test.ts` に追加する。理由:

- 全ハンドラに横断的なバリデーション統一テストであり、個別ハンドラのテストファイル（execute, improve等）ではなくメインテストファイルに集約する方が発見性が高い
- `describe.each` を使った一括テストはファイル横断より1ファイル集約の方が保守性が高い

### Step 5: バリデーション関数の共通化検討

#### 5.1 検討結果

**結論: 本タスクでは共通関数を抽出しない。**

Step 1.3 で判断したとおり、以下の理由による:

1. 引数アクセスパターンが2種類あり共通化すると分岐が増える
2. 既存準拠ハンドラ（skill:import / skill:remove）がインライン記述であり一貫性を優先
3. 修正量が2行/ハンドラと限定的
4. Phase 8（リファクタリング）で共通化を再評価する

#### 5.2 将来の共通化候補（Phase 8 向けメモ）

将来バリデーション項目が増加した場合（パストラバーサルチェック等）、以下のヘルパー関数への抽出を検討:

```typescript
// 将来検討用（本タスクでは実装しない）
function validateStringParam(
  value: unknown,
  paramName: string,
): asserts value is string {
  if (typeof value !== "string" || value.trim() === "") {
    throw {
      code: "VALIDATION_ERROR",
      message: `${paramName} must be a non-empty string`,
    };
  }
}
```

## アーキテクチャ層

### 修正対象の層

```
Renderer -> Preload (contextBridge) -> [Main Process IPC Layer] -> Services
                                        ^ 修正対象はここ
```

本タスクの修正はMain ProcessのIPC通信層（`skillHandlers.ts`）のみ。サービス層（SkillService等）やPreload層には変更を加えない。

### 修正ファイル一覧

| ファイル                                                                | 修正内容                                               |
| ----------------------------------------------------------------------- | ------------------------------------------------------ |
| `apps/desktop/src/main/ipc/skillHandlers.ts`                            | 6ハンドラのバリデーション修正 + improve分析チェック    |
| `apps/desktop/src/main/ipc/__tests__/skillHandlers.test.ts`             | 新規P42テストケース追加 + 既存テスト修正               |
| `apps/desktop/src/main/ipc/__tests__/skillHandlers.execute.test.ts`     | 既存バリデーションテストの期待値修正（該当箇所あれば） |
| `apps/desktop/src/main/ipc/__tests__/skillHandlers.improve.test.ts`     | 既存バリデーションテストの期待値修正（該当箇所あれば） |
| `apps/desktop/src/main/ipc/__tests__/skillHandlers.delegate.test.ts`    | 既存バリデーションテストの影響確認                     |
| `apps/desktop/src/main/ipc/__tests__/skillHandlers.integration.test.ts` | 統合テストのバリデーション関連影響確認                 |

## 統合テスト連携

### 影響範囲の確認

throw形式への変更は以下のフローに影響する:

```
skillHandlers.ts (throw) -> ipcMain.handle (reject) -> ipcRenderer.invoke (reject) -> safeInvoke (catch)
```

safeInvoke はエラーをキャッチし、呼び出し元に reject を伝播する設計のため、Renderer側の既存コードは修正不要。

### 回帰テスト対象

- `apps/desktop/src/main/ipc/__tests__/skillHandlers.test.ts` 内の既存バリデーションテスト
- `apps/desktop/src/main/ipc/__tests__/skillHandlers.execute.test.ts` 内のsender validationテスト
- Renderer側のスキル操作UI（手動テストで確認: Phase 11）

## 多角的チェック観点

| 観点                 | 確認事項                                                                  | 判定基準 |
| -------------------- | ------------------------------------------------------------------------- | -------- |
| P42準拠              | 全6ハンドラに `.trim() === ""` チェックが追加されているか                 | 必須     |
| throw形式統一        | 全6ハンドラのバリデーションエラーが throw 形式であるか                    | 必須     |
| エラーメッセージ     | パラメータ名が正確に反映されているか（skillId / executionId / skillName） | 必須     |
| コードパターン一貫性 | skill:import/remove と同一パターンであるか                                | 必須     |
| Renderer互換性       | safeInvoke のエラーハンドリングが正常動作するか                           | 必須     |
| 既存テスト影響       | return形式を期待するテストが throw 形式に更新されているか                 | 必須     |
| skill:improve分析    | `args.analysis` バリデーションも throw 形式に統一されているか             | 必須     |
| セキュリティ         | IPC層で不正入力が早期拒否されサービス層に到達しないか                     | 必須     |

## 成果物

| #   | 成果物 | パス                                                                             | 形式     |
| --- | ------ | -------------------------------------------------------------------------------- | -------- |
| 1   | 設計書 | docs/30-workflows/completed-tasks/skill-validation-consistency/phase-2-design.md | Markdown |

## 完了条件チェックリスト

- [ ] バリデーション統一パターンが定義されている
- [ ] 全6ハンドラの修正前・修正後コードが明示されている
- [ ] 引数アクセスパターン（オブジェクト型 / 直接引数型）が分類されている
- [ ] throw形式変更のRenderer側影響が分析されている
- [ ] テスト設計方針（追加テスト + 既存テスト修正）が定義されている
- [ ] 修正ファイル一覧が確定している（プロダクションコード1ファイル + テスト5ファイル）
- [ ] describe.each を使用したテスト構造が設計されている
- [ ] バリデーション関数の共通化可否が判断されている
- [ ] skill:improve の `args.analysis` バリデーション修正が設計に含まれている
- [ ] エラーメッセージ統一テーブルが完成している

## 次のPhase

-> Phase 3: 設計レビュー（`phase-3-design-review.md`）
