# カバレッジレポート

## 実行コマンド

- pnpm --filter @repo/desktop exec vitest run ... --coverage.enabled

## 結果

| 対象                              | Statements | Branches | Functions | Lines  |
| --------------------------------- | ---------- | -------- | --------- | ------ |
| Task scope 全体                   | 86.02%     | 83.33%   | 85.71%    | 86.02% |
| skillLifecycleJourney.ts          | 100%       | 100%     | 100%      | 100%   |
| shouldResetUnauthenticatedView.ts | 100%       | 100%     | 100%      | 100%   |
| SkillCenterView/index.tsx         | 78.82%     | 73.91%   | 50%       | 78.82% |

## 補足

- App.tsx は repo の coverage exclude に含まれているため集計外。ただし alias 正規化は typecheck と targeted tests で間接確認した。
- SkillCenterView の未到達は loading / error / detail panel / delete dialog 系であり、Task01 の変更中心ではない。
