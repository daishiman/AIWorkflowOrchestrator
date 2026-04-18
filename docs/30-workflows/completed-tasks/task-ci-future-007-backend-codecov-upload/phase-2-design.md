# Phase 2: 設計

## メタ情報

| 項目   | 値                                        |
| ------ | ----------------------------------------- |
| Phase  | 2                                         |
| 機能名 | task-ci-future-007-backend-codecov-upload |
| 作成日 | 2026-04-16                                |

## 目的

実装前の詳細設計を確定する。
`apps/backend/vitest.config.ts` のカバレッジ設定・`test-web` ジョブの PR/main push 条件分岐・`coverage` ジョブの `backend` 対応・アーティファクト設計を確定し、Phase 3 レビューゲートに入力する。

---

## 実行タスク

- **タスク1**: `apps/backend/vitest.config.ts` のカバレッジ設定設計（`desktop` と同等の v8 プロバイダー・json/lcov reporter）
- **タスク2**: `test-web` ジョブの条件分岐設計（PR 時はカバレッジなし・main push 時は `--coverage` 付与）
- **タスク3**: `coverage` ジョブの `backend` 対応設計（`download-artifact` + `codecov-action` の `backend` フラグ）
- **タスク4**: アーティファクト設計（`backend-coverage-{shard}` の命名・`apps/backend/coverage/` パス）
- **タスク5**: validation matrix（PR 実行・main push 実行・Codecov アップロードの 3 パターン）の策定

---

## 参照資料

| 資料名              | パス                                     | 説明                                              |
| ------------------- | ---------------------------------------- | ------------------------------------------------- |
| Phase 1 受入基準    | `outputs/phase-1/acceptance-criteria.md` | AC-1〜AC-5                                        |
| Phase 1 現状確認    | `outputs/phase-1/current-state.md`       | `test-web` シャード数・コマンド・現行 flags       |
| CI ワークフロー     | `.github/workflows/ci.yml`               | 改善対象ファイル                                  |
| backend vitest 設定 | `apps/backend/vitest.config.ts`          | カバレッジ設定の追加対象                          |
| desktop vitest 設定 | `apps/desktop/vitest.config.ts`          | カバレッジ設定の参考（v8 プロバイダー・reporter） |
| Phase 1 リスク      | `outputs/phase-1/risks.md`               | Phase 1 成果物                                    |

## 統合テスト連携

- `outputs/phase-1/acceptance-criteria.md` の AC-1〜AC-5 と `outputs/phase-1/current-state.md` の current facts を、`test-web` 条件分岐と artifact 命名の設計根拠に使う。
- `VITEST_SHARDED_COVERAGE`・`--coverage`・`backend-coverage-{shard}`・`backend` flags の採否は、Phase 1 の受入基準に照らして `outputs/phase-2/design-decisions.md` に固定する。
- `outputs/phase-2/validation-matrix.md` は Phase 3 のレビュー入力であり、Phase 4 のテスト計画入力でもある。
- Phase 1 の current-state と矛盾する差分が出た場合は、受入基準を動かさず設計判断として明示して Phase 3 へ渡す。

---

## 実行手順

### ステップ1: `apps/backend/vitest.config.ts` のカバレッジ設定設計

`apps/desktop/vitest.config.ts` と同等のカバレッジ設定を backend に追加する設計を確定する。

```bash
# desktop のカバレッジ設定全体を確認（設計の参考）
grep -n -A 30 "coverage:" apps/desktop/vitest.config.ts

# backend の vitest.config.ts 全体を確認
cat apps/backend/vitest.config.ts

# VITEST_SHARDED_COVERAGE 環境変数の desktop での使用方法を確認
grep -n "VITEST_SHARDED_COVERAGE\|reportsDirectory\|enabled" apps/desktop/vitest.config.ts
```

**カバレッジ設定設計**:

| 設定項目           | 値                                      | 根拠                                     |
| ------------------ | --------------------------------------- | ---------------------------------------- |
| `provider`         | `'v8'`                                  | desktop と統一・Node.js ネイティブで高速 |
| `reporter`         | `['json', 'lcov']`                      | Codecov が json/lcov を要求              |
| `reportsDirectory` | `'coverage'`                            | `apps/backend/coverage/` に出力          |
| `enabled`          | `!!process.env.VITEST_SHARDED_COVERAGE` | 環境変数で制御。CI の条件分岐と連動      |

**追加が必要な場合の設定イメージ**:

```typescript
// apps/backend/vitest.config.ts への追加設計
coverage: {
  provider: 'v8',
  reporter: ['json', 'lcov'],
  reportsDirectory: 'coverage',
  enabled: !!process.env.VITEST_SHARDED_COVERAGE,
},
```

**設計判断**: `apps/backend/vitest.config.ts` に既存のカバレッジ設定がない場合のみ追加する。既に設定が存在する場合は `enabled` 条件の追加のみで対応する。

---

### ステップ2: `test-web` ジョブの条件分岐設計

PR 時はカバレッジを収集せず実行時間を変えない。main push 時のみ `--coverage` を付与する設計を確定する。

```bash
# 現在の test-web ジョブの vitest 実行コマンドを確認
grep -n -A 5 "vitest run\|vitest exec" .github/workflows/ci.yml | grep -A5 -B5 "web\|backend"

# pull_request イベントの条件分岐の既存パターンを確認
grep -n "github.event_name\|pull_request\|push" .github/workflows/ci.yml | head -30

# test-desktop ジョブのカバレッジ条件分岐を参考に確認
grep -n -B 5 -A 20 "VITEST_SHARDED_COVERAGE\|--coverage" .github/workflows/ci.yml
```

**条件分岐設計**:

| トリガー       | `VITEST_SHARDED_COVERAGE` | `--coverage` オプション | アーティファクト           |
| -------------- | ------------------------- | ----------------------- | -------------------------- |
| `pull_request` | 未設定                    | なし                    | アップロードなし           |
| `push` (main)  | `true`                    | 付与                    | `backend-coverage-{shard}` |

**条件分岐実装設計イメージ**:

```yaml
# test-web ジョブへの追加設計
- name: Run backend tests (with coverage on main push)
  env:
    VITEST_SHARDED_COVERAGE: ${{ github.event_name == 'push' && 'true' || '' }}
  run: |
    if [ "${{ github.event_name }}" = "push" ]; then
      pnpm --filter @repo/backend exec vitest run \
        --shard=${{ matrix.shard }}/2 \
        --coverage
    else
      pnpm --filter @repo/backend exec vitest run \
        --shard=${{ matrix.shard }}/2
    fi

- name: Upload backend coverage artifact
  if: github.event_name == 'push'
  uses: actions/upload-artifact@v4
  with:
    name: backend-coverage-${{ matrix.shard }}
    path: apps/backend/coverage/
    if-no-files-found: error
```

**設計上の考慮点**:

- `github.event_name == 'push'` の条件でシンプルに分岐（`pull_request` 以外は全て main push 扱いで問題ない）
- `if-no-files-found: error` でカバレッジファイルが生成されなかった場合に CI が失敗するよう保護

---

### ステップ3: `coverage` ジョブの `backend` 対応設計

既存の `desktop` フラグ対応を維持しながら `backend` フラグのアップロードを追加する設計を確定する。

```bash
# coverage ジョブの全体設計を確認
grep -n -B 5 -A 50 "^  coverage:" .github/workflows/ci.yml

# 既存の download-artifact 設定を確認
grep -n -A 10 "download-artifact\|desktop-coverage" .github/workflows/ci.yml

# 既存の codecov-action 設定を確認
grep -n -A 15 "codecov/codecov-action" .github/workflows/ci.yml
```

