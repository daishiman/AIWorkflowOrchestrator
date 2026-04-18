# Phase 11: 手動テスト検証

## メタ情報

| 項目   | 値                                        |
| ------ | ----------------------------------------- |
| Phase  | 11                                        |
| 機能名 | task-ci-future-007-backend-codecov-upload |
| 作成日 | 2026-04-16                                |

## 目的

ローカル環境でのカバレッジ生成動作確認と CI 条件の静的検証を行う。
UI 変更なし（`NON_VISUAL`）のため、検証はすべてコマンド出力・ファイル確認・workflow の静的確認で行う。
AC-4（main push 以外はスキップ）と AC-3（main push 時のみ収集）の最終確認をここで実施する。

## テスト方式

- 本タスクは UI/UX 変更なしの `NON_VISUAL` 扱いとする
- スクリーンショット計画は作成しない
- カバレッジファイルの生成確認・workflow の静的確認を `manual-test-report.md` に記録する
- このワークツリーでは CI 実運用ログを取得しないため、workflow 条件と `codecov.yml` の静的確認で代替する
- `phase11-capture-metadata.json` には `captureMode: "NON_VISUAL"` と理由を残す

---

## 実行タスク

- **タスク 1**: シャード 1/2 でカバレッジ付き実行テスト（`VITEST_SHARDED_COVERAGE=true`）
- **タスク 2**: シャード 2/2 でカバレッジ付き実行テスト（`VITEST_SHARDED_COVERAGE=true`）
- **タスク 3**: カバレッジなし実行テスト（main push 以外）
- **タスク 4**: `apps/backend/coverage/` ディレクトリの確認
- **タスク 5**: CI 動作条件の静的確認（main push 以外のスキップ・main push 時の収集）

---

## 参照資料

| 資料名                    | パス                                       | 説明                             |
| ------------------------- | ------------------------------------------ | -------------------------------- |
| CI 設定                   | `.github/workflows/ci.yml`                 | カバレッジ収集・アップロード設定 |
| Vitest 設定               | `apps/backend/vitest.config.ts`            | coverage 設定の確認              |
| Phase 5 実装結果          | `outputs/phase-5/implementation-result.md` | 実装内容の確認                   |
| Phase 6 テスト拡張結果    | `outputs/phase-6/test-expansion-result.md` | Phase 6 成果物                   |
| Phase 7 カバレッジ確認    | `outputs/phase-7/coverage-check-result.md` | Phase 7 成果物                   |
| Phase 8 リファクタ結果    | `outputs/phase-8/refactoring-result.md`    | Phase 8 成果物                   |
| Phase 9 品質チェック結果  | `outputs/phase-9/quality-check-result.md`  | Phase 9 成果物                   |
| Phase 10 最終レビュー結果 | `outputs/phase-10/final-review-result.md`  | Phase 10 成果物                  |
| AC 検証記録               | `outputs/phase-10/ac-verification.md`      | Phase 10 成果物                  |
| Phase 1 受入基準          | `outputs/phase-1/acceptance-criteria.md`   | AC-1〜AC-5                       |
| Codecov ドキュメント      | https://docs.codecov.com/docs/flags        | flags 設定の参照                 |

---

## 実行手順

### ステップ 1: シャード 1 カバレッジ付き実行テスト

```bash
# VITEST_SHARDED_COVERAGE=true でシャード 1/2 を実行（main push 相当）
VITEST_SHARDED_COVERAGE=true pnpm --filter @repo/backend exec vitest run --shard=1/2 --coverage
```

確認観点:

- コマンドがエラーなく完了すること
- `apps/backend/coverage/` 配下にカバレッジファイルが生成されること

### ステップ 2: シャード 2 カバレッジ付き実行テスト

```bash
# VITEST_SHARDED_COVERAGE=true でシャード 2/2 を実行（main push 相当）
VITEST_SHARDED_COVERAGE=true pnpm --filter @repo/backend exec vitest run --shard=2/2 --coverage
```

確認観点:

- コマンドがエラーなく完了すること
- `apps/backend/coverage/` 配下のカバレッジファイルが更新されること

### ステップ 3: カバレッジなし実行テスト（main push 以外）

```bash
# coverage フラグなしで実行（main push 以外）
pnpm --filter @repo/backend exec vitest run --shard=1/2   # カバレッジなし
pnpm --filter @repo/backend exec vitest run --shard=2/2   # カバレッジなし
```

確認観点:

- カバレッジファイルが新たに生成されないこと（または以前のファイルのみ残存）
- テスト自体は PASS すること

### ステップ 4: `apps/backend/coverage/` ディレクトリの確認

```bash
# カバレッジファイルが生成されていることを確認
ls -la apps/backend/coverage/

# lcov.info が存在するか確認
ls -la apps/backend/coverage/lcov.info 2>/dev/null && echo "lcov.info 存在" || echo "lcov.info なし"
```

| 確認項目                        | 期待値                           | 判定 |
| ------------------------------- | -------------------------------- | ---- |
| `apps/backend/coverage/` の存在 | ディレクトリが存在する           | PASS |
| `lcov.info` の生成              | `lcov.info` が存在する           | PASS |
| カバレッジデータの内容          | 5 件のテストが実行されていること | PASS |

### ステップ 5: CI 動作条件の静的確認

```bash
# main push 以外を除外していることを確認
grep -n "github.event_name == 'push' && github.ref == 'refs/heads/main'" .github/workflows/ci.yml

# backend アップロードと Codecov flag の確認
grep -n "backend-coverage\|flags: backend\|directory: coverage/backend" .github/workflows/ci.yml
grep -n "^  backend:" codecov.yml
```

