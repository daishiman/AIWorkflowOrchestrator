---
name: solid-principles
description: |
  Apply SOLID principles (SRP, OCP, LSP, ISP, DIP) to evaluate and improve object-oriented design quality. Guides architecture review, refactoring decisions, and code quality assessment.

  Anchors:
  • Clean Architecture by Robert C. Martin / Apply: Dependency Rule and layer separation / Purpose: Ensure proper dependency direction in architecture
  • SOLID Principles by Robert C. Martin / Apply: All five principles for design evaluation / Purpose: Achieve maintainable, testable, and flexible code

  Trigger:
  Use when evaluating code architecture, reviewing design quality, detecting SOLID violations, planning refactoring, conducting architecture reviews, or improving object-oriented design. Keywords: single responsibility, open closed principle, liskov substitution, interface segregation, dependency inversion, architecture review, design patterns, refactoring.
---

# SOLID Principles

## 概要

ロバート・C・マーティンが体系化したSOLID原則（SRP, OCP, LSP, ISP, DIP）の

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

## ベストプラクティス

### すべきこと

- references/Level1_basics.md を参照し、適用範囲を明確にする
- references/Level2_intermediate.md を参照し、実務手順を整理する

### 避けるべきこと

- アンチパターンや注意点を確認せずに進めることを避ける

## コマンドリファレンス

### リソース読み取り

```bash
cat .claude/skills/solid-principles/references/Level1_basics.md
cat .claude/skills/solid-principles/references/Level2_intermediate.md
cat .claude/skills/solid-principles/references/Level3_advanced.md
cat .claude/skills/solid-principles/references/Level4_expert.md
cat .claude/skills/solid-principles/references/dependency-inversion.md
cat .claude/skills/solid-principles/references/interface-segregation.md
cat .claude/skills/solid-principles/references/legacy-skill.md
cat .claude/skills/solid-principles/references/liskov-substitution.md
cat .claude/skills/solid-principles/references/open-closed.md
cat .claude/skills/solid-principles/references/single-responsibility.md
```

### スクリプト実行

```bash
node .claude/skills/solid-principles/scripts/check-solid-violations.mjs --help
node .claude/skills/solid-principles/scripts/log_usage.mjs --help
node .claude/skills/solid-principles/scripts/validate-skill.mjs --help
```

### テンプレート参照

```bash
cat .claude/skills/solid-principles/assets/solid-review-checklist.md
```

## 変更履歴

| Version | Date       | Changes                                     |
| ------- | ---------- | ------------------------------------------- |
| 1.0.0   | 2025-12-24 | Spec alignment and required artifacts added |
