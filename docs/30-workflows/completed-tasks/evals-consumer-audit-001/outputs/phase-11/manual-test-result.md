# Phase 11 Manual Test Result (Primary Evidence)

> TASK-EVALS-CONSUMER-AUDIT-001 Phase 11 の **一次証跡**（docs-only / NON_VISUAL）。
> UI/UX 変更なしのため Phase 11 スクリーンショット不要。

---

## メタ情報

| 項目             | 内容                                                                                              |
| ---------------- | ------------------------------------------------------------------------------------------------- |
| task_id          | TASK-EVALS-CONSUMER-AUDIT-001                                                                     |
| phase            | 11                                                                                                |
| phase 名         | 監査結果の再現検証（NON_VISUAL / docs-only）                                                      |
| 実施日時 (UTC)   | 2026-04-19T09:29:41Z 〜 2026-04-19T09:31:48Z                                                      |
| 実施者           | Phase 11 第三者再実行エージェント（Claude Opus 4.7 / iteration #3）                               |
| 作業ブランチ     | `.worktrees/task-20260419-160952-wt-9`                                                            |
| 再実行位置付け   | Phase 4（初回）／Phase 7（第 2 回目）と独立した **第 3 回目の再実行**                             |
| primary evidence | 本ファイル（`docs/30-workflows/evals-consumer-audit-001/outputs/phase-11/manual-test-result.md`） |
| 補助成果物       | `reproduction-verification.md` / `manual-test-checklist.md` / `discovered-issues.md`              |
| ログディレクトリ | `docs/30-workflows/evals-consumer-audit-001/outputs/phase-11/logs/`                               |
| 判定結論         | **RC-1〜RC-5 全件 PASS / QG-10 PASS / 13 実行対象パス集合の差分 = 0**                             |
| AC 対応          | AC-8                                                                                              |
| QG 対応          | **QG-10（再現コマンド列挙の再実行で同じ 13 実行対象パス集合が得られる / 差分 0）**                |
| screenshot       | **UI/UX 変更なしのため Phase 11 スクリーンショット不要**                                          |

---

## 1. テスト対象と方針

### 1.1 対象

- Phase 5 `consumer-audit-report.md` から抽出した **13 実行対象パス集合**（A=1 / B=10 / C=2）。
- Phase 6 `dual-root-parity.md` 記載の **6 スキル完全一致（SHA-256 bit-for-bit）**。
- Phase 7 `coverage-recheck.md` 記載の **QG-6 PASS（unlisted-paths.txt = 0 行）**。
- Phase 10 `ac6-release-verdict.md` の **AC-6 解除判定 PASS** の再現性。

### 1.2 方針

- `task-specification-creator` Phase 11 テンプレ（v9.13.0 以降）に従い、`manual-test-result.md` を **一次証跡の正本**とする。
- NON_VISUAL タスクのため screenshot は不要。再現コマンド実行ログと diff 結果で証跡化。
- 再現コマンドは **Phase 2 §7.2 / consumer-audit-report.md §11 / Phase 7 §1 と完全同一**。
- 第三者視点として、Phase 4（初回）および Phase 7（第 2 回目）と独立に実行し、**iteration #3** として結果を照合。
- 集合比較は `grep -v '^#' | sort -u` → `comm -23` / `comm -13` の機械処理で、メタコメント（タイムスタンプ／working_directory／exit_status フッタ）の揺らぎを除外する。

---

## 2. 実施環境

| 項目               | 値                                                                                                              |
| ------------------ | --------------------------------------------------------------------------------------------------------------- |
| OS                 | Darwin 25.3.0（Darwin Kernel Version 25.3.0 / Wed Jan 28 20:54:46 PST 2026 / ARM64_T6000）                      |
| Shell              | `/bin/zsh`                                                                                                      |
| Node.js            | `v22.21.1`                                                                                                      |
| ripgrep            | `ripgrep 13.0.0`                                                                                                |
| diff               | Apple diff (based on FreeBSD diff)                                                                              |
| git working tree   | clean（`git status --short` は `?? docs/30-workflows/evals-consumer-audit-001/` のみ — 本タスクの未追跡成果物） |
| working directory  | `/Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator/.worktrees/task-20260419-160952-wt-9`                        |
| Phase 4 / 7 との差 | ripgrep バージョン同一（13.0.0）。EVALS.json / consumer コードは Phase 4 以降未変更（`git log` 相当で確認）     |

