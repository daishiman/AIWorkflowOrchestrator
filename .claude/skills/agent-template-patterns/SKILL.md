---
name: agent-template-patterns
description: |
  エージェントテンプレートと設計パターンを専門とするスキル。
  4タイプのエージェントテンプレート（分析、実装、オーケストレーター、デプロイ）、
  {{variable}}形式による抽象化、抽象度バランス、概念要素設計の原則を提供。

  📚 リソース参照:
  このスキルには以下のリソースが含まれています。
  必要に応じて該当するリソースを参照してください:

  - `.claude/skills/agent-template-patterns/resources/template-variable-guide.md`: 変数化ガイド（{{variable}}形式の設計と使用法）
  - `.claude/skills/agent-template-patterns/resources/template-reference-guide.md`: テンプレート参照ガイド（11個のテンプレート一覧とPhase別活用法）
  - `.claude/skills/agent-template-patterns/templates/unified-agent-template.md`: 統一エージェントテンプレート
  - `.claude/skills/agent-template-patterns/templates/analyzer-agent-template.md`: 分析・レビューエージェントテンプレート
  - `.claude/skills/agent-template-patterns/templates/implementer-agent-template.md`: 実装・生成エージェントテンプレート
  - `.claude/skills/agent-template-patterns/templates/orchestrator-agent-template.md`: オーケストレーターエージェントテンプレート
  - `.claude/skills/agent-template-patterns/templates/deployer-agent-template.md`: デプロイ・運用エージェントテンプレート

  使用タイミング:
  - 新しいエージェントタイプのテンプレートを作成する時
  - 既存エージェントを汎用化する時
  - エージェント量産のための標準化が必要な時
  - 抽象度のバランスを最適化する時
  - 変数化によるテンプレートの再利用性を高める時

  関連スキル:
  - `.claude/skills/agent-structure-design/SKILL.md` - YAML Frontmatter・ワークフロー設計
  - `.claude/skills/agent-architecture-patterns/SKILL.md` - アーキテクチャパターン選択
  - `.claude/skills/agent-persona-design/SKILL.md` - ペルソナ・役割定義

  Use proactively when creating reusable agent templates,
  standardizing agent patterns, or optimizing abstraction levels.

version: 1.0.0
---

# Agent Template Patterns

## 概要

このスキルは、再利用可能なエージェントテンプレートと設計パターンのガイドラインを提供します。

**主要な価値**:

- テンプレートにより、新規エージェント作成が効率化
- 変数化により、汎用性と再利用性が向上
- 適切な抽象度により、柔軟性と明確性が両立
- 概念要素により、AI が状況に応じた最適解を選択可能

## リソース構造

```
agent-template-patterns/
├── SKILL.md
├── resources/
│   ├── template-types.md
│   ├── variable-design-guide.md
│   └── abstraction-principles.md
└── templates/
    ├── analyzer-agent-template.md
    ├── implementer-agent-template.md
    ├── orchestrator-agent-template.md
    └── deployer-agent-template.md
```

## ワークフロー

### Phase 1: テンプレートタイプの選択

**4つのエージェントテンプレート**:

#### 1. 分析・レビューエージェント

**ツール**: `[Read, Grep]`
**ワークフロー**: 分析 → チェック → レポート生成
**成果物**: レポートMarkdown

**適用条件**:

- コードレビュー
- セキュリティ監査
- 品質評価

#### 2. 実装・生成エージェント

**ツール**: `[Read, Write, Edit, Grep]`
**ワークフロー**: 要件理解 → 設計 → 実装 → テスト → 検証
**成果物**: 実装コード、テストコード

**適用条件**:

- 機能実装
- ファイル生成
- コード変換

#### 3. オーケストレーターエージェント

**ツール**: `[Task, Read]`
**ワークフロー**: 計画 → 委譲 → 進捗管理 → 統合 → 検証
**成果物**: 統合レポート、進捗トラッキング

**適用条件**:

- 複雑タスクの統括
- マルチエージェント調整
- プロジェクト管理

#### 4. デプロイ・運用エージェント

**ツール**: `[Bash, Read, Write, Edit, Task]`
**ワークフロー**: 準備 → 検証 → 実行 → ヘルスチェック → ロールバック（必要時）
**成果物**: デプロイログ、ステータスレポート

**適用条件**:

- CI/CDパイプライン
- インフラ管理
- 運用自動化

**リソース**: `resources/template-types.md`

### Phase 2: 変数化と汎用化

**目的**: テンプレートを変数化して再利用可能にする

**変数化の原則**:

#### 変数命名規則

**形式**: `{{variable-name}}`
**例**: `{{agent-name}}`, `{{tool-list}}`, `{{phase-1-objective}}`

#### 変数の種類

**メタデータ変数**:

- `{{agent-name}}`: エージェント名（kebab-case）
- `{{description-line-1}}`: description第1行
- `{{tool-list}}`: ツールのリスト
- `{{model-choice}}`: モデル選択（opus/sonnet/haiku）
- `{{version}}`: バージョン番号

**セクション変数**:

- `{{専門分野1名}}`: 専門分野の名前
- `{{専門分野1の詳細説明}}`: 詳細
- `{{責任1}}`, `{{責任2}}`: 責任範囲
- `{{制約1}}`, `{{制約2}}`: 制約

**ワークフロー変数**:

- `{{Phase1名}}`, `{{Phase1の目的}}`: Phase情報
- `{{ステップ1-1}}`: ステップ内容
- `{{判断基準1-1}}`: 判断基準

**リソース**: `resources/variable-design-guide.md`

### Phase 3: 抽象度のバランス

**目的**: 具体性と抽象性の最適なバランスを実現

**3つの抽象度レベル**:

#### 過度に具体的（避けるべき）

**特徴**:

- 特定のコード例を大量に列挙
- 固定的な実装パターンの提示
- 技術的制約の過度な限定

**影響**: AI が例に固定され、柔軟性が低下

#### 適切な抽象度（推奨）

**特徴**:

- 判断基準のチェックリスト形式
- 原則と制約の明確な記述
- 設計目標と品質基準の提示
- 選択肢と判断フローの提供

**影響**: AI が状況に応じて最適な実装を選択可能

#### 過度に抽象的（避けるべき）

**特徴**:

- 曖昧な指示（「良いコードを書くこと」）
- 測定不可能な基準
- 判断根拠の欠如

**影響**: 判断基準が不明確、一貫性が保てない

**リソース**: `resources/abstraction-principles.md`

### Phase 4: 概念要素の記述

**目的**: AI が適応的に動作できる概念要素を設計

**4つの原則**:

#### 1. 原則ベースの記述

- 具体的な実装ではなく、守るべき原則を記述
- 技術選択の判断基準を提供
- 複数の実装パターンに適用可能な抽象度

**例**:

```markdown
データ検証の原則:

- 型の正確性: 期待される型システムとの整合性
- 範囲の妥当性: ドメイン制約との一致
- 必須項目の存在: 必須フィールドの完全性
```

#### 2. 階層的な判断基準

- レベル1（必須）: 守らなければならない原則
- レベル2（推奨）: より良い実装のためのガイドライン
- レベル3（オプション）: 状況に応じた最適化

#### 3. 検証可能性

- 原則の適用結果が測定可能
- チェックリストによる自己評価
- 品質メトリクスとの対応

#### 4. コンテキスト適応性

- プロジェクト固有の要件への参照
- 技術スタックに依存しない記述
- AI が状況に応じて最適解を選択できる余地

**リソース**: `resources/abstraction-principles.md`

## ベストプラクティス

### すべきこと

1. **テンプレート選択**:
   - エージェントタイプに応じた適切なテンプレート選択
   - 4つの標準テンプレートから開始

2. **変数の一貫性**:
   - 命名規則の統一（kebab-case、{{variable}}形式）
   - 変数の説明を明確に

3. **適切な抽象度**:
   - 原則ベースの記述
   - チェックリスト形式の判断基準
   - 検証可能な品質基準

### 避けるべきこと

1. **過度な具体化**:
   - ❌ 大量のコード例
   - ✅ 原則と判断基準

2. **過度な抽象化**:
   - ❌ 曖昧な指示
   - ✅ 測定可能な基準

3. **非標準の変数**:
   - ❌ 独自の命名規則
   - ✅ {{variable}}形式の統一

## トラブルシューティング

### 問題1: テンプレートが特定のケースにしか適用できない

**症状**: 汎用性が低い

**原因**: 過度に具体的

**解決策**:

1. 変数化を進める
2. 原則ベースに書き直す
3. 抽象度を上げる

### 問題2: テンプレートが曖昧すぎる

**症状**: AI が適切な判断をできない

**原因**: 過度に抽象的

**解決策**:

1. 判断基準を追加
2. チェックリスト化
3. 具体例を2-3個追加

## 関連スキル

- **agent-structure-design** (`.claude/skills/agent-structure-design/SKILL.md`): 構造設計
- **agent-architecture-patterns** (`.claude/skills/agent-architecture-patterns/SKILL.md`): アーキテクチャパターン
- **progressive-disclosure** (`.claude/skills/progressive-disclosure/SKILL.md`): トークン効率化

## 詳細リファレンス

詳細な実装ガイドとツールは以下を参照:

- テンプレート変数ガイド (`resources/template-variable-guide.md`)

## コマンドリファレンス

このスキルで使用可能なリソース、スクリプト、テンプレートへのアクセスコマンド:

### リソース読み取り

```bash
# テンプレート変数ガイド
cat .claude/skills/agent-template-patterns/resources/template-variable-guide.md
```

### テンプレート参照

```bash
# 統一エージェントテンプレートを読み取る
cat .claude/skills/agent-template-patterns/templates/unified-agent-template.md

# テンプレートをコピーして新規エージェントを作成
cp .claude/skills/agent-template-patterns/templates/unified-agent-template.md .claude/agents/new-agent.md
```

### 他のスキルのスクリプトを活用

```bash
# エージェント構造検証（agent-structure-designスキルのスクリプトを使用）
node .claude/skills/agent-structure-design/scripts/validate-structure.mjs <agent_file.md>

# 循環依存チェック（agent-dependency-designスキルのスクリプトを使用）
node .claude/skills/agent-dependency-design/scripts/check-circular-deps.mjs <agent_file.md>

# アーキテクチャ検証（agent-architecture-patternsスキルのスクリプトを使用）
node .claude/skills/agent-architecture-patterns/scripts/validate-architecture.mjs <agent_file.md>
```

## メトリクス

### テンプレート再利用率

**目標**: >70%のエージェントがテンプレートベース

### 抽象度スコア

**評価基準**:

- 具体性: 3-5点（適度）
- 抽象性: 3-5点（適度）
- バランス: 6-10点（高い）

**目標**: バランス8点以上

## 変更履歴

| バージョン | 日付       | 変更内容                                        |
| ---------- | ---------- | ----------------------------------------------- |
| 1.0.0      | 2025-11-24 | 初版作成 - テンプレートとパターンフレームワーク |

## 使用上の注意

### このスキルが得意なこと

- 汎用エージェントテンプレートの設計
- 変数化と抽象化
- 抽象度バランスの最適化
- 概念要素の記述

### このスキルが行わないこと

- エージェントの実際の実装
- 具体的なコード生成
- プロジェクト固有のビジネスロジック
