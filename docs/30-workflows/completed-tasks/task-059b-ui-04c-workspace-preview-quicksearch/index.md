# task-059b-ui-04c-workspace-preview-quicksearch - タスク実行仕様書

## メタ情報

| 項目       | 内容                                                                                                                                          |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| タスクID   | TASK-UI-04C-WORKSPACE-PREVIEW                                                                                                                 |
| 機能名     | task-059b-ui-04c-workspace-preview-quicksearch                                                                                                |
| 元タスク   | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-059b-ui-04c-workspace-preview-quicksearch.md` |
| 作成日     | 2026-03-11                                                                                                                                    |
| ステータス | completed（Phase 1-13 完了 / PR #1164 作成済み）                                                                                              |
| 総Phase数  | 13                                                                                                                                            |
| 依存タスク | TASK-UI-00, TASK-UI-01, TASK-UI-04A                                                                                                           |
| 並列関係   | TASK-UI-04B と並列実行可能                                                                                                                    |

## 概要

本 workflow は WorkspaceView 04C（PreviewPanel・QuickFileSearch）を実装し、Phase 1-13 の成果物・検証・system spec 同期・PR 作成まで完了した current workflow である。04A のレイアウト基盤を再利用し、04B の chat 本体と責務分離した形で preview/search 機能を追加し、PR #1164 と GitHub コメント証跡まで確定した。

## Atent Team 想定の SubAgent 分担

| SubAgent   | 担当関心                                          | 主担当Phase   |
| ---------- | ------------------------------------------------- | ------------- |
| SubAgent-A | PreviewPanel UI、toolbar、ゼロステート、手動検証  | 1, 2, 5, 11   |
| SubAgent-B | state 境界、IPC/read/watch 連携、セキュリティ境界 | 1, 2, 5, 8    |
| SubAgent-C | テスト戦略、テスト拡充、coverage、品質ゲート      | 3, 4, 6, 7, 9 |
| SubAgent-D | レビューゲート、Phase 12 文書同期、未タスク管理   | 3, 10, 12, 13 |

## Phase一覧

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
| 13    | PR作成               | [phase-13-pr-creation.md](./phase-13-pr-creation.md)           | completed  |

## 実行フロー

```text
Phase 1 → Phase 2 → Phase 3 (Gate) → Phase 4 → Phase 5 → Phase 6 → Phase 7
                         ↓                                      ↓
                    (MAJOR→戻り)                           (未達→戻り)
                         ↓                                      ↓
Phase 8 → Phase 9 → Phase 10 (Gate) → Phase 11 → Phase 12 → Phase 13 → 完了
```

## 主要成果物

| 区分                 | パス                                              | 用途                     |
| -------------------- | ------------------------------------------------- | ------------------------ |
| 成果物レジストリ     | `artifacts.json`                                  | Phase別成果物管理        |
| 要件トレーサビリティ | `requirements-traceability-matrix.md`             | 元タスク要求の追跡       |
| aiworkflow抽出台帳   | `aiworkflow-requirements-extraction-matrix.md`    | 正本仕様の反映根拠       |
| task-spec準拠台帳    | `task-specification-creator-compliance-matrix.md` | skill要件との整合        |
| 差分反映台帳         | `branch-diff-reflection-matrix.md`                | 本ブランチ変更の根拠     |
| 多角監査台帳         | `multi-thinking-consistency-audit.md`             | 20思考法での整合監査結果 |
| PR証跡               | `outputs/phase-13/pr-info.md`                     | PR URL / コメント / CI   |
| 完了レポート         | `outputs/phase-13/completion-report.md`           | Phase 13 実行結果        |

## システム仕様（aiworkflow-requirements）反映範囲

| 正本仕様                                                                                    | 反映内容                                    |
| ------------------------------------------------------------------------------------------- | ------------------------------------------- |
| `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`             | Workspace 04A 契約を継承した 04C の責務定義 |
| `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`                     | Task 5D の UI 語彙と表示方針                |
| `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                | store/local state 境界と persist key 方針   |
| `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`                       | `file:read` / watch 再利用方針              |
| `.claude/skills/aiworkflow-requirements/references/rag-desktop-state.md`                    | `file:read` の既存チャネル実在確認          |
| `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | allowlist、cleanup、sandbox 防御            |
| `.claude/skills/aiworkflow-requirements/references/security-input-validation.md`            | sanitize と危険URL除去の入力検証規約        |
| `.claude/skills/aiworkflow-requirements/references/ui-ux-search-panel.md`                   | Cmd+P / Escape ショートカット契約           |
| `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md`                  | モーダル寸法・角丸・影の視覚基準            |
| `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`                     | 既存ショートカット衝突回避の規約            |
| `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | P5/P31/P39/P40 の再発防止パターン           |
| `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md`           | happy-dom + fireEvent 規約                  |
| `.claude/skills/aiworkflow-requirements/references/testing-accessibility.md`                | dialog/focus/aria の検証規約                |
| `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                 | coverage gate と品質判定基準                |
| `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | timeout/read error の分類と表示方針         |
| `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                        | Phase 11 screenshot と Phase 12 同期規約    |
| `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                      | P5/P31/P39/P40 の再発防止知見               |

## task-specification-creator 反映範囲

| 参照資料                                                                               | 反映内容                                        |
| -------------------------------------------------------------------------------------- | ----------------------------------------------- |
| `.claude/skills/task-specification-creator/references/create-workflow.md`              | Phase 1-3 を先に確定してから後続Phaseを作成     |
| `.claude/skills/task-specification-creator/references/phase-templates.md`              | 全Phaseで必須セクション、完了条件、成果物を定義 |
| `.claude/skills/task-specification-creator/references/review-gate-criteria.md`         | Phase 3/10 の戻り先判定を定義                   |
| `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`            | 手動検証とドキュメント同期手順を定義            |
| `.claude/skills/task-specification-creator/references/phase12-checklist-definition.md` | Task 12-1 〜 12-5 の必須成果物を定義            |
| `.claude/skills/task-specification-creator/references/evidence-sync-rules.md`          | LOGS/SKILL 同期と未タスク運用を定義             |

## 検証コマンド

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/completed-tasks/task-059b-ui-04c-workspace-preview-quicksearch

node .claude/skills/task-specification-creator/scripts/validate-phase11-screenshot-coverage.js \
  --workflow docs/30-workflows/completed-tasks/task-059b-ui-04c-workspace-preview-quicksearch

node .claude/skills/task-specification-creator/scripts/validate-phase12-implementation-guide.js \
  --workflow docs/30-workflows/completed-tasks/task-059b-ui-04c-workspace-preview-quicksearch

node .claude/skills/task-specification-creator/scripts/verify-all-specs.js \
  --workflow docs/30-workflows/completed-tasks/task-059b-ui-04c-workspace-preview-quicksearch
```

## 実行結果

- PR: `https://github.com/daishiman/AIWorkflowOrchestrator/pull/1164`
- 補足コメント: `#issuecomment-4042810007`
- implementation-guide 全文: `#issuecomment-4042810072`, `#issuecomment-4042810145`
- スクリーンショット gallery: `#issuecomment-4042810244`
- CI: `gh pr checks 1164` 全 PASS
