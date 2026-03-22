# Chat / Workspace Guidance の retryConnection IPC 契約追加タスク

| 項目         | 値                                                                 |
| ------------ | ------------------------------------------------------------------ |
| タスクID     | UT-IMP-CHAT-WORKSPACE-GUIDANCE-RETRY-CONNECTION-IPC-001            |
| 優先度       | 中                                                                 |
| 依存         | health / connection check IPC の current contract 整理             |
| 関連タスク   | TASK-IMP-CHAT-WORKSPACE-GUIDANCE-ACTION-WIRING-001（Phase 3 M-02） |
| issue_number | 1451                                                               |

---

## 目的

guidance action type `retry-connection` を実行可能にするため、Main-Renderer 間の IPC 契約と UI wiring を追加する。

---

## 背景

- guidance dispatcher は `retry-connection` action type を保持している
- しかし current repo には retry 用の IPC handler / preload API / UI wiring が存在しない
- 接続回復導線を追加しないと、network / health failure 時に settings 遷移しか解決策がなく、reason-to-action mapping が痩せる

---

## 実行手順

1. `llm:check-health` など既存の health 契約を棚卸しする
2. retry 実行に必要な Main handler / preload API / shared type を定義する
3. guidance dispatcher へ `retryConnection` handler を注入する
4. retry 実行中 / 成功 / 失敗の UI state を設計する
5. unit / integration / manual walkthrough を追加する

---

## 完了条件

- [ ] retry 用 IPC 契約が shared type / preload / main handler まで一貫して定義される
- [ ] guidance から `retry-connection` action を実行できる
- [ ] retry 成否が UI に反映される
- [ ] テストと system spec が更新される

---

## 参照

- `apps/desktop/src/renderer/guidance/modelSelectionGuidance.ts`
- `.claude/skills/aiworkflow-requirements/references/api-ipc-system-core.md`
- `.claude/skills/aiworkflow-requirements/references/interfaces-llm.md`
- `docs/30-workflows/step-03-par-task-04-chat-workspace-guidance-action-wiring/outputs/phase-3/design-review-report.md`
