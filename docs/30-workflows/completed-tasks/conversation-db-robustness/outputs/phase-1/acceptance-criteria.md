# Phase 1: 受入基準

## 受入基準一覧

| AC-ID | 受入基準                                                                                    | 検証方法                     |
| ----- | ------------------------------------------------------------------------------------------- | ---------------------------- |
| AC-1  | 初回起動時（DB ファイル未存在）で Workspace Chat が正常動作する                             | 手動テスト TC-11-01          |
| AC-2  | `app.getPath('userData')` 配下に `conversations.db` が自動作成される                        | テスト T-01                  |
| AC-3  | アプリ終了時に DB が安全にクローズされる（WAL チェックポイント完了）                        | テスト T-03                  |
| AC-4  | 既存テスト（conversationHandlers: 43, register-conversation-handlers: 22）が全て PASS する  | Phase 9 自動テスト           |
| AC-5  | `registerAllIpcHandlers()` が DB インスタンスを外部から受け取る DI パターンに変更されている | テスト T-04 + コードレビュー |
| AC-6  | DB 初期化失敗時に Graceful Degradation が維持される（ERR_4006 フォールバック）              | テスト T-02                  |
| AC-7  | macOS activate イベントで DB が再利用され、二重初期化が発生しない                           | テスト T-06（Phase 6 追加）  |
| AC-8  | pragma 設定（WAL, foreign_keys=ON, busy_timeout=5000, synchronous=NORMAL）が適用される      | テスト T-01                  |

## 検証マトリクス

| AC-ID | Phase 4 テスト | Phase 6 テスト | Phase 9 品質検証 | Phase 11 手動テスト |
| ----- | -------------- | -------------- | ---------------- | ------------------- |
| AC-1  |                |                |                  | TC-11-01            |
| AC-2  | T-01           |                |                  |                     |
| AC-3  | T-03           |                |                  | TC-11-03            |
| AC-4  |                |                | 全テスト PASS    |                     |
| AC-5  | T-04           |                |                  |                     |
| AC-6  | T-02           |                |                  |                     |
| AC-7  |                | Phase 6 追加   |                  | TC-11-05            |
| AC-8  | T-01           |                |                  |                     |
