# Phase 7 カバレッジレポート

## 実行コマンド

```bash
pnpm --filter @repo/shared exec vitest run \
  src/services/chunking/__tests__/chunking-service.integration.test.ts \
  src/services/embedding/providers/__tests__/mock-token-embedding-provider.test.ts
pnpm --filter @repo/shared typecheck
```

## カバーした分岐

| 対象                                         | 分岐                   | テスト                                       |
| -------------------------------------------- | ---------------------- | -------------------------------------------- |
| `ChunkingService.applyLateChunking()`        | provider あり          | TP-01, TP-04, 長文, オフセット               |
| `ChunkingService.applyLateChunking()`        | provider なし fallback | TP-02                                        |
| `ChunkingService.getTokenEmbeddingsResult()` | lengths mismatch       | TP-05                                        |
| `ChunkingService.chunk()` 本流               | provider 優先利用      | `chunk() 本流での token provider 分岐` 1件目 |
| `ChunkingService.chunk()` 本流               | fallback 維持          | `chunk() 本流での token provider 分岐` 2件目 |
| `MockTokenEmbeddingClient`                   | token 結果整合         | TP-03, TP-MOCK-01                            |

## 未カバー領域

- real provider の tokenization / offset mapping 差異
- provider 層正式 interface への昇格
- 空文字 only 入力の fallback 近似

## 判定

- 本 task の主論点だった `chunk()` 本流未接続は解消済み
- fallback の戻り件数不整合は TP-02 で回帰防止済み