### 2.1 Step 0: 事前チェック

| 項目                                                        | 結果                                                       |
| ----------------------------------------------------------- | ---------------------------------------------------------- |
| `git status` で監査対象の途中変更が混入していないか         | ✅ clean（未追跡は本タスクの成果物ディレクトリのみ）       |
| Phase 5 / 6 / 7 / 8 / 10 の成果物が存在                     | ✅ 全 Phase のメイン成果物を存在確認                       |
| `rg --version` / `diff --version` / `node --version` を記録 | ✅ 上表に記録                                              |
| `.claude/skills/` と `.agents/skills/` の両 root が参照可能 | ✅ 両 root に 7 スキルディレクトリ（EVALS.json は 6 ペア） |

---

## 3. テスト件数サマリー

| 区分                     | 件数 | 備考                                                             |
| ------------------------ | ---: | ---------------------------------------------------------------- |
| 再現ケース (RC)          |    5 | RC-1〜RC-5                                                       |
| 実行コマンド数           |    6 | RC-1 / RC-2a / RC-2b / RC-2c / RC-3 / RC-4（+ RC-4b 補助）       |
| ログファイル数           |    9 | rc-1 / rc-2a / rc-2b / rc-2c / rc-3 / rc-4 / rc-4b / rc-5 / rc-6 |
| 検証した実行対象パス総数 |   13 | Phase 7 `recheck-paths.txt` と同一                               |
| 検証した EVALS.json 総数 |   13 | `.claude` 6 + `.agents` 6 + fixture 1                            |
| 検証した dual root pair  |    6 | SHA-256 bit-for-bit 一致 6 ペア                                  |
| PASS 件数                |    5 | RC-1 / RC-2 / RC-3 / RC-4 / RC-5 全て PASS                       |
| FAIL 件数                |    0 | —                                                                |
| 発見した新規問題         |    0 | Phase 5 §8 / Phase 7 §9 の未タスク候補 6 件以外に新規なし        |
| screenshot 件数          |    0 | **UI/UX 変更なしのため Phase 11 スクリーンショット不要**         |

---

## 4. RC-1〜RC-5 実行結果

### 4.1 判定サマリ

| RC-ID | 検証内容                                     | 再現コマンド概要                                                    | 期待値                                                                                 | 実測                                                              | 判定     | ログ                                                                      |
| ----- | -------------------------------------------- | ------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | ----------------------------------------------------------------- | -------- | ------------------------------------------------------------------------- |
| RC-1  | `EVALS.json` ファイル全列挙の再実行          | `find .claude .agents apps -type f -name 'EVALS.json' -not ...`     | Phase 4 `raw-find-evals.txt` と同一集合（13 件）                                       | 13 件 / P4 \ P11 = 0 / P11 \ P4 = 0                               | **PASS** | `rc-1-find-evals.log` / `rc-6-content-set-diff.log`                       |
| RC-2  | code / script / test / docs 参照検索の再実行 | `rg -n 'EVALS\.json\|EVALS_PATH\|evalsPath\|EVALS_FILE' <root>` × 3 | Phase 4 `raw-grep-claude.txt` / `raw-grep-agents.txt` / `raw-grep-apps.txt` と同一集合 | claude=42 / agents=42 / apps=14 / 各 kind で P4\\P11=0, P11\\P4=0 | **PASS** | `rc-2a-grep-claude.log` / `rc-2b-grep-agents.log` / `rc-2c-grep-apps.log` |
| RC-3  | 動的パス生成 consumer 再検索                 | `rg -n "join\([^)]*EVALS\|..."` 複合パターン                        | Phase 4 `raw-grep-dynamic.txt` と同一集合                                              | 33 行 / P4\\P11=0 / P11\\P4=0                                     | **PASS** | `rc-3-grep-dynamic.log` / `rc-6-content-set-diff.log`                     |
| RC-4  | dual root diff の再実行                      | `cmp -s` + `shasum -a 256` for 6 skills                             | Phase 6 判定と同一（6 スキル完全一致 / SHA-256 bit-for-bit）                           | 6 / 6 IDENTICAL / SHA-256 全一致                                  | **PASS** | `rc-4-dual-root-diff.log` / `rc-4b-dual-root-cmp.log`                     |
| RC-5  | 漏れ再検索と未記載 0 件の再確認              | RC-2 + RC-3 結果 → `comm -23` with consumer-audit-report.md 集合    | Phase 7 結論と同一（unlisted-paths.txt = 0 行、QG-6 PASS）                             | 13 パス / unlisted = 0 行                                         | **PASS** | `rc-5-unlisted-check.log`                                                 |

