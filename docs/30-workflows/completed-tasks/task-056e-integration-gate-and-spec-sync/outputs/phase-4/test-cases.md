# Phase 4 テストケース

| TC-ID     | 観点          | 入力 / 状況                                                                    | 期待結果                  | FAIL 時戻り先 |
| --------- | ------------- | ------------------------------------------------------------------------------ | ------------------------- | ------------- |
| TC-04-001 | Gate          | 5軸すべてに証跡がある                                                          | PASS                      | -             |
| TC-04-002 | Gate          | 5軸のうち表記ゆれのみが残る                                                    | MINOR                     | Phase 2       |
| TC-04-003 | Gate          | 上流正本1件でも欠落する                                                        | MAJOR                     | Phase 1       |
| TC-04-004 | Sync          | `task-workflow.md` / `lessons-learned.md` / `LOGS.md` が常時更新対象に含まれる | PASS                      | Phase 2       |
| TC-04-005 | Sync          | 条件付き更新対象に判断条件がある                                               | PASS                      | Phase 2       |
| TC-04-006 | Sync          | 更新不要対象が理由付きで列挙される                                             | PASS                      | Phase 2       |
| TC-04-007 | Handoff       | `TASK-UI-02` 向け nav/state 条件がある                                         | PASS                      | Phase 2       |
| TC-04-008 | Handoff       | `TASK-UI-03` 向け ipc/security 条件がある                                      | PASS                      | Phase 2       |
| TC-04-009 | Handoff       | `TASK-UI-04A` 向け workspace/nav 条件がある                                    | PASS                      | Phase 2       |
| TC-04-010 | Path          | current/completed/parent path が混在する                                       | FAIL として回帰対象へ登録 | Phase 6       |
| TC-04-011 | Documentation | `spec_created` 反映フローが定義される                                          | PASS                      | Phase 12      |
| TC-04-012 | Documentation | 未タスク検出と `verify-unassigned-links.js` の分岐が定義される                 | PASS                      | Phase 12      |
