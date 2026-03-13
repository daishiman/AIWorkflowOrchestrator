# ai-runtime-authmode-foundation - タスク実行仕様書

## ユーザーからの元の指示

```text
AI 機能を `Integrated API Runtime` と `ユーザー操作の Claude Code terminal surface` に分離し、すべての AI surface で切替・handoff・UI/UX・実行順序が分かるタスク仕様書を task-specification-creator と aiworkflow-requirements に従って整備する。実装は行わない。
```

## メタ情報

| 項目         | 内容                                                   |
| ------------ | ------------------------------------------------------ |
| タスクID     | TASK-IMP-AI-RUNTIME-AUTHMODE-UNIFICATION-001           |
| タスク名     | ai-runtime-authmode-foundation                         |
| 分類         | 設計                                                   |
| 対象機能     | 全 AI surface の access matrix / legacy auth mode 基盤 |
| 優先度       | 高                                                     |
| 見積もり規模 | 中規模                                                 |
| ステータス   | spec_created                                           |
| 作成日       | 2026-03-13                                             |

## タスク概要

### 目的

`subscription` / `api-key` の排他的 toggle をそのまま広げるのではなく、`Integrated API Runtime` と `Claude Code Terminal Surface` の 2 capability を正規化する親タスク。legacy `authMode` との互換を保ちながら、access matrix、migration、fail-fast、guidance ルールを先に固定する。

### 背景

現状は AuthModeService、SkillExecutor、Chat Edit、ChatPanel、SkillDocGenerator、Claude CLI 経路がそれぞれ別の前提で動いており、`subscription` をアプリ内実行へ流用する余地まで残っている。より筋のよい構成は、`app-integrated AI = API key`、`Claude Code = user-operated terminal surface` と切り分けることにある。まずこの抽象を統一しないと、各 surface に矛盾した toggle と guidance が散る。

### 最終ゴール

全 AI surface の entrypoint、access matrix、legacy migration、terminal boundary、spec sync 先が Phase 1-13 で追える状態にする。

### 成果物一覧

| 種別               | 成果物                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | 配置先                                                                                                                        |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| 仕様書             | index.md / phase-1〜13 / artifacts.json                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | `docs/30-workflows/ai-runtime-authmode-unification/tasks/step-01-seq-task-01-ai-runtime-authmode-foundation`                  |
| 設計成果物         | outputs/phase-_/_.md                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | `docs/30-workflows/ai-runtime-authmode-unification/tasks/step-01-seq-task-01-ai-runtime-authmode-foundation/outputs/phase-*/` |
| system spec 同期先 | interfaces-auth.md / api-ipc-system.md / api-ipc-agent.md / interfaces-llm.md / llm-streaming.md / llm-ipc-types.md / llm-workspace-chat-edit.md / llm-embedding.md / interfaces-agent-sdk.md / interfaces-agent-sdk-ui.md / interfaces-agent-sdk-executor.md / interfaces-agent-sdk-integration.md / interfaces-agent-sdk-skill.md / interfaces-agent-sdk-history.md / security-electron-ipc.md / security-api-electron.md / security-skill-execution.md / ui-ux-settings.md / ui-ux-llm-selector.md / ui-ux-system-prompt.md / ui-ux-navigation.md / ui-ux-feature-components.md / ui-ux-agent-execution.md / ui-ux-panels.md / architecture-overview.md / architecture-rag.md / arch-claude-cli.md / arch-state-management.md / task-workflow.md / lessons-learned.md | `/.claude/skills/aiworkflow-requirements/references/`                                                                         |

## 参照ファイル

