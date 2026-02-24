# Phase 4: テスト作成 - UT-FIX-SKILL-VALIDATION-CONSISTENCY-001

## メタ情報

| 項目               | 内容                                                     |
| ------------------ | -------------------------------------------------------- |
| タスクID           | UT-FIX-SKILL-VALIDATION-CONSISTENCY-001                  |
| タスク名           | skill:ハンドラP42準拠バリデーション形式統一              |
| Phase              | 4（テスト作成）                                          |
| Issue              | #874                                                     |
| 分類               | セキュリティ                                             |
| 規模               | 小規模                                                   |
| 前提Phase          | Phase 3（設計レビュー）PASS                              |
| 目的               | 6ハンドラのP42準拠3段バリデーションテストをTDDで先行作成 |
| 成果物ディレクトリ | `apps/desktop/src/main/ipc/__tests__/`                   |
| 作成日             | 2026-02-24                                               |

## 目的

TDD の Red Phase として、skillHandlers.ts 内の6つの未準拠ハンドラに対して P42 準拠 3段バリデーション（型チェック → 空文字列 → トリム空文字列）と throw 形式エラーレスポンスを検証するテストケースを**実装前に**作成する。

具体的には、以下の6ハンドラそれぞれに対して6パターンの入力（正常文字列 / 空文字列 / スペースのみ / null / undefined / 数値型）をテストする。合計 **36 テストケース**を新規テストファイル `skillHandlers.validation.test.ts` に集約する。

### 現状の問題

| ハンドラ         | パラメータ名   | 現在の型チェック                                  | trim() | エラー形式         | P42準拠 |
| ---------------- | -------------- | ------------------------------------------------- | ------ | ------------------ | ------- |
| skill:get-detail | args.skillId   | `typeof args?.skillId !== "string"`               | なし   | return { success } | 不可    |
| skill:execute    | args.skillId   | `typeof args?.skillId !== "string" \|\| === ""`   | なし   | return { success } | 不可    |
| skill:abort      | executionId    | `typeof executionId !== "string" \|\| === ""`     | なし   | return false       | 不可    |
| skill:get-status | executionId    | `typeof executionId !== "string" \|\| === ""`     | なし   | return null        | 不可    |
| skill:analyze    | args.skillName | `typeof args?.skillName !== "string" \|\| === ""` | なし   | return { success } | 不可    |
| skill:improve    | args.skillName | `typeof args?.skillName !== "string" \|\| === ""` | なし   | return { success } | 不可    |

### P42準拠の目標パターン（skill:import / skill:remove で実証済み）

```typescript
// skillHandlers.ts 行130-136 (skill:import) — 完全準拠リファレンス
if (typeof skillName !== "string" || skillName.trim() === "") {
  throw {
    code: "VALIDATION_ERROR",
    message: "skillName must be a non-empty string",
  };
}
```

## 実行タスク

- テストファイル作成: `skillHandlers.validation.test.ts` を作成する。
- モック設計: 既存テストと整合するモック構成を用意する。
- ケース実装: 6ハンドラ×6入力パターンのテストを実装する。
- Red確認: 実装前に失敗するテストとして成立させる。

| #   | タスク名                                | 説明                                                           |
| --- | --------------------------------------- | -------------------------------------------------------------- |
| 1   | 新規テストファイル作成                  | `skillHandlers.validation.test.ts` を新規作成                  |
| 2   | モック設計とセットアップ                | 既存テストのモック構成を再利用し、ハンドラキャプチャを設定     |
| 3   | 6ハンドラ × 6パターンのテストケース作成 | describe.each を使わず、ハンドラごとに describe ブロックで分離 |
| 4   | TDD Red 確認                            | 全36テストが FAIL であることを確認                             |

## 参照資料

### 前Phase成果物

| #   | 参照資料             | パス                                                                                      | 用途                           |
| --- | -------------------- | ----------------------------------------------------------------------------------------- | ------------------------------ |
| 1   | Phase 1 要件定義     | `docs/30-workflows/completed-tasks/skill-validation-consistency/phase-1-requirements.md`  | FR/NFR・受入基準の確認         |
| 2   | Phase 2 設計         | `docs/30-workflows/completed-tasks/skill-validation-consistency/phase-2-design.md`        | テスト観点・修正設計の確認     |
| 3   | Phase 3 設計レビュー | `docs/30-workflows/completed-tasks/skill-validation-consistency/phase-3-design-review.md` | レビューゲート判定・リスク確認 |

### 既存テストファイル（モック構成のリファレンス）

| #   | ファイルパス                                                            | 用途                                   |
| --- | ----------------------------------------------------------------------- | -------------------------------------- |
| 1   | `apps/desktop/src/main/ipc/__tests__/skillHandlers.test.ts`             | モック構成、ハンドラキャプチャパターン |
| 2   | `apps/desktop/src/main/ipc/__tests__/skillHandlers.execute.test.ts`     | skill:execute テスト構成のリファレンス |
| 3   | `apps/desktop/src/main/ipc/__tests__/skillHandlers.improve.test.ts`     | skill:analyze/improve テスト構成       |
| 4   | `apps/desktop/src/main/ipc/__tests__/skillHandlers.delegate.test.ts`    | SkillExecutor 関連テスト構成           |
| 5   | `apps/desktop/src/main/ipc/__tests__/skillHandlers.integration.test.ts` | 統合テスト構成                         |

### システム仕様

