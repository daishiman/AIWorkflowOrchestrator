# Electron Main Process サービス / detail specification — Part 2: 高度なサービス・統合・永続化

> 親仕様書: [arch-electron-services.md](arch-electron-services.md)
> 分割元: [arch-electron-services-details.md](arch-electron-services-details.md)
> Part 1: [arch-electron-services-details-part1.md](arch-electron-services-details-part1.md)
> 役割: detail specification（SkillForker・RuntimeResolver・SkillScheduler・DI統合・永続化）

## SkillForker（TASK-9E）

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

## RuntimeResolver（runtime routing 共通化 — UT-IMP-SKILL-AGENT-RUNTIME-ROUTING-INTEGRATION-CLOSURE-001）

> **実装完了**: 2026-03-15
> **実装場所**: `apps/desktop/src/main/services/runtime/RuntimeResolver.ts`

`RuntimeResolver` は `skill:execute` / `agent:start` の runtime 判定を共通化するサービス。`ChatEditRuntimeResolver`（`services/chat-edit/RuntimeResolver.ts`）から LLMAdapter 依存を除去し、認証判定のみに特化した共通版。

### コンポーネント構成

| コンポーネント | ファイル | 責務 |
| --- | --- | --- |
| `RuntimeResolver` | `services/runtime/RuntimeResolver.ts` | 認証状態に基づく `integrated` / `handoff` 判定 |
| `ChatEditRuntimeResolver` | `services/chat-edit/RuntimeResolver.ts` | chat-edit 用の `RuntimeResolver`（LLMAdapter 生成含む） |

### RuntimeResolution 型

```typescript
export type RuntimeResolution =
  | { type: "integrated" }
  | { type: "handoff"; reason: string };
```

- `integrated`: API キー有効 → 既存実行フロー続行
- `handoff`: subscription モードまたは API キー未設定 → `HandoffGuidance` 応答を返す

### RuntimeResolver API

| メソッド | シグネチャ | 説明 |
| --- | --- | --- |
| `resolve` | `() => Promise<RuntimeResolution>` | authMode と API キー有無で判定 |

### 判定ロジック

| 条件 | 結果 | reason |
| --- | --- | --- |
| `authMode === "subscription"` | `handoff` | `"subscription mode: use Claude Code CLI"` |
| `hasKey() === false` | `handoff` | `"API key not configured"` |
| `getKey() === null` | `handoff` | `"API key unavailable"` |
| 上記以外 | `integrated` | — |

### DI と Composition Root

`ipc/index.ts` の `registerAllIpcHandlers()` で `new RuntimeResolver(authKeyService, authModeService)` を1回生成し、`registerAgentExecutionHandlers` / `registerSkillHandlers` / chat-edit ハンドラの3箇所へ注入する（P5 二重登録防止）。chat-edit は `ChatEditRuntimeResolver` alias で別 import。

### Handoff 応答パターン

| チャンネル | handoff 応答形式 | 備考 |
| --- | --- | --- |
| `skill:execute` | `{ success: true, data: { success: false, handoff: true, guidance, error } }` | IPC envelope 維持 |
| `agent:start` | `{ success: false, handoff: true, guidance, error }` | 直接応答 |

### テスト

| テストファイル | テスト数 | 検証内容 |
| --- | --- | --- |
| `services/runtime/__tests__/RuntimeResolver.test.ts` | 8 | subscription/apiKey判定 |
| `ipc/__tests__/skillHandlers.runtime.test.ts` | 3 | skill handoff 分岐 |
| `ipc/__tests__/agentHandlers.runtime.test.ts` | 2 | agent handoff 分岐 |

### 苦戦箇所

| 苦戦箇所 | 再発条件 | 対処 |
| --- | --- | --- |
| ChatEditRuntimeResolver との alias import 衝突 | 同名クラスを異なるパスから import | `import { RuntimeResolver as ChatEditRuntimeResolver }` で alias 分離 |
| Composition Root でのサービススコープ制限（P60） | authModeService が track() 内スコープに閉じる | 共通消費者の外側スコープで生成 |
| optional parameter による後方互換維持 | 既存テスト・呼び出し元の一括修正が必要 | `runtimeResolver?` で既存動作を保証 |

### 関連タスク

