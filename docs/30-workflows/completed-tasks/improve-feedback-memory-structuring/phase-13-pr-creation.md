# Phase 13: PR 作成

| 項目      | 値                                                 |
| --------- | -------------------------------------------------- |
| Phase     | 13                                                 |
| 前 Phase  | 12                                                 |
| 次 Phase  | -（最終フェーズ）                                  |
| タスク ID | task-ut-p0-02-001-repeat-feedback-memory           |
| タスク名  | verify→improve ループの feedback memory 構造化改善 |

---

## 目的

ユーザーの明示承認後に PR 作成を実行する。

---

## 前提条件

> **ユーザーの明示的な許可が必要。自動実行禁止。**
>
> Phase 13 はユーザーが「PR を作成してください」等の明示的な指示を出すまで実行してはならない。
> Phase 12 完了後に自動的に PR を作成することは禁止される。

---

## 実行タスク

### タスク 1: PR 作成前チェック

以下の全項目を確認し、全て PASS であることを検証する:

| #   | チェック項目                                                      | 確認方法                                                                                |
| --- | ----------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| 1   | Phase 11 全成果物の存在確認                                       | 4ファイルが `outputs/phase-11/` に存在                                                  |
| 2   | Phase 12 全成果物の存在確認                                       | 6ファイルが `outputs/phase-12/` に存在                                                  |
| 3   | artifacts.json / outputs/artifacts.json の全 Phase completed 確認 | 2台帳を読み取り全Phase確認                                                              |
| 4   | local check 結果の作成                                            | `outputs/phase-13/local-check-result.md` と `outputs/phase-13/change-summary.md` を作成 |
| 5   | 全テスト PASS 確認                                                | `pnpm --filter @repo/desktop test -- --run`                                             |
| 6   | lint PASS 確認                                                    | `pnpm lint`                                                                             |
| 7   | typecheck PASS 確認                                               | `pnpm typecheck`                                                                        |

いずれかが FAIL の場合、PR 作成を中断し修正を行う。

### タスク 2: PR 作成

| 項目     | 値                                                                  |
| -------- | ------------------------------------------------------------------- |
| ブランチ | `spec/task-ut-p0-02-001-repeat-feedback-memory`                     |
| タイトル | `feat(runtime): verify→improve ループの feedback memory 構造化改善` |
| Closes   | #1773                                                               |

**PR 本文テンプレート**:

```markdown
## Summary

- ImproveFeedbackHistory 型を追加し、verifyAndImproveLoop の feedback memory を構造化
- 全試行の失敗履歴を次回 improve の入力に含め、重複提案を防止
- buildImproveFeedback のプロンプトを全履歴参照形式に更新

## Test plan

- [ ] 3回ループ全履歴参照テスト
- [ ] 既存2回ループ回帰テスト
- [ ] buildImproveFeedback 単体テスト
- [ ] TypeScript型チェック PASS
- [ ] ESLint PASS

Closes #1773
```

PR 作成前に `outputs/phase-13/local-check-result.md` と `outputs/phase-13/change-summary.md` を作成し、PR 情報と作成結果を `outputs/phase-13/pr-info.md` / `outputs/phase-13/pr-creation-result.md` に記録する。

### タスク 3: CI 確認

PR 作成後、以下を実施する:

1. GitHub Actions の実行結果を確認する
2. 全チェックが PASS であることを確認する
3. 失敗した場合:
   - 失敗原因を特定する
   - 修正コミットを作成する
   - 再度 CI 結果を確認する

---

## 参照資料

- タスク仕様書: `docs/30-workflows/improve-feedback-memory-structuring/phase-1-requirements.md`
- 最終レビュー: `docs/30-workflows/improve-feedback-memory-structuring/phase-10-final-review.md`
- 手動テスト: `docs/30-workflows/improve-feedback-memory-structuring/phase-11-manual-test.md`
- Phase 12 成果物: `docs/30-workflows/improve-feedback-memory-structuring/outputs/phase-12/`

---

## 成果物

| 成果物                    | 場所                                     |
| ------------------------- | ---------------------------------------- |
| PR 作成前ローカルチェック | `outputs/phase-13/local-check-result.md` |
| 変更要約                  | `outputs/phase-13/change-summary.md`     |
| PR 情報                   | `outputs/phase-13/pr-info.md`            |
| PR 作成結果               | `outputs/phase-13/pr-creation-result.md` |
| GitHub Pull Request       | GitHub リポジトリ                        |

---

## 完了条件

- [ ] PR 作成前チェックが全て PASS している
- [ ] `local-check-result.md` と `change-summary.md` が作成されている
- [ ] `pr-info.md` と `pr-creation-result.md` が作成されている
- [ ] PR が正しいブランチ・タイトル・本文で作成されている
- [ ] CI（GitHub Actions）が全て PASS している
- [ ] PR の URL がユーザーに報告されている

---

## タスク 100% 実行確認

> このフェーズの全タスク（タスク 1〜3）を 100% 実行すること。
> 部分実行や省略は許可されない。
> **ユーザーの明示的な許可なく実行を開始してはならない。**
