# AI Runtime / Access Surface Realignment 仕様書パック

## 概要

本パックは、`subscription` と `api-key` を単純に切り替える前提をいったん捨て、AI 利用経路を次の 2 系統へ分離して再設計するためのタスク仕様書群である。

- `Integrated API Runtime`: アプリが自動実行する AI 機能。API key を使う。
- `Claude Code Terminal Surface`: アプリは terminal UI だけを提供し、ユーザーが自分で `claude` を操作する。

この整理により、consumer subscription をアプリ内実行へ流用せず、個人利用したい Claude Code は `user-operated terminal` として first-class に残す。既存ディレクトリ名は履歴互換のため `ai-runtime-authmode-unification` のまま維持するが、設計上の中心概念は `auth mode toggle` ではなく `AI access matrix` である。

## 追加成果物

| 成果物       | パス                     | 用途                                                                                |
| ------------ | ------------------------ | ----------------------------------------------------------------------------------- |
| UI/UX 正本   | `ui-ux-realization.md`   | 全 AI surface の画面構成、状態、CTA、screenshot 契約を固定する                      |
| UI/UX 図解   | `ui-ux-diagrams.md`      | 核図、画面構成図、状態遷移図、マイコンポーネント図、CTA / handoff flow 図を固定する |
| 設計監査結果 | `design-audit-matrix.md` | 多角的監査の論点、矛盾、依存順、エレガンス判定を固定する                            |

## 目的

- すべての AI surface を `API 統合` と `手動 terminal` のどちらで扱うか明文化する
- app-integrated AI は API key 系に限定し、consumer subscription token をアプリが扱わない構造へ寄せる
- Chat / Workspace / Skill / Agent / Docs / RAG / Slide / Terminal の責務を分離したまま、UI/UX を一貫させる
- `skill-lifecycle-unification` が参照する前提を、`legacy authMode` ではなく `access capability` ベースで固定する

## Access Model 方針

| 項目                         | 方針                                                                                                            | 理由                                                    |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| Integrated API Runtime       | アプリが自動実行する AI は API key を使う                                                                       | 資格情報の出所、監査、失敗理由の説明が最も明確なため    |
| Claude Code Terminal Surface | Claude Code は `user-operated terminal` として扱う                                                              | アプリが OAuth token や consumer session を扱わないため |
| 設定モデル                   | `api-key` / `subscription` の排他的 toggle ではなく、`統合 AI` と `terminal` の capability を別カードで管理する | 実体として別責務であり、両方有効化できる方が自然なため  |
| Local 判定禁止               | 各 surface は独自の mode 判定を持たず Task01 の access matrix を消費する                                        | surface ごとの差分実装と silent fallback を防ぐため     |
| UI/UX                        | 各 surface は `実行可能`, `API key 必須`, `terminal へ handoff` のどれかを明示する                              | 認識ズレと誤操作を防ぐため                              |

## UI/UX Realization 方針

- UI/UX は独立の巨大 task に切り出さず、本パックの横断正本として `ui-ux-realization.md` を持つ
- 図が無くても同じ粒度で進められるよう、横断図解 `ui-ux-diagrams.md` を持つ
- 各 surface task は、その正本を参照して Phase 2 で画面構成と状態を固め、Phase 11 で screenshot 契約を回収する
- こうすることで、cross-cutting な一貫性は親パックが担い、個別 surface の責務は各 task に残せる

### 設定画面レビュー反映（2026-03-13）

設定画面の実レビュー（認証方式カード / Claude Agent SDK APIキー / APIキー設定一覧）で見えた改善要求を、Task01 と Task06 の共通契約として固定する。

- 認証方式トグルの選択状態と access capability 表示を同一語彙で同期する
- APIキー保存結果と guidance 表示を access card と同じ責務境界で出す
- Provider 一覧の登録状態を上位カードと整合させ、欠落キーを1画面で判読可能にする

## 多角的設計監査

