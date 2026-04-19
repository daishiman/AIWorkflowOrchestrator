# Late Chunking: トークンレベル隠れ状態プロバイダー実装 - タスク指示書

## メタ情報

```yaml
issue_number: 2316
task_id: TASK-EMB-LATE-CHUNKING-TOKEN-PROVIDER-001
task_name: Late Chunking トークンレベル隠れ状態プロバイダー実装
category: 新機能実装
target_feature: packages/shared/src/services/embedding
priority: 高
scale: 大規模
status: 未実施
source_phase: UNASSIGNED-EMB-005 review wave Phase 10-12
created_date: 2026-04-19
```

## メタ情報

| 項目         | 内容                                                  |
| ------------ | ----------------------------------------------------- |
| タスクID     | TASK-EMB-LATE-CHUNKING-TOKEN-PROVIDER-001             |
| タスク名     | Late Chunking: トークンレベル隠れ状態プロバイダー実装 |
| 分類         | 新機能実装                                            |
| 対象機能     | packages/shared/src/services/embedding / chunking     |
| 優先度       | 高                                                    |
| 見積もり規模 | 大規模                                                |
| ステータス   | 未実施                                                |
| 発見元       | UNASSIGNED-EMB-005 review wave Phase 10-12            |
| 発見日       | 2026-04-19                                            |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

Late Chunking は「文書全体を一度エンコードし、トークンレベルの隠れ状態ベクトルをチャンク境界で集約する」手法である。
これにより、チャンク個別にエンコードする手法に比べてより豊富な文脈を埋め込みに反映できる。

現在の `ChunkingService.applyLateChunking()` は以下の処理を実装済みである。

- チャンク境界（文字位置）→トークン位置への変換（`determineChunkBoundaries` / `charPositionToTokenIndex`）
- セグメントごとの埋め込み取得（`getTokenEmbeddings`）
- セグメント重なりベースのプーリング（`mean` / `cls` / `attention`）
- 重なりがない場合の最近傍セグメントへのフォールバック

しかし、`getTokenEmbeddings()` が内部で呼び出す `IEmbeddingClient.embed(text)` は **テキスト全体に対する単一の代表ベクトル**を返すのみである。
真のLate Chunkingが必要とする「**各トークンの隠れ状態ベクトル**」（token-level hidden states）を取得する手段がインターフェースとして存在しない。

つまり現行実装は「セグメントテキストを単一ベクトルで近似し、それをプーリング」するものであり、真のLate Chunkingではない。

### 1.2 問題点・課題

**問題1: `IEmbeddingClient` にトークンレベル取得メソッドが存在しない**

`packages/shared/src/services/chunking/interfaces.ts` の `IEmbeddingClient` は `embed(text)` と `embedBatch(texts)` のみを持つ。
トークンごとの隠れ状態ベクトル（`number[][]`）を返すメソッドが定義されておらず、Late Chunking本来の動作が実現できない。

**問題2: プロバイダー別の実装がない**

`packages/shared/src/services/embedding/providers/` の `OpenAIEmbeddingProvider` 等は現在 `embed()` のみを実装している。
OpenAI Embedding API は最終レイヤーの代表ベクトルのみを返すため、`getTokenEmbeddings` に相当する実装には API側の工夫（hidden states対応モデルの利用・ローカルモデルの推論）が必要になる。

**問題3: `ChunkingService.getTokenEmbeddings()` が「真のトークン埋め込み」ではない**

現行の `getTokenEmbeddings()` は `embed(segmentText)` を呼んでセグメント単位の単一ベクトルを得る実装である。
これはLate Chunkingの「1つのforward passで全トークンの隠れ状態を取得する」原理から逸脱している。

### 1.3 放置した場合の影響

- Late Chunkingを有効にしても実質的にはセグメント単位のmean poolingと同等の精度しか得られない
- 「Late Chunkingを実装している」という仕様上の記述と実動作に乖離が生じ、評価時の誤解を招く
- 後続の責務分離（TASK-EMB-LATE-CHUNKING-SERVICE-SEPARATION-001）やパイプライン統合（TASK-EMB-LATE-CHUNKING-PIPELINE-INTEGRATION-001）が真のLate Chunkingを前提として設計されるため、早期に解決しないとアーキテクチャ負債が蓄積する

---

## 2. 何を達成するか（What）

### 2.1 目的

