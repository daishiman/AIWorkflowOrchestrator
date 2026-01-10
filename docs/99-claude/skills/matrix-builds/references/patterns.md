# Matrix Builds パターン

> **相対パス**: `references/patterns.md`
> **読込条件**: 設計時

---

## include パターン

追加の組み合わせや変数を定義：

```yaml
strategy:
  matrix:
    os: [ubuntu-latest, windows-latest]
    node: [18, 20]
    include:
      # 追加の組み合わせ
      - os: ubuntu-latest
        node: 22
        experimental: true
      # 既存組み合わせに変数追加
      - os: windows-latest
        node: 20
        npm-version: 9
```

---

## exclude パターン

特定の組み合わせを除外：

```yaml
strategy:
  matrix:
    os: [ubuntu-latest, windows-latest, macos-latest]
    node: [18, 20, 22]
    exclude:
      # Windows + Node 18 を除外
      - os: windows-latest
        node: 18
      # macOS + Node 22 を除外
      - os: macos-latest
        node: 22
```

---

## fail-fast 制御

```yaml
strategy:
  # false: 全ジョブ完了まで継続（全結果確認）
  fail-fast: false

  # true (デフォルト): 失敗時に他を中止（高速フィードバック）
  # fail-fast: true
  matrix:
    os: [ubuntu-latest, windows-latest]
```

**使い分け**:

| 設定  | ユースケース                 |
| ----- | ---------------------------- |
| true  | 早期失敗検出、コスト削減     |
| false | 全環境の結果確認、リリース前 |

---

## max-parallel 最適化

```yaml
strategy:
  max-parallel: 4 # 最大 4 並列
  matrix:
    os: [ubuntu-latest, windows-latest]
    node: [18, 20, 22]
```

**ガイドライン**:

| 条件                 | 推奨値     |
| -------------------- | ---------- |
| セルフホストランナー | 物理コア数 |
| GitHub-hosted        | 制限なし可 |
| レート制限回避       | 5-10       |

---

## 条件付きマトリックス変数

```yaml
strategy:
  matrix:
    os: [ubuntu-latest, windows-latest]
    node: [18, 20]
    include:
      - os: ubuntu-latest
        node: 20
        coverage: true

steps:
  - name: Run coverage
    if: matrix.coverage
    run: npm run coverage
```

---

## 動的マトリックス（fromJSON）

```yaml
jobs:
  setup:
    runs-on: ubuntu-latest
    outputs:
      matrix: ${{ steps.set.outputs.matrix }}
    steps:
      - id: set
        run: |
          echo 'matrix={"node":[18,20,22]}' >> $GITHUB_OUTPUT

  test:
    needs: setup
    strategy:
      matrix: ${{ fromJSON(needs.setup.outputs.matrix) }}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node }}
```

---

## 複合マトリックス例

```yaml
strategy:
  fail-fast: false
  max-parallel: 6
  matrix:
    os: [ubuntu-latest, windows-latest]
    node: [18, 20, 22]
    exclude:
      - os: windows-latest
        node: 18
    include:
      - os: ubuntu-latest
        node: 22
        experimental: true
        coverage: true
```

---

## 関連リソース

- **基礎知識**: See [basics.md](basics.md)
- **動的生成詳細**: See [dynamic-matrix.md](dynamic-matrix.md)
- **戦略詳細**: See [matrix-strategy.md](matrix-strategy.md)
