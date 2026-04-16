# Phase 2 成果物: アーキテクチャ設計書

| 項目   | 内容                               |
| ------ | ---------------------------------- |
| Phase  | 2                                  |
| タスク | タスク1: アーキテクチャ設計        |
| 機能名 | UT-IMP-IPC-4LAYER-ALIGNMENT-CI-001 |
| 作成日 | 2026-04-14                         |

---

## 1. 全体アーキテクチャ

### 1.1 ファイル構成

```
scripts/
  verify-ipc-4layer.js          # メインスクリプト（単一ファイル）
  __tests__/
    verify-ipc-4layer.test.ts   # ユニットテスト
```

### 1.2 モジュール構造

```
scripts/verify-ipc-4layer.js
│
├── [定数] PATHS
│   ├── SHARED_CHANNELS    = "packages/shared/src/ipc/channels.ts"
│   ├── PRELOAD_CHANNELS   = "apps/desktop/src/preload/channels.ts"
│   ├── MAIN_IPC_DIR       = "apps/desktop/src/main/ipc"
│   └── PRELOAD_DIR        = "apps/desktop/src/preload"
│
├── [パーサー] parsers
│   ├── parseSharedChannels(content)       → Set<string>
│   ├── parsePreloadWhitelist(content)     → { invoke: Set<string>, on: Set<string> }
│   ├── parseMainHandlers(dirPath)         → Set<string>
│   └── parseRendererUsage(dirPath)        → Set<string>
│
├── [バリデーター] validators
│   ├── validateSharedToPreload(shared, preload)     → ValidationResult
│   ├── validatePreloadToMain(preload, main)         → ValidationResult
│   └── validateRendererToShared(renderer, shared)   → ValidationResult
│
├── [レポーター] reporter
│   └── formatReport(results)              → string
│
└── [エントリポイント] main()
    ├── ファイル読み込み
    ├── パース実行
    ├── バリデーション実行
    ├── レポート出力
    └── exit code 設定
```

### 1.3 データフロー

```
┌─────────────────────────────────────────────────────────────────┐
│                        Parse Phase                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  shared/channels.ts ──→ parseSharedChannels() ──→ Set<string>   │
│                                                    (48 channels)│
│                                                                 │
│  preload/channels.ts ──→ parsePreloadWhitelist()                │
│                           ├→ invoke: Set<string> (296 channels) │
│                           └→ on: Set<string> (56 channels)      │
│                                                                 │
│  main/ipc/*.ts ──→ parseMainHandlers() ──→ Set<string>          │
│                                            (214 registrations)  │
│                                                                 │
│  preload/*.ts ──→ parseRendererUsage() ──→ Set<string>          │
│    (safeInvoke/safeOn calls)                                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Validate Phase                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Rule-1: shared_channels ⊆ (preload_invoke ∪ preload_on)       │
│          → missing = shared - preload_all                       │
│                                                                 │
│  Rule-2: preload_invoke ⊆ main_handlers                        │
│          → missing = preload_invoke - main_handlers             │
│                                                                 │
│  Rule-3: renderer_usage ⊆ (shared_channels ∪ preload_own)      │
│          → missing = renderer - (shared ∪ preload_IPC_CHANNELS) │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       Report Phase                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  errors > 0 → stderr + ::error annotations + exit 1            │
│  errors = 0, warnings > 0 → stdout + ::warning + exit 0        │
│  all pass → stdout summary + exit 0                             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. 型定義（JSDoc ベース）

スクリプトは `.js` ファイルのため TypeScript 型は使用しないが、JSDoc で型を明示する。

### 2.1 ValidationResult

```javascript
/**
 * @typedef {Object} ValidationResult
 * @property {string} rule - ルール名 ("Rule-1" | "Rule-2" | "Rule-3")
 * @property {"pass" | "fail"} status - 検証結果
 * @property {string[]} missing - 不足チャネル一覧
 * @property {string} description - ルール説明
 */
```

### 2.2 ParsedChannels

```javascript
/**
 * @typedef {Object} ParsedPreload
 * @property {Set<string>} invoke - ALLOWED_INVOKE_CHANNELS のチャネル集合
 * @property {Set<string>} on - ALLOWED_ON_CHANNELS のチャネル集合
 * @property {Set<string>} defined - IPC_CHANNELS で定義されたチャネル値の集合
 */
```

### 2.3 ReportEntry

```javascript
/**
 * @typedef {Object} ReportEntry
 * @property {string} rule - ルール名
 * @property {"error" | "warning" | "pass"} level - 重要度
 * @property {string} message - メッセージ
 * @property {string[]} channels - 該当チャネル一覧
 */
