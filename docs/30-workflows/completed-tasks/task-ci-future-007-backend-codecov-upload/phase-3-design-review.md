# Phase 3: 設計レビューゲート

## メタ情報

| 項目   | 値                                        |
| ------ | ----------------------------------------- |
| Phase  | 3                                         |
| 機能名 | task-ci-future-007-backend-codecov-upload |
| 作成日 | 2026-04-16                                |

## 目的

Phase 2 で確定した設計（`apps/backend/vitest.config.ts` のカバレッジ設定・`test-web` ジョブの PR/main push 条件分岐・`coverage` ジョブの `backend` フラグ対応）の MINOR/MAJOR 問題を検出し、レビューゲートでの Phase 4 進行可否を判定する。

---

## 実行タスク

- **タスク1**: デザインレビューチェックリスト実施（後方互換性・desktop 回帰なし・シャード数考慮・タイムアウト制約）
- **タスク2**: MINOR（改善推奨） / MAJOR（ブロッカー）の分類
- **タスク3**: レビューゲート判定（MAJOR = 0 件の場合のみ Phase 4 進行）
- **タスク4**: MINOR 追跡テーブルの作成（指摘がある場合）
- **タスク5**: Phase 4 開始条件の明示的確定

---

## 参照資料

| 資料名                    | パス                                     | 説明                       |
| ------------------------- | ---------------------------------------- | -------------------------- |
| Phase 1 受入基準          | `outputs/phase-1/acceptance-criteria.md` | AC-1〜AC-5 との照合        |
| Phase 2 設計決定記録      | `outputs/phase-2/design-decisions.md`    | レビュー対象設計           |
| Phase 2 validation matrix | `outputs/phase-2/validation-matrix.md`   | Case A〜C との照合         |
| CI ワークフロー           | `.github/workflows/ci.yml`               | 現行ジョブ構成の確認       |
| backend vitest 設定       | `apps/backend/vitest.config.ts`          | カバレッジ設定の追加対象   |
| desktop vitest 設定       | `apps/desktop/vitest.config.ts`          | 既存カバレッジ設定との比較 |
| Phase 1 リスク            | `outputs/phase-1/risks.md`               | Phase 1 成果物             |

## 統合テスト連携

- `outputs/phase-2/design-decisions.md` と `outputs/phase-2/validation-matrix.md` をレビュー対象の current facts として固定し、ここからのみ PASS/MINOR/MAJOR を判定する。
- `outputs/phase-3/design-review-result.md` に Phase 4 開始可否を明記し、MAJOR = 0 の場合だけ次 Phase へ渡す。
- MINOR 指摘は `outputs/phase-3/minor-tracking.md` に残し、Phase 4/5 での観測・調整項目として引き継ぐ。
- Phase 2 の成果物が未完了、または判定条件が未記入の場合はレビューゲートを開かない。

---

## 実行手順

### ステップ1: デザインレビューチェックリスト

```bash
# 1. 後方互換性確認：coverage ジョブの desktop フラグが維持されているか
grep -n -A 20 "^  coverage:" .github/workflows/ci.yml | grep -A5 "desktop\|flags"

# 2. desktop 回帰確認：test-desktop ジョブへの変更がないか
grep -n -B2 -A 30 "^  test-desktop:" .github/workflows/ci.yml

# 3. test-web シャード数の確認（アーティファクト数の見積もり）
grep -n "matrix\|shard" .github/workflows/ci.yml | grep -A3 -B3 "test-web"

# 4. coverage ジョブのタイムアウト設定確認
grep -n "timeout-minutes\|timeout" .github/workflows/ci.yml | grep -A2 -B2 "coverage"

# 5. VITEST_SHARDED_COVERAGE の desktop での実績確認
grep -n "VITEST_SHARDED_COVERAGE" .github/workflows/ci.yml apps/desktop/vitest.config.ts
```

#### 評価1: 後方互換性

