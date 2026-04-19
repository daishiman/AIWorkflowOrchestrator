# Phase 11: 手動テスト結果（primary evidence）

本 Phase は NON_VISUAL タスクのため、視覚証跡ではなく `git check-attr` 実測と一時 git リポジトリ上のマージシミュレーション結果を primary evidence とする。

## 0. 実行環境

| 項目             | 値                                                             |
| ---------------- | -------------------------------------------------------------- |
| 実行日           | 2026-04-19                                                     |
| プラットフォーム | macOS (Darwin 25.3.0 / x86_64)                                 |
| Git バージョン   | git version 2.38.1                                             |
| Shell            | zsh / GNU bash 3.2.57 (互換テスト)                             |
| 一時 repo        | `/var/folders/.../T/gitattr-mt.XXXXXX/`（mktemp -d）           |
| .gitattributes   | Phase 8 リファクタリング後（48 行 / 20 エントリ / mirror 9+9） |

## 1. 視覚証跡

**UI/UX変更なしのため Phase 11 スクリーンショット不要**（NON_VISUAL ポリシー）。

`screenshots/.gitkeep` は意図的に作成しない。

代替証跡:

- [`outputs/phase-10/final-review-result.md`](../phase-10/final-review-result.md) — Phase 10 最終レビュー結果
- [`outputs/phase-11/manual-test-result.md`](./manual-test-result.md) — 本ファイル（実測ログ集約）
- [`outputs/phase-11/logs/`](./logs/) — `git merge` stderr ログ（実測生ログ）

## 2. 事前確認: `git check-attr merge` 実測

一時 repo に本リポの `.gitattributes` を配置し、代表ファイルに対する merge attribute を確認。

```bash
$ git check-attr merge -- \
    .claude/skills/test-skill/LOGS.md \
    .claude/skills/test-skill/references/task-workflow.md \
    .claude/skills/test-skill/references/LOGS.md \
    .claude/skills/test-skill/references/lessons-learned-current.md \
    .claude/skills/test-skill/indexes/topic-map.json
.claude/skills/test-skill/LOGS.md: merge: union
.claude/skills/test-skill/references/task-workflow.md: merge: unspecified
.claude/skills/test-skill/references/LOGS.md: merge: union
.claude/skills/test-skill/references/lessons-learned-current.md: merge: union
.claude/skills/test-skill/indexes/topic-map.json: merge: ours
```

| ファイル                                | 期待        | 実測        | 判定 |
| --------------------------------------- | ----------- | ----------- | ---- |
| `LOGS.md`（skill 直下）                 | union       | union       | ✅   |
| `references/task-workflow.md`（構造化） | unspecified | unspecified | ✅   |
| `references/LOGS.md`                    | union       | union       | ✅   |
| `references/lessons-learned-current.md` | union       | union       | ✅   |
| `indexes/topic-map.json`                | ours        | ours        | ✅   |

## 3. MT-01: `setup-merge-drivers.sh` 登録

### 3.1 手順

```bash
# driver 未登録状態を再現
$ git config --local --unset merge.ours.driver
$ git config --get merge.ours.driver
(unset)

# setup script 実行
$ bash .claude/scripts/setup-merge-drivers.sh
[setup-merge-drivers] merge.ours.driver = true を設定しました
[setup-merge-drivers] generated index のマージ後は以下を実行して再生成してください:
  node .claude/skills/aiworkflow-requirements/scripts/generate-index.js

# 登録確認
$ git config --get merge.ours.driver
true
```

### 3.2 判定

| 項目                                        | 期待                                      | 実測                 | 判定    |
| ------------------------------------------- | ----------------------------------------- | -------------------- | ------- |
| `git config --get merge.ours.driver` 戻り値 | `true`                                    | `true`               | ✅ PASS |
| stdout メッセージ                           | "merge.ours.driver = true を設定しました" | 一致                 | ✅ PASS |
| idempotency（2 回実行で差分なし）           | 差分なし                                  | 未実測（仕様上保証） | —       |

**→ AC-3 充足確認**

