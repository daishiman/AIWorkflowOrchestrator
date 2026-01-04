# Optimistic Updates 基礎知識

> **相対パス**: `references/basics.md`
> **原典**: Designing Data-Intensive Applications, React Query, SWR

---

## 楽観的更新とは

ユーザーアクションに対して、サーバーレスポンスを待たずにUIを即座に更新するパターン。サーバー失敗時にはロールバックで元の状態に戻す。

**従来の悲観的更新**:

```
1. ユーザーアクション → 2. ローディング表示 → 3. サーバー確認 → 4. UI更新
```

**楽観的更新**:

```
1. ユーザーアクション → 2. 即座にUI更新 → 3. バックグラウンドでサーバー確認
                                        ↓ 失敗時
                                     ロールバック
```

---

## 適用基準

| 条件                 | 適用可否 | 理由                     |
| -------------------- | -------- | ------------------------ |
| 成功率99%以上        | ○        | ロールバック頻度が低い   |
| 可逆操作             | ○        | ロールバック可能         |
| 金融トランザクション | ×        | 失敗時の影響が大きすぎる |
| 不可逆操作           | ×        | ロールバック不可能       |
| 複数ユーザー同時編集 | △        | 競合制御が必要           |

---

## 基本フロー

### React Query

```typescript
const mutation = useMutation({
  mutationFn: updateItem,
  onMutate: async (newData) => {
    // 1. 既存クエリをキャンセル
    await queryClient.cancelQueries({ queryKey: ["items"] });

    // 2. 現在の状態を保存（ロールバック用）
    const previousData = queryClient.getQueryData(["items"]);

    // 3. 楽観的に更新
    queryClient.setQueryData(["items"], (old) =>
      old.map((item) => (item.id === newData.id ? newData : item)),
    );

    // 4. ロールバック用コンテキストを返す
    return { previousData };
  },
  onError: (err, newData, context) => {
    // 5. エラー時にロールバック
    queryClient.setQueryData(["items"], context.previousData);
  },
  onSettled: () => {
    // 6. 完了後にサーバーデータで再検証
    queryClient.invalidateQueries({ queryKey: ["items"] });
  },
});
```

### SWR

```typescript
const { data, mutate } = useSWR("/api/items");

const updateItem = async (newData) => {
  // 楽観的更新
  mutate(
    (current) =>
      current.map((item) => (item.id === newData.id ? newData : item)),
    {
      optimisticData: (current) =>
        current.map((item) => (item.id === newData.id ? newData : item)),
      rollbackOnError: true,
      revalidate: true,
    },
  );

  // サーバー更新
  await fetch("/api/items", {
    method: "PUT",
    body: JSON.stringify(newData),
  });
};
```

---

## ロールバック戦略

| 戦略 | 説明                 | ユースケース       |
| ---- | -------------------- | ------------------ |
| 即座 | エラー即時に元に戻す | 一般的なCRUD       |
| 遅延 | リトライ後に戻す     | ネットワーク不安定 |
| 完全 | 全ての変更を取り消す | 単一操作           |
| 部分 | 失敗部分のみ取り消す | バッチ操作         |

---

## エラー通知

```typescript
onError: (error) => {
  // ユーザーへの明確なフィードバック
  toast.error("変更を保存できませんでした。元に戻しました。");

  // エラーログ
  console.error("Mutation failed:", error);
};
```

---

## 関連リソース

- **要件分析Task**: See `agents/analyze-requirements.md`
- **実装Task**: See `agents/implement-optimistic-update.md`
- **検証Task**: See `agents/validate-and-test.md`
