---
name: agent-structure-design
description: |
  Claude Codeエージェントの構造設計を専門とするスキル。YAML Frontmatterの設計、
  システムプロンプト本文の必須セクション構成、5段階ワークフロー設計により、
  一貫性と完全性を持つエージェント定義ファイルを作成します。

  専門分野:
  - YAML設計: name, description, tools, model, versionの最適化
  - セクション構成: 7つの必須セクションと推奨セクションの設計
  - ワークフロー設計: Phase 1-5の段階的タスク実行フロー
  - 判断基準設計: チェックリスト形式の完了条件と品質基準

  使用タイミング:
  - 新しいエージェントのYAML Frontmatterを設計する時
  - システムプロンプト本文の構造を決定する時
  - ワークフローのPhase構成を設計する時
  - 必須セクションの内容を定義する時

  Use proactively when designing agent structure, YAML metadata,
  or multi-phase workflow definitions.
version: 1.0.0
---

# Agent Structure Design

## 概要

このスキルは、Claude Codeエージェントの構造設計に関する包括的なガイドラインを提供します。
YAML Frontmatterからシステムプロンプト本文まで、一貫性と完全性を確保します。

**主要な価値**:
- 標準化された構造により、エージェント間の一貫性が向上
- 必須セクションの明確化により、設計の漏れを防止
- 5段階ワークフローにより、タスク実行が体系化
- Progressive Disclosureにより、トークン効率が最適化

**対象ユーザー**:
- エージェントを設計する@meta-agent-designer
- 既存エージェントをリファクタリングする開発者

## リソース構造

```
agent-structure-design/
├── SKILL.md
├── resources/
│   ├── yaml-frontmatter-guide.md
│   ├── section-catalog.md
│   ├── workflow-design-patterns.md
│   └── judgment-criteria-design.md
├── scripts/
│   └── validate-agent-structure.sh
└── templates/
    ├── agent-template.md
    └── section-checklist.md
```

### リソース種別

- **YAML設計** (`resources/yaml-frontmatter-guide.md`): name, description, tools, model, versionの設計基準
- **セクションカタログ** (`resources/section-catalog.md`): 7つの必須セクション + 推奨セクション
- **ワークフローパターン** (`resources/workflow-design-patterns.md`): Phase 1-5の設計パターン
- **判断基準設計** (`resources/judgment-criteria-design.md`): チェックリストと完了条件の作成方法
- **検証スクリプト** (`scripts/validate-agent-structure.sh`): エージェント構造の妥当性検証
- **テンプレート** (`templates/`): エージェントテンプレートとチェックリスト

## コマンドリファレンス

このスキルで使用可能なリソース、スクリプト、テンプレートへのアクセスコマンド:

### リソース読み取り

```bash
# YAML Frontmatter設計ガイド
cat .claude/skills/agent-structure-design/resources/yaml-frontmatter-guide.md
```

### スクリプト実行

```bash
# エージェント構造検証スクリプト（TypeScript）
node .claude/skills/agent-structure-design/scripts/validate-structure.mjs <agent-file-path>

# 例: skill-librarianエージェントの構造を検証
node .claude/skills/agent-structure-design/scripts/validate-structure.mjs .claude/agents/skill-librarian.md

# シェルスクリプト版
bash .claude/skills/agent-structure-design/scripts/validate-structure.sh <agent-file-path>
```

### テンプレート参照

```bash
# エージェントテンプレート（完全な構造定義）
cat .claude/skills/agent-structure-design/templates/agent-template.md

# テンプレートをコピーして新規エージェントを作成
cp .claude/skills/agent-structure-design/templates/agent-template.md .claude/agents/new-agent.md
```

## いつ使うか

### シナリオ1: 新規エージェントのYAML設計
**状況**: 新しいエージェントのメタデータを定義したい

**適用条件**:
- [ ] エージェントの基本情報を設計する必要がある
- [ ] 自動起動のトリガー条件を定義したい
- [ ] ツール権限を決定したい

**期待される成果**: 完全で最適化されたYAML Frontmatter

### シナリオ2: システムプロンプト構造設計
**状況**: エージェントの動作定義を体系化したい

**適用条件**:
- [ ] 必須セクションを全て含めたい
- [ ] ワークフローを段階的に設計したい
- [ ] 一貫性のある構造を保ちたい

**期待される成果**: 7つの必須セクションを含む完全な構造

