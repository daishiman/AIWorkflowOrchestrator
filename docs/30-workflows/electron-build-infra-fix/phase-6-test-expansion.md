# Phase 6: テスト拡充

## メタ情報

| 項目      | 内容                               |
| --------- | ---------------------------------- |
| Phase     | 6                                  |
| 名称      | テスト拡充                         |
| 前提Phase | Phase 5                            |
| 成果物    | エッジケーステスト、回帰防止テスト |

## 目的

Phase 5 の実装が完了し基本テストが Green になった後、エッジケースと回帰防止のためのテストを追加する。ビルドインフラタスクの特性上、将来の設定変更で問題が再発しないことを保証するガードテストを重視する。

## 実行タスク

### Task 6-1: preload バンドルのエッジケーステスト

**テストファイル**: `apps/desktop/src/__tests__/build/preload-bundle.test.ts`（既存ファイルに追加）

```typescript
// 追加テスト
describe("preload バンドル エッジケース", () => {
  // BA-06: preload バンドルサイズが異常に大きくない（サードパーティ混入チェック）
  it("BA-06: バンドルサイズが 500KB 未満である", () => {
    const stats = statSync(PRELOAD_BUNDLE);
    // 500KB を超える場合、不要なサードパーティがバンドルされている可能性がある
    expect(stats.size).toBeLessThan(500 * 1024);
  });

  // BA-07: electron モジュールが external のまま残っている
  it('BA-07: require("electron") がバンドルに残っている（external として正しい）', () => {
    const content = readFileSync(PRELOAD_BUNDLE, "utf-8");
    expect(content).toMatch(/require\(["']electron["']\)/);
  });

  // BA-08: @supabase/supabase-js がバンドルに含まれていない
  it("BA-08: @supabase/supabase-js がバンドルに含まれていない", () => {
    const content = readFileSync(PRELOAD_BUNDLE, "utf-8");
    expect(content).not.toMatch(/supabase/i);
  });
});
```

### Task 6-2: shared パッケージの CJS/ESM 整合性テスト

**テストファイル**: `packages/shared/src/__tests__/build/cjs-exports.test.ts`（既存ファイルに追加）

```typescript
// 追加テスト
describe("CJS/ESM 整合性", () => {
  // SC-05: 全 exports の import/require ファイルがペアで存在する
  it("SC-05: 全 exports エントリの .js と .cjs がペアで存在する", () => {
    const exports = PACKAGE_JSON.exports;
    for (const [key, value] of Object.entries(exports)) {
      const importPath = resolve(SHARED_ROOT, value.import);
      const requirePath = resolve(SHARED_ROOT, value.require);
      expect(existsSync(importPath)).toBe(true);
      expect(existsSync(requirePath)).toBe(true);
    }
  });

  // SC-06: CJS ファイルに ESM 構文（export default 等）が含まれていない
  it("SC-06: channels.cjs に ESM 構文が含まれていない", () => {
    const cjsContent = readFileSync(
      resolve(SHARED_ROOT, "dist/src/ipc/channels.cjs"),
      "utf-8",
    );
    expect(cjsContent).not.toMatch(/^export\s/m);
    expect(cjsContent).not.toMatch(/^import\s/m);
  });

  // SC-07: index.cjs が存在しメインエントリとして機能する
  it("SC-07: dist/index.cjs が存在する", () => {
    expect(existsSync(resolve(SHARED_ROOT, "dist/index.cjs"))).toBe(true);
  });
});
```

### Task 6-3: electron-builder.yml の回帰防止テスト

**テストファイル**: `apps/desktop/src/__tests__/build/native-module-rebuild.test.ts`（既存ファイルに追加）

```typescript
// 追加テスト
describe("electron-builder 設定回帰防止", () => {
  // NR-06: asarUnpack に better-sqlite3 が含まれている
  it("NR-06: asarUnpack に better-sqlite3 が含まれている", () => {
    const builderYml = readFileSync(
      resolve(DESKTOP_ROOT, "electron-builder.yml"),
      "utf-8",
    );
    expect(builderYml).toContain("better-sqlite3");
  });

  // NR-07: afterPack スクリプトが @electron/rebuild を import している
  it("NR-07: afterPack スクリプトが @electron/rebuild を使用している", () => {
    const script = readFileSync(
      resolve(DESKTOP_ROOT, "scripts/rebuild-native-for-electron.mjs"),
      "utf-8",
    );
    expect(script).toContain("@electron/rebuild");
    expect(script).toContain("better-sqlite3");
  });

  // NR-08: afterPack スクリプトが export default 関数をエクスポートしている
  it("NR-08: afterPack スクリプトが default export を持つ", () => {
    const script = readFileSync(
      resolve(DESKTOP_ROOT, "scripts/rebuild-native-for-electron.mjs"),
      "utf-8",
    );
    expect(script).toMatch(/export\s+default/);
  });
});
```

### Task 6-4: main プロセスバンドル検証テスト

**テストファイル**: `apps/desktop/src/__tests__/build/main-bundle.test.ts`（新規作成）

```typescript
// apps/desktop/src/__tests__/build/main-bundle.test.ts
import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

const MAIN_BUNDLE = resolve(__dirname, "../../../out/main/index.js");

describe("main プロセスバンドル検証", () => {
  // MB-01: main バンドルファイルが存在する
  it("MB-01: out/main/index.js が存在する", () => {
    expect(existsSync(MAIN_BUNDLE)).toBe(true);
  });

  // MB-02: @repo/shared がランタイム require として残っていない
  it('MB-02: require("@repo/shared") がバンドルに残っていない', () => {
    const content = readFileSync(MAIN_BUNDLE, "utf-8");
    expect(content).not.toMatch(/require\(["']@repo\/shared/);
  });
});
```

### Task 6-5: テスト追加まとめ

| テスト ID | ファイル                        | 種別                                          |
| --------- | ------------------------------- | --------------------------------------------- |
| BA-06〜08 | `preload-bundle.test.ts`        | エッジケース（バンドルサイズ、external 検証） |
| SC-05〜07 | `cjs-exports.test.ts`           | 整合性（ファイルペア、ESM 構文排除）          |
| NR-06〜08 | `native-module-rebuild.test.ts` | 回帰防止（asarUnpack、afterPack スクリプト）  |
| MB-01〜02 | `main-bundle.test.ts`           | main プロセスバンドル検証                     |

追加: 11 テスト
合計: 30 テスト（Phase 4 の 19 + Phase 6 の 11）

## 参照資料

### システム仕様（aiworkflow-requirements）

| 資料名                       | パス                                       |
| ---------------------------- | ------------------------------------------ |
| テストコンポーネントパターン | `references/testing-component-patterns.md` |

## 成果物

| 成果物              | 配置先                                                 | 説明                            |
| ------------------- | ------------------------------------------------------ | ------------------------------- |
| エッジケーステスト  | 既存テストファイルに追加                               | BA-06〜08, SC-05〜07, NR-06〜08 |
| main バンドルテスト | `apps/desktop/src/__tests__/build/main-bundle.test.ts` | MB-01〜02（新規）               |

## 完了条件

- [ ] 11 テストケースが追加されている
- [ ] 追加テスト全てが PASS している
- [ ] 合計 30 テストが全て PASS している
- [ ] **本Phase内の全タスクを100%実行完了**
