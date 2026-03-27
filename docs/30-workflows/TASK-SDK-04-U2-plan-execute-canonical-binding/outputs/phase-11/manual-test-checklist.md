# Phase 11: 手動テストチェックリスト

## 手動観測項目

| ID       | 手順                                                | 期待結果                         | 状態    |
| -------- | --------------------------------------------------- | -------------------------------- | ------- |
| TC-11-01 | 依頼文入力 → 方針を決める → textarea変更 → 実行する | executePlan に元の依頼文が渡る   | not_run |
| TC-11-02 | plan作成 → キャンセル → 別の依頼で再plan → 実行する | executePlan に新しい依頼文が渡る | not_run |
| TC-11-03 | plan作成 → textarea を3回以上変更 → 実行する        | executePlan に最初の依頼文が渡る | not_run |

## 非視覚証跡方針

- 分類: `NON_VISUAL`
- 理由: terminal 上での task spec 実行のため Electron GUI walkthrough は実施不可
- renderer unit test (U-8b, U-18, U-19, U-20, U-21) で同等または隣接するシナリオをカバー
- 2026-03-28 のローカル再実行は `esbuild` host/binary version mismatch により未完了
- GUI walkthrough は実装完了後に別途実施予定
