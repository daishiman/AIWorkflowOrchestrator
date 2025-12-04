#!/bin/bash

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Electronデスクトップアプリ開発環境 自動セットアップスクリプト
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

set -e  # エラー時に即座に終了
set -u  # 未定義変数の使用を禁止
set -o pipefail  # パイプライン内のエラーを検出

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 定数定義
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
readonly LOG_DIR="$PROJECT_ROOT/logs"
readonly LOG_FILE="$LOG_DIR/setup-$(date +%Y%m%d-%H%M%S).log"
readonly STATE_FILE="$PROJECT_ROOT/.setup-state.json"

readonly NODE_VERSION="22"
readonly PNPM_VERSION="10"
readonly TOTAL_STEPS=8

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 色定義
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly NC='\033[0m' # No Color

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# ログ関数
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

init_log_file() {
  mkdir -p "$LOG_DIR"
  echo "=== Setup Log Started at $(date) ===" > "$LOG_FILE"
}

log_info() {
  echo -e "${BLUE}ℹ${NC} $1"
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] [INFO] $1" >> "$LOG_FILE"
}

log_success() {
  echo -e "${GREEN}✅${NC} $1"
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] [SUCCESS] $1" >> "$LOG_FILE"
}

log_warn() {
  echo -e "${YELLOW}⚠${NC} $1"
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] [WARN] $1" >> "$LOG_FILE"
}

log_error() {
  echo -e "${RED}❌${NC} $1"
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] [ERROR] $1" >> "$LOG_FILE"
}

print_header() {
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "$1"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
}

print_progress() {
  local current=$1
  local total=$2
  local message=$3
  echo -e "${BLUE}[$current/$total]${NC} $message"
}

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# バリデーション関数
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

validate_platform() {
  local platform=$(uname -s)
  if [[ "$platform" != "Darwin" ]]; then
    log_error "このスクリプトはmacOS専用です（検出: $platform）"
    log_info "Windows版は setup-dev-environment.ps1 を使用してください"
    return 1
  fi
  log_success "プラットフォーム検出: macOS"
  return 0
}

validate_disk_space() {
  local required_gb=$1
  local available=$(df -g . | awk 'NR==2 {print $4}')

  if [[ $available -lt $required_gb ]]; then
    log_error "ディスク容量不足: ${available}GB（必要: ${required_gb}GB）"
    return 1
  fi

  log_success "ディスク容量: ${available}GB（十分）"
  return 0
}

check_command_exists() {
  command -v "$1" &> /dev/null
}

get_command_version() {
  local cmd=$1
  local version_flag=${2:---version}
  $cmd $version_flag 2>&1 | head -n 1
}

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# インストール関数
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

install_homebrew() {
  log_info "Homebrewをインストールしています..."

  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

  if check_command_exists "brew"; then
    log_success "Homebrewのインストールが完了しました"
    return 0
  else
    log_error "Homebrewのインストールに失敗しました"
    return 1
  fi
}

install_nodejs() {
  log_info "Node.js ${NODE_VERSION}.x LTS をインストールしています..."

  brew install "node@${NODE_VERSION}"

  if check_command_exists "node"; then
    local version=$(node --version)
    log_success "Node.js ${version} のインストールが完了しました"
    return 0
  else
    log_error "Node.jsのインストールに失敗しました"
    return 1
  fi
}

enable_pnpm() {
  log_info "pnpmを有効化しています..."

  corepack enable
  corepack prepare pnpm@latest --activate

  if check_command_exists "pnpm"; then
    local version=$(pnpm --version)
    log_success "pnpm ${version} の有効化が完了しました"
    return 0
  else
    log_error "pnpmの有効化に失敗しました"
    return 1
  fi
}

install_xcode_clt() {
  log_info "Xcode Command Line Tools をインストールしています..."
  log_warn "ダウンロードに5-15分かかる場合があります"

  xcode-select --install 2>/dev/null || true

  # インストール完了まで待機
  log_info "インストールが完了するまで待機しています..."

  while ! xcode-select -p &> /dev/null; do
    sleep 5
  done

  log_success "Xcode Command Line Tools のインストールが完了しました"
  return 0
}

