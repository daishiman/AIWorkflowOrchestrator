# Job Dependencies - GitHub Actions

GitHub Actionsのジョブ依存関係管理の詳細ガイド。

## needs構文の基本

### 単一依存関係

```yaml
jobs:
  job1:
    runs-on: ubuntu-latest
    steps:
      - run: echo "First job"

  job2:
    needs: job1  # job1が完了するまで待機
    runs-on: ubuntu-latest
    steps:
      - run: echo "Second job"
```

**実行順序**: job1 → job2

### 複数依存関係

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - run: npm run build

  lint:
    runs-on: ubuntu-latest
    steps:
      - run: npm run lint

  test:
    needs: [build, lint]  # 両方の完了を待機
    runs-on: ubuntu-latest
    steps:
      - run: npm test
```

**実行順序**: (build, lint) → test

### 依存関係チェーン

```yaml
jobs:
  install:
    runs-on: ubuntu-latest
    steps:
      - run: npm ci

  build:
    needs: install
    runs-on: ubuntu-latest
    steps:
      - run: npm run build

  test:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - run: npm test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - run: npm run deploy
```

**実行順序**: install → build → test → deploy

## 依存関係グラフパターン

### パターン1: シーケンシャル（直列）

```
A → B → C → D
```

```yaml
jobs:
  A:
    runs-on: ubuntu-latest
    steps:
      - run: echo "Step A"

  B:
    needs: A
    runs-on: ubuntu-latest
    steps:
      - run: echo "Step B"

  C:
    needs: B
    runs-on: ubuntu-latest
    steps:
      - run: echo "Step C"

  D:
    needs: C
    runs-on: ubuntu-latest
    steps:
      - run: echo "Step D"
```

**特徴**: 最も遅い実行、各ジョブが順番に実行

### パターン2: ファンアウト（分岐）

```
    ┌→ B
A →─┼→ C
    └→ D
```

```yaml
jobs:
  A:
    runs-on: ubuntu-latest
    steps:
      - run: echo "Build"

  B:
    needs: A
    runs-on: ubuntu-latest
    steps:
      - run: echo "Test Unit"

  C:
    needs: A
    runs-on: ubuntu-latest
    steps:
      - run: echo "Test Integration"

  D:
    needs: A
    runs-on: ubuntu-latest
    steps:
      - run: echo "Test E2E"
```

**特徴**: Aの後にB、C、Dが並列実行

### パターン3: ファンイン（集約）

```
A ┐
B ┼→ D
C ┘
```

```yaml
jobs:
  A:
    runs-on: ubuntu-latest
    steps:
      - run: echo "Lint"

  B:
    runs-on: ubuntu-latest
    steps:
      - run: echo "Test"

  C:
    runs-on: ubuntu-latest
    steps:
      - run: echo "Build"

  D:
    needs: [A, B, C]
    runs-on: ubuntu-latest
    steps:
      - run: echo "Deploy"
```

**特徴**: A、B、Cが並列実行後、Dが実行

### パターン4: ダイアモンド

```
    ┌→ B ┐
A →─┤    ├→ D
    └→ C ┘
```

```yaml
jobs:
  A:
    runs-on: ubuntu-latest
    steps:
      - run: echo "Build"

  B:
    needs: A
    runs-on: ubuntu-latest
    steps:
      - run: echo "Test Unit"

  C:
    needs: A
    runs-on: ubuntu-latest
    steps:
      - run: echo "Test Integration"

  D:
    needs: [B, C]
    runs-on: ubuntu-latest
    steps:
      - run: echo "Deploy"
```

**特徴**: 最も一般的なCI/CDパターン

### パターン5: 複雑グラフ

```
    ┌→ B → E ┐
A →─┤        ├→ G
    └→ C → F ┘
       ↓
       D
```

```yaml
jobs:
  A:
    runs-on: ubuntu-latest
    steps:
      - run: echo "Install"

  B:
    needs: A
    runs-on: ubuntu-latest
    steps:
      - run: echo "Build Frontend"

  C:
    needs: A
    runs-on: ubuntu-latest
    steps:
      - run: echo "Build Backend"

  D:
    needs: C
    runs-on: ubuntu-latest
    steps:
      - run: echo "Test Backend"

  E:
    needs: B
    runs-on: ubuntu-latest
    steps:
      - run: echo "Test Frontend"

  G:
    needs: [E, F]
    runs-on: ubuntu-latest
    steps:
      - run: echo "Deploy"
```

## 条件付き依存関係

### always()を使用した常時実行

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - run: exit 1  # 失敗するステップ

  report:
    needs: test
    if: always()  # testの結果に関わらず実行
    runs-on: ubuntu-latest
    steps:
      - run: echo "Generate report"
```

