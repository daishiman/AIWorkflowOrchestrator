# Phase 2: 設計 -- テスト有効化のアプローチ設計

## メタ情報

| 項目       | 内容                                                 |
| ---------- | ---------------------------------------------------- |
| タスクID   | TASK-FIX-11-1-SDK-TEST-ENABLEMENT                    |
| Phase番号  | 2                                                    |
| Phase名    | 設計                                                 |
| 機能名     | sdk-test-enablement                                  |
| 目的       | テスト有効化のモック戦略・エラーシミュレーション設計 |
| 分類       | テスト品質改善                                       |
| 前提Phase  | Phase 1（要件定義）                                  |
| 後続Phase  | Phase 3（設計レビューゲート）                        |
| ステータス | 未実施                                               |
| ブランチ   | fix/task-fix-11-1-sdk-test-enablement                |
| 作成日     | 2026-02-13                                           |

---

## 目的

Phase 1 で定義した17箇所の TODO テスト有効化要件に基づき、各テストファイルに対する具体的なモック戦略、エラーシミュレーション設計、およびテスト実装パターンを策定する。既存の `vi.mock` / `vi.hoisted` パターンを最大限活用し、プロダクションコードを変更せずにテストを有効化する設計を行う。

---

## 依存関係

| 依存元  | 成果物                    | 用途                       |
| ------- | ------------------------- | -------------------------- |
| Phase 1 | `phase-1-requirements.md` | 要件（FR/NFR）の参照       |
| Phase 1 | FR-001 ~ FR-017           | テスト有効化対象の個別要件 |
| Phase 1 | AC-001 ~ AC-017           | 受入基準の参照             |

---

## 実行タスク

- モック分析: 既存の `vi.mock` / `vi.hoisted` 構成を整理し拡張点を特定する
- 実装設計: TODO 17箇所に対する有効化パターンを定義する
- リスク設計: P9/P13/P20 への対策を設計に組み込む
- 設計検証: 要件との整合性をチェックし実装可能性を確認する

### Task 1: 既存モックパターンの分析と活用設計

#### 既存モック構成の整理

各テストファイルで既に定義されているモック構成を整理し、有効化に必要な拡張ポイントを特定する。

##### skill-executor.test.ts のモック構成

```typescript
// 既存のモック定義（変更不要）
const mockAgentAPI = {
  query: vi.fn().mockResolvedValue({
    content: JSON.stringify({ changes: [] }),
    usage: { inputTokens: 100, outputTokens: 50 },
  }),
  abort: vi.fn(),
  getStatus: vi.fn().mockReturnValue("idle"),
  onMessage: vi.fn(() => () => {}),
};

vi.mock("../agent-client", () => ({
  getAgentAPI: vi.fn(() => mockAgentAPI),
  resetAgentAPI: vi.fn(),
}));
```

**拡張ポイント**:

| 拡張箇所                            | 目的                                               | 影響するTODO         |
| ----------------------------------- | -------------------------------------------------- | -------------------- |
| `mockAgentAPI.query` の条件分岐     | スキル名/projectPath の引数検証を可能にする        | SE-TODO-1, SE-TODO-2 |
| `mockAgentAPI.query` のタイムアウト | 30秒タイムアウトのシミュレーション                 | SE-TODO-3            |
| `mockAgentAPI.query` のエラー投げ   | API key not found / SDK failure のシミュレーション | SE-TODO-4, SE-TODO-5 |

##### agent-client.test.ts のモック構成

```typescript
// 既存のvi.hoistedモック（変更不要）
const { mockCreate } = vi.hoisted(() => {
  return { mockCreate: vi.fn() };
});

vi.mock("@anthropic-ai/sdk", () => ({
  default: vi.fn().mockImplementation(() => ({
    messages: { create: mockCreate },
  })),
}));

// Electron / electron-store モック（変更不要）
vi.mock("electron", () => ({
  safeStorage: {
    isEncryptionAvailable: vi.fn().mockReturnValue(true),
    encryptString: vi.fn((str) => Buffer.from(str).toString("base64")),
    decryptString: vi.fn((buffer) => buffer.toString()),
  },
}));
```

