# Phase Template Phase13 詳細

> 親ファイル: [phase-templates.md](phase-templates.md)
> 骨格: [phase-template-phase13.md](phase-template-phase13.md)

## 対象

Phase 13: PR作成の詳細テンプレート（変更サマリー提示・PR作成・CI確認・タスク完了処理）。

---

## 詳細テンプレート

````markdown
# Phase 13: PR作成

## メタ情報

| 項目   | 値               |
| ------ | ---------------- |
| Phase  | 13               |
| 機能名 | {{FEATURE_NAME}} |
| 作成日 | {{CREATED_DATE}} |

## 目的

変更をコミットし、ユーザーの明示的な許可を得てからPull Requestを作成し、CIを確認する。

## 実行タスク

- ローカル動作確認依頼: ユーザーにローカルでの動作確認を依頼
- 変更サマリー提示: 変更内容のサマリーを提示しPR作成の許可を確認
- PR作成: ユーザーの許可後に`/ai:diff-to-pr`を実行
- CI確認: CIが通過したことを確認

## 参照資料

| 資料名       | パス                                          | 説明           |
| ------------ | --------------------------------------------- | -------------- |
| 最終レビュー | `outputs/phase-10/final-review-result.md`     | Phase 10成果物 |
| 手動テスト   | `outputs/phase-11/manual-test-result.md`      | Phase 11成果物 |
| ドキュメント | `outputs/phase-12/documentation-changelog.md` | Phase 12成果物 |

## 実行手順

### 1. ユーザーにローカル動作確認を依頼【必須】

PR作成前に、ユーザーにローカル環境での動作確認を依頼する。

### 2. 変更サマリーの提示と許可確認【必須】

変更内容のサマリーを提示し、PRを作成してよいかユーザーに確認する。

**重要**: ユーザーから明示的な許可を得るまでPR作成を実行しないこと。

### 3. `/ai:diff-to-pr` を実行

ユーザーの許可を得た後、PR作成を実行する。

```
/ai:diff-to-pr
```

**PR作成時の自動投稿内容（`/ai:diff-to-pr`）**:

1. **PR本文**（`.github/pull_request_template.md` 準拠）:
   概要・変更内容・変更タイプ・テスト・関連 Issue・破壊的変更・（UI/UX変更時のみ）スクリーンショット・チェックリスト・その他
2. **PRコメント1**: 実装の詳細・レビュー注意点・テスト方法・参考資料
3. **PRコメント2**（Phase 12成果物あり時）: implementation-guide.md の全文
4. **PRコメント3**（Phase 11スクリーンショットあり時）: スクリーンショットギャラリー

**PR本文セクション連携ルール（必須）**:

- `/ai:diff-to-pr` の Phase 3.6 で、staged差分から `TARGET_WORKFLOW_DIR` を1件特定する
- Phase 11/12成果物パスは `TARGET_WORKFLOW_DIR` 配下のみ参照する
- PR本文 `## その他` に、Phase 12 実装ガイド反映元パスと要点（Part 1/Part 2）を必ず記載する
- `implementation-guide.md` の全文を PRコメントとして必ず投稿する
- UI/UX変更時は `outputs/phase-11/screenshots/*.png` を検出し、PR本文 `## スクリーンショット` に画像リンクを自動挿入する
- PR本文/PRコメントで画像を埋め込む場合は `raw.githubusercontent.com/<repo>/<commit>/<path>` の絶対URLを使う（相対パス直貼りは禁止）
- UI/UX変更がない場合は PR本文 `## スクリーンショット` セクションを削除する
- workflow候補が複数ある場合は、PR作成前にユーザーへ対象workflowを確認する

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

```bash
# タスクディレクトリをcompleted-tasksに移動
mv docs/30-workflows/{{TASK_NAME}}/ docs/30-workflows/completed-tasks/

# 移動を確認
ls docs/30-workflows/completed-tasks/ | grep {{TASK_NAME}}

# 変更をコミット
git add docs/30-workflows/
git commit -m "docs(workflows): {{TASK_NAME}}をcompleted-tasksに移動"
git push
```
````

## 変数一覧

| 変数 | 意味 |
| --- | --- |
| `{{TASK_ID}}` | workflow 全体の task ID |
| `{{FEATURE_NAME}}` | workflow ディレクトリ名 |
| `{{PHASE_NAME}}` | phase 名称 |
| `{{ARTIFACT_PATH}}` | `outputs/phase-N/...` の相対パス |
| `{{SYSTEM_SPEC_PATH}}` | aiworkflow-requirements 側の更新対象 |

## 関連テンプレート

- [../assets/phase-spec-template.md](../assets/phase-spec-template.md)
- [../assets/main-task-template.md](../assets/main-task-template.md)
- [../assets/review-result-template.md](../assets/review-result-template.md)
- [../assets/implementation-guide-template.md](../assets/implementation-guide-template.md)
- [../assets/documentation-changelog-template.md](../assets/documentation-changelog-template.md)

## 変更履歴

| Date | Changes |
| --- | --- |
| 2026-03-12 | 1818行の monolith から family file 構成へ再編 |

## 関連ガイド

- [phase-template-phase13.md](phase-template-phase13.md) — Phase 13 骨格・blocked ルール
- [review-gate-criteria.md](review-gate-criteria.md)
- [commands.md](commands.md)
