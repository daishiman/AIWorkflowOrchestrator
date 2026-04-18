# Phase 5: 実装

## メタ情報

| 項目   | 値                                        |
| ------ | ----------------------------------------- |
| Phase  | 5                                         |
| 機能名 | task-ci-future-007-backend-codecov-upload |
| 作成日 | 2026-04-16                                |

## 目的

設計に基づき `.github/workflows/ci.yml`、`apps/backend/vitest.config.ts`、`codecov.yml` を修正する。
`test-web` ジョブ（実体は `@repo/backend`）にカバレッジ収集を追加し、
`push` の main ブランチ時のみ収集する条件分岐と、
`codecov.yml` に `backend` フラグを追加してアップロードする `coverage` ジョブへの対応を実装する。

---

## 実行タスク

- **タスク1**: `apps/backend/vitest.config.ts` のカバレッジ設定追加（必要な場合）
- **タスク2**: `test-web` ジョブへの条件分岐追加（`push` の main ブランチ時のみ `--coverage`）
- **タスク3**: `coverage` ジョブへの `backend` 対応追加（`needs` 追加・download-artifact・codecov-action with flags: backend）
- **タスク4**: GREEN 確認（ローカルでカバレッジ付き実行）

---

## 参照資料

| 資料名                   | パス                                                             | 説明                           |
| ------------------------ | ---------------------------------------------------------------- | ------------------------------ |
| Phase 4 テスト計画       | `outputs/phase-4/verification-plan.md`                           | 確認手順の参照                 |
| CI ワークフロー          | `.github/workflows/ci.yml`                                       | 修正対象ファイル               |
| vitest 設定              | `apps/backend/vitest.config.ts`                                  | カバレッジ設定追加対象         |
| codecov-action 公式      | https://github.com/codecov/codecov-action                        | codecov-action v5 仕様         |
| Codecov 設定             | `codecov.yml`                                                    | `backend` flag 定義の追加      |
| desktop カバレッジ実装例 | `.github/workflows/ci.yml`（`test-desktop` / `coverage` ジョブ） | 参照パターン（desktop フラグ） |

## 統合テスト連携

- `outputs/phase-4/verification-plan.md` の Case 1〜6 と `rollback-criteria.md` を、実装後の current facts / 合否基準としてそのまま使う。
- `outputs/phase-5/implementation-result.md` と `outputs/phase-5/green-confirmation.md` に、`test-web` 条件分岐・`backend` アップロード・`vitest.config.ts` 設定の実装結果を記録する。
- `outputs/phase-5/green-confirmation.md` の結果は Phase 6 のテスト拡張、Phase 7 の回帰確認、Phase 8 の収束判断へ引き継ぐ。
- Phase 4 計画で定義していない挙動が出た場合は、実装を進める前に Phase 4 へ差し戻す。

---

## 実装対象ファイル一覧

| ファイル                        | 変更種別 | 変更内容                                                |
| ------------------------------- | -------- | ------------------------------------------------------- |
| `apps/backend/vitest.config.ts` | 修正     | coverage プロバイダー・レポーター設定の追加             |
| `.github/workflows/ci.yml`      | 修正     | test-web ジョブへの strict 条件分岐・カバレッジ対応追加 |
| `.github/workflows/ci.yml`      | 修正     | coverage ジョブへの backend フラグ対応追加              |
| `codecov.yml`                   | 修正     | `backend` フラグ定義を追加                              |

---

## 実行手順

### ステップ0: P50 チェック（現在の `test-web` ジョブ・`coverage` ジョブの実装状態を再確認）【必須】

```bash
# test-web ジョブの現在の実装を確認
grep -n "test-web\|VITEST_SHARDED_COVERAGE\|coverage\|--coverage" .github/workflows/ci.yml | head -40

# coverage ジョブの現在の実装を確認
grep -n -A30 "^\s\{2\}coverage:" .github/workflows/ci.yml | head -50

# apps/backend/vitest.config.ts のカバレッジ設定を確認
grep -n "coverage\|provider\|reporter\|reportsDirectory" apps/backend/vitest.config.ts
```

