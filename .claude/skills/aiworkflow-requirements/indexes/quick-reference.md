# クイックリファレンス

> 最重要情報への即時アクセス
> 詳細は resource-map.md → 該当ファイル を参照

---

## よく使うパターン

> **検索パターン集・コードパターン早見は [quick-reference-search-patterns.md](quick-reference-search-patterns.md) に分離**
> 機能・タスク別のキーワード分割、読む順番、IPC/Zustand/Result 等のコードスニペットを収録

### AI Chat / LLM Integration Fix 即時導線（2026-03-21）

| 目的 | 最初に開くファイル |
| --- | --- |
| 4タスクの全体像 | `references/workflow-ai-chat-llm-integration-fix.md` |
| parent workflow | `docs/30-workflows/ai-chat-llm-integration-fix/index.md` |
| same-wave artifact inventory | `references/workflow-ai-chat-llm-integration-fix-artifact-inventory.md` |
| Task 01 canonical root | `docs/30-workflows/completed-tasks/01-TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE/` |
| Task 02 canonical root | `docs/30-workflows/completed-tasks/02-TASK-FIX-LLM-SELECTOR-INLINE-GUIDANCE/` |
| ChatView error transport 契約 | `references/llm-ipc-types.md`, `references/error-handling-core.md` |
| LLM selector / persistence | `references/ui-ux-llm-selector.md`, `references/arch-state-management-core.md` |
| Workspace stream error | `references/llm-streaming.md`, `references/ui-ux-feature-components-details.md` |
| legacy path 逆引き | `references/legacy-ordinal-family-register.md` |

---

### Runtime Skill Creator Public IPC 即時導線（2026-03-21）

| 目的 | 最初に開くファイル |
| --- | --- |
| public IPC 契約 | `references/api-ipc-agent-core.md` |
| security detail | `references/security-electron-ipc-details.md` |
| registration / DI pattern | `references/architecture-implementation-patterns-details.md` |
| completed ledger | `references/task-workflow-completed-ipc-contract-preload-alignment.md` |
| lessons | `references/lessons-learned-auth-ipc-skill-creator-sync-auth-timeout.md` |
| workflow root | `docs/30-workflows/runtime-skill-creator-ipc-wiring/` |

---

### Runtime Skill Creator Workflow Engine Orchestration / Failure Lifecycle（2026-03-26）

| 目的 | 最初に開くファイル |
| --- | --- |
| owner 分離と failure review return | `references/architecture-overview-core.md` |
| facade / engine / transition guard / artifact append 詳細 | `references/arch-electron-services-details-part2.md` |
| public IPC と `execute-plan` failure lifecycle 契約 | `references/api-ipc-system-core.md` |
| auth / ipc 教訓 | `references/lessons-learned-auth-ipc-skill-creator-sync-auth-timeout.md` |
| completed ledger | `references/task-workflow-completed.md` |
| follow-up backlog | `references/task-workflow-backlog.md` |
| workflow root | `docs/30-workflows/completed-tasks/step-02-seq-task-02-workflow-engine-runtime-orchestration/` |
| failure lifecycle follow-up | `docs/30-workflows/completed-tasks/ut-imp-runtime-workflow-engine-failure-lifecycle-001/` |
| path sync follow-up | `docs/30-workflows/completed-tasks/ut-imp-task-sdk-02-system-spec-and-path-sync-001/` |

---

### Runtime Skill Creator Resource Selection Hardening（2026-03-27）

| 目的 | 最初に開くファイル |
| --- | --- |
| Task03 実装全体像 | `docs/30-workflows/step-03-par-task-03-context-budget-and-resource-selection/index.md` |
| multi-root / budget / degrade の current contract | `references/interfaces-agent-sdk-skill-reference.md` |
| service owner と pipeline detail | `references/arch-electron-services-details-part2.md` |
| completed ledger | `references/task-workflow-completed.md` |
| 苦戦箇所 / provenance 教訓 | `references/lessons-learned-auth-ipc-skill-creator-sync-auth-timeout.md` |

