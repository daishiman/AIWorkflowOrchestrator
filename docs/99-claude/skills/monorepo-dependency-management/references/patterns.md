# モノレポ依存関係管理 - 実装パターン

## 概要

pnpm workspacesを用いたモノレポの依存関係管理における設計パターンと実装戦略。
変更影響分析、バージョン同期、ホイスティング最適化を網羅する。

## ディレクトリ構造パターン

### 標準パターン

```
my-monorepo/
├── package.json
├── pnpm-workspace.yaml
├── pnpm-lock.yaml
├── .npmrc
├── packages/
│   ├── core/       # ビジネスロジック
│   ├── utils/      # ユーティリティ
│   └── ui/         # UIコンポーネント
├── apps/
│   ├── web/        # Webアプリ
│   └── api/        # APIサーバー
└── tools/
    └── cli/        # CLIツール
```

### レイヤードパターン

```
packages/
├── domain/         # ドメイン層（依存なし）
├── application/    # アプリケーション層
├── infrastructure/ # インフラ層
└── presentation/   # プレゼンテーション層
```

## 内部依存パターン

### 明示的依存宣言

```json
// apps/web/package.json
{
  "dependencies": {
    "@app/core": "workspace:*",
    "@app/ui": "workspace:^1.0.0"
  }
}
```

### 依存注入パターン

```typescript
// packages/core/src/index.ts
export interface Logger {
  log(message: string): void;
}

// apps/web/src/main.ts
import { createApp, Logger } from "@app/core";

const logger: Logger = {
  log: (msg) => console.log(msg),
};
createApp({ logger });
```

## バージョン同期パターン

### pnpm Catalogs（推奨）

```yaml
# pnpm-workspace.yaml
catalog:
  react: "^18.2.0"
  typescript: "^5.3.0"
  vitest: "^1.2.0"
```

```json
// packages/ui/package.json
{
  "dependencies": {
    "react": "catalog:"
  }
}
```

### 統一バージョン管理

```bash
# 全パッケージのバージョンを一括更新
pnpm -r exec -- npm version minor --no-git-tag-version
```

## 変更影響分析パターン

### 依存グラフトラバーサル

```bash
# 変更パッケージの被依存パッケージを特定
pnpm --filter ...^@app/core run test

# 変更パッケージと全依存パッケージをビルド
pnpm --filter @app/core... run build
```

### フィルタ構文

| 構文            | 意味                         |
| --------------- | ---------------------------- |
| `@app/core`     | 指定パッケージのみ           |
| `@app/core...`  | 指定 + 依存パッケージ        |
| `...@app/core`  | 指定 + 被依存パッケージ      |
| `...^@app/core` | 被依存パッケージのみ         |
| `[origin/main]` | mainから変更されたパッケージ |
| `{packages/*}`  | ディレクトリマッチ           |

## ホイスティング最適化パターン

### 最小限ホイスト

```ini
# .npmrc
shamefully-hoist=false
public-hoist-pattern[]=*eslint*
public-hoist-pattern[]=*prettier*
public-hoist-pattern[]=@types/*
```

### 問題パッケージ対応

```ini
# .npmrc
# 特定パッケージの互換性問題を解消
public-hoist-pattern[]=*webpack*
public-hoist-pattern[]=*babel*
```

## 循環依存解消パターン

### パターン1: 共通パッケージ抽出

```
Before:
  A ←→ B

After:
  A → C ← B
```

### パターン2: インターフェース分離

```typescript
// packages/types/src/index.ts
export interface ServiceA { ... }
export interface ServiceB { ... }

// packages/a/src/index.ts
import type { ServiceB } from '@app/types';

// packages/b/src/index.ts
import type { ServiceA } from '@app/types';
```

### パターン3: イベント駆動

```typescript
// packages/events/src/index.ts
export const eventBus = new EventEmitter();

// packages/a/src/index.ts
eventBus.emit("a:completed", data);

// packages/b/src/index.ts
eventBus.on("a:completed", handleData);
```

## CI/CD統合パターン

### 変更検知ビルド

```yaml
# .github/workflows/ci.yml
jobs:
  build:
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Install pnpm
        uses: pnpm/action-setup@v2

      - name: Build changed packages
        run: pnpm --filter "[origin/main]..." run build
```

### マトリクスビルド

```yaml
jobs:
  detect-changes:
    outputs:
      packages: ${{ steps.changes.outputs.packages }}
    steps:
      - id: changes
        run: echo "packages=$(pnpm ls -r --json | jq -c '[.[]|.name]')" >> $GITHUB_OUTPUT

  build:
    needs: detect-changes
    strategy:
      matrix:
        package: ${{ fromJson(needs.detect-changes.outputs.packages) }}
    steps:
      - run: pnpm --filter ${{ matrix.package }} run build
```

## TypeScript設定パターン

### Project References

```json
// packages/core/tsconfig.json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "composite": true,
    "outDir": "./dist"
  },
  "references": [{ "path": "../utils" }]
}
```

### パスエイリアス

```json
// tsconfig.base.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@app/*": ["packages/*/src"]
    }
  }
}
```

## アンチパターン

### 避けるべき実装

| パターン         | 問題             | 解決策                   |
| ---------------- | ---------------- | ------------------------ |
| 循環依存の放置   | ビルド順序不定   | 共通パッケージ抽出       |
| バージョン不整合 | 実行時エラー     | Catalogs機能活用         |
| 過度なホイスト   | 依存解決の曖昧さ | 最小限ホイスト設定       |
| 暗黙的依存       | 破壊的変更に脆弱 | 明示的workspace:宣言     |
| 全体ビルドのみ   | CI/CD時間増大    | フィルタによる部分ビルド |

## チェックリスト

### 設計時

- [ ] 依存の方向性ルールを定義したか
- [ ] パッケージ命名規則を統一したか
- [ ] バージョン同期戦略を決定したか

### 実装時

- [ ] workspace:プロトコルを使用しているか
- [ ] 循環依存が存在しないか
- [ ] ホイスティング設定は最小限か

### 運用時

- [ ] 変更影響分析を実行しているか
- [ ] 部分ビルド・テストを活用しているか
- [ ] 依存グラフを定期的に検証しているか
