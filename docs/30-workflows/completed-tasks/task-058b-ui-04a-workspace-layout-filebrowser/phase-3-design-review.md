# Phase 3: 設計レビューゲート

## メタ情報

| 項目   | 値                                            |
| ------ | --------------------------------------------- |
| Phase  | 3                                             |
| 機能名 | task-058b-ui-04a-workspace-layout-filebrowser |
| 作成日 | 2026-03-10                                    |

## 目的

Phase 1 と Phase 2 の内容をレビューし、04A の設計が 04B / 04C をブロックしないこと、既存 store / IPC 契約を破壊しないこと、P31 / P39 / P40 / P5 を回避できることを確認する。

## 実行タスク

- 要件整合レビュー: 04A と 04B / 04C の責務境界を確認する
- UIレビュー: Tap & Discover、breakpoint、StatusBar、zero state を確認する
- 状態管理レビュー: 既存 slice 再利用と local state 分離を確認する
- テストレビュー: component / hook / manual test の対象範囲を確認する
- ゲート判定: PASS / MINOR / MAJOR を記録する

## 参照資料

| 参照資料           | パス                                         | 説明           |
| ------------------ | -------------------------------------------- | -------------- |
| 要件定義書         | `outputs/phase-1/requirements-definition.md` | Phase 1 成果物 |
| 受け入れ基準       | `outputs/phase-1/acceptance-criteria.md`     | Phase 1 成果物 |
| スコープ定義       | `outputs/phase-1/scope-definition.md`        | Phase 1 成果物 |
| SubAgent責務表     | `outputs/phase-1/subagent-ownership.md`      | Phase 1 成果物 |
| アーキテクチャ設計 | `outputs/phase-2/architecture-design.md`     | Phase 2 成果物 |
| コンポーネント設計 | `outputs/phase-2/component-design.md`        | Phase 2 成果物 |
| 状態設計           | `outputs/phase-2/state-design.md`            | Phase 2 成果物 |
| IPC watcher設計    | `outputs/phase-2/ipc-watcher-design.md`      | Phase 2 成果物 |

## 実行手順

### ステップ1: レビュー観点チェック

| 観点             | チェック項目                                                                 |
| ---------------- | ---------------------------------------------------------------------------- |
| 画面責務         | 04A が chat panel 本体と preview 本体を内包していない                        |
| UI/UX            | 4 モード、breakpoint、toggle bar、zero state が明記されている                |
| アクセシビリティ | tree role、switch role、focus ring、keyboard nav が定義されている            |
| 状態管理         | 新規 slice 追加禁止、個別セレクタのみ使用、persist key 固定                  |
| IPC              | 新規チャネル追加なし、既存 `workspace:*` / `file:*` 利用方針が明記されている |
| テスト           | component / hook / manual test の対象ファイルが明記されている                |
| 運用             | Phase 11 preview preflight と Phase 12 system spec sync が定義されている     |

### ステップ2: 指摘の重大度分類

| 判定  | 条件                             | 戻り先           |
| ----- | -------------------------------- | ---------------- |
| PASS  | blocking issue が 0 件           | Phase 4          |
| MINOR | wording 修正か test 観点不足のみ | Phase 4          |
| MAJOR | 責務境界か state 境界が崩れる    | Phase 1 または 2 |

## 統合テスト連携

| 観点       | 具体項目                                                                     |
| ---------- | ---------------------------------------------------------------------------- |
| Store 連携 | `workspaceSlice` と `fileSelectionSlice` の selector パターンで実装できる    |
| 画面連携   | 04A 完了後に 04B / 04C が同時着手できる                                      |
| IPC 連携   | `file:watch-start` / `file:watch-stop` のライフサイクルが Phase 5 で実装可能 |
| E2E 連携   | desktop / tablet / mobile の screenshot と manual test ケースが定義済み      |

## 多角的チェック観点

| 観点       | このPhaseでの確認内容                                                                     | 仕様参照先                                                                                                                                                      |
| ---------- | ----------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| UI/UX      | Tap & Discover、zero state、responsive 条件が設計段階で破綻していないか確認する           | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`, `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md` |
| 状態管理   | `workspaceSlice` / `fileSelectionSlice` 再利用方針と local state 分離が守られるか確認する | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                                                                                    |
| IPC / 運用 | preview preflight、watcher guard、Phase 12 同期条件が先に定義されているか確認する         | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`, `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                    |
| 品質ゲート | PASS / MINOR / MAJOR の戻り先が review-gate 基準と矛盾しないか確認する                    | `.claude/skills/task-specification-creator/references/review-gate-criteria.md`                                                                                  |

## 成果物

| 成果物       | パス                                      | 説明                   |
| ------------ | ----------------------------------------- | ---------------------- |
| レビュー結果 | `outputs/phase-3/design-review-result.md` | 判定結果               |
| 指摘一覧     | `outputs/phase-3/open-items.md`           | MINOR / MAJOR 記録     |
| ゲート記録   | `outputs/phase-3/review-gate.md`          | 戻り先を含む gate 記録 |

## 完了条件

- [ ] 責務境界レビューを完了している
- [ ] UI / accessibility / state / IPC / test / operation の各観点を確認している
- [ ] PASS / MINOR / MAJOR の判定基準を記録している
- [ ] 戻り先 Phase を記録できる形にしている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase 実行時は以下を SubTask として分離する。

1. 要件と設計の差分レビュー
2. UI / state / IPC / test 観点レビュー
3. ゲート判定と戻り先整理
4. open items / gate 記録の更新
5. 完了条件と validator の確認

## タスク100%実行確認

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] `outputs/phase-3/` に作成すべき成果物を定義済み
- [ ] `artifacts.json` へ登録すべき成果物を確認済み
- [ ] `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/task-058b-ui-04a-workspace-layout-filebrowser` を再実行できる状態

## 次のPhase

[Phase 4: テスト作成](./phase-4-test-creation.md)
