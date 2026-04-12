<<<<<<< Updated upstream

# Phase 1: 受け入れ基準

||||||| Stash base

# Phase 1: 受け入れ基準 — UT-SKILL-WIZARD-W0-CATEGORY-LABEL-MAPPING-001

=======

# 受け入れ基準 - TASK-UI-SCHEDULE-CRON-SEMANTIC-001

> > > > > > > Stashed changes

<<<<<<< Updated upstream
| AC# | 受け入れ基準 | 検証方法 |
| ----- | ---------------------------------------------------------- | -------------- |
| AC-01 | generationMode state が SkillCreateWizard.tsx に存在しない | コードレビュー |
| AC-02 | description / options state が存在しない | コードレビュー |
| AC-03 | template 条件分岐が全て除去されている | コードレビュー |
| AC-04 | STEPS = ["スキル情報入力", "詳細設定", "生成", "完了"] | ユニットテスト |
| AC-05 | inferSmartDefaults が purpose を小文字化して判定する | ユニットテスト |
| AC-06 | handleGenerate が二重呼び出しを防止する | ユニットテスト |
| AC-07 | Step 3 で skillPath が表示される | 統合テスト |
| AC-08 | handleRetry が formData を保持して Step 0 に戻る | 統合テスト |
| AC-09 | GenerateStep に generationMode prop が渡されない | コードレビュー |
| AC-10 | CompleteStep に onRetry が接続されている | 統合テスト |
||||||| Stash base

## 受け入れ基準一覧

| ID   | 受け入れ基準                                                                                                                                 | 検証方法                                                         |
| ---- | -------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| AC-1 | 全 `SkillCategory` 値（5件: automation / external-integration / data-analysis / code-support / other）に対応する日本語ラベルが定義されている | ユニットテスト TC-01〜TC-06                                      |
| AC-2 | `SKILL_CATEGORY_LABELS` 定数と `getSkillCategoryLabel()` 関数がエクスポートされ、UIコンポーネントから参照可能                                | `grep -n "export.*SKILL_CATEGORY_LABELS\|getSkillCategoryLabel"` |
| AC-3 | 新しい `SkillCategory` 値が追加された場合にTypeScriptの型チェックでラベル未定義を検出できる（`Record<SkillCategory, string>` 型を活用）      | `pnpm --filter @repo/shared typecheck`                           |

## 検証コマンド

```bash
# AC-1 / AC-2: テスト実行
pnpm --filter @repo/shared exec vitest run src/types/__tests__/skillCreator-wizard.test.ts

# AC-3: 型チェック
pnpm --filter @repo/shared typecheck
```

=======
| AC番号 | 基準 | 検証方法 | 優先度 |
| ------ | ---------------------------------------------------------------------------------------------- | ------------------------------------------ | ------ |
| AC-1 | `validateCronExpression("0 0 31 2 *", { semantic: true })` がエラー文字列（非 null）を返す | テスト TC-01 PASS | 最高 |
| AC-2 | `validateCronExpression("0 0 * * *", { semantic: true })` 等の正常ケースは引き続き null を返す | テスト TC-04 PASS | 高 |
| AC-3 | 既存テスト SCV-01〜SCV-12 が全件 PASS する | `pnpm test` 全件 PASS | 最高 |
| AC-4 | 意味論的不正ケースのテストが追加されカバレッジが向上している | テスト PASS + coverage Line≥90% Branch≥85% | 高 |
| AC-5 | `scheduleConfigValidator.ts` のJSDocが更新され semantic オプションの説明が含まれる | コードレビュー | 中 |

## Phase 4〜11 引き継ぎ事項

- `"0 0 31 2 *"` シナリオを Phase 4（テスト作成）のTDDケースとして予約
- ライブラリ評価計画（`cron-parser` 推奨）を Phase 2 設計のインプットとして提供
- NON_VISUAL 評価方針を Phase 11 に引き継ぐ（スクリーンショット不要・ロジックテストのみ）
  > > > > > > > Stashed changes
