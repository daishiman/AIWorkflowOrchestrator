# Phase 11: 手動テストチェックリスト

## タスクID: UT-SKILL-WIZARD-W1-par-02d

## MT-ID対応表

| MT-ID | TC-ID  | 確認内容                                                   | 手動確認方法     |
| ----- | ------ | ---------------------------------------------------------- | ---------------- |
| MT-01 | TC-W01 | ウィザードボタンが表示される                               | 実画面確認       |
| MT-02 | TC-W02 | ボタンテキスト「スキル作成ウィザードを開く →」が表示される | 実画面確認       |
| MT-03 | TC-W03 | ボタンクリックでウィザードが開く                           | クリック動作確認 |
| MT-04 | TC-D01 | テキストエリアが存在しない                                 | DOM確認          |
| MT-05 | TC-D02 | 「スキルを生成する」ボタンが存在しない                     | DOM確認          |
| MT-06 | TC-D03 | 「方針を決める」ボタンが存在しない                         | DOM確認          |
| MT-07 | TC-K02 | セクション見出し「1. スキルを作成する」が表示される        | 実画面確認       |
| MT-08 | TC-K03 | 説明テキストが表示される                                   | 実画面確認       |
| MT-09 | TC-S01 | 「2. 生成したスキルを実行する」セクションが存在する        | 実画面確認       |
| MT-10 | TC-A01 | ボタンのスタイルが適切である                               | 実画面確認       |

## スクリーンショット計画

- `screenshots/TC-11-01-skill-lifecycle-hidden-controls.png`: 初期表示状態
- `screenshots/TC-11-02-skill-lifecycle-open-wizard.png`: 「1. スキルを作成する」セクションのクローズアップ
- `screenshots/TC-11-03-skill-lifecycle-open-wizard-click.png`: クリック後の状態
- `screenshots/TC-11-04-skill-lifecycle-legacy-preserved.png`: パネル全体表示
- `screenshots/TC-11-05-skill-lifecycle-visual-review.png`: テーマ / ホバー / 視覚品質確認

## 実施環境

- worktree: `task-20260408-080147-wt-1`
- 実施方法: Playwright ハーネス `phase11-task-rt-04-skill-authkey.html`
- 実取得結果: `outputs/phase-11/screenshots/` に PNG を保存済み
