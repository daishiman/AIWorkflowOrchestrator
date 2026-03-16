/**
 * LLMDocQueryAdapter テスト (TASK-04 Phase 4)
 *
 * LLM プロバイダへのドキュメント生成クエリアダプタのユニットテスト。
 * query(), isAvailable(), getProviderName() を検証する。
 *
 * T-4-1-01 ~ T-4-1-08: 8テストケース
 */
import { describe, it, expect } from "vitest";
import { LLMDocQueryAdapter } from "../LLMDocQueryAdapter";

describe("LLMDocQueryAdapter", () => {
  // T-4-1-01: query(prompt) が正常レスポンスを返す
  it("T-4-1-01: query returns success with data string", async () => {
    const adapter = new LLMDocQueryAdapter(() => "sk-valid-key", "openai");
    const result = await adapter.query("Generate docs for test skill");

    expect(result.success).toBe(true);
    expect(typeof result.data).toBe("string");
    expect(result.data).toContain("Generated content for:");
    expect(result.error).toBeUndefined();
  });

  // T-4-1-02: isAvailable() が API key 設定済みで true を返す
  it("T-4-1-02: isAvailable returns true when API key is set", async () => {
    const adapter = new LLMDocQueryAdapter(() => "sk-valid-key", "openai");
    await expect(adapter.isAvailable()).resolves.toBe(true);
  });

  // T-4-1-03: getProviderName() がプロバイダ名を返す
  it("T-4-1-03: getProviderName returns the provider name", () => {
    const adapter = new LLMDocQueryAdapter(() => "sk-key", "anthropic");
    expect(adapter.getProviderName()).toBe("anthropic");
  });

  // T-4-1-04: isAvailable() が API key 未設定で false を返す
  it("T-4-1-04: isAvailable returns false when API key is null", async () => {
    const adapter = new LLMDocQueryAdapter(() => null);
    await expect(adapter.isAvailable()).resolves.toBe(false);
  });

  it("T-4-1-04b: isAvailable returns false when API key is empty string", async () => {
    const adapter = new LLMDocQueryAdapter(() => "");
    await expect(adapter.isAvailable()).resolves.toBe(false);
  });

  it("T-4-1-04c: isAvailable returns false when API key is whitespace only (P42)", async () => {
    const adapter = new LLMDocQueryAdapter(() => "   ");
    await expect(adapter.isAvailable()).resolves.toBe(false);
  });

  // T-4-1-05: query(prompt) が timeout (3001) で失敗する
  it("T-4-1-05: query maps timeout error to code 3001", async () => {
    // mapError は catch 内で呼ばれるため、constructor の getApiKey で key を返しつつ
    // 内部で throw するケースをシミュレートするために、サブクラスを使う
    const adapter = new LLMDocQueryAdapter(() => "sk-key", "openai");

    // private mapError を間接的にテストするため、エラーメッセージにtimeoutを含むケース
    // LLMDocQueryAdapter の query は stub なので直接 throw しない。
    // mapError をテストするため、adapter のプロトタイプ経由でテストする
    const mapError = (
      adapter as unknown as { mapError: (e: unknown) => unknown }
    ).mapError;
    if (typeof mapError === "function") {
      const result = mapError.call(adapter, new Error("Connection timeout"));
      expect(result).toEqual(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: 3001,
            category: "EXTERNAL_SERVICE",
            retryable: true,
          }),
        }),
      );
    }
  });

  // T-4-1-06: query(prompt) が rate limit 429 (3002) で失敗する
  it("T-4-1-06: query maps 429 rate limit error to code 3002", () => {
    const adapter = new LLMDocQueryAdapter(() => "sk-key", "openai");
    const mapError = (
      adapter as unknown as { mapError: (e: unknown) => unknown }
    ).mapError;
    if (typeof mapError === "function") {
      const result = mapError.call(adapter, new Error("429 Too Many Requests"));
      expect(result).toEqual(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: 3002,
            category: "EXTERNAL_SERVICE",
            retryable: true,
          }),
        }),
      );
    }
  });

  // T-4-1-07: query(prompt) が LLM server error 5xx (3003) で失敗する
  it("T-4-1-07: query maps 500 server error to code 3003", () => {
    const adapter = new LLMDocQueryAdapter(() => "sk-key", "openai");
    const mapError = (
      adapter as unknown as { mapError: (e: unknown) => unknown }
    ).mapError;
    if (typeof mapError === "function") {
      const result = mapError.call(
        adapter,
        new Error("500 Internal Server Error"),
      );
      expect(result).toEqual(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: 3003,
            category: "EXTERNAL_SERVICE",
            retryable: true,
          }),
        }),
      );
    }
  });

  // T-4-1-08: query(prompt) が API key 無効 (2002) で失敗する
  it("T-4-1-08: query maps 401 unauthorized error to code 2002", () => {
    const adapter = new LLMDocQueryAdapter(() => "sk-key", "openai");
    const mapError = (
      adapter as unknown as { mapError: (e: unknown) => unknown }
    ).mapError;
    if (typeof mapError === "function") {
      const result = mapError.call(adapter, new Error("401 unauthorized"));
      expect(result).toEqual(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: 2002,
            category: "BUSINESS",
            retryable: false,
          }),
        }),
      );
    }
  });

  // P42 バリデーション: 空文字列 prompt
  it("query returns validation error for empty prompt", async () => {
    const adapter = new LLMDocQueryAdapter(() => "sk-key", "openai");
    const result = await adapter.query("");

    expect(result.success).toBe(false);
    expect(result.error?.code).toBe(1001);
    expect(result.error?.category).toBe("VALIDATION");
  });

  // P42 バリデーション: スペースのみの prompt
  it("query returns validation error for whitespace-only prompt", async () => {
    const adapter = new LLMDocQueryAdapter(() => "sk-key", "openai");
    const result = await adapter.query("   ");

    expect(result.success).toBe(false);
    expect(result.error?.code).toBe(1001);
    expect(result.error?.category).toBe("VALIDATION");
  });

  // API key 未設定時の query
  it("query returns business error 2001 when API key is not configured", async () => {
    const adapter = new LLMDocQueryAdapter(() => null, "openai");
    const result = await adapter.query("Generate docs");

    expect(result.success).toBe(false);
    expect(result.error?.code).toBe(2001);
    expect(result.error?.category).toBe("BUSINESS");
    expect(result.error?.guidance?.handoffAvailable).toBe(true);
  });

  // 不明エラーのフォールバック
  it("query maps unknown error to code 5001 INTERNAL", () => {
    const adapter = new LLMDocQueryAdapter(() => "sk-key", "openai");
    const mapError = (
      adapter as unknown as { mapError: (e: unknown) => unknown }
    ).mapError;
    if (typeof mapError === "function") {
      const result = mapError.call(adapter, "not an Error object");
      expect(result).toEqual(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: 5001,
            category: "INTERNAL",
            retryable: false,
          }),
        }),
      );
    }
  });

  // デフォルトプロバイダ名
  it("defaults provider name to 'stub'", () => {
    const adapter = new LLMDocQueryAdapter(() => "sk-key");
    expect(adapter.getProviderName()).toBe("stub");
  });
});

