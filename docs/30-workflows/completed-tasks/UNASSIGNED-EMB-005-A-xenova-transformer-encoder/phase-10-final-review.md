# Phase 10: 最終レビュー - タスク仕様書

## メタ情報

| 項目         | 内容                                                     |
| ------------ | -------------------------------------------------------- |
| Phase        | 10                                                       |
| タスクID     | UNASSIGNED-EMB-005-A                                     |
| タスク名     | XenovaTransformerEncoder 実装（IEncoder 具体実装クラス） |
| タスク種別   | NON_VISUAL                                               |
| ステータス   | 完了                                                     |
| 作成日       | 2026-04-20                                               |
| 前Phase      | 9: 品質保証                                              |
| 次Phase      | 11: 手動テスト                                           |
| GitHub Issue | #2312（CLOSED）                                          |
| 親タスク     | UNASSIGNED-EMB-005（Late Chunking 完了済）               |

---

## 目的

Phase 1〜9 で確定した受入基準（AC-1〜AC-8）と、Phase 4〜9 の証跡を照合し、
`XenovaTransformerEncoder` 実装が `IEncoder` 契約・テスト・型・リント・ビルドの
全観点で要件を満たしていることを確認する。あわせて Electron 環境での懸念事項
（rendererプロセス互換、モデルキャッシュ、OOM 閾値）の残課題を洗い出し、
未対応項目があれば `unassigned-task/` へ登録したうえで、Phase 11（手動テスト）
への進行可否を判定する。コードは一切実装せず、レビュー証跡のみ生成する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 受入基準 AC-1〜AC-8 の照合

**目的**: Issue #2312 と Phase 1 で確定した全受入基準が証跡付きで満たされているか確認する

**実行手順**:

1. `outputs/phase-1/acceptance-criteria.md` の AC-1〜AC-8 を開く
2. Phase 5（実装）/ Phase 6（テスト拡張）/ Phase 7（カバレッジ）/ Phase 9（品質）の成果物を参照
3. 以下の照合マトリクスを記入する

**照合マトリクス**:

| ID   | 受入基準                                                                                   | 検証方法              | 達成状況 | 証跡                                       |
| ---- | ------------------------------------------------------------------------------------------ | --------------------- | -------- | ------------------------------------------ |
| AC-1 | `XenovaTransformerEncoder` が `IEncoder` インターフェースを実装している                    | TypeScript コンパイル | 未確認   | `outputs/phase-9/typecheck.log`            |
| AC-2 | `encode()` が `hiddenStates: Float32Array[]` と `offsetMapping: [number, number][]` を返す | ユニットテスト        | 未確認   | `outputs/phase-6/expansion-test-result.md` |
| AC-3 | モデル読み込み失敗時に `EmbeddingError` がスローされる                                     | ユニットテスト        | 未確認   | `outputs/phase-6/expansion-test-result.md` |
| AC-4 | OOM 発生時に `OutOfMemoryError` がスローされる                                             | ユニットテスト        | 未確認   | `outputs/phase-6/expansion-test-result.md` |
| AC-5 | コンストラクタでカスタムモデル名を指定できる（既定 `Xenova/all-MiniLM-L6-v2`）             | ユニットテスト        | 未確認   | `outputs/phase-6/expansion-test-result.md` |
| AC-6 | `LateChunkingService` に渡して `generateChunkEmbeddings()` が動作する                      | 統合テスト            | 未確認   | `outputs/phase-6/expansion-test-result.md` |
| AC-7 | `index.ts` から `XenovaTransformerEncoder` がエクスポートされている                        | コードレビュー        | 未確認   | `outputs/phase-8/refactoring-log.md`       |
| AC-8 | 全テストが PASS し、`pnpm typecheck` が PASS する                                          | CI                    | 未確認   | `outputs/phase-9/quality-report.md`        |

4. 各 AC について「達成」「未達」「一部達成」を記録する
5. 未達・一部達成がある場合は原因 Phase を特定する

**期待される成果物**:

- `outputs/phase-10/final-review-result.md` の AC 照合セクション

---

### タスク2: 実装/テスト/型/リント/ビルド全件パス証跡の収集

**目的**: 品質ゲート（lint / typecheck / vitest / build）が全件 PASS している証跡を集約する

**実行手順**:

1. Phase 9 の `outputs/phase-9/quality-report.md` と各ログから以下のサマリを抽出する

