# Phase 5: 実装（TDD: Green）

## メタ情報

| 項目     | 値                                    |
| -------- | ------------------------------------- |
| Phase    | 5                                     |
| 機能名   | skill-execute-delegation              |
| タスクID | TASK-FIX-7-1-EXECUTE-SKILL-DELEGATION |
| 作成日   | 2026-02-10                            |

## 目的

Phase 4 で作成したテストを通すための最小限の実装を行う。
SkillService.executeSkill() のスタブを解消し、SkillExecutor に委譲する。

## 実行タスク

- SkillService リファクタリング: executeSkill() のスタブ削除と SkillExecutor 委譲
- skillHandlers 修正: SkillExecutor.execute() を直接呼び出すよう変更
- エラーハンドリング: 適切なエラー処理の実装
- 型安全性確保: TypeScript の型システム活用

## 参照資料

### Phase成果物・実装ファイル

| 資料名               | パス                                                    | 説明           |
| -------------------- | ------------------------------------------------------- | -------------- |
| Phase 4 テスト仕様書 | `outputs/phase-4/test-specification.md`                 | Phase 4 成果物 |
| SkillService         | `apps/desktop/src/main/services/skill/SkillService.ts`  | 現行スタブ実装 |
| SkillExecutor        | `apps/desktop/src/main/services/skill/SkillExecutor.ts` | SDK連携実装    |
| skillHandlers        | `apps/desktop/src/main/ipc/skillHandlers.ts`            | IPCハンドラー  |
| IPC Channels         | `apps/desktop/src/preload/channels.ts`                  | チャネル定義   |

### システム仕様書（aiworkflow-requirements）【必須参照】

| 資料名                                  | パス                                                                                        | 説明                                           |
| --------------------------------------- | ------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| interfaces-agent-sdk-executor.md        | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-executor.md`        | SkillExecutor完全仕様（型定義・API・リトライ） |
| security-skill-ipc.md                   | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`                   | IPC通信セキュリティ（safeInvoke/safeOn）       |
| error-handling.md                       | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | エラーハンドリング仕様                         |
| architecture-implementation-patterns.md | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | 実装パターン                                   |

### 実装チェックリスト（セキュリティ）

> 実装時に以下を必ず確認すること（security-skill-ipc.md準拠）

- [ ] IPCチャネル名はハードコード文字列ではなく `IPC_CHANNELS` 定数を使用
- [ ] `validateIpcSender()` による送信元検証を維持
- [ ] エラーメッセージに内部情報を含めない（サニタイズ）

## 実行手順

### 1. SkillService.executeSkill() のリファクタリング

#### 1.1 現行のスタブ実装（削除対象）

```typescript
// 現行実装 - スタブ（削除対象）
async executeSkill(
  skillId: string,
  _params?: Record<string, unknown>,
): Promise<SkillRunResult> {
  const executionId = randomUUID();
  const startedAt = new Date();

  // スキルの存在確認
  const skill = await this.getSkillById(skillId);
  if (!skill) {
    throw new Error("スキルが見つかりません");
  }

  // インポート状態確認
  if (!this.importManager.isImported(skillId)) {
    throw new Error("スキルがインポートされていません");
  }

  try {
    // 初期実装: 成功結果を返す（スタブ）
    // 将来的にはスキルの実際の実行ロジックを実装
    const output = `Skill "${skill.name}" executed successfully`;

    return {
      executionId,
      status: "success",
      output,
      startedAt,
      completedAt: new Date(),
    };
  } catch (error) {
    return {
      executionId,
      status: "failed",
      error: error instanceof Error ? error.message : "実行に失敗しました",
      startedAt,
      completedAt: new Date(),
    };
  }
}
```

#### 1.2 新規実装（SkillExecutor 委譲）

SkillService に SkillExecutor を DI で注入し、executeSkill() を委譲する。

