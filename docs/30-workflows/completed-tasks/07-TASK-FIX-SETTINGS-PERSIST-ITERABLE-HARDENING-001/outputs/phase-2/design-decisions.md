# Phase 2: 設計判断書

> タスク: TASK-FIX-SETTINGS-PERSIST-ITERABLE-HARDENING-001
> 作成日: 2026-03-07
> 採用案: 案C（フィールド単位正規化 + 復旧）

---

## DD-01: expandedFolders getItem ガード

### 対象箇所

- `apps/desktop/src/renderer/store/index.ts` L80-89 `customStorage.getItem`

### 現状の問題

```typescript
// L86-88: parsed.state.expandedFolders が配列でない場合（例: null, number, string）、
// new Set() に非iterable を渡すと TypeError が発生して Store 全体の hydrate が失敗する
if (parsed.state?.expandedFolders) {
  parsed.state.expandedFolders = new Set(parsed.state.expandedFolders);
}
```

### 設計判断

`parsed.state.expandedFolders` が `Array.isArray()` を満たす場合のみ `new Set()` に変換する。それ以外の値（`null`, `undefined`, `number`, `string`, `object`）は空の `new Set()` にフォールバックする。

### 修正方針

```typescript
if (parsed.state) {
  const raw = parsed.state.expandedFolders;
  if (Array.isArray(raw)) {
    // 要素レベルでも string のみをフィルタリング
    parsed.state.expandedFolders = new Set(
      raw.filter((v: unknown) => typeof v === "string"),
    );
  } else {
    if (raw !== undefined && raw !== null) {
      console.warn(
        "[customStorage] expandedFolders is not an array, resetting to empty Set:",
        typeof raw,
      );
    }
    parsed.state.expandedFolders = new Set<string>();
  }
}
```

### 復旧方針

- 非配列値は破棄し、空 Set で復旧する（データ損失は許容: フォルダ展開状態はユーザーが再操作すれば復元可能な一時的UI状態）
- 配列内の非 string 要素もフィルタリングで除外する

### 診断ログ

- `console.warn` で破損検出時に型情報を出力する
- 正常パス（配列の場合）ではログを出力しない

### テスト方針

- `localStorage` に非配列値（`null`, `42`, `"string"`, `{}`）をセットした状態で `getItem` を呼び、空 Set が返ることを検証
- 配列に非 string 要素が混在するケース（`[1, "folder-a", null]`）で string のみがフィルタされることを検証
- 正常配列（`["folder-a", "folder-b"]`）で正しく Set 変換されることを検証

---

## DD-02: expandedFolders setItem ガード

### 対象箇所

- `apps/desktop/src/renderer/store/index.ts` L91-107 `customStorage.setItem`

### 現状の問題

```typescript
// L100-103: expandedFolders が Set でない場合、Array.from() が TypeError を投げる
expandedFolders: Array.from(
  ((value as Record<string, unknown>).state as Record<string, unknown>)
    .expandedFolders as Set<string>,  // as Set<string> は実行時に保証されない
),
```

### 設計判断

`expandedFolders` の実行時の型を段階的にチェックする:

1. `Set` インスタンス -> `Array.from()` で配列化
2. `Array.isArray()` -> そのまま使用
3. それ以外 -> 空配列 `[]` にフォールバック

### 修正方針

```typescript
const stateObj = (value as Record<string, unknown>).state as Record<
  string,
  unknown
>;
const folders = stateObj?.expandedFolders;

let serializedFolders: string[];
if (folders instanceof Set) {
  serializedFolders = Array.from(folders);
} else if (Array.isArray(folders)) {
  serializedFolders = folders.filter((v: unknown) => typeof v === "string");
} else {
  if (folders !== undefined && folders !== null) {
    console.warn(
      "[customStorage] expandedFolders is not Set or Array on setItem, using empty array:",
      typeof folders,
    );
  }
  serializedFolders = [];
}
```

### 復旧方針

- 非 Set / 非配列の値は空配列として永続化する
- 次回 getItem 時に空 Set として読み込まれ、正常状態に復帰する

### 診断ログ

- `console.warn` で非 Set / 非配列の検出時に型情報を出力する

### テスト方針

- `expandedFolders` が `Set`, `Array`, `null`, `number`, `undefined` の各ケースで setItem を呼び、localStorage に正しい JSON が保存されることを検証
- Set -> Array -> Set のラウンドトリップが正常に動作することを検証

---

## DD-03: viewHistory spread ガード

### 対象箇所

- `apps/desktop/src/renderer/store/slices/navigationSlice.ts` L35-38 `setCurrentView`

### 現状の問題

```typescript
// L37: state.viewHistory が配列でない場合、spread 演算子が TypeError を投げる
viewHistory: [...state.viewHistory, view],
```

