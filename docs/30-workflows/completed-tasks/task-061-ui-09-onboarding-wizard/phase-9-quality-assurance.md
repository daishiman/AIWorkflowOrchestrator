# Phase 9: Quality Assurance

## メタ情報

| 項目         | 内容       |
| ------------ | ---------- |
| Phase        | 9          |
| Phase名      | 品質保証   |
| ステータス   | completed  |
| 作成日       | 2026-03-13 |
| 担当SubAgent | SubAgent-D |

## 目的

実装の品質を typecheck、targeted lint、build、keyboard、theme、responsive の観点で横断確認し、Phase 10 の最終判定へ渡す。

## 実行タスク

- static quality 実行: typecheck、targeted lint、build を実行する
- interaction quality 確認: keyboard、focus trap、close 条件を確認する
- visual quality 確認: light、dark、kanagawa の screenshot を確認する
- persistence quality 確認: 保存キーと user profile 更新を確認する

## 参照資料

| 参照資料           | パス                                               | 用途                        |
| ------------------ | -------------------------------------------------- | --------------------------- |
| 品質チェックリスト | `outputs/phase-9/quality-checklist.md`             | 実行結果                    |
| a11y 検証計画      | `outputs/phase-9/accessibility-validation-plan.md` | keyboard / focus / contrast |
| 実装サマリー       | `outputs/phase-5/implementation-summary.md`        | 変更点確認                  |

## 統合テスト連携

| 観点      | コマンド / 証跡                                 | 連携内容                             |
| --------- | ----------------------------------------------- | ------------------------------------ |
| typecheck | `pnpm --filter @repo/desktop exec tsc --noEmit` | 型安全性の確認                       |
| lint      | `pnpm --filter @repo/desktop exec eslint ...`   | 変更ファイルの静的確認               |
| build     | `pnpm --filter @repo/desktop build`             | screenshot harness を含む build 確認 |
| keyboard  | `OnboardingWizard.test.tsx`                     | ESC と focus trap                    |

## 成果物

- `outputs/phase-9/quality-checklist.md`
- `outputs/phase-9/accessibility-validation-plan.md`

## 完了条件

- [x] typecheck、lint、build の結果が文書化されている
- [x] keyboard、focus、responsive、theme の観点が揃っている
- [x] Phase 11 へ渡す visual review 観点が固定されている
