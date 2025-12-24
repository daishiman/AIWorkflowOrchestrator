---
name: .claude/skills/nextjs-app-router/SKILL.md
description: |
  Next.js App Routerのアーキテクチャと実装パターンを専門とするスキル。
  Guillermo Rauchの「Server-First」「Convention over Configuration」思想に基づき、
  高速で保守性の高いルーティング構造を設計・実装します。
  
  📖 参照書籍:
  - 『Learning React』（Alex Banks, Eve Porcello）: コンポーネント設計
  
  📚 リソース参照:
  - `resources/Level1_basics.md`: レベル1の基礎ガイド
  - `resources/Level2_intermediate.md`: レベル2の実務ガイド
  - `resources/Level3_advanced.md`: レベル3の応用ガイド
  - `resources/Level4_expert.md`: レベル4の専門ガイド
  - `resources/layout-hierarchy.md`: Layout階層設計
  - `resources/legacy-skill.md`: 旧SKILL.mdの全文
  - `resources/rendering-strategies.md`: レンダリング戦略ガイド
  - `resources/routing-patterns.md`: ルーティングパターン詳細
  - `resources/server-client-decision.md`: Server/Client Components 判断フロー
  - `scripts/analyze-routing-structure.mjs`: app/ディレクトリ構造の解析とルーティングパターン・コンポーネント分離の妥当性検証スクリプト
  - `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
  - `scripts/validate-skill.mjs`: スキル構造検証スクリプト
  - `templates/layout-template.md`: Root/Group Layoutの実装とメタデータ・フォント設定を含むlayout.tsxテンプレート
  - `templates/page-template.md`: Server/Client Components判断とデータフェッチ・動的ルートパラメータを含むpage.tsxテンプレート
  - `resources/requirements-index.md`: 要求仕様の索引（docs/00-requirements と同期）
  
  Use proactively when designing Next.js routing structures, implementing.
version: 1.0.0
level: 1
last_updated: 2025-12-24
references:
  - book: "Learning React"
    author: "Alex Banks, Eve Porcello"
    concepts:
      - "コンポーネント設計"
      - "パフォーマンス"
---

# Next.js App Router

## 概要

Next.js App Routerのアーキテクチャと実装パターンを専門とするスキル。
Guillermo Rauchの「Server-First」「Convention over Configuration」思想に基づき、
高速で保守性の高いルーティング構造を設計・実装します。

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
- Next.js App Routerのルーティング構造を設計する時
- Server ComponentsとClient Componentsの使い分けを判断する時
- 動的ルートやRoute Groupsを実装する時
- レンダリング戦略（Static/Dynamic/ISR）を選択する時

### 避けるべきこと
- アンチパターンや注意点を確認せずに進めることを避ける

## コマンドリファレンス

### リソース読み取り
```bash
cat .claude/skills/nextjs-app-router/resources/Level1_basics.md
cat .claude/skills/nextjs-app-router/resources/Level2_intermediate.md
cat .claude/skills/nextjs-app-router/resources/Level3_advanced.md
cat .claude/skills/nextjs-app-router/resources/Level4_expert.md
cat .claude/skills/nextjs-app-router/resources/layout-hierarchy.md
cat .claude/skills/nextjs-app-router/resources/legacy-skill.md
cat .claude/skills/nextjs-app-router/resources/rendering-strategies.md
cat .claude/skills/nextjs-app-router/resources/routing-patterns.md
cat .claude/skills/nextjs-app-router/resources/server-client-decision.md
```

### スクリプト実行
```bash
node .claude/skills/nextjs-app-router/scripts/analyze-routing-structure.mjs --help
node .claude/skills/nextjs-app-router/scripts/log_usage.mjs --help
node .claude/skills/nextjs-app-router/scripts/validate-skill.mjs --help
```

### テンプレート参照
```bash
cat .claude/skills/nextjs-app-router/templates/layout-template.md
cat .claude/skills/nextjs-app-router/templates/page-template.md
```

## 変更履歴

| Version | Date | Changes |
| --- | --- | --- |
| 1.0.0 | 2025-12-24 | Spec alignment and required artifacts added |