---

### Skill Creator Create Mainline Entry（2026-03-27）

| 目的 | 最初に開くファイル |
| --- | --- |
| Task05 の全体像 | `docs/30-workflows/step-04-par-task-05-create-entry-mainline-unification/index.md` |
| 一次導線と ViewType 契約 | `references/ui-ux-navigation.md`, `references/workflow-skill-lifecycle-routing-render-view-foundation.md` |
| state owner / handoff 境界 | `references/arch-state-management-core.md` |
| create 後の downstream journey | `references/workflow-skill-lifecycle-created-skill-usage-journey.md` |
| completed ledger | `references/task-workflow-completed.md` |
| Phase 12 教訓 | `references/lessons-learned-phase12-workflow-lifecycle.md` |

---

### Skill Creator Execution Governance Bundle（2026-03-26）

| 目的 | 最初に開くファイル |
| --- | --- |
| Task07 governance bundle の全体像 | `docs/30-workflows/skill-creator-agent-sdk-lane/step-05-seq-task-07-execution-governance-and-handoff-alignment/index.md` |
| route authority / route owner | `references/workflow-ai-runtime-execution-responsibility-realignment.md` |
| shared `HandoffGuidance` / Manual Boundary | `references/ui-ux-agent-execution-core.md` |
| approval / disclosure contract | `references/api-ipc-system-core.md` |
| shared DTO / consumer mapping | `references/interfaces-agent-sdk-skill-reference-share-debug-analytics.md` |

---

### Runtime Workflow Engine Failure Lifecycle（2026-03-26）

| 目的 | 最初に開くファイル |
| --- | --- |
| 実装済み failure lifecycle task の全体像 | `docs/30-workflows/completed-tasks/ut-imp-runtime-workflow-engine-failure-lifecycle-001/index.md` |
| owner / consumer rule の current fact | `references/architecture-overview-core.md`, `references/arch-electron-services-details-part2.md` |
| public IPC と workflow engine の境界 | `references/api-ipc-system-core.md` |
| 親 task の foundation | `docs/30-workflows/completed-tasks/step-02-seq-task-02-workflow-engine-runtime-orchestration/` |
| completed ledger / close-out | `references/task-workflow-completed.md`, `references/lessons-learned-auth-ipc-skill-creator-sync-auth-timeout.md` |

---

### Runtime Skill Creator Verify Detail / Reverify（2026-03-27）

| 目的 | 最初に開くファイル |
| --- | --- |
| public IPC 契約 | `references/api-ipc-agent-core.md` |
| main / preload / shared current fact | `references/api-ipc-system-core.md` |
| renderer consumer / DTO 利用面 | `references/interfaces-agent-sdk-skill-reference.md` |
| backlog / carry-forward root | `references/task-workflow-backlog.md` |
| workflow root | `docs/30-workflows/completed-tasks/ut-imp-task-sdk-06-layer34-verify-expansion-001/` |
| Phase 11/12 教訓 | `references/lessons-learned-phase12-workflow-lifecycle.md` |

---

### RuntimePolicyResolver subscription 判定統合（2026-03-22）

| 目的 | 最初に開くファイル |
| --- | --- |
| 3パターン分岐ロジック | `references/arch-electron-services-details-part2.md` |
| execution capability 契約 | `references/arch-execution-capability-contract.md` |
| IPC 契約（resolveWithService） | `references/api-ipc-system-core.md` |
| lessons learned | `references/lessons-learned-ipc-preload-runtime.md` |
| workflow root | `docs/30-workflows/w1b-sc-runtime-policy-closure/` |

---

### Advanced Console Safety Governance（2026-03-25）

