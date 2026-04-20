---
phase: 13
task_id: TASK-SC-CANCEL-LOGS-SYNC-001
task_name: キャンセルクリーンアップ仕様書 repo-wide LOGS/lessons-learned同期
task_type: NON_VISUAL
category: documentation-sync
status: blocked
blocked_reason: user approval required
parent_task: TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001
issue_number: 2313
issue_state: CLOSED
created_date: 2026-04-20
prev_phase: 12
next_phase: -
---

# Phase 13: PR 作成

## メタ情報

| 項目       | 値                                                                                 |
| ---------- | ---------------------------------------------------------------------------------- |
| Phase      | 13                                                                                 |
| タスクID   | TASK-SC-CANCEL-LOGS-SYNC-001                                                       |
| タスク名   | キャンセルクリーンアップ仕様書 repo-wide LOGS/lessons-learned同期                  |
| タスク種別 | NON_VISUAL（ドキュメント追記タスク・スクリーンショット代替証跡）                   |
| 親タスク   | TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001                                             |
| Issue      | [#2313](https://github.com/daishiman/AIWorkflowOrchestrator/issues/2313)（CLOSED） |
| ステータス | **blocked**（user の明示承認取得まで実行禁止）                                     |
| 前Phase    | [phase-12-documentation.md](phase-12-documentation.md)（別エージェント担当）       |
| 次Phase    | -（最終Phase）                                                                     |
| 作成日     | 2026-04-20                                                                         |

---

## 視覚証跡

**UI/UX 変更なしのため Phase 11 スクリーンショット不要。** NON_VISUAL ドキュメント追記タスクのため、
代替として Phase 11 の `outputs/phase-11/manual-test-result.md`（grep 出力スナップショット）と
Phase 12 の `outputs/phase-12/documentation-changelog.md` を PR 本文から参照する。

---

## 目的

user の明示承認を取得した後にのみ PR 準備へ進めるよう、**blocked 条件** と
**承認後の実行フロー**、**PR 雛形（タイトル / 本文 / コミットメッセージ）**、
および **Issue #2313 との関係（既 CLOSED 扱い）** を確定する。
本仕様書は PR 作成のルールブックであり、本 Phase 作業中に PR を作成することはない。

---

## ステータス: blocked

以下すべてが揃うまで、本 Phase は `blocked` のまま維持する。

| 解除条件                                                         | 確認方法                                                                                          |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| user から「PR 出して」等の明示的な承認表現が会話に残っていること | 会話履歴に「PR 出して / PR 作成して / YES」等の承認表現が残っていること                           |
| Phase 12 完了条件のすべてが満たされていること                    | `outputs/phase-12/phase12-task-spec-compliance-check.md` の checklist がすべて埋まる              |
| Phase 11 の TC-01〜TC-05 すべてが期待結果と一致                  | `outputs/phase-11/manual-test-result.md` の全 TC が PASS（placeholder-only は不可）               |
| 親タスク `index.md` の Phase 12 ステータスが `completed` 化済み  | `grep -n "Phase 12.*completed" docs/30-workflows/TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001/index.md` |
| local check（lint / typecheck / test）すべて green               | `outputs/phase-13/local-check-result.md` を後述手順で記録済み                                     |

> 本タスクは Phase 1 受入基準 AC-1〜AC-5 を all-must-pass で満たしたうえで、
> 上記解除条件すべてが揃った段階で、はじめて user 承認を求める段階に進める。

---

## 前提条件

- Phase 1 (要件定義) 〜 Phase 12 (本タスク close-out) が `completed`
- 本タスクの両 LOGS.md（task-specification-creator / aiworkflow-requirements）への close-out エントリが追記済み
- 親タスク `TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001/index.md` の Phase 12 が `completed` 化済み
- lessons-learned-current-2026-04.md（または同等）への 3 知見反映が完了
- worktree が clean（未追跡 / 未コミットの想定外ファイルが存在しない）
- 想定ブランチ名: `docs/task-spec-TASK-SC-CANCEL-LOGS-SYNC-001`（実際の push は user 承認後）

---

## 確認プロンプト（user への問い合わせテンプレート）

本 Phase を解除するには、以下のプロンプトで user から明示承認を取得する。

> PR を作成しますか？
>
> - ブランチ名（案）: `docs/task-spec-TASK-SC-CANCEL-LOGS-SYNC-001`
> - PR title（案）: `docs(skill-logs): TASK-SC-CANCEL-LOGS-SYNC-001 repo-wide LOGS/lessons-learned同期・CANCEL-CLEANUP Phase 12完了宣言`
> - base: `main`
> - 実行内容: local check 再実行 → branch push → gh pr create → CI 確認
> - 関連 Issue: #2313（既 CLOSED のため再 Close せず、参照リンクのみ）
>
> 上記で進めてよければ「PR 出して」または「YES」、修正が必要なら具体的な指示を返信してください。

user から YES / 「PR 出して」以外（沈黙・曖昧表現・別の指示）を受けた場合は、
本 Phase を `blocked` のまま継続する。

---

## 実行タスク（plan のみ。承認後にのみ実行）

1. blocked 理由と解除条件を本仕様書で再宣言する
2. Phase 12 までの完了根拠（両 LOGS / canonical spec / lessons-learned / 親 index.md）を整理する
3. approval 後の local check と PR 情報の雛形を `outputs/phase-13/` 配下に整備する
4. Issue #2313（既 CLOSED）との関係を明記し、本 PR では再 Close しないことを宣言する
5. approval 受領後にのみ、後述「PR 提出手順」のコマンド列を実行する

---

## 参照資料

| 資料名                | パス                                                                                    | 用途                                |
| --------------------- | --------------------------------------------------------------------------------------- | ----------------------------------- |
| Phase 13 骨格テンプレ | `.claude/skills/task-specification-creator/references/phase-template-phase13.md`        | blocked ルール                      |
| Phase 13 詳細テンプレ | `.claude/skills/task-specification-creator/references/phase-template-phase13-detail.md` | 実行手順 / `/ai:diff-to-pr` 連携    |
| Phase 12 ドキュメント | `phase-12-documentation.md`                                                             | close-out 前提                      |
| Phase 11 手動テスト   | `phase-11-manual-test.md`                                                               | NON_VISUAL 代替証跡                 |
| 親タスク index.md     | `docs/30-workflows/TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001/index.md`                     | Phase 12 完了宣言の確認対象         |
| 親タスク Phase 13     | `docs/30-workflows/TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001/phase-13-pr-creation.md`      | scope 外宣言の参照                  |
| CLAUDE.md             | `CLAUDE.md`（リポジトリルート）                                                         | `--no-verify` 禁止ルール            |
| Issue #2313           | https://github.com/daishiman/AIWorkflowOrchestrator/issues/2313                         | 元 Issue 本文（既 CLOSED）          |
| github-issue-manager  | `.claude/skills/github-issue-manager/SKILL.md`                                          | gh CLI 操作規約                     |
| 類似タスク Phase 13   | `docs/30-workflows/completed-tasks/TASK-AGENTS-SKILLS-FULL-SYNC-001/phase-13-pr.md`     | NON_VISUAL / Issue 既 CLOSED の参考 |

### システム仕様（aiworkflow-requirements）

| 参照資料                | パス                                                                           | 内容                              |
| ----------------------- | ------------------------------------------------------------------------------ | --------------------------------- |
| task-workflow           | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`           | PR 作成の canonical / mirror 原則 |
| task-workflow-completed | `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md` | PR マージ後の完了タスク登録先     |

---

## PR 提出手順（承認後のみ実行）

> 以下のコマンド列は **user 承認取得後のみ** 実行する。
> 本仕様書はテキストとして手順を残すのみで、本 Phase 作業中には実行しない。

### ステップ 1: blocked 条件の維持（user 承認取得前）

承認が確認できない限り、本 Phase 作業として許可されるのは以下のみ。

- 本仕様書の読み込み / レビュー
- Phase 11 / Phase 12 成果物の再確認
- local check 結果の事前準備（実行はするが push / PR 作成はしない）
- commit / push / PR 作成は **一切自動化しない**
- `outputs/phase-13/` 配下は draft のみで留める

### ステップ 2: 承認後の local check

承認取得後、最初に以下を実行して green を確認する。

```bash
# 作業ディレクトリ確認
pwd
git status
git branch --show-current

# lint
pnpm lint

# typecheck
pnpm typecheck

# test（差分関連のみで可。ドキュメント追記のみのため最小範囲で OK）
pnpm vitest run

# 追記検証（NON_VISUAL 代替証跡の最終確認）
grep -n "TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001" .claude/skills/task-specification-creator/LOGS.md
grep -n "TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001" .claude/skills/aiworkflow-requirements/LOGS.md
grep -rn "TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001" .claude/skills/aiworkflow-requirements/references/
grep -n "Phase 12.*completed\|status.*completed" docs/30-workflows/TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001/index.md
```

結果を `outputs/phase-13/local-check-result.md` に記録する。
**いずれかが fail した場合は PR 作成に進まず、修正後に再実行する。`--no-verify` による回避は禁止。**

### ステップ 3: ブランチ作成・push（承認後のみ）

```bash
# 現状確認
git status
git branch --show-current

# 想定ブランチ名で作業中でなければチェックアウト
# （既に worktree 内で作業しているならスキップ可）
git checkout -b docs/task-spec-TASK-SC-CANCEL-LOGS-SYNC-001

# remote への push（初回は -u で upstream 設定）
git push -u origin docs/task-spec-TASK-SC-CANCEL-LOGS-SYNC-001
```

### ステップ 4: コミット作成（承認後のみ）

> 本タスクは「コード変更ゼロ・ドキュメント追記のみ」のため、コミットは
> repo-wide sync 対象 5 ファイル（両 LOGS / task-workflow / lessons-learned / 親 index.md）
>
> - 本タスク自身の outputs を含む構成となる。

```bash
# 追加対象を明示的に指定（git add . は使用しない）
git add .claude/skills/task-specification-creator/LOGS.md
git add .claude/skills/aiworkflow-requirements/LOGS.md
git add .claude/skills/aiworkflow-requirements/references/task-workflow.md
git add .claude/skills/aiworkflow-requirements/references/task-workflow-active.md  # 存在時のみ
git add .claude/skills/aiworkflow-requirements/references/task-workflow-completed*.md  # 存在時のみ
git add .claude/skills/aiworkflow-requirements/references/lessons-learned-current-2026-04.md  # または同等
git add docs/30-workflows/TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001/index.md
git add docs/30-workflows/TASK-SC-CANCEL-LOGS-SYNC-001/

# コミット作成（HEREDOC で改行を保持）
git commit -m "$(cat <<'EOF'
docs(skill-logs): TASK-SC-CANCEL-LOGS-SYNC-001 repo-wide LOGS/lessons-learned同期・CANCEL-CLEANUP Phase 12完了宣言

- 両スキル LOGS.md（task-specification-creator / aiworkflow-requirements）に
  TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001 の wave 記録および本タスクの close-out 記録を追記
- aiworkflow-requirements/references/task-workflow.md および active/completed 系列に
  親タスクの完了記録を追加
- lessons-learned-current-2026-04.md に 3 知見（NON_VISUAL 代替証跡 / scope 境界明確化 /
  repo-wide sync 持ち越し管理）を反映
- 親タスク docs/30-workflows/TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001/index.md の
  Phase 12 ステータスを in_progress → completed に更新し完了宣言

Refs: #2313 (既 CLOSED のため再 Close しない)
Parent-Task: TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001
EOF
)"

