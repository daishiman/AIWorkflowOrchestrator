# キャッシュ最適化戦略

## 概要

GitHub Actions のキャッシュを最大限に活用するための最適化戦略とトラブルシューティング手法を提供します。
キャッシュヒット率の向上、ストレージ効率の改善、パフォーマンスの最大化を実現します。

## キャッシュヒット率の最適化

### キーデザイン戦略

#### 1. ハッシュベースキー（推奨）

**原則:** 依存関係が変更された時のみキャッシュを更新

```yaml
# ✅ 良い例: ロックファイルのハッシュを使用
key: ${{ runner.os }}-npm-${{ hashFiles('**/package-lock.json') }}

# ❌ 悪い例: 静的キー（依存関係更新を検出できない）
key: ${{ runner.os }}-npm-v1
```

**メリット:**
- 依存関係が同じなら必ずヒット
- 不要なキャッシュ再作成を防止
- 決定論的な動作

#### 2. 階層的restore-keys

**原則:** 完全一致しない場合も部分一致で古いキャッシュを活用

```yaml
key: ${{ runner.os }}-node-v2-${{ hashFiles('**/package-lock.json') }}
restore-keys: |
  ${{ runner.os }}-node-v2-
  ${{ runner.os }}-node-
  ${{ runner.os }}-
```

**マッチング順序:**
1. 完全一致: `linux-node-v2-abc123`
2. プレフィックス一致 (新→古): `linux-node-v2-def456`, `linux-node-v2-xyz789`
3. より広いプレフィックス: `linux-node-v1-abc123`
4. さらに広い: `linux-abc123`

**ベストプラクティス:**
```yaml
# ✅ 良い例: 段階的フォールバック
restore-keys: |
  ${{ runner.os }}-cargo-${{ hashFiles('**/Cargo.lock') }}-
  ${{ runner.os }}-cargo-
  ${{ runner.os }}-

# ❌ 悪い例: フォールバックが広すぎる（無関係なキャッシュを取得）
restore-keys: |
  cache-

# ❌ 悪い例: フォールバックなし（ロックファイル変更時に常にミス）
# restore-keys を設定しない
```

#### 3. バージョニング戦略

**原則:** キャッシュ構造が変わった時に強制的にリフレッシュ

```yaml
# バージョン番号を含める
key: ${{ runner.os }}-cache-v3-${{ hashFiles('**/lock-file') }}

# 重大な変更時にバージョンアップ
# v1 → v2: node_modules の構造変更
# v2 → v3: キャッシュパスの追加
```

**バージョンアップが必要なケース:**
- パッケージマネージャーのメジャーアップデート
- キャッシュパスの変更
- ビルドツールの設定変更
- 依存関係解決アルゴリズムの変更

### キャッシュスコープ最適化

#### ブランチ別キャッシュ

```yaml
# main ブランチ専用キャッシュ
key: ${{ runner.os }}-main-${{ hashFiles('**/lock-file') }}

# ブランチごとのキャッシュ
key: ${{ runner.os }}-${{ github.ref_name }}-${{ hashFiles('**/lock-file') }}
restore-keys: |
  ${{ runner.os }}-${{ github.ref_name }}-
  ${{ runner.os }}-main-
  ${{ runner.os }}-
```

**使用ケース:**
- main: 本番環境用の安定したキャッシュ
- feature: ブランチ固有の依存関係（実験的な変更）
- PR: main からのフォールバックで効率化

#### OS/アーキテクチャ別キャッシュ

```yaml
# 単一OS
key: ${{ runner.os }}-deps-${{ hashFiles('**/lock-file') }}

# クロスプラットフォーム共有
key: deps-${{ hashFiles('**/lock-file') }}
enableCrossOsArchive: true
```

**注意点:**
- パス区切り文字の違い（Windows: `\`, Linux: `/`）
- 実行権限の保持
- ネイティブモジュールの非互換性

## ストレージ効率の改善

### サイズ制限の管理

**リポジトリ制限:** 合計10GB
**単一エントリ制限:** 10GB

#### 戦略1: キャッシュの分割

```yaml
# ❌ 悪い例: 1つの巨大なキャッシュ（12GB）
- uses: actions/cache@v4
  with:
    path: |
      ~/.cargo
      target/
      ~/.cache
    key: all-${{ hashFiles('**/*') }}

# ✅ 良い例: 3つの小さなキャッシュに分割
- uses: actions/cache@v4  # 4GB
  with:
    path: ~/.cargo/registry
    key: cargo-registry-${{ hashFiles('**/Cargo.lock') }}

- uses: actions/cache@v4  # 5GB
  with:
    path: target/
    key: build-${{ hashFiles('**/*.rs') }}
    restore-keys: build-

- uses: actions/cache@v4  # 2GB
  with:
    path: ~/.cache
    key: cache-${{ github.run_id }}
    restore-keys: cache-
```

**メリット:**
- 10GB制限を回避
- 変更頻度に応じた最適化
- ヒット率の向上

#### 戦略2: 不要なファイルの除外

```yaml
# ビルド成果物から一時ファイルを除外
path: |
  target/release
  !target/release/deps
  !target/release/build
  !target/release/.fingerprint