## 4. MT-02: 構造化ファイル並列編集（default 3-way）

### 4.1 手順

```bash
# base コミット
$ cat > .claude/skills/test-skill/references/task-workflow.md <<'EOF'
# Task Workflow
## Section 1
initial content line.
## Section 2
another line.
EOF
$ git commit -am "add workflow"

# feature-a: Section 1 行を改変
$ git checkout -b wf-a
$ sed -i '' 's/initial content line./initial content line modified by feature-a./' ...
$ git commit -am "wf A"

# feature-b: 同じ行を別の内容で改変
$ git checkout -b wf-b main
$ sed -i '' 's/initial content line./initial content line modified by feature-b./' ...
$ git commit -am "wf B"

# main へ両ブランチをマージ
$ git checkout main
$ git merge wf-a --no-edit      # クリーン
$ git merge wf-b --no-edit      # conflict 発生
Auto-merging .claude/skills/test-skill/references/task-workflow.md
CONFLICT (content): Merge conflict in .claude/skills/test-skill/references/task-workflow.md
Automatic merge failed; fix conflicts and then commit the result.
```

### 4.2 結果

```
# Task Workflow
## Section 1
<<<<<<< HEAD
initial content line modified by feature-a.
||||||| eb4da01
initial content line.
=======
initial content line modified by feature-b.
>>>>>>> wf-b

## Section 2
another line.
```

### 4.3 判定

| 項目                               | 期待        | 実測        | 判定    |
| ---------------------------------- | ----------- | ----------- | ------- |
| merge attribute                    | unspecified | unspecified | ✅ PASS |
| merge exit code                    | 非ゼロ      | 1           | ✅ PASS |
| conflict marker (`<<<<<<<` 等)     | ≥ 3         | 3           | ✅ PASS |
| 「重複行」出現（union 誤適用兆候） | 0           | 0           | ✅ PASS |

**→ AC-1 充足確認 / TC-02 PASS**

## 5. MT-03: append-only 並列追記（merge=union）

### 5.1 手順

```bash
# base
$ echo "# LOGS" > .claude/skills/test-skill/LOGS.md
$ echo "- entry 0" >> .claude/skills/test-skill/LOGS.md
$ git commit -am "init"

# feature-a: 末尾に entry A を追記
$ git checkout -b feature-a
$ echo "- entry A (from feature-a)" >> .claude/skills/test-skill/LOGS.md
$ git commit -am "entry A"

# feature-b: 末尾に entry B を追記
$ git checkout -b feature-b main
$ echo "- entry B (from feature-b)" >> .claude/skills/test-skill/LOGS.md
$ git commit -am "entry B"

# main へ両ブランチをマージ
$ git checkout main
$ git merge feature-a --no-edit
$ git merge feature-b --no-edit
Auto-merging .claude/skills/test-skill/LOGS.md
```

### 5.2 結果

```
# LOGS
- entry 0
- entry A (from feature-a)
- entry B (from feature-b)
```

### 5.3 判定

| 項目            | 期待  | 実測  | 判定    |
| --------------- | ----- | ----- | ------- |
| merge attribute | union | union | ✅ PASS |
| merge exit code | 0     | 0     | ✅ PASS |
| conflict marker | 0     | 0     | ✅ PASS |
| `entry A` 残存  | ≥ 1   | 1     | ✅ PASS |
| `entry B` 残存  | ≥ 1   | 1     | ✅ PASS |

**→ AC-2 充足確認 / TC-01 / REG-02 PASS**

## 6. MT-04: `indexes/*.json` 並列編集（merge=ours, driver 登録済）

### 6.1 手順

```bash
# driver 登録状態
$ git config --get merge.ours.driver
true

# base
$ echo '{"version":0}' > .claude/skills/test-skill/indexes/topic-map.json
$ git commit -am "init json"

# feature-a / feature-b で別々に version を更新
$ git checkout -b idx-a && echo '{"version":1,"branch":"a"}' > ... && git commit -am "idx A"
$ git checkout -b idx-b main && echo '{"version":2,"branch":"b"}' > ... && git commit -am "idx B"

# main へマージ
$ git checkout main
$ git merge idx-a --no-edit
$ git merge idx-b --no-edit
Auto-merging .claude/skills/test-skill/indexes/topic-map.json
Merge made by the 'ort' strategy.
```

