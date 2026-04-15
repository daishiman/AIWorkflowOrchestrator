# Phase 7: カバレッジ確認

## メタ情報

| 項目       | 値                                    |
| ---------- | ------------------------------------- |
| Phase      | 7                                     |
| タスクID   | TASK-CI-FUTURE-002                    |
| 機能名     | test-web シャード化                   |
| 前提Phase  | Phase 6（テスト拡充）完了後に着手可能 |
| 後続Phase  | Phase 8                               |
| 作成日     | 2026-04-15                            |
| ステータス | pending                               |

**Phase 7 開始条件**: Phase 6 の全完了条件を満たし、全エラーケースが PASS であること（`outputs/phase-6/edge-case-verification.md` に記録済み）。

---

## 目的

テストケース（TC-01〜TC-05）と受け入れ基準（AC）の対応を確認し、
シャード設定の完全性・並列数計算カバレッジを定量的に可視化する。
未カバーシナリオを特定して補完計画を固定し、Phase 8 以降への移行可否を判定する。

---

## 背景

- Phase 4 で設計した TC-01〜TC-05 が全 AC をカバーしているか確認が必要
- test-web シャード化（2 シャード）と test-desktop 削減（17→15）の両変更について、
  それぞれに対応するテストが存在するかを照合する
- GitHub Free Tier 並列上限 20 に関する計算が全パターンで検証されているかを確認する

---

## SubAgentチーム編成

| SubAgent   | 関心ごと         | 主担当                               |
| ---------- | ---------------- | ------------------------------------ |
| SubAgent-A | AC照合           | テストケースと受け入れ基準の対応確認 |
| SubAgent-B | 設定完全性       | シャード設定の完全性確認             |
| SubAgent-C | 並列数カバレッジ | 並列数計算カバレッジの可視化         |
| SubAgent-D | 統合監査         | 未カバーシナリオの特定・補完計画     |

---

## 実行タスク

- **タスク1**: テストケースと受け入れ基準の対応確認（トレーサビリティマトリクス作成）
- **タスク2**: シャード設定の完全性確認（ci.yml・vitest.config.ts の網羅確認）
- **タスク3**: 並列数計算カバレッジの可視化
- **タスク4**: 未カバーシナリオの特定と補完計画の確定

---

## 参照資料

| 参照資料             | パス                                        | 説明             |
| -------------------- | ------------------------------------------- | ---------------- |
| テストマトリクス     | `outputs/phase-4/test-matrix.md`            | Phase 4 成果物   |
| RED 確認結果         | `outputs/phase-4/red-confirmation.md`       | Phase 4 成果物   |
| 実装結果サマリー     | `outputs/phase-5/implementation-result.md`  | Phase 5 成果物   |
| GREEN 確認結果       | `outputs/phase-5/green-confirmation.md`     | Phase 5 成果物   |
| エッジケース検証結果 | `outputs/phase-6/edge-case-verification.md` | Phase 6 成果物   |
| 受け入れ基準         | `outputs/phase-1/acceptance-criteria.md`    | Phase 1 成果物   |
| CI ワークフロー      | `.github/workflows/ci.yml`                  | 実装済みファイル |

---

## 実行手順

### ステップ0: Phase 7 事前確認【必須】

```bash
# Phase 6 が完了していることを確認
ls outputs/phase-6/edge-case-verification.md

# 現行の ci.yml でシャード設定を最終確認
grep -n "shard:" .github/workflows/ci.yml

# テストケース一覧の確認
ls outputs/phase-4/test-matrix.md && cat outputs/phase-4/test-matrix.md
```

### ステップ1: テストケースと受け入れ基準の対応確認

Phase 4 で設計した TC-01〜TC-05 が全受け入れ基準（AC）をカバーしているかを照合する。

**トレーサビリティマトリクス**:

| テストケース | 内容                                        | 対応する受け入れ基準 (AC)                                 | Phase 4 RED | Phase 5 GREEN | Phase 6 拡充 |
| ------------ | ------------------------------------------- | --------------------------------------------------------- | ----------- | ------------- | ------------ |
| TC-01        | シャード 1/N で EXIT 0 終了                 | test-web が N 並列でシャード実行できること                | 記録済み    | 確認済み      | 順序依存確認 |
| TC-02        | 全シャード合計件数が単一実行と一致          | シャード分割でテスト件数が失われないこと                  | 記録済み    | 確認済み      | 件数照合強化 |
| TC-03        | ci.yml に正しい matrix 設定が追加されている | CI で test-web ジョブが shard matrix 付きで定義されること | 記録済み    | 確認済み      | YAML検証     |
| TC-04        | 並列数合計が 20 以内に収まる                | GitHub Free Tier 並列上限 20 を超えないこと               | 記録済み    | 確認済み      | 計算検証強化 |
| TC-05        | CI で test-web が 2 並列で実行される        | GitHub Actions で test-web が 2 ジョブ起動すること        | 記録済み    | 確認済み      | CI ログ確認  |

