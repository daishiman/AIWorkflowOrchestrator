# Phase 2: 設計

## メタ情報

| 項目   | 値                                        |
| ------ | ----------------------------------------- |
| Phase  | 2                                         |
| 機能名 | step-11-par-task-plan-execution-hardening |
| 作成日 | 2026-03-31                                |

## 目的

Phase 1 で固定した acceptance criteria を、最小の複雑性で実装できるように設計へ落とす。
P0-07 は `PLAN_RESOURCE_REQUESTS` の単一 source of truth、U2 は request snapshot の固定を維持したまま進める。

## 実行タスク

- TASK-P0-07 の agent 名導出を `RuntimeSkillCreatorFacade.plan()` の中で設計する
- TASK-SDK-04-U2 の request snapshot 固定を `SkillLifecyclePanel.tsx` で設計する
- 2 タスクが並列実行可能か、共有ファイルの有無で判定する

## 参照資料

| 資料名                     | パス                                                                                                           | 参照理由                |
| -------------------------- | -------------------------------------------------------------------------------------------------------------- | ----------------------- |
| runtime facade             | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`                                          | P0-07 の実装対象        |
| prompt constants           | `apps/desktop/src/main/services/runtime/planPromptConstants.ts`                                                | `AGENT_NAMES` 削除対象  |
| renderer panel             | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`                                           | U2 の state owner       |
| runtime plan tests         | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.plan.test.ts`                      | P0-07 の unit test      |
| renderer llm tests         | `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx`             | U2 の regression test   |
| docs-only parallel pattern | `docs/30-workflows/skill-creator-agent-sdk-lane/step-11-par-task-docs-sdk-spec-sync/phase-5-implementation.md` | SubAgent 分担の書式参考 |

## 設計概要

### TASK-P0-07: source of truth 統一

- `PLAN_PROMPT_CONSTANTS` から `AGENT_NAMES` を削除する
- `RuntimeSkillCreatorFacade.plan()` の fallback path は `PLAN_RESOURCE_REQUESTS` をそのまま参照する
- agent 名は `request.kind === "agent"` のエントリから `request.id` を使って導出する
- 余計な追加レイヤーや shared type の追加は行わない

### TASK-SDK-04-U2: request snapshot 固定

- `SkillLifecyclePanel.tsx` は `handleGeneratePlan` の開始時に request を trim した snapshot を作る
- `approvedSkillSpec` はその snapshot を保存し、textarea の live draft とは切り離す
- `handleExecutePlan` は `approvedSkillSpec` のみを executePlan に渡す
- canonical JSON へ変換する層は追加しない

### 更新順

1. P0-07 の source of truth を先に固定する
2. U2 の snapshot semantics をその後で固定する
3. それぞれ独立ファイルなので、Phase 5 以降は並列実装できる

## 設計詳細

### TASK-P0-07

| 観点                 | 設計                                                                                                 |
| -------------------- | ---------------------------------------------------------------------------------------------------- |
| 単一 source of truth | `PLAN_RESOURCE_REQUESTS`                                                                             |
| 変更箇所             | `planPromptConstants.ts` / `RuntimeSkillCreatorFacade.ts` / `RuntimeSkillCreatorFacade.plan.test.ts` |
| 変更しないもの       | shared type / IPC contract                                                                           |
| 期待結果             | `AGENT_NAMES` の重複が消え、agent 名変更が 1 箇所で済む                                              |

### TASK-SDK-04-U2

| 観点           | 設計                                                                      |
| -------------- | ------------------------------------------------------------------------- |
| 状態の役割     | `approvedSkillSpec` は plan 承認時点の snapshot                           |
| 変更箇所       | `SkillLifecyclePanel.tsx` / `SkillLifecyclePanel.llm-generation.test.tsx` |
| 変更しないもの | `skillCreatorAPI.executePlan` のシグネチャ                                |
| 期待結果       | textarea 編集が execute payload に影響しない                              |

## 並列実行設計

| Lane | 担当                                                                     | 並列可否   | 注意点                                           |
| ---- | ------------------------------------------------------------------------ | ---------- | ------------------------------------------------ |
| A    | `RuntimeSkillCreatorFacade.ts` / `planPromptConstants.ts` / runtime test | B と並列可 | `PLAN_RESOURCE_REQUESTS` を shared source にする |
| B    | `SkillLifecyclePanel.tsx` / renderer test                                | A と並列可 | `approvedSkillSpec` の semantics を崩さない      |

## 成果物

| 成果物   | パス                                | 説明                      |
| -------- | ----------------------------------- | ------------------------- |
| 設計書   | `phase-2-design.md`                 | 実装方針の固定            |
| 設計メモ | `outputs/phase-2/design-summary.md` | Lane 分担と依存境界の記録 |

## 完了条件

- [ ] P0-07 の source of truth が `PLAN_RESOURCE_REQUESTS` に固定されている
- [ ] U2 の snapshot semantics が current code と整合している
- [ ] 2 タスクの並列可否が明記されている
- [ ] Phase 3 で判断できるだけの設計粒度になっている

## サブタスク管理

1. P0-07 の source of truth 設計
2. U2 の snapshot semantics 設計
3. 並列化可否の確認
4. テストファイル割当の固定

## タスク100%実行確認【必須】

- [ ] 本 Phase のタスクを 100% 実行完了
- [ ] 共有ファイルと独立ファイルの境界が明記されている
- [ ] Phase 5 でそのまま実装へ落とせる