- 監査結果は `design-audit-matrix.md` に集約する
- 主要結論は 3 点である
  - `subscription/api-key toggle` ではなく `access matrix` が正しい抽象である
  - Claude Code は integrated runtime ではなく `manual terminal surface` として扱う
  - UI/UX は parent 正本 + surface task 責務分配の構造が最も流動的で、巨大 task 化を防げる

## リスク境界

- consumer subscription / OAuth token をアプリが取得・保存・再利用・中継しない
- terminal surface では、アプリが `claude` へ自動コマンド送信・自動再試行・自動プロンプト注入をしない
- copy command / copy context / open working directory は許可するが、実行はユーザー操作に限定する
- `claude-cli:execute-script` などの自動化経路は、consumer subscription 前提の実行 lane として使わない
- 背景ジョブ型の AI 処理（RAG/embedding/extraction 等）は terminal mode で代替しようとせず、API 統合または guidance へ分離する

## AI Surface 台帳

| AI surface                                   | 現状                                                   | 目標                                                              | access 方針                         | 主担当タスク |
| -------------------------------------------- | ------------------------------------------------------ | ----------------------------------------------------------------- | ----------------------------------- | ------------ |
| Access Matrix / Legacy AuthMode 移行         | `authMode=subscription/api-key` に責務が載り過ぎている | `integratedRuntime` と `terminalSurface` の capability に分離する | 共通基盤                            | Task01       |
| Claude Code Terminal Surface                 | CLI automation はあるが embedded terminal UX が未整備  | user-operated terminal、出力表示、進捗、停止、再試行、履歴を持つ  | terminal only                       | Task02       |
| Workspace Chat Edit                          | stub と TODO が残る                                    | API runtime 接続と terminal handoff を持つ                        | API integration + terminal handoff  | Task03       |
| Skill / Agent / Skill Creator                | preflight / executor / UI / CLI の責務が混在           | integrated execute と terminal handoff を分離する                 | API integration + terminal handoff  | Task04       |
| Skill Docs                                   | stubQueryFn が残る                                     | integrated docs 生成と terminal handoff を分離する                | API integration + terminal handoff  | Task05       |
| Main Chat / Settings                         | legacy auth mode toggle が前提                         | access capability card、health、guidance を同期する               | API integration + terminal launcher | Task06       |
| ChatPanel                                    | placeholder のまま                                     | API runtime chat と terminal fallback を分離する                  | API integration + terminal handoff  | Task07       |
| Workspace Chat Panel                         | streaming と context handoff が分散                    | API runtime streaming と terminal handoff を両立する              | API integration + terminal handoff  | Task08       |
| RAG / Embedding / Extraction / Graph Summary | backend AI が API key 直前提または TODO                | API runtime capability と fail-fast を整理する                    | API integration only + guidance     | Task09       |
| Slide / Modifier / Legacy Agent              | direct SDK / silent fallback が残る                    | API runtime と manual fallback を整理する                         | API integration + terminal guidance | Task10       |

## 補助 Codepath 所有表

| codepath / 関心                                                                                                                                         | 所有タスク     | 扱い方                                                                     |
| ------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- | -------------------------------------------------------------------------- |
| `apps/desktop/src/main/services/auth/*` / `authModeSlice.ts` / `AuthModeSelector`                                                                       | Task01, Task06 | legacy auth mode の移行、access matrix、Settings UX を扱う                 |
| `apps/desktop/src/main/claude-cli/*` / `packages/shared/src/claude-cli/*` / `preload` の claude-cli channel 群                                          | Task02         | manual terminal、session、stream、abort、retry、performance を扱う         |
| `apps/desktop/src/renderer/components/organisms/ExecutionEnvironment/*`                                                                                 | Task02         | `EnvironmentType=terminal` の UI / UX 正本として扱う                       |
| `apps/desktop/src/main/handlers/chatEditHandlers.ts` / `chatEditApi.ts` / `ContextBuilder.ts`                                                           | Task03         | Chat Edit の API runtime と terminal handoff を扱う                        |
| `SkillExecutor.ts` / `SkillService.ts` / `SkillScheduler.ts` / `PermissionResolver.ts` / `ExecutionManager.ts` / `useSkillExecution.ts` / `useAgent.ts` | Task04         | execute / creator / agent の integrated runtime と terminal handoff を扱う |
| `SkillDocGenerator.ts` / skill docs 周辺 handler                                                                                                        | Task05         | docs 生成の integrated runtime と handoff を扱う                           |
| `ChatView` / `LLMSelectorPanel` / `SystemPromptPanel` / `SettingsView` / `HealthIndicator`                                                              | Task06         | access card、health、guidance、launcher を扱う                             |
| `ChatPanel.tsx` / `useStreamingChat.ts`                                                                                                                 | Task07         | main chat panel の API runtime と terminal fallback を扱う                 |
| `WorkspaceChatPanel.tsx` / `useWorkspaceChatController.ts` / `llm:stream-chat`                                                                          | Task08         | workspace stream / file context / terminal handoff を扱う                  |
| `AI_INDEX` / embedding / extraction / graph / CRAG / reranking codepath                                                                                 | Task09         | backend capability matrix と fail-fast を扱う                              |
| `slide/*` AI codepath                                                                                                                                   | Task10         | slide reverse-sync と access matrix の整流を扱う                           |

