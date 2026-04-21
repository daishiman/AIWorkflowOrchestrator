# Phase 9: 品質保証

## メタ情報

| 項目         | 内容                                                  |
| ------------ | ----------------------------------------------------- |
| Phase        | 9                                                     |
| タスクID     | TASK-EMB-LATE-CHUNKING-PIPELINE-INTEGRATION-001       |
| タスク名     | Late Chunking EmbeddingPipeline・設定導線への正式統合 |
| タスク種別   | NON_VISUAL                                            |
| ステータス   | 未実施                                                |
| 作成日       | 2026-04-20                                            |
| 前Phase      | 8: リファクタリング                                   |
| 次Phase      | 10: 最終レビュー                                      |
| GitHub Issue | #2315                                                 |

---

## 目的

TypeScript 型チェック・ESLint・全テスト実行を通じて品質基準をすべて満たしていることを確認し、
Phase 10（最終レビュー）への進行判定を行う。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: TypeScript 型チェックの実行

**目的**: `@repo/shared` パッケージ全体で TypeScript 型エラーがゼロであることを確認する

**実行手順**:

1. 以下のコマンドを実行する

```bash
# 型チェック
pnpm --filter @repo/shared typecheck
```

2. エラーが出力された場合は内容を特定し、修正する
3. エラーゼロを確認したら結果を記録する

**合格基準**: 出力に `error TS` を含まないこと

**特に確認すべき型定義**:

- `PipelineConfig.lateChunking` が `{ enabled: boolean; poolingStrategy?: "mean" | "max" | "cls"; maxTokenLength?: number }` として正しく定義されているか
- `StageTimings.lateChunking` が `number | undefined` として定義されているか
- `EmbeddingPipeline` コンストラクタの `lateChunkingService?` 引数が型安全に定義されているか

**期待される成果物**:

- `outputs/phase-9/quality-check-result.md` の型チェックセクション（実行ログと結果）

---

### タスク2: ESLint 静的解析の実行

**目的**: `@repo/shared` パッケージ全体で ESLint エラーがゼロであることを確認する

**実行手順**:

1. 以下のコマンドを実行する

```bash
# Lint
pnpm --filter @repo/shared lint
```

2. エラー・警告が出力された場合は内容を特定し、修正する
   - `error` レベルの指摘は全て修正する
   - `warning` レベルの指摘は内容を記録し、修正要否を判断する
3. エラーゼロを確認したら結果を記録する

**合格基準**: `0 errors` かつ `0 warnings` であること

**期待される成果物**:

- `outputs/phase-9/quality-check-result.md` の ESLint セクション（実行ログと結果）

---

### タスク3: 全テストの実行と PASS 確認

**目的**: `@repo/shared` の全テストが PASS していることを確認する

**実行手順**:

1. 以下のコマンドで全テストを実行する

```bash
# テスト（全件）
pnpm --filter @repo/shared test
```

2. 全テストが PASS していることを確認する
3. 失敗したテストがある場合は原因を特定し修正する

**合格基準**: FAIL 件数が 0 件であること

**期待される成果物**:

- `outputs/phase-9/quality-check-result.md` のテスト実行セクション（テスト名一覧・PASS 件数・実行時間）

---

### タスク4: EmbeddingPipeline 統合テストの個別実行

**目的**: Late Chunking 統合に関連するテスト（PI-01〜PI-08）が全件 PASS していることを確認する

**実行手順**:

1. 以下のコマンドで統合テストのみを実行する

```bash
# EmbeddingPipeline の統合テストのみ
pnpm --filter @repo/shared test -- embedding-pipeline.integration
```

2. PI-01〜PI-08 の全テストが PASS していることを確認する
3. 各テストの実行時間を記録する

**確認対象テスト（PI-01〜PI-08）**:

| テスト ID | テスト内容                                            |
| --------- | ----------------------------------------------------- |
| PI-01     | Late Chunking 有効時のパイプライン実行                |
| PI-02     | Late Chunking 無効時（通常フロー）のパイプライン実行  |
| PI-03     | `poolingStrategy` の各オプション動作確認              |
| PI-04     | `maxTokenLength` の制約が適用されること               |
| PI-05     | `stageTimings.lateChunking` の記録確認                |
| PI-06     | Late Chunking サービス未設定時の動作                  |
| PI-07     | `PipelineOutput.embeddings` の形式・長さ確認          |
| PI-08     | 既存の通常フロー（`lateChunking` 未設定）の後方互換性 |

**合格基準**: PI-01〜PI-08 が全件 PASS

**期待される成果物**:

- `outputs/phase-9/quality-check-result.md` の統合テストセクション

---

### タスク5: any 型の新規使用チェック

**目的**: 実装コードおよびテストコードに `any` 型が新規追加されていないことを確認する

**実行手順**:

1. 以下のファイルで `any` 型の使用箇所を確認する
   - `packages/shared/src/services/embedding/pipeline/types.ts`
   - `packages/shared/src/services/embedding/pipeline/embedding-pipeline.ts`
   - `packages/shared/src/services/embedding/pipeline/__tests__/embedding-pipeline.integration.test.ts`

2. Phase 8 以前から存在していた `any` との差分を確認する
3. 新規に追加された `any` がある場合は型安全な代替に修正する

**合格基準**: 新規の `any` 型使用がゼロであること

**期待される成果物**:

- `outputs/phase-9/quality-check-result.md` の any 型チェックセクション

---

### タスク6: 品質チェックリストの記入と最終判定

**目的**: タスク1〜5 の結果を集約し、Phase 10 への進行可否を判定する

**品質チェックリスト**:

| ID   | チェック項目                    | 基準                | 結果 |
| ---- | ------------------------------- | ------------------- | ---- |
| QA-1 | TypeScript 型チェック           | エラーなし          |      |
| QA-2 | ESLint                          | エラーなし、警告0件 |      |
| QA-3 | 全テスト                        | PASS                |      |
| QA-4 | any 型の新規使用                | なし                |      |
| QA-5 | 後方互換性（既存テストが PASS） | 既存テストが PASS   |      |

**全項目がチェックされた場合のみ Phase 10 へ進む**

**失敗時の対処フロー**:

| 問題の種類                          | 対処方針                                           |
| ----------------------------------- | -------------------------------------------------- |
| TypeScript 型エラー                 | 型定義を修正し、Phase 8 の変更を再確認             |
| ESLint エラー                       | 指摘箇所を修正する                                 |
| PI-01〜PI-08 が FAIL                | テスト実装を確認し、Phase 5〜7 へ差し戻す          |
| 既存テストが FAIL（後方互換性破壊） | `PipelineConfig` のオプション定義を再確認          |
| any 型の新規使用あり                | 型安全な代替型（型エイリアス・ジェネリクス）に修正 |

**期待される成果物**:

- `outputs/phase-9/quality-check-result.md` の品質ゲート判定セクション

---

## 参照資料

| 参照資料           | パス                                                                                               | 内容                           |
| ------------------ | -------------------------------------------------------------------------------------------------- | ------------------------------ |
| Phase 8 成果物     | `outputs/phase-8/`                                                                                 | リファクタリング結果           |
| 統合テストファイル | `packages/shared/src/services/embedding/pipeline/__tests__/embedding-pipeline.integration.test.ts` | PI-01〜PI-08 の定義            |
| 型定義ファイル     | `packages/shared/src/services/embedding/pipeline/types.ts`                                         | `PipelineConfig` 型定義        |
| パイプライン実装   | `packages/shared/src/services/embedding/pipeline/embedding-pipeline.ts`                            | コンストラクタ・Stage 2.5 実装 |

---

## 成果物

| 成果物           | パス                                      | 内容                                                    |
| ---------------- | ----------------------------------------- | ------------------------------------------------------- |
| 品質チェック結果 | `outputs/phase-9/quality-check-result.md` | typecheck・lint・全テスト・統合テスト・any 型の集約結果 |

---

## サブタスク管理

| サブタスクID | 内容                                 | ステータス |
| ------------ | ------------------------------------ | ---------- |
| ST-9-01      | TypeScript 型チェック実行            | 未実施     |
| ST-9-02      | ESLint 静的解析実行                  | 未実施     |
| ST-9-03      | 全テスト PASS 確認                   | 未実施     |
| ST-9-04      | EmbeddingPipeline 統合テスト個別実行 | 未実施     |
| ST-9-05      | any 型新規使用チェック               | 未実施     |
| ST-9-06      | 品質ゲート最終判定                   | 未実施     |

---

## 完了条件

- [ ] `pnpm --filter @repo/shared typecheck` でエラーゼロを確認している
- [ ] `pnpm --filter @repo/shared lint` でエラーなし・警告 0 件を確認している
- [ ] `pnpm --filter @repo/shared test` で全テストが PASS している
- [ ] PI-01〜PI-08 の全テストが PASS している
- [ ] 新規の `any` 型使用がゼロであることを確認している
- [ ] `outputs/phase-9/quality-check-result.md` が生成されている
- [ ] 品質チェックリスト QA-1〜QA-5 が全てチェックされている

---

## タスク100%実行確認【必須】

- [ ] 本 Phase 内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 次Phase

完了後、以下のファイルを実行してください:

`docs/30-workflows/TASK-EMB-LATE-CHUNKING-PIPELINE-INTEGRATION-001/phase-10-final-review.md`

## 統合テスト連携

- PI-01〜PI-08 と追加テストの全 PASS を quality gate の一部として扱う。
- Phase 10 では本 Phase の集計結果を設計照合マトリクスへ引き継ぐ。
