# Phase 2: 設計

## メタ情報

| 項目       | 内容                    |
| ---------- | ----------------------- |
| Phase      | 2                       |
| 機能名     | TASK-9D-skill-chain     |
| タスク名   | スキルチェーン機能 設計 |
| 作成日     | 2026-02-28              |
| ステータス | pending                 |
| 前提       | Phase 1（要件定義）完了 |

## 目的

Phase 1 で抽出した機能要件（FR-1 〜 FR-8）・非機能要件（NFR-1 〜 NFR-4）に基づき、SkillChainExecutor・SkillChainStore・IPC ハンドラ・Preload API・Renderer 状態管理の詳細設計を行う。Electron 3 プロセスモデルの責務分離を遵守し、既知の落とし穴（P31/P32/P42/P44/P45）への対策を設計に組み込む。

## 実行タスク

| #   | タスク名                | 目的                                                            |
| --- | ----------------------- | --------------------------------------------------------------- |
| 1   | アーキテクチャ設計      | SkillChainExecutor/Store/IPC の責務分離とデータフローを設計する |
| 2   | 型設計                  | skill-chain.ts の 7 型を詳細設計する                            |
| 3   | IPC/API 設計            | 5 チャネルの引数型・戻り値型・バリデーション規則を設計する      |
| 4   | Preload 設計            | chainAPI の公開メソッドとチャネル定数を設計する                 |
| 5   | Renderer 状態設計       | skillSlice のチェーン状態と個別セレクタを設計する               |
| 6   | Date 型シリアライズ設計 | IPC 境界での Date 型変換戦略を設計する                          |

- アーキテクチャ設計: Executor/Store/IPC の責務分離とデータフローを設計する。
- 型設計: `skill-chain.ts` の7型と内部型を定義する。
- IPC/API 設計: 5チャネルの引数型・戻り値型・バリデーション規則を確定する。
- Preload 設計: `chainAPI` の公開インターフェースとチャネル定数を定義する。
- Renderer 状態設計: `skillSlice` のチェーン状態と個別セレクタ設計を固める。
- Date 型シリアライズ設計: IPC境界でのISO 8601方針を具体化する。

## 参照資料

| 資料名                     | パス                                                                                                                         | 用途                         |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| Phase 1 要件定義           | `docs/30-workflows/completed-tasks/TASK-9D-skill-chain/phase-1-requirements.md`                                              | 要件の基盤                   |
| タスク仕様                 | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-023e-task-9d-skill-chain.md` | TASK-9D タスク定義           |
| 機能仕様 §18               | `docs/30-workflows/skill-import-agent-system/specification.md`                                                               | スキル連携・チェーン機能仕様 |
| 技術判断 §19               | `docs/30-workflows/skill-import-agent-system/technical-decisions.md`                                                         | 設計判断の根拠               |
| IPC 契約                   | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                                                         | 既存 IPC チャネル契約        |
| インターフェース定義       | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`                                            | スキル統一 API 仕様          |
| セキュリティ IPC           | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`                                                    | IPC セキュリティ要件         |
| Electron セキュリティ      | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                                                 | Electron 3 プロセスモデル    |
| IPC 契約チェックリスト     | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`                                                | IPC ハンドラ検証手順         |
| 実装パターン               | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md`                                  | アーキテクチャ実装パターン   |
| 状態管理                   | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                                                 | Zustand 状態管理設計         |
| 教訓集                     | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                                                       | 過去のインシデント教訓       |
| チェーン設計エージェント   | `.claude/skills/skill-creator/agents/design-skill-chain.md`                                                                  | 設計思考プロセス 8 ステップ  |
| チェーンパターン集         | `.claude/skills/skill-creator/references/skill-chain-patterns.md`                                                            | 基本 4 + 応用 4 パターン     |
| オーケストレーションガイド | `.claude/skills/skill-creator/references/orchestration-guide.md`                                                             | 全体アーキテクチャ・変数構文 |

## 実行手順

### Step 1: アーキテクチャ設計

#### データフロー概要

```
Renderer (skillSlice)
  ↓ chainAPI.execute(chainId, variables)
Preload (skill-api.ts)
  ↓ safeInvoke(IPC_CHANNELS.SKILL_CHAIN_EXECUTE, { chainId, variables })
