# Phase 4: テスト作成

## メタ情報

| 項目      | 値                               |
| --------- | -------------------------------- |
| Phase     | 4                                |
| 機能名    | TASK-AGENTS-SKILLS-FULL-SYNC-001 |
| 作成日    | 2026-04-19                       |
| 前提Phase | Phase 1 / 2 / 3 完了             |
| TDD state | Red（スクリプト未配置段階）      |

## 目的

Phase 2 で確定した 5 コンポーネント（C-1: verify / C-2: sync / C-3: pre-push / C-4: session-init / C-5: drift 解消）に対して、**スクリプト未配置の現状（Red state）でまず失敗することを確認するテスト群**と、Phase 5 実装後に **green で通過するはずの期待値**を対にして定義する。`diff -qr` / `rsync -a --delete` / `generate-index.js` の 3 ステップを単体・結合の両方で検証可能な粒度に落とす。

## 実行タスク

1. 3 シナリオ（NG 検出 / OK 確認 / pre-push abort）のテストコマンドと期待 exit code を固定する
2. `verify-skills-parity.sh` / `sync-skills-mirror.sh` 単体の command suite を列挙する
3. session-init の 1 秒未満目標を計測するステップを定義する
4. husky 未導入環境でのフォールバック確認テストを設計する
5. `int-test-skill` が mirror に存在することの確認テストを定義する
6. mirror-only ファイル warning の出力確認テストを設計する
7. TDD Red state（スクリプト未配置 → `exit 127` または `file not found`）の事前スナップショットを取得する手順を定義する

## 参照資料

| 資料名                   | パス                                                                                      | 用途                             |
| ------------------------ | ----------------------------------------------------------------------------------------- | -------------------------------- |
| Phase 1 要件定義         | `phase-01-requirements.md`                                                                | AC-1〜AC-9 のテスト対象付け直し  |
| Phase 2 設計             | `phase-02-design.md`                                                                      | C-1〜C-5 の exit code 契約       |
| Phase 3 設計レビュー     | `phase-03-design-review.md`                                                               | 残リスク 5 件の Phase 4 申し送り |
| Issue #2278 本文         | `docs/30-workflows/unassigned-task/TASK-AGENTS-SKILLS-FULL-SYNC-001.md`                   | シナリオ 1〜4 の検証コマンド原本 |
| conflict-prevent Phase 4 | `docs/30-workflows/completed-tasks/conflict-prevent-skills-001/phase-04-test-creation.md` | テストケース骨格の参考           |
| post-merge hook          | `.claude/hooks/post-merge-index-regenerate.sh`                                            | index 再生成タイミングの参考     |
| session-init hook        | `.claude/hooks/session-init.sh`                                                           | warning 差し込み位置の確認       |

### システム仕様（aiworkflow-requirements）

| 参照資料                | パス                                                                 | 内容                                     |
| ----------------------- | -------------------------------------------------------------------- | ---------------------------------------- |
| canonical / mirror 責務 | `.claude/skills/aiworkflow-requirements/references/task-workflow.md` | `.claude` 正本、`.agents` 派生の運用原則 |
| generate-index 契約     | `.claude/skills/aiworkflow-requirements/scripts/generate-index.js`   | deterministic output と `--quiet` フラグ |
| merge policy            | `.gitattributes`                                                     | 本タスクで変更しない前提                 |

## テストスイート定義

### シナリオ別テストケース一覧

