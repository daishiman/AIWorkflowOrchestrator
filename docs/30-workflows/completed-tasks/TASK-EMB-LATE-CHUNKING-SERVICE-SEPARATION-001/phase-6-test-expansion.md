# Phase 6: テスト拡充

## メタ情報

| 項目       | 値                                                                       |
| ---------- | ------------------------------------------------------------------------ |
| Phase      | 6                                                                        |
| タスクID   | TASK-EMB-LATE-CHUNKING-SERVICE-SEPARATION-001                            |
| タスク種別 | NON_VISUAL code task                                                     |
| 目的       | 委譲確認・省略時自動生成・エッジケースのテストを追加し回帰耐性を強化する |
| 前Phase    | [phase-5-implementation.md](phase-5-implementation.md)                   |
| 次Phase    | [phase-7-coverage.md](phase-7-coverage.md)                               |

> current fact: テスト拡充対象は `ChunkingLateChunkingAdapter` と `chunking-service.integration.test.ts`。

## 目的

Phase 5 の Green 状態（SEP-01〜SEP-09 全件 PASS）を前提に、以下 3 系統のテストを拡充する。

1. SEP-08/SEP-09 と重複しない委譲経路の追加検証（引数透過・例外伝搬・空配列ハンドリング）
2. `ChunkingService` コンストラクタ第 4 引数を省略した場合の `LateChunkingService` 自動生成動作の検証
3. 境界値・フォールバック・プーリング戦略別のエッジケース網羅

追加するテストは `LateChunkingService.test.ts` と `chunking-service.integration.test.ts` に配置する。SEP-01〜SEP-09 は変更禁止（回帰基準として保護）。

## 拡充観点マトリクス

| 観点             | 内容                                                                                                              | 追加テスト数 |
| ---------------- | ----------------------------------------------------------------------------------------------------------------- | ------------ |
| 委譲確認（深化） | 引数透過（text/chunks/options がそのまま渡る）、Promise 戻り値伝搬、例外伝搬                                      | 3            |
| 自動生成分岐     | 第 4 引数省略 + `embeddingClient` 設定あり / なし、第 4 引数明示注入（モック優先）                                | 3            |
| 境界値           | `chunks=[]`（空）、`text=""`、`chunks.length===1` かつ `position.start === position.end`                          | 3            |
| フォールバック   | `getTokenEmbeddings` が `undefined` を返す、`embeddingClient.getTokenEmbeddings` が未定義（optional method 欠如） | 2            |
| プーリング戦略別 | `mean` / `cls` / `attention` の 3 戦略を同一入力で比較し戻り値が戦略依存で変わることを確認                        | 3            |

追加テスト合計: 14 件（SEP-10〜SEP-23）

## 実行タスク

### Task 1: 委譲経路の追加検証（SEP-10〜SEP-12）

`chunking-service.integration.test.ts` に 3 件を追加する。

| テストID | ファイル内テスト名                                                                         | 入力条件                                           | Assertion                                                                                            |
| -------- | ------------------------------------------------------------------------------------------ | -------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| SEP-10   | `SEP-10: 委譲時に text/chunks/options がそのまま LateChunkingService に渡される`           | `lateChunking.enabled=true`、任意の text と chunks | `mockLateChunkingService.applyLateChunking` が `(text, chunks, options.lateChunking)` で呼び出される |
| SEP-11   | `SEP-11: LateChunkingService が返す Promise がそのまま ChunkingService.chunk に伝搬する`   | `applyLateChunking` がリストを返す                 | `ChunkingService.chunk()` の戻り値に LateChunkingService の戻り値が反映される                        |
| SEP-12   | `SEP-12: LateChunkingService が throw した例外がそのまま ChunkingService.chunk に伝搬する` | `applyLateChunking` が Error を throw              | `ChunkingService.chunk()` が同じ Error で reject される                                              |

### Task 2: 自動生成分岐の検証（SEP-13〜SEP-15）

`chunking-service.integration.test.ts` に 3 件を追加する。

| テストID | ファイル内テスト名                                                                                   | 入力条件                                                                              | Assertion                                                                                                        |
| -------- | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| SEP-13   | `SEP-13: 第 4 引数省略 + embeddingClient 設定あり で LateChunkingService が自動生成される`           | `new ChunkingService(tokenizer, embeddingClient, llmClient)`                          | `lateChunking.enabled=true` の chunk 呼び出しで `metadata.lateChunking.applied === true` が返る                  |
| SEP-14   | `SEP-14: 第 4 引数省略 + embeddingClient 未指定 で LateChunkingService が自動生成されず委譲前に返す` | `new ChunkingService(tokenizer, undefined, llmClient)`                                | `lateChunking.enabled=true` でも `metadata.lateChunking.applied` が未設定または `false` になり元の chunks が返る |
| SEP-15   | `SEP-15: 第 4 引数明示注入が自動生成より優先される`                                                  | `new ChunkingService(tokenizer, embeddingClient, llmClient, mockLateChunkingService)` | `mockLateChunkingService.applyLateChunking` が呼ばれる（自動生成インスタンスは呼ばれない）                       |

