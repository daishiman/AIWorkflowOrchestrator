# Phase 4 テストマトリクス

| TC番号 | AC番号 | テスト名                                                                      | 対象 UI 操作                                               | 期待イベント                                            | TDD Red 状態                |
| ------ | ------ | ----------------------------------------------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------- | --------------------------- |
| TC-03  | AC-1   | InfoStep → ConversationRoundStep 遷移後にトラッキングが到達可能な状態になる   | 「次へ」ボタンクリック                                     | ステップ遷移の UI 到達確認                              | FAIL→PASS（Phase 5 実装後） |
| TC-05  | AC-2   | 👍 ボタン押下で skill_skeleton_quality_feedback(satisfied=true) が発火する    | `complete-step-feedback-satisfied`                         | `skill_skeleton_quality_feedback { satisfied: true }`   | FAIL→PASS                   |
| TC-06  | AC-3   | 👎 ボタン押下で skill_skeleton_quality_feedback(satisfied=false) が発火する   | `complete-step-feedback-unsatisfied`                       | `skill_skeleton_quality_feedback { satisfied: false }`  | FAIL→PASS                   |
| TC-08  | AC-4   | execute クリックで skill_wizard_next_action(execute) が発火する               | `complete-step-action-execute`                             | `skill_wizard_next_action { action: "execute" }`        | FAIL→PASS                   |
| TC-09  | AC-5   | open_editor クリックで skill_wizard_next_action(open_editor) が発火する       | `complete-step-action-open-editor`                         | `skill_wizard_next_action { action: "open_editor" }`    | FAIL→PASS                   |
| TC-11  | AC-6   | create_another クリックで skill_wizard_next_action(create_another) が発火する | `complete-step-action-create-another`                      | `skill_wizard_next_action { action: "create_another" }` | FAIL→PASS                   |
| TC-12  | AC-7   | 「もう一度作成」後 InfoStep に戻ること確認                                    | `complete-step-action-create-another` クリック後の画面遷移 | `wizard-step-info` が表示される                         | FAIL→PASS                   |
