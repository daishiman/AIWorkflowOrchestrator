# Phase 4: テスト作成

## メタ情報

| 項目      | 内容                                                                             |
| --------- | -------------------------------------------------------------------------------- |
| Phase     | 4                                                                                |
| 名称      | テスト作成                                                                       |
| 前提Phase | Phase 3                                                                          |
| 成果物    | Red テスト（バンドル検証テスト、exports 検証テスト、ネイティブモジュールテスト） |

## 目的

Phase 5 の実装前に、修正の正しさを検証する Red テストを作成する。ビルドインフラのタスクであるため、通常のユニットテストに加えて、ビルド成果物の構造検証テストとスクリプト動作テストを作成する。

## TDD 前提確認

Phase 1〜3 で確定した命名規則と、今回追加するテスト・スクリプトの名前を先に揃える。

| 観点               | 確認内容                                                                                       | 採用方針 |
| ------------------ | ---------------------------------------------------------------------------------------------- | -------- |
| workflow 文書      | `phase-N-<name>.md` で統一されているか                                                         | 維持する |
| build テスト配置   | `apps/desktop/src/__tests__/build/` と `packages/shared/src/__tests__/build/` に分かれているか | 維持する |
| package スクリプト | root `postinstall` が bootstrap owner、desktop package は `rebuild:electron` のみを持つか      | 維持する |
| Electron hook      | `rebuild-native-for-electron.mjs` が `apps/desktop/scripts/` 配下にあるか                      | 維持する |

## 実行タスク

- Task 4-1: preload バンドル検証テストを作成する
- Task 4-2: shared パッケージの CJS 出力検証テストを作成する
- Task 4-3: `electron.vite.config.ts` の設定検証テストを作成する
- Task 4-4: ネイティブモジュールのリビルド検証テストを作成する
- Task 4-5: `setup-native-modules.sh` の Electron フォールバック検証テストを作成する
- Task 4-6: テストファイル配置と対象を整理する
- Task 4-7: テスト実行コマンドと期待結果を定義する

### Task 4-1: preload バンドル検証テスト（問題A）

**テストファイル**: `apps/desktop/src/__tests__/build/preload-bundle.test.ts`（新規作成）

このテストは `pnpm --filter @repo/desktop build` の成果物を検証する。CI および手動実行を想定したビルド後テストとして設計する。

```typescript
// apps/desktop/src/__tests__/build/preload-bundle.test.ts
import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

const PRELOAD_BUNDLE = resolve(__dirname, "../../../out/preload/index.js");

describe("preload バンドル検証", () => {
  // BA-01: preload バンドルファイルが存在する
  it("BA-01: out/preload/index.js が存在する", () => {
    expect(existsSync(PRELOAD_BUNDLE)).toBe(true);
  });

  // BA-02: @repo/shared がランタイム require として残っていない
  it('BA-02: require("@repo/shared") がバンドルに残っていない', () => {
    const content = readFileSync(PRELOAD_BUNDLE, "utf-8");
    expect(content).not.toMatch(/require\(["']@repo\/shared/);
  });

  // BA-03: IPC チャネル定数がバンドル内にインライン展開されている
  it("BA-03: APPROVAL_CHANNELS の値がバンドル内に含まれている", () => {
    const content = readFileSync(PRELOAD_BUNDLE, "utf-8");
    // channels.ts で定義されている定数値がバンドル内に存在することを確認
    expect(content).toContain("approval:respond");
  });

  // BA-04: サードパーティ依存がバンドルに混入していない
  it("BA-04: better-sqlite3 がバンドルに含まれていない", () => {
    const content = readFileSync(PRELOAD_BUNDLE, "utf-8");
    expect(content).not.toMatch(/better.sqlite3.*Database/);
  });

  // BA-05: バンドルが CJS 形式で出力されている
  it("BA-05: module.exports または exports が含まれている", () => {
    const content = readFileSync(PRELOAD_BUNDLE, "utf-8");
    expect(
      content.includes("module.exports") ||
        content.includes("exports.") ||
        content.includes("Object.defineProperty(exports"),
    ).toBe(true);
  });
});
```

