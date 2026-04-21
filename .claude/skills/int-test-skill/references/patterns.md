# 実行パターン集

> **読み込み条件**: スキル実行時、改善検討時
> **更新タイミング**: パターンを発見したら追記

---

## 成功パターン

### MockTokenEmbeddingClient + ChunkingService 統合テストパターン

- **状況**: `IEmbeddingClient`にオプショナルメソッド `getTokenEmbeddings?()` を追加し、Late Chunkingの分岐ロジックを統合テストで検証する必要があった（TASK-EMB-LATE-CHUNKING-TOKEN-PROVIDER-001）
- **アプローチ**:
  1. `MockTokenEmbeddingClient` を `providers/mock-token-embedding-provider.ts` として独立ファイルに配置
  2. `getTokenEmbeddings` を実装したMockと未実装のインラインオブジェクト (`vi.fn()` のみ) を使い分けた
  3. `vi.fn()` で `embed()` と `getTokenEmbeddings()` の両方をスパイし、どちらが呼ばれたかを `toHaveBeenCalledOnce()` / `not.toHaveBeenCalled()` で検証した
  4. 決定論的なベクトル生成: `embeddings[i] = [(i+1)*0.1, (i+1)*0.2, (i+1)*0.3]` でインデックスベース
  5. 不変条件テスト（TP-03）: `tokens.length === embeddings.length` を `expect(result.tokens.length).toBe(result.embeddings.length)` で検証
  6. エラーケース（TP-05）: 長さ不一致の `getTokenEmbeddings` を返すMockで `ChunkingError` スローを検証
- **結果**: オプショナル契約の分岐・不変条件・エラー伝播を決定論的かつ網羅的に検証できた
- **適用条件**: インターフェースにオプショナルメソッドを追加する際の契約テストに汎用的に使える
- **発見日**: 2026-04-21

### テストID体系による整理パターン

- **状況**: 同一 `describe` ブロック内に複数の観点が混在し、どのテストが何を検証するか不明確だった
- **アプローチ**: タスクIDを末尾に付与した `describe` + テストID（TP-01〜TP-05）でブロックを分割した
  ```typescript
  describe("Late Chunking with token-level embeddings", () => {
    describe("TP-01: getTokenEmbeddings を持つクライアントで Late Chunking 適用", () => { ... });
    describe("TP-02: getTokenEmbeddings を持たないクライアントはフォールバック", () => { ... });
    // ...
  });
  ```
- **結果**: テスト失敗時にどの契約が破れたかを即座に特定できた
- **適用条件**: 契約観点が3つ以上あるときに有効
- **発見日**: 2026-04-21

### フォールバック経路の分離テストパターン

- **状況**: `getTokenEmbeddings` が存在する場合は優先、存在しない場合は `embed()` にフォールバックするロジックの両経路をテストしたい
- **アプローチ**:
  - withパターン: `{ embed: vi.fn(), embedBatch: vi.fn(), getTokenEmbeddings: vi.fn().mockResolvedValue({...}) }` を渡す
  - withoutパターン: `{ embed: vi.fn().mockResolvedValue([...]), embedBatch: vi.fn() }` を渡す（`getTokenEmbeddings` キーなし）
- **結果**: 型チェックを通しつつ、両経路の呼び出しを独立して検証できた
- **適用条件**: オプショナルメソッドがある `IEmbeddingClient` 実装のテスト全般
- **発見日**: 2026-04-21

---

## 失敗パターン（避けるべきこと）

### Mockの副作用で実テストが通らないパターン

- **状況**: `beforeEach` の外でMockインスタンスを共有し、前のテストで `vi.fn()` の呼び出し回数がリセットされなかった
- **問題**: `toHaveBeenCalledOnce()` が前のテストの呼び出し分も含んでカウントされ、失敗した
- **原因**: `vi.fn()` はデフォルトでリセットされない。`beforeEach` 外で定義すると状態が引き継がれる
- **教訓**: `vi.fn()` は必ず `beforeEach` ブロック内で再生成するか、`vi.clearAllMocks()` を `beforeEach` で呼ぶ
- **発見日**: 2026-04-21

### Mock型とインターフェース型の乖離パターン

- **状況**: `IEmbeddingClient` に `embedBatch` が追加されたが、テスト内のインラインMockオブジェクトに `embedBatch` を追加し忘れた
- **問題**: TypeScriptの型エラーが発生し、型キャストで回避しようとして型安全性が失われた
- **原因**: インラインオブジェクトで `as IEmbeddingClient` を使うと型チェックが部分的にスキップされる
- **教訓**: インターフェースが変更されたら既存のインラインMockも同時に更新する。`as` キャストより型安全なMockクラスを推奨
- **発見日**: 2026-04-21

### 非同期処理のタイムアウトパターン

- **状況**: `getTokenEmbeddings` の `mockResolvedValue` を設定し忘れ、`mockReturnValue` で Promise でない値を返した
- **問題**: `await client.getTokenEmbeddings(text)` がタイムアウトまたは型エラーになった
- **原因**: Vitest の `vi.fn().mockReturnValue(...)` は同期値を返すため、`await` するとエラーになる
- **教訓**: 非同期メソッドのMockには必ず `mockResolvedValue(...)` または `mockResolvedValueOnce(...)` を使う
- **発見日**: 2026-04-21

---

## ガイドライン

### 不変条件テストは必須

- **状況**: `TokenEmbeddingsResult` のように `tokens` と `embeddings` の長さが一致することを前提とするデータ構造
- **指針**: Mockが正しく不変条件を満たしていることを `expect(result.tokens.length).toBe(result.embeddings.length)` で明示的に検証する。不一致時のエラーも独立したテストケース（TP-05相当）として追加する
- **根拠**: 不変条件を事前確認せずにサービス層でアクセスすると、インデックス外アクセスで実行時エラーが発生し原因追跡が困難になる

### MockはTypeScriptインターフェースを完全に満たす

- **状況**: `IEmbeddingClient` などのインターフェースをMockで実装するとき
- **指針**: `implements IEmbeddingClient` を明示するか、TypeScriptの型推論でインターフェース準拠を保証する。`as unknown as IEmbeddingClient` などの二重キャストは原則禁止
- **根拠**: インターフェース変更時にコンパイルエラーで即座に検出でき、テストとの乖離を防げる

### テスト実行コマンドは固定

- **状況**: `@repo/shared` パッケージの統合テストを実行する際
- **指針**: `pnpm --filter @repo/shared test:run` を使う。`pnpm vitest run` だとフィルターが効かず他パッケージのテストも実行される場合がある
- **根拠**: モノレポ構成のため、パッケージスコープを明示しないと意図しないテストが実行される

### 動的importでのMock分離

- **状況**: 特定のテストケースだけで特別なMock実装を使いたいとき（例: `MockTokenEmbeddingClient`）
- **指針**: `await import("../../embedding/providers/mock-token-embedding-provider")` のように動的importを使ってMockを遅延ロードする
- **根拠**: 全テストでグローバルにimportすると不要なMockが`beforeEach`の初期化に影響しやすい。動的importで使うテストケースにスコープを限定できる
