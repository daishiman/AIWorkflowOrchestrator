# Electron Main Process サービス / detail specification

> 親仕様書: [arch-electron-services.md](arch-electron-services.md)
> 役割: detail specification

## スキル管理サービス

### 概要

スキル管理バックエンドはElectronのMain Processで動作し、SKILL.mdファイルで定義されたスキルのスキャン・インポート・管理を担当する。Facadeパターンを採用し、外部からは単一のサービスインターフェースを提供する。

**実装場所**: `apps/desktop/src/main/services/skill/`

### コンポーネント構成

スキル管理バックエンドはMain Process（Electron）上で動作し、以下の階層構造を持つ。

| 階層 | コンポーネント     | 役割                           |
| ---- | ------------------ | ------------------------------ |
| L1   | SkillService       | Facade（外部エントリポイント） |
| L2   | SkillScanner       | スキル検出・パス検証           |
| L2   | SkillParser        | SKILL.md解析                   |
| L2   | SkillImportManager | インポート管理・永続化         |
| L2   | SkillAnalyzer      | スキル品質分析（TASK-9C）      |
| L2   | SkillImprover      | スキル改善適用（TASK-9C）      |
| L2   | PromptOptimizer    | プロンプト最適化（TASK-9C）    |
| L2   | SkillForker        | スキル派生コピー（TASK-9E）    |
| L2   | ScheduleStore      | スケジュール永続化（TASK-9G）  |
| L2   | SkillScheduler     | スケジュール実行制御（TASK-9G） |
| L1   | IPC Handlers       | Renderer通信                   |
| L2   | skillHandlers.ts   | IPCハンドラ実装                |

### ファイル構成

| ファイル                | 責務                              |
| ----------------------- | --------------------------------- |
| `SkillScanner.ts`       | ディレクトリスキャン・パス検証    |
| `SkillParser.ts`        | SKILL.md解析・構造化              |
| `SkillImportManager.ts` | インポート状態管理・永続化        |
| `SkillAnalyzer.ts`      | スキル静的・AI分析（TASK-9C）     |
| `SkillImprover.ts`      | 改善適用・バックアップ（TASK-9C） |
| `PromptOptimizer.ts`    | プロンプト最適化（TASK-9C）       |
| `SkillForker.ts`        | スキルフォーク処理（TASK-9E）     |
| `ScheduleStore.ts`      | スケジュール永続化（TASK-9G）     |
| `SkillScheduler.ts`     | cron/interval/once/event 実行制御（TASK-9G） |
| `SkillService.ts`       | Facadeサービス（外部API）         |
| `index.ts`              | エクスポート                      |
| `skillHandlers.ts`      | IPCハンドラ（ipc/配下）           |

### 型定義

| 型名                   | 定義場所                                 | 説明                         |
| ---------------------- | ---------------------------------------- | ---------------------------- |
| `Skill`                | `packages/shared/src/types/skill.ts`     | スキル情報                   |
| `SkillMetadata`        | `packages/shared/src/types/skill.ts`     | スキルメタデータ             |
| `ScannedSkillMetadata` | `apps/desktop/.../skill/SkillScanner.ts` | スキャン結果（readonly付き） |
| `SkillScannerOptions`  | `apps/desktop/.../skill/SkillScanner.ts` | ScannerコンストラクタOption  |
| `SkillSubResource`     | `packages/shared/src/types/skill.ts`     | サブリソース情報             |
| `SkillOtherFile`       | `packages/shared/src/types/skill.ts`     | その他ファイル情報           |
| `Anchor`               | `packages/shared/src/types/skill.ts`     | 知識のアンカー               |
| `EnvironmentConfig`    | `packages/shared/src/types/skill.ts`     | 環境設定                     |
| `SkillScanResult`      | `packages/shared/src/types/skill.ts`     | スキャン結果                 |
| `ImportResult`         | `packages/shared/src/types/skill.ts`     | インポート結果               |
| `RemoveResult`         | `packages/shared/src/types/skill.ts`     | 削除結果                     |
| `SkillForkOptions`     | `packages/shared/src/types/skill-fork.ts`| フォーク入力                 |
| `SkillForkResult`      | `packages/shared/src/types/skill-fork.ts`| フォーク結果                 |
| `SkillForkMetadata`    | `packages/shared/src/types/skill-fork.ts`| フォーク追跡メタデータ       |
| `ScheduledSkill`       | `packages/shared/src/types/skill-schedule.ts` | スケジュール本体         |
| `SkillSchedule`        | `packages/shared/src/types/skill-schedule.ts` | スケジュール設定         |
| `NotificationSettings` | `packages/shared/src/types/skill-schedule.ts` | 通知設定                 |
| `ScheduledRunResult`   | `packages/shared/src/types/skill-schedule.ts` | 実行履歴                 |

