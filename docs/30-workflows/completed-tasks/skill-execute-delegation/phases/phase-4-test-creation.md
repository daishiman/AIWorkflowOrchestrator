# Phase 4: テスト作成（TDD: Red）

## メタ情報

| 項目     | 値                                    |
| -------- | ------------------------------------- |
| Phase    | 4                                     |
| 機能名   | skill-execute-delegation              |
| タスクID | TASK-FIX-7-1-EXECUTE-SKILL-DELEGATION |
| 作成日   | 2026-02-10                            |

## 目的

SkillService.executeSkill() から SkillExecutor への委譲実装を検証するテストを、実装より先に作成する（Red状態）。
E2Eスモークテストで全経路（Renderer → Preload → IPC → Handler → SkillExecutor → SDK）を網羅する。

## 実行タスク

- TDD原則適用: テストファースト開発の実践
- ユニットテスト作成: SkillService.executeSkill() のスタブ解消テスト
- 統合テスト作成: skillHandlers.ts と SkillExecutor の連携テスト
- E2Eテスト作成: 全経路のスモークテスト

## 参照資料

### 実装ファイル

| 資料名         | パス                                                    | 説明                   |
| -------------- | ------------------------------------------------------- | ---------------------- |
| SkillService   | `apps/desktop/src/main/services/skill/SkillService.ts`  | 現行スタブ実装         |
| SkillExecutor  | `apps/desktop/src/main/services/skill/SkillExecutor.ts` | SDK連携実装（委譲先）  |
| skillHandlers  | `apps/desktop/src/main/ipc/skillHandlers.ts`            | IPCハンドラー実装      |
| IPC Channels   | `apps/desktop/src/preload/channels.ts`                  | チャネル定義           |
| SKILL_CHANNELS | `packages/shared/src/ipc/channels.ts`                   | スキル専用チャネル定義 |

### システム仕様書（aiworkflow-requirements）【必須参照】

| 資料名                            | パス                                                                                  | 説明                                           |
| --------------------------------- | ------------------------------------------------------------------------------------- | ---------------------------------------------- |
| interfaces-agent-sdk-executor.md  | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-executor.md`  | SkillExecutor完全仕様（型定義・API・リトライ） |
| security-skill-ipc.md             | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`             | IPC通信セキュリティ（safeInvoke/safeOn）       |
| test-strategy-unit-integration.md | `.claude/skills/aiworkflow-requirements/references/test-strategy-unit-integration.md` | テスト戦略                                     |
| error-handling.md                 | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                 | エラーカテゴリ（1000-5999）・ログサニタイズ    |

### テストで検証すべき型定義

> **参照**: `interfaces-agent-sdk-executor.md`

#### SkillStreamMessageType（5種類）

| 値         | 説明               | テスト優先度 |
| ---------- | ------------------ | ------------ |
| `text`     | テキストメッセージ | P0           |
| `tool_use` | ツール使用         | P1           |
| `error`    | エラーメッセージ   | P0           |
| `complete` | 完了通知           | P0           |
| `retry`    | リトライ通知       | P1           |

#### ExecutionState

| 値          | 説明         | テスト優先度 |
| ----------- | ------------ | ------------ |
| `pending`   | 実行待ち     | P0           |
| `running`   | 実行中       | P0           |
| `completed` | 完了         | P0           |
| `aborted`   | ユーザー中断 | P0           |
| `error`     | エラー発生   | P0           |

#### SkillExecutionErrorCode（5種類）

| コード                    | 説明           | テスト優先度 |
| ------------------------- | -------------- | ------------ |
| `AUTHENTICATION_ERROR`    | 認証エラー     | P0           |
| `EXECUTION_FAILED`        | 実行失敗       | P0           |
| `TIMEOUT`                 | タイムアウト   | P1           |
| `ABORTED`                 | ユーザー中断   | P0           |
| `MAX_CONCURRENT_EXCEEDED` | 同時実行数超過 | P1           |

#### IPCチャンネル（テスト対象）