```typescript
// apps/desktop/src/main/services/skill/SkillService.ts

import type { BrowserWindow } from "electron";
import type {
  Skill,
  SkillScanResult,
  SkillScanError,
  ImportResult,
  RemoveResult,
  ImportedSkill,
} from "@repo/shared";
import log from "electron-log";
import { SkillScanner } from "./SkillScanner";
import { SkillParser } from "./SkillParser";
import { SkillImportManager } from "./SkillImportManager";
import {
  SkillExecutor,
  type SkillExecutionRequest,
  type SkillExecutionResponse,
  type SkillMetadata,
} from "./SkillExecutor";

export class SkillService {
  private cache: Map<string, Skill> = new Map();
  private lastScanTime: Date | null = null;
  private skillExecutor: SkillExecutor | null = null;

  constructor(
    private scanner: SkillScanner,
    private parser: SkillParser,
    private importManager: SkillImportManager,
  ) {}

  /**
   * SkillExecutor を設定する（DI）
   * skillHandlers.ts から registerSkillHandlers() 時に呼び出される
   */
  setSkillExecutor(executor: SkillExecutor): void {
    this.skillExecutor = executor;
  }

  /**
   * スキルを実行する
   *
   * TASK-FIX-7-1: スタブ削除、SkillExecutor に委譲
   */
  async executeSkill(
    skillId: string,
    params?: Record<string, unknown>,
  ): Promise<SkillExecutionResponse> {
    // SkillExecutor の存在確認
    if (!this.skillExecutor) {
      throw new Error("SkillExecutor が初期化されていません");
    }

    // スキルの存在確認
    const skill = await this.getSkillById(skillId);
    if (!skill) {
      throw new Error("スキルが見つかりません");
    }

    // インポート状態確認
    if (!this.importManager.isImported(skillId)) {
      throw new Error("スキルがインポートされていません");
    }

    // SkillMetadata に変換
    const skillMetadata: SkillMetadata = {
      id: skill.id,
      name: skill.name,
      slug: skill.slug,
      description: skill.description,
      path: skill.path,
      triggers: skill.triggers,
      anchors: skill.anchors,
      allowedTools: skill.allowedTools,
    };

    // 実行リクエスト作成
    const request: SkillExecutionRequest = {
      prompt: (params?.prompt as string) || "",
      skillId,
      timeout: params?.timeout as number | undefined,
      sessionId: params?.sessionId as string | undefined,
      retryConfig: params?.retryConfig as Partial<{
        maxRetries: number;
        baseDelayMs: number;
        maxDelayMs: number;
        jitterFactor: number;
        backoffMultiplier: number;
      }>,
    };

    // SkillExecutor に委譲
    return this.skillExecutor.execute(request, skillMetadata);
  }

  // ... 他のメソッドは変更なし
}
```

### 2. skillHandlers.ts の修正

#### 2.1 SkillExecutor インスタンス管理の改善

```typescript
// apps/desktop/src/main/ipc/skillHandlers.ts

import { ipcMain, IpcMainInvokeEvent, BrowserWindow } from "electron";
import log from "electron-log";
import { IPC_CHANNELS } from "../../preload/channels";
import { SkillService } from "../services/skill/SkillService";
import { SkillExecutor } from "../services/skill/SkillExecutor";
// ... other imports

// Module-level SkillExecutor instance
let _skillExecutorInstance: SkillExecutor | null = null;

export function registerSkillHandlers(
  mainWindow: BrowserWindow,
  skillService: SkillService,
): void {
  // SkillExecutor インスタンス初期化
  _skillExecutorInstance = new SkillExecutor(mainWindow);

  // TASK-FIX-7-1: SkillService に SkillExecutor を注入
  skillService.setSkillExecutor(_skillExecutorInstance);

  // ... 既存のハンドラー登録

  // skill:execute - スキルを実行
  // TASK-FIX-7-1: SkillExecutor 経由で実行
  ipcMain.handle(
    IPC_CHANNELS.SKILL_EXECUTE,
    async (
      event: IpcMainInvokeEvent,
      args: { skillId: string; params?: Record<string, unknown> },
    ) => {
      const validation = validateIpcSender(event, IPC_CHANNELS.SKILL_EXECUTE, {
        getAllowedWindows: () => [mainWindow],
      });
      if (!validation.valid) {
        throw toIPCValidationError(validation);
      }
      if (typeof args?.skillId !== "string" || args.skillId === "") {
        return { success: false, error: "skillId must be a string" };
      }
      try {
        // TASK-FIX-7-1: SkillService.executeSkill() 経由で SkillExecutor に委譲
        const result = await skillService.executeSkill(
          args.skillId,
          args.params,
        );
        return { success: true, data: result };
      } catch (error) {
        log.error("[skillHandlers] skill:execute failed:", error);
        return {
          success: false,
          error:
            error instanceof Error ? error.message : "スキル実行に失敗しました",
        };
      }
    },
  );

  // ... 他のハンドラー
}
```

