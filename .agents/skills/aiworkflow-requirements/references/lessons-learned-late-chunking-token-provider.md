# Lessons Learned / Late Chunking Token Provider（TASK-EMB-LATE-CHUNKING-TOKEN-PROVIDER-001）

> 親仕様書: [architecture-embedding-pipeline.md](architecture-embedding-pipeline.md)
> 関連: [lessons-learned-late-chunking-esbuild-worktree.md](lessons-learned-late-chunking-esbuild-worktree.md)
> 役割: TASK-EMB-LATE-CHUNKING-TOKEN-PROVIDER-001 の実装教訓（L-EMBTOK-001〜005）

---

## タスク概要

**タスクID**: TASK-EMB-LATE-CHUNKING-TOKEN-PROVIDER-001

**目的**: Late Chunking パイプラインにトークンレベル埋め込みプロバイダーのオプショナル契約を追加し、`ChunkingService` が `IEmbeddingClient.getTokenEmbeddings?()` の有無に応じて動作を切り替えられるようにする。

**ブランチ**: `docs/task-spec-TASK-EMB-LATE-CHUNKING-TOKEN-PROVIDER-001`

---

## 教訓サマリー

| ID | 件名 | 重要度 |
| --- | --- | --- |
| L-EMBTOK-001 | オプショナルメソッドでの型安全なフォールバック設計 | 高 |
| L-EMBTOK-002 | Token Offset Mapping：スペース分割近似の採用経緯 | 高 |
| L-EMBTOK-003 | Fallback 意味論：近似処理でも ChunkingError を throw する設計 | 中 |
| L-EMBTOK-004 | MockTokenEmbeddingClient の決定論的設計 | 中 |
| L-EMBTOK-005 | tokens.length === embeddings.length の不変条件保証 | 中 |

---

## 実装された型・インターフェース

### `TokenEmbeddingsResult`（types.ts）

```typescript
// パス: packages/shared/src/services/chunking/types.ts
export interface TokenEmbeddingsResult {
  /** トークン文字列の配列 */
  tokens: string[];
  /** 各トークンの埋め込みベクトル配列。tokens と同じ長さであること */
  embeddings: number[][];
}
```

**不変条件**: `tokens.length === embeddings.length` が常に成立する。違反時は `ChunkingService.getTokenEmbeddingsResult()` が `ChunkingError` をスローする。

---

### `IEmbeddingClient.getTokenEmbeddings?`（interfaces.ts）

```typescript
// パス: packages/shared/src/services/chunking/interfaces.ts
export interface IEmbeddingClient {
  embed(text: string): Promise<number[]>;
  embedBatch(texts: string[]): Promise<number[][]>;

  /**
   * テキスト全体のトークンレベル隠れ状態を返す（オプショナル）
   * このメソッドが存在しない場合、ChunkingService は embed() にフォールバックする
   */
  getTokenEmbeddings?(text: string): Promise<TokenEmbeddingsResult>;
}
```

**設計**: `?` サフィックスにより、既存プロバイダーは変更不要。新規プロバイダーのみが実装する。

---

### `MockTokenEmbeddingClient`（mock-token-embedding-provider.ts）

```typescript
// パス: packages/shared/src/services/embedding/providers/mock-token-embedding-provider.ts
export class MockTokenEmbeddingClient implements IEmbeddingClient {
  // スペース分割 + 決定論的インデックスベースのダミーベクトルを返す
  async getTokenEmbeddings(text: string): Promise<TokenEmbeddingsResult> {
    const tokens = text.split(/\s+/).filter((t) => t.length > 0);
    const effectiveTokens = tokens.length > 0 ? tokens : [""];
    const embeddings = effectiveTokens.map((_, index) => [
      (index + 1) * 0.1,
      (index + 1) * 0.2,
      (index + 1) * 0.3,
    ]);
    return { tokens: effectiveTokens, embeddings };
  }
}
```

---

### `ChunkingService` の主要メソッド

| メソッド | 役割 |
| --- | --- |
| `getTokenEmbeddingsResult(client, text)` | provider優先 → fallback（embed + 複製）の分岐 |
| `aggregateTokenEmbeddings(result, text, chunks)` | チャンク境界でのtoken embedding平均化 |
| `calculateTokenSpans(text, tokens)` | トークン文字列 → 文字範囲の近似マッピング |
| `averageEmbeddings(embeddings)` | 複数トークン埋め込みの平均算出 |
| `applyLateChunking(client, text, chunks)` | 公開API（buildChunkVectors の wrapper） |

---

