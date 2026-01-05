# テスト実行ガイド

## 概要

AIWorkflowOrchestratorプロジェクトのテスト実行方法を説明します。

---

## クイックスタート

### ユニットテスト実行

```bash
# 全パッケージのテスト実行
pnpm test:run

# 特定パッケージのテスト
pnpm --filter @repo/desktop test:run
pnpm --filter @repo/shared test:run
```

### ウォッチモード

```bash
# ファイル変更を監視してテスト再実行
pnpm --filter @repo/desktop test
```

### UI モード（推奨）

```bash
# ブラウザでVitest UIを起動
pnpm --filter @repo/desktop test:ui
```

Vitest UIでは以下が可能:

- テスト結果のリアルタイム表示
- カバレッジマップの視覚化
- 失敗テストのフィルタリング
- テストファイルのホットリロード

---

## カバレッジ確認

```bash
# カバレッジレポート生成
pnpm --filter @repo/desktop test:coverage
pnpm --filter @repo/shared test:coverage
```

### カバレッジ閾値

| パッケージ | 行  | 関数 | 分岐 |
| ---------- | --- | ---- | ---- |
| desktop    | 80% | 80%  | 60%  |
| shared     | 65% | 80%  | 60%  |

閾値未達の場合、テストは失敗します。

---

## テストユーティリティ

### カスタムレンダー関数

```typescript
import { renderWithRouter, renderWithProviders } from "@/test/utils";

// Router込みレンダリング
renderWithRouter(<MyComponent />);

// 全Provider込みレンダリング
renderWithProviders(<MyComponent />);
```

### ストアモック

```typescript
import { mockStore, resetStore } from "@/test/test-helpers";

// ストアを一時的にモック
const reset = mockStore(useMyStore, { key: "value" });

// テスト後にリセット
reset();
```

### テストデータファクトリー

```typescript
import {
  createMockChatSession,
  createMockChatMessage,
  resetFactories,
} from "@/test/factories";

// モックセッション生成
const session = createMockChatSession({ title: "Test" });

// モックメッセージ生成
const message = createMockChatMessage({ role: "assistant" });

// ファクトリーカウンターリセット
resetFactories();
```

---

## MSW (Mock Service Worker)

外部APIのモックは自動的に有効化されます。詳細は [MSW.md](./MSW.md) を参照。

---

## E2Eテスト

```bash
# E2Eテスト実行
pnpm --filter @repo/desktop test:e2e

# UIモードで実行
pnpm --filter @repo/desktop test:e2e:ui

# ブラウザ表示あり
pnpm --filter @repo/desktop test:e2e:headed
```

詳細は [E2E.md](./E2E.md) を参照。

---

## トラブルシューティング

### テストが不安定な場合

1. `resetFactories()` をbeforeEachで呼び出す
2. 非同期処理には `waitFor` を使用
3. `data-testid` でDOM要素を特定

### カバレッジが低い場合

1. 除外設定を確認: `vitest.config.ts` の `coverage.exclude`
2. テスト対象ファイルを確認: `coverage/index.html` を開く
