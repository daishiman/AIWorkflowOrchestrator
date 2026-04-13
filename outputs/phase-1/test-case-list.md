# E2E テストケース詳細一覧

## タスクID: UT-W3-E2E-WIZARD-TRACKING-UI-REACH-001

| TC番号 | 対応 AC | 説明                                                 | 対象 trackEvent                                         | 操作手順                                                                     |
| ------ | ------- | ---------------------------------------------------- | ------------------------------------------------------- | ---------------------------------------------------------------------------- |
| TC-03  | AC-1    | InfoStep を完了して ConversationRoundStep に遷移する | `skill_wizard_step1_completed`（前提ステップ）          | スキル名・目的・カテゴリ入力→「次へ」クリック                                |
| TC-05  | AC-2    | CompleteStep で「👍（satisfied）」クリック           | `skill_skeleton_quality_feedback { satisfied: true }`   | `complete-step-feedback-satisfied` クリック                                  |
| TC-06  | AC-3    | CompleteStep で「👎（unsatisfied）」クリック         | `skill_skeleton_quality_feedback { satisfied: false }`  | `complete-step-feedback-unsatisfied` クリック                                |
| TC-08  | AC-4    | `complete-step-action-execute` クリック              | `skill_wizard_next_action { action: "execute" }`        | `complete-step-action-execute` クリック                                      |
| TC-09  | AC-5    | `complete-step-action-open-editor` クリック          | `skill_wizard_next_action { action: "open_editor" }`    | `complete-step-action-open-editor` クリック                                  |
| TC-11  | AC-6    | `complete-step-action-create-another` クリック       | `skill_wizard_next_action { action: "create_another" }` | `complete-step-action-create-another` クリック                               |
| TC-12  | AC-7    | 「もう一度作成」後にウィザードが InfoStep に戻る     | UI 遷移確認                                             | `complete-step-action-create-another` クリック後 `wizard-step-info` 表示確認 |

## CompleteStep 到達フロー

TC-05/06/08/09/11/12 はすべて CompleteStep（Step 3）を前提とする。
以下のフローを beforeEach で実行する:

1. ウィザードを開く（`navigateToWizard`）
2. InfoStep を完了する（`fillInfoStep`）
3. ConversationRoundStep → スキップまたは生成
4. CompleteStep が表示されるまで待機（最大 30 秒）
