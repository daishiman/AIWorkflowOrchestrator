# Phase 3: 設計レビュー

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| Phase      | 3                                         |
| タスクID   | TASK-EMB-LATE-CHUNKING-TOKEN-PROVIDER-001 |
| ステータス | pending                                   |
| 作成日     | 2026-04-20                                |
| 入力       | outputs/phase-2/design.md                 |

## 目的

Phase 2 で確定した設計事項 1〜5 および型互換性検証テーブルの妥当性を、実装開始前に多角的な視点でレビューする。型安全性・フォールバック戦略の正確性・型の拡張性・既存動作への影響の各観点で問題がないかを確認し、Phase 4 への進行可否を判定する。MAJOR 以上の問題が検出された場合は Phase 2 へ差し戻す。

## 判定基準

| 判定レベル | 定義                                                         | 対応方針                        |
| ---------- | ------------------------------------------------------------ | ------------------------------- |
| PASS       | 問題なし。設計として承認する                                 | Phase 4 へ進行                  |
| MINOR      | 軽微な懸念点があるが、実装フェーズでの対応で許容できる       | 備考として記録し Phase 4 へ進行 |
| MAJOR      | 設計に誤りまたは重大な漏れがある。Phase 2 への差し戻しが必要 | Phase 2 の該当 Step へ差し戻し  |
| CRITICAL   | 既存機能への破壊的変更または型安全性の根本的な欠陥がある     | Phase 2 の該当 Step へ差し戻し  |

## 実行タスク

### Step 1: 設計事項1 レビュー（`TokenEmbeddingsResult` 型の配置と構造）

確認する内容:

- `packages/shared/src/services/chunking/types.ts` への配置が依存方向として適切か（循環参照が発生しないか）
- `tokens: string[]` と `embeddings: number[][]` のフィールド定義が Late Chunking の用途として十分か
- `interface` の採用が `type alias` と比較して後方互換拡張に有利かを検証する
- `tokens.length === embeddings.length` の整合性制約がインターフェース定義だけでは強制できないことを認識し、バリデーションが `ChunkingService` 側に移譲されていることを確認する

確認観点:

- 型定義に `dimensions` や `modelId` を将来追加したとき、既存コードへの影響が最小限か
- `types.ts` を `interfaces.ts` と `chunking-service.ts` の両方がインポートした場合に循環参照が発生しないか

### Step 2: 設計事項2 レビュー（`IEmbeddingClient.getTokenEmbeddings()` のオプショナル化）

確認する内容:

- `?` によるオプショナル定義が TypeScript の strict モードで正しく機能するか
  - `client.getTokenEmbeddings` を `if` チェックせずに呼び出すと型エラーになることを確認する
  - `client.getTokenEmbeddings?.()` の optional chain が返す型が `Promise<TokenEmbeddingsResult> | undefined` になることを確認する
- 既存の `IEmbeddingClient` 実装クラス（Phase 1 の `interface-inventory.md` に列挙したクラス）に型エラーが発生しないことを確認する
- `implements IEmbeddingClient` を持つクラスがオプショナルメソッドを実装しないでコンパイルが通ることを確認する

確認観点:

- 型アサーション（`as IEmbeddingClient`）で作られた既存オブジェクトが、新しいオプショナルメソッドによって型エラーにならないか
- 将来プロバイダーが `getTokenEmbeddings` を実装した際に、戻り値型が `TokenEmbeddingsResult` に適合しているかを TypeScript が強制できるか

### Step 3: 設計事項3 レビュー（`ChunkingService` フォールバック戦略）

確認する内容:

- フォールバックロジックが既存の Late Chunking 動作（`embed(segmentText)` 近似）を正確に再現しているか
  - 現行実装と設計上のフォールバック実装の差分を比較し、動作の後退がないことを確認する
- `this.embeddingClient.getTokenEmbeddings` の存在チェックが `if` 文（truthy チェック）で正しく機能するか
  - `undefined` と `null` の両方を排除できているかを確認する
- 空文字列・空白のみのエッジケース（`tokens.length === 0` になるケース）を `effectiveTokens` で破綻なく処理しているか
- バリデーション（`tokens.length !== embeddings.length` で `ChunkingError` をスロー）がフォールバックパスでも適用されるか

確認観点:

- フォールバック時に `embed()` が正確に1回だけ呼ばれることを保証する設計になっているか（TP-02 との整合）
- フォールバックの近似処理に関するコメントが実装コードに含まれる設計になっているか（AC-3・AC-4 の文書化）
- 大きなテキストでの `embeddings.map(() => [...singleVector])` によるメモリ使用量への言及があるか