# push（pre-push hook を bypass しない。fail したら fix 後に再 push）
git push
```

> **重要**: `--no-verify` / `-n` オプションは絶対に使用しない（CLAUDE.md 準拠）。
> pre-push hook が fail した場合は、原因を fix してから再 push する。

### ステップ 5: PR 作成（gh CLI / 承認後のみ）

PR title 雛形:

```
docs(skill-logs): TASK-SC-CANCEL-LOGS-SYNC-001 repo-wide LOGS/lessons-learned同期・CANCEL-CLEANUP Phase 12完了宣言
```

PR body テンプレート（HEREDOC で渡す）:

```bash
gh pr create --base main --head "$(git branch --show-current)" \
  --title "docs(skill-logs): TASK-SC-CANCEL-LOGS-SYNC-001 repo-wide LOGS/lessons-learned同期・CANCEL-CLEANUP Phase 12完了宣言" \
  --body "$(cat <<'EOF'
## Summary

- TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001（親タスク）の Phase 12 で持ち越された
  **repo-wide 同期 wave** を完了させ、両スキル LOGS / canonical spec /
  lessons-learned / 親 `index.md` を同一 wave で同期する docs-sync タスク
- 親タスク `TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001/index.md` の Phase 12 を
  `in_progress` → `completed` に切り替え、親タスク全体の完了宣言を確定
