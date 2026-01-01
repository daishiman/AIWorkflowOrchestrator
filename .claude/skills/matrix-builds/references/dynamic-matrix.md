# 動的マトリックス生成

GitHub Actionsで実行時にマトリックスを動的に生成する方法。

---

## fromJSON: JSON文字列からマトリックス生成

### 基本パターン

```yaml
jobs:
  setup:
    runs-on: ubuntu-latest
    outputs:
      matrix: ${{ steps.set-matrix.outputs.matrix }}
    steps:
      - id: set-matrix
        run: |
          echo "matrix={\"node\":[18,20,22],\"os\":[\"ubuntu-latest\",\"windows-latest\"]}" >> $GITHUB_OUTPUT

  test:
    needs: setup
    strategy:
      matrix: ${{ fromJSON(needs.setup.outputs.matrix) }}
    runs-on: ${{ matrix.os }}
    steps:
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node }}
```

**動作**:

1. `setup`ジョブでマトリックスJSON生成
2. `test`ジョブで`fromJSON()`でパース
3. 2 OS × 3 Node = 6ジョブ実行

---

## 変更ファイルに基づく動的マトリックス

### 例: 変更されたサービスのみテスト

```yaml
jobs:
  detect-changes:
    runs-on: ubuntu-latest
    outputs:
      services: ${{ steps.filter.outputs.services }}
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: 変更サービス検出
        id: filter
        run: |
          CHANGED_DIRS=$(git diff --name-only ${{ github.event.before }} ${{ github.sha }} \
            | grep '^services/' \
            | cut -d'/' -f2 \
            | sort -u \
            | jq -R -s -c 'split("\n")[:-1]')

          # 変更なしの場合はデフォルト
          if [ "$CHANGED_DIRS" = "[]" ]; then
            CHANGED_DIRS='["api","web","worker"]'
          fi

          echo "services=$CHANGED_DIRS" >> $GITHUB_OUTPUT
          echo "Changed services: $CHANGED_DIRS"

  test:
    needs: detect-changes
    if: needs.detect-changes.outputs.services != '[]'
    strategy:
      matrix:
        service: ${{ fromJSON(needs.detect-changes.outputs.services) }}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: ${{ matrix.service }}のテスト
        run: |
          cd services/${{ matrix.service }}
          pnpm test
```

**動作**:

- `services/api/`変更 → `api`のみテスト
- `services/web/`と`services/worker/`変更 → 両方テスト
- 変更なし → 全サービステスト

---

## 条件付きマトリックス生成

### ブランチ別マトリックス

```yaml
jobs:
  setup-matrix:
    runs-on: ubuntu-latest
    outputs:
      matrix: ${{ steps.set-matrix.outputs.matrix }}
    steps:
      - id: set-matrix
        run: |
          if [[ "${{ github.ref }}" == "refs/heads/main" ]]; then
            # mainブランチ: 全環境
            MATRIX='{"environment":["dev","staging","prod"]}'
          else
            # featureブランチ: devのみ
            MATRIX='{"environment":["dev"]}'
          fi
          echo "matrix=$MATRIX" >> $GITHUB_OUTPUT

  deploy:
    needs: setup-matrix
    strategy:
      matrix: ${{ fromJSON(needs.setup-matrix.outputs.matrix) }}
    runs-on: ubuntu-latest
    steps:
      - name: ${{ matrix.environment }}へデプロイ
        run: echo "Deploying to ${{ matrix.environment }}"
```

---

## スクリプトベースのマトリックス生成

### Node.jsスクリプトで生成

**`.github/scripts/generate-matrix.mjs`**:

```javascript
import { readFileSync, readdirSync } from "fs";
import { join } from "path";

// package.jsonからサポートNode.jsバージョン取得
const packageJson = JSON.parse(readFileSync("package.json", "utf8"));
const nodeVersions = packageJson.engines?.node?.match(/\d+/g)?.map(Number) || [
  18, 20, 22,
];

// 実際に存在するサービスを検出
const services = readdirSync("services", { withFileTypes: true })
  .filter((dirent) => dirent.isDirectory())
  .map((dirent) => dirent.name);

// マトリックス生成
const matrix = {
  os: ["ubuntu-latest", "windows-latest", "macos-latest"],
  node: nodeVersions,
  include: services.map((service) => ({
    service,
    "working-directory": `services/${service}`,
  })),
};

// GitHub Actions出力形式
console.log(JSON.stringify(matrix));
```

**ワークフロー**:

