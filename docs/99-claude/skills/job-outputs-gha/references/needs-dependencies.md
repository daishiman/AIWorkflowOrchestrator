# needs依存関係詳細

## 概要

このドキュメントでは、GitHub Actionsの `needs` キーワードによる
ジョブ間依存関係の詳細な設定方法を解説します。

## 基本構文

### 単一依存関係

```yaml
jobs:
  job1:
    runs-on: ubuntu-latest
    steps:
      - run: echo "ジョブ1実行"

  job2:
    needs: job1 # job1の完了を待つ
    runs-on: ubuntu-latest
    steps:
      - run: echo "ジョブ2実行"
```

### 複数依存関係

```yaml
jobs:
  build:
    runs-on: ubuntu-latest

  test:
    runs-on: ubuntu-latest

  deploy:
    needs: [build, test] # 両方の完了を待つ
    runs-on: ubuntu-latest
```

## 依存関係の種類

### 直列依存（シーケンシャル）

```yaml
jobs:
  step1: ...
  step2:
    needs: step1
  step3:
    needs: step2
  # 実行順序: step1 → step2 → step3
```

### 並列から集約（ファンイン）

```yaml
jobs:
  parallel1: ...
  parallel2: ...
  parallel3: ...
  aggregate:
    needs: [parallel1, parallel2, parallel3]
    # parallel1, 2, 3 は並列実行、全て完了後に aggregate 実行
```

### 分岐（ファンアウト）

```yaml
jobs:
  prepare:
    outputs:
      config: ${{ steps.c.outputs.json }}

  deploy-east:
    needs: prepare
    ...
  deploy-west:
    needs: prepare
    ...
  # prepare 完了後、deploy-east と deploy-west は並列実行
```

### ダイヤモンド依存

```yaml
jobs:
  prepare: ...
  build-frontend:
    needs: prepare
  build-backend:
    needs: prepare
  deploy:
    needs: [build-frontend, build-backend]
  # prepare → (frontend, backend 並列) → deploy
```

## 条件付き依存

### always() - 常に実行

```yaml
jobs:
  test: ...

  cleanup:
    needs: test
    if: always() # test が失敗しても実行
    steps:
      - run: echo "クリーンアップ"
```

### failure() - 失敗時のみ

```yaml
jobs:
  build: ...

  notify-failure:
    needs: build
    if: failure() # build が失敗した場合のみ
    steps:
      - run: echo "ビルド失敗通知"
```

### success() - 成功時のみ（デフォルト）

```yaml
jobs:
  test: ...

  deploy:
    needs: test
    if: success() # デフォルト動作
    steps:
      - run: echo "デプロイ"
```

### cancelled() - キャンセル時

```yaml
jobs:
  long-running: ...

  cleanup-on-cancel:
    needs: long-running
    if: cancelled()
    steps:
      - run: echo "キャンセル時のクリーンアップ"
```

## ジョブ結果の参照

### result プロパティ

```yaml
jobs:
  job1: ...

  job2:
    needs: job1
    if: always()
    steps:
      - run: |
          echo "job1の結果: ${{ needs.job1.result }}"
          # 値: success, failure, cancelled, skipped
```

### 複数ジョブの結果確認

```yaml
jobs:
  summary:
    needs: [build, test, lint]
    if: always()
    steps:
      - run: |
          echo "ビルド: ${{ needs.build.result }}"
          echo "テスト: ${{ needs.test.result }}"
          echo "リント: ${{ needs.lint.result }}"

          if [ "${{ needs.build.result }}" == "success" ] && \
             [ "${{ needs.test.result }}" == "success" ]; then
            echo "全てのジョブが成功"
          else
            echo "一部のジョブが失敗"
          fi
```

## DAG（有向非巡回グラフ）の原則

### 循環依存は不可

```yaml
# ❌ エラー: 循環依存
jobs:
  job1:
    needs: job3
  job2:
    needs: job1
  job3:
    needs: job2
  # job1 → job2 → job3 → job1 は循環
```

### 暗黙の依存関係に注意

```yaml
# needs を使わなければ並列実行
jobs:
  job1:
    runs-on: ubuntu-latest

  job2:
    runs-on: ubuntu-latest
    # needs がないので job1 と並列実行される
```

## ベストプラクティス

1. **明示的な依存関係**: 必要な依存は必ず needs で宣言
2. **最小限の依存**: 不要な依存関係は設定しない（並列実行を妨げる）
3. **always() の活用**: クリーンアップジョブには always() を使用
4. **result の確認**: 失敗したジョブの結果も確認可能
5. **DAG構造の維持**: 循環依存を絶対に作らない

## トラブルシューティング

| 問題                 | 原因                     | 解決策                |
| -------------------- | ------------------------ | --------------------- |
| ジョブが実行されない | 依存ジョブが失敗         | `if: always()` を追加 |
| 出力が参照できない   | needs が設定されていない | needs を追加          |
| 循環依存エラー       | DAG違反                  | 依存関係を見直す      |
| 実行順序が不定       | needs が不足             | 必要な依存を追加      |
