# Phase 5: 実装

## メタ情報

| 項目       | 内容                |
| ---------- | ------------------- |
| Phase      | 5                   |
| Phase名    | 実装                |
| 対象機能   | TASK-SW-STRUCT-002  |
| 前提Phase  | Phase 4: テスト作成 |
| 次Phase    | Phase 6: テスト拡充 |
| ステータス | 未実施              |
| 作成日     | 2026-04-16          |

## 目的

Phase 4 で設計したテストが Red になることを確認した後、`void structurePlan;` の削除と
`generateSkillMd` プライベートメソッドを新規実装してテストを Green にする。

## 実行タスク

### Task 1: TDD Red フェーズ確認

実装前に TC-01〜TC-05 が失敗することを確認する。

```bash
pnpm --filter @repo/desktop test -- --testPathPattern="SkillCreatorService" --grep "generateSkillMd"
```

全テストが失敗（Red）であることを確認してから実装に進む。

### Task 2: void structurePlan 削除

**修正対象ファイル**: `apps/desktop/src/main/services/skill/SkillCreatorService.ts`

`:126` の以下を削除する。

```typescript
void structurePlan; // 将来 generateSkillMd へ渡す（タスクA完了後に接続）
```

### Task 3: SKILL.md 生成フロー変更

`:173-218` の固定 `plan` オブジェクトを使った SKILL.md 生成コードを、
`structurePlan` の有無に応じた分岐に置き換える。

```typescript
// SKILL.md生成: create モードのみ structurePlan を使い、他モードは従来どおりテンプレート生成
if (structurePlan) {
  await this.generateSkillMd(skillDir, structurePlan);
} else if (options.mode === "create") {
  this.logger.warn(
    "structurePlan is null, falling back to ensureSkillMdExists",
    {
      skillDir,
      skillName: options.name,
      mode: options.mode,
    },
  );
  await this.ensureSkillMdExists(skillDir, options.name, options.description);
} else {
  await this.ensureSkillMdExists(skillDir, options.name, options.description);
}
```

### Task 4: logger フィールド追加

クラスのプライベートフィールドに `logger` を追加する。

```typescript
private readonly logger = {
  error: (msg: string, meta?: unknown) =>
    console.error(`[SkillCreatorService] ${msg}`, meta),
  warn: (msg: string, meta?: unknown) =>
    console.warn(`[SkillCreatorService] ${msg}`, meta),
};
```

### Task 5: generateSkillMd メソッド実装

`runCreateWorkflow` メソッドの後に以下を追加する。

```typescript
/**
 * structurePlan を基に SKILL.md を生成する。
 * generate_skill_md.js を --plan オプション付きで呼び出す。
 * 失敗時は ensureSkillMdExists にフォールバックする。
 */
private async generateSkillMd(
  skillDir: string,
  structurePlan: StructurePlanJson,
): Promise<void> {
  const tmpPlanPath = path.join(
    os.tmpdir(),
    `skill-plan-${randomUUID()}.json`,
  );
  const skillMdPath = path.join(skillDir, "SKILL.md");
  const normalizedPurpose =
    typeof structurePlan.purpose === "string"
      ? structurePlan.purpose.replace(/\s+/g, " ").trim()
      : "";
  const triggerDescription = normalizedPurpose
    ? `Use when ${structurePlan.skillName} is requested. Purpose: ${normalizedPurpose}`
    : `Use when ${structurePlan.skillName} is requested`;
  const triggerKeywords = structurePlan.triggers?.length
    ? structurePlan.triggers
    : [structurePlan.skillName];
  const plan = {
    skillName: structurePlan.skillName,
    workflow: {
      summary: structurePlan.description,
      anchors: structurePlan.anchors || [],
      trigger: {
        description: triggerDescription,
        keywords: triggerKeywords,
      },
      phases: [],
      tasks: [],
    },
    directories: {},
    files: [],
  };
  try {
    await fs.writeFile(tmpPlanPath, JSON.stringify(plan), "utf-8");
    const generateResult = await this.scriptExecutor.execute(
      "generate_skill_md.js",
      ["--plan", tmpPlanPath, "--output", skillMdPath],
    );
    let shouldUseFallback = !generateResult.success;
    const fallbackReason = generateResult.success
      ? "generated skill file not found"
      : "generate_skill_md.js returned failure";
    const fallbackMeta = generateResult.success
      ? { skillMdPath }
      : {
          skillMdPath,
          stderr: generateResult.stderr,
          exitCode: generateResult.exitCode,
        };
    if (!shouldUseFallback) {
      try {
        await fs.access(skillMdPath);
      } catch {
        shouldUseFallback = true;
      }
    }
    if (shouldUseFallback) {
      this.logger.error("generateSkillMd fallback to ensureSkillMdExists", {
        skillDir,
        skillName: structurePlan.skillName,
        reason: fallbackReason,
        ...fallbackMeta,
      });
      await this.ensureSkillMdExists(
        skillDir,
        structurePlan.skillName,
        structurePlan.description,
      );
    }
  } catch (err) {
    this.logger.error("generateSkillMd failed", { skillDir, err });
    await this.ensureSkillMdExists(
      skillDir,
      structurePlan.skillName,
      structurePlan.description,
    );
  } finally {
    // cleanup failure is non-fatal
    await fs.unlink(tmpPlanPath).catch(() => {});
  }
}
```

