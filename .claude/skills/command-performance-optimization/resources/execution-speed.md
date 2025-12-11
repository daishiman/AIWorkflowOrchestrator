# 実行速度改善

## ボトルネック特定

1. **長時間待機**: 外部API、ビルド処理
2. **順次処理**: 並列化可能なタスク
3. **冗長な処理**: 重複したステップ
4. **過剰な出力**: 不要なログ

## 改善手法

### 1. キャッシング

```markdown
## Check Cache

If cache exists for $ARGUMENTS:
Load from cache
Skip expensive operation
```

### 2. 早期リターン

```markdown
## Validation

If invalid input:
Display error
Exit immediately # 不要な処理をスキップ
```

### 3. 遅延実行

```markdown
## Optional Analysis

If --detailed flag:
Run expensive analysis
Else:
Skip and continue # デフォルトは高速パス
```

### 4. バッチ処理

```markdown
# ❌ 遅い

For each file:
Process individually

# ✅ 速い

Collect all files
Process in batch
```

## 測定

コマンド実行時間を測定:

```bash
time /command-name
```

目標: <5秒（インタラクティブコマンド）
