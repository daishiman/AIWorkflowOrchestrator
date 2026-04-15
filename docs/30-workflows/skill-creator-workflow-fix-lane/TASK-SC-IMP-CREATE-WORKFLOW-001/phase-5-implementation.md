# Phase 5: 実装計画

## メタ情報

| 項目       | 内容                                       |
| ---------- | ------------------------------------------ |
| Phase      | 5                                          |
| Phase名    | 実装計画                                   |
| 対象機能   | TASK-SC-IMP-CREATE-WORKFLOW-001            |
| 前提Phase  | Phase 4: テスト設計                        |
| 次Phase    | Phase 6: テスト拡充（タスクA完了後に着手） |
| ステータス | 完了                                       |
| 作成日     | 2026-04-14                                 |

## 目的

タスクA（TASK-SC-FIX-GENERATE-SKILL-MD-001）完了後に着手する実装の手順を詳細化する。
`runCreateWorkflow` の空実装を修正し、AC-1〜AC-5 を全て満たす実装ステップを定義する。

## 前提条件

**この Phase の実装作業は TASK-SC-FIX-GENERATE-SKILL-MD-001 の完了後に着手すること。**

- [ ] `generate_skill_md.js` が `--plan <json>` / `--output <path>` 引数を受け付けるように修正済み
- [ ] タスクA のテストが全件 Green
- [ ] タスクA の PR がマージ済み（またはブランチがマージ可能状態）

## 実装ステップ

### ステップ 1: StructurePlanJson 型定義の追加

**ファイル**: `apps/desktop/src/main/services/skill/SkillCreatorService.ts`

import 文の直後（クラス定義の前）に追加:

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

### ステップ 2: runCreateWorkflow のシグネチャ変更・実装

**ファイル**: `apps/desktop/src/main/services/skill/SkillCreatorService.ts`（行 574）

**変更前**:

```typescript
private async runCreateWorkflow(options: CreateSkillOptions): Promise<void> {
  void options; // unused warning回避
}
```

**変更後**:

```typescript
private async runCreateWorkflow(
  options: CreateSkillOptions,
): Promise<StructurePlanJson | null> {
  try {
    const extractPurposeAgent =
      await this.resourceLoader.loadAgent("extract-purpose");
    const planStructureAgent =
      await this.resourceLoader.loadAgent("plan-structure");

    // TODO(TASK-SC-IMP-CREATE-WORKFLOW-001): 将来 LLM 呼び出しに置換
    const structurePlan: StructurePlanJson = {
      skillName: options.name,
      description: options.description,
      purpose: extractPurposeAgent,
      features: [],
      agents: [extractPurposeAgent, planStructureAgent],
    };

    return structurePlan;
  } catch (error) {
    return null; // AC-3: loadAgent 失敗時はフォールバック
  }
}
```

### ステップ 3: createSkill() の case "create" 変更

**ファイル**: `apps/desktop/src/main/services/skill/SkillCreatorService.ts`（行 96-98）

**変更後**:

```typescript
case "create": {
  const structurePlan = await this.runCreateWorkflow(options);
  // タスクA完了後に `generateSkillMd(skillDir, structurePlan)` へ明示的に渡す
  void structurePlan;
  break;
}
```

`generateSkillMd(skillDir, structurePlan)` の形で `structurePlan` を local variable から
明示引数へ渡す。`options._structurePlan` のような hidden property 追加は禁止する。

### ステップ 4: テスト追加

`apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.test.ts` に
`outputs/phase-4/test-design.md` のスケルトン（TC-01〜TC-05）を追加する。

### ステップ 5: 動作確認

```bash
# 型チェック
pnpm --filter @repo/desktop typecheck

# テスト実行
pnpm --filter @repo/desktop test -- --testPathPattern="SkillCreatorService"

# 回帰確認
pnpm --filter @repo/desktop test -- --testPathPattern="SkillCreatorService" --grep "collaborative"
```

## 実装完了チェックリスト

| ステップ | 内容                                     | 完了条件                                         |
| -------- | ---------------------------------------- | ------------------------------------------------ |
| 1        | `StructurePlanJson` 型定義の追加         | 型エラーなし                                     |
| 2        | `runCreateWorkflow` シグネチャ変更・実装 | `void options` が削除され `null` 返却実装済み    |
| 3        | `createSkill()` の `case "create":` 変更 | `structurePlan` を local variable で受け渡し済み |
| 4        | TC-01〜TC-05 テスト追加                  | 全テストケース Green                             |
| 5        | 型チェック・テスト実行                   | エラーなし・回帰なし                             |

## 参照資料

- `outputs/phase-5/implementation-plan.md` — 本フェーズの詳細成果物（コードスニペット付き）
- `outputs/phase-4/test-design.md` — テストコードスケルトン
- `TASK-SC-FIX-GENERATE-SKILL-MD-001/` — 先行タスクA（接続先）

## 成果物

| 成果物                 | パス                                     |
| ---------------------- | ---------------------------------------- |
| implementation-plan.md | `outputs/phase-5/implementation-plan.md` |

## 完了条件

- [x] 実装ステップ 1〜3 の詳細が完成している（コードスニペット付き）
- [x] タスクA完了後に着手するステップ 4 が明確に定義されている
- [x] テスト追加ステップが明確に定義されている
- [x] 動作確認コマンドが明記されている

## 次 Phase

→ Phase 6: テスト拡充（タスクA完了後に着手）
→ [phase-6-test-expansion.md](./phase-6-test-expansion.md)
