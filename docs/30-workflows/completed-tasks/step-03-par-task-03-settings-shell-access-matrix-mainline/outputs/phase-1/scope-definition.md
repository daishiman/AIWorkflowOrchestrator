# Phase 1: スコープ定義

## タスクID: TASK-IMP-SETTINGS-SHELL-ACCESS-MATRIX-MAINLINE-001

## 1. 対象スコープ

### 設計対象コンポーネント

| コンポーネント      | 想定パス                                                              | 責務                             |
| ------------------- | --------------------------------------------------------------------- | -------------------------------- |
| CapabilityCard      | apps/desktop/src/renderer/components/settings/CapabilityCard.tsx      | AccessCapability 4状態の視覚表示 |
| HealthStatusRow     | apps/desktop/src/renderer/components/settings/HealthStatusRow.tsx     | provider 接続状態の表示          |
| ProviderSummaryCard | apps/desktop/src/renderer/components/settings/ProviderSummaryCard.tsx | 選択 provider/model の表示       |
| AccessMatrixSection | apps/desktop/src/renderer/components/settings/AccessMatrixSection.tsx | 上記3コンポーネントの合成        |
| TerminalLauncher    | apps/desktop/src/renderer/components/layout/TerminalLauncher.tsx      | terminal 起動ボタン              |

### 設計対象の変更ファイル

| ファイル                                                           | 変更種別                            |
| ------------------------------------------------------------------ | ----------------------------------- |
| apps/desktop/src/renderer/views/SettingsView/index.tsx             | AccessMatrixSection の追加配置      |
| apps/desktop/src/renderer/components/organisms/AppLayout/index.tsx | TerminalLauncher の persistent 配置 |

### 消費する既存型定義

| 型                   | パス                                              | 用途            |
| -------------------- | ------------------------------------------------- | --------------- |
| AccessCapability     | packages/shared/src/types/execution-capability.ts | 4状態モデル     |
| UiState              | 同上                                              | UI 表示状態     |
| CtaContract          | 同上                                              | CTA ボタン契約  |
| resolveCapability()  | 同上                                              | capability 導出 |
| resolveUiState()     | 同上                                              | UI state 導出   |
| resolveCtaContract() | 同上                                              | CTA 契約導出    |

## 2. 除外スコープ

| 除外項目                              | 理由                                                                  |
| ------------------------------------- | --------------------------------------------------------------------- |
| execution-capability.ts の型変更      | Task01 で確定済み。本タスクは消費側の設計のみ                         |
| RuntimePolicyResolver の実装変更      | Task02 のスコープ。本タスクは出力を消費する設計のみ                   |
| AuthGuard の認証フロー変更            | 既存契約を維持する。guidance-only は表示制御のみ                      |
| shouldResetUnauthenticatedView の変更 | PUBLIC_UNAUTHENTICATED_VIEWS は不変。本タスクは表示ロジックの追加のみ |
| uiSlice への state 追加               | 本タスクは設計フェーズ。store 変更は後続実装タスクで実施              |
| プロダクションコードの実装            | 本タスクは設計タスク。コード実装は後続タスクで実施                    |

## 3. 依存タスク

| タスクID                                   | 名称                          | 依存関係                                                   |
| ------------------------------------------ | ----------------------------- | ---------------------------------------------------------- |
| TASK-IMP-RUNTIME-POLICY-CENTRALIZATION-001 | Runtime Policy Centralization | 本タスクの前提。capability bridge の 4状態モデルを供給する |

## 4. 統合テスト連携ポイント

| 連携ポイント     | 対象 Phase      | 内容                                                |
| ---------------- | --------------- | --------------------------------------------------- |
| UI state         | Phase 4-7       | AccessCapability x UiState の全組合せをテストカバー |
| IPC              | Phase 4-7       | health 取得の IPC 契約テスト                        |
| Settings bypass  | Phase 3, 10, 11 | PUBLIC_UNAUTHENTICATED_VIEWS 不変の検証             |
| Terminal handoff | Phase 4-7       | TerminalLauncher クリック時の IPC 呼び出しテスト    |

## 5. Phase 4 開始条件

Phase 4（テスト作成）は以下の全条件を満たした後にのみ開始する:

- [ ] Phase 1: 要件定義書・スコープ定義・棚卸しインベントリが完成
- [ ] Phase 2: 設計サマリー・契約マトリクス・検証マトリクスが完成
- [ ] Phase 3: 設計レビューが PASS または MINOR 判定
- [ ] Phase 3: MINOR 指摘がある場合は未タスク仕様書に変換済み
