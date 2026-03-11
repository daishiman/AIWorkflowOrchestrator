# Phase 11: 手動テスト検証

## メタ情報

| 項目   | 値                                            |
| ------ | --------------------------------------------- |
| Phase  | 11                                            |
| 機能名 | task-058b-ui-04a-workspace-layout-filebrowser |
| 作成日 | 2026-03-10                                    |

## 目的

desktop / tablet / mobile の UI 動作、tree keyboard nav、resize、watcher 更新、preview preflight を手動で確認し、スクリーンショット証跡を残す。

## 実行タスク

- preview preflight: build 成功と `127.0.0.1:4173` 疎通を確認する
- desktop 検証: `3-pane`、resize、status bar を確認する
- tablet 検証: `chat+files` と `chat+preview` を確認する
- mobile 検証: overlay panel、Escape close、toggle を確認する
- keyboard 検証: tree nav、switch nav、focus ring を確認する

## 参照資料

| 資料名     | パス                                                                           | 説明                        |
| ---------- | ------------------------------------------------------------------------------ | --------------------------- |
| Phase 1    | `phase-1-requirements.md`                                                      | 受け入れ基準                |
| Phase 2    | `phase-2-design.md`                                                            | UI 設計                     |
| Phase 5    | `phase-5-implementation.md`                                                    | 実装対象                    |
| Phase 6    | `phase-6-test-expansion.md`                                                    | 回帰ケース                  |
| Phase 7    | `phase-7-coverage-check.md`                                                    | coverage 結果               |
| Phase 8    | `phase-8-refactoring.md`                                                       | 責務分離結果                |
| Phase 9    | `phase-9-quality-assurance.md`                                                 | 品質保証結果                |
| Phase 10   | `phase-10-final-review.md`                                                     | gate 結果                   |
| UI設計原則 | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md` | Apple HIG / WCAG / 8px grid |
| a11y 仕様  | `.claude/skills/aiworkflow-requirements/references/testing-accessibility.md`   | keyboard / role 観点        |
| 品質要件   | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`    | 手動検証の品質下限          |
| エラー仕様 | `.claude/skills/aiworkflow-requirements/references/error-handling.md`          | 権限エラー時の確認言語      |
| 運用仕様   | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`           | preview preflight           |
| 教訓       | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`         | screenshot 手順             |

## 実行手順

### ステップ1: preview preflight

```bash
cd apps/desktop
pnpm preview
curl -I http://127.0.0.1:4173
lsof -nP -iTCP:4173 -sTCP:LISTEN
```

## テストケース

| TC ID    | 観点              | 成功条件                                             |
| -------- | ----------------- | ---------------------------------------------------- |
| TC-11-01 | desktop 初期表示  | `chat-only` が表示される                             |
| TC-11-02 | desktop 3-pane    | 1440px 以上で file + chat + preview が同時表示される |
| TC-11-03 | resize            | min / max 制約と dblclick reset が動作する           |
| TC-11-04 | tablet mode       | 1024px から 1439px で 1 sidebar のみが表示される     |
| TC-11-05 | mobile overlay    | 1023px 以下で overlay panel が開閉する               |
| TC-11-06 | tree keyboard nav | Arrow / Enter / Space が動作する                     |
| TC-11-07 | status bar        | selected file 情報が反映される                       |
| TC-11-08 | watcher update    | 選択ファイルの変更反映が再取得される                 |

## 画面カバレッジマトリクス

