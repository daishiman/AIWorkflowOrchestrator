# Phase 13: PR作成

## メタ情報

| 項目      | 値                     |
| --------- | ---------------------- |
| Phase     | 13                     |
| 機能名    | search-replace-ui      |
| タスクID  | task-imp-search-ui-001 |
| 関連Issue | #366                   |
| 作成日    | 2026-02-04             |

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

---

## 実行手順

### 1. ユーザーにローカル動作確認を依頼【必須】

PR作成前に、ユーザーにローカル環境での動作確認を依頼する。

**依頼内容**:

```
以下の機能について、ローカル環境での動作確認をお願いします:

1. ファイル内検索（Cmd+F）
2. ワークスペース検索（Cmd+Shift+F）
3. 置換機能（単一置換/全置換）
4. 検索オプション（大文字小文字/正規表現/単語単位）

確認後、問題がなければお知らせください。
```

### 2. 変更サマリーの提示と許可確認【必須】

変更内容のサマリーを提示し、PRを作成してよいかユーザーに確認する。

**変更サマリーテンプレート**:

```markdown
## 変更サマリー

### 追加ファイル

- `apps/desktop/tests/e2e/search.spec.ts` - E2Eテスト（12シナリオ）
- `apps/desktop/src/features/search/hooks/useWorkspaceSearchProvider.ts` - IPCプロバイダ

### 変更ファイル

- `apps/desktop/src/renderer/views/EditorView.tsx` - グローバルショートカット統合
- `apps/desktop/src/features/search/components/WorkspaceSearchPanel.tsx` - IPCプロバイダ注入

### テスト結果

- ユニットテスト: 110件 PASS
- E2Eテスト: 12件 PASS
- カバレッジ: Line 80%+, Branch 60%+

PRを作成してもよろしいですか？
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

```bash
# ブランチをプッシュ
git push -u origin task/search-replace-ui-implementation-366

# PRを作成
gh pr create \
  --title "feat(search): 検索・置換UI統合 (#366)" \
  --body "$(cat <<'EOF'
## Summary

- グローバルキーボードショートカットの統合（Cmd+F, Cmd+Shift+F）
- ワークスペース検索IPCプロバイダの実装
- E2Eテストの追加（12シナリオ）

## Test Plan

- [x] ユニットテスト: 110件 PASS
- [x] E2Eテスト: 12件 PASS
- [x] 手動テスト: 6シナリオ PASS

## Related Issues

Closes #366

---
🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)" \
  --base main
```

---

## 成果物

| 成果物 | パス                          | 説明           |
| ------ | ----------------------------- | -------------- |
| PR情報 | `outputs/phase-13/pr-info.md` | PR URL、CI結果 |

---

## 完了条件

- [ ] ユーザーにローカル動作確認を依頼している
- [ ] 変更サマリーを提示しPR作成の許可を得ている
- [ ] 全変更がコミットされている
- [ ] PRが作成されている
- [ ] CIが通過している
- [ ] レビュー準備が完了している
- [ ] **タスクディレクトリがcompleted-tasksに移動されている**
- [ ] **本Phase内の全作業を100%完了（PR作成・CI確認・移動）**

---

## タスク完了処理【必須】

**PRが作成され、CIが通過した後、タスクディレクトリを完了タスクフォルダに移動する。**

### 移動手順

```bash
# タスクディレクトリをcompleted-tasksに移動
mv docs/30-workflows/search-replace-ui/ docs/30-workflows/completed-tasks/

# 移動を確認
ls docs/30-workflows/completed-tasks/ | grep search-replace-ui

# 変更をコミット
git add docs/30-workflows/
git commit -m "docs(workflows): search-replace-uiをcompleted-tasksに移動"
git push
```

---

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. ユーザーにローカル動作確認を依頼
2. 変更サマリーの提示と許可確認
3. PR作成（ユーザー許可後）
4. CI結果の確認
5. タスク完了処理（ディレクトリ移動）

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

---

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] PRが作成され、CIが通過している
- [ ] タスクディレクトリがcompleted-tasksに移動されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/search-replace-ui --phase 13
```

---

## 次のPhase

なし（ワークフロー完了）