- NON_VISUAL ドキュメント追記タスクのため UI 変更なし。Phase 11 では
  grep 出力スナップショットを `outputs/phase-11/manual-test-result.md` に記録し、
  TC-01〜TC-05 の 5 検証コマンドで AC-1〜AC-5 すべての PASS を実証

## 変更ファイル

| # | パス | 変更内容 |
| - | ---- | -------- |
| 1 | `.claude/skills/task-specification-creator/LOGS.md` | 親タスクの wave 記録（コンテキスト・成果・結果の3節）追記 |
| 2 | `.claude/skills/aiworkflow-requirements/LOGS.md` | 親タスクの close-out 記録（表 1 行）追記 |
| 3 | `.claude/skills/aiworkflow-requirements/references/task-workflow.md` 系列 | 親タスクの完了記録追加（active → completed） |
| 4 | `.claude/skills/aiworkflow-requirements/references/lessons-learned-current-2026-04.md` | 3 知見（NON_VISUAL 代替証跡 / scope 境界 / repo-wide sync 持ち越し）反映 |
| 5 | `docs/30-workflows/TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001/index.md` | Phase 12 ステータス → `completed`、フロントマター更新 |
| - | `docs/30-workflows/TASK-SC-CANCEL-LOGS-SYNC-001/` | 本タスクの Phase 1-13 仕様書一式 + outputs |

