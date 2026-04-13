# Phase 5: 実装サマリー

## 実装内容

### 1. InvalidConfigError クラス定義（cronConverter.ts 先頭に追加）

```typescript
export class InvalidConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidConfigError";
  }
}
```

### 2. visualConfigToCron() への weekdays=[] ガード追加

```typescript
case "weekly": {
  if (weekdays.length === 0) {
    throw new InvalidConfigError(
      "weekdays must not be empty when frequency is 'weekly'",
    );
  }
  const sorted = [...new Set(weekdays)].sort((a, b) => a - b);
  return `${minute} ${hour} * * ${sorted.join(",")}`;
}
```

### 3. JSDoc 更新

`@throws {InvalidConfigError}` を追加済み。

## テスト結果

- **Tests**: 12 passed / 12 total
- Red → Green 移行: 完了
- AC-01〜06: 全合格

## 受け入れ基準充足確認

| AC番号 | 結果 |
| ------ | ---- |
| AC-01  | ✅   |
| AC-02  | ✅   |
| AC-03  | ✅   |
| AC-04  | ✅   |
| AC-05  | ✅   |
| AC-06  | ✅   |
