# Phase 12: Implementation Guide

**Task**: TASK-3-1-E rememberChoice機能永続化
**Date**: 2026-01-26
**Status**: COMPLETED

## Overview

This guide explains how to use and extend the rememberChoice persistence feature.

## Quick Start

### Checking if a Tool is Allowed

```typescript
import { PermissionStore } from "./services/skill";

const permissionStore = new PermissionStore();

// O(1) check
if (permissionStore.isToolAllowed("Bash")) {
  // Tool is pre-approved, skip permission dialog
} else {
  // Show permission dialog
}
```

### Saving a Permission

```typescript
// When user clicks "Allow" with "Remember this choice" checked
if (approved && rememberChoice) {
  permissionStore.allowTool(toolName);
}
```

### Revoking a Permission

```typescript
// From Settings UI
permissionStore.revokeTool(toolName);
```

## Architecture

### Data Flow

```
┌─────────────────┐
│  Skill Request  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌─────────────────┐
│ isToolAllowed() │────▶│  In-Memory Map  │
└────────┬────────┘     └─────────────────┘
         │
    ┌────┴────┐
    │ Allowed │
    └────┬────┘
    ┌────▼────┐    ┌────▼────┐
    │  Yes    │    │   No    │
    └────┬────┘    └────┬────┘
         │              │
         ▼              ▼
    ┌─────────┐    ┌─────────────┐
    │ Execute │    │ Show Dialog │
    └─────────┘    └──────┬──────┘
                         │
                    ┌────▼────┐
                    │ Approve │
                    └────┬────┘
                         │
              ┌──────────┼──────────┐
              │                     │
    ┌─────────▼─────────┐   ┌──────▼──────┐
    │ Remember=true     │   │ Remember=   │
    │ → allowTool()     │   │ false       │
    └─────────┬─────────┘   └─────────────┘
              │
              ▼
    ┌─────────────────┐
    │ electron-store  │
    │ permission-     │
    │ store.json      │
    └─────────────────┘
```

### File Locations

| Component | Path                                                                |
| --------- | ------------------------------------------------------------------- |
| Types     | `packages/shared/src/types/permission-store.ts`                     |
| Store     | `apps/desktop/src/main/services/skill/PermissionStore.ts`           |
| Handlers  | `apps/desktop/src/main/ipc/permission-handlers.ts`                  |
| Preload   | `apps/desktop/src/preload/index.ts`                                 |
| UI        | `apps/desktop/src/renderer/components/settings/PermissionSettings/` |

## API Reference

### IPermissionStore Interface

```typescript
interface IPermissionStore {
  // Check if tool is allowed (O(1))
  isToolAllowed(toolName: string): boolean;

  // Add tool to allowed list
  allowTool(toolName: string): void;

  // Remove tool from allowed list
  revokeTool(toolName: string): void;

  // Get all allowed tool names
  getAllowedTools(): string[];

  // Get all allowed tools with timestamps
  getAllowedToolEntries(): AllowedToolEntry[];

  // Clear all permissions
  clearAll(): void;
}
```

### AllowedToolEntry Type

```typescript
interface AllowedToolEntry {
  toolName: string; // Tool identifier
  allowedAt: string; // ISO 8601 timestamp
}
```

### IPC Channels

| Channel                      | Method | Parameters             | Response                                     |
| ---------------------------- | ------ | ---------------------- | -------------------------------------------- |
| `permission:getAllowedTools` | GET    | -                      | `{ tools: AllowedToolEntry[] }`              |
| `permission:revokeTool`      | POST   | `{ toolName: string }` | `{ success: boolean }`                       |
| `permission:clearAll`        | POST   | -                      | `{ success: boolean, clearedCount: number }` |

## Extending the Feature

### Adding New Permission Types

1. Update `AllowedToolEntry` in `permission-store.ts`:

```typescript
interface AllowedToolEntry {
  toolName: string;
  allowedAt: string;
  permissionLevel?: "read" | "write" | "execute"; // New field
}
```

2. Update `PermissionStoreSchema` version:

```typescript
const DEFAULT_SCHEMA: PermissionStoreSchema = {
  version: 2,  // Increment version
  ...
};
```

3. Add migration logic in `initializeCache()`.

### Adding Expiration

```typescript
// In isToolAllowed()
const entry = this.toolCache.get(toolName);
if (!entry) return false;

const allowedDate = new Date(entry.allowedAt);
const expirationMs = 30 * 24 * 60 * 60 * 1000; // 30 days
if (Date.now() - allowedDate.getTime() > expirationMs) {
  this.revokeTool(toolName);
  return false;
}
return true;
```

## Storage Format

**File**: `~/.config/@repo-desktop/permission-store.json`

```json
{
  "version": 1,
  "allowedTools": [
    {
      "toolName": "Bash",
      "allowedAt": "2026-01-26T10:00:00.000Z"
    },
    {
      "toolName": "Read",
      "allowedAt": "2026-01-26T10:30:00.000Z"
    }
  ],
  "updatedAt": "2026-01-26T10:30:00.000Z"
}
```

## Testing

### Unit Tests

```bash
pnpm vitest run src/main/services/skill/__tests__/PermissionStore.test.ts
```

### Integration Tests

```bash
pnpm vitest run src/main/services/skill/__tests__/PermissionStore.integration.test.ts
```

### UI Tests

```bash
pnpm vitest run src/renderer/components/settings/PermissionSettings
```

### All Permission Tests

```bash
pnpm vitest run Permission
```

## Troubleshooting

### Permissions Not Persisting

1. Check if electron-store is writing to disk:

   ```bash
   cat ~/.config/@repo-desktop/permission-store.json
   ```

2. Check for write errors in console:
   ```
   [PermissionStore] Failed to save store: ...
   ```

### Tool Always Asks for Permission

1. Verify tool name matches exactly (case-sensitive)
2. Check if `rememberChoice` is being passed correctly
3. Look for schema validation errors in logs

### Settings UI Not Showing Tools

1. Verify IPC handlers are registered:

   ```
   [PermissionHandlers] Registered 3 permission IPC handlers
   ```

2. Check browser console for API errors

## Conclusion

The rememberChoice persistence feature is now fully documented and ready for use. For questions or issues, refer to the test files for usage examples.