| タスクID | 概要 | ステータス |
| --- | --- | --- |
| UT-IMP-SKILL-AGENT-RUNTIME-ROUTING-INTEGRATION-CLOSURE-001 | Skill/Agent runtime routing 統合クロージャ | 完了（2026-03-15） |

## RuntimePolicyResolver（TASK-SC-02-RUNTIME-POLICY-CLOSURE）

> 完了日: 2026-03-22

### インターフェース

| メソッド | 引数 | 戻り値 | 説明 |
| --- | --- | --- | --- |
| `resolve(authMode, apiKey)` | `AuthMode`, `string \| null` | `Promise<RuntimeDecision>` | apiKey + subscription 判定で3パターン分岐 |
| `resolveWithService(authMode)` | `AuthMode` | `Promise<RuntimeDecision>` | AuthKeyService から apiKey を自動取得して resolve() を呼ぶ |

### RuntimeDecision 型

| type | 条件 | フィールド |
| --- | --- | --- |
| `integrated_api` | apiKey.trim() !== "" | `apiKey`, `permissionMode` |
| `terminal_handoff` | subscription 有効 or no-auth | `bundle: TerminalHandoffBundle` |

### DI 構成

| 依存 | 型 | optional | 未注入時 |
| --- | --- | --- | --- |
| authKeyService | IAuthKeyService | Yes | apiKey = null |
| subscriptionAuthProvider | ISubscriptionAuthProvider | Yes | subscription = false (no-auth) |

### graceful degradation

AuthKeyService/SubscriptionAuthProvider の例外時は terminal_handoff (no-auth) にフォールバック。DEFAULT_CONFIG への暗黙 fallback は禁止（P62）。

### RuntimeSkillCreatorFacade との統合（UT-SC-02-002）

> 完了日: 2026-03-23

`RuntimeSkillCreatorFacade` の全3メソッドで terminal_handoff 早期リターンパターンが統一済み。Task02 では facade から workflow state owner を切り離し、`SkillCreatorWorkflowEngine` に phase/state/artifact ownership を集約した。2026-03-26 の follow-up 実装で failure lifecycle も同 owner に寄せ、reject / `success:false` / verify review の全経路を review-ready state として記録する。2026-04-04 の execute/improve guard follow-up では、`execute()` の adapter failed / initializing path に `RuntimeSkillCreatorExecuteErrorResponse` を追加し、`SkillCreatorWorkflowEngine.recordExecuteAdapterFailure()` で review-ready snapshot を即時保存する current fact へ更新した。同 wave で `verifyAndImproveLoop()` の improve failure path は `SkillCreatorWorkflowEngine.recordImproveFailure()` を経由するように統一し、Facade 側の `recordImproveFailureSnapshot()` は engine 実装差を吸収する bridge として扱う current fact へ更新した。

| メソッド | terminal_handoff 分岐 | Union型 | 追加タスク |
| --- | --- | --- | --- |
| `plan()` | 有（TASK-SC-02-RUNTIME-POLICY-CLOSURE） | `RuntimeSkillCreatorPlanResponse` | review state を engine へ記録 |
| `execute()` | 有（UT-SC-02-002 / TASK-SDK-02 / UT-IMP-RUNTIME-WORKFLOW-ENGINE-FAILURE-LIFECYCLE-001） | `RuntimeSkillCreatorExecuteResponse` | handoff 時は executor 非実行、integrated success は verify phase、`success:false` / reject は review phase + `verification_review` へ遷移 |
| `improve()` | 有（TASK-SC-02-RUNTIME-POLICY-CLOSURE） | `RuntimeSkillCreatorImproveResponse` | -- |

`RuntimeSkillCreatorExecuteResponse` は `packages/shared/src/types/skillCreator.ts` に追加し、`packages/shared/src/types/index.ts` からバレルエクスポート済み。`creatorHandlers.ts` の `skill-creator:execute-plan` 戻り値型も更新済み。Preload 側型定義は UT-SC-02-005 で完了（2026-03-25）。Task02 では `ResourceLoader.getBasePath()` を provenance source として engine の `resumeTokenEnvelope.sourceProvenance` に固定した。failure lifecycle follow-up では `assertTransition()` と `ensureReviewReadyState()` を追加し、plan 起点互換を維持しながら invalid jump を拒否し、artifacts を append で保持する current fact に揃えた。

