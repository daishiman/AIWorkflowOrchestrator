---
name: .claude/skills/design-patterns-behavioral/SKILL.md
description: |
  GoF（Gang of Four）の行動パターンを専門とするスキル。
  エリック・ガンマの『デザインパターン』に基づき、オブジェクト間の通信と
  責務の分散を効果的に設計するパターンを提供します。
  
  📖 参照書籍:
  - 『Design Patterns』（Erich Gamma et al.）: 設計パターン
  
  📚 リソース参照:
  - `resources/Level1_basics.md`: レベル1の基礎ガイド
  - `resources/Level2_intermediate.md`: レベル2の実務ガイド
  - `resources/Level3_advanced.md`: レベル3の応用ガイド
  - `resources/Level4_expert.md`: レベル4の専門ガイド
  - `resources/chain-of-responsibility-pattern.md`: chain-of-responsibility-pattern の詳細ガイド
  - `resources/command-pattern.md`: command-pattern の詳細ガイド
  - `resources/legacy-skill.md`: 旧SKILL.mdの全文
  - `resources/observer-pattern.md`: observer-pattern の詳細ガイド
  - `resources/pattern-selection-guide.md`: pattern-selection-guide のガイド
  - `resources/state-pattern.md`: state-pattern の詳細ガイド
  - `resources/strategy-pattern.md`: strategy-pattern の詳細ガイド
  - `resources/template-method-pattern.md`: template-method-pattern の詳細ガイド
  - `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
  - `scripts/validate-pattern-usage.mjs`: patternusageを検証するスクリプト
  - `scripts/validate-skill.mjs`: スキル構造検証スクリプト
  - `templates/strategy-implementation.md`: strategy-implementation のテンプレート
  - `templates/template-method-implementation.md`: template-method-implementation のテンプレート
  
  Use proactively when handling design patterns behavioral tasks.
version: 1.0.0
level: 1
last_updated: 2025-12-24
references:
  - book: "Design Patterns"
    author: "Erich Gamma et al."
    concepts:
      - "設計パターン"
      - "拡張性"
---

# Design Patterns - Behavioral

## 概要

GoF（Gang of Four）の行動パターンを専門とするスキル。
エリック・ガンマの『デザインパターン』に基づき、オブジェクト間の通信と
責務の分散を効果的に設計するパターンを提供します。

詳細な手順や背景は `resources/Level1_basics.md` と `resources/Level2_intermediate.md` を参照してください。


## ワークフロー

### Phase 1: 目的と前提の整理

**目的**: タスクの目的と前提条件を明確にする

**アクション**:

1. `resources/Level1_basics.md` と `resources/Level2_intermediate.md` を確認
2. 必要な resources/scripts/templates を特定

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
- ワークフローエンジンでアルゴリズムの切り替えが必要な時
- 共通処理フローを定義し、個別実装を分離したい時
- 操作の実行、取り消し、キューイングが必要な時
- イベント駆動アーキテクチャを設計する時

### 避けるべきこと
- アンチパターンや注意点を確認せずに進めることを避ける

## コマンドリファレンス

### リソース読み取り
```bash
cat .claude/skills/design-patterns-behavioral/resources/Level1_basics.md
cat .claude/skills/design-patterns-behavioral/resources/Level2_intermediate.md
cat .claude/skills/design-patterns-behavioral/resources/Level3_advanced.md
cat .claude/skills/design-patterns-behavioral/resources/Level4_expert.md
cat .claude/skills/design-patterns-behavioral/resources/chain-of-responsibility-pattern.md
cat .claude/skills/design-patterns-behavioral/resources/command-pattern.md
cat .claude/skills/design-patterns-behavioral/resources/legacy-skill.md
cat .claude/skills/design-patterns-behavioral/resources/observer-pattern.md
cat .claude/skills/design-patterns-behavioral/resources/pattern-selection-guide.md
cat .claude/skills/design-patterns-behavioral/resources/state-pattern.md
cat .claude/skills/design-patterns-behavioral/resources/strategy-pattern.md
cat .claude/skills/design-patterns-behavioral/resources/template-method-pattern.md
```

### スクリプト実行
```bash
node .claude/skills/design-patterns-behavioral/scripts/log_usage.mjs --help
node .claude/skills/design-patterns-behavioral/scripts/validate-pattern-usage.mjs --help
node .claude/skills/design-patterns-behavioral/scripts/validate-skill.mjs --help
```

### テンプレート参照
```bash
cat .claude/skills/design-patterns-behavioral/templates/strategy-implementation.md
cat .claude/skills/design-patterns-behavioral/templates/template-method-implementation.md
```

## 変更履歴

| Version | Date | Changes |
| --- | --- | --- |
| 1.0.0 | 2025-12-24 | Spec alignment and required artifacts added |
