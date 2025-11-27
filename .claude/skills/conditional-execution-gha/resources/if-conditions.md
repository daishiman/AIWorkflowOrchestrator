# if 条件の詳細リファレンス

## ステータス関数

### success()

前のステップがすべて成功した場合に `true` を返します（デフォルト動作）。

```yaml
steps:
  - name: Build
    run: npm run build

  - name: Deploy (成功時のみ)
    if: success()
    run: npm run deploy
```

**挙動**:
- すべての前ステップが成功 → `true`
- いずれかのステップが失敗 → `false`
- いずれかのステップがスキップ → `false`
- ワークフローがキャンセル → `false`

### always()

前のステップの結果に関係なく常に実行します（キャンセル時を除く）。

```yaml
steps:
  - name: Run tests
    run: npm test

  - name: Upload logs (常に実行)
    if: always()
    uses: actions/upload-artifact@v4
    with:
      name: test-logs
      path: logs/
```

**用途**:
- クリーンアップ処理
- ログ/アーティファクトのアップロード
- 通知の送信
- リソースの解放

### failure()

いずれかの前ステップが失敗した場合に `true` を返します。

```yaml
steps:
  - name: Run tests
    run: npm test

  - name: Notify on failure
    if: failure()
    run: |
      curl -X POST $SLACK_WEBHOOK \
        -d '{"text": "Tests failed!"}'
```

**用途**:
- 失敗時の通知
- エラーレポートの生成
- ロールバック処理
- デバッグ情報の収集

### cancelled()

ワークフローがキャンセルされた場合に `true` を返します。

```yaml
steps:
  - name: Long running task
    run: npm run heavy-task

  - name: Cleanup on cancel
    if: cancelled()
    run: |
      echo "Workflow was cancelled"
      ./cleanup.sh
```

**用途**:
- キャンセル時のクリーンアップ
- リソースの解放
- 中断ログの記録

## ステータス関数の組み合わせ

### success() || failure()

成功または失敗時に実行（スキップ時は実行されない）:

```yaml
- name: Post results
  if: success() || failure()
  run: ./post-results.sh
```

### always() && !cancelled()

常に実行するがキャンセル時は除外:

```yaml
- name: Archive results
  if: always() && !cancelled()
  uses: actions/upload-artifact@v4
  with:
    name: results
    path: results/
```

### failure() && github.ref == 'refs/heads/main'

main ブランチでの失敗時のみ実行:

```yaml
- name: Critical failure alert
  if: failure() && github.ref == 'refs/heads/main'
  run: ./send-alert.sh
```

## 式の評価

### 文字列比較

```yaml
# 等価比較
if: github.ref == 'refs/heads/main'
if: github.event.action == 'opened'

# 不等価比較
if: github.ref != 'refs/heads/develop'

# 大文字小文字を区別しない比較は不可（toLowerCase() など存在しない）
# 回避策: 両方のパターンをチェック
if: github.ref == 'refs/heads/main' || github.ref == 'refs/heads/Main'
```

### 数値比較

```yaml
# GitHub Actions では数値比較演算子は制限されている
# 以下は直接サポートされていない:
# if: steps.test.outputs.coverage > 80  # ❌ サポート外

# 回避策: 文字列比較や外部スクリプト使用
- name: Check coverage threshold
  id: coverage_check
  run: |
    COVERAGE=$(cat coverage.txt)
    if [ "$COVERAGE" -gt 80 ]; then
      echo "pass=true" >> $GITHUB_OUTPUT
    else
      echo "pass=false" >> $GITHUB_OUTPUT
    fi

- name: Deploy if coverage is good
  if: steps.coverage_check.outputs.pass == 'true'
  run: npm run deploy
```

### 論理演算子

```yaml
# AND (&&)
if: github.ref == 'refs/heads/main' && success()

# OR (||)
if: github.event_name == 'push' || github.event_name == 'workflow_dispatch'

# NOT (!)
if: "!cancelled()"
if: github.ref != 'refs/heads/develop'

# 複雑な条件（括弧は使用不可、優先順位は左から右）
if: |
  github.ref == 'refs/heads/main' &&
  github.event_name == 'push' &&
  success()
```

