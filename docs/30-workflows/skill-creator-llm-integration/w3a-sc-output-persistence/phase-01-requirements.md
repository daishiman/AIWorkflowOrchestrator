# Phase 1: 要件定義

## メタ情報

| 項目     | 値                            |
| -------- | ----------------------------- |
| Phase    | 1                             |
| タスクID | TASK-SC-04-OUTPUT-PERSISTENCE |
| 作成日   | 2026-03-22                    |

## 目的

execute() の現行出力形式（SkillExecutionResponse）を調査し、SkillFileWriter の要件を定義する。LLM が生成したスキルコンテンツをファイルシステムに永続化するための配置先（.claude/skills/）と書き込み仕様を確定する。

## 実行タスク

1. **execute() 現行出力形式調査**
   - `RuntimeSkillCreatorFacade.ts` の execute() メソッドを読み込み、現行の出力形式（SkillExecutionResponse）を把握する
   - execute() が返すコンテンツ（SKILL.md / agents / scripts / references）の構造を確認する
2. **永続化先の確認**
   - `.claude/skills/` ディレクトリの既存構造を確認する
   - 既存スキルのディレクトリ構造（SKILL.md / agents/ / scripts/ / references/ ）を参照する
   - 新規スキルの配置先パスを定義する: `.claude/skills/{skillName}/`
3. **SkillFileWriter 要件定義**
   - `persist(skillName, content)` メソッドの入出力仕様を定義する
   - 既存ファイルの上書き防止要件を定義する（スキル名が既存と衝突する場合の動作）
   - アトミック書き込み要件を定義する（途中で失敗した場合のロールバック）
   - パストラバーサル防止要件を定義する（skillName に `../` が含まれる場合の拒否）
4. **SkillGeneratedContent 型要件定義**
   - execute() が返すコンテンツ構造と SkillGeneratedContent 型の対応を定義する
5. 要件定義ドキュメントを作成する

## 参照資料

- `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`
- `packages/shared/src/types/skillCreator.ts`
- `.claude/skills/`（既存スキルのディレクトリ構造参照）
- `apps/desktop/src/main/services/skill/`（既存 SkillService 等の配置パターン参照）

## 成果物

- `docs/30-workflows/skill-creator-llm-integration/04-phase-01-requirements-output.md`（要件定義書）

## 完了条件

- [ ] execute() の現行出力形式（SkillExecutionResponse の型・フィールド）を文書化した
- [ ] 永続化先ディレクトリ構造（`.claude/skills/{skillName}/`）を確認した
- [ ] SkillFileWriter.persist() の入出力仕様を定義した
- [ ] 既存ファイル上書き防止の要件（エラー返却 vs 上書き許可）を決定した
- [ ] アトミック書き込みの要件を定義した
- [ ] パストラバーサル防止の要件を定義した
- [ ] SkillGeneratedContent 型の全フィールドを定義した
- [ ] AC-2（.claude/skills/配下にファイル永続化）との対応を明記した

## 次のPhase

Phase 2: 設計
