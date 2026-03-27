# Implementation Guide

## 2026-03-27 実装反映

- `SkillCreatorSourceResolver` を新規追加し、固定 `DEFAULT_SKILL_CREATOR_PATH` 1本ではなく複数候補 root を列挙・監査できるようにした。
- `PhaseResourcePlanner` を新規追加し、resource kind、tier、budget、degrade reason を `RuntimeSkillCreatorFacade` から分離した。
- `ResolvedResourceReader` を新規追加し、選択済み absolute path 読み込みと legacy `ResourceLoader` 再利用を両立させた。
- `RuntimeSkillCreatorFacade.plan()` / `improve()` は dynamic pipeline 注入時に selective loading を使い、未注入時のみ従来の fixed loader 経路へフォールバックする。
- `apps/desktop/src/main/ipc/index.ts` は runtime facade 生成時に resolver / planner / reader を注入するよう更新した。
- public IPC shape (`RuntimeSkillCreatorPlanResponse` / `RuntimeSkillCreatorExecuteResponse` / `RuntimeSkillCreatorImproveResponse`) は変更していない。

## Part 1: 中学生レベルの説明

### 1.1 この task がそろえるもの

この task は、「どの資料を読むか」だけではなく、「いま正しいと分かっている土台」と「今回あとから足す工夫」を分けて整理する作業です。

たとえば学校の調べ学習で、先生がすでに配っている必須プリントがあるのに、自分で作ったメモと混ぜてしまうと、どこまでが公式情報か分からなくなります。Task03 では、まず公式プリントにあたる情報を固定し、その上で「読む順番」や「読みすぎたときに何を減らすか」を追加します。

### 1.2 なぜ分けるのか

`skill-creator` では、manifest や shared types がすでに「土台の事実」を持っています。そこを書き換えずに再利用した方が、設計は短くなり、あとで Task04 から Task08 に渡す説明もぶれません。

### 1.3 この task が新しく決めること

| 項目                                 | 土台か追加差分か | 内容                                                    |
| ------------------------------------ | ---------------- | ------------------------------------------------------- |
| `resourceIds` を起点に読む順番を作る | 追加差分         | Phase ごとに必要資料を選ぶ                              |
| 読みすぎたときの縮退ルール           | 追加差分         | optional resource を先に落とす                          |
| 読んだ証拠を downstream へ渡す       | 土台 + 追加差分  | foundation snapshot に selection / degrade 理由を重ねる |
| public IPC の返り値                  | 土台             | 既存 shape を変えない                                   |

### 1.4 完成形

- 現ブランチで既に正しい情報を壊さずに使える
- Task03 が増やすロジックだけを短く説明できる
- 読めなかった理由や落とした資料を後続 task へ渡せる

## Part 2: 技術者向け説明

### 2.1 現ブランチの current canonical facts

Task03 が前提にする正本は、まず shared types と runtime loader である。

```ts
export const WORKFLOW_MANIFEST_SCHEMA_VERSION = 1 as const;

export interface WorkflowManifestPhase {
  id: string;
  title: string;
  dependsOn?: string[];
  resourceIds?: string[];
  entryHookId: string;
  exitHookId: string;
}

export interface LoadedWorkflowManifest extends WorkflowManifest {
  sourcePath: string;
  manifestDir: string;
  manifestMtimeMs: number;
  resourceDescriptorHash: string;
  cacheKey: string;
  resources: NormalizedWorkflowManifestResourceDescriptor[];
}

export type RuntimeSkillCreatorExecuteResponse =
  | RuntimeSkillCreatorExecuteResult
  | {
      type: "terminal_handoff";
      bundle: TerminalHandoffBundle;
    };
```

補足:

- `WorkflowManifestPhase.resourceIds` は Task03 planner が最初に見る phase-to-resource の正本である。
- `LoadedWorkflowManifest` の `sourcePath` / `manifestDir` / `manifestMtimeMs` / `resourceDescriptorHash` / `cacheKey` は Task01 foundation snapshot であり、Task03 が再定義してはいけない。
- `RuntimeSkillCreatorExecuteResponse` は public IPC 形状なので、Task03 では内部ロジックを増やしても外形は維持する。

### 2.2 現ブランチで維持する ownership

```ts
export class ManifestLoader {
  async loadManifest(manifestPath: string): Promise<LoadedWorkflowManifest> {
    // sourcePath / manifestDir / manifestMtimeMs /
    // resourceDescriptorHash / cacheKey を確定する owner
  }
}

export class ResourceLoader {
  async load(category: ResourceCategory, name: string): Promise<string> {
    // basePath/category/name を読む leaf reader
  }
}
```

解釈:

- `ManifestLoader` は manifest 正規化と foundation snapshot の owner として維持する。
- `ResourceLoader` は leaf file を読む adapter であり、source root 決定や provenance 正本を持たせない。
- したがって Task03 の改善は、既存 owner を置き換えるのではなく、その上に planner / resolver / reader を薄く積む設計が最小複雑性である。

### 2.3 Task03 の target delta

以下は「今回新しく整理する内部契約」であり、現時点の branch に既に存在する public type ではない。

```ts
interface Task03SelectionExtension {
  selectedPhaseId: string;
  requestedResourceIds: string[];
  selectedResourceIds: string[];
  optionalDropIds: string[];
  degradeReasons: string[];
}

interface SkillCreatorSourceResolver {
  resolveRoots(input: {
    manifestSourcePath: string;
    explicitRoots?: string[];
    envRoots?: string[];
  }): Promise<
    Array<{
      mode: "manifest" | "explicit" | "env" | "home" | "repo";
      rootPath: string;
    }>
  >;
}

interface PhaseResourcePlanner {
  buildPlan(input: {
    manifest: LoadedWorkflowManifest;
    phaseId: string;
    budgetTokens: number;
  }): Promise<Task03SelectionExtension>;
}

interface ResolvedResourceReader {
  readSelectedResources(input: {
    manifest: LoadedWorkflowManifest;
    selection: Task03SelectionExtension;
  }): Promise<Array<{ id: string; absolutePath: string; content: string }>>;
}
```

要点:

- planner は `WorkflowManifestPhase.resourceIds` から開始する。
- extension は foundation snapshot を置き換えず、その横に `selectedResourceIds` や `degradeReasons` を積む。
- downstream へ渡す provenance は `LoadedWorkflowManifest` の foundation fields と Task03 extension の合成で説明する。

### 2.4 推奨呼び出し順

1. `ManifestLoader.loadManifest()` で manifest と foundation snapshot を取得する。
2. `PhaseResourcePlanner` が phase の `resourceIds` と `resources` を見て selection plan を作る。
3. `SkillCreatorSourceResolver` が root 候補を整列し、必要なら explicit / env / home / repo を補助候補に加える。
4. `ResolvedResourceReader` が選ばれた resource を読む。
5. `ResourceLoader` は leaf read の互換レイヤとして残し、既存コードからの移行点を限定する。

### 2.5 API シグネチャと使用例

```ts
class RuntimeSkillCreatorFacade {
  plan(
    skillSpec: string,
    authMode: AuthMode,
    apiKey: string | null,
  ): Promise<RuntimeSkillCreatorPlanResponse>;

  improve(
    skillName: string,
    feedback: string,
    authMode: AuthMode,
    apiKey: string | null,
  ): Promise<RuntimeSkillCreatorImproveResponse>;
}
```

```ts
const facade = new RuntimeSkillCreatorFacade({
  skillExecutor,
  llmAdapter,
  resourceLoader,
  sourceResolver: new SkillCreatorSourceResolver(),
  resourcePlanner: new PhaseResourcePlanner(),
  resolvedResourceReader: new ResolvedResourceReader(resourceLoader),
});

const plan = await facade.plan("Slack 通知 skill を作る", "api-key", "sk-test");
const improve = await facade.improve(
  "slack-notifier",
  "失敗時の再試行方針を追加する",
  "api-key",
  "sk-test",
);
```

