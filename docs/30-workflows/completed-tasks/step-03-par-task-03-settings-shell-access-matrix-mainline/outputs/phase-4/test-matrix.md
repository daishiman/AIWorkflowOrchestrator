# Phase 4: テストマトリクス

## タスクID: TASK-IMP-SETTINGS-SHELL-ACCESS-MATRIX-MAINLINE-001

## 1. Concern 1 -- Settings Access Matrix Section

### CapabilityCard テスト（TC-C01〜TC-C06）

| TC-ID  | シナリオ                                    | 入力 Props                                                                            | 期待出力                                                  | テスト種別 |
| ------ | ------------------------------------------- | ------------------------------------------------------------------------------------- | --------------------------------------------------------- | ---------- |
| TC-C01 | capability=integratedRuntime, uiState=ready | { capability: "integratedRuntime", uiState: "ready", isAuthenticated: true }          | 統合ランタイム利用可能カード表示、CTA "AI で実行" 活性    | unit       |
| TC-C02 | capability=terminalSurface, uiState=ready   | { capability: "terminalSurface", uiState: "ready", isAuthenticated: true }            | ターミナル利用可能カード表示、CTA "ターミナルで実行" 活性 | unit       |
| TC-C03 | capability=both, uiState=ready              | { capability: "both", uiState: "ready", isAuthenticated: true }                       | 全機能利用可能カード表示                                  | unit       |
| TC-C04 | capability=none, uiState=blocked            | { capability: "none", uiState: "blocked", blockedInfo: {...}, isAuthenticated: true } | 設定必要カード表示、CTA "設定を開く"                      | unit       |
| TC-C05 | isAuthenticated=false                       | { isAuthenticated: false, ... }                                                       | guidance-only 表示、操作 CTA 非表示                       | unit       |
| TC-C06 | uiState=loading                             | { uiState: "loading", ... }                                                           | スケルトン / スピナー表示                                 | unit       |

### HealthStatusRow テスト（TC-H01〜TC-H04）

| TC-ID  | シナリオ       | health 値      | 期待出力                           | テスト種別 |
| ------ | -------------- | -------------- | ---------------------------------- | ---------- |
| TC-H01 | connected      | "connected"    | 緑インジケーター、provider 名表示  | unit       |
| TC-H02 | disconnected   | "disconnected" | 灰インジケーター、再接続 CTA       | unit       |
| TC-H03 | error          | "error"        | 赤インジケーター、エラーメッセージ | unit       |
| TC-H04 | null（未選択） | null           | 未選択状態メッセージ、選択導線 CTA | unit       |

### ProviderSummaryCard テスト（TC-P01〜TC-P03）

| TC-ID  | シナリオ             | 入力                                                         | 期待出力                                   | テスト種別  |
| ------ | -------------------- | ------------------------------------------------------------ | ------------------------------------------ | ----------- |
| TC-P01 | provider+model選択済 | { selectedProvider: "Anthropic", selectedModel: "claude-3" } | provider/model 名表示                      | unit        |
| TC-P02 | provider未選択       | { selectedProvider: undefined }                              | 未選択ガイダンス表示（P62: fallback 禁止） | unit        |
| TC-P03 | provider変更後       | provider を A→B に変更                                       | health 再取得トリガー確認                  | integration |

## 2. Concern 2 -- Persistent Launcher

### TerminalLauncher テスト（TC-L01〜TC-L03）

| TC-ID  | シナリオ           | 入力                                                   | 期待出力                                                    | テスト種別  |
| ------ | ------------------ | ------------------------------------------------------ | ----------------------------------------------------------- | ----------- |
| TC-L01 | capability=both    | { capability: "both", isDisabled: false }              | ランチャーボタン活性、クリックで terminal 起動 IPC 呼び出し | unit        |
| TC-L02 | isDisabled=true    | { isDisabled: true, disabledReason: "認証が必要です" } | ボタン非活性、disabledReason ツールチップ                   | unit        |
| TC-L03 | AppLayout 配置確認 | AppLayout 内にマウント                                 | persistent 領域に常時表示されている                         | integration |

## 3. 統合シナリオ（SC-01〜SC-06）

| SC-ID | シナリオ                                                | テスト種別  |
| ----- | ------------------------------------------------------- | ----------- |
| SC-01 | 認証済み → Settings 遷移 → capability card が full 表示 | integration |
| SC-02 | 未認証 → Settings 遷移 → guidance-only 表示             | integration |
| SC-03 | launcher クリック → terminal 起動                       | integration |
| SC-04 | provider 変更 → health 再取得 → HealthStatusRow 更新    | integration |
| SC-05 | blocked 状態 → CTA 非活性 → blockedInfo 表示            | integration |
| SC-06 | loading → skeleton → ready 遷移                         | integration |

## 4. テスト種別ごとの責務分離

| テスト種別  | 責務                                         | 対象 TC-ID                                         |
| ----------- | -------------------------------------------- | -------------------------------------------------- |
| unit        | 個別コンポーネントの Props → 表示の検証      | TC-C01〜C06, TC-H01〜H04, TC-P01〜P02, TC-L01〜L02 |
| integration | コンポーネント合成・IPC 連携・状態遷移の検証 | TC-P03, TC-L03, SC-01〜SC-06                       |
| manual      | 視覚的検証・レスポンシブ・アクセシビリティ   | MT-01〜MT-06 (Phase 11)                            |
