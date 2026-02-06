# Phase 13: PR作成

## メタ情報

| 項目   | 値                                 |
| ------ | ---------------------------------- |
| Phase  | 13                                 |
| 機能名 | TASK-FIX-5-1-SKILL-API-UNIFICATION |
| 作成日 | 2026-02-05                         |

## 目的

変更をコミットし、ユーザーの明示的な許可を得てからPull Requestを作成し、CIを確認する。

## 参照資料

| 資料名       | パス                                            | 説明           |
| ------------ | ----------------------------------------------- | -------------- |
| 最終レビュー | `outputs/phase-10/final-review-result.md`       | Phase 10成果物 |
| 手動テスト   | `outputs/phase-11/manual-test-result.md`        | Phase 11成果物 |
| ドキュメント | `outputs/phase-12/documentation-changelog.md`   | Phase 12成果物 |
| 未タスク     | `outputs/phase-12/unassigned-task-detection.md` | Phase 12成果物 |

## 実行手順

### 1. ユーザーにローカル動作確認を依頼【必須】

PR作成前に、ユーザーにローカル環境での動作確認を依頼する。

確認依頼項目:

- アプリ起動とスキル機能の基本動作
- `window.skillAPI` が未定義であること（DevToolsで確認）
- `window.electronAPI.skill` の全メソッドが機能すること

### 2. 変更サマリーの提示と許可確認【必須】

以下の変更サマリーをユーザーに提示し、PRを作成してよいか確認する。

#### 変更サマリーテンプレート

```markdown
## 変更内容

### 統合: SkillAPI二重定義の解消

- `preload/skill-api.ts`: 統一SkillAPIインターフェースに拡張
- `preload/index.ts`: `window.skillAPI` 個別公開を廃止
- `renderer/preload/index.ts`: skillAPI定義を削除

### 移行: 呼び出し元の統一

- `useSkillExecution.ts`: `window.electronAPI.skill` に移行
- `useSkillPermission.ts`: `window.electronAPI.skill` に移行
- `usePermissionDialog.ts`: `window.electronAPI.skill` に移行
- `skillSlice.ts`: OperationResult<T> → 直接型に変更

### テスト結果

- ユニットテスト: {{N}}件 全PASS
- 手動テスト: 15件 全PASS
- カバレッジ: Line {{N}}%, Branch {{N}}%, Function {{N}}%
```

**重要**: ユーザーから明示的な許可を得るまでPR作成を実行しないこと。

### 3. `/ai:diff-to-pr` を実行

ユーザーの許可を得た後、PR作成を実行する。

```
/ai:diff-to-pr
```

### 4. 実行結果の確認

- PRが作成されていること
- CIが通過していること

### 5. フォールバック（必要時）

`/ai:diff-to-pr` が使えない場合は、git/gh CLIで手動対応する。

## 成果物

| 成果物 | パス                          | 説明     |
| ------ | ----------------------------- | -------- |
| PR情報 | `outputs/phase-13/pr-info.md` | PR URL等 |

## 完了条件

- [ ] ユーザーにローカル動作確認を依頼している
- [ ] 変更サマリーを提示しPR作成の許可を得ている
- [ ] 全変更がコミットされている
- [ ] PRが作成されている
- [ ] CIが通過している
- [ ] レビュー準備が完了している
- [ ] タスクディレクトリがcompleted-tasksに移動されている
- [ ] **本Phase内の全作業を100%完了（PR作成・CI確認・移動）**

## タスク完了処理【必須】

**PRが作成され、CIが通過した後、タスクディレクトリを完了タスクフォルダに移動する。**

### 移動手順

```bash
# タスク指示書をcompleted-taskに移動
mv docs/30-workflows/skill-import-agent-system/tasks/task-fix-5-1-skill-api-unification.md \
   docs/30-workflows/skill-import-agent-system/tasks/completed-task/

# タスクディレクトリをcompleted-tasksに移動
mv docs/30-workflows/skill-import-agent-system/tasks/TASK-FIX-5-1-SKILL-API-UNIFICATION/ \
   docs/30-workflows/skill-import-agent-system/tasks/completed-task/

# 移動を確認
ls docs/30-workflows/skill-import-agent-system/tasks/completed-task/ | grep -i "fix-5-1"

# 変更をコミット
git add docs/30-workflows/
git commit -m "docs(workflows): TASK-FIX-5-1-SKILL-API-UNIFICATIONをcompleted-tasksに移動"
git push
```

## 次のPhase

なし（ワークフロー完了）
