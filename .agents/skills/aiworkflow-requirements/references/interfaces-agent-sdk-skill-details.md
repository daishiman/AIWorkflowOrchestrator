# Agent SDK Skill 仕様 / detail specification

> 親仕様書: [interfaces-agent-sdk-skill-core.md](interfaces-agent-sdk-skill-core.md)
> 役割: detail specification

## Skill Dashboard 型定義（AGENT-002）

Agent Dashboard機能で使用する型定義。Claude Agent SDKとは独立した、スキル管理用の型。
AGENT-002タスクで実装されたスキル管理UI機能の完全な仕様を定義する。

### IPC チャンネル（スキル管理）

| チャンネル                | 方向            | 説明                        | 戻り値                                |
| ------------------------- | --------------- | --------------------------- | ------------------------------------- |
| `skill:getImported`       | Renderer → Main | インポート済みスキル取得    | `{ success: true, data: ImportedSkill[] } \| { success: false, error: string }` |
| `skill:list`              | Renderer → Main | 利用可能スキル取得          | `{ success: true, data: SkillMetadata[] } \| { success: false, error: string }` |
| `skill:import`            | Renderer → Main | スキルインポート            | `ImportedSkill`（UT-FIX-SKILL-IMPORT-RETURN-TYPE-001で修正済み） |
| `skill:remove`            | Renderer → Main | スキル削除                  | `RemoveResult`                        |
| `skill:get-detail`        | Renderer → Main | スキル詳細取得              | `{ success: true, data: Skill } \| { success: false, error: string }` |
| `skill:update`            | Renderer → Main | スキル更新                  | `{ success: true, data: void } \| { success: false, error: string }` |
| `skill:fork`              | Renderer → Main | スキルフォーク（TASK-9E）   | `{ success: true, data: SkillForkResult } \| { success: false, error: string }` |
| `skill:execute`           | Renderer → Main | スキル実行                  | `{ success: true, data: SkillExecutionResponse } \| { success: false, error: string, errorCode?: string }` |
| `skill:abort`             | Renderer → Main | スキル実行中断              | `boolean`                             |
| `skill:get-status`        | Renderer → Main | 実行ステータス取得          | `ExecutionStatus \| null`             |
| `skill:analyze`           | Renderer → Main | スキル分析（TASK-9C）       | `OperationResult<SkillAnalysis>`      |
| `skill:improve`           | Renderer → Main | スキル改善（TASK-9C）       | `OperationResult<ImprovementResult>`  |
| `skill:optimize`          | Renderer → Main | プロンプト最適化（TASK-9C） | `OperationResult<OptimizationResult>` |
| `skill:optimize:variants` | Renderer → Main | バリアント生成（TASK-9C）   | `OperationResult<string[]>`           |
| `skill:optimize:evaluate` | Renderer → Main | プロンプト評価（TASK-9C）   | `OperationResult<PromptEvaluation>`   |

#### TASK-IMP-IPC-LAYER-INTEGRITY-FIX-001: current contract

| API | Preload payload | Preload behavior | Main / IPC contract |
| --- | --- | --- | --- |
| `getDetail` | `{ skillId: string }` | `safeInvokeUnwrap(IPC_CHANNELS.SKILL_GET_DETAIL, { skillId })` を呼び、失敗時は throw する | `skill:get-detail` は `{ success: true, data: Skill } \| { success: false, error: string }` を返す |
| `update` | `{ skillName: string, updates: Record<string, unknown> }` | `safeInvokeUnwrap(IPC_CHANNELS.SKILL_UPDATE, { skillName, updates })` を呼び、失敗時は throw する | `skill:update` は `{ success: true, data: void } \| { success: false, error: string }` を返す |

> `getDetail` / `update` は object payload + `safeInvokeUnwrap` に統一し、Preload 側で fail-fast する。`null` 返却や positional payload へ戻さない。