### ステップ1: `apps/backend/vitest.config.ts` 確認と設定追加

`apps/backend/vitest.config.ts` に `coverage` 設定が存在しない場合は以下を追加する:

```typescript
coverage: {
  provider: "v8",
  reporter: ["json", "lcov"],
  reportsDirectory: "./coverage",
  enabled: !!process.env.VITEST_SHARDED_COVERAGE,
}
```

**実装後の確認**:

```bash
# coverage 設定が追加されていることを確認
grep -n "coverage\|provider\|reporter\|reportsDirectory" apps/backend/vitest.config.ts
```

### ステップ2: `test-web` ジョブの修正（push / main 条件分岐）

`.github/workflows/ci.yml` の `test-web` ジョブのテスト実行ステップに、イベントに応じた条件分岐を追加する。

```yaml
- name: Run web app tests (shard ${{ matrix.shard }}/2)
  run: |
    if [ "${{ github.event_name }}" = "push" ] && [ "${{ github.ref }}" = "refs/heads/main" ]; then
      VITEST_SHARDED_COVERAGE=true pnpm --filter @repo/backend exec vitest run --shard=${{ matrix.shard }}/2 --coverage
    else
      pnpm --filter @repo/backend exec vitest run --shard=${{ matrix.shard }}/2
    fi
```

**実装後の確認**:

```bash
# 条件分岐が追加されていることを確認
grep -n "github.event_name == 'push' && github.ref == 'refs/heads/main'\|VITEST_SHARDED_COVERAGE\|--coverage" .github/workflows/ci.yml
```

### ステップ3: アーティファクトアップロードステップの追加

`test-web` ジョブに、`push` の main ブランチ時のみカバレッジアーティファクトをアップロードするステップを追加する。

```yaml
- name: Upload backend coverage artifact
  if: github.event_name == 'push' && github.ref == 'refs/heads/main'
  uses: actions/upload-artifact@v4
  with:
    name: backend-coverage-${{ matrix.shard }}
    path: apps/backend/coverage/
    if-no-files-found: error
```

**実装後の確認**:

```bash
# アーティファクトアップロードステップが追加されていることを確認
grep -n "backend-coverage\|upload-artifact" .github/workflows/ci.yml
```

### ステップ4: `coverage` ジョブの修正（`backend` フラグ対応）

`.github/workflows/ci.yml` の `coverage` ジョブに以下を追加する:

1. `needs` に `test-web` を追加
2. `backend-coverage-*` アーティファクトのダウンロードステップを追加
3. `flags: backend` 付きの `codecov/codecov-action@v5` ステップを追加

```yaml
# needs に test-web を追加
needs: [test-shared, test-desktop, test-web]

# backend カバレッジアーティファクトのダウンロード
- name: Download backend coverage artifacts
  uses: actions/download-artifact@v4
  with:
    pattern: backend-coverage-*
    path: coverage/backend
    # merge-multiple は使わず、各アーティファクトを個別ディレクトリで保持する

# Codecov へ backend フラグでアップロード
- name: Upload backend coverage to Codecov
  uses: codecov/codecov-action@v5
  with:
    directory: coverage/backend
    flags: backend
    token: ${{ secrets.CODECOV_TOKEN }}
    fail_ci_if_error: false
```

**実装後の確認**:

```bash
# coverage ジョブに test-web の needs が追加されていることを確認
grep -n -A5 "^\s\{2\}coverage:" .github/workflows/ci.yml | grep "needs"

# backend フラグ付きの codecov-action ステップを確認
grep -n "flags: backend\|backend-coverage" .github/workflows/ci.yml
```

### ステップ5: ローカル GREEN 確認

