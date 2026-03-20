# Phase 7 未カバー行一覧

## SkillAnalysisView.tsx

- L128: 改善結果のマイナー分岐。主要導線と AC には影響しない。

## AgentView/index.tsx

- L409, L411: internal helper branch
- L462-463: clipboard 早期 return

## 補足

- `App.tsx` は vitest coverage exclude 設定により対象外。
- 詳細数値は `coverage-summary.md` を正本とする。