Main Process (skillHandlers.ts)
  ↓ ipcMain.handle("skill:chain:execute", ...)
SkillChainExecutor.executeChain(chainDef, variables)
  ↓ for each step:
  ↓   1. evaluateCondition(step.condition, context)
  ↓   2. buildStepInput(step.inputMapping, context)
  ↓   3. skillService.executeSkill(step.skillName, input)
  ↓   4. extractOutput(step.outputMapping, rawOutput)
  ↓   5. context.variables[variableName] = extractedOutput
  ↓ return SkillChainResult
Main Process → Preload → Renderer
```

#### コンポーネント責務

| コンポーネント     | 責務                                                                                                       | 依存先                              |
| ------------------ | ---------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| SkillChainExecutor | チェーン実行ロジック（ステップ順次実行、入出力マッピング、条件評価、テンプレート展開、エラーハンドリング） | SkillService（スキル実行委譲）      |
| SkillChainStore    | チェーン定義の永続化（JSON ファイル保存・読込・削除・一覧取得）                                            | ファイルシステム（fs/path）         |
| skillHandlers.ts   | IPC ハンドラ登録（5 チャネル）、入力バリデーション、sender 検証、エラーサニタイズ                          | SkillChainExecutor, SkillChainStore |

#### SkillChainExecutor 詳細設計

```typescript
class SkillChainExecutor {
  constructor(private skillService: SkillService) {}

  /**
   * チェーンを実行し、全ステップの結果を返す
   * @param chain チェーン定義
   * @param initialVariables 初期変数（chain.variables とマージ）
   * @returns SkillChainResult
   */
  async executeChain(
    chain: SkillChainDefinition,
    initialVariables?: Record<string, unknown>,
  ): Promise<SkillChainResult>;

  /**
   * ステップの入力を構築する
   * @param inputMapping 入力マッピング定義
   * @param context 実行コンテキスト（variables, previousOutput）
   * @returns 構築された入力オブジェクト
   */
  private buildStepInput(
    inputMapping: Record<string, InputMapping>,
    context: ChainExecutionContext,
  ): Record<string, unknown>;

  /**
   * ステップの実行条件を評価する
   * @param condition 条件定義（undefined の場合は true を返す）
   * @param context 実行コンテキスト
   * @returns 実行するかどうか
   */
  private evaluateCondition(
    condition: SkillChainCondition | undefined,
    context: ChainExecutionContext,
  ): boolean;

  /**
   * ステップ出力から指定パスの値を抽出する
   * @param outputMapping 出力マッピング定義
   * @param rawOutput ステップの生出力
   * @returns 抽出された値
   */
  private extractOutput(
    outputMapping: OutputMapping | undefined,
    rawOutput: unknown,
  ): unknown;

  /**
   * Mustache テンプレートを展開する
   * @param template テンプレート文字列
   * @param variables 変数マップ
   * @returns 展開後の文字列
   */
  private renderTemplate(
    template: string,
    variables: Record<string, unknown>,
  ): string;
}
```

#### 内部型: ChainExecutionContext

```typescript
interface ChainExecutionContext {
  variables: Record<string, unknown>; // 現在の変数状態
  previousOutput: unknown; // 直前ステップの出力
  previousSuccess: boolean; // 直前ステップの成否
  stepResults: StepResult[]; // これまでのステップ結果
}
```

#### SkillChainStore 詳細設計

```typescript
class SkillChainStore {
  private readonly storePath: string; // チェーン定義保存ディレクトリ

  constructor(basePath: string) {
    // basePath 配下に "skill-chains/" ディレクトリを使用
    this.storePath = path.join(basePath, "skill-chains");
  }

  /**
   * チェーン定義を保存する（新規作成 or 更新）
   * - 新規: id 未設定の場合 UUID v4 を生成
   * - 更新: 既存 id の場合 updatedAt を更新
   */
  async save(chain: SkillChainDefinition): Promise<SkillChainDefinition>;

  /**
   * chainId 指定でチェーン定義を取得する
   * @returns 見つからない場合は null
   */
  async get(chainId: string): Promise<SkillChainDefinition | null>;

