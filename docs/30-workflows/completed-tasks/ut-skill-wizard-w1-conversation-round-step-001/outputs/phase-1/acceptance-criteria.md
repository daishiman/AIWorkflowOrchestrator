# Phase 1 成果物: 受入条件（AC-1〜AC-13）

## メタ情報

| 項目     | 内容                                           |
| -------- | ---------------------------------------------- |
| タスクID | UT-SKILL-WIZARD-W1-CONVERSATION-ROUND-STEP-001 |
| Phase    | 1 — 要件定義                                   |
| 作成日   | 2026-04-08                                     |

---

## 受入条件一覧

| AC    | 内容                                                                                                                | 優先度                                                                                            |
| ----- | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| AC-1  | `ConversationRoundStep` コンポーネントが `apps/desktop/src/renderer/components/skill/wizard/` に存在する            | MUST                                                                                              |
| AC-2  | Props として `smartDefaults: SmartDefaultResult` と `onComplete: (answers: ConversationAnswers) => void` を受け取る | MUST                                                                                              |
| AC-3  | 6問（Q1〜Q6）が「質問N/6」形式の進捗インジケーターとともに表示される                                                | MUST                                                                                              |
| AC-4  | ページ 1 には Q1〜Q3、ページ 2 には Q4〜Q6 が表示される                                                             | MUST                                                                                              |
| AC-5  | `smartDefaults` の各フィールドが対応する質問の初期値（プリフィル）として表示される                                  | MUST                                                                                              |
| AC-6  | `smartDefaults` のフィールドが `null` の場合、該当質問は空欄（未選択 / 空文字）で表示される                         | MUST                                                                                              |
| AC-7  | ページ 1 の「次へ」ボタン押下でページ 2 に遷移する                                                                  | MUST                                                                                              |
| AC-8  | ページ 2 の「完了」ボタン押下で `onComplete(answers)` が呼ばれる                                                    | MUST                                                                                              |
| AC-9  | `onComplete` には現時点の `ConversationAnswers` 型の回答データが渡される                                            | MUST                                                                                              |
| AC-10 | `pnpm --filter @repo/desktop typecheck` が PASS する                                                                | MUST                                                                                              |
| AC-11 | `apps/desktop/src/renderer/components/skill/wizard/__tests__/ConversationRoundStep.test.tsx` が PASS する           | MUST                                                                                              |
| AC-12 | ページ 1 の「戻る」ボタン押下で `onBack` が呼ばれる（`onBack` が渡された場合のみ表示）                              | MUST                                                                                              |
| AC-13 | `ConfigureStep.tsx` / `WizardOptions` の削除・参照置換は W2-seq-03a の担当である                                    | MINOR（Wave 2 範囲 — SkillCreateWizard.tsx の統合は W2-seq-03a が担当するため、Phase 9 では N/A） |

---

## 補足: AC-13 の取り扱い

- Phase 9 仕様書に「本タスクは新規作成のみのため削除確認は N/A」と明記されている
- `SkillCreateWizard.tsx` が `ConfigureStep` を参照しており、その統合は後続タスク W2-seq-03a のスコープ
- 本タスクでは `ConversationRoundStep.tsx` を新規作成し、`wizard/index.ts` に export を追加する
- `ConfigureStep.tsx` の削除と SkillCreateWizard.tsx からの参照除去は W2-seq-03a で実施する
