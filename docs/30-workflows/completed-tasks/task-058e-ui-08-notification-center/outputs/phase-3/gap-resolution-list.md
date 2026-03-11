# Phase 3 差分解消一覧

| 差分              | 現状                      | 解消方針                     | 実装対象 Phase |
| ----------------- | ------------------------- | ---------------------------- | -------------- |
| タイトル不一致    | `通知履歴`                | `お知らせ` へ統一            | 5              |
| 余計な一括削除    | `すべて削除` が表示される | UI から撤去                  | 5              |
| 固定日時          | `toLocaleString()`        | relative time helper へ置換  | 5              |
| 個別削除 IPC なし | store action のみ         | `notification:delete` を追加 | 5              |
| Portal なし       | DOM 内直配置              | `document.body` へ Portal    | 5              |
| keyboard 不足     | Escape/focus trap なし    | focus 管理実装               | 5              |
| live region 不足  | unread 変化の音声通知なし | status region 追加           | 5              |
| テスト不足        | delete/UI/a11y が薄い     | Red テストを先行追加         | 4              |

## 再確認ポイント

- mobile overlay 配置
- delete 失敗時メッセージ
- theme コントラスト