**注意**:
- 括弧 `()` は関数呼び出し以外では使用不可
- 複雑な条件は `|` で複数行に分割可能
- 評価は左から右（短絡評価あり）

### 空文字列チェック

```yaml
# シークレットが設定されているかチェック
if: secrets.API_KEY != ''

# 出力が空でないかチェック
if: steps.build.outputs.result != ''

# 環境変数が設定されているかチェック
if: env.DEPLOY_ENV != ''
```

## コンテキストを使用した条件

### github コンテキスト

```yaml
# リポジトリ名での条件分岐
if: github.repository == 'owner/repo-name'

# アクター（実行ユーザー）での条件分岐
if: github.actor == 'dependabot[bot]'

# イベント名での条件分岐
if: github.event_name == 'pull_request'

# ベースブランチでの条件分岐（PR時）
if: github.base_ref == 'main'

# ヘッドブランチでの条件分岐（PR時）
if: github.head_ref == 'feature/new-feature'
```

### needs コンテキスト（ジョブ間依存）

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    outputs:
      should_deploy: ${{ steps.check.outputs.deploy }}
    steps:
      - id: check
        run: echo "deploy=true" >> $GITHUB_OUTPUT

  deploy:
    needs: build
    # 依存ジョブが成功し、出力が true の場合のみ実行
    if: needs.build.result == 'success' && needs.build.outputs.should_deploy == 'true'
    runs-on: ubuntu-latest
    steps:
      - run: echo "Deploying..."
```

**needs.result の値**:
- `success` - ジョブが成功
- `failure` - ジョブが失敗
- `cancelled` - ジョブがキャンセル
- `skipped` - ジョブがスキップ

### matrix コンテキスト

```yaml
strategy:
  matrix:
    os: [ubuntu-latest, windows-latest, macos-latest]
    node: [18, 20, 22]

steps:
  # Ubuntu + Node 20 の組み合わせでのみ実行
  - name: Integration tests
    if: matrix.os == 'ubuntu-latest' && matrix.node == '20'
    run: npm run test:integration

  # Windows 以外で実行
  - name: Unix-specific tests
    if: matrix.os != 'windows-latest'
    run: ./run-unix-tests.sh
```

### secrets コンテキスト

```yaml
# シークレットが設定されている場合のみ実行
- name: Deploy to AWS
  if: secrets.AWS_ACCESS_KEY_ID != ''
  run: |
    aws s3 sync ./dist s3://my-bucket

# 複数シークレットの存在チェック
- name: Deploy to production
  if: |
    secrets.PROD_TOKEN != '' &&
    secrets.PROD_URL != ''
  run: ./deploy.sh
```

## contains() 関数

### 配列検索

```yaml
# PR ラベルに特定文字列が含まれる
if: contains(github.event.pull_request.labels.*.name, 'deploy')

# 変更ファイルに特定パスが含まれる
if: contains(github.event.commits[0].modified, 'package.json')
```

### 文字列検索

```yaml
# ブランチ名に特定文字列が含まれる
if: contains(github.ref, 'release')

# コミットメッセージに特定文字列が含まれる
if: contains(github.event.head_commit.message, '[skip ci]')

# アクター名に bot が含まれる
if: contains(github.actor, 'bot')
```

## startsWith() / endsWith()

### ブランチ/タグパターン

```yaml
# feature/ で始まるブランチ
if: startsWith(github.ref, 'refs/heads/feature/')

# v で始まるタグ
if: startsWith(github.ref, 'refs/tags/v')

# -beta で終わるタグを除外
if: "!endsWith(github.ref, '-beta')"
```

### ファイルパターン

```yaml
# .ts で終わるファイルが変更された場合
if: endsWith(github.event.head_commit.modified[0], '.ts')