**総合判定: RC 全 5 件 PASS**、**QG-10 PASS**、**consumer-audit-report.md との差分 0**。

### 4.2 RC-1 詳細（EVALS.json 全列挙）

| 項目                 | 値                                                                                                                                                                                                                                                                        |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 実行コマンド         | `find .claude .agents apps -type f -name 'EVALS.json' -not -path '*/node_modules/*' -not -path '*/.backups/*' \| sort`                                                                                                                                                    |
| 実行タイムスタンプ   | 2026-04-19T09:29:55Z（RC-1 実行）                                                                                                                                                                                                                                         |
| ヒット件数           | 13（`.claude` 6 + `.agents` 6 + fixture 1）                                                                                                                                                                                                                               |
| Phase 4 raw との比較 | P4（13 行）== P11（13 行）、`comm -23` / `comm -13` ともに 0 行                                                                                                                                                                                                           |
| 期待値の consumer    | `.claude/skills/{aiworkflow-requirements,github-issue-manager,int-test-skill,skill-creator,skill-fixture-runner,task-specification-creator}/EVALS.json` + `.agents/skills/...`（同 6）+ `apps/desktop/src/__tests__/__fixtures__/skill-creator/complete-skill/EVALS.json` |
| 判定                 | **PASS**（同一集合）                                                                                                                                                                                                                                                      |

### 4.3 RC-2 詳細（3 root grep）

| kind   | 実行コマンド                                                                                                                                      | Phase 4 行数 | Phase 11 行数 | `comm -23` | `comm -13` | 判定     |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------- | -----------: | ------------: | ---------: | ---------: | -------- |
| claude | `rg -n 'EVALS\.json\|EVALS_PATH\|evalsPath\|EVALS_FILE' .claude/skills/ -g '!**/node_modules/**' -g '!**/.backups/**' -g '*.{js,ts,tsx,mjs,cjs}'` |           42 |            42 |          0 |          0 | **PASS** |
| agents | `rg -n 'EVALS\.json\|EVALS_PATH\|evalsPath\|EVALS_FILE' .agents/skills/ -g '!**/node_modules/**' -g '!**/.backups/**' -g '*.{js,ts,tsx,mjs,cjs}'` |           42 |            42 |          0 |          0 | **PASS** |
| apps   | `rg -n 'EVALS\.json\|EVALS_PATH\|evalsPath\|EVALS_FILE' apps/ -g '!**/node_modules/**' -g '!**/.backups/**' -g '*.{js,ts,tsx,mjs,cjs}'`           |           14 |            14 |          0 |          0 | **PASS** |

- 行数は `grep -v '^#' | grep -v '^$' | sort -u` で正規化後の値。正規化前のファイル行数（メタ 3 行 + 実データ + fallback 空行）は RC 側でメタを 4 行付与したため微差あり。これらはコンテンツの揺らぎではない（`rc-6-content-set-diff.log`）。

### 4.4 RC-3 詳細（動的パス検索）

| 項目                                       | 値                                                                                                                                                                                               |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 実行コマンド                               | ``rg -n "join\([^)]*EVALS\|\`[^\`]*EVALS\.json\|'EVALS\.json'\|\"EVALS\.json\"" .claude/skills/ .agents/skills/ apps/ -g '!**/node_modules/**' -g '!**/.backups/**' -g '*.{js,ts,tsx,mjs,cjs}'`` |
| ヒット行数（正規化後）                     | 33                                                                                                                                                                                               |
| Phase 4 `raw-grep-dynamic.txt`（正規化後） | 33                                                                                                                                                                                               |
| 集合差分                                   | `comm -23` = 0 / `comm -13` = 0                                                                                                                                                                  |
| 判定                                       | **PASS**（動的パス consumer 13 件を含む全ヒットが一致）                                                                                                                                          |

