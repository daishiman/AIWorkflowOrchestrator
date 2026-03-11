# Phase 6: テスト拡充

## メタ情報

| 項目       | 値                         |
| ---------- | -------------------------- |
| タスクID   | TASK-UI-04B-WORKSPACE-CHAT |
| Phase      | 6                          |
| Phase名    | テスト拡充                 |
| カテゴリ   | 品質                       |
| 優先度     | high                       |
| ステータス | completed                  |
| 前提Phase  | Phase 5                    |
| 後続Phase  | Phase 7                    |

## 目的

Green 化した実装に対して、error、cancel、race、responsive、a11y の回帰観点を追加し、04B の不安定点を先回りで潰す。

## 実行タスク

- 回帰テスト追加: selected file 切替、chip remove、send 連打、conversation 再開を確認する
- 異常系テスト追加: `file:read`、`conversation:addMessage`、`streamChat` 失敗を確認する
- a11y テスト追加: mention dropdown と chip remove の keyboard 操作を確認する
- 統合テスト追加: stream end / error / cancel と message 保存の整合を確認する

## 参照資料

| 参照資料          | パス                                          | 説明           |
| ----------------- | --------------------------------------------- | -------------- |
| 実装サマリー      | `outputs/phase-5/implementation-summary.md`   | Phase 5 成果物 |
| 変更ファイル計画  | `outputs/phase-5/changed-file-plan.md`        | Phase 5 成果物 |
| テストケース一覧  | `outputs/phase-4/test-cases.md`               | Phase 4 成果物 |
| UI 状態マトリクス | `outputs/phase-2/interaction-state-matrix.md` | Phase 2 成果物 |

### システム仕様（aiworkflow-requirements）

| 参照資料              | パス                                                                              | 内容                                    |
| --------------------- | --------------------------------------------------------------------------------- | --------------------------------------- |
| component testing     | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md` | 回帰テスト設計の正本                    |
| accessibility testing | `.claude/skills/aiworkflow-requirements/references/testing-accessibility.md`      | a11y 回帰の正本                         |
| lessons               | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`            | stream / worktree / screenshot 再発防止 |

## 実行手順

### ステップ1: 回帰ケースを追加する

| ケース             | 観点                                        |
| ------------------ | ------------------------------------------- |
| selected file 変更 | chip と active context が追従する           |
| chip remove        | active context と send payload が更新される |
| send 連打          | stream 中は再送信されない                   |
| conversation 再開  | 既存 message を読み込み、続きの送信ができる |

### ステップ2: 異常系を追加する

| ケース                     | 期待結果                             |
| -------------------------- | ------------------------------------ |
| `file:read` 失敗           | chip 未追加、inline error 表示       |
| `conversation:create` 失敗 | stream を開始しない                  |
| `streamChat` 失敗          | assistant message 未保存、retry 表示 |
| stream cancel              | local buffer 破棄、sending 状態終了  |

## 統合テスト連携

| 観点         | 内容                            |
| ------------ | ------------------------------- |
| retry        | error 後の再送信可否を固定する  |
| cancel       | cancel 後 cleanup を固定する    |
| conversation | 再開時の message 整合を固定する |

## 多角的チェック観点

| 観点               | このPhaseでの確認内容                           | 仕様参照先                                                                        |
| ------------------ | ----------------------------------------------- | --------------------------------------------------------------------------------- |
| テスタビリティ     | regression が再現性あるモックで書けるか確認する | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md` |
| アクセシビリティ   | keyboard regression を必須回帰へ含める          | `.claude/skills/aiworkflow-requirements/references/testing-accessibility.md`      |
| エラーハンドリング | cancel / timeout / read error の回帰を追加する  | `.claude/skills/aiworkflow-requirements/references/error-handling.md`             |

## 成果物

| 成果物         | パス                                     | 説明                      |
| -------------- | ---------------------------------------- | ------------------------- |
| 回帰マトリクス | `outputs/phase-6/regression-matrix.md`   | 回帰観点一覧              |
| 統合テスト結果 | `outputs/phase-6/integration-test.md`    | integration test 実行結果 |
| a11y ケース    | `outputs/phase-6/accessibility-cases.md` | keyboard / role / focus   |

## 完了条件

- [x] 回帰ケースを追加している
- [x] 異常系ケースを追加している
- [x] a11y ケースを追加している
- [x] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

1. 回帰ケース追加
2. 異常系追加
3. a11y 回帰追加
4. integration 回帰追加
5. 成果物と完了条件確認

## タスク100%実行確認

- [x] 本Phase内の全タスクを100%実行完了
- [x] `outputs/phase-6/` に作成すべき成果物を定義済み
- [x] `artifacts.json` へ登録すべき成果物を確認済み
- [x] `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/task-059a-ui-04b-workspace-chat-panel` を再実行できる状態

## 次のPhase

[Phase 7: テストカバレッジ確認](./phase-7-coverage-check.md)
