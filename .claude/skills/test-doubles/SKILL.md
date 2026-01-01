---
name: test-doubles
description: |
  テストダブル（Mock、Stub、Fake、Spy）の適切な使い分けを専門とするスキル。
  依存関係の分離、テスト検証戦略の選択に関する包括的なガイダンスを提供します。

  Anchors:
  • 『Test-Driven Development: By Example』（Kent Beck）/ 適用: テスト駆動開発 / 目的: テストダブル選択基準
  • 『Growing Object-Oriented Software, Guided by Tests』（Steve Freeman、Nat Pryce）/ 適用: モック設計 / 目的: オブジェクト指向テスト

  Trigger:
  テストダブル実装、モック・スタブ作成、テスト分離設計時に使用

allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
---

# Test Doubles

## 概要

テストダブル（Mock、Stub、Fake、Spy）の適切な使い分けを専門とするスキル。本スキルは、単体テストの設計と実装、外部依存性の分離、テスト検証戦略の選択に関する包括的なガイダンスを提供します。

テストダブルは、テスト対象システム（SUT）の依存性を置き換えるシミュレーションオブジェクトです。適切に選択・実装することで、テストの独立性、実行速度、保守性が向上します。

各レベルのリソースガイドに従うことで、基礎的な知識から専門的な実装パターンまでを習得できます。

## ワークフロー

### Phase 1: 目的と前提の整理

**目的**: タスクの目的と前提条件を明確にする

**アクション**:

1. `references/Level1_basics.md` を確認し、テストダブルの種類を把握
2. `references/types-overview.md` で各タイプの特性を確認
3. 必要なパターンリソース（Mock/Stub/Fake）を特定

### Phase 2: スキル適用

**目的**: テストダブルの実装と検証戦略の構築

**アクション**:

1. `references/Level2_intermediate.md` の実務ガイドを参照
2. 適切なパターンリソースを参照しながら実装
3. `references/verification-strategies.md` で検証方法を確認
4. `assets/test-double-selection.md` テンプレートで実装計画を作成

### Phase 3: 検証と記録

**目的**: 成果物の検証と実行記録の保存

**アクション**:

1. `scripts/validate-skill.mjs` でスキル構造を確認
2. `scripts/test-double-analyzer.mjs` で実装品質を分析
3. 成果物がテストダブルの選択基準に合致するか確認
4. `scripts/log_usage.mjs` を実行して記録を残す

## Task仕様ナビ

| 作業内容                 | 推奨リソース                                                                                          | スクリプト                 | レベル |
| ------------------------ | ----------------------------------------------------------------------------------------------------- | -------------------------- | ------ |
| テストダブルの種類を学ぶ | `references/Level1_basics.md`<br>`references/types-overview.md`                                       | `validate-skill.mjs`       | 1      |
| 実装パターンを習得       | `references/Level2_intermediate.md`<br>`references/mock-patterns.md`<br>`references/stub-patterns.md` | `test-double-analyzer.mjs` | 2      |
| 高度な検証戦略           | `references/Level3_advanced.md`<br>`references/verification-strategies.md`                            | `test-double-analyzer.mjs` | 3      |
| 専門的な実装パターン     | `references/Level4_expert.md`<br>`references/fake-patterns.md`                                        | `test-double-analyzer.mjs` | 4      |
| 実装計画を作成           | `assets/test-double-selection.md` テンプレート                                                        | -                          | 1-2    |
| 使用状況を記録           | -                                                                                                     | `log_usage.mjs`            | -      |

## ベストプラクティス

### すべきこと

- テストダブルを選択する前に`references/types-overview.md`でそれぞれの特性を確認する
- `references/Level2_intermediate.md`に基づいて、タスクの文脈に最適なパターンを選択する
- `references/verification-strategies.md`で検証戦略を確認してから実装を開始する
- テンプレート`assets/test-double-selection.md`を使用して実装計画を文書化する
- 複数のパターンが候補になる場合は、`references/Level3_advanced.md`のトレードオフ分析を参照する
- スクリプト`test-double-analyzer.mjs`で実装品質を定期的に確認する

### 避けるべきこと

- 依存関係の性質を理解せずにモックを選択しない
- テストの読みやすさよりも実装の簡単さを優先しない
- 複数の責務を持つテストダブルを作成しない
- スパイの使用の正当性を確認せずにメソッド呼び出しを検証しない
- テストダブルの過度な使用により、実装の複雑さを増すことを避ける
- アンチパターンや注意点を確認せずに進めることを避ける

## リソース参照

### リソースドキュメント

- **`references/Level1_basics.md`**: テストダブルの基礎概念と種類（Mock、Stub、Fake、Spy）
- **`references/Level2_intermediate.md`**: 実務的な実装ガイドと選択基準
- **`references/Level3_advanced.md`**: 複雑なシナリオと高度なパターン
- **`references/Level4_expert.md`**: 専門的な実装とベストプラクティス
- **`references/types-overview.md`**: 各テストダブルタイプの特性比較表
- **`references/mock-patterns.md`**: Mockの実装パターンと具体例
- **`references/stub-patterns.md`**: Stubの実装パターンと具体例
- **`references/fake-patterns.md`**: Fakeの実装パターンと具体例
- **`references/verification-strategies.md`**: 検証方法とベストプラクティス
- **`references/legacy-skill.md`**: 旧スキル定義の参考資料

### スクリプト

- **`scripts/log_usage.mjs`**: スキル使用状況の記録と自動評価
- **`scripts/test-double-analyzer.mjs`**: テストダブル実装の品質分析
- **`scripts/validate-skill.mjs`**: スキル構造の検証

### テンプレート・アセット

- **`assets/test-double-selection.md`**: テストダブル選択と実装計画テンプレート

### コマンド例

```bash
# リソース確認
cat .claude/skills/test-doubles/references/Level1_basics.md
cat .claude/skills/test-doubles/references/types-overview.md

# スクリプト実行
node .claude/skills/test-doubles/scripts/validate-skill.mjs
node .claude/skills/test-doubles/scripts/test-double-analyzer.mjs --help
node .claude/skills/test-doubles/scripts/log_usage.mjs --help

# テンプレート確認
cat .claude/skills/test-doubles/assets/test-double-selection.md
```

## 変更履歴

| Version | Date       | Changes                                                            |
| ------- | ---------- | ------------------------------------------------------------------ |
| 1.1.0   | 2025-12-31 | 18-skills.md仕様準拠、Task仕様ナビ追加、リソース参照セクション整理 |
| 1.0.0   | 2025-12-24 | Spec alignment and required artifacts added                        |