#### TASK-IMP-IPC-LAYER-INTEGRITY-FIX-001: 実装完了記録（2026-03-19）

| API | 実装ステータス | 実装内容 |
| --- | --- | --- |
| `getDetail` | **実装済み** | Preload API 公開済み: `window.electronAPI.skill.getDetail()` メソッドを `skill-api.ts` に追加。`safeInvokeUnwrap(IPC_CHANNELS.SKILL_GET_DETAIL, { skillId })` で呼び出し、失敗時 throw。P42準拠3段バリデーション（型チェック→空文字列→トリム空文字列）適用済み |
| `update` | **契約復旧済み** | Main Process ハンドラ登録済み: `skill:update` の `ipcMain.handle` を `skillHandlers.ts` に追加 + `unregisterSkillHandlers()` に登録。Preload API 公開済み: `window.electronAPI.skill.update()` メソッドを `skill-api.ts` に追加。P42準拠3段バリデーション適用済み。`SkillService.updateSkill()` のビジネスロジックは `UT-IMP-SKILL-UPDATE-BUSINESS-LOGIC-001` で継続管理 |

> テスト実績: 5ファイル / 227件全PASS（2026-03-19 再検証）

### TASK-SKILL-LIFECYCLE-04: 評価・採点ゲート契約（2026-03-14）

#### 追加型（shared transport / domain）

| 型 | 目的 | 定義 |
| --- | --- | --- |
| `ScoringGate` | スコアに応じた4段階判定 | `"NEEDS_IMPROVEMENT" \| "SAVE_ALLOWED" \| "USE_ALLOWED" \| "RECOMMENDED"` |
| `ScoringGateResult` | UI制御フラグ付き判定結果 | `gate`, `score`, `canSave`, `canUse`, `isRecommended` |
| `ScoreDelta` | 改善前後の差分情報 | `previousScore`, `newScore`, `delta`, `direction` |

#### 追加関数（shared）

| 関数 | 役割 |
| --- | --- |
| `normalizeScore(raw)` | 0-100 整数へ正規化（NaN/範囲外ガード） |
| `calculateScoreFromBreakdown(breakdown)` | 5項目平均で総合スコア算出 |
| `getScoreGate(score)` | スコア→`ScoringGate` 変換 |
| `getScoreGateResult(score)` | スコア→`ScoringGateResult` 変換 |
| `calculateScoreDelta(previousScore, newScore)` | 差分と方向（up/neutral/down）を算出 |

#### Preload API 契約（追加）

| API | シグネチャ | 契約 |
| --- | --- | --- |
| `evaluatePrompt` | `(prompt: string) => Promise<OperationResult<PromptEvaluation>>` | `skill:optimize:evaluate` を `safeInvoke` で呼び出す。payload は `{ prompt }`（P44/P45） |

#### 実装アンカー

- `packages/shared/src/types/skill-improver.ts`
- `apps/desktop/src/preload/skill-api.ts`
- `apps/desktop/src/renderer/components/skill/hooks/useSkillAnalysis.ts`
- `apps/desktop/src/renderer/components/skill/ScoreDisplay.tsx`

#### 関連未タスク（Phase 10 MINOR）

| タスクID | 内容 | 指示書 |
| --- | --- | --- |
| `TASK-FIX-EVAL-STORE-DISPATCH-001` | `handleEvaluatePrompt` の Store 経由化 | `docs/30-workflows/completed-tasks/step-03-seq-task-04-evaluation-and-scoring-gate/unassigned-task/task-fix-eval-store-dispatch-001.md` |
| `TASK-FIX-SCORE-DELTA-DEDUP-001` | `calculateScoreDelta` 重複解消 | `docs/30-workflows/completed-tasks/step-03-seq-task-04-evaluation-and-scoring-gate/unassigned-task/task-fix-score-delta-dedup-001.md` |

