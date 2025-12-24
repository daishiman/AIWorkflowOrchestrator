---
name: .claude/skills/retry-strategies/SKILL.md
description: |
  外部APIの一時的障害に対するリトライ戦略とサーキットブレーカーパターンを専門とするスキル。
  
  📖 参照書籍:
  - 『The Pragmatic Programmer』（Andrew Hunt, David Thomas）: 実践的改善
  
  📚 リソース参照:
  - `resources/Level1_basics.md`: レベル1の基礎ガイド
  - `resources/Level2_intermediate.md`: レベル2の実務ガイド
  - `resources/Level3_advanced.md`: レベル3の応用ガイド
  - `resources/Level4_expert.md`: レベル4の専門ガイド
  - `resources/bulkhead-pattern.md`: Bulkhead Patternリソース
  - `resources/circuit-breaker.md`: Circuit Breakerリソース
  - `resources/exponential-backoff.md`: Exponential Backoffリソース
  - `resources/legacy-skill.md`: 旧SKILL.mdの全文
  - `resources/timeout-strategies.md`: Timeout Strategiesリソース
  - `scripts/analyze-retry-config.mjs`: Analyze Retry Configスクリプト
  - `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
  - `scripts/validate-skill.mjs`: スキル構造検証スクリプト
  - `templates/circuit-breaker-template.ts`: Circuit Breakerテンプレート
  - `templates/retry-wrapper-template.ts`: Retry Wrapperテンプレート
  - `resources/requirements-index.md`: 要求仕様の索引（docs/00-requirements と同期）
  
  Use proactively when handling retry strategies tasks.
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

# Retry Strategies

## 概要

外部APIの一時的障害に対するリトライ戦略とサーキットブレーカーパターンを専門とするスキル。

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
- resources/Level1_basics.md を参照し、適用範囲を明確にする
- resources/Level2_intermediate.md を参照し、実務手順を整理する

### 避けるべきこと
- アンチパターンや注意点を確認せずに進めることを避ける

## コマンドリファレンス

### リソース読み取り
```bash
cat .claude/skills/retry-strategies/resources/Level1_basics.md
cat .claude/skills/retry-strategies/resources/Level2_intermediate.md
cat .claude/skills/retry-strategies/resources/Level3_advanced.md
cat .claude/skills/retry-strategies/resources/Level4_expert.md
cat .claude/skills/retry-strategies/resources/bulkhead-pattern.md
cat .claude/skills/retry-strategies/resources/circuit-breaker.md
cat .claude/skills/retry-strategies/resources/exponential-backoff.md
cat .claude/skills/retry-strategies/resources/legacy-skill.md
cat .claude/skills/retry-strategies/resources/timeout-strategies.md
```

### スクリプト実行
```bash
node .claude/skills/retry-strategies/scripts/analyze-retry-config.mjs --help
node .claude/skills/retry-strategies/scripts/log_usage.mjs --help
node .claude/skills/retry-strategies/scripts/validate-skill.mjs --help
```

### テンプレート参照
```bash
cat .claude/skills/retry-strategies/templates/circuit-breaker-template.ts
cat .claude/skills/retry-strategies/templates/retry-wrapper-template.ts
```

## 変更履歴

| Version | Date | Changes |
| --- | --- | --- |
| 1.0.0 | 2025-12-24 | Spec alignment and required artifacts added |
