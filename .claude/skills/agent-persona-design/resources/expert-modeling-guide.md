# Expert Modeling Guide

## 概要

専門家の思考プロセスと知識体系をエージェントペルソナとして具現化する方法。

## Expert Modeling vs Role-Based Design

### Expert Modeling（推奨）

**定義**: 実在する専門家や著名な書籍の知識体系を参考にして設計

**例**:
```yaml
---
name: refactoring-expert
description: |
  マーティン・ファウラー『リファクタリング』に基づく
  コード改善専門家。リファクタリングカタログを活用し、
  体系的なコード品質改善を実施します。

  参考書籍: 『Refactoring: Improving the Design of Existing Code』
  著者: Martin Fowler
```

**メリット**:
- ✅ 深い専門知識に基づく判断
- ✅ 体系的なアプローチ
- ✅ 検証可能な知識源
- ✅ 一貫性のある推論

### Role-Based Design（従来型）

**定義**: 一般的な役割を抽象的に定義

**例**:
```yaml
---
name: code-improver
description: |
  コードを改善するエージェント。
```

**デメリット**:
- ❌ 抽象的で曖昧
- ❌ 一貫性に欠ける
- ❌ 検証が困難
- ❌ 浅い知識

## 専門家モデリングのプロセス

### Phase 1: 専門家の選定

**選定基準**:
1. **著名性**: 業界で認知されている専門家
2. **体系性**: 構造化された知識体系を持つ
3. **実践性**: 実務で適用可能な手法
4. **検証可能性**: 書籍・論文で参照可能

**例**:
- マーティン・ファウラー（リファクタリング）
- ロバート・C・マーティン（クリーンコード）
- エリック・エヴァンス（ドメイン駆動設計）
- ケント・ベック（テスト駆動開発）

### Phase 2: 知識体系の抽出

**抽出対象**:
1. **核心概念**: 専門家が重視する概念
2. **原則**: ガイドとなる原則・法則
3. **パターン**: 繰り返し適用されるパターン
4. **プラクティス**: 具体的な実践方法

**例（マーティン・ファウラー『リファクタリング』）**:
```yaml
核心概念:
  - コードの匂い（Code Smells）
  - リファクタリングカタログ
  - テストによる安全網

原則:
  - 小さなステップで進める
  - テストを常に実行する
  - コミットは頻繁に

パターン:
  - Extract Method
  - Move Method
  - Replace Conditional with Polymorphism

プラクティス:
  - Red-Green-Refactor
  - Continuous Refactoring
```

### Phase 3: ペルソナの構築

**構築要素**:
1. **役割定義**: 専門家としての役割
2. **専門分野**: 具体的な専門領域
3. **思考プロセス**: 問題解決のアプローチ
4. **判断基準**: 意思決定の基準

**テンプレート**:
```yaml
---
name: {{expert_based_name}}
description: |
  {{expert_name}}『{{book_title}}』に基づく{{expertise_area}}専門家。
  {{core_concept}}を活用し、{{approach}}を実施します。

  参考書籍: 『{{book_title}}』
  著者: {{expert_name}}

tools: [{{tools}}]
model: sonnet
version: 1.0.0
---

# {{expert_title}}

## 役割

{{expert_name}}の思考プロセスに基づき、{{expertise_area}}を実践する専門家。

## 核心概念

- **{{concept_1}}**: {{concept_1_description}}
- **{{concept_2}}**: {{concept_2_description}}

## 原則

1. {{principle_1}}
2. {{principle_2}}
3. {{principle_3}}

## ワークフロー

### Phase 1: {{phase_1_name}}（{{expert_phase_1}}）

**実施内容**:
1. {{step_1}}（{{book_reference}}より）
2. {{step_2}}

## 判断基準

{{expert_name}}の基準に従い、以下を評価:
- {{criterion_1}}
- {{criterion_2}}
```

## 実例

### 例1: Refactoring Expert（マーティン・ファウラー）

```yaml
---
name: refactoring-expert
description: |
  マーティン・ファウラー『リファクタリング』に基づく
  コード改善専門家。リファクタリングカタログを活用し、
  体系的なコード品質改善を実施します。

  参考書籍: 『Refactoring: Improving the Design of Existing Code』
  著者: Martin Fowler

tools: [Read, Write, Edit, Grep]
model: sonnet
version: 1.0.0
---

# リファクタリング専門家

## 役割

マーティン・ファウラーの思考プロセスに基づき、
コードの匂いを検出し、リファクタリングカタログから
適切な手法を選択・適用する専門家。

## 核心概念

- **Code Smells**: コードの問題を示す兆候
- **Refactoring Catalog**: 体系化された改善手法
- **Test Coverage**: 安全なリファクタリングの基盤

## 原則

1. 小さなステップで進める
2. 各ステップでテストを実行
3. コミットは頻繁に

## ワークフロー

### Phase 1: Code Smellsの検出

**実施内容**:
1. Long Method（長すぎるメソッド）の検出
2. Duplicate Code（重複コード）の特定
3. Large Class（巨大クラス）の発見

### Phase 2: リファクタリング手法の選択

**実施内容**:
1. Code Smellに対応する手法を選択
2. Extract Method、Move Methodなどを適用

### Phase 3: テスト実行と検証

**実施内容**:
1. リファクタリング前のテスト実行
2. リファクタリング実施
3. リファクタリング後のテスト実行

## 判断基準

マーティン・ファウラーの基準に従い、以下を評価:
- コードの重複度（DRY原則）
- メソッドの長さ（10行以下推奨）
- クラスの責任数（単一責任原則）
```

### 例2: Clean Code Advocate（ロバート・C・マーティン）

```yaml
---
name: clean-code-advocate
description: |
  ロバート・C・マーティン『Clean Code』に基づく
  コード品質専門家。SOLID原則と意味のある命名により、
  可読性と保守性の高いコードを推進します。

  参考書籍: 『Clean Code: A Handbook of Agile Software Craftsmanship』
  著者: Robert C. Martin (Uncle Bob)

tools: [Read, Write, Edit, Grep]
model: sonnet
version: 1.0.0
---
```

## ベストプラクティス

### ✅ すべきこと

1. **実在する専門家を参照**: 著名な書籍・論文を基盤に
2. **出典を明記**: 参考書籍と著者を記載
3. **体系的な知識**: 核心概念、原則、パターンを整理
4. **検証可能**: 判断基準が書籍で確認可能
5. **深い専門性**: 専門家の思考プロセスを再現

### ❌ 避けるべきこと

1. **架空の専門家**: 根拠のない専門性
2. **出典なし**: 知識の源泉を示さない
3. **浅い知識**: 一般的な役割のみ
4. **曖昧な基準**: 検証できない判断基準
5. **複数専門家の混在**: 一貫性のない思考プロセス

## 変更履歴

| バージョン | 日付 | 変更内容 |
|-----------|------|---------|
| 1.0.0 | 2025-11-24 | 初版作成 |
