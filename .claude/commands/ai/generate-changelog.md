---
description: |
  Git履歴からCHANGELOG.mdを自動生成。
  バージョン範囲を指定してリリースノートを作成し、変更をグループ化します。

  🤖 起動エージェント:
  - `.claude/agents/spec-writer.md`: 仕様書作成専門エージェント

  📚 利用可能スキル（spec-writerエージェントが必要時に参照）:
  **使用スキル:** markdown-advanced-syntax, version-control-for-docs, structured-writing

  ⚙️ このコマンドの設定:
  - argument-hint: バージョン範囲（オプション、例: v1.0.0..v2.0.0）
  - allowed-tools: エージェント起動とGit履歴読み取り・書き込み用
    • Task: spec-writerエージェント起動
    • Bash(git log*|git tag*|git diff*): Git履歴取得、差分確認
    • Read: 既存CHANGELOG確認
    • Write(CHANGELOG.md)|Edit: CHANGELOGファイル作成・更新
  - model: sonnet（CHANGELOG生成タスク）

  トリガーキーワード: changelog, release notes, version, git history
argument-hint: "[from-tag] [to-tag]"
allowed-tools: [Task, Bash(git log*|git tag*|git diff*), Read, Write(CHANGELOG.md), Edit]
model: sonnet
---

# CHANGELOG自動生成コマンド

あなたは `/ai:generate-changelog` コマンドを実行します。

## 目的

Git履歴から変更をグループ化し、
セマンティックバージョニングに従ったCHANGELOG.mdを自動生成します。

## 実行フロー

### Phase 1: エージェント起動準備

**ユーザー引数の処理:**
- `$1` (from-tag): 開始バージョンタグ（オプション）
- `$2` (to-tag): 終了バージョンタグ（オプション、デフォルト: HEAD）

**Git履歴の取得:**
```bash
# タグ一覧
git tag -l

# コミット履歴（範囲指定がある場合）
if [ -n "$FROM_TAG" ]; then
  git log $FROM_TAG..$TO_TAG --oneline --no-merges
else
  git log --oneline --no-merges -n 50
fi
```

### Phase 2: @spec-writer エージェント起動

```typescript
@spec-writer を起動し、以下を依頼:

**タスク**: CHANGELOG.mdの自動生成
**フォーカス**: version-control-for-docsスキルを活用

**入力情報**:
- Git履歴: 上記で取得したコミットログ
- バージョン範囲: $FROM_TAG から $TO_TAG
- 既存CHANGELOG: CHANGELOG.md

**期待成果物**:
`CHANGELOG.md` の更新または新規作成

**フォーマット要件** (Keep a Changelog準拠):
```markdown
# Changelog

## [Unreleased]

## [2.0.0] - 2025-11-29
### Added
- 新機能の追加

### Changed
- 既存機能の変更

### Deprecated
- 非推奨化された機能

### Removed
- 削除された機能

### Fixed
- バグ修正

### Security
- セキュリティ修正
```

**分類ルール**:
- feat: → Added
- fix: → Fixed
- docs: → Changed (Documentation)
- refactor: → Changed
- test: → Changed (Testing)
- chore: → Changed
- security: → Security
- BREAKING CHANGE: → Changed (先頭に⚠️)
```

### Phase 3: 完了報告

エージェントからの成果物を受け取り、ユーザーに以下を報告:
- ✅ 生成されたバージョンセクション
- 📊 カテゴリ別変更数
  - Added: X件
  - Changed: X件
  - Fixed: X件
  - Security: X件
- 🔖 対象バージョン範囲

## 注意事項

- このコマンドはCHANGELOG生成のみを行い、詳細はエージェントに委譲
- コミットメッセージの品質に依存します
- Conventional Commits形式を推奨