```yaml
jobs:
  generate-matrix:
    runs-on: ubuntu-latest
    outputs:
      matrix: ${{ steps.generate.outputs.matrix }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20

      - id: generate
        run: |
          MATRIX=$(node .github/scripts/generate-matrix.mjs)
          echo "matrix=$MATRIX" >> $GITHUB_OUTPUT

  test:
    needs: generate-matrix
    strategy:
      matrix: ${{ fromJSON(needs.generate-matrix.outputs.matrix) }}
    runs-on: ${{ matrix.os }}
    steps:
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node }}
      - name: Test ${{ matrix.service }}
        working-directory: ${{ matrix.working-directory }}
        run: pnpm test
```

---

## APIレスポンスからマトリックス生成

### 例: デプロイ対象を外部APIから取得

```yaml
jobs:
  fetch-targets:
    runs-on: ubuntu-latest
    outputs:
      targets: ${{ steps.api.outputs.targets }}
    steps:
      - id: api
        run: |
          TARGETS=$(curl -H "Authorization: Bearer ${{ secrets.API_TOKEN }}" \
            https://api.example.com/deploy-targets \
            | jq -c '.environments')
          echo "targets=$TARGETS" >> $GITHUB_OUTPUT

  deploy:
    needs: fetch-targets
    strategy:
      matrix:
        target: ${{ fromJSON(needs.fetch-targets.outputs.targets) }}
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to ${{ matrix.target.name }}
        run: |
          echo "Region: ${{ matrix.target.region }}"
          echo "URL: ${{ matrix.target.url }}"
```

**APIレスポンス例**:

```json
{
  "environments": [
    {
      "name": "prod-us",
      "region": "us-east-1",
      "url": "https://us.example.com"
    },
    {
      "name": "prod-eu",
      "region": "eu-west-1",
      "url": "https://eu.example.com"
    }
  ]
}
```

---

## ファイル内容からマトリックス生成

### 設定ファイルベースのマトリックス

**`matrix-config.json`**:

```json
{
  "browsers": [
    { "name": "chrome", "version": "latest" },
    { "name": "firefox", "version": "latest" },
    { "name": "safari", "version": "16" }
  ]
}
```

**ワークフロー**:

```yaml
jobs:
  setup:
    runs-on: ubuntu-latest
    outputs:
      matrix: ${{ steps.read-config.outputs.matrix }}
    steps:
      - uses: actions/checkout@v4
      - id: read-config
        run: |
          MATRIX=$(jq -c '.browsers' matrix-config.json)
          echo "matrix=$MATRIX" >> $GITHUB_OUTPUT

  test:
    needs: setup
    strategy:
      matrix:
        browser: ${{ fromJSON(needs.setup.outputs.matrix) }}
    runs-on: ubuntu-latest
    steps:
      - name: Test on ${{ matrix.browser.name }} ${{ matrix.browser.version }}
        run: echo "Testing..."
```

---

## 複雑な動的マトリックス例

### 変更ファイル + OS + Node.jsバージョン

```yaml
jobs:
  detect-changes:
    runs-on: ubuntu-latest
    outputs:
      packages: ${{ steps.filter.outputs.packages }}
      matrix: ${{ steps.build-matrix.outputs.matrix }}
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: 変更パッケージ検出
        id: filter
        run: |
          PACKAGES=$(git diff --name-only HEAD~1 HEAD \
            | grep '^packages/' \
            | cut -d'/' -f2 \
            | sort -u \
            | jq -R -s -c 'split("\n")[:-1]')
          echo "packages=$PACKAGES" >> $GITHUB_OUTPUT

      - name: マトリックス構築
        id: build-matrix
        run: |
          PACKAGES='${{ steps.filter.outputs.packages }}'

          # 変更パッケージがある場合
          if [ "$PACKAGES" != "[]" ]; then
            # OS: ubuntu, windows
            # Node: 18, 20, 22
            # 変更パッケージのみ
            MATRIX=$(jq -n \
              --argjson pkgs "$PACKAGES" \
              '{
                os: ["ubuntu-latest", "windows-latest"],
                node: [18, 20, 22],
                package: $pkgs
              }')
          else
            # 変更なし: デフォルトマトリックス
            MATRIX='{"os":["ubuntu-latest"],"node":[20],"package":["core"]}'
          fi

          echo "matrix=$MATRIX" >> $GITHUB_OUTPUT
          echo "Generated matrix: $MATRIX"

  test:
    needs: detect-changes
    strategy:
      matrix: ${{ fromJSON(needs.detect-changes.outputs.matrix) }}
    runs-on: ${{ matrix.os }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node }}

      - name: Test ${{ matrix.package }}
        run: |
          cd packages/${{ matrix.package }}
          pnpm test
```

**動作**:

- `packages/auth/`変更 → `auth`パッケージを2 OS × 3 Node = 6ジョブ
- `packages/api/`と`packages/db/`変更 → 両方を12ジョブ
- 変更なし → `core`のみubuntu + Node 20で1ジョブ