## タスク一覧

| 順序 | タスクID                                         | ディレクトリ                                                                                                          | 責務                                                              | 実行順序                          |
| ---- | ------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- | --------------------------------- |
| 1    | TASK-IMP-AI-RUNTIME-AUTHMODE-UNIFICATION-001     | `tasks/step-01-seq-task-01-ai-runtime-authmode-foundation`                                                            | access matrix、legacy auth mode migration、共通 capability 契約   | 最優先・直列                      |
| 2    | TASK-IMP-CLAUDE-CODE-TERMINAL-SURFACE-001        | `../completed-tasks/ai-runtime-authmode-unification/tasks/step-02-par-task-10-claude-code-terminal-surface`           | user-operated Claude Code terminal、session UX、manual boundary   | Task01 Phase 3 後・直列優先       |
| 3    | TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001      | `../completed-tasks/ai-runtime-authmode-unification/tasks/step-02-par-task-02-workspace-chat-edit-runtime-activation` | Chat Edit の API runtime 有効化と terminal handoff                | Task01/Task02 Phase 3 後・並列    |
| 4    | TASK-IMP-SKILL-AGENT-RUNTIME-ROUTING-001         | `tasks/step-02-par-task-03-skill-agent-runtime-routing`                                                               | Skill / Agent / Creator の integrated runtime と terminal handoff | Task01/Task02 Phase 3 後・並列    |
| 5    | TASK-IMP-SKILL-DOCS-AI-RUNTIME-001               | `tasks/step-03-par-task-04-skill-docs-runtime-integration`                                                            | Skill Docs の integrated runtime と terminal handoff              | Task01/Task02 Phase 3 後・並列    |
| 6    | TASK-IMP-MAIN-CHAT-SETTINGS-AI-RUNTIME-001       | `tasks/step-03-par-task-06-main-chat-settings-runtime-sync`                                                           | Chat / Settings / health / access card / launcher 同期            | Task01/Task02 Phase 3 後・並列    |
| 7    | TASK-IMP-CHATPANEL-REAL-AI-CHAT-001              | `tasks/step-03-seq-task-05-chatpanel-real-chat-wiring`                                                                | ChatPanel の API runtime 統合と terminal fallback UX              | Task02 と Task06 Phase 2 後・直列 |
| 8    | TASK-IMP-WORKSPACE-CHAT-PANEL-AI-RUNTIME-001     | `tasks/step-03-par-task-07-workspace-chat-panel-runtime-alignment`                                                    | Workspace Chat Panel の streaming と terminal handoff             | Task02 と Task06 Phase 2 後・並列 |
| 9    | TASK-IMP-RAG-EMBEDDING-EXTRACTION-AI-RUNTIME-001 | `tasks/step-04-par-task-08-rag-embedding-extraction-runtime`                                                          | backend AI capability matrix と API runtime ルール                | Task01 Phase 3 後・並列           |
| 10   | TASK-IMP-SLIDE-AI-RUNTIME-ALIGNMENT-001          | `tasks/step-04-par-task-09-slide-ai-runtime-alignment`                                                                | slide reverse-sync の API runtime 整流と manual fallback          | Task01/Task02 Phase 3 後・並列    |

