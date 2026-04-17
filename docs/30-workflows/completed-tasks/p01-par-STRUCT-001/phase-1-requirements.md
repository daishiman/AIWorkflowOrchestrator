# Phase 1: 要件定義

## メタ情報

| 項目       | 内容               |
| ---------- | ------------------ |
| Phase      | 1                  |
| Phase名    | 要件定義           |
| 対象機能   | TASK-SW-STRUCT-001 |
| 前提Phase  | -（起点）          |
| 次Phase    | Phase 2: 設計      |
| ステータス | 未実施             |
| 作成日     | 2026-04-15         |

## 目的

`SkillCreatorService.runCreateWorkflow()` が返す `StructurePlanJson` の各フィールドに
意味的に誤った値が設定されている問題を特定し、修正に必要な要件と受入条件を明確化する。

## 問題

`runCreateWorkflow`（行 630-653）が返す `StructurePlanJson` の各フィールドに以下の問題がある。

```typescript
// 現状（行 639-645）— フィールドの意味的な誤り
const structurePlan: StructurePlanJson = {
  skillName: options.name,
  description: options.description,
  purpose: extractPurposeAgent, // エージェントプロンプト文字列（誤り）
  features: [], // 空（機能未抽出）
  agents: [extractPurposeAgent, planStructureAgent], // プロンプト文字列（誤り）
};
```

`StructurePlanJson` インターフェース（行 35-43）の意図は:

- `purpose`: スキルの目的を表す説明文字列
- `agents`: エージェント識別名のリスト

しかし現状では `purpose` にプロンプトテンプレート本文が、`agents` にプロンプト文字列2本が入っている。

## 実行タスク

### Step 0: P50チェック（必須）

実装状態を確認し、既実装コードの重複修正を防止する。

1. `apps/desktop/src/main/services/skill/SkillCreatorService.ts` の行 630-653 を読み込み現状確認
2. `StructurePlanJson` インターフェース（行 35-43）の型定義を確認
3. 既存テストファイルの関連テストケースを確認

### Task 1: 問題特定と影響範囲調査

1. `runCreateWorkflow` の現状実装（行 630-653）を確認
2. `StructurePlanJson` インターフェースの型定義（行 35-43）を確認
3. `createSkill()` から `generateSkillMd()` へ渡る current facts を確認
4. `runCreateWorkflow()` の出力が `StructurePlanJson` の意図と一致しているか確認
5. LLM統合の分離方針（別タスク）を確認

### Task 2: 受入条件の策定

1. 修正後のフィールド値の仕様を整理
2. フォールバック要件を明確化（`runCreateWorkflow` の内部エラー時の継続動作）
3. 既存テストへの影響を評価
4. 受入条件を5件策定

## 受入条件

| ID   | 条件                                                                                                       |
| ---- | ---------------------------------------------------------------------------------------------------------- |
| AC-1 | `structurePlan.purpose` に `options.description` が設定される（エージェントプロンプト文字列でない）        |
| AC-2 | `structurePlan.agents` に `["extract-purpose", "plan-structure"]` というエージェント名リストが設定される   |
| AC-3 | `structurePlan.features` が空配列で維持されている                                                          |
| AC-4 | `runCreateWorkflow` の内部エラーが発生した場合でも `createSkill()` は成功する（フォールバック：null 返却） |
| AC-5 | `collaborative` モードの既存テストが全てパスし続ける                                                       |

## 参照資料

### システム仕様（aiworkflow-requirements）

| 参照資料                             | パス                                                                                        | 内容                                                                            |
| ------------------------------------ | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| task-workflow                        | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                        | TASK-SW-STRUCT-001 の current facts と state 同期                               |
| arch-electron-services-details-part1 | `.claude/skills/aiworkflow-requirements/references/arch-electron-services-details-part1.md` | SkillCreatorService / StructurePlanJson / generateSkillMd() の current contract |
| lessons-learned-current-2026-04      | `.claude/skills/aiworkflow-requirements/references/lessons-learned-current-2026-04.md`      | create workflow の責務分離に関する current lessons                              |

- `apps/desktop/src/main/services/skill/SkillCreatorService.ts` — 実装対象（行 630-653）
- `docs/30-workflows/skill-create-flow-gaps/00-task-spec-design-docs/phase-1-analysis.md` — 問題3の現状分析
- `docs/30-workflows/skill-create-flow-gaps/00-task-spec-design-docs/phase-2-solution.md` — 解決アプローチA
- `docs/30-workflows/skill-create-flow-gaps/00-task-spec-design-docs/phase-3-review.md` — タスク粒度確認

## 統合テスト連携

- 本タスクは単一ファイル（`SkillCreatorService.ts`）の内部メソッド修正であり、外部APIの変更はない
- `createSkill()` のシグネチャ（`Promise<string>` 返却）は変更しないため、IPC/Preload 層への影響はない
- 接続要件: `createSkill()` -> `runCreateWorkflow()` -> `generateSkillMd()` の current facts を前提とする

## 成果物

| 成果物                             | パス                                                 |
| ---------------------------------- | ---------------------------------------------------- |
| TASK-SW-STRUCT-001-requirements.md | `outputs/phase-1/TASK-SW-STRUCT-001-requirements.md` |

## 完了条件

- [ ] 問題の根本原因（`purpose`/`agents` フィールドの意味的な誤り）が特定されている
- [ ] 受入条件（AC-1〜AC-5）が全件策定されている
- [ ] LLM統合を別タスクに分離する方針が明記されている
- [ ] `createSkill()` -> `generateSkillMd()` の接続点が確認されている

## タスク100%実行確認【必須】

- [ ] Step 0（P50チェック）を実行し、現状コードを確認した
- [ ] Task 1（問題特定と影響範囲調査）を100%実行した
- [ ] Task 2（受入条件の策定）を100%実行した
- [ ] 成果物（TASK-SW-STRUCT-001-requirements.md）が生成されている
- [ ] artifacts.json が更新されている

## 次 Phase

→ [Phase 2: 設計](./phase-2-design.md)
