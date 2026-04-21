# Phase 4: テストマトリクス

## タスクID: TASK-SC-CREATOR-UPDATE-IMPL-001

| TC ID        | テスト名                                                 | 観点           | 経路                                                     | 期待結果                              | 場所                        |
| ------------ | -------------------------------------------------------- | -------------- | -------------------------------------------------------- | ------------------------------------- | --------------------------- |
| update-TC-01 | 既存SKILL.mdが存在する場合、purposeを読み込む            | 正常系         | readFile → extractPurposeFromSkillMd                     | purpose が frontmatter から抽出される | SkillCreatorService.test.ts |
| update-TC-02 | LLMクライアントがある場合、purpose が LLM で再生成される | 正常系（LLM）  | extractPurposeWithLlm 呼び出し                           | llmClient.generate が呼ばれる         | SkillCreatorService.test.ts |
| update-TC-03 | LLM失敗時は既存purposeにフォールバックする               | フォールバック | LLM失敗 → existingPurpose                                | createSkill() が成功する              | SkillCreatorService.test.ts |
| update-TC-04 | 既存SKILL.mdが存在しない場合はdescriptionを使う          | フォールバック | ENOENT → options.description                             | createSkill() が成功する              | SkillCreatorService.test.ts |
| update-TC-05 | AbortSignalで中断                                        | キャンセル     | signal.aborted                                           | AbortError がスローされる             | SkillCreatorService.test.ts |
| update-TC-06 | progress emit 順序の確認                                 | progress       | loading-skill→analyzing→generating-skill→validating→done | 正しい順序で emit される              | SkillCreatorService.test.ts |

## 既存テストとの関係

| 既存 TC               | カバー済み観点                                  | 本タスクとの関係                                       |
| --------------------- | ----------------------------------------------- | ------------------------------------------------------ |
| SC-020                | update mode で createSkill() が成功する         | 継続利用（regression）                                 |
| SC-021                | improve-prompt mode で createSkill() が成功する | 影響なし                                               |
| purpose.test.ts TC-04 | LLM失敗時のフォールバック                       | create モード限定、update-TC-03 が update モードを補完 |
| cancel.test.ts        | AbortSignal の基本動作                          | update モードの cancel は update-TC-05 で追加          |

## public API 経由テスト方針

- `runUpdateWorkflow()` はプライベートメソッドのため、`createSkill()` 経由でテストする
- モックの `fs.readFile`、`ScriptExecutor.execute`、`ResourceLoader.loadAgent` を制御して各 TC を検証する
- 直接テスト不要（実装の詳細ではなく、observable な振る舞いをテストする）
