# Contextual Embeddings: 責務分離・専用サービス層抽出 - タスク指示書

## メタ情報

```yaml
task_id: TASK-EMB-CONTEXTUAL-SEPARATION-001
task_name: Contextual Embeddings 責務分離・専用サービス層抽出
category: リファクタリング
target_feature: packages/shared/src/services/chunking/
priority: 中
scale: 中規模
status: 未着手
discovered_from: TASK-EMB-LATE-CHUNKING-SERVICE-SEPARATION-001 Phase-12 task-12-4
created_date: 2026-04-20
github_issue: 2363
```

## メタ情報

| 項目         | 内容                                                             |
| ------------ | ---------------------------------------------------------------- |
| タスクID     | TASK-EMB-CONTEXTUAL-SEPARATION-001                               |
| タスク名     | Contextual Embeddings 責務分離・専用サービス層抽出               |
| 分類         | リファクタリング                                                 |
| 対象機能     | packages/shared/src/services/chunking/                           |
| 優先度       | 中                                                               |
| 見積もり規模 | 中規模                                                           |
| ステータス   | 未着手                                                           |
| 発見元       | TASK-EMB-LATE-CHUNKING-SERVICE-SEPARATION-001 Phase-12 task-12-4 |
| 発見日       | 2026-04-20                                                       |
| GitHub Issue | #2363                                                            |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`packages/shared/src/services/chunking/chunking-service.ts` は以下の複数の責務を単一クラスに抱えている。

1. **チャンキング戦略のファサード**: `FixedChunkingStrategy` / `SentenceChunkingStrategy` 等の統合 ← 本来の責務
2. **Contextual Embeddings処理**: LLMを使ったコンテキスト生成とチャンク拡張 ← **本タスクの分離対象**
3. **Late Chunking処理**: ← **TASK-EMB-LATE-CHUNKING-SERVICE-SEPARATION-001 にて `ChunkingLateChunkingAdapter` として分離済み**

TASK-EMB-LATE-CHUNKING-SERVICE-SEPARATION-001 の完了により Late Chunking 処理は `ChunkingLateChunkingAdapter` として `packages/shared/src/services/embedding/late-chunking/` に移動された。しかし、Contextual Embeddings 処理（`applyContextualEmbeddings()` / `generateContext()` / `truncateDocument()` / `combineContextAndContent()`）は依然 `ChunkingService` に残存しており、SRP 違反が継続している。

### 1.2 問題点・課題

**問題1: `ChunkingService` の単一責任原則違反が継続中**

Late Chunking の分離後も `chunking-service.ts` には LLM を使ったコンテキスト生成ロジックが混在している。このため：

- Contextual Embeddings のコンテキスト生成ロジックを `ChunkingService` の全依存なしに単独でテストできない
- `generateContext()` / `truncateDocument()` などの内部処理が `private` に隠れており、挙動の把握が困難
- LLM プロンプトテンプレート（`DEFAULT_CONTEXT_TEMPLATE`）や `combineContextAndContent()` のロジックが `chunking-service.ts` に埋め込まれており、再利用できない

**問題2: Contextual Embeddings 固有テストの観測可能性が低い**

`ChunkingService` を通じたテストでは、Contextual Embeddings の内部ステップ（コンテキスト生成の正確性・コンテキスト結合位置の検証）を直接確認できない。LLM クライアントのモック設定が `ChunkingService` の全依存と絡み合い、テストのセットアップが複雑になる。

**問題3: 将来の LLM 統合変更で `ChunkingService` がさらに肥大化する**

別の LLM プロバイダーへの切り替えや、コンテキスト生成戦略の追加（e.g., ドキュメント要約型コンテキスト、階層的コンテキスト生成）が発生した場合、`ChunkingService` への変更が必要になり、チャンキング戦略とは無関係な修正が本クラスに集中する。

### 1.3 放置した場合の影響

- `chunking-service.ts` の Contextual Embeddings ロジックのテスト困難性が蓄積し、コンテキスト生成のバグ検出が遅れる
- LLM プロバイダーの変更・追加時に `ChunkingService` への影響が大きくなり、影響範囲特定が困難になる
- `DEFAULT_CONTEXT_TEMPLATE` や `combineContextAndContent()` などの部品を他のコンテキストで再利用できない

---

## 2. 何を達成するか（What）

### 2.1 目的

