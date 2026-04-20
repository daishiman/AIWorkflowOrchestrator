# Phase 13: PR 作成

## メタ情報

| 項目       | 値                                                    |
| ---------- | ----------------------------------------------------- |
| Phase      | 13                                                    |
| 機能名     | TASK-AGENTS-SKILLS-FULL-SYNC-001                      |
| Issue番号  | #2278（既に CLOSED）                                  |
| 作成日     | 2026-04-19                                            |
| 種別       | NON_VISUAL / infra-guard / shell-script               |
| ステータス | **blocked**（user の明示承認取得まで実行禁止）        |
| 前提       | Phase 1-12 完了（仕様書・実装・テスト・ドキュメント） |

## 視覚証跡

**UI/UX変更なしのため Phase 11 スクリーンショット不要。** 代替として Phase 11 の `bash-execution-log.txt` と Phase 12 の `documentation-changelog.md` を PR 本文から参照する。

## 目的

user の明示承認を取得した後にのみ PR 準備へ進めるよう、**blocked 条件** と **承認後の実行フロー**、**PR 雛形**、および **Issue #2278 との関係** を確定する。本仕様書は PR 作成のルールブックであり、本 Phase 作業中に PR を作成することはない。

## ステータス: blocked

以下すべてが揃うまで、本 Phase は `blocked` のまま維持する。

| 解除条件                                                        | 確認方法                                                            |
| --------------------------------------------------------------- | ------------------------------------------------------------------- |
| user から「PR 作成を実行しますか？」に対する明示的な YES の回答 | 会話履歴に YES の文字列または等価な承認表現が残っていること         |
| Phase 12 完了条件のすべてが ✅                                  | `phase12-task-spec-compliance-check.md` の checklist がすべて埋まる |
| Phase 11 の 6 シナリオがすべて期待結果と一致                    | `outputs/phase-11/manual-test-result.md` の全行 PASS                |
| local check（lint / typecheck / test）のすべてが green          | `outputs/phase-13/local-check-result.md` を後述手順で記録済み       |

**AC-8（Phase 1）: 本仕様書の Phase 13 は user の明示承認があるまで `blocked` を維持する。この AC を本 Phase で再宣言する。**

### 確認プロンプト（user への問い合わせテンプレート）

本 Phase を解除するには、以下のプロンプトで user から明示承認を取る。

> PR 作成を実行しますか？
>
> - ブランチ名: `feat/task-agents-skills-full-sync-001`（案）
> - PR title: `feat(parity-guard): TASK-AGENTS-SKILLS-FULL-SYNC-001 .claude/.agents skills完全パリティガード実装・Phase12完了`
> - base: `main`
> - 実行内容: branch push → gh pr create → labels 付与 → assignees 指定
>
> 上記で進めてよければ「YES」、修正が必要なら具体的な指示を返信してください。

user から YES 以外（沈黙・曖昧表現・別の指示）を受けた場合は、本 Phase を `blocked` のまま継続する。

## 実行タスク

1. blocked 理由と解除条件を本仕様書で再宣言する
2. Phase 12 までの完了根拠を整理する
3. approval 後の local check と PR 情報の雛形を定義する
4. Issue #2278 との関係（CLOSED Issue に対する扱い）を明記する
5. approval 受領後にのみ、後述コマンド列を実行する

## 参照資料

| 資料名                | パス                                                                             | 用途                     |
| --------------------- | -------------------------------------------------------------------------------- | ------------------------ |
| phase 13 template     | `.claude/skills/task-specification-creator/references/phase-template-phase13.md` | blocked ルール           |
| Phase 12 ドキュメント | `phase-12-documentation.md`                                                      | close-out 前提           |
| Phase 11 手動テスト   | `phase-11-manual-test.md`                                                        | evidence 参照            |
| CLAUDE.md             | `CLAUDE.md`（リポジトリルート）                                                  | `--no-verify` 禁止ルール |
| Issue #2278           | `docs/30-workflows/unassigned-task/TASK-AGENTS-SKILLS-FULL-SYNC-001.md`          | 元 Issue 本文            |
| github-issue-manager  | `.claude/skills/github-issue-manager/SKILL.md`                                   | gh CLI 操作規約          |