### 3. エラーハンドリングの実装

#### 3.1 エラー変換ユーティリティ

```typescript
// apps/desktop/src/main/services/skill/errors.ts に追加

import type { SkillExecutionError } from "./SkillExecutor";

/**
 * 一般的なエラーを SkillExecutionError に変換する
 */
export function toSkillExecutionError(error: unknown): SkillExecutionError {
  if (error instanceof Error) {
    // 認証エラー
    if (
      error.message.includes("API Key") ||
      error.message.includes("AUTHENTICATION")
    ) {
      return {
        code: "AUTHENTICATION_ERROR",
        message: error.message,
      };
    }

    // スキル未存在エラー
    if (error.message.includes("スキルが見つかりません")) {
      return {
        code: "SKILL_NOT_FOUND",
        message: error.message,
      };
    }

    // バリデーションエラー
    if (error.message.includes("インポートされていません")) {
      return {
        code: "VALIDATION_FAILED",
        message: error.message,
      };
    }

    // 一般エラー
    return {
      code: "EXECUTION_FAILED",
      message: error.message,
      details: { stack: error.stack },
    };
  }

  return {
    code: "EXECUTION_FAILED",
    message: "Unknown error occurred",
    details: error,
  };
}
```

### 4. 型定義の整理

#### 4.1 SkillRunResult と SkillExecutionResponse の統一

```typescript
// packages/shared/src/types/skill.ts に追加

/**
 * スキル実行結果（SkillRunResult の代替）
 * TASK-FIX-7-1: SkillExecutionResponse と互換性を持たせる
 */
export interface SkillRunResult {
  executionId: string;
  status: "success" | "failed" | "running" | "aborted";
  output?: string;
  error?: string;
  startedAt: Date;
  completedAt?: Date;
}

/**
 * SkillExecutionResponse から SkillRunResult への変換
 */
export function toSkillRunResult(
  response: {
    executionId: string;
    success: boolean;
    error?: { code: string; message: string };
  },
  startedAt: Date,
): SkillRunResult {
  return {
    executionId: response.executionId,
    status: response.success ? "success" : "failed",
    error: response.error?.message,
    startedAt,
    completedAt: new Date(),
  };
}
```

## 統合テスト連携【必須】

フロント/バック接続の実装とテスト支援コード整備:

### 実装項目

| 実装項目           | 内容                                                         |
| ------------------ | ------------------------------------------------------------ |
| IPC接続            | skill:execute → skillHandlers → SkillService → SkillExecutor |
| エラーハンドリング | 認証エラー・スキル未存在エラーの適切な伝播                   |
| ストリーミング     | SKILL_STREAM チャネル経由のストリームメッセージ送信          |

### データフロー設計

```
Renderer (useSkillExecution)
    ↓ window.electronAPI.skill.execute({ skillId, params })
Preload (safeInvoke)
    ↓ IPC_CHANNELS.SKILL_EXECUTE
Main Process (skillHandlers.ts)
    ↓ validateIpcSender() → SkillService.getSkillById()
SkillService
    ↓ executeSkill() → SkillExecutor.execute()
SkillExecutor
    ↓ SDK query() + AbortController
Claude SDK
    ↓ for await (message of stream)
    ↓ mainWindow.webContents.send(SKILL_STREAM, message)
Renderer (onSkillStream callback)
```

### API契約定義

| 統合ポイント            | リクエスト型                                                | レスポンス型                                                 |
| ----------------------- | ----------------------------------------------------------- | ------------------------------------------------------------ |
| Renderer → IPC          | `{ skillId: string, params?: Record<string, unknown> }`     | `{ success: boolean, data?: any, error?: string }`           |
| IPC → SkillService      | `(skillId: string, params?: Record<string, unknown>)`       | `Promise<SkillExecutionResponse>`                            |
| SkillService → Executor | `(request: SkillExecutionRequest, metadata: SkillMetadata)` | `Promise<SkillExecutionResponse>`                            |
| Executor → Renderer     | SKILL_STREAM チャネル                                       | `SkillStreamMessage` (text \| tool_use \| error \| complete) |

