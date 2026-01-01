---
name: parallel-jobs-gha
description: |
  GitHub Actionsの並列ジョブ実行とジョブ依存関係管理のスキル。needs構文による依存関係制御、outputs/artifacts/cacheを活用したデータ受け渡し、matrix戦略による並列度調整を提供する。

  Anchors:
  • The Pragmatic Programmer (Andrew Hunt, David Thomas) / 適用: CI/CDパイプラインの段階的改善 / 目的: 実行時間短縮とリソース効率化
  • GitHub Actions公式ドキュメント / 適用: needs構文、outputs、artifacts、cache / 目的: 並列ジョブの正確な実装

  Trigger:
  Use when implementing parallel job execution in GitHub Actions, managing job dependencies with needs syntax, or optimizing workflow performance through parallelization.
  Keywords: parallel jobs, GitHub Actions, needs, job dependencies, outputs, artifacts, cache, matrix strategy, workflow optimization
---

# GitHub Actions Parallel Jobs Skill

## 概要

GitHub Actionsの並列ジョブ実行とジョブ依存関係管理のスキル。

詳細な手順や背景は `references/Level1_basics.md` と `references/Level2_intermediate.md` を参照してください。

## Task仕様（agents/ ナビゲーション）

このスキルは3つのTaskに分割されています。各Taskは独立したワーカーとして実行され、メインコンテキストを汚しません。

### Task 1: Analysis（分析）

**ファイル**: [agents/analysis.md](agents/analysis.md)

**役割**: 並列化要件の分析と適用パターンの選定

**入力**:

- 現在のワークフロー定義（YAML）
- 並列化の目的・要件

**出力**:

- 分析レポート（目的、現状分析、依存関係グラフ、データ受け渡し要件、推奨アプローチ）

**参照リソース**:

- `references/Level1_basics.md`: 基礎ガイド
- `references/Level2_intermediate.md`: 実務ガイド

### Task 2: Implementation（実装）

**ファイル**: [agents/implementation.md](agents/implementation.md)

**役割**: 並列ジョブ実行とジョブ依存関係の実装

**入力**:

- 分析レポート（Analysis Taskから）
- 既存ワークフロー定義（任意）

**出力**:

- 実装済みワークフロー定義（YAML）
- ジョブ依存関係図（Mermaid）

**参照リソース**:

- `references/data-passing.md`: データ受け渡し手法
- `references/job-dependencies.md`: needs構文と依存関係パターン
- `assets/parallel-workflow.yaml`: ワークフローテンプレート
- `scripts/visualize-deps.mjs`: 依存関係可視化スクリプト

### Task 3: Validation（検証）

**ファイル**: [agents/validation.md](agents/validation.md)

**役割**: 実装されたワークフローの検証と記録

**入力**:

- 実装済みワークフロー定義（Implementation Taskから）
- ジョブ依存関係図（Implementation Taskから）
- 分析レポート（Analysis Taskから）

**出力**:

- 検証レポート
- 更新されたEVALS.jsonとLOGS.md

**参照リソース**:

- `references/Level3_advanced.md`: 応用ガイド
- `references/Level4_expert.md`: 専門ガイド
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト

## ワークフロー

### Phase 1: 分析（Analysis Task起動）

1. Analysis Taskを起動する（`agents/analysis.md` 参照）
2. 並列化の目的と現状を分析する
3. 分析レポートを受け取る

### Phase 2: 実装（Implementation Task起動）

1. Implementation Taskを起動する（`agents/implementation.md` 参照）
2. 分析レポートに基づきワークフローを実装する
3. 実装済みワークフロー定義と依存関係図を受け取る

### Phase 3: 検証（Validation Task起動）

1. Validation Taskを起動する（`agents/validation.md` 参照）
2. 実装されたワークフローを検証する
3. `scripts/log_usage.mjs` で実行記録を保存する
4. 検証レポートを受け取る

## ベストプラクティス

### すべきこと

- references/Level1_basics.md を参照し、適用範囲を明確にする
- references/Level2_intermediate.md を参照し、実務手順を整理する

### 避けるべきこと

- アンチパターンや注意点を確認せずに進めることを避ける

## コマンドリファレンス

### リソース読み取り

```bash
cat .claude/skills/parallel-jobs-gha/references/Level1_basics.md
cat .claude/skills/parallel-jobs-gha/references/Level2_intermediate.md
cat .claude/skills/parallel-jobs-gha/references/Level3_advanced.md
cat .claude/skills/parallel-jobs-gha/references/Level4_expert.md
cat .claude/skills/parallel-jobs-gha/references/data-passing.md
cat .claude/skills/parallel-jobs-gha/references/job-dependencies.md
cat .claude/skills/parallel-jobs-gha/references/legacy-skill.md
```

### スクリプト実行

```bash
node .claude/skills/parallel-jobs-gha/scripts/log_usage.mjs --help
node .claude/skills/parallel-jobs-gha/scripts/validate-skill.mjs --help
node .claude/skills/parallel-jobs-gha/scripts/visualize-deps.mjs --help
```

### テンプレート参照

```bash
cat .claude/skills/parallel-jobs-gha/assets/parallel-workflow.yaml
```

## 変更履歴

| Version | Date       | Changes                                     |
| ------- | ---------- | ------------------------------------------- |
| 1.0.0   | 2025-12-24 | Spec alignment and required artifacts added |