`ChunkingService` から Contextual Embeddings 処理ロジックを抽出し、独立した `ContextualEmbeddingsAdapter` クラスとして `packages/shared/src/services/embedding/contextual/`（または既存構成に合わせたパス）に移動する。`ChunkingService` は `ContextualEmbeddingsAdapter` に委譲するファサードとして薄くなる。

### 2.2 最終ゴール

1. `ContextualEmbeddingsAdapter`（仮称）が存在し、以下のメソッドを持つ
   - `applyContextualEmbeddings(chunks, wholeDocument, options)`: Contextual Embeddings 処理の統括エントリーポイント
   - `generateContext(chunkContent, wholeDocument, options, cachedContext)`: LLM によるコンテキスト生成
   - `combineContextAndContent(context, content, position)`: コンテキストとチャンクの結合
2. `ChunkingService` の `applyContextualEmbeddings()` が `ContextualEmbeddingsAdapter` に処理を委譲する形になっている
3. Contextual Embeddings 固有のロジックを `ContextualEmbeddingsAdapter` 単独でテストできる（`ChunkingService` のモックが不要）
4. 公開 API（`ChunkingService.chunk()` の入出力）が変化しない（呼び出し元への影響ゼロ）

### 2.3 スコープ

**含むもの**:

- `ContextualEmbeddingsAdapter` クラスの新設
- `ChunkingService.applyContextualEmbeddings()` / `generateContext()` / `truncateDocument()` / `combineContextAndContent()` の移動
- `DEFAULT_CONTEXT_TEMPLATE` 定数の移動
- `ContextualEmbeddingsAdapter` の単体テスト新設
- `ChunkingService` の既存テストが引き続き PASS することの確認

**含まないもの**:

- `ContextualEmbeddingsOptions` 型定義の移動（`chunking/types.ts` に残す。型は chunking 層の公開インターフェースの一部）
- `EmbeddingPipeline` との統合（別タスク）
- LLM クライアントインターフェースの変更

### 2.4 成果物

| ファイル                                                                                          | 変更種別 | 内容                                                              |
| ------------------------------------------------------------------------------------------------- | -------- | ----------------------------------------------------------------- |
| `packages/shared/src/services/embedding/contextual/ContextualEmbeddingsAdapter.ts`                | 新規     | Contextual Embeddings 処理ロジックの独立クラス                    |
| `packages/shared/src/services/embedding/contextual/index.ts`                                      | 新規     | パッケージエクスポート                                            |
| `packages/shared/src/services/embedding/contextual/__tests__/ContextualEmbeddingsAdapter.test.ts` | 新規     | `ContextualEmbeddingsAdapter` の単体テスト                        |
| `packages/shared/src/services/chunking/chunking-service.ts`                                       | 修正     | Contextual Embeddings 処理を `ContextualEmbeddingsAdapter` に委譲 |
| `packages/shared/src/services/chunking/__tests__/chunking-service.integration.test.ts`            | 修正     | 委譲後も既存テストが PASS することを確認                          |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-EMB-LATE-CHUNKING-SERVICE-SEPARATION-001 が完了していること（`ChunkingLateChunkingAdapter` が分離済みであること）
- `chunking-service.ts` の Contextual Embeddings 関連メソッド（`applyContextualEmbeddings` / `generateContext` / `truncateDocument` / `combineContextAndContent`）を熟読していること
- TypeScript クラスの依存注入パターン（コンストラクタ注入）を理解していること

### 3.2 依存タスク

| タスクID                                        | 関係                   | 理由                                                                                     |
| ----------------------------------------------- | ---------------------- | ---------------------------------------------------------------------------------------- |
| TASK-EMB-LATE-CHUNKING-SERVICE-SEPARATION-001   | 先行タスク（完了済み） | `ChunkingLateChunkingAdapter` 分離済みにより、コンストラクタ構成の実績パターンが確立済み |
| TASK-EMB-LATE-CHUNKING-PIPELINE-INTEGRATION-001 | 関連タスク（後続）     | `EmbeddingPipeline` との統合時に `ContextualEmbeddingsAdapter` を利用する可能性あり      |

### 3.3 必要な知識

- TypeScript クラスの抽出リファクタリング（Extract Class パターン）
- コンストラクタ注入（依存性注入）の設計
- Vitest での LLM クライアントのモック手法
- モノレポにおけるパッケージ間の参照（`packages/shared` 内のサブモジュール間参照）

### 3.4 推奨アプローチ

