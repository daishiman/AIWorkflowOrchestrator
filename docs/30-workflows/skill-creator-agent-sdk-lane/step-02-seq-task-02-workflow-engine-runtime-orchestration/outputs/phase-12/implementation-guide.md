# Implementation Guide

## Part 1: 中学生レベルの説明

### 1.1 この task は何をそろえるのか

この task は、「だれが何を管理するか」をはっきりさせるための設計です。

たとえば、文化祭の準備で「買い出し表をだれが持つか」「お金をだれが管理するか」「次に何をするかをだれが決めるか」が曖昧だと、同じことを二人がやったり、だれもやらなかったりします。Task02 はそれを防ぐためにあります。

### 1.2 なぜ必要か

今の runtime には `plan`、`execute`、`improve` の入口がありますが、「実行の流れを持つ人」と「外に見せる返事を作る人」がまだ分かれていません。このままだと phase の進み方、手動作業へ切り替える判断、途中再開の情報が一つの場所に集まりません。

### 1.3 何を決めるのか

| 決めること           | 説明                             | 例                                |
| -------------------- | -------------------------------- | --------------------------------- |
| 流れを持つ人         | 実行の今の段階を覚える役         | `currentPhase` を engine が持つ   |
| 外に返事を出す人     | 画面へ返す答えを作る役           | facade が handoff guidance を返す |
| 途中で止まった情報   | 後で再開するための包み           | `resumeTokenEnvelope`             |
| 失敗した後の次の一手 | やり直すか改善へ進むかの判断材料 | `verifyResult` と next action     |

### 1.4 この task の完成形

- 実行の流れを持つ場所が 1 つに決まっている
- 外に返す返事を作る場所が 1 つに決まっている
- 後ろの task が同じ前提で作業できる

## Part 2: 技術者向け説明

### 2.1 固定する設計契約

```ts
export type WorkflowPhaseId =
  | "plan"
  | "review"
  | "execute"
  | "verify"
  | "improve"
  | "handoff";

export interface WorkflowRouteSnapshot {
  kind: "integrated_api" | "terminal_handoff";
  permissionMode?: string;
}

export interface WorkflowStateEnvelope {
  workflowId: string;
  currentPhase: WorkflowPhaseId;
  phaseArtifacts: Partial<Record<WorkflowPhaseId, string[]>>;
  awaitingUserInput: null | {
    prompt: string;
    inputKind: "text" | "choice" | "confirmation";
  };
  verifyResult: null | {
    status: "pass" | "fail";
    findings: string[];
  };
  resumeTokenEnvelope: null | {
    workflowId: string;
    phase: WorkflowPhaseId;
    artifactVersion: string;
  };
  routeSnapshot: WorkflowRouteSnapshot;
}

export interface SkillCreatorWorkflowEngine {
  startPlan(input: {
    workflowId: string;
    prompt: string;
    route: WorkflowRouteSnapshot;
  }): Promise<WorkflowStateEnvelope>;
  acceptReview(input: {
    workflowId: string;
    approved: boolean;
  }): Promise<WorkflowStateEnvelope>;
  acceptUserInput(input: {
    workflowId: string;
    response: string;
  }): Promise<WorkflowStateEnvelope>;
  recordExecutionResult(input: {
    workflowId: string;
    success: boolean;
    artifactPaths: string[];
  }): Promise<WorkflowStateEnvelope>;
  recordVerifyResult(input: {
    workflowId: string;
    status: "pass" | "fail";
    findings: string[];
  }): Promise<WorkflowStateEnvelope>;
  buildResumeEnvelope(
    workflowId: string,
  ): WorkflowStateEnvelope["resumeTokenEnvelope"];
}
```

### 2.2 API シグネチャ

```ts
planSkill(
  prompt: string,
  authMode?: AuthMode,
  apiKey?: string | null,
): Promise<IpcResult<RuntimeSkillCreatorPlanResponse>>;

executePlan(
  planId: string,
  skillSpec: string,
  authMode?: AuthMode,
  apiKey?: string | null,
): Promise<IpcResult<RuntimeSkillCreatorExecuteResponse>>;

improveSkillWithFeedback(
  skillName: string,
  feedback: string,
  authMode?: AuthMode,
  apiKey?: string | null,
): Promise<IpcResult<RuntimeSkillCreatorImproveResponse>>;
```

### 2.3 エラーハンドリング

| ケース                       | 期待動作                                                                          |
| ---------------------------- | --------------------------------------------------------------------------------- |
| auth key なし                | facade が `RuntimePolicyResolver` を使って handoff か saved key fallback を決める |
| `terminal_handoff`           | facade が bundle / guidance を返し、executor を呼ばない                           |
| service 例外                 | graceful degradation を failure envelope で返す                                   |
| verify fail                  | engine が `verifyResult` と next action を保持する                                |
| `resumeTokenEnvelope` 不整合 | Task08 で compatibility 判定を扱う                                                |

### 2.4 エッジケース

- `execute()` が `void decision;` を残したまま executor を直呼びする current drift
- `RuntimeSkillCreatorExecuteResponse` と preload 戻り値型の parity drift
- `awaitingUserInput` を renderer state に寄せたくなる設計 drift

### 2.5 設定値と定数

| 項目              | 値                                                          | 置き場                   |
| ----------------- | ----------------------------------------------------------- | ------------------------ |
| public route kind | `integrated_api`, `terminal_handoff`                        | shared contract          |
| workflow phase    | `plan`, `review`, `execute`, `verify`, `improve`, `handoff` | engine internal contract |
| public entrypoint | `planSkill`, `executePlan`, `improveSkillWithFeedback`      | preload API              |

### 2.6 実装対象ファイル

- `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts`
- `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`
- `apps/desktop/src/main/ipc/creatorHandlers.ts`
- `apps/desktop/src/preload/skill-creator-api.ts`
- `packages/shared/src/types/skillCreator.ts`
