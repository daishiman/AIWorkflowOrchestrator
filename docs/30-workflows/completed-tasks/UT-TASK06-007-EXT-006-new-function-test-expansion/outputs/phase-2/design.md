# Phase 2: 設計 - UT-TASK06-007-EXT-006

## 実施日

2026-03-21

## export変更設計（5箇所）

| 行番号 | 変更前                               | 変更後                                      |
| ------ | ------------------------------------ | ------------------------------------------- |
| L53    | `const CHANNEL_OBJECT_PATTERN`       | `export const CHANNEL_OBJECT_PATTERN`       |
| L56    | `const PRELOAD_CALL_START_PATTERN`   | `export const PRELOAD_CALL_START_PATTERN`   |
| L67    | `function normalizeTypeAnnotation`   | `export function normalizeTypeAnnotation`   |
| L75    | `function isPrimitiveTypeAnnotation` | `export function isPrimitiveTypeAnnotation` |
| L270   | `function mergeChannelMaps`          | `export function mergeChannelMaps`          |

## import変更設計

```typescript
import {
  extractMainHandlers,
  extractPreloadEntries,
  resolveChannelMap,
  matchAndValidate,
  generateReport,
  main,
  normalizeTypeAnnotation,
  isPrimitiveTypeAnnotation,
  mergeChannelMaps,
  CHANNEL_OBJECT_PATTERN,
  PRELOAD_CALL_START_PATTERN,
  type HandlerEntry,
  type PreloadEntry,
  type DriftReport,
} from "../check-ipc-contracts";
```

一時ファイルテスト用:

```typescript
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
```

## テスト構造設計

```
既存テスト末尾に4ブロック追加:
├── describe("normalizeTypeAnnotation")              // 5件
├── describe("isPrimitiveTypeAnnotation")            // 6件
├── describe("mergeChannelMaps")                     // 4件
└── describe("CHANNEL_OBJECT_PATTERN / PRELOAD_CALL_START_PATTERN")  // 5件
```

## fsモック戦略

一時ファイル方式（`os.tmpdir()`）を採用。vi.mockのESM配置制約を完全に回避し、実際のファイルI/Oで信頼性を確保する。

## 正規表現パターンのlastIndex対策

`CHANNEL_OBJECT_PATTERN` は `/gm` フラグ付きのため、テストごとに `new RegExp(CHANNEL_OBJECT_PATTERN.source, "gm")` で新インスタンスを生成する。

## 完了条件チェック

- [x] export変更箇所（5箇所）が特定されている
- [x] import変更内容が設計されている
- [x] 4つのdescribeブロック構造が設計されている
- [x] mergeChannelMapsのfsモック戦略が決定されている（一時ファイル方式）
- [x] 正規表現パターンのlastIndex対策が設計されている
- [x] 本Phase内の全タスクを100%実行完了
