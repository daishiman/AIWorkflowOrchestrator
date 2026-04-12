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

| 対象                                                                           | パターン                                                        | 確認 |
| ------------------------------------------------------------------------------ | --------------------------------------------------------------- | ---- | --- | --- | --- | ---------- |
| 定数（例: `WORKFLOW_MANIFEST_SCHEMA_VERSION`、`SKILL_CREATOR_ENGINE_VERSION`） | UPPER_SNAKE_CASE                                                | ✅   |
| 関数                                                                           | camelCase                                                       | ✅   |
|                                                                                |                                                                 |      |     |     |     | Stash base |
| 観点                                                                           | 結果                                                            |
| ----------------------------------------------                                 | --------------------------------------------------------------- |
| `selectedHealthStatus` の導出                                                  | `selectedProviderId` と `llmHealthStatus` から導出              |
| `buildMainlineExecutionAccessState()` の受け口                                 | `healthPolicy?: HealthPolicy` を受け取れる                      |
| `resolveHealthPolicy` の export                                                | `packages/shared/src/types/index.ts` から barrel export 済み    |
| `apiKeyDegraded` の扱い                                                        | hook 内の独自算出は削除対象、shared 側の型/関数では継続利用あり |

---

| 対象                                                                           | パターン         | 確認 |
| ------------------------------------------------------------------------------ | ---------------- | ---- |
| 定数（例: `WORKFLOW_MANIFEST_SCHEMA_VERSION`、`SKILL_CREATOR_ENGINE_VERSION`） | UPPER_SNAKE_CASE | ✅   |
| 関数                                                                           | camelCase        | ✅   |

## 機能要件

| ID                           | 要件                                                                            |
| ---------------------------- | ------------------------------------------------------------------------------- | -------------------------- | --- | --- | --- | ---------- |
| FR-1                         | `SkillCategory` の全5値に対応する日本語ラベルを定数として定義する               |
| FR-2                         | `SKILL_CATEGORY_LABELS` 定数をエクスポートする                                  |
| FR-3                         | `getSkillCategoryLabel(category: SkillCategory): string` 関数をエクスポートする |
| FR-4                         | `Record<SkillCategory, string>` 型により型網羅性を保証する                      |
|                              |                                                                                 |                            |     |     |     | Stash base |
| HealthPolicyInput フィールド | マッピング元                                                                    | 変換方法                   |
| ---------------------------- | ------------------------------                                                  | -------------------------- |
| `connectionStatus`           | `selectedHealthStatus?.status`                                                  | `?? "disconnected"` で補完 |
| `isApiKeyValid`              | `credentials.apiKeyValid`                                                       | そのまま渡す               |
| `apiKeyDegraded`             | 独自算出ロジックの代替                                                          | `false` を渡す             |
| `isRateLimited`              | hook 内に該当変数なし                                                           | `false` を渡す             |
| `lastHealthCheck`            | `selectedHealthStatus`                                                          | `?? null` で補完           |

---

| ID   | 要件                                                                            |
| ---- | ------------------------------------------------------------------------------- |
| FR-1 | `SkillCategory` の全5値に対応する日本語ラベルを定数として定義する               |
| FR-2 | `SKILL_CATEGORY_LABELS` 定数をエクスポートする                                  |
| FR-3 | `getSkillCategoryLabel(category: SkillCategory): string` 関数をエクスポートする |
| FR-4 | `Record<SkillCategory, string>` 型により型網羅性を保証する                      |

## マッピング定義

| SkillCategory          | 日本語ラベル                                                                 | 文字数                                                                                                        |
| ---------------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | --- | --- | --- | ---------- |
| `automation`           | 自動化                                                                       | 3                                                                                                             |
| `external-integration` | 外部連携                                                                     | 4                                                                                                             |
| `data-analysis`        | データ分析                                                                   | 5                                                                                                             |
| `code-support`         | コードサポート                                                               | 7                                                                                                             |
| `other`                | その他                                                                       | 3                                                                                                             |
|                        |                                                                              |                                                                                                               |     |     |     | Stash base |
| AC                     | 内容                                                                         | 確認方法                                                                                                      |
| ----                   | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| AC-1                   | `resolveHealthPolicy()` が `useMainlineExecutionAccess` 内で呼び出されている | hook で `resolveHealthPolicy` の import と呼び出しを確認                                                      |
| AC-2                   | `buildMainlineExecutionAccessState()` に `healthPolicy` が渡されている       | hook の呼び出し引数を確認                                                                                     |
| AC-3                   | `apiKeyDegraded` 独自算出ロジックが削除されている                            | hook 内の `const apiKeyDegraded = ...` が存在しないことを確認                                                 |
| AC-4                   | `@repo/shared/types` 経由でインポートしている                                | import 文を確認                                                                                               |
| AC-5                   | 既存ユニットテストが PASS する                                               | `pnpm --filter @repo/desktop exec vitest run src/renderer/hooks/__tests__/useMainlineExecutionAccess.test.ts` |
| AC-6                   | TypeScript 型チェックが PASS する                                            | `pnpm --filter @repo/shared typecheck` / `pnpm --filter @repo/desktop typecheck`                              |

---

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
