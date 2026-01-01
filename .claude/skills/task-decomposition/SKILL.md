---
name: task-decomposition
description: |
  複雑なタスクを段階的に分解し、実行可能なステップに変換するスキル。
  大規模なプロジェクト、多工程の業務、曖昧な要件を具体的で実行可能な単位に整理します。

  Anchors:
  • 『The Pragmatic Programmer』（Andrew Hunt, David Thomas） / 適用: タスク管理 / 目的: 効率的実行

  Trigger:
  タスク分解、作業ブレークダウン、複雑なタスク整理、大規模プロジェクト計画時に使用

allowed-tools:
  - bash
  - Read
  - Edit
  - Glob
  - Grep
  - TodoWrite
---

# タスク分解

## 概要

タスク分解と段階的実行の手順を提供するスキル。

詳細な手順や背景は `references/Level1_basics.md` と `references/Level2_intermediate.md` を参照してください。

## ワークフロー

### Phase 1: 目的と前提の整理

**目的**: タスクの目的と前提条件を明確にする

**アクション**:

1. `references/Level1_basics.md` と `references/Level2_intermediate.md` を確認
2. 必要な references/scripts/templates を特定

### Phase 2: スキル適用

**目的**: スキルの指針に従って具体的な作業を進める

**アクション**:

1. 関連リソースやテンプレートを参照しながら作業を実施
2. 重要な判断点をメモとして残す

### Phase 3: 検証と記録

**目的**: 成果物の検証と実行記録の保存

**アクション**:

1. `scripts/validate-skill.mjs` でスキル構造を確認
2. 成果物が目的に合致するか確認
3. `scripts/log_usage.mjs` を実行して記録を残す

## Task仕様ナビ

| フェーズ | 目的             | 主要アクション                 | 成果物                   |
| -------- | ---------------- | ------------------------------ | ------------------------ |
| Phase 1  | 目的と前提の整理 | リソース確認、適用範囲の明確化 | タスク分解計画書         |
| Phase 2  | スキル適用       | リソース参照、具体的な作業実施 | 実行可能なステップリスト |
| Phase 3  | 検証と記録       | 構造検証、成果物確認、ログ記録 | 検証済みタスク分解       |

## ベストプラクティス

### すべきこと

- references/Level1_basics.md を参照し、適用範囲を明確にする
- references/Level2_intermediate.md を参照し、実務手順を整理する

### 避けるべきこと

- アンチパターンや注意点を確認せずに進めることを避ける

## リソース参照

### 主要リソース

#### レベル別ガイド

| ファイル                           | 説明                               | 対象             |
| ---------------------------------- | ---------------------------------- | ---------------- |
| `references/Level1_basics.md`       | タスク分解の基本概念と基本手順     | 初心者・基礎学習 |
| `references/Level2_intermediate.md` | 実務的な分解手法と戦略             | 実務的な適用     |
| `references/Level3_advanced.md`     | 複雑なタスク分解の応用技法         | 高度な適用       |
| `references/Level4_expert.md`       | 専門的な最適化とベストプラクティス | エキスパート向け |

#### サポートリソース

- `references/requirements-index.md`: 要求仕様の索引（docs/00-requirements と同期）

### スクリプト

| スクリプト                   | 用途                     |
| ---------------------------- | ------------------------ |
| `scripts/log_usage.mjs`      | 使用記録の記録と自動評価 |
| `scripts/validate-skill.mjs` | スキル構造の検証         |

### 実行コマンド

**スクリプトヘルプ表示**:

```bash
node .claude/skills/task-decomposition/scripts/log_usage.mjs --help
node .claude/skills/task-decomposition/scripts/validate-skill.mjs --help
```

## 変更履歴

| Version | Date       | Changes                                            |
| ------- | ---------- | -------------------------------------------------- |
| 2.0.0   | 2025-12-31 | 18-skills.md仕様に準拠、日本語化、Task仕様ナビ追加 |
| 1.0.0   | 2025-12-24 | Spec alignment and required artifacts added        |
