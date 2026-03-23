# UT-CONV-DB-001: Implementation Guide

## Part 1: Concept (for beginners)

### What is a "native module rebuild"?

Imagine you have a LEGO set designed for a specific table size. If you move to a different table (different CPU architecture), the same LEGO pieces might not fit properly. You need to rebuild them for the new table.

In programming:

- **better-sqlite3** is a database library that includes compiled C++ code (a `.node` binary file)
- This binary must match your computer's CPU architecture (arm64 vs x86_64) and Node.js version
- When they don't match, the library fails to load, and 75 database tests get skipped silently

### What we fixed

We added a `rebuild:native` script to `package.json` so anyone can fix this with one command:

```bash
cd apps/desktop
pnpm run rebuild:native
```

## Part 2: Technical Details

### Changes Made

| File                        | Change                        | Purpose                                       |
| --------------------------- | ----------------------------- | --------------------------------------------- |
| `apps/desktop/package.json` | Added `rebuild:native` script | Persistent rebuild command for native modules |

### The Script

```json
"rebuild:native": "pnpm rebuild better-sqlite3 && pnpm rebuild esbuild"
```

- **better-sqlite3**: SQLite database driver with native C++ bindings. Required for `conversationRepository.test.ts` (75 tests)
- **esbuild**: JavaScript bundler with native bindings. Required for Vitest test runner

### When to Use

| Scenario                                        | Action                                    |
| ----------------------------------------------- | ----------------------------------------- |
| New worktree created                            | Run `pnpm run rebuild:native`             |
| Node.js version updated                         | Run `pnpm run rebuild:native`             |
| Tests show 75 skipped in conversationRepository | Run `pnpm run rebuild:native`             |
| CI environment with architecture mismatch       | Add `pnpm run rebuild:native` to CI setup |

### Verification

```bash
# 1. Check binary exists and matches architecture
file node_modules/better-sqlite3/build/Release/better_sqlite3.node
# Expected: Mach-O 64-bit bundle arm64 (or x86_64 under Rosetta)

# 2. Load test
node -e "const s = require('better-sqlite3'); new s(':memory:').close(); console.log('OK')"

# 3. Run tests
pnpm vitest run src/main/repositories/__tests__/conversationRepository.test.ts
# Expected: 75 passed (75)
```

### Test Results

- conversationRepository.test.ts: **75 passed** (4.28s)
- conversationHandlers.test.ts: **43 passed**
- register-conversation-handlers.test.ts: **22 passed**
- conversationDatabase.test.ts: **20 passed**
- Total conversation-related: **160 passed, 0 failed**

### Related Known Pitfalls

- **P7**: Native module binary mismatch after Node.js version update
- **P66**: CPU architecture mismatch (arm64 vs x86_64) - variant of P7
