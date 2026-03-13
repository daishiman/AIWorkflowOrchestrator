# Phase 4 テスト仕様書

## 目的

task-061 の機能要件（FR-01〜FR-10）・受け入れ基準（AC-1〜AC-26）を component、integration、manual の 3 レーンへ分割し、Red-first で確認する順序を固定する。Phase 3 MINOR 指摘（M-01: `system` テーマ初期状態、M-02: bubble 未選択時の完了ブロック）をテストケースに明示的に反映する。

## テスト対象

| レーン          | 対象                                          | 主な根拠                                                                                                    |
| --------------- | --------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Component       | `OnboardingWizard`                            | step 遷移、payload 検証、focus trap、ESC close、generic name 正規化、エラーハンドリング、allowDismiss=false |
| Integration     | `App.tsx`, `SettingsView`, `useDisplayName()` | overlay 表示条件、rerun action、`hasCompleted` 不変性、Dashboard greeting                                   |
| Manual / Visual | screenshot harness                            | theme、responsive、completion 画面、Apple HIG review                                                        |

## テスト戦略

| 優先度 | 観点                                                     | 根拠                       | 判定方法                    |
| ------ | -------------------------------------------------------- | -------------------------- | --------------------------- |
| P1     | `handleCompleteOnboarding` が `updateUserProfile` を呼ぶ | Phase 3 Review Gate 条件 2 | `App.onboarding.test.tsx`   |
| P1     | 未完了時のみ overlay を表示する                          | FR-01 / AC-1               | `App.onboarding.test.tsx`   |
| P1     | wizard 完了 payload が全フィールド正しい                 | FR-08 / AC-18              | `OnboardingWizard.test.tsx` |
| P1     | Settings から再表示 action を起動できる                  | FR-10 / AC-3               | `SettingsView.test.tsx`     |
| P1     | Settings 再表示で `hasCompleted` が書き換わらない        | Phase 3 Review Gate 条件 3 | `App.onboarding.test.tsx`   |
| P1     | generic display name を greeting へ流さない              | FR-02 / AC-7               | `DashboardView.test.tsx`    |
| P1     | bubble 未選択時は「次へ」が無効（M-02）                  | FR-04 / AC-9               | `OnboardingWizard.test.tsx` |
| P1     | `system` テーマ初期状態の選択シナリオ（M-01）            | FR-07 / AC-15              | `OnboardingWizard.test.tsx` |
| P2     | keyboard / focus trap                                    | NFR-04 / AC-22-24          | `OnboardingWizard.test.tsx` |
| P2     | allowDismiss=false で ESC・閉じるボタンが表示されない    | FR-10 補足 / AC-24         | `OnboardingWizard.test.tsx` |
| P2     | onComplete reject 時にエラーメッセージを表示             | 実装観察                   | `OnboardingWizard.test.tsx` |
| P2     | 完了サマリー画面の表示内容（3カード）                    | FR-09 / AC-20              | `OnboardingWizard.test.tsx` |
| P2     | 戻るボタンの動作（Step 遷移の後退）                      | 実装観察                   | `OnboardingWizard.test.tsx` |
| P2     | theme preview / completion visual                        | Phase 11 screenshot        | 手動確認                    |

## テストファイル

| ファイル                                                                                    | 役割                                                                               |
| ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `apps/desktop/src/renderer/components/organisms/OnboardingWizard/OnboardingWizard.test.tsx` | wizard 単体動作（step 遷移・payload・focus trap・ESC・generic name・M-01/M-02 等） |
| `apps/desktop/src/renderer/App.onboarding.test.tsx`                                         | shell overlay 統合（表示条件・updateUserProfile・hasCompleted 不変性）             |
| `apps/desktop/src/renderer/views/SettingsView/SettingsView.test.tsx`                        | rerun action                                                                       |
| `apps/desktop/src/renderer/views/DashboardView/DashboardView.test.tsx`                      | greeting fallback                                                                  |

## カバレッジマトリクス

FR/AC に対してどの TC がカバーするかを示す。

| 要件                | AC                  | 対応 TC-ID                   |
| ------------------- | ------------------- | ---------------------------- |
| FR-01               | AC-1, AC-2          | AT-04-01, AT-04-02           |
| FR-02               | AC-4, AC-6          | AT-04-03, AT-04-10           |
| FR-03               | AC-5                | AT-04-11                     |
| FR-04（M-02）       | AC-8, AC-9          | AT-04-12, AT-04-13           |
| FR-05               | AC-10, AC-11        | AT-04-04（内包）             |
| FR-06               | AC-12, AC-13, AC-14 | AT-04-04, AT-04-14           |
| FR-07（M-01）       | AC-15, AC-16        | AT-04-15, AT-04-16           |
| FR-08               | AC-17, AC-18, AC-19 | AT-04-04, AT-04-17, AT-04-18 |
| FR-09               | AC-20, AC-21        | AT-04-04（内包）, AT-04-19   |
| FR-10               | AC-3                | AT-04-06, AT-04-20           |
| NFR-04              | AC-22, AC-23, AC-24 | AT-04-05, AT-04-21, AT-04-22 |
| generic name 正規化 | AC-7                | AT-04-07, AT-04-08, AT-04-09 |
| エラーハンドリング  | —                   | AT-04-23                     |
| allowDismiss=false  | AC-24 補足          | AT-04-24                     |
| 戻るボタン          | —                   | AT-04-25                     |

## 完了基準

- P1 の観点がすべて test file に割り当てられている
- M-01（`system` テーマ）・M-02（bubble 未選択ブロック）の対応 TC が存在する
- Phase 3 Review Gate の 3 条件（updateUserProfile・hasCompleted 不変性・system テーマ）に対応する TC が存在する
- manual screenshot TC が Phase 11 と一致している
- カバレッジマトリクスに空欄の FR/AC が存在しない
