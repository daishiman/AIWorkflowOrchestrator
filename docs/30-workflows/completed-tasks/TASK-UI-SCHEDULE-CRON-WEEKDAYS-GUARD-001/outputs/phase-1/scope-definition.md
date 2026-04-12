# Phase 1: スコープ定義書

## タスクID: TASK-UI-SCHEDULE-CRON-WEEKDAYS-GUARD-001

## 作成日: 2026-04-12

## 変更スコープ

### コード変更ファイル

| ファイル                                           | 変更種別 | 変更内容                                                       |
| -------------------------------------------------- | -------- | -------------------------------------------------------------- |
| `apps/desktop/src/renderer/utils/cronConverter.ts` | 修正     | `visualConfigToCron` 関数に空weekdaysガード処理追加、JSDoc更新 |

### テスト変更ファイル

| ファイル                                                      | 変更種別 | 変更内容                                           |
| ------------------------------------------------------------- | -------- | -------------------------------------------------- |
| `apps/desktop/src/__tests__/utils/cronConverter.edge.test.ts` | 修正     | 既存の壊れたテスト期待値を更新 + TC-01〜TC-10 追加 |

### スコープ外（変更しない）

- Renderer 側の他コンポーネント（呼び出し元）
- IPC 関連ファイル（純粋関数のため影響なし）
- `cronConverter.ts` の `visualConfigToCron` 以外の関数
- `cronConverter.test.ts`（既存テストはそのまま維持）

## 問題の根本原因

```
入力: visualConfigToCron({ frequency: "weekly", weekdays: [], hour: 9, minute: 0 })
現在の出力: "0 9 * * "  （曜日フィールドが空 → 不正なcron式）
期待する出力: ""          （空文字を返す）

原因: case "weekly" 内で weekdays.length === 0 の早期リターンが未実装
```

## 空文字退避方針

```typescript
// 修正前
case "weekly": {
  const sorted = [...new Set(weekdays)].sort((a, b) => a - b);
  return `${minute} ${hour} * * ${sorted.join(",")}`;
}

// 修正後
case "weekly": {
  if (weekdays.length === 0) {
    return "";  // ← ガード処理追加
  }
  const sorted = [...new Set(weekdays)].sort((a, b) => a - b);
  return `${minute} ${hour} * * ${sorted.join(",")}`;
}
```

## 注意事項

既存の `cronConverter.edge.test.ts` にあるテストが **バグ動作を期待している**:

```typescript
expect(result).toBe("0 9 * * "); // バグ: 不正なcron式を期待
```

このテストも `""` を期待するよう更新が必要。