| 目的 | 最初に開くファイル |
| --- | --- |
| ApprovalGate セキュリティ契約 | `references/security-electron-ipc-core.md` |
| 5 IPC channel 契約 | `references/api-ipc-system-core.md` |
| ApprovalGate Enforcement パターン | `references/architecture-implementation-patterns-core.md` |
| 3層レイヤー / handler 登録 | `references/architecture-overview-core.md` |
| 設計レッスン | `references/lessons-learned-current.md` |
| 未タスク（UT-6〜10） | `references/task-workflow-backlog.md` |
| 実装ガイド | `docs/30-workflows/step-03-seq-task-03-advanced-console-safety-governance/outputs/phase-12/implementation-guide.md` |

---

### LLM provider registry SSoT（2026-03-25）

| 目的 | 最初に開くファイル |
| --- | --- |
| provider / model 正本 | `references/llm-ipc-types.md` |
| UI surface | `references/ui-ux-llm-selector.md` |
| LLM 全体インデックス | `references/interfaces-llm.md` |
| 教訓 | `references/lessons-learned-test-typesafety.md` |
| completed ledger | `references/task-workflow-completed.md` |
| workflow root | `docs/30-workflows/completed-tasks/UT-LLM-MOD-01-005/` |

---

### TASK-SDK-01 Phase 12 close-out / follow-up sync（2026-03-26）

| 目的 | 最初に開くファイル |
| --- | --- |
| close-out follow-up の全体像 | `references/task-workflow-completed.md` |
| manifest foundation の教訓 | `references/lessons-learned-phase12-workflow-lifecycle.md` |
| runtime hardening current facts | `references/interfaces-agent-sdk-skill-reference.md` |
| backlog / carry-forward 判定 | `references/task-workflow-completed.md` |
| workflow ledger 導線 | `references/task-workflow.md` |
| 実装完了 root | `docs/30-workflows/completed-tasks/step-01-seq-task-01-manifest-contract-foundation/` |
| follow-up workflow root | `docs/30-workflows/completed-tasks/task-sdk-01-phase12-compliance-sync/` |
| follow-up 指示書 | `docs/30-workflows/completed-tasks/unassigned-task/task-imp-task-sdk-01-phase12-compliance-sync-001.md` |

---

### Skill Creator Workflow State / User Input / Verify API（2026-03-27）

| 目的 | API / 型名 | 最初に開くファイル |
| --- | --- | --- |
| verify detail 取得 | `getVerifyDetail(planId)` → `RuntimeSkillCreatorVerifyDetail` | `references/api-ipc-system-core.md` |
| reverify 要求 | `requestReverify(planId)` → `RuntimeSkillCreatorReverifyResult` | `references/api-ipc-system-core.md` |
| workflow state 取得 | `getWorkflowState(planId)` → `SkillCreatorWorkflowUiSnapshot` | `references/api-ipc-system-core.md` |
| ユーザー入力送信 | `submitUserInput(submission)` → `SkillCreatorWorkflowUiSnapshot` | `references/api-ipc-system-core.md` |
| workflow state 変更通知 | `onWorkflowStateChanged(callback)` → unsubscribe | `references/api-ipc-system-core.md` |
| 教訓 | 苦戦箇所4件（artifact ID / PhaseResourcePlanner / IPC型境界 / verify evidence） | `references/lessons-learned-auth-ipc-skill-creator-sync-auth-timeout.md` |

---

## 型定義クイックアクセス