### SkillScanner（TASK-2A実装）

> **実装完了**: 2026-01-24（TASK-2A）
> **参照**: [interfaces-agent-sdk.md](interfaces-agent-sdk.md) の ScannedSkillMetadata/SkillScannerOptions

スキルディレクトリをスキャンしてメタデータを取得するサービスクラス。

#### スキャン対象ディレクトリ

| ディレクトリ            | readonly | 説明                               |
| ----------------------- | -------- | ---------------------------------- |
| `~/.aiworkflow/skills/` | `false`  | 編集可能なカスタムスキル           |
| `~/.claude/skills/`     | `true`   | 読み取り専用のClaude CLI標準スキル |

#### SkillScanner API

| メソッド          | 引数 | 戻り値                            | 説明                      |
| ----------------- | ---- | --------------------------------- | ------------------------- |
| `scanAll()`       | -    | `Promise<ScannedSkillMetadata[]>` | 全スキルをスキャン        |
| `scanDirectory()` | -    | `Promise<string[]>`               | [Legacy] ディレクトリ一覧 |

#### サブディレクトリ定数

スキャン対象となるサブディレクトリは以下の6種類。定数名は `SUB_DIRECTORIES`。

| サブディレクトリ | 説明                 |
| ---------------- | -------------------- |
| agents           | エージェント定義     |
| references       | 参照ドキュメント     |
| scripts          | スクリプトファイル   |
| assets           | アセットファイル     |
| schemas          | JSONスキーマ         |
| indexes          | インデックスファイル |

#### その他ファイル定数

スキャン対象となるその他ファイルは以下の3種類。定数名は `OTHER_FILES`。

| ファイル名   | タイプ  |
| ------------ | ------- |
| EVALS.json   | evals   |
| LOGS.md      | logs    |
| package.json | package |

#### セキュリティ対策

| 対策                     | 実装                                       |
| ------------------------ | ------------------------------------------ |
| パストラバーサル防止     | `..` `/` を含むディレクトリ名を拒否        |
| シンボリックリンク検証   | ベースパス外を指すシンボリックリンクを拒否 |
| 隠しディレクトリスキップ | `.` で始まるディレクトリを除外             |

#### データフロー

SkillScanner.scanAll() 実行時の処理フローを以下に示す。

| ステップ | 処理                    | 詳細                                               | 並列処理 |
| -------- | ----------------------- | -------------------------------------------------- | -------- |
| 1        | ensureAiworkflowDir()   | ~/.aiworkflow/skills/ ディレクトリを確保           | -        |
| 2a       | scanSkillDirectory()    | aiworkflowディレクトリをスキャン（readonly=false） | 並列     |
| 2b       | scanSkillDirectory()    | claudeディレクトリをスキャン（readonly=true）      | 並列     |
| 2-1      | fs.readdir()            | ディレクトリ内容を読み取り                         | -        |
| 2-2      | セキュリティ検証        | パストラバーサル・シンボリックリンク検証           | -        |
| 2-3      | parseSkill()            | スキル解析を実行                                   | -        |
| 2-3-1    | fs.readFile(SKILL.md)   | SKILL.mdファイルを読み込み                         | -        |
| 2-3-2    | parseFrontmatter()      | フロントマター解析                                 | -        |
| 2-3-3a   | scanAllSubDirectories() | 全サブディレクトリをスキャン                       | 並列     |
| 2-3-3b   | scanOtherFiles()        | その他ファイルをスキャン                           | 並列     |

#### E2Eテストフィクスチャ（TASK-8C-E実装）

> **実装完了**: 2026-02-01（TASK-8C-E）
> **詳細仕様**: [quality-e2e-testing.md](./quality-e2e-testing.md)

SkillScannerの動作を検証するE2Eテスト用フィクスチャ。後続タスク（TASK-8C-B/C/D）が共通利用する。