**拡張ポイント**:

| 拡張箇所                      | 目的                                     | 影響するTODO                    |
| ----------------------------- | ---------------------------------------- | ------------------------------- |
| `mockCreate` の引数キャプチャ | model, max_tokens, system 引数の検証     | AC-TODO-5, AC-TODO-6, AC-TODO-7 |
| `mockCreate` のエラー reject  | API エラー / 401 / 500 シミュレーション  | AC-TODO-1, AC-TODO-8, AC-TODO-9 |
| safeStorage モックの条件分岐  | API キー取得/フォールバック/未検出テスト | AC-TODO-2, AC-TODO-3, AC-TODO-4 |

##### sdk-integration.test.ts のモック構成

```typescript
// 既存のvi.hoistedモック（変更不要）
const { mockCreate } = vi.hoisted(() => {
  return { mockCreate: vi.fn() };
});

vi.mock("@anthropic-ai/sdk", () => ({
  default: vi.fn().mockImplementation(() => ({
    messages: { create: mockCreate },
  })),
}));
```

**拡張ポイント**:

| 拡張箇所                      | 目的                                  | 影響するTODO           |
| ----------------------------- | ------------------------------------- | ---------------------- |
| `mockCreate` のエラー reject  | 無効APIキー / SDK障害シミュレーション | INT-TODO-1, INT-TODO-2 |
| `mockCreate` の引数キャプチャ | SDK パラメータ検証                    | INT-TODO-3             |

### Task 2: テストファイル別の有効化設計

#### 2-1: skill-executor.test.ts の有効化設計

##### SE-TODO-1: mockAgentAPI.query のスキル名マッピング検証（SDK-SE-01）

**現状**: コメントアウトされた `expect(mockAgentAPI.query)` のアサーション

**設計**:

```typescript
// コメントアウトを解除し、以下のアサーションを有効化
expect(mockAgentAPI.query).toHaveBeenCalledWith(
  expect.objectContaining({
    prompt: expect.stringContaining(expectedSkillName),
  }),
);
```

**前提条件**: `skill-executor.ts` の `execute()` が内部で `agentAPI.query()` を呼び出す際、スキル名をプロンプトに含めていること。実装ファイルの `generateSkillPrompt()` 関数が `getSkillName()` の結果をプロンプトに含めることを確認済み。

##### SE-TODO-2: mockAgentAPI.query の projectPath コンテキスト検証（SDK-SE-02）

**現状**: コメントアウトされた `expect(mockAgentAPI.query)` のアサーション

**設計**:

```typescript
// コメントアウトを解除し、以下のアサーションを有効化
expect(mockAgentAPI.query).toHaveBeenCalledWith(
  expect.objectContaining({
    options: expect.objectContaining({
      systemPrompt: expect.stringContaining(customProjectPath),
    }),
  }),
);
```

**前提条件**: `skill-executor.ts` の `execute()` が `agentAPI.query()` に `systemPrompt` として projectPath を含めていること。

##### SE-TODO-3: 30秒タイムアウトテスト（SDK-SE-05）

**現状**: コメントアウトされた30秒タイムアウトテスト。現在は1秒で成功を返すだけ。

**設計**:

```typescript
it("SDK-SE-05: should handle SDK timeout error (30s)", async () => {
  // mockAgentAPI.queryをタイムアウトシミュレーション用にオーバーライド
  mockAgentAPI.query.mockImplementation(
    () =>
      new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error("Request timeout"));
        }, 30000);
      }),
  );

  const executor = createSkillExecutor();
  const resultPromise = executor.execute("html", testProjectPath);

  // 30秒後にタイムアウト
  await vi.advanceTimersByTimeAsync(30000);
  const result = await resultPromise;

  expect(result.success).toBe(false);
  expect(result.error).toContain("timeout");
});
```

