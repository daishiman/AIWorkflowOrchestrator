# Phase 1: 要件定義

## メタ情報

| 項目       | 内容                                                     |
| ---------- | -------------------------------------------------------- |
| Phase      | 1                                                        |
| タスクID   | UNASSIGNED-EMB-005-A                                     |
| タスク名   | XenovaTransformerEncoder 実装（IEncoder 具体実装クラス） |
| ステータス | 完了                                                     |
| 作成日     | 2026-04-20                                               |
| 親タスク   | UNASSIGNED-EMB-005（Late Chunking 実装、完了済み）       |
| Issue      | #2312                                                    |

## 目的

`packages/shared/src/services/embedding/late-chunking/late-chunking-types.ts` で抽象化された `IEncoder` インターフェースの「リファレンス具体実装」を `@xenova/transformers` バックエンドで提供し、`LateChunkingService` を即座に実利用可能な状態にする。本Phaseでは「なぜ作るか（Why）」「何を達成すべきか（What）」「成功基準」「スコープ境界」を確定し、Phase 2 設計の入力となる事実ベースの要件を整備する。実装・テストコードは一切作成しない。

## 実行タスク

### Step 0: P50チェック（前提確認）

- 親タスク `UNASSIGNED-EMB-005-late-chunking/index.md` に記載された「依然として残る本体スコープ」が本タスクで解消対象かを確認する
- `late-chunking-types.ts` の `IEncoder` / `EncoderOutput` / `EmbeddingError` / `OutOfMemoryError` の型定義に変更がないことを確認する（変更があれば本タスクの前提が崩れる）
- `late-chunking-service.ts` の `LateChunkingService` コンストラクタが `IEncoder` を DI で受け取る形のままであることを確認する
- `index.ts` から既存4クラス（`LateChunkingService` / `TokenBoundaryCalculator` / `HiddenStatePooler` / `WindowSplitter`）と型がエクスポートされており、`XenovaTransformerEncoder` が未追加であることを確認する
- `pnpm --filter @repo/shared list | grep xenova` で `@xenova/transformers` のインストール有無を確認する（未インストールの場合は Phase 2 で依存追加方針を決定）
- 元仕様書 `docs/30-workflows/unassigned-task/UNASSIGNED-EMB-005-A.md` および `UNASSIGNED-EMB-005-A-iencoder-implementation.md` の差分を確認し、最新版を Issue #2312 本文と突き合わせる

### Step 1: 背景・問題点の整理

- 親タスク `UNASSIGNED-EMB-005` で `IEncoder` 抽象化レイヤーは導入済みだが、リファレンス実装が無い現状を明示する
- 利用者が `@xenova/transformers` の `AutoTokenizer` / `AutoModel` 呼び出しを毎回手書きする必要がある現状の課題を整理する
- エラーハンドリング（モデル読み込み失敗・OOM・テキストエンコード失敗）が利用箇所ごとに重複実装される潜在リスクを記録する
- `offset_mapping` テンソルの `[start0, end0, start1, end1, ...]` 形式から `[number, number][]` への変換が利用者ごとにバグを生みやすい点を記録する

### Step 2: 放置影響の評価

- Late Chunking 機能が「インターフェース定義のみで動かない」状態が継続する影響度を整理する
- ドキュメント・サンプルコード公開ができず、外部紹介・採用が困難になる影響を記録する
- Electron 環境（メイン/レンダラー）での動作確認が後追いで発生し、実装とテストの追跡コストが増大するリスクを記録する

### Step 3: 成功基準とスコープの初期化

- Issue #2312 の AC-1〜AC-8 を基準として、本タスク完了時の判定条件を明文化する
- スコープ内（クラス実装・エラーハンドリング・ユニット/統合テスト・index.ts エクスポート）と、スコープ外（OpenAI 等他バックエンド・E2E動作確認・fine-tuning）を明示分離する
- Phase 2 で扱うべき設計上の論点（型境界・遅延ロード・テンソル変換・エラー分類）を列挙する

## 参照資料

- Issue #2312: `feat(embedding): XenovaTransformerEncoder - IEncoder実装クラス作成（@xenova/transformers連携）[UNASSIGNED-EMB-005-A]`
- 元仕様書: `docs/30-workflows/unassigned-task/UNASSIGNED-EMB-005-A.md`
- 補完仕様書: `docs/30-workflows/unassigned-task/UNASSIGNED-EMB-005-A-iencoder-implementation.md`
- 親タスク index: `docs/30-workflows/UNASSIGNED-EMB-005-late-chunking/index.md`
- 既存型定義: `packages/shared/src/services/embedding/late-chunking/late-chunking-types.ts`
- 既存サービス: `packages/shared/src/services/embedding/late-chunking/late-chunking-service.ts`
- 既存エクスポート: `packages/shared/src/services/embedding/late-chunking/index.ts`
- system spec 正本: `.claude/skills/aiworkflow-requirements/references/llm-embedding.md`
- architecture 正本: `.claude/skills/aiworkflow-requirements/references/architecture-embedding-pipeline.md`
- 外部ライブラリ: `@xenova/transformers`（https://github.com/xenova/transformers.js）

## 実行手順

