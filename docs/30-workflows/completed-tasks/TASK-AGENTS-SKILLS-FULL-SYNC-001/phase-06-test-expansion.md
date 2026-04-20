# Phase 6: テスト拡充

## メタ情報

| 項目      | 値                               |
| --------- | -------------------------------- |
| Phase     | 6                                |
| 機能名    | TASK-AGENTS-SKILLS-FULL-SYNC-001 |
| 作成日    | 2026-04-19                       |
| 前提Phase | Phase 1 / 2 / 3 / 4 / 5 完了     |
| TDD state | Green（Phase 5 完了）→ 境界拡張  |

## 目的

Phase 4 で定義した 12 本の TC を足場に、**fail path・回帰 guard・補助コマンド・edge case・snapshot 比較**の 5 軸で境界条件を網羅する。Phase 5 の実装が単純系（happy path）で Green になっただけでは見落とす失敗モード（generate-index.js エラー、CANONICAL 不在、MIRROR 不在、権限エラー、同時実行など）を fail case として言語化し、TASK-CONFLICT-PREVENT-001 で設定した既存の merge policy / post-merge hook / session-init warning を壊していないことも同時に確認する。

## 実行タスク

1. fail path（4 ケース）のテストを追加する
2. 回帰 guard（TASK-CONFLICT-PREVENT-001 関連テスト）を定義する
3. 補助コマンド（`--check-only` / `CLAUDE_SKIP_HEAVY_HOOKS=1`）のテストを追加する
4. Edge case（同時実行）の確認手順を定義する
5. Phase 1 の `/tmp/skills-diff-YYYYMMDD.txt` と Phase 5 実施後の差分 snapshot を比較する

## 参照資料

| 資料名                   | パス                                                                                       | 用途                          |
| ------------------------ | ------------------------------------------------------------------------------------------ | ----------------------------- |
| Phase 1 要件定義         | `phase-01-requirements.md`                                                                 | 差分 snapshot の基準点        |
| Phase 4 テスト仕様       | `phase-04-test-creation.md`                                                                | TC-4-01〜TC-4-12 の土台       |
| Phase 5 実装仕様         | `phase-05-implementation.md`                                                               | スクリプト配置後の挙動仕様    |
| conflict-prevent Phase 6 | `docs/30-workflows/completed-tasks/conflict-prevent-skills-001/phase-06-test-expansion.md` | 回帰 guard 骨格の参考         |
| post-merge hook          | `.claude/hooks/post-merge-index-regenerate.sh`                                             | 回帰対象の既存 hook           |
| `.gitattributes`         | repository root                                                                            | merge policy 非変更の確認対象 |

### システム仕様（aiworkflow-requirements）

| 参照資料            | パス                                                                   | 内容                                       |
| ------------------- | ---------------------------------------------------------------------- | ------------------------------------------ |
| generate-index 契約 | `.claude/skills/aiworkflow-requirements/scripts/generate-index.js`     | deterministic 出力 と `--quiet` オプション |
| validate-structure  | `.claude/skills/aiworkflow-requirements/scripts/validate-structure.js` | 既存 structure 検証（回帰対象）            |

## テスト拡充マトリクス

### 拡充 TC 一覧（TC-6-01〜TC-6-12）

| TC      | 区分          | 対象                                     | 入力条件                                                   | 期待 exit             | 期待キー出力                     |
| ------- | ------------- | ---------------------------------------- | ---------------------------------------------------------- | --------------------- | -------------------------------- |
| TC-6-01 | fail path     | `sync-skills-mirror.sh`                  | `generate-index.js` を一時的に壊してから sync 実行         | 1                     | stderr に node エラー + exit 1   |
| TC-6-02 | fail path     | `verify-skills-parity.sh`                | `.claude/skills/` を一時退避（CANONICAL 不在）             | 0                     | `[parity-check] SKIP:`           |
| TC-6-03 | fail path     | `verify-skills-parity.sh`                | `.agents/skills/` を一時退避（MIRROR 不在）                | 1                     | `[parity-check] NG:`             |
| TC-6-04 | fail path     | `sync-skills-mirror.sh`                  | `.agents/skills/` に読み取り専用属性（`chmod -w`）         | 非 0                  | rsync の permission denied       |
| TC-6-05 | 回帰 guard    | `.gitattributes`                         | 本 task branch の diff                                     | 0                     | 本タスクで変更されていない       |
| TC-6-06 | 回帰 guard    | EVALS.json                               | 本 task branch の diff                                     | 0                     | 本タスクで変更されていない       |
| TC-6-07 | 回帰 guard    | `post-merge-index-regenerate.sh`         | merge simulation 後の index 再生成が成功する               | 0                     | 既存挙動が破壊されていない       |
| TC-6-08 | 回帰 guard    | session-init の `merge.ours.driver` 警告 | driver 未設定のまま session-init 実行                      | 0                     | 既存 driver 警告が出力されている |
| TC-6-09 | 補助コマンド  | `sync-skills-mirror.sh --check-only`     | 内容差分ありの状態                                         | 1                     | 差分列挙のみ、rsync は走らない   |
| TC-6-10 | 補助コマンド  | session-init `CLAUDE_SKIP_HEAVY_HOOKS=1` | 差分ありの状態                                             | 0                     | parity check ブロックをスキップ  |
| TC-6-11 | edge case     | 同時実行（2 プロセス sync）              | `sync-skills-mirror.sh` を並列 2 本起動                    | いずれか 0/どちらか 1 | 最終 parity が OK                |
| TC-6-12 | snapshot 比較 | diff snapshot                            | `/tmp/skills-diff-YYYYMMDD.txt` vs Phase 5 後の `diff -qr` | 0                     | 差分 0 に収束                    |

