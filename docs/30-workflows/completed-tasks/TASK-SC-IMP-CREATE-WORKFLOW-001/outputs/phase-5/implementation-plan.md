# Phase 5: 実装計画 - タスク仕様書

## メタ情報

| 項目       | 内容                            |
| ---------- | ------------------------------- |
| Phase      | 5                               |
| Phase名    | 実装計画                        |
| 前提Phase  | Phase 4: テスト設計             |
| 後続Phase  | -（実装着手はタスクA完了後）    |
| ステータス | 完了                            |
| 作成日     | 2026-04-14                      |
| タスクID   | TASK-SC-IMP-CREATE-WORKFLOW-001 |

---

## 目的

タスクA（TASK-SC-FIX-GENERATE-SKILL-MD-001）完了後に着手する実装の手順を詳細化する。
`runCreateWorkflow` の空実装を修正し、AC-1〜AC-5 を全て満たす実装ステップを定義する。

---

## 前提条件

**この Phase の実装作業は TASK-SC-FIX-GENERATE-SKILL-MD-001 の完了後に着手すること。**

タスクA完了確認:

- [ ] `generate_skill_md.js` が `--plan <json>` / `--output <path>` 引数を受け付けるように修正済み
- [ ] タスクA のテストが全件 Green
- [ ] タスクA の PR がマージ済み（またはブランチがマージ可能状態）

---

## 実装ステップ

### ステップ 1: StructurePlanJson 型定義の追加

**対象ファイル**: `apps/desktop/src/main/services/skill/SkillCreatorService.ts`

**変更内容**: import 文の直後（クラス定義の前）に型定義を追加する

```typescript
// SkillCreatorService.ts — クラス定義の直前に追加
/**
 * create モードで生成するスキル構造計画 JSON
 * タスクA（TASK-SC-FIX-GENERATE-SKILL-MD-001）の generate_skill_md.js --plan 引数に渡す
 */
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

**確認**: TypeScript コンパイルエラーが出ないことを確認

---

### ステップ 2: runCreateWorkflow のシグネチャ変更

**対象ファイル**: `apps/desktop/src/main/services/skill/SkillCreatorService.ts`（行 574）

**変更前**:

```typescript
private async runCreateWorkflow(options: CreateSkillOptions): Promise<void> {
  // リクエスト分析と生成
  void options; // unused warning回避
}
```

**変更後**:

```typescript
private async runCreateWorkflow(
  options: CreateSkillOptions,
): Promise<StructurePlanJson | null> {
  try {
    // AC-1: resourceLoader.loadAgent を呼び出す（collaborative パターン踏襲）
    const extractPurposeAgent =
      await this.resourceLoader.loadAgent("extract-purpose");

    // AC-4: options.description を使用（void options を削除）
    const planStructureAgent =
      await this.resourceLoader.loadAgent("plan-structure");

    // 構造計画 JSON を組み立て
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
    // AC-3: loadAgent 失敗時はフォールバック（null 返却）
    // createSkill() 後続処理を継続させる
    return null;
  }
}
```

---

### ステップ 3: createSkill() の case "create" 変更

**対象ファイル**: `apps/desktop/src/main/services/skill/SkillCreatorService.ts`（行 96-98）

**変更前**:

```typescript
case "create":
  await this.runCreateWorkflow(options);
  break;
```

**変更後**:

```typescript
let structurePlan: StructurePlanJson | null = null;

switch (options.mode) {
  case "create":
    structurePlan = await this.runCreateWorkflow(options);
    // AC-2: runCreateWorkflow 完了後、後続処理が正常に続く
    break;
  default:
    break;
}
```

**タスクA完了後の最終形**（ステップ 4 を参照）:

```typescript
let structurePlan: StructurePlanJson | null = null;

switch (options.mode) {
  case "create":
    structurePlan = await this.runCreateWorkflow(options);
    break;
  case "collaborative":
    await this.runCollaborativeWorkflow(options);
    break;
  default:
    break;
}

const generateResult = await this.generateSkillMd(skillDir, structurePlan);
```

---

### ステップ 4: generateSkillMd() への structurePlan 接続（タスクA完了後）

**前提**: タスクA で `generate_skill_md.js` が `--plan <json>` を受け付けるように修正済みであること

**対象ファイル**: `apps/desktop/src/main/services/skill/SkillCreatorService.ts`（generateSkillMd 呼び出し箇所）

**変更内容**: `generateSkillMd(skillDir, structurePlan)` のように明示引数で structurePlan を渡す

```typescript
// 1) createSkill() 側: local variable を明示引数で handoff
const generateResult = await this.generateSkillMd(skillDir, structurePlan);