**テスト実行前提**: `pnpm --filter @repo/desktop build` が実行済みであること。テスト自体はビルド成果物の静的解析のみ行い、Electron プロセスの起動は行わない。

### Task 4-2: shared パッケージ CJS 出力検証テスト（問題A）

**テストファイル**: `packages/shared/src/__tests__/build/cjs-exports.test.ts`（新規作成）

```typescript
// packages/shared/src/__tests__/build/cjs-exports.test.ts
import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

const SHARED_ROOT = resolve(__dirname, "../../..");
const PACKAGE_JSON = JSON.parse(
  readFileSync(resolve(SHARED_ROOT, "package.json"), "utf-8"),
);

describe("shared パッケージ CJS exports 検証", () => {
  // SC-01: package.json の全 exports エントリに require キーがある
  it("SC-01: 全 exports エントリに require キーが存在する", () => {
    const exports = PACKAGE_JSON.exports;
    for (const [key, value] of Object.entries(exports)) {
      expect(value).toHaveProperty("require", expect.stringMatching(/\.cjs$/));
    }
  });

  // SC-02: tsup.config.ts で CJS 出力が設定されている
  it("SC-02: dist/ に .cjs ファイルが生成されている（ipc/channels）", () => {
    const cjsPath = resolve(SHARED_ROOT, "dist/src/ipc/channels.cjs");
    expect(existsSync(cjsPath)).toBe(true);
  });

  // SC-03: CJS ファイルが require() で読み込み可能
  it("SC-03: channels.cjs が require() で読み込める", () => {
    const cjsPath = resolve(SHARED_ROOT, "dist/src/ipc/channels.cjs");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require(cjsPath);
    expect(mod).toBeDefined();
    expect(mod.APPROVAL_CHANNELS || mod.EXECUTION_CHANNELS).toBeDefined();
  });

  // SC-04: ESM ファイルも引き続き存在する
  it("SC-04: channels.js（ESM）が引き続き存在する", () => {
    const esmPath = resolve(SHARED_ROOT, "dist/src/ipc/channels.js");
    expect(existsSync(esmPath)).toBe(true);
  });
});
```

**テスト実行前提**: `pnpm --filter @repo/shared build` が実行済みであること。

### Task 4-3: electron.vite.config.ts 設定検証テスト（問題A）

**テストファイル**: `apps/desktop/src/__tests__/build/vite-config.test.ts`（新規作成）

```typescript
// apps/desktop/src/__tests__/build/vite-config.test.ts
import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";

const CONFIG_PATH = resolve(__dirname, "../../../electron.vite.config.ts");

describe("electron.vite.config.ts 設定検証", () => {
  const configContent = readFileSync(CONFIG_PATH, "utf-8");

  // VC-01: preload セクションで externalizeDepsPlugin に exclude が設定されている
  it("VC-01: preload の externalizeDepsPlugin に @repo/shared の exclude がある", () => {
    // externalizeDepsPlugin({ exclude: ['@repo/shared'] }) のパターンを検出
    expect(configContent).toMatch(
      /externalizeDepsPlugin\(\s*\{[^}]*exclude\s*:\s*\[.*['"]@repo\/shared['"]/,
    );
  });

  // VC-02: main セクションでも exclude が設定されている
  it("VC-02: main の externalizeDepsPlugin にも @repo/shared の exclude がある", () => {
    // main セクション内の externalizeDepsPlugin を検出
    // 2箇所の externalizeDepsPlugin 呼び出しが exclude を持つことを確認
    const matches = configContent.match(
      /externalizeDepsPlugin\(\s*\{[^}]*exclude\s*:\s*\[.*['"]@repo\/shared['"]/g,
    );
    expect(matches).not.toBeNull();
    expect(matches!.length).toBeGreaterThanOrEqual(2);
  });
});
```

