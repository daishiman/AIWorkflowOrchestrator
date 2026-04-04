# Implementation Guide: step-11-par-task-plan-execution-hardening

## Part 1: 概念説明（中学生レベル）

### なぜこの変更が必要だったか

たとえば、「好きなスポーツ選手のリスト」が2つの場所に書いてあると想像してください。
一方を更新したのに、もう一方を忘れると、2つのリストがバラバラになってしまいます。

このバグも同じ構造でした。

**TASK-P0-07（runtime の agent 名重複）:**

- `planPromptConstants.ts` に `AGENT_NAMES` という「agent の名前リスト」がハードコードされていた
- `PLAN_RESOURCE_REQUESTS` にも同じ agent が定義されていた
- どちらかだけ変更すると、もう一方と食い違う「ドリフト（ずれ）」が発生する
- 解決策: `PLAN_RESOURCE_REQUESTS` だけを正本にし、`AGENT_NAMES` を削除する

**TASK-SDK-04-U2（renderer の承認済み snapshot 逸脱）:**

- 「計画を承認した時のスペック」（`approvedSkillSpec`）と「テキストエリアで今書いている内容」（`request`）が
  混同されていた（かどうか不明確だった）
- execute 時に「承認した時の内容」ではなく「今書いている内容」が使われると、
  ユーザーが承認したものと違うものが実行されてしまう
- 解決策: コメントで semantics を明確化し、`approvedSkillSpec` は plan 承認時点で凍結された snapshot であることを明示する

### 何をするか

1. `AGENT_NAMES` を削除 → `PLAN_RESOURCE_REQUESTS` の `kind === "agent"` エントリから動的に agent 名を読む
2. `approvedSkillSpec` の state 宣言・セット・execute 呼び出し箇所にコメントを追加し、live textarea から独立していることを明示する

---

## Part 2: 実装詳細

### TASK-P0-07

#### TypeScript 変更（planPromptConstants.ts）

```typescript
// 変更前
export const PLAN_PROMPT_CONSTANTS = {
  ...
  AGENT_NAMES: ["discover-problem", "design-workflow", "plan-structure"] as const,
  ...
} as const;

// 変更後（AGENT_NAMES を削除）
export const PLAN_PROMPT_CONSTANTS = {
  ...
  // AGENT_NAMES は削除。agent 名は PLAN_RESOURCE_REQUESTS から導出する
  ...
} as const;
```

#### TypeScript 変更（RuntimeSkillCreatorFacade.ts の fallback path）

```typescript
// 変更前
} else if (this.resourceLoader) {
  for (const name of PLAN_PROMPT_CONSTANTS.AGENT_NAMES) {
    const content = await this.resourceLoader.loadAgent(name);
    agentSpecs.push({ name, content });
  }
  sourceProvenance = this.buildSourceProvenance();
}

// 変更後
} else if (this.resourceLoader) {
  // fallback path: PLAN_RESOURCE_REQUESTS が唯一の source of truth。
  // kind === "agent" のエントリのみを agent 名として使用し、reference が混入しない。
  for (const request of PLAN_RESOURCE_REQUESTS.filter(
    (r) => r.kind === "agent",
  )) {
    const content = await this.resourceLoader.loadAgent(request.id);
    agentSpecs.push({ name: request.id, content });
  }
  sourceProvenance = this.buildSourceProvenance();
}
```

#### API シグネチャ

変更なし（`ILLMAdapter`, `ResourceLoader` のシグネチャに変更なし）

#### 使用例

`PLAN_RESOURCE_REQUESTS` に新しい agent を追加するだけで、fallback path も自動的に追随する:

```typescript
// planPromptConstants.ts に新しい agent を追加するだけで OK
export const PLAN_RESOURCE_REQUESTS: readonly PhaseResourceRequest[] = [
  { id: "discover-problem", kind: "agent", ... },
  { id: "design-workflow", kind: "agent", ... },
  { id: "plan-structure", kind: "agent", ... },
  { id: "new-agent", kind: "agent", ... },  // これだけ追加すれば完結
  { id: "overview", kind: "reference", ... },  // reference は agentSpecs に混入しない
];
```

#### エラーハンドリング

- `resourceLoader.loadAgent()` が失敗した場合は例外が伝播する（既存の動作を維持）
- `PLAN_RESOURCE_REQUESTS` が空の場合は `agentSpecs` が空配列となり、system prompt に agent セクションが含まれない

#### エッジケース

- `PLAN_RESOURCE_REQUESTS` に `kind === "agent"` エントリが0件の場合: `agentSpecs` が空配列になる（graceful）
- `kind === "reference"` エントリのみの場合: `agentSpecs` が空配列になる（graceful）

---

### TASK-SDK-04-U2

#### TypeScript 変更（SkillLifecyclePanel.tsx）

```typescript
// 変更前（コメントなし）
const [approvedSkillSpec, setApprovedSkillSpec] = useState<string | null>(null);

// 変更後（semantics を明示するコメント追加）
// plan 承認時点の request snapshot を保持する。
// live textarea（request state）とは独立しており、
// handleExecutePlan は常にこの snapshot を execute payload として使用する。
// cancel または再生成まで不変。
const [approvedSkillSpec, setApprovedSkillSpec] = useState<string | null>(null);
```

```typescript
// snapshot 固定箇所のコメント追加
// plan 承認時点の request を snapshot として固定する。
// この後 textarea を編集しても execute payload は変わらない。
setApprovedSkillSpec(trimmedRequest);
```

```typescript
// execute 呼び出し箇所のコメント追加
// approved snapshot のみを execute payload として渡す。
// live textarea（request state）の値は使用しない。
const result = await skillCreatorApi.executePlan(
  planId,
  approvedSkillSpec ?? undefined,
);
```

#### Drift 防止テスト（SkillLifecyclePanel.llm-generation.test.tsx）

以下のテストが drift を防ぐ回帰テストとして機能する:

- **U-8b**: `executePlan("plan-001", "承認済みの依頼")` — textarea を変更しても変わらない
- **U-18b**: cancel → 再 plan で snapshot が差し替わる
- **U-19b**: 複数回の textarea 編集後も execute payload は固定
- **U-20b**: cancel 後の clearGenerationState 呼び出し確認
- **U-21**: execute 失敗後も approved snapshot が保持され、再実行可能

---

## 変更ファイル一覧

| ファイル                                                                                  | 変更種別 | 変更内容                                                          |
| ----------------------------------------------------------------------------------------- | -------- | ----------------------------------------------------------------- |
| `apps/desktop/src/main/services/runtime/planPromptConstants.ts`                           | 削除     | `AGENT_NAMES` 定数を削除                                          |
| `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`                     | 変更     | fallback path を `PLAN_RESOURCE_REQUESTS` ベースに変更 + コメント |
| `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.plan.test.ts` | 追加     | T-P7-02 / T-P7-04 テスト追加                                      |
| `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`                      | 変更     | `approvedSkillSpec` semantics コメント追加（3箇所）               |
