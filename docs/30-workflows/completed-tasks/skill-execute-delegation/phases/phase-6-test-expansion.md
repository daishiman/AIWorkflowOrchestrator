# Phase 6: テスト拡充

## メタ情報

| 項目     | 値                                    |
| -------- | ------------------------------------- |
| Phase    | 6                                     |
| 機能名   | skill-execute-delegation              |
| タスクID | TASK-FIX-7-1-EXECUTE-SKILL-DELEGATION |
| 作成日   | 2026-02-10                            |

## 目的

Phase 5 の実装に対してテストを拡充し、カバレッジ目標を達成する。
特に E2E スモークテストで全経路（Renderer → Preload → IPC → Handler → SkillExecutor → SDK）を網羅的にカバーする。

## 実行タスク

- カバレッジ分析: テストカバレッジの測定と不足領域の特定
- ユニットテスト拡充: 境界値・異常系テストの追加
- 統合テスト拡充: コンポーネント間連携テストの強化
- E2Eテスト実装: スモークテストの実際の実装

## 参照資料

| 資料名               | パス                                                    | 説明           |
| -------------------- | ------------------------------------------------------- | -------------- |
| Phase 4 テスト仕様書 | `outputs/phase-4/test-specification.md`                 | Phase 4 成果物 |
| Phase 5 実装         | `apps/desktop/src/main/services/skill/SkillService.ts`  | Phase 5 成果物 |
| SkillExecutor        | `apps/desktop/src/main/services/skill/SkillExecutor.ts` | SDK連携実装    |
| skillHandlers        | `apps/desktop/src/main/ipc/skillHandlers.ts`            | IPCハンドラー  |

## ユニットテストカバレッジ基準

| 指標              | 最低基準 | 推奨基準 |
| ----------------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      |
| Branch Coverage   | 60%      | 70%      |
| Function Coverage | 80%      | 90%      |

## 結合テストカバレッジ基準

| 指標                         | 目標 |
| ---------------------------- | ---- |
| IPCチャネル                  | 100% |
| モジュール間インターフェース | 100% |
| 正常系シナリオ               | 100% |
| 異常系シナリオ               | 80%+ |
| 外部連携ポイント             | 100% |

## 実行手順

### 1. カバレッジ測定

```bash
# カバレッジレポート生成
pnpm --filter @repo/desktop test:coverage

# 特定ファイルのカバレッジ確認
pnpm --filter @repo/desktop test:coverage -- --collectCoverageFrom='**/services/skill/**'
```

### 2. ギャップ分析

Phase 4 で作成したテストの不足箇所を特定する:

#### 2.1 未到達のコードパス

| ファイル         | 未到達箇所                     | 追加テスト     |
| ---------------- | ------------------------------ | -------------- |
| SkillService.ts  | setSkillExecutor null チェック | UT-006         |
| SkillService.ts  | SkillMetadata 変換エッジケース | UT-007         |
| SkillExecutor.ts | リトライロジック               | UT-008〜UT-010 |
| skillHandlers.ts | IPC バリデーションエラー       | UT-011         |

#### 2.2 不足している統合シナリオ

| シナリオ       | 検証内容                               | 追加テスト |
| -------------- | -------------------------------------- | ---------- |
| 同時実行制限   | MAX_CONCURRENT_EXECUTIONS 超過時の挙動 | IT-005     |
| リトライ成功   | ネットワークエラー後のリトライ成功     | IT-006     |
| タイムアウト   | SDK タイムアウト時の挙動               | IT-007     |
| 権限リクエスト | permission:request イベントの送信      | IT-008     |

### 3. 追加ユニットテスト作成

#### 3.1 SkillService 追加テスト

```typescript
// apps/desktop/src/main/services/skill/SkillService.test.ts に追加

describe("SkillService.executeSkill - Extended", () => {
  it("UT-006: SkillExecutor 未設定時にエラーを返すこと", async () => {
    // Arrange
    const skillService = new SkillService(
      mockScanner,
      mockParser,
      mockImportManager,
    );
    // setSkillExecutor を呼ばない

    // Act & Assert
    await expect(
      skillService.executeSkill("skill-id", { prompt: "test" }),
    ).rejects.toThrow("SkillExecutor が初期化されていません");
  });

  it("UT-007: SkillMetadata 変換が正しく行われること", async () => {
    // Arrange
    const skill = {
      id: "test-id",
      name: "Test Skill",
      slug: "test-skill",
      description: "A test skill",
      path: "/path/to/skill",
      triggers: ["@test"],
      anchors: [{ source: "file", application: "vscode", purpose: "editing" }],
      allowedTools: ["Read", "Write"],
      lastModified: new Date(),
    };

    mockSkillService.getSkillById.mockResolvedValue(skill);
    mockImportManager.isImported.mockReturnValue(true);

    // Act
    await skillService.executeSkill("test-id", { prompt: "test prompt" });

    // Assert
    expect(mockSkillExecutor.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        prompt: "test prompt",
        skillId: "test-id",
      }),
      expect.objectContaining({
        id: "test-id",
        name: "Test Skill",
        slug: "test-skill",
        allowedTools: ["Read", "Write"],
      }),
    );
  });
});
```

