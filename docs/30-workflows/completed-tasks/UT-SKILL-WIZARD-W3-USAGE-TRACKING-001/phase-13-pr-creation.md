# Phase 13: PR 作成

**Task ID**: UT-SKILL-WIZARD-W3-USAGE-TRACKING-001  
**Task Name**: スキルウィザード使用率計装（trackEvent / Wave 3）  
**Phase**: 13 - PR 作成  
**作成日**: 2026-04-11

---

> **WARNING: このフェーズは BLOCKED 状態です**
>
> Phase 13 はユーザーの明示的な承認があるまで実行禁止である。
> commit / push / PR 作成は一切行ってはならない。
> 承認を受けた後、タスク 13-1 から順に実施すること。

---

## 目的

Phase 10〜12 を通過した実装をマージ可能な状態に整備し、Pull Request を作成する。

---

## 前提条件

以下の全条件が満たされていることを確認した上で、ユーザーに承認を求めること。

| 条件                                         | 確認方法                                                                    |
| -------------------------------------------- | --------------------------------------------------------------------------- |
| Phase 10 が PASS または MINOR で通過している | `outputs/phase-10/review-result.md` を確認                                  |
| Phase 11 の証跡ファイルが揃っている          | `outputs/phase-11/manual-test-result.md` の存在確認                         |
| Phase 12 の 6 成果物が全て作成されている     | `outputs/phase-12/phase12-task-spec-compliance-check.md` の全項目 OK を確認 |
| AC-1〜AC-9 が全て充足されている              | Phase 10 のチェックリストを確認                                             |

---

## タスク 13-1: PR 準備確認（承認後のみ実施）

ユーザーからの明示的な承認を受けた後、以下を確認する。

### Step 1: 全テスト PASS の最終確認

```bash
pnpm --filter @repo/desktop test:run
```

- 期待結果: 全テスト PASS
- 失敗が 1 件でもある場合は PR 作成を中止し、原因を調査する

### Step 2: ブランチ名の確認

作業ブランチが以下の命名規則に従っていることを確認する。

- 推奨ブランチ名: `feat/skill-wizard-usage-tracking-w3`
- 命名規則: `feat/<機能名>-<識別子>` 形式
- 現在のブランチ名が命名規則と異なる場合は、ユーザーに確認してからブランチ名を変更する

ブランチ確認コマンド:

```bash
git branch --show-current
```

### Step 3: コミットメッセージの作成

コミットメッセージを以下の形式で作成する。

```
feat(skill-wizard): W3-seq-04 使用率計装（trackEvent / Wave 3）

- trackEvent.ts に skill_wizard_* 4 イベント型を追加
- SkillCreateWizard.tsx に 5 箇所の計装ポイントを追加
- CompleteStep.tsx にアクション選択時の計装を追加
- trackEvent.ts のテストカバレッジ 100% 達成
- SkillCreateWizard.tsx のテストカバレッジ 90% 以上を維持
- CompleteStep.tsx のテストカバレッジ 90% 以上を維持

Closes #<Issue番号>
```

コミット前に以下を確認する。

- `git status` でステージングされていないファイルがないこと
- `git diff --staged` でコミット対象のファイルが意図通りであること
- 機密情報（API キー・シークレット等）が含まれていないこと

---

## タスク 13-2: PR 作成（承認後のみ実施）

### Step 1: リモートへのプッシュ

```bash
git push origin feat/skill-wizard-usage-tracking-w3
```

### Step 2: PR 作成コマンド

以下のコマンドで PR を作成する。

