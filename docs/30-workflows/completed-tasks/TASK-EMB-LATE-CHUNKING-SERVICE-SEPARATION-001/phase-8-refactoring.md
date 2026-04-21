# Phase 8: リファクタリング

## メタ情報

| 項目       | 値                                                                                                    |
| ---------- | ----------------------------------------------------------------------------------------------------- |
| Phase      | 8                                                                                                     |
| タスクID   | TASK-EMB-LATE-CHUNKING-SERVICE-SEPARATION-001                                                         |
| タスク種別 | NON_VISUAL code task                                                                                  |
| 目的       | `LateChunkingService` への JSDoc 付与・テストの重複モック集約・`chunking-service.ts` 不要 import 整理 |
| 前Phase    | phase-7-coverage.md                                                                                   |
| 次Phase    | phase-9-quality.md                                                                                    |

> current fact: JSDoc 対象は `chunking-late-chunking-adapter.ts`。token-level `LateChunkingService` は本タスク対象外。

## 目的

Phase 5 で移動した 9 メソッドのロジックを変更せず、以下 3 系統のリファクタリングを行い、`LateChunkingService` の可読性・保守性・テスト整合性を最終化する。

1. `LateChunkingService.ts` に JSDoc を付与し、座標系変換（文字位置 → トークン位置 → セグメント位置）の 3 層構造を明示化する
2. `__tests__/LateChunkingService.test.ts` の重複モックセットアップを `beforeEach` に集約する
3. `chunking-service.ts` の Late Chunking 関連の不要 import を削除し、委譲のみが残留していることを確認する

ロジック変更は禁止。公開 API と外部挙動は Phase 5 時点から変更しない。

## 実行タスク

- タスク1: `LateChunkingService.ts` のクラスレベル JSDoc 付与
- タスク2: `applyLateChunking` メソッドレベル JSDoc 付与
- タスク3: `determineChunkBoundaries` メソッドレベル JSDoc 付与（座標系変換の説明含む）
- タスク4: `poolTokenEmbeddings` メソッドレベル JSDoc 付与（pooling 戦略比較含む）
- タスク5: テストファイルの `beforeEach` 集約
- タスク6: `chunking-service.ts` の不要 import 削除
- タスク7: 委譲のみ残留確認（Late Chunking 固有ロジックの完全除去）
- タスク8: Canonical Artifacts（`refactor-decision-log.md` / `jsdoc-coverage.md`）の出力

## 実行手順

### ステップ1: `LateChunkingService.ts` クラスレベル JSDoc

`LateChunkingService` クラス宣言の直前に以下の観点を含む JSDoc を追記する。

| 記述観点     | 内容                                                                                                                              |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| 責務         | Late Chunking アルゴリズム（チャンク境界 → トークン範囲変換・セグメントプーリング・フォールバック）の専任サービス                 |
| 抽出背景     | `ChunkingService` から責務分離され、単独でテスト可能にするためのクラス                                                            |
| 座標系       | 3 層構造: 文字位置 (char) → トークン位置 (token) → セグメント位置 (segment)                                                       |
| 依存         | コンストラクタ注入: `ITokenizer`, `IEmbeddingClient`。`chunking/types.ts` の `Chunk` / `LateChunkingOptions` を参照（一方向参照） |
| pooling 戦略 | `mean` / `cls` / `attention` の 3 戦略を `poolTokenEmbeddings` でサポート                                                         |
| fallback     | トークン重なりが存在しない場合は `findNearestSegment` で最近傍セグメントにフォールバックし、完全失敗を回避する                    |

### ステップ2: `applyLateChunking` メソッドレベル JSDoc

public エントリーポイントに以下を記述する。

| 記述項目         | 内容                                                                                                               |
| ---------------- | ------------------------------------------------------------------------------------------------------------------ |
| 概要             | Late Chunking 処理の統括エントリーポイント。チャンク配列を受け取り、各チャンクに対応する埋め込みを付与して返却する |
| `@param text`    | 元テキスト                                                                                                         |
| `@param chunks`  | `ChunkingStrategy` による初期チャンク配列                                                                          |
| `@param options` | `LateChunkingOptions`（`poolingStrategy` / `maxSequenceLength`）                                                   |
| `@returns`       | `metadata.lateChunking.applied=true` と `embeddingDimension` が付与された `Chunk[]`                                |
| 副作用           | なし（純粋関数。`embeddingClient` への呼び出しはあるが state は持たない）                                          |

### ステップ3: `determineChunkBoundaries` メソッドレベル JSDoc

座標系変換の 3 層構造を明示化する。

