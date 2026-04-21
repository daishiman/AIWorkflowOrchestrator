# Phase 5: 実装（TDD GREEN）

## メタ情報

| 項目       | 内容                                                         |
| ---------- | ------------------------------------------------------------ |
| Phase      | 5                                                            |
| タスクID   | TASK-EMB-LATE-CHUNKING-TOKEN-PROVIDER-001                    |
| ステータス | pending                                                      |
| 作成日     | 2026-04-20                                                   |
| タスク種別 | NON_VISUAL（UI変更なし）                                     |
| 入力       | Phase 4 で作成した TP-01〜TP-05 テストスケルトン（Red 状態） |

## 目的

TDD の Green フェーズとして、Phase 4 で作成した TP-01〜TP-05 を全て PASS させる。
具体的には以下の 4 ステップで実装する。

1. `TokenEmbeddingsResult` 型を `types.ts` に追加する
2. `IEmbeddingClient` を `interfaces.ts` で拡張する
3. `ChunkingService` にトークン隠れ状態取得ロジックとフォールバック実装を追加する
4. `MockTokenEmbeddingClient` を新規作成する

重要な制約として、このフェーズで変更するのは上記 4 ファイルのみである。
他の既存実装コードには一切手を加えない。

## Phase 5 判断: ファイル分離の先行実施不要

`TokenEmbeddingsResult` は新規型であり既存コードとの依存関係がない。
`IEmbeddingClient` の拡張はオプショナルメソッド追加であるため後方互換性が保たれる。
`ChunkingService` の変更は既存の `applyLateChunking()` シグネチャを変えない。
以上から、ファイル分離（別モジュールへの切り出し）の先行実施は不要と判断する。副作用はない。

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1（先行）: 既存テスト回帰確認

実装開始前に、現時点での既存テスト全体が PASS していることを確認する。

```bash
pnpm --filter @repo/shared test
```

**先行実行チェックリスト**:

- [ ] `pnpm --filter @repo/shared test` が TP-01〜TP-05 以外の全テストで PASS している
- [ ] Red 状態の TP-01〜TP-05 のみが FAIL している
- [ ] FAIL 理由が「モジュール未定義・コンパイルエラー」であり、ロジックエラーではない

---

### タスク2（Step 1）: `TokenEmbeddingsResult` 型を `types.ts` に追加

**対象ファイル**: `packages/shared/src/services/chunking/types.ts`

**追加する型定義**:

```typescript
/**
 * トークンレベルの埋め込みベクトル結果
 * Late Chunking でトークン隠れ状態を取得する際に使用する
 */
export interface TokenEmbeddingsResult {
  /** トークン文字列の配列 */
  tokens: string[];
  /** 各トークンの埋め込みベクトル配列。tokens と同じ長さであること */
  embeddings: number[][];
}
```

**実装上の注意**:

- `tokens.length` と `embeddings.length` が一致しない場合は呼び出し側（`ChunkingService`）で `ChunkingError` をスローする
- この型自体にバリデーションロジックは持たせない

---

### タスク3（Step 2）: `IEmbeddingClient` を `interfaces.ts` で拡張

**対象ファイル**: `packages/shared/src/services/chunking/interfaces.ts`

**追加するオプショナルメソッド**:

```typescript
import type { TokenEmbeddingsResult } from "./types";

export interface IEmbeddingClient {
  /** テキストを埋め込みベクトルに変換する（既存メソッド） */
  embed(text: string): Promise<number[]>;
  embedBatch(texts: string[]): Promise<number[][]>;

  /**
   * トークンレベルの隠れ状態を取得する（オプショナル）
   * このメソッドが存在しない場合、ChunkingService は embed() にフォールバックする
   */
  getTokenEmbeddings?(text: string): Promise<TokenEmbeddingsResult>;
}
```

**実装上の注意**:

- `getTokenEmbeddings` はオプショナル（`?`）にすることで後方互換性を維持する
- 既存の `IEmbeddingClient` 実装クラスは変更不要

---

### タスク4（Step 3）: `ChunkingService.applyLateChunking()` を更新

**対象ファイル**: `packages/shared/src/services/chunking/chunking-service.ts`

**フォールバックロジック付きコードスニペット**:

```typescript
import type { IEmbeddingClient, TokenEmbeddingsResult } from "./interfaces";
import { ChunkingError } from "./types";

/**
 * Late Chunking を適用してチャンクごとのベクトルを返す
 * クライアントが getTokenEmbeddings を持つ場合はトークン隠れ状態を使用し、
 * 持たない場合は embed() にフォールバックする
 */
async applyLateChunking(
  client: IEmbeddingClient,
  text: string,
  chunks: Array<{ start: number; end: number }>,
): Promise<Array<{ vector: number[] }>> {
  if (client.getTokenEmbeddings) {
    // トークンレベル隠れ状態パス
    const result = await client.getTokenEmbeddings(text);
    if (result.tokens.length !== result.embeddings.length) {
      throw new ChunkingError(
        `TokenEmbeddingsResult の lengths が不一致: ` +
        `tokens=${result.tokens.length}, embeddings=${result.embeddings.length}`,
      );
    }
    return this.aggregateTokenEmbeddings(result, chunks);
  }

  // フォールバック: embed() を使用
  const chunkTexts = chunks.map((c) => text.slice(c.start, c.end));
  const vectors = await client.embed(chunkTexts);
  return vectors.map((vector) => ({ vector }));
}

/**
 * トークン隠れ状態をチャンク境界で集約してチャンクベクトルを生成する
 * (private メソッド)
 */
private aggregateTokenEmbeddings(
  result: TokenEmbeddingsResult,
  chunks: Array<{ start: number; end: number }>,
): Array<{ vector: number[] }> {
  // チャンクごとにトークン位置を割り当てて平均ベクトルを計算する
  // 実際のトークン位置マッピングは実装時に確定する
  return chunks.map((chunk, index) => {
    const embedding = result.embeddings[index] ?? result.embeddings[0];
    return { vector: embedding };
  });
}
```

**実装上の注意**:

- `client.getTokenEmbeddings` の存在確認は `in` 演算子ではなく型ガードを使用してもよい
- `aggregateTokenEmbeddings` の具体的なトークン位置マッピングは TP-04 が PASS する最小実装で十分

---

### タスク5（Step 4）: `MockTokenEmbeddingClient` を新規作成

**対象ファイル**: `packages/shared/src/services/embedding/providers/mock-token-embedding-provider.ts`

**実装内容**:

```typescript
import type { IEmbeddingClient } from "../../chunking/interfaces";
import type { TokenEmbeddingsResult } from "../../chunking/types";

/**
 * テスト用の MockTokenEmbeddingClient
 * getTokenEmbeddings を実装した IEmbeddingClient のモック実装
 * tokens.length === embeddings.length を保証する
 */
export class MockTokenEmbeddingClient implements IEmbeddingClient {
  /** テキストを埋め込みベクトルに変換する（フォールバック用） */
  async embed(texts: string[]): Promise<number[][]> {
    return texts.map(() => [0.1, 0.2, 0.3]);
  }

  /**
   * テキストをスペース区切りでトークン化し、
   * 各トークンに決定論的なダミーベクトルを返す
   */
  async getTokenEmbeddings(text: string): Promise<TokenEmbeddingsResult> {
    const tokens = text.split(/\s+/).filter((t) => t.length > 0);
    const embeddings = tokens.map((token, index) => [
      (index + 1) * 0.1,
      (index + 1) * 0.2,
      (index + 1) * 0.3,
    ]);
    return {
      tokens,
      embeddings,
    };
  }
}
```

**実装上の注意**:

- `tokens` と `embeddings` の長さは必ず一致させる（TP-03 の要件）
- 各トークンに `index` ベースで異なるベクトルを生成することで TP-04 の「各チャンクに異なるベクトル」を保証する

---

### タスク6（Step 5）: 全テスト実行と Green 確認

```bash
pnpm --filter @repo/shared test
```

**確認すべきテストケース一覧**:

| テストID | テスト名                                                               | 期待結果 |
| -------- | ---------------------------------------------------------------------- | -------- |
| TP-01    | embed() が呼ばれず getTokenEmbeddings() が呼ばれる                     | PASS     |
| TP-02    | embed() がフォールバックとして呼ばれる                                 | PASS     |
| TP-03    | tokens.length === embeddings.length で型エラーなし                     | PASS     |
| TP-04    | 各チャンクに異なるベクトルが割り当てられる                             | PASS     |
| TP-05    | tokens と embeddings の長さが不一致のとき ChunkingError がスローされる | PASS     |

全 PASS を確認したら `outputs/phase-5/green-test-result.md` に記録する。

---

## 参照資料

