# Phase 11: 発見事項

作成日: 2026-04-02

## スコープ外課題

本 Phase での実装・テスト中に発見したスコープ外の潜在的課題を記録します。

### 発見なし

Phase 11 実施の範囲（GovernanceSummaryPanel のレビューおよびテスト）で、スコープ外の問題は発見されませんでした。

## 追跡メモ

- `GovernanceSummaryPanel` の list key に `idx` を使用している。denial データは ephemeral（毎回 IPC 取得）なため安定 key がない。将来的には denial にユニーク ID を追加することで改善できるが、現時点では許容範囲。
- スクリーンショット収集は manual QA 環境での実施を推奨。
