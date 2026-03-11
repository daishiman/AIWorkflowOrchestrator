# Phase 6: テスト拡充

## メタ情報

| 項目   | 値                                            |
| ------ | --------------------------------------------- |
| Phase  | 6                                             |
| 機能名 | task-058b-ui-04a-workspace-layout-filebrowser |
| 作成日 | 2026-03-10                                    |

## 目的

Phase 5 の Green 後に、境界値、レスポンシブ、エラー、アクセシビリティ、監視再登録を追加テストで固定する。

## 実行タスク

- 境界値テスト追加: resize 最小値 / 最大値、breakpoint 境界、localStorage 破損入力を追加する
- エラーテスト追加: 権限エラー、watch start 失敗、folder 未選択を追加する
- アクセシビリティテスト追加: tree role、switch role、keyboard nav を追加する
- 統合回帰追加: file select → status bar → watcher update の一連動作を追加する

## 参照資料

| 資料名     | パス                                                                              | 説明                       |
| ---------- | --------------------------------------------------------------------------------- | -------------------------- |
| Phase 5    | `phase-5-implementation.md`                                                       | 実装対象                   |
| Phase 4    | `phase-4-test-creation.md`                                                        | 初期テスト範囲             |
| Phase 2    | `phase-2-design.md`                                                               | 境界条件                   |
| テスト仕様 | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md` | a11y / keyboard test       |
| a11y 仕様  | `.claude/skills/aiworkflow-requirements/references/testing-accessibility.md`      | keyboard / role の追加観点 |
| 品質要件   | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`       | 回帰テストと品質下限       |
| 教訓       | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`            | P5 と preview preflight    |

## 実行手順

### ステップ1: 追加ケースの固定

| 分類          | 追加ケース                                                     |
| ------------- | -------------------------------------------------------------- |
| resize        | 180, 400, 280, 500 の境界を確認する                            |
| breakpoint    | 1023, 1024, 1439, 1440 で mode 遷移を確認する                  |
| persistence   | 壊れた `workspace-panel-sizes` 値で default へ戻る             |
| error         | `file:read` 失敗時に error surface が表示される                |
| watcher       | start 直後の再 start が重複しない                              |
| accessibility | ArrowUp / Down / Left / Right / Enter / Space の挙動を固定する |

## 統合テスト連携

| 観点       | 具体項目                                                |
| ---------- | ------------------------------------------------------- |
| UI → Store | selector 経由の state change が過剰 render を起こさない |
| UI → IPC   | watcher 再登録が重複しない                              |
| UI → 04B   | attached file event が 04B 境界で消えない               |
| UI → 04C   | preview open state と selected file が同期する          |

## 多角的チェック観点

| 観点         | このPhaseでの確認内容                                                                | 仕様参照先                                                                                                                                                   |
| ------------ | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| UI/UX        | breakpoint、overlay、focus ring、switch role を境界値込みで確認する                  | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md`, `.claude/skills/aiworkflow-requirements/references/testing-accessibility.md` |
| 状態管理     | localStorage 破損、selector 再描画、watcher 再登録を test で固定できているか確認する | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                                                                                 |
| エラー / IPC | `file:read` 失敗や watch start 失敗時の error surface を観測できるか確認する         | `.claude/skills/aiworkflow-requirements/references/error-handling.md`, `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`          |
| 品質         | Phase 7 の coverage 未達を先回りして潰せるケース群になっているか確認する             | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                                                                                  |

## 成果物

| 成果物                 | パス                                     | 説明                 |
| ---------------------- | ---------------------------------------- | -------------------- |
| 回帰マトリクス         | `outputs/phase-6/regression-matrix.md`   | 境界値一覧           |
| 統合テスト結果         | `outputs/phase-6/integration-test.md`    | 拡充した結合観点     |
| アクセシビリティケース | `outputs/phase-6/accessibility-cases.md` | keyboard / role 確認 |

## 完了条件

- [ ] resize と breakpoint の境界値ケースを定義している
- [ ] error と watcher 重複登録ケースを定義している
- [ ] accessibility ケースを定義している
- [ ] integration regression を定義している
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase 実行時は以下を SubTask として分離する。

1. 境界値ケースの追加
2. エラー / watcher ケースの追加
3. accessibility ケースの追加
4. integration regression の追加
5. 成果物更新と validator 確認

## タスク100%実行確認

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] `outputs/phase-6/` に作成すべき成果物を定義済み
- [ ] `artifacts.json` へ登録すべき成果物を確認済み
- [ ] `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/task-058b-ui-04a-workspace-layout-filebrowser` を再実行できる状態

## 次のPhase

[Phase 7: テストカバレッジ確認](./phase-7-coverage-check.md)
