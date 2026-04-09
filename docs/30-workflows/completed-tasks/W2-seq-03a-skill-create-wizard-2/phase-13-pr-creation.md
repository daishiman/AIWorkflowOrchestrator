# Phase 13: PR 作成（ユーザー承認待ち）

## メタ情報

| 項目       | 内容                                                       |
| ---------- | ---------------------------------------------------------- |
| Phase      | 13                                                         |
| タスクID   | UT-SKILL-WIZARD-W2-SKILL-CREATE-WIZARD-001                 |
| 機能名     | SkillCreateWizard.tsx 実装（オーケストレーション・Wave 2） |
| 前提Phase  | Phase 12                                                   |
| 後続Phase  | -（マージ後完了）                                          |
| 作成日     | 2026-04-08                                                 |
| ステータス | 未実施（blocked - ユーザー承認待ち）                       |

---

## 目的

PR 提出準備を行い、ユーザー承認を待つ（`blocked` 状態で維持）。

## 背景

Phase 1-12 の全作業が完了し、実装・テスト・ドキュメントが揃った段階で PR 提出の準備を行う。ただし、ユーザーの明示承認があるまで `git push` / `gh pr create` は実行しない。

> **重要**: Phase 13 は常に `blocked` 状態で維持すること。

---

## 実行タスク

### タスク1: PR 準備確認

**目的**: PR 提出前の最終確認を行う

**実行手順**:

1. 現在のブランチを確認する
2. 変更差分を確認する：
   ```bash
   git status
   git diff --stat
   ```
3. コミット履歴を確認する：
   ```bash
   git log --oneline -10
   ```
4. 全テストが PASS であることを最終確認する：
   ```bash
   cd apps/desktop && pnpm vitest run
   ```
5. PR 準備確認結果を `outputs/phase-13/pr-preparation.md` に記録する

**期待される成果物**:

- `outputs/phase-13/pr-preparation.md`

---

### タスク2: PR 本文の草案作成

**目的**: ユーザー承認時に即座に PR 作成できるよう草案を準備する

**PR タイトル草案**:

```
feat(skill-wizard): SkillCreateWizard.tsx 3ステップ構成へ再実装・inferSmartDefaults統合（W2-seq-03a）
```

**PR 本文草案**:

```markdown
## Summary

- `SkillCreateWizard.tsx` を 3 ステップ構成（SkillInfoStep / ConversationRoundStep / CompleteStep）に再実装
- Step 0 → Step 1 遷移時に `inferSmartDefaults` を呼び出し、`SmartDefaultResult` を Step 1 に渡す実装を追加
- NON_VISUAL 計装ポイント 5 つ（`wizard:start` 〜 `wizard:complete`）を `trackEvent` スタブで実装

## 変更内容

### 削除

- `description` / `options` / 旧生成モード state
- `handleGenerate()` 旧実装（テンプレート生成）
- `template` 関連の全条件分岐

### 追加

- `currentStep` / `skillInfoFormData` / `smartDefaults` state
- `handleSkillInfoNext()` ハンドラ（`inferSmartDefaults` 呼び出し含む）
- NON_VISUAL 計装ポイント 5 つ（`trackEvent` スタブ）

## Test plan

- [ ] `pnpm vitest run src/renderer/components/skill/__tests__/SkillCreateWizard.test.tsx` が全 PASS
- [ ] Line Coverage >= 90%
- [ ] `pnpm --filter @repo/desktop typecheck` がエラーなし
- [ ] `pnpm --filter @repo/desktop lint` がエラー・警告なし

## Related Issues

Closes #2016

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

**期待される成果物**:

- `outputs/phase-13/pr-draft.md`（PR 本文草案）

---

### タスク3: CI 確認準備

**目的**: PR 提出後に CI が通過するよう事前確認する

**実行手順**:

1. ローカルで全テストが PASS することを確認する：
   ```bash
   cd apps/desktop && pnpm vitest run
   ```
2. 型チェックが通ることを確認する：
   ```bash
   pnpm --filter @repo/desktop typecheck
   ```
3. Lint が通ることを確認する：
   ```bash
   pnpm --filter @repo/desktop lint
   ```
4. CI 確認結果を `outputs/phase-13/pr-preparation.md` に追記する

**期待される成果物**:

- CI 確認記録

---

## 参照資料

| 参照資料        | パス                           | 内容                      |
| --------------- | ------------------------------ | ------------------------- |
| Phase 12 成果物 | `outputs/phase-12/`            | PR 本文作成の参考         |
| Phase 9 QA 結果 | `outputs/phase-9/qa-result.md` | typecheck / lint 最終結果 |

---

## 成果物

| 成果物      | パス                                 | 内容                           |
| ----------- | ------------------------------------ | ------------------------------ |
| PR 準備確認 | `outputs/phase-13/pr-preparation.md` | ブランチ・差分・テスト確認記録 |
| PR 草案     | `outputs/phase-13/pr-draft.md`       | PR タイトル・本文草案          |

---

## PR 作成コマンド（ユーザー承認後に実行）

> **注意**: 以下のコマンドはユーザーの明示承認があるまで実行しないこと。

```bash
# ブランチ push
git push origin HEAD

# PR 作成
gh pr create \
  --title "feat(skill-wizard): SkillCreateWizard.tsx 3ステップ構成へ再実装・inferSmartDefaults統合（W2-seq-03a）" \
  --body "$(cat outputs/phase-13/pr-draft.md)"
```

---

## 完了条件

- [ ] ブランチ・差分の確認が完了していること
- [ ] PR 本文草案（`pr-draft.md`）が作成されていること
- [ ] ローカルで全テストが PASS していること
- [ ] CI 確認（typecheck / lint）が完了していること
- [ ] **`git push` / `gh pr create` はユーザー承認まで実行しないこと**
- [ ] 本 Phase 内の全タスクを 100% 実行完了

---

## Phase末端アクション【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 各タスクを 100% 完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認
- [ ] Phase 13 は `blocked` 状態を維持する（PR 作成はユーザー承認後）

---

## 依存関係

- **前提**: Phase 12（ドキュメント更新・canonical 6 成果物完成）が完了していること
- **後続**: ユーザー承認後に PR を作成し、マージ後完了

---

## ブロック理由

> Phase 13 は常に **blocked** 状態で維持すること。
> `git push` / `gh pr create` の実行はユーザーの明示承認が必要です。
