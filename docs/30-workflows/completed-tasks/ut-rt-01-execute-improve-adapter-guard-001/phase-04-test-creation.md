# Phase 4: テスト作成 — TASK-UT-RT-01-EXECUTE-IMPROVE-ADAPTER-GUARD-001

## メタ情報

| 項目     | 値                                              |
| -------- | ----------------------------------------------- |
| Phase    | 4                                               |
| タスクID | TASK-UT-RT-01-EXECUTE-IMPROVE-ADAPTER-GUARD-001 |
| 機能名   | ut-rt-01-execute-improve-adapter-guard-001      |
| 作成日   | 2026-04-04                                      |
| 依存     | Phase 3 承認                                    |

## 目的

TDD Red フェーズ。`execute()` / `improve()` のアダプターステータスチェックに対するテストを先に定義し、実装前に失敗することを確認する。

## テスト対象ファイル

`apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.adapter-status.test.ts`

## テストマトリクス

### T-EX グループ: execute() エラーレスポンス

| テストID | ステータス                | 期待レスポンス                                                                                                                 | 優先度 |
| -------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ------ |
| T-EX-01  | `failed`                  | `{ success: false, error: { code: "llm_adapter_unavailable", message: "Connection refused" } }`                                | HIGH   |
| T-EX-02  | `initializing`            | `{ success: false, error: { code: "llm_adapter_unavailable", message: "LLMAdapter の初期化中です。しばらくお待ちください" } }` | HIGH   |
| T-EX-03  | `failed` + API key エラー | `{ success: false, error: { code: "llm_adapter_unavailable", message: "APIキーを設定してください" } }`                         | MEDIUM |

### T-IM グループ: improve() エラーレスポンス（adapter status）

| テストID | ステータス                | 期待レスポンス                                                                                                                 | 優先度 |
| -------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ------ |
| T-IM-01  | `failed`                  | `{ success: false, error: { code: "llm_adapter_unavailable", message: "Connection refused" } }`                                | HIGH   |
| T-IM-02  | `initializing`            | `{ success: false, error: { code: "llm_adapter_unavailable", message: "LLMAdapter の初期化中です。しばらくお待ちください" } }` | HIGH   |
| T-IM-03  | `failed` + API key エラー | `{ success: false, error: { code: "llm_adapter_unavailable", message: "APIキーを設定してください" } }`                         | MEDIUM |

### T-COMPAT-02 更新

| テストID    | 変更前                                                                     | 変更後                                                                |
| ----------- | -------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| T-COMPAT-02 | 期待メッセージ: `"LLM アダプタが利用できません。設定を確認してください。"` | 期待メッセージ: `"LLMAdapter の初期化中です。しばらくお待ちください"` |

**変更理由**: `improve()` に `_llmAdapterStatus` チェックを追加することで、`!this.llmAdapter` チェックより先に `"initializing"` ガードが発火するため。

### T-CP: shared type contract parity

| テストID | 対象ファイル                                                               | 期待動作                                                                          |
| -------- | -------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| T-CP-01  | `packages/shared/src/types/__tests__/skillCreator.contract-parity.test.ts` | `RuntimeSkillCreatorExecuteResponse` の expected union に error response を含める |

## テストコード（T-EX グループ）

```typescript
// apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.adapter-status.test.ts

describe("execute() エラーレスポンス", () => {
  const mockPlanResult = {
    planId: "plan-1",
    skillSpec: "test spec",
    estimatedSteps: 1,
    skillName: "test",
    description: "test",
    agents: [],
    scripts: [],
    triggers: [],
    anchors: [],
  };

  it("T-EX-01: status === 'failed' で execute() はエラーレスポンスを返す", async () => {
    const facade = new RuntimeSkillCreatorFacade({
      skillExecutor: createMockSkillExecutor(),
    });
    facade.setLLMAdapterFailed("Connection refused");

    const result = await facade.execute(mockPlanResult, "api-key", "sk-test");

    expect(result).toEqual({
      success: false,
      error: {
        code: "llm_adapter_unavailable",
        message: "Connection refused",
      },
    });
  });

  it("T-EX-02: status === 'initializing' で execute() はエラーレスポンスを返す", async () => {
    const facade = new RuntimeSkillCreatorFacade({
      skillExecutor: createMockSkillExecutor(),
    });

    const result = await facade.execute(mockPlanResult, "api-key", "sk-test");

    expect(result).toEqual({
      success: false,
      error: {
        code: "llm_adapter_unavailable",
        message: "LLMAdapter の初期化中です。しばらくお待ちください",
      },
    });
  });

  it("T-EX-03: API key 未設定エラーで failed → actionable メッセージ", async () => {
    const facade = new RuntimeSkillCreatorFacade({
      skillExecutor: createMockSkillExecutor(),
    });
    facade.setLLMAdapterFailed(
      "ANTHROPIC_API_KEY environment variable is not set",
    );

    const result = await facade.execute(mockPlanResult, "api-key", "sk-test");

    expect(result).toHaveProperty("success", false);
    expect(result).toHaveProperty("error.message", "APIキーを設定してください");
  });
});
```

## テストコード（T-IM グループ）

```typescript
describe("improve() エラーレスポンス (adapter status)", () => {
  it("T-IM-01: status === 'failed' で improve() はエラーレスポンスを返す", async () => {
    const facade = new RuntimeSkillCreatorFacade({
      skillExecutor: createMockSkillExecutor(),
    });
    facade.setLLMAdapterFailed("Connection refused");

    const result = await facade.improve(
      "skill-a",
      "need improvement",
      "api-key",
      "sk-test",
    );

    expect(result).toEqual({
      success: false,
      error: {
        code: "llm_adapter_unavailable",
        message: "Connection refused",
      },
    });
  });

  it("T-IM-02: status === 'initializing' で improve() はエラーレスポンスを返す", async () => {
    const facade = new RuntimeSkillCreatorFacade({
      skillExecutor: createMockSkillExecutor(),
    });

    const result = await facade.improve(
      "skill-a",
      "need improvement",
      "api-key",
      "sk-test",
    );

    expect(result).toEqual({
      success: false,
      error: {
        code: "llm_adapter_unavailable",
        message: "LLMAdapter の初期化中です。しばらくお待ちください",
      },
    });
  });

  it("T-IM-03: API key 未設定エラーで failed → actionable メッセージ", async () => {
    const facade = new RuntimeSkillCreatorFacade({
      skillExecutor: createMockSkillExecutor(),
    });
    facade.setLLMAdapterFailed(
      "ANTHROPIC_API_KEY environment variable is not set",
    );

    const result = await facade.improve(
      "skill-a",
      "need improvement",
      "api-key",
      "sk-test",
    );

    expect(result).toHaveProperty("success", false);
    expect(result).toHaveProperty("error.message", "APIキーを設定してください");
  });
});
```

## 実行コマンド

```bash
# adapter-status テストのみ実行
pnpm --filter @repo/desktop test -- --testPathPattern="adapter-status"

# ターゲットファイル全テスト実行
pnpm --filter @repo/desktop test -- --testPathPattern="RuntimeSkillCreatorFacade"
```

## 成果物

- Phase 4 テスト仕様書（本ファイル）
- テストマトリクス（T-EX-01〜03、T-IM-01〜03、T-COMPAT-02 更新）
- テストコードスニペット

## 完了条件

- [x] T-EX-01〜03 のテストコードを記述した
- [x] T-IM-01〜03 のテストコードを記述した
- [x] T-COMPAT-02 の更新方針を確定した
- [x] 命名規則（テストID、describe ブロック名）が既存テストと整合している

## 次のPhase

Phase 5: 実装
