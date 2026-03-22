# Phase 13: PR 作成

## メタ情報

| 項目     | 値                               |
| -------- | -------------------------------- |
| Phase    | 13                               |
| タスクID | TASK-SC-06-UI-RUNTIME-CONNECTION |
| 作成日   | 2026-03-22                       |

## 目的

TASK-SC-06-UI-RUNTIME-CONNECTION の成果物を PR としてまとめ、ユーザー承認後にリポジトリに提出する。

## 実行タスク

1. 成果物の最終確認
   - 全 Phase（1〜12）の完了条件チェックリストが完了していることを確認
   - `git diff --stat` で変更ファイル一覧を確認
   - 変更対象ファイルが予期通りであることを確認
     - `apps/desktop/src/renderer/components/skill/DescribeStep.tsx`
     - `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`
     - `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`
     - `apps/desktop/src/renderer/components/skill/wizard/GenerateStep.tsx`
     - `apps/desktop/src/renderer/store/` 配下の Zustand Slice 変更
2. コミットの整理（必要に応じて）
   - 意味のある単位でコミットが分かれていることを確認
3. PR タイトルと本文の作成
   - タイトル: 70文字以内
   - Summary: 1-3箇条書き（何を実装したか）
   - Test Plan: 動作確認方法のチェックリスト
4. 前提タスク（03, 04）との依存関係を PR 本文に記載
5. ユーザーに PR 作成の承認を求める
6. 承認後に PR を作成
   ```bash
   gh pr create \
     --title "feat(skill-creator): UI→Runtime パイプライン接続・DescribeStep LLM生成フロー" \
     --body "..."
   ```

## 参照資料

- Phase 12 ドキュメント成果物
- `.claude/rules/07-git-and-tooling.md`（PR 作成ルール）
- `CLAUDE.md`（`--no-verify` 禁止）

## 成果物

- PR URL

## 完了条件

- [ ] 全 Phase（1〜12）の完了条件チェックリストを最終確認した
- [ ] `git diff --stat` で変更ファイルを確認した
- [ ] PR タイトルが70文字以内であることを確認した
- [ ] PR 本文に Summary と Test Plan が含まれることを確認した
- [ ] 前提タスク（03, 04）との依存関係を記載した
- [ ] ユーザーの承認を得た
- [ ] `gh pr create` で PR を作成した（`--no-verify` 不使用）
- [ ] PR URL を記録した

## 次のPhase

完了