```

**注意:** `!` による除外は限定的。可能な限り含めるパスを明示。

#### 戦略3: 圧縮効率の向上

```yaml
# 圧縮率の高いファイルのみキャッシュ
path: |
  ~/.cargo/registry/cache  # tar.gz ファイル（既に圧縮済み）
  !~/.cargo/registry/src   # ソースコード（圧縮効率が低い）
```

### キャッシュエビクション管理

**自動削除条件:**
1. 7日間未使用
2. リポジトリ合計が10GBを超過
3. ブランチ削除

#### ベストプラクティス

```yaml
# main ブランチで定期的にアクセスしてキャッシュを保持
on:
  schedule:
    - cron: '0 0 * * 0'  # 毎週日曜日

jobs:
  keep-cache-warm:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/cache@v4
        with:
          path: ~/.cargo
          key: ${{ runner.os }}-cargo-${{ hashFiles('**/Cargo.lock') }}
          lookup-only: true  # 復元のみ、保存しない
```

## パフォーマンス最適化

### キャッシュ保存タイミング

#### 戦略1: 条件付き保存

```yaml
# main ブランチのみキャッシュを保存
- uses: actions/cache@v4
  with:
    path: ~/.npm
    key: ${{ runner.os }}-npm-${{ hashFiles('**/package-lock.json') }}
    save-always: ${{ github.ref == 'refs/heads/main' }}
```

**メリット:**
- PR ではキャッシュを消費しない
- ストレージ使用量を削減

#### 戦略2: 失敗時も保存

```yaml
# テスト失敗時も依存関係はキャッシュ
- uses: actions/cache@v4
  with:
    path: node_modules
    key: ${{ runner.os }}-modules-${{ hashFiles('**/package-lock.json') }}
    save-always: true
```

### 並列化とキャッシュ

```yaml
jobs:
  setup:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/cache@v4
        with:
          path: node_modules
          key: ${{ runner.os }}-modules-${{ hashFiles('**/package-lock.json') }}
      - run: npm ci

  test:
    needs: setup
    runs-on: ubuntu-latest
    strategy:
      matrix:
        shard: [1, 2, 3, 4]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/cache@v4
        with:
          path: node_modules
          key: ${{ runner.os }}-modules-${{ hashFiles('**/package-lock.json') }}
          lookup-only: true  # 復元のみ
      - run: npm test -- --shard=${{ matrix.shard }}/4
```

## トラブルシューティング

### 問題1: キャッシュヒットしない

#### 診断

```yaml
- name: Debug cache key
  run: |
    echo "OS: ${{ runner.os }}"
    echo "Lock file hash: ${{ hashFiles('**/package-lock.json') }}"
    echo "Expected key: ${{ runner.os }}-npm-${{ hashFiles('**/package-lock.json') }}"

- name: Check cache directory
  run: |
    ls -la ~/.npm || echo "Cache directory not found"
    du -sh ~/.npm || echo "Cache directory empty"
```

#### 原因と対策

| 原因 | 対策 |
|-----|-----|
| ロックファイルが見つからない | `hashFiles()` のパターンを確認 |
| パスが間違っている | キャッシュパスが実際に存在するか確認 |
| キーが毎回変わる | `github.sha` などの動的な値を使用していないか確認 |
| クロスOS問題 | `enableCrossOsArchive: true` を設定 |

### 問題2: キャッシュが古い

#### 診断

```yaml
- uses: actions/cache@v4
  id: cache
  with:
    path: ~/.npm
    key: ${{ runner.os }}-npm-${{ hashFiles('**/package-lock.json') }}

- name: Show cache info
  run: |
    echo "Cache hit: ${{ steps.cache.outputs.cache-hit }}"
    echo "Matched key: ${{ steps.cache.outputs.cache-matched-key }}"
    echo "Primary key: ${{ steps.cache.outputs.cache-primary-key }}"
```

#### 対策

```yaml
# バージョン番号を追加して強制リフレッシュ
key: ${{ runner.os }}-npm-v2-${{ hashFiles('**/package-lock.json') }}
```

### 問題3: キャッシュサイズが大きすぎる

#### 診断

```bash
# ローカルでサイズを確認
du -sh ~/.npm
du -sh node_modules
du -sh target/

# 詳細な内訳
du -sh ~/.npm/* | sort -hr | head -20
```

#### 対策

**戦略A: パスの最適化**
```yaml
# 不要なディレクトリを除外
path: |
  ~/.cargo/registry/index
  ~/.cargo/registry/cache
  # ~/.cargo/git/db は除外（サイズが大きい場合）
```

**戦略B: キャッシュの分割**
```yaml
# 変更頻度で分割
- uses: actions/cache@v4  # 低頻度（依存関係）
  with:
    path: ~/.cargo/registry
    key: registry-${{ hashFiles('**/Cargo.lock') }}

- uses: actions/cache@v4  # 高頻度（ビルド成果物）
  with:
    path: target/
    key: build-${{ hashFiles('**/*.rs') }}
    restore-keys: build-
