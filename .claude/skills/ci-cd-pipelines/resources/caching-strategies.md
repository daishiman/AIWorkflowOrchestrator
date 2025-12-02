# キャッシュ戦略

## キャッシュの基本原則

### なぜキャッシュが重要か

1. **実行時間短縮**: 依存関係インストールを数十秒から数秒に
2. **コスト削減**: GitHub Actions の実行時間課金を削減
3. **フィードバック高速化**: 開発者へのフィードバック時間を短縮

### キャッシュの仕組み

```
1. キーでキャッシュを検索
2. 完全一致 → キャッシュ復元（cache-hit: true）
3. 部分一致（restore-keys） → 古いキャッシュを復元
4. 不一致 → キャッシュなし、新規インストール
5. ジョブ終了時 → キャッシュ保存（新規キーの場合）
```

## 依存関係キャッシュ

### pnpm キャッシュ（推奨）

```yaml
- name: Setup pnpm
  uses: pnpm/action-setup@v4
  with:
    version: 9

- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: 22
    cache: 'pnpm'               # 自動キャッシュ

- name: Install dependencies
  run: pnpm install --frozen-lockfile
```

**メカニズム**:
- `pnpm-lock.yaml` のハッシュをキーに使用
- `~/.pnpm-store` をキャッシュ
- `actions/setup-node` が自動管理

### pnpm キャッシュ

```yaml
- name: Setup Node.js with pnpm cache
  uses: actions/setup-node@v4
  with:
    node-version: 22
    cache: 'pnpm'

- name: Install dependencies
  run: pnpm ci
```

### yarn キャッシュ

```yaml
- name: Setup Node.js with yarn cache
  uses: actions/setup-node@v4
  with:
    node-version: 22
    cache: 'yarn'

- name: Install dependencies
  run: yarn install --frozen-lockfile
```

### 手動キャッシュ設定

自動キャッシュが使えない場合や、カスタム設定が必要な場合。

```yaml
- name: Get pnpm store directory
  id: pnpm-cache
  shell: bash
  run: echo "STORE_PATH=$(pnpm store path)" >> $GITHUB_OUTPUT

- name: Setup pnpm cache
  uses: actions/cache@v4
  with:
    path: ${{ steps.pnpm-cache.outputs.STORE_PATH }}
    key: pnpm-store-${{ runner.os }}-${{ hashFiles('**/pnpm-lock.yaml') }}
    restore-keys: |
      pnpm-store-${{ runner.os }}-
```

## ビルドキャッシュ

### Next.js ビルドキャッシュ

```yaml
- name: Cache Next.js build
  uses: actions/cache@v4
  with:
    path: |
      .next/cache
    key: nextjs-${{ runner.os }}-${{ hashFiles('**/pnpm-lock.yaml') }}-${{ hashFiles('**/*.ts', '**/*.tsx') }}
    restore-keys: |
      nextjs-${{ runner.os }}-${{ hashFiles('**/pnpm-lock.yaml') }}-
      nextjs-${{ runner.os }}-
```

### Turbo キャッシュ

```yaml
- name: Cache Turbo
  uses: actions/cache@v4
  with:
    path: .turbo
    key: turbo-${{ runner.os }}-${{ github.sha }}
    restore-keys: |
      turbo-${{ runner.os }}-
```

### ESLint キャッシュ

```yaml
- name: Cache ESLint
  uses: actions/cache@v4
  with:
    path: .eslintcache
    key: eslint-${{ runner.os }}-${{ hashFiles('eslint.config.js') }}-${{ github.sha }}
    restore-keys: |
      eslint-${{ runner.os }}-${{ hashFiles('eslint.config.js') }}-
      eslint-${{ runner.os }}-
```

## キャッシュキー設計

### 効果的なキー設計

```yaml
key: ${{ runner.os }}-${{ hashFiles('**/pnpm-lock.yaml') }}
#     ├────────────┘   └───────────────────────────────────┘
#     OS別に分離       lock ファイルのハッシュで依存関係変更を検出
```

### 階層的な restore-keys

```yaml
restore-keys: |
  pnpm-store-${{ runner.os }}-${{ hashFiles('**/pnpm-lock.yaml') }}-
  pnpm-store-${{ runner.os }}-
  pnpm-store-
```

**動作**:
1. 完全一致を検索
2. 見つからなければ、より汎用的なキーで検索
3. 古いキャッシュでも、差分インストールで高速化

### キー設計のベストプラクティス

**✅ 良い例**:
```yaml
# 依存関係キャッシュ - lock ファイルベース
key: deps-${{ runner.os }}-${{ hashFiles('**/pnpm-lock.yaml') }}

# ビルドキャッシュ - ソースコードベース
key: build-${{ runner.os }}-${{ hashFiles('src/**/*.ts') }}
```

