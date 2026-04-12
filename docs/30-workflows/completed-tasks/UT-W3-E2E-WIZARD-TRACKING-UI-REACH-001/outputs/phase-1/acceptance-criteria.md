# AC-1〜AC-9 受入条件詳細一覧

## タスクID: UT-W3-E2E-WIZARD-TRACKING-UI-REACH-001

| AC番号 | 内容                                                                                                      | 対応 TC  | 対象 trackEvent                                         |
| ------ | --------------------------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------- |
| AC-1   | E2E で InfoStep 完了 → ConversationRoundStep 遷移の確認                                                   | TC-03    | `skill_wizard_step1_completed`                          |
| AC-2   | E2E で CompleteStep「👍（satisfied）」後に `skill_skeleton_quality_feedback` 発火                         | TC-05    | `skill_skeleton_quality_feedback { satisfied: true }`   |
| AC-3   | E2E で CompleteStep「👎（unsatisfied）」後に `skill_skeleton_quality_feedback` 発火                       | TC-06    | `skill_skeleton_quality_feedback { satisfied: false }`  |
| AC-4   | E2E で `complete-step-action-execute` クリック後に `skill_wizard_next_action(execute)` 発火               | TC-08    | `skill_wizard_next_action { action: "execute" }`        |
| AC-5   | E2E で `complete-step-action-open-editor` クリック後に `skill_wizard_next_action(open_editor)` 発火       | TC-09    | `skill_wizard_next_action { action: "open_editor" }`    |
| AC-6   | E2E で `complete-step-action-create-another` クリック後に `skill_wizard_next_action(create_another)` 発火 | TC-11    | `skill_wizard_next_action { action: "create_another" }` |
| AC-7   | E2E で「もう一度作成」後にウィザードが InfoStep に戻ることの確認                                          | TC-12    | UI 遷移確認                                             |
| AC-8   | `trackEvent` の E2E スタブが本番の `trackEvent.ts` と型整合していること                                   | 静的確認 | `wizard-tracking-stub.ts` / `trackEvent.e2e-stub.ts`    |
| AC-9   | CI パイプラインで E2E テストが自動実行され、失敗時に PR がブロックされること                              | CI 設定  | `.github/workflows/ci.yml`                              |

## ステータス: 全件 PASS
