# Phase 7: カバレッジ確認

## メタ情報

| 項目     | 値                         |
| -------- | -------------------------- |
| Phase    | 7                          |
| タスクID | TASK-SC-03-PLAN-LLM-PROMPT |
| 作成日   | 2026-03-22                 |

## 目的

plan() の全分岐（integrated_api / terminal_handoff / エラー系）のカバレッジ基準充足を計測・確認する。未達の場合は Phase 6 へ戻る。

## 実行タスク

1. **カバレッジ計測実行**
   - `pnpm --filter @repo/desktop exec vitest run --coverage src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.plan.test.ts` を実行する
2. **基準確認**
   - Line Coverage ≥ 80%（推奨 90%）
   - Branch Coverage ≥ 60%（推奨 70%）
   - Function Coverage ≥ 80%（推奨 90%）
3. **分岐網羅確認**
   - integrated_api パス（LLM 呼び出し → パース → Result.ok）が網羅されているか
   - terminal_handoff パス（LLM 非呼び出し → 従来レスポンス）が網羅されているか
   - エラーパス（パースエラー・ローダーエラー・APIエラー）が網羅されているか
4. **未達時の対処**
   - 未達分岐を特定し、Phase 6 へ戻りテストを追加する

## 参照資料

- `phase-06-test-coverage.md`
- `.claude/rules/02-code-quality.md`（カバレッジ基準）

## 成果物

- カバレッジレポート（コンソール出力またはスクリーンショット）
- `phase-07-coverage-output.md`（基準充足の記録）

## 完了条件

- [ ] Line Coverage ≥ 80% を達成した
- [ ] Branch Coverage ≥ 60% を達成した
- [ ] Function Coverage ≥ 80% を達成した
- [ ] 3つの主要分岐（integrated_api / terminal_handoff / エラー）が全て網羅されている
- [ ] 未達の場合は Phase 6 へ戻りテストを追加した

## 次のPhase

Phase 8: リファクタリング