## 実行手順

### ステップ 1: fail path テスト

#### TC-6-01: `generate-index.js` エラー時

```bash
# generate-index.js をバックアップし、壊れた版に差し替える
cp .claude/skills/aiworkflow-requirements/scripts/generate-index.js /tmp/generate-index.js.bak
echo "throw new Error('intentional failure');" \
  > .claude/skills/aiworkflow-requirements/scripts/generate-index.js

bash .claude/scripts/sync-skills-mirror.sh
RC=$?
[ "$RC" -ne 0 ] && echo "TC-6-01 PASS (rc=$RC)" || echo "TC-6-01 FAIL (rc=$RC)"

# 復元
cp /tmp/generate-index.js.bak .claude/skills/aiworkflow-requirements/scripts/generate-index.js
```

#### TC-6-02: CANONICAL 不在

```bash
mv .claude/skills /tmp/.claude-skills.bak

bash .claude/scripts/verify-skills-parity.sh 2>&1 | tee /tmp/verify-canonical-missing.log
RC=$?
grep -q "\[parity-check\] SKIP:" /tmp/verify-canonical-missing.log \
  && [ "$RC" -eq 0 ] && echo "TC-6-02 PASS" || echo "TC-6-02 FAIL"

mv /tmp/.claude-skills.bak .claude/skills
```

#### TC-6-03: MIRROR 不在

```bash
mv .agents/skills /tmp/.agents-skills.bak

bash .claude/scripts/verify-skills-parity.sh 2>&1 | tee /tmp/verify-mirror-missing.log
RC=$?
grep -q "\[parity-check\] NG:" /tmp/verify-mirror-missing.log \
  && [ "$RC" -eq 1 ] && echo "TC-6-03 PASS" || echo "TC-6-03 FAIL"

mv /tmp/.agents-skills.bak .agents/skills
```

#### TC-6-04: 権限エラー

```bash
chmod -R a-w .agents/skills
bash .claude/scripts/sync-skills-mirror.sh 2>&1 | tee /tmp/sync-permission.log
RC=$?
[ "$RC" -ne 0 ] && grep -q "[Pp]ermission denied" /tmp/sync-permission.log \
  && echo "TC-6-04 PASS" || echo "TC-6-04 FAIL"

chmod -R u+w .agents/skills
```

### ステップ 2: 回帰 guard テスト

#### TC-6-05: `.gitattributes` 非変更

```bash
git diff origin/main -- .gitattributes | tee /tmp/gitattributes.diff
[ ! -s /tmp/gitattributes.diff ] && echo "TC-6-05 PASS" || echo "TC-6-05 FAIL"
```

#### TC-6-06: EVALS.json 非変更

```bash
git diff origin/main -- '**/EVALS.json' | tee /tmp/evals.diff
[ ! -s /tmp/evals.diff ] && echo "TC-6-06 PASS" || echo "TC-6-06 FAIL"
```

#### TC-6-07: post-merge hook の挙動維持

```bash
# merge simulation 用の一時 branch を作り、post-merge hook が落ちないことを確認
git checkout -b /tmp/test-post-merge-regression
echo "regression-check" >> .claude/skills/aiworkflow-requirements/LOGS.md
git commit -am "test: post-merge regression"

git checkout -
git merge --no-edit /tmp/test-post-merge-regression || true
bash .claude/hooks/post-merge-index-regenerate.sh
RC=$?
[ "$RC" -eq 0 ] && echo "TC-6-07 PASS" || echo "TC-6-07 FAIL"

git merge --abort 2>/dev/null || true
git branch -D /tmp/test-post-merge-regression
```