### Step 4: 設計事項4 レビュー（`MockTokenEmbeddingClient` の設計）

確認する内容:

- `embed()` の戻り値（テキスト長依存のベクトル）が決定論的であり、同じ入力に対して常に同じ出力を返すか
- `getTokenEmbeddings()` の戻り値（トークンインデックス依存のベクトル）が各チャンクで異なるベクトルを持つことを保証しているか（TP-04 との整合）
- `tokens.length === embeddings.length` がクラス実装で常に成立するか（TP-03 との整合）
- `dimensions` パラメータが `embed()`・`embedBatch()`・`getTokenEmbeddings()` の全メソッドで一貫して使用されているか

確認観点:

- モックが `IEmbeddingClient` を `implements` しているため、インターフェース変更時にコンパイルエラーで気づける設計になっているか
- テスト間の独立性: `MockTokenEmbeddingClient` のインスタンスを共有した場合に状態が漏れないか（ステートレス設計の確認）
- 配置先（`packages/shared/src/services/embedding/providers/mock-token-embedding-provider.ts`）が適切か、またはテスト用ファイル（`__mocks__/` や `*.test-utils.ts`）のほうが適切かを検討する

### Step 5: 設計事項5 レビュー（テストケース TP-01〜TP-05）

確認する内容:

- TP-01: `getTokenEmbeddings` を持つクライアントで `embed()` が呼ばれないことを、`vi.spyOn` または `jest.fn()` で正確に検証できる設計になっているか
- TP-02: `getTokenEmbeddings` を持たないクライアント（オプショナル未実装のモック）で `embed()` が1回呼ばれることを検証できる設計になっているか
- TP-03: `tokens.length === embeddings.length` の検証が型レベルではなく実行時アサーションとして記述されているか
- TP-04: チャンク境界との対応確認で、異なるチャンクに異なるベクトルが割り当てられることを具体的にどう検証するかが明記されているか
- TP-05: `ChunkingError` のスロー条件（`tokens.length !== embeddings.length`）を意図的に再現できるモックの設計が明記されているか

確認観点:

- TP-01〜TP-05 が受け入れ基準 AC-1〜AC-5 のどれを担保しているかのトレーサビリティが明確か
- 5件のテストケースで「既存の `embed()` / `embedBatch()` の動作が変わらない（AC-5）」を検証するケースが含まれているか（含まれていない場合は追加テストが必要）

### Step 6: 型互換性検証テーブルのレビュー

確認する内容:

- テーブルに記載された4件の検証項目（既存モックの型エラーなし・`MockTokenEmbeddingClient` の型充足・循環参照なし・strict モードでのオプショナルチェーン）が網羅的か
- 検証方法（`pnpm typecheck`・`madge`）が実際にプロジェクトで使用できるか確認する
- 「エラー 0 件」「循環なし」という期待結果が Phase 5 実装後に実際に検証される手順が設計に含まれているか

## Gate: Phase 4 への進行判定

以下の全条件を満たした場合に Phase 4 へ進行する。MAJOR 以上の条件を満たさない場合は Phase 2 へ差し戻す。

| Gate条件                                                            | 判定 | 差し戻し先     |
| ------------------------------------------------------------------- | ---- | -------------- |
| `TokenEmbeddingsResult` の型配置に循環参照リスクがない              | -    | Phase 2 Step 1 |
| オプショナルメソッドの設計が TypeScript strict モードで型安全である | -    | Phase 2 Step 2 |
| フォールバック戦略が既存の Late Chunking 動作を正確に再現している   | -    | Phase 2 Step 3 |
| `MockTokenEmbeddingClient` が決定論的かつステートレスである         | -    | Phase 2 Step 4 |
| TP-01〜TP-05 が AC-1〜AC-5 をカバーしている                         | -    | Phase 2 Step 5 |
| 型互換性検証テーブルの検証方法がプロジェクトで実行可能である        | -    | Phase 2 Step 6 |

## 参照資料

- `outputs/phase-2/design.md`（レビュー対象の設計書）
- `outputs/phase-1/requirements.md`（受け入れ基準 AC-1〜AC-5）
- `outputs/phase-1/interface-inventory.md`（既存モック箇所・影響範囲）
- `packages/shared/src/services/chunking/interfaces.ts`（現在の `IEmbeddingClient` 定義）
- `packages/shared/src/services/chunking/chunking-service.ts`（現在のフォールバック実装）

