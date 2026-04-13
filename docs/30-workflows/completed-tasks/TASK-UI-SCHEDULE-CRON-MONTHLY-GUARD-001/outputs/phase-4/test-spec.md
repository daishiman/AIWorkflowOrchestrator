# テスト仕様書 - TASK-UI-SCHEDULE-CRON-MONTHLY-GUARD-001

## 追加テストケース仕様

| TC番号 | 説明                        | 入力                                                     | 期待値         | AC対応 | Phase 4 時点状態 |
| ------ | --------------------------- | -------------------------------------------------------- | -------------- | ------ | ---------------- |
| TC-11  | dayOfMonth=0（下限未満）    | `{frequency:"monthly", minute:0, hour:9, dayOfMonth:0}`  | `""`           | AC-1   | Red              |
| TC-12  | dayOfMonth=32（上限超過）   | `{frequency:"monthly", minute:0, hour:9, dayOfMonth:32}` | `""`           | AC-2   | Red              |
| TC-13  | dayOfMonth=-1（負値）       | `{frequency:"monthly", minute:0, hour:9, dayOfMonth:-1}` | `""`           | AC-3   | Red              |
| TC-14  | dayOfMonth=1（境界最小値）  | `{frequency:"monthly", minute:0, hour:9, dayOfMonth:1}`  | `"0 9 1 * *"`  | AC-4   | Green            |
| TC-15  | dayOfMonth=31（境界最大値） | `{frequency:"monthly", minute:0, hour:9, dayOfMonth:31}` | `"0 9 31 * *"` | AC-5   | Green            |

## 実装場所

`apps/desktop/src/__tests__/utils/cronConverter.edge.test.ts` 末尾

```typescript
describe("visualConfigToCron - monthly dayOfMonth ガード", () => {
  // TC-11〜TC-15
});
```

## 既存テスト件数

- Phase 4 追加前: 13 件
- Phase 4 追加後: 18 件（+5 件）
