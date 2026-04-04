import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { HttpExternalApiAdapter } from "../HttpExternalApiAdapter";

describe("HttpExternalApiAdapter", () => {
  let adapter: HttpExternalApiAdapter;
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    adapter = new HttpExternalApiAdapter();
    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ──────────────────────────────────────────
  // Phase 4: 基本テスト T-01〜T-08
  // ──────────────────────────────────────────

  it("T-01: GET 200レスポンスをT型で返す", async () => {
    const mockData = { id: 1, name: "テストデータ" };
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockData,
    });

    const result = await adapter.get<typeof mockData>(
      "https://api.example.com/data",
    );

    expect(result).toEqual(mockData);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.example.com/data",
      expect.objectContaining({ method: "GET" }),
    );
  });

  it("T-02: POST JSONボディを送信し200レスポンスを返す", async () => {
    const requestBody = { query: "外部API接続テスト" };
    const mockResponse = { result: "success" };
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockResponse,
    });

    const result = await adapter.post<typeof mockResponse>(
      "https://api.example.com/query",
      requestBody,
    );

    expect(result).toEqual(mockResponse);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.example.com/query",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(requestBody),
      }),
    );
  });

  it("T-03: api-key認証でリクエストにX-API-Keyヘッダーが付与される", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({}),
    });

    adapter.setAuth("api-key", "my-secret-api-key");
    await adapter.get("https://api.example.com/resource");

    const calledHeaders = fetchMock.mock.calls[0][1].headers;
    expect(calledHeaders["X-API-Key"]).toBe("my-secret-api-key");
  });

  it("T-04: bearer認証でAuthorization: Bearer ヘッダーが付与される", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({}),
    });

    adapter.setAuth("bearer", "my-bearer-token");
    await adapter.get("https://api.example.com/resource");

    const calledHeaders = fetchMock.mock.calls[0][1].headers;
    expect(calledHeaders["Authorization"]).toBe("Bearer my-bearer-token");
  });

  it("T-05: basic認証でAuthorization: Basic ヘッダーがbase64エンコードされて付与される", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({}),
    });

    adapter.setAuth("basic", "user:password");
    await adapter.get("https://api.example.com/resource");

    const calledHeaders = fetchMock.mock.calls[0][1].headers;
    expect(calledHeaders["Authorization"]).toBe("Basic dXNlcjpwYXNzd29yZA==");
  });

  it("T-06: 30秒タイムアウトでExternalApiTimeoutErrorがスローされる", async () => {
    const abortError = new DOMException(
      "The operation was aborted",
      "AbortError",
    );
    fetchMock.mockRejectedValueOnce(abortError);

    await expect(
      adapter.get("https://api.example.com/slow"),
    ).rejects.toMatchObject({
      name: "ExternalApiTimeoutError",
      url: "https://api.example.com/slow",
    });
  });

  it("T-07: 404レスポンスでExternalApiHttpErrorがスローされる（statusCode=404）", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({ message: "Not Found" }),
    });

    await expect(
      adapter.get("https://api.example.com/missing"),
    ).rejects.toMatchObject({
      name: "ExternalApiHttpError",
      statusCode: 404,
      url: "https://api.example.com/missing",
    });
  });

  it("T-08: APIキーがconsole.logに出力されない（セキュリティ検証）", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({}),
    });

    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    const infoSpy = vi.spyOn(console, "info").mockImplementation(() => {});

    adapter.setAuth("api-key", "super-secret-key-12345");
    await adapter.get("https://api.example.com/resource");

    const allLogCalls = [
      ...logSpy.mock.calls.flat(),
      ...infoSpy.mock.calls.flat(),
    ].join(" ");
    expect(allLogCalls).not.toContain("super-secret-key-12345");
  });

  // ──────────────────────────────────────────
  // Phase 6: 拡充テスト T-09〜T-15
  // ──────────────────────────────────────────

  it("T-09: ネットワークエラー（DNS解決失敗等）が元のエラーとしてスローされる", async () => {
    const networkError = new TypeError("Failed to fetch");
    fetchMock.mockRejectedValueOnce(networkError);

    await expect(
      adapter.get("https://nonexistent.example.com/data"),
    ).rejects.toThrow(TypeError);
  });

  it("T-10: 500レスポンスでExternalApiHttpErrorがスローされる（statusCode=500）", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ message: "Internal Server Error" }),
    });

    await expect(
      adapter.get("https://api.example.com/error"),
    ).rejects.toMatchObject({
      name: "ExternalApiHttpError",
      statusCode: 500,
    });
  });

  it("T-11: setAuth未呼び出し状態では認証ヘッダーが付与されない", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({}),
    });

    await adapter.get("https://api.example.com/open");

    const calledHeaders = fetchMock.mock.calls[0][1].headers;
    expect(calledHeaders["Authorization"]).toBeUndefined();
    expect(calledHeaders["X-API-Key"]).toBeUndefined();
  });

  it("T-12: HTTPSでないURLにアクセスするとconsole.warnが出力される", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({}),
    });
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    await adapter.get("http://api.example.com/resource");

    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("non-HTTPS URL detected"),
    );
  });

  it("T-13: POSTリクエストにContent-Type: application/jsonが自動付与される", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({}),
    });

    await adapter.post("https://api.example.com/data", { key: "value" });

    const calledHeaders = fetchMock.mock.calls[0][1].headers;
    expect(calledHeaders["Content-Type"]).toBe("application/json");
  });

  it("T-14: api-key認証ではAuthorizationヘッダーが付与されない（X-API-Keyのみ）", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({}),
    });

    adapter.setAuth("api-key", "test-key");
    await adapter.get("https://api.example.com/resource");

    const calledHeaders = fetchMock.mock.calls[0][1].headers;
    expect(calledHeaders["X-API-Key"]).toBe("test-key");
    expect(calledHeaders["Authorization"]).toBeUndefined();
  });

  it("T-15: カスタムヘッダーが認証ヘッダーにマージされる", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({}),
    });

    adapter.setAuth("bearer", "my-token");
    await adapter.get("https://api.example.com/resource", {
      "X-Request-Id": "test-123",
    });

    const calledHeaders = fetchMock.mock.calls[0][1].headers;
    expect(calledHeaders["Authorization"]).toBe("Bearer my-token");
    expect(calledHeaders["X-Request-Id"]).toBe("test-123");
  });
});