### システム仕様（aiworkflow-requirements）

| 参照資料                | パス                                                                           | 内容                              |
| ----------------------- | ------------------------------------------------------------------------------ | --------------------------------- |
| task-workflow           | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`           | PR 作成の canonical / mirror 原則 |
| task-workflow-completed | `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md` | PR マージ後の完了タスク登録先     |

## 実行手順

### ステップ 1: blocked 条件の維持（user 承認取得前）

- user 承認が確認できない限り、本 Phase 作業としてのコマンド実行は以下に限定する:
  - 本仕様書の読み込み / レビュー
  - Phase 11 / Phase 12 成果物の再確認
  - local check 結果の事前準備（実行はするが push / PR 作成はしない）
- commit / push / PR 作成は**一切自動化しない**
- user 承認を待っている間は、`outputs/phase-13/` 配下を準備段階のみで留める

### ステップ 2: 承認後の local check

承認取得後、最初に以下を実行して green を確認する。

```bash
# lint
pnpm lint
# typecheck
pnpm typecheck
# test（全パッケージ）
pnpm test
# parity 最終確認
bash .claude/scripts/verify-skills-parity.sh
# index 整合
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js --quiet
diff -qr .claude/skills .agents/skills
```

結果を `outputs/phase-13/local-check-result.md` に記録する。**いずれかが fail した場合は PR 作成に進まず、修正後に再実行する。`--no-verify` による回避は禁止。**

### ステップ 3: ブランチ push と PR 作成（承認後のみ）

#### 3-1. ブランチ push

```bash
# ブランチ名の確認（既存の feat/task-agents-skills-full-sync-001 系を想定）
git status
git branch --show-current

# remote への push（初回は -u で upstream 設定）
git push -u origin HEAD
```

#### 3-2. PR 作成（gh CLI）

PR title 雛形:

```
feat(parity-guard): TASK-AGENTS-SKILLS-FULL-SYNC-001 .claude/.agents skills完全パリティガード実装・Phase12完了
```

PR body テンプレート（HEREDOC で渡す）:

```bash
gh pr create --base main --head "$(git branch --show-current)" \
  --title "feat(parity-guard): TASK-AGENTS-SKILLS-FULL-SYNC-001 .claude/.agents skills完全パリティガード実装・Phase12完了" \
  --body "$(cat <<'EOF'
## Summary

- `.claude/skills/`（canonical）と `.agents/skills/`（mirror）の完全パリティを検証・自動修復する shell スクリプト 2 本（`verify-skills-parity.sh` / `sync-skills-mirror.sh`）を追加
- `.husky/pre-push` と `.claude/hooks/session-init.sh` に parity check を追記し、push 時 gate + session 開始時 warning の 2 段ガードを構築
- 既存 drift 6 ファイル（LOGS.md / resource-map.md / task-workflow-completed.md / skill-creator 3 ファイル）を canonical 正本で同期し、canonical-only だった `int-test-skill` を mirror へ初回配置
- NON_VISUAL タスクにつき UI 変更なし。Phase 11 スクリーンショット不要

## Test plan

- [x] `verify-skills-parity.sh` が差分あり時 exit 1 / なし時 exit 0 を返す（Phase 11 シナリオ 1 / 2）
- [x] `sync-skills-mirror.sh` 実行後に `diff -qr` が空出力（Phase 11 シナリオ 2 / 5）
- [x] pre-push hook が parity NG 時に push を中止する（Phase 11 シナリオ 3）
- [x] `int-test-skill` が `.agents/skills/int-test-skill/SKILL.md` に存在する（Phase 11 シナリオ 4）
- [x] `CLAUDE_SKIP_HEAVY_HOOKS=1` で session-init parity check がスキップされる（Phase 11 シナリオ 6）
- [x] session-init の実行時間が 1 秒未満（Phase 11 timing 実測）
- [x] pnpm lint / pnpm typecheck / pnpm test すべて green（Phase 13 local-check-result.md）

