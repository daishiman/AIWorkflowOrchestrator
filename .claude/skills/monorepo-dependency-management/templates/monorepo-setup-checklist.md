# モノレポセットアップチェックリスト

## プロジェクト情報

| 項目 | 内容 |
|------|-----|
| プロジェクト名 | [プロジェクト名] |
| リポジトリURL | [URL] |
| 作成日 | [YYYY-MM-DD] |
| 担当者 | [担当者名] |
| パッケージマネージャー | pnpm |

## Phase 1: 基盤セットアップ

### 1.1 パッケージマネージャー設定

- [ ] pnpm がインストールされている（v9.x 推奨）
- [ ] `.npmrc` が設定されている
- [ ] `pnpm-workspace.yaml` が作成されている
- [ ] ルート `package.json` が設定されている

#### .npmrc 設定例

```ini
shamefully-hoist=false
public-hoist-pattern[]=*eslint*
public-hoist-pattern[]=*prettier*
public-hoist-pattern[]=@types/*
auto-install-peers=true
strict-peer-dependencies=false
link-workspace-packages=true
prefer-frozen-lockfile=true
```

#### pnpm-workspace.yaml 設定例

```yaml
packages:
  - 'packages/*'
  - 'apps/*'
  - 'tools/*'
```

### 1.2 ディレクトリ構造

- [ ] ディレクトリ構造が定義されている
- [ ] 各ディレクトリの役割が明確

```
monorepo/
├── packages/     # 共有ライブラリ
├── apps/         # アプリケーション
├── tools/        # 開発ツール
└── docs/         # ドキュメント
```

### 1.3 TypeScript設定

- [ ] ルート `tsconfig.json` が設定されている
- [ ] `tsconfig.base.json` が作成されている
- [ ] パスエイリアスが設定されている
- [ ] Project References が設定されている（オプション）

## Phase 2: パッケージ設定

### 2.1 パッケージ構造

各パッケージに以下が含まれているか確認:

- [ ] `package.json`
- [ ] `tsconfig.json`（TypeScriptプロジェクトの場合）
- [ ] `src/` ディレクトリ
- [ ] `README.md`

### 2.2 パッケージ命名

- [ ] スコープ付き名前を使用（例: `@app/core`）
- [ ] 命名規則が一貫している
- [ ] 役割が名前から明確

### 2.3 内部依存

- [ ] `workspace:*` プロトコルを使用
- [ ] 依存方向が適切（上位 → 下位のみ）
- [ ] 循環依存がない

```json
{
  "dependencies": {
    "@app/core": "workspace:*",
    "@app/utils": "workspace:^1.0.0"
  }
}
```

## Phase 3: バージョン同期

### 3.1 カタログ設定（pnpm 9.x）

- [ ] `pnpm-workspace.yaml` にカタログが定義されている
- [ ] 共通依存がカタログで管理されている
- [ ] パッケージで `catalog:` プロトコルを使用

```yaml
# pnpm-workspace.yaml
catalog:
  react: ^18.2.0
  typescript: ^5.3.0
  zod: ^3.22.0
```

### 3.2 バージョン同期チェック

- [ ] syncpack または同等ツールを設定
- [ ] CI でバージョン不整合をチェック
- [ ] 定期的な同期確認プロセスがある

## Phase 4: ビルドシステム

### 4.1 ビルドツール

- [ ] ビルドツールが選択されている（tsup/esbuild/tsc）
- [ ] 各パッケージにビルドスクリプトがある
- [ ] 出力形式が適切（CJS/ESM/両方）

### 4.2 ビルド順序

- [ ] 依存順にビルドされる
- [ ] `pnpm -r run build` で正常にビルドされる
- [ ] 並列ビルドが設定されている（オプション）

### 4.3 Turborepo統合（オプション）

- [ ] `turbo.json` が設定されている
- [ ] パイプラインが定義されている
- [ ] キャッシュが設定されている

## Phase 5: 開発ツール

### 5.1 リンティング

- [ ] ESLint がルートに設定されている
- [ ] 共有設定パッケージがある（オプション）
- [ ] 全パッケージで一貫したルール

### 5.2 フォーマット

- [ ] Prettier が設定されている
- [ ] `.prettierrc` がルートにある
- [ ] エディタ統合が設定されている

### 5.3 テスト

- [ ] テストフレームワークが選択されている（vitest推奨）
- [ ] 共有テスト設定がある
- [ ] 各パッケージでテストが実行可能

## Phase 6: CI/CD

### 6.1 基本CI

- [ ] GitHub Actions（または同等）が設定されている
- [ ] PRでテスト/リント/型チェックが実行される
- [ ] 変更検出が設定されている

### 6.2 効率化

- [ ] 影響を受けるパッケージのみビルド/テスト
- [ ] キャッシュが設定されている
- [ ] 並列ジョブが設定されている

### 6.3 デプロイ

- [ ] デプロイワークフローが定義されている
- [ ] 環境別設定がある
- [ ] ロールバック手順がある

## Phase 7: ドキュメント

### 7.1 プロジェクトドキュメント

- [ ] ルートREADME.md
- [ ] CONTRIBUTING.md
- [ ] パッケージ追加手順

### 7.2 アーキテクチャドキュメント

- [ ] 依存グラフの可視化
- [ ] パッケージ責務の説明
- [ ] 設計決定の記録

## 検証チェックリスト

### 基本動作確認

```bash
# インストール
pnpm install

# 全パッケージビルド
pnpm -r run build

# 全パッケージテスト
pnpm -r run test

# 型チェック
pnpm -r run typecheck

# リント
pnpm -r run lint
```

### 依存関係確認

```bash
# ワークスペース一覧
pnpm -r ls --depth 0

# 循環依存チェック
node .claude/skills/monorepo-dependency-management/scripts/analyze-workspace-deps.mjs --cycles

# 依存グラフ
node .claude/skills/monorepo-dependency-management/scripts/analyze-workspace-deps.mjs --graph
```

### 特定パッケージ操作

```bash
# 特定パッケージでコマンド実行
pnpm --filter @app/core run build

# 依存パッケージも含める
pnpm --filter @app/web... run build

# 変更されたパッケージのみ
pnpm --filter "[origin/main]" run test
```

## トラブルシューティング

### よくある問題

| 問題 | 解決策 |
|------|-------|
| パッケージが見つからない | `pnpm install` を再実行 |
| 型エラー | `pnpm -r run build` で依存をビルド |
| ESLintエラー | `.npmrc` でホイスティング設定を確認 |
| 循環依存 | 共通モジュールを抽出 |
| ビルド順序エラー | `pnpm -r run build`（依存順）を使用 |

### デバッグコマンド

```bash
# パッケージの依存を確認
pnpm why <package-name>

# node_modules構造を確認
ls -la node_modules/.pnpm/

# ロックファイルを再生成
rm pnpm-lock.yaml && pnpm install
```

## 承認

| 役割 | 名前 | 日付 | 署名 |
|------|-----|------|------|
| 設計者 | | | |
| レビュアー | | | |
| 承認者 | | | |

## 変更履歴

| 日付 | バージョン | 変更内容 | 担当者 |
|------|-----------|---------|-------|
| | 1.0.0 | 初版作成 | |