要点:

- `plan()` は dynamic pipeline がある場合、required/optional resource を選別して system prompt を構築する。
- `improve()` は `SKILL.md` と improve prompt、必要に応じて追加 reference を読み、JSON schema instruction を末尾に付与する。

### 2.6 設定可能パラメータと定数

| 定数 / パラメータ                                               | 定義箇所                    | 役割                                 |
| --------------------------------------------------------------- | --------------------------- | ------------------------------------ |
| `PLAN_PROMPT_CONSTANTS.DEFAULT_CONTEXT_BUDGET_BYTES = 16384`    | `planPromptConstants.ts`    | plan 用の context budget 上限        |
| `PLAN_PROMPT_CONSTANTS.DEFAULT_MODEL_ID`                        | `planPromptConstants.ts`    | plan 用モデル                        |
| `PLAN_PROMPT_CONSTANTS.DEFAULT_MAX_TOKENS`                      | `planPromptConstants.ts`    | plan 応答長の上限                    |
| `PLAN_PROMPT_CONSTANTS.DEFAULT_TEMPERATURE`                     | `planPromptConstants.ts`    | plan 生成温度                        |
| `IMPROVE_PROMPT_CONSTANTS.DEFAULT_CONTEXT_BUDGET_BYTES = 12288` | `improvePromptConstants.ts` | improve 用の context budget 上限     |
| `IMPROVE_PROMPT_CONSTANTS.DEFAULT_MODEL_ID`                     | `improvePromptConstants.ts` | improve 用モデル                     |
| `IMPROVE_PROMPT_CONSTANTS.DEFAULT_MAX_TOKENS`                   | `improvePromptConstants.ts` | improve 応答長の上限                 |
| `IMPROVE_PROMPT_CONSTANTS.DEFAULT_TEMPERATURE`                  | `improvePromptConstants.ts` | improve 生成温度                     |
| `PhaseResourceRequest.tier`                                     | `PhaseResourcePlanner.ts`   | required / optional と drop 順の制御 |
| `PhaseResourceRequest.required`                                 | `PhaseResourcePlanner.ts`   | 必須 resource の fail-fast 判定      |

### 2.7 エラーハンドリングと縮退

| ケース                                           | 期待動作                                                        |
| ------------------------------------------------ | --------------------------------------------------------------- |
| manifest に required resource があり、実体がない | `ManifestLoader` 側で fail fast し、silent fallback しない      |
| optional resource が存在しない                   | selection plan で drop と理由を残して継続する                   |
| budget 超過                                      | optional resource を優先的に落とし、`degradeReasons` に記録する |
| root 競合                                        | 選ばれた root と非採用候補を provenance に残す                  |
| public response 変更が必要になった               | Task03 の範囲外として Step 2 reopen 条件へ送る                  |

### 2.8 非目標

- `ManifestLoader` を別責務へ分解し直すこと
- `RuntimeSkillCreatorExecuteResponse` など public IPC 形状を変えること
- `ResourceLoader` を source authority に作り替えること

### 2.9 実装対象ファイル

- `packages/shared/src/types/skillCreator.ts`
  - 現時点では読み取り正本。public type 拡張が必要になった場合のみ更新対象
- `apps/desktop/src/main/services/runtime/ManifestLoader.ts`
  - foundation snapshot の再利用先。原則として redesign しない
- `apps/desktop/src/main/services/skill/ResourceLoader.ts`
  - leaf reader / compatibility adapter として扱う
- `apps/desktop/src/main/services/runtime/SkillCreatorSourceResolver.ts`
- `apps/desktop/src/main/services/runtime/PhaseResourcePlanner.ts`
- `apps/desktop/src/main/services/runtime/ResolvedResourceReader.ts`
