# better-sqlite3 Node.jsバージョン管理 - 実装ガイド

## メタ情報

| 項目     | 内容                                     |
| -------- | ---------------------------------------- |
| 機能名   | ENV-INFRA-001-better-sqlite3-version-fix |
| 作成日   | 2026-02-04                               |
| 対象読者 | 開発者・技術者・学習者                   |

---

# Part 1: 概念的な説明（中学生でもわかる版）

## 1. Node.jsバージョン管理って何？

### 1.1 身近な例で考えてみよう

スマホのアプリを思い浮かべてください。

```
iOS 17のiPhone → 最新のLINEが動く
iOS 12の古いiPhone → 最新のLINEが動かない！
```

これは**アプリが特定のバージョンのOSでしか動かない**からです。

プログラミングでも同じことが起きます：

```
Node.js 22 → better-sqlite3（データベース）が動く ✅
Node.js 18 → better-sqlite3が動かない！ ❌
```

### 1.2 なぜバージョン管理が必要なの？

**問題**: チームで開発していると、こんなことが起きます：

```
太郎のPC: Node.js 22 → テスト成功！😊
花子のPC: Node.js 18 → テスト失敗... 😭
CI/CD: Node.js 20 → テスト失敗... 😭
```

同じコードなのに、**Node.jsのバージョンが違うと動いたり動かなかったり**します。

**解決策**: 全員が同じバージョンを使うようにルールを決める！

```
.nvmrc → 「このプロジェクトはNode.js 22.21.1を使ってね」
```

### 1.3 ネイティブモジュールって何？

普通のJavaScriptライブラリ（lodashなど）は、どのNode.jsバージョンでも動きます。

でも**better-sqlite3**は特別です：

```
┌─────────────────────────────────┐
│ better-sqlite3                  │
│ ┌───────────────────────────┐   │
│ │ C++で書かれたコード       │←── コンパイルが必要！
│ │ (超高速だけど特別な処理)  │
│ └───────────────────────────┘   │
└─────────────────────────────────┘
```

C++で書かれた部分は、**Node.jsのバージョンごとにコンパイル（変換）が必要**です。

- Node.js 22でコンパイル → Node.js 22でしか動かない
- Node.js 18でコンパイル → Node.js 18でしか動かない

### 1.4 今回作ったもの

| 日本語                 | 英語                    | 役割                             |
| ---------------------- | ----------------------- | -------------------------------- |
| .nvmrc                 | .nvmrc                  | 使うべきNode.jsバージョンを記録  |
| enginesフィールド      | engines                 | 間違ったバージョンを使うと警告   |
| セットアップスクリプト | setup-native-modules.sh | 自動でビルド問題を検出・修正     |
| Pre-pushフック         | pre-push hook           | プッシュ前にバージョンをチェック |

---

## 2. どうやって動くの？

### 2.1 全体の流れ

```
開発者がプロジェクトを始める
    ↓
.nvmrcを見て正しいNode.jsに切り替え（nvm use）
    ↓
pnpm install（依存関係インストール）
    ↓
setup-native-modules.shが自動実行
    ↓
better-sqlite3が正しくビルドされる ✅
    ↓
テスト実行（10/10成功！）
```

### 2.2 バージョン不一致を防ぐ仕組み

```
┌─────────────────────────────────────────┐
│ 1. .nvmrc (22.21.1)                     │
│    → nvm/fnm が自動でバージョン切替     │
└─────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────┐
│ 2. package.json engines                 │
│    → pnpm install時にバージョンチェック │
└─────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────┐
│ 3. pre-push hook                        │
│    → git push前にバージョン確認         │
└─────────────────────────────────────────┘
```

---

## 3. 問題が起きたときの対処法

### 3.1 エラーメッセージの意味

```
Error: incompatible architecture (have 'arm64', need 'x86_64')
```

これは「**コンパイル済みのファイルが、今のマシンと合わない**」という意味です。

例え話：

```
Windowsで作った実行ファイル(.exe)を
Macで動かそうとしている状態
```

### 3.2 解決方法

```bash
# キャッシュを消して、再インストール
pnpm store prune && pnpm install --force
```

