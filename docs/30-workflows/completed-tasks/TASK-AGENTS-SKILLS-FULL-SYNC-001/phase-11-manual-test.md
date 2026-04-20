# Phase 11: 手動テスト

## メタ情報

| 項目         | 値                                                      |
| ------------ | ------------------------------------------------------- |
| Phase        | 11                                                      |
| 機能名       | TASK-AGENTS-SKILLS-FULL-SYNC-001                        |
| Issue番号    | #2278                                                   |
| 作成日       | 2026-04-19                                              |
| 種別         | NON_VISUAL / infra-guard / shell-script                 |
| 前提         | Phase 1-10 完了（設計・テスト設計・実装・最終レビュー） |
| 正本evidence | `outputs/phase-11/manual-test-result.md`                |

## 視覚証跡

**UI/UX変更なしのため Phase 11 スクリーンショット不要。**

本タスクは `.claude/scripts/` 配下の shell スクリプト 2 本と、`.husky/pre-push` / `.claude/hooks/session-init.sh` への追記のみを扱う NON_VISUAL タスクである。したがって 3 層評価（Semantic / Visual / AI UX）のうち Visual 層は対象外とし、代替として以下の bash 実行ログを証跡として扱う。

| 代替証跡                    | 格納先                                            | 目的                                       |
| --------------------------- | ------------------------------------------------- | ------------------------------------------ |
| bash 実行ログ               | `outputs/phase-11/bash-execution-log.txt`         | verify / sync / pre-push の exit code 記録 |
| `diff -qr` スナップショット | `outputs/phase-11/diff-snapshot-before-after.txt` | 同期前後の差分比較                         |
| timing 計測                 | `outputs/phase-11/timing-measurement.txt`         | session-init 1 秒未満目標の実測            |
| Phase 10 最終レビュー参照   | `phase-10-final-review.md`                        | 全 AC 合致の再確認                         |

3 層評価の代替運用方針:

- Semantic 層: shell 実行ログ中の「期待 exit code vs 実測 exit code」を対応表で照合
- Visual 層: N/A（UI 変更なしのためスキップ）
- AI UX 層: 警告メッセージの文面が `sync-skills-mirror.sh` の実行コマンドを含むかを grep で確認

## 目的

Phase 10 までで確立した parity guard（verify スクリプト・sync スクリプト・pre-push hook・session-init hook）の実装について、実運用シナリオでの手動再現テストを行い、仕様書の自己完結性・コマンド再現性・close-out 引継ぎ情報を確認する。

## 実行タスク

1. `outputs/phase-11/manual-test-result.md` を docs-only evidence の正本として作成する
2. 6 つの手動テストシナリオを bash で再現し、期待 exit code との一致を記録する
3. session-init hook の timing を実測し、1 秒未満目標に対する実測値を記録する
4. HIGH 問題が検出された場合は unassigned-task/ 配下に follow-up 仕様書を自動生成する
5. Phase 12 への引き継ぎ情報を補助成果物に残す

## 参照資料

| 資料名                     | パス                                                                             | 用途                          |
| -------------------------- | -------------------------------------------------------------------------------- | ----------------------------- |
| Phase 10 最終レビュー      | `phase-10-final-review.md`                                                       | 実装合致確認の前提            |
| Phase 4 テスト設計         | `phase-04-test-design.md`                                                        | NG/OK シナリオの出所          |
| Phase 2 設計               | `phase-02-design.md`                                                             | exit code 契約・sync 実行順序 |
| verify スクリプト          | `.claude/scripts/verify-skills-parity.sh`                                        | 本 Phase の検証対象           |
| sync スクリプト            | `.claude/scripts/sync-skills-mirror.sh`                                          | 本 Phase の検証対象           |
| pre-push hook              | `.husky/pre-push`                                                                | 追記ブロックの動作確認        |
| session-init hook          | `.claude/hooks/session-init.sh`                                                  | warning メッセージ動作確認    |
| phase 11 template          | `.agents/skills/task-specification-creator/references/phase-template-phase11.md` | docs-only ルールの拠り所      |
| task-specification-creator | `.claude/skills/task-specification-creator/SKILL.md`                             | Phase 11 必須骨格             |

