# Phase 2 成果物: 技術設計書

## コンポーネント構成

```
PLAN_RESOURCE_REQUESTS (planPromptConstants.ts)
  └── kind === "agent" フィルタリング
      └── ResourceLoader.loadAgent(request.id)   ← fallback path
                                                   (hasDynamicResourcePipeline() === false)

IMPROVE_RESOURCE_REQUESTS (improvePromptConstants.ts)
  └── kind === "agent" フィルタリング
      └── ResourceLoader.loadAgent(request.id)   ← fallback path
                                                   (hasDynamicResourcePipeline() === false)

workflow-manifest.json の phases[plan|improve].resourceIds
  └── ManifestLoader.loadManifest()
      └── buildManifestPhaseResourceRequests(manifest, operation)
          └── resolveOperationResources(PLAN/IMPROVE_RESOURCE_REQUESTS, ...)  ← dynamic path

SkillCreatorSourceResolver
  └── manifest / explicit / env の候補 root を rootPath ベースで dedupe
```

## 変更前後の比較

### Before (ハードコード / plan, improve 共通で固定)

```typescript
// plan() dynamic path は manifest を使わず static request をそのまま利用
const resolved = await this.resolveOperationResources(
  PLAN_RESOURCE_REQUESTS,
  PLAN_PROMPT_CONSTANTS.DEFAULT_CONTEXT_BUDGET_BYTES,
  "plan",
);

// improve() fallback path
} else {
  agentPrompt = await this.resourceLoader!.loadAgent(
    IMPROVE_PROMPT_CONSTANTS.AGENT_NAME,  // "improve-prompt" ハードコード
  );
}
```

### After (動的解決)

```typescript
// plan() / improve() 共通: manifest 優先 + fallback
const resolved = await this.resolveOperationResources(
  PLAN_RESOURCE_REQUESTS,
  PLAN_PROMPT_CONSTANTS.DEFAULT_CONTEXT_BUDGET_BYTES,
  "plan",
);

// improve() fallback path - IMPROVE_RESOURCE_REQUESTS が唯一の source of truth
} else {
  const agentParts: string[] = [];
  for (const request of IMPROVE_RESOURCE_REQUESTS.filter(
    (r) => r.kind === "agent",
  )) {
    const content = await this.resourceLoader!.loadAgent(request.id);
    agentParts.push(content);
  }
  agentPrompt = agentParts.join("\n\n");
}
```

## インターフェース変更

### `improvePromptConstants.ts` の `IMPROVE_PROMPT_CONSTANTS`

```typescript
// Before
export const IMPROVE_PROMPT_CONSTANTS = {
  AGENT_NAME: "improve-prompt",  // 削除
  RESPONSE_FORMAT_START: "=== IMPROVE RESPONSE FORMAT ===",
  ...
};

// After
export const IMPROVE_PROMPT_CONSTANTS = {
  // AGENT_NAME は削除 — IMPROVE_RESOURCE_REQUESTS を使用すること
  RESPONSE_FORMAT_START: "=== IMPROVE RESPONSE FORMAT ===",
  ...
};
```

### `RuntimeSkillCreatorFacade.ts` の内部ヘルパー

- `buildManifestPhaseResourceRequests(manifest, operation)` で manifest の `resources` を `PhaseResourceRequest` に変換
- `getDefaultResourceTier()` で kind ごとの tier を決定
- `getLegacyResourceCategory()` で legacy category を補完

### `SkillCreatorSourceResolver.ts`

- `rootPath` 単位で候補 root を dedupe
- manifest / explicit / env の同一ツリーを重複登録しない

## データフロー設計

```
plan() 呼び出し
├── hasDynamicResourcePipeline() === true
│   └── resolveOperationResources(PLAN_RESOURCE_REQUESTS, ..., "plan")
│       ├── loadWorkflowManifest() で manifest 読み込み
│       ├── buildManifestPhaseResourceRequests(manifest, "plan") で manifest優先
│       └── fallback: PLAN_RESOURCE_REQUESTS をそのまま使用
│
└── hasDynamicResourcePipeline() === false (resourceLoader のみ)
    └── PLAN_RESOURCE_REQUESTS.filter(r => r.kind === "agent") を反復
        └── resourceLoader.loadAgent(request.id) を各エントリで呼ぶ

improve() 呼び出し
├── hasDynamicResourcePipeline() === true
│   └── resolveOperationResources(IMPROVE_RESOURCE_REQUESTS, ..., "improve")
│       ├── loadWorkflowManifest() で manifest 読み込み
│       ├── buildManifestPhaseResourceRequests(manifest, "improve") で manifest優先
│       └── fallback: IMPROVE_RESOURCE_REQUESTS をそのまま使用
│
└── hasDynamicResourcePipeline() === false (resourceLoader のみ)
    └── IMPROVE_RESOURCE_REQUESTS.filter(r => r.kind === "agent") を反復
        └── resourceLoader.loadAgent(request.id) を各エントリで呼ぶ
```

## エラーハンドリング方針

- `resourceLoader.loadAgent()` が失敗した場合は例外をそのまま伝播（既存挙動と同じ）
- `IMPROVE_RESOURCE_REQUESTS` に agent エントリが0件の場合は `agentPrompt = ""` となり、system prompt はスキーマ指示のみになる（graceful degradation）

## 後方互換性

- `IMPROVE_RESOURCE_REQUESTS` の唯一のagentエントリ id が `"improve-prompt"` であるため、`loadAgent("improve-prompt")` が引き続き呼ばれ、既存テストが影響なしでpassする