| フィクスチャ  | 内容                                 | scanAll()結果  |
| ------------- | ------------------------------------ | -------------- |
| test-skill    | 完全構成（SKILL.md + agents + refs） | 含まれる       |
| another-skill | 最小構成（SKILL.md のみ）            | 含まれる       |
| invalid-skill | 無効（SKILL.md なし）                | スキップされる |

**配置先**: `apps/desktop/src/__tests__/__fixtures__/skills/`
**検証テスト**: 29テストケース全PASS（`skills.fixture.test.ts`）

#### 将来改善ロードマップ

> **記録日**: 2026-01-24（TASK-2A Phase 12）
> **未タスク仕様書配置先**: `docs/30-workflows/unassigned-task/`

以下の改善は未タスク仕様書として正式に文書化済み。全て優先度「低」。

| 改善項目         | タスクID                         | 概要                           | 提案API                                              |
| ---------------- | -------------------------------- | ------------------------------ | ---------------------------------------------------- |
| キャッシュ機能   | task-perf-skillscanner-cache-001 | TTLベースのメモリキャッシュ    | `cacheTtlMs`, `invalidateCache()`                    |
| 増分スキャン     | task-perf-skillscanner-incr-001  | chokidarによるファイル変更監視 | `startWatching()`, `stopWatching()`, `skill:changed` |
| ページネーション | task-perf-skillscanner-page-001  | 大量スキル（1000+）対応        | `scanAllPaginated()`, `getSkillCount()`              |

**想定追加型**（実装時に `packages/shared/src/types/skill.ts` へ追加）

**SkillScannerOptions型（キャッシュ機能用）**

| プロパティ | 型     | 必須 | デフォルト    | 説明                         |
| ---------- | ------ | ---- | ------------- | ---------------------------- |
| cacheTtlMs | number | No   | 300000（5分） | キャッシュ有効期間（ミリ秒） |

**SkillChangeEvent型（増分スキャン用）**

| プロパティ | 型                               | 必須 | 説明                       |
| ---------- | -------------------------------- | ---- | -------------------------- |
| type       | "added" / "modified" / "removed" | Yes  | 変更種別                   |
| skillPath  | string                           | Yes  | スキルのパス               |
| skillName  | string                           | Yes  | スキル名                   |
| timestamp  | number                           | Yes  | タイムスタンプ（Unix時間） |

**PaginatedSkillResult型（ページネーション用）**

| プロパティ | 型                     | 必須 | 説明                   |
| ---------- | ---------------------- | ---- | ---------------------- |
| items      | ScannedSkillMetadata[] | Yes  | 現在ページのスキル一覧 |
| total      | number                 | Yes  | 全スキル数             |
| page       | number                 | Yes  | 現在ページ番号         |
| pageSize   | number                 | Yes  | 1ページあたりの件数    |
| hasMore    | boolean                | Yes  | 次ページが存在するか   |

### IPC APIチャネル

| チャネル               | 引数                 | 戻り値          | 説明               |
| ---------------------- | -------------------- | --------------- | ------------------ |
| `skill:list`           | `{ forceRefresh?: boolean }` | `IpcResult<SkillMetadata[]>` | 利用可能スキル取得 |
| `skill:scan`           | なし                 | `IpcResult<SkillMetadata[]>` | スキル強制再スキャン |
| `skill:getImported`    | なし                 | `IpcResult<Skill[]>` | インポート済み取得 |
| `skill:import`         | `skillName: string`  | `ImportedSkill` | スキルインポート（ハンドラー内で `[skillName]` に変換、UT-FIX-SKILL-IMPORT-RETURN-TYPE-001で戻り値型修正） |
| `skill:remove`         | `skillName: string`  | `RemoveResult`  | インポート解除     |
| `skill:get-detail`     | `{ skillId: string }`    | `IpcResult<Skill>` | スキル詳細取得     |
| `skill:fork`           | `SkillForkOptions`   | `IpcResult<SkillForkResult>` | スキルフォーク（TASK-9E） |
| `skill:schedule:list`  | なし                 | `IpcResult<ScheduledSkill[]>` | スケジュール一覧取得 |
| `skill:schedule:add`   | `Omit<ScheduledSkill, "id" \| "runHistory">` | `IpcResult<ScheduledSkill>` | スケジュール追加 |
| `skill:schedule:update`| `{ id: string; updates: Partial<ScheduledSkill> }` | `IpcResult<void>` | スケジュール更新 |
| `skill:schedule:delete`| `{ id: string }`     | `IpcResult<void>` | スケジュール削除 |
| `skill:schedule:toggle`| `{ id: string }`     | `IpcResult<ScheduledSkill \| undefined>` | 有効/無効切替 |

