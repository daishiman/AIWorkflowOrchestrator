# Phase 1 受け入れ基準

| AC    | 条件                                                                         | 判定 |
| ----- | ---------------------------------------------------------------------------- | ---- |
| AC-01 | `WorkspaceView` で `WorkspaceChatPanel` が描画される                         | ✅   |
| AC-02 | 「選択中ファイルを背景情報に追加」ボタンで `fileSelectionSlice` に追加される | ✅   |
| AC-03 | 添付チップの削除操作が機能する                                               | ✅   |
| AC-04 | `@mention` 入力で候補が開き、キーボード移動できる                            | ✅   |
| AC-05 | mention 選択でファイル添付＋preview 表示が行われる                           | ✅   |
| AC-06 | 送信時に会話作成・user保存・stream開始が実行される                           | ✅   |
| AC-07 | stream end で assistant メッセージが表示・保存される                         | ✅   |
| AC-08 | stream error / file read error が alert 表示される                           | ✅   |
| AC-09 | 04B対象テスト14件がPASSする                                                  | ✅   |
| AC-10 | Phase 11 screenshot 8件が outputs 配下に存在する                             | ✅   |