**注意事項**: P13（タイマーテストの無限ループ）を考慮し、`advanceTimersByTime` で段階的にタイマーを進める。

##### SE-TODO-4: API key not found エラーテスト（SDK-SE-13）

**設計**:

```typescript
it("SDK-SE-13: should handle API key not found error", async () => {
  mockAgentAPI.query.mockRejectedValueOnce(new Error("API key not configured"));

  const executor = createSkillExecutor();
  const resultPromise = executor.execute("html", testProjectPath);
  await vi.advanceTimersByTimeAsync(1000);
  const result = await resultPromise;

  expect(result.success).toBe(false);
  expect(result.error).toContain("API key");
});
```

##### SE-TODO-5: SDK 呼び出し失敗エラーテスト（SDK-SE-14）

**設計**:

```typescript
it("SDK-SE-14: should handle SDK call failed error", async () => {
  mockAgentAPI.query.mockRejectedValueOnce(new Error("SDK call failed"));

  const executor = createSkillExecutor();
  const resultPromise = executor.execute("html", testProjectPath);
  await vi.advanceTimersByTimeAsync(1000);
  const result = await resultPromise;

  expect(result.success).toBe(false);
  expect(result.error).toBeDefined();
});
```

#### 2-2: agent-client.test.ts の有効化設計

##### AC-TODO-1: API エラーシミュレーション（AC-06）

**設計**:

```typescript
it("AC-06: should reject with SDK error when API call fails", async () => {
  const apiError = new Error("API request failed");
  (apiError as Record<string, unknown>).status = 400;
  mockCreate.mockRejectedValueOnce(apiError);

  const queryPromise = agentAPI.query({
    prompt: "Test prompt",
    options: { timeout: 30000 },
  });

  await expect(queryPromise).rejects.toThrow("API request failed");
});
```

##### AC-TODO-2: safeStorage API キー取得（SDK-AC-01）

**設計**:

```typescript
it("SDK-AC-01: should retrieve API key from safeStorage", async () => {
  const queryPromise = agentAPI.query({
    prompt: "Test prompt",
    options: { timeout: 30000 },
  });
  await vi.advanceTimersByTimeAsync(1000);
  await queryPromise;

  // mockCreateが呼び出されたことでSDKクライアントが初期化されている
  // = APIキーが取得されている
  expect(mockCreate).toHaveBeenCalled();
});
```

**注意**: safeStorage モックは既に設定済み。APIキーは `process.env.ANTHROPIC_API_KEY` から取得されるか、safeStorage から取得される。

##### AC-TODO-3: 環境変数フォールバック（SDK-AC-02）

**設計**:

```typescript
it("SDK-AC-02: should fallback to environment variable if safeStorage fails", async () => {
  // 環境変数が設定されている状態（beforeEachで設定済み）
  const queryPromise = agentAPI.query({
    prompt: "Test prompt",
    options: { timeout: 30000 },
  });
  await vi.advanceTimersByTimeAsync(1000);
  const response = await queryPromise;

  // 環境変数のAPIキーでSDKが動作していることを確認
  expect(response).toBeDefined();
  expect(mockCreate).toHaveBeenCalled();
});
```

##### AC-TODO-4: API キー未検出エラー（SDK-AC-03）

**設計**:

```typescript
it("SDK-AC-03: should throw error if API key not found", async () => {
  // 環境変数を削除
  delete process.env.ANTHROPIC_API_KEY;

  // 新しいインスタンスを作成
  resetAgentAPI();
  const newAgentAPI = getAgentAPI();

  const queryPromise = newAgentAPI.query({
    prompt: "Test prompt",
    options: { timeout: 30000 },
  });

  await expect(queryPromise).rejects.toThrow("API key not configured");
});
```

**注意**: EDGE-AC-08 テスト（L833）で同様のパターンが既に実装されており、これを参照する。

