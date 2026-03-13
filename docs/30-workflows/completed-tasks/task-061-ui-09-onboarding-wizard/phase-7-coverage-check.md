# Phase 7: Coverage Check

## メタ情報

| 項目         | 内容                 |
| ------------ | -------------------- |
| Phase        | 7                    |
| Phase名      | テストカバレッジ確認 |
| ステータス   | completed            |
| 作成日       | 2026-03-13           |
| 担当SubAgent | SubAgent-C           |

## 目的

task-061 の対象ファイルに絞った coverage を取得し、wizard と Settings 連携の主要分岐が十分に押さえられているか判定する。

## 実行タスク

- 対象限定 coverage 実行: onboarding 関連 test 4 本で v8 coverage を取得する
- 目標比較: statements、branches、functions、lines を gate と比較する
- file 単位確認: `OnboardingWizard` と `SettingsView` の値を個別に確認する
- 未捕捉箇所整理: App mock や store mock 由来の非計測部分を記録する

## 参照資料

| 参照資料             | パス                                        | 用途               |
| -------------------- | ------------------------------------------- | ------------------ |
| Phase 5 実装サマリー | `outputs/phase-5/implementation-summary.md` | 対象ファイルの確認 |
| カバレッジ目標       | `outputs/phase-7/coverage-target-report.md` | gate 定義          |
| カバレッジ結果       | `outputs/phase-7/coverage-gate-result.md`   | 判定結果           |
| テスト拡充計画       | `outputs/phase-6/test-expansion-plan.md`    | 対象範囲の根拠     |

## 統合テスト連携

| 観点                  | コマンド                    | 連携内容                             |
| --------------------- | --------------------------- | ------------------------------------ |
| task scope coverage   | `vitest --coverage`         | wizard / settings の測定値を取得する |
| branch guard          | `App.onboarding.test.tsx`   | 未完了 / 完了済み分岐の土台          |
| keyboard / completion | `OnboardingWizard.test.tsx` | functions と branch の主対象         |

## 成果物

- `outputs/phase-7/coverage-target-report.md`
- `outputs/phase-7/coverage-gate-result.md`

## 完了条件

- [x] task scope coverage の目標値が明文化されている
- [x] total coverage と file 単位 coverage が記録されている
- [x] 測定外の理由が mock 構成まで含めて明文化されている
