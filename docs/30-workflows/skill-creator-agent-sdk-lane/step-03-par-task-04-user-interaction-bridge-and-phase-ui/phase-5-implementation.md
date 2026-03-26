# Phase 5: 実装

## メタ情報

| 項目   | 値                                   |
| ------ | ------------------------------------ |
| Phase  | 5                                    |
| 機能名 | user-interaction-bridge-and-phase-ui |
| 作成日 | 2026-03-26                           |

## 目的

bridge API、shared types、store cache、phase UI host の実装対象を整理し、Task04 単独で閉じる変更と downstream へ渡す変更を分ける。

## 想定変更ポイント

- `packages/shared/src/types/skillCreator.ts` または workflow state 周辺の shared types
- `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts`
- `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`
- `apps/desktop/src/main/ipc/creatorHandlers.ts`
- `apps/desktop/src/preload/channels.ts`
- `apps/desktop/src/preload/skill-creator-api.ts`
- `apps/desktop/src/renderer/store/slices/agentSlice.ts`
- `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`
- `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`

## 実行タスク

- shared types と engine snapshot shape を整理する
- Main IPC / preload bridge を配線する
- store cache と renderer phase block を実装対象へ落とす
- execute handoff visible 化の host を確定する

## 参照資料

| 資料名          | パス                                                                                        | 説明                             |
| --------------- | ------------------------------------------------------------------------------------------- | -------------------------------- |
| Phase 2 設計    | `phase-2-design.md`                                                                         | bridge / store / UI 方針         |
| test matrix     | `outputs/phase-4/test-matrix.md`                                                            | 実装後の検証観点                 |
| unassigned task | `../../unassigned-task/ut-sc-02-006-skill-lifecycle-panel-execute-handoff-ui-connection.md` | handoff visible 化の current gap |

## 実装方針

1. shared contract を先に定義し、Main / Preload / Renderer の順で外側へ広げる。
2. `SkillCreatorWorkflowEngine` の canonical snapshot を拡張する場合も owner は engine のまま維持する。
3. `SkillLifecyclePanel` は phase host と handoff host を担い、form body の詳細再利用は必要最小限に留める。
4. execute handoff は `TerminalHandoffCard` 再利用を優先し、console-only TODO を残さない。

## 実装しないこと

- create 入口の最終一本化
- verify / improve result surface の完成
- approval / disclosure wording の最終化
- session persistence / invalidation

## 実装完了の判断

- question kind と UI input 形式の対応表をコードへ落とせる
- Renderer が phase を owner せずに snapshot 表示できる
- Task05 に入口設計を渡しつつ、interaction bridge 自体は独立責務に保てる

## 成果物

| 成果物   | パス                        | 説明             |
| -------- | --------------------------- | ---------------- |
| 実装計画 | `phase-5-implementation.md` | 実装順序と変更点 |

## 統合テスト連携

- Phase 4 の test matrix を shared types、IPC、preload、renderer の順で消化する
- handoff visible 化は renderer regression を最優先に確認する
- store cache と local draft state の分離を unit test 観点へ落とす

## 完了条件

- [ ] bridge / UI / state の実装対象が整理されている
- [ ] 変更順序と downstream への委譲境界が明記されている
- [ ] execute handoff visible 化が実装対象に含まれている
- [ ] **本Phase内の全タスクを100%実行完了**
