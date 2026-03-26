# Agent SDK Skill 仕様 / reference bundle

> 親仕様書: [interfaces-agent-sdk-skill.md](interfaces-agent-sdk-skill.md)
> 役割: reference bundle

## SkillCreatorService（TASK-9B-G）

### 概要

スキル作成の統合サービス。Facadeパターンで複雑なスキル作成処理を統合し、Script First原則・Progressive Disclosure原則に基づいた設計を採用する。

**実装ファイル**:

| ファイル                 | パス                                                     | 説明                   |
| ------------------------ | -------------------------------------------------------- | ---------------------- |
| SkillCreatorService.ts   | `apps/desktop/src/main/services/skill/`                  | スキル作成統合サービス |
| ScriptExecutor.ts        | `apps/desktop/src/main/services/skill/`                  | スクリプト実行基盤     |
| ResourceLoader.ts        | `apps/desktop/src/main/services/skill/`                  | リソース遅延読み込み   |
| constants.ts             | `apps/desktop/src/main/services/skill/`                  | 定数定義               |
| skillCreator.ts          | `packages/shared/src/types/`                             | 型定義                 |

---

### 型定義

#### SkillCreatorMode

スキル作成モードを表す列挙型。

| 値               | 説明                               |
| ---------------- | ---------------------------------- |
| `collaborative`  | ユーザー対話型スキル共創（推奨）   |
| `orchestrate`    | 実行エンジン選択モード             |
| `create`         | 新規スキル作成                     |
| `update`         | 既存スキル更新                     |
| `improve-prompt` | プロンプト改善                     |

#### ExecutionEngine

実行エンジンを表す列挙型（orchestrateモード用）。

| 値               | 説明                           |
| ---------------- | ------------------------------ |
| `claude`         | Claude Codeで実行              |
| `codex`          | OpenAI Codexで実行             |
| `claude-to-codex`| Claudeで設計→Codexで実行       |

#### CreateSkillOptions

スキル作成オプション。

| プロパティ        | 型                  | 必須 | 説明                           |
| ----------------- | ------------------- | ---- | ------------------------------ |
| `name`            | `string`            | ✓    | スキル名（ディレクトリ名）     |
| `description`     | `string`            | ✓    | スキルの説明                   |
| `mode`            | `SkillCreatorMode`  | ✓    | 作成モード                     |
| `executionEngine` | `ExecutionEngine`   | -    | 実行エンジン（orchestrate時）  |
| `generateTasks`   | `boolean`           | -    | タスク仕様書を生成するか       |
| `interviewResult` | `InterviewResult`   | -    | インタビュー結果（collaborative時） |
| `domainModel`     | `DomainModel`       | -    | ドメインモデル（collaborative時） |
| `skillPath`       | `string`            | -    | スキルパス（update時）         |
| `tasksDir`        | `string`            | -    | タスクディレクトリ（create時） |

#### ScriptResult

スクリプト実行結果。

| プロパティ  | 型        | 説明                           |
| ----------- | --------- | ------------------------------ |
| `success`   | `boolean` | 実行成功フラグ（exitCode===0） |
| `stdout`    | `string`  | 標準出力                       |
| `stderr`    | `string`  | 標準エラー出力                 |
| `exitCode`  | `number`  | 終了コード                     |

#### ExecutionReport

タスク実行レポート。

| プロパティ      | 型                | 説明                     |
| --------------- | ----------------- | ------------------------ |
| `mode`          | `string`          | 実行モード（dry-run/execution） |
| `tasks`         | `string[][]`      | 実行順序（dry-run時）    |
| `results`       | `TaskResult[]`    | 実行結果（execution時）  |
| `summary`       | `ExecutionSummary`| サマリー                 |
| `estimatedTime` | `number`          | 見積もり時間（分）       |

---

### SkillCreatorService API

SkillCreatorService は公開APIとして 12 メソッドを提供する。