  /**
   * 保存済み全チェーン定義を取得する
   */
  async list(): Promise<SkillChainDefinition[]>;

  /**
   * chainId 指定でチェーン定義を削除する
   * @returns 削除成功 true、見つからない場合 false
   */
  async delete(chainId: string): Promise<boolean>;
}
```

**永続化方式**: 各チェーン定義を `{storePath}/{chainId}.json` として保存。ファイル名は chainId（UUID v4）で一意性を保証。

#### エラーハンドリング戦略の実行ロジック

```typescript
// executeChain 内のエラーハンドリング擬似コード
for (const step of chain.steps) {
  const shouldRun = this.evaluateCondition(step.condition, context);
  if (!shouldRun) {
    results.push({ stepId: step.stepId, skipped: true });
    continue;
  }

  let lastError: string | undefined;
  let stepSuccess = false;
  const maxAttempts =
    chain.errorHandling === "retry" ? (step.retryCount ?? 0) + 1 : 1;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const input = this.buildStepInput(step.inputMapping, context);
      const output = await this.executeStep(step, input);
      // 成功時の処理...
      stepSuccess = true;
      break;
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
    }
  }

  if (!stepSuccess) {
    results.push({ stepId: step.stepId, success: false, error: lastError });

    switch (chain.errorHandling) {
      case "stop":
        // チェーン全体を停止、後続ステップは実行しない
        return buildResult(chain.id, false, results, context, startTime);
      case "skip":
        // このステップをスキップして続行
        context.previousSuccess = false;
        continue;
      case "retry":
        // maxAttempts 回リトライ後も失敗 → stop と同じ動作
        return buildResult(chain.id, false, results, context, startTime);
    }
  }
}
```

### Step 2: 型設計

#### ファイル: `packages/shared/src/types/skill-chain.ts`

```typescript
/**
 * スキルチェーン定義
 * チェーンの全体構造を定義する最上位型
 */
export interface SkillChainDefinition {
  /** チェーン識別子（UUID v4） */
  id: string;
  /** チェーン名（表示用、1〜100文字） */
  name: string;
  /** チェーンの説明（0〜500文字） */
  description: string;
  /** 実行ステップ配列（順序保持、1ステップ以上） */
  steps: SkillChainStep[];
  /** テンプレート変数の初期値 */
  variables: Record<string, unknown>;
  /** エラー発生時の振る舞い */
  errorHandling: SkillChainErrorStrategy;
  /** 作成日時（ISO 8601 文字列） */
  createdAt: string;
  /** 更新日時（ISO 8601 文字列） */
  updatedAt: string;
}

/** エラーハンドリング戦略 */
export type SkillChainErrorStrategy = "stop" | "skip" | "retry";

/**
 * チェーン内の1ステップ
 */
export interface SkillChainStep {
  /** ステップ識別子（UUID v4） */
  stepId: string;
  /** 実行対象スキル名 */
  skillName: string;
  /** 入力マッピング定義（キー: 入力パラメータ名、値: マッピング定義） */
  inputMapping: Record<string, InputMapping>;
  /** 出力マッピング定義（任意） */
  outputMapping?: OutputMapping;
  /** 実行条件（未指定時は常に実行） */
  condition?: SkillChainCondition;
  /** タイムアウト（ミリ秒、未指定時は 30000ms） */
  timeout?: number;
  /** リトライ回数（未指定時は 0、errorHandling="retry" 時のみ有効） */
  retryCount?: number;
}

/**
 * 入力マッピング定義
 * ステップへの入力値の取得方法を指定する
 */
export interface InputMapping {
  /** 入力値の取得方法 */
  type: InputMappingType;
  /** literal: リテラル値、variable: 変数名 */
  value?: unknown;
  /** template: Mustache テンプレート文字列 */
  template?: string;
}

/** 入力マッピング種別 */
export type InputMappingType =
  | "literal"
  | "variable"
  | "template"
  | "previousOutput";

/**
 * 出力マッピング定義
 * ステップ出力から値を抽出して変数に格納する
 */
export interface OutputMapping {
  /** JSONPath 形式の出力抽出パス（未指定時は出力全体） */
  extractPath?: string;
  /** 抽出結果を格納する変数名 */
  variableName: string;
}

