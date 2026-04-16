# アーキテクチャ設計 - TASK-SC-PLAN-CONNECT-GENERATE-SKILL-MD-001

## 接続実装の設計方針

### 変更対象

`SkillCreatorService.ts` の `createSkill()` メソッド内の以下2箇所:

1. **126行目** `void structurePlan;` の行を削除
2. **129行目** `skillDir` 計算後に接続コードを追加

### null 安全処理設計

```typescript
// skillDir 計算後に追加する接続コード
if (structurePlan) {
  await this.generateSkillMd(skillDir, structurePlan);
} else if (options.mode === "create") {
  console.error("runCreateWorkflow returned null, skipping generateSkillMd");
}
```

- `structurePlan` は TypeScript の truthy チェックで null/undefined 両方をカバー
- create モード以外では `structurePlan` は常に null（switch 文で代入されないため）なので、`options.mode === "create"` で条件分岐

### `generateSkillMd` メソッド設計

```typescript
private async generateSkillMd(
  skillDir: string,
  structurePlan: StructurePlanJson,
): Promise<void>
```

**責務**: `structurePlan` を tmp JSON ファイルに書き込み、`generate_skill_md.js --plan --output` で SKILL.md を生成する。

**処理フロー**:

1. `skillMdPath = path.join(skillDir, "SKILL.md")`
2. `tmpPlanPath` を `os.tmpdir()` に UUID で作成
3. `structurePlan` から `plan` オブジェクトを構築し tmp ファイルに書き込む
4. `generate_skill_md.js --plan <tmpPath> --output <skillMdPath>` を実行
5. 失敗時 or SKILL.md 未生成時は `ensureSkillMdExists` フォールバック
6. `finally` ブロックで tmp ファイルを削除

### 既存インライン SKILL.md 生成との関係

- 既存インライン処理（173〜218行）は `structurePlan` がない場合のフォールバックとして保持
- `structurePlan` がある場合は `generateSkillMd` が実行され、その後のインライン処理はフラグでスキップ

```typescript
let skillMdGeneratedByStructurePlan = false;
if (structurePlan) {
  await this.generateSkillMd(skillDir, structurePlan);
  skillMdGeneratedByStructurePlan = true;
} else if (options.mode === "create") {
  console.error("runCreateWorkflow returned null, skipping generateSkillMd");
}

// SKILL.md生成（structurePlan で生成済みの場合はスキップ）
if (!skillMdGeneratedByStructurePlan) {
  // 既存のインライン SKILL.md 生成処理（173〜218行）
  ...
}
```

### 既存の try-catch との統合

- `generateSkillMd` は独立した try-finally で tmp ファイルをクリーンアップ
- `createSkill()` の既存の try-catch は変更不要
- `generateSkillMd` が例外を投げた場合は呼び出し元の createSkill() に伝播