### Task 4-4: ネイティブモジュールリビルドテスト（問題B）

**テストファイル**: `apps/desktop/src/__tests__/build/native-module-rebuild.test.ts`（新規作成）

```typescript
// apps/desktop/src/__tests__/build/native-module-rebuild.test.ts
import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import { execSync } from "child_process";

const DESKTOP_ROOT = resolve(__dirname, "../../..");
const DESKTOP_PKG = JSON.parse(
  readFileSync(resolve(DESKTOP_ROOT, "package.json"), "utf-8"),
);

describe("ネイティブモジュールリビルド検証", () => {
  // NR-01: @electron/rebuild が devDependencies に含まれている
  it("NR-01: @electron/rebuild が devDependencies に存在する", () => {
    expect(DESKTOP_PKG.devDependencies).toHaveProperty("@electron/rebuild");
  });

  // NR-02: rebuild:electron スクリプトが定義されている
  it("NR-02: rebuild:electron スクリプトが存在する", () => {
    expect(DESKTOP_PKG.scripts).toHaveProperty("rebuild:electron");
    expect(DESKTOP_PKG.scripts["rebuild:electron"]).toContain(
      "electron-rebuild",
    );
    expect(DESKTOP_PKG.scripts["rebuild:electron"]).toContain("better-sqlite3");
    expect(DESKTOP_PKG.scripts["rebuild:electron"]).toContain(
      "../../packages/shared",
    );
    expect(DESKTOP_PKG.scripts["rebuild:electron"]).toContain("process.arch");
    expect(DESKTOP_PKG.scripts).not.toHaveProperty("postinstall");
  });

  // NR-03: electron-builder.yml に afterPack が設定されている
  it("NR-03: electron-builder.yml に afterPack フックがある", () => {
    const builderYml = readFileSync(
      resolve(DESKTOP_ROOT, "electron-builder.yml"),
      "utf-8",
    );
    expect(builderYml).toContain("afterPack");
    expect(builderYml).toContain("rebuild-native-for-electron");
  });

  // NR-04: afterPack スクリプトファイルが存在する
  it("NR-04: scripts/rebuild-native-for-electron.mjs が存在する", () => {
    expect(
      existsSync(
        resolve(DESKTOP_ROOT, "scripts/rebuild-native-for-electron.mjs"),
      ),
    ).toBe(true);
  });

  // NR-05: setup-native-modules.sh に Electron 対応コードがある
  it("NR-05: setup-native-modules.sh に electron-rebuild の呼び出しがある", () => {
    const script = readFileSync(
      resolve(DESKTOP_ROOT, "../../scripts/setup-native-modules.sh"),
      "utf-8",
    );
    expect(script).toContain("electron-rebuild");
  });
});
```

### Task 4-5: setup-native-modules.sh Electron フォールバックテスト（問題B / MR-02）

**テストファイル**: `apps/desktop/src/__tests__/build/setup-script-fallback.test.ts`（新規作成）

```typescript
// apps/desktop/src/__tests__/build/setup-script-fallback.test.ts
import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";

const SCRIPT_PATH = resolve(
  __dirname,
  "../../../../scripts/setup-native-modules.sh",
);

describe("setup-native-modules.sh フォールバック検証", () => {
  const scriptContent = readFileSync(SCRIPT_PATH, "utf-8");

  // SF-01: Electron 存在チェックのロジックがある
  it("SF-01: Electron インストール有無のチェックが含まれている", () => {
    expect(scriptContent).toContain("desktop_exec electron --version");
  });

  // SF-02: root から desktop workspace を明示して Electron を起動している
  it("SF-02: desktop workspace 経由で Electron を呼び出す", () => {
    expect(scriptContent).toContain('pnpm --dir "$DESKTOP_DIR" exec');
    expect(scriptContent).toContain("ELECTRON_RUN_AS_NODE=1");
  });

  // SF-03: Electron インストール時に electron-rebuild を使用する
  it("SF-03: Electron インストール時に electron-rebuild を呼び出す", () => {
    expect(scriptContent).toContain("electron-rebuild");
  });
});
```

