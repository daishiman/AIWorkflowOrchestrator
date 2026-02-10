# Phase 13: PR作成

## メタ情報

| 項目     | 値                                    |
| -------- | ------------------------------------- |
| Phase    | 13                                    |
| 機能名   | task-fix-15-1-execute-handler-routing |
| タスクID | TASK-FIX-15-1-EXECUTE-HANDLER-ROUTING |
| 作成日   | 2026-02-09                            |
| 状態     | **未着手**                            |

## 目的

変更をコミットし、ユーザーの明示的な許可を得てからPull Requestを作成し、CIを確認する。

---

## 実行タスク

- ローカル動作確認依頼: ユーザーにローカルでの動作確認を依頼
- 変更サマリー提示: 変更内容のサマリーを提示しPR作成の許可を確認
- PR作成: ユーザーの許可後に`/ai:diff-to-pr`を実行
- CI確認: CIが通過したことを確認

---

## 参照資料

| 資料名       | パス                                                                                             | 説明           |
| ------------ | ------------------------------------------------------------------------------------------------ | -------------- |
| 最終レビュー | `outputs/phase-10/final-review-result.md`                                                        | Phase 10成果物 |
| 手動テスト   | `outputs/phase-11/manual-test-result.md`                                                         | Phase 11成果物 |
| ドキュメント | `outputs/phase-12/documentation-changelog.md`                                                    | Phase 12成果物 |
| タスク指示書 | `docs/30-workflows/skill-import-agent-system/tasks/03a-task-fix-15-1-execute-handler-routing.md` | 元タスク仕様   |

---

## 実行手順

### 1. ユーザーにローカル動作確認を依頼【必須】

```
PR作成前に、以下の手順でローカル環境での動作確認をお願いします:

1. pnpm --filter @repo/shared build
2. pnpm --filter @repo/desktop dev
3. APIキーを設定（設定画面から）
4. テスト用スキルをインポート
5. スキル実行を試行
6. DevToolsでSkillExecutor.execute()が呼ばれていることをログ確認
7. ストリーミング出力が表示されることを確認
```

### 2. 変更サマリーの提示と許可確認【必須】

**変更内容:**

| ファイル                                               | 変更内容                                                   |
| ------------------------------------------------------ | ---------------------------------------------------------- |
| `apps/desktop/src/main/ipc/skillHandlers.ts`           | SKILL_EXECUTEハンドラーをSkillExecutor.execute()経由に修正 |
| `apps/desktop/src/main/services/skill/SkillService.ts` | executeSkill()メソッドを削除/deprecate                     |

**影響範囲:**

- スキル実行機能がSDK統合コード（SkillExecutor）経由で動作するようになる
- abort/getStatus機能は変更なし（既にSkillExecutor経由）
- バリデーションロジックは保持

**クリティカルパス上の位置:**

本修正はクリティカルパスB（SDK基盤→ルーティング）の終端。これにより：

- SDK基盤（TASK-FIX-16-1）→ 本タスク → E2Eテスト可能

**重要**: ユーザーから明示的な許可を得るまでPR作成を実行しないこと。

### 3. `/ai:diff-to-pr` を実行

ユーザーの許可を得た後、PR作成を実行する。

```
/ai:diff-to-pr
```

**PR情報テンプレート:**

```markdown
## Summary

- SKILL_EXECUTEハンドラーの実行パスをSkillService（スタブ）からSkillExecutor（SDK統合）に変更
- SkillService.executeSkill()を削除し、バリデーションと実行の責務を分離
- SDK統合コード（ストリーミング、Hooks、リトライ、AbortController）が実際に使用されるように修正

## Test Plan

- [ ] 自動テスト: skillHandlers.test.ts が全てPASS
- [ ] 手動テスト: MT-01〜MT-07 を実行しPASS確認
- [ ] DevToolsでSkillExecutor.execute()呼び出しをログ確認
- [ ] ストリーミング出力が正常に表示されることを確認
- [ ] abort/getStatus機能が継続動作することを確認
```

### 4. 実行結果の確認

- [ ] PRが作成されている
- [ ] CIが通過している
- [ ] レビューコメントがあれば対応

### 5. フォールバック（必要時）

`/ai:diff-to-pr` が使えない場合は、git/gh CLIで手動対応する。

```bash
# ブランチ作成・プッシュ
git checkout -b fix/task-fix-15-1-execute-handler-routing
git add apps/desktop/src/main/ipc/skillHandlers.ts apps/desktop/src/main/services/skill/SkillService.ts
git commit -m "fix(skill): SKILL_EXECUTEハンドラーをSkillExecutor経由に修正

- skillHandlers.tsのSKILL_EXECUTEハンドラーをSkillExecutor.execute()経由に変更
- SkillService.executeSkill()を削除
- バリデーションとSDK実行の責務を分離

Closes #ISSUE_NUMBER"
git push -u origin fix/task-fix-15-1-execute-handler-routing

# PR作成
gh pr create --title "fix(skill): SKILL_EXECUTEハンドラーをSkillExecutor経由に修正" --body "..."
```

---

## 成果物

| 成果物 | パス                          | 説明     |
| ------ | ----------------------------- | -------- |
| PR情報 | `outputs/phase-13/pr-info.md` | PR URL等 |

---

## 完了条件

- [ ] ユーザーにローカル動作確認を依頼している
- [ ] 変更サマリーを提示しPR作成の許可を得ている
- [ ] 全変更がコミットされている
- [ ] PRが作成されている
- [ ] CIが通過している
- [ ] レビュー準備が完了している
- [ ] タスクディレクトリがcompleted-tasksに移動されている
- [ ] **本Phase内の全作業を100%完了（PR作成・CI確認・移動）**

---

## タスク完了処理【必須】

PRが作成され、CIが通過した後、タスクディレクトリを完了タスクフォルダに移動する。

### 移動手順

```bash
# タスクディレクトリをcompleted-tasksに移動
mv docs/30-workflows/task-fix-15-1-execute-handler-routing/ docs/30-workflows/completed-tasks/

# 移動を確認
ls docs/30-workflows/completed-tasks/ | grep task-fix-15-1

# 変更をコミット
git add docs/30-workflows/
git commit -m "docs(workflows): TASK-FIX-15-1-EXECUTE-HANDLER-ROUTINGをcompleted-tasksに移動"
git push
```

### タスク指示書の更新

元のタスク指示書のステータスを更新:

```bash
# docs/30-workflows/skill-import-agent-system/tasks/03a-task-fix-15-1-execute-handler-routing.md
# ステータス: 未実施 → 完了
```

---

## 次のPhase

なし（ワークフロー完了）

---

## 関連タスク（本タスク完了後）

本タスク完了により、以下のタスクが実行可能になる:

| タスクID                              | 内容                  | 依存関係           |
| ------------------------------------- | --------------------- | ------------------ |
| TASK-FIX-7-1-EXECUTE-SKILL-DELEGATION | E2Eスモークテスト     | 本タスク完了が前提 |
| Layer 3 タスク群                      | E2Eテスト・統合テスト | 本タスク完了が前提 |