| 用途               | 型名                          | ファイル                   |
| ------------------ | ----------------------------- | -------------------------- |
| API結果            | `OperationResult<T>`          | interfaces-core.md         |
| IPC transport      | `IPCResponse<T>`              | interfaces-auth.md         |
| 認証方式状態       | `AuthModeStatus`              | interfaces-auth.md         |
| スキル情報         | `Skill`, `SkillMetadata`      | interfaces-agent-sdk.md    |
| 実行ステータス     | `SkillExecutionStatus`        | packages/shared/src/types/skill.ts |
| チャットメッセージ | `ChatMessage`                 | interfaces-llm.md          |
| 会話セッション     | `ChatSession`                 | interfaces-chat-history.md |
| RAG検索結果        | `SearchResult`                | interfaces-rag-search.md   |
| エラー             | `AppError`, `ValidationError` | error-handling.md          |
| CTA制御            | `CTAVisibility`, `CTAState`   | workflow-skill-lifecycle-created-skill-usage-journey.md |
| ViewType拡張       | `ViewType` (`skillAnalysis` / `skillCreate`) | ui-ux-navigation.md |
| Agent改善導線      | `currentSkillName`, `selectedSkillName`, `skillExecutionStatus`, `viewHistory` | workflow-skill-lifecycle-routing-render-view-foundation.md, arch-state-management-core.md, arch-state-management-reference.md |
| SkillCenter analyze handoff | `handleAnalyzeSkill`, `setCurrentSkillName`, `setCurrentView("skillAnalysis")` | workflow-skill-lifecycle-created-skill-usage-journey.md, arch-state-management-reference-permissions-import-lifecycle.md |
| SkillAnalysis close 契約 | `onClose`, `currentSkillName ?? "demo-skill"`, `viewHistory`, `goBack()` | ui-ux-navigation.md, workflow-skill-lifecycle-routing-render-view-foundation.md |
| 権限フォールバック | `AbortReason`, `PermissionFlowContext`, `PermissionFlowResult` | interfaces-agent-sdk-executor-core.md |
| 権限リトライ上限   | `PERMISSION_MAX_RETRIES`      | interfaces-agent-sdk-executor-core.md |
| SafetyGate評価     | `SafetyGatePort`, `DefaultSafetyGate`, `evaluateSafety` | api-ipc-agent-safety.md, security-skill-execution.md |
| Permission Fallback Hook | `processPermissionFallback`, `revokeSessionEntries` | interfaces-agent-sdk-executor-details.md |
| スキル公開レベル   | `SkillVisibility`             | interfaces-agent-sdk-skill.md |
| 公開メタデータ     | `SkillPublishingMetadata`     | interfaces-agent-sdk-skill.md |
| 互換性チェック結果 | `CompatibilityCheckResult`    | interfaces-agent-sdk-skill.md |
| 公開準備状態       | `PublishReadiness`            | interfaces-agent-sdk-skill.md |
| スキルレジストリ   | `SkillRegistryService`        | interfaces-agent-sdk-skill.md |
| スキル配布         | `SkillDistributionService`    | interfaces-agent-sdk-skill.md |
| LLMヘルスチェック結果 | `HealthCheckResult` | llm-ipc-types.md |
| LLM設定同期 | `SetSelectedConfigParams` | llm-ipc-types.md |
| RAG LLMクライアント | `ILLMClient`（crag/types.ts 版 / llm/types.ts 版）型ドリフト→P64 | lessons-learned-rag-embedding-runtime.md (L-RAG-06) |
| Slide UI状態 | `SlideUIStatus` (`synced` / `running` / `degraded` / `guidance`) | arch-state-management-core.md |
| Slide レーン分離 | `SlideLane` (`integrated` / `manual`) | arch-state-management-core.md |
| Slide 能力DTO | `SlideCapabilityDTO` (laneType / modifier / agentClient / fallbackReason / guidance) | arch-state-management-core.md |
| 承認ゲート | `IApprovalGate`, `DefaultApprovalGate` | security-electron-ipc-core.md |
| Consumer Auth Guard | `isConsumerToken()` (`sess-` / `sessionKey=` prefix) | security-electron-ipc-core.md |
| API Key 除去 | `sanitizeForApiKeys()` | security-electron-ipc-core.md |

---

## docs-only status sync

> `SkillExecutionStatus` / status type spec sync 系タスクで、最初に見るべき現状と前提ブロッカー。