### Task 4-6: テストファイル配置まとめ

| テスト ID | ファイル                                                         | テスト数 | 対象要件       |
| --------- | ---------------------------------------------------------------- | -------- | -------------- |
| BA-01〜05 | `apps/desktop/src/__tests__/build/preload-bundle.test.ts`        | 5        | REQ-A3, REQ-A5 |
| SC-01〜04 | `packages/shared/src/__tests__/build/cjs-exports.test.ts`        | 4        | REQ-A1, REQ-A2 |
| VC-01〜02 | `apps/desktop/src/__tests__/build/vite-config.test.ts`           | 2        | REQ-A3, REQ-A4 |
| NR-01〜05 | `apps/desktop/src/__tests__/build/native-module-rebuild.test.ts` | 5        | REQ-B1〜B4     |
| SF-01〜03 | `apps/desktop/src/__tests__/build/setup-script-fallback.test.ts` | 3        | REQ-B2 (MR-02) |

合計: 19 テスト

### Task 4-7: テスト実行コマンド

```bash
# ビルド成果物テスト（ビルド実行後）
pnpm --filter @repo/shared build && pnpm --filter @repo/desktop build

# 全テスト実行
pnpm --filter @repo/desktop vitest run src/__tests__/build/
pnpm --filter @repo/shared vitest run src/__tests__/build/

# 個別実行
pnpm --filter @repo/desktop vitest run preload-bundle.test.ts
pnpm --filter @repo/desktop vitest run vite-config.test.ts
pnpm --filter @repo/desktop vitest run native-module-rebuild.test.ts
pnpm --filter @repo/desktop vitest run setup-script-fallback.test.ts
pnpm --filter @repo/shared vitest run cjs-exports.test.ts
```

Phase 4 完了時点では全テストが Red（FAIL）であることを確認する。Phase 5 の実装により段階的に Green になる。

## 参照資料

### システム仕様（aiworkflow-requirements）

| 資料名                       | パス                                       |
| ---------------------------- | ------------------------------------------ |
| テストコンポーネントパターン | `references/testing-component-patterns.md` |
| 品質要件                     | `references/quality-requirements.md`       |

## 統合テスト連携

- Phase 5 実装後に本テスト群を Green 化し、Phase 9/11 の実測へ接続する
- build artifact 検証は runtime 手動確認の前提条件として扱う

## 成果物

| 成果物                     | 配置先                                                           | 説明      |
| -------------------------- | ---------------------------------------------------------------- | --------- |
| preload バンドルテスト     | `apps/desktop/src/__tests__/build/preload-bundle.test.ts`        | BA-01〜05 |
| CJS exports テスト         | `packages/shared/src/__tests__/build/cjs-exports.test.ts`        | SC-01〜04 |
| Vite 設定テスト            | `apps/desktop/src/__tests__/build/vite-config.test.ts`           | VC-01〜02 |
| ネイティブモジュールテスト | `apps/desktop/src/__tests__/build/native-module-rebuild.test.ts` | NR-01〜05 |
| フォールバックテスト       | `apps/desktop/src/__tests__/build/setup-script-fallback.test.ts` | SF-01〜03 |

## 完了条件

- [ ] 5 つのテストファイルが新規作成されている
- [ ] 合計 19 テストケースが定義されている
- [ ] 全テストが Red（FAIL）であることを確認した（Phase 5 実装前）
- [ ] テスト実行コマンドが動作し、テストランナーがテストを認識している
- [ ] **本Phase内の全タスクを100%実行完了**