### workflow manifest foundation（TASK-SDK-01 → TASK-SDK-02 handoff）

Task01 で固定した workflow manifest contract は、Task02 以降の runtime orchestration が consume する foundation input として扱う。

| コンポーネント | 役割 | 非責務 |
| --- | --- | --- |
| `ManifestLoader` | `workflow-manifest.json` の read / validate / normalize / cache | route decision、phase 遷移、permission/session authority |
| `WorkflowManifest*` 型群 | manifest schema の shared contract | public IPC response 型の代替 |
| `SkillCreatorWorkflowEngine` | phase/state owner と artifact ownership、`resumeTokenEnvelope` / verify state の保持 | manifest schema 解釈の source of truth 化 |

`ManifestLoader` は foundation service であり、`RuntimeSkillCreatorFacade` や `RuntimePolicyResolver` と同じ authority layer に昇格させない。owner 分離の正本は Task02 workflow 仕様書に従う。

Task08 session persistence/resume contract では、上記 owner 分離を保ったまま `SkillCreatorWorkflowEngine` snapshot を checkpoint repository へ受け渡す。`resumeTokenEnvelope` は persisted payload の代替ではなく、compatibility evaluator は `routeSnapshot` / `sourceProvenance` / revision / lease を使って restore 可否を判定する。resume を public expose する場合も `agent:resumeSession` とは別の `skill-creator:*` namespace に置く。

### TASK-UT-RT-01-EXECUTE-IMPROVE-ADAPTER-GUARD-001（2026-04-04）

`execute()` と `improve()` の先頭に LLMAdapter ステータス確認ガードを追加し、graceful degradation を実現した。

#### LLMAdapter ステータス管理

| ステータス | 意味 | 動作 |
| --- | --- | --- |
| `initializing` | 初期値（LLMAdapter 注入前）| `execute()` / `improve()` は即時 error response を返す |
| `ready` | `setLLMAdapter()` 呼び出し後 | 通常フローを継続 |
| `failed` | `setLLMAdapterFailed()` 呼び出し後 | `execute()` / `improve()` は即時 error response を返す |

- `failed` / `initializing` の場合、`execute()` は `RuntimeSkillCreatorExecuteErrorResponse`（`{ success: false, error: { code: "llm_adapter_unavailable", message } }`）を返す
- `failed` / `initializing` の場合、`improve()` は `RuntimeSkillCreatorImproveResponse`（`success: false`）を返す
- `execute()` の adapter failed / initializing path では `SkillCreatorWorkflowEngine.recordExecuteAdapterFailure()` を呼び出して review-ready snapshot を即時保存する

#### SkillCreatorWorkflowEngine.recordImproveFailure()

| メソッド | 引数 | 戻り値 | 説明 |
| --- | --- | --- | --- |
| `recordImproveFailure` | `planId: string, message: string` | `SkillCreatorWorkflowStateSnapshot` | improve フェーズで失敗した内容を記録。phase は improve のまま維持し、verifyResult の message / nextAction を更新する |

`verifyAndImproveLoop()` の improve failure path は `recordImproveFailureSnapshot()` を経由し、engine の `recordImproveFailure()` が実装されている場合はそれを呼び出す（bridge パターン）。

#### 型定義拡張（packages/shared/src/types/skillCreator.ts）

| 型 | 定義 | 用途 |
| --- | --- | --- |
| `RuntimeSkillCreatorExecuteErrorResponse` | `{ success: false; error: { code: RuntimeSkillCreatorDegradedReason; message: string } }` | execute() の adapter status failure を表す structured error |
| `RuntimeSkillCreatorExecuteResponse` | `RuntimeSkillCreatorExecuteResult \| { type: "terminal_handoff"; bundle } \| RuntimeSkillCreatorExecuteErrorResponse` | execute の全戻り値を網羅する union 型 |

`RuntimeSkillCreatorExecuteErrorResponse` は `packages/shared/src/types/index.ts` からバレルエクスポート済み。renderer 側 consumer（`SkillCreateWizard.tsx` / `SkillLifecyclePanel.tsx`）は `success === false` を type guard で判定して message へ正規化する。

