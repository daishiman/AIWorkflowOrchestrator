# 18.4.5 description フィールドの詳細記述規則

**出典**: `docs/00-requirements/18-agents.md` の 18.4.5

## 目次

- [記述形式](#記述形式)
- [記述の原則](#記述の原則)
- [構成要素](#構成要素)
- [完全な例1: meta-agent-designer](#完全な例1-meta-agent-designer)
- [完全な例2: データベース設計エージェント（仮想）](#完全な例2-データベース設計エージェント仮想)
- [禁止事項](#禁止事項)
- [検証チェックリスト](#検証チェックリスト)

## 記述形式

```yaml
description: |
  {{エージェントの目的と専門分野（2-3行）}}

  モデル人物: {{実在する専門家名}} - {{専門分野}}

  📚 依存スキル ({{N}}個):
  このエージェントは以下のスキルを読み込んでタスクを実行します:

  - `.claude/skills/{{skill-name}}/SKILL.md`: {{スキルの用途（20-40文字）}}

  Use proactively when {{英語での発動条件}}
```

## 記述の原則

| 原則                   | 説明                                                       |
| ---------------------- | ---------------------------------------------------------- |
| 簡潔性                 | 目的説明は2-3行、依存スキル一覧はパスと用途のみ            |
| SKILL.mdへの参照のみ   | スキルの相対パスと用途のみ記述                             |
| 内部詳細は不要         | スクリプト、リソース、テンプレートの情報は記述しない       |
| Progressive Disclosure | スキル内部の詳細はSKILL.mdを読めば分かるため、ここでは不要 |
| 最大1024文字           | description の文字数制限を遵守                             |

## 構成要素

### 1. エージェントの目的と専門分野（2-3行）

| ガイドライン   | 説明                               |
| -------------- | ---------------------------------- |
| 2-3行で簡潔に  | 長すぎる説明は避ける               |
| 何をするか明確 | エージェントの主要機能を簡潔に記述 |
| 専門分野を明記 | どの分野に特化しているかを明記     |

#### 例

```yaml
description: |
  Claude Codeエージェントの設計・作成を専門とするメタエージェント。
  エージェント設計理論とシステム思考に基づき、単一責任原則を遵守した高品質なエージェントを設計します。
```

### 2. モデル人物

| ガイドライン   | 説明                                       |
| -------------- | ------------------------------------------ |
| 1行で簡潔に    | `モデル人物: {{名前}} - {{専門分野}}` 形式 |
| 実在する専門家 | 架空の人物ではなく実在する専門家を選ぶ     |
| 専門分野を明記 | エージェントの責務と一致する専門分野       |

#### 例

```yaml
モデル人物: マービン・ミンスキー - 人工知能の父、マルチエージェントシステム理論の提唱者
```

```yaml
モデル人物: Robert C. Martin (Uncle Bob) - ソフトウェア設計原則の提唱者、クリーンアーキテクチャの著者
```

```yaml
モデル人物: Donald Knuth - アルゴリズムの権威、文芸的プログラミングの提唱者
```

### 3. 依存スキル

| ガイドライン   | 説明                                        |
| -------------- | ------------------------------------------- |
| スキル数を明記 | `📚 依存スキル ({{N}}個):` 形式             |
| 相対パス必須   | `.claude/skills/{{name}}/SKILL.md` 形式     |
| 用途を簡潔に   | 20-40文字でスキルの用途を説明               |
| 内部詳細は不要 | resources/, scripts/, templates/ は記述不要 |

#### 例

```yaml
  📚 依存スキル (12個):
  このエージェントは以下のスキルを読み込んでタスクを実行します:

  - `.claude/skills/agent-architecture-patterns/SKILL.md`: アーキテクチャパターン選択と設計原則
  - `.claude/skills/agent-structure-design/SKILL.md`: YAML Frontmatter・ワークフロー設計
  - `.claude/skills/agent-persona-design/SKILL.md`: ペルソナ・役割定義
  - `.claude/skills/tool-permission-management/SKILL.md`: ツール権限・パス制限設定
  - `.claude/skills/agent-dependency-design/SKILL.md`: 依存関係・ハンドオフ設計
  - `.claude/skills/multi-agent-systems/SKILL.md`: マルチエージェント協調パターン
  - `.claude/skills/project-architecture-integration/SKILL.md`: プロジェクト固有要件統合
  - `.claude/skills/agent-quality-standards/SKILL.md`: 品質基準・メトリクス設定
  - `.claude/skills/agent-validation-testing/SKILL.md`: 構文検証・テストケース作成
  - `.claude/skills/agent-template-patterns/SKILL.md`: テンプレートパターン適用
  - `.claude/skills/prompt-engineering-for-agents/SKILL.md`: System Prompt最適化
  - `.claude/skills/agent-lifecycle-management/SKILL.md`: ライフサイクル・バージョン管理
```

### 4. 発動条件（英語）

| ガイドライン       | 説明                               |
| ------------------ | ---------------------------------- |
| 英語で記述         | `Use proactively when` で開始      |
| 具体的なキーワード | エージェントが活躍する状況を明確に |
| 簡潔に             | 1-2文程度                          |

#### 例

```yaml
Use proactively when tasks relate to creating, improving, or designing Claude Code agents
```

```yaml
Use proactively when tasks involve database schema design, normalization, or query optimization
```

```yaml
Use proactively when tasks require React component design, state management, or frontend architecture
```

## 完全な例1: meta-agent-designer

```yaml
---
name: meta-agent-designer
description: |
  Claude Codeエージェントの設計・作成を専門とするメタエージェント。
  エージェント設計理論とシステム思考に基づき、単一責任原則を遵守した高品質なエージェントを設計します。

  モデル人物: マービン・ミンスキー - 人工知能の父、マルチエージェントシステム理論の提唱者

  📚 依存スキル (12個):
  このエージェントは以下のスキルを読み込んでタスクを実行します:

  - `.claude/skills/agent-architecture-patterns/SKILL.md`: アーキテクチャパターン選択と設計原則
  - `.claude/skills/agent-structure-design/SKILL.md`: YAML Frontmatter・ワークフロー設計
  - `.claude/skills/agent-persona-design/SKILL.md`: ペルソナ・役割定義
  - `.claude/skills/tool-permission-management/SKILL.md`: ツール権限・パス制限設定
  - `.claude/skills/agent-dependency-design/SKILL.md`: 依存関係・ハンドオフ設計
  - `.claude/skills/multi-agent-systems/SKILL.md`: マルチエージェント協調パターン
  - `.claude/skills/project-architecture-integration/SKILL.md`: プロジェクト固有要件統合
  - `.claude/skills/agent-quality-standards/SKILL.md`: 品質基準・メトリクス設定
  - `.claude/skills/agent-validation-testing/SKILL.md`: 構文検証・テストケース作成
  - `.claude/skills/agent-template-patterns/SKILL.md`: テンプレートパターン適用
  - `.claude/skills/prompt-engineering-for-agents/SKILL.md`: System Prompt最適化
  - `.claude/skills/agent-lifecycle-management/SKILL.md`: ライフサイクル・バージョン管理

  Use proactively when tasks relate to creating, improving, or designing Claude Code agents
tools:
  - Read
  - Write
  - Grep
model: opus
---
```

## 完全な例2: データベース設計エージェント（仮想）

```yaml
---
name: database-architect
description: |
  データベース設計とスキーマ最適化を専門とするエージェント。
  正規化理論とパフォーマンス最適化のバランスを取りながら、拡張性の高いデータベース設計を実現します。

  モデル人物: C.J. Date - リレーショナルデータベース理論の権威、データベース正規化の専門家

  📚 依存スキル (6個):
  このエージェントは以下のスキルを読み込んでタスクを実行します:

  - `.claude/skills/database-normalization/SKILL.md`: 正規化理論と実践
  - `.claude/skills/indexing-strategies/SKILL.md`: インデックス設計と最適化
  - `.claude/skills/query-optimization/SKILL.md`: クエリパフォーマンス最適化
  - `.claude/skills/transaction-management/SKILL.md`: トランザクション設計
  - `.claude/skills/foreign-key-constraints/SKILL.md`: 参照整合性設計
  - `.claude/skills/connection-pooling/SKILL.md`: コネクション管理

  Use proactively when tasks involve database schema design, normalization, or query optimization
tools:
  - Read
  - Write
  - Bash
model: sonnet
---
```

## 禁止事項

| 禁止事項                           | 理由                                     |
| ---------------------------------- | ---------------------------------------- |
| スキルの内部詳細を記述             | Progressive Disclosureの原則に反する     |
| resources/, scripts/ の列挙        | description が肥大化し、1024文字を超える |
| スキルの用途説明が長すぎる         | 20-40文字を目安に簡潔に                  |
| 複数の専門分野をモデル人物に含める | 単一責任原則に反する                     |
| 日本語で発動条件を記述             | 英語で記述する（Use proactively when）   |

## 検証チェックリスト

- [ ] エージェントの目的と専門分野が2-3行で簡潔に記述されている
- [ ] モデル人物が1行で記述されている（`モデル人物: {{名前}} - {{専門分野}}`形式）
- [ ] 依存スキル数が明記されている（`📚 依存スキル ({{N}}個):`）
- [ ] 依存スキルが相対パス形式で記述されている（`.claude/skills/{{name}}/SKILL.md`）
- [ ] 各スキルの用途が20-40文字で簡潔に記述されている
- [ ] スキルの内部詳細（resources/, scripts/, templates/）が記述されていない
- [ ] 発動条件が英語で記述されている（`Use proactively when`で開始）
- [ ] 全体の文字数が1024文字以内である
- [ ] モデル人物が実在する専門家である
- [ ] モデル人物の専門分野がエージェントの責務と一致している