## 苦戦箇所

### L-EMBTOK-001: オプショナルメソッドでの型安全なフォールバック設計

**状況**:
`IEmbeddingClient` に `getTokenEmbeddings?` を追加すると、実行時に `client.getTokenEmbeddings` が `undefined` になるケースを TypeScript が保証しない。  
`client.getTokenEmbeddings?.()` のように optional chaining を使えばよいが、呼び出し前に存在チェックを明示的に行うことで可読性を確保した。

**採用した実装パターン**:
```typescript
private async getTokenEmbeddingsResult(
  client: IEmbeddingClient,
  text: string,
): Promise<TokenEmbeddingsResult> {
  if (client.getTokenEmbeddings) {
    const result = await client.getTokenEmbeddings(text);
    // 不変条件チェック
    if (result.tokens.length !== result.embeddings.length) {
      throw new ChunkingError(...);
    }
    return result;
  }
  // fallback: embed() + スペース分割複製
  const singleVector = await client.embed(text);
  const tokens = text.split(/\s+/).filter((token) => token.length > 0);
  const effectiveTokens = tokens.length > 0 ? tokens : [""];
  return {
    tokens: effectiveTokens,
    embeddings: effectiveTokens.map(() => [...singleVector]),
  };
}
```

**教訓**:
- `if (client.getTokenEmbeddings)` による明示的チェックは `?.()` より「フォールバック意図」が明確になる
- 不変条件チェックは呼び出し元ではなく `getTokenEmbeddingsResult` 内で完結させる

---

### L-EMBTOK-002: Token Offset Mapping：スペース分割近似の採用経緯

**状況**:
Late Chunking の本質的な品質はトークン ↔ 文字位置の正確なマッピングに依存する。  
理想はsubword tokenizer（BPE等）に基づく厳密なoffset mapping（IEncoder.encode() + offsetMapping: [number, number][]）だが、本タスクのスコープ外とした。

**採用した近似方式**:
- `text.split(/\s+/)` でスペース分割したトークン列を使用
- 各トークンを `text.indexOf(token, cursor)` で前方検索し、文字位置に近似マッピング
- 見つからない場合はスキップ（`cursor` を進めて次のトークンへ）

**近似の限界**:
- BPE / SentencePiece 等のsubword tokenization とは一致しない
- 同じトークン文字列が複数回出現する場合、先頭から前方検索するため後続の出現にずれが生じる可能性がある

**後続タスクへ引き継ぐ事項**:
- encoder-based 厳密実装は別タスク `REAL_PROVIDER_TOKEN_EMBEDDINGS_SUPPORT` で対応予定
- `IEncoder` インターフェース（`hiddenStates: Float32Array[]` / `offsetMapping: [number, number][]`）を経由した実装は `lessons-learned-late-chunking-esbuild-worktree.md` の L-LC-02 を参照

---

### L-EMBTOK-003: Fallback 意味論：近似処理でも ChunkingError をthrowする設計

**状況**:
フォールバック（`embed()` + スペース分割複製）は意味的に近似であり、本来の Late Chunking の品質を保証しない。  
「silent fallback」にすべきか「エラーをthrowすべきか」が議論になった。

**採用した設計**:
- `TokenEmbeddingsResult` の不変条件（`tokens.length !== embeddings.length`）が破れた場合のみ `ChunkingError` をthrow
- フォールバック自体（プロバイダーが `getTokenEmbeddings` を持たない場合）はエラーにせず実行を継続する

**理由**:
- フォールバックが発生しても呼び出し元が利用可能な結果を得られることを優先
- 不変条件違反は「プロバイダーのバグ」であり、これだけは早期に検出すべき

**教訓**:
- フォールバックの存在を外部に知らせる手段（ログ、メタデータ付与）が将来的に必要かもしれない
- 現時点では `ChunkMetadata.lateChunking.applied: true` は「Late Chunking処理が走った」ことを示すのみで、フォールバックの使用を区別していない

---

### L-EMBTOK-004: MockTokenEmbeddingClient の決定論的設計

**状況**:
統合テストで `getTokenEmbeddings` 経路を検証するため、決定論的かつシンプルなモック実装が必要だった。  
乱数を使うモックは再現性がなく、スナップショットテストに不向き。

**採用した設計**:
- トークンインデックス `i` に基づく `[(i+1)*0.1, (i+1)*0.2, (i+1)*0.3]` のダミーベクトル
- スペース分割（`/\s+/`）でトークン化（MockTokenEmbeddingClient でも本番と同じ分割ロジック）
- 空文字列入力は `[""]` に fallback（`tokens.length > 0` チェック）

