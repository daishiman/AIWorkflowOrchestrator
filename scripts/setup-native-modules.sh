#!/bin/bash
# ネイティブモジュール（better-sqlite3等）のアーキテクチャ検証とリビルド
# ワークツリー、新規クローン、異なるマシンでの問題を防ぐ

set -e

echo "🔧 ネイティブモジュールのセットアップを開始..."

# 現在のアーキテクチャを取得
CURRENT_ARCH=$(uname -m)
echo "📋 現在のアーキテクチャ: $CURRENT_ARCH"

# better-sqlite3のバイナリパスを探す
SQLITE_BINARY=$(find node_modules -name "better_sqlite3.node" 2>/dev/null | head -1)

if [ -z "$SQLITE_BINARY" ]; then
  echo "⚠️  better-sqlite3バイナリが見つかりません。リビルドを実行します..."
  NEEDS_REBUILD=true
else
  # バイナリのアーキテクチャを確認
  BINARY_ARCH=$(file "$SQLITE_BINARY" | grep -oE 'arm64|x86_64' | head -1)
  echo "📋 バイナリのアーキテクチャ: ${BINARY_ARCH:-不明}"

  # アーキテクチャが一致するか確認
  if [ "$CURRENT_ARCH" = "arm64" ] && [ "$BINARY_ARCH" != "arm64" ]; then
    echo "⚠️  アーキテクチャ不一致を検出（期待: arm64, 実際: $BINARY_ARCH）"
    NEEDS_REBUILD=true
  elif [ "$CURRENT_ARCH" = "x86_64" ] && [ "$BINARY_ARCH" != "x86_64" ]; then
    echo "⚠️  アーキテクチャ不一致を検出（期待: x86_64, 実際: $BINARY_ARCH）"
    NEEDS_REBUILD=true
  else
    echo "✅ アーキテクチャは正常です"
    NEEDS_REBUILD=false
  fi
fi

# リビルドが必要な場合
if [ "$NEEDS_REBUILD" = true ]; then
  echo "🔨 better-sqlite3をリビルド中..."

  # pnpmのグローバルストアからも削除して、確実にリビルドされるようにする
  echo "📋 キャッシュをクリア中..."
  pnpm store prune 2>/dev/null || true

  # リビルド実行
  if pnpm rebuild better-sqlite3; then
    echo "✅ better-sqlite3のリビルド完了"
  else
    echo "⚠️  リビルド失敗。フルインストールを試みます..."
    pnpm install --force
  fi

  # 再度確認
  SQLITE_BINARY=$(find node_modules -name "better_sqlite3.node" 2>/dev/null | head -1)
  if [ -n "$SQLITE_BINARY" ]; then
    BINARY_ARCH=$(file "$SQLITE_BINARY" | grep -oE 'arm64|x86_64' | head -1)
    echo "📋 リビルド後のアーキテクチャ: ${BINARY_ARCH:-不明}"

    if [ "$CURRENT_ARCH" = "arm64" ] && [ "$BINARY_ARCH" = "arm64" ]; then
      echo "✅ アーキテクチャが正しくなりました"
    elif [ "$CURRENT_ARCH" = "x86_64" ] && [ "$BINARY_ARCH" = "x86_64" ]; then
      echo "✅ アーキテクチャが正しくなりました"
    else
      echo "❌ エラー: リビルド後もアーキテクチャが不正です"
      echo "   手動で以下を実行してください:"
      echo "   pnpm store prune && pnpm install --force"
      exit 1
    fi
  fi
fi

echo ""
echo "🎉 ネイティブモジュールのセットアップ完了"