| チャンネル         | 定数                            | テスト優先度 |
| ------------------ | ------------------------------- | ------------ |
| `skill:execute`    | `IPC_CHANNELS.SKILL_EXECUTE`    | P0           |
| `skill:stream`     | `SKILL_CHANNELS.SKILL_STREAM`   | P0           |
| `skill:abort`      | `IPC_CHANNELS.SKILL_ABORT`      | P0           |
| `skill:get-status` | `IPC_CHANNELS.SKILL_GET_STATUS` | P1           |

#### safeInvoke/safeOn パターン検証

| 検証項目            | 検証内容                                         | 参照                    |
| ------------------- | ------------------------------------------------ | ----------------------- |
| `safeInvoke` 使用   | PreloadからのipcRenderer.invoke呼び出しがsafe    | `security-skill-ipc.md` |
| `safeOn` 使用       | PreloadからのipcRenderer.on呼び出しがsafe        | `security-skill-ipc.md` |
| チャネル名定数使用  | ハードコード文字列ではなくIPC_CHANNELS定数を使用 | `security-skill-ipc.md` |
| `validateIpcSender` | ハンドラーで送信元検証を実施                     | `security-skill-ipc.md` |

## 実行手順

### 1. テストシナリオ設計

受け入れ基準からテストシナリオを導出する。

#### 1.1 ユニットテストシナリオ

| シナリオID | テスト対象                    | 検証内容                                   |
| ---------- | ----------------------------- | ------------------------------------------ |
| UT-001     | SkillService.executeSkill     | SkillExecutor.execute() が呼び出されること |
| UT-002     | SkillService.executeSkill     | スキル未インポート時のエラー処理           |
| UT-003     | SkillService.executeSkill     | スキル未存在時のエラー処理                 |
| UT-004     | skillHandlers (SKILL_EXECUTE) | IPC経由でexecuteSkillが呼び出されること    |
| UT-005     | SkillExecutor.abort           | 実行中断が正常に動作すること               |

#### 1.2 統合テストシナリオ

| シナリオID | テスト対象                       | 検証内容                                |
| ---------- | -------------------------------- | --------------------------------------- |
| IT-001     | IPC → Handler → SkillService     | skill:execute チャネル経由の実行        |
| IT-002     | IPC → Handler → SkillExecutor    | ストリーミングメッセージの送信          |
| IT-003     | IPC → Handler (SKILL_ABORT)      | skill:abort チャネル経由の中断          |
| IT-004     | IPC → Handler (SKILL_GET_STATUS) | skill:get-status チャネル経由の状態取得 |

#### 1.3 E2Eスモークテストシナリオ

| シナリオID | テスト対象         | 検証内容                                           |
| ---------- | ------------------ | -------------------------------------------------- |
| E2E-001    | 正常系: スキル実行 | Renderer → IPC → Handler → Executor → SDK → Stream |
| E2E-002    | ストリーミング受信 | Renderer がストリームメッセージを受信できること    |
| E2E-003    | 実行中断           | abort が Executor まで伝播し、実行が停止すること   |
| E2E-004    | 認証エラー         | API Key 未設定時の AUTHENTICATION_ERROR 伝播       |
| E2E-005    | スキル未存在エラー | 存在しないスキルID指定時のエラー伝播               |

### 2. ユニットテスト作成

#### 2.1 SkillService.executeSkill() テスト

