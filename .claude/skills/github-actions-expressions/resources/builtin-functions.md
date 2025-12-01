# 組み込み関数

## 概要

GitHub Actionsは、式内で使用できる組み込み関数を提供しています。
これらの関数を使用することで、文字列操作、配列処理、JSON変換、ファイルハッシュ計算など、
高度な条件判定や動的な値生成が可能になります。

## 文字列関数

### contains

配列や文字列に特定の値が含まれているかを判定します。

**シグネチャ**:
```
contains(search, item)
```

**パラメータ**:
- `search`: 検索対象（文字列または配列）
- `item`: 検索する値（文字列）

**戻り値**: `true` または `false`

**使用例**:

```yaml
# 文字列内の検索
- if: contains(github.ref, 'refs/tags/')
  run: echo "Tag event"

- if: contains(github.event.head_commit.message, '[skip ci]')
  run: echo "Skipping CI"

# 配列内の検索
- if: contains(github.event.pull_request.labels.*.name, 'deploy')
  run: echo "Deploy label found"

# OR条件として活用
- if: |
    contains(github.ref, 'refs/heads/main') ||
    contains(github.ref, 'refs/heads/develop')
  run: echo "Main or develop branch"

# 複数ラベルチェック
- if: |
    contains(github.event.pull_request.labels.*.name, 'approved') &&
    !contains(github.event.pull_request.labels.*.name, 'do-not-merge')
  run: echo "Ready to merge"
```

**注意点**:
- 大文字小文字を区別
- 部分一致で検索

### startsWith

文字列が特定の接頭辞で始まるかを判定します。

**シグネチャ**:
```
startsWith(search, prefix)
```

**パラメータ**:
- `search`: 検索対象の文字列
- `prefix`: 接頭辞

**戻り値**: `true` または `false`

**使用例**:

```yaml
# ブランチ判定
- if: startsWith(github.ref, 'refs/heads/feature/')
  run: echo "Feature branch"

- if: startsWith(github.ref, 'refs/heads/release/')
  run: echo "Release branch"

# タグ判定
- if: startsWith(github.ref, 'refs/tags/v')
  run: echo "Version tag"

# PRブランチ判定
- if: startsWith(github.head_ref, 'hotfix/')
  run: echo "Hotfix branch"

# コミットメッセージ判定
- if: startsWith(github.event.head_commit.message, 'feat:')
  run: echo "Feature commit (conventional commits)"
```

### endsWith

文字列が特定の接尾辞で終わるかを判定します。

**シグネチャ**:
```
endsWith(search, suffix)
```

**パラメータ**:
- `search`: 検索対象の文字列
- `suffix`: 接尾辞

**戻り値**: `true` または `false`

**使用例**:

```yaml
# ファイル拡張子チェック
- if: endsWith(github.event.head_commit.modified[0], '.md')
  run: echo "Markdown file modified"

# OS判定
- if: endsWith(matrix.os, '-latest')
  run: echo "Using latest OS version"

# ブランチ名パターン
- if: endsWith(github.ref_name, '-staging')
  run: echo "Staging branch"
```

### format

フォーマット文字列を使用して文字列を生成します。

**シグネチャ**:
```
format(template, arg0, arg1, ...)
```

**パラメータ**:
- `template`: フォーマット文字列（`{0}`, `{1}`, ...のプレースホルダーを含む）
- `arg0`, `arg1`, ...: 置換する値

**戻り値**: フォーマットされた文字列

**使用例**:

```yaml
# バージョンタグ生成
- name: Generate version tag
  env:
    TAG: ${{ format('v{0}.{1}.{2}', steps.major.outputs.value, steps.minor.outputs.value, steps.patch.outputs.value) }}
  run: echo "TAG=$TAG"

# Docker イメージタグ
- name: Build image
  run: |
    TAG=${{ format('{0}:{1}', github.repository, github.sha) }}
    docker build -t $TAG .

# 複雑な文字列生成
- env:
    MESSAGE: ${{ format('Deploy {0} to {1} by {2}', github.ref_name, inputs.environment, github.actor) }}
  run: echo "$MESSAGE"

# URLの組み立て
- env:
    API_URL: ${{ format('{0}/api/v{1}/resources', vars.BASE_URL, vars.API_VERSION) }}
  run: curl "$API_URL"
```

## 配列・オブジェクト関数

### join

配列の要素を指定した区切り文字で結合します。

**シグネチャ**:
```
join(array, separator)
```

**パラメータ**:
- `array`: 結合する配列
- `separator`: 区切り文字（省略時は`,`）

**戻り値**: 結合された文字列

**使用例**:

```yaml
# マトリクス値の結合
- name: Display matrix
  run: echo "Testing on ${{ join(matrix.*, '-') }}"

# 配列値の結合
- env:
    TAGS: ${{ join(github.event.pull_request.labels.*.name, ', ') }}
  run: echo "PR labels: $TAGS"

# 複数値をコマンド引数に
- name: Run with multiple args
  run: |
    args="${{ join(matrix.test-files, ' ') }}"
    pnpm test $args
```

