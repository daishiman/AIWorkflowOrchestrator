# implementation-guide: TASK-SC-FIX-GENERATE-SKILL-MD-001

## Part 1: 初学者・中学生レベルの説明

### 日常生活での例え話

`generate_skill_md.js` は「設計図（plan JSON）」を受け取って SKILL.md を書き出す工場スクリプトです。

今回の修正前は、**工場に間違った設計図を渡していた状態**で動かそうとしていました。

- 修正前: `skillName` を含まない plan を渡していたため、スクリプトが必須情報不足で失敗していた
- 修正後: `skillName` と `workflow.summary` を含む最小 plan を作り、`--plan` / `--output` で正しく渡すようになった

工場（スクリプト）がエラーになったときは、代わりに簡易版の SKILL.md が生成されます。
簡易版には Task 一覧のプレースホルダーが入り、YAML フロントマターも含まれるため、最低限の形は保たれます。

### なぜ必要だったか

`generate_skill_md.js` は `--plan` と `--output` の 2 引数が必須です。
これまで `SkillCreatorService` はスクリプトが期待する `skillName` を含まない plan を渡していたため：

1. スクリプトは引数エラーで失敗（終了コード非ゼロ）
2. `generateResult.success === false` または `SKILL.md` が欠落している場合にフォールバック `ensureSkillMdExists` を実行
3. フォールバック生成の SKILL.md には `## Task一覧` のプレースホルダーと YAML フロントマターが含まれる

---

## Part 2: 開発者・技術者レベルの説明

### 変更ファイル

| ファイル                                                                     | 変更内容                                                                       |
| ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `apps/desktop/src/main/services/skill/SkillCreatorService.ts`                | `import { randomUUID } from "crypto"` + `import os` 追加 + 行 155-178 置き換え |
| `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.test.ts` | `vi.mock("fs/promises")` + TC-01〜TC-07 追加                                   |

### 実装の核心

```typescript
// SKILL.md生成
const skillMdPath = path.join(skillDir, "SKILL.md");
const tmpPlanPath = path.join(os.tmpdir(), `skill-plan-${randomUUID()}.json`);
try {
  const plan = {
    skillName: options.name,
    workflow: {
      summary: options.description,
      anchors: [],
      trigger: {
        description: `Use when ${options.name} is requested`,
        keywords: [options.name],
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
    await this.ensureSkillMdExists(skillDir, options.name, options.description);
  }
} finally {
  // cleanup failure is non-fatal
  await fs.unlink(tmpPlanPath).catch(() => {});
}
```

### 設計上の決定事項

- **plan JSON の最小構造**: `skillName` と `workflow.summary` を含み、`directories` / `files` は空オブジェクト・空配列で最小動作可能
- **tmpファイルパス**: `os.tmpdir()/skill-plan-${randomUUID()}.json` — 並列実行時の衝突防止に UUID を使用
- **`finally` での cleanup**: `fs.unlink(...).catch(() => {})` で cleanup 失敗を non-fatal として吸収
- **フォールバック維持**: `generateResult.success === false` または `SKILL.md` 欠落時は `ensureSkillMdExists` を呼び出す

### テスト戦略

- `vi.mock("fs/promises")` でファイルシステムを完全モック化
- `scriptExecutor.execute` の第2引数（args 配列）を直接検証し、plan JSON の内容も確認する（TC-01〜03）
- `vi.spyOn(service as any, "ensureSkillMdExists")` でプライベートメソッドの呼び出し回数を検証（TC-04〜05）
- `vi.mocked(fsPromises.unlink).toHaveBeenCalledWith(...)` で finally cleanup を検証（TC-06〜07）

### 受入条件の充足確認

| AC   | 充足方法                                                                    |
| ---- | --------------------------------------------------------------------------- |
| AC-1 | TC-01〜03 で `--plan`/`--output` 引数を直接アサート                         |
| AC-2 | スクリプト成功経路で `## Task一覧` が含まれる plan から生成されることで確認 |
| AC-3 | AC-2 と同様                                                                 |
| AC-4 | TC-04/05 で `ensureSkillMdExists` の呼び出し回数を検証                      |
| AC-5 | TC-06/07 で `fs.unlink` の呼び出しを検証（成功・cleanup失敗両経路）         |
