# Phase 13: PR作成 - タスク仕様書

> **重要: PR作成はユーザーの明示的な承認後のみ実施してください。**
>
> Phase 12 完了後、自動的に PR を作成してはいけません。
> 必ずユーザーに「Phase 12 が完了しました。PR を作成してよいですか？」と確認し、
> 明示的な承認（「はい」「作成してください」等）を得てから以下の手順を実行してください。

---

## メタ情報

| 項目       | 内容                                                        |
| ---------- | ----------------------------------------------------------- |
| Phase      | 13                                                          |
| Phase名    | PR作成                                                      |
| タスクID   | UT-SKILL-WIZARD-FB-04-WORKFLOW-LEDGER-SYNC-001              |
| 機能名     | Phase 12 ledger/lane/artifacts 三者同期チェックリスト標準化 |
| タスク種別 | **docs-only**（コード変更なし・スキルテンプレート更新のみ） |
| 前提Phase  | Phase 12（ドキュメント更新）                                |
| 後続Phase  | -（最終Phase）                                              |
| ステータス | 未実施                                                      |
| 作成日     | 2026-04-11                                                  |

---

## 目的

Phase 1〜12 で完了した変更内容（`task-specification-creator` スキルの Phase 12 テンプレートへの
ledger/lane/artifacts 三者同期チェックリスト追加）をリポジトリへマージするための
Pull Request を作成する。

## 背景

本タスクは docs-only タスクであり、変更対象は以下の3ファイルである：

| 変更ファイル                                                                                | 変更内容                                  |
| ------------------------------------------------------------------------------------------- | ----------------------------------------- |
| `.claude/skills/task-specification-creator/SKILL.md`                                        | よくある漏れテーブルに FB-04 エントリ追加 |
| `.claude/skills/task-specification-creator/assets/phase12-task-spec-compliance-template.md` | 三者同期チェックリストセクション追加      |
| `.claude/skills/task-specification-creator/references/phase-12-documentation-guide.md`      | Task 12-2 Step 1-A の三者同期手順を明文化 |

---

## 実行タスク

> **Task / Step 分離ルール**: このセクションには plan のみを書く。実行結果は `outputs/phase-13/` へ記録する。

---

### Task 1: PR 作成前確認

**目的**: PR 作成前に変更内容・ブランチ状態・CI 設定を確認する

**実行手順**:

1. 現在のブランチ名を確認する

   ```bash
   git branch --show-current
   ```

2. 変更ファイルの最終確認

   ```bash
   git diff --stat origin/main
   ```

3. Phase 12 の全成果物が存在することを確認する

   ```bash
   ls docs/30-workflows/ut-skill-wizard-fb04-workflow-ledger-sync/outputs/phase-12/
   ```

4. 未コミットの変更がないことを確認する
   ```bash
   git status
   ```

---

### Task 2: PR 作成

**目的**: `gh pr create` コマンドで Pull Request を作成する

**PR タイトル案**:

```
feat(task-spec): Phase 12 close-out ledger/lane/artifacts 三者同期チェックリスト標準化
```

**PR 作成コマンド**:

```bash
gh pr create \
  --title "feat(task-spec): Phase 12 close-out ledger/lane/artifacts 三者同期チェックリスト標準化" \
  --body "$(cat <<'EOF'
## Summary

- `task-specification-creator` スキルの Phase 12 テンプレートに ledger/lane/artifacts 三者同期チェックリストを追加した（docs-only 変更）
- 変更対象3ファイル: `SKILL.md` よくある漏れテーブル・`phase12-task-spec-compliance-template.md`・`phase-12-documentation-guide.md`
- Phase 12 close-out 時に更新が必要な5箇所（backlog ledger / completed ledger / lane index / artifacts.json × 2）を明文化し、実行者が発見ドリブンで修正を繰り返す状況を防止する

## 背景

`UT-SKILL-WIZARD-W0-SMART-DEFAULT-REASONING-001` の Phase 12 実行中に、
`task-workflow.md`・`task-workflow-completed.md`・`lane/index.md`・`outputs/artifacts.json` の
4〜5 箇所を同時更新する必要があることが段階的に判明した。
この経験を `task-specification-creator` Phase 12 テンプレートへ標準化することで、
今後の同種タスクでの漏れを防止する。

## Test plan

- [ ] TC-01: `SKILL.md` の「よくある漏れ」テーブルに `[FB-04]` エントリが追加されていること
- [ ] TC-02: `phase12-task-spec-compliance-template.md` に三者同期チェックリストセクションが追加されていること
- [ ] TC-03: チェックリストに `task-workflow.md`（backlog ledger）が含まれていること
- [ ] TC-04: チェックリストに `task-workflow-completed.md`（completed ledger）が含まれていること
- [ ] TC-05: チェックリストに `lane/index.md`（lane index）が含まれていること
- [ ] TC-06: チェックリストに `outputs/artifacts.json`（成果物 JSON）が含まれていること
- [ ] TC-07: チェックリストに `.claude/skills/task-specification-creator/outputs/artifacts.json`（スキル成果物 JSON）が含まれていること
- [ ] TC-08: `phase-12-documentation-guide.md` の Step 1-A 手順に三者同期ステップが追記されていること
- [ ] TC-09: チェックリストが Phase 12 の必須完了条件として組み込まれていること
- [ ] TC-10: `.agents/skills/` mirror が `.claude/skills/` と同期されていること（diff がないこと）
- [ ] TC-11: 追加されたチェックリスト項目の文言が `- [ ] <動詞> + <目的語>` 形式に従っていること
- [ ] TC-12: `SKILL.md` の `[FB-04]` エントリが既存エントリの命名規則（`漏れパターン` / `防止方法` 2列構成）に従っていること
- [ ] 手動確認: Phase 12 close-out を模擬実行し、チェックリストの項目が漏れなく実行できることを確認
- [ ] 手動確認: `phase-12-documentation-guide.md` の三者同期ステップに沿って5ファイルを更新できることを確認
EOF
)"
```

