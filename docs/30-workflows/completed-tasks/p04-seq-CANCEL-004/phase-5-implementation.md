# Phase 5: 実装

## メタ情報

| 項目       | 内容                               |
| ---------- | ---------------------------------- |
| Phase      | 5                                  |
| タスクID   | TASK-SW-CANCEL-004                 |
| 機能名     | skill-creator-cancel-renderer-hook |
| 前提Phase  | Phase 4                            |
| 後続Phase  | Phase 6                            |
| 作成日     | 2026-04-15                         |
| ステータス | pending                            |

## 目的

`apps/desktop/src/renderer/hooks/useCancelGeneration.ts` の `cancelGeneration()` を修正し、IPC 経由でメインプロセスにキャンセル通知を送るようにする。TC-01〜TC-04 が全 PASS することを確認する。

## 実行手順

### 0. 既存テスト回帰確認（baseline確認）【必須】

```bash
pnpm --filter @repo/desktop test
# 期待: 既存テストが全 PASS（TC-01〜TC-04 は FAIL）
```

### 1. 実装ファイルリスト

| 操作 | ファイルパス                                             | 変更内容                                              |
| ---- | -------------------------------------------------------- | ----------------------------------------------------- |
| 修正 | `apps/desktop/src/renderer/hooks/useCancelGeneration.ts` | `cancelGeneration()` を `async` 化し IPC 呼び出し追加 |

### 2. 実装内容

```typescript
// 修正前
const cancelGeneration = useCallback(() => {
  abortControllerRef.current?.abort();
  abortControllerRef.current = null;
  setStage("cancelled");
  // AbortController.abort() で Main Process 側の処理も中断される  // :30コメント
}, [setStage]);

// 修正後
const cancelGeneration = useCallback(async () => {
  abortControllerRef.current?.abort();
  abortControllerRef.current = null;
  setStage("cancelled");
  await window.skillCreatorAPI?.cancelGeneration?.();
}, [setStage]);
```

### 3. Green 確認コマンド

```bash
# テスト実行（TC-01〜TC-04 が全 PASS すること）
pnpm --filter @repo/desktop exec vitest run \
  src/renderer/hooks/__tests__/useCancelGeneration-ipc.test.ts

# 型チェック
pnpm --filter @repo/desktop typecheck

# lint
pnpm --filter @repo/desktop lint
```

### 4. 既存テスト回帰確認（実装後）

```bash
pnpm --filter @repo/desktop test
```

## 統合テスト連携【必須】

| 判定項目             | 基準    | 結果    |
| -------------------- | ------- | ------- |
| TC-01〜TC-04 全 PASS | PASS    | pending |
| 既存テスト回帰なし   | 全 PASS | pending |
| 型チェック PASS      | PASS    | pending |
| lint 0 error         | 0 error | pending |

## 多角的チェック観点（AIが判断）

- [ ] `async` 化により `useCallback` の型が `() => Promise<void>` になっているか
- [ ] `cancelGeneration` を呼び出しているコンポーネント側で型エラーが発生していないか
- [ ] `:30` のコメントを実装内容を反映した内容に更新したか（または削除したか）

## サブタスク管理

1. baseline 確認（既存テスト全 PASS 確認）
2. `cancelGeneration()` の `async` 化
3. `await window.skillCreatorAPI?.cancelGeneration?.()` の追加
4. `:30` コメントの更新（実装完了を反映）
5. Green 確認（TC-01〜TC-04 PASS）
6. 型チェック・lint 確認

## 成果物

| 成果物                       | パス                                                     | 説明                 |
| ---------------------------- | -------------------------------------------------------- | -------------------- |
| useCancelGeneration 修正済み | `apps/desktop/src/renderer/hooks/useCancelGeneration.ts` | IPC 呼び出し追加済み |

## 完了条件

- [ ] baseline 確認実施済み
- [ ] `cancelGeneration()` が `async` になっている
- [ ] `window.skillCreatorAPI?.cancelGeneration?.()` の呼び出しが追加済み
- [ ] TC-01〜TC-04 が全 PASS（Green 確認）
- [ ] 既存テストへの悪影響なし
- [ ] 型チェック・lint がエラーなし
- [ ] 本 Phase 内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本 Phase 内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 6: テスト拡充
