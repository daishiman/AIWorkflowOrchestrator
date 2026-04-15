# Phase 6: テスト拡充

## メタ情報

| 項目       | 値                              |
| ---------- | ------------------------------- |
| Phase      | 6                               |
| タスクID   | TASK-CI-FUTURE-002              |
| 機能名     | test-web シャード化             |
| 前提Phase  | Phase 5（実装）完了後に着手可能 |
| 後続Phase  | Phase 7                         |
| 作成日     | 2026-04-15                      |
| ステータス | pending                         |

**Phase 6 開始条件**: Phase 5 の全完了条件を満たし、ローカルシャード実行が EXIT 0 で完了していること（`outputs/phase-5/green-confirmation.md` に記録済み）。

---

## 目的

Phase 5 の実装後に、失敗パス・回帰ガード・並列数オーバーフロー防止の観点でテストを拡充する。
正常系（TC-01〜TC-05）だけでなく、境界条件・異常系・順序依存性を網羅し、
シャード化による潜在的な問題を早期に検出できる体制を整える。

---

## 背景

- test-web シャード化は test-desktop のシャード数削減（17→15）を伴う複合変更
- シャード化により「テスト順序依存性」「並列数オーバーフロー」「回帰リスク」が新たに生じる可能性がある
- これらの失敗パスを事前に定義・検証することで、将来の問題発生時に素早く対処できる

---

## SubAgentチーム編成

| SubAgent   | 関心ごと     | 主担当                           |
| ---------- | ------------ | -------------------------------- |
| SubAgent-A | 失敗パス設計 | テスト順序依存性・シャード間干渉 |
| SubAgent-B | 回帰ガード   | test-desktop 削減後の時間確認    |
| SubAgent-C | 並列数管理   | オーバーフロー防止テスト         |
| SubAgent-D | 統合監査     | 矛盾・漏れ・整合・依存判定       |

---

## 実行タスク

- **タスク1**: 失敗パスのテストケース追加（テスト順序依存性確認）
- **タスク2**: 回帰ガードの設定（test-desktop シャード削減後の時間確認）
- **タスク3**: 並列数オーバーフロー防止テスト
- **タスク4**: エラーケースの網羅（全確認結果の記録）

---

## 参照資料

| 参照資料           | パス                                       | 説明             |
| ------------------ | ------------------------------------------ | ---------------- |
| テストマトリクス   | `outputs/phase-4/test-matrix.md`           | Phase 4 成果物   |
| RED 確認結果       | `outputs/phase-4/red-confirmation.md`      | Phase 4 成果物   |
| 実装結果サマリー   | `outputs/phase-5/implementation-result.md` | Phase 5 成果物   |
| GREEN 確認結果     | `outputs/phase-5/green-confirmation.md`    | Phase 5 成果物   |
| CI ワークフロー    | `.github/workflows/ci.yml`                 | 実装済みファイル |
| vitest 設定（web） | `apps/web/vitest.config.ts`                | 確認対象         |

---

## 実行手順

### ステップ0: Phase 6 事前確認【必須】

```bash
# Phase 5 が完了していることを確認
ls outputs/phase-5/green-confirmation.md

# 現行の ci.yml で test-web・test-desktop の設定を確認
grep -A12 "test-web:\|test-desktop:" .github/workflows/ci.yml | grep "shard"

# 並列数の最終確認
echo "並列数確認:"
DESKTOP=$(grep -A12 "test-desktop:" .github/workflows/ci.yml | grep "shard:" | grep -o '\[.*\]' | tr ',' '\n' | wc -l | tr -d ' ')
WEB=$(grep -A12 "test-web:" .github/workflows/ci.yml | grep "shard:" | grep -o '\[.*\]' | tr ',' '\n' | wc -l | tr -d ' ')
echo "  test-desktop: ${DESKTOP} シャード"
echo "  test-web:     ${WEB} シャード"
echo "  その他:       3 (typecheck + test-shared + e2e-desktop)"
echo "  合計:         $((DESKTOP + WEB + 3))"
```

### ステップ1: 失敗パスのテストケース追加（テスト順序依存性確認）

シャード化によりテストが複数プロセスに分割されるため、テスト間の順序依存性を確認する。

**確認観点**:

| 観点                            | 検証方法                                                           | 期待動作                         |
| ------------------------------- | ------------------------------------------------------------------ | -------------------------------- |
| シャード 1 のみで完結するテスト | `--shard=1/2` 単独で全 assert が通る                               | shard=2/2 なしで EXIT 0          |
| シャード 2 のみで完結するテスト | `--shard=2/2` 単独で全 assert が通る                               | shard=1/2 なしで EXIT 0          |
| グローバル状態の漏れ出し確認    | 同一シャードを 2 回連続実行して結果が同一                          | 2 回とも同じ件数・同じ結果       |
| テストファイル間の import 汚染  | `beforeAll`・`afterAll` のクリーンアップが各シャードで独立して動作 | シャード順序を逆にしても同じ結果 |

**検証コマンド**:

```bash
# シャード 1 単独実行（2 回連続で同じ結果か確認）
pnpm --filter @repo/web test -- --shard=1/2 --reporter=json 2>/dev/null \
  | python3 -c "import sys, json; d=json.load(sys.stdin); print(f'shard=1/2 run1: {d[\"numPassedTests\"]} passed')"

pnpm --filter @repo/web test -- --shard=1/2 --reporter=json 2>/dev/null \
  | python3 -c "import sys, json; d=json.load(sys.stdin); print(f'shard=1/2 run2: {d[\"numPassedTests\"]} passed')"

# シャード 2 単独実行
pnpm --filter @repo/web test -- --shard=2/2 --reporter=json 2>/dev/null \
  | python3 -c "import sys, json; d=json.load(sys.stdin); print(f'shard=2/2: {d[\"numPassedTests\"]} passed')"

# 件数合計の確認（TC-02 の詳細検証）
SHARD1=$(pnpm --filter @repo/web test -- --shard=1/2 --reporter=json 2>/dev/null \
  | python3 -c "import sys, json; d=json.load(sys.stdin); print(d['numTotalTests'])")
SHARD2=$(pnpm --filter @repo/web test -- --shard=2/2 --reporter=json 2>/dev/null \
  | python3 -c "import sys, json; d=json.load(sys.stdin); print(d['numTotalTests'])")
TOTAL=$(pnpm --filter @repo/web test -- --reporter=json 2>/dev/null \
  | python3 -c "import sys, json; d=json.load(sys.stdin); print(d['numTotalTests'])")
echo "shard1=${SHARD1}, shard2=${SHARD2}, sum=$((SHARD1+SHARD2)), total=${TOTAL}"
[ "$((SHARD1+SHARD2))" = "${TOTAL}" ] && echo "TC-02: PASS" || echo "TC-02: FAIL (件数不一致)"
```

### ステップ2: 回帰ガードの設定（test-desktop シャード削減後の時間確認）

test-desktop のシャード数を 17 から 15 に削減したことで、1 シャードあたりの実行時間が増加する可能性がある。

**確認観点**:

| 観点                                       | 検証方法                                       | 判断基準                              |
| ------------------------------------------ | ---------------------------------------------- | ------------------------------------- |
| test-desktop 1 シャードの実行時間          | CI ログから最長シャードの実行時間を確認        | タイムアウト 15 分以内に完了すること  |
| test-desktop 全 15 シャードの完了状況      | GitHub Actions の jobs 結果で全 SUCCESS を確認 | 15 シャード全て `conclusion: success` |
| test-desktop のカバレッジ収集（main push） | main ブランチの CI でカバレッジジョブが PASS   | coverage ジョブが success             |

**検証コマンド**:

```bash
# CI 実行後に test-desktop 全シャードの結果確認
LATEST_RUN=$(gh run list --workflow=ci.yml --limit 1 --json databaseId --jq '.[0].databaseId')
echo "Latest run: ${LATEST_RUN}"

# test-desktop 全 15 シャードの結果確認
gh run view ${LATEST_RUN} --json jobs \
  --jq '.jobs[] | select(.name | startswith("Test (desktop)")) | {name: .name, conclusion: .conclusion}'

# 失敗シャード数の確認（0 であること）
FAILED=$(gh run view ${LATEST_RUN} --json jobs \
  --jq '[.jobs[] | select(.name | startswith("Test (desktop)")) | select(.conclusion != "success")] | length')
echo "Failed desktop shards: ${FAILED} (expected: 0)"

# test-desktop 最長シャードの実行時間確認
gh run view ${LATEST_RUN} --json jobs \
  --jq '[.jobs[] | select(.name | startswith("Test (desktop)")) |
    {name: .name, duration_sec: ((.completedAt | fromdateiso8601) - (.startedAt | fromdateiso8601))}] |
    max_by(.duration_sec)'
```

