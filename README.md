# AIWorkflowOrchestrator

AI開発ワークフロー管理システム

## 前提条件

- Node.js 20.x 以上
- pnpm 9.x 以上

## セットアップ

```bash
# リポジトリをクローン
git clone https://github.com/your-org/AIWorkflowOrchestrator.git
cd AIWorkflowOrchestrator

# 依存関係をインストール
pnpm install
```

## ローカル開発

### デスクトップアプリ (Electron)

```bash
# 開発サーバー起動（ホットリロード対応）
pnpm --filter @repo/desktop dev

# ビルド
pnpm --filter @repo/desktop build

# パッケージング（配布用）
pnpm --filter @repo/desktop package:mac   # macOS
pnpm --filter @repo/desktop package:win   # Windows
```

### バックエンドAPI (Next.js)

```bash
# 開発サーバー起動
pnpm --filter @repo/web dev

# ビルド
pnpm --filter @repo/web build

# 本番モードで起動
pnpm --filter @repo/web start
```

### 共有ライブラリ

```bash
# ビルド
pnpm --filter @repo/shared build

# テスト
pnpm --filter @repo/shared test
```

## テスト

```bash
# 全パッケージのテスト実行
pnpm test

# デスクトップアプリのテスト
pnpm --filter @repo/desktop test:run

# カバレッジ付きテスト
pnpm --filter @repo/desktop test:coverage

# 特定のテストファイルを実行
pnpm --filter @repo/desktop test:run src/renderer/components/atoms/Button/Button.test.tsx
```

## 型チェック・Lint

```bash
# TypeScript型チェック
pnpm --filter @repo/desktop exec tsc --noEmit

# ESLint
pnpm lint

# Prettier
pnpm format
```

## プロジェクト構成

```
AIWorkflowOrchestrator/
├── apps/
│   ├── desktop/          # Electronデスクトップアプリ
│   │   ├── src/
│   │   │   ├── main/     # Main Process
│   │   │   ├── preload/  # Preload Scripts
│   │   │   └── renderer/ # React UI
│   │   └── out/          # ビルド出力
│   └── web/              # Next.js Webアプリ
├── packages/
│   └── shared/           # 共有ライブラリ
├── docs/                 # ドキュメント
└── local-agent/          # ローカルファイル監視エージェント
```

## 環境変数

### デスクトップアプリ

`.env`ファイルを`apps/desktop/`に作成:

```env
# AI API設定（オプション）
OPENAI_API_KEY=your-api-key
ANTHROPIC_API_KEY=your-api-key
```

### バックエンドAPI

`.env.local`ファイルを`apps/web/`に作成:

```env
# データベース
DATABASE_URL=postgresql://user:password@localhost:5432/aiworkflow

# 認証
NEXTAUTH_SECRET=your-secret
NEXTAUTH_URL=http://localhost:3000

# Discord OAuth（オプション）
DISCORD_CLIENT_ID=your-client-id
DISCORD_CLIENT_SECRET=your-client-secret
```

## ブランチ戦略

- `main`: 本番環境用ブランチ
- `develop`: 開発統合用ブランチ
- `feature/*`: 機能開発用ブランチ

## 開発フロー

1. `develop`ブランチから`feature/*`ブランチを作成
2. 機能開発を実施
3. `develop`ブランチにマージ
4. テスト完了後、`main`ブランチにマージ

## トラブルシューティング

### Electronアプリが起動しない

```bash
# node_modulesを再インストール
rm -rf node_modules apps/desktop/node_modules
pnpm install

# Electronキャッシュをクリア
rm -rf ~/Library/Application\ Support/ai-workflow-orchestrator
```

### テストがタイムアウトする

```bash
# 単一ファイルで実行して問題を特定
pnpm --filter @repo/desktop test:run src/path/to/specific.test.ts
```

### ビルドエラー

```bash
# 共有ライブラリを先にビルド
pnpm --filter @repo/shared build

# その後デスクトップアプリをビルド
pnpm --filter @repo/desktop build
```

## ライセンス

MIT
