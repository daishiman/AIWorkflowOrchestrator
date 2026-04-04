# Phase 2: 設計 — TASK-UT-RT-01-EXECUTE-IMPROVE-ADAPTER-GUARD-001

## メタ情報

| 項目     | 値                                              |
| -------- | ----------------------------------------------- |
| Phase    | 2                                               |
| タスクID | TASK-UT-RT-01-EXECUTE-IMPROVE-ADAPTER-GUARD-001 |
| 機能名   | ut-rt-01-execute-improve-adapter-guard-001      |
| 作成日   | 2026-04-04                                      |
| 依存     | Phase 1 完了                                    |

## 目的

実装方針を確定する。型定義の追加場所、ガードの挿入位置、既存テストへの影響を設計する。

## 実行タスク

### Task 2-1: 型定義設計

**新規型 `RuntimeSkillCreatorExecuteErrorResponse`**:

```typescript
// packages/shared/src/types/skillCreator.ts
// RuntimeSkillCreatorImproveErrorResponse の直後に追加

/**
 * execute() エラーレスポンス（adapter ステータス未準備時）
 * TASK-UT-RT-01-EXECUTE-IMPROVE-ADAPTER-GUARD-001
 */
export interface RuntimeSkillCreatorExecuteErrorResponse {
  success: false;
  error: { code: RuntimeSkillCreatorDegradedReason; message: string };
}
```

**`RuntimeSkillCreatorExecuteResponse` union 拡張**:

```typescript
// 変更前
export type RuntimeSkillCreatorExecuteResponse =
  | RuntimeSkillCreatorExecuteResult
  | { type: "terminal_handoff"; bundle: TerminalHandoffBundle };

// 変更後
export type RuntimeSkillCreatorExecuteResponse =
  | RuntimeSkillCreatorExecuteResult
  | { type: "terminal_handoff"; bundle: TerminalHandoffBundle }
  | RuntimeSkillCreatorExecuteErrorResponse;
```

**`index.ts` エクスポート追加**:

```typescript
// RuntimeSkillCreatorImproveErrorResponse の直後
RuntimeSkillCreatorExecuteErrorResponse,
```

### Task 2-2: ガード挿入位置の設計

#### `_executeInternal()` へのガード

挿入位置: `resolveDecision()` 呼び出しの**直前**（メソッド先頭）

理由:

- `resolveDecision()` は auth 解決（非同期処理）を行うため、adapter 未準備時に実行すると不要な処理が走る
- `execute()` は `activeExecutionCount` カウンタ管理のため `_executeInternal()` をラップしている。ガードは内部実装の `_executeInternal()` 先頭に入れる

```typescript
private async _executeInternal(
  planResult: SkillPlanResult,
  authMode: AuthMode,
  apiKey: string | null,
): Promise<SkillExecuteResponse> {
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

  const decision = await this.resolveDecision(authMode, apiKey);
  // ... 既存ロジック続行
```

#### `improve()` へのガード

挿入位置: `resolveDecision()` 呼び出しの**直前**（メソッド先頭）

```typescript
async improve(...): Promise<RuntimeSkillCreatorImproveResponse> {
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

  const decision = await this.resolveDecision(authMode, apiKey);
  // ... 既存ロジック続行
```

### Task 2-3: 既存テスト影響分析

| テスト                                              | 影響                                                                                              | 対応                                                                 |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| T-COMPAT-02                                         | `improve()` llmAdapter 未設定 → "initializing" 状態。**新ガードが先に発火**し、メッセージが変わる | 期待値を「初期化中」メッセージに更新する                             |
| T-PL-01〜06                                         | `plan()` のテスト。影響なし                                                                       | 変更不要                                                             |
| T-ST-01〜06                                         | ステータス遷移テスト。影響なし                                                                    | 変更不要                                                             |
| `RuntimeSkillCreatorFacade.improve.test.ts`         | `llmAdapter` 設定済みでのテスト群。`status === "ready"` なので影響なし                            | 変更不要                                                             |
| `RuntimeSkillCreatorFacade.test.ts`                 | `execute()` の基本テスト。`llmAdapter` 設定済みで実行 → 影響なし                                  | 変更不要                                                             |
| `SkillCreateWizard.tsx` / `SkillLifecyclePanel.tsx` | `RuntimeSkillCreatorExecuteResponse` の error union 追加に伴う consumer narrowing が必要          | `executeId` / `success` で runtime result と structured error を分離 |
| `skillCreator.contract-parity.test.ts`              | `RuntimeSkillCreatorExecuteResponse` の type-level parity が変化                                  | expected union に error response を追加                              |

### Task 2-4: 変更ファイル一覧

| 種別             | ファイルパス                                                                                        | 変更内容                                                               |
| ---------------- | --------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| 新規型追加       | `packages/shared/src/types/skillCreator.ts`                                                         | `RuntimeSkillCreatorExecuteErrorResponse` 追加、union 拡張             |
| エクスポート追加 | `packages/shared/src/types/index.ts`                                                                | 新型エクスポート追加                                                   |
| ガード追加       | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`                               | `_executeInternal()` / `improve()` 先頭にステータスチェック追加        |
| テスト更新       | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.adapter-status.test.ts` | T-COMPAT-02 更新、T-EX-01〜03、T-IM-01〜03 追加                        |
| consumer 更新    | `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`                                  | executePlan の structured error を message へ正規化                    |
| consumer 更新    | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`                                | executePlan の structured error を message へ正規化、raw detail 型整合 |
| 契約テスト更新   | `packages/shared/src/types/__tests__/skillCreator.contract-parity.test.ts`                          | union 期待値に `RuntimeSkillCreatorExecuteErrorResponse` を追加        |

## 参照資料

- Phase 1 要件定義書
- `packages/shared/src/types/skillCreator.ts`（L749: `RuntimeSkillCreatorImproveErrorResponse` パターン参照）

## 成果物

- Phase 2 設計書（本ファイル）
- 型定義設計（`RuntimeSkillCreatorExecuteErrorResponse`）
- ガード挿入位置の確定
- 既存テスト影響分析
- 変更ファイル一覧

## 完了条件

- [x] `RuntimeSkillCreatorExecuteErrorResponse` の型定義が確定した
- [x] `RuntimeSkillCreatorExecuteResponse` union の拡張方針が確定した
- [x] `_executeInternal()` へのガード挿入位置が確定した
- [x] `improve()` へのガード挿入位置が確定した
- [x] 既存テストへの影響と対応方針が分析された

## 次のPhase

Phase 3: 設計レビュー
