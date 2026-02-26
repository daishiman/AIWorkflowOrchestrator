# Phase 8 リファクタリング方針

## メタ情報

- タスクID: UT-FIX-SKILL-EXECUTE-INTERFACE-001
- Phase: 8（リファクタリング）
- 作成日: 2026-02-25
- 前提: Phase 7 カバレッジ確認完了

## 命名統一規約（Task 8-1）

### 基本原則（P45対策）

引数名は「実際の値のセマンティクスに合致する名前」を使用する。

### 命名規則

| レイヤー                 | 変数名           | 意味                                   | 使用例                                                  |
| ------------------------ | ---------------- | -------------------------------------- | ------------------------------------------------------- |
| Preload（入力）          | `skillName`      | スキルの表示名（ユーザーが指定する値） | `execute({ skillName: "Test Skill", prompt: "hello" })` |
| Main Handler（入力受理） | `args.skillName` | Preload から受け取ったスキル名         | `isSkillNameRequest(args) → args.skillName`             |
| Main Handler（解決後）   | `skill.id`       | scanAvailableSkills で解決した内部ID   | `executeSkill(skill.id, { prompt })`                    |
| Main Handler（直接パス） | `args.skillId`   | 呼び出し元が直接指定した内部ID         | `executeSkill(args.skillId, args.params)`               |
| Service（実行）          | `skillId`        | executeSkill の第1引数（内部ID）       | `skillService.executeSkill(skillId, params)`            |

### isSkillNameRequest 型ガードの命名規約

```typescript
// 実コード（L231-L236）: 変更不要
const isSkillNameRequest = (
  payload: SkillExecutionRequest | { skillId: string },
): payload is SkillExecutionRequest =>
  typeof payload === "object" && payload !== null && "skillName" in payload;
```

- `isSkillNameRequest`: 「skillName プロパティの存在を確認する型ガード」という意味が明確
- `hasSkillName`: 型ガードの戻り値を保持する変数名として適切（実コード L238）

### 同一関数内での混在ルール

skill:execute ハンドラは `skillName` と `skillId` の2パスを持つため、同一関数内で両方の変数名が出現する。以下の規約で可読性を確保する。

1. 型ガード分岐の直後にコメントで変換点を明示する

```typescript
if (hasSkillName) {
  // skillName → skillId 解決パス
  const { skills } = await skillService.scanAvailableSkills();
  const skill = skills.find((item) => item.name === args.skillName);
  // skill.id が resolvedSkillId に相当
  const result = await skillService.executeSkill(skill.id, {
    prompt: args.prompt,
  });
}
// else: skillId 直接パス
const result = await skillService.executeSkill(args.skillId, args.params);
```

2. テストのdescribe名で使用パスを明示する

```typescript
describe("skillName contract (preload compatible)", () => { ... });
describe("skillId direct path", () => { ... });
```

## レビュー規約（Task 8-2）

### 必須レビュー観点

| #   | 観点                           | チェック内容                                                                                   | 関連 Pitfall |
| --- | ------------------------------ | ---------------------------------------------------------------------------------------------- | ------------ |
| 1   | 引数名と実値の一致             | ハンドラの引数名が実際に渡される値のセマンティクスと一致しているか                             | P45          |
| 2   | IPC 契約の3層一致              | Preload の引数形式 → Main Handler の受理形式 → Service の呼び出し形式が一致しているか          | P44          |
| 3   | 3段バリデーション              | typeof チェック → 空文字列チェック → trim 空文字列チェックの3段が全て実装されているか          | P42          |
| 4   | エラーコード統一               | バリデーションエラーのコードが `VALIDATION_ERROR` で統一されているか                           | P42          |
| 5   | エラーメッセージのフィールド名 | `"skillName must be ..."` / `"skillId must be ..."` のように正確なフィールド名が含まれているか | P45          |

### 型ガード分岐のレビュー観点

| #   | 観点                   | チェック内容                                                            |
| --- | ---------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------- |
| 6   | ユニオン型の網羅       | `SkillExecutionRequest                                                  | { skillId: string }` の両パスがテストで網羅されているか |
| 7   | 型ガードの null 安全性 | `isSkillNameRequest` が `null` / `undefined` を正しく除外しているか     |
| 8   | 分岐後の変数スコープ   | hasSkillName=true パスと false パスで変数の型が正しく絞り込まれているか |

## 適用範囲

- **プロダクションコード**: `apps/desktop/src/main/ipc/skillHandlers.ts`（skill:execute セクション）
- **型定義**: `packages/shared/src/types/skill.ts`（SkillExecutionRequest）
- **Preload**: `apps/desktop/src/preload/skill-api.ts`（execute メソッド）
- **テスト**: `apps/desktop/src/main/ipc/__tests__/skillHandlers.*.test.ts`（3ファイル）

## 完了条件

- [x] 命名規約を5レイヤーで定義（Preload → Main入力 → Main解決後 → Main直接 → Service）
- [x] isSkillNameRequest 型ガードの命名規約を記載
- [x] 同一関数内の混在ルールを定義（コメント必須化）
- [x] レビュー観点を8項目で定義（P42/P44/P45 対策 + 型ガード分岐）
- [x] 適用範囲を明示（4ファイル群）