| メソッド | シグネチャ | 戻り値 | 説明 |
| --- | --- | --- | --- |
| `detectMode` | `(request: string)` | `Promise<SkillCreatorMode>` | ユーザー要求からモード判定 |
| `createSkill` | `(options: CreateSkillOptions)` | `Promise<string>` | スキル作成（戻り値は作成先パス） |
| `executeTasks` | `(options: ExecuteTasksOptions)` | `Promise<ExecutionReport>` | タスク群実行（dry-run/実行） |
| `validateSkill` | `(skillDir: string)` | `Promise<boolean>` | 生成スキル検証 |
| `validateWithSchema` | `(schemaName: string, data: unknown)` | `Promise<boolean>` | スキーマ検証 |
| `improveSkill` | `(skillName: string, autoApply: boolean)` | `Promise<unknown>` | 改善提案生成/適用 |
| `applyRuntimeImprovement` | `(skillName: string, suggestions: RuntimeSkillCreatorImproveSuggestion[])` | `Promise<IpcResult<ApplyImprovementResult>>` | runtime 改善提案適用（`skill-creator:apply-improvement` 契約） |
| `forkSkill` | `(sourceName: string, newName: string, options: object)` | `Promise<string>` | SkillCreator向けフォーク（`skill-creator:fork` 契約） |
| `shareSkill` | `(action: string, target: string, skillName: string)` | `Promise<string>` | 共有/エクスポート |
| `scheduleSkill` | `(skillName: string, schedule: object)` | `Promise<void>` | 実行スケジュール設定 |
| `debugSkill` | `(skillName: string, options: object)` | `Promise<unknown>` | デバッグ実行 |
| `generateDocs` | `(skillName: string, format: string, sections: string[])` | `Promise<string>` | ドキュメント生成 |
| `getStats` | `(skillName: string, period: string)` | `Promise<unknown>` | 使用統計取得 |

---

### Skill Lifecycle Surface（TASK-SKILL-LIFECYCLE-03）

`SkillCreatorService` をそのまま表向きの create UI に昇格させず、`SkillLifecyclePanel` から見た内部オーケストレーション API として使う。

| 項目 | 契約 |
| --- | --- |
| 表向きの primary 導線 | `SkillManagementPanel` → `SkillLifecyclePanel` の 1 画面 |
| `skillCreatorAPI` の役割 | 既存 `detectMode` / `improveSkill` に加え、runtime creator bridge として `planSkill` / `executePlan` / `improveSkillWithFeedback` を持つ補助 API |
| create 正本 | `agentSlice.createSkill()` → `window.electronAPI.skill.create()` |
| execute 正本 | `agentSlice.executeSkill()` → `window.electronAPI.skill.execute()` |
| 詳細改善 | `SkillAnalysisView` / store action を再利用 |

#### renderer 契約

| surface | 使い方 | 理由 |
| --- | --- | --- |
| `window.electronAPI.skillCreator.detectMode(request)` | request 文の方針判定のみ | mode を UI に増やさず internal plan に閉じるため |
| `window.electronAPI.skillCreator.planSkill(prompt, authMode?, apiKey?)` | runtime creator plan を public IPC で要求する | skill 作成 runtime bridge を既存 namespace に保つため |
| `window.electronAPI.skillCreator.executePlan(planId, skillSpec, authMode?, apiKey?)` | runtime plan 実行を要求する | facade / SkillExecutor の境界を preload から隠蔽するため |
| `window.electronAPI.skillCreator.improveSkillWithFeedback(skillName, feedback, authMode?, apiKey?)` | runtime 改善を要求する | feedback ベース改善を `skill-creator:*` surface に集約するため |
| `window.electronAPI.skillCreator.improveSkill(skillName, { autoApply: false })` | 改善候補の事前整理 | creator 提案と詳細分析を分離するため |
| `useCreateSkill()` | create 実処理 | 一覧再取得・既存権限導線を保つため |
| `useExecuteSkill()` | execute 実処理 | preflight / permission / streaming 契約を再利用するため |

#### runtime bridge 型アンカー

| surface | request | response | canonical source |
| --- | --- | --- | --- |
| `planSkill(prompt, authMode?, apiKey?)` | `SkillCreatorPlanRequest` | `RuntimeSkillCreatorPlanResponse` | `packages/shared/src/types/skillCreator.ts` |
| `executePlan(planId, skillSpec, authMode?, apiKey?)` | `SkillCreatorExecutePlanRequest` | `RuntimeSkillCreatorExecuteResponse` | `packages/shared/src/types/skillCreator.ts` |
| `improveSkillWithFeedback(skillName, feedback, authMode?, apiKey?)` | `SkillCreatorImproveSkillRequest` | `RuntimeSkillCreatorImproveResponse` | `packages/shared/src/types/skillCreator.ts` |