**用途**: レポート生成、通知、クリーンアップ

### success()を使用した成功時のみ実行

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - run: npm test

  deploy:
    needs: test
    if: success()  # testが成功した場合のみ
    runs-on: ubuntu-latest
    steps:
      - run: npm run deploy
```

**用途**: デプロイ、リリース作成

### failure()を使用した失敗時のみ実行

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - run: npm test

  notify-failure:
    needs: test
    if: failure()  # testが失敗した場合のみ
    runs-on: ubuntu-latest
    steps:
      - run: echo "Send failure notification"
```

**用途**: エラー通知、ロールバック

### 複合条件

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - run: npm test

  deploy-prod:
    needs: test
    if: success() && github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - run: echo "Deploy to production"

  deploy-staging:
    needs: test
    if: success() && github.ref == 'refs/heads/develop'
    runs-on: ubuntu-latest
    steps:
      - run: echo "Deploy to staging"
```

## 依存関係のベストプラクティス

### 1. 最小限の依存関係

❌ **悪い例**: 不要な依存関係

```yaml
jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - run: npm run lint

  test:
    needs: lint  # 不要な依存関係
    runs-on: ubuntu-latest
    steps:
      - run: npm test
```

✅ **良い例**: 独立したジョブは並列化

```yaml
jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - run: npm run lint

  test:
    runs-on: ubuntu-latest
    steps:
      - run: npm test
```

### 2. 論理的なグルーピング

✅ **良い例**: 関連するジョブをグループ化

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - run: npm run build

  # 並列テストグループ
  test-unit:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - run: npm run test:unit

  test-integration:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - run: npm run test:integration

  test-e2e:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - run: npm run test:e2e

  # すべてのテスト完了後にデプロイ
  deploy:
    needs: [test-unit, test-integration, test-e2e]
    runs-on: ubuntu-latest
    steps:
      - run: npm run deploy
```

### 3. クリティカルパスの最適化

**クリティカルパス**: ワークフロー全体の実行時間を決定する最長パス

```yaml
jobs:
  # クリティカルパス: build → test → deploy
  build:
    runs-on: ubuntu-latest
    steps:
      - run: npm run build  # 5分

  test:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - run: npm test  # 3分

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - run: npm run deploy  # 2分

  # 非クリティカルパス（並列実行）
  lint:
    runs-on: ubuntu-latest
    steps:
      - run: npm run lint  # 1分

  docs:
    runs-on: ubuntu-latest
    steps:
      - run: npm run docs  # 2分
```

**合計実行時間**: 10分（クリティカルパス）、lintとdocsは並列実行

### 4. 失敗時の早期終了

```yaml
jobs:
  # 高速で重要なチェック
  lint:
    runs-on: ubuntu-latest
    steps:
      - run: npm run lint

  # lintが成功した場合のみ実行
  build:
    needs: lint
    runs-on: ubuntu-latest
    steps:
      - run: npm run build

  # buildが成功した場合のみ実行
  test:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - run: npm test
```

**利点**: lintが失敗した場合、buildとtestはスキップされ、リソースを節約

## 循環依存の防止

❌ **エラー**: 循環依存

```yaml
jobs:
  A:
    needs: B  # エラー: 循環依存
    runs-on: ubuntu-latest
    steps:
      - run: echo "A"

  B:
    needs: A
    runs-on: ubuntu-latest
    steps:
      - run: echo "B"
```

**エラーメッセージ**: "Job 'A' depends on job 'B', which depends on 'A'"

✅ **解決**: 依存関係を再設計

```yaml
jobs:
  A:
    runs-on: ubuntu-latest
    steps:
      - run: echo "A"

  B:
    needs: A
    runs-on: ubuntu-latest
    steps:
      - run: echo "B"
```

## デバッグとトラブルシューティング

### 依存関係の可視化

```bash
# Mermaid形式で依存関係グラフを生成
node .claude/skills/parallel-jobs-gha/scripts/visualize-deps.mjs .github/workflows/ci.yml
```

### ジョブステータスの確認

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - run: npm test

  debug:
    needs: test
    if: always()
    runs-on: ubuntu-latest
    steps:
      - run: |
          echo "Test status: ${{ needs.test.result }}"
          # 可能な値: success, failure, cancelled, skipped
```

### タイムアウトの設定

```yaml
jobs:
  long-running-job:
    runs-on: ubuntu-latest
    timeout-minutes: 30  # 30分でタイムアウト
    steps:
      - run: npm test
```

---

**関連リソース**:
- [data-passing.md](./data-passing.md) - ジョブ間データ受け渡し
- [templates/parallel-workflow.yaml](../templates/parallel-workflow.yaml) - 実装例
