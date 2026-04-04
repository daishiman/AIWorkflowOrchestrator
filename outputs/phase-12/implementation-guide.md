# Phase 12: Implementation Guide — TASK-SDK-SC-02 Conversation UI

## 概要

Electron Renderer 側に「質問受信・回答送信」UIコンポーネント群を実装した。
`skill-creator:question-received` IPCイベントで `UserInputQuestion` を受信し、`kind`（single_select / multi_select / free_text / secret / confirm）に応じた入力UIを表示する。ユーザーの回答は `InterviewUserAnswer` として組み立て、`UserInputAnswer` に正規化して `skill-creator:answer` IPC で送信する。

## 参照元

- `docs/30-workflows/step-02-par-task-02-conversation-ui/phase-12-documentation.md`
- `outputs/phase-11/manual-test-report.md`
- `outputs/phase-11/task-sdk-sc-02/screenshots/`

## 新規作成ファイル

### コンポーネント（5ファイル）

| ファイル                            | Atomic Design | 役割                                         |
| ----------------------------------- | ------------- | -------------------------------------------- |
| `ChoiceButton.tsx`                  | Atom          | 選択/未選択状態の単一ボタン                  |
| `FreeTextInput.tsx`                 | Atom          | 自由入力テキストエリア（free_text / secret） |
| `ConversationProgress.tsx`          | Atom          | 「質問 N / 推定合計」形式の進捗表示          |
| `QuestionCard.tsx`                  | Molecule      | kind に応じた質問表示・入力UI統合            |
| `SkillCreatorConversationPanel.tsx` | Organism      | IPC listen・回答送信・全コンポーネント統合   |

### テスト（5ファイル）

| ファイル                                 | テスト数 |
| ---------------------------------------- | -------- |
| `ChoiceButton.test.tsx`                  | 9        |
| `FreeTextInput.test.tsx`                 | 9        |
| `ConversationProgress.test.tsx`          | 3        |
| `QuestionCard.test.tsx`                  | 23       |
| `SkillCreatorConversationPanel.test.tsx` | 13       |
| **合計**                                 | **57**   |

## アーキテクチャ

### コンポーネントツリー

```
SkillCreatorConversationPanel (Organism)
├── ConversationProgress (Atom)
└── QuestionCard (Molecule)
      ├── ChoiceButton[] (Atom)
      └── FreeTextInput (Atom)
```

### 型マッピング

2つの型体系をブリッジ:

- **Session Bridge 型** (`UserInputQuestion`/`UserInputAnswer`) — preload API で使用
- **Workflow 型** (`SkillCreatorUserInputRequest`/`InterviewUserAnswer`) — UI コンポーネントで使用

`SkillCreatorConversationPanel` 内の `mapQuestionToRequest()` / `mapAnswerToUserInputAnswer()` でマッピング。
`multi_select` の自由入力は `selectedValues` を保持し、ブリッジで `UserInputAnswer.value` の配列に正規化する。

### IPC 通信フロー

```
[Main] → skillCreatorSessionAPI.onQuestion() → [Panel] → QuestionCard 表示
[Panel] ← QuestionCard.onAnswer() ← [ユーザー操作]
[Panel] → skillCreatorSessionAPI.sendAnswer() → [Main]
[Main] → skillCreatorSessionAPI.onComplete() / onError() → [Panel] 終端状態
```

### 状態管理

`useReducer` による状態管理:

- `QUESTION_RECEIVED`: 質問受信 → questionIndex++, currentRequest 更新
- `ANSWER_SUBMITTING` / `ANSWER_SUBMITTED`: 送信中フラグ制御
- `SESSION_COMPLETE` / `SESSION_ERROR`: 終端状態

## 質問タイプ別動作

| kind            | UI                                               | 回答フィールド                         |
| --------------- | ------------------------------------------------ | -------------------------------------- |
| `single_select` | ChoiceButton リスト + 「その他（自由入力）」     | `selectedOptionId`                     |
| `multi_select`  | ChoiceButton（複数選択）+ 「その他」+ 送信ボタン | `selectedOptionIds` / `selectedValues` |
| `free_text`     | FreeTextInput (textarea)                         | `textValue`                            |
| `secret`        | FreeTextInput (input[type="password"])           | `secretValue`                          |
| `confirm`       | 「はい」「いいえ」ChoiceButton                   | `confirmed`                            |

## 品質指標

- TypeScript エラー: 0 件
- テスト: 57/57 PASS
- カバレッジ: Stmts 97.54% / Branch 86.04% / Funcs 95.83% / Lines 97.54%
- アクセシビリティ: `aria-pressed`, `role="progressbar"`, `aria-valuenow/min/max` 設定済み

## 依存関係

- **TASK-SDK-SC-01** の成果物のみに依存（`skillCreator.ts`, `skillCreatorSession.ts`, `channels.ts`）
- step-02-par 内の他タスクとは並列実行可能（依存なし）

## 使用方法

```tsx
import { SkillCreatorConversationPanel } from "./components/skill-creator/SkillCreatorConversationPanel";

<SkillCreatorConversationPanel
  onComplete={() => navigateToSkillPreview()}
  onError={(message) => setErrorMessage(message)}
/>;
```

## Phase 11 Screenshots

Phase 11 の視覚証跡は次のパスに保存済み。

- `outputs/phase-11/task-sdk-sc-02/screenshots/`
- `outputs/phase-11/task-sdk-sc-02/phase11-capture-metadata.json`
- `outputs/phase-11/task-sdk-sc-02/screenshot-plan.json`

## 未タスク

なし — 全仕様書の要件をカバー済み。