/**
 * ステップ実行条件
 */
export interface SkillChainCondition {
  /** 条件種別 */
  type: SkillChainConditionType;
  /** expression 時の評価式（Mustache 変数参照可能） */
  expression?: string;
  /** ifVariable 時の変数名 */
  variable?: string;
  /** ifVariable 時の期待値 */
  expectedValue?: unknown;
}

/** 条件種別 */
export type SkillChainConditionType =
  | "always"
  | "ifVariable"
  | "ifPreviousSuccess"
  | "expression";

/**
 * チェーン実行結果
 */
export interface SkillChainResult {
  /** 実行したチェーンの ID */
  chainId: string;
  /** チェーン全体の成否 */
  success: boolean;
  /** 各ステップの実行結果 */
  results: StepResult[];
  /** 最終的な変数状態 */
  finalVariables: Record<string, unknown>;
  /** 合計実行時間（ミリ秒） */
  totalDuration: number;
}

/**
 * 個別ステップの実行結果
 */
export interface StepResult {
  /** ステップ識別子 */
  stepId: string;
  /** 成否（skipped 時は undefined） */
  success?: boolean;
  /** 条件不一致でスキップされたか */
  skipped?: boolean;
  /** ステップ出力 */
  output?: unknown;
  /** エラーメッセージ */
  error?: string;
  /** 実行時間（ミリ秒） */
  duration?: number;
}
```

#### ファイル: `packages/shared/src/types/index.ts`（修正箇所）

```typescript
// 既存のエクスポートに追加
export type {
  SkillChainDefinition,
  SkillChainErrorStrategy,
  SkillChainStep,
  InputMapping,
  InputMappingType,
  OutputMapping,
  SkillChainCondition,
  SkillChainConditionType,
  SkillChainResult,
  StepResult,
} from "./skill-chain";
```

### Step 3: IPC/API 設計

#### チャネル定数定義（channels.ts 追加分）

```typescript
// apps/desktop/src/preload/channels.ts に追加
export const IPC_CHANNELS = {
  // ... 既存チャネル ...
  SKILL_CHAIN_LIST: "skill:chain:list",
  SKILL_CHAIN_GET: "skill:chain:get",
  SKILL_CHAIN_SAVE: "skill:chain:save",
  SKILL_CHAIN_DELETE: "skill:chain:delete",
  SKILL_CHAIN_EXECUTE: "skill:chain:execute",
} as const;
```

#### IPC ハンドラ設計（5 チャネル）

##### skill:chain:list

| 項目             | 内容                                |
| ---------------- | ----------------------------------- |
| チャネル名       | `skill:chain:list`                  |
| 方向             | Renderer → Main                     |
| 引数             | なし                                |
| 戻り値           | `IpcResult<SkillChainDefinition[]>` |
| バリデーション   | sender 検証のみ（引数なし）         |
| エラーサニタイズ | 内部パスをマスクして返す            |

```typescript
ipcMain.handle(IPC_CHANNELS.SKILL_CHAIN_LIST, async (event) => {
  validateIpcSender(event, { getAllowedWindows: () => [mainWindow] });
  try {
    const chains = await skillChainStore.list();
    return { success: true, data: chains };
  } catch (error) {
    return { success: false, error: sanitizeError(error) };
  }
});
```

##### skill:chain:get

| 項目           | 内容                                                                |
| -------------- | ------------------------------------------------------------------- |
| チャネル名     | `skill:chain:get`                                                   |
| 方向           | Renderer → Main                                                     |
| 引数           | `chainId: string`                                                   |
| 戻り値         | `IpcResult<SkillChainDefinition>`                                   |
| バリデーション | sender 検証 + P42 準拠 3 段バリデーション（chainId）                |
| エラーケース   | 存在しない chainId → `{ success: false, error: "Chain not found" }` |

```typescript
ipcMain.handle(IPC_CHANNELS.SKILL_CHAIN_GET, async (event, chainId: string) => {
  validateIpcSender(event, { getAllowedWindows: () => [mainWindow] });

  // P42 準拠 3 段バリデーション
  if (typeof chainId !== "string" || chainId === "" || chainId.trim() === "") {
    return { success: false, error: "chainId must be a non-empty string" };
  }

  try {
    const chain = await skillChainStore.get(chainId.trim());
    if (!chain) {
      return { success: false, error: "Chain not found" };
    }
    return { success: true, data: chain };
  } catch (error) {
    return { success: false, error: sanitizeError(error) };
  }
});
```

##### skill:chain:save

| 項目           | 内容                                                                   |
| -------------- | ---------------------------------------------------------------------- |
| チャネル名     | `skill:chain:save`                                                     |
| 方向           | Renderer → Main                                                        |
| 引数           | `chain: SkillChainDefinition`                                          |
| 戻り値         | `IpcResult<SkillChainDefinition>`                                      |
| バリデーション | sender 検証 + オブジェクトバリデーション（name, steps, errorHandling） |
| 補足           | 新規作成時は id を UUID v4 で生成、createdAt/updatedAt を設定          |

```typescript
ipcMain.handle(
  IPC_CHANNELS.SKILL_CHAIN_SAVE,
  async (event, chain: SkillChainDefinition) => {
    validateIpcSender(event, { getAllowedWindows: () => [mainWindow] });

    // オブジェクトバリデーション
    if (!chain || typeof chain !== "object") {
      return { success: false, error: "chain must be an object" };
    }
    if (typeof chain.name !== "string" || chain.name.trim() === "") {
      return { success: false, error: "chain.name must be a non-empty string" };
    }
    if (!Array.isArray(chain.steps) || chain.steps.length === 0) {
      return { success: false, error: "chain.steps must be a non-empty array" };
    }
    const validStrategies = ["stop", "skip", "retry"];
    if (!validStrategies.includes(chain.errorHandling)) {
      return {
        success: false,
        error: "chain.errorHandling must be 'stop', 'skip', or 'retry'",
      };
    }

    try {
      const saved = await skillChainStore.save(chain);
      return { success: true, data: saved };
    } catch (error) {
      return { success: false, error: sanitizeError(error) };
    }
  },
);
```

##### skill:chain:delete

| 項目           | 内容                                                 |
| -------------- | ---------------------------------------------------- |
| チャネル名     | `skill:chain:delete`                                 |
| 方向           | Renderer → Main                                      |
| 引数           | `chainId: string`                                    |
| 戻り値         | `IpcResult<{ deleted: boolean }>`                    |
| バリデーション | sender 検証 + P42 準拠 3 段バリデーション（chainId） |

```typescript
ipcMain.handle(
  IPC_CHANNELS.SKILL_CHAIN_DELETE,
  async (event, chainId: string) => {
    validateIpcSender(event, { getAllowedWindows: () => [mainWindow] });

    // P42 準拠 3 段バリデーション
    if (
      typeof chainId !== "string" ||
      chainId === "" ||
      chainId.trim() === ""
    ) {
      return { success: false, error: "chainId must be a non-empty string" };
    }

    try {
      const deleted = await skillChainStore.delete(chainId.trim());
      return { success: true, data: { deleted } };
    } catch (error) {
      return { success: false, error: sanitizeError(error) };
    }
  },
);
```

##### skill:chain:execute

| 項目           | 内容                                                                        |
| -------------- | --------------------------------------------------------------------------- |
| チャネル名     | `skill:chain:execute`                                                       |
| 方向           | Renderer → Main                                                             |
| 引数           | `{ chainId: string; variables?: Record<string, unknown> }`                  |
| 戻り値         | `IpcResult<SkillChainResult>`                                               |
| バリデーション | sender 検証 + P42 準拠 3 段バリデーション（chainId） + variables 型チェック |

```typescript
ipcMain.handle(
  IPC_CHANNELS.SKILL_CHAIN_EXECUTE,
  async (
    event,
    args: { chainId: string; variables?: Record<string, unknown> },
  ) => {
    validateIpcSender(event, { getAllowedWindows: () => [mainWindow] });

    // 引数オブジェクトバリデーション
    if (!args || typeof args !== "object") {
      return { success: false, error: "args must be an object" };
    }

    // P42 準拠 3 段バリデーション（chainId）
    if (
      typeof args.chainId !== "string" ||
      args.chainId === "" ||
      args.chainId.trim() === ""
    ) {
      return { success: false, error: "chainId must be a non-empty string" };
    }

    // variables バリデーション（任意だがオブジェクト型を強制）
    if (
      args.variables !== undefined &&
      (typeof args.variables !== "object" ||
        args.variables === null ||
        Array.isArray(args.variables))
    ) {
      return { success: false, error: "variables must be a plain object" };
    }

    try {
      const chain = await skillChainStore.get(args.chainId.trim());
      if (!chain) {
        return { success: false, error: "Chain not found" };
      }

      const result = await skillChainExecutor.executeChain(
        chain,
        args.variables,
      );
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: sanitizeError(error) };
    }
  },
);
```

### Step 4: Preload 設計

#### chainAPI 設計（skill-api.ts 追加分）

```typescript
// apps/desktop/src/preload/skill-api.ts に追加

