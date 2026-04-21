# Phase 7: カバレッジ確認

## メタ情報

| 項目       | 内容                                                  |
| ---------- | ----------------------------------------------------- |
| Phase      | 7                                                     |
| タスクID   | TASK-EMB-LATE-CHUNKING-PIPELINE-INTEGRATION-001       |
| タスク名   | Late Chunking EmbeddingPipeline・設定導線への正式統合 |
| 前提Phase  | Phase 6                                               |
| 後続Phase  | Phase 8                                               |
| 作成日     | 2026-04-20                                            |
| ステータス | 未実施                                                |

## 目的

Issue #2315 Phase 7 の内容として、Phase 5 で実装した Late Chunking 統合ロジックのカバレッジを計測し、基準値を満たしていることを確認する。基準未達の場合は Phase 6 に差し戻して追加テストを実施する。

## 背景

Phase 6 で追加した PI-LC-01〜PI-LC-03 によって Late Chunking 分岐と `validateLateChunkingConfig()` の条件分岐が網羅されているかを定量的に確認する必要がある。

---

## 実行タスク

### タスク1: カバレッジ計測を実行する

**実行コマンド**:

```bash
pnpm --filter @repo/shared test --coverage -- embedding-pipeline
```

**確認事項**:

- コマンドが正常に終了すること
- カバレッジレポートが生成されること（標準出力またはカバレッジレポートファイル）
- 計測対象ファイルとして以下が含まれていること
  - `packages/shared/src/services/embedding/pipeline/embedding-pipeline.ts`
  - `packages/shared/src/services/embedding/pipeline/types.ts`

**期待される成果物**:

- `outputs/phase-7/coverage-raw-output.md`（コマンド出力のコピー）

---

### タスク2: カバレッジ確認対象の分岐を検証する

**確認対象1: `EmbeddingPipeline.process()` の Late Chunking 分岐**

以下の2つのブランチが両方カバーされていることを確認する。

| ブランチ                                         | 対応テスト         | カバー状態 |
| ------------------------------------------------ | ------------------ | ---------- |
| Late Chunking 有効（enabled=true）               | PI-LC-01〜PI-LC-03 | 確認する   |
| Late Chunking 無効（enabled=false または未設定） | PI-01〜PI-08       | 確認する   |

**確認対象2: `validateLateChunkingConfig()` の条件分岐**

以下の3つの分岐が全てカバーされていることを確認する。

| 条件                                           | 期待する動作       | 対応テスト                     | カバー状態 |
| ---------------------------------------------- | ------------------ | ------------------------------ | ---------- |
| `enabled=false`（または設定なし）              | 何もせず正常終了   | PI-01〜PI-08 のいずれか        | 確認する   |
| `enabled=true` かつ `service未注入`            | エラーをスローする | Phase 6 で追加が必要な場合あり | 確認する   |
| `enabled=true` かつ `poolingStrategy` が無効値 | エラーをスローする | Phase 6 で追加が必要な場合あり | 確認する   |

> `service未注入` および `invalid strategy` のブランチカバレッジが不足している場合は、Phase 6 に差し戻して対応するテストケースを追加すること。

**期待される成果物**:

- `outputs/phase-7/branch-coverage-analysis.md`（各分岐のカバー状態を記録した表）

---

### タスク3: カバレッジ基準値との照合

計測値を以下の基準テーブルと照合する。

| 指標              | 最低基準 | 推奨基準 | 計測値（記入する） | 判定 |
| ----------------- | -------- | -------- | ------------------ | ---- |
| Line Coverage     | 80%      | 90%      |                    |      |
| Branch Coverage   | 60%      | 70%      |                    |      |
| Function Coverage | 80%      | 90%      |                    |      |

**判定基準**:

- 全指標が最低基準以上 → Phase 8 へ進む（PASS）
- いずれか1つでも最低基準未満 → Phase 6 へ差し戻す（FAIL）

---

### タスク4: ゲート判定と次Phaseの決定

タスク3の判定結果に基づいて次のアクションを決定する。

| 判定 | 条件                        | 次のアクション                                       |
| ---- | --------------------------- | ---------------------------------------------------- |
| PASS | 全指標が最低基準以上        | Phase 8（リファクタリング）へ進む                    |
| FAIL | いずれか1つでも最低基準未満 | Phase 6 に差し戻し、不足分岐をカバーするテストを追加 |

**差し戻し時の作業指針**:

1. `outputs/phase-7/branch-coverage-analysis.md` に不足しているブランチを記録する
2. Phase 6 に戻り、不足ブランチをカバーするテストケースを追加する
3. 追加後に再度本フェーズ（Phase 7）を実行する