| 評価項目                                                       | 評価結果 | 根拠                                                                    |
| -------------------------------------------------------------- | -------- | ----------------------------------------------------------------------- |
| `coverage` ジョブの `desktop` フラグアップロードが維持されるか | TBD      | `backend` フラグ追加は既存の `desktop` アップロードステップを変更しない |
| `test-desktop` ジョブが変更されないか                          | TBD      | 本タスクの変更スコープは `test-web` / `coverage` のみ                   |
| PR 時の `test-web` 実行時間が増加しないか（AC-5）              | TBD      | 条件分岐により PR 時は `--coverage` が付与されない設計                  |

**判定基準**: 後方互換性を損なう変更があれば MAJOR

#### 評価2: desktop 回帰なし

| 評価項目                                                         | 評価結果 | 根拠                                                        |
| ---------------------------------------------------------------- | -------- | ----------------------------------------------------------- |
| `desktop-coverage-*` アーティファクト名が変更されないか          | TBD      | `backend-coverage-{shard}` は新規追加のみで既存を変更しない |
| `coverage` ジョブの `desktop` Codecov アップロードが回帰しないか | TBD      | 新規ステップの追加のみで既存ステップを削除・変更しない      |

**判定基準**: desktop 回帰が発生する設計であれば MAJOR

#### 評価3: シャード数考慮

| 評価項目                                                              | 評価結果 | 根拠                                                                    |
| --------------------------------------------------------------------- | -------- | ----------------------------------------------------------------------- |
| `test-web` のシャード数分のアーティファクトが全てアップロードされるか | TBD      | `backend-coverage-{shard}` でシャード数分のアーティファクトが生成される |
| `coverage` ジョブの `merge-multiple: true` で全シャードが統合されるか | TBD      | Phase 2 設計で `merge-multiple: true` を採用済み                        |
| シャード数変更時のアーティファクト命名に追従できるか                  | TBD      | `{shard}` 変数で動的に対応する設計                                      |

**判定基準**: シャード数変更時に設計が破綻する場合は MINOR

#### 評価4: タイムアウト 5 分以内

| 評価項目                                                                            | 評価結果 | 根拠                                                          |
| ----------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------- |
| `coverage` ジョブのアーティファクトダウンロード + Codecov アップロードが 5 分以内か | TBD      | `backend-coverage-*` の追加によるダウンロード量増加を試算する |
| `test-web` ジョブの main push 時の実行時間増加が許容範囲内か                        | TBD      | カバレッジ生成によるオーバーヘッドは 20〜30%程度（経験則）    |

**判定基準**: タイムアウト超過リスクが高い場合は MINOR（観測後に調整）

---

### ステップ2: MINOR / MAJOR 分類

#### 分類基準

| 判定  | 条件                                                               |
| ----- | ------------------------------------------------------------------ |
| PASS  | 全チェック項目が問題なし。Phase 4 へ進める                         |
| MINOR | 軽微な指摘あり（改善推奨・観測後に調整）。Phase 4 継続可           |
| MAJOR | 設計の根本的問題あり（後方互換破壊・desktop 回帰）。Phase 2 へ戻る |

#### 既知の MINOR 候補

| MINOR 候補                             | 理由                                                      | 対応方針                                             |
| -------------------------------------- | --------------------------------------------------------- | ---------------------------------------------------- |
| `coverage` ジョブのタイムアウト超過    | `backend-coverage-*` ダウンロード追加によるジョブ時間増加 | 実装後の観測結果に基づき timeout-minutes を調整      |
| シャード数変更時のアーティファクト命名 | `test-web` のシャード数が将来変更された場合の影響         | `{shard}` 変数を使用しているため自動追従（低リスク） |

#### 既知の MAJOR 候補

| MAJOR 候補                                     | 理由                                        | 対応方針               |
| ---------------------------------------------- | ------------------------------------------- | ---------------------- |
| `coverage` ジョブの `desktop` アップロード削除 | 既存の desktop カバレッジが収集されなくなる | Phase 2 へ戻り設計修正 |
| PR 時に `--coverage` が付与される設計          | AC-5 違反（PR 実行時間が増加する）          | Phase 2 へ戻り設計修正 |

---

### ステップ3: レビューゲート

**レビューゲート判定ルール**:

```
MAJOR 件数 = 0 → Phase 4 進行可
MAJOR 件数 > 0 → Phase 4 ブロック → Phase 2 へ戻る
```

