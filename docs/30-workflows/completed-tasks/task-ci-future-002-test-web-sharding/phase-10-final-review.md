# Phase 10: 最終レビューゲート

## メタ情報

| 項目       | 内容                                 |
| ---------- | ------------------------------------ |
| Phase      | 10                                   |
| タスクID   | TASK-CI-FUTURE-002                   |
| 機能名     | test-web-sharding                    |
| タスク名   | test-web シャード化                  |
| 前提Phase  | Phase 9（品質保証完了後に着手）      |
| 後続Phase  | Phase 11（PASS または MINOR の場合） |
| 作成日     | 2026-04-15                           |
| ステータス | pending                              |

---

## 目的

Phase 1〜9 の全成果物を統合的にレビューし、受入基準 AC-1〜AC-6 の充足を最終確認する。
PASS / MINOR / MAJOR を判定し、Phase 11（手動テスト）への進行可否を確定する。
MAJOR 指摘が残存する場合は対象 Phase に戻り是正する。

---

## 実行タスク

- **タスク1**: 受入基準 AC-1〜AC-6 の最終照合チェックリスト実施
- **タスク2**: blocker 判定基準による PASS / MINOR / MAJOR 評価
- **タスク3**: 未解決課題の洗い出しと未タスク化判断
- **タスク4**: 品質確認チェックリスト（機能要件・パフォーマンス要件・品質要件・ドキュメント要件）の全確認
- **タスク5**: Phase 11（手動テスト）への引き継ぎ事項整理

---

## 参照資料

| 資料名                   | パス                                                                                  | 説明                                     |
| ------------------------ | ------------------------------------------------------------------------------------- | ---------------------------------------- |
| タスク指示書             | `docs/30-workflows/unassigned-task/TASK-CI-FUTURE-002-test-web-sharding.md`           | 受入基準・完了条件定義                   |
| Phase 1 調査結果         | `outputs/phase-1/parallel-count-baseline.md`                                          | 並列数ベースライン・実行時間ベースライン |
| Phase 2 設計書           | `outputs/phase-2/shard-design.md`                                                     | シャード数設計根拠・選択理由             |
| Phase 5 実装結果         | `outputs/phase-5/implementation-result.md`                                            | 実装内容の最終確認                       |
| Phase 7 計測レポート     | `outputs/phase-7/coverage-report.md`                                                  | 実行時間計測・PASS 判定                  |
| Phase 8 リファクタ結果   | `outputs/phase-8/refactoring-result.md`                                               | Before/After・対称性確認                 |
| Phase 9 品質チェック結果 | `outputs/phase-9/quality-check-result.md`                                             | 構文・AC・セキュリティ・デグレード確認   |
| CI ワークフロー          | `.github/workflows/ci.yml`                                                            | 実装の最終確認対象                       |
| TASK-CI-OPT-001 Phase 10 | `docs/30-workflows/completed-tasks/task-ci-optimization-001/phase-10-final-review.md` | 参考フォーマット                         |

---

## 実行手順

### ステップ1: 受入基準 AC-1〜AC-6 の最終照合

```bash
# AC-1: test-web ジョブが設定したシャード数に分割されて実行されるか
grep -A 20 "test-web:" .github/workflows/ci.yml | grep -E "shard|matrix"

# AC-2: 全シャードが CI で PASS するか（Phase 9 の結果から確認）
cat outputs/phase-9/quality-check-result.md | grep -E "AC-2|PASS|シャード"

# AC-3: 並列数合計が GitHub Free Tier 上限 20 以内か（最終計算）
echo "=== 並列数合計 ==="
grep -E "(shard|matrix)" .github/workflows/ci.yml

# AC-4: シャード化後の実行時間がベースラインを上回らないか
grep -E "実行時間|baseline|execution|time" \
  outputs/phase-1/parallel-count-baseline.md \
  outputs/phase-7/coverage-report.md 2>/dev/null

# AC-5: シャード数の計算根拠が文書化されているか
ls -la outputs/phase-2/shard-design.md && echo "AC-5: 文書化済み"

# AC-6: 変更が CI 設定ファイルのみに限定されているか
git diff HEAD --name-only
```

