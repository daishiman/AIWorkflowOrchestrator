# Lock File Management パターン

> **相対パス**: `references/patterns.md`
> **読込条件**: 問題解決時

---

## 問題別解決パターン

### パターン1: マージコンフリクト

**症状**: ロックファイルにコンフリクトマーカー（<<<, ===, >>>）

**解決手順**:

```bash
# 1. ロックファイルを削除
rm pnpm-lock.yaml  # or package-lock.json

# 2. package.jsonのコンフリクトを解決

# 3. 再生成
pnpm install
```

---

### パターン2: package.jsonとの不整合

**症状**: インストール時に警告、依存関係の不一致

**解決手順**:

```bash
# 1. ロックファイルを更新
pnpm install

# 2. 差分を確認
git diff pnpm-lock.yaml

# 3. 変更をコミット
git add pnpm-lock.yaml
```

---

### パターン3: ロックファイル欠損

**症状**: ロックファイルが存在しない

**解決手順**:

```bash
# 1. 生成
pnpm install

# 2. VCSに追加
git add pnpm-lock.yaml
git commit -m "Add lock file"
```

---

### パターン4: バージョン不一致

**症状**: 異なる環境で異なる依存関係がインストールされる

**解決手順**:

```bash
# 1. node_modulesをクリア
rm -r node_modules

# 2. frozen-lockfileでインストール
pnpm install --frozen-lockfile

# 3. 失敗する場合はロックファイル再生成
pnpm install --force
```

---

## CI/CDキャッシュ戦略

### pnpm

```yaml
- name: Get pnpm store directory
  id: pnpm-cache
  shell: bash
  run: echo "STORE_PATH=$(pnpm store path)" >> $GITHUB_OUTPUT

- uses: actions/cache@v4
  with:
    path: ${{ steps.pnpm-cache.outputs.STORE_PATH }}
    key: ${{ runner.os }}-pnpm-${{ hashFiles('**/pnpm-lock.yaml') }}
    restore-keys: |
      ${{ runner.os }}-pnpm-
```

---

## パッケージマネージャー移行

### npm → pnpm

```bash
# 1. pnpmをインストール
npm install -g pnpm

# 2. npmロックファイルを削除
rm package-lock.json

# 3. pnpmでインストール
pnpm install

# 4. npmrcにpnpm設定を追加
echo "engine-strict=true" >> .npmrc
```

---

## 整合性検証コマンド

```bash
# pnpm
pnpm install --frozen-lockfile

# npm
npm ci

# 依存関係ツリー確認
pnpm list --depth 2
npm list --depth 2
```

---

## 関連リソース

- **基礎知識**: See [basics.md](basics.md)
