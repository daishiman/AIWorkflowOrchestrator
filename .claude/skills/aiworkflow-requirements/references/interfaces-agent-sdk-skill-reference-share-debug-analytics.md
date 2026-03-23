# Agent SDK Skill 仕様 / reference bundle

> 親仕様書: [interfaces-agent-sdk-skill.md](interfaces-agent-sdk-skill.md)
> 役割: reference bundle

## スキル共有 型定義（TASK-9F）

`packages/shared/src/types/skill-share.ts` に定義されたスキル共有・インポート機能の型。

### 型一覧

| 型名                        | 定義元                                          | 用途                   |
| --------------------------- | ----------------------------------------------- | ---------------------- |
| `ShareSourceType`           | `packages/shared/src/types/skill-share.ts`     | ソース種別（union）    |
| `ShareDestinationType`      | 同上                                            | エクスポート先種別     |
| `ShareTarget`               | 同上                                            | インポートソース定義   |
| `ShareDestination`          | 同上                                            | エクスポート先定義     |
| `ShareImportResult`         | 同上                                            | インポート結果         |
| `ShareExportResult`         | 同上                                            | エクスポート結果       |
| `ShareValidateSourceResult` | 同上                                            | ソース検証結果         |
| `ShareErrorCategory`        | 同上                                            | エラーカテゴリ（union）|
| `ShareError`                | 同上                                            | エラー情報             |
| `ShareResult<T>`            | 同上                                            | Result パターン        |

### ShareTarget フィールド詳細

| フィールド | 型                | 必須条件                    | 説明                        |
| ---------- | ----------------- | --------------------------- | --------------------------- |
| `type`     | `ShareSourceType` | 常に必須                    | ソース種別                  |
| `repo`     | `string`          | `type="github"` 時に必須   | GitHub リポジトリ（`owner/repo`） |
| `branch`   | `string`          | `type="github"` 時にオプション | ブランチ名（デフォルト: `"main"`） |
| `path`     | `string`          | `type="github"` 時にオプション | リポジトリ内パス（デフォルト: `"/"`） |
| `gistId`   | `string`          | `type="gist"` 時に必須     | Gist ID                     |
| `localPath`| `string`          | `type="local"` 時に必須    | ローカルファイルパス        |
| `url`      | `string`          | `type="url"` 時に必須      | URL                         |

### Preload API（`skill-api.ts`）

| メソッド名       | 引数                                            | 戻り値                                      | チャネル                  |
| ---------------- | ----------------------------------------------- | ------------------------------------------- | ------------------------- |
| `importFromSource` | `source: ShareTarget`                         | `Promise<ShareResult<ShareImportResult>>`   | `skill:importFromSource`  |
| `exportSkill`    | `skillName: string, destination: ShareDestination` | `Promise<ShareResult<ShareExportResult>>` | `skill:export`            |
| `validateSource` | `source: ShareTarget`                          | `Promise<ShareResult<ShareValidateSourceResult>>` | `skill:validateSource` |

### 完了タスク

| タスクID | 完了日 | ステータス | 概要 |
| --- | --- | --- | --- |
| TASK-9F | 2026-02-27 | 完了 | 共有型定義10型新規作成、SkillShareManager実装、3チャネルIPCハンドラ、Preload API 3メソッド追加。92テスト全PASS（Line 94-100%, Branch 90-96%, Function 100%） |

### 実装時の苦戦箇所（TASK-9F）

| 苦戦箇所 | 問題 | 解決策 |
| --- | --- | --- |
| 型パス正本の混在 | `types/skill/<domain>.ts` 記述が仕様/監査に残り、参照先が揺れた | `types/index.ts` と `skill-<domain>.ts` の2系統へ統一し、型参照表と監査を同期 |
| `ShareTarget` の分岐契約の明示不足 | source type ごとの必須フィールドが呼び出し側で曖昧化しやすい | `ShareTarget` フィールド表で条件付き必須を明示し、バリデーション仕様と接続 |
| Phase 10 MINOR と型設計改善の切り分け | 改善候補（Discriminated Union化）が完了判定に混入しやすい | 改善分は UT-9F 未タスクへ分離し、完了タスクと残課題を分離管理 |