**受入基準最終照合テーブル**:

| AC 番号 | 受入基準                                                    | 確認方法                                          | 判定    |
| ------- | ----------------------------------------------------------- | ------------------------------------------------- | ------- |
| AC-1    | `test-web` ジョブが設定したシャード数に分割されて実行される | `ci.yml` の matrix 設定確認                       | pending |
| AC-2    | 全シャードが CI で PASS する                                | Phase 9 品質チェック結果 / Phase 11 で最終確認    | pending |
| AC-3    | 並列数合計が GitHub Free Tier 上限 20 以内に収まる          | 全ジョブ合計を計算（test-desktop+test-web+3固定） | pending |
| AC-4    | シャード化後の実行時間がベースラインを上回らない            | Phase 1 ベースライン vs Phase 7 計測値比較        | pending |
| AC-5    | シャード数の計算根拠が文書化されている                      | `outputs/phase-2/shard-design.md` の内容確認      | pending |
| AC-6    | 変更が CI 設定ファイルのみに限定される                      | `git diff --name-only` で変更ファイルを確認       | pending |

### ステップ2: blocker 判定基準（Phase 13 進行可否）

**判定テーブル**:

| 判定                | 条件                                                                     | 次アクション                           |
| ------------------- | ------------------------------------------------------------------------ | -------------------------------------- |
| PASS                | AC-1〜AC-6 が全て充足・品質確認チェックリスト全 PASS                     | Phase 11 へ進む                        |
| MINOR               | 軽微な指摘のみ（コメント不足・タイムアウト値の微調整等）機能には影響なし | 記録の上 Phase 11 へ進む（未タスク化） |
| MAJOR: 実装         | AC-1・AC-3 のいずれかが ❌（シャード設定が動作しない・並列数超過）       | Phase 5（実装）へ戻る                  |
| MAJOR: 設計         | AC-4 が ❌（実行時間がベースライン超過かつ設計根拠に問題あり）           | Phase 2（設計）へ戻る                  |
| MAJOR: テスト       | AC-2 が ❌（シャード化でテストが失敗する）                               | Phase 6（テスト拡充）へ戻る            |
| MAJOR: ドキュメント | AC-5 が ❌（計算根拠が未文書化）                                         | Phase 2（設計）へ戻る                  |
| MAJOR: スコープ     | AC-6 が ❌（CI 設定ファイル以外への変更が含まれる）                      | Phase 5（実装）へ戻る                  |

**Phase 13 blocked 条件**: MAJOR 判定が 1 件以上残存している場合は PR 作成不可。

### ステップ3: 未解決課題の洗い出し

Phase 1〜9 で発生した MINOR 指摘・未解決リスクを一覧化する。

**未解決課題テーブル**:

| 課題 ID          | 発見 Phase | 内容 | 重要度 | 対応方針 |
| ---------------- | ---------- | ---- | ------ | -------- |
| （実行時に記録） | -          | -    | -      | -        |

**MINOR 指摘の未タスク化ルール**:

MINOR 判定の指摘事項は以下の 3 ステップで未タスク化する:

1. `docs/30-workflows/unassigned-task/` に未タスク指示書を作成する
2. 関連仕様書に未タスク参照リンクを追加する
3. 本 `outputs/phase-10/final-review-result.md` に未タスク ID を記録する

### ステップ4: 品質確認チェックリスト

#### 機能要件

| チェック項目                                                                                | 確認コマンド                                      | 判定    |
| ------------------------------------------------------------------------------------------- | ------------------------------------------------- | ------- |
| `.github/workflows/ci.yml` の `test-web` ジョブに matrix シャード設定が追加済み             | `grep -A 15 "test-web:" .github/workflows/ci.yml` | pending |
| シャード数が `20 - (test-desktop + typecheck + test-shared + e2e-desktop)` の計算式を満たす | 並列数合計の計算（ステップ3で確認）               | pending |
| 全シャードがローカルで PASS している（Phase 4 の確認結果）                                  | `cat outputs/phase-4/local-verification.md`       | pending |
| CI 上で全シャードが PASS している（Phase 5 の確認結果）                                     | `cat outputs/phase-5/implementation-result.md`    | pending |