| 参照資料                    | パス                                                                                                                                                                                  | 内容                                                                                            |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| pack parent index           | `docs/30-workflows/ai-runtime-authmode-unification/index.md`                                                                                                                          | 実行順序、依存グラフ、共通方針の正本を確認する                                                  |
| pack design audit           | `docs/30-workflows/ai-runtime-authmode-unification/design-audit-matrix.md`                                                                                                            | 多角的監査の結論、禁止事項、依存整合を確認する                                                  |
| pack UI/UX 図解             | `docs/30-workflows/ai-runtime-authmode-unification/ui-ux-diagrams.md`                                                                                                                 | 5図セットの画面構成、状態遷移、CTA 導線を確認する                                               |
| pack UI/UX 正本             | `docs/30-workflows/ai-runtime-authmode-unification/ui-ux-realization.md`                                                                                                              | 全 surface 共通の状態、CTA、microcopy 契約を確認する                                            |
| settings screenshot review  | `docs/30-workflows/ai-runtime-authmode-unification/tasks/step-01-seq-task-01-ai-runtime-authmode-foundation/outputs/phase-11/screenshots/TC-11-00-settings-authmode-review-board.png` | 設定画面（認証方式カード・Claude Agent SDK APIキー・APIキー設定一覧）の改善要求を要件へ反映する |
| AuthModeService             | `apps/desktop/src/main/services/auth/AuthModeService.ts`                                                                                                                              | legacy authMode migration と persisted provider state を確認する                                |
| authModeSlice               | `apps/desktop/src/renderer/store/slices/authModeSlice.ts`                                                                                                                             | renderer の旧 mode 状態と migration 影響面を確認する                                            |
| skillExecutionAuthPreflight | `apps/desktop/src/renderer/utils/skillExecutionAuthPreflight.ts`                                                                                                                      | integrated runtime 前提化の影響を確認する                                                       |
| chatEditHandlers            | `apps/desktop/src/main/handlers/chatEditHandlers.ts`                                                                                                                                  | Chat Edit の runtime 入口を確認する                                                             |
| SkillDocGenerator           | `apps/desktop/src/main/services/skill/SkillDocGenerator.ts`                                                                                                                           | Skill Docs の queryFn DI と provider 接続点を確認する                                           |
| SkillExecutor               | `apps/desktop/src/main/services/skill/SkillExecutor.ts`                                                                                                                               | API key 依存と terminal handoff 境界を確認する                                                  |
| AgentExecutor               | `apps/desktop/src/main/services/agent/AgentExecutor.ts`                                                                                                                               | agent 実行の integrated runtime 入口を確認する                                                  |
| AgentHandler                | `apps/desktop/src/main/agent/agent-handler.ts`                                                                                                                                        | agent IPC と terminal launcher 接点を確認する                                                   |
| ClaudeCliManager            | `apps/desktop/src/main/claude-cli/ClaudeCliManager.ts`                                                                                                                                | 既存 CLI automation と session 管理の現状確認                                                   |
| ProcessManager              | `apps/desktop/src/main/claude-cli/ProcessManager.ts`                                                                                                                                  | manual terminal 実現に使える process 境界を確認する                                             |
| SessionManager              | `apps/desktop/src/main/claude-cli/SessionManager.ts`                                                                                                                                  | session lifecycle と transcript 保持の現状確認                                                  |
| Claude CLI IPC              | `apps/desktop/src/main/claude-cli/ipc-handler.ts`                                                                                                                                     | current CLI invoke/on 契約を確認する                                                            |
| ExecutionEnvironment        | `apps/desktop/src/renderer/components/organisms/ExecutionEnvironment/index.tsx`                                                                                                       | terminal placeholder の現状確認                                                                 |
| SlideWorkspace              | `apps/desktop/src/renderer/slide/SlideWorkspace.tsx`                                                                                                                                  | slide renderer surface と reverse-sync 導線を確認する                                           |
| LLMAdapterFactory           | `apps/desktop/src/main/adapters/llm/LLMAdapterFactory.ts`                                                                                                                             | integrated runtime の認証解決点を確認する                                                       |
| WorkspaceChatPanel          | `apps/desktop/src/renderer/views/WorkspaceView/WorkspaceChatPanel.tsx`                                                                                                                | workspace chat surface の runtime 接点を確認する                                                |
| ChatPanel                   | `apps/desktop/src/renderer/components/chat/ChatPanel.tsx`                                                                                                                             | placeholder と fallback UX を確認する                                                           |
| aiHandlers                  | `apps/desktop/src/main/ipc/aiHandlers.ts`                                                                                                                                             | `AI_CHAT` / `AI_CHECK_CONNECTION` / `AI_INDEX` の authority を確認する                          |

## Access Model 方針

| 項目                         | 方針                                                              | 理由                                                |
| ---------------------------- | ----------------------------------------------------------------- | --------------------------------------------------- |
| Integrated API Runtime       | app-integrated AI は API key を使う                               | 自動実行を consumer subscription に依存させないため |
| Claude Code Terminal Surface | terminal は `user-operated` を厳守する                            | アプリが token / command automation に触れないため  |
| Legacy migration             | `authMode=subscription` は `terminal capability enabled` へ寄せる | 既存設定を破壊せず意味論を修正するため              |
| Fallback                     | integrated runtime 失敗時に terminal へ勝手に切り替えない         | 実行責任と証跡を曖昧にしないため                    |
| UI authority                 | Main Process が capability / guidance を返す                      | Renderer ごとの差分判定を防ぐため                   |

## AI Surface Capability Matrix

