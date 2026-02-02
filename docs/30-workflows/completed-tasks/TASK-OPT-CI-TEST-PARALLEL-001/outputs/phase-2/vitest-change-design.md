# Vitest変更設計書

## 作成日

2026-02-02

## 変更対象

`apps/desktop/vitest.config.ts`

## 変更内容

### 1. maxForks の環境分岐

**変更前**:

```typescript
poolOptions: {
  forks: {
    maxForks: 2,
    isolate: true,
  },
},
```

**変更後**:

```typescript
// CI環境では4並列、ローカルでは2並列
// 根拠: GitHub Actionsランナー（2コア、8GB RAM）でのI/O待ち時間活用
const CI_MAX_FORKS = 4;
const LOCAL_MAX_FORKS = 2;

poolOptions: {
  forks: {
    maxForks: process.env.CI ? CI_MAX_FORKS : LOCAL_MAX_FORKS,
    isolate: true,
  },
},
```

### 2. fileParallelism の環境分岐

**変更前**:

```typescript
fileParallelism: false,
```

**変更後**:

```typescript
// CI環境ではファイル間並列化を有効化
// ローカルではメモリ消費を抑えるため無効
fileParallelism: !!process.env.CI,
```

### 3. カバレッジ除外設定の追加（必要に応じて）

**追加検討項目**:

```typescript
coverage: {
  exclude: [
    // 既存の除外設定
    ...
    // 開発用ファイル（カバレッジ不要）
    "src/renderer/utils/devMockAuth.ts",
    "src/renderer/utils/styles.ts",
  ],
},
```

## 設計根拠

### maxForks: 2 → 4 (CI時)

| 項目                   | 値                           |
| ---------------------- | ---------------------------- |
| GitHub Actionsランナー | 2コア、8GB RAM               |
| I/O待ち時間            | テストのimport/setup中に発生 |
| 推奨値                 | コア数 × 2 = 4               |

**リスク**: メモリ不足
**対策**: CI環境のみ変更、ローカルは2維持

### fileParallelism: false → true (CI時)

| 項目         | 値                           |
| ------------ | ---------------------------- |
| メモリ使用量 | 増加（複数ファイル同時実行） |
| 8GB RAM      | 十分なマージン               |
| 期待効果     | テスト実行時間短縮           |

**リスク**: 不安定なテスト（テスト間干渉）
**対策**: `isolate: true`でプロセス分離

## 完成後の設定

```typescript
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

// CI環境での並列化設定
const CI_MAX_FORKS = 4;
const LOCAL_MAX_FORKS = 2;

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "happy-dom",
    include: ["src/**/*.test.{ts,tsx}"],
    exclude: ["node_modules/", "out/", "dist/"],
    setupFiles: ["./src/test/setup.ts"],
    pool: "forks",
    poolOptions: {
      forks: {
        maxForks: process.env.CI ? CI_MAX_FORKS : LOCAL_MAX_FORKS,
        isolate: true,
      },
    },
    testTimeout: 10000,
    teardownTimeout: 5000,
    fileParallelism: !!process.env.CI,
    dangerouslyIgnoreUnhandledErrors: true,
    coverage: {
      // ... 既存設定
    },
  },
  // ... 既存設定
});
```

## 互換性

| 環境                | maxForks | fileParallelism |
| ------------------- | -------- | --------------- |
| CI (GitHub Actions) | 4        | true            |
| ローカル開発        | 2        | false           |

ローカル開発環境への影響なし。
