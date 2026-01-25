#!/bin/bash
# worktree作成後のセットアップスクリプト
# LaunchServicesキャッシュをクリアして、カスタムプロトコルの問題を防ぐ

set -e

echo "🔧 Worktreeセットアップを開始します..."

# 1. LaunchServicesキャッシュをクリア
echo "📋 LaunchServicesキャッシュをクリア中..."
/System/Library/Frameworks/CoreServices.framework/Frameworks/LaunchServices.framework/Support/lsregister -kill -r -domain local -domain system -domain user

echo "✅ キャッシュクリア完了"

# 2. ネイティブモジュールのセットアップ
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [ -f "$SCRIPT_DIR/setup-native-modules.sh" ]; then
  echo "📋 ネイティブモジュールをセットアップ中..."
  "$SCRIPT_DIR/setup-native-modules.sh"
fi

# 3. .envシンボリックリンクを確認・作成
WORKTREE_ROOT=$(git rev-parse --show-toplevel)
PROJECT_ROOT=$(cd "$WORKTREE_ROOT/../.." && pwd)

if [ ! -L "$WORKTREE_ROOT/apps/desktop/.env" ]; then
  echo "📋 .envシンボリックリンクを作成中..."
  ln -sf "$PROJECT_ROOT/.env" "$WORKTREE_ROOT/apps/desktop/.env"
  echo "✅ .envシンボリックリンク作成完了"
else
  echo "✅ .envシンボリックリンクは既に存在します"
fi

echo ""
echo "🎉 Worktreeセットアップ完了！"
echo ""
echo "次のステップ:"
echo "  cd $(basename $WORKTREE_ROOT)"
echo "  pnpm --filter @repo/desktop preview"
echo ""
