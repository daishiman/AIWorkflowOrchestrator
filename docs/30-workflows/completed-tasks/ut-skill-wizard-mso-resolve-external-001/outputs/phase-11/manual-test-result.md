# Phase 11 手動テスト結果 - UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001

## タスク分類

NON_VISUAL。Renderer 内部ロジック変更が主だが、Q5 の visual regression 確認として補助スクリーンショットを取得した。

## 実施結果

| 確認項目                                                  | 方法                  | 結果 |
| --------------------------------------------------------- | --------------------- | ---- |
| `resolveExternalIntegration` が `string[]` を受け取ること | Vitest                | PASS |
| 複数ツールの並列取得とマージ                              | Vitest                | PASS |
| 単一ツールの後方互換                                      | Vitest                | PASS |
| 空配列・未対応ツールのフォールバック                      | Vitest                | PASS |
| `smartDefaults.tool` のフォールバック維持                 | コードレビュー        | PASS |
| `ConversationRoundStep.tsx` の主ツールバッジ削除          | コードレビュー        | PASS |
| `M-01` TODO コメント削除                                  | grep                  | PASS |
| Q5 single select のバッジなし表示                         | Playwright screenshot | PASS |
| Q5 multi select のバッジなし表示                          | Playwright screenshot | PASS |

## 実行コマンド

```bash
pnpm --filter @repo/desktop exec vitest run \
  src/renderer/components/skill/__tests__/SkillCreateWizard.test.tsx \
  src/renderer/components/skill/__tests__/resolveExternalIntegration.test.ts
```

## 補足

- `resolveExternalIntegration` は canonical label 正規化後に `Promise.all` で並列取得する
- `extractExternalToolNames` は Q5 が空のときだけ `smartDefaults.tool` を使う
- `ConversationRoundStep.tsx` からは `MAIN_TOOL_BADGE_ENABLED` と関連 JSX が削除済み
- スクリーンショットは `outputs/phase-11/screenshots/q5-single-select-no-badge.png` と `outputs/phase-11/screenshots/q5-multi-select-no-badge.png` に保存済み