`IEmbeddingClient` インターフェースに `getTokenEmbeddings()` メソッドを追加し、プロバイダー別実装（少なくともモック実装と1つのリアルプロバイダー）を提供することで、真のLate Chunkingが可能な基盤を整備する。

### 2.2 最終ゴール

1. `IEmbeddingClient` に `getTokenEmbeddings(text: string): Promise<TokenEmbeddingsResult>` が定義されている
2. `TokenEmbeddingsResult` 型（`tokens: string[], embeddings: number[][]`）が共有型定義に存在する
3. `ChunkingService.getTokenEmbeddings()` が `IEmbeddingClient.getTokenEmbeddings()` を呼び出す実装に切り替わっている
4. モック実装（テスト用）が `packages/shared/src/services/embedding/providers/` に存在する
5. 既存の `embed()` / `embedBatch()` の動作が一切変わらない（後方互換を維持）

### 2.3 スコープ

**含むもの**:

- `IEmbeddingClient` への `getTokenEmbeddings()` メソッド追加
- `TokenEmbeddingsResult` 型の定義（`packages/shared/src/services/chunking/interfaces.ts` または `embedding/types/embedding.types.ts`）
- `ChunkingService.getTokenEmbeddings()` の実装切り替え
- テスト用モック実装クラス（`MockTokenEmbeddingClient`）
- 既存テスト・型チェックがすべてパスすることの確認

**含まないもの**:

- OpenAI / DashScope 等の本番プロバイダーへのリアル実装（APIが対応していないため別タスクで検討）
- Late Chunking処理ロジックの責務分離（TASK-EMB-LATE-CHUNKING-SERVICE-SEPARATION-001）
- EmbeddingPipelineへの統合（TASK-EMB-LATE-CHUNKING-PIPELINE-INTEGRATION-001）
- ローカルモデル（Qwen3等）でのtoken-level推論実装

### 2.4 成果物

| ファイル                                                                               | 変更種別 | 内容                                                    |
| -------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------- |
| `packages/shared/src/services/chunking/interfaces.ts`                                  | 修正     | `IEmbeddingClient` に `getTokenEmbeddings()` を追加     |
| `packages/shared/src/services/chunking/types.ts`                                       | 修正     | `TokenEmbeddingsResult` 型を追加                        |
| `packages/shared/src/services/chunking/chunking-service.ts`                            | 修正     | `getTokenEmbeddings()` を `IEmbeddingClient` 経由に変更 |
| `packages/shared/src/services/embedding/providers/mock-token-embedding-provider.ts`    | 新規     | テスト用モック実装                                      |
| `packages/shared/src/services/chunking/__tests__/chunking-service.integration.test.ts` | 修正     | `getTokenEmbeddings` を使う統合テストケース追加         |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `packages/shared/src/services/chunking/interfaces.ts` および `chunking-service.ts` の現行実装を熟読していること
- TypeScriptのインターフェース拡張・後方互換設計の基本を理解していること
- Late Chunkingの原理（token-level hidden states / pooling）を理解していること

### 3.2 依存タスク

| タスクID                                        | 関係       | 理由                                                     |
| ----------------------------------------------- | ---------- | -------------------------------------------------------- |
| TASK-EMB-LATE-CHUNKING-SERVICE-SEPARATION-001   | 後続タスク | 本タスクが提供するインターフェースを使って責務分離を行う |
| TASK-EMB-LATE-CHUNKING-PIPELINE-INTEGRATION-001 | 後続タスク | 本タスクの完了後にパイプライン統合を実施する             |

**本タスクに依存する先行タスクは存在しない（最初のステップ）。**

### 3.3 必要な知識

- TypeScriptインターフェースへのオプショナルメソッド追加パターン
- Vitestでのモッククラス実装パターン（`implements IEmbeddingClient`）
- Late Chunkingの数学的基礎: 各トークン位置 $t$ に対して隠れ状態ベクトル $h_t \in \mathbb{R}^d$ を取得し、チャンク境界 $[s, e)$ のトークンについて $\frac{1}{e-s} \sum_{t=s}^{e-1} h_t$ を計算する
- `embed()` は `getTokenEmbeddings()` のfallback実装として「入力テキスト全体の単一ベクトルを全トークンに複製する」近似を使える（完全実装が難しいプロバイダー向けデフォルト実装）

### 3.4 推奨アプローチ

**インターフェース設計方針**:

```typescript
// TokenEmbeddingsResult: 各トークンの表層形と隠れ状態ベクトルを対応させる
export interface TokenEmbeddingsResult {
  /** トークンの表層文字列（デバッグ・可視化用） */
  tokens: string[];
  /** 各トークンの隠れ状態ベクトル。tokens[i] に対応する embeddings[i] */
  embeddings: number[][];
  /** 実際に使用したモデルID（プロバイダー実装が設定） */
  model?: string;
}
```

**後方互換設計**:

`getTokenEmbeddings()` をオプショナルメソッドとして追加し、`ChunkingService` 側で未実装のクライアントには `embed()` を使ったフォールバック（全トークンに同一ベクトルを複製）を行う。
これにより既存の `IEmbeddingClient` 実装クラスを壊さずに段階的に移行できる。

```typescript
export interface IEmbeddingClient {
  embed(text: string): Promise<number[]>;
  embedBatch(texts: string[]): Promise<number[][]>;
  // 新規追加（オプショナル）
  getTokenEmbeddings?(text: string): Promise<TokenEmbeddingsResult>;
}
```

---

## 4. 実行手順（Phase構成）

### Phase 1: 要件定義

- `IEmbeddingClient` に追加するメソッドシグネチャを決定する
- `TokenEmbeddingsResult` 型の定義場所（`chunking/types.ts` か `embedding/types/embedding.types.ts`）を決定する
- フォールバック実装の仕様を確定する（`embed()` の戻り値を全トークン数分複製する近似）
- 既存テストで `IEmbeddingClient` をモックしているすべての箇所を洗い出す
  - `packages/shared/src/services/chunking/__tests__/`
  - `packages/shared/src/services/embedding/__tests__/` （存在すれば）

### Phase 2: 設計

**設計事項1: `TokenEmbeddingsResult` 型の配置**

`packages/shared/src/services/chunking/types.ts` に追加する。理由は `IEmbeddingClient` が chunking 層で定義されており、型の参照関係を chunking 層内に閉じるため。

**設計事項2: `IEmbeddingClient.getTokenEmbeddings()` のオプショナル化**

既存プロバイダー（`OpenAIEmbeddingProvider`、`Qwen3Provider` 等）が実装を強制されないよう `?` でオプショナルにする。

**設計事項3: `ChunkingService.getTokenEmbeddings()` のフォールバック戦略**

```typescript
private async getTokenEmbeddings(
  tokens: number[],
  maxSequenceLength: number,
): Promise<Array<{ startToken: number; endToken: number; embedding: number[] }>> {
  // ... 既存のセグメント分割ロジック
  for (let i = 0; i < tokens.length; i += maxSequenceLength) {
    const segment = tokens.slice(i, i + maxSequenceLength);
    const segmentText = this.tokenizer.decode(segment);

    if (this.embeddingClient.getTokenEmbeddings) {
      // 真のトークンレベル隠れ状態を取得（トークン数分のベクトル）
      const result = await this.embeddingClient.getTokenEmbeddings(segmentText);
      // セグメント内の各トークンに対応するベクトルを使ってプーリング
      // ... （詳細は Phase 5 で実装）
    } else {
      // フォールバック: セグメント全体の単一ベクトルを使用（現行動作を維持）
      const embedding = await this.embeddingClient.embed(segmentText);
      embeddings.push({ startToken: i, endToken: i + segment.length, embedding });
    }
  }
}
```

**設計事項4: モック実装クラス `MockTokenEmbeddingClient`**

テスト用。各トークンに対して `[tokenIndex / totalTokens, ...]` のような決定論的なベクトルを返す。次元数は設定可能とする。

**設計事項5: テストケース一覧**

| テストID | 条件                                                                       | 期待動作                                               |
| -------- | -------------------------------------------------------------------------- | ------------------------------------------------------ |
| TP-01    | `getTokenEmbeddings` を持つクライアントで Late Chunking 適用               | `embed()` が呼ばれず `getTokenEmbeddings()` が呼ばれる |
| TP-02    | `getTokenEmbeddings` を持たないクライアントで Late Chunking 適用           | フォールバックとして `embed()` が呼ばれる              |
| TP-03    | `MockTokenEmbeddingClient` で tokens.length === embeddings.length          | 型エラーなし、次元数が一致する                         |
| TP-04    | チャンク境界とトークン隠れ状態の対応確認                                   | 各チャンクに異なるベクトルが割り当てられる             |
| TP-05    | `TokenEmbeddingsResult` の `tokens` と `embeddings` の長さが一致しない場合 | `ChunkingError` がスローされる                         |

