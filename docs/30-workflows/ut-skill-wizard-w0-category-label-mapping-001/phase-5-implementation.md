# Phase 5: 実装

## メタ情報

| 項目       | 内容                                          |
| ---------- | --------------------------------------------- |
| Phase      | 5                                             |
| タスクID   | UT-SKILL-WIZARD-W0-CATEGORY-LABEL-MAPPING-001 |
| 機能名     | skill-wizard-category-display-label-mapping   |
| 前提Phase  | Phase 4                                       |
| 後続Phase  | Phase 6                                       |
| 作成日     | 2026-04-11                                    |
| ステータス | pending                                       |

## 目的

`packages/shared/src/types/skillCreator.ts` に `SKILL_CATEGORY_LABELS` 定数と
`getSkillCategoryLabel()` 関数を実装し、TC-01〜TC-09が全PASS することを確認する。

## 実行タスク

- 既存テスト回帰確認（実装前のbaseline確認）
- `SKILL_CATEGORY_LABELS` 定数の実装
- `getSkillCategoryLabel()` 関数の実装
- Green確認: テストが全PASS することを確認
- 型チェック・lint確認

## 参照資料

| 資料名          | パス                                                              | 用途                 |
| --------------- | ----------------------------------------------------------------- | -------------------- |
| Phase 2 設計書  | `outputs/phase-2/design.md`                                       | インターフェース参照 |
| Phase 4 テスト  | `packages/shared/src/types/__tests__/skillCreator-wizard.test.ts` | テストケース参照     |
| skillCreator.ts | `packages/shared/src/types/skillCreator.ts`                       | 実装先ファイル       |

## 実行手順

### 0. 既存テスト回帰確認（baseline確認）【必須】

```bash
# 変更前の既存テストを実行してbaseline確認
pnpm --filter @repo/shared exec vitest run src/types/__tests__/skillCreator-wizard.test.ts
# 期待: 既存テストのみがPASSすること（新規テストはFAIL）
```

### 1. 実装ファイルリスト【`[Feedback RT-03]` 対応】

| 操作 | ファイルパス                                | 変更内容                                                                  |
| ---- | ------------------------------------------- | ------------------------------------------------------------------------- |
| 修正 | `packages/shared/src/types/skillCreator.ts` | `SKILL_CATEGORY_LABELS` 定数と `getSkillCategoryLabel()` 関数を末尾に追加 |

### 2. 実装内容

`packages/shared/src/types/skillCreator.ts` の `SkillCategory` 型定義（L948〜L953）の後に追加:

```typescript
/**
 * SkillCategory の UI表示用日本語ラベルマッピング。
 * Record<SkillCategory, string> 型により、SkillCategory に新値が追加された場合に
 * TypeScript の型チェックで未定義ラベルを検出できる（AC-3）。
 */
export const SKILL_CATEGORY_LABELS: Record<SkillCategory, string> = {
  automation: "自動化",
  "external-integration": "外部連携",
  "data-analysis": "データ分析",
  "code-support": "コードサポート",
  other: "その他",
} as const;

/**
 * SkillCategory に対応する UI表示用日本語ラベルを返す。
 * @param category - SkillCategory 型の値
 * @returns 対応する日本語ラベル文字列
 */
export function getSkillCategoryLabel(category: SkillCategory): string {
  return SKILL_CATEGORY_LABELS[category];
}
```

### 3. Green確認コマンド

```bash
# テスト実行（TC-01〜TC-09が全PASSすること）
pnpm --filter @repo/shared exec vitest run src/types/__tests__/skillCreator-wizard.test.ts

# 型チェック
pnpm --filter @repo/shared typecheck

# lint
pnpm --filter @repo/shared lint
```

### 4. canUseTool 適用範囲と制約【`[Feedback P0-09-U1-2]`】

本タスクはIPC通信・SDK callback・`improve()`フローを含まない純粋な定数/関数実装タスクのため、
`canUseTool` / SDK callback の適用対象外である。

### 5. 既存テスト回帰確認（実装後）

```bash
# 全ユニットテスト実行（既存テストへの悪影響なし確認）
pnpm --filter @repo/shared test
```

## 統合テスト連携【必須】

| 判定項目           | 基準    | 結果    |
| ------------------ | ------- | ------- |
| TC-01〜TC-09全PASS | PASS    | pending |
| 既存テスト回帰なし | 全PASS  | pending |
| 型チェック         | PASS    | pending |
| lint               | 0 error | pending |

## 成果物

| 成果物     | パス                                        | 説明                                              |
| ---------- | ------------------------------------------- | ------------------------------------------------- |
| 実装コード | `packages/shared/src/types/skillCreator.ts` | SKILL_CATEGORY_LABELS + getSkillCategoryLabel追加 |

## 完了条件

- [ ] 既存テスト回帰確認（baseline）実施済み
- [ ] `SKILL_CATEGORY_LABELS` 定数が実装済み（5件全値）
- [ ] `getSkillCategoryLabel()` 関数が実装済み
- [ ] TC-01〜TC-09が全PASS（Green確認）
- [ ] 既存テストへの悪影響なし
- [ ] 型チェック（`pnpm typecheck`）がPASS
- [ ] lint がエラーなし
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. baseline確認（既存テスト全PASS確認）
2. `SKILL_CATEGORY_LABELS` 実装
3. `getSkillCategoryLabel()` 実装
4. Green確認（TC-01〜TC-09 PASS）
5. 型チェック・lint確認
6. 既存テスト回帰確認

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 6: テスト拡充
