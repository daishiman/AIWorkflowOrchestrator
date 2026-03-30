# Test Expansion — Phase 6 TASK-P0-06

## 追加テストファイル

| テストファイル                                             | テスト数 | 結果 |
| ---------------------------------------------------------- | -------- | ---- |
| `__tests__/interview-widgets/SingleSelectChips.test.tsx`   | 7        | PASS |
| `__tests__/interview-widgets/MultiSelectCheckbox.test.tsx` | 7        | PASS |
| `__tests__/interview-widgets/FreeTextInput.test.tsx`       | 10       | PASS |
| `__tests__/interview-widgets/ConfirmButtons.test.tsx`      | 7        | PASS |
| `__tests__/interview-widgets/SecretInput.test.tsx`         | 10       | PASS |
| `__tests__/ConversationalInterview.test.tsx` (TC-E02 追加) | 17       | PASS |

## テストマトリクス充足状況

### 異常系

| ID     | 状態   | テストファイル                   |
| ------ | ------ | -------------------------------- |
| TC-E01 | Phase5 | ConversationalInterview.test.tsx |
| TC-E02 | 追加済 | ConversationalInterview.test.tsx |
| TC-E03 | 追加済 | FreeTextInput.test.tsx           |
| TC-E04 | 追加済 | SecretInput.test.tsx             |
| TC-E05 | Phase5 | ConversationalInterview.test.tsx |
| TC-E06 | Phase5 | ConversationalInterview.test.tsx |
| TC-E07 | Phase5 | ConversationalInterview.test.tsx |
| TC-E08 | Phase5 | ConversationalInterview.test.tsx |

### 境界値

| ID     | 状態   | テストファイル                |
| ------ | ------ | ----------------------------- |
| TC-B01 | Phase5 | InterviewProgressBar.test.tsx |
| TC-B02 | Phase5 | InterviewProgressBar.test.tsx |
| TC-B03 | 追加済 | FreeTextInput.test.tsx        |
| TC-B04 | 追加済 | SingleSelectChips.test.tsx    |
| TC-B05 | 追加済 | MultiSelectCheckbox.test.tsx  |

## テスト総数

| カテゴリ                | Phase5 | Phase6 追加 | 合計   |
| ----------------------- | ------ | ----------- | ------ |
| ConversationalInterview | 16     | +1          | 17     |
| useInterviewState       | 11     | 0           | 11     |
| InterviewProgressBar    | 5      | 0           | 5      |
| SingleSelectChips       | -      | +7          | 7      |
| MultiSelectCheckbox     | -      | +7          | 7      |
| FreeTextInput           | -      | +10         | 10     |
| ConfirmButtons          | -      | +7          | 7      |
| SecretInput             | -      | +10         | 10     |
| **合計**                | **32** | **+42**     | **74** |
