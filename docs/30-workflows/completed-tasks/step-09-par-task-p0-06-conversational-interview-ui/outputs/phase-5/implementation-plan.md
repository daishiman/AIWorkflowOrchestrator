# Implementation Plan — Phase 5 TASK-P0-06

## 実装対象

### 型定義変更

- `packages/shared/src/types/skillCreator.ts`
  - `SkillCreatorUserInputKind` に `multi_select` を追加
  - `SkillCreatorUserInputSubmission` に `selectedOptionIds` を追加
  - `InterviewProficiency`, `InterviewUserAnswer`, `InterviewMessage`, `InterviewState` を新規追加

### 新規コンポーネント

| ファイル                                    | 責務                                     |
| ------------------------------------------- | ---------------------------------------- |
| `ConversationalInterview.tsx`               | 会話型インタビューのメインコンポーネント |
| `InterviewProgressBar.tsx`                  | 進捗インジケーター                       |
| `hooks/useInterviewState.ts`                | 会話状態管理カスタムフック               |
| `interview-widgets/SingleSelectChips.tsx`   | single_select チップ UI                  |
| `interview-widgets/MultiSelectCheckbox.tsx` | multi_select チェックボックス UI         |
| `interview-widgets/FreeTextInput.tsx`       | free_text テキスト入力 UI                |
| `interview-widgets/ConfirmButtons.tsx`      | confirm Yes/No CTA UI                    |
| `interview-widgets/SecretInput.tsx`         | secret マスク付き入力 UI                 |
| `interview-widgets/index.ts`                | ウィジェット re-export                   |

### 既存ファイル変更

- `SkillLifecyclePanel.tsx`
  - 既存の question-host セクション (L1322-1415) を `ConversationalInterview` コンポーネントで置換
  - import 追加

### テスト

| テストファイル                     | テスト数 | 結果         |
| ---------------------------------- | -------- | ------------ |
| `ConversationalInterview.test.tsx` | 16       | PASS         |
| `useInterviewState.test.ts`        | 11       | PASS         |
| `InterviewProgressBar.test.tsx`    | 5        | PASS         |
| **合計**                           | **32**   | **ALL PASS** |

## AC 充足状況

| AC    | 状態   | 実装箇所                                         |
| ----- | ------ | ------------------------------------------------ |
| AC-1  | 実装済 | ConversationalInterview チャットバブル UI        |
| AC-2  | 実装済 | 5種の入力ウィジェット                            |
| AC-3  | 実装済 | InterviewProgressBar                             |
| AC-4  | 実装済 | useInterviewState.undo()                         |
| AC-5  | 実装済 | proficiency 切替 (beginner/engineer)             |
| AC-6  | 実装済 | React state でセッション内保持                   |
| AC-7  | 実装済 | onSubmit → submitUserInput IPC                   |
| AC-8  | 実装済 | SingleSelectChips                                |
| AC-9  | 実装済 | MultiSelectCheckbox                              |
| AC-10 | 実装済 | ConfirmButtons                                   |
| AC-11 | 実装済 | FreeTextInput                                    |
| AC-12 | 実装済 | SecretInput + 表示/非表示トグル                  |
| AC-13 | 実装済 | keyboard event handlers (Enter, Space, Y/N, Tab) |
