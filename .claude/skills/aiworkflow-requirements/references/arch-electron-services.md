# Electron Main Process サービス

> 本ドキュメントは統合システム設計仕様書の一部です。
> 管理: .claude/skills/aiworkflow-requirements/
>
> **親ドキュメント**: [architecture-patterns.md](./architecture-patterns.md)

## 変更履歴

| バージョン | 日付       | 変更内容                                                                                    |
| ---------- | ---------- | ------------------------------------------------------------------------------------------- |
| 6.37.0     | 2026-02-28 | TASK-9E反映: `SkillForker` サービスをスキル管理コンポーネントへ追加。`skill:fork` IPC契約、`SkillForkOptions/Result/Metadata` 型、Path境界検証（prefix一致すり抜け防止）を仕様化 |
| 6.36.0     | 2026-02-27 | TASK-9G反映: SkillScheduler / ScheduleStore セクション追加。Main IPC 初期化配線（`ipc/index.ts`）と SchedulerSkillExecutor アダプタ構成、5チャネルの責務分離を追記 |
| 6.35.0     | 2026-02-26 | TASK-9B反映: SkillCreatorService（Facade）APIを12メソッドで明文化し、サブコンポーネント（HearingFacilitator / TaskGenerator / CodeGenerator / ApiIntegrator / SkillValidator）の責務を追加 |
| 6.34.0     | 2026-02-21 | UT-FIX-SKILL-IMPORT-INTERFACE-001反映: `skill:import` IPC引数を `skillName: string` に更新（ハンドラー内で `[skillName]` 配列化）。UT-FIX-SKILL-IMPORT-RETURN-TYPE-001反映: 戻り値を `ImportedSkill` に更新 |
| 6.33.0     | 2026-02-20 | UT-FIX-SKILL-REMOVE-INTERFACE-001反映: `skill:remove` IPC引数を `skillName: string` に更新 |
| 6.32.0     | 2026-02-07 | TASK-FIX-4-2完了: SkillImportManager永続化実装詳細セクション追加（型バリデーション・SkillStoreインターフェース・デバッグフラグ・テストファイル構成） |
| 6.31.0     | 2026-02-01 | TASK-8C-E完了: E2Eテストフィクスチャセクション追加（3フィクスチャ仕様・検証テスト29ケース） |
| 6.30.0     | 2026-01-26 | 仕様ガイドライン準拠: コード例を表形式・文章に変換                                          |

---

## Environment Backend サービス

### 概要

Environment BackendはElectronのMain Processで動作し、エージェント出力からHTMLコードブロックを抽出し、XSS対策のサニタイズを行い、安全なプレビュー機能を提供する。Facadeパターンを採用し、外部からは単一のサービスインターフェースを提供する。

**実装場所**: `apps/desktop/src/main/services/environment/`

### コンポーネント構成

Environment BackendはMain Process（Electron）上で動作し、以下の階層構造を持つ。

| 階層 | コンポーネント     | 役割                           |
| ---- | ------------------ | ------------------------------ |
| L1   | EnvironmentService | Facade（外部エントリポイント） |
| L2   | ContentExtractor   | コードブロック抽出             |
| L2   | ContentSanitizer   | HTMLサニタイズ（DOMPurify）    |
| L2   | TempFileManager    | 一時ファイル管理               |
| L1   | IPC Handlers       | Renderer通信                   |
| L2   | agentHandlers.ts   | IPCハンドラ実装                |

### ファイル構成

| ファイル                | 責務                           |
| ----------------------- | ------------------------------ |
| `ContentExtractor.ts`   | Markdownからコードブロック抽出 |
| `ContentSanitizer.ts`   | DOMPurifyによるXSS対策         |
| `TempFileManager.ts`    | 一時ファイル作成・管理・削除   |
| `EnvironmentService.ts` | Facadeサービス（外部API）      |
| `index.ts`              | エクスポート                   |
| `agentHandlers.ts`      | IPCハンドラ（ipc/配下）        |

