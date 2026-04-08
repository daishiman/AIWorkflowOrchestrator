# Phase 13: PR作成

## メタ情報

| 項目       | 内容                                           |
| ---------- | ---------------------------------------------- |
| Phase      | 13                                             |
| Phase名    | PR作成                                         |
| 前提Phase  | Phase 12                                       |
| 後続Phase  | -（完了）                                      |
| ステータス | blocked（ユーザー指示待ち）                    |
| 作成日     | 2026-04-08                                     |
| 機能名     | ut-skill-wizard-w1-conversation-round-step-001 |

---

## 重要

> **PR 作成はユーザーの明示的な承認後のみ実施する。自動実行しない。**
> Wave 1 の他タスク（W1-par-02a, 02c, 02d）の完了を待って
> Wave 2 と合わせた PR 作成も検討する。

---

## 目的

実装・テスト・ドキュメント更新が完了した内容を Pull Request として提出する。

---

## 前提条件

- [ ] Phase 1〜12 が全て完了している
- [ ] ユーザーから明示的な PR 作成承認を得ている
- [ ] `pnpm --filter @repo/desktop typecheck` が PASS している
- [ ] `pnpm --filter @repo/desktop lint` が PASS している
- [ ] TC-01〜TC-19 が全て PASS している
- [ ] CI 実行環境が正常であること

---

## 実行タスク

### タスク1: ローカル最終確認

```bash
# 最終品質チェック
pnpm --filter @repo/desktop typecheck
pnpm --filter @repo/desktop lint
pnpm --filter @repo/desktop vitest run \
  apps/desktop/src/renderer/components/skill/wizard/__tests__/ConversationRoundStep.test.tsx
```

---

### タスク2: PR 作成情報の準備

**PR タイトル（案）**:

```
feat(skill-wizard): W1-par-02b ConversationRoundStep.tsx 実装（Step 1: 会話ラリー質問 / ConfigureStep 置換 / semantic default 正規化）
```

**PR 本文サマリー**:

- `ConversationRoundStep.tsx` 新規作成（Step 1: 6問・2ページ形式 / semantic default 正規化）
- `ConfigureStep.tsx` を削除し、`WizardOptions` 参照を除去
- `wizard/index.ts` への export 更新（`ConversationRoundStep` / `buildInitialAnswers` / `QUESTIONS`）
- `buildInitialAnswers()` によるスマートデフォルトプリフィル実装と semantic default 正規化
- `InterviewProgressBar.tsx` の再利用で進捗表示の重複を排除
- TC-01〜TC-19 全テスト PASS
- NON_VISUAL タスク（automation evidence で Phase 11 クリア）

**変更ファイル一覧**:

- `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx`（新規）
- `apps/desktop/src/renderer/components/skill/wizard/ConfigureStep.tsx`（削除）
- `apps/desktop/src/renderer/components/skill/wizard/__tests__/ConversationRoundStep.test.tsx`（新規）
- `apps/desktop/src/renderer/components/skill/wizard/index.ts`（更新）

---

### タスク3: PR 作成（ユーザー承認後）

```bash
# PR 作成コマンド（承認後に実行）
gh pr create \
  --title "feat(skill-wizard): W1-par-02b ConversationRoundStep.tsx 実装（Step 1: 会話ラリー質問 / ConfigureStep 置換 / semantic default 正規化）" \
  --body "$(cat outputs/phase-13/pr-info.md)"
```

---

### タスク4: CI 確認

```bash
# CI 状態確認
gh pr checks
```

---

## 参照資料

| 資料名          | パス                                                     | 説明          |
| --------------- | -------------------------------------------------------- | ------------- |
| Phase 12 成果物 | `outputs/phase-12/`                                      | PR 本文の根拠 |
| PR 準拠チェック | `outputs/phase-12/phase12-task-spec-compliance-check.md` | PR 前提確認   |

---

## 成果物

| 成果物           | 配置先                                   | 形式     |
| ---------------- | ---------------------------------------- | -------- |
| ローカル確認結果 | `outputs/phase-13/local-check-result.md` | Markdown |
| 変更サマリー     | `outputs/phase-13/change-summary.md`     | Markdown |
| PR 情報          | `outputs/phase-13/pr-info.md`            | Markdown |
| PR 完了レポート  | `outputs/phase-13/pr-ready-report.md`    | Markdown |

---

## 完了条件

- [ ] ユーザーの承認を得た後に PR が作成されている
- [ ] CI が PASS している
- [ ] Wave 1 他タスクとの合流タイミングが確認されている
- [ ] `outputs/phase-13/` に全成果物が生成されていること

---

## 完了

Phase 13 完了をもって `UT-SKILL-WIZARD-W1-CONVERSATION-ROUND-STEP-001` タスクのすべてのフェーズが完了する。
