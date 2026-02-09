# Phase 13: PR作成

## メタ情報

| 項目   | 値                                 |
| ------ | ---------------------------------- |
| Phase  | 13                                 |
| 機能名 | TASK-FIX-5-1-SKILL-API-UNIFICATION |
| 作成日 | 2026-02-08                         |

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

#### 確認依頼項目

- アプリ起動とスキル機能の基本動作
- `window.skillAPI` が未定義であること（DevToolsで確認）
- `window.electronAPI.skill` の全メソッドが機能すること
- スキル一覧取得・インポート・削除が正常動作すること
- スキル実行とストリーミング表示が正常動作すること
- 権限ダイアログが正常表示されること

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
- 手動テスト: 17件 全PASS
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
- PRタイトルが70文字以内、descriptionにSummary（1-3箇条書き）とTest Planが含まれている

### 5. フォールバック（必要時）

`/ai:diff-to-pr` が使えない場合は、git/gh CLIで手動対応する。

```bash
# ブランチ作成（必要な場合）
git checkout -b fix/skill-api-unification

# 変更をコミット
git add .
git commit -m "refactor(preload): SkillAPI二重定義の解消

- preload/skill-api.tsに統一SkillAPIインターフェースを実装
- window.skillAPI個別公開を廃止
- 全hooks/sliceをwindow.electronAPI.skillに移行

TASK-FIX-5-1-SKILL-API-UNIFICATION"

# リモートにプッシュ
git push -u origin fix/skill-api-unification

# PRを作成
gh pr create --title "refactor(preload): SkillAPI二重定義の解消" --body "..."
```

## 統合テスト連携【必須】

| 確認項目  | 判定基準                              |
| --------- | ------------------------------------- |
| CI通過    | GitHub Actions全ジョブ成功            |
| typecheck | `pnpm typecheck` エラーなし           |
| lint      | `pnpm lint` エラーなし                |
| test      | `pnpm test` 全PASS（210テスト以上）   |
| coverage  | Line 80%+, Branch 60%+, Function 80%+ |

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
# タスクディレクトリをcompleted-tasksに移動
mv docs/30-workflows/TASK-FIX-5-1-SKILL-API-UNIFICATION/ \
   docs/30-workflows/completed-tasks/

# 移動を確認
ls docs/30-workflows/completed-tasks/ | grep -i "fix-5-1"

# 変更をコミット
git add docs/30-workflows/
git commit -m "docs(workflows): TASK-FIX-5-1-SKILL-API-UNIFICATIONをcompleted-tasksに移動"
git push
```

## PR情報テンプレート

PR作成後、以下の形式で `outputs/phase-13/pr-info.md` を作成する:

```markdown
# PR情報

| 項目         | 値           |
| ------------ | ------------ |
| PR番号       | #{{NUMBER}}  |
| PR URL       | {{URL}}      |
| 作成日時     | {{DATETIME}} |
| CIステータス | {{STATUS}}   |
| レビュアー   | {{REVIEWER}} |

## 変更ファイル数

- 追加: {{N}}
- 変更: {{N}}
- 削除: {{N}}

## 関連Issue

- {{ISSUE_LINK}}
```

## 次のPhase

なし（ワークフロー完了）
