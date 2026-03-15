# Skill Feedback Report

## 対象

- `task-specification-creator`
- `aiworkflow-requirements`
- `skill-creator`

## 改善点

- `task-specification-creator`: workflow 生成直後に `artifacts.json`（root/outputs）同期チェックを必須化する。
- `aiworkflow-requirements`: task workflow 参照 path drift（`completed-tasks/unassigned-task/...`）検出ルールを強化する。
- `skill-creator`: repo-wide テスト失敗時の「既存未タスク継続 vs 新規未タスク化」二段判定パターンを標準化する。
- 共通: stash base 競合マーカーなど残骸検知を preflight に追加する。

## 観察した再発パターン

- workflow 本文と outputs の `artifacts.json` が乖離したまま進行しやすい。
- UI差分なし前提で Phase 11 を `NON_VISUAL` 相当で閉じ、明示 screenshot 要求との乖離が発生しやすい。
- task workflow backlog/completed の path が未同期のまま残りやすい。
- repo-wide テスト失敗を current/baseline 分離せずに判定し、未タスクを重複作成しやすい。

## 次回へのルール

- create 時点で `実行タスク` は表 + `- Task X:` の両方を保持する。
- `resource-map` と `quick-reference` を起点に spec path を固定してから各Phaseへ展開する。
- Phase 12 で `artifacts.json` は root と outputs の diff を機械検証してから完了化する。
- ユーザーが画面検証を要求した時点で、UI差分有無に関わらず screenshot 証跡を current workflow に残す。
- 未タスク判定は `audit --diff-from HEAD`（current）と `--target-file`（個票品質）を分離して実行し、既存課題は重複作成しない。
