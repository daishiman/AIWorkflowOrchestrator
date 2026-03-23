# タスク実行仕様書生成ガイド / completed records (chat, lifecycle, tests)

> 親仕様書: [task-workflow.md](task-workflow.md)
> 役割: completed records
> 分割元: `task-workflow-completed-workspace-chat-lifecycle-tests.md`（500行超のため分割）
> 対象タスク: UT-IMP-SKILL-AGENT-RUNTIME-ROUTING, TASK-FIX-APIKEY-CHAT, TASK-10A-G, TASK-FIX-APP-DEBUG, TASK-FIX-AUTHGUARD, TASK-FIX-SAFEINVOKE, TASK-IMP-SETTINGS-INTEGRATION, TASK-IMP-WORKSPACE-CHAT-EDIT, UT-CHAT-EDIT-WORKSPACE

## 完了タスク

### タスク: TASK-UI-INLINE-MODEL-SELECTOR-COMPONENT 完了記録（2026-03-22）

| 項目 | 値 |
| --- | --- |
| タスクID | TASK-UI-INLINE-MODEL-SELECTOR-COMPONENT |
| ステータス | **完了（shared component 実装 + Phase 12 同期完了 / Phase 13 未実施）** |
| タイプ | ui component |
| 優先度 | 中 |
| 完了日 | 2026-03-22 |
| 対象 | `InlineModelSelector` / `llmSlice` selector contract / Phase 12 sync |
| 成果物 | `docs/30-workflows/chat-inline-model-selector/tasks/01-TASK-UI-INLINE-MODEL-SELECTOR-COMPONENT/outputs/` |

#### 実施内容

- `InlineModelSelector.tsx` を追加し、shared compact selector を実装
- provider list 未取得時の `fetchProviders()` fallback、provider change 時の `checkHealth()` 呼び出し、default model 選択を統合
- `index.ts` から component / props / design token を export
- Phase 12 で canonical path、artifact parity、system spec、backlog、completed ledger を同期

#### 検証証跡

| コマンド | 結果 |
| --- | --- |
| `cd apps/desktop && pnpm exec tsc -p tsconfig.json --noEmit --pretty false` | PASS |
| `cd apps/desktop && pnpm exec vitest run src/renderer/components/llm/__tests__/InlineModelSelector.test.tsx` | BLOCKED（`esbuild` platform mismatch） |

#### 関連改善タスク

| 未タスクID | 概要 | 参照 | ステータス |
| --- | --- | --- | --- |
| TASK-UI-CHATVIEW-MODEL-SELECTOR-INTEGRATION | ChatView header へ mount する（compact mode, disabled={isSending}, LLMGuidanceBanner 自動連携） | `docs/30-workflows/02-TASK-UI-CHATVIEW-MODEL-SELECTOR-INTEGRATION/` | 実装完了（2026-03-23） |
| TASK-UI-WORKSPACE-MODEL-SELECTOR-INTEGRATION | WorkspaceChatPanel header へ mount する（compact mode, disabled={controller.isStreaming}, GuidanceBlock(blocked) 自動連携） | `docs/30-workflows/chat-inline-model-selector/tasks/03-TASK-UI-WORKSPACE-MODEL-SELECTOR-INTEGRATION/` | 実装完了（2026-03-23） |

### タスク: TASK-FIX-LLM-SELECTOR-INLINE-GUIDANCE 再監査記録（2026-03-21）

| 項目 | 値 |
| --- | --- |
| タスクID | TASK-FIX-LLM-SELECTOR-INLINE-GUIDANCE |
| ステータス | **完了（実装 + Phase 11/12 再監査完了 / Phase 13 未実施）** |
| タイプ | fix |
| 優先度 | 高 |
| 完了日 | 2026-03-21 |
| 対象 | `LLMGuidanceBanner` / `ChatView` / `WorkspaceChatPanel` / screenshot 4件 / Phase 12 同期 |
| 成果物 | `docs/30-workflows/02-TASK-FIX-LLM-SELECTOR-INLINE-GUIDANCE/outputs/` |

#### 実施内容

- `LLMGuidanceBanner` を追加し、provider/model 未選択時だけ `role="alert"` の guidance banner を表示
- `ChatView` から Settings への CTA を `setCurrentView("settings")` で接続
- `WorkspaceChatPanel` の blocked `GuidanceBlock` に `onAction` を接続し、Settings CTA を表示
- Phase 11 で representative screenshot 4件と metadata を current workflow 配下へ固定
- Phase 12 で Task 02 root の canonical path、parent workflow、artifact inventory、backlog、lessons、follow-up 2件を same-wave 同期

#### 検証証跡

| コマンド | 結果 |
| --- | --- |
| `pnpm --filter @repo/desktop screenshot:llm-selector-inline-guidance` | PASS（screenshot 4件, metadata生成） |
| `node .claude/skills/task-specification-creator/scripts/validate-phase11-screenshot-coverage.js --workflow docs/30-workflows/02-TASK-FIX-LLM-SELECTOR-INLINE-GUIDANCE` | PASS |
| `node .claude/skills/task-specification-creator/scripts/validate-phase12-implementation-guide.js --workflow docs/30-workflows/02-TASK-FIX-LLM-SELECTOR-INLINE-GUIDANCE` | PASS |