**回帰ガードの閾値**:

| メトリクス                        | 閾値      | アクション（閾値超過時）                |
| --------------------------------- | --------- | --------------------------------------- |
| test-desktop 最長シャード実行時間 | 13 分以内 | シャード数を 15→16 に戻すことを検討     |
| test-desktop 失敗シャード数       | 0         | Phase 5 に戻り設定を確認する            |
| test-web 最長シャード実行時間     | 8 分以内  | シャード数を 2→3 以上に増やすことを検討 |

### ステップ3: 並列数オーバーフロー防止テスト

GitHub Free Tier の並列上限 20 を超えないことを確認する防止策を定義する。

**確認観点**:

| 観点                                      | 検証方法                                                                                                          | 期待動作                         |
| ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| 現行の並列数が 20 以内であること          | ci.yml から全 matrix 設定を読み取り合計を計算                                                                     | 合計 ≤ 20                        |
| 将来の追加ジョブへの注意喚起              | ci.yml のコメントに並列数計算が明記されているか確認                                                               | コメントに計算式が記載されている |
| test-web 追加前後の並列数変化が正しいこと | 変更前（17+0+3=20: `test-desktop + test-web + typecheck + test-shared + e2e-desktop`）と変更後（15+2+3=20）の確認 | 両方とも 20                      |

**検証コマンド**:

```bash
# ci.yml から並列数を計算して上限チェック
python3 << 'EOF'
import yaml

with open('.github/workflows/ci.yml', 'r') as f:
    ci = yaml.safe_load(f)

jobs = ci.get('jobs', {})
total = 0
details = []

fanout_jobs = ["typecheck", "test-shared", "test-desktop", "test-web", "e2e-desktop"]

for job_name in fanout_jobs:
    job_config = jobs.get(job_name)
    if not job_config:
        continue
    strategy = job_config.get('strategy', {})
    matrix = strategy.get('matrix', {})
    shard = matrix.get('shard', [])
    count = len(shard) if shard else 1
    details.append(f"  {job_name}: {count}")
    total += count

print("並列数内訳（build-shared 完了後に同時実行されるテスト fan-out ジョブ）:")
for d in details:
    print(d)
print(f"合計: {total} (上限: 20)")
print("PASS" if total <= 20 else "FAIL: 上限超過!")
EOF

# コメントに並列数計算が明記されているか確認
grep -n "並列\|parallel\|Free Tier\|上限" .github/workflows/ci.yml | head -10
```

**オーバーフロー発生時のロールバック手順**:

1. test-web のシャード数を 2 から 1 に削減する（`shard: [1]` に変更）
2. test-desktop のシャード数を 15 から 16 に戻す
3. 上記変更で並列数が `test-desktop(16) + test-web(1) + typecheck(1) + test-shared(1) + e2e-desktop(1) = 20` に収まることを確認する

### ステップ4: エラーケースの網羅

シャード化で想定されるエラーケースを列挙し、各ケースの対処方針を確認する。

**エラーケース一覧**:

| エラーケース              | 発生条件                                               | 検出方法                                       | 対処方針                               |
| ------------------------- | ------------------------------------------------------ | ---------------------------------------------- | -------------------------------------- |
| シャード件数不一致        | shard 数の合計 ≠ 単一実行件数                          | TC-02 の件数チェック                           | vitest.config.ts の設定を確認する      |
| テスト順序依存による FAIL | シャード 1 の afterAll がシャード 2 で必要な状態を汚染 | 各シャード単独実行での比較                     | テストの beforeEach/afterEach を見直す |
| test-desktop タイムアウト | 15 シャードに分割した際の最長実行が 15 分超過          | CI ログの timeout-minutes 超過確認             | シャード数を 15→16 に戻すことを検討    |
| 並列数オーバーフロー      | 将来のジョブ追加で合計 20 超過                         | python3 による ci.yml 解析スクリプト           | コメントの並列数計算を更新し削減を検討 |
| YAML 構文エラー           | ci.yml の手動編集でインデントミス等                    | `python3 -c "import yaml; yaml.safe_load(..."` | diff を確認して修正する                |