install_project_deps() {
  log_info "プロジェクト依存関係をインストールしています..."

  cd "$PROJECT_ROOT"
  pnpm install --frozen-lockfile

  if [[ -d "$PROJECT_ROOT/node_modules" ]]; then
    log_success "依存関係のインストールが完了しました"
    return 0
  else
    log_error "依存関係のインストールに失敗しました"
    return 1
  fi
}

rebuild_native_modules() {
  log_info "ネイティブモジュールを再ビルドしています..."

  cd "$PROJECT_ROOT"
  pnpm exec electron-rebuild

  log_success "ネイティブモジュールの再ビルドが完了しました"
  return 0
}

verify_setup() {
  log_info "環境構築の検証を実行しています..."

  node "$SCRIPT_DIR/verify-dependencies.mjs"

  if [[ $? -eq 0 ]]; then
    log_success "環境構築の検証が成功しました"
    return 0
  else
    log_error "環境構築の検証に失敗しました"
    return 1
  fi
}

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# メイン処理
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

main() {
  # ログ初期化
  init_log_file

  # ヘッダー表示
  print_header "Electronデスクトップアプリ環境構築"

  log_info "セットアップを開始します..."
  log_info "ログファイル: $LOG_FILE"

  # 事前チェック
  validate_platform || exit 1
  validate_disk_space 10 || exit 1

  local step=0

  # Step 1: Homebrew
  ((step++))
  print_progress $step $TOTAL_STEPS "Homebrewインストール"
  if ! check_command_exists "brew"; then
    install_homebrew || exit 1
  else
    log_success "Homebrew は既にインストールされています"
  fi

  # Step 2: Node.js
  ((step++))
  print_progress $step $TOTAL_STEPS "Node.jsインストール"
  if ! check_command_exists "node"; then
    install_nodejs || exit 1
  else
    local version=$(node --version)
    if [[ ! $version =~ ^v(22|24)\. ]]; then
      log_warn "Node.js ${version} はバージョン要件を満たしていません"
      install_nodejs || exit 1
    else
      log_success "Node.js ${version} は既にインストールされています"
    fi
  fi

  # Step 3: pnpm
  ((step++))
  print_progress $step $TOTAL_STEPS "pnpm有効化"
  if ! check_command_exists "pnpm"; then
    enable_pnpm || exit 1
  else
    local version=$(pnpm --version)
    log_success "pnpm ${version} は既にインストールされています"
  fi

  # Step 4: Xcode Command Line Tools
  ((step++))
  print_progress $step $TOTAL_STEPS "Xcode Command Line Tools確認"
  if ! xcode-select -p &> /dev/null; then
    install_xcode_clt || exit 1
  else
    log_success "Xcode Command Line Tools は既にインストールされています"
  fi

  # Step 5: プロジェクト依存関係
  ((step++))
  print_progress $step $TOTAL_STEPS "プロジェクト依存関係インストール"
  install_project_deps || exit 1

  # Step 6: ネイティブモジュール再ビルド
  ((step++))
  print_progress $step $TOTAL_STEPS "ネイティブモジュール再ビルド"
  rebuild_native_modules || exit 1

  # Step 7: 環境検証
  ((step++))
  print_progress $step $TOTAL_STEPS "環境検証"
  verify_setup || exit 1

  # Step 8: 完了
  ((step++))
  print_progress $step $TOTAL_STEPS "完了"

  # 成功メッセージ
  echo ""
  print_header "環境構築が完了しました！"
  log_success "所要時間: $SECONDS 秒"
  echo ""
  log_info "次のコマンドで開発を開始できます:"
  echo ""
  echo "  cd $PROJECT_ROOT"
  echo "  pnpm dev"
  echo ""
  log_info "詳細ログ: $LOG_FILE"
}

# スクリプト実行
main "$@"