| 資料                                    | 用途                                 |
| --------------------------------------- | ------------------------------------ |
| `.claude/rules/06-known-pitfalls.md`    | P42: trim()バリデーション漏れ        |
| `.claude/rules/04-electron-security.md` | IPC セキュリティ原則                 |
| `.claude/rules/02-code-quality.md`      | TDD原則・テスト設計の注意            |
| `skillHandlers.test.ts` SH-IMP-02〜04   | P42準拠テストの実装リファレンス      |
| `skillHandlers.test.ts` SH-RM-05        | skill:remove P42テストのリファレンス |

### システム仕様（aiworkflow-requirements 抽出）

| 参照資料                      | パス                                                                              | 抽出した要件                               |
| ----------------------------- | --------------------------------------------------------------------------------- | ------------------------------------------ |
| security-skill-ipc.md         | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`         | 文字列引数のtrimバリデーションとsender検証 |
| interfaces-agent-sdk-skill.md | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` | PreloadのSkill API契約と期待エラー挙動     |
| api-ipc-agent.md              | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`              | IPCチャネル仕様とハンドラ契約の整合確認    |
| ipc-contract-checklist.md     | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`     | IPC契約3箇所同時更新・P42検証ケース        |
| error-handling.md             | `.claude/skills/aiworkflow-requirements/references/error-handling.md`             | VALIDATION_ERROR系の失敗系テスト観点       |

## 実行手順

### Step 1: 新規テストファイルの作成

ファイルパス: `apps/desktop/src/main/ipc/__tests__/skillHandlers.validation.test.ts`

**このファイルに全36テストケースを集約する理由**:

- 既存テストファイルへの追加は差分が大きく、レビュー時に混乱を招く
- バリデーション統一という単一目的のテストを1ファイルに集約することで、タスク完了時の確認が容易
- 既存テストの正常系・異常系テストとの責務分離

### Step 2: モック設計

以下のモック構成を `skillHandlers.validation.test.ts` に記述する。既存テスト `skillHandlers.test.ts` のモック構成をベースとする。

```typescript
/**
 * skillHandlers P42準拠バリデーションテスト
 *
 * UT-FIX-SKILL-VALIDATION-CONSISTENCY-001
 * 6ハンドラのP42準拠3段バリデーション（型チェック→空文字列→トリム空文字列）と
 * throw形式エラーレスポンスを検証する。
 *
 * TDD Red Phase: 修正前の実装に対して全テストが FAIL することを確認する。
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import type { BrowserWindow as BrowserWindowType } from "electron";

// === Mocks ===

// Mock electron-store (required for PermissionStore in SkillExecutor)
vi.mock("electron-store", () => {
  return {
    default: class MockElectronStore {
      private data: Record<string, unknown> = {};
      constructor() {}
      get store() {
        return this.data;
      }
      get(key: string) {
        return this.data[key];
      }
      set(key: string | Record<string, unknown>, value?: unknown) {
        if (typeof key === "object") {
          Object.assign(this.data, key);
        } else {
          this.data[key] = value;
        }
      }
      clear() {
        this.data = {};
      }
    },
  };
});

// Mock SkillService
const mockSkillService = {
  scanAvailableSkills: vi.fn(),
  getImportedSkills: vi.fn(),
  importSkills: vi.fn(),
  removeSkill: vi.fn(),
  getSkillById: vi.fn(),
  getSkillByName: vi.fn(),
  executeSkill: vi.fn(),
  setSkillExecutor: vi.fn(),
  getSkillsDirectory: vi.fn().mockReturnValue("/mock/skills/dir"),
};

// Mock BrowserWindow
const mockMainWindow = {
  webContents: {
    send: vi.fn(),
    getURL: vi.fn().mockReturnValue("file://"),
  },
  isDestroyed: () => false,
  id: 1,
} as unknown as BrowserWindowType;

// Mock electron modules
vi.mock("electron", () => ({
  ipcMain: {
    handle: vi.fn(),
    removeHandler: vi.fn(),
  },
  BrowserWindow: {
    fromWebContents: vi
      .fn()
      .mockReturnValue({ id: 1, isDestroyed: () => false }),
  },
}));

// Mock ipc-validator: validateIpcSender は常に valid: true を返す
vi.mock("../../infrastructure/security/ipc-validator.js", () => ({
  withValidation: vi.fn(
    (
      _channel: string,
      handler: (...args: unknown[]) => Promise<unknown>,
      _options: unknown,
    ) => handler,
  ),
  validateIpcSender: vi.fn().mockReturnValue({ valid: true }),
  toIPCValidationError: vi.fn().mockImplementation((result) => ({
    success: false,
    error: {
      code: result.errorCode ?? "IPC_UNAUTHORIZED",
      message: result.errorMessage ?? "Unauthorized IPC call",
    },
  })),
}));

// Import after mocks
import { ipcMain } from "electron";
```

**モック設計のポイント**:

- `validateIpcSender` は常に `{ valid: true }` を返す。本テストファイルではバリデーションロジックのみを検証し、IPC送信元検証は既存テストに委ねる
- `mockSkillService` の各メソッドはデフォルトで空の成功レスポンスを返す。バリデーションテストでは サービス層の呼び出し前に throw が発生するため、サービスのモック設定は最小限

### Step 3: テストケース設計

#### 3-1: 共通ヘルパーとハンドラ登録

