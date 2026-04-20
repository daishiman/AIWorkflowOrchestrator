# Phase 5: 実装

## メタ情報

| 項目      | 値                               |
| --------- | -------------------------------- |
| Phase     | 5                                |
| 機能名    | TASK-AGENTS-SKILLS-FULL-SYNC-001 |
| 作成日    | 2026-04-19                       |
| 前提Phase | Phase 1 / 2 / 3 / 4 完了         |
| TDD state | Red → Green へ遷移               |

## 目的

Phase 4 で Red 状態にある 12 テストを順番に Green にするため、**drift 解消を先、ガード導入を後**の厳格な順序で、以下 4 つのアーティファクトを配置する。

1. `.claude/scripts/verify-skills-parity.sh`（検出専用）
2. `.claude/scripts/sync-skills-mirror.sh`（検出 + 修復）
3. `.husky/pre-push` への追記
4. `.claude/hooks/session-init.sh` への追記

同時に、既存 drift 6 ファイルと `int-test-skill` の mirror への初回同期を行う。

## 実行タスク

1. 初回 rsync で drift 6 ファイルを解消する
2. `int-test-skill` を mirror へ同期する
3. `verify-skills-parity.sh` を配置する
4. `sync-skills-mirror.sh` を配置する
5. `.husky/pre-push` に parity gate を追記する
6. `.claude/hooks/session-init.sh` に parity warning を追記する
7. `generate-index.js --quiet` を再実行し indexes を deterministic に揃える

## 新規作成 / 修正ファイル一覧

| 種別               | パス                                                                           | 変更内容                                                                     |
| ------------------ | ------------------------------------------------------------------------------ | ---------------------------------------------------------------------------- |
| 新規作成           | `.claude/scripts/verify-skills-parity.sh`                                      | `diff -qr` による parity 検出専用スクリプト。exit 0/1/0(skip)                |
| 新規作成           | `.claude/scripts/sync-skills-mirror.sh`                                        | generate-index + rsync + 再 diff の 3 段実行。`--check-only` で read-only 化 |
| 修正               | `.husky/pre-push`                                                              | 末尾に parity gate ブロックを追記（既存 hook を上書きしない）                |
| 修正               | `.claude/hooks/session-init.sh`                                                | `merge.ours.driver` 未設定警告の直後に parity warning を追記                 |
| 新規同期           | `.agents/skills/int-test-skill/`（SKILL.md および付随ファイル一式）            | `.claude/skills/int-test-skill/` の丸ごと rsync                              |
| 更新（drift 解消） | `.agents/skills/aiworkflow-requirements/LOGS.md`                               | canonical と同一内容へ上書き                                                 |
| 更新（drift 解消） | `.agents/skills/aiworkflow-requirements/indexes/resource-map.md`               | rsync 後に `generate-index.js --quiet` で再生成                              |
| 更新（drift 解消） | `.agents/skills/aiworkflow-requirements/references/task-workflow-completed.md` | canonical と同一内容へ上書き                                                 |
| 更新（drift 解消） | `.agents/skills/skill-creator/SKILL.md`                                        | canonical と同一内容へ上書き                                                 |
| 更新（drift 解消） | `.agents/skills/skill-creator/references/knowledge-management-guide.md`        | canonical と同一内容へ上書き                                                 |
| 更新（drift 解消） | `.agents/skills/skill-creator/scripts/generate_skill_md.js`                    | canonical と同一内容へ上書き                                                 |

> 本 Phase で **`.gitattributes` / `EVALS.json` は一切変更しない**（AC-7 / AC-9）。

## 参照資料