型定義の正本は `packages/shared/src/types/skillCreator.ts` とし、renderer surface は上記型へ収束する。

#### workflow manifest foundation 型アンカー

runtime bridge の public surface とは別に、workflow engine foundation では次の internal shared contract を使う。

| 項目 | canonical source | 用途 |
| --- | --- | --- |
| `WORKFLOW_MANIFEST_SCHEMA_VERSION` | `packages/shared/src/types/skillCreator.ts` | manifest schema の固定版数 |
| `WorkflowManifest` / `WorkflowManifestPhase` / `WorkflowManifestResourceDescriptor` / `WorkflowManifestHook` | `packages/shared/src/types/skillCreator.ts` | `workflow-manifest.json` の read/validate 契約 |
| `NormalizedWorkflowManifestResourceDescriptor` / `LoadedWorkflowManifest` | `packages/shared/src/types/skillCreator.ts` | runtime 側で絶対パス・cache key・resource hash・`manifestContentHash` を持つ読み込み済み manifest 契約 |
| `ManifestLoader` | `apps/desktop/src/main/services/runtime/ManifestLoader.ts` | read / validate / normalize / cache のみを担当し、route/state authority は持たない |

この foundation contract は Task01 で固定した internal boundary であり、`planSkill` / `executePlan` / `improveSkillWithFeedback` の public IPC response 形状を直接は変更しない。

#### manifest hardening current facts（2026-03-26）

- `LoadedWorkflowManifest.manifestContentHash` は canonicalized manifest 全体の内容 hash を保持し、`mtime` が同一でも manifest 本文差分を cache hit に紛れ込ませない。
- `ManifestLoader` は `resource.phaseIds` と `phase.resourceIds` の両方向整合を検証し、未定義 phase 参照や片方向だけの関連付けを reject する。
- `ManifestLoader` は `phaseIds` / `resourceIds` / `dependsOn` の重複値を reject し、foundation contract の drift を read 時点で止める。

#### improve() 型定義詳細（TASK-SC-05-IMPROVE-LLM）

**RuntimeSkillCreatorImproveSuggestion** — 構造化された改善提案:

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `section` | `string` | 対象セクション名 |
| `before` | `string` | 変更前テキスト（空文字列不可） |
| `after` | `string` | 変更後テキスト |
| `reason` | `string` | 変更理由（LLM の issue + pattern を統合） |

**RuntimeSkillCreatorImproveResult** — improve 成功時レスポンス:

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `improveId` | `string` | 改善セッション ID（`improve-{timestamp}`） |
| `suggestions` | `RuntimeSkillCreatorImproveSuggestion[]` | 改善提案配列（旧: `string[]`） |
| `revisedSpec?` | `string` | LLM が生成した改善後 SKILL.md 全文（optional） |

**ApplyImprovementResult** — 改善適用結果:

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `applied` | `number` | 適用成功件数 |
| `skipped` | `number` | スキップ件数（before 不一致） |
| `skippedDetails` | `Array<{ section: string; reason: string }>` | スキップ詳細 |
| `errors` | `string[]` | 書き込みエラー一覧 |

**RuntimeSkillCreatorImproveErrorResponse** — improve エラー時レスポンス（P60 準拠 IPC wrapper 形式）:

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `success` | `false` | 固定値 |
| `error.code` | `string` | エラーコード（VALIDATION_ERROR / SKILL_NOT_FOUND / READ_ERROR / PARSE_ERROR / LLM_ERROR / READONLY_SKILL） |
| `error.message` | `string` | エラー詳細メッセージ |

**RuntimeSkillCreatorImproveResponse** — union 型:
`RuntimeSkillCreatorImproveResult | { type: "terminal_handoff"; bundle: TerminalHandoffBundle } | RuntimeSkillCreatorImproveErrorResponse`

#### 進行状況

