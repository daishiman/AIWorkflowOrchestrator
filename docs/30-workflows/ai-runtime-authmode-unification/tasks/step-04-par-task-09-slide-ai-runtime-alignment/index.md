# slide-ai-runtime-alignment - タスク実行仕様書

## ユーザーからの元の指示

```text
AI 機能を `Integrated API Runtime` と `ユーザー操作の Claude Code terminal surface` に分離し、すべての AI surface で切替・handoff・UI/UX・実行順序が分かるタスク仕様書を task-specification-creator と aiworkflow-requirements に従って整備する。実装は行わない。
```

## メタ情報

| 項目         | 内容                                                |
| ------------ | --------------------------------------------------- |
| タスクID     | TASK-IMP-SLIDE-AI-RUNTIME-ALIGNMENT-001             |
| タスク名     | slide-ai-runtime-alignment                          |
| 分類         | 設計                                                |
| 対象機能     | Slide / Modifier / Legacy Agent 経路の runtime 整流 |
| 優先度       | 高                                                  |
| 見積もり規模 | 中規模                                              |
| ステータス   | spec_created                                        |
| 作成日       | 2026-03-13                                          |

## タスク概要

### 目的

`slide/skill-executor.ts`、`slide/agent-client.ts`、`modifier-skill.ts`、`sync-manager.ts`、`SlideWorkspace.tsx` を `Integrated API Runtime` と manual fallback 契約へ寄せ、reverse-sync、watcher、streaming feedback、guidance を維持したまま整流する。

### 背景

現状の slide 系 AI 経路は direct Anthropic SDK、electron-store 直読みによる API key fallback、simulated 実行、reverse-sync 専用 IPC が混在している。slide 系を integrated runtime へ寄せつつ、manual 作業が必要な場合だけ terminal guidance へ落とす設計が必要である。

### 最終ゴール

slide workspace、modifier、legacy agent が integrated runtime policy を使い、direct SDK read や silent fallback を残さず、reverse-sync 状態と manual fallback guidance を UI へ一貫して返す設計を確定する。

### 成果物一覧

| 種別               | 成果物                                                                                                                                                                                                                                 | 配置先                                                                                                                    |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| 仕様書             | index.md / phase-1〜13 / artifacts.json                                                                                                                                                                                                | `docs/30-workflows/ai-runtime-authmode-unification/tasks/step-04-par-task-09-slide-ai-runtime-alignment`                  |
| 設計成果物         | outputs/phase-_/_.md                                                                                                                                                                                                                   | `docs/30-workflows/ai-runtime-authmode-unification/tasks/step-04-par-task-09-slide-ai-runtime-alignment/outputs/phase-*/` |
| system spec 同期先 | api-ipc-system.md / interfaces-agent-sdk-skill.md / interfaces-agent-sdk-executor.md / interfaces-agent-sdk-integration.md / ui-ux-settings.md / security-api-electron.md / arch-claude-cli.md / task-workflow.md / lessons-learned.md | `/.claude/skills/aiworkflow-requirements/references/`                                                                     |

## 参照ファイル

