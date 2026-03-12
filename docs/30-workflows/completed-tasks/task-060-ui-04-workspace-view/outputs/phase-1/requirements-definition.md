# Phase 1 要件定義書

## 概要

`TASK-UI-04-WORKSPACE-VIEW` を、04A / 04B / 04C を束ねる親参照仕様 workflow として実行可能な状態にする。親 workflow 自体は UI 実装を持たず、pointer / dependency / canonical path / system spec sync policy のみに責務を限定する。

## 背景

- `task-060-ui-04-workspace-view.md` はポインタードキュメントとして残るが、実行可能な正本は `docs/30-workflows/completed-tasks/task-060-ui-04-workspace-view/index.md` に集約する必要がある。
- 04A / 04B / 04C は child workflow として分離済みであり、親が実装責務を再定義すると scope drift が起きる。
- current path / completed path の揺れが残るため、canonical path を親 workflow と system spec の双方で固定する必要がある。

## 要件

### 要件1: 親責務の限定

親 workflow が保持するのは以下のみとする。

- pointer
- dependency
- canonical path
- system spec sync policy
- Phase 11 evidence inheritance policy

以下は child workflow に委譲し、親には含めない。

- Workspace の Renderer 実装
- Main / Preload / IPC 実装
- 04A / 04B / 04C 個別のテスト実装
- child workflow の完了状態そのものの再実装

### 要件2: child workflow の canonical path 固定

| child | canonical path                                                                      | 理由                           |
| ----- | ----------------------------------------------------------------------------------- | ------------------------------ |
| 04A   | `docs/30-workflows/completed-tasks/task-058b-ui-04a-workspace-layout-filebrowser/`  | Workspace レイアウト基盤の実体 |
| 04B   | `docs/30-workflows/completed-tasks/task-059a-ui-04b-workspace-chat-panel/`          | Chat panel 実体                |
| 04C   | `docs/30-workflows/completed-tasks/task-059b-ui-04c-workspace-preview-quicksearch/` | Preview / Quick Search 実体    |

### 要件3: 依存順序と並列契約

- 04A が 04B / 04C を block する。
- 04B と 04C は 04A 完了後に並列実行可能とする。
- 親 workflow はこの依存順序を説明するが、child の内部順序までは持たない。

### 要件4: user policy の固定

- Phase 1-3 の設計ゲートが完了するまで後続 Phase を開始しない。
- commit と PR はユーザー承認まで禁止する。
- 並列化は関心ごとが分離された単位に限定する。
- 実装は docs-only とし、アプリコード変更は scope 外とする。

### 要件5: system spec の抽出入口固定

起点は以下とする。

- `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`
- `.claude/skills/aiworkflow-requirements/indexes/quick-reference.md`

必須参照は以下とする。

- `ui-ux-feature-components.md`
- `ui-ux-navigation.md`
- `arch-state-management.md`
- `api-ipc-system.md`
- `security-electron-ipc.md`
- `task-workflow.md`
- `lessons-learned.md`

## 判定

- 親 workflow が child 実装責務を持たないことを requirement として確定した。
- canonical path と dependency policy を Phase 2 へ引き渡せる状態にした。
