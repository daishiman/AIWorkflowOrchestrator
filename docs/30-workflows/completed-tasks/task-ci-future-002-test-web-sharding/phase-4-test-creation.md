# Phase 4: テスト作成（Red段階）

## メタ情報

| 項目       | 値                                      |
| ---------- | --------------------------------------- |
| Phase      | 4                                       |
| タスクID   | TASK-CI-FUTURE-002                      |
| 機能名     | test-web シャード化                     |
| 前提Phase  | Phase 3（設計レビュー）完了後に着手可能 |
| 後続Phase  | Phase 5                                 |
| 作成日     | 2026-04-15                              |
| ステータス | pending                                 |

**Phase 4 開始条件**: Phase 3（設計レビュー）の全完了条件を満たし、ゲート判定が PASS であること（`outputs/phase-3/gate-decision.md` に記録済み）。

---

## 目的

TDD の Red 段階として、実装前にテストを先行作成する。
test-web のシャード実行が期待通りに動作することを検証するテストスイートを設計し、
現時点では失敗（RED）となることを確認する。
これにより「実装の証明」としてのテストが機能することを事前検証する。

---

## 背景

- 現在 test-web は CI に存在しないか、シャード化されていない状態である
- GitHub Free Tier 並列上限 20 の制約がある
- 現行: test-desktop(17) + typecheck(1) + test-shared(1) + e2e-desktop(1) = 20（上限到達）
- 対応案: test-desktop を 15 に削減して test-web に 2 シャード割り当て（15+2+1+1+1=20）

---

## SubAgentチーム編成

| SubAgent   | 関心ごと       | 主担当                         |
| ---------- | -------------- | ------------------------------ |
| SubAgent-A | CI設定責務     | シャード設定・matrix定義確認   |
| SubAgent-B | テスト実行環境 | ローカルシャード実行・件数確認 |
| SubAgent-C | 並列数計算     | GitHub Free Tier上限チェック   |
| SubAgent-D | 統合監査       | 矛盾・漏れ・整合・依存判定     |

---

## 実行タスク

- **タスク1**: 事前確認 — 現行の test-web ジョブ有無・ローカルテスト件数確認
- **タスク2**: ローカルシャード実行テストスイートの設計
- **タスク3**: テストケース設計（テストマトリクス TC-01〜TC-05）
- **タスク4**: CI設定検証テストの設計（YAML構文チェック等）
- **タスク5**: 並列数計算確認テストの設計
- **タスク6**: RED 確認（実装前の FAIL 状態の記録）

---

## 参照資料

| 参照資料            | パス                                         | 説明             |
| ------------------- | -------------------------------------------- | ---------------- |
| 要件定義書          | `outputs/phase-1/requirements-definition.md` | Phase 1 成果物   |
| 受け入れ基準        | `outputs/phase-1/acceptance-criteria.md`     | Phase 1 成果物   |
| アーキテクチャ設計  | `outputs/phase-2/architecture-design.md`     | Phase 2 成果物   |
| テスト戦略          | `outputs/phase-2/test-strategy.md`           | Phase 2 成果物   |
| 設計レビュー結果    | `outputs/phase-3/design-review-result.md`    | Phase 3 成果物   |
| ゲート判定          | `outputs/phase-3/gate-decision.md`           | Phase 3 成果物   |
| CI ワークフロー     | `.github/workflows/ci.yml`                   | 修正対象ファイル |
| vitest 設定（web）  | `apps/web/vitest.config.ts`                  | 確認・修正対象   |
| desktop vitest 設定 | `apps/desktop/vitest.config.ts`              | 並列数参照元     |

---

## 実行手順

### ステップ0: Phase 4 事前確認【必須】

```bash
# Phase 3 が完了していることを確認
ls outputs/phase-3/gate-decision.md

# 現行の CI ワークフローに test-web が存在するか確認
grep -n "test-web\|@repo/web" .github/workflows/ci.yml

# apps/web のテスト設定確認
cat apps/web/vitest.config.ts 2>/dev/null || echo "vitest.config.ts not found"

# ローカルでの test-web 件数確認（単一実行）
pnpm --filter @repo/web test -- --reporter=verbose 2>&1 | tail -5
```

### ステップ1: ローカルシャード実行テストスイートの設計

ローカルシャード実行で各シャードが正常に完了（EXIT 0）することを検証するテストスイートを設計する。

**設計方針**:

- シャード数 2 での実行を基本とする
- 各シャードが独立して EXIT 0 で終了することを確認する
- 全シャードのテスト合計件数が単一実行と一致することを確認する

