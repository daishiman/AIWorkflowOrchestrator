# Phase 5: 実装

## メタ情報

| 項目       | 内容                                                  |
| ---------- | ----------------------------------------------------- |
| Phase      | 5                                                     |
| タスクID   | TASK-EMB-LATE-CHUNKING-PIPELINE-INTEGRATION-001       |
| タスク名   | Late Chunking EmbeddingPipeline・設定導線への正式統合 |
| 前提Phase  | Phase 4                                               |
| 後続Phase  | Phase 6                                               |
| 作成日     | 2026-04-20                                            |
| ステータス | 未実施                                                |

## 目的

Issue #2315 Phase 5 の内容として、`types.ts` と `embedding-pipeline.ts` に Late Chunking 統合に必要な型定義・ロジックを追加し、既存テストを維持しながら新機能を実装する。

## 背景

`EmbeddingPipeline` は現在 Late Chunking に対応していない。`LateChunkingService` と `EmbeddingService.generateChunkEmbeddings()` は先行実装済みのため、本タスクでは `EmbeddingPipeline` から公開 API を通じて正式統合する。

## 実装対象ファイル

| 対象ファイル                                                            | 作業内容                                  |
| ----------------------------------------------------------------------- | ----------------------------------------- |
| `packages/shared/src/services/embedding/pipeline/types.ts`              | `PipelineConfig` / `StageTimings` 型拡張  |
| `packages/shared/src/services/embedding/pipeline/embedding-pipeline.ts` | `process()` 分岐・Stage 2.5・結果整形追加 |

---

## 実行タスク

### Step 1: `types.ts` を修正する

`packages/shared/src/services/embedding/pipeline/types.ts` を開き、以下の変更を加える。

#### 1-1. `PipelineConfig` に `lateChunking` オプションを追加する

```typescript
export interface PipelineConfig {
  // 既存フィールド（変更しない）
  // ...

  /** Late Chunking 統合設定（省略時は無効） */
  lateChunking?: {
    enabled: boolean;
    poolingStrategy?: "mean" | "max" | "cls";
    maxTokenLength?: number;
  };
}
```

追加位置は既存フィールドの末尾とする。既存フィールドへの変更は行わない。

#### 1-2. `StageTimings` に `lateChunking` フィールドを追加する

```typescript
export interface StageTimings {
  // 既存フィールド（変更しない）
  // ...

  /** Late Chunking ステージの処理時間（ms） */
  lateChunking?: number;
}
```

#### 確認事項（Step 1 完了後）

- TypeScript 型エラーがないこと（`pnpm --filter @repo/shared typecheck` で確認）
- 既存テストが引き続き PASS すること

---

### Step 2: `embedding-pipeline.ts` を修正する

`packages/shared/src/services/embedding/pipeline/embedding-pipeline.ts` を開き、以下の変更を順番に加える。

#### 2-1. `EmbeddingService.generateChunkEmbeddings()` を使う分岐を追加する

`EmbeddingPipeline` は既存の `EmbeddingService` 依存のまま維持し、`config.lateChunking?.enabled === true` のときだけ `generateChunkEmbeddings()` を呼ぶ。

#### 2-2. `lateChunking` 設定の shape を正本へ合わせる

`poolingStrategy` は `"mean" | "max" | "cls"`、長さ指定は `maxTokenLength` を採用する。

#### 2-3. `stageTimings` の初期化に `lateChunking: 0` を追加する

`process()` メソッド内の `stageTimings` 初期化オブジェクトに以下を追加する。

```typescript
const stageTimings: StageTimings = {
  // 既存フィールド（変更しない）
  // ...
  lateChunking: 0,
};
```

#### 2-4. Stage 1 前に `validateLateChunkingConfig()` 呼び出しを追加する

```typescript
// Stage 1 実行前
this.validateLateChunkingConfig(config);
```

#### 2-5. Stage 2 の後に Late Chunking 分岐（Stage 2.5）を追加する

