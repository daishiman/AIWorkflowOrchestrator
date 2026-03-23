# Phase 4: テスト作成 — 共有型スキーマ拡張検討

## メタ情報

| 項目      | 値                      |
| --------- | ----------------------- |
| Phase番号 | 4                       |
| 機能名    | schema-extension        |
| タスクID  | TASK-LLM-MOD-05         |
| 作成日    | 2026-03-23              |
| 依存Phase | Phase 3（設計レビュー） |

## 目的

`description` フィールドが `PROVIDER_CONFIGS` → `handleGetProviders()` → IPC → Renderer まで通るパスを検証するテストケースを設計・実装する（TDDのRedフェーズ）。

## 実行タスク

### Task 4-1: テストケース設計

#### グループ A: LLMModelSchema の description バリデーション

**テストファイル**: `packages/shared/src/types/llm/schemas/__tests__/provider.test.ts`

| テストID | 説明                                     | 入力                                                                             | 期待値                                                                  |
| -------- | ---------------------------------------- | -------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| TS-A-01  | descriptionなしの最小モデルが通ること    | `{ id: "gpt-4o", name: "GPT-4o" }`                                               | `success: true`、`data.description === undefined`                       |
| TS-A-02  | descriptionありのモデルが通ること        | `{ id: "gpt-4o", name: "GPT-4o", description: "Most capable multimodal model" }` | `success: true`、`data.description === "Most capable multimodal model"` |
| TS-A-03  | description が空文字列の場合に通ること   | `{ id: "gpt-4o", name: "GPT-4o", description: "" }`                              | `success: true`（schema上は空文字OK）                                   |
| TS-A-04  | description が null の場合に失敗すること | `{ id: "gpt-4o", name: "GPT-4o", description: null }`                            | `success: false`                                                        |

**注意**: TS-A-02 は既存の TS-002-02 でカバー済み。重複を避けつつ、description の伝搬に特化した追加テストを作成する。

#### グループ B: handleGetProviders の description 伝搬

**テストファイル**: `apps/desktop/src/main/handlers/__tests__/llm.test.ts`

| テストID | 説明                                                                 | 前提条件                          | 期待値                                                    |
| -------- | -------------------------------------------------------------------- | --------------------------------- | --------------------------------------------------------- |
| TS-B-01  | PROVIDER_CONFIGS に description を設定した場合に返却値に含まれること | APIキーあり（SecureStorage mock） | 返却されたモデルに `description` フィールドが含まれる     |
| TS-B-02  | PROVIDER_CONFIGS に description がない場合は返却値に含まれないこと   | APIキーあり（SecureStorage mock） | 返却されたモデルに `description` フィールドが `undefined` |

**注意**: `handleGetProviders()` は `SecureStorage.getApiKey()` を呼び出すため、モックが必要。既存のテストファイルのインポートパスを参照してから記述すること（P63対策）。

### Task 4-2: テストコード実装

#### TS-A-01 〜 TS-A-04 の実装箇所

`packages/shared/src/types/llm/schemas/__tests__/provider.test.ts` の既存 `describe("LLMModelSchema")` ブロック内に追加する。

既存の TS-002-02 が `description` を検証しているため、以下のテストを `describe("TS-002: LLMModelSchema")` 内の新しいネストブロックとして追加する:

```typescript
describe("TS-A: description フィールドの伝搬確認", () => {
  it("TS-A-01: descriptionなしの最小モデルで description が undefined", () => {
    const input = { id: "gpt-4o", name: "GPT-4o" };
    const result = LLMModelSchema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.description).toBeUndefined();
    }
  });

  it("TS-A-02: descriptionありのモデルで description が保持される（TS-002-02と重複のため既存で確認済み）", () => {
    // TS-002-02 で既にカバーされているため省略可。確認のみ行う。
    const input = {
      id: "gpt-4o",
      name: "GPT-4o",
      description: "Most capable multimodal model",
    };
    const result = LLMModelSchema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.description).toBe("Most capable multimodal model");
    }
  });

  it("TS-A-03: description が空文字列の場合もバリデーションを通過する", () => {
    const input = { id: "gpt-4o", name: "GPT-4o", description: "" };
    const result = LLMModelSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it("TS-A-04: description が null の場合はバリデーションに失敗する", () => {
    const input = { id: "gpt-4o", name: "GPT-4o", description: null };
    const result = LLMModelSchema.safeParse(input);
    expect(result.success).toBe(false);
  });
});
```