```

---

## 3. パーサー設計

### 3.1 parseSharedChannels(content: string) -> Set<string>

**入力**: `packages/shared/src/ipc/channels.ts` のファイル内容

**抽出対象**:

1. `as const` オブジェクト内の文字列値: `KEY: "domain:operation"` パターン
2. 個別 export の文字列値: `export const XXX = "domain:operation" as const`

**正規表現**:

```javascript
// オブジェクト内の値抽出
const CHANNEL_VALUE_PATTERN = /:\s*["']([a-z][a-z0-9-]*:[a-z][a-z0-9-]*)["']/g;

// 個別 export の値抽出
const INDIVIDUAL_EXPORT_PATTERN =
  /export\s+const\s+\w+\s*=\s*["']([a-z][a-z0-9-]*:[a-z][a-z0-9-]*)["']\s+as\s+const/g;
```

**コメント除外**: ブロックコメント (`/* ... */`) と行コメント (`// ...`) を事前にストリップする。

**出力**: チャネル値の `Set<string>` (例: `{"chat:exportSession", "skill:list", ...}`)

### 3.2 parsePreloadWhitelist(content: string) -> ParsedPreload

**入力**: `apps/desktop/src/preload/channels.ts` のファイル内容

**抽出対象**:

1. `ALLOWED_INVOKE_CHANNELS` 配列内のチャネル参照を解決した文字列値
2. `ALLOWED_ON_CHANNELS` 配列内のチャネル参照を解決した文字列値
3. `IPC_CHANNELS` オブジェクト内の全チャネル値

**抽出戦略**:

- まず `IPC_CHANNELS` オブジェクトから `KEY: "value"` パターンでチャネルマップを構築
- shared からの spread (`...SKILL_CREATOR_SESSION_CHANNELS` 等) は shared パーサーの結果を使って解決
- `ALLOWED_INVOKE_CHANNELS` / `ALLOWED_ON_CHANNELS` の配列要素 (`IPC_CHANNELS.XXX`) をチャネルマップで解決
- 直接文字列リテラルが配列内にある場合はそのまま抽出

**出力**: `{ invoke: Set<string>, on: Set<string>, defined: Set<string> }`

### 3.3 parseMainHandlers(dirPath: string) -> Set<string>

**入力**: `apps/desktop/src/main/ipc/` ディレクトリパス

**抽出対象**:

- `ipcMain.handle('channel', ...)` の第一引数
- `ipcMain.on('channel', ...)` の第一引数

**正規表現**:

```javascript
const HANDLER_PATTERN = /ipcMain\.(?:handle|on)\s*\(\s*["']([^"']+)["']/g;
```

**対象ファイル**: `*.ts` (テストファイル `*.test.ts`, `*.spec.ts` を除外)

**コメント除外**: 行コメント・ブロックコメント内のパターンを除外

**定数参照の解決**: `ipcMain.handle(IPC_CHANNELS.XXX, ...)` パターンの場合、preload の `IPC_CHANNELS` マップで解決する。ただし初期実装では文字列リテラルのみを対象とし、定数参照は Phase 6 で拡張する。

**出力**: チャネル名の `Set<string>`

### 3.4 parseRendererUsage(dirPath: string) -> Set<string>

**入力**: `apps/desktop/src/preload/` ディレクトリパス

**抽出対象**:

- `safeInvoke(IPC_CHANNELS.XXX, ...)` / `safeInvoke("channel", ...)`
- `safeOn(IPC_CHANNELS.XXX, ...)` / `safeOn("channel", ...)`

**正規表現**:

```javascript
const SAFE_CALL_PATTERN =
  /safe(?:Invoke|On)(?:<[^>]*>)?\s*\(\s*(?:["']([^"']+)["']|IPC_CHANNELS\.(\w+))/g;
```

**対象ファイル**: `*.ts` (`__tests__` ディレクトリ、テストファイルを除外)

**定数参照の解決**: `IPC_CHANNELS.XXX` は preload の `IPC_CHANNELS` マップで解決する。

**出力**: チャネル名の `Set<string>`

---

## 4. バリデーター設計

### 4.1 validateSharedToPreload(shared, preload) -> ValidationResult

```
Rule-1: shared_channels ⊆ (preload.invoke ∪ preload.on)

missing = shared_channels - (preload.invoke ∪ preload.on)
status  = missing.size === 0 ? "pass" : "fail"
```

### 4.2 validatePreloadToMain(preload, main) -> ValidationResult

```
Rule-2: preload.invoke ⊆ main_handlers

missing = preload.invoke - main_handlers
status  = missing.size === 0 ? "pass" : "fail"
```

**注意**: `ALLOWED_ON_CHANNELS` は main -> renderer のプッシュ通知用であり、main 側で `ipcMain.handle` は不要。よって `invoke` のみ検証する。

### 4.3 validateRendererToShared(renderer, shared) -> ValidationResult

```
Rule-3: renderer_usage ⊆ (shared_channels ∪ preload.defined)

missing = renderer_usage - (shared_channels ∪ preload.defined)
status  = missing.size === 0 ? "pass" : "fail"
```

**注意**: preload が独自定義するチャネル（shared にない）も正当なため、preload の `IPC_CHANNELS` に定義されていれば合格とする。検証の本質は「どこにも定義がないチャネルを safeInvoke/safeOn で使っていないか」の検出。

---

## 5. レポーター設計

### 5.1 出力形式

```
=== IPC 4-Layer Alignment Verification ===

[Rule-1] shared → preload: PASS (48/48 channels aligned)
[Rule-2] preload(invoke) → main: PASS (296/296 channels aligned)
[Rule-3] renderer → shared/preload: PASS (352/352 channels aligned)

--- Summary ---
Total rules: 3
Passed: 3
Failed: 0
Exit code: 0
```

エラー時:

```
=== IPC 4-Layer Alignment Verification ===

[Rule-1] shared → preload: FAIL (2 missing)
  ::error file=packages/shared/src/ipc/channels.ts::Channel "test:missing-1" defined in shared but not in preload whitelist
  ::error file=packages/shared/src/ipc/channels.ts::Channel "test:missing-2" defined in shared but not in preload whitelist

[Rule-2] preload(invoke) → main: PASS (296/296 channels aligned)
[Rule-3] renderer → shared/preload: PASS (352/352 channels aligned)

--- Summary ---
Total rules: 3
Passed: 2
Failed: 1
Exit code: 1
```

### 5.2 GitHub Actions アノテーション

- `::error file=PATH::MESSAGE` -- Rule 違反時にファイル単位でエラーアノテーション
- `::warning file=PATH::MESSAGE` -- 警告レベルの問題検出時

---

## 6. エントリポイント設計

### 6.1 main() 関数

```javascript
function main() {
  // 1. プロジェクトルート解決
  const projectRoot = resolveProjectRoot();

  // 2. ファイル読み込み
  const sharedContent = readFile(PATHS.SHARED_CHANNELS);
  const preloadContent = readFile(PATHS.PRELOAD_CHANNELS);

  // 3. パース実行
  const sharedChannels = parseSharedChannels(sharedContent);
  const preload = parsePreloadWhitelist(preloadContent);
  const mainHandlers = parseMainHandlers(PATHS.MAIN_IPC_DIR);
  const rendererUsage = parseRendererUsage(PATHS.PRELOAD_DIR);

  // 4. バリデーション実行
  const results = [
    validateSharedToPreload(sharedChannels, preload),
    validatePreloadToMain(preload, mainHandlers),
    validateRendererToShared(rendererUsage, sharedChannels, preload),
  ];

  // 5. レポート出力
  const report = formatReport(results);
  console.log(report);

  // 6. exit code 設定
  const hasErrors = results.some((r) => r.status === "fail");
  if (hasErrors) {
    const errorLines = results
      .filter((r) => r.status === "fail")
      .flatMap((r) =>
        r.missing.map(
          (ch) => `::error::${r.rule}: Channel "${ch}" - ${r.description}`,
        ),
      );
    errorLines.forEach((line) => console.error(line));
    process.exitCode = 1;
  }
}
```

### 6.2 プロジェクトルート解決

```javascript
function resolveProjectRoot() {
  // scripts/verify-ipc-4layer.js からの相対パス
  // __dirname は scripts/ → プロジェクトルートは ..
  return path.resolve(__dirname, "..");
}
```

### 6.3 エラーハンドリング

```javascript
try {
  main();
} catch (err) {
  console.error(`Fatal error: ${err.message}`);
  process.exitCode = 2;
}
```

- exit code 0: 全ルールパス
- exit code 1: 1つ以上のルール違反
- exit code 2: スクリプト自体のエラー（ファイル未発見等）

---

## 7. テスタビリティ設計

### 7.1 関数の export

テストから個別関数を呼び出せるよう、CommonJS の `module.exports` で全パーサー・バリデーターを公開する。

```javascript
// テスト用 export
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    parseSharedChannels,
    parsePreloadWhitelist,
    parseMainHandlers,
    parseRendererUsage,
    validateSharedToPreload,
    validatePreloadToMain,
    validateRendererToShared,
    formatReport,
    stripComments,
  };
}
```

### 7.2 テスト用フィクスチャ

テストでは実際のファイルではなく、テスト用の文字列フィクスチャをパーサーに渡す。

```javascript
// テスト例
const content = `
export const TEST_CHANNELS = {
  FOO: "test:foo",
  BAR: "test:bar",
} as const;
`;
const result = parseSharedChannels(content);
assert(result.has("test:foo"));
assert(result.has("test:bar"));
```

---

## 8. 設計上の判断記録

| 判断ID | 判断内容                                          | 理由                                                    |
| ------ | ------------------------------------------------- | ------------------------------------------------------- |
| DEC-01 | 単一 .js ファイル構成                             | NFR-2 (外部依存なし) を満たすため                       |
| DEC-02 | CommonJS 形式 (require/module.exports)            | Node.js 標準で .js ファイルとして直接実行可能           |
| DEC-03 | renderer 検証は preload の safeInvoke/safeOn 解析 | renderer が直接チャネル名を持たない設計のため           |
| DEC-04 | ALLOWED_ON_CHANNELS は Rule-2 対象外              | on チャネルは main -> renderer プッシュ用で handle 不要 |
| DEC-05 | 初期実装では文字列リテラルチャネルのみ抽出        | 定数参照の完全解決は Phase 6 で拡張                     |
| DEC-06 | チャネル値パターンは `domain:operation` 形式前提  | 現行コードベースの命名規則に基づく                      |