| role | UIラベル | 実装 | UI 露出ルール |
| --- | --- | --- | --- |
| Planner | 方針判定 | `detectMode` / `planSkill` | runtime bridge は内部導線として扱い、UI の一次導線は増やさない |
| Executor | 実行状況 | `executeSkill` / `executePlan` | direct execute と runtime creator execute を契約上分離する |
| Improver | 改善状況 | `improveSkill` / `improveSkillWithFeedback` + `SkillAnalysisView` | 事前提案と runtime 改善を責務別に分ける |

---

### ScriptExecutor API

Script First原則に基づき、決定論的処理をスクリプトに委譲する。

#### execute

スクリプトを実行し、結果を返す。

| パラメータ   | 型         | 必須 | 説明                             |
| ------------ | ---------- | ---- | -------------------------------- |
| `scriptName` | `string`   | ✓    | スクリプト名（例: detect_mode.js） |
| `args`       | `string[]` | ✓    | スクリプトに渡す引数             |

**戻り値**: `Promise<ScriptResult>`

**セキュリティ**: パストラバーサル防止（`..`, `/`, `\`を含むスクリプト名を拒否）

#### executeJson

JSON出力スクリプトを実行し、パースした結果を返す。

**戻り値**: `Promise<T>` - パースされたJSONオブジェクト

---

### ResourceLoader API

Progressive Disclosure原則に基づき、リソースを遅延読み込みする。

#### load

リソースを読み込む（キャッシュ優先）。

| パラメータ | 型                | 必須 | 説明                             |
| ---------- | ----------------- | ---- | -------------------------------- |
| `category` | `ResourceCategory`| ✓    | カテゴリ（agents/references/assets/schemas） |
| `name`     | `string`          | ✓    | リソース名（ファイル名）         |

**戻り値**: `Promise<string>`

#### loadAgent / loadSchema

ショートカットメソッド。

| メソッド     | 戻り値            | 説明                   |
| ------------ | ----------------- | ---------------------- |
| `loadAgent`  | `Promise<string>` | エージェントプロンプト |
| `loadSchema` | `Promise<object>` | JSONスキーマ           |

#### clearCache

キャッシュをクリアする。

---

### テストカバレッジ

| ファイル               | Statements | Branches | Functions | Lines  |
| ---------------------- | ---------- | -------- | --------- | ------ |
| ResourceLoader.ts      | 100%       | 100%     | 100%      | 100%   |
| ScriptExecutor.ts      | 100%       | 91.66%   | 100%      | 100%   |
| SkillCreatorService.ts | 94.59%     | 88.63%   | 100%      | 94.59% |

| テストファイル                          | テスト数 | 状態    |
| --------------------------------------- | -------- | ------- |
| ScriptExecutor.test.ts                  | 9        | ✅ PASS |
| ResourceLoader.test.ts                  | 9        | ✅ PASS |
| SkillCreatorService.test.ts             | 22       | ✅ PASS |
| SkillCreatorService.integration.test.ts | 10       | ✅ PASS |
| **合計**                                | **50**   | ✅ PASS |

---

### 実装上の苦戦箇所・教訓

TASK-9B-G実装で得られた知見。同様の課題に直面した際の参考として記録する。

#### 1. 未タスク登録漏れ（Phase 12）

| 項目 | 内容 |
|------|------|
| 問題 | 未タスク指示書を作成しても、task-workflow.mdの残課題テーブルへの登録を忘れやすい |
| 原因 | Phase 12の未タスク検出が「指示書作成」で完了と誤認しやすい |
| 解決策 | **3ステップ必須**: ①指示書作成 → ②task-workflow.md残課題テーブル登録 → ③関連仕様書への記載 |
| 検証方法 | Phase 12完了前にtask-workflow.mdの残課題テーブルを目視確認 |

#### 2. Script First + Progressive Disclosure統合設計

| 項目 | 内容 |
|------|------|
| 課題 | 決定論的処理（Script First）とリソース遅延読み込み（Progressive Disclosure）を同一サービスで統合する設計判断 |
| 解決策 | ScriptExecutorとResourceLoaderを独立クラスとして実装し、SkillCreatorService（Facade）で統合 |
| 利点 | 単一責任原則を維持しつつ、利用者には統一APIを提供 |
| テスト戦略 | 各コンポーネントを独立テスト後、統合テストでFacadeを検証 |

#### 3. 定数外部化のタイミング

| 項目 | 内容 |
|------|------|
| 課題 | タイムアウト値などのマジックナンバーがコード内に散在 |
| 原因 | Phase 5（実装）でハードコードし、Phase 8（リファクタリング）で外部化する2段階工程 |
| 教訓 | 12-Factor App準拠を意識し、Phase 5時点で定数ファイル（constants.ts）を作成すべき |
| 対策 | 新規サービス実装時は、定数定義ファイルを最初に作成するルールを適用 |

#### 4. パストラバーサル防止の実装箇所

| 項目 | 内容 |
|------|------|
| 課題 | セキュリティ対策（BC-003）をどのレイヤーで実装すべきか |
| 判断 | スクリプト名を受け取るScriptExecutor.execute()メソッド内で検証 |
| 理由 | 入力に最も近い場所で検証することで、バイパスリスクを低減 |
| 実装 | `..`, `/`, `\`を含むスクリプト名を拒否し、早期リターン |

---

### 関連ドキュメント

| ドキュメント | 説明 |
| ------------ | ---- |
| [TASK-9B-G 実装ガイド](../../../../docs/30-workflows/TASK-9B-G-skill-creator-service/outputs/phase-12/implementation-guide.md) | 概念的説明（中学生レベル）+ 技術詳細 |

---

## SkillEditor UI 型定義（TASK-9A / completed）

> **ステータス**: 実装完了（2026-02-26）
> 本セクションは TASK-9A-skill-editor で実装済みの UI 型定義を定義する。

### SkillEditorProps

| プロパティ | 型              | 必須 | 説明                       |
| ---------- | --------------- | ---- | -------------------------- |
| `skill`    | `ImportedSkill` | ✓    | 編集対象のスキル情報       |
| `onClose`  | `() => void`    | ✓    | エディター閉じるコールバック |

### SkillCodeEditorProps

| プロパティ   | 型                           | 必須 | デフォルト | 説明                       |
| ------------ | ---------------------------- | ---- | ---------- | -------------------------- |
| `value`      | `string`                     | ✓    | -          | エディター内テキスト       |
| `onChange`   | `(value: string) => void`    | ✓    | -          | テキスト変更コールバック   |
| `language`   | `string`                     | ✓    | -          | ファイルの言語識別子       |
| `isReadOnly` | `boolean`                    | -    | `false`    | 読み取り専用モード         |

### FileTreeCategory

| プロパティ | 型                 | 説明                                       |
| ---------- | ------------------ | ------------------------------------------ |
| `key`      | `string`           | カテゴリキー（`"agents"`, `"references"` 等） |
| `label`    | `string`           | カテゴリ表示ラベル                         |
| `files`    | `SkillSubResource[]` | カテゴリに属するファイル一覧             |

### 関連型定義

| 型                | 定義元                                   | 用途                   |
| ----------------- | ---------------------------------------- | ---------------------- |
| `ImportedSkill`   | `packages/shared/src/types/skill.ts`     | スキル情報             |
| `SkillSubResource`| `packages/shared/src/types/skill.ts`     | サブリソースファイル情報 |

### 関連ドキュメント

- [SkillEditor UIコンポーネント仕様](./ui-ux-feature-components.md#skill-editor-ui-task-9a)
- [TASK-9A ワークフロー](../../../../docs/30-workflows/completed-tasks/TASK-9A-skill-editor/index.md)

### 関連未タスク

| タスクID | 概要 | 仕様書 |
| --- | --- | --- |
| TASK-9A-C-001 | シンタックスハイライト機能 | `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/task-9a-c-syntax-highlighting.md` |
| ~~TASK-9A-C-002~~ | ~~ファイル作成・削除機能~~ **完了: 2026-02-26（TASK-9Aに統合）** | `docs/30-workflows/completed-tasks/unassigned-task/task-9a-c-file-crud-operations.md` |
| TASK-9A-C-003 | Monaco/CodeMirrorエディタ移行 | `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/task-9a-c-code-editor-migration.md` |
| ~~TASK-9A-C-004~~ | ~~Phase 12仕様同期ガード自動化~~ **完了: 2026-02-26（Phase 12完了に伴い移管）** | `docs/30-workflows/completed-tasks/unassigned-task/task-9a-c-phase12-spec-sync-guard.md` |

## スキルチェーン 型定義（TASK-9D）

`packages/shared/src/types/skill-chain.ts` に定義されたスキルチェーンパイプライン機能の型契約。

### 型一覧

| 型名 | 定義元 | 用途 |
| --- | --- | --- |
| `SkillChainDefinition` | `packages/shared/src/types/skill-chain.ts` | チェーン全体定義（id, name, description, steps, variables, errorHandling, createdAt, updatedAt） |
| `SkillChainStep` | 同上 | チェーン内1ステップ定義（stepId, skillName, inputMapping, outputMapping, condition, timeout, retryCount） |
| `InputMapping` | 同上 | 入力マッピング（type: literal/variable/template/previousOutput, value, template） |
| `OutputMapping` | 同上 | 出力マッピング（extractPath, variableName） |
| `SkillChainCondition` | 同上 | ステップ実行条件（type: always/ifVariable/ifPreviousSuccess/expression, expression, variable, expectedValue） |
| `SkillChainResult` | 同上 | チェーン実行結果（chainId, success, results, finalVariables, totalDuration） |
| `StepResult` | 同上 | 個別ステップ実行結果（stepId, success, skipped, output, error, duration） |
| `SkillChainErrorStrategy` | 同上 | エラーハンドリング戦略（"stop" / "skip" / "retry"） |
| `InputMappingType` | 同上 | 入力マッピング種別（"literal" / "variable" / "template" / "previousOutput"） |
| `SkillChainConditionType` | 同上 | 条件種別（"always" / "ifVariable" / "ifPreviousSuccess" / "expression"） |

### Preload API

Preload API（`skill-api.ts` 内の chain メソッド群）は TASK-UI-05B（SkillChainBuilder UI）の実装で追加済み。

### IPC チャネル対応

| Preload メソッド | IPC チャネル | 戻り値型 |
| --- | --- | --- |
| `chainList` | `skill:chain:list` | `SkillChainDefinition[]` |
| `chainGet` | `skill:chain:get` | `SkillChainDefinition` |
| `chainSave` | `skill:chain:save` | `SkillChainDefinition` |
| `chainDelete` | `skill:chain:delete` | `{ deleted: boolean }` |
| `chainExecute` | `skill:chain:execute` | `SkillChainResult` |

---

## スキルスケジュール 型定義（TASK-9G）

`packages/shared/src/types/skill-schedule.ts` と `apps/desktop/src/preload/skill-api.ts` に定義されたスキルスケジュール実行機能の型契約。

### 型一覧

| 型名 | 定義元 | 用途 |
| --- | --- | --- |
| `ScheduledSkill` | `packages/shared/src/types/skill-schedule.ts` | スケジュール済みスキル（id, skillName, prompt, schedule, enabled, runHistory, notification, lastRun, nextRun, createdAt, updatedAt） |
| `SkillSchedule` | 同上 | スケジュール設定（type: cron/interval/once/event, cronExpression, interval, runAt, event, eventConfig） |
| `NotificationSettings` | 同上 | 通知設定（onSuccess, onFailure, notificationType: system/inApp/both） |
| `ScheduledRunResult` | 同上 | スケジュール実行結果（runId, startedAt, success, completedAt, output, error） |

### Preload API（`skill-api.ts`）

| メソッド名 | IPC チャネル | 引数 | 戻り値型 |
| --- | --- | --- | --- |
| `scheduleList` | `skill:schedule:list` | なし | `Promise<ScheduledSkill[]>` |
| `scheduleAdd` | `skill:schedule:add` | `skillName, prompt, schedule, notification?` | `Promise<ScheduledSkill>` |
| `scheduleUpdate` | `skill:schedule:update` | `id, updates` | `Promise<void>` |
| `scheduleDelete` | `skill:schedule:delete` | `id` | `Promise<void>` |
| `scheduleToggle` | `skill:schedule:toggle` | `id` | `Promise<ScheduledSkill \| undefined>` |

---

## スキルフォーク 型定義（TASK-9E）

`packages/shared/src/types/skill-fork.ts` と `apps/desktop/src/preload/skill-api.ts` に定義されたスキルフォーク機能の型契約。

### 型一覧

| 型名 | 定義元 | 用途 |
| --- | --- | --- |
| `SkillForkOptions` | `packages/shared/src/types/skill-fork.ts` | フォーク入力契約 |
| `SkillForkResult` | 同上 | フォーク実行結果 |
| `SkillForkMetadata` | 同上 | `fork-metadata.json` 追跡情報 |

### Preload API（`skill-api.ts`）

| メソッド名 | 引数 | 戻り値 | チャネル |
| --- | --- | --- | --- |
| `forkSkill` | `options: SkillForkOptions` | `Promise<SkillForkResult>` | `skill:fork` |

### 責務境界

| 契約 | 用途 | 備考 |
| --- | --- | --- |
| `skill:fork` | Skill API ドメインのフォーク実体処理 | `SkillForker` が担当 |
| `skill-creator:fork` | SkillCreator ワークフロー上の派生作成補助 | `SkillCreatorService.forkSkill` が担当 |

### 完了タスク

| タスクID | 完了日 | ステータス | 概要 |
| --- | --- | --- | --- |
| TASK-9E | 2026-02-28 | 完了 | `skill:fork` 追加（Main IPC + Preload + Shared型 + SkillForker）。59テスト（SkillForker 34 / IPC 25）で契約を検証 |

### 実装時の苦戦箇所（TASK-9E）

| 苦戦箇所 | 問題 | 解決策 |
| --- | --- | --- |
| 57/59 の件数ドリフト | Phase成果物と型契約仕様でテスト件数の記載が分岐し、完了判定根拠が揺れた | `task-workflow.md` を正本件数（59）へ固定し、TASK-9E 文脈のみ `rg` で抽出して同期 |
| `skill:fork` と `skill-creator:fork` の契約境界混同 | 名前が類似し、呼び出し側で用途を取り違えやすかった | インターフェース仕様に責務境界表を追加し、Preload API を `forkSkill(options)` 契約で固定 |
| path境界判定の実装差分追従 | `startsWith` 由来の境界抜けを仕様が即時追従できず、再監査で差戻しが発生 | `path.relative` ベース判定へ更新した実装に合わせ、型/API説明とセキュリティ仕様を同時更新 |

### 同種課題の簡潔解決手順（4ステップ）

1. 型定義・Preload API・IPC契約の3点を同一ターンで更新する。
2. 近似チャネル（`skill:*` / `skill-creator:*`）は責務境界表を必ず併記する。
3. 仕様値（件数など）は `task-workflow.md` を正本化し、周辺成果物へ転記する。
4. `verify-all-specs` と `validate-phase-output` で契約同期を確認する。

---

## RuntimeSkillCreatorFacade（UT-SC-03-003）

### 概要

LLM ランタイムを使用してスキルの plan / execute / improve を実行する Facade。Main Process の IPC ハンドラ（`skill-creator:*`）から呼び出される。

### Setter Injection メソッド

| メソッド | 引数 | 戻り値 | 説明 |
| --- | --- | --- | --- |
| `setLLMAdapter(adapter)` | `adapter: ILLMAdapter` | `void` | LLM Adapter を遅延注入する（P34: Setter Injection パターン）。`LLMAdapterFactory.getAdapter()` が非同期のため、コンストラクタ時点では注入できない。注入前は graceful degradation でスタブ応答を返す。冪等（複数回呼び出し時は最後の adapter を使用）。 |

### DI 配線（ipc/index.ts）

- `ResourceLoader`: `DEFAULT_SKILL_CREATOR_PATH` でコンストラクタ注入
- `LLMAdapter`: fire-and-forget async で `LLMAdapterFactory.getAdapter("anthropic")` → `setLLMAdapter()` で遅延注入
- `SkillFileWriter`: `skillBasePath` でコンストラクタ注入

### 実装ファイル

| ファイル | パス | 説明 |
| --- | --- | --- |
| RuntimeSkillCreatorFacade.ts | `apps/desktop/src/main/services/runtime/` | Facade 本体 |
| creatorHandlers.ts | `apps/desktop/src/main/ipc/` | IPC ハンドラ（internal helper） |

### 完了タスク

| タスクID | 完了日 | ステータス | 概要 |
| --- | --- | --- | --- |
| UT-SC-03-003 | 2026-03-24 | 完了 | DI 配線実装。setLLMAdapter Setter Injection + ResourceLoader コンストラクタ注入 + fire-and-forget async LLMAdapter。29テスト全PASS |
