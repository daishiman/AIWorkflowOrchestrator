# Phase 10: 最終レビュー

## メタ情報

| 項目   | 値                                   |
| ------ | ------------------------------------ |
| Phase  | 10                                   |
| 機能名 | verify-and-improve-lifecycle-surface |
| 作成日 | 2026-03-26                           |

## 目的

Task06 の仕様が Phase 5-9 の前提を満たし、Task07 / Task08 へ残す論点が明確な状態で最終 gate を通せるか判定する。

## 実行タスク

- AC-1 から AC-6 の達成可否を判定する
- sibling task との境界を最終確認する
- Phase 11 / 12 へ渡す確認項目を固定する

## 参照資料

| 資料名       | パス                            | 説明            |
| ------------ | ------------------------------- | --------------- |
| Phase 1 要件 | `phase-1-requirements.md`       | AC 一覧         |
| Phase 2 設計 | `phase-2-design.md`             | topology と DTO |
| Phase 9 QA   | `phase-9-quality-assurance.md`  | QA 観点         |
| qa summary   | `outputs/phase-9/qa-summary.md` | QA 結果         |

## 実行手順

### ステップ1: AC 判定を行う

- AC-1 verify / improve 分離
- AC-2 provenance 表示
- AC-3 status / nextAction
- AC-4 apply / re-verify
- AC-5 Task05 境界
- AC-6 handoff 境界

### ステップ2: 後続へ引き継ぐ論点を固定する

- Task07 へ verify fail 時の governance copy
- Task08 へ verify result と session compatibility の関係

## 統合テスト連携

- Phase 9 QA の結果と test matrix を照合し、AC 判定の根拠を固める
- Phase 11 manual test の確認項目へ integrated_api / terminal_handoff の両 lane を渡す

## 成果物

| 成果物               | パス                                       | 説明      |
| -------------------- | ------------------------------------------ | --------- |
| 最終レビュー仕様     | `phase-10-final-review.md`                 | 最終 gate |
| final review summary | `outputs/phase-10/final-review-summary.md` | 判定要約  |

## 完了条件

- [ ] AC-1 から AC-6 の判定基準が揃っている
- [ ] Task07 / Task08 へ渡す論点が明記されている
- [ ] **本Phase内の全タスクを100%実行完了**
