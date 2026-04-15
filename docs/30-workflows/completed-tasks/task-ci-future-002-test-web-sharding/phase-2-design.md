# Phase 2: シャード数設計

## メタ情報

| 項目   | 値                                   |
| ------ | ------------------------------------ |
| Phase  | 2                                    |
| 機能名 | task-ci-future-002-test-web-sharding |
| 作成日 | 2026-04-15                           |

## 目的

Phase 1 で確認した CI 並列数・実行時間ベースライン・`vitest.config.ts` の設定内容を基に、
`test-web` シャード数・`test-desktop` シャード数削減量・`ci.yml` 修正内容を設計として確定する。

> **直列実行の原則**: Phase 1 の全完了条件を満たしてから本 Phase に着手すること。
> Phase 2 完了後、Phase 3（設計レビュー）へ進む。

---

## 実行タスク

- **タスク1**: 並列上限（20）を制約条件とした `test-web` シャード数の計算と決定
- **タスク2**: `test-desktop` シャード数削減の影響評価
- **タスク3**: `ci.yml` の `test-web` ジョブ修正設計（matrix strategy 追加）
- **タスク4**: `apps/web/vitest.config.ts` 修正要否の判断と修正設計（必要な場合）
- **タスク5**: 検証コマンド設計（ローカル動作確認手順）

---

## 参照資料

| 資料名                            | パス                                                                                                    | 説明                                |
| --------------------------------- | ------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| Phase 1 受入基準                  | `outputs/phase-1/acceptance-criteria.md`                                                                | AC-1〜AC-6 との照合                 |
| Phase 1 並列数計算シート          | `outputs/phase-1/parallel-count-calculation.md`                                                         | 設計の起点となる並列数データ        |
| Phase 1 ベースライン計測値        | `outputs/phase-1/baseline-timing.md`                                                                    | AC-4 検証のベースライン             |
| Phase 1 vitest.config.ts 確認結果 | `outputs/phase-1/vitest-config-review.md`                                                               | vitest.config.ts 修正要否の判断材料 |
| CI 設定ファイル                   | `.github/workflows/ci.yml`                                                                              | 修正対象                            |
| Web アプリ Vitest 設定            | `apps/web/vitest.config.ts`                                                                             | 修正対象（必要な場合のみ）          |
| Desktop Vitest 設定（参考）       | `apps/desktop/vitest.config.ts`                                                                         | シャード化実装の参考                |
| TASK-CI-OPT-001 Phase 2 設計書    | `docs/30-workflows/completed-tasks/task-ci-optimization-001/phase-2-design.md`                          | `test-desktop` シャード設計の参考   |
| TASK-CI-OPT-001 タイミング計測    | `docs/30-workflows/completed-tasks/task-ci-optimization-001/outputs/phase-11/ci-timing-measurements.md` | `test-desktop` 7 分 40 秒目標の根拠 |
| タスク指示書                      | `docs/30-workflows/unassigned-task/TASK-CI-FUTURE-002-test-web-sharding.md`                             | シャード数計算式・対応案 A/B の参考 |

---

## 実行手順

### ステップ1: シャード数設計（並列上限 20 の計算根拠）

**制約条件**:

- GitHub Free Tier の並列同時実行上限: 最大 **20 ジョブ**
- 現在の並列数合計: `test-desktop(17) + typecheck(1) + test-shared(1) + e2e-desktop(1) = 20`（上限ちょうど）
- `test-web` に新たなシャードを追加するには、他のジョブの並列数を削減する必要がある

**計算式**:

```
test-web シャード数 = 20 - (test-desktop_shards + typecheck + test-shared + e2e-desktop)
                   = 20 - (test-desktop_shards + 1 + 1 + 1)
                   = 17 - test-desktop_shards
```

**対応案の比較**:

| 対応案 | test-desktop シャード数 | test-web シャード数 | 合計並列数    | 上限遵守       |
| ------ | ----------------------- | ------------------- | ------------- | -------------- |
| 案 A   | 15                      | 2                   | 15+2+1+1+1=20 | OK             |
| 案 B   | 14                      | 3                   | 14+3+1+1+1=20 | OK             |
| 案 C   | 13                      | 4                   | 13+4+1+1+1=20 | OK             |
| 案 NG  | 14                      | 4                   | 14+4+1+1+1=21 | NG（上限超過） |

