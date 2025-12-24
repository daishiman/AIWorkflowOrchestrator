---
name: .claude/skills/conditional-execution-gha/SKILL.md
description: |
  GitHub Actions 条件付き実行の完全ガイド。
  専門分野:
  
  📖 参照書籍:
  - 『The Pragmatic Programmer』（Andrew Hunt, David Thomas）: 実践的改善
  
  📚 リソース参照:
  - `resources/Level1_basics.md`: レベル1の基礎ガイド
  - `resources/Level2_intermediate.md`: レベル2の実務ガイド
  - `resources/Level3_advanced.md`: レベル3の応用ガイド
  - `resources/Level4_expert.md`: レベル4の専門ガイド
  - `resources/event-filtering.md`: event-filtering の詳細ガイド
  - `resources/if-conditions.md`: if-conditions の詳細ガイド
  - `resources/legacy-skill.md`: 旧SKILL.mdの全文
  - `scripts/analyze-conditions.mjs`: conditionsを分析するスクリプト
  - `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
  - `scripts/validate-skill.mjs`: スキル構造検証スクリプト
  - `templates/conditional-workflow.yaml`: conditional-workflow のテンプレート
  
  Use proactively when handling conditional execution gha tasks.
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

# GitHub Actions Conditional Execution

## 概要

GitHub Actions 条件付き実行の完全ガイド。
専門分野:

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
- ジョブやステップを特定条件下でのみ実行したい時
- 失敗時のクリーンアップ/通知を実装する時
- ブランチ/パス/イベント別に実行を制御する時
- マトリックスビルドの一部を条件付きで実行する時

### 避けるべきこと
- アンチパターンや注意点を確認せずに進めることを避ける

## コマンドリファレンス

### リソース読み取り
```bash
cat .claude/skills/conditional-execution-gha/resources/Level1_basics.md
cat .claude/skills/conditional-execution-gha/resources/Level2_intermediate.md
cat .claude/skills/conditional-execution-gha/resources/Level3_advanced.md
cat .claude/skills/conditional-execution-gha/resources/Level4_expert.md
cat .claude/skills/conditional-execution-gha/resources/event-filtering.md
cat .claude/skills/conditional-execution-gha/resources/if-conditions.md
cat .claude/skills/conditional-execution-gha/resources/legacy-skill.md
```

### スクリプト実行
```bash
node .claude/skills/conditional-execution-gha/scripts/analyze-conditions.mjs --help
node .claude/skills/conditional-execution-gha/scripts/log_usage.mjs --help
node .claude/skills/conditional-execution-gha/scripts/validate-skill.mjs --help
```

### テンプレート参照
```bash
cat .claude/skills/conditional-execution-gha/templates/conditional-workflow.yaml
```

## 変更履歴

| Version | Date | Changes |
| --- | --- | --- |
| 1.0.0 | 2025-12-24 | Spec alignment and required artifacts added |
