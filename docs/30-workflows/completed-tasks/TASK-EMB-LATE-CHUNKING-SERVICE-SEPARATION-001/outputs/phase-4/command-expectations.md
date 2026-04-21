# Command Expectations - Phase 4

## Red フェーズ実行コマンド（期待: 失敗）

```bash
pnpm --filter @repo/shared test -- packages/shared/src/services/embedding/late-chunking
```

### 期待結果

- `import { LateChunkingService } from "../LateChunkingService"` → `ERR_MODULE_NOT_FOUND` もしくは TS コンパイルエラー
- テスト実行自体が開始できず全ケース Red
- 結論: Phase 5 で `LateChunkingService.ts` を実装することで Green 化する

## Phase 5 完了後の Green 期待

```bash
pnpm --filter @repo/shared vitest run packages/shared/src/services/embedding/late-chunking
```

### 期待結果

- SEP-01 PASS
- SEP-02 PASS
- SEP-03 PASS
- SEP-04 PASS
- SEP-05 PASS
- SEP-06 PASS
- SEP-07 PASS
- 合計 7 テスト PASS

## 既存回帰テスト維持確認

```bash
pnpm --filter @repo/shared vitest run packages/shared/src/services/chunking/__tests__/chunking-service.integration.test.ts
```

### 期待結果

- Late Chunking - 正常系 3 件 PASS
- Late Chunking - 異常系 1 件 PASS
- その他既存テスト全件 PASS

## SEP-08/SEP-09（Phase 6 で追加）

Phase 6 で `chunking-service.integration.test.ts` に追加。

- SEP-08: `lateChunking.enabled=true` で `applyLateChunking` が 1 回呼ばれる
- SEP-09: `lateChunking.enabled=false` で `applyLateChunking` が呼ばれない