```typescript
// チャンネル名定数
const CHANNELS = {
  GET_DETAIL: "skill:get-detail",
  EXECUTE: "skill:execute",
  ABORT: "skill:abort",
  GET_STATUS: "skill:get-status",
  ANALYZE: "skill:analyze",
  IMPROVE: "skill:improve",
} as const;

describe("skillHandlers P42準拠バリデーション", () => {
  let handlers: Map<string, (...args: unknown[]) => Promise<unknown>>;

  beforeEach(async () => {
    vi.clearAllMocks();
    handlers = new Map();

    // ハンドラをキャプチャ
    (ipcMain.handle as ReturnType<typeof vi.fn>).mockImplementation(
      (channel: string, handler: (...args: unknown[]) => Promise<unknown>) => {
        handlers.set(channel, handler);
      },
    );

    // デフォルトのモックレスポンス
    mockSkillService.scanAvailableSkills.mockResolvedValue({
      skills: [],
      errors: [],
      scannedAt: new Date(),
    });
    mockSkillService.getImportedSkills.mockResolvedValue([]);
    mockSkillService.importSkills.mockResolvedValue({
      success: true,
      importedCount: 0,
      errors: [],
    });
    mockSkillService.removeSkill.mockResolvedValue({
      success: true,
      removed: false,
    });
    mockSkillService.getSkillById.mockResolvedValue(null);
    mockSkillService.getSkillByName.mockResolvedValue(null);
    mockSkillService.executeSkill.mockResolvedValue({
      executionId: "exec-default",
      status: "success",
      output: "Default output",
      startedAt: new Date(),
      completedAt: new Date(),
    });

    // ハンドラ登録
    const { registerSkillHandlers } = await import("../skillHandlers");
    registerSkillHandlers(mockMainWindow, mockSkillService as never);
  });

  afterEach(() => {
    vi.resetModules();
  });

  /**
   * ヘルパー: ハンドラを取得し、未登録の場合はテスト失敗とする
   */
  function getHandler(
    channel: string,
  ): (...args: unknown[]) => Promise<unknown> {
    const handler = handlers.get(channel);
    if (!handler) {
      throw new Error(`${channel} handler not registered`);
    }
    return handler;
  }

  // ... 以下、各ハンドラのテストケース
});
```

#### 3-2: skill:get-detail バリデーションテスト（6テスト）

引数形式: `(event, args: { skillId: string })` — オブジェクト型

```typescript
// ===========================================================================
// skill:get-detail バリデーション
// ===========================================================================

describe("skill:get-detail バリデーション", () => {
  it("SH-GD-V01: 正常な文字列skillIdで正常処理されること", async () => {
    // Given: getSkillByIdが正常にスキルを返す
    mockSkillService.getSkillById.mockResolvedValue({
      id: "skill-1",
      name: "Test Skill",
      slug: "test-skill",
      description: "A test skill",
      path: "/test/skills/test-skill/SKILL.md",
      triggers: ["test"],
      anchors: [],
      lastModified: new Date(),
    });

    const handler = getHandler(CHANNELS.GET_DETAIL);

    // When: 正常なskillIdを渡す
    const result = await handler({}, { skillId: "skill-1" });

    // Then: skillServiceが呼び出され、正常レスポンスが返る
    expect(mockSkillService.getSkillById).toHaveBeenCalledWith("skill-1");
    expect((result as { success: boolean }).success).toBe(true);
  });

  it("SH-GD-V02: 空文字列skillIdでVALIDATION_ERRORがthrowされること", async () => {
    const handler = getHandler(CHANNELS.GET_DETAIL);

    // When: 空文字列を渡す
    // Then: VALIDATION_ERRORがthrowされる
    try {
      await handler({}, { skillId: "" });
      throw new Error("Expected VALIDATION_ERROR to be thrown");
    } catch (error) {
      expect((error as { code: string }).code).toBe("VALIDATION_ERROR");
      expect((error as { message: string }).message).toBe(
        "skillId must be a non-empty string",
      );
    }
  });

  it("SH-GD-V03: スペースのみのskillIdでVALIDATION_ERRORがthrowされること（P42）", async () => {
    const handler = getHandler(CHANNELS.GET_DETAIL);

    // When: スペースのみの文字列を渡す
    // Then: .trim()により空文字列と判定され、VALIDATION_ERRORがthrowされる
    try {
      await handler({}, { skillId: "   " });
      throw new Error("Expected VALIDATION_ERROR to be thrown");
    } catch (error) {
      expect((error as { code: string }).code).toBe("VALIDATION_ERROR");
      expect((error as { message: string }).message).toBe(
        "skillId must be a non-empty string",
      );
    }
  });

  it("SH-GD-V04: null skillIdでVALIDATION_ERRORがthrowされること", async () => {
    const handler = getHandler(CHANNELS.GET_DETAIL);

    // When: nullを渡す
    // Then: typeof null !== "string" でVALIDATION_ERRORがthrowされる
    try {
      await handler({}, { skillId: null });
      throw new Error("Expected VALIDATION_ERROR to be thrown");
    } catch (error) {
      expect((error as { code: string }).code).toBe("VALIDATION_ERROR");
      expect((error as { message: string }).message).toBe(
        "skillId must be a non-empty string",
      );
    }
  });

  it("SH-GD-V05: undefined（argsなし）でVALIDATION_ERRORがthrowされること", async () => {
    const handler = getHandler(CHANNELS.GET_DETAIL);

    // When: argsを省略（undefinedが渡される）
    // Then: args?.skillIdがundefinedとなり、typeof !== "string"でVALIDATION_ERROR
    try {
      await handler({}, undefined);
      throw new Error("Expected VALIDATION_ERROR to be thrown");
    } catch (error) {
      expect((error as { code: string }).code).toBe("VALIDATION_ERROR");
      expect((error as { message: string }).message).toBe(
        "skillId must be a non-empty string",
      );
    }
  });

  it("SH-GD-V06: 数値型skillIdでVALIDATION_ERRORがthrowされること", async () => {
    const handler = getHandler(CHANNELS.GET_DETAIL);

    // When: 数値型を渡す
    // Then: typeof 123 !== "string" でVALIDATION_ERRORがthrowされる
    try {
      await handler({}, { skillId: 123 });
      throw new Error("Expected VALIDATION_ERROR to be thrown");
    } catch (error) {
      expect((error as { code: string }).code).toBe("VALIDATION_ERROR");
      expect((error as { message: string }).message).toBe(
        "skillId must be a non-empty string",
      );
    }
  });
});
```