### Task03 dynamic source / selection hardening（2026-03-27）

Task03 実装では、workflow manifest foundation の上に source discovery と resource selection の internal layer を追加した。

| コンポーネント | 役割 | 非責務 |
| --- | --- | --- |
| `SkillCreatorSourceResolver` | manifest / explicit / env / home / repo の candidate root を列挙し、required path の不足を `structure_mismatch` として検出 | prompt 組み立て、budget 削減、public response 生成 |
| `PhaseResourcePlanner` | operation ごとの required/optional resource を解決し、budget 超過時に drop 順と `degradeReasons` を確定 | source authority、shared contract 変更 |
| `ResolvedResourceReader` | selected absolute path を優先読込し、legacy `ResourceLoader` を compatibility fallback に限定 | root 選定、owner 判定 |
| `RuntimeSkillCreatorFacade` | pipeline を呼び出して `sourceProvenance` を engine snapshot へ橋渡しする public bridge | state owner、manifest schema owner |

この追加は internal hardening であり、`RuntimeSkillCreatorPlanResponse` / `RuntimeSkillCreatorImproveResponse` の public shape は変更しない。`execute()` の内部 contract には `RuntimeSkillCreatorExecuteResponse` を残すが、TASK-FIX-EXECUTE-PLAN-FF-001 以降の `skill-creator:execute-plan` public surface は `{ accepted: true, planId }` ack + snapshot relay に分離された。一方で `SkillCreatorWorkflowSourceProvenance` は `candidateRoots` / `selectedRoots` / `selectedResourceIds` / `droppedResourceIds` / `structureSignature` / `degradeReasons` を持つ current fact に更新された。

### verify→improve ループの feedback memory 構造化（task-ut-p0-02-001-repeat-feedback-memory）

> 完了日: 2026-04-03

`verifyAndImproveLoop()` 内の feedback memory を `previousImproveSummary: string` から `feedbackHistory: ImproveFeedbackHistory[]` に構造化した。各 improve 試行後に `{ attempt, failedChecks: string[], improveSummary: string }` を配列に蓄積し、`buildImproveFeedback()` が全試行の履歴を構造化フォーマットで出力する。

| 変更前 | 変更後 |
| --- | --- |
| `previousImproveSummary: string`（直前1回分のみ） | `feedbackHistory: ImproveFeedbackHistory[]`（全試行蓄積） |
| `buildImproveFeedback(checks, string)` | `buildImproveFeedback(checks, ImproveFeedbackHistory[])` |
| 「前回の改善要約」セクション | 「過去の改善試行履歴（N回試行済み）」セクション + 繰り返し失敗チェック警告 |

`ImproveFeedbackHistory` 型は `packages/shared/src/types/skillCreator.ts` に定義し、`index.ts` からバレルエクスポート済み。

## Slide RuntimeResolver 採用計画（TASK-IMP-SLIDE-AI-RUNTIME-ALIGNMENT-001）

> **ステータス**: `spec_created`（2026-03-19 再監査同期）

slide 経路でも `RuntimeResolver` を共通採用し、`agent-client.ts` / `modifier-skill.ts` の legacy path を `skill-executor.ts` に統合する。

### DI 配線の正本

| ステップ | 処理 | 実装先 |
| --- | --- | --- |
| 1 | `registerAllIpcHandlers()` で `RuntimeResolver` を 1 回生成する | `apps/desktop/src/main/ipc/index.ts` |
| 2 | slide handler 登録時に resolver / auth services を注入する | `apps/desktop/src/main/slide/ipc-handlers.ts` |
| 3 | `skill-executor.ts` が `integrated` / `handoff` を判定する | `apps/desktop/src/main/slide/skill-executor.ts` |
| 4 | `handoffGuidance` を Renderer へ返し、UI は terminal launcher を出す | `apps/desktop/src/renderer/slide/SlideWorkspace.tsx` |

### 責務境界

| コンポーネント | 責務 |
| --- | --- |
| `RuntimeResolver` | auth mode / API key 有無による `integrated` / `handoff` 判定 |
| `slide/ipc-handlers.ts` | sender 検証 + payload 検証 + service 委譲 |
| `slide/skill-executor.ts` | slide phase 実行と handoff result 生成 |
| `slide/sync-manager.ts` | reverse-sync / watcher / status authority |
| `slide/agent-client.ts` | 廃止予定（direct SDK path） |
| `slide/modifier-skill.ts` | 廃止予定（独立 modifier path） |