### 型定義

| 型名               | 定義場所                             | 説明                         |
| ------------------ | ------------------------------------ | ---------------------------- |
| `ContentType`      | `packages/shared/src/types/agent.ts` | サポートするコンテンツタイプ |
| `ExtractedContent` | `packages/shared/src/types/agent.ts` | 抽出されたコンテンツ         |
| `SanitizedContent` | `packages/shared/src/types/agent.ts` | サニタイズ済みコンテンツ     |
| `PreviewContent`   | `packages/shared/src/types/agent.ts` | プレビュー用コンテンツ       |

### IPC APIチャネル

| チャネル                | 引数                  | 戻り値                   | 説明                                   |
| ----------------------- | --------------------- | ------------------------ | -------------------------------------- |
| `agent:extract-content` | `text: string`        | `PreviewContent`         | テキストからコンテンツ抽出・サニタイズ |
| `agent:get-preview`     | `executionId: string` | `PreviewContent \| null` | プレビュー用コンテンツ取得             |
| `agent:cleanup-temp`    | なし                  | `void`                   | 一時ファイルクリーンアップ             |

### セキュリティ対策

**XSS防止（ContentSanitizer）**:

- scriptタグ除去
- iframeタグ除去
- イベントハンドラ除去（onclick, onerror, onload等）
- javascript:プロトコル除去
- data:プロトコル制限

**ファイルセキュリティ（TempFileManager）**:

- ファイルパーミッション: 0o600（オーナーのみ）
- UUIDベースファイル名（推測不可）
- 自動クリーンアップ機構

---

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
| 1 | `registerSkillHandlers(mainWindow, skillService)` 呼び出し | `main/ipc/index.ts` |
| 2 | `new SkillExecutor(mainWindow)` でインスタンス生成 | `skillHandlers.ts` |
| 3 | `skillService.setSkillExecutor(executor)` で注入 | `skillHandlers.ts` |
| 4 | `skillService.executeSkill()` が内部で `skillExecutor.execute()` を呼び出し | `SkillService.ts` |

#### 設計根拠

| 観点 | 説明 |
|------|------|
| 遅延初期化 | SkillExecutor は mainWindow を必要とするため、ハンドラー登録時に生成 |
| 単一責務 | SkillService はスキル管理、SkillExecutor は実行に責務を分離 |
| テスタビリティ | SkillExecutor をモックに差し替え可能 |

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

### PermissionResolver（TASK-3-1-C実装）

> **実装完了**: 2026-01-25（TASK-3-1-C）
> **参照**: [interfaces-agent-sdk.md](interfaces-agent-sdk.md) の PermissionRequest/PermissionResponse型
> **実装ガイド**: [permission-request-hook.md](../../../docs/guides/permission-request-hook.md)

権限リクエストの非同期待機と解決を管理するクラス。Claude Agent SDK の PermissionRequest Hook を実装。

#### コンポーネント構成

PermissionResolverはMain Process（Electron）上で動作し、以下の階層構造を持つ。

**SkillExecutor（スキル実行エンジン）**

| メソッド                   | 説明                        |
| -------------------------- | --------------------------- |
| sendPermissionRequest()    | IPC経由で権限リクエスト送信 |
| handlePermissionResponse() | IPC経由で権限応答受信       |
| sanitizeArgs()             | 機密情報サニタイズ          |
| getPermissionReason()      | 理由文生成                  |

**PermissionResolver（権限解決管理）**

| メソッド            | 説明           |
| ------------------- | -------------- |
| waitForResponse()   | Promise待機    |
| resolveRequest()    | 応答解決       |
| cancelRequest()     | 個別キャンセル |
| cancelAllRequests() | 全キャンセル   |

#### PermissionResolver API