### Task 3: 境界値テスト（SEP-16〜SEP-18）

`LateChunkingService.test.ts` に 3 件を追加する。

| テストID | ファイル内テスト名                                                                    | 対象メソッド               | 入力条件                                      | Assertion                                             |
| -------- | ------------------------------------------------------------------------------------- | -------------------------- | --------------------------------------------- | ----------------------------------------------------- |
| SEP-16   | `SEP-16: chunks=[] の applyLateChunking は空配列を返す`                               | `applyLateChunking`        | `chunks=[]`、`text="sample"`                  | 戻り値が `[]`                                         |
| SEP-17   | `SEP-17: text="" の determineChunkBoundaries は空配列または全 0 境界を返す`           | `determineChunkBoundaries` | `text=""`、`chunks=[]`                        | 戻り値が `[]`                                         |
| SEP-18   | `SEP-18: position.start === position.end のチャンクで startToken === endToken を返す` | `determineChunkBoundaries` | `chunks=[{ position: { start: 5, end: 5 } }]` | `boundaries[0].startToken === boundaries[0].endToken` |

### Task 4: フォールバックテスト（SEP-19〜SEP-20）

`LateChunkingService.test.ts` に 2 件を追加する。

| テストID | ファイル内テスト名                                                                                    | 対象メソッド        | 入力条件                                                    | Assertion                                                                                                  |
| -------- | ----------------------------------------------------------------------------------------------------- | ------------------- | ----------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| SEP-19   | `SEP-19: embeddingClient.getTokenEmbeddings が undefined を返すとフォールバックで元 embedding を維持` | `applyLateChunking` | `getTokenEmbeddings = vi.fn().mockResolvedValue(undefined)` | 戻り値のチャンクの `embedding` が入力時の値と等価、または `metadata.lateChunking.applied === false`        |
| SEP-20   | `SEP-20: embeddingClient.getTokenEmbeddings 未定義 (optional 欠如) でフォールバック経路に分岐する`    | `applyLateChunking` | `MockEmbeddingClient` から `getTokenEmbeddings` を削除      | throw せず、フォールバック戻り値が返る（`metadata.lateChunking.applied === false` または元 chunks を返す） |

### Task 5: プーリング戦略別テスト（SEP-21〜SEP-23）

`LateChunkingService.test.ts` に 3 件を追加する。同一の `segmentEmbeddings` / `boundaries` 入力に対し、戦略別に戻り値が変わることを検証する。

| テストID | ファイル内テスト名                                                                     | 対象メソッド          | 入力条件                               | Assertion                                                                                                |
| -------- | -------------------------------------------------------------------------------------- | --------------------- | -------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| SEP-21   | `SEP-21: 同一入力に mean / cls / attention を適用すると戻り値が strategy ごとに異なる` | `poolTokenEmbeddings` | 固定の segmentEmbeddings（2 件重なり） | `resultMean !== resultCls` かつ `resultCls !== resultAttention` を要素比較で確認                         |
| SEP-22   | `SEP-22: cls strategy は最初の重なりセグメントの embedding を返す`                     | `poolTokenEmbeddings` | 重なり 2 件、`strategy="cls"`          | 戻り値が先頭の重なりセグメントの `embedding` と一致                                                      |
| SEP-23   | `SEP-23: attention strategy の重み合計がトークン総重なり数に一致する`                  | `poolTokenEmbeddings` | 重なり 2 件、`strategy="attention"`    | `calculateOverlapTokens` の合計で除算した時の結果と一致することを要素ごとに `toBeCloseTo(..., 5)` で確認 |

### Task 6: エッジケースカタログの記録

Task 1〜5 で追加した 14 件を `outputs/phase-6/edge-case-catalog.md` に以下の列で記録する。

| カタログ項目     | 内容                                                                    |
| ---------------- | ----------------------------------------------------------------------- |
| テストID         | SEP-10〜SEP-23                                                          |
| 分類             | 委譲深化 / 自動生成 / 境界値 / フォールバック / プーリング戦略別        |
| 入力条件         | Task 1〜5 のマトリクス列から転記                                        |
| 期待動作         | Assertion 列から転記                                                    |
| 検証対象ファイル | `LateChunkingService.test.ts` or `chunking-service.integration.test.ts` |

