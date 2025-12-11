# スクリプトパターン集

## パターン1: 構造化スクリプト

```bash
#!/bin/bash
# スクリプトの基本構造

set -euo pipefail  # 厳密モード
IFS=$'\n\t'        # 区切り文字設定

# ===== 定数定義 =====
readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# ===== ログ関数 =====
log_info() {
  echo "[INFO] $*"
}

log_error() {
  echo "[ERROR] $*" >&2
}

# ===== エラーハンドリング =====
trap 'log_error "Error on line $LINENO"' ERR

# ===== メイン処理 =====
main() {
  log_info "Starting process"
  # 処理
  log_info "Process completed"
}

main "$@"
```

## パターン2: ビルド自動化

```bash
#!/bin/bash
# ビルド・テスト・デプロイの自動化

set -euo pipefail

colors() {
  RESET='\033[0m'
  GREEN='\033[0;32m'
  RED='\033[0;31m'
}

log_step() {
  echo -e "${GREEN}▶${RESET} $*"
}

log_error() {
  echo -e "${RED}✗${RESET} $*" >&2
}

main() {
  colors

  log_step "Cleaning previous builds..."
  rm -rf dist/ build/

  log_step "Installing dependencies..."
  pnpm install

  log_step "Running tests..."
  pnpm test || { log_error "Tests failed"; exit 1; }

  log_step "Building..."
  pnpm run build || { log_error "Build failed"; exit 1; }

  log_step "Verifying output..."
  [ -f "dist/index.js" ] || { log_error "Build output not found"; exit 1; }

  log_step "Build successful!"
}

main "$@"
```

## パターン3: 並列タスク実行

```bash
#!/bin/bash
# 複数の独立タスクを並列実行

set -euo pipefail

run_task() {
  local task_name=$1
  local task_cmd=$2

  echo "Starting $task_name..."
  eval "$task_cmd"
  echo "Completed $task_name"
}

main() {
  # バックグラウンドで実行
  run_task "Linting" "pnpm run lint" &
  LINT_PID=$!

  run_task "Type Check" "pnpm run type-check" &
  TYPE_PID=$!

  run_task "Tests" "pnpm test" &
  TEST_PID=$!

  # すべて完了待機
  wait $LINT_PID $TYPE_PID $TEST_PID

  echo "All tasks completed successfully"
}

main "$@"
```

## パターン4: 環境変数管理

```bash
#!/bin/bash
# 環境別設定管理

set -euo pipefail

load_env() {
  local env_file=$1

  if [ ! -f "$env_file" ]; then
    echo "Error: $env_file not found" >&2
    return 1
  fi

  # shellcheck disable=SC1090
  source "$env_file"
}

validate_env() {
  local required_vars=("DATABASE_URL" "API_KEY" "SECRET_TOKEN")

  for var in "${required_vars[@]}"; do
    if [ -z "${!var:-}" ]; then
      echo "Error: $var not set" >&2
      return 1
    fi
  done
}

main() {
  local env=${1:-.env}

  load_env "$env"
  validate_env

  echo "Environment validated: $env"
}

main "$@"
```

## パターン5: ファイル処理スクリプト

```bash
#!/bin/bash
# ファイルバッチ処理

set -euo pipefail

process_files() {
  local pattern=$1
  local processor=$2

  find . -type f -name "$pattern" | while read -r file; do
    echo "Processing: $file"
    $processor "$file"
  done
}

main() {
  # TypeScriptファイルをコンパイル
  process_files "*.ts" "tsc"

  # JSONファイルをバリデート
  process_files "*.json" "jq . > /dev/null"
}

main "$@"
```

## パターン6: Git操作スクリプト

```bash
#!/bin/bash
# Git自動化

set -euo pipefail

create_release_branch() {
  local version=$1
  local branch="release/$version"

  git checkout -b "$branch"
  git push origin "$branch"

  echo "Release branch created: $branch"
}

merge_and_tag() {
  local version=$1

  git tag -a "v$version" -m "Release $version"
  git push origin "v$version"

  echo "Tagged as v$version"
}

main() {
  local version=${1:-}

  [ -z "$version" ] && { echo "Usage: $0 <version>"; exit 1; }

  create_release_branch "$version"
  merge_and_tag "$version"
}

main "$@"
```

## パターン7: デプロイメント検証

```bash
#!/bin/bash
# デプロイ前の検証

set -euo pipefail

check_tests() {
  echo "Running tests..."
  pnpm test || return 1
}

check_build() {
  echo "Building..."
  pnpm run build || return 1
}

check_security() {
  echo "Security audit..."
  pnpm audit --production || return 1
}

check_version() {
  echo "Checking version..."
  grep -q "version" package.json || return 1
}

main() {
  local checks=(check_tests check_build check_security check_version)

  for check in "${checks[@]}"; do
    if ! $check; then
      echo "Check failed: $check" >&2
      return 1
    fi
  done

  echo "All pre-deployment checks passed"
}

main "$@"
```

## パターン8: ログローテーション

```bash
#!/bin/bash
# ログファイル管理

set -euo pipefail

rotate_logs() {
  local log_dir=$1
  local max_size=$2
  local max_files=$3

  find "$log_dir" -name "*.log" | while read -r log_file; do
    local size=$(stat -f%z "$log_file" 2>/dev/null || stat -c%s "$log_file")

    if [ "$size" -gt "$max_size" ]; then
      mv "$log_file" "${log_file}.$(date +%s)"
    fi
  done

  # 古いログを削除
  find "$log_dir" -name "*.log.*" -mtime +"$max_files" -delete
}

main() {
  rotate_logs "./logs" $((10 * 1024 * 1024)) 30
}

main "$@"
```

## ベストプラクティス

### エラーハンドリング

```bash
set -euo pipefail  # 常に使用
trap 'cleanup' EXIT  # リソース解放
trap 'echo "Error"' ERR  # エラー通知
```

### ログ出力

```bash
log_info() { echo "[INFO] $*"; }
log_warn() { echo "[WARN] $*" >&2; }
log_error() { echo "[ERROR] $*" >&2; }
```

### 関数設計

```bash
# 再利用可能な関数
function my_function() {
  local arg1=$1
  local arg2=${2:-default}

  # 処理
}

# 内部関数はアンダースコアで
function _private_helper() {
  # 処理
}
```

### テスト可能性

```bash
# スクリプト本体と関数を分離
main() { # テスト対象
  # 処理
}

# コマンドラインから実行
main "$@"
```
