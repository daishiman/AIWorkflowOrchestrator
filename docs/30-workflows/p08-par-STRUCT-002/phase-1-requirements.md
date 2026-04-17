# Phase 1: 要件定義

## メタ情報

| 項目       | 内容               |
| ---------- | ------------------ |
| Phase      | 1                  |
| Phase名    | 要件定義           |
| 対象機能   | TASK-SW-STRUCT-002 |
| 前提Phase  | -（起点）          |
| 次Phase    | Phase 2: 設計      |
| ステータス | 未実施             |
| 作成日     | 2026-04-16         |

## 目的

`SkillCreatorService.ts:126` の `void structurePlan;` が意図的な未実装プレースホルダーであることを確認し、
SKILL.md 生成に `structurePlan` を接続するための要件と受入条件を明確化する。

## 問題

`SkillCreatorService.ts:126` に以下のコードが存在する。

```typescript
void structurePlan; // 将来 generateSkillMd へ渡す（タスクA完了後に接続）
```

このプレースホルダーによって、`runCreateWorkflow` が返す `StructurePlanJson`（`purpose` / `skillName` 等）が
SKILL.md 生成に全く使用されていない。SKILL.md 生成（`:173-218`）は以下の固定 `plan` オブジェクトを使用している。

```typescript
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
```

`structurePlan` の `purpose` / `agents` / `triggers` / `anchors` が SKILL.md に反映されていない。

TASK-SW-STRUCT-001 が完了し、`structurePlan` の各フィールドが意味的に正しい値を持つことが保証されたため、
本タスクで接続を実現する。

## 実行タスク

### Step 0: P50チェック（必須）

実装状態を確認し、既実装コードの重複修正を防止する。

1. `apps/desktop/src/main/services/skill/SkillCreatorService.ts` の `:120-135` を読み込み `void structurePlan;` の位置を確認
2. SKILL.md 生成処理（`:173-218`）の現状を確認
3. TASK-SW-STRUCT-001 の成果物として `structurePlan` の内容（`purpose: options.description`）を確認
4. 既存テストファイルの関連テストケースを確認

### Task 1: 問題特定と影響範囲調査

1. `void structurePlan;`（`:126`）の削除影響を確認
2. SKILL.md 生成コード（`:173-218`）の `plan` オブジェクト構造と `structurePlan` の型定義の差異を確認
3. `generateSkillMd` が必要とする `StructurePlanJson` → `plan` の変換仕様を確認
4. `structurePlan` が null の場合のフォールバック要件を確認

### Task 2: 受入条件の策定

1. 修正後の SKILL.md 生成フローの仕様を整理
2. null フォールバック要件を明確化（`ensureSkillMdExists` への委譲）
3. 既存テスト（collaborative / orchestrate モード）への影響を評価
4. 受入条件を5件策定

## 受入条件

| ID   | 条件                                                                                            |
| ---- | ----------------------------------------------------------------------------------------------- |
| AC-1 | `:126` の `void structurePlan` が削除されている                                                 |
| AC-2 | SKILL.md 生成の `plan` オブジェクトが `structurePlan` の内容を使用している                      |
| AC-3 | `structurePlan` が null の場合のフォールバック処理がある                                        |
| AC-4 | 既存の collaborative / orchestrate モードのテストが全てパスし続ける                             |
| AC-5 | create モードで生成された SKILL.md が `structurePlan` の `purpose` / `skillName` を反映している |

## 参照資料

- `apps/desktop/src/main/services/skill/SkillCreatorService.ts` — 実装対象（`:126`、`:173-218`）
- `docs/30-workflows/skill-create-flow-gaps/00-task-spec-design-docs/phase-1-analysis.md` — 問題背景分析
- `docs/30-workflows/skill-create-flow-gaps/00-task-spec-design-docs/phase-2-solution.md` — 解決策設計
- `docs/30-workflows/p01-par-STRUCT-001/` — depends_on タスク仕様書

## 統合テスト連携

- 本タスクは `SkillCreatorService` 内部の接続実装であり、`createSkill()` の公開シグネチャは変更しない
- IPC/Preload 層への影響はない
- `generateSkillMd` メソッドの実装により `generate_skill_md.js` スクリプトが呼び出されるようになる

## 成果物

| 成果物                             | パス                                                 |
| ---------------------------------- | ---------------------------------------------------- |
| TASK-SW-STRUCT-002-requirements.md | `outputs/phase-1/TASK-SW-STRUCT-002-requirements.md` |

## 完了条件

- [ ] 問題の根本原因（`void structurePlan;` プレースホルダーによる未接続）が特定されている
- [ ] 受入条件（AC-1〜AC-5）が全件策定されている
- [ ] TASK-SW-STRUCT-001 の完了を前提とする依存関係が明記されている
- [ ] `generateSkillMd` の設計要件（null フォールバック含む）が整理されている

## タスク100%実行確認【必須】

- [ ] Step 0（P50チェック）を実行し、現状コードを確認した
- [ ] Task 1（問題特定と影響範囲調査）を100%実行した
- [ ] Task 2（受入条件の策定）を100%実行した
- [ ] 成果物（TASK-SW-STRUCT-002-requirements.md）が生成されている
- [ ] artifacts.json が更新されている

## 次 Phase

→ [Phase 2: 設計](./phase-2-design.md)