| 資料名                   | パス                                                                                      | 用途                               |
| ------------------------ | ----------------------------------------------------------------------------------------- | ---------------------------------- |
| Phase 2 設計             | `phase-02-design.md`                                                                      | C-1〜C-5 の exit code 契約と実行順 |
| Phase 4 テスト仕様       | `phase-04-test-creation.md`                                                               | TC-4-01〜12 の Green 化目標        |
| Issue #2278 実装サンプル | `docs/30-workflows/unassigned-task/TASK-AGENTS-SKILLS-FULL-SYNC-001.md`（Phase 3-1〜3-4） | bash 構造サンプルの原本            |
| post-merge hook          | `.claude/hooks/post-merge-index-regenerate.sh`                                            | shell script 書式の参考            |
| setup-merge-drivers      | `.claude/scripts/setup-merge-drivers.sh`                                                  | `set -euo pipefail` 適用例の参考   |

### システム仕様（aiworkflow-requirements）

| 参照資料                | パス                                                                 | 内容                                     |
| ----------------------- | -------------------------------------------------------------------- | ---------------------------------------- |
| canonical / mirror 責務 | `.claude/skills/aiworkflow-requirements/references/task-workflow.md` | `.claude` 正本、`.agents` 派生の運用原則 |
| generate-index 契約     | `.claude/skills/aiworkflow-requirements/scripts/generate-index.js`   | `--quiet` フラグと deterministic output  |

## 実装順序（厳守）

Phase 3 設計レビューで「drift 解消 → script 配置 → hook 配置」の順序を固定済み。**逆順で実装するとガード自身が既存 drift で失敗して Phase 5 が停止する**ため厳守する。

| ステップ | 内容                                 | 根拠                                                 |
| -------- | ------------------------------------ | ---------------------------------------------------- |
| 1        | drift 解消（初回 rsync）             | Phase 4 TC-4-02（OK 確認）を Green にする前提        |
| 2        | `int-test-skill` 同期                | TC-4-09 を Green にする前提（AC-5）                  |
| 3        | `verify-skills-parity.sh` 配置       | TC-4-01 / TC-4-02 / TC-4-12 の実行基盤               |
| 4        | `sync-skills-mirror.sh` 配置         | TC-4-04 / TC-4-05 / TC-4-10 の実行基盤               |
| 5        | `.husky/pre-push` 追記               | TC-4-03 / TC-4-08 の実行基盤                         |
| 6        | `.claude/hooks/session-init.sh` 追記 | TC-4-06 / TC-4-07 の実行基盤                         |
| 7        | `generate-index.js --quiet` 再実行   | rsync 後の indexes deterministic 化、AC-3 の最終確認 |

## 実行手順

### ステップ 1: drift 解消の初回 rsync

```bash
set -euo pipefail
REPO_ROOT="$(git rev-parse --show-toplevel)"
cd "$REPO_ROOT"

# Phase 1 で取得した snapshot と照合するため再取得
diff -qr .claude/skills .agents/skills 2>/dev/null \
  | tee /tmp/skills-diff-phase5-before.txt || true

# mirror-only ファイルを事前に確認（独自変更がないこと）
grep "^Only in .agents/skills" /tmp/skills-diff-phase5-before.txt \
  | tee /tmp/skills-only-mirror-phase5.txt
# 出力が空、または確認済み項目のみであることを目視で判定

# canonical → mirror の完全ミラー
rsync -av --delete .claude/skills/ .agents/skills/
```

### ステップ 2: int-test-skill の同期確認

```bash
# rsync に含まれて同期されているはず
test -f .agents/skills/int-test-skill/SKILL.md \
  && echo "[OK] int-test-skill synced to mirror" \
  || { echo "[FAIL] int-test-skill missing"; exit 1; }
```

### ステップ 3: verify-skills-parity.sh の配置

ファイル: `.claude/scripts/verify-skills-parity.sh`