### Phase 3: 設計レビュー

- Phase 2 の設計事項 1〜5 をレビューする
- オプショナルメソッドの設計が型安全か確認する（`undefined` チェックの漏れがないか）
- フォールバック戦略が既存の Late Chunking 動作を正確に再現しているか確認する
- `TokenEmbeddingsResult` の型が将来のプロバイダー実装に対して拡張しやすいか確認する
- PASS / MINOR / MAJOR / CRITICAL の判定を行い、MAJOR 以上は Phase 2 に差し戻す

### Phase 4: テスト作成（TDD）

`packages/shared/src/services/chunking/__tests__/chunking-service.integration.test.ts` に以下のテストケースを追加する。

```typescript
describe("Late Chunking with token-level embeddings", () => {
  // TP-01: getTokenEmbeddings を持つクライアントを使う場合
  it("should use getTokenEmbeddings when client supports it", async () => {
    // MockTokenEmbeddingClient を使って実装
  });

  // TP-02: getTokenEmbeddings を持たない場合のフォールバック
  it("should fall back to embed() when getTokenEmbeddings is not available", async () => {
    // 既存のモッククライアントを使って実装
  });

  // TP-03: TokenEmbeddingsResult の型整合性
  it("should correctly map token embeddings to chunk boundaries", async () => {
    // 実装
  });

  // TP-04: 複数チャンク・複数セグメントでのベクトル差異確認
  it("should assign distinct embeddings to different chunks", async () => {
    // 実装
  });

  // TP-05: tokens/embeddings 長さ不一致エラー
  it("should throw ChunkingError when token count mismatches embedding count", async () => {
    // 実装
  });
});
```

### Phase 5: 実装

**Step 1: `TokenEmbeddingsResult` 型を `packages/shared/src/services/chunking/types.ts` に追加する**

```typescript
export interface TokenEmbeddingsResult {
  tokens: string[];
  embeddings: number[][];
  model?: string;
}
```

**Step 2: `IEmbeddingClient` を `packages/shared/src/services/chunking/interfaces.ts` で拡張する**

```typescript
export interface IEmbeddingClient {
  embed(text: string): Promise<number[]>;
  embedBatch(texts: string[]): Promise<number[][]>;
  getTokenEmbeddings?(text: string): Promise<TokenEmbeddingsResult>;
}
```

**Step 3: `ChunkingService.getTokenEmbeddings()` を更新する**

`getTokenEmbeddings` が定義されている場合はそれを呼び出し、ない場合は `embed()` フォールバックを実行する。

**Step 4: `MockTokenEmbeddingClient` を `packages/shared/src/services/embedding/providers/mock-token-embedding-provider.ts` に作成する**

`IEmbeddingClient` を `implements` し、`getTokenEmbeddings()` で決定論的なベクトルを返す。

**Step 5: 既存テストが壊れていないことを確認する**

既存の `IEmbeddingClient` モックに `getTokenEmbeddings` が存在しないことで型エラーが出ないことを確認する（オプショナルのため問題ないはず）。

### Phase 6: テスト拡充

- TP-01〜TP-05 のテストが PASS することを確認する
- `MockTokenEmbeddingClient` 自体の単体テストを1件追加する（`getTokenEmbeddings` が正しい形式を返すこと）
- 長文テキスト（`maxSequenceLength` を超える）での Late Chunking 動作確認テストを追加する

### Phase 7: カバレッジ確認

```bash
pnpm --filter @repo/shared test --coverage -- chunking-service
```

- `getTokenEmbeddings()` の両分岐（`getTokenEmbeddings` あり / フォールバック）がカバーされていることを確認する
- `poolTokenEmbeddings()` の `mean` / `cls` / `attention` 全分岐がカバーされていることを確認する

### Phase 8: リファクタリング

- `ChunkingService` の `getTokenEmbeddings()` が長くなった場合、「クライアント呼び出し部」と「セグメント分割部」を分離することを検討する
- `MockTokenEmbeddingClient` のベクトル生成ロジックが複雑になった場合、ファクトリメソッドを用意する
- 不要な `as unknown as` 型アサーションや `any` の除去

### Phase 9: 品質保証

