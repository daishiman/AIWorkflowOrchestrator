---
name: .claude/skills/api-mocking/SKILL.md
description: |
  E2EテストにおけるAPI モック技術。
  
  📖 参照書籍:
  - 『RESTful Web APIs』（Leonard Richardson）: リソース設計
  
  📚 リソース参照:
  - `resources/Level1_basics.md`: レベル1の基礎ガイド
  - `resources/Level2_intermediate.md`: レベル2の実務ガイド
  - `resources/Level3_advanced.md`: レベル3の応用ガイド
  - `resources/Level4_expert.md`: レベル4の専門ガイド
  - `resources/legacy-skill.md`: 旧SKILL.mdの全文
  - `resources/mock-patterns.md`: APIモックパターン
  - `resources/msw-integration-guide.md`: MSW（Mock Service Worker）統合ガイド
  - `scripts/generate-mock-handlers.mjs`: MSWモックハンドラー自動生成スクリプト
  - `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
  - `scripts/validate-skill.mjs`: スキル構造検証スクリプト
  - `templates/mock-handler-template.ts`: MSWモックハンドラーテンプレート
  
  Use proactively when handling api mocking tasks.
version: 1.0.0
level: 1
last_updated: 2025-12-24
references:
  - book: "RESTful Web APIs"
    author: "Leonard Richardson"
    concepts:
      - "リソース設計"
      - "HTTP設計"
---

# API Mocking Skill

## 概要

E2EテストにおけるAPI モック技術。

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
- 外部APIへの依存を排除する必要がある時
- API エラーケース（4xx, 5xx）をテストする時
- テスト実行の安定性・速度向上が必要な時
- ネットワーク遅延をシミュレートする時
- Playwright Route Mockingを実装する時

### 避けるべきこと
- アンチパターンや注意点を確認せずに進めることを避ける

## コマンドリファレンス

### リソース読み取り
```bash
cat .claude/skills/api-mocking/resources/Level1_basics.md
cat .claude/skills/api-mocking/resources/Level2_intermediate.md
cat .claude/skills/api-mocking/resources/Level3_advanced.md
cat .claude/skills/api-mocking/resources/Level4_expert.md
cat .claude/skills/api-mocking/resources/legacy-skill.md
cat .claude/skills/api-mocking/resources/mock-patterns.md
cat .claude/skills/api-mocking/resources/msw-integration-guide.md
```

### スクリプト実行
```bash
node .claude/skills/api-mocking/scripts/generate-mock-handlers.mjs --help
node .claude/skills/api-mocking/scripts/log_usage.mjs --help
node .claude/skills/api-mocking/scripts/validate-skill.mjs --help
```

### テンプレート参照
```bash
cat .claude/skills/api-mocking/templates/mock-handler-template.ts
```

## 変更履歴

| Version | Date | Changes |
| --- | --- | --- |
| 1.0.0 | 2025-12-24 | Spec alignment and required artifacts added |