### toJSON

値をJSON文字列に変換します。

**シグネチャ**:
```
toJSON(value)
```

**パラメータ**:
- `value`: JSON化する値（オブジェクト、配列、文字列、数値など）

**戻り値**: JSON形式の文字列

**使用例**:

```yaml
# コンテキスト全体のダンプ
- name: Dump GitHub context
  env:
    GITHUB_CONTEXT: ${{ toJSON(github) }}
  run: echo "$GITHUB_CONTEXT"

# イベントペイロードの保存
- name: Save event payload
  run: |
    echo '${{ toJSON(github.event) }}' > event.json

# マトリクス値の保存
- name: Save matrix config
  run: echo '${{ toJSON(matrix) }}' > matrix.json

# 複雑なオブジェクトの受け渡し
- name: Pass data to action
  uses: ./my-action
  with:
    config: ${{ toJSON(steps.prepare.outputs) }}

# デバッグ用の詳細ログ
- if: runner.debug == '1'
  name: Debug info
  run: |
    echo "Job context: ${{ toJSON(job) }}"
    echo "Steps context: ${{ toJSON(steps) }}"
    echo "Runner context: ${{ toJSON(runner) }}"
```

### fromJSON

JSON文字列をオブジェクトに変換します。

**シグネチャ**:
```
fromJSON(json)
```

**パラメータ**:
- `json`: JSON形式の文字列

**戻り値**: パースされたオブジェクト

**使用例**:

```yaml
# 動的マトリクスの生成
jobs:
  setup:
    runs-on: ubuntu-latest
    outputs:
      matrix: ${{ steps.set-matrix.outputs.matrix }}
    steps:
      - id: set-matrix
        run: |
          MATRIX='{"include":[{"os":"ubuntu-latest","node":"18"},{"os":"windows-latest","node":"20"}]}'
          echo "matrix=$MATRIX" >> $GITHUB_OUTPUT

  test:
    needs: setup
    strategy:
      matrix: ${{ fromJSON(needs.setup.outputs.matrix) }}
    runs-on: ${{ matrix.os }}
    steps:
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node }}

# 設定ファイルからの動的読み込み
- id: read-config
  run: echo "config=$(cat config.json)" >> $GITHUB_OUTPUT

- name: Use config
  env:
    CONFIG: ${{ fromJSON(steps.read-config.outputs.config) }}
  run: |
    echo "Environment: ${{ fromJSON(steps.read-config.outputs.config).environment }}"
    echo "Version: ${{ fromJSON(steps.read-config.outputs.config).version }}"

# 条件付きマトリクス展開
- id: matrix
  run: |
    if [ "${{ github.event_name }}" == "push" ]; then
      echo 'matrix={"os":["ubuntu-latest","windows-latest"]}' >> $GITHUB_OUTPUT
    else
      echo 'matrix={"os":["ubuntu-latest"]}' >> $GITHUB_OUTPUT
    fi

test:
  strategy:
    matrix: ${{ fromJSON(needs.setup.outputs.matrix) }}
```

## ファイル関数

### hashFiles

指定されたパターンに一致するファイルのハッシュ値を計算します。

**シグネチャ**:
```
hashFiles(pattern, ...)
```

**パラメータ**:
- `pattern`: ファイルパターン（複数指定可能）

**戻り値**: ハッシュ値（SHA-256）、ファイルが見つからない場合は空文字列

**使用例**:

```yaml
# キャッシュキーの生成
- uses: actions/cache@v3
  with:
    path: ~/.pnpm
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}

# 複数ファイルのハッシュ
- uses: actions/cache@v3
  with:
    path: |
      ~/.cargo
      target/
    key: ${{ runner.os }}-cargo-${{ hashFiles('**/Cargo.lock', '**/Cargo.toml') }}

# 条件付き実行
- id: check-changes
  run: echo "HASH=${{ hashFiles('src/**/*.ts', 'src/**/*.tsx') }}" >> $GITHUB_OUTPUT

- if: steps.check-changes.outputs.HASH != ''
  run: pnpm run build

# 環境変数として使用
- env:
    DEPS_HASH: ${{ hashFiles('requirements.txt', 'setup.py') }}
  run: |
    echo "Dependencies hash: $DEPS_HASH"
    pip install -r requirements.txt
```

**注意点**:
- ワークスペース（`GITHUB_WORKSPACE`）内のファイルのみ対象
- `.gitignore`されたファイルは無視
- パターンはglobスタイル

## ステータスチェック関数

これらの関数は主に`if`条件で使用され、ステップやジョブの実行状態を判定します。

### success

前のステップがすべて成功した場合に`true`を返します。

**シグネチャ**:
```
success()
```

**戻り値**: `true` または `false`

**使用例**:

```yaml
# 成功時のみ実行
- if: success()
  run: pnpm run deploy

# デフォルト動作（省略可能）
- run: echo "This runs only if previous steps succeeded"

# 明示的な成功チェック
- name: Notify success
  if: success()
  run: |
    curl -X POST ${{ secrets.WEBHOOK_URL }} \
      -d '{"status": "success"}'
```