**確認コマンド**:

```bash
# 受け入れ基準（AC）の一覧を確認
cat outputs/phase-1/acceptance-criteria.md 2>/dev/null || echo "AC document not found"

# TC と AC の対応を確認（トレーサビリティマトリクスの記録）
echo "=== トレーサビリティ確認 ==="
echo "TC-01 → AC: test-web シャード実行"
grep -c "shard=1/2\|shard=2/2" outputs/phase-5/green-confirmation.md 2>/dev/null \
  && echo "  GREEN 確認済み" || echo "  未確認"

echo "TC-02 → AC: テスト件数保全"
grep -c "件数一致\|numTotalTests\|sum=" outputs/phase-6/edge-case-verification.md 2>/dev/null \
  && echo "  検証済み" || echo "  未検証"

echo "TC-03 → AC: ci.yml matrix 設定"
grep -c "test-web:" .github/workflows/ci.yml \
  && echo "  設定確認済み" || echo "  設定なし"

echo "TC-04 → AC: 並列数上限"
grep -c "合計.*20\|20.*上限" outputs/phase-6/edge-case-verification.md 2>/dev/null \
  && echo "  計算済み" || echo "  未計算"

echo "TC-05 → AC: 2 並列起動"
grep -c "test-web.*1/2\|test-web.*2/2" outputs/phase-6/edge-case-verification.md 2>/dev/null \
  && echo "  CI ログ確認済み" || echo "  未確認"
```

### ステップ2: シャード設定の完全性確認

`ci.yml` と `apps/web/vitest.config.ts` のシャード設定が完全であることを確認する。

**確認観点**:

| 確認項目                                         | 確認方法                                               | 期待値                                      |
| ------------------------------------------------ | ------------------------------------------------------ | ------------------------------------------- |
| test-web ジョブの `strategy.matrix.shard` 定義   | `grep -A5 "test-web:" .github/workflows/ci.yml`        | `shard: [1, 2]` が存在する                  |
| test-web の vitest 実行コマンドのシャード指定    | `grep "shard=.*matrix.shard" .github/workflows/ci.yml` | `--shard=${{ matrix.shard }}/2` が存在する  |
| test-desktop のシャード数が 15 に更新されている  | `grep -A3 "test-desktop:" .github/workflows/ci.yml`    | `shard: [1, 2, ..., 15]` が存在する         |
| test-desktop のコマンドが `/15` に更新されている | `grep "shard=.*matrix.shard" .github/workflows/ci.yml` | `--shard=${{ matrix.shard }}/15` が存在する |
| `fail-fast: false` が設定されている              | `grep "fail-fast" .github/workflows/ci.yml`            | test-web と test-desktop の両方に存在する   |
| `needs: [build-shared]` の依存が正しい           | `grep -B1 "build-shared" .github/workflows/ci.yml`     | test-web が build-shared に依存している     |

**検証コマンド**:

```bash
echo "=== シャード設定の完全性確認 ==="

# test-web の matrix 設定
echo "--- test-web matrix ---"
grep -A10 "test-web:" .github/workflows/ci.yml | grep -E "shard:|fail-fast:|needs:"

# test-web の vitest コマンド
echo "--- test-web vitest コマンド ---"
grep -A30 "test-web:" .github/workflows/ci.yml | grep "shard="

# test-desktop の matrix 設定（15 シャードへの更新確認）
echo "--- test-desktop matrix ---"
grep -A5 "test-desktop:" .github/workflows/ci.yml | grep "shard:"

# test-desktop の vitest コマンド（/15 への更新確認）
echo "--- test-desktop vitest コマンド ---"
grep -A30 "test-desktop:" .github/workflows/ci.yml | grep "shard="

# YAML 最終構文チェック
echo "--- YAML 構文チェック ---"
python3 -c "
import yaml
with open('.github/workflows/ci.yml', 'r') as f:
    data = yaml.safe_load(f)
jobs = list(data.get('jobs', {}).keys())
print(f'Jobs: {jobs}')
print('YAML syntax: OK')
"
```

### ステップ3: 並列数計算カバレッジの可視化

並列数計算が全パターン（変更前・変更後・将来の増減）でカバーされているかを可視化する。

**並列数計算カバレッジ表**:

