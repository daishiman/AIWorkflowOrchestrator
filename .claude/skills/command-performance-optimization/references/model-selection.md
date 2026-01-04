# モデル選択

## モデル比較

| モデル | 速度   | コスト | 用途       |
| ------ | ------ | ------ | ---------- |
| Haiku  | ◎ 最速 | ◎ 最安 | 単純タスク |
| Sonnet | ○ 高速 | ○ 標準 | 標準タスク |
| Opus   | △ 低速 | ✗ 高額 | 複雑タスク |

## 選択基準

### Haiku適用場面

```yaml
model: haiku
```

- 定型的な操作
- 明確なテンプレート適用
- 単純な変換タスク
- ファイル整理

### Sonnet適用場面（デフォルト）

```yaml
# model指定なし
```

- 標準的なコマンド
- 判断を含むタスク
- コード生成

### Opus必要な場面

```yaml
model: opus
```

- 複雑なアーキテクチャ決定
- 高度なリファクタリング
- セキュリティ分析

## 実装

```markdown
---
description: Simple file organization
model: haiku
---

# organize-files

[Simple, template-driven task]
```

## コスト最適化

Haikuを使用できる場面でHaikuを指定 → 90%コスト削減