```bash
# シャード 1/2 の実行（ローカル検証コマンド）
pnpm --filter @repo/web test -- --shard=1/2

# シャード 2/2 の実行（ローカル検証コマンド）
pnpm --filter @repo/web test -- --shard=2/2

# 単一実行での件数確認
pnpm --filter @repo/web test -- --reporter=json 2>/dev/null | python3 -c "
import sys, json
data = json.load(sys.stdin)
print(f'Total: {data[\"numTotalTests\"]} tests')
"
```

### ステップ2: テストケース設計（テストマトリクス）

| TC番号 | テストケース名                              | 検証内容                                                                            | 検証方法                                   | 期待結果                                |
| ------ | ------------------------------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------ | --------------------------------------- |
| TC-01  | シャード 1/N で EXIT 0 終了                 | `pnpm --filter @repo/web test -- --shard=1/2` の終了コード                          | ローカル実行・EXIT コード確認              | EXIT 0（正常終了）                      |
| TC-02  | 全シャードのテスト合計件数が単一実行と一致  | shard=1/2 と shard=2/2 の件数合計 = 単一実行件数                                    | --reporter=json で件数を抽出して比較       | 件数一致（差分 0）                      |
| TC-03  | ci.yml に正しい matrix 設定が追加されている | test-web ジョブに `strategy.matrix.shard: [1, 2]` が存在                            | `grep -n "shard" .github/workflows/ci.yml` | 正規表現にマッチするYAML定義が存在      |
| TC-04  | 並列数合計が 20 以内に収まる                | test-desktop(N) + test-web(2) + typecheck(1) + test-shared(1) + e2e-desktop(1) ≤ 20 | 並列数計算式の検証                         | 合計 ≤ 20                               |
| TC-05  | CI で test-web が 2 並列で実行される        | GitHub Actions の matrix により 2 ジョブが起動する                                  | CI ログでジョブ数確認                      | test-web (1/2) と test-web (2/2) が存在 |

### ステップ3: CI設定検証テストの設計

```bash
# YAML構文チェック（実装前に構文エラーがないことを確認する基準）
python3 -c "
import yaml
try:
    with open('.github/workflows/ci.yml', 'r') as f:
        yaml.safe_load(f)
    print('YAML syntax: OK')
except yaml.YAMLError as e:
    print(f'YAML syntax error: {e}')
"

# test-web ジョブの存在確認（実装前は存在しないことを確認 → RED）
grep -c "test-web:" .github/workflows/ci.yml || echo "test-web job not found (RED state expected)"

# matrix shard の設定確認（実装前は存在しないことを確認 → RED）
grep -A5 "test-web:" .github/workflows/ci.yml | grep "shard" || echo "shard matrix not found (RED state expected)"
```

### ステップ4: 並列数計算確認テストの設計

並列数オーバーフロー防止のための計算検証を設計する。

```bash
# 現行の test-desktop シャード数を確認
DESKTOP_SHARDS=$(grep -A3 "shard:" .github/workflows/ci.yml | grep -o '\[.*\]' | tr ',' '\n' | wc -l | tr -d ' ')
echo "test-desktop shards: ${DESKTOP_SHARDS}"

# 並列数計算（期待値: 15+2+1+1+1=20）
# 実装後は以下が成立することを確認する
# test-desktop(15) + test-web(2) + typecheck(1) + test-shared(1) + e2e-desktop(1) = 20
echo "Expected after implementation: 15 + 2 + 1 + 1 + 1 = 20 (≤ 20)"

# 現行の並列数確認
TYPECHECK=1
TEST_SHARED=1
E2E_DESKTOP=1
echo "Current state: test-desktop(${DESKTOP_SHARDS}) + typecheck(${TYPECHECK}) + test-shared(${TEST_SHARED}) + e2e-desktop(${E2E_DESKTOP}) = $((DESKTOP_SHARDS + TYPECHECK + TEST_SHARED + E2E_DESKTOP))"
```

### ステップ5: RED 確認

実装前（Phase 5 前）に各テストケースが RED（失敗）であることを確認する。

```bash
# TC-01: shard=1/2 実行（vitest.config.ts が未設定の場合は失敗が期待される）
pnpm --filter @repo/web test -- --shard=1/2 2>&1 | tail -3
echo "TC-01 exit code: $?"

# TC-03: test-web ジョブが ci.yml に存在しないことを確認（RED状態）
grep "test-web:" .github/workflows/ci.yml && echo "TC-03: GREEN (job exists)" || echo "TC-03: RED (job not found)"

# TC-04: 並列数が上限内か確認
DESKTOP_SHARDS=17  # 現行値
TOTAL=$((DESKTOP_SHARDS + 2 + 1 + 1 + 1))
echo "TC-04: Total parallel = ${TOTAL} (limit=20)"
[ "${TOTAL}" -le 20 ] && echo "TC-04: GREEN" || echo "TC-04: RED (exceeds limit)"
```

