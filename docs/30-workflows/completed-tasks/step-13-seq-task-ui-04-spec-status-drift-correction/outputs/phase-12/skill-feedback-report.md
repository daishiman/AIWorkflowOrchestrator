# スキルフィードバックレポート

## 実施日

2026-04-07

## task-specification-creator への改善提案

### 提案 1: Phase 完了後の artifacts.json 自動更新の強制

**現状**: `complete-phase.js` スクリプトが存在するが、実行が任意。Phase 完了時に artifacts.json が更新されないケースが発生している。

**改善案**: Phase 完了アクションを「必須ステップ」として Phase 仕様書に明記し、完了コマンドの実行確認をチェックリストの最終項目として追加する。

**優先度**: 高（今回の乖離の主因）

### 提案 2: 標準ステータス値の enum 定義の明示

**現状**: `spec_created` / `in_progress` / `completed` が有効値だが、仕様書には明示されていない。`phase_12_completed` のような非標準値が混入した。

**改善案**: task-workflow-phases.md に有効 status 値の enum テーブルを追加し、Phase 仕様書の「完了条件」に「status が有効値であること」を明記する。

**優先度**: 中

## aiworkflow-requirements への改善提案

### 提案 1: タスク完了時の status 更新を executor-guide に記載

**現状**: executor-guide.md は「読み方」「task の選び方」が中心で、「完了後に何をするか」が書かれていない。

**改善案**: 「タスク完了時のアクション」セクションを追加し、「artifacts.json の status を completed に更新」「executor-guide.md の状態テーブルを更新」を必須アクションとして明記する。

**優先度**: 高

### 提案 2: completed-tasks への移動タイミングの明確化

**現状**: タスクが `completed-tasks/` に移動されるタイミングが不明確で、index.md のリンクが旧パスのまま残るケースが発生した。

**改善案**: 「completed-tasks への移動は artifacts.json が `completed` になった時点で即時実施」というルールを root-workflow-pack/index.md に明記する。

**優先度**: 中
