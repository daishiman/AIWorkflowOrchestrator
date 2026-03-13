# 実装ガイド: Task04 採点・評価・受け入れゲート統合

## Part 1: なぜこの仕組みが必要か

なぜ必要かというと、スキルは「作れた」だけでは足りず、「保存してよいか」「そのまま使ってよいか」まで同じ基準で判断しないと、弱いスキルが次の画面へ流れてしまうからです。

今回の Task04 は、`作る -> 評価する -> 改善する -> 再評価する -> 使う` を 1 本の品質ループにまとめました。たとえば、学校の提出物でも「提出できた」ことと「そのまま掲示してよい」ことは同じではありません。先生がチェック表で「まだ直す」「提出はできる」「もう公開してよい」を分けるように、Task04 でも同じ採点表で `revise_required` / `save_with_warning` / `use_ready` を分けます。

何をしたかというと、Task03 の create / execute / improve と Task05 の use / re-evaluate の間に、共通の score 集約と gate decision を置き、どの画面でも同じ基準で次アクションを決められるようにしました。

大事なのは、Task03 の create / execute / improve と Task05 の use / re-evaluate で判断基準を変えないことです。受付が 2 つあっても、裏の採点表が 1 つなら「次に何をすべきか」がぶれません。今回の品質ゲートは、その共通採点表を UI、state、共有型、public API にまたがって固定する役割を持っています。

## Part 2: 実装のしかた

### 型定義

```ts
type EvaluationStage =
  | "draft"
  | "post_create"
  | "post_execute"
  | "post_improve";

type GateStatus =
  | "revise_required"
  | "save_with_warning"
  | "use_with_warning"
  | "use_ready"
  | "recommended";

interface ExecutionQualityEvaluation {
  score: number;
  successRate: number;
  reliability: number;
  safety: number;
  clarity: number;
  reasons: string[];
}

interface LifecycleEvaluationSnapshot {
  skillName: string;
  stage: EvaluationStage;
  totalScore: number;
  hardBlocks: string[];
  deltaFromPrevious?: number;
  executionQuality?: ExecutionQualityEvaluation;
}

interface LifecycleGateDecision {
  stage: EvaluationStage;
  status: GateStatus;
  nextSurface: "skillCreator" | "skillCenter" | "workspace" | "agent";
  summary: string;
  blockingIssues: string[];
  totalScore: number;
  recommended: boolean;
}
```

### APIシグネチャ

- `window.electronAPI.skill.evaluatePrompt(prompt: string): Promise<PromptEvaluation>`
- `evaluateDraft(payload: { request: string }): Promise<LifecycleGateDecision>`
- `evaluatePostCreate(payload: { skillName: string; prompt: string; analysis: SkillAnalysis }): Promise<LifecycleGateDecision>`
- `evaluatePostExecute(payload: { skillName: string; prompt: string; analysis: SkillAnalysis; execution: SkillExecutionResponse | null }): Promise<LifecycleGateDecision>`
- `evaluatePostImprove(payload: { skillName: string; prompt: string; analysis: SkillAnalysis }): Promise<LifecycleGateDecision>`

### 実装手順

1. `packages/shared/src/types/skill-evaluation.ts` に Stage / Gate / Snapshot / Decision の共通型を追加する。
2. `apps/desktop/src/preload/skill-api.ts` に `evaluatePrompt()` を公開し、Renderer から直接 IPC を増やさず store action で利用する。
3. `apps/desktop/src/renderer/store/skillEvaluation.ts` に score 集約、hard block 検出、gate 決定の pure helper を置く。
4. `skillEvaluationSlice.ts` で `latestEvaluationSnapshot` / `latestGateDecision` / `evaluationHistory` を管理し、Task03 と Task05 が同じ state を再利用できるようにする。
5. `SkillEvaluationPanel` を `SkillLifecyclePanel` と `SkillCenterView` へ差し込み、status / summary / next surface / delta を同一UIで表示する。

### 使用例

```ts
const evaluatePostCreate = useSkillEvaluationStore(
  (state) => state.evaluatePostCreate,
);

const decision = await evaluatePostCreate({
  skillName: "review-assistant",
  prompt: "レビュー支援スキルを作る",
  analysis,
});

if (decision.status === "save_with_warning") {
  setBanner(decision.summary);
}
```

```ts
const reevaluate = async () => {
  await evaluatePostImprove({
    skillName,
    prompt: latestPromptRequest,
    analysis: currentAnalysis,
  });
};
```

### エラーハンドリング

- `evaluatePrompt()` が失敗したら `evaluationError` にメッセージを保存し、`SkillLifecyclePanel` と `SkillCenterView` の双方で同じエラーを表示する。
- create / execute / improve 自体が失敗した場合は、既存の `skillError` や local error を潰さず、quality gate の失敗理由と併記する。
- hard block は UI 操作で解除させず、`critical risk` や permission 由来の事実が解消されるまでは `revise_required` を維持する。

### エッジケース

- `post_improve` で execution 品質が取れない場合でも、利用可能な軸だけで重みを正規化して総合スコアを計算する。
- 直前が `recommended` でも、Task05 側で再評価した結果 `deltaFromPrevious = 0` なら `use_ready` に戻し、古い推薦表示を残さない。
- `analysis.risks` が空でも permission / execution failure 由来の hard block があれば利用導線を止める。

### 設定項目と定数一覧

| 項目                                        | 値                                       | 用途                       |
| ------------------------------------------- | ---------------------------------------- | -------------------------- |
| `LIFECYCLE_SCORE_THRESHOLDS.reviseRequired` | `60`                                     | 差し戻し境界               |
| `LIFECYCLE_SCORE_THRESHOLDS.useReady`       | `80`                                     | 利用開始境界               |
| `LIFECYCLE_STAGE_WEIGHTS.draft`             | `prompt=1.0`                             | draft は prompt のみで判定 |
| `LIFECYCLE_STAGE_WEIGHTS.post_create`       | `prompt=0.45, skill=0.55`                | create 直後の保存判断      |
| `LIFECYCLE_STAGE_WEIGHTS.post_execute`      | `prompt=0.2, skill=0.45, execution=0.35` | execute 後の利用判断       |
| `LIFECYCLE_STAGE_WEIGHTS.post_improve`      | `prompt=0.25, skill=0.55, execution=0.2` | 改善後の再判定             |
