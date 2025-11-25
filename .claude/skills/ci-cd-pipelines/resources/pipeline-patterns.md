# パイプラインアーキテクチャパターン

## 基本パターン

### 1. 線形パイプライン

最もシンプルなパターン。各ステージが順次実行される。

```
Build → Test → Deploy
```

**利点**:
- シンプルで理解しやすい
- デバッグが容易

**欠点**:
- 実行時間が長くなりやすい
- 並列化の恩恵を受けられない

**適用場面**:
- 小規模プロジェクト
- 依存関係が強いステージ

### 2. 並列パイプライン

独立したステージを並列実行し、最後に統合。

```
├── Lint
├── Type Check
├── Unit Test
├── Security Scan
└── Build
    ↓
Quality Gate
    ↓
Deploy
```

**利点**:
- 実行時間の大幅短縮
- 早期フィードバック

**欠点**:
- 設定が複雑
- リソース使用量増加

**適用場面**:
- 中〜大規模プロジェクト
- 独立したチェックが多い場合

### 3. ダイヤモンドパイプライン

ビルド後に複数のテストを並列実行し、統合。

```
        Build
       ↙  ↓  ↘
  Unit   E2E  Integration
       ↘  ↓  ↙
     Quality Gate
          ↓
       Deploy
```

**利点**:
- ビルド成果物の再利用
- テストの並列化

**欠点**:
- アーティファクト管理が必要
- 設定が複雑

**適用場面**:
- テストが多いプロジェクト
- ビルド時間が長い場合

### 4. マルチ環境パイプライン

ステージング→本番の段階的デプロイ。

```
Build → Test → Deploy Staging → Smoke Test → Deploy Production
```

**利点**:
- 本番デプロイ前の検証
- 安全なロールアウト

**欠点**:
- パイプライン時間が長い
- 環境管理のオーバーヘッド

**適用場面**:
- 本番環境への慎重なデプロイが必要
- 複数環境がある場合

## 推奨パターン：ハイブリッドパイプライン

実践的なパイプライン設計。並列化と段階的デプロイを組み合わせ。

```yaml
┌─────────────────────────────────────────────────────┐
│                     Trigger                          │
│            (PR作成 / mainへのプッシュ)               │
└─────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────┐
│                  Checkout & Setup                    │
│     (リポジトリクローン、依存関係キャッシュ復元)      │
└─────────────────────────────────────────────────────┘
                         │
        ┌───────────────┼───────────────┐
        ▼               ▼               ▼
┌───────────┐    ┌───────────┐    ┌───────────┐
│   Lint    │    │  Type     │    │  Build    │
│           │    │  Check    │    │           │
└───────────┘    └───────────┘    └───────────┘
        │               │               │
        └───────────────┼───────────────┘
                        ▼
┌─────────────────────────────────────────────────────┐
│                   Unit Tests                         │
│               (カバレッジ計測含む)                   │
└─────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────┐
│                  Quality Gate                        │
│    (カバレッジ閾値、Lint警告ゼロ、型エラーゼロ)      │
└─────────────────────────────────────────────────────┘
                        │
                        ▼ (mainブランチのみ)
┌─────────────────────────────────────────────────────┐
│                    Deploy                            │
│             (Staging / Production)                   │
└─────────────────────────────────────────────────────┘
```

## ジョブ依存関係設計

### 厳格な依存関係

すべてのチェックが成功した場合のみ次へ進む。

```yaml
jobs:
  lint:
    runs-on: ubuntu-latest
    steps: [...]

  type-check:
    runs-on: ubuntu-latest
    steps: [...]

  build:
    needs: [lint, type-check]     # 両方成功後
    runs-on: ubuntu-latest
    steps: [...]

  test:
    needs: build
    runs-on: ubuntu-latest
    steps: [...]

  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps: [...]
```

### 柔軟な依存関係

一部の失敗を許容しつつ、クリティカルなチェックは必須。

```yaml
jobs:
  lint:
    runs-on: ubuntu-latest
    continue-on-error: true       # 失敗しても続行
    steps: [...]

  type-check:
    runs-on: ubuntu-latest
    steps: [...]                  # 失敗したら停止

  test:
    needs: [lint, type-check]
    if: always() && needs.type-check.result == 'success'
    runs-on: ubuntu-latest
    steps: [...]
```

## ステージ設計ガイドライン

### Build Stage

**目的**: デプロイ可能な成果物を生成

**含めるべき処理**:
- 依存関係インストール
- TypeScriptコンパイル
- アセットバンドル
- 成果物アーティファクト化

**成功基準**:
- コンパイルエラーゼロ
- 成果物が生成される

### Test Stage

**目的**: コードの正確性を検証

**含めるべき処理**:
- ユニットテスト
- 統合テスト
- カバレッジ計測

**成功基準**:
- 全テストパス
- カバレッジ閾値達成

### Quality Gate Stage

**目的**: 品質基準の強制

**含めるべきチェック**:
- Lintエラーゼロ
- 型エラーゼロ
- カバレッジ閾値（例: 80%）
- セキュリティ脆弱性ゼロ

**成功基準**:
- すべてのチェックがパス

### Deploy Stage

**目的**: 環境へのデプロイ

**含めるべき処理**:
- 環境変数設定
- デプロイ実行
- ヘルスチェック
- 通知

**成功基準**:
- デプロイ成功
- ヘルスチェックパス

## アンチパターン

### 1. 巨大な単一ジョブ

❌ **避けるべき**:
```yaml
jobs:
  all-in-one:
    steps:
      - run: npm install
      - run: npm run lint
      - run: npm run type-check
      - run: npm run build
      - run: npm run test
      - run: npm run deploy
```

✅ **推奨**:
```yaml
jobs:
  lint:
    steps: [...]
  build:
    needs: lint
    steps: [...]
  test:
    needs: build
    steps: [...]
```

### 2. 依存関係の欠如

❌ **避けるべき**:
```yaml
jobs:
  build: [...]
  test: [...]   # buildを待たずに実行される
  deploy: [...] # testを待たずに実行される
```

✅ **推奨**:
```yaml
jobs:
  build: [...]
  test:
    needs: build
  deploy:
    needs: test
```

### 3. 過度な直列化

❌ **避けるべき**:
```yaml
jobs:
  lint:
    steps: [...]
  type-check:
    needs: lint     # 不要な依存
    steps: [...]
```

✅ **推奨**:
```yaml
jobs:
  lint:
    steps: [...]
  type-check:       # 並列実行
    steps: [...]
```

## 実践的なワークフロー例

### PRワークフロー

```yaml
name: PR Check

on:
  pull_request:
    branches: [main]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint

  type-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm type-check

  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm build

  test:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm test
```

### デプロイワークフロー

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Notify Start
        run: |
          curl -X POST "${{ secrets.DISCORD_WEBHOOK_URL }}" \
            -H "Content-Type: application/json" \
            -d '{"embeds":[{"title":"Deploy Started","color":3447003}]}'

      - name: Wait for Railway
        run: sleep 10

      - name: Notify Success
        if: success()
        run: |
          curl -X POST "${{ secrets.DISCORD_WEBHOOK_URL }}" \
            -H "Content-Type: application/json" \
            -d '{"embeds":[{"title":"Deploy Success","color":3066993}]}'

      - name: Notify Failure
        if: failure()
        run: |
          curl -X POST "${{ secrets.DISCORD_WEBHOOK_URL }}" \
            -H "Content-Type: application/json" \
            -d '{"embeds":[{"title":"Deploy Failed","color":15158332}]}'
```
