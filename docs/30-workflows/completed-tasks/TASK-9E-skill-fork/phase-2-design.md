# Phase 2: 設計

## メタ情報

| 項目     | 値                 |
| -------- | ------------------ |
| Phase    | 2                  |
| 機能名   | TASK-9E-skill-fork |
| タスクID | TASK-9E            |
| 作成日   | 2026-02-28         |

## 目的

Phase 1 で定義した要件を実現可能なアーキテクチャ・インターフェース設計に落とし込む。SkillForker サービスのクラス設計、IPC 契約、Preload API 拡張、型定義の詳細設計を行う。

## 実行タスク

- Task 1: SkillForker クラス設計（メソッド構成、依存関係、エラー処理戦略）
- Task 2: IPC 契約設計（skill:fork チャネルのリクエスト/レスポンス型、バリデーション）
- Task 3: Preload API 設計（skill-api.ts への forkSkill メソッド追加、channels.ts 定数追加）
- Task 4: 型定義設計（SkillForkOptions / SkillForkResult / SkillForkMetadata の詳細設計）
- Task 5: フォークプロセスフロー設計（シーケンス図・エラーハンドリングフロー）

## 参照資料

| 資料名             | パス                                                                           | 説明                   |
| ------------------ | ------------------------------------------------------------------------------ | ---------------------- |
| Phase 1 要件定義   | `docs/30-workflows/completed-tasks/TASK-9E-skill-fork/phase-1-requirements.md` | Phase 1 成果物         |
| フォーク仕様       | `docs/30-workflows/skill-import-agent-system/specification.md` §19             | フォーク・派生機能仕様 |
| 設計判断           | `docs/30-workflows/skill-import-agent-system/technical-decisions.md` §20       | コピー+メタデータ方式  |
| IPC仕様            | `aiworkflow-requirements: api-ipc-agent.md`                                    | IPC チャネル仕様       |
| アーキテクチャ概要 | `aiworkflow-requirements: architecture-overview.md`                            | システム構造           |
| セキュリティIPC    | `aiworkflow-requirements: security-electron-ipc.md`                            | IPC セキュリティ設計   |
| スキルIF           | `aiworkflow-requirements: interfaces-agent-sdk-skill.md`                       | スキル型定義仕様       |
| 実装パターン       | `aiworkflow-requirements: architecture-implementation-patterns.md`             | 既知の実装パターン     |
| 既知の落とし穴     | `.claude/rules/06-known-pitfalls.md`                                           | P42/P44/P45 対策       |

## aiworkflow-requirements 抽出設計マトリクス

| 仕様書                                    | 設計へ取り込む制約                                          | 設計反映先                                     |
| ----------------------------------------- | ----------------------------------------------------------- | ---------------------------------------------- |
| `api-ipc-agent.md`                        | IPC戻り値を `IpcResult<SkillForkResult>` で統一             | Task 2（IPC 契約設計）                         |
| `architecture-overview.md`                | Main/IPC/Preload の層責務を厳格化                           | Task 1/3（サービス設計とPreload設計）          |
| `architecture-implementation-patterns.md` | IPC 反パターンを避ける設計ガードを適用                      | Task 2/5（契約設計とフロー設計）               |
| `interfaces-agent-sdk-skill.md`           | SkillCreator 系 `skill-creator:fork` との責務分離を明確化   | Task 2/3（`skill:fork` を skill API 側へ追加） |
| `security-electron-ipc.md`                | sender 検証、チャンネルホワイトリスト、sanitizeError の適用 | Task 2（Main IPC ハンドラ設計）                |
| `security-api-electron.md`                | `safeInvoke` 経由公開・Preload API最小公開原則              | Task 3（Preload API 設計）                     |
| `error-handling.md`                       | バリデーション/FS/予期せぬ例外の分類とコード設計            | Task 1/5（サービス層 + フロー）                |
| `ipc-contract-checklist.md`               | P44/P45 対策の3点同期（ハンドラ/Preload/型）                | Task 2/4（契約・型定義設計）                   |
| `quality-requirements.md`                 | テスト/品質ゲートの数値目標を設計へ反映                     | Task 5（検証フロー設計）                       |
| `testing-component-patterns.md`           | Phase 4〜7 のテスト設計観点を先取り                         | Task 5（設計段階でテスト観点を固定）           |

