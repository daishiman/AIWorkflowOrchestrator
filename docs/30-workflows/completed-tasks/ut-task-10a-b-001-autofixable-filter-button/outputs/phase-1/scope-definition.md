# Phase 1 スコープ定義: 自動修正可能フィルタボタン

## メタ情報

| 項目     | 内容              |
| -------- | ----------------- |
| タスクID | UT-TASK-10A-B-001 |
| Phase    | 1                 |
| 作成日   | 2026-03-05        |

## スコープ内

| 区分       | 対象                                                                              |
| ---------- | --------------------------------------------------------------------------------- |
| UI         | `apps/desktop/src/renderer/components/skill/SuggestionList.tsx`                   |
| 状態管理   | `apps/desktop/src/renderer/components/skill/hooks/useSkillAnalysis.ts`            |
| 統合       | `apps/desktop/src/renderer/components/skill/SkillAnalysisView.tsx`                |
| 単体テスト | `apps/desktop/src/renderer/components/skill/__tests__/SuggestionList.test.tsx`    |
| 統合テスト | `apps/desktop/src/renderer/components/skill/__tests__/SkillAnalysisView.test.tsx` |

## スコープ外

| 区分                 | 対象                                           |
| -------------------- | ---------------------------------------------- |
| Main Process         | `SkillAnalyzer` / `SkillImprover` ロジック変更 |
| IPC契約              | `channels.ts` へのチャネル追加/変更            |
| autoFixable 判定仕様 | 提案生成時の判定ロジック                       |

## 制約

- `fireEvent` ベースの既存テスト方針を維持する（happy-dom運用）。
- 既存UIの表示順（優先度グループ）を変更しない。
- 既存「選択を適用」「全自動改善」ボタン契約を変更しない。

## 完了判定

- 追加機能が `SuggestionList` と `useSkillAnalysis` の責務境界を維持して実装できる見込みがあること。
- Phase 2 で必要な設計入力（UI、状態、型境界）が過不足なく整理されていること。