**教訓**:
- モックのトークン化ロジックを本番フォールバックと同じ `/\s+/` にすることで、フォールバック経路のテストにも流用できる
- テスト用モックは `packages/shared/src/services/embedding/providers/` 配下に配置することで、統合テストからインポートしやすくなった

---

### L-EMBTOK-005: tokens.length === embeddings.length の不変条件保証

**状況**:
`TokenEmbeddingsResult` は `tokens` と `embeddings` の長さが一致することを前提に `aggregateTokenEmbeddings` が動く。  
長さが不一致の場合、`Array.prototype.map` でインデックスが `undefined` になりサイレントに誤った結果を返す恐れがある。

**採用した保証策**:
1. `getTokenEmbeddingsResult` 内で `tokens.length !== embeddings.length` を検出したら即座に `ChunkingError` をthrow
2. JSDoc に `tokens.length === embeddings.length が常に成立すること` を明記

**教訓**:
- 関連するデータ間の不変条件は実行時チェックとドキュメントの両方で保証する
- `ChunkingError` は `cause` フィールドを持つ拡張エラー型なので、デバッグ情報を付与できる

---

## 採用した設計判断とその理由

| 設計判断 | 理由 |
| --- | --- |
| `getTokenEmbeddings` を `IEmbeddingClient` のオプショナルメソッドにした | 既存プロバイダーへの変更を不要にし、後方互換性を保つ |
| フォールバックで `embed()` + スペース分割複製を使用した | 本番プロバイダーなしでも Late Chunking パイプラインを動作させるため |
| スペース分割近似を採用した | encoder-based 厳密実装はスコープ外。近似でもチャンク境界の集約は機能する |
| `MockTokenEmbeddingClient` を `embedding/providers/` に配置した | テストインフラを実装コードと同じ `packages/shared` に置くことで CI での import パス問題を回避 |
| 不変条件違反時のみ `ChunkingError` を throw | プロバイダー未対応は継続可能だが、データ整合性破壊は即座にエラーにする |

---

## 未タスク候補とその背景

### REAL_PROVIDER_TOKEN_EMBEDDINGS_SUPPORT

**概要**: 本番プロバイダー（Jina Embeddings等）が `getTokenEmbeddings` を実装したバージョン  
**背景**: 現在の Late Chunking は全て近似（スペース分割）。本番品質には encoder-based token embeddings が必要  
**ブロッカー**: encoder ライブラリの選定（`@xenova/transformers` 等）・ライセンス確認

### LATE_CHUNKING_SPEC_RECONCILIATION

**概要**: `LateChunkingService` と `ChunkingService` の責務分離  
**背景**: Late Chunking のコアロジックは `ChunkingService` に実装されているが、別サービス（`LateChunkingService`）が存在する場合、責務が重複する可能性がある  
**ブロッカー**: `LateChunkingService` の現状実装確認と責務整理

### TOKEN_EMBEDDING_FALLBACK_OBSERVABILITY

**概要**: フォールバック使用時のログ出力 / メタデータ付与  
**背景**: 現在はフォールバックが発生しても `ChunkMetadata` に区別情報がない  
**規模**: Small（`lateChunking.usedFallback: boolean` フィールド追加 + ログ1行）

---

## 関連ドキュメント

- [Embedding Generation Pipeline アーキテクチャ](./architecture-embedding-pipeline.md)
- [Late Chunking esbuild/worktree 教訓](./lessons-learned-late-chunking-esbuild-worktree.md)
- [RAG・Embedding・Extraction Runtime 統合 教訓](./lessons-learned-rag-embedding-runtime.md)
- [Embedding Generation API](./api-internal-embedding.md)
- [Embedding 型定義](./llm-embedding.md)

## 実装ファイル参照

| ファイル | 役割 |
| --- | --- |
| `packages/shared/src/services/chunking/types.ts` | `TokenEmbeddingsResult` 型定義 |
| `packages/shared/src/services/chunking/interfaces.ts` | `IEmbeddingClient.getTokenEmbeddings?` 追加 |
| `packages/shared/src/services/chunking/chunking-service.ts` | `getTokenEmbeddingsResult` / `aggregateTokenEmbeddings` 実装 |
| `packages/shared/src/services/embedding/providers/mock-token-embedding-provider.ts` | `MockTokenEmbeddingClient` |
| `packages/shared/src/services/chunking/__tests__/chunking-service.integration.test.ts` | Late Chunking 統合テスト拡張 |