## 実行手順

### Task 1: SkillForker クラス設計

#### クラス構成

```typescript
// apps/desktop/src/main/services/skill/SkillForker.ts

import {
  SkillForkOptions,
  SkillForkResult,
  SkillForkMetadata,
} from "@repo/shared/types/skill-fork";

export class SkillForker {
  constructor(private skillsDir: string) {}

  /**
   * 既存スキルをフォークして新スキルを作成する
   * @throws SkillForkError フォーク失敗時（ロールバック済み）
   */
  async fork(options: SkillForkOptions): Promise<SkillForkResult>;

  /**
   * SKILL.md の Frontmatter を更新する
   * - name → options.newName
   * - description → options.description（指定時のみ）
   * - forked-from → options.sourceSkill
   * - allowed-tools → options.modifyAllowedTools（指定時のみ）
   */
  private modifySkillMd(content: string, options: SkillForkOptions): string;

  /**
   * サブディレクトリを再帰的にコピーする
   * @returns コピーされたファイルの相対パス一覧
   */
  private copyDirectory(
    src: string,
    dest: string,
    subDir: string,
  ): Promise<string[]>;

  /**
   * フォークメタデータを JSON ファイルとして書き込む
   */
  private writeForkMetadata(
    destPath: string,
    metadata: SkillForkMetadata,
  ): Promise<void>;

  /**
   * パスの存在確認（ディレクトリ）
   */
  private exists(dirPath: string): Promise<boolean>;

  /**
   * Frontmatter のパース（--- で囲まれた YAML 部分）
   */
  private parseFrontmatter(content: string): {
    frontmatter: Record<string, unknown>;
    body: string;
  };

  /**
   * Frontmatter のシリアライズ
   */
  private serializeFrontmatter(
    frontmatter: Record<string, unknown>,
    body: string,
  ): string;

  /**
   * パストラバーサル検証
   * sourceSkill, newName がスキルディレクトリ外を参照していないことを検証
   */
  private validatePath(name: string): void;

  /**
   * ロールバック処理
   * フォーク途中でエラーが発生した場合、作成途中のディレクトリを削除
   */
  private rollback(destPath: string): Promise<void>;
}
```

#### 依存関係

| 依存先                 | 注入方式              | 用途                           |
| ---------------------- | --------------------- | ------------------------------ |
| skillsDir（string）    | Constructor Injection | スキルディレクトリのルートパス |
| fs/promises（Node.js） | 直接 import           | ファイルシステム操作           |
| path（Node.js）        | 直接 import           | パス操作                       |

**設計判断**: SkillForker は ファイルシステム操作のみを担当するため、外部の BrowserWindow や IPC ハンドラへの依存は持たない。SkillService 経由で呼び出される構成とし、DI の複雑性を回避する。

#### エラー処理戦略

| エラー種別             | エラーコード | リトライ | ロールバック | 対応                           |
| ---------------------- | ------------ | -------- | ------------ | ------------------------------ |
| フォーク元スキル不存在 | 1001         | 不可     | 不要         | バリデーションエラーを返す     |
| 同名スキル存在         | 1002         | 不可     | 不要         | バリデーションエラーを返す     |
| パストラバーサル検出   | 1003         | 不可     | 不要         | バリデーションエラーを返す     |
| 引数バリデーション失敗 | 1004         | 不可     | 不要         | バリデーションエラーを返す     |
| SKILL.md 読み取り失敗  | 4001         | 可能     | 実行         | ディレクトリ削除後エラーを返す |
| ディレクトリコピー失敗 | 4002         | 可能     | 実行         | ディレクトリ削除後エラーを返す |
| メタデータ書き込み失敗 | 4003         | 可能     | 実行         | ディレクトリ削除後エラーを返す |
| ディレクトリ作成失敗   | 4004         | 可能     | 実行         | ディレクトリ削除後エラーを返す |