## Related issues

- Closes (notional): 本 PR は Issue #2278 に対応する仕様書のマージを目的とする
- Issue #2278 は既に CLOSED のため、本 PR のマージで **再度 Close しない**
- マージ時は Issue #2278 にコメントで「対応仕様書マージ: PR #<番号>」と記載する
- 前提タスク: TASK-CONFLICT-PREVENT-001（merge policy / deterministic generator）
- 隣接タスク: task-p0-05-mirror-sync-automation / task-imp-aiworkflow-same-wave-sync-guard-001

## Notes

- NON_VISUAL / infra-guard / shell-script スコープのため UI 変更・IPC channel 追加なし
- `--no-verify` は使用禁止。pre-push hook の parity check は bypass 導線を持たない
- 詳細は `docs/30-workflows/TASK-AGENTS-SKILLS-FULL-SYNC-001/` 配下 Phase 1-13 を参照

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

#### 3-3. labels / assignees 付与

```bash
# labels（例）
gh pr edit <PR番号> --add-label "infra" --add-label "parity-guard" --add-label "non-visual"

# assignees
gh pr edit <PR番号> --add-assignee "@me"
```

### ステップ 4: Issue #2278 へのコメント（マージ時）

PR がマージされた時点で以下コメントを Issue #2278 に追加する:

```bash
gh issue comment 2278 --body "対応仕様書マージ: PR #<番号> (TASK-AGENTS-SKILLS-FULL-SYNC-001 Phase 1-12 完了仕様書)"
```

**Issue #2278 は既に CLOSED のため、PR merge 時に再度 Close しない。** `Closes #2278` キーワードを PR 本文に含めると GitHub が自動再 Close を試みるため、本 PR 本文では `Closes (notional):` の形式で表記し、自動再 Close を起こさない。

## --no-verify 禁止の再確認

CLAUDE.md に基づき、本 Phase で以下を**絶対に使用禁止**とする:

- `git commit --no-verify`
- `git commit -n`
- `git push --no-verify`

pre-push hook が parity NG により fail した場合は、`bash .claude/scripts/sync-skills-mirror.sh` で差分を解消してから再度 push する。hook を skip する導線は本タスクで意図的に提供しない。

## CI 確認項目（PR 作成後）

| 項目                   | 確認方法                                                      | 期待                 |
| ---------------------- | ------------------------------------------------------------- | -------------------- |
| lint                   | `gh pr checks <PR番号>` で lint ジョブ                        | success              |
| typecheck              | `gh pr checks <PR番号>` で typecheck ジョブ                   | success              |
| test                   | `gh pr checks <PR番号>` で test ジョブ（vitest / playwright） | success              |
| parity ガード（CI 側） | pre-push と等価な verify が CI job として走るか               | success もしくは N/A |
| 全チェック green       | `gh pr view <PR番号> --json statusCheckRollup`                | `SUCCESS`            |

いずれかの CI が fail した場合は、fail したジョブのログを読み、修正コミットを追加する。`--no-verify` による CI bypass は禁止。

## 統合テスト連携

- Phase 9 / 12 の local check 結果を `outputs/phase-13/local-check-result.md` に再利用する
- Phase 11 の `bash-execution-log.txt` を PR 本文の Test plan エビデンスとして引用
- マージ後に `.claude/skills/aiworkflow-requirements/LOGS.md` に「PR #<番号> マージ完了」を追記し、mirror へ再同期する（完了後の運用申し送りで詳述）

## 多角的チェック観点（AIが判断）