#### 3-3: skill:execute バリデーションテスト（6テスト）

引数形式: `(event, args: { skillId: string; params?: Record<string, unknown> })` — オブジェクト型

```typescript
// ===========================================================================
// skill:execute バリデーション
// ===========================================================================

describe("skill:execute バリデーション", () => {
  it("SH-EXE-V01: 正常な文字列skillIdで正常処理されること", async () => {
    const handler = getHandler(CHANNELS.EXECUTE);

    // When: 正常なskillIdを渡す
    const result = await handler({}, { skillId: "skill-1" });

    // Then: skillServiceが呼び出され、正常レスポンスが返る
    expect(mockSkillService.executeSkill).toHaveBeenCalledWith(
      "skill-1",
      undefined,
    );
    expect((result as { success: boolean }).success).toBe(true);
  });

  it("SH-EXE-V02: 空文字列skillIdでVALIDATION_ERRORがthrowされること", async () => {
    const handler = getHandler(CHANNELS.EXECUTE);

    try {
      await handler({}, { skillId: "" });
      throw new Error("Expected VALIDATION_ERROR to be thrown");
    } catch (error) {
      expect((error as { code: string }).code).toBe("VALIDATION_ERROR");
      expect((error as { message: string }).message).toBe(
        "skillId must be a non-empty string",
      );
    }
  });

  it("SH-EXE-V03: スペースのみのskillIdでVALIDATION_ERRORがthrowされること（P42）", async () => {
    const handler = getHandler(CHANNELS.EXECUTE);

    try {
      await handler({}, { skillId: "   " });
      throw new Error("Expected VALIDATION_ERROR to be thrown");
    } catch (error) {
      expect((error as { code: string }).code).toBe("VALIDATION_ERROR");
      expect((error as { message: string }).message).toBe(
        "skillId must be a non-empty string",
      );
    }
  });

  it("SH-EXE-V04: null skillIdでVALIDATION_ERRORがthrowされること", async () => {
    const handler = getHandler(CHANNELS.EXECUTE);

    try {
      await handler({}, { skillId: null });
      throw new Error("Expected VALIDATION_ERROR to be thrown");
    } catch (error) {
      expect((error as { code: string }).code).toBe("VALIDATION_ERROR");
      expect((error as { message: string }).message).toBe(
        "skillId must be a non-empty string",
      );
    }
  });

  it("SH-EXE-V05: undefined（argsなし）でVALIDATION_ERRORがthrowされること", async () => {
    const handler = getHandler(CHANNELS.EXECUTE);

    try {
      await handler({}, undefined);
      throw new Error("Expected VALIDATION_ERROR to be thrown");
    } catch (error) {
      expect((error as { code: string }).code).toBe("VALIDATION_ERROR");
      expect((error as { message: string }).message).toBe(
        "skillId must be a non-empty string",
      );
    }
  });

  it("SH-EXE-V06: 数値型skillIdでVALIDATION_ERRORがthrowされること", async () => {
    const handler = getHandler(CHANNELS.EXECUTE);

    try {
      await handler({}, { skillId: 123 });
      throw new Error("Expected VALIDATION_ERROR to be thrown");
    } catch (error) {
      expect((error as { code: string }).code).toBe("VALIDATION_ERROR");
      expect((error as { message: string }).message).toBe(
        "skillId must be a non-empty string",
      );
    }
  });
});
```

#### 3-4: skill:abort バリデーションテスト（6テスト）

引数形式: `(event, executionId: string)` — 直接引数型

