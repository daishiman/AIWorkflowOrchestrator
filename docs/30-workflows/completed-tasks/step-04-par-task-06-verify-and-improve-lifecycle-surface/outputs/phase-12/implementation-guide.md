# Implementation Guide

## Part 1: 中学生向けの説明

### なぜ必要か

作業を直すときに一番困るのは、「どこが悪かったのか」「次に何をすればいいのか」が見えないことです。Task06 はそこを見えるようにするための仕様です。

### たとえ話

作文を先生に見せる場面を考える。

- `verify`: 先生が「ここは通った」「ここは直した方がいい」を判定する
- `improve`: 直し方の候補メモをもらう
- `apply`: その候補を実際に反映する
- `re-verify`: 直したあとに、もう一度見直す

大事なのは、先生そのものを増やすことではなく、先生が出した結果を見やすくすることです。Task06 は「見直しの結果を読む画面」を整える仕事で、見直しの本体そのものを作り直す仕事ではありません。

### 何をするか

- 判定結果を 1 画面で読めるようにする
- どのファイルや設定をもとに判定したかを一緒に見せる
- 直し案を選んで反映したあと、同じ流れのまま再点検できるようにする

## Part 2: 技術者向けの説明

### UI証跡

- capture plan: `outputs/phase-11/screenshot-plan.json`
- fallback evidence: `outputs/phase-11/screenshot-coverage.md`
- capture metadata: `outputs/phase-11/screenshots/phase11-capture-metadata.json`
- 2026-03-27 時点では `MT-01` 相当の PNG はあるが、capture plan 全体は未充足のため blocker 管理

### 対象契約

Task06 は以下の既存契約を再利用しつつ、detail surface を追加する。

- `RuntimeSkillCreatorImproveSuggestion`
- `ApplyImprovementResult`
- `RuntimeSkillCreatorVerifyDetail`
- `sourceProvenance`
- `route`

### 型定義（実装済み: `packages/shared/src/types/skillCreator.ts`）

```ts
export interface RuntimeSkillCreatorVerifyDetail {
  planId: string;
  currentPhase:
    | "plan"
    | "review"
    | "execute"
    | "verify"
    | "improve"
    | "handoff";
  status: "pending" | "pass" | "fail";
  message?: string;
  nextAction?: "review" | "improve";
  checks: RuntimeSkillCreatorVerifyCheck[];
  evidenceCount: number;
  resolvedSkillCreatorRoot?: string;
  manifestPath?: string;
  resourceDescriptorHash?: string;
  manifestCacheKey?: string;
  route: RuntimeSkillCreatorVerifyDetailRoute;
  reverifyEligible: boolean;
  disabledReason?: string;
  delegatedGovernanceNote: string;
  delegatedSessionNote: string;
}
```

### 公開面（実装済み: `apps/desktop/src/preload/skill-creator-api.ts`）

```ts
improveSkillWithFeedback(
  skillName: string,
  feedback: string,
  authMode?: AuthMode,
  apiKey?: string | null,
): Promise<IpcResult<RuntimeSkillCreatorImproveResponse>>

applyRuntimeImprovement(
  skillName: string,
  suggestions: RuntimeSkillCreatorImproveSuggestion[],
): Promise<IpcResult<ApplyImprovementResult>>

getVerifyDetail(
  planId: string,
): Promise<IpcResult<RuntimeSkillCreatorVerifyDetailResponse>>

reverifyWorkflow(
  planId: string,
): Promise<IpcResult<RuntimeSkillCreatorReverifyResponse>>
```

### 使用例

```ts
const improveResult = await skillCreatorApi.improveSkillWithFeedback(
  createdSkillName,
  executionPrompt,
);

if (
  improveResult.success &&
  improveResult.data &&
  !("type" in improveResult.data)
) {
  setRuntimeImproveResult(improveResult.data);
}

const reverifyResult = await skillCreatorApi.reverifyWorkflow(planId);
if (reverifyResult.data?.accepted) {
  await loadVerifyDetail(planId);
}
```

### 実装責務

| 層       | 役割                                                | 禁止事項                               |
| -------- | --------------------------------------------------- | -------------------------------------- |
| shared   | detail DTO と provenance summary の公開契約         | 既存 improve / apply result 型の再定義 |
| main     | `verifyResult` owner、improve / apply orchestration | renderer への truth 移譲               |
| preload  | 最小の公開 API                                      | main 独自型の漏出                      |
| renderer | panel 表示状態と action state                       | verify 判定の owner 化                 |

### エラーハンドリングと edge case

| ケース                | 扱い                                                       |
| --------------------- | ---------------------------------------------------------- |
| verify fail           | improve 導線を優先表示する                                 |
| warning               | apply を許可しつつ warning であることを残す                |
| apply partial success | `skippedDetails` と再試行方針を表示する                    |
| provenance 欠落       | 欠落フィールドだけ fallback 表示にし、panel 自体は維持する |
| terminal handoff      | verify detail の代替ではなく side guidance として出す      |

### スクリーンショット参照

- Phase 11 checklist: `outputs/phase-11/manual-test-checklist.md`
- Screenshot plan: `outputs/phase-11/screenshot-plan.json`
- Review board capture: `outputs/phase-11/screenshots/TC-11-01-verify-detail-review-board.png`
- Capture metadata: `outputs/phase-11/screenshots/phase11-capture-metadata.json`

### 設定可能パラメータと固定境界

| 項目                | 値 / 例                               | 意味                                        |
| ------------------- | ------------------------------------- | ------------------------------------------- |
| `route.type`        | `integrated_api` / `terminal_handoff` | lane 判定                                   |
| `nextAction`        | `review` / `improve`                  | 次のユーザー操作                            |
| verify detail layer | `layer3` / `layer4`                   | check 表示粒度                              |
| non-goal            | Task05 / Task07 / Task08              | create / governance / persistence は別 task |

### validator 観点

- owner を main から移していないか
- provenance summary が DTO に含まれているか
- shared / main / preload / renderer の contract が同型か
- future scope を current scope と混在させていないか
- screenshot reference が plan のみで終わっていないか
