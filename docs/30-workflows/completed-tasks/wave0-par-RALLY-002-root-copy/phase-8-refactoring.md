# Phase 8: リファクタリング

## メタ情報

| 項目       | 内容                                   |
| ---------- | -------------------------------------- |
| Phase      | 8                                      |
| タスクID   | TASK-RALLY-002                         |
| 機能名     | restored-pending-request-clarification |
| タスク名   | restoredPendingRequest合成ルール明確化 |
| 前提Phase  | Phase 7                                |
| 後続Phase  | Phase 9                                |
| 作成日     | 2026-04-21                             |
| ステータス | pending                                |
| 実装モード | verify_existing                        |

## 目的

RALLY-002 で必要な改善がコード変更か文書変更かを再判定し、過剰修正を避ける。本タスクでは「コメント追加・型整理を行うべきか」を評価するが、実コードに差分が不要なら no-op を正解として扱う。

## 実行タスク

1. `ConversationalInterview.tsx` の未コミット差分有無を確認する。
2. コメント追加や型整理が本当に必要かを判定する。
3. 判定結果を refactoring log と rationale table に記録する。

## 参照資料

| 資料名       | パス                                                                                     | 用途         |
| ------------ | ---------------------------------------------------------------------------------------- | ------------ |
| 対象コード   | `apps/desktop/src/renderer/components/skill/ConversationalInterview.tsx`                 | 実差分確認   |
| 上流分析書   | `docs/30-workflows/completed-tasks/00-task-spec-design-docs-2/rally-phase-1-analysis.md` | 問題起点     |
| レビュー資料 | `docs/30-workflows/completed-tasks/00-task-spec-design-docs-2/rally-phase-3-review.md`   | コメント意図 |

## 実行手順

1. `git diff -- apps/desktop/src/renderer/components/skill/ConversationalInterview.tsx` を確認する。
2. no-op / 軽微修正 / 要再設計 のいずれかを判定する。
3. 判定結果を outputs へ記録する。

## 統合テスト連携

- no-op でも `typecheck` と `eslint` の結果は evidence として引き継ぐ。
- 実コード差分がないなら、新規リファクタは実施しない。

## 成果物

- `outputs/phase-8/refactoring-log.md`
- `outputs/phase-8/change-rationale-table.md`

## 完了条件

- [ ] 実コード差分の有無を確認した
- [ ] no-op/軽微修正の判断を記録した
- [ ] 理由を outputs に残した

## タスク100%実行確認【必須】

- [ ] Phase 8 の2成果物を作成した
- [ ] verify_existing に反する過剰修正を行っていない

## 次のPhase

Phase 9: 品質保証
