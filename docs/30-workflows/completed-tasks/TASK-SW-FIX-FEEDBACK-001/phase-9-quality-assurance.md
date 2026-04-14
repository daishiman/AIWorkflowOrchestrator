# Phase 9: 品質保証

## メタ情報

| 項目       | 内容                     |
| ---------- | ------------------------ |
| Phase      | 9                        |
| Phase名    | 品質保証                 |
| タスクID   | TASK-SW-FIX-FEEDBACK-001 |
| 機能名     | TASK-SW-FIX-FEEDBACK-001 |
| 前提Phase  | Phase 8                  |
| 後続Phase  | Phase 10                 |
| 作成日     | 2026-04-14               |
| ステータス | pending                  |

## 目的

docs-only で整えた current facts と evidence が矛盾していないことを確認する。
ここではコード修正の品質保証ではなく、仕様書・証跡・ current contract の一致を品質ゲートとして扱う。

## 実行タスク

- Task 1: obsolete 語彙の除去確認
- Task 2: current facts / evidence の一致確認
- Task 3: manual / screenshot 影響の記録

## 参照資料

| 資料名         | パス                                                                                               | 用途               |
| -------------- | -------------------------------------------------------------------------------------------------- | ------------------ |
| current facts  | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`                               | current flow       |
| current facts  | `apps/desktop/src/renderer/components/skill/wizard/CompleteStep.tsx`                               | current contract   |
| 既存テスト     | `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx` | evidence           |
| 既存テスト     | `apps/desktop/src/renderer/components/skill/wizard/__tests__/CompleteStep.test.tsx`                | evidence           |
| Phase 7 成果物 | `outputs/phase-7/coverage-report.md`                                                               | カバレッジ結果     |
| Phase 8 成果物 | `outputs/phase-8/refactoring-record.md`                                                            | terminology 整流化 |

## 実行手順

### Task 1: obsolete 語彙の除去確認

```bash
rg -n --glob '!phase-9-quality-assurance.md' \
  "handleGenerateTemplate|template mode|fetchSkills failed after plan execution|LLMモードでのスキル生成完了後、スキル一覧が自動更新されない|成功ヘッダーが .* かかわらず" \
  docs/30-workflows/TASK-SW-FIX-FEEDBACK-001
```

- template mode 依存の記述が残っていないことを確認する
- 旧 bugfix 物語の断定文が残っていないことを確認する
- issue 8 の follow-up が current task に混入していないことを確認する

### Task 2: current facts / evidence の一致確認

| TC ID           | 確認内容                                                         | 結果    |
| --------------- | ---------------------------------------------------------------- | ------- |
| TC-FEEDBACK-001 | LLM success path で fetchSkills / selectSkillByName が続く       | pending |
| TC-FEEDBACK-002 | terminal_handoff で fetchSkills / selectSkillByName が呼ばれない | pending |
| TC-FEEDBACK-004 | skillPath=null で error UI が表示される                          | pending |
| TC-FEEDBACK-005 | skillPath=null で success header が表示されない                  | pending |
| TC-FEEDBACK-006 | skillPath normal で success UI が表示される                      | pending |

### Task 3: manual / screenshot 影響の記録

- docs-only のため、UI screenshot は CAPTURE_BLOCKED または N/A として記録できる
- current facts を証明する既存テストを代替 evidence として採用する
- follow-up で UI を変える場合のみ screenshot plan を再開する

## 統合テスト連携【必須】

| 判定項目                               | 基準                           | 結果    |
| -------------------------------------- | ------------------------------ | ------- |
| obsolete 語彙の残存                    | 0件                            | pending |
| current facts と evidence の一致       | PASS                           | pending |
| TC-FEEDBACK-001〜002 / 004〜006 の対応 | 5件PASS                        | pending |
| screenshot 影響記録                    | CAPTURE_BLOCKED / N/A 記録済み | pending |

## 品質ゲート判定テーブル

| ゲート項目         | コマンド / 確認                                                       | 基準          | 結果                                                                                 |
| ------------------ | --------------------------------------------------------------------- | ------------- | ------------------------------------------------------------------------------------ | --- | ------- |
| 語彙整合           | `rg -n --glob '!phase-9-quality-assurance.md' "handleGenerateTemplate | template mode | fetchSkills failed after plan execution" docs/30-workflows/TASK-SW-FIX-FEEDBACK-001` | 0件 | pending |
| evidence 整合      | current facts と既存テストの突合                                      | PASS          | pending                                                                              |
| スクリーンショット | CAPTURE_BLOCKED / N/A の記録                                          | 記録あり      | pending                                                                              |

## 成果物

| 成果物           | パス                                | 説明                                     |
| ---------------- | ----------------------------------- | ---------------------------------------- |
| 品質保証レポート | `outputs/phase-9/quality-report.md` | 語彙整合・evidence 整合・manual 影響記録 |

## 完了条件

- [ ] obsolete 語彙が docs から除去されている
- [ ] current facts と evidence の一致が確認されている
- [ ] TC-FEEDBACK-001〜002 / 004〜006 が current facts と対応している
- [ ] screenshot 影響が CAPTURE_BLOCKED / N/A として記録されている
- [ ] 品質ゲート総合判定が PASS
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 10: 最終レビューゲート
