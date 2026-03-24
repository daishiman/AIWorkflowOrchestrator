# Chat / Workspace Guidance の openTerminal 二次CTA実装タスク

| 項目         | 値                                                                 |
| ------------ | ------------------------------------------------------------------ |
| タスクID     | UT-IMP-CHAT-WORKSPACE-GUIDANCE-OPEN-TERMINAL-001                   |
| 優先度       | 中                                                                 |
| 依存         | TASK-IMP-TERMINAL-HANDOFF-SURFACE-REALIZATION-001 の launcher 契約 |
| 関連タスク   | TASK-IMP-CHAT-WORKSPACE-GUIDANCE-ACTION-WIRING-001（Phase 3 M-01） |
| issue_number | 1450                                                               |

---

## 目的

shared guidance mapping に定義済みの secondary CTA `open-terminal` を、ChatView / WorkspaceView で実際に操作可能な導線として成立させる。

---

## 背景

- `modelSelectionGuidance.ts` では secondaryAction として `ターミナルを開く` が定義済み
- しかし current implementation は `openTerminal` handler を未注入のままにしており、DOM には表示されない
- このままだと spec 上は secondary CTA があるのに、実 UI では hidden という drift が残る

---

## 実行手順

1. Task05 の terminal launcher 契約と current handler 実装を確認する
2. `createGuidanceActionDispatcher()` に注入する `openTerminal` handler を用意する
3. ChatView / WorkspaceView で secondary CTA が必要な state のみボタンを描画する
4. CTA クリックで terminal launcher または manual handoff surface が開くことを確認する
5. unit / integration / manual screenshot を更新する

---

## 完了条件

- [ ] `open-terminal` secondary CTA が少なくとも1つの guidance state で実表示される
- [ ] CTA クリックで no-op ではなく terminal 導線へ遷移する
- [ ] ChatView / WorkspaceView で同じラベル・同じ挙動になる
- [ ] 関連テストと screenshot evidence が更新される

---

## 参照

- `apps/desktop/src/renderer/guidance/modelSelectionGuidance.ts`
- `apps/desktop/src/renderer/views/ChatView/LLMGuidanceBanner.tsx`
- `apps/desktop/src/renderer/views/WorkspaceView/WorkspaceChatPanel.tsx`
- `docs/30-workflows/step-03-par-task-04-chat-workspace-guidance-action-wiring/outputs/phase-11/discovered-issues.md`

---

## 解消記録

| 項目       | 内容                                                                                                                            |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------- |
| 解消日     | 2026-03-24                                                                                                                      |
| 解消タスク | TASK-IMP-GUIDED-EXECUTION-SHELL-FOUNDATION-001                                                                                  |
| 解消方法   | LLMGuidanceBanner / WorkspaceChatPanel の secondary CTA を `openExecutionConsole()` via `createGuidanceActionDispatcher` に配線 |
| ステータス | **解消済み**                                                                                                                    |