| シナリオ                             | test-desktop | test-web | typecheck | test-shared | e2e-desktop | 合計 | 上限判定 |
| ------------------------------------ | ------------ | -------- | --------- | ----------- | ----------- | ---- | -------- |
| 変更前（TASK-CI-FUTURE-002 実装前）  | 17           | 0        | 1         | 1           | 1           | 20   | PASS     |
| 変更後（TASK-CI-FUTURE-002 実装後）  | 15           | 2        | 1         | 1           | 1           | 20   | PASS     |
| test-web を 3 シャードに増やした場合 | 14           | 3        | 1         | 1           | 1           | 20   | PASS     |
| test-web を 4 シャードに増やした場合 | 13           | 4        | 1         | 1           | 1           | 20   | PASS     |
| test-web 追加のみ（削減なし）        | 17           | 2        | 1         | 1           | 1           | 22   | **FAIL** |

**確認コマンド**:

```bash
# 現行の並列数計算（python3 による ci.yml 解析）
python3 << 'EOF'
import yaml

with open('.github/workflows/ci.yml', 'r') as f:
    ci = yaml.safe_load(f)

jobs = ci.get('jobs', {})
total = 0
details = {}

for job_name, job_config in jobs.items():
    strategy = job_config.get('strategy', {})
    matrix = strategy.get('matrix', {})
    shard = matrix.get('shard', [])
    count = len(shard) if shard else 1
    details[job_name] = count
    total += count

print("=== 並列数計算カバレッジ ===")
for name, count in sorted(details.items()):
    print(f"  {name}: {count}")
print(f"合計: {total}")
print(f"上限: 20")
print(f"判定: {'PASS' if total <= 20 else 'FAIL (上限超過!)'}")
EOF

# 将来の test-web シャード増加シミュレーション
echo ""
echo "=== 将来シナリオのシミュレーション ==="
for WEB_SHARDS in 2 3 4; do
  DESKTOP=$((20 - WEB_SHARDS - 3))
  TOTAL=$((DESKTOP + WEB_SHARDS + 3))
  echo "test-web=${WEB_SHARDS}シャード → test-desktop=${DESKTOP}シャード → 合計=${TOTAL} $([ ${TOTAL} -le 20 ] && echo 'PASS' || echo 'FAIL')"
done
```

### ステップ4: 未カバーシナリオの特定と補完計画

TC-01〜TC-05 および Phase 6 のエッジケースでカバーされていないシナリオを特定し、補完計画を確定する。

**未カバーシナリオ候補**:

| シナリオ                                          | カバー状況                                  | 重要度 | 補完計画                                                   |
| ------------------------------------------------- | ------------------------------------------- | ------ | ---------------------------------------------------------- |
| test-web のカバレッジ収集（main push 時）         | 未定義（test-web に coverage ステップなし） | 中     | 将来の TASK-CI-FUTURE-003 等で対応を検討する               |
| test-web シャード数を 4 に増やした場合の動作      | シミュレーションのみ                        | 低     | 本タスクのスコープ外。別タスクで実施する                   |
| pnpm-lock.yaml 変更時のキャッシュ無効化（web 側） | Phase 6 では desktop のみ確認               | 低     | 本タスクのスコープ外。既存の pnpm-install-retry で対応済み |
| test-web の `--reporter=json` での件数取得精度    | 間接確認のみ                                | 中     | Phase 6 ステップ1 の検証コマンドで確認済みとみなす         |
| test-desktop 削減による CI 全体時間への影響       | Phase 6 ステップ2 で閾値確認                | 高     | 回帰ガード閾値（13 分以内）で対応済み                      |

**補完優先度の判定**:

```bash
# 未カバーシナリオの確認
echo "=== 未カバーシナリオ確認 ==="

# test-web に coverage ステップがあるか確認
echo "1. test-web カバレッジ収集:"
grep -A40 "test-web:" .github/workflows/ci.yml | grep -i "coverage\|codecov" \
  && echo "   カバレッジ設定あり" || echo "   カバレッジ設定なし（未カバー）"

# test-web の timeout-minutes が適切か確認
echo "2. test-web タイムアウト設定:"
grep -A5 "test-web:" .github/workflows/ci.yml | grep "timeout-minutes" \
  && echo "   タイムアウト設定あり" || echo "   タイムアウト設定なし（デフォルト適用）"

# 全体の受け入れ基準充足率を確認
TOTAL_AC=$(cat outputs/phase-1/acceptance-criteria.md 2>/dev/null | grep -c "^-\|^[0-9]" || echo "N/A")
COVERED_TC=5
echo "3. 受け入れ基準充足率: TC=${COVERED_TC}/AC=${TOTAL_AC}"
```

**ゲート判定フロー**:

| 状態                                         | 判定   | 次のアクション                                          |
| -------------------------------------------- | ------ | ------------------------------------------------------- |
| TC-01〜TC-05 が全 AC をカバーし全 PASS       | PASS   | Phase 8（リファクタリング）へ進む                       |
| 未カバー AC が重要度「高」で存在する         | 要対応 | 追加テストケースを設計して Phase 4 からやり直す         |
| 並列数計算で FAIL シナリオが現行設定に当たる | FAIL   | Phase 5 に戻り設定を修正する                            |
| シャード設定の完全性確認で不備が見つかった   | FAIL   | Phase 5 に戻り ci.yml を修正する                        |
| 未カバー AC が重要度「低」〜「中」のみ       | PASS   | 未カバーを `outputs/phase-7/` に記録して Phase 8 へ進む |