```typescript
// ===========================================================================
// skill:abort バリデーション
// ===========================================================================

describe("skill:abort バリデーション", () => {
  it("SH-ABT-V01: 正常な文字列executionIdで正常処理されること", async () => {
    const handler = getHandler(CHANNELS.ABORT);

    // When: 正常なexecutionIdを渡す
    // Then: throwされずに処理が完了する（_skillExecutorInstanceがnullのためfalseが返る可能性あり）
    const result = await handler({}, "exec-123");
    // SkillExecutor未設定時はfalseが返るが、バリデーションは通過している
    expect(result).toBeDefined();
  });

  it("SH-ABT-V02: 空文字列executionIdでVALIDATION_ERRORがthrowされること", async () => {
    const handler = getHandler(CHANNELS.ABORT);

    try {
      await handler({}, "");
      throw new Error("Expected VALIDATION_ERROR to be thrown");
    } catch (error) {
      expect((error as { code: string }).code).toBe("VALIDATION_ERROR");
      expect((error as { message: string }).message).toBe(
        "executionId must be a non-empty string",
      );
    }
  });

  it("SH-ABT-V03: スペースのみのexecutionIdでVALIDATION_ERRORがthrowされること（P42）", async () => {
    const handler = getHandler(CHANNELS.ABORT);

    try {
      await handler({}, "   ");
      throw new Error("Expected VALIDATION_ERROR to be thrown");
    } catch (error) {
      expect((error as { code: string }).code).toBe("VALIDATION_ERROR");
      expect((error as { message: string }).message).toBe(
        "executionId must be a non-empty string",
      );
    }
  });

  it("SH-ABT-V04: null executionIdでVALIDATION_ERRORがthrowされること", async () => {
    const handler = getHandler(CHANNELS.ABORT);

    try {
      await handler({}, null);
      throw new Error("Expected VALIDATION_ERROR to be thrown");
    } catch (error) {
      expect((error as { code: string }).code).toBe("VALIDATION_ERROR");
      expect((error as { message: string }).message).toBe(
        "executionId must be a non-empty string",
      );
    }
  });

  it("SH-ABT-V05: undefined executionIdでVALIDATION_ERRORがthrowされること", async () => {
    const handler = getHandler(CHANNELS.ABORT);

    try {
      await handler({}, undefined);
      throw new Error("Expected VALIDATION_ERROR to be thrown");
    } catch (error) {
      expect((error as { code: string }).code).toBe("VALIDATION_ERROR");
      expect((error as { message: string }).message).toBe(
        "executionId must be a non-empty string",
      );
    }
  });

  it("SH-ABT-V06: 数値型executionIdでVALIDATION_ERRORがthrowされること", async () => {
    const handler = getHandler(CHANNELS.ABORT);

    try {
      await handler({}, 123);
      throw new Error("Expected VALIDATION_ERROR to be thrown");
    } catch (error) {
      expect((error as { code: string }).code).toBe("VALIDATION_ERROR");
      expect((error as { message: string }).message).toBe(
        "executionId must be a non-empty string",
      );
    }
  });
});
```

#### 3-5: skill:get-status バリデーションテスト（6テスト）

引数形式: `(event, executionId: string)` — 直接引数型

```typescript
// ===========================================================================
// skill:get-status バリデーション
// ===========================================================================

describe("skill:get-status バリデーション", () => {
  it("SH-GS-V01: 正常な文字列executionIdで正常処理されること", async () => {
    const handler = getHandler(CHANNELS.GET_STATUS);

    // When: 正常なexecutionIdを渡す
    // Then: throwされずに処理が完了する（_skillExecutorInstanceがnullのためnullが返る可能性あり）
    const result = await handler({}, "exec-123");
    expect(result).toBeDefined();
  });

  it("SH-GS-V02: 空文字列executionIdでVALIDATION_ERRORがthrowされること", async () => {
    const handler = getHandler(CHANNELS.GET_STATUS);

    try {
      await handler({}, "");
      throw new Error("Expected VALIDATION_ERROR to be thrown");
    } catch (error) {
      expect((error as { code: string }).code).toBe("VALIDATION_ERROR");
      expect((error as { message: string }).message).toBe(
        "executionId must be a non-empty string",
      );
    }
  });

  it("SH-GS-V03: スペースのみのexecutionIdでVALIDATION_ERRORがthrowされること（P42）", async () => {
    const handler = getHandler(CHANNELS.GET_STATUS);

    try {
      await handler({}, "   ");
      throw new Error("Expected VALIDATION_ERROR to be thrown");
    } catch (error) {
      expect((error as { code: string }).code).toBe("VALIDATION_ERROR");
      expect((error as { message: string }).message).toBe(
        "executionId must be a non-empty string",
      );
    }
  });

  it("SH-GS-V04: null executionIdでVALIDATION_ERRORがthrowされること", async () => {
    const handler = getHandler(CHANNELS.GET_STATUS);

    try {
      await handler({}, null);
      throw new Error("Expected VALIDATION_ERROR to be thrown");
    } catch (error) {
      expect((error as { code: string }).code).toBe("VALIDATION_ERROR");
      expect((error as { message: string }).message).toBe(
        "executionId must be a non-empty string",
      );
    }
  });

  it("SH-GS-V05: undefined executionIdでVALIDATION_ERRORがthrowされること", async () => {
    const handler = getHandler(CHANNELS.GET_STATUS);

    try {
      await handler({}, undefined);
      throw new Error("Expected VALIDATION_ERROR to be thrown");
    } catch (error) {
      expect((error as { code: string }).code).toBe("VALIDATION_ERROR");
      expect((error as { message: string }).message).toBe(
        "executionId must be a non-empty string",
      );
    }
  });

  it("SH-GS-V06: 数値型executionIdでVALIDATION_ERRORがthrowされること", async () => {
    const handler = getHandler(CHANNELS.GET_STATUS);

    try {
      await handler({}, 123);
      throw new Error("Expected VALIDATION_ERROR to be thrown");
    } catch (error) {
      expect((error as { code: string }).code).toBe("VALIDATION_ERROR");
      expect((error as { message: string }).message).toBe(
        "executionId must be a non-empty string",
      );
    }
  });
});
```

#### 3-6: skill:analyze バリデーションテスト（6テスト）

引数形式: `(event, args: SkillAnalyzeRequest)` — オブジェクト型（`args.skillName`）

