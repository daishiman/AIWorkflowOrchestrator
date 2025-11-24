---
description: |
  新しいスラッシュコマンド（.claude/commands/*.md）を作成する専門コマンド。
  command-arch エージェントを起動し、YAML Frontmatter + Markdown 本文の構造を持つ
  実運用レベルのスラッシュコマンドファイルを生成します。

  セキュリティとベストプラクティスを考慮した設計を行い、
  単一責任原則、組み合わせ可能性、冪等性の原則に基づきます。

  トリガーキーワード: command, slash-command, コマンド作成, workflow, 自動化
argument-hint: "[command-name]"
allowed-tools: [Read, Write(.claude/commands/**)]
model: sonnet
---

# スラッシュコマンド作成コマンド

## 目的

新しいスラッシュコマンド（.claude/commands/*.md）を作成します。
command-arch エージェントを起動し、実運用レベルのコマンドファイルを生成します。

## コマンド実行フロー

### 1. エージェント起動

専門エージェント @command-arch を起動します。
このエージェントは以下の13個のスキルを活用します:

- command-structure-fundamentals: YAML Frontmatter設計
- command-arguments-system: 引数システム設計
- command-security-design: セキュリティレビュー
- command-basic-patterns: 実装パターン選択
- command-advanced-patterns: 高度なパターン
- command-agent-skill-integration: エージェント・スキル統合
- command-activation-mechanisms: 自動起動設計
- command-error-handling: エラーハンドリング設計
- command-naming-conventions: 命名決定
- command-documentation-patterns: ドキュメンテーション作成
- command-placement-priority: ファイル配置決定
- command-best-practices: 設計原則確認
- command-performance-optimization: 最適化

### 2. ワークフロー

@command-arch は以下のワークフローでコマンドを作成します:

```
Phase 1: 要件収集と初期分析
  ↓
Phase 2: コマンド設計
  - 命名と配置の決定
  - YAML Frontmatter の設計
  - 実装パターンの選択
  - 引数システムの設計
  ↓
Phase 3: エラーハンドリングとセキュリティ
  - エラーハンドリング戦略の設計
  - セキュリティレビュー
  ↓
Phase 4: ドキュメンテーションと例
  ↓
Phase 5: 統合とベストプラクティス確認
```

### 3. 成果物

以下の構造を持つコマンドファイルが `.claude/commands/` ディレクトリに生成されます:

```markdown
---
description: |
  [コマンドの説明: 4-8行、トリガーキーワード含む]
argument-hint: "[arg1] [arg2]"
allowed-tools: [必要最小限のツールリスト]
model: sonnet|opus|haiku
disable-model-invocation: false|true
---

# コマンド本文
[Purpose、Input、Output、Prerequisites、Examples、Troubleshooting]
```

## 使用例

### 基本的な使用

```bash
/ai:create-command analyze-logs
```

対話的に以下の情報を収集:
- コマンドの目的
- 自動化するワークフロー
- 必要な引数
- 使用タイミング
- セキュリティ要件

### 引数なしで起動（インタラクティブモード）

```bash
/ai:create-command
```

コマンド名を含めてすべての情報をインタラクティブに収集します。

## エージェント起動

このコマンドは @command-arch エージェントを起動します。

### 起動手順

1. **コマンド名の確認**

```bash
# 引数が指定されている場合
コマンド名: "$ARGUMENTS"

# 引数が未指定の場合
ユーザーに対話的にコマンド名を質問します
```

2. **@command-arch エージェントを起動**

以下の指示で Task ツールを使用してエージェントを起動します:

```
Task ツールで @command-arch エージェントを起動し、新しいスラッシュコマンドを作成してください。

コンテキスト:
- コマンド名: ${コマンド名}
- 既存のコマンド構造を確認済み
- プロジェクトの命名規則を理解済み

@command-arch エージェントに以下を依頼:
1. コマンドの目的と要件をユーザーから収集
2. 適切な命名と配置を決定
3. YAML Frontmatter を設計（description、argument-hint、allowed-tools、model）
4. 実装パターンを選択
5. 引数システムを設計
6. エラーハンドリングとセキュリティを実装
7. 充実したドキュメンテーションを作成
8. ベストプラクティスを確認
9. .claude/commands/*.md ファイルを生成

期待される成果物:
- 完全なコマンドファイル（.claude/commands/*.md）
- YAML Frontmatter の正確な構成
- 充実したドキュメンテーション
- 使用例とトラブルシューティングガイド

品質基準:
- 単一責任原則の遵守
- 組み合わせ可能性の確保
- 冪等性の保証
- セキュリティベストプラクティスの適用
```

3. **検証と完了**

エージェントが完了したら:
- 作成されたコマンドファイルのパスを確認
- YAML Frontmatter の構文を検証
- ユーザーに完了を報告
- コマンドの使用方法を簡潔に説明

## 設計原則

### 単一責任原則
各コマンドは1つの明確な目的を持つべきです。

### 組み合わせ可能性
他のコマンドやエージェントと組み合わせて使用できるべきです。

### 冪等性
同じコマンドを複数回実行しても安全であるべきです。

### セキュリティ
- allowed-tools は必要最小限に制限
- 破壊的操作には disable-model-invocation: true を設定
- 機密情報の保護を考慮

## トラブルシューティング

### コマンドが見つからない

**症状**: 作成したコマンドが `/` で補完されない

**原因**: ファイル配置またはYAML構文エラー

**解決策**:
1. ファイルが `.claude/commands/` ディレクトリにあるか確認
2. YAML Frontmatter の構文をチェック
3. description フィールドが存在するか確認

### エージェントが起動しない

**症状**: @command-arch が見つからない

**原因**: エージェントファイルが存在しない

**解決策**:
```bash
ls .claude/agents/command-arch.md
```
でファイルの存在を確認

### allowed-tools のエラー

**症状**: ツール使用時にパーミッションエラー

**原因**: allowed-tools の設定が不適切

**解決策**:
- 必要なツールが allowed-tools に含まれているか確認
- パスパターン（例: `Write(.claude/commands/**)`）が正しいか確認

## 参照

- command-arch エージェント: `.claude/agents/command-arch.md`
- コマンドガイド: `.claude/prompt/agents_skills_command_作成/ナレッジ_Claude_Code_command_ガイド.md`
- 既存コマンド: `.claude/commands/ai/command_list.md`

## 注意事項

- このコマンド自体は @command-arch を起動するだけです
- 実際のコマンド作成は @command-arch エージェントが担当します
- 対話的に要件を収集するため、時間がかかる場合があります
- セキュリティとベストプラクティスを最優先します