#### チェックリスト

**後方互換性**:

- [ ] `coverage` ジョブの `desktop` フラグアップロードが維持される設計であること
- [ ] `test-desktop` ジョブへの変更が含まれていないこと

**desktop 回帰なし**:

- [ ] `desktop-coverage-*` アーティファクト名が変更されていないこと
- [ ] `coverage` ジョブの既存 `desktop` Codecov アップロードステップが削除・変更されていないこと

**シャード数考慮**:

- [ ] `test-web` のシャード数分の `backend-coverage-{shard}` アーティファクトが全てアップロードされる設計であること
- [ ] `merge-multiple: true` で全シャードのカバレッジが統合される設計であること

**タイムアウト 5 分以内**:

- [ ] `coverage` ジョブの追加処理（ダウンロード + アップロード）が現行タイムアウト設定内に収まる見込みであること

#### MINOR 追跡テーブル

| MINOR ID | 指摘内容                 | 解決予定 Phase | 解決確認 Phase | 備考 |
| -------- | ------------------------ | -------------- | -------------- | ---- |
| CI-M-01  | （指摘がある場合に記入） | -              | -              | -    |

---

## レビュー判定（記入欄）

```
判定: [ PASS / MINOR / MAJOR ]（Phase 3 実施時に記入）

判定理由:

Phase 4 開始条件: [ 満たす / 満たさない ]
```

---

## サブタスク管理

| ID     | タスク名                           | ステータス |
| ------ | ---------------------------------- | ---------- |
| T-03-1 | デザインレビューチェックリスト実施 | 未実施     |
| T-03-2 | MINOR/MAJOR 分類                   | 未実施     |
| T-03-3 | レビューゲート判定                 | 未実施     |
| T-03-4 | MINOR 追跡テーブル作成             | 未実施     |
| T-03-5 | Phase 4 開始条件の明示的確定       | 未実施     |

---

## 成果物

| 成果物             | 配置先                                    | 形式     |
| ------------------ | ----------------------------------------- | -------- |
| 設計レビュー結果   | `outputs/phase-3/design-review-result.md` | Markdown |
| MINOR 追跡テーブル | `outputs/phase-3/minor-tracking.md`       | Markdown |

---

## 完了条件

- [ ] デザインレビューチェックリスト（後方互換性・desktop 回帰なし・シャード数考慮・タイムアウト 5 分以内）が全項目チェック済みであること
- [ ] MINOR/MAJOR 分類が完了し、各指摘が追跡テーブルに記録されていること
- [ ] レビューゲート判定（PASS/MINOR/MAJOR）が確定していること
- [ ] Phase 4 開始条件（「MAJOR = 0 件」の可否）が明示的に確定していること
- [ ] `outputs/phase-3/` に全成果物が生成されていること

---

## タスク100%実行確認【必須】

- [ ] T-03-1: デザインレビューチェックリストを実施し `outputs/phase-3/design-review-result.md` に全項目記録済み
- [ ] T-03-2: MINOR/MAJOR 分類を実施し各指摘の分類根拠を記録済み
- [ ] T-03-3: レビューゲート判定（PASS/MINOR/MAJOR）を `outputs/phase-3/design-review-result.md` に明示的に記録済み
- [ ] T-03-4: MINOR 追跡テーブルを `outputs/phase-3/minor-tracking.md` に記録済み（指摘なしの場合は「なし」と記録）
- [ ] T-03-5: Phase 4 開始条件を明示的に確定済み（「MAJOR = 0 件: Phase 4 へ進む」または「MAJOR あり: Phase 2 へ戻る」）

---

## 次Phase

**Phase 4: テスト作成** — 実装前のテスト仕様策定とローカル検証スクリプト準備を行う。

**Phase 4 開始条件**: 本 Phase のレビューゲート判定で MAJOR = 0 件であること。
**Phase 4 blocked 条件**: MAJOR 判定が残存している場合は実装に進まず Phase 2 へ戻ること。
**Phase 1〜3 ゲート**: Phase 1・Phase 2・Phase 3 の全完了条件を満たさない限り、Phase 4 以降に進まないこと。