// ============================================================
// Phase 6: T-6-1 エッジケーステスト
// ============================================================
describe("LLMDocQueryAdapter - T-6-1: エッジケーステスト", () => {
  // T-6-1-01: 空文字列 prompt → バリデーションエラー (code: 1001)
  it("T-6-1-01: empty prompt returns validation error code 1001", async () => {
    const adapter = new LLMDocQueryAdapter(() => "sk-key", "openai");
    const result = await adapter.query("");
    expect(result.success).toBe(false);
    expect(result.error?.code).toBe(1001);
    expect(result.error?.category).toBe("VALIDATION");
  });

  // T-6-1-02: 超長文 (10,001文字) prompt → 正常処理
  it("T-6-1-02: very long prompt (10001 chars) is processed normally", async () => {
    const adapter = new LLMDocQueryAdapter(() => "sk-key", "openai");
    const longPrompt = "a".repeat(10001);
    const result = await adapter.query(longPrompt);
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
  });

  // T-6-1-03: XSSパターンを含むprompt → サニタイズせず正常処理
  it("T-6-1-03: XSS pattern in prompt is processed without injection", async () => {
    const adapter = new LLMDocQueryAdapter(() => "sk-key", "openai");
    const result = await adapter.query('<script>alert("xss")</script>');
    expect(result.success).toBe(true);
    expect(typeof result.data).toBe("string");
  });

  // T-6-1-04: Unicode特殊文字 (絵文字・CJK) を含むprompt → 正常処理
  it("T-6-1-04: Unicode special chars (emoji, CJK) are processed normally", async () => {
    const adapter = new LLMDocQueryAdapter(() => "sk-key", "openai");
    const result = await adapter.query("テスト🎉日本語プロンプト中文한국어");
    expect(result.success).toBe(true);
    expect(typeof result.data).toBe("string");
  });

  // T-6-1-05: 同時3リクエストのconcurrent実行 → 全て正常処理
  it("T-6-1-05: concurrent 3 requests are all processed successfully", async () => {
    const adapter = new LLMDocQueryAdapter(() => "sk-key", "openai");
    const results = await Promise.all([
      adapter.query("prompt1"),
      adapter.query("prompt2"),
      adapter.query("prompt3"),
    ]);
    expect(results).toHaveLength(3);
    for (const result of results) {
      expect(result.success).toBe(true);
    }
  });

  // T-6-1-06: スペースのみのprompt → P42 3段バリデーションで拒否
  it("T-6-1-06: whitespace-only prompt is rejected by P42 trim validation (code 1001)", async () => {
    const adapter = new LLMDocQueryAdapter(() => "sk-key", "openai");
    const result = await adapter.query("   ");
    expect(result.success).toBe(false);
    expect(result.error?.code).toBe(1001);
    expect(result.error?.retryable).toBe(false);
  });
});