**設計判断**:

Phase 1 の `baseline-timing.md` に記録された `test-web` のテスト件数と実行時間を基に、
最適な対応案を選択する。

選択基準:

1. `test-desktop` 実行時間が TASK-CI-OPT-001 の目標（7 分 40 秒以内）を維持できること
2. `test-web` のシャード数が `test-web` のテスト件数に対して適切であること（過剰シャードは非効率）
3. 将来のテスト数増加時に再調整が最小限で済む案を優先すること

```bash
# 設計判断のための追加確認
# test-desktop のシャード数削減シミュレーション（ローカル）
pnpm --filter @repo/desktop exec vitest run --shard=1/15 -- --reporter=verbose 2>&1 | tail -5
pnpm --filter @repo/desktop exec vitest run --shard=1/14 -- --reporter=verbose 2>&1 | tail -5

# test-web のテスト件数確認
pnpm --filter @repo/web test -- --reporter=verbose 2>&1 | grep -E "Tests|passed|failed"
```

### ステップ2: test-desktop シャード数削減の影響評価

```bash
# test-desktop の現在の実行時間を確認（シャード 1/17）
time pnpm --filter @repo/desktop exec vitest run --shard=1/17

# 削減案でのシミュレーション（案Aの場合: 15シャード）
time pnpm --filter @repo/desktop exec vitest run --shard=1/15
time pnpm --filter @repo/desktop exec vitest run --shard=15/15
```

**評価観点**:

| 評価項目                                           | 確認方法                                         | 合格基準                                 |
| -------------------------------------------------- | ------------------------------------------------ | ---------------------------------------- |
| test-desktop の最長シャード実行時間                | ローカルで各シャードを実行し最長を計測           | TASK-CI-OPT-001 目標 7 分 40 秒以内      |
| test-desktop のテストファイル/シャード分散の均等性 | `vitest run --shard=N/M --reporter=verbose` 確認 | 各シャード間のファイル数差が ±3 以内目安 |

**削減影響評価テーブル（Phase 3 で最終確認）**:

| 項目                                      | 17 シャード（現在） | 15 シャード（案 A） | 14 シャード（案 B） |
| ----------------------------------------- | ------------------- | ------------------- | ------------------- |
| test-desktop 最長シャード実行時間（推定） | TBD（Phase 1 計測） | TBD（Phase 2 計算） | TBD（Phase 2 計算） |
| TASK-CI-OPT-001 目標（7:40）との余裕      | TBD                 | TBD                 | TBD                 |
| test-web に確保できるシャード数           | 0                   | 2                   | 3                   |

### ステップ3: ci.yml 修正設計

#### 3-1. test-web ジョブへの matrix 追加

**設計対象**: `.github/workflows/ci.yml` の `test-web` ジョブ

**修正前（現状）**:

```yaml
test-web:
  name: Test (web)
  runs-on: ubuntu-latest
  needs: [build-shared]
  # matrix なし（単一ジョブ）
  steps:
    - run: pnpm --filter @repo/web test
```

**修正後（案 A: 2 シャードの場合）**:

```yaml
test-web:
  name: Test (web)
  runs-on: ubuntu-latest
  needs: [build-shared]
  timeout-minutes: 15
  strategy:
    fail-fast: false
    matrix:
      # TASK-CI-FUTURE-002:
      # 2シャードに分割（test-desktop を15に削減して確保）
      # 並列数合計: test-desktop(15) + test-web(2) + typecheck(1) + test-shared(1) + e2e-desktop(1) = 20
      shard: [1, 2]
  env:
    NODE_OPTIONS: --max-old-space-size=4096
    CI: true
  steps:
    - name: Checkout
      uses: actions/checkout@v4

    - name: Setup pnpm
      uses: pnpm/action-setup@v4

    - name: Setup Node.js
      uses: actions/setup-node@v6
      with:
        node-version: "22"
        cache: "pnpm"

    - name: Configure git to use HTTPS instead of SSH
      run: git config --global url."https://github.com/".insteadOf "git@github.com:"

    - name: Install dependencies
      uses: ./.github/actions/pnpm-install-retry

    - name: Download shared build artifact
      uses: actions/download-artifact@v4
      with:
        name: shared-build
        path: packages/shared/dist/

    - name: Run web app tests (shard ${{ matrix.shard }}/2)
      run: pnpm --filter @repo/web exec vitest run --shard=${{ matrix.shard }}/2
```

