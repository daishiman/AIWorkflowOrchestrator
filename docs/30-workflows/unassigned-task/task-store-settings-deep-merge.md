# UT-FIX-STORE-SETTINGS-DEEP-MERGE-001 - タスク指示書

## メタ情報

```yaml
issue_number: 2197
```

| 項目         | 内容                                                       |
| ------------ | ---------------------------------------------------------- |
| タスクID     | UT-FIX-STORE-SETTINGS-DEEP-MERGE-001                       |
| タスク名     | settings:update ハンドラのディープマージ対応               |
| 分類         | 改善                                                       |
| 対象機能     | IPC storeHandlers / settings:update                        |
| 優先度       | 低                                                         |
| 見積もり規模 | 小規模                                                     |
| ステータス   | 未実施                                                     |
| 発見元       | UT-FIX-IPC-MAIN-HANDLER-IMPL-001 Phase 12 スキルFBレポート |
| 発見日       | 2026-04-15                                                 |

## 苦戦箇所記録

`settings:update` IPC ハンドラ実装時に「現時点で要件なし」としてシャローマージのみ実装した。

- **型制約**: `UserSettings` が `Record<string, unknown>` のため、ネスト構造が実行時まで不明
  → ディープマージの適用範囲を静的に定義できない
- **スコープ判断**: Phase 5実装時にディープマージは「将来拡張」と分類して対象外にした
- **発覚タイミング**: Phase 12 スキルフィードバックレポートの「改善余地」で記録
- **リスク**: 設定画面でネストされた設定項目（例: テーマ設定、通知設定）を追加した際に
  シャローマージによるフィールド消失バグが顕在化する

> 同様の状況（IPC経由のオブジェクト更新）では、設計フェーズ（Phase 2）で
> 「シャロー or ディープ」を明示的に決定しておくと実装時の揺れを防げる。
> `Record<string, unknown>` 型は柔軟性があるが、マージ戦略の設計が曖昧になりがち。

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`UT-FIX-IPC-MAIN-HANDLER-IMPL-001` で `settings:update` IPC ハンドラを実装したが、
現実装はシャローマージのみ対応。

```typescript
// 現在の実装（storeHandlers.ts）
const currentSettings = store.get("userSettings") ?? {};
const updated = { ...currentSettings, ...payload }; // shallow merge のみ
store.set("userSettings", updated);
```

### 1.2 問題点・課題

ネストされた設定オブジェクトを部分更新すると、同じ親キー配下の
他フィールドが消失する。

```typescript
// 問題の再現例
// 現在の設定
currentSettings = { theme: { color: "dark", size: "medium" }, lang: "ja" };

// 部分更新（color のみ変更したい）
updatePayload = { theme: { color: "light" } };

// シャローマージ結果（意図と異なる）
result = { theme: { color: "light" }, lang: "ja" };
// theme.size が消える!

// 期待する結果（ディープマージ）
expected = { theme: { color: "light", size: "medium" }, lang: "ja" };
```

### 1.3 放置した場合の影響

現時点では `UserSettings` にネスト構造がないため実害なし。
ただし将来ネストされた設定項目（通知設定、テーマ設定等）が追加されると
データ消失バグの原因になる。

---

## 2. 何を達成するか（What）

### 2.1 目的

`settings:update` ハンドラをディープマージ対応にし、
ネストされた設定の部分更新を安全に行えるようにする。

### 2.2 最終ゴール

`settings:update` IPCで送信したペイロードが、既存設定の
ネストフィールドを保持したままマージされる。

### 2.3 スコープ

#### 含むもの

- `apps/desktop/src/main/ipc/storeHandlers.ts` の `settings:update` ハンドラ修正
- ディープマージ関数の実装またはライブラリ使用
- 対応するテストケースの追加（ネストオブジェクト部分更新パターン）

#### 含まないもの

- `UserSettings` 型スキーマの大幅変更
- 既存設定データのマイグレーション処理
- 設定UIの変更

### 2.4 成果物

- `storeHandlers.ts` 修正（deepMerge対応）
- `storeHandlers.test.ts` にネスト更新テスト追加

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `UT-FIX-IPC-MAIN-HANDLER-IMPL-001` 完了済み
- `apps/desktop/src/main/ipc/storeHandlers.ts` に `settings:update` ハンドラが存在

### 3.2 依存タスク

なし

### 3.3 必要な知識

- TypeScriptの再帰型（`Record<string, unknown>` のディープマージ）
- Electron `electron-store` の get/set API

### 3.4 推奨アプローチ

**オプションA（最小依存）**: 再帰マージ関数を `storeHandlers.ts` 内に実装

```typescript
function deepMerge<T extends Record<string, unknown>>(
  base: T,
  override: Partial<T>,
): T {
  const result = { ...base };
  for (const key of Object.keys(override) as (keyof T)[]) {
    const overrideVal = override[key];
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

**オプションB（lodash依存）**: `lodash.merge` を使用（既にプロジェクトで使用中の場合）

### 3.5 注意点

- 配列フィールドは上書き（マージしない）とする
- `null` 値は上書き扱い（`undefined` は省略扱い）
- 既存テストがすべてPASSすることを確認してから追加テストを書く

---

## 4. 実行手順

### Phase 1: 実装

対象ファイル: `apps/desktop/src/main/ipc/storeHandlers.ts`

1. `deepMerge` ユーティリティ関数を追加（または import）
2. `settings:update` ハンドラの `{ ...currentSettings, ...payload }` を
   `deepMerge(currentSettings, payload)` に置き換え

### Phase 2: テスト追加

対象ファイル: `apps/desktop/src/main/ipc/__tests__/storeHandlers.test.ts`

追加テストケース:

- ネストオブジェクトの部分更新でフィールドが保持される
- トップレベルフィールドの上書きは従来通り動作する
- 配列フィールドは上書き動作

### Phase 3: 確認

```bash
pnpm --filter @repo/desktop test:run -- apps/desktop/src/main/ipc/__tests__/storeHandlers.test.ts
pnpm --filter @repo/desktop typecheck
```

### 成果物

- `storeHandlers.ts` 修正（`deepMerge` 対応）
- テストケース追加
