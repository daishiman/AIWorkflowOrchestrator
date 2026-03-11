# Phase 2 成果物: subagent-plan

## チーム編成（関心ごと分離）

| SubAgent          | 責務                                       | 依存              | 並列可否               |
| ----------------- | ------------------------------------------ | ----------------- | ---------------------- |
| A: Spec Analyst   | task/workflow/system spec の照合、要件整合 | なし              | 直列起点               |
| B: Token Designer | token 契約値・alias 設計                   | A完了後           | Cと並列可              |
| C: Test Architect | token 契約テスト設計・監査戦略             | A完了後           | Bと並列可              |
| D: UI Auditor     | screenshot 計画・Apple視点の評価軸策定     | B/C完了後         | Phase 11 で並列可      |
| E: Spec Sync      | Phase 12 の system spec 同期・未タスク管理 | B/C/Dの成果を入力 | 並列可（編集対象分離） |

## 実行順序

1. A が仕様照合と境界を確定
2. B/C を並列で実行（token 契約とテスト戦略）
3. B/C の出力を A がレビューして Phase 3 判定
4. 実装後、D がスクリーンショットと視覚検証
5. E が system spec・LOGS・SKILL・未タスクを同期

## 競合回避ルール

- 同一ファイルを同時編集しない（`tokens.css` は B/C のみ）。
- system spec (`.claude/skills/...`) 更新は E が一括責任を持つ。
- 未タスク作成は E が `audit-unassigned-tasks` で最終検証する。

## 判定

- [x] 並列化可能区間を明確化
- [x] 依存順序を固定