| 記述項目        | 内容                                                                                                             |
| --------------- | ---------------------------------------------------------------------------------------------------------------- |
| 概要            | チャンクの文字位置境界をトークン位置境界に変換する                                                               |
| アルゴリズム    | 各チャンクの `position.start` / `position.end`（char）を `charPositionToTokenIndex` でトークンインデックスに変換 |
| 座標系変換      | 文字位置 (char) → トークン位置 (token)。変換は `tokenizer.encode(text.slice(0, charPosition)).length` による近似 |
| 近似誤差        | サブワードトークナイザーや特殊文字エンコーディングにより 1〜2 トークンの誤差が生じる可能性がある旨を明記         |
| `@param chunks` | 初期チャンク配列                                                                                                 |
| `@param text`   | 元テキスト（トークン化に使用）                                                                                   |
| `@returns`      | `Array<{ startToken: number; endToken: number }>`                                                                |

### ステップ4: `poolTokenEmbeddings` メソッドレベル JSDoc

pooling 戦略とフォールバック挙動を明示化する。

| 記述項目                   | 内容                                                                                                                       |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| 概要                       | セグメント埋め込みを、チャンク境界ごとに pooling してチャンク埋め込みを生成する                                            |
| 座標系変換                 | トークン位置 (token) → セグメント位置 (segment)。`hasTokenOverlap` で重なり判定、`calculateOverlapTokens` で重なり数を取得 |
| `mean` 戦略                | 重なりあるセグメントの埋め込みの単純平均                                                                                   |
| `cls` 戦略                 | 最初の重なりセグメントの CLS トークン相当埋め込み                                                                          |
| `attention` 戦略           | 重なりトークン数で重み付けした加重平均                                                                                     |
| フォールバック             | 重なりセグメントがゼロの場合 `findNearestSegment` で最近傍セグメントの埋め込みを返す                                       |
| `@param segmentEmbeddings` | トークン位置付きセグメント埋め込み配列                                                                                     |
| `@param boundaries`        | `determineChunkBoundaries` の出力                                                                                          |
| `@param strategy`          | `"mean"` / `"cls"` / `"attention"` のいずれか                                                                              |
| `@returns`                 | チャンクごとの埋め込みベクトル `number[][]`                                                                                |

### ステップ5: テストの `beforeEach` 集約

`__tests__/LateChunkingService.test.ts` の SEP-01〜SEP-09 で重複しているモックセットアップ（`mockTokenizer` / `mockEmbeddingClient` / `LateChunkingOptions` 共通値）を `beforeEach` に集約する。

| 集約対象                           | 集約前（各テスト内）        | 集約後（`beforeEach`）    |
| ---------------------------------- | --------------------------- | ------------------------- |
| `mockTokenizer` 生成               | 各 `it` 内で `vi.fn()` 生成 | `beforeEach` で一度生成   |
| `mockEmbeddingClient` 生成         | 各 `it` 内で `vi.fn()` 生成 | `beforeEach` で一度生成   |
| `LateChunkingService` インスタンス | 各 `it` 内で `new` 実行     | `beforeEach` で再生成     |
| デフォルト `LateChunkingOptions`   | 各 `it` 内でリテラル定義    | `describe` スコープの定数 |

ただし、テストごとに異なる振る舞いを要求する場合（例: `cls` と `attention` で異なる埋め込み）はその `it` 内でモック返却値を上書きする。

### ステップ6: `chunking-service.ts` の不要 import 削除

Phase 5 で 9 メソッドを移動した結果、`chunking-service.ts` 側で不要になった import を削除する。

| 削除対象候補                                                               | 判定基準                                                      |
| -------------------------------------------------------------------------- | ------------------------------------------------------------- |
| `IEmbeddingClient` の型 import（`LateChunkingService` 経由で使用する場合） | `ChunkingService` の他メソッドで使用しない場合のみ削除        |
| Late Chunking 内部計算用の数値ユーティリティ                               | 移動先でのみ使用されている場合削除                            |
| `LateChunkingOptions`                                                      | `ChunkingService` の public API 型として使用するため **残す** |

`chunking/types.ts` の `LateChunkingOptions` は一方向参照を維持するため移動・削除しないことを再確認する。

### ステップ7: 委譲のみ残留確認

`chunking-service.ts` の `applyLateChunking()` が以下の形のみを残していることを確認する（疑似コード例、実装構造の検証用）。

- `this.lateChunkingService` が未注入かつ `embeddingClient` 未設定の場合は Late Chunking をスキップし元の `chunks` を返す
- それ以外は `this.lateChunkingService.applyLateChunking(text, chunks, options)` に委譲するのみ

