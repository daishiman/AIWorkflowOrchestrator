# Phase 4: テスト作成 - 新関数テスト拡充

## メタ情報

| 項目    | 値                                                   |
| ------- | ---------------------------------------------------- |
| Phase   | 4                                                    |
| 機能名  | UT-TASK06-007-EXT-006-new-function-test-expansion    |
| 作成日  | 2026-03-21                                           |
| 前Phase | [phase-3-design-review.md](phase-3-design-review.md) |

## 目的

Phase 2の設計に基づき、`check-ipc-contracts.ts` に5つのexportを追加し、20件の新規テストケースを実装する。既存49テストの回帰を確認しながら Red→Green のサイクルで進める。

## 実行タスク

- Task 4-1: `check-ipc-contracts.ts` へ export を5箇所追加する
- Task 4-2: `check-ipc-contracts.test.ts` の import を更新する
- Task 4-3: 4つの describe ブロック（FR-1〜FR-4、計20件）を実装する
- Task 4-4: 一時ディレクトリ方式で `mergeChannelMaps` テストを実装する
- Task 4-5: `CHANNEL_OBJECT_PATTERN` の `lastIndex` 汚染対策を反映する
- Task 4-6: テストを実行して Red → Green を確認する

## 参照資料

| 資料名                   | パス                                                         | 説明                     |
| ------------------------ | ------------------------------------------------------------ | ------------------------ |
| Phase 1要件書            | [phase-1-requirements.md](phase-1-requirements.md)           | FR-1〜FR-4と20件の根拠   |
| Phase 2設計書            | [phase-2-design.md](phase-2-design.md)                       | export変更・構造設計     |
| Phase 3ゲート            | [phase-3-design-review.md](phase-3-design-review.md)         | PASS判定の根拠           |
| 対象スクリプト           | `apps/desktop/scripts/check-ipc-contracts.ts`                | export追加対象（584行）  |
| 既存テスト               | `apps/desktop/scripts/__tests__/check-ipc-contracts.test.ts` | 既存49テスト（回帰対象） |
| 要件定義書               | `outputs/phase-1/requirements.md`                            | Phase 1 成果物           |
| 設計書                   | `outputs/phase-2/design.md`                                  | Phase 2 成果物           |
| 設計レビューゲート判定書 | `outputs/phase-3/gate-decision.md`                           | Phase 3 成果物           |

## 実行手順

### ステップ1: `check-ipc-contracts.ts` への export 追加

以下5箇所を `const`/`function` から `export const`/`export function` に変更する（ロジック変更なし）。

| 行番号 | 変更前                               | 変更後                                      |
| ------ | ------------------------------------ | ------------------------------------------- |
| L53    | `const CHANNEL_OBJECT_PATTERN`       | `export const CHANNEL_OBJECT_PATTERN`       |
| L56    | `const PRELOAD_CALL_START_PATTERN`   | `export const PRELOAD_CALL_START_PATTERN`   |
| L68    | `function normalizeTypeAnnotation`   | `export function normalizeTypeAnnotation`   |
| L76    | `function isPrimitiveTypeAnnotation` | `export function isPrimitiveTypeAnnotation` |
| L271   | `function mergeChannelMaps`          | `export function mergeChannelMaps`          |

変更後に型エラーがないことを確認:

```bash
cd apps/desktop && pnpm tsc --noEmit --project tsconfig.json 2>&1 | head -20
```

### ステップ2: `check-ipc-contracts.test.ts` の import 変更

ファイル冒頭の import ブロックを以下に変更する:

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

また、一時ファイルテスト用に以下の import を追加する（ファイル先頭付近）:

```typescript
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
```

### ステップ3: FR-1 describe ブロック実装 (`normalizeTypeAnnotation`、5件)

既存テストの末尾（`main() exit code logic` describe ブロックの後）に追加する。

```typescript
// ============================================================================
// FR-1: normalizeTypeAnnotation
// ============================================================================

describe("normalizeTypeAnnotation", () => {
  it("T-N-01: 変換不要な型はそのまま返す", () => {
    const result = normalizeTypeAnnotation("string");
    expect(result).toBe("string");
  });

  it("T-N-02: arrow function を除去する", () => {
    const result = normalizeTypeAnnotation("(value: string) => void");
    expect(result).toBe("(value: string)");
  });

  it("T-N-03: デフォルト値代入を除去する", () => {
    const result = normalizeTypeAnnotation("string = 'default'");
    expect(result).toBe("string");
  });

  it("T-N-04: readonly プレフィックスを除去する", () => {
    const result = normalizeTypeAnnotation("readonly string[]");
    expect(result).toBe("string[]");
  });

  it("T-N-05: 余分な空白をトリムする", () => {
    const result = normalizeTypeAnnotation("  string  ");
    expect(result).toBe("string");
  });
});
```