確認観点:

- `push` の main ブランチ時のみ coverage を収集する条件分岐があること
- `flags: backend` と `coverage/backend` が一致していること
- `merge-multiple` を使わず、backend アーティファクトが上書きされないこと

### ステップ 6: 追加の静的確認

```bash
# Phase 11 の成果物が揃っていることを確認
ls outputs/phase-11/manual-test-report.md outputs/phase-11/ci-timing-measurements.md
ls outputs/phase-11/discovered-issues.md outputs/phase-11/phase11-capture-metadata.json
```

確認観点:

- `manual-test-report.md` と `ci-timing-measurements.md` が記録済みであること
- `discovered-issues.md` が 0 件でも出力されていること

### ステップ 7: 計測結果記録テーブル

```
| テストシナリオ             | カバレッジ生成 | テスト PASS | 備考         |
|---------------------------|--------------|------------|--------------|
| シャード 1/2（coverage付き） | ✅ / ❌       | ✅ / ❌      |              |
| シャード 2/2（coverage付き） | ✅ / ❌       | ✅ / ❌      |              |
| シャード 1/2（coverage なし） | スキップ      | ✅ / ❌      | main push 以外 |
| シャード 2/2（coverage なし） | スキップ      | ✅ / ❌      | main push 以外 |
| CI PR トリガー              | スキップ確認  | ✅ / ❌      | workflow 静的確認 |
| CI main push トリガー       | ✅ / ❌       | ✅ / ❌      | workflow 静的確認 |
```

---

## 統合テスト連携

CI 変更タスクのため単体テストは存在しないが、以下を確認する:

- [ ] Phase 5 で変更した `ci.yml` の YAML 構文が正しい（actionlint で検証済み）
- [ ] test-web の全シャードが PASS していること
- [ ] desktop フラグのカバレッジアップロードが引き続き正常動作していること（回帰なし）
- [ ] PR 時は Codecov アップロードステップがスキップされていること

---

## 3 層評価

| 層       | 確認項目                                                            | 判定            |
| -------- | ------------------------------------------------------------------- | --------------- |
| Semantic | CI が正しいトリガー条件（main push / PR）でカバレッジを制御するか   | ☐ PASS / ☐ FAIL |
| Visual   | GitHub Actions UI に依存せず、workflow 条件の静的確認で代替できるか | ☐ PASS / ☐ FAIL |
| AI UX    | Codecov ダッシュボードで `backend` フラグのカバレッジが表示されるか | ☐ PASS / ☐ FAIL |

---

## サブタスク管理

| #   | タスク                                     | 担当   | 状態 |
| --- | ------------------------------------------ | ------ | ---- |
| 1   | シャード 1 カバレッジ付き実行テスト        | manual | done |
| 2   | シャード 2 カバレッジ付き実行テスト        | manual | done |
| 3   | カバレッジなし実行テスト（main push 以外） | manual | done |
| 4   | `apps/backend/coverage/` ディレクトリ確認  | manual | done |
| 5   | CI 条件の静的確認（main push 以外）        | manual | done |
| 6   | CI 条件の静的確認（main push 相当）        | manual | done |

---

## 成果物

| 成果物ファイル                                   | 内容                               |
| ------------------------------------------------ | ---------------------------------- |
| `outputs/phase-11/manual-test-result.md`         | テスト結果と AC 達成状況の記録     |
| `outputs/phase-11/manual-test-report.md`         | 詳細な実行レポート                 |
| `outputs/phase-11/discovered-issues.md`          | 発見された問題（0 件でも出力必須） |
| `outputs/phase-11/ci-timing-measurements.md`     | CI 実行時間・ステップ別計測値      |
| `outputs/phase-11/phase11-capture-metadata.json` | captureMode: NON_VISUAL の記録     |

---

## 完了条件

- [ ] シャード 1/2・2/2 でカバレッジ付き実行が成功し、`apps/backend/coverage/` が生成されていること
- [ ] カバレッジなし実行（main push 以外）でカバレッジファイルが生成されないことを確認した
- [ ] CI PR トリガー時に coverage ステップがスキップされることを確認した
- [ ] CI main push トリガー時に coverage ステップが実行されることを確認した
- [ ] AC-5（desktop フラグ回帰なし）を workflow 静的確認で確認した
- [ ] 発見された問題を `discovered-issues.md` に記録した（0 件でも記録）
- [ ] `phase11-capture-metadata.json` を作成した

---

## タスク 100%実行確認【必須】

- [ ] タスク 1 完了: シャード 1 カバレッジ付き実行テスト
- [ ] タスク 2 完了: シャード 2 カバレッジ付き実行テスト
- [ ] タスク 3 完了: カバレッジなし実行テスト（main push 以外）
- [ ] タスク 4 完了: `apps/backend/coverage/` ディレクトリ確認
- [ ] タスク 5 完了: CI 動作検証（main push 以外）
- [ ] タスク 6 完了: CI 動作検証（main push）
- [ ] 全成果物ファイルが生成されていること

```bash
node .claude/skills/task-specification-creator/scripts/complete-phase.js \
  --workflow docs/30-workflows/task-ci-future-007-backend-codecov-upload --phase 11 \
  --artifacts "outputs/phase-11/manual-test-result.md:手動テスト結果"
```

---

## 次 Phase

Phase 12: ドキュメント更新 → [phase-12-documentation.md](phase-12-documentation.md)

> **条件**: AC-3 または AC-4 が未達成の場合は Phase 5（実装）または Phase 2（設計）へ戻ること。