### 同種課題の簡潔解決手順（4ステップ）

1. 新規型を追加したら「型定義表 / Preload API / IPC契約」の3箇所を同時更新する。  
2. 条件付き必須フィールドは `type` ごとの表で明示し、ランタイムバリデーションと一致させる。  
3. 完了判定に含めない改善項目は未タスクへ分離して台帳管理する。  
4. 仕様反映後に `verify-all-specs` と `validate-phase-output` で整合を確認する。  

### 関連ワークフロー

- [TASK-9F ワークフロー](../../../../docs/30-workflows/completed-tasks/skill-share/)

---

## スキル公開・配布 契約参照（TASK-SKILL-LIFECYCLE-08 / spec_created）

TASK-9F の share 型に加えて、TASK-SKILL-LIFECYCLE-08 で publish/distribution 契約を設計済み。

| 契約 | 概要 | 実装ステータス |
| --- | --- | --- |
| `SkillPublishingMetadata` | 公開レベル別メタデータ（識別ユニオン） | 設計完了 |
| `SkillDistributionService` | `importSkill/exportSkill/forkSkill/shareSkill` | 設計完了 |
| `PublishReadiness` | 公開判定（4ステータス） | 設計完了 |
| `CompatibilityCheckResult` | 互換性評価（3レベル + suggested bump） | 設計完了 |

### 参照先

- `docs/30-workflows/skill-lifecycle-unification/tasks/step-06-seq-task-08-skill-publishing-version-compatibility/outputs/phase-5/service-interfaces.md`
- `docs/30-workflows/skill-lifecycle-unification/tasks/step-06-seq-task-08-skill-publishing-version-compatibility/outputs/phase-5/type-definitions.md`
- `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`

---

## スキルデバッグ 型定義（TASK-9H）

`packages/shared/src/types/skill-debug.ts` と `apps/desktop/src/preload/skill-api.ts` に定義されたスキルデバッグ機能の型契約。

### 型一覧

| 型名 | 定義元 | 用途 |
| --- | --- | --- |
| `DebugSessionStatus` | `packages/shared/src/types/skill-debug.ts` | セッション状態（idle/running/paused/completed/error） |
| `DebugSessionState` | 同上 | IPC転送用セッション状態 |
| `Breakpoint` / `BreakpointType` | 同上 | ブレークポイント定義 |
| `DebugStep` / `DebugStepType` | 同上 | ステップ実行履歴 |
| `DebugEvent` | 同上 | eventチャネル通知（Discriminated Union） |
| `DebugCommand` | 同上 | デバッグ操作コマンド |
| `DebugStartRequest` ほか6種 | 同上 | invokeチャネルのリクエスト/レスポンス型 |
| `DEBUG_CONSTANTS` | 同上 | セッション/式評価/上限値の定数 |

### Preload API（`skill-api.ts`）

| メソッド名 | 引数 | 戻り値 | チャネル |
| --- | --- | --- | --- |
| `startSession` | `request: DebugStartRequest` | `Promise<DebugSessionState>` | `skill:debug:start` |
| `executeCommand` | `request: DebugCommandRequest` | `Promise<void>` | `skill:debug:command` |
| `addBreakpoint` | `request: DebugBreakpointAddRequest` | `Promise<Breakpoint>` | `skill:debug:breakpoint:add` |
| `removeBreakpoint` | `request: DebugBreakpointRemoveRequest` | `Promise<void>` | `skill:debug:breakpoint:remove` |
| `inspectVariable` | `request: DebugInspectRequest` | `Promise<unknown>` | `skill:debug:inspect` |
| `evaluateExpression` | `request: DebugEvaluateRequest` | `Promise<DebugEvaluateResponse>` | `skill:debug:evaluate` |
| `onDebugEvent` | `callback: (event: DebugEvent) => void` | `() => void` | `skill:debug:event` |

### 実装上の苦戦箇所（TASK-9H）

