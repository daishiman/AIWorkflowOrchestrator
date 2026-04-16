# Phase 13: PR作成

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| Phase      | 13                                        |
| タスクID   | UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001  |
| 機能名     | skill-wizard/resolve-external-integration |
| 前提Phase  | Phase 12                                  |
| 後続Phase  | なし                                      |
| 作成日     | 2026-04-15                                |
| ステータス | blocked                                   |

## 目的

ユーザーの明示的な承認後のみ、commit / push / PR 作成を実施する。
承認前は成果物の要約と PR 草案の記録のみ行う。

> **警告**: ユーザーから明示的な承認がない限り、commit / push / PR 作成を実行しないこと。

## PR作成条件

以下の全条件が満たされた場合のみ PR 作成を実施する:

| 条件                           | 確認方法                                                                                                   | 状態    |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------- | ------- |
| Phase 1〜12 の全成果物が完成   | 各 Phase の `outputs/` ディレクトリを確認                                                                  | pending |
| AC-1〜AC-7 が全て PASS         | `outputs/phase-10/final-review-result.md` を確認                                                           | pending |
| 手動テスト全件 PASS            | `outputs/phase-11/manual-test-result.md` を確認                                                            | pending |
| Phase 11 追加記録が完成        | `outputs/phase-11/manual-test-report.md` / `discovered-issues.md` / `todo-deletion-confirmation.md` を確認 | pending |
| Phase 12 コンプライアンス PASS | `outputs/phase-12/phase12-task-spec-compliance-check.md` を確認                                            | pending |
| Phase 13 追加記録が完成        | `outputs/phase-13/local-check-result.md` / `change-summary.md` / `pr-info.md` を確認                       | pending |
| ユーザーの明示的な承認         | ユーザーが「PR作成してください」と明示的に指示                                                             | blocked |

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

主な変更ファイル（想定）:

- `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx` — `resolveExternalIntegration` の引数型変更・並列処理実装・呼び出し箇所更新（AC-5）
- `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx` — 暫定「主ツール」バッジ削除
- 対応するテストファイル — 複数ツール並列・後方互換・フォールバックテスト追加

### 3. PR作成（ユーザーの明示的な承認後のみ実施）

```bash
# ブランチ作成（まだ作成していない場合）
git checkout -b feat/ut-skill-wizard-mso-resolve-external-001

# コミット
git add <対象ファイル>
git commit -m "feat(skill-wizard): UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001 resolveExternalIntegration 複数ツール並列統合対応"

# プッシュ
git push -u origin feat/ut-skill-wizard-mso-resolve-external-001

# PR作成
gh pr create \
  --title "feat(skill-wizard): UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001 resolveExternalIntegration 複数ツール並列統合対応" \
  --body "$(cat <<'EOF'
## Summary

- `resolveExternalIntegration` の引数型を `string` から `string[]` に変更し、複数ツールの並列処理（`Promise.all`）を実装（AC-1）
- 各ツールの統合情報（API エンドポイント・認証方式・主要操作）を並列取得してマージする処理を実装（AC-2）
- 単一ツールを `string[]` で渡した場合の後方互換性を維持（AC-3）
- 空配列 `[]` および未対応ツールに対して安全なフォールバック処理を実装（AC-4）
- `SkillCreateWizard.tsx` の `resolveExternalIntegration` 呼び出し箇所を `string[]` 渡しに更新（AC-5）
- テストカバレッジ 90% 以上を達成（AC-6）
- M-01 TODO コメントを全て削除（AC-7）

## Test plan

- [ ] AC-1: 複数ツール選択時に `Promise.all` で並列処理が実行されることをテストで確認
- [ ] AC-2: 各ツールの統合情報（API エンドポイント・認証方式・主要操作）がマージされることをテストで確認
- [ ] AC-3: 単一ツールを `["slack"]` のように配列で渡した場合に従来と同一の結果が返されることを確認
- [ ] AC-4: 空配列 `[]` と未対応ツール名に対してエラーなしでフォールバック値が返されることを確認
- [ ] AC-5: `SkillCreateWizard.tsx` が `string[]` を渡すよう更新されていることをコードレビューで確認
- [ ] AC-6: `resolveExternalIntegration` のテストカバレッジが 90% 以上であることを確認
- [ ] AC-7: M-01 TODO コメントが全て削除されていることを `grep` で確認
- [ ] スキルウィザード Q5 での複数ツール選択後のスキル生成が正常動作することを手動テストで確認

## 関連Issue

Closes #2069

## 備考

本実装により `UT-SKILL-WIZARD-MSO-MAIN-TOOL-UI-001`（Q5 複数選択時の「主ツール」バッジ UI 表示）で
実装した暫定措置バッジが削除対象になります。バッジ削除は別タスクとして派生する場合があります。
詳細は `outputs/phase-12/unassigned-task-detection.md` を参照してください。
EOF
)"
```

PR 草案と実行結果を `outputs/phase-13/pr-info.md` に記録する。

## PRタイトル案

```
feat(skill-wizard): UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001 resolveExternalIntegration 複数ツール並列統合対応
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
