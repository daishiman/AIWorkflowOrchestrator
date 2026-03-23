# Phase 5: 実装

## メタ情報

| 項目     | 値                                    |
| -------- | ------------------------------------- |
| Phase    | 5                                     |
| タスクID | UT-SC-02-002                          |
| 機能名   | UT-SC-02-002-execute-terminal-handoff |
| 作成日   | 2026-03-23                            |

## 目的

TDD の Green フェーズ。Phase 4 で Red になったテストを最小限の変更で通す。具体的には以下の2ファイルを修正する。

1. `packages/shared/src/types/skillCreator.ts` に `RuntimeSkillCreatorExecuteResponse` Union 型を追加
2. `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` の `execute()` に terminal_handoff 分岐を追加し、`void decision;` を除去

## 実行タスク

1. `skillCreator.ts` に `RuntimeSkillCreatorExecuteResponse` 型を追加する
2. `RuntimeSkillCreatorFacade.ts` のインポートを更新する
3. `execute()` の戻り値型を変更し、terminal_handoff 分岐を追加する
4. `void decision;` を除去する
5. テストが Green になることを確認する

## 参照資料

- 実装対象 1: `packages/shared/src/types/skillCreator.ts`
- 実装対象 2: `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`
- テスト: `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.test.ts`
- 参考実装（plan のパターン）: `RuntimeSkillCreatorFacade.ts` L64-86
- 参考型（plan の Union 型）: `skillCreator.ts` L353-359（`RuntimeSkillCreatorPlanResponse`）

## 実行手順

### Step 1: `skillCreator.ts` に `RuntimeSkillCreatorExecuteResponse` 型を追加する

`packages/shared/src/types/skillCreator.ts` の `RuntimeSkillCreatorImproveResponse` 定義（L364-370）の直前に、以下の型定義を追加する。

```typescript
/**
 * Runtime execute IPC の戻り値
 */
export type RuntimeSkillCreatorExecuteResponse =
  | RuntimeSkillCreatorExecuteResult
  | {
      type: "terminal_handoff";
      bundle: TerminalHandoffBundle;
    };
```

追加後、`SkillCreatorExecutePlanResult` 型エイリアス（L304）は `RuntimeSkillCreatorExecuteResult` のままで変更しない。`RuntimeSkillCreatorExecuteResponse` は IPC 戻り値専用の Union 型として独立して定義する。

### Step 2: `RuntimeSkillCreatorFacade.ts` のインポートを更新する

`apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` の L22-27 のインポートブロックを以下に変更する。

変更前:

```typescript
import type {
  RuntimeSkillCreatorExecuteResult as SkillExecuteResult,
  RuntimeSkillCreatorImproveResponse,
  RuntimeSkillCreatorPlanResponse,
  RuntimeSkillCreatorPlanResult as SkillPlanResult,
} from "@repo/shared/types";
```

変更後:

```typescript
import type {
  RuntimeSkillCreatorExecuteResponse,
  RuntimeSkillCreatorImproveResponse,
  RuntimeSkillCreatorPlanResponse,
  RuntimeSkillCreatorPlanResult as SkillPlanResult,
} from "@repo/shared/types";
```

`RuntimeSkillCreatorExecuteResult as SkillExecuteResult` を削除し、`RuntimeSkillCreatorExecuteResponse` を追加する。

### Step 3: `execute()` の戻り値型を変更し、terminal_handoff 分岐を追加する

`execute()` メソッド（L93-128）全体を以下に置き換える。

```typescript
/**
 * Executor role: 計画に基づき Skill を実行・生成する。
 * SkillExecutor に委譲する。
 * Public IPC: "skill-creator:execute-plan"
 */
async execute(
  planResult: SkillPlanResult,
  authMode: AuthMode,
  apiKey: string | null,
): Promise<RuntimeSkillCreatorExecuteResponse> {
  const decision = await this.resolveDecision(authMode, apiKey);

  if (decision.type === "terminal_handoff") {
    const bundle = this.handoffBuilder.build(
      planResult.skillSpec,
      process.cwd(),
    );
    return { type: "terminal_handoff", bundle };
  }

  const request: SkillExecutionRequest = {
    prompt: planResult.skillSpec,
    skillId: `creator-${planResult.planId}`,
  };

  const skillMeta = {
    id: `creator-${planResult.planId}`,
    name: "skill-creator-executor",
    slug: "skill-creator-executor",
    description: "RuntimeSkillCreatorFacade の Executor role",
    path: "",
    triggers: [],
    anchors: [],
    allowedTools: ["Read", "Edit", "Write"],
    content: planResult.skillSpec,
  };

  const response = await this.skillExecutor.execute(request, skillMeta);

  return {
    executeId: response.executionId,
    skillName:
      planResult.skillSpec.split("\n")[0]?.substring(0, 50) ?? "unnamed",
    success: response.success,
    error: response.error?.message,
  };
}
```