// 2) generateSkillMd() 側: 受け取った引数だけで --plan を構成
private async generateSkillMd(
  skillDir: string,
  structurePlan: StructurePlanJson | null,
): Promise<void> {
  const generateArgs = ["--path", skillDir];
  if (structurePlan !== null) {
    generateArgs.push("--plan", JSON.stringify(structurePlan));
    generateArgs.push("--output", path.join(skillDir, "SKILL.md"));
  }

  const generateResult = await this.scriptExecutor.execute(
    "generate_skill_md.js",
    generateArgs,
  );
}
```

---

### ステップ 5: テストの追加

**対象ファイル**: `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.test.ts`

Phase 4 のテストコードスケルトン（TC-01〜TC-05）をそのまま追加する。
詳細は `outputs/phase-4/test-design.md` のスケルトンを参照。

---

### ステップ 6: 型チェックとテスト実行

```bash
# 1. TypeScript 型チェック
pnpm --filter @repo/desktop typecheck

# 2. TDD Red → Green の確認
pnpm --filter @repo/desktop test -- --testPathPattern="SkillCreatorService"

# 3. 回帰テスト確認（AC-5）
pnpm --filter @repo/desktop test -- --testPathPattern="SkillCreatorService" --grep "collaborative"

# 4. 全テスト実行
pnpm vitest run
```

---

## 実装チェックリスト

| ステップ | 内容                                        | 完了条件                                      |
| -------- | ------------------------------------------- | --------------------------------------------- |
| 1        | `StructurePlanJson` 型定義の追加            | 型エラーなし                                  |
| 2        | `runCreateWorkflow` シグネチャ変更・実装    | `void options` が削除され `null` 返却実装済み |
| 3        | `createSkill()` の `case "create":` 変更    | `structurePlan` の戻り値受け取り済み          |
| 4        | `generateSkillMd()` への structurePlan 接続 | タスクA完了後に実施                           |
| 5        | TC-01〜TC-05 テスト追加                     | 全テストケース Green                          |
| 6        | 型チェック・全テスト実行                    | エラーなし・回帰なし                          |

---

## タスクA完了後の接続確認事項

タスクA（TASK-SC-FIX-GENERATE-SKILL-MD-001）完了後、以下を確認して接続を完成させること:

1. `generate_skill_md.js` の `--plan` 引数の JSON スキーマを確認し、
   `StructurePlanJson` との整合性を確認する
2. `--output` 引数に渡すパス（`path.join(skillDir, "SKILL.md")`）が正しいことを確認する
3. ステップ 4 の実装を追加し、TC-02 のテストで end-to-end 動作を確認する
4. hidden-property を介した受け渡しが残っていないことを確認する（local variable + 明示引数に統一）

---

## 参照資料

| 参照資料                    | パス                                                                                   | 内容                           |
| --------------------------- | -------------------------------------------------------------------------------------- | ------------------------------ |
| SkillCreatorService.ts      | `apps/desktop/src/main/services/skill/SkillCreatorService.ts`                          | 実装対象（行 574-577 / 96-98） |
| SkillCreatorService.test.ts | `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.test.ts`           | テスト追加対象                 |
| Phase 2 設計書              | `outputs/phase-2/design.md`                                                            | 設計根拠                       |
| Phase 4 テスト設計          | `outputs/phase-4/test-design.md`                                                       | テストコードスケルトン         |
| タスクA仕様書               | `docs/30-workflows/skill-creator-workflow-fix-lane/TASK-SC-FIX-GENERATE-SKILL-MD-001/` | 先行タスク（接続先）           |

---

## 成果物

| 成果物                 | パス                                     | 内容                     |
| ---------------------- | ---------------------------------------- | ------------------------ |
| implementation-plan.md | `outputs/phase-5/implementation-plan.md` | 本ファイル（実装計画書） |

---

## 統合テスト連携

- 実装後の統合確認: `create` モードで `createSkill()` を呼び、SKILL.md が正しく生成されることを
  手動テスト（将来の Phase 11）で確認する
- タスクA接続後: `generate_skill_md.js` が `--plan` 引数の JSON を正しく処理し、
  完全な SKILL.md が出力されることを統合テストで確認する

---

## 完了条件

- [x] 実装ステップ 1〜3 の詳細が完成している（コードスニペット付き）
- [x] タスクA完了後に着手するステップ 4 が明確に定義されている
- [x] テスト追加ステップ（ステップ 5）が明確に定義されている
- [x] 型チェック・テスト実行コマンドが明記されている
- [x] タスクA完了後の接続確認事項が列挙されている

---

## Phase末端アクション【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 各タスクを100%完了し、完了を明記
- [x] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 4 が完了していること
- **後続**: TASK-SC-FIX-GENERATE-SKILL-MD-001 完了後、実装作業へ着手

---

## 次のアクション

1. TASK-SC-FIX-GENERATE-SKILL-MD-001（タスクA）の完了を待つ
2. タスクA完了確認後、本 Phase の実装チェックリストに従って実装を開始する
3. 実装完了後は通常の Phase 6（テスト拡充）〜 Phase 13（PR 作成）へ進む
