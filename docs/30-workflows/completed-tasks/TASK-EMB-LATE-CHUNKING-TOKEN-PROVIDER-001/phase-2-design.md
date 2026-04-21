# Phase 2: 設計

## メタ情報

| 項目       | 内容                                                                    |
| ---------- | ----------------------------------------------------------------------- |
| Phase      | 2                                                                       |
| タスクID   | TASK-EMB-LATE-CHUNKING-TOKEN-PROVIDER-001                               |
| ステータス | pending                                                                 |
| 作成日     | 2026-04-20                                                              |
| 入力       | outputs/phase-1/requirements.md, outputs/phase-1/interface-inventory.md |

## 目的

Phase 1 で確定した要件・受け入れ基準・影響範囲を入力として、`IEmbeddingClient` 拡張・`TokenEmbeddingsResult` 型追加・`ChunkingService` フォールバック戦略・`MockTokenEmbeddingClient` の詳細設計を確定する。後続 Phase（Phase 4 テスト作成・Phase 5 実装）は本 Phase の設計ドキュメントを唯一の参照元として進める。

## 実行タスク

### Step 1: `TokenEmbeddingsResult` 型の設計

`packages/shared/src/services/chunking/types.ts` に以下の型を追加する。

```typescript
/**
 * トークンレベルの隠れ状態埋め込み結果。
 * tokens.length === embeddings.length が常に成立すること。
 */
export interface TokenEmbeddingsResult {
  /** テキストを分割したトークン列 */
  tokens: string[];
  /** 各トークンに対応する隠れ状態ベクトルの配列 */
  embeddings: number[][];
}
```

設計理由:

- `types.ts` は `IEmbeddingClient` と `ChunkingService` の両方から参照されるため、依存方向が循環しない中立的な配置場所として適切
- `tokens` と `embeddings` を同一オブジェクトに持つことで `lengths` の不一致チェックを1箇所に集約できる
- `interface` を採用することで将来的に `dimensions?: number` や `modelId?: string` のような追加フィールドを後方互換で拡張できる

### Step 2: `IEmbeddingClient` 拡張の設計

`packages/shared/src/services/chunking/interfaces.ts` の `IEmbeddingClient` を以下の形に拡張する。

```typescript
import { TokenEmbeddingsResult } from "./types";

export interface IEmbeddingClient {
  embed(text: string): Promise<number[]>;
  embedBatch(texts: string[]): Promise<number[][]>;
  /**
   * テキスト全体のトークンレベル隠れ状態を返す。
   * 実装しないクライアントは embed() へのフォールバックが使用される。
   */
  getTokenEmbeddings?(text: string): Promise<TokenEmbeddingsResult>;
}
```

設計理由:

- `?` によるオプショナル化で既存の `IEmbeddingClient` 実装クラス（モック含む）に一切変更が不要
- TypeScript の strict モードでは `client.getTokenEmbeddings?.()` の形で呼び出すことで undefined チェックが型システムで強制される
- `embed` / `embedBatch` の既存シグネチャを変更しないため AC-5 を自動的に充足する

### Step 3: `ChunkingService.getTokenEmbeddings()` フォールバック戦略の設計

`packages/shared/src/services/chunking/chunking-service.ts` の `getTokenEmbeddings()` を以下のロジックに更新する。

```typescript
async getTokenEmbeddings(text: string): Promise<TokenEmbeddingsResult> {
  // 真の Late Chunking: クライアントがトークンレベル隠れ状態を提供できる場合
  if (this.embeddingClient.getTokenEmbeddings) {
    return this.embeddingClient.getTokenEmbeddings(text);
  }

  // フォールバック: embed() の戻り値を概算トークン数分複製する近似実装
  // 注意: これは真の Late Chunking ではなく、トークン間の文脈情報を失う近似である
  const singleVector = await this.embeddingClient.embed(text);
  const tokens = text.split(' ').filter((t) => t.length > 0);
  const effectiveTokens = tokens.length > 0 ? tokens : [''];
  const embeddings = effectiveTokens.map(() => [...singleVector]);
  return { tokens: effectiveTokens, embeddings };
}
```

設計理由:

- `this.embeddingClient.getTokenEmbeddings` の存在チェックを先頭に置くことで、TP-01（真のLate Chunking）とTP-02（フォールバック）の分岐を明確にする
- フォールバック時の `embed()` 呼び出しは正確に1回のみ（AC-4 を充足）
- 空文字列・空白のみのエッジケースを `effectiveTokens` で処理し、`tokens.length === embeddings.length` の整合性を保証する
- フォールバックコメントを明記することで AC-5 の「既存動作が変わらない」を文書として担保する

### Step 4: `MockTokenEmbeddingClient` の設計

`packages/shared/src/services/embedding/providers/mock-token-embedding-provider.ts` に以下のクラスを新規作成する。

