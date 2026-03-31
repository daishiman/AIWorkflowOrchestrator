# design-document.md — Phase 2 成果物

## コンポーネント構成

### Source of Truth（責務境界）

```
[PLAN_RESOURCE_REQUESTS]     ← デフォルト agent 名の源泉
        ↓
[AgentNameResolver]          ← 動的解決ユーティリティ（新規）
  .resolveFromManifest(m)    ← manifest 由来
  .resolveFromRequests(req)  ← PLAN/IMPROVE_RESOURCE_REQUESTS 由来（フォールバック）
        ↓
[ManifestLoader]             ← manifest 読み込み（既存、extractAgentConfig 追加）
        ↓
[RuntimeSkillCreatorFacade]  ← plan()/improve() の legacy branch で使用（既存、変更）
```

### フォールバック順序

```
manifest → manifest agent resources ID 列
  ↓ (agent resources なし)
defaults → PLAN_RESOURCE_REQUESTS.filter(kind==="agent").map(id)
```

## インターフェース定義

### `AgentConfig` (packages/shared/src/types/skillCreator.ts 追加)

```typescript
export interface AgentConfig {
  /** 解決されたエージェント名リスト */
  names: readonly string[];
}
```

### `AgentNameResolver` (apps/desktop/src/main/services/runtime/AgentNameResolver.ts 新規)

```typescript
export class AgentNameResolver {
  resolveFromManifest(
    manifest: LoadedWorkflowManifest,
    defaultNames?: readonly string[],
  ): AgentConfig;

  resolveFromRequests(requests: readonly PhaseResourceRequest[]): AgentConfig;
}
```

### `ManifestLoader.extractAgentConfig` (既存クラスにメソッド追加)

```typescript
extractAgentConfig(manifest: LoadedWorkflowManifest): AgentConfig;
```

## データフロー設計

### plan() legacy branch

```
Before: for (const name of PLAN_PROMPT_CONSTANTS.AGENT_NAMES)
After:  const config = agentNameResolver.resolveFromRequests(PLAN_RESOURCE_REQUESTS)
        for (const name of config.names)
```

### improve() legacy branch

```
Before: this.resourceLoader!.loadAgent(IMPROVE_PROMPT_CONSTANTS.AGENT_NAME)
After:  const config = agentNameResolver.resolveFromRequests(IMPROVE_RESOURCE_REQUESTS)
        this.resourceLoader!.loadAgent(config.names[0])
```

## エラーハンドリング方針

- `resolveFromManifest` は例外を投げない。agent resources が空なら defaultNames にフォールバック
- `resolveFromRequests` は空配列を返す可能性あり（呼び出し元で確認）
- Facade では config.names が空の場合は既存動作（agent 読み込みスキップ）と同等

## 破棄判断

- `AGENT_NAMES` 定数は `PLAN_RESOURCE_REQUESTS` の重複。安全に削除可能
- `AGENT_NAME` 定数は `IMPROVE_RESOURCE_REQUESTS[0].id` の重複。安全に削除可能
- patch（定数を維持しつつ参照を追加）ではなく再構成（定数を削除して単一源泉に統合）を採用