### データフロー

スキル管理のデータフローは以下の3ステップで構成される。

| ステップ | 送信元       | 経由         | 送信先                     |
| -------- | ------------ | ------------ | -------------------------- |
| 1        | Renderer     | IPC Channel  | Main Process               |
| 2        | Main Process | SkillService | Scanner / Parser / Manager |
| 3        | 処理結果     | IPC Channel  | Renderer                   |

### SkillService（Facade）API

| メソッド              | 引数                 | 戻り値                   | 説明               |
| --------------------- | -------------------- | ------------------------ | ------------------ |
| `scanAvailableSkills` | `forceRefresh?: boolean`   | `Promise<SkillScanResult>`       | スキルスキャン（`skills` + `errors` + `warnings`）     |
| `getImportedSkills`   | -                    | `Promise<Skill[]>`       | インポート済み取得 |
| `importSkills`        | `skillNames: SkillName[]` | `Promise<ImportResult>`  | インポート（Service内部API） |
| `removeSkill`         | `skillName: string`  | `Promise<RemoveResult>`  | 削除               |
| `getSkillById`        | `skillId: string`    | `Promise<Skill \| null>` | 詳細取得           |
| `clearCache`          | -                    | `void`                   | キャッシュクリア   |
| `executeSkill`        | `skillId: string, params?: ExecuteParams` | `Promise<SkillExecutionResponse>` | スキル実行（SkillExecutorに委譲） |
| `setSkillExecutor`    | `executor: SkillExecutor` | `void` | SkillExecutorを設定（DI） |

### SkillCreatorService（Facade）API

> **実装場所**: `apps/desktop/src/main/services/skill/`

SkillCreatorService はスキル生成・改善・運用支援を統合する Facade として実装される。

| メソッド | 引数 | 戻り値 | 説明 |
| --- | --- | --- | --- |
| `detectMode` | `request: string` | `Promise<SkillCreatorMode>` | 要求文から作成モード判定 |
| `createSkill` | `options: CreateSkillOptions` | `Promise<string>` | スキル新規作成 |
| `executeTasks` | `options: ExecuteTasksOptions` | `Promise<ExecutionReport>` | タスク仕様の実行 |
| `validateSkill` | `skillDir: string` | `Promise<boolean>` | スキル検証 |
| `validateWithSchema` | `schemaName: string, data: unknown` | `Promise<boolean>` | スキーマ検証 |
| `improveSkill` | `skillName: string, autoApply: boolean` | `Promise<unknown>` | 改善提案生成/適用 |
| `forkSkill` | `sourceName: string, newName: string, options: object` | `Promise<string>` | フォーク作成 |
| `shareSkill` | `action: string, target: string, skillName: string` | `Promise<string>` | エクスポート共有 |
| `scheduleSkill` | `skillName: string, schedule: object` | `Promise<void>` | スケジュール設定 |
| `debugSkill` | `skillName: string, options: object` | `Promise<unknown>` | デバッグ実行 |
| `generateDocs` | `skillName: string, format: string, sections: string[]` | `Promise<string>` | ドキュメント生成 |
| `getStats` | `skillName: string, period: string` | `Promise<unknown>` | 使用統計取得 |

**サブコンポーネント（分離実装）**:

| ファイル | 責務 |
| --- | --- |
| `HearingFacilitator.ts` | 要件ヒアリング補助 |
| `TaskGenerator.ts` | タスク仕様生成 |
| `CodeGenerator.ts` | コード生成補助 |
| `ApiIntegrator.ts` | 外部API統合補助 |
| `SkillValidator.ts` | 検証処理補助 |

### SkillForker（TASK-9E）

`SkillForker` は Skill API ドメインでのフォーク実体処理を担当する。`SkillCreatorService.forkSkill()`（`skill-creator:fork`）とは別責務であり、`skill:fork` は既存スキルの派生コピー処理に特化する。

