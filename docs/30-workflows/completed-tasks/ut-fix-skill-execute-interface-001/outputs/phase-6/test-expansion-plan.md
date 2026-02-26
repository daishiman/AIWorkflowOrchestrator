# Phase 6 テスト拡張計画

## メタ情報

- タスクID: UT-FIX-SKILL-EXECUTE-INTERFACE-001
- Phase: 6（テスト拡充）
- 作成日: 2026-02-25
- 前提: Phase 4 テストケース定義 / Phase 5 実装計画

## 拡張対象

### 対象ハンドラ

- `apps/desktop/src/main/ipc/skillHandlers.ts` の `skill:execute` ハンドラ（L217-L283）
- 型ガード: `isSkillNameRequest()` による `SkillExecutionRequest | { skillId: string }` のユニオン判別

### テストファイル（3ファイル・合計90テスト）

1. `apps/desktop/src/main/ipc/__tests__/skillHandlers.execute.test.ts` -- 正常系・エラー系・セキュリティ系
2. `apps/desktop/src/main/ipc/__tests__/skillHandlers.validation.test.ts` -- P42準拠3段バリデーション
3. `apps/desktop/src/main/ipc/__tests__/skillHandlers.delegate.test.ts` -- SkillExecutor注入・委譲統合

## 拡張方針

### Task 6-1: 境界値テスト拡充

skill:execute ハンドラのユニオン型入力に対し、以下2パスそれぞれの境界値を網羅する。

#### skillName パス（`SkillExecutionRequest` 形式）

| ID        | 項目                      | 入力                                                                    | 期待結果                                                      | 優先度 |
| --------- | ------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------- | ------ |
| EXP-SN-01 | skillName 最小有効値      | `{ skillName: "a", prompt: "" }`                                        | scanAvailableSkills → 名前一致検索 → executeSkill             | High   |
| EXP-SN-02 | skillName 前後空白        | `{ skillName: "  Test Skill  ", prompt: "" }`                           | isSkillNameRequest=true、trim後の値で名前検索                 | High   |
| EXP-SN-03 | skillName タブ/改行のみ   | `{ skillName: "\t\n", prompt: "" }`                                     | VALIDATION_ERROR（trim後空文字）                              | High   |
| EXP-SN-04 | prompt 空文字             | `{ skillName: "Test Skill", prompt: "" }`                               | 正常実行（実コードは prompt 空文字を許容）                    | High   |
| EXP-SN-05 | prompt 長文               | 10,000文字のプロンプト                                                  | 実行またはサービス層の制約エラー                              | Low    |
| EXP-SN-06 | workingDirectory 未指定   | `{ skillName: "Test Skill", prompt: "hello" }`                          | デフォルト動作で正常実行                                      | Medium |
| EXP-SN-07 | workingDirectory 空白のみ | `{ skillName: "Test Skill", prompt: "hello", workingDirectory: "   " }` | ハンドラ通過（workingDirectory のバリデーションはサービス層） | Medium |
| EXP-SN-08 | workingDirectory に `..`  | パストラバーサル文字列                                                  | セキュリティ仕様に従い拒否または安全化（サービス層）          | Low    |

#### skillId パス（`{ skillId: string }` 形式）

| ID        | 項目                 | 入力                                               | 期待結果                         | 優先度 |
| --------- | -------------------- | -------------------------------------------------- | -------------------------------- | ------ |
| EXP-ID-01 | skillId 正常値       | `{ skillId: "skill-1" }`                           | executeSkill(skillId, undefined) | High   |
| EXP-ID-02 | skillId 空文字       | `{ skillId: "" }`                                  | VALIDATION_ERROR                 | High   |
| EXP-ID-03 | skillId スペースのみ | `{ skillId: "   " }`                               | VALIDATION_ERROR（P42 trim）     | High   |
| EXP-ID-04 | skillId null         | `{ skillId: null }`                                | VALIDATION_ERROR                 | High   |
| EXP-ID-05 | skillId with params  | `{ skillId: "skill-1", params: { key: "value" } }` | executeSkill(skillId, params)    | High   |

### Task 6-2: 回帰テスト観点

skill:execute の修正が既存ハンドラに影響しないことを確認する。

| ID         | 観点                            | 検証内容                                             | 優先度 |
| ---------- | ------------------------------- | ---------------------------------------------------- | ------ |
| EXP-REG-01 | skill:import 契約維持           | `skillName` 単一文字列引数でインポート成功           | High   |
| EXP-REG-02 | skill:remove 契約維持           | `skillName` 単一文字列引数で削除成功                 | High   |
| EXP-REG-03 | skill:execute 既存 skillId パス | 既存の `{ skillId }` パスが変更なく動作              | High   |
| EXP-REG-04 | unregisterSkillHandlers         | 全チャンネルのハンドラが正常に解除される             | Medium |
| EXP-REG-05 | SkillExecutor 注入              | registerSkillHandlers で setSkillExecutor が呼ばれる | Medium |

## 優先度定義

| 優先度 | 基準                                         | 実施タイミング             |
| ------ | -------------------------------------------- | -------------------------- |
| High   | 契約整合・バリデーション失敗に直結するケース | 必須（Phase 7 ゲート対象） |
| Medium | デフォルト動作・オプション引数の挙動         | 推奨（カバレッジ向上用）   |
| Low    | 極端な入力長・セキュリティ境界               | サービス層テストで補完可能 |

## 実コードとの対応

### isSkillNameRequest 型ガード（L231-L236）

```typescript
const isSkillNameRequest = (
  payload: SkillExecutionRequest | { skillId: string },
): payload is SkillExecutionRequest =>
  typeof payload === "object" && payload !== null && "skillName" in payload;
```

- `skillName` プロパティの有無で分岐
- 存在する場合: skillName の 3段バリデーション → scanAvailableSkills → 名前一致 → executeSkill(skill.id, {prompt})
- 不在の場合: skillId の 3段バリデーション → executeSkill(skillId, params)

### テストカバレッジの確認ポイント

- isSkillNameRequest の true/false 両パスを網羅
- skillName パスの scanAvailableSkills → find → executeSkill 委譲チェーン
- skillId パスの直接 executeSkill 委譲
- VALIDATION_ERROR の throw 形式（code + message プロパティ）

## 完了条件

- [x] skillName パスの境界値ケースを定義（EXP-SN-01〜08）
- [x] skillId パスの境界値ケースを定義（EXP-ID-01〜05）
- [x] 回帰テスト観点を定義（EXP-REG-01〜05）
- [x] 優先度を3段階で定義（High/Medium/Low）
- [x] 実コードの isSkillNameRequest 型ガードとの対応を記載