### DI 配線の正本（完了設計）

> **完了タスク**: TASK-IMP-SLIDE-AI-RUNTIME-ALIGNMENT-001（spec_created, 2026-03-19）

| コンポーネント | 依存インターフェース | P61対策（DIP準拠） |
| --- | --- | --- |
| `registerSlideIpcHandlers` | `ISyncManager`, `ISkillExecutor` | 具象クラスではなくインターフェースを引数に受け取る |
| `skill-executor.ts` | `IAuthKeyService`, `IAuthModeService` | `RuntimeResolver.resolve()` で `integrated` / `handoff` を判定 |
| `agent-client.ts` | — | 廃止予定（Direct SDK / electron-store / env fallback path を排除） |

**廃止対象サービスとその代替**:

| 廃止対象 | 代替 | 理由 |
| --- | --- | --- |
| `agent-client.ts` の Direct SDK 呼び出し | `skill-executor.ts` + `RuntimeResolver` 経由 | safeStorage/env fallback の legacy path を排除 |
| `modifier-skill.ts` の独立実装 | `skill-executor.ts` の `phase === "modifier"` 分岐 | 単一実行面へ統合 |

### current drift（2026-03-19）

| 項目 | 現状 |
| --- | --- |
| slide handler 登録 | `registerSlideIpcHandlers()` が `ipc/index.ts` へ未接続 |
| runtime 判定 | slide path で `RuntimeResolver` 未使用 |
| agent client | `@anthropic-ai/sdk` / `safeStorage` / `electron-store` / env fallback を直接利用 |
| modifier path | `modifier-skill.ts` が独立実装のまま残存 |

### follow-up

| 未タスクID | 内容 |
| --- | --- |
| `UT-SLIDE-IMPL-001` | slide runtime/auth-mode 実装収束 |
| `UT-SLIDE-UI-001` | SlideWorkspace UI 4領域実装 |

## SkillScheduler / ScheduleStore（TASK-9G）

スキルスケジュール実行は、Facade の `SkillService` とは独立した専用サービスで構成する。

| コンポーネント | 責務 | 実装ファイル |
| --- | --- | --- |
| `ScheduleStore` | `electron-store` への CRUD 永続化、実行履歴最大100件管理、復元時バリデーション（P19） | `apps/desktop/src/main/services/skill/ScheduleStore.ts` |
| `SkillScheduler` | cron / interval / once / event のジョブ登録・停止、次回実行時刻計算、実行結果記録 | `apps/desktop/src/main/services/skill/SkillScheduler.ts` |
| `registerSkillScheduleHandlers` | 5チャネルの IPC 境界（sender 検証 + P42 バリデーション + エラー正規化） | `apps/desktop/src/main/ipc/skillHandlers.ts` |

### 初期化配線（Main Process）

`registerAllIpcHandlers`（`apps/desktop/src/main/ipc/index.ts`）で以下の順に初期化する。

1. `new ScheduleStore()`
2. `new SkillScheduler(scheduleStore, schedulerExecutorAdapter)`
3. `skillScheduler.initialize()`（非同期・非ブロッキング）
4. `registerSkillScheduleHandlers(mainWindow, skillScheduler, scheduleStore)`

### SchedulerSkillExecutor アダプタ

`SkillScheduler` は `SchedulerSkillExecutor` インターフェースに依存し、`skillService.executeSkill()` を呼び出すアダプタで接続する。

| 観点 | 設計方針 |
| --- | --- |
| 依存関係 | Scheduler は SkillService 実装詳細を知らない（DI） |
| テスタビリティ | `SchedulerSkillExecutor` をモック可能 |
| 責務分離 | 実行制御（Scheduler）とスキル実行本体（SkillService）を分離 |

## DefaultSafetyGate サービス（UT-06-003）

> **実装完了**: UT-06-003

スキル安全性評価サービス。SafetyGatePort インターフェースの具象実装であり、スキル公開前の安全性チェックを実行する。