---

## 統合テスト連携

- ステップ1〜4 の確認結果を `outputs/phase-7/` に保存する
- トレーサビリティマトリクスは `outputs/phase-7/traceability-coverage-report.md` に記録する
- 並列数計算カバレッジは `outputs/phase-7/parallelism-coverage-report.md` に記録する
- 未カバーシナリオは `outputs/phase-7/uncovered-scenarios.md` に記録する
- ゲート判定（PASS/FAIL）を `outputs/phase-7/gate-decision.md` に記録する
- 統合ログは `outputs/phase-7/` に保存する

---

## 多角的チェック観点

| 観点     | 確認内容                                                                   |
| -------- | -------------------------------------------------------------------------- |
| 矛盾     | トレーサビリティマトリクスと Phase 6 のエッジケース結果が矛盾していないか  |
| 漏れ     | 受け入れ基準（AC）に対応するテストケース（TC）が全件マッピングされているか |
| 整合性   | シャード設定の完全性確認結果が実装サマリー（Phase 5）と整合しているか      |
| 依存関係 | Phase 6 のエッジケース全 PASS が確認済みの上で Phase 7 を実施しているか    |

---

## サブタスク管理

| ID     | タスク名                                                           | ステータス |
| ------ | ------------------------------------------------------------------ | ---------- |
| T-07-1 | テストケースと受け入れ基準の対応確認（トレーサビリティマトリクス） | 未実施     |
| T-07-2 | シャード設定の完全性確認（ci.yml・vitest.config.ts）               | 未実施     |
| T-07-3 | 並列数計算カバレッジの可視化                                       | 未実施     |
| T-07-4 | 未カバーシナリオの特定・補完計画の確定・ゲート判定                 | 未実施     |

---

## 成果物

| 成果物                         | 配置先                                            | 形式     |
| ------------------------------ | ------------------------------------------------- | -------- |
| トレーサビリティ網羅率レポート | `outputs/phase-7/traceability-coverage-report.md` | Markdown |
| 並列数計算カバレッジレポート   | `outputs/phase-7/parallelism-coverage-report.md`  | Markdown |
| 未カバーシナリオ一覧           | `outputs/phase-7/uncovered-scenarios.md`          | Markdown |
| ゲート判定                     | `outputs/phase-7/gate-decision.md`                | Markdown |

---

## 完了条件

- [ ] TC-01〜TC-05 と全受け入れ基準（AC）の対応が `outputs/phase-7/traceability-coverage-report.md` に記録されていること
- [ ] シャード設定の完全性（test-web: shard[1,2]・test-desktop: shard[1..15]・/2 /15 コマンド・fail-fast: false・needs）が全件確認されていること
- [ ] 並列数計算カバレッジ（変更前/後・将来シナリオ）が `outputs/phase-7/parallelism-coverage-report.md` に記録されていること
- [ ] 未カバーシナリオが `outputs/phase-7/uncovered-scenarios.md` に記録され、補完計画が確定していること
- [ ] ゲート判定（PASS/FAIL）が `outputs/phase-7/gate-decision.md` に記録されていること
- [ ] 矛盾がないことを確認
- [ ] 漏れがないことを確認
- [ ] 整合性が取れていることを確認
- [ ] 依存関係が取れていることを確認
- [ ] 本 Phase 内の全タスクを 100% 実行完了

---

## タスク100%実行確認【必須】

- [ ] T-07-1: トレーサビリティマトリクス（TC-01〜TC-05 と AC の対応）を `outputs/phase-7/traceability-coverage-report.md` に記録済み
- [ ] T-07-2: シャード設定の完全性（6 項目）を確認し結果を記録済み
- [ ] T-07-3: 並列数計算カバレッジ（現行・将来シナリオ含む）を `outputs/phase-7/parallelism-coverage-report.md` に記録済み
- [ ] T-07-4: 未カバーシナリオを特定し補完計画を確定、ゲート判定を `outputs/phase-7/gate-decision.md` に記録済み

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/task-ci-future-002-test-web-sharding
```

---

## 次Phase

**Phase 8: リファクタリング** — ci.yml のコメント整備・並列数計算コメントの更新・重複設定の排除を行う。

**Phase 8 開始条件**: Phase 7 のゲート判定が PASS（`outputs/phase-7/gate-decision.md` に PASS が記録済み）であること。
**未達時**: 重要度「高」の未カバー AC が存在する場合は Phase 4 から追加テストケースを設計する。シャード設定不備・並列数 FAIL の場合は Phase 5 に戻る。
