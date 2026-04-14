# Phase 11: 手動テストチェックリスト

## メタ情報

| 項目       | 内容                     |
| ---------- | ------------------------ |
| タスクID   | TASK-SW-FIX-FEEDBACK-001 |
| テスト分類 | NON_VISUAL               |
| 実施日     | 2026-04-14               |

## チェックリスト

| TC-ID    | 観点                          | 実施内容                                                                                           | 証跡                                     | 結果 |
| -------- | ----------------------------- | -------------------------------------------------------------------------------------------------- | ---------------------------------------- | ---- |
| TC-11-01 | LLM success path              | `SkillLifecyclePanel.llm-generation.test.tsx` の U-8 で `fetchSkills` / `selectSkillByName` を確認 | `outputs/phase-11/manual-test-result.md` | PASS |
| TC-11-02 | terminal_handoff early return | U-13 で `fetchSkills` / `selectSkillByName` が呼ばれないことを確認                                 | `outputs/phase-11/manual-test-result.md` | PASS |
| TC-11-03 | skillPath=null error UI       | `CompleteStep.test.tsx` の TC-FEEDBACK-004/005 で error UI と success header 非表示を確認          | `outputs/phase-11/manual-test-result.md` | PASS |
| TC-11-04 | skillPath normal success UI   | `CompleteStep.test.tsx` の TC-FEEDBACK-006 で success UI を確認                                    | `outputs/phase-11/manual-test-result.md` | PASS |

## 備考

- docs-only タスクのため、UI screenshot は採取しない。
- validator 互換のため、`screenshot-plan.json` と `screenshots/non-visual-placeholder.png` を補助成果物として保持する。
