---
name: .claude/skills/observability-pillars/SKILL.md
description: |
  オブザーバビリティの三本柱（ログ・メトリクス・トレース）の統合設計スキル。
  Charity Majorsの『Observability Engineering』に基づく実践的な統合パターンを提供します。
  
  📖 参照書籍:
  - 『Observability Engineering』（Charity Majors）: ログ設計
  
  📚 リソース参照:
  - `resources/Level1_basics.md`: レベル1の基礎ガイド
  - `resources/Level2_intermediate.md`: レベル2の実務ガイド
  - `resources/Level3_advanced.md`: レベル3の応用ガイド
  - `resources/Level4_expert.md`: レベル4の専門ガイド
  - `resources/integration-patterns.md`: ログ・メトリクス・トレースの相関ID統合と双方向ナビゲーション（メトリクス異常→ログ→トレース）設計
  - `resources/legacy-skill.md`: 旧SKILL.mdの全文
  - `resources/opentelemetry-guide.md`: OpenTelemetry導入ガイド
  - `resources/sampling-strategies.md`: サンプリング戦略設計
  - `scripts/analyze-telemetry.mjs`: テレメトリデータの相関ID一貫性検証とサンプリング率・高カーディナリティデータ分析スクリプト
  - `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
  - `scripts/validate-skill.mjs`: スキル構造検証スクリプト
  - `templates/integration-config.ts`: OpenTelemetry自動計装・スパン属性設定・相関ID伝播を含む三本柱統合設定テンプレート
  - `resources/requirements-index.md`: 要求仕様の索引（docs/00-requirements と同期）
  
  Use proactively when handling observability pillars tasks.
version: 1.0.0
level: 1
last_updated: 2025-12-24
references:
  - book: "Observability Engineering"
    author: "Charity Majors"
    concepts:
      - "ログ設計"
      - "メトリクス"
---

# Observability Pillars - オブザーバビリティ三本柱統合

## 概要

オブザーバビリティの三本柱（ログ・メトリクス・トレース）の統合設計スキル。
Charity Majorsの『Observability Engineering』に基づく実践的な統合パターンを提供します。

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
- ログ、メトリクス、トレースを統合的に設計する時
- 相関IDで三本柱を連携させる時
- メトリクス異常から該当ログへナビゲートする仕組みを構築する時
- OpenTelemetryで三本柱を統一する時
- 高カーディナリティデータを設計する時
- オブザーバビリティ戦略を立案する時

### 避けるべきこと
- アンチパターンや注意点を確認せずに進めることを避ける

## コマンドリファレンス

### リソース読み取り
```bash
cat .claude/skills/observability-pillars/resources/Level1_basics.md
cat .claude/skills/observability-pillars/resources/Level2_intermediate.md
cat .claude/skills/observability-pillars/resources/Level3_advanced.md
cat .claude/skills/observability-pillars/resources/Level4_expert.md
cat .claude/skills/observability-pillars/resources/integration-patterns.md
cat .claude/skills/observability-pillars/resources/legacy-skill.md
cat .claude/skills/observability-pillars/resources/opentelemetry-guide.md
cat .claude/skills/observability-pillars/resources/sampling-strategies.md
```

### スクリプト実行
```bash
node .claude/skills/observability-pillars/scripts/analyze-telemetry.mjs --help
node .claude/skills/observability-pillars/scripts/log_usage.mjs --help
node .claude/skills/observability-pillars/scripts/validate-skill.mjs --help
```

### テンプレート参照
```bash
cat .claude/skills/observability-pillars/templates/integration-config.ts
```

## 変更履歴

| Version | Date | Changes |
| --- | --- | --- |
| 1.0.0 | 2025-12-24 | Spec alignment and required artifacts added |