## Test plan

- [x] AC-1: task-spec-creator LOGS に親タスクの wave 記録が追記済み
      （`grep -n "TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001" .claude/skills/task-specification-creator/LOGS.md`）
- [x] AC-2: aiworkflow-requirements LOGS に close-out 記録が追記済み
      （同上 `aiworkflow-requirements/LOGS.md`）
- [x] AC-3: task-workflow.md 系列に親タスクの完了記録が追加済み
      （`grep -rn "TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001" .claude/skills/aiworkflow-requirements/references/`）
- [x] AC-4: lessons-learned-current-2026-04.md に 3 知見が反映済み
- [x] AC-5: 親 `index.md` の Phase 12 が `completed`、フロントマター更新済み
- [x] Phase 11 grep スナップショットが `manual-test-result.md` に貼り付け済み（placeholder-only ではない）
- [x] pnpm lint / pnpm typecheck / pnpm vitest run すべて green

## Related Issues

- Refs: #2313（**既に CLOSED**。本 PR は対応仕様書のマージを目的とし、再 Close しない）
- 親タスク: TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001（本 PR で Phase 12 完了宣言を確定）
- 派生元: 親タスクの `outputs/phase-12/unassigned-task-detection.md` で formalize された follow-up

## その他

- **NON_VISUAL ドキュメント追記タスク**につき、コード変更ゼロ・UI 変更なし。
  Phase 11 スクリーンショット不要、grep 出力スナップショットを代替証跡とする
- 最小変更原則に従い、`topic-map.md` / `keywords.json` の不要再生成は行わない
  （ファイル内容変更が発生する場合のみ別タスクで再生成）
- Phase 12 実装ガイドは `outputs/phase-12/implementation-guide.md` を参照
  - Part 1（中学生レベル）: 「やり残しメモを片付ける作業」のたとえ話
  - Part 2（開発者向け）: 5 ファイルの追記マップ・grep 検証コマンド・既存エントリ形式整合の標準化方針

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

