# Phase 3: 設計レビューゲート

## メタ情報

| 項目       | 値                         |
| ---------- | -------------------------- |
| タスクID   | TASK-UI-04B-WORKSPACE-CHAT |
| Phase      | 3                          |
| Phase名    | 設計レビューゲート         |
| カテゴリ   | ゲート                     |
| 優先度     | high                       |
| ステータス | completed                  |
| 前提Phase  | Phase 1, Phase 2           |
| 後続Phase  | Phase 4                    |

## 目的

Phase 1 と Phase 2 の内容をレビューし、04B が 04A / 04C と衝突せず、既存 store / IPC / preload 契約を破壊せず、Phase 4 以降を並列実行できることを確認する。

## 実行タスク

- 要件整合レビュー: 元タスク要求と Phase 1 の AC を確認する
- 設計レビュー: component / state / IPC / a11y 設計を確認する
- 並列実行レビュー: SubAgent 分担と依存関係を確認する
- ゲート判定: PASS / MINOR / MAJOR を記録する

## 参照資料

| 参照資料                | パス                                          | 説明           |
| ----------------------- | --------------------------------------------- | -------------- |
| 要件定義書              | `outputs/phase-1/requirements-definition.md`  | Phase 1 成果物 |
| 受け入れ基準            | `outputs/phase-1/acceptance-criteria.md`      | Phase 1 成果物 |
| スコープ定義            | `outputs/phase-1/scope-definition.md`         | Phase 1 成果物 |
| SubAgent責務表          | `outputs/phase-1/subagent-ownership.md`       | 並列実行の根拠 |
| アーキテクチャ設計      | `outputs/phase-2/architecture-design.md`      | Phase 2 成果物 |
| コンポーネント設計      | `outputs/phase-2/component-design.md`         | Phase 2 成果物 |
| 状態 / データフロー設計 | `outputs/phase-2/state-dataflow-design.md`    | Phase 2 成果物 |
| UI 状態マトリクス       | `outputs/phase-2/interaction-state-matrix.md` | Phase 2 成果物 |

### システム仕様（aiworkflow-requirements）

| 参照資料           | パス                                                                            | 内容                                     |
| ------------------ | ------------------------------------------------------------------------------- | ---------------------------------------- |
| feature components | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md` | UI 責務境界の正本                        |
| state management   | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`    | state ownership の正本                   |
| security           | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`    | preload / IPC 境界の正本                 |
| lessons            | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`          | worktree / screenshot / drift の再発防止 |

## 実行手順

### ステップ1: レビュー観点チェック

| 観点         | チェック項目                                                                   |
| ------------ | ------------------------------------------------------------------------------ |
| 画面責務     | 04A は layout、04B は chat、04C は preview / quick search に分離されている     |
| 状態管理     | 新規グローバル slice を作らず local state 優先になっている                     |
| IPC          | `file:read` / `llm:*` / `conversation:*` だけで完結している                    |
| セキュリティ | preload API 以外に direct access が無い                                        |
| a11y         | log / status / listbox / option / button の role と keyboard が定義されている  |
| manual test  | screenshot plan に zero / mention / streaming / error / compact が含まれている |

### ステップ2: 判定と戻り先を確定する

| 判定  | 条件                                         | 戻り先                 |
| ----- | -------------------------------------------- | ---------------------- |
| PASS  | blocking issue 0 件                          | Phase 4                |
| MINOR | wording 修正、追加テスト明記だけで解消できる | Phase 4                |
| MAJOR | state 境界、責務境界、IPC 契約に問題がある   | Phase 1 または Phase 2 |

### ステップ3: 並列条件を確定する

| 区間                                         | 実行方式 | 条件                                  |
| -------------------------------------------- | -------- | ------------------------------------- |
| Phase 4 component test 設計 / hook test 設計 | 並列     | Phase 3 PASS                          |
| Phase 5 UI 実装 / connection 実装            | 並列     | 共通 controller 契約を Phase 4 で固定 |
| Phase 6 回帰 / a11y / integration            | 並列     | 実装完了後                            |
| 04B と 04C                                   | 並列     | 04A 正本を変えないこと                |

## 統合テスト連携

| 観点          | 内容                                                           |
| ------------- | -------------------------------------------------------------- |
| review gate   | Phase 4 が integration test 設計へ進める条件を明記する         |
| parallel 条件 | 04C との並列実行で shared contract が壊れないことを確認する    |
| system spec   | aiworkflow 正本と Phase 4 のテスト観点が一致することを確認する |

## 多角的チェック観点

| 観点           | このPhaseでの確認内容                                     | 仕様参照先                                                                     |
| -------------- | --------------------------------------------------------- | ------------------------------------------------------------------------------ |
| UI/UX          | 04B の体験が 04A layout shell を侵食していないか確認する  | `.claude/skills/aiworkflow-requirements/references/ui-ux-panels.md`            |
| アーキテクチャ | state と IPC の責務境界が循環していないか確認する         | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`   |
| セキュリティ   | preload 公開 API 以外の接続が設計に入っていないか確認する | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`   |
| 品質           | Phase 4 以降へ渡す blocking issue の有無を確認する        | `.claude/skills/task-specification-creator/references/review-gate-criteria.md` |

## 成果物

| 成果物       | パス                                      | 説明               |
| ------------ | ----------------------------------------- | ------------------ |
| レビュー結果 | `outputs/phase-3/design-review-result.md` | 判定と根拠         |
| 指摘一覧     | `outputs/phase-3/open-items.md`           | MINOR / MAJOR 一覧 |
| ゲート記録   | `outputs/phase-3/review-gate.md`          | 戻り先と進行条件   |

## 完了条件

- [x] 要件 / 設計 / 並列条件のレビューを完了している
- [x] PASS / MINOR / MAJOR の判定基準を記録している
- [x] 戻り先を記録している
- [x] Phase 4 に渡す open items を整理している
- [x] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

1. 要件整合レビュー
2. 設計レビュー
3. 並列実行条件レビュー
4. ゲート判定と open items 整理
5. 完了条件確認

## タスク100%実行確認

- [x] 本Phase内の全タスクを100%実行完了
- [x] `outputs/phase-3/` に作成すべき成果物を定義済み
- [x] `artifacts.json` へ登録すべき成果物を確認済み
- [x] `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/task-059a-ui-04b-workspace-chat-panel` を再実行できる状態

## 次のPhase

[Phase 4: テスト作成](./phase-4-test-creation.md)
