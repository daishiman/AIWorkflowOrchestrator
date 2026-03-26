# [#1591] [TASK-SC-10] agentSlice から generationSlice を分割

## メタ情報

```yaml
issue_number: 1591
title: [TASK-SC-10] agentSlice から generationSlice を分割
state: OPEN
priority: 低
scale: -
category: リファクタリング
status: 未実施
created_date: 2026-03-24
updated_date: 2026-03-24
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/1591
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 低     |
| 規模       | -      |
| ステータス | 未実施 |

---

## 概要

agentSlice.ts から LLM Generation 関連の state とアクションを独立した generationSlice に分割し、単一責務原則（SRP）を回復する。

## 背景

agentSlice.ts は 1200 行を超えるまで肥大化しており、Agent 管理と LLM Generation の2つの責務が混在している。TASK-SC-06 で追加された LLM Generation state（generationStep, generationProgress, generationError, planResult, executionResult の5フィールド）と6つのアクションは、Agent のライフサイクルとは独立した関心事であり、分割すべきである。

P31（Zustand Store Hooks 無限ループ）の教訓から、分割時にはセレクタの安定性を維持し、既存コンポーネントへの影響を最小化する必要がある。

## 変更対象ファイル

- `apps/desktop/src/renderer/store/slices/agentSlice.ts`
- `apps/desktop/src/renderer/store/__tests__/agentSlice.generation.test.ts`

## 受入基準

- [ ] agentSlice.ts から Generation 関連コードが除去され、行数が削減されること
- [ ] generationSlice.ts が独立した Slice として動作すること
- [ ] 既存セレクタの公開インターフェースが変更されないこと（後方互換）
- [ ] TypeScript 型チェック PASS
- [ ] 全テスト PASS（agentSlice + generationSlice）
- [ ] P31/P48 の再発がないこと

## 苦戦箇所（TASK-SC-06 実装知見）

| 苦戦箇所                            | 問題                                                                                 | 解決策                                                                                                           |
| ----------------------------------- | ------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------- |
| 個別セレクタの安定性（P31）         | 分割時にセレクタの import パスが変わるとコンポーネント側の修正が必要                 | store/index.ts の公開インターフェースを変更せず、内部実装のみ generationSlice に委譲。re-export で後方互換を維持 |
| clearGenerationState の一括リセット | 5フィールドを一括リセットする clearGenerationState は agentSlice 内に定義されている  | generationSlice に clearGenerationState を含め、agentSlice からは参照しない                                      |
| テストファイルの移行                | モックが agentSlice の初期状態全体に依存している場合、分割時にモック構造の変更が必要 | テストのモック構成を generationSlice の初期状態のみに限定し、agentSlice との結合を解消                           |

## 参照

- TASK-SC-06-UI-RUNTIME-CONNECTION Phase 10 レビュー（U-2）
- P31: Zustand Store Hooks 無限ループ
- P48: useShallow 未適用による派生セレクタ無限ループ
- 指示書: `docs/30-workflows/unassigned-task/TASK-SC-10-AGENT-SLICE-GENERATION-SPLIT.md`