#### ロールバック設計

```
fork() 処理フロー:
  1. validatePath(sourceSkill)
  2. validatePath(newName)
  3. exists(sourcePath) → 不存在なら Error(1001)
  4. exists(destPath) → 存在なら Error(1002)
  5. mkdir(destPath)
  ── ここから try/catch でロールバック保護 ──
  6. readFile(SKILL.md) → modifySkillMd() → writeFile(SKILL.md)
  7. copyDirectory(agents/)    ← copyAgents=true の場合
  8. copyDirectory(references/) ← copyReferences=true の場合
  9. copyDirectory(scripts/)   ← copyScripts=true の場合
  10. copyDirectory(assets/)   ← copyAssets=true の場合
  11. writeForkMetadata()
  ── catch: rollback(destPath) → rm -rf destPath ──
  12. return SkillForkResult
```

### Task 2: IPC 契約設計

#### skill:fork ハンドラ設計

```typescript
// apps/desktop/src/main/ipc/skillHandlers.ts 内に追加

ipcMain.handle(
  IPC_CHANNELS.SKILL_FORK,
  async (event: IpcMainInvokeEvent, args: unknown) => {
    // 1. 送信元検証
    const validation = validateIpcSender(event, IPC_CHANNELS.SKILL_FORK, {
      getAllowedWindows: () => [mainWindow],
    });
    if (!validation.valid) {
      throw toIPCValidationError(validation);
    }

    // 2. P42準拠3段バリデーション
    // args がオブジェクトであることを検証
    if (typeof args !== "object" || args === null) {
      throw {
        code: "VALIDATION_ERROR",
        message: "args must be a non-null object",
      };
    }

    const forkArgs = args as Record<string, unknown>;

    // sourceSkill: string, 非空, トリム後非空
    if (
      typeof forkArgs.sourceSkill !== "string" ||
      forkArgs.sourceSkill.trim() === ""
    ) {
      throw {
        code: "VALIDATION_ERROR",
        message: "sourceSkill must be a non-empty string",
      };
    }

    // newName: string, 非空, トリム後非空
    if (
      typeof forkArgs.newName !== "string" ||
      forkArgs.newName.trim() === ""
    ) {
      throw {
        code: "VALIDATION_ERROR",
        message: "newName must be a non-empty string",
      };
    }

    // description: string | undefined（指定時は非空チェック）
    if (
      forkArgs.description !== undefined &&
      (typeof forkArgs.description !== "string" ||
        forkArgs.description.trim() === "")
    ) {
      throw {
        code: "VALIDATION_ERROR",
        message: "description must be a non-empty string when provided",
      };
    }

    // copyAgents, copyReferences, copyScripts, copyAssets: boolean
    for (const flag of [
      "copyAgents",
      "copyReferences",
      "copyScripts",
      "copyAssets",
    ]) {
      if (typeof forkArgs[flag] !== "boolean") {
        throw {
          code: "VALIDATION_ERROR",
          message: `${flag} must be a boolean`,
        };
      }
    }

    // modifyAllowedTools: string[] | undefined
    if (forkArgs.modifyAllowedTools !== undefined) {
      if (
        !Array.isArray(forkArgs.modifyAllowedTools) ||
        !forkArgs.modifyAllowedTools.every(
          (t: unknown) => typeof t === "string" && t.trim() !== "",
        )
      ) {
        throw {
          code: "VALIDATION_ERROR",
          message: "modifyAllowedTools must be an array of non-empty strings",
        };
      }
    }

    // 3. フォーク実行
    try {
      const result = await skillService.forkSkill(
        forkArgs as unknown as SkillForkOptions,
      );
      return { success: true, data: result };
    } catch (error) {
      log.error("[skillHandlers] skill:fork failed:", error);
      return { success: false, error: sanitizeErrorMessage(error) };
    }
  },
);
```

