# Acceptance Criteria

| AC   | 判定 | 根拠                                                                                                                  |
| ---- | ---- | --------------------------------------------------------------------------------------------------------------------- |
| AC-1 | 達成 | contract 型と fixture を `phase / resource / entry-exit` に限定した                                                   |
| AC-2 | 達成 | `ManifestLoader` は read / validate / normalize / cache のみを持ち、IPC / auth / session を持たない                   |
| AC-3 | 達成 | `WorkflowManifestPhase`、`WorkflowManifestResourceDescriptor`、`WorkflowManifestHook` を handoff 契約として切り出した |
| AC-4 | 達成 | current code anchor map と aiworkflow-requirements 参照観点を 1:1 で整理した                                          |

## 検証方法

- 静的検証: shared 型定義、loader 実装、fixture 構造
- 型検証: `pnpm --filter @repo/desktop typecheck`、`pnpm --filter @repo/shared typecheck`
- テスト計画: `ManifestLoader.test.ts` に positive / negative / cache drift を実装
