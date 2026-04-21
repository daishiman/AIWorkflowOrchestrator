# Phase 4: テスト作成（TDD RED）

## メタ情報

| 項目       | 内容                                                                          |
| ---------- | ----------------------------------------------------------------------------- |
| Phase      | 4                                                                             |
| タスクID   | TASK-EMB-LATE-CHUNKING-TOKEN-PROVIDER-001                                     |
| ステータス | pending                                                                       |
| 作成日     | 2026-04-20                                                                    |
| 入力       | outputs/phase-3/gate-decision.md（進行可確認済み）, outputs/phase-2/design.md |

## 目的

TDD の Red フェーズとして、Late Chunking トークンレベル隠れ状態プロバイダーに対するインテグレーションテストを作成する。
この時点では `TokenEmbeddingsResult` 型・`IEmbeddingClient` 拡張・`MockTokenEmbeddingClient` が存在しないため、
テストはコンパイルエラーまたは実行時エラーで失敗する状態（Red）が正しい。
テストファイルの構造・命名・テストIDが設計と一致していることを確認し、Phase 5 の Green 化へ受け渡す。

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 事前確認（既存ユーティリティ重複検出）

**目的**: `getTokenEmbeddings` 関連の既存実装差分を把握し、重複実装を防ぐ

**実行手順**:

1. 以下のコマンドで既存の `getTokenEmbeddings` 実装を検索する

```bash
grep -rn "getTokenEmbeddings" packages/
grep -rn "TokenEmbeddingsResult" packages/
grep -rn "MockTokenEmbeddingClient" packages/
```

2. 既存実装が見つかった場合は、Phase 3 のゲート判断に立ち返り、差分実装対象を確定する
3. 差分対象が確定したら、タスク2へ進む

**期待される成果物**:

- 重複なし確認記録（`outputs/phase-4/duplicate-check.md`）

---

### タスク2: テストマトリクスの策定

**目的**: TP-01〜TP-05 のテストケースとテスト関数名の対応を確定する

**テストマトリクス**:

| 仕様番号 | テスト名                                                   | 検証対象                                    | 期待結果                                               |
| -------- | ---------------------------------------------------------- | ------------------------------------------- | ------------------------------------------------------ |
| TP-01    | `applyLateChunking` with getTokenEmbeddings client         | `getTokenEmbeddings` を持つクライアント     | `embed()` が呼ばれず `getTokenEmbeddings()` が呼ばれる |
| TP-02    | `applyLateChunking` fallback when no getTokenEmbeddings    | `getTokenEmbeddings` を持たないクライアント | フォールバックとして `embed()` が呼ばれる              |
| TP-03    | `MockTokenEmbeddingClient` tokens/embeddings length parity | `MockTokenEmbeddingClient`                  | `tokens.length === embeddings.length` で型エラーなし   |
| TP-04    | chunk boundary to token hidden state mapping               | チャンク境界とトークン隠れ状態の対応        | 各チャンクに異なるベクトルが割り当てられる             |
| TP-05    | `TokenEmbeddingsResult` lengths mismatch throws error      | lengths 不一致の検出                        | `ChunkingError` がスローされる                         |

依存する Phase 1 成果物:

- `outputs/phase-1/requirements.md`
- `outputs/phase-1/interface-inventory.md`

---

### タスク3: テストファイル作成（Red 状態）

**目的**: TP-01〜TP-05 のテストスケルトンを `chunking-service.integration.test.ts` に追記する

**テスト対象ファイル**:

```
packages/shared/src/services/chunking/__tests__/chunking-service.integration.test.ts
```

**private method テスト方針**:

`getTokenEmbeddings()` は `ChunkingService` の内部メソッドである。
直接テストするのではなく、公開 API である `applyLateChunking()` を経由してテストする。
これにより実装の詳細に依存しない堅牢なテストを維持する。

**テストコードスケルトン**:

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ChunkingService } from "../chunking-service";
import { MockTokenEmbeddingClient } from "../../embedding/providers/mock-token-embedding-provider";
import { ChunkingError } from "../types";

// TASK-EMB-LATE-CHUNKING-TOKEN-PROVIDER-001
// テストID: TP-01〜TP-05
// 対象: ChunkingService.applyLateChunking() - トークンレベル隠れ状態プロバイダー

