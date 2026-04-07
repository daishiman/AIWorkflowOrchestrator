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

#### ApiKeyStatus（TASK-RT-04 / TASK-RT-04-AUTHKEY-COMPONENT-DEDUP-001）

runtime lane の API キー設定補助導線で利用する UI 状態型。canonical source は `packages/shared/src/types/skillCreator.ts`。

| 値 | 説明 |
| --- | --- |
| `not_set` | キー未設定 |
| `validating` | 保存中/検証中 |
| `configured` | 利用可能なキーを確認済み（`saved` または `env-fallback`） |
| `error` | 保存/削除時にエラーが発生 |
| `check-failed` | 初期確認時に IPC エラーが発生（electronAPI 未利用環境を含む） |

#### Skill Wizard Shared Contracts（UT-SKILL-WIZARD-W0-seq-01）

W0 のスキルウィザード共有型。canonical source は `packages/shared/src/types/skillCreator.ts`。  
`packages/shared/src/types/skill.ts` には別概念の `SkillCategory` が既に存在するため、公開経路は `@repo/shared/types/skillCreator` に閉じ、root `@repo/shared` へは拡張しない。

| 型名 | 役割 |
| --- | --- |
| `SkillCategory` | Step 0 のカテゴリ選択 union |
| `SkillInfoFormData` | Step 0 のフォーム契約 |
| `SkillWizardScheduleConfig` | Q3 の定期実行契約 |
| `QuestionAnswer` | 1 問分の回答契約 |
| `ConversationAnswers` | 6 問分の回答集約契約 |
| `SmartDefaultResult` | semantic key ベースの初期値契約 |
| `SkeletonQualityFeedback` | 骨格品質のフィードバック契約 |

#### useAuthKeyManagement（TASK-RT-04-AUTHKEY-COMPONENT-DEDUP-001）

AuthKeySection / ApiKeySettingsPanel の共通 IPC ロジックを統合したカスタムフック。
canonical source は `apps/desktop/src/renderer/hooks/useAuthKeyManagement.ts`。

```typescript
interface UseAuthKeyManagementReturn {
  status: ApiKeyStatus;
  keySource: "saved" | "env-fallback" | null;
  inputValue: string;
  isSubmitting: boolean;
  validationError: string | null;
  apiError: string | null;
  setInputValue: (value: string) => void;
  handleSave: () => Promise<boolean>;
  handleDelete: () => Promise<boolean>;
  refresh: () => Promise<boolean>;
}

interface UseAuthKeyManagementOptions {
  onStatusChange?: (status: ApiKeyStatus) => void;
}
```

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
| `skillCreatorAPI` の役割 | 既存 `detectMode` / `improveSkill` に加え、runtime creator bridge として `planSkill` / `executePlan` / `improveSkillWithFeedback` / `getVerifyDetail` / `reverifyWorkflow` を持つ補助 API |
| create 正本 | `agentSlice.createSkill()` → `window.electronAPI.skill.create()` |
| execute 正本 | `agentSlice.executeSkill()` → `window.electronAPI.skill.execute()` |
| verify detail | `window.electronAPI.skillCreator.getVerifyDetail(planId)` で derived detail を取得し、owner は engine に維持 |
| re-verify | `window.electronAPI.skillCreator.reverifyWorkflow(planId)` は verify loop の再要求のみを行い、Task07/08 owner 項目は操作しない |
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

#### session resume surface（TASK-P0-08）

`SkillCreatorWorkflowEngine` の persisted checkpoint を renderer が再開・削除・期限切れ掃除できるようにする public surface。state owner は engine のまま維持し、renderer は prompt / indicator / cleanup だけを扱う。

| surface | contract |
| --- | --- |
| `window.skillCreatorAPI.listSessions()` | `Promise<IpcResult<SkillCreatorSessionListItem[]>>` |
| `window.skillCreatorAPI.resumeSession(checkpointId)` | `Promise<SkillCreatorSessionResumeResult>` |
| `window.skillCreatorAPI.deleteSession(checkpointId)` | `Promise<void>` |
| `window.skillCreatorAPI.cleanupExpiredSessions()` | `Promise<number>` |

| field | contract |
| --- | --- |
| `sessionId` | checkpoint id の表示用 alias |
| `startedAt` | 表示時の優先 timestamp。未設定時は `createdAt` を利用 |
| `isActive` | active session の pulse 表示フラグ |

#### session resume type anchors

| surface | canonical source |
| --- | --- |
| `SkillCreatorSessionListItem` / `SkillCreatorSessionSummary` / `SkillCreatorSessionResumeResult` / `SkillCreatorSessionResumeErrorReason` | `packages/shared/src/types/skillCreator.ts` |
| `SkillCreatorSessionApi` | `apps/desktop/src/preload/skill-creator-api.ts` |

#### onApprovalRequest（追加 2026-04-06 / UT-SDK-07-APPROVAL-REQUEST-SURFACE-001）

Main → Renderer の承認リクエスト受信リスナー。

```typescript
onApprovalRequest(callback: (request: ApprovalRequestPayload) => void): () => void
```

- 戻り値はクリーンアップ関数（`useEffect` で呼び出す）
- `ApprovalRequestPayload` は `packages/shared/src/types/skillCreator.ts` で定義（canonical）
- `IPC_CHANNELS.APPROVAL_REQUEST` channel を使用

**ApprovalRequestPayload フィールド:**

| フィールド    | 型       | 必須 | 説明                           |
| ------------- | -------- | ---- | ------------------------------ |
| sessionId     | string   | ✓    | セッション識別子               |
| operationId   | string   | ✓    | 操作識別子（単一利用トークン） |
| operationType | string   | ✓    | 操作種別（例: file_write）     |
| description   | string   | ✓    | 操作の説明文                   |
| destination   | string   | -    | 操作対象先（省略可）           |

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



---

## 続き

後半コンテンツは分割ファイルを参照:
- [interfaces-agent-sdk-skill-editor.md](interfaces-agent-sdk-skill-editor.md) — SkillEditor/Chain/Schedule/Fork型定義
