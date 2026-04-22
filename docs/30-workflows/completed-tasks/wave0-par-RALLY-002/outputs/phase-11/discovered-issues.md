# Discovered Issues

- 今回の review で検出した主要 issue は Phase 5 で修正済み
- 修正内容:
  - undo 復元中の再送信が live snapshot requestId に紐づく不整合
  - 再送信成功直後に stale な live 質問へ戻る回帰リスク
- 備考: 手動実機確認未実施のため、未知の実行時問題は残る
