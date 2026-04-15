/**
 * @file resolveExternalIntegration.test.ts
 * @description resolveExternalIntegration 複数ツール並列統合対応 ユニットテスト
 * @task UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001
 * @phase Phase 4: TDD Red → Phase 5 実装後 Green
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  resolveExternalIntegration,
  mergeIntegrations,
} from "../SkillCreateWizard";

vi.mock("../fetchToolIntegrationInfo", () => ({
  fetchToolIntegrationInfo: vi.fn(),
}));

describe("resolveExternalIntegration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ─── AC-1: 複数ツール並列処理 ────────────────────────────────────────────

  describe("AC-1: 複数ツール並列処理", () => {
    it("TC-1: 複数ツール入力時に fetchToolIntegrationInfo が並列で呼び出される", async () => {
      const { fetchToolIntegrationInfo } =
        await import("../fetchToolIntegrationInfo");
      const mockFetch = vi.mocked(fetchToolIntegrationInfo);

      const callOrder: string[] = [];
      let resolveA!: () => void;
      let resolveB!: () => void;

      mockFetch.mockImplementation((tool: string) => {
        return new Promise((resolve) => {
          callOrder.push(`start:${tool}`);
          if (tool === "toolA") {
            resolveA = () => {
              callOrder.push(`end:${tool}`);
              resolve({
                toolName: tool,
                apiEndpoints: ["/a"],
                authMethods: ["bearer"],
                mainOperations: ["opA"],
              });
            };
          } else {
            resolveB = () => {
              callOrder.push(`end:${tool}`);
              resolve({
                toolName: tool,
                apiEndpoints: ["/b"],
                authMethods: ["apiKey"],
                mainOperations: ["opB"],
              });
            };
          }
        });
      });

      const promise = resolveExternalIntegration(["toolA", "toolB"]);

      // 両方が開始してから完了させる（並列の証明）
      expect(callOrder).toContain("start:toolA");
      expect(callOrder).toContain("start:toolB");

      resolveA();
      resolveB();

      await promise;
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it("TC-2: 複数ツール入力時に各ツール名で fetchToolIntegrationInfo が呼び出される", async () => {
      const { fetchToolIntegrationInfo } =
        await import("../fetchToolIntegrationInfo");
      const mockFetch = vi.mocked(fetchToolIntegrationInfo);

      mockFetch.mockResolvedValueOnce({
        toolName: "toolA",
        apiEndpoints: ["/a"],
        authMethods: ["bearer"],
        mainOperations: ["opA"],
      });
      mockFetch.mockResolvedValueOnce({
        toolName: "toolB",
        apiEndpoints: ["/b"],
        authMethods: ["apiKey"],
        mainOperations: ["opB"],
      });

      await resolveExternalIntegration(["toolA", "toolB"]);

      expect(mockFetch).toHaveBeenCalledWith("toolA");
      expect(mockFetch).toHaveBeenCalledWith("toolB");
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });

  // ─── AC-2: 統合情報マージ ─────────────────────────────────────────────────

  describe("AC-2: 統合情報マージ", () => {
    it("TC-3: 複数ツールの統合情報が正しくマージされる", async () => {
      const { fetchToolIntegrationInfo } =
        await import("../fetchToolIntegrationInfo");
      const mockFetch = vi.mocked(fetchToolIntegrationInfo);

      mockFetch.mockResolvedValueOnce({
        toolName: "toolA",
        apiEndpoints: ["https://api.toolA.com/v1"],
        authMethods: ["bearer"],
        mainOperations: ["create", "read"],
      });
      mockFetch.mockResolvedValueOnce({
        toolName: "toolB",
        apiEndpoints: ["https://api.toolB.com/v2"],
        authMethods: ["apiKey"],
        mainOperations: ["update", "delete"],
      });

      const result = await resolveExternalIntegration(["toolA", "toolB"]);

      expect(result.apiEndpoints).toContain("https://api.toolA.com/v1");
      expect(result.apiEndpoints).toContain("https://api.toolB.com/v2");
      expect(result.authMethods).toContain("bearer");
      expect(result.authMethods).toContain("apiKey");
      expect(result.mainOperations).toContain("create");
      expect(result.mainOperations).toContain("update");
    });

    it("TC-4: マージ結果の重複フィールド値が排除される", async () => {
      const { fetchToolIntegrationInfo } =
        await import("../fetchToolIntegrationInfo");
      const mockFetch = vi.mocked(fetchToolIntegrationInfo);

      mockFetch.mockResolvedValue({
        toolName: "toolA",
        apiEndpoints: ["https://api.common.com/v1"],
        authMethods: ["bearer"],
        mainOperations: ["read"],
      });

      const result = await resolveExternalIntegration(["toolA", "toolA"]);

      expect(
        result.apiEndpoints.filter((e) => e === "https://api.common.com/v1"),
      ).toHaveLength(1);
      expect(result.authMethods.filter((a) => a === "bearer")).toHaveLength(1);
      expect(result.mainOperations.filter((o) => o === "read")).toHaveLength(1);
    });
  });

  // ─── AC-3: 後方互換性（単一ツール）──────────────────────────────────────

  describe("AC-3: 後方互換性（単一ツール）", () => {
    it("TC-5: 単一ツール入力時は従来と同一の結果が返る", async () => {
      const { fetchToolIntegrationInfo } =
        await import("../fetchToolIntegrationInfo");
      const mockFetch = vi.mocked(fetchToolIntegrationInfo);

      const expectedInfo = {
        toolName: "toolA",
        apiEndpoints: ["https://api.toolA.com/v1"],
        authMethods: ["bearer"],
        mainOperations: ["create", "read", "update", "delete"],
      };
      mockFetch.mockResolvedValueOnce(expectedInfo);

      const result = await resolveExternalIntegration(["toolA"]);

      expect(result.apiEndpoints).toEqual(expectedInfo.apiEndpoints);
      expect(result.authMethods).toEqual(expectedInfo.authMethods);
      expect(result.mainOperations).toEqual(expectedInfo.mainOperations);
      expect(mockFetch).toHaveBeenCalledWith("toolA");
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  // ─── AC-4: フォールバック ─────────────────────────────────────────────────

  describe("AC-4: フォールバック", () => {
    it("TC-6: 空配列入力時はデフォルト値が返る", async () => {
      const result = await resolveExternalIntegration([]);

      expect(result.tools).toEqual([]);
      expect(result.apiEndpoints).toEqual([]);
      expect(result.authMethods).toEqual([]);
      expect(result.mainOperations).toEqual([]);
    });

    it("TC-7: 未対応ツール入力時は例外を投げずデフォルト値が返る", async () => {
      const { fetchToolIntegrationInfo } =
        await import("../fetchToolIntegrationInfo");
      const mockFetch = vi.mocked(fetchToolIntegrationInfo);
      mockFetch.mockRejectedValue(new Error("Unsupported tool"));

      await expect(
        resolveExternalIntegration(["unsupported"]),
      ).resolves.not.toThrow();

      const result = await resolveExternalIntegration(["unsupported"]);
      expect(result.apiEndpoints).toEqual([]);
      expect(result.authMethods).toEqual([]);
      expect(result.mainOperations).toEqual([]);
    });

    it("TC-8: 複数ツールのうち1件が取得失敗しても残りの結果がマージされる", async () => {
      const { fetchToolIntegrationInfo } =
        await import("../fetchToolIntegrationInfo");
      const mockFetch = vi.mocked(fetchToolIntegrationInfo);

      mockFetch.mockImplementation((tool: string) => {
        if (tool === "toolA") {
          return Promise.resolve({
            toolName: tool,
            apiEndpoints: ["https://api.toolA.com/v1"],
            authMethods: ["bearer"],
            mainOperations: ["create"],
          });
        }
        return Promise.reject(new Error("取得失敗"));
      });

      const result = await resolveExternalIntegration(["toolA", "errorTool"]);

      expect(result.apiEndpoints).toContain("https://api.toolA.com/v1");
      expect(result.authMethods).toContain("bearer");
      expect(result.mainOperations).toContain("create");
    });

    it("TC-9: 全ツール取得失敗時はデフォルト値が返る", async () => {
      const { fetchToolIntegrationInfo } =
        await import("../fetchToolIntegrationInfo");
      const mockFetch = vi.mocked(fetchToolIntegrationInfo);
      mockFetch.mockRejectedValue(new Error("全件失敗"));

      const result = await resolveExternalIntegration(["errorA", "errorB"]);

      expect(result.tools).toEqual([]);
      expect(result.apiEndpoints).toEqual([]);
      expect(result.authMethods).toEqual([]);
      expect(result.mainOperations).toEqual([]);
    });

    it("TC-10: 3ツール以上入力時に全ツール分の情報がマージされる", async () => {
      const { fetchToolIntegrationInfo } =
        await import("../fetchToolIntegrationInfo");
      const mockFetch = vi.mocked(fetchToolIntegrationInfo);

      const tools = ["toolA", "toolB", "toolC"];
      tools.forEach((tool, i) => {
        mockFetch.mockResolvedValueOnce({
          toolName: tool,
          apiEndpoints: [`https://api.${tool}.com/v${i + 1}`],
          authMethods: [`method${i + 1}`],
          mainOperations: [`op${i + 1}`],
        });
      });

      const result = await resolveExternalIntegration(tools);

      expect(result.apiEndpoints).toHaveLength(3);
      expect(result.authMethods).toHaveLength(3);
      expect(result.mainOperations).toHaveLength(3);
    });

    it("TC-11: 空白のみのツール名が正規化で除去される", async () => {
      const { fetchToolIntegrationInfo } =
        await import("../fetchToolIntegrationInfo");
      const mockFetch = vi.mocked(fetchToolIntegrationInfo);
      mockFetch.mockResolvedValueOnce({
        toolName: "validTool",
        apiEndpoints: ["/valid"],
        authMethods: ["bearer"],
        mainOperations: ["op"],
      });

      const result = await resolveExternalIntegration([
        "   ",
        " validTool ",
        "validTool",
      ]);

      expect(result.tools.map((t) => t.toolName)).toEqual(["validTool"]);
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith("validTool");
    });

    it("TC-12: 既知ツール名は大小文字と余白を canonical label に正規化する", async () => {
      const { fetchToolIntegrationInfo } =
        await import("../fetchToolIntegrationInfo");
      const mockFetch = vi.mocked(fetchToolIntegrationInfo);

      mockFetch.mockImplementation(async (tool: string) => ({
        toolName: tool,
        apiEndpoints: [`/${tool.toLowerCase()}`],
        authMethods: ["bearer"],
        mainOperations: ["op"],
      }));

      const result = await resolveExternalIntegration([
        " slack ",
        "GITHUB",
        "notion",
      ]);

      expect(result.tools.map((t) => t.toolName)).toEqual([
        "Slack",
        "GitHub",
        "Notion",
      ]);
      expect(mockFetch).toHaveBeenNthCalledWith(1, "Slack");
      expect(mockFetch).toHaveBeenNthCalledWith(2, "GitHub");
      expect(mockFetch).toHaveBeenNthCalledWith(3, "Notion");
    });
  });
});

// ─── mergeIntegrations 単体テスト ──────────────────────────────────────────

describe("mergeIntegrations", () => {
  it("TC-12: 空配列を受け取った場合は空の merged object を返す", () => {
    expect(mergeIntegrations([])).toEqual({
      tools: [],
      apiEndpoints: [],
      authMethods: [],
      mainOperations: [],
    });
  });

  it("TC-13: 複数の統合情報を正しくマージする", () => {
    const result = mergeIntegrations([
      {
        toolName: "A",
        apiEndpoints: ["https://a.com"],
        authMethods: ["bearer"],
        mainOperations: ["read"],
      },
      {
        toolName: "B",
        apiEndpoints: ["https://b.com"],
        authMethods: ["apiKey"],
        mainOperations: ["write"],
      },
    ]);

    expect(result.tools).toHaveLength(2);
    expect(result.apiEndpoints).toContain("https://a.com");
    expect(result.apiEndpoints).toContain("https://b.com");
    expect(result.authMethods).toContain("bearer");
    expect(result.authMethods).toContain("apiKey");
    expect(result.mainOperations).toContain("read");
    expect(result.mainOperations).toContain("write");
  });
});
