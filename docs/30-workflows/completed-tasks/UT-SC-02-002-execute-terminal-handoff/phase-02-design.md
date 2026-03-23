# Phase 2: 設計

## メタ情報

| 項目     | 値                                    |
| -------- | ------------------------------------- |
| Phase    | 2                                     |
| タスクID | UT-SC-02-002                          |
| 機能名   | UT-SC-02-002-execute-terminal-handoff |
| 作成日   | 2026-03-23                            |

## 目的

`execute()` メソッドに terminal_handoff 分岐を追加するための詳細設計を行う。`plan()` / `improve()` の既存パターンを正本とし、3メソッドのパターン統一を達成する設計を作成する。

## 実行タスク

1. `RuntimeSkillCreatorExecuteResponse` Union型を設計する
2. `execute()` メソッドの分岐フローチャートを作成する
3. IPC ハンドラへの影響を分析する
4. テスト設計の基盤を作成する

## 参照資料

- `docs/30-workflows/UT-SC-02-002-execute-terminal-handoff/phase-01-requirements.md`
- `packages/shared/src/types/skillCreator.ts` L354-369（plan/improve の Union型パターン）
- `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` L64-86（plan() 正本パターン）

### システム仕様（aiworkflow-requirements）

> 実装前に以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                      | パス                                                                                      | 内容                   |
| ----------------------------- | ----------------------------------------------------------------------------------------- | ---------------------- |
| execution capability contract | `.claude/skills/aiworkflow-requirements/references/arch-execution-capability-contract.md` | RuntimePolicy 設計契約 |

## 実行手順

### 1. 型定義追加（`packages/shared/src/types/skillCreator.ts`）

既存パターン（plan/improve）に倣い、execute にも Union型を定義する:

```typescript
// 既存 (L354-359): plan
export type RuntimeSkillCreatorPlanResponse =
  | RuntimeSkillCreatorPlanResult
  | { type: "terminal_handoff"; bundle: TerminalHandoffBundle };

// 既存 (L364-369): improve
export type RuntimeSkillCreatorImproveResponse =
  | RuntimeSkillCreatorImproveResult
  | { type: "terminal_handoff"; bundle: TerminalHandoffBundle };

// 新規追加: execute（同一パターン）
export type RuntimeSkillCreatorExecuteResponse =
  | RuntimeSkillCreatorExecuteResult
  | { type: "terminal_handoff"; bundle: TerminalHandoffBundle };
```

**挿入位置**: L340（`RuntimeSkillCreatorExecuteResult` 定義の直後）に追加。

### 2. execute() メソッドの分岐フローチャート

```
execute(planResult, authMode, apiKey)
  │
  ├─ resolveDecision(authMode, apiKey)
  │
  ├─ decision.type === "terminal_handoff" ?
  │   ├─ Yes → handoffBuilder.build(prompt, cwd)
  │   │         → return { type: "terminal_handoff", bundle }  ← 新規追加
  │   │
  │   └─ No (integrated_api)
  │       → skillExecutor.execute(request, skillMeta)
  │       → return { executeId, skillName, success, error }     ← 既存パス
```

### 3. execute() メソッドの修正設計

**Before（現行: L93-128）**:

```typescript
async execute(
  planResult: SkillPlanResult,
  authMode: AuthMode,
  apiKey: string | null,
): Promise<SkillExecuteResult> {
  const decision = await this.resolveDecision(authMode, apiKey);

  // ... request, skillMeta 構築 ...

  void decision;  // ← 除去
  const response = await this.skillExecutor.execute(request, skillMeta);
  return { /* ... */ };
}
```

**After（修正後）**:

```typescript
async execute(
  planResult: SkillPlanResult,
  authMode: AuthMode,
  apiKey: string | null,
): Promise<RuntimeSkillCreatorExecuteResponse> {  // ← 戻り値型変更
  const decision = await this.resolveDecision(authMode, apiKey);

  // terminal_handoff: 早期リターン（plan/improve と同一パターン）
  if (decision.type === "terminal_handoff") {
    const bundle = this.handoffBuilder.build(
      `スキルを実行してください: ${planResult.skillSpec.split("\n")[0]?.substring(0, 50) ?? "unnamed"}`,
      process.cwd(),
    );
    return { type: "terminal_handoff", bundle };
  }

  // integrated_api: 既存パス（変更なし）
  const request: SkillExecutionRequest = {
    prompt: planResult.skillSpec,
    skillId: `creator-${planResult.planId}`,
  };

  const skillMeta = { /* 既存のまま */ };
  const response = await this.skillExecutor.execute(request, skillMeta);
  return {
    executeId: response.executionId,
    skillName: planResult.skillSpec.split("\n")[0]?.substring(0, 50) ?? "unnamed",
    success: response.success,
    error: response.error?.message,
  };
}
```