### ステップ 6: labels / assignees 付与（承認後のみ）

```bash
# labels（例）
gh pr edit <PR番号> --add-label "documentation" --add-label "non-visual" --add-label "skill-sync"

# assignees
gh pr edit <PR番号> --add-assignee "@me"
```

---

## CI 待機・レビュー対応

### CI 確認項目（PR 作成後）

| 項目             | 確認方法                                               | 期待                 |
| ---------------- | ------------------------------------------------------ | -------------------- |
| lint             | `gh pr checks <PR番号>` で lint ジョブ                 | success              |
| typecheck        | `gh pr checks <PR番号>` で typecheck ジョブ            | success              |
| test             | `gh pr checks <PR番号>` で test ジョブ（vitest）       | success              |
| markdown lint    | `gh pr checks <PR番号>` で markdown 系ジョブ（あれば） | success もしくは N/A |
| 全チェック green | `gh pr view <PR番号> --json statusCheckRollup`         | `SUCCESS`            |

いずれかの CI が fail した場合は、fail したジョブのログを読み、修正コミットを追加する。
`--no-verify` による CI bypass は禁止。

### CI 監視コマンド

```bash
# CI を継続監視
gh pr checks <PR番号> --watch

# 最終ステータス確認
gh pr view <PR番号> --json statusCheckRollup
```

### レビュー対応

- レビュアーから指摘があった場合は、本仕様書 Phase 1〜12 の該当 Phase に立ち戻り、必要なら追加コミットで対応
- 形式逸脱（既存エントリ形式と不整合）の指摘は Phase 6 の `format-regression-check.md` を再確認
- scope 外項目への変更要求は Phase 1 の scope 境界に基づき却下、または別タスク化を提案

---

## マージ後 close-out 手順

PR がマージされた時点で、以下を順次実行する。

### 1. Issue #2313 へのコメント（再 Close しない）

Issue #2313 は既に CLOSED のため、PR merge 時に **再度 Close しない**。
`Closes #2313` キーワードを PR 本文に含めると GitHub が自動再 Close を試みるため、
本 PR 本文では `Refs: #2313` の形式で表記し、自動再 Close を起こさない。

```bash
gh issue comment 2313 --body "対応仕様書マージ: PR #<番号> (TASK-SC-CANCEL-LOGS-SYNC-001 / 親タスク TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001 Phase 12 完了宣言)"
```

### 2. 両 LOGS への merge 結果追記（次タスクの責務として記録）

> 本 PR でマージされる LOGS エントリは「Phase 12 完了時点」の状態を記載している。
> マージ完了タイムスタンプの追記は本タスクの scope 外として `outputs/phase-12/unassigned-task-detection.md` で
> follow-up に記録する。

### 3. task-workflow-completed.md の更新（必要時）

```bash
# 親タスクおよび本タスクのステータスを spec_created → merged に更新
# （別 wave で実施する。本 PR には含めない）
```

### 4. タスクディレクトリの completed-tasks への移動（必要時）

phase-template-phase13-detail.md に従い、本タスクのディレクトリを完了タスクフォルダに移動する。
**親タスクのディレクトリ移動は親タスクの責務であり、本タスクの scope 外。**

```bash
# 本タスクのみ移動（親タスクは別 wave）
mv docs/30-workflows/TASK-SC-CANCEL-LOGS-SYNC-001/ docs/30-workflows/completed-tasks/
ls docs/30-workflows/completed-tasks/ | grep TASK-SC-CANCEL-LOGS-SYNC-001

# 移動を別コミットで反映
git add docs/30-workflows/
git commit -m "docs(workflows): TASK-SC-CANCEL-LOGS-SYNC-001 を completed-tasks に移動"
git push
```

---

## Issue #2313 既 CLOSED 扱いの整理【必須】