| ゲート                             | 期待     | 実測   | 証跡                                 |
| ---------------------------------- | -------- | ------ | ------------------------------------ |
| `pnpm lint`                        | 0 error  | 未取得 | `outputs/phase-9/lint.log`           |
| `pnpm typecheck`                   | 0 error  | 未取得 | `outputs/phase-9/typecheck.log`      |
| `pnpm vitest run`                  | all PASS | 未取得 | `outputs/phase-9/test.log`           |
| `pnpm --filter @repo/shared build` | success  | 未取得 | `outputs/phase-9/build.log`          |
| カバレッジ                         | 80% 以上 | 未取得 | `outputs/phase-7/coverage-report.md` |

2. 失敗ゲートがある場合は原因 Phase（5 / 6 / 8）へ差し戻す
3. 全件 PASS の場合は `final-review-result.md` の品質ゲートセクションに転記する

**期待される成果物**:

- `outputs/phase-10/final-review-result.md` の品質ゲート集約セクション

---

### タスク3: Electron 環境動作懸念の確認

**目的**: Electron メイン/レンダラー両プロセスでの動作懸念を整理し、本タスクスコープ内で対応可能な範囲を確定する

**実行手順**:

1. 以下の懸念チェックリストを `final-review-result.md` に記録する

**Electron 互換性チェックリスト**:

- [ ] 動的 `import("@xenova/transformers")` が Electron メインプロセス（Node.js）で動作することを設計上担保している（`outputs/phase-2/dependency-and-type-boundary.md` 参照）
- [ ] レンダラープロセス（contextIsolation 環境）での利用は本タスクスコープ外として明示している（`outputs/phase-1/scope-definition.md` 参照）
- [ ] `@xenova/transformers` の ESM-only 出力が `packages/shared` の `tsconfig.json` (`module` / `moduleResolution`) と互換であることを Phase 3 で確認済み
- [ ] モデルキャッシュ先（`env.cacheDir`）の責務が本タスクスコープ外であり、別タスクで Electron `app.getPath('userData')` 連携を扱う旨を明記している（元仕様書 §6.2 参照）
- [ ] OOM 閾値（既定モデル `Xenova/all-MiniLM-L6-v2` ≒ 23MB）が小規模モデル選択により回避されている根拠を記録（元仕様書 §6.2 参照）
- [ ] `RangeError` / "OOM" 文字列マッチによる OOM 検知の脆弱性を `risk-register.md` の RR-05 で追跡している

2. 懸念で本タスクスコープ外のものは `unassigned-task/` への登録候補として整理する

**期待される成果物**:

- `outputs/phase-10/final-review-result.md` の Electron 懸念セクション

---

### タスク4: レビュー観点チェックリスト

**目的**: 設計整合・命名・エラーハンドリング・セキュリティの4観点で第三者レビュー視点の最終確認を行う

**実行手順**:

1. 以下のレビュー観点チェックリストを記入する

**レビュー観点チェックリスト**:

| 観点               | チェック内容                                                                                                                | 結果   |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------- | ------ |
| 設計整合           | `XenovaTransformerEncoder` の実装が Phase 2 `class-design.md` / `encode-flow.md` と一致しているか                           | 未確認 |
| 命名               | クラス名・メソッド名・ファイル名が `xenova-transformer-encoder.ts` 規約に準拠しているか                                     | 未確認 |
| エラーハンドリング | `error-decision-table.md` の5行（loadModel ネット系/メモリ系・encode 推論系/メモリ系/出力欠落）が全て実装で網羅されているか | 未確認 |
| エラーcause保持    | 全エラーパスで `cause` が保持され、stack trace が失われないことを実装レビューで確認したか                                   | 未確認 |
| 二重ラップ防止     | `if (cause instanceof EmbeddingError) throw cause` ガードが実装されているか                                                 | 未確認 |
| セキュリティ       | HuggingFace Hub からのモデルダウンロード時に追加の認証情報を含めていないか                                                  | 未確認 |
| セキュリティ       | `modelName` 引数が任意文字列を受けるが、URL/path injection に該当する処理を内部で行っていないか                             | 未確認 |
| 型安全             | `any` 型の登場が0件、もしくは `@xenova/transformers` 境界の補足コメント付きで局所化されているか                             | 未確認 |
| 公開境界           | ヘルパ関数（`convertOffsetTensor` / `sliceHiddenStates` / `classifyError`）が module-private に閉じているか                 | 未確認 |

2. 各項目を「OK / NG / N/A」のいずれかで記録し、NG の場合は原因 Phase を明記する

**期待される成果物**:

- `outputs/phase-10/final-review-result.md` のレビュー観点セクション

---