# src/ で始まるパスが変更された場合
if: startsWith(github.event.head_commit.modified[0], 'src/')
```

## 実践的なパターン

### 環境別デプロイメント

```yaml
deploy-dev:
  if: github.ref == 'refs/heads/develop'
  runs-on: ubuntu-latest
  steps:
    - run: npm run deploy:dev

deploy-staging:
  if: startsWith(github.ref, 'refs/heads/release/')
  runs-on: ubuntu-latest
  steps:
    - run: npm run deploy:staging

deploy-prod:
  if: github.ref == 'refs/heads/main'
  runs-on: ubuntu-latest
  steps:
    - run: npm run deploy:prod
```

### 失敗時の詳細ログ収集

```yaml
steps:
  - name: Run tests
    id: tests
    run: npm test

  - name: Collect debug logs on failure
    if: failure() && steps.tests.conclusion == 'failure'
    run: |
      mkdir -p debug-logs
      docker logs my-container > debug-logs/container.log
      npm run test -- --verbose > debug-logs/test-verbose.log

  - name: Upload debug logs
    if: failure()
    uses: actions/upload-artifact@v4
    with:
      name: debug-logs
      path: debug-logs/
```

### 依存ジョブの複雑な条件

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps: [...]

  test:
    runs-on: ubuntu-latest
    steps: [...]

  lint:
    runs-on: ubuntu-latest
    steps: [...]

  deploy:
    needs: [build, test, lint]
    # すべてのジョブが成功し、かつ main ブランチの場合のみ
    if: |
      needs.build.result == 'success' &&
      needs.test.result == 'success' &&
      needs.lint.result == 'success' &&
      github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps: [...]
```

### ラベルベースのトリガー

```yaml
steps:
  - name: Run e2e tests
    if: contains(github.event.pull_request.labels.*.name, 'test:e2e')
    run: npm run test:e2e

  - name: Run performance tests
    if: contains(github.event.pull_request.labels.*.name, 'test:perf')
    run: npm run test:perf

  - name: Auto-merge
    if: |
      contains(github.event.pull_request.labels.*.name, 'automerge') &&
      github.actor == 'dependabot[bot]'
    run: gh pr merge --auto --squash
```

## ベストプラクティス

### 1. デフォルト動作を理解する

```yaml
# これらは同じ
- name: Deploy
  run: npm run deploy

- name: Deploy
  if: success()
  run: npm run deploy
```

### 2. 複雑な条件は読みやすく

```yaml
# ❌ 読みにくい
if: github.ref == 'refs/heads/main' && success() && needs.build.result == 'success' && secrets.TOKEN != ''

# ✅ 読みやすい
if: |
  github.ref == 'refs/heads/main' &&
  success() &&
  needs.build.result == 'success' &&
  secrets.TOKEN != ''
```

### 3. 条件をジョブレベルで活用

```yaml
# ❌ すべてのステップに条件を書く
steps:
  - name: Step 1
    if: github.ref == 'refs/heads/main'
    run: command1
  - name: Step 2
    if: github.ref == 'refs/heads/main'
    run: command2

# ✅ ジョブレベルで条件を書く
jobs:
  deploy:
    if: github.ref == 'refs/heads/main'
    steps:
      - run: command1
      - run: command2
```

### 4. ステータス関数は明示的に

```yaml
# ✅ 意図が明確
- name: Cleanup
  if: always() && !cancelled()
  run: ./cleanup.sh

- name: Notify on failure
  if: failure()
  run: ./notify.sh
```

### 5. シークレットチェックは安全に

```yaml
# ✅ シークレット存在チェック
- name: Deploy
  if: secrets.DEPLOY_TOKEN != ''
  env:
    TOKEN: ${{ secrets.DEPLOY_TOKEN }}
  run: ./deploy.sh

# ❌ シークレットを直接比較しない（ログに漏れる可能性）
if: secrets.DEPLOY_TOKEN == 'expected-value'  # 危険
```