> 配置ルール: active 未タスクは `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/` を正本とし、workflow ローカル `tasks/unassigned-task/` は参照先として使わない。
>
> 統合正本: `workflow-skill-lifecycle-evaluation-scoring-gate.md`（実装内容 / 苦戦箇所 / current canonical set / artifact inventory）

#### `skill:import` リクエスト契約（UT-FIX-SKILL-IMPORT-INTERFACE-001）

| 項目 | 契約 |
| ---- | ---- |
| 引数形式 | `skillName: string`（オブジェクトラップなし） |
| 変換処理 | Mainハンドラー内部で `skillService.importSkills([skillName])` に配列化 |
| バリデーション | `typeof skillName === "string"` かつ `skillName.trim() !== ""` |
| エラー | `VALIDATION_ERROR` / `"skillName must be a non-empty string"` |

#### `skill:remove` リクエスト契約（UT-FIX-SKILL-REMOVE-INTERFACE-001）

| 項目 | 契約 |
| ---- | ---- |
| 引数形式 | `skillName: string`（オブジェクトラップなし） |
| バリデーション | `typeof skillName === "string"` かつ `skillName.trim() !== ""` |
| エラー | `VALIDATION_ERROR` / `"skillName must be a non-empty string"` |

#### `skill:execute` リクエスト契約（UT-FIX-SKILL-EXECUTE-INTERFACE-001）

| 項目 | 契約 |
| ---- | ---- |
| 正式引数形式 | `SkillExecutionRequest`（`skillName: string`, `prompt: string`, `workingDirectory?: string`） |
| 後方互換引数形式 | `{ skillId: string; params?: Record<string, unknown> }`（既存呼び出し互換） |
| Main処理 | `skillName` 受信時は `scanAvailableSkills()` で `name -> id` 解決後に `executeSkill(skill.id, { prompt })` 実行 |
| バリデーション | `skillName` または `skillId` に対する非空文字列検証（`trim()`含む） |
| エラー | `VALIDATION_ERROR` / `"skillName must be a non-empty string"` または `"skillId must be a non-empty string"` |

#### `skill:execute` 失敗レスポンス契約（TASK-FIX-SKILL-AUTH-PREFLIGHT-GUARD-001）

| 項目 | 契約 |
| ---- | ---- |
| 失敗形式 | `{ success: false, error: string, errorCode?: string }` |
| 認証失敗時 | `errorCode: "AUTHENTICATION_ERROR"` を付与する |
| 後方互換 | `error` フィールドは従来どおり必須、`errorCode` は optional |
| Preload挙動 | `safeInvokeUnwrap` で `errorCode` を `Error.code` に転写して throw |
| Renderer preflight | `auth-key:exists` で事前判定し、`exists=false` の場合は execute を呼ばず `AUTHENTICATION_ERROR` を返す |

#### `skill:fork` リクエスト契約（TASK-9E）

| 項目 | 契約 |
| ---- | ---- |
| 引数形式 | `SkillForkOptions`（`sourceSkill`, `newName`, `description?`, `copyAgents`, `copyReferences`, `copyScripts`, `copyAssets`, `modifyAllowedTools?`） |
| 戻り値 | `SkillForkResult`（`newSkillPath`, `copiedFiles`, `warnings?`） |
| バリデーション | `sourceSkill`/`newName` の P42準拠3段バリデーション、`copy*` boolean、`modifyAllowedTools` 非空文字列配列 |
| 責務境界 | `skill:fork` は Skill API ドメイン。`skill-creator:fork`（SkillCreatorService）とは別契約として管理する |
| エラー | `VALIDATION_ERROR` / サニタイズ済みメッセージ |

#### `skill:import` リクエスト契約（UT-FIX-SKILL-IMPORT-RETURN-TYPE-001）

| 項目 | 契約 |
| ---- | ---- |
| 引数形式 | `skillName: string`（オブジェクトラップなし） |
| バリデーション | `typeof skillName === "string"` かつ `skillName.trim() !== ""` |
| 戻り値 | `ImportedSkill`（2ステップ変換: importSkills → getSkillByName） |
| エラー | `VALIDATION_ERROR` / `IMPORT_ERROR` |