| テストケース | 表示状態           | テーマ | 証跡                                                                 | 備考                    |
| ------------ | ------------------ | ------ | -------------------------------------------------------------------- | ----------------------- |
| TC-11-01     | chat-only 初期表示 | light  | `outputs/phase-11/screenshots/TC-11-01-chat-only-light.png`          | ルート証跡              |
| TC-11-02     | 3-pane             | dark   | `outputs/phase-11/screenshots/TC-11-02-3-pane-dark.png`              | desktop 幅固定          |
| TC-11-03     | resize 完了後      | light  | `outputs/phase-11/screenshots/TC-11-03-resize-after-drag.png`        | drag 後の安定状態       |
| TC-11-04     | tablet             | light  | `outputs/phase-11/screenshots/TC-11-04-tablet-chat-files.png`        | 後から開いた panel 優先 |
| TC-11-05     | mobile overlay     | light  | `outputs/phase-11/screenshots/TC-11-05-mobile-overlay.png`           | overlay + dismiss       |
| TC-11-06     | tree keyboard nav  | light  | `outputs/phase-11/screenshots/TC-11-06-tree-keyboard-nav.png`        | focus ring を含める     |
| TC-11-07     | status bar         | light  | `outputs/phase-11/screenshots/TC-11-07-status-bar-selected-file.png` | selected file 情報      |
| TC-11-08     | watcher update     | light  | `outputs/phase-11/screenshots/TC-11-08-watcher-updated-preview.png`  | preview 再読込を確認    |

### ステップ4: screenshot plan / coverage validator

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase11-screenshot-coverage.js \
  --workflow docs/30-workflows/completed-tasks/task-058b-ui-04a-workspace-layout-filebrowser
```

## 統合テスト連携

| 観点              | 具体項目                                           |
| ----------------- | -------------------------------------------------- |
| Preview preflight | build と疎通確認が通ってから screenshot を取得する |
| Layout → 04B      | file selection が chat panel 境界へ渡る            |
| Layout → 04C      | preview panel open state が preview 境界へ渡る     |
| Watcher           | file change 後に selected file 再取得が起こる      |

## 多角的チェック観点

| 観点          | このPhaseでの確認内容                                                                           | 仕様参照先                                                                                                                                                  |
| ------------- | ----------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| UI/UX         | desktop / tablet / mobile の表示、8px グリッド、dark mode、overlay 挙動を screenshot で照合する | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md`, `.claude/skills/task-specification-creator/references/phase-11-12-guide.md` |
| accessibility | tree / switch / focus ring / Escape close が WCAG と keyboard 観点を満たすか確認する            | `.claude/skills/aiworkflow-requirements/references/testing-accessibility.md`                                                                                |
| エラー / IPC  | watcher 更新、権限エラー、preflight 失敗時の振る舞いを確認する                                  | `.claude/skills/aiworkflow-requirements/references/error-handling.md`, `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`         |
| 品質          | TC と png 証跡が 1 対 1 で辿れ、coverage validator を通せるか確認する                           | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`, `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`    |

## 成果物

| 成果物            | パス                                     | 説明             |
| ----------------- | ---------------------------------------- | ---------------- |
| 手動テスト結果    | `outputs/phase-11/manual-test-result.md` | 実行結果         |
| screenshot plan   | `outputs/phase-11/screenshot-plan.json`  | 撮影計画         |
| screenshot matrix | `outputs/phase-11/screenshot-matrix.md`  | TC と png 対応表 |
| screenshots       | `outputs/phase-11/screenshots/`          | 画面証跡         |
| issues            | `outputs/phase-11/issues-found.md`       | 発見事項         |

## 完了条件

- [ ] preview preflight 手順を固定している
- [ ] TC-11-01 から TC-11-08 を定義している
- [ ] 画面カバレッジマトリクスを定義している
- [ ] screenshot coverage validator の実行手順を含めている
- [ ] desktop / tablet / mobile の確認項目を含めている
- [ ] watcher と keyboard nav の確認項目を含めている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase 実行時は以下を SubTask として分離する。

1. preview preflight
2. テストケース実行
3. screenshot plan / capture / coverage 確認
4. 発見事項と成果物更新
5. 完了条件と validator の確認

## タスク100%実行確認

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] `outputs/phase-11/` に作成すべき成果物を定義済み
- [ ] `artifacts.json` へ登録すべき成果物を確認済み
- [ ] `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/task-058b-ui-04a-workspace-layout-filebrowser` を再実行できる状態

## 次のPhase

[Phase 12: ドキュメント更新](./phase-12-documentation.md)