```typescript
import { IEmbeddingClient } from "../../chunking/interfaces";
import { TokenEmbeddingsResult } from "../../chunking/types";

/**
 * テスト用の決定論的トークン埋め込みモック。
 * embed() / embedBatch() / getTokenEmbeddings() をすべて実装する。
 */
export class MockTokenEmbeddingClient implements IEmbeddingClient {
  constructor(private readonly dimensions: number = 4) {}

  async embed(text: string): Promise<number[]> {
    return Array.from({ length: this.dimensions }, (_, i) => i + text.length);
  }

  async embedBatch(texts: string[]): Promise<number[][]> {
    return Promise.all(texts.map((t) => this.embed(t)));
  }

  async getTokenEmbeddings(text: string): Promise<TokenEmbeddingsResult> {
    const tokens = text.split(" ").filter((t) => t.length > 0);
    const effectiveTokens = tokens.length > 0 ? tokens : [""];
    const embeddings = effectiveTokens.map((token, i) =>
      Array.from({ length: this.dimensions }, (_, d) => i * 10 + d),
    );
    return { tokens: effectiveTokens, embeddings };
  }
}
```

設計理由:

- `dimensions` を constructor で指定可能にすることで、テストケースごとに次元数を変えた検証が可能
- `embed()` の戻り値はテキスト長依存の決定論的ベクトルとし、スナップショットテストでの再現性を担保する
- `getTokenEmbeddings()` はトークンインデックス依存の決定論的ベクトルを生成し、TP-04（チャンク境界との対応確認）で各チャンクに異なるベクトルが割り当てられることを保証する
- `tokens.length === embeddings.length` を実装レベルで保証し、TP-03 の型エラーなし確認を充足する

### Step 5: テストケース設計（TP-01〜TP-05）

| テストケースID | テスト名                                                  | 対象メソッド                                   | 期待動作                                                                    |
| -------------- | --------------------------------------------------------- | ---------------------------------------------- | --------------------------------------------------------------------------- |
| TP-01          | getTokenEmbeddings を持つクライアントで Late Chunking     | `ChunkingService.getTokenEmbeddings`           | `embed()` が呼ばれず `getTokenEmbeddings()` が1回呼ばれる                   |
| TP-02          | getTokenEmbeddings を持たないクライアントでフォールバック | `ChunkingService.getTokenEmbeddings`           | `embed()` が1回呼ばれ、`getTokenEmbeddings()` が呼ばれない                  |
| TP-03          | MockTokenEmbeddingClient の長さ整合性確認                 | `MockTokenEmbeddingClient.getTokenEmbeddings`  | `tokens.length === embeddings.length` が成立し型エラーなし                  |
| TP-04          | チャンク境界とトークン隠れ状態の対応確認                  | `ChunkingService` + `MockTokenEmbeddingClient` | 各チャンクに異なるベクトルが割り当てられている                              |
| TP-05          | TokenEmbeddingsResult の lengths 不一致でエラー           | `ChunkingService.getTokenEmbeddings`           | `tokens.length !== embeddings.length` のとき `ChunkingError` がスローされる |

TP-05 の `ChunkingError` スローについての補足:

- `getTokenEmbeddings?()` の呼び出し結果を受け取った直後に `ChunkingService` 内でバリデーションを実施する
- `result.tokens.length !== result.embeddings.length` の場合は `ChunkingError` をスローする
- このバリデーションは真の Late Chunking パス（TP-01）とフォールバックパス（TP-02）の両方に適用する

### Step 6: 型互換性検証テーブル

Phase 3（設計レビュー）で以下のテーブルを確認する。

| 確認項目                                                            | 確認方法                                       | 期待結果    |
| ------------------------------------------------------------------- | ---------------------------------------------- | ----------- |
| 既存の `IEmbeddingClient` モック実装に型エラーが発生しないか        | TypeScript コンパイル（`pnpm typecheck`）      | エラー 0 件 |
| `MockTokenEmbeddingClient` が `IEmbeddingClient` を充足するか       | `implements IEmbeddingClient` でコンパイル確認 | エラー 0 件 |
| `TokenEmbeddingsResult` の import が循環参照を生まないか            | `madge` または `pnpm typecheck` での確認       | 循環なし    |
| `getTokenEmbeddings?.()` の optional chain が strict モードで通るか | TypeScript strict モードでのコンパイル確認     | エラー 0 件 |

## 参照資料

- `outputs/phase-1/requirements.md`（受け入れ基準 AC-1〜AC-5）
- `outputs/phase-1/interface-inventory.md`（既存モック箇所・影響範囲）
- `packages/shared/src/services/chunking/interfaces.ts`（拡張対象）
- `packages/shared/src/services/chunking/types.ts`（型追加対象）
- `packages/shared/src/services/chunking/chunking-service.ts`（更新対象）
- `packages/shared/src/services/embedding/`（`MockTokenEmbeddingClient` 新規作成先）

