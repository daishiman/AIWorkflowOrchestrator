# SlashCommand Tool完全ガイド

## 概要

SlashCommand Tool: モデルがコマンドをプログラマティックに起動するツール。

## 起動条件

1. **description マッチング**: ユーザー要求とdescriptionの意味的類似度
2. **コンテキスト適合性**: 現在の会話コンテキストとの関連性
3. **利用可能性**: `.claude/commands/` 内に存在

## description最適化

```yaml
# ❌ 悪い例（曖昧）
description: Do some work

# ✅ 良い例（具体的）
description: Create Git commit with conventional commit message

# ✅ さらに良い例（キーワード rich）
description: Generate conventional commit message and create Git commit (feat, fix, chore)
```

## 自動起動の仕組み

```
User: "Please commit these changes"
  ↓
Model検索: description含む"commit"
  ↓
発見: /commit コマンド
  ↓
SlashCommand Tool起動: /commit
  ↓
コマンド実行
```

## ベストプラクティス

1. **具体的なdescription**: 動詞+目的語+キーワード
2. **一般的な用語使用**: ユーザーが使う自然な言葉
3. **キーワード網羅**: 関連する複数の表現を含める
4. **短すぎず長すぎず**: 1-2文が最適