export const chainAPI = {
  /**
   * 保存済みチェーン一覧を取得する
   */
  list: (): Promise<IpcResult<SkillChainDefinition[]>> =>
    safeInvoke(IPC_CHANNELS.SKILL_CHAIN_LIST),

  /**
   * chainId 指定でチェーン定義を取得する
   */
  get: (chainId: string): Promise<IpcResult<SkillChainDefinition>> =>
    safeInvoke(IPC_CHANNELS.SKILL_CHAIN_GET, chainId),

  /**
   * チェーン定義を保存する（新規作成 or 更新）
   */
  save: (
    chain: SkillChainDefinition,
  ): Promise<IpcResult<SkillChainDefinition>> =>
    safeInvoke(IPC_CHANNELS.SKILL_CHAIN_SAVE, chain),

  /**
   * chainId 指定でチェーン定義を削除する
   */
  delete: (chainId: string): Promise<IpcResult<{ deleted: boolean }>> =>
    safeInvoke(IPC_CHANNELS.SKILL_CHAIN_DELETE, chainId),

  /**
   * チェーンを実行する
   */
  execute: (
    chainId: string,
    variables?: Record<string, unknown>,
  ): Promise<IpcResult<SkillChainResult>> =>
    safeInvoke(IPC_CHANNELS.SKILL_CHAIN_EXECUTE, { chainId, variables }),
};
```

#### contextBridge 公開

```typescript
// contextBridge.exposeInMainWorld 内
electronAPI: {
  // ... 既存API ...
  chain: chainAPI,
}
```

#### Preload 型定義追加（types.ts）

```typescript
// apps/desktop/src/preload/types.ts に追加
import type { SkillChainDefinition, SkillChainResult } from "@repo/shared";