`viewHistory` は `partialize` で persist 対象外だが、hydrate 時に他フィールドの破損で Store 状態が不整合になるリスクがある。また、外部からの `setState` による直接上書きや、将来の partialize 変更で persist 対象になる可能性もある。

### 設計判断

`Array.isArray(state.viewHistory)` で配列かチェックし、配列でなければ `[view]` にフォールバック（現在のビューのみの新規履歴として復旧）。

### 修正方針

```typescript
setCurrentView: (view) => {
  const current = get().currentView;
  if (current === view) return;

  set((state) => ({
    currentView: view,
    viewHistory: Array.isArray(state.viewHistory)
      ? [...state.viewHistory, view]
      : [view],
  }));
},
```

### 復旧方針

- 破損した viewHistory は `[view]`（新規ナビゲーション先のみ）で再構築する
- 履歴データは失われるが、アプリの動作継続を優先する

### 診断ログ

- navigationSlice 内では `console.warn` を出力しない（Store アクション内でのログは頻度が高くなるリスクがあるため）
- 代わりにテストで破損検出の動作を検証する

### テスト方針

- `viewHistory` を `null`, `undefined`, `42`, `"string"` に手動設定した状態で `setCurrentView` を呼び、crash せず `[view]` にフォールバックされることを検証
- 正常な配列状態では従来通りの追記動作を確認

---

## DD-04: goBack ガード

### 対象箇所

- `apps/desktop/src/renderer/store/slices/navigationSlice.ts` L41-52 `goBack`

### 現状の問題

```typescript
// L42-43: viewHistory が配列でない場合、.length アクセスや .slice() が TypeError を投げる
const history = get().viewHistory;
if (history.length <= 1) return;
```

### 設計判断

`Array.isArray(history)` チェックを追加し、配列でなければ早期リターンする。

### 修正方針

```typescript
goBack: () => {
  const history = get().viewHistory;
  if (!Array.isArray(history) || history.length <= 1) return;

  const newHistory = history.slice(0, -1);
  const previousView = newHistory[newHistory.length - 1];

  set({
    currentView: previousView,
    viewHistory: newHistory,
  });
},
```

### 復旧方針

- 破損時は「戻れない」状態として扱い、何も操作しない（現在のビューを維持）
- DD-03 の setCurrentView で次のナビゲーション時に viewHistory が正常な配列に復帰するため、自律的復旧が期待できる

### 診断ログ

- なし（DD-03 と同じ理由: Store アクション内での高頻度ログ回避）

### テスト方針

- `viewHistory` を非配列値に設定した状態で `goBack()` を呼び、crash せず現在のビューが維持されることを検証

---

## DD-05: canGoBack ガード

### 対象箇所

- `apps/desktop/src/renderer/store/slices/navigationSlice.ts` L54-56 `canGoBack`
- `apps/desktop/src/renderer/store/index.ts` L228-229 `useCanGoBack` セレクタ

### 現状の問題

```typescript
// navigationSlice.ts L55: viewHistory が配列でない場合 .length が TypeError
return get().viewHistory.length > 1;

// store/index.ts L229: 同様の問題
export const useCanGoBack = () =>
  useAppStore((state) => state.viewHistory.length > 1);
```

### 設計判断

両箇所で `Array.isArray` チェックを追加する。

### 修正方針

```typescript
// navigationSlice.ts
canGoBack: () => {
  const history = get().viewHistory;
  return Array.isArray(history) && history.length > 1;
},

// store/index.ts
export const useCanGoBack = () =>
  useAppStore((state) => Array.isArray(state.viewHistory) && state.viewHistory.length > 1);
```

### 復旧方針

- 破損時は `false` を返す（「戻れない」状態として安全に扱う）

### 診断ログ

- なし（セレクタはレンダーごとに呼ばれるため、ログ出力は不適切）

### テスト方針

- `viewHistory` を非配列値に設定した状態で `canGoBack()` を呼び、`false` が返ることを検証
- `useCanGoBack` セレクタについてはストア統合テストで同様の検証を実施

---

## 設計判断サマリ

| ID    | 対象                         | ガード種別     | フォールバック値  | ログ出力 |
| ----- | ---------------------------- | -------------- | ----------------- | -------- |
| DD-01 | customStorage.getItem        | Array.isArray  | new Set<string>() | warn     |
| DD-02 | customStorage.setItem        | instanceof Set | []                | warn     |
| DD-03 | setCurrentView (viewHistory) | Array.isArray  | [view]            | なし     |
| DD-04 | goBack (viewHistory)         | Array.isArray  | 早期リターン      | なし     |
| DD-05 | canGoBack (viewHistory)      | Array.isArray  | false             | なし     |