```bash
#!/usr/bin/env bash
# verify-skills-parity.sh
# .claude/skills（canonical）と .agents/skills（mirror）の完全パリティを検証
# exit 0: parity OK、または両 root 不在（bootstrap skip）
# exit 1: parity NG、または mirror root 欠損

set -euo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel)"
CANONICAL="$REPO_ROOT/.claude/skills"
MIRROR="$REPO_ROOT/.agents/skills"

if [ ! -d "$CANONICAL" ] && [ ! -d "$MIRROR" ]; then
  echo "[parity-check] SKIP: skills root が未配置です"
  exit 0
fi

if [ ! -d "$CANONICAL" ]; then
  echo "[parity-check] SKIP: canonical root が未配置です"
  exit 0
fi

if [ ! -d "$MIRROR" ]; then
  echo "[parity-check] NG: mirror root が存在しません"
  echo "修正方法: bash .claude/scripts/sync-skills-mirror.sh"
  exit 1
fi

DIFF_OUTPUT=$(diff -qr "$CANONICAL" "$MIRROR" 2>/dev/null || true)

if [ -z "$DIFF_OUTPUT" ]; then
  echo "[parity-check] OK: .claude/skills と .agents/skills に差分はありません"
  exit 0
fi

echo "[parity-check] NG: 以下の差分が検出されました:"
echo "$DIFF_OUTPUT"
echo ""
echo "修正方法: bash .claude/scripts/sync-skills-mirror.sh"
exit 1
```

配置後:

```bash
chmod +x .claude/scripts/verify-skills-parity.sh
```

### ステップ 4: sync-skills-mirror.sh の配置

ファイル: `.claude/scripts/sync-skills-mirror.sh`

```bash
#!/usr/bin/env bash
# sync-skills-mirror.sh
# canonical → mirror の完全同期 + generate-index 再生成 + 最終 parity 確認
# 引数:
#   --check-only: rsync を実行せず diff -qr を行い、差分の有無を exit 0/1 で返す

set -euo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel)"
CANONICAL="$REPO_ROOT/.claude/skills"
MIRROR="$REPO_ROOT/.agents/skills"
GEN_INDEX="$CANONICAL/aiworkflow-requirements/scripts/generate-index.js"
CHECK_ONLY="${1:-}"

if [ ! -d "$CANONICAL" ] && [ ! -d "$MIRROR" ]; then
  echo "[mirror-sync] SKIP: skills root が未配置です"
  exit 0
fi

mkdir -p "$MIRROR"

# --check-only: read-only 確認モード
if [ "$CHECK_ONLY" = "--check-only" ]; then
  diff -qr "$CANONICAL" "$MIRROR" 2>/dev/null
  exit $?
fi

# mirror-only ファイル warning（--delete で消える前に可視化）
MIRROR_ONLY=$(diff -qr "$CANONICAL" "$MIRROR" 2>/dev/null \
  | grep "^Only in $MIRROR" || true)
if [ -n "$MIRROR_ONLY" ]; then
  echo "[mirror-sync] warning: mirror にのみ存在するファイル（rsync --delete で削除されます）:"
  echo "$MIRROR_ONLY"
fi

echo "[mirror-sync] rsync 開始: canonical → mirror"
rsync -av --delete "$CANONICAL/" "$MIRROR/"

echo "[mirror-sync] index 再生成中..."
node "$GEN_INDEX" --quiet

echo "[mirror-sync] parity 最終確認..."
DIFF_FINAL=$(diff -qr "$CANONICAL" "$MIRROR" 2>/dev/null || true)
if [ -z "$DIFF_FINAL" ]; then
  echo "[mirror-sync] 完了: parity OK"
  exit 0
fi
echo "[mirror-sync] 警告: 再生成後も差分が残っています:"
echo "$DIFF_FINAL"
exit 1
```

配置後:

```bash
chmod +x .claude/scripts/sync-skills-mirror.sh
```

### ステップ 5: pre-push hook への追記

ファイル: `.husky/pre-push` 末尾へ以下のブロックを追加する（既存行を上書きしない）。

