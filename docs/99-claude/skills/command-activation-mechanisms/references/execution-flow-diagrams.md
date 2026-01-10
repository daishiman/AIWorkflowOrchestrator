# 実行フロー図解

## ユーザー明示起動フロー

```
User: "/commit"
  ↓
Claude Code解析
  ↓
.claude/commands/commit.md 読み込み
  ↓
YAML Frontmatter解析
  ↓
Markdown本文実行
  ↓
コマンド完了
```

## SlashCommand Tool起動フロー

```
User: "commit these changes"
  ↓
Model判断: コマンド利用可能?
  ↓
SlashCommand Tool検索
  ↓
description マッチング
  ↓
最適コマンド選択
  ↓
Tool起動: /commit
  ↓
コマンド実行
```

## 優先順位

1. ユーザー明示的起動（`/command`）→ 常に実行
2. SlashCommand Tool → モデル判断に依存
3. 手動実行 → コマンドなしで直接処理

## エラーフロー

```
コマンド起動
  ↓
ファイル存在確認
  ↓ 存在しない
エラー: "Command not found"
  ↓
終了
```