### タスク5: 残課題の特定と unassigned-task/ への登録

**目的**: タスク1〜4で特定した未達・将来課題・リスク残留項目を `unassigned-task/` へ登録する

**実行手順**:

1. 以下の観点で残課題候補を抽出する
   - AC 未達項目（修正が必要なもの）
   - Electron レンダラー対応・モデルキャッシュ Electron 連携（本タスクスコープ外）
   - 並行 `encode()` 呼び出しによる二重ロード（Phase 3 観点6で「採用見送り」とした場合）
   - OpenAI / ONNX 等の他バックエンドエンコーダ実装
   - `risk-register.md` で「未解消」のままのリスク
2. 各残課題を `docs/30-workflows/unassigned-task/` に下記テンプレートで登録する

**残課題登録テンプレート**:

```markdown
# [課題タイトル]

## 概要

[課題の説明]

## 発見Phase

Phase 10（UNASSIGNED-EMB-005-A）

## 優先度

[高 / 中 / 低]

## 対応方針

[実装方針・対応手順の概要]

## 関連ファイル

- [ファイルパス]
```

3. 登録した残課題の一覧を `final-review-result.md` に記録する

**期待される成果物**:

- `outputs/phase-10/final-review-result.md` の残課題一覧セクション
- `docs/30-workflows/unassigned-task/` 配下の残課題ファイル群（該当する場合）

---

### タスク6: 最終レビュー判定と Phase 11 進行承認

**目的**: 全照合結果を集約し、Phase 11（手動テスト）への進行可否を判定する

**実行手順**:

1. タスク1〜5の結果を集約する
2. 以下の判定基準に基づいて最終判定を行う

**判定基準**:

| 判定     | 条件                                                                        | 次のアクション                |
| -------- | --------------------------------------------------------------------------- | ----------------------------- |
| PASS     | AC-1〜AC-8 が全て「達成」かつ品質ゲート全件 PASS                            | Phase 11 へ進行               |
| MINOR    | 未達が 1 件以下かつ AC-1/AC-2/AC-7/AC-8 を含まない                          | 修正後に Phase 11 へ進行      |
| MAJOR    | 未達が 2 件以上、または AC-1/AC-2/AC-7/AC-8 のいずれかが未達                | 未達 AC の原因 Phase へ戻る   |
| CRITICAL | `IEncoder` 契約破綻、`@xenova/transformers` 依存解決不能、Electron 設計破綻 | Phase 1〜3 へ戻りユーザー確認 |

**戻り先決定基準**:

| 問題の種類                             | 戻り先      |
| -------------------------------------- | ----------- |
| AC-1（implements 宣言欠落）            | Phase 5     |
| AC-2（戻り値型不整合）                 | Phase 5 / 6 |
| AC-3 / AC-4（エラー分類欠落）          | Phase 5 / 6 |
| AC-5（コンストラクタ引数欠落）         | Phase 2 / 5 |
| AC-6（`LateChunkingService` 統合失敗） | Phase 6 / 7 |
| AC-7（`index.ts` エクスポート漏れ）    | Phase 5 / 8 |
| AC-8（lint/typecheck/test/build 失敗） | Phase 8 / 9 |

3. 判定結果と根拠を `final-review-result.md` に記録する

**期待される成果物**:

- `outputs/phase-10/final-review-result.md` の最終判定セクション

---

## 参照資料

| 参照資料             | パス                                                                    | 内容                           |
| -------------------- | ----------------------------------------------------------------------- | ------------------------------ |
| 受入基準             | `outputs/phase-1/acceptance-criteria.md`                                | AC-1〜AC-8 の定義              |
| クラス設計           | `outputs/phase-2/class-design.md`                                       | フィールド・メソッドシグネチャ |
| エラー分類表         | `outputs/phase-2/error-decision-table.md`                               | 5行のディシジョンテーブル      |
| 設計レビュー結果     | `outputs/phase-3/review-result.md` / `outputs/phase-3/risk-register.md` | 6観点レビューと RR-01〜RR-05   |
| テスト拡張結果       | `outputs/phase-6/expansion-test-result.md`                              | AC-2/3/4/5/6 の検証            |
| カバレッジレポート   | `outputs/phase-7/coverage-report.md`                                    | 80% 閾値の確認                 |
| リファクタリングログ | `outputs/phase-8/refactoring-log.md`                                    | AC-7 エクスポート確認          |
| 品質チェック結果     | `outputs/phase-9/quality-report.md`                                     | lint/typecheck/test/build 全件 |
| Issue #2312          | https://github.com/daishiman/AIWorkflowOrchestrator/issues/2312         | 元 AC・スコープ定義            |
| 元仕様書             | `docs/30-workflows/unassigned-task/UNASSIGNED-EMB-005-A.md`             | 元タスク仕様（§3 / §6 含む）   |
| 親タスク index       | `docs/30-workflows/UNASSIGNED-EMB-005-late-chunking/index.md`           | Late Chunking 全体スコープ     |
| system spec 正本     | `.claude/skills/aiworkflow-requirements/references/llm-embedding.md`    | Late Chunking / IEncoder 正本  |

