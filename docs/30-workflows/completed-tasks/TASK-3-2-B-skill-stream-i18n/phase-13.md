# Phase 13: PR作成

## メタ情報

| 項目   | 値                |
| ------ | ----------------- |
| Phase  | 13                |
| 機能名 | skill-stream-i18n |
| 作成日 | 2026-01-28        |

---

## 目的

変更をコミットし、ユーザーの明示的な許可を得てからPull Requestを作成し、CIを確認する。

---

## 実行タスク

### Task 1: ローカル動作確認依頼【必須】

PR作成前に、ユーザーにローカル環境での動作確認を依頼する。

**確認依頼内容**:

1. 開発サーバーを起動: `pnpm --filter @repo/desktop dev`
2. 日本語ロケールでのUI表示確認
3. 英語ロケールでのUI表示確認（ブラウザ言語設定変更）
4. 既存機能のレグレッション確認

### Task 2: 変更サマリー提示【必須】

**変更サマリー**:

| カテゴリ     | 変更内容                              |
| ------------ | ------------------------------------- |
| 新規ファイル | i18n設定、翻訳ファイル（ja/en）       |
| 変更ファイル | formatTime.ts、SkillStreamDisplay.tsx |
| 依存関係追加 | react-i18next、i18next                |
| テスト追加   | i18n関連テスト約20件                  |

**重要**: ユーザーから明示的な許可を得るまでPR作成を実行しないこと。

### Task 3: PR作成

ユーザーの許可を得た後、PR作成を実行する。

```
/ai:diff-to-pr
```

**PR情報**:
| 項目 | 内容 |
| ---- | ---- |
| ブランチ名 | `task/skill-stream-i18n-TASK-3-2-B` |
| ベースブランチ | `main` |
| PRタイトル | `feat(i18n): SkillStreamDisplay多言語化対応 (#531)` |

**PR本文テンプレート**:

```markdown
## Summary

- SkillStreamDisplayコンポーネントのi18n対応
- formatRelativeTimeユーティリティのロケール対応
- 日本語・英語の2言語サポート

## Changes

- react-i18next/i18nextの導入
- 翻訳ファイル（ja/en）の追加
- UIテキストの翻訳キー経由化
- aria-labelの翻訳対応

## Test plan

- [ ] 日本語ロケールでのUI表示確認
- [ ] 英語ロケールでのUI表示確認
- [ ] アクセシビリティ検証
- [ ] レグレッションテスト

Closes #531
```

### Task 4: CI確認

- PRが作成されていること
- CIが通過していること

### Task 5: フォールバック（必要時）

`/ai:diff-to-pr` が使えない場合は、git/gh CLIで手動対応する。

```bash
# ブランチプッシュ
git push -u origin task/skill-stream-i18n-TASK-3-2-B

# PR作成
gh pr create --title "feat(i18n): SkillStreamDisplay多言語化対応 (#531)" --body "..."
```

---

## 参照資料

| 資料名       | パス                                          | 説明           |
| ------------ | --------------------------------------------- | -------------- |
| 最終レビュー | `outputs/phase-10/final-review-result.md`     | Phase 10成果物 |
| 手動テスト   | `outputs/phase-11/manual-test-result.md`      | Phase 11成果物 |
| ドキュメント | `outputs/phase-12/documentation-changelog.md` | Phase 12成果物 |

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

**PRが作成され、CIが通過した後、タスクディレクトリを完了タスクフォルダに移動する。**

### 移動手順

```bash
# タスクディレクトリをcompleted-tasksに移動
mv docs/30-workflows/TASK-3-2-B-skill-stream-i18n/ docs/30-workflows/completed-tasks/

# 移動を確認
ls docs/30-workflows/completed-tasks/ | grep TASK-3-2-B

# 変更をコミット
git add docs/30-workflows/
git commit -m "docs(workflows): TASK-3-2-Bをcompleted-tasksに移動"
git push
```

---

## 次のPhase

なし（ワークフロー完了）
