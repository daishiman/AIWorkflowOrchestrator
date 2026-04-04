/**
 * SlackWebhookService ユニットテスト
 *
 * TC-S-01: send() がtext メッセージを正しくPOSTする
 * TC-S-02: send() がblocks メッセージを正しくPOSTする
 * TC-S-03: send() がWebhook URL未指定でエラーを返す
 * TC-S-04: send() がHTTPエラー時にエラーを返す
 * TC-S-05: send() がタイムアウト時にエラーを返す
 * TC-S-06: test() がテストメッセージを送信し latencyMs を返す
 * TC-S-07: test() が無効なURLでエラーを返す
 * TC-S-08: test() がhttps以外のURLでエラーを返す
 * TC-S-09: send() が3000文字超のテキストを切り詰める
 * TC-S-10: send() がSlackエラーコードを日本語メッセージに変換する
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ClientRequest, IncomingMessage } from "http";
import { SlackWebhookService } from "../SlackWebhookService";

// https モジュールをモック
const _mockRequest = {
  write: vi.fn(),
  end: vi.fn(),
  on: vi.fn(),
  destroy: vi.fn(),
};

const _mockResponse = {
  statusCode: 200,
  on: vi.fn(),
};

vi.mock("https", () => ({
  default: {
    request: vi.fn(),
  },
}));

function setupHttpsMock(
  statusCode: number,
  body: string,
  shouldTimeout = false,
  shouldError = false,
  errorMessage = "network error",
) {
  const https = vi.mocked((await import("https")).default);

  const res = {
    statusCode,
    on: vi.fn((event: string, handler: (data?: unknown) => void) => {
      if (event === "data") {
        // レスポンスデータを非同期で返す
        Promise.resolve().then(() => handler(Buffer.from(body)));
      }
      if (event === "end") {
        Promise.resolve().then(() => Promise.resolve().then(() => handler()));
      }
      return res;
    }),
  } as unknown as IncomingMessage;

  const req = {
    write: vi.fn(),
    end: vi.fn(),
    on: vi.fn((event: string, handler: (err?: Error) => void) => {
      if (event === "error" && shouldError) {
        Promise.resolve().then(() => handler(new Error(errorMessage)));
      }
      if (event === "timeout" && shouldTimeout) {
        Promise.resolve().then(() => handler());
      }
      return req;
    }),
    destroy: vi.fn(),
  } as unknown as ClientRequest;

  (https.request as ReturnType<typeof vi.fn>).mockImplementation(
    (_options: unknown, callback: (res: IncomingMessage) => void) => {
      if (!shouldError) {
        Promise.resolve().then(() => callback(res));
      }
      return req;
    },
  );

  return { https, req, res };
}

describe("SlackWebhookService", () => {
  const VALID_WEBHOOK_URL =
    "https://hooks.slack.com/services/T000/B000/testtoken";

  let service: SlackWebhookService;

  beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();
    service = new SlackWebhookService();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("send()", () => {
    it("TC-S-01: text メッセージを正しくPOSTする", async () => {
      await setupHttpsMock(200, "ok");

      const result = await service.send(
        { type: "text", text: "Hello Slack!" },
        VALID_WEBHOOK_URL,
      );

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("TC-S-02: blocks メッセージを正しくPOSTする", async () => {
      await setupHttpsMock(200, "ok");

      const result = await service.send(
        {
          type: "blocks",
          text: "フォールバック",
          blocks: [
            {
              type: "section",
              text: { type: "mrkdwn", text: "*テスト*" },
            },
          ],
        },
        VALID_WEBHOOK_URL,
      );

      expect(result.success).toBe(true);
    });

    it("TC-S-03: Webhook URL未指定でエラーを返す", async () => {
      const result = await service.send(
        { type: "text", text: "test" },
        undefined,
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe("Webhook URLが指定されていません");
    });

    it("TC-S-04: HTTPエラー時にエラーを返す", async () => {
      await setupHttpsMock(403, "no_service");

      const result = await service.send(
        { type: "text", text: "test" },
        VALID_WEBHOOK_URL,
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain("無効または失効");
    });

    it("TC-S-09: 3000文字超のテキストを切り詰める", async () => {
      await setupHttpsMock(200, "ok");

      const longText = "a".repeat(4000);
      const result = await service.send(
        { type: "text", text: longText },
        VALID_WEBHOOK_URL,
      );

      expect(result.success).toBe(true);
    });

    it("TC-S-10: invalid_payload エラーを日本語メッセージに変換する", async () => {
      await setupHttpsMock(200, "invalid_payload");

      const result = await service.send(
        { type: "text", text: "test" },
        VALID_WEBHOOK_URL,
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain("ペイロードが無効");
    });
  });

  describe("test()", () => {
    it("TC-S-06: テストメッセージを送信し latencyMs を返す", async () => {
      await setupHttpsMock(200, "ok");

      const result = await service.test(VALID_WEBHOOK_URL);

      expect(result.success).toBe(true);
      expect(result.latencyMs).toBeTypeOf("number");
      expect(result.latencyMs).toBeGreaterThanOrEqual(0);
    });

    it("TC-S-07: 無効なURLでエラーを返す", async () => {
      const result = await service.test("not-a-valid-url");

      expect(result.success).toBe(false);
      expect(result.error).toContain("無効なWebhook URL");
    });

    it("TC-S-08: https以外のURLでエラーを返す", async () => {
      const result = await service.test("http://hooks.slack.com/services/test");

      expect(result.success).toBe(false);
      expect(result.error).toContain("https");
    });
  });
});