Stage 2（テキスト分割）完了直後に以下の分岐を追加する。

```typescript
// Stage 2.5: Late Chunking（有効時のみ実行）
if (config.lateChunking?.enabled) {
  const lateChunkingStart = Date.now();
  // EmbeddingService.generateChunkEmbeddings() を呼び出す
  // 戻り値は Stage 3 の入力として使用する
  stageTimings.lateChunking = Date.now() - lateChunkingStart;
}
```

#### 2-6. Stage 3 を Late Chunking 有効時とそれ以外で分岐させる

Stage 3（Embedding 生成）を以下のように条件分岐させる。

```typescript
// Stage 3: Embedding 生成
let embeddingResults: EmbeddingResult[];
if (config.lateChunking?.enabled) {
  // Late Chunking 有効時: Stage 2.5 の結果を EmbeddingResult に変換する
  embeddingResults = this.convertLateChunkingToEmbeddingResults(/* Stage 2.5 の結果 */);
} else {
  // 通常時: 既存の Embedding 生成ロジック（変更しない）
  embeddingResults = /* 既存ロジック */;
}
```

#### 2-7. `validateLateChunkingConfig()` private メソッドを追加する

クラス末尾に以下のメソッドを追加する。

```typescript
private validateLateChunkingConfig(): void {
  const lc = config.lateChunking;
  if (!lc) return; // 設定なし（無効）の場合は何もしない

  if (!lc.enabled) return; // enabled=false の場合は何もしない

  const validStrategies = ["mean", "max", "cls"] as const;
  if (lc.poolingStrategy && !validStrategies.includes(lc.poolingStrategy)) {
    throw new Error(
      `無効な poolingStrategy: ${lc.poolingStrategy}。有効な値: ${validStrategies.join(", ")}`,
    );
  }
}
```

---

### Step 3: `EmbeddingService.generateChunkEmbeddings()` の戻り値を確認する

先行実装の `generateChunkEmbeddings()` 戻り値が `ChunkEmbeddingResult[]` であることを確認し、Pipeline 側の既存出力契約へ変換する。

確認ポイント:

- 戻り値の型定義が `packages/shared/src/services/embedding/pipeline/types.ts` の型と整合しているか
- `ChunkEmbeddingResult.chunkId` / `embedding` / `tokenCount` が取得できるか
- プーリング戦略（`mean` / `max` / `cls`）が `PipelineConfig.lateChunking.poolingStrategy` に基づいて適用されるか

---

### Step 4: `convertLateChunkingToEmbeddingResults()` を実装する

Stage 2.5 の出力を `EmbeddingResult[]` に変換するメソッドをクラスに追加する。

実装指針:

- `chunk.metadata.lateChunking?.embedding ?? []` で各チャンクのベクトルを取り出す
- `EmbeddingResult` の必須フィールドをすべて埋める
- `embedding` フィールドが空配列の場合はエラーログを出力し、その chunk をスキップするか空ベクトルを設定する（プロジェクトのエラーポリシーに従う）

```typescript
private convertLateChunkingToEmbeddingResults(
  lateChunkingOutput: ChunkEmbeddingResult[],
): EmbeddingResult[] {
  return lateChunkingOutput.chunks.map((chunk) => ({
    // EmbeddingResult の各フィールドをマッピングする
    embedding: chunk.metadata.lateChunking?.embedding ?? [],
    // その他の必須フィールド
  }));
}
```

#### 確認事項（Step 4 完了後）

- TypeScript 型エラーがないこと
- `pnpm --filter @repo/shared test -- embedding-pipeline` で既存テストが引き続き PASS すること

---

## 注意事項

- `enabled=false` または未設定の場合は従来のパイプライン処理を変更してはならない
- Stage 2.5 と Stage 3 の分岐は排他的である（両方実行しない）
- `validateLateChunkingConfig()` は `process()` の冒頭（Stage 1 前）で呼び出し、早期エラー検出を行う

