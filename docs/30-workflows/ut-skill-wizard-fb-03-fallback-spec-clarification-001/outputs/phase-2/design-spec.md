# Phase 2 成果物: 設計仕様書

## タスク情報

| 項目     | 内容                                                  |
| -------- | ----------------------------------------------------- |
| タスクID | UT-SKILL-WIZARD-FB-03-FALLBACK-SPEC-CLARIFICATION-001 |
| 作成日   | 2026-04-11                                            |

## 変更対象ファイル一覧

| ファイルパス                                                                               | 変更種別 | 変更概要                                                                |
| ------------------------------------------------------------------------------------------ | -------- | ----------------------------------------------------------------------- |
| `.claude/skills/task-specification-creator/SKILL.md`                                       | 修正     | [Feedback FB-03] エントリを強化し、フィールド独立推論性の原則を補足追記 |
| `.claude/skills/task-specification-creator/references/phase-template-execution.md`         | 修正     | SmartDefault AC-4 フィールド間独立推論性セクションを追加                |
| `packages/shared/src/services/skillCreator/__tests__/smartDefaultReasoningService.test.ts` | 修正     | TC-FB03-01〜09 を新規 describe ブロックとして追加                       |

## フィールド独立推論性の定義設計

### 責務分離原則

```
purpose → tool（キーワードマッチ）
purpose → timing（正規表現マッチ）
category → format（カテゴリマッピング）
```

各推論関数は独立した引数のみを参照する:

- `inferTool(normalizedPurpose)`: purposeのみ参照
- `inferTiming(normalizedPurpose)`: purposeのみ参照
- `inferFormat(category)`: categoryのみ参照

### 追記内容（SKILL.md）

既存 `[Feedback FB-03]` エントリの補足として以下を追記:

```markdown
#### SmartDefault AC-4 フィールド独立推論性（FB-03補足）

SmartDefaultの各フィールドは独立して推論される。
あるフィールドが空/null/推論不可でも、他フィールドの推論には**影響しない**。

| フィールド | 推論ソース | 空白時の動作 | 他フィールドへの影響 |
| ---------- | ---------- | ------------ | -------------------- |
| tool       | purpose    | null         | なし（独立）         |
| timing     | purpose    | null         | なし（独立）         |
| format     | category   | null         | なし（独立）         |

**誤用例**: purpose空 → 全フィールドnullとみなす ← 誤り
**正用例**: purpose空 → tool/timingのみnull、formatはcategoryから独立推論継続
```

### 追記内容（phase-template-execution.md）

Phase 4（テスト作成）セクションの SmartDefault テスト設計ガイドラインに追記:

```markdown
**[AC-4 フィールド独立推論性]** SmartDefaultのテスト設計では以下を明示すること:

- purpose/category は独立して推論ソースとなる（連鎖nullにならない）
- purpose空でもcategoryが有効ならformatは推論される
- TC-FB03パターンのように「フィールドが独立していること」を明示的にテストする
```

## テストケース設計

### 設計上の修正点

Phase 4 仕様書の TC-FB03-01 は `category: "tool"` を使用しているが、
実装上「tool」はカテゴリマッピングに存在しない（format=null になる）。

**修正**: `category: "code-support"` を使用する（"code" へマッピングされる有効なカテゴリ）

### TC-FB03-01: purpose空・category有効 → format独立推論

```typescript
it("TC-FB03-01: purpose空でもcategoryが有効ならformatは独立して推論される", () => {
  const result = inferSmartDefaults({
    ...base,
    purpose: "",
    category: "code-support",
  });
  expect(result.tool).toBeNull(); // purpose由来 → null
  expect(result.timing).toBeNull(); // purpose由来 → null
  expect(result.format).toBe("code"); // category由来 → 独立推論（non-null）
});
```

### TC-FB03-02: purpose空・category空 → format null（推論ソースなし）

```typescript
it("TC-FB03-02: purpose空・category空ならformatも推論不可でnull", () => {
  const result = inferSmartDefaults({ ...base, purpose: "", category: null });
  expect(result.tool).toBeNull();
  expect(result.timing).toBeNull();
  expect(result.format).toBeNull(); // 推論ソースがないためnull
});
```

### TC-FB03-03: purpose有効・category空 → formatはnull（purposeはformatを駆動しない）

```typescript
it("TC-FB03-03: purpose有効でもcategoryがnullならformatはnull（purposeはformat推論に影響しない）", () => {
  const result = inferSmartDefaults({
    ...base,
    purpose: "コードレビューを自動化するツール",
    category: null,
  });
  expect(result.tool).toBeNull(); // "コードレビュー"はtoolキーワードなし
  expect(result.timing).toBeNull(); // タイミングキーワードなし
  expect(result.format).toBeNull(); // categoryがnull → format推論不可
});
```

### TC-FB03-04: 全フィールド有効 → 全フィールド推論済み（回帰）

```typescript
it("TC-FB03-04: 全フィールド有効なら全て推論される（回帰）", () => {
  const result = inferSmartDefaults({
    ...base,
    purpose: "GitHubのPRレビューを支援するスキル",
    category: "code-support",
  });
  expect(result.tool).toBe("github");
  expect(result.timing).toBeNull(); // タイミングキーワードなし
  expect(result.format).toBe("code");
});
```

## 設計判断・トレードオフ

| 判断事項                    | 採用案                                   | 理由                                                            |
| --------------------------- | ---------------------------------------- | --------------------------------------------------------------- |
| TC-FB03-01 の category値    | "code-support"（仕様書の"tool"から変更） | "tool"は実装のカテゴリマッピングに存在せずformat=nullになるため |
| result.categoryアサーション | 追加しない                               | inferSmartDefaultsの戻り値にcategoryフィールドは存在しない      |
| async/await使用             | 使用しない                               | inferSmartDefaultsは同期関数                                    |
| 新規describeブロック        | 新規追加（既存に追記）                   | 明示的にTC-FB03として命名・分類するため                         |