| 参照資料                         | パス                                                                                                                                                                                  | 内容                                                                                            |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| pack parent index                | `docs/30-workflows/ai-runtime-authmode-unification/index.md`                                                                                                                          | 実行順序、依存グラフ、共通方針の正本を確認する                                                  |
| pack design audit                | `docs/30-workflows/ai-runtime-authmode-unification/design-audit-matrix.md`                                                                                                            | 多角的監査の結論、禁止事項、依存整合を確認する                                                  |
| pack UI/UX 図解                  | `docs/30-workflows/ai-runtime-authmode-unification/ui-ux-diagrams.md`                                                                                                                 | 5図セットの画面構成、状態遷移、CTA 導線を確認する                                               |
| pack UI/UX 正本                  | `docs/30-workflows/ai-runtime-authmode-unification/ui-ux-realization.md`                                                                                                              | 全 surface 共通の状態、CTA、microcopy 契約を確認する                                            |
| Task01 foundation outputs        | `docs/30-workflows/ai-runtime-authmode-unification/tasks/step-01-seq-task-01-ai-runtime-authmode-foundation/outputs/phase-2/design-summary.md`                                        | access matrix / resolver / fail-fast / terminal boundary の共通契約を継承する                   |
| Task01 settings review           | `docs/30-workflows/ai-runtime-authmode-unification/tasks/step-01-seq-task-01-ai-runtime-authmode-foundation/outputs/phase-11/screenshots/TC-11-00-settings-authmode-review-board.png` | 設定画面（認証方式カード・Claude Agent SDK APIキー・APIキー設定一覧）の改善要求を設計へ反映する |
| slide skill-executor             | `apps/desktop/src/main/slide/skill-executor.ts`                                                                                                                                       | slide skill execute の current path を確認する                                                  |
| slide agent-client               | `apps/desktop/src/main/slide/agent-client.ts`                                                                                                                                         | legacy agent client の current path を確認する                                                  |
| modifier-skill                   | `apps/desktop/src/main/slide/modifier-skill.ts`                                                                                                                                       | reverse-sync modifier の current path を確認する                                                |
| slide IPC handlers               | `apps/desktop/src/main/slide/ipc-handlers.ts`                                                                                                                                         | reverse-sync / watch IPC の current path を確認する                                             |
| sync-manager                     | `apps/desktop/src/main/slide/sync-manager.ts`                                                                                                                                         | watcher と sync status の authority を確認する                                                  |
| SlideWorkspace                   | `apps/desktop/src/renderer/slide/SlideWorkspace.tsx`                                                                                                                                  | slide renderer surface と reverse-sync 導線を確認する                                           |
| api-ipc-system                   | `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`                                                                                                                 | slide reverse-sync / watch IPC の正本                                                           |
| interfaces-agent-sdk-skill       | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`                                                                                                     | slide sync / modifier 契約正本                                                                  |
| interfaces-agent-sdk-executor    | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-executor.md`                                                                                                  | execute 契約と error code 正本                                                                  |
| interfaces-agent-sdk-integration | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-integration.md`                                                                                               | Claude CLI / Agent SDK 統合の正本                                                               |
| ui-ux-settings                   | `.claude/skills/aiworkflow-requirements/references/ui-ux-settings.md`                                                                                                                 | slide settings / directory / auth surface の正本                                                |
| security-api-electron            | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`                                                                                                          | slide IPC / preload security の正本                                                             |
| arch-claude-cli                  | `.claude/skills/aiworkflow-requirements/references/arch-claude-cli.md`                                                                                                                | Claude CLI / terminal architecture の正本                                                       |

## タスク分解サマリー

| ID   | フェーズ   | サブタスク名    | 責務                                                               | 依存 |
| ---- | ---------- | --------------- | ------------------------------------------------------------------ | ---- |
| T-01 | Phase 1    | 要件整理        | slide workspace、modifier、legacy agent の current path を整理する | -    |
| T-02 | Phase 2    | 設計確定        | shared runtime policy と reverse-sync role を設計する              | T-01 |
| T-03 | Phase 3    | レビューゲート  | trust と UI 責務の破綻がないかを判定する                           | T-02 |
| T-04 | Phase 4-7  | テスト仕様化    | reverse-sync / watcher / guidance のテスト仕様を定義する           | T-03 |
| T-05 | Phase 8-13 | 文書化とhandoff | spec sync と rollout 説明を整理する                                | T-04 |

## 実行フロー

1. Phase 1-3 で前提、設計、レビューゲートを固める。
2. Phase 4-7 でテスト仕様と coverage 目標を固める。
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

- integrated runtime、manual fallback、IPC、state handoff の接続点を各 Phase で必ず扱う。
- 本タスクでは reverse-sync、watch-start/stop、sync status/progress/error、legacy agent client、terminal guidance を統合テスト観点の中心に置く。

## Phase完了時の必須アクション

- 本Phase内の全タスクを100%実行完了と記録する。
- 成果物パスと完了条件を確認する。
- artifacts.json を更新対象として扱う。