| 苦戦箇所 | 問題 | 解決策 |
| --- | --- | --- |
| `skillHandlers.ts` 前提のドキュメント残存 | 実実装は `skillDebugHandlers.ts` 分離構成で差分が発生 | ワークフロー仕様・artifacts・テスト参照を `skillDebugHandlers.ts` / `skillDebugHandlers.test.ts` に統一 |
| IPC配線漏れ | ハンドラ実装済みでも `registerAllIpcHandlers` への登録がないと機能未到達 | `registerSkillDebugHandlers(mainWindow)` をメイン登録フローへ追加 |
| 状態遷移仕様と実装のズレ | paused -> error 遷移の扱いなどで仕様記述が古い | `VALID_DEBUG_TRANSITIONS` を正本として仕様書へ同期 |

### 同種課題の簡潔解決手順（4ステップ）

1. 追加型は `shared type` と `preload API` の両方で同時に契約表を更新する。  
2. event チャネルは invoke 契約表から分離し、購読APIとして記載する。  
3. 実装ファイル名が分離された場合、workflow/artifacts/tests の参照を一括で更新する。  
4. `skillDebugHandlers` の登録有無を `registerAllIpcHandlers` で必ず確認する。  

### 関連ワークフロー

- [TASK-9H ワークフロー](../../../../docs/30-workflows/TASK-9H-skill-debug/index.md)

---

## スキルドキュメント生成 型定義（TASK-9I）

`packages/shared/src/types/skill-docs.ts` に定義されたスキルドキュメント生成機能の型。

### 型一覧

| 型名 | 定義元 | 用途 |
| --- | --- | --- |
| `DocGenerationRequest` | `packages/shared/src/types/skill-docs.ts` | ドキュメント生成リクエスト |
| `GeneratedDoc` | 同上 | 生成結果本体 |
| `DocSection` | 同上 | セクション単位の出力 |
| `DocTemplate` | 同上 | テンプレート定義 |
| `TemplateSection` | 同上 | テンプレート内セクション定義 |

### DocGenerationRequest フィールド詳細

| フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `skillName` | `string` | ✓ | 対象スキル名（P42準拠非空文字列） |
| `outputFormat` | `"markdown" \| "html"` | ✓ | 出力形式 |
| `includeExamples` | `boolean` | ✓ | examples セクション生成有無 |
| `includeApiReference` | `boolean` | ✓ | API セクション生成有無 |
| `language` | `"ja" \| "en"` | ✓ | 生成言語 |
| `customSections` | `string[] \| undefined` | - | 追加セクション名 |

### GeneratedDoc フィールド詳細

| フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `skillName` | `string` | ✓ | 対象スキル名 |
| `format` | `"markdown" \| "html"` | ✓ | 生成形式 |
| `content` | `string` | ✓ | 生成ドキュメント全文 |
| `sections` | `DocSection[]` | ✓ | セクション一覧 |
| `generatedAt` | `string` | ✓ | 生成日時（ISO 8601） |
| `wordCount` | `number` | ✓ | 文字数合計 |

### Preload API（`skill-api.ts`）

| メソッド名 | 引数 | 戻り値 | チャネル |
| --- | --- | --- | --- |
| `docsGenerate` | `request: DocGenerationRequest` | `Promise<GeneratedDoc>` | `skill:docs:generate` |
| `docsPreview` | `skillName: string, template?: DocTemplate` | `Promise<GeneratedDoc>` | `skill:docs:preview` |
| `docsExport` | `doc: GeneratedDoc, outputPath: string` | `Promise<void>` | `skill:docs:export` |
| `docsTemplates` | なし | `Promise<DocTemplate[]>` | `skill:docs:templates` |

### 完了タスク

| タスクID | 完了日 | ステータス | 概要 |
| --- | --- | --- | --- |
| TASK-9I | 2026-02-28 | 完了 | docs 型定義5種追加、Preload API 4メソッド追加、IPC 4チャネル連携、テスト64件（desktop 56 + shared 8）PASS |

### 関連ワークフロー

- [TASK-9I ワークフロー](../../../../docs/30-workflows/completed-tasks/TASK-9I-skill-docs/)

### 関連未タスク（TASK-9I）