##### AC-TODO-5: モデル名検証（SDK-AC-04）

**設計**:

```typescript
it("SDK-AC-04: should use correct model (claude-sonnet-4-20250514)", async () => {
  const queryPromise = agentAPI.query({
    prompt: "Test prompt",
    options: { timeout: 30000 },
  });
  await vi.advanceTimersByTimeAsync(1000);
  await queryPromise;

  expect(mockCreate).toHaveBeenCalledWith(
    expect.objectContaining({
      model: "claude-sonnet-4-20250514",
    }),
    expect.anything(),
  );
});
```

##### AC-TODO-6: max_tokens 設定検証（SDK-AC-05）

**設計**:

```typescript
it("SDK-AC-05: should set max_tokens to 8192", async () => {
  const queryPromise = agentAPI.query({
    prompt: "Test prompt",
    options: { timeout: 30000 },
  });
  await vi.advanceTimersByTimeAsync(1000);
  await queryPromise;

  expect(mockCreate).toHaveBeenCalledWith(
    expect.objectContaining({
      max_tokens: 8192,
    }),
    expect.anything(),
  );
});
```

##### AC-TODO-7: systemPrompt 渡し検証（SDK-AC-06）

**設計**:

```typescript
it("SDK-AC-06: should pass systemPrompt to SDK", async () => {
  const systemPrompt = "You are a slide designer.";

  const queryPromise = agentAPI.query({
    prompt: "Test prompt",
    options: {
      systemPrompt,
      timeout: 30000,
    },
  });
  await vi.advanceTimersByTimeAsync(1000);
  await queryPromise;

  expect(mockCreate).toHaveBeenCalledWith(
    expect.objectContaining({
      system: systemPrompt,
    }),
    expect.anything(),
  );
});
```

##### AC-TODO-8: 401 Unauthorized ハンドリング（SDK-AC-09）

**設計**:

```typescript
it("SDK-AC-09: should handle SDK 401 Unauthorized error", async () => {
  const authError = new Error("Unauthorized");
  (authError as Record<string, unknown>).status = 401;
  mockCreate.mockRejectedValueOnce(authError);

  const queryPromise = agentAPI.query({
    prompt: "Test prompt",
    options: { timeout: 30000 },
  });

  await expect(queryPromise).rejects.toThrow("Unauthorized");

  // ステータスがerrorに変わることを確認
  expect(agentAPI.getStatus()).toBe("error");
});
```

##### AC-TODO-9: 500 Internal Server Error ハンドリング（SDK-AC-10）

**設計**:

```typescript
it("SDK-AC-10: should handle SDK 500 Internal Server Error", async () => {
  const serverError = new Error("Internal Server Error");
  (serverError as Record<string, unknown>).status = 500;
  mockCreate.mockRejectedValueOnce(serverError);

  const queryPromise = agentAPI.query({
    prompt: "Test prompt",
    options: { timeout: 30000 },
  });

  await expect(queryPromise).rejects.toThrow("Internal Server Error");

  // ステータスがerrorに変わることを確認
  expect(agentAPI.getStatus()).toBe("error");
});
```

#### 2-3: sdk-integration.test.ts の有効化設計

##### INT-TODO-1: 無効APIキーエラー検証（INT-02）

**設計**:

```typescript
it("INT-02: should fail with invalid API key", async () => {
  // 無効なAPIキーによるエラーをシミュレート
  const authError = new Error("Invalid API key");
  (authError as Record<string, unknown>).status = 401;
  mockCreate.mockRejectedValueOnce(authError);

  const projectPath = createTestProjectPath("invalid-auth");
  const resultPromise = executor.execute("html", projectPath);
  await vi.advanceTimersByTimeAsync(1000);
  const result = await resultPromise;

  expect(result.success).toBe(false);
  expect(result.error).toBeDefined();
});
```

##### INT-TODO-2: SDK 障害時エラーメッセージ検証（INT-05）

