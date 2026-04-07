# Agentスキル参照仕様（SkillEditor/Chain/Schedule/Fork） / editor specification
> 親ファイル: [interfaces-agent-sdk-skill-reference.md](interfaces-agent-sdk-skill-reference.md)

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
- `SkillCreatorSourceResolver`: multi-root source discovery を担当
- `PhaseResourcePlanner`: operation ごとの resource selection / budget / degrade を担当
- `ResolvedResourceReader`: absolute path 優先読込 + legacy `ResourceLoader` fallback を担当

### dynamic resource pipeline（TASK-SDK-03 / 2026-03-27）

Task03 実装で、`plan()` / `improve()` は固定 root 前提の resource 読み込みだけでなく、manifest / explicit / env / home / repo を跨ぐ dynamic pipeline を使えるようになった。

| 要素 | canonical source | 役割 |
| --- | --- | --- |
| `getSkillCreatorRootCandidates()` | `apps/desktop/src/main/services/skill/constants.ts` | `explicit -> env -> home -> repo` の候補 root を列挙し、重複 path を除去する |
| `SkillCreatorSourceResolver` | `apps/desktop/src/main/services/runtime/SkillCreatorSourceResolver.ts` | required path を満たす candidate root を列挙し、`structure_mismatch` を判定する |
| `PhaseResourcePlanner` | `apps/desktop/src/main/services/runtime/PhaseResourcePlanner.ts` | `PhaseResourceRequest[]` を解決し、`selectedResourceIds` / `droppedResourceIds` / `degradeReasons` を確定する |
| `ResolvedResourceReader` | `apps/desktop/src/main/services/runtime/ResolvedResourceReader.ts` | selected absolute path を読み、必要時のみ legacy loader へ後方互換 fallback する |
| `PLAN_RESOURCE_REQUESTS` / `IMPROVE_RESOURCE_REQUESTS` | `apps/desktop/src/main/services/runtime/planPromptConstants.ts`, `apps/desktop/src/main/services/runtime/improvePromptConstants.ts` | plan / improve の required/optional resource と context budget を定義する |

`RuntimeSkillCreatorFacade` は public bridge のまま維持し、pipeline が返す `candidateRoots` / `selectedRoots` / `selectedResourceIds` / `droppedResourceIds` / `structureSignature` / `degradeReasons` を `SkillCreatorWorkflowSourceProvenance` へ固定する。public `RuntimeSkillCreatorPlanResponse` / `RuntimeSkillCreatorImproveResponse` の shape は変更しない。

### 実装ファイル

| ファイル | パス | 説明 |
| --- | --- | --- |
| RuntimeSkillCreatorFacade.ts | `apps/desktop/src/main/services/runtime/` | Facade 本体 |
| creatorHandlers.ts | `apps/desktop/src/main/ipc/` | IPC ハンドラ（internal helper） |

### 完了タスク

| タスクID | 完了日 | ステータス | 概要 |
| --- | --- | --- | --- |
| UT-SC-03-003 | 2026-03-24 | 完了 | DI 配線実装。setLLMAdapter Setter Injection + ResourceLoader コンストラクタ注入 + fire-and-forget async LLMAdapter。29テスト全PASS |
