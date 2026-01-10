# Matrix Builds 基礎知識

> **相対パス**: `references/basics.md`
> **読込条件**: 初回使用時

---

## マトリックスビルドとは

| 概念            | 説明                                   |
| --------------- | -------------------------------------- |
| strategy.matrix | 複数の値の組み合わせでジョブを並列実行 |
| 組み合わせ      | 各軸の値の直積でジョブ数が決まる       |
| 並列実行        | 各組み合わせは独立したジョブとして実行 |

---

## 基本構文

```yaml
jobs:
  test:
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest]
        node: [18, 20, 22]
    runs-on: ${{ matrix.os }}
    steps:
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node }}
```

**結果**: 2 OS × 3 Node = 6 ジョブ

---

## マトリックス変数

| 変数                 | 説明                   |
| -------------------- | ---------------------- |
| `${{ matrix.os }}`   | 現在の OS 値           |
| `${{ matrix.node }}` | 現在の Node バージョン |
| `${{ matrix.* }}`    | 任意のマトリックス軸   |

---

## 主要設定

| 設定           | デフォルト | 説明                   |
| -------------- | ---------- | ---------------------- |
| `fail-fast`    | true       | 失敗時に他ジョブを中止 |
| `max-parallel` | 無制限     | 最大同時実行数         |

---

## 組み合わせ数の計算

```
総ジョブ数 = 軸1の値数 × 軸2の値数 × ... × 軸Nの値数
```

**例**:

- os: 3, node: 4 → 12 ジョブ
- os: 2, node: 3, arch: 2 → 12 ジョブ

---

## よく使う軸

| 軸名         | 値の例                                      |
| ------------ | ------------------------------------------- |
| os           | ubuntu-latest, windows-latest, macos-latest |
| node         | 18, 20, 22                                  |
| python       | 3.10, 3.11, 3.12                            |
| java         | 11, 17, 21                                  |
| architecture | x64, arm64                                  |

---

## 関連リソース

- **パターン詳細**: See [patterns.md](patterns.md)
- **動的生成**: See [dynamic-matrix.md](dynamic-matrix.md)