#### `skill:getImported` 互換キー契約（TASK-FIX-SKILL-IMPORTED-STATE-RECONCILIATION-001）

| 項目 | 契約 |
| ---- | ---- |
| 目的 | 過去データ互換のため、import manager へ保存済みキーを `skill.id` / `skill.name` の両方で解決する |
| Main処理 | `SkillService.getImportedSkills()` で cache の `id` 解決を優先し、未一致時は `skill.name` 一致をフォールバックで探索 |
| 互換対象 | 旧保存データ（`name` 保存）と現行保存データ（`id` 保存）の混在状態 |
| 戻り値保証 | `skill:getImported` は互換解決後の `ImportedSkill[]` を返し、空配列時は正常終了 |

#### SkillCenter 欠損メタデータ防御契約（TASK-FIX-SKILL-CENTER-METADATA-DEFENSIVE-GUARD-001）

| 項目 | 契約 |
| ---- | ---- |
| 対象 | `description`, `agents`, `references`, `indexes`, `scripts`, `otherFiles` が `undefined/null` のケース |
| Renderer側ガード | `String(value ?? "")` と `Array.isArray(value)` ベースの `safeLength` / `safeSubResources` で防御 |
| Hook冪等ガード | `handleAddSkill` は `addingSkills.has(skillName)` を先頭評価し、追加中の重複呼び出しを無視する |
| 追加済み時UX契約 | `importedSkillNames.includes(skillName)` の場合は状態同期のみ実行し、成功アニメーション開始フラグを立てない |
| フィルタリング | `useSkillCenter` / `useFeaturedSkills` で `normalizeSearchText` を使い、欠損値でも `.toLowerCase()` 例外を発生させない |
| UI要件 | SkillCard/DetailPanel/Featured計算で欠損メタデータを許容し、画面クラッシュを起こさない |
| 検証証跡 | `docs/30-workflows/03-TASK-FIX-SKILL-CENTER-METADATA-DEFENSIVE-GUARD-001/outputs/phase-11/screenshots/` + `docs/30-workflows/completed-tasks/02-TASK-FIX-SKILL-IMPORT-IDEMPOTENCY-GUARD-001/outputs/phase-11/screenshots/` |

#### `skill:import` 関連タスク（完了）

| タスクID | 概要 | ステータス | 完了日 |
| -------- | ---- | ---------- | ------ |
| UT-FIX-SKILL-IMPORT-RETURN-TYPE-001 | skill:import 戻り値型不整合修正（ImportResult→ImportedSkill変換） | **完了** | 2026-02-21 |
| UT-FIX-SKILL-IPC-RESPONSE-CONSISTENCY-001 | skill:ハンドラIPCレスポンス形式統一（execute/removeの戻り値契約整合） | **完了** | 2026-02-25 |

#### skillHandlers 関連未タスク（UT-FIX-SKILL-IMPORT-RETURN-TYPE-001 Phase 12 検出）