```typescript
// ===========================================================================
// skill:analyze バリデーション
// ===========================================================================

describe("skill:analyze バリデーション", () => {
  it("SH-ANZ-V01: 正常な文字列skillNameで正常処理されること", async () => {
    // Given: getSkillByNameが正常にスキルを返す
    mockSkillService.getSkillByName.mockResolvedValue({
      name: "test-skill",
      description: "A test skill",
      path: "/mock/skills/test-skill",
      updatedAt: new Date(),
      agents: [],
      references: [],
      scripts: [],
      assets: [],
      schemas: [],
      indexes: [],
      otherFiles: [],
      importedAt: new Date(),
      status: "active",
    });

    const handler = getHandler(CHANNELS.ANALYZE);

    // When: 正常なskillNameを渡す
    const result = await handler({}, { skillName: "test-skill" });

    // Then: skillServiceが呼び出される（analyzerのモック次第で結果は変わる）
    expect(mockSkillService.getSkillByName).toHaveBeenCalledWith("test-skill");
  });

  it("SH-ANZ-V02: 空文字列skillNameでVALIDATION_ERRORがthrowされること", async () => {
    const handler = getHandler(CHANNELS.ANALYZE);

    try {
      await handler({}, { skillName: "" });
      throw new Error("Expected VALIDATION_ERROR to be thrown");
    } catch (error) {
      expect((error as { code: string }).code).toBe("VALIDATION_ERROR");
      expect((error as { message: string }).message).toBe(
        "skillName must be a non-empty string",
      );
    }
  });

  it("SH-ANZ-V03: スペースのみのskillNameでVALIDATION_ERRORがthrowされること（P42）", async () => {
    const handler = getHandler(CHANNELS.ANALYZE);

    try {
      await handler({}, { skillName: "   " });
      throw new Error("Expected VALIDATION_ERROR to be thrown");
    } catch (error) {
      expect((error as { code: string }).code).toBe("VALIDATION_ERROR");
      expect((error as { message: string }).message).toBe(
        "skillName must be a non-empty string",
      );
    }
  });

  it("SH-ANZ-V04: null skillNameでVALIDATION_ERRORがthrowされること", async () => {
    const handler = getHandler(CHANNELS.ANALYZE);

    try {
      await handler({}, { skillName: null });
      throw new Error("Expected VALIDATION_ERROR to be thrown");
    } catch (error) {
      expect((error as { code: string }).code).toBe("VALIDATION_ERROR");
      expect((error as { message: string }).message).toBe(
        "skillName must be a non-empty string",
      );
    }
  });

  it("SH-ANZ-V05: undefined（argsなし）でVALIDATION_ERRORがthrowされること", async () => {
    const handler = getHandler(CHANNELS.ANALYZE);

    try {
      await handler({}, undefined);
      throw new Error("Expected VALIDATION_ERROR to be thrown");
    } catch (error) {
      expect((error as { code: string }).code).toBe("VALIDATION_ERROR");
      expect((error as { message: string }).message).toBe(
        "skillName must be a non-empty string",
      );
    }
  });

  it("SH-ANZ-V06: 数値型skillNameでVALIDATION_ERRORがthrowされること", async () => {
    const handler = getHandler(CHANNELS.ANALYZE);

    try {
      await handler({}, { skillName: 123 });
      throw new Error("Expected VALIDATION_ERROR to be thrown");
    } catch (error) {
      expect((error as { code: string }).code).toBe("VALIDATION_ERROR");
      expect((error as { message: string }).message).toBe(
        "skillName must be a non-empty string",
      );
    }
  });
});
```

#### 3-7: skill:improve バリデーションテスト（6テスト）

引数形式: `(event, args: SkillImproveRequest)` — オブジェクト型（`args.skillName`）

```typescript
// ===========================================================================
// skill:improve バリデーション
// ===========================================================================

describe("skill:improve バリデーション", () => {
  it("SH-IVE-V01: 正常な文字列skillNameで正常処理されること", async () => {
    const handler = getHandler(CHANNELS.IMPROVE);

    // When: 正常なskillNameとanalysisを渡す
    // Then: throw されずに処理が進む（analysisバリデーション後にサービス呼び出し）
    // 注意: analysisがないとanalysisバリデーションで弾かれるため、ダミーを渡す
    const result = await handler(
      {},
      {
        skillName: "test-skill",
        analysis: { score: 80, issues: [] },
      },
    );

    // バリデーションを通過したことを確認（サービス層のレスポンスに依存）
    expect(result).toBeDefined();
  });

  it("SH-IVE-V02: 空文字列skillNameでVALIDATION_ERRORがthrowされること", async () => {
    const handler = getHandler(CHANNELS.IMPROVE);

    try {
      await handler({}, { skillName: "", analysis: { score: 80, issues: [] } });
      throw new Error("Expected VALIDATION_ERROR to be thrown");
    } catch (error) {
      expect((error as { code: string }).code).toBe("VALIDATION_ERROR");
      expect((error as { message: string }).message).toBe(
        "skillName must be a non-empty string",
      );
    }
  });

  it("SH-IVE-V03: スペースのみのskillNameでVALIDATION_ERRORがthrowされること（P42）", async () => {
    const handler = getHandler(CHANNELS.IMPROVE);

    try {
      await handler(
        {},
        { skillName: "   ", analysis: { score: 80, issues: [] } },
      );
      throw new Error("Expected VALIDATION_ERROR to be thrown");
    } catch (error) {
      expect((error as { code: string }).code).toBe("VALIDATION_ERROR");
      expect((error as { message: string }).message).toBe(
        "skillName must be a non-empty string",
      );
    }
  });

  it("SH-IVE-V04: null skillNameでVALIDATION_ERRORがthrowされること", async () => {
    const handler = getHandler(CHANNELS.IMPROVE);

    try {
      await handler(
        {},
        { skillName: null, analysis: { score: 80, issues: [] } },
      );
      throw new Error("Expected VALIDATION_ERROR to be thrown");
    } catch (error) {
      expect((error as { code: string }).code).toBe("VALIDATION_ERROR");
      expect((error as { message: string }).message).toBe(
        "skillName must be a non-empty string",
      );
    }
  });

  it("SH-IVE-V05: undefined（argsなし）でVALIDATION_ERRORがthrowされること", async () => {
    const handler = getHandler(CHANNELS.IMPROVE);

    try {
      await handler({}, undefined);
      throw new Error("Expected VALIDATION_ERROR to be thrown");
    } catch (error) {
      expect((error as { code: string }).code).toBe("VALIDATION_ERROR");
      expect((error as { message: string }).message).toBe(
        "skillName must be a non-empty string",
      );
    }
  });

  it("SH-IVE-V06: 数値型skillNameでVALIDATION_ERRORがthrowされること", async () => {
    const handler = getHandler(CHANNELS.IMPROVE);

    try {
      await handler(
        {},
        { skillName: 123, analysis: { score: 80, issues: [] } },
      );
      throw new Error("Expected VALIDATION_ERROR to be thrown");
    } catch (error) {
      expect((error as { code: string }).code).toBe("VALIDATION_ERROR");
      expect((error as { message: string }).message).toBe(
        "skillName must be a non-empty string",
      );
    }
  });
});
```

