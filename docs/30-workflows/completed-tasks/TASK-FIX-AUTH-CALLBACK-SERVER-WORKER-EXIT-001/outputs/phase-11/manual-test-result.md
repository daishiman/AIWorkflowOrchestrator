# Phase 11 手動テスト結果

## シナリオ

1. サーバー起動
2. timeout 発生（callback 未受信）
3. `stop()` 明示実行
4. 再起動して callback 成功

## 結果

- 期待どおり timeout は待機失敗のみを返す。
- `stop()` 実行で停止完了。
- 再起動/再試行で正常 callback を処理。

判定: **PASS**
