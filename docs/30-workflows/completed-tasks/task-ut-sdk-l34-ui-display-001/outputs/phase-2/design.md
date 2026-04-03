# Phase 2 Design

## Overview

verify detail の checks を、Layer ごとの折りたたみセクションに整理する。

## Component Plan

| 項目        | 方針                                                       |
| ----------- | ---------------------------------------------------------- |
| Grouping    | `checksByLayer` を `useMemo` で生成する                    |
| Accordion   | Layer ごとの `expandedLayers` を local state で保持する    |
| Badge       | severity 集計を Layer ヘッダーに表示する                   |
| Icon        | `info` / `warning` / `error` を `✓` / `⚠` / `✗` に変換する |
| Empty Layer | `checks.length === 0` の Layer は非表示にする              |

## State Flow

1. `currentPlanId` が入る。
2. `loadVerifyDetail` が `getVerifyDetail(planId)` を呼ぶ。
3. `verifyDetail.checks` を Layer 別に分類する。
4. Layer セクションを描画する。
5. `reverifyWorkflow` 後は `loadVerifyDetail` を再実行する。

## File Responsibilities

| ファイル                                                                                           | 役割                           |
| -------------------------------------------------------------------------------------------------- | ------------------------------ |
| `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`                               | verify detail UI の実装        |
| `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.test.tsx`                | Layer 別表示と折りたたみの検証 |
| `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx` | fixture 互換性の検証           |

## Guardrails

- `apps/backend/` は変更しない
- `packages/shared/` は変更しない
- `VerifyLayerGroup` は必要なら同一ファイル内の local component とする
- 既存の `data-testid` は極力維持する

## Decision

Layer 別グルーピングは renderer 内で完結させ、shared contract に手を入れない。
