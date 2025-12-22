# better-sqlite3 Node.jsバージョン不一致問題の解決 - タスク指示書

## ユーザーからの元の指示

```
Pre-pushフックでworkflow-repository.test.tsのテストが失敗している。
原因はbetter-sqlite3がNode.jsバージョン不一致でコンパイルされている。
この問題を解決し、同様の問題が再発しないようにする。
```

## メタ情報

| 項目         | 内容                                             |
| ------------ | ------------------------------------------------ |
| タスクID     | ENV-INFRA-001                                    |
| タスク名     | better-sqlite3 Node.jsバージョン不一致問題の解決 |
| 分類         | インフラ・環境問題                               |
| 対象機能     | テスト実行環境、ネイティブモジュール             |
| 優先度       | 中                                               |
| 見積もり規模 | 小規模                                           |
| ステータス   | 未実施                                           |
| 発見元       | CONV-02-01のPre-pushフック                       |
| 発見日       | 2025-12-21                                       |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

**発生した問題**:

```
Error: The module 'better-sqlite3/build/Release/better_sqlite3.node'
was compiled against a different Node.js version using
NODE_MODULE_VERSION 115. This version of Node.js requires
NODE_MODULE_VERSION 127.
```

**影響範囲**:

- `infrastructure/database/repositories/workflow-repository.test.ts` の10個のテストが失敗
- Pre-pushフックがブロックされ、正常なコードもプッシュできない状態

**根本原因**:

- better-sqlite3はネイティブモジュール（C++）であり、特定のNode.jsバージョンに対してコンパイルされる
- Worktree環境または別のNode.jsバージョンで依存関係がインストールされた
- その後、異なるNode.jsバージョンでテストを実行したため不一致が発生

### 1.2 問題点・課題

1. **テスト失敗**
   - workflow-repository.test.tsが実行不可能
   - リグレッションテストが機能しない

2. **開発フローのブロック**
   - Pre-pushフックで正常なコードもプッシュできない
   - 毎回`--no-verify`が必要になり、品質チェックがスキップされる

3. **再発リスク**
   - Node.jsバージョンの明示的管理がない
   - 開発者間・環境間でNode.jsバージョンが異なる可能性

### 1.3 放置した場合の影響

| 影響            | 深刻度 | 詳細                                 |
| --------------- | ------ | ------------------------------------ |
| テスト品質低下  | 高     | Workflowリポジトリのテストが常に失敗 |
| CI/CD信頼性低下 | 中     | Pre-pushフックの信頼性が損なわれる   |
| 開発効率低下    | 中     | 毎回`--no-verify`が必要              |
| 技術的負債      | 低     | 環境依存の問題が蓄積                 |

---

## 2. 何を達成するか（What）

### 2.1 目的

1. **即座の問題解決**: better-sqlite3を現在のNode.jsバージョンで再ビルド
2. **再発防止**: Node.jsバージョンを明示的に管理し、環境間の不一致を防止
3. **自動化**: バージョン不一致を自動検出・修正する仕組みの構築

### 2.2 最終ゴール

- ✅ workflow-repository.test.tsの10個のテストがすべて成功
- ✅ Pre-pushフックが正常に動作
- ✅ Node.jsバージョン管理の仕組みが確立
- ✅ 同様の問題が再発しない

### 2.3 スコープ

#### 含むもの

- better-sqlite3の再ビルド
- Node.jsバージョン管理の導入（.nvmrc等）
- package.jsonのenginesフィールド設定
- ドキュメント更新

#### 含まないもの

- 他のネイティブモジュールの修正（現時点で問題が発生していないため）
- Node.jsバージョンのアップグレード（現バージョンで統一）
- CI/CD環境のNode.jsバージョン変更

### 2.4 成果物

| 種別         | 成果物                  | 配置先             | 内容                      |
| ------------ | ----------------------- | ------------------ | ------------------------- |
| 設定         | .nvmrc                  | プロジェクトルート | Node.jsバージョン指定     |
| 設定         | package.json（更新）    | プロジェクトルート | enginesフィールド設定     |
| スクリプト   | check-node-version.sh   | .husky/hooks/      | Node.jsバージョンチェック |
| ドキュメント | CONTRIBUTING.md（更新） | プロジェクトルート | Node.js要件の明記         |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- [x] プロジェクトがpnpmで管理されている
- [x] huskyがインストールされている
- [x] 現在のNode.jsバージョンが確認できる（`node -v`）

### 3.2 依存タスク

**なし**（独立したタスク）

### 3.3 必要な知識・スキル

- Node.jsのNODE_MODULE_VERSION仕組み
- ネイティブモジュール（node-gyp）のビルドプロセス
- .nvmrc、package.json enginesの使用方法
- huskyフックのスクリプト作成