**期待される成果物**: GitHub PR の URL

---

### Task 3: PR 作成後確認

**目的**: PR が正しく作成されたことを確認し、CI ステータスを記録する

**実行手順**:

1. 作成した PR の URL を記録する

   ```bash
   gh pr view --web
   ```

2. CI の実行状況を確認する（docs-only のため lint チェックのみ）

   ```bash
   gh pr checks
   ```

3. PR の詳細情報を `outputs/phase-13/pr-creation-result.md` に記録する

---

## 参照資料

| 参照資料                  | パス                                                                                        | 内容                             |
| ------------------------- | ------------------------------------------------------------------------------------------- | -------------------------------- |
| SKILL.md                  | `.claude/skills/task-specification-creator/SKILL.md`                                        | よくある漏れテーブル（変更先）   |
| Phase 12 準拠テンプレート | `.claude/skills/task-specification-creator/assets/phase12-task-spec-compliance-template.md` | 三者同期チェックリスト（変更先） |
| Phase 12 ガイド           | `.claude/skills/task-specification-creator/references/phase-12-documentation-guide.md`      | Step 1-A 手順（変更先）          |
| Phase 12 成果物           | `outputs/phase-12/`                                                                         | Phase 12 で作成した全成果物      |
| タスク index              | `docs/30-workflows/ut-skill-wizard-fb04-workflow-ledger-sync/index.md`                      | Phase一覧・タスク概要            |

---

## 成果物

| 成果物        | パス                                     | 内容                            |
| ------------- | ---------------------------------------- | ------------------------------- |
| GitHub PR URL | -（PR 作成後にここへ記録）               | マージ対象の Pull Request URL   |
| PR 作成記録   | `outputs/phase-13/pr-creation-result.md` | PR URL・CI ステータス・作成日時 |

---

## 完了条件

- [ ] ユーザーから PR 作成の明示的な承認を得ていること
- [ ] Task 1: PR 作成前確認が完了しており、未コミットの変更がないこと
- [ ] Task 2: `gh pr create` コマンドが成功し、GitHub PR URL が取得できていること
- [ ] Task 2: PR タイトルが指定の形式に従っていること
- [ ] Task 2: PR 本文に Summary・背景・Test plan（TC-01〜TC-12 + 手動確認）が含まれていること
- [ ] Task 3: CI ステータスが確認されていること
- [ ] Task 3: `outputs/phase-13/pr-creation-result.md` が作成されていること
- [ ] 本Phase内の全タスクを100%実行完了

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物（GitHub PR URL・pr-creation-result.md）が生成されていることを確認
- [ ] ユーザーへ PR URL を報告する

---

## 依存関係

- **前提**: Phase 12（ドキュメント更新）が完了していること
- **前提**: ユーザーから PR 作成の明示的な承認を得ていること
- **後続**: なし（本タスクの最終Phase）

---

## Phase実行記録テンプレート

Phase完了後、以下を記録してください:

```markdown
## Phase 13 実行記録

### 実行タスク

- Task 1（PR 作成前確認）: [結果]
- Task 2（PR 作成）: [結果・PR URL]
- Task 3（PR 作成後確認）: [CI ステータス]

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phase への引き継ぎ事項

- なし（最終Phase）
```
