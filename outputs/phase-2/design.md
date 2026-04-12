# Phase 2: 設計書 — UT-SKILL-WIZARD-W0-CATEGORY-LABEL-MAPPING-001

## 配置場所の決定

**方針**: `packages/shared/src/types/skillCreator.ts` の末尾に追加する。

**理由**:

- `SkillCategory` 型と同一ファイルに配置することで、型変更時に定数更新の漏れを防ぐ
- 新規ファイル作成は不要（small スケールタスク）
- `@repo/shared/types/skillCreator` subpath export に閉じる（root barrel 触らない）

## インターフェース設計

### 定数設計

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
```

### 関数設計

```typescript
/**
 * SkillCategory に対応する日本語表示ラベルを返す。
 * @param category - SkillCategory 型の値
 * @returns 日本語ラベル文字列
 */
export function getSkillCategoryLabel(category: SkillCategory): string {
  return SKILL_CATEGORY_LABELS[category];
}
```

## 型安全性設計

| 観点         | 設計方針                                                           |
| ------------ | ------------------------------------------------------------------ |
| 型網羅性     | `Record<SkillCategory, string>` により全値のラベルが必須（AC-3）   |
| immutability | `as const` アサーションで定数値の変更を防ぐ                        |
| エクスポート | Named export（`export const` / `export function`）で外部参照を明示 |

## 設計判断記録

| 判断事項                 | 採用方針                    | 理由                                          |
| ------------------------ | --------------------------- | --------------------------------------------- |
| 配置ファイル             | 既存 `skillCreator.ts` 末尾 | SkillCategory型と同居・管理コスト最小         |
| 関数 vs 定数直接参照     | 両方提供                    | 関数はAPI抽象化・定数は型安全な網羅チェック用 |
| `as const` アサーション  | 使用する                    | ラベル文字列の誤変更防止                      |
| ハイフン含む値のキー記法 | `"external-integration"`    | TypeScriptのquoted key記法で対応              |

## 検証マトリクス

| テスト対象     | テストコマンド                                                                               |
| -------------- | -------------------------------------------------------------------------------------------- |
| ユニットテスト | `pnpm --filter @repo/shared exec vitest run src/types/__tests__/skillCreator-wizard.test.ts` |
| 型チェック     | `pnpm --filter @repo/shared typecheck`                                                       |
| lint           | `pnpm --filter @repo/shared lint`                                                            |