| 観点                        | 本タスクでの扱い                                                                             |
| --------------------------- | -------------------------------------------------------------------------------------------- |
| Issue 状態                  | **CLOSED**（本タスク開始時点で既に Close されている）                                        |
| PR 本文での参照キーワード   | `Refs: #2313`（**`Closes #2313` は使わない**。GitHub の自動再 Close を回避）                 |
| マージ時の Issue 再 Close   | **行わない**。`gh issue comment 2313` で対応 PR をコメントとして記録するに留める             |
| Issue とのリンク方式        | PR 本文の Related Issues 節に `#2313` を記載 → GitHub が自動的に Issue 側からも参照される    |
| 完了条件における Issue 扱い | Issue の Close は完了条件にしない（既 CLOSED）。代わりに親タスク Phase 12 完了宣言を完了条件 |

> 本 PR の最終ゴールは「**親タスク Phase 12 完了宣言の確定**」と「**両 LOGS / canonical spec の同期**」であり、
> Issue #2313 自体の状態変更は scope 外。Issue #2313 はあくまで本タスク formalize の根拠リンクとして残す。

---

## --no-verify 禁止の再確認

CLAUDE.md に基づき、本 Phase で以下を **絶対に使用禁止** とする:

- `git commit --no-verify`
- `git commit -n`
- `git push --no-verify`

pre-commit / pre-push hook が fail した場合は、原因（lint / typecheck / format / test 失敗）を
特定して fix した上で再度 commit / push する。hook を skip する導線は本タスクで意図的に提供しない。

---

## 多角的チェック観点（AI が判断）

- **批判的思考**: approval なしに PR を作成する抜け道がないか（自動化スクリプトに user 承認ゲートを必ず挟むか）
- **戦略的思考**: blocked のままでも次の作業者が再開しやすいか（解除条件が明文化されているか）
- **責務境界**: Issue #2313 の CLOSED 状態を尊重し、再 Close しない設計になっているか
- **依存整合**: 親タスクの Phase 12 完了宣言と本 PR の依存関係が循環していないか
  （本 PR が完了宣言を確定するため、親タスク Phase 13 とは独立）
- **運用性**: `--no-verify` 禁止ルールが PR body と手順の両方に明記されているか
- **最小変更原則**: `topic-map.md` / `keywords.json` の不要再生成が手順に紛れ込んでいないか

---

## サブタスク管理

| SubTask | 内容                                                       | 並列性 | 担当 Lane      |
| ------- | ---------------------------------------------------------- | ------ | -------------- |
| ST-13-1 | blocked 理由と解除条件の再宣言                             | seq    | Lane C（仕様） |
| ST-13-2 | local check 雛形（lint / typecheck / vitest / grep）の整備 | seq    | Lane A（検証） |
| ST-13-3 | PR title / body / コミットメッセージ雛形の整備             | seq    | Lane C（仕様） |
| ST-13-4 | Issue #2313 既 CLOSED 扱い（再 Close 禁止）の明文化        | seq    | Lane C（仕様） |
| ST-13-5 | approval 受領後のコマンド列確定                            | seq    | Lane A（実行） |
| ST-13-6 | マージ後 close-out 手順（コメント / 移動）の定義           | seq    | Lane C（仕様） |

---

## 成果物

| 成果物                                     | パス                                     | 状態（blocked 中）                |
| ------------------------------------------ | ---------------------------------------- | --------------------------------- |
| local check 結果                           | `outputs/phase-13/local-check-result.md` | draft（承認後に実行結果を上書き） |
| change summary                             | `outputs/phase-13/change-summary.md`     | draft（承認後に最終版へ更新）     |
| PR 情報（タイトル / body / labels / base） | `outputs/phase-13/pr-info.md`            | draft（承認後に PR URL 等を追記） |
| approval 記録                              | `outputs/phase-13/approval-record.md`    | 承認受領時に新規作成              |
| PR 作成結果                                | `outputs/phase-13/pr-creation-result.md` | 承認後 PR 作成時に新規作成        |

> blocked 中は draft のみ。**draft 成果物を close-out 完了の根拠に使わない**こと。

---

## 完了条件

