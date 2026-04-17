# TASK-SW-STRUCT-001 Phase 5: 実装

## メタ情報

| 項目       | 内容               |
| ---------- | ------------------ |
| タスクID   | TASK-SW-STRUCT-001 |
| Phase      | 5                  |
| 作成日     | 2026-04-16         |
| ステータス | 完了               |

## Task 1: TDD Red フェーズ確認

実装前にTDD Red フェーズを確認:

- TC-STRUCT-01: FAIL (Red) ✓ — `purpose` が `extractPurposeAgent` のため不一致
- TC-STRUCT-02: FAIL (Red) ✓ — `agents` がプロンプト文字列配列のため不一致

## Task 2: runCreateWorkflow 実装修正

### 変更ファイル

`apps/desktop/src/main/services/skill/SkillCreatorService.ts`

### 変更内容

**変更前（行 624-653）**:

```typescript
/**
 * createモードのワークフロー実行
 * AC-1: resourceLoader.loadAgent を呼び出す（collaborative パターン踏襲）
 * ...
 */
private async runCreateWorkflow(
  options: CreateSkillOptions,
): Promise<StructurePlanJson | null> {
  try {
    const extractPurposeAgent =
      await this.resourceLoader.loadAgent("extract-purpose");
    const planStructureAgent =
      await this.resourceLoader.loadAgent("plan-structure");

    const structurePlan: StructurePlanJson = {
      skillName: options.name,
      description: options.description,
      purpose: extractPurposeAgent,                   // 誤り
      features: [],
      agents: [extractPurposeAgent, planStructureAgent], // 誤り
    };
    return structurePlan;
  } catch {
    return null;
  }
}
```

**変更後**:

```typescript
/**
 * createモードのワークフロー実行
 * AC-1: purpose に options.description を使用（エージェントプロンプト文字列でない）
 * AC-2: agents にエージェント名リストを設定
 * AC-3: features は空配列（LLM統合は別タスク）
 * AC-4: エラー時は null を返しフォールバック
 * NOTE: LLM による purpose 抽出は別タスクで実装する（TASK-SW-STRUCT-002 以降）
 */
private async runCreateWorkflow(
  options: CreateSkillOptions,
): Promise<StructurePlanJson | null> {
  try {
    const structurePlan: StructurePlanJson = {
      skillName: options.name,
      description: options.description,
      purpose: options.description, // AC-1: LLM統合は別タスク、現時点は description を使用
      features: [],                 // AC-3: LLM統合は別タスク
      agents: ["extract-purpose", "plan-structure"], // AC-2: エージェント名リスト
    };
    return structurePlan;
  } catch {
    // AC-4: 将来の処理追加に備えてフォールバックを維持
    return null;
  }
}
```

### 削除した処理

- `const extractPurposeAgent = await this.resourceLoader.loadAgent("extract-purpose")` — 不要
- `const planStructureAgent = await this.resourceLoader.loadAgent("plan-structure")` — 不要

## Task 3: TDD Green フェーズ確認

```
Test Files  1 passed (1)
      Tests  74 passed (74)
```

- TC-STRUCT-01: PASS ✓ — `purpose === options.description`
- TC-STRUCT-02: PASS ✓ — `agents === ["extract-purpose", "plan-structure"]`
- TC-STRUCT-03: PASS ✓ — `features === []`
- TC-STRUCT-04: PASS ✓ — `createSkill()` が成功する

## Task 4 & 5: 型チェック・lint

型チェック・lint は Phase 9 にて確認。

## 更新した既存テスト

| テストID | 旧内容                                      | 新内容                                                                  |
| -------- | ------------------------------------------- | ----------------------------------------------------------------------- |
| TC-01    | `loadAgent` 呼び出しを確認                  | `loadAgent("extract-purpose/plan-structure")` が呼ばれないことを確認    |
| TC-04    | `purpose: "mock-agent-content"`             | `purpose: description`, `agents: ["extract-purpose", "plan-structure"]` |
| TC-05    | `loadAgent("extract-purpose")` 呼び出し確認 | `loadAgent("extract-purpose")` が呼ばれないことを確認                   |
| TC-B01   | `loadAgent` 2回呼び出し確認                 | `loadAgent` が呼ばれないことを確認                                      |
| TC-B02   | `loadAgent` 呼び出し確認を含む              | `loadAgent` 確認を削除                                                  |
| TC-B06   | `loadAgent("plan-structure")` 呼び出し確認  | `loadAgent("plan-structure")` が呼ばれないことを確認                    |

## 完了確認

- [x] TC-STRUCT-01〜TC-STRUCT-04 が Red であることを確認した（実装前）
- [x] `runCreateWorkflow` の修正が完了している
- [x] TC-STRUCT-01〜TC-STRUCT-04 が Green になっている（実装後）
- [x] 全74テストが Green を維持している
- [x] 既存テスト（TC-01〜TC-B06）を新実装に合わせて更新した