#### 関連改善タスク

| 未タスクID | 概要 | 参照 | ステータス |
| --- | --- | --- | --- |
| UT-FIX-LLM-SETTINGS-DIRECT-SCROLL-001 | Settings の LLM セクションへ直接到達する導線を追加 | `docs/30-workflows/unassigned-task/task-ut-llm-settings-direct-scroll-001.md` | 未実施 |
| UT-FIX-LLM-BANNER-DISMISS-001 | guidance banner の dismiss UX を追加 | `docs/30-workflows/unassigned-task/task-ut-llm-guidance-banner-dismiss-001.md` | 未実施 |

### タスク: TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE 再監査記録（2026-03-20）

| 項目 | 値 |
| --- | --- |
| タスクID | TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE |
| ステータス | **完了（実装 + Phase 11/12 再監査完了 / Phase 13 未実施）** |
| タイプ | fix |
| 優先度 | 高 |
| 完了日 | 2026-03-20 |
| 対象 | `chatSlice.chatError` / `clearChatError` / `ChatView` alert banner / screenshot 5件 / Phase 12 同期 |
| 成果物 | `docs/30-workflows/01-TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE/outputs/` |

#### 実施内容

- `callLLMAPI()` が `error?: string` を返し、`AI_UNAVAILABLE` / `API_CALL_FAILED` / `UNKNOWN_ERROR` / API由来 error code / raw message string を Renderer へ伝搬
- `chatSlice.sendMessage()` が送信開始時に `chatError` を clear し、失敗時のみ error code または raw message string を保持
- `ChatView` が `role="alert"` の error banner、手動 close、5秒 auto clear、日本語文言変換を実装
- Phase 11 で light/dark を含む representative screenshot 5件を再取得し、current workflow 配下へ固定
- Phase 12 で workflow root を `docs/30-workflows/01-TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE/` に正規化し、未タスク2件を formalize

#### 検証証跡

| コマンド | 結果 |
| --- | --- |
| `pnpm --filter @repo/desktop screenshot:chatview-error-silent-failure` | PASS（screenshot 5件, metadata生成） |
| `node .claude/skills/task-specification-creator/scripts/validate-phase11-screenshot-coverage.js --workflow docs/30-workflows/01-TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE` | PASS |
| `node .claude/skills/task-specification-creator/scripts/validate-phase12-implementation-guide.js --workflow docs/30-workflows/01-TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE` | PASS |

#### 関連改善タスク

| 未タスクID | 概要 | 参照 | ステータス |
| --- | --- | --- | --- |
| UT-CHATVIEW-ERROR-BANNER-I18N-001 | ChatView error banner の i18n 化 | `docs/30-workflows/unassigned-task/task-ut-chatview-error-banner-i18n-001.md` | 未実施 |
| UT-AI-CHAT-ERROR-CODE-INVENTORY-001 | `ai.chat` error code inventory の仕様固定 | `docs/30-workflows/unassigned-task/task-ut-ai-chat-error-code-inventory-001.md` | 未実施 |

### タスク: TASK-IMP-MAIN-CHAT-SETTINGS-AI-RUNTIME-001 再監査記録（2026-03-17）

| 項目 | 値 |
| --- | --- |
| タスクID | TASK-IMP-MAIN-CHAT-SETTINGS-AI-RUNTIME-001 |
| 判定 | **実装差分は反映済み / follow-up 4件は未完了** |
| ステータス | Phase 11/12 再監査を実施、未タスクへ移管済み |
| 対象 | `llm.ts` disconnected統一、`aiHandlers.ts` P42バリデーション、`llmConfigProvider.ts` fallback廃止、Phase11証跡再取得 |
| 成果物 | `docs/30-workflows/ai-runtime-authmode-unification/tasks/step-03-par-task-06-main-chat-settings-runtime-sync/outputs/` |

#### 未完了差分（follow-up）

| 未タスクID | 概要 | ステータス |
| --- | --- | --- |
| UT-TASK06-001 | RAG state IPC 仕様化 | 未実施 |
| UT-TASK06-002 | apiKey.validate 完全デバウンス | 未実施 |
| UT-TASK06-003 | AccountSection header + launcher 統合 | 未実施 |
| UT-TASK06-004 | AI_CHECK_CONNECTION legacy整理 | 未実施 |

### タスク: UT-IMP-SKILL-AGENT-RUNTIME-ROUTING-INTEGRATION-CLOSURE-001 runtime routing 統合クロージャ（2026-03-15）

| 項目 | 値 |
| --- | --- |
| タスクID | UT-IMP-SKILL-AGENT-RUNTIME-ROUTING-INTEGRATION-CLOSURE-001 |
| ステータス | **完了（Phase 1-12 完了 / Phase 13 未実施）** |
| タイプ | improvement |
| 優先度 | 高 |
| 完了日 | 2026-03-15 |
| 対象 | `RuntimeResolver` 共通化、`skill:execute`/`agent:start` handoff 契約、`TerminalHandoffCard`、`handoffGuidance` store |
| 成果物 | `docs/30-workflows/completed-tasks/runtime-routing-integration-closure/outputs/` |

#### 実施内容

