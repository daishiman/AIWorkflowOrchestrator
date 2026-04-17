# Phase 1: 要件定義

## メタ情報

| 項目   | 値                                        |
| ------ | ----------------------------------------- |
| Phase  | 1                                         |
| 機能名 | task-ci-future-007-backend-codecov-upload |
| 作成日 | 2026-04-16                                |

## 目的

`@repo/backend`（`apps/backend/`）のテストカバレッジを CI で収集し Codecov にアップロードできる状態を実現する。
現在は `@repo/desktop` のカバレッジのみが Codecov にアップロードされており、`@repo/backend` のカバレッジが収集・可視化されていない。
`test-web` ジョブへの条件分岐追加とアーティファクト設計、`coverage` ジョブへの `backend` フラグ対応によって、PR 時の実行時間を増やさずに main push 時のカバレッジ収集を実現する。

---

## Step 0: P50チェック【必須】

Phase 1 開始前に、対象ファイルの実装状態と現行 CI の `test-web` / `coverage` ジョブの挙動を確認し、設計方針の重複・齟齬を防止する。

```bash
# apps/backend/vitest.config.ts のカバレッジ設定を確認
cat apps/backend/vitest.config.ts

# apps/desktop/vitest.config.ts のカバレッジ設定を比較参照
grep -n "coverage\|provider\|reporter\|reportsDirectory" apps/desktop/vitest.config.ts

# ci.yml の test-web ジョブ全体を確認
grep -n -A 40 "^  test-web:" .github/workflows/ci.yml

# ci.yml の coverage ジョブ全体を確認
grep -n -A 40 "^  coverage:" .github/workflows/ci.yml

# 現在の Codecov アップロード設定（flags）を確認
grep -n "flags\|codecov\|CODECOV" .github/workflows/ci.yml

# backend のシャード数設定を確認
grep -n "shard\|matrix" .github/workflows/ci.yml | grep -A3 -B3 "web\|backend"
```

**確認事項**:

- [ ] `apps/backend/vitest.config.ts` にカバレッジ設定（`coverage.provider`・`coverage.reporter`）が存在するか確認
- [ ] `apps/desktop/vitest.config.ts` で使用されているカバレッジプロバイダー（v8）と同等の設定が backend に必要か判断
- [ ] `test-web` ジョブが PR・main push 両方で `--coverage` なしで実行されていることを確認
- [ ] `coverage` ジョブが `desktop-coverage-*` アーティファクトのみをダウンロードしていることを確認

---

## 実行タスク

- **タスク1**: P50チェック — `apps/backend/vitest.config.ts`・`ci.yml` の現状確認
- **タスク2**: 現状調査 — `test-web` ジョブのシャード構成・アーティファクト設計・`coverage` ジョブの Codecov フラグ設定を文書化
- **タスク3**: 受入基準（AC-1〜AC-5）の定義
- **タスク4**: 依存タスク確認 — TASK-CI-FUTURE-002 との設計整合性確認
- **タスク5**: リスク整理 — PR 実行時間への影響・`coverage` ジョブへの後方互換リスクを文書化

---

## 参照資料

| 資料名                    | パス                                        | 説明                                              |
| ------------------------- | ------------------------------------------- | ------------------------------------------------- |
| CI ワークフロー           | `.github/workflows/ci.yml`                  | `test-web` / `coverage` ジョブ設計の改善対象      |
| backend vitest 設定       | `apps/backend/vitest.config.ts`             | カバレッジ設定の追加要否判断                      |
| desktop vitest 設定       | `apps/desktop/vitest.config.ts`             | カバレッジ設定の参考（v8 プロバイダー・reporter） |
| TASK-CI-FUTURE-002 仕様書 | `docs/30-workflows/` 配下の該当ディレクトリ | `test-web` ジョブ設計の背景・依存関係確認         |

## 統合テスト連携

- `outputs/phase-1/acceptance-criteria.md` の AC-1〜AC-5 を Phase 2 の設計判断に渡し、Phase 4/6/9/10/11 の検証基準として再利用する。
- `outputs/phase-1/current-state.md` の `test-web` シャード数・`coverage` 現行 flags・現行 vitest 設定を current facts として固定し、Phase 2 の前提にする。
- `outputs/phase-1/risks.md` の PR 時実行時間・desktop 回帰リスクを Phase 2/3 のゲート判定へ引き継ぐ。
- Phase 1 の受入基準と current-state は source of truth として保持し、後続 Phase で差分が出た場合は設計側に閉じる。

---

## 実行手順

### ステップ1: 現状分析

