---
name: .claude/skills/monorepo-dependency-management/SKILL.md
description: |
  モノレポ環境での依存関係管理、ワークスペース間の整合性維持を専門とするスキル。
  pnpm workspaces、変更影響分析、パッケージ間バージョン同期の方法論を提供します。
  
  📖 参照書籍:
  - 『The Pragmatic Programmer』（Andrew Hunt, David Thomas）: 実践的改善
  
  📚 リソース参照:
  - `resources/Level1_basics.md`: レベル1の基礎ガイド
  - `resources/Level2_intermediate.md`: レベル2の実務ガイド
  - `resources/Level3_advanced.md`: レベル3の応用ガイド
  - `resources/Level4_expert.md`: レベル4の専門ガイド
  - `resources/change-impact-analysis.md`: 依存グラフ解析、影響を受けるパッケージ特定、テスト範囲決定、pnpm --filter活用
  - `resources/dependency-hoisting.md`: shamefully-hoist設定、public-hoist-pattern、ホイスティングの最適化と問題回避
  - `resources/legacy-skill.md`: 旧SKILL.mdの全文
  - `resources/pnpm-workspace-setup.md`: pnpm-workspace.yaml設定、workspace:*プロトコル、内部依存定義、モノレポ構造設計
  - `resources/version-synchronization.md`: パッケージ間バージョン整合性維持、カタログ機能活用、統一バージョン管理
  - `scripts/analyze-workspace-deps.mjs`: ワークスペース依存関係分析（循環依存検出、依存グラフ可視化、影響範囲特定）
  - `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
  - `scripts/validate-skill.mjs`: スキル構造検証スクリプト
  - `templates/monorepo-setup-checklist.md`: モノレポ初期セットアップチェックリスト（構造設計から運用まで）
  - `resources/requirements-index.md`: 要求仕様の索引（docs/00-requirements と同期）
  
  Use proactively when handling monorepo dependency management tasks.
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

# Monorepo Dependency Management

## 概要

モノレポ環境での依存関係管理、ワークスペース間の整合性維持を専門とするスキル。
pnpm workspaces、変更影響分析、パッケージ間バージョン同期の方法論を提供します。

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
- モノレポの初期セットアップを行う時
- ワークスペース間の依存関係を管理する時
- 変更の影響範囲を分析する時
- パッケージ間のバージョンを同期する時

### 避けるべきこと
- アンチパターンや注意点を確認せずに進めることを避ける

## コマンドリファレンス

### リソース読み取り
```bash
cat .claude/skills/monorepo-dependency-management/resources/Level1_basics.md
cat .claude/skills/monorepo-dependency-management/resources/Level2_intermediate.md
cat .claude/skills/monorepo-dependency-management/resources/Level3_advanced.md
cat .claude/skills/monorepo-dependency-management/resources/Level4_expert.md
cat .claude/skills/monorepo-dependency-management/resources/change-impact-analysis.md
cat .claude/skills/monorepo-dependency-management/resources/dependency-hoisting.md
cat .claude/skills/monorepo-dependency-management/resources/legacy-skill.md
cat .claude/skills/monorepo-dependency-management/resources/pnpm-workspace-setup.md
cat .claude/skills/monorepo-dependency-management/resources/version-synchronization.md
```

### スクリプト実行
```bash
node .claude/skills/monorepo-dependency-management/scripts/analyze-workspace-deps.mjs --help
node .claude/skills/monorepo-dependency-management/scripts/log_usage.mjs --help
node .claude/skills/monorepo-dependency-management/scripts/validate-skill.mjs --help
```

### テンプレート参照
```bash
cat .claude/skills/monorepo-dependency-management/templates/monorepo-setup-checklist.md
```

## 変更履歴

| Version | Date | Changes |
| --- | --- | --- |
| 1.0.0 | 2025-12-24 | Spec alignment and required artifacts added |