export interface ChainAPI {
  list: () => Promise<IpcResult<SkillChainDefinition[]>>;
  get: (chainId: string) => Promise<IpcResult<SkillChainDefinition>>;
  save: (
    chain: SkillChainDefinition,
  ) => Promise<IpcResult<SkillChainDefinition>>;
  delete: (chainId: string) => Promise<IpcResult<{ deleted: boolean }>>;
  execute: (
    chainId: string,
    variables?: Record<string, unknown>,
  ) => Promise<IpcResult<SkillChainResult>>;
}
```

### Step 5: Renderer 状態設計

#### skillSlice チェーン状態追加

```typescript
// apps/desktop/src/renderer/store/slices/skillSlice.ts に追加

// 状態型
interface SkillChainSliceState {
  /** 保存済みチェーン定義一覧 */
  chains: SkillChainDefinition[];
  /** チェーン実行状態 */
  chainExecutionStatus: ChainExecutionStatus;
  /** 実行中のチェーン結果（実行中 or 最後の結果） */
  chainExecutionResult: SkillChainResult | null;
  /** チェーン一覧のローディング状態 */
  isChainsLoading: boolean;
  /** チェーン操作のエラーメッセージ */
  chainError: string | null;
}

type ChainExecutionStatus = "idle" | "running" | "completed" | "error";

