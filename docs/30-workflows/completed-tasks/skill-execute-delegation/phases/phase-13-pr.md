# Phase 13: PR作成 - タスク仕様書

## メタ情報

| 項目       | 内容                                  |
| ---------- | ------------------------------------- |
| Phase      | 13                                    |
| Phase名    | PR作成                                |
| 前提Phase  | Phase 12 (ドキュメント更新)           |
| 後続Phase  | -（完了）                             |
| ステータス | 未実施                                |
| 作成日     | 2026-02-10                            |
| タスクID   | TASK-FIX-7-1-EXECUTE-SKILL-DELEGATION |
| 機能名     | skill-execute-delegation              |

---

## 目的

変更をコミット・プッシュし、ユーザーの明示的な許可を得てからPull Requestを作成し、CIを確認する。

## 背景

全Phaseが完了した状態で、変更を本番ブランチにマージするためのPRを作成する。

---

## 使用スキル

> このPhaseでは `/ai:diff-to-pr` スキルを使用してPR作成を行います。

---

## 参照資料

| 参照資料         | パス                                                           | 内容                   |
| ---------------- | -------------------------------------------------------------- | ---------------------- |
| SkillService実装 | `apps/desktop/src/main/services/skill/SkillService.ts`         | PR対象コード           |
| SkillExecutor    | `apps/desktop/src/main/skill-system/executor/SkillExecutor.ts` | 関連コード             |
| 実装ガイド       | `outputs/phase-12/implementation-guide.md`                     | 変更内容のドキュメント |
| 全Phase成果物    | `outputs/phase-*/`                                             | 全成果物               |

---

## 成果物

| 成果物 | パス                          | 内容           |
| ------ | ----------------------------- | -------------- |
| PR情報 | `outputs/phase-13/pr-info.md` | PR URL・CI結果 |

---

## PR作成フロー

```
Phase 13: PR作成
    ↓
【Step 1】ユーザーにローカル動作確認を依頼
    ↓
【Step 2】変更サマリーの提示と許可確認
    ↓
【Step 3】ユーザー許可後に /ai:diff-to-pr 実行
    ↓
【Step 4】CI通過確認
    ↓
【Step 5】タスクディレクトリを completed-tasks/ に移動
    ↓
【Step 6】変更をコミット・プッシュ
    ↓
ワークフロー完了
```

---

## 実行手順

### Step 1: ユーザーにローカル動作確認を依頼【必須】

PR作成前に、ユーザーにローカル環境での動作確認を依頼する。

````markdown
## ローカル動作確認依頼

以下のコマンドでローカル動作を確認してください:

1. 開発サーバー起動:
   ```bash
   pnpm --filter @repo/desktop dev
   ```
````

2. スキル実行フローを手動で確認:
   - スキル一覧画面を開く
   - 任意のスキルを実行
   - ストリーミングメッセージが表示されることを確認
   - 中断機能が動作することを確認

確認完了後、PR作成を許可してください。

````

### Step 2: 変更サマリーの提示と許可確認【必須】

変更内容のサマリーを提示し、PRを作成してよいかユーザーに確認する。

```markdown
## 変更サマリー

### 主要変更

- SkillService.executeSkill()のスタブを解消
- SkillExecutorへの委譲を実装
- ストリーミングコールバックの連携
- 中断機能（AbortController）の連携
- エラーハンドリングの統一

### 変更ファイル

- `apps/desktop/src/main/services/skill/SkillService.ts`
- `apps/desktop/src/main/services/skill/SkillService.test.ts`
- （その他関連ファイル）

### テスト結果

- ユニットテスト: PASS
- 統合テスト: PASS
- 手動テスト: PASS

PRを作成してよろしいですか？
````

**重要**: ユーザーから明示的な許可を得るまでPR作成を実行しないこと。

### Step 3: `/ai:diff-to-pr` を実行

ユーザーの許可を得た後、PR作成を実行する。

```bash
/ai:diff-to-pr
```

このスキルが自動的に以下を実行:

1. 変更差分の確認
2. コミットメッセージ生成
3. PR作成
4. CI結果確認

### Step 4: 実行結果の確認

- [ ] PRが作成されていること
- [ ] CIが通過していること
- [ ] PR本文に変更内容が記載されていること

### Step 5: フォールバック（必要時）

`/ai:diff-to-pr` が使えない場合は、git/gh CLIで手動対応する。

```bash
# ブランチ確認
git branch --show-current

