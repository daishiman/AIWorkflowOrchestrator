# Phase 5: 実装

## メタ情報

| 項目   | 値                           |
| ------ | ---------------------------- |
| Phase  | 5                            |
| 機能名 | multi-select-user-input-kind |
| 作成日 | 2026-03-29                   |

## 目的

型定義、validation、renderer host の 3 層へ `multi_select` を実装し、DTO と UI の重複導入を避ける。

## 実行タスク

- shared type に `multi_select` と `selectedOptionIds` を実装する
- engine に `multi_select` validation を実装する
- renderer に checkbox host と submit 分岐を実装する
- テストを green にする

## 参照資料

| 資料名         | パス                                                                   | 説明            |
| -------------- | ---------------------------------------------------------------------- | --------------- |
| Phase 2 設計   | `phase-2-design.md`                                                    | 設計正本        |
| Phase 4 テスト | `phase-4-test-creation.md`                                             | TDD 基準        |
| 型定義         | `packages/shared/src/types/skillCreator.ts`                            | shared contract |
| engine         | `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts` | validation      |
| renderer       | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`   | question host   |

## 実行手順

### 実装順

1. `packages/shared/src/types/skillCreator.ts` を更新する
2. `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts` を更新する
3. `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx` を更新する
4. engine / renderer テストを green にする

## 統合テスト連携

- Phase 6 で edge case を足す前提として、Phase 5 は happy path を green にする
- Phase 9 で typecheck と回帰テストをまとめて再実行する

## 成果物

| 成果物                 | パス                                        | 説明                 |
| ---------------------- | ------------------------------------------- | -------------------- |
| 実装仕様               | `phase-5-implementation.md`                 | 実装順と対象ファイル |
| implementation summary | `outputs/phase-5/implementation-summary.md` | 実装内容の要約       |

## 完了条件

- [ ] shared type が更新されている
- [ ] engine validation が実装されている
- [ ] renderer host が実装されている
- [ ] happy path テストが green である
- [ ] **本Phase内の全タスクを100%実行完了**