```bash
# main push 相当のカバレッジ付き実行（シャード 1/2）
cd apps/backend
VITEST_SHARDED_COVERAGE=true pnpm vitest run --shard=1/2 --coverage

# カバレッジファイルの生成確認
ls -la apps/backend/coverage/

# YAML 構文チェック
python3 -c "import yaml; yaml.safe_load(open('.github/workflows/ci.yml'))" && echo "YAML OK"
```

---

## 注意事項

### PR 時のカバレッジスキップ設計

PR 時にカバレッジを収集しない理由:

- カバレッジ収集は実行時間を増加させる（v8 provider で +20〜30% 程度）
- PR の高速フィードバックを優先するため、`push` の main ブランチ時のみ収集する
- `github.event_name == 'push' && github.ref == 'refs/heads/main'` の条件で収集を限定する

### VITEST_SHARDED_COVERAGE 環境変数

シャード分割とカバレッジを同時に使用する際、シャードごとにカバレッジファイルが分割されて出力される。
`coverage` ジョブでは `coverage/backend` 配下に各シャードのアーティファクトを保持し、Codecov にアップロードする。

### desktop との一貫性

`test-desktop` ジョブの実装パターンを参考に、同様の条件分岐・アーティファクト名規則を `test-web` にも適用する。

---

## サブタスク管理

| ID     | タスク名                                             | ステータス |
| ------ | ---------------------------------------------------- | ---------- |
| T-05-1 | 実装前の既存設定確認（P50 チェック）                 | 完了       |
| T-05-2 | `apps/backend/vitest.config.ts` のカバレッジ設定追加 | 完了       |
| T-05-3 | `test-web` ジョブへの条件分岐追加                    | 完了       |
| T-05-4 | アーティファクトアップロードステップ追加             | 完了       |
| T-05-5 | `coverage` ジョブへの `backend` 対応追加             | 完了       |
| T-05-6 | ローカル GREEN 確認・YAML 構文チェック               | 完了       |

---

## 成果物

| 成果物                   | 配置先                                     | 形式       |
| ------------------------ | ------------------------------------------ | ---------- |
| 修正済み CI ワークフロー | `.github/workflows/ci.yml`                 | YAML       |
| 修正済み vitest 設定     | `apps/backend/vitest.config.ts`            | TypeScript |
| 実装結果サマリ           | `outputs/phase-5/implementation-result.md` | Markdown   |
| GREEN 確認結果           | `outputs/phase-5/green-confirmation.md`    | Markdown   |

---

## 完了条件

- [ ] AC-1: `ci.yml` に `github.event_name == 'push' && github.ref == 'refs/heads/main'` による条件分岐が存在すること
- [ ] AC-2: `VITEST_SHARDED_COVERAGE=true` かつ `--coverage` が main push 時に付与されること
- [ ] AC-3: `backend-coverage-${{ matrix.shard }}` アーティファクトのアップロードステップが存在すること
- [ ] AC-4: `coverage` ジョブに `flags: backend` 付きの `codecov/codecov-action@v5` ステップが存在すること
- [ ] AC-5: PR 時の分岐でカバレッジなし実行になっていること
- [ ] `apps/backend/vitest.config.ts` に `provider: "v8"` のカバレッジ設定が存在すること
- [ ] YAML 構文チェックが PASS していること
- [ ] `outputs/phase-5/` に全成果物が生成されていること

---

## タスク100%実行確認【必須】

- [ ] T-05-1: 実装前確認（P50 チェック・現行設定の grep）を実行済み
- [ ] T-05-2: `apps/backend/vitest.config.ts` のカバレッジ設定追加完了（または設定済みを確認済み）
- [ ] T-05-3: `test-web` ジョブへの条件分岐追加完了
- [ ] T-05-4: アーティファクトアップロードステップ追加完了
- [ ] T-05-5: `coverage` ジョブへの `backend` 対応追加完了
- [ ] T-05-6: ローカル GREEN 確認・YAML 構文チェック PASS を `outputs/phase-5/green-confirmation.md` に記録済み
