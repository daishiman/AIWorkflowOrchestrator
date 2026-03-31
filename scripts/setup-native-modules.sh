#!/bin/bash
# ネイティブモジュール（better-sqlite3 / esbuild等）のアーキテクチャ・Node.jsバージョン検証とリビルド
# ワークツリー、新規クローン、異なるマシン、Node.jsアップグレード後の問題を防ぐ

set -e

REPO_ROOT=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
DESKTOP_DIR="$REPO_ROOT/apps/desktop"
SHARED_WORKSPACE_DIR="$REPO_ROOT/packages/shared"

log() { echo "[native-modules] $1"; }
desktop_exec() { pnpm --dir "$DESKTOP_DIR" exec "$@"; }
desktop_electron_as_node_exec() {
  ELECTRON_RUN_AS_NODE=1 pnpm --dir "$DESKTOP_DIR" exec electron "$@";
}

# --- 環境情報の収集 ---
check_architecture() {
  NODE_ARCH=$(node -p "process.arch")
  if [ "$NODE_ARCH" = "arm64" ]; then
    CURRENT_ARCH="arm64"
  elif [ "$NODE_ARCH" = "x64" ]; then
    CURRENT_ARCH="x86_64"
  else
    CURRENT_ARCH=$(uname -m)
  fi
  log "現在のアーキテクチャ: $CURRENT_ARCH (Node.js: $NODE_ARCH)"
}

check_node_abi() {
  CURRENT_NODE_ABI=$(node -p "process.versions.modules")
  CURRENT_NODE_VERSION=$(node -v)
  log "Node.jsバージョン: $CURRENT_NODE_VERSION (ABI: $CURRENT_NODE_ABI)"
}

check_sqlite_binary() {
  SQLITE_BINARY=$(find node_modules -name "better_sqlite3.node" 2>/dev/null | head -1)
  if [ -z "$SQLITE_BINARY" ]; then
    log "⚠️  better-sqlite3バイナリが見つかりません"
    return 1
  fi

  log "検出した better-sqlite3 バイナリ: $SQLITE_BINARY"
  file "$SQLITE_BINARY" 2>/dev/null | sed 's/^/[native-modules] /'
  return 0
}

verify_sqlite_with_node() {
  log "Node.js コンテキストで better-sqlite3 を検証中..."
  TEST_RESULT=$(desktop_exec node -e "try { require('better-sqlite3'); console.log('OK'); } catch (e) { console.error(e.message); process.exit(1); }" 2>&1 || true)

  if echo "$TEST_RESULT" | grep -q "OK"; then
    log "✅ Node.js コンテキストで better-sqlite3 を読み込めました"
    return 0
  fi

  log "❌ Node.js コンテキスト検証に失敗: $TEST_RESULT"
  return 1
}

verify_sqlite_with_electron() {
  log "Electron コンテキストで better-sqlite3 を検証中..."
  TEST_RESULT=$(desktop_electron_as_node_exec -e "try { require('better-sqlite3'); console.log('OK'); } catch (e) { console.error(e.message); process.exit(1); }" 2>&1 || true)

  if echo "$TEST_RESULT" | grep -q "OK"; then
    log "✅ Electron コンテキストで better-sqlite3 を読み込めました"
    return 0
  fi

  log "❌ Electron コンテキスト検証に失敗: $TEST_RESULT"
  return 1
}

rebuild_for_nodejs() {
  log "🔨 better-sqlite3 を Node.js 向けにリビルド中..."
  log "キャッシュをクリア中..."
  pnpm store prune 2>/dev/null || true

  if pnpm rebuild better-sqlite3; then
    log "✅ better-sqlite3のリビルド完了"
  else
    log "⚠️  リビルド失敗。フルインストールを試みます..."
    pnpm install --force
  fi

  check_sqlite_binary || true
  verify_sqlite_with_node
}

# --- Electron 向けリビルド ---
rebuild_for_electron() {
  log ""
  log "Electron 向けネイティブモジュールリビルド..."

  if desktop_exec electron --version >/dev/null 2>&1; then
    ELECTRON_VERSION=$(desktop_exec electron --version | sed 's/^v//')
    ELECTRON_ABI=$(desktop_electron_as_node_exec -p "process.versions.modules" 2>/dev/null)
    ELECTRON_ARCH=$(desktop_electron_as_node_exec -p "process.arch" 2>/dev/null)
    log "Electron バージョン: $ELECTRON_VERSION (ABI: $ELECTRON_ABI, arch: $ELECTRON_ARCH)"

    if verify_sqlite_with_electron; then
      log "✅ 既存の better-sqlite3 バイナリをそのまま使用します"
      return 0
    fi

    log "🔨 better-sqlite3 を Electron 向けにリビルド中..."
    desktop_exec electron-rebuild -f -w better-sqlite3 -m "$SHARED_WORKSPACE_DIR" -a "$ELECTRON_ARCH"
    log "✅ Electron 向けリビルド完了"
    check_sqlite_binary || true
    verify_sqlite_with_electron
  else
    log "Electron 未インストール。Node.js 向けビルドを維持します。"
    rebuild_for_nodejs
  fi
}

# --- esbuild リビルド ---
rebuild_esbuild() {
  log ""
  log "esbuild ネイティブバイナリを再構築中..."

  # esbuild は worktree / Rosetta 環境でバイナリ取り違えが起きやすい。
  # better-sqlite3 の判定結果に関係なく、postinstall 時に毎回再構築して current arch に寄せる。
  if pnpm rebuild esbuild; then
    log "✅ esbuild のリビルド完了"
  else
    log "⚠️  esbuild のリビルドに失敗。フルインストールを試みます..."
    pnpm install --force
  fi
}

# --- メイン処理 ---
main() {
  log "🔧 セットアップを開始..."
  check_architecture
  check_node_abi
  check_sqlite_binary || true
  rebuild_for_electron
  rebuild_esbuild
  log ""
  log "🎉 ネイティブモジュールのセットアップ完了"
}

main