**設計**:

```typescript
it("INT-05: should display error message on SDK failure", async () => {
  // SDK障害をシミュレート
  mockCreate.mockRejectedValueOnce(new Error("SDK internal error"));

  const projectPath = createTestProjectPath("sdk-error");
  const resultPromise = executor.execute("html", projectPath);
  await vi.advanceTimersByTimeAsync(1000);
  const result = await resultPromise;

  expect(result.success).toBe(false);
  expect(result.error).toBeDefined();
  expect(typeof result.error).toBe("string");
});
```

##### INT-TODO-3: SDK パラメータ検証（SDK-INT-01）

**設計**:

```typescript
it("SDK-INT-01: should execute skill with correct SDK parameters", async () => {
  const projectPath = createTestProjectPath("sdk-params");

  const resultPromise = executor.execute("html", projectPath);
  await vi.advanceTimersByTimeAsync(1000);
  const result = await resultPromise;

  expect(result.success).toBe(true);

  // mockCreateがSDKパラメータで呼び出されたことを検証
  expect(mockCreate).toHaveBeenCalledWith(
    expect.objectContaining({
      model: expect.any(String),
      max_tokens: expect.any(Number),
      messages: expect.arrayContaining([
        expect.objectContaining({
          role: "user",
          content: expect.any(String),
        }),
      ]),
    }),
    expect.anything(),
  );
});
```

### Task 3: エラーシミュレーション設計

#### エラーカテゴリとシミュレーション方法

| エラーカテゴリ            | シミュレーション方法                                                       | 対象TODO                         |
| ------------------------- | -------------------------------------------------------------------------- | -------------------------------- |
| API key not found         | `process.env.ANTHROPIC_API_KEY` 削除 + `resetAgentAPI()`                   | SE-TODO-4, AC-TODO-4, INT-TODO-1 |
| API リクエスト失敗        | `mockCreate.mockRejectedValueOnce(new Error(...))`                         | SE-TODO-5, AC-TODO-1             |
| 401 Unauthorized          | `mockCreate.mockRejectedValueOnce()` + `status: 401`                       | AC-TODO-8                        |
| 500 Internal Server Error | `mockCreate.mockRejectedValueOnce()` + `status: 500`                       | AC-TODO-9                        |
| 30秒タイムアウト          | `mockAgentAPI.query` を遅延 Promise + `vi.advanceTimersByTimeAsync(30000)` | SE-TODO-3                        |
| SDK 内部障害              | `mockCreate.mockRejectedValueOnce(new Error("SDK error"))`                 | INT-TODO-2                       |

#### エラーオブジェクト構造

```typescript
// HTTPステータスエラー（401, 500）
interface SDKHttpError extends Error {
  status: number;
  message: string;
}

// APIキー未設定エラー
// message: "API key not configured"

// SDKタイムアウトエラー
// message: "Request timeout"

// SDK呼び出し失敗エラー
// message: "SDK call failed" | "SDK internal error"
```

### Task 4: モック戦略の設計原則

#### 設計原則

| 原則               | 説明                                                                           |
| ------------------ | ------------------------------------------------------------------------------ |
| 既存パターン活用   | 新規の `vi.mock` / `vi.hoisted` は追加しない                                   |
| テスト個別リセット | 各テストの `mockCreate.mockReset()` / `mockRejectedValueOnce()` でテスト間分離 |
| 型安全性           | `as Record<string, unknown>` でプロパティ追加（`any` 型禁止）                  |
| P13 準拠           | タイマーテストは `advanceTimersByTime` で段階的進行                            |
| P9 準拠            | テスト間で状態共有しない（`beforeEach` でリセット）                            |
| P20 準拠           | テスト環境でのログ出力を抑制                                                   |

#### mockCreate 引数検証パターン

`agent-client.test.ts` と `sdk-integration.test.ts` で共通して使用するパターン:

```typescript
// パターン1: 特定の引数フィールドを検証
expect(mockCreate).toHaveBeenCalledWith(
  expect.objectContaining({
    model: "claude-sonnet-4-20250514",
    max_tokens: 8192,
  }),
  expect.anything(), // options引数（signal等）
);

// パターン2: messages配列の内容を検証
expect(mockCreate).toHaveBeenCalledWith(
  expect.objectContaining({
    messages: expect.arrayContaining([
      expect.objectContaining({
        role: "user",
        content: expect.stringContaining("expected-content"),
      }),
    ]),
  }),
  expect.anything(),
);

// パターン3: systemフィールドの検証
expect(mockCreate).toHaveBeenCalledWith(
  expect.objectContaining({
    system: expect.stringContaining("expected-system-prompt"),
  }),
  expect.anything(),
);
```

#### mockAgentAPI.query 引数検証パターン

`skill-executor.test.ts` で使用するパターン:

```typescript
// パターン1: プロンプト内容の検証
expect(mockAgentAPI.query).toHaveBeenCalledWith(
  expect.objectContaining({
    prompt: expect.stringContaining("expected-skill-name"),
  }),
);

// パターン2: オプションの検証
expect(mockAgentAPI.query).toHaveBeenCalledWith(
  expect.objectContaining({
    options: expect.objectContaining({
      systemPrompt: expect.stringContaining("expected-path"),
    }),
  }),
);
```

### Task 5: テスト実行順序と依存関係

#### テスト有効化の推奨実行順序

| 順序 | ファイル                | 理由                                          |
| ---- | ----------------------- | --------------------------------------------- |
| 1    | agent-client.test.ts    | 最下層（SDK直接呼び出し）のテストを先に有効化 |
| 2    | skill-executor.test.ts  | agent-client に依存する上位層のテスト         |
| 3    | sdk-integration.test.ts | 統合テストとして最後に有効化                  |

#### 各テスト間の依存関係

```
agent-client.test.ts（SDK直接呼び出し層）
  └── skill-executor.test.ts（スキル実行層、agent-clientをモック）
      └── sdk-integration.test.ts（統合テスト、両者を組み合わせ）
```

**重要**: `skill-executor.test.ts` は `agent-client` をモックしているため、`agent-client.test.ts` の変更が直接影響することはない。ただし、モックの引数パターンが実装と一致している必要がある。

---

## 参照資料

| 参照資料               | パス                                                            | 内容                                            |
| ---------------------- | --------------------------------------------------------------- | ----------------------------------------------- |
| Phase 1 要件定義書     | `docs/30-workflows/sdk-test-enablement/phase-1-requirements.md` | FR/NFR・受入基準                                |
| skill-executor テスト  | `apps/desktop/src/main/slide/__tests__/skill-executor.test.ts`  | TODO 5箇所を含むテストファイル                  |
| agent-client テスト    | `apps/desktop/src/main/slide/__tests__/agent-client.test.ts`    | TODO 9箇所を含むテストファイル                  |
| sdk-integration テスト | `apps/desktop/src/main/slide/__tests__/sdk-integration.test.ts` | TODO 3箇所を含むテストファイル                  |
| skill-executor 実装    | `apps/desktop/src/main/slide/skill-executor.ts`                 | テスト対象の実装（execute, cancel, onProgress） |
| agent-client 実装      | `apps/desktop/src/main/slide/agent-client.ts`                   | テスト対象の実装（query, abort, getStatus）     |
| コード品質ルール       | `.claude/rules/02-code-quality.md`                              | テスト設計基準・`any`型禁止                     |
| 既知の落とし穴         | `.claude/rules/06-known-pitfalls.md`                            | P9, P13, P20（テスト関連注意事項）              |

---

## 実行手順

### Step 1: 既存モック構成の確認

1. 対象3ファイルの既存 `vi.mock` / `vi.hoisted` パターンを確認する
2. `beforeEach` / `afterEach` のリセット処理を確認する
3. 既存テスト（TODO以外）のモック利用パターンを参照する

