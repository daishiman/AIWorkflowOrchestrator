---
name: .claude/skills/error-message-design/SKILL.md
description: |
  ユーザーフレンドリーなエラーメッセージの設計を専門とするスキル。
  エラーコード体系、多言語対応（i18n）、アクション指向のメッセージ設計を
  通じて、ユーザー体験を向上させます。
  
  📖 参照書籍:
  - 『The Pragmatic Programmer』（Andrew Hunt, David Thomas）: 実践的改善
  
  📚 リソース参照:
  - `resources/Level1_basics.md`: レベル1の基礎ガイド
  - `resources/Level2_intermediate.md`: レベル2の実務ガイド
  - `resources/Level3_advanced.md`: レベル3の応用ガイド
  - `resources/Level4_expert.md`: レベル4の専門ガイド
  - `resources/api-error-responses.md`: api-error-responses の詳細ガイド
  - `resources/error-code-system.md`: error-code-system の詳細ガイド
  - `resources/i18n-error-handling.md`: i18n-error-handling の詳細ガイド
  - `resources/legacy-skill.md`: 旧SKILL.mdの全文
  - `resources/user-friendly-messages.md`: user-friendly-messages の詳細ガイド
  - `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
  - `scripts/validate-error-messages.mjs`: errormessagesを検証するスクリプト
  - `scripts/validate-skill.mjs`: スキル構造検証スクリプト
  - `templates/error-system-template.ts`: error-system-template のテンプレート
  - `resources/requirements-index.md`: 要求仕様の索引（docs/00-requirements と同期）
  
  Use proactively when handling error message design tasks.
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

# Error Message Design

## 概要

ユーザーフレンドリーなエラーメッセージの設計を専門とするスキル。
エラーコード体系、多言語対応（i18n）、アクション指向のメッセージ設計を
通じて、ユーザー体験を向上させます。

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
- バリデーションエラーメッセージの設計時
- APIエラーレスポンスの設計時
- 多言語対応のエラーシステム構築時
- ユーザー向け/開発者向けエラーの分離時

### 避けるべきこと
- アンチパターンや注意点を確認せずに進めることを避ける

## コマンドリファレンス

### リソース読み取り
```bash
cat .claude/skills/error-message-design/resources/Level1_basics.md
cat .claude/skills/error-message-design/resources/Level2_intermediate.md
cat .claude/skills/error-message-design/resources/Level3_advanced.md
cat .claude/skills/error-message-design/resources/Level4_expert.md
cat .claude/skills/error-message-design/resources/api-error-responses.md
cat .claude/skills/error-message-design/resources/error-code-system.md
cat .claude/skills/error-message-design/resources/i18n-error-handling.md
cat .claude/skills/error-message-design/resources/legacy-skill.md
cat .claude/skills/error-message-design/resources/user-friendly-messages.md
```

### スクリプト実行
```bash
node .claude/skills/error-message-design/scripts/log_usage.mjs --help
node .claude/skills/error-message-design/scripts/validate-error-messages.mjs --help
node .claude/skills/error-message-design/scripts/validate-skill.mjs --help
```

### テンプレート参照
```bash
cat .claude/skills/error-message-design/templates/error-system-template.ts
```

## 変更履歴

| Version | Date | Changes |
| --- | --- | --- |
| 1.0.0 | 2025-12-24 | Spec alignment and required artifacts added |
