# Phase 1 受け入れ基準

## Given / When / Then

1. Given 現行差分を適用した状態、When 対象機能を実行、Then クラッシュ/契約違反が発生しない。
2. Given 回帰ケース、When 既知不具合シナリオを再実行、Then 期待動作を維持する。
3. Given 仕様書更新、When 検証スクリプトを実行、Then warning=0 を維持する。

## 品質ゲート

- ユニット/統合テストがすべてPASS。
- Phase 1-12成果物が outputs 配下に存在。
