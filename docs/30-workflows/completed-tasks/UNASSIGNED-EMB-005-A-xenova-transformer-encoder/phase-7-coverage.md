# Phase 7: カバレッジ確認 - タスク仕様書

## メタ情報

| 項目       | 内容                          |
| ---------- | ----------------------------- |
| Phase      | 7                             |
| タスクID   | UNASSIGNED-EMB-005-A          |
| タスク名   | XenovaTransformerEncoder 実装 |
| ステータス | 完了                          |
| 作成日     | 2026-04-20                    |
| 前Phase    | 6: テスト拡充                 |
| 次Phase    | 8: リファクタリング           |

---

## 目的

`xenova-transformer-encoder.ts` 全体および内部ヘルパ群に対する Statement / Branch / Function / Line カバレッジを計測し、
本タスクの目標値（各 80% 以上）を満たすことを確認する。
未カバー領域は「許容ケース（外部 SDK 直叩きで実モデル必須）」と「要追加テスト」に分類し、Phase 8 以降への引継事項を明確化する。

`packages/shared/vitest.config.ts` の既存しきい値（lines:65 / functions:80 / branches:60 / statements:65）はプロジェクト最低基準であり、本タスクではファイル単位で上振れの 80% を AC として設定する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: カバレッジ計測コマンドの実行

**目的**: `xenova-transformer-encoder.ts` 単体に絞ったカバレッジを取得し、ファイル単位のメトリクスを確定する

**実行手順**:

1. 以下のコマンドで `@repo/shared` の Vitest カバレッジを実行する

```bash
pnpm --filter @repo/shared test -- --coverage --run \
  src/services/embedding/late-chunking/__tests__/xenova-transformer-encoder.test.ts
```

2. 出力 `coverage/coverage-summary.json` および `coverage/lcov-report/` から `xenova-transformer-encoder.ts` の行を抽出する
3. Statement / Branch / Function / Line の各メトリクスを記録する

**期待される成果物**:

- `outputs/phase-7/coverage-report.md` の「ファイル別メトリクス」セクション

---

### タスク2: 目標達成判定

**目的**: 本タスクの AC（各 80% 以上）と既存プロジェクト水準（lines:65 / functions:80 / branches:60 / statements:65）の双方に対して達成可否を判定する

**判定表（記入例）**:

| 指標       | 本タスク目標 | プロジェクト水準 | 実測値 | 判定 |
| ---------- | ------------ | ---------------- | ------ | ---- |
| Statements | ≥ 80%        | ≥ 65%            |        |      |
| Branches   | ≥ 80%        | ≥ 60%            |        |      |
| Functions  | ≥ 80%        | ≥ 80%            |        |      |
| Lines      | ≥ 80%        | ≥ 65%            |        |      |

**判定ルール**:

- 本タスク目標 80% を 1 指標でも下回る場合は「未達」とし、タスク3で未カバー行を分析する
- 既存プロジェクト水準を下回る場合は最優先で Phase 6 へ差し戻す（CI レベルの破壊的変更）

**期待される成果物**:

- `outputs/phase-7/coverage-report.md` の「目標達成判定」セクション

---

### タスク3: 未カバー領域の特定と分類

**目的**: 未カバー行・未カバー分岐を特定し、`xenova-transformer-encoder.ts` の重点 4 分岐（OOM 判定 / モデル読み込み失敗 / エンコード失敗 / `output_hidden_states` vs `last_hidden_state` フォールバック）を中心に網羅状況を可視化する

**実行手順**:

1. lcov レポートから `xenova-transformer-encoder.ts` の uncovered line 番号一覧を抽出する
2. 各 uncovered 行を以下の分類でタグ付けする
   - **C-COV**: 追加テストでカバー可能（Phase 6 へ差し戻し対象）
   - **C-ACCEPT**: 実モデル依存で許容（モック不可能なネイティブ層など）
   - **C-DEAD**: 到達不能コード（リファクタリング対象、Phase 8 で削除）
3. 重点 4 分岐ごとに対応テストケース ID を紐付ける

**重点分岐対応マトリクス（記入例）**:

| 分岐ID | 分岐内容                                              | カバーテストID | 状態   |
| ------ | ----------------------------------------------------- | -------------- | ------ |
| BR-01  | `loadModel()` 成功パス                                | UT-LM-001      | カバー |
| BR-02  | `loadModel()` ネット系失敗 → `EmbeddingError`         | UT-LM-002      | カバー |
| BR-03  | `loadModel()` OOM (`RangeError`) → `OutOfMemoryError` | UT-LM-003      | カバー |
| BR-04  | `encode()` 推論成功                                   | UT-EN-001      | カバー |
| BR-05  | `encode()` 推論失敗 → `EmbeddingError`                | UT-EN-002      | カバー |
| BR-06  | `encode()` OOM → `OutOfMemoryError`                   | UT-EN-003      | カバー |
| BR-07  | `last_hidden_state` 経路                              | UT-OUT-001     | カバー |
| BR-08  | `hidden_states.at(-1)` フォールバック経路             | UT-OUT-002     | カバー |
| BR-09  | 双方 undefined → `EmbeddingError`                     | UT-OUT-003     | カバー |
| BR-10  | `EmbeddingError` 二重ラップ防止ガード                 | UT-ERR-001     | カバー |

**期待される成果物**:

- `outputs/phase-7/coverage-report.md` の「未カバー領域分類」セクション
- `outputs/phase-7/coverage-report.md` の「重点分岐対応マトリクス」セクション

---

### タスク4: 許容ケース判定とリスク評価

**目的**: C-ACCEPT 分類の未カバー領域について、Phase 11（手動テスト）での補完可否を判断し、許容判断の根拠を残す

**実行手順**:

1. C-ACCEPT 分類の各行について以下を記録する
   - 未カバー理由（例: 実モデルの ONNX runtime 内部例外）
   - Phase 11 の手動テストで補完可能か（Yes / No）
   - 補完不可の場合の残存リスクと緩和策（Phase 3 リスクレジスタとの紐付け）
2. `risk-register.md`（Phase 3）の RR-01〜RR-05 と整合させ、新規リスクが発生した場合は追記する

**期待される成果物**:

- `outputs/phase-7/coverage-report.md` の「許容ケース判定」セクション

---

### タスク5: カバレッジレポートの集約と提出

**目的**: タスク1〜4の結果を `outputs/phase-7/coverage-report.md` に集約し、Phase 8 への引継物として確定する

**実行手順**:

1. 以下の節を含む `coverage-report.md` を作成する
   - メタ情報（実行日時 / 実行コマンド / Vitest バージョン）
   - ファイル別メトリクス表
   - 目標達成判定
   - 未カバー領域分類
   - 重点分岐対応マトリクス
   - 許容ケース判定
   - 次 Phase への引継事項
2. lcov レポートのスナップショット（`coverage/lcov-report/xenova-transformer-encoder.ts.html`）の存在パスを記載する

**期待される成果物**:

- `outputs/phase-7/coverage-report.md`

---

## 参照資料

| 参照資料                        | パス                                                                                 | 内容                   |
| ------------------------------- | ------------------------------------------------------------------------------------ | ---------------------- |
| Vitest 設定                     | `packages/shared/vitest.config.ts`                                                   | 既存カバレッジしきい値 |
| Phase 4 テスト設計              | `outputs/phase-4/test-design.md`                                                     | テストケース一覧       |
| Phase 6 テスト拡充結果          | `outputs/phase-6/`                                                                   | 実装後の追加テスト     |
| Phase 3 リスクレジスタ          | `outputs/phase-3/risk-register.md`                                                   | RR-01〜RR-05           |
| エラー分類テーブル              | `outputs/phase-2/error-decision-table.md`                                            | 重点分岐の根拠         |
| `xenova-transformer-encoder.ts` | `packages/shared/src/services/embedding/late-chunking/xenova-transformer-encoder.ts` | 計測対象ファイル       |
| system spec 正本                | `.claude/skills/aiworkflow-requirements/references/llm-embedding.md`                 | Late Chunking の正本   |

---

## 成果物

