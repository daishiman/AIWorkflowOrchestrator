# TASK-P0-07: implementation-guide

## 概要

`RuntimeSkillCreatorFacade` の `plan()` / `improve()` が、`workflow-manifest.json` の `resources` を優先して動的に resource を解決し、manifest が存在しない場合は `PLAN_RESOURCE_REQUESTS` / `IMPROVE_RESOURCE_REQUESTS` に戻るようにした。manifest が壊れている、または plan / improve phase もしくは phase の `resourceIds` が欠けている場合は `VALIDATION_ERROR` で止める。

あわせて `SkillCreatorSourceResolver` は同一 root を 1 件にまとめるようになり、manifest / explicit / env の候補が重複して provenance を汚さないようになった。

## Part 1: 中学生レベルの説明

### なぜ必要か

たとえば、図書館で「赤い本を持ってきて」とだけ言うと、人によって探す本が変わってしまいます。  
今までは `improve-prompt` のような決め打ちの名前に頼っていたので、別の棚の本を使いたいときに柔軟に切り替えにくい状態でした。

### 何を変えたか

- `plan()` と `improve()` が、棚のラベルではなく `workflow-manifest.json` の案内表を先に見るようにした
- 案内表がそもそも見つからないときだけ、昔からある標準の並び方に戻すようにした
- 案内表があるのに中身が壊れているときは、こっそり無視せず間違いとして知らせるようにした
- 同じ場所を指す案内が 2 回入っても、1 回だけ数えるようにした

### この機能でできること

- スキルごとに違う案内表をそのまま使える
- 1 つの案内表が壊れていれば、標準の並び方にごまかさず間違いを知らせる
- 同じ場所を複数回たどってしまう無駄を減らせる

### たとえ話

同じ部屋に入口が 3 つあっても、実際の部屋が 1 つなら案内は 1 つで十分です。  
今回の変更は、その「同じ部屋を 1 つにまとめる」整理と、「案内があればそれを優先する」切り替えです。

## Part 2: 技術者レベルの説明

### 変更対象

- `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`
- `apps/desktop/src/main/services/runtime/SkillCreatorSourceResolver.ts`
- `apps/desktop/src/main/services/runtime/improvePromptConstants.ts`
- `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.p0-07-dynamic-agent-names.test.ts`
- `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.plan-resource-selection.test.ts`
- `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.improve-resource-selection.test.ts`
- `apps/desktop/src/main/services/runtime/__tests__/SkillCreatorSourceResolver.test.ts`
- `apps/desktop/src/main/services/runtime/__tests__/PhaseResourcePlanner.test.ts`

### 主要な型と関数

```typescript
type SkillCreatorOperation = "plan" | "execute" | "improve" | "verify";

interface PhaseResourceRequest {
  id: string;
  kind: "agent" | "reference" | "schema" | "asset";
  relativePath: string;
  tier: "required-core" | "required-context" | "optional-quality" | "optional-deep-dive";
  required: boolean;
}

resolveOperationResources(
  fallbackRequests: readonly PhaseResourceRequest[],
  maxBytes: number,
  operation: SkillCreatorOperation,
): Promise<{ resources: PlannedSkillCreatorResource[]; sourceProvenance?: ... }>;

buildManifestPhaseResourceRequests(
  manifest: LoadedWorkflowManifest | undefined,
  operation: SkillCreatorOperation,
): readonly PhaseResourceRequest[] | undefined;
```

### APIシグネチャ

- `plan()` は `SkillCreatorFacade` の公開入口として、`PLAN_RESOURCE_REQUESTS` または manifest 由来の request set を使う
- `improve()` は `IMPROVE_RESOURCE_REQUESTS` または manifest 由来の request set を使う
- `buildPlanSystemPrompt()` は agent / reference の sections を 1 本の system prompt にまとめる

### データフロー

1. `resolveOperationResources()` が `workflow-manifest.json` を読み込む
2. `buildManifestPhaseResourceRequests()` が `phase.id === operation` の `resourceIds` を `PhaseResourceRequest` に変換する
3. manifest 側の request が作れたらそれを優先する
4. manifest が存在しない場合は `PLAN_RESOURCE_REQUESTS` / `IMPROVE_RESOURCE_REQUESTS` にフォールバックする
5. manifest が壊れている場合や phase の `resourceIds` が欠けている場合は `VALIDATION_ERROR` を返す
6. `SkillCreatorSourceResolver` が manifest / explicit / env の候補 root を `rootPath` ベースで dedupe する
7. `PhaseResourcePlanner` が resource を選び、`source conflict` や `budget overflow` を degrade reason として記録する

### エラーハンドリング

- manifest の parse / schema error は `VALIDATION_ERROR` にする
- manifest の phase が存在しても `resourceIds` が未定義 / 空配列 / 参照不能なら `VALIDATION_ERROR` にする
- `resourceLoader.loadAgent()` が失敗した場合は既存どおり例外を伝播する
- `IMPROVE_RESOURCE_REQUESTS` の agent が 0 件でも system prompt は生成できる
- 同一 root の重複候補は `SkillCreatorSourceResolver` 側で 1 件に正規化する

### エッジケース

- manifest がない場合は static fallback だけで動く
- manifest に canonical `plan` / `improve` phase がない場合は validation error で止める
- manifest が壊れている、または phase の `resourceIds` が空 / 未定義 / 参照不能な場合は validation error で止める
- 同一 root が explicit / env / manifest の複数経路から見つかっても 1 件として扱う
- agent resource が 0 件でも improve の system prompt は空にならない

### 設定可能なパラメータ / 定数

| 名前                                                    | 役割                             |
| ------------------------------------------------------- | -------------------------------- |
| `PLAN_RESOURCE_REQUESTS`                                | plan の fallback resource set    |
| `IMPROVE_RESOURCE_REQUESTS`                             | improve の fallback resource set |
| `PLAN_PROMPT_CONSTANTS.DEFAULT_CONTEXT_BUDGET_BYTES`    | plan の budget 上限              |
| `IMPROVE_PROMPT_CONSTANTS.DEFAULT_CONTEXT_BUDGET_BYTES` | improve の budget 上限           |
| `PLAN_PROMPT_CONSTANTS.DEFAULT_MODEL_ID`                | plan 用 LLM model                |
| `IMPROVE_PROMPT_CONSTANTS.DEFAULT_MODEL_ID`             | improve 用 LLM model             |

### 使用例

```typescript
const planResult = await facade.plan("...", "api-key", "sk-test");
const improveResult = await facade.improve(
  "skill-name",
  "feedback",
  "api-key",
  "sk-test",
);
```

### 期待される動作

- custom manifest の plan resources が優先される
- custom manifest の improve resources が優先される
- manifest が壊れているときは既定の request set に戻らず validation error になる
- same-root 候補は 1 件にまとまる

## Validation

- `pnpm --filter @repo/desktop exec vitest run src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.plan-resource-selection.test.ts src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.improve-resource-selection.test.ts src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.p0-07-dynamic-agent-names.test.ts src/main/services/runtime/__tests__/SkillCreatorSourceResolver.test.ts src/main/services/runtime/__tests__/PhaseResourcePlanner.test.ts`
- `pnpm --filter @repo/desktop exec tsc -p tsconfig.json --noEmit`

## 視覚検証

UI/UX 変更はないため、スクリーンショット参照は不要。
