# Phase 4 テスト仕様: 自動修正可能フィルタボタン

## メタ情報

| 項目     | 内容              |
| -------- | ----------------- |
| タスクID | UT-TASK-10A-B-001 |
| Phase    | 4                 |
| 作成日   | 2026-03-05        |

## テスト対象

- `SuggestionList.test.tsx`（UI単体）
- `SkillAnalysisView.test.tsx`（UI+Hook連携）

## Red化対象

| テストID | 目的                             | 対象ファイル               |
| -------- | -------------------------------- | -------------------------- |
| TC-4-01  | 一括選択ボタン表示               | SuggestionList.test.tsx    |
| TC-4-02  | 一括選択コールバック発火         | SuggestionList.test.tsx    |
| TC-4-03  | auto-fixable 0件で disabled      | SuggestionList.test.tsx    |
| TC-4-04  | 一括選択で auto-fixable のみ選択 | SkillAnalysisView.test.tsx |
| TC-4-05  | 一括選択後の適用API引数検証      | SkillAnalysisView.test.tsx |
| TC-4-06  | auto-fixable 0件で disabled      | SkillAnalysisView.test.tsx |

## Red実行コマンド

```bash
pnpm --filter @repo/desktop exec vitest run \
  src/renderer/components/skill/__tests__/SuggestionList.test.tsx \
  src/renderer/components/skill/__tests__/SkillAnalysisView.test.tsx
```

## Red結果サマリー

- 結果: **FAIL（想定どおり）**
- 主因: `自動修正可能を選択` ボタン未実装
- 失敗件数: 5
- 成功件数: 46

## 主な失敗ログ（要約）

- `Unable to find an accessible element with the role "button" and name "自動修正可能を選択"`
- 失敗テスト:
  - `SuggestionList > 自動修正可能を選択ボタンを表示する`
  - `SuggestionList > 自動修正可能を選択ボタン押下で onSelectAutoFixable を呼ぶ`
  - `SuggestionList > autoFixable が0件のとき自動修正可能ボタンは disabled`
  - `SkillAnalysisView > 自動修正可能を選択で autoFixable のみ一括選択できる`
  - `SkillAnalysisView > autoFixable が0件のとき一括選択ボタンは disabled`

## 引き継ぎ（Phase 5 へ）

- `SuggestionList` にボタン本体を実装する。
- `useSkillAnalysis` に一括選択ハンドラを実装する。
- `SkillAnalysisView` で結線して Green 化する。
