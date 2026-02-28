# Phase 6 追加テスト仕様

## 追加/確認観点

- timeout -> manual stop の連結動作
- stop() 多重呼び出し時の安全性
- state あり/なし callback 成功
- code 欠如 callback 400

## 再発防止観点

- timeout は「待機失敗」であり「サーバー停止」ではないことをテストで固定