Late Chunking 固有のアルゴリズム（`poolTokenEmbeddings` / `hasTokenOverlap` / `findNearestSegment` / `averageEmbeddings` / `charPositionToTokenIndex` / `calculateOverlapTokens` / `determineChunkBoundaries` / `getTokenEmbeddings`）が `chunking-service.ts` に残留していないことを grep で確認する。

```bash
grep -n "poolTokenEmbeddings\|hasTokenOverlap\|findNearestSegment\|averageEmbeddings\|charPositionToTokenIndex\|calculateOverlapTokens\|determineChunkBoundaries\|getTokenEmbeddings" packages/shared/src/services/chunking/chunking-service.ts
```

検出された場合は Phase 5 に戻し、移動漏れを修正する。

### ステップ8: JSDoc カバレッジ計測と記録

クラス 1 個 + メソッド 9 個の合計 10 箇所で JSDoc が付与されているかを確認し、カバレッジを `jsdoc-coverage.md` に記録する。

| 対象                         | JSDoc 付与必須 | 計測方法                                                     |
| ---------------------------- | -------------- | ------------------------------------------------------------ |
| クラス `LateChunkingService` | Yes            | `class LateChunkingService` 宣言直前の `/** */` ブロック確認 |
| `applyLateChunking`          | Yes            | メソッド宣言直前の JSDoc ブロック確認                        |
| `determineChunkBoundaries`   | Yes            | 同上                                                         |
| `poolTokenEmbeddings`        | Yes            | 同上                                                         |
| `getTokenEmbeddings`         | 任意           | private だが座標系関連のため推奨                             |
| `charPositionToTokenIndex`   | 任意           | 近似誤差注記推奨                                             |
| `hasTokenOverlap`            | 任意           | 自明なため最小限可                                           |
| `calculateOverlapTokens`     | 任意           | 自明なため最小限可                                           |
| `findNearestSegment`         | 任意           | タイブレーク条件を記述推奨                                   |
| `averageEmbeddings`          | 任意           | 空配列ガードを記述推奨                                       |

必須 4 箇所（クラス + public 3 メソッド）の JSDoc カバレッジが 100% であることを確認する。

## リファクタリング判断テーブル【必須】

| 対象                            | Before                                   | After                                                     | 理由                                         |
| ------------------------------- | ---------------------------------------- | --------------------------------------------------------- | -------------------------------------------- |
| `LateChunkingService` クラス    | JSDoc なし（移動直後）                   | クラスレベル JSDoc（責務・座標系・pooling 戦略）          | 観測性向上とクラス責務の明文化               |
| `applyLateChunking`             | 移動直後の最小 JSDoc / コメント          | パラメータ・戻り値・副作用を明記した JSDoc                | public API の契約明示                        |
| `determineChunkBoundaries`      | `chunking-service.ts` 由来の簡素コメント | 座標系変換（char → token）と近似誤差を明記した JSDoc      | トークナイザー実装依存の挙動をコーラーに伝達 |
| `poolTokenEmbeddings`           | pooling 戦略の選択ロジックのみコメント   | mean/cls/attention の各式と fallback 挙動を明記した JSDoc | pooling 戦略追加時のドキュメント基盤         |
| テストのモック生成              | 各 `it` 内で重複生成                     | `beforeEach` で共通化                                     | DRY 原則と保守性向上                         |
| `chunking-service.ts` import 群 | Late Chunking 関連型の import を残留     | `LateChunkingOptions` 以外は削除                          | 使用箇所消滅後の不要 import 掃除             |
| `chunking-service.ts` メソッド  | 9 メソッドが残留している疑似状態の検出   | grep で残留ゼロを確認し、検出時は Phase 5 に戻す          | 責務分離の完遂確認                           |

## 統合テスト連携

- JSDoc と import 整理で外部挙動を変えないことを `chunking-service.integration.test.ts` で再確認する。
- Phase 9 の品質ゲートでは統合テスト回帰ゼロを前提に lint / type / test を計測する。
- 委譲のみ残留していることは Phase 10 の method removal check に引き継ぐ。

## 参照資料