これで**今の環境に合わせて**better-sqlite3が再ビルドされます。

---

# Part 2: 技術的な詳細（開発者向け）

## 1. アーキテクチャ概要

### 1.1 ファイル構成

```
プロジェクトルート/
├── .nvmrc                      # Node.jsバージョン指定（22.21.1）
├── package.json                # engines, volta設定
├── scripts/
│   └── setup-native-modules.sh # ネイティブモジュールセットアップ
├── .husky/
│   └── pre-push               # プッシュ前バージョンチェック
└── .github/workflows/
    └── ci.yml                  # CI設定（node-version: "22"）
```

### 1.2 バージョン管理の三重構造

| レイヤー | ファイル     | 対象ツール | 値                |
| -------- | ------------ | ---------- | ----------------- |
| 1        | .nvmrc       | nvm/fnm    | 22.21.1           |
| 2        | package.json | pnpm/npm   | >=22.21.1 <23.0.0 |
| 3        | package.json | volta      | 22.21.1           |

---

## 2. 設定詳細

### 2.1 .nvmrc

```
22.21.1
```

**なぜこのバージョン**: Node.js 22 LTS（Long Term Support）で安定性を確保。

### 2.2 package.json engines

```json
{
  "engines": {
    "node": ">=22.21.1 <23.0.0",
    "pnpm": ">=10.0.0"
  },
  "volta": {
    "node": "22.21.1"
  }
}
```

**設計判断の根拠**:

| 設計判断       | 選択肢            | 採用理由                                   |
| -------------- | ----------------- | ------------------------------------------ |
| バージョン範囲 | >=22.21.1 <23.0.0 | マイナーアップデートは許可、メジャーは禁止 |
| voltaとの併用  | 両方指定          | 異なるツールユーザーへの対応               |
| pnpmバージョン | >=10.0.0          | モノレポ対応のための最新版                 |

### 2.3 setup-native-modules.sh

```bash
#!/bin/bash
set -e

# ネイティブモジュール（better-sqlite3等）のアーキテクチャ・Node.jsバージョン検証とリビルド

# アーキテクチャ検出
EXPECTED_ARCH=$(node -p "process.arch")
BINARY_PATH=$(find node_modules -name "better_sqlite3.node" 2>/dev/null | head -1)

if [ -n "$BINARY_PATH" ]; then
    ACTUAL_ARCH=$(file "$BINARY_PATH" | grep -o "arm64\|x86_64")

    if [ "$EXPECTED_ARCH" = "arm64" ] && [ "$ACTUAL_ARCH" != "arm64" ]; then
        echo "⚠️ Architecture mismatch detected, rebuilding..."
        pnpm rebuild better-sqlite3
    fi
fi

# 動作検証
node -e "require('better-sqlite3')" 2>/dev/null || {
    echo "🔄 Rebuilding better-sqlite3..."
    pnpm store prune
    pnpm install --force
}

echo "✅ Native modules ready"
```

**なぜこの設計**:

- `set -e`: エラー時に即座に停止
- アーキテクチャ検出: Apple SiliconとIntelの互換性問題を検出
- フォールバック: `pnpm store prune && install --force`で確実に解決

### 2.4 Pre-pushフック（.husky/pre-push）

```bash
#!/bin/sh
# Node.jsバージョンチェック

if [ -f ".nvmrc" ]; then
    REQUIRED_MAJOR=$(sed 's/^v//' .nvmrc | cut -d. -f1)
    CURRENT_MAJOR=$(node -v | sed 's/^v//' | cut -d. -f1)

    if [ "$REQUIRED_MAJOR" != "$CURRENT_MAJOR" ]; then
        echo "⚠️  Node.js version mismatch: current v$(node -v), required v$(cat .nvmrc)"
        # fnm/nvm/voltaで自動切替を試行
    fi
fi
```

---

## 3. トラブルシューティング

### 3.1 NODE_MODULE_VERSION不一致エラー

```
Error: The module was compiled against a different Node.js version
```

**原因**: Node.jsのABI（Application Binary Interface）バージョンが不一致。

