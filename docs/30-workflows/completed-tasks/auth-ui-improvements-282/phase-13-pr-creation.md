# Phase 13: PR作成

## メタ情報

| 項目   | 値                       |
| ------ | ------------------------ |
| Phase  | 13                       |
| 機能名 | auth-ui-improvements-282 |
| 作成日 | 2026-02-04               |

## 目的

変更をコミットし、ユーザーの明示的な許可を得てからPull Requestを作成し、CIを確認する。

---

## 実行タスク

### Task 1: ローカル動作確認依頼【必須】

PR作成前に、ユーザーにローカル環境での動作確認を依頼する。

#### 確認依頼項目

| 確認項目    | 確認内容                                   |
| ----------- | ------------------------------------------ |
| z-index問題 | アバター編集メニューが最前面に表示されるか |
| 名前変更    | エラーなく名前が変更できるか               |
| 連携解除    | 連携解除後にUIが即座に更新されるか         |

---

### Task 2: 変更サマリー提示【必須】

変更内容のサマリーを提示し、PRを作成してよいかユーザーに確認する。

#### 変更サマリー

| 変更ファイル                                                              | 変更内容                           |
| ------------------------------------------------------------------------- | ---------------------------------- |
| `apps/desktop/src/renderer/components/organisms/AccountSection/index.tsx` | z-index: z-50 → z-[9999]           |
| `apps/desktop/src/main/ipc/profileHandlers.ts`                            | フォールバックエラー検出条件追加   |
| `apps/desktop/src/renderer/store/slices/authSlice.ts`                     | fetchLinkedProviders()呼び出し追加 |

#### 解決する問題

1. ポップアップメニューが他の要素に隠れる問題
2. 名前変更時の「user_profiles not found」エラー
3. 連携サービス解除後にUIが更新されない問題

**重要**: ユーザーから明示的な許可を得るまでPR作成を実行しないこと。

---

### Task 3: PR作成【ユーザー許可後】

ユーザーの許可を得た後、以下を実行:

```bash
/ai:diff-to-pr
```

または手動で:

```bash
# ブランチ確認
git branch

# 変更をステージング
git add apps/desktop/src/renderer/components/organisms/AccountSection/index.tsx
git add apps/desktop/src/main/ipc/profileHandlers.ts
git add apps/desktop/src/renderer/store/slices/authSlice.ts
git add docs/30-workflows/auth-ui-improvements-282/

# コミット
git commit -m "fix(auth): z-index、フォールバック、連携解除UI更新の修正

- z-index: アバター編集メニューをz-[9999]に変更
- フォールバック: user_profilesエラー検出条件を追加
- 状態更新: AUTH_STATE_CHANGED時にfetchLinkedProviders追加

Closes #282

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"

# プッシュ
git push -u origin task/auth-ui-improvements-282

# PR作成
gh pr create --title "fix(auth): 認証UI改善（z-index、フォールバック、連携解除UI更新）" --body "$(cat <<'EOF'
## Summary
- アバター編集メニューのz-indexをz-[9999]に変更し、最前面表示を保証
- profileHandlersにuser_profilesテーブル不在時のフォールバック条件を追加
- authSliceのonAuthStateChangedでfetchLinkedProvidersを追加し、連携解除後のUI即時更新を実現

## Test plan
- [ ] アバター編集メニューがサイドバー・ヘッダーより前面に表示される
- [ ] 名前変更時にエラーダイアログが表示されない
- [ ] 連携解除後、リロードなしでUIが「未連携」に更新される

Closes #282

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

---

### Task 4: CI確認

| 確認項目   | 基準    | 結果 |
| ---------- | ------- | ---- |
| テスト     | 全PASS  | -    |
| Lint       | エラー0 | -    |
| 型チェック | エラー0 | -    |
| ビルド     | 成功    | -    |

---

### Task 5: タスク完了処理【CI通過後】

PRが作成され、CIが通過した後、タスクディレクトリを完了タスクフォルダに移動する。

```bash
# タスクディレクトリをcompleted-tasksに移動
mv docs/30-workflows/auth-ui-improvements-282/ docs/30-workflows/completed-tasks/

# 移動を確認
ls docs/30-workflows/completed-tasks/ | grep auth-ui-improvements-282

# 変更をコミット
git add docs/30-workflows/
git commit -m "docs(workflows): auth-ui-improvements-282をcompleted-tasksに移動"
git push
```

---

## 参照資料

| 資料名           | パス                                      | 説明         |
| ---------------- | ----------------------------------------- | ------------ |
| Phase 12成果物   | `outputs/phase-12/`                       | ドキュメント |
| 手動テスト結果   | `outputs/phase-11/manual-test-result.md`  | テスト結果   |
| 最終レビュー結果 | `outputs/phase-10/final-review-result.md` | レビュー結果 |

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
- [ ] タスクディレクトリがcompleted-tasksに移動されている
- [ ] **本Phase内の全作業を100%完了（PR作成・CI確認・移動）**

---

## 次のPhase

なし（ワークフロー完了）