### 3.4 推奨アプローチ

#### アプローチA: 即座の修正（推奨）

1. 現在のNode.jsバージョンを確認
2. better-sqlite3を再ビルド
3. テストが成功することを確認

#### アプローチB: 根本的な再発防止

1. .nvmrcを作成してNode.jsバージョンを固定
2. package.json enginesフィールドを設定
3. Pre-installフックでバージョンチェック追加
4. ドキュメント更新

**推奨**: アプローチA→アプローチBの順で実施

---

## 4. 実行手順

### Phase 0: 問題診断

#### 目的

現在のNode.jsバージョンとbetter-sqlite3のビルド状況を確認する。

#### 診断コマンド

```bash
# 現在のNode.jsバージョン確認
node -v

# npm_config_target確認（better-sqlite3がどのバージョンでビルドされたか）
npm list better-sqlite3

# ネイティブモジュールの情報確認
ls -la node_modules/better-sqlite3/build/Release/
```

#### 期待結果

- Node.jsバージョンが判明
- better-sqlite3のビルド状態が確認できる

---

### Phase 1: 即座の修正（better-sqlite3再ビルド）

#### 目的

better-sqlite3を現在のNode.jsバージョンで再ビルドし、テストを成功させる。

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです

```
/ai:rebuild-native-modules --module "better-sqlite3"
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 使用エージェント

- **エージェント**: @devops-eng
- **選定理由**: インフラ・依存関係管理の専門家
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキル

| スキル名              | 活用方法                           |
| --------------------- | ---------------------------------- |
| dependency-auditing   | ネイティブモジュールの依存関係分析 |
| environment-isolation | 環境間の依存関係分離               |

- **参照**: `.claude/skills/skill_list.md`

#### 実行コマンド（ターミナル）

```bash
# オプション1: 特定モジュールのみ再ビルド（推奨）
pnpm rebuild better-sqlite3

# オプション2: すべてのネイティブモジュールを再ビルド
pnpm rebuild

# オプション3: 依存関係を再インストール（時間がかかる）
rm -rf node_modules
pnpm install
```

#### テスト検証

```bash
# Workflow リポジトリテストを実行
pnpm --filter @repo/shared test workflow-repository.test.ts --run
```

#### 成果物

- 再ビルドされたbetter-sqlite3モジュール

#### 完了条件

- [ ] better-sqlite3が現在のNode.jsバージョンで再ビルドされた
- [ ] workflow-repository.test.tsの10個のテストがすべて成功
- [ ] Pre-pushフックが正常に動作

---

### Phase 2: Node.jsバージョン管理の導入

#### 目的

Node.jsバージョンを明示的に管理し、環境間の不一致を防止する。

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです

```
/ai:setup-node-version-management --current-version "v20.0.0"
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 使用エージェント

- **エージェント**: @devops-eng
- **選定理由**: CI/CD環境設定の専門家
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキル

| スキル名               | 活用方法                 |
| ---------------------- | ------------------------ |
| environment-isolation  | 環境変数・バージョン管理 |
| infrastructure-as-code | 環境設定のコード化       |

- **参照**: `.claude/skills/skill_list.md`

#### 実装内容

##### 2.1 .nvmrcファイル作成

```bash
# プロジェクトルートに.nvmrcを作成
echo "v20.0.0" > .nvmrc
```

**ファイル内容**:

```
v20.0.0
```

##### 2.2 package.json enginesフィールド設定

```json
{
  "engines": {
    "node": ">=20.0.0 <21.0.0",
    "pnpm": ">=9.0.0"
  }
}
```

##### 2.3 バージョンチェックスクリプト作成

**ファイル**: `.husky/hooks/check-node-version.sh`

```bash
#!/bin/bash

# .nvmrcからNode.jsバージョンを読み取る
REQUIRED_VERSION=$(cat .nvmrc)
CURRENT_VERSION=$(node -v)

if [ "$CURRENT_VERSION" != "$REQUIRED_VERSION" ]; then
  echo "❌ Node.jsバージョン不一致"
  echo "  必要: $REQUIRED_VERSION"
  echo "  現在: $CURRENT_VERSION"
  echo ""
  echo "解決方法:"
  echo "  nvm install && nvm use"
  echo "  または"
  echo "  pnpm rebuild"
  exit 1
fi

echo "✅ Node.jsバージョン: $CURRENT_VERSION"
```

##### 2.4 Pre-installフックへの組み込み

**ファイル**: `package.json`

