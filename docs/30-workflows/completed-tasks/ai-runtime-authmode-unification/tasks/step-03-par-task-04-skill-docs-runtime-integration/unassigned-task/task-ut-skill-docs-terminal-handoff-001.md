# UT-SKILL-DOCS-TERMINAL-HANDOFF-001: terminal-handoff 実パス実装

## メタ情報

```yaml
task_id: UT-SKILL-DOCS-TERMINAL-HANDOFF-001
task_name: SkillDocsCapabilityResolver terminal-handoff 実パス実装
category: 改善
target_feature: apps/desktop/src/main/services/skill/SkillDocsCapabilityResolver.ts
priority: 中
scale: 小規模
status: unassigned
source_phase: TASK-IMP-SKILL-DOCS-AI-RUNTIME-001 Phase 10（最終レビュー）MINOR-R10-02
created_date: 2026-03-16
related_tasks:
  - TASK-IMP-SKILL-DOCS-AI-RUNTIME-001
  - UT-9I-001
spec_path: docs/30-workflows/unassigned-task/task-ut-skill-docs-terminal-handoff-001.md
```

| 項目         | 内容                                                     |
| ------------ | -------------------------------------------------------- |
| タスクID     | UT-SKILL-DOCS-TERMINAL-HANDOFF-001                       |
| タスク名     | SkillDocsCapabilityResolver terminal-handoff 実パス実装  |
| 分類         | 改善                                                     |
| 対象機能     | `SkillDocsCapabilityResolver` の LLM 到達不可判定        |
| 優先度       | 中                                                       |
| 見積もり規模 | 小規模                                                   |
| ステータス   | unassigned                                               |
| 発見元       | TASK-IMP-SKILL-DOCS-AI-RUNTIME-001 Phase 10 MINOR-R10-02 |
| 発見日       | 2026-03-16                                               |

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`SkillDocsCapabilityResolver` は現在 `isAvailable()` メソッドのみで capability を判定している。
このメソッドは API key が設定されているかどうかを確認するだけで、実際に LLM プロバイダに到達できるかどうかは確認しない。

### 1.2 問題点・課題

API key が設定済みであっても、以下の状況では LLM プロバイダに到達できない場合がある:

- ネットワーク障害
- プロバイダのサービスダウン
- ファイアウォール / プロキシによるブロック

現在の実装では、これらのケースで `integrated-api` capability を返してしまい、その後のドキュメント生成が失敗する。
`terminal-handoff` パスへ遷移する実判定ロジックが未実装のため、ユーザーは生成失敗になるまでフォールバックを知ることができない。

### 1.3 放置した場合の影響

- LLM 到達不可時にドキュメント生成が失敗し、不明確なエラーメッセージが表示される
- `terminal-handoff` capability によるフォールバック UI が機能しない
- ユーザーエクスペリエンスが低下する

## 2. 何を達成するか（What）

### 2.1 目的

`SkillDocsCapabilityResolver` に LLM 到達可能性テスト（health check / ping）を追加し、
到達不可時に `terminal-handoff` capability を返すようにする。

### 2.2 最終ゴール

- LLM 到達不可時に capability が `"terminal-handoff"` を返す
- 既存の `integrated-api` / `guidance-only` 判定が壊れていない
- ping タイムアウトが適切に設定されている（5秒以内推奨）
- テストで到達不可シナリオが検証されている

### 2.3 スコープ

#### 含むもの

- `ILLMDocQueryAdapter` に `ping(): Promise<boolean>` メソッドを追加
- `SkillDocsCapabilityResolver.resolve()` を async に変更し、ping() 結果で判定を分岐
- ping 失敗時は `{ capability: "terminal-handoff", reason: "LLM unreachable" }` を返す実装
- 対応するテストの追加・更新

#### 含まないもの

- LLM プロバイダ選択 UI の変更
- ping 失敗時のユーザー向けエラーメッセージの詳細化（別タスク）

### 2.4 成果物

- `apps/desktop/src/main/services/skill/LLMDocQueryAdapter.ts`（ping メソッド追加）
- `apps/desktop/src/main/services/skill/SkillDocsCapabilityResolver.ts`（async 化 + ping 分岐）
- `apps/desktop/src/main/services/skill/__tests__/SkillDocsCapabilityResolver.test.ts`（到達不可シナリオ追加）
- `apps/desktop/src/main/services/skill/__tests__/LLMDocQueryAdapter.test.ts`（ping テスト追加）

## 3. どのように実行するか（How）

### 3.1 前提条件

- `TASK-IMP-SKILL-DOCS-AI-RUNTIME-001` が完了していること（LLMDocQueryAdapter の基本実装が存在する）
- `ILLMDocQueryAdapter` インターフェースの現在の定義を把握していること

### 3.2 依存タスク

- `TASK-IMP-SKILL-DOCS-AI-RUNTIME-001`（親タスク）

### 3.3 必要な知識

- `SkillDocsCapabilityResolver` の現在の判定ロジック
- `ILLMDocQueryAdapter` インターフェースの構造
- Vitest でのタイムアウトモックパターン（P13 参照）