- [ ] user 承認必須が本仕様書に明記されている
- [ ] blocked 理由（user approval required）と解除条件が明記されている
- [ ] 承認後の成果物パス（local-check / change-summary / pr-info / approval-record / pr-creation-result）が定義されている
- [ ] PR title 雛形が `docs(skill-logs): TASK-SC-CANCEL-LOGS-SYNC-001 ...` で確定している
- [ ] PR body が Summary / 変更ファイル / Test plan / Related Issues / その他 の節構成で雛形化されている
- [ ] コミットメッセージ雛形（HEREDOC 形式）が記載されている
- [ ] Issue #2313 が CLOSED のため再 Close しない旨を明記している
- [ ] マージ時のコメント文面（「対応仕様書マージ: PR #<番号>」）を明記している
- [ ] `--no-verify` 禁止が再確認されている
- [ ] CI 確認項目（lint / typecheck / test）が列挙されている
- [ ] 親タスクとの責務境界（本 PR で Phase 12 完了宣言を確定 / 親タスク Phase 13 移動は別 wave）が明示されている
- [ ] **本 Phase 内の全タスクを 100% 実行完了（blocked 解除なら実行 / blocked 維持なら blocked 状態の保持）**

---

## blocked 解除条件のサマリ

| #   | 解除条件                                                                        | 確認場所                                                            |
| --- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| 1   | user の明示的な承認（「PR 出して」「YES」等）                                   | 会話履歴                                                            |
| 2   | Phase 12 完了条件すべて満たす                                                   | `outputs/phase-12/phase12-task-spec-compliance-check.md`            |
| 3   | Phase 11 TC-01〜TC-05 すべて PASS（grep スナップショットが placeholder でない） | `outputs/phase-11/manual-test-result.md`                            |
| 4   | 親 `index.md` の Phase 12 = `completed`                                         | `docs/30-workflows/TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001/index.md` |
| 5   | local check（lint / typecheck / test）all green                                 | `outputs/phase-13/local-check-result.md`                            |

> **すべて揃った段階で初めて user 承認を求めるプロンプトを提示する。**
> プロンプト未提示・回答未取得の状態では本 Phase は blocked のまま。

---

## Phase 末端アクション【必須】

- [ ] 本仕様書が blocked 状態を明示している
- [ ] commit / PR 自動実行禁止を記載した
- [ ] user 承認確認プロンプトを記載した
- [ ] Issue #2313 CLOSED 扱いの運用（再 Close しない / コメントのみ）を明記した
- [ ] `--no-verify` 禁止を明記した
- [ ] PR 提出手順（git checkout / git add / git commit / git push / gh pr create）が一式 HEREDOC 形式で記載されている
- [ ] マージ後 close-out 手順（Issue コメント / completed-tasks 移動）が記載されている

---

## 依存関係

- **前提**: Phase 12（本タスク close-out）が `completed` であり、両 LOGS / canonical spec /
  lessons-learned / 親 `index.md` がすべて更新済みであること
- **後続**: なし（最終 Phase）
- **解除トリガ**: user の明示的な「PR 出して」または「YES」等の承認表現

---

## 完了後の運用申し送り

- PR マージ後に以下を順次実行する:
  1. `gh issue comment 2313 --body "対応仕様書マージ: PR #<番号>"` を実行（**再 Close しない**）
  2. `task-workflow-completed.md` の親タスクおよび本タスクの status を `merged` に更新（別 wave）
  3. 本タスクディレクトリを `docs/30-workflows/completed-tasks/` に移動（別コミット）
  4. 親タスクディレクトリの移動は親タスクの責務として残す
- 次の作業者への引き継ぎ:
  - 親タスク `TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001` の Phase 13 PR は **scope 外** として据え置かれている
    （親タスク `phase-13-pr-creation.md` 参照）。本 PR が親タスク Phase 12 完了宣言を確定することで、
    親タスク全体の close-out は実質完了する
  - lessons-learned に反映した 3 知見は次回以降の docs-sync wave で再利用可能。
    特に「NON_VISUAL 代替証跡（grep スナップショット一次ソース化）」は次タスク以降の標準とする
- セッション再開時の注意:
  - `blocked` 状態の本 Phase を誤って自動進行させないよう、次セッションでは冒頭で本仕様書の
    「ステータス: blocked」セクションを読み直す
  - blocked 解除条件 5 件すべてが揃っているか確認してから user 承認プロンプトを提示する