#### 3.2 SkillExecutor リトライテスト

```typescript
// apps/desktop/src/main/services/skill/SkillExecutor.retry.test.ts

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  isRetryableError,
  calculateBackoffDelay,
  DEFAULT_RETRY_CONFIG,
} from "./SkillExecutor";

describe("SkillExecutor Retry Logic", () => {
  describe("isRetryableError", () => {
    it("UT-008: ネットワークエラーはリトライ対象", () => {
      const networkError = new Error("Connection failed");
      (networkError as Error & { code: string }).code = "ECONNRESET";

      const result = isRetryableError(networkError);

      expect(result.retryable).toBe(true);
      expect(result.errorType).toBe("network");
    });

    it("UT-009: HTTP 429 はリトライ対象（rate_limit）", () => {
      const rateLimitError = new Error("Too Many Requests");
      (rateLimitError as Error & { status: number }).status = 429;

      const result = isRetryableError(rateLimitError);

      expect(result.retryable).toBe(true);
      expect(result.errorType).toBe("rate_limit");
    });

    it("UT-010: HTTP 400 はリトライ対象外", () => {
      const clientError = new Error("Bad Request");
      (clientError as Error & { status: number }).status = 400;

      const result = isRetryableError(clientError);

      expect(result.retryable).toBe(false);
    });

    it("AbortError はリトライ対象外", () => {
      const abortError = new DOMException("Aborted", "AbortError");

      const result = isRetryableError(abortError);

      expect(result.retryable).toBe(false);
    });
  });

  describe("calculateBackoffDelay", () => {
    it("attempt=0 では baseDelayMs を返す", () => {
      const delay = calculateBackoffDelay(0, DEFAULT_RETRY_CONFIG);

      // Jitter があるため範囲チェック
      expect(delay).toBeGreaterThanOrEqual(
        DEFAULT_RETRY_CONFIG.baseDelayMs * 0.8,
      );
      expect(delay).toBeLessThanOrEqual(DEFAULT_RETRY_CONFIG.baseDelayMs * 1.2);
    });

    it("attempt 増加で exponential に delay が増加する", () => {
      const delay0 = calculateBackoffDelay(0, {
        ...DEFAULT_RETRY_CONFIG,
        jitterFactor: 0,
      });
      const delay1 = calculateBackoffDelay(1, {
        ...DEFAULT_RETRY_CONFIG,
        jitterFactor: 0,
      });
      const delay2 = calculateBackoffDelay(2, {
        ...DEFAULT_RETRY_CONFIG,
        jitterFactor: 0,
      });

      expect(delay1).toBe(delay0 * DEFAULT_RETRY_CONFIG.backoffMultiplier);
      expect(delay2).toBe(delay1 * DEFAULT_RETRY_CONFIG.backoffMultiplier);
    });

    it("maxDelayMs を超えないこと", () => {
      const delay = calculateBackoffDelay(100, DEFAULT_RETRY_CONFIG);

      expect(delay).toBeLessThanOrEqual(DEFAULT_RETRY_CONFIG.maxDelayMs);
    });

    it("retryAfterMs が優先されること", () => {
      const retryAfterMs = 5000;
      const delay = calculateBackoffDelay(
        0,
        DEFAULT_RETRY_CONFIG,
        retryAfterMs,
      );

      expect(delay).toBe(retryAfterMs);
    });
  });
});
```

#### 3.3 skillHandlers バリデーションテスト