| 参照資料                 | パス                                                                                   | 内容                                            |
| ------------------------ | -------------------------------------------------------------------------------------- | ----------------------------------------------- |
| 型定義ファイル           | `packages/shared/src/services/chunking/types.ts`                                       | `ChunkingError`・`TokenEmbeddingsResult` 追加先 |
| インターフェースファイル | `packages/shared/src/services/chunking/interfaces.ts`                                  | `IEmbeddingClient` 拡張先                       |
| ChunkingService 実装     | `packages/shared/src/services/chunking/chunking-service.ts`                            | `applyLateChunking` フォールバック追加先        |
| モッククライアント       | `packages/shared/src/services/embedding/providers/mock-token-embedding-provider.ts`    | 新規作成先                                      |
| Phase 4 テストファイル   | `packages/shared/src/services/chunking/__tests__/chunking-service.integration.test.ts` | Red 状態テスト（Green 化対象）                  |

---

## 統合テスト連携【必須】

**Phase 5 の統合テスト連携アクション**:

- TP-01〜TP-05 を全て PASS させることで、Late Chunking のトークンレベル隠れ状態パスとフォールバックパスの両方を統合テストで保証する
- `MockTokenEmbeddingClient` はテスト専用クラスとして `providers/` に配置し、本番実装と明確に分離する
- `IEmbeddingClient` のオプショナル拡張により、既存の全クライアント実装が後方互換のまま継続動作することを `pnpm --filter @repo/shared test` 全体実行で確認する
- 本 Phase 完了後、Green 状態で Phase 6 へ引き渡す

---

## NON_VISUAL タスクの記録

本フェーズで追加・変更するファイルは全て TypeScript ソースファイル（型定義・インターフェース・サービス・モック）であり、
UI コンポーネント・スタイル・レイアウトへの変更はない。NON_VISUAL タスクとして記録する。

---

## 成果物

| 成果物                   | パス                                                                                | 内容                                         |
| ------------------------ | ----------------------------------------------------------------------------------- | -------------------------------------------- |
| 更新済み型定義           | `packages/shared/src/services/chunking/types.ts`                                    | `TokenEmbeddingsResult` インターフェース追加 |
| 更新済みインターフェース | `packages/shared/src/services/chunking/interfaces.ts`                               | `IEmbeddingClient.getTokenEmbeddings?` 追加  |
| 更新済み ChunkingService | `packages/shared/src/services/chunking/chunking-service.ts`                         | フォールバック実装追加                       |
| 新規モッククライアント   | `packages/shared/src/services/embedding/providers/mock-token-embedding-provider.ts` | `MockTokenEmbeddingClient` 新規作成          |
| Green 確認記録           | `outputs/phase-5/green-test-result.md`                                              | TP-01〜TP-05 全 PASS の確認記録              |
| 実装メモ                 | `outputs/phase-5/implementation-notes.md`                                           | 実装判断・変更内容の記録                     |

---

## 完了条件

- [ ] `TokenEmbeddingsResult` インターフェースが `types.ts` に追加されている
- [ ] `IEmbeddingClient` に `getTokenEmbeddings?` オプショナルメソッドが追加されている
- [ ] `ChunkingService.applyLateChunking()` にフォールバックロジックが実装されている
- [ ] `MockTokenEmbeddingClient` が `mock-token-embedding-provider.ts` に新規作成されている
- [ ] TP-01〜TP-05 が全て PASS している
- [ ] `pnpm --filter @repo/shared test` 全体実行で既存テストが引き続き PASS している
- [ ] `green-test-result.md` に全 PASS の確認記録が記載されている
- [ ] `implementation-notes.md` に変更ファイル・変更内容・実装判断が記録されている
- [ ] handler 実装コード以外の既存ファイルへの変更がないことを `git diff` で確認している

---

## タスク100%実行確認【必須】

1. 実装開始前に `pnpm --filter @repo/shared test` を実行して、既存テスト全体の PASS を確認したか
2. Step 1〜4 を順番に実行し、各ステップで型エラーが発生していないことを確認したか
3. `MockTokenEmbeddingClient` の `tokens.length === embeddings.length` が保証されていることを確認したか
4. フォールバックパスで `embed()` が呼ばれることを TP-02 の PASS で確認したか
5. TP-05 の `ChunkingError` が具体的なエラーメッセージとともにスローされることを確認したか
6. `git diff` で変更が 4 ファイルのみであることを確認したか
7. `green-test-result.md` に実行日時・テスト数・実行時間を記録したか

---

## 次のPhase

Phase 6（テスト拡充）へ進む。
TP-01〜TP-05 の追加確認・`MockTokenEmbeddingClient` 単体テスト追加・長文テキストでの Late Chunking 動作確認・セグメント内ローカルトークン位置変換テストを実施する。