## タスク通称

`Task01` から `Task10` はこの表の実行順を指す通称であり、ディレクトリ枝番とは一致しない場合がある。

| 通称   | 実タスクID                                         | 意味                            |
| ------ | -------------------------------------------------- | ------------------------------- |
| Task01 | `TASK-IMP-AI-RUNTIME-AUTHMODE-UNIFICATION-001`     | Access Matrix Foundation        |
| Task02 | `TASK-IMP-CLAUDE-CODE-TERMINAL-SURFACE-001`        | Claude Code Terminal Surface    |
| Task03 | `TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001`      | Workspace Chat Edit             |
| Task04 | `TASK-IMP-SKILL-AGENT-RUNTIME-ROUTING-001`         | Skill / Agent / Creator         |
| Task05 | `TASK-IMP-SKILL-DOCS-AI-RUNTIME-001`               | Skill Docs                      |
| Task06 | `TASK-IMP-MAIN-CHAT-SETTINGS-AI-RUNTIME-001`       | Main Chat / Settings            |
| Task07 | `TASK-IMP-CHATPANEL-REAL-AI-CHAT-001`              | ChatPanel                       |
| Task08 | `TASK-IMP-WORKSPACE-CHAT-PANEL-AI-RUNTIME-001`     | Workspace Chat Panel            |
| Task09 | `TASK-IMP-RAG-EMBEDDING-EXTRACTION-AI-RUNTIME-001` | RAG / Embedding / Extraction    |
| Task10 | `TASK-IMP-SLIDE-AI-RUNTIME-ALIGNMENT-001`          | Slide / Modifier / Legacy Agent |

## エレガンス判定

今回の見直しで最も大きい変更は、「`subscription` と `api-key` を排他的に切り替える」という前提そのものを捨てたことにある。よりエレガントな構成は次の 3 点を同時に満たす。

| 観点         | 判定基準                                                   | 今回の結論                                                        |
| ------------ | ---------------------------------------------------------- | ----------------------------------------------------------------- |
| 抽象の正しさ | 実体が異なるものを同じ toggle に押し込めていないか         | `API runtime` と `manual terminal` は別 capability として分離する |
| 責務分離     | 自動実行と手動操作の境界が明確か                           | terminal surface を独立 task に切り出す                           |
| UX 整合      | 各 surface が「何ができて、何は handoff か」を説明できるか | access matrix と launcher/guidance を共通化する                   |

## 依存グラフ

| タスク | 直接依存                       | 依存理由                                                                                |
| ------ | ------------------------------ | --------------------------------------------------------------------------------------- |
| Task01 | なし                           | access matrix と migration を先に固定するため                                           |
| Task02 | Task01 Phase 3                 | terminal surface も access matrix を参照するため                                        |
| Task03 | Task01 Phase 3, Task02 Phase 2 | Chat Edit が integrated runtime と terminal handoff を両方参照するため                  |
| Task04 | Task01 Phase 3, Task02 Phase 2 | Skill / Agent / Creator が integrated runtime と terminal handoff を参照するため        |
| Task05 | Task01 Phase 3, Task02 Phase 2 | Skill Docs が docs prompt handoff を参照するため                                        |
| Task06 | Task01 Phase 3, Task02 Phase 2 | Settings / main chat が access card と terminal launcher を持つため                     |
| Task07 | Task02 Phase 2, Task06 Phase 2 | ChatPanel が launcher / guidance と main authority を参照するため                       |
| Task08 | Task02 Phase 2, Task06 Phase 2 | Workspace Chat Panel が launcher / guidance と selected config authority を参照するため |
| Task09 | Task01 Phase 3                 | backend capability matrix は Task01 を参照すれば足りるため                              |
| Task10 | Task01 Phase 3, Task02 Phase 2 | slide 系が runtime と manual fallback を両方参照するため                                |