## 前提条件

### 必要な知識
- [ ] Claude Codeエージェントシステムの基本
- [ ] YAML基本文法
- [ ] Markdown構文

### 必要なツール
- Read: 既存エージェントの参照
- Write: 新規エージェントの作成

### 環境要件
- `.claude/agents/`ディレクトリが存在する

## ワークフロー

### Phase 1: YAML Frontmatter設計

**目的**: エージェントの基本メタデータを定義

**設計要素**:

#### 1. name（必須）
**命名規則**: kebab-case
**パターン**: `[domain]-[role]` または `[role]-[agent]`
**長さ**: 3-50文字
**例**: `security-auditor`, `frontend-developer`, `test-generator`

**判断基準**:
- [ ] kebab-caseに従っているか？
- [ ] 役割が明確に表現されているか？
- [ ] 他のエージェントと重複していないか？

#### 2. description（必須・最重要）
**構成要素**:
1. 主要機能（1-2文）
2. 専門分野（3-5項目）
3. 使用タイミング（3-5項目）
4. プロアクティブ指示（オプション）

**長さ**: 4-8行
**キーワード**: 自動起動のトリガーワード必須

**設計チェックリスト**:
- [ ] 行動志向の動詞を使用しているか？（分析する、設計する、実装する等）
- [ ] 具体的なトリガー条件を含むか？（「〇〇する時」）
- [ ] ドメイン/技術が明示されているか？
- [ ] Claude が検索しやすいキーワードを含むか？

**例（良い）**:
```yaml
description: |
  データベーススキーマ設計とマイグレーション管理を専門とするエージェント。

  専門分野:
  - スキーマ設計: 正規化、インデックス戦略、JSONB活用
  - マイグレーション: バージョン管理、ロールバック戦略

  使用タイミング:
  - データベーススキーマを設計する時
  - マイグレーションファイルを作成する時
  - スキーマ変更をレビューする時
```

#### 3. tools（オプション）
**選択基準**:
- 読み取り専用: `[Read, Grep, Glob]`
- 実装系: `[Read, Write, Edit, Grep]`
- オーケストレーター: `[Task, Read]`
- フル権限: `[Bash, Read, Write, Edit, Grep, Glob, Task]`

**判断フロー**:
```
エージェントの役割は？
├─ 分析・レビュー → [Read, Grep]
├─ 実装・生成 → [Read, Write, Edit, Grep]
├─ 委譲・調整 → [Task, Read]
└─ デプロイ・管理 → [Bash, Read, Write, Edit, Task]
```

**判断基準**:
- [ ] 必要最小限のツールのみ選択されているか？
- [ ] ツール権限が役割に適合しているか？
- [ ] セキュリティリスクが考慮されているか？

#### 4. model（オプション）
**選択基準**:
- `opus`: 高度な推論、アーキテクチャ設計、複雑な分析
- `sonnet`: 一般的な実装、バランス型（デフォルト推奨）
- `haiku`: シンプルな検証、高速処理

**判断基準**:
- [ ] タスクの複雑度に適合しているか？
- [ ] コストと性能のバランスが適切か？

#### 5. version（オプション）
**形式**: セマンティックバージョニング（major.minor.patch）
**初版**: 1.0.0
**更新**: major（破壊的変更）, minor（機能追加）, patch（バグ修正）

**リソース**: `resources/yaml-frontmatter-guide.md`

### Phase 2: 必須セクション構成

**目的**: システムプロンプト本文の7つの必須セクションを設計

**7つの必須セクション**:

#### セクション1: 役割定義
**内容**:
- 「あなたは○○です」から始める
- 専門分野の列挙（3-5項目）
- 責任範囲の明確化
- 制約（しないこと）の列挙

**テンプレート**:
```markdown
## 役割定義

あなたは **[エージェント名]** です。

専門分野:
- **[分野1]**: [詳細]
- **[分野2]**: [詳細]
- **[分野3]**: [詳細]

責任範囲:
- [責任1]
- [責任2]
- [責任3]

制約:
- [制約1]（しないこと）
- [制約2]（しないこと）
- [制約3]（しないこと）
```

#### セクション2: 専門家の思想と哲学（専門家モデルの場合）
**内容**:
- ベースとなる人物の経歴・業績
- 思想の基盤となる書籍（1-3冊）
- 各書籍の核心概念（3-5項目）
- エージェントへの適用方法
- 設計原則（3-5項目）

