# Phase 4: テスト作成（TDD: Red） - タスク仕様書

## メタ情報

| 項目       | 内容                    |
| ---------- | ----------------------- |
| Phase      | 4                       |
| Phase名    | テスト作成（TDD: Red）  |
| 前提Phase  | Phase 3（設計レビュー） |
| 後続Phase  | Phase 5（実装）         |
| ステータス | 未実施                  |
| 作成日     | 2026-01-23              |
| 機能名     | system-prompt-llm-api   |

---

## 目的

TDD（テスト駆動開発）のRedフェーズとして、期待される動作を検証するテストを実装より先に作成する。テストは失敗状態で完了する。

## 背景

テストファーストにより、以下を達成する:

- 仕様の明確化
- 実装範囲の限定
- リグレッション防止

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: buildMessages関数のテスト作成

**目的**: メッセージ構築ロジックのテストを作成する

**実行手順**:

1. 正常系テストケースを定義
2. 異常系テストケースを定義
3. 境界値テストケースを定義
4. テストファイルを作成

**テストケース例**:

```typescript
// apps/desktop/src/main/utils/buildMessages.test.ts
describe("buildMessages", () => {
  it("システムプロンプト付きでメッセージ配列を構築する", () => {
    const result = buildMessages("Hello", "You are a translator");
    expect(result).toEqual([
      { role: "system", content: "You are a translator" },
      { role: "user", content: "Hello" },
    ]);
  });

  it("システムプロンプトなしでユーザーメッセージのみ返す", () => {
    const result = buildMessages("Hello");
    expect(result).toEqual([{ role: "user", content: "Hello" }]);
  });

  it("空白のみのシステムプロンプトは無視する", () => {
    const result = buildMessages("Hello", "   ");
    expect(result).toEqual([{ role: "user", content: "Hello" }]);
  });

  it("システムプロンプトの前後空白をトリムする", () => {
    const result = buildMessages("Hello", "  Translate to Japanese  ");
    expect(result).toEqual([
      { role: "system", content: "Translate to Japanese" },
      { role: "user", content: "Hello" },
    ]);
  });
});
```

**期待される成果物**:

- `apps/desktop/src/main/utils/buildMessages.test.ts`

---

### タスク2: LLM Clientのテスト作成

**目的**: LLM API呼び出しロジックのテストを作成する

**実行手順**:

1. 正常系テストケースを定義（各プロバイダー）
2. エラー系テストケースを定義
3. APIモックの設定
4. テストファイルを作成

**テストケース例**:

```typescript
// apps/desktop/src/main/services/llmClient.test.ts
describe("callLLM", () => {
  describe("OpenAI プロバイダー", () => {
    it("システムプロンプト付きでAPIを呼び出す", async () => {
      // モック設定
      const mockResponse = "AI response";
      vi.mocked(generateText).mockResolvedValue({ text: mockResponse });

      const messages = [
        { role: "system", content: "You are a translator" },
        { role: "user", content: "Hello" },
      ];

      const result = await callLLM(messages, {
        provider: "openai",
        apiKey: "test-key",
        model: "gpt-4o",
      });

      expect(result).toBe(mockResponse);
    });
  });

  describe("エラーハンドリング", () => {
    it("APIキー未設定でエラーをスローする", async () => {
      await expect(
        callLLM([], { provider: "openai", apiKey: "" }),
      ).rejects.toThrow("API key is required");
    });

    it("ネットワークエラー時にリトライする", async () => {
      // リトライロジックのテスト
    });
  });
});
```

**期待される成果物**:

- `apps/desktop/src/main/services/llmClient.test.ts`

---

### タスク3: aiHandlers統合テストの作成

**目的**: aiHandlersがLLM Clientを正しく呼び出すことを検証するテストを作成する

**実行手順**:

1. IPC経由のチャット送信テストを定義
2. システムプロンプト付きリクエストのテストを定義
3. エラーレスポンスのテストを定義

**テストケース例**:

```typescript
// apps/desktop/src/main/ipc/aiHandlers.test.ts
describe("ai:chat handler", () => {
  it("システムプロンプト付きでLLM APIを呼び出す", async () => {
    // モック設定
    vi.mocked(callLLM).mockResolvedValue("AI response");

    const request: AIChatRequest = {
      message: "Hello",
      systemPrompt: "You are a translator",
      ragEnabled: false,
    };

    const result = await handleAIChat(request);

    expect(result.success).toBe(true);
    expect(result.data?.message).toBe("AI response");
    expect(callLLM).toHaveBeenCalledWith(
      expect.arrayContaining([
        { role: "system", content: "You are a translator" },
        { role: "user", content: "Hello" },
      ]),
      expect.any(Object),
    );
  });

  it("LLM APIエラー時にエラーレスポンスを返す", async () => {
    vi.mocked(callLLM).mockRejectedValue(new Error("API error"));

    const request: AIChatRequest = {
      message: "Hello",
      ragEnabled: false,
    };

    const result = await handleAIChat(request);

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});
```

**期待される成果物**:

- `apps/desktop/src/main/ipc/aiHandlers.test.ts`（更新）

---

## 参照資料

### Phase成果物

| 資料名               | パス                                      | 内容          |
| -------------------- | ----------------------------------------- | ------------- |
| インターフェース設計 | `outputs/phase-2/interface-design.md`     | Phase 2成果物 |
| 設計レビュー結果     | `outputs/phase-3/design-review-result.md` | Phase 3成果物 |

### システム仕様

| 参照資料                | パス                                                                  | 内容   |
| ----------------------- | --------------------------------------------------------------------- | ------ |
| LLMインターフェース仕様 | `.claude/skills/aiworkflow-requirements/references/interfaces-llm.md` | 型定義 |

---

## 統合テスト連携【必須】

統合テストシナリオを全カテゴリで設計する:

| シナリオカテゴリ   | 検証内容                                  | テストファイル                  |
| ------------------ | ----------------------------------------- | ------------------------------- |
| API接続テスト      | LLMプロバイダーAPI疎通・レスポンス形式    | `llmClient.integration.test.ts` |
| データフローテスト | Renderer→Main→LLM API→Main→Rendererの往復 | `aiHandlers.flow.test.ts`       |
| エラーハンドリング | API障害時のエラーレスポンス               | `llmClient.error.test.ts`       |

---

## 成果物

| 成果物              | パス                                                | 説明         |
| ------------------- | --------------------------------------------------- | ------------ |
| テスト仕様書        | `outputs/phase-4/test-specification.md`             | テスト設計   |
| テストケース一覧    | `outputs/phase-4/test-cases.md`                     | ケース一覧   |
| buildMessagesテスト | `apps/desktop/src/main/utils/buildMessages.test.ts` | テストコード |
| llmClientテスト     | `apps/desktop/src/main/services/llmClient.test.ts`  | テストコード |
| aiHandlersテスト    | `apps/desktop/src/main/ipc/aiHandlers.test.ts`      | テストコード |

---

## 完了条件

- [ ] buildMessages関数のテストが作成されている
- [ ] llmClient関数のテストが作成されている
- [ ] aiHandlers統合テストが作成されている
- [ ] すべてのテストが失敗状態（Red）で完了
- [ ] テストカバレッジ目標が設定されている
- [ ] 統合テストシナリオが全カテゴリで定義されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## TDD検証

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test

# 確認項目
# - [ ] テストが失敗することを確認（Red状態）
```

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認
- [ ] artifacts.jsonが更新されている

---

## 依存関係

- **前提**: Phase 3（設計レビューゲート）がPASS/MINOR判定であること
- **後続**: Phase 5（実装）へ進む

---

## 次のPhase

Phase 5: 実装（TDD: Green）

完了後、以下のファイルを実行してください:

`docs/30-workflows/system-prompt-llm-api/phase-5-implementation.md`
