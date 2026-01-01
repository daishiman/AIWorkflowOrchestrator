---
name: tdd-principles
description: |
  ケント・ベックが提唱したテスト駆動開発（TDD）の原則を体系化したスキル。
  テストファースト、Red-Green-Refactorサイクル、小さなステップでの開発を提供します。

  Anchors:
  • 『Test-Driven Development: By Example』（Kent Beck） / 適用: Red-Green-Refactor / 目的: テスト設計

  Trigger:
  TDD実践時、テスト駆動開発時、Red-Green-Refactorサイクル適用時に使用
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
---

# TDD Principles

## 概要

ケント・ベックが提唱したテスト駆動開発（TDD）の原則を体系化したスキル。テストファースト、Red-Green-Refactorサイクル、小さなステップでの開発を通じて、品質の高い設計を実現する方法論です。

詳細な手順や背景は `references/Level1_basics.md` と `references/Level2_intermediate.md` を参照してください。

## ワークフロー

### Phase 1: 目的と前提の整理

**目的**: タスクの目的と前提条件を明確にし、テスト戦略を立案する

**アクション**:

1. `references/Level1_basics.md` でTDDの基本概念を確認
2. `references/test-first-principles.md` でテストファースト設計を理解
3. 必要なレベルのリソース（Level2/3/4）を特定
4. `references/small-steps.md` でステップ分割戦略を検討

### Phase 2: スキル適用

**目的**: Red-Green-Refactorサイクルを実行し、テストから実装へ進める

**アクション**:

1. `references/red-green-refactor.md` でサイクルを明確にする
2. テスト設計：失敗するテストケースを記述
3. 実装：テストが成功するまでの最小限のコード
4. Refactor：`references/design-emergence.md` で設計改善を実施
5. 重要な判断点をメモとして残す

### Phase 3: 検証と記録

**目的**: 成果物の検証とTDDサイクルの実行品質を確認

**アクション**:

1. `scripts/tdd-cycle-validator.mjs` でサイクル実行の妥当性を確認
2. `scripts/validate-skill.mjs` でスキル構造を確認
3. 成果物が目的に合致するか検証
4. `scripts/log_usage.mjs` を実行して記録を残す
5. 困難な場面で `references/Level4_expert.md` の戦略を参照

## Task仕様ナビ

| Task               | Phase | 説明                         | リソース                                      |
| ------------------ | ----- | ---------------------------- | --------------------------------------------- |
| テスト設計         | 1     | テストケースの設計と要件分析 | Level1_basics.md, test-first-principles.md    |
| Red-Greenサイクル  | 2     | 失敗するテストから実装へ     | red-green-refactor.md, Level2_intermediate.md |
| Refactorリング     | 2     | コード改善と最適化           | Level3_advanced.md, design-emergence.md       |
| 小さなステップ     | 1     | インクリメンタルな開発       | small-steps.md, Level1_basics.md              |
| レガシーコード対応 | 3     | 既存コードへの適用           | legacy-code-strategies.md, Level3_advanced.md |
| サイクル検証       | 3     | TDDサイクルの妥当性確認      | tdd-cycle-validator.mjs, Level4_expert.md     |

## ベストプラクティス

### すべきこと

- **計画から開始**: `references/Level1_basics.md` を参照し、テストファースト設計の基本を明確にする
- **小さなステップ**: `references/small-steps.md` に従い、1つのテストケースずつ進める
- **Red-Greenサイクルの厳密性**: `references/red-green-refactor.md` でサイクルを正確に実行する
- **段階的レベルアップ**: Level1→Level2→Level3→Level4 の順序でスキル習得を進める
- **実務適用**: `references/Level2_intermediate.md` で実践的なテクニックを習得する
- **設計の創発**: `references/design-emergence.md` で設計がテストから自然に現れることを理解する
- **検証と記録**: `scripts/tdd-cycle-validator.mjs` で実行内容を検証し、`scripts/log_usage.mjs` で記録を残す

### 避けるべきこと

- **テストなし実装**: テストを後付けする実装は避ける（本来のTDDではない）
- **大きなステップ**: 複雑な実装を一度にしようとすることを避ける
- **アンチパターン無視**: `references/Level3_advanced.md` のアンチパターンを確認せず進めることを避ける
- **レガシーコード軽視**: 既存コードへの適用方法を無視することを避ける（`legacy-code-strategies.md` 参照）
- **Refactorの延期**: テスト成功後のRefactorリングを飛ばすことを避ける
- **単一の手法固執**: すべてのシナリオに同じ手法を適用することを避ける（`Level4_expert.md` 参照）

## リソース参照

### 学習リソース

| リソース                              | 内容                                          |
| ------------------------------------- | --------------------------------------------- |
| `references/Level1_basics.md`          | TDDの基本概念と第一原理                       |
| `references/Level2_intermediate.md`    | 実務的なテクニックと手法                      |
| `references/Level3_advanced.md`        | 応用パターンとアンチパターン                  |
| `references/Level4_expert.md`          | エキスパートレベルの戦略と最適化              |
| `references/red-green-refactor.md`     | Red-Green-Refactorサイクルの詳細              |
| `references/small-steps.md`            | インクリメンタル開発手法                      |
| `references/test-first-principles.md`  | テストファースト設計の原則                    |
| `references/design-emergence.md`       | 設計の創発と進化                              |
| `references/legacy-code-strategies.md` | レガシーコードへの適用戦略                    |
| `references/requirements-index.md`     | 要求仕様の索引（docs/00-requirements と同期） |

### スクリプト・ツール

| スクリプト                        | 用途                         |
| --------------------------------- | ---------------------------- |
| `scripts/validate-skill.mjs`      | スキル構造検証と仕様準拠確認 |
| `scripts/tdd-cycle-validator.mjs` | TDDサイクル実行の妥当性確認  |
| `scripts/log_usage.mjs`           | 使用記録・自動評価ログ出力   |

### テンプレート

| テンプレート                        | 用途                          |
| ----------------------------------- | ----------------------------- |
| `assets/tdd-session-template.md` | TDDセッション計画テンプレート |

### リソース関連コマンド

```bash
# リソース一括確認
cat .claude/skills/tdd-principles/references/Level1_basics.md
cat .claude/skills/tdd-principles/references/Level2_intermediate.md
cat .claude/skills/tdd-principles/references/Level3_advanced.md
cat .claude/skills/tdd-principles/references/Level4_expert.md
cat .claude/skills/tdd-principles/references/red-green-refactor.md
cat .claude/skills/tdd-principles/references/small-steps.md
cat .claude/skills/tdd-principles/references/test-first-principles.md
cat .claude/skills/tdd-principles/references/design-emergence.md
cat .claude/skills/tdd-principles/references/legacy-code-strategies.md

# スクリプト実行
node .claude/skills/tdd-principles/scripts/validate-skill.mjs
node .claude/skills/tdd-principles/scripts/tdd-cycle-validator.mjs --help
node .claude/skills/tdd-principles/scripts/log_usage.mjs --help

# テンプレート参照
cat .claude/skills/tdd-principles/assets/tdd-session-template.md
```

## 変更履歴

| Version | Date       | Changes                                                                                                                                              |
| ------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.1.0   | 2025-12-31 | 18-skills.md仕様へ準拠：YAML frontmatter（Trigger, allowed-tools）、Task仕様ナビ（テーブル形式）、ベストプラクティス拡充、リソース参照セクション統一 |
| 1.0.0   | 2025-12-24 | Spec alignment and required artifacts added                                                                                                          |
