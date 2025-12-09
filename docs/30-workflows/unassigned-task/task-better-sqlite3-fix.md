# better-sqlite3 Node.jsバージョン互換性問題の修正

## タスク概要

| 項目       | 内容                                          |
| ---------- | --------------------------------------------- |
| タスク名   | better-sqlite3 NODE_MODULE_VERSION 互換性修正 |
| 対象       | packages/shared/infrastructure/database       |
| 優先度     | 高                                            |
| 見積もり   | 小規模                                        |
| ステータス | 未実施                                        |

## 背景と目的

### 発生している問題

```
Error: The module '/Users/.../node_modules/better-sqlite3/build/Release/better_sqlite3.node'
was compiled against a different Node.js version using
NODE_MODULE_VERSION 115. This version of Node.js requires
NODE_MODULE_VERSION 127. Please try re-compiling or re-installing
the module (for instance, using `npm rebuild` or `npm install`).
```

### 原因

- `better-sqlite3` はネイティブモジュールであり、Node.jsバージョンごとにコンパイルが必要
- Node.jsのアップグレード後、再コンパイルされていない
- NODE_MODULE_VERSION 115 = Node.js 20.x
- NODE_MODULE_VERSION 127 = Node.js 22.x

### 影響範囲

| ファイル                      | 影響         |
| ----------------------------- | ------------ |
| `workflow-repository.test.ts` | 10テスト失敗 |
| その他SQLite使用テスト        | 潜在的に影響 |

## 解決方法

### 方法1: モジュール再ビルド（推奨）

```bash
# node_modules削除と再インストール
rm -rf node_modules
pnpm install

# または better-sqlite3 のみ再ビルド
pnpm rebuild better-sqlite3
```

### 方法2: Node.jsバージョン固定

`.nvmrc` または `.node-version` でNode.jsバージョンを固定：

```bash
# .nvmrc
20.18.0
```

```bash
# 使用方法
nvm use
```

### 方法3: postinstallスクリプト追加

`package.json` に postinstall フックを追加：

```json
{
  "scripts": {
    "postinstall": "electron-rebuild -f -w better-sqlite3"
  }
}
```

### 方法4: better-sqlite3をsql.jsに置換

ネイティブモジュールを使用しない純粋なJavaScript実装に置換：

```bash
pnpm remove better-sqlite3
pnpm add sql.js
```

**メリット**:

- クロスプラットフォーム互換性向上
- Node.jsバージョン依存なし

**デメリット**:

- パフォーマンス低下（WASM実行）
- APIの違いによる移行コスト

## 実装手順

### Phase 1: 原因調査

```bash
# 現在のNode.jsバージョン確認
node --version

# better-sqlite3がコンパイルされたバージョン確認
node -e "console.log(process.versions.modules)"

# 期待されるバージョン
# Node.js 20.x → 115
# Node.js 22.x → 127
```

### Phase 2: 解決策実施

```bash
# 方法1を実施
rm -rf node_modules
rm -rf apps/desktop/node_modules
rm -rf packages/shared/node_modules
pnpm install
```

### Phase 3: テスト実行確認

```bash
# 該当テスト実行
pnpm --filter @repo/shared vitest run workflow-repository
```

### Phase 4: CI/CD設定確認

GitHub Actions の `actions/setup-node` でNode.jsバージョンを明示的に指定：

```yaml
- uses: actions/setup-node@v4
  with:
    node-version: "20.x" # または .nvmrc から読み取り
    cache: "pnpm"
```

## 予防策

### 1. Node.jsバージョン管理

プロジェクトルートに `.nvmrc` を配置：

```bash
echo "20.18.0" > .nvmrc
```

### 2. 開発環境セットアップドキュメント

`docs/CONTRIBUTING.md` に以下を追加：

````markdown
## 開発環境セットアップ

1. Node.jsバージョンの確認
   ```bash
   nvm use  # .nvmrc のバージョンを使用
   ```
````

2. 依存関係インストール

   ```bash
   pnpm install
   ```

3. ネイティブモジュールの問題が発生した場合
   ```bash
   pnpm rebuild better-sqlite3
   ```

````

### 3. pre-pushフック改善

現在のpre-pushフックでテストが失敗した場合、より明確なエラーメッセージを表示：

```bash
# .husky/pre-push
if ! pnpm test:all; then
  echo ""
  echo "❌ Tests failed."
  echo ""
  echo "💡 If you see NODE_MODULE_VERSION errors:"
  echo "   Run: pnpm rebuild better-sqlite3"
  echo ""
  exit 1
fi
````

## 完了条件

- [ ] `workflow-repository.test.ts` の10テストがパス
- [ ] 全テストがローカルで成功
- [ ] CI/CDでテストが成功
- [ ] `.nvmrc` が追加されている
- [ ] 開発環境セットアップドキュメントが更新されている

## 関連ドキュメント

- [better-sqlite3 GitHub](https://github.com/WiseLibs/better-sqlite3)
- [Electron Rebuild](https://github.com/electron/rebuild)
- [Node.js Release Schedule](https://nodejs.org/en/about/releases/)

## 備考

### 暫定対応

PRをマージするために `--no-verify` でプッシュした場合、本タスクを**早急に**実施すること。

### 長期的な検討

1. **Turso Embedded Replicas** への移行検討
   - better-sqlite3 から libsql-client への移行
   - オフライン対応とクラウド同期の統合

2. **テスト環境の分離**
   - 本番コードとテストコードでSQLiteライブラリを分離
   - テストではインメモリDBモックを使用