## 実行手順

1. `outputs/phase-2/design.md` を読み込み、設計事項1〜5 および型互換性検証テーブルを把握する
2. Step 1〜6 の各レビュー観点に対してコメントを記入し、PASS / MINOR / MAJOR / CRITICAL の判定を付与する
3. MAJOR 以上の判定が1件でもある場合、Phase 2 の差し戻し先 Step を特定し、修正内容を具体的に記載する
4. 全判定が PASS または MINOR の場合、Gate テーブルを「承認」で埋めて `gate-decision.md` を作成する
5. `gate-decision.md` に日付・最終判定（Phase 4 進行可 / 差し戻し）・判定理由を記載する

## 統合テスト連携【必須】

Phase 3 はレビューフェーズであるため、コード変更は行わない。レビュー中に発見した問題は `review-result.md` に記録し、MAJOR / CRITICAL の場合のみ Phase 2 への差し戻しを実施する。レビュー完了後に `pnpm --filter @repo/shared test` を実行し、既存テストが引き続き PASS していることを確認する。

## 多角的チェック観点

- トレーサビリティ: TP-01〜TP-05 と AC-1〜AC-5 の対応が `review-result.md` に明示されているか
- 見落としリスク: AC-5（既存動作が変わらない）を検証するテストケースが TP-01〜TP-05 に明示的に含まれていない場合、テストカバレッジのギャップとして指摘する
- 配置の一貫性: `MockTokenEmbeddingClient` の配置先がプロダクションコードのプロバイダー配下に置かれることが適切か、またはテストユーティリティとして分離すべきかをレビューで判断する
- strict モードの徹底: `tsconfig.json` の strict 設定を確認し、オプショナルチェーンのコンパイル動作が実際の設定と一致するかを確認する

## サブタスク管理

| サブタスクID | 内容                                             | 担当Step |
| ------------ | ------------------------------------------------ | -------- |
| ST-3-01      | 設計事項1（型配置・構造）のレビュー              | Step 1   |
| ST-3-02      | 設計事項2（オプショナル化）のレビュー            | Step 2   |
| ST-3-03      | 設計事項3（フォールバック戦略）のレビュー        | Step 3   |
| ST-3-04      | 設計事項4（MockTokenEmbeddingClient）のレビュー  | Step 4   |
| ST-3-05      | 設計事項5（テストケース TP-01〜TP-05）のレビュー | Step 5   |
| ST-3-06      | 型互換性検証テーブルのレビュー                   | Step 6   |
| ST-3-07      | Gate 判定と `gate-decision.md` の作成            | Step 5後 |

## 成果物

- `outputs/phase-3/review-result.md`（設計事項1〜5・型互換性テーブルの各観点レビュー結果・PASS/MINOR/MAJOR/CRITICAL 判定・差し戻し有無を記載）
- `outputs/phase-3/gate-decision.md`（Phase 4 進行可否の最終判定・日付・判定理由・承認記録を記載）

## 完了条件

- [ ] 設計事項1〜5 および型互換性検証テーブルのすべてにレビューコメントと判定（PASS/MINOR/MAJOR/CRITICAL）が記載されている
- [ ] MAJOR 以上の判定がある場合、差し戻し先 Step と修正内容が `review-result.md` に具体的に記載されている
- [ ] Gate テーブルの全6条件に判定が記入されている
- [ ] `gate-decision.md` に最終判定（Phase 4 進行可 / 差し戻し）・日付・判定理由が記載されている
- [ ] 既存テストが `pnpm --filter @repo/shared test` で PASS していることが確認されている

## タスク100%実行確認【必須】

以下を順番に確認すること:

1. 設計事項1〜5 の全5件にレビューコメントと PASS/MINOR/MAJOR/CRITICAL 判定を記入したか
2. 型互換性検証テーブルの全4行にレビューコメントを記入したか
3. Gate テーブルの全6条件に判定を記入したか
4. MAJOR 以上の判定が1件でもある場合、Phase 2 の差し戻し先 Step を特定し `review-result.md` に記載したか
5. `gate-decision.md` に日付・最終判定・判定理由が記載されているか
6. 既存テストが PASS していることを確認したか

## 次のPhase

Gate 判定が「進行可」の場合、Phase 4（テスト作成 Red）へ進む。テストケース TP-01〜TP-05 を実装し、全テストが Red（失敗）状態であることを確認してから Phase 5（実装）へ進む。差し戻しがある場合は Phase 2 の指定 Step を修正してから本 Phase を再実施する。
