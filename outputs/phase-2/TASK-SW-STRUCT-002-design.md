# TASK-SW-STRUCT-002 設計書

## メタ情報

| 項目       | 内容                                          |
| ---------- | --------------------------------------------- |
| タスクID   | TASK-SW-STRUCT-002                            |
| 機能名     | struct-002-connect-structure-plan-to-skill-md |
| 作成日     | 2026-04-15                                    |
| 完了確認日 | 2026-04-17                                    |

## 設計概要

`void structurePlan` を削除し、`structurePlan` の内容を `generateSkillMd()` プライベートメソッドに渡す接続配線を行う。

## 変更箇所

### 1. `void structurePlan` 削除（行 126）

削除対象:

```typescript
void structurePlan; // 将来 generateSkillMd へ渡す（タスクA完了後に接続）
```

### 2. SKILL.md 生成分岐ロジック（行 304-329）

```typescript
// SKILL.md生成: create モードのみ structurePlan を使い、他モードは従来どおりテンプレート生成
if (structurePlan) {
  await this.generateSkillMd(skillDir, structurePlan, operationSignal);
} else if (options.mode === "create") {
  this.logger.warn(
    "structurePlan is null, falling back to ensureSkillMdExists",
    {
      skillDir,
      skillName: options.name,
      mode: options.mode,
    },
  );
  await this.ensureSkillMdExists(
    skillDir,
    options.name,
    options.description,
    operationSignal,
  );
} else {
  await this.ensureSkillMdExists(
    skillDir,
    options.name,
    options.description,
    operationSignal,
  );
}
```

### 3. `generateSkillMd` プライベートメソッド（新規実装）

```typescript
private async generateSkillMd(
  skillDir: string,
  structurePlan: StructurePlanJson,
  signal?: AbortSignal,
): Promise<void>
```

#### StructurePlanJson → plan 変換仕様

| StructurePlanJson フィールド | plan への変換                                                |
| ---------------------------- | ------------------------------------------------------------ |
| `skillName`                  | `plan.skillName`                                             |
| `description`                | `plan.workflow.summary`                                      |
| `purpose`                    | `trigger.description` の生成に使用                           |
| `triggers`                   | `plan.workflow.trigger.keywords`（未指定時は `[skillName]`） |
| `anchors`                    | `plan.workflow.anchors`（未指定時は `[]`）                   |

#### trigger.description 生成ロジック

```typescript
const normalizedPurpose =
  typeof structurePlan.purpose === "string"
    ? structurePlan.purpose.replace(/\s+/g, " ").trim()
    : "";
const triggerDescription = normalizedPurpose
  ? `Use when ${structurePlan.skillName} is requested. Purpose: ${normalizedPurpose}`
  : `Use when ${structurePlan.skillName} is requested`;
```

#### 3段階フォールバック

1. `generate_skill_md.js` 実行失敗時 → `ensureSkillMdExists` へフォールバック
2. SKILL.md ファイルが生成されていない場合 → `ensureSkillMdExists` へフォールバック
3. 例外発生時 → `ensureSkillMdExists` へフォールバック

## モード別動作設計

| モード          | structurePlan | SKILL.md生成方法                   |
| --------------- | ------------- | ---------------------------------- |
| `create`        | 非null        | `generateSkillMd()`                |
| `create`        | null          | `ensureSkillMdExists()` (warn付き) |
| `collaborative` | null          | `ensureSkillMdExists()`            |
| `orchestrate`   | null          | `ensureSkillMdExists()`            |

## 後方互換性

- `collaborative` / `orchestrate` モードは `structurePlan` が `null` のため分岐に影響なし
- 既存テストは変更不要

## 型整合性

- `StructurePlanJson.anchors?: Anchor[]` → `plan.workflow.anchors: Anchor[]`（`|| []` でフォールバック）
- `StructurePlanJson.triggers?: string[]` → `plan.workflow.trigger.keywords: string[]`（`?. length` チェック）
