---
name: .claude/skills/product-vision/SKILL.md
description: |
  ビジョンボード作成、OKR設定、プロダクトロードマップ策定の体系的手法。
  長期的な製品戦略を明確化し、チームとステークホルダーの方向性を
  一致させる手法を提供します。
  
  📖 参照書籍:
  - 『Inspired』（Marty Cagan）: プロダクト戦略
  
  📚 リソース参照:
  - `resources/Level1_basics.md`: レベル1の基礎ガイド
  - `resources/Level2_intermediate.md`: レベル2の実務ガイド
  - `resources/Level3_advanced.md`: レベル3の応用ガイド
  - `resources/Level4_expert.md`: レベル4の専門ガイド
  - `resources/legacy-skill.md`: 旧SKILL.mdの全文
  - `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
  - `scripts/validate-skill.mjs`: スキル構造検証スクリプト
  - `templates/okr-template.md`: OKR (Objectives and Key Results) テンプレート
  - `resources/requirements-index.md`: 要求仕様の索引（docs/00-requirements と同期）
  
  Use proactively when handling product vision tasks.
version: 1.0.0
level: 1
last_updated: 2025-12-24
references:
  - book: "Inspired"
    author: "Marty Cagan"
    concepts:
      - "プロダクト戦略"
      - "ロードマップ"
---

# プロダクトビジョンスキル

## 概要

ビジョンボード作成、OKR設定、プロダクトロードマップ策定の体系的手法。
長期的な製品戦略を明確化し、チームとステークホルダーの方向性を
一致させる手法を提供します。

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
- resources/Level1_basics.md を参照し、適用範囲を明確にする
- resources/Level2_intermediate.md を参照し、実務手順を整理する

### 避けるべきこと
- アンチパターンや注意点を確認せずに進めることを避ける

## コマンドリファレンス

### リソース読み取り
```bash
cat .claude/skills/product-vision/resources/Level1_basics.md
cat .claude/skills/product-vision/resources/Level2_intermediate.md
cat .claude/skills/product-vision/resources/Level3_advanced.md
cat .claude/skills/product-vision/resources/Level4_expert.md
cat .claude/skills/product-vision/resources/legacy-skill.md
```

### スクリプト実行
```bash
node .claude/skills/product-vision/scripts/log_usage.mjs --help
node .claude/skills/product-vision/scripts/validate-skill.mjs --help
```

### テンプレート参照
```bash
cat .claude/skills/product-vision/templates/okr-template.md
```

## 変更履歴

| Version | Date | Changes |
| --- | --- | --- |
| 1.0.0 | 2025-12-24 | Spec alignment and required artifacts added |