```typescript
// apps/desktop/src/main/services/skill/SkillService.test.ts

import { describe, it, expect, vi, beforeEach } from "vitest";
import { SkillService } from "./SkillService";
import { SkillExecutor } from "./SkillExecutor";
import type { BrowserWindow } from "electron";

describe("SkillService.executeSkill", () => {
  let skillService: SkillService;
  let mockSkillExecutor: SkillExecutor;
  let mockMainWindow: BrowserWindow;

  beforeEach(() => {
    // モックの設定
    mockMainWindow = {
      isDestroyed: vi.fn().mockReturnValue(false),
      webContents: { send: vi.fn() },
    } as unknown as BrowserWindow;

    mockSkillExecutor = new SkillExecutor(mockMainWindow);
    vi.spyOn(mockSkillExecutor, "execute").mockResolvedValue({
      executionId: "test-exec-id",
      success: true,
    });

    // SkillService のインスタンス作成
    // TODO: DI でSkillExecutor を注入できるようにする
  });

  it("UT-001: SkillExecutor.execute() が呼び出されること", async () => {
    // Arrange
    const skillId = "test-skill-id";
    const params = { prompt: "Test prompt" };

    // Act
    const result = await skillService.executeSkill(skillId, params);

    // Assert
    expect(mockSkillExecutor.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        prompt: "Test prompt",
        skillId: "test-skill-id",
      }),
      expect.any(Object), // skill metadata
    );
    expect(result.status).toBe("success");
  });

  it("UT-002: スキル未インポート時にエラーを返すこと", async () => {
    // Arrange
    const skillId = "not-imported-skill-id";

    // Act & Assert
    await expect(skillService.executeSkill(skillId)).rejects.toThrow(
      "スキルがインポートされていません",
    );
  });

  it("UT-003: スキル未存在時にエラーを返すこと", async () => {
    // Arrange
    const skillId = "non-existent-skill-id";

    // Act & Assert
    await expect(skillService.executeSkill(skillId)).rejects.toThrow(
      "スキルが見つかりません",
    );
  });
});
```

#### 2.2 skillHandlers テスト

```typescript
// apps/desktop/src/main/ipc/skillHandlers.test.ts

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ipcMain, BrowserWindow } from "electron";
import {
  registerSkillHandlers,
  unregisterSkillHandlers,
} from "./skillHandlers";
import { IPC_CHANNELS } from "../../preload/channels";
import { SkillService } from "../services/skill/SkillService";

describe("skillHandlers", () => {
  let mockMainWindow: BrowserWindow;
  let mockSkillService: SkillService;
  let handlers: Map<string, Function>;

  beforeEach(() => {
    handlers = new Map();

    vi.spyOn(ipcMain, "handle").mockImplementation((channel, handler) => {
      handlers.set(channel, handler);
    });

    vi.spyOn(ipcMain, "removeHandler").mockImplementation((channel) => {
      handlers.delete(channel);
    });

    mockMainWindow = {
      isDestroyed: vi.fn().mockReturnValue(false),
      webContents: {
        send: vi.fn(),
        id: 1,
      },
      id: 1,
    } as unknown as BrowserWindow;

    mockSkillService = {
      executeSkill: vi.fn(),
      getSkillById: vi.fn(),
      // ... other methods
    } as unknown as SkillService;

    registerSkillHandlers(mockMainWindow, mockSkillService);
  });

  afterEach(() => {
    unregisterSkillHandlers();
  });

  describe("SKILL_EXECUTE handler", () => {
    it("UT-004: IPC経由でexecuteSkillが呼び出されること", async () => {
      // Arrange
      const handler = handlers.get(IPC_CHANNELS.SKILL_EXECUTE);
      const mockEvent = {
        sender: mockMainWindow.webContents,
        senderFrame: { url: "app://localhost" },
      };
      const args = { skillId: "test-skill", params: {} };

      mockSkillService.executeSkill.mockResolvedValue({
        executionId: "exec-id",
        status: "success",
        output: "result",
        startedAt: new Date(),
        completedAt: new Date(),
      });

      // Act
      const result = await handler(mockEvent, args);

      // Assert
      expect(mockSkillService.executeSkill).toHaveBeenCalledWith(
        "test-skill",
        {},
      );
      expect(result.success).toBe(true);
    });
  });

  describe("SKILL_ABORT handler", () => {
    it("UT-005: 実行中断が正常に動作すること", async () => {
      // Arrange
      const handler = handlers.get(IPC_CHANNELS.SKILL_ABORT);
      const mockEvent = {
        sender: mockMainWindow.webContents,
        senderFrame: { url: "app://localhost" },
      };
      const executionId = "exec-id-to-abort";

      // Act
      const result = await handler(mockEvent, executionId);

      // Assert
      expect(typeof result).toBe("boolean");
    });
  });
});
```

### 3. 統合テスト作成