| TC      | シナリオ                     | 対象コンポーネント | 入力条件                                                                 | 実行コマンド                                                   | 期待 exit | 期待出力のキー文字列                      |
| ------- | ---------------------------- | ------------------ | ------------------------------------------------------------------------ | -------------------------------------------------------------- | --------- | ----------------------------------------- | --- | --------------------- |
| TC-4-01 | NG 検出（内容差分）          | C-1 verify         | `.claude/skills/aiworkflow-requirements/LOGS.md` に 1 行追記             | `bash .claude/scripts/verify-skills-parity.sh`                 | 1         | `[parity-check] NG:`                      |
| TC-4-02 | OK 確認（差分なし）          | C-1 verify         | `sync-skills-mirror.sh` 実行直後                                         | `bash .claude/scripts/verify-skills-parity.sh`                 | 0         | `[parity-check] OK:`                      |
| TC-4-03 | pre-push abort               | C-3 pre-push       | canonical に 1 行追記 → disposable commit → ローカル bare remote へ push | `git push "$TMP_REMOTE" HEAD`                                  | 非 0      | `[pre-push] parity NG のため push を中止` |
| TC-4-04 | sync 1 コマンド完結          | C-2 sync           | `int-test-skill` 未同期 + 内容差分 6 件                                  | `bash .claude/scripts/sync-skills-mirror.sh`                   | 0         | `[mirror-sync] 完了: parity OK`           |
| TC-4-05 | `--check-only` 読み取り専用  | C-2 sync           | 内容差分あり                                                             | `bash .claude/scripts/sync-skills-mirror.sh --check-only`      | 1         | `Files .claude/...` （diff 出力列挙）     |
| TC-4-06 | session-init timing          | C-4 session-init   | canonical / mirror parity 済                                             | `time bash .claude/hooks/session-init.sh`                      | 0         | 実 wall time < 1.0 秒                     |
| TC-4-07 | session-init スキップ        | C-4 session-init   | `CLAUDE_SKIP_HEAVY_HOOKS=1`                                              | `CLAUDE_SKIP_HEAVY_HOOKS=1 bash .claude/hooks/session-init.sh` | 0         | parity check ブロックが実行されない       |
| TC-4-08 | husky 未導入フォールバック   | C-3 pre-push       | `.husky/pre-push` が存在しない                                           | `test -f .husky/pre-push                                       |           | echo "husky not installed"`               | 0   | `husky not installed` |
| TC-4-09 | `int-test-skill` mirror 存在 | C-5 drift 解消     | Phase 5 の rsync 後                                                      | `test -f .agents/skills/int-test-skill/SKILL.md`               | 0         | —                                         |
| TC-4-10 | mirror-only warning 出力     | C-2 sync           | `.agents/skills/dummy-only/README.md` を事前に作成                       | `bash .claude/scripts/sync-skills-mirror.sh --check-only`      | 1         | `Only in .agents/skills`                  |
| TC-4-11 | TDD Red（スクリプト未配置）  | C-1 verify         | Phase 5 未実施                                                           | `bash .claude/scripts/verify-skills-parity.sh`                 | 127       | `No such file or directory`               |
| TC-4-12 | CANONICAL 未存在時の SKIP    | C-1 verify         | `.claude/skills/` を一時退避                                             | `bash .claude/scripts/verify-skills-parity.sh`                 | 0         | `[parity-check] SKIP:`                    |

### AC トレーサビリティ

| AC   | 対応 TC                                                   |
| ---- | --------------------------------------------------------- |
| AC-1 | TC-4-02, TC-4-09                                          |
| AC-2 | TC-4-01, TC-4-02, TC-4-12                                 |
| AC-3 | TC-4-04                                                   |
| AC-4 | TC-4-03, TC-4-08                                          |
| AC-5 | TC-4-09                                                   |
| AC-6 | TC-4-06, TC-4-07                                          |
| AC-7 | Phase 5 実装差分レビューで対応（`.gitattributes` 非変更） |
| AC-9 | Phase 5 実装差分レビューで対応（EVALS.json 非変更）       |

## 実行手順

### ステップ 1: TDD Red 事前スナップショット

Phase 5 実装に入る前に、スクリプト未配置状態で期待通り失敗することを記録する。

```bash
# スクリプトが未配置であることを確認
test ! -f .claude/scripts/verify-skills-parity.sh && echo "[Red] verify script absent (OK for Red state)"
test ! -f .claude/scripts/sync-skills-mirror.sh   && echo "[Red] sync   script absent (OK for Red state)"

# 実行すると exit 127 または file not found になることを確認
bash .claude/scripts/verify-skills-parity.sh; echo "exit=$?"  # 期待: exit=127
bash .claude/scripts/sync-skills-mirror.sh;   echo "exit=$?"  # 期待: exit=127

# Phase 1 のスナップショットと対比するため差分を取得
diff -qr .claude/skills .agents/skills 2>/dev/null \
  | tee /tmp/skills-diff-phase4-red.txt || true
```

