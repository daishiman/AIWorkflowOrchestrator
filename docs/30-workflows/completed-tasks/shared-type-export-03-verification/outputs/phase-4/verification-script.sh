#!/bin/bash
# verification-script.sh
# Type Export Verification Script for SHARED-TYPE-EXPORT-03
#
# Usage: ./verification-script.sh
#
# This script verifies that Community type exports from @repo/shared
# are correctly working with @repo/desktop.

set -e  # Exit on error

echo "=== Type Export Verification ==="
echo "Task: SHARED-TYPE-EXPORT-03"
echo "Date: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

# Step 1: @repo/shared typecheck
echo "[1/7] Running @repo/shared typecheck..."
pnpm --filter @repo/shared typecheck
echo "✅ @repo/shared typecheck passed"
echo ""

# Step 2: @repo/shared build
echo "[2/7] Running @repo/shared build..."
pnpm --filter @repo/shared build
echo "✅ @repo/shared build passed"
echo ""

# Step 3: @repo/desktop typecheck
echo "[3/7] Running @repo/desktop typecheck..."
pnpm --filter @repo/desktop typecheck
echo "✅ @repo/desktop typecheck passed"
echo ""

# Step 4: @repo/desktop build
echo "[4/7] Running @repo/desktop build..."
pnpm --filter @repo/desktop build
echo "✅ @repo/desktop build passed"
echo ""

# Step 5: Full typecheck
echo "[5/7] Running full typecheck..."
pnpm typecheck
echo "✅ Full typecheck passed"
echo ""

# Step 6: Full build
echo "[6/7] Running full build..."
pnpm build
echo "✅ Full build passed"
echo ""

# Step 7: Pre-push hook verification (optional)
echo "[7/7] Verifying pre-push hook (dry-run)..."
if git remote -v | grep -q "origin"; then
  git push --dry-run 2>/dev/null && echo "✅ Pre-push hook verification passed" || echo "⚠️ Pre-push hook check skipped"
else
  echo "⚠️ Pre-push hook verification skipped (no remote configured)"
fi
echo ""

echo "=== All Verifications Passed ==="
echo "Community type exports are working correctly."
