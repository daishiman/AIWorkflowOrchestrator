---
description: |
  新しいClaude Codeスキル（.claude/skills/*/SKILL.md）を作成する専門コマンド。
  skill-librarian エージェントを起動し、SECIモデル（暗黙知→形式知変換）に基づいた
  Progressive Disclosure方式の実運用レベルのスキルファイルを生成します。

  500行以内の本文、適切なリソース分割、メタデータ設計により、
  トークン効率と知識スケーラビリティを両立した再利用可能な知識を形式知化します。

  🤖 起動エージェント:
  - Phase 1-4: `.claude/agents/skill-librarian.md` - 知識体系化・スキル作成専門

  📚 利用可能スキル（skill-librarianエージェントが参照）:
  - `.claude/skills/knowledge-management/SKILL.md` - SECIモデルによる暗黙知→形式知変換
  - `.claude/skills/progressive-disclosure/SKILL.md` - 3層開示モデル、スキル発動最適化
  - `.claude/skills/documentation-architecture/SKILL.md` - トピック分割、階層設計
  - `.claude/skills/context-optimization/SKILL.md` - トークン効率化、段階的ロード
  - `.claude/skills/best-practices-curation/SKILL.md` - 知識の収集、更新、陳腐化防止
  - `.claude/skills/skill-creation-workflow/SKILL.md` - 5フェーズスキル作成ワークフロー

  ⚙️ このコマンドの設定:
  - argument-hint: "[skill-name]"（スキル名）
  - allowed-tools: スキル設計とファイル生成用
    • Read: 既存スキル・ベストプラクティス参照用
    • Write(.claude/skills/**): スキルファイル生成用
    • Grep: パターン検索・既存知識調査用
    • Bash: 検証スクリプト実行用
  - model: opus（複雑な知識体系化が必要）

  📋 成果物:
  - `.claude/skills/[skill-name]/SKILL.md`（500行以内のスキル本文）
  - `.claude/skills/[skill-name]/resources/`（詳細リソース）
  - `.claude/skills/[skill-name]/scripts/`（自動化スクリプト、必要時）
  - `.claude/skills/[skill-name]/templates/`（テンプレート、必要時）

  🎯 設計原則:
  - SECIモデル（共同化→表出化→連結化→内面化）
  - Progressive Disclosure（段階的開示）
  - 500行以内制限

  トリガーキーワード: skill, スキル作成, 知識体系化, ベストプラクティス, 形式知化
argument-hint: "[skill-name]"
allowed-tools:
   - Read
   - Write(.claude/skills/**)
   - Grep
   - Bash
model: opus
---

# スキル作成コマンド

## 目的

新しいClaude Codeスキル（.claude/skills/*/SKILL.md）を作成します。
skill-librarian エージェントを起動し、SECIモデルに基づいた実運用レベルのスキルファイルを生成します。

## コマンド実行フロー

### 1. エージェント起動

専門エージェント `.claude/agents/skill-librarian.md` を起動します。
このエージェントは以下の5つのスキルを活用します:

- **knowledge-management**: SECIモデルによる暗黙知→形式知変換
- **progressive-disclosure**: 3層開示モデル（メタデータ→本文→リソース）
- **documentation-architecture**: トピック分割、階層設計、リソース最適化
- **context-optimization**: トークン効率化、段階的ロード設計
- **best-practices-curation**: 知識の収集、更新、陳腐化防止

### 2. SECIモデルに基づくワークフロー

`.claude/agents/skill-librarian.md` は以下のワークフローでスキルを作成します:

```
Phase 1: Socialization（共同化）
  - 暗黙知の特定と共有
  ↓
Phase 2: Externalization（表出化）
  - 暗黙知を形式知に変換
  - スキル構造の設計
  ↓
Phase 3: Combination（連結化）
  - 既存知識との統合
  - リソースファイルの分割
  - Progressive Disclosure設計
  ↓
Phase 4: Internalization（内面化）
  - 使用条件の明確化
  - 発動トリガーの設定
  - 品質検証
```

### 3. 成果物

以下の構造を持つスキルディレクトリが `.claude/skills/` に生成されます:

```
.claude/skills/[skill-name]/
├── SKILL.md                    # メインファイル（500行以内）
├── resources/                  # 詳細リソース（必要に応じて）
│   ├── [topic-1].md
│   ├── [topic-2].md
│   └── [topic-3].md
├── scripts/                    # 自動化スクリプト（必要に応じて）
│   └── [automation].sh
└── templates/                  # テンプレート（必要に応じて）
    └── [template].md
```

### SKILL.md の構造

```markdown
---
name: [skill-name]
description: |
  [スキルの概要: 専門分野、使用タイミング、価値提案]

  専門分野:
  - [分野1]
  - [分野2]

  使用タイミング:
  - [シナリオ1]
  - [シナリオ2]

  Use proactively when...
version: 1.0.0
---

# [Skill Name]

## 概要
[スキルの目的、価値、対象ユーザー]

## リソース構造
[ディレクトリ構造とリソースの説明]

## いつ使うか
[具体的なシナリオと適用条件]

## ワークフロー
[段階的な実行手順]

## ベストプラクティス
[推奨事項と注意点]

## トラブルシューティング
[よくある問題と解決策]

## 関連スキル
[相対パスで関連スキルを記載]
```

## 使用例

### 基本的な使用

```bash
/ai:create-skill error-handling-patterns
```

対話的に以下の情報を収集:
- スキルの目的と専門分野
- 体系化したい暗黙知の内容
- ターゲットユーザーと使用シナリオ
- 必要なリソースファイルの種類
- 発動条件とトリガーキーワード

### 引数なしで起動（インタラクティブモード）

```bash
/ai:create-skill
```

スキル名を含めてすべての情報をインタラクティブに収集します。

## エージェント起動

このコマンドは `.claude/agents/skill-librarian.md` エージェントを起動します。

### 起動手順

1. **スキル名の確認**

```bash
# 引数が指定されている場合
スキル名: "$ARGUMENTS"

# 引数が未指定の場合
ユーザーに対話的にスキル名を質問します
```

2. **skill-librarian エージェントを起動**

以下の指示で Task ツールを使用してエージェントを起動します:

```
Task ツールで `.claude/agents/skill-librarian.md` エージェントを起動し、新しいスキルを作成してください。

コンテキスト:
- スキル名: ${スキル名}
- 既存のスキル構造を確認済み
- プロジェクトの知識体系を理解済み

`.claude/agents/skill-librarian.md` エージェントに以下を依頼:

【Phase 1: Socialization（共同化）】
1. ユーザーから暗黙知を収集
   - どのような経験・ノウハウを形式知化するか
   - 現在の課題や繰り返し発生する問題
   - 対象読者とその専門性レベル

【Phase 2: Externalization（表出化）】
2. スキル構造を設計
   - SKILL.md本文（500行以内）の設計
   - リソースファイルの分割方針
   - メタデータ（name, description, version）の設計
   - 発動条件とトリガーキーワードの定義

【Phase 3: Combination（連結化）】
3. 既存知識と統合
   - 関連する既存スキルとの関係性を明確化
   - 重複する知識の統合または参照
   - Progressive Disclosure設計（段階的情報開示）
   - リソースファイルの適切な分割と組織化

【Phase 4: Internalization（内面化）】
4. 品質検証と完成
   - 「いつ使うか」セクションの具体化
   - ワークフローの明確化
   - ベストプラクティスの整理
   - トラブルシューティングの追加
   - 500行以内の制約確認

5. ファイル生成
   - .claude/skills/${スキル名}/SKILL.md を作成
   - 必要に応じて resources/, scripts/, templates/ ディレクトリを作成

期待される成果物:
- 完全なSKILL.md（YAML Frontmatter + Markdown本文、500行以内）
- 適切に分割されたリソースファイル（必要な場合）
- 自動化スクリプト（必要な場合）
- テンプレートファイル（必要な場合）

品質基準:
- SKILL.md本文は500行以内
- Progressive Disclosure原則の遵守
- SECIモデルに基づく形式知化
- 明確な発動条件とトリガーキーワード
- 相対パスによる関連スキル参照
- トークン効率の最適化
```

3. **検証と完了**

