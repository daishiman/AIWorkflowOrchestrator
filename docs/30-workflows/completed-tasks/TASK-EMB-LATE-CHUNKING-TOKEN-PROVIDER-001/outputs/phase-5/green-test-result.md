# Phase 5 GREEN テスト結果

## 状態: GREEN（全テスト PASS）

## chunking-service.integration.test.ts

```
 ✓ src/services/chunking/__tests__/chunking-service.integration.test.ts (29 tests) 101ms
```

29 テスト全件 PASS（既存 22 件 + 新規 7 件）

### 新規テスト結果

| ID         | テスト名                                                               | 結果 |
| ---------- | ---------------------------------------------------------------------- | ---- |
| TP-01      | embed() が呼ばれず getTokenEmbeddings() が呼ばれる                     | PASS |
| TP-02      | embed() がフォールバックとして呼ばれる                                 | PASS |
| TP-03      | tokens.length === embeddings.length で型エラーなし                     | PASS |
| TP-04      | 各チャンクに異なるベクトルが割り当てられる                             | PASS |
| TP-05      | tokens と embeddings の長さが不一致のとき ChunkingError がスローされる | PASS |
| 長文       | 長文テキストでも各チャンクにベクトルが割り当てられる                   | PASS |
| オフセット | チャンク境界のグローバルオフセットが正しくマッピングされる             | PASS |

## mock-token-embedding-provider.test.ts

```
 ✓ src/services/embedding/providers/__tests__/mock-token-embedding-provider.test.ts (1 test) 10ms
```

1 テスト PASS

## 型チェック

```
pnpm --filter @repo/shared typecheck
> tsc --noEmit
（エラーなし、正常終了）
```
