# Phase 2: 契約マトリクス

## タスクID: TASK-IMP-SETTINGS-SHELL-ACCESS-MATRIX-MAINLINE-001

## 1. State 契約

### AccessMatrixProps（Concern 1）

| Props            | 型                       | 必須 | 説明                                              |
| ---------------- | ------------------------ | ---- | ------------------------------------------------- |
| capability       | AccessCapability         | Yes  | integratedRuntime / terminalSurface / both / none |
| uiState          | UiState                  | Yes  | ready / blocked / unavailable                     |
| blockedInfo      | BlockedInfo or undefined | No   | uiState=blocked 時のみ                            |
| health           | HealthStatus or null     | Yes  | connected / disconnected / error / null           |
| selectedProvider | string or undefined      | No   | 選択中 provider 名                                |
| selectedModel    | string or undefined      | No   | 選択中 model 名                                   |
| isAuthenticated  | boolean                  | Yes  | 認証状態（guidance-only 制御用）                  |

### TerminalLauncherProps（Concern 2）

| Props          | 型                  | 必須 | 説明                    |
| -------------- | ------------------- | ---- | ----------------------- |
| capability     | AccessCapability    | Yes  | terminal 起動可否の判定 |
| isDisabled     | boolean             | Yes  | 非活性制御              |
| disabledReason | string or undefined | No   | 非活性時のツールチップ  |

### HealthStatus 型

| 値           | 意味              | インジケーター色    |
| ------------ | ----------------- | ------------------- |
| connected    | provider 接続成功 | 緑 (systemGreen)    |
| disconnected | provider 切断     | 灰 (secondaryLabel) |
| error        | provider エラー   | 赤 (systemRed)      |
| null         | provider 未選択   | -- (テキストのみ)   |

## 2. AccessCapability x UiState 全組合せマッピング（AC-3 充足）

| capability        | uiState     | CapabilityCard 表示    | CTA primary      | CTA secondary      | TerminalLauncher         |
| ----------------- | ----------- | ---------------------- | ---------------- | ------------------ | ------------------------ |
| integratedRuntime | ready       | 統合ランタイム利用可能 | AI で実行        | 設定を開く         | disabled (terminal 不要) |
| terminalSurface   | ready       | ターミナル利用可能     | ターミナルで実行 | コマンドをコピー   | enabled                  |
| both              | ready       | 全機能利用可能         | AI で実行        | ターミナルで実行   | enabled                  |
| none              | blocked     | 設定が必要             | 設定を開く       | ヘルプを表示       | disabled                 |
| none              | unavailable | 利用不可               | (null)           | セットアップガイド | disabled                 |

### 未認証時の上書き（Concern 3）

| 条件                  | CTA primary | CTA secondary | TerminalLauncher                  |
| --------------------- | ----------- | ------------- | --------------------------------- |
| isAuthenticated=false | (非表示)    | (非表示)      | disabled, reason="認証が必要です" |

## 3. Action 契約

| Action                 | トリガー                        | IPC チャンネル        | 結果                       |
| ---------------------- | ------------------------------- | --------------------- | -------------------------- |
| executeIntegrated      | CTA primary クリック            | (後続タスクで定義)    | 統合ランタイムでスキル実行 |
| executeTerminalHandoff | CTA / TerminalLauncher クリック | (後続タスクで定義)    | terminal 起動              |
| copyCommandToClipboard | CTA secondary クリック          | N/A (Renderer 内完結) | clipboard にコマンドコピー |
| openSettings           | CTA クリック                    | N/A (ナビゲーション)  | Settings 画面へ遷移        |
| openHelp               | CTA secondary クリック          | N/A (外部リンク)      | ヘルプドキュメントを開く   |
| openSetupGuide         | CTA secondary クリック          | N/A (ナビゲーション)  | セットアップガイドを開く   |
| refreshHealth          | provider 変更時                 | health IPC            | health 状態を再取得        |

## 4. Ownership 契約

| コンポーネント      | 所有者              | 依存先                                               |
| ------------------- | ------------------- | ---------------------------------------------------- |
| AccessMatrixSection | SettingsView        | CapabilityCard, HealthStatusRow, ProviderSummaryCard |
| CapabilityCard      | AccessMatrixSection | execution-capability.ts (resolveCtaContract)         |
| HealthStatusRow     | AccessMatrixSection | health IPC 契約                                      |
| ProviderSummaryCard | AccessMatrixSection | store (provider/model セレクタ)                      |
| TerminalLauncher    | AppLayout           | execution-capability.ts (AccessCapability)           |

## 5. 不変契約（変更禁止）

| 契約                           | 値                      | 根拠                        |
| ------------------------------ | ----------------------- | --------------------------- |
| PUBLIC_UNAUTHENTICATED_VIEWS   | ["settings"]            | Settings bypass 契約 (AC-2) |
| shouldResetUnauthenticatedView | 既存ロジック維持        | Reset exclusion 契約        |
| CTA 上限                       | primary 1 + secondary 1 | CTA 契約 (Task01)           |
| DEFAULT_CONFIG fallback        | 禁止                    | P62 準拠                    |
