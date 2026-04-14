# テスト仕様書 — TASK-SW-FIX-STATE-DETAIL-001

## テストケース一覧

| テストID | 対象バグ | 対象ファイル                   | 入力条件                                              | 期待結果                                                |
| -------- | -------- | ------------------------------ | ----------------------------------------------------- | ------------------------------------------------------- |
| TC-01    | 問題12   | ConversationRoundStep.test.tsx | リトライ時に answers prop に空オブジェクトが渡される  | internalAnswers state が空値にリセットされる            |
| TC-02    | 問題12   | ConversationRoundStep.test.tsx | 通常フローで answers が変化しない（ユーザー操作のみ） | internalAnswers state が変化しない（回帰）              |
| TC-03    | 問題13   | GenerateStep.test.tsx          | isTemplateMode=true かつエラーが発生した状態          | キャンセルボタンが DOM に存在する                       |
| TC-04    | 問題13   | GenerateStep.test.tsx          | isTemplateMode=true エラー後にキャンセルボタンを押す  | onCancel コールバックが呼び出される                     |
| TC-05    | 問題13   | GenerateStep.test.tsx          | isTemplateMode=false（通常モード）のエラー状態        | キャンセルボタンが表示されない（回帰）                  |
| TC-06    | 問題18   | SkillCreateWizard.test.tsx     | q5 の回答を変更する                                   | resolveExternalIntegration が再呼び出しされ最新値が返る |
| TC-07    | 問題18   | SkillCreateWizard.test.tsx     | q5 以外の質問（q1〜q4）の回答を変更する               | resolveExternalIntegration が再呼び出しされない（回帰） |
| TC-08    | 問題19   | SkillCreateWizard.test.tsx     | 生成処理をキャンセルする                              | generationLockRef.current が false になる               |
| TC-09    | 問題19   | SkillCreateWizard.test.tsx     | キャンセル後に再度生成操作を行う                      | 生成が正常に開始できる（ロック残留なし）                |
| TC-10    | 問題19   | SkillCreateWizard.test.tsx     | 生成処理が正常完了する                                | generationLockRef.current が false になる（回帰）       |

## 実装ファイル

- `ConversationRoundStep.test.tsx`: TC-01, TC-02 を追加（describe "TASK-SW-FIX-STATE-DETAIL-001: 問題12 internalAnswers リセット"）
- `GenerateStep.test.tsx`: TC-03〜TC-05 を追加（describe "TASK-SW-FIX-STATE-DETAIL-001: 問題13 templateモードキャンセルボタン"）
- `SkillCreateWizard.test.tsx`: TC-06〜TC-10 を追加（describe "TASK-SW-FIX-STATE-DETAIL-001: 問題18・19"）

## fail-first 観点メモ

- TC-01: 現時点では answers 変化を検知する useEffect がないため FAIL
- TC-03: isTemplateMode prop が存在しないため FAIL
- TC-06: q5 変化時の再計算 useEffect がないため FAIL
- TC-08: finally 節条件により cancel 後の lock が残留する場合 FAIL の可能性
