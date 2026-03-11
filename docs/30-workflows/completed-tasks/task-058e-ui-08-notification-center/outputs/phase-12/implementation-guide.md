# Phase 12 実装ガイド

## Part 1

### なぜ必要か

Bell アイコンは、アプリの中で「今すぐ見たほうがよいこと」が溜まる場所である。ここが分かりにくいと、ユーザーは通知に気づけず、逆に情報を詰め込みすぎると読む気が失われる。058e では「すぐ見つかる」「すぐ閉じられる」「必要なものだけ消せる」の3点を優先した。

### たとえば

学校の教室の前に、連絡プリントを入れる小さな箱があるイメージに近い。箱の外から「まだ読んでいない紙が何枚あるか」が分かり、開くと新しい順に並んでいて、読み終わった紙だけを1枚ずつ片づけられると使いやすい。今回の `NotificationCenter` はその役割を Bell から開く小さな箱として実装した。

### どう動くか

1. Bell 右上の badge で未読件数を示す。
2. 開くとタイトルは `お知らせ` で統一し、`すべて既読` と閉じる操作だけを上部に置く。
3. 各お知らせは新しい順に並び、時刻は「5分前」のように読みやすくする。
4. 詳細は 1 件ずつだけ開き、読んだものは既読として扱う。
5. 削除は「全部消す」ではなく、その通知だけを消す。
6. 画面が狭いときは popover を overlay に切り替え、スマートフォンでも破綻させない。

## Part 2

### 実装境界

| 層             | 実装ファイル                                                                                                                    | 役割                                                             |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| Renderer UI    | `apps/desktop/src/renderer/components/organisms/NotificationCenter/index.tsx`                                                   | Bell、popover、focus trap、relative time、delete UI、portal 描画 |
| Renderer Store | `apps/desktop/src/renderer/store/slices/notificationSlice.ts`                                                                   | 履歴保持、未読件数、expanded state、dedupe、削除時の状態整合     |
| Preload        | `apps/desktop/src/preload/channels.ts`, `apps/desktop/src/preload/api/notification-api.ts`, `apps/desktop/src/preload/types.ts` | `notification:delete` を含む型付き IPC 公開境界                  |
| Shared         | `packages/shared/src/ipc/channels.ts`                                                                                           | Main/Preload 間の channel 定数統一                               |
| Main IPC       | `apps/desktop/src/main/ipc/notificationHandlers.ts`                                                                             | sender 検証、入力検証、service 委譲、error envelope              |

058e では component を別ファイルへ全面分割するより、既存 organism の責務ブロックを整理しつつ Store/IPC 境界を明確化する方を優先した。

### 型と API シグネチャ

```ts
export interface NotificationDeleteRequest {
  notificationId: string;
}

export interface NotificationAPI {
  getHistory(
    request?: NotificationGetHistoryRequest,
  ): Promise<NotificationGetHistoryResponse>;
  markRead(request: {
    notificationId: string;
  }): Promise<NotificationMarkReadResponse>;
  markAllRead(): Promise<NotificationMarkAllReadResponse>;
  delete(
    request: NotificationDeleteRequest,
  ): Promise<NotificationDeleteResponse>;
  onNew(callback: (event: { notification: Notification }) => void): () => void;
}
```

### 使用例

```ts
const { setNotificationHistory, markAsRead, deleteNotification } =
  useAppStore.getState();

const history = await window.notification.getHistory({ limit: 50, offset: 0 });
if (history.success && history.data) {
  setNotificationHistory(history.data.notifications);
}

await window.notification.markRead({ notificationId });
markAsRead(notificationId);

await window.notification.delete({ notificationId });
deleteNotification(notificationId);
```

### エラーハンドリングとエッジケース

| 観点                     | 実装                                                                                                                                       |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| 不正 timestamp           | Main `emitNotificationNew()` と Store `toPersistedTimestamp()` の両方で ISO 正規化し、失敗時は `new Date().toISOString()` にフォールバック |
| 初期履歴と push の重複   | `setNotificationHistory()` と `ingestNotification()` の両方で ID 単位の dedupe を行う                                                      |
| 展開中の通知を削除       | `deleteNotification()` で `expandedNotificationId` を `null` に戻す                                                                        |
| 空文字 ID や sender 不正 | Main handler 側で入力検証と sender 検証を行い、失敗時は error envelope を返す                                                              |
| 閉じ方の一貫性           | Escape、outside click、close button、focus return を統一して popover を閉じる                                                              |

### 設定・調整ポイント

| 項目          | 値 / 方針                                                         | 意図                              |
| ------------- | ----------------------------------------------------------------- | --------------------------------- |
| 保持件数      | `MAX_NOTIFICATIONS = 100`                                         | 通知履歴の肥大化を防ぐ            |
| portal target | `document.body`                                                   | stacking context 崩れを避ける     |
| responsive    | desktop/tablet は popover、mobile は overlay                      | 画面幅ごとに収まりを優先          |
| animation     | `bell-swing` keyframes                                            | Bell の軽いフィードバックを付与   |
| 後方互換      | `notification:clear` は IPC に残し、UI からは `すべて削除` を外す | 既存契約を壊さず 058e UX を満たす |

### テストと検証

| 種別           | 主な確認項目                                                      | 結果 |
| -------------- | ----------------------------------------------------------------- | ---- |
| Component test | open/close、relative time、delete、outside click、Tab wrap        | PASS |
| Store test     | dedupe、expanded reset、未読数                                    | PASS |
| IPC test       | `notification:delete` validation、handler registration、allowlist | PASS |
| 手動テスト     | desktop/tablet/mobile/empty state の screenshot                   | PASS |
