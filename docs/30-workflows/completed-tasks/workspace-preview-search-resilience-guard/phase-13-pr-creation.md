# Phase 13: PR作成 - タスク仕様書

## メタ情報

| 項目       | 内容                                                 |
| ---------- | ---------------------------------------------------- |
| タスクID   | UT-IMP-WORKSPACE-PREVIEW-SEARCH-RESILIENCE-GUARD-001 |
| Phase      | 13                                                   |
| Phase名    | PR作成                                               |
| ステータス | blocked                                              |
| 前提Phase  | Phase 12                                             |
| 後続Phase  | なし                                                 |

## 目的

将来の commit / PR 生成条件だけを定義し、本依頼では実行しない。

## 実行タスク

- タスク1: ユーザー承認があるまで commit / push / PR を禁止する
- タスク2: 承認後にのみ branch diff、PR summary、artifact link を整理する

## 参照資料

| 参照資料         | パス                                                                                                    | 説明                 |
| ---------------- | ------------------------------------------------------------------------------------------------------- | -------------------- |
| Phase 2 成果物   | `docs/30-workflows/completed-tasks/workspace-preview-search-resilience-guard/outputs/phase-2/`          | guard 設計           |
| Phase 5 成果物   | `docs/30-workflows/completed-tasks/workspace-preview-search-resilience-guard/outputs/phase-5/`          | 実装結果             |
| Phase 6 成果物   | `docs/30-workflows/completed-tasks/workspace-preview-search-resilience-guard/outputs/phase-6/`          | テスト拡張           |
| Phase 7 成果物   | `docs/30-workflows/completed-tasks/workspace-preview-search-resilience-guard/outputs/phase-7/`          | coverage             |
| Phase 8 成果物   | `docs/30-workflows/completed-tasks/workspace-preview-search-resilience-guard/outputs/phase-8/`          | refactor             |
| Phase 9 成果物   | `docs/30-workflows/completed-tasks/workspace-preview-search-resilience-guard/outputs/phase-9/`          | QA                   |
| Phase 10 成果物  | `docs/30-workflows/completed-tasks/workspace-preview-search-resilience-guard/outputs/phase-10/`         | final review         |
| Phase 11 成果物  | `docs/30-workflows/completed-tasks/workspace-preview-search-resilience-guard/outputs/phase-11/`         | manual review        |
| Phase 12         | `docs/30-workflows/completed-tasks/workspace-preview-search-resilience-guard/phase-12-documentation.md` | 完了前提             |
| root policy      | `docs/30-workflows/completed-tasks/workspace-preview-search-resilience-guard/index.md`                  | 実行禁止ルール       |
| execute workflow | `.claude/skills/task-specification-creator/references/execute-workflow.md`                              | future Phase 13 手順 |

## ユーザー承認ゲート

| 項目   | ルール           |
| ------ | ---------------- |
| commit | 明示承認まで禁止 |
| push   | 明示承認まで禁止 |
| PR     | 明示承認まで禁止 |

## 多角的チェック観点

- 共通観点は `docs/30-workflows/completed-tasks/workspace-preview-search-resilience-guard/phase-common-governance.md` を正本とし、PR 前に branch/worktree diff、Phase 12 整合、artifact link を最終確認する。

## サブタスク管理

- commit、push、PR summary、artifact links を別サブタスクとして扱い、承認前は全て blocked のまま保持する。

## タスク100%実行確認

- 明示承認がない限り Phase 13 は blocked を維持し、`pr-plan.md` 以上の実操作を行わない。

## 成果物

| 成果物  | パス                                                                                                      |
| ------- | --------------------------------------------------------------------------------------------------------- |
| pr-plan | `docs/30-workflows/completed-tasks/workspace-preview-search-resilience-guard/outputs/phase-13/pr-plan.md` |

## 完了条件

- [ ] blocked 理由が明文化されている
- [ ] commit / push / PR 禁止が残っている

## 次Phase

なし