### 4. import 変更

`RuntimeSkillCreatorFacade.ts` の import を更新:

```typescript
// Before
import type {
  RuntimeSkillCreatorExecuteResult as SkillExecuteResult,
  // ...
} from "@repo/shared/types";

// After
import type {
  RuntimeSkillCreatorExecuteResponse as SkillExecuteResponse, // Union型に変更
  // ...
} from "@repo/shared/types";
```

### 5. IPC ハンドラへの影響分析

`execute()` の呼び出し元 IPC ハンドラ（`skill-creator:execute-plan`）が存在する場合、戻り値の型が Union になるため、Renderer 側でのレスポンス分岐が必要になる可能性がある。

**確認ポイント**:

- IPC ハンドラが `execute()` の戻り値をそのまま返しているか
- Renderer 側で `type === "terminal_handoff"` の分岐処理があるか（plan/improve で既存パターンがあるはず）

**対応方針**: IPC ハンドラの修正は本タスクのスコープに含める。Renderer 側はすでに plan/improve で terminal_handoff を処理するパターンがあるため、execute でも同様に処理される想定。

### 6. テスト修正設計

#### 修正対象: 既存テスト（L207-246）

現在の2番目のテストは terminal_handoff を resolve しつつ executeMock の結果を期待する矛盾がある。

**Before**:

```typescript
it("SkillExecutor のエラーを message に変換し、skillName を 50 文字に切り詰める", async () => {
  vi.spyOn(RuntimePolicyResolver.prototype, "resolve").mockResolvedValue({
    type: "terminal_handoff", // ← terminal_handoff なのに
    bundle: {
      /* ... */
    },
  });
  executeMock.mockResolvedValue({
    /* ... */
  }); // ← executor が呼ばれる想定
  // ...
});
```

**After**: このテストを2つに分割する。

1. **terminal_handoff テスト**（新規）: terminal_handoff 時に早期リターンし、executeMock が呼ばれないことを検証
2. **エラー変換テスト**（修正）: `integrated_api` として resolve し、executor エラーの message 変換と skillName 切り詰めを検証

#### 追加テストケース

| テスト名                                                        | 検証内容                               |
| --------------------------------------------------------------- | -------------------------------------- |
| terminal_handoff 判定時は builder の結果を返す                  | AC-1, AC-2: 早期リターンと bundle 返却 |
| terminal_handoff 時に SkillExecutor.execute() が呼ばれない      | AC-1: executeMock が呼ばれないこと     |
| terminal_handoff 時に TerminalHandoffBuilder.build() が呼ばれる | AC-6: buildSpy の引数検証              |
| integrated_api 時に既存の動作を維持                             | AC-5: 既存テストの動作が変わらない     |
| エラー変換（integrated_api）で skillName を 50 文字に切り詰める | 既存テストの修正版                     |

## 多角的チェック観点

| 観点               | 適用判断                          | 確認内容                                         |
| ------------------ | --------------------------------- | ------------------------------------------------ |
| セキュリティ       | terminal_handoff でのセキュリティ | SkillExecutor 非呼び出しの保証                   |
| アーキテクチャ     | 3メソッドのパターン統一           | plan/improve/execute の分岐パターンの一貫性      |
| エラーハンドリング | Optional chaining の安全性        | `response.error?.message` 等の null 安全パターン |

## 統合テスト連携

- Phase 4 でテストを先に作成し（Red）、Phase 5 で実装（Green）
- 既存テストの動作維持を Phase 6 で再確認

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の実施
4. 成果物の作成・配置
5. 完了条件の検証

## 成果物

| 成果物       | パス                                | 説明           |
| ------------ | ----------------------------------- | -------------- |
| 設計書       | `phase-02-design.md`（本ファイル）  | 詳細設計       |
| 設計サマリー | `outputs/phase-2/design-summary.md` | 設計概要まとめ |

## 完了条件

- [x] `RuntimeSkillCreatorExecuteResponse` 型の設計が完了している
- [x] `execute()` の分岐フローチャートが作成されている
- [x] import 変更箇所が特定されている
- [x] テスト修正設計が完了している（既存テストの矛盾解消含む）
- [x] IPC ハンドラへの影響が分析されている
- [x] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [x] 本Phase内の全タスクを100%実行完了
- [x] 各タスクの成果物が生成されている
- [x] artifacts.jsonが更新されている

## 次のPhase

Phase 3: 設計レビュー