| 項目 | 値 |
| --- | --- |
| current blocker | `packages/shared/src/types/skill.ts` の `SkillExecutionStatus` は現状 6 値。Task12 は `spec_created` 前提で、Phase 1 では実体確認が先。 |
| primary refs | `task-workflow-completed-skill-lifecycle-design.md`, `task-workflow-completed-skill-lifecycle-ui.md`, `interfaces-agent-sdk-integration.md`, `arch-state-management-core.md`, `task-workflow.md`, `lessons-learned-current-electron-menu-docs-task0912.md` |
| read order | `resource-map.md` -> `task-workflow-completed-skill-lifecycle-design.md` -> `task-workflow-completed-skill-lifecycle-ui.md` -> `skill.ts` -> `task-workflow.md` |

---

## IPCチャンネル早見表

### 認証・ユーザー

| チャンネル         | 用途           |
| ------------------ | -------------- |
| `auth:get-session` | セッション取得 |
| `auth:sign-out`    | ログアウト     |
| `auth-mode:get`    | 現在の認証方式取得 |
| `auth-mode:set`    | 認証方式の切替 |
| `auth-mode:status` | 現在 mode の資格情報状態取得 |
| `auth-mode:validate` | 対象 mode の有効性検証 |
| `auth-mode:changed` | Main→Renderer の認証方式変更通知 |

### スキル管理

| チャンネル             | 用途           |
| ---------------------- | -------------- |
| `skill:list-available` | スキルスキャン |
| `skill:list-imported`  | インポート済み |
| `skill:execute`        | スキル実行     |
| `skill:permission`     | 権限確認       |

### スキル公開・配布

| チャンネル                   | 用途           |
| ---------------------------- | -------------- |
| `skill:publishing:register`  | スキル登録     |
| `skill:publishing:update`    | メタデータ更新 |
| `skill:publishing:check-compatibility` | 互換性チェック |
| `skill:publishing:check-readiness` | 公開準備確認 |
| `skill:publishing:publish`   | スキル公開     |
| `skill:publishing:unpublish` | スキル非公開化 |
| `skill:publishing:get-status` | 公開状態取得  |
| `skill:distribution:import`  | スキルインポート |
| `skill:distribution:export`  | スキルエクスポート |
| `skill:distribution:fork`    | スキルフォーク |
| `skill:distribution:share`   | 共有リンク生成 |

### 承認・安全ガバナンス

| チャンネル | 用途 |
| --- | --- |
| `approval:respond` | Renderer→Main 承認/拒否応答送信 |
| `approval:request` | Main→Renderer 承認要求プッシュ通知 |
| `execution:get-disclosure-info` | AI開示情報取得 |
| `execution:get-terminal-log` | ターミナルログ取得 |
| `execution:get-copy-command` | コピーコマンド取得 |

### チャット

| チャンネル       | 用途           |
| ---------------- | -------------- |
| `chat:send`      | メッセージ送信 |
| `chat:stream`    | ストリーミング |
| `conversation:*` | 会話履歴管理   |
| `llm:check-health` | LLMヘルスチェック（primary） |
| `llm:set-selected-config` | Renderer→Main 選択同期 |
| `AI_CHECK_CONNECTION` | legacy接続確認（新規利用禁止） |

**詳細**: api-endpoints.md L126-736

---

### IPC契約ドリフト自動検出（UT-TASK06-007）