| タスクID | 内容 | 優先度 | 指示書パス |
| -------- | ---- | ------ | ---------- |
| ~~UT-FIX-SKILL-IPC-RESPONSE-CONSISTENCY-001~~ | ~~skill:ハンドラIPCレスポンス形式統一（{ success, data }ラッパー vs 直接型T混在解消）~~ | ~~中~~ | `docs/30-workflows/completed-tasks/ut-fix-skill-ipc-response-consistency-001/index.md` **（完了: 2026-02-25）** |
| UT-IMP-SKILL-IPC-RESPONSE-CONTRACT-GUARD-001 | skill IPCレスポンス契約マトリクスと自動整合チェック（Main応答形式とPreloadラッパー選択の機械検証） | 中 | `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/task-imp-skill-ipc-response-contract-guard-001.md` |
| ~~UT-FIX-SKILL-GETDETAIL-NAMING-DRIFT-001~~ | ~~skill:get-detail引数名ドリフト修正（P45: skillId→skillName統一）~~ | ~~低~~ | `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/task-skill-getdetail-naming-drift.md` **（再評価クローズ: 2026-02-25 / getSkillById は実装上ID検索）** |
| ~~UT-FIX-SKILL-VALIDATION-CONSISTENCY-001~~ | ~~skill:ハンドラP42準拠バリデーション形式統一（UT-FIX-SKILL-VALIDATION-P42-001の補完）~~ | ~~中~~ | **完了: 2026-02-24** |
| ~~UT-FIX-SKILL-IMPORT-ID-MISMATCH-001~~ | ~~SkillImportDialog（organisms版）がskill.id（ハッシュ）を渡すためgetSkillByName失敗~~ | ~~高~~ | **完了: 2026-02-22** |

#### OperationResult型

スキル管理APIの統一戻り値型。成功/失敗を明確に区別する。

| プロパティ | 型        | 説明             |
| ---------- | --------- | ---------------- |
| `success`  | `boolean` | 成功/失敗フラグ  |
| `data`     | `T?`      | データ（成功時） |
| `error`    | `string?` | エラー（失敗時） |

#### SkillRunResult型

スキル実行の結果を表す型。

| プロパティ    | 型                      | 必須 | 説明                       |
| ------------- | ----------------------- | ---- | -------------------------- |
| `executionId` | `string`                | ✓    | 実行ID（UUID）             |
| `status`      | `'success' \| 'failed'` | ✓    | 実行ステータス             |
| `output`      | `string`                | -    | 実行出力（成功時）         |
| `error`       | `string`                | -    | エラーメッセージ（失敗時） |
| `startedAt`   | `Date`                  | ✓    | 実行開始時刻               |
| `completedAt` | `Date`                  | ✓    | 実行完了時刻               |

---

### Preload API（window.electronAPI.skill）

> **TASK-FIX-5-1実装ノート**: 旧 `window.skillAPI` から `window.electronAPI.skill` に統一。OperationResult ラッパーを廃止し、safeInvoke/safeOn パターンで直接型を返却。未タスク UT-FIX-5-1-001（AgentView型アサーション解消）が残存。

#### Skill実行API

##### execute

スキルを実行する。

| パラメータ | 型                      | 必須 | 説明             |
| ---------- | ----------------------- | ---- | ---------------- |
| `request`  | `SkillExecutionRequest` | ✓    | 実行リクエスト   |

**戻り値**: `Promise<SkillExecutionResponse>`

##### onStream

ストリーミングメッセージを購読する。

**シグネチャ**: `onStream: (callback: (message: SkillStreamMessage) => void) => () => void`

##### abort

実行中のスキルを中断する。

| パラメータ    | 型       | 必須 | 説明   |
| ------------- | -------- | ---- | ------ |
| `executionId` | `string` | ✓    | 実行ID |

**戻り値**: `Promise<void>`

##### getExecutionStatus

実行ステータスを取得する。

| パラメータ    | 型       | 必須 | 説明   |
| ------------- | -------- | ---- | ------ |
| `executionId` | `string` | ✓    | 実行ID |

**戻り値**: `Promise<ExecutionInfo | null>`

##### onComplete

スキル実行完了イベントを購読する。

**シグネチャ**: `onComplete: (callback: (data: { executionId: string }) => void) => () => void`

##### onError

スキル実行エラーイベントを購読する。

**シグネチャ**: `onError: (callback: (data: { executionId: string; error: string }) => void) => () => void`

#### Permission API（TASK-3-1-D + TASK-4-2）

##### onPermissionRequest

Main ProcessからのPermission要求をリッスンするリスナーを登録する。

**シグネチャ**: `onPermissionRequest: (callback: (request: SkillPermissionRequest) => void) => () => void`