- Main: `RuntimeResolver` / `TerminalHandoffBuilder` を `registerSkillHandlers` と `registerAgentExecutionHandlers` に注入し、runtime 判定を共通化
- IPC: `skill:execute` は envelope 互換を維持しつつ `handoff=true + guidance` を返す分岐を追加
- Preload/Renderer: `agentAPI` を `AGENT_EXECUTION_*` チャネルへ整合し、`TerminalHandoffCard` の copy/dismiss UX を追加
- Store: `handoffGuidance` の保持・dismiss・integrated 開始時 reset を `agentSlice` へ統合
- Phase 11: TC-01〜09 の screenshot 9件を取得し、fallback capture の metadata を記録

#### 苦戦箇所

| 苦戦箇所 | 再発条件 | 対処 |
| --- | --- | --- |
| `electron-vite dev` が `esbuild` アーキ不一致で起動不能 | worktree の lockfile/binary 差分を preflight せず capture 実行 | fallback review board で証跡を確保し、metadata に理由を固定 |
| workflow 実体は完了済みでも `index.md` / `artifacts.json` / phase本文が `not_started` のまま残る | validator PASS をもって台帳同期を省略 | Phase 12 で workflow 本文・台帳・outputs を同一ターンで completed 同期 |
| Step 2 で必要な domain spec 同期範囲が漏れる | executor 仕様だけ更新し、UI/state/history を後回し | `arch-electron-services` / `ui-ux-agent-execution` / `arch-state-management` / `task-workflow` / `lessons` を同時更新 |

#### 検証証跡

| コマンド | 結果 |
| --- | --- |
| `node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/completed-tasks/runtime-routing-integration-closure --strict` | PASS（13/13, error=0） |
| `node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js` | PASS（223/223, missing=0） |
| `node .claude/skills/task-specification-creator/scripts/validate-phase11-screenshot-coverage.js --workflow docs/30-workflows/completed-tasks/runtime-routing-integration-closure` | PASS（TC 9/9） |
| `node .claude/skills/task-specification-creator/scripts/validate-phase12-implementation-guide.js --workflow docs/30-workflows/completed-tasks/runtime-routing-integration-closure` | PASS（10/10） |
| `node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD` | current違反なし（baselineは既存 legacy と分離管理） |

#### 関連改善タスク

| 未タスクID | 概要 | 参照 | ステータス |
| --- | --- | --- | --- |
| UT-FIX-AGENT-HANDLERS-WORKTREE-PACKAGE-RESOLUTION-001 | worktree 環境で `@repo/shared` パッケージ解決エラーにより agentHandlers.test.ts 全16件 FAIL | `docs/30-workflows/completed-tasks/runtime-routing-integration-closure/task-fix-agent-handlers-worktree-package-resolution-001.md` | 未実施 |
| UT-IMP-IPC-HANDOFF-ENVELOPE-CONSISTENCY-001 | `skill:execute` と `agent:start` の handoff 応答 envelope 形式を統一 | `docs/30-workflows/completed-tasks/runtime-routing-integration-closure/task-imp-ipc-handoff-envelope-consistency-001.md` | 未実施 |
| UT-IMP-RUNTIME-RESOLVER-CHATEDIT-INTEGRATION-TEST-001 | ChatEditRuntimeResolver パスの統合テスト追加（3テスト: integrated/handoff/後方互換） | `docs/30-workflows/completed-tasks/runtime-routing-integration-closure/task-imp-runtime-resolver-chatedit-integration-test-001.md` | 未実施 |

### タスク: TASK-FIX-APIKEY-CHAT-TOOL-INTEGRATION-001 APIキー連動とチャット実行経路整合（2026-03-11）

| 項目 | 値 |
| --- | --- |
| タスクID | TASK-FIX-APIKEY-CHAT-TOOL-INTEGRATION-001 |
| ステータス | **完了（Phase 1-12 完了 / Phase 13 未実施）** |
| タイプ | fix |
| 優先度 | 高 |
| 完了日 | 2026-03-11 |
| 対象 | `ai.chat` / `llm:set-selected-config` / `apiKey:*` / `auth-key:exists` / Settings AuthKey導線 |
| 成果物 | `docs/30-workflows/completed-tasks/api-key-chat-tool-integration-alignment/outputs/` |

#### 実施内容

- `AI_CHAT` へ `providerId + modelId` の明示指定ルートを追加し、片指定時は fail-fast に変更
- `llm:set-selected-config` を追加し、Renderer の選択状態を Main 側 `ai.chat` 実行経路へ同期
- `SecureStorage` を `api-keys` 単一正本参照へ収束し、保存先契約の二重化を解消
- `apiKey:save` / `apiKey:delete` 成功後に `LLMAdapterFactory.clearInstance(provider)` を実行して stale adapter を除去
- `auth-key:exists` に `source`（saved/env-fallback/not-set）を追加し、`AuthKeySection` を `authMode === "api-key"` 時のみ表示
- Phase 11 で screenshot 3件を取得し、Apple UI/UX 観点（視覚階層/状態認知/フィードバック）で回帰なしを確認

#### 苦戦箇所

