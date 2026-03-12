# TASK-UI-04B-WORKSPACE-CHAT-PANEL: ワークスペース ChatPanel

## メタ情報

| 項目           | 値                                                                                                                                   |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| タスクID       | TASK-UI-04B-WORKSPACE-CHAT                                                                                                           |
| 元タスク       | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-059a-ui-04b-workspace-chat-panel.md` |
| 機能名         | `task-059a-ui-04b-workspace-chat-panel`                                                                                              |
| 作成日         | 2026-03-11                                                                                                                           |
| ステータス     | phase12_completed（Phase 13 未実施）                                                                                                 |
| 総Phase数      | 13                                                                                                                                   |
| 依存タスク     | TASK-UI-00, TASK-UI-01, TASK-UI-04A                                                                                                  |
| 並列可能タスク | TASK-UI-04C（Phase 3 PASS 後に並列着手可）                                                                                           |

## 概要

本 workflow は `WorkspaceView` 内の placeholder chat 領域を、ファイル背景情報付きの実運用 ChatPanel に置き換える。対象体験は `Tap & Discover` を中心に据え、ゼロステート、ファイルコンテキストチップ、`@mention`、ストリーミング応答、会話永続化を一貫した UI として設計する。

現状コードには以下の再利用資産が存在する。

- `apps/desktop/src/renderer/views/WorkspaceView/index.tsx` に 04B 用の仮置き UI がある
- `workspaceSlice` と `fileSelectionSlice` が 04A で整備済み
- `workspace-chat-edit` 機能群に file context 取得ロジックがある
- `window.electronAPI.llm.*` と `window.conversationAPI.*` が preload 公開済み
- `useStreamingChat`, `useConversation`, `useMessages` が既存 hook として利用可能

このため本タスクは「新規 UI 作成 + 既存資産再利用 + 責務再整理」の混在タスクとして扱う。

## SubAgent 分担

| SubAgent   | 担当関心                                                     | 主担当 Phase       |
| ---------- | ------------------------------------------------------------ | ------------------ |
| SubAgent-A | ChatPanel UX、ゼロステート、入力主役 UI、アニメーション      | 1, 2, 4, 5, 11     |
| SubAgent-B | 状態管理、ファイル背景情報、IPC / conversation / stream 接続 | 1, 2, 5, 6, 9      |
| SubAgent-C | テスト設計、a11y、回帰、カバレッジ                           | 3, 4, 6, 7, 10, 11 |
| SubAgent-D | system spec 同期、Phase 12、未タスク判定、PR 情報整理        | 3, 10, 12, 13      |

## Phase 一覧

| Phase | 名称                 | ファイル                                                       | ステータス |
| ----- | -------------------- | -------------------------------------------------------------- | ---------- |
| 1     | 要件定義             | [phase-1-requirements.md](./phase-1-requirements.md)           | completed  |
| 2     | 設計                 | [phase-2-design.md](./phase-2-design.md)                       | completed  |
| 3     | 設計レビューゲート   | [phase-3-design-review.md](./phase-3-design-review.md)         | completed  |
| 4     | テスト作成           | [phase-4-test-creation.md](./phase-4-test-creation.md)         | completed  |
| 5     | 実装                 | [phase-5-implementation.md](./phase-5-implementation.md)       | completed  |
| 6     | テスト拡充           | [phase-6-test-expansion.md](./phase-6-test-expansion.md)       | completed  |
| 7     | テストカバレッジ確認 | [phase-7-coverage-check.md](./phase-7-coverage-check.md)       | completed  |
| 8     | リファクタリング     | [phase-8-refactoring.md](./phase-8-refactoring.md)             | completed  |
| 9     | 品質保証             | [phase-9-quality-assurance.md](./phase-9-quality-assurance.md) | completed  |
| 10    | 最終レビューゲート   | [phase-10-final-review.md](./phase-10-final-review.md)         | completed  |
| 11    | 手動テスト検証       | [phase-11-manual-test.md](./phase-11-manual-test.md)           | completed  |
| 12    | ドキュメント更新     | [phase-12-documentation.md](./phase-12-documentation.md)       | completed  |
| 13    | PR作成               | [phase-13-pr-creation.md](./phase-13-pr-creation.md)           | pending    |

## 主要成果物

| 区分                 | パス                                              | 用途                                            |
| -------------------- | ------------------------------------------------- | ----------------------------------------------- |
| 要件トレーサビリティ | `requirements-traceability-matrix.md`             | 元タスク要求と Phase 出力の対応表               |
| system spec 抽出台帳 | `aiworkflow-requirements-extraction-matrix.md`    | 正本仕様の採用根拠                              |
| task-spec 準拠台帳   | `task-specification-creator-compliance-matrix.md` | create workflow / template / validator 反映確認 |
| task-spec 監査結果   | `task-specification-creator-audit.md`             | スキル監査と補強結果                            |
| aiworkflow 監査結果  | `aiworkflow-requirements-audit.md`                | 正本仕様抽出監査と補強結果                      |
| 成果物レジストリ     | `artifacts.json`                                  | Phase 成果物登録                                |
| 検証レポート         | `outputs/verification-report.md`                  | `verify-all-specs` 実行結果                     |

## システム仕様の反映範囲

| 正本仕様                                                                          | 反映内容                                                        |
| --------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| `.claude/skills/aiworkflow-requirements/indexes/quick-reference.md`               | 04B で参照すべき仕様入口と検索分割ルール                        |
| `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`                  | 04B を UI実装 / LLM連携 / テスト実装として逆引きする            |
| `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`   | Workspace Chat と 04A との責務境界、Atomic Design、テスト観点   |
| `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`           | 共通 UI コンポーネント再利用境界                                |
| `.claude/skills/aiworkflow-requirements/references/ui-ux-panels.md`               | Panel 統合パターン、`aria-live`、フォーカス移動                 |
| `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md`    | Apple HIG / WCAG / theme / spacing 基準                         |
| `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`      | `workspaceSlice` / `fileSelectionSlice` 再利用、新規 slice 抑制 |
| `.claude/skills/aiworkflow-requirements/references/interfaces-llm.md`             | LLM ストリーミングと Workspace Chat Edit の正本入口             |
| `.claude/skills/aiworkflow-requirements/references/llm-streaming.md`              | chunk / end / error / cancel のイベント契約                     |
| `.claude/skills/aiworkflow-requirements/references/llm-workspace-chat-edit.md`    | file context / `workspacePath` / size 上限 / main service 契約  |
| `.claude/skills/aiworkflow-requirements/references/interfaces-chat-history.md`    | `conversationAPI` と会話永続化契約                              |
| `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`      | preload 経由限定、allowlist、sender 検証、subscribe 境界        |
| `.claude/skills/aiworkflow-requirements/references/error-handling.md`             | stream / file / conversation failure の表示責務                 |
| `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md` | component / hook / integration test パターン                    |
| `.claude/skills/aiworkflow-requirements/references/testing-accessibility.md`      | keyboard nav、role、focus、screen reader 観点                   |
| `.claude/skills/aiworkflow-requirements/references/directory-structure.md`        | 04B 実装ファイルの配置境界                                      |
| `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`       | TDD、coverage gate、品質下限                                    |
| `.claude/skills/aiworkflow-requirements/references/task-workflow.md`              | Phase 11/12 での current workflow 正本同期                      |
| `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`            | screenshot / worktree / canonical root の再発防止               |

## task-spec skill 反映範囲

| task-spec 正本                                                                         | 反映内容                                                                         |
| -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `.claude/skills/task-specification-creator/references/create-workflow.md`              | Phase 1-3 先行、Phase 4-13 後続、最後に validator 実行                           |
| `.claude/skills/task-specification-creator/references/phase-templates.md`              | 全 Phase に `メタ情報 / 目的 / 実行タスク / 参照資料 / 成果物 / 完了条件` を実装 |
| `.claude/skills/task-specification-creator/references/quality-standards.md`            | 曖昧表現排除、自己完結性、Phase 実行記録を監査する                               |
| `.claude/skills/task-specification-creator/references/artifact-naming-conventions.md`  | outputs 配下成果物命名を固定                                                     |
| `.claude/skills/task-specification-creator/references/review-gate-criteria.md`         | Phase 3 / 10 の PASS / MINOR / MAJOR / CRITICAL 戻り先を固定                     |
| `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`            | screenshot plan、Part 1/2 実装ガイド、未タスク検出の必須化                       |
| `.claude/skills/task-specification-creator/references/phase12-checklist-definition.md` | Phase 12 必須成果物の実体確認条件を固定                                          |
| `.claude/skills/task-specification-creator/references/evidence-sync-rules.md`          | `task-workflow.md` / `lessons-learned.md` / `LOGS.md` / `SKILL.md` 同期を固定    |
| `.claude/skills/task-specification-creator/references/spec-update-workflow.md`         | `spec_created` 判定、Step 1-A/B/C、canonical root を固定                         |
| `.claude/skills/task-specification-creator/references/commands.md`                     | `validate-phase-output.js` / `verify-all-specs.js` を標準検証コマンドに採用      |

## 検証コマンド

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/completed-tasks/task-059a-ui-04b-workspace-chat-panel

node .claude/skills/task-specification-creator/scripts/verify-all-specs.js \
  --workflow docs/30-workflows/completed-tasks/task-059a-ui-04b-workspace-chat-panel
```
