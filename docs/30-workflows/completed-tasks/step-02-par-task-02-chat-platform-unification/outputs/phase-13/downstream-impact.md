# Downstream Impact

## 主対象

- Task02 自体は `completed-tasks/step-02-par-task-02-chat-platform-unification/` 配下へ移管済みで、Phase 13 によりコミット・PR・CI まで閉じる

## 後続タスクへの影響

| 対象                                                            | 影響                                                                                         | 対応                                                                |
| --------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `step-02-par-task-03-skill-creator-execute-improve-integration` | Chat platform 統合済み前提で Skill Creator の handoff / execution surface 分離を再利用できる | Task03 側は設計参照先を completed task パスへ合わせる               |
| `UT-IMP-CHAT-PLATFORM-HANDOFF-REVIVE-GUARD-001` (`#1163`)       | handoff と revive の複合回帰ガードは follow-up へ分離                                        | 本 PR では issue だけ同期し、実装は別タスクで継続                   |
| `aiworkflow-requirements`                                       | Chat platform の最新契約が canonical spec になる                                             | 今後の chat / workspace / skill 系タスクはこの正本を起点にする      |
| `task-specification-creator` / `skill-creator`                  | Phase 12 再監査と skill 更新の短手順を再利用できる                                           | 今後の completed task でも同じ Phase 12 / 13 closing pattern を使う |

## レビュー観点

- `WorkspaceView` が独自会話 state を持たず、handoff だけを担っていること
- `SkillCenterView` から `skill-lifecycle` mode へ context が一方向で渡ること
- `chatSlice` の persist / revive で `Date` 型復元と non-persist state 非保持が両立していること
- system spec / task spec / issue / unassigned-task / mirror が同一内容で同期していること

## リスクと緩和

- リスク: Handoff と revive の複合回帰が今後の entry surface 追加時に再発する
- 緩和: follow-up issue `#1163` を未タスクとして formalize 済み

- リスク: canonical spec と `.agents` mirror の乖離
- 緩和: `.claude` → `.agents` の同期と `diff -qr` 確認を継続

- リスク: UI 変更の証跡が stale になる
- 緩和: Phase 11 screenshot coverage を PR 本文とコメントへ直接連携する