エージェントが完了したら:
- 作成されたスキルディレクトリのパスを確認
- SKILL.md の行数を検証（500行以内）
- YAML Frontmatter の構文を検証
- ユーザーに完了を報告
- スキルの使用方法を簡潔に説明

## 設計原則

### SECIモデル（野中郁次郎）

#### Socialization（共同化）
暗黙知を暗黙知として共有。経験や勘、ノウハウの特定。

#### Externalization（表出化）
暗黙知を形式知に変換。言語化、図解、体系化。

#### Combination（連結化）
形式知と形式知を組み合わせて新しい知識を創造。既存知識との統合。

#### Internalization（内面化）
形式知を暗黙知として習得。実践を通じた理解の深化。

### Progressive Disclosure（段階的情報開示）

1. **第1層: メタデータ**（YAML Frontmatter）
   - スキル名、概要、専門分野、使用タイミング
   - 100-200トークン程度

2. **第2層: 本文**（SKILL.md）
   - ワークフロー、ベストプラクティス、トラブルシューティング
   - 500行以内、2000-3000トークン程度

3. **第3層: リソース**（resources/）
   - 詳細なガイド、理論的背景、高度なトピック
   - 必要に応じてオンデマンドロード

### トークン効率化

- **単一責任**: 1スキル = 1トピック
- **適切な分割**: 500行を超える場合はリソースに分離
- **段階的ロード**: 必要な時だけ詳細リソースを読み込み
- **重複排除**: 既存スキルを参照、重複した知識を作らない

### 品質基準

- **検証可能性**: 主張は証拠やベストプラクティスに基づく
- **再現可能性**: 誰が読んでも同じ結果を得られる
- **鮮度維持**: 定期的な更新と陳腐化チェック
- **実用性**: 実際のタスクで即座に活用可能

## トラブルシューティング

### スキルが発動しない

**症状**: 作成したスキルがエージェントから参照されない

**原因**: メタデータの発動条件が不明確

**解決策**:
1. `description` にトリガーキーワードを追加
2. 「使用タイミング」を具体的なシナリオで記述
3. "Use proactively when..." 文を英語で追加

### SKILL.mdが500行を超えた

**症状**: 本文が長すぎてトークン効率が悪い

**原因**: 詳細情報を本文に詰め込みすぎ

**解決策**:
1. 詳細なトピックを `resources/` ディレクトリに分離
2. 本文には概要とワークフローのみ残す
3. Progressive Disclosure原則に従って階層化

### 既存スキルとの重複

**症状**: 類似した内容のスキルが複数存在

**原因**: 既存知識の確認不足

**解決策**:
1. 既存スキルを検索: `grep -r "keyword" .claude/skills/*/SKILL.md`
2. 重複部分は既存スキルを参照
3. 「関連スキル」セクションで相対パスを記載

### エージェントから参照できない

**症状**: エージェントファイルでスキルを参照しようとするとエラー

**原因**: 絶対パスまたはスキル名のみで参照している

**解決策**:
- ✅ 正しい: `.claude/skills/knowledge-management/SKILL.md`
- ❌ 間違い: `knowledge-management`
- ❌ 間違い: `/Users/.../knowledge-management/SKILL.md`

## 参照

- skill-librarian エージェント: `.claude/agents/skill-librarian.md`
- knowledge-management スキル: `.claude/skills/knowledge-management/SKILL.md`
- progressive-disclosure スキル: `.claude/skills/progressive-disclosure/SKILL.md`
- documentation-architecture スキル: `.claude/skills/documentation-architecture/SKILL.md`
- context-optimization スキル: `.claude/skills/context-optimization/SKILL.md`
- best-practices-curation スキル: `.claude/skills/best-practices-curation/SKILL.md`

## 注意事項

- このコマンド自体は `.claude/agents/skill-librarian.md` を起動するだけです
- 実際のスキル作成は `.claude/agents/skill-librarian.md` エージェントが担当します
- SECIモデルに基づいた対話的なプロセスのため、時間がかかる場合があります
- model: opus を使用（高度な知識体系化が必要）
- SKILL.md本文は必ず500行以内に収めます
- スキル参照は必ず相対パス（`.claude/skills/[skill-name]/SKILL.md`）を使用します
- Progressive Disclosure原則を最優先します