- 批判的思考: approval なしに PR を作成する抜け道がないか（自動化スクリプトに user 承認ゲートを必ず挟むか）
- 戦略的思考: blocked のままでも次の作業者が再開しやすいか（解除条件が明文化されているか）
- 責務境界: Issue #2278 の CLOSED 状態を尊重し、再 Close しない設計になっているか
- 運用性: `--no-verify` 禁止ルールが PR body と手順の両方に明記されているか

## サブタスク管理

| SubTask | 内容                                                       | 並列性 | 担当 Lane      |
| ------- | ---------------------------------------------------------- | ------ | -------------- |
| ST-51   | blocked 理由と解除条件の再宣言                             | seq    | Lane C（仕様） |
| ST-52   | local check 雛形（lint / typecheck / test / parity）の整備 | seq    | Lane A（検証） |
| ST-53   | PR body / title / labels / assignees 雛形の整備            | seq    | Lane C（仕様） |
| ST-54   | Issue #2278 コメント文面の整備                             | seq    | Lane C（仕様） |
| ST-55   | approval 受領後のコマンド列確定                            | seq    | Lane A（実行） |

## 成果物

- `outputs/phase-13/local-check-result.md`（承認後 local check 実行結果）
- `outputs/phase-13/change-summary.md`（承認後 change summary）
- `outputs/phase-13/pr-info.md`（PR title / body / labels / assignees 最終案）
- `outputs/phase-13/approval-record.md`（user 承認のタイムスタンプと表現を記録）

## 完了条件

- [ ] user 承認必須が本仕様書に明記されている（AC-8 準拠）
- [ ] blocked 理由と解除条件が明記されている
- [ ] 承認後の成果物パス 4 本が定義されている
- [ ] PR title 雛形が `feat(parity-guard): TASK-AGENTS-SKILLS-FULL-SYNC-001 ...` で確定している
- [ ] PR body が Summary / Test plan / Related issues / Notes の 4 節構成で雛形化されている
- [ ] Issue #2278 が CLOSED のため再 Close しない旨を明記している
- [ ] マージ時のコメント文面（「対応仕様書マージ: PR #<番号>」）を明記している
- [ ] `--no-verify` 禁止が再確認されている
- [ ] CI 確認項目（lint / typecheck / test）が列挙されている

## タスク100%実行確認【必須】

- [ ] blocked 条件を記載した
- [ ] 成果物パスを記載した
- [ ] commit / PR 自動実行禁止を記載した
- [ ] user 承認確認プロンプトを記載した
- [ ] Issue #2278 CLOSED 扱いの運用（再 Close しない / コメントのみ）を明記した
- [ ] `--no-verify` 禁止を明記した

## 完了後の運用申し送り

- PR マージ後に以下を順次実行する:
  1. `.claude/skills/aiworkflow-requirements/LOGS.md` に「PR #<番号> マージ完了」を追記
  2. `bash .claude/scripts/sync-skills-mirror.sh` で mirror へ再同期
  3. `task-workflow-completed.md` の status を `spec_created` から `merged` に更新
  4. `gh issue comment 2278 --body "対応仕様書マージ: PR #<番号>"` を実行（再 Close しない）
- 次の作業者への引き継ぎ:
  - 本タスクは shell スクリプト導入のみ。**CI 側での mirror sync 自動化** は `task-p0-05-mirror-sync-automation` の責務として未実装のまま残る
  - **post-merge hook と parity check の連結** は中位優先度の follow-up として `unassigned-task-detection.md` に記録済み
  - parity ガードのメンテナンス: `generate-index.js` の deterministic 性が壊れた場合、sync スクリプトが exit 1 で検知するため、canonical 側の `generate-index.js` を優先修正する
- セッション再開時の注意:
  - `blocked` 状態の本 Phase を誤って自動進行させないよう、次セッションでは冒頭で本仕様書の「ステータス: blocked」セクションを読み直す
  - `CLAUDE_SKIP_HEAVY_HOOKS=1` を set している環境では session-init の parity warning が出ないため、手動で `bash .claude/scripts/verify-skills-parity.sh` を実行する