```bash
# 型チェック
pnpm --filter @repo/shared typecheck

# Lint
pnpm --filter @repo/shared lint

# テスト（全件）
pnpm --filter @repo/shared test

# 統合テストのみ実行
pnpm --filter @repo/shared test -- chunking-service.integration
```

### Phase 10: 最終レビュー

- Phase 2 の設計事項 1〜5 がすべて実装に反映されていることを確認する
- TP-01〜TP-05 のテストが全件 PASS していることを確認する
- `IEmbeddingClient` の既存実装クラスで型エラーが発生していないことを確認する
- PASS / MINOR は Phase 11 へ進む。MAJOR は Phase 8 に差し戻す

### Phase 11: 手動テスト

Vitest での統合テストが主検証手段のため、手動テストは最小限とする。

```bash
# 統合テスト実行（実際のトークナイザーを使う場合）
pnpm --filter @repo/shared test -- --reporter=verbose chunking-service.integration

# Late Chunking オプションを有効にして chunks の metadata を確認
# metadata.lateChunking.embeddingDimension が 0 でないことを確認
```

### Phase 12: ドキュメント更新

本タスクで変更した内容を以下のドキュメントに反映する。

- `packages/shared/src/services/chunking/interfaces.ts` の `IEmbeddingClient` に JSDoc コメントを追加し、`getTokenEmbeddings()` の使用条件（真のLate Chunking）とフォールバック動作を説明する
- `packages/shared/src/services/embedding/providers/mock-token-embedding-provider.ts` に JSDoc で「テスト専用」であることを明記する
- 本タスク仕様書（`TASK-EMB-LATE-CHUNKING-TOKEN-PROVIDER-001.md`）の「ステータス」を「実施済み」に更新する
- `docs/30-workflows/UNASSIGNED-EMB-005-late-chunking/index.md` の「依然として残る本体スコープ」から「token-level hidden state を返す provider / service 契約の追加」を削除する

### Phase 13: PR作成

ユーザーの明示的承認を得た後に実施する。

```bash
# ブランチ作成
git checkout -b feat/emb-late-chunking-token-provider-001

# コミット
git commit -m "feat(embedding): TASK-EMB-LATE-CHUNKING-TOKEN-PROVIDER-001 IEmbeddingClientにgetTokenEmbeddingsを追加しLate Chunking基盤を整備"

# push
git push -u origin feat/emb-late-chunking-token-provider-001

# PR 作成
gh pr create \
  --title "feat(embedding): TASK-EMB-LATE-CHUNKING-TOKEN-PROVIDER-001 トークンレベル隠れ状態プロバイダー実装" \
  --body "..."
```

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `TokenEmbeddingsResult` 型が `packages/shared/src/services/chunking/types.ts` に定義されている
- [ ] `IEmbeddingClient` に `getTokenEmbeddings?(text: string): Promise<TokenEmbeddingsResult>` が追加されている
- [ ] `ChunkingService.getTokenEmbeddings()` が `IEmbeddingClient.getTokenEmbeddings()` を呼び出す（存在する場合）
- [ ] `getTokenEmbeddings` が存在しない場合、`embed()` フォールバックで既存動作が維持される
- [ ] `MockTokenEmbeddingClient` が `packages/shared/src/services/embedding/providers/` に存在する
- [ ] TP-01〜TP-05 のテストが全件 PASS している

### 後方互換要件

- [ ] 既存の `IEmbeddingClient` モック実装クラスで型エラーが発生しない
- [ ] `embed()` / `embedBatch()` の動作が変わらない
- [ ] 既存の Late Chunking テストがすべて PASS している

### 品質要件

- [ ] `pnpm --filter @repo/shared typecheck` がエラーなしで通過する
- [ ] `pnpm --filter @repo/shared lint` がエラーなしで通過する
- [ ] `pnpm --filter @repo/shared test` が全件パスする
- [ ] `getTokenEmbeddings()` の両分岐がテストカバレッジで網羅されている
- [ ] `any` 型の新規使用がない

### ドキュメント要件

- [ ] `IEmbeddingClient.getTokenEmbeddings()` に JSDoc コメントが追加されている
- [ ] `MockTokenEmbeddingClient` に「テスト専用」の JSDoc 注記がある
- [ ] 本タスク仕様書のステータスが「実施済み」に更新されている

---

## 6. 検証方法

### テストケース