## 統合テスト連携

- Phase 4 で定義した PI-01〜PI-08 を Green にする。
- `embedBatch()` 非呼び出し、`generateChunkEmbeddings()` 呼び出し、`stageTimings.lateChunking` 記録を最優先で通す。

---

## 参照資料

| 参照資料               | パス                                                                                               | 内容                                     |
| ---------------------- | -------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| 型定義ファイル         | `packages/shared/src/services/embedding/pipeline/types.ts`                                         | 修正対象                                 |
| パイプライン実装       | `packages/shared/src/services/embedding/pipeline/embedding-pipeline.ts`                            | 修正対象                                 |
| Late Chunking サービス | TASK-EMB-LATE-CHUNKING-SERVICE-SEPARATION-001 の成果物                                             | `generateChunkEmbeddings()` の戻り値確認 |
| 統合テスト             | `packages/shared/src/services/embedding/pipeline/__tests__/embedding-pipeline.integration.test.ts` | PI-01〜PI-08 の確認                      |

---

## 成果物

| 成果物                   | パス                                                                    | 内容                                   |
| ------------------------ | ----------------------------------------------------------------------- | -------------------------------------- |
| 修正済み型定義           | `packages/shared/src/services/embedding/pipeline/types.ts`              | `PipelineConfig` / `StageTimings` 拡張 |
| 修正済みパイプライン実装 | `packages/shared/src/services/embedding/pipeline/embedding-pipeline.ts` | Late Chunking 統合ロジック             |
| 実装サマリー             | `outputs/phase-5/implementation-summary.md`                             | 変更内容・差分要約                     |

---

## 完了条件

- [ ] `PipelineConfig` に `lateChunking?: { enabled: boolean; poolingStrategy?: "mean" | "max" | "cls"; maxTokenLength?: number }` が追加されている
- [ ] `StageTimings` に `lateChunking?: number` が追加されている
- [ ] `EmbeddingPipeline` が `EmbeddingService.generateChunkEmbeddings()` を使う Stage 2.5 分岐を持つ
- [ ] `process()` メソッド内に `validateLateChunkingConfig()` 呼び出しが追加されている（Stage 1 前）
- [ ] Stage 2.5（Late Chunking 分岐）が `process()` に追加されている
- [ ] Stage 3 が Late Chunking 有効時とそれ以外で正しく分岐している
- [ ] `stageTimings` の初期化に `lateChunking: 0` が追加されている
- [ ] `validateLateChunkingConfig()` private メソッドが実装されている（`enabled=false` / `service未注入` / `invalid strategy` の3パターンを処理）
- [ ] `convertLateChunkingToEmbeddingResults()` が実装されている
- [ ] `pnpm --filter @repo/shared typecheck` でTypeScript型エラーがない
- [ ] `pnpm --filter @repo/shared test -- embedding-pipeline` で既存テストが PASS している

---

## タスク100%実行確認【必須】

- [ ] 本Phase内の全ステップを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成または修正
- [ ] TypeScript 型エラーなし・既存テスト PASS を確認
- [ ] 実行記録を `outputs/phase-5/implementation-summary.md` に残した

---

## 次Phaseへの申し送り事項

- `EmbeddingService.generateChunkEmbeddings()` のモックが Phase 6 のテスト拡充で必要になる。公開 API の引数 shape を確認しておくこと
- `validateLateChunkingConfig()` の3条件分岐（`enabled=false` / `service未注入` / `invalid strategy`）はPhase 6・7のカバレッジ確認対象である
- `convertLateChunkingToEmbeddingResults()` の空ベクトルハンドリング仕様を Phase 6 のテストケース設計時に明確化すること
- Phase 6 では PI-01〜PI-08 の全件 PASS に加え、`processBatch()` / `maxTokenLength` デフォルト値 / `PipelineMetricsCollector` の3ケースを追加する