| 苦戦箇所 | 再発条件 | 対処 |
| --- | --- | --- |
| APIキー保存後に旧 adapter が残り、実行経路が stale になる | storage 更新のみで adapter cache を無効化しない | `apiKey:save/delete` の成功後に provider 単位で adapter instance をクリア |
| `ai.chat` の provider/model が Store と Main でずれる | Renderer の選択状態を Main に同期しない | `llm:set-selected-config` を追加し、`llmSlice` 変更イベントで Main へ同期 |
| auth-key 表示状態が `hasCredentials` 依存で曖昧になる | env fallback と saved の区別を返さない | `auth-key:exists` を `{ exists, source }` へ拡張し `source` 優先表示へ移行 |

#### 関連改善タスク

| 未タスクID | 概要 | 参照 | ステータス |
| --- | --- | --- | --- |
| ~~UT-IMP-APIKEY-CHAT-TRIPLE-SYNC-GUARD-001~~ | ~~`apiKey:save/delete` の cache clear、`llm:set-selected-config` の Main 同期、`auth-key:exists.source` の Settings 表示を単一回帰マトリクスで guard する~~ | `docs/30-workflows/completed-tasks/task-imp-apikey-chat-triple-sync-guard-001.md` | 完了: 2026-03-11 |

#### 検証証跡

| コマンド | 結果 |
| --- | --- |
| `cd apps/desktop && pnpm exec vitest run src/main/handlers/__tests__/llm.test.ts src/main/ipc/__tests__/aiHandlers.llm.test.ts src/main/ipc/__tests__/authKeyHandlers.test.ts src/preload/channels.test.ts src/renderer/components/settings/AuthKeySection/AuthKeySection.test.tsx src/renderer/views/SettingsView/SettingsView.test.tsx` | PASS（6 files / 133 tests, 1 skipped） |
| `node apps/desktop/scripts/capture-task-fix-apikey-chat-tool-integration-phase11.mjs` | PASS（screenshot 3件） |
| `node .claude/skills/task-specification-creator/scripts/validate-phase11-screenshot-coverage.js --workflow docs/30-workflows/completed-tasks/api-key-chat-tool-integration-alignment` | PASS |
| `node .claude/skills/task-specification-creator/scripts/validate-phase12-implementation-guide.js --workflow docs/30-workflows/completed-tasks/api-key-chat-tool-integration-alignment` | PASS |

#### Phase 12再確認追補（2026-03-11 JST）

- `verify-all-specs` / `validate-phase-output --phase 12` / `validate-phase12-implementation-guide` / `validate-phase11-screenshot-coverage` を再実行し、Phase 12 タスク仕様準拠を再確認
- `apps/desktop/scripts/capture-task-fix-apikey-chat-tool-integration-phase11.mjs` を再実行し、TC-11-01〜03 のスクリーンショット証跡を更新
- 未タスク監査は `audit-unassigned-tasks --json --diff-from HEAD` を合否判定の正本にし、`currentViolations=0` と `baselineViolations=133` を分離記録

### タスク: TASK-10A-G スキルライフサイクル統合テスト強化（2026-03-10）

| 項目 | 値 |
| --- | --- |
| タスクID | TASK-10A-G |
| ステータス | **完了（Phase 1-12 完了）** |
| タイプ | test |
| 優先度 | 中 |
| 完了日 | 2026-03-10 |
| 対象 | スキルライフサイクル3層テスト（IPC契約 / Store駆動 / ChatPanel結線） |
| 成果物 | `docs/30-workflows/completed-tasks/task-045-task-10a-g-lifecycle-test-hardening/outputs/` |

#### 実施内容

- G1: IPC契約テスト14件（`skill:create` の入力検証・sender検証・正常委譲・異常系）
- G2: Store駆動テスト21件（`create -> list -> analyze -> improve` の状態遷移・guard・trim バリデーション）
- G3: ChatPanel結線テスト17件（スキル管理トグル、実行中 disabled、SkillManagementPanel 切替の統合フロー）
- 合計52テスト全PASS、カバレッジ基準充足、回帰287件PASS
- Phase 11 では代表 UI 5ケースの screenshot を current workflow 配下へ追加し、`validate-phase11-screenshot-coverage` PASS まで確認

#### 苦戦箇所

| 苦戦箇所 | 再発条件 | 対処 |
| --- | --- | --- |
| テスト専用タスクで Phase 4/5 の境界が曖昧 | テストコードのみ追加するタスクで Red/Green 区分が不明確 | Phase 4 でテスト作成（Red）→ Phase 5 でモック/スタブ修正（Green）と整理 |
| 巨大ファイルのカバレッジ計測が個別ファイル単位と全体で乖離 | v8 プロバイダが大規模ファイルをインライン関数単位でカウント | Layer 別にカバレッジを報告し、全体値は weighted average として扱う |
| 3層テスト間のモック整合性 | Layer 1 のモックと Layer 2 のストア実装が異なる前提で動作 | 各 Layer のモック境界を明示的にドキュメント化 |

#### 同種課題の5分解決カード

1. テスト専用タスクでは Phase 4 = テスト作成（Red）、Phase 5 = モック/環境修正（Green）と読み替える。
2. カバレッジは Layer 別に計測し、全体値との乖離を仕様書に明記する。
3. `--sequence.shuffle` でテスト順序依存がないことを確認する。
4. `task-workflow.md` / `lessons-learned.md` / 関連 domain spec を同一ターンで更新する。