### ファイル構成

| ファイル | 責務 |
| --- | --- |
| `apps/desktop/src/main/permissions/default-safety-gate.ts` | DefaultSafetyGate 具象クラス |
| `apps/desktop/src/main/permissions/safety-gate.ts` | SafetyGatePort インターフェース定義 |
| `packages/shared/src/types/safety-gate.ts` | SafetyGateResult 等の共有型定義 |
| `apps/desktop/src/main/ipc/safetyGateHandlers.ts` | IPC ハンドラ登録関数（`registerSafetyGateHandlers`） |

### DI 構造

`DefaultSafetyGate` は `DefaultSafetyGateDeps` を受け取る Constructor Injection パターンで構成される。

| 依存 | 型 | 説明 |
| --- | --- | --- |
| `permissionStore` | PermissionStore | 権限ストアへのアクセス |
| `metadataProvider` | MetadataProvider | スキルメタデータの取得 |
| `protectedPaths` | string[] | 保護対象パス一覧 |

### IPC ハンドラ登録

`registerSafetyGateHandlers` は `skill:evaluate-safety` チャネルの IPC ハンドラを登録する。
詳細は [api-ipc-agent-safety.md](api-ipc-agent-safety.md) を参照。

### PermissionStore 共有パターン（ipc/index.ts）

`PermissionStore` インスタンスを `registerAllIpcHandlers()` 内のスコープ外（関数先頭）で1回生成し、`registerSafetyGateHandlers` と `registerSkillHandlers` の両方へ同一インスタンスを注入する。

| 観点 | 説明 |
| --- | --- |
| 共有理由 | SafetyGate の評価結果が PermissionStore の許可状態に依存するため |
| インスタンス数 | 1（関数スコープ内シングルトン） |
| P5 対策 | safeRegister パターンで ipcMain.handle() 二重登録を防止 |
| 実装タスク | TASK-SAFETY-GATE（UT-06-003） |

### 関連未タスク

| 未タスクID | 概要 | 優先度 | 指示書 |
| --- | --- | --- | --- |
| UT-06-003-PRELOAD-API-IMPL | Preload 層 safeInvoke 呼び出し追加 | 高 | `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/task-ut-06-003-preload-api-impl.md` |
| UT-06-003-METADATA-PROVIDER-IMPL | stub → 実 SkillMetadataProvider 実装 | 中 | `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/task-ut-06-003-metadata-provider-impl.md` |
| UT-06-003-DIP-REFACTOR | unregisterSafetyGateHandlers 追加（P5 対策） | 中 | `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/task-ut-06-003-dip-refactor.md` |

---

## SkillService と SkillExecutor の統合（TASK-FIX-7-1）

> **実装完了**: 2026-02-11（TASK-FIX-7-1）

SkillService は Facade パターンで SkillExecutor への実行委譲を行う。

### Setter Injection パターン

SkillExecutor は `registerSkillHandlers()` 内で生成され、`setSkillExecutor()` で SkillService に注入される。

| ステップ | 処理 | ファイル |
|----------|------|----------|
| 1 | `registerSkillHandlers(mainWindow, skillService, authKeyService)` 呼び出し | `main/ipc/index.ts` |
| 2 | `new SkillExecutor(mainWindow, undefined, authKeyService)` でインスタンス生成 | `skillHandlers.ts` |
| 3 | `skillService.setSkillExecutor(executor)` で注入 | `skillHandlers.ts` |
| 4 | `skillService.executeSkill()` が内部で `skillExecutor.execute()` を呼び出し | `SkillService.ts` |

### 設計根拠

| 観点 | 説明 |
|------|------|
| 遅延初期化 | SkillExecutor は mainWindow を必要とするため、ハンドラー登録時に生成 |
| 単一責務 | SkillService はスキル管理、SkillExecutor は実行に責務を分離 |
| テスタビリティ | SkillExecutor をモックに差し替え可能 |

## Runtime routing / handoff DI 統合（UT-IMP-SKILL-AGENT-RUNTIME-ROUTING-INTEGRATION-CLOSURE-001）

`skill:execute` と `agent:start` は `RuntimeResolver` の判定結果で `integrated` / `handoff` を分岐する。Main 側では resolver と handoff builder を同一初期化タイミングで注入し、Skill/Agent の両経路で契約を統一する。