##### sendPermissionResponse

Permission要求に対してユーザーの応答を送信する。

**シグネチャ**: `sendPermissionResponse: (response: SkillPermissionResponse) => Promise<{ success: boolean }>`

#### Skill管理API

##### list

利用可能なスキル一覧を取得する。

**戻り値**: `Promise<SkillMetadata[]>`

##### getImported

インポート済みのスキル一覧を取得する。

**戻り値**: `Promise<ImportedSkill[]>`

##### rescan

スキルディレクトリを再スキャンする。

**戻り値**: `Promise<SkillMetadata[]>`

##### import

スキルをインポートする。

| パラメータ  | 型       | 必須 | 説明     |
| ----------- | -------- | ---- | -------- |
| `skillName` | `string` | ✓    | スキル名 |

**戻り値**: `Promise<ImportedSkill>`

##### remove

スキルを削除する。

| パラメータ  | 型       | 必須 | 説明     |
| ----------- | -------- | ---- | -------- |
| `skillName` | `string` | ✓    | スキル名 |

**戻り値**: `Promise<RemoveResult>`

---

### Permission型定義（TASK-3-1-D）

#### SkillPermissionRequest

| プロパティ    | 型                        | 必須 | 説明                       |
| ------------- | ------------------------- | ---- | -------------------------- |
| `executionId` | `string`                  | ✓    | 実行ID                     |
| `requestId`   | `string`                  | ✓    | リクエストID（応答時使用） |
| `toolName`    | `string`                  | ✓    | ツール名                   |
| `args`        | `Record<string, unknown>` | ✓    | サニタイズされた引数       |
| `reason`      | `string`                  | -    | ユーザー向け理由説明       |

#### SkillPermissionResponse

| プロパティ       | 型        | 必須 | 説明                                               |
| ---------------- | --------- | ---- | -------------------------------------------------- |
| `requestId`      | `string`  | ✓    | リクエストID                                       |
| `approved`       | `boolean` | ✓    | 許可/拒否                                          |
| `rememberChoice` | `boolean` | -    | 選択を記憶するか                                   |
| `skip`           | `boolean` | -    | 拒否時にスキップ（中断しない）するか（UT-06-005） |

---

### React Hooks（TASK-3-1-D）

#### useSkillPermission

Permission要求の状態管理とハンドラーを提供するカスタムフック。

**戻り値**:

| プロパティ          | 型                                  | 説明                   |
| ------------------- | ----------------------------------- | ---------------------- |
| `pendingPermission` | `SkillPermissionRequest \| null`    | 保留中の権限リクエスト |
| `handleApprove`     | `(rememberChoice: boolean) => void` | 許可ハンドラ           |
| `handleDeny`        | `(rememberChoice: boolean) => void` | 拒否ハンドラ           |

---

### UIコンポーネント

#### コンポーネント階層

AgentViewを親コンポーネントとして、各UIコンポーネントが階層構造で配置される。

| 親コンポーネント | 子コンポーネント    | 表示条件         | 説明                 |
| ---------------- | ------------------- | ---------------- | -------------------- |
| AgentView        | Header              | 常時             | タイトルと説明文     |
| AgentView        | SkillSearchBar      | 常時             | 検索入力フィールド   |
| AgentView        | SkillCategoryFilter | 常時             | カテゴリ選択ボタン群 |
| AgentView        | SkillList           | 常時             | スキル一覧コンテナ   |
| SkillList        | SkillCard           | 複数表示         | 個別スキルカード     |
| AgentView        | SkillDetailPanel    | スキル選択時     | 選択スキルの詳細情報 |
| AgentView        | SkillImportDialog   | ダイアログ表示時 | インポートモーダル   |
| AgentView        | Toast               | 通知時           | 操作結果の通知表示   |

#### コンポーネント仕様

