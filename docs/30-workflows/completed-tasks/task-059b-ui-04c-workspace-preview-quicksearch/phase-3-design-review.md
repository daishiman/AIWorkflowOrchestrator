# Phase 3: 設計レビューゲート

## メタ情報

| 項目         | 値                                             |
| ------------ | ---------------------------------------------- |
| タスクID     | TASK-UI-04C-WORKSPACE-PREVIEW                  |
| 機能名       | task-059b-ui-04c-workspace-preview-quicksearch |
| Phase        | 3                                              |
| ステータス   | completed                                      |
| 作成日       | 2026-03-11                                     |
| 担当SubAgent | SubAgent-C（品質） / SubAgent-D（ゲート管理）  |

## 目的

Phase 1 と Phase 2 の設計内容を審査し、04A/04B との境界、IPC 契約、セキュリティ制約、テスト可能性をゲート判定で確定する。

## 実行タスク

- 要件整合レビュー: FR/NFR と設計の対応を確認する
- 境界レビュー: 04A / 04B / 04C の責務分離を確認する
- IPCレビュー: `file:read` / watch 契約を逸脱していないか確認する
- セキュリティレビュー: iframe/CSP/sanitize の防御境界を確認する
- テストレビュー: Phase 4 に必要な test target と判定軸を確認する
- ゲート判定: PASS / MINOR / MAJOR の判定と戻り先を確定する

## 参照資料

| 参照資料         | パス                                                                                                       | 説明                 |
| ---------------- | ---------------------------------------------------------------------------------------------------------- | -------------------- |
| Phase 1 要件定義 | `phase-1-requirements.md`                                                                                  | FR/NFR/境界          |
| Phase 2 設計     | `phase-2-design.md`                                                                                        | 実装設計             |
| 04A 設計レビュー | `docs/30-workflows/completed-tasks/task-058b-ui-04a-workspace-layout-filebrowser/phase-3-design-review.md` | 前段ゲートの判定基準 |

### システム仕様（aiworkflow-requirements）

| 参照資料        | パス                                                                              | 本Phaseで使う理由                     |
| --------------- | --------------------------------------------------------------------------------- | ------------------------------------- |
| UI機能仕様      | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`   | 04A 由来契約との整合判定              |
| ナビ仕様        | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`           | workspace view モード契約との整合判定 |
| IPCセキュリティ | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`      | watch lifecycle と allowlist 判定     |
| テスト規約      | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md` | happy-dom / fireEvent 規約判定        |
| 品質要件        | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`       | coverage gate 判定                    |

## 実行手順

### ステップ1: レビュー観点チェック

| 観点         | 判定条件                                                  |
| ------------ | --------------------------------------------------------- |
| 責務境界     | 04C が chat 本体と layout 基盤を再実装していない          |
| UI契約       | Source/Preview/QuickSearch の操作仕様が一意である         |
| 状態契約     | store 境界と local state 境界が衝突しない                 |
| IPC契約      | 新規チャネル追加なしで `file:read` / watch を利用する     |
| セキュリティ | script 非実行、sanitize 実施、fallback 表示を定義している |
| テスト契約   | component/hook/manual の観測点が定義済み                  |

### ステップ2: 重大度分類

| 判定  | 条件                               | 戻り先                 |
| ----- | ---------------------------------- | ---------------------- |
| PASS  | blocking issue 0 件                | Phase 4                |
| MINOR | 文言修正または test 観点追記で解消 | Phase 4                |
| MAJOR | 境界崩壊、IPC逸脱、防御漏れを含む  | Phase 1 または Phase 2 |

### ステップ3: ゲート出力フォーマット

| 出力                 | 内容                   |
| -------------------- | ---------------------- |
| design-review-result | 判定、論点、結論       |
| open-items           | MINOR/MAJOR の修正項目 |
| review-gate          | 戻り先と再レビュー条件 |

## 統合テスト連携

| 観点         | Phase 4 へ引き継ぐ内容                       |
| ------------ | -------------------------------------------- |
| Preview表示  | 拡張子ごとの表示分岐を component test へ展開 |
| QuickSearch  | keyboard 操作を modal test へ展開            |
| IPC更新      | file 読込失敗/更新を integration test へ展開 |
| セキュリティ | sanitize と CSP の回帰観点を test 化         |
| a11y         | dialog role と focus trap を test 化         |

## 多角的チェック観点

| 観点         | このPhaseでの確認内容                                         |
| ------------ | ------------------------------------------------------------- |
| UI/UX        | 04A レイアウト契約を維持して 04C を追加できること             |
| セキュリティ | iframe / IPC / error surface の三層防御が成立すること         |
| 品質         | Phase 7 まで追跡できる観測点を定義していること                |
| 運用         | Phase 11 screenshot と Phase 12 sync の入力を保持していること |

## 成果物

| 成果物       | パス                                      | 説明         |
| ------------ | ----------------------------------------- | ------------ |
| レビュー結果 | `outputs/phase-3/design-review-result.md` | ゲート判定   |
| 指摘一覧     | `outputs/phase-3/open-items.md`           | 修正項目     |
| ゲート記録   | `outputs/phase-3/review-gate.md`          | 戻り先と条件 |

## 完了条件

- [ ] FR/NFR と設計の対応をレビューしている
- [ ] 04A/04B/04C の責務境界をレビューしている
- [ ] IPC / security / test の観点をレビューしている
- [ ] PASS / MINOR / MAJOR の判定表を定義している
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

1. 要件整合レビュー
2. 境界レビュー
3. IPC/セキュリティレビュー
4. テストレビュー
5. ゲート判定記録

## タスク100%実行確認

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] `outputs/phase-3/` に作成すべき成果物を定義済み
- [ ] `artifacts.json` へ登録すべき成果物を確認済み
- [ ] `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/task-059b-ui-04c-workspace-preview-quicksearch` を再実行できる状態

## 次のPhase

[Phase 4: テスト作成](./phase-4-test-creation.md)
