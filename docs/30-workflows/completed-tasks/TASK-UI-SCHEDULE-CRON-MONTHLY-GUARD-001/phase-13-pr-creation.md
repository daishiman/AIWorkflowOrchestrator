# Phase 13: PR 作成

## メタ情報

| 項目       | 内容                                    |
| ---------- | --------------------------------------- |
| Phase      | 13                                      |
| Phase名    | PR 作成                                 |
| 前提Phase  | Phase 12（ドキュメント更新）            |
| 後続Phase  | -（最終Phase）                          |
| ステータス | 未実施（ユーザー承認待ち）              |
| 作成日     | 2026-04-13                              |
| 機能名     | TASK-UI-SCHEDULE-CRON-MONTHLY-GUARD-001 |

---

## 目的

全実装・テスト・ドキュメント更新が完了した状態で、ユーザーの明示的な承認を得た後に
のみ実行できる PR 作成ゲートを整える。承認前はコミット・プッシュ・PR 作成を実行しない。

## 重要な警告

> **このPhaseはユーザー承認待ちです。承認なしで `git commit` / `git push` / `gh pr create` を実行してはいけません。**
>
> このPhase内のコマンドは、承認後に使うテンプレートとしてのみ記載します。

---

## 実行タスク

> 以下のタスクは、承認前は「準備」と「テンプレート化」のみを行い、実行系コマンドは走らせません。

### タスク1: 最終差分確認

**目的**: 承認ゲートに進める前提条件を最終確認する

**実行手順**:

1. 変更差分を確認する:
   ```bash
   git diff --stat
   git status
   ```
2. 以下のファイルが含まれていることを確認する:
   - `apps/desktop/src/renderer/utils/cronConverter.ts`（ガード処理追加・JSDoc更新）
   - `apps/desktop/src/__tests__/utils/cronConverter.edge.test.ts`（TC-11〜TC-15追加）
3. スコープ外のファイルが含まれていないか確認する
4. 承認前に実行してよいのは差分確認のみであり、`git commit` / `git push` / `gh pr create` は実行しない

**期待される成果物**:

- `outputs/phase-13/approval-gate-checklist.md`
- `outputs/phase-13/pre-approval-diff-log.md`

---

### タスク2: コミット作成テンプレート整備

**目的**: 承認後にのみ使うコミット手順をテンプレート化する

**実行手順**:

1. 承認後に実行する対象ファイルを明記する:
   - `apps/desktop/src/renderer/utils/cronConverter.ts`
   - `apps/desktop/src/__tests__/utils/cronConverter.edge.test.ts`
2. 承認後に実行する `git commit` のテンプレートを記録する:
   ```bash
   git add apps/desktop/src/renderer/utils/cronConverter.ts
   git add apps/desktop/src/__tests__/utils/cronConverter.edge.test.ts
   git commit -m "fix(cron): TASK-UI-SCHEDULE-CRON-MONTHLY-GUARD-001 cronConverter monthly 空dayOfMonth ガード処理追加"
   ```
3. pre-commit フックは、ユーザー承認後にのみ実行する前提で記録する（`--no-verify` は使用禁止）
4. この段階では実際のコミットは作成しない

**期待される成果物**:

- `outputs/phase-13/commit-command-template.md`

---

### タスク3: PR 作成テンプレート整備

**目的**: 承認後にのみ実行する push / PR 作成手順をテンプレート化する

**実行手順**:

1. 承認後に実行するプッシュ手順を記録する:
   ```bash
   git push -u origin <branch-name>
   ```
2. 承認後に実行する PR 作成コマンドをテンプレートとして記録する:
   ```bash
   gh pr create \
     --title "fix(cron): TASK-UI-SCHEDULE-CRON-MONTHLY-GUARD-001 cronConverter monthly 空dayOfMonth ガード処理追加" \
     --body-file outputs/phase-13/pr-body-template.md
   ```
3. `outputs/phase-13/pr-body-template.md` には、概要・変更内容・受け入れ条件・関連 Issue（`Closes #2108`）を含める
4. この段階では `git push` と `gh pr create` は実行しない
5. PR 本文の `Closes #2108` は、承認後の実行時に有効化する

**期待される成果物**:

- `outputs/phase-13/pr-command-template.md`
- `outputs/phase-13/pr-body-template.md`

---

### タスク4: 承認後の実行条件と記録準備

**目的**: ユーザー承認後にだけ実行へ進むための最終確認と記録欄を準備する

**実行手順**:

1. ユーザー承認が取れるまで待機する
2. 承認後にだけ `git commit` / `git push` / `gh pr create` を実行する
3. 承認後に `gh pr checks` で CI/CD 起動を確認する
4. 実行後に `outputs/phase-13/pr-url.txt` と `outputs/phase-13/pr-creation-log.md` を記録する
5. 承認前の時点では、これらの実ファイルは未生成であることを明記する

**期待される成果物**:

- `outputs/phase-13/approval-gate-status.md`
- `outputs/phase-13/post-approval-runbook.md`

---

## 参照資料

| 参照資料                | パス                                                            | 内容                        |
| ----------------------- | --------------------------------------------------------------- | --------------------------- |
| Phase 12 仕様更新       | `outputs/phase-12/system-spec-update-summary.md`                | 仕様同期の確認              |
| Phase 12 成果物         | `outputs/phase-12/documentation-changelog.md`                   | 変更内容の確認              |
| Phase 12 フィードバック | `outputs/phase-12/skill-feedback-report.md`                     | skill 改善知見              |
| Phase 12 準拠チェック   | `outputs/phase-12/phase12-task-spec-compliance-check.md`        | Phase 12 完了確認           |
| Phase 10 成果物         | `outputs/phase-10/ac-final-check.md`                            | AC 最終確認書               |
| 関連 Issue              | https://github.com/daishiman/AIWorkflowOrchestrator/issues/2108 | Issue #2108（クローズ済み） |

---

## 成果物

| 成果物               | パス                                          | 内容               |
| -------------------- | --------------------------------------------- | ------------------ |
| 承認前チェックリスト | `outputs/phase-13/approval-gate-checklist.md` | 承認前の確認事項   |
| 承認ゲート状態       | `outputs/phase-13/approval-gate-status.md`    | 承認待ち状態の記録 |
| 差分確認ログ         | `outputs/phase-13/pre-approval-diff-log.md`   | 最終差分確認の記録 |
| コミットテンプレート | `outputs/phase-13/commit-command-template.md` | 承認後の実行手順   |
| PR テンプレート      | `outputs/phase-13/pr-command-template.md`     | 承認後の実行手順   |
| PR 本文テンプレート  | `outputs/phase-13/pr-body-template.md`        | PR 本文のひな形    |
| 実行後記録ひな形     | `outputs/phase-13/post-approval-runbook.md`   | 承認後の記録手順   |

---

## 完了条件

- [ ] ユーザーの明示的な承認を得ている
- [ ] 承認前は `git commit` / `git push` / `gh pr create` を実行しない方針が明記されている
- [ ] `git commit` / `git push` / `gh pr create` の承認後テンプレートが整っている
- [ ] PR の概要・変更内容・受け入れ条件のテンプレートが正しく記述されている
- [ ] `Closes #2108` の記載が PR 本文テンプレートに含まれている
- [ ] `outputs/phase-12/system-spec-update-summary.md` が存在する
- [ ] `outputs/phase-12/documentation-changelog.md` が存在する
- [ ] `outputs/phase-12/skill-feedback-report.md` が存在する
- [ ] `outputs/phase-12/phase12-task-spec-compliance-check.md` が存在する
- [ ] `outputs/phase-13/approval-gate-status.md` が作成されている
- [ ] `outputs/phase-13/approval-gate-checklist.md` が作成されている
- [ ] `outputs/phase-13/pre-approval-diff-log.md` が作成されている
- [ ] `outputs/phase-13/commit-command-template.md` が作成されている
- [ ] `outputs/phase-13/pr-command-template.md` が作成されている
- [ ] `outputs/phase-13/pr-body-template.md` が作成されている
- [ ] `outputs/phase-13/post-approval-runbook.md` が作成されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスク（タスク1〜4）を100%準備完了
- [ ] 各タスクを100%完了し、承認前は実行しない旨を明記
- [ ] 成果物が全て生成され、承認待ちゲートとして整合していることを確認

---

## 依存関係

- **前提**: Phase 12（ドキュメント更新）が完了していること
- **後続**: なし（本タスクの最終Phase）

---

## 注意事項

- `git commit --no-verify` は絶対使用禁止（CLAUDE.md 参照）
- 承認前の `git commit` / `git push` / `gh pr create` は禁止
- PR のマージはレビュー承認後に行う
- Issue #2108 は PR マージ後に自動クローズされるため、`Closes #2108` は PR 本文テンプレートにのみ記載する

---

## Phase実行記録（完了後に記録）

```markdown
## Phase 13 実行記録

### 承認ゲート

- ユーザー承認:
- 承認日時:
- 承認前の実行有無: なし

### テンプレート作成状況

- コミットテンプレート:
- PR テンプレート:
- PR 本文テンプレート:
- 承認後実行手順:

### コミット情報

- コミットハッシュ:
- コミットメッセージ:

### PR 情報

- PR URL:
- PR 番号:
- CI 状態:

### 完了宣言

TASK-UI-SCHEDULE-CRON-MONTHLY-GUARD-001 の Phase 13 は承認ゲートとして整備され、承認前の実行は行っていません。
```

---

## タスク完了

`TASK-UI-SCHEDULE-CRON-MONTHLY-GUARD-001` の全 Phase が完了したら、
`artifacts.json` の `status` を `"completed"` に更新してください。
