# Phase 7 カバレッジサマリー

実施日: 2026-03-20

## 最終カバレッジ測定コマンド

```bash
cd apps/desktop
pnpm exec vitest run --coverage \
  --coverage.include="src/renderer/components/skill/SkillAnalysisView.tsx" \
  --coverage.include="src/renderer/views/AgentView/index.tsx" \
  src/renderer/components/skill/__tests__/SkillAnalysisView.navigation.test.tsx \
  src/renderer/views/AgentView/__tests__/AgentView.cta.test.tsx \
  src/renderer/__tests__/App.renderView.viewtype.test.tsx \
  src/renderer/components/skill/__tests__/SkillAnalysisView.test.tsx \
  src/renderer/views/AgentView/__tests__/AgentView.test.tsx \
  src/renderer/views/AgentView/__tests__/AgentView.layout.test.tsx \
  src/renderer/views/AgentView/__tests__/AgentView.coverage.test.tsx
```

## テスト結果

Test Files: 7 passed (7)
Tests: 146 passed (146)
Duration: 約 6 秒

## ファイル別カバレッジ

### SkillAnalysisView.tsx

| 指標       | 数値    | 基準 | 判定 |
| ---------- | ------- | ---- | ---- |
| Statements | 99.06%  | 80%  | PASS |
| Branch     | 92.85%  | 60%  | PASS |
| Functions  | 100.00% | 80%  | PASS |
| Lines      | 99.06%  | 80%  | PASS |

未カバー行: L128（マイナー分岐、影響軽微）

### AgentView/index.tsx

| 指標       | 数値   | 基準 | 判定 |
| ---------- | ------ | ---- | ---- |
| Statements | 95.77% | 80%  | PASS |
| Branch     | 87.28% | 60%  | PASS |
| Functions  | 84.61% | 80%  | PASS |
| Lines      | 95.77% | 80%  | PASS |

未カバー行: 409, 411, 462-463（v8 が内部関数として独立カウントしているインライン Arrow Function）

### App.tsx

vitest.config.ts の `coverage.exclude` リストに `src/renderer/App.tsx` が含まれているため
カバレッジ計測対象外（設定による除外）。

## 集計（対象ファイル全体）

| 指標       | 数値   | 基準 | 判定 |
| ---------- | ------ | ---- | ---- |
| Statements | 96.31% | 80%  | PASS |
| Branch     | 87.87% | 60%  | PASS |
| Functions  | 85.71% | 80%  | PASS |
| Lines      | 96.31% | 80%  | PASS |

## Phase 6 前後の比較

| 指標       | Phase 6 前 | Phase 6 後 | 改善幅  |
| ---------- | ---------- | ---------- | ------- |
| Statements | 89.41%     | 96.31%     | +6.90%  |
| Branch     | 81.89%     | 87.87%     | +5.98%  |
| Functions  | 64.28%     | 85.71%     | +21.43% |
| Lines      | 89.41%     | 96.31%     | +6.90%  |

Function Coverage が最も大きく改善（+21.43%）。