#### リクエスト/レスポンス型定義

| 方向     | 型                           | 説明                                       |
| -------- | ---------------------------- | ------------------------------------------ |
| Request  | `SkillForkOptions`           | Renderer → Main（safeInvoke 経由）         |
| Response | `IpcResult<SkillForkResult>` | Main → Renderer（成功: data, 失敗: error） |

### Task 3: Preload API 設計

#### channels.ts への定数追加

```typescript
// apps/desktop/src/preload/channels.ts

export const IPC_CHANNELS = {
  // ... 既存チャネル
  SKILL_FORK: "skill:fork",
} as const;

// ホワイトリストへの追加
export const ALLOWED_INVOKE_CHANNELS: string[] = [
  // ... 既存チャネル
  IPC_CHANNELS.SKILL_FORK,
];
```

#### skill-api.ts への forkSkill メソッド追加

```typescript
// apps/desktop/src/preload/skill-api.ts

/**
 * 既存スキルをフォークして新スキルを作成する
 * @param options フォークオプション
 * @returns フォーク結果
 */
forkSkill: (options: SkillForkOptions): Promise<IpcResult<SkillForkResult>> =>
  safeInvoke<IpcResult<SkillForkResult>>(IPC_CHANNELS.SKILL_FORK, options),
```

#### types.ts への型追加

```typescript
// apps/desktop/src/preload/skill-api.ts
// SkillAPI インターフェースに追加

forkSkill: (options: SkillForkOptions) => Promise<IpcResult<SkillForkResult>>;
```

### Task 4: 型定義設計

#### packages/shared/src/types/skill-fork.ts

```typescript
/**
 * スキルフォークオプション
 *
 * フォーク元スキルから新スキルを作成する際の設定。
 * 「コピー+メタデータ」方式を採用（technical-decisions.md §20.2）。
 */
export interface SkillForkOptions {
  /** フォーク元のスキル名（ディレクトリ名） */
  sourceSkill: string;

  /** 新スキル名（ディレクトリ名として使用される） */
  newName: string;

  /** 新スキルの説明文（省略時はフォーク元の説明を維持） */
  description?: string;

  /** agents/ ディレクトリをコピーするか */
  copyAgents: boolean;

  /** references/ ディレクトリをコピーするか */
  copyReferences: boolean;

  /** scripts/ ディレクトリをコピーするか */
  copyScripts: boolean;

  /** assets/ ディレクトリをコピーするか */
  copyAssets: boolean;

  /**
   * allowed-tools の上書き値
   * 省略時はフォーク元の設定を維持する
   */
  modifyAllowedTools?: string[];
}

/**
 * スキルフォーク結果
 */
export interface SkillForkResult {
  /** フォーク成功フラグ */
  success: boolean;

  /** 新スキルのディレクトリパス */
  newSkillPath: string;

  /** コピーされたファイルの相対パス一覧 */
  copiedFiles: string[];

  /** 警告メッセージ（非致命的な問題がある場合） */
  warnings?: string[];
}

/**
 * フォークメタデータ
 *
 * fork-metadata.json として新スキルディレクトリに保存される。
 * IPC境界ではISO 8601文字列として送受信する。
 */
export interface SkillForkMetadata {
  /** フォーク元スキル名 */
  forkedFrom: string;

  /**
   * フォーク日時
   * @format ISO 8601 — Main Process内部ではDateオブジェクト、IPC境界では.toISOString()で変換
   */
  forkedAt: string;

  /** フォーク元スキルの説明文（記録用） */
  originalDescription?: string;
}
```

#### packages/shared/src/types/index.ts への re-export

```typescript
// 既存の export に追加
export type {
  SkillForkOptions,
  SkillForkResult,
  SkillForkMetadata,
} from "./skill-fork";
```

