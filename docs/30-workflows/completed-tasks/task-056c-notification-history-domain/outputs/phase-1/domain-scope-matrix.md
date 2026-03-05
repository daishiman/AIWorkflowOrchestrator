# Phase 1 ドメインスコープ行列

| 区分          | 項目                                           | In/Out | 所有SubAgent | 備考                   |
| ------------- | ---------------------------------------------- | ------ | ------------ | ---------------------- |
| Notification  | 通知履歴取得/既読/全件既読/全件削除            | In     | SA-01        | invoke 4ch             |
| Notification  | pushイベント `notification:new` 配信・購読解除 | In     | SA-01, SA-04 | on 1ch                 |
| Notification  | バッジ/ポップオーバーの見た目最適化            | Out    | -            | 本タスクはドメイン中心 |
| HistorySearch | 検索/ページング/統計取得                       | In     | SA-02        | invoke 2ch             |
| HistorySearch | 結果表示・統計パネルの最小UI実装               | In     | SA-02        | Phase 11証跡に必要     |
| HistorySearch | 高度な並び替え/FTS最適化                       | Out    | -            | 後続タスク             |
| Persistence   | 通知100件上限・削除順序・復元順序              | In     | SA-03        | 永続化ポリシー         |
| Security      | sender検証・P42検証・sanitize                  | In     | SA-04        | 全invoke対象           |
| Documentation | Step 1-A/1-B/1-C・監査証跡                     | In     | SA-05        | Phase 12               |
