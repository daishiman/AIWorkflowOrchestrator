# TASK-SC-07: SkillCreateWizard への LLM 生成フロー接続

## メタ情報

- 検出元: GitHub Issue #1634 / TASK-SC-07
- 優先度: 中
- ステータス: 完了（Phase 1-12 完了 / Phase 13 blocked）
- 関連ファイル:
  - `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`
  - `apps/desktop/src/renderer/components/skill/wizard/SkillInfoStep.tsx`
  - `apps/desktop/src/renderer/components/skill/wizard/DescribeStep.tsx`
  - `apps/desktop/src/renderer/components/skill/wizard/GenerateStep.tsx`
  - `apps/desktop/src/renderer/store/slices/agentSlice.ts`
  - `apps/desktop/src/preload/skill-creator-api.ts`

## 目的

SkillCreateWizard の 4 段階フローに `planSkill` / `executePlan` を接続し、ユーザーが「LLM で生成」を選んだ場合に計画生成から実行完了までを UI 上で完結できるようにする。

## 背景

TASK-SC-06 で SkillLifecyclePanel への LLM 接続は完了しているが、SkillCreateWizard 側は未接続のままだった。  
本タスクでは、その接続を独立したタスクとして追加し、既存の「テンプレートから作成」フローを壊さずに LLM 生成ルートを増やす。

## 完了させたいこと

- Step 0（`SkillInfoStep` + LLM 説明入力）で「LLM で生成」と「テンプレートから作成」を選択できる
- LLM 選択時に GenerateStep へ遷移し、`planSkill` の結果を表示できる
- `generationProgress` とエラー表示が GenerateStep に出る
- `executePlan(planId, skillSpec)` 実行後に CompleteStep へ遷移できる
- `executePlan` 後に `getWorkflowState(planId)` を再読込し、failure snapshot を扱える
- `terminal_handoff` を guidance 表示で扱える
- キャンセル時は Step 0 に戻り、状態を対称にクリアできる

## 受入基準

- [x] Step 0（`SkillInfoStep` + LLM説明入力）で LLM / テンプレートのモード選択 UI が表示される
- [x] LLM モード時に ConversationRoundStep をスキップして GenerateStep に進む
- [x] `planSkill` 実行中のローディングと進捗メッセージが表示される
- [x] `executePlan(planId, skillSpec)` 実行後に CompleteStep に遷移する
- [x] `getWorkflowState(planId)` 再読込で failure snapshot を反映する
- [x] `terminal_handoff` guidance が表示される
- [x] キャンセル時に Step 0 へ戻り、計画状態がクリアされる
- [x] テンプレートフローの既存動作が壊れない
- [x] エラー時に再試行できる

## 苦戦箇所

| 苦戦箇所                            | 注意点                                                                  | 回避方針                                                            |
| ----------------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------- |
| executePlan 引数不足（C-1）         | Preload API の `skillSpec` は必須で、ローカル型の optional とズレやすい | Preload API の実シグネチャに合わせる                                |
| generationProgress 未表示（C-2）    | state 更新だけでは UI に出ない                                          | import / state / JSX 表示をセットで実装する                         |
| PlanResult 型の二重定義（C-4）      | コンポーネント内ローカル型で import をシャドウしやすい                  | `agentSlice.ts` の型を Single Source of Truth として使う            |
| snapshot fail の見逃し              | execute 後の workflow snapshot を再読込しないと fail を見逃す           | `getWorkflowState(planId)` で再読込して fail を UI エラーへ反映する |
| terminal_handoff 未分岐             | integrated_api 前提の UI だと実行不能レスポンスを適切表示できない       | `terminal_handoff` 分岐で guidance / command を表示する             |
| Hybrid State Pattern の非対称クリア | local state と store state の片方だけ残ると再オープン時に不整合になる   | cancel / execute / unmount の全経路で対称クリアを行う               |

## 参照

- [`docs/30-workflows/issues/issue-1634.md`](../issues/issue-1634.md)
- [`docs/30-workflows/TASK-SC-07-SKILL-CREATE-WIZARD-LLM-CONNECTION/index.md`](../TASK-SC-07-SKILL-CREATE-WIZARD-LLM-CONNECTION/index.md)
- [`docs/30-workflows/TASK-SC-07-SKILL-CREATE-WIZARD-LLM-CONNECTION/phase-1-requirements.md`](../TASK-SC-07-SKILL-CREATE-WIZARD-LLM-CONNECTION/phase-1-requirements.md)