**期待される成果物**:

- `outputs/phase-7/gate-decision.md`（判定結果・計測値・次アクションを記載）

---

## 参照資料

| 参照資料           | パス                                                                                               | 内容                                   |
| ------------------ | -------------------------------------------------------------------------------------------------- | -------------------------------------- |
| 統合テストファイル | `packages/shared/src/services/embedding/pipeline/__tests__/embedding-pipeline.integration.test.ts` | PI-01〜PI-08 および PI-LC-01〜PI-LC-03 |
| パイプライン実装   | `packages/shared/src/services/embedding/pipeline/embedding-pipeline.ts`                            | カバレッジ計測対象                     |
| Phase 6 テスト結果 | `outputs/phase-6/expanded-test-result.md`                                                          | 追加テスト PASS 確認記録               |

---

## 成果物

| 成果物               | パス                                          | 内容                           |
| -------------------- | --------------------------------------------- | ------------------------------ |
| カバレッジ生出力記録 | `outputs/phase-7/coverage-raw-output.md`      | コマンド出力コピー             |
| 分岐カバレッジ分析   | `outputs/phase-7/branch-coverage-analysis.md` | 各分岐のカバー状態表           |
| ゲート判定記録       | `outputs/phase-7/gate-decision.md`            | 判定結果・計測値・次アクション |

---

## 多角的チェック観点

| 観点                     | チェック内容                                                                                                             |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| 分岐の網羅性             | `validateLateChunkingConfig()` の3条件（`enabled=false` / `service未注入` / `invalid strategy`）が全てカバーされているか |
| Late Chunking 有効・無効 | `process()` の Late Chunking 有効ブランチと無効ブランチが両方カバーされているか                                          |
| 計測対象ファイルの正確性 | カバレッジレポートに `embedding-pipeline.ts` が含まれているか                                                            |
| 基準値の客観性           | 計測値が1回のみでなく安定した結果であることを確認したか                                                                  |
| 差し戻し条件の明確さ     | 最低基準未達時に具体的に不足している分岐が特定されているか                                                               |

---

## サブタスク管理

| サブタスクID | 内容                                          | ステータス |
| ------------ | --------------------------------------------- | ---------- |
| ST-7-01      | カバレッジ計測コマンドの実行と出力記録        | 未実施     |
| ST-7-02      | `process()` Late Chunking 分岐のカバー確認    | 未実施     |
| ST-7-03      | `validateLateChunkingConfig()` 分岐カバー確認 | 未実施     |
| ST-7-04      | カバレッジ基準値との照合                      | 未実施     |
| ST-7-05      | ゲート判定と次Phase決定                       | 未実施     |

---

## 完了条件

- [ ] `pnpm --filter @repo/shared test --coverage -- embedding-pipeline` が正常終了している
- [ ] `EmbeddingPipeline.process()` の Late Chunking 有効・無効ブランチが両方カバーされている
- [ ] `validateLateChunkingConfig()` の `enabled=false` / `service未注入` / `invalid strategy` の3条件が全てカバーされている
- [ ] Line Coverage が 80% 以上である
- [ ] Branch Coverage が 60% 以上である
- [ ] Function Coverage が 80% 以上である
- [ ] `outputs/phase-7/coverage-raw-output.md` が生成されている
- [ ] `outputs/phase-7/branch-coverage-analysis.md` が生成されている
- [ ] `outputs/phase-7/gate-decision.md` に判定結果が記録されている
- [ ] PASS 判定の場合、Phase 8 へ進む準備が整っている
- [ ] FAIL 判定の場合、不足ブランチが特定され Phase 6 差し戻し理由が記録されている

---

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 次Phaseへの申し送り事項

- Phase 8 ではリファクタリングを実施するが、リファクタリング後にカバレッジが低下していないことを `pnpm --filter @repo/shared test --coverage -- embedding-pipeline` で再確認すること
- `validateLateChunkingConfig()` の `service未注入` ブランチは、コンストラクタのオプショナル引数に関わるため、Phase 8 でリファクタリングを行う場合は特に注意すること
- 推奨基準（Line 90% / Branch 70% / Function 90%）を達成できていない場合、Phase 8 完了後に改めて追加テストを検討することを申し送る
- Phase 8 のリファクタリングルールとして「テストは全件 PASS を維持する」「カバレッジを低下させない」を遵守すること

## 統合テスト連携

- Phase 6 で追加した Late Chunking 拡張テストを coverage 対象に含める。
- Phase 8 では coverage の非低下を再確認する。