```bash
# ---- TASK-AGENTS-SKILLS-FULL-SYNC-001: skills parity gate ----
PARITY_SCRIPT="$(git rev-parse --show-toplevel)/.claude/scripts/verify-skills-parity.sh"
if [ -f "$PARITY_SCRIPT" ]; then
  bash "$PARITY_SCRIPT" || {
    echo ""
    echo "[pre-push] parity NG のため push を中止します。"
    echo "  修正: bash .claude/scripts/sync-skills-mirror.sh"
    exit 1
  }
fi
# ---- end parity gate ----
```

注意:

- `--no-verify` を迂回導線として案内してはならない（CLAUDE.md ルール）
- `PARITY_SCRIPT` が未存在の worktree（機能未同期ブランチ）では pre-push 自体を壊さない

### ステップ 6: session-init.sh への追記

ファイル: `.claude/hooks/session-init.sh` で、既存の `merge.ours.driver` 未設定警告ブロックの直後に以下を追記する。

```bash
# ---- TASK-AGENTS-SKILLS-FULL-SYNC-001: parity warning ----
if [ "${CLAUDE_SKIP_HEAVY_HOOKS:-0}" != "1" ]; then
  PARITY_SCRIPT="$PROJECT_DIR/.claude/scripts/verify-skills-parity.sh"
  if [ -f "$PARITY_SCRIPT" ]; then
    PARITY_RESULT=$(bash "$PARITY_SCRIPT" 2>&1 || true)
    if echo "$PARITY_RESULT" | grep -q "NG"; then
      echo "⚠️  [session-init] .agents/skills が .claude/skills と差分があります。"
      echo "   修正: bash .claude/scripts/sync-skills-mirror.sh"
    fi
  fi
fi
# ---- end parity warning ----
```

注意:

- session-init は **blocking にしない**（warning のみ）
- `CLAUDE_SKIP_HEAVY_HOOKS=1` の時は parity check 自体を走らせない（1 秒未満目標の保険）

### ステップ 7: indexes の最終再生成

```bash
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js --quiet

# 最終 parity 確認
bash .claude/scripts/verify-skills-parity.sh
# 期待: exit 0 かつ "[parity-check] OK: ..."
```

## 設計決定の再確認

### canonical 更新 → mirror 同期の順序

- canonical（`.claude/skills/`）を先に編集し、その後 `sync-skills-mirror.sh` で mirror を上書きする
- 逆順（mirror 先行）は rsync `--delete` により必ず破壊される

### `set -euo pipefail` 必須

- `-e`: コマンド失敗時に即終了
- `-u`: 未定義変数参照でエラー
- `-o pipefail`: パイプ中間の失敗を捕捉
- 3 つとも欠けると「rsync は成功したが generate-index で落ちた」ケースを exit 0 と誤報告しうる

### rsync `--delete` の慎重運用

- 事前に `Only in $MIRROR` を列挙し stderr へ warning する
- mirror-only ファイルが独自変更（ユーザー作業）を含む場合は、canonical へ移してから rsync する運用を session-init / ドキュメントで案内する

## 想定される苦戦箇所

| 予想される苦戦                                   | 原因                                                                      | 対処                                                                                    |
| ------------------------------------------------ | ------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `rsync --delete` による mirror 独自ファイル消失  | mirror-only を事前確認せず実行                                            | ステップ 1 で `/tmp/skills-only-mirror-phase5.txt` を必ず目視確認する                   |
| `generate-index.js` 再実行で差分が出続ける       | canonical / mirror どちらか片方だけ再生成 / 実行タイミングが rsync より前 | 必ず rsync → generate-index → diff の順序で固定する                                     |
| `.husky/pre-push` の既存行を上書きして hook 破壊 | `>` で上書きした / sed の指定ミス                                         | `>>` で追記し、コメント `---- end parity gate ----` で領域を明示する                    |
| session-init が 1 秒を超える                     | `diff -qr` が大規模ディレクトリ走査                                       | `CLAUDE_SKIP_HEAVY_HOOKS=1` のガード分岐を先頭に置く（heavy check に入らないで return） |
| pre-push で `--no-verify` 迂回を案内してしまう   | エラーメッセージの誤記                                                    | 出力文字列は `修正: bash .claude/scripts/sync-skills-mirror.sh` のみに限定する          |

