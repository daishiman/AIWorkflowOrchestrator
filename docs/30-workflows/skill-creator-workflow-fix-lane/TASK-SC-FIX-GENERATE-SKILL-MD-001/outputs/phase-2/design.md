# Phase 2 成果物: 設計書

## 修正箇所の特定

**ファイル**: `apps/desktop/src/main/services/skill/SkillCreatorService.ts`

**修正対象行**: 154-165（コメント「// SKILL.md生成」から閉じ括弧まで）

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
import os from "os";
```

`path` / `fs/promises` は既存。`os` のみ新規追加。Node.js 標準ライブラリのため外部インストール不要。

## 構造計画 JSON の最小形

```json
{
  "name": "<options.name>",
  "description": "<options.description>",
  "tasks": []
}
```

- `tasks` は空配列で最小動作可能
- tmp ファイルパス: `os.tmpdir()/skill-plan-${Date.now()}.json`
- エンコーディング: `utf-8`

## 置き換え後のブロック設計

```typescript
// SKILL.md生成
const tmpPlanPath = path.join(os.tmpdir(), `skill-plan-${Date.now()}.json`);
try {
  const plan = {
    name: options.name,
    description: options.description,
    tasks: [],
  };
  await fs.writeFile(tmpPlanPath, JSON.stringify(plan), "utf-8");
  const generateResult = await this.scriptExecutor.execute(
    "generate_skill_md.js",
    ["--plan", tmpPlanPath, "--output", path.join(skillDir, "SKILL.md")],
  );
  if (!generateResult.success) {
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
| スクリプト失敗時もフォールバックを維持   | AC-4 対応。既存の `ensureSkillMdExists` の役割を保持             |
| `--output` に `skillDir/SKILL.md` を明示 | スクリプトへの出力先を確定的に伝えるため                         |
| `Date.now()` を tmp ファイル名に使用     | 並列実行時の衝突リスクが低く、実装がシンプル                     |

## スクリプト不在時フォールバック経路

1. `fs.writeFile` 成功
2. `scriptExecutor.execute` がスクリプト不在エラー（`success: false`）を返す
3. `ensureSkillMdExists` が呼ばれフォールバック SKILL.md が生成される
4. `finally` で `fs.unlink` が実行される
