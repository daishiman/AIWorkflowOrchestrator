# Phase 2 成果物: テスト戦略書

| 項目   | 内容                               |
| ------ | ---------------------------------- |
| Phase  | 2                                  |
| タスク | タスク4: テスト戦略                |
| 機能名 | UT-IMP-IPC-4LAYER-ALIGNMENT-CI-001 |
| 作成日 | 2026-04-14                         |

---

## 1. テスト方針

### 1.1 テストレベル

| レベル         | 対象                           | ツール | Phase |
| -------------- | ------------------------------ | ------ | ----- |
| ユニットテスト | 個別パーサー・バリデーター関数 | Vitest | 4     |
| 結合テスト     | main() 関数のE2E実行           | Vitest | 6     |
| 手動テスト     | 実プロジェクトでの実行確認     | CLI    | 11    |

### 1.2 テストファイル構成

```
scripts/
  __tests__/
    verify-ipc-4layer.test.ts    # ユニットテスト + 結合テスト
    fixtures/                     # テスト用フィクスチャ
      shared-channels.fixture.ts
      preload-channels.fixture.ts
      main-handlers.fixture.ts
      preload-safeinvoke.fixture.ts
```

---

## 2. ユニットテスト設計

### 2.1 parseSharedChannels テスト

| テストID | テスト名                             | 入力                              | 期待出力                            |
| -------- | ------------------------------------ | --------------------------------- | ----------------------------------- |
| UT-P1-01 | 標準オブジェクト定義からチャネル抽出 | `const X = { A: "x:a" } as const` | `Set(["x:a"])`                      |
| UT-P1-02 | 複数グループからの抽出               | 2つの CHANNELS オブジェクト       | 両グループの全チャネル              |
| UT-P1-03 | 個別 export の抽出                   | `export const X = "x:y" as const` | `Set(["x:y"])`                      |
| UT-P1-04 | コメント行のスキップ                 | `// A: "commented:out"`           | 空 Set                              |
| UT-P1-05 | ブロックコメントのスキップ           | `/* A: "commented:out" */`        | 空 Set                              |
| UT-P1-06 | 空ファイル                           | `""`                              | 空 Set                              |
| UT-P1-07 | ネストしたコロンを含むチャネル名     | `X: "skill:permission:request"`   | `Set(["skill:permission:request"])` |

### 2.2 parsePreloadWhitelist テスト

| テストID | テスト名                                | 入力                                         | 期待出力                |
| -------- | --------------------------------------- | -------------------------------------------- | ----------------------- |
| UT-P2-01 | IPC_CHANNELS 定義からチャネルマップ構築 | `const IPC_CHANNELS = { A: "x:a" } as const` | `defined: Set(["x:a"])` |
| UT-P2-02 | ALLOWED_INVOKE_CHANNELS の解決          | `[IPC_CHANNELS.A]` + channelMap              | `invoke: Set(["x:a"])`  |
| UT-P2-03 | ALLOWED_ON_CHANNELS の解決              | `[IPC_CHANNELS.B]` + channelMap              | `on: Set(["x:b"])`      |
| UT-P2-04 | invoke と on の分離                     | invoke=2, on=1                               | 正しく分離されること    |
| UT-P2-05 | 大規模ホワイトリスト                    | 現行の296 invoke + 56 on                     | 全件抽出されること      |

### 2.3 parseMainHandlers テスト

| テストID | テスト名                    | 入力                            | 期待出力         |
| -------- | --------------------------- | ------------------------------- | ---------------- |
| UT-P3-01 | ipcMain.handle パターン抽出 | `ipcMain.handle("x:a", ...)`    | `Set(["x:a"])`   |
| UT-P3-02 | ipcMain.on パターン抽出     | `ipcMain.on("x:b", ...)`        | `Set(["x:b"])`   |
| UT-P3-03 | テストファイルの除外        | `*.test.ts` ファイル            | 抽出されないこと |
| UT-P3-04 | コメント内のパターン除外    | `// ipcMain.handle("x:c", ...)` | 空 Set           |
| UT-P3-05 | 複数ファイルからの集約      | 3ファイル各1チャネル            | `Set` サイズ 3   |

### 2.4 parseRendererUsage テスト