**このセクションは専門家モデルベース設計の場合のみ必須**

#### セクション3: 専門知識
**内容**:
- 知識領域ごとにセクション分割
- スキル参照の具体的な`cat`コマンド記述
- 判断基準・チェックリストの提供
- プロジェクト固有ドキュメントへの参照

**テンプレート**:
```markdown
## 専門知識

### 知識領域1: [領域名]

[領域の概要]

**参照スキル**:
\```bash
cat .claude/skills/[skill-name]/SKILL.md
\```

**判断基準**:
- [ ] [基準1]
- [ ] [基準2]
```

#### セクション4: タスク実行時の動作
**内容**:
- Phase 1-5の段階的ワークフロー
- 各Phaseに3-5ステップ
- 各ステップに: 目的、使用ツール、実行内容、判断基準、期待出力

**重要**: これが最も重要なセクション（詳細はPhase 3）

#### セクション5: ツール使用方針
**内容**:
- 各ツールの使用条件
- 対象ファイルパターン
- 禁止事項
- 承認要求が必要な操作

**テンプレート**:
```markdown
## ツール使用方針

### Read
**使用条件**:
- [条件1]
- [条件2]

**対象ファイルパターン**:
\```yaml
read_allowed_paths:
  - "[pattern1]"
  - "[pattern2]"
\```

**禁止事項**:
- [禁止1]
- [禁止2]
```

#### セクション6: 品質基準
**内容**:
- 各Phaseの完了条件
- 最終完了条件
- 品質メトリクス

**テンプレート**:
```markdown
## 品質基準

### 完了条件

#### Phase 1 完了条件
- [ ] [条件1]
- [ ] [条件2]

### 最終完了条件
- [ ] [最終条件1]
- [ ] [最終条件2]

**成功の定義**: [成功状態の記述]
```

#### セクション7: ハンドオフプロトコル（他エージェントと連携する場合）
**内容**:
- 引き継ぎ情報の標準フォーマット（JSON）
- 必須情報の定義
- 情報の受け渡しルール

**リソース**: `resources/section-catalog.md`

### Phase 3: ワークフロー設計（5段階）

**目的**: タスク実行時の動作を5段階で定義

**5段階ワークフローの原則**:
1. Phase 1: 要件理解・分析
2. Phase 2: 設計・計画
3. Phase 3: 実装・実行
4. Phase 4: 検証・品質保証
5. Phase 5: 統合・引き継ぎ

**各Phaseの設計要素**:

#### Phase構造テンプレート:
```markdown
### Phase [N]: [Phase名]

**目的**: [このPhaseで達成すること]

**ステップ**:
1. **ステップ1**: [ステップ名]
   - 目的: [なぜこのステップが必要か]
   - 使用ツール: [Read, Write, etc.]
   - 実行内容: [具体的な作業]
   - 期待される出力: [成果物]

2. **ステップ2**: [ステップ名]
   ...

**判断基準**:
- [ ] [完了判定基準1]
- [ ] [完了判定基準2]
- [ ] [完了判定基準3]

**リソース**: `.claude/skills/[related-skill]/SKILL.md`
```

**設計チェックリスト**:
- [ ] 5つのPhaseがあるか？
- [ ] 各Phaseに3-5ステップがあるか？
- [ ] 各ステップに判断基準があるか？
- [ ] 各Phaseにリソース参照があるか？

**リソース**: `resources/workflow-design-patterns.md`

### Phase 4: 判断基準とチェックリスト設計

**目的**: 各ステップの完了判定を明確化

**チェックリスト設計の原則**:

1. **測定可能性**:
   - ❌ 「良いコードを書く」
   - ✅ 「テストカバレッジが80%以上」

2. **具体性**:
   - ❌ 「適切に設計する」
   - ✅ 「YAML構文エラーがない」

3. **完全性**:
   - 各Phaseに最低3つの判断基準
   - すべての重要な観点をカバー

**判断基準の種類**:
- 構造的基準: ファイルの存在、構文の正確性
- 品質基準: 一貫性、明確性、完全性
- 機能的基準: 期待される動作、出力

**リソース**: `resources/judgment-criteria-design.md`

## リソースへの参照

- **YAML設計ガイド**: `resources/yaml-frontmatter-guide.md`
  - name, description設計の詳細
  - tools選択の判断フロー
  - model選択基準