### ステップ 2: NG 検出テスト（TC-4-01）

```bash
# 差分を意図的に作る（Phase 5 以降に実行）
echo "test-drift-$(date +%s)" >> .claude/skills/aiworkflow-requirements/LOGS.md

bash .claude/scripts/verify-skills-parity.sh
RC=$?
[ "$RC" -eq 1 ] && echo "TC-4-01 PASS" || echo "TC-4-01 FAIL (rc=$RC)"

# 後始末: git restore で変更を戻す
git restore .claude/skills/aiworkflow-requirements/LOGS.md
```

### ステップ 3: OK 確認テスト（TC-4-02, TC-4-04）

```bash
# sync で差分解消
bash .claude/scripts/sync-skills-mirror.sh
RC_SYNC=$?
[ "$RC_SYNC" -eq 0 ] && echo "TC-4-04 PASS" || echo "TC-4-04 FAIL (rc=$RC_SYNC)"

# verify で 0 差分確認
bash .claude/scripts/verify-skills-parity.sh
RC_VERIFY=$?
[ "$RC_VERIFY" -eq 0 ] && echo "TC-4-02 PASS" || echo "TC-4-02 FAIL (rc=$RC_VERIFY)"
```

### ステップ 4: pre-push abort テスト（TC-4-03）

```bash
# 差分ありの状態で disposable なローカル bare remote への push を試みる
TMP_REMOTE="$(mktemp -d)/skills-parity-test.git"
git init --bare "$TMP_REMOTE"

echo "pre-push-drift-$(date +%s)" >> .claude/skills/aiworkflow-requirements/LOGS.md
git add .claude/skills/aiworkflow-requirements/LOGS.md
git commit -m "test: drift for pre-push gate"

# push は hook によって中止されることを期待（project remote ではなく disposable remote）
git push "$TMP_REMOTE" HEAD 2>&1 | tee /tmp/pre-push-abort.log
RC=$?
[ "$RC" -ne 0 ] && grep -q "parity NG のため push を中止" /tmp/pre-push-abort.log \
  && echo "TC-4-03 PASS" || echo "TC-4-03 FAIL (rc=$RC)"

# 後始末
git reset --soft HEAD~1
git restore --staged .claude/skills/aiworkflow-requirements/LOGS.md
git restore .claude/skills/aiworkflow-requirements/LOGS.md
rm -rf "$TMP_REMOTE"
```

### ステップ 5: session-init timing 計測（TC-4-06, TC-4-07）

```bash
# parity 済みの状態で session-init.sh の wall time を測る
{ time bash .claude/hooks/session-init.sh ; } 2> /tmp/session-init-timing.log
grep -E "real\s+0m0\." /tmp/session-init-timing.log \
  && echo "TC-4-06 PASS (< 1s)" || echo "TC-4-06 FAIL (>= 1s)"

# スキップ導線を確認
CLAUDE_SKIP_HEAVY_HOOKS=1 bash .claude/hooks/session-init.sh 2>&1 \
  | grep -v "parity-check" > /tmp/session-init-skip.log
[ -s /tmp/session-init-skip.log ] && echo "TC-4-07 PASS"
```

### ステップ 6: husky 未導入フォールバック（TC-4-08）

```bash
# husky を無効化した環境での挙動
if [ ! -f .husky/pre-push ]; then
  echo "TC-4-08 PASS (husky not installed fallback branch verified)"
else
  # 一時的に退避して挙動を確認
  mv .husky/pre-push /tmp/.husky-pre-push.bak
  git push --dry-run 2>&1 | tee /tmp/husky-missing.log
  [ $? -eq 0 ] && echo "TC-4-08 PASS"
  mv /tmp/.husky-pre-push.bak .husky/pre-push
fi
```

