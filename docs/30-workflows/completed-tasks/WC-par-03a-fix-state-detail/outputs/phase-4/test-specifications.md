# テスト仕様書 — TASK-SW-FIX-STATE-DETAIL-001

## メタ情報

| 項目       | 内容                         |
| ---------- | ---------------------------- |
| Phase      | 4                            |
| タスクID   | TASK-SW-FIX-STATE-DETAIL-001 |
| 作成日     | 2026-04-14                   |
| ステータス | 完了                         |

---

## テストケース一覧 TC-01〜TC-10

### TC-01（問題12）: answers prop が空になったとき internalAnswers がリセットされる

| 項目               | 内容                                                                                  |
| ------------------ | ------------------------------------------------------------------------------------- |
| 対象コンポーネント | `ConversationRoundStep`                                                               |
| 入力条件           | 初期表示後、answers prop を空の `DEFAULT_ANSWERS` に変更して rerender する            |
| 期待結果           | `internalAnswers` が初期値にリセットされ、選択済みオプションが解除される              |
| 実装観点           | `rerender()` で answers を変更後、ボタンの `aria-pressed` が `false` になることを確認 |

### TC-02（問題12）: 通常フローで answers が変化しない場合は internalAnswers が変化しない（回帰）

| 項目               | 内容                                                                  |
| ------------------ | --------------------------------------------------------------------- |
| 対象コンポーネント | `ConversationRoundStep`                                               |
| 入力条件           | ユーザーがオプションを選択する（fireEvent.click）                     |
| 期待結果           | `onAnswersChange` が呼ばれるが、再レンダリングで選択状態が維持される  |
| 実装観点           | クリック後に `aria-pressed="true"` のボタンが正しく存在することを確認 |

### TC-03（問題13）: templateモードでエラーが発生した状態でキャンセルボタンが表示される

| 項目               | 内容                                                                                             |
| ------------------ | ------------------------------------------------------------------------------------------------ |
| 対象コンポーネント | `GenerateStep`                                                                                   |
| 入力条件           | `mode="template"`, `stage="error"`, `error={{code:"LLM_ERROR", message:"..."}}`, `onCancel` 関数 |
| 期待結果           | キャンセルボタン（「最初からやり直す」）が DOM に存在する                                        |
| 実装観点           | `screen.getByRole("button", { name: /最初からやり直す/ })` が存在すること                        |

### TC-04（問題13）: templateモードエラー後にキャンセルボタンを押すと onCancel が呼ばれる

| 項目               | 内容                                                 |
| ------------------ | ---------------------------------------------------- |
| 対象コンポーネント | `GenerateStep`                                       |
| 入力条件           | TC-03 と同条件、キャンセルボタンを `fireEvent.click` |
| 期待結果           | `onCancel` コールバックが1回呼ばれる                 |
| 実装観点           | `expect(mockOnCancel).toHaveBeenCalledTimes(1)`      |

### TC-05（問題13）: 非templateモードのエラー状態ではキャンセルボタンが表示されない（回帰）

| 項目               | 内容                                                                                |
| ------------------ | ----------------------------------------------------------------------------------- |
| 対象コンポーネント | `GenerateStep`                                                                      |
| 入力条件           | `mode` を省略（または `mode="llm"`）、`stage="error"`, `error=...`, `onCancel` 関数 |
| 期待結果           | templateモード向けキャンセルボタンが表示されない                                    |
| 実装観点           | `screen.queryByRole("button", { name: /最初からやり直す/ })` が `null`              |

### TC-06（問題18）: q5 の回答を変更すると resolveExternalIntegration が再計算される

| 項目               | 内容                                                                                                |
| ------------------ | --------------------------------------------------------------------------------------------------- |
| 対象コンポーネント | `resolveExternalIntegration` + `SkillCreateWizard` useEffect                                        |
| 入力条件           | `answers.q5.selectedOptions = ["Slack"]` に変更して rerender                                        |
| 期待結果           | `hasExternalIntegration = true`, `externalToolName = "Slack"` に更新される                          |
| 実装観点           | `resolveExternalIntegration` のスパイが呼ばれたことを確認。または状態の出力側（CompleteStep）で確認 |

### TC-07（問題18）: q5 以外の質問を変更しても resolveExternalIntegration が再計算されない（回帰）

| 項目               | 内容                                                                        |
| ------------------ | --------------------------------------------------------------------------- |
| 対象コンポーネント | `resolveExternalIntegration` ユニット                                       |
| 入力条件           | `answers.q1.selectedOptions = ["チームメンバー"]` に変更、q5 は変化させない |
| 期待結果           | `resolveExternalIntegration` が呼ばれない（またはq5の値は変わらない）       |
| 実装観点           | スパイのコール数が変化しないこと                                            |

### TC-08（問題19）: 生成処理をキャンセルすると generationLockRef.current が false になる

| 項目               | 内容                                                              |
| ------------------ | ----------------------------------------------------------------- |
| 対象コンポーネント | `SkillCreateWizard` の `handleCancelGeneration`                   |
| 入力条件           | `handleGenerate` 呼び出し後に `handleCancelGeneration` を呼び出す |
| 期待結果           | `generationLockRef.current === false`                             |
| 実装観点           | ref への直接アクセスまたはモック経由で検証                        |

### TC-09（問題19）: キャンセル後に再度生成操作が実行可能になる

| 項目               | 内容                                             |
| ------------------ | ------------------------------------------------ |
| 対象コンポーネント | `SkillCreateWizard` の `handleGenerate`          |
| 入力条件           | キャンセル後に再度 `handleGenerate` を呼び出す   |
| 期待結果           | 生成がロックされずに開始できる（ロック残留なし） |
| 実装観点           | `createSkill` が再度呼ばれることを確認           |

### TC-10（問題19）: 生成処理が正常完了すると generationLockRef.current が false になる（回帰）

| 項目               | 内容                                    |
| ------------------ | --------------------------------------- |
| 対象コンポーネント | `SkillCreateWizard` の `handleGenerate` |
| 入力条件           | `createSkill` が正常に解決する          |
| 期待結果           | `generationLockRef.current === false`   |
| 実装観点           | `createSkill` mock の解決後に状態確認   |

---

## fail-first 確認（実装前の期待状態）

実装前は以下のテストが FAIL する:

| テストID | FAIL理由                                                                                                     |
| -------- | ------------------------------------------------------------------------------------------------------------ |
| TC-01    | internalAnswers がリセットされないため                                                                       |
| TC-03    | キャンセルボタンが表示されないため                                                                           |
| TC-04    | ボタンが存在しないためクリックできない                                                                       |
| TC-08    | finally節の条件でロック解放がスキップされるため（現状はresetGeneratedStateで解放されるが直接検証すると失敗） |

---

## テストファイル配置

| ファイル                                                                                     | 追加テストケース                  |
| -------------------------------------------------------------------------------------------- | --------------------------------- |
| `apps/desktop/src/renderer/components/skill/wizard/__tests__/ConversationRoundStep.test.tsx` | TC-01, TC-02                      |
| `apps/desktop/src/renderer/components/skill/wizard/__tests__/GenerateStep.test.tsx`          | TC-03, TC-04, TC-05               |
| `apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.test.tsx`            | TC-06, TC-07, TC-08, TC-09, TC-10 |
