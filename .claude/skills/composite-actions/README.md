# Composite Actions Skill

GitHub Actions Composite Actionsの作成と活用のためのスキル。

## 📁 構成

```
composite-actions/
├── SKILL.md                          # メインスキル定義（266行）
├── README.md                         # このファイル
├── resources/
│   ├── action-syntax.md              # action.yml構文の詳細リファレンス
│   └── best-practices.md             # 設計原則、パフォーマンス、セキュリティ
├── templates/
│   └── composite-action/
│       └── action.yml                # 完全なComposite Actionテンプレート
└── scripts/
    └── validate-action.mjs           # action.yml検証スクリプト
```

## 🎯 使用タイミング

このスキルは以下の場合に使用します:

- 複数ステップを再利用可能なアクションとしてパッケージ化する時
- ワークフロー間で共通処理を標準化する時
- 組織全体でベストプラクティスを配布する時
- シェルスクリプトとGitHub Actionsステップを組み合わせる時
- カスタムアクションを軽量に作成する時（Dockerやnccビルド不要）

## 🚀 クイックスタート

### 1. スキル参照

```bash
cat .claude/skills/composite-actions/SKILL.md
```

### 2. テンプレートからアクション作成

```bash
# テンプレートをコピー
mkdir -p .github/actions/my-action
cp .claude/skills/composite-actions/templates/composite-action/action.yml \
   .github/actions/my-action/

# 編集
vim .github/actions/my-action/action.yml
```

### 3. アクション検証

```bash
node .claude/skills/composite-actions/scripts/validate-action.mjs \
     .github/actions/my-action/action.yml
```

### 4. ワークフローで使用

```yaml
# .github/workflows/ci.yml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: ./.github/actions/my-action
        with:
          environment: staging
```

## 📚 リソース

### SKILL.md（メイン）

- 基本的なaction.yml構文
- 入力と出力の設計
- シェルスクリプトの実行
- 環境変数とシークレットの扱い
- トラブルシューティング
- コマンドリファレンス

### resources/action-syntax.md

- action.yml完全構文リファレンス
- inputs/outputs詳細定義
- runs.steps構文
- 条件式と制御
- 環境変数管理
- エラーハンドリング
- 高度なパターン

### resources/best-practices.md

- 設計原則（単一責任、入力設計）
- コード品質（エラーハンドリング、ログ）
- パフォーマンス最適化
- セキュリティ（シークレット、入力検証）
- バージョニングと公開
- テストとデバッグ
- ドキュメンテーション

## 🔧 提供ツール

### validate-action.mjs

Composite Actionの検証ツール:

```bash
node .claude/skills/composite-actions/scripts/validate-action.mjs <path-to-action.yml>
```

**検証項目**:
- 必須フィールド（name, description, runs）
- Composite固有要件（using: 'composite', shell指定）
- ベストプラクティス（入力にデフォルト値、出力に説明）
- よくある間違い（shellの未指定、無効なステップ構文）

**出力例**:
```
🔍 Validating Composite Action
📄 File: .github/actions/my-action/action.yml

💡 Suggestions:
  • Action name: "My Action"
  • Consider adding an 'id' to Step 2 (Build)
  • No branding defined

✅ Validation successful
```

## 🔗 関連スキル

| スキル | 用途 |
|--------|------|
| **github-actions-syntax** | 基本構文とワークフロー構造 |
| **github-actions-expressions** | 式と関数の使用 |
| **reusable-workflows** | ジョブレベルの再利用 |
| **workflow-templates** | 組織全体のテンプレート |

## 📝 例

### 基本的なComposite Action

```yaml
name: 'Setup Node with Cache'
description: 'Node.jsのセットアップとnpmキャッシュの設定'

inputs:
  node-version:
    description: 'Node.jsのバージョン'
    required: false
    default: '18'

outputs:
  cache-hit:
    value: ${{ steps.cache.outputs.cache-hit }}

runs:
  using: 'composite'
  steps:
    - uses: actions/setup-node@v4
      with:
        node-version: ${{ inputs.node-version }}

    - id: cache
      uses: actions/cache@v4
      with:
        path: node_modules
        key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
      shell: bash
```

### 使用例

```yaml
- uses: ./.github/actions/setup-node-cache
  with:
    node-version: '20'
```

## ⚠️ 重要な注意点

1. **shell は必須**: すべての `run` ステップに `shell` を指定
2. **シークレット**: Composite Actionsは直接シークレットにアクセスできない（環境変数で渡す）
3. **出力設定**: `$GITHUB_OUTPUT` を使用してステップ出力を設定
4. **エラーハンドリング**: `set -e` でエラー時に停止

## 📖 詳細ドキュメント

- [SKILL.md](./SKILL.md) - メインスキル定義
- [resources/action-syntax.md](./resources/action-syntax.md) - 構文リファレンス
- [resources/best-practices.md](./resources/best-practices.md) - ベストプラクティス
- [templates/composite-action/action.yml](./templates/composite-action/action.yml) - テンプレート

## 🆚 Composite Action vs Reusable Workflow

| 特徴 | Composite Action | Reusable Workflow |
|------|------------------|-------------------|
| 粒度 | ステップレベル | ジョブレベル |
| 軽量性 | ✅ 非常に軽量 | ⚠️ やや重い |
| ビルド | ❌ 不要 | ❌ 不要 |
| シークレット | ⚠️ 環境変数経由 | ✅ 直接アクセス |
| Matrix | ❌ 使用不可 | ✅ 使用可能 |
| 用途 | 複数ステップの再利用 | ジョブ全体の再利用 |

## 📄 ライセンス

このスキルはプロジェクトのライセンスに従います。
