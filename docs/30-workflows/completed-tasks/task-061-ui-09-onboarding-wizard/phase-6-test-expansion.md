# Phase 6: Test Expansion

## メタ情報

| 項目         | 内容       |
| ------------ | ---------- |
| Phase        | 6          |
| Phase名      | テスト拡充 |
| ステータス   | completed  |
| 作成日       | 2026-03-13 |
| 担当SubAgent | SubAgent-A |

## 目的

Green を通した直後の実装へ境界ケースと回帰ケースを追加し、rerun、generic name、responsive 由来の後退を防ぐ。

## 実行タスク

- fallback 拡充: generic name と空文字の扱いを回帰ケースへ追加する
- shell 拡充: completed 済みと未完了の表示分岐を固定する
- keyboard 拡充: ESC close と focus trap の回帰を固定する
- screenshot seed 拡充: desktop、tablet、mobile、theme 差分の capture 条件を固定する

## 参照資料

| 参照資料       | パス                                        | 用途               |
| -------------- | ------------------------------------------- | ------------------ |
| テスト拡充計画 | `outputs/phase-6/test-expansion-plan.md`    | 境界ケース整理     |
| 回帰マトリクス | `outputs/phase-6/regression-matrix.md`      | 実装差分との紐付け |
| 実装サマリー   | `outputs/phase-5/implementation-summary.md` | 変更点の確認       |

## 統合テスト連携

| 観点               | 証跡                                             | 連携内容                                   |
| ------------------ | ------------------------------------------------ | ------------------------------------------ |
| generic fallback   | `DashboardView.test.tsx`                         | `"User"` / `"ユーザー"` / 空文字の除外条件 |
| rerun callback     | `SettingsView.test.tsx`                          | `onOpenOnboarding` 発火確認                |
| keyboard           | `OnboardingWizard.test.tsx`                      | ESC と Tab wrap                            |
| screenshot capture | `capture-task-061-onboarding-wizard-phase11.mjs` | 6 scenario の再現                          |

## 成果物

- `outputs/phase-6/test-expansion-plan.md`
- `outputs/phase-6/regression-matrix.md`

## 完了条件

- [x] 境界ケースが既存の targeted test へ反映されている
- [x] screenshot scenario が test expansion の観点と一致している
- [x] rerun と generic name の後退を防ぐ回帰条件が固定されている