#### TC-6-08: session-init の既存 driver 警告維持

```bash
git config --unset merge.ours.driver 2>/dev/null || true
bash .claude/hooks/session-init.sh 2>&1 | tee /tmp/session-init-regression.log
grep -q "merge.ours.driver" /tmp/session-init-regression.log \
  && echo "TC-6-08 PASS" || echo "TC-6-08 FAIL"

# 後始末: setup-merge-drivers で復元
bash .claude/scripts/setup-merge-drivers.sh
```

### ステップ 3: 補助コマンドテスト

#### TC-6-09: `--check-only` で rsync が走らない

```bash
echo "check-only-drift-$(date +%s)" >> .claude/skills/aiworkflow-requirements/LOGS.md

# mirror の mtime をスナップショット
STAT_BEFORE=$(stat -f %m .agents/skills/aiworkflow-requirements/LOGS.md 2>/dev/null \
              || stat -c %Y .agents/skills/aiworkflow-requirements/LOGS.md)

bash .claude/scripts/sync-skills-mirror.sh --check-only
RC=$?

STAT_AFTER=$(stat -f %m .agents/skills/aiworkflow-requirements/LOGS.md 2>/dev/null \
             || stat -c %Y .agents/skills/aiworkflow-requirements/LOGS.md)

[ "$RC" -eq 1 ] && [ "$STAT_BEFORE" = "$STAT_AFTER" ] \
  && echo "TC-6-09 PASS" || echo "TC-6-09 FAIL"

# 後始末
git restore .claude/skills/aiworkflow-requirements/LOGS.md
```

#### TC-6-10: `CLAUDE_SKIP_HEAVY_HOOKS=1` で parity check skip

```bash
echo "heavy-hooks-drift-$(date +%s)" >> .claude/skills/aiworkflow-requirements/LOGS.md

CLAUDE_SKIP_HEAVY_HOOKS=1 bash .claude/hooks/session-init.sh 2>&1 \
  | tee /tmp/session-init-skip-heavy.log

grep -q "parity-check" /tmp/session-init-skip-heavy.log \
  && echo "TC-6-10 FAIL (parity-check が実行された)" \
  || echo "TC-6-10 PASS"

git restore .claude/skills/aiworkflow-requirements/LOGS.md
```

### ステップ 4: Edge case（同時実行）

#### TC-6-11: 2 つの Claude Code セッションからの同時 sync

```bash
echo "race-condition-drift-$(date +%s)" >> .claude/skills/aiworkflow-requirements/LOGS.md

# 2 プロセスを並列起動
bash .claude/scripts/sync-skills-mirror.sh > /tmp/sync-A.log 2>&1 &
PID_A=$!
bash .claude/scripts/sync-skills-mirror.sh > /tmp/sync-B.log 2>&1 &
PID_B=$!

wait $PID_A; RC_A=$?
wait $PID_B; RC_B=$?

# 少なくとも 1 本が成功し、最終 parity が OK なら受容
bash .claude/scripts/verify-skills-parity.sh
RC_FINAL=$?

[ "$RC_FINAL" -eq 0 ] && echo "TC-6-11 PASS (A=$RC_A B=$RC_B final=$RC_FINAL)" \
  || echo "TC-6-11 FAIL (A=$RC_A B=$RC_B final=$RC_FINAL)"
```

観点: rsync は write 競合で一時エラーになる可能性があるが、どちらか片方が後勝ちし、最終 `diff -qr` が空出力であれば parity は回復する。両方 exit 1 で最終 diff も非空なら FAIL。

### ステップ 5: snapshot 比較

#### TC-6-12: Phase 1 と Phase 5 後の snapshot 差分

```bash
# Phase 1 のスナップショット（/tmp/skills-diff-YYYYMMDD.txt）を再取得
PHASE1_SNAP=$(ls -1t /tmp/skills-diff-*.txt 2>/dev/null | head -1)
echo "Phase1 snapshot: $PHASE1_SNAP"

# Phase 5 後の snapshot
diff -qr .claude/skills .agents/skills 2>/dev/null \
  | tee /tmp/skills-diff-phase5-after.txt

# Phase 5 後は空出力、Phase 1 は 7 件であることを比較
PHASE1_LINES=$(wc -l < "$PHASE1_SNAP")
PHASE5_LINES=$(wc -l < /tmp/skills-diff-phase5-after.txt)

echo "Phase1 drift count: $PHASE1_LINES"
echo "Phase5 drift count: $PHASE5_LINES"

[ "$PHASE5_LINES" -eq 0 ] && echo "TC-6-12 PASS" || echo "TC-6-12 FAIL"
```