### Step 4: TDD Red Phase 確認

テストファイル作成後、以下のコマンドで全36テストが FAIL（Red）であることを確認する。

```bash
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers.validation.test.ts
```

**期待される結果**:

- 正常系テスト（V01）: 6件 PASS（既存のバリデーションで正常文字列は通過する）
- 異常系テスト（V02〜V06）: 30件 FAIL（Red）
  - V02（空文字列）: skill:get-detail のみ Red（他は既存の `=== ""` チェックで `return` するが throw しないため Red）
  - V03（スペースのみ）: 全6件 Red（trim() 未実装のため通過してしまう）
  - V04（null）: skill:get-detail は `return { success: false }` するが throw しないため Red
  - V05（undefined）: 同上
  - V06（数値型）: 同上

**既存テストへの影響確認**:

```bash
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers
```

既存テストファイル5件は全て PASS を維持していること。新規ファイルのみ Red であること。

### テストケース全量マトリクス

| テストID   | ハンドラ         | 入力パターン | パラメータ名 | 期待結果               | 現状の動作                      |
| ---------- | ---------------- | ------------ | ------------ | ---------------------- | ------------------------------- |
| SH-GD-V01  | skill:get-detail | 正常文字列   | skillId      | 正常処理               | PASS（変更なし）                |
| SH-GD-V02  | skill:get-detail | `""`         | skillId      | throw VALIDATION_ERROR | return { success: false } → Red |
| SH-GD-V03  | skill:get-detail | `"   "`      | skillId      | throw VALIDATION_ERROR | typeof通過、サービス呼出 → Red  |
| SH-GD-V04  | skill:get-detail | null         | skillId      | throw VALIDATION_ERROR | return { success: false } → Red |
| SH-GD-V05  | skill:get-detail | undefined    | skillId      | throw VALIDATION_ERROR | return { success: false } → Red |
| SH-GD-V06  | skill:get-detail | 123          | skillId      | throw VALIDATION_ERROR | return { success: false } → Red |
| SH-EXE-V01 | skill:execute    | 正常文字列   | skillId      | 正常処理               | PASS（変更なし）                |
| SH-EXE-V02 | skill:execute    | `""`         | skillId      | throw VALIDATION_ERROR | return { success: false } → Red |
| SH-EXE-V03 | skill:execute    | `"   "`      | skillId      | throw VALIDATION_ERROR | === "" 通過、サービス呼出 → Red |
| SH-EXE-V04 | skill:execute    | null         | skillId      | throw VALIDATION_ERROR | return { success: false } → Red |
| SH-EXE-V05 | skill:execute    | undefined    | skillId      | throw VALIDATION_ERROR | return { success: false } → Red |
| SH-EXE-V06 | skill:execute    | 123          | skillId      | throw VALIDATION_ERROR | return { success: false } → Red |
| SH-ABT-V01 | skill:abort      | 正常文字列   | executionId  | 正常処理               | PASS（変更なし）                |
| SH-ABT-V02 | skill:abort      | `""`         | executionId  | throw VALIDATION_ERROR | return false → Red              |
| SH-ABT-V03 | skill:abort      | `"   "`      | executionId  | throw VALIDATION_ERROR | === "" 通過、executor呼出 → Red |
| SH-ABT-V04 | skill:abort      | null         | executionId  | throw VALIDATION_ERROR | return false → Red              |
| SH-ABT-V05 | skill:abort      | undefined    | executionId  | throw VALIDATION_ERROR | return false → Red              |
| SH-ABT-V06 | skill:abort      | 123          | executionId  | throw VALIDATION_ERROR | return false → Red              |
| SH-GS-V01  | skill:get-status | 正常文字列   | executionId  | 正常処理               | PASS（変更なし）                |
| SH-GS-V02  | skill:get-status | `""`         | executionId  | throw VALIDATION_ERROR | return null → Red               |
| SH-GS-V03  | skill:get-status | `"   "`      | executionId  | throw VALIDATION_ERROR | === "" 通過、executor呼出 → Red |
| SH-GS-V04  | skill:get-status | null         | executionId  | throw VALIDATION_ERROR | return null → Red               |
| SH-GS-V05  | skill:get-status | undefined    | executionId  | throw VALIDATION_ERROR | return null → Red               |
| SH-GS-V06  | skill:get-status | 123          | executionId  | throw VALIDATION_ERROR | return null → Red               |
| SH-ANZ-V01 | skill:analyze    | 正常文字列   | skillName    | 正常処理               | PASS（変更なし）                |
| SH-ANZ-V02 | skill:analyze    | `""`         | skillName    | throw VALIDATION_ERROR | return { success: false } → Red |
| SH-ANZ-V03 | skill:analyze    | `"   "`      | skillName    | throw VALIDATION_ERROR | === "" 通過、サービス呼出 → Red |
| SH-ANZ-V04 | skill:analyze    | null         | skillName    | throw VALIDATION_ERROR | return { success: false } → Red |
| SH-ANZ-V05 | skill:analyze    | undefined    | skillName    | throw VALIDATION_ERROR | return { success: false } → Red |
| SH-ANZ-V06 | skill:analyze    | 123          | skillName    | throw VALIDATION_ERROR | return { success: false } → Red |
| SH-IVE-V01 | skill:improve    | 正常文字列   | skillName    | 正常処理               | PASS（変更なし）                |
| SH-IVE-V02 | skill:improve    | `""`         | skillName    | throw VALIDATION_ERROR | return { success: false } → Red |
| SH-IVE-V03 | skill:improve    | `"   "`      | skillName    | throw VALIDATION_ERROR | === "" 通過、サービス呼出 → Red |
| SH-IVE-V04 | skill:improve    | null         | skillName    | throw VALIDATION_ERROR | return { success: false } → Red |
| SH-IVE-V05 | skill:improve    | undefined    | skillName    | throw VALIDATION_ERROR | return { success: false } → Red |
| SH-IVE-V06 | skill:improve    | 123          | skillName    | throw VALIDATION_ERROR | return { success: false } → Red |

