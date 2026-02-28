# Phase 4: テスト仕様書

## メタ情報

| 項目   | 内容                               |
| ------ | ---------------------------------- |
| Phase  | 4                                  |
| 機能名 | TASK-9D-skill-chain                |
| 成果物 | テスト仕様書（4ファイル/68テスト） |
| 作成日 | 2026-02-28                         |
| 前提   | Phase 3（設計レビュー）PASS        |

---

## 1. テストファイル構成

| #   | ファイルパス                                                                | テスト数 | 対象コンポーネント       | テスト種別       |
| --- | --------------------------------------------------------------------------- | -------- | ------------------------ | ---------------- |
| 1   | `packages/shared/src/types/__tests__/skill-chain.test.ts`                   | 7        | 型定義（skill-chain.ts） | 型バリデーション |
| 2   | `apps/desktop/src/main/services/skill/__tests__/SkillChainStore.test.ts`    | 13       | SkillChainStore          | 単体テスト       |
| 3   | `apps/desktop/src/main/services/skill/__tests__/SkillChainExecutor.test.ts` | 27       | SkillChainExecutor       | 単体テスト       |
| 4   | `apps/desktop/src/main/ipc/__tests__/skillHandlers.chain.test.ts`           | 21       | IPC チェーンハンドラ     | 統合テスト       |
|     | **合計**                                                                    | **68**   |                          |                  |

---

## 2. skill-chain.test.ts（7テスト）

### 目的

`packages/shared/src/types/skill-chain.ts` の 7 公開型 + 3 ユニオン型がコンパイル可能であり、型制約が正しく機能することを検証する。

### テストケース一覧

| #   | テスト名                                                     | 対応要件 | 検証内容                                                                 |
| --- | ------------------------------------------------------------ | -------- | ------------------------------------------------------------------------ |
| 1   | SkillChainDefinition の全フィールドが正しい型で定義できる    | NFR-4-1  | 8フィールドが指定した型で代入可能であること                              |
| 2   | SkillChainStep の必須/任意フィールドが正しく型チェックされる | NFR-4-1  | stepId, skillName, inputMapping が必須、他が任意であること               |
| 3   | InputMapping の 4 種の type が排他的に動作する               | NFR-4-1  | "literal", "variable", "template", "previousOutput" の各値が型安全       |
| 4   | OutputMapping の variableName が必須、extractPath が任意     | NFR-4-1  | 必須フィールド欠落でコンパイルエラーとなること                           |
| 5   | SkillChainCondition の 4 種の type が排他的に動作する        | NFR-4-1  | "always", "ifVariable", "ifPreviousSuccess", "expression" の各値が型安全 |
| 6   | SkillChainResult の全フィールドが正しい型で定義できる        | NFR-4-1  | chainId, success, results, finalVariables, totalDuration の型チェック    |
| 7   | StepResult のオプショナルフィールドが undefined 許容する     | NFR-4-1  | success, skipped, output, error, duration が undefined 可                |

### テスト設計詳細

```typescript
describe("SkillChainDefinition", () => {
  it("全フィールドが正しい型で定義できる", () => {
    const chain: SkillChainDefinition = {
      id: "550e8400-e29b-41d4-a716-446655440000",
      name: "テストチェーン",
      description: "テスト用チェーン",
      steps: [],
      variables: {},
      errorHandling: "stop",
      createdAt: "2026-02-28T12:00:00.000Z",
      updatedAt: "2026-02-28T12:00:00.000Z",
    };
    expect(chain).toBeDefined();
  });
});

describe("SkillChainErrorStrategy", () => {
  it("3 値のユニオン型が正しく動作する", () => {
    const strategies: SkillChainErrorStrategy[] = ["stop", "skip", "retry"];
    expect(strategies).toHaveLength(3);
  });
});
```

---

## 3. SkillChainStore.test.ts（13テスト）

### 目的

SkillChainStore の CRUD 操作、UUID 自動付与、createdAt/updatedAt 自動設定、パストラバーサル防止を検証する。

### テストケース一覧

