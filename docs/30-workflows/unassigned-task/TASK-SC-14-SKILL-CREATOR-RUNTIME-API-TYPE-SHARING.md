# TASK-SC-14: SkillCreatorRuntimeApi 型の共有パッケージ移行

## メタ情報

- 検出元: TASK-SC-07-SKILL-CREATE-WIZARD-LLM-CONNECTION レビュー（P6: 型の二重管理）
- 優先度: Low
- GitHub Issue: #1599
- 関連ファイル:
  - `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx` (ローカル型定義)
  - `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx` (同様のローカル型)
  - `packages/shared/src/types/` (移行先)

## 目的

`SkillCreatorRuntimeApi` インターフェースをコンポーネントローカルの型定義から `packages/shared` に移行し、Single Source of Truth を確立する。

## 背景

TASK-SC-07 で SkillCreateWizard に LLM 接続を追加した際、`SkillCreatorRuntimeApi` 型を SkillCreateWizard.tsx 内でローカルに定義した。同様の型が SkillLifecyclePanel.tsx にも存在し、以下の問題がある:

- **二重定義**: 2つのコンポーネントで同じ API 型を個別に定義しており、不整合のリスク
- **C-1 教訓**: TASK-SC-06 で発生したローカル型と Preload API のシグネチャ不整合（optional vs required）の再発防止
- **PlanResult 型の教訓（C-4）**: 型の Single Source of Truth を守ることで、import シャドウイングを防ぐ

## 実行タスク

- [ ] SkillCreateWizard.tsx と SkillLifecyclePanel.tsx のローカル型定義を比較・統合する
- [ ] `packages/shared/src/types/skill-creator-api.ts` に統一型を定義する
- [ ] Preload API のシグネチャと完全一致することを確認する
- [ ] 両コンポーネントを shared パッケージからの import に切り替える
- [ ] `getSkillCreatorApi()` ヘルパーを共通化する（必要に応じて）
- [ ] TypeScript 型チェック PASS を確認する

## 完了条件

- [ ] `SkillCreatorRuntimeApi` が `packages/shared` で Single Source of Truth として定義されること
- [ ] コンポーネント内のローカル型定義が除去されること
- [ ] Preload API のシグネチャと型が完全一致すること
- [ ] TypeScript 型チェック PASS
- [ ] 全テスト PASS

## 苦戦箇所（TASK-SC-07 実装知見）

| 苦戦箇所                       | 問題                                                                             | 解決策                                                                 |
| ------------------------------ | -------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| PlanResult 型の二重定義（C-4） | agentSlice の export と コンポーネント内の type が共存し import がシャドウイング | 型は Single Source of Truth から import する。ローカル型定義を作らない |
| executePlan 引数不足（C-1）    | ローカル型では optional だが Preload API は required。型不整合でランタイムエラー | shared パッケージに統一型を置き、Preload API と同期する                |

## 参照

- TASK-SC-07 苦戦箇所 C-1, C-4
- TASK-SC-06-UI-RUNTIME-CONNECTION 実装ガイド
- `packages/shared/src/types/` 既存型定義
