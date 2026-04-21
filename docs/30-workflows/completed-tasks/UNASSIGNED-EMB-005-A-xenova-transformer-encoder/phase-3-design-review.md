# Phase 3: 設計レビュー

## メタ情報

| 項目       | 内容                                                                                                                                                                                                 |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Phase      | 3                                                                                                                                                                                                    |
| タスクID   | UNASSIGNED-EMB-005-A                                                                                                                                                                                 |
| タスク名   | XenovaTransformerEncoder 実装（IEncoder 具体実装クラス）                                                                                                                                             |
| ステータス | 完了                                                                                                                                                                                                 |
| 作成日     | 2026-04-20                                                                                                                                                                                           |
| 入力       | outputs/phase-2/class-design.md, outputs/phase-2/encode-flow.md, outputs/phase-2/error-decision-table.md, outputs/phase-2/tensor-conversion-spec.md, outputs/phase-2/dependency-and-type-boundary.md |

## 目的

Phase 2 で確定した `XenovaTransformerEncoder` 設計の妥当性を実装開始前に多角的にレビューし、Phase 4（テスト Red 設計）への進行可否を判定する。型安全性・テスト容易性・Electron 互換性・メモリ効率・エラー伝搬・並行性の6観点で問題を早期発見し、Phase 2 への差し戻しが必要な場合は具体的な Step 単位で指摘する。

## レビュー観点

### 観点 1: 型安全性

確認内容:

- `XenovaTransformerEncoder implements IEncoder` 宣言により、`encode()` の戻り値型が `Promise<EncoderOutput>` に静的検証されているか（AC-1）
- `tokenizer` / `model` を `unknown` で保持し、利用直前にローカルな型アサーション（`as { ... }`）で境界を局所化する設計が、`any` 漏洩を防いでいるか
- ヘルパ関数 `convertOffsetTensor` / `sliceHiddenStates` の入出力型が明示され、テンソル形状の前提が型レベルで表現されているか
- `EncoderOutput` の `hiddenStates: Float32Array[]` / `offsetMapping: [number, number][]` が `encode()` の最終 return で型推論できるか（AC-2）

判定基準:

- 設計書内に `any` 型の登場が0件、もしくは `@xenova/transformers` 型不安定性の補足コメント付きで局所化されていること
- AC-1 / AC-2 が型レベルで保証されていることを設計書から読み取れること

### 観点 2: テスト容易性

確認内容:

- `convertOffsetTensor` / `sliceHiddenStates` / `classifyError` が純関数として切り出され、Phase 6 のユニットテストで境界条件を独立検証可能か
- `@xenova/transformers` を `vi.mock()` でモック差し替え可能な構造（動的 import + `from_pretrained` 呼び出し）になっているか
- AC-3 / AC-4 / AC-5 のテストシナリオがモックレベルで再現可能か（モデル読み込み失敗時のエラー注入、OOM 模擬の `RangeError` 注入、カスタムモデル名の引数検証）
- AC-6 の統合テストで `LateChunkingService` に `XenovaTransformerEncoder` を DI できるか（`IEncoder` 互換性）

判定基準:

- 全 AC（1〜8）に対するテスト戦略が Phase 2 の設計から導出可能
- ヘルパ関数の単体テスト可能性が確保されている

### 観点 3: Electron 互換性

確認内容:

- 動的 `import("@xenova/transformers")` が Electron メインプロセス（Node.js ランタイム）で動作するか
- レンダラープロセス（contextIsolation 環境）で利用される想定がある場合、`packages/shared` のバンドル設定（ESM/CJS）と整合しているか
- `@xenova/transformers` の ESM-only 出力が `packages/shared` の `tsconfig.json` の `module` / `moduleResolution` 設定と互換か
- モデルファイルのキャッシュパス（`env.cacheDir`）に対する責務が本タスクのスコープ外であることが明示されているか（元仕様書 §6.2 参照）

判定基準:

- `dependency-and-type-boundary.md` に ESM/CJS 互換性チェック項目が記載されていること
- Electron 環境固有の問題が「スコープ外」として明示されているか、もしくは設計上吸収されていること

### 観点 4: メモリ効率

確認内容:

- `Float32Array.slice()` による独立コピーで、元の大きな hidden state テンソルが GC 対象になる設計か
- `seqLen × hiddenSize` の Float32Array 配列を返すことで、`LateChunkingService` 側の `pooler.pool()` がインクリメンタルに処理できるか
- `loadModel()` で読み込んだモデルがインスタンス寿命の間メモリに保持されることのトレードオフが認識されているか
- 大きな入力テキストに対する OOM 検知とフェイルファースト方針が `error-decision-table.md` に明記されているか

判定基準:

- `tensor-conversion-spec.md` に `slice()` 採用理由が記載されている
- OOM 検知パスが2系統（`loadModel` / `encode`）で網羅されている

### 観点 5: エラー伝搬

確認内容:

- 全エラーパスで `cause` が保持され、stack trace が失われないか
- `EmbeddingError` / `OutOfMemoryError` の二重ラップを防ぐガード（`if (cause instanceof EmbeddingError) throw cause`）が設計されているか
- `last_hidden_state` / `hidden_states` 双方が undefined の場合の `EmbeddingError` スローパスが設計されているか
- エラーメッセージに対象モデル名が含まれ、運用デバッグ時の特定が容易か

判定基準:

- `error-decision-table.md` の全行で `cause` 保持と例外型分類が明記されている
- 二重ラップ防止ロジックが擬似コードレベルで設計されている

### 観点 6: 並行性

確認内容:

- 並行 `encode()` 呼び出し時に `loadModel()` が二重実行されないか
- 二重実行を防ぐ場合、内部に `loadingPromise: Promise<void> | null` を保持する Promise キャッシュ方式を採用するかを判断する
- 採用しない場合のリスク（同一モデルの2回ダウンロード・メモリピーク2倍）が許容されるか
- `LateChunkingService` の利用シナリオ（典型的にはシリアル呼び出し）と整合しているか

判定基準:

- 並行性方針（Promise キャッシュ採用 / 採用見送り）が `class-design.md` または本レビュー結果に明記されている
- 採用見送りの場合、利用シナリオがシリアル前提であることが Phase 1 `usage-scenarios.md` から確認できる

## 想定レビュー指摘と対応

| 指摘番号 | 想定指摘                                                                     | 対応方針                                                                                              |
| -------- | ---------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| R-01     | `tokenizer` / `model` の `unknown` 型はテストで操作しにくいのではないか      | テストでは `vi.mock("@xenova/transformers")` でモジュール全体を差し替え、内部状態は触らない           |
| R-02     | `convertOffsetTensor` の奇数長入力時の挙動が未定義                           | Step 4 で「末尾要素破棄」または「`InvalidBoundaryError` スロー」を Phase 3 で確定する                 |
| R-03     | 並行 `encode()` で `loadModel()` が二重実行される                            | 観点 6 の判定に基づき、Promise キャッシュ採用 / 利用シナリオ制約のいずれかを `class-design.md` に明記 |
| R-04     | OOM 検出が `RangeError` と "OOM" 文字列マッチに依存しており脆弱              | 元仕様書 §3.1 のパターンを採用し、将来 `@xenova/transformers` が固有エラー型を提供したら再評価        |
| R-05     | 動的 `import("@xenova/transformers")` がバンドラ（Vite）で問題を起こす可能性 | `packages/shared` の Vite 設定と整合確認、必要なら `optimizeDeps.exclude` の利用を Phase 4 で判断     |

## リスクレジスタ

| リスクID | リスク内容                                                      | 影響度 | 発生確率 | 緩和策                                                                            |
| -------- | --------------------------------------------------------------- | ------ | -------- | --------------------------------------------------------------------------------- |
| RR-01    | `@xenova/transformers` の型定義不安定性で TypeScript エラー発生 | 中     | 中       | `unknown` + ローカル型アサーションで境界を局所化、`@ts-expect-error` は使用しない |
| RR-02    | 初回モデル読み込みで CI 実行時間が増加                          | 低     | 低       | テストでは `vi.mock` により実モデルをロードしない                                 |
| RR-03    | Electron レンダラーで動的 import が失敗                         | 中     | 低       | 本タスクスコープ外（別タスクで E2E 確認）として `scope-definition.md` に明示      |
| RR-04    | `last_hidden_state` の API 形状が将来変更される                 | 低     | 低       | `last_hidden_state ?? hidden_states.at(-1)` で fallback を持たせる                |
| RR-05    | 大きな入力で OOM が `RangeError` ではなく別形式で発生する       | 中     | 低       | `classifyError` を中央集約し、将来パターン追加が一箇所で済むよう設計              |

## Gate: Phase 4 への進行判定

以下の全条件を満たした場合に Phase 4（テスト Red 設計）へ進行する。条件未達の場合は Phase 2 の指定 Step へ差し戻す。