| #   | テスト名                                                        | 対応要件 | 検証内容                                                        |
| --- | --------------------------------------------------------------- | -------- | --------------------------------------------------------------- |
| 1   | save: 新規チェーンに UUID v4 形式の id を自動付与する           | FR-1-1   | id が UUID v4 正規表現に一致する                                |
| 2   | save: 新規チェーンに createdAt/updatedAt を ISO 8601 で設定する | FR-1-1   | ISO 8601 形式の文字列で createdAt === updatedAt                 |
| 3   | save: 既存チェーンの更新で updatedAt のみ更新される             | FR-1-4   | createdAt は変更されず updatedAt が新しくなる                   |
| 4   | get: 保存済みチェーンを chainId 指定で取得できる                | FR-1-2   | 全フィールドが保存時と一致する                                  |
| 5   | get: 存在しない chainId で null が返る                          | FR-1-6   | 戻り値が null である                                            |
| 6   | list: 保存済み全チェーンを配列で返す                            | FR-1-3   | 3件保存後に list で length === 3                                |
| 7   | list: チェーンが 0 件の場合に空配列を返す                       | FR-1-3   | 戻り値が [] である                                              |
| 8   | delete: 存在するチェーンを削除して true を返す                  | FR-1-5   | deleted === true かつ get で null が返る                        |
| 9   | delete: 存在しない chainId で false を返す                      | FR-1-6   | deleted === false                                               |
| 10  | save: JSON ファイルが {storePath}/{chainId}.json に保存される   | NFR-3-3  | ファイルが存在し内容が SkillChainDefinition と一致する          |
| 11  | パストラバーサル: "../" を含む chainId でエラーを投げる         | NFR-2-3  | Error("Invalid chain ID: path traversal detected") が投げられる |
| 12  | save: ディレクトリが存在しない場合に自動作成する                | NFR-3-3  | storePath ディレクトリが自動作成される                          |
| 13  | save: description と variables が正しく保存される               | FR-1-1   | description, variables が保存時の値と一致する                   |

### モック・テスト環境

```typescript
import { mkdtemp, rm } from "fs/promises";
import { tmpdir } from "os";
import path from "path";

let store: SkillChainStore;
let testDir: string;

beforeEach(async () => {
  testDir = await mkdtemp(path.join(tmpdir(), "skill-chain-store-"));
  store = new SkillChainStore(testDir);
});

afterEach(async () => {
  await rm(testDir, { recursive: true, force: true });
});
```

---

## 4. SkillChainExecutor.test.ts（27テスト）

### 目的

SkillChainExecutor の 5 メソッド（executeChain, buildStepInput, evaluateCondition, extractOutput, renderTemplate）を検証する。

### 4.1 executeChain テスト（8テスト）

| #   | テスト名                                                  | 対応要件 | 検証内容                                             |
| --- | --------------------------------------------------------- | -------- | ---------------------------------------------------- |
| 1   | 3 ステップのチェーンを定義順に順次実行する                | FR-2-1   | results 配列の順序が steps 定義順と一致する          |
| 2   | チェーン全体の success が true（全ステップ成功時）        | FR-2-3   | SkillChainResult.success === true                    |
| 3   | 各ステップの duration が正数値で記録される                | FR-2-4   | 全 StepResult.duration >= 0                          |
| 4   | totalDuration が全ステップの duration 合計以上の値になる  | FR-2-5   | totalDuration >= sum(results.map(r => r.duration))   |
| 5   | initialVariables が chain.variables とマージされる        | FR-5-2   | initialVariables の値が chain.variables を上書きする |
| 6   | スキップされたステップの duration は undefined            | FR-3-6   | skipped ステップの duration === undefined            |
| 7   | finalVariables が最後の成功時点の状態を保持する           | NFR-3-1  | errorHandling="stop" で失敗時の変数が正しい          |
| 8   | 空の steps 配列でチェーンを実行すると success=true で返る | -        | results === [], totalDuration >= 0                   |

### 4.2 buildStepInput テスト（4テスト）

| #   | テスト名                                             | 対応要件 | 検証内容                                             |
| --- | ---------------------------------------------------- | -------- | ---------------------------------------------------- |
| 9   | type="literal" でリテラル値がそのまま入力される      | FR-5-3   | input.key === value で文字列/数値/オブジェクトに対応 |
| 10  | type="variable" で変数値が入力される                 | FR-5-2   | variables[variableName] の値が入力に設定される       |
| 11  | type="template" で Mustache テンプレートが展開される | FR-5-1   | "{{name}} のレポート" → "売上 のレポート"            |
| 12  | type="previousOutput" で前ステップの出力が入力される | FR-2-2   | context.previousOutput の値が入力に設定される        |

