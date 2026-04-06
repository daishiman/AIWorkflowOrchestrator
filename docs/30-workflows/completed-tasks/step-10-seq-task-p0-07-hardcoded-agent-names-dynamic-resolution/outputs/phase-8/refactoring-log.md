# Phase 8 成果物: リファクタリングログ

## コード品質評価

実装変更は fallback の統一と manifest 優先化、source resolver の安定化に集約されており、スコープは実質 3 箇所に収まっている。

### 変更1: `improvePromptConstants.ts`

- `AGENT_NAME` フィールドを除去
- `IMPROVE_RESOURCE_REQUESTS` がその役割を担う

### 変更2: `RuntimeSkillCreatorFacade.ts` improve() fallback

- `IMPROVE_RESOURCE_REQUESTS` ベースの反復パターンに統一
- `plan()` fallback との命名・コメントの一貫性を確保

### 変更3: `RuntimeSkillCreatorFacade.ts` plan() dynamic path / `SkillCreatorSourceResolver.ts`

- `plan()` の resource 解決を manifest 優先に統一
- `buildManifestPhaseResourceRequests()` で plan/improve の request 生成を共通化
- `SkillCreatorSourceResolver` の root dedupe を `rootPath` ベースに簡素化

## パターン統一確認

`plan()` と `improve()` の fallback path が同じイディオムになった:

```typescript
// plan() fallback (変更なし・既存)
for (const request of PLAN_RESOURCE_REQUESTS.filter(
  (r) => r.kind === "agent",
)) {
  const content = await this.resourceLoader.loadAgent(request.id);
  agentSpecs.push({ name: request.id, content });
}

// improve() fallback (今回変更)
const agentParts: string[] = [];
for (const request of IMPROVE_RESOURCE_REQUESTS.filter(
  (r) => r.kind === "agent",
)) {
  const content = await this.resourceLoader!.loadAgent(request.id);
  agentParts.push(content);
}
agentPrompt = agentParts.join("\n\n");
```

## root dedupe の副作用抑制

- manifest / explicit / env の同一 root を 1 件にまとめることで provenance が過剰に膨らむことを防ぐ
- source conflict は planner 側の `suppressedRoots` と `degradeReasons` で追跡する

## 追加リファクタリング不要

変更スコープが最小かつ意図が明確であるため、追加のリファクタリングは不要。

## テスト確認

`pnpm vitest run "apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade"` → **223テスト全PASS**
