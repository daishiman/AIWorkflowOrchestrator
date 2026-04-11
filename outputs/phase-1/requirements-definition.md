# Phase 1: 要件定義書 — UT-SKILL-WIZARD-W0-CATEGORY-LABEL-MAPPING-001

## タスク概要

`SkillCategory`（英語識別子）をUI表示用の日本語ラベルにマッピングする定数・関数を `packages/shared/src/types/skillCreator.ts` に追加する。

## P50チェック結果（既実装状態確認）

```
grep -n "SKILL_CATEGORY_LABELS\|getSkillCategoryLabel" packages/shared/src/types/skillCreator.ts
→ No matches found（未実装を確認）
```

**判定**: 重複実装なし。本タスクで新規実装する。

## SkillCategory型定義（現状確認）

```typescript
// packages/shared/src/types/skillCreator.ts L948-L953
export type SkillCategory =
  | "automation"
  | "external-integration"
  | "data-analysis"
  | "code-support"
  | "other";
```

5値が確認済み。

## 命名規則確認

| 対象                                                                           | パターン         | 確認 |
| ------------------------------------------------------------------------------ | ---------------- | ---- |
| 定数（例: `WORKFLOW_MANIFEST_SCHEMA_VERSION`、`SKILL_CREATOR_ENGINE_VERSION`） | UPPER_SNAKE_CASE | ✅   |
| 関数                                                                           | camelCase        | ✅   |

## 機能要件

| ID   | 要件                                                                            |
| ---- | ------------------------------------------------------------------------------- |
| FR-1 | `SkillCategory` の全5値に対応する日本語ラベルを定数として定義する               |
| FR-2 | `SKILL_CATEGORY_LABELS` 定数をエクスポートする                                  |
| FR-3 | `getSkillCategoryLabel(category: SkillCategory): string` 関数をエクスポートする |
| FR-4 | `Record<SkillCategory, string>` 型により型網羅性を保証する                      |

## マッピング定義

| SkillCategory          | 日本語ラベル   | 文字数 |
| ---------------------- | -------------- | ------ |
| `automation`           | 自動化         | 3      |
| `external-integration` | 外部連携       | 4      |
| `data-analysis`        | データ分析     | 5      |
| `code-support`         | コードサポート | 7      |
| `other`                | その他         | 3      |

## 非機能要件

- UIコンポーネントから参照可能なエクスポート
- `@repo/shared/types/skillCreator` subpath export に閉じる（root barrel に広げない）

## タスク分類

- 種別: **実装タスク / 非UIタスク / NON_VISUAL**
- スケール: small
- UI実装: なし（Phase 11は手動テスト中心）