| 成果物             | パス                                 | 内容                                           |
| ------------------ | ------------------------------------ | ---------------------------------------------- |
| カバレッジレポート | `outputs/phase-7/coverage-report.md` | ファイル別メトリクス・分岐対応・許容ケース判定 |
| lcov 生成物        | `packages/shared/coverage/`          | Vitest が生成する HTML/lcov（コミット対象外）  |

---

## 統合テスト連携（Phase 1〜11は必須）

**Phase 7 の統合テスト連携アクション**:

- 重点 4 分岐（OOM / 読み込み失敗 / エンコード失敗 / `output_hidden_states` フォールバック）が Phase 6 の追加テストでカバーされていることを Phase 4 のテストケース ID と紐付けて確認する
- AC-6（`LateChunkingService` × `XenovaTransformerEncoder` の DI 統合）に該当する統合テストもカバレッジ計測対象に含め、`generateChunkEmbeddings()` 経路が触れていることを確認する
- 未達の場合は Phase 6 へ差し戻す（ゲート判定）

---

## 多角的チェック観点（AIが判断）

| 観点                     | チェック内容                                                                                |
| ------------------------ | ------------------------------------------------------------------------------------------- |
| ファイル単位の純粋性     | カバレッジ集計対象が `xenova-transformer-encoder.ts` のみで、他ファイルの数値が混入しないか |
| 重点分岐の網羅           | BR-01〜BR-10 のすべてに対応テスト ID が紐付いているか                                       |
| C-ACCEPT 判定の客観性    | 「実モデル必須」など根拠が明示され、便宜的な許容になっていないか                            |
| プロジェクト水準との整合 | `vitest.config.ts` の既存しきい値を下回っていないか                                         |
| Phase 3 リスクとの整合   | RR-01〜RR-05 に追加・更新が必要なリスクが反映されているか                                   |
| 計測再現性               | 同一コマンドで再実行した際に数値が安定するか（flaky なら原因を Phase 6 に戻す）             |

---

## サブタスク管理

| サブタスクID | 内容                                  | ステータス |
| ------------ | ------------------------------------- | ---------- |
| ST-7-01      | カバレッジ計測コマンド実行            | 未実施     |
| ST-7-02      | 目標達成判定（80% / 既存水準）        | 未実施     |
| ST-7-03      | 未カバー領域の分類（COV/ACCEPT/DEAD） | 未実施     |
| ST-7-04      | 許容ケース判定とリスク評価            | 未実施     |
| ST-7-05      | カバレッジレポート集約と提出          | 未実施     |

---

## ゲート判定

| 判定基準                                 | 条件                   | 次のアクション                       |
| ---------------------------------------- | ---------------------- | ------------------------------------ |
| 4 指標すべて 80% 以上                    | 本タスク目標達成       | Phase 8 へ進む                       |
| 1 指標でも 80% 未満（既存水準は満たす）  | 追加テスト余地あり     | Phase 6 へ差し戻し追加テスト         |
| 既存プロジェクト水準を下回る             | CI 破壊リスク          | Phase 6 へ差し戻し最優先で修正       |
| 重点 BR-01〜BR-10 のいずれかが未カバー   | クリティカルパス未検証 | Phase 6 へ差し戻し                   |
| C-ACCEPT が許容範囲を超え合計 5 行を超過 | 許容過多               | Phase 8 リファクタで到達性改善を検討 |

---

## 完了条件

- [ ] `pnpm --filter @repo/shared test -- --coverage --run` が成功している
- [ ] `xenova-transformer-encoder.ts` のファイル別 4 指標が `coverage-report.md` に記録されている
- [ ] 重点分岐対応マトリクス（BR-01〜BR-10）にテスト ID が紐付いている
- [ ] 未カバー行が C-COV / C-ACCEPT / C-DEAD に分類されている
- [ ] 許容ケース判定が Phase 3 リスクレジスタと整合している
- [ ] ゲート判定が実施され、Phase 8 への進行可否が決定されている

---

## タスク100%実行確認【必須】

- [ ] 本Phase 内の全タスクを 100% 実行完了
- [ ] 各タスクを 100% 完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 次Phase

完了後、以下のファイルを実行してください:

`docs/30-workflows/UNASSIGNED-EMB-005-A-xenova-transformer-encoder/phase-8-refactoring.md`