| タスクID | 内容 | 優先度 | タスク仕様書 |
| --- | --- | --- | --- |
| UT-9I-001 | SkillDocGenerator の LLM プロバイダ連携実装 | 中 | `docs/30-workflows/completed-tasks/TASK-9I-skill-docs/unassigned-task/task-ut-9i-001-llm-provider-integration.md` |
| UT-9I-002 | ドキュメントテンプレート CRUD 機能実装 | 低 | `docs/30-workflows/completed-tasks/TASK-9I-skill-docs/unassigned-task/task-ut-9i-002-template-crud.md` |

---

## Skill Docs Runtime Integration 型定義（TASK-IMP-SKILL-DOCS-AI-RUNTIME-001）

### Skill Docs Runtime Integration 型定義 (TASK-IMP-SKILL-DOCS-AI-RUNTIME-001)

#### DocOperationResult<T>
```typescript
interface DocOperationResult<T> {
  success: boolean;
  data?: T;
  error?: DocError;
}
```

#### DocError
```typescript
interface DocError {
  code: number;          // 1001-5001
  category: DocErrorCategory; // "VALIDATION" | "BUSINESS" | "EXTERNAL_SERVICE" | "INFRASTRUCTURE" | "INTERNAL"
  message: string;
  retryable: boolean;
  guidance?: DocErrorGuidance;
}
```

#### DocErrorGuidance
```typescript
interface DocErrorGuidance {
  reason: string;
  action: string;
  handoffAvailable: boolean;
}
```

#### ILLMDocQueryAdapter
```typescript
interface ILLMDocQueryAdapter {
  query(prompt: string): Promise<DocOperationResult<string>>;
  isAvailable(): Promise<boolean>;
  getProviderName(): string;
}
```

#### SkillDocsCapabilityResult
```typescript
type SkillDocsCapability = "integrated-api" | "guidance-only" | "terminal-handoff";
interface SkillDocsCapabilityResult {
  capability: SkillDocsCapability;
  provider?: string;
  guidance?: string;
  reason?: string;
}
```

**実装ファイル**:
- `packages/shared/src/types/skill-docs.ts`
- `apps/desktop/src/main/services/skill/LLMDocQueryAdapter.ts`
- `apps/desktop/src/main/services/skill/SkillDocsCapabilityResolver.ts`

**完了タスク**: TASK-IMP-SKILL-DOCS-AI-RUNTIME-001（2026-03-16）

> 未タスク: [UT-SKILL-DOCS-TERMINAL-HANDOFF-001](../../../docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/task-ut-skill-docs-terminal-handoff-001.md) — terminal-handoff 実パス実装

### Consumer Adapter: toHandoffGuidance()（TASK-IMP-TERMINAL-HANDOFF-SURFACE-REALIZATION-001）

各 consumer の出力を `HandoffGuidance` 統一 DTO へ変換する adapter 関数群。

**配置先**: `packages/shared/src/types/handoff.ts`（UT-TERMINAL-HANDOFF-ADAPTER-PLACEMENT-001 解決時に確定）

**Consumer → DTO マッピング**:

| Consumer | 入力型 | 変換関数 | surfaceType |
|----------|--------|----------|-------------|
| Chat Edit | TerminalHandoffBundle | toHandoffGuidance | "chat-edit" |
| Runtime | TerminalHandoffBundle | toHandoffGuidance | "runtime" |
| Skill Docs | SkillDocsCapabilityResult | skillDocsToHandoffGuidance | "skill-docs" |
| Agent Execution | TerminalHandoffBundle | toHandoffGuidance | "chat-edit" |
| Manual Launcher | - (direct construction) | - | "manual" |

#### 関連未タスク

- UT-TERMINAL-HANDOFF-ADAPTER-PLACEMENT-001: adapter 配置先確定
- UT-SKILLDOCS-TERMINAL-HANDOFF-PATH-001: SkillDocs → Terminal Handoff 導線接続
- UT-GUIDANCE-BLOCK-PROPS-UNIFICATION-001: GuidanceBlock Props 型統一

---

## スキル分析 型定義（TASK-9J）

> 完了タスク: TASK-9J（2026-02-28）
> 定義ファイル: `packages/shared/src/types/skill-analytics.ts`

