---
name: .claude/skills/swagger-ui/SKILL.md
description: |
  Swagger UI / ReDocなどのインタラクティブAPIドキュメントツールの設定と統合を専門とするスキル。
  
  📖 参照書籍:
  - 『RESTful Web APIs』（Leonard Richardson）: リソース設計
  
  📚 リソース参照:
  - `references/Level1_basics.md`: レベル1の基礎ガイド
  - `references/Level2_intermediate.md`: レベル2の実務ガイド
  - `references/Level3_advanced.md`: レベル3の応用ガイド
  - `references/Level4_expert.md`: レベル4の専門ガイド
  - `references/cicd-integration.md`: Cicd Integrationリソース
  - `references/legacy-skill.md`: 旧SKILL.mdの全文
  - `references/redoc-configuration.md`: Redoc Configurationリソース
  - `references/swagger-ui-configuration.md`: Swagger Ui Configurationリソース
  - `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
  - `scripts/setup-swagger-ui.sh`: Setup Swagger Uiスクリプト
  - `scripts/validate-skill.mjs`: スキル構造検証スクリプト
  - `scripts/validate-swagger-config.js`: Validate Swagger Configスクリプト
  - `assets/swagger-config.json`: Swagger Configテンプレート
  - `assets/swagger-ui-nextjs.tsx`: Swagger Ui Nextjsテンプレート
  
  Use proactively when handling swagger ui tasks.
---

# Swagger UI スキル

## 概要

Swagger UI / ReDocなどのインタラクティブAPIドキュメントツールの設定と統合を専門とするスキル。

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
- references/Level1_basics.md を参照し、適用範囲を明確にする
- references/Level2_intermediate.md を参照し、実務手順を整理する

### 避けるべきこと
- アンチパターンや注意点を確認せずに進めることを避ける

## コマンドリファレンス

### リソース読み取り
```bash
cat .claude/skills/swagger-ui/references/Level1_basics.md
cat .claude/skills/swagger-ui/references/Level2_intermediate.md
cat .claude/skills/swagger-ui/references/Level3_advanced.md
cat .claude/skills/swagger-ui/references/Level4_expert.md
cat .claude/skills/swagger-ui/references/cicd-integration.md
cat .claude/skills/swagger-ui/references/legacy-skill.md
cat .claude/skills/swagger-ui/references/redoc-configuration.md
cat .claude/skills/swagger-ui/references/swagger-ui-configuration.md
```

### スクリプト実行
```bash
node .claude/skills/swagger-ui/scripts/log_usage.mjs --help
.claude/skills/swagger-ui/scripts/setup-swagger-ui.sh
node .claude/skills/swagger-ui/scripts/validate-skill.mjs --help
.claude/skills/swagger-ui/scripts/validate-swagger-config.js
```

### テンプレート参照
```bash
cat .claude/skills/swagger-ui/assets/swagger-config.json
cat .claude/skills/swagger-ui/assets/swagger-ui-nextjs.tsx
```

## 変更履歴

| Version | Date | Changes |
| --- | --- | --- |
| 1.0.0 | 2025-12-24 | Spec alignment and required artifacts added |
