# Matrix Strategy 詳細

GitHub Actionsの`strategy.matrix`構文の完全ガイド。

---

## 基本構文

### シンプルマトリックス

```yaml
strategy:
  matrix:
    os: [ubuntu-latest, windows-latest, macos-latest]
    node: [18, 20, 22]
    # 結果: 3 OS × 3 Node = 9ジョブ
```

**アクセス方法**:

```yaml
runs-on: ${{ matrix.os }}
steps:
  - uses: actions/setup-node@v4
    with:
      node-version: ${{ matrix.node }}
```

---

## include: 組み合わせ追加

### 基本パターン

```yaml
strategy:
  matrix:
    os: [ubuntu-latest, windows-latest]
    node: [18, 20]
    # 4ジョブ: ubuntu+18, ubuntu+20, windows+18, windows+20

    include:
      # 追加の組み合わせ
      - os: macos-latest
        node: 22
    # 合計5ジョブ
```

### プロパティ追加パターン

```yaml
strategy:
  matrix:
    os: [ubuntu-latest, windows-latest]
    node: [18, 20]

    include:
      # 既存の組み合わせに追加プロパティ
      - os: ubuntu-latest
        node: 20
        experimental: true
        rust: "nightly"
```

**結果**: `ubuntu-latest + node 20`のジョブに`experimental`と`rust`プロパティ追加

**アクセス**:

```yaml
steps:
  - name: 実験的ビルド
    if: matrix.experimental == true
    run: echo "Rust: ${{ matrix.rust }}"
```

---

## exclude: 組み合わせ除外

### 特定組み合わせ除外

```yaml
strategy:
  matrix:
    os: [ubuntu-latest, windows-latest, macos-latest]
    node: [18, 20, 22]
    # 9ジョブから除外

    exclude:
      # Windows + Node 18を除外
      - os: windows-latest
        node: 18
      # macOS + Node 22を除外
      - os: macos-latest
        node: 22
    # 結果: 7ジョブ（9 - 2）
```

### 部分マッチ除外

```yaml
strategy:
  matrix:
    os: [ubuntu-20.04, ubuntu-22.04, windows-latest]
    arch: [x64, arm64]

    exclude:
      # ubuntu全バージョンでarm64を除外
      - os: ubuntu-20.04
        arch: arm64
      - os: ubuntu-22.04
        arch: arm64
```

---

## fail-fast: 失敗時の動作制御

### fail-fast: true（デフォルト）

```yaml
strategy:
  fail-fast: true
  matrix:
    node: [18, 20, 22]
```

**動作**: 1つのジョブが失敗したら、他のジョブをキャンセル
**用途**: 高速フィードバック、CI時間短縮

### fail-fast: false

```yaml
strategy:
  fail-fast: false
  matrix:
    node: [18, 20, 22]
```

**動作**: 1つ失敗しても全ジョブを実行
**用途**: 全バージョンのテスト結果が必要な場合

---

## max-parallel: 並列度制御

### 基本設定

```yaml
strategy:
  max-parallel: 2
  matrix:
    region: [us-east-1, us-west-2, eu-west-1, ap-northeast-1]
    # 4ジョブあるが、同時実行は2つまで
```

**実行順序**:

1. us-east-1, us-west-2（並列）
2. 完了後 → eu-west-1, ap-northeast-1（並列）

### 用途別設定

#### API制限対策

```yaml
strategy:
  max-parallel: 1 # 順次実行
  matrix:
    environment: [prod, staging, dev]
```

**理由**: デプロイAPI制限、リソース競合回避

#### コスト最適化

```yaml
strategy:
  max-parallel: 5 # GitHub無料プランの並列数以内
  matrix:
    browser: [chrome, firefox, safari, edge, opera]
```

#### 無制限並列（デフォルト）

```yaml
strategy:
  # max-parallel指定なし = 全ジョブ並列
  matrix:
    node: [18, 20, 22]
```

**制限**: GitHubプランの並列実行数上限（無料: 20、Pro: 40、Enterprise: 180）

---

## 複雑なマトリックス例

### include/exclude組み合わせ

```yaml
strategy:
  fail-fast: false
  matrix:
    os: [ubuntu-latest, windows-latest, macos-latest]
    node: [18, 20, 22]

    include:
      # Ubuntu + Node 22に実験的機能追加
      - os: ubuntu-latest
        node: 22
        experimental: true

      # macOS最新（Node 22のみ）
      - os: macos-14
        node: 22
        label: "macos-arm64"

    exclude:
      # Windowsの古いバージョン除外
      - os: windows-latest
        node: 18

      # macOS + Node 18除外（サポート終了）
      - os: macos-latest
        node: 18
```

**結果**:

- 基本: 3 OS × 3 Node = 9
- 除外: -2
- 追加: +2
- **合計: 9ジョブ**

---

## マトリックス変数の高度な使用