```typescript
// apps/desktop/src/main/services/skill/SkillService.integration.test.ts

import { describe, it, expect, vi, beforeEach } from "vitest";
import { SkillService } from "./SkillService";
import { SkillExecutor } from "./SkillExecutor";
import { SkillScanner } from "./SkillScanner";
import { SkillParser } from "./SkillParser";
import { SkillImportManager } from "./SkillImportManager";
import type { BrowserWindow } from "electron";

describe("SkillService Integration", () => {
  let skillService: SkillService;
  let skillExecutor: SkillExecutor;
  let mockMainWindow: BrowserWindow;

  beforeEach(() => {
    mockMainWindow = {
      isDestroyed: vi.fn().mockReturnValue(false),
      webContents: {
        send: vi.fn(),
        id: 1,
      },
    } as unknown as BrowserWindow;

    const scanner = new SkillScanner("/test/skills");
    const parser = new SkillParser();
    const importManager = new SkillImportManager();

    skillService = new SkillService(scanner, parser, importManager);
    skillExecutor = new SkillExecutor(mockMainWindow);
  });

  describe("IT-001: skill:execute チャネル経由の実行", () => {
    it("スキル実行結果が正常に返されること", async () => {
      // Arrange
      const skillId = "test-skill";

      // Act
      // TODO: 実装後に有効化

      // Assert
      // expect(result).toBeDefined();
    });
  });

  describe("IT-002: ストリーミングメッセージの送信", () => {
    it("実行中にストリームメッセージが送信されること", async () => {
      // Arrange
      const skillId = "test-skill";

      // Act
      // TODO: 実装後に有効化

      // Assert
      // expect(mockMainWindow.webContents.send).toHaveBeenCalledWith(
      //   'skill:stream',
      //   expect.any(Object)
      // );
    });
  });
});
```

### 4. E2Eスモークテスト作成

```typescript
// apps/desktop/src/main/services/skill/SkillExecute.e2e.test.ts

import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * E2E スモークテスト
 *
 * 注意: このテストは実際のElectron環境で実行する必要がある
 * CI環境では --skip-e2e フラグでスキップ可能
 */
describe("Skill Execute E2E", () => {
  describe("E2E-001: 正常系スキル実行", () => {
    it.skip("Renderer から SDK まで全経路が正常に動作すること", async () => {
      // この テストは Playwright/Spectron で実装
      // Renderer → IPC → Handler → Executor → SDK → Stream
    });
  });

  describe("E2E-002: ストリーミング受信", () => {
    it.skip("Renderer がストリームメッセージを受信できること", async () => {
      // ストリームイベントの受信を検証
    });
  });

  describe("E2E-003: 実行中断", () => {
    it.skip("abort が Executor まで伝播すること", async () => {
      // 中断フローの検証
    });
  });

  describe("E2E-004: 認証エラー伝播", () => {
    it.skip("API Key 未設定時に AUTHENTICATION_ERROR が返ること", async () => {
      // 認証エラーハンドリングの検証
    });
  });

  describe("E2E-005: スキル未存在エラー伝播", () => {
    it.skip("存在しないスキルID指定時にエラーが返ること", async () => {
      // スキル未存在エラーの検証
    });
  });
});
```

## 統合テスト連携【必須】

統合テストシナリオを全カテゴリで設計する:

| シナリオカテゴリ     | 検証内容                                         | テストファイル                     |
| -------------------- | ------------------------------------------------ | ---------------------------------- |
| IPC接続テスト        | skill:execute チャネルの疎通確認                 | `skillHandlers.test.ts`            |
| データフローテスト   | Renderer → IPC → Handler → Executor → SDK の往復 | `SkillService.integration.test.ts` |
| エラーハンドリング   | 認証エラー・スキル未存在時のエラー伝播           | `SkillService.test.ts`             |
| ストリーミングテスト | SKILL_STREAM チャネルのメッセージ受信            | `SkillExecute.e2e.test.ts`         |
| 中断テスト           | skill:abort チャネル経由の中断処理               | `skillHandlers.test.ts`            |

## アーキテクチャ層別テスト

| 層           | テスト観点                             | テストファイル配置                                |
| ------------ | -------------------------------------- | ------------------------------------------------- |
| Main Process | SkillService, SkillExecutor のロジック | `apps/desktop/src/main/services/skill/*.test.ts`  |
| IPC通信      | skillHandlers のチャネルハンドリング   | `apps/desktop/src/main/ipc/skillHandlers.test.ts` |