| テストID | テスト名                      | 入力                              | 期待出力         |
| -------- | ----------------------------- | --------------------------------- | ---------------- |
| UT-P4-01 | safeInvoke 文字列リテラル抽出 | `safeInvoke("x:a", data)`         | `Set(["x:a"])`   |
| UT-P4-02 | safeOn 文字列リテラル抽出     | `safeOn("x:b", callback)`         | `Set(["x:b"])`   |
| UT-P4-03 | IPC_CHANNELS 参照の解決       | `safeInvoke(IPC_CHANNELS.A, ...)` | 解決された値     |
| UT-P4-04 | 型パラメータ付き safeInvoke   | `safeInvoke<T>("x:c", ...)`       | `Set(["x:c"])`   |
| UT-P4-05 | テストファイルの除外          | `__tests__/` 配下                 | 抽出されないこと |

### 2.5 validateSharedToPreload テスト (Rule-1)

| テストID | テスト名              | 入力                              | 期待出力                         |
| -------- | --------------------- | --------------------------------- | -------------------------------- |
| UT-V1-01 | 全チャネル整合        | shared ⊆ preload                  | status: "pass"                   |
| UT-V1-02 | 1件未登録             | shared に "x:a", preload に未登録 | status: "fail", missing: ["x:a"] |
| UT-V1-03 | 複数件未登録          | 3件の未登録                       | missing.length === 3             |
| UT-V1-04 | shared 空             | shared = 空 Set                   | status: "pass"                   |
| UT-V1-05 | on チャネルのみに登録 | shared="x:a", preload.on に "x:a" | status: "pass"                   |

### 2.6 validatePreloadToMain テスト (Rule-2)

| テストID | テスト名                | 入力                                   | 期待出力       |
| -------- | ----------------------- | -------------------------------------- | -------------- |
| UT-V2-01 | 全チャネル実装済み      | preload.invoke ⊆ main                  | status: "pass" |
| UT-V2-02 | 1件未実装               | preload.invoke に "x:a", main に未実装 | status: "fail" |
| UT-V2-03 | on チャネルは検証対象外 | preload.on のみに存在、main に未実装   | status: "pass" |

### 2.7 validateRendererToShared テスト (Rule-3)

| テストID | テスト名                   | 入力                                     | 期待出力       |
| -------- | -------------------------- | ---------------------------------------- | -------------- |
| UT-V3-01 | 全チャネル定義済み         | renderer ⊆ (shared ∪ preload.defined)    | status: "pass" |
| UT-V3-02 | 未定義チャネル使用         | renderer に "x:unknown"                  | status: "fail" |
| UT-V3-03 | preload 独自チャネルは合格 | preload.defined に "x:a" (shared にない) | status: "pass" |

### 2.8 formatReport テスト

| テストID | テスト名                          | 入力             | 期待出力               |
| -------- | --------------------------------- | ---------------- | ---------------------- |
| UT-R-01  | 全パス時のフォーマット            | 3ルール全て pass | "PASS" を含む文字列    |
| UT-R-02  | エラー時の ::error アノテーション | 1ルール fail     | "::error" を含む文字列 |
| UT-R-03  | サマリーの統計値                  | pass=2, fail=1   | 正しい統計値を含む     |

### 2.9 stripComments テスト

| テストID | テスト名                   | 入力                      | 期待出力     |
| -------- | -------------------------- | ------------------------- | ------------ |
| UT-SC-01 | 行コメント除去             | `code // comment`         | `code `      |
| UT-SC-02 | ブロックコメント除去       | `code /* comment */ more` | `code  more` |
| UT-SC-03 | 複数行ブロックコメント除去 | `/* line1\nline2 */`      | 空文字列     |
| UT-SC-04 | コメントなしのコード       | `const x = 1;`            | そのまま     |

---

## 3. 結合テスト設計

### 3.1 E2E テストケース

| テストID | テスト名                   | 手順                                  | 期待結果                 |
| -------- | -------------------------- | ------------------------------------- | ------------------------ |
| IT-01    | 整合フィクスチャで正常終了 | 整合状態のフィクスチャで main() 実行  | exit code 0              |
| IT-02    | Rule-1 違反で失敗          | shared に余分なチャネルを追加         | exit code 1, Rule-1 報告 |
| IT-03    | Rule-2 違反で失敗          | preload invoke に余分なチャネルを追加 | exit code 1, Rule-2 報告 |
| IT-04    | Rule-3 違反で失敗          | renderer に未定義チャネルを追加       | exit code 1, Rule-3 報告 |
| IT-05    | 複合違反                   | Rule-1 と Rule-2 同時違反             | exit code 1, 両方報告    |

---

