#!/bin/bash

# ============================================================
# ファイル監視システム セキュリティ監査スクリプト
#
# 使用方法:
#   ./security-audit.sh /path/to/watch/directory
#
# 機能:
#   1. シンボリックリンクの検出と検証
#   2. setuid/setgid ファイルの検出
#   3. world-writable ファイルの検出
#   4. 機密ファイルパターンの検出
#   5. ディレクトリ深度の分析
# ============================================================

set -euo pipefail

# カラー定義
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ログ関数
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_ok() { echo -e "${GREEN}[OK]${NC} $1"; }

# 使用方法
usage() {
    echo "Usage: $0 <directory>"
    echo ""
    echo "Options:"
    echo "  -h, --help     Show this help message"
    echo "  -v, --verbose  Verbose output"
    echo "  -q, --quiet    Only show issues (no OK messages)"
    echo ""
    echo "Example:"
    echo "  $0 /app/uploads"
    exit 1
}

# 引数チェック
if [[ $# -lt 1 ]] || [[ "$1" == "-h" ]] || [[ "$1" == "--help" ]]; then
    usage
fi

TARGET_DIR="$1"
VERBOSE=${VERBOSE:-false}
QUIET=${QUIET:-false}

# オプション解析
while [[ $# -gt 1 ]]; do
    case "$2" in
        -v|--verbose)
            VERBOSE=true
            shift
            ;;
        -q|--quiet)
            QUIET=true
            shift
            ;;
        *)
            shift
            ;;
    esac
done

# ディレクトリ存在チェック
if [[ ! -d "$TARGET_DIR" ]]; then
    log_error "Directory does not exist: $TARGET_DIR"
    exit 1
fi

echo "=============================================="
echo "Security Audit: $TARGET_DIR"
echo "Date: $(date -Iseconds)"
echo "=============================================="
echo ""

# 統計カウンター
ISSUES_CRITICAL=0
ISSUES_HIGH=0
ISSUES_MEDIUM=0
ISSUES_LOW=0

# ============================================================
# 1. シンボリックリンクの検出
# ============================================================

log_info "Checking for symbolic links..."

SYMLINKS=$(find "$TARGET_DIR" -type l 2>/dev/null || true)

if [[ -n "$SYMLINKS" ]]; then
    log_warn "Found symbolic links:"
    while IFS= read -r symlink; do
        target=$(readlink -f "$symlink" 2>/dev/null || echo "BROKEN")

        # ベースディレクトリ外を指しているかチェック
        if [[ "$target" == "BROKEN" ]]; then
            log_error "  $symlink -> BROKEN LINK"
            ((ISSUES_HIGH++))
        elif [[ ! "$target" == "$TARGET_DIR"* ]]; then
            log_error "  $symlink -> $target (OUTSIDE TARGET!)"
            ((ISSUES_CRITICAL++))
        else
            if [[ "$VERBOSE" == "true" ]]; then
                log_warn "  $symlink -> $target"
            fi
            ((ISSUES_MEDIUM++))
        fi
    done <<< "$SYMLINKS"
else
    [[ "$QUIET" != "true" ]] && log_ok "No symbolic links found"
fi

echo ""

# ============================================================
# 2. setuid/setgid ファイルの検出
# ============================================================

log_info "Checking for setuid/setgid files..."

SUID_FILES=$(find "$TARGET_DIR" -perm /6000 -type f 2>/dev/null || true)

if [[ -n "$SUID_FILES" ]]; then
    log_error "Found setuid/setgid files (CRITICAL SECURITY RISK):"
    while IFS= read -r file; do
        perms=$(stat -c '%a' "$file" 2>/dev/null || stat -f '%Lp' "$file" 2>/dev/null)
        log_error "  $file (mode: $perms)"
        ((ISSUES_CRITICAL++))
    done <<< "$SUID_FILES"
else
    [[ "$QUIET" != "true" ]] && log_ok "No setuid/setgid files found"
fi

echo ""

# ============================================================
# 3. world-writable ファイルの検出
# ============================================================

log_info "Checking for world-writable files..."

WORLD_WRITABLE=$(find "$TARGET_DIR" -perm -0002 -type f 2>/dev/null || true)

if [[ -n "$WORLD_WRITABLE" ]]; then
    log_warn "Found world-writable files:"
    count=0
    while IFS= read -r file; do
        if [[ $count -lt 10 ]] || [[ "$VERBOSE" == "true" ]]; then
            log_warn "  $file"
        fi
        ((count++))
        ((ISSUES_MEDIUM++))
    done <<< "$WORLD_WRITABLE"
    if [[ $count -gt 10 ]] && [[ "$VERBOSE" != "true" ]]; then
        log_warn "  ... and $((count - 10)) more (use -v to see all)"
    fi
else
    [[ "$QUIET" != "true" ]] && log_ok "No world-writable files found"
fi

echo ""

# ============================================================
# 4. 機密ファイルパターンの検出
# ============================================================

log_info "Checking for sensitive file patterns..."

# 機密ファイルパターン
SENSITIVE_PATTERNS=(
    "*.env"
    ".env.*"
    "*.pem"
    "*.key"
    "*id_rsa*"
    "*id_dsa*"
    "*id_ecdsa*"
    "*id_ed25519*"
    "credentials.*"
    "secrets.*"
    "*.sqlite"
    "*.sqlite3"
    "*.db"
    "*.bak"
    "*password*"
    "*secret*"
)

SENSITIVE_FOUND=false
for pattern in "${SENSITIVE_PATTERNS[@]}"; do
    matches=$(find "$TARGET_DIR" -name "$pattern" -type f 2>/dev/null || true)
    if [[ -n "$matches" ]]; then
        if [[ "$SENSITIVE_FOUND" == "false" ]]; then
            log_warn "Found potentially sensitive files:"
            SENSITIVE_FOUND=true
        fi
        while IFS= read -r file; do
            log_warn "  $file (pattern: $pattern)"
            ((ISSUES_HIGH++))
        done <<< "$matches"
    fi
done

if [[ "$SENSITIVE_FOUND" == "false" ]]; then
    [[ "$QUIET" != "true" ]] && log_ok "No obvious sensitive files found"
fi

echo ""

# ============================================================
# 5. .git ディレクトリの検出
# ============================================================

log_info "Checking for .git directories..."

GIT_DIRS=$(find "$TARGET_DIR" -name ".git" -type d 2>/dev/null || true)

if [[ -n "$GIT_DIRS" ]]; then
    log_warn "Found .git directories (potential information disclosure):"
    while IFS= read -r dir; do
        log_warn "  $dir"
        ((ISSUES_HIGH++))
    done <<< "$GIT_DIRS"
else
    [[ "$QUIET" != "true" ]] && log_ok "No .git directories found"
fi

echo ""

# ============================================================
# 6. ディレクトリ深度の分析
# ============================================================

log_info "Analyzing directory depth..."

MAX_DEPTH=20
DEEP_DIRS=$(find "$TARGET_DIR" -mindepth $MAX_DEPTH -type d 2>/dev/null | head -5 || true)

if [[ -n "$DEEP_DIRS" ]]; then
    log_warn "Found directories deeper than $MAX_DEPTH levels (potential DoS vector):"
    while IFS= read -r dir; do
        depth=$(echo "$dir" | tr -cd '/' | wc -c)
        log_warn "  $dir (depth: $depth)"
        ((ISSUES_LOW++))
    done <<< "$DEEP_DIRS"
else
    [[ "$QUIET" != "true" ]] && log_ok "No excessively deep directories found"
fi

echo ""

# ============================================================
# 7. 実行可能ファイルの検出
# ============================================================

log_info "Checking for executable files..."

EXECUTABLES=$(find "$TARGET_DIR" -type f -perm /111 2>/dev/null | head -20 || true)

if [[ -n "$EXECUTABLES" ]]; then
    count=$(find "$TARGET_DIR" -type f -perm /111 2>/dev/null | wc -l)
    log_warn "Found $count executable files:"
    while IFS= read -r file; do
        log_warn "  $file"
        ((ISSUES_MEDIUM++))
    done <<< "$EXECUTABLES"
    if [[ $count -gt 20 ]]; then
        log_warn "  ... and $((count - 20)) more"
    fi
else
    [[ "$QUIET" != "true" ]] && log_ok "No executable files found"
fi

echo ""

# ============================================================
# サマリー
# ============================================================

echo "=============================================="
echo "Audit Summary"
echo "=============================================="
echo ""

TOTAL_ISSUES=$((ISSUES_CRITICAL + ISSUES_HIGH + ISSUES_MEDIUM + ISSUES_LOW))

if [[ $ISSUES_CRITICAL -gt 0 ]]; then
    log_error "Critical issues: $ISSUES_CRITICAL"
fi
if [[ $ISSUES_HIGH -gt 0 ]]; then
    log_warn "High issues: $ISSUES_HIGH"
fi
if [[ $ISSUES_MEDIUM -gt 0 ]]; then
    log_warn "Medium issues: $ISSUES_MEDIUM"
fi
if [[ $ISSUES_LOW -gt 0 ]]; then
    log_info "Low issues: $ISSUES_LOW"
fi

echo ""

if [[ $TOTAL_ISSUES -eq 0 ]]; then
    log_ok "No security issues found!"
    exit 0
elif [[ $ISSUES_CRITICAL -gt 0 ]]; then
    log_error "CRITICAL: Immediate action required!"
    exit 2
elif [[ $ISSUES_HIGH -gt 0 ]]; then
    log_warn "HIGH: Review and remediate soon"
    exit 1
else
    log_info "MEDIUM/LOW: Review when convenient"
    exit 0
fi