### ネストされたプロパティ

```yaml
strategy:
  matrix:
    config:
      - {os: ubuntu-latest, node: 18, label: 'ubuntu-node18'}
      - {os: windows-latest, node: 20, label: 'windows-node20'}
      - {os: macos-latest, node: 22, label: 'macos-node22'}

runs-on: ${{ matrix.config.os }}
steps:
  - uses: actions/setup-node@v4
    with:
      node-version: ${{ matrix.config.node }}
  - run: echo "Label: ${{ matrix.config.label }}"
```

### デフォルト値パターン

```yaml
strategy:
  matrix:
    os: [ubuntu-latest, windows-latest]
    include:
      - os: ubuntu-latest
        package-manager: "apt"
      - os: windows-latest
        package-manager: "choco"

steps:
  - name: パッケージインストール
    run: |
      if [ "${{ matrix.package-manager }}" == "apt" ]; then
        sudo apt-get install some-package
      elif [ "${{ matrix.package-manager }}" == "choco" ]; then
        choco install some-package
      fi
```

---

## パフォーマンス最適化

### 1. マトリックス次元を最小化

❌ **避けるべき**:

```yaml
matrix:
  os:
    [ubuntu-20.04, ubuntu-22.04, windows-2019, windows-2022, macos-12, macos-13]
  node: [16, 18, 20, 22]
  browser: [chrome, firefox, safari, edge]
  # 6 × 4 × 4 = 96ジョブ！
```

✅ **推奨**:

```yaml
matrix:
  os: [ubuntu-latest, windows-latest, macos-latest]
  node: [18, 20, 22]
  # 3 × 3 = 9ジョブ
```

### 2. 代表的な組み合わせのみテスト

```yaml
strategy:
  matrix:
    include:
      # LTS版のみ、主要OSのみ
      - os: ubuntu-latest
        node: 18 # LTS
      - os: ubuntu-latest
        node: 20 # Current LTS
      - os: windows-latest
        node: 20
      - os: macos-latest
        node: 20
  # 4ジョブ（全組み合わせなら 3×2=6）
```

### 3. fail-fast戦略

**開発ブランチ**:

```yaml
strategy:
  fail-fast: false # 全結果確認
```

**mainブランチ**:

```yaml
strategy:
  fail-fast: true # 高速フィードバック
```

---

## エラーハンドリング

### continue-on-errorとの組み合わせ

```yaml
strategy:
  matrix:
    node: [18, 20, 22]
    include:
      - node: 22
        experimental: true

steps:
  - name: テスト実行
    continue-on-error: ${{ matrix.experimental == true }}
    run: pnpm test
```

**動作**: Node 22（experimental）の失敗はジョブ失敗としない

### マトリックスステータスチェック

```yaml
jobs:
  test:
    strategy:
      matrix:
        node: [18, 20, 22]
    # ... テスト実行 ...

  report:
    needs: test
    if: always() # testが失敗しても実行
    runs-on: ubuntu-latest
    steps:
      - name: 結果レポート
        run: |
          echo "Test matrix completed"
          echo "Status: ${{ needs.test.result }}"
```

---

## ベストプラクティス

### 1. マトリックス変数の命名

✅ **明確な命名**:

```yaml
matrix:
  os: [ubuntu-latest, windows-latest]
  node-version: [18, 20, 22]
  test-suite: [unit, integration, e2e]
```

❌ **曖昧な命名**:

```yaml
matrix:
  a: [ubuntu-latest, windows-latest]
  b: [18, 20, 22]
  c: [unit, integration, e2e]
```

### 2. 組み合わせの文書化

```yaml
strategy:
  matrix:
    # メインサポート環境
    os: [ubuntu-latest, windows-latest, macos-latest]
    node: [18, 20, 22]

    exclude:
      # macOS + Node 18: Appleサポート終了により除外
      - os: macos-latest
        node: 18

    include:
      # Ubuntu + Node 22: 次期LTS検証用
      - os: ubuntu-latest
        node: 22
        experimental: true
```

### 3. マトリックスの可視化

```yaml
name: CI Matrix

jobs:
  test:
    name: Test (OS:${{ matrix.os }} Node:${{ matrix.node }})
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest]
        node: [18, 20, 22]
```

**結果**: GitHub UIで「Test (OS:ubuntu-latest Node:18)」と表示

---

## まとめ

| 機能           | 用途                      | デフォルト |
| -------------- | ------------------------- | ---------- |
| `matrix`       | 組み合わせ定義            | -          |
| `include`      | 組み合わせ/プロパティ追加 | -          |
| `exclude`      | 組み合わせ除外            | -          |
| `fail-fast`    | 失敗時の継続制御          | `true`     |
| `max-parallel` | 並列度制限                | 無制限     |

**推奨**: 2-3次元マトリックス、代表的組み合わせ、適切なfail-fast設定