## Phase 1-3 ゲート

- Step 02 以降に進む前に Task01 の Phase 1-3 を PASS にする
- Task02 は Task01 の直後に着手し、manual terminal boundary を先に固定する
- Task03 / Task04 / Task05 / Task06 / Task09 / Task10 は Task01 Phase 3 後に並列で進めてよい
- Task07 / Task08 は Task02 と Task06 の Phase 2 を前提に着手する
- `skill-lifecycle-unification` の Task02 / Task03 / Task05 は Task01 と Task02 を共通前提とする

## 並列化方針

- 直列で先に確定するもの:
  - Task01 Phase 1-3
  - Task02 Phase 1-3
  - Task07 / Task08 の Phase 1-3
- 並列で進めてよいもの:
  - Task03 / Task04 / Task05 / Task06 / Task09 / Task10 の Phase 1-3
  - 各 task の Phase 4-7 テスト仕様化
  - 各 task の Phase 8-12 文書 / レビュー準備

## 関心ごとの分離

| 関心ごと                     | 主担当タスク | 主な判断対象                                                 |
| ---------------------------- | ------------ | ------------------------------------------------------------ |
| Access Matrix / migration    | Task01       | legacy auth mode、capability、fallback 禁止                  |
| Manual terminal surface      | Task02       | PTY/terminal、session、output、abort、retry、performance     |
| Workspace Chat Edit          | Task03       | selection、workspacePath、context summary、terminal handoff  |
| Skill / Agent / Creator      | Task04       | execute、improve、permission、manual runbook                 |
| Skill Docs                   | Task05       | doc generation、queryFn、prompt handoff                      |
| Main Chat / Settings         | Task06       | access card、health、launcher、guidance                      |
| ChatPanel                    | Task07       | API chat、empty/error/loading、terminal fallback             |
| Workspace Chat Panel         | Task08       | stream chat、selected files、conversation、terminal launcher |
| RAG / Embedding / Extraction | Task09       | backend capability、fail-fast、guidance                      |
| Slide reverse sync           | Task10       | direct SDK 排除、reverse-sync guidance、manual fallback      |

## Atent Team / SubAgent 分担案

| チーム | 担当                                                         |
| ------ | ------------------------------------------------------------ |
| Team A | access matrix、legacy auth mode migration、Settings contract |
| Team B | Claude Code terminal、session UX、manual boundary            |
| Team C | Workspace Chat Edit / context handoff                        |
| Team D | Skill / Agent / Creator orchestration                        |
| Team E | Skill Docs runtime / prompt handoff                          |
| Team F | Main Chat / Settings / launcher / guidance                   |
| Team G | ChatPanel / Workspace Chat Panel UX                          |
| Team H | RAG / embedding / extraction capability                      |
| Team I | Slide / modifier / reverse-sync                              |
| Team J | system spec sync、task-workflow、lessons learned             |

## 既存タスクとの接続

| 既存タスク                                                                                                        | 扱い                                                   |
| ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| `docs/30-workflows/unassigned-task/task-environment-type-terminal-implementation.md`                              | Task02 に統合                                          |
| `docs/30-workflows/unassigned-task/task-imp-claude-cli-progress-feedback.md`                                      | Task02 に統合                                          |
| `docs/30-workflows/unassigned-task/task-imp-claude-cli-abort-ui.md`                                               | Task02 に統合                                          |
| `docs/30-workflows/unassigned-task/task-imp-claude-cli-retry-ux.md`                                               | Task02 に統合                                          |
| `docs/30-workflows/unassigned-task/task-perf-claude-cli-large-output.md`                                          | Task02 に統合                                          |
| `docs/30-workflows/unassigned-task/task-perf-claude-cli-concurrent-load.md`                                       | Task02 に統合                                          |
| `docs/30-workflows/unassigned-task/task-imp-workspace-chat-edit-monaco-integration-001.md`                        | Task03 に統合                                          |
| `docs/30-workflows/unassigned-task/task-9b-i-skill-creator-sdk-integration.md`                                    | Task04 に統合                                          |
| `docs/30-workflows/completed-tasks/TASK-9I-skill-docs/unassigned-task/task-ut-9i-001-llm-provider-integration.md` | Task05 に統合                                          |
| `docs/30-workflows/completed-tasks/api-key-chat-tool-integration-alignment/`                                      | Task06 / Task07 / Task08 の API runtime 正本として参照 |
| `docs/30-workflows/completed-tasks/claude-code-cli-integration/`                                                  | Task02 の CLI / session / UX 正本として参照            |
| `docs/30-workflows/completed-tasks/claude-cli-renderer-api/`                                                      | Task02 の preload / IPC / security 正本として参照      |
| `docs/30-workflows/completed-tasks/embedding-generation-pipeline/`                                                | Task09 の embedding 正本として参照                     |
| `docs/30-workflows/completed-tasks/hybridrag-integration/`                                                        | Task09 の RAG 正本として参照                           |

