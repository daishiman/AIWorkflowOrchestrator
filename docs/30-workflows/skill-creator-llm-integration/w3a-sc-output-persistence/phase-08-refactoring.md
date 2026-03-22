# Phase 8: リファクタリング

## メタ情報

| 項目     | 値                            |
| -------- | ----------------------------- |
| Phase    | 8                             |
| タスクID | TASK-SC-04-OUTPUT-PERSISTENCE |
| 作成日   | 2026-03-22                    |

## 目的

Phase 5 で実装した SkillFileWriter のコード品質を改善する。ファイル書き込みロジックの共通化・マジックストリング排除・型安全性向上を行い、テストが全て Green を維持することを確認する。

## 実行タスク

1. **ファイル書き込みロジックの共通化**
   - SKILL.md / agents / scripts / references の書き込みコードに重複がある場合、共通の `writeFile(filePath: string, content: string): Promise<void>` ヘルパー関数に抽出する
   - ディレクトリ作成ロジックを `ensureDirectory(dirPath: string): Promise<void>` として抽出する
2. **マジックストリング排除**
   - サブディレクトリ名（`agents` / `scripts` / `references`）・ファイル名（`SKILL.md`）を定数に置き換える
   - `SKILL_FILE_CONSTANTS` オブジェクトまたは定数ファイルに集約する
3. **型安全性向上**
   - `SkillGeneratedContent` の各フィールドに対して `Array.isArray()` / `typeof` ガードを実施する
   - P19 対策: `as string` 等の unsafe キャストを除去する
4. **ロールバックロジックの明確化**
   - ロールバック対象ファイルリストを明確に管理する
   - ロールバック関数 `rollback(writtenFiles: string[]): Promise<void>` を独立関数として抽出する
5. リファクタリング後に全テストが Green であることを確認する

## 参照資料

- `apps/desktop/src/main/services/skill/SkillFileWriter.ts`（実装済み）
- `.claude/rules/02-code-quality.md`（TypeScript 型安全ルール）
- `.claude/rules/06-known-pitfalls.md`（P19）

## 成果物

- `apps/desktop/src/main/services/skill/SkillFileWriter.ts`（リファクタリング済み）
- `apps/desktop/src/main/services/skill/skillFileConstants.ts`（定数ファイル、必要に応じて）

## 完了条件

- [ ] ファイル書き込みロジックが共通ヘルパー関数に抽出されている
- [ ] マジックストリング（サブディレクトリ名・ファイル名）が定数に置き換えられている
- [ ] unsafe キャストが除去されている
- [ ] ロールバック関数が独立した関数として抽出されている
- [ ] リファクタリング後も全テストが Green を維持している

## 次のPhase

Phase 9: 品質検証
