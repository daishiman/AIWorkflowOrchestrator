# HistorySearchView タイムライン再設計 実装ガイド

## Part 1: なぜ必要かと何をしたか

### なぜ必要か

旧 `HistorySearchView` は、記録を振り返る画面なのに「検索して絞ること」が主役になっていた。これは本棚を探す前に検索端末の前で立ち止まるような体験で、過去の流れを一目で見返しにくかった。

058c では、まず時間の流れを見せ、その上で必要なときだけ検索を使う方針へ変えた。たとえば学校の連絡帳を開くとき、先に日付順の記録を眺めてから必要な日だけ探すほうが自然、という感覚に近い。

### 何をしたか

- タイトルを `あなたの記録` に変更した
- filter と統計カードを外し、検索バーを補助操作へ下げた
- 履歴を日付グループ付きタイムラインへ変えた
- chat / file / skill を accordion で展開できるようにした
- `IntersectionObserver` で自動追補するようにした
- file card から editor を直接開けるようにした

## Part 2: 技術者向け実装詳細

### TypeScript 型定義

```typescript
type TimelineGroup = {
  label: string;
  items: HistoryItem[];
};

interface HistorySearchSliceState {
  query: string;
  hasFetchedHistory: boolean;
  isHistoryLoadingMore: boolean;
  expandedItemId: string | null;
}
```

### APIシグネチャ

- `history:search(args: { query?: string; filter?: HistorySearchFilter; limit?: number; offset?: number })`
- `history:get-stats()`
- `requestOpenFile(filePath: string)`

### 使用例

```ts
dispatch(searchHistory({ query: "workflow", limit: 20, offset: 0 }));
dispatch(requestOpenFile("/tmp/example.md"));
```

```bash
pnpm --filter @repo/desktop run screenshot:task-058c
```

### アーキテクチャ

| レイヤ         | 役割                                      | 主ファイル                                     |
| -------------- | ----------------------------------------- | ---------------------------------------------- |
| Renderer Page  | store 接続、状態分岐、導線制御            | `HistorySearchView/index.tsx`                  |
| Presentational | search / empty / timeline / card          | `components/*`                                 |
| Hook           | debounce、grouping、observer              | `hooks/*`                                      |
| Store          | query、append、expand、editor open intent | `historySearchSlice.ts`, `editorSlice.ts`      |
| Main / Preload | search 契約の正規化                       | `historySearchHandlers.ts`, `preload/types.ts` |

### エラーハンドリング

- handler failure は renderer の error empty state に変換する
- 初期未取得は error ではなく neutral empty state に出し分ける
- screenshot script は strict locator collision を避ける待機に修正した

### エッジケース

- invalid timestamp は `日付不明` グループへ退避
- duplicate append は id ベースで 1 件へ正規化
- 空白 query は trim 後に検索する
- metadata 欠損は fallback copy で表示する

### 設定と定数

| 項目                        | 値                  | 用途     |
| --------------------------- | ------------------- | -------- |
| debounce                    | 300ms               | 検索待機 |
| observer threshold          | `0.1`               | 追補発火 |
| observer rootMargin         | `0px 0px 200px 0px` | 先読み   |
| desktop screenshot viewport | `1440x1200`         | Phase 11 |
| mobile screenshot viewport  | `390x844`           | Phase 11 |

### 補足

- `preload/types.ts` の旧 page/filter 契約は shared shape に同期した
- repository 全体 coverage ではなく 058c 変更面へ対象を絞って計測した
