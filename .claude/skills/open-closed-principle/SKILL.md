---
name: .claude/skills/open-closed-principle/SKILL.md
description: |
  SOLID原則の開放閉鎖原則（OCP）を専門とするスキル。
  Robert C. Martinの『アジャイルソフトウェア開発の奥義』に基づき、
  拡張に開かれ、修正に閉じた設計を提供します。
  
  📖 参照書籍:
  - 『The Pragmatic Programmer』（Andrew Hunt, David Thomas）: 実践的改善
  
  📚 リソース参照:
  - `resources/Level1_basics.md`: レベル1の基礎ガイド
  - `resources/Level2_intermediate.md`: レベル2の実務ガイド
  - `resources/Level3_advanced.md`: レベル3の応用ガイド
  - `resources/Level4_expert.md`: レベル4の専門ガイド
  - `resources/extension-mechanisms.md`: 拡張メカニズム（Extension Mechanisms）
  - `resources/legacy-skill.md`: 旧SKILL.mdの全文
  - `resources/ocp-fundamentals.md`: OCP原則の基本（Open-Closed Principle Fundamentals）
  - `resources/ocp-patterns.md`: OCP準拠パターン（OCP-Compliant Patterns）
  - `resources/refactoring-to-ocp.md`: OCPへのリファクタリング（Refactoring to OCP）
  - `scripts/analyze-extensibility.mjs`: コードの拡張性分析とOCP違反検出（switch文・if-elseチェーン・型チェック・フラグパラメータ）
  - `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
  - `scripts/validate-skill.mjs`: スキル構造検証スクリプト
  - `templates/extension-point-template.md`: Strategy/Template Method/Plugin Registryによる拡張ポイント設計テンプレート
  
  Use proactively when handling open closed principle tasks.
version: 1.0.0
level: 1
last_updated: 2025-12-24
references:
  - book: "The Pragmatic Programmer"
    author: "Andrew Hunt, David Thomas"
    concepts:
      - "実践的改善"
      - "品質維持"
---

# Open-Closed Principle (OCP)

## 概要

SOLID原則の開放閉鎖原則（OCP）を専門とするスキル。
Robert C. Martinの『アジャイルソフトウェア開発の奥義』に基づき、
拡張に開かれ、修正に閉じた設計を提供します。

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
- 新しいワークフロータイプの追加が必要な時
- 既存コードを修正せずに機能拡張したい時
- 拡張ポイントを設計する時
- レガシーコードをOCP準拠にリファクタリングする時

### 避けるべきこと
- アンチパターンや注意点を確認せずに進めることを避ける

## コマンドリファレンス

### リソース読み取り
```bash
cat .claude/skills/open-closed-principle/resources/Level1_basics.md
cat .claude/skills/open-closed-principle/resources/Level2_intermediate.md
cat .claude/skills/open-closed-principle/resources/Level3_advanced.md
cat .claude/skills/open-closed-principle/resources/Level4_expert.md
cat .claude/skills/open-closed-principle/resources/extension-mechanisms.md
cat .claude/skills/open-closed-principle/resources/legacy-skill.md
cat .claude/skills/open-closed-principle/resources/ocp-fundamentals.md
cat .claude/skills/open-closed-principle/resources/ocp-patterns.md
cat .claude/skills/open-closed-principle/resources/refactoring-to-ocp.md
```

### スクリプト実行
```bash
node .claude/skills/open-closed-principle/scripts/analyze-extensibility.mjs --help
node .claude/skills/open-closed-principle/scripts/log_usage.mjs --help
node .claude/skills/open-closed-principle/scripts/validate-skill.mjs --help
```

### テンプレート参照
```bash
cat .claude/skills/open-closed-principle/templates/extension-point-template.md
```

## 変更履歴

| Version | Date | Changes |
| --- | --- | --- |
| 1.0.0 | 2025-12-24 | Spec alignment and required artifacts added |
