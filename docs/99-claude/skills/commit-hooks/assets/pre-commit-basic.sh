#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# Run lint-staged for automatic linting and formatting
pnpm lint-staged
