# Phase 4: テスト作成 - タスク仕様書

## メタ情報

| 項目       | 内容                         |
| ---------- | ---------------------------- |
| Phase      | 4                            |
| Phase名    | テスト作成                   |
| 前提Phase  | Phase 3                      |
| 後続Phase  | Phase 5                      |
| ステータス | 未実施                       |
| 作成日     | 2026-04-18                   |
| タスクID   | TASK-SC-LLM-PURPOSE-WIRE-001 |

---

## 目的

TDD の Red フェーズとして、Phase 5 実装前に失敗するテストを作成する。
purpose 抽出の LLM 呼び出し統合を検証するテストケース（TC-01〜TC-05）と
統合テストシナリオを全カテゴリで作成し、実装の正確性を保証する基盤を整備する。

## 背景

現状の `runCreateWorkflow` には LLM 呼び出しが実装されていないため、
本 Phase で作成するテストは Phase 5 実装完了まで Red（失敗）状態を維持する。
これにより実装の完了基準が明確になり、既存テストへの回帰も防止できる。

---

## 実行タスク

### タスク1: テストファイルの作成方針策定

**目的**: TDD Red フェーズの方針と、テストファイルの構造を確定する。

**実行手順**:

1. 既存のテストファイル（`SkillCreatorService.struct-001.test.ts`）のパターンを参照する
2. `vi.mock` による `ScriptExecutor`・`ResourceLoader`・`llmClient` のモック設計を確認する
3. テストファイルの配置先とファイル名を確定する
4. `describe` / `it` の構造を設計する

**テストファイル情報**:

| 項目                 | 内容                                                                                 |
| -------------------- | ------------------------------------------------------------------------------------ |
| ファイルパス         | `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.purpose.test.ts` |
| テストフレームワーク | Vitest (`vitest`)                                                                    |
| モック対象           | `ScriptExecutor`、`ResourceLoader`、`fs/promises`、`llmClient`（コンストラクタ注入） |
| TDD フェーズ         | Red（Phase 5 実装前は全テスト失敗を期待）                                            |

**describe 構造設計**:

```
describe("LLM-PURPOSE-WIRE-001: purpose 抽出 LLM 統合")
  ├─ describe("正常系: LLM による purpose 抽出")
  │    ├─ TC-01: extract-purpose エージェント定義が LLM に渡されることを確認
  │    ├─ TC-02: llmClient.generate の呼び出し引数を確認
  │    └─ TC-03: structurePlan.purpose に LLM 生成結果が格納されることを確認
  ├─ describe("異常系: LLM 呼び出し失敗時のエラーハンドリング")
  │    └─ TC-04: LLM 呼び出し失敗時のエラーハンドリング確認
  └─ describe("回帰: 既存テストへの影響なし")
       └─ TC-05: 既存テストへの回帰確認
```

**期待される成果物**:

- テストファイル配置・構造の確定

---

### タスク2: LLM モックの設計

**目的**: `llmClient` のモック化方法と、モックの振る舞いを設計する。

**実行手順**:

1. `LlmClient` インターフェース（Phase 2 設計）を確認する
2. `vi.fn()` を使用した `generate` モックの設計を確定する
3. `beforeEach` でのモック初期化パターンを設計する
4. 各テストケースで異なる `generate` 戻り値を設定する方法を設計する

**LLM モック設計**:

```typescript
// モックオブジェクト設計
const mockLlmClient = {
  generate: vi.fn<[{ system: string; user: string }], Promise<string>>(),
};

// beforeEach でのリセット
beforeEach(() => {
  vi.clearAllMocks();
  mockLlmClient.generate.mockResolvedValue(
    "このスキルはファイルを読み書きするためのスキルです",
  );
});

// サービスのインスタンス化（llmClient を注入）
service = new SkillCreatorService(undefined, undefined, mockLlmClient);
```

**期待される成果物**:

- LLM モック設計コード

---

### タスク3: テストケース一覧の作成

**目的**: TC-01〜TC-05 の各テストケースを詳細設計する。

**実行手順**:

1. 各テストケースの入力・期待動作・検証方法を設計する
2. モックの設定内容と検証内容を明確化する
3. 既存テストへの回帰確認（TC-05）の対象範囲を決定する

---

#### TC-01: extract-purpose エージェント定義が LLM に渡されることを確認

**目的**: AC-1 の検証。`loadAgent("extract-purpose")` の戻り値が `generate` の `system` に渡される。

**テスト設計**:

| 項目     | 内容                                                                         |
| -------- | ---------------------------------------------------------------------------- |
| 前提条件 | `mockResourceLoader.loadAgent` が `"mock-agent-definition"` を返す           |
| 実行     | `createSkill({ name: "test-skill", description: "...", mode: "create" })`    |
| 検証     | `mockLlmClient.generate` が `system: "mock-agent-definition"` で呼び出された |

