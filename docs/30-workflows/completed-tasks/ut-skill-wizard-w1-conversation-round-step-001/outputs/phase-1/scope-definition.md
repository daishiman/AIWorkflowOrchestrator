# Phase 1 成果物: スコープ定義書

## メタ情報

| 項目       | 内容                                           |
| ---------- | ---------------------------------------------- |
| タスクID   | UT-SKILL-WIZARD-W1-CONVERSATION-ROUND-STEP-001 |
| Phase      | 1 — 要件定義                                   |
| タスク種別 | NON_VISUAL（Renderer 内部実装のみ）            |
| 作成日     | 2026-04-08                                     |

---

## スコープ内（含むもの）

| 項目                      | 詳細                                                                                  |
| ------------------------- | ------------------------------------------------------------------------------------- |
| ConversationRoundStep.tsx | 新規作成。Step 1 コンポーネント本体・プリフィルロジック・ページング                   |
| 6問定義定数               | Q1〜Q6 の質問文・選択肢・ID 定数 (`QUESTIONS`)                                        |
| ページング状態管理        | ページ 1/2 の切り替え (`useState<1 \| 2>`)                                            |
| 進捗インジケーター        | 「質問N/6」テキスト表示 + InterviewProgressBar 再利用                                 |
| プリフィル変換            | `inferSmartDefaults()` 結果 (`SmartDefaultResult`) → `ConversationAnswers` 初期値変換 |
| null フォールバック       | null フィールドは空欄（selectedOption: null / freeText: ""）                          |
| 回答状態管理              | `ConversationAnswers` 型の state と親への callback (`onComplete`)                     |
| 戻る導線                  | `onBack` が渡された場合のみページ 1 に「戻る」ボタンを表示                            |
| wizard/index.ts 更新      | `ConversationRoundStep` export 追加                                                   |
| ユニットテスト            | `ConversationRoundStep.test.tsx` 新規作成（TC-01〜TC-19）                             |

## スコープ外（含まないもの）

| 項目                               | 担当タスク   | 補足                                 |
| ---------------------------------- | ------------ | ------------------------------------ |
| SkillCreateWizard.tsx への統合     | W2-seq-03a   | 完全な Props 接続は Wave 2 の担当    |
| ConfigureStep.tsx の削除           | W2-seq-03a   | Phase 9 で削除確認 N/A と明記        |
| Q3 スケジュール設定 UI 詳細実装    | 別タスク候補 | scheduleConfig: undefined の最小実装 |
| Step 0（SkillInfoStep.tsx）        | W1-par-02a   | 並列タスク                           |
| Step 2（CompleteStep.tsx）         | W1-par-02c   | 並列タスク                           |
| アニメーション・トランジション効果 | 別タスク候補 | スコープ外                           |

---

## 成果物ファイル一覧

| 種別     | ファイルパス                                                                                 |
| -------- | -------------------------------------------------------------------------------------------- |
| 新規作成 | `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx`                |
| 新規作成 | `apps/desktop/src/renderer/components/skill/wizard/__tests__/ConversationRoundStep.test.tsx` |
| 更新     | `apps/desktop/src/renderer/components/skill/wizard/index.ts`                                 |