#### 関連未タスク（再監査追補）

| タスクID | 概要 | 優先度 | 参照 |
| --- | --- | --- | --- |
| UT-IMP-TASK-SPEC-GENERATE-INDEX-SCHEMA-COMPAT-001 | `generate-index.js` と workflow `artifacts.json` の schema 互換改善 | 中 | `docs/30-workflows/completed-tasks/task-045-task-10a-g-lifecycle-test-hardening/unassigned-task/task-imp-task-spec-generate-index-schema-compat-001.md` |

#### 検証証跡

| コマンド | 結果 |
| --- | --- |
| `pnpm --filter @repo/desktop exec vitest run` (回帰テスト) | 287 PASS |
| `pnpm --filter @repo/desktop exec tsc --noEmit` | PASS |

### タスク: TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001 App.tsx debug storage clear 削除（2026-03-09）

| 項目 | 値 |
| --- | --- |
| タスクID | TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001 |
| ステータス | **実装・Phase 1-12 完了 / Phase 13 未実施** |
| 完了日 | 2026-03-09 |
| 対象 | `apps/desktop/src/renderer/App.tsx` の debug-only `localStorage.clear()` / `window.location.reload()` 除去 |
| 成果物 | `docs/30-workflows/TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001/outputs/` |

#### 実施内容

- `App.tsx` から debug storage clear `useEffect` を削除
- `App.debug-removal.test.tsx` を追加し、debug code 非残存と reload 不再発を固定
- Phase 11 では通常ルート metadata 確認 + dedicated harness screenshot 3件で persist 保持を検証
- system spec / task-spec guide / skill 文書を同一ターンで同期

#### 苦戦箇所

| 苦戦箇所 | 再発条件 | 対処 |
| --- | --- | --- |
| `skipAuth=true` で screenshot は安定するが bug path を bypass して false negative になる | auth / persist / App shell 初期化順序が原因の不具合を screenshot 導線だけで確認しようとする | 通常ルートで `navigation.type` / debug log absence / storage snapshot を metadata 取得し、画面証跡だけ dedicated harness へ分離した |
| App shell 直下の画面検証は初期化ノイズで不安定 | 目的画面への遷移や preload 依存が強く、同一 view の状態固定が難しい | SettingsView 専用 harness を追加し、本番コンポーネントをそのまま使って screenshot を安定取得した |
| repo-wide に残る `debug-clear-storage` 前提は current task の責務外まで波及する | current workflow だけ直しても、古い comment / script / e2e setup が別箇所に残る | `UT-FIX-DEBUG-CLEAR-STORAGE-SHIM-CLEANUP-001` として未タスクへ分離し、current task は実装修正と Phase 12 同期に集中した |

#### 同種課題の5分解決カード

1. まず通常ルートで bug path を再現し、metadata で副作用の有無を固定する。
2. 画面証跡が不安定なら dedicated harness を作り、screenshot path を bug path から分離する。
3. `task-workflow.md` / `lessons-learned.md` / 関連 domain spec を同一ターンで更新する。
4. repo-wide cleanup は未タスクへ切り出し、`audit --target-file` で current=0 を確認して閉じる。

#### 検証証跡

| コマンド | 結果 |
| --- | --- |
| `pnpm --filter @repo/desktop run screenshot:app-debug-localstorage-clear` | PASS |
| `pnpm --filter @repo/desktop exec vitest run src/renderer/__tests__/App.debug-removal.test.tsx` | PASS |
| `pnpm --filter @repo/desktop exec tsc --noEmit` | PASS |
| `node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001` | PASS |

### タスク: TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001 AuthGuard タイムアウトフォールバック + Settings認証除外（2026-03-10）

| 項目 | 値 |
| --- | --- |
| タスクID | TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001 |
| ステータス | **完了（Phase 1-13 出力 + 実装 + テスト104件全PASS + 仕様同期）** |
| タイプ | fix |
| 優先度 | P3 |
| 完了日 | 2026-03-10 |
| 対象 | `types.ts` / `getAuthState.ts` / `useAuthState.ts` / `AuthTimeoutFallback.tsx` / `index.tsx` / `App.tsx` |
| 成果物 | `docs/30-workflows/completed-tasks/TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001/outputs/` |

#### 実施内容

- AuthGuardDisplayState に "timed-out" 状態を追加し、認証チェックの無限ブロックを防止
- 10秒タイムアウト機構を useAuthState フックに実装（認証確認が10秒以内に完了しない場合にフォールバック）
- AuthTimeoutFallback UI コンポーネントを新規作成（タイムアウト時のユーザーガイダンス表示）
- Settings 画面を AuthGuard バイパス対象に追加（未認証状態でも設定画面にアクセス可能）
- 104テスト全PASS

#### 変更ファイル