### システム仕様（aiworkflow-requirements）

| 参照資料                | パス                                                                           | 内容                                    |
| ----------------------- | ------------------------------------------------------------------------------ | --------------------------------------- |
| canonical root policy   | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`           | `.claude` 正本・`.agents` mirror の原則 |
| hook 制御用環境変数     | `CLAUDE.md`（本リポジトリ）                                                    | `CLAUDE_SKIP_HEAVY_HOOKS` の仕様        |
| task-workflow-completed | `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md` | 完了タスクへの登録方針                  |

## 実行手順

### ステップ 0: テスト環境の準備

1. 作業用ブランチが clean であることを確認（`git status`）
2. `/tmp/skills-diff-before.txt` に実行前の差分スナップショットを保存
3. `outputs/phase-11/` ディレクトリを作成

```bash
mkdir -p docs/30-workflows/TASK-AGENTS-SKILLS-FULL-SYNC-001/outputs/phase-11
diff -qr .claude/skills .agents/skills 2>/dev/null \
  | tee docs/30-workflows/TASK-AGENTS-SKILLS-FULL-SYNC-001/outputs/phase-11/diff-snapshot-before-after.txt
```

### ステップ 1: 6 手動テストシナリオの実行

以下 6 シナリオを順に実行し、期待結果・コマンド・判定方法を `manual-test-result.md` に記録する。

#### シナリオ 1: 差分検出（NG ケース）

| 項目     | 内容                                                                                                                             |
| -------- | -------------------------------------------------------------------------------------------------------------------------------- |
| 目的     | canonical 側にダミー変更を加え、verify スクリプトが exit 1 を返すこと                                                            |
| コマンド | `echo "dummy" >> .claude/skills/aiworkflow-requirements/LOGS.md && bash .claude/scripts/verify-skills-parity.sh; echo "exit=$?"` |
| 期待結果 | stdout に `[parity-check] NG:` を含み、exit code = 1                                                                             |
| 判定方法 | `exit=1` の出力一致 + stdout に修正手順（`sync-skills-mirror.sh` 案内）あり                                                      |
| 事後処理 | `git checkout -- .claude/skills/aiworkflow-requirements/LOGS.md` で元に戻す                                                      |

#### シナリオ 2: 同期・修復（OK ケース）

| 項目     | 内容                                                                                                         |
| -------- | ------------------------------------------------------------------------------------------------------------ |
| 目的     | sync スクリプト実行後、verify が exit 0 を返すこと                                                           |
| コマンド | `bash .claude/scripts/sync-skills-mirror.sh && bash .claude/scripts/verify-skills-parity.sh; echo "exit=$?"` |
| 期待結果 | sync の最終行が `[mirror-sync] 完了: parity OK`、verify が exit 0                                            |
| 判定方法 | `exit=0` + `diff -qr .claude/skills .agents/skills` の出力が空                                               |
| 事後処理 | なし（parity OK 状態を維持）                                                                                 |

#### シナリオ 3: pre-push 中止

| 項目     | 内容                                                                                                                                                                                                                                                                                                |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 目的     | 差分を作ってから git push を試み、pre-push が abort することを確認                                                                                                                                                                                                                                  |
| コマンド | `TMP_REMOTE="$(mktemp -d)/skills-parity-test.git" && git init --bare "$TMP_REMOTE" && echo "test" >> .claude/skills/aiworkflow-requirements/LOGS.md && git add -A && git commit -m "test: parity guard abort test" && git push "$TMP_REMOTE" HEAD 2>&1 \| tee /tmp/prepush-log.txt; echo "exit=$?"` |
| 期待結果 | git push が exit code 1 で失敗、stdout/stderr に `[pre-push] parity NG のため push を中止します。` を含む                                                                                                                                                                                           |
| 判定方法 | `exit=1` + ログ中に中止メッセージと `sync-skills-mirror.sh` の案内                                                                                                                                                                                                                                  |
| 事後処理 | `git reset --soft HEAD~1 && git checkout -- .claude/skills/aiworkflow-requirements/LOGS.md && rm -rf "$TMP_REMOTE"`                                                                                                                                                                                 |

#### シナリオ 4: int-test-skill の mirror 確認

| 項目     | 内容                                                              |
| -------- | ----------------------------------------------------------------- |
| 目的     | canonical-only だった `int-test-skill` が mirror に同期されている |
| コマンド | `ls -la .agents/skills/int-test-skill/SKILL.md; echo "exit=$?"`   |
| 期待結果 | `SKILL.md` の stat 出力あり、exit code = 0                        |
| 判定方法 | `exit=0` + ファイルサイズが 1 byte 以上                           |

#### シナリオ 5: 全量検証

| 項目     | 内容                                                                       |
| -------- | -------------------------------------------------------------------------- |
| 目的     | `diff -qr` + `generate-index.js` + `validate-structure.js` の 3 手順が通る |
| コマンド | 下記ブロック参照                                                           |
| 期待結果 | いずれも stderr / exit code 0、`diff` の出力が空                           |
| 判定方法 | 3 コマンドすべて exit=0 + `diff` 結果空                                    |

```bash
diff -qr .claude/skills .agents/skills; echo "diff_exit=$?"
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js --quiet; echo "index_exit=$?"
node .claude/skills/aiworkflow-requirements/scripts/validate-structure.js \
  .claude/skills/aiworkflow-requirements; echo "validate_exit=$?"
