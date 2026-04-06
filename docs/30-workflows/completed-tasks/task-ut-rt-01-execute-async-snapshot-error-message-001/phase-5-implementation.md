# Phase 5: 実装

## メタ情報

| 項目       | 内容                                                   |
| ---------- | ------------------------------------------------------ |
| Phase      | 5                                                      |
| Phase 名   | 実装                                                   |
| 前提 Phase | Phase 4（テスト作成）完了・T-01/T-02 が Red 確認済み   |
| 後続 Phase | Phase 6（テスト拡充）                                  |
| ステータス | 未実施                                                 |
| 作成日     | 2026-04-06                                             |
| 機能名     | task-ut-rt-01-execute-async-snapshot-error-message-001 |

---

## 目的

Phase 4 で Red 状態にしたテスト（T-01, T-02）を Green に転換するため、`executeAsync()` の structured error パスと catch パスから `if (!snapshot)` 条件ブロックを削除し、`onWorkflowStateSnapshot` が snapshot の有無に関わらず常に呼び出されるよう修正する。

---

## 実装計画

### 変更ファイル一覧（[Feedback RT-03] ルール準拠）

| 種別     | ファイルパス                                                                                      | 変更内容                                               |
| -------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| 修正     | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`                             | `executeAsync()` の行 1032-1057 付近（2 箇所修正）     |
| 追記対象 | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.executeAsync.test.ts` | T-01〜T-04 が Phase 4 で追記済みであることを前提とする |

### 変更しないファイル

| ファイルパス                                   | 理由                                       |
| ---------------------------------------------- | ------------------------------------------ |
| `packages/shared/src/types/skillCreator.ts`    | 型変更なし（Phase 2 設計通り）             |
| `apps/desktop/src/main/ipc/creatorHandlers.ts` | IPC チャンネル変更なし（Phase 2 設計通り） |
| Renderer 側 UI コンポーネント                  | スコープ外（Phase 1 設計通り）             |

---

## 実装前確認: 既存テスト baseline の確認

Phase 5 実装開始前に、影響範囲の既存テストが GREEN であることを確認する。

```bash
# 変更対象ファイルに関連する既存テストを実行
pnpm --filter @repo/desktop exec vitest run src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.executeAsync.test.ts
```

確認事項:

- [ ] TC-T4-01〜TC-T4-04 が全て GREEN であることを確認済み（baseline）
- [ ] T-01, T-02 が RED であることを確認済み（Phase 4 で作成）

---

## 実装手順

### ステップ1: 対象ファイルの該当箇所を確認

```bash
# executeAsync() の実装行を確認（行 991〜1057 付近）
grep -n "if (!snapshot)" apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts
```

以下の2箇所に `if (!snapshot)` が存在することを確認する:

1. structured error パス（行 1032-1043 付近）
2. catch パス（行 1044-1057 付近）

### ステップ2: structured error パスの修正

**対象ファイル**: `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`

**修正箇所（行 1032-1043 付近）**:

Before:

```typescript
if (isStructuredError) {
  const errorResponse =
    executeResult as RuntimeSkillCreatorExecuteErrorResponse;
  const snapshot = this.workflowEngine.getWorkflowState(planId);
  if (!snapshot) {
    this.onWorkflowStateSnapshot?.(planId, null, errorResponse.error.message);
  }
}
```

After:

```typescript
if (isStructuredError) {
  const errorResponse =
    executeResult as RuntimeSkillCreatorExecuteErrorResponse;
  const snapshot = this.workflowEngine.getWorkflowState(planId);
  this.onWorkflowStateSnapshot?.(
    planId,
    snapshot ?? null,
    errorResponse.error.message,
  );
}
```

変更内容:

- `if (!snapshot) { ... }` 条件ブロックを削除
- 第2引数を `null` から `snapshot ?? null` に変更（snapshot が存在する場合はそれを渡す）
- `onWorkflowStateSnapshot` を常に呼び出す

### ステップ3: catch パスの修正

**対象箇所（行 1044-1057 付近）**:

Before:

```typescript
} catch (error) {
  this.workflowEngine.triggerPhaseTransition(planId, "error", 0);
  const errorMessage = error instanceof Error ? error.message : String(error);
  const snapshot = this.workflowEngine.getWorkflowState(planId);
  if (!snapshot) {
    this.onWorkflowStateSnapshot?.(planId, null, errorMessage);
  }
  console.error(
    "[RuntimeSkillCreatorFacade] executeAsync failed",
    planId,
    errorMessage,
  );
}
```

After:

```typescript
} catch (error) {
  this.workflowEngine.triggerPhaseTransition(planId, "error", 0);
  const errorMessage = error instanceof Error ? error.message : String(error);
  const snapshot = this.workflowEngine.getWorkflowState(planId);
  this.onWorkflowStateSnapshot?.(planId, snapshot ?? null, errorMessage);
  console.error(
    "[RuntimeSkillCreatorFacade] executeAsync failed",
    planId,
    errorMessage,
  );
}
```

変更内容:

- `if (!snapshot) { ... }` 条件ブロックを削除
- 第2引数を `null` から `snapshot ?? null` に変更
- `onWorkflowStateSnapshot` を常に呼び出す