#### TS-B-01, TS-B-02 の実装箇所

`apps/desktop/src/main/handlers/__tests__/llm.test.ts` に追加する。既存ファイルのインポートパターンを確認してから記述する（P63対策）:

```bash
grep -n "^import" apps/desktop/src/main/handlers/__tests__/llm.test.ts
```

**追加するテスト（概要）:**

```typescript
describe("handleGetProviders - description 伝搬", () => {
  it("TS-B-01: PROVIDER_CONFIGSのモデルに description がある場合、返却値に含まれる", async () => {
    // SecureStorage.getApiKey が "sk-test" を返すようにモック
    // handleGetProviders() を呼び出す
    // 返却値の models[0].description が存在することを確認
  });

  it("TS-B-02: PROVIDER_CONFIGSのモデルに description がない場合、返却値に description は含まれない", async () => {
    // description なしのモデルを確認
    // 返却値の models[0].description が undefined であることを確認
  });
});
```

### Task 4-3: テスト実行（Red確認）

Phase 5 実装前にテストが失敗することを確認する。

```bash
cd apps/desktop && pnpm vitest run src/main/handlers/__tests__/llm.test.ts
cd packages/shared && pnpm vitest run src/types/llm/schemas/__tests__/provider.test.ts
```

**期待される状態**:

- TS-A-01, TS-A-03, TS-A-04: `PROVIDER_CONFIGS` に `description` が追加されていないため、実装依存のテストは失敗（ただしスキーマテストはすでにPASSの可能性あり）
- TS-B-01: `PROVIDER_CONFIGS` に `description` がないためモデルに含まれず失敗

## 参照資料

| 資料                                                               | 用途                   |
| ------------------------------------------------------------------ | ---------------------- |
| `packages/shared/src/types/llm/schemas/__tests__/provider.test.ts` | 既存テスト確認・追加先 |
| `apps/desktop/src/main/handlers/__tests__/llm.test.ts`             | 既存テスト確認・追加先 |
| `apps/desktop/src/main/handlers/llm.ts`                            | テスト対象の実装確認   |
| Phase 2 設計書                                                     | テスト設計の基礎       |

## 成果物

| 成果物                       | パス                                                               | 備考                    |
| ---------------------------- | ------------------------------------------------------------------ | ----------------------- |
| スキーマバリデーションテスト | `packages/shared/src/types/llm/schemas/__tests__/provider.test.ts` | TS-A-01 〜 TS-A-04 追加 |
| ハンドラー統合テスト         | `apps/desktop/src/main/handlers/__tests__/llm.test.ts`             | TS-B-01, TS-B-02 追加   |

## 統合テスト連携

TS-B-01 と TS-B-02 は `handleGetProviders()` と `PROVIDER_CONFIGS` の統合テストである。Phase 5 実装後に PASS になることを確認する。

## 完了条件

- [ ] テストケース設計（TS-A-01〜A-04、TS-B-01、TS-B-02）が完了した
- [ ] 既存テストファイルのインポートパスを確認してからテストコードを記述した（P63対策）
- [ ] テストコードを実装した（provider.test.ts への追加）
- [ ] Phase 5 実装前に TS-B-01 がRedフェーズ（失敗）であることを確認した
- [ ] スキーマテスト（TS-A系）は既存実装でPASSになる可能性があり、その場合は Phase 5 での変更が最小限であることを記録した

## 次のPhase

[Phase 5: 実装](./phase-5-implementation.md)
