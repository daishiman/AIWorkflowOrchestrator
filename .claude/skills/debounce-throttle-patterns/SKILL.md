---
name: .claude/skills/debounce-throttle-patterns/SKILL.md
description: |
  イベント駆動システムにおける高頻度イベントの最適化パターン。
  デバウンス（連続イベントの最後のみ処理）とスロットリング（一定間隔で処理）を
  適切に使い分け、パフォーマンスとリソース効率を最大化する。
  
  📖 参照書籍:
  - 『The Pragmatic Programmer』（Andrew Hunt, David Thomas）: 実践的改善
  
  📚 リソース参照:
  - `resources/Level1_basics.md`: レベル1の基礎ガイド
  - `resources/Level2_intermediate.md`: レベル2の実務ガイド
  - `resources/Level3_advanced.md`: レベル3の応用ガイド
  - `resources/Level4_expert.md`: レベル4の専門ガイド
  - `resources/implementation-patterns.md`: implementation-patterns のパターン集
  - `resources/legacy-skill.md`: 旧SKILL.mdの全文
  - `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
  - `scripts/validate-skill.mjs`: スキル構造検証スクリプト
  - `templates/debounce-throttle.ts`: debounce-throttle のテンプレート
  
  Use proactively when handling debounce throttle patterns tasks.
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

# Debounce & Throttle Patterns

## 概要

イベント駆動システムにおける高頻度イベントの最適化パターン。
デバウンス（連続イベントの最後のみ処理）とスロットリング（一定間隔で処理）を
適切に使い分け、パフォーマンスとリソース効率を最大化する。

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
- ファイル監視で連続保存イベントを1回にまとめたい時
- 高頻度APIコールを制限したい時
- UIイベント（スクロール、リサイズ）を最適化したい時
- イベント発火頻度とシステム応答性のトレードオフを検討する時
- メモリ使用量を抑えながらイベント処理を行いたい時

### 避けるべきこと
- アンチパターンや注意点を確認せずに進めることを避ける

## コマンドリファレンス

### リソース読み取り
```bash
cat .claude/skills/debounce-throttle-patterns/resources/Level1_basics.md
cat .claude/skills/debounce-throttle-patterns/resources/Level2_intermediate.md
cat .claude/skills/debounce-throttle-patterns/resources/Level3_advanced.md
cat .claude/skills/debounce-throttle-patterns/resources/Level4_expert.md
cat .claude/skills/debounce-throttle-patterns/resources/implementation-patterns.md
cat .claude/skills/debounce-throttle-patterns/resources/legacy-skill.md
```

### スクリプト実行
```bash
node .claude/skills/debounce-throttle-patterns/scripts/log_usage.mjs --help
node .claude/skills/debounce-throttle-patterns/scripts/validate-skill.mjs --help
```

### テンプレート参照
```bash
cat .claude/skills/debounce-throttle-patterns/templates/debounce-throttle.ts
```

## 変更履歴

| Version | Date | Changes |
| --- | --- | --- |
| 1.0.0 | 2025-12-24 | Spec alignment and required artifacts added |