## 実行手順

1. `packages/shared/src/services/chunking/types.ts` に `TokenEmbeddingsResult` インターフェースを追加する設計を `outputs/phase-2/design.md` に記載する
2. `IEmbeddingClient` のオプショナルメソッド追加設計と型互換性の検証方法を `outputs/phase-2/design.md` に記載する
3. `ChunkingService.getTokenEmbeddings()` のフォールバックロジック（コードスニペット含む）を `outputs/phase-2/design.md` に記載する
4. `MockTokenEmbeddingClient` の全メソッド実装設計（コードスニペット含む）を `outputs/phase-2/design.md` に記載する
5. テストケース TP-01〜TP-05 の詳細（テスト対象・入力・期待動作）を `outputs/phase-2/design.md` に記載する
6. 型互換性検証テーブルを `outputs/phase-2/design.md` に記載し、Phase 3 レビューへの入力とする

## 統合テスト連携【必須】

Phase 2 は設計フェーズであるため、コード変更は行わない。設計完了後に `pnpm --filter @repo/shared test` を実行し、既存テストが引き続き PASS していることを確認する。テストケース TP-01〜TP-05 の設計は本 Phase で完結させ、Phase 4 のテスト作成時に `outputs/phase-2/design.md` を唯一の入力源とする。

## 多角的チェック観点

- 型設計の将来性: `TokenEmbeddingsResult` に `dimensions` や `modelId` を後から追加できるか（破壊的変更にならないか）を確認する
- フォールバックの副作用: フォールバック時のベクトル複製処理が大きなテキスト（10万トークン超）でメモリを圧迫しないかを考慮し、仕様に上限を設けるか検討する
- エラーハンドリングの一貫性: `ChunkingError` の既存定義と TP-05 の使用が整合しているかを確認する
- モックの決定論的性: `MockTokenEmbeddingClient` のベクトル生成がテキスト内容に依存しているため、テスト間の独立性が損なわれないかを確認する
- オプショナルチェーンの漏れ: `this.embeddingClient.getTokenEmbeddings` を呼び出す箇所が `ChunkingService` 以外にあるか確認し、漏れなく `?.` を使用しているかをチェックする

## サブタスク管理

| サブタスクID | 内容                                              | 担当Step |
| ------------ | ------------------------------------------------- | -------- |
| ST-2-01      | `TokenEmbeddingsResult` 型の構造・配置の設計      | Step 1   |
| ST-2-02      | `IEmbeddingClient` オプショナルメソッド追加の設計 | Step 2   |
| ST-2-03      | `ChunkingService` フォールバックロジックの設計    | Step 3   |
| ST-2-04      | `MockTokenEmbeddingClient` の全メソッド設計       | Step 4   |
| ST-2-05      | テストケース TP-01〜TP-05 の詳細設計              | Step 5   |
| ST-2-06      | 型互換性検証テーブルの作成                        | Step 6   |

## 成果物

- `outputs/phase-2/design.md`（設計事項1〜5・型互換性検証テーブル・コードスニペットを記載した設計書）

## 完了条件

- [ ] `TokenEmbeddingsResult` の型構造（フィールド・型・整合性制約）が `design.md` に記載されている
- [ ] `IEmbeddingClient` の拡張後シグネチャ（コードスニペット含む）が `design.md` に記載されている
- [ ] `ChunkingService.getTokenEmbeddings()` のフォールバックロジック（コードスニペット含む）が `design.md` に記載されている
- [ ] `MockTokenEmbeddingClient` の全メソッド実装設計（コードスニペット含む）が `design.md` に記載されている
- [ ] テストケース TP-01〜TP-05 の詳細（テスト対象・入力・期待動作）が `design.md` に記載されている
- [ ] 型互換性検証テーブルが `design.md` に記載されている
- [ ] 既存テストが `pnpm --filter @repo/shared test` で PASS していることが確認されている

## タスク100%実行確認【必須】

以下を順番に確認すること:

1. `TokenEmbeddingsResult` の型定義コードスニペットが `design.md` に含まれているか
2. `IEmbeddingClient` 拡張後のインターフェース定義コードスニペットが `design.md` に含まれているか
3. `ChunkingService` フォールバックロジックのコードスニペットが `design.md` に含まれているか
4. `MockTokenEmbeddingClient` の `getTokenEmbeddings()` が決定論的ベクトルを生成する設計になっているか
5. TP-01〜TP-05 の5件すべてに期待動作が記載されているか
6. 型互換性検証テーブルの全4行が `design.md` に含まれているか
7. 既存テストが PASS していることを確認したか

## 次のPhase

Phase 3（設計レビュー）へ進む。`outputs/phase-2/design.md` を入力として、型安全性・フォールバック戦略の正確性・型の拡張性・型互換性の各観点でレビューを行い、Phase 4 への進行可否を判定する。