### 6.2 結果

```json
{ "version": 1, "branch": "a" }
```

（= main 側=feature-a を取り込んだ側の内容。feature-b の内容は捨てられた）

### 6.3 判定

| 項目                 | 期待                                | 実測                  | 判定    |
| -------------------- | ----------------------------------- | --------------------- | ------- |
| merge attribute      | ours                                | ours                  | ✅ PASS |
| merge exit code      | 0                                   | 0                     | ✅ PASS |
| 自ブランチ側内容採用 | main 側（=a）保持                   | `{"branch":"a"}` 保持 | ✅ PASS |
| conflict marker      | 0                                   | 0                     | ✅ PASS |
| 再生成手順案内       | setup-merge-drivers.sh で案内出力済 | 案内あり              | ✅ PASS |

**→ AC-3 挙動面の充足確認 / TC-03 PASS**

### 6.4 再生成スクリプト案内

`setup-merge-drivers.sh` 実行時の最後に表示される:

```
[setup-merge-drivers] generated index のマージ後は以下を実行して再生成してください:
  node .claude/skills/aiworkflow-requirements/scripts/generate-index.js
```

これにより「ours で捨てた側の更新を復元する手順」がユーザーに提示される。

### 6.5 same-wave 再生成の実測

一時 repo 上での簡易再生では generator 本体を持ち込まないため、復旧手順そのものはワークツリー root で追加確認した。

```bash
$ node .claude/skills/aiworkflow-requirements/scripts/generate-index.js
📚 インデックス生成中...
1. トピックマップ生成...
   ✅ indexes/topic-map.md
2. キーワード索引生成...
   ✅ indexes/keywords.json (3149キーワード)
✅ インデックス生成完了
```

**確認結果**:

- `merge=ours` 対象の generated index は再生成コマンドで復旧可能
- 本タスクの same-wave sync として `.claude/skills/aiworkflow-requirements/indexes/topic-map.md` を再生成済み
- `keywords.json` は再生成したが内容差分なし

## 7. FAIL-01（補助）: driver 未登録時のフォールバック

### 7.1 手順

```bash
# driver unset で再試験
$ git config --local --unset merge.ours.driver
$ git config --get merge.ours.driver
(unset)

# 同パターンで並列編集
$ git merge idx-c --no-edit
$ git merge idx-d --no-edit 2>stderr.log
Auto-merging .claude/skills/test-skill/indexes/topic-map.json
CONFLICT (content): Merge conflict in .claude/skills/test-skill/indexes/topic-map.json
Automatic merge failed; fix conflicts and then commit the result.
```

### 7.2 結果

```
<<<<<<< HEAD
{"version":1,"branch":"c"}
||||||| a4ac277
{"version":0,"shared":"base"}
=======
{"version":2,"branch":"d"}
>>>>>>> idx-d
```

`stderr.log` は空。

### 7.3 判定

| 項目                                              | Phase 6 予想                  | 実測                    | 判定              |
| ------------------------------------------------- | ----------------------------- | ----------------------- | ----------------- |
| stderr に warning (`failed to resolve 'ours'` 等) | 出現                          | 空（warning なし）      | ⚠️ 差異（MEDIUM） |
| exit code                                         | 0（fallback）or 1（conflict） | 1（conflict）           | ✅ 予想範囲内     |
| conflict marker                                   | 発生可能                      | 3 件                    | ✅ PASS           |
| マージ破損                                        | なし                          | なし（conflict で停止） | ✅ PASS           |

**実質的な挙動**: driver 未登録でも「静かに default 3-way へフォールバック」し、マージ破損は発生しない。
ただし Phase 6 仕様で想定した「stderr warning による検知」は Git 2.38 では発生しない。→ MEDIUM 発見事項として記録（`discovered-issues.md` 参照）。