**Extract Class パターン**:

`ChunkingLateChunkingAdapter` の分離実績（TASK-EMB-LATE-CHUNKING-SERVICE-SEPARATION-001）を踏襲し、同じ命名・配置パターンで `ContextualEmbeddingsAdapter` を実装する。

```typescript
// ContextualEmbeddingsAdapter の公開 API 設計（案）
export class ContextualEmbeddingsAdapter {
  constructor(
    private readonly tokenizer: ITokenizer,
    private readonly llmClient: ILLMClient,
  ) {}

  async applyContextualEmbeddings(
    chunks: Chunk[],
    wholeDocument: string,
    options: ContextualEmbeddingsOptions,
  ): Promise<ContextualChunk[]> { ... }

  // テスト可能化のため public に昇格
  async generateContext(
    chunkContent: string,
    wholeDocument: string,
    options: ContextualEmbeddingsOptions,
    cachedContext: string | null,
  ): Promise<string> { ... }

  // テスト可能化のため public に昇格
  combineContextAndContent(
    context: string,
    content: string,
    position: "prefix" | "suffix" | "both",
  ): string { ... }
}
```

**`ChunkingService` の変更方針**:

`applyContextualEmbeddings()` は `ContextualEmbeddingsAdapter` に委譲するだけになる。コンストラクタに `contextualEmbeddingsAdapter?: ContextualEmbeddingsAdapter` をオプショナル引数として追加し、既存の呼び出しを壊さない。

---

## 4. 実行手順（Phase 構成）

> **注記**: 以下の各 Phase は実施時に詳細を検討する。本仕様書は概略構成のみ示す。

### Phase 1: 要件定義

- `chunking-service.ts` の Contextual Embeddings 関連メソッド一覧を確定する
  - `applyContextualEmbeddings()`: Contextual Embeddings 統括エントリーポイント
  - `generateContext()`: LLM によるコンテキスト生成
  - `truncateDocument()`: 文書切り詰め処理
  - `combineContextAndContent()`: コンテキストとチャンク内容の結合
  - `DEFAULT_CONTEXT_TEMPLATE`: デフォルトプロンプトテンプレート定数
- 各メソッドの依存関係を整理する（`tokenizer` / `llmClient` への依存箇所）
- `ContextualEmbeddingsAdapter` の公開メソッドと内部メソッドを決定する
- `ChunkingService` が `ContextualEmbeddingsAdapter` をどのように取得するかを決定する（コンストラクタ注入 vs 内部生成）
- 既存の `ChunkingService` コンストラクタ引数（`tokenizer, embeddingClient, llmClient, lateChunkingAdapter`）への `contextualEmbeddingsAdapter` 追加順序を確定する

### Phase 2: 設計

**設計事項1: `ContextualEmbeddingsAdapter` のコンストラクタシグネチャ**

```typescript
export class ContextualEmbeddingsAdapter {
  constructor(
    private readonly tokenizer: ITokenizer,
    private readonly llmClient: ILLMClient,
  ) {}
}
```

`tokenizer` と `llmClient` は `ChunkingService` からそのまま引き渡す。

**設計事項2: `ChunkingService` への `ContextualEmbeddingsAdapter` の組み込み方法**

オプションA（推奨）: コンストラクタで受け取る（DI 対応）

```typescript
constructor(
  tokenizer: ITokenizer,
  embeddingClient?: IEmbeddingClient,
  llmClient?: ILLMClient,
  lateChunkingAdapter?: ChunkingLateChunkingAdapter, // 既存（4番目）
  contextualEmbeddingsAdapter?: ContextualEmbeddingsAdapter, // 新規（5番目・省略可）
) {
  this.contextualEmbeddingsAdapter = contextualEmbeddingsAdapter
    ?? (llmClient ? new ContextualEmbeddingsAdapter(tokenizer, llmClient) : undefined);
}
```

**設計事項3: ディレクトリ構造**

```
packages/shared/src/services/embedding/contextual/
  ContextualEmbeddingsAdapter.ts
  index.ts
  __tests__/
    ContextualEmbeddingsAdapter.test.ts
```

**設計事項4: テストケース一覧（実施時に確定）**