**検証コード設計**:

```typescript
it("TC-01: extract-purpose エージェント定義が LLM の system prompt に渡される", async () => {
  mockResourceLoader.loadAgent.mockResolvedValue("mock-agent-definition");

  await service.createSkill({
    name: "test-skill",
    description: "テスト説明",
    mode: "create",
  });

  expect(mockLlmClient.generate).toHaveBeenCalledWith(
    expect.objectContaining({
      system: "mock-agent-definition",
    }),
  );
});
```

---

#### TC-02: llmClient.generate の呼び出し引数を確認

**目的**: AC-2 の検証。`generate` に正しい `{ system, user }` が渡される。

**テスト設計**:

| 項目     | 内容                                                                                                 |
| -------- | ---------------------------------------------------------------------------------------------------- |
| 前提条件 | `mockResourceLoader.loadAgent` が `"agent-def"` を返す                                               |
| 実行     | `createSkill({ name: "my-skill", description: "my description", mode: "create" })`                   |
| 検証     | `generate` が `{ system: "agent-def", user: "スキル名: my-skill\n説明: my description" }` で呼ばれた |

**検証コード設計**:

```typescript
it("TC-02: llmClient.generate が正しい system/user 引数で呼び出される", async () => {
  mockResourceLoader.loadAgent.mockResolvedValue("agent-def");

  await service.createSkill({
    name: "my-skill",
    description: "my description",
    mode: "create",
  });

  expect(mockLlmClient.generate).toHaveBeenCalledWith({
    system: "agent-def",
    user: "スキル名: my-skill\n説明: my description",
  });
});
```

---

#### TC-03: structurePlan.purpose に LLM 生成結果が格納されることを確認

**目的**: AC-3 の検証。`generate` の戻り値が `structurePlan.purpose` に格納される。

**テスト設計**:

| 項目     | 内容                                                                      |
| -------- | ------------------------------------------------------------------------- |
| 前提条件 | `mockLlmClient.generate` が `"LLM生成のpurpose文字列"` を返す             |
| 実行     | `runCreateWorkflow` を直接呼び出す（private メソッドアクセス）            |
| 検証     | 戻り値の `structurePlan.purpose` が `"LLM生成のpurpose文字列"` と一致する |

**検証コード設計**:

```typescript
it("TC-03: structurePlan.purpose に LLM 生成結果が格納される", async () => {
  const llmPurpose = "LLM生成のpurpose文字列";
  mockLlmClient.generate.mockResolvedValue(llmPurpose);
  mockResourceLoader.loadAgent.mockResolvedValue("agent-def");

  const structurePlan = await (
    service as unknown as {
      runCreateWorkflow: (
        opts: { name: string; description: string; mode: string },
        signal?: AbortSignal,
      ) => Promise<{ purpose: string } | null>;
    }
  ).runCreateWorkflow({
    name: "test-skill",
    description: "テスト説明",
    mode: "create",
  });

  expect(structurePlan?.purpose).toBe(llmPurpose);
});
```

---

#### TC-04: LLM 呼び出し失敗時のエラーハンドリング確認

**目的**: Phase 2 エラーハンドリング設計の検証。`generate` が失敗しても `createSkill` が継続する。

**テスト設計**:

| 項目     | 内容                                                                           |
| -------- | ------------------------------------------------------------------------------ |
| 前提条件 | `mockLlmClient.generate` が `new Error("LLM connection failed")` を throw する |
| 実行     | `createSkill({ name: "test-skill", description: "...", mode: "create" })`      |
| 検証     | `createSkill` が例外を throw せずスキルディレクトリパスを返す                  |

**検証コード設計**:

```typescript
it("TC-04: LLM 呼び出し失敗時も createSkill は成功する（フォールバック）", async () => {
  mockLlmClient.generate.mockRejectedValue(new Error("LLM connection failed"));

  await expect(
    service.createSkill({
      name: "test-skill",
      description: "テスト説明",
      mode: "create",
    }),
  ).resolves.toContain("test-skill");
});
```

---

#### TC-05: 既存テストへの回帰確認

**目的**: AC-6 の検証。`llmClient` なし（`undefined`）での動作が従来と変わらない。

**テスト設計**:

| 項目     | 内容                                                                        |
| -------- | --------------------------------------------------------------------------- |
| 前提条件 | `llmClient` を注入せずに `new SkillCreatorService()` でインスタンス化する   |
| 実行     | `createSkill({ name: "legacy-skill", description: "...", mode: "create" })` |
| 検証     | `createSkill` が正常に完了し、スキルディレクトリパスを返す                  |

**検証コード設計**:

```typescript
it("TC-05: llmClient なしでも createSkill が正常に動作する（後方互換）", async () => {
  const serviceWithoutLlm = new SkillCreatorService();

  await expect(
    serviceWithoutLlm.createSkill({
      name: "legacy-skill",
      description: "レガシースキル",
      mode: "create",
    }),
  ).resolves.toContain("legacy-skill");
});
```

