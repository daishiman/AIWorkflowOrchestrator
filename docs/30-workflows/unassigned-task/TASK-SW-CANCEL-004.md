# TASK-SW-CANCEL-004: skill-creator-cancel-renderer-hook

## メタ情報

| 項目     | 値                                                                                      |
| -------- | --------------------------------------------------------------------------------------- |
| タスクID | TASK-SW-CANCEL-004                                                                      |
| タスク名 | skill-creator-cancel-renderer-hook                                                      |
| 検出元   | TASK-SW-CANCEL-001 Phase 12 未タスク検出                                                |
| 優先度   | HIGH                                                                                    |
| 影響     | ユーザーがキャンセルボタンを押しても IPC まで届かず、Main プロセスの LLM 処理が継続する |
| 検出日   | 2026-04-15                                                                              |

## 概要

`useCancelGeneration.ts` の `cancelGeneration()` は `AbortController.abort()` と `setStage("cancelled")` のみ実装されており、Preload 層経由の IPC 送信が欠落している。IPC 4層キャンセル接続の最終タスクであり、これを実装することで Renderer → Preload → Main の全経路が確立される。

## 依存関係

| 種別       | タスクID                                  | 状態   |
| ---------- | ----------------------------------------- | ------ |
| 依存タスク | TASK-SW-CANCEL-003                        | 未着手 |
| 後続タスク | なし（IPC 4層キャンセル接続の最終タスク） | -      |

## 詳細仕様書

`docs/30-workflows/skill-create-flow-gaps/p04-seq-CANCEL-004/index.md`

## 対象ファイル

| ファイルパス                                             | 変更内容                               |
| -------------------------------------------------------- | -------------------------------------- |
| `apps/desktop/src/renderer/hooks/useCancelGeneration.ts` | cancelGeneration() に IPC 呼び出し追加 |

## 現状

```typescript
const cancelGeneration = useCallback(() => {
  abortControllerRef.current?.abort();
  setStage("cancelled");
  // IPC 送信が未実装
}, []);
```

## 期待される修正

```typescript
const cancelGeneration = useCallback(() => {
  abortControllerRef.current?.abort();
  setStage("cancelled");
  window.skillCreatorAPI?.cancelGeneration?.(); // IPC 送信追加
}, []);
```

## 完了条件

- [ ] `cancelGeneration()` が `window.skillCreatorAPI?.cancelGeneration?.()` を呼び出している
- [ ] IPC 呼び出しは `AbortController.abort()` および `setStage("cancelled")` の後に実行される
- [ ] `pnpm typecheck` が PASS する

## 関連

- 依存タスク: TASK-SW-CANCEL-003
- 後続タスク: なし（IPC 4層キャンセル接続の最終タスク）
- 対象ファイル: `apps/desktop/src/renderer/hooks/useCancelGeneration.ts`