```bash
gh pr create \
  --title "feat(skill-wizard): W3-seq-04 使用率計装（trackEvent / Wave 3）" \
  --body "$(cat <<'EOF'
## 概要

スキルウィザードの使用率計装（trackEvent / Wave 3）を実装した。

## 変更ファイル

- `apps/desktop/src/renderer/utils/trackEvent.ts` — skill_wizard_* 4 イベント型の追加
- `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx` — 5 箇所の計装ポイント追加
- `apps/desktop/src/renderer/components/skill/wizard/CompleteStep.tsx` — アクション選択時の計装追加

## 受入条件チェックリスト

- [ ] AC-1: trackEvent に skill_wizard_open イベントが型安全に定義・呼び出しできる
- [ ] AC-2: trackEvent に skill_wizard_step_complete イベントが型安全に定義・呼び出しできる
- [ ] AC-3: trackEvent に skill_wizard_next_action イベントが型安全に定義・呼び出しできる
- [ ] AC-4: trackEvent に skill_wizard_abandon イベントが型安全に定義・呼び出しできる
- [ ] AC-5: SkillCreateWizard.tsx の 5 つの計装ポイントでイベントが正しく発火する
- [ ] AC-6: CompleteStep.tsx で skill_wizard_next_action が選択時に発火する
- [ ] AC-7: trackEvent.ts のスタブの全分岐でテストカバレッジ 100% を達成する
- [ ] AC-8: SkillCreateWizard.tsx のテストカバレッジが 90% 以上を維持する
- [ ] AC-9: CompleteStep.tsx のテストカバレッジが 90% 以上を維持する

## テスト

- `pnpm --filter @repo/desktop test:run` — 全テスト PASS
- `pnpm --filter @repo/desktop test:coverage` — カバレッジ目標達成

## NON_VISUAL タスクについて

本 PR は Renderer 内部の計装のみを対象とし、UI の視覚的変更は一切伴わない。
スクリーンショットによる確認は不要。

## 関連

- Task: UT-SKILL-WIZARD-W3-USAGE-TRACKING-001
- Lane: skill-wizard-redesign-lane / W3-seq-04
EOF
)"
```

### PR タイトル

```
feat(skill-wizard): W3-seq-04 使用率計装（trackEvent / Wave 3）
```

### PR 本文の必須セクション

PR 本文には以下のセクションを必ず含めること。

1. **概要**: 変更の目的と対象ファイルの一覧
2. **受入条件チェックリスト**: AC-1〜AC-9 の全項目をチェックボックス形式で列挙
3. **テスト**: 実行したコマンドと期待結果
4. **NON_VISUAL タスクについて**: スクリーンショット不要の理由
5. **関連**: Task ID と Lane 情報

---

## タスク 13-3: CI 確認

PR 作成後、以下のコマンドで CI/CD の完了を待機する。

```bash
gh run watch
```

### CI 確認項目

| チェック項目           | 期待結果 |
| ---------------------- | -------- |
| TypeScript 型チェック  | PASS     |
| ESLint                 | PASS     |
| Vitest テスト          | PASS     |
| カバレッジ閾値チェック | PASS     |

### CI 失敗時の対処

- CI が失敗した場合は、失敗したチェック項目のログを確認する
- ローカルで同じコマンドを実行して再現性を確認する
- 修正後は `git push` で同一ブランチにプッシュし、CI を再実行する
- `--no-verify` オプションの使用は禁止する

---

## 注意事項

- **Phase 13 はユーザーの明示的な承認があるまで実行禁止である**
- commit / push は承認後のみ実施する
- PR 作成前に全テストが PASS であることを必ず確認する
- `git commit --no-verify` / `git push --no-verify` は絶対に使用しない
- main ブランチへの直接プッシュは禁止する
- force push（`git push --force`）は禁止する

---

## 完了条件

以下の条件が全て満たされた場合に Phase 13 を完了とみなし、タスク全体を完了とする。

1. PR が作成されている（`gh pr view` で確認可能）
2. CI/CD の全チェックが PASS している
3. PR の受入条件チェックリスト（AC-1〜AC-9）が全て確認済みである
4. レビュアーへのアサインが完了している（プロジェクトのレビュープロセスに従う）
