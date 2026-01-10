---
name: ci-cd-pipelines
description: |
  GitHub Actionsを用いたCI/CDパイプラインの設計・実装・最適化を支援する。品質ゲート、並列化、キャッシング、デプロイ戦略、可観測性の判断を含む。Use when: GitHub Actionsワークフローの新規作成・改善、CI/CD自動化、品質ゲート設計、並列化やキャッシュ最適化が必要なとき。
  Anchors: Continuous Delivery, DevOps, GitHub Actions workflow architecture
  Trigger: ci/cd pipeline design, github actions workflow, quality gate, caching strategy, parallel jobs, deployment automation
---

# CI/CD Pipelines

## Quick Start

- 目的、対象リポジトリ、実行環境、デプロイ先、制約を確認する。
- `references/pipeline-patterns.md` からパイプラインパターンを選ぶ。
- `assets/` のテンプレートから開始し、必要に応じて再利用可能ワークフローに分割する。

## Workflow

1. 要件を整理し、トリガー、対象ブランチ、環境分離、品質基準を確定する。
2. ステージとジョブ依存関係を設計し、品質ゲートを定義する。
3. 並列化とキャッシュ戦略を設計し、コストと実行時間のトレードオフを判断する。
4. テンプレートを基にワークフローを実装し、必要な権限とシークレットを設定する。
5. `scripts/validate-workflow.mjs` で構文検証を行い、結果を記録する。
6. `scripts/log_usage.mjs` で改善フィードバックを残す。

## Agents

- `agents/pipeline-requirements.md` - 要件整理とトリガー定義のために使う。
- `agents/pipeline-design.md` - ステージ構成、品質ゲート、並列化設計のために使う。
- `agents/pipeline-implementation.md` - 実装手順とテンプレート適用のために使う。
- `agents/pipeline-validation.md` - 構文検証、品質チェック、改善提案のために使う。

## References

- `references/Level1_basics.md` - GitHub Actions基本構文を確認するときに読む。
- `references/Level2_intermediate.md` - 実務的なワークフロー設計パターンを確認するときに読む。
- `references/Level3_advanced.md` - 最適化や高度な構成が必要なときに読む。
- `references/Level4_expert.md` - カスタムアクションやスケーリングを検討するときに読む。
- `references/github-actions-syntax.md` - 構文やコンテキストを参照するときに読む。
- `references/pipeline-patterns.md` - パイプライン構成パターンを選ぶときに読む。
- `references/quality-gates.md` - 品質ゲートの設計基準を確認するときに読む。
- `references/parallelization.md` - マトリクスやジョブ分割を設計するときに読む。
- `references/caching-strategies.md` - キャッシュキー設計とサイズ管理を検討するときに読む。
- `references/requirements-index.md` - 要件整理の観点を確認するときに読む。

## Assets

- `assets/ci-workflow-template.yml` - CI用の標準テンプレートとして使う。
- `assets/deploy-workflow-template.yml` - CD/デプロイ用の標準テンプレートとして使う。
- `assets/reusable-workflow-template.yml` - 再利用可能ワークフローの雛形として使う。

## Scripts

- `scripts/validate-workflow.mjs` - ワークフロー構文を検証するときに使う。
- `scripts/log_usage.mjs` - 実行結果と改善点を記録するときに使う。
- `scripts/validate-skill.mjs` - スキル構造の簡易検証に使う。
