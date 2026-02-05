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
- **auto-create-issue.sh**: タスク仕様書からGitHub Issue自動作成

### セキュリティ（PreToolUse）

- **security-check.sh**: 機密ファイルへのアクセス防止
- **dangerous-command-check.sh**: 危険コマンドの警告

### 通知（Stop）

- **notify-completion.sh**: 処理完了時の音声・デスクトップ通知
- **requirements-sync.sh**: 要件仕様の同期

### セッション（SessionStart）

- **session-init.sh**: セッション開始時の環境確認

### フック制御用環境変数

重いフックをスキップしたい場合は、以下の環境変数を設定してください：

```bash
# 重いフック（type-check, auto-test）をスキップ
export CLAUDE_SKIP_HEAVY_HOOKS=1

# 個別にスキップ
export CLAUDE_SKIP_FORMAT=1      # Prettierをスキップ
export CLAUDE_SKIP_LINT=1        # ESLintをスキップ
export CLAUDE_SKIP_ISSUE_SYNC=1  # Issue同期をスキップ

# タイムアウト調整（秒、デフォルト値）
export CLAUDE_FORMAT_TIMEOUT=20      # Prettier
export CLAUDE_LINT_TIMEOUT=30        # ESLint
export CLAUDE_TYPECHECK_TIMEOUT=60   # TypeScript型チェック
export CLAUDE_TEST_TIMEOUT=120       # Vitest/Jest
export CLAUDE_ISSUE_TIMEOUT=45       # GitHub Issue同期
```

## 開発ガイドライン

1. **コミット前**: 必ず `pnpm lint` と `pnpm typecheck` を実行
2. **テスト**: 新機能には対応するテストを追加
3. **型安全**: any型の使用を避け、厳密な型定義を維持
4. **コンポーネント**: Atomic Design原則に従う

## Git操作の禁止事項

### 🚫 絶対禁止: `--no-verify` オプション

以下のコマンドは**絶対に使用禁止**です：

```bash
# 禁止コマンド（絶対に使用しないこと）
git commit --no-verify
git push --no-verify
git commit -n  # --no-verify の短縮形
```

**理由**:

- pre-commitフック（lint-staged）とpre-pushフック（全テスト実行）をスキップすると、
  CIで初めてエラーが検出され、修正に余計な時間がかかる
- チーム全体の開発効率を下げる原因になる

**テストが失敗する場合の対処**:

1. テストを修正する（正しい対処）
2. 一時的にテストをスキップする場合は `.skip` を使用し、Issue/TODO を作成する

**例外はありません。どのような理由があっても `--no-verify` は使用禁止です。**
