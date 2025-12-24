---
name: .claude/skills/error-boundary/SKILL.md
description: |
  ReactにおけるError Boundaryとエラーハンドリングのベストプラクティスを専門とするスキル。
  堅牢なエラー処理とユーザーフレンドリーなフォールバックUIを提供します。
  専門分野:
  
  📖 参照書籍:
  - 『The Pragmatic Programmer』（Andrew Hunt, David Thomas）: 実践的改善
  
  📚 リソース参照:
  - `resources/Level1_basics.md`: レベル1の基礎ガイド
  - `resources/Level2_intermediate.md`: レベル2の実務ガイド
  - `resources/Level3_advanced.md`: レベル3の応用ガイド
  - `resources/Level4_expert.md`: レベル4の専門ガイド
  - `resources/error-boundary-basics.md`: error-boundary-basics の詳細ガイド
  - `resources/error-reporting.md`: error-reporting の詳細ガイド
  - `resources/fallback-ui-patterns.md`: fallback-ui-patterns のパターン集
  - `resources/legacy-skill.md`: 旧SKILL.mdの全文
  - `resources/recovery-strategies.md`: recovery-strategies の詳細ガイド
  - `scripts/analyze-error-handling.mjs`: errorhandlingを分析するスクリプト
  - `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
  - `scripts/validate-skill.mjs`: スキル構造検証スクリプト
  - `templates/error-boundary-template.md`: error-boundary-template のテンプレート
  - `templates/error-fallback-template.md`: error-fallback-template のテンプレート
  - `resources/requirements-index.md`: 要求仕様の索引（docs/00-requirements と同期）
  
  Use proactively when handling error boundary tasks.
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

# Error Boundary

## 概要

ReactにおけるError Boundaryとエラーハンドリングのベストプラクティスを専門とするスキル。
堅牢なエラー処理とユーザーフレンドリーなフォールバックUIを提供します。
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
- アプリケーションのエラーハンドリングを設計する時
- クラッシュからの回復UIを実装する時
- エラー監視を設定する時
- 非同期エラーを処理する時

### 避けるべきこと
- アンチパターンや注意点を確認せずに進めることを避ける

## コマンドリファレンス

### リソース読み取り
```bash
cat .claude/skills/error-boundary/resources/Level1_basics.md
cat .claude/skills/error-boundary/resources/Level2_intermediate.md
cat .claude/skills/error-boundary/resources/Level3_advanced.md
cat .claude/skills/error-boundary/resources/Level4_expert.md
cat .claude/skills/error-boundary/resources/error-boundary-basics.md
cat .claude/skills/error-boundary/resources/error-reporting.md
cat .claude/skills/error-boundary/resources/fallback-ui-patterns.md
cat .claude/skills/error-boundary/resources/legacy-skill.md
cat .claude/skills/error-boundary/resources/recovery-strategies.md
```

### スクリプト実行
```bash
node .claude/skills/error-boundary/scripts/analyze-error-handling.mjs --help
node .claude/skills/error-boundary/scripts/log_usage.mjs --help
node .claude/skills/error-boundary/scripts/validate-skill.mjs --help
```

### テンプレート参照
```bash
cat .claude/skills/error-boundary/templates/error-boundary-template.md
cat .claude/skills/error-boundary/templates/error-fallback-template.md
```

## 変更履歴

| Version | Date | Changes |
| --- | --- | --- |
| 1.0.0 | 2025-12-24 | Spec alignment and required artifacts added |