### 4.5 RC-4 詳細（dual root diff）

| skill                      | `.claude` bytes | SHA-256（Phase 6 と一致） | 判定                        |
| -------------------------- | --------------: | ------------------------- | --------------------------- |
| aiworkflow-requirements    |            1162 | `4579e61e...461e90d3`     | IDENTICAL（Phase 6 と一致） |
| github-issue-manager       |             409 | `1fa508d9...4dfdba43`     | IDENTICAL（Phase 6 と一致） |
| int-test-skill             |             403 | `65bf0a25...45c9aa14`     | IDENTICAL（Phase 6 と一致） |
| skill-creator              |             809 | `55761713...80eaffb8`     | IDENTICAL（Phase 6 と一致） |
| skill-fixture-runner       |             160 | `a8312b32...88a0981b6`    | IDENTICAL（Phase 6 と一致） |
| task-specification-creator |            4764 | `43f9d6a9...b42d26531b`   | IDENTICAL（Phase 6 と一致） |

- `claude-agent-sdk` スキルは両 root 共に EVALS.json 非所持（スコープ外）。Phase 6 `skills-union.txt` = 6 スキルの意味通り、dual root 比較対象は 6 スキル。

### 4.6 RC-5 詳細（漏れ再検索）

| 項目                                                     | 値                        |
| -------------------------------------------------------- | ------------------------- |
| Phase 11 recheck paths 件数                              | 13 パス                   |
| Phase 7 `recheck-paths.txt` との比較                     | 完全一致（`diff` 出力空） |
| consumer-audit-report.md 記載集合との包含検査 `comm -23` | **0 行**（unlisted = 0）  |
| 判定                                                     | **PASS**（QG-6 再現）     |

---

## 5. edge case 一覧表

| #   | edge case                                                             | 期待動作                                                                | 実測                                                                               | 判定 |
| --- | --------------------------------------------------------------------- | ----------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | ---- |
| 1   | `claude-agent-sdk` スキルは両 root に存在するが EVALS.json を持たない | RC-1 の find 結果・dual root 比較の双方でスコープ外となる               | RC-1 結果に含まれず、RC-4 では `missing one side` として検出（Phase 6 でも対象外） | OK   |
| 2   | `.backups/` 配下 / `node_modules/` 配下を除外した検索                 | 全 RC で `-g '!**/node_modules/**' -g '!**/.backups/**'` 除外条件が効く | 全 RC でそれらへのヒットなし（Phase 4/7 と同じ）                                   | OK   |
| 3   | `ripgrep` のファイル走査順序の非決定性                                | 集合比較（`sort -u`）では行順差異が吸収される                           | `rc-6-content-set-diff.log` の全 kind で `comm -23` / `comm -13` ともに 0          | OK   |
| 4   | メタコメント（タイムスタンプ、working_directory、exit_status）の差分  | `grep -v '^#'` で除外、差分集合に計上しない                             | 正規化後の集合は Phase 4 / Phase 7 / Phase 11 で完全一致                           | OK   |
| 5   | fixture EVALS.json（snake_case 方言）が RC-1 結果に 1 件含まれる      | Phase 5 §5.3 / Phase 6 対象外（第 3 の root）の扱いと整合               | RC-1 に 1 件含まれる（期待通り）                                                   | OK   |
| 6   | 動的パス consumer 13 件が RC-3 結果で個別ファイルに分散する           | RC-3 (rg pattern) と RC-5 (unique paths) で両方とも 13 consumer を網羅  | 一致（Phase 5 §7 動的パス表と同じ集合）                                            | OK   |

---

## 6. 仕様判断根拠

