---
name: composite-actions
description: |
  ---
  📚 リソース参照:
  このスキルには以下のリソースが含まれています。
  必要に応じて該当するリソースを参照してください:

  - `.claude/skills/composite-actions/resources/action-syntax.md`: Composite Action 構文リファレンス
  - `.claude/skills/composite-actions/resources/best-practices.md`: Composite Actions ベストプラクティス
  - `.claude/skills/composite-actions/scripts/validate-action.mjs`: Composite Action Validator

  専門分野:
  - (要追加)

  使用タイミング:
  - (要追加)

  Use proactively when (要追加).
version: 1.0.0
---

# Composite Actions

---

name: composite-actions
version: 1.0.0
description: |
Composite Actionsのスキル。

**使用タイミング**:

- 複数ステップを再利用可能なアクションとしてパッケージ化する時
- ワークフロー間で共通処理を標準化する時
- 組織全体でベストプラクティスを配布する時
- シェルスクリプトとGitHub Actionsステップを組み合わせる時
- カスタムアクションを軽量に作成する時（Dockerやnccビルド不要）
  dependencies:
- .claude/skills/github-actions-syntax/SKILL.md
- .claude/skills/github-actions-expressions/SKILL.md
  related_skills:
- .claude/skills/reusable-workflows/SKILL.md
- .claude/skills/workflow-templates/SKILL.md
  tags:
- github-actions
- composite-actions
- action-development

---

## 概要

Composite Actionsは、複数のワークフローステップを単一の再利用可能なアクションとしてパッケージ化する仕組みです。

**主な利点**: 再利用性、保守性、軽量（DockerやJavaScriptビルド不要）、柔軟性

**使い分け**:

- **Composite Action**: 複数ステップの再利用（軽量・柔軟）
- **Reusable Workflow**: ジョブ全体の再利用（ジョブレベル制御）
- **JavaScript Action**: 複雑なロジック（プログラマブル）
- **Docker Action**: カスタムランタイム（環境の完全制御）

---

## ディレクトリ構造

```
.github/actions/
├── setup-node-cache/action.yml
├── deploy-preview/action.yml
└── notify-slack/action.yml
```

---

## コマンドリファレンス

```bash
# 詳細構文リファレンス
cat .claude/skills/composite-actions/resources/action-syntax.md

# ベストプラクティス
cat .claude/skills/composite-actions/resources/best-practices.md

# テンプレート
cat .claude/skills/composite-actions/templates/composite-action/action.yml

# アクション検証
node .claude/skills/composite-actions/scripts/validate-action.mjs <action.yml>
```

---

## 基本的なaction.yml

```yaml
name: "Setup Node with Cache"
description: "Node.jsのセットアップとnpmキャッシュの設定"

inputs:
  node-version:
    description: "Node.jsのバージョン"
    required: true
    default: "18"

outputs:
  cache-hit:
    description: "キャッシュがヒットしたかどうか"
    value: ${{ steps.cache.outputs.cache-hit }}

runs:
  using: "composite"
  steps:
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: ${{ inputs.node-version }}

    - name: Cache dependencies
      id: cache
      uses: actions/cache@v4
      with:
        path: node_modules
        key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
      shell: bash
```

**ワークフローでの使用**:

```yaml
- uses: ./.github/actions/setup-node-cache
  with:
    node-version: "20"
```

---

## 入力と出力

### inputs定義

```yaml
inputs:
  environment:
    description: "デプロイ環境 (dev/staging/prod)"
    required: true

  dry-run:
    description: "dry-runモードで実行"
    required: false
    default: "false"
```

### outputs定義

```yaml
outputs:
  deployment-url:
    description: "デプロイされたアプリケーションのURL"
    value: ${{ steps.deploy.outputs.url }}
```

---

## シェルスクリプトの実行

### 基本

```yaml
runs:
  using: "composite"
  steps:
    - name: Run script
      run: echo "Processing ${{ inputs.file }}"
      shell: bash # 必須
```

### 複数行スクリプト

```yaml
steps:
  - name: Complex processing
    shell: bash
    run: |
      set -e
      if [ "${{ inputs.dry-run }}" = "true" ]; then
        echo "DRY RUN mode"
        exit 0
      fi
      .claude/skills/composite-actions/scripts/deploy.sh "${{ inputs.environment }}"
```

### 条件付き実行

```yaml
steps:
  - name: Production only
    if: inputs.environment == 'prod'
    run: .claude/skills/composite-actions/scripts/prod-checks.sh
    shell: bash
```

---

## 環境変数とシークレット

### 環境変数の設定

```yaml
steps:
  - name: Set environment
    shell: bash
    run: |
      echo "DEPLOY_ENV=${{ inputs.environment }}" >> $GITHUB_ENV
      echo "BUILD_ID=${{ github.run_id }}" >> $GITHUB_ENV

  - name: Use environment
    shell: bash
    run: echo "Deploying to $DEPLOY_ENV (build: $BUILD_ID)"
```

### シークレットの扱い

**注意**: Composite Actionsは直接シークレットにアクセスできません。ワークフローから環境変数として渡す必要があります。

```yaml
# ワークフロー側
- uses: ./.github/actions/deploy
  env:
    API_TOKEN: ${{ secrets.API_TOKEN }}

# action.yml側
steps:
  - shell: bash
    run: |
      if [ -z "$API_TOKEN" ]; then
        echo "API_TOKEN is required"
        exit 1
      fi
```

---

## トラブルシューティング

### shell プロパティが見つからない

```
Error: Required property is missing: shell
```

**解決**: すべての `run` ステップに `shell` を指定

```yaml
- run: echo "test"
  shell: bash # 必須
```

### outputsが空

**解決**: step idとoutputsを正しく設定

```yaml
steps:
  - id: compute
    run: echo "result=success" >> $GITHUB_OUTPUT
    shell: bash

outputs:
  result:
    value: ${{ steps.compute.outputs.result }}
```

---

## 関連スキル

| スキル                         | パス                                                 | 用途               |
| ------------------------------ | ---------------------------------------------------- | ------------------ |
| **github-actions-syntax**      | `.claude/skills/github-actions-syntax/SKILL.md`      | 基本構文           |
| **github-actions-expressions** | `.claude/skills/github-actions-expressions/SKILL.md` | 式と関数           |
| **reusable-workflows**         | `.claude/skills/reusable-workflows/SKILL.md`         | ジョブレベル再利用 |
| **workflow-templates**         | `.claude/skills/workflow-templates/SKILL.md`         | 組織テンプレート   |

---

## 詳細情報

詳細は以下のリソースを参照:

- **action.yml構文**: `cat .claude/skills/composite-actions/resources/action-syntax.md`
- **ベストプラクティス**: `cat .claude/skills/composite-actions/resources/best-practices.md`
- **テンプレート**: `cat .claude/skills/composite-actions/templates/composite-action/action.yml`