### ステップ4: FR-2 describe ブロック実装 (`isPrimitiveTypeAnnotation`、6件)

```typescript
// ============================================================================
// FR-2: isPrimitiveTypeAnnotation
// ============================================================================

describe("isPrimitiveTypeAnnotation", () => {
  it("T-P-01: union型 'string | number' は true を返す", () => {
    expect(isPrimitiveTypeAnnotation("string | number")).toBe(true);
  });

  it("T-P-02: intersection型 'string & Branded' は false を返す", () => {
    expect(isPrimitiveTypeAnnotation("string & Branded")).toBe(false);
  });

  it("T-P-03: 空文字列は false を返す", () => {
    expect(isPrimitiveTypeAnnotation("")).toBe(false);
  });

  it("T-P-04: readonly 配列は false を返す", () => {
    expect(isPrimitiveTypeAnnotation("readonly string[]")).toBe(false);
  });

  it("T-P-05: undefined 含み union は true を返す", () => {
    expect(isPrimitiveTypeAnnotation("string | undefined")).toBe(true);
  });

  it("T-P-06: カスタム型は false を返す", () => {
    expect(isPrimitiveTypeAnnotation("MyCustomType")).toBe(false);
  });
});
```

### ステップ5: FR-3 describe ブロック実装 (`mergeChannelMaps`、4件)

一時ディレクトリ方式（`mkdtempSync(join(tmpdir(), "ipc-test-"))`）を使用する。

```typescript
// ============================================================================
// FR-3: mergeChannelMaps
// ============================================================================

describe("mergeChannelMaps", () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = mkdtempSync(join(tmpdir(), "ipc-test-"));
  });

  afterEach(() => {
    rmSync(tmpDir, { recursive: true, force: true });
  });

  it("T-M-01: 単一ファイルからチャンネルマップを構築する", () => {
    const content = [
      `export const IPC_CHANNELS = {`,
      `  SKILL_IMPORT: 'skill:import',`,
      `} as const;`,
    ].join("\n");
    const filePath = join(tmpDir, "channels.ts");
    writeFileSync(filePath, content, "utf-8");

    const map = mergeChannelMaps([filePath]);

    expect(map.get("SKILL_IMPORT")).toBe("skill:import");
    expect(map.get("IPC_CHANNELS.SKILL_IMPORT")).toBe("skill:import");
  });

  it("T-M-02: 複数ファイルを結合して重複キーは先勝ちで解決する", () => {
    const content1 = [
      `export const A = {`,
      `  KEY: 'value-a',`,
      `  FIRST: 'first:channel',`,
      `} as const;`,
    ].join("\n");
    const content2 = [
      `export const B = {`,
      `  SECOND: 'second:channel',`,
      `  KEY: 'value-b',`,
      `} as const;`,
    ].join("\n");
    const file1 = join(tmpDir, "a.ts");
    const file2 = join(tmpDir, "b.ts");
    writeFileSync(file1, content1, "utf-8");
    writeFileSync(file2, content2, "utf-8");

    const map = mergeChannelMaps([file1, file2]);

    expect(map.get("FIRST")).toBe("first:channel");
    expect(map.get("SECOND")).toBe("second:channel");
    expect(map.get("KEY")).toBe("value-a");
  });

  it("T-M-03: 空のファイルリストは空のMapを返す", () => {
    const map = mergeChannelMaps([]);
    expect(map.size).toBe(0);
  });

  it("T-M-04: チャンネル定義のないファイルは無視される", () => {
    const content = `export function doNothing() {}`;
    const filePath = join(tmpDir, "empty.ts");
    writeFileSync(filePath, content, "utf-8");

    const map = mergeChannelMaps([filePath]);

    expect(map.size).toBe(0);
  });
});
```

### ステップ6: FR-4 describe ブロック実装 (`CHANNEL_OBJECT_PATTERN` / `PRELOAD_CALL_START_PATTERN`、5件)

`CHANNEL_OBJECT_PATTERN` は `/gm` フラグ付きのため、テストごとに `new RegExp(CHANNEL_OBJECT_PATTERN.source, "gm")` で新インスタンスを生成する。