| ファイル | 変更内容 |
| --- | --- |
| `types.ts` | AuthGuardDisplayState に "timed-out" を追加 |
| `getAuthState.ts` | タイムアウト判定ロジックの追加 |
| `useAuthState.ts` | 10秒タイムアウト機構の実装 |
| `AuthTimeoutFallback.tsx` | タイムアウト時フォールバック UI コンポーネント新規作成 |
| `index.tsx` | AuthGuard コンポーネントへのタイムアウト状態ハンドリング追加 |
| `App.tsx` | Settings 画面の AuthGuard バイパス設定 |

### タスク: TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001 再監査追補（2026-03-10）

| 項目 | 値 |
| --- | --- |
| タスクID | TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001 |
| ステータス | **完了（Phase 11 screenshot 再取得 + reset guard 修正 + system spec 同期）** |
| 完了日 | 2026-03-10 |
| 対象 | `App.tsx` / `shouldResetUnauthenticatedView.ts` / Phase 11-12 成果物 / auth-state system spec |

#### 実施内容

- `settings` を未認証 reset 対象外にする `shouldResetUnauthenticatedView` を追加
- Phase 11 専用 harness route で screenshot 4件を再取得
- workflow 成果物、system spec 6件、LOGS/SKILL 4件を同一ターンで再同期

#### 検証証跡

| コマンド | 結果 |
| --- | --- |
| `pnpm --filter @repo/desktop exec vitest run src/renderer/utils/__tests__/shouldResetUnauthenticatedView.test.ts src/renderer/components/AuthGuard/AuthGuard.test.tsx src/renderer/components/AuthGuard/utils/getAuthState.test.ts src/renderer/components/AuthGuard/hooks/__tests__/useAuthState.test.ts src/renderer/components/AuthGuard/__tests__/AuthTimeoutFallback.test.tsx src/renderer/components/organisms/AccountSection/AccountSection.test.tsx` | PASS（6 files / 110 tests） |
| `node apps/desktop/scripts/capture-task-authguard-timeout-phase11.mjs` | PASS（4 screenshots） |
| `node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/completed-tasks/TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001` | PASS |
| `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001` | PASS |
| `node .claude/skills/task-specification-creator/scripts/validate-phase11-screenshot-coverage.js --workflow docs/30-workflows/completed-tasks/TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001` | PASS |
| `node .claude/skills/task-specification-creator/scripts/validate-phase12-implementation-guide.js --workflow docs/30-workflows/completed-tasks/TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001` | PASS |

#### 画面証跡

| TC | 証跡 |
| --- | --- |
| TC-11-01 | `docs/30-workflows/completed-tasks/TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001/outputs/phase-11/screenshots/TC-11-01-timeout-fallback-light.png` |
| TC-11-02 | `docs/30-workflows/completed-tasks/TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001/outputs/phase-11/screenshots/TC-11-02-timeout-fallback-dark.png` |
| TC-11-03 | `docs/30-workflows/completed-tasks/TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001/outputs/phase-11/screenshots/TC-11-03-timeout-to-settings.png` |
| TC-11-04 | `docs/30-workflows/completed-tasks/TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001/outputs/phase-11/screenshots/TC-11-04-settings-shell-unauthenticated.png` |

#### Phase 12 判定

- open 未タスク: **0件**
- screenshot 要求: **実画面証跡で充足**
- 再発防止ポイント: bypass 実装時は reset 条件も同時確認する

### タスク: TASK-FIX-SAFEINVOKE-TIMEOUT-001 safeInvoke timeout + timer cleanup（2026-03-10）

| 項目 | 値 |
| --- | --- |
| タスクID | TASK-FIX-SAFEINVOKE-TIMEOUT-001 |
| ステータス | **完了（Phase 1-13 実装・再監査・system spec 同期・PR作成完了）** |
| 完了日 | 2026-03-10 |
| 対象 | `apps/desktop/src/preload/ipc-utils.ts` / preload wrappers / current workflow Phase 11-12 |
| 成果物 | `docs/30-workflows/completed-tasks/TASK-FIX-SAFEINVOKE-TIMEOUT-001/outputs/` |

#### 実施内容

- `invokeWithTimeout()` に `IPC_TIMEOUT_MS = 5000` の timeout 契約を集約
- allowlist fail-fast を維持したまま、正常応答・reject の双方で `clearTimeout(timeoutId)` cleanup を追加
- preload timeout 単体テストを 15 件へ拡張し、timer 残留 0 件を固定
- preload 全体回帰、current workflow screenshot 4件、Phase 12 成果物、system spec 5件、SKILL/LOGS 4件を同一ターンで同期

#### 苦戦箇所

| 苦戦箇所 | 再発条件 | 対処 |
| --- | --- | --- |
| timeout 実装の主責務は Preload だが、影響は AuthGuard UI に現れる | 非UIタスクとしてコード検証のみで閉じる | current workflow 配下に timeout fallback / settings shell の screenshot 4件を取得し、UI 影響を実証した |
| cleanup 実装後も Phase 2/8/12 に「`clearTimeout` 不採用」が残る | 実装更新後に outputs と spec を横断修正しない | workflow 本文 / outputs / system spec / SKILL / LOGS を同一ターンで修正し、planned wording を撤去した |
| 再監査 screenshot で light theme の `リトライ` 視認性差分が見つかる | 機能修正と UI 品質課題を同一スコープで抱え込む | `UT-IMP-AUTH-TIMEOUT-FALLBACK-LIGHT-CONTRAST-GUARD-001` として未タスク化し、主タスクは timeout 契約の完了に集中した |

