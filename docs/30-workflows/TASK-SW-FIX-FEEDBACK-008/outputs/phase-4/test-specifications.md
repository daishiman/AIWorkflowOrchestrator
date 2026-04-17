# Phase 4 成果物: テスト仕様書

## メタ情報

| 項目       | 内容                     |
| ---------- | ------------------------ |
| タスクID   | TASK-SW-FIX-FEEDBACK-008 |
| 作成日     | 2026-04-15               |
| ステータス | completed                |

## 追加テスト一覧

| テストID | describe ブロック                                                          | 内容                                                                                     | 対応 AC     | 状態 |
| -------- | -------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ----------- | ---- |
| U-NEW-1  | `U-NEW-1: processWorkflowOutcome handles fetchSkills failure`              | ACK 経由 snapshot 後に fetchSkills reject しても selectSkillByName が呼ばれる            | AC-1        | PASS |
| U-NEW-2  | `U-NEW-2: handleExecutePlan handles fetchSkills failure`                   | direct path で fetchSkills reject しても selectSkillByName が呼ばれる                    | AC-2        | PASS |
| U-NEW-3  | `U-NEW-3: fetchSkills failure does not set generationError`                | processWorkflowOutcome 経由で fetchSkills reject しても generationError がセットされない | AC-3        | PASS |
| U-NEW-4  | `U-NEW-4: skillName guard prevents selection`                              | skillName なし → selectSkillByName は呼ばれない                                          | ガード条件  | PASS |
| U-NEW-5  | `U-NEW-5: fetchSkills success maintains existing flow`                     | fetchSkills 成功時も既存フローが維持される                                               | AC-4        | PASS |
| U-NEW-6  | `U-NEW-6: fetchSkills failure with no skillName has no extra side effects` | fetchSkills reject かつ skillName なし → 副作用増加なし                                  | AC-3+ガード | PASS |

## 既存回帰確認

| テストID  | 期待値                                                               | 状態 |
| --------- | -------------------------------------------------------------------- | ---- |
| U-8 (1st) | 成功時に fetchSkills と selectSkillByName が継続して呼ばれる         | PASS |
| U-8 (2nd) | fetchSkills reject でも selectSkillByName 継続・generationError なし | PASS |
| U-13      | terminal_handoff では fetchSkills を呼ばない                         | PASS |

## テストファイル

`apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx`
