# Phase 9: 品質保証

## メタ情報

| 項目       | 内容                                           |
| ---------- | ---------------------------------------------- |
| Phase      | 9                                              |
| Phase名    | 品質保証                                       |
| 前提Phase  | Phase 8                                        |
| 後続Phase  | Phase 10                                       |
| ステータス | completed                                      |
| 作成日     | 2026-04-08                                     |
| 機能名     | ut-skill-wizard-w1-conversation-round-step-001 |

---

## 目的

typecheck / lint / test の全通過を確認し、Phase 10 最終レビューゲートへ進む前の品質を保証する。

---

## 実行タスク

### タスク1: TypeScript 型チェック

```bash
pnpm --filter @repo/desktop typecheck
```

**期待結果**: エラー 0 件

---

### タスク2: ESLint

```bash
pnpm --filter @repo/desktop lint
```

**期待結果**: エラー・警告 0 件（`@repo/desktop` スコープ）

---

### タスク3: 全テスト実行

```bash
pnpm --filter @repo/desktop vitest run \
  apps/desktop/src/renderer/components/skill/wizard/__tests__/ConversationRoundStep.test.tsx
```

**期待結果**: TC-01〜TC-19 が全て PASS

---

### タスク4: 品質チェックリスト確認

#### 機能検証

- [ ] TC-01〜TC-19 が全て PASS している
- [ ] `buildInitialAnswers()` の null フォールバック動作が確認済み

#### コード品質

- [ ] `pnpm --filter @repo/desktop typecheck` が PASS している
- [ ] `pnpm --filter @repo/desktop lint` が PASS している
- [ ] 不要な `console.log` / デバッグコードが除去されている
- [ ] `buildInitialAnswers()` が semantic default を UI ラベルへ正規化している

#### テスト網羅性

- [ ] `ConversationRoundStep.tsx`: line 90%+ / branch 80%+
- [ ] `buildInitialAnswers()`: line 100% / branch 100%

#### ファイル削除確認

Phase 9 QA では以下を PASS 基準とする（`[FB-UI-02-1]` 準拠）:

- 削除ファイルは「git delete されている OR `export {}` stub 化かつ live import ゼロ」のいずれか
- 本タスクは `ConfigureStep.tsx` 削除を含むため、削除確認を必須とする

---

## 参照資料

| 資料名         | パス                                                                                         | 説明         |
| -------------- | -------------------------------------------------------------------------------------------- | ------------ |
| テストファイル | `apps/desktop/src/renderer/components/skill/wizard/__tests__/ConversationRoundStep.test.tsx` | 品質確認対象 |
| コンポーネント | `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx`                | 品質確認対象 |

---

## 成果物

| 成果物               | 配置先                                    | 形式     |
| -------------------- | ----------------------------------------- | -------- |
| 品質検証結果レポート | `outputs/phase-9/quality-check-result.md` | Markdown |

---

## 完了条件

- [ ] typecheck / lint / test が全て PASS している
- [ ] カバレッジが目標値（line 90%+ / branch 80%+）を達成している
- [ ] `outputs/phase-9/` に全成果物が生成されていること

---

## 次Phase

**Phase 10: 最終レビューゲート** — AC-1〜AC-13 の充足確認を行い、AC-13（`ConfigureStep.tsx` 削除 / `WizardOptions` 参照ゼロ）を機械検証する。