| surface                                                         | 現状                                                   | 目標                                                    | access 方針                         | 後続タスク |
| --------------------------------------------------------------- | ------------------------------------------------------ | ------------------------------------------------------- | ----------------------------------- | ---------- |
| Settings / Access Card                                          | `authMode` toggle が中核になっている                   | integrated runtime card と terminal card に分離する     | dual capability 管理                | Task06     |
| Claude Code Terminal Surface                                    | embedded terminal がなく CLI automation 中心           | user-operated terminal / transcript / session UX を持つ | terminal only                       | Task02     |
| ChatView / `AI_CHAT`                                            | selected config / health / prompt / mode が分散        | integrated runtime の authority を Main に寄せる        | API integration + terminal launcher | Task06     |
| ChatPanel                                                       | placeholder 導線が残る                                 | API runtime chat と terminal fallback を分離する        | API integration + terminal handoff  | Task07     |
| Workspace Chat Edit                                             | runtime 入口と stub が混在                             | integrated runtime + selection handoff を整理する       | API integration + terminal handoff  | Task03     |
| Workspace Chat Panel                                            | stream / file context / selected config handoff が分散 | streaming と terminal launcher を両立する               | API integration + terminal handoff  | Task08     |
| Skill / Agent / Skill Creator                                   | direct read と preflight 差分がある                    | integrated execute と manual handoff を分離する         | API integration + terminal handoff  | Task04     |
| Skill Docs                                                      | stubQueryFn が残る                                     | docs runtime と prompt handoff を分離する               | API integration + terminal handoff  | Task05     |
| Slide / Modifier / Legacy Agent                                 | direct SDK / simulated 実行が残る                      | API runtime と manual fallback を分離する               | API integration + terminal guidance | Task10     |
| RAG / Embedding / Extraction / Graph Summary / CRAG / Reranking | TODO / mock / API key 直前提が残る                     | backend capability と fail-fast を持つ                  | API integration only + guidance     | Task09     |

## リスク境界

- consumer subscription token をアプリが取得・保存・再利用・中継しない
- terminal surface ではユーザー入力のみを `claude` へ送る
- copy command / copy context / open cwd は可、auto send / auto retry / hidden prompt injection は不可
- `claude-cli:execute-script` の現行自動化 lane は consumer subscription 用の本線として使わない
- backend AI job は terminal へ逃がさず、API runtime または明示 guidance へ分離する

## タスク分解サマリー

| ID   | フェーズ   | サブタスク名     | 責務                                                        | 依存 |
| ---- | ---------- | ---------------- | ----------------------------------------------------------- | ---- |
| T-01 | Phase 1    | 要件整理         | 現状 inventory と capability gap を明文化する               | -    |
| T-02 | Phase 2    | 設計確定         | access matrix、legacy migration、manual boundary を定義する | T-01 |
| T-03 | Phase 3    | レビューゲート   | 後続 task へ handoff 可能かを判定する                       | T-02 |
| T-04 | Phase 4-7  | テスト仕様化     | 契約テスト、migration、UI guidance の回帰を定義する         | T-03 |
| T-05 | Phase 8-13 | 文書化と handoff | spec sync と rollout 説明を整理する                         | T-04 |

## 実行フロー

1. Phase 1-3 で access model、manual boundary、レビューゲートを固める。
2. Phase 4-7 で migration / capability / guidance のテスト仕様を固める。
3. Phase 8-13 で実装順序、文書同期、handoff を固める。

## Phase一覧

| Phase | 名称             | 仕様書                                                         | ステータス  |
| ----- | ---------------- | -------------------------------------------------------------- | ----------- |
| 1     | 要件定義         | [phase-1-requirements.md](./phase-1-requirements.md)           | not_started |
| 2     | 設計             | [phase-2-design.md](./phase-2-design.md)                       | not_started |
| 3     | 設計レビュー     | [phase-3-design-review.md](./phase-3-design-review.md)         | not_started |
| 4     | テスト作成       | [phase-4-test-creation.md](./phase-4-test-creation.md)         | not_started |
| 5     | 実装             | [phase-5-implementation.md](./phase-5-implementation.md)       | not_started |
| 6     | テスト拡充       | [phase-6-test-expansion.md](./phase-6-test-expansion.md)       | not_started |
| 7     | カバレッジ確認   | [phase-7-coverage-check.md](./phase-7-coverage-check.md)       | not_started |
| 8     | リファクタリング | [phase-8-refactoring.md](./phase-8-refactoring.md)             | not_started |
| 9     | 品質検証         | [phase-9-quality-assurance.md](./phase-9-quality-assurance.md) | not_started |
| 10    | 最終レビュー     | [phase-10-final-review.md](./phase-10-final-review.md)         | not_started |
| 11    | 手動テスト       | [phase-11-manual-test.md](./phase-11-manual-test.md)           | not_started |
| 12    | ドキュメント     | [phase-12-documentation.md](./phase-12-documentation.md)       | not_started |
| 13    | PR作成           | [phase-13-pr-creation.md](./phase-13-pr-creation.md)           | not_started |

## 統合テスト連携（Phase 1〜11で必須）

- access card、legacy migration、capability matrix、launcher / guidance、terminal boundary の接続点を各 Phase で必ず扱う。
- 本タスクでは `integrated runtime`, `terminal surface`, `legacy auth mode migration`, `silent fallback 禁止` を統合テスト観点の中心に置く。

## Phase完了時の必須アクション

- 本Phase内の全タスクを100%実行完了と記録する。
- 成果物パスと完了条件を確認する。
- artifacts.json を更新対象として扱う。
