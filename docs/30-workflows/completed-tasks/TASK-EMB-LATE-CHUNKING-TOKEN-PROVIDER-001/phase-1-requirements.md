# Phase 1: 要件定義

## メタ情報

| 項目                | 内容                                      |
| ------------------- | ----------------------------------------- |
| Phase               | 1                                         |
| タスクID            | TASK-EMB-LATE-CHUNKING-TOKEN-PROVIDER-001 |
| タスク種別          | NON_VISUAL                                |
| implementation_mode | new                                       |
| ステータス          | in_progress                               |
| 作成日              | 2026-04-20                                |

## 目的

`IEmbeddingClient` インターフェースにオプショナルな `getTokenEmbeddings?()` メソッドを追加し、真の Late Chunking（文書全体のトークンレベル隠れ状態を利用したチャンキング）を実現するための要件を確定する。現行の `ChunkingService.getTokenEmbeddings()` は `embed(segmentText)` によるセグメント単位の近似実装にとどまっており、トークンレベルの文脈情報を失っている。本 Phase では既存実装の現状を正確に把握し、拡張仕様・フォールバック仕様・影響範囲を事実ベースで確定する。

## 実行タスク

### Step 0: P50チェック（前提確認）

- `packages/shared/src/services/chunking/interfaces.ts` を読み込み、`IEmbeddingClient` の現在のメソッドシグネチャ一覧（`embed`・`embedBatch` の引数・戻り値型）を把握する
- `packages/shared/src/services/chunking/chunking-service.ts` を読み込み、`getTokenEmbeddings()` の現在の実装（`embed(segmentText)` を呼んでいる箇所）を把握する
- `packages/shared/src/services/chunking/types.ts` が存在するか確認し、既存の型定義一覧を把握する
- `packages/shared/src/services/embedding/` 配下のプロバイダー実装ファイル一覧を確認し、`IEmbeddingClient` を実装しているクラスをすべて特定する

P50 判定結果:

- current branch では token-level provider 契約追加は未完了である
- upstream に取り込まれた前提は置かない
- `implementation_mode` は `new` とする

### Step 1: `IEmbeddingClient` 拡張メソッドシグネチャの決定

- `getTokenEmbeddings?(text: string): Promise<TokenEmbeddingsResult>` をオプショナルメソッドとして追加することを仕様として確定する
- オプショナル（`?`）にすることで既存の `embed()` / `embedBatch()` 実装クラスへの変更が不要であることを確認する
- `TokenEmbeddingsResult` の型定義場所として `packages/shared/src/services/chunking/types.ts` が適切かを確認し、確定する
- `text` 引数が「文書全体のテキスト」を受け取る仕様（セグメントではなく全文）であることを明記する

### Step 2: `TokenEmbeddingsResult` 型の定義場所決定

- `TokenEmbeddingsResult` 型を `packages/shared/src/services/chunking/types.ts` に追加することを確定する
- 型の構造として以下のフィールドを必須とする:
  - `tokens: string[]`（テキストを分割したトークン列）
  - `embeddings: number[][]`（各トークンに対応する隠れ状態ベクトルの配列）
- `tokens.length === embeddings.length` の整合性制約を仕様として明記する
- 将来の拡張（`dimensions?: number` や `modelId?: string` の追加）を妨げない型設計であることを確認する

### Step 3: フォールバック実装仕様の確定

- `getTokenEmbeddings?()` が存在しないクライアント（オプショナルが未実装）に対するフォールバック戦略を確定する
- フォールバック仕様: `embed(text)` を呼び出して得た単一ベクトルを、テキストをスペース分割した概算トークン数分だけ複製して `embeddings` 配列を生成する
- フォールバック時の `tokens` フィールドはテキストをスペース分割した配列とする
- フォールバックは真の Late Chunking ではなく近似であることを `ChunkingService` のコメントに明記する仕様を追加する
- フォールバック処理において `embed()` が正確に1回だけ呼ばれることを受け入れ基準に含める

### Step 4: 既存テストでの `IEmbeddingClient` モック箇所の洗い出し

- `packages/shared/src/` 配下の全テストファイルで `IEmbeddingClient` をモックしている箇所を抽出する
- モック実装で `embed` と `embedBatch` のみを実装しているケースを列挙する（`getTokenEmbeddings` の追加が不要であることを確認する）
- `ChunkingService` のテストファイルを特定し、`getTokenEmbeddings` に関連する既存テスト有無を確認する
- 影響を受ける可能性のあるテストファイルを `outputs/phase-1/interface-inventory.md` に一覧化する

## 受け入れ基準

| 基準ID | 内容                                                                                                       |
| ------ | ---------------------------------------------------------------------------------------------------------- |
| AC-1   | `TokenEmbeddingsResult` 型が `packages/shared/src/services/chunking/types.ts` に定義されている             |
| AC-2   | `IEmbeddingClient` に `getTokenEmbeddings?(text: string): Promise<TokenEmbeddingsResult>` が追加されている |
| AC-3   | `ChunkingService` が `getTokenEmbeddings?()` を呼び出す（クライアントが実装している場合）                  |
| AC-4   | `ChunkingService` が `embed()` にフォールバックする（クライアントが実装していない場合）                    |
| AC-5   | 既存の `embed()` / `embedBatch()` の動作が変わらない                                                       |

## 参照資料

