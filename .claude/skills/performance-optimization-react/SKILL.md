---
name: .claude/skills/performance-optimization-react/SKILL.md
description: |
  Reactアプリケーションのパフォーマンス最適化を専門とするスキル。
  ダン・アブラモフの思想に基づき、測定駆動の最適化アプローチを提供します。
  
  📖 参照書籍:
  - 『High Performance Browser Networking』（Ilya Grigorik）: パフォーマンス測定
  
  📚 リソース参照:
  - `references/Level1_basics.md`: レベル1の基礎ガイド
  - `references/Level2_intermediate.md`: レベル2の実務ガイド
  - `references/Level3_advanced.md`: レベル3の応用ガイド
  - `references/Level4_expert.md`: レベル4の専門ガイド
  - `references/context-splitting.md`: Context分割戦略
  - `references/legacy-skill.md`: 旧SKILL.mdの全文
  - `references/profiler-measurement.md`: React DevTools Profiler測定方法
  - `references/re-rendering-patterns.md`: 再レンダリングパターン
  - `references/react-memo-guide.md`: React.memo活用ガイド
  - `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
  - `scripts/validate-skill.mjs`: スキル構造検証スクリプト
  - `assets/optimization-checklist.md`: 最適化チェックリスト
  
  Use proactively when handling performance optimization react tasks.
version: 1.0.0
level: 1
last_updated: 2025-12-24
references:
  - book: "High Performance Browser Networking"
    author: "Ilya Grigorik"
    concepts:
      - "パフォーマンス測定"
      - "最適化"
---

# Performance Optimization React

## 概要

Reactアプリケーションのパフォーマンス最適化を専門とするスキル。
ダン・アブラモフの思想に基づき、測定駆動の最適化アプローチを提供します。

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
- 不要な再レンダリングを検出・防止する時
- React.memoやメモ化の適用を判断する時
- React DevTools Profilerで測定する時
- Context APIのパフォーマンス問題を解決する時

### 避けるべきこと
- アンチパターンや注意点を確認せずに進めることを避ける

## コマンドリファレンス

### リソース読み取り
```bash
cat .claude/skills/performance-optimization-react/references/Level1_basics.md
cat .claude/skills/performance-optimization-react/references/Level2_intermediate.md
cat .claude/skills/performance-optimization-react/references/Level3_advanced.md
cat .claude/skills/performance-optimization-react/references/Level4_expert.md
cat .claude/skills/performance-optimization-react/references/context-splitting.md
cat .claude/skills/performance-optimization-react/references/legacy-skill.md
cat .claude/skills/performance-optimization-react/references/profiler-measurement.md
cat .claude/skills/performance-optimization-react/references/re-rendering-patterns.md
cat .claude/skills/performance-optimization-react/references/react-memo-guide.md
```

### スクリプト実行
```bash
node .claude/skills/performance-optimization-react/scripts/log_usage.mjs --help
node .claude/skills/performance-optimization-react/scripts/validate-skill.mjs --help
```

### テンプレート参照
```bash
cat .claude/skills/performance-optimization-react/assets/optimization-checklist.md
```

## 変更履歴

| Version | Date | Changes |
| --- | --- | --- |
| 1.0.0 | 2025-12-24 | Spec alignment and required artifacts added |
