---
name: .claude/skills/github-actions-syntax/SKILL.md
description: |
    GitHub Actions ワークフロー構文の完全リファレンス。
    専門分野:
    - ワークフロー構文: YAML構造、イベントトリガー、ジョブ・ステップ定義
    - トリガー設計: push/pull_request/schedule/workflow_dispatch/workflow_call
    - 権限管理: permissions設定、最小権限の原則
    - 実行制御: concurrency、条件分岐、デフォルト設定
    使用タイミング:
    - ワークフローファイル(.github/workflows/*.yml)を作成・編集する時
    - イベントトリガーを設定する時
    - ジョブやステップの構文エラーを解決する時
    - パーミッション、環境変数、条件分岐を設定する時

  📚 リソース参照:
  このスキルには以下のリソースが含まれています。
  必要に応じて該当するリソースを参照してください:

  - `.claude/skills/github-actions-syntax/resources/event-triggers.md`: push/pull_request/schedule/workflow_dispatch等のイベントトリガー詳細
  - `.claude/skills/github-actions-syntax/resources/jobs-and-steps.md`: ジョブ・ステップ定義とランナー環境選択ガイド
  - `.claude/skills/github-actions-syntax/resources/permissions-and-env.md`: permissions設定と環境変数管理の詳細
  - `.claude/skills/github-actions-syntax/resources/workflow-syntax-reference.md`: GitHub Actions YAML構文完全リファレンス
  - `.claude/skills/github-actions-syntax/templates/workflow-template.yaml`: 基本CI/CDワークフローテンプレート
  - `.claude/skills/github-actions-syntax/scripts/validate-workflow.mjs`: ワークフロー構文検証スクリプト

  Use proactively when implementing .claude/skills/github-actions-syntax/SKILL.md patterns or solving related problems.
version: 1.0.0
---

# GitHub Actions Workflow Syntax

## 概要

このスキルは、GitHub Actions ワークフローファイルの YAML 構文を体系的に提供します。
ワークフローの基本構造からイベントトリガー、ジョブ・ステップ定義、権限管理まで網羅します。

**主要な価値**:

- ワークフロー構文の正確な理解と適用
- トリガー設計による効率的な CI/CD
- 最小権限の原則に基づくセキュアな設定

## リソース構造

```
github-actions-syntax/
├── SKILL.md                                    # 本ファイル（概要とワークフロー）
├── resources/
│   ├── workflow-syntax-reference.md            # 完全な構文リファレンス
│   ├── event-triggers.md                       # イベントトリガー詳細
│   ├── jobs-and-steps.md                       # ジョブ・ステップ定義詳細
│   └── permissions-and-env.md                  # 権限・環境変数詳細
├── templates/
│   └── workflow-template.yaml                  # CI/CDワークフローテンプレート
└── scripts/
    └── validate-workflow.mjs                   # ワークフロー構文検証スクリプト
```

## コマンドリファレンス

### リソース読み取り

```bash
# 完全な構文リファレンス
cat .claude/skills/github-actions-syntax/resources/workflow-syntax-reference.md

# イベントトリガー詳細
cat .claude/skills/github-actions-syntax/resources/event-triggers.md

# ジョブ・ステップ定義
cat .claude/skills/github-actions-syntax/resources/jobs-and-steps.md

# 権限・環境変数
cat .claude/skills/github-actions-syntax/resources/permissions-and-env.md
```

### テンプレート参照

```bash
# CI/CDワークフローテンプレート
cat .claude/skills/github-actions-syntax/templates/workflow-template.yaml
```

### スクリプト実行

```bash
# ワークフロー構文検証
node .claude/skills/github-actions-syntax/scripts/validate-workflow.mjs <workflow-file.yml>
```

## クイックリファレンス

### 基本テンプレート

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

permissions:
  contents: read

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: pnpm test
```

### 主要なイベントトリガー

| イベント            | 説明                       | 主な用途               |
| ------------------- | -------------------------- | ---------------------- |
| `push`              | コミットのプッシュ         | CI/CD、テスト実行      |
| `pull_request`      | PR 作成・更新              | コードレビュー、テスト |
| `workflow_dispatch` | 手動トリガー               | オンデマンド実行       |
| `schedule`          | cron スケジュール          | 定期実行               |
| `workflow_call`     | 他ワークフローから呼び出し | 再利用可能ワークフロー |

### 主要なパーミッション

| スコープ        | 説明                         |
| --------------- | ---------------------------- |
| `contents`      | リポジトリコンテンツ読み書き |
| `pull-requests` | PR 操作                      |
| `packages`      | GitHub Packages 公開         |
| `deployments`   | デプロイ管理                 |
| `issues`        | Issue 操作                   |

## ワークフロー

### Phase 1: 構造設計

1. イベントトリガーの決定
2. ジョブ構成の設計
3. 依存関係（needs）の定義

**リソース**: `resources/event-triggers.md`

### Phase 2: ジョブ・ステップ定義

1. ランナー環境の選択
2. ステップの定義（uses/run）
3. 環境変数の設定

**リソース**: `resources/jobs-and-steps.md`

### Phase 3: 権限・セキュリティ設定

1. パーミッションの設定
2. シークレットの参照
3. 同時実行制御

**リソース**: `resources/permissions-and-env.md`

## 判断基準

### ワークフロー作成時

- [ ] 必要最小限のパーミッションが設定されているか？
- [ ] 適切なイベントトリガーが設定されているか？
- [ ] ジョブの依存関係が正しく定義されているか？
- [ ] タイムアウトが設定されているか？

### レビュー時

- [ ] 構文エラーがないか？
- [ ] 権限が過剰ではないか？
- [ ] シークレットが適切に使用されているか？
- [ ] 同時実行制御が必要か？

## 関連スキル

- **.claude/skills/github-actions-expressions/SKILL.md** (`.claude/skills/github-actions-expressions/SKILL.md`): 式と関数
- **.claude/skills/github-actions-debugging/SKILL.md** (`.claude/skills/github-actions-debugging/SKILL.md`): デバッグ手法
- **.claude/skills/reusable-workflows/SKILL.md** (`.claude/skills/reusable-workflows/SKILL.md`): 再利用可能ワークフロー
- **.claude/skills/matrix-builds/SKILL.md** (`.claude/skills/matrix-builds/SKILL.md`): マトリックス戦略
- **.claude/skills/workflow-security/SKILL.md** (`.claude/skills/workflow-security/SKILL.md`): セキュリティベストプラクティス
- **.claude/skills/caching-strategies-gha/SKILL.md** (`.claude/skills/caching-strategies-gha/SKILL.md`): キャッシュ戦略

## 変更履歴

| バージョン | 日付       | 変更内容 |
| ---------- | ---------- | -------- |
| 1.0.0      | 2025-11-27 | 初版作成 |
