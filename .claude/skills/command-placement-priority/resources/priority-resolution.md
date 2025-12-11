# 優先順位解決

## 優先順位ルール

同名コマンドが複数存在する場合の実行順：

```
1. プロジェクトコマンド (.claude/commands/)
2. ユーザーコマンド (~/.claude/commands/)
3. MCPプロンプト (MCP servers)
```

## 例

```bash
# 両方に /deploy が存在
.claude/commands/deploy.md        # Priority 1
~/.claude/commands/deploy.md      # Priority 2 (無視される)
```

起動: `/deploy` → プロジェクト版が実行される

## オーバーライド戦略

### プロジェクトでユーザーコマンドをオーバーライド

```bash
# ユーザーコマンド
~/.claude/commands/test.md  # 汎用テスト

# プロジェクトで上書き
.claude/commands/test.md    # プロジェクト固有テスト
```

### 注意点

- 意図的なオーバーライドは明示的にドキュメント化
- 予期しない同名衝突を避けるため名前空間使用を推奨
