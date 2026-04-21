# Phase 8: リファクタリング

## メタ情報

| 項目       | 内容                                                  |
| ---------- | ----------------------------------------------------- |
| Phase      | 8                                                     |
| タスクID   | TASK-EMB-LATE-CHUNKING-PIPELINE-INTEGRATION-001       |
| タスク名   | Late Chunking EmbeddingPipeline・設定導線への正式統合 |
| 前提Phase  | Phase 7                                               |
| 後続Phase  | Phase 9                                               |
| 作成日     | 2026-04-20                                            |
| ステータス | 未実施                                                |

## 目的

Issue #2315 Phase 8 の内容として、Phase 5〜7 で実装・検証した Late Chunking 統合コードの可読性・保守性・型安全性を向上させる。機能変更は行わず、テストは全件 PASS を維持する。

## 背景

Phase 5 で追加した Late Chunking 分岐処理は `process()` メソッド内にインラインで記述されており、可読性改善の余地がある。またテストの重複モックセットアップや型アサーションの除去も検討対象となる。

## リファクタリングルール（絶対遵守）

1. **機能変更禁止**: 外部から観測可能な動作を変更してはならない
2. **テスト全件 PASS の維持**: リファクタリング前後で `pnpm --filter @repo/shared test -- embedding-pipeline` が全件 PASS すること
3. **カバレッジの非低下**: Phase 7 で確認したカバレッジ値を下回らないこと
4. **段階的実施**: 各検討事項を個別に適用し、適用ごとにテストを実行して確認する

---

## 実行タスク

### タスク1: Stage 2.5 の Late Chunking 処理を `runLateChunkingStage()` に抽出する

**目的**: `process()` の可読性を向上させる

**検討内容**:

`process()` 内の Stage 2.5 処理（Late Chunking 有効時の分岐・タイミング計測・`generateChunkEmbeddings()` 呼び出し）を `private runLateChunkingStage()` メソッドに抽出することを検討する。

**Before（概略）**:

```typescript
async process(document: Document): Promise<EmbeddingResult[]> {
  // Stage 1 ...
  // Stage 2 ...

  // Stage 2.5: Late Chunking
  if (this.config.lateChunking?.enabled && this.lateChunkingService) {
    const lateChunkingStart = Date.now();
    // generateChunkEmbeddings の呼び出し処理（複数行）
    stageTimings.lateChunking = Date.now() - lateChunkingStart;
  }

  // Stage 3 ...
}
```

**After（概略）**:

```typescript
async process(document: Document): Promise<EmbeddingResult[]> {
  // Stage 1 ...
  // Stage 2 ...

  // Stage 2.5: Late Chunking
  const lateChunkingOutput = await this.runLateChunkingStage(chunks, stageTimings);

  // Stage 3 ...
}

private async runLateChunkingStage(
  chunks: Chunk[],
  stageTimings: StageTimings,
): Promise<LateChunkingOutput | null> {
  if (!this.config.lateChunking?.enabled || !this.lateChunkingService) {
    return null;
  }
  const start = Date.now();
  const output = await this.embeddingService.generateChunkEmbeddings(/* ... */);
  stageTimings.lateChunking = Date.now() - start;
  return output;
}
```

**判断基準**: 抽出によって `process()` の見通しが改善し、`runLateChunkingStage()` 自体も単体で理解できる場合のみ抽出する。コード行数増加が明らかに保守性を下げる場合は非抽出判断を記録する。

**作業手順**:

1. 抽出の要否を判断し、理由を `outputs/phase-8/refactoring-log.md` に記録する
2. 抽出する場合のみ実装する
3. 実装後に `pnpm --filter @repo/shared test -- embedding-pipeline` を実行し全件 PASS を確認する

---

### タスク2: `convertLateChunkingToEmbeddingResults()` の責務配置を検討する

**目的**: 責務の適切な配置を判断し、必要であれば移動する

**検討内容**:

`convertLateChunkingToEmbeddingResults()` は `LateChunkingService` の出力を `EmbeddingResult[]` に変換するロジックである。このロジックが `EmbeddingPipeline` に存在すべきか、`LateChunkingService` 側（または専用の変換ユーティリティ）に移動すべきかを検討する。

**判断観点**:

| 観点                     | `EmbeddingPipeline` に残す場合       | `LateChunkingService` に移動する場合 |
| ------------------------ | ------------------------------------ | ------------------------------------ |
| `EmbeddingResult` の知識 | パイプラインが持つのが自然           | サービスが持つと結合度が上がる       |
| 変換ロジックの再利用性   | パイプライン内でのみ使用するなら不要 | 他箇所からも変換が必要なら移動を検討 |
| テスト容易性             | パイプラインのテストでカバー済み     | 移動すると別テストが必要になる       |

**作業手順**:

1. 判断結果と理由を `outputs/phase-8/refactoring-log.md` に記録する
2. 移動する場合のみ実装し、移動後にテストを実行して全件 PASS を確認する
3. 移動しない場合は非移動判断を記録して次のタスクに進む

---

### タスク3: テストの重複モックセットアップを `beforeEach` に集約する

**目的**: テストコードの DRY 化と保守性向上

**対象ファイル**: `packages/shared/src/services/embedding/pipeline/__tests__/embedding-pipeline.integration.test.ts`

**確認手順**:

1. テストファイルを開き、`LateChunkingService` モックのセットアップが各テストケースで重複していないかを確認する
2. 重複がある場合は `beforeEach` ブロックに集約する

**Before（概略）**:

```typescript
it("PI-LC-01: ...", async () => {
  const mockLateChunkingService = {
    applyLateChunking: vi.fn().mockResolvedValue({ chunks: [...] }),
  };
  // ...
});

it("PI-LC-02: ...", async () => {
  const mockLateChunkingService = {
    applyLateChunking: vi.fn().mockResolvedValue({ chunks: [...] }),
  };
  // ...
});
```

**After（概略）**:

```typescript
let mockLateChunkingService: MockLateChunkingService;

beforeEach(() => {
  mockLateChunkingService = {
    applyLateChunking: vi.fn().mockResolvedValue({ chunks: [...] }),
  };
});

it("PI-LC-01: ...", async () => {
  // mockLateChunkingService を使用する
});

it("PI-LC-02: ...", async () => {
  // mockLateChunkingService を使用する
});
```

**注意**: テストケース固有のモック挙動（異なる戻り値が必要なケースなど）は `beforeEach` に集約せず、各テスト内で `vi.fn().mockResolvedValueOnce()` 等で上書きする。

**作業手順**:

1. 重複の有無を確認し、重複がある場合のみ集約を実施する
2. 集約後に `pnpm --filter @repo/shared test -- embedding-pipeline` を実行し全件 PASS を確認する

---

### タスク4: 不要な型アサーションと `any` を除去する

**目的**: 型安全性の向上

**対象**: `embedding-pipeline.ts` および `embedding-pipeline.integration.test.ts` 内の以下のパターン

- `as unknown as SomeType` 形式の型アサーション
- `any` 型の使用
- 不要な型キャスト

**確認手順**:

1. 対象ファイルを検索し、上記パターンが存在するかを確認する
2. 存在する場合、適切な型定義・型推論・ジェネリクスに置き換えられるかを検討する
3. 置き換えが可能かつ安全な場合のみ修正する
4. 修正後に `pnpm --filter @repo/shared typecheck` および `pnpm --filter @repo/shared test -- embedding-pipeline` を実行して確認する

**判断基準**: 型アサーション除去によって型エラーが発生する場合は、型定義の修正が必要かどうかも合わせて検討する。型定義の修正がスコープ外になる場合は非除去判断を記録する。

---

### タスク5: リファクタリング後の最終確認

**実行手順**:

1. 全テストを実行する

```bash
pnpm --filter @repo/shared test -- embedding-pipeline
```

2. 全件 PASS を確認する

3. カバレッジを計測し、Phase 7 の計測値を下回っていないことを確認する

```bash
pnpm --filter @repo/shared test --coverage -- embedding-pipeline
```

4. TypeScript 型エラーがないことを確認する

```bash
pnpm --filter @repo/shared typecheck
```

5. `git diff` でリファクタリング前後の差分を確認し、意図しない機能変更がないことを確認する

**期待される成果物**:

- `outputs/phase-8/refactoring-log.md`（各検討事項の Before/After/判断理由、最終確認結果を記載）

---

## レビュー対象チェックリスト

リファクタリング完了後、以下を確認してからレビューに出すこと。

| チェック項目                                                                 | 確認方法                                                           | 結果 |
| ---------------------------------------------------------------------------- | ------------------------------------------------------------------ | ---- |
| `process()` の可読性が向上しているか（または非抽出理由あり）                 | コードレビュー / `refactoring-log.md` 参照                         |      |
| `convertLateChunkingToEmbeddingResults()` の配置が適切か                     | `refactoring-log.md` の判断記録を参照                              |      |
| テストの重複モックセットアップが除去されているか（または除去不要の理由あり） | テストファイルのコードレビュー                                     |      |
| `as unknown as` / `any` が除去されているか（または除去不可理由あり）         | `pnpm --filter @repo/shared typecheck`                             |      |
| 全テストが PASS しているか                                                   | `pnpm --filter @repo/shared test -- embedding-pipeline`            |      |
| カバレッジが Phase 7 の値を下回っていないか                                  | `pnpm --filter @repo/shared test --coverage -- embedding-pipeline` |      |
| TypeScript 型エラーがないか                                                  | `pnpm --filter @repo/shared typecheck`                             |      |
| `git diff` で意図しない機能変更がないか                                      | `git diff` の確認                                                  |      |