// アクション型
interface SkillChainSliceActions {
  /** チェーン一覧を取得する */
  fetchChains: () => Promise<void>;
  /** チェーンを保存する */
  saveChain: (
    chain: SkillChainDefinition,
  ) => Promise<SkillChainDefinition | null>;
  /** チェーンを削除する */
  deleteChain: (chainId: string) => Promise<boolean>;
  /** チェーンを実行する */
  executeChain: (
    chainId: string,
    variables?: Record<string, unknown>,
  ) => Promise<SkillChainResult | null>;
  /** チェーンエラーをクリアする */
  clearChainError: () => void;
}
```

#### 個別セレクタ設計（P31 対策）

```typescript
// 状態セレクタ
export const useChains = () => useAppStore((s) => s.chains);
export const useChainExecutionStatus = () =>
  useAppStore((s) => s.chainExecutionStatus);
export const useChainExecutionResult = () =>
  useAppStore((s) => s.chainExecutionResult);
export const useIsChainsLoading = () => useAppStore((s) => s.isChainsLoading);
export const useChainError = () => useAppStore((s) => s.chainError);

// アクションセレクタ（Zustand アクション参照は安定しているため useEffect 依存配列に安全）
export const useFetchChains = () => useAppStore((s) => s.fetchChains);
export const useSaveChain = () => useAppStore((s) => s.saveChain);
export const useDeleteChain = () => useAppStore((s) => s.deleteChain);
export const useExecuteChain = () => useAppStore((s) => s.executeChain);
export const useClearChainError = () => useAppStore((s) => s.clearChainError);
```

### Step 6: Date 型シリアライズ設計

#### IPC 境界での Date 型変換戦略

| 層           | 型                   | 変換タイミング                                                       |
| ------------ | -------------------- | -------------------------------------------------------------------- |
| Main Process | `string`（ISO 8601） | SkillChainStore が JSON から読み込み時にそのまま文字列として保持     |
| IPC 境界     | `string`             | 変換不要（createdAt/updatedAt は ISO 8601 文字列としてそのまま転送） |
| Renderer     | `string`             | 表示時に `new Date(isoString).toLocaleString()` で変換               |

**設計判断**: SkillChainDefinition の createdAt/updatedAt は最初から `string`（ISO 8601）型として定義する。Main Process 内部でも Date オブジェクトに変換せず、一貫して ISO 8601 文字列を使用する。これにより IPC 境界での変換処理が不要になり、シリアライズの複雑さを排除する。

**ISO 8601 文字列の生成方法**:

```typescript
// 新規作成時
const now = new Date().toISOString(); // "2026-02-28T12:00:00.000Z"
chain.createdAt = now;
chain.updatedAt = now;

