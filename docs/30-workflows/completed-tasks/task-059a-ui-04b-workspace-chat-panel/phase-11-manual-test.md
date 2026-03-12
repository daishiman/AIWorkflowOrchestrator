# Phase 11: 手動テスト検証

## メタ情報

| 項目       | 値                         |
| ---------- | -------------------------- |
| タスクID   | TASK-UI-04B-WORKSPACE-CHAT |
| Phase      | 11                         |
| Phase名    | 手動テスト検証             |
| カテゴリ   | 検証                       |
| 優先度     | high                       |
| ステータス | completed                  |
| 前提Phase  | Phase 10                   |
| 後続Phase  | Phase 12                   |

## 目的

04B の主要 UI 状態をスクリーンショットと操作ログで検証し、Apple HIG / WCAG / current workflow 証跡を残す。

## 実行タスク

- screenshot plan 作成: zero / attached / mention / streaming / error / compact を撮影対象にする
- 手動操作: keyboard、send、chip remove、mention select、streaming を確認する
- 視覚評価: spacing、contrast、focus、overflow、theme を確認する
- 発見事項記録: issue を Phase 12 へ渡す

## 参照資料

| 参照資料           | パス                                          | 説明               |
| ------------------ | --------------------------------------------- | ------------------ |
| 実装サマリー       | `outputs/phase-5/implementation-summary.md`   | Phase 5 成果物     |
| 回帰マトリクス     | `outputs/phase-6/regression-matrix.md`        | Phase 6 成果物     |
| カバレッジレポート | `outputs/phase-7/coverage-report.md`          | Phase 7 成果物     |
| リファクタ記録     | `outputs/phase-8/refactoring-log.md`          | Phase 8 成果物     |
| 品質レポート       | `outputs/phase-9/quality-report.md`           | Phase 9 成果物     |
| 最終レビュー結果   | `outputs/phase-10/final-review-result.md`     | Phase 10 成果物    |
| release readiness  | `outputs/phase-10/release-readiness.md`       | Phase 10 成果物    |
| UI 状態マトリクス  | `outputs/phase-2/interaction-state-matrix.md` | 撮影対象の根拠     |
| テストケース一覧   | `outputs/phase-4/test-cases.md`               | 手動確認項目の根拠 |

### システム仕様（aiworkflow-requirements）

| 参照資料              | パス                                                                           | 内容                                     |
| --------------------- | ------------------------------------------------------------------------------ | ---------------------------------------- |
| accessibility testing | `.claude/skills/aiworkflow-requirements/references/testing-accessibility.md`   | keyboard / role / focus の正本           |
| design principles     | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md` | visual quality の正本                    |
| task workflow         | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`           | screenshot / current workflow 証跡の正本 |

## 実行手順

### ステップ1: テストケースを固定する

| テストケース | 状態                                  | 証跡      |
| ------------ | ------------------------------------- | --------- |
| TC-11-01     | zero state light                      | png       |
| TC-11-02     | zero state dark                       | png       |
| TC-11-03     | file chip attached                    | png       |
| TC-11-04     | mention dropdown open                 | png       |
| TC-11-05     | streaming in progress                 | png       |
| TC-11-06     | stream error surface                  | png       |
| TC-11-07     | compact width                         | png       |
| TC-11-08     | keyboard only send + remove + mention | png + log |

## 画面カバレッジマトリクス

| 画面/状態           | TC       | 証跡                                                              |
| ------------------- | -------- | ----------------------------------------------------------------- |
| zero state（light） | TC-11-01 | `outputs/phase-11/screenshots/TC-11-01-zero-state-light.png`      |
| zero state（dark）  | TC-11-02 | `outputs/phase-11/screenshots/TC-11-02-zero-state-dark.png`       |
| file context chips  | TC-11-03 | `outputs/phase-11/screenshots/TC-11-03-file-chip-attached.png`    |
| mention dropdown    | TC-11-04 | `outputs/phase-11/screenshots/TC-11-04-mention-dropdown-open.png` |
| streaming progress  | TC-11-05 | `outputs/phase-11/screenshots/TC-11-05-streaming-progress.png`    |
| stream error        | TC-11-06 | `outputs/phase-11/screenshots/TC-11-06-stream-error-surface.png`  |
| compact width       | TC-11-07 | `outputs/phase-11/screenshots/TC-11-07-compact-width.png`         |
| keyboard only flow  | TC-11-08 | `outputs/phase-11/screenshots/TC-11-08-keyboard-only-flow.png`    |

### ステップ2: preflight を実行する

1. current workflow の build を起動する
2. screenshot source が current worktree であることを確認する
3. capture metadata を保存する

## 統合テスト連携

| 観点          | 内容                                                                     |
| ------------- | ------------------------------------------------------------------------ |
| UI 状態       | Phase 4-10 で固定した zero / mention / stream / error を実画面で確認する |
| current build | current worktree の build と screenshot を対応付ける                     |
| evidence      | TC と png の紐付けを Phase 12 更新対象へ渡す                             |

## 多角的チェック観点

| 観点             | このPhaseでの確認内容                                      | 仕様参照先                                                                     |
| ---------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------ |
| UI/UX            | spacing、contrast、overflow、主役 input の視覚差を確認する | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md` |
| アクセシビリティ | keyboard 操作と live region の振る舞いを確認する           | `.claude/skills/aiworkflow-requirements/references/testing-accessibility.md`   |
| 運用             | current workflow 配下へ screenshot と metadata を残す      | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`           |

## 成果物

| 成果物            | パス                                     | 説明             |
| ----------------- | ---------------------------------------- | ---------------- |
| 手動テスト結果    | `outputs/phase-11/manual-test-result.md` | 実施結果         |
| screenshot plan   | `outputs/phase-11/screenshot-plan.json`  | 撮影計画         |
| screenshot matrix | `outputs/phase-11/screenshot-matrix.md`  | TC と png 対応表 |
| screenshots       | `outputs/phase-11/screenshots/`          | 実画像           |
| issues            | `outputs/phase-11/issues-found.md`       | 発見事項         |

## 完了条件

- [x] TC-11-01 から TC-11-08 の証跡計画を定義している
- [x] screenshot plan と matrix を作成対象にしている
- [x] current workflow 証跡の保存先を定義している
- [x] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

1. screenshot plan 作成
2. preflight 実行
3. 手動操作実施
4. screenshot / issue 記録
5. 完了条件確認

## タスク100%実行確認

- [x] 本Phase内の全タスクを100%実行完了
- [x] `outputs/phase-11/` に作成すべき成果物を定義済み
- [x] `artifacts.json` へ登録すべき成果物を確認済み
- [x] `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/task-059a-ui-04b-workspace-chat-panel` を再実行できる状態

## 次のPhase

[Phase 12: ドキュメント更新](./phase-12-documentation.md)