```

#### シナリオ 6: CLAUDE_SKIP_HEAVY_HOOKS=1 によるスキップ確認

| 項目     | 内容                                                                                              |
| -------- | ------------------------------------------------------------------------------------------------- |
| 目的     | session-init の parity warning が環境変数でスキップできる                                         |
| コマンド | `CLAUDE_SKIP_HEAVY_HOOKS=1 bash .claude/hooks/session-init.sh 2>&1 \| grep -c "parity" \|\| true` |
| 期待結果 | `parity` を含む行が 0 件（スキップされている）                                                    |
| 判定方法 | grep の count が 0、かつ session-init 全体は exit code 0                                          |
| 追加計測 | `time` コマンドで実行時間を計測し、1 秒未満目標に対する実測値を記録                               |

### ステップ 2: HIGH 問題の検出と unassigned-task 自動生成フロー

Phase 11 実行中に以下いずれかの HIGH 問題が検出された場合は、`docs/30-workflows/unassigned-task/` 配下に follow-up 仕様書を自動生成する。

| HIGH 条件                                           | follow-up task 名案                           |
| --------------------------------------------------- | --------------------------------------------- |
| session-init の実行時間が 1 秒を超えた              | `task-skills-parity-session-init-perf-001`    |
| `sync-skills-mirror.sh` 実行後も差分が残存する      | `task-skills-parity-generate-index-drift-001` |
| pre-push hook が abort しない（シナリオ 3 失敗）    | `task-skills-parity-prepush-bypass-001`       |
| mirror-only ファイルが検出され rsync 前警告が出ない | `task-skills-parity-mirror-only-warning-001`  |

自動生成手順:

1. `outputs/phase-11/discovered-issues.md` に HIGH / Note / Info の 3 分類で記録
2. HIGH が 1 件以上ある場合は、`docs/30-workflows/unassigned-task/<task-name>.md` を雛形から生成
3. 雛形には「発見元: TASK-AGENTS-SKILLS-FULL-SYNC-001 Phase 11」を明記
4. 生成後に `audit-unassigned-tasks.js --json` で登録確認

### ステップ 3: 正本 evidence のまとめ

- `outputs/phase-11/manual-test-result.md` を正本とする
- `outputs/phase-11/manual-test-checklist.md`（シナリオ 6 件の checklist 形式）を補助成果物にする
- `outputs/phase-11/discovered-issues.md` に HIGH / Note / Info 分類を残す
- `outputs/phase-11/bash-execution-log.txt` と `outputs/phase-11/timing-measurement.txt` を evidence として参照可能にする

## 統合テスト連携

- Phase 9 の自動テスト実測と本 Phase の手動テスト実測を `manual-test-result.md` に並記
- Phase 12 の `phase12-task-spec-compliance-check.md` へ本 `manual-test-result.md` を evidence として渡す

## 多角的チェック観点（AIが判断）

- 素人思考: 初見の実装者が 6 シナリオを追えるか（コマンドを copy-paste で再現できる粒度か）
- 因果関係分析: pre-push abort の失敗がどの設計欠陥に起因するかを切り分けられるか
- KJ 法: 発見事項を Blocker / Note / Info で束ねられているか
- 批判的思考: rsync --delete が mirror の独自変更を破壊した場合の救済手段があるか
- 運用性思考: `CLAUDE_SKIP_HEAVY_HOOKS=1` が期待通りスキップに効くか

## サブタスク管理

| SubTask | 内容                                   | 並列性 | 担当 Lane              |
| ------- | -------------------------------------- | ------ | ---------------------- |
| ST-31   | 6 シナリオの bash 実行ログ取得         | seq    | Lane A（実行）         |
| ST-32   | timing 計測（session-init 1 秒未満）   | par    | Lane A（実行）         |
| ST-33   | HIGH / Note / Info 分類レポート作成    | seq    | Lane B（分析）         |
| ST-34   | HIGH 検出時の unassigned-task 雛形生成 | seq    | Lane B（分析）         |
| ST-35   | `manual-test-result.md` 正本集約       | seq    | Lane C（ドキュメント） |

## 成果物

- `outputs/phase-11/manual-test-result.md`（正本）
- `outputs/phase-11/manual-test-checklist.md`（補助 checklist）
- `outputs/phase-11/discovered-issues.md`（HIGH / Note / Info 分類）
- `outputs/phase-11/bash-execution-log.txt`（6 シナリオの実行ログ）
- `outputs/phase-11/timing-measurement.txt`（session-init 実行時間実測）
- `outputs/phase-11/diff-snapshot-before-after.txt`（同期前後の差分スナップショット）

## 完了条件

- [ ] `manual-test-result.md` を正本 evidence として扱っている
- [ ] 6 手動テストシナリオ（NG / OK / pre-push abort / int-test-skill / 全量検証 / SKIP_HEAVY_HOOKS）すべての期待 exit code と実測 exit code が一致している
- [ ] session-init の実行時間が 1 秒未満であることを実測した
- [ ] `UI/UX変更なしのため Phase 11 スクリーンショット不要` を本仕様書と `manual-test-result.md` の両方に明記している
- [ ] HIGH 問題が検出された場合、`docs/30-workflows/unassigned-task/` 配下に follow-up 仕様書が生成されている
- [ ] 発見事項を Blocker / Note / Info に分類した

## タスク100%実行確認【必須】

- [ ] docs-only evidence ルール（bash 実行ログによる代替証跡）を反映した
- [ ] 6 walkthrough シナリオを記載した
- [ ] Phase 12 compliance-check に正本成果物を渡すことを記載した
- [ ] NON_VISUAL 規則（視覚証跡 N/A）を明記した
- [ ] HIGH 検出時の unassigned-task 自動生成フローを記載した

## 次のPhaseへの引き継ぎ

- Phase 12 で `implementation-guide.md` を作成する際に、本 Phase の `bash-execution-log.txt` と `timing-measurement.txt` を Part 2（開発者向け）の「実行例」に引用する
- Phase 12 の `phase12-task-spec-compliance-check.md` では、本 Phase の `manual-test-result.md` を evidence として参照する
- HIGH 問題が生成した unassigned-task 仕様書は Phase 12 の `unassigned-task-detection.md` にリストアップする
- Phase 13 は user approval 取得までは `blocked` のまま維持する