### failure

いずれかのステップが失敗した場合に`true`を返します。

**シグネチャ**:
```
failure()
```

**戻り値**: `true` または `false`

**使用例**:

```yaml
# 失敗時のクリーンアップ
- if: failure()
  run: docker-compose down

# 失敗通知
- name: Notify failure
  if: failure()
  run: |
    curl -X POST ${{ secrets.WEBHOOK_URL }} \
      -d '{"status": "failure", "job": "${{ github.job }}"}'

# エラーログの収集
- if: failure()
  run: |
    mkdir -p logs
    docker logs app_container > logs/app.log
    docker logs db_container > logs/db.log

- if: failure()
  uses: actions/upload-artifact@v3
  with:
    name: error-logs
    path: logs/
```

### always

ステップの成功・失敗に関わらず常に`true`を返します。

**シグネチャ**:
```
always()
```

**戻り値**: `true`

**使用例**:

```yaml
# 必ず実行されるクリーンアップ
- if: always()
  run: |
    docker-compose down
    rm -rf temp/

# 常に実行される通知
- name: Send notification
  if: always()
  run: |
    STATUS="${{ job.status }}"
    curl -X POST ${{ secrets.WEBHOOK_URL }} \
      -d "{\"status\": \"$STATUS\"}"

# テストレポートのアップロード
- if: always()
  uses: actions/upload-artifact@v3
  with:
    name: test-results
    path: test-results/
```

### cancelled

ワークフローがキャンセルされた場合に`true`を返します。

**シグネチャ**:
```
cancelled()
```

**戻り値**: `true` または `false`

**使用例**:

```yaml
# キャンセル時のクリーンアップ
- if: cancelled()
  run: |
    echo "Workflow cancelled, cleaning up..."
    docker stop $(docker ps -aq)

# キャンセル通知
- name: Notify cancellation
  if: cancelled()
  run: |
    curl -X POST ${{ secrets.WEBHOOK_URL }} \
      -d '{"status": "cancelled"}'
```

### 組み合わせ例

```yaml
steps:
  - name: Run tests
    run: pnpm test

  - name: Deploy (success only)
    if: success()
    run: pnpm run deploy

  - name: Rollback (failure only)
    if: failure()
    run: pnpm run rollback

  - name: Cleanup (always)
    if: always()
    run: docker-compose down

  - name: Notify
    if: always()
    run: |
      if [ "${{ job.status }}" == "success" ]; then
        echo "✅ Success"
      elif [ "${{ job.status }}" == "failure" ]; then
        echo "❌ Failure"
      else
        echo "⚠️ Cancelled"
      fi
```

## 高度な使用例

### 動的マトリクス生成

```yaml
jobs:
  setup:
    runs-on: ubuntu-latest
    outputs:
      matrix: ${{ steps.matrix.outputs.value }}
    steps:
      - id: matrix
        run: |
          if [ "${{ github.event_name }}" == "pull_request" ]; then
            echo 'value={"os":["ubuntu-latest"],"node":["18"]}' >> $GITHUB_OUTPUT
          else
            echo 'value={"os":["ubuntu-latest","windows-latest","macos-latest"],"node":["16","18","20"]}' >> $GITHUB_OUTPUT
          fi

  test:
    needs: setup
    strategy:
      matrix: ${{ fromJSON(needs.setup.outputs.matrix) }}
    runs-on: ${{ matrix.os }}
    steps:
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node }}
      - run: pnpm test
```

### 複雑な条件分岐

```yaml
- name: Complex conditional
  if: |
    (success() && github.ref == 'refs/heads/main') ||
    (failure() && contains(github.event.head_commit.message, '[force-deploy]'))
  run: pnpm run deploy

- name: Multi-factor check
  if: |
    github.event_name == 'pull_request' &&
    contains(github.event.pull_request.labels.*.name, 'approved') &&
    !contains(github.event.pull_request.labels.*.name, 'wip') &&
    startsWith(github.head_ref, 'release/')
  run: echo "Ready for release"
```

### キャッシュ戦略

```yaml
- name: Cache dependencies
  uses: actions/cache@v3
  with:
    path: |
      ~/.pnpm
      ~/.cache
    key: ${{ runner.os }}-${{ runner.arch }}-${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      ${{ runner.os }}-${{ runner.arch }}-
      ${{ runner.os }}-

- name: Cache with multiple factors
  uses: actions/cache@v3
  with:
    path: build/
    key: ${{ format('{0}-{1}-{2}', runner.os, github.ref_name, hashFiles('src/**')) }}
```

## 参考資料

- GitHub公式ドキュメント: [Expressions - Functions](https://docs.github.com/en/actions/learn-github-actions/expressions#functions)
- GitHub公式ドキュメント: [Status check functions](https://docs.github.com/en/actions/learn-github-actions/expressions#status-check-functions)