### Task 7: 回帰拡張計画の記録

`outputs/phase-6/regression-expansion-plan.md` に以下を記録する。

- SEP-01〜SEP-09（回帰基準）の変更禁止ポリシー
- SEP-10〜SEP-23 の配置先（`LateChunkingService.test.ts` or `chunking-service.integration.test.ts`）
- 14 件追加後の total テスト件数（= 9 + 14 = 23 件）
- Phase 7 カバレッジ測定の期待対象範囲

## テストマトリクス（追加分サマリー）

| TC 番号 | 配置ファイル                           | 対象メソッド / 関数                                               | 分類             |
| ------- | -------------------------------------- | ----------------------------------------------------------------- | ---------------- |
| SEP-10  | `chunking-service.integration.test.ts` | `ChunkingService.chunk` → `LateChunkingService.applyLateChunking` | 委譲深化         |
| SEP-11  | `chunking-service.integration.test.ts` | `ChunkingService.chunk` → `LateChunkingService.applyLateChunking` | 委譲深化         |
| SEP-12  | `chunking-service.integration.test.ts` | `ChunkingService.chunk` → `LateChunkingService.applyLateChunking` | 委譲深化         |
| SEP-13  | `chunking-service.integration.test.ts` | `ChunkingService` コンストラクタ → 自動生成                       | 自動生成         |
| SEP-14  | `chunking-service.integration.test.ts` | `ChunkingService` コンストラクタ → 自動生成スキップ               | 自動生成         |
| SEP-15  | `chunking-service.integration.test.ts` | `ChunkingService` コンストラクタ → 明示注入優先                   | 自動生成         |
| SEP-16  | `LateChunkingService.test.ts`          | `applyLateChunking`                                               | 境界値           |
| SEP-17  | `LateChunkingService.test.ts`          | `determineChunkBoundaries`                                        | 境界値           |
| SEP-18  | `LateChunkingService.test.ts`          | `determineChunkBoundaries`                                        | 境界値           |
| SEP-19  | `LateChunkingService.test.ts`          | `applyLateChunking`                                               | フォールバック   |
| SEP-20  | `LateChunkingService.test.ts`          | `applyLateChunking`                                               | フォールバック   |
| SEP-21  | `LateChunkingService.test.ts`          | `poolTokenEmbeddings`                                             | プーリング戦略別 |
| SEP-22  | `LateChunkingService.test.ts`          | `poolTokenEmbeddings`                                             | プーリング戦略別 |
| SEP-23  | `LateChunkingService.test.ts`          | `poolTokenEmbeddings`                                             | プーリング戦略別 |

## 実行コマンド

```bash
# 追加テスト込みでの全件実行
pnpm --filter @repo/shared test -- LateChunkingService 2>&1 | tee outputs/phase-6/expansion-run.log
pnpm --filter @repo/shared exec vitest run src/services/chunking/__tests__/chunking-service.integration.test.ts 2>&1 | tee outputs/phase-6/integration-run.log

# 件数確認
grep -c "^\s*it(" packages/shared/src/services/embedding/late-chunking/__tests__/LateChunkingService.test.ts
```

## 期待結果

- SEP-01〜SEP-09（既存）: 9 件 PASS（変更禁止）
- SEP-10〜SEP-23（新規追加）: 14 件 PASS
- 合計 23 件 PASS
- 既存 `chunking-service.integration.test.ts` のその他のテストも PASS（回帰なし）

## 統合テスト連携

- 本 Phase は `chunking-service.integration.test.ts` の境界ケース強化を担う。
- Phase 7 では統合テストを含む coverage 計測結果を再利用する。
- Phase 10 では拡充済み統合テストが回帰防止線として機能しているか確認する。

## 参照資料

| 種別       | パス                                                                                         |
| ---------- | -------------------------------------------------------------------------------------------- |
| 前Phase    | `docs/30-workflows/TASK-EMB-LATE-CHUNKING-SERVICE-SEPARATION-001/phase-5-implementation.md`  |
| 設計事項   | `docs/30-workflows/TASK-EMB-LATE-CHUNKING-SERVICE-SEPARATION-001/phase-2-design.md`          |
| 対象コード | `packages/shared/src/services/embedding/late-chunking/LateChunkingService.ts`                |
| 対象テスト | `packages/shared/src/services/embedding/late-chunking/__tests__/LateChunkingService.test.ts` |
| 対象テスト | `packages/shared/src/services/chunking/__tests__/chunking-service.integration.test.ts`       |
| skill      | `.claude/skills/task-specification-creator/references/phase-template-execution.md`           |