| 項目 | 値 |
| --- | --- |
| スクリプト | `apps/desktop/scripts/check-ipc-contracts.ts` |
| テスト | `apps/desktop/scripts/__tests__/check-ipc-contracts.test.ts` |
| 実行 | `pnpm tsx apps/desktop/scripts/check-ipc-contracts.ts --report-only` |
| ルール | R-01(孤児), R-02(引数不一致/P44), R-03(ハードコード/P27), R-04(未登録) |
| 仕様 | `ipc-contract-checklist.md` / `quality-requirements.md` / `architecture-implementation-patterns-reference-ipc-drift-detection.md` |
| 導線 | `task-workflow.md` / `task-workflow-backlog.md` / `task-workflow-completed-ipc-contract-preload-alignment.md` / `docs/30-workflows/completed-tasks/UT-TASK06-007-ipc-contract-drift-auto-detect/` / `docs/30-workflows/UT-TASK06-007-EXT-006-new-function-test-expansion/` |
| 未タスク | EXT-001(タプル配列), EXT-002(alias/再export/動的定数), EXT-003(ipcMain.on/safeOn), EXT-004(モジュール分割), EXT-005(R-02精度向上) |
| 完了済み拡張 | EXT-006（5関数/パターン export追加 + 20件追加テスト） |
| テスト | 69件（Line 95.79% / Branch 91.55% / Function 100%） |
| 実行時間 | 約2.1秒（NFR-01: 10秒以内） |
| 実測値 | Main 217 handlers / Preload 189 entries / Drifts 198 / Orphans 120 / `passed=false` |

#### CLI コマンド早見表

| コマンド | 用途 |
| --- | --- |
| `pnpm tsx apps/desktop/scripts/check-ipc-contracts.ts --report-only` | Phase 9 品質ゲート（常に exit 0） |
| `pnpm tsx apps/desktop/scripts/check-ipc-contracts.ts --format json --report-only` | CI/CD 統合（JSON出力） |
| `pnpm tsx apps/desktop/scripts/check-ipc-contracts.ts --strict` | error + warning で exit 1 |

#### 検出ルール早見表

| ルール | 名称 | 重大度 | 検出パターン |
| --- | --- | --- | --- |
| R-01 | チャンネル孤児 | warning | Main/Preload の片方のみに存在 |
| R-02 | 引数形式不一致 | error | Main=object, Preload=primitive（P44対応） |
| R-03 | ハードコード文字列 | warning | IPC_CHANNELS 定数でなく文字列リテラル（P27対応） |
| R-04 | 未登録チャンネル | error | Preload にあるが Main にない |

---

## ディレクトリ構成早見表

```
apps/
  desktop/
    src/
      main/           # Electron Main Process
        services/     # ビジネスロジック
        ipc/          # IPCハンドラ
        settings/     # 設定管理
      renderer/       # React UI
        store/        # Zustand
        views/        # ページ
        components/   # 共通コンポーネント
      preload/        # Preload API
  web/                # Next.js (将来)
packages/
  shared/             # 共通型・ユーティリティ
    src/types/        # 型定義
  ui/                 # UIコンポーネント
```

**詳細**: directory-structure.md

---

## エラーコード早見表

| プレフィックス | 種別             | 例                     |
| -------------- | ---------------- | ---------------------- |
| ERR_1xxx       | システムエラー   | ERR_1001 INTERNAL      |
| ERR_2xxx       | 認証・認可       | ERR_2006 UNAUTHORIZED  |
| ERR_3xxx       | バリデーション   | ERR_3001 INVALID_INPUT |
| ERR_4xxx       | ビジネスロジック | ERR_4001 NOT_FOUND     |

**詳細**: error-handling.md L8-230

---

## テスト基準早見表

| メトリクス        | 必須 | 推奨 |
| ----------------- | ---- | ---- |
| Line Coverage     | 80%  | 90%+ |
| Branch Coverage   | 75%  | 85%+ |
| Function Coverage | 90%  | 100% |

**詳細**: quality-requirements.md L94-256

---

## セキュリティチェックリスト

- [ ] 入力バリデーション（Zod）
- [ ] IPCチャンネルホワイトリスト
- [ ] XSS対策（DOMPurify）
- [ ] パストラバーサル防止
- [ ] 機密情報ログ出力禁止

**詳細**: security-implementation.md, security-api-electron.md

---

## 新機能追加フロー