```bash
# 1. backend vitest.config.ts のカバレッジ設定有無を確認
grep -n "coverage" apps/backend/vitest.config.ts || echo "coverage設定なし"

# 2. desktop のカバレッジ設定を参照（設計の参考にする）
grep -n -A 20 "coverage:" apps/desktop/vitest.config.ts

# 3. test-web ジョブの現行コマンドを確認
grep -n -B 5 -A 30 "test-web:" .github/workflows/ci.yml

# 4. coverage ジョブの現行設定を確認
grep -n -B 5 -A 40 "coverage:" .github/workflows/ci.yml

# 5. 現在の Codecov アップロード flags を確認
grep -n -A 10 "codecov/codecov-action" .github/workflows/ci.yml
```

**把握すべき情報**:

- `apps/backend/vitest.config.ts` にカバレッジ設定が存在するか（`provider: 'v8'`・`reporter`）
- `test-web` ジョブのシャード数（matrix.shard の値）
- `coverage` ジョブが使用しているアーティファクト名パターン（`desktop-coverage-*`）
- 現在の Codecov アップロードで使用されている `flags` の値（`desktop` フラグのみか確認）

### ステップ2: 受入基準の確定

以下の受入基準を確定し、成果物として `outputs/phase-1/acceptance-criteria.md` に記録する。

**受入基準（AC-1〜AC-5）**:

| AC番号 | 基準                                                                                                                      | 検証方法                                                      |
| ------ | ------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| AC-1   | `test-web` ジョブに PR / main push の条件分岐が追加されている                                                             | `ci.yml` の diff 確認・`if:` 条件ブロックの存在確認           |
| AC-2   | main push 時に `VITEST_SHARDED_COVERAGE=true` 環境変数が設定され `--coverage` オプションが付与される                      | CI ログの vitest 実行コマンド確認                             |
| AC-3   | main push 時に `backend-coverage-{shard}` アーティファクトがアップロードされる                                            | CI ログの `upload-artifact` ステップ確認                      |
| AC-4   | `coverage` ジョブで `backend-coverage-*` アーティファクトをダウンロードし Codecov に `backend` フラグでアップロードされる | CI ログの codecov-action ステップの flags 確認                |
| AC-5   | PR 時の `test-web` 実行時間がカバレッジ追加前と変化しない（PR はカバレッジ収集なし）                                      | PR ブランチの CI ログで `--coverage` が付与されないことを確認 |

---

## 完了条件

- [ ] P50チェックを実行し、`apps/backend/vitest.config.ts` のカバレッジ設定有無が確認済みであること
- [ ] `test-web` ジョブのシャード数・実行コマンド・アーティファクト設定が確認済みであること
- [ ] `coverage` ジョブの現行 Codecov フラグ設定（`desktop` のみ）が確認済みであること
- [ ] 受入基準 AC-1〜AC-5 が全て定義・文書化されていること
- [ ] 変更対象ファイル（`.github/workflows/ci.yml`・必要な場合 `apps/backend/vitest.config.ts`）が確定していること
- [ ] TASK-CI-FUTURE-002 との依存関係・整合性が確認済みであること
- [ ] `outputs/phase-1/` に全成果物が生成されていること

## 成果物

| 成果物     | 配置先                                   | 形式     |
| ---------- | ---------------------------------------- | -------- |
| 現状確認   | `outputs/phase-1/current-state.md`       | Markdown |
| 受入基準   | `outputs/phase-1/acceptance-criteria.md` | Markdown |
| リスク整理 | `outputs/phase-1/risks.md`               | Markdown |

---

## タスク100%実行確認【必須】

Phase 1 完了時に以下を確認して記録すること:

- [ ] T-01-1: P50チェック実行済み（`apps/backend/vitest.config.ts` と `ci.yml` の現状確認）
- [ ] T-01-2: `test-web` ジョブのシャード数・コマンド・アーティファクト設定を `outputs/phase-1/current-state.md` に記録済み
- [ ] T-01-3: `coverage` ジョブの現行 Codecov フラグ設定を `outputs/phase-1/current-state.md` に記録済み
- [ ] T-01-4: 受入基準 AC-1〜AC-5 を `outputs/phase-1/acceptance-criteria.md` に記録済み
- [ ] T-01-5: リスク（PR 実行時間への影響・desktop 回帰リスク・backend vitest.config.ts 修正要否）を `outputs/phase-1/risks.md` に記録済み

---

## 次Phase

**Phase 2: 設計** — `apps/backend/vitest.config.ts` のカバレッジ設定設計・`test-web` ジョブの条件分岐設計・`coverage` ジョブの `backend` 対応設計を行う。

**ゲート条件**: Phase 1 の全完了条件を満たさない場合、Phase 2 へ進まないこと。