```json
{
  "scripts": {
    "preinstall": "node -e \"if(process.version !== require('fs').readFileSync('.nvmrc','utf8').trim()) { console.error('Node.js version mismatch. Run: nvm use'); process.exit(1); }\""
  }
}
```

#### 成果物

| 成果物                | パス               | 内容                         |
| --------------------- | ------------------ | ---------------------------- |
| .nvmrc                | プロジェクトルート | Node.jsバージョン指定        |
| package.json          | プロジェクトルート | enginesフィールド追加        |
| check-node-version.sh | .husky/hooks/      | バージョンチェックスクリプト |

#### 完了条件

- [ ] .nvmrcファイルが作成されている
- [ ] package.json enginesフィールドが設定されている
- [ ] バージョン不一致時に警告が表示される
- [ ] ドキュメントにNode.js要件が明記されている

---

### Phase 3: ドキュメント更新

#### 目的

開発者がNode.js要件を理解し、正しい環境でセットアップできるようにする。

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです

```
/ai:update-contributing-docs --section "environment-setup"
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 使用エージェント

- **エージェント**: @manual-writer
- **選定理由**: 開発者向けドキュメントの作成専門家
- **参照**: `.claude/agents/agent_list.md`

#### 更新対象ドキュメント

**README.md** または **CONTRIBUTING.md**に以下を追記:

````markdown
## 開発環境のセットアップ

### 必須要件

- **Node.js**: v20.0.0（必須）
- **pnpm**: 9.0.0以上

### Node.jsバージョンの設定

このプロジェクトはNode.js v20.0.0を使用しています。

#### nvmを使用する場合（推奨）

\```bash

# .nvmrcからバージョンを自動読み込み

nvm install
nvm use
\```

#### 手動でバージョンを確認する場合

\```bash
node -v

# v20.0.0 と表示されることを確認

\```

### ネイティブモジュールの再ビルド

Node.jsバージョンを変更した後は、ネイティブモジュールの再ビルドが必要です:

\```bash

# better-sqlite3のみ再ビルド

pnpm rebuild better-sqlite3

# またはすべてのネイティブモジュールを再ビルド

pnpm rebuild
\```

### トラブルシューティング

#### エラー: NODE_MODULE_VERSION 不一致

**症状**:
\```
The module 'better-sqlite3/build/Release/better_sqlite3.node'
was compiled against a different Node.js version
\```

**解決方法**:
\```bash

# 1. Node.jsバージョンを確認

node -v

# 2. .nvmrcのバージョンと一致しない場合

nvm use

# 3. better-sqlite3を再ビルド

pnpm rebuild better-sqlite3

# 4. テストを実行して確認

pnpm test
\```
````

#### 成果物

| 成果物           | パス                             | 内容                          |
| ---------------- | -------------------------------- | ----------------------------- |
| 更新ドキュメント | README.md または CONTRIBUTING.md | Node.js要件・セットアップ手順 |

#### 完了条件

- [ ] Node.js要件がドキュメントに明記されている
- [ ] セットアップ手順が記載されている
- [ ] トラブルシューティングガイドが含まれている

---

### Phase 4: CI/CD環境の確認・統一

#### 目的

GitHub ActionsのNode.jsバージョンが.nvmrcと一致していることを確認する。

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです

```
/ai:update-ci-node-version --version-file ".nvmrc"
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 使用エージェント

- **エージェント**: @gha-workflow-architect
- **選定理由**: GitHub Actions設定の専門家
- **参照**: `.claude/agents/agent_list.md`

#### 確認・修正内容

**.github/workflows/\*.yml**のNode.jsバージョンを統一:

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      # .nvmrcからバージョンを自動読み込み
      - uses: actions/setup-node@v4
        with:
          node-version-file: ".nvmrc"
          cache: "pnpm"
```

**または明示的にバージョン指定**:

```yaml
- uses: actions/setup-node@v4
  with:
    node-version: "20.0.0"
    cache: "pnpm"
