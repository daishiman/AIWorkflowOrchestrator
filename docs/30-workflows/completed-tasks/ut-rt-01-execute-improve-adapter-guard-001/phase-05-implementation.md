# Phase 5: 実装 — TASK-UT-RT-01-EXECUTE-IMPROVE-ADAPTER-GUARD-001

## メタ情報

| 項目     | 値                                              |
| -------- | ----------------------------------------------- |
| Phase    | 5                                               |
| タスクID | TASK-UT-RT-01-EXECUTE-IMPROVE-ADAPTER-GUARD-001 |
| 機能名   | ut-rt-01-execute-improve-adapter-guard-001      |
| 作成日   | 2026-04-04                                      |
| 依存     | Phase 4 完了                                    |

## 目的

Phase 2 設計に従い、最小限の変更でガードと型追加を実装する。

## 実装計画

### 新規作成ファイル

なし（全て既存ファイルの修正）

### 修正ファイル一覧

| ファイルパス                                                                                        | 変更種別         | 変更内容                                                                                                                                |
| --------------------------------------------------------------------------------------------------- | ---------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/shared/src/types/skillCreator.ts`                                                         | 型追加           | `RuntimeSkillCreatorExecuteErrorResponse` インターフェース追加（L749付近）、`RuntimeSkillCreatorExecuteResponse` union 拡張（L787付近） |
| `packages/shared/src/types/index.ts`                                                                | エクスポート追加 | `RuntimeSkillCreatorExecuteErrorResponse` を `RuntimeSkillCreatorImproveErrorResponse` の次行に追加                                     |
| `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`                               | ガード追加       | `_executeInternal()` 先頭に17行追加、`improve()` 先頭に17行追加                                                                         |
| `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.adapter-status.test.ts` | テスト更新・追加 | T-COMPAT-02 更新、T-EX グループ追加、T-IM グループ追加                                                                                  |
| `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`                                  | consumer 更新    | `RuntimeSkillCreatorExecuteErrorResponse` を判別して structured error を message へ正規化                                               |
| `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`                                | consumer 更新    | `RuntimeSkillCreatorExecuteErrorResponse` を判別して structured error を message へ正規化、`rawExecuteDetail` の型整合                  |
| `packages/shared/src/types/__tests__/skillCreator.contract-parity.test.ts`                          | 契約テスト更新   | `RuntimeSkillCreatorExecuteResponse` の error union 追加に追従                                                                          |
| `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`                                  | consumer 更新    | `executePlan` の structured error を message へ正規化                                                                                   |
| `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`                                | consumer 更新    | `executePlan` の structured error を message へ正規化、`rawExecuteDetail` の型整合                                                      |
| `packages/shared/src/types/__tests__/skillCreator.contract-parity.test.ts`                          | 契約テスト更新   | `RuntimeSkillCreatorExecuteResponse` の error union 追加に追従                                                                          |

## 実装手順

### Step 1: 型定義追加（`skillCreator.ts`）

`RuntimeSkillCreatorImproveErrorResponse` 定義の直後に追加:

```typescript
/**
 * execute() エラーレスポンス（adapter ステータス未準備時）
 * TASK-UT-RT-01-EXECUTE-IMPROVE-ADAPTER-GUARD-001
 */
export interface RuntimeSkillCreatorExecuteErrorResponse {
  success: false;
  error: { code: RuntimeSkillCreatorDegradedReason; message: string };
}
```

`RuntimeSkillCreatorExecuteResponse` の union を拡張:

```typescript
export type RuntimeSkillCreatorExecuteResponse =
  | RuntimeSkillCreatorExecuteResult
  | { type: "terminal_handoff"; bundle: TerminalHandoffBundle }
  | RuntimeSkillCreatorExecuteErrorResponse;
```

### Step 2: エクスポート追加（`index.ts`）

```typescript
RuntimeSkillCreatorImproveErrorResponse,
RuntimeSkillCreatorExecuteErrorResponse,  // ← 追加
RuntimeSkillCreatorDegradedReason,
```

### Step 3: `_executeInternal()` にガード追加

`const decision = await this.resolveDecision(authMode, apiKey);` の直前に挿入:

```typescript
// TASK-UT-RT-01-EXECUTE-IMPROVE-ADAPTER-GUARD-001: アダプターステータスチェック
if (this._llmAdapterStatus === "failed") {
  return {
    success: false,
    error: {
      code: "llm_adapter_unavailable",
      message: toActionableMessage(this._llmAdapterFailureReason),
    },
  };
}
if (this._llmAdapterStatus === "initializing") {
  return {
    success: false,
    error: {
      code: "llm_adapter_unavailable",
      message: "LLMAdapter の初期化中です。しばらくお待ちください",
    },
  };
}
```

### Step 4: `improve()` にガード追加

`const decision = await this.resolveDecision(authMode, apiKey);` の直前に挿入（Step 3 と同一コード）。

### Step 5: テスト更新

1. T-COMPAT-02 の期待値を `"LLMAdapter の初期化中です。しばらくお待ちください"` に更新
2. T-EX グループを `describe("execute() エラーレスポンス", ...)` ブロックとして追加
3. T-IM グループを `describe("improve() エラーレスポンス (adapter status)", ...)` ブロックとして追加
4. `SkillCreateWizard.tsx` / `SkillLifecyclePanel.tsx` で `RuntimeSkillCreatorExecuteErrorResponse` を判別し、structured error を message へ正規化
5. `skillCreator.contract-parity.test.ts` の execute union 期待値を拡張

## 品質チェック

```bash
# 型チェック
pnpm --filter @repo/shared typecheck
pnpm --filter @repo/desktop typecheck

# アダプターステータステスト実行
pnpm --filter @repo/desktop test -- --testPathPattern="adapter-status"

# 全 Facade テスト実行（リグレッションチェック）
pnpm --filter @repo/desktop test -- --testPathPattern="RuntimeSkillCreatorFacade"
```

## 成果物

- Phase 5 実装書（本ファイル）
- 修正済み `skillCreator.ts`（型追加・union 拡張）
- 修正済み `index.ts`（エクスポート追加）
- 修正済み `RuntimeSkillCreatorFacade.ts`（ガード追加）
- 修正済み `adapter-status.test.ts`（テスト追加・更新）
- 修正済み `SkillCreateWizard.tsx` / `SkillLifecyclePanel.tsx`（consumer 互換）
- 修正済み `skillCreator.contract-parity.test.ts`（契約テスト更新）

## 完了条件

- [ ] `RuntimeSkillCreatorExecuteErrorResponse` 型が追加された
- [ ] `RuntimeSkillCreatorExecuteResponse` union に新型が追加された
- [ ] `index.ts` から新型がエクスポートされている
- [ ] `_executeInternal()` 先頭にガードが追加された
- [ ] `improve()` 先頭にガードが追加された
- [ ] T-COMPAT-02 が更新された
- [ ] T-EX-01〜03 が追加された
- [ ] T-IM-01〜03 が追加された
- [ ] `SkillCreateWizard.tsx` / `SkillLifecyclePanel.tsx` が structured error を正規化している
- [ ] `skillCreator.contract-parity.test.ts` の union 期待値が更新された
- [ ] `pnpm typecheck` がエラーなしで通過する
- [ ] `adapter-status.test.ts` の全テストが PASS する

## 次のPhase

Phase 6: テスト拡充