### Task 5: フォークプロセスフロー設計

#### 正常系シーケンス

```
Renderer                  Preload                   Main Process              FileSystem
   |                         |                         |                         |
   |-- forkSkill(options) -->|                         |                         |
   |                         |-- safeInvoke ---------->|                         |
   |                         |   (skill:fork, options) |                         |
   |                         |                         |-- validateIpcSender() ->|
   |                         |                         |-- 3段バリデーション --->|
   |                         |                         |                         |
   |                         |                         |-- validatePath(src) --->|
   |                         |                         |-- validatePath(dest) -->|
   |                         |                         |-- exists(sourcePath) -->|
   |                         |                         |<-- true ---------------|
   |                         |                         |-- exists(destPath) ---->|
   |                         |                         |<-- false --------------|
   |                         |                         |-- mkdir(destPath) ----->|
   |                         |                         |<-- ok -----------------|
   |                         |                         |                         |
   |                         |                         |-- readFile(SKILL.md) -->|
   |                         |                         |<-- content ------------|
   |                         |                         |-- modifySkillMd() ----->|
   |                         |                         |-- writeFile(SKILL.md) ->|
   |                         |                         |                         |
   |                         |                         |-- copyDirectory(agents/)|
   |                         |                         |-- copyDirectory(refs/)  |
   |                         |                         |                         |
   |                         |                         |-- writeForkMetadata() ->|
   |                         |                         |<-- ok -----------------|
   |                         |                         |                         |
   |                         |<-- { success, data } ---|                         |
   |<-- IpcResult<SkillForkResult>|                         |                         |
```

#### 異常系フロー（ロールバック）

```
Main Process                                FileSystem
   |                                            |
   |-- mkdir(destPath) ----------------------->|
   |<-- ok ------------------------------------|
   |                                            |
   |-- readFile(SKILL.md) -------------------->|
   |<-- content -------------------------------|
   |-- writeFile(SKILL.md) ------------------->|
   |<-- ok ------------------------------------|
   |                                            |
   |-- copyDirectory(agents/) --- ERROR! ----->|
   |<-- IOException ---------------------------|
   |                                            |
   |== ROLLBACK ================================|
   |-- rm(destPath, { recursive: true }) ----->|
   |<-- ok ------------------------------------|
   |                                            |
   |-- return { success: false, error: ... }    |
```

#### SkillService への統合設計

```typescript
// apps/desktop/src/main/services/skill/SkillService.ts に追加

export class SkillService {
  private skillForker: SkillForker | null = null;

  // 初期化時に SkillForker を生成（Constructor Injection）
  constructor(
    private skillsDir: string,
    // ... 既存の依存関係
  ) {
    this.skillForker = new SkillForker(skillsDir);
  }

  /**
   * スキルをフォークする
   * IPC ハンドラから呼び出される
   */
  async forkSkill(options: SkillForkOptions): Promise<SkillForkResult> {
    if (!this.skillForker) {
      throw new Error("SkillForker is not initialized");
    }
    return this.skillForker.fork(options);
  }
}
```

**設計判断**: SkillForker は BrowserWindow 等の外部リソースを必要としないため、Constructor Injection で SkillService の初期化時に生成する。Setter Injection（P34パターン）は不要。

## 統合テスト連携【必須】

統合ポイント/契約を設計に反映する:

| 統合ポイント       | 契約定義                                                                    |
| ------------------ | --------------------------------------------------------------------------- |
| Renderer → Preload | `forkSkill(options: SkillForkOptions): Promise<IpcResult<SkillForkResult>>` |
| Preload → Main     | `safeInvoke(IPC_CHANNELS.SKILL_FORK, options)` → IPC handle                 |
| Main → FileSystem  | `SkillForker.fork()` → fs.mkdir, fs.readFile, fs.writeFile, fs.cp           |
| エラーハンドリング | `sanitizeErrorMessage()` でサニタイズ → `{ success: false, error: string }` |

