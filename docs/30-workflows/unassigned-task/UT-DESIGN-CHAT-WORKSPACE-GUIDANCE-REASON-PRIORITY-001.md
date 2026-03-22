# Chat / Workspace Guidance の blocked reason 優先度設計タスク

| 項目         | 値                                                                 |
| ------------ | ------------------------------------------------------------------ |
| タスクID     | UT-DESIGN-CHAT-WORKSPACE-GUIDANCE-REASON-PRIORITY-001              |
| 優先度       | 中                                                                 |
| 依存         | blocked reason の全列挙と health / auth / runtime 状態語彙の棚卸し |
| 関連タスク   | TASK-IMP-CHAT-WORKSPACE-GUIDANCE-ACTION-WIRING-001（Phase 3 M-04） |
| issue_number | 1453                                                               |

---

## 目的

複数の blocked reason が同時に成立した場合の優先度ルールを定義し、ChatView / WorkspaceView が常に同じ理由と CTA を表示するようにする。

---

## 背景

- current helper `deriveModelSelectionBlockedReason()` は `NO_PROVIDER` / `NO_MODEL` のみを順に判定している
- 今後 health / auth / policy violation などが加わると、どの理由を優先表示するかが曖昧になる
- 優先度規則がないと surface ごとに別ロジックが再発し、Task04 の主目的に反する

---

## 実行手順

1. blocked / error / handoff reason の候補を全列挙する
2. 同時成立しうる組み合わせを洗い出す
3. severity、解決可能性、ユーザー影響の観点で優先度ルールを設計する
4. shared helper / shared test matrix に落とし込む
5. system spec と lessons learned へ反映する

---

## 完了条件

- [ ] reason priority の決定表が作成されている
- [ ] Chat / Workspace / 将来の consumer が同じ helper を参照する
- [ ] 複数 reason 同時成立ケースのテストが追加されている
- [ ] system spec / workflow / lessons に priority rule が記録されている

---

## 参照

- `apps/desktop/src/renderer/guidance/modelSelectionGuidance.ts`
- `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components-details.md`
- `.claude/skills/aiworkflow-requirements/references/arch-state-management-core.md`
- `docs/30-workflows/step-03-par-task-04-chat-workspace-guidance-action-wiring/outputs/phase-3/design-review-report.md`
