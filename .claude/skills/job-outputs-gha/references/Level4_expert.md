# Level 4: 最適化とトラブルシューティング

## 概要

このドキュメントでは、ジョブ出力に関する高度な最適化手法と、
よくある問題のトラブルシューティング方法を解説します。

## トラブルシューティング

### 問題1: 出力が空文字列になる

**原因と解決策**:

```yaml
# ❌ 問題: ステップIDが間違っている
steps:
  - id: step1
    run: echo "value=test" >> $GITHUB_OUTPUT

outputs:
  data: ${{ steps.step2.outputs.value }}  # step2 は存在しない

# ✅ 解決: 正しいステップIDを使用
outputs:
  data: ${{ steps.step1.outputs.value }}
```

### 問題2: needs で参照できない

**原因と解決策**:

```yaml
# ❌ 問題: needs が設定されていない
jobs:
  job1:
    outputs:
      data: ${{ steps.s.outputs.v }}
  job2:
    steps:
      - run: echo "${{ needs.job1.outputs.data }}"  # エラー

# ✅ 解決: needs を追加
jobs:
  job2:
    needs: job1  # これが必要
    steps:
      - run: echo "${{ needs.job1.outputs.data }}"
```

### 問題3: JSON が壊れる

**原因と解決策**:

```yaml
# ❌ 問題: 特殊文字がエスケープされていない
- run: |
    json='{"message": "Hello "World""}'
    echo "json=$json" >> $GITHUB_OUTPUT

# ✅ 解決: jq を使用して安全なJSON生成
- run: |
    json=$(jq -c -n --arg msg "Hello \"World\"" '{"message": $msg}')
    echo "json=$json" >> $GITHUB_OUTPUT
```

### 問題4: 条件分岐が動作しない

**原因と解決策**:

```yaml
# ❌ 問題: 型の不一致（真偽値 vs 文字列）
outputs:
  flag: ${{ steps.check.outputs.flag }}

job2:
  if: needs.job1.outputs.flag == true  # 動作しない

# ✅ 解決: 文字列として比較
job2:
  if: needs.job1.outputs.flag == 'true'
```

## デバッグ手法

### デバッグログの有効化

```yaml
steps:
  - name: デバッグ情報出力
    run: |
      echo "::debug::出力値: ${{ steps.prev.outputs.value }}"
      echo "::notice::処理完了"
```

### 出力値の詳細確認

```yaml
steps:
  - name: 全出力を表示
    run: |
      echo "=== Job1 Outputs ==="
      echo "output1: ${{ needs.job1.outputs.output1 }}"
      echo "output2: ${{ needs.job1.outputs.output2 }}"
      echo "型確認: $(echo '${{ needs.job1.outputs.output1 }}' | jq -r type 2>/dev/null || echo 'string')"
```

### ステップ出力の即時確認

```yaml
steps:
  - id: generate
    run: |
      value="test-value"
      echo "value=$value" >> $GITHUB_OUTPUT
      echo "設定した値: $value"

  - name: 確認
    run: |
      echo "取得した値: ${{ steps.generate.outputs.value }}"
```

## パフォーマンス最適化

### 出力サイズの最小化

```yaml
# ❌ 非効率: 大きなデータを出力
- run: |
    large_data=$(cat large-file.json)
    echo "data=$large_data" >> $GITHUB_OUTPUT

# ✅ 効率的: アーティファクトを使用
- uses: actions/upload-artifact@v4
  with:
    name: large-data
    path: large-file.json
```

### 不要な依存関係の削減

```yaml
# ❌ 非効率: 不要な直列実行
jobs:
  lint:
    ...
  test:
    needs: lint  # lint と test は独立して実行可能

# ✅ 効率的: 並列実行
jobs:
  lint:
    ...
  test:
    ...  # needs なし = 並列実行
```

### キャッシュの活用

```yaml
jobs:
  setup:
    outputs:
      cache-key: ${{ steps.cache.outputs.key }}
    steps:
      - id: cache
        run: echo "key=deps-${{ hashFiles('**/package-lock.json') }}" >> $GITHUB_OUTPUT

  build:
    needs: setup
    steps:
      - uses: actions/cache@v4
        with:
          key: ${{ needs.setup.outputs.cache-key }}
```

## セキュリティ考慮事項

### シークレットの漏洩防止

```yaml
# ❌ 危険: シークレットを出力に含める
outputs:
  token: ${{ secrets.API_TOKEN }} # 絶対にダメ

# ✅ 安全: シークレットは各ジョブで直接参照
steps:
  - run: |
      curl -H "Authorization: ${{ secrets.API_TOKEN }}" ...
```

### 入力のサニタイズ

```yaml
steps:
  - id: sanitize
    run: |
      # ユーザー入力をサニタイズ
      safe_input=$(echo "${{ github.event.inputs.value }}" | tr -cd '[:alnum:]-_')
      echo "value=$safe_input" >> $GITHUB_OUTPUT
```

## ベストプラクティスまとめ

1. **デバッグを最初に**: 問題発生時はまず出力値をログに出力
2. **型を明確に**: 真偽値は文字列 'true'/'false' として扱う
3. **サイズ制限を意識**: 1MB を超えるデータはアーティファクト
4. **並列実行を最大化**: 独立したジョブは依存関係を持たせない
5. **シークレット保護**: 出力にシークレットを含めない