1. **型定義**: `packages/shared/src/types/`
2. **サービス**: `apps/desktop/src/main/services/`
3. **IPCハンドラ**: `apps/desktop/src/main/ipc/`
4. **Preload API**: `apps/desktop/src/preload/`
5. **React Hook**: `apps/desktop/src/renderer/hooks/`
6. **UIコンポーネント**: `apps/desktop/src/renderer/components/`
7. **テスト**: 各ディレクトリの`__tests__/`

**詳細**: architecture-patterns.md L8-74

---

## 仕様書テンプレート選択

| 作成対象                  | テンプレート               |
| ------------------------- | -------------------------- |
| インターフェース/型定義   | interfaces-template.md     |
| アーキテクチャ/パターン   | architecture-template.md   |
| API/エンドポイント        | api-template.md            |
| Electron IPC              | ipc-channel-template.md    |
| React Hook                | react-hook-template.md     |
| サービス/ビジネスロジック | service-template.md        |
| UIコンポーネント          | ui-ux-template.md          |
| テスト仕様                | testing-template.md        |
| エラーハンドリング        | error-handling-template.md |
| セキュリティ              | security-template.md       |
| データベース              | database-template.md       |
| デプロイ/CI/CD            | deployment-template.md     |
| 技術スタック              | technology-template.md     |
| Claude Code               | claude-code-template.md    |
| ワークフロー              | workflow-template.md       |
| 汎用                      | spec-template.md           |

---

## 関連ドキュメント

| ドキュメント                 | 用途                      |
| ---------------------------- | ------------------------- |
| resource-map.md              | タスク種別→ファイル逆引き |
| topic-map.md                 | セクション・行番号詳細    |
| spec-guidelines.md           | 仕様書作成ルール          |
| spec-splitting-guidelines.md | ファイル分割ルール        |

---

## 変更履歴

| 日付       | 変更内容                                                                                           |
| ---------- | -------------------------------------------------------------------------------------------------- |
| 2026-03-27 | TASK-SDK-03〜06 / UT-IMP-RUNTIME-WORKFLOW-VERIFY-ARTIFACT-APPEND-001: Skill Creator Workflow State / User Input / Verify API 即時導線追加。getVerifyDetail / requestReverify / getWorkflowState / submitUserInput / onWorkflowStateChanged の5 API 導線を登録 |
| 2026-03-25 | TASK-IMP-ADVANCED-CONSOLE-SAFETY-GOVERNANCE-001: 即時導線セクション追加、承認・安全ガバナンス IPCチャンネル5件追加、IApprovalGate/isConsumerToken/sanitizeForApiKeys 型定義追加 |
| 2026-03-20 | UT-RAG-08-002: `ILLMClient` 型ドリフト（P64）への参照パスを型定義クイックアクセステーブルに追加。`lessons-learned-rag-embedding-runtime.md` (L-RAG-06) へ導線を登録 |
| 2026-03-19 | UT-TASK06-007: discovery 導線を completed canonical set に再同期し、implementation pattern detail / completed ledger / EXT-001〜005 を早見表へ反映 |
| 2026-03-18 | UT-TASK06-007: IPC契約ドリフト自動検出セクション（check-ipc-contracts.ts / R-01~R-04 / EXT-001~003）をIPCチャンネル早見表直後に追加 |
| 2026-03-17 | `renderView` 基盤拡張（TASK-IMP-VIEWTYPE-RENDERVIEW-FOUNDATION-001）向けに ViewType クイック行を追加 |
| 2026-03-17 | TASK-SKILL-LIFECYCLE-08: SkillVisibility/PublishReadiness/CompatibilityCheckResult 型定義と skill:publishing:*/skill:distribution:* 11チャンネルを追加 |
| 2026-03-16 | 「Skill Docs Runtime Integration（TASK-IMP-SKILL-DOCS-AI-RUNTIME-001）を探すとき」セクションを追加 |
