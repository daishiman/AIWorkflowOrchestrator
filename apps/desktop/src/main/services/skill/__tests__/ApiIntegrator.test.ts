/**
 * ApiIntegrator ユニットテスト
 * Phase 6: テスト拡充 — 実クラスを使用
 * テストID: AI-001 ~ AI-008
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ApiIntegrator } from "../ApiIntegrator";
import type { ScriptExecutor } from "../ScriptExecutor";

describe("ApiIntegrator", () => {
  let integrator: ApiIntegrator;

  const mockScriptExecutor = {
    execute: vi.fn(),
    executeJson: vi.fn(),
  } as unknown as ScriptExecutor;

  beforeEach(() => {
    vi.clearAllMocks();
    integrator = new ApiIntegrator();
  });

  describe("generateRestClient()", () => {
    const validRestConfig = {
      baseUrl: "https://api.example.com",
      endpoints: [
        { method: "GET" as const, path: "/users", description: "List users" },
        {
          method: "POST" as const,
          path: "/users",
          description: "Create user",
        },
      ],
      authType: "bearer" as const,
    };

    it("AI-001: ScriptExecutor 未設定時にエラーをスローする", async () => {
      await expect(
        integrator.generateRestClient(validRestConfig),
      ).rejects.toThrow("ScriptExecutor is not configured");
    });

    it("AI-002: 有効な設定でRESTクライアントコードを生成する", async () => {
      integrator.setScriptExecutor(mockScriptExecutor);
      (
        mockScriptExecutor.execute as ReturnType<typeof vi.fn>
      ).mockResolvedValue({
        success: true,
        stdout: "// Generated REST client\nconst client = createClient();",
        stderr: "",
        exitCode: 0,
      });

      const result = await integrator.generateRestClient(validRestConfig);

      expect(result).toBe(
        "// Generated REST client\nconst client = createClient();",
      );
      expect(mockScriptExecutor.execute).toHaveBeenCalledWith(
        "generate_rest_client.js",
        ["--config", JSON.stringify(validRestConfig)],
      );
    });
  });

  describe("generateWebhookHandler()", () => {
    const validWebhookConfig = {
      path: "/webhook/github",
      method: "POST" as const,
      headers: { "X-Hub-Signature": "sha256" },
      secret: "webhook-secret",
    };

    it("AI-003: ScriptExecutor 未設定時にエラーをスローする", async () => {
      await expect(
        integrator.generateWebhookHandler(validWebhookConfig),
      ).rejects.toThrow("ScriptExecutor is not configured");
    });

    it("AI-004: 有効な設定でWebhookハンドラコードを生成する", async () => {
      integrator.setScriptExecutor(mockScriptExecutor);
      (
        mockScriptExecutor.execute as ReturnType<typeof vi.fn>
      ).mockResolvedValue({
        success: true,
        stdout:
          "// Generated webhook handler\nfunction handleWebhook(req, res) {}",
        stderr: "",
        exitCode: 0,
      });

      const result =
        await integrator.generateWebhookHandler(validWebhookConfig);

      expect(result).toBe(
        "// Generated webhook handler\nfunction handleWebhook(req, res) {}",
      );
      expect(mockScriptExecutor.execute).toHaveBeenCalledWith(
        "generate_webhook.js",
        ["--config", JSON.stringify(validWebhookConfig)],
      );
    });
  });

  describe("configureAuth()", () => {
    it("AI-005: ScriptExecutor 未設定時にエラーをスローする", async () => {
      await expect(
        integrator.configureAuth("bearer", { token: "abc123" }),
      ).rejects.toThrow("ScriptExecutor is not configured");
    });

    it("AI-006: 空のクレデンシャル値を拒否する（P42）", async () => {
      integrator.setScriptExecutor(mockScriptExecutor);

      await expect(
        integrator.configureAuth("apiKey", { key: "" }),
      ).rejects.toThrow('Credential "key" must not be empty');
    });

    it("AI-007: スペースのみのクレデンシャル値を拒否する（P42）", async () => {
      integrator.setScriptExecutor(mockScriptExecutor);

      await expect(
        integrator.configureAuth("apiKey", { key: "   " }),
      ).rejects.toThrow('Credential "key" must not be empty');
    });

    it("AI-008: 有効なクレデンシャルで認証を設定する", async () => {
      integrator.setScriptExecutor(mockScriptExecutor);
      (
        mockScriptExecutor.execute as ReturnType<typeof vi.fn>
      ).mockResolvedValue({
        success: true,
        stdout: "",
        stderr: "",
        exitCode: 0,
      });

      const credentials = { token: "valid-token-123" };
      await integrator.configureAuth("bearer", credentials);

      expect(mockScriptExecutor.execute).toHaveBeenCalledWith(
        "configure_auth.js",
        ["--type", "bearer", "--credentials", JSON.stringify(credentials)],
      );
    });
  });
});