## 成果物

| 成果物              | パス                                                            | 説明                 |
| ------------------- | --------------------------------------------------------------- | -------------------- |
| テスト仕様書        | `outputs/phase-4/test-specification.md`                         | テスト設計           |
| ユニットテスト      | `apps/desktop/src/main/services/skill/SkillService.test.ts`     | SkillService テスト  |
| IPCハンドラーテスト | `apps/desktop/src/main/ipc/skillHandlers.test.ts`               | skillHandlers テスト |
| 統合テスト          | `apps/desktop/src/main/services/skill/*.integration.test.ts`    | 統合テスト           |
| E2Eテスト           | `apps/desktop/src/main/services/skill/SkillExecute.e2e.test.ts` | E2Eスモークテスト    |

## 完了条件

- [ ] 受け入れ基準ごとにユニットテストがある（UT-001〜UT-005）
- [ ] 統合テストシナリオが全カテゴリで定義されている（IT-001〜IT-004）
- [ ] E2Eスモークテストシナリオが定義されている（E2E-001〜E2E-005）
- [ ] すべてのテストが失敗状態（Red）
- [ ] テストカバレッジ目標が設定されている（Line 80%+, Branch 60%+）
- [ ] **本Phase内の全タスクを100%実行完了**

## TDD検証

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test

# 確認項目
# - [ ] テストが失敗することを確認（Red状態）
```

## 多角的チェック観点（AIが判断）

タスクの性質に応じて、以下の観点を確認する。
**具体的なチェック項目はAIがタスク内容に応じて判断・適用する。**

| 観点               | 適用判断                          | 仕様参照先                                                                                   |
| ------------------ | --------------------------------- | -------------------------------------------------------------------------------------------- |
| セキュリティ       | ✅ IPC通信・認証が関係する        | `aiworkflow-requirements: security-skill-ipc.md`, `security-skill-execution.md`              |
| アーキテクチャ     | ✅ SkillExecutor委譲設計の変更    | `aiworkflow-requirements: architecture-implementation-patterns.md`                           |
| API設計            | ✅ skill:execute IPC API変更      | `aiworkflow-requirements: interfaces-agent-sdk-executor.md`, `interfaces-agent-sdk-skill.md` |
| エラーハンドリング | ✅ 例外処理・エラーコード設計     | `aiworkflow-requirements: error-handling.md`                                                 |
| データ整合性       | - DB操作なし                      | -                                                                                            |
| UI/UX              | - フロントエンド変更なし          | -                                                                                            |
| パフォーマンス     | - リトライ設計は既存SkillExecutor | -                                                                                            |
| アクセシビリティ   | - UI実装なし                      | -                                                                                            |

**Electronデスクトップアプリ観点**（本プロジェクト固有）:

| 層                         | 適用判断                      | 仕様参照先                                                         |
| -------------------------- | ----------------------------- | ------------------------------------------------------------------ |
| フロントエンド（Renderer） | - 変更なし                    | -                                                                  |
| バックエンド（Main）       | ✅ SkillService/SkillExecutor | `aiworkflow-requirements: architecture-implementation-patterns.md` |
| IPC通信                    | ✅ skill:execute ハンドラー   | `aiworkflow-requirements: security-skill-ipc.md`                   |
| Preload/セキュリティ       | - 変更なし                    | -                                                                  |
| ローカルストレージ         | - データ永続化なし            | -                                                                  |

📖 詳細: `references/quality-standards.md` セクション8

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認（Phase 1-3成果物、aiworkflow-requirements仕様書）
2. テストシナリオ設計（UT-001〜UT-005、IT-001〜IT-004、E2E-001〜E2E-005）
3. ユニットテスト作成（SkillService.executeSkill、skillHandlers）
4. 統合テスト作成（IPC経路、ストリーミング、中断）
5. E2Eスモークテスト作成
6. 統合テスト連携の実施
7. 成果物の作成・配置
8. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/skill-execute-delegation --phase 4
```

## 次のPhase

Phase 5: 実装（TDD: Green）