### 4.3 evaluateCondition テスト（7テスト）

| #   | テスト名                                                        | 対応要件 | 検証内容                                            |
| --- | --------------------------------------------------------------- | -------- | --------------------------------------------------- |
| 13  | condition 未指定時に true を返す                                | FR-3-1   | evaluateCondition(undefined, ctx) === true          |
| 14  | type="always" で true を返す                                    | FR-3-2   | evaluateCondition({ type: "always" }, ctx) === true |
| 15  | type="ifVariable" で変数値が期待値と一致する場合に true を返す  | FR-3-3   | status === "ok" で true                             |
| 16  | type="ifVariable" で変数値が期待値と不一致の場合に false を返す | FR-3-3   | status === "error" で false                         |
| 17  | type="ifPreviousSuccess" で前ステップ成功時に true を返す       | FR-3-4   | previousSuccess === true で true                    |
| 18  | type="ifPreviousSuccess" で前ステップ失敗時に false を返す      | FR-3-4   | previousSuccess === false で false                  |
| 19  | type="expression" でテンプレート展開後の式を安全に評価する      | FR-3-5   | "{{count}} > 0" + count=5 → true、count=0 → false   |

### 4.4 extractOutput テスト（3テスト）

| #   | テスト名                                     | 対応要件 | 検証内容                                      |
| --- | -------------------------------------------- | -------- | --------------------------------------------- |
| 20  | extractPath 指定時に JSONPath で値を抽出する | FR-6-1   | "$.data.items" で items 配列が抽出される      |
| 21  | extractPath 未指定時に出力全体を返す         | FR-6-2   | rawOutput がそのまま返される                  |
| 22  | variableName に抽出結果が格納される          | FR-5-4   | context.variables[variableName] === extracted |

### 4.5 エラーハンドリングテスト（5テスト）

| #   | テスト名                                                                 | 対応要件 | 検証内容                                                   |
| --- | ------------------------------------------------------------------------ | -------- | ---------------------------------------------------------- |
| 23  | errorHandling="stop" でステップ失敗時にチェーン全体を停止する            | FR-4-1   | results.length === 2（3番目は実行されない）、success=false |
| 24  | errorHandling="skip" でステップ失敗時にスキップして続行する              | FR-4-2   | results.length === 3、results[2].success === true          |
| 25  | errorHandling="retry" で retryCount 回リトライ後に停止する               | FR-4-3   | 合計 3 回実行（初回+2回リトライ）、success=false           |
| 26  | errorHandling="retry" でリトライ成功時にそのステップを成功として続行する | FR-4-4   | 2回目で成功、後続ステップも実行される                      |
| 27  | タイムアウト: timeout 超過時にタイムアウトエラーを返す                   | NFR-3-2  | StepResult.error にタイムアウトメッセージが設定される      |

### モック・テスト環境

```typescript
const mockSkillService = {
  executeSkill: vi.fn(),
};

let executor: SkillChainExecutor;

beforeEach(() => {
  vi.clearAllMocks();
  executor = new SkillChainExecutor(
    mockSkillService as unknown as SkillService,
  );
});
```

---

## 5. skillHandlers.chain.test.ts（21テスト）

### 目的

IPC チェーンハンドラ 5 チャネルの P42 準拠バリデーション、sender 検証、正常系/異常系レスポンスを検証する。

### 5.1 skill:chain:list テスト（2テスト）

| #   | テスト名                                  | 対応要件 | 検証内容                                             |
| --- | ----------------------------------------- | -------- | ---------------------------------------------------- |
| 1   | 正常系: 保存済みチェーン一覧を返す        | FR-7-1   | { success: true, data: [...] }                       |
| 2   | sender 検証: validateIpcSender が呼ばれる | FR-7-7   | validateIpcSender が event と options で呼び出される |

### 5.2 skill:chain:get テスト（4テスト）

