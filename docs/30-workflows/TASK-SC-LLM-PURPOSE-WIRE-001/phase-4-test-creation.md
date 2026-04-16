# Phase 4: テスト作成

## メタ情報

| 項目       | 内容                         |
| ---------- | ---------------------------- |
| Phase      | 4                            |
| タスクID   | TASK-SC-LLM-PURPOSE-WIRE-001 |
| 機能名     | llm-purpose-wire             |
| 前提Phase  | Phase 3（PASS または MINOR） |
| 後続Phase  | Phase 5                      |
| 作成日     | 2026-04-16                   |
| ステータス | pending                      |

## 目的

TDD の Red 段階として、`runCreateWorkflow` での LLM 呼び出しと
`StructurePlanJson.purpose` への推論結果格納を先にテスト化する。
実装前にテストが失敗することを確認し、期待値を明確化する。

## 実行タスク

- 事前確認: 既存テストの `create` モード・`runCreateWorkflow` 関連テストの構造確認
- private method テスト方針の明記
- モック設計: `ILLMClient` のモック設計
- テストマトリクス定義: TC-01〜TC-08 のテストケース定義
- テストコードスケルトンの作成: 既存 `SkillCreatorService.test.ts` への追記内容設計
- Red 確認: 実装前にテストが FAIL することを確認

## 参照資料

| 資料名                      | パス                                                                         | 用途                 |
| --------------------------- | ---------------------------------------------------------------------------- | -------------------- |
| Phase 2 設計書              | `outputs/phase-2/design.md`                                                  | インターフェース参照 |
| Phase 3 レビュー結果        | `outputs/phase-3/gate-decision.md`                                           | MINOR 指摘確認       |
| SkillCreatorService.ts      | `apps/desktop/src/main/services/skill/SkillCreatorService.ts`                | 現行実装確認         |
| SkillCreatorService.test.ts | `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.test.ts` | 既存テスト構造確認   |
| ILLMClient インターフェース | `packages/shared/src/services/llm/types.ts`                                  | モック設計の型確認   |

## 実行手順

### 0. 事前確認: 既存テストの調査【必須】

```bash
# create モード・runCreateWorkflow 関連の既存テスト確認
grep -n "create\|runCreate\|purpose\|extract-purpose" \
  apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.test.ts

# llmClient・ILLMClient の既存モック利用確認
grep -rn "ILLMClient\|llmClient\|mockLlm" \
  apps/desktop/src/main/services/skill/__tests__/

# mock-llm-client の既存実装確認
cat packages/shared/src/services/chunking/__tests__/mocks/mock-llm-client.ts

# loadAgent のモック設定確認
grep -n "loadAgent" \
  apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.test.ts
```

### 1. private method テスト方針の明記【必須】

`runCreateWorkflow` は `private` メソッドであるため、直接テストせず
**`createSkill()` の `mode: "create"` 経由で間接的にテスト**する方針を採用する。

- `createSkill({ mode: "create", ... })` を呼び出す
- `mockResourceLoader.loadAgent` のモックで `extractPurposeAgent` の文字列を制御
- `mockLlmClient.complete` のモックで LLM 推論結果を制御
- `StructurePlanJson.purpose` の値は `createSkill` の戻り値（スキルディレクトリパス）では直接確認できないため、
  `mockLlmClient.complete` の呼び出し確認と `mockResourceLoader.loadAgent` の呼び出し引数確認で代替する

> 補足: `purpose` フィールドの具体的な値検証は、将来 `runCreateWorkflow` が `structurePlan` を後続処理に渡す際（`TASK-SC-PLAN-CONNECT-GENERATE-SKILL-MD-001` 完了後）にエンドツーエンドで確認可能になる。

### 2. `ILLMClient` モック設計

```typescript
// テストファイル内のモック定義（既存の mockResourceLoader と同じパターン）
let mockLlmClient: {
  complete: ReturnType<typeof vi.fn>;
};

// beforeEach 内での初期化
mockLlmClient = {
  complete: vi.fn(),
};

// happy path: LLM が purpose 文字列を返す
mockLlmClient.complete.mockResolvedValue({
  success: true,
  data: "このスキルは〇〇を自動化するためのツールです",
});

// 失敗 path: LLM がエラーを返す
mockLlmClient.complete.mockResolvedValue({
  success: false,
  error: new Error("LLM API error"),
});

// 例外 path: LLM が throw する
mockLlmClient.complete.mockRejectedValue(new Error("Network error"));
```

**`Result<string, Error>` 型の整合**:

- `{ success: true, data: string }` が成功ケース
- `{ success: false, error: Error }` が失敗ケース
- `packages/shared/src/types/rag/result.ts` の `Result` 型に準拠

### 3. テストマトリクス定義

**テストファイルパス**: `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.test.ts`（既存ファイルへの追記）

