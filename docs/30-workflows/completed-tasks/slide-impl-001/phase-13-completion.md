# Phase 13: 完了・PR作成

## メタ情報

| 項目   | 値             |
| ------ | -------------- |
| Phase  | 13             |
| 機能名 | slide-impl-001 |
| 作成日 | 2026-03-24     |

## 目的

変更をコミットし、ユーザーの明示的な許可を得てからPull Requestを作成し、CIを確認する。

## 実行タスク

- ローカル動作確認依頼: ユーザーにローカルでの動作確認を依頼
- 変更サマリー提示: 変更内容のサマリーを提示しPR作成の許可を確認
- PR作成: ユーザーの許可後に`/ai:diff-to-pr`を実行
- CI確認: CIが通過したことを確認

## 参照資料

| 資料名               | パス                                          | 内容            |
| -------------------- | --------------------------------------------- | --------------- |
| Phase 1 要件定義     | `phase-1-requirements.md`                     | AC 定義         |
| 最終レビュー結果     | `outputs/phase-10/final-review-result.md`     | Phase 10 成果物 |
| 手動テスト結果       | `outputs/phase-11/manual-test-result.md`      | Phase 11 成果物 |
| ドキュメント更新履歴 | `outputs/phase-12/documentation-changelog.md` | Phase 12 成果物 |
| Git ルール           | `.claude/rules/07-git-and-tooling.md`         | PR 作成ルール   |

## 実行手順

### 1. ユーザーにローカル動作確認を依頼【必須】

PR作成前に、ユーザーにローカル環境での動作確認を依頼する。

### 2. 変更サマリーの提示と許可確認【必須】

変更内容のサマリーを提示し、PRを作成してよいかユーザーに確認する。

**提示内容**:

- **Summary**: 変更内容の要約（3 箇条書き以内）
  1. ModifierResponse 型拡張（`fallback_reason` / `suggested_action`）
  2. `agent-client.ts` Agent SDK adapter 化（DI パターン）
  3. `slide:capability:get` IPC channel + P42 バリデーション
- **Test Plan**: テスト実行方法
  - `cd apps/desktop && pnpm vitest run src/main/slide/__tests__/`
- **Related Issues**: `Closes #1508`

**重要**: ユーザーから明示的な許可を得るまでPR作成を実行しないこと。

### AC 最終検証

| AC   | 検証コマンド                                                                     | 結果       |
| ---- | -------------------------------------------------------------------------------- | ---------- |
| AC-1 | `grep -n "fallback_reason\|suggested_action" packages/shared/src/slide/types.ts` | {{RESULT}} |
| AC-2 | テストで adapter mock 注入確認                                                   | {{RESULT}} |
| AC-3 | `grep "SLIDE_CAPABILITY_GET" apps/desktop/src/preload/channels.ts`               | {{RESULT}} |
| AC-4 | テストで空文字列・スペースのみ入力が拒否されることを確認                         | {{RESULT}} |
| AC-5 | `pnpm typecheck`                                                                 | {{RESULT}} |
| AC-6 | `pnpm --filter @repo/desktop test`                                               | {{RESULT}} |

### 3. `/ai:diff-to-pr` を実行

ユーザーの許可を得た後、PR作成を実行する。

### 4. 実行結果の確認

- PRが作成されていること
- CIが通過していること

## 成果物

| 成果物       | パス                                    | 説明         |
| ------------ | --------------------------------------- | ------------ |
| 完了レポート | `outputs/phase-13/completion-report.md` | 最終確認結果 |
| PR情報       | `outputs/phase-13/pr-info.md`           | PR URL等     |

## 完了条件

- [x] Phase 1-12 の全成果物が存在し、内容が完全である
- [x] AC-1〜AC-6 の全受入基準が検証コマンドで確認されている
- [x] `pnpm typecheck` PASS
- [x] `pnpm lint` 違反 0 件
- [x] 全テスト PASS
- [x] ユーザーにローカル動作確認を依頼している
- [x] 変更サマリーを提示しPR作成の許可を得ている
- [x] PR 本文が作成されている
- [x] コミットが Conventional Commits 形式で整理されている
- [x] CIが通過している
- [x] タスクディレクトリがcompleted-tasksに移動されている
- [x] 本 Phase 内の全タスクを 100% 実行完了

## タスク完了処理【必須】

**PRが作成され、CIが通過した後、タスクディレクトリを完了タスクフォルダに移動する。**

### 移動手順

```bash
mv docs/30-workflows/slide-impl-001/ docs/30-workflows/completed-tasks/
ls docs/30-workflows/completed-tasks/ | grep slide-impl-001
git add docs/30-workflows/
git commit -m "docs(workflows): slide-impl-001をcompleted-tasksに移動"
```

## 次Phase

なし（本タスク完了）
