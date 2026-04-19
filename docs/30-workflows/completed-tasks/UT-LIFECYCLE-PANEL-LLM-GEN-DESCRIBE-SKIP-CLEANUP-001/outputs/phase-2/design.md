# Phase 2 成果物: 設計書

## 調査結果サマリー

### skill-lifecycle-prepare-button testid の存在確認

`grep -n "skill-lifecycle-prepare-button" SkillLifecyclePanel.tsx` → **0件（存在しない）**

これにより、このtestidを参照する U-1/U-2/U-4/U-6/U-8b/U-10/U-11/U-12/U-18b/U-19b/U-21 は全て削除対象となる。

### planSkill / detectMode の本体での使用状況

`SkillLifecyclePanel.tsx` には `detectMode?:` と `planSkill?:` が型定義（IPC API型の optional プロパティ）としてのみ存在し、実処理では呼び出されていない。削除設計の前提が正しいことを確認。

## 削除設計（11件）

| ID    | describe 名                                                  | 削除理由                                       | 削除対象行（概算） |
| ----- | ------------------------------------------------------------ | ---------------------------------------------- | ------------------ |
| U-1   | detectMode → planSkill sequential call                       | planSkill/detectMode廃止 + prepare-button 不在 | 394-415            |
| U-2   | backward compatibility - detectMode='create' skips planSkill | detectMode廃止 + prepare-button 不在           | 417-434            |
| U-4   | isGenerating guard prevents double invocation (R-1)          | prepare-button 不在                            | 455-472            |
| U-6   | terminal_handoff triggers handoff guidance display           | planSkill廃止 + prepare-button 不在            | 494-520            |
| U-8b  | canonical binding drift prevention                           | planSkill廃止 + prepare-button 不在            | 1425-1459          |
| U-10  | planSkill failure propagates error                           | planSkill廃止 + prepare-button 不在            | 918-963            |
| U-11  | empty input validation                                       | detectMode廃止 + prepare-button 不在           | 965-979            |
| U-12  | planSkill API unavailable graceful degradation               | planSkill廃止 + prepare-button 不在            | 981-1002           |
| U-18b | cancel then re-plan replaces approved snapshot               | planSkill廃止 + prepare-button 不在            | 1753-1789          |
| U-19b | multiple textarea edits do not affect approved snapshot      | planSkill廃止 + prepare-button 不在            | 1791-1814          |
| U-21  | approved snapshot behavior after execute failure             | planSkill廃止 + prepare-button 不在            | 1838-1887          |

## 昇格設計（1件）

| ID    | describe 名                                   | 修正内容                       | 根拠                                                                                                          |
| ----- | --------------------------------------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------- |
| U-20b | cancel clears approved snapshot symmetrically | `describe.skip(` → `describe(` | キャンセルボタンは現行UIに存在、clearGenerationState は現行storeに存在、planSkill/prepare-button に依存しない |

## 旧 API モック宣言の整理設計

| 対象                                                     | 行      | 処置 |
| -------------------------------------------------------- | ------- | ---- |
| `const mockDetectMode = vi.fn();`                        | 195     | 削除 |
| `const mockPlanSkill = vi.fn();`                         | 196     | 削除 |
| `detectMode: mockDetectMode,` in beforeEach              | 268     | 削除 |
| `planSkill: mockPlanSkill,` in beforeEach                | 269     | 削除 |
| `mockDetectMode.mockResolvedValue(...)` in beforeEach    | 281     | 削除 |
| `mockPlanSkill.mockResolvedValue(...)` 4行 in beforeEach | 282-290 | 削除 |

`mockExecutePlan` はアクティブなテスト（U-8, U-13, U-14 等）で使用されているため **維持**。

## snapshot 系4件の処置方針

| ID    | 処置     | 根拠                                              |
| ----- | -------- | ------------------------------------------------- |
| U-18b | 削除     | skill-lifecycle-prepare-button + planSkill に依存 |
| U-19b | 削除     | skill-lifecycle-prepare-button + planSkill に依存 |
| U-20b | **昇格** | 依存なし、clearGenerationState の検証として有効   |
| U-21  | 削除     | skill-lifecycle-prepare-button + planSkill に依存 |

## 変更ファイル一覧

| ファイル                                                                                           | 変更内容                                                                  |
| -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx` | 11件の describe.skip 削除、1件昇格、モック宣言2件削除、beforeEach 6行削除 |

プロダクションコード（`SkillLifecyclePanel.tsx`）は変更しない。

## 検証マトリクス

| テスト対象                   | コマンド                                                                                                                                             |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| 対象ファイル単体             | `pnpm --filter @repo/desktop exec vitest run src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx --reporter=verbose` |
| SkillLifecyclePanel 関連全体 | `pnpm --filter @repo/desktop exec vitest run src/renderer/components/skill/__tests__/SkillLifecyclePanel`                                            |
| 型チェック                   | `pnpm --filter @repo/desktop typecheck`                                                                                                              |
| lint                         | `pnpm --filter @repo/desktop lint`                                                                                                                   |