#### 検証証跡

| コマンド | 結果 |
| --- | --- |
| `cd apps/desktop && pnpm vitest run src/preload/__tests__/ipc-utils.safeInvoke-timeout.test.ts` | PASS（15 tests） |
| `cd apps/desktop && pnpm vitest run src/preload` | PASS（19 files / 551 tests） |
| `cd apps/desktop && pnpm typecheck` | PASS |
| `node apps/desktop/scripts/capture-task-fix-safeinvoke-timeout-phase11.mjs` | PASS（4 screenshots） |
| `node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/completed-tasks/TASK-FIX-SAFEINVOKE-TIMEOUT-001` | PASS |
| `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/TASK-FIX-SAFEINVOKE-TIMEOUT-001` | PASS |
| `node .claude/skills/task-specification-creator/scripts/validate-phase11-screenshot-coverage.js --workflow docs/30-workflows/completed-tasks/TASK-FIX-SAFEINVOKE-TIMEOUT-001` | PASS |
| `node .claude/skills/task-specification-creator/scripts/validate-phase12-implementation-guide.js --workflow docs/30-workflows/completed-tasks/TASK-FIX-SAFEINVOKE-TIMEOUT-001` | PASS |
| `gh pr create --title "fix(preload): safeInvoke に timeout と cleanup を追加"` | PR #1137 作成 |

#### 関連未タスク

| タスクID | 概要 | 参照 | ステータス |
| --- | --- | --- | --- |
| UT-IMP-AUTH-TIMEOUT-FALLBACK-LIGHT-CONTRAST-GUARD-001 | `AuthTimeoutFallback` ライトテーマの `リトライ` 視認性改善 | `docs/30-workflows/completed-tasks/TASK-FIX-SAFEINVOKE-TIMEOUT-001/unassigned-task/task-imp-auth-timeout-fallback-light-contrast-guard-001.md` | 未着手 |

### タスク: 08-TASK-IMP-SETTINGS-INTEGRATION-REGRESSION-COVERAGE-001 SettingsView 統合回帰カバレッジ強化（2026-03-08）

| 項目 | 値 |
| --- | --- |
| タスクID | 08-TASK-IMP-SETTINGS-INTEGRATION-REGRESSION-COVERAGE-001 |
| ステータス | **完了（Phase 1-12 出力 + 実装 + 実画面検証 + 仕様同期）** |
| 完了日 | 2026-03-08 |
| 対象 | `SettingsView.integration.test.tsx` / `settings-test-harness.ts` / Phase 11-12 証跡更新 |
| 成果物 | `docs/30-workflows/08-TASK-IMP-SETTINGS-INTEGRATION-REGRESSION-COVERAGE-001/outputs/` |

#### 実施内容

- SettingsView 統合テストを 18 件へ拡張（auth-mode 切替、provider fallback、status 表示条件、RAG/保存操作）
- `settings-test-harness.ts` に store + electronAPI 境界を集約し、過剰モックを抑制
- Phase 11 の画面検証を実施し、スクリーンショット 2 件を証跡化（TC-11-03/04）

#### 苦戦箇所

- Playwright 実行時のポート競合で初回撮影失敗（専用 spec へ切り出して再実行）
- `act()` warning が INT-05 系で残存（機能影響はないがノイズとして未タスク化）
- Phase 12 で「予定」表現が残りやすく、実績ベース記述への差し替えが必要

#### 検証証跡

| コマンド | 結果 |
| --- | --- |
| `cd apps/desktop && pnpm vitest run src/renderer/views/SettingsView/__tests__/SettingsView.integration.test.tsx` | PASS（18 tests） |
| `cd apps/desktop && pnpm test:e2e -- e2e/settings-integration-regression-screenshots.spec.ts` | PASS（2 tests） |
| `node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/08-TASK-IMP-SETTINGS-INTEGRATION-REGRESSION-COVERAGE-001 --json` | PASS |

#### Phase 12で登録した関連未タスク

| タスクID | 概要 | 参照 |
| --- | --- | --- |
| UT-08-001 | SettingsView 統合テストの `act()` warning 解消 | `docs/30-workflows/completed-tasks/unassigned-task/task-ut-08-001-settings-act-warning-guard.md` |
| UT-08-002 | SettingsView 画面導線の E2E カバレッジ拡張 | `docs/30-workflows/completed-tasks/unassigned-task/task-ut-08-002-settings-e2e-coverage.md` |
| UT-08-003 | Phase 6 残件（INT-11〜13）の再評価と必要分実装 | `docs/30-workflows/completed-tasks/unassigned-task/task-ut-08-003-settings-phase6-remaining-cases.md` |
| UT-08-004 | settings harness パターンの仕様標準化を継続強化 | `docs/30-workflows/completed-tasks/unassigned-task/task-ut-08-004-settings-harness-pattern-spec-sync.md` |

### タスク: TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001 Workspace Chat Edit AI Runtime 有効化（2026-03-14）

