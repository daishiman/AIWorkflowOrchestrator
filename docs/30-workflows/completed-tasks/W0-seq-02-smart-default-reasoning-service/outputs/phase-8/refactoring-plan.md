# リファクタリング計画・実施記録

## タスク情報

| 項目     | 内容                                           |
| -------- | ---------------------------------------------- |
| タスクID | UT-SKILL-WIZARD-W0-SMART-DEFAULT-REASONING-001 |
| Phase    | 8                                              |

## 実施内容

### 1. 推論ルールの定数化

```typescript
const TOOL_KEYWORDS: Array<{
  keyword: string;
  tool: NonNullable<SmartDefaultResult["tool"]>;
}> = [
  { keyword: "Slack", tool: "slack" },
  { keyword: "GitHub", tool: "github" },
  { keyword: "Notion", tool: "notion" },
];

const SCHEDULED_PATTERN = /毎日|毎週|定期|スケジュール/;
const REALTIME_PATTERN = /リアルタイム|即座|すぐに/;
```

新しいツール対応追加は `TOOL_KEYWORDS` 配列への1行追加で完結する。

### 2. 推論ロジックの関数分割

- `inferTool(purpose)` — ツール推論
- `inferTiming(purpose)` — タイミング推論
- `inferFormat(category)` — フォーマット推論

各関数は `{ result, log | null }` を返し、公開 API `inferSmartDefaults` がまとめる構造。

### 3. リファクタ後テスト確認

| 項目       | 結果                     |
| ---------- | ------------------------ |
| Tests      | 32 passed / 0 failed ✅  |
| TypeScript | エラー 0件 ✅            |
| ESLint     | エラー 0件 ✅            |
| Coverage   | 100% 維持（計測済み） ✅ |