| メソッド            | 引数                                 | 戻り値                        | 説明           |
| ------------------- | ------------------------------------ | ----------------------------- | -------------- |
| `waitForResponse`   | `requestId, signal?, timeoutMs?`     | `Promise<PermissionResponse>` | 権限応答を待機 |
| `resolveRequest`    | `response: PermissionResponse`       | `void`                        | 権限応答を解決 |
| `cancelRequest`     | `requestId: string, reason?: string` | `void`                        | 個別キャンセル |
| `cancelAllRequests` | `reason?: string`                    | `void`                        | 全キャンセル   |

#### IPC チャネル

| チャネル                    | 方向            | データ型             | 説明           |
| --------------------------- | --------------- | -------------------- | -------------- |
| `skill:permission:request`  | Main → Renderer | `PermissionRequest`  | 権限リクエスト |
| `skill:permission:response` | Renderer → Main | `PermissionResponse` | 権限応答       |

#### 機密キーサニタイズ（14パターン）

機密情報を含むキーは以下の14パターンで検出され、サニタイズされる。定数名は `SENSITIVE_KEY_PATTERNS`。

| No. | パターン      | 説明                        |
| --- | ------------- | --------------------------- |
| 1   | password      | パスワード                  |
| 2   | passwd        | パスワード（短縮形）        |
| 3   | pwd           | パスワード（省略形）        |
| 4   | secret        | シークレット                |
| 5   | token         | トークン                    |
| 6   | bearer        | Bearerトークン              |
| 7   | key           | キー                        |
| 8   | apikey        | APIキー（連結形）           |
| 9   | api_key       | APIキー（アンダースコア形） |
| 10  | credential    | 認証情報                    |
| 11  | auth          | 認証                        |
| 12  | access_token  | アクセストークン            |
| 13  | refresh_token | リフレッシュトークン        |
| 14  | private_key   | 秘密鍵                      |

#### 定数

| 定数                            | 値    | 説明                   |
| ------------------------------- | ----- | ---------------------- |
| `PERMISSION_REQUEST_TIMEOUT_MS` | 30000 | タイムアウト（ミリ秒） |
| `MAX_ARG_LENGTH`                | 500   | 引数表示最大長         |

#### データフロー

スキル実行時の権限リクエスト処理フローを以下に示す。

**フェーズ1: Main Process（権限リクエスト送信）**

| ステップ | 処理                         | 詳細                                  |
| -------- | ---------------------------- | ------------------------------------- |
| 1-1      | SkillExecutor.executeSkill() | スキル実行開始                        |
| 1-2      | PermissionRequest Hook発火   | 権限確認が必要な操作を検出            |
| 1-3      | sendPermissionRequest()      | 権限リクエスト送信処理開始            |
| 1-3a     | sanitizeArgs()               | 機密情報を除去                        |
| 1-3b     | getPermissionReason()        | 理由文を生成                          |
| 1-3c     | IPC送信                      | skill:permission:request チャネル経由 |

**フェーズ2: Renderer Process（ユーザー応答）**

| ステップ | 処理                 | 詳細                                   |
| -------- | -------------------- | -------------------------------------- |
| 2-1      | PermissionDialog表示 | 権限確認ダイアログを表示               |
| 2-2      | ユーザー選択         | 許可または拒否を選択                   |
| 2-3      | IPC送信              | skill:permission:response チャネル経由 |

**フェーズ3: Main Process（応答処理）**

| ステップ | 処理                                | 詳細                                   |
| -------- | ----------------------------------- | -------------------------------------- |
| 3-1      | handlePermissionResponse()          | 権限応答を受信                         |
| 3-2      | PermissionResolver.resolveRequest() | 待機中のPromiseを解決                  |
| 3-3      | SkillExecutor続行/中止              | 結果に応じてスキル実行を継続または中止 |

---

## 関連ドキュメント

- [アーキテクチャパターン概要](./architecture-patterns.md)
- [IPC・永続化パターン](./arch-ipc-persistence.md)
- [インターフェース定義（Agent SDK）](./interfaces-agent-sdk.md)
