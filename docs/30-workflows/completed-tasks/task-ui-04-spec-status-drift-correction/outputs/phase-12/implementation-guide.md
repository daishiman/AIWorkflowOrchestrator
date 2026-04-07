# TASK-UI-04: 仕様書ステータス乖離修正 — 実装ガイド

## 概要

タスク仕様書の `artifacts.json` および `index.md` に記載された `status` フィールドが、実際のコード実装状態と乖離していた問題を修正した。

## 背景

P0 タスク群（TASK-P0-01〜TASK-P0-09）の実装が完了し `completed-tasks/` へ移動済みであったにもかかわらず、仕様書の `status` フィールドが `spec_created` / `in_progress` / `phase_12_completed` のまま残っていた。これにより開発者が残作業を正確に判断できない状態が生じていた。

## 変更内容

### artifacts.json 更新（6 ファイル）

| タスクID   | 変更前             | 変更後    |
| ---------- | ------------------ | --------- |
| TASK-P0-01 | phase_12_completed | completed |
| TASK-P0-02 | in_progress        | completed |
| TASK-P0-04 | in_progress        | completed |
| TASK-P0-05 | in_progress        | completed |
| TASK-P0-06 | in_progress        | completed |
| TASK-P0-08 | in_progress        | completed |

TASK-P0-07 / TASK-P0-09 は変更前から `completed`（正確）。

### index.md 更新（8 ファイル）

全 P0 タスクの `index.md` ステータス行を `completed` に統一。

| タスクID   | 変更前                                                 | 変更後    |
| ---------- | ------------------------------------------------------ | --------- |
| TASK-P0-01 | phase_12_completed                                     | completed |
| TASK-P0-02 | spec_created                                           | completed |
| TASK-P0-04 | spec_created                                           | completed |
| TASK-P0-05 | 実行中                                                 | completed |
| TASK-P0-06 | spec_created                                           | completed |
| TASK-P0-07 | spec_created（Phase 1-12 complete / Phase 13 blocked） | completed |
| TASK-P0-08 | spec_created                                           | completed |
| TASK-P0-09 | spec_created                                           | completed |

### skill-creator-agent-sdk-lane/index.md 更新

- P0 是正タスクセクションに `ステータス` 列を追加
- ディレクトリパスを `../completed-tasks/step-...` 形式に更新
- P0-01 / P0-03 / P0-05 / P0-06 の欠落エントリを追加（9 タスク全て列挙）

### executor-guide.md 更新

「P0 是正タスク 実行ステータス（2026-04-07 更新）」セクションを追加。
全 9 P0 タスクの完了状態・主な実装内容・移動先ディレクトリを一覧化。

## 影響範囲

- **コード変更**: なし（ドキュメントのみ）
- **テスト変更**: なし
- **機能変更**: なし
- **破壊的変更**: なし

## 検証方法

```bash
# artifacts.json status 確認
find docs/30-workflows/completed-tasks/step-*task-p0* -name "artifacts.json" \
  -exec jq -r '"\(.status)"' {} \;
# 期待値: 全て "completed"

# index.md ステータス確認
grep -r "ステータス" docs/30-workflows/completed-tasks/step-*task-p0*/index.md | head -1
# 期待値: | ステータス | completed |
```

## 受入条件達成確認

| AC   | 内容                                       | 達成 |
| ---- | ------------------------------------------ | ---- |
| AC-1 | artifacts.json status が実装状態と一致     | ✓    |
| AC-2 | 完了タスクが completed-tasks/ に存在       | ✓    |
| AC-3 | 部分完了タスクの残作業（全完了のため N/A） | N/A  |
| AC-4 | 親 index.md が最新状態を反映               | ✓    |
| AC-5 | executor-guide.md のステータス更新         | ✓    |