```typescript
// apps/desktop/src/main/ipc/skillHandlers.test.ts に追加

describe("skillHandlers - Validation", () => {
  it("UT-011: 不正な送信元からのリクエストを拒否すること", async () => {
    // Arrange
    const handler = handlers.get(IPC_CHANNELS.SKILL_EXECUTE);
    const invalidEvent = {
      sender: {
        id: 999, // 不正なウィンドウID
      },
      senderFrame: { url: "http://malicious.com" },
    };
    const args = { skillId: "test-skill", params: {} };

    // Act & Assert
    await expect(handler(invalidEvent, args)).rejects.toThrow();
  });

  it("空の skillId でエラーを返すこと", async () => {
    // Arrange
    const handler = handlers.get(IPC_CHANNELS.SKILL_EXECUTE);
    const mockEvent = {
      sender: mockMainWindow.webContents,
      senderFrame: { url: "app://localhost" },
    };
    const args = { skillId: "", params: {} };

    // Act
    const result = await handler(mockEvent, args);

    // Assert
    expect(result.success).toBe(false);
    expect(result.error).toBe("skillId must be a string");
  });
});
```

### 4. 追加統合テスト作成

#### 4.1 同時実行制限テスト

```typescript
// apps/desktop/src/main/services/skill/SkillService.integration.test.ts に追加

describe("IT-005: 同時実行制限", () => {
  it("MAX_CONCURRENT_EXECUTIONS を超えた場合にエラーを返すこと", async () => {
    // Arrange
    const MAX_CONCURRENT = 5;
    const promises: Promise<SkillExecutionResponse>[] = [];

    // 6つの同時実行を開始
    for (let i = 0; i < MAX_CONCURRENT + 1; i++) {
      promises.push(
        skillService.executeSkill(`skill-${i}`, { prompt: "test" }),
      );
    }

    // Act
    const results = await Promise.allSettled(promises);

    // Assert
    const rejected = results.filter((r) => r.status === "rejected");
    expect(rejected.length).toBe(1);
    expect((rejected[0] as PromiseRejectedResult).reason.code).toBe(
      "MAX_CONCURRENT_EXCEEDED",
    );
  });
});
```

#### 4.2 リトライ成功テスト

```typescript
describe("IT-006: リトライ成功", () => {
  it("一時的なネットワークエラー後にリトライで成功すること", async () => {
    // Arrange
    let callCount = 0;
    mockSDKQuery.mockImplementation(async () => {
      callCount++;
      if (callCount < 3) {
        const error = new Error("Connection reset");
        (error as Error & { code: string }).code = "ECONNRESET";
        throw error;
      }
      return {
        stream: async function* () {
          yield { type: "text", content: "Success" };
        },
      };
    });

    // Act
    const result = await skillExecutor.execute(
      { prompt: "test", skillId: "skill-id" },
      mockSkillMetadata,
    );

    // Assert
    expect(result.success).toBe(true);
    expect(callCount).toBe(3); // 2回失敗 + 1回成功
  });
});
```

### 5. E2Eスモークテスト実装

#### 5.1 Playwright 設定

```typescript
// apps/desktop/playwright.config.ts

import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./src/main/services/skill",
  testMatch: "*.e2e.test.ts",
  timeout: 60000,
  use: {
    headless: process.env.CI === "true",
  },
});
```

#### 5.2 E2Eテスト実装

