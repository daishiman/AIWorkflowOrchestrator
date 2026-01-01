---
name: .claude/skills/rate-limiting/SKILL.md
description: |
  Rate Limitingとクォータ管理のベストプラクティスを提供します。
  外部APIのレート制限を適切に処理し、サーバー側・クライアント側両方の
  観点からRate Limitingを実装するためのパターンを提供します。
  
  📖 参照書籍:
  - 『The Pragmatic Programmer』（Andrew Hunt, David Thomas）: 実践的改善
  
  📚 リソース参照:
  - `references/Level1_basics.md`: レベル1の基礎ガイド
  - `references/Level2_intermediate.md`: レベル2の実務ガイド
  - `references/Level3_advanced.md`: レベル3の応用ガイド
  - `references/Level4_expert.md`: レベル4の専門ガイド
  - `references/algorithms.md`: Rate Limiting Algorithms（レート制限アルゴリズム）
  - `references/client-handling.md`: Client-Side Rate Limit Handling（クライアント側のレート制限対応）
  - `references/legacy-skill.md`: 旧SKILL.mdの全文
  - `references/quota-management.md`: Quota Management（クォータ管理）
  - `references/server-implementation.md`: Server-Side Rate Limiting（サーバー側レート制限）
  - `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
  - `scripts/simulate-rate-limit.mjs`: Rate Limit Simulation Tool
  - `scripts/validate-skill.mjs`: スキル構造検証スクリプト
  - `assets/rate-limiter-template.ts`: Rate Limiter Template
  - `references/requirements-index.md`: 要求仕様の索引（docs/00-requirements と同期）
  
  Use proactively when handling rate limiting tasks.
---

# Rate Limiting

## 概要

Rate Limitingとクォータ管理のベストプラクティスを提供します。
外部APIのレート制限を適切に処理し、サーバー側・クライアント側両方の
観点からRate Limitingを実装するためのパターンを提供します。

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
- APIのRate Limiting設計時
- DoS/DDoS攻撃対策の実装時
- 外部APIクライアントの実装時
- クォータ管理システムの設計時

### 避けるべきこと
- アンチパターンや注意点を確認せずに進めることを避ける

## コマンドリファレンス

### リソース読み取り
```bash
cat .claude/skills/rate-limiting/references/Level1_basics.md
cat .claude/skills/rate-limiting/references/Level2_intermediate.md
cat .claude/skills/rate-limiting/references/Level3_advanced.md
cat .claude/skills/rate-limiting/references/Level4_expert.md
cat .claude/skills/rate-limiting/references/algorithms.md
cat .claude/skills/rate-limiting/references/client-handling.md
cat .claude/skills/rate-limiting/references/legacy-skill.md
cat .claude/skills/rate-limiting/references/quota-management.md
cat .claude/skills/rate-limiting/references/server-implementation.md
```

### スクリプト実行
```bash
node .claude/skills/rate-limiting/scripts/log_usage.mjs --help
node .claude/skills/rate-limiting/scripts/simulate-rate-limit.mjs --help
node .claude/skills/rate-limiting/scripts/validate-skill.mjs --help
```

### テンプレート参照
```bash
cat .claude/skills/rate-limiting/assets/rate-limiter-template.ts
```

## 変更履歴

| Version | Date | Changes |
| --- | --- | --- |
| 1.1.0 | 2025-12-24 | Spec alignment and required artifacts added |