```bash
# エラーケース検証: YAML 構文チェック（最終確認）
python3 -c "
import yaml
with open('.github/workflows/ci.yml', 'r') as f:
    yaml.safe_load(f)
print('YAML syntax: OK')
" && echo "エラーケース: YAML構文 PASS" || echo "エラーケース: YAML構文 FAIL"

# エラーケース検証: test-web の shard コマンドが正しい形式か確認
grep "shard=\${{ matrix.shard }}/2" .github/workflows/ci.yml \
  && echo "エラーケース: shard コマンド形式 PASS" \
  || echo "エラーケース: shard コマンド形式 FAIL"

# エラーケース検証: test-desktop の shard コマンドが正しく更新されているか確認
grep "shard=\${{ matrix.shard }}/15" .github/workflows/ci.yml \
  && echo "エラーケース: test-desktop シャード数 PASS" \
  || echo "エラーケース: test-desktop シャード数 FAIL (旧設定 /17 が残っている可能性)"
```

---

## 統合テスト連携

- ステップ1〜4 の確認結果を `outputs/phase-6/edge-case-verification.md` にまとめる
- 回帰ガード（ステップ2）で閾値を超えた場合は Phase 5 に戻り設定を見直す
- 並列数オーバーフロー（ステップ3）が検出された場合はロールバック手順に従う
- Phase 7 での受け入れ基準照合前に、全エラーケースが PASS であることを確認する
- 統合ログは `outputs/phase-6/` に保存する

---

## 多角的チェック観点

| 観点     | 確認内容                                                                     |
| -------- | ---------------------------------------------------------------------------- |
| 矛盾     | 失敗パスの期待動作と正常系 TC の期待動作が矛盾していないか確認する           |
| 漏れ     | シャード化に関する全リスク（順序依存・タイムアウト・上限）が網羅されているか |
| 整合性   | ローカル実行の検証結果と CI 実行の検証結果が整合しているか確認する           |
| 依存関係 | Phase 5 の GREEN 確認結果に基づいて拡充テストが実施されているか確認する      |

---

## サブタスク管理

| ID     | タスク名                                           | ステータス |
| ------ | -------------------------------------------------- | ---------- |
| T-06-1 | 失敗パスのテストケース追加（テスト順序依存性確認） | 未実施     |
| T-06-2 | 回帰ガードの設定（test-desktop 削減後の時間確認）  | 未実施     |
| T-06-3 | 並列数オーバーフロー防止テスト                     | 未実施     |
| T-06-4 | エラーケースの網羅（全確認結果の記録）             | 未実施     |

---

## 成果物

| 成果物               | 配置先                                      | 形式     |
| -------------------- | ------------------------------------------- | -------- |
| エッジケース検証結果 | `outputs/phase-6/edge-case-verification.md` | Markdown |

---

## 完了条件

- [ ] テスト順序依存性確認が実施され、各シャードが独立して EXIT 0 で完了していること
- [ ] TC-02 の件数合計が単一実行と一致することが確認されていること
- [ ] test-desktop 全 15 シャードが CI で success になっていること
- [ ] test-desktop の最長シャードが 13 分以内で完了していること
- [ ] 並列数合計が 20 以内であることが python3 スクリプトで確認されていること
- [ ] ci.yml のコメントに並列数計算が明記されていること
- [ ] 全エラーケース（5 種類）の確認結果が `outputs/phase-6/edge-case-verification.md` に記録されていること
- [ ] 矛盾がないことを確認
- [ ] 漏れがないことを確認
- [ ] 整合性が取れていることを確認
- [ ] 依存関係が取れていることを確認
- [ ] 本 Phase 内の全タスクを 100% 実行完了

---

## タスク100%実行確認【必須】

- [ ] T-06-1: 失敗パスのテストケース追加（テスト順序依存性）を実行し結果を記録済み
- [ ] T-06-2: 回帰ガードの設定（test-desktop 削減後の CI 時間確認）を実行し結果を記録済み
- [ ] T-06-3: 並列数オーバーフロー防止テストを実行し結果を記録済み
- [ ] T-06-4: 全エラーケース（5 種類）の確認結果を `outputs/phase-6/edge-case-verification.md` に記録済み

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/task-ci-future-002-test-web-sharding
```

---

## 次Phase

**Phase 7: カバレッジ確認** — テストケースと受け入れ基準の対応確認・シャード設定の完全性確認・並列数計算カバレッジの可視化を行う。

**Phase 7 開始条件**: Phase 6 の全完了条件を満たし、全エラーケースが PASS であること（`outputs/phase-6/edge-case-verification.md` に記録済み）。
**未達時**: 回帰ガードで閾値超過の場合は Phase 5 に戻り設定を見直す。並列数オーバーフローの場合はロールバック手順に従う。