**期待される RED 状態**:

- TC-01: `apps/web/vitest.config.ts` にシャード対応設定がない場合はエラー終了
- TC-02: シャード件数の合計が単一実行と一致しない（設定不備により）
- TC-03: `test-web` ジョブが `.github/workflows/ci.yml` に存在しない
- TC-04: `test-desktop(17) + test-web(2) + typecheck(1) + test-shared(1) + e2e-desktop(1) = 22 > 20` で上限超過
- TC-05: CI で test-web ジョブが 2 並列で起動しない

---

## 統合テスト連携

- TC-01〜TC-05 を統合シナリオとして定義し、Phase 5 実装後に全て GREEN になることを確認する
- TC-04 の並列数上限チェックは、test-desktop シャード削減（17→15）と test-web 追加（0→2）の両方が必要
- 統合ログは `outputs/phase-4/` に保存する

---

## 多角的チェック観点

| 観点     | 確認内容                                                             |
| -------- | -------------------------------------------------------------------- |
| 矛盾     | テストケースと受け入れ基準（AC）の矛盾がないか確認する               |
| 漏れ     | 5 つのテストケース（TC-01〜TC-05）が全 AC をカバーしているか確認する |
| 整合性   | ローカル実行コマンドと CI 設定の整合が取れているか確認する           |
| 依存関係 | Phase 3 のゲート判定結果との整合が取れているか確認する               |

---

## サブタスク管理

| ID     | タスク名                                   | ステータス |
| ------ | ------------------------------------------ | ---------- |
| T-04-1 | 事前確認（test-web 有無・テスト件数確認）  | 未実施     |
| T-04-2 | ローカルシャード実行テストスイート設計     | 未実施     |
| T-04-3 | テストマトリクス作成（TC-01〜TC-05）       | 未実施     |
| T-04-4 | CI設定検証テスト設計（YAML構文チェック等） | 未実施     |
| T-04-5 | 並列数計算確認テスト設計                   | 未実施     |
| T-04-6 | RED 確認（全 TC が RED であることの記録）  | 未実施     |

---

## 成果物

| 成果物           | 配置先                                | 形式     |
| ---------------- | ------------------------------------- | -------- |
| テストマトリクス | `outputs/phase-4/test-matrix.md`      | Markdown |
| RED 確認結果     | `outputs/phase-4/red-confirmation.md` | Markdown |

---

## 完了条件

- [ ] テストマトリクス（TC-01〜TC-05）が `outputs/phase-4/test-matrix.md` に記録されていること
- [ ] 各 TC に対応する検証コマンドが定義されていること
- [ ] 実装前の RED 状態が `outputs/phase-4/red-confirmation.md` に記録されていること
- [ ] TC-04 の並列数計算で現行（17+0+1+1+1=20: `test-desktop + test-web + typecheck + test-shared + e2e-desktop`）と実装後の期待値（15+2+1+1+1=20）が明記されていること
- [ ] 矛盾がないことを確認
- [ ] 漏れがないことを確認
- [ ] 整合性が取れていることを確認
- [ ] 依存関係が取れていることを確認
- [ ] 本 Phase 内の全タスクを 100% 実行完了

---

## タスク100%実行確認【必須】

- [ ] T-04-1: 事前確認（test-web 有無・テスト件数）を実行済み
- [ ] T-04-2: ローカルシャード実行テストスイートの設計が完了済み
- [ ] T-04-3: テストマトリクス（TC-01〜TC-05）を `outputs/phase-4/test-matrix.md` に記録済み
- [ ] T-04-4: CI設定検証テストの設計が完了済み
- [ ] T-04-5: 並列数計算確認テストの設計が完了済み
- [ ] T-04-6: RED 確認結果を `outputs/phase-4/red-confirmation.md` に記録済み

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/task-ci-future-002-test-web-sharding
```

---

## 次Phase

**Phase 5: 実装** — RED を GREEN に変えるための実装を行う。
`.github/workflows/ci.yml` に test-web シャード設定を追加し、test-desktop シャード数を削減する。

**Phase 5 開始条件**: Phase 4 の全完了条件を満たし、全テストケース（TC-01〜TC-05）が RED 状態であることが `outputs/phase-4/red-confirmation.md` に記録済みであること。
