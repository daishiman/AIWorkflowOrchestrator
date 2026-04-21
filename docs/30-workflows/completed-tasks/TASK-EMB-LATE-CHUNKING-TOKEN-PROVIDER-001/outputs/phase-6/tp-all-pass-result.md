# Phase 6 TP-01〜TP-05 全 PASS 確認

## テスト実行コマンド

```bash
pnpm --filter @repo/shared exec vitest run src/services/chunking
```

## 実行結果

```
 RUN  v2.1.9 /...packages/shared

 ✓ src/services/chunking/__tests__/chunking-service.integration.test.ts (29 tests) 101ms
 ✓ src/services/chunking/__tests__/fixed-chunking-strategy.test.ts (30 tests) 449ms

 Test Files  2 passed (2)
      Tests  59 passed (59)
   Start at  05:44:16
   Duration  4.21s
```

## TP 個別確認

| テストID | 説明                                         | 結果 |
| -------- | -------------------------------------------- | ---- |
| TP-01    | embed() 不呼出・getTokenEmbeddings() 1回呼出 | PASS |
| TP-02    | embed() がフォールバックとして呼ばれる       | PASS |
| TP-03    | tokens.length === embeddings.length          | PASS |
| TP-04    | 各チャンクに異なるベクトルが割り当てられる   | PASS |
| TP-05    | lengths 不一致で ChunkingError スロー        | PASS |

既存テスト（22件）も全件 PASS。リグレッションなし。