| #   | テスト名                                                   | 対応要件 | 検証内容                                        |
| --- | ---------------------------------------------------------- | -------- | ----------------------------------------------- |
| 3   | 正常系: chainId 指定でチェーンを返す                       | FR-7-2   | { success: true, data: chain }                  |
| 4   | 異常系: 存在しない chainId で Chain not found エラー       | FR-7-2   | { success: false, error: "Chain not found" }    |
| 5   | P42: chainId が number 型でバリデーションエラー            | FR-7-6   | { success: false, error: "chainId must be..." } |
| 6   | P42: chainId が空文字列/スペースのみでバリデーションエラー | FR-7-6   | 空文字列 "" と " " の両方でエラー               |

### 5.3 skill:chain:save テスト（5テスト）

| #   | テスト名                                             | 対応要件 | 検証内容                                                 |
| --- | ---------------------------------------------------- | -------- | -------------------------------------------------------- |
| 7   | 正常系: 有効なチェーン定義を保存して返す             | FR-7-3   | { success: true, data: savedChain }                      |
| 8   | バリデーション: chain が null/undefined でエラー     | FR-7-6   | "chain must be an object"                                |
| 9   | バリデーション: chain.name が空文字列でエラー        | FR-7-6   | "chain.name must be a non-empty string"                  |
| 10  | バリデーション: chain.steps が空配列でエラー         | FR-7-6   | "chain.steps must be a non-empty array"                  |
| 11  | バリデーション: chain.errorHandling が不正値でエラー | FR-7-6   | "chain.errorHandling must be 'stop', 'skip', or 'retry'" |

### 5.4 skill:chain:delete テスト（3テスト）

| #   | テスト名                                               | 対応要件 | 検証内容                                    |
| --- | ------------------------------------------------------ | -------- | ------------------------------------------- |
| 12  | 正常系: 存在するチェーンを削除して deleted=true を返す | FR-7-4   | { success: true, data: { deleted: true } }  |
| 13  | 正常系: 存在しないチェーンで deleted=false を返す      | FR-7-4   | { success: true, data: { deleted: false } } |
| 14  | P42: chainId の 3 段バリデーションエラー               | FR-7-6   | typeof/空文字列/trim の各パターンでエラー   |

### 5.5 skill:chain:execute テスト（4テスト）

| #   | テスト名                                             | 対応要件 | 検証内容                                     |
| --- | ---------------------------------------------------- | -------- | -------------------------------------------- |
| 15  | 正常系: チェーンを実行して SkillChainResult を返す   | FR-7-5   | { success: true, data: result }              |
| 16  | 異常系: 存在しない chainId で Chain not found エラー | FR-7-5   | { success: false, error: "Chain not found" } |
| 17  | P42: args.chainId の 3 段バリデーションエラー        | FR-7-6   | typeof/空文字列/trim の各パターンでエラー    |
| 18  | バリデーション: variables が配列の場合にエラー       | FR-7-6   | "variables must be a plain object"           |

### 5.6 セキュリティテスト（3テスト）

| #   | テスト名                                                      | 対応要件 | 検証内容                                             |
| --- | ------------------------------------------------------------- | -------- | ---------------------------------------------------- |
| 19  | 全 5 チャネルで validateIpcSender が呼び出される              | FR-7-7   | 各ハンドラで validateIpcSender が正しく呼ばれる      |
| 20  | エラーサニタイズ: 内部パスが Renderer に返されない            | NFR-2-4  | sanitizeError が呼ばれ、パス情報がマスクされている   |
| 21  | P42: 全 chainId 引数チャネルで 3 段バリデーションが適用される | NFR-2-1  | get/delete/execute の全チャネルで 3 パターンのエラー |

### モック・テスト環境

```typescript
const mockSkillChainStore = {
  save: vi.fn(),
  get: vi.fn(),
  list: vi.fn(),
  delete: vi.fn(),
};

const mockSkillChainExecutor = {
  executeChain: vi.fn(),
};

const mockValidateIpcSender = vi.fn();
const mockSanitizeError = vi.fn((e: unknown) => "Sanitized error");

const mockEvent = {
  sender: { id: 1 },
  senderFrame: { url: "file:///app/index.html" },
} as unknown as Electron.IpcMainInvokeEvent;
```

---

## 6. テストカバレッジ目標