**`coverage` ジョブへの追加設計**:

```yaml
# backend-coverage アーティファクトのダウンロード追加
- name: Download backend coverage artifacts
  uses: actions/download-artifact@v4
  with:
    pattern: backend-coverage-*
    path: coverage/backend
    merge-multiple: true

# Codecov への backend フラグアップロード追加
- name: Upload backend coverage to Codecov
  uses: codecov/codecov-action@v5
  with:
    directory: coverage/backend
    flags: backend
    fail_ci_if_error: false
```

**設計判断**:

| 決定事項                   | 選択                       | 理由                                                   |
| -------------------------- | -------------------------- | ------------------------------------------------------ |
| アーティファクト名パターン | `backend-coverage-{shard}` | `desktop-coverage-{shard}` と命名規則を統一            |
| Codecov フラグ             | `backend`                  | `desktop` フラグとの区別・Codecov ダッシュボードで識別 |
| ダウンロード先パス         | `coverage/backend`         | `coverage/desktop` との分離で混在防止                  |
| `merge-multiple: true`     | 採用                       | 複数シャードのアーティファクトを1ディレクトリに統合    |

---

### ステップ4: validation matrix

| パターン | 実行条件     | `VITEST_SHARDED_COVERAGE` | `--coverage` | アーティファクト           | Codecov アップロード   |
| -------- | ------------ | ------------------------- | ------------ | -------------------------- | ---------------------- |
| Case A   | PR           | 未設定                    | なし         | なし                       | なし                   |
| Case B   | main push    | `true`                    | 付与         | `backend-coverage-{shard}` | `backend` フラグで実施 |
| Case C   | main push 後 | -                         | -            | ダウンロード済み           | Codecov に反映         |

---

## 完了条件

- [ ] `apps/backend/vitest.config.ts` のカバレッジ設定設計（v8 プロバイダー・json/lcov reporter・`VITEST_SHARDED_COVERAGE` 環境変数制御）が確定していること
- [ ] `test-web` ジョブの条件分岐設計（PR 時はカバレッジなし・main push 時は `--coverage` + アーティファクトアップロード）が確定していること
- [ ] `coverage` ジョブへの `backend-coverage-*` ダウンロードと Codecov `backend` フラグアップロードの設計が確定していること
- [ ] アーティファクト命名規則（`backend-coverage-{shard}`）が確定していること
- [ ] validation matrix（Case A〜C の 3 パターン）が確定していること
- [ ] 設計判断記録が `outputs/phase-2/design-decisions.md` に記録されていること

## 成果物

| 成果物            | 配置先                                 | 形式     |
| ----------------- | -------------------------------------- | -------- |
| 設計判断記録      | `outputs/phase-2/design-decisions.md`  | Markdown |
| validation matrix | `outputs/phase-2/validation-matrix.md` | Markdown |

---

## タスク100%実行確認【必須】

- [ ] T-02-1: `apps/backend/vitest.config.ts` のカバレッジ設定設計を `outputs/phase-2/design-decisions.md` に記録済み
- [ ] T-02-2: `test-web` ジョブの条件分岐設計（PR/main push 分岐・コマンド差分）を記録済み
- [ ] T-02-3: `coverage` ジョブの `backend` 対応設計（download-artifact + codecov-action 設定）を記録済み
- [ ] T-02-4: アーティファクト設計（命名規則・`apps/backend/coverage/` パス・`merge-multiple` 設定）を記録済み
- [ ] T-02-5: validation matrix（Case A〜C の 3 パターン）を `outputs/phase-2/validation-matrix.md` に記録済み

---

## 次Phase

**Phase 3: 設計レビューゲート** — Phase 2 設計の MINOR/MAJOR 問題を検出し、レビューゲートでの Phase 4 進行可否を判定する。

**ゲート条件**: Phase 1〜2 の全完了条件を満たさない場合、Phase 3 へ進まないこと。
