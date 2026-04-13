# Phase 4 成果物: テストケース定義書

## タスク情報

| 項目     | 内容                                                  |
| -------- | ----------------------------------------------------- |
| タスクID | UT-SKILL-WIZARD-FB-03-FALLBACK-SPEC-CLARIFICATION-001 |
| 作成日   | 2026-04-11                                            |

## 事前確認結果

| 確認項目                 | 結果                                                                                       |
| ------------------------ | ------------------------------------------------------------------------------------------ |
| 既存テストの命名規則     | describe("inferSmartDefaults") 内に describe("分類名") → it("テスト説明") 構造             |
| テストファイルパス       | `packages/shared/src/services/skillCreator/__tests__/smartDefaultReasoningService.test.ts` |
| inferSmartDefaults の型  | 同期関数（async/await 不要）                                                               |
| 既存テスト件数           | 33件（PASS）                                                                               |
| private methodテスト方針 | N/A（docs-onlyタスク。公開APIのみテスト）                                                  |

## 設計修正事項（Phase 4 仕様書からの変更）

| 仕様書記述                     | 修正版                     | 理由                                                  |
| ------------------------------ | -------------------------- | ----------------------------------------------------- |
| `category: "tool"`             | `category: "code-support"` | "tool"はcategoryマッピングに存在せずformat=nullになる |
| `result.category` アサーション | 削除                       | inferSmartDefaultsの戻り値にcategoryフィールドなし    |
| `async inferSmartDefaults`     | 同期呼び出し               | inferSmartDefaultsは同期関数                          |

## テストケース一覧（TC-FB03-01〜04 / Red → Green）

### TC-FB03-01: purpose空・category有効 → format独立推論

```typescript
it("TC-FB03-01: purpose空でもcategoryが有効ならformatは独立して推論される", () => {
  const result = inferSmartDefaults({
    ...base,
    purpose: "", // 空文字 → tool/timing=null
    category: "code-support", // 有効 → format独立推論継続
  });
  expect(result.tool).toBeNull(); // purposeのみnull影響
  expect(result.timing).toBeNull(); // purposeのみnull影響
  expect(result.format).toBe("code"); // categoryから独立推論（non-null）
});
```

### TC-FB03-02: purpose空・category空 → format null（推論ソースなし）

```typescript
it("TC-FB03-02: purpose空・categoryもnullならformatも推論不可でnull", () => {
  const result = inferSmartDefaults({
    ...base,
    purpose: "",
    category: null,
  });
  expect(result.tool).toBeNull();
  expect(result.timing).toBeNull();
  expect(result.format).toBeNull(); // 推論ソースがないためnull（正常フォールバック）
});
```

### TC-FB03-03: purpose有効・category null → formatはnull（purposeはformat推論に影響しない）

```typescript
it("TC-FB03-03: purpose有効でもcategoryがnullならformatはnull（purposeはformat推論に影響しない）", () => {
  const result = inferSmartDefaults({
    ...base,
    purpose: "コードレビューを自動化するツール", // length: 15
    category: null,
  });
  expect(result.tool).toBeNull(); // "コードレビュー"にtoolキーワードなし
  expect(result.timing).toBeNull(); // タイミングキーワードなし
  expect(result.format).toBeNull(); // categoryがnullのためformat推論不可
});
```

### TC-FB03-04: 全フィールド有効 → 全て推論済み（回帰）

```typescript
it("TC-FB03-04: 全フィールド有効なら全て推論される（回帰）", () => {
  const result = inferSmartDefaults({
    ...base,
    purpose: "GitHubのPRレビューを支援するスキル", // length: 18
    category: "code-support",
  });
  expect(result.tool).toBe("github");
  expect(result.timing).toBeNull(); // タイミングキーワードなし
  expect(result.format).toBe("code");
});
```

## 追加テストケース一覧（TC-FB03-05〜09 / Phase 6で追加）

Phase 6（テスト拡充）で以下のエッジケース・回帰ガードを追加する:

| TC-ID      | 概要                          | 入力                                                     | 期待値                                          |
| ---------- | ----------------------------- | -------------------------------------------------------- | ----------------------------------------------- |
| TC-FB03-05 | 全フィールドnull入力          | purpose=null, category=null                              | tool/timing/format=null                         |
| TC-FB03-06 | undefined+valid category      | purpose=undefined, category="code-support"               | tool/timing=null, format="code"                 |
| TC-FB03-07 | 空白only+valid category       | purpose=" ", category="code-support"                     | tool/timing=null, format="code"                 |
| TC-FB03-08 | 最小有効purpose+null category | purpose="ツール"(length:3), category=null                | format=null                                     |
| TC-FB03-09 | 既存正常系回帰                | purpose="毎日Slackに通知を送る", category="code-support" | tool="slack", timing="scheduled", format="code" |

## テストファイル変更計画

既存の `describe("inferSmartDefaults")` ブロックの末尾に
新規 describe ブロックを追加する：

```typescript
// --- SmartDefault フィールド独立推論性（TC-FB03） ---
describe("SmartDefault フィールド独立推論性（TC-FB03）", () => {
  // TC-FB03-01〜04（Phase 4）
  // TC-FB03-05〜09（Phase 6）
});
```
