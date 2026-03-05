# Phase 5 状態遷移確認メモ

## 確認シナリオ

| シナリオ           | 期待結果                                | 確認方法                                                 | 結果 |
| ------------------ | --------------------------------------- | -------------------------------------------------------- | ---- |
| 混在提案で一括選択 | auto-fixable の index のみ selected     | `SkillAnalysisView.test.tsx`                             | PASS |
| 一括選択後に適用   | `applyImprovements` に true提案のみ渡る | `SkillAnalysisView.test.tsx`                             | PASS |
| auto-fixable 0件   | 一括選択ボタン disabled                 | `SuggestionList.test.tsx` / `SkillAnalysisView.test.tsx` | PASS |
| 個別選択回帰       | 既存トグル挙動を維持                    | 既存テスト                                               | PASS |

## 状態更新責務

- Set再構築ロジックは `useSkillAnalysis` に限定。
- `SuggestionList` はイベント通知のみ担当。
- `SkillAnalysisView` は結線のみ担当。
