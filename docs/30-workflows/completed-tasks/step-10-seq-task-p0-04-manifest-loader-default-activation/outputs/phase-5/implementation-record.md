# Phase 5 成果物: 実装記録

## 実装概要

`RuntimeSkillCreatorFacade` に以下3点を実装した（TASK-P0-04）。

### 1. 3コンポーネント自動インスタンス化（AC-1/2/3）

コンストラクタで DI override パターンを適用:

```typescript
this.sourceResolver = deps.sourceResolver ?? new SkillCreatorSourceResolver();
this.resourcePlanner = deps.resourcePlanner ?? new PhaseResourcePlanner();
this.resolvedResourceReader =
  deps.resolvedResourceReader ??
  new ResolvedResourceReader(deps.resourceLoader);
```

フィールド宣言を optional から必須（`readonly`）に変更。

### 2. dynamic pipeline デフォルト有効（AC-4）

`plan()` と `improve()` の dynamic pipeline を try-catch で囲み、常に実行するよう変更:

```typescript
let dynamicPipelineSucceeded = false;
try {
  // resolveOperationResources → readPlannedResources
  if (dynamicAgentSpecs.length > 0 || ...) {
    dynamicPipelineSucceeded = true;
  }
} catch { /* fallback へ */ }
if (!dynamicPipelineSucceeded && this.resourceLoader) {
  // static loader fallback
}
```

### 3. manifest 自動発見（AC-5）

`loadWorkflowManifest()` を拡張し、`explicitRoot` なしでも candidates から自動発見:

```typescript
const resolution = await this.sourceResolver.resolve({});
for (const candidate of resolution.candidateRoots) {
  const manifestPath = path.join(candidate.rootPath, "workflow-manifest.json");
  try {
    await fs.access(manifestPath);
    return await this.manifestLoader.loadManifest(manifestPath);
  } catch {
    continue;
  }
}
```

## Phase 8 リファクタリング（死コード除去）

- 旧 `hasDynamicResourcePipeline()` ガード削除（呼び出し元なし、dynamic pipeline は常時試行）
- `resolveOperationResources()` の null check 削除（3コンポーネントは常に存在）
- `readPlannedResources()` の null check 削除（同上）

## fallback chain

```
dynamic pipeline (try)
  → manifest 発見 + resourcePlanner 成功 + resources あり → dynamicPipelineSucceeded = true
  → 上記以外 (catch or resources empty) → dynamicPipelineSucceeded = false
if (!dynamicPipelineSucceeded && resourceLoader):
  → static loader fallback (loadAgent × 3)
else if (!dynamicPipelineSucceeded):
  → degraded error (`resource_loader_unavailable`)
```

## テスト結果

- Phase 4 テスト: 7/7 通過（TC-01〜TC-04, TC-06, TC-07, TC-08）
- 既存テスト: 417/417 通過（26 ファイル）

## 観察された制約

- `getSkillCreatorRootCandidates()` は常に `HOME_SKILL_CREATOR_PATH` と `REPO_SKILL_CREATOR_PATH` を候補に含む
- テスト環境では `REPO_SKILL_CREATOR_PATH` に実際のエージェントファイルが存在する
- TC-07/08 で `SkillCreatorSourceResolver.prototype.resolve` を mock しない場合、REPO パスの実ファイルで dynamic pipeline が成功してしまう
- 解決策: 境界ケーステストでは `sourceResolver.resolve` を明示的に mock する
