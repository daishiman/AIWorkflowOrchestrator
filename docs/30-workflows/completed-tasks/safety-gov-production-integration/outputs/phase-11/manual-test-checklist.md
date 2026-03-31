# Phase 11 Manual Test Checklist

## 対象

- workflow: `docs/30-workflows/safety-gov-production-integration`
- phase: 11
- test-mode: `NON_VISUAL`

## チェックリスト

| テストケース | 手順                                                  | 期待結果                          | 実施状況 |
| ------------ | ----------------------------------------------------- | --------------------------------- | -------- |
| MT-11-01     | Electron を起動する                                   | IPC handler 登録エラーが出ない    | pending  |
| MT-11-02     | DevTools で `window.electronAPI.execution` を確認する | execution API が参照できる        | pending  |
| MT-11-03     | approval request を発火させる                         | Renderer 側でイベントを受信する   | pending  |
| MT-11-04     | approve / reject を送る                               | Main Process が応答を受信する     | pending  |
| MT-11-05     | セッションを `done` / `aborted` にする                | `revokeAll(sessionId)` が呼ばれる | pending  |