// 更新時
chain.updatedAt = new Date().toISOString();
```

## 統合テスト連携

| テスト種別         | 対象               | 確認内容                                                                       |
| ------------------ | ------------------ | ------------------------------------------------------------------------------ |
| 単体テスト         | SkillChainExecutor | executeChain, buildStepInput, evaluateCondition, extractOutput, renderTemplate |
| 単体テスト         | SkillChainStore    | save, get, list, delete の CRUD 操作                                           |
| 統合テスト         | IPC ハンドラ       | 5 チャネルの正常系・異常系・バリデーション                                     |
| セキュリティテスト | IPC ハンドラ       | P42 準拠 3 段バリデーション、sender 検証、エラーサニタイズ                     |

## 多角的チェック観点

### 設計整合性

- [ ] Phase 1 の全 FR（FR-1 〜 FR-8）が設計でカバーされている
- [ ] Phase 1 の全 NFR（NFR-1 〜 NFR-4）が設計でカバーされている
- [ ] 各コンポーネントの責務が単一責務原則に従っている

### Electron 固有観点

- [ ] Main Process / Preload / Renderer の責務分離が明確
- [ ] IPC チャネル設計が既存パターン（api-ipc-agent.md）と整合
- [ ] contextBridge 経由で chainAPI を公開する設計
- [ ] Renderer から Node.js API を直接使用しない設計

### IPC 設計観点

- [ ] 5 チャネルの引数型・戻り値型が明確に定義されている
- [ ] P42 準拠 3 段バリデーションが全チャネルに組み込まれている
- [ ] sender 検証が全ハンドラに組み込まれている
- [ ] エラーサニタイズが全ハンドラに組み込まれている
- [ ] 引数名のセマンティクスが実際の値と一致している（P45 対策）

### 型設計観点

- [ ] 7 型の全フィールドが JSDoc コメント付きで定義されている
- [ ] packages/shared と apps/desktop/src/preload の型定義が整合している（P32 準拠）
- [ ] any 型を使用していない
- [ ] ユニオン型（ErrorStrategy, InputMappingType, ConditionType）が列挙されている

### 状態管理観点

- [ ] 個別セレクタが提供されている（P31 対策）
- [ ] 合成 Hook を useEffect 依存配列に含めない設計
- [ ] ローディング・エラー状態が管理されている

### 既知の落とし穴対策

- [ ] P31（Zustand 無限ループ）: 個別セレクタ設計が含まれている
- [ ] P32（型定義二箇所同時更新）: shared/preload 型定義の対応が明示されている
- [ ] P42（trim バリデーション漏れ）: 3 段バリデーションが全チャネルに組み込まれている
- [ ] P44（IPC インターフェース不整合）: ハンドラ引数と Preload 呼び出しの一致を確認
- [ ] P45（引数命名ドリフト）: chainId/chain/variables の命名がセマンティクスと一致

## 成果物

| 成果物             | パス                                     | 内容                             |
| ------------------ | ---------------------------------------- | -------------------------------- |
| アーキテクチャ設計 | `outputs/phase-2/architecture-design.md` | データフロー、コンポーネント責務 |
| IPC/API 仕様       | `outputs/phase-2/api-specification.md`   | 5 チャネルの詳細仕様             |
| 型設計             | `outputs/phase-2/type-design.md`         | 7 型 + 内部型の詳細定義          |

## 完了条件

- [ ] SkillChainExecutor のメソッドシグネチャと責務が定義されている
- [ ] SkillChainStore のメソッドシグネチャと永続化方式が定義されている
- [ ] IPC 5 チャネルの引数型・戻り値型・バリデーション規則が定義されている
- [ ] Preload chainAPI の公開メソッドが定義されている
- [ ] Renderer skillSlice のチェーン状態と個別セレクタが定義されている
- [ ] 7 型の全フィールドが JSDoc コメント付きで詳細設計されている
- [ ] Date 型シリアライズ戦略が定義されている
- [ ] エラーハンドリング戦略の実行ロジックが擬似コードで定義されている
- [ ] Phase 1 の全要件が設計でカバーされている
- [ ] 既知の落とし穴（P31/P32/P42/P44/P45）への対策が設計に含まれている
- [ ] 成果物 3 ファイルが作成されている

## サブタスク管理

| #   | サブタスク              | 依存      | ステータス |
| --- | ----------------------- | --------- | ---------- |
| 1   | アーキテクチャ設計      | Phase 1   | pending    |
| 2   | 型設計                  | サブ 1    | pending    |
| 3   | IPC/API 設計            | サブ 1, 2 | pending    |
| 4   | Preload 設計            | サブ 3    | pending    |
| 5   | Renderer 状態設計       | サブ 2    | pending    |
| 6   | Date 型シリアライズ設計 | サブ 2    | pending    |
| 7   | 成果物作成              | サブ 1-6  | pending    |

## タスク 100% 実行確認

Phase 2 の全タスクが完了したことを確認するための最終チェック:

- [ ] Step 1（アーキテクチャ設計）: データフロー図、コンポーネント責務表、エラーハンドリングロジック完了
- [ ] Step 2（型設計）: 7 型 + 2 内部型の全フィールド定義完了
- [ ] Step 3（IPC/API 設計）: 5 チャネルの詳細仕様（引数、戻り値、バリデーション、コード例）完了
- [ ] Step 4（Preload 設計）: chainAPI 5 メソッド + 型定義完了
- [ ] Step 5（Renderer 状態設計）: 状態型、アクション型、個別セレクタ 10 個完了
- [ ] Step 6（Date 型シリアライズ設計）: 変換戦略と生成方法完了
- [ ] 成果物: 3 ファイルが作成済み

## 次の Phase

Phase 2 完了後、Phase 3（設計レビュー）に進む。Phase 3 では本 Phase の設計が Phase 1 要件を充足しているか、IPC 設計・セキュリティ・型安全・Electron 3 プロセスモデル整合性の観点でレビューを行う。
