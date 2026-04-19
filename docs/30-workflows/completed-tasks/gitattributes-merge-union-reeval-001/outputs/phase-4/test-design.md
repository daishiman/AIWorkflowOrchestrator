# Phase 4: テスト設計書（TDD Red）

## 1. 戦略

### 1.1 テスト対象

`.gitattributes` の glob とドライバー定義に基づく **Git マージの実挙動**。
ソースコードではなく Git 設定ファイルの挙動のため、コードカバレッジツールは使用しない。

### 1.2 採用戦略: bash + git によるマージシミュレーション

1. 一時ディレクトリ（`mktemp -d`）に `git init` する。
2. `user.email` / `user.name` をローカル設定。
3. `.gitattributes` を被テスト内容で配置。必要に応じて `setup-merge-drivers.sh` を実行。
4. `main` から `feature-a` / `feature-b` の 2 ブランチを切り、同一ファイルを別々に編集 → コミット。
5. `main` に `feature-a` を merge → `feature-b` を merge し、最終ファイル内容と exit code、
   コンフリクトマーカー有無を検査。
6. トラップで一時ディレクトリを cleanup。

### 1.3 不採用案とリスク

| 案                          | 不採用理由                                                                       |
| --------------------------- | -------------------------------------------------------------------------------- |
| Vitest snapshot             | Git マージ挙動を再現できない（ランタイムは JS/Node であり Git 実行環境ではない） |
| GitHub Actions のみでの検証 | ローカル再現性が失われる。failure 時の切り分けコストが高い                       |
| 実リポジトリでのマージ試行  | 検証のためのブランチが main 側に残るリスク、ロールバックコスト大                 |

**採用戦略のリスク緩和**: 一時ディレクトリは `trap 'rm -rf "$WORKDIR"' EXIT` で必ず削除。

## 2. テストケース

### TC-01: `LOGS.md`（append-only）並列追記 → union で両方残る

| 項目           | 内容                                                                                        |
| -------------- | ------------------------------------------------------------------------------------------- |
| 対象パターン   | `.claude/skills/aiworkflow-requirements/LOGS.md`（append-only）                             |
| 前提           | Phase 5 修正後の `.gitattributes` 適用                                                      |
| 入力（before） | `# LOGS` 1 行のみ                                                                           |
| 操作           | `feature-a` 末尾に `- 2026-04-19 entry A`、`feature-b` 末尾に `- 2026-04-19 entry B` を追記 |
| 実行コマンド列 | `git checkout main && git merge feature-a --no-edit && git merge feature-b --no-edit`       |
| 期待 exit code | 0（コンフリクトなし）                                                                       |
| assert         | 最終ファイルに `entry A` と `entry B` の両方が含まれる。`<<<<<<<` マーカーが 0 個           |
| 期待結果       | `merge=union` が効き、両ブランチ追記が union で結合                                         |

### TC-02: `task-workflow.md`（構造化）並列追記 → Conflict マーカー

| 項目                            | 内容                                                                                            |
| ------------------------------- | ----------------------------------------------------------------------------------------------- |
| 対象パターン                    | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`（構造化）                  |
| 前提（Phase 4 時点）            | **現行 `.gitattributes`（修正前）** → このケースでは `merge=union` が適用される（誤挙動）       |
| 前提（Phase 5 修正後）          | 修正後の `.gitattributes` → デフォルト 3-way マージ                                             |
| 入力（before）                  | 共通の見出し `## ゴール` + 本文 3 行                                                            |
| 操作                            | `feature-a` が `## ゴール` 直下を改変、`feature-b` が同区間を別内容に改変                       |
| 実行コマンド列                  | 同上                                                                                            |
| 期待 exit code（修正前）        | 0（union による破壊的結合）                                                                     |
| 期待 exit code（修正後）        | 1（コンフリクト）                                                                               |
| assert（修正後 = Green 化条件） | 最終ファイルに `<<<<<<<` / `=======` / `>>>>>>>` マーカーが全て出現                             |
| TDD Red の根拠                  | 現行 `.gitattributes` では `merge=union` が誤って適用 → conflict マーカーが出ない → FAIL となる |