### 8インターフェース一覧

| 型名 | 用途 | 主要フィールド |
| --- | --- | --- |
| SkillUsageEvent | 使用イベントの記録単位 | id, skillName, eventType, timestamp, success, toolsUsed |
| ToolUsageStat | ツール別使用統計 | toolName, count, percentage |
| SkillStatistics | スキル別の集計統計 | skillName, totalExecutions, successRate, averageDuration |
| AnalyticsPeriod | 集計期間 | start, end, granularity ("hour"/"day"/"week"/"month") |
| TrendDataPoint | トレンドの1データポイント | timestamp, executions, errors, avgDuration |
| UsageTrend | 時系列トレンドデータ | period, dataPoints |
| SkillUsageSummary | スキル別集計サマリー | skillName, executionCount, lastUsed |
| AnalyticsSummary | 全スキルの総合サマリー | totalSkills, totalExecutions, overallSuccessRate, mostUsedSkills[], recentActivity[] |

### IPC チャネルマッピング

| Preload API メソッド | IPC チャネル | 戻り値型 |
| --- | --- | --- |
| analyticsRecord | skill:analytics:record | SkillUsageEvent |
| analyticsStatistics | skill:analytics:statistics | SkillStatistics |
| analyticsSummary | skill:analytics:summary | AnalyticsSummary |
| analyticsTrend | skill:analytics:trend | UsageTrend |
| analyticsExport | skill:analytics:export | string |

### 完了タスク

| タスクID | 完了日 | 内容 |
| --- | --- | --- |
| TASK-9J | 2026-02-28 | スキル分析・統計機能の型定義（8インターフェース）とIPC実装 |

### 実装時の苦戦箇所（TASK-9J）

| 苦戦箇所 | 課題 | 対処 | 標準ルール |
| --- | --- | --- | --- |
| 共有型の公開面同期漏れ | `src/types` 追加だけでは `@repo/shared` から参照できない | `packages/shared/index.ts` に `skill-analytics` の再エクスポートを追加 | 共有型は `definition + types/index + package index` の3点同期を必須化 |
| Preload API命名ドリフト | 仕様書 `recordAnalytics` と実装 `analyticsRecord` が混在 | `skill-api.ts` を正本にして interfaces/api-ipc を同一ターン同期 | API命名は実装正本から一方向同期する |

### 関連未タスク（TASK-9J）

| タスクID | タスク名 | 優先度 | タスク仕様書 |
| --- | --- | --- | --- |
| ~~UT-IMP-TASK9J-PHASE12-IPC-SYNC-AUTO-VERIFY-001~~ | ~~TASK-9J Phase 12 IPC同期自動検証ガード（5仕様書同期 + handler/register/preload 三点突合）~~ | ~~中~~ | `docs/30-workflows/completed-tasks/unassigned-task/task-imp-task9j-phase12-ipc-sync-auto-verify-001.md` |

---

## assertNoSilentFallback ガード（P62 対策）

UT-EXECUTION-ENV-TERMINAL-001 で実装。Provider/Model 未選択時に DEFAULT_CONFIG への暗黙 fallback を防止するランタイムガード。

| 項目       | 値                                                                 |
| ---------- | ------------------------------------------------------------------ |
| 配置       | `apps/desktop/src/main/ipc/llmConfigProvider.ts`                   |
| 関数名     | `assertNoSilentFallback()`                                         |
| 戻り値型   | `SelectedLLMConfig`（non-null 保証）                               |
| 例外       | `LLMConfigNotSelectedError`（code: `LLM_CONFIG_NOT_SELECTED`）     |
| 責務       | LLM 呼び出し前に Provider/Model 未選択を検出し、暗黙 fallback 防止 |
| 関連タスク | UT-EXECUTION-ENV-TERMINAL-001                                      |

#### 関連未タスク

- UT-ASSERT-NO-SILENT-FALLBACK-WIRING-001: 既存 LLM エントリポイント（`aiHandlers.ts` 等）への結線
- UT-EXECUTION-ENV-TERMINAL-RENDERER-ERROR-UI-001: Renderer 側エラー表示 UI（`terminal-config-error`）

---