| TC番号 | テスト名（describe / it）                                                                                     | 対象                                | 期待値                                                                           |
| ------ | ------------------------------------------------------------------------------------------------------------- | ----------------------------------- | -------------------------------------------------------------------------------- |
| TC-01  | `createSkill create mode / llmClient が LLM 推論結果を purpose に使用するために呼ばれること`                  | `llmClient.complete` の呼び出し確認 | `complete` が1回呼ばれ、`systemPrompt` に `extract-purpose` の内容が渡ること     |
| TC-02  | `createSkill create mode / llmClient.complete の systemPrompt に extractPurposeAgent が渡ること`              | `complete` の引数確認               | `options.systemPrompt` が `loadAgent("extract-purpose")` の戻り値と一致すること  |
| TC-03  | `createSkill create mode / LLM 呼び出し成功時に purpose が LLM 推論結果になること`                            | purpose フィールドの値確認          | `complete` モックの `data` が purpose として使用されること（スパイ or 間接確認） |
| TC-04  | `createSkill create mode / LLM 呼び出し失敗（result.success=false）時に createSkill がエラーなく完了すること` | フォールバック動作                  | `createSkill` が例外なく完了（スキルディレクトリパスが返ること）                 |
| TC-05  | `createSkill create mode / LLM 例外時に createSkill がエラーなく完了すること`                                 | 例外フォールバック                  | `createSkill` が例外なく完了すること                                             |
| TC-06  | `createSkill create mode / loadAgent 失敗時に createSkill がエラーなく完了すること`                           | loadAgent フォールバック            | `createSkill` が例外なく完了すること（null フォールバック）                      |
| TC-07  | `createSkill create mode / selected config 未選択時に createSkill がエラーなく完了すること`                   | `default client` 省略ケース         | `new SkillCreatorService()` で default client が使われ create が完了すること     |
| TC-08  | `createSkill create mode / loadAgent が "extract-purpose" を引数として呼ばれること`                           | `loadAgent` の引数確認              | `loadAgent("extract-purpose")` が呼ばれること                                    |

### 4. テストコードスケルトン

既存の `SkillCreatorService.test.ts` に以下の `describe` ブロックを追記する:

```typescript
// SkillCreatorService.test.ts への追記
// ---- LLM Purpose Wire テスト (TASK-SC-LLM-PURPOSE-WIRE-001) ----

describe("createSkill - create mode LLM purpose wire", () => {
  let mockLlmClient: { complete: ReturnType<typeof vi.fn> };
  let serviceWithLlm: SkillCreatorService;

  beforeEach(() => {
    mockLlmClient = {
      complete: vi.fn(),
    };

    // llmClient を注入してインスタンス化
    // NOTE: コンストラクタ第3引数として ILLMClient を受け取る設計（Phase 2 参照）
    serviceWithLlm = new SkillCreatorService(
      undefined,
      undefined,
      mockLlmClient as unknown as ILLMClient,
    );

    // loadAgent: extract-purpose と plan-structure の定義を返す
    mockResourceLoader.loadAgent.mockImplementation(
      async (agentName: string) => {
        if (agentName === "extract-purpose") {
          return "# Extract Purpose Agent\nYou are an agent that extracts purpose...";
        }
        if (agentName === "plan-structure") {
          return "# Plan Structure Agent\nYou are an agent that plans structure...";
        }
        throw new Error(`Unknown agent: ${agentName}`);
      },
    );

    // LLM: デフォルトは成功レスポンス
    mockLlmClient.complete.mockResolvedValue({
      success: true,
      data: "このスキルはテスト自動化を支援するためのツールです",
    });

    // init_skill.js の成功レスポンス
    allowGeneratedSkillMd();
  });

  // TC-01: llmClient.complete が呼ばれること
  it("TC-01: llmClient が extract-purpose エージェント定義を systemPrompt に LLM 呼び出しをすること", async () => {
    await serviceWithLlm.createSkill({
      mode: "create",
      name: "test-skill",
      description: "テストスキルの説明",
    });

    expect(mockLlmClient.complete).toHaveBeenCalledTimes(1);
  });

  // TC-02: complete の systemPrompt に extractPurposeAgent が渡ること
  it("TC-02: llmClient.complete の systemPrompt に extract-purpose エージェント定義が渡ること", async () => {
    await serviceWithLlm.createSkill({
      mode: "create",
      name: "test-skill",
      description: "テストスキルの説明",
    });

    expect(mockLlmClient.complete).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        systemPrompt: expect.stringContaining("Extract Purpose Agent"),
      }),
    );
  });

  // TC-04: LLM 失敗（result.success=false）時のフォールバック
  it("TC-04: LLM 呼び出し失敗（result.success=false）時に createSkill がエラーなく完了すること", async () => {
    mockLlmClient.complete.mockResolvedValue({
      success: false,
      error: new Error("LLM API error"),
    });

    await expect(
      serviceWithLlm.createSkill({
        mode: "create",
        name: "test-skill",
        description: "テストスキルの説明",
      }),
    ).resolves.toBeDefined();
  });

  // TC-05: LLM 例外時のフォールバック
  it("TC-05: LLM 例外時に createSkill がエラーなく完了すること", async () => {
    mockLlmClient.complete.mockRejectedValue(new Error("Network error"));

    await expect(
      serviceWithLlm.createSkill({
        mode: "create",
        name: "test-skill",
        description: "テストスキルの説明",
      }),
    ).resolves.toBeDefined();
  });

  // TC-06: loadAgent 失敗時のフォールバック
  it("TC-06: loadAgent 失敗時に createSkill がエラーなく完了すること", async () => {
    mockResourceLoader.loadAgent.mockRejectedValue(
      new Error("Agent not found"),
    );

    await expect(
      serviceWithLlm.createSkill({
        mode: "create",
        name: "test-skill",
        description: "テストスキルの説明",
      }),
    ).resolves.toBeDefined();
  });

  // TC-07: default client が selected config 未選択時のフォールバック
  it("TC-07: selected config 未選択時に createSkill がエラーなく完了すること", async () => {
    // 既存の service（default client）を使用
    await expect(
      service.createSkill({
        mode: "create",
        name: "test-skill",
        description: "テストスキルの説明",
      }),
    ).resolves.toBeDefined();
  });

  // TC-08: loadAgent が "extract-purpose" を引数として呼ばれること
  it("TC-08: loadAgent が extract-purpose を引数として呼ばれること", async () => {
    await serviceWithLlm.createSkill({
      mode: "create",
      name: "test-skill",
      description: "テストスキルの説明",
    });

    expect(mockResourceLoader.loadAgent).toHaveBeenCalledWith(
      "extract-purpose",
    );
  });
});
```

