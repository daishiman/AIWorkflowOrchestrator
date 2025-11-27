---
name: workflow-templates
description: |
  GitHub Actions ワークフローテンプレートの選択、カスタマイズ、生成スキル

  以下の場合に参照:
  - 新規プロジェクト用のワークフローテンプレートが必要な時
  - プロジェクトタイプ別（Node.js、Python、Docker等）のベストプラクティステンプレートを選択する時
  - 組織全体のワークフロー標準化やスターターワークフローを作成する時
  - CI/CDパイプラインの初期セットアップを効率化したい時
version: 1.0.0
dependencies: []
tags: [github-actions, templates, ci-cd, workflow-generation]
---

# Workflow Templates

GitHub Actions ワークフローテンプレートの設計、選択、カスタマイズのための知識スキル。

## 📁 ディレクトリ構造

```
workflow-templates/
├── SKILL.md                          # このファイル
├── resources/
│   ├── template-types.md             # テンプレートタイプ詳細
│   └── project-type-selection.md     # プロジェクト別選択ガイド
├── templates/
│   ├── ci-template.yaml              # 基本CIテンプレート
│   ├── cd-template.yaml              # 基本CDテンプレート
│   ├── nodejs-template.yaml          # Node.js専用
│   └── docker-template.yaml          # Docker専用
└── scripts/
    └── generate-workflow.mjs         # テンプレート生成スクリプト
```

## 🔧 コマンドリファレンス

### リソース参照

```bash
# テンプレートタイプの詳細
cat .claude/skills/workflow-templates/resources/template-types.md

# プロジェクトタイプ別選択ガイド
cat .claude/skills/workflow-templates/resources/project-type-selection.md
```

### テンプレート参照

```bash
# 基本CI/CDワークフロー
cat .claude/skills/workflow-templates/templates/ci-template.yaml
cat .claude/skills/workflow-templates/templates/cd-template.yaml

# 言語固有ワークフロー
cat .claude/skills/workflow-templates/templates/nodejs-template.yaml
cat .claude/skills/workflow-templates/templates/docker-template.yaml
```

### スクリプト実行

```bash
# ワークフロー生成
node .claude/skills/workflow-templates/scripts/generate-workflow.mjs <project-type> <output-path>

# 例: Node.jsプロジェクト用ワークフロー生成
node .claude/skills/workflow-templates/scripts/generate-workflow.mjs nodejs .github/workflows/
```

## 📊 テンプレート選択マトリックス

| プロジェクトタイプ | 推奨テンプレート | 主要機能 |
|-------------------|-----------------|---------|
| **Node.js** | `nodejs-template.yaml` | npm/pnpm/yarn、キャッシング、Lint/Test |
| **Python** | `ci-template.yaml` | pip/poetry、仮想環境、pytest |
| **Docker** | `docker-template.yaml` | ビルド最適化、レジストリプッシュ、スキャン |
| **Go/Rust** | `ci-template.yaml` | 言語ツールチェーン、テスト、ビルド |
| **汎用CI/CD** | `ci-template.yaml` / `cd-template.yaml` | 基本的なCI/CDフロー |

## 🎨 テンプレートタイプ概要

**1. 組織テンプレート**: `.github/workflow-templates/` に配置し、組織全体で標準化
**2. スターターワークフロー**: GitHub公式が提供するプロジェクトタイプ別テンプレート
**3. 再利用可能パターン**: Composite Actions / Reusable Workflows化

詳細は `resources/template-types.md` を参照。

## 🔍 プロジェクトタイプ別要点

**Node.js**: パッケージマネージャー自動検出 (npm/pnpm/yarn)、依存関係キャッシング
**Python**: 仮想環境管理 (pip/poetry)、依存関係キャッシング
**Docker**: マルチステージビルド、BuildKitキャッシュ、セキュリティスキャン

詳細は `resources/project-type-selection.md` を参照。

## 🚀 使用方法

### 基本フロー

```bash
# 1. プロジェクトタイプ識別
ls package.json Dockerfile requirements.txt go.mod 2>/dev/null

# 2. テンプレート選択（上記マトリックス参照）

# 3. テンプレートコピー＆カスタマイズ
cp .claude/skills/workflow-templates/templates/nodejs-template.yaml .github/workflows/ci.yaml

# 4. カスタマイズ（ブランチ名、Node.jsバージョン等）
# エディタで .github/workflows/ci.yaml を編集

# 5. コミット＆プッシュ
git add .github/workflows/ci.yaml
git commit -m "chore: add CI workflow"
git push
```

### カスタマイズ例

```yaml
# ブランチ戦略に合わせる
on:
  push:
    branches: [main, develop]  # プロジェクトに応じて変更

# バージョンマトリックスを調整
strategy:
  matrix:
    node-version: [18, 20]  # 必要なバージョンのみ
```

## 🔗 関連スキル

| スキル名 | パス | 関係性 |
|---------|------|--------|
| **github-actions-syntax** | `.claude/skills/github-actions-syntax/SKILL.md` | ワークフロー構文基礎 |
| **caching-strategies-gha** | `.claude/skills/caching-strategies-gha/SKILL.md` | キャッシング最適化 |
| **reusable-workflows** | `.claude/skills/reusable-workflows/SKILL.md` | テンプレート再利用化 |
| **composite-actions** | `.claude/skills/composite-actions/SKILL.md` | 共通処理のアクション化 |
| **matrix-builds** | `.claude/skills/matrix-builds/SKILL.md` | 複数環境対応 |

## 📝 ベストプラクティス

### テンプレート設計
- **汎用性**: 80%のプロジェクトに適用可能
- **カスタマイズ性**: 柔軟な調整ポイントを用意
- **ドキュメント**: コメントで使用方法を記載

### セキュリティ
- **シークレット管理**: 認証情報をハードコード禁止
- **権限最小化**: 必要最小限のパーミッション
- **依存関係固定**: アクションバージョンを固定

### 組織標準化
- **命名規則**: 一貫したファイル名・ジョブ名
- **バージョン管理**: テンプレートのバージョニング
- **更新プロセス**: 定期的なレビューサイクル

## 🎓 参考リソース

- [GitHub Actions公式テンプレート](https://github.com/actions/starter-workflows)
- [組織テンプレート作成ガイド](https://docs.github.com/en/actions/using-workflows/creating-starter-workflows-for-your-organization)
- [ワークフロー構文リファレンス](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)

---

**Note**: このスキルはテンプレート選択と初期構築に特化。詳細な構文や高度なカスタマイズは関連スキルを参照。