## 多角的チェック観点（AIが判断）

- 演繹思考: 実装内容が Phase 2 の C-1〜C-5 契約から逸脱していないか
- 因果関係分析: 「drift 解消前にガード導入 → ガードが既存 drift で失敗」の因果を順序で遮断できているか
- 逆説思考: スクリプトを丁寧に作るほど `--no-verify` 誘惑が生まれないよう、skip 手段を全面的に封じているか
- 価値提案思考: generate-index + rsync + diff の 3 ステップで最小コストで parity 保証しているか
- 状態所有権: canonical → mirror の一方向のみで、逆方向が発生しないことを静的に保証しているか

## サブタスク管理

| SubTask | 内容                                       | 並列性 | 担当 Lane             |
| ------- | ------------------------------------------ | ------ | --------------------- |
| ST-5-1  | drift 解消初回 rsync + int-test-skill 同期 | seq    | Lane A（observation） |
| ST-5-2  | `verify-skills-parity.sh` 配置             | seq    | Lane B（script）      |
| ST-5-3  | `sync-skills-mirror.sh` 配置               | seq    | Lane B（script）      |
| ST-5-4  | `.husky/pre-push` 追記                     | par    | Lane C（hook）        |
| ST-5-5  | `session-init.sh` 追記                     | par    | Lane C（hook）        |
| ST-5-6  | indexes 再生成と最終 parity 確認           | seq    | Lane A（observation） |

## 成果物

- `.claude/scripts/verify-skills-parity.sh`（新規、実行権付与済み）
- `.claude/scripts/sync-skills-mirror.sh`（新規、実行権付与済み）
- `.husky/pre-push` の diff（追記のみ）
- `.claude/hooks/session-init.sh` の diff（追記のみ）
- `.agents/skills/int-test-skill/` ディレクトリ（同期済み）
- `/tmp/skills-diff-phase5-before.txt` / `/tmp/skills-diff-phase5-after.txt`
- `diff -qr .claude/skills .agents/skills` = 空出力のエビデンスログ

## 完了条件

- [ ] 初回 rsync で drift 6 ファイルが解消されている
- [ ] `.agents/skills/int-test-skill/SKILL.md` が存在する
- [ ] `.claude/scripts/verify-skills-parity.sh` が配置され実行権が付いている
- [ ] `.claude/scripts/sync-skills-mirror.sh` が配置され実行権が付いている
- [ ] `.husky/pre-push` に parity gate ブロックが追記されている（既存 hook 非破壊）
- [ ] `.claude/hooks/session-init.sh` に parity warning が追記されている（`CLAUDE_SKIP_HEAVY_HOOKS=1` 分岐あり）
- [ ] `generate-index.js --quiet` 実行後に `diff -qr .claude/skills .agents/skills` が空出力
- [ ] すべてのスクリプトに `set -euo pipefail` が入っている
- [ ] `.gitattributes` / `EVALS.json` が変更されていない

## 次のPhaseへの引き継ぎ

- Phase 6 では fail path（generate-index.js エラー / 権限エラー / 同時実行）と回帰 guard を追加する
- `/tmp/skills-diff-phase5-before.txt` と空出力後の差分を snapshot 比較に使う（Phase 6 で参照）
- Phase 4 の TC-4-01〜TC-4-12 が全て Green であることを Phase 6 冒頭で再確認する

## 統合テスト連携

- Phase 4 の TC-4-01〜TC-4-12 を本 Phase で Green 化し、Phase 6 で fail path を拡張する
- Phase 9 は本 Phase の実装アーティファクトと mirror parity の最終実測を品質レポートへ束ねる
