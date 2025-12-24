---
name: .claude/skills/error-handling-pages/SKILL.md
description: |
  Next.js App Routerのエラーハンドリングを専門とするスキル。
  error.tsx、not-found.tsx、global-error.tsxを使用したエラー境界とリカバリーを実現します。
  専門分野:
  
  📖 参照書籍:
  - 『The Pragmatic Programmer』（Andrew Hunt, David Thomas）: 実践的改善
  
  📚 リソース参照:
  - `resources/Level1_basics.md`: レベル1の基礎ガイド
  - `resources/Level2_intermediate.md`: レベル2の実務ガイド
  - `resources/Level3_advanced.md`: レベル3の応用ガイド
  - `resources/Level4_expert.md`: レベル4の専門ガイド
  - `resources/error-tsx-guide.md`: error-tsx-guide のガイド
  - `resources/global-error-guide.md`: global-error-guide のガイド
  - `resources/legacy-skill.md`: 旧SKILL.mdの全文
  - `resources/loading-tsx-guide.md`: loading-tsx-guide のガイド
  - `resources/not-found-guide.md`: not-found-guide のガイド
  - `scripts/check-error-handling.mjs`: errorhandlingを検証するスクリプト
  - `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
  - `scripts/validate-skill.mjs`: スキル構造検証スクリプト
  - `templates/error-page-template.md`: error-page-template のテンプレート
  - `templates/not-found-template.md`: not-found-template のテンプレート
  - `resources/requirements-index.md`: 要求仕様の索引（docs/00-requirements と同期）
  
  Use proactively when handling error handling pages tasks.
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

# Error Handling Pages

## 概要

Next.js App Routerのエラーハンドリングを専門とするスキル。
error.tsx、not-found.tsx、global-error.tsxを使用したエラー境界とリカバリーを実現します。
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
- エラーページを実装する時
- 404ページをカスタマイズする時
- グローバルエラーハンドリングを設定する時
- ローディング状態を実装する時

### 避けるべきこと
- アンチパターンや注意点を確認せずに進めることを避ける

## コマンドリファレンス

### リソース読み取り
```bash
cat .claude/skills/error-handling-pages/resources/Level1_basics.md
cat .claude/skills/error-handling-pages/resources/Level2_intermediate.md
cat .claude/skills/error-handling-pages/resources/Level3_advanced.md
cat .claude/skills/error-handling-pages/resources/Level4_expert.md
cat .claude/skills/error-handling-pages/resources/error-tsx-guide.md
cat .claude/skills/error-handling-pages/resources/global-error-guide.md
cat .claude/skills/error-handling-pages/resources/legacy-skill.md
cat .claude/skills/error-handling-pages/resources/loading-tsx-guide.md
cat .claude/skills/error-handling-pages/resources/not-found-guide.md
```

### スクリプト実行
```bash
node .claude/skills/error-handling-pages/scripts/check-error-handling.mjs --help
node .claude/skills/error-handling-pages/scripts/log_usage.mjs --help
node .claude/skills/error-handling-pages/scripts/validate-skill.mjs --help
```

### テンプレート参照
```bash
cat .claude/skills/error-handling-pages/templates/error-page-template.md
cat .claude/skills/error-handling-pages/templates/not-found-template.md
```

## 変更履歴

| Version | Date | Changes |
| --- | --- | --- |
| 1.0.0 | 2025-12-24 | Spec alignment and required artifacts added |