| メソッド | 引数 | 戻り値 | 説明 |
| --- | --- | --- | --- |
| `fork` | `options: SkillForkOptions` | `Promise<SkillForkResult>` | SKILL.md更新、選択サブディレクトリコピー、metadata書き込み、失敗時ロールバック |
| `modifySkillMd` | `content: string, options: SkillForkOptions` | `string` | frontmatter の `name` / `description` / `allowed-tools` / `forked-from` を更新 |
| `validatePath` | `name: string` | `void` | `path.relative` ベースの境界検証（`/skills` と `/skills-evil` の prefix 衝突回避） |

**関連ファイル**:

| ファイル | 役割 |
| --- | --- |
| `apps/desktop/src/main/services/skill/SkillForker.ts` | フォーク本体サービス |
| `apps/desktop/src/main/ipc/skillHandlers.ts` | `skill:fork` IPCハンドラー（sender検証 + 入力検証 + サービス呼び出し） |
| `apps/desktop/src/preload/skill-api.ts` | `forkSkill(options)` の Preload API |
| `packages/shared/src/types/skill-fork.ts` | 入出力/メタデータ型の正本 |

### RuntimeResolver（runtime routing 共通化 — UT-IMP-SKILL-AGENT-RUNTIME-ROUTING-INTEGRATION-CLOSURE-001）

> **実装完了**: 2026-03-15
> **実装場所**: `apps/desktop/src/main/services/runtime/RuntimeResolver.ts`

`RuntimeResolver` は `skill:execute` / `agent:start` の runtime 判定を共通化するサービス。`ChatEditRuntimeResolver`（`services/chat-edit/RuntimeResolver.ts`）から LLMAdapter 依存を除去し、認証判定のみに特化した共通版。

#### コンポーネント構成

| コンポーネント | ファイル | 責務 |
| --- | --- | --- |
| `RuntimeResolver` | `services/runtime/RuntimeResolver.ts` | 認証状態に基づく `integrated` / `handoff` 判定 |
| `ChatEditRuntimeResolver` | `services/chat-edit/RuntimeResolver.ts` | chat-edit 用の `RuntimeResolver`（LLMAdapter 生成含む） |

#### RuntimeResolution 型

```typescript
export type RuntimeResolution =
  | { type: "integrated" }
  | { type: "handoff"; reason: string };
```

- `integrated`: API キー有効 → 既存実行フロー続行
- `handoff`: subscription モードまたは API キー未設定 → `HandoffGuidance` 応答を返す

#### RuntimeResolver API

| メソッド | シグネチャ | 説明 |
| --- | --- | --- |
| `resolve` | `() => Promise<RuntimeResolution>` | authMode と API キー有無で判定 |

#### 判定ロジック

| 条件 | 結果 | reason |
| --- | --- | --- |
| `authMode === "subscription"` | `handoff` | `"subscription mode: use Claude Code CLI"` |
| `hasKey() === false` | `handoff` | `"API key not configured"` |
| `getKey() === null` | `handoff` | `"API key unavailable"` |
| 上記以外 | `integrated` | — |

#### DI と Composition Root

`ipc/index.ts` の `registerAllIpcHandlers()` で `new RuntimeResolver(authKeyService, authModeService)` を1回生成し、`registerAgentExecutionHandlers` / `registerSkillHandlers` / chat-edit ハンドラの3箇所へ注入する（P5 二重登録防止）。chat-edit は `ChatEditRuntimeResolver` alias で別 import。

#### Handoff 応答パターン

| チャンネル | handoff 応答形式 | 備考 |
| --- | --- | --- |
| `skill:execute` | `{ success: true, data: { success: false, handoff: true, guidance, error } }` | IPC envelope 維持 |
| `agent:start` | `{ success: false, handoff: true, guidance, error }` | 直接応答 |

#### テスト

| テストファイル | テスト数 | 検証内容 |
| --- | --- | --- |
| `services/runtime/__tests__/RuntimeResolver.test.ts` | 8 | subscription/apiKey判定 |
| `ipc/__tests__/skillHandlers.runtime.test.ts` | 3 | skill handoff 分岐 |
| `ipc/__tests__/agentHandlers.runtime.test.ts` | 2 | agent handoff 分岐 |