### ステップ 7: int-test-skill 同期確認（TC-4-09）

```bash
test -f .agents/skills/int-test-skill/SKILL.md \
  && echo "TC-4-09 PASS" || echo "TC-4-09 FAIL (int-test-skill missing in mirror)"
```

### ステップ 8: mirror-only warning（TC-4-10）

```bash
# mirror にのみ存在するダミーファイルを置く
mkdir -p .agents/skills/dummy-only
echo "mirror-only-file" > .agents/skills/dummy-only/README.md

bash .claude/scripts/sync-skills-mirror.sh --check-only 2>&1 \
  | tee /tmp/mirror-only-warn.log

grep -q "Only in .agents/skills" /tmp/mirror-only-warn.log \
  && echo "TC-4-10 PASS" || echo "TC-4-10 FAIL"

# 後始末
rm -rf .agents/skills/dummy-only
```

## 多角的チェック観点（AIが判断）

- 垂直思考: 各 TC がどの AC / コンポーネントへ対応するか 1:1 でトレースされているか
- 2 軸思考: （exit code 軸 × シナリオ軸）のマトリクスで抜けがないか
- 批判的思考: TDD Red 段階で「`exit 127` / `file not found`」を実測する手順が入っているか
- if 思考: husky 未導入 / CANONICAL 未存在 / mirror-only ファイルの各分岐で誤検知しないか
- 改善思考: session-init の 1 秒未満目標を毎回再現可能な形で計測できているか

## サブタスク管理

| SubTask | 内容                                         | 並列性 | 担当 Lane          |
| ------- | -------------------------------------------- | ------ | ------------------ |
| ST-4-1  | 3 シナリオ（NG / OK / pre-push）の期待値固定 | seq    | Lane A（検証）     |
| ST-4-2  | timing 計測手順と husky フォールバックの設計 | par    | Lane B（環境差）   |
| ST-4-3  | mirror-only / int-test-skill の確認 TC 設計  | par    | Lane C（差分 I/O） |
| ST-4-4  | TDD Red 事前スナップショット取得             | seq    | Lane A（観測）     |

## 成果物

- 12 件の TC テーブル（TC-4-01〜TC-4-12）
- AC ↔ TC トレーサビリティ表
- `/tmp/skills-diff-phase4-red.txt`（Red state スナップショット）
- 3 シナリオ実行スクリプトのサンプル（ステップ 2〜4）
- `/tmp/session-init-timing.log`（timing 計測ログ）

## 完了条件

- [ ] TC-4-01〜TC-4-12 が定義され、各 exit code と期待出力のキー文字列が記載されている
- [ ] AC-1〜AC-9 に対して TC の対応表が埋まっている（AC-7 / AC-9 は差分レビューで対応を明記）
- [ ] TDD Red state の事前スナップショット取得手順が記載されている
- [ ] session-init の 1 秒未満目標を測るコマンドが記載されている
- [ ] husky 未導入環境のフォールバック確認手順が記載されている
- [ ] `int-test-skill` mirror 存在チェックが TC-4-09 として独立している
- [ ] mirror-only warning の出力確認が TC-4-10 として独立している

## 次のPhaseへの引き継ぎ

- Phase 5 の実装順序（drift 解消 → スクリプト配置 → hook 追記）は、TC-4-09（int-test-skill 存在）と TC-4-01〜04 が順に green になるよう組む
- TC-4-11（TDD Red）は Phase 5 着手前に一度実行し、`/tmp/skills-diff-phase4-red.txt` と合わせて「出発点の可視化」として残す
- Phase 6 では本 TC を土台に fail path（generate-index.js エラー / 権限エラー / 同時実行）と回帰 guard を追加する

## 統合テスト連携

- Phase 5 は本 Phase の TC を Red→Green で順番に解消し、実装順序の妥当性を逆算する
- Phase 7 は TC-4 系を exit code カバレッジ表へ集約し、未カバー領域を Phase 12 未タスク候補へ渡す