## システム仕様参照

| 参照資料                         | パス                                                                                    | 用途                                     |
| -------------------------------- | --------------------------------------------------------------------------------------- | ---------------------------------------- |
| interfaces-auth                  | `.claude/skills/aiworkflow-requirements/references/interfaces-auth.md`                  | legacy auth mode migration と error code |
| api-ipc-system                   | `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`                   | AI_CHAT / selected config / key 管理     |
| api-ipc-agent                    | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                    | Chat Edit / Skill Docs の IPC            |
| interfaces-llm                   | `.claude/skills/aiworkflow-requirements/references/interfaces-llm.md`                   | chat / llm 契約                          |
| llm-streaming                    | `.claude/skills/aiworkflow-requirements/references/llm-streaming.md`                    | streaming surface 契約                   |
| llm-workspace-chat-edit          | `.claude/skills/aiworkflow-requirements/references/llm-workspace-chat-edit.md`          | Workspace Chat Edit 契約                 |
| llm-embedding                    | `.claude/skills/aiworkflow-requirements/references/llm-embedding.md`                    | embedding / pipeline 契約                |
| interfaces-agent-sdk-executor    | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-executor.md`    | skill / agent execute 契約               |
| interfaces-agent-sdk-ui          | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-ui.md`          | terminal preview / agent UI 契約         |
| interfaces-agent-sdk-integration | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-integration.md` | Claude CLI / session / preload 契約      |
| interfaces-agent-sdk-history     | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-history.md`     | `EnvironmentType=terminal` の既存正本    |
| ui-ux-settings                   | `.claude/skills/aiworkflow-requirements/references/ui-ux-settings.md`                   | Settings / access card 正本              |
| ui-ux-feature-components         | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`         | Chat / Workspace / Skill surface 構成    |
| ui-ux-agent-execution            | `.claude/skills/aiworkflow-requirements/references/ui-ux-agent-execution.md`            | Agent / terminal surface の UI 契約      |
| ui-ux-panels                     | `.claude/skills/aiworkflow-requirements/references/ui-ux-panels.md`                     | ChatPanel / panel UX の正本              |
| security-electron-ipc            | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`            | IPC sender / masking / error envelope    |
| security-api-electron            | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`            | Claude CLI / preload security            |
| architecture-overview            | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`            | 全体責務境界                             |
| architecture-rag                 | `.claude/skills/aiworkflow-requirements/references/architecture-rag.md`                 | RAG / search 正本                        |
| arch-claude-cli                  | `.claude/skills/aiworkflow-requirements/references/arch-claude-cli.md`                  | Claude CLI / session / renderer API 正本 |
| arch-state-management            | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`            | Settings / selector / migration state    |
| task-workflow                    | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                    | 完了タスク / 未タスク / 証跡             |
| lessons-learned                  | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                  | spec sync / UI drift 教訓                |

## 注意事項

- 本パックは仕様書作成専用であり、実装・コミット・PR は行わない
- `consumer subscription をアプリ内自動実行に使う` 設計へ戻さない
- terminal surface は `manual assistant surface` であり、integrated runtime の代替エンジンとして扱わない
- 各 surface は access matrix を参照し、独自 toggle や silent fallback を増やさない
