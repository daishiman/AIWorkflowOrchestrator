# TASK-SC-10: agentSlice から generationSlice を分割

## メタ情報

- 検出元: TASK-SC-06-UI-RUNTIME-CONNECTION Phase 10 レビュー
- 優先度: Low
- 関連ファイル:
  - `apps/desktop/src/renderer/store/slices/agentSlice.ts`
  - `apps/desktop/src/renderer/store/__tests__/agentSlice.generation.test.ts`

## 目的

agentSlice.ts から LLM Generation 関連の state とアクションを独立した generationSlice に分割し、単一責務原則（SRP）を回復する。

## 背景

agentSlice.ts は 1200 行を超えるまで肥大化しており、Agent 管理と LLM Generation の2つの責務が混在している。TASK-SC-06-UI-RUNTIME-CONNECTION で追加された LLM Generation state（generationStep, generationProgress, generationError, planResult, executionResult の5フィールド）と、それに対応する6つのアクション（setGenerationStep, setGenerationProgress, setGenerationError, setPlanResult, setExecutionResult, resetGeneration 等）は、Agent のライフサイクルとは独立した関心事であり、分割すべきである。

P31（Zustand Store Hooks 無限ループ）の教訓から、分割時にはセレクタの安定性を維持し、既存コンポーネントへの影響を最小化する必要がある。

## 実行タスク

- [ ] agentSlice.ts 内の LLM Generation 関連フィールドとアクションを特定・一覧化する
- [ ] `generationSlice.ts` を新規作成し、Generation state とアクションを移動する
- [ ] Store 合成部分（createAppStore 等）で generationSlice を統合する
- [ ] 既存の個別セレクタ（useGenerationStep, useGenerationProgress 等）のインポート元を更新する
- [ ] P48 準拠: 派生セレクタに useShallow を適用する
- [ ] 既存テスト `agentSlice.generation.test.ts` を `generationSlice.test.ts` に移行する
- [ ] agentSlice の既存テストが全件 PASS することを確認する（回帰テスト）
- [ ] SkillLifecyclePanel 等の利用側コンポーネントが正常動作することを確認する

## 完了条件

- [ ] agentSlice.ts から Generation 関連コードが除去され、行数が削減されること
- [ ] generationSlice.ts が独立した Slice として動作すること
- [ ] 既存セレクタの公開インターフェースが変更されないこと（後方互換）
- [ ] TypeScript 型チェック PASS
- [ ] 全テスト PASS（agentSlice + generationSlice）
- [ ] P31/P48 の再発がないこと

## 苦戦箇所（TASK-SC-06 実装知見）

| 苦戦箇所                            | 問題                                                                                                                                                                             | 解決策                                                                                                                       |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| 個別セレクタの安定性（P31）         | agentSlice に追加した 11 セレクタは `useAppStore((state) => state.xxx)` パターンで安定参照を実現しているが、分割時にセレクタの import パスが変わるとコンポーネント側の修正が必要 | store/index.ts のセレクタ公開インターフェースを変更せず、内部実装のみ generationSlice に委譲する。re-export で後方互換を維持 |
| clearGenerationState の一括リセット | 5 フィールドを一括リセットする `clearGenerationState` は agentSlice 内に定義されている。分割後は generationSlice 内に移動する必要がある                                          | generationSlice に `clearGenerationState` を含め、agentSlice からは参照しない                                                |
| テストファイルの移行                | `agentSlice.generation.test.ts` のモックが agentSlice の初期状態全体に依存している場合、分割時にモック構造の変更が必要                                                           | テストのモック構成を generationSlice の初期状態のみに限定し、agentSlice との結合を解消する                                   |

## 参照

- TASK-SC-06-UI-RUNTIME-CONNECTION Phase 10 レビュー（U-2）
- P31: Zustand Store Hooks 無限ループ
- P48: useShallow 未適用による派生セレクタ無限ループ
- 03-state-management.md: Zustand 設計原則