**❌ 悪い例**:
```yaml
# タイムスタンプ - 毎回変わるのでキャッシュが効かない
key: deps-${{ github.run_id }}

# 固定値 - 依存関係変更が検出されない
key: deps-v1
```

## 複合キャッシュ

### 複数パスの同時キャッシュ

```yaml
- name: Cache multiple paths
  uses: actions/cache@v4
  with:
    path: |
      ~/.pnpm-store
      .next/cache
      node_modules/.cache
    key: all-cache-${{ runner.os }}-${{ hashFiles('**/pnpm-lock.yaml') }}
```

### 条件付きキャッシュ

```yaml
- name: Cache only on main
  uses: actions/cache@v4
  if: github.ref == 'refs/heads/main'
  with:
    path: ~/.pnpm-store
    key: pnpm-${{ hashFiles('**/pnpm-lock.yaml') }}
```

## キャッシュのトラブルシューティング

### キャッシュが効かない場合

**原因1: キーが毎回変わる**

```yaml
# ❌ SHA を含めると毎回変わる
key: deps-${{ github.sha }}

# ✅ lock ファイルベースに修正
key: deps-${{ hashFiles('**/pnpm-lock.yaml') }}
```

**原因2: restore-keys がない**

```yaml
# ❌ 完全一致のみ
key: deps-${{ hashFiles('**/pnpm-lock.yaml') }}

# ✅ フォールバック追加
key: deps-${{ hashFiles('**/pnpm-lock.yaml') }}
restore-keys: |
  deps-
```

**原因3: パスが間違っている**

```bash
# pnpm のストアパスを確認
pnpm store path
```

### キャッシュサイズの確認

```yaml
- name: Check cache size
  run: |
    echo "pnpm store:"
    du -sh ~/.pnpm-store || true
    echo "node_modules:"
    du -sh node_modules || true
    echo ".next/cache:"
    du -sh .next/cache || true
```

### キャッシュヒット率の確認

```yaml
- name: Cache dependencies
  id: cache-deps
  uses: actions/cache@v4
  with:
    path: ~/.pnpm-store
    key: pnpm-${{ hashFiles('**/pnpm-lock.yaml') }}

- name: Report cache status
  run: |
    if [ "${{ steps.cache-deps.outputs.cache-hit }}" == "true" ]; then
      echo "✅ Cache hit!"
    else
      echo "❌ Cache miss"
    fi
```

## GitHub Actions キャッシュの制限

### 制限事項

| 項目 | 制限 |
|------|------|
| 最大キャッシュサイズ | 10 GB / リポジトリ |
| 単一キャッシュ上限 | 10 GB |
| キャッシュ保持期間 | 7日間（最終アクセスから） |
| 同時キャッシュ数 | 制限なし（10GB内） |

### 制限への対策

**キャッシュサイズ削減**:
```yaml
# node_modules ではなく pnpm store をキャッシュ
path: ~/.pnpm-store  # 重複排除で効率的
# ではなく
# path: node_modules  # プロジェクトごとに重複
```

**キャッシュ分割**:
```yaml
# 依存関係とビルドを分離
- uses: actions/cache@v4
  with:
    path: ~/.pnpm-store
    key: deps-${{ hashFiles('**/pnpm-lock.yaml') }}

- uses: actions/cache@v4
  with:
    path: .next/cache
    key: build-${{ hashFiles('src/**') }}
```

## 推奨キャッシュ設定テンプレート

### Node.js (pnpm) プロジェクト

```yaml
- name: Setup pnpm
  uses: pnpm/action-setup@v4
  with:
    version: 9

- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: 22
    cache: 'pnpm'

- name: Cache Next.js build
  uses: actions/cache@v4
  with:
    path: .next/cache
    key: nextjs-${{ runner.os }}-${{ hashFiles('**/pnpm-lock.yaml') }}-${{ hashFiles('src/**') }}
    restore-keys: |
      nextjs-${{ runner.os }}-${{ hashFiles('**/pnpm-lock.yaml') }}-
      nextjs-${{ runner.os }}-

- name: Install dependencies
  run: pnpm install --frozen-lockfile
```

### モノレポプロジェクト

```yaml
- name: Setup pnpm
  uses: pnpm/action-setup@v4
  with:
    version: 9

- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: 22
    cache: 'pnpm'

- name: Cache Turbo
  uses: actions/cache@v4
  with:
    path: .turbo
    key: turbo-${{ runner.os }}-${{ github.sha }}
    restore-keys: |
      turbo-${{ runner.os }}-

- name: Install dependencies
  run: pnpm install --frozen-lockfile
```
