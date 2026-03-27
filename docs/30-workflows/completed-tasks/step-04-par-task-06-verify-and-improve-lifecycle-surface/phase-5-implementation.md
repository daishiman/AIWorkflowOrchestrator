# Phase 5: 実装

## メタ情報

| 項目   | 値                                   |
| ------ | ------------------------------------ |
| Phase  | 5                                    |
| 機能名 | verify-and-improve-lifecycle-surface |
| 作成日 | 2026-03-26                           |

## 目的

Task06 の設計を main / preload / renderer / shared type の 4 面へ実装し、detail surface と improve 閉ループを runtime へ接続する。

## 実行タスク

- shared type に detail DTO を追加する
- main IPC と facade の improve / apply / state bridge を実装する
- renderer panel に verify detail / provenance / re-entry UI を実装する
- Task05 と衝突しない wiring に調整する

## 参照資料

| 資料名                | パス                                               | 説明             |
| --------------------- | -------------------------------------------------- | ---------------- |
| Phase 4 test creation | `phase-4-test-creation.md`                         | 実装前提         |
| Phase 2 設計          | `phase-2-design.md`                                | 実装方針         |
| surface matrix        | `outputs/phase-2/verify-improve-surface-matrix.md` | concern 別担当   |
| Phase 4 test matrix   | `outputs/phase-4/test-matrix.md`                   | 実装後の検証観点 |

## 実行手順

### ステップ1: shared / main を実装する

- `packages/shared/src/types/skillCreator.ts`
- `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts`
- `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`
- `apps/desktop/src/main/ipc/creatorHandlers.ts`

### ステップ2: preload / renderer を実装する

- `apps/desktop/src/preload/skill-creator-api.ts`
- `apps/desktop/src/renderer/store/slices/agentSlice.ts`
- `apps/desktop/src/renderer/components/skill/ImprovementProposalPanel.tsx`

### ステップ3: non-goal を守る

- create 主導線統合は Task05 に残す
- handoff governance は Task07 に残す
- session persistence は Task08 に残す

## 統合テスト連携

- `outputs/phase-4/test-matrix.md` の ID を実装差分へ対応付ける
- Phase 6 で edge case を拡張できるよう、main / preload / renderer の test entry を分けて残す

## 成果物

| 成果物                 | パス                                        | 説明               |
| ---------------------- | ------------------------------------------- | ------------------ |
| 実装仕様               | `phase-5-implementation.md`                 | Phase 5 の対象整理 |
| implementation summary | `outputs/phase-5/implementation-summary.md` | 実装後の差分要約   |

## 完了条件

- [ ] main / preload / renderer / shared type の変更面が列挙されている
- [ ] Task05 / Task07 / Task08 の非対象が維持されている
- [ ] **本Phase内の全タスクを100%実行完了**