## 4. テスト用フィクスチャ設計

### 4.1 shared-channels.fixture.ts

```typescript
export const FIXTURE_SHARED_CHANNELS = `
export const TEST_CHANNELS = {
  FOO: "test:foo",
  BAR: "test:bar",
} as const;

export const OTHER_CHANNELS = {
  BAZ: "other:baz",
} as const;

export const INDIVIDUAL_CHANNEL = "individual:channel" as const;

export const IPC_CHANNELS = {
  ...TEST_CHANNELS,
  ...OTHER_CHANNELS,
  INDIVIDUAL_CHANNEL,
} as const;
`;
```

### 4.2 preload-channels.fixture.ts

```typescript
export const FIXTURE_PRELOAD_CHANNELS = `
export const IPC_CHANNELS = {
  FOO: "test:foo",
  BAR: "test:bar",
  BAZ: "other:baz",
  EXTRA: "preload:extra",
} as const;

export const ALLOWED_INVOKE_CHANNELS: readonly string[] = [
  IPC_CHANNELS.FOO,
  IPC_CHANNELS.BAR,
  IPC_CHANNELS.BAZ,
  IPC_CHANNELS.EXTRA,
];

export const ALLOWED_ON_CHANNELS: readonly string[] = [
  IPC_CHANNELS.FOO,
];
`;
```

### 4.3 main-handlers.fixture.ts

```typescript
export const FIXTURE_MAIN_HANDLER = `
import { ipcMain } from "electron";

ipcMain.handle("test:foo", async (event, data) => {
  return data;
});

ipcMain.handle("test:bar", async (event) => {
  return {};
});

ipcMain.handle("other:baz", async () => {
  return null;
});

ipcMain.handle("preload:extra", async () => {
  return true;
});
`;
```

### 4.4 preload-safeinvoke.fixture.ts

```typescript
export const FIXTURE_PRELOAD_INDEX = `
function safeInvoke<T>(channel: string, ...args: unknown[]): Promise<T> {
  return invokeWithTimeout(ALLOWED_INVOKE_CHANNELS, channel, ...args);
}

function safeOn<T>(channel: string, callback: (data: T) => void): () => void {
  return () => {};
}

const api = {
  foo: () => safeInvoke(IPC_CHANNELS.FOO),
  bar: () => safeInvoke(IPC_CHANNELS.BAR),
  baz: () => safeInvoke(IPC_CHANNELS.BAZ),
  onFoo: (cb) => safeOn(IPC_CHANNELS.FOO, cb),
};
`;
```

---

## 5. カバレッジ目標

| カテゴリ       | 目標   | 根拠                                       |
| -------------- | ------ | ------------------------------------------ |
| 行カバレッジ   | >= 90% | 全パーサー・バリデーターの主要パスをカバー |
| 分岐カバレッジ | >= 80% | エッジケース（空入力、コメント等）含む     |
| 関数カバレッジ | 100%   | 全 export 関数にテストあり                 |

### 5.1 カバレッジ計測除外

- main() 内の `process.exitCode` 設定（結合テストでカバー）
- ファイルI/O（fs.readFileSync 等はモック化）

---

## 6. テスト実行方法

### 6.1 ローカル実行

```bash
# ユニットテストのみ
pnpm vitest run scripts/__tests__/verify-ipc-4layer.test.ts

# ウォッチモード
pnpm vitest watch scripts/__tests__/verify-ipc-4layer.test.ts

# カバレッジ付き
pnpm vitest run scripts/__tests__/verify-ipc-4layer.test.ts --coverage
```

### 6.2 CI 実行

既存の `test-desktop` または `test-shared` job でテストが実行される（Vitest の対象パターンに含まれる場合）。別途専用 job は不要。

---

## 7. モック戦略

| 対象             | モック方法                           | 理由                       |
| ---------------- | ------------------------------------ | -------------------------- |
| fs.readFileSync  | vi.mock("fs") + テスト用文字列返却   | ファイルI/Oの分離          |
| fs.readdirSync   | vi.mock("fs") + テスト用ファイル一覧 | ディレクトリ走査の分離     |
| fs.existsSync    | vi.mock("fs") + true/false 返却      | ファイル存在チェックの制御 |
| process.exitCode | vi.spyOn(process, "exitCode", "set") | exit code の検証           |
| console.log      | vi.spyOn(console, "log")             | 出力内容の検証             |
| console.error    | vi.spyOn(console, "error")           | エラー出力の検証           |
