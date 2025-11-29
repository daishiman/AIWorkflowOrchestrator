---
description: |
  README.mdの更新と保守。
  プロジェクト概要、セットアップ手順、機能説明を最新の状態に保ちます。

  🤖 起動エージェント:
  - `.claude/agents/spec-writer.md`: 仕様書作成専門エージェント
  - `.claude/agents/manual-writer.md`: ユーザー中心ドキュメンテーション専門エージェント（補助）

  📚 利用可能スキル（エージェントが必要時に参照）:
  **spec-writer:** markdown-advanced-syntax, structured-writing
  **manual-writer:** user-centric-writing, tutorial-design

  ⚙️ このコマンドの設定:
  - argument-hint: なし
  - allowed-tools: エージェント起動と読み取り・編集用
    • Task: spec-writer・manual-writerエージェント起動
    • Read: プロジェクトファイル、設定ファイル
    • Edit: README.md編集
  - model: sonnet（README更新タスク）

  トリガーキーワード: readme, project overview, documentation
argument-hint: ""
allowed-tools: [Task, Read, Edit]
model: sonnet
---

# README更新コマンド

あなたは `/ai:update-readme` コマンドを実行します。

## 目的

README.mdをプロジェクトの最新状態に合わせて更新し、
新規ユーザーが迅速にプロジェクトを理解・セットアップできるようにします。

## 実行フロー

### Phase 1: エージェント起動準備

**コンテキスト収集:**
```bash
# プロジェクト構造
ls -la

# パッケージ情報
cat package.json | grep -E '"name"|"version"|"description"|"scripts"'

# 機能一覧
ls -la src/features/

# 環境変数
cat .env.example 2>/dev/null || echo "No .env.example"
```

### Phase 2: @spec-writer エージェント起動（技術部分）

```typescript
@spec-writer を起動し、以下を依頼:

**タスク**: README.md の技術セクション更新
**フォーカス**: markdown-advanced-syntax, structured-writing

**更新セクション**:
1. プロジェクト概要
2. アーキテクチャ図（Mermaid）
3. 技術スタック
4. ディレクトリ構造

**入力情報**:
- プロジェクトコンテキスト: master_system_design.md
- package.json: 依存関係情報
- 既存README.md
```

### Phase 3: @manual-writer エージェント起動（ユーザー向け部分）

```typescript
@manual-writer を起動し、以下を依頼:

**タスク**: README.md のユーザー向けセクション更新
**フォーカス**: user-centric-writing, tutorial-design

**更新セクション**:
1. クイックスタート（5分で動作確認）
2. セットアップ手順
3. 基本的な使い方
4. FAQ・トラブルシューティングへのリンク

**要件**:
- 技術初心者でも理解できる説明
- コマンド例を明示
- 期待される出力を記載
```

### Phase 4: 統合と完了報告

両エージェントの成果物を統合し、ユーザーに以下を報告:
- ✅ 更新されたセクション一覧
- 📊 README.md の構成
  - 概要
  - クイックスタート
  - セットアップ
  - 使い方
  - アーキテクチャ
  - 貢献ガイド
  - ライセンス
- 🔍 推奨される次のアクション（あれば）

## README.md 標準構成

```markdown
# プロジェクト名

## 概要
プロジェクトの目的と主要機能

## クイックスタート（5分）
最速で動作確認する手順

## 機能
主要機能の箇条書き

## セットアップ
### 必要要件
### インストール
### 環境変数設定

## 使い方
基本的な使用例

## アーキテクチャ
システム構成図（Mermaid）

## 技術スタック
使用技術の一覧

## 貢献ガイド
コントリビューション方法

## ライセンス

## 関連ドキュメント
- [詳細仕様](docs/00-requirements/master_system_design.md)
- [APIドキュメント](docs/api/)
```

## 注意事項

- このコマンドはREADME更新のみを行い、詳細はエージェントに委譲
- 技術部分とユーザー向け部分を適切にバランス
- 最新の状態を反映（古い情報は削除）
