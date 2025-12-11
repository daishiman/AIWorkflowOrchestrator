# actions/cache 完全リファレンス

## 概要

`actions/cache` は GitHub Actions の公式キャッシングアクションです。
依存関係やビルド成果物を保存・復元することで、ワークフローの実行時間を大幅に短縮します。

## 基本構文

```yaml
- uses: actions/cache@v4
  with:
    # キャッシュするディレクトリ（必須）
    path: |
      ~/.pnpm
      node_modules

    # プライマリキー（必須）
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}

    # フォールバックキー（オプション）
    restore-keys: |
      ${{ runner.os }}-node-
      ${{ runner.os }}-

    # アップロード圧縮を無効化（オプション、デフォルト: true）
    enableCrossOsArchive: false

    # 失敗時にエラーにしない（オプション、デフォルト: false）
    fail-on-cache-miss: false

    # ルックアップのみでキャッシュを保存しない（オプション、デフォルト: false）
    lookup-only: false

    # 保存タイムアウト（オプション、デフォルト: 60000ms）
    save-always: false

  id: cache-dependencies

# キャッシュヒット判定
- name: Install dependencies
  if: steps.cache-dependencies.outputs.cache-hit != 'true'
  run: pnpm ci
```

## パラメーター詳細

### `path` (必須)

キャッシュするファイル・ディレクトリのパスを指定します。

**単一パス:**

```yaml
path: ~/.pnpm
```

**複数パス:**

```yaml
path: |
  ~/.pnpm
  ~/.cache
  node_modules
```

**グロブパターン:**

```yaml
path: |
  **/node_modules
  **/.next/cache
```

**注意事項:**

- 相対パスはワークスペースルート（`$GITHUB_WORKSPACE`）からの相対
- `~` はホームディレクトリに展開される
- パスが存在しない場合、キャッシュ保存は失敗しないが警告が出る

### `key` (必須)

キャッシュエントリを一意に識別するキー。

**基本パターン:**

```yaml
# 静的キー
key: my-cache-v1

# OS 別
key: ${{ runner.os }}-cache

# ファイルハッシュベース
key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}

# 複数ファイルのハッシュ
key: ${{ runner.os }}-${{ hashFiles('**/package-lock.json', '**/yarn.lock') }}

# Git SHA
key: ${{ runner.os }}-build-${{ github.sha }}

# ブランチ別
key: ${{ runner.os }}-${{ github.ref_name }}-${{ hashFiles('**/Cargo.lock') }}
```

**キー制約:**

- 最大512文字
- 英数字、ハイフン、アンダースコアのみ使用可能
- キーは作成後変更不可（イミュータブル）

### `restore-keys` (オプション)

プライマリキーが見つからない場合のフォールバックキー。

**優先順位付きフォールバック:**

```yaml
key: ${{ runner.os }}-node-v2-${{ hashFiles('**/package-lock.json') }}
restore-keys: |
  ${{ runner.os }}-node-v2-
  ${{ runner.os }}-node-
  ${{ runner.os }}-
```

**マッチング規則:**

- プレフィックスマッチング（前方一致）
- 最も新しいマッチするキャッシュを復元
- 複数マッチした場合、上から順に優先

**ベストプラクティス:**

```yaml
# ✅ 良い例: 段階的フォールバック
restore-keys: |
  ${{ runner.os }}-pnpm-${{ hashFiles('**/package-lock.json') }}
  ${{ runner.os }}-pnpm-
  ${{ runner.os }}-

# ❌ 悪い例: フォールバックなし（ロックファイル変更時にヒットしない）
restore-keys: ""

# ❌ 悪い例: 広すぎるフォールバック（無関係なキャッシュを取得）
restore-keys: |
  cache-
```

### `enableCrossOsArchive` (オプション)

クロスプラットフォームでのキャッシュ共有を有効化。

```yaml
# Windows でキャッシュ、Linux で復元する場合
enableCrossOsArchive: true
```

**注意:**

- パス区切り文字の違いに注意（Windows: `\`, Linux/macOS: `/`）
- 実行権限などのメタデータは保持されない可能性あり

### `fail-on-cache-miss` (オプション)

キャッシュが見つからない場合にワークフローを失敗させる。

```yaml
# キャッシュ必須の場合
fail-on-cache-miss: true
```

**使用ケース:**

- 前のジョブでキャッシュ作成が必須の場合
- キャッシュミスを検出してアラートを発生させたい場合

### `lookup-only` (オプション)

キャッシュの検索のみ行い、保存しない。

```yaml
# リードオンリーモード
lookup-only: true
```

**使用ケース:**

- 複数ジョブで同じキャッシュを参照する場合
- キャッシュの保存を別のジョブに任せたい場合

### `save-always` (オプション)

ジョブが失敗してもキャッシュを保存する。

```yaml
# ビルド失敗時も部分的な成果物をキャッシュ
save-always: true
```

**使用ケース:**

- 増分ビルドで部分的な成果物を保存したい場合
- テスト失敗時も依存関係はキャッシュしたい場合

## 出力値

```yaml
- uses: actions/cache@v4
  id: cache-pnpm
  with:
    path: ~/.pnpm
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}

# 出力値の使用
- name: Check cache hit
  run: echo "Cache hit: ${{ steps.cache-pnpm.outputs.cache-hit }}"
  # 'true' または 'false'

- name: Install only if cache miss
  if: steps.cache-pnpm.outputs.cache-hit != 'true'
  run: pnpm ci

- name: Show matched key
  run: echo "Matched key: ${{ steps.cache-pnpm.outputs.cache-matched-key }}"
  # マッチしたキー文字列（restore-keys含む）

- name: Show primary key
  run: echo "Primary key: ${{ steps.cache-pnpm.outputs.cache-primary-key }}"
  # 指定したkeyパラメーターの値
