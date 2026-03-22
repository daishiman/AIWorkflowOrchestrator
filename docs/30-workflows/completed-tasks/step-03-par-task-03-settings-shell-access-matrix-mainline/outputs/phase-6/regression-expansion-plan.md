# Phase 6: 回帰拡張計画

## タスクID: TASK-IMP-SETTINGS-SHELL-ACCESS-MATRIX-MAINLINE-001

## 1. 統合シナリオ SC-01〜SC-06 テスト設計

| SC-ID | シナリオ                                     | テスト方針                                                                        | ステータス |
| ----- | -------------------------------------------- | --------------------------------------------------------------------------------- | ---------- |
| SC-01 | 認証済み → Settings → capability full 表示   | Store に認証済み状態を設定し、AccessMatrixSection をレンダーして検証              | 設計完了   |
| SC-02 | 未認証 → Settings → guidance-only 表示       | Store に未認証状態を設定し、CTA 非表示 + ガイダンスメッセージを検証               | 設計完了   |
| SC-03 | launcher クリック → terminal 起動            | TerminalLauncher クリックで IPC 呼び出しが発火することを検証                      | 設計完了   |
| SC-04 | provider 変更 → health 再取得 → Row 更新     | provider セレクタ変更後に health 取得 IPC が再呼び出しされることを検証            | 設計完了   |
| SC-05 | blocked 状態 → CTA 非活性 → blockedInfo 表示 | capability=none, uiState=blocked で CTA disabled + blockedInfo テキスト表示を検証 | 設計完了   |
| SC-06 | loading → skeleton → ready 遷移              | uiState を loading → ready に変更し、skeleton 消失 + コンテンツ表示を検証         | 設計完了   |

## 2. 回帰観点 RG-01〜RG-06 テスト設計

| RG-ID | 回帰観点                          | テスト内容                                                                                         | ステータス |
| ----- | --------------------------------- | -------------------------------------------------------------------------------------------------- | ---------- |
| RG-01 | P31: Store Hook 無限ループ防止    | 個別セレクタ使用時に re-render 回数が閾値（3回）以下であることを renderCount で検証する            | 設計完了   |
| RG-02 | P48: non-null assertion 禁止      | IPC レスポンスの data が undefined の場合にクラッシュせずフォールバック表示されることを検証する    | 設計完了   |
| RG-03 | P5: リスナー二重登録防止          | StrictMode 下で health 取得リスナーが1回だけ登録されることを検証する                               | 設計完了   |
| RG-04 | P62: DEFAULT_CONFIG fallback 禁止 | provider/model 未選択時に DEFAULT_CONFIG が使用されず、エラー/ガイダンスが表示されることを検証する | 設計完了   |
| RG-05 | Settings bypass 防止              | isAuthenticated=false で Settings 内の操作系 CTA が一切活性化しないことを検証する                  | 設計完了   |
| RG-06 | CTA 契約整合性                    | 各 capability 状態で表示される CTA テキストが contract-matrix.md の定義と一致することを検証する    | 設計完了   |

## 3. Phase 7 で確認すべき不足領域

- Branch Coverage: capability 4状態 x isAuthenticated 2状態 = 8分岐の網羅
- HealthStatusRow: connected/disconnected/error/null の全状態テスト
- レスポンシブ: mobile/tablet/desktop の3ブレークポイントでのレイアウトテスト（手動テストに委譲）
