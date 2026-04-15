# Phase 5: 実装

## メタ情報

| 項目       | 値                                    |
| ---------- | ------------------------------------- |
| Phase      | 5                                     |
| タスクID   | TASK-CI-FUTURE-002                    |
| 機能名     | test-web シャード化                   |
| 前提Phase  | Phase 4（テスト作成）完了後に着手可能 |
| 後続Phase  | Phase 6                               |
| 作成日     | 2026-04-15                            |
| ステータス | pending                               |

**Phase 5 開始条件**: Phase 4 の全完了条件を満たし、全テストケース（TC-01〜TC-05）が RED 状態であることが `outputs/phase-4/red-confirmation.md` に記録済みであること。

---

## 目的

最小変更で RED テストを GREEN に変える実装を行う。
`.github/workflows/ci.yml` に `test-web` シャードジョブを追加し、
`test-desktop` のシャード数を 17 から 15 に削減して、GitHub Free Tier 並列上限 20 を維持する。

---

## 背景

- 現行の並列数: test-desktop(17) + typecheck(1) + test-shared(1) + e2e-desktop(1) = 20（上限）
- 目標の並列数: test-desktop(15) + test-web(2) + typecheck(1) + test-shared(1) + e2e-desktop(1) = 20（上限維持）
- `apps/web/vitest.config.ts` のシャード対応を確認・設定する

---

## SubAgentチーム編成

| SubAgent   | 関心ごと   | 主担当                           |
| ---------- | ---------- | -------------------------------- |
| SubAgent-A | CI設定責務 | ci.yml の matrix・job 設定       |
| SubAgent-B | vitest設定 | apps/web/vitest.config.ts の確認 |
| SubAgent-C | 並列数管理 | test-desktop シャード数削減      |
| SubAgent-D | 統合監査   | 矛盾・漏れ・整合・依存判定       |

---

## 実行タスク

- **タスク1**: `apps/web/vitest.config.ts` の確認・シャード対応の設定追加（必要な場合）
- **タスク2**: `.github/workflows/ci.yml` に `test-web` ジョブ追加（matrix shard 設定）
- **タスク3**: `.github/workflows/ci.yml` の `test-desktop` シャード数を 17 から 15 に削減
- **タスク4**: 全変更の最終確認（YAML構文チェック・並列数計算）

---

## 参照資料

| 参照資料            | パス                                  | 説明             |
| ------------------- | ------------------------------------- | ---------------- |
| テストマトリクス    | `outputs/phase-4/test-matrix.md`      | Phase 4 成果物   |
| RED 確認結果        | `outputs/phase-4/red-confirmation.md` | Phase 4 成果物   |
| CI ワークフロー     | `.github/workflows/ci.yml`            | 修正対象ファイル |
| vitest 設定（web）  | `apps/web/vitest.config.ts`           | 確認・修正対象   |
| desktop vitest 設定 | `apps/desktop/vitest.config.ts`       | 参照元           |

---

## 実装対象ファイル一覧

| ファイル                    | 変更種別  | 変更内容                                               |
| --------------------------- | --------- | ------------------------------------------------------ |
| `.github/workflows/ci.yml`  | 修正      | test-web ジョブ追加・test-desktop シャード数削減       |
| `apps/web/vitest.config.ts` | 確認/修正 | シャード実行対応を確認し、差分が必要な場合のみ設定追加 |

---

## 変更サマリー

| 対象                      | Before                           | After                            | 理由                                     |
| ------------------------- | -------------------------------- | -------------------------------- | ---------------------------------------- |
| test-desktop シャード数   | 17                               | 15                               | test-web 追加による並列数調整            |
| test-web ジョブ           | 存在しない                       | shard: [1, 2] で追加             | web アプリのテストをシャード化して高速化 |
| 並列数合計                | 17+1+1+1=20                      | 15+2+1+1+1=20                    | GitHub Free Tier 上限 20 を維持          |
| vitest コマンド (desktop) | `--shard=${{ matrix.shard }}/17` | `--shard=${{ matrix.shard }}/15` | シャード数変更に合わせてコマンド更新     |
| vitest コマンド (web)     | なし                             | `--shard=${{ matrix.shard }}/2`  | 新規追加                                 |

---

## 実行手順

### ステップ0: 実装前の既存設定確認【必須】

```bash
# 現行の test-desktop シャード数確認
grep -n "shard:\|/17" .github/workflows/ci.yml | head -10

# test-web ジョブの有無確認
grep -n "test-web:" .github/workflows/ci.yml || echo "test-web: not found (expected)"

# apps/web の vitest 設定確認
cat apps/web/vitest.config.ts 2>/dev/null || echo "vitest.config.ts: not found"

# apps/web のパッケージ名確認
grep '"name"' apps/web/package.json 2>/dev/null | head -1
```

