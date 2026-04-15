# Phase 7: カバレッジ確認

## メタ情報

| 項目       | 内容                                          |
| ---------- | --------------------------------------------- |
| Phase      | 7                                             |
| タスクID   | TASK-SW-FIX-FEEDBACK-008                      |
| 機能名     | `fetchSkills()` 非ブロッキング化（follow-up） |
| 前提Phase  | Phase 6                                       |
| 後続Phase  | Phase 8                                       |
| 作成日     | 2026-04-15                                    |
| ステータス | pending                                       |

## 目的

成功系、失敗系、ガード条件の分岐カバレッジを確認する。

## カバレッジ目標

| 指標              | 最低基準 |
| ----------------- | -------- |
| Line Coverage     | 80%      |
| Branch Coverage   | 70%      |
| Function Coverage | 80%      |

## 実行タスク

- [ ] カバレッジレポートを生成する
- [ ] `processWorkflowOutcome` の成功 / 失敗分岐を確認する
- [ ] `handleExecutePlan` の成功 / 失敗分岐を確認する
- [ ] `skillName` 有無の分岐を確認する
- [ ] 目標未達の場合は Phase 6 に戻す判断を記録する

## 統合テスト連携

| 接続点  | 確認内容                                         | 検証Phase |
| ------- | ------------------------------------------------ | --------- |
| Phase 5 | 実装した分岐が対象テストから到達できること       | Phase 7   |
| Phase 6 | 補強したエッジケースがカバレッジへ反映されること | Phase 7   |
| Phase 8 | リファクタ後もこの分岐網羅を維持すること         | Phase 8   |

## 完了条件

- [ ] カバレッジレポートが生成されている
- [ ] 成功 / 失敗 / ガード条件の分岐が確認されている
- [ ] 目標値達成の有無が記録されている
- [ ] 未達時の差し戻し判断が記録されている

## 成果物

- `outputs/phase-7/coverage-report.md`

## 参照資料

| 資料名             | パス                                                                                               |
| ------------------ | -------------------------------------------------------------------------------------------------- |
| Phase 5 成果物     | `outputs/phase-5/implementation-record.md`                                                         |
| Phase 6 成果物     | `outputs/phase-6/extended-test-record.md`                                                          |
| テスト対象ファイル | `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx` |