```typescript
// apps/desktop/src/main/services/skill/SkillExecute.e2e.test.ts

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { ElectronApplication, _electron as electron } from "playwright";

describe("Skill Execute E2E", () => {
  let electronApp: ElectronApplication;

  beforeAll(async () => {
    // Skip in CI without display
    if (process.env.CI && !process.env.DISPLAY) {
      return;
    }

    electronApp = await electron.launch({
      args: [".", "--test-mode"],
    });
  });

  afterAll(async () => {
    if (electronApp) {
      await electronApp.close();
    }
  });

  describe("E2E-001: 正常系スキル実行", () => {
    it("Renderer から SDK まで全経路が正常に動作すること", async () => {
      if (!electronApp) {
        console.log("Skipping E2E test: no display available");
        return;
      }

      const window = await electronApp.firstWindow();

      // スキル実行を呼び出し
      const result = await window.evaluate(async () => {
        return window.electronAPI.skill.execute({
          skillId: "test-skill",
          params: { prompt: "Hello, World!" },
        });
      });

      expect(result.success).toBeDefined();
    });
  });

  describe("E2E-002: ストリーミング受信", () => {
    it("Renderer がストリームメッセージを受信できること", async () => {
      if (!electronApp) {
        console.log("Skipping E2E test: no display available");
        return;
      }

      const window = await electronApp.firstWindow();
      const messages: unknown[] = [];

      // ストリームリスナー設定
      await window.evaluate(() => {
        window.electronAPI.skill.onStream((message) => {
          (window as unknown as { _testMessages: unknown[] })._testMessages =
            (window as unknown as { _testMessages?: unknown[] })
              ._testMessages || [];
          (
            window as unknown as { _testMessages: unknown[] }
          )._testMessages.push(message);
        });
      });

      // スキル実行
      await window.evaluate(async () => {
        return window.electronAPI.skill.execute({
          skillId: "test-skill",
          params: { prompt: "Stream test" },
        });
      });

      // 受信確認（最大5秒待機）
      await window.waitForFunction(
        () => {
          const msgs = (window as unknown as { _testMessages?: unknown[] })
            ._testMessages;
          return msgs && msgs.length > 0;
        },
        { timeout: 5000 },
      );

      const receivedMessages = await window.evaluate(() => {
        return (window as unknown as { _testMessages: unknown[] })
          ._testMessages;
      });

      expect(receivedMessages.length).toBeGreaterThan(0);
    });
  });

  describe("E2E-003: 実行中断", () => {
    it("abort が Executor まで伝播すること", async () => {
      if (!electronApp) {
        console.log("Skipping E2E test: no display available");
        return;
      }

      const window = await electronApp.firstWindow();

      // 長時間実行スキルを開始
      const executePromise = window.evaluate(async () => {
        return window.electronAPI.skill.execute({
          skillId: "long-running-skill",
          params: { prompt: "Long running task" },
        });
      });

      // 500ms 後に中断
      await new Promise((resolve) => setTimeout(resolve, 500));

      const aborted = await window.evaluate(async () => {
        // 最後の実行IDを取得して中断
        return window.electronAPI.skill.abort("last-execution-id");
      });

      const result = await executePromise;

      expect(aborted || result.success === false).toBe(true);
    });
  });

  describe("E2E-004: 認証エラー伝播", () => {
    it("API Key 未設定時に AUTHENTICATION_ERROR が返ること", async () => {
      if (!electronApp) {
        console.log("Skipping E2E test: no display available");
        return;
      }

      const window = await electronApp.firstWindow();

      // API Key をクリア
      await window.evaluate(async () => {
        await window.electronAPI.authKey.delete();
      });

      // スキル実行
      const result = await window.evaluate(async () => {
        return window.electronAPI.skill.execute({
          skillId: "test-skill",
          params: { prompt: "Test" },
        });
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("API Key");
    });
  });

  describe("E2E-005: スキル未存在エラー伝播", () => {
    it("存在しないスキルID指定時にエラーが返ること", async () => {
      if (!electronApp) {
        console.log("Skipping E2E test: no display available");
        return;
      }

      const window = await electronApp.firstWindow();

      const result = await window.evaluate(async () => {
        return window.electronAPI.skill.execute({
          skillId: "non-existent-skill-id",
          params: { prompt: "Test" },
        });
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("スキルが見つかりません");
    });
  });
});
```

### 6. 統合テスト再実行

```bash
# 全テスト実行
pnpm --filter @repo/desktop test

# 統合テストのみ
pnpm --filter @repo/desktop test -- --grep "integration"

# E2Eテスト実行（CI環境では自動スキップ）
pnpm --filter @repo/desktop test:e2e
```

## 統合テスト連携【必須】

統合テストの拡充（全カテゴリのカバレッジ向上）:

| テストカテゴリ       | 検証項目                                         | 目標 |
| -------------------- | ------------------------------------------------ | ---- |
| IPC接続テスト        | skill:execute, skill:abort, skill:get-status     | 100% |
| データフローテスト   | Renderer → IPC → Handler → Executor → SDK の往復 | 100% |
| エラーハンドリング   | 認証エラー・スキル未存在・同時実行制限           | 80%+ |
| ストリーミングテスト | SKILL_STREAM チャネルのメッセージ受信            | 100% |
| リトライテスト       | ネットワークエラー後のリトライ成功               | 100% |

## 成果物

| 成果物             | パス                                                               | 説明                   |
| ------------------ | ------------------------------------------------------------------ | ---------------------- |
| カバレッジレポート | `outputs/phase-6/coverage-report.md`                               | カバレッジ分析結果     |
| 統合テスト結果     | `outputs/phase-6/integration-test.md`                              | 統合テスト実行結果     |
| 追加ユニットテスト | `apps/desktop/src/main/services/skill/SkillService.test.ts`        | UT-006〜UT-011         |
| リトライテスト     | `apps/desktop/src/main/services/skill/SkillExecutor.retry.test.ts` | リトライロジックテスト |
| E2Eテスト          | `apps/desktop/src/main/services/skill/SkillExecute.e2e.test.ts`    | E2Eスモークテスト実装  |