| コンポーネント        | ファイル                                 | 責務                   |
| --------------------- | ---------------------------------------- | ---------------------- |
| `AgentView`           | `views/AgentView/index.tsx`              | メインビュー、状態管理 |
| `SkillList`           | `components/SkillList.tsx`               | スキル一覧表示         |
| `SkillCard`           | `components/SkillCard.tsx`               | スキルカード表示       |
| `SkillDetailPanel`    | `components/SkillDetailPanel.tsx`        | スキル詳細パネル       |
| `SkillImportDialog`   | `components/skill/SkillImportDialog.tsx` | インポートダイアログ   |
| `SkillSearchBar`      | `components/SkillSearchBar.tsx`          | 検索バー               |
| `SkillCategoryFilter` | `components/SkillCategoryFilter.tsx`     | カテゴリフィルター     |

---

### SkillImportManager 仕様

インポートされたスキルIDを管理し、`electron-store`経由で永続化するサービスクラス。

**実装ファイル**:

- Service: `apps/desktop/src/main/services/skill/SkillImportManager.ts`
- Test: `apps/desktop/src/main/services/skill/__tests__/SkillImportManager.integration.test.ts`

#### API

| メソッド           | 引数              | 戻り値     | 説明                               |
| ------------------ | ----------------- | ---------- | ---------------------------------- |
| `addImportedId`    | `skillId: string` | `void`     | スキルIDを追加（重複チェック付き） |
| `removeImportedId` | `skillId: string` | `void`     | スキルIDを削除                     |
| `getImportedIds`   | -                 | `string[]` | 全スキルIDを取得                   |
| `hasImportedId`    | `skillId: string` | `boolean`  | 存在チェック                       |

---

## SkillImportStore（TASK-2B）

### 概要

インポートしたスキルの情報を永続化するストアサービス。electron-storeを使用してアプリケーション再起動後もデータを保持する。

**実装ファイル**:

- Store: `apps/desktop/src/main/settings/skillImportStore.ts`
- Test: `apps/desktop/src/main/settings/__tests__/skillImportStore.test.ts`

### スキーマ定義

| 型                  | 説明                 |
| ------------------- | -------------------- |
| `SkillStoreSchema`  | ストア全体のスキーマ |
| `ImportedSkillData` | インポート済みスキル |
| `SkillSettings`     | スキル個別設定       |
| `SkillCacheEntry`   | メタデータキャッシュ |

### API リファレンス

#### インポート管理

| メソッド       | シグネチャ                     | 説明                   |
| -------------- | ------------------------------ | ---------------------- |
| getImported    | `(): ImportedSkillData[]`      | 全インポート済みスキル |
| addImport      | `(skillName: string): void`    | スキルをインポート     |
| removeImport   | `(skillName: string): void`    | スキルを削除（冪等）   |
| exists         | `(skillName: string): boolean` | 存在確認               |
| updateLastUsed | `(skillName: string): void`    | 最終使用日時を更新     |

#### 権限管理

| メソッド                | シグネチャ                                              | 説明       |
| ----------------------- | ------------------------------------------------------- | ---------- |
| rememberPermission      | `(skillName, toolName, decision): void`                 | 権限を記憶 |
| getRememberedPermission | `(skillName, toolName): "allow" \| "deny" \| undefined` | 権限を取得 |

### SkillImportManager との違い

| 観点       | SkillImportManager   | SkillImportStore                             |
| ---------- | -------------------- | -------------------------------------------- |
| 責務       | スキルID一覧のみ管理 | メタデータ・設定・権限・キャッシュを包括管理 |
| 実装パス   | `services/skill/`    | `settings/`                                  |
| データ構造 | `string[]`（ID配列） | `Record<string, ImportedSkillData>`          |
| 設定管理   | なし                 | あり（SkillSettings）                        |
| 権限記憶   | なし                 | あり（rememberedPermissions）                |
| キャッシュ | なし                 | あり（SkillCacheEntry）                      |

---