1. Issue #2312 本文の AC-1〜AC-8 と元仕様書のスコープを突合し、矛盾がないことを確認する
2. `late-chunking-types.ts` から本タスクで実装対象となる契約（`IEncoder`/`EncoderOutput`）を抽出し、`outputs/phase-1/contract-snapshot.md` に転記する
3. `late-chunking-service.ts` 内で `encoder.encode(text)` がどのように使われるか（戻り値の `hiddenStates.length` がトークン数として扱われ、`offsetMapping` が `TokenBoundaryCalculator` に渡される）を整理し、利用シナリオを `outputs/phase-1/usage-scenarios.md` に記録する
4. 受け入れ基準 AC-1〜AC-8 を `outputs/phase-1/acceptance-criteria.md` に転記し、各 AC の検証手段（型チェック / ユニットテスト / 統合テスト / コードレビュー / CI）を再確認する
5. 本Phaseの成果物を Phase 2 の入力として参照可能な状態にする

## 統合テスト連携

Phase 1 は調査・要件定義フェーズであるため、コード変更・テスト追加は行わない。既存 `late-chunking` 関連テストが引き続き PASS していることを `pnpm --filter @repo/shared test -- --run late-chunking` で確認し、要件整理作業が既存テストへ影響を与えていないことを記録する。

## 多角的チェック観点

- 抽象化整合性: `IEncoder` の契約（`Promise<EncoderOutput>` 返却、`hiddenStates: Float32Array[]`、`offsetMapping: [number, number][]`）を逸脱した要件を含めていないか
- 環境依存: Electron メイン/レンダラー両プロセスでの利用想定が要件に含まれているか（含まれない場合はスコープ外として明示）
- セキュリティ: モデル取得時のネットワークアクセス（HuggingFace Hub からのダウンロード）に関する責務をどこが負うかが整理されているか
- パフォーマンス: 初回モデル読み込みの遅延が許容レベルか、繰り返し呼び出し時のキャッシュ戦略を要件として含めるかを判断したか
- エラー伝搬: `EmbeddingError` / `OutOfMemoryError` 以外の異常系（HTTPエラー・ファイル破損）をどこに分類するかの方針が整理されているか

## 受け入れ基準（Issue #2312 AC 反映）

| AC番号 | 条件                                                                                       | 検証方法              |
| ------ | ------------------------------------------------------------------------------------------ | --------------------- |
| AC-1   | `XenovaTransformerEncoder` が `IEncoder` インターフェースを実装している                    | TypeScript コンパイル |
| AC-2   | `encode()` が `hiddenStates: Float32Array[]` と `offsetMapping: [number, number][]` を返す | ユニットテスト        |
| AC-3   | モデル読み込み失敗時に `EmbeddingError` がスローされる                                     | ユニットテスト        |
| AC-4   | OOM 発生時に `OutOfMemoryError` がスローされる                                             | ユニットテスト        |
| AC-5   | コンストラクタでカスタムモデル名を指定できる（既定 `Xenova/all-MiniLM-L6-v2`）             | ユニットテスト        |
| AC-6   | `LateChunkingService` に渡して `generateChunkEmbeddings()` が動作する                      | 統合テスト            |
| AC-7   | `index.ts` から `XenovaTransformerEncoder` がエクスポートされている                        | コードレビュー        |
| AC-8   | 全テストが PASS し、`pnpm typecheck` が PASS する                                          | CI                    |

## サブタスク管理

| サブタスクID | 内容                                                  | 担当Step |
| ------------ | ----------------------------------------------------- | -------- |
| ST-1-01      | P50 前提確認（既存型・サービス・index.ts の現状確認） | Step 0   |
| ST-1-02      | 背景・問題点の整理                                    | Step 1   |
| ST-1-03      | 放置影響の評価                                        | Step 2   |
| ST-1-04      | 成功基準とスコープ境界の確定                          | Step 3   |
| ST-1-05      | AC-1〜AC-8 の検証手段マッピング                       | Step 3   |

## 成果物

- `outputs/phase-1/contract-snapshot.md`（`IEncoder` / `EncoderOutput` の契約写し）
- `outputs/phase-1/usage-scenarios.md`（`LateChunkingService` 内での `encoder.encode()` 利用方法とデータフロー）
- `outputs/phase-1/acceptance-criteria.md`（AC-1〜AC-8 と検証手段の対応表）
- `outputs/phase-1/scope-definition.md`（スコープ内/外の境界・Phase 2 への論点リスト）

## 完了条件

- [ ] `IEncoder` / `EncoderOutput` の契約を変更せずに実装可能であることが確認されている
- [ ] AC-1〜AC-8 が `acceptance-criteria.md` に転記され、検証手段が紐付いている
- [ ] スコープ内/外の境界が `scope-definition.md` に明示されている
- [ ] Phase 2 で扱うべき設計論点（型境界・遅延ロード・テンソル変換・エラー分類）が列挙されている
- [ ] 既存 late-chunking テストが PASS していることを確認した

## タスク100%実行確認【必須】

以下を順番に確認すること:

1. Issue #2312 の AC-1〜AC-8 すべてが `acceptance-criteria.md` に反映されているか
2. `late-chunking-types.ts` の契約に対する変更要求が要件に含まれていないか（含まれていれば本タスクのスコープを逸脱）
3. スコープ外項目（OpenAI 等他バックエンド・E2E・fine-tuning）が明示的に除外されているか
4. Phase 2 への論点リストが Phase 2 設計タスクの入力として十分な粒度で記述されているか
5. 既存 late-chunking テストが `pnpm --filter @repo/shared test -- --run late-chunking` で PASS していることを記録したか

## 次Phase

Phase 2（設計）へ進む。`contract-snapshot.md` と `scope-definition.md` を入力として、`XenovaTransformerEncoder` クラス設計、`loadModel()` 遅延ロード戦略、`encode()` 内部フロー、エラー分類ロジック、`offset_mapping` テンソル変換アルゴリズム、`@xenova/transformers` の型境界を確定する。
