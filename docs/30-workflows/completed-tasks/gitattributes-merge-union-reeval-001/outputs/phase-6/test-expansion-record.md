# Phase 6: テスト拡充記録

本 Phase ではコード変更を行わず、fail path / 回帰 guard / 補助コマンド仕様を Markdown で拡充する。

## 1. fail path

### FAIL-01: `merge.ours.driver` 未登録時のエラー観測

**シナリオ**: `setup-merge-drivers.sh` を実行せずに `indexes/<name>.json` を双方ブランチで変更してマージ。

**手順**:

```bash
WORKDIR=$(mktemp -d)
cd "$WORKDIR"
git init -q
git config user.email "test@local"
git config user.name "test"
cp <repo>/.gitattributes .gitattributes
# 故意に merge.ours.driver を未登録にする
git config --local --unset merge.ours.driver || true
mkdir -p indexes
echo '{"v":1}' > indexes/map.json
git add -A && git commit -m init -q
git checkout -b a -q && echo '{"v":2}' > indexes/map.json && git commit -am a -q
git checkout main -q && git checkout -b b main -q && echo '{"v":3}' > indexes/map.json && git commit -am b -q
git checkout main -q
git merge a --no-edit -q
git merge b --no-edit 2> stderr.log || true
cat stderr.log
```

**期待**:

- stderr に `failed to resolve 'ours'` または `unknown merge driver 'ours'` が出現
- exit code は 0（fallback 時）または 1（コンフリクト）のいずれか
- assert は `grep -qE "failed to resolve 'ours'|unknown merge driver" stderr.log` で両方を許容

**検出可否**: ✅ stderr grep で検出可能。Phase 11 MT-01 補助で実測。

### FAIL-02: glob から外したつもりが適用されているケースの検出

**シナリオ**: 構造化ファイル `task-workflow.md` に対して `git check-attr merge` が `union` を返さないこと。

**手順**:

```bash
cd <repo>
git check-attr merge -- \
  .claude/skills/aiworkflow-requirements/references/task-workflow.md \
  .claude/skills/aiworkflow-requirements/references/lessons-learned.md \
  .claude/skills/aiworkflow-requirements/references/api-core.md \
  .claude/skills/aiworkflow-requirements/references/arch-ipc-persistence.md \
  .claude/skills/task-specification-creator/references/phase-template-core.md
```

**期待**: 全て `merge: unspecified` を返す。`merge: union` を返したら FAIL。

**検出可否**: ✅ grep で判定可能。

**補助スクリプト（仕様のみ、実装は REC-01）**:

```bash
# append-only ホワイトリスト外で union が適用されているファイルを検出
ALLOW_LIST='(LOGS\.md$|SKILL-changelog\.md$|task-workflow-completed[^/]*\.md$|lessons-learned-[^/]*\.md$)'
find .claude/skills .agents/skills -path '*/references/*.md' \
  | while read f; do
      if [[ ! "$f" =~ $ALLOW_LIST ]]; then
        attr=$(git check-attr merge -- "$f" | awk '{print $NF}')
        [ "$attr" = "union" ] && echo "VIOLATION: $f"
      fi
    done
```

## 2. 回帰 guard

### REG-01: 新規 `references/<新ファイル>.md` 追加時の判断ガイド存在

**assert 手順**:

```bash
grep -cE '^# 新規ファイル追加判断' .gitattributes
# 期待: >= 3（append-only 2グループ + auto-generated 1グループ = 3）
grep -cE '^# \[(C-[0-9]+|structured)' .gitattributes
# 期待: >= 4（C-1 / C-2 / C-3 / structured）
```

**既存ドキュメント連携**:

- Phase 12 `implementation-guide.md` Part 2 に「新規 references ファイルの分類フロー」を記載予定
- `index.md` 関連ドキュメントリンクから遷移可能

**判定**: ✅ Phase 5 `.gitattributes` 修正時点で PASS 済み（実測 `grep -c '新規ファイル追加判断' .gitattributes` = 3、`grep -c '^# \['` = 4）

### REG-02: `LOGS.md` 並列追記が引き続き `merge=union` で破綻しないこと

**シナリオ**: TC-01 と同一手順を Phase 5 修正後 `.gitattributes` で再実行。

**手順**: TC-01 の bash スクリプトをそのまま流用。`--gitattributes <repo>/.gitattributes` で最新版を参照。

**期待**:

- `LOGS.md` に `entry A` と `entry B` の両行が残る
- conflict marker ゼロ

**判定**: Phase 5 修正が `.claude/skills/*/LOGS.md merge=union` を維持しているため PASS 見込み。Phase 11 MT-03 で実測。

### REG-03: `setup-merge-drivers.sh` 冒頭コメント変更が機能を破壊していない

**assert 手順**:

```bash
bash .claude/scripts/setup-merge-drivers.sh
# stdout: "merge.ours.driver = true を設定しました" が出力される
git config --get merge.ours.driver
# 期待: true
```

