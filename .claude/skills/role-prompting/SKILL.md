---
name: role-prompting
description: |
  役割プロンプト設計と責務分離の指針を提供するスキル。AIエージェント、システムロール、ペルソナ設計の基本原則と実装パターンをカバーします。

  Anchors:
  • 『The Pragmatic Programmer』（Andrew Hunt, David Thomas） / 適用: 手順設計原則 / 目的: ロール設計品質向上
  • 『Domain-Driven Design』（Eric Evans） / 適用: 責務分離の理論 / 目的: システム設計の明確性向上

  Trigger:
  ロールプロンプティング設計、AIペルソナ設定、専門家役割定義、エージェント責務分離時に使用

allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
---

# Role Prompting

## 概要

役割プロンプト設計と責務分離の指針を提供するスキル。

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

| Task                 | 説明                           | 難易度 | 参考リソース               |
| -------------------- | ------------------------------ | ------ | -------------------------- |
| ロール基礎設計       | AIペルソナの基本構造を定義     | 初級   | Level1_basics.md           |
| 責務分離設計         | 複数ロール間の責任境界を明確化 | 中級   | Level2_intermediate.md     |
| 相互作用パターン     | ロール間のインタラクション設計 | 上級   | Level3_advanced.md         |
| エンタープライズ適用 | 大規模システムへの適用戦略     | 専門家 | Level4_expert.md           |
| 検証と最適化         | ロール設計の品質確保と改善     | 中級   | scripts/validate-skill.mjs |

## ベストプラクティス

### すべきこと

- **段階的な学習**: Level1_basics.md から Level4_expert.md へ段階的に進める
- **実務手順の確認**: references/Level2_intermediate.md で実装パターンを確認する
- **設計の検証**: scripts/validate-skill.mjs でスキル構造の一貫性を確認する
- **ユースケース考慮**: 対象システムの規模と複雑度に応じた設計アプローチを選択する
- **ドキュメント化**: ロール定義と責務分離の理由を明確に記録する

### 避けるべきこと

- アンチパターンや注意点を確認せずに進めることを避ける
- 責務の重複定義や曖昧な境界線を設定しない
- 一つのロールに過度な責任を集中させない
- 設計後の検証を省かない
- 既存のベストプラクティスを無視してカスタム設計を押し進めない

## リソース参照

### 学習リソース

#### レベル別ガイド

- **`references/Level1_basics.md`**: ロールプロンプティングの基礎概念と入門パターン
- **`references/Level2_intermediate.md`**: 実務レベルの設計手法と実装ガイド
- **`references/Level3_advanced.md`**: 複雑なシステムへの応用と最適化戦略
- **`references/Level4_expert.md`**: エンタープライズレベルの設計パターンと理論

### スクリプト・ツール

#### 検証とログ

- **`scripts/validate-skill.mjs`**: スキル構造の検証と品質チェック
  ```bash
  node .claude/skills/role-prompting/scripts/validate-skill.mjs
  ```
- **`scripts/log_usage.mjs`**: 使用記録と自動評価
  ```bash
  node .claude/skills/role-prompting/scripts/log_usage.mjs --help
  ```

### 参考文献

- 『The Pragmatic Programmer』（Andrew Hunt, David Thomas）: 手順設計原則
- Effective Software Architecture Patterns: ロール設計パターン
- Domain-Driven Design（Eric Evans）: 責務分離の理論的背景

## 変更履歴

| Version | Date       | Changes                                                        |
| ------- | ---------- | -------------------------------------------------------------- |
| 1.0.0   | 2025-12-24 | Spec alignment and required artifacts added                    |
| 1.1.0   | 2025-12-31 | 18-skills.md仕様に準拠、YAML frontmatter整備、Task仕様ナビ追加 |
