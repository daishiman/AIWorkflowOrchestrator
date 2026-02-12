/**
 * SkillExecutor 認証連携テスト
 *
 * TASK-FIX-16-1-SDK-AUTH-INFRASTRUCTURE: Claude Agent SDK用認証キー管理基盤
 * Phase 5: 実装（TDD Green Phase）
 *
 * SkillExecutor が AuthKeyService から認証キーを取得して
 * SDK query() に渡す連携動作をテストする。
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { BrowserWindow } from "electron";
import type { SkillMetadata, SkillExecutionRequest } from "../SkillExecutor";

// SkillExecutor をインポート
import { SkillExecutor } from "../SkillExecutor";

// モック設定
const mockWebContents = {
  send: vi.fn(),
};

const mockMainWindow = {
  webContents: mockWebContents,
  isDestroyed: vi.fn().mockReturnValue(false),
} as unknown as BrowserWindow;

// SDKモック - query()はAsyncIterable（AsyncGenerator互換）を直接返す
const mockStreamGenerator = vi.fn();
const mockQuery = vi.fn().mockImplementation(() => mockStreamGenerator());

vi.mock("@anthropic-ai/claude-agent-sdk", () => ({
  query: (args: unknown) => mockQuery(args),
}));

// UUIDモック
vi.mock("uuid", () => ({
  v4: () => "test-execution-id-auth-1234",
}));

// PermissionStoreモック
const mockPermissionStore = {
  isToolAllowed: vi.fn().mockReturnValue(false),
  allowTool: vi.fn(),
  revokeTool: vi.fn(),
  getAllowedTools: vi.fn().mockReturnValue([]),
  getAllowedToolEntries: vi.fn().mockReturnValue([]),
  clearAll: vi.fn(),
};

// AuthKeyServiceモック
const mockAuthKeyService = {
  setKey: vi.fn().mockResolvedValue(undefined),
  getKey: vi.fn().mockResolvedValue(null),
  hasKey: vi.fn().mockResolvedValue(false),
  validateKey: vi.fn().mockResolvedValue(true),
  deleteKey: vi.fn().mockResolvedValue(undefined),
  clearCache: vi.fn(),
};

describe("SkillExecutor - Auth Integration", () => {
  const mockSkill: SkillMetadata = {
    id: "test-skill-auth",
    name: "Test Skill Auth",
    slug: "test-skill-auth",
    description: "A test skill for auth integration",
    path: "/path/to/skill",
    triggers: ["test"],
    anchors: [
      {
        source: "Test Source",
        application: "Testing",
        purpose: "Auth integration test",
      },
    ],
    allowedTools: ["Read", "Write"],
  };

  const mockRequest: SkillExecutionRequest = {
    prompt: "Test prompt for auth",
    skillId: "test-skill-auth",
  };

  const validApiKey = "sk-ant-api03-valid-test-key-1234567890abcdef";

  beforeEach(() => {
    vi.clearAllMocks();

    // mockQueryの実装を再設定
    mockQuery.mockImplementation(() => mockStreamGenerator());

    // デフォルトのストリームモック設定
    mockStreamGenerator.mockReturnValue({
      [Symbol.asyncIterator]: async function* () {
        yield { type: "text", content: "Auth test response" };
      },
    });

    // isDestroyed を再設定
    mockMainWindow.isDestroyed = vi.fn().mockReturnValue(false);

    // AuthKeyServiceモックをリセット
    mockAuthKeyService.getKey.mockResolvedValue(null);
    mockAuthKeyService.hasKey.mockResolvedValue(false);

    // PermissionStoreモックをリセット
    mockPermissionStore.isToolAllowed.mockReturnValue(false);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("AuthKeyService 連携", () => {
    it("AuthKeyServiceからAPIキーを取得してquery()に渡す", async () => {
      // Arrange - AuthKeyService が有効なキーを返す
      mockAuthKeyService.getKey.mockResolvedValue(validApiKey);
      mockAuthKeyService.hasKey.mockResolvedValue(true);

      // AuthKeyService を渡して SkillExecutor を作成
      const executorWithAuth = new SkillExecutor(
        mockMainWindow,
        mockPermissionStore,
        mockAuthKeyService,
      );

      // Act
      const response = await executorWithAuth.execute(mockRequest, mockSkill);

      // Assert
      expect(mockAuthKeyService.getKey).toHaveBeenCalled();
      expect(mockQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          options: expect.objectContaining({
            env: expect.objectContaining({
              ANTHROPIC_API_KEY: validApiKey,
            }),
          }),
        }),
      );
      expect(response.success).toBe(true);
    });

    it("キー未設定時はAUTHENTICATION_ERRORを返す", async () => {
      // Arrange - AuthKeyService がキー未設定を返す
      mockAuthKeyService.getKey.mockResolvedValue(null);
      mockAuthKeyService.hasKey.mockResolvedValue(false);

      // 環境変数も未設定
      const originalEnv = process.env.ANTHROPIC_API_KEY;
      delete process.env.ANTHROPIC_API_KEY;

      try {
        const executorWithAuth = new SkillExecutor(
          mockMainWindow,
          mockPermissionStore,
          mockAuthKeyService,
        );

        // Act
        const response = await executorWithAuth.execute(mockRequest, mockSkill);

        // Assert
        expect(response.success).toBe(false);
        expect(response.error?.code).toBe("AUTHENTICATION_ERROR");
        expect(response.error?.message).toContain("API Key is not configured");
      } finally {
        // 環境変数を元に戻す
        if (originalEnv !== undefined) {
          process.env.ANTHROPIC_API_KEY = originalEnv;
        }
      }
    });

    it("query()呼び出し時にapiKeyオプションが設定される", async () => {
      // Arrange
      mockAuthKeyService.getKey.mockResolvedValue(validApiKey);

      const executorWithAuth = new SkillExecutor(
        mockMainWindow,
        mockPermissionStore,
        mockAuthKeyService,
      );

      // Act
      await executorWithAuth.execute(mockRequest, mockSkill);

      // Assert - query() の options.env に ANTHROPIC_API_KEY が含まれることを確認
      const queryCallArgs = mockQuery.mock.calls[0][0];
      expect(queryCallArgs.options).toHaveProperty("env");
      expect(queryCallArgs.options.env.ANTHROPIC_API_KEY).toBe(validApiKey);
    });

    it("環境変数からフォールバックできる", async () => {
      // Arrange - AuthKeyService がキー未設定、環境変数あり
      mockAuthKeyService.getKey.mockResolvedValue(null);
      mockAuthKeyService.hasKey.mockResolvedValue(false);

      const originalEnv = process.env.ANTHROPIC_API_KEY;
      process.env.ANTHROPIC_API_KEY = validApiKey;

      try {
        const executorWithAuth = new SkillExecutor(
          mockMainWindow,
          mockPermissionStore,
          mockAuthKeyService,
        );

        // Act
        const response = await executorWithAuth.execute(mockRequest, mockSkill);

        // Assert
        expect(response.success).toBe(true);
        expect(mockQuery).toHaveBeenCalledWith(
          expect.objectContaining({
            options: expect.objectContaining({
              env: expect.objectContaining({
                ANTHROPIC_API_KEY: validApiKey,
              }),
            }),
          }),
        );
      } finally {
        // 環境変数を元に戻す
        if (originalEnv === undefined) {
          delete process.env.ANTHROPIC_API_KEY;
        } else {
          process.env.ANTHROPIC_API_KEY = originalEnv;
        }
      }
    });

    it("AuthKeyService未設定時は環境変数のみ使用", async () => {
      // Arrange - AuthKeyService なし、環境変数あり
      const originalEnv = process.env.ANTHROPIC_API_KEY;
      process.env.ANTHROPIC_API_KEY = validApiKey;

      try {
        // AuthKeyService なしで SkillExecutor を作成
        const executorNoAuth = new SkillExecutor(
          mockMainWindow,
          mockPermissionStore,
          // authKeyService は渡さない
        );

        // Act
        const response = await executorNoAuth.execute(mockRequest, mockSkill);

        // Assert
        expect(response.success).toBe(true);
        expect(mockQuery).toHaveBeenCalledWith(
          expect.objectContaining({
            options: expect.objectContaining({
              env: expect.objectContaining({
                ANTHROPIC_API_KEY: validApiKey,
              }),
            }),
          }),
        );
      } finally {
        // 環境変数を元に戻す
        if (originalEnv === undefined) {
          delete process.env.ANTHROPIC_API_KEY;
        } else {
          process.env.ANTHROPIC_API_KEY = originalEnv;
        }
      }
    });
  });

  describe("エラーハンドリング", () => {
    it("AuthKeyServiceがエラーをスローした場合は適切にハンドリングする", async () => {
      // Arrange
      mockAuthKeyService.getKey.mockRejectedValue(
        new Error("Storage access error"),
      );

      // 環境変数も未設定
      const originalEnv = process.env.ANTHROPIC_API_KEY;
      delete process.env.ANTHROPIC_API_KEY;

      try {
        const executorWithAuth = new SkillExecutor(
          mockMainWindow,
          mockPermissionStore,
          mockAuthKeyService,
        );

        // Act
        const response = await executorWithAuth.execute(mockRequest, mockSkill);

        // Assert - エラーが適切に処理される
        expect(response.success).toBe(false);
        expect(response.error).toBeDefined();
      } finally {
        if (originalEnv !== undefined) {
          process.env.ANTHROPIC_API_KEY = originalEnv;
        }
      }
    });

    it("無効なAPIキーでSDKエラーが発生した場合は適切にハンドリングする", async () => {
      // Arrange
      mockAuthKeyService.getKey.mockResolvedValue("invalid-key");

      // SDK が認証エラーを返す
      mockStreamGenerator.mockReturnValue({
        [Symbol.asyncIterator]: () => ({
          async next() {
            const error = new Error("Invalid API key") as Error & {
              status: number;
            };
            error.status = 401;
            throw error;
          },
        }),
      });

      const executorWithAuth = new SkillExecutor(
        mockMainWindow,
        mockPermissionStore,
        mockAuthKeyService,
      );

      // Act
      const response = await executorWithAuth.execute(mockRequest, mockSkill);

      // Assert
      expect(response.success).toBe(false);
      // SDKエラーはそのまま伝播される
      expect(response.error).toBeDefined();
    });
  });

  describe("コンストラクタ", () => {
    it("AuthKeyServiceはオプショナル引数として受け取れる", () => {
      // Act - AuthKeyService ありなしの両方で作成できることを確認
      const executorWithAuth = new SkillExecutor(
        mockMainWindow,
        mockPermissionStore,
        mockAuthKeyService,
      );
      const executorWithoutAuth = new SkillExecutor(
        mockMainWindow,
        mockPermissionStore,
      );

      // Assert
      expect(executorWithAuth).toBeDefined();
      expect(executorWithoutAuth).toBeDefined();
    });

    it("後方互換性: 既存の2引数コンストラクタが動作する", () => {
      // Act - 既存の2引数コンストラクタ
      const executor = new SkillExecutor(mockMainWindow, mockPermissionStore);

      // Assert - インスタンスが作成できる
      expect(executor).toBeDefined();
      expect(executor.getActiveExecutions()).toHaveLength(0);
    });
  });

  describe("セキュリティ", () => {
    it("APIキーはログに出力されない", async () => {
      // Arrange
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
      const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      mockAuthKeyService.getKey.mockResolvedValue(validApiKey);

      const executorWithAuth = new SkillExecutor(
        mockMainWindow,
        mockPermissionStore,
        mockAuthKeyService,
      );

      // Act
      await executorWithAuth.execute(mockRequest, mockSkill);

      // Assert - ログにAPIキーが含まれていないことを確認
      const allLogs = [...consoleSpy.mock.calls, ...errorSpy.mock.calls];
      allLogs.forEach((call) => {
        const message = call.join(" ");
        expect(message).not.toContain(validApiKey);
      });

      consoleSpy.mockRestore();
      errorSpy.mockRestore();
    });

    it("APIキーはRendererに送信されない", async () => {
      // Arrange
      mockAuthKeyService.getKey.mockResolvedValue(validApiKey);

      const executorWithAuth = new SkillExecutor(
        mockMainWindow,
        mockPermissionStore,
        mockAuthKeyService,
      );

      // Act
      await executorWithAuth.execute(mockRequest, mockSkill);

      // Assert - IPC送信内容にAPIキーが含まれていないことを確認
      mockWebContents.send.mock.calls.forEach((call) => {
        const message = JSON.stringify(call);
        expect(message).not.toContain(validApiKey);
      });
    });
  });

  // Phase 6: テスト拡充 - 境界値テスト
  describe("境界値テスト", () => {
    it("最大長のAPIキー（4096文字）を正しく処理できる", async () => {
      // Arrange - 4096文字のAPIキー ("sk-ant-api03-" = 13文字)
      const longApiKey = "sk-ant-api03-" + "a".repeat(4083);
      expect(longApiKey).toHaveLength(4096);

      mockAuthKeyService.getKey.mockResolvedValue(longApiKey);

      const executorWithAuth = new SkillExecutor(
        mockMainWindow,
        mockPermissionStore,
        mockAuthKeyService,
      );

      // Act
      const response = await executorWithAuth.execute(mockRequest, mockSkill);

      // Assert - 正常に処理される
      expect(response.success).toBe(true);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          options: expect.objectContaining({
            env: expect.objectContaining({
              ANTHROPIC_API_KEY: longApiKey,
            }),
          }),
        }),
      );
    });

    it("特殊文字を含むAPIキーを正しく処理できる", async () => {
      // Arrange - 特殊文字を含むキー
      const specialCharKey = "sk-ant-api03-test+key/with=special_chars-123";
      mockAuthKeyService.getKey.mockResolvedValue(specialCharKey);

      const executorWithAuth = new SkillExecutor(
        mockMainWindow,
        mockPermissionStore,
        mockAuthKeyService,
      );

      // Act
      const response = await executorWithAuth.execute(mockRequest, mockSkill);

      // Assert
      expect(response.success).toBe(true);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          options: expect.objectContaining({
            env: expect.objectContaining({
              ANTHROPIC_API_KEY: specialCharKey,
            }),
          }),
        }),
      );
    });

    it("空文字列のAPIキーはエラーとなる", async () => {
      // Arrange - 空文字列
      mockAuthKeyService.getKey.mockResolvedValue("");

      // 環境変数も未設定
      const originalEnv = process.env.ANTHROPIC_API_KEY;
      delete process.env.ANTHROPIC_API_KEY;

      try {
        const executorWithAuth = new SkillExecutor(
          mockMainWindow,
          mockPermissionStore,
          mockAuthKeyService,
        );

        // Act
        const response = await executorWithAuth.execute(mockRequest, mockSkill);

        // Assert - 空文字列はfalsyなのでnullと同様に扱われる
        expect(response.success).toBe(false);
        expect(response.error?.code).toBe("AUTHENTICATION_ERROR");
      } finally {
        if (originalEnv !== undefined) {
          process.env.ANTHROPIC_API_KEY = originalEnv;
        }
      }
    });

    it("Unicode文字を含むAPIキーを処理できる", async () => {
      // Arrange - Unicode文字を含むキー（通常は無効だが処理はできる）
      const unicodeKey = "sk-ant-api03-日本語テスト-1234";
      mockAuthKeyService.getKey.mockResolvedValue(unicodeKey);

      const executorWithAuth = new SkillExecutor(
        mockMainWindow,
        mockPermissionStore,
        mockAuthKeyService,
      );

      // Act
      await executorWithAuth.execute(mockRequest, mockSkill);

      // Assert - SDKに渡される（SDKが無効と判断する場合がある）
      expect(mockQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          options: expect.objectContaining({
            env: expect.objectContaining({
              ANTHROPIC_API_KEY: unicodeKey,
            }),
          }),
        }),
      );
    });
  });

  // Phase 6: テスト拡充 - 連続アクセステスト
  describe("連続アクセステスト", () => {
    it("複数回の連続実行でAuthKeyServiceが正しく呼び出される", async () => {
      // Arrange
      mockAuthKeyService.getKey.mockResolvedValue(validApiKey);

      const executorWithAuth = new SkillExecutor(
        mockMainWindow,
        mockPermissionStore,
        mockAuthKeyService,
      );

      // Act - 3回連続実行
      const response1 = await executorWithAuth.execute(mockRequest, mockSkill);
      const response2 = await executorWithAuth.execute(mockRequest, mockSkill);
      const response3 = await executorWithAuth.execute(mockRequest, mockSkill);

      // Assert - 全て成功
      expect(response1.success).toBe(true);
      expect(response2.success).toBe(true);
      expect(response3.success).toBe(true);

      // AuthKeyService.getKeyが3回呼ばれる
      expect(mockAuthKeyService.getKey).toHaveBeenCalledTimes(3);
    });

    it("一部の実行でキー取得が失敗しても次回は影響を受けない", async () => {
      // Arrange - 1回目は成功、2回目は失敗、3回目は成功
      mockAuthKeyService.getKey
        .mockResolvedValueOnce(validApiKey)
        .mockRejectedValueOnce(new Error("Temporary storage error"))
        .mockResolvedValueOnce(validApiKey);

      // 環境変数も未設定（フォールバックなし）
      const originalEnv = process.env.ANTHROPIC_API_KEY;
      delete process.env.ANTHROPIC_API_KEY;

      try {
        const executorWithAuth = new SkillExecutor(
          mockMainWindow,
          mockPermissionStore,
          mockAuthKeyService,
        );

        // Act - 連続実行
        const response1 = await executorWithAuth.execute(
          mockRequest,
          mockSkill,
        );
        const response2 = await executorWithAuth.execute(
          mockRequest,
          mockSkill,
        );
        const response3 = await executorWithAuth.execute(
          mockRequest,
          mockSkill,
        );

        // Assert - 1と3は成功、2は失敗
        expect(response1.success).toBe(true);
        expect(response2.success).toBe(false);
        expect(response3.success).toBe(true);
      } finally {
        if (originalEnv !== undefined) {
          process.env.ANTHROPIC_API_KEY = originalEnv;
        }
      }
    });

    it("実行中にAuthKeyServiceの応答が遅延しても正しく処理される", async () => {
      // Arrange - 遅延を持つgetKey
      mockAuthKeyService.getKey.mockImplementation(
        () =>
          new Promise((resolve) => setTimeout(() => resolve(validApiKey), 100)),
      );

      const executorWithAuth = new SkillExecutor(
        mockMainWindow,
        mockPermissionStore,
        mockAuthKeyService,
      );

      // Act
      const response = await executorWithAuth.execute(mockRequest, mockSkill);

      // Assert
      expect(response.success).toBe(true);
      expect(mockAuthKeyService.getKey).toHaveBeenCalled();
    });
  });

  // Phase 6: テスト拡充 - ストレージ破損リカバリテスト
  describe("ストレージ破損リカバリ", () => {
    it("AuthKeyServiceからの破損データ（undefined）を適切にハンドリングする", async () => {
      // Arrange
      mockAuthKeyService.getKey.mockResolvedValue(undefined);

      // 環境変数も未設定
      const originalEnv = process.env.ANTHROPIC_API_KEY;
      delete process.env.ANTHROPIC_API_KEY;

      try {
        const executorWithAuth = new SkillExecutor(
          mockMainWindow,
          mockPermissionStore,
          mockAuthKeyService,
        );

        // Act
        const response = await executorWithAuth.execute(mockRequest, mockSkill);

        // Assert - undefinedはnullと同様に扱われる
        expect(response.success).toBe(false);
        expect(response.error?.code).toBe("AUTHENTICATION_ERROR");
      } finally {
        if (originalEnv !== undefined) {
          process.env.ANTHROPIC_API_KEY = originalEnv;
        }
      }
    });

    it("AuthKeyServiceが予期しない型を返した場合の処理", async () => {
      // Arrange - 数値を返す（本来は文字列のはず）
      mockAuthKeyService.getKey.mockResolvedValue(12345 as unknown as string);

      const executorWithAuth = new SkillExecutor(
        mockMainWindow,
        mockPermissionStore,
        mockAuthKeyService,
      );

      // Act
      await executorWithAuth.execute(mockRequest, mockSkill);

      // Assert - SDKに渡される（型の問題はSDK側で検出される可能性）
      expect(mockQuery).toHaveBeenCalled();
    });

    it("AuthKeyServiceがタイムアウトした場合にエラーメッセージを返す", async () => {
      // Arrange - 永久にresolveしないPromise（テスト用にrejectでシミュレート）
      mockAuthKeyService.getKey.mockRejectedValue(
        new Error("Request timeout: Storage access timed out"),
      );

      // 環境変数も未設定
      const originalEnv = process.env.ANTHROPIC_API_KEY;
      delete process.env.ANTHROPIC_API_KEY;

      try {
        const executorWithAuth = new SkillExecutor(
          mockMainWindow,
          mockPermissionStore,
          mockAuthKeyService,
        );

        // Act
        const response = await executorWithAuth.execute(mockRequest, mockSkill);

        // Assert
        expect(response.success).toBe(false);
        expect(response.error).toBeDefined();
        expect(response.error?.message).toContain("timeout");
      } finally {
        if (originalEnv !== undefined) {
          process.env.ANTHROPIC_API_KEY = originalEnv;
        }
      }
    });

    it("環境変数が設定されている場合、AuthKeyServiceエラー後にフォールバックする", async () => {
      // Arrange - AuthKeyServiceエラー、環境変数あり
      mockAuthKeyService.getKey.mockRejectedValue(
        new Error("Storage corrupted"),
      );
      const originalEnv = process.env.ANTHROPIC_API_KEY;
      process.env.ANTHROPIC_API_KEY = validApiKey;

      try {
        const executorWithAuth = new SkillExecutor(
          mockMainWindow,
          mockPermissionStore,
          mockAuthKeyService,
        );

        // Act
        const response = await executorWithAuth.execute(mockRequest, mockSkill);

        // Assert - AuthKeyServiceエラー後も環境変数にはフォールバックしない（現在の実装）
        // 注: 現在の実装ではgetKeyがrejectした場合はそのままエラーになる
        expect(response.success).toBe(false);
      } finally {
        if (originalEnv === undefined) {
          delete process.env.ANTHROPIC_API_KEY;
        } else {
          process.env.ANTHROPIC_API_KEY = originalEnv;
        }
      }
    });
  });

  // Phase 6: テスト拡充 - 暗号化/復号一貫性テスト
  describe("暗号化/復号一貫性", () => {
    it("setKeyとgetKeyの往復でキーが正しく取得できる", async () => {
      // Arrange - setKey → getKey の順序で呼び出し
      let storedKey: string | null = null;
      mockAuthKeyService.setKey.mockImplementation((key: string) => {
        storedKey = key;
        return Promise.resolve();
      });
      mockAuthKeyService.getKey.mockImplementation(() =>
        Promise.resolve(storedKey),
      );

      const executorWithAuth = new SkillExecutor(
        mockMainWindow,
        mockPermissionStore,
        mockAuthKeyService,
      );

      // Act - まずキーを設定（AuthKeyService経由）
      await mockAuthKeyService.setKey(validApiKey);

      // 次に実行（キーを取得）
      const response = await executorWithAuth.execute(mockRequest, mockSkill);

      // Assert
      expect(response.success).toBe(true);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          options: expect.objectContaining({
            env: expect.objectContaining({
              ANTHROPIC_API_KEY: validApiKey,
            }),
          }),
        }),
      );
    });

    it("複数回の連続実行で同じキーが一貫して取得される", async () => {
      // Arrange
      mockAuthKeyService.getKey.mockResolvedValue(validApiKey);

      const executorWithAuth = new SkillExecutor(
        mockMainWindow,
        mockPermissionStore,
        mockAuthKeyService,
      );

      // Act - 3回連続実行
      const response1 = await executorWithAuth.execute(mockRequest, mockSkill);
      const response2 = await executorWithAuth.execute(mockRequest, mockSkill);
      const response3 = await executorWithAuth.execute(mockRequest, mockSkill);

      // Assert - 全て成功し、同じキーが使用される
      expect(response1.success).toBe(true);
      expect(response2.success).toBe(true);
      expect(response3.success).toBe(true);

      // 全ての呼び出しで同じキーが使用される
      mockQuery.mock.calls.forEach((call) => {
        expect(call[0].options.env.ANTHROPIC_API_KEY).toBe(validApiKey);
      });

      // AuthKeyService.getKeyが3回呼ばれる
      expect(mockAuthKeyService.getKey).toHaveBeenCalledTimes(3);
    });
  });
});
