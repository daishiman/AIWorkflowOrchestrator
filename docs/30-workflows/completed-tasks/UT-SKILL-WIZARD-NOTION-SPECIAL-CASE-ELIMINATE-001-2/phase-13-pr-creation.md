# Phase 13: PR作成

## メタ情報

| 項目       | 内容                                              |
| ---------- | ------------------------------------------------- |
| Phase      | 13                                                |
| タスクID   | UT-SKILL-WIZARD-NOTION-SPECIAL-CASE-ELIMINATE-001 |
| 機能名     | notion-freetext-special-case-eliminate            |
| 前提Phase  | Phase 12                                          |
| 後続Phase  | -（本タスクでは実行しない）                       |
| 作成日     | 2026-04-15                                        |
| ステータス | blocked                                           |

## 目的

commit / push / PR 作成は本タスクのスコープ外とする。ユーザーが明示的に承認した場合のみ、別途実施する。

- 依存Phase参照: Phase 2 / Phase 5 / Phase 6 / Phase 7 / Phase 8 / Phase 9 の成果物を前提にする（`outputs/phase-2/design.md`, `outputs/phase-5/implementation-summary.md`, `outputs/phase-6/edge-case-tests.md`, `outputs/phase-7/coverage-report.md`, `outputs/phase-8/refactoring-log.md`, `outputs/phase-9/quality-report.md`）

## 実行タスク

- ローカル確認結果を要約する
- 変更サマリーを整理する
- PR 作成ゲートのみ保持する
- commit / push / PR は実行しない

## PR 作成情報（ユーザー承認後に使用）

### ブランチ名

```
refactor/UT-SKILL-WIZARD-NOTION-SPECIAL-CASE-ELIMINATE-001
```

### PR タイトル

```
refactor(skill-wizard): notion freeText特別ケース解消 [UT-SKILL-WIZARD-NOTION-SPECIAL-CASE-ELIMINATE-001]
```

### PR 本文テンプレート

```markdown
## Summary

- `createQuestionAnswer()` 内の `notion` ハードコード特別ケース分岐を削除
- `SEMANTIC_LABEL_MAP`（`skill-wizard-label-map.ts`）の `q5` エントリに notion → `その他` + `freeText: "Notion"` の情報を統合
- `QuestionSemanticLabelMap` 型を拡張し、`resolveLabelEntry()` を新設して `freeText` 付き変換エントリをサポート
- `resolveSemanticLabel()` は既存の string 契約を維持し、既存呼び出し元の後方互換を保つ
- 変換ロジックを `SEMANTIC_LABEL_MAP` と `resolveLabelEntry()` へ一元化し、今後の拡張を容易にする

## Test plan

- [ ] `pnpm typecheck` が PASS すること
- [ ] `pnpm --filter @repo/shared exec vitest run src/types/__tests__/skill-wizard-label-map.test.ts` が PASS すること
- [ ] `pnpm --filter @repo/desktop exec vitest run src/renderer/components/skill/wizard/__tests__/ConversationRoundStep.test.tsx` が PASS すること
- [ ] `pnpm --filter @repo/desktop build` が PASS すること
- [ ] Notion smart default で Q5 が「その他」+ freeText「Notion」になることを確認
- [ ] Slack / GitHub の smart default が後退していないことを確認

## Related Issue

Closes #2089
Depends on: UT-SKILL-WIZARD-SEMANTIC-DEFAULT-EXTENSIBILITY-001
```

## 実行手順

### 1. ローカル確認結果の記録

```bash
# 型チェック
pnpm typecheck

# shared helper test
pnpm --filter @repo/shared exec vitest run src/types/__tests__/skill-wizard-label-map.test.ts

# desktop regression test
pnpm --filter @repo/desktop exec vitest run src/renderer/components/skill/wizard/__tests__/ConversationRoundStep.test.tsx

# デスクトップビルド
pnpm --filter @repo/desktop build

# 追加確認の全体テスト
pnpm --filter @repo/desktop test
```

### 2. 変更内容の要約

`outputs/phase-13/pr-info.md` に以下を記録する:

- 変更ファイル一覧（`git diff --stat`）
- 型チェック・ビルド・テストの実行結果
- PR タイトル・ブランチ名・PR 本文（上記テンプレート）
- blocked 状態の記録

### 3. CI 確認手順（PR 作成後、ユーザー承認時に実施）

PR 作成後は以下の CI チェックを確認する:

