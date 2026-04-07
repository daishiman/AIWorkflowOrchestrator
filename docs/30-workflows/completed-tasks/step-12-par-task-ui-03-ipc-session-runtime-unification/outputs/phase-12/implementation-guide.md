# Phase 12 ドキュメント更新 - TASK-UI-03 IPC 二重経路統合

## メタ情報

| 項目       | 内容                        |
| ---------- | --------------------------- |
| Phase      | 12                          |
| タスク名   | TASK-UI-03 IPC 二重経路統合 |
| 採用方針   | B: 明確な分離契約           |
| 作成日     | 2026-04-06                  |
| ステータス | complete                    |

## Part 1

### なぜ必要か

今の Skill Creator には、同じ目的に見える入口が複数あり、使い方を迷いやすい状態があります。入口が増えすぎると、どれを使うかを毎回考える必要があり、実装も確認も複雑になります。

今回の整理は、入口の数を減らして「この用途ならこの入口」という形にそろえることが目的です。そうすると、開発者が迷いにくくなり、チェック項目も一本化できます。

### たとえば

たとえば、学校に「連絡帳」と「学級掲示板」があるとします。どちらも連絡を伝える道具ですが、使う場面が違うので、役割が決まっていると迷いません。

同じように、Skill Creator でも「質問と回答をやりとりする入口」と「計画や状態を扱う入口」を分けておくと、何をどこに送ればよいかが分かりやすくなります。

### 何をするか

| 項目         | 現状の見え方                             | 今回そろえる形                         |
| ------------ | ---------------------------------------- | -------------------------------------- |
| Session 入口 | `window.skillCreatorSessionAPI`          | 会話フロー専用の入口として維持         |
| Runtime 入口 | `window.skillCreatorAPI`                 | 状態管理・計画実行専用の入口として維持 |
| 冗長な公開   | `window.electronAPI.skillCreator`        | 公開面から外す対象                     |
| 冗長な公開   | `window.electronAPI.skillCreatorSession` | 公開面から外す対象                     |

### この変更で大切にすること

- 使う人が「会話系か、状態管理系か」を一瞬で判断できること
- 同じ安全確認を両方の入口にそろえること
- 入口の数を増やさず、最小の複雑さで運用すること

## Part 2

### Current contract と target delta

現在の契約は、Session と Runtime を別責務として扱うことです。今回の target delta は、その責務分離を保ったまま、重複している公開面を整理することです。

### TypeScript 型定義

```ts
type IpcResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

interface IpcSessionResult {
  success: boolean;
  error?: string;
}

interface UserInputQuestion {
  toolCallId: string;
  question: string;
}

interface UserInputAnswer {
  toolCallId: string;
  value: string | string[] | boolean;
}

interface ExternalApiConfigRequiredEvent {
  apiName?: string;
  description?: string;
}

interface SkillCreatorSessionCompleteEvent {
  result: string;
}

interface SkillCreatorSessionErrorEvent {
  error: string;
}

interface WorkflowSnapshot {
  planId: string;
  phase: string;
  errorMessage?: string;
}

interface SkillCreatorUserInputSubmission {
  planId: string;
  requestId: string;
  selectedOptionId?: string;
  selectedOptionIds?: string[];
  selectedValues?: string[];
  textValue?: string;
  secretValue?: string;
  confirmed?: boolean;
}

interface SkillCreatorSessionResumeResult {
  success: boolean;
  workflowSnapshot?: WorkflowSnapshot;
  error?: string;
  errorReason?: "expired" | "corrupted" | "not_found";
}

interface SkillCreatorSessionAPI {
  startSession(request: string, sessionId?: string): Promise<IpcSessionResult>;
  sendAnswer(answer: UserInputAnswer): Promise<IpcSessionResult>;
  onQuestion(callback: (question: UserInputQuestion) => void): () => void;
  onExternalApiConfigRequired(
    callback: (event: ExternalApiConfigRequiredEvent) => void,
  ): () => void;
  onComplete(
    callback: (event: SkillCreatorSessionCompleteEvent) => void,
  ): () => void;
  onError(callback: (event: SkillCreatorSessionErrorEvent) => void): () => void;
}

interface SkillCreatorRuntimeAPI {
  planSkill(input: { prompt: string }): Promise<IpcResult<{ planId: string }>>;
  executePlan(input: {
    planId: string;
    skillSpec: unknown;
  }): Promise<IpcResult<{ accepted: boolean }>>;
  submitUserInput(
    input: SkillCreatorUserInputSubmission,
  ): Promise<IpcResult<void>>;
  getWorkflowState(input: {
    planId: string;
  }): Promise<IpcResult<WorkflowSnapshot>>;
  listSessions(): Promise<IpcResult<unknown[]>>;
  getSessionDetail(input: {
    checkpointId: string;
  }): Promise<IpcResult<WorkflowSnapshot>>;
  resumeSession(input: {
    checkpointId: string;
  }): Promise<SkillCreatorSessionResumeResult>;
  deleteSession(input: { checkpointId: string }): Promise<IpcResult<void>>;
  onWorkflowStateChanged(
    callback: (
      snapshot: WorkflowSnapshot | null,
      errorMessage?: string,
    ) => void,
  ): () => void;
}
```