---

### タスク4: 統合テストシナリオの全カテゴリ作成

**目的**: 統合テスト連携として、正常系・異常系・境界系の全カテゴリシナリオを作成する。

**実行手順**:

1. 正常系統合シナリオを設計する
2. 異常系統合シナリオを設計する
3. 境界系統合シナリオを設計する（Phase 6 での拡充対象を特定する）

**正常系統合シナリオ**:

| シナリオID | 説明                                                             | 検証ポイント                   |
| ---------- | ---------------------------------------------------------------- | ------------------------------ |
| IT-N-01    | `loadAgent` → `generate` → `structurePlan.purpose` の完全フロー  | 全統合ポイントが正しく連鎖する |
| IT-N-02    | `generate` の戻り値が `trim()` された上で `purpose` に格納される | 先頭末尾空白が除去される       |

**異常系統合シナリオ**:

| シナリオID | 説明                                                      | 検証ポイント                              |
| ---------- | --------------------------------------------------------- | ----------------------------------------- |
| IT-E-01    | `generate` 失敗時に `runCreateWorkflow` が `null` を返す  | `createSkill` が継続してスキルを作成する  |
| IT-E-02    | `loadAgent` 失敗時に `runCreateWorkflow` が `null` を返す | `createSkill` が継続してスキルを作成する  |
| IT-E-03    | AbortError 発生時に rethrow される                        | `createSkill` が AbortError を throw する |

**境界系統合シナリオ（Phase 6 での拡充対象）**:

| シナリオID | 説明                                 | Phase 6 テストケース |
| ---------- | ------------------------------------ | -------------------- |
| IT-B-01    | `generate` が空文字を返す            | TC-06                |
| IT-B-02    | `generate` が非常に長い文字列を返す  | TC-07                |
| IT-B-03    | エージェント定義ファイルが存在しない | TC-08                |
| IT-B-04    | `llmClient` が `undefined`           | TC-09                |
| IT-B-05    | collaborative モードへの回帰         | TC-10                |

**期待される成果物**:

- 統合テストシナリオ表（正常系・異常系・境界系）

---

## 参照資料

| 参照資料                  | パス                                                                                  | 内容                         |
| ------------------------- | ------------------------------------------------------------------------------------- | ---------------------------- |
| Phase 2 設計書            | docs/30-workflows/TASK-SC-LLM-PURPOSE-WIRE-001/phase-2-design.md                      | LLM 呼び出し設計・モック方針 |
| Phase 3 設計レビュー書    | docs/30-workflows/TASK-SC-LLM-PURPOSE-WIRE-001/phase-3-design-review.md               | 統合テスト観点チェックリスト |
| STRUCT-001 テスト（参考） | apps/desktop/src/main/services/skill/**tests**/SkillCreatorService.struct-001.test.ts | モックパターン参照           |
| SkillCreatorService       | apps/desktop/src/main/services/skill/SkillCreatorService.ts                           | 実装対象                     |

---

## 成果物

| 成果物                       | パス                                                                               | 内容                                 |
| ---------------------------- | ---------------------------------------------------------------------------------- | ------------------------------------ |
| purpose テストファイル       | apps/desktop/src/main/services/skill/**tests**/SkillCreatorService.purpose.test.ts | TC-01〜TC-05 + 統合テストシナリオ    |
| Phase 4 テスト設計書（本書） | docs/30-workflows/TASK-SC-LLM-PURPOSE-WIRE-001/phase-4-test-creation.md            | テスト設計・モック設計・シナリオ一覧 |

---

## 統合テスト連携

**Phase 4 アクション**: 統合テストシナリオを全カテゴリ（正常系・異常系・境界系）で作成する。

- TC-01〜TC-05 を `SkillCreatorService.purpose.test.ts` に実装する（Red フェーズ）
- IT-N-01〜IT-E-03 の統合シナリオを TC-01〜TC-05 のテストコードで網羅する
- IT-B-01〜IT-B-05 は Phase 6 での拡充対象として明記し、TC-06〜TC-10 にマッピングする
- Phase 5 実装完了後、全テストが Green になることを確認する

---

## 完了条件

- [ ] `SkillCreatorService.purpose.test.ts` が作成されている
- [ ] TC-01〜TC-05 が全てテストファイルに実装されている
- [ ] LLM モック（`mockLlmClient`）が `beforeEach` で正しく初期化される設計になっている
- [ ] Phase 5 実装前の時点で TC-01〜TC-05 が Red（失敗）状態であることが確認されている
- [ ] 統合テストシナリオ（正常系 IT-N-01〜02、異常系 IT-E-01〜03）が設計されている
- [ ] 境界系シナリオ（IT-B-01〜05）が Phase 6 対象として TC-06〜TC-10 にマッピングされている