---

## 参照資料

| 参照資料               | パス                                                                                               | 内容                     |
| ---------------------- | -------------------------------------------------------------------------------------------------- | ------------------------ |
| パイプライン実装       | `packages/shared/src/services/embedding/pipeline/embedding-pipeline.ts`                            | リファクタリング対象     |
| 統合テストファイル     | `packages/shared/src/services/embedding/pipeline/__tests__/embedding-pipeline.integration.test.ts` | リファクタリング対象     |
| Phase 7 カバレッジ結果 | `outputs/phase-7/coverage-raw-output.md`                                                           | カバレッジ非低下の基準値 |
| Phase 5 実装サマリー   | `outputs/phase-5/implementation-summary.md`                                                        | 実装差分の参照           |

---

## 成果物

| 成果物                   | パス                                                                                               | 内容                                             |
| ------------------------ | -------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| リファクタリングログ     | `outputs/phase-8/refactoring-log.md`                                                               | 各検討事項の Before/After/判断理由・最終確認結果 |
| 修正済みパイプライン実装 | `packages/shared/src/services/embedding/pipeline/embedding-pipeline.ts`                            | リファクタリング適用済み（実施した場合）         |
| 修正済みテストファイル   | `packages/shared/src/services/embedding/pipeline/__tests__/embedding-pipeline.integration.test.ts` | `beforeEach` 集約済み（実施した場合）            |

---

## 多角的チェック観点

| 観点                       | チェック内容                                                                       |
| -------------------------- | ---------------------------------------------------------------------------------- |
| 機能不変性                 | リファクタリング前後で `process()` の入出力が変わっていないか                      |
| テスト全件 PASS            | リファクタリング後も全テストが GREEN であるか                                      |
| カバレッジ非低下           | Phase 7 の計測値を下回っていないか                                                 |
| 非実施判断の記録           | 実施しなかった検討事項に理由が記録されているか（非実施も成果物として扱う）         |
| 型安全性                   | `any` / `as unknown as` が除去されているか、または除去不可の理由が記録されているか |
| コミット前の git diff 確認 | 意図しないファイルが変更に含まれていないか                                         |

---

## サブタスク管理

| サブタスクID | 内容                                                           | ステータス |
| ------------ | -------------------------------------------------------------- | ---------- |
| ST-8-01      | `runLateChunkingStage()` 抽出の検討と実施（または非実施記録）  | 未実施     |
| ST-8-02      | `convertLateChunkingToEmbeddingResults()` 責務配置の検討       | 未実施     |
| ST-8-03      | テスト重複モックセットアップの `beforeEach` 集約               | 未実施     |
| ST-8-04      | 不要な型アサーション・`any` の除去                             | 未実施     |
| ST-8-05      | リファクタリング後の最終確認（テスト・カバレッジ・型チェック） | 未実施     |

---

## 完了条件

- [ ] `runLateChunkingStage()` 抽出の検討結果（実施または非実施の理由）が `refactoring-log.md` に記録されている
- [ ] `convertLateChunkingToEmbeddingResults()` の責務配置の判断結果が `refactoring-log.md` に記録されている
- [ ] テストの重複モックセットアップが `beforeEach` に集約されている（または集約不要の理由が記録されている）
- [ ] 不要な `as unknown as` / `any` が除去されている（または除去不可の理由が記録されている）
- [ ] `pnpm --filter @repo/shared test -- embedding-pipeline` で全テストが PASS している
- [ ] `pnpm --filter @repo/shared test --coverage -- embedding-pipeline` でカバレッジが Phase 7 の値を下回っていない
- [ ] `pnpm --filter @repo/shared typecheck` で TypeScript 型エラーがない
- [ ] `outputs/phase-8/refactoring-log.md` に全検討事項の Before/After/判断理由が記録されている
- [ ] レビュー対象チェックリストの全項目が確認済みである

---

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 次Phaseへの申し送り事項

- Phase 9（品質保証）では、本Phaseのリファクタリングによって生じた変更が品質基準を満たしているかを確認する
- `runLateChunkingStage()` を抽出した場合、Phase 9 のコードレビューで単一責務の観点から適切な分割であるかを再確認すること
- `convertLateChunkingToEmbeddingResults()` を `LateChunkingService` 側に移動した場合、移動先のテストカバレッジが十分であることを Phase 9 で確認すること
- リファクタリングログ（`outputs/phase-8/refactoring-log.md`）は Phase 9 のレビュー材料として使用する
- 非実施とした検討事項についても理由が記録されていることを Phase 9 のレビュアーに共有すること

## 統合テスト連携

- Phase 6/7 で通したテストと coverage を落とさないことを refactor の条件にする。
- Phase 9 では refactor 後の PI-01〜PI-08 / PI-LC 系の全 PASS を確認する。
