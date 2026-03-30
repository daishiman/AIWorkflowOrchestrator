# Test Matrix — TASK-P0-06

## AC → テスト → 期待結果 対応表

### 正常系

| ID    | AC    | テストケース                                    | 期待結果                                            |
| ----- | ----- | ----------------------------------------------- | --------------------------------------------------- |
| TC-01 | AC-1  | ConversationalInterviewを表示し質問が表示される | チャットバブル形式でassistantメッセージが表示される |
| TC-02 | AC-1  | 回答送信後に新しい質問が表示される              | user/assistantバブルが交互に追加される              |
| TC-03 | AC-2  | single_selectの質問が表示される                 | 選択チップ群が表示される                            |
| TC-04 | AC-2  | multi_selectの質問が表示される                  | チェックボックスリストが表示される                  |
| TC-05 | AC-2  | free_textの質問が表示される                     | テキスト入力フィールドが表示される                  |
| TC-06 | AC-2  | confirmの質問が表示される                       | Yes/No CTAボタンが表示される                        |
| TC-07 | AC-2  | secretの質問が表示される                        | マスク付き入力が表示される                          |
| TC-08 | AC-3  | インタビュー開始時に進捗が表示される            | プログレスバーと完了率テキストが表示される          |
| TC-09 | AC-3  | 回答送信後に進捗が更新される                    | プログレスバーの割合と数値が増加する                |
| TC-10 | AC-4  | 「戻る」ボタンで前の回答を取り消す              | 最後のuser/assistantバブルが消え、前の質問が再表示  |
| TC-11 | AC-5  | 初心者モードで質問が表示される                  | 詳しい説明テキストが付加される                      |
| TC-12 | AC-5  | エンジニアモードで質問が表示される              | 簡潔な質問テキストのみ表示される                    |
| TC-13 | AC-6  | 回答後に状態が維持される                        | interviewHistoryに会話履歴が保持される              |
| TC-14 | AC-7  | submitUserInput IPCが正しく呼ばれる             | SkillCreatorUserInputSubmissionが送信される         |
| TC-15 | AC-8  | single_selectで1つの選択肢をクリックする        | selectedOptionIdが設定されsubmission送信できる      |
| TC-16 | AC-9  | multi_selectで複数の選択肢をトグルする          | selectedOptionIdsに複数IDが含まれる                 |
| TC-17 | AC-10 | confirm「はい」をクリックする                   | confirmed=trueで即時反映される                      |
| TC-18 | AC-10 | confirm「いいえ」をクリックする                 | confirmed=falseで即時反映される                     |
| TC-19 | AC-11 | free_textにテキストを入力して送信する           | textValueが送信される                               |
| TC-20 | AC-12 | secretフィールドに入力しマスクが適用される      | 入力値が●で表示される                               |
| TC-21 | AC-12 | secret表示/非表示トグルをクリックする           | 入力値がプレーンテキスト/マスクで切り替わる         |
| TC-22 | AC-13 | Enterキーでfree_text回答を送信する              | テキストが送信される                                |
| TC-23 | AC-13 | Spaceキーでsingle_select選択肢を選択する        | 選択肢が選択される                                  |
| TC-24 | AC-13 | Tabキーで選択肢間を移動する                     | フォーカスが次の選択肢に移動する                    |

### 異常系

| ID     | AC   | テストケース                        | 期待結果                                 |
| ------ | ---- | ----------------------------------- | ---------------------------------------- |
| TC-E01 | AC-2 | single_selectで未選択のまま送信する | エラーメッセージが表示され送信されない   |
| TC-E02 | AC-2 | multi_selectで0件選択のまま送信する | エラーメッセージが表示され送信されない   |
| TC-E03 | AC-2 | free_textで空文字のまま送信する     | エラーメッセージが表示され送信されない   |
| TC-E04 | AC-2 | secretで空文字のまま送信する        | エラーメッセージが表示され送信されない   |
| TC-E05 | AC-4 | 最初の質問で「戻る」ボタンを押す    | ボタンが無効化され操作不可               |
| TC-E06 | AC-7 | submitUserInput IPCがエラーを返す   | ワークフローエラーメッセージが表示される |
| TC-E07 | AC-7 | workflowSnapshotがnullの場合        | 質問ホストが表示されない                 |
| TC-E08 | AC-6 | pendingRequestがnullの場合          | 待機メッセージが表示される               |

### 境界値

| ID     | AC    | テストケース                            | 期待結果                                     |
| ------ | ----- | --------------------------------------- | -------------------------------------------- |
| TC-B01 | AC-3  | 進捗が0/0の場合                         | プログレスバーが0%で表示される               |
| TC-B02 | AC-3  | 進捗が最終ステップの場合                | プログレスバーが100%で表示される             |
| TC-B03 | AC-11 | free_textに非常に長いテキストを入力する | テキストエリアがスクロール対応で表示される   |
| TC-B04 | AC-8  | single_selectの選択肢が1つだけの場合    | 1つの選択チップが正しく表示・選択できる      |
| TC-B05 | AC-9  | multi_selectの選択肢が10個以上の場合    | スクロール可能なリストで全選択肢が表示される |

## テストファイル配置

| テストファイル                                             | 対象コンポーネント      |
| ---------------------------------------------------------- | ----------------------- |
| `__tests__/ConversationalInterview.test.tsx`               | ConversationalInterview |
| `__tests__/InterviewProgressBar.test.tsx`                  | InterviewProgressBar    |
| `__tests__/interview-widgets/SingleSelectChips.test.tsx`   | SingleSelectChips       |
| `__tests__/interview-widgets/MultiSelectCheckbox.test.tsx` | MultiSelectCheckbox     |
| `__tests__/interview-widgets/FreeTextInput.test.tsx`       | FreeTextInput           |
| `__tests__/interview-widgets/ConfirmButtons.test.tsx`      | ConfirmButtons          |
| `__tests__/interview-widgets/SecretInput.test.tsx`         | SecretInput             |
| `__tests__/useInterviewState.test.ts`                      | useInterviewState hook  |
