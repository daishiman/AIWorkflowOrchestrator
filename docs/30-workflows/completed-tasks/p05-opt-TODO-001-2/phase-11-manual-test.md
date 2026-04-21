# Phase 11: 手動テスト

## メタ情報

| 項目       | 内容                                 |
| ---------- | ------------------------------------ |
| Phase      | 11                                   |
| タスクID   | TASK-SW-TODO-001                     |
| 機能名     | conversation-round-step-todo-cleanup |
| taskType   | NON_VISUAL                           |
| 前提Phase  | Phase 10                             |
| 後続Phase  | Phase 12                             |
| 作成日     | 2026-04-20                           |
| ステータス | completed                            |

## 目的

NON_VISUAL task として、自動テスト・コード確認・履歴確認を主証跡にした manual verification を残す。

## 実行タスク

1. `manual-test-checklist.md` を作成する
2. `manual-test-result.md` に NON_VISUAL 理由、実施情報、仕様判断根拠、実行記録を集約する
3. `TASK-SW-TODO-001-manual-test-report.md` に `verify_existing` の diff 確認結果と回帰確認結果を記録する
4. `discovered-issues.md` に current / baseline を分離して記録する

## 参照資料

| 資料     | パス                                                                          | 用途                  |
| -------- | ----------------------------------------------------------------------------- | --------------------- |
| Phase 9  | `outputs/phase-9/quality-report.md`                                           | primary evidence 入力 |
| 対象実装 | `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx` | symbol 不在確認       |
| 関連実装 | `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`            | current contract 確認 |

## 統合テスト連携

| 判定項目                    | 基準 | 結果      |
| --------------------------- | ---- | --------- |
| NON_VISUAL 理由明記         | 完了 | completed |
| manual-test-report 作成     | 完了 | completed |
| checklist / discovered 作成 | 完了 | completed |

## 成果物

| 成果物                   | パス                                                      | 説明                               |
| ------------------------ | --------------------------------------------------------- | ---------------------------------- |
| 手動テストチェックリスト | `outputs/phase-11/manual-test-checklist.md`               | 確認項目                           |
| 手動テスト結果           | `outputs/phase-11/manual-test-result.md`                  | docs-only 正本                     |
| 手動テスト報告書         | `outputs/phase-11/TASK-SW-TODO-001-manual-test-report.md` | `verify_existing` primary evidence |
| 発見事項                 | `outputs/phase-11/discovered-issues.md`                   | 問題なし / baseline drift          |

## 完了条件

- [x] NON_VISUAL 理由を明記した
- [x] `manual-test-result.md` を作成した
- [x] `manual-test-checklist.md` を作成した
- [x] `TASK-SW-TODO-001-manual-test-report.md` を作成した
- [x] `discovered-issues.md` を作成した
- [x] 本 Phase 内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [x] 本 Phase 内の全タスクを100%実行完了
- [x] 成果物テーブル記載のファイルを全件生成
- [x] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [x] 実行記録を残した

## 次のPhase

Phase 12: ドキュメント更新
