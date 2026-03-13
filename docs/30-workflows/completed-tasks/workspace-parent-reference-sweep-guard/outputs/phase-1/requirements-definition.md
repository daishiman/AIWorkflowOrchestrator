# Workspace Parent Reference Sweep Guard 要件定義

## 目的

`TASK-UI-04-WORKSPACE-VIEW` の parent pointer と child workflow の参照関係を repo 全体で一意にし、path drift・status drift・mirror drift を同一ターンで閉じる。

## 現状監査

| 分類                        | 現在の実体                                                                                                                                                                                                                                            | 現状                                                                                                        | 要件                                                                     |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| parent pointer doc          | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-060-ui-04-workspace-view.md`                                                                                                                          | `./task-058b...md` / `./task-059a...md` / `./task-059b...md` を参照しているが、同ディレクトリに実体がない   | child workflow の正本 `completed-tasks/*/index.md` へ導線を張る          |
| child workflow              | `docs/30-workflows/completed-tasks/task-058b-ui-04a-workspace-layout-filebrowser/` / `docs/30-workflows/completed-tasks/task-059a-ui-04b-workspace-chat-panel/` / `docs/30-workflows/completed-tasks/task-059b-ui-04c-workspace-preview-quicksearch/` | 3 workflow が正本として存在する                                                                             | parent pointer と system spec がこの正本を指す                           |
| completed-task pointer docs | `docs/30-workflows/skill-import-agent-system/tasks/completed-task/task-058b-ui-04a-workspace-layout-filebrowser.md` / `task-059a-ui-04b-workspace-chat-panel.md` / `task-059b-ui-04c-workspace-preview-quicksearch.md`                                | メタ情報ステータスが `未着手` のまま                                                                        | 実体 workflow への導線と移管済み状態を明示する                           |
| master index                | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-000-master-index.md`                                                                                                                                  | `task-058b...md` / `task-059a...md` / `task-059b...md` を同一ディレクトリの実在ファイルのように列挙している | completed-task pointer docs か parent pointer のどちらを指すかを固定する |
| legacy index                | `docs/30-workflows/skill-import-agent-system/tasks/completed-task/task-090-tasks-index-legacy.md`                                                                                                                                                     | TASK-UI-04A/B/C の status が `pending`                                                                      | 少なくとも `pending` ではない状態へ更新し、status drift を止める         |
| system spec                 | `.claude/skills/aiworkflow-requirements/references/task-workflow.md` / `ui-ux-feature-components.md` / `interfaces-llm.md` / `interfaces-chat-history.md`                                                                                             | 04B だけ `docs/30-workflows/task-059a-ui-04b-workspace-chat-panel/...` を参照している                       | `completed-tasks/task-059a...` へ統一する                                |
| capture script              | `apps/desktop/scripts/capture-task-058b-workspace-layout-phase11.mjs`                                                                                                                                                                                 | workflow root が `docs/30-workflows/task-058b...` になっている                                              | `completed-tasks/task-058b...` へ更新する                                |
| mirror root                 | `.claude/skills/...` / `.agents/skills/...`                                                                                                                                                                                                           | `.claude` 修正だけでは `.agents` が stale になる                                                            | `.claude` を canonical root、`.agents` を mirror として同期する          |

## 機能要件

1. parent pointer doc は child workflow 3件の正本 `index.md` へ到達できること。
2. completed-task pointer docs は「履歴仕様」と「実体 workflow」の境界を明示すること。
3. master index は 04A/04B/04C の参照先を実在パスへ更新すること。
4. legacy index は 04A/04B/04C の status drift を解消すること。
5. system spec と capture script の stale path を一括検出・是正できること。
6. `.claude` と `.agents` の差分を `diff -qr` で検証できること。

## 非機能要件

| 観点         | 要件                                                                                                              |
| ------------ | ----------------------------------------------------------------------------------------------------------------- |
| 決定論       | sweep 対象は manifest で固定し、対象ファイル追加の判断を口頭運用にしない                                          |
| 再利用性     | guard はコマンド 1 本で path/status/mirror を再監査できる                                                         |
| 可観測性     | 失敗時は file class・対象ファイル・期待値・実際値を出力する                                                       |
| スコープ規律 | UI 実装や screenshot policy 本体の変更を含めない                                                                  |
| 仕様整合     | `task-workflow.md` / `ui-ux-feature-components.md` / `lessons-learned.md` / `interfaces-*` を同一ターンで同期する |

## In Scope

- docs-only parent workflow の reference sweep
- parent pointer / completed-task pointer docs / master index / legacy index の補正
- system spec と capture script の stale path 補正
- guard script と回帰テストの追加
- `.claude` canonical root と `.agents` mirror sync

## Out Of Scope

- Workspace 04A/04B/04C の UI 実装変更
- screenshot 取得ポリシー自体の改訂
- dual root repository の物理統合
- commit / push / PR 作成

## 完了の定義

- 実在しない workspace 参照パスが sweep 対象から除去されている
- `pending` のまま残る 04A/04B/04C status drift が解消されている
- guard script が stale path / status drift / mirror drift を別々に報告できる
- Phase 12 で system spec 同期と mirror sync の証跡を出せる
