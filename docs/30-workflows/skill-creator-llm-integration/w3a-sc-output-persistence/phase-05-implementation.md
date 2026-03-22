# Phase 5: 実装

## メタ情報

| 項目     | 値                            |
| -------- | ----------------------------- |
| Phase    | 5                             |
| タスクID | TASK-SC-04-OUTPUT-PERSISTENCE |
| 作成日   | 2026-03-22                    |

## 目的

Phase 2 設計・Phase 4 テストに基づき、SkillFileWriter を新規作成し、SkillGeneratedContent 型を追加し、RuntimeSkillCreatorFacade.execute() を改修してファイル永続化フローを統合する。

## 実行タスク

1. **SkillGeneratedContent 型定義**
   - `packages/shared/src/types/skillCreator.ts` に以下を追加する:

   ```typescript
   interface SkillGeneratedContent {
     skillMd: string;
     agents: Array<{ name: string; content: string }>;
     scripts: Array<{ name: string; content: string }>;
     references: Array<{ name: string; content: string }>;
   }
   ```

   - P32 対策: `apps/desktop/src/preload/types.ts` にも必要な型を追加する

2. **SkillFileWriter 新規作成**
   - `apps/desktop/src/main/services/skill/SkillFileWriter.ts` を作成する
   - `validateSkillName()`: P42 準拠3段バリデーション + パストラバーサル防止（`path.resolve()` でサニタイズ後 basePath プレフィックス確認）
   - `checkExistingSkill()`: 同名スキルが存在する場合はエラー返却
   - `writeFiles()`: SKILL.md → agents/ → scripts/ → references/ の順でファイルを書き込む（途中失敗時は部分ファイルを削除してロールバック）
   - `persist()`: validateSkillName → checkExistingSkill → mkdirSync → writeFiles の順で実行する
3. **RuntimeSkillCreatorFacade.execute() 改修**
   - execute() の完了後に SkillFileWriter.persist() を呼び出す処理を追加する
   - ストリーム完了前の部分書き込みを防止する（一括書き込み方式を維持する）
   - 書き込みエラーは SkillExecutionResponse のエラーとして返す
4. **DI 配線**
   - SkillFileWriter を RuntimeSkillCreatorFacade のコンストラクタに DI する（Setter Injection でも可: P34 対策）
   - 既存のファクトリを更新する

## 参照資料

- `docs/30-workflows/skill-creator-llm-integration/04-phase-02-design.md`
- `docs/30-workflows/skill-creator-llm-integration/04-phase-04-test-creation.md`
- `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`
- `packages/shared/src/types/skillCreator.ts`
- `.claude/rules/06-known-pitfalls.md`（P32, P34, P42）

## 成果物

- `apps/desktop/src/main/services/skill/SkillFileWriter.ts`（新規作成）
- `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`（execute() 改修）
- `packages/shared/src/types/skillCreator.ts`（SkillGeneratedContent 型追加）

## 完了条件

- [ ] SkillGeneratedContent 型が shared と desktop の両方で利用可能である（P32 対策）
- [ ] SkillFileWriter.persist() が実装されている
- [ ] validateSkillName() が P42 準拠3段バリデーション + パストラバーサル防止を実装している
- [ ] 既存ファイル上書きガードが実装されている
- [ ] ロールバック処理（途中失敗時の部分ファイル削除）が実装されている
- [ ] RuntimeSkillCreatorFacade.execute() が SkillFileWriter を呼び出している
- [ ] Phase 4 で作成した全テストが Green になっている

## 次のPhase

Phase 6: テスト拡充
