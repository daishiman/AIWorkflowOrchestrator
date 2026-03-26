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

### 対象契約

Task06 は以下の既存契約を再利用しつつ、detail surface を追加する。

- `RuntimeSkillCreatorImproveSuggestion`
- `ApplyImprovementResult`
- `verifyResult`
- `sourceProvenance`
- `routeSnapshot`

### 型定義例

```ts
export interface SkillCreatorVerifyDetailViewModel {
  status: "pass" | "warning" | "fail";
  message: string;
  nextAction: "none" | "improve" | "handoff" | "reverify";
  updatedAt: string;
  provenance: SkillCreatorProvenanceSummary;
}

export interface SkillCreatorProvenanceSummary {
  resolvedSkillCreatorRoot: string;
  manifestPath?: string;
  resourceDescriptorHash?: string;
  routeType: "integrated_api" | "terminal_handoff";
}
```

### 公開面の例

```ts
improveSkillWithFeedback(request: ImproveSkillWithFeedbackRequest):
  Promise<RuntimeSkillCreatorImproveSuggestion[]>

applyRuntimeImprovement(request: ApplyRuntimeImprovementRequest):
  Promise<ApplyImprovementResult>

reverifyCurrentSkill(request: ReverifyCurrentSkillRequest):
  Promise<SkillCreatorVerifyDetailViewModel>
```

### 使用例

```ts
const detail = await api.reverifyCurrentSkill({ planId, skillId });

if (detail.nextAction === "improve") {
  const suggestions = await api.improveSkillWithFeedback({ planId, skillId });
  await api.applyRuntimeImprovement({
    planId,
    skillId,
    suggestionId: suggestions[0].id,
  });
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

### 設定可能パラメータと固定境界

| 項目         | 値 / 例                                     | 意味                                        |
| ------------ | ------------------------------------------- | ------------------------------------------- |
| `routeType`  | `integrated_api` / `terminal_handoff`       | lane 判定                                   |
| `nextAction` | `none` / `improve` / `handoff` / `reverify` | 次のユーザー操作                            |
| verify scope | Layer 1 / Layer 2                           | 初回 scope の上限                           |
| non-goal     | Task05 / Task07 / Task08                    | create / governance / persistence は別 task |

### validator 観点

- owner を main から移していないか
- provenance summary が DTO に含まれているか
- shared / main / preload / renderer の contract が同型か
- future scope を current scope と混在させていないか