## 8. MT-05: 環境確認（macOS / Linux-CI 委任）

### 8.1 macOS 実測

```
$ uname -a
Darwin 25.3.0 x86_64
$ git --version
git version 2.38.1
$ bash --version | head -1
GNU bash, version 3.2.57(1)-release (x86_64-apple-darwin25)
```

MT-01〜MT-04 が全て PASS。macOS 上では設計通りに機能することを確認。

### 8.2 Linux / CI 委任

- 本手動テストは macOS 上で実施。
- Linux / CI 環境での動作は CI ログに委ねる（`setup-merge-drivers.sh` は `bash` + `git config` のみ使用し POSIX 互換のため動作見込み）。
- `setup-merge-drivers.sh` 内に Linux 固有の非互換コマンドなし（`sed -i` のような BSD / GNU 差異コマンドも未使用）。

## 9. 総合判定

| MT / 項目 | 判定                                                    |
| --------- | ------------------------------------------------------- |
| MT-01     | ✅ PASS                                                 |
| MT-02     | ✅ PASS                                                 |
| MT-03     | ✅ PASS                                                 |
| MT-04     | ✅ PASS                                                 |
| MT-05     | ✅ PASS（Linux は CI 委任）                             |
| FAIL-01   | ⚠️ 発見事項（仕様 warning と挙動 warning の差異）MEDIUM |

**→ Phase 11 手動テスト結果: `PASS`（発見事項 1 件は MEDIUM で Phase 12 へ申し送り）**

### 9.1 LOW 補足（本ファイルでクローズ）

- DISC-LOW-01: `Merge made by the 'ort' strategy.` は `merge=ours` が `ort` の内部で正常動作したときの情報メッセージであり、追加対応不要

## 10. AC 充足状況（再確認）

| AC ID | 根拠                                         | Phase 11 での確認  |
| ----- | -------------------------------------------- | ------------------ |
| AC-1  | 構造化ファイル → unspecified / conflict 出現 | MT-02 ✅           |
| AC-2  | append-only → union / 両側残存               | MT-03 ✅           |
| AC-3  | setup-merge-drivers.sh → driver=true 登録    | MT-01 ✅           |
| AC-3+ | indexes/\*.json → ours で main 側採用        | MT-04 ✅           |
| AC-4  | `.gitattributes` コメント                    | Phase 8 静的確認済 |
| AC-5  | 判断ガイド文書化                             | Phase 12 完了待ち  |

## 11. 完了条件チェック

- [x] MT-01〜MT-05 を全て実行し、実測ログを本ファイルに記録
- [x] `## 視覚証跡` セクションに NON_VISUAL 明記
- [x] 代替証跡として Phase 10 / Phase 11 成果物を参照リンク化
- [x] `manual-test-checklist.md` を別途作成
- [x] `discovered-issues.md` を別途作成し HIGH / MEDIUM / LOW 分類
- [x] LOW 項目は本ファイル §9.1 に補足してクローズ
- [x] HIGH 項目はなし、MEDIUM 1 件は Phase 12 候補への申し送り
- [x] `screenshots/.gitkeep` を作成していない
- [x] `logs/` 配下に merge stderr 実測ログを保全

## 12. 成果物一覧

| パス                                              | 種別     | 内容                             |
| ------------------------------------------------- | -------- | -------------------------------- |
| `outputs/phase-11/manual-test-result.md`          | 新規作成 | 本ファイル（primary evidence）   |
| `outputs/phase-11/manual-test-checklist.md`       | 新規作成 | MT-01〜MT-05 チェックリスト      |
| `outputs/phase-11/discovered-issues.md`           | 新規作成 | 発見事項（HIGH/MEDIUM/LOW 分類） |
| `outputs/phase-11/logs/merge-stderr.log`          | 新規作成 | MT-02 merge stderr               |
| `outputs/phase-11/logs/merge-stderr-idx.log`      | 新規作成 | MT-04 merge stderr               |
| `outputs/phase-11/logs/merge-stderr-nodriver.log` | 新規作成 | FAIL-01 merge stderr             |
