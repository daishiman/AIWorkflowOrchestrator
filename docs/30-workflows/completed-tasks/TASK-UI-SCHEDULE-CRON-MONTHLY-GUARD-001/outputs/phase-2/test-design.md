# テスト設計書 - TASK-UI-SCHEDULE-CRON-MONTHLY-GUARD-001

## 追加テストケース TC-11〜TC-15

| TC番号 | 入力                                 | 期待値         | 対応AC |
| ------ | ------------------------------------ | -------------- | ------ |
| TC-11  | `frequency="monthly", dayOfMonth=0`  | `""`           | AC-1   |
| TC-12  | `frequency="monthly", dayOfMonth=32` | `""`           | AC-2   |
| TC-13  | `frequency="monthly", dayOfMonth=-1` | `""`           | AC-3   |
| TC-14  | `frequency="monthly", dayOfMonth=1`  | `"0 9 1 * *"`  | AC-4   |
| TC-15  | `frequency="monthly", dayOfMonth=31` | `"0 9 31 * *"` | AC-5   |

---

## テストブロック設計

```typescript
describe("visualConfigToCron - monthly dayOfMonth ガード", () => {
  const baseConfig: VisualCronConfig = {
    frequency: "monthly",
    minute: 0,
    hour: 9,
    dayOfMonth: 1,
    weekdays: [],
  };

  it("TC-11: dayOfMonth=0 のとき空文字を返す (AC-1)", () => {
    const config = { ...baseConfig, dayOfMonth: 0 };
    expect(visualConfigToCron(config)).toBe("");
  });

  it("TC-12: dayOfMonth=32 のとき空文字を返す (AC-2)", () => {
    const config = { ...baseConfig, dayOfMonth: 32 };
    expect(visualConfigToCron(config)).toBe("");
  });

  it("TC-13: dayOfMonth=-1 のとき空文字を返す (AC-3)", () => {
    const config = { ...baseConfig, dayOfMonth: -1 };
    expect(visualConfigToCron(config)).toBe("");
  });

  it("TC-14: dayOfMonth=1 のとき正常なcron式を返す (AC-4)", () => {
    const config = { ...baseConfig, dayOfMonth: 1 };
    expect(visualConfigToCron(config)).toBe("0 9 1 * *");
  });

  it("TC-15: dayOfMonth=31 のとき正常なcron式を返す (AC-5)", () => {
    const config = { ...baseConfig, dayOfMonth: 31 };
    expect(visualConfigToCron(config)).toBe("0 9 31 * *");
  });
});
```

---

## 追加位置

- `apps/desktop/src/__tests__/utils/cronConverter.edge.test.ts` の末尾
- 既存の「テスト拡充」describe ブロックの後に追加

---

## TDD Red 状態の予測

- **TC-11〜TC-13**: ガード処理未実装のため Red（失敗）
  - 例: `dayOfMonth=0` → 現在 `"0 9 0 * *"` を返す（期待値は `""`）
- **TC-14〜TC-15**: 正常ケースのため Green（通過）の可能性あり