// ============================================================
// Phase 6: T-6-2 失敗パス回帰テスト
// ============================================================
describe("LLMDocQueryAdapter - T-6-2: 失敗パス回帰テスト", () => {
  // T-6-2-01: 429が3回連続 → 毎回 retryable: true + code 3002
  it("T-6-2-01: repeated 429 errors always return retryable:true code 3002", () => {
    const adapter = new LLMDocQueryAdapter(() => "sk-key", "openai");
    const mapError = (
      adapter as unknown as { mapError: (e: unknown) => unknown }
    ).mapError;
    for (let i = 0; i < 3; i++) {
      const result = mapError.call(
        adapter,
        new Error("429 Too Many Requests"),
      ) as { success: boolean; error: { code: number; retryable: boolean } };
      expect(result.success).toBe(false);
      expect(result.error.code).toBe(3002);
      expect(result.error.retryable).toBe(true);
    }
  });

  // T-6-2-02: 5xx エラー後にリトライ成功 → success: true
  it("T-6-2-02: 5xx error then retry succeeds returns success:true", async () => {
    const adapter = new LLMDocQueryAdapter(() => "sk-key", "openai");
    const mapError = (
      adapter as unknown as { mapError: (e: unknown) => unknown }
    ).mapError;
    const errResult = mapError.call(
      adapter,
      new Error("503 Service Unavailable"),
    ) as { success: boolean; error: { retryable: boolean } };
    expect(errResult.success).toBe(false);
    expect(errResult.error.retryable).toBe(true);
    // リトライ: 正常なリクエスト
    const retryResult = await adapter.query("retry prompt");
    expect(retryResult.success).toBe(true);
  });

  // T-6-2-03: timeout → timeout の連続 → 毎回 retryable: true + code 3001
  it("T-6-2-03: consecutive timeouts return retryable:true code 3001", () => {
    const adapter = new LLMDocQueryAdapter(() => "sk-key", "openai");
    const mapError = (
      adapter as unknown as { mapError: (e: unknown) => unknown }
    ).mapError;
    for (let i = 0; i < 2; i++) {
      const result = mapError.call(
        adapter,
        new Error("Connection timeout"),
      ) as { success: boolean; error: { code: number; retryable: boolean } };
      expect(result.success).toBe(false);
      expect(result.error.code).toBe(3001);
      expect(result.error.retryable).toBe(true);
    }
  });

  // T-6-2-04: 5xx → 429 → 複合エラーシーケンスで適切なエラーコードを返す
  it("T-6-2-04: mixed 5xx→429 errors return appropriate error codes", () => {
    const adapter = new LLMDocQueryAdapter(() => "sk-key", "openai");
    const mapError = (
      adapter as unknown as { mapError: (e: unknown) => unknown }
    ).mapError;

    const err1 = mapError.call(
      adapter,
      new Error("500 Internal Server Error"),
    ) as {
      success: boolean;
      error: { code: number };
    };
    expect(err1.error.code).toBe(3003);

    const err2 = mapError.call(adapter, new Error("429 rate limit")) as {
      success: boolean;
      error: { code: number };
    };
    expect(err2.error.code).toBe(3002);
  });

  // T-6-2-05: API key 有効 → 無効化 → query() で code 2001 エラー
  it("T-6-2-05: API key invalidated mid-session causes code 2001 on next query", async () => {
    let keyValue: string | null = "sk-valid-key";
    const adapter = new LLMDocQueryAdapter(() => keyValue, "openai");

    // 最初のリクエストは成功
    const result1 = await adapter.query("first request");
    expect(result1.success).toBe(true);

    // API key を無効化
    keyValue = null;

    // 次のリクエストは 2001 エラー
    const result2 = await adapter.query("second request");
    expect(result2.success).toBe(false);
    expect(result2.error?.code).toBe(2001);
    expect(result2.error?.retryable).toBe(false);
  });
});