```

#### 成果物

| 成果物                 | パス                     | 内容                  |
| ---------------------- | ------------------------ | --------------------- |
| 更新されたワークフロー | .github/workflows/\*.yml | Node.jsバージョン統一 |

#### 完了条件

- [ ] すべてのGitHub ActionsワークフローでNode.js v20.0.0を使用
- [ ] .nvmrcまたは明示的バージョン指定のいずれかが設定されている
- [ ] CIが成功する

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] better-sqlite3が正常に動作する
- [ ] workflow-repository.test.tsの10個のテストがすべて成功
- [ ] Pre-pushフックがブロックされない

### 品質要件

- [ ] Node.jsバージョンが明示的に管理されている（.nvmrc）
- [ ] package.json enginesフィールドが設定されている
- [ ] バージョン不一致時に警告が表示される

### ドキュメント要件

- [ ] セットアップ手順がドキュメント化されている
- [ ] トラブルシューティングガイドが記載されている

---

## 6. 検証方法

### テストケース

| No  | テスト項目               | 操作手順                                                            | 期待結果                             |
| --- | ------------------------ | ------------------------------------------------------------------- | ------------------------------------ |
| 1   | better-sqlite3再ビルド   | `pnpm rebuild better-sqlite3`                                       | エラーなく完了                       |
| 2   | Workflowリポジトリテスト | `pnpm --filter @repo/shared test workflow-repository.test.ts --run` | 10/10テスト成功                      |
| 3   | Pre-pushフック           | `git push`                                                          | すべてのテストが成功してプッシュ完了 |
| 4   | バージョン不一致検出     | Node.js v18で`pnpm install`実行                                     | 警告が表示される                     |

### 検証手順

1. **即座の修正検証**

   ```bash
   pnpm rebuild better-sqlite3
   pnpm --filter @repo/shared test workflow-repository.test.ts --run
   ```

   期待: 10/10テスト成功

2. **Pre-pushフック検証**

   ```bash
   git commit --allow-empty -m "test: verify pre-push hook"
   git push
   ```

   期待: テストがすべて成功してプッシュ完了

3. **バージョン管理検証**
   ```bash
   # 異なるNode.jsバージョンに切り替え（nvmがある場合）
   nvm use 18
   pnpm install
   ```
   期待: バージョン不一致の警告が表示される

---

## 7. リスクと対策

| リスク                                 | 影響度 | 発生確率 | 対策                                                |
| -------------------------------------- | ------ | -------- | --------------------------------------------------- |
| 再ビルド失敗                           | 高     | 低       | node-gypの依存ツール（Python、C++コンパイラ）を確認 |
| 他のネイティブモジュールでも同様の問題 | 中     | 中       | `pnpm rebuild`ですべて再ビルド                      |
| CI環境でバージョン不一致               | 中     | 低       | .github/workflows/\*.ymlで.nvmrc参照を設定          |
| 開発者間でNode.jsバージョンが異なる    | 低     | 中       | CONTRIBUTING.mdに明記、Pre-installフックで検出      |

---

## 8. 参照情報

### 関連ドキュメント

- `docs/00-requirements/03-technology-stack.md` - Node.js要件
- `docs/00-requirements/12-deployment.md` - デプロイ環境
- `.github/workflows/` - CI/CD設定

### 参考資料

- [better-sqlite3 Documentation](https://github.com/WiseLibs/better-sqlite3)
- [Node.js Addon API](https://nodejs.org/api/addons.html)
- [nvm Usage](https://github.com/nvm-sh/nvm)
- [package.json engines](https://docs.npmjs.com/cli/v10/configuring-npm/package-json#engines)

---

## 9. 備考

### レビュー指摘の原文

```
Pre-pushフックでworkflow-repository.test.tsが失敗。
better-sqlite3のNODE_MODULE_VERSION不一致。
同様の問題が再発しないように対策が必要。
```

### 補足事項

#### Node.jsバージョンとNODE_MODULE_VERSION対応表

| Node.jsバージョン | NODE_MODULE_VERSION |
| ----------------- | ------------------- |
| v18.x             | 108                 |
| v19.x             | 111                 |
| v20.0.0           | 115                 |
| v20.x（最新）     | 127                 |
| v21.x             | 120                 |

**注意**: 本問題は、v20.0.0（MODULE 115）でビルドされたbetter-sqlite3を、
より新しいv20.x（MODULE 127）で実行しようとしたため発生。

#### ネイティブモジュール一覧（参考）

現在プロジェクトで使用しているネイティブモジュール:

- better-sqlite3（DBアクセス）
- （他のネイティブモジュールがあれば記載）

#### 実装時の注意点

1. **Worktree環境での注意**
   - Worktreeごとにnode_modulesは独立
   - Worktree作成時に必ず`pnpm install`を実行
   - 本体リポジトリとは別環境として扱う

2. **Dockerコンテナ使用時の注意**
   - コンテナ内のNode.jsバージョンも.nvmrcと一致させる
   - Dockerfileで`FROM node:20.0.0-alpine`等を指定

3. **macOS/Windows/Linux間の違い**
   - better-sqlite3はプラットフォームごとにビルドが必要
   - クロスプラットフォーム開発では各環境で再ビルドを実施

---

## 変更履歴

| 日付       | バージョン | 変更者 | 変更内容                                       |
| ---------- | ---------- | ------ | ---------------------------------------------- |
| 2025-12-21 | 1.0.0      | AI     | 初版作成（better-sqlite3バージョン不一致問題） |
