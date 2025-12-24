---
name: .claude/skills/eslint-configuration/SKILL.md
description: |
  ESLintルール設定とカスタマイズの専門知識。
  プロジェクト品質基準に基づくルールセット選択、パーサー設定、プラグイン統合を行います。
  使用タイミング:
  
  📖 参照書籍:
  - 『The Pragmatic Programmer』（Andrew Hunt, David Thomas）: 実践的改善
  
  📚 リソース参照:
  - `resources/Level1_basics.md`: レベル1の基礎ガイド
  - `resources/Level2_intermediate.md`: レベル2の実務ガイド
  - `resources/Level3_advanced.md`: レベル3の応用ガイド
  - `resources/Level4_expert.md`: レベル4の専門ガイド
  - `resources/legacy-skill.md`: 旧SKILL.mdの全文
  - `resources/parser-configuration.md`: parser-configuration の詳細ガイド
  - `resources/plugin-integration.md`: plugin-integration の詳細ガイド
  - `resources/rule-selection-guide.md`: rule-selection-guide のガイド
  - `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
  - `scripts/validate-config.mjs`: 設定を検証するスクリプト
  - `scripts/validate-skill.mjs`: スキル構造検証スクリプト
  - `templates/nextjs.json`: nextjs のテンプレート
  - `templates/react-typescript.json`: react-typescript のテンプレート
  - `templates/typescript-base.json`: typescript-base のテンプレート
  
  Use proactively when handling eslint configuration tasks.
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

# ESLint Configuration Skill

## 概要

ESLintルール設定とカスタマイズの専門知識。
プロジェクト品質基準に基づくルールセット選択、パーサー設定、プラグイン統合を行います。
使用タイミング:

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
- ESLint設定ファイル（.eslintrc.*）を作成・更新する時
- プロジェクトに適したルールセットを選択する時
- TypeScript/JavaScript向けパーサー設定が必要な時
- プラグイン（React、境界チェック等）を統合する時
- Prettierとの競合ルールを解決する時

### 避けるべきこと
- アンチパターンや注意点を確認せずに進めることを避ける

## コマンドリファレンス

### リソース読み取り
```bash
cat .claude/skills/eslint-configuration/resources/Level1_basics.md
cat .claude/skills/eslint-configuration/resources/Level2_intermediate.md
cat .claude/skills/eslint-configuration/resources/Level3_advanced.md
cat .claude/skills/eslint-configuration/resources/Level4_expert.md
cat .claude/skills/eslint-configuration/resources/legacy-skill.md
cat .claude/skills/eslint-configuration/resources/parser-configuration.md
cat .claude/skills/eslint-configuration/resources/plugin-integration.md
cat .claude/skills/eslint-configuration/resources/rule-selection-guide.md
```

### スクリプト実行
```bash
node .claude/skills/eslint-configuration/scripts/log_usage.mjs --help
node .claude/skills/eslint-configuration/scripts/validate-config.mjs --help
node .claude/skills/eslint-configuration/scripts/validate-skill.mjs --help
```

### テンプレート参照
```bash
cat .claude/skills/eslint-configuration/templates/nextjs.json
cat .claude/skills/eslint-configuration/templates/react-typescript.json
cat .claude/skills/eslint-configuration/templates/typescript-base.json
```

## 変更履歴

| Version | Date | Changes |
| --- | --- | --- |
| 1.0.0 | 2025-12-24 | Spec alignment and required artifacts added |