### 認証連携

| 項目           | 実装内容                                                          |
| -------------- | ----------------------------------------------------------------- |
| API Key取得    | AuthKeyService.getKey('anthropic') → SkillExecutor コンストラクタ |
| 認証エラー検出 | SDK query() で AUTHENTICATION_ERROR → SkillExecutionError 変換    |
| エラー伝播     | SKILL_STREAM (type: 'error') → Renderer                           |

### AuthKeyService DI（TASK-FIX-16-1）

> **参照**: `aiworkflow-requirements/references/interfaces-agent-sdk-executor.md`

#### IAuthKeyService インターフェース

| メソッド      | シグネチャ                                           | 説明                                    |
| ------------- | ---------------------------------------------------- | --------------------------------------- |
| `setKey`      | `(apiKey: string) => Promise<void>`                  | キーを暗号化して保存                    |
| `getKey`      | `() => Promise<string \| null>`                      | キーを復号して取得（Main Process のみ） |
| `deleteKey`   | `() => Promise<void>`                                | キーを削除                              |
| `hasKey`      | `() => Promise<boolean>`                             | キー存在確認                            |
| `validateKey` | `(key?: string) => Promise<AuthKeyValidationResult>` | Anthropic API でキーを検証              |

#### SkillExecutor コンストラクタ

| パラメータ        | 型                 | 必須 | 説明                       |
| ----------------- | ------------------ | ---- | -------------------------- |
| `mainWindow`      | `BrowserWindow`    | ✓    | メインウィンドウ           |
| `permissionStore` | `IPermissionStore` | -    | 権限永続化ストア           |
| `authKeyService`  | `IAuthKeyService`  | -    | 認証キー管理サービス（DI） |

#### キー取得フロー

1. `authKeyService.getKey()` を呼び出し
2. キーが取得できた場合 → SDK に渡す
3. キーが null の場合 → `process.env.ANTHROPIC_API_KEY` をフォールバック
4. 環境変数も未設定の場合 → `AUTHENTICATION_ERROR` をスロー

### エラーハンドリング

> **参照**: `aiworkflow-requirements/references/error-handling.md`

#### エラーカテゴリとコード範囲

| カテゴリ               | コード範囲 | 本タスクでの適用                           | リトライ |
| ---------------------- | ---------- | ------------------------------------------ | -------- |
| Validation Error       | 1000-1999  | skillId未指定、スキル未インポート          | 不可     |
| Business Error         | 2000-2999  | スキル未存在、SkillExecutor未初期化        | 不可     |
| External Service Error | 3000-3999  | SDK認証エラー、SDK実行エラー、タイムアウト | **可能** |
| Infrastructure Error   | 4000-4999  | -                                          | **可能** |
| Internal Error         | 5000-5999  | 予期せぬエラー                             | 不可     |

#### ログサニタイズ要件

| 項目                 | 方針                                               |
| -------------------- | -------------------------------------------------- |
| APIキー              | ログ出力禁止（`[REDACTED]` に置換）                |
| ユーザー入力(prompt) | 最初の50文字のみログ出力                           |
| スタック情報         | 本番環境ではユーザー向けエラーに含めない           |
| エラーメッセージ     | 内部詳細を含めない（サニタイズ後に Renderer 送信） |

## アーキテクチャ層別実装

| 層           | 実装観点                                | 実装ファイル配置                             |
| ------------ | --------------------------------------- | -------------------------------------------- |
| Main Process | SkillService, SkillExecutor 連携        | `apps/desktop/src/main/services/skill/`      |
| IPC通信      | skillHandlers の SkillExecutor 呼び出し | `apps/desktop/src/main/ipc/skillHandlers.ts` |

## 成果物

| 成果物                  | パス                                                   | 説明                     |
| ----------------------- | ------------------------------------------------------ | ------------------------ |
| SkillService（修正版）  | `apps/desktop/src/main/services/skill/SkillService.ts` | スタブ削除・委譲実装     |
| skillHandlers（修正版） | `apps/desktop/src/main/ipc/skillHandlers.ts`           | SkillExecutor 統合       |
| エラーユーティリティ    | `apps/desktop/src/main/services/skill/errors.ts`       | エラー変換ユーティリティ |