#### 苦戦箇所

| 苦戦箇所 | 再発条件 | 対処 |
| --- | --- | --- |
| ChatEditRuntimeResolver との alias import 衝突 | 同名クラスを異なるパスから import | `import { RuntimeResolver as ChatEditRuntimeResolver }` で alias 分離 |
| Composition Root でのサービススコープ制限（P60） | authModeService が track() 内スコープに閉じる | 共通消費者の外側スコープで生成 |
| optional parameter による後方互換維持 | 既存テスト・呼び出し元の一括修正が必要 | `runtimeResolver?` で既存動作を保証 |

#### 関連タスク

| タスクID | 概要 | ステータス |
| --- | --- | --- |
| UT-IMP-SKILL-AGENT-RUNTIME-ROUTING-INTEGRATION-CLOSURE-001 | Skill/Agent runtime routing 統合クロージャ | 完了（2026-03-15） |

### SkillScheduler / ScheduleStore（TASK-9G）

スキルスケジュール実行は、Facade の `SkillService` とは独立した専用サービスで構成する。

| コンポーネント | 責務 | 実装ファイル |
| --- | --- | --- |
| `ScheduleStore` | `electron-store` への CRUD 永続化、実行履歴最大100件管理、復元時バリデーション（P19） | `apps/desktop/src/main/services/skill/ScheduleStore.ts` |
| `SkillScheduler` | cron / interval / once / event のジョブ登録・停止、次回実行時刻計算、実行結果記録 | `apps/desktop/src/main/services/skill/SkillScheduler.ts` |
| `registerSkillScheduleHandlers` | 5チャネルの IPC 境界（sender 検証 + P42 バリデーション + エラー正規化） | `apps/desktop/src/main/ipc/skillHandlers.ts` |

#### 初期化配線（Main Process）

`registerAllIpcHandlers`（`apps/desktop/src/main/ipc/index.ts`）で以下の順に初期化する。

1. `new ScheduleStore()`
2. `new SkillScheduler(scheduleStore, schedulerExecutorAdapter)`
3. `skillScheduler.initialize()`（非同期・非ブロッキング）
4. `registerSkillScheduleHandlers(mainWindow, skillScheduler, scheduleStore)`

#### SchedulerSkillExecutor アダプタ

`SkillScheduler` は `SchedulerSkillExecutor` インターフェースに依存し、`skillService.executeSkill()` を呼び出すアダプタで接続する。

| 観点 | 設計方針 |
| --- | --- |
| 依存関係 | Scheduler は SkillService 実装詳細を知らない（DI） |
| テスタビリティ | `SchedulerSkillExecutor` をモック可能 |
| 責務分離 | 実行制御（Scheduler）とスキル実行本体（SkillService）を分離 |

### SkillService と SkillExecutor の統合（TASK-FIX-7-1）

> **実装完了**: 2026-02-11（TASK-FIX-7-1）

SkillService は Facade パターンで SkillExecutor への実行委譲を行う。

#### Setter Injection パターン

SkillExecutor は `registerSkillHandlers()` 内で生成され、`setSkillExecutor()` で SkillService に注入される。

| ステップ | 処理 | ファイル |
|----------|------|----------|
| 1 | `registerSkillHandlers(mainWindow, skillService, authKeyService)` 呼び出し | `main/ipc/index.ts` |
| 2 | `new SkillExecutor(mainWindow, undefined, authKeyService)` でインスタンス生成 | `skillHandlers.ts` |
| 3 | `skillService.setSkillExecutor(executor)` で注入 | `skillHandlers.ts` |
| 4 | `skillService.executeSkill()` が内部で `skillExecutor.execute()` を呼び出し | `SkillService.ts` |

#### 設計根拠

| 観点 | 説明 |
|------|------|
| 遅延初期化 | SkillExecutor は mainWindow を必要とするため、ハンドラー登録時に生成 |
| 単一責務 | SkillService はスキル管理、SkillExecutor は実行に責務を分離 |
| テスタビリティ | SkillExecutor をモックに差し替え可能 |

### Runtime routing / handoff DI 統合（UT-IMP-SKILL-AGENT-RUNTIME-ROUTING-INTEGRATION-CLOSURE-001）

