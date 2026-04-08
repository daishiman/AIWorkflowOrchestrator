# Phase 13: PR 作成

## メタ情報

| 項目   | 値                                                |
| ------ | ------------------------------------------------- |
| Phase  | 13                                                |
| 機能名 | UT-SKILL-WIZARD-W1-LIFECYCLE-PANEL-TRANSITION-001 |
| 作成日 | 2026-04-08                                        |

---

## 目的

変更をコミットし、ユーザーの明示的な許可を得てから Pull Request を作成し、CI を確認する。

---

## 実行タスク

- **ローカル動作確認依頼**: ユーザーにローカルでの動作確認を依頼
- **変更サマリー提示**: 変更内容のサマリーを提示し PR 作成の許可を確認
- **PR 作成**: ユーザーの許可後に `/ai:diff-to-pr` を実行
- **CI 確認**: CI が通過したことを確認

---

## 参照資料

| 資料名       | パス                                          | 説明            |
| ------------ | --------------------------------------------- | --------------- |
| 最終レビュー | `outputs/phase-10/final-review-result.md`     | Phase 10 成果物 |
| 手動テスト   | `outputs/phase-11/manual-test-result.md`      | Phase 11 成果物 |
| ドキュメント | `outputs/phase-12/documentation-changelog.md` | Phase 12 成果物 |

---

## 実行手順

### 1. ユーザーにローカル動作確認を依頼【必須】

PR 作成前に、ユーザーにローカル環境での動作確認を依頼する。

### 2. 変更サマリーの提示と許可確認【必須】

以下のサマリーを提示し、PR を作成してよいかユーザーに確認する。

**変更サマリー:**

| 項目         | 内容                                                               |
| ------------ | ------------------------------------------------------------------ |
| 変更タイプ   | リファクタリング                                                   |
| 変更ファイル | `SkillLifecyclePanel.tsx` + 関連テストファイル 6 本                |
| 主な変更内容 | テキストエリア削除、ウィザード遷移ボタン追加                       |
| 関連 Issue   | #2015                                                              |
| 破壊的変更   | なし（IPC チャンネル変更なし）                                     |
| スコープ外   | `SkillCreateWizard` の新規追加機能（既存配線済みのため本タスク外） |

**重要**: ユーザーから明示的な許可を得るまで PR 作成を実行しないこと。

### 3. `/ai:diff-to-pr` を実行

ユーザーの許可を得た後、PR 作成を実行する。

```
/ai:diff-to-pr
```

**PR 作成時の自動投稿内容**:

1. **PR 本文**（`.github/pull_request_template.md` 準拠）:
   概要・変更内容・変更タイプ・テスト・関連 Issue・破壊的変更・スクリーンショット・チェックリスト
2. **PR コメント 1**: 実装の詳細・レビュー注意点・テスト方法・参考資料
3. **PR コメント 2**: `implementation-guide.md` の全文
4. **PR コメント 3**: スクリーンショットギャラリー（Phase 11 成果物）

### 4. 実行結果の確認

- PR が作成されていること
- CI が通過していること

---

## タスク完了処理【必須】

PR が作成され、CI が通過した後、タスクディレクトリを完了タスクフォルダに移動する。

```bash
# タスクディレクトリをcompleted-tasksに移動
mv docs/30-workflows/UT-SKILL-WIZARD-W1-LIFECYCLE-PANEL-TRANSITION-001/ \
   docs/30-workflows/completed-tasks/

# 移動を確認
ls docs/30-workflows/completed-tasks/ | grep UT-SKILL-WIZARD-W1-LIFECYCLE-PANEL-TRANSITION-001

# 変更をコミット
git add docs/30-workflows/
git commit -m "docs(workflows): UT-SKILL-WIZARD-W1-LIFECYCLE-PANEL-TRANSITION-001 を completed-tasks に移動"
git push
```

---

## 成果物

| 成果物  | パス                          | 説明      |
| ------- | ----------------------------- | --------- |
| PR 情報 | `outputs/phase-13/pr-info.md` | PR URL 等 |

---

## 完了条件

- [ ] ユーザーにローカル動作確認を依頼している
- [ ] 変更サマリーを提示し PR 作成の許可を得ている
- [ ] 全変更がコミットされている
- [ ] PR が作成されている
- [ ] CI が通過している
- [ ] レビュー準備が完了している
- [ ] タスクディレクトリが completed-tasks に移動されている
- [ ] **本 Phase 内の全作業を 100% 完了（PR 作成・CI 確認・移動）**

---

## タスク 100% 実行確認【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] PR URL を記録した
- [ ] CI 通過を確認した
- [ ] タスクディレクトリ移動を確認した
