# 実装サマリー - TASK-SC-PLAN-CONNECT-GENERATE-SKILL-MD-001

## 変更内容

### 変更1: `void structurePlan;` 削除 + 接続コード挿入

`createSkill()` メソッド内の 126行目 `void structurePlan;` を削除し、`skillDir` 計算後に接続コードを追加。

```typescript
// runCreateWorkflow 戻り値を generateSkillMd へ接続
// TASK-SC-PLAN-CONNECT-GENERATE-SKILL-MD-001
let skillMdGeneratedByStructurePlan = false;
if (structurePlan) {
  await this.generateSkillMd(skillDir, structurePlan);
  skillMdGeneratedByStructurePlan = true;
} else if (options.mode === "create") {
  console.error("runCreateWorkflow returned null, skipping generateSkillMd");
}
```

### 変更2: インライン SKILL.md 生成を条件分岐でガード

既存のインライン SKILL.md 生成処理を `if (!skillMdGeneratedByStructurePlan)` で囲む。
`structurePlan` がある場合は `generateSkillMd` で生成済みのためスキップ。

### 変更3: `generateSkillMd` private メソッド追加

プライベートメソッド群の先頭に以下を追加:

```typescript
private async generateSkillMd(
  skillDir: string,
  structurePlan: StructurePlanJson,
): Promise<void>
```

`structurePlan` のデータから `plan` オブジェクトを構築し、`generate_skill_md.js --plan --output` を実行する。

## 変更ファイル

- `apps/desktop/src/main/services/skill/SkillCreatorService.ts`

## TypeScript コンパイル確認

実装後のテスト実行（vitest）が成功したことで型エラーなしを確認。