---

## 成果物

| 成果物           | パス                                           | 内容                                         |
| ---------------- | ---------------------------------------------- | -------------------------------------------- |
| 最終レビュー結果 | `outputs/phase-10/final-review-result.md`      | AC 照合・品質ゲート・Electron 懸念・最終判定 |
| 残課題ファイル群 | `docs/30-workflows/unassigned-task/`（該当時） | 登録された残課題                             |

---

## 統合テスト連携（Phase 1〜11は必須）

**Phase 10 の統合テスト連携アクション**:

- AC-6 の `LateChunkingService` × `XenovaTransformerEncoder` 統合テスト結果を `outputs/phase-6/expansion-test-result.md` から確認する
- Phase 9 の品質チェック結果（lint / typecheck / vitest run / build）を証跡として AC-8 照合に使用する
- 最終判定が PASS / MINOR の場合のみ Phase 11（手動テスト：実モデル呼び出し）へ進行する
- MAJOR / CRITICAL の場合は原因 Phase へ戻り、統合品質を担保してから再照合する

---

## 多角的チェック観点（AIが判断）

| 観点                    | チェック内容                                                                                 |
| ----------------------- | -------------------------------------------------------------------------------------------- |
| AC 照合の網羅性         | AC-1〜AC-8 を全て証跡付きで照合しているか（漏れがないか）                                    |
| Electron 懸念の整理     | メイン/レンダラー/モデルキャッシュ/OOM 閾値の4論点が全て確認されているか                     |
| 残課題登録漏れ          | スコープ外項目（他バックエンド・E2E・キャッシュ）が全て `unassigned-task/` に登録済みか      |
| リスクレジスタ更新      | RR-01〜RR-05 の各リスクのステータス（解消/未解消）が `risk-register.md` に最新化されているか |
| 判定根拠の明示性        | 最終判定が「PASS/MINOR/MAJOR/CRITICAL」のいずれかで明示され、根拠が記録されているか          |
| Phase 11 進行条件の充足 | PASS/MINOR の場合のみ進行し、MINOR なら修正完了後に進行していることが確認できるか            |

---

## サブタスク管理

| サブタスクID | 内容                                   | ステータス |
| ------------ | -------------------------------------- | ---------- |
| ST-10-01     | AC-1〜AC-8 の照合マトリクス記入        | 未実施     |
| ST-10-02     | 品質ゲート全件パス証跡集約             | 未実施     |
| ST-10-03     | Electron 環境懸念チェックリスト記入    | 未実施     |
| ST-10-04     | レビュー観点チェックリスト記入         | 未実施     |
| ST-10-05     | 残課題特定と unassigned-task/ への登録 | 未実施     |
| ST-10-06     | 最終レビュー判定と Phase 11 進行承認   | 未実施     |

---

## 完了条件

- [ ] AC-1〜AC-8 の全受入基準が証跡付きで照合されている
- [ ] 品質ゲート（lint / typecheck / vitest / build）全件 PASS が記録されている
- [ ] Electron 懸念チェックリスト 6 項目が判定済みである
- [ ] レビュー観点チェックリストが OK / NG / N/A で全項目記入されている
- [ ] 未達・一部達成の AC について原因 Phase が特定されている
- [ ] 残課題が `docs/30-workflows/unassigned-task/` へ登録されている（課題がある場合）
- [ ] `outputs/phase-10/final-review-result.md` が生成されている
- [ ] 最終判定が PASS / MINOR であり、Phase 11 への進行が承認されている

---

## タスク100%実行確認【必須】

- [ ] 本 Phase 内の全タスク（タスク1〜6）を100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 次Phase

完了後、以下のファイルを実行してください:

`docs/30-workflows/UNASSIGNED-EMB-005-A-xenova-transformer-encoder/phase-11-manual-test.md`

完了後、以下のファイルを実行してください:

`docs/30-workflows/UNASSIGNED-EMB-005-A-xenova-transformer-encoder/phase-11-manual-test.md`