> **注意**: シャード数（2/3/4）は Phase 1 の計測結果と Phase 2 の設計判断により確定する。
> 上記の `2` はプレースホルダーであり、実際の値は選択した対応案に従うこと。

#### 3-2. test-desktop シャード数削減（必要な場合）

**修正対象**: `.github/workflows/ci.yml` の `test-desktop` ジョブの `shard:` 行と実行コマンド

**現状（17 シャード）**:

```yaml
shard: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17]
```

**案 A（15 シャード）への変更**:

```yaml
# CI Optimization (TASK-CI-FUTURE-002):
# test-web シャード化のため 17→15 に削減（-2シャード）
# test-web(2) + test-desktop(15) + typecheck(1) + test-shared(1) + e2e-desktop(1) = 20
shard: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]
```

> 実行コマンド（`vitest run --shard=${{ matrix.shard }}/17`）の `/17` も削減後の値（`/15` 等）に更新が必要。

#### 3-3. build ジョブの needs 更新

`test-web` を `build` ジョブの `needs` に追加する必要があるか確認する。

```bash
# build ジョブの needs を確認
grep -A 15 "^  build:" .github/workflows/ci.yml | grep "needs"
```

`test-web` が `build` ジョブの `needs` に含まれていない場合は追加する。

### ステップ4: apps/web/vitest.config.ts 修正要否の判断

Phase 1 の `vitest-config-review.md` の確認結果を基に判断する。

**修正不要のケース**（多くの場合こちらに該当）:

- `pool` や `poolOptions` の設定がなく、デフォルト動作でシャードが機能する場合
- `--shard` オプションは CLI から渡されるため、`vitest.config.ts` の変更なしで動作する

**修正が必要なケース**:

- `poolOptions.threads.singleThread: true` 等、シャード分割と競合する設定がある場合
- `isolate: false` でグローバル状態が共有されており、シャード間で干渉が発生する場合

**修正設計（競合がある場合の例）**:

```typescript
// apps/web/vitest.config.ts
export default defineConfig({
  test: {
    // シャード化と競合する設定を確認・調整
    // pool: 'threads',  // デフォルト（変更不要）
    // poolOptions の singleThread 等は削除または false に設定
  },
});
```

### ステップ5: 検証コマンド設計

Phase 4（ローカル動作検証）で使用する検証コマンドを設計する。

```bash
# 1. test-web の全シャードをローカルで実行（シャード数が 2 の場合）
pnpm --filter @repo/web exec vitest run --shard=1/2
pnpm --filter @repo/web exec vitest run --shard=2/2

# 2. 全シャードのテスト件数合計が単一実行時と一致することを確認
pnpm --filter @repo/web exec vitest run --reporter=verbose 2>&1 | tail -5
pnpm --filter @repo/web exec vitest run --shard=1/2 --reporter=verbose 2>&1 | tail -5
pnpm --filter @repo/web exec vitest run --shard=2/2 --reporter=verbose 2>&1 | tail -5

# 3. test-desktop のシャード削減後の実行時間確認（案Aで15シャードの場合）
time pnpm --filter @repo/desktop exec vitest run --shard=1/15
time pnpm --filter @repo/desktop exec vitest run --shard=15/15

# 4. ci.yml の変更後の並列数合計を確認
grep -E "shard: \[" .github/workflows/ci.yml
```

---

## 設計判断記録

| 決定事項                    | 選択                   | 理由                                                               |
| --------------------------- | ---------------------- | ------------------------------------------------------------------ |
| シャード追加方式            | matrix strategy        | `test-desktop` で実績あり。Vitest の `--shard` オプションと連動    |
| fail-fast 設定              | false                  | 一部シャード失敗時も全シャードを完走させ問題の全体像を把握するため |
| timeout-minutes             | 15                     | `test-desktop` と同値。Phase 4 の計測結果で見直す                  |
| test-desktop シャード数削減 | Phase 1 計測結果に依存 | 計測なしに削減量を断言することはできないため Phase 1 結果を待つ    |
| vitest.config.ts 修正方針   | 原則不要（確認後判断） | CLI の `--shard` オプションは設定ファイル不要で機能するため        |

---

## 統合テスト連携

