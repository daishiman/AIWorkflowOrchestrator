# Phase 6: テスト拡充

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| Phase      | 6                                         |
| タスクID   | TASK-EMB-LATE-CHUNKING-TOKEN-PROVIDER-001 |
| ステータス | pending                                   |
| 作成日     | 2026-04-20                                |
| 前Phase    | 5: 実装（TDD GREEN）                      |
| 次Phase    | 7: カバレッジ確認                         |

## 目的

Phase 5 で Green 化した TP-01〜TP-05 の品質をさらに高めるため、以下の 4 つの観点でテストを拡充する。

1. TP-01〜TP-05 が全 PASS であることを改めて確認する
2. `MockTokenEmbeddingClient` 単体テストを追加する
3. 長文テキスト（`maxSequenceLength` を超える）での Late Chunking 動作を確認する
4. セグメント内ローカルトークン位置とグローバルトークン位置の変換を確認する

---

## 実行タスク

> 以下のタスクを順番に実行してください。

- TP-01〜TP-05 の全 PASS を再確認する
- `MockTokenEmbeddingClient` 単体テストを追加する
- 長文テキストでの Late Chunking 動作を確認する
- ローカルトークン位置とグローバル位置の変換を確認する
- 全テストの最終結果を記録する

### Step 1: TP-01〜TP-05 全 PASS 確認

**目的**: Phase 5 実装後の状態で TP-01〜TP-05 が全て PASS していることを確認する

**実行コマンド**:

```bash
pnpm --filter @repo/shared test -- --grep "token-level embeddings"
```

**確認事項**:

| テストID | テスト名                                                               | 期待結果 |
| -------- | ---------------------------------------------------------------------- | -------- |
| TP-01    | embed() が呼ばれず getTokenEmbeddings() が呼ばれる                     | PASS     |
| TP-02    | embed() がフォールバックとして呼ばれる                                 | PASS     |
| TP-03    | tokens.length === embeddings.length で型エラーなし                     | PASS     |
| TP-04    | 各チャンクに異なるベクトルが割り当てられる                             | PASS     |
| TP-05    | tokens と embeddings の長さが不一致のとき ChunkingError がスローされる | PASS     |

全 PASS を確認したら `outputs/phase-6/tp-all-pass-result.md` に実行ログを記録する。

---

### Step 2: `MockTokenEmbeddingClient` 単体テスト追加

**目的**: `MockTokenEmbeddingClient` が正しい形式の `TokenEmbeddingsResult` を返すことを単体テストで保証する

**追加先ファイル**:

```
packages/shared/src/services/embedding/providers/__tests__/mock-token-embedding-provider.test.ts
```

**追加するテスト（1件）**:

```typescript
import { describe, it, expect } from "vitest";
import { MockTokenEmbeddingClient } from "../mock-token-embedding-provider";

// TASK-EMB-LATE-CHUNKING-TOKEN-PROVIDER-001
// テストID: TP-MOCK-01
// 対象: MockTokenEmbeddingClient.getTokenEmbeddings()

describe("MockTokenEmbeddingClient", () => {
  describe("TP-MOCK-01: getTokenEmbeddings が正しい形式を返す", () => {
    it("tokens と embeddings の長さが一致する", async () => {
      // Arrange
      const client = new MockTokenEmbeddingClient();
      const text = "hello world foo";

      // Act
      const result = await client.getTokenEmbeddings(text);

      // Assert
      expect(result.tokens).toHaveLength(3);
      expect(result.embeddings).toHaveLength(3);
      expect(result.tokens.length).toBe(result.embeddings.length);
      // 各トークンのベクトル次元が一致していること
      const dim = result.embeddings[0].length;
      result.embeddings.forEach((vec) => {
        expect(vec).toHaveLength(dim);
      });
    });
  });
});
```

**実行コマンド**:

```bash
pnpm --filter @repo/shared test -- --grep "MockTokenEmbeddingClient"
```

---

### Step 3: 長文テキストでの Late Chunking 動作確認テスト追加

**目的**: `maxSequenceLength` を超える長文テキストに対して `applyLateChunking()` が正常動作することを確認する

**追加先ファイル**:

```
packages/shared/src/services/chunking/__tests__/chunking-service.integration.test.ts
```

**追加するテスト**:

```typescript
describe("長文テキスト（maxSequenceLength 超過）での Late Chunking 動作", () => {
  it("長文テキストでも各チャンクにベクトルが割り当てられる", async () => {
    // Arrange
    const client = new MockTokenEmbeddingClient();
    // maxSequenceLength（通常 512 トークン）を超える長文を生成する
    const longText = Array.from({ length: 600 }, (_, i) => `token${i}`).join(
      " ",
    );
    const chunks = [
      { start: 0, end: Math.floor(longText.length / 3) },
      {
        start: Math.floor(longText.length / 3) + 1,
        end: Math.floor((longText.length * 2) / 3),
      },
      {
        start: Math.floor((longText.length * 2) / 3) + 1,
        end: longText.length,
      },
    ];

    // Act
    const result = await service.applyLateChunking(client, longText, chunks);

    // Assert
    expect(result).toHaveLength(chunks.length);
    result.forEach((chunkResult) => {
      expect(chunkResult.vector).toBeDefined();
      expect(chunkResult.vector.length).toBeGreaterThan(0);
    });
  });
});
```

---

### Step 4: セグメント内ローカルトークン位置とグローバルトークン位置の変換テスト追加

**目的**: チャンク境界（グローバル文字列オフセット）とトークン隠れ状態インデックス（ローカルトークン位置）の変換が正しく行われることを確認する

**追加先ファイル**:

```
packages/shared/src/services/chunking/__tests__/chunking-service.integration.test.ts
```

**追加するテスト**:

```typescript
describe("セグメント内ローカルトークン位置とグローバルトークン位置の変換", () => {
  it("チャンク境界のグローバルオフセットが正しいトークンインデックスにマッピングされる", async () => {
    // Arrange
    // テキスト: "aa bb cc dd" (各トークン: aa=0, bb=1, cc=2, dd=3)
    // チャンク1: "aa bb" (グローバルオフセット 0-4)
    // チャンク2: "cc dd" (グローバルオフセット 6-10)
    const client = new MockTokenEmbeddingClient();
    const text = "aa bb cc dd";
    const chunks = [
      { start: 0, end: 5 }, // "aa bb"
      { start: 6, end: 11 }, // "cc dd"
    ];

    // Act
    const result = await service.applyLateChunking(client, text, chunks);

    // Assert
    expect(result).toHaveLength(2);
    // チャンク1のベクトルとチャンク2のベクトルが異なること（位置変換が機能している証拠）
    expect(result[0].vector).not.toEqual(result[1].vector);
    // 各チャンクのベクトルが定義されていること
    expect(result[0].vector).toBeDefined();
    expect(result[1].vector).toBeDefined();
  });
});
```

---

### Step 5: 全テスト最終確認

**実行コマンド**:

```bash
pnpm --filter @repo/shared test
```

全テストが PASS していることを確認し、`outputs/phase-6/test-expansion-result.md` に記録する。

---

## 参照資料

| 参照資料                          | パス                                                                                   | 内容                                  |
| --------------------------------- | -------------------------------------------------------------------------------------- | ------------------------------------- |
| インテグレーションテストファイル  | `packages/shared/src/services/chunking/__tests__/chunking-service.integration.test.ts` | TP-01〜TP-05 追記先・長文テスト追記先 |
| MockTokenEmbeddingClient          | `packages/shared/src/services/embedding/providers/mock-token-embedding-provider.ts`    | TP-MOCK-01 のテスト対象               |
| TokenEmbeddingsResult 型定義      | `packages/shared/src/services/chunking/types.ts`                                       | 型構造の参照                          |
| IEmbeddingClient インターフェース | `packages/shared/src/services/chunking/interfaces.ts`                                  | `getTokenEmbeddings?` の定義確認      |
| Phase 5 実装メモ                  | `outputs/phase-5/implementation-notes.md`                                              | トークン位置マッピングの実装判断参照  |

---

## 統合テスト連携【必須】

**Phase 6 の統合テスト連携アクション**:

- タスク1 で TP-01〜TP-05 全 PASS を改めて確認し、Phase 5 実装の品質を統合テストで保証する
- タスク2 で `MockTokenEmbeddingClient` 単体テスト（TP-MOCK-01）を追加し、テスト補助クラス自体の正確性を保証する
- タスク3 の長文テストにより、`maxSequenceLength` 境界での Late Chunking 動作を統合的に確認する
- タスク4 のトークン位置変換テストにより、グローバルオフセットとローカルトークンインデックスの対応を確認する
- 全追加テストが `pnpm --filter @repo/shared test` 全体実行で PASS することを確認する

---

## 多角的チェック観点

| 観点                          | チェック内容                                                                          |
| ----------------------------- | ------------------------------------------------------------------------------------- |
| TP-01〜TP-05 継続 PASS        | Phase 5 実装後も全 5 ケースが PASS しているか                                         |
| MockTokenEmbeddingClient 品質 | `tokens.length === embeddings.length` が実装レベルで保証されているか                  |
| 長文境界の堅牢性              | 600 トークン超のテキストでエラーなく動作するか                                        |
| トークン位置変換の正確性      | グローバルオフセット → ローカルトークンインデックスの変換が各チャンクで独立しているか |
| テスト独立性                  | 各追加テストが他テストの状態に依存せず独立して実行できるか                            |
| 既存テストへの影響            | テスト追加によって既存の非 Late Chunking テストが FAIL していないか                   |

---

## サブタスク管理

| サブタスクID | 内容                                                    | ステータス |
| ------------ | ------------------------------------------------------- | ---------- |
| ST-6-01      | TP-01〜TP-05 全 PASS 確認・実行ログ記録                 | 未実施     |
| ST-6-02      | `MockTokenEmbeddingClient` 単体テスト（TP-MOCK-01）追加 | 未実施     |
| ST-6-03      | 長文テキスト（maxSequenceLength 超過）テスト追加        | 未実施     |
| ST-6-04      | セグメント内ローカルトークン位置変換テスト追加          | 未実施     |
| ST-6-05      | 全テスト最終確認・結果記録                              | 未実施     |

---

## 成果物

| 成果物                          | パス                                                                                               | 内容                                   |
| ------------------------------- | -------------------------------------------------------------------------------------------------- | -------------------------------------- |
| MockTokenEmbeddingClient テスト | `packages/shared/src/services/embedding/providers/__tests__/mock-token-embedding-provider.test.ts` | TP-MOCK-01 単体テスト                  |
| 長文テスト追記                  | `packages/shared/src/services/chunking/__tests__/chunking-service.integration.test.ts`             | 長文・トークン位置変換テスト追記       |
| TP 全 PASS 確認ログ             | `outputs/phase-6/tp-all-pass-result.md`                                                            | TP-01〜TP-05 全 PASS の確認記録        |
| テスト拡充結果                  | `outputs/phase-6/test-expansion-result.md`                                                         | 追加テストを含む全テスト実行結果の記録 |

---

## 完了条件

- [ ] `pnpm --filter @repo/shared test -- --grep "token-level embeddings"` で TP-01〜TP-05 が全て PASS している
- [ ] `MockTokenEmbeddingClient` 単体テスト（TP-MOCK-01）が追加され PASS している
- [ ] 長文テキスト（600 トークン超）での Late Chunking 動作確認テストが追加され PASS している
- [ ] セグメント内ローカルトークン位置とグローバルトークン位置の変換テストが追加され PASS している
- [ ] `pnpm --filter @repo/shared test` 全体実行で既存テストが引き続き PASS している
- [ ] `outputs/phase-6/tp-all-pass-result.md` に TP-01〜TP-05 の実行ログが記録されている
- [ ] `outputs/phase-6/test-expansion-result.md` に追加テストを含む全テスト実行結果が記録されている

---

## タスク100%実行確認【必須】

- [ ] 本 Phase 内の全タスク（タスク1〜5）を 100% 実行完了した
- [ ] TP-01〜TP-05 全 PASS を `--grep "token-level embeddings"` フィルタで確認した
- [ ] `MockTokenEmbeddingClient` 単体テストが 1 件追加され PASS していることを確認した
- [ ] 長文テスト・トークン位置変換テストが追加され PASS していることを確認した
- [ ] 成果物（`tp-all-pass-result.md`・`test-expansion-result.md`）が全て生成されていることを確認した

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/TASK-EMB-LATE-CHUNKING-TOKEN-PROVIDER-001/phase-7-coverage.md`