#### パフォーマンス要件

| チェック項目                                                                 | 確認コマンド                                 | 判定    |
| ---------------------------------------------------------------------------- | -------------------------------------------- | ------- |
| シャード化後の `test-web` 最長シャード実行時間がベースラインを上回っていない | Phase 1 ベースライン vs Phase 7 計測値を比較 | pending |
| CI 全体の並列数合計が 20 以内に収まっている                                  | 全ジョブのシャード数合計を計算               | pending |

#### 品質要件

| チェック項目                                                                 | 確認コマンド                                                       | 判定    |
| ---------------------------------------------------------------------------- | ------------------------------------------------------------------ | ------- |
| 変更がスコープ（CI 設定ファイル・vitest.config.ts）のみに限定されている      | `git diff HEAD --name-only`                                        | pending |
| `test-desktop` のシャード数変更を行った場合、その根拠が記録されている        | `cat outputs/phase-2/shard-design.md`                              | pending |
| `ci.yml` の YAML 構文が正常である（Phase 9 の確認結果）                      | `cat outputs/phase-9/quality-check-result.md \| grep "YAML"`       | pending |
| `test-desktop`・`test-shared`・`e2e-desktop`・`typecheck` にデグレードがない | `cat outputs/phase-9/quality-check-result.md \| grep "デグレード"` | pending |

#### ドキュメント要件

| チェック項目                                                                | 確認コマンド                                        | 判定    |
| --------------------------------------------------------------------------- | --------------------------------------------------- | ------- |
| シャード数の計算根拠が `outputs/phase-2/shard-design.md` に文書化されている | `ls -la outputs/phase-2/shard-design.md`            | pending |
| `test-web` のベースライン実行時間が `outputs/phase-1/` に記録されている     | `ls -la outputs/phase-1/parallel-count-baseline.md` | pending |
| リファクタリング結果（Before/After）が `outputs/phase-8/` に記録されている  | `ls -la outputs/phase-8/refactoring-result.md`      | pending |

### ステップ5: Phase 11（手動テスト）への引き継ぎ事項整理

Phase 11 で実施すべき確認事項を明確化する。

**Phase 11 引き継ぎチェックリスト**:

| 確認事項                                                              | 確認方法                                                          | 優先度 |
| --------------------------------------------------------------------- | ----------------------------------------------------------------- | ------ |
| CI 上で `test-web` が設定したシャード数で並列実行されること           | GitHub Actions の CI 実行ログで matrix ジョブ数を確認             | 必須   |
| 全シャードが PASS すること（AC-2 の最終確認）                         | CI 実行ログの各シャードのステータスを確認                         | 必須   |
| `test-web` の最長シャード実行時間がベースライン以内であること         | CI 実行ログの各シャードの実行時間を計測し Phase 1 値と比較        | 必須   |
| 並列数合計が 20 以内に収まること（AC-3 の最終確認）                   | CI 実行ログのジョブ数を確認（キューイング待機が発生しないか）     | 必須   |
| `test-desktop`・`test-shared`・`e2e-desktop` が引き続き PASS すること | CI 実行ログで各ジョブのステータスを確認                           | 必須   |
| キューイング待機が 1 分を超えないこと                                 | CI 実行ログの各ジョブの開始時刻を確認（並列上限超過の兆候を確認） | 推奨   |

**Phase 11 での計測値記録フォーマット**:

```
## test-web シャード化後の CI 計測結果

| 計測項目                    | ベースライン（Phase 1） | 計測値（Phase 11） | 判定 |
|-----------------------------|------------------------|-------------------|------|
| test-web 最長シャード時間   | TBD 秒                 | TBD 秒            | TBD  |
| CI 全体の並列ジョブ数       | TBD                    | TBD               | TBD  |
| 全シャード PASS             | N/A                    | TBD               | TBD  |
```

---

## 統合テスト連携

