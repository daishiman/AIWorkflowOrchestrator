# Phase 7: テストカバレッジ確認

## メタ情報

| 項目       | 内容                                           |
| ---------- | ---------------------------------------------- |
| Phase      | 7                                              |
| Phase名    | テストカバレッジ確認                           |
| 前提Phase  | Phase 6                                        |
| 後続Phase  | Phase 8                                        |
| ステータス | completed                                      |
| 作成日     | 2026-04-08                                     |
| 機能名     | ut-skill-wizard-w1-conversation-round-step-001 |

---

## 目的

変更したファイルの line カバレッジ・branch カバレッジを実測し、品質基準を満たしていることを確認する。
広域指定（全体 X%）ではなく、変更ファイル・変更ブロック単位で実測値を記録する。

---

## カバレッジ対象ファイル

| ファイル                                                                      | 目標 line | 目標 branch | 重点ブロック                      |
| ----------------------------------------------------------------------------- | --------- | ----------- | --------------------------------- |
| `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx` | 90%+      | 80%+        | `buildInitialAnswers`・ページング |
| `buildInitialAnswers()` 関数（ConversationRoundStep.tsx 内）                  | 100%      | 100%        | null フォールバック分岐           |

---

## 実行タスク

### タスク1: カバレッジ計測

**実行手順**:

1. `pnpm --filter @repo/desktop vitest run --coverage` を実行する
2. `ConversationRoundStep.tsx` の line/branch カバレッジを記録する
3. 目標未達の場合は Phase 6 へ戻りテストを追加する

```bash
# カバレッジ計測コマンド
pnpm --filter @repo/desktop vitest run --coverage \
  --coverage.include="**/wizard/ConversationRoundStep.tsx"
```

---

### タスク2: 重点ブロックの実測値記録

**目的**: `buildInitialAnswers()` 周辺の line/branch 実測値を証跡として残す

**確認項目**:

- `buildInitialAnswers()` の line カバレッジ実測値
- `buildInitialAnswers()` の branch カバレッジ実測値（null 分岐含む）
- ページング切り替えロジックの branch カバレッジ実測値
- `onBack` 条件分岐（あり/なし）の branch カバレッジ実測値

---

## 参照資料

| 資料名         | パス                                                                                         | 説明                       |
| -------------- | -------------------------------------------------------------------------------------------- | -------------------------- |
| テストファイル | `apps/desktop/src/renderer/components/skill/wizard/__tests__/ConversationRoundStep.test.tsx` | 対象テスト（TC-01〜TC-19） |
| コンポーネント | `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx`                | カバレッジ計測対象         |

---

## 成果物

| 成果物             | 配置先                               | 形式     |
| ------------------ | ------------------------------------ | -------- |
| カバレッジレポート | `outputs/phase-7/coverage-result.md` | Markdown |

---

## 完了条件

- [ ] `ConversationRoundStep.tsx` が line 90%+ / branch 80%+ を達成している
- [ ] `buildInitialAnswers()` が line 100% / branch 100% を達成している
- [ ] 変更ブロックの実測値が `outputs/phase-7/coverage-result.md` に記録されている
- [ ] 未達の場合は Phase 6 へ戻り、不足テストを追加している

---

## 次Phase

**Phase 8: リファクタリング** — 重複除去・命名整理・設計改善を記録する。