### Step 2: テストファイル別の有効化設計

1. `agent-client.test.ts` の9箇所の有効化設計を策定する
2. `skill-executor.test.ts` の5箇所の有効化設計を策定する
3. `sdk-integration.test.ts` の3箇所の有効化設計を策定する

### Step 3: エラーシミュレーション設計

1. エラーカテゴリごとのシミュレーション方法を策定する
2. `mockCreate.mockRejectedValueOnce()` のエラーオブジェクト構造を定義する
3. タイムアウトテストのタイマー進行パターンを設計する

### Step 4: 設計検証

1. 既存テスト（EDGE-AC-08 等）と設計パターンの整合性を確認する
2. P13（タイマーテスト無限ループ）に該当するリスクを評価する
3. P9（テスト間状態リーク）に該当するリスクを評価する

### Step 5: 設計文書の作成

1. 全 Task の設計結果を本ファイルに記録する
2. モック拡張パターンのコードサンプルを記載する

---

## 成果物

| 成果物             | 説明                                             | 配置先                          |
| ------------------ | ------------------------------------------------ | ------------------------------- |
| テスト有効化設計書 | モック戦略・エラーシミュレーション・実装パターン | 本ファイル（phase-2-design.md） |

---

## 統合テスト連携

本タスクはテストコード自体の修正であり、統合テスト連携は `sdk-integration.test.ts` の TODO 有効化で直接対応する。有効化後の統合テストシナリオ（INT-02, INT-05, SDK-INT-01）が既存シナリオと整合することを確認する。

---

## 完了条件

- [ ] 既存モック構成（`vi.mock` / `vi.hoisted`）が全3ファイルで分析されている
- [ ] `skill-executor.test.ts` の5箇所に対する有効化設計が策定されている
- [ ] `agent-client.test.ts` の9箇所に対する有効化設計が策定されている
- [ ] `sdk-integration.test.ts` の3箇所に対する有効化設計が策定されている
- [ ] エラーシミュレーション設計（401/500/タイムアウト/API key not found/SDK failure）が策定されている
- [ ] モック拡張パターンのコードサンプルが記載されている
- [ ] P9（テスト間リーク）・P13（タイマー無限ループ）・P20（ログ出力汚染）のリスク評価が完了している
- [ ] テスト有効化の推奨実行順序が定義されている
- [ ] 本Phase内の全タスクを100%実行完了した

---

## 多角的チェック観点

タスクの性質に応じて、以下の観点を確認する。

| 観点               | 本タスクでの適用判断                                      | 仕様参照先                                                                                                                                                                                                                                    |
| ------------------ | --------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| セキュリティ       | APIキー・認証情報・エラー表示を扱うため適用               | `.claude/skills/aiworkflow-requirements/references/security-principles.md`, `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`                                                                                      |
| インターフェース   | SkillExecutor と Agent SDK の接続仕様確認が必要なため適用 | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md`, `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-executor.md`                                                                             |
| エラーハンドリング | timeout/API key not configured/SDK failure を扱うため適用 | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                                                                                                                                                                         |
| テスト品質         | TODO有効化・回帰防止・カバレッジ判定が必要なため適用      | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`, `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md`, `.claude/skills/aiworkflow-requirements/references/development-guidelines.md` |
| タスク運用         | 未タスク発生時の記録・追跡が必要なため適用                | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                                                                                                                                                                          |

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成して進捗管理する。

1. 参照資料の確認
2. 実行タスクの実施（各タスクごと）
3. 統合テスト連携の実施（Phase 1-11）
4. 成果物の作成・配置
5. 完了条件の検証

## タスク100%実行確認

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] `artifacts.json` が更新されている
- [ ] Phase末端アクションで完了を明記している

## 次Phase

**Phase 3: 設計レビューゲート** -- テスト有効化設計の妥当性検証
