# Phase 2: 設計

## メタ情報

| 項目       | 内容                            |
| ---------- | ------------------------------- |
| Phase      | 2                               |
| Phase名    | 設計                            |
| 対象機能   | TASK-SC-IMP-CREATE-WORKFLOW-001 |
| 前提Phase  | Phase 1: 要件定義               |
| 次Phase    | Phase 3: 設計レビューゲート     |
| ステータス | 完了                            |
| 作成日     | 2026-04-14                      |

## 目的

`runCreateWorkflow` の詳細設計を行い、`resourceLoader.loadAgent` パターンを用いた
構造計画 JSON 生成ロジックと、タスクA（TASK-SC-FIX-GENERATE-SKILL-MD-001）との接続点を設計する。

## 実行タスク

### Task 1: runCreateWorkflow シグネチャ変更設計

`void` → `StructurePlanJson | null` への戻り型変更を設計する。

**変更前**:

```typescript
private async runCreateWorkflow(options: CreateSkillOptions): Promise<void>
```

**変更後**:

```typescript
private async runCreateWorkflow(
  options: CreateSkillOptions,
): Promise<StructurePlanJson | null>
```

### Task 2: StructurePlanJson 型定義

```typescript
interface StructurePlanJson {
  skillName: string;
  description: string;
  purpose: string;
  features: string[];
  agents: string[];
  triggers?: string[];
  anchors?: string[];
}
```

配置: `SkillCreatorService.ts` 内部の `interface` として定義（スコープ最小化）。

### Task 3: agentファイル読み込みフロー設計

```typescript
private async runCreateWorkflow(
  options: CreateSkillOptions,
): Promise<StructurePlanJson | null> {
  try {
    // AC-1: loadAgent を呼び出す（collaborative パターン踏襲）
    const extractPurposeAgent =
      await this.resourceLoader.loadAgent("extract-purpose");

    // AC-4: options.description を使用（void options を削除）
    const planStructureAgent =
      await this.resourceLoader.loadAgent("plan-structure");

    const structurePlan: StructurePlanJson = {
      skillName: options.name,
      description: options.description,
      purpose: extractPurposeAgent, // 将来 LLM 呼び出しに置換
      features: [],
      agents: [extractPurposeAgent, planStructureAgent],
    };

    return structurePlan;
  } catch (error) {
    // AC-3: loadAgent 失敗時はフォールバック（null 返却）
    return null;
  }
}
```

### Task 4: タスクAとの接続点設計

```
runCreateWorkflow()
  └─ returns StructurePlanJson | null
       └─ createSkill() の local variable (`const structurePlan`) で受け取る
            └─ generateSkillMd() 呼び出し時に --plan <json> として渡す
                 └─ generate_skill_md.js（タスクAで修正済み）が受け取る
```

`createSkill()` の変更箇所:

```typescript
// 変更前
case "create":
  await this.runCreateWorkflow(options);
  break;

// 変更後（タスクA完了後の最終形）
case "create": {
  const structurePlan = await this.runCreateWorkflow(options);
  // `generateSkillMd(skillDir, structurePlan)` への明示 handoff は Phase 5 で行う
  void structurePlan;
  break;
}
```

`generateSkillMd(skillDir, structurePlan)` の形で `structurePlan` を明示引数として渡し、
`CreateSkillOptions` への hidden property 追加（`_structurePlan` など）は行わない。

## 参照資料

- `outputs/phase-1/requirements.md` — 受入条件（AC-1〜AC-5）
- `apps/desktop/src/main/services/skill/SkillCreatorService.ts` — 実装対象

## 成果物

| 成果物    | パス                        |
| --------- | --------------------------- |
| design.md | `outputs/phase-2/design.md` |

## 完了条件

- [x] `runCreateWorkflow` のシグネチャ変更設計が完了している
- [x] `StructurePlanJson` 型定義の方針が確定している
- [x] `loadAgent` フォールバック設計が完了している
- [x] タスクAとの接続点設計が完了している

## 次 Phase

→ [Phase 3: 設計レビューゲート](./phase-3-design-review.md)
