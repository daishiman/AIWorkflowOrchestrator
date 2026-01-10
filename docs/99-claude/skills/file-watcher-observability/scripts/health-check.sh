#!/bin/bash

# ============================================================
# ファイル監視システム ヘルスチェックスクリプト
#
# 使用方法:
#   ./health-check.sh [metrics_url]
#
# デフォルト:
#   metrics_url = http://localhost:9090
#
# 戻り値:
#   0 = 健全
#   1 = 警告（しきい値超過）
#   2 = 異常（サービス停止または重大な問題）
# ============================================================

set -euo pipefail

# デフォルト設定
METRICS_URL="${1:-http://localhost:9090}"
HEALTH_ENDPOINT="${METRICS_URL}/health"
STATS_ENDPOINT="${METRICS_URL}/stats"

# しきい値設定
LATENCY_WARN_MS=500
LATENCY_CRIT_MS=2000
QUEUE_WARN=5000
QUEUE_CRIT=10000
MEMORY_WARN_PERCENT=80
MEMORY_CRIT_PERCENT=95
ERROR_RATE_WARN=10
ERROR_RATE_CRIT=50

# カラー定義
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m'

# ログ関数
log_ok() { echo -e "${GREEN}[OK]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_crit() { echo -e "${RED}[CRIT]${NC} $1"; }
log_info() { echo "[INFO] $1"; }

# 結果追跡
EXIT_CODE=0

check_warn() {
    if [[ $EXIT_CODE -lt 1 ]]; then
        EXIT_CODE=1
    fi
}

check_crit() {
    EXIT_CODE=2
}

# ============================================================
# ヘルスエンドポイントチェック
# ============================================================

log_info "Checking health endpoint: $HEALTH_ENDPOINT"

HEALTH_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$HEALTH_ENDPOINT" 2>/dev/null || echo "000")

if [[ "$HEALTH_RESPONSE" == "200" ]]; then
    log_ok "Health endpoint responding"
else
    log_crit "Health endpoint not responding (HTTP $HEALTH_RESPONSE)"
    check_crit
    exit $EXIT_CODE
fi

# ============================================================
# 統計データ取得
# ============================================================

log_info "Fetching statistics from: $STATS_ENDPOINT"

STATS=$(curl -s "$STATS_ENDPOINT" 2>/dev/null)

if [[ -z "$STATS" ]]; then
    log_crit "Failed to fetch statistics"
    check_crit
    exit $EXIT_CODE
fi

# JSON解析（jqが必要）
if ! command -v jq &> /dev/null; then
    log_warn "jq not installed, skipping detailed checks"
    log_ok "Basic health check passed"
    exit 0
fi

# ============================================================
# レイテンシチェック
# ============================================================

log_info "Checking latency..."

P99_LATENCY=$(echo "$STATS" | jq -r '.latency.p99_seconds // 0')
P99_LATENCY_MS=$(echo "$P99_LATENCY * 1000" | bc 2>/dev/null || echo "0")

if (( $(echo "$P99_LATENCY_MS > $LATENCY_CRIT_MS" | bc -l 2>/dev/null || echo "0") )); then
    log_crit "P99 latency: ${P99_LATENCY_MS}ms (threshold: ${LATENCY_CRIT_MS}ms)"
    check_crit
elif (( $(echo "$P99_LATENCY_MS > $LATENCY_WARN_MS" | bc -l 2>/dev/null || echo "0") )); then
    log_warn "P99 latency: ${P99_LATENCY_MS}ms (threshold: ${LATENCY_WARN_MS}ms)"
    check_warn
else
    log_ok "P99 latency: ${P99_LATENCY_MS}ms"
fi

# ============================================================
# キューサイズチェック
# ============================================================

log_info "Checking queue size..."

QUEUE_SIZE=$(echo "$STATS" | jq -r '.queue.size // 0')

if (( QUEUE_SIZE > QUEUE_CRIT )); then
    log_crit "Queue size: $QUEUE_SIZE (threshold: $QUEUE_CRIT)"
    check_crit
elif (( QUEUE_SIZE > QUEUE_WARN )); then
    log_warn "Queue size: $QUEUE_SIZE (threshold: $QUEUE_WARN)"
    check_warn
else
    log_ok "Queue size: $QUEUE_SIZE"
fi

# ============================================================
# メモリ使用量チェック
# ============================================================

log_info "Checking memory usage..."

HEAP_USED=$(echo "$STATS" | jq -r '.memory.heap_used_bytes // 0')
HEAP_TOTAL=$(echo "$STATS" | jq -r '.memory.heap_total_bytes // 1')

if [[ "$HEAP_TOTAL" != "0" ]] && [[ "$HEAP_TOTAL" != "1" ]]; then
    MEMORY_PERCENT=$(echo "scale=2; $HEAP_USED * 100 / $HEAP_TOTAL" | bc 2>/dev/null || echo "0")
    MEMORY_PERCENT_INT=$(echo "$MEMORY_PERCENT" | cut -d. -f1)

    if (( MEMORY_PERCENT_INT > MEMORY_CRIT_PERCENT )); then
        log_crit "Memory usage: ${MEMORY_PERCENT}% (threshold: ${MEMORY_CRIT_PERCENT}%)"
        check_crit
    elif (( MEMORY_PERCENT_INT > MEMORY_WARN_PERCENT )); then
        log_warn "Memory usage: ${MEMORY_PERCENT}% (threshold: ${MEMORY_WARN_PERCENT}%)"
        check_warn
    else
        log_ok "Memory usage: ${MEMORY_PERCENT}%"
    fi
else
    log_warn "Could not calculate memory usage"
fi

# ============================================================
# アクティブウォッチャーチェック
# ============================================================

log_info "Checking active watchers..."

ACTIVE_WATCHERS=$(echo "$STATS" | jq -r '.watchers.active // 0')

if (( ACTIVE_WATCHERS == 0 )); then
    log_warn "No active watchers"
    check_warn
else
    log_ok "Active watchers: $ACTIVE_WATCHERS"
fi

# ============================================================
# イベントレートチェック
# ============================================================

log_info "Checking event rate..."

EVENT_RATE=$(echo "$STATS" | jq -r '.events.rate_per_sec // 0')
EVENT_RATE_INT=$(echo "$EVENT_RATE" | cut -d. -f1)

log_ok "Event rate: ${EVENT_RATE}/sec"

# ============================================================
# アップタイムチェック
# ============================================================

log_info "Checking uptime..."

UPTIME=$(echo "$STATS" | jq -r '.uptime_seconds // 0')
UPTIME_INT=$(echo "$UPTIME" | cut -d. -f1)

if (( UPTIME_INT < 60 )); then
    log_warn "Uptime: ${UPTIME_INT}s (recently started)"
else
    UPTIME_HUMAN=""
    if (( UPTIME_INT >= 86400 )); then
        DAYS=$((UPTIME_INT / 86400))
        UPTIME_HUMAN="${DAYS}d "
        UPTIME_INT=$((UPTIME_INT % 86400))
    fi
    if (( UPTIME_INT >= 3600 )); then
        HOURS=$((UPTIME_INT / 3600))
        UPTIME_HUMAN="${UPTIME_HUMAN}${HOURS}h "
        UPTIME_INT=$((UPTIME_INT % 3600))
    fi
    MINS=$((UPTIME_INT / 60))
    UPTIME_HUMAN="${UPTIME_HUMAN}${MINS}m"
    log_ok "Uptime: $UPTIME_HUMAN"
fi

# ============================================================
# サマリー
# ============================================================

echo ""
echo "=============================================="
echo "Health Check Summary"
echo "=============================================="

case $EXIT_CODE in
    0)
        log_ok "All checks passed"
        ;;
    1)
        log_warn "Some checks have warnings"
        ;;
    2)
        log_crit "Critical issues detected"
        ;;
esac

echo ""
exit $EXIT_CODE
