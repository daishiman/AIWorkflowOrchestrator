---
name: .claude/skills/playwright-testing/SKILL.md
description: |
  Playwrightによるブラウザ自動化テストの実装技術。
  安定した待機戦略、適切なセレクタ選択、効率的なテスト設計を提供します。
  
  📖 参照書籍:
  - 『Test-Driven Development: By Example』（Kent Beck）: Red-Green-Refactor
  
  📚 リソース参照:
  - `resources/Level1_basics.md`: レベル1の基礎ガイド
  - `resources/Level2_intermediate.md`: レベル2の実務ガイド
  - `resources/Level3_advanced.md`: レベル3の応用ガイド
  - `resources/Level4_expert.md`: レベル4の専門ガイド
  - `resources/legacy-skill.md`: 旧SKILL.mdの全文
  - `resources/playwright-best-practices.md`: Playwrightテスト設計のベストプラクティス（安定性、保守性、並列実行）
  - `resources/selector-strategies.md`: data-testid、Role-based、Label-basedセレクタの優先順位と使い分け
  - `resources/waiting-strategies.md`: 自動待機、明示的待機、条件ベース待機の使い分けとフレーキーテスト回避
  - `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
  - `scripts/validate-skill.mjs`: スキル構造検証スクリプト
  - `scripts/validate-test-structure.mjs`: Playwrightテストファイルの構造と命名規則を検証
  - `templates/test-template.ts`: Page Object Model、Fixture活用を含むPlaywrightテストのTypeScriptテンプレート
  
  Use proactively when handling playwright testing tasks.
version: 1.0.0
level: 1
last_updated: 2025-12-24
references:
  - book: "Test-Driven Development: By Example"
    author: "Kent Beck"
    concepts:
      - "Red-Green-Refactor"
      - "テスト設計"
---

# Playwright Testing Skill

## 概要

Playwrightによるブラウザ自動化テストの実装技術。
安定した待機戦略、適切なセレクタ選択、効率的なテスト設計を提供します。

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
- E2Eテストの実装が必要な時
- ブラウザ自動化テストが求められる時
- フレーキーテストの問題を解決する時
- クロスブラウザテストが必要な時
- Playwrightのセレクタ戦略を適用する時
- テスト待機戦略の最適化が必要な時

### 避けるべきこと
- アンチパターンや注意点を確認せずに進めることを避ける

## コマンドリファレンス

### リソース読み取り
```bash
cat .claude/skills/playwright-testing/resources/Level1_basics.md
cat .claude/skills/playwright-testing/resources/Level2_intermediate.md
cat .claude/skills/playwright-testing/resources/Level3_advanced.md
cat .claude/skills/playwright-testing/resources/Level4_expert.md
cat .claude/skills/playwright-testing/resources/legacy-skill.md
cat .claude/skills/playwright-testing/resources/playwright-best-practices.md
cat .claude/skills/playwright-testing/resources/selector-strategies.md
cat .claude/skills/playwright-testing/resources/waiting-strategies.md
```

### スクリプト実行
```bash
node .claude/skills/playwright-testing/scripts/log_usage.mjs --help
node .claude/skills/playwright-testing/scripts/validate-skill.mjs --help
node .claude/skills/playwright-testing/scripts/validate-test-structure.mjs --help
```

### テンプレート参照
```bash
cat .claude/skills/playwright-testing/templates/test-template.ts
```

## 変更履歴

| Version | Date | Changes |
| --- | --- | --- |
| 1.0.0 | 2025-12-24 | Spec alignment and required artifacts added |
