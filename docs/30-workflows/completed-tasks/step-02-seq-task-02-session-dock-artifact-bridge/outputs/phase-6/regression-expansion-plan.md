# Regression Expansion Plan - Session Dock Artifact Bridge

## 拡張方針

Phase 4 の test-matrix.md から未カバーの edge case を 3 カテゴリに分類して追加する。

## 追加テスト一覧

### Category 1: State Boundary

| ID         | テスト名                            | 説明                                                                                       |
| ---------- | ----------------------------------- | ------------------------------------------------------------------------------------------ |
| EDGE-SM-01 | handoff 中に CLI disconnect         | handoff → unavailable への遷移を検証                                                       |
| EDGE-SM-02 | running 中に CLI disconnect         | running → unavailable ではなく running → aborted を検証（CLI 切断はエラー終了扱い）        |
| EDGE-SM-03 | guidance-only から CLI unavailable  | guidance-only → unavailable への遷移を検証                                                 |
| EDGE-SM-04 | 複数 guidance 連続受信              | ready 状態で2回目の GUIDANCE_RECEIVED が来た場合、最新の guidance で上書きされることを検証 |
| EDGE-SM-05 | session ID なしで CLI_SESSION_START | handoff 中に session ID 未設定で CLI_SESSION_START が来た場合、遷移しないことを検証        |

### Category 2: Restore Failure

| ID          | テスト名                            | 説明                                                                 |
| ----------- | ----------------------------------- | -------------------------------------------------------------------- |
| EDGE-PER-01 | 壊れた transcript データの restore  | JSON parse エラー時に ready フォールバック                           |
| EDGE-PER-02 | 存在しない session ID の restore    | claudeCliAPI.getSession が Not Found を返す場合                      |
| EDGE-PER-03 | restore 中に新しい guidance 受信    | restore と guidance 受信のレースコンディション                       |
| EDGE-PER-04 | 11件目の session 作成               | FIFO で最古セッションが正しく削除されることを検証                    |
| EDGE-PER-05 | running session の cleanup スキップ | running 中の session が cleanup 対象外であることを検証（MN-05 対応） |

### Category 3: Share Cancel / Empty

| ID          | テスト名                            | 説明                                                                 |
| ----------- | ----------------------------------- | -------------------------------------------------------------------- |
| EDGE-SH-01  | 空の選択範囲で share                | 選択テキストが空の場合、share ボタンが disabled                      |
| EDGE-SH-02  | transcript が空の状態で share       | 「直近出力を添付」ボタンが disabled                                  |
| EDGE-SH-03  | share 後に dock collapse            | share 完了後すぐに collapse しても provenance chip が保持される      |
| EDGE-SH-04  | credential 含む transcript の share | MB-4 サニタイズが正しく機能し、credential が [REDACTED] に置換される |
| EDGE-ART-01 | partial artifacts (aborted 時)      | aborted state で部分的な artifacts が表示される                      |
| EDGE-ART-02 | 非常に長い transcript の折りたたみ  | 1000 entries 以上の transcript が正しく折りたたまれる                |