## アーキテクチャ層別設計

| 層                   | 設計観点                                                      | 仕様参照先                                               |
| -------------------- | ------------------------------------------------------------- | -------------------------------------------------------- |
| バックエンド（Main） | SkillForker クラス、ロールバック、パス検証                    | `aiworkflow-requirements: architecture-overview.md`      |
| IPC通信              | skill:fork ハンドラ、P42準拠バリデーション                    | `aiworkflow-requirements: api-ipc-agent.md`              |
| Preload              | forkSkill メソッド、SKILL_FORK 定数                           | `aiworkflow-requirements: security-api-electron.md`      |
| Shared               | SkillForkOptions / SkillForkResult / SkillForkMetadata 型定義 | `aiworkflow-requirements: interfaces-agent-sdk-skill.md` |

## 多角的チェック観点（AIが判断）

| 観点               | 適用判断 | 仕様参照先                                          |
| ------------------ | -------- | --------------------------------------------------- |
| セキュリティ       | 適用     | `aiworkflow-requirements: security-electron-ipc.md` |
| アーキテクチャ     | 適用     | `aiworkflow-requirements: architecture-overview.md` |
| API設計            | 適用     | `aiworkflow-requirements: api-ipc-agent.md`         |
| エラーハンドリング | 適用     | `aiworkflow-requirements: error-handling.md`        |

**Electronデスクトップアプリ観点**:

| 層                   | 適用判断 | 仕様参照先                                          |
| -------------------- | -------- | --------------------------------------------------- |
| バックエンド（Main） | 適用     | `aiworkflow-requirements: architecture-overview.md` |
| IPC通信              | 適用     | `aiworkflow-requirements: api-ipc-agent.md`         |
| Preload/セキュリティ | 適用     | `aiworkflow-requirements: security-api-electron.md` |

## 成果物

| 成果物               | パス                                        | 説明                                               |
| -------------------- | ------------------------------------------- | -------------------------------------------------- |
| アーキテクチャ設計書 | `outputs/phase-2/architecture-design.md`    | SkillForker クラス設計                             |
| IPC契約設計書        | `outputs/phase-2/ipc-contract-design.md`    | skill:fork ハンドラ設計                            |
| 型定義設計書         | `outputs/phase-2/type-definition-design.md` | SkillForkOptions/SkillForkResult/SkillForkMetadata |
| シーケンス図         | `outputs/phase-2/sequence-diagram.md`       | フォークプロセスフロー                             |

## 完了条件

- [ ] SkillForker クラスのメソッド構成・依存関係・エラー処理戦略が定義されている
- [ ] skill:fork IPC ハンドラの P42 準拠バリデーションが設計されている
- [ ] Preload API（forkSkill メソッド、SKILL_FORK 定数）の設計が完了している
- [ ] SkillForkOptions / SkillForkResult / SkillForkMetadata の詳細型定義が完了している
- [ ] フォークプロセスのシーケンス図（正常系・異常系）が作成されている
- [ ] SkillService への統合設計（Constructor Injection）が定義されている
- [ ] ロールバック戦略が設計されている
- [ ] Phase 1 要件（FR-1〜FR-7、NFR-1〜NFR-4）との整合性が確認されている
- [ ] 統合ポイント/契約が設計に反映されている
- [ ] アーキテクチャ層別の設計が完了している
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. 参照資料の確認（Phase 1 成果物、specification.md §19、既存 skillHandlers.ts パターン）
2. Task 1: SkillForker クラス設計
3. Task 2: IPC 契約設計（skill:fork ハンドラ）
4. Task 3: Preload API 設計（channels.ts, skill-api.ts, types.ts）
5. Task 4: 型定義設計（packages/shared/src/types/skill-fork.ts）
6. Task 5: フォークプロセスフロー設計
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
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/TASK-9E-skill-fork --phase 2
```

## 次のPhase

Phase 3: 設計レビューゲート