| テストID | 対象                                                      | 条件                                 | 期待動作                                                               |
| -------- | --------------------------------------------------------- | ------------------------------------ | ---------------------------------------------------------------------- |
| CTX-01   | `ContextualEmbeddingsAdapter.applyContextualEmbeddings()` | 単一チャンク、prefix 位置            | `contextualizedContent` にコンテキストが付与される                     |
| CTX-02   | `ContextualEmbeddingsAdapter.applyContextualEmbeddings()` | 複数チャンク、cacheContext=true      | LLM が1回のみ呼ばれる                                                  |
| CTX-03   | `ContextualEmbeddingsAdapter.generateContext()`           | cachedContext あり                   | LLM を呼ばずにキャッシュを返す                                         |
| CTX-04   | `ContextualEmbeddingsAdapter.generateContext()`           | カスタムテンプレート指定             | テンプレートが置換された後に LLM へ送られる                            |
| CTX-05   | `ContextualEmbeddingsAdapter.combineContextAndContent()`  | position="prefix"                    | `${context}\n\n${content}` の形式で返される                            |
| CTX-06   | `ContextualEmbeddingsAdapter.combineContextAndContent()`  | position="suffix"                    | `${content}\n\n${context}` の形式で返される                            |
| CTX-07   | `ContextualEmbeddingsAdapter.combineContextAndContent()`  | position="both"                      | コンテキストが前後に付与される                                         |
| CTX-08   | `ChunkingService.chunk()`                                 | `contextualEmbeddings.enabled=true`  | `ContextualEmbeddingsAdapter.applyContextualEmbeddings()` に委譲される |
| CTX-09   | `ChunkingService.chunk()`                                 | `contextualEmbeddings.enabled=false` | `ContextualEmbeddingsAdapter` が呼ばれない                             |

### Phase 3: 設計レビュー

- Phase 2 の設計事項 1〜4 をレビューする
- コンストラクタ注入（5番目のオプショナル引数）が既存の `ChunkingService` 呼び出し元に影響しないことを確認する
- `ContextualEmbeddingsOptions` 型が `chunking/types.ts` に残ることで循環参照が発生しないことを確認する（import 方向チェック）
- ディレクトリ構造が `packages/shared/src/services/embedding/` の既存サブモジュール（`late-chunking/`）と整合していることを確認する
- PASS / MINOR / MAJOR / CRITICAL の判定を行い、MAJOR 以上は Phase 2 に差し戻す

### Phase 4: テスト作成（TDD）

`packages/shared/src/services/embedding/contextual/__tests__/ContextualEmbeddingsAdapter.test.ts` を新規作成する。

CTX-01〜CTX-09 のテストスケルトンを作成し、実装前に RED 状態であることを確認する。

### Phase 5: 実装

実施時に詳細を検討する。概略手順：

1. `packages/shared/src/services/embedding/contextual/` ディレクトリを作成する
2. `ContextualEmbeddingsAdapter.ts` を作成する（`chunking-service.ts` からロジックをコピー移動、改変なし）
3. `index.ts` を作成してエクスポートを設定する
4. `chunking-service.ts` を修正する（Contextual Embeddings 関連 private メソッドを削除し、`ContextualEmbeddingsAdapter` への委譲に書き換える）
5. 既存の `ChunkingService` テストが PASS することを確認する

### Phase 6: テスト拡充

- CTX-01〜CTX-09 のテストが全件 PASS することを確認する
- `contextualEmbeddingsAdapter` 引数を省略した場合に自動生成される動作テストを追加する

### Phase 7: カバレッジ確認

実施時に確定する。概略：

```bash
pnpm --filter @repo/shared test --coverage -- ContextualEmbeddingsAdapter
pnpm --filter @repo/shared test --coverage -- chunking-service
```

### Phase 8: リファクタリング

実施時に詳細を検討する。概略：

- `ContextualEmbeddingsAdapter.ts` に JSDoc コメントを付与する
- テストの重複モックセットアップを `beforeEach` に集約する
- `ChunkingService` の `applyContextualEmbeddings()` が委譲のみになったことを確認し、残留ロジックがないか点検する

### Phase 9: 品質保証

実施時に確定する。概略：

```bash
pnpm --filter @repo/shared typecheck
pnpm --filter @repo/shared lint
pnpm --filter @repo/shared test
```

### Phase 10: 最終レビュー

実施時に実施する。確認観点：

- Phase 2 の設計事項 1〜4 がすべて実装に反映されていること
- CTX-01〜CTX-09 が全件 PASS していること
- `chunking-service.ts` から Contextual Embeddings 固有ロジックが完全に除去されていること
- `ContextualEmbeddingsAdapter` 単体でテスト可能であること

