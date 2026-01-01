# Level 1: Basics - Git Hooks 基礎知識

## 概要

Git Hooksの基本概念とシンプルな実装パターンを学ぶレベル。pre-commitフックを使った基本的なコード品質チェックを実装できるようになることが目標。

## 前提条件

- Gitの基本操作（commit、push、branch）を理解している
- シェルスクリプト（bash）の基本構文を読める
- プロジェクトにpackage.jsonが存在する（Node.js/TypeScript環境を想定）

## Git Hooksとは

### 定義

Git Hooksは、Gitの特定のイベント（コミット、プッシュ、マージ等）が発生した際に自動実行されるスクリプト。ローカル開発環境での「最初の品質ゲート」として機能する。

### 配置場所

```
プロジェクトルート/
└── .git/
    └── hooks/
        ├── pre-commit         # コミット前に実行
        ├── pre-push          # プッシュ前に実行
        ├── commit-msg        # コミットメッセージ作成後に実行
        └── ...
```

### 基本原則

1. **ローカル実行**: CI/CDより前に開発者のマシンで実行される
2. **失敗時は操作を中止**: フックが0以外で終了するとGit操作がキャンセルされる
3. **高速性**: 遅いフックは開発体験を損なうため、5秒以内が目安
4. **共有不可（デフォルト）**: .git/hooks/ は Git管理外なので、チームで共有するには工夫が必要

## 最も重要な2つのフック

### 1. pre-commit

**実行タイミング**: `git commit` コマンド実行時、コミットメッセージ入力前

**用途**:

- コードフォーマット確認（Prettier）
- Lint実行（ESLint）
- 型チェック（TypeScript）
- 簡単なユニットテスト（高速なもののみ）

**メリット**:

- 「壊れたコード」をコミット履歴に残さない
- フォーマット崩れやLintエラーを即座に検出

**制約**:

- 実行時間は5秒以内が目安（遅いと開発者が `--no-verify` でスキップする）
- ステージ済みファイルのみを対象にする（全ファイルスキャンは避ける）

### 2. pre-push

**実行タイミング**: `git push` コマンド実行時、リモートへの送信前

**用途**:

- テストスイート実行（ユニットテスト、統合テスト）
- ビルド確認
- セキュリティスキャン
- コミットメッセージ規約チェック（複数コミットを対象）

**メリット**:

- リモートブランチを「壊さない」保証
- CI/CDより前に問題を検出（CI時間の節約）

**制約**:

- 実行時間は30秒以内が目安
- ネットワーク通信は避ける（リモートAPIへの依存はNG）

## シンプルな実装例

### pre-commit の最小構成

```bash
#!/bin/bash
# .git/hooks/pre-commit

set -e  # エラーで即座に終了

echo "Running pre-commit checks..."

# ステージ済みファイルを取得
STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACMR)

if [ -z "$STAGED_FILES" ]; then
  echo "✅ No staged files"
  exit 0
fi

# Prettier チェック
echo "Checking code formatting..."
npx prettier --check $STAGED_FILES

echo "✅ All checks passed"
exit 0
```

### フックのインストール手順

```bash
# 1. フックスクリプトを作成
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
set -e
echo "Running pre-commit checks..."
npx prettier --check $(git diff --cached --name-only --diff-filter=ACMR)
echo "✅ All checks passed"
exit 0
EOF

# 2. 実行権限を付与
chmod +x .git/hooks/pre-commit

# 3. 動作確認
git add .
git commit -m "test"  # フックが実行される
```

## ベストプラクティス（基礎レベル）

### すべきこと

1. **エラーメッセージを明確に**: 何が問題で、どう修正するかを表示

   ```bash
   if ! npx prettier --check $STAGED_FILES; then
     echo "❌ Prettier check failed"
     echo "Run: npx prettier --write ."
     exit 1
   fi
   ```

2. **カラー出力で視認性を向上**:

   ```bash
   RED='\033[0;31m'
   GREEN='\033[0;32m'
   NC='\033[0m'  # No Color
   echo -e "${GREEN}✅ All checks passed${NC}"
   ```

3. **ステージ済みファイルのみを対象**:

   ```bash
   # ✅ 正しい（ステージ済みのみ）
   git diff --cached --name-only --diff-filter=ACMR

   # ❌ 間違い（全ファイル）
   git ls-files
   ```

4. **空コミット対策**:
   ```bash
   if [ -z "$STAGED_FILES" ]; then
     echo "No files to check"
     exit 0  # 空コミットを許可
   fi
   ```

### 避けるべきこと

1. **全ファイルスキャン**: 大規模プロジェクトで遅くなる
2. **ネットワーク通信**: インターネット接続に依存しない
3. **自動修正**: フックが勝手にファイルを変更すると混乱を招く（警告のみにする）
4. **複雑すぎるロジック**: 10行以内が目安、複雑ならスクリプトファイルに分離

## よくある問題と解決策

### 問題1: フックがスキップされる

**原因**: `git commit --no-verify` でフックを無視できる

**解決策**:

- チーム全体でフックの重要性を共有
- CI/CDでも同じチェックを実行（二重の安全網）

### 問題2: フックが遅い

**原因**: 全ファイルをチェック、重いテストを実行

**解決策**:

- ステージ済みファイルのみを対象にする
- 重い処理はpre-pushに移動
- 並列実行やキャッシュを活用（Level 3で扱う）

### 問題3: フックがチーム間で共有されない

**原因**: `.git/hooks/` はGit管理外

**解決策**:

- フックスクリプトをプロジェクトルートに配置（例: `scripts/hooks/`）
- セットアップスクリプトでコピー:
  ```bash
  # scripts/setup-hooks.sh
  #!/bin/bash
  cp scripts/hooks/pre-commit .git/hooks/pre-commit
  chmod +x .git/hooks/pre-commit
  echo "✅ Hooks installed"
  ```

## 実践手順（Level 1）

1. **目的を明確にする**: 「コミット前にPrettierとESLintを実行したい」
2. **assets/pre-commit-template.sh を確認**: 基本構造を理解
3. **プロジェクト固有の設定を反映**: package.jsonのスクリプトに合わせる
4. **.git/hooks/pre-commit にコピーして実行権限を付与**
5. **テスト実行**: わざとエラーを含むファイルでコミットして動作確認

## チェックリスト

- [ ] Git Hooksの基本原則（ローカル実行、失敗時中止、高速性）を理解した
- [ ] pre-commit と pre-push の違いと使い分けを説明できる
- [ ] シンプルなpre-commitフックを実装できる
- [ ] ステージ済みファイルのみを対象にする方法を知っている
- [ ] フックのインストール手順（chmod +x）を実行できる
- [ ] エラー時に適切なメッセージを表示できる

## 次のステップ

Level 1をクリアしたら、Level 2（Intermediate）に進む:

- 複数ツール（Prettier + ESLint + TypeScript）の統合
- エラーハンドリングの強化
- チーム共有の仕組み（Huskyなどのツール活用）

参照: references/Level2_intermediate.md
