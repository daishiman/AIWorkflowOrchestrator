---
name: .claude/skills/http-best-practices/SKILL.md
description: |
  HTTPプロトコルを正しく効率的に活用するためのベストプラクティス集。
  
  📖 参照書籍:
  - 『The Pragmatic Programmer』（Andrew Hunt, David Thomas）: 実践的改善
  
  📚 リソース参照:
  - `resources/Level1_basics.md`: レベル1の基礎ガイド
  - `resources/Level2_intermediate.md`: レベル2の実務ガイド
  - `resources/Level3_advanced.md`: レベル3の応用ガイド
  - `resources/Level4_expert.md`: レベル4の専門ガイド
  - `resources/connection-management.md`: Keep-Alive、コネクションプーリング、HTTP/2最適化
  - `resources/headers-best-practices.md`: 標準ヘッダー活用とカスタムヘッダー設計
  - `resources/idempotency.md`: 冪等性設計と冪等キー実装
  - `resources/legacy-skill.md`: 旧SKILL.mdの全文
  - `resources/status-codes.md`: 2xx/4xx/5xxステータスコードの適切な使い分け
  - `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
  - `scripts/validate-http-client.mjs`: httpclientを検証するスクリプト
  - `scripts/validate-skill.mjs`: スキル構造検証スクリプト
  - `templates/http-client-template.ts`: http-client-template のテンプレート
  - `resources/requirements-index.md`: 要求仕様の索引（docs/00-requirements と同期）
  
  Use proactively when handling http best practices tasks.
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

# HTTP Best Practices スキル

## 概要

HTTPプロトコルを正しく効率的に活用するためのベストプラクティス集。

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
- RESTful APIを設計・実装する時
- HTTPクライアントを実装する時
- API通信のパフォーマンスを最適化する時
- エラーハンドリング戦略を設計する時

### 避けるべきこと
- アンチパターンや注意点を確認せずに進めることを避ける

## コマンドリファレンス

### リソース読み取り
```bash
cat .claude/skills/http-best-practices/resources/Level1_basics.md
cat .claude/skills/http-best-practices/resources/Level2_intermediate.md
cat .claude/skills/http-best-practices/resources/Level3_advanced.md
cat .claude/skills/http-best-practices/resources/Level4_expert.md
cat .claude/skills/http-best-practices/resources/connection-management.md
cat .claude/skills/http-best-practices/resources/headers-best-practices.md
cat .claude/skills/http-best-practices/resources/idempotency.md
cat .claude/skills/http-best-practices/resources/legacy-skill.md
cat .claude/skills/http-best-practices/resources/status-codes.md
```

### スクリプト実行
```bash
node .claude/skills/http-best-practices/scripts/log_usage.mjs --help
node .claude/skills/http-best-practices/scripts/validate-http-client.mjs --help
node .claude/skills/http-best-practices/scripts/validate-skill.mjs --help
```

### テンプレート参照
```bash
cat .claude/skills/http-best-practices/templates/http-client-template.ts
```

## 変更履歴

| Version | Date | Changes |
| --- | --- | --- |
| 1.0.0 | 2025-12-24 | Spec alignment and required artifacts added |