### 3.4 推奨アプローチ

#### 実装方針

1. `ILLMDocQueryAdapter` に `ping(): Promise<boolean>` メソッドを追加する

```typescript
// packages/shared/src/types/skill-docs.ts または LLMDocQueryAdapter.ts
interface ILLMDocQueryAdapter {
  // 既存メソッド
  isAvailable(): boolean;
  query(prompt: string): Promise<DocOperationResult<string>>;
  // 新規追加
  ping(): Promise<boolean>;
}
```

2. `LLMDocQueryAdapter` の `ping()` 実装を追加する（タイムアウト 5000ms 推奨）

```typescript
async ping(): Promise<boolean> {
  try {
    // 軽量なヘルスチェックリクエストを送信（モデルへの minimal prompt）
    const result = await Promise.race([
      this.sendMinimalRequest(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("ping timeout")), 5000)
      ),
    ]);
    return result.success;
  } catch {
    return false;
  }
}
```

3. `SkillDocsCapabilityResolver.resolve()` を async に変更し、ping() 結果で分岐する

```typescript
async resolve(): Promise<SkillDocsCapabilityResult> {
  if (!this.adapter.isAvailable()) {
    return { capability: "guidance-only", reason: "No API key" };
  }
  const reachable = await this.adapter.ping();
  if (!reachable) {
    return { capability: "terminal-handoff", reason: "LLM unreachable" };
  }
  return { capability: "integrated-api" };
}
```

4. テストで到達不可シナリオを検証する

```typescript
it("LLM到達不可時はterminal-handoffを返す", async () => {
  mockAdapter.isAvailable.mockReturnValue(true);
  mockAdapter.ping.mockResolvedValue(false);
  const result = await resolver.resolve();
  expect(result.capability).toBe("terminal-handoff");
  expect(result.reason).toBe("LLM unreachable");
});
```

### 3.5 既知の落とし穴

- P13: タイマーテスト（ping タイムアウト）では `advanceTimersByTime` を使用すること
- resolve() を async にした際、呼び出し元が `await` しているか確認が必要

## 4. 実行手順

### Phase 1: インターフェース更新

1. `ILLMDocQueryAdapter` に `ping(): Promise<boolean>` を追加
2. `packages/shared/src/types/skill-docs.ts` の型定義を更新（必要な場合）

### Phase 2: 実装

1. `LLMDocQueryAdapter.ping()` を実装（タイムアウト: 5000ms）
2. `SkillDocsCapabilityResolver.resolve()` を async 化し、ping 分岐を追加
3. 呼び出し元の await 対応を確認

### Phase 3: テスト

1. `LLMDocQueryAdapter.test.ts` に ping テスト追加（成功 / タイムアウト / 失敗）
2. `SkillDocsCapabilityResolver.test.ts` に到達不可シナリオ追加

## 5. 完了条件チェックリスト

### 機能要件

- [ ] LLM 到達不可時に capability が `"terminal-handoff"` を返す
- [ ] API key 未設定時は引き続き `"guidance-only"` を返す（既存動作維持）
- [ ] LLM 到達可能時は引き続き `"integrated-api"` を返す（既存動作維持）
- [ ] ping タイムアウトが 5000ms 以内に設定されている

### 品質要件

- [ ] `pnpm typecheck` が通ること
- [ ] `pnpm --filter @repo/desktop test` が全 PASS すること
- [ ] カバレッジが既存基準を維持していること

### ドキュメント要件

- [ ] 本指示書が `docs/30-workflows/unassigned-task/` に配置されている
- [ ] `task-workflow.md` の残課題テーブルに登録されている
- [ ] 関連仕様書（interfaces-agent-sdk-skill-reference-share-debug-analytics.md）に参照リンクが追加されている

## 6. 検証方法

```bash
# テスト実行
cd apps/desktop && pnpm vitest run src/main/services/skill/__tests__/SkillDocsCapabilityResolver.test.ts
cd apps/desktop && pnpm vitest run src/main/services/skill/__tests__/LLMDocQueryAdapter.test.ts

# 型チェック
pnpm --filter @repo/desktop typecheck
```

## 7. リスクと対策

| リスク                                      | 影響度 | 発生確率 | 対策                                                       |
| ------------------------------------------- | ------ | -------- | ---------------------------------------------------------- |
| ping が毎回ネットワーク負荷をかける         | 中     | 高       | ping 結果をキャッシュ（TTL: 60秒）し、頻繁な呼び出しを防ぐ |
| resolve() を async にした際の呼び出し元漏れ | 高     | 中       | `grep -rn "resolver.resolve\(\)"` で呼び出し元を全確認     |
| タイムアウト値が不適切                      | 中     | 低       | 設定可能にし、デフォルト 5000ms をドキュメント化           |

## 8. 参照情報

- 親タスク: `docs/30-workflows/ai-runtime-authmode-unification/tasks/step-03-par-task-04-skill-docs-runtime-integration/`
- 検出 Phase: Phase 10 最終レビュー `MINOR-R10-02`
- 関連タスク: UT-9I-001（LLMプロバイダ連携 — stub → 実 SDK 差替）