# 変更をコミット（まだの場合）
git add -A
git commit -m "feat(skill-service): SkillExecutorへの実行ロジック委譲を実装

- SkillService.executeSkill()のスタブを解消
- SkillExecutorへの委譲を実装
- ストリーミングコールバックを連携
- 中断機能（AbortController）を連携
- エラーハンドリングを統一

Refs: TASK-FIX-7-1-EXECUTE-SKILL-DELEGATION

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"

# プッシュ
git push -u origin HEAD

# PR作成
gh pr create --title "feat(skill-service): SkillExecutorへの実行ロジック委譲を実装" --body "## Summary

- SkillService.executeSkill()のスタブを解消
- SkillExecutorへの委譲を実装
- ストリーミング・中断・エラーハンドリングを連携

## Test plan

- [ ] ユニットテストがPASSすること
- [ ] スキル実行E2Eフローが動作すること
- [ ] ストリーミングメッセージがRenderer受信できること
- [ ] 実行中断が正常に動作すること
- [ ] 認証エラーが適切に伝播すること"
```

---

## タスク完了時の移動手順

```bash
# 1. タスクディレクトリをcompleted-tasksに移動
mv docs/30-workflows/skill-execute-delegation/ docs/30-workflows/completed-tasks/

# 2. 移動を確認
ls docs/30-workflows/completed-tasks/ | grep skill-execute-delegation

# 3. 元タスク指示書を削除（該当する場合）
# rm docs/30-workflows/unassigned-task/UT-FIX-7-1-*.md

# 4. 変更をコミット
git add docs/30-workflows/
git commit -m "docs(workflows): TASK-FIX-7-1-EXECUTE-SKILL-DELEGATIONをcompleted-tasksに移動"
git push
```

> **注意**: Phase 12で検出・作成した**新規**未タスク指示書は削除しないでください。

---

## 完了条件チェックリスト

| #   | 項目                                                 | 必須 |
| --- | ---------------------------------------------------- | ---- |
| 1   | ユーザーにローカル動作確認を依頼した                 | ✅   |
| 2   | 変更サマリーを提示しPR作成の許可を得た               | ✅   |
| 3   | PRが作成されている                                   | ✅   |
| 4   | CIが全て通過している                                 | ✅   |
| 5   | タスクディレクトリが `completed-tasks/` に移動済み   | ✅   |
| 6   | `artifacts.json` の `status` が `"completed"`        | ✅   |
| 7   | （該当時）元タスク指示書が削除済み                   | 条件 |
| 8   | （該当時）Phase 12で作成した新規未タスク指示書が存在 | 条件 |
| 9   | **本Phase内の全作業を100%完了**                      | ✅   |

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全作業を100%実行完了
- [ ] PRが作成されている
- [ ] CIが通過している
- [ ] タスクディレクトリが移動されている
- [ ] artifacts.jsonが更新されている

---

## 依存関係

- **前提**: Phase 12 が完了していること
- **後続**: なし（タスク完了）

---

## スキルフィードバック記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 13 実行記録

### PR情報

- PR URL: {{URL}}
- CI結果: {{PASS/FAIL}}
- マージ状態: {{Merged/Open}}

### タスク完了

- completed-tasks移動: {{完了/未完了}}
- artifacts.json更新: {{完了/未完了}}

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 全体振り返り

-
```

---

## ワークフロー完了

Phase 13が完了したら、このタスクは完了です。

タスクディレクトリは `docs/30-workflows/completed-tasks/skill-execute-delegation/` に移動されます。