describe("Late Chunking with token-level embeddings", () => {
  let service: ChunkingService;

  beforeEach(() => {
    service = new ChunkingService();
  });

  describe("TP-01: getTokenEmbeddings を持つクライアントで Late Chunking 適用", () => {
    it("embed() が呼ばれず getTokenEmbeddings() が呼ばれる", async () => {
      // Arrange
      const mockEmbed = vi.fn();
      const mockGetTokenEmbeddings = vi.fn().mockResolvedValue({
        tokens: ["Hello", "world"],
        embeddings: [
          [0.1, 0.2, 0.3],
          [0.4, 0.5, 0.6],
        ],
      });
      const client = {
        embed: mockEmbed,
        getTokenEmbeddings: mockGetTokenEmbeddings,
      };
      const text = "Hello world";
      const chunks = [
        { start: 0, end: 5 },
        { start: 6, end: 11 },
      ];

      // Act
      await service.applyLateChunking(client, text, chunks);

      // Assert
      expect(mockGetTokenEmbeddings).toHaveBeenCalledOnce();
      expect(mockEmbed).not.toHaveBeenCalled();
    });
  });

  describe("TP-02: getTokenEmbeddings を持たないクライアントはフォールバック", () => {
    it("embed() がフォールバックとして呼ばれる", async () => {
      // Arrange
      const mockEmbed = vi.fn().mockResolvedValue([[0.1, 0.2, 0.3]]);
      const client = { embed: mockEmbed };
      const text = "Hello world";
      const chunks = [{ start: 0, end: 5 }];

      // Act
      await service.applyLateChunking(client, text, chunks);

      // Assert
      expect(mockEmbed).toHaveBeenCalled();
    });
  });

  describe("TP-03: MockTokenEmbeddingClient の型整合性", () => {
    it("tokens.length === embeddings.length で型エラーなし", async () => {
      // Arrange
      const client = new MockTokenEmbeddingClient();
      const text = "foo bar baz";

      // Act
      const result = await client.getTokenEmbeddings(text);

      // Assert
      expect(result.tokens.length).toBe(result.embeddings.length);
    });
  });

  describe("TP-04: チャンク境界とトークン隠れ状態の対応確認", () => {
    it("各チャンクに異なるベクトルが割り当てられる", async () => {
      // Arrange
      const client = new MockTokenEmbeddingClient();
      const text = "chunk one. chunk two.";
      const chunks = [
        { start: 0, end: 10 },
        { start: 11, end: 20 },
      ];

      // Act
      const result = await service.applyLateChunking(client, text, chunks);

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0].vector).not.toEqual(result[1].vector);
    });
  });

  describe("TP-05: TokenEmbeddingsResult の lengths 不一致エラー", () => {
    it("tokens と embeddings の長さが不一致のとき ChunkingError がスローされる", async () => {
      // Arrange
      const mockGetTokenEmbeddings = vi.fn().mockResolvedValue({
        tokens: ["a", "b", "c"], // length: 3
        embeddings: [[0.1], [0.2]], // length: 2 → 不一致
      });
      const client = {
        embed: vi.fn(),
        getTokenEmbeddings: mockGetTokenEmbeddings,
      };
      const text = "a b c";
      const chunks = [{ start: 0, end: 5 }];

      // Act & Assert
      await expect(
        service.applyLateChunking(client, text, chunks),
      ).rejects.toThrow(ChunkingError);
    });
  });
});
```

**実行手順**:

1. `packages/shared/src/services/chunking/__tests__/chunking-service.integration.test.ts` に上記スケルトンを追記する
2. `pnpm --filter @repo/shared test` を実行し、コンパイルエラーまたは `ChunkingError`・`MockTokenEmbeddingClient` の未定義による FAIL を確認する（Red 状態の確認）
3. インポートエラー以外のモック設定エラーが発生していないことを確認する
4. FAIL 内容を `outputs/phase-4/red-test-result.md` に記録する

---

## 参照資料

| 参照資料             | パス                                                                                   | 内容                              |
| -------------------- | -------------------------------------------------------------------------------------- | --------------------------------- |
| テスト対象ファイル   | `packages/shared/src/services/chunking/__tests__/chunking-service.integration.test.ts` | 追記先テストファイル              |
| ChunkingService 実装 | `packages/shared/src/services/chunking/chunking-service.ts`                            | `applyLateChunking` 公開 API 参照 |
| 既存インターフェース | `packages/shared/src/services/chunking/interfaces.ts`                                  | `IEmbeddingClient` 現行定義       |
| 既存型定義           | `packages/shared/src/services/chunking/types.ts`                                       | `ChunkingError` 参照              |
| Phase 2 設計書       | `outputs/phase-2/design.md`                                                            | Late Chunking 設計方針            |

---

## 統合テスト連携【必須】

**Phase 4 の統合テスト連携アクション**:

- 新規テストは `chunking-service.integration.test.ts` に追記し、既存インテグレーションテストと同一ファイルで管理する
- `applyLateChunking()` を経由した E2E 観点のテストを全 5 ケース（TP-01〜TP-05）で実施する
- 本 Phase 完了後、Red 状態のままで Phase 5 へ引き渡す（Green 化は Phase 5 で実施）
- 既存テスト群（`pnpm --filter @repo/shared test` 全体）への影響がないことを確認する

---

## 多角的チェック観点

| 観点                | チェック内容                                                                             |
| ------------------- | ---------------------------------------------------------------------------------------- |
| Red 状態の正確性    | コンパイルエラー・モジュール未定義によって FAIL しているか（ロジックエラーではないか）   |
| private method 迂回 | `getTokenEmbeddings` 内部メソッドを直接呼ばず `applyLateChunking()` 経由で検証しているか |
| フォールバック網羅  | TP-02 のフォールバックパスが `embed()` を呼ぶことを確認できる構造になっているか          |
| 型安全性            | TP-03 が `MockTokenEmbeddingClient` の戻り値型を実行時ではなく静的に検証できているか     |
| エラー型の正確性    | TP-05 が `ChunkingError` の具体型でスローを検証しているか（`Error` 汎用型でないか）      |
| 既存テストへの影響  | スケルトン追記により既存テスト群が FAIL していないか                                     |

---

## サブタスク管理

| サブタスクID | 内容                                    | ステータス |
| ------------ | --------------------------------------- | ---------- |
| ST-4-01      | 既存ユーティリティ重複検出（grep 実行） | 未実施     |
| ST-4-02      | テストマトリクス確定（TP-01〜TP-05）    | 未実施     |
| ST-4-03      | テストスケルトン追記                    | 未実施     |
| ST-4-04      | Red 状態確認・実行ログ記録              | 未実施     |
| ST-4-05      | 既存テスト回帰確認（全体 PASS）         | 未実施     |

---

## 成果物

| 成果物                 | パス                                                                                   | 内容                                  |
| ---------------------- | -------------------------------------------------------------------------------------- | ------------------------------------- |
| 更新済みテストファイル | `packages/shared/src/services/chunking/__tests__/chunking-service.integration.test.ts` | TP-01〜TP-05 スケルトン追記           |
| 重複確認記録           | `outputs/phase-4/duplicate-check.md`                                                   | grep 実行結果と重複なし確認           |
| テストシナリオ一覧     | `outputs/phase-4/test-scenarios.md`                                                    | TP-01〜TP-05 のシナリオ・期待結果一覧 |
| Red 状態確認ログ       | `outputs/phase-4/red-test-result.md`                                                   | FAIL 内容・エラーメッセージの記録     |

---

## 完了条件

- [ ] `grep -rn "getTokenEmbeddings" packages/` を実行し、重複実装がないことを確認した
- [ ] テストマトリクス（TP-01〜TP-05）が `test-scenarios.md` に記録されている
- [ ] `chunking-service.integration.test.ts` に TP-01〜TP-05 のスケルトンが追記されている
- [ ] `pnpm --filter @repo/shared test` 実行でコンパイルエラー・モジュール未定義による FAIL を確認した（Red 状態）
- [ ] モック設定エラー・テスト構造エラー以外の FAIL がないことを確認した
- [ ] `red-test-result.md` に FAIL 内容が記録されている
- [ ] 既存テスト群が引き続き PASS している（新規スケルトン追記の副作用なし）

---

## タスク100%実行確認【必須】

1. `grep -rn "getTokenEmbeddings" packages/` を実行して重複実装がないことを確認したか
2. TP-01〜TP-05 の全テストケースがスケルトンとして追記されているか
3. 各テストケースのテストIDと仕様番号が対応しているか
4. `applyLateChunking()` 経由でテストしており、private method を直接呼んでいないか
5. Red 状態（コンパイルエラー・未定義エラー）であることを実行ログで確認したか
6. `red-test-result.md` にエラー内容・実行日時を記録したか
7. 既存テストが全 PASS であることを確認したか

---

## 次のPhase

Phase 5（実装 Green）へ進む。
`TokenEmbeddingsResult` 型追加・`IEmbeddingClient` 拡張・`ChunkingService` フォールバック実装・`MockTokenEmbeddingClient` 作成を行い、TP-01〜TP-05 を全て PASS させる。