```typescript
// ============================================================================
// FR-4: CHANNEL_OBJECT_PATTERN / PRELOAD_CALL_START_PATTERN
// ============================================================================

describe("CHANNEL_OBJECT_PATTERN / PRELOAD_CALL_START_PATTERN", () => {
  it("T-R-01: CHANNEL_OBJECT_PATTERN が基本的な as const オブジェクトにマッチする", () => {
    const source = `export const IPC_CHANNELS = { SKILL_IMPORT: 'skill:import' } as const`;
    const re = new RegExp(CHANNEL_OBJECT_PATTERN.source, "gm");
    const match = re.exec(source);
    expect(match).not.toBeNull();
    expect(match![1]).toBe("IPC_CHANNELS");
  });

  it("T-R-02: CHANNEL_OBJECT_PATTERN が export なし const にもマッチする", () => {
    const source = `const CHANNELS = { A: 'a:b' } as const`;
    const re = new RegExp(CHANNEL_OBJECT_PATTERN.source, "gm");
    const match = re.exec(source);
    expect(match).not.toBeNull();
  });

  it("T-R-03: CHANNEL_OBJECT_PATTERN が as const のないオブジェクトにマッチしない", () => {
    const source = `const CHANNELS = { A: 'a:b' }`;
    const re = new RegExp(CHANNEL_OBJECT_PATTERN.source, "gm");
    const match = re.exec(source);
    expect(match).toBeNull();
  });

  it("T-R-04: CHANNEL_OBJECT_PATTERN が複数 const object と空 body を抽出する", () => {
    const source = [
      `const EMPTY = {} as const;`,
      ``,
      `export const IPC_CHANNELS = {`,
      `  SKILL_IMPORT: 'skill:import',`,
      `} as const;`,
    ].join("\n");
    const re = new RegExp(CHANNEL_OBJECT_PATTERN.source, "gm");
    const matches = Array.from(source.matchAll(re));
    expect(matches.map((match) => match[1])).toEqual(["EMPTY", "IPC_CHANNELS"]);
  });

  it("T-R-05: PRELOAD_CALL_START_PATTERN が generic 付き safeInvoke / safeOn にマッチする", () => {
    const source = [
      `safeInvoke<{ success: boolean }>(IPC_CHANNELS.SKILL_IMPORT, skillName)`,
      `safeOn<SystemTheme>(IPC_CHANNELS.SYSTEM_THEME, callback)`,
    ].join("\n");
    expect(PRELOAD_CALL_START_PATTERN.test(source)).toBe(true);
  });
});
```

### ステップ7: Red 確認

export追加前の状態でテストを実行し、import エラーが発生することを確認する（Red 確認）。

```bash
cd apps/desktop && pnpm vitest run scripts/__tests__/check-ipc-contracts.test.ts 2>&1 | tail -20
```

期待: `SyntaxError: The requested module does not provide an export named 'normalizeTypeAnnotation'` または同等の named export 解決エラー。

### ステップ8: Green 確認

ステップ1のexport追加が完了していることを前提に、全テストを実行して Green を確認する。

```bash
cd apps/desktop && pnpm vitest run scripts/__tests__/check-ipc-contracts.test.ts 2>&1 | tail -30
```

期待: `Test Files  1 passed` / `Tests  69 passed` (既存49件 + 新規20件)

## 統合テスト連携

Phase 5でexport追加の確認とテスト全件実行（69件）を行う。

## 成果物

| 成果物           | パス                                                         | 説明                       |
| ---------------- | ------------------------------------------------------------ | -------------------------- |
| テストコード     | `apps/desktop/scripts/__tests__/check-ipc-contracts.test.ts` | 新規20テスト追加（計69件） |
| ソースコード変更 | `apps/desktop/scripts/check-ipc-contracts.ts`                | export5箇所追加のみ        |
| テスト設計書     | `outputs/phase-4/test-design.md`                             | 本フェーズのテスト設計記録 |

## 完了条件

- [x] `check-ipc-contracts.ts` に5箇所の export が追加されている
- [x] `check-ipc-contracts.test.ts` の import ブロックに5つの新 export が追加されている
- [x] `normalizeTypeAnnotation` の describe ブロック（5件: T-N-01〜T-N-05）が実装されている
- [x] `isPrimitiveTypeAnnotation` の describe ブロック（6件: T-P-01〜T-P-06）が実装されている
- [x] `mergeChannelMaps` の describe ブロック（4件: T-M-01〜T-M-04）が一時ディレクトリ方式で実装されている
- [x] `CHANNEL_OBJECT_PATTERN / PRELOAD_CALL_START_PATTERN` の describe ブロック（5件: T-R-01〜T-R-05）が実装されている
- [x] `CHANNEL_OBJECT_PATTERN` のテストが `new RegExp(source, "gm")` で lastIndex 対策済み
- [x] `pnpm vitest run` で全69件が PASS する
- [x] `outputs/phase-4/test-design.md` が作成されている
- [x] **本Phase内の全タスクを100%実行完了**

## 次Phase

Phase 5（実装確認）に進む。
