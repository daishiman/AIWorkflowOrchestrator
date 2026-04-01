# Phase 8: リファクタリング

## メタ情報

| 項目         | 内容                         |
| ------------ | ---------------------------- |
| Phase        | 8                            |
| タスクID     | TASK-FIX-EXECUTE-PLAN-FF-001 |
| ステータス   | 未実施                       |
| 担当         | 実装者                       |
| 見積もり時間 | 1h                           |

## 目的

Phase 5 の実装コードを確認し、可読性・保守性・型安全性の観点でリファクタリングが必要な箇所を整理する。テストが全て PASS したまま改善する。

## 実行タスク

1. コメントの適切性確認（fire-and-forget の意図が明確か）
2. エラーログ追加の要否判断
3. 型安全性の改善（不要な型キャストの除去）
4. `void` キーワードの使用方針確認
5. リファクタリング後の全テスト再実行

## 参照資料

### システム仕様（aiworkflow-requirements）

| 参照資料           | パス                                                                         | 内容                      |
| ------------------ | ---------------------------------------------------------------------------- | ------------------------- |
| セキュリティ仕様   | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md` | Electron IPC セキュリティ |
| アーキテクチャ仕様 | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md` | システム全体像            |

## 実行手順

### ステップ 1: コメントの適切性確認

**`creatorHandlers.ts`** のコメントが fire-and-forget の意図を明確に伝えているか確認する:

```typescript
// 確認ポイント: コメントが以下の 3 点を説明しているか
// 1. なぜ await しないか（IPC タイムアウト回避）
// 2. バックグラウンドで何が行われるか（Agent SDK query() の非同期実行）
// 3. エラーはどこで通知されるか（SKILL_CREATOR_WORKFLOW_STATE_CHANGED）
void facade.executeAsync(planId, req);
```

**`RuntimeSkillCreatorFacade.ts`** の `executeAsync` コメントが onPhaseChanged のワイヤリング目的を説明しているか確認する。

### ステップ 2: エラーログ追加の判断

以下の場所でエラーログの追加を検討する:

| 箇所                             | 推奨 | 理由                       |
| -------------------------------- | ---- | -------------------------- |
| `executeAsync` の catch ブロック | 推奨 | 本番環境でのデバッグに必要 |
| `onPhaseChanged` 呼び出し前後    | 不要 | 過剰なログは避ける         |

```typescript
// 推奨: executeAsync の catch に logger.error を追加
} catch (error) {
  logger.error('[RuntimeSkillCreatorFacade] execute-plan failed', {
    planId,
    error: error instanceof Error ? error.message : String(error),
  });
  this.mainWindow.webContents.send(
    SKILL_CREATOR_WORKFLOW_STATE_CHANGED,
    { planId, phase: 'failed', progress: 0, error: sanitizeErrorMessage(error) }
  );
}
```

### ステップ 3: 型安全性の改善

**確認ポイント**:

1. `onPhaseChanged` の型パラメータが `WorkflowPhase` 型（string リテラル共用体）を正しく使っているか
2. `ExecutePlanRequest` 型が `req` 引数に正しく適用されているか
3. `PhaseChangedCallback` の型定義が `WorkflowPhase` と一致しているか

```typescript
// 確認: PhaseChangedCallback の型が WorkflowPhase を使っているか
export type PhaseChangedCallback = (
  phase: WorkflowPhase, // 'analyzing' | 'designing' | ... | 'failed'
  progress: number, // 0-100
) => void;
```

### ステップ 4: void キーワードの使用方針確認

`void facade.executeAsync(planId, req)` のパターンが ESLint ルールに準拠しているか確認:

```bash
# ESLint の no-floating-promises チェック
pnpm --filter @repo/desktop lint src/main/ipc/creatorHandlers.ts
```

`void` キーワードがなければ `@typescript-eslint/no-floating-promises` エラーが出ることを確認し、`void` キーワードが意図的であることをコメントで示す。

### ステップ 5: リファクタリング対象外の確認

以下はスコープ外のため変更しない:

| 変更しないもの                                  | 理由                    |
| ----------------------------------------------- | ----------------------- |
| `CHANNEL_TIMEOUTS` の値（1_800_000）            | P0 暫定値として確定済み |
| `SkillCreatorWorkflowEngine` の内部実行ロジック | 修正スコープ外          |
| Renderer 側のコード                             | 本タスクのスコープ外    |
| `safeInvoke` の実装                             | PR#1823 で確定済み      |

### ステップ 6: リファクタリング後のテスト再実行

```bash
# 全テスト再実行（Green を維持していることを確認）
pnpm --filter @repo/desktop exec vitest run \
  src/preload/__tests__/ipc-utils.execute-plan-timeout.test.ts \
  src/main/ipc/__tests__/creatorHandlers.fire-and-forget.test.ts \
  src/main/services/runtime/__tests__/SkillCreatorWorkflowEngine.phase-events.test.ts

# 型チェック再実行
pnpm --filter @repo/desktop typecheck

# ESLint 再実行
pnpm --filter @repo/desktop lint \
  src/preload/ipc-utils.ts \
  src/main/ipc/creatorHandlers.ts \
  src/main/services/runtime/SkillCreatorWorkflowEngine.ts \
  src/main/services/runtime/RuntimeSkillCreatorFacade.ts
```

## 多角的チェック観点

- リファクタリングでコードの振る舞いが変わっていないか（テストが Green のまま確認）
- エラーログの追加で機密情報がログに出力されないか（`sanitizeErrorMessage` の適用確認）
- `void` キーワードのコメントが「意図的なfire-and-forget」であることを明示しているか
- `PhaseChangedCallback` 型が外部 Facade から import して使えるよう `export` されているか

## 成果物

| 成果物               | パス                                 | 説明                               |
| -------------------- | ------------------------------------ | ---------------------------------- |
| リファクタリングログ | `outputs/phase-8/refactoring-log.md` | 変更内容、判断理由、適用前後の比較 |

## 完了条件

- [ ] `creatorHandlers.ts` のコメントが fire-and-forget の意図を明確に説明している
- [ ] `executeAsync` の catch ブロックにエラーログが追加されている（または追加不要の判断が記録されている）
- [ ] 型安全性の確認が完了している（不要な型キャストが除去されている）
- [ ] リファクタリング後に全テストが PASS している
- [ ] `pnpm --filter @repo/desktop typecheck` が PASS している
- [ ] `pnpm --filter @repo/desktop lint` が PASS している

## タスク100%実行確認【必須】

- [ ] 全実行タスクが完了している
- [ ] 全成果物が存在する（`outputs/phase-8/refactoring-log.md`）
- [ ] 全完了条件が満たされている

## 次Phase

Phase 9: 品質保証 へ進む
