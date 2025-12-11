# 並列実行

## 基本パターン

```markdown
## Parallel Tasks

Branch A: `/task-a` → result_a
Branch B: `/task-b` → result_b
Branch C: `/task-c` → result_c

Wait for completion.

## Combine Results

Process: result_a, result_b, result_c
```

## 並列化可能な条件

✓ **並列化できる**:

- 独立したタスク（依存関係なし）
- 異なるファイルの操作
- 複数の外部API呼び出し
- 並列テスト実行

✗ **並列化できない**:

- 順次依存があるタスク
- 共有リソースへの書き込み
- 前のステップの結果が必要

## 効果

```
# 順次実行
Task A (30s) → Task B (30s) → Task C (30s) = 90s

# 並列実行
Task A (30s) ↘
Task B (30s) → Wait (30s) = 30s
Task C (30s) ↗
```

**削減率**: 67%