| 対象ファイル                     | Line     | Branch   | Function |
| -------------------------------- | -------- | -------- | -------- |
| skill-chain.ts（型定義）         | 100%     | N/A      | N/A      |
| SkillChainStore.ts               | 90%+     | 70%+     | 90%+     |
| SkillChainExecutor.ts            | 85%+     | 65%+     | 90%+     |
| skillHandlers.ts（チェーン部分） | 90%+     | 70%+     | 90%+     |
| **全体**                         | **80%+** | **60%+** | **80%+** |

---

## 7. テスト実行方法

```bash
# 型定義テスト
cd packages/shared && pnpm vitest run src/types/__tests__/skill-chain.test.ts

# SkillChainStore テスト
cd apps/desktop && pnpm vitest run src/main/services/skill/__tests__/SkillChainStore.test.ts

# SkillChainExecutor テスト
cd apps/desktop && pnpm vitest run src/main/services/skill/__tests__/SkillChainExecutor.test.ts

# IPC ハンドラテスト
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers.chain.test.ts

# 全テスト一括実行
cd apps/desktop && pnpm vitest run --reporter=verbose
```

---

## 8. FR/NFR とテストの対応マトリクス

| 要件 ID | テストファイル              | テスト番号     |
| ------- | --------------------------- | -------------- |
| FR-1-1  | SkillChainStore.test.ts     | #1, #2, #13    |
| FR-1-2  | SkillChainStore.test.ts     | #4             |
| FR-1-3  | SkillChainStore.test.ts     | #6, #7         |
| FR-1-4  | SkillChainStore.test.ts     | #3             |
| FR-1-5  | SkillChainStore.test.ts     | #8             |
| FR-1-6  | SkillChainStore.test.ts     | #5, #9         |
| FR-2-1  | SkillChainExecutor.test.ts  | #1             |
| FR-2-2  | SkillChainExecutor.test.ts  | #12            |
| FR-2-3  | SkillChainExecutor.test.ts  | #2             |
| FR-2-4  | SkillChainExecutor.test.ts  | #3             |
| FR-2-5  | SkillChainExecutor.test.ts  | #4             |
| FR-3-1  | SkillChainExecutor.test.ts  | #13            |
| FR-3-2  | SkillChainExecutor.test.ts  | #14            |
| FR-3-3  | SkillChainExecutor.test.ts  | #15, #16       |
| FR-3-4  | SkillChainExecutor.test.ts  | #17, #18       |
| FR-3-5  | SkillChainExecutor.test.ts  | #19            |
| FR-3-6  | SkillChainExecutor.test.ts  | #6             |
| FR-4-1  | SkillChainExecutor.test.ts  | #23            |
| FR-4-2  | SkillChainExecutor.test.ts  | #24            |
| FR-4-3  | SkillChainExecutor.test.ts  | #25            |
| FR-4-4  | SkillChainExecutor.test.ts  | #26            |
| FR-5-1  | SkillChainExecutor.test.ts  | #11            |
| FR-5-2  | SkillChainExecutor.test.ts  | #10            |
| FR-5-3  | SkillChainExecutor.test.ts  | #9             |
| FR-5-4  | SkillChainExecutor.test.ts  | #22            |
| FR-6-1  | SkillChainExecutor.test.ts  | #20            |
| FR-6-2  | SkillChainExecutor.test.ts  | #21            |
| FR-7-1  | skillHandlers.chain.test.ts | #1, #2         |
| FR-7-2  | skillHandlers.chain.test.ts | #3, #4, #5, #6 |
| FR-7-3  | skillHandlers.chain.test.ts | #7〜#11        |
| FR-7-4  | skillHandlers.chain.test.ts | #12, #13, #14  |
| FR-7-5  | skillHandlers.chain.test.ts | #15〜#18       |
| FR-7-6  | skillHandlers.chain.test.ts | #5,6,14,17,21  |
| FR-7-7  | skillHandlers.chain.test.ts | #2, #19        |
| NFR-2-1 | skillHandlers.chain.test.ts | #21            |
| NFR-2-3 | SkillChainStore.test.ts     | #11            |
| NFR-2-4 | skillHandlers.chain.test.ts | #20            |
| NFR-3-1 | SkillChainExecutor.test.ts  | #7             |
| NFR-3-2 | SkillChainExecutor.test.ts  | #27            |
| NFR-3-3 | SkillChainStore.test.ts     | #10, #12       |
| NFR-4-1 | skill-chain.test.ts         | #1〜#7         |
