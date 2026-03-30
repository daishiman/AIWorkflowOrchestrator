# Phase 12 Task 12-4: 未タスク検出レポート

## 検出結果

### current

| ID    | 内容                                         | ソース              | 優先度 |
| ----- | -------------------------------------------- | ------------------- | ------ |
| UT-01 | improve() / verify() への同様の persist 統合 | index.md スコープ外 | Medium |
| UT-02 | 構造化ロギング導入（console.warn → Logger）  | MR-01 将来改善      | Low    |

### baseline

- 0 件（前回タスクからの引き継ぎなし）

## 未タスク管理 3 ステップ

### UT-01: improve() / verify() persist 統合

1. **指示書**: 本レポートが指示書を兼ねる
2. **残課題テーブル**: 上記テーブルに記載済み
3. **関連仕様書リンク**: `index.md` の「含まない」セクション参照

### UT-02: 構造化ロギング導入

1. **指示書**: 本レポートが指示書を兼ねる
2. **残課題テーブル**: 上記テーブルに記載済み
3. **関連仕様書リンク**: `phase-3-design-review.md` MR-01 参照

### UT-P0-05-PHASE12-SAME-WAVE-SYNC-001: canonical sync 補完

1. **指示書**: `docs/30-workflows/unassigned-task/task-ut-p0-05-phase12-same-wave-sync-001.md`
2. **残課題テーブル**: Phase 12 current gap として本レポートに記載
3. **関連仕様書リンク**: `phase12-task-spec-compliance-check.md` / `phase-12-documentation.md`

## MR-01 の未タスク化判定

- Phase 5 で `console.warn` 追加として対応済み
- 将来的な改善（構造化ロギング）は UT-02 として記録
