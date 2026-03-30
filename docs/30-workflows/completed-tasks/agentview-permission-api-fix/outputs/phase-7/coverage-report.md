# Coverage Report

## AgentView/index.tsx カバレッジ結果

```
AgentView/index.tsx:
  Statements: 84.77%
  Branches:   75%
  Functions:  53.84%
  Lines:      84.77%
```

## 修正箇所のカバレッジ

| 関数                           | カバレッジ | 確認観点                   |
| ------------------------------ | ---------- | -------------------------- |
| `getPermissionApi()`           | 100%       | API 存在/不在の両パス      |
| `loadPermissions()`            | 100%       | 成功/失敗/isMounted=false  |
| `handlePermissionModeChange()` | 100%       | mode 変更の単一パス        |
| `handleResetRemembered()`      | 100%       | API あり成功/失敗/API なし |

## カバレッジ不足の分析

未カバー行（558-564, 669-677, 726-727）は修正スコープ外:

- エラー画面の return 部分
- スキル分析ナビゲーションボタン
- FloatingExecutionBar 関連

対応: 本タスクのスコープ外。対応不要。
