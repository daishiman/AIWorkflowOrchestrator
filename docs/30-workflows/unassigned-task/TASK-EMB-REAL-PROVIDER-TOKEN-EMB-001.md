# TASK-EMB-REAL-PROVIDER-TOKEN-EMB-001: real provider 層への `getTokenEmbeddings` 正式対応

| 項目       | 値                                                              |
| ---------- | --------------------------------------------------------------- |
| タスクID   | TASK-EMB-REAL-PROVIDER-TOKEN-EMB-001                            |
| 優先度     | 中                                                              |
| 依存       | TASK-EMB-LATE-CHUNKING-TOKEN-PROVIDER-001（完了済み）           |
| 関連タスク | TASK-EMB-LATE-CHUNKING-TOKEN-PROVIDER-001（Late Chunking 実装） |
| 作成日     | 2026-04-21                                                      |
| issue番号  | #2371                                                           |

---

## 目的

TASK-EMB-LATE-CHUNKING-TOKEN-PROVIDER-001 で導入した `IEmbeddingClient.getTokenEmbeddings` を、実運用 embedding provider（OpenAI・Anthropic 等）で実際に動作させる。mock と `ChunkingService` bridge のみで留まっている現状を解消し、本番環境で Late Chunking が end-to-end で機能する状態にする。

---

## 背景

TASK-EMB-LATE-CHUNKING-TOKEN-PROVIDER-001 では以下が実装された。

- `IEmbeddingClient` に `getTokenEmbeddings?(text: string): Promise<TokenEmbeddingsResult>` をオプションメソッドとして追加
- `MockTokenEmbeddingProvider` を `packages/shared/src/services/embedding/providers/mock-token-embedding-provider.ts` に作成
- `ChunkingService` が `getTokenEmbeddings` を優先使用し、未実装時は fallback する仕組みを導入
- `TokenEmbeddingsResult = { tokens: string[]; embeddings: number[][] }` の型定義

しかし、上記は mock と `ChunkingService` 側の bridge 実装に留まっており、real provider 層（OpenAI 等の実 API を呼び出す provider クラス群）への `getTokenEmbeddings` 接続は scope out と判定された。

本タスクは TASK-EMB-LATE-CHUNKING-TOKEN-PROVIDER-001 の Phase 12 (unassigned-task-detection) で「`REAL_PROVIDER_TOKEN_EMBEDDINGS_SUPPORT`」として検出された未タスク 1 件目であり、実運用 provider では token-level embedding が未接続のまま残っている問題を解消する。

---

## スコープ

### 含む

- 実運用 embedding provider クラスへの `getTokenEmbeddings` 実装
  - 対象: プロジェクト内に存在する real provider 実装（OpenAI provider 等）
- 各 provider の API 仕様に合わせたトークン分割・embedding 取得ロジック
- `TokenEmbeddingsResult` を返す統一インターフェース準拠
- real provider 向けのユニットテスト（API モック使用）
- `pnpm typecheck && pnpm lint && pnpm --filter @repo/shared test:run` の PASS 確認

### 含まない

- `MockTokenEmbeddingProvider` の変更（既存実装を維持）
- `ChunkingService` の fallback ロジックの変更（既存実装を維持）
- `IEmbeddingClient` インターフェース自体の変更
- 新規 provider の追加（既存 real provider への対応のみ）
- E2E テスト・統合テスト（別タスクで対応）

---

## 受入基準

- [ ] プロジェクト内の real provider クラスが `getTokenEmbeddings` を実装していること
- [ ] 実装が `IEmbeddingClient` の `getTokenEmbeddings` シグネチャ（`(text: string): Promise<TokenEmbeddingsResult>`）に準拠していること
- [ ] `TokenEmbeddingsResult` の `tokens` と `embeddings` が整合していること（`tokens.length === embeddings.length`）
- [ ] `ChunkingService` の fallback が発動せず、real provider の `getTokenEmbeddings` が直接呼ばれること（テストで確認）
- [ ] 各 real provider 向けのユニットテストが追加されており、PASS すること
- [ ] `pnpm typecheck && pnpm lint && pnpm --filter @repo/shared test:run` が全て PASS すること

---

## 苦戦箇所

- **API 仕様差異**: OpenAI 等の実 embedding API はトークン単位の embedding を直接返すエンドポイントを持たない場合がある。テキストを事前にトークン分割し、各トークンの embedding を個別取得する方式や、バッチ取得後に分割する方式など、provider ごとに実装戦略が異なる点に注意が必要
- **トークン分割整合性**: provider 側のトークナイザと `ChunkingService` 側のトークン認識が一致しないと、Late Chunking の精度が低下する。tokenizer の選択（tiktoken 等）と `TokenEmbeddingsResult.tokens` の粒度を揃える設計が重要
- **テスト時の dist/ 未生成問題**: TASK-EMB-LATE-CHUNKING-TOKEN-PROVIDER-001 の実装時と同様に、`pnpm --filter @repo/shared test:run` の初回実行で `dist/` が未生成のままテストが失敗するケースが発生した経緯がある。本タスクでも `pnpm --filter @repo/shared build` を先行実行してから test:run を行う手順を徹底する
- **build verification テストの flaky 挙動**: 前タスクで単体 rerun で PASS する flaky なテストが観測されている。CI 環境でのテスト安定性を確保するため、テスト内で非同期処理の完了を確実に待機する設計が必要

---

## 完了条件

- [ ] real provider クラスに `getTokenEmbeddings` が実装されていること
- [ ] 既存の `ChunkingService` fallback ロジックの動作が変わらないこと（後方互換）
- [ ] 全テスト（ユニットテスト含む）が PASS すること
- [ ] TypeScript 型エラーが 0 件であること
- [ ] ESLint エラーが 0 件であること
