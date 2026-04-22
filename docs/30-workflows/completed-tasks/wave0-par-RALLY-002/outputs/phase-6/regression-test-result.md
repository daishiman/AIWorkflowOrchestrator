# 回帰テスト結果

## 実行コマンド

```bash
ESBUILD_BINARY_PATH="..." pnpm --filter @repo/desktop exec vitest run \
  src/renderer/components/skill/__tests__/ConversationalInterview.test.tsx \
  src/renderer/components/skill/__tests__/ConversationalInterview.ipc-edge.test.tsx
```

## 実行結果

**Test Files: 2 passed (2)**  
**Tests: 28 passed | 1 todo (29)**

| テストファイル                            | 結果                 |
| ----------------------------------------- | -------------------- |
| ConversationalInterview.test.tsx          | ✅ 25 passed         |
| ConversationalInterview.ipc-edge.test.tsx | ✅ 3 passed + 1 todo |

全既存テスト通過。回帰なし。