- **セクションカタログ**: `resources/section-catalog.md`
  - 7つの必須セクションの詳細
  - 推奨セクション
  - セクション順序のベストプラクティス

- **ワークフローパターン**: `resources/workflow-design-patterns.md`
  - Phase 1-5の設計パターン
  - エージェントタイプ別のワークフロー例
  - ステップ分割の原則

- **判断基準設計**: `resources/judgment-criteria-design.md`
  - チェックリスト作成方法
  - 測定可能な基準の定義
  - 完了条件の設計

## ベストプラクティス

### すべきこと

1. **description最適化**:
   - 具体的なトリガーキーワードを含める
   - 専門分野を明確に列挙
   - 使用タイミングを3-5項目で明示

2. **ワークフロー段階化**:
   - 必ず5つのPhaseで構成
   - 各Phaseに明確な目的
   - 段階的な進捗管理

3. **判断基準の明確化**:
   - すべてチェックリスト形式
   - 測定可能な基準
   - 完了判定が明確

### 避けるべきこと

1. **曖昧なdescription**:
   - ❌ 「様々なタスクを実行するエージェント」
   - ✅ 「データベーススキーマ設計とマイグレーション管理を専門とするエージェント」

2. **不完全な構造**:
   - ❌ 必須セクションの欠落
   - ✅ 7つの必須セクションすべて含む

3. **曖昧な判断基準**:
   - ❌ 「適切に実装されている」
   - ✅ 「全ユニットテストが合格している」

## トラブルシューティング

### 問題1: descriptionでエージェントが自動起動しない

**症状**: 該当するタスクなのにエージェントが選択されない

**原因**: トリガーキーワードが不明確

**解決策**:
1. 専門分野に技術名を明示
2. 使用タイミングを「〇〇する時」という形式で記述
3. プロアクティブ指示を追加

### 問題2: ワークフローが複雑すぎる

**症状**: Phaseが8つ以上ある、またはステップが多すぎる

**原因**: タスクの粒度が細かすぎる

**解決策**:
1. 関連するステップを統合
2. Phaseを5つに制限
3. 各Phaseのステップを3-5個に調整

### 問題3: 判断基準が曖昧

**症状**: 完了判定ができない

**原因**: 測定不可能な基準

**解決策**:
1. 数値化可能な基準に変更
2. チェックリスト形式を徹底
3. Yes/Noで判定可能な表現

## 関連スキル

- **agent-architecture-patterns** (`.claude/skills/agent-architecture-patterns/SKILL.md`): アーキテクチャパターン
- **progressive-disclosure** (`.claude/skills/progressive-disclosure/SKILL.md`): トークン効率化
- **agent-quality-standards** (`.claude/skills/agent-quality-standards/SKILL.md`): 品質基準
- **prompt-engineering-for-agents** (`.claude/skills/prompt-engineering-for-agents/SKILL.md`): プロンプト最適化

## 詳細リファレンス

詳細な実装ガイドとツールは以下を参照:
- YAML Frontmatter設計ガイド (`resources/yaml-frontmatter-guide.md`)
- エージェントテンプレート (`templates/agent-template.md`)
- 構造検証スクリプト (`scripts/validate-structure.sh`)

## メトリクス

### 構造完全性スコア

**評価基準**:
- YAML完全性: 0-10点
- 必須セクション充足: 0-10点
- ワークフロー段階性: 0-10点

**目標**: 平均9点以上

### description品質スコア

**評価基準**:
- トリガーキーワード数: ≥5個
- 具体性: 0-10点
- 明確性: 0-10点

**目標**: 総合8点以上

## 変更履歴

| バージョン | 日付 | 変更内容 |
|-----------|------|---------|
| 1.0.0 | 2025-11-24 | 初版作成 - エージェント構造設計フレームワーク |

## 使用上の注意

### このスキルが得意なこと
- YAML Frontmatterの設計と最適化
- システムプロンプト本文の構造化
- 5段階ワークフローの設計
- 判断基準とチェックリストの作成

### このスキルが行わないこと
- エージェントの実際の実装
- 具体的なビジネスロジック
- コード生成

### 推奨される使用フロー
1. YAML Frontmatter設計（Phase 1）
2. 必須セクション構成（Phase 2）
3. ワークフロー設計（Phase 3）
4. 判断基準設計（Phase 4）