**実測（Phase 5 の verify ログより）**:

```
[setup-merge-drivers] merge.ours.driver = true を設定しました
...
true
```

**判定**: ✅ PASS（Phase 5 verify ログに記録済み）

## 3. 補助コマンド仕様（`scripts/check-gitattributes.sh`）

**※ 本タスクでは実装しない**。仕様のみを確定し、REC-01 として Issue 起票候補化。

### 3.1 責務

1. `.gitattributes` を逆引きし、append-only ホワイトリストに無いファイルへ
   `merge=union` が適用されていないか検出。
2. `indexes/*.json` / `indexes/*.md` / `EVALS.json` 全件に対し `merge=ours` が
   適用されているか確認。
3. mirror parity（`.claude/skills/*` ↔ `.agents/skills/*`）の対称性をチェック。

### 3.2 入出力契約

| 引数           | 必須 | 説明                                                                   |
| -------------- | ---- | ---------------------------------------------------------------------- |
| `--repo <dir>` | -    | チェック対象リポジトリルート（省略時 `git rev-parse --show-toplevel`） |
| `--strict`     | -    | 警告も FAIL 扱いに                                                     |
| `--json`       | -    | JSON 形式で出力                                                        |

**出力フォーマット**: 1 行 1 違反、`<severity>\t<file>\t<reason>`

**終了コード**: 0 = OK、1 = 違反あり、2 = 設定読み込み失敗

### 3.3 依存

- `git check-attr`
- `find`（`fd` フォールバックあり）
- bash 4+ or zsh

### 3.4 実行頻度

- CI 任意（オプトイン）
- pre-commit hook 任意（大規模リポジトリでは遅延あり）

### 3.5 スコープ外宣言

- 本タスクでは実装しない
- **REC-01** として Issue 起票候補リストに追加

## 4. Phase 7 引継ぎチェックリスト

| ID      | 種別 | 対象                        | 期待結果                | 現時点ステータス           |
| ------- | ---- | --------------------------- | ----------------------- | -------------------------- |
| TC-01   | 挙動 | `LOGS.md` 並列追記          | union 結合 / conflict 0 | 未実行（Phase 11）         |
| TC-02   | 挙動 | `task-workflow.md` 並列編集 | conflict marker >= 1    | 未実行（Phase 11）         |
| TC-03   | 挙動 | `indexes/*.json` ours       | main 側内容採用         | 未実行（Phase 11）         |
| TC-04   | 挙動 | ours 未登録時 fallback      | warning 出力            | 未実行（Phase 11）         |
| TC-05   | 静的 | `.gitattributes` コメント   | カテゴリ見出し >= 3     | **PASS（Phase 5 で確認）** |
| FAIL-01 | 挙動 | driver 未登録               | stderr に warning       | 未実行（Phase 11）         |
| FAIL-02 | 静的 | 構造化への union 漏出検出   | 違反 0 件               | **PASS（Phase 5 実測）**   |
| REG-01  | 静的 | 判断ガイドコメント          | grep 件数基準達成       | **PASS（Phase 5）**        |
| REG-02  | 挙動 | LOGS.md 回帰                | 継続 union              | 未実行（Phase 11）         |
| REG-03  | 実行 | `setup-merge-drivers.sh`    | driver=true 登録        | **PASS（Phase 5）**        |

### カバレッジ計算対象（Phase 7 用）

- 静的 assert: TC-05, FAIL-02, REG-01 → **3/3 PASS**
- 実行 assert: REG-03 → **1/1 PASS**
- 未実行（Phase 11 手動）: TC-01, TC-02, TC-03, TC-04, FAIL-01, REG-02 → Phase 7 カバレッジ計算から除外

## 5. 推奨 Issue 候補（REC-XX）

| REC ID | 内容                                                                       | 優先度 |
| ------ | -------------------------------------------------------------------------- | ------ |
| REC-01 | `scripts/check-gitattributes.sh` 実装（補助コマンド）                      | Medium |
| REC-02 | `setup-merge-drivers.sh` の `session-init.sh` からの自動呼び出し（候補 A） | Low    |
| REC-03 | 新規 references ファイルの分類宣言（front-matter 規約・候補 B）            | Medium |
| REC-04 | `.gitattributes` 向け CI check（mirror parity / 重複 / 順序）              | Medium |

## 6. 本 Phase でコード変更なし（確認）

- `.gitattributes` / `setup-merge-drivers.sh` / 他ソースファイル: **変更なし**
- 本 Phase の成果物: 本 Markdown のみ

## 7. 完了条件チェック

- [x] FAIL-01 / FAIL-02 記述
- [x] REG-01 / REG-02 / REG-03 記述
- [x] 補助コマンド仕様（スコープ外宣言含む）記述
- [x] TC + FAIL + REG を統合した引き継ぎチェックリスト作成
- [x] 本 Phase でコード変更なしを確認
