# TASK-SC-16: SkillCreateWizard LLM ロジック hook 化

## メタ情報

- 検出元: TASK-SC-07-SKILL-CREATE-WIZARD-LLM-CONNECTION Phase 12 スキルフィードバックレポート
- 優先度: Medium
- ステータス: 未着手
- 関連ファイル:
  - `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`
  - `apps/desktop/src/renderer/store/slices/agentSlice.ts`
  - `apps/desktop/src/renderer/store/slices/generationSlice.ts`（TASK-SC-10 完了後）
  - `apps/desktop/src/renderer/components/skill/wizard/GenerateStep.tsx`

## 目的

`SkillCreateWizard.tsx` に集約された LLM 生成専用ロジック（`generationMode` / `llmDescription` / `localPlanResult` / LLM フロー state 管理）をカスタム hook に切り出し、コンポーネントの単一責務原則（SRP）を回復する。

## 背景

TASK-SC-07 で `SkillCreateWizard.tsx` に LLM 生成フロー（`planSkill` / `executePlan` / `getWorkflowState`）を接続した結果、1 コンポーネントに以下の 2 つの責務が混在した：

1. **Wizard オーケストレーション**: ステップ遷移、バリデーション、テンプレートフロー
2. **LLM 生成制御**: `planSkill` 呼出し、進捗管理、エラー処理、非同期キャンセル

この混在により、将来の機能追加（新しい生成モード追加、エラーリカバリー強化等）や unit test の追加コストが高くなっている。

TASK-SC-10（agentSlice → generationSlice 分割）と連動して実施することで、state の所有権が明確になり保守性が向上する。

## 実行タスク

- [ ] `SkillCreateWizard.tsx` 内の LLM 生成専用ロジックを特定・一覧化する
  - `generationMode` state と切り替えロジック
  - `llmDescription` state と更新関数
  - `localPlanResult` state と更新関数
  - `handlePlanSkill` / `handleExecutePlan` / `handleCancelPlan` ハンドラー
  - request-id guard ロジック
- [ ] `useSkillLlmGeneration` カスタム hook を新規作成する
  - 入力: `skillSpec`, `onComplete(planId: string)`, `onCancel()`
  - 出力: `{ plan, generationMode, handlePlan, handleExecute, handleCancel, isPlanning, isExecuting, error }`
  - `getWorkflowState(planId)` による failure snapshot 再読込ロジックを含む
  - `terminal_handoff` 分岐処理を含む
  - 対称クリア処理（cancel / execute / unmount 全経路）を含む
- [ ] `SkillCreateWizard.tsx` で `useSkillLlmGeneration` を使うよう書き換える
- [ ] `useSkillLlmGeneration` の unit test を追加する（`planSkill` 成功・失敗・キャンセル・terminal_handoff）
- [ ] `SkillCreateWizard.llm-generation.test.tsx` の既存テストが全件 PASS することを確認する（回帰テスト）
- [ ] TypeScript 型チェック PASS

## 完了条件

- [ ] `SkillCreateWizard.tsx` から LLM 生成専用ロジックが除去され、hook 呼出しに置き換えられること
- [ ] `useSkillLlmGeneration` hook が独立して動作すること（mock を使った unit test PASS）
- [ ] テンプレートフローの既存動作が壊れないこと（回帰テスト PASS）
- [ ] TypeScript 型チェック PASS
- [ ] 全テスト PASS

## 依存関係

- TASK-SC-10（agentSlice → generationSlice 分割）を先に実施することで hook の state 参照先が安定する
  - TASK-SC-10 が未完了の場合は `agentSlice` の generation selectors を一時的に参照してよい

## 苦戦箇所（TASK-SC-07 実装知見）

| 苦戦箇所                            | 問題                                                                  | 解決策                                                                                                                                                |
| ----------------------------------- | --------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Hybrid State Pattern の非対称クリア | local state と store state の片方だけ残ると再オープン時に不整合になる | cancel / execute / unmount の全経路で `setLocalPlanResult(null)` + `clearGenerationState()` を対称に呼ぶ。hook に閉じ込めることで漏れを防ぎやすくなる |
| request-id guard の管理             | 非同期応答の遅延時に古い値が上書きされる                              | hook 内で `currentRequestIdRef` を useRef で管理し、応答到着時に guard する                                                                           |
| terminal_handoff 分岐漏れ           | integrated_api のみ前提だと terminal_handoff 応答を適切に表示できない | hook の executePlan 結果処理で `terminal_handoff` ケースを必ず分岐する                                                                                |
| PlanResult 型の二重定義（C-4）      | ローカル型が agentSlice の型をシャドウしやすい                        | hook 内では `agentSlice.ts`（または将来は generationSlice.ts）の型を Single Source of Truth として import する                                        |

## 参照

- TASK-SC-07-SKILL-CREATE-WIZARD-LLM-CONNECTION Phase 12 スキルフィードバックレポート
- TASK-SC-10（agentSlice → generationSlice 分割）
- `docs/30-workflows/TASK-SC-07-SKILL-CREATE-WIZARD-LLM-CONNECTION/index.md`
- P31: Zustand Store Hooks 無限ループ（hook 分割時の注意）
- P48: useShallow 未適用による派生セレクタ無限ループ