| Gate条件                                                                  | 判定 | 差し戻し先       |
| ------------------------------------------------------------------------- | ---- | ---------------- |
| 観点1: 型安全性が `IEncoder` 契約に準拠していると承認された               | -    | Phase 2 Step 1   |
| 観点2: ヘルパ関数の純関数化によりテスト容易性が確保されていると承認された | -    | Phase 2 Step 4-5 |
| 観点3: Electron / ESM 互換性方針が確定していると承認された                | -    | Phase 2 Step 7   |
| 観点4: メモリ効率（`slice()` 採用・OOM 2系統検知）が承認された            | -    | Phase 2 Step 5-6 |
| 観点5: エラー伝搬（cause 保持・二重ラップ防止）が承認された               | -    | Phase 2 Step 6   |
| 観点6: 並行性方針が `class-design.md` または本レビュー結果に明記された    | -    | Phase 2 Step 1-2 |

## 参照資料

- `outputs/phase-2/class-design.md`
- `outputs/phase-2/encode-flow.md`
- `outputs/phase-2/error-decision-table.md`
- `outputs/phase-2/tensor-conversion-spec.md`
- `outputs/phase-2/dependency-and-type-boundary.md`
- `packages/shared/src/services/embedding/late-chunking/late-chunking-types.ts`（契約の正本）
- `.claude/skills/aiworkflow-requirements/references/llm-embedding.md`
- `.claude/skills/aiworkflow-requirements/references/architecture-embedding-pipeline.md`
- 元仕様書 `docs/30-workflows/unassigned-task/UNASSIGNED-EMB-005-A.md` §3 / §6

## 統合テスト連携

Phase 3 はレビューフェーズであるため、コード変更は行わない。設計レビューの結論を Phase 4 のテスト Red 設計（`xenova-transformer-encoder.test.ts` 想定パターン）と Phase 7 の統合テスト（`LateChunkingService` × `XenovaTransformerEncoder` の DI 検証）に引き継ぎ、AC-6 / AC-8 の検証戦略を確定する。

## 多角的チェック観点（メタレビュー）

- レビュー網羅性: 6観点が AC-1〜AC-8 すべてを少なくとも1観点以上でカバーしているか
- 想定指摘の現実性: R-01〜R-05 が実装時に発生し得る具体的な問題を捕捉しているか
- リスクレジスタ更新性: RR-01〜RR-05 が後続 Phase（4以降）でステータス更新可能な粒度で記述されているか
- Gate 条件の客観性: 各 Gate 条件が定量的または明確な定性基準で判定可能か

## サブタスク管理

| サブタスクID | 内容                             | 担当観点 |
| ------------ | -------------------------------- | -------- |
| ST-3-01      | 型安全性レビュー                 | 観点 1   |
| ST-3-02      | テスト容易性レビュー             | 観点 2   |
| ST-3-03      | Electron / ESM 互換性レビュー    | 観点 3   |
| ST-3-04      | メモリ効率レビュー               | 観点 4   |
| ST-3-05      | エラー伝搬レビュー               | 観点 5   |
| ST-3-06      | 並行性レビュー                   | 観点 6   |
| ST-3-07      | リスクレジスタ初期化             | 全観点   |
| ST-3-08      | Gate 判定と Phase 4 進行可否決定 | 全観点   |

## 成果物

- `outputs/phase-3/review-result.md`（6観点のレビュー結果・判定・差し戻し有無を記載）
- `outputs/phase-3/risk-register.md`（RR-01〜RR-05 の最新ステータス）
- `outputs/phase-3/gate-decision.md`（Phase 4 進行可否の最終判定・承認記録・日付）

## 完了条件

- [ ] 6つのレビュー観点すべてに判定コメントが記載されている
- [ ] 想定指摘 R-01〜R-05 に対する対応方針が確定している
- [ ] リスクレジスタ RR-01〜RR-05 が `risk-register.md` に転記されている
- [ ] 各 Gate 条件に「承認」または「差し戻し」の判定が記載されている
- [ ] 差し戻しがある場合、Phase 2 の該当 Step と修正内容が具体的に記載されている
- [ ] `gate-decision.md` に Phase 4 進行可否の最終判定が日付付きで記録されている

## タスク100%実行確認【必須】

1. 6つのレビュー観点すべてにコメントを記入したか
2. R-01〜R-05 の想定指摘に対する対応方針を `review-result.md` に転記したか
3. RR-01〜RR-05 のリスクレジスタが Phase 4 以降で参照可能な形で `risk-register.md` に保存されているか
4. Gate 条件すべてに判定を記入したか
5. 差し戻しがある場合、Phase 2 の指定 Step を修正し再レビューを実施したか
6. `gate-decision.md` に日付・判定・承認者（または自動承認の場合はその旨）を記載したか

## 次Phase

Gate 判定が「進行可」の場合、Phase 4（テスト Red 設計：`xenova-transformer-encoder.test.ts` のテストケース設計）へ進む。差し戻しがある場合は Phase 2 の指定 Step を修正してから本 Phase を再実施する。リスクレジスタは Phase 4 以降の各 Phase 完了時に更新するルールとする。
