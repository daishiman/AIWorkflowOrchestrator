# ホイスティング制御

## 概要

ホイスティングは、依存関係をディレクトリ階層の上位に配置する最適化手法です。
pnpmではデフォルトでホイスティングを制限し、厳格な依存関係管理を提供します。

## pnpmのホイスティング動作

### デフォルト動作

pnpmはシンボリックリンクベースのnode_modules構造を使用し、
明示的に宣言された依存関係のみがアクセス可能です。

```
node_modules/
├── .pnpm/                    # 実際のパッケージ
│   ├── lodash@4.17.21/
│   │   └── node_modules/
│   │       └── lodash/
│   └── express@4.18.2/
│       └── node_modules/
│           ├── express/
│           └── body-parser -> ../../../body-parser@1.20.2/node_modules/body-parser
├── lodash -> .pnpm/lodash@4.17.21/node_modules/lodash
└── express -> .pnpm/express@4.18.2/node_modules/express
```

### shamefully-hoist

**注意**: 一般的には推奨されません。

```ini
# .npmrc
shamefully-hoist=true
```

これを有効にすると、すべての依存関係がルートnode_modulesにフラット化されます。
pnpm/yarnとの互換性が必要な場合にのみ使用します。

## パブリックホイスティング

### 特定パッケージのホイスト

```ini
# .npmrc
# ESLintプラグインをホイスト
public-hoist-pattern[]=*eslint*
public-hoist-pattern[]=*prettier*

# 型定義をホイスト
public-hoist-pattern[]=@types/*

# 特定のパッケージをホイスト
public-hoist-pattern[]=webpack
public-hoist-pattern[]=babel-*
```

### ホイスティングが必要なケース

1. **ESLint/Prettier**: 設定ファイルがルートにある場合
2. **型定義**: グローバルな型参照が必要な場合
3. **ビルドツール**: 特定のツールが依存を探索する場合
4. **レガシーパッケージ**: pnpmの厳格モードに対応していない場合

## ホイスティング問題の診断

### 問題の症状

```
Error: Cannot find module 'some-package'
```

### 診断手順

```bash
# パッケージの配置を確認
pnpm why some-package

# node_modules構造を確認
ls -la node_modules/
ls -la node_modules/.pnpm/

# パッケージの解決パスを確認
node -e "console.log(require.resolve('some-package'))"
```

### 解決策

#### 方法1: 明示的な依存追加

```json
// package.json
{
  "dependencies": {
    "some-package": "^1.0.0"
  }
}
```

#### 方法2: パブリックホイスト

```ini
# .npmrc
public-hoist-pattern[]=some-package
```

#### 方法3: 依存パッケージの修正要求

パッケージが正しく依存を宣言していない場合、
Issue/PRで修正を要求することを検討します。

## ワークスペース内のホイスティング

### 内部依存のリンク

```ini
# .npmrc
link-workspace-packages=true
```

これにより、ワークスペース内のパッケージは自動的にシンボリックリンクされます。

### 構造例

```
monorepo/
├── node_modules/
│   ├── @app/core -> ../packages/core
│   ├── @app/utils -> ../packages/utils
│   └── .pnpm/
├── packages/
│   ├── core/
│   │   ├── package.json
│   │   └── node_modules/
│   │       └── zod -> ../../node_modules/.pnpm/zod@3.22.0/node_modules/zod
│   └── utils/
│       └── package.json
└── apps/
    └── web/
        ├── package.json
        └── node_modules/
            ├── @app/core -> ../../../packages/core
            └── @app/utils -> ../../../packages/utils
```

## ホイスティング戦略

### 推奨設定

```ini
# .npmrc

# デフォルト: 厳格モード
shamefully-hoist=false

# 必要なパッケージのみホイスト
public-hoist-pattern[]=*eslint*
public-hoist-pattern[]=*prettier*
public-hoist-pattern[]=@types/*

# ワークスペースリンクを有効化
link-workspace-packages=true

# ピア依存を自動インストール
auto-install-peers=true
```

### プロジェクトタイプ別の設定

#### ライブラリプロジェクト

```ini
# 厳格モード推奨
shamefully-hoist=false
public-hoist-pattern[]=@types/*
```

#### アプリケーションプロジェクト

```ini
# 必要に応じて緩和
shamefully-hoist=false
public-hoist-pattern[]=*eslint*
public-hoist-pattern[]=*prettier*
public-hoist-pattern[]=@types/*
public-hoist-pattern[]=webpack*
```

#### レガシーマイグレーション

```ini
# 段階的に厳格化
shamefully-hoist=true  # 最初は緩く
# 徐々に false に移行
```

## トラブルシューティング

### 問題1: ESLintが動作しない

**症状**:
```
Cannot find module 'eslint-plugin-xxx'
```

**解決策**:
```ini
# .npmrc
public-hoist-pattern[]=eslint*
public-hoist-pattern[]=@typescript-eslint/*
```

### 問題2: TypeScriptの型解決エラー

**症状**:
```
Cannot find type definition file for 'xxx'
```

**解決策**:
```ini
# .npmrc
public-hoist-pattern[]=@types/*
```

### 問題3: ビルドツールが依存を見つけられない

**症状**:
```
Module not found: Can't resolve 'xxx'
```

**解決策**:
```bash
# 依存を明示的に追加
pnpm add xxx

# またはホイスト
# .npmrc
public-hoist-pattern[]=xxx
```

## チェックリスト

### 設定時
- [ ] デフォルトで厳格モード(shamefully-hoist=false)を使用しているか？
- [ ] 必要最小限のパッケージのみホイストしているか？
- [ ] ホイストの理由を文書化しているか？

### 問題発生時
- [ ] pnpm whyで依存を確認したか？
- [ ] node_modules構造を確認したか？
- [ ] 明示的な依存追加で解決できないか確認したか？
- [ ] パブリックホイストは最後の手段として検討したか？