| 項目 | 値 |
| --- | --- |
| タスクID | TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001 |
| ステータス | **完了（Phase 1-12 完了）** |
| タイプ | feat |
| 優先度 | 高 |
| 完了日 | 2026-03-14 |
| 対象 | RuntimeResolver / AnthropicLLMAdapter / TerminalHandoffBuilder / M-01 contextBridge fix |
| 成果物 | `docs/30-workflows/completed-tasks/ai-runtime-authmode-unification/tasks/step-02-par-task-10-claude-code-terminal-surface/outputs/` |

#### 実施内容

- RuntimeResolver / AnthropicLLMAdapter / TerminalHandoffBuilder を実装し、Workspace Chat Edit の AI Runtime を有効化
- M-01 contextBridge fix を適用し、Preload payload の安全性を確保
- Phase 11 で screenshot 取得と Apple UI/UX 観点レビューを完了

#### 関連未タスク

| 未タスクID | 概要 | 優先度 | タスク仕様書 |
| --- | --- | --- | --- |
| ~~UT-CHAT-EDIT-WORKSPACE-CONSTRAINT-TEST-001~~ | ~~workspacePath テスト実装確認（TC-WS-01〜06）~~ | ~~高~~ | `docs/30-workflows/completed-tasks/task-chat-edit-workspace-constraint-test-001.md`（完了: 2026-03-15） |
| TASK-IMP-WORKSPACE-CHAT-EDIT-SPEC-SYNC-IPC-001 | IPC 正本同期（F-M02） | 中 | `docs/30-workflows/completed-tasks/unassigned-task/task-imp-workspace-chat-edit-spec-sync-ipc-001.md` |
| UT-FIX-PHASE11-SCREENSHOT-AUTOMATION-001 | Phase 11 スクリーンショット自動化 | 低 | `docs/30-workflows/completed-tasks/unassigned-task/task-fix-phase11-screenshot-automation-001.md` |

### UT-CHAT-EDIT-WORKSPACE-CONSTRAINT-TEST-001: workspacePath セキュリティ検証テスト実装（2026-03-15）

| 項目 | 内容 |
| --- | --- |
| タスクID | UT-CHAT-EDIT-WORKSPACE-CONSTRAINT-TEST-001 |
| Issue | #1222 |
| タイプ | test |
| 完了日 | 2026-03-15 |
| テストファイル | `apps/desktop/src/main/ipc/__tests__/chatEditHandlers.workspace-constraint.test.ts` |
| テスト対象 | `apps/desktop/src/main/ipc/chatEditHandlers.ts` L159-173（workspacePath 検証ロジック） |
| テスト数 | 6（TC-WS-01〜06 全PASS） |
| カバレッジ | workspacePath ブランチ 100% |

**テストケース概要**:
- TC-WS-01: workspace 内ファイルは正常処理（PASS）
- TC-WS-02: workspace 外ファイルは PERMISSION_DENIED で拒否
- TC-WS-03: workspacePath 未指定時は検証スキップ
- TC-WS-04: パストラバーサル攻撃パターン（`../`）を拒否
- TC-WS-05: 複数コンテキストのうち1件でも外部なら全体拒否
- TC-WS-06: 空配列コンテキストの正常処理

#### 実装内容（要点）

- `apps/desktop/src/main/ipc/__tests__/chatEditHandlers.workspace-constraint.test.ts` を追加し、workspacePath 制約の正常系/異常系/境界値（6ケース）を固定した
- `ipcMain.handle` の handler capture + `invokeHandler()` で IPC 経由の挙動をテストし、Main IPC 契約に沿った失敗コード（`PERMISSION_DENIED`）を確認した
- `isAllowedPath` は `vi.spyOn` ベースで監視し、パストラバーサル拒否の実装ロジック（正規化を含む）を保持したまま検証した

#### 苦戦箇所（再利用形式）

| 苦戦箇所 | 再発条件 | 対処 |
| --- | --- | --- |
| 同名ファイルの二重存在（P58） | `ipc/chatEditHandlers.ts` と `handlers/chatEditHandlers.ts` の責務差を確認せず編集する | `grep -rn "registerChatEditHandlers" apps/desktop/src/main` で呼び出し元を特定し、IPC 側を正本に固定 |
| RuntimeResolver mock 戦略（P61派生） | `integrated` 返却のままテストし、ChatEditService 依存が増殖する | `type: "handoff"` を返す mock へ寄せて依存面積を縮小し、workspacePath 監査に焦点化 |
| `vi.spyOn` と `vi.mock` の誤選択 | security helper を丸ごと mock して内部バリデーションを失う | `vi.spyOn(PathValidatorModule, "isAllowedPath")` を使い、実装保持で呼び出し観測 |

#### 同種課題の5分解決カード

1. 先に正本ファイルを `grep import/register` で確定し、同名ファイル誤編集を防ぐ。
2. 動的DI依存が重い場合は mock 戦略を `handoff` 側へ寄せ、対象責務だけを検証する。
3. セキュリティロジック検証は `vi.mock` ではなく `vi.spyOn` を優先し、実装を保持する。
4. workspace 制約は `正常系 / 外部拒否 / パストラバーサル / 複数コンテキスト / 空配列` を最小セットとして固定する。
5. Phase 12 では完了台帳・教訓・未タスク判定（current/baseline 分離）を同ターンで同期する。
