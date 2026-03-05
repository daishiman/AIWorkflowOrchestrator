# Phase 12 実装ガイド

## Part 1（初学者向け）

### 1. この機能は何をするか

この機能は「通知の整理」と「過去の記録検索」を分けて管理します。

#### 日常の例え

学校の掲示板をイメージすると分かりやすいです。

- 通知は「新しいお知らせの紙」
- 履歴検索は「過去の配布プリントを探す引き出し」

この2つを同じ箱に入れると混ざって探しづらくなるため、別の箱に分けています。

### 2. なぜ必要か

- 通知は「すぐ見たい」「既読にしたい」が中心
- 履歴検索は「条件で探したい」「件数を見たい」が中心

使い方が違うので、データの持ち方も分ける必要があります。

### 3. できること

| 機能     | 説明                   | 例                      |
| -------- | ---------------------- | ----------------------- |
| 通知追加 | 新しい通知を上に積む   | 実行完了通知            |
| 既読管理 | 1件/全件を既読化       | 通知ベルの未読を減らす  |
| 履歴検索 | 文字で過去データを探す | 「agent」で検索         |
| 統計表示 | 種類ごとの件数を見る   | notification 何件か確認 |

## Part 2（開発者向け）

### 1. 主要型

- `NotificationItem`, `NotificationMutationResponse`
- `HistorySearchRequest`, `HistorySearchResponse`, `HistorySearchStatsResponse`
- `NotificationSlice`, `HistorySearchSlice`

### 2. IPCシグネチャ

| API                       | シグネチャ                                                                                   |
| ------------------------- | -------------------------------------------------------------------------------------------- |
| `notification.getHistory` | `(request?: { limit?: number; offset?: number }) => Promise<NotificationGetHistoryResponse>` |
| `notification.markRead`   | `(request: { id: string }) => Promise<NotificationMutationResponse>`                         |
| `historySearch.search`    | `(request: HistorySearchRequest) => Promise<HistorySearchResponse>`                          |
| `historySearch.getStats`  | `() => Promise<HistorySearchStatsResponse>`                                                  |

### 3. エッジケース

- notification id 空文字: `VALIDATION_ERROR`
- history query 空文字: `VALIDATION_ERROR`
- 不正sender: `INVALID_SENDER`
- 未認証更新IPC: `AUTH_REQUIRED`

### 4. 設定値

| 定数                       | 値  | 用途                        |
| -------------------------- | --- | --------------------------- |
| `MAX_NOTIFICATION_HISTORY` | 100 | 通知保持上限                |
| `DEFAULT_HISTORY_LIMIT`    | 50  | 履歴取得の既定limit         |
| `MAX_HISTORY_LIMIT`        | 100 | 履歴取得の最大limit         |
| `DEFAULT_PAGE_SIZE`        | 20  | history検索既定ページサイズ |
