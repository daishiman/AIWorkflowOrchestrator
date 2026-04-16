# Phase 2: 設計

## メタ情報

| 項目       | 内容                        |
| ---------- | --------------------------- |
| Phase      | 2                           |
| Phase名    | 設計                        |
| 対象機能   | TASK-SW-STRUCT-001          |
| 前提Phase  | Phase 1: 要件定義           |
| 次Phase    | Phase 3: 設計レビューゲート |
| ステータス | 未実施                      |
| 作成日     | 2026-04-15                  |

## 目的

`runCreateWorkflow` の出力仕様修正の詳細設計を行う。
`StructurePlanJson` インターフェースの意図に合わせて `purpose` / `agents` フィールドを
正しい値に変更する設計を策定する。

## 実行タスク

### Task 1: 修正箇所の特定と変更内容設計

**変更対象**: `apps/desktop/src/main/services/skill/SkillCreatorService.ts` 行 639-645

**変更前**:

```typescript
const structurePlan: StructurePlanJson = {
  skillName: options.name,
  description: options.description,
  purpose: extractPurposeAgent, // エージェントプロンプト文字列（誤り）
  features: [],
  agents: [extractPurposeAgent, planStructureAgent], // プロンプト文字列（誤り）
};
```

**変更後**:

```typescript
const structurePlan: StructurePlanJson = {
  skillName: options.name,
  description: options.description,
  purpose: options.description, // AC-1: options.description を使用（LLM統合は別タスク）
  features: [], // AC-3: 空配列を維持（LLM統合は別タスク）
  agents: ["extract-purpose", "plan-structure"], // AC-2: エージェント名リスト
};
```

### Task 2: loadAgent 呼び出しの扱い設計

`extractPurposeAgent` / `planStructureAgent` は現状 `purpose` / `agents` フィールドに
直接使用されているが、修正後は使用されなくなる。

方針A（推奨）: `loadAgent` 呼び出しを維持し、変数を削除するのみ

- `loadAgent` 呼び出し自体はエージェント定義ファイルの存在確認として意味がある
- ただし変数への代入は不要になるため、`await this.resourceLoader.loadAgent(...)` のみ呼び出す

方針B: `loadAgent` 呼び出しを削除

- AC-2 のエージェント名はハードコードするため `loadAgent` は不要
- コードが簡潔になる

**採用方針**: 方針B（loadAgent 呼び出しを削除）

- `purpose` / `agents` の値は `options.description` とエージェント名定数で構成するため、`loadAgent` の戻り値は不要
- 不要なファイルI/Oを排除することで副作用を減らす
- フォールバック（`null` 返却）は `try/catch` で維持するが、`loadAgent` 失敗のリスクが消えるため実質的に `null` を返さなくなる

### Task 3: フォールバック設計

`loadAgent` 呼び出しを削除した場合、`try/catch` 内で失敗する処理がなくなる。
ただし将来の変更に備えて `try/catch` 構造は維持する。

```typescript
private async runCreateWorkflow(
  options: CreateSkillOptions,
): Promise<StructurePlanJson | null> {
  try {
    const structurePlan: StructurePlanJson = {
      skillName: options.name,
      description: options.description,
      purpose: options.description,
      features: [],
      agents: ["extract-purpose", "plan-structure"],
    };
    return structurePlan;
  } catch {
    // AC-4: 将来の処理追加に備えてフォールバックを維持
    return null;
  }
}
```

### Task 4: concern 数と設計書分割基準確認

- concern 数: 1（`runCreateWorkflow` の出力仕様修正のみ）
- 単一 `phase-2-design.md` に記述する

### Task 5: IPC 4層整合性チェック

本タスクは `SkillCreatorService` 内部メソッドの修正であり、IPC チャンネルの変更はない。
4層整合性チェックは不要。

## 参照資料

### システム仕様（aiworkflow-requirements）

| 参照資料                             | パス                                                                                        | 内容                                                                            |
| ------------------------------------ | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| task-workflow                        | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                        | TASK-SW-STRUCT-001 の current facts と state 同期                               |
| arch-electron-services-details-part1 | `.claude/skills/aiworkflow-requirements/references/arch-electron-services-details-part1.md` | SkillCreatorService / StructurePlanJson / generateSkillMd() の current contract |
| lessons-learned-current-2026-04      | `.claude/skills/aiworkflow-requirements/references/lessons-learned-current-2026-04.md`      | create workflow の責務分離に関する current lessons                              |

- `outputs/phase-1/TASK-SW-STRUCT-001-requirements.md` — 受入条件（AC-1〜AC-5）
- `apps/desktop/src/main/services/skill/SkillCreatorService.ts` — 実装対象

## 統合テスト連携

- `createSkill()` の公開シグネチャは変更しないため統合ポイントへの影響なし
- `generateSkillMd()` が参照する `structurePlan` の内容（`purpose` / `agents`）を正しく設計する

## 成果物

| 成果物                       | パス                                           |
| ---------------------------- | ---------------------------------------------- |
| TASK-SW-STRUCT-001-design.md | `outputs/phase-2/TASK-SW-STRUCT-001-design.md` |

## 完了条件

- [ ] 変更前/後のコードが設計書に明記されている
- [ ] `loadAgent` 呼び出し削除の方針（方針B）が確定している
- [ ] フォールバック設計（`try/catch` 維持）が完了している
- [ ] IPC 4層整合性チェックが不要と判断されている

## タスク100%実行確認【必須】

- [ ] Task 1（修正箇所の特定と変更内容設計）を100%実行した
- [ ] Task 2（loadAgent 呼び出しの扱い設計）を100%実行した
- [ ] Task 3（フォールバック設計）を100%実行した
- [ ] Task 4（concern 数と設計書分割基準確認）を100%実行した
- [ ] Task 5（IPC 4層整合性チェック）を100%実行した
- [ ] 成果物（TASK-SW-STRUCT-001-design.md）が生成されている
- [ ] artifacts.json が更新されている

## 次 Phase

→ [Phase 3: 設計レビューゲート](./phase-3-design-review.md)