## 統合テスト連携

### 既存テストとの整合性

| 既存テストファイル                | 影響                                                                |
| --------------------------------- | ------------------------------------------------------------------- |
| skillHandlers.test.ts             | SH-GD-03（空skillId）は return 形式を期待 → Phase 6 で throw に修正 |
| skillHandlers.execute.test.ts     | TC-4-006（バリデーション4件）は return 形式を期待 → Phase 6 で修正  |
| skillHandlers.improve.test.ts     | IPC-02, IPC-03（エラー系）は return 形式を期待 → Phase 6 で修正     |
| skillHandlers.delegate.test.ts    | 影響なし（skill:delegate は対象外）                                 |
| skillHandlers.integration.test.ts | バリデーション関連テストがある場合は Phase 6 で修正                 |

### TDD Red → Green の遷移計画

1. **Phase 4 完了時点**: 新規テスト 30件 Red、6件 PASS
2. **Phase 5 完了時点**: 新規テスト 36件全て Green、既存テストの一部が Red（throw形式変更による）
3. **Phase 6 完了時点**: 既存テストも全て Green

## 多角的チェック観点

| 観点         | 確認内容                                                         |
| ------------ | ---------------------------------------------------------------- |
| セキュリティ | P42準拠: スペースのみ文字列の拒否を全6ハンドラでテスト           |
| 型安全       | null / undefined / 数値型の拒否をテスト                          |
| エラー形式   | throw { code, message } 形式を検証（return ではない）            |
| 回帰リスク   | 既存テストへの影響を Phase 6 修正リストに記録                    |
| テスト命名   | 既存 `SH-ABBR-VNN` パターンに準拠                                |
| テスト分離   | 各テスト間で状態を共有しない（beforeEach でリセット）            |
| モック設計   | validateIpcSender は常に valid: true（バリデーション専用テスト） |

## 成果物

| #   | 名称                    | パス                                                                   | 種別     |
| --- | ----------------------- | ---------------------------------------------------------------------- | -------- |
| 1   | P42バリデーションテスト | `apps/desktop/src/main/ipc/__tests__/skillHandlers.validation.test.ts` | 新規作成 |

## 完了条件チェックリスト

- [ ] `skillHandlers.validation.test.ts` が新規作成されている
- [ ] 全6ハンドラに対する正常系テスト（V01）が6件作成されている
- [ ] 全6ハンドラに対する異常系テスト（V02〜V06）が30件作成されている
- [ ] 合計36テストケースが作成されている
- [ ] テスト識別子が `SH-ABBR-VNN` パターンに準拠している
- [ ] 各テストが try-catch パターンで throw 形式の VALIDATION_ERROR を検証している
- [ ] P42 トリムチェック（スペースのみ文字列）テストが全6ハンドラに含まれている（V03）
- [ ] `cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers.validation.test.ts` で新規テストの Red/PASS 状態を確認
- [ ] 既存テスト5ファイルが影響を受けず PASS を維持していることを確認

## 次のPhase

Phase 5（実装）へ進む。Phase 4 で作成した Red テストを Green にするために、6ハンドラのバリデーションコードを P42 準拠に修正する。
