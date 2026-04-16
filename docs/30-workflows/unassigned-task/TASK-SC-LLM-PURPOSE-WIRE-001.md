# TASK-SC-LLM-PURPOSE-WIRE-001: extract-purpose エージェントによる purpose フィールドの LLM 実結果への差し替え

## メタ情報

```yaml
issue_number: 2239 # 旧 #2181 は CLOSED。新規 Issue として #2239 を作成済み。
```

## メタ情報

| 項目     | 値                                                                          |
| -------- | --------------------------------------------------------------------------- |
| タスクID | TASK-SC-LLM-PURPOSE-WIRE-001                                                |
| 検出元   | TASK-SC-IMP-CREATE-WORKFLOW-001 Phase 12 未タスク検出（未タスク-02）        |
| 優先度   | MEDIUM                                                                      |
| 依存     | TASK-SC-PLAN-CONNECT-GENERATE-SKILL-MD-001 の完了                           |
| 影響     | StructurePlanJson.purpose にエージェント定義の raw 文字列が入り続けるリスク |
| 検出日   | 2026-04-15                                                                  |

## 概要

`runCreateWorkflow` 内で `loadAgent("extract-purpose")` を呼び出してエージェント定義ファイルを読んでいるが、実際に LLM へ問い合わせて purpose を抽出するステップが未実装。`purpose` フィールドにはエージェント定義文字列そのものが入っており、LLM 推論結果ではない。

`extract-purpose` エージェントを使って LLM にスキルの目的文を生成させ、その結果を `StructurePlanJson.purpose` に格納することで、正しい LLM 推論結果に差し替える。

## 現状

```typescript
// apps/desktop/src/main/services/skill/SkillCreatorService.ts
// runCreateWorkflow 内
const purposeAgentDef = await this.resourceLoader.loadAgent("extract-purpose");
// purposeAgentDef を LLM に渡して purpose を抽出する実装が未実装
// 現状はエージェント定義ファイルの内容が直接 structurePlan.purpose に入っている
```

## 苦戦箇所

- `generate_skill_md.js` 側で最終生成を担う設計に接続してから purpose の LLM 化を判断する必要がある
- purpose 生成は「extract-purpose」エージェントが LLM に対して何を問い合わせるかの仕様が曖昧
- LLM 呼び出し方式（直接呼び出し vs エージェント経由）の選択が将来の設計に影響する

## 期待される実装の方向性

```typescript
// extract-purpose エージェント定義を LLM に渡し、purpose を生成させる
const purposeAgentDef = await this.resourceLoader.loadAgent("extract-purpose");
const purpose = await this.llmClient.generate({
  system: purposeAgentDef,
  user: skillInput,
});
structurePlan.purpose = purpose;
```

実装の詳細設計は TASK-SC-PLAN-CONNECT-GENERATE-SKILL-MD-001（`generate_skill_md.js` との接続確認）の完了後に行う。

## 完了条件

- [ ] `extract-purpose` エージェント定義を LLM に渡し、purpose 文字列を取得する処理が `runCreateWorkflow` 内に実装されている
- [ ] `StructurePlanJson.purpose` に LLM の推論結果が格納されている（エージェント定義の raw 文字列ではない）
- [ ] LLM 呼び出し方式（直接呼び出し vs エージェント経由）が設計ドキュメントに明記されている
- [ ] purpose 生成に失敗した場合のエラーハンドリングが実装されている
- [ ] 既存テストが全て PASS する
- [ ] 新規ユニットテストで purpose フィールドが LLM 結果になっていることが検証されている

## 関連

- 親タスク: TASK-SC-IMP-CREATE-WORKFLOW-001
- 依存タスク: TASK-SC-PLAN-CONNECT-GENERATE-SKILL-MD-001
- 対象ファイル: `apps/desktop/src/main/services/skill/SkillCreatorService.ts`
- 関連エージェント定義: `extract-purpose`（`resourceLoader.loadAgent` で読み込み）