### Phase 11: 手動テスト

実施時に詳細を検討する。統合テスト（CTX-01〜CTX-09）が主検証手段のため、手動テストは最小限とする。

### Phase 12: ドキュメント更新

実施時に実施する。概略：

- `ContextualEmbeddingsAdapter.ts` にクラスおよびメソッドレベルの JSDoc を追加する
- 本タスク仕様書のステータスを「実施済み」に更新する
- 関連ワークフロードキュメントの残課題リストを更新する

### Phase 13: PR 作成

ユーザーの明示的承認を得た後に実施する。概略：

```bash
git checkout -b refactor/emb-contextual-separation-001
git commit -m "refactor(embedding): TASK-EMB-CONTEXTUAL-SEPARATION-001 ContextualEmbeddings処理をContextualEmbeddingsAdapterに責務分離"
git push -u origin refactor/emb-contextual-separation-001
gh pr create --title "refactor(embedding): TASK-EMB-CONTEXTUAL-SEPARATION-001 Contextual Embeddings責務分離・専用サービス層抽出" --body "..."
```

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `ContextualEmbeddingsAdapter` が `applyContextualEmbeddings()` / `generateContext()` / `combineContextAndContent()` を持つ
- [ ] `ChunkingService.applyContextualEmbeddings()` が `ContextualEmbeddingsAdapter.applyContextualEmbeddings()` に委譲している
- [ ] `ChunkingService` のコンストラクタが `contextualEmbeddingsAdapter?: ContextualEmbeddingsAdapter` を受け入れる
- [ ] CTX-01〜CTX-09 のテストが全件 PASS している
- [ ] `ContextualEmbeddingsAdapter` 単体でテストが実行可能である（`ChunkingService` への依存なし）

### 後方互換要件

- [ ] `ChunkingService.chunk()` の入出力シグネチャが変化しない
- [ ] 既存の `chunking-service.integration.test.ts` がすべて PASS している
- [ ] `ChunkingService` の既存のコンストラクタ呼び出し（`new ChunkingService(tokenizer, embeddingClient, llmClient)`）が型エラーなしで動作する
- [ ] `ChunkingService` の4引数呼び出し（`new ChunkingService(tokenizer, embeddingClient, llmClient, lateChunkingAdapter)`）が型エラーなしで動作する

### 品質要件

- [ ] `pnpm --filter @repo/shared typecheck` がエラーなしで通過する
- [ ] `pnpm --filter @repo/shared lint` がエラーなしで通過する
- [ ] `pnpm --filter @repo/shared test` が全件パスする
- [ ] `ContextualEmbeddingsAdapter` の全 public メソッドがカバレッジで網羅されている
- [ ] `chunking-service.ts` から Contextual Embeddings 固有のロジックメソッドが完全に除去されている
- [ ] `any` 型の新規使用がない

### ドキュメント要件

- [ ] `ContextualEmbeddingsAdapter` にクラスおよびメソッドレベルの JSDoc コメントが付与されている
- [ ] 本タスク仕様書のステータスが「実施済み」に更新されている

---

## 6. 検証方法

### テストケース

| テストID | 対象                                                      | 入力/操作                            | 期待結果                                                                   | 備考                 |
| -------- | --------------------------------------------------------- | ------------------------------------ | -------------------------------------------------------------------------- | -------------------- |
| CTX-01   | `ContextualEmbeddingsAdapter.applyContextualEmbeddings()` | 単一チャンク、`position=prefix`      | `contextualizedContent` がコンテキスト + 改行 + 元コンテンツの形式である   | 基本動作             |
| CTX-02   | `ContextualEmbeddingsAdapter.applyContextualEmbeddings()` | 複数チャンク、`cacheContext=true`    | LLM の `generate()` が1回のみ呼ばれる                                      | キャッシュ動作       |
| CTX-03   | `ContextualEmbeddingsAdapter.generateContext()`           | `cachedContext` に文字列を渡す       | LLM を呼ばずにそのまま返す                                                 | キャッシュ利用       |
| CTX-04   | `ContextualEmbeddingsAdapter.generateContext()`           | `contextPromptTemplate` を指定       | テンプレートの `{{WHOLE_DOCUMENT}}` / `{{CHUNK_CONTENT}}` が置換されている | カスタムテンプレート |
| CTX-05   | `ContextualEmbeddingsAdapter.combineContextAndContent()`  | `position="prefix"`                  | `${context}\n\n${content}` の形式で返される                                | prefix 結合          |
| CTX-06   | `ContextualEmbeddingsAdapter.combineContextAndContent()`  | `position="suffix"`                  | `${content}\n\n${context}` の形式で返される                                | suffix 結合          |
| CTX-07   | `ContextualEmbeddingsAdapter.combineContextAndContent()`  | `position="both"`                    | `${context}\n\n${content}\n\n${context}` の形式で返される                  | both 結合            |
| CTX-08   | `ChunkingService.chunk()`                                 | `contextualEmbeddings.enabled=true`  | `ContextualEmbeddingsAdapter.applyContextualEmbeddings()` が1回呼ばれる    | 委譲確認             |
| CTX-09   | `ChunkingService.chunk()`                                 | `contextualEmbeddings.enabled=false` | `ContextualEmbeddingsAdapter` が呼ばれない                                 | 非適用確認           |