| 判定項目                     | 基準                                  | 結果    |
| ---------------------------- | ------------------------------------- | ------- |
| AC-1〜AC-6 全充足            | 全項目 PASS                           | pending |
| 品質確認チェックリスト全通過 | 機能・性能・品質・ドキュメント全 PASS | pending |
| blocker（MAJOR）ゼロ         | MAJOR 判定なし                        | pending |
| Phase 11 引き継ぎ事項整備    | 全確認事項が明記されている            | pending |

---

## 多角的チェック観点

| 観点     | 確認内容                                                                  |
| -------- | ------------------------------------------------------------------------- |
| 矛盾     | Phase 2 の設計書と Phase 5 の実装・Phase 8 のリファクタ結果に矛盾がないか |
| 漏れ     | AC-1〜AC-6 のいずれかが未確認・未記録になっていないか                     |
| 整合性   | Phase 9 の品質チェック結果が本 Phase 10 の判定根拠として整合しているか    |
| 依存関係 | MAJOR 判定がある場合、戻り先 Phase の特定が正確か                         |

---

## サブタスク管理

| ID     | タスク名                                         | ステータス |
| ------ | ------------------------------------------------ | ---------- |
| T-10-1 | 受入基準 AC-1〜AC-6 の最終照合チェックリスト実施 | 未実施     |
| T-10-2 | blocker 判定基準による PASS / MINOR / MAJOR 評価 | 未実施     |
| T-10-3 | 未解決課題の洗い出しと未タスク化判断             | 未実施     |
| T-10-4 | 品質確認チェックリストの全確認                   | 未実施     |
| T-10-5 | Phase 11 への引き継ぎ事項整理                    | 未実施     |

---

## 成果物

| 成果物           | パス                                      | 説明                                               |
| ---------------- | ----------------------------------------- | -------------------------------------------------- |
| 最終レビュー結果 | `outputs/phase-10/final-review-result.md` | PASS/MINOR/MAJOR 判定・AC 充足確認・未解決課題一覧 |
| AC 検証記録      | `outputs/phase-10/ac-verification.md`     | AC-1〜AC-6 の証拠・確認コマンド結果                |

---

## 完了条件

- [ ] AC-1〜AC-6 の照合が全て実施され、判定（PASS / FAIL）が記録されていること
- [ ] PASS / MINOR / MAJOR 判定が確定していること
- [ ] MAJOR 判定がある場合、戻り先 Phase が特定されていること
- [ ] MINOR 指摘がある場合、未タスク化 3 ステップが実施済みであること
- [ ] 品質確認チェックリスト（機能要件・パフォーマンス要件・品質要件・ドキュメント要件）が全て確認済みであること
- [ ] Phase 11 への引き継ぎ事項が整理されていること
- [ ] `outputs/phase-10/final-review-result.md` に判定結果が記録されていること
- [ ] `outputs/phase-10/ac-verification.md` に AC-1〜AC-6 の証拠が記録されていること
- [ ] 本Phase内の全タスクを100%実行完了

---

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

```bash
# 成果物の存在確認
ls -la docs/30-workflows/task-ci-future-002-test-web-sharding/outputs/phase-10/

# AC-6 最終確認（CI 設定ファイルのみの変更であること）
git diff HEAD --name-only

# 品質チェック結果の参照確認
cat docs/30-workflows/task-ci-future-002-test-web-sharding/outputs/phase-9/quality-check-result.md | \
  grep -E "AC-[1-6]|PASS|FAIL"
```

---

## 次のPhase

**Phase 11: 手動テスト検証**（PASS または MINOR の場合）— 実際の CI 実行を通じて全シャードの PASS・実行時間・並列数合計を計測・確認する。

**対象 Phase へ戻る**（MAJOR の場合）— 判定テーブルの「次アクション」に従い、是正後に Phase 9 から再実施する。

**Phase 11 開始条件**: Phase 10 の判定が「PASS」または「MINOR のみ」であること。
**Phase 13 blocked 条件**: MAJOR 判定が 1 件以上残存している場合は PR 作成不可。
