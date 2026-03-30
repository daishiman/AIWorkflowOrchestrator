# Refactoring Report — Phase 8 TASK-P0-06

## 実施したリファクタリング

### 1. submitAnswer ヘルパー抽出 (ConversationalInterview.tsx)

**Before (480行):**

- `handleSubmit` と `handleConfirmAndSubmit` が送信ロジック（`setIsSubmitting` → `buildSubmission` → `onSubmit` → エラー処理 → `resetInputValues`）を重複して持っていた

**After (456行, -24行):**

- 共通の `submitAnswer(answer, displayText)` ヘルパーを抽出
- `handleSubmit`: バリデーション → `submitAnswer` 呼び出し
- `handleConfirmAndSubmit`: answer 直接構築 → `submitAnswer` 呼び出し

### 変更の効果

| 指標                             | Before  | After   |
| -------------------------------- | ------- | ------- |
| ConversationalInterview.tsx 行数 | 480     | 456     |
| 重複コードブロック               | 2       | 0       |
| テスト結果                       | 74 PASS | 74 PASS |

### リファクタリングしなかった箇所

- `renderInputWidget`: コンポーネント外のスタンドアロン関数として既に適切に分離済み
- 5つの入力ウィジェット: 各 55-89 行で十分コンパクト、さらなる分割は不要
- `useInterviewState`: 159 行で単一責務を維持、分割の必要なし