### ステップ4: TypeScript 型チェック

```bash
pnpm --filter @repo/desktop typecheck
```

期待結果: エラー 0 件

確認事項:

- `snapshot ?? null` の型は `SkillCreatorWorkflowUiSnapshot | null` であり、`onWorkflowStateSnapshot` の第2引数型と一致している
- 第3引数の `errorResponse.error.message` および `errorMessage` の型は `string` であり、`error?: string` の型と一致している

### ステップ5: テストの実行（Green 確認）

```bash
pnpm --filter @repo/desktop test -- --testPathPattern "RuntimeSkillCreatorFacade.executeAsync"
```

期待結果:

- T-01: GREEN（修正後）
- T-02: GREEN（修正後）
- TC-T4-01〜TC-T4-04: 引き続き GREEN（回帰なし）

### ステップ6: ESLint チェック

```bash
pnpm --filter @repo/desktop lint
```

期待結果: エラー 0 件

---

## ファイル分離の判断

Phase 4 テンプレートの判断基準に照らした結果:

1. トップレベル副作用: なし（`RuntimeSkillCreatorFacade.ts` は class 定義のみ）
2. 新規ロジックの行数: 2 行削除・2 行変更（50 行未満）
3. テスト容易性: 既存のモックパターンで対応可能

**判断**: ファイル分離の先行実施は不要。

---

## union 型の網羅性について

`execute()` の返り値 union 型（`RuntimeSkillCreatorExecuteResponse`）の全ケースは現在インライン条件式で処理されている。本修正では `isStructuredError` フラグが `false` の場合（terminal_handoff / success）のパスは変更しない。

将来的な union 拡張に備えた exhaustive check パターンの導入は Phase 3 で記録した未タスク候補（`RuntimeSkillCreatorExecuteResponse` union 拡張時の exhaustive check 導入）として Phase 12 に持ち越す。

---

## 実行タスク

- タスク1: 既存テスト baseline 確認（`pnpm test` で TC-T4-01〜T4-04 GREEN を確認）
- タスク2: `RuntimeSkillCreatorFacade.ts` の structured error パス修正（`if (!snapshot)` 削除 + `snapshot ?? null` 適用）
- タスク3: `RuntimeSkillCreatorFacade.ts` の catch パス修正（同様）
- タスク4: `pnpm --filter @repo/desktop typecheck` で型チェック（エラー 0 件を確認）
- タスク5: テスト実行（T-01, T-02 GREEN、既存テスト回帰なし を確認）
- タスク6: ESLint 実行（エラー 0 件を確認）

---

## 統合テスト連携

- `onWorkflowStateSnapshot` コールバックは `creatorHandlers.ts` で `mainWindow.webContents.send(SKILL_CREATOR_WORKFLOW_STATE_CHANGED, ...)` にワイヤリングされている
- 修正後のコードは既存の IPC ワイヤリングをそのまま使用し、IPC チャンネル変更は不要
- Renderer 側が `error` 引数を受け取る追加実装はスコープ外（Phase 1 スコープ確認通り）

---

## 成果物

| 成果物             | パス                                                                                                 | 内容                                   |
| ------------------ | ---------------------------------------------------------------------------------------------------- | -------------------------------------- |
| Phase 5 実装仕様書 | `docs/30-workflows/task-ut-rt-01-execute-async-snapshot-error-message-001/phase-5-implementation.md` | 本ドキュメント                         |
| Phase 5 outputs    | `docs/30-workflows/task-ut-rt-01-execute-async-snapshot-error-message-001/outputs/phase-5/`          | 空ディレクトリ（実行時に成果物を格納） |
| 修正対象ファイル   | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`                                | Phase 5 実行時に修正                   |

---

## 完了条件

- [ ] 既存テスト baseline を確認済み（TC-T4-01〜TC-T4-04 が全て GREEN）
- [ ] structured error パスの `if (!snapshot)` 条件ブロックを削除済み
- [ ] catch パスの `if (!snapshot)` 条件ブロックを削除済み
- [ ] `snapshot ?? null` を第2引数に渡すよう変更済み
- [ ] `pnpm --filter @repo/desktop typecheck` がエラー 0 件（AC-3 充足）
- [ ] T-01 が GREEN（AC-1 充足: structured error パスで snapshot あり時の伝搬確認）
- [ ] T-02 が GREEN（AC-2 充足: catch パスで snapshot あり時の伝搬確認）
- [ ] TC-T4-01〜TC-T4-04 が回帰なし
- [ ] ESLint エラー 0 件

---

## Phase 末端アクション【必須】

- [ ] Phase 5 内の全タスクを 100% 実行完了
- [ ] `pnpm typecheck` / `pnpm lint` / `pnpm test` の全コマンドが PASS であることを確認
- [ ] 成果物（本ドキュメント）が生成されていることを確認
- [ ] artifacts.json の phase-5 ステータスを `completed` に更新

---

## 次 Phase

Phase 5 完了後、次は **Phase 6（テスト拡充）** へ進む。

`docs/30-workflows/task-ut-rt-01-execute-async-snapshot-error-message-001/phase-6-test-expansion.md`
