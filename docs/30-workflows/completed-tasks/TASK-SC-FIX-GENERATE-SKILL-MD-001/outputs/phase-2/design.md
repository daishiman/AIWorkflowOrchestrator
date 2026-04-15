# Phase 2 成果物: 設計書

## 修正箇所の特定

**ファイル**: `apps/desktop/src/main/services/skill/SkillCreatorService.ts`

**修正対象行**: 154-198（コメント「// SKILL.md生成」から finally 節まで）

```typescript
// 変更前（行 154-165）
// SKILL.md生成
const generateResult = await this.scriptExecutor.execute(
  "generate_skill_md.js",
  ["--path", skillDir],
);
if (!generateResult.success) {
  await this.ensureSkillMdExists(skillDir, options.name, options.description);
}
```

## 追加 import

```typescript
// 行 8 の前に追加
import { randomUUID } from "crypto";
import os from "os";
```

`path` / `fs/promises` は既存。`crypto` と `os` を追加する。どちらも Node.js 標準ライブラリのため外部インストール不要。

## 構造計画 JSON の最小形

```json
{
  "skillName": "<options.name>",
  "workflow": {
    "summary": "<options.description>",
    "anchors": [],
    "trigger": {
      "description": "Use when <options.name> is requested",
      "keywords": ["<options.name>"]
    },
    "phases": [],
    "tasks": []
  },
  "directories": {},
  "files": []
}
```

- `workflow` は `generate_skill_md.js` が期待する必須構造
- `directories` / `files` は最小構成として空オブジェクト・空配列で問題ない
- tmp ファイルパス: `os.tmpdir()/skill-plan-${randomUUID()}.json`
- エンコーディング: `utf-8`

## 置き換え後のブロック設計

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
  await fs.unlink(tmpPlanPath).catch(() => {});
}
```

## 設計上の決定事項

| 決定事項                                 | 理由                                                             |
| ---------------------------------------- | ---------------------------------------------------------------- |
| `try/finally` でクリーンアップを保証     | 成功・失敗・例外のすべての経路で tmp ファイルを削除（AC-5 対応） |
| `fs.unlink(...).catch(() => {})` を使用  | tmp ファイルが存在しない場合のエラーを無視するため               |
| 生成後の存在確認を追加                   | 成功でも `SKILL.md` が未生成なら fallback させるため             |
| `--output` に `skillDir/SKILL.md` を明示 | スクリプトへの出力先を確定的に伝えるため                         |
| `randomUUID()` を tmp ファイル名に使用   | 並列実行時の衝突を避けるため                                     |

## スクリプト不在時フォールバック経路

1. `fs.writeFile` 成功
2. `scriptExecutor.execute` がスクリプト不在エラー（`success: false`）を返す
3. `ensureSkillMdExists` が呼ばれフォールバック SKILL.md が生成される
4. `finally` で `fs.unlink` が実行される

## SKILL.md 未生成時フォールバック経路

1. `fs.writeFile` 成功
2. `scriptExecutor.execute` は `success: true`
3. `fs.access(skillMdPath)` が失敗し、SKILL.md 未生成と判定される
4. `ensureSkillMdExists` が呼ばれフォールバック SKILL.md が生成される
5. `finally` で `fs.unlink` が実行される
