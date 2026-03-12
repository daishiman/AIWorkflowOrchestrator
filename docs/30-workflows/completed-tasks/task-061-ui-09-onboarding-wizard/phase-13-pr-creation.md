# Phase 13: PR作成 - タスク仕様書

## メタ情報

| 項目 | 内容 |
| --- | --- |
| タスクID | TASK-UI-09-ONBOARDING-WIZARD |
| Phase | 13 |
| Phase名 | PR作成 |
| ステータス | completed |
| 前提Phase | Phase 1, Phase 2, Phase 5, Phase 6, Phase 7, Phase 8, Phase 9, Phase 10, Phase 11, Phase 12 |
| 後続Phase | なし |

## 目的

task-061 関連差分のみを対象に `origin/main` との同期確認、PR 専用ブランチ集約、commit / push / PR 作成、`implementation-guide.md` の PR 本文反映と全文コメント投稿まで完了させる。

## 実行タスク

- タスク1: `origin/main` と local `main` の同期状態を確認し、task-061 用 PR ブランチを確保する
- タスク2: task-061 関連差分だけを PR ブランチへ移送し、stale path / Phase 13 状態を更新する
- タスク3: commit / push / PR を作成し、UI screenshot と `implementation-guide.md` 要点を PR 本文へ反映する
- タスク4: `implementation-guide.md` 全文を PR comment として投稿し、投稿済みであることを確認する

## 参照資料

| 参照資料 | パス | 説明 |
| --- | --- | --- |
| Phase 1 成果物 | `docs/30-workflows/completed-tasks/task-061-ui-09-onboarding-wizard/outputs/phase-1/` | 要件と AC |
| Phase 2 成果物 | `docs/30-workflows/completed-tasks/task-061-ui-09-onboarding-wizard/outputs/phase-2/` | 設計 |
| Phase 5 成果物 | `docs/30-workflows/completed-tasks/task-061-ui-09-onboarding-wizard/outputs/phase-5/` | 実装差分 |
| Phase 6 成果物 | `docs/30-workflows/completed-tasks/task-061-ui-09-onboarding-wizard/outputs/phase-6/` | 回帰結果 |
| Phase 7 成果物 | `docs/30-workflows/completed-tasks/task-061-ui-09-onboarding-wizard/outputs/phase-7/` | coverage |
| Phase 8 成果物 | `docs/30-workflows/completed-tasks/task-061-ui-09-onboarding-wizard/outputs/phase-8/` | refactor |
| Phase 9 成果物 | `docs/30-workflows/completed-tasks/task-061-ui-09-onboarding-wizard/outputs/phase-9/` | quality |
| Phase 10 成果物 | `docs/30-workflows/completed-tasks/task-061-ui-09-onboarding-wizard/outputs/phase-10/` | final review |
| Phase 11 成果物 | `docs/30-workflows/completed-tasks/task-061-ui-09-onboarding-wizard/outputs/phase-11/` | manual test |
| Phase 12 成果物 | `docs/30-workflows/completed-tasks/task-061-ui-09-onboarding-wizard/outputs/phase-12/` | documentation |
| user policy | `docs/30-workflows/completed-tasks/task-061-ui-09-onboarding-wizard/index.md` | ユーザー承認後に Phase 13 を実行する方針 |

### システム仕様（aiworkflow-requirements）

| 参照資料 | パス | 内容 |
| --- | --- | --- |
| task workflow | `.claude/skills/aiworkflow-requirements/references/task-workflow.md` | 最終同期の前提 |

## 成果物

| 成果物 | パス |
| --- | --- |
| pr-plan | `docs/30-workflows/completed-tasks/task-061-ui-09-onboarding-wizard/outputs/phase-13/pr-plan.md` |

## 完了条件

- [x] `origin/main` と local `main` の同期状態を確認している
- [x] task-061 関連差分のみで commit / push / PR を実行している
- [x] UI screenshot と `implementation-guide.md` を PR 出力へ反映している

## 次Phase

なし
