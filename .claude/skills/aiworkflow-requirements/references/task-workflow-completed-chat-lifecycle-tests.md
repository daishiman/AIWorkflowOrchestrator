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
| UT-CHATVIEW-ERROR-BANNER-I18N-001 | ChatView error banner の i18n 化 | `docs/30-workflows/completed-tasks/task-ut-chatview-error-banner-i18n-001.md` | 未実施 |
| UT-AI-CHAT-ERROR-CODE-INVENTORY-001 | `ai.chat` error code inventory の仕様固定 | `docs/30-workflows/completed-tasks/task-ut-ai-chat-error-code-inventory-001.md` | 未実施 |

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

