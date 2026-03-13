# Phase 4: Test Creation

## メタ情報

| 項目         | 内容       |
| ------------ | ---------- |
| Phase        | 4          |
| Phase名      | テスト作成 |
| ステータス   | completed  |
| 作成日       | 2026-03-13 |
| 担当SubAgent | SubAgent-A |

## 目的

設計で固定した表示条件、step 遷移、保存処理、Settings 再表示導線を Red-first でテストケース化し、実装順序を固定する。

## 実行タスク

- component test 設計: `OnboardingWizard` の step 遷移と完了 payload を定義する
- integration test 設計: `App.tsx` の表示条件と `SettingsView` 導線を定義する
- regression test 設計: `useDisplayName()` fallback の回帰ケースを定義する
- manual seed 設計: Phase 11 の screenshot TC を wizard step 単位で定義する

## 参照資料

| 参照資料           | パス                                         | 用途                           |
| ------------------ | -------------------------------------------- | ------------------------------ |
| Phase 1 要件       | `outputs/phase-1/requirements-definition.md` | FR の確認                      |
| Phase 2 状態設計   | `outputs/phase-2/state-ipc-design.md`        | persist key と fallback の確認 |
| テスト仕様書       | `outputs/phase-4/test-specification.md`      | テスト戦略                     |
| テストケース一覧   | `outputs/phase-4/test-cases.md`              | TC-ID と根拠                   |
| 設計レビューゲート | `outputs/phase-3/review-gate.md`             | 優先順の根拠                   |

## 統合テスト連携

| 観点              | テストファイル              | 連携内容                                        |
| ----------------- | --------------------------- | ----------------------------------------------- |
| step 遷移         | `OnboardingWizard.test.tsx` | 名前入力、bubble 選択、theme 選択、完了 payload |
| overlay 表示条件  | `App.onboarding.test.tsx`   | 未完了 / 完了済みの分岐                         |
| Settings 再表示   | `SettingsView.test.tsx`     | header button の存在と callback                 |
| greeting fallback | `DashboardView.test.tsx`    | `userProfile.name` の fallback                  |

## 成果物

- `outputs/phase-4/test-specification.md`
- `outputs/phase-4/test-cases.md`

## 完了条件

- [x] FR 単位で unit / integration / manual の責務が割り当てられている
- [x] wizard 固有 UI と App 統合 UI のテスト境界が分離されている
- [x] Phase 11 screenshot TC が Phase 4 の時点で固定されている
