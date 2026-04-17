# Phase 2: 設計

## メタ情報

| 項目       | 内容                        |
| ---------- | --------------------------- |
| Phase      | 2                           |
| Phase名    | 設計                        |
| 対象機能   | TASK-SW-STRUCT-002          |
| 前提Phase  | Phase 1: 要件定義           |
| 次Phase    | Phase 3: 設計レビューゲート |
| ステータス | 未実施                      |
| 作成日     | 2026-04-16                  |

## 目的

`void structurePlan;` の削除と `generateSkillMd(skillDir, structurePlan)` プライベートメソッドの
新規実装の詳細設計を行う。`StructurePlanJson` から `generate_skill_md.js` が受け取る `plan`
オブジェクトへの変換仕様、および null フォールバック設計を策定する。

## 実行タスク

### Task 1: void structurePlan 削除の設計

**修正対象**: `apps/desktop/src/main/services/skill/SkillCreatorService.ts` `:126`

**変更前**:

```typescript
void structurePlan; // 将来 generateSkillMd へ渡す（タスクA完了後に接続）
```

**変更後**:

```typescript
// void structurePlan; を削除し、generateSkillMd 呼び出しに置き換える
// (SKILL.md 生成セクションで structurePlan を渡すよう変更)
```

### Task 2: generateSkillMd メソッドの設計

**新規メソッドシグネチャ**:

```typescript
private async generateSkillMd(
  skillDir: string,
  structurePlan: StructurePlanJson,
): Promise<void>
```

**StructurePlanJson → plan 変換設計**:

| StructurePlanJson フィールド | plan への変換                                                |
| ---------------------------- | ------------------------------------------------------------ |
| `skillName`                  | `plan.skillName`                                             |
| `description`                | `plan.workflow.summary`                                      |
| `purpose`                    | `trigger.description` の生成に使用                           |
| `triggers`                   | `plan.workflow.trigger.keywords`（未指定時は `[skillName]`） |
| `anchors`                    | `plan.workflow.anchors`（未指定時は `[]`）                   |

**trigger.description の生成ロジック**:

```typescript
const normalizedPurpose =
  typeof structurePlan.purpose === "string"
    ? structurePlan.purpose.replace(/\s+/g, " ").trim()
    : "";
const triggerDescription = normalizedPurpose
  ? `Use when ${structurePlan.skillName} is requested. Purpose: ${normalizedPurpose}`
  : `Use when ${structurePlan.skillName} is requested`;
```

### Task 3: SKILL.md 生成フロー変更設計

**変更前**（`:173-218`）: 固定 `plan` オブジェクトを直接組み立てて `generate_skill_md.js` を呼び出す

**変更後**: `structurePlan` の有無に応じて分岐する

```typescript
if (structurePlan) {
  await this.generateSkillMd(skillDir, structurePlan);
} else if (options.mode === "create") {
  // AC-3: null フォールバック（create モード）
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

### Task 4: フォールバック設計

`generateSkillMd` 内部のフォールバック設計:

1. `generate_skill_md.js` 実行失敗時 → `ensureSkillMdExists` へフォールバック
2. SKILL.md ファイルが生成されていない場合 → `ensureSkillMdExists` へフォールバック
3. 例外発生時 → `ensureSkillMdExists` へフォールバック

いずれの場合も `createSkill()` は成功する（例外を伝播させない）。

### Task 5: logger フィールドの設計

`generateSkillMd` でのエラー・警告ログ出力のために `logger` プライベートフィールドを追加する。

```typescript
private readonly logger = {
  error: (msg: string, meta?: unknown) =>
    console.error(`[SkillCreatorService] ${msg}`, meta),
  warn: (msg: string, meta?: unknown) =>
    console.warn(`[SkillCreatorService] ${msg}`, meta),
};
```

### Task 6: IPC 4層整合性チェック

本タスクは `SkillCreatorService` 内部メソッドの実装追加であり、IPC チャンネルの変更はない。
4層整合性チェックは不要。

## 参照資料

- `outputs/phase-1/TASK-SW-STRUCT-002-requirements.md` — 受入条件（AC-1〜AC-5）
- `apps/desktop/src/main/services/skill/SkillCreatorService.ts` — 実装対象
- `docs/30-workflows/p01-par-STRUCT-001/phase-2-design.md` — depends_on の設計書

## 統合テスト連携

- `createSkill()` の公開シグネチャは変更しないため統合ポイントへの影響なし
- `generate_skill_md.js` スクリプトが tmp ファイル経由で呼び出されることになる

## 成果物

| 成果物                       | パス                                           |
| ---------------------------- | ---------------------------------------------- |
| TASK-SW-STRUCT-002-design.md | `outputs/phase-2/TASK-SW-STRUCT-002-design.md` |

## 完了条件

- [ ] `void structurePlan;` 削除の設計が明記されている
- [ ] `generateSkillMd` メソッドシグネチャと変換仕様が設計されている
- [ ] SKILL.md 生成フローの変更（分岐設計）が完了している
- [ ] フォールバック設計（3段階）が完了している
- [ ] IPC 4層整合性チェックが不要と判断されている

## タスク100%実行確認【必須】

- [ ] Task 1（void structurePlan 削除の設計）を100%実行した
- [ ] Task 2（generateSkillMd メソッドの設計）を100%実行した
- [ ] Task 3（SKILL.md 生成フロー変更設計）を100%実行した
- [ ] Task 4（フォールバック設計）を100%実行した
- [ ] Task 5（logger フィールドの設計）を100%実行した
- [ ] Task 6（IPC 4層整合性チェック）を100%実行した
- [ ] 成果物（TASK-SW-STRUCT-002-design.md）が生成されている
- [ ] artifacts.json が更新されている

## 次 Phase

→ [Phase 3: 設計レビューゲート](./phase-3-design-review.md)