### 実行コマンド

実施時に確定する。概略：

```bash
# ContextualEmbeddingsAdapter の全テスト
pnpm --filter @repo/shared test -- ContextualEmbeddingsAdapter

# ChunkingService の統合テスト（委譲確認）
pnpm --filter @repo/shared test -- chunking-service.integration

# カバレッジ付き実行
pnpm --filter @repo/shared test --coverage -- ContextualEmbeddingsAdapter
```

---

## 7. リスクと対策

| リスク                                                                                                             | 影響度 | 発生確率 | 対策                                                                                                                                                     |
| ------------------------------------------------------------------------------------------------------------------ | ------ | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ChunkingService` コンストラクタへの5番目引数追加が呼び出し元に影響する                                            | 中     | 低       | 新引数 `contextualEmbeddingsAdapter` はオプショナルにし、既存の4引数以下の呼び出しを壊さない                                                             |
| `ContextualEmbeddingsOptions` 型の import が `embedding/contextual/` から `chunking/types.ts` への逆方向参照になる | 高     | 中       | `ContextualEmbeddingsOptions` は `chunking/types.ts` に残す。`ContextualEmbeddingsAdapter` が `chunking/types.ts` を参照するのは一方向参照のため問題なし |
| `chunking-service.ts` のメソッド移動時にロジックのバグを混入する                                                   | 高     | 低       | Phase 5 ではロジックをコピー移動（改変なし）し、テスト（CTX-01〜CTX-07）を先に書いてから移動する（TDD による保護）                                       |
| `embedding/contextual/` から `chunking/` への参照が循環参照を引き起こす                                            | 高     | 低       | 依存方向を `chunking-service.ts` → `embedding/contextual/` の一方向にする。`chunking/interfaces.ts` は `embedding/contextual/` を参照しない              |
| クラス名 `ContextualEmbeddingsAdapter` が既存クラスと衝突する                                                      | 中     | 低       | 実装前に既存クラス名を検索して衝突がないことを確認する（前回 `LateChunkingService` 名衝突の学びを活かす）                                                |
| LLM クライアントのモックが `ChunkingService` の依存と複雑に絡み合いテストが書きにくい                              | 中     | 中       | `ContextualEmbeddingsAdapter` の単体テストでは `ILLMClient` のみをモックすればよくなり、セットアップが簡素化される。これが本タスクの主目的の一つ         |

---

## 8. 参照情報

### 関連ドキュメント

| 資料名                                          | パス                                                                                   | 説明                           |
| ----------------------------------------------- | -------------------------------------------------------------------------------------- | ------------------------------ |
| TASK-EMB-LATE-CHUNKING-SERVICE-SEPARATION-001   | `docs/30-workflows/unassigned-task/TASK-EMB-LATE-CHUNKING-SERVICE-SEPARATION-001.md`   | 先行タスク・フォーマット参照元 |
| TASK-EMB-LATE-CHUNKING-PIPELINE-INTEGRATION-001 | `docs/30-workflows/unassigned-task/TASK-EMB-LATE-CHUNKING-PIPELINE-INTEGRATION-001.md` | 関連後続タスク                 |

### 関連ファイル

| ファイル                                                                                          | 変更種別 | 内容                                   |
| ------------------------------------------------------------------------------------------------- | -------- | -------------------------------------- |
| `packages/shared/src/services/chunking/chunking-service.ts`                                       | 修正     | Contextual Embeddings 処理を委譲に変更 |
| `packages/shared/src/services/embedding/contextual/ContextualEmbeddingsAdapter.ts`                | 新規     | Contextual Embeddings 処理ロジック     |
| `packages/shared/src/services/embedding/contextual/index.ts`                                      | 新規     | エクスポート                           |
| `packages/shared/src/services/embedding/contextual/__tests__/ContextualEmbeddingsAdapter.test.ts` | 新規     | 単体テスト                             |
| `packages/shared/src/services/chunking/__tests__/chunking-service.integration.test.ts`            | 修正     | 委譲後の動作確認                       |

### 対象コードの現在位置

| メソッド / 定数名             | 現在の位置                      | 移動先                                     |
| ----------------------------- | ------------------------------- | ------------------------------------------ |
| `DEFAULT_CONTEXT_TEMPLATE`    | `chunking-service.ts` (定数)    | `ContextualEmbeddingsAdapter.ts`           |
| `applyContextualEmbeddings()` | `chunking-service.ts` (private) | `ContextualEmbeddingsAdapter.ts` (public)  |
| `generateContext()`           | `chunking-service.ts` (private) | `ContextualEmbeddingsAdapter.ts` (public)  |
| `truncateDocument()`          | `chunking-service.ts` (private) | `ContextualEmbeddingsAdapter.ts` (private) |
| `combineContextAndContent()`  | `chunking-service.ts` (private) | `ContextualEmbeddingsAdapter.ts` (public)  |

---

## 9. 備考

### 苦戦箇所【記入必須】

> **注記**: 本タスクは未着手のため、以下は前回タスク（TASK-EMB-LATE-CHUNKING-SERVICE-SEPARATION-001）からの学びに基づく事前注意点を記載する。実施後に実際の苦戦箇所を追記すること。

| 苦戦箇所（予測）                                                              | 症状（予測）                                                                                                                                                          | 原因                                                                                                 | 対応方針                                                                                                                                                                              | 再発防止                                                                                     |
| ----------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| クラス名の既存クラスとの衝突                                                  | 前回タスクで `LateChunkingService` という名前が既存クラスと衝突し、`ChunkingLateChunkingAdapter` に改名した                                                           | `packages/shared` 内に同名クラスが既存存在していた                                                   | 実装前に `ContextualEmbeddingsAdapter` という名前でプロジェクト全体を検索し、衝突がないことを確認する                                                                                 | Phase 1 の要件定義フェーズに「クラス名の既存クラス衝突チェック」を必須ステップとして追加する |
| `ChunkingService` コンストラクタの後方互換維持                                | `contextualEmbeddingsAdapter` を5番目の引数として追加すると、既存の4引数呼び出しが型エラーになる可能性がある                                                          | TypeScript のコンストラクタ引数追加は既存呼び出し元の型チェックに影響する                            | 5番目のオプショナル引数として追加し、既存の4引数以下の呼び出しを壊さない。`lateChunkingAdapter` が4番目であることを踏まえた引数順序設計をする                                         | コンストラクタ変更の際は「既存呼び出し元の確認」を Phase 1 の必須ステップとして実施する      |
| `embedding/contextual/` から `chunking/types.ts` への参照による循環参照リスク | `ContextualEmbeddingsOptions` 型が `chunking/types.ts` に存在するため、`embedding/contextual/ContextualEmbeddingsAdapter.ts` がこれを import すると循環の可能性がある | モノレポのサブモジュール間参照が双方向になると TypeScript のコンパイルが循環 import エラーを検出する | `ContextualEmbeddingsOptions` を `chunking/types.ts` に残し、`chunking-service.ts` が `embedding/contextual/` を参照する一方向にする。前回タスクの `LateChunkingOptions` と同パターン | Phase 3 の設計レビューに「import 方向チェック」を必須項目として追加する                      |

### 発見経緯

TASK-EMB-LATE-CHUNKING-SERVICE-SEPARATION-001 の実施（2026-04-19〜2026-04-20）において、`chunking-service.ts` から Late Chunking 処理を `ChunkingLateChunkingAdapter` として分離した。その際、Phase-12 task-12-4 のドキュメント更新ステップで「Contextual Embeddings 処理も同様に `ChunkingService` に残存しており、同種の責務分離が必要」と確認された。しかし同タスクのスコープを超えるため、未タスク候補として記録され、本仕様書のフォーマライズに至った。