| 判断項目           | 採用値                     | 根拠                                                                                                   |
| ------------------ | -------------------------- | ------------------------------------------------------------------------------------------------------ |
| 再現コマンド出典   | Phase 2 §7.2               | consumer-audit-report.md §11 / Phase 7 §1 と完全一致していることを RC-2/3 で確認                       |
| 集合比較の正規化   | `grep -v '^#' \| sort -u`  | Phase 7 §2.1 の手法を踏襲（メタコメントを除外することで タイムスタンプ揺らぎを吸収）                   |
| dual root 比較手法 | `cmp -s` + `shasum -a 256` | Phase 6 メタ情報と同じ手法・同じハッシュで bit-for-bit 一致を再現                                      |
| 並行作業の影響確認 | `git status --short`       | 未追跡は本タスク成果物のみ、consumer コード／EVALS.json は Phase 4 以降変更なし（Phase 7 §3.1 と整合） |
| screenshot 扱い    | 不要                       | **UI/UX 変更なしのため Phase 11 スクリーンショット不要** / NON_VISUAL タスク / Phase 11 spec §2.1      |
| 一次証跡           | `manual-test-result.md`    | task-specification-creator Phase 11 テンプレ（v9.13.0 以降）。`reproduction-verification.md` 等は補助  |

---

## 7. 発見事項サマリー

- **新規発見: 0 件**。
- Phase 5 §8 / Phase 7 §9 / Phase 10 §4.4 で既に記録済の未タスク候補 6 件（以下）は本 Phase 11 でも追加修正なし。
  1. EVALS スキーマの camel/snake 二重標準統一
  2. mirror cross-root link 解消（resource-map.md）
  3. SkillScanner の EVALS 内容バリデーション実装
  4. `validate-schemas.js` / `validate-skill-structure.js` の EVALS 検証追加
  5. snake_case v1 系スキーマの正本化
  6. qualityInsights.\* フィールドの正本化
- 詳細な分類（Blocker / Note / Info）は補助成果物 `discovered-issues.md` を参照。Phase 11 実行結果としての追加 Blocker は **0 件**。

---

## 8. Phase 12 への引き継ぎ

### 8.1 RC 判定結果

- **RC-1〜RC-5 全件 PASS**
- **QG-10 PASS**（再現コマンド列挙の再実行で同じ 13 実行対象パス集合が得られる / 差分 0）
- **13 実行対象パス集合の差分 = 0**（Phase 7 `recheck-paths.txt` の完全再現）

### 8.2 AC-6 判定の再現性コメント

- Phase 10 `ac6-release-verdict.md` の AC-6 解除判定 **PASS** は、Phase 11 の第三者再実行で次の補助証跡を通じて再確認できる:
  - RC-1 / RC-2 / RC-3 / RC-5 により 13 実行対象パス集合が Phase 7 と一致
  - RC-4 により dual root 差分 0 を再確認
  - AC6-COND-2 / AC6-COND-3 は Phase 5 / Phase 8 正本成果物の存在確認で補強
- ただし Phase 11 の直接再実行対象は **32 consumer 全件ではなく 13 実行対象パス集合**である。この点は AC-6 COND-1 の補助証跡として扱う。

### 8.3 Phase 12 で参照すべきログと発見事項

| 参照対象                                                                                   | 用途                                                         |
| ------------------------------------------------------------------------------------------ | ------------------------------------------------------------ |
| `docs/30-workflows/evals-consumer-audit-001/outputs/phase-11/logs/rc-*.log`                | 再実行ログ（implementation-guide.md / 再現手順の補強）       |
| `docs/30-workflows/evals-consumer-audit-001/outputs/phase-11/reproduction-verification.md` | RC ごとの詳細差分まとめ（documentation-changelog.md で引用） |
| `docs/30-workflows/evals-consumer-audit-001/outputs/phase-11/manual-test-checklist.md`     | 1 枚サマリー                                                 |
| `docs/30-workflows/evals-consumer-audit-001/outputs/phase-11/discovered-issues.md`         | 発見事項分類（unassigned-task-detection.md への統合判断）    |
| Phase 5 §8 / Phase 7 §9 の未タスク候補 6 件                                                | そのまま Phase 12 `unassigned-task-detection.md` へ引き継ぎ  |

### 8.4 FAIL 時の戻し先 Phase（参考）