### TC-03: `indexes/<name>.json` 同一キー変更 → ours

| 項目           | 内容                                                                                              |
| -------------- | ------------------------------------------------------------------------------------------------- |
| 対象パターン   | `.claude/skills/aiworkflow-requirements/indexes/resource-map.json`                                |
| 前提           | `bash .claude/scripts/setup-merge-drivers.sh` 実行済み                                            |
| 入力（before） | `{"v": 1}`                                                                                        |
| 操作           | `feature-a` で `{"v": 2}`、`feature-b` で `{"v": 3}` に変更                                       |
| 実行コマンド列 | 同上                                                                                              |
| 期待 exit code | 0                                                                                                 |
| assert         | 最終ファイルは `{"v": 2}`（`feature-a` = main 側 merge 後の状態、`feature-b` merge で ours 採用） |
| 期待結果       | `merge=ours` が効き、統合先（main）側の内容が保持                                                 |

### TC-04: `indexes/<name>.json` ドライバー未登録 → warning + fallback

| 項目           | 内容                                                                                 |
| -------------- | ------------------------------------------------------------------------------------ |
| 対象パターン   | 同 TC-03                                                                             |
| 前提           | `setup-merge-drivers.sh` **未実行**（`git config --get merge.ours.driver` 空）       |
| 操作           | 同 TC-03                                                                             |
| 期待 exit code | 0 または 1（環境依存）                                                               |
| assert         | stderr に `failed to resolve 'ours'` または `unknown merge driver 'ours'` が含まれる |
| 期待結果       | warning 出力、デフォルト 3-way にフォールバック                                      |

### TC-05: `.gitattributes` 各エントリに用途コメント

| 項目           | 内容                                                                                       |
| -------------- | ------------------------------------------------------------------------------------------ |
| 対象           | Phase 5 修正後の `.gitattributes`                                                          |
| 実行コマンド列 | `grep -cE '^# \[' .gitattributes` かつ `grep -cE '^# 新規ファイル追加判断' .gitattributes` |
| assert         | カテゴリ見出し `# [<category>]` が 3 個以上（append-only / auto-generated / structured）   |
| assert         | 「新規ファイル追加判断:」コメントが 3 個以上                                               |
| 期待結果       | 各エントリ（グループ）に適用意図と判断ガイドが付与されている                               |

## 3. TDD Red 状態の論理的成立

| TC-ID | 現行 `.gitattributes`（修正前）          | 修正後 `.gitattributes` |
| ----- | ---------------------------------------- | ----------------------- |
| TC-01 | PASS                                     | PASS                    |
| TC-02 | **FAIL**（union 誤適用で conflict 出ず） | PASS（conflict 出る）   |
| TC-03 | PASS（ours 登録時）                      | PASS                    |
| TC-04 | PASS（warning 出る）                     | PASS                    |
| TC-05 | FAIL（既存にカテゴリ見出し薄い）         | PASS（Phase 5 で付与）  |

→ TC-02 と TC-05 が **Phase 4 時点で必ず FAIL**（TDD Red）。
Phase 5 実装完了で Green 化する。

## 4. assert の具体化

| TC-ID | assert 手段                                                                                             |
| ----- | ------------------------------------------------------------------------------------------------------- |
| TC-01 | `grep -c 'entry A' LOGS.md` = 1 AND `grep -c 'entry B' LOGS.md` = 1 AND `grep -c '<<<<<<<' LOGS.md` = 0 |
| TC-02 | 修正後: `grep -c '<<<<<<<' task-workflow.md` >= 1                                                       |
| TC-03 | `grep -c '"v": 2' file.json` = 1                                                                        |
| TC-04 | `grep -q "failed to resolve 'ours'\|unknown merge driver" stderr.log`                                   |
| TC-05 | `.gitattributes` 内 `^# \[` 出現 >= 3、`^# 新規ファイル追加判断` 出現 >= 3                              |

## 5. 本 Phase での禁止事項

- コード変更は一切行わない。
- `.gitattributes` / `setup-merge-drivers.sh` の修正は Phase 5 で実施する。
- 一時リポジトリでの実測は Phase 11 で行う（本 Phase は仕様定義のみ）。
