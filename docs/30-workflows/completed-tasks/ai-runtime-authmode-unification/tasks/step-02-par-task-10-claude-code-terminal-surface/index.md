# claude-code-terminal-surface - タスク実行仕様書

## ユーザーからの元の指示

```text
AI 機能を `Integrated API Runtime` と `ユーザー操作の Claude Code terminal surface` に分離し、すべての AI surface で切替・handoff・UI/UX・実行順序が分かるタスク仕様書を task-specification-creator と aiworkflow-requirements に従って整備する。実装は行わない。
```

## メタ情報

| 項目         | 内容                                              |
| ------------ | ------------------------------------------------- |
| タスクID     | TASK-IMP-CLAUDE-CODE-TERMINAL-SURFACE-001         |
| タスク名     | claude-code-terminal-surface                      |
| 分類         | 設計                                              |
| 対象機能     | Claude Code terminal surface と手動操作境界の整流 |
| 優先度       | 高                                                |
| 見積もり規模 | 中規模                                            |
| ステータス   | spec_created                                      |
| 作成日       | 2026-03-13                                        |

## タスク概要

### 目的

アプリ内 AI 実行とは切り離して、`ユーザーが自分で Claude Code を操作する terminal surface` を first-class UI として成立させる。embedded terminal、session transcript、progress / abort / retry UX、large output 対策、manual-control boundary を仕様として固定する。

### 背景

現状の Claude CLI まわりは `executeScript` と session management を中心とした automation 前提で、`EnvironmentType=terminal` も placeholder のままである。今回の前提では、consumer subscription をアプリ内自動実行に使わず、Claude Code は `manual terminal` として使えるようにする必要があるため、CLI automation と terminal UX を整理し直す専用 task が必要である。

### 最終ゴール

terminal surface が installation check、launch、stream output、status、abort、retry、history、large output performance を持ちつつ、アプリが OAuth token や自動コマンド送信に触れない設計を確定する。

### 成果物一覧

| 種別               | 成果物                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | 配置先                                                                                                                                      |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| 仕様書             | index.md / phase-1〜13 / artifacts.json                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | `docs/30-workflows/completed-tasks/ai-runtime-authmode-unification/tasks/step-02-par-task-10-claude-code-terminal-surface`                  |
| 設計成果物         | outputs/phase-_/_.md                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | `docs/30-workflows/completed-tasks/ai-runtime-authmode-unification/tasks/step-02-par-task-10-claude-code-terminal-surface/outputs/phase-*/` |
| system spec 同期先 | workflow-ai-runtime-authmode-unification.md / ui-ux-settings.md / interfaces-auth.md / api-ipc-system.md / interfaces-agent-sdk-integration.md / interfaces-agent-sdk-ui.md / interfaces-agent-sdk-history.md / ui-ux-agent-execution.md / ui-ux-feature-components.md / security-api-electron.md / security-electron-ipc.md / arch-claude-cli.md / architecture-overview.md / task-workflow.md / lessons-learned.md / legacy-ordinal-family-register.md / indexes/resource-map.md / indexes/quick-reference.md | `.claude/skills/aiworkflow-requirements/`                                                                                                   |

## 参照ファイル

| 参照資料                             | パス                                                                                                     | 内容                                                                              |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| pack parent index                    | `docs/30-workflows/ai-runtime-authmode-unification/index.md`                                             | 実行順序、依存グラフ、共通方針の正本を確認する                                    |
| pack design audit                    | `docs/30-workflows/ai-runtime-authmode-unification/design-audit-matrix.md`                               | 多角的監査の結論、禁止事項、依存整合を確認する                                    |
| pack UI/UX 図解                      | `docs/30-workflows/ai-runtime-authmode-unification/ui-ux-diagrams.md`                                    | 5図セットの画面構成、状態遷移、CTA 導線を確認する                                 |
| pack UI/UX 正本                      | `docs/30-workflows/ai-runtime-authmode-unification/ui-ux-realization.md`                                 | 全 surface 共通の状態、CTA、microcopy 契約を確認する                              |
| Task01 foundation investigation      | `docs/30-workflows/TASK-FIX-SKILL-DOCS-SPEC-FOUNDATION/task-05-phase-1-3-source-investigation-report.md` | access matrix / resolver / fail-fast / terminal boundary の現行調査結果を継承する |
| Task01 settings review investigation | `docs/30-workflows/TASK-FIX-SKILL-DOCS-SPEC-FOUNDATION/task-05-phase-1-3-source-investigation-report.md` | 設定画面レビュー結果（TC-11-00 相当）を設計へ反映する                             |
| ClaudeCliManager                     | `apps/desktop/src/main/claude-cli/ClaudeCliManager.ts`                                                   | current facade / session API を確認する                                           |
| ProcessManager                       | `apps/desktop/src/main/claude-cli/ProcessManager.ts`                                                     | process lifecycle と PTY 代替方針を確認する                                       |
| SessionManager                       | `apps/desktop/src/main/claude-cli/SessionManager.ts`                                                     | session lifecycle / transcript 保持を確認する                                     |
| Claude CLI IPC                       | `apps/desktop/src/main/claude-cli/ipc-handler.ts`                                                        | invoke/on channel と current automation 経路を確認する                            |
| claude-cli shared types              | `packages/shared/src/claude-cli/types.ts`                                                                | session / output / status 契約を確認する                                          |
| preload index                        | `apps/desktop/src/preload/index.ts`                                                                      | `window.claudeCliAPI` の公開契約を確認する                                        |
| preload channels                     | `apps/desktop/src/preload/channels.ts`                                                                   | whitelist channel と event 契約を確認する                                         |
| ExecutionEnvironment                 | `apps/desktop/src/renderer/components/organisms/ExecutionEnvironment/index.tsx`                          | terminal placeholder の現状を確認する                                             |
| AgentSDKPage                         | `apps/desktop/src/renderer/pages/AgentSDKPage/index.tsx`                                                 | terminal surface の既存統合位置を確認する                                         |
| completed task: cli integration      | `docs/30-workflows/completed-tasks/claude-code-cli-integration/index.md`                                 | CLI integration の既存正本を確認する                                              |
| completed task: renderer api         | `docs/30-workflows/completed-tasks/claude-cli-renderer-api/index.md`                                     | preload / IPC / security の既存正本を確認する                                     |
| unassigned: terminal environment     | `docs/30-workflows/unassigned-task/task-environment-type-terminal-implementation.md`                     | terminal preview の未解決要件を確認する                                           |
| unassigned: progress feedback        | `docs/30-workflows/unassigned-task/task-imp-claude-cli-progress-feedback.md`                             | progress UX の未解決要件を確認する                                                |
| unassigned: abort ui                 | `docs/30-workflows/unassigned-task/task-imp-claude-cli-abort-ui.md`                                      | abort UI の未解決要件を確認する                                                   |
| unassigned: retry ux                 | `docs/30-workflows/unassigned-task/task-imp-claude-cli-retry-ux.md`                                      | retry UX の未解決要件を確認する                                                   |
| unassigned: large output             | `docs/30-workflows/unassigned-task/task-perf-claude-cli-large-output.md`                                 | large output 性能課題を確認する                                                   |
| unassigned: concurrent load          | `docs/30-workflows/unassigned-task/task-perf-claude-cli-concurrent-load.md`                              | session 同時実行の性能課題を確認する                                              |