## Canonical Artifacts

| Artifact                  | パス                                           | 必須 |
| ------------------------- | ---------------------------------------------- | ---- |
| regression expansion plan | `outputs/phase-6/regression-expansion-plan.md` | 必須 |
| edge case catalog         | `outputs/phase-6/edge-case-catalog.md`         | 必須 |

`outputs/phase-6/regression-expansion-plan.md` には以下を記録する。

- SEP-01〜SEP-09 を回帰基準として保護するポリシー
- 追加 14 件の配置先ファイルと分類
- テスト件数推移（9 → 23）
- Phase 7 カバレッジ測定への連携内容

`outputs/phase-6/edge-case-catalog.md` には Task 6 の 5 列で全 14 件を記録する。

## 成果物

| 成果物                    | パス                                           |
| ------------------------- | ---------------------------------------------- |
| regression expansion plan | `outputs/phase-6/regression-expansion-plan.md` |
| edge case catalog         | `outputs/phase-6/edge-case-catalog.md`         |

## 完了条件

- [ ] SEP-10〜SEP-12（委譲深化 3 件）を `chunking-service.integration.test.ts` に追加した
- [ ] SEP-13〜SEP-15（自動生成分岐 3 件）を `chunking-service.integration.test.ts` に追加した
- [ ] SEP-16〜SEP-18（境界値 3 件）を `LateChunkingService.test.ts` に追加した
- [ ] SEP-19〜SEP-20（フォールバック 2 件）を `LateChunkingService.test.ts` に追加した
- [ ] SEP-21〜SEP-23（プーリング戦略別 3 件）を `LateChunkingService.test.ts` に追加した
- [ ] 追加 14 件すべてが PASS した
- [ ] SEP-01〜SEP-09 の既存 9 件が改変されず PASS した（回帰基準保護）
- [ ] 既存 `chunking-service.integration.test.ts` のその他テストが回帰なく PASS した
- [ ] `outputs/phase-6/regression-expansion-plan.md` に保護ポリシーと追加計画を記録した
- [ ] `outputs/phase-6/edge-case-catalog.md` に 14 件のエッジケースを記録した

## タスク100%実行確認【必須】

- [ ] Task 1: 委譲経路の追加検証（SEP-10〜SEP-12） 完了
- [ ] Task 2: 自動生成分岐の検証（SEP-13〜SEP-15） 完了
- [ ] Task 3: 境界値テスト（SEP-16〜SEP-18） 完了
- [ ] Task 4: フォールバックテスト（SEP-19〜SEP-20） 完了
- [ ] Task 5: プーリング戦略別テスト（SEP-21〜SEP-23） 完了
- [ ] Task 6: エッジケースカタログの記録 完了
- [ ] Task 7: 回帰拡張計画の記録 完了

## Phase末端アクション【必須】

1. `outputs/phase-6/regression-expansion-plan.md` / `outputs/phase-6/edge-case-catalog.md` を作成し、Canonical Artifacts 一覧に登録する
2. 追加テスト実行ログ（`outputs/phase-6/expansion-run.log` / `outputs/phase-6/integration-run.log`）を保存する
3. `index.md` の Phase 6 ステータスを `completed` に更新する
4. Phase 7 への handoff 情報（カバレッジ測定対象の 9 メソッド + 委譲ロジックを含むファイル一覧）を `outputs/phase-6/regression-expansion-plan.md` に明記する
5. コミット・push・PR 作成は実施しない

## 依存関係

| 依存関係   | 内容                                                                                                            |
| ---------- | --------------------------------------------------------------------------------------------------------------- |
| 前提 Phase | Phase 5（実装・TDD Green）が完了し SEP-01〜SEP-09 が全件 PASS していること                                      |
| 前提成果物 | `outputs/phase-5/implementation-diff-check.md` / `outputs/phase-5/method-migration-map.md` が作成済みであること |
| 前提コード | `LateChunkingService.ts` / `index.ts` が存在し `ChunkingService` 第 4 引数が追加されていること                  |
| 前提テスト | `LateChunkingService.test.ts` と `chunking-service.integration.test.ts` が存在し、Green 状態であること          |
| 後続 Phase | Phase 7（カバレッジ確認）が本 Phase で追加された 14 件を含む全 23 件を対象にカバレッジを測定する                |