```

## パスパターン

### 単一ディレクトリ

```yaml
path: ~/.cargo/registry
```

### 複数ディレクトリ

```yaml
path: |
  ~/.cargo/registry/index
  ~/.cargo/registry/cache
  ~/.cargo/git/db
  target/
```

### グロブパターン

```yaml
# すべてのnode_modulesをキャッシュ
path: |
  **/node_modules
  ~/.pnpm

# .nextキャッシュのみ
path: .next/cache

# ビルド成果物
path: |
  target/release
  target/debug
  !target/debug/deps
```

### 除外パターン

```yaml
path: |
  target/
  !target/**/*.pdb
  !target/**/incremental
```

**注意:** `!` による除外は限定的なサポート。可能な限り含めるパスを明示的に指定。

## 高度な使用パターン

### 条件付きキャッシュ

```yaml
# main ブランチのみキャッシュを保存
- uses: actions/cache@v4
  if: github.ref == 'refs/heads/main'
  with:
    path: ~/.pnpm
    key: ${{ runner.os }}-pnpm-${{ hashFiles('**/package-lock.json') }}

# PR では復元のみ
- uses: actions/cache@v4
  if: github.event_name == 'pull_request'
  with:
    path: ~/.pnpm
    key: ${{ runner.os }}-pnpm-${{ hashFiles('**/package-lock.json') }}
    lookup-only: true
```

### マルチステージキャッシュ

```yaml
# ステージ1: 依存関係
- uses: actions/cache@v4
  with:
    path: ~/.cargo
    key: cargo-${{ hashFiles('**/Cargo.lock') }}

# ステージ2: ビルド成果物
- uses: actions/cache@v4
  with:
    path: target/
    key: build-${{ runner.os }}-${{ hashFiles('**/*.rs') }}
    restore-keys: |
      build-${{ runner.os }}-
```

### 日付ベースキャッシュローテーション

```yaml
# 毎日新しいキャッシュを作成
- uses: actions/cache@v4
  with:
    path: ~/.cache/pip
    key: ${{ runner.os }}-pip-${{ hashFiles('**/requirements.txt') }}-${{ github.run_number }}
    restore-keys: |
      ${{ runner.os }}-pip-${{ hashFiles('**/requirements.txt') }}-
      ${{ runner.os }}-pip-
```

### 複数キャッシュの組み合わせ

```yaml
# キャッシュ1: パッケージマネージャーのキャッシュディレクトリ
- name: Cache pnpm
  uses: actions/cache@v4
  with:
    path: ~/.pnpm
    key: ${{ runner.os }}-pnpm-${{ hashFiles('**/package-lock.json') }}

# キャッシュ2: node_modules（完全な依存関係ツリー）
- name: Cache node_modules
  uses: actions/cache@v4
  with:
    path: node_modules
    key: ${{ runner.os }}-modules-${{ hashFiles('**/package-lock.json') }}

# キャッシュ3: ビルド成果物
- name: Cache Next.js
  uses: actions/cache@v4
  with:
    path: .next/cache
    key: ${{ runner.os }}-nextjs-${{ hashFiles('**/package-lock.json') }}-${{ hashFiles('**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx') }}
```

## 制約と考慮事項

### サイズ制限

- **単一キャッシュエントリ**: 最大 10GB
- **リポジトリ合計**: 最大 10GB
- 超過すると最も古いキャッシュが自動削除される

### 保持期間

- **未使用キャッシュ**: 7日間アクセスがないと自動削除
- **アクティブキャッシュ**: 最終アクセス日時から7日間保持

### パフォーマンス

- **圧縮**: 自動的にgzip圧縮される
- **並列処理**: 複数のキャッシュ操作は並列実行可能
- **タイムアウト**: デフォルト60秒（`save-always`で調整可能）

### セキュリティ

- **プライベートリポジトリ**: キャッシュは同じリポジトリ内でのみアクセス可能
- **パブリックリポジトリ**: キャッシュはフォークからもアクセス可能（PRから作成されたキャッシュは除く）
- **機密情報**: キャッシュに機密情報を含めない（暗号化されるが、リポジトリアクセス権があれば復元可能）

## トラブルシューティング

### キャッシュヒットしない

**原因:**

- キーが完全一致しない
- restore-keys が適切でない
- パスが間違っている

**解決策:**

```yaml
# デバッグ情報を出力
- name: Debug cache
  run: |
    echo "Cache key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}"
    echo "Lock file hash: ${{ hashFiles('**/package-lock.json') }}"
    ls -la ~/.pnpm || echo "pnpm cache directory not found"
```

### キャッシュサイズが大きすぎる

**原因:**

- 不要なファイルを含めている
- ビルド成果物が肥大化

**解決策:**

```yaml
# パスを最適化
path: |
  ~/.cargo/registry/index
  ~/.cargo/registry/cache
  # ~/.cargo/git/db  # ← 大きい場合は除外を検討
```

### キャッシュが古い

**原因:**

- restore-keys が広すぎる
- キーにバージョン番号が含まれていない

**解決策:**

```yaml
# バージョン番号を追加
key: ${{ runner.os }}-cache-v2-${{ hashFiles('**/lock-file') }}
restore-keys: |
  ${{ runner.os }}-cache-v2-
```

### エビクションポリシー

GitHub Actions は以下の順序でキャッシュを削除します:

1. 7日間未使用のキャッシュ
2. リポジトリ合計が10GBを超えた場合、最も古いキャッシュ
3. ブランチが削除された場合、そのブランチのキャッシュ

**ベストプラクティス:**

- 重要なキャッシュは定期的にアクセスして保持
- 不要なブランチは削除してキャッシュを解放
- 大きなキャッシュは分割を検討