| CI チェック項目          | 確認コマンド                                          | 期待結果 |
| ------------------------ | ----------------------------------------------------- | -------- |
| TypeScript 型チェック    | `gh run view --repo daishiman/AIWorkflowOrchestrator` | PASS     |
| ESLint                   | CI ログを確認                                         | PASS     |
| Vitest（ユニットテスト） | CI ログを確認                                         | PASS     |
| ビルド（desktop）        | CI ログを確認                                         | PASS     |

```bash
# PR 作成後の CI ステータス確認
gh pr checks <PR番号> --repo daishiman/AIWorkflowOrchestrator

# CI 実行履歴の確認
gh run list --repo daishiman/AIWorkflowOrchestrator --limit 5
```

### 4. PR 作成コマンド（ユーザー承認後のみ実行）

```bash
# ブランチ作成
git checkout -b refactor/UT-SKILL-WIZARD-NOTION-SPECIAL-CASE-ELIMINATE-001

# コミット（pre-commit フックを通す）
git add apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx
git add packages/shared/src/types/skill-wizard-label-map.ts
git add <テストファイルのパス>
git commit -m "refactor(skill-wizard): notion freeText特別ケース解消

- createQuestionAnswer() の notion ハードコード分岐を削除
- SEMANTIC_LABEL_MAP q5 エントリに freeText 情報を統合
- QuestionSemanticLabelMap 型を freeText 対応に拡張

Closes #2089
Task: UT-SKILL-WIZARD-NOTION-SPECIAL-CASE-ELIMINATE-001"

# プッシュ
git push -u origin refactor/UT-SKILL-WIZARD-NOTION-SPECIAL-CASE-ELIMINATE-001

# PR 作成
gh pr create \
  --title "refactor(skill-wizard): notion freeText特別ケース解消 [UT-SKILL-WIZARD-NOTION-SPECIAL-CASE-ELIMINATE-001]" \
  --body "$(cat <<'EOF'
## Summary

- `createQuestionAnswer()` 内の `notion` ハードコード特別ケース分岐を削除
- `SEMANTIC_LABEL_MAP`（`skill-wizard-label-map.ts`）の `q5` エントリに notion → `その他` + `freeText: "Notion"` の情報を統合
- `QuestionSemanticLabelMap` 型を拡張して `freeText` 付き変換エントリをサポート
- 変換ロジックを `SEMANTIC_LABEL_MAP` / `resolveLabelEntry()` へ一元化し、今後の拡張を容易にする

## Test plan

- [ ] `pnpm typecheck` が PASS すること
- [ ] `pnpm --filter @repo/shared exec vitest run src/types/__tests__/skill-wizard-label-map.test.ts` が PASS すること
- [ ] `pnpm --filter @repo/desktop exec vitest run src/renderer/components/skill/wizard/__tests__/ConversationRoundStep.test.tsx` が PASS すること
- [ ] `pnpm --filter @repo/desktop build` が PASS すること
- [ ] Notion smart default で Q5 が「その他」+ freeText「Notion」になることを確認
- [ ] Slack / GitHub の smart default が後退していないことを確認

## Related Issue

Closes #2089
Depends on: UT-SKILL-WIZARD-SEMANTIC-DEFAULT-EXTENSIBILITY-001
EOF
)"
```

## 禁止事項

- commit（ユーザー承認なしに実行禁止）
- push（ユーザー承認なしに実行禁止）
- PR 作成（ユーザー承認なしに実行禁止）

## 参照資料

| 資料名               | パス                                          | 説明            |
| -------------------- | --------------------------------------------- | --------------- |
| 最終レビュー         | `outputs/phase-10/final-review-result.md`     | Phase 10 成果物 |
| 手動テスト           | `outputs/phase-11/manual-test-result.md`      | Phase 11 成果物 |
| ドキュメント更新履歴 | `outputs/phase-12/documentation-changelog.md` | Phase 12 成果物 |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`    | Phase 12 成果物 |

## 成果物

| 成果物 | パス                          | 説明                           |
| ------ | ----------------------------- | ------------------------------ |
| PR情報 | `outputs/phase-13/pr-info.md` | 条件: ユーザー承認後のみ作成可 |

## 完了条件

- [ ] ローカル確認結果（typecheck / build / test）を記録した
- [ ] 変更サマリーを記録した
- [ ] PR タイトル・ブランチ名・PR 本文テンプレートが `pr-info.md` に記録されている
- [ ] CI 確認手順が記録されている
- [ ] commit / push / PR を実行していない
- [ ] blocked 状態を記録した
- [ ] 本Phase内の全タスクを100%実行完了（blocked gate）

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] ユーザーの許可なしに commit / push / PR を実行していない
- [ ] 実行記録を残した

## タスク完了

Phase 13 は **blocked**。ユーザー承認後にのみ別途 PR 作成へ進む。
