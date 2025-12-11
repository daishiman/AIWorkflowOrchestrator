---
name: artifact-management-gha
description: |
  ---
  📚 リソース参照:
  このスキルには以下のリソースが含まれています。
  必要に応じて該当するリソースを参照してください:

  - `.claude/skills/artifact-management-gha/resources/download-artifact.md`: Download Artifact 詳細
  - `.claude/skills/artifact-management-gha/resources/retention-optimization.md`: 保持期間とストレージ最適化
  - `.claude/skills/artifact-management-gha/resources/upload-artifact.md`: Upload Artifact 詳細
  - `.claude/skills/artifact-management-gha/templates/artifact-workflow.yaml`: GitHub Actions Artifact Management ワークフロー例
  - `.claude/skills/artifact-management-gha/scripts/cleanup-artifacts.mjs`: GitHub Actions Artifact Cleanup Script

  専門分野:
  - (要追加)

  使用タイミング:
  - (要追加)

  Use proactively when (要追加).
version: 1.0.0
---

# Artifact Management (GitHub Actions)

---

name: artifact-management-gha
description: |
GitHub Actionsのアーティファクト管理スキル。
ビルド成果物のアップロード・ダウンロード、ジョブ間/ワークフロー間でのデータ共有、
保持期間設定、パス指定パターン、クリーンアップ戦略を提供。

使用タイミング:

- ビルド成果物（dist/, build/, \*.jar）をワークフローで共有する時
- actions/upload-artifact、actions/download-artifactの構文を確認する時
- アーティファクトの保持期間やストレージ最適化が必要な時

version: 1.0.0
skill_type: knowledge
tags: [github-actions, artifacts, build, deployment, workflow]
related_skills:

- ../github-actions-syntax/SKILL.md
- ../deployment-environments-gha/SKILL.md
- ../caching-strategies-gha/SKILL.md
  dependencies: []

---

## 概要

GitHub Actionsのアーティファクト管理に関する知識を提供するスキルです。
ビルド成果物の保存、ジョブ間共有、ワークフロー間アクセス、保持期間設定、ストレージ最適化を扱います。

## リソース構造

```
artifact-management-gha/
├── SKILL.md                          # 本ファイル（概要、コマンド参照）
├── resources/
│   ├── upload-artifact.md            # actions/upload-artifact詳細（309行）
│   ├── download-artifact.md          # actions/download-artifact詳細（405行）
│   └── retention-optimization.md     # 保持期間とストレージ最適化（288行）
├── templates/
│   └── artifact-workflow.yaml        # アーティファクト活用ワークフロー例
└── scripts/
    └── cleanup-artifacts.mjs         # アーティファクトクリーンアップスクリプト
```

## コマンドリファレンス

### リソース読み取り

```bash
# アップロード構文詳細
cat .claude/skills/artifact-management-gha/resources/upload-artifact.md

# ダウンロード構文詳細
cat .claude/skills/artifact-management-gha/resources/download-artifact.md

# 保持期間とストレージ最適化
cat .claude/skills/artifact-management-gha/resources/retention-optimization.md
```

### テンプレート・スクリプト

```bash
# ワークフロー例
cat .claude/skills/artifact-management-gha/templates/artifact-workflow.yaml

# クリーンアップスクリプト実行
node .claude/skills/artifact-management-gha/scripts/cleanup-artifacts.mjs <owner> <repo>
```

## いつ使うか

### シナリオ1: ビルド成果物の保存

**トリガー**: ビルドしたdist/, build/, \*.jarを後続ジョブで使用
**アクション**: upload-artifactでビルド成果物を保存
**成果**: 各ジョブでビルドを繰り返さず、成果物を再利用

### シナリオ2: クロスジョブデータ共有

**トリガー**: テストジョブでビルドジョブの成果物が必要
**アクション**: download-artifactで依存ジョブの成果物を取得
**成果**: 効率的なジョブ分離と並列実行

### シナリオ3: ストレージ最適化

**トリガー**: アーティファクトストレージコストが増大
**アクション**: 保持期間短縮、不要ファイル除外、クリーンアップ自動化
**成果**: ストレージコスト削減と管理効率化

## 基本パターン

### アップロード

```yaml
- uses: actions/upload-artifact@v4
  with:
    name: build-output
    path: dist/
    retention-days: 7
    if-no-files-found: error
```

### ダウンロード

```yaml
- uses: actions/download-artifact@v4
  with:
    name: build-output
    path: ./dist
```

### パターンマッチング

```yaml
path: |
  **/*.js
  **/*.css
  !node_modules/**
```

## 主要オプション

| オプション          | 説明                       | 推奨値                            |
| ------------------- | -------------------------- | --------------------------------- |
| `retention-days`    | 保持期間（1-90日）         | CI: 7-14日、リリース: 30-90日     |
| `if-no-files-found` | ファイル未発見時           | 必須: `error`, オプション: `warn` |
| `compression-level` | 圧縮レベル（0-9）          | デフォルト: 6, テキスト: 9        |
| `pattern`           | ダウンロード時のパターン   | `build-*`                         |
| `merge-multiple`    | 複数アーティファクトマージ | `true`/`false`                    |

## ワークフロー例

### ビルド→テスト→デプロイ

```yaml
jobs:
  build:
    steps:
      - run: pnpm run build
      - uses: actions/upload-artifact@v4
        with:
          name: dist
          path: dist/

  test:
    needs: build
    steps:
      - uses: actions/download-artifact@v4
        with:
          name: dist
      - run: pnpm test

  deploy:
    needs: test
    steps:
      - uses: actions/download-artifact@v4
        with:
          name: dist
      - run: ./deploy.sh
```

### マトリックスビルド

```yaml
strategy:
  matrix:
    os: [ubuntu, windows, macos]
steps:
  - uses: actions/upload-artifact@v4
    with:
      name: build-${{ matrix.os }}
      path: dist/
```

## ベストプラクティス

### すべきこと

- 明確なアーティファクト名（`build-v1.2.3`）
- 適切な保持期間設定（デフォルト90日は過剰）
- 不要ファイル除外（`!node_modules/**`）
- サイズの大きいアーティファクトは圧縮

### 避けるべきこと

- 不要ファイルアップロード（`node_modules/`, `.git/`）
- 過度に長い保持期間
- 曖昧な命名（`output`, `result`）

## リソースへの参照

詳細はリソースを参照：

- **upload-artifact.md**: パス指定、除外パターン、オプション詳細
- **download-artifact.md**: クロスワークフローアクセス、パターンマッチング
- **retention-optimization.md**: 保持期間戦略、コスト削減、自動クリーンアップ

## 関連スキル

| スキル名                        | パス                                                  | 使用タイミング     |
| ------------------------------- | ----------------------------------------------------- | ------------------ |
| **github-actions-syntax**       | `.claude/skills/github-actions-syntax/SKILL.md`       | YAML構文基本       |
| **deployment-environments-gha** | `.claude/skills/deployment-environments-gha/SKILL.md` | デプロイ時         |
| **caching-strategies-gha**      | `.claude/skills/caching-strategies-gha/SKILL.md`      | キャッシュ使い分け |

## メトリクス

- **ストレージ使用量**: リポジトリ設定 → Actions → Artifacts storage
- **アーティファクトサイズ**: ワークフローログで確認（推奨: 100MB以下）

## 変更履歴

- **1.0.0** (2025-01-27): 初版作成