### ステップ1: `apps/web/vitest.config.ts` の確認・設定

vitest はデフォルトで `--shard` オプションをサポートする。
`apps/web/vitest.config.ts` が存在する場合は既存設定を確認し、
シャード実行に支障がないことを確認する。

```bash
# vitest.config.ts が存在するか確認
ls apps/web/vitest.config.ts 2>/dev/null && echo "exists" || echo "not found"

# package.json の test スクリプト確認
grep '"test"' apps/web/package.json
```

**vitest.config.ts が存在する場合の確認観点**:

- `shard` オプションと競合する設定がないか
- `pool` や `fileParallelism` の設定が sharding と相性が良いか

**vitest.config.ts が存在しない場合**:

- vitest のデフォルト設定でシャードが動作するため、追加設定は不要

### ステップ2: `test-desktop` シャード数を 17→15 に変更

`.github/workflows/ci.yml` の `test-desktop` ジョブの matrix 定義を変更する。

```yaml
# 変更前
    strategy:
      matrix:
        # GitHub Free Tier 並列上限20に対して: test-desktop×17+typecheck×1+test-shared×1+e2e-desktop×1=20
        shard: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17]

# 変更後
    strategy:
      matrix:
        # TASK-CI-FUTURE-002: test-web シャード化のため15に削減
        # 並列数: test-desktop×15+test-web×2+typecheck×1+test-shared×1+e2e-desktop×1=20
        shard: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]
```

vitest の実行コマンドのシャード指定も変更する。

```yaml
# 変更前
        run: pnpm --filter @repo/desktop exec vitest run --shard=${{ matrix.shard }}/17

# 変更後
        run: pnpm --filter @repo/desktop exec vitest run --shard=${{ matrix.shard }}/15
```

**実装後の確認**:

```bash
# シャード数が 15 になっていることを確認
grep -n "shard\|/15\|/17" .github/workflows/ci.yml | head -10
```

### ステップ3: `test-web` ジョブを `ci.yml` に追加

`test-desktop` ジョブの直後に `test-web` ジョブを追加する。
`test-desktop` の構成を参考にしながら、`@repo/web` に合わせた設定を行う。

```yaml
test-web:
  name: Test (web - shard ${{ matrix.shard }}/2)
  runs-on: ubuntu-latest
  needs: [build-shared]
  timeout-minutes: 10
  strategy:
    fail-fast: false
    matrix:
      # TASK-CI-FUTURE-002: test-web シャード化（2シャード）
      # 並列数: test-desktop×15+test-web×2+typecheck×1+test-shared×1+e2e-desktop×1=20
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
      run: pnpm --filter @repo/web test -- --shard=${{ matrix.shard }}/2
```

**実装後の確認**:

```bash
# test-web ジョブが追加されていることを確認
grep -n "test-web:" .github/workflows/ci.yml

# matrix の shard 設定確認
grep -A5 "test-web:" .github/workflows/ci.yml | grep "shard"
```

### ステップ4: 全変更の最終確認

```bash
# 変更ファイルの diff 確認
git diff .github/workflows/ci.yml

# YAML 構文チェック
python3 -c "
import yaml
with open('.github/workflows/ci.yml', 'r') as f:
    data = yaml.safe_load(f)
print('YAML syntax: OK')
"

# 並列数計算の確認
echo "並列数計算:"
echo "  test-desktop: 15 シャード"
echo "  test-web:      2 シャード"
echo "  typecheck:     1"
echo "  test-shared:   1"
echo "  e2e-desktop:   1"
echo "  合計:         20 (上限: 20)"

# ローカルシャード実行テスト（TC-01: shard=1/2）
pnpm --filter @repo/web test -- --shard=1/2
echo "TC-01 (shard=1/2) exit code: $?"

# ローカルシャード実行テスト（TC-01: shard=2/2）
pnpm --filter @repo/web test -- --shard=2/2
echo "TC-01 (shard=2/2) exit code: $?"
```

---

## 注意事項

### test-desktop シャード削減の影響

- 17 シャードから 15 シャードへの削減により、1 シャードあたりのテスト数が若干増加する
- `apps/desktop` には 399 テストファイルあるため、15 シャードで約 26〜27 ファイル/シャードとなる
- テスト実行時間が大きく増加しないことを Phase 6 で確認する

### vitest のシャード動作原理

