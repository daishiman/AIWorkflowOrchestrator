# Electron Main Process サービス / detail specification — Part 1: スキル管理基盤

> 親仕様書: [arch-electron-services.md](arch-electron-services.md)
> 分割元: [arch-electron-services-details.md](arch-electron-services-details.md)
> Part 2: [arch-electron-services-details-part2.md](arch-electron-services-details-part2.md)
> 役割: detail specification（スキル管理サービス基盤・Scanner・IPC API・SkillService/SkillCreatorService API）

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
> **未タスク仕様書配置先**: `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/`

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

### SkillFileWriter（TASK-SC-04-OUTPUT-PERSISTENCE 実装）

> **実装完了**: 2026-03-23（TASK-SC-04-OUTPUT-PERSISTENCE）
> **実装場所**: `apps/desktop/src/main/services/skill/SkillFileWriter.ts`

LLM 生成スキルコンテンツを `.claude/skills/{skillName}/` に永続化するサービスクラス。`RuntimeSkillCreatorFacade.execute()` から呼び出される。

| 責務 | 内容 |
| --- | --- |
| パストラバーサル防止 | P42準拠6層バリデーション（型チェック → 空文字列 → trim → `..` 禁止 → スラッシュ禁止 → 絶対パス禁止） |
| アトミック書き込み | 一時ファイルへの書き込み後にリネームでアトミック化 |
| ロールバック | 書き込み失敗時に一時ファイルを削除して整合性を維持 |
| ディレクトリ作成 | 必要に応じて `mkdir -p` 相当の再帰的ディレクトリ作成 |

**型定義**:

| 型名 | 定義場所 | 説明 |
| --- | --- | --- |
| `SkillGeneratedContent` | `packages/shared/src/types/skillCreator.ts` | LLM 生成コンテンツ（skillMd / agents / scripts / references の4フィールド） |

**関連ファイル**:

| ファイル | 役割 |
| --- | --- |
| `apps/desktop/src/main/services/skill/SkillFileWriter.ts` | 永続化本体サービス |
| `apps/desktop/src/main/services/skill/__tests__/SkillFileWriter.test.ts` | 28テスト（パストラバーサル・アトミック書き込み・ロールバック・skillMdバリデーション） |
| `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` | execute() から SkillFileWriter を呼び出す Facade |
| `packages/shared/src/types/skillCreator.ts` | SkillGeneratedContent 型の正本 |

**未タスク**: `UT-SC-04-001` — SkillFileWriter のインターフェース抽出（P61対策、LOW優先度）
