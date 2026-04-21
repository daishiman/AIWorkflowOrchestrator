# Phase 9: 品質保証

## メタ情報

| 項目       | 内容                                    |
| ---------- | --------------------------------------- |
| Phase      | 9                                       |
| タスクID   | TASK-RALLY-001                          |
| 機能名     | skill-lifecycle-panel-dead-code-removal |
| 前提Phase  | Phase 8                                 |
| 後続Phase  | Phase 10                                |
| 作成日     | 2026-04-21                              |
| ステータス | pending                                 |

## 目的

実装全体の品質を確認し、Phase 10（最終レビューゲート）に進める状態かを判断する。

## 品質チェックリスト

### コード品質

- [ ] `pnpm --filter @repo/desktop typecheck` がエラーなしで通過する
- [ ] `pnpm --filter @repo/desktop lint` がエラーなしで通過する
- [ ] `grep -rn "_handleSubmitWorkflowInput" apps/ packages/` の結果が空である
- [ ] `grep -rn "selectedOptionId\|textAnswer\|secretAnswer\|confirmAnswer" apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx` の結果が空である

### テスト品質

- [ ] 全既存テストが通過している
- [ ] カバレッジが削除前以上である

### 設計整合性

- [ ] dead code 削除が SkillLifecyclePanel 以外に影響を与えていないことを確認した
- [ ] 後続タスク（RALLY-005）が参照するコードに影響がないことを確認した

## リスク台帳

| リスク                        | 発生確率 | 影響度 | 対処状況                         |
| ----------------------------- | -------- | ------ | -------------------------------- |
| 削除対象の外部参照見落とし    | 低       | 高     | Phase 1 grep で確認済み          |
| テストコードの dead code 参照 | 低       | 中     | Phase 4 で確認済み               |
| 後続タスクへの影響            | 低       | 中     | Phase 8 責務境界マップで確認済み |

## 参照資料

| 資料名               | パス                                        | 用途           |
| -------------------- | ------------------------------------------- | -------------- |
| 実装サマリー         | `outputs/phase-5/implementation-summary.md` | Phase 5 成果物 |
| 回帰テスト結果       | `outputs/phase-6/regression-test-result.md` | Phase 6 成果物 |
| カバレッジ確認結果   | `outputs/phase-7/coverage-check-result.md`  | Phase 7 成果物 |
| リファクタリング計画 | `outputs/phase-8/refactoring-plan.md`       | Phase 8 成果物 |

## 成果物

| 成果物         | パス                                   | 説明                       |
| -------------- | -------------------------------------- | -------------------------- |
| 品質レポート   | `outputs/phase-9/quality-report.md`    | 品質チェック結果のサマリー |
| リスク台帳     | `outputs/phase-9/risk-register.md`     | リスク評価と対処状況       |
| 因果ループ監査 | `outputs/phase-9/causal-loop-check.md` | 削除による連鎖影響の確認   |

## 完了条件

- [ ] 品質チェックリストを全項目確認した
- [ ] リスク台帳を更新した
- [ ] 成果物テーブル記載のファイルを全件生成した

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成

## 次のPhase

Phase 10: 最終レビューゲート
