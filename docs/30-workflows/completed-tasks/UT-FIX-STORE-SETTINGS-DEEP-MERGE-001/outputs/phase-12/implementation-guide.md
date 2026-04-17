# 実装ガイド: settings:update ハンドラのディープマージ対応

## Part 1: タスク概要

### 問題点

`settings:update` IPC ハンドラが `{ ...current, ...updates }` シャローマージのみ対応していた。
将来ネストされた設定オブジェクト（`theme.color`, `notification.enabled` 等）が追加された際に、
同一親キー配下の他フィールドが消失するバグが顕在化するリスクがあった。

### 解決策

`deepMerge<T>` 関数を `storeHandlers.ts` 内プライベート関数として実装し、
`settings:update` ハンドラの 1 行を置き換えた。

### 実装ファイル

- **変更**: `apps/desktop/src/main/ipc/storeHandlers.ts`（`deepMerge` 関数追加・ハンドラ修正）
- **変更**: `apps/desktop/src/main/ipc/storeHandlers.test.ts`（TC-01〜TC-12 テスト追加）

---

## Part 2: 技術詳細

### deepMerge 関数の使用方法

```typescript
// 変更前（シャローマージ）
getStore().set(USER_SETTINGS_STORE_KEY, { ...current, ...updates });

// 変更後（ディープマージ）
getStore().set(USER_SETTINGS_STORE_KEY, deepMerge(current, updates));
```

### 型シグネチャ

```typescript
function deepMerge<T extends Record<string, unknown>>(
  base: T,
  override: Partial<T>,
): T;
```

### マージルール

| override 値の型      | base 値の型              | 動作                    |
| -------------------- | ------------------------ | ----------------------- |
| `undefined`          | 任意                     | 省略（base 値を維持）   |
| `null`               | 任意                     | 上書き（`null` を設定） |
| 配列                 | 任意                     | 上書き（マージしない）  |
| プレーンオブジェクト | プレーンオブジェクト     | 再帰マージ              |
| プレーンオブジェクト | 配列・null・プリミティブ | 上書き                  |
| プリミティブ         | 任意                     | 上書き                  |

### 型安全性の注意点

- `T extends Record<string, unknown>` 制約により、任意の設定型に適用可能
- 再帰呼び出し時は `as Record<string, unknown>` キャストが必要（型が `unknown` に落ちるため）
- `any` 型は不使用（TypeScript strict モード準拠）

### 入力安全性

- `settings:update` は plain object 以外の payload を validation error で拒否する
- `__proto__` / `constructor` / `prototype` は無視して prototype pollution を防ぐ
- 既存値が plain object でない場合は `{}` として扱い、安全に deepMerge する

---

## 視覚証跡

UI/UX 変更なしのため Phase 11 スクリーンショット不要
