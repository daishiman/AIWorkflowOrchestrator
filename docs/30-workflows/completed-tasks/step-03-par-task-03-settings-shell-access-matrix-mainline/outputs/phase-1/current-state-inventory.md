# Phase 1: 現状棚卸しインベントリ

## タスクID: TASK-IMP-SETTINGS-SHELL-ACCESS-MATRIX-MAINLINE-001

## 1. 対象コードパスの棚卸し

### codepath-1: SettingsView (`apps/desktop/src/renderer/views/SettingsView/index.tsx`)

| 項目              | 現状                                                                              |
| ----------------- | --------------------------------------------------------------------------------- |
| ファイル行数      | 262行                                                                             |
| 主要セクション    | Account / AuthMode / AuthKey / ApiKeys / Profile / Theme / RAG                    |
| capability 表示   | 未実装 -- access matrix セクションなし                                            |
| health row        | 未実装 -- provider 接続状態の表示なし                                             |
| terminal launcher | 未実装 -- terminal 起動導線なし                                                   |
| P31 対策          | 適用済み -- 個別セレクタ useAuthMode() 等を使用                                   |
| 未認証時制御      | SettingsView 自体は PUBLIC_UNAUTHENTICATED_VIEWS に含まれ、未認証でもアクセス可能 |

### codepath-2: AppLayout (`apps/desktop/src/renderer/components/organisms/AppLayout/index.tsx`)

| 項目                | 現状                                                               |
| ------------------- | ------------------------------------------------------------------ |
| ファイル行数        | 94行                                                               |
| 構成                | GlobalNavStrip / DynamicIsland / NotificationCenter / MobileNavBar |
| persistent launcher | 未実装 -- terminal launcher の配置なし                             |
| レスポンシブ        | mobile/desktop 分岐あり（useResponsiveMode）                       |

### codepath-3: AuthTimeoutFallback (`apps/desktop/src/renderer/components/AuthGuard/AuthTimeoutFallback.tsx`)

| 項目               | 現状                                  |
| ------------------ | ------------------------------------- |
| 用途               | 認証タイムアウト時のフォールバック UI |
| access matrix 連携 | 未連携 -- capability 状態の表示なし   |

### codepath-4: shouldResetUnauthenticatedView (`apps/desktop/src/renderer/utils/shouldResetUnauthenticatedView.ts`)

| 項目                         | 現状                                                             |
| ---------------------------- | ---------------------------------------------------------------- |
| PUBLIC_UNAUTHENTICATED_VIEWS | ["settings"] -- Settings のみ公開                                |
| reset 条件                   | 未認証 + 非ローディング + 非dashboard + 非公開ビュー時にリセット |
| access matrix 連携           | 未連携 -- guidance-only 表示ロジックなし                         |

### codepath-5: uiSlice (`apps/desktop/src/renderer/store/slices/uiSlice.ts`)

| 項目             | 現状                                                                               |
| ---------------- | ---------------------------------------------------------------------------------- |
| ファイル行数     | 152行                                                                              |
| 管理状態         | DynamicIsland / mobileDrawer / windowSize / responsiveMode / nav / SystemPrompt UI |
| capability state | 未管理 -- access matrix 用の state なし                                            |
| health state     | 未管理 -- provider health 用の state なし                                          |

## 2. 共有型定義の棚卸し

### execution-capability.ts (`packages/shared/src/types/execution-capability.ts`)

| 項目                     | 現状                                                                                      |
| ------------------------ | ----------------------------------------------------------------------------------------- |
| AccessCapability         | integratedRuntime / terminalSurface / both / none の4状態 -- 実装済み                     |
| UiState                  | ready / blocked / unavailable の3状態 -- 実装済み                                         |
| resolveCapability()      | apiKeyValid + subscriptionValid + apiKeyDegraded から AccessCapability を導出 -- 実装済み |
| resolveUiState()         | capability + context から UiState を導出 -- 実装済み                                      |
| resolveCtaContract()     | capability x uiState から CTA 契約を導出 -- 実装済み                                      |
| assertNoSilentFallback() | P62 対策ガード -- 実装済み                                                                |
| テスト                   | contract test / regression test が存在 -- 実装済み                                        |

## 3. GAP 分析

| GAP-ID | 領域                | 現状                                                                                       | 必要な設計                                                            |
| ------ | ------------------- | ------------------------------------------------------------------------------------------ | --------------------------------------------------------------------- |
| GAP-01 | Settings IA         | access matrix セクションなし                                                               | CapabilityCard / HealthStatusRow / ProviderSummaryCard の情報階層定義 |
| GAP-02 | AppLayout           | persistent launcher なし                                                                   | TerminalLauncher の配置と全画面での常時表示                           |
| GAP-03 | Settings 未認証制御 | PUBLIC_UNAUTHENTICATED_VIEWS で Settings アクセスは許可だが guidance-only 表示ロジックなし | 操作 CTA 非表示 + ガイダンスメッセージ表示の設計                      |
| GAP-04 | health 表示         | provider 接続状態の UI 表示なし                                                            | HealthStatusRow の connected/disconnected/error/null 表示             |
| GAP-05 | state 管理          | capability / health 状態が UI store に未統合                                               | store slice または props 経由での state 供給設計                      |
| GAP-06 | 契約整合            | execution-capability.ts の型は存在するが SettingsView で消費されていない                   | CTA 契約と Settings UI の接続設計                                     |

## 4. 関連ドキュメントの棚卸し

| ドキュメント                                                | 存在 | access matrix 関連記載                 |
| ----------------------------------------------------------- | ---- | -------------------------------------- |
| ui-ux-settings.md                                           | あり | Settings IA の全体構成を定義           |
| ui-ux-settings-core.md                                      | あり | bypass / screenshot 契約を定義         |
| ui-ux-navigation.md                                         | あり | Settings 公開導線を定義                |
| workflow-ai-runtime-execution-responsibility-realignment.md | あり | runtime 責務再配線の current canonical |
| llm-ipc-types.md                                            | あり | health row の型契約を定義              |