```

**戦略C: クリーンアップ**
```yaml
- name: Cleanup before cache
  run: |
    # npm の不要なキャッシュを削除
    npm cache clean --force

    # Cargo の古いビルド成果物を削除
    cargo clean -p my-package

    # Docker の未使用イメージを削除
    docker system prune -af
```

### 問題4: キャッシュミスでビルドが遅い

#### 診断

```yaml
- name: Measure cache performance
  run: |
    echo "::group::Cache Metrics"
    echo "Start time: $(date -u +%s)"

- uses: actions/cache@v4
  # ... cache configuration

- name: Cache result
  run: |
    echo "End time: $(date -u +%s)"
    echo "Cache hit: ${{ steps.cache.outputs.cache-hit }}"
    echo "::endgroup::"
```

#### 対策

**戦略A: restore-keys の最適化**
```yaml
# より多くのフォールバックオプション
restore-keys: |
  ${{ runner.os }}-npm-${{ hashFiles('**/package-lock.json') }}-
  ${{ runner.os }}-npm-
  ${{ runner.os }}-
```

**戦略B: 増分キャッシュ**
```yaml
# 常に前回のキャッシュから開始
key: ${{ runner.os }}-build-${{ github.run_id }}
restore-keys: |
  ${{ runner.os }}-build-
```

**戦略C: 複数レイヤー戦略**
```yaml
# Layer 1: 安定した依存関係
- uses: actions/cache@v4
  with:
    path: ~/.cargo/registry
    key: cargo-${{ hashFiles('**/Cargo.lock') }}

# Layer 2: 増分ビルド
- uses: actions/cache@v4
  with:
    path: target/
    key: build-${{ hashFiles('**/*.rs') }}
    restore-keys: build-
```

## キャッシュ効率のモニタリング

### メトリクス収集

```yaml
- name: Cache statistics
  run: |
    echo "## Cache Performance" >> $GITHUB_STEP_SUMMARY
    echo "- Cache hit: ${{ steps.cache.outputs.cache-hit }}" >> $GITHUB_STEP_SUMMARY
    echo "- Matched key: ${{ steps.cache.outputs.cache-matched-key }}" >> $GITHUB_STEP_SUMMARY

    # サイズ情報
    CACHE_SIZE=$(du -sh ~/.npm | cut -f1)
    echo "- Cache size: $CACHE_SIZE" >> $GITHUB_STEP_SUMMARY

    # ヒット率計算（複数実行から）
    echo "- Hit rate: 85%" >> $GITHUB_STEP_SUMMARY
```

### 推奨される目標値

| メトリクス | 目標値 | 許容範囲 |
|-----------|--------|----------|
| キャッシュヒット率 | >90% | 80-95% |
| キャッシュサイズ（依存関係） | <500MB | <1GB |
| キャッシュサイズ（ビルド） | <2GB | <5GB |
| 復元時間 | <30秒 | <60秒 |
| ビルド時間短縮率 | >50% | 30-80% |

### 定期的なレビュー

```yaml
# 月次レポート生成
on:
  schedule:
    - cron: '0 0 1 * *'  # 毎月1日

jobs:
  cache-report:
    runs-on: ubuntu-latest
    steps:
      - name: Generate cache report
        run: |
          echo "# Monthly Cache Report" > report.md
          echo "Generated: $(date)" >> report.md

          # GitHub API でキャッシュ情報を取得
          gh api repos/${{ github.repository }}/actions/caches \
            --jq '.actions_caches[] | "- \(.key): \(.size_in_bytes / 1024 / 1024)MB"' \
            >> report.md

      - name: Upload report
        uses: actions/upload-artifact@v4
        with:
          name: cache-report
          path: report.md
```

## ベストプラクティスまとめ

### DO（推奨）

✅ **ロックファイルのハッシュをキーに使用**
```yaml
key: ${{ runner.os }}-${{ hashFiles('**/package-lock.json') }}
```

✅ **restore-keys で段階的フォールバック**
```yaml
restore-keys: |
  ${{ runner.os }}-npm-${{ hashFiles('**/package-lock.json') }}-
  ${{ runner.os }}-npm-
```

✅ **キャッシュサイズを監視**
```yaml
- run: du -sh ~/.npm
```

✅ **バージョニングで強制リフレッシュ**
```yaml
key: ${{ runner.os }}-cache-v2-${{ hashFiles('**/lock') }}
```

✅ **必要最小限のパスをキャッシュ**
```yaml
path: |
  ~/.cargo/registry/cache
  ~/.cargo/git/db
```

### DON'T（非推奨）

❌ **静的キーを使用**
```yaml
key: my-cache  # 依存関係更新を検出できない
```

❌ **広すぎるrestore-keys**
```yaml
restore-keys: cache-  # 無関係なキャッシュを取得
```

❌ **不要なファイルをキャッシュ**
```yaml
path: |
  ~/.cargo  # すべてをキャッシュ（サイズが大きい）
```

❌ **動的なキーのみ使用**
```yaml
key: ${{ github.sha }}  # 毎回ミスする
```

❌ **キャッシュサイズを無視**
```yaml
# 10GB超のキャッシュを作成
```
