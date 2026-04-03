# [#1781] [UT] plan()/improve() fallback chain 共通化

## メタ情報

```yaml
issue_number: 1781
title: [UT] plan()/improve() fallback chain 共通化
state: OPEN
priority:  low
scale: -
category:  refactoring
status: -
created_date: 2026-03-30
updated_date: 2026-03-30
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/1781
dependencies: []
```

| 項目       | 内容 |
| ---------- | ---- |
| 優先度     | low  |
| 規模       | -    |
| ステータス | -    |

---

## タスク概要

**タスクID**: UT-P0-04-FALLBACK-CHAIN-CONSOLIDATION-001
**分類**: リファクタリング
**対象機能**: RuntimeSkillCreatorFacade — dynamic/static fallback pipeline
**優先度**: 低
**見積もり規模**: 小規模
**ステータス**: 未実施
**発見元**: TASK-P0-04 Phase 12（unassigned-task-detection.md / N/A-02）
**発見日**: 2026-03-30

---

## なぜこのタスクが必要か（Why）

### 背景

TASK-P0-04（ManifestLoader default activation）の実装で、`RuntimeSkillCreatorFacade.plan()` および `improve()` に dynamic → static → degraded error の 3 段階 fallback chain が導入された。
現状では `plan()` と `improve()` それぞれに同じ fallback ロジックが重複して存在している。

```typescript
// plan() での fallback chain（概念コード）
const agentSpecs = await dynamicPipeline.resolve(...);
if (dynamicPipelineSucceeded && agentSpecs.length > 0) {
  // dynamic pipeline で処理
} else if (resourceLoader) {
  agentSpecs = await resourceLoader.loadAgent(...); // static fallback
} else {
  return { error: "resource_loader_unavailable" }; // degraded error
}

// improve() でも同じロジックが重複
```

### 問題点・課題

- `plan()` と `improve()` で fallback chain の実装が重複している（DRY 原則違反）
- fallback ロジックに変更が必要になった場合、2 箇所を同時に修正する必要がある
- 修正漏れが生じた場合、`plan()` と `improve()` の動作が非対称になりバグを生む
- コードの可読性が低く、fallback chain の意図が把握しにくい

### 放置した場合の影響

- fallback chain に新たな段階（例: キャッシュ fallback）を追加する際、2 箇所の修正が必要になる
- 将来の開発者が `plan()` を修正して `improve()` の修正を忘れるリスクがある
- テストコードでも同じパターンを2回検証する必要があり、テストの重複が生じる

---

## 何を達成するか（What）

### 目的

fallback chain ロジックを `executeWithFallback()` のような private ヘルパーメソッドに統合し、
`plan()` と `improve()` がそれを共有する構造にする。

### 最終ゴール

```typescript
// 理想的な構造（参考）
class RuntimeSkillCreatorFacade {
  private async executeWithFallback<T>(
    dynamicExecutor: (agentSpecs: AgentSpec[]) => Promise<T>,
    staticExecutor: (agentSpecs: AgentSpec[]) => Promise<T>,
  ): Promise<T> {
    const agentSpecs = await this.resolveDynamicAgentSpecs();
    if (this.dynamicPipelineSucceeded && agentSpecs.length > 0) {
      return dynamicExecutor(agentSpecs);
    } else if (this.resourceLoader) {
      const staticSpecs = await this.resourceLoader.loadAgent(...);
      return staticExecutor(staticSpecs);
    } else {
      return { error: "resource_loader_unavailable" } as T;
    }
  }

  async plan(...): Promise<PlanResult> {
    return this.executeWithFallback(
      (specs) => this.executePlan(specs, ...),
      (specs) => this.executePlan(specs, ...),
    );
  }

  async improve(...): Promise<ImproveResult> {
    return this.executeWithFallback(
      (specs) => this.executeImprove(specs, ...),
      (specs) => this.executeImprove(specs, ...),
    );
  }
}
```

### スコープ

#### 含むもの

- `RuntimeSkillCreatorFacade.ts` 内の fallback chain 共通化
- `executeWithFallback()` プライベートメソッドの実装
- `plan()` / `improve()` のリファクタリング
- 既存テストが全て PASS することの確認

#### 含まないもの

- 外部 API の変更（`plan()` / `improve()` のシグネチャは変更しない）
- fallback chain に新機能を追加（スコープ外）
- `execute()` メソッドへの適用（別途検討）

### 成果物

- 更新済み `RuntimeSkillCreatorFacade.ts`（`executeWithFallback()` 抽出済み）
- 全テスト PASS の確認

---

## どのように実行するか（How）

### 推奨アプローチ

1. まず現状の `plan()` と `improve()` の fallback ロジックを精査し、共通部分と差分部分を特定する
2. 共通部分を `executeWithFallback<T>()` に抽出
3. `plan()` と `improve()` をリファクタリング
4. **既存テストが全て通過することを確認**（外部動作を変えないリファクタリング）

---

## 実行手順（Phase構成）

1. **Phase 1: 現状分析** — `plan()` と `improve()` の fallback chain の共通部分・差分部分を特定
2. **Phase 2: リファクタリング実装** — `executeWithFallback()` メソッドを実装し、`plan()` / `improve()` をリファクタリング
3. **Phase 3: テスト検証** — リファクタリングによる動作変更がないことを確認

---

## 完了条件チェックリスト

### 機能要件

- [ ] `executeWithFallback<T>()` メソッドが実装されている
- [ ] `plan()` が `executeWithFallback()` を使用している
- [ ] `improve()` が `executeWithFallback()` を使用している
- [ ] fallback ロジックの重複が除去されている

### 品質要件

- [ ] 全テストが PASS している
- [ ] TypeScript 型チェックが通っている
- [ ] `plan()` / `improve()` の外部 API が変わっていない（後方互換）

### ドキュメント要件

- [ ] `executeWithFallback()` に fallback chain の意図を説明するコメントがある（任意）

---

## リスクと対策

| リスク                                                                         | 影響度 | 発生確率 | 対策                                                                             |
| ------------------------------------------------------------------------------ | ------ | -------- | -------------------------------------------------------------------------------- |
| `plan()` と `improve()` の fallback ロジックが実は微妙に異なり、共通化が難しい | 中     | 低       | Phase 1 の分析で差分を正確に把握し、差分部分はコールバックで注入する             |
| TypeScript generics の型推論がうまく動かない                                   | 低     | 低       | `executeWithFallback<T extends PlanResult \| ImproveResult>` など Union 型で解決 |
| リファクタリングにより隠れた動作変更が生じる                                   | 中     | 低       | 既存テスト全通過を必須条件とし、動作変更を検出する                               |

---

## 関連ドキュメント

- `outputs/phase-12/unassigned-task-detection.md`（N/A-02 として記録）
- `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`
- `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.plan.test.ts`
- `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.improve.test.ts`

---

## 備考

このタスクは純粋なリファクタリングのため、機能テストで変更を検証できる。
PR マージをブロックしない LOW 優先度だが、RuntimeSkillCreatorFacade に新機能を追加する次回タスク前に実施すると
新機能の追加コストが下がる。
