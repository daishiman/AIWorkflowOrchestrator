# Phase 6: 境界ケース一覧

## タスクID: TASK-IMP-SETTINGS-SHELL-ACCESS-MATRIX-MAINLINE-001

## 1. 未検証境界ケース

| Edge-ID | 境界ケース                                | リスク | 対応方針                                                                      |
| ------- | ----------------------------------------- | ------ | ----------------------------------------------------------------------------- |
| E-01    | 認証状態の切り替え中（レース条件）        | 中     | isAuthenticated が false→true に変わる途中で CTA が一瞬活性化しないことを確認 |
| E-02    | provider API タイムアウト時の health 表示 | 中     | HealthStatusRow が error 状態を正しく表示することを確認                       |
| E-03    | capability 状態遷移の中間状態             | 低     | resolveCapability() が中間状態を返さないことを contract test で確認済み       |
| E-04    | 複数タブでの同時認証操作                  | 低     | Electron はシングルウィンドウのため対象外                                     |
| E-05    | health subscription の cleanup 失敗       | 中     | useEffect return での cleanup が StrictMode で正しく動作することを確認        |
| E-06    | TerminalLauncher ダブルクリック           | 低     | debounce または disabled 制御で二重起動を防止                                 |

## 2. 後続実装タスクで対応すべき項目

- E-01, E-02, E-05 は実装時にテストコードで検証する
- E-06 は TerminalLauncher コンポーネントの実装時に debounce を組み込む
