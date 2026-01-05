# AIWorkflowOrchestrator プロジェクト設定

## パッケージマネージャー

**必須**: このプロジェクトでは `pnpm` を使用してください。`npm` や `yarn` は使用しないでください。

```bash
# 正しい
pnpm install
pnpm add <package>
pnpm add -D <package>
pnpm run <script>
pnpm --filter <package> <command>

# 間違い（使用禁止）
npm install
yarn add
```

## 技術スタック

- **フレームワーク**: Next.js 15 (App Router)
- **言語**: TypeScript 5.x
- **デスクトップ**: Electron
- **パッケージマネージャー**: pnpm (monorepo構成)
- **テスト**: Vitest / Playwright
- **Linter/Formatter**: ESLint / Prettier
- **スタイリング**: Tailwind CSS

## モノレポ構成

```
apps/
  desktop/     # Electronデスクトップアプリ
  web/         # Next.js Webアプリ
packages/
  shared/      # 共有ライブラリ
  ui/          # UIコンポーネント
```

## コマンド例

```bash
# 全パッケージの依存関係インストール
pnpm install

# 特定パッケージへの依存関係追加
pnpm --filter @repo/desktop add <package>
pnpm --filter @repo/web add -D <package>

# ビルド
pnpm --filter @repo/desktop build
pnpm --filter @repo/shared build

# テスト
pnpm --filter @repo/desktop test
pnpm vitest run

# 開発サーバー
pnpm --filter @repo/web dev
pnpm --filter @repo/desktop dev
```

## Claude Code Hooks

このプロジェクトには以下のHooksが設定されています：

### 自動実行（PostToolUse - Edit/Write後）

- **auto-format.sh**: Prettierによる自動フォーマット
- **auto-lint.sh**: ESLintによる自動修正
- **type-check.sh**: TypeScript型チェック
- **auto-test.sh**: 関連テストの自動実行

### セキュリティ（PreToolUse）

- **security-check.sh**: 機密ファイルへのアクセス防止
- **dangerous-command-check.sh**: 危険コマンドの警告

### 通知（Stop）

- **notify-completion.sh**: 処理完了時の音声・デスクトップ通知

### セッション（SessionStart）

- **session-init.sh**: セッション開始時の環境確認

## 開発ガイドライン

1. **コミット前**: 必ず `pnpm lint` と `pnpm typecheck` を実行
2. **テスト**: 新機能には対応するテストを追加
3. **型安全**: any型の使用を避け、厳密な型定義を維持
4. **コンポーネント**: Atomic Design原則に従う
