# アーキテクチャ設計書: deepMerge 対応

## deepMerge 関数配置

- ファイル: `apps/desktop/src/main/ipc/storeHandlers.ts`
- スコープ: プライベート関数（export しない）
- 配置位置: `registerUserSettingsHandlers()` 関数定義の直前

## 実装設計

```typescript
function deepMerge<T extends Record<string, unknown>>(
  base: T,
  override: Partial<T>,
): T {
  const result = { ...base };
  for (const key of Object.keys(override) as (keyof T)[]) {
    const overrideVal = override[key];
    if (overrideVal === undefined) continue;
    const baseVal = base[key];
    if (
      overrideVal !== null &&
      typeof overrideVal === "object" &&
      !Array.isArray(overrideVal) &&
      baseVal !== null &&
      typeof baseVal === "object" &&
      !Array.isArray(baseVal)
    ) {
      result[key] = deepMerge(
        baseVal as Record<string, unknown>,
        overrideVal as Record<string, unknown>,
      ) as T[keyof T];
    } else {
      result[key] = overrideVal as T[keyof T];
    }
  }
  return result;
}
```

## ハンドラ変更（before/after）

**Before:**

```typescript
getStore().set(USER_SETTINGS_STORE_KEY, { ...current, ...updates });
```

**After:**

```typescript
getStore().set(USER_SETTINGS_STORE_KEY, deepMerge(current, updates));
```

## マージルール

| 値の型               | 基底値の型           | マージ動作          |
| -------------------- | -------------------- | ------------------- |
| プレーンオブジェクト | プレーンオブジェクト | 再帰マージ          |
| 配列                 | 任意                 | 上書き              |
| null                 | 任意                 | 上書き（null 設定） |
| undefined            | 任意                 | 省略（基底値維持）  |
| プリミティブ         | 任意                 | 上書き              |