- `--shard=M/N` はテストファイルをハッシュで N 分割し、M 番目のグループを実行する
- テストの実行順序はシャード間で独立しており、相互依存しないことが前提
- グローバル状態を持つテスト（`beforeAll` でのサービス初期化等）は各シャードで独立して動作する

### 並列数上限の維持

- GitHub Free Tier の並列上限 20 を超えないこと
- 将来的にジョブを追加する場合は必ず並列数計算を更新すること

---

## 統合テスト連携

- 実装後に Phase 4 の TC-01〜TC-05 を順次確認する
- ローカル実行（TC-01・TC-02）は実装後すぐに確認可能
- CI 実行（TC-03・TC-05）は PR を作成して GitHub Actions で確認する
- 並列数計算（TC-04）は `ci.yml` の設定から直接確認可能
- 統合ログは `outputs/phase-5/` に保存する

---

## 多角的チェック観点

| 観点     | 確認内容                                                              |
| -------- | --------------------------------------------------------------------- |
| 矛盾     | test-desktop の削減量と test-web の追加量が並列数上限と整合しているか |
| 漏れ     | vitest.config.ts の確認・test-web ジョブの全ステップが揃っているか    |
| 整合性   | ローカル実行コマンドと CI 設定のシャード数が一致しているか            |
| 依存関係 | `needs: [build-shared]` の依存が正しく設定されているか                |

---

## サブタスク管理

| ID     | タスク名                                                 | ステータス |
| ------ | -------------------------------------------------------- | ---------- |
| T-05-1 | 実装前の既存設定確認                                     | 未実施     |
| T-05-2 | `apps/web/vitest.config.ts` の確認・設定                 | 未実施     |
| T-05-3 | `test-desktop` シャード数 17→15 変更                     | 未実施     |
| T-05-4 | `test-web` ジョブを `ci.yml` に追加                      | 未実施     |
| T-05-5 | 全変更の最終確認（diff・YAML構文・ローカルシャード実行） | 未実施     |

---

## 成果物

| 成果物                   | 配置先                                     | 形式       |
| ------------------------ | ------------------------------------------ | ---------- |
| 修正済み CI ワークフロー | `.github/workflows/ci.yml`                 | YAML       |
| vitest 設定（確認済み）  | `apps/web/vitest.config.ts`                | TypeScript |
| 実装結果サマリー         | `outputs/phase-5/implementation-result.md` | Markdown   |
| GREEN 確認結果           | `outputs/phase-5/green-confirmation.md`    | Markdown   |

---

## 完了条件

- [ ] `apps/web/vitest.config.ts` のシャード対応が確認されていること
- [ ] `test-desktop` の matrix が `shard: [1, ..., 15]` になっていること
- [ ] `test-desktop` の vitest コマンドが `--shard=${{ matrix.shard }}/15` になっていること
- [ ] `test-web` ジョブが `ci.yml` に追加され、`shard: [1, 2]` の matrix が設定されていること
- [ ] `test-web` の vitest コマンドが `--shard=${{ matrix.shard }}/2` になっていること
- [ ] 並列数合計が 20（15+2+1+1+1）であることが確認されていること
- [ ] YAML 構文チェックが PASS していること
- [ ] TC-01: ローカルシャード実行（shard=1/2, shard=2/2）が EXIT 0 で終了すること
- [ ] `outputs/phase-5/` に全成果物が生成されていること
- [ ] 矛盾がないことを確認
- [ ] 漏れがないことを確認
- [ ] 整合性が取れていることを確認
- [ ] 依存関係が取れていることを確認
- [ ] 本 Phase 内の全タスクを 100% 実行完了

---

## タスク100%実行確認【必須】

- [ ] T-05-1: 実装前確認（現行設定の grep）を実行済み
- [ ] T-05-2: `apps/web/vitest.config.ts` の確認・設定が完了済み
- [ ] T-05-3: `test-desktop` シャード数 17→15 変更完了
- [ ] T-05-4: `test-web` ジョブを `ci.yml` に追加完了
- [ ] T-05-5: 全変更の diff 確認・YAML 構文チェック PASS・ローカルシャード実行 EXIT 0 を `outputs/phase-5/implementation-result.md` に記録済み

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/task-ci-future-002-test-web-sharding
```

---

## 次Phase

**Phase 6: テスト拡充** — 失敗パス・回帰ガード・並列数オーバーフロー防止の追加確認を行う。

**Phase 6 開始条件**: Phase 5 の全完了条件を満たし、ローカルシャード実行が EXIT 0 で完了していること（`outputs/phase-5/green-confirmation.md` に記録済み）。