| テストID | 対象                                            | 入力/操作                                                   | 期待結果                                                                          | 備考                  |
| -------- | ----------------------------------------------- | ----------------------------------------------------------- | --------------------------------------------------------------------------------- | --------------------- |
| TP-01    | `ChunkingService.applyLateChunking()`           | `MockTokenEmbeddingClient`（`getTokenEmbeddings` 実装あり） | `embed()` が呼ばれず `getTokenEmbeddings()` が呼ばれる                            | 真のLate Chunking動作 |
| TP-02    | `ChunkingService.applyLateChunking()`           | `getTokenEmbeddings` を持たないモック                       | `embed()` が呼ばれる                                                              | フォールバック        |
| TP-03    | `MockTokenEmbeddingClient.getTokenEmbeddings()` | 任意テキスト                                                | `tokens.length === embeddings.length`                                             | 型整合性              |
| TP-04    | `ChunkingService.applyLateChunking()`           | 2チャンク以上の文書、`MockTokenEmbeddingClient`             | 各チャンクのメタデータ `embeddingDimension > 0`、かつチャンク間でベクトルが異なる | 差異確認              |
| TP-05    | `IEmbeddingClient.getTokenEmbeddings()`         | `tokens.length !== embeddings.length` を返すモック          | `ChunkingError` がスローされる                                                    | エラーハンドリング    |

### 実行コマンド

```bash
# Late Chunking token provider テストのみ実行
pnpm --filter @repo/shared test -- --grep "token-level embeddings"

# chunking-service 全テストを実行
pnpm --filter @repo/shared test -- chunking-service

# カバレッジ付きで実行
pnpm --filter @repo/shared test --coverage -- chunking-service
```

---

## 7. リスクと対策

| リスク                                                                                                       | 影響度 | 発生確率 | 対策                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------ | ------ | -------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `getTokenEmbeddings()` をオプショナルにした場合の `undefined` チェック漏れ                                   | 高     | 中       | `ChunkingService` 側で `this.embeddingClient.getTokenEmbeddings?.()` パターンを使い、型安全なオプショナルチェーンを徹底する             |
| 既存の `IEmbeddingClient` モックが新メソッドを要求する型エラー                                               | 中     | 低       | オプショナル（`?`）にすることで既存実装への影響を排除する                                                                               |
| `TokenEmbeddingsResult.embeddings` の次元数がチャンク間で異なる場合の `averageEmbeddings()` 内での次元不一致 | 中     | 中       | `averageEmbeddings()` が既存実装で `embedding.length !== dimension` の場合をスキップするため、対策済み。ただしテスト（TP-04）で確認する |
| `maxSequenceLength` を超える長文でのセグメント分割時にトークン位置がずれる                                   | 高     | 中       | 長文テスト（Phase 6）で明示的に検証し、セグメント内のローカルトークン位置とグローバルトークン位置の変換が正しいことを確認する           |
| プロバイダーAPIがtoken-level hidden statesを返さない（OpenAI等）                                             | 高     | 高       | 本タスクでは本番プロバイダーの実装を含まない。モック実装と `embed()` フォールバックで対処し、本番実装は別タスクとして分離する           |

---

## 8. 参照情報

### 関連ドキュメント

| 資料名                                          | パス                                                                                         | 説明                           |
| ----------------------------------------------- | -------------------------------------------------------------------------------------------- | ------------------------------ |
| UNASSIGNED-EMB-005 review wave index            | `docs/30-workflows/UNASSIGNED-EMB-005-late-chunking/index.md`                                | 本タスクの発見元               |
| Phase 10 final review                           | `docs/30-workflows/UNASSIGNED-EMB-005-late-chunking/outputs/phase-10/final-review-result.md` | 残課題の詳細                   |
| TASK-EMB-LATE-CHUNKING-SERVICE-SEPARATION-001   | `docs/30-workflows/unassigned-task/TASK-EMB-LATE-CHUNKING-SERVICE-SEPARATION-001.md`         | 後続タスク（責務分離）         |
| TASK-EMB-LATE-CHUNKING-PIPELINE-INTEGRATION-001 | `docs/30-workflows/unassigned-task/TASK-EMB-LATE-CHUNKING-PIPELINE-INTEGRATION-001.md`       | 後続タスク（パイプライン統合） |

### 関連ファイル

