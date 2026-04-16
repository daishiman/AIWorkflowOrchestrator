# TASK-SC-PLAN-CONNECT-GENERATE-SKILL-MD-001: runCreateWorkflow 戻り値を generateSkillMd へ接続

## メタ情報

```yaml
issue_number: 2180
```

## メタ情報

| 項目     | 値                                                                                                                             |
| -------- | ------------------------------------------------------------------------------------------------------------------------------ |
| タスクID | TASK-SC-PLAN-CONNECT-GENERATE-SKILL-MD-001                                                                                     |
| 検出元   | TASK-SC-IMP-CREATE-WORKFLOW-001 Phase 12 未タスク検出                                                                          |
| 優先度   | HIGH                                                                                                                           |
| 影響     | SkillCreatorService の runCreateWorkflow が structurePlan を生成しても generate_skill_md.js に渡せず、スキルMD生成が完結しない |
| 検出日   | 2026-04-15                                                                                                                     |
| 依存     | TASK-SC-FIX-GENERATE-SKILL-MD-001 の完了                                                                                       |

## 概要

`runCreateWorkflow` が返す `StructurePlanJson` を `generateSkillMd(skillDir, structurePlan)` の引数として接続する実装。現在は戻り値が呼び出し側で使用されておらず、生成されたプランがスキルMD生成スクリプトに渡されていない。

## 現状

```typescript
// apps/desktop/src/main/services/skill/SkillCreatorService.ts
// runCreateWorkflow は Promise<StructurePlanJson | null> を返すが、
// 呼び出し側でその戻り値が捨てられている
void this.runCreateWorkflow(skillDir, request);
// generate_skill_md.js は --plan / --output オプションで structurePlan を受け取る設計だが、
// その接続が未実装のためスキルMD生成が完結しない
```

## 苦戦箇所

- `generate_skill_md.js` の `--plan` / `--output` オプション受け入れが TASK-SC-FIX-GENERATE-SKILL-MD-001 で先に実装される必要がある（循環依存に注意）
- structurePlan のシリアライズ形式（JSON文字列 vs ファイルパス渡し）の選択が後続処理に影響する

## 期待される修正

```typescript
// SkillCreatorService.ts の呼び出し側
const structurePlan = await this.runCreateWorkflow(skillDir, request);
if (structurePlan) {
  await this.generateSkillMd(skillDir, structurePlan);
}
```

## 完了条件

- [ ] `runCreateWorkflow` の戻り値 `StructurePlanJson` が呼び出し側で受け取られている
- [ ] `structurePlan` が `null` でない場合に `generateSkillMd(skillDir, structurePlan)` が呼ばれる
- [ ] `generate_skill_md.js` が `--plan` オプションで受け取った structurePlan を正しく処理する
- [ ] structurePlan が `null` の場合はエラーログを出力してスキルMD生成をスキップする
- [ ] 既存テストが全て PASS する
- [ ] 接続後の統合テストが追加されている

## 関連

- 親タスク: TASK-SC-IMP-CREATE-WORKFLOW-001
- 依存タスク: TASK-SC-FIX-GENERATE-SKILL-MD-001
- 対象ファイル: `apps/desktop/src/main/services/skill/SkillCreatorService.ts`
- 関連スクリプト: `generate_skill_md.js`