- **RC-1 FAIL の場合**: Phase 4（raw 収集）へ戻し、find 条件を再精査
- **RC-2 FAIL の場合**: Phase 4 + Phase 5（consumer 表）
- **RC-3 FAIL の場合**: Phase 4 + Phase 5 §7 動的パス表
- **RC-4 FAIL の場合**: Phase 6（dual-root-parity）
- **RC-5 FAIL の場合**: Phase 7（coverage-recheck） + Phase 5
- **本 Phase 11 では FAIL なし**のため、戻し発生は 0 件。

---

## 9. 実行記録（logs/ ディレクトリ）

| ファイル                                             | 内容                                                              | サイズ |
| ---------------------------------------------------- | ----------------------------------------------------------------- | -----: |
| `rc-1-find-evals.log`                                | RC-1: `find` による EVALS.json 全列挙                             |  20 行 |
| `rc-2a-grep-claude.log`                              | RC-2a: `.claude/skills/` 内 rg                                    |  47 行 |
| `rc-2b-grep-agents.log`                              | RC-2b: `.agents/skills/` 内 rg                                    |  47 行 |
| `rc-2c-grep-apps.log`                                | RC-2c: `apps/` 内 rg                                              |  19 行 |
| `rc-3-grep-dynamic.log`                              | RC-3: 動的パス join/template/quoted pattern rg                    |  38 行 |
| `rc-4-dual-root-diff.log`                            | RC-4: `ls .claude/skills` 駆動の diff（スキーム外検出含む）       |  12 行 |
| `rc-4b-dual-root-cmp.log`                            | RC-4b: 6 スキル `cmp -s` + SHA-256 比較（Phase 6 手法準拠）       |  14 行 |
| `rc-5-unlisted-check.log`                            | RC-5: 再検索結果 → consumer 集合包含検査（unlisted=0）            |  30 行 |
| `rc-6-content-set-diff.log`                          | 集合比較: 5 kind すべて IDENTICAL / P4 \\ P11 = 0 / P11 \\ P4 = 0 |  40 行 |
| `phase-11-recheck-paths.txt`                         | Phase 11 再検索のユニーク consumer パス（13 行）                  |  13 行 |
| `phase-11-unlisted-paths.txt`                        | 未記載パス（QG-6 再現 / 0 行）                                    |   0 行 |
| `p{4,11}-norm-{claude,agents,apps,dynamic,find}.txt` | 正規化後の集合（比較用中間ファイル 10 本）                        |      — |

---

## 10. 統合テスト連携

| 判定項目                                                                | 期待 | 実測   | 判定 |
| ----------------------------------------------------------------------- | ---- | ------ | ---- |
| 再現ケース 5 件が本ファイルに集約されている                             | PASS | 5 件   | PASS |
| screenshots 必須ルールが残っていない                                    | PASS | 明記   | PASS |
| Phase 12 参照パスが実在する                                             | PASS | 全実在 | PASS |
| `UI/UX 変更なしのため Phase 11 スクリーンショット不要` 固定フレーズ明記 | PASS | ✅     | PASS |
| `^\| RC-` 行が 5 件以上                                                 | PASS | 5 件   | PASS |

---

## 11. タスク100%実行確認

- [x] Step 0 事前チェック完了（`rg/diff/node/git` バージョン記録、両 root 存在確認）
- [x] Step 1 再現ケース定義完了（RC-1〜RC-5）
- [x] Step 2 再実行ログ保存完了（`logs/rc-*.log` 9 本 + 中間ファイル）
- [x] Step 3 `manual-test-result.md` 作成完了（本ファイル）
- [x] Step 4 補助成果物作成完了（`reproduction-verification.md` / `manual-test-checklist.md` / `discovered-issues.md`）
- [x] Step 5 Phase 12 引き継ぎ記載完了（§8）

---

## 12. 変更履歴

| 日付       | 変更内容                                                                                                                                                     |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 2026-04-19 | 初版作成。第三者再実行（iteration #3）により RC-1〜RC-5 全件 PASS / QG-10 PASS / consumer-audit-report.md との差分 0 を確定。AC-6 判定の再現性コメント追加。 |