## 仕様抽出マトリクス（aiworkflow-requirements）

| 関心ごと                     | 抽出元                                                                                                                                                                                                              | 仕様書への反映対象                                                           |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| foundation 契約              | `workflow-ai-runtime-authmode-unification.md`                                                                                                                                                                       | capability 境界、`no auto-send` 禁止事項、settings review 継承               |
| settings / auth / IPC 親契約 | `ui-ux-settings.md`, `interfaces-auth.md`, `api-ipc-system.md`                                                                                                                                                      | 語彙統一（ready/blocked/unavailable）、capability 型、runtime 解決経路       |
| terminal 実装契約            | `interfaces-agent-sdk-ui.md`, `interfaces-agent-sdk-integration.md`, `interfaces-agent-sdk-history.md`, `ui-ux-agent-execution.md`, `ui-ux-feature-components.md`, `arch-claude-cli.md`, `architecture-overview.md` | launch / session / transcript / history / retry / large output / action rail |
| security / preload 境界      | `security-api-electron.md`, `security-electron-ipc.md`                                                                                                                                                              | channel whitelist、error envelope、credential 非中継                         |
| 台帳 / 教訓 / 旧名互換       | `task-workflow.md`, `lessons-learned.md`, `legacy-ordinal-family-register.md`                                                                                                                                       | 完了記録、苦戦箇所、旧 filename 互換                                         |
| 抽出導線                     | `indexes/resource-map.md`, `indexes/quick-reference.md`                                                                                                                                                             | 仕様探索順序と検索キーワードの固定                                           |

## SubAgentチーム編成（関心ごと分離）

| SubAgent | 関心ごと                  | 責務                                                               |
| -------- | ------------------------- | ------------------------------------------------------------------ |
| A        | foundation / parent docs  | Step-01 契約継承、settings/auth/API 境界整合                       |
| B        | terminal architecture     | main / preload / renderer / IPC / history 契約整合                 |
| C        | UX / manual boundary      | launch UX、manual share、unavailable guidance、`no auto-send` 整合 |
| D        | ledger / lessons / legacy | task-workflow / lessons / legacy register / follow-up 未タスク整合 |
| Lead     | 統合判定                  | 矛盾・漏れ・依存関係の最終判定、review gate 取りまとめ             |

## タスク分解サマリー

| ID   | フェーズ   | サブタスク名     | 責務                                                                   | 依存 |
| ---- | ---------- | ---------------- | ---------------------------------------------------------------------- | ---- |
| T-01 | Phase 1    | 要件整理         | terminal surface、manual boundary、UX gap を整理する                   | -    |
| T-02 | Phase 2    | 設計確定         | session / output / launcher / abort / retry / history の責務を設計する | T-01 |
| T-03 | Phase 3    | レビューゲート   | automation 混入と security 破綻がないかを判定する                      | T-02 |
| T-04 | Phase 4-7  | テスト仕様化     | terminal interaction、large output、abort/retry のテスト仕様を定義する | T-03 |
| T-05 | Phase 8-13 | 文書化と handoff | system spec sync と rollout 説明を整理する                             | T-04 |

## 実行フロー

1. Phase 1-3 で manual terminal boundary、session UX、レビューゲートを固める。
2. Phase 4-7 で output、abort、retry、performance のテスト仕様を固める。
3. Phase 8-13 で実装順序、spec sync、handoff を固める。

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

- launch、output stream、status、abort、retry、history、large output performance、manual boundary の接続点を各 Phase で必ず扱う。
- 本タスクでは `user-operated terminal`、`copy only / no auto send`、`session transcript`、`long-running output` を統合テスト観点の中心に置く。

## Phase完了時の必須アクション

- 本Phase内の全タスクを100%実行完了と記録する。
- 成果物パスと完了条件を確認する。
- artifacts.json を更新対象として扱う。
