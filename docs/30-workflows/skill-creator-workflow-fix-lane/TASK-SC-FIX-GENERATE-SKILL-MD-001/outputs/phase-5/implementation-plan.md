# Phase 5 成果物: 実装計画書

## メタ情報

| 項目       | 内容                              |
| ---------- | --------------------------------- |
| Phase      | 5                                 |
| Phase名    | 実装計画                          |
| タスクID   | TASK-SC-FIX-GENERATE-SKILL-MD-001 |
| ステータス | 完了                              |
| 作成日     | 2026-04-14                        |

## 変更ファイルと行番号サマリ

| ファイル                                                                     | 変更種別 | 対象行（変更前） | 内容                                           |
| ---------------------------------------------------------------------------- | -------- | ---------------- | ---------------------------------------------- |
| `apps/desktop/src/main/services/skill/SkillCreatorService.ts`                | 修正     | 行 8-9（import） | `import os from "os"` を追加                   |
| `apps/desktop/src/main/services/skill/SkillCreatorService.ts`                | 修正     | 行 154-165       | `--path` → `--plan` / `--output` + try/finally |
| `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.test.ts` | 修正     | 既存テスト末尾   | TC-01〜TC-07 のテストケース追加                |

## Task 1: import 追加

**ファイル**: `apps/desktop/src/main/services/skill/SkillCreatorService.ts`

```typescript
// 変更前（行 8-9）
import path from "path";
import fs from "fs/promises";

// 変更後
import os from "os";
import path from "path";
import fs from "fs/promises";
```

## Task 2: SKILL.md 生成ブロック置き換え（行 154-165）

**変更前**:

```typescript
// SKILL.md生成
const generateResult = await this.scriptExecutor.execute(
  "generate_skill_md.js",
  ["--path", skillDir],
);
if (!generateResult.success) {
  await this.ensureSkillMdExists(skillDir, options.name, options.description);
}
```

**変更後**:

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

**行番号の変化**:

- 変更前: 行 154-165（12行）
- 変更後: 行 154-178 程度（+14行）

## Task 3: テスト更新

`apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.test.ts` に
TC-01〜TC-07 を追加する。詳細は `outputs/phase-4/test-design.md` のスケルトンを参照。

**追加テストの概要**:

1. `fs` モジュールのモック追加（`vi.mock("fs/promises")`）
2. TC-01〜TC-03: `--plan` / `--output` 引数検証
3. TC-04〜TC-05: フォールバック動作検証
4. TC-06〜TC-07: finally cleanup 検証（成功・失敗両経路）

## Task 4: 動作確認コマンド

```bash
# SkillCreatorService のテストのみ実行
pnpm --filter @repo/desktop test -- --testPathPattern="SkillCreatorService"

# 型チェック（import os の型解決確認）
pnpm --filter @repo/desktop typecheck

# Lint チェック
pnpm --filter @repo/desktop lint
```

## 実装完了チェックリスト

- [ ] `import os from "os"` が追加されている
- [ ] `--path` 引数が `--plan` / `--output` 引数に置き換えられている
- [ ] `try/finally` ブロックで tmp ファイルが確実に削除される
- [ ] TC-01〜TC-07 が全件 Green
- [ ] 既存テストが破壊されていない
- [ ] 型チェックがパスする
- [ ] Lint がパスする

## 参照資料

- `phase-5-implementation.md` — 実装計画仕様書（本成果物の親仕様）
- `outputs/phase-4/test-design.md` — テストコードスケルトン（TC-01〜TC-07）
- `TASK-SC-FIX-GENERATE-SKILL-MD-001/index.md` — 受入条件 AC-1〜AC-5