### Task 6: TDD Green フェーズ確認

実装後に TC-01〜TC-05 が成功することを確認する。

```bash
# 新規テスト Green 確認
pnpm --filter @repo/desktop test -- --testPathPattern="SkillCreatorService" --grep "generateSkillMd"

# 回帰テスト Green 確認
pnpm --filter @repo/desktop test -- --testPathPattern="SkillCreatorService" --grep "collaborative|orchestrate"

# 全テスト実行
pnpm --filter @repo/desktop test -- --testPathPattern="SkillCreatorService"
```

### Task 7: 型チェック確認

```bash
pnpm --filter @repo/desktop typecheck
```

### Task 8: lint 確認

```bash
pnpm --filter @repo/desktop lint
```

## 実装上の注意事項

- `void structurePlan;` 削除後、`structurePlan` 変数は `generateSkillMd` に渡されるまでスコープ内で有効
- `logger` フィールドは最小実装（console.error/warn）で十分。将来的に差し替え可能な設計
- `generateSkillMd` は create モードでのみ呼ばれるが、collaborative / orchestrate モードでも `structurePlan` が非 null の場合は呼ばれる設計にする
- tmp ファイルのクリーンアップは `finally` で non-fatal として実施する

## 参照資料

- `outputs/phase-4/TASK-SW-STRUCT-002-test-design.md` — テストケース（TC-01〜TC-05）
- `outputs/phase-2/TASK-SW-STRUCT-002-design.md` — 設計書

## 統合テスト連携

- `createSkill()` のシグネチャは変更しないため IPC/Preload 層への影響なし
- `generate_skill_md.js` スクリプトが tmp ファイル経由で呼び出されるようになる

## 成果物

| 成果物                                    | パス                                                        |
| ----------------------------------------- | ----------------------------------------------------------- |
| TASK-SW-STRUCT-002-implementation-plan.md | `outputs/phase-5/TASK-SW-STRUCT-002-implementation-plan.md` |

## 完了条件

- [ ] TC-01〜TC-05 が Red であることを確認した（実装前）
- [ ] `void structurePlan;` の削除が完了している
- [ ] `logger` フィールドの追加が完了している
- [ ] `generateSkillMd` メソッドの実装が完了している
- [ ] SKILL.md 生成フローの分岐変更が完了している
- [ ] TC-01〜TC-05 が Green になっている（実装後）
- [ ] TC-R01〜TC-R03（回帰テスト）が Green を維持している
- [ ] `pnpm --filter @repo/desktop typecheck` が 0 エラー
- [ ] `pnpm --filter @repo/desktop lint` が 0 エラー

## タスク100%実行確認【必須】

- [ ] Task 1（TDD Red フェーズ確認）を100%実行した
- [ ] Task 2（void structurePlan 削除）を100%実行した
- [ ] Task 3（SKILL.md 生成フロー変更）を100%実行した
- [ ] Task 4（logger フィールド追加）を100%実行した
- [ ] Task 5（generateSkillMd メソッド実装）を100%実行した
- [ ] Task 6（TDD Green フェーズ確認）を100%実行した
- [ ] Task 7（型チェック確認）を100%実行した
- [ ] Task 8（lint 確認）を100%実行した
- [ ] 成果物（TASK-SW-STRUCT-002-implementation-plan.md）が生成されている
- [ ] artifacts.json が更新されている

## 次 Phase

→ [Phase 6: テスト拡充](./phase-6-test-expansion.md)
