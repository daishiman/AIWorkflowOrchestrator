# Phase 2: 設計 - 新関数テスト拡充

## メタ情報

| 項目    | 値                                                 |
| ------- | -------------------------------------------------- |
| Phase   | 2                                                  |
| 機能名  | UT-TASK06-007-EXT-006-new-function-test-expansion  |
| 作成日  | 2026-03-21                                         |
| 前Phase | [phase-1-requirements.md](phase-1-requirements.md) |

## 目的

Phase 1で定義した20件のテスト要件に対し、テスト構造（describeブロック配置、import変更、fsモック戦略）を設計する。

## 実行タスク

- テスト構造設計: describeブロックの階層とテストケースの配置を設計
- import変更設計: 新export関数のimport追加を設計
- fsモック戦略設計: mergeChannelMapsのfsモック方式を決定
- export変更設計: check-ipc-contracts.tsへのexport追加箇所を特定

## 参照資料

| 資料名         | パス                                                                                       | 説明             |
| -------------- | ------------------------------------------------------------------------------------------ | ---------------- |
| Phase 1成果物  | [phase-1-requirements.md](phase-1-requirements.md)                                         | テスト要件定義   |
| 既存テスト     | `apps/desktop/scripts/__tests__/check-ipc-contracts.test.ts`                               | テスト構造の参考 |
| 対象スクリプト | `apps/desktop/scripts/check-ipc-contracts.ts`                                              | export追加対象   |
| 苦戦箇所記録   | `.claude/skills/aiworkflow-requirements/references/lessons-learned-ipc-preload-runtime.md` | vi.mock制約      |
| 要件定義書     | `outputs/phase-1/requirements.md`                                                          | Phase 1 成果物   |

## 実行手順

### ステップ1: export変更設計

`check-ipc-contracts.ts` に以下5つのexportを追加する（ロジック変更なし）:

```typescript
// L53: const → export const
export const CHANNEL_OBJECT_PATTERN = ...

// L56: const → export const
export const PRELOAD_CALL_START_PATTERN = ...

// L68: function → export function
export function normalizeTypeAnnotation(typeAnnotation: string): string { ... }

// L76: function → export function
export function isPrimitiveTypeAnnotation(typeAnnotation: string): boolean { ... }

// L271: function → export function
export function mergeChannelMaps(filePaths: string[]): Map<string, string> { ... }
```

### ステップ2: import変更設計

`check-ipc-contracts.test.ts` のimportブロックに以下を追加:

```typescript
import {
  extractMainHandlers,
  extractPreloadEntries,
  resolveChannelMap,
  matchAndValidate,
  generateReport,
  main,
  // --- 新規追加 ---
  normalizeTypeAnnotation,
  isPrimitiveTypeAnnotation,
  mergeChannelMaps,
  CHANNEL_OBJECT_PATTERN,
  PRELOAD_CALL_START_PATTERN,
  // --- ここまで ---
  type HandlerEntry,
  type PreloadEntry,
  type DriftReport,
} from "../check-ipc-contracts";
```

### ステップ3: テスト構造設計

既存テストの末尾に4つのdescribeブロックを追加する:

```
既存テスト構造:
├── describe("extractMainHandlers")     // T-4-1 (5件)
├── describe("extractPreloadEntries")   // T-4-2 (5件)
├── describe("resolveChannelMap")       // T-4-3 (5件)
├── describe("matchAndValidate")        // T-4-4 (8件)
├── describe("generateReport")          // T-4-5 (4件)
├── describe("main()")                  // T-4-6 (22件)
│
│ ← 以下を追加
│
├── describe("normalizeTypeAnnotation")              // 5件
├── describe("isPrimitiveTypeAnnotation")            // 6件
├── describe("mergeChannelMaps")                     // 4件
└── describe("CHANNEL_OBJECT_PATTERN / PRELOAD_CALL_START_PATTERN")  // 5件
```

### ステップ4: mergeChannelMaps の fsモック戦略

**苦戦箇所 4.1（vi.mock制約）の回避策:**

`mergeChannelMaps` は内部で `fs.readFileSync` を呼び出すが、ESMモジュールの `vi.mock("fs")` はトップレベルで宣言する必要がある。既存テストでは `main()` テスト用に `vi.mock("fs")` が既にトップレベルで宣言されている可能性がある。

**設計方針:** 一時ディレクトリを `mkdtempSync(join(tmpdir(), "ipc-test-"))` で作成し、実際の fs を使ってテストする。

```typescript
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

describe("mergeChannelMaps", () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = mkdtempSync(join(tmpdir(), "ipc-test-"));
  });

  afterEach(() => {
    rmSync(tmpDir, { recursive: true, force: true });
  });

  // テストケースで tmpDir にファイルを作成して mergeChannelMaps に渡す
});
```

理由:

1. vi.mockの配置制約（苦戦箇所4.1）を完全に回避
2. 実際のファイルI/Oを使うため、テストの信頼性が高い
3. `tmpdir()` 配下の一時ディレクトリでテスト間の干渉を防止

### ステップ5: 正規表現パターンのテスト設計

`CHANNEL_OBJECT_PATTERN` と `PRELOAD_CALL_START_PATTERN` はRegExpオブジェクトなので、`.test()` と `.exec()` で直接テスト:

```typescript
describe("CHANNEL_OBJECT_PATTERN / PRELOAD_CALL_START_PATTERN", () => {
  // CHANNEL_OBJECT_PATTERN は gm フラグ付きなので、テストごとに lastIndex をリセット
  // または new RegExp(CHANNEL_OBJECT_PATTERN.source, "gm") で新しいインスタンスを使う

  it("T-R-01: 基本的なas constオブジェクトにマッチ", () => { ... });
  // ...
});
```

**注意:** `CHANNEL_OBJECT_PATTERN` は `/gm` フラグ付きのため、連続テストで `lastIndex` が影響する。テストごとに `new RegExp(source, flags)` で新インスタンスを生成する。

## 統合テスト連携（Phase 1〜11は必須）

Phase 2では統合テスト対象はなし。設計に基づきPhase 4でテストを実装する。

## 多角的チェック観点（AIが判断）

| 観点               | 適用 | 理由                                                 |
| ------------------ | ---- | ---------------------------------------------------- |
| エラーハンドリング | 適用 | mergeChannelMapsのファイル読み込みエラーケースの設計 |

## 成果物

| 成果物 | パス                        | 説明           |
| ------ | --------------------------- | -------------- |
| 設計書 | `outputs/phase-2/design.md` | 本ドキュメント |

## 完了条件

- [x] export変更箇所（5箇所）が特定されている
- [x] import変更内容が設計されている
- [x] 4つのdescribeブロック構造が設計されている
- [x] mergeChannelMaps の fs モック戦略が決定されている（一時ディレクトリ方式）
- [x] 正規表現パターンの lastIndex 対策が設計されている
- [x] **本Phase内の全タスクを100%実行完了**

## 次Phase

Phase 3（設計レビュー）に進む。
