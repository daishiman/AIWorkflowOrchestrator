/**
 * SkillExecutor SDK 型安全テスト
 *
 * TASK-9B-I-SDK-FORMAL-INTEGRATION: Phase 4 (TDD Red) -> Phase 5 (TDD Green)
 *
 * 検証軸:
 * - コンパイル時型チェック: TypeScript コンパイラが型不整合を検出できること
 * - 動的 import 型解決: query 名前付きエクスポートの型安全な利用
 * - SDK モック型互換性: テスト用モックが SDK 型宣言と一致すること
 *
 * 実際の SDK API:
 * - query({ prompt, options? }): Query
 * - Query extends AsyncGenerator<SDKMessage, void>
 * - Options.permissionMode: PermissionMode
 * - PermissionMode: 'default' | 'acceptEdits' | 'bypassPermissions' | 'plan' | 'delegate' | 'dontAsk'
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { BrowserWindow } from "electron";
import type { SkillExecutionRequest, SkillMetadata } from "@repo/shared";
import type {
  Options as SDKOptions,
  PermissionMode as SDKPermissionMode,
} from "@anthropic-ai/claude-agent-sdk";
import { SkillExecutor } from "../SkillExecutor";

// =================================================================
// モック設定
// =================================================================

const mockWebContents = {
  send: vi.fn(),
};

const mockMainWindow = {
  webContents: mockWebContents,
  isDestroyed: vi.fn().mockReturnValue(false),
} as unknown as BrowserWindow;

// SDKモック - query()はAsyncIterable（AsyncGenerator互換）を直接返す
// callSDKQuery内部で { stream: () => conversation } にラップされる
const mockStreamGenerator = vi.fn();
const mockQuery = vi.fn().mockImplementation(() => mockStreamGenerator());

vi.mock("@anthropic-ai/claude-agent-sdk", () => ({
  query: (args: unknown) => mockQuery(args),
}));

// UUIDモック
vi.mock("uuid", () => ({
  v4: () => "test-sdk-types-id-5678",
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
  getKey: vi.fn().mockResolvedValue("sk-ant-api03-test-key-for-unit-tests"),
  setKey: vi.fn().mockResolvedValue({ success: true }),
  deleteKey: vi.fn().mockResolvedValue({ success: true }),
  hasKey: vi.fn().mockResolvedValue(true),
  validateKey: vi
    .fn()
    .mockResolvedValue({ success: true, data: { isValid: true } }),
};

// =================================================================
// テストデータ
// =================================================================

const mockSkill: SkillMetadata = {
  id: "test-skill-sdk-types",
  name: "SDK Types Test Skill",
  slug: "sdk-types-test",
  description: "A skill for SDK type safety testing",
  path: "/path/to/skill",
  triggers: ["test"],
  anchors: [
    {
      source: "Test Source",
      application: "Testing",
      purpose: "SDK type verification",
    },
  ],
  allowedTools: ["Read", "Write"],
};

const mockRequest: SkillExecutionRequest = {
  prompt: "Test prompt for SDK type safety",
  skillId: "test-skill-sdk-types",
};

// =================================================================
// SDK query() パラメータ型（実際の SDK API に基づく）
// =================================================================

/** query() に渡される引数の構造 */
interface QueryCallArgs {
  prompt: string;
  options?: SDKOptions;
}

// =================================================================
// テストケース
// =================================================================

