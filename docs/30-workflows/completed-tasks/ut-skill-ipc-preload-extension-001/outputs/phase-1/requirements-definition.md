# Phase 1 要件定義書

## 目的

30チャネルIPC/Preload拡張計画の機能要件・非機能要件を固定する。

## 機能要件（Task 1-1）

| 区分         | task  | チャネル数 | チャネル                                                                                                                                                                      |
| ------------ | ----- | ---------: | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| チェーン     | 9D    |          5 | `skill:chain:list`, `skill:chain:get`, `skill:chain:save`, `skill:chain:delete`, `skill:chain:execute`                                                                        |
| フォーク     | 9E    |          1 | `skill:fork`                                                                                                                                                                  |
| 共有         | 9F    |          3 | `skill:importFromSource`, `skill:export`, `skill:validateSource`                                                                                                              |
| スケジュール | 9G    |          5 | `skill:schedule:list`, `skill:schedule:add`, `skill:schedule:update`, `skill:schedule:delete`, `skill:schedule:toggle`                                                        |
| デバッグ     | 9H    |          7 | `skill:debug:start`, `skill:debug:command`, `skill:debug:breakpoint:add`, `skill:debug:breakpoint:remove`, `skill:debug:inspect`, `skill:debug:evaluate`, `skill:debug:event` |
| ドキュメント | 9I    |          4 | `skill:docs:generate`, `skill:docs:preview`, `skill:docs:export`, `skill:docs:templates`                                                                                      |
| 分析         | 9J    |          5 | `skill:analytics:record`, `skill:analytics:statistics`, `skill:analytics:summary`, `skill:analytics:trend`, `skill:analytics:export`                                          |
| 合計         | 9D-9J |         30 | handle 29 / on 1                                                                                                                                                              |

## 非機能要件（Task 1-2）

| 要件ID  | 要件                             | 判定基準                                                         |
| ------- | -------------------------------- | ---------------------------------------------------------------- |
| NFR-P5  | イベント二重登録を防止する       | `safeOn` は必ず解除関数を返し、購読側でcleanupを必須化           |
| NFR-P32 | 型定義3点同期を維持する          | `channels.ts` / `skill-api.ts` / `preload/types.ts` 同期表を維持 |
| NFR-P44 | IPC契約ドリフトを防止する        | ハンドラ引数形式とPreload引数形式を1:1対応                       |
| NFR-P45 | Preload公開APIの安全性を維持する | `safeInvoke` / `safeOn` 経由のみ公開                             |
| NFR-WL  | ワイルドカード禁止               | `skill:*` 方式を不採用、個別ホワイトリスト定義                   |

## 前提固定（Task 1-1, 1-3）

- 外部ソースインポートは `skill:importFromSource` を正本とする。
- 実装対象は仕様書更新計画のみ。アプリ実装コードは変更しない。
- 依存タスク: `TASK-9B`, `UT-SKILL-IMPORT-CHANNEL-CONFLICT-001`。

## SubAgent実行ログ（Task 1-4）

- SubAgent-A: 30チャネル抽出とtask分類を確定。
- SubAgent-B: Preload境界要件（safeInvoke/safeOn、ホワイトリスト）を確定。
- SubAgent-C: shared型配置の必要性とP32要件を確定。
- SubAgent-D: 依存関係・実行順序・受け入れ条件を統合。

## 完了条件チェック

- [x] 30チャネル要件と分類が確定
- [x] P5/P32/P44/P45再発防止要件を明記
- [x] 受け入れ条件との接続前提を明記
- [x] SubAgent責務を定義
- [x] 出力先3件を満たす

## タスク100%実行確認

- [x] 本Phase内の全タスクを100%実行完了
- [x] 各タスクの成果物が生成済み
- [x] artifacts.json更新対象として記録済み
- [x] Phase完了状態: Completed
