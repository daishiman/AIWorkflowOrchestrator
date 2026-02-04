# Phase 13: PR作成

## メタ情報

| 項目   | 値                        |
| ------ | ------------------------- |
| Phase  | 13                        |
| 機能名 | AUTH-UI-004-google-avatar |
| 作成日 | 2026-02-04                |
| 状態   | **未着手**                |

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

| 資料名       | パス                                          | 説明           |
| ------------ | --------------------------------------------- | -------------- |
| 最終レビュー | `outputs/phase-10/final-review-result.md`     | Phase 10成果物 |
| 手動テスト   | `outputs/phase-11/manual-test-result.md`      | Phase 11成果物 |
| ドキュメント | `outputs/phase-12/documentation-changelog.md` | Phase 12成果物 |

---

## 実行手順

### 1. ユーザーにローカル動作確認を依頼【必須】

```
PR作成前に、以下の手順でローカル環境での動作確認をお願いします:

1. pnpm --filter @repo/shared build
2. pnpm --filter @repo/desktop dev
3. Google連携済みアカウントでログイン
4. アバター編集メニューを開く
5. 「Googleのアバターを使用」が表示されることを確認
```

### 2. 変更サマリーの提示と許可確認【必須】

**変更内容:**

| ファイル                                                 | 変更内容                                    |
| -------------------------------------------------------- | ------------------------------------------- |
| `packages/shared/types/auth.ts`                          | SupabaseIdentity型に`picture`プロパティ追加 |
| `packages/shared/infrastructure/auth/supabase-client.ts` | toLinkedProvider関数にフォールバック追加    |

**影響範囲:**

- Google連携ユーザーのアバター表示機能の修正
- 既存のGitHub/Discordアバター機能への影響なし

**重要**: ユーザーから明示的な許可を得るまでPR作成を実行しないこと。

### 3. `/ai:diff-to-pr` を実行

ユーザーの許可を得た後、PR作成を実行する。

```
/ai:diff-to-pr
```

### 4. 実行結果の確認

- [ ] PRが作成されている
- [ ] CIが通過している

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
mv docs/30-workflows/AUTH-UI-004-google-avatar/ docs/30-workflows/completed-tasks/

# 移動を確認
ls docs/30-workflows/completed-tasks/ | grep AUTH-UI-004

# 変更をコミット
git add docs/30-workflows/
git commit -m "docs(workflows): AUTH-UI-004-google-avatarをcompleted-tasksに移動"
git push
```

---

## 次のPhase

なし（ワークフロー完了）
