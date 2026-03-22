# Phase 13: 完了・PR 作成

## メタ情報

| 項目     | 値                         |
| -------- | -------------------------- |
| Phase    | 13                         |
| タスクID | TASK-SC-03-PLAN-LLM-PROMPT |
| 作成日   | 2026-03-22                 |

## 目的

成果物の最終確認を行い、ユーザーの承認を得たうえで PR を作成する。

## 実行タスク

1. **成果物最終確認**
   - Phase 1-12 の全成果物が揃っていることを確認する
   - 変更ファイル一覧を `git diff --stat` で確認する
   - 未コミットの変更がないことを確認する
2. **コミット前チェックリスト実行**
   - [ ] `pnpm lint` が通ること
   - [ ] `pnpm typecheck` が通ること
   - [ ] 関連テストが全て PASS すること
   - [ ] `--no-verify` を使っていないこと
3. **ユーザー承認待機**
   - PR 作成前にユーザーの承認を待つ
   - 承認なしに PR を作成しない
4. **PR 作成（ユーザー承認後のみ）**
   - ブランチ名: `feature/TASK-SC-03-plan-llm-prompt` または指定されたブランチ名
   - PR タイトル: 70文字以内
   - PR 本文: Summary（1-3箇条書き）+ Test Plan を含める
   - `gh pr create` で PR を作成する

## 参照資料

- `docs/30-workflows/skill-creator-llm-integration/03-phase-12-documentation.md`
- `.claude/rules/07-git-and-tooling.md`（PR 作成ルール）

## 成果物

- GitHub Pull Request（ユーザー承認後）

## PR 内容テンプレート

```
## Summary
- RuntimeSkillCreatorFacade.plan() のスタブを LLM 呼び出し実装に置き換えた（AC-1 対応）
- agent 仕様書（discover-problem / design-workflow / plan-structure）を ResourceLoader で読み込み、system プロンプトに注入する
- terminal_handoff 経路は変更せず、integrated_api モード時のみ LLM を呼び出す（AC-4 対応）

## Test Plan
- [ ] `pnpm --filter @repo/desktop test` が全テスト PASS することを確認
- [ ] `pnpm --filter @repo/desktop typecheck` がエラー 0 で完了することを確認
- [ ] integrated_api モードで plan() を呼び出し、構造計画が返ることを確認
- [ ] terminal_handoff モードで plan() を呼び出し、LLM が呼ばれないことを確認
```

## 完了条件

- [ ] Phase 1-12 の全成果物が揃っていることを確認した
- [ ] `git diff --stat` で変更ファイル一覧を確認した
- [ ] コミット前チェックリスト（lint / typecheck / test）を全て実行した
- [ ] ユーザーの承認を得た
- [ ] PR を作成した（ユーザー承認後のみ）

## 次のPhase

なし（タスク TASK-SC-03-PLAN-LLM-PROMPT 完了）