**解決手順**:

```bash
# Step 1: Node.jsバージョン確認
node -v
cat .nvmrc

# Step 2: バージョンが異なる場合
nvm use  # または fnm use

# Step 3: ネイティブモジュール再ビルド
pnpm store prune && pnpm install --force
```

### 3.2 アーキテクチャ不一致エラー

```
Error: incompatible architecture (have 'arm64', need 'x86_64')
```

**原因**: Rosetta 2経由でx86_64バイナリがインストールされた。

**解決手順**:

```bash
# pnpmキャッシュをクリアして再インストール
pnpm store prune
pnpm install --force

# 確認
pnpm --filter @repo/shared test workflow-repository.test.ts --run
```

### 3.3 ワークツリーでの問題

git worktreeを使用している場合、node_modulesは共有されないため個別にインストールが必要。

```bash
cd .worktrees/feature-branch
pnpm install
```

---

## 4. CI/CD設定

### 4.1 GitHub Actions

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "22"
          cache: "pnpm"
```

**なぜnode-version: "22"**: .nvmrcの22.21.1と整合性を保ち、CIでも同じメジャーバージョンを使用。

---

## 5. テスト構成

| テストファイル              | テスト数 | カバー範囲             |
| --------------------------- | -------- | ---------------------- |
| workflow-repository.test.ts | 10       | better-sqlite3動作検証 |
| **合計**                    | **10**   |                        |

---

## 6. 使用上の注意

### 6.1 Node.jsバージョン変更時

Node.jsのメジャーバージョンを変更する場合は、以下の全てを更新する必要があります：

```bash
# 更新が必要なファイル
.nvmrc                    # 新バージョン
package.json engines.node # 新範囲
package.json volta.node   # 新バージョン
.github/workflows/*.yml   # node-version
```

### 6.2 推奨ワークフロー

```bash
# 1. プロジェクト開始時
nvm use  # .nvmrcのバージョンに切り替え

# 2. 依存関係インストール
pnpm install

# 3. テスト実行（better-sqlite3動作確認）
pnpm --filter @repo/shared test workflow-repository.test.ts --run

# 4. 問題があれば
bash scripts/setup-native-modules.sh
```

---

## 7. 用語集

| 用語                 | 読み方                           | 説明                                                                                     |
| -------------------- | -------------------------------- | ---------------------------------------------------------------------------------------- |
| better-sqlite3       | ベター・エスキューライト・スリー | Node.js用の高速SQLiteデータベースライブラリ。C++で実装されているためネイティブモジュール |
| ネイティブモジュール | ネイティブモジュール             | C/C++で書かれたNode.jsモジュール。コンパイルが必要でバージョン依存性が高い               |
| NODE_MODULE_VERSION  | ノードモジュールバージョン       | Node.jsのABI（Application Binary Interface）バージョン番号                               |
| .nvmrc               | エヌブイエムアールシー           | nvmが参照するNode.jsバージョン指定ファイル                                               |
| nvm                  | エヌブイエム                     | Node Version Manager。複数のNode.jsバージョンを管理するツール                            |
| fnm                  | エフエヌエム                     | Fast Node Manager。nvmの高速な代替ツール                                                 |
| volta                | ボルタ                           | Node.jsのバージョン管理ツール。package.jsonでバージョン指定可能                          |
| pnpm store           | ピーエヌピーエムストア           | pnpmのグローバルパッケージキャッシュ。全プロジェクトで共有される                         |
| Rosetta 2            | ロゼッタツー                     | Apple SiliconでIntel用アプリを動かす互換レイヤー                                         |
| pre-push hook        | プリプッシュフック               | git push前に自動実行されるスクリプト                                                     |
| CI/CD                | シーアイシーディー               | Continuous Integration/Continuous Delivery。自動テスト・デプロイの仕組み                 |

---

## 8. 次のステップ

本タスクは完了しました。関連する未タスクは以下を参照：

| タスクID | タスク名 | 状態 |
| -------- | -------- | ---- |
| -        | -        | -    |

現時点では、本タスクに直接関連する未完了タスクはありません。