---

## 環境変数ベースのマトリックス

### シークレットから動的生成

```yaml
jobs:
  setup:
    runs-on: ubuntu-latest
    outputs:
      matrix: ${{ steps.env-matrix.outputs.matrix }}
    steps:
      - id: env-matrix
        env:
          DEPLOY_REGIONS: ${{ secrets.DEPLOY_REGIONS }}
        run: |
          # secrets.DEPLOY_REGIONS = "us-east-1,eu-west-1,ap-northeast-1"
          REGIONS=$(echo "$DEPLOY_REGIONS" | jq -R 'split(",") | {region: .}')
          echo "matrix=$REGIONS" >> $GITHUB_OUTPUT

  deploy:
    needs: setup
    strategy:
      matrix: ${{ fromJSON(needs.setup.outputs.matrix) }}
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to ${{ matrix.region }}
        run: echo "Deploying to ${{ matrix.region }}"
```

---

## マトリックスの検証とデバッグ

### マトリックス内容の確認

```yaml
jobs:
  setup:
    runs-on: ubuntu-latest
    outputs:
      matrix: ${{ steps.set-matrix.outputs.matrix }}
    steps:
      - id: set-matrix
        run: |
          MATRIX='{"node":[18,20,22],"os":["ubuntu-latest","windows-latest"]}'
          echo "matrix=$MATRIX" >> $GITHUB_OUTPUT

          # デバッグ: マトリックス内容を表示
          echo "::notice::Generated matrix: $MATRIX"

          # 検証: 有効なJSONか確認
          echo "$MATRIX" | jq . > /dev/null || {
            echo "::error::Invalid JSON matrix"
            exit 1
          }

  test:
    needs: setup
    strategy:
      matrix: ${{ fromJSON(needs.setup.outputs.matrix) }}
    runs-on: ${{ matrix.os }}
    steps:
      - name: デバッグ情報
        run: |
          echo "OS: ${{ matrix.os }}"
          echo "Node: ${{ matrix.node }}"
          echo "Runner: ${{ runner.os }}"
```

---

## ベストプラクティス

### 1. フォールバック設定

```yaml
- id: set-matrix
  run: |
    MATRIX=$(generate-matrix-script.sh)

    # 空の場合はデフォルト
    if [ -z "$MATRIX" ] || [ "$MATRIX" = "[]" ]; then
      MATRIX='{"os":["ubuntu-latest"],"node":[20]}'
      echo "::warning::Using default matrix"
    fi

    echo "matrix=$MATRIX" >> $GITHUB_OUTPUT
```

### 2. マトリックスサイズ制限

```yaml
- id: set-matrix
  run: |
    CHANGED_FILES=$(git diff --name-only HEAD~1 HEAD | wc -l)

    # 変更ファイルが多すぎる場合は制限
    if [ $CHANGED_FILES -gt 10 ]; then
      echo "::warning::Too many changes ($CHANGED_FILES files), limiting matrix"
      MATRIX='{"test":["critical"]}'
    else
      MATRIX=$(generate-full-matrix.sh)
    fi

    echo "matrix=$MATRIX" >> $GITHUB_OUTPUT
```

### 3. JSON構文チェック

```yaml
- id: set-matrix
  run: |
    MATRIX='{"node":[18,20,22]}'

    # jqで検証
    echo "$MATRIX" | jq empty || {
      echo "::error::Invalid JSON in matrix"
      exit 1
    }

    echo "matrix=$MATRIX" >> $GITHUB_OUTPUT
```

### 4. マトリックスのドキュメント化

````yaml
- id: set-matrix
  run: |
    MATRIX=$(generate-matrix.sh)
    echo "matrix=$MATRIX" >> $GITHUB_OUTPUT

    # ジョブサマリーに記録
    echo "## Generated Matrix" >> $GITHUB_STEP_SUMMARY
    echo '```json' >> $GITHUB_STEP_SUMMARY
    echo "$MATRIX" | jq . >> $GITHUB_STEP_SUMMARY
    echo '```' >> $GITHUB_STEP_SUMMARY
````

---

## まとめ

| 方法             | 用途                     | 複雑度 |
| ---------------- | ------------------------ | ------ |
| `fromJSON()`     | 基本的な動的マトリックス | 低     |
| 変更ファイル検出 | 差分ビルド最適化         | 中     |
| スクリプト生成   | 複雑なロジック           | 中     |
| API連携          | 外部システム統合         | 高     |
| 設定ファイル     | メンテナンス性重視       | 低     |

**推奨**: シンプルな動的マトリックスから開始、必要に応じて高度化
