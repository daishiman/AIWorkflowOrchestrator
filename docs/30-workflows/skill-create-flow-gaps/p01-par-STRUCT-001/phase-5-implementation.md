# Phase 5: 実装

## メタ情報

| 項目       | 内容                |
| ---------- | ------------------- |
| Phase      | 5                   |
| Phase名    | 実装                |
| 対象機能   | TASK-SW-STRUCT-001  |
| 前提Phase  | Phase 4: テスト作成 |
| 次Phase    | Phase 6: テスト拡充 |
| ステータス | 未実施              |
| 作成日     | 2026-04-15          |

## 目的

Phase 4 で設計したテストが Red になることを確認した後、`runCreateWorkflow` の出力仕様を修正する。
`purpose` / `agents` フィールドを意味的に正しい値に変更し、テストを Green にする。

## 実行タスク

### Task 1: TDD Red フェーズ確認

実装前に TC-01〜TC-04 が失敗することを確認する。

```bash
pnpm --filter @repo/desktop test -- --testPathPattern="SkillCreatorService" --grep "structurePlan"
```

全テストが失敗（Red）であることを確認してから実装に進む。

### Task 2: runCreateWorkflow 実装修正

**修正対象ファイル**: `apps/desktop/src/main/services/skill/SkillCreatorService.ts`

**修正内容**:

行 630-653 の `runCreateWorkflow` を以下に変更する。

```typescript
/**
 * createモードのワークフロー実行
 * AC-1: purpose に options.description を使用（エージェントプロンプト文字列でない）
 * AC-2: agents にエージェント名リストを設定
 * AC-3: features は空配列（LLM統合は別タスク）
 * AC-4: エラー時は null を返しフォールバック
 * NOTE: LLM による purpose 抽出は別タスクで実装する
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

### Task 3: TDD Green フェーズ確認

実装後に TC-01〜TC-04 が成功することを確認する。

```bash
# 新規テスト Green 確認
pnpm --filter @repo/desktop test -- --testPathPattern="SkillCreatorService" --grep "structurePlan"

# 回帰テスト Green 確認
pnpm --filter @repo/desktop test -- --testPathPattern="SkillCreatorService" --grep "collaborative"

# 全テスト実行
pnpm --filter @repo/desktop test -- --testPathPattern="SkillCreatorService"
```

### Task 4: 型チェック確認

```bash
pnpm --filter @repo/desktop typecheck
```

### Task 5: lint 確認

```bash
pnpm --filter @repo/desktop lint
```

## 実装上の注意事項

- `extractPurposeAgent` / `planStructureAgent` 変数への代入が不要になるため削除する
- `loadAgent` 呼び出し自体も不要になるため削除する（方針B、Phase 2 設計参照）
- `try/catch` 構造は将来の処理追加に備えて維持する
- コメントに「LLM統合は別タスク」と明記する

## 参照資料

- `outputs/phase-4/test-design.md` — テストケース（TC-01〜TC-04）
- `outputs/phase-2/design.md` — 設計書

## 統合テスト連携

- `createSkill()` のシグネチャは変更しないため IPC/Preload 層への影響なし
- 実装後に TASK-SW-STRUCT-002 の接続可否を確認する

## 成果物

| 成果物                 | パス                                     |
| ---------------------- | ---------------------------------------- |
| implementation-plan.md | `outputs/phase-5/implementation-plan.md` |

## 完了条件

- [ ] TC-01〜TC-04 が Red であることを確認した（実装前）
- [ ] `runCreateWorkflow` の修正が完了している
- [ ] TC-01〜TC-04 が Green になっている（実装後）
- [ ] TC-R01〜TC-R02（回帰テスト）が Green を維持している
- [ ] `pnpm --filter @repo/desktop typecheck` が 0 エラー
- [ ] `pnpm --filter @repo/desktop lint` が 0 エラー

## タスク100%実行確認【必須】

- [ ] Task 1（TDD Red フェーズ確認）を100%実行した
- [ ] Task 2（runCreateWorkflow 実装修正）を100%実行した
- [ ] Task 3（TDD Green フェーズ確認）を100%実行した
- [ ] Task 4（型チェック確認）を100%実行した
- [ ] Task 5（lint 確認）を100%実行した
- [ ] 成果物（implementation-plan.md）が生成されている
- [ ] artifacts.json が更新されている

## 次 Phase

→ [Phase 6: テスト拡充](./phase-6-test-expansion.md)
