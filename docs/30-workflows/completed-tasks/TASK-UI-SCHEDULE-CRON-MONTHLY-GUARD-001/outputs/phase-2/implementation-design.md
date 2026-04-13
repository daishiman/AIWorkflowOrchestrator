# ガード処理実装設計書 - TASK-UI-SCHEDULE-CRON-MONTHLY-GUARD-001

## 修正対象

`apps/desktop/src/renderer/utils/cronConverter.ts` - `monthly` 分岐

---

## 修正前

```typescript
case "monthly":
  return `${minute} ${hour} ${dayOfMonth} * *`;
```

## 修正後

```typescript
case "monthly": {
  if (!Number.isInteger(dayOfMonth) || dayOfMonth < 1 || dayOfMonth > 31) {
    return "";
  }
  return `${minute} ${hour} ${dayOfMonth} * *`;
}
```

---

## 設計根拠

### `Number.isInteger(dayOfMonth)` を先頭に置く理由

- `NaN`（非数値）や `15.5`（小数）を `< 1 || > 31` の比較式に到達する前にまとめて弾ける
- `NaN < 1` は `false` になるため、整数性チェックを先頭に置かないと `NaN` が漏れる
- 1つの条件式で「非整数・範囲外」を完全にカバーできる

### ブロック構文 `{}` を使用する理由

- `weekly` ガードとの対称性を保つ（同じ構造パターン）
- 複数の文を含む分岐では `{}` を使用する ESLint ルールに準拠
- 将来の条件追加時に見やすい

### `weekly` ガードとの対称性確認

```typescript
// weekly（実装済み）
case "weekly": {
  if ((weekdays ?? []).length === 0) {
    return "";
  }
  // ...
}

// monthly（今回追加）
case "monthly": {
  if (!Number.isInteger(dayOfMonth) || dayOfMonth < 1 || dayOfMonth > 31) {
    return "";
  }
  // ...
}
```

→ ブロック構文 + 早期リターンパターンで対称性が確保されている。