## Failure mode カタログ

| failure mode                             | 検出 TC           | 対処                                                                      |
| ---------------------------------------- | ----------------- | ------------------------------------------------------------------------- |
| generate-index.js が node エラー         | TC-6-01           | canonical 側で generate-index.js を修正してから再度 sync                  |
| CANONICAL / MIRROR ディレクトリ不在      | TC-6-02 / TC-6-03 | SKIP 扱いとし、破壊的変更を起こさない（設計通り）                         |
| mirror に書き込み権限なし                | TC-6-04           | `chmod u+w` で復旧。sync は exit 1 で中断する                             |
| 本タスクで `.gitattributes` / EVALS 変更 | TC-6-05 / TC-6-06 | 即 revert（AC-7 / AC-9 違反）                                             |
| 既存 post-merge / session-init hook 破壊 | TC-6-07 / TC-6-08 | 追記位置を確認し、上書きではなく追加で再配置                              |
| `--check-only` が rsync を実行           | TC-6-09           | 分岐を見直し、`$1 = "--check-only"` 時に早期 return                       |
| `CLAUDE_SKIP_HEAVY_HOOKS=1` が効かない   | TC-6-10           | 環境変数ガードを parity check ブロックの先頭に移す                        |
| 同時実行で最終 parity NG                 | TC-6-11           | ドキュメントで「同時実行非推奨」を注記、pre-push は直列化される前提を明記 |

## 多角的チェック観点（AIが判断）

- 帰納的思考: 実運用で観測されうる fail mode から境界条件を 4 分類に補強したか
- if 思考: generate-index 壊れ / CANONICAL 不在 / MIRROR 不在 / 権限なしの 4 分岐を MECE に網羅したか
- 問題解決系: 再発しやすい「`.gitattributes` / EVALS.json 変更」を回帰 guard で止めているか
- システム思考: post-merge hook と session-init の既存挙動が破壊されていないことを検証しているか
- 批判的思考: `--check-only` が実質 rsync を実行する誤実装を検出できる TC になっているか（mtime 比較）

## サブタスク管理

| SubTask | 内容                              | 並列性 | 担当 Lane            |
| ------- | --------------------------------- | ------ | -------------------- |
| ST-6-1  | fail path 4 件の TC 定義          | par    | Lane A（fail path）  |
| ST-6-2  | 回帰 guard 4 件の TC 定義         | par    | Lane B（regression） |
| ST-6-3  | 補助コマンド 2 件の TC 定義       | par    | Lane C（auxiliary）  |
| ST-6-4  | edge case（同時実行）の TC 定義   | seq    | Lane D（edge）       |
| ST-6-5  | Phase 1 snapshot との比較 TC 定義 | seq    | Lane D（snapshot）   |

## 成果物

- 12 件の拡充 TC テーブル（TC-6-01〜TC-6-12）
- failure mode カタログ（8 行）
- `/tmp/skills-diff-phase5-after.txt`（Phase 5 後 snapshot）
- 回帰 guard テストの diff 確認ログ（`/tmp/gitattributes.diff`, `/tmp/evals.diff`）

## 完了条件

- [ ] fail path 4 件（generate-index エラー / CANONICAL 不在 / MIRROR 不在 / 権限エラー）が TC として記述されている
- [ ] 回帰 guard 4 件（`.gitattributes` / EVALS.json / post-merge / session-init driver 警告）が TC として記述されている
- [ ] 補助コマンド 2 件（`--check-only` / `CLAUDE_SKIP_HEAVY_HOOKS=1`）が TC として記述されている
- [ ] edge case（同時実行）の TC が記述されている
- [ ] Phase 1 snapshot との差分比較 TC が記述されている
- [ ] failure mode カタログが 8 行以上ある

## 次のPhaseへの引き継ぎ

- Phase 7 では 5 コンポーネント（C-1〜C-5）× exit code パス（0 / 1）のカバレッジマトリクスで、Phase 4 + Phase 6 の TC 網羅状況を可視化する
- TC-6-11（同時実行）は非決定的なので Phase 7 では「カバレッジ対象外」として扱い、別途ドキュメントに注記する
- `/tmp/skills-diff-phase5-after.txt` = 空出力が維持されていることを Phase 9 品質保証で再確認する

## 統合テスト連携

- Phase 7 は TC-6 系を exit code coverage と dependency edge coverage に再集約する
- Phase 9 / 11 は本 Phase で増やした fail path を品質保証と manual evidence の根拠として再利用する