### API シグネチャ

- `startSession(request, sessionId?)`
- `sendAnswer({ toolCallId, value })`
- `listSessions()`
- `getSessionDetail({ checkpointId })`
- `resumeSession({ checkpointId })`
- `deleteSession({ checkpointId })`
- `planSkill({ prompt })`
- `executePlan({ planId, skillSpec })`
- `submitUserInput({ planId, requestId, textValue })`
- `getWorkflowState({ planId })`
- `onQuestion(callback)`
- `onExternalApiConfigRequired(callback)`
- `onComplete(callback)`
- `onError(callback)`
- `onWorkflowStateChanged(callback)`

### 使用例

```ts
const sessionResult =
  await window.skillCreatorSessionAPI.startSession("テスト用スキルを作成して");

if (!sessionResult.success) {
  console.error(sessionResult.error);
}

const planResult = await window.skillCreatorAPI.planSkill({
  prompt: "テスト用スキルを作成して",
});

if (planResult.success) {
  const snapshotResult = await window.skillCreatorAPI.getWorkflowState({
    planId: planResult.data.planId,
  });

  console.log(snapshotResult);
}
```

### エラーハンドリング

| 種別             | ルール                                                                              |
| ---------------- | ----------------------------------------------------------------------------------- |
| 通常の入力エラー | Runtime は `IpcResult<T>`、Session は `IpcSessionResult` で `success: false` を返す |
| セキュリティ例外 | `throw` を維持し、呼び出し元に握りつぶさせない                                      |
| イベント購読     | 返り値の unsubscribe で後始末できるようにする                                       |

### エッジケース

| ケース                              | 期待する扱い                                                |
| ----------------------------------- | ----------------------------------------------------------- |
| `request` が空                      | `startSession` はエラーとして返す                           |
| `checkpointId` が不正               | `resumeSession` / `deleteSession` は失敗する                |
| `planId` が古い                     | `getWorkflowState` は失敗または空スナップショット扱いにする |
| `onWorkflowStateChanged` の解除漏れ | 購読解除関数で明示的に解放する                              |

### 設定項目と定数一覧

| 項目                      | 用途                              |
| ------------------------- | --------------------------------- |
| `ALLOWED_INVOKE_CHANNELS` | invoke 系チャネルのホワイトリスト |
| `ALLOWED_ON_CHANNELS`     | push 系チャネルのホワイトリスト   |
| `CHANNEL_TIMEOUTS`        | チャネルごとの timeout 設定       |
| `SESSION_CHANNEL_PREFIX`  | Session 系チャネルの接頭辞        |
| `RUNTIME_CHANNEL_PREFIX`  | Runtime 系チャネルの接頭辞        |

チャネル命名は全チャネルが `skill-creator:` プレフィックスで統一済みのため変更不要。

### スクリーンショット参照

本タスクは NON_VISUAL 判定のため、実画面の証跡ではなく validator 互換の placeholder を使用する。

- 証跡計画: `outputs/phase-11/screenshot-plan.json`
- placeholder: `outputs/phase-11/screenshots/non-visual-placeholder.png`