変更のポイント:

- 戻り値型: `SkillExecuteResult` → `RuntimeSkillCreatorExecuteResponse`
- `terminal_handoff` 分岐を `decision` の直後に追加（plan/improve と同一パターン）
- `void decision;` を除去
- terminal_handoff 時の `build()` 引数は `planResult.skillSpec` と `process.cwd()`（コメント `Skill を作成してください:` のプレフィックスは付けない。plan とは異なる仕様）

### Step 4: Green を確認する

```bash
cd /Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator/.worktrees/task-20260323-120152-wt-5/apps/desktop
pnpm vitest run src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.test.ts
```

全テストが PASS することを確認する。

### Step 5: 型チェックを確認する

```bash
cd /Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator/.worktrees/task-20260323-120152-wt-5
pnpm --filter @repo/shared typecheck
pnpm --filter @repo/desktop typecheck
```

型エラーがないことを確認する。

## 多角的チェック観点

| 観点               | 適用判断                          | 確認内容                                         |
| ------------------ | --------------------------------- | ------------------------------------------------ |
| セキュリティ       | terminal_handoff でのセキュリティ | SkillExecutor 非呼び出しの保証                   |
| アーキテクチャ     | 3メソッドのパターン統一           | plan/improve/execute の分岐パターンの一貫性      |
| エラーハンドリング | Optional chaining の安全性        | `response.error?.message` 等の null 安全パターン |

## 統合テスト連携

`execute()` の戻り値型が Union 型（`RuntimeSkillCreatorExecuteResponse`）になったことにより、以下のファイルで型不整合が発生する可能性がある（P44/P45 対策）:

- `apps/desktop/src/main/ipc/creatorHandlers.ts`: 戻り値型 `Promise<IpcResult<RuntimeSkillCreatorExecuteResult>>` を `Promise<IpcResult<RuntimeSkillCreatorExecuteResponse>>` に変更が必要
- `apps/desktop/src/preload/skill-creator-api.ts`: Preload 型定義の対応変更が必要

これらは本タスクスコープ外とし、Phase 12 Task 4 で未タスク化する。Phase 9 の `pnpm typecheck` 実行時に型エラーが発生した場合は、ハンドラ側の型定義を最小限修正して PASS させる。

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の実施
4. 成果物の作成・配置
5. 完了条件の検証

## 成果物

| 成果物     | パス                                                                              | 説明                                                                                         |
| ---------- | --------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| 型定義     | `packages/shared/src/types/skillCreator.ts`（修正済み）                           | `RuntimeSkillCreatorExecuteResponse` 型を追加                                                |
| Facade実装 | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`（修正済み） | `execute()` の戻り値型変更、terminal_handoff 分岐追加、`void decision;` 除去、インポート更新 |

## 完了条件

- [ ] `skillCreator.ts` に `RuntimeSkillCreatorExecuteResponse` Union 型が追加されている
- [ ] `execute()` の戻り値型が `RuntimeSkillCreatorExecuteResponse` になっている
- [ ] `execute()` に terminal_handoff 分岐が実装されている（plan/improve と同一パターン）
- [ ] `void decision;` が除去されている
- [ ] Phase 4 で追加した E-3, E-4, E-5 が PASS
- [ ] 既存テスト E-1, E-2 が引き続き PASS
- [ ] `pnpm --filter @repo/shared typecheck` が通る
- [ ] `pnpm --filter @repo/desktop typecheck` が通る
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている

## 次のPhase

Phase 6（テスト拡充）: カバレッジ不足箇所の追加テスト記述