- `packages/shared/src/services/chunking/interfaces.ts`（`IEmbeddingClient` 現在の定義）
- `packages/shared/src/services/chunking/chunking-service.ts`（`getTokenEmbeddings()` 現在の実装）
- `packages/shared/src/services/chunking/types.ts`（型定義ファイル）
- `packages/shared/src/services/embedding/`（既存プロバイダー実装群）
- `docs/30-workflows/UNASSIGNED-EMB-005-late-chunking/`（Late Chunking 背景仕様）

## 実行手順

1. `packages/shared/src/services/chunking/interfaces.ts` を読み込み、`IEmbeddingClient` の全メソッドシグネチャを `outputs/phase-1/requirements.md` に記載する
2. `packages/shared/src/services/chunking/chunking-service.ts` の `getTokenEmbeddings()` 実装を読み込み、現状の近似処理を `outputs/phase-1/requirements.md` に記録する
3. `packages/shared/src/services/chunking/types.ts` の既存型定義を確認し、`TokenEmbeddingsResult` の追加場所として適切かを判断する
4. `packages/shared/src/services/embedding/` 配下のプロバイダー一覧を取得し、`IEmbeddingClient` 実装クラスを `outputs/phase-1/interface-inventory.md` に列挙する
5. テストファイルで `IEmbeddingClient` をモックしている箇所を検索し、影響範囲を `outputs/phase-1/interface-inventory.md` に追記する
6. 受け入れ基準 AC-1〜AC-5 の充足条件を `outputs/phase-1/requirements.md` に記載する

## 統合テスト連携【必須】

Phase 1 は調査・分析フェーズであるため、コード変更は行わない。`packages/shared` の既存テストが引き続き PASS していることを `pnpm --filter @repo/shared test` で確認し、調査作業が既存テストを破壊していないことを記録する。テストケース TP-01〜TP-05 の設計は Phase 2 で行うが、Phase 1 の成果物（`requirements.md` / `interface-inventory.md`）がテスト設計の入力となることを意識して情報を整理する。

## 多角的チェック観点

- 網羅性: `IEmbeddingClient` を実装しているクラスが `embedding/` 配下以外（たとえば `__mocks__/` や `test/` 配下）に存在しないか確認する
- 命名規則: `TokenEmbeddingsResult` という型名が既存の型命名規則（PascalCase・Result サフィックス）と整合しているか確認する
- オプショナル設計の副作用: TypeScript の strict モードで `?.` を使ったオプショナルチェーンが必要になる箇所を事前に特定する
- フォールバックの正確性: 「スペース分割による概算トークン数」がゼロになるエッジケース（空文字列・空白のみ）を仕様に含めるか確認する
- 後方互換性: `IEmbeddingClient` にオプショナルメソッドを追加した場合、既存の型アサーション（`as IEmbeddingClient`）が壊れないかを確認する

## サブタスク管理

| サブタスクID | 内容                                            | 担当Step |
| ------------ | ----------------------------------------------- | -------- |
| ST-1-01      | `IEmbeddingClient` 現在のメソッド一覧の把握     | Step 0   |
| ST-1-02      | `ChunkingService.getTokenEmbeddings()` 現状確認 | Step 0   |
| ST-1-03      | `getTokenEmbeddings?()` シグネチャの確定        | Step 1   |
| ST-1-04      | `TokenEmbeddingsResult` 型の構造と配置の確定    | Step 2   |
| ST-1-05      | フォールバック仕様の確定                        | Step 3   |
| ST-1-06      | 既存モック箇所の洗い出しと影響範囲一覧の作成    | Step 4   |

## 成果物

- `outputs/phase-1/requirements.md`（機能要件・非機能要件・受け入れ基準 AC-1〜AC-5 の詳細を記載）
- `outputs/phase-1/interface-inventory.md`（`IEmbeddingClient` 実装クラス一覧・既存モック箇所一覧・影響範囲をテーブル形式で記載）

## 完了条件

- [ ] `IEmbeddingClient` の現在のメソッドシグネチャが `requirements.md` に記載されている
- [ ] `getTokenEmbeddings?()` のシグネチャ（引数型・戻り値型）が確定し `requirements.md` に記載されている
- [ ] `TokenEmbeddingsResult` の型構造（フィールド名・型・整合性制約）が `requirements.md` に記載されている
- [ ] フォールバック戦略（`embed()` 呼び出し1回・スペース分割による近似）が `requirements.md` に記載されている
- [ ] `IEmbeddingClient` を実装しているクラスと既存モック箇所が `interface-inventory.md` に一覧化されている
- [ ] 受け入れ基準 AC-1〜AC-5 がすべて `requirements.md` に記載されている
- [ ] 既存テストが `pnpm --filter @repo/shared test` で PASS していることが確認されている

## タスク100%実行確認【必須】

以下を順番に確認すること:

1. `interfaces.ts` の `IEmbeddingClient` の全メソッドを `requirements.md` に転記したか
2. `chunking-service.ts` の `getTokenEmbeddings()` の現状実装（近似処理）を記録したか
3. `TokenEmbeddingsResult` の型構造（`tokens: string[]`・`embeddings: number[][]`）を確定し記載したか
4. フォールバック仕様で `embed()` が1回だけ呼ばれることを受け入れ基準に含めたか
5. `interface-inventory.md` に `IEmbeddingClient` 実装クラスと既存モック箇所の両方が記載されているか
6. 受け入れ基準 AC-1〜AC-5 の全項目が記載されているか
7. 既存テストが PASS していることを確認したか

## 次のPhase

Phase 2（設計）へ進む。`requirements.md` と `interface-inventory.md` を入力として、`IEmbeddingClient` 拡張の詳細設計・`MockTokenEmbeddingClient` の設計・テストケース TP-01〜TP-05 の設計を行う。
