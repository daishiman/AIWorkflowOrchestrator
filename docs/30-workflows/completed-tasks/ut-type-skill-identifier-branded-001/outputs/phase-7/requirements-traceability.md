# Phase 7 要件追跡表

| 要件ID | 要件                                 | テスト/証跡                                                              | 状態                        |
| ------ | ------------------------------------ | ------------------------------------------------------------------------ | --------------------------- |
| FR-1   | `SkillId`/`SkillName` 定義           | `packages/shared/src/types/skill.ts`, `skill-identifier-branded.test.ts` | 満たす                      |
| FR-2   | `Skill.id`/`Skill.name` 型分離       | `Skill` 型定義、`skill-identifier-branded.typecheck.ts`                  | 満たす                      |
| FR-3   | 変換関数提供                         | `toSkillId`/`toSkillName` 単体テスト                                     | 満たす                      |
| FR-4   | `selectedIds -> skillNames` 境界明示 | `SkillImportDialog.test.tsx`（onImport/ID判定）                          | 満たす                      |
| FR-5   | IPC `skill:import` name文脈          | `skillHandlers.test.ts`（import/remove validation）                      | 満たす                      |
| NFR-2  | 型チェックとテストGreen              | `green-test-log.txt`, Phase 6ログ                                        | 満たす（build環境課題除く） |
| NFR-3  | sender/trim検証維持                  | `skillHandlers.test.ts`                                                  | 満たす                      |

## カバレッジ観点

- 仕様追跡は満たすが、グローバルカバレッジ閾値は未達。
