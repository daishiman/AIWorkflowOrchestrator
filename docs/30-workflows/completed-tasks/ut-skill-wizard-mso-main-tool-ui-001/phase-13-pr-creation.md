# Phase 13: PR作成

## メタ情報

| 項目       | 内容                                 |
| ---------- | ------------------------------------ |
| Phase      | 13                                   |
| タスクID   | UT-SKILL-WIZARD-MSO-MAIN-TOOL-UI-001 |
| 機能名     | skill-wizard-mso-main-tool-ui        |
| 前提Phase  | Phase 12                             |
| 後続Phase  | なし                                 |
| 作成日     | 2026-04-13                           |
| ステータス | blocked                              |

## 目的

ユーザーの明示的な承認後のみ、commit / push / PR 作成を実施する。
承認前は成果物の要約とPR草案の記録のみ行う。

> **警告**: ユーザーから明示的な承認がない限り、commit / push / PR 作成を実行しないこと。

## PR作成条件

以下の全条件が満たされた場合のみ PR 作成を実施する:

| 条件                           | 確認方法                                                                                                                                                                                      | 状態    |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| Phase 1〜12 の全成果物が完成   | 各 Phase の `outputs/` ディレクトリを確認                                                                                                                                                     | pending |
| AC-1〜AC-6 が全て PASS         | `outputs/phase-10/final-review-result.md` を確認                                                                                                                                              | pending |
| 手動テスト全件 PASS            | `outputs/phase-11/manual-test-result.md` を確認                                                                                                                                               | pending |
| Phase 11 追加記録が完成        | `outputs/phase-11/manual-test-report.md` / `discovered-issues.md` / `ui-sanity-visual-review.md` / `phase11-capture-metadata.json` / `screenshot-plan.json` / `screenshot-coverage.md` を確認 | pending |
| スクリーンショット証跡 5 件    | `outputs/phase-11/screenshots/` を確認                                                                                                                                                        | pending |
| Phase 12 コンプライアンス PASS | `outputs/phase-12/phase12-task-spec-compliance-check.md` を確認                                                                                                                               | pending |
| Phase 13 追加記録が完成        | `outputs/phase-13/local-check-result.md` / `change-summary.md` / `pr-info.md` を確認                                                                                                          | pending |
| ユーザーの明示的な承認         | ユーザーが「PR作成してください」と明示的に指示                                                                                                                                                | blocked |

## 実行手順

### 1. ローカル確認（承認前に実施可能）

```bash
# 型チェック
pnpm --filter @repo/desktop typecheck

# テスト実行
pnpm --filter @repo/desktop exec vitest run

# lint確認
pnpm --filter @repo/desktop lint
```

結果を `outputs/phase-13/local-check-result.md` に記録する。

### 2. 変更サマリーの整理（承認前に実施可能）

```bash
# 変更ファイルの確認
git diff --name-only main

# 変更内容の確認
git diff main
```

変更内容を `outputs/phase-13/change-summary.md` に記録する。

### 3. PR作成（ユーザーの明示的な承認後のみ実施）