`skill:execute` と `agent:start` は `RuntimeResolver` の判定結果で `integrated` / `handoff` を分岐する。Main 側では resolver と handoff builder を同一初期化タイミングで注入し、Skill/Agent の両経路で契約を統一する。

#### Composition root 配線

| ステップ | 処理 | 実装ファイル |
| --- | --- | --- |
| 1 | `new RuntimeResolver(authModeService, authKeyService)` を生成 | `main/ipc/index.ts` |
| 2 | `new TerminalHandoffBuilder()` を生成 | `main/ipc/index.ts` |
| 3 | `registerSkillHandlers(mainWindow, skillService, authKeyService, runtimeResolver, handoffBuilder)` を登録 | `main/ipc/index.ts` |
| 4 | `registerAgentExecutionHandlers(mainWindow, authKeyService, runtimeResolver, handoffBuilder)` を登録 | `main/ipc/index.ts` |

#### Runtime 分岐契約

| チャネル | integrated 条件 | handoff 条件 | handoff 応答 |
| --- | --- | --- | --- |
| `skill:execute` | `authMode=api-key` かつ API key 有効 | `authMode=subscription` または API key 未設定 | IPC envelope 内で `handoff=true` と `guidance` を返す |
| `agent:start` | `authMode=api-key` かつ API key 有効 | `authMode=subscription` または API key 未設定 | `success=false, handoff=true, guidance` を返す |

#### セキュリティ境界

| 項目 | 方針 |
| --- | --- |
| 秘匿情報 | `TerminalHandoffBuilder` は API key を返さず、`terminalCommand/contextSummary/reason` のみ返却 |
| 既存契約維持 | `skill:execute` は `safeInvokeUnwrap` 互換の IPC envelope を維持 |
| Preload 契約 | Agent 実行は `AGENT_EXECUTION_*` チャネルへ統一し、旧 `agent:*` との差分を吸収 |

### キャッシュ機構

- スキャン結果はメモリにキャッシュ（TTLベース無効化）
- `clearCache()`で手動クリア可能
- アプリ再起動でキャッシュはクリア

### 永続化

- インポート状態は`electron-store`で永続化
- アプリ再起動後もインポート状態を維持
- ストレージキー: `importedSkillIds`

### SkillImportManager 永続化実装詳細（TASK-FIX-4-2）

> **実装完了**: 2026-02-07（TASK-FIX-4-2）
> **参照**: [error-handling.md](./error-handling.md) 外部ストレージフォールバックパターン

#### 型バリデーション関数

外部ストレージからの値は型安全性が保証されないため、バリデーション関数で検証する。

| 入力値 | 出力 | 処理 |
|--------|------|------|
| null/undefined | `[]` | 空配列を返す |
| 非配列値 | `[]` | 空配列を返す + WARNログ |
| 混合配列 | フィルタ済み配列 | 非string要素を除外 + WARNログ |
| 正常配列（string[]） | そのまま | そのまま返す |

**関数シグネチャ**: `validateStoredSkillIds(value: unknown): string[]`

#### SkillStoreインターフェース

electron-storeとの型安全な連携のための抽象化インターフェース。

| メソッド | 引数 | 戻り値 | 説明 |
|----------|------|--------|------|
| `get` | `key: string, defaultValue: string[]` | `unknown` | 外部ストレージからの取得（型保証なし） |
| `set` | `key: string, value: string[]` | `void` | ストレージへの保存 |
| `path` | - | `string \| undefined` | ストレージファイルパス（任意） |

**重要**: `get`メソッドの戻り値は`unknown`型とし、呼び出し側でバリデーションを行う。

#### デバッグフラグ

開発環境でのデバッグ出力制御。

| オプション | 型 | デフォルト | 説明 |
|------------|-----|-----------|------|
| `debug` | `boolean` | `process.env.NODE_ENV === 'development'` | デバッグログ出力フラグ |

**コンストラクタ**: `constructor(store: SkillStore, options?: { debug?: boolean })`

#### テストファイル構成

| ファイル | テスト内容 | ケース数 |
|----------|-----------|----------|
| `SkillImportManager.persistence.test.ts` | ストア保存・復元、再起動シミュレーション | 永続化 |
| `SkillImportManager.error.test.ts` | 異常系、例外処理、フォールバック | エラー |
| `SkillImportManager.boundary.test.ts` | null、空配列、最大長、Unicode | 境界値 |