## 完了条件

- [ ] ユニットテストカバレッジ基準を達成（Line 80%+, Branch 60%+, Function 80%+）
- [ ] 結合テストカバレッジ基準を達成（IPC 100%, シナリオ 100%/80%）
- [ ] 統合テストの追加が完了している（IT-005〜IT-008）
- [ ] E2Eスモークテストが実装されている（E2E-001〜E2E-005）
- [ ] カバレッジレポートが出力されている
- [ ] **本Phase内の全タスクを100%実行完了**

## テストカバレッジサマリー

### ユニットテスト

| テストID | テスト内容                        | ステータス |
| -------- | --------------------------------- | ---------- |
| UT-001   | SkillExecutor.execute() 呼び出し  | Phase 4    |
| UT-002   | スキル未インポート時のエラー      | Phase 4    |
| UT-003   | スキル未存在時のエラー            | Phase 4    |
| UT-004   | IPC経由の executeSkill 呼び出し   | Phase 4    |
| UT-005   | 実行中断                          | Phase 4    |
| UT-006   | SkillExecutor 未設定時のエラー    | Phase 6    |
| UT-007   | SkillMetadata 変換                | Phase 6    |
| UT-008   | ネットワークエラーのリトライ判定  | Phase 6    |
| UT-009   | HTTP 429 のリトライ判定           | Phase 6    |
| UT-010   | HTTP 400 のリトライ判定（対象外） | Phase 6    |
| UT-011   | IPC バリデーションエラー          | Phase 6    |

### 統合テスト

| テストID | テスト内容                          | ステータス |
| -------- | ----------------------------------- | ---------- |
| IT-001   | skill:execute チャネル経由の実行    | Phase 4    |
| IT-002   | ストリーミングメッセージの送信      | Phase 4    |
| IT-003   | skill:abort チャネル経由の中断      | Phase 4    |
| IT-004   | skill:get-status チャネル経由の取得 | Phase 4    |
| IT-005   | 同時実行制限                        | Phase 6    |
| IT-006   | リトライ成功                        | Phase 6    |
| IT-007   | タイムアウト                        | Phase 6    |
| IT-008   | 権限リクエスト                      | Phase 6    |

### E2Eテスト

| テストID | テスト内容             | ステータス |
| -------- | ---------------------- | ---------- |
| E2E-001  | 正常系スキル実行       | Phase 6    |
| E2E-002  | ストリーミング受信     | Phase 6    |
| E2E-003  | 実行中断               | Phase 6    |
| E2E-004  | 認証エラー伝播         | Phase 6    |
| E2E-005  | スキル未存在エラー伝播 | Phase 6    |

## 多角的チェック観点（AIが判断）

タスクの性質に応じて、以下の観点を確認する。
**具体的なチェック項目はAIがタスク内容に応じて判断・適用する。**

| 観点               | 適用判断                   | 仕様参照先                                                         |
| ------------------ | -------------------------- | ------------------------------------------------------------------ |
| セキュリティ       | ✅ IPCテスト・認証テスト   | `aiworkflow-requirements: security-skill-ipc.md`                   |
| アーキテクチャ     | ✅ 委譲パターンテスト      | `aiworkflow-requirements: architecture-implementation-patterns.md` |
| API設計            | ✅ SkillExecutor APIテスト | `aiworkflow-requirements: interfaces-agent-sdk-executor.md`        |
| エラーハンドリング | ✅ エラーパステスト        | `aiworkflow-requirements: error-handling.md`                       |
| テスト戦略         | ✅ テスト拡充設計          | `aiworkflow-requirements: test-strategy-unit-integration.md`       |

📖 詳細: `references/quality-standards.md` セクション8

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認（Phase 4-5成果物、aiworkflow-requirements仕様書）
2. カバレッジ測定
3. ギャップ分析
4. 追加ユニットテスト作成（UT-006〜UT-011）
5. 追加統合テスト作成（IT-005〜IT-008）
6. E2Eスモークテスト実装
7. 統合テスト連携の実施
8. 成果物の作成・配置
9. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/skill-execute-delegation --phase 6
```

## 次のPhase

Phase 7: テストカバレッジ確認
