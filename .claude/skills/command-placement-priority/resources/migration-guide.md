# 配置変更ガイド

## ユーザー → プロジェクト

```bash
# 移動
mv ~/.claude/commands/deploy.md .claude/commands/deploy.md

# Git追加
git add .claude/commands/deploy.md
git commit -m "Add deploy command to project"
```

**理由**: チーム共有すべきプロジェクト固有コマンド

## プロジェクト → ユーザー

```bash
# コピー（プロジェクトから削除せず）
cp .claude/commands/note.md ~/.claude/commands/note.md

# プロジェクトから削除
git rm .claude/commands/note.md
git commit -m "Remove personal utility command"
```

**理由**: 個人用ツールをプロジェクトから分離

## 注意点

1. **Git管理**: プロジェクトコマンドは必ずGit管理
2. **チーム通知**: 移動時はチームに通知
3. **依存関係**: 他のコマンドからの参照を確認
4. **バックアップ**: 移動前にバックアップ