```bash
# ブランチ作成（まだ作成していない場合）
git checkout -b feat/ut-skill-wizard-mso-main-tool-ui-001

# コミット
git add <対象ファイル>
git commit -m "feat(skill-wizard): UT-SKILL-WIZARD-MSO-MAIN-TOOL-UI-001 Q5複数選択時の「主ツール」UI表示"

# プッシュ
git push -u origin feat/ut-skill-wizard-mso-main-tool-ui-001

# PR作成
gh pr create \
  --title "feat(skill-wizard): UT-SKILL-WIZARD-MSO-MAIN-TOOL-UI-001 Q5複数選択時の「主ツール」UI表示" \
  --body "$(cat <<'EOF'
## Summary

- Q5（外部ツール連携）で2つ以上のツールを選択した場合、`selectedOptions[0]` にのみ「主ツール」バッジを表示する
- Q5単数選択時およびQ3/Q4/Q6複数選択時はバッジを表示しない（副作用なし）
- バッジ要素に `aria-label="主ツールとして使用される"` を設定しアクセシビリティを確保
- 暫定措置: `UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001`（並列統合対応）完了後にバッジ削除予定

## Test plan

- [ ] AC-1: Q5複数選択時に先頭のオプションのみ「主ツール」バッジが表示されることを確認
- [ ] AC-2: Q5単数選択時にバッジが表示されないことを確認
- [ ] AC-3: バッジ要素に `aria-label="主ツールとして使用される"` が設定されていることを確認
- [ ] AC-4: バッジ表示ロジックが単一箇所に集約され削除容易であることをコードレビューで確認
- [ ] AC-5: スクリーンショット証跡が `outputs/phase-11/screenshots/` に保存されていることを確認
- [ ] AC-6: 自動テストでバッジの表示・非表示・aria-labelが全件PASSであることを確認
- [ ] Q3/Q4/Q6での副作用なし（バッジが表示されないこと）を確認

## Screenshots

| シナリオ | スクリーンショット |
| -------- | ----------------- |
| Q5単数選択（バッジなし） | `outputs/phase-11/screenshots/q5-single-select.png` |
| Q5複数選択（先頭にバッジ） | `outputs/phase-11/screenshots/q5-multi-select-badge.png` |
| Q3複数選択（バッジなし） | `outputs/phase-11/screenshots/q3-no-badge.png` |
| Q4複数選択（バッジなし） | `outputs/phase-11/screenshots/q4-no-badge.png` |
| Q6複数選択（バッジなし） | `outputs/phase-11/screenshots/q6-no-badge.png` |

## 関連Issue

Closes #2071

## 備考

本実装は暫定措置です。`UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001`（並列統合対応）が完了した際に、
「主ツール」バッジを削除するタスクが派生します。削除手順は `outputs/phase-12/implementation-guide.md` の Part 2 を参照してください。
EOF
)"
```

PR 草案と実行結果を `outputs/phase-13/pr-info.md` に記録する。

## PRタイトル案

```
feat(skill-wizard): UT-SKILL-WIZARD-MSO-MAIN-TOOL-UI-001 Q5複数選択時の「主ツール」UI表示
```

## 禁止事項

ユーザーの明示的な承認なしに以下を実行してはならない:

- `git commit`
- `git push`
- `gh pr create`

## 参照資料

| 資料名           | パス                                                     | 説明            |
| ---------------- | -------------------------------------------------------- | --------------- |
| 最終レビュー     | `outputs/phase-10/final-review-result.md`                | Phase 10 成果物 |
| 手動テスト       | `outputs/phase-11/manual-test-result.md`                 | Phase 11 成果物 |
| ドキュメント更新 | `outputs/phase-12/documentation-changelog.md`            | Phase 12 成果物 |
| 実装ガイド       | `outputs/phase-12/implementation-guide.md`               | Phase 12 成果物 |
| コンプライアンス | `outputs/phase-12/phase12-task-spec-compliance-check.md` | Phase 12 成果物 |

## 成果物

| 成果物           | パス                                     | 説明                             |
| ---------------- | ---------------------------------------- | -------------------------------- |
| ローカル確認結果 | `outputs/phase-13/local-check-result.md` | typecheck / test / lint の要約   |
| 変更サマリー     | `outputs/phase-13/change-summary.md`     | diff / 変更箇所 / 影響範囲の要約 |
| PR情報           | `outputs/phase-13/pr-info.md`            | 条件: ユーザー承認後のみ作成可   |

## 完了条件

- [ ] ローカル確認結果（`outputs/phase-13/local-check-result.md`）を記録した
- [ ] 変更サマリーを `outputs/phase-13/change-summary.md` に記録した
- [ ] PR情報を `outputs/phase-13/pr-info.md` に記録した
- [ ] PR作成条件を確認した
- [ ] commit / push / PR を実行していない（ユーザー承認前）
- [ ] blocked 状態を記録した
- [ ] 本Phase内の全タスクを100%実行完了（blocked gate）

## サブタスク管理

1. ローカル確認結果の記録（typecheck / test / lint）
2. 変更サマリーの整理
3. PR草案の記録
4. blocked 状態の記録

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] ユーザーの許可なしに commit / push / PR を実行していない
- [ ] 実行記録を残した

## タスク完了

Phase 13 は **blocked**。ユーザーの明示的な承認後にのみ commit / push / PR 作成へ進む。
