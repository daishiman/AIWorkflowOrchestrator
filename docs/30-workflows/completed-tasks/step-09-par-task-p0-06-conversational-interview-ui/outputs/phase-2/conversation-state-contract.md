# Conversation State Contract — TASK-P0-06

## State Owner 分離

| State                | Owner    | 保持場所                     | 説明                           |
| -------------------- | -------- | ---------------------------- | ------------------------------ |
| 質問生成・フロー進行 | Main     | WorkflowEngine               | 質問の生成と遷移を制御         |
| workflowSnapshot     | Main     | IPC 経由で Renderer に配信   | 現在のフェーズ・質問・検証状態 |
| interviewHistory     | Renderer | React state (ローカル)       | チャットバブル表示用の会話履歴 |
| currentInputValues   | Renderer | React state (ローカル)       | 入力中の回答値                 |
| interviewProgress    | Renderer | 算出値 (answeredCount/total) | 進捗インジケーター表示用       |
| userProficiency      | Renderer | React state (ローカル)       | 初心者/エンジニア切り替え      |

## 新規型定義（packages/shared）

```typescript
// InterviewMessage: チャットバブル1つ分
export interface InterviewMessage {
  id: string;
  role: "assistant" | "user";
  kind: SkillCreatorUserInputKind | "info";
  content: string; // 質問文 or ユーザー回答の要約
  inputRequest?: SkillCreatorUserInputRequest; // assistant の場合
  userAnswer?: InterviewUserAnswer; // user の場合
  timestamp: string;
}

// InterviewUserAnswer: ユーザーの回答
export interface InterviewUserAnswer {
  kind: SkillCreatorUserInputKind;
  selectedOptionId?: string;
  selectedOptionIds?: string[]; // multi_select 用
  textValue?: string;
  secretValue?: string;
  confirmed?: boolean;
}

// InterviewState: 会話全体の状態
export interface InterviewState {
  messages: InterviewMessage[];
  currentStepIndex: number;
  totalSteps: number;
  proficiency: "beginner" | "engineer";
  canUndo: boolean;
}
```

## IPC Boundary

| 方向            | チャネル                             | ペイロード                      |
| --------------- | ------------------------------------ | ------------------------------- |
| Renderer → Main | SKILL_CREATOR_SUBMIT_USER_INPUT      | SkillCreatorUserInputSubmission |
| Main → Renderer | SKILL_CREATOR_WORKFLOW_STATE_CHANGED | SkillCreatorWorkflowUiSnapshot  |
| Renderer → Main | SKILL_CREATOR_GET_WORKFLOW_STATE     | planId                          |

## Undo 方針

- Renderer ローカルの interviewHistory から最後の user message を除去
- Main 側の WorkflowEngine には undo IPC を発行しない（本タスクスコープ外）
- UI 上は前の質問を再表示し、再回答を受け付ける
