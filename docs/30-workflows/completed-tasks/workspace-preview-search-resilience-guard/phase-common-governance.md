# phase-common-governance

## メタ情報

| 項目     | 値                                                                                    |
| -------- | ------------------------------------------------------------------------------------- |
| タスクID | UT-IMP-WORKSPACE-PREVIEW-SEARCH-RESILIENCE-GUARD-001                                  |
| 作成日   | 2026-03-13                                                                            |
| 目的     | `phase-templates.md` の共通 boilerplate を 1 つの正本へ寄せ、13 phase の drift を防ぐ |

## なぜ共通化するか

- `phase-templates.md` の多角的チェック観点 / サブタスク管理 / タスク100%実行確認を 13 ファイルへ複製すると、spec-only workflow では冗長で drift しやすい。
- current workflow では各 phase に参照節だけを置き、共通運用ルールは本ファイルへ集約する。
- これにより「self-contained な導線」と「1か所修正で全 phase に効く」を両立する。

## P50 / 現状調査ガード

| 観点           | ルール                                                                                              |
| -------------- | --------------------------------------------------------------------------------------------------- |
| branch diff    | `git diff --stat origin/main...HEAD` と `git diff --stat HEAD` を分離記録する                       |
| current state  | 実装 anchor / completed parent workflow / related issue を確認してから Phase 1 に入る               |
| P50 判定       | 既実装なら検証・補完モードへ切り替える。current workflow ではそのまま実装・検証・同期まで完了させた |
| canonical root | `.claude/skills/...` を正本、`.agents/...` は mirror として扱う                                     |

## 多角的チェック観点

| 観点                 | 最低確認項目                                               | 主要参照先                                                                                      |
| -------------------- | ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| セキュリティ         | sanitize / dangerous URL / IPC boundary / path safety      | `security-electron-ipc.md`, `security-input-validation.md`                                      |
| UI/UX                | UI語彙、dialog token、shortcut、focus、Apple review        | `ui-ux-components.md`, `ui-ux-search-panel.md`, `ui-ux-navigation.md`, `ui-ux-design-system.md` |
| アーキテクチャ       | state ownership、renderer local resilience、YAGNI 判断     | `arch-state-management.md`, `architecture-implementation-patterns.md`                           |
| API / IPC            | 新規 channel 必要性、既存 `file:read` 再利用               | `api-ipc-system.md`                                                                             |
| データ / exact count | related UT、status、path、placement、baseline/current 分離 | `task-workflow.md`, `lessons-learned.md`                                                        |
| エラーハンドリング   | transport / parse / crash / no-match を混ぜない            | `error-handling.md`                                                                             |
| 品質                 | test pattern、coverage、docs validation                    | `testing-component-patterns.md`, `testing-accessibility.md`, `quality-requirements.md`          |

### Electron 層別観点

| 層              | 最低確認項目                                               |
| --------------- | ---------------------------------------------------------- |
| Renderer        | local state、dialog UX、fallback surface                   |
| Main            | 新規責務追加の有無、不要な IPC 拡張回避                    |
| IPC             | `file:read` / `file:changed` 再利用、error envelope 一貫性 |
| Preload         | 許可境界拡大の有無                                         |
| docs / workflow | exact count、related row、LOGS / topic-map 同期            |

## サブタスク管理

| ルール             | 内容                                                                |
| ------------------ | ------------------------------------------------------------------- |
| concern separation | search / preview / taxonomy / docs sync を別サブタスクにする        |
| file budget        | 1 lane で 3 ファイル超の手動更新を抱え込まない                      |
| serial gate        | Phase 1 は直列、Phase 2 で Lane A/B 並列、Phase 3 で統合 gate       |
| canonical commands | `node .claude/skills/task-specification-creator/scripts/...` を使う |
| mirror drift       | `.claude` を更新したら必要に応じて `.agents` との差分を確認する     |

## タスク100%実行確認

- phase 本文、`outputs/phase-N/`, `artifacts.json`, `outputs/artifacts.json`, `index.md` の状態が一致している。
- Phase 1-12 completed / Phase 13 blocked の gate が崩れていない。
- root 監査台帳、verification report、branch diff reflection が current branch の状態を説明できる。
- Phase 12 では `LOGS.md` x2、`topic-map.md`、exact count、related row、placement、`generate-index.js` / `diff -qr` の必要性まで確認する。

## 実行コマンド正本

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/workspace-preview-search-resilience-guard
node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/completed-tasks/workspace-preview-search-resilience-guard --json
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD --target-file docs/30-workflows/completed-tasks/task-imp-workspace-preview-search-resilience-guard-001.md
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js
```