## 完了条件

- [ ] SkillService.executeSkill() のスタブが削除されている
- [ ] SkillService.executeSkill() が SkillExecutor.execute() に委譲している
- [ ] skillHandlers の skill:execute ハンドラーが正常に動作する
- [ ] すべてのテストが成功状態（Green）
- [ ] 実装が最小限に抑えられている
- [ ] アーキテクチャ層別の実装が適切に配置されている
- [ ] **本Phase内の全タスクを100%実行完了**

## TDD検証

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test

# 確認項目
# - [ ] Phase 4 で作成したテストが成功することを確認（Green状態）
# - [ ] UT-001〜UT-005 が全て PASS
# - [ ] IT-001〜IT-004 が全て PASS
```

## 実装チェックリスト

### SkillService 変更点

- [ ] `setSkillExecutor(executor: SkillExecutor)` メソッド追加
- [ ] `executeSkill()` のスタブコード削除
- [ ] `executeSkill()` が SkillExecutor.execute() を呼び出す
- [ ] `SkillMetadata` への変換ロジック実装
- [ ] `SkillExecutionRequest` の構築ロジック実装

### skillHandlers 変更点

- [ ] SkillExecutor インスタンス作成後に `skillService.setSkillExecutor()` 呼び出し
- [ ] skill:execute ハンドラーのエラーハンドリング改善

### エラーハンドリング

- [ ] 認証エラー（AUTHENTICATION_ERROR）の適切な伝播
- [ ] スキル未存在エラー（SKILL_NOT_FOUND）の適切な伝播
- [ ] インポート未完了エラー（VALIDATION_FAILED）の適切な伝播

## 多角的チェック観点（AIが判断）

タスクの性質に応じて、以下の観点を確認する。
**具体的なチェック項目はAIがタスク内容に応じて判断・適用する。**

| 観点               | 適用判断                           | 仕様参照先                                                         |
| ------------------ | ---------------------------------- | ------------------------------------------------------------------ |
| セキュリティ       | ✅ IPC送信元検証・エラーサニタイズ | `aiworkflow-requirements: security-skill-ipc.md`                   |
| アーキテクチャ     | ✅ SkillExecutor委譲パターン       | `aiworkflow-requirements: architecture-implementation-patterns.md` |
| API設計            | ✅ SkillExecutionRequest/Response  | `aiworkflow-requirements: interfaces-agent-sdk-executor.md`        |
| エラーハンドリング | ✅ エラーカテゴリ・ログサニタイズ  | `aiworkflow-requirements: error-handling.md`                       |
| データ整合性       | - DB操作なし                       | -                                                                  |
| UI/UX              | - フロントエンド変更なし           | -                                                                  |
| パフォーマンス     | - 既存SkillExecutor設計を継続      | -                                                                  |
| アクセシビリティ   | - UI実装なし                       | -                                                                  |

**Electronデスクトップアプリ観点**（本プロジェクト固有）:

| 層                         | 適用判断                                       | 仕様参照先                                                         |
| -------------------------- | ---------------------------------------------- | ------------------------------------------------------------------ |
| フロントエンド（Renderer） | - 変更なし                                     | -                                                                  |
| バックエンド（Main）       | ✅ SkillService.executeSkill() → SkillExecutor | `aiworkflow-requirements: architecture-implementation-patterns.md` |
| IPC通信                    | ✅ skill:execute ハンドラー修正                | `aiworkflow-requirements: security-skill-ipc.md`                   |
| Preload/セキュリティ       | - 変更なし                                     | -                                                                  |
| ローカルストレージ         | - データ永続化なし                             | -                                                                  |

📖 詳細: `references/quality-standards.md` セクション8

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認（Phase 4テスト仕様書、aiworkflow-requirements仕様書）
2. SkillService リファクタリング（setSkillExecutor、executeSkill修正）
3. skillHandlers 修正（SkillExecutor DI統合）
4. エラーユーティリティ実装（toSkillExecutionError）
5. 統合テスト連携の実施
6. TDD検証（Green状態確認）
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
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/skill-execute-delegation --phase 5
```

## 次のPhase

Phase 6: テスト拡充