### Composition root 配線

| ステップ | 処理 | 実装ファイル |
| --- | --- | --- |
| 1 | `new RuntimeResolver(authModeService, authKeyService)` を生成 | `main/ipc/index.ts` |
| 2 | `new TerminalHandoffBuilder()` を生成 | `main/ipc/index.ts` |
| 3 | `registerSkillHandlers(mainWindow, skillService, authKeyService, runtimeResolver, handoffBuilder)` を登録 | `main/ipc/index.ts` |
| 4 | `registerAgentExecutionHandlers(mainWindow, authKeyService, runtimeResolver, handoffBuilder)` を登録 | `main/ipc/index.ts` |

### Runtime 分岐契約

| チャネル | integrated 条件 | handoff 条件 | handoff 応答 |
| --- | --- | --- | --- |
| `skill:execute` | `authMode=api-key` かつ API key 有効 | `authMode=subscription` または API key 未設定 | IPC envelope 内で `handoff=true` と `guidance` を返す |
| `agent:start` | `authMode=api-key` かつ API key 有効 | `authMode=subscription` または API key 未設定 | `success=false, handoff=true, guidance` を返す |

### セキュリティ境界

| 項目 | 方針 |
| --- | --- |
| 秘匿情報 | `TerminalHandoffBuilder` は API key を返さず、`terminalCommand/contextSummary/reason` のみ返却 |
| 既存契約維持 | `skill:execute` は `safeInvokeUnwrap` 互換の IPC envelope を維持 |
| Preload 契約 | Agent 実行は `AGENT_EXECUTION_*` チャネルへ統一し、旧 `agent:*` との差分を吸収 |

## キャッシュ機構

- スキャン結果はメモリにキャッシュ（TTLベース無効化）
- `clearCache()`で手動クリア可能
- アプリ再起動でキャッシュはクリア

## 永続化

- インポート状態は`electron-store`で永続化
- アプリ再起動後もインポート状態を維持
- ストレージキー: `importedSkillIds`

## SkillImportManager 永続化実装詳細（TASK-FIX-4-2）

> **実装完了**: 2026-02-07（TASK-FIX-4-2）
> **参照**: [error-handling.md](./error-handling.md) 外部ストレージフォールバックパターン

### 型バリデーション関数

外部ストレージからの値は型安全性が保証されないため、バリデーション関数で検証する。

| 入力値 | 出力 | 処理 |
|--------|------|------|
| null/undefined | `[]` | 空配列を返す |
| 非配列値 | `[]` | 空配列を返す + WARNログ |
| 混合配列 | フィルタ済み配列 | 非string要素を除外 + WARNログ |
| 正常配列（string[]） | そのまま | そのまま返す |

**関数シグネチャ**: `validateStoredSkillIds(value: unknown): string[]`

### SkillStoreインターフェース

electron-storeとの型安全な連携のための抽象化インターフェース。

| メソッド | 引数 | 戻り値 | 説明 |
|----------|------|--------|------|
| `get` | `key: string, defaultValue: string[]` | `unknown` | 外部ストレージからの取得（型保証なし） |
| `set` | `key: string, value: string[]` | `void` | ストレージへの保存 |
| `path` | - | `string \| undefined` | ストレージファイルパス（任意） |

**重要**: `get`メソッドの戻り値は`unknown`型とし、呼び出し側でバリデーションを行う。

### デバッグフラグ

開発環境でのデバッグ出力制御。

| オプション | 型 | デフォルト | 説明 |
|------------|-----|-----------|------|
| `debug` | `boolean` | `process.env.NODE_ENV === 'development'` | デバッグログ出力フラグ |

**コンストラクタ**: `constructor(store: SkillStore, options?: { debug?: boolean })`

### テストファイル構成

| ファイル | テスト内容 | ケース数 |
|----------|-----------|----------|
| `SkillImportManager.persistence.test.ts` | ストア保存・復元、再起動シミュレーション | 永続化 |
| `SkillImportManager.error.test.ts` | 異常系、例外処理、フォールバック | エラー |
| `SkillImportManager.boundary.test.ts` | null、空配列、最大長、Unicode | 境界値 |
