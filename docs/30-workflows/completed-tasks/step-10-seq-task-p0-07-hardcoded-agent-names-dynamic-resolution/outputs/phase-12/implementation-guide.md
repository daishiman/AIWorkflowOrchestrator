# implementation-guide.md — Phase 12 成果物 (TASK-P0-07)

## Part 1: 中学生レベルの説明

### たとえ話で理解する

スキル作成システムには「名簿係」がいます。
「名簿係」は AI エージェントの名前リストを持っていて、
システムが「どのエージェントを呼べばいい？」と聞いたとき、名前を教えます。

**変更前**: 名簿係が「discover-problem, design-workflow, plan-structure の 3 人だよ」と
**紙に書いて固定**していた（ハードコード）。

**変更後**: 名簿係がスキルの設定ファイル（manifest）を読んで
「このスキルは○○と○○のエージェントが必要だよ」と動的に教えるようになった。
設定ファイルにエージェントが書かれていない場合は、従来の 3 人をデフォルトとして使う（フォールバック）。

### なぜ必要だったか

異なるスキル定義が異なるエージェント構成を持てるようにするため。
「discovery」フェーズが不要なスキルや、独自のエージェントを使いたいスキルでも
正しく動作できるようになった。

たとえば、学校の係決めで毎回「掃除係・黒板係・日直だけ」と決め打ちすると、
特別授業で必要な「配布係」や「撮影係」を呼べない。今回の変更は、
時間割を見てその日に必要な係を呼ぶ形に直したものです。

---

## Part 2: 技術者レベルの説明

### 変更の概要

`PLAN_PROMPT_CONSTANTS.AGENT_NAMES` と `IMPROVE_PROMPT_CONSTANTS.AGENT_NAME` という
2 つのハードコード定数を削除し、manifest phase と `AgentNameResolver` による動的解決へ置き換えた。

### 追加された型

```typescript
// packages/shared/src/types/skillCreator.ts
export interface AgentConfig {
  /** 解決されたエージェント名リスト */
  names: readonly string[];
}
```

### 新規クラス: AgentNameResolver

```typescript
// apps/desktop/src/main/services/runtime/AgentNameResolver.ts
export const DEFAULT_PLAN_AGENT_NAMES: readonly string[] = [
  "discover-problem",
  "design-workflow",
  "plan-structure",
] as const;

export class AgentNameResolver {
  /**
   * manifest の resources (kind === "agent") から名前を解決。
   * agent リソースなし → defaultNames にフォールバック。
   */
  resolveFromManifest(
    manifest: LoadedWorkflowManifest,
    defaultNames?: readonly string[],
  ): AgentConfig;

  /**
   * PhaseResourceRequest 配列から agent のみフィルタして解決。
   * ManifestLoader 非使用の legacy path で使用。
   */
  resolveFromRequests(requests: readonly PhaseResourceRequest[]): AgentConfig;
}
```

### ManifestLoader の拡張

```typescript
// apps/desktop/src/main/services/runtime/ManifestLoader.ts
extractAgentConfig(manifest: LoadedWorkflowManifest): AgentConfig {
  // kind === "agent" の resources ID を返す
  // agent なしは空 names（呼び出し元でフォールバック）
}
```

### RuntimeSkillCreatorFacade の変更点

#### current contract

- dynamic pipeline あり: `workflow-manifest.json` の phase 定義から `plan` / `improve` で必要な resource を抽出する
- dynamic pipeline なし + manifest あり: legacy path でも manifest の phase resource を直接読む
- manifest なし: `PLAN_RESOURCE_REQUESTS` / `IMPROVE_RESOURCE_REQUESTS` にフォールバックする

#### plan() legacy branch (before)

```typescript
for (const name of PLAN_PROMPT_CONSTANTS.AGENT_NAMES) {
  const content = await this.resourceLoader.loadAgent(name);
```

#### plan() legacy branch (after)

```typescript
const agentConfig = new AgentNameResolver().resolveFromRequests(
  PLAN_RESOURCE_REQUESTS,
);
for (const name of agentConfig.names) {
  const content = await this.resourceLoader.loadAgent(name);
```

#### improve() legacy branch (before)

```typescript
agentPrompt = await this.resourceLoader!.loadAgent(
  IMPROVE_PROMPT_CONSTANTS.AGENT_NAME,
);
```

#### improve() legacy branch (after)

```typescript
const improveAgentConfig = new AgentNameResolver().resolveFromRequests(
  IMPROVE_RESOURCE_REQUESTS,
);
agentPrompt = await this.resourceLoader!.loadAgent(
  improveAgentConfig.names[0] ?? "improve-prompt",
);
```

### エラーハンドリング

- `resolveFromManifest`: 例外なし。agent なしで defaultNames にフォールバック
- `resolveFromRequests`: 空配列入力は空 names を返す（例外なし）
- `extractAgentConfig`: 例外なし。空 names 返却は呼び出し元の責務
- `loadOperationResourcesFromManifest`: 対象 phase に agent がなければ manifest 利用を諦め、従来 request 定義へフォールバック
- UI 変更はないため screenshot は N/A。Phase 11 は targeted runtime tests を非視覚証跡として扱う

### 設定可能パラメータ

| パラメータ                                       | 型                  | デフォルト                                                  | 説明                                |
| ------------------------------------------------ | ------------------- | ----------------------------------------------------------- | ----------------------------------- |
| `DEFAULT_PLAN_AGENT_NAMES`                       | `readonly string[]` | `["discover-problem", "design-workflow", "plan-structure"]` | plan() のデフォルトエージェント名   |
| `defaultNames` (resolveFromManifest の第 2 引数) | `readonly string[]` | `DEFAULT_PLAN_AGENT_NAMES`                                  | manifest agent なし時フォールバック |

### 使用例

```typescript
const manifest = await manifestLoader.loadManifest(
  path.join(skillRoot, "workflow-manifest.json"),
);

const agentConfig = new AgentNameResolver().resolveFromManifest(manifest);
// => manifest の agent resource IDs を順序付きで取得
```
