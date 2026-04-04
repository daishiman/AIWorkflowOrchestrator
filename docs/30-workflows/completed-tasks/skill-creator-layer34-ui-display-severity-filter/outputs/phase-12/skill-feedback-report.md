# Phase 12: スキルフィードバック — UT-SDK-L34-UI-DISPLAY-SEVERITY-FILTER-001

## 学び

1. `filterChecksBySeverity` をコンポーネント外の純粋関数として定義したことで、useMemo の依存配列が最小化でき、テスト容易性も向上した
2. `filteredChecksByLayer` を `checksByLayer` の下流に配置するデータフロー設計により、既存の Layer grouping ロジックへの変更ゼロでフィルタを実装できた
3. `severityTotalCounts` をフィルタ前の `checksByLayer` から計算することで、件数バッジが常に「全体件数」を示す直感的な UI になった
4. `activeWorkflowId` 変更時の `useEffect` でフィルタリセットを実装することで、reverify 維持と workflow 切替リセットの両立が自然に実現できた
5. visual capture 用 harness は test harness と同じ最小状態に揃える必要がある。`workflowSnapshot` を部分的に返すと nested field 未設定でレンダーが壊れるため、スクリーンショット用 mock は「返すなら完全形、返さないなら未定義」に統一した方が安全

## next action

特になし（本タスクスコープで完結）。