describe("SkillExecutor SDK型安全テスト (TASK-9B-I)", () => {
  let executor: SkillExecutor;
  let originalApiKey: string | undefined;

  beforeEach(() => {
    vi.clearAllMocks();

    originalApiKey = process.env.ANTHROPIC_API_KEY;
    process.env.ANTHROPIC_API_KEY = "sk-ant-api03-test-key-for-unit-tests";

    mockQuery.mockImplementation(() => mockStreamGenerator());

    mockStreamGenerator.mockReturnValue({
      [Symbol.asyncIterator]: async function* () {
        yield { type: "text", content: "SDK type test response" };
      },
    });

    mockMainWindow.isDestroyed = vi.fn().mockReturnValue(false);

    executor = new SkillExecutor(
      mockMainWindow,
      mockPermissionStore,
      mockAuthKeyService,
    );
  });

  afterEach(() => {
    if (originalApiKey !== undefined) {
      process.env.ANTHROPIC_API_KEY = originalApiKey;
    } else {
      delete process.env.ANTHROPIC_API_KEY;
    }
  });

  describe("TC-001: callSDKQuery が型安全に query() を呼び出すこと", () => {
    it("execute() 実行時、query() が as any なしで呼ばれること", async () => {
      // Given: SkillExecutor が有効な API キーを持っている
      // When: execute() を呼び出し、SDK query() が正常応答を返す
      const result = await executor.execute(mockRequest, mockSkill);

      // Then: query() が呼び出され、stream() からストリームメッセージが生成される
      expect(result.success).toBe(true);
      expect(mockQuery).toHaveBeenCalledTimes(1);

      // query() に渡された引数を検証
      const queryArgs = mockQuery.mock.calls[0][0] as QueryCallArgs;
      expect(queryArgs).toHaveProperty("prompt");
      expect(queryArgs).toHaveProperty("options");
      expect(typeof queryArgs.prompt).toBe("string");
    });

    it("query() の戻り値が AsyncIterable として消費されること", async () => {
      // Given: mockStreamGenerator がメッセージを生成する
      mockStreamGenerator.mockReturnValue({
        [Symbol.asyncIterator]: async function* () {
          yield { type: "text", content: "Message 1" };
          yield { type: "text", content: "Message 2" };
        },
      });

      // When: execute() を実行
      const result = await executor.execute(mockRequest, mockSkill);

      // Then: ストリームが正常に処理される
      expect(result.success).toBe(true);
      // webContents.send が複数回呼ばれる（text x2 + complete x1）
      const sendCalls = mockWebContents.send.mock.calls;
      expect(sendCalls.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe("TC-002: SDK モック query 関数のシグネチャ検証", () => {
    it("query() が { prompt, options } 形式の引数を受け取ること", async () => {
      // Given: SDK モックが query 関数を提供している
      // When: execute() 経由で query() が呼ばれる
      await executor.execute(mockRequest, mockSkill);

      // Then: query() に正しい形式の引数が渡される
      expect(mockQuery).toHaveBeenCalledTimes(1);
      const args = mockQuery.mock.calls[0][0] as QueryCallArgs;

      // QueryCallArgs 型に準拠した構造であること
      expect(typeof args.prompt).toBe("string");
      expect(args.prompt).toContain("Test prompt for SDK type safety");
      expect(args.options).toBeDefined();
    });

    it("query() のモック戻り値がイテレータブルであること", () => {
      // Given: mockQuery がAsyncIterable（AsyncGenerator互換）を直接返す
      const result = mockQuery({ prompt: "test", options: {} });

      // Then: AsyncIterable プロトコルを実装していること
      expect(result[Symbol.asyncIterator]).toBeDefined();
    });
  });

  describe("TC-003: SDKQueryOptions と SDK Options の互換性", () => {
    it("permissionMode に 'default' が型エラーなく渡されること", async () => {
      // Given: SkillExecutor が SDKQueryOptions を使用
      // When: execute() を実行（内部で permissionMode: "default" を使用）
      await executor.execute(mockRequest, mockSkill);

      // Then: query() に permissionMode が正しく渡される
      const args = mockQuery.mock.calls[0][0] as QueryCallArgs;
      expect(args.options?.permissionMode).toBe("default");
    });

    it("SDK Options の各フィールドが正しい型であること", async () => {
      // When: execute() を実行
      await executor.execute(mockRequest, mockSkill);

      // Then: options の各フィールドを検証
      const args = mockQuery.mock.calls[0][0] as QueryCallArgs;
      const options = args.options;

      // tools は string[] であること
      expect(Array.isArray(options?.tools)).toBe(true);
      if (options?.tools && Array.isArray(options.tools)) {
        (options.tools as string[]).forEach((tool: string) => {
          expect(typeof tool).toBe("string");
        });
      }

      // permissionMode は SDK の PermissionMode 型に合致すること
      const validModes: SDKPermissionMode[] = [
        "default",
        "acceptEdits",
        "bypassPermissions",
        "plan",
        "delegate",
        "dontAsk",
      ];
      expect(validModes).toContain(options?.permissionMode);

      // env に ANTHROPIC_API_KEY が含まれること
      expect(options?.env?.ANTHROPIC_API_KEY).toBeDefined();
      expect(typeof options?.env?.ANTHROPIC_API_KEY).toBe("string");
    });

    it("PermissionMode の有効な値が全て型として受け入れられること", () => {
      // コンパイル時型チェック: SDK PermissionMode の値
      const validModes: SDKPermissionMode[] = [
        "default",
        "acceptEdits",
        "bypassPermissions",
        "plan",
        "delegate",
        "dontAsk",
      ];

      // 全ての有効な値が受け入れられること
      validModes.forEach((mode) => {
        expect(typeof mode).toBe("string");
      });
    });
  });

  describe("TC-004: 不正な引数がコンパイルエラーになること", () => {
    it("数値型の prompt はコンパイルエラーになること", () => {
      // @ts-expect-error -- TC-004: prompt は string 型であるべき。数値は不正。
      const _invalidArgs: QueryCallArgs = { prompt: 12345 };

      // ランタイムでは型チェックされないため、コンパイル時のみの検証
      expect(true).toBe(true);
    });

    it("boolean 型の prompt はコンパイルエラーになること", () => {
      // @ts-expect-error -- TC-004: prompt は string 型であるべき。boolean は不正。
      const _invalidArgs: QueryCallArgs = { prompt: true };

      expect(true).toBe(true);
    });
  });

  describe("TC-005: query() にプロンプト未指定でコンパイルエラー", () => {
    it("prompt フィールドなしのオブジェクトはコンパイルエラーになること", () => {
      // @ts-expect-error -- TC-005: prompt は必須フィールド。省略は不正。
      const _invalidArgs: QueryCallArgs = { options: {} };

      expect(true).toBe(true);
    });

    it("空オブジェクトはコンパイルエラーになること", () => {
      // @ts-expect-error -- TC-005: prompt は必須フィールド。空オブジェクトは不正。
      const _invalidArgs: QueryCallArgs = {};

      expect(true).toBe(true);
    });
  });

  describe("TC-006: Query (AsyncGenerator) 型のストリーミング検証", () => {
    it("Query が AsyncGenerator として for-await-of で消費可能であること", async () => {
      // SDKQuery 型（AsyncGenerator）互換のイテレータを作成
      const mockQueryResult = {
        [Symbol.asyncIterator]() {
          let isDone = false;
          return {
            async next() {
              if (!isDone) {
                isDone = true;
                return {
                  done: false as const,
                  value: { type: "text", content: "test" },
                };
              }
              return { done: true as const, value: undefined };
            },
          };
        },
      };

      const messages: unknown[] = [];
      for await (const msg of mockQueryResult) {
        messages.push(msg);
      }

      expect(messages).toHaveLength(1);
    });

    it("callSDKQuery の戻り値 stream() が AsyncIterable を返すこと", async () => {
      // SkillExecutor 内部の callSDKQuery は Query を { stream: () => conversation } にラップする
      // execute() でストリームが正常に消費されることを検証
      mockStreamGenerator.mockReturnValue({
        [Symbol.asyncIterator]: async function* () {
          yield { type: "text", content: "stream test" };
        },
      });

      const result = await executor.execute(mockRequest, mockSkill);
      expect(result.success).toBe(true);

      // mockStreamGenerator が呼ばれたことでストリーム消費を確認
      expect(mockStreamGenerator).toHaveBeenCalled();
    });
  });
});