- シャード数設計の根拠（計算式・対応案比較テーブル）を Phase 3 設計レビューに提供
- `test-desktop` シャード数削減の影響評価テーブルを Phase 3 で検証
- 検証コマンド設計を Phase 4（ローカル動作検証）の手順書として引き継ぐ

---

## 多角的チェック観点（AIが判断）

### 並列上限制約の厳密性

- GitHub Free Tier の 20 並列制限は「同時実行中のジョブ数」に基づく
- `strategy: matrix` で展開される各シャードは独立したジョブとしてカウントされる
- `needs` による依存関係で待機中のジョブは並列数にカウントされない
- したがって `test-desktop(N) + test-web(M) + typecheck(1) + test-shared(1) + e2e-desktop(1) <= 20` が制約

### simpler alternative の検討

| 代替案                                                    | 検討結果                                                   |
| --------------------------------------------------------- | ---------------------------------------------------------- |
| `test-web` を `test-desktop` と同じシャード数（17）にする | NG: 並列上限を超過する                                     |
| `test-web` シャード化をやめてタイムアウトのみ延長する     | NG: 将来的なスケーラビリティが確保できず根本解決にならない |
| `test-desktop` を完全廃止して `test-web` に統合する       | NG: スコープ外・リスクが高すぎる                           |

### 後方互換性

- `test-desktop` のシャード数削減は既存テストの実行結果に影響しない（分割方法の変更のみ）
- `--shard=N/M` オプションは Vitest のコアオプションであり、`vitest.config.ts` の修正は原則不要

---

## サブタスク管理

| ID     | タスク名                                | ステータス |
| ------ | --------------------------------------- | ---------- |
| T-02-1 | シャード数計算と対応案選択              | 未実施     |
| T-02-2 | test-desktop 削減影響評価               | 未実施     |
| T-02-3 | ci.yml 修正設計（test-web matrix 追加） | 未実施     |
| T-02-4 | vitest.config.ts 修正要否判断           | 未実施     |
| T-02-5 | 検証コマンド設計                        | 未実施     |

---

## 成果物

| 成果物                            | 配置先                                      | 形式     |
| --------------------------------- | ------------------------------------------- | -------- |
| シャード数設計書                  | `outputs/phase-2/shard-count-design.md`     | Markdown |
| test-desktop 削減影響評価テーブル | `outputs/phase-2/desktop-shard-impact.md`   | Markdown |
| ci.yml 修正差分イメージ           | `outputs/phase-2/ci-yml-diff-preview.md`    | Markdown |
| vitest.config.ts 修正要否判断結果 | `outputs/phase-2/vitest-config-decision.md` | Markdown |

---

## 完了条件

- [ ] `test-web` シャード数（2〜4）が計算式に基づいて決定されていること
- [ ] 対応案（A/B/C）のいずれかが選択され、選択理由が文書化されていること
- [ ] `test-desktop` シャード数削減による実行時間への影響が評価済みであること
- [ ] `ci.yml` の修正内容（`test-web` matrix 追加・`test-desktop` シャード数修正）が設計済みであること
- [ ] `vitest.config.ts` の修正要否が判断され、修正が必要な場合は設計済みであること
- [ ] 検証コマンドが `outputs/phase-2/shard-count-design.md` に記録されていること
- [ ] `outputs/phase-2/` に全成果物が生成されていること

---

## タスク100%実行確認【必須】

- [ ] T-02-1: シャード数計算と対応案選択を `outputs/phase-2/shard-count-design.md` に記録済み
- [ ] T-02-2: `test-desktop` 削減影響評価を `outputs/phase-2/desktop-shard-impact.md` に記録済み
- [ ] T-02-3: `ci.yml` 修正差分イメージを `outputs/phase-2/ci-yml-diff-preview.md` に記録済み
- [ ] T-02-4: `vitest.config.ts` 修正要否判断を `outputs/phase-2/vitest-config-decision.md` に記録済み
- [ ] T-02-5: 検証コマンドが設計書内に記録済み

---

## 次Phase

**Phase 3: 設計レビュー** — Phase 2 で確定した設計の整合性・並列上限遵守・リスクを多角的にレビューし、
PASS / MINOR / MAJOR を判定して Phase 4（実装）への進行可否を決定する。

**ゲート条件**: Phase 1-2 の全完了条件を満たさない場合、Phase 3 へ進まないこと。
