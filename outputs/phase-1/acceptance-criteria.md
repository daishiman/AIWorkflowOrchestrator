# TASK-SW-STREAM-001 受け入れ基準

## メタ情報

| 項目     | 内容               |
| -------- | ------------------ |
| タスクID | TASK-SW-STREAM-001 |
| 作成日   | 2026-04-16         |

## 受け入れ基準一覧

| ID   | 受け入れ基準                                                                                          | 検証方法                                                              |
| ---- | ----------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| AC-1 | `createSkill()` が第2引数 `onProgress?: (progress: SkillCreatorProgressData) => void` を受け取ること  | `pnpm --filter @repo/desktop typecheck` が 0 error                    |
| AC-2 | `runCreateWorkflow` 開始直前に `onProgress` が `{ phase: "planning", percentage: 10 }` で呼ばれること | テスト: `onProgress` モックが `planning` フェーズで呼ばれることを検証 |
| AC-3 | SKILL.md 生成・エージェント定義生成・検証・完了の各段階で `onProgress` が適切な値で呼ばれること       | テスト: 4段階分のコールバック呼び出しをモックで検証                   |
| AC-4 | `onProgress` が未指定（`undefined`）の場合でも `createSkill` が正常動作すること                       | テスト: `onProgress` を渡さない既存呼び出しパターンがエラーなく動作   |
| AC-5 | 既存のテスト（`skillCreatorHandlers.validation.test.ts` 等）が型エラーなしで通過すること              | `pnpm --filter @repo/desktop exec vitest run` が PASS                 |