| ファイル                                                                               | 変更種別 | 内容                           |
| -------------------------------------------------------------------------------------- | -------- | ------------------------------ |
| `packages/shared/src/services/chunking/interfaces.ts`                                  | 修正     | `IEmbeddingClient` 拡張        |
| `packages/shared/src/services/chunking/types.ts`                                       | 修正     | `TokenEmbeddingsResult` 型追加 |
| `packages/shared/src/services/chunking/chunking-service.ts`                            | 修正     | `getTokenEmbeddings()` 更新    |
| `packages/shared/src/services/embedding/providers/mock-token-embedding-provider.ts`    | 新規     | テスト用モック                 |
| `packages/shared/src/services/chunking/__tests__/chunking-service.integration.test.ts` | 修正     | 新規テストケース追加           |

### 対象コードの位置

| メソッド名 / 型名                      | ファイル                        | 内容                           |
| -------------------------------------- | ------------------------------- | ------------------------------ |
| `IEmbeddingClient`                     | `interfaces.ts` L80-L96         | 拡張対象のインターフェース     |
| `ChunkingService.getTokenEmbeddings()` | `chunking-service.ts` L402-L429 | 更新対象のプライベートメソッド |
| `ChunkingService.applyLateChunking()`  | `chunking-service.ts` L358-L397 | Late Chunking適用ロジック本体  |
| `poolTokenEmbeddings()`                | `chunking-service.ts` L469-L505 | プーリング処理（変更なし）     |

---

## 9. 備考

### 苦戦箇所【記入必須】

| 苦戦箇所                                                                              | 症状                                                                                                                                          | 原因                                                                                           | 対応                                                                                                                                                 | 再発防止                                                                                                                     |
| ------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `getTokenEmbeddings` のオプショナル化と型安全性のトレードオフ                         | オプショナルにすると呼び出し側で `?.` が必要になり、フォールバックロジックが複雑になる                                                        | TypeScriptのオプショナルメソッドは実装側に undefined チェックを強制しない                      | `ChunkingService` 内に `hasTokenEmbeddingSupport(client: IEmbeddingClient): client is Required<IEmbeddingClient>` 型ガードを定義し、分岐を明確にする | インターフェース設計時に「オプショナル vs Union型（サポートあり/なし）」を Phase 2 で明示的に決定する                        |
| セグメント内ローカルトークン位置とグローバルトークン位置の変換                        | `getTokenEmbeddings()` で取得したベクトルが「セグメント内のトークンインデックス」を返すため、文書全体のグローバルインデックスと対応付けが必要 | maxSequenceLength による分割でセグメントの先頭トークンが文書全体の何番目かを管理する必要がある | セグメント取得時に `startToken: i` をオフセットとして保持し、プーリング時に `segmentLocalIndex + startToken` でグローバルインデックスに変換する      | `TokenEmbeddingsResult` の型設計時に「セグメントローカル vs グローバル」のどちらのインデックスを返すかを型コメントで明示する |
| 本番プロバイダー（OpenAI等）でのtoken-level hidden state取得不可                      | OpenAI Embedding APIは最終レイヤーの単一ベクトルのみを返すため、真のトークンレベル実装ができない                                              | APIの仕様上の制約。ローカルモデル推論が必要                                                    | 本タスクでは `embed()` フォールバックで対処し、本番プロバイダー実装は「ローカルモデル推論タスク」として別途分離する                                  | `MockTokenEmbeddingClient` の JSDoc に「本番プロバイダーでの実装難易度」を注記し、将来の実装者への情報を残す                 |
| `UNASSIGNED-EMB-005` review waveで「真のLate Chunking未実装」が判明したが検出が遅れた | review wave Phase 10でようやく判明し、本体実装の完了を宣言できなかった                                                                        | 実装レビューの観点が「動作すること」に偏り、「原理通りに動作しているか」の確認が不足           | 本タスクのテスト（TP-04）で「チャンク間のベクトルが実際に異なること」を定量検証する                                                                  | 今後のEmbedding系タスクのPhase 10レビューに「Late Chunking原理との整合性確認」チェックリスト項目を追加する                   |

### 発見経緯

UNASSIGNED-EMB-005 の review wave（2026-04-19）において、`ChunkingService.getTokenEmbeddings()` が `embeddingClient.embed(segmentText)` を呼ぶ実装に留まっており、真のLate Chunkingが実現されていないことが Phase 10 のfinal review中に判明した。review waveのスコープが「コードの改善」に限定されており、インターフェース設計の変更は対象外として本タスクが分離された。
