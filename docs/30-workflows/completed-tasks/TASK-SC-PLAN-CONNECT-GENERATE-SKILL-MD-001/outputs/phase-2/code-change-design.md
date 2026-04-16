# コード変更設計 - TASK-SC-PLAN-CONNECT-GENERATE-SKILL-MD-001

## 変更ファイル

`apps/desktop/src/main/services/skill/SkillCreatorService.ts`

## 変更前後比較

### 変更1: void structurePlan の削除 + 接続コード追加

**変更前（104〜130行）:**

```typescript
let structurePlan: StructurePlanJson | null = null;

switch (options.mode) {
  case "collaborative":
    await this.runCollaborativeWorkflow(options);
    break;
  case "orchestrate":
    await this.runOrchestrateWorkflow(options);
    break;
  case "create":
    structurePlan = await this.runCreateWorkflow(options);
    // AC-2: runCreateWorkflow 完了後、後続処理が正常に続く
    break;
  case "update":
    // Update workflow
    break;
  case "improve-prompt":
    // Improve prompt workflow
    break;
}

void structurePlan; // 将来 generateSkillMd へ渡す（タスクA完了後に接続）

// スキル初期化
const skillDir = path.join(this.skillsDir, options.name);
```

**変更後:**

```typescript
let structurePlan: StructurePlanJson | null = null;

switch (options.mode) {
  case "collaborative":
    await this.runCollaborativeWorkflow(options);
    break;
  case "orchestrate":
    await this.runOrchestrateWorkflow(options);
    break;
  case "create":
    structurePlan = await this.runCreateWorkflow(options);
    // AC-2: runCreateWorkflow 完了後、後続処理が正常に続く
    break;
  case "update":
    // Update workflow
    break;
  case "improve-prompt":
    // Improve prompt workflow
    break;
}

// スキル初期化
const skillDir = path.join(this.skillsDir, options.name);

// runCreateWorkflow 戻り値を generateSkillMd へ接続
let skillMdGeneratedByStructurePlan = false;
if (structurePlan) {
  await this.generateSkillMd(skillDir, structurePlan);
  skillMdGeneratedByStructurePlan = true;
} else if (options.mode === "create") {
  console.error("runCreateWorkflow returned null, skipping generateSkillMd");
}
```

### 変更2: インライン SKILL.md 生成を条件分岐で囲む

**変更前（172〜218行）:**

```typescript
// SKILL.md生成
const skillMdPath = path.join(skillDir, "SKILL.md");
const tmpPlanPath = path.join(os.tmpdir(), `skill-plan-${randomUUID()}.json`);
try {
  // ...既存処理
} finally {
  // cleanup
}
```

**変更後:**

```typescript
// SKILL.md生成（structurePlan で生成済みの場合はスキップ）
if (!skillMdGeneratedByStructurePlan) {
  const skillMdPath = path.join(skillDir, "SKILL.md");
  const tmpPlanPath = path.join(os.tmpdir(), `skill-plan-${randomUUID()}.json`);
  try {
    // ...既存処理（変更なし）
  } finally {
    // cleanup
  }
}
```

### 変更3: `generateSkillMd` private メソッドを追加

プライベートメソッド群（600行以降）に以下を追加:

```typescript
/**
 * structurePlan を使って SKILL.md を生成する
 * TASK-SC-PLAN-CONNECT-GENERATE-SKILL-MD-001: runCreateWorkflow 戻り値との接続
 */
private async generateSkillMd(
  skillDir: string,
  structurePlan: StructurePlanJson,
): Promise<void> {
  const skillMdPath = path.join(skillDir, "SKILL.md");
  const tmpPlanPath = path.join(
    os.tmpdir(),
    `skill-plan-${randomUUID()}.json`,
  );
  try {
    const plan = {
      skillName: structurePlan.skillName,
      workflow: {
        summary: structurePlan.description,
        anchors: structurePlan.anchors ?? [],
        trigger: {
          description: `Use when ${structurePlan.skillName} is requested`,
          keywords: structurePlan.triggers ?? [structurePlan.skillName],
        },
        phases: [],
        tasks: [],
      },
      directories: {},
      files: [],
    };
    await fs.writeFile(tmpPlanPath, JSON.stringify(plan), "utf-8");
    const generateResult = await this.scriptExecutor.execute(
      "generate_skill_md.js",
      ["--plan", tmpPlanPath, "--output", skillMdPath],
    );
    let shouldUseFallback = !generateResult.success;
    if (!shouldUseFallback) {
      try {
        await fs.access(skillMdPath);
      } catch {
        shouldUseFallback = true;
      }
    }
    if (shouldUseFallback) {
      await this.ensureSkillMdExists(
        skillDir,
        structurePlan.skillName,
        structurePlan.description,
      );
    }
  } finally {
    await fs.unlink(tmpPlanPath).catch(() => {});
  }
}
```

## 影響範囲

| 項目                | 影響                                                   |
| ------------------- | ------------------------------------------------------ |
| 型変更              | なし（既存の型を使用）                                 |
| シグネチャ変更      | なし（既存メソッドのシグネチャは変更しない）           |
| create 以外のモード | なし（`structurePlan` は null のまま、フラグも false） |
| 既存テスト          | 全 PASS を維持（追加テストで接続を検証）               |
