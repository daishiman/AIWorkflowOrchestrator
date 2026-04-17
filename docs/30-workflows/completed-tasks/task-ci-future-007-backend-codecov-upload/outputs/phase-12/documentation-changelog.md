# Phase 12: Documentation Changelog

## 作成日

2026-04-16

---

## 変更サマリ

| ファイル                                                                             | 変更種別 | baseline（変更前）                                             | current（変更後）                                                               |
| ------------------------------------------------------------------------------------ | -------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `apps/backend/vitest.config.ts`                                                      | 修正     | `reporter: ["text", "json", "html"]` / `enabled` なし          | `reporter: ["json", "lcov"]` / `enabled: !!process.env.VITEST_SHARDED_COVERAGE` |
| `.github/workflows/ci.yml`                                                           | 修正     | `test-web`: `pull_request` ベースの条件分岐                    | `test-web`: `push` + `main` の strict 条件分岐                                  |
| `.github/workflows/ci.yml`                                                           | 修正     | `coverage`: `needs: [test-shared, test-desktop]`               | `coverage`: `needs: [test-shared, test-desktop, test-web]`                      |
| `.github/workflows/ci.yml`                                                           | 修正     | `coverage`: desktop のみアップロード（`directory: coverage/`） | `coverage`: desktop + backend アップロード（ディレクトリ分離）                  |
| `codecov.yml`                                                                        | 修正     | `backend` flag なし                                            | `backend` flag 追加 / `carryforward: true`                                      |
| `docs/30-workflows/task-ci-future-007-backend-codecov-upload/artifacts.json`         | 修正     | `phase-11` に 4 件の出力のみ                                   | `phase-11` に `manual-test-report.md` と `ci-timing-measurements.md` を追加     |
| `docs/30-workflows/task-ci-future-007-backend-codecov-upload/outputs/artifacts.json` | 修正     | `spec_created` / `not_started` ベース                          | `phase12_completed` / completed 同期                                            |
| `outputs/phase-11/manual-test-report.md`                                             | 新規整備 | 未記録                                                         | CLI / 静的確認の実測結果を記録                                                  |
| `outputs/phase-11/ci-timing-measurements.md`                                         | 新規整備 | 未記録                                                         | shard 実測時間を記録                                                            |

---

## 変更理由

- `@repo/backend` のテストカバレッジが Codecov に可視化されていなかった
- `desktop` のみが Codecov に送られ、`backend` は収集されていなかった
- `codecov.yml` に `backend` flag を追加し、`shared` / `desktop` / `backend` の 3 系統で可視化できるようにした
- `artifacts.json` と `outputs/artifacts.json` の同期漏れがあり、Phase 11 の証跡も不足していた

---

## MINOR 残存（観測待ち）

| MINOR ID | 内容                              | 状態            |
| -------- | --------------------------------- | --------------- |
| CI-M-01  | coverage ジョブのタイムアウト観測 | CI 実行後に確認 |
| CI-M-02  | test-web main push 実行時間増加   | CI 実行後に確認 |

---

## validator 実行結果

```bash
python3 -c "import yaml; yaml.safe_load(open('.github/workflows/ci.yml'))" && echo "YAML OK"
# → YAML OK ✓
```
