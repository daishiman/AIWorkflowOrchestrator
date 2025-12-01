---
description: |
  新しいClaude Codeエージェント（.claude/agents/*.md）を作成する専門コマンド。
  meta-agent-designer エージェントを起動し、マービン・ミンスキーの『心の社会』に
  基づいた単一責任を持つ特化型エージェントを設計・生成します。

  450-550行範囲内の軽量エージェント、適切なペルソナ設計、ツール権限管理により、
  効率的で安全なマルチエージェントシステムを実現します。

  🤖 起動エージェント:
  - Phase 1-5: `.claude/agents/meta-agent-designer.md` - エージェント設計・ペルソナ定義専門

  📚 利用可能スキル（meta-agent-designerエージェントが参照）:
  **コア設計スキル（Phase 1-2）:**
  - `.claude/skills/agent-architecture-patterns/SKILL.md` - アーキテクチャパターン選択
  - `.claude/skills/agent-structure-design/SKILL.md` - YAML Frontmatter・ワークフロー設計
  - `.claude/skills/agent-persona-design/SKILL.md` - ペルソナ・役割定義
  - `.claude/skills/tool-permission-management/SKILL.md` - ツール権限・セキュリティ設計

  **統合・協調スキル（Phase 3）:**
  - `.claude/skills/agent-dependency-design/SKILL.md` - 依存関係・ハンドオフ設計
  - `.claude/skills/multi-agent-systems/SKILL.md` - マルチエージェント協調パターン
  - `.claude/skills/project-architecture-integration/SKILL.md` - プロジェクト固有設計

  **品質・検証スキル（Phase 4-5）:**
  - `.claude/skills/agent-quality-standards/SKILL.md` - 品質基準・メトリクス
  - `.claude/skills/agent-validation-testing/SKILL.md` - テストケース・検証
  - `.claude/skills/prompt-engineering-for-agents/SKILL.md` - System Prompt最適化
  - `.claude/skills/agent-template-patterns/SKILL.md` - エージェントテンプレート
  - `.claude/skills/agent-lifecycle-management/SKILL.md` - バージョン管理・更新戦略

  ⚙️ このコマンドの設定:
  - argument-hint: "[agent-name] [specialty]"（エージェント名と専門分野）
  - allowed-tools: エージェント設計とファイル生成用
    • Read: 既存エージェント・スキル参照用
    • Write(.claude/agents/**): エージェントファイル生成用
    • Grep: パターン検索・既存実装調査用
    • Bash: 検証スクリプト実行用
  - model: opus（複雑なエージェント設計が必要）

  📋 成果物:
  - `.claude/agents/[agent-name].md`（450-550行のエージェント定義）
  - ペルソナ定義・ワークフロー・ツール権限設定込み

  🎯 設計原則:
  - 単一責任原則（マービン・ミンスキー『心の社会』）
  - 450-550行制限
  - 実在する専門家ベースのペルソナ

  トリガーキーワード: agent, エージェント作成, ペルソナ設計, 自動化, マルチエージェント
argument-hint: "[agent-name] [specialty]"
allowed-tools:
   - Read
   - Write(.claude/agents/**)
   - Grep
   - Bash
model: opus
---

# エージェント作成コマンド

## 目的

新しいClaude Codeエージェント（.claude/agents/*.md）を作成します。
meta-agent-designer エージェントを起動し、マービン・ミンスキーの『心の社会』に基づいた
単一責任を持つ特化型エージェントを設計・生成します。

## コマンド実行フロー

### 1. エージェント起動

専門エージェント `.claude/agents/meta-agent-designer.md` を起動します。
このエージェントは以下の12個のスキルを活用します（タスクに応じて必要なスキルのみ読み込み）:

#### コア設計スキル（Phase 1-2で使用）
- **agent-architecture-patterns**: マービン・ミンスキーに基づくアーキテクチャパターン選択
- **agent-structure-design**: YAML Frontmatter・ワークフロー設計
- **agent-persona-design**: ペルソナ・役割定義（実在する専門家ベース）
- **tool-permission-management**: ツール権限・セキュリティ設計

#### 統合・協調スキル（Phase 3で使用）
- **agent-dependency-design**: 依存関係・ハンドオフ設計
- **multi-agent-systems**: マルチエージェント協調パターン
- **project-architecture-integration**: プロジェクト固有設計

#### 品質・検証スキル（Phase 4-5で使用）
- **agent-quality-standards**: 品質基準・メトリクス
- **agent-validation-testing**: テストケース・検証
- **prompt-engineering-for-agents**: System Prompt最適化

#### テンプレート・ライフサイクルスキル（全Phaseで使用）
- **agent-template-patterns**: エージェントテンプレート
- **agent-lifecycle-management**: バージョン管理・更新戦略

### 2. マービン・ミンスキーの『心の社会』に基づくワークフロー

`.claude/agents/meta-agent-designer.md` は以下のワークフローでエージェントを作成します:

```
Phase 1: 要件分析とアーキテクチャ選択
  - 専門分野の特定
  - アーキテクチャパターンの選択
  - 単一責任原則の確認
  ↓
Phase 2: ペルソナとワークフロー設計
  - 実在する専門家のペルソナモデリング
  - YAML Frontmatter 設計
  - 5段階ワークフロー設計
  - ツール権限とセキュリティ設定
  ↓
Phase 3: 依存関係と統合設計
  - スキル依存関係の設計
  - エージェント間協調パターンの定義
  - プロジェクト固有要件の統合
  ↓
Phase 4: 品質基準と検証
  - 完了条件の定義
  - 品質メトリクスの設定
  - テストケースの作成
  ↓
Phase 5: 最適化と完成
  - System Prompt最適化
  - 450-550行範囲内への調整
  - 最終検証とファイル生成
```

### 3. 成果物

以下の構造を持つエージェントファイルが `.claude/agents/` に生成されます:

```markdown
---
name: [agent-name]
description: |
  [エージェントの概要: 専門分野、使用タイミング]

  専門分野:
  - [分野1]
  - [分野2]

  使用タイミング:
  - [シナリオ1]
  - [シナリオ2]

  Use proactively when...
tools:
  - Read
  - Write
  - Edit
  - Grep
  - Bash
model: sonnet|opus|haiku
version: 1.0.0
---

# [Agent Name]

## 役割定義
[専門分野、責任範囲、制約]

## 専門家の思想と哲学
[実在する専門家ベースのペルソナモデリング]

## スキル管理（必要な場合）
[依存スキルの一覧と使用タイミング]

## タスク実行ワークフロー
[5段階のワークフロー: Phase 1-5]

## ツール使用方針
[各ツールの使用目的と制約]

## 品質基準と成功の定義
[完了条件、品質メトリクス、エラーハンドリング]

## 実行プロトコル
[エージェント起動時の標準的な流れ]

## 使用上の注意
[このエージェントが得意なこと、行わないこと]
```

### エージェントの特徴

1. **単一責任**: 1つの明確な専門分野を持つ
2. **軽量設計**: 450-550行範囲内に収める
3. **ペルソナベース**: 実在する専門家の思想・メソッドを移植
4. **最小権限**: 必要最小限のツール権限
5. **スキル分離**: 詳細知識は外部スキルに分離

## 使用例

### 基本的な使用（2つの引数）

```bash
/ai:create-agent performance-engineer "システムパフォーマンス最適化"
```

対話的に以下の情報を収集:
- 専門分野の詳細
- ベースとなる実在の専門家
- 責任範囲と制約
- 使用するツール
- 依存するスキル
- プロジェクト固有の要件

### エージェント名のみ指定

```bash
/ai:create-agent security-auditor
```

専門分野を対話的に収集します。

### 引数なしで起動（完全インタラクティブモード）

```bash
/ai:create-agent
```

エージェント名と専門分野の両方を対話的に収集します。

## エージェント起動

このコマンドは `.claude/agents/meta-agent-designer.md` エージェントを起動します。

### 起動手順

1. **引数の確認**

```bash
# 両方の引数が指定されている場合
エージェント名: "$1"
専門分野: "$2"

# エージェント名のみ指定の場合
エージェント名: "$1"
専門分野: 対話的に収集

# 引数なしの場合
エージェント名: 対話的に収集
専門分野: 対話的に収集
```

2. **meta-agent-designer エージェントを起動**

以下の指示で Task ツールを使用してエージェントを起動します:

```
Task ツールで `.claude/agents/meta-agent-designer.md` エージェントを起動し、新しいエージェントを作成してください。

コンテキスト:
- エージェント名: ${エージェント名}
- 専門分野: ${専門分野}
- 既存のエージェント構造を確認済み
- プロジェクトアーキテクチャを理解済み

`.claude/agents/meta-agent-designer.md` エージェントに以下を依頼:

【Phase 1: 要件分析とアーキテクチャ選択】
必要なスキル: agent-architecture-patterns

1. 専門分野の明確化
   - ${専門分野} の詳細をユーザーから収集
   - 単一責任原則の確認（1つのことだけを行うか？）
   - 既存エージェントとの重複チェック

2. アーキテクチャパターンの選択
   - オーケストレーター・ワーカー型
   - ハブアンドスポーク型
   - パイプライン型
   - ステートマシン型
   - いずれかを選択し、理由を明確化

【Phase 2: ペルソナとワークフロー設計】
必要なスキル: agent-persona-design, agent-structure-design, tool-permission-management

3. ペルソナモデリング
   - ${専門分野} に関連する実在の専門家を特定
   - その専門家の思想・メソッド・哲学を調査
   - エージェントのペルソナとして移植

4. YAML Frontmatter 設計
   - name: ${エージェント名}
   - description: 専門分野、使用タイミング、トリガーキーワード
   - tools: 必要最小限のツールリスト
   - model: sonnet|opus|haiku（複雑度に応じて）
   - version: 1.0.0

5. ワークフロー設計
   - 5段階のPhase構成
   - 各Phaseの目的、実行内容、判断基準
   - ステップ間の依存関係

6. ツール権限設定
   - 最小権限の原則に基づく
   - パス制限の適用（例: Write(src/**), Read(docs/**)）
   - セキュリティリスクの評価

【Phase 3: 依存関係と統合設計】
必要なスキル: agent-dependency-design, multi-agent-systems, project-architecture-integration

7. スキル依存関係の設計
   - 参照する必要があるスキルの特定
   - 相対パス（.claude/skills/[skill-name]/SKILL.md）での参照
   - Mandatory起動プロトコルの設計

8. エージェント間協調
   - 他のエージェントとの連携パターン
   - ハンドオフプロトコルの定義
   - 循環依存の検出と回避

9. プロジェクト固有設計
   - プロジェクトのアーキテクチャとの統合
   - データベース、API、テスト戦略への対応

【Phase 4: 品質基準と検証】
必要なスキル: agent-quality-standards, agent-validation-testing

10. 品質基準の定義
    - 完了条件（各Phaseの完了条件）
    - 成功の定義（最終的なゴール）
    - エラーハンドリング戦略（自動リトライ、フォールバック、エスカレーション）

11. テストケースの作成
    - 正常系シナリオ（Happy Path）
    - 異常系シナリオ（Error Cases）
    - エッジケース（境界値、極端な入力）

【Phase 5: 最適化と完成】
必要なスキル: prompt-engineering-for-agents, agent-template-patterns, agent-lifecycle-management

12. System Prompt最適化
    - トークン効率の向上
    - 明確で曖昧性のない指示
    - 実行可能性の検証

13. 行数調整
    - 450-550行範囲内に収める
    - 詳細知識は外部スキルに分離
    - Progressive Disclosure原則の適用

14. 最終検証
    - YAML構文チェック
    - 単一責任原則の確認
    - ツール権限の妥当性確認
    - テストケースの実行可能性確認

15. ファイル生成
    - .claude/agents/${エージェント名}.md を作成

期待される成果物:
- 完全なエージェントファイル（YAML Frontmatter + Markdown本文、450-550行）
- 単一責任を持つ特化型エージェント
- 実在する専門家ベースのペルソナ
- 適切なツール権限設定
- テストケースと検証基準

品質基準:
- 450-550行範囲内
- 単一責任原則の遵守
- 最小権限の原則の遵守
- マービン・ミンスキーの『心の社会』に基づく設計
- 明確な完了条件と成功の定義
- 相対パスによるスキル参照
- テスト可能性の確保
```

3. **検証と完了**

エージェントが完了したら:
- 作成されたエージェントファイルのパスを確認
- エージェントファイルの行数を検証（450-550行範囲内）
- YAML Frontmatter の構文を検証
- 単一責任原則の遵守を確認
- ユーザーに完了を報告
- エージェントの使用方法を簡潔に説明

## 設計原則

### マービン・ミンスキーの『心の社会』

知性は単一の巨大な機構ではなく、多数の小さな特化型エージェントの協調によって実現される。

#### 5つの核心原則

1. **単一責任（Single Responsibility）**
   - 1つのエージェント = 1つの明確な専門分野
   - "do-everything型"を作らない

2. **コンテキスト分離（Context Separation）**
   - 各エージェントは独立したコンテキストを持つ
   - グローバル状態への依存を最小化

3. **協調（Collaboration）**
   - 複雑なタスクはエージェント間の協調で実現
   - 明確なインターフェースとハンドオフプロトコル

4. **段階的構成（Progressive Composition）**
   - シンプルなエージェントから始める
   - 必要に応じて機能を追加

5. **再利用性（Reusability）**
   - 汎用的な責務を持つエージェントは再利用可能
   - プロジェクト固有の知識は最小限に

### ペルソナエンジニアリング

実在する専門家の思想・メソッド・哲学をAIエージェントに移植する技術。

#### 選定基準

- その分野で広く認められている専門家
- 体系化されたメソッドや思想を持つ
- 書籍、論文、講演などで思想が明文化されている

#### 実装方法

1. **専門家の特定**: ${専門分野} の第一人者を調査
2. **思想の抽出**: 主要な書籍・論文から核心概念を抽出
3. **エージェントへの移植**: 思想をワークフローと判断基準に反映

### ツールセキュリティ

最小権限の原則に基づくツールアクセス制御。

#### 原則

- **必要最小限**: タスクに必要なツールのみ許可
- **パス制限**: Write/Editはディレクトリ単位で制限
- **読み取り専用**: 分析系エージェントはRead/Grep/Globのみ
- **破壊的操作の禁止**: 危険な操作は明示的な承認が必要

#### 例

```yaml
# 良い例: パス制限あり
allowed-tools:
  - Read
  - Write(src/features/**)
  - Edit

# 悪い例: 無制限
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
```

## トラブルシューティング

### エージェントが450-550行を超える

**症状**: エージェントファイルが長すぎる

**原因**: 詳細知識を本文に詰め込みすぎ

**解決策**:
1. 詳細な知識を外部スキルに分離
2. 「スキル管理」セクションで相対パス参照
3. ワークフローは概要のみ、詳細は各Phase内で簡潔に

### 単一責任原則が守られていない

**症状**: エージェントが複数の異なることを行う

**原因**: スコープが広すぎる

**解決策**:
1. 専門分野を1つに絞る
2. 複数の責務がある場合は複数のエージェントに分割
3. 協調パターンで連携させる

### ツール権限が広すぎる

**症状**: allowed-tools に不要なツールが含まれる

**原因**: 最小権限の原則が適用されていない

**解決策**:
- Read専用エージェント: `[Read, Grep, Glob]`
- ドキュメント作成: `[Read, Write(docs/**)]`
- コード実装: `[Read, Write(src/**), Edit]`
- 包括的操作: `[Bash, Read, Write, Edit, Task]`

### 既存エージェントとの重複

**症状**: 類似した機能を持つエージェントが複数存在

**原因**: 既存エージェントの確認不足

**解決策**:
1. 既存エージェントを検索: `grep -r "専門分野" .claude/agents/*.md`
2. 重複部分は既存エージェントに統合
3. 差分が明確な場合のみ新規作成

## 参照

- meta-agent-designer エージェント: `.claude/agents/meta-agent-designer.md`
- agent-architecture-patterns スキル: `.claude/skills/agent-architecture-patterns/SKILL.md`
- agent-structure-design スキル: `.claude/skills/agent-structure-design/SKILL.md`
- agent-persona-design スキル: `.claude/skills/agent-persona-design/SKILL.md`
- tool-permission-management スキル: `.claude/skills/tool-permission-management/SKILL.md`
- agent-dependency-design スキル: `.claude/skills/agent-dependency-design/SKILL.md`
- agent-quality-standards スキル: `.claude/skills/agent-quality-standards/SKILL.md`
- agent-validation-testing スキル: `.claude/skills/agent-validation-testing/SKILL.md`

## 注意事項

- このコマンド自体は `.claude/agents/meta-agent-designer.md` を起動するだけです
- 実際のエージェント作成は `.claude/agents/meta-agent-designer.md` エージェントが担当します
- マービン・ミンスキーの『心の社会』に基づいた対話的なプロセスのため、時間がかかる場合があります
- model: opus を使用（高度なペルソナ設計が必要）
- エージェントは必ず450-550行範囲内に収めます
- スキル参照は必ず相対パス（`.claude/skills/[skill-name]/SKILL.md`）を使用します
- 単一責任原則を最優先します
- ツール権限は最小権限の原則に従います
