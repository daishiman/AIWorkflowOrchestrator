# Phase 2: 検証マトリクス

## タスクID: TASK-IMP-SETTINGS-SHELL-ACCESS-MATRIX-MAINLINE-001

## 1. Phase 3 Review 観点

| Review-ID | 観点                                | drift リスク                                          | blocked 条件                                |
| --------- | ----------------------------------- | ----------------------------------------------------- | ------------------------------------------- |
| R-01      | PUBLIC_UNAUTHENTICATED_VIEWS 不変   | 低: 既存値を参照するだけ                              | 変更した場合は MAJOR                        |
| R-02      | CTA 上限（primary 1 + secondary 1） | 中: 状態数が多く超過しやすい                          | 超過した場合は MAJOR                        |
| R-03      | P62 暗黙 fallback 禁止              | 高: provider 未選択時に DEFAULT_CONFIG を使いたくなる | fallback パスが存在した場合は CRITICAL      |
| R-04      | P31 個別セレクタ使用                | 中: 合成 Hook を使いたくなる                          | 合成 Hook 使用時は MAJOR                    |
| R-05      | review harness 非依存               | 低: Props ベース設計で回避済み                        | review harness 前提の設計がある場合は MAJOR |
| R-06      | TerminalLauncher 配置整合           | 中: AppLayout 変更の影響範囲                          | 既存レイアウトが崩れる場合は MAJOR          |

## 2. Phase 4 テスト観点

| Test-ID | 対象 Concern | テスト種別  | 観点                                           |
| ------- | ------------ | ----------- | ---------------------------------------------- |
| T-01    | C-1          | unit        | CapabilityCard 4状態 + 未認証 + loading の表示 |
| T-02    | C-1          | unit        | HealthStatusRow 4状態のインジケーター表示      |
| T-03    | C-1          | unit        | ProviderSummaryCard 選択済み/未選択の分岐      |
| T-04    | C-1          | integration | AccessMatrixSection 合成時の Props 受け渡し    |
| T-05    | C-2          | unit        | TerminalLauncher 活性/非活性 + IPC 呼び出し    |
| T-06    | C-2          | integration | AppLayout 内での TerminalLauncher 存在確認     |
| T-07    | C-3          | unit        | isAuthenticated=false 時の CTA 非表示          |
| T-08    | C-3          | integration | 認証状態切り替え時の UI 整合性                 |

## 3. Phase 11 Manual Walkthrough 観点

| MT-ID | シナリオ                           | screenshot 要否  |
| ----- | ---------------------------------- | ---------------- |
| MT-01 | Settings 画面に access matrix 表示 | 要               |
| MT-02 | 4 capability 状態の card 切り替え  | 要 (x4)          |
| MT-03 | health row connected/disconnected  | 要 (x2)          |
| MT-04 | persistent launcher 全画面表示     | 要 (x3)          |
| MT-05 | 未認証時 guidance-only             | 要               |
| MT-06 | mobile responsive                  | 要 (x3 viewport) |

## 4. Phase 12 Spec Sync 観点

| Sync-ID | 対象仕様書             | 更新内容                                             |
| ------- | ---------------------- | ---------------------------------------------------- |
| S-01    | ui-ux-settings.md      | AccessMatrixSection の追加記録                       |
| S-02    | ui-ux-settings-core.md | capability cards / health row の契約追記             |
| S-03    | ui-ux-navigation.md    | TerminalLauncher persistent 配置の記録               |
| S-04    | task-workflow.md       | 本タスクの完了記録                                   |
| S-05    | LOGS.md (x2)           | aiworkflow-requirements + task-specification-creator |

## 5. Phase 3 へ渡す drift 検出ポイント

| Drift-ID | 検出対象                                                   | 検出方法                                                   |
| -------- | ---------------------------------------------------------- | ---------------------------------------------------------- |
| D-01     | execution-capability.ts と CapabilityCard の状態マッピング | 4状態の全組合せを contract-matrix.md と照合                |
| D-02     | CTA 契約と UI テキストの一致                               | resolveCtaContract() 出力と設計ドキュメントの label を比較 |
| D-03     | PUBLIC_UNAUTHENTICATED_VIEWS の不変                        | grep で変更有無を確認                                      |
| D-04     | AppLayout 変更の影響範囲                                   | git diff --stat で変更ファイル数を検証                     |