| 参照資料                   | パス                                                                                         | 内容                          |
| -------------------------- | -------------------------------------------------------------------------------------------- | ----------------------------- |
| Phase 5 実装成果物         | `outputs/phase-5/implementation-diff-check.md`                                               | 9 メソッド移動の差分          |
| Phase 7 カバレッジレポート | `outputs/phase-7/coverage-report.md`                                                         | カバレッジ達成状況            |
| 実装対象                   | `packages/shared/src/services/embedding/late-chunking/LateChunkingService.ts`                | JSDoc 付与対象                |
| 委譲元                     | `packages/shared/src/services/chunking/chunking-service.ts`                                  | 不要 import 削除対象          |
| テストファイル             | `packages/shared/src/services/embedding/late-chunking/__tests__/LateChunkingService.test.ts` | `beforeEach` 集約対象         |
| 型定義                     | `packages/shared/src/services/chunking/types.ts`                                             | `LateChunkingOptions`（不動） |

## Canonical Artifacts

| 成果物             | パス                                       | 内容                                                  |
| ------------------ | ------------------------------------------ | ----------------------------------------------------- |
| リファクタ判断ログ | `outputs/phase-8/refactor-decision-log.md` | Before/After/理由テーブルとステップ 1〜8 の実行記録   |
| JSDoc カバレッジ   | `outputs/phase-8/jsdoc-coverage.md`        | クラス + 9 メソッドの JSDoc 付与状況と必達 4 箇所達成 |

## 成果物

| 成果物             | パス                                       | 説明                            |
| ------------------ | ------------------------------------------ | ------------------------------- |
| リファクタ判断ログ | `outputs/phase-8/refactor-decision-log.md` | Before/After/理由の意思決定記録 |
| JSDoc カバレッジ   | `outputs/phase-8/jsdoc-coverage.md`        | JSDoc 付与箇所一覧と必須達成率  |

## 完了条件

- [ ] `LateChunkingService` クラスにクラスレベル JSDoc（責務・座標系・pooling 戦略・fallback）を付与した
- [ ] `applyLateChunking` に JSDoc（概要・@param × 3・@returns・副作用）を付与した
- [ ] `determineChunkBoundaries` に JSDoc（概要・アルゴリズム・座標系変換・近似誤差・@param × 2・@returns）を付与した
- [ ] `poolTokenEmbeddings` に JSDoc（概要・座標系・mean/cls/attention 戦略説明・fallback・@param × 3・@returns）を付与した
- [ ] 必達 4 箇所（クラス + public 3 メソッド）の JSDoc カバレッジが 100%
- [ ] `__tests__/LateChunkingService.test.ts` の重複モック生成を `beforeEach` に集約した
- [ ] `chunking-service.ts` から Late Chunking 関連の不要 import を削除した
- [ ] `chunking-service.ts` の `applyLateChunking()` が委譲のみで構成されていることを grep で確認した
- [ ] 9 メソッド名が `chunking-service.ts` から完全に除去されている
- [ ] `LateChunkingOptions` が `chunking/types.ts` に残存し、一方向参照（embedding → chunking）が維持されている
- [ ] Phase 7 のカバレッジがリファクタ後も維持されている（テスト retry で確認）
- [ ] ロジック変更ゼロ（意味論的な挙動変更が発生していない）

## タスク100%実行確認【必須】

- [ ] Task 1: クラス JSDoc 付与 完了
- [ ] Task 2: public 3 メソッド JSDoc 付与 完了
- [ ] Task 3: `beforeEach` 集約 完了
- [ ] Task 4: 不要 import 整理と委譲残留確認 完了

## Phase末端アクション【必須】

1. `outputs/phase-8/refactor-decision-log.md` と `outputs/phase-8/jsdoc-coverage.md` の 2 成果物を作成する。
2. `pnpm --filter @repo/shared test -- LateChunkingService` を再実行し、JSDoc 追加とモック集約後も全件 PASS することを確認する。
3. `chunking-service.ts` への grep で 9 メソッド名がゼロ件であることを確認し、`refactor-decision-log.md` に記録する。
4. ロジック変更が発生した場合は Phase 5 に戻し、リファクタとして許容範囲を超えた変更はタスク外に分離する。
5. `index.md` の Phase 8 ステータスを `completed` に更新し、Phase 9（品質保証）に進む。

## 依存関係

| 前提                                                                    | 理由                                                                  |
| ----------------------------------------------------------------------- | --------------------------------------------------------------------- |
| Phase 7（カバレッジ確認）完了                                           | 総合カバレッジ指数 180%+ 達成後でなければリファクタ影響を検知できない |
| `LateChunkingService.ts` と `chunking-service.ts` の Phase 5 時点の状態 | リファクタ対象が固定されている必要                                    |
| `chunking/types.ts` の `LateChunkingOptions` 不動                       | 一方向参照方針（AC-4）の維持                                          |

後続 Phase：Phase 9（品質保証）で typecheck / lint / full test / targeted test を実行し、品質ゲートを判定する。
