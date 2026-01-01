---
name: knowledge-management
description: |
  SECIモデル（野中郁次郎）に基づく組織知識の形式知化と共有を専門とするスキル。
  暗黙知（経験、勘、ノウハウ）を形式知（ドキュメント、パターン）に変換し、体系化することで組織全体で再利用可能な知識として活用する。

  Anchors:
  • The Knowledge-Creating Company (Nonaka/Takeuchi) / 適用: SECIサイクル4フェーズ（共同化・表出化・連結化・内面化） / 目的: 暗黙知の特定・言語化・統合の理論的基盤
  • The Pragmatic Programmer (Hunt/Thomas) / 適用: 実践的改善とDRY原則 / 目的: 品質維持と重複知識の統合判断
  • Design Patterns (Gang of Four) / 適用: パターン記述形式 / 目的: 再利用可能な知識の抽象化と構造化

  Trigger:
  Use when formalizing tacit knowledge, documenting best practices, converting code review insights to reusable knowledge, managing organizational knowledge base quality, or applying SECI model workflows.
  Keywords: knowledge management, tacit knowledge, explicit knowledge, SECI model, documentation, best practices, pattern extraction
version: 1.0.0
level: 1
last_updated: 2025-12-31
tags:
  - knowledge-management
  - seci-model
  - documentation
  - quality-assurance
dependencies: []
---

# Knowledge Management

## 概要

SECIモデル（野中郁次郎）に基づく組織知識の形式知化と共有を専門とするスキル。
暗黙知を形式知に変換し、体系化することで再利用可能な知識として組織全体で活用可能にします。

詳細な手順や背景は `references/Level1_basics.md` と `references/Level2_intermediate.md` を参照してください。

## ワークフロー

本スキルは3つのフェーズに分かれており、各フェーズは独立したTask（agents/）として実装されています。
各Taskは一時的なワーカーとして起動され、試行錯誤のログをメインコンテキストに持ち込まずに完結します。

### Phase 1: Clarification（目的と前提の整理）

**Task仕様**: `agents/clarification.md`

**担当**: Knowledge Architect

**目的**: タスクの目的を明確化し、対象となる暗黙知の範囲を特定する

**主要アクション**:

1. タスクの目的と成果物の期待値を言語化
2. 対象となる暗黙知の源泉を特定（ドキュメント、コード、議論、経験）
3. 必要な references/scripts/templates を選定
4. 前提条件の確認と不足情報の特定

**参照リソース**:

- `references/Level1_basics.md` - 基礎ガイド
- `references/Level2_intermediate.md` - 実務ガイド
- `references/seci-socialization.md` - 暗黙知の源泉特定手法

**出力**: 整理された目的と前提条件（対象範囲、選定リソース、次フェーズへの指示を含む）

### Phase 2: Application（スキル適用）

**Task仕様**: `agents/application.md`

**担当**: Knowledge Engineer

**目的**: 暗黙知を形式知に変換し、テンプレートに基づいた知識ドキュメントを作成する

**主要アクション**:

1. 暗黙知を言語化・概念化（Externalization）
2. パターンとベストプラクティスの抽出
3. 既存の形式知との統合（Combination）
4. テンプレートに沿った知識ドキュメントの作成
5. 重要な判断点をメモとして記録

**参照リソース**:

- `references/seci-externalization.md` - 暗黙知の言語化手法
- `references/seci-combination.md` - 形式知の統合・体系化
- `assets/knowledge-document-template.md` - 標準テンプレート

**出力**:

- 形式知化されたドキュメント（テンプレート準拠）
- 判断ポイントメモ（重要な判断、代替案、不確実な点）

### Phase 3: Verification（検証と記録）

**Task仕様**: `agents/verification.md`

**担当**: Quality Assurance Specialist

**目的**: 知識ドキュメントを検証し、品質基準を満たすことを確認・記録する

**主要アクション**:

1. `scripts/validate-skill.mjs` でスキル構造を検証
2. `scripts/validate-knowledge.mjs` でドキュメント品質を自動検証
3. `references/quality-assurance.md` の3軸評価（完全性、明確性、再現性）
4. 成果物が当初の目的に合致するか確認
5. `scripts/log_usage.mjs` を実行して使用記録を保存

**参照リソース**:

- `references/quality-assurance.md` - 品質評価基準
- `references/freshness-strategy.md` - 鮮度維持戦略

**出力**:

- 検証結果レポート（品質スコア、改善提案を含む）
- 使用記録（LOGS.md への自動追記）
- メトリクス更新（EVALS.json への自動更新）

## ベストプラクティス

### すべきこと

- ベストプラクティスやノウハウを文書化する時
- コードレビューコメントや議論を形式知化する時
- 経験や勘に基づく暗黙知を明示的な知識に変換する時
- 知識ベースの品質評価や陳腐化チェックを行う時

### 避けるべきこと

- アンチパターンや注意点を確認せずに進めることを避ける

## コマンドリファレンス

### リソース読み取り

```bash
cat .claude/skills/knowledge-management/references/Level1_basics.md
cat .claude/skills/knowledge-management/references/Level2_intermediate.md
cat .claude/skills/knowledge-management/references/Level3_advanced.md
cat .claude/skills/knowledge-management/references/Level4_expert.md
cat .claude/skills/knowledge-management/references/curation-framework.md
cat .claude/skills/knowledge-management/references/freshness-strategy.md
cat .claude/skills/knowledge-management/references/legacy-skill.md
cat .claude/skills/knowledge-management/references/quality-assurance.md
cat .claude/skills/knowledge-management/references/seci-combination.md
cat .claude/skills/knowledge-management/references/seci-externalization.md
cat .claude/skills/knowledge-management/references/seci-model-details.md
cat .claude/skills/knowledge-management/references/seci-socialization.md
```

### スクリプト実行

```bash
node .claude/skills/knowledge-management/scripts/log_usage.mjs --help
node .claude/skills/knowledge-management/scripts/validate-knowledge.mjs --help
.claude/skills/knowledge-management/scripts/validate-knowledge.sh
node .claude/skills/knowledge-management/scripts/validate-skill.mjs --help
```

### テンプレート参照

```bash
cat .claude/skills/knowledge-management/assets/knowledge-document-template.md
```

## 変更履歴

| Version | Date       | Changes                                     |
| ------- | ---------- | ------------------------------------------- |
| 1.0.0   | 2025-12-24 | Spec alignment and required artifacts added |