### 5. Red 確認コマンド（実装前にテストが失敗することを確認）

```bash
# 新規テストを実行（実装前なので FAIL が期待される）
pnpm --filter @repo/desktop exec vitest run \
  src/main/services/skill/__tests__/SkillCreatorService.test.ts \
  --reporter=verbose 2>&1 | grep -A 5 "TC-0[1-8]"

# 期待: FAIL（ILLMClient インジェクション未実装・runCreateWorkflow に LLM 呼び出し未実装）
```

**Red 確認のポイント**:

- TC-01: `mockLlmClient.complete` が現状は呼ばれないため FAIL
- TC-02: `complete` 呼び出し自体がないため FAIL
- TC-03: 現状 `purpose` が raw 文字列のため FAIL
- TC-07: `llmClient` 引数がコンストラクタに存在しないため型エラーまたは FAIL

## 統合テスト連携【必須】

| 判定項目       | 基準                              | 結果    |
| -------------- | --------------------------------- | ------- |
| Red 確認       | テストが FAIL すること（TDD Red） | pending |
| 既存テスト影響 | 既存テストへの悪影響がないこと    | pending |

## 多角的チェック観点

| 観点             | チェック内容                                                                                 |
| ---------------- | -------------------------------------------------------------------------------------------- |
| テスト網羅性     | happy path・LLM 失敗・LLM 例外・loadAgent 失敗・llmClient 未注入の全ケースをカバーしているか |
| モック独立性     | 各テストケースが `beforeEach` でモックをリセットし、独立して実行可能か                       |
| 間接検証の妥当性 | `private` の `runCreateWorkflow` を `createSkill` 経由で間接検証できているか                 |
| 型整合           | `ILLMClient` のモック型が `Result<string, Error>` 型と整合しているか                         |

## 成果物

| 成果物           | パス                                                                         | 説明                        |
| ---------------- | ---------------------------------------------------------------------------- | --------------------------- |
| テストコード追記 | `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.test.ts` | TC-01〜TC-08 のテストケース |

## 完了条件

- [ ] 既存テストの `create` モード関連テスト構造確認済み
- [ ] `ILLMClient` モック設計（`Result<string, Error>` 型）が確認済み
- [ ] private method テスト方針（`createSkill` 経由の間接テスト）を明記済み
- [ ] テストマトリクス（TC-01〜TC-08）が定義済み
- [ ] テストコードスケルトンが設計済み（`SkillCreatorService.test.ts` への追記内容）
- [ ] Red 確認コマンドが定義済み
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 事前確認（既存テスト構造・loadAgent モック確認）
2. private method テスト方針の明記
3. `ILLMClient` モック設計
4. テストマトリクス定義（TC-01〜TC-08）
5. テストコードスケルトン設計
6. Red 確認コマンド定義
7. 完了条件の判定

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次Phase

Phase 5: 実装
