# Phase 5: 実装サマリー

## 実装結果

**ステータス**: GREEN（全 72 テスト PASS）

## 新規作成ファイル

| ファイル                                              | 役割                                                                             |
| ----------------------------------------------------- | -------------------------------------------------------------------------------- |
| `packages/shared/src/types/skill-wizard-label-map.ts` | `SEMANTIC_LABEL_MAP`, `resolveSemanticLabel`, `QuestionSemanticLabelMap` 定義    |
| `packages/shared/src/types/index.ts`                  | `QuestionSemanticLabelMap` などを `@repo/shared` / `@repo/shared/types` に再公開 |
| `packages/shared/tsup.config.ts`                      | `skill-wizard-label-map.ts` を build entry に追加                                |

## 変更ファイル

| ファイル                                                                                     | 変更内容                                                                                                      |
| -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `packages/shared/package.json`                                                               | `exports`・`typesVersions` に `./types/skillWizard` subpath 追加                                              |
| `packages/shared/src/types/index.ts`                                                         | `skill-wizard-label-map.ts` の export を barrel に追加                                                        |
| `apps/desktop/src/renderer/components/skill/wizard/__tests__/ConversationRoundStep.test.tsx` | `Markdown` / `JSON` / `Jira` / `notion` の回帰テストを追加                                                    |
| `apps/desktop/tsconfig.json`                                                                 | `paths` に `@repo/shared/types/skillWizard` → ソースファイルパス 追加                                         |
| `apps/desktop/vitest.config.ts`                                                              | `resolve.alias` に `@repo/shared/types/skillWizard` 追加（value import 解決用）                               |
| `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx`                | `import` 追加・`createQuestionAnswer` に `questionId` パラメータ追加・`applySmartDefaults` を `export` に変更 |

## テスト結果

```
Test Files  1 passed (1)
Tests  72 passed (72)
Duration  10.07s
```

TC-01〜TC-12（新規）+ 既存 60 件 = 72 件 全 PASS。

## 解決した技術的課題

### vitest での value import 解決

`vite-tsconfig-paths` は `import type` の型専用 import では機能するが、
value import（`SEMANTIC_LABEL_MAP`, `resolveSemanticLabel`）では
`@repo/shared` のシンボリックリンク経由の package.json `exports` が優先され、
dist ファイル未存在のため解決失敗。

**解決**: `vitest.config.ts` の `resolve.alias` に直接ソースファイルパスを追加。
これは Vite の内部解決よりも優先度が高い。

### notion 特別ケースの扱い

`resolveSemanticLabel` 単体では `freeText: "Notion"` を設定できないため、
`createQuestionAnswer` 内で `normalizedKey === "notion"` の先行チェックとして存続。
SEMANTIC_LABEL_MAP には `notion: "その他"` エントリを保持（フォールバック保険）。

### root barrel 再公開

`packages/shared/src/types/index.ts` に `skill-wizard-label-map.ts` の export を追加し、
`QuestionSemanticLabelMap` / `SEMANTIC_LABEL_MAP` / `resolveSemanticLabel()` を
`@repo/shared` 直下の barrel からも参照できるようにした。
direct subpath `@repo/shared/types/skillWizard` は既存利用箇所との互換性のため残した。

### build entry 同期

`packages/shared/tsup.config.ts` に `src/types/skill-wizard-label-map.ts` を追加し、
`@repo/shared/types/skillWizard` の dist 出力と typecheck / build の parity を維持した。
