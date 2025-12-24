---
name: .claude/skills/caching-strategies-gha/SKILL.md
description: |
  GitHub Actions ワークフロー高速化のためのキャッシング戦略。
  
  📖 参照書籍:
  - 『The Pragmatic Programmer』（Andrew Hunt, David Thomas）: 実践的改善
  
  📚 リソース参照:
  - `resources/Level1_basics.md`: レベル1の基礎ガイド
  - `resources/Level2_intermediate.md`: レベル2の実務ガイド
  - `resources/Level3_advanced.md`: レベル3の応用ガイド
  - `resources/Level4_expert.md`: レベル4の専門ガイド
  - `resources/cache-action.md`: actions/cache 完全リファレンス
  - `resources/cache-optimization.md`: キャッシュ最適化戦略
  - `resources/cache-patterns.md`: 言語別キャッシュパターン
  - `resources/legacy-skill.md`: 旧SKILL.mdの全文
  - `scripts/estimate-cache-size.mjs`: GitHub Actions キャッシュサイズ見積もりツール
  - `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
  - `scripts/validate-skill.mjs`: スキル構造検証スクリプト
  - `templates/cache-examples.yaml`: GitHub Actions キャッシュ設定例集
  
  Use proactively when handling caching strategies gha tasks.
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

# GitHub Actions Caching Strategies

## 概要

GitHub Actions ワークフロー高速化のためのキャッシング戦略。

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
- ワークフローのビルド時間を短縮したい時
- 依存関係のインストール時間を削減したい時
- Dockerビルドを高速化したい時
- キャッシュヒット率を改善したい時
- ストレージ制限（10GB）を管理する時

### 避けるべきこと
- アンチパターンや注意点を確認せずに進めることを避ける

## コマンドリファレンス

### リソース読み取り
```bash
cat .claude/skills/caching-strategies-gha/resources/Level1_basics.md
cat .claude/skills/caching-strategies-gha/resources/Level2_intermediate.md
cat .claude/skills/caching-strategies-gha/resources/Level3_advanced.md
cat .claude/skills/caching-strategies-gha/resources/Level4_expert.md
cat .claude/skills/caching-strategies-gha/resources/cache-action.md
cat .claude/skills/caching-strategies-gha/resources/cache-optimization.md
cat .claude/skills/caching-strategies-gha/resources/cache-patterns.md
cat .claude/skills/caching-strategies-gha/resources/legacy-skill.md
```

### スクリプト実行
```bash
node .claude/skills/caching-strategies-gha/scripts/estimate-cache-size.mjs --help
node .claude/skills/caching-strategies-gha/scripts/log_usage.mjs --help
node .claude/skills/caching-strategies-gha/scripts/validate-skill.mjs --help
```

### テンプレート参照
```bash
cat .claude/skills/caching-strategies-gha/templates/cache-examples.yaml
```

## 変更履歴

| Version | Date | Changes |
| --- | --- | --- |
| 1.0.0 | 2025-12-24 | Spec alignment and required artifacts added |
