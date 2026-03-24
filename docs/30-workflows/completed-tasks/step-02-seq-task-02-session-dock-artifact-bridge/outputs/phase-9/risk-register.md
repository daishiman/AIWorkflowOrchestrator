# Risk Register - Session Dock Artifact Bridge

## 残リスク一覧

| ID      | リスク                                                          | 影響度 | 発生確率 | 対策                                                                                         | ステータス           |
| ------- | --------------------------------------------------------------- | ------ | -------- | -------------------------------------------------------------------------------------------- | -------------------- |
| RISK-01 | transcript persistence が Task06 にブロック                     | 高     | 確定     | 本タスクでは設計のみ。実装は UT-TERMINAL-DOCK-SESSION-PERSISTENCE-001 が Task06 完了後に着手 | 受容                 |
| RISK-02 | agentSlice への SessionDockState 追加で既存テストに影響         | 中     | 高       | デフォルト値定義 + P35 対策（影響テスト一覧の事前作成）                                      | 軽減済み             |
| RISK-03 | claudeCliAPI event と dock state machine のレースコンディション | 中     | 中       | EDGE-PER-03 テストケースで検証。event queue の順序保証を確認                                 | テスト定義済み       |
| RISK-04 | credential サニタイズの網羅性不足                               | 中     | 中       | 正規表現パターンの定義 + deny-list。実装タスクで追加パターンを検証                           | 設計定義済み (MN-04) |
| RISK-05 | 1000+ entries の transcript でパフォーマンス低下                | 低     | 低       | 仮想スクロール or ページネーションで対策。EDGE-ART-02 で検証                                 | テスト定義済み       |
| RISK-06 | data-testid 衝突 (HandoffBlock と PersistentTerminalLauncher)   | 低     | 確定     | 実装タスクで修正。各コンポーネントに固有の testid を付与                                     | 検出済み             |
| RISK-07 | session ID 衝突 (UUID v4)                                       | 極低   | 極低     | crypto.randomUUID() で十分な一意性を確保 (MN-03)                                             | 軽減済み             |
