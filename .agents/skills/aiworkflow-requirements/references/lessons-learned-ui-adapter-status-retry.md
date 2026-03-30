# Lessons Learned / UI アダプター状態表示・リトライ導線

> 親仕様書: [lessons-learned.md](lessons-learned.md)
> インデックス: [lessons-learned-current.md](lessons-learned-current.md)
> 対象タスク: TASK-RT-02 api-key-ui-adapter-status（2026-03-29）

---

## 変更履歴

| 日付       | バージョン | 変更内容                           |
| ---------- | ---------- | ---------------------------------- |
| 2026-03-29 | 1.0.0      | 新規作成。TASK-RT-02 教訓3件を追加 |

---

## TASK-RT-02 / api-key-ui-adapter-status

### 概要

`ApiKeysSection` コンポーネントへ `AdapterStatusBadge` / `RetryButton` を統合し、
LLMアダプターの接続状態（`ready` / `initializing` / `failed`）をリアルタイム可視化する実装。

---

### L-RT-02-001: useRef による非同期競合状態（race condition）防止

**カテゴリ**: 非同期 / React Hooks

**課題**: `refreshAdapterStatuses()` を複数回連続呼び出しした場合、後から返ってきた古いレスポンスが最新の状態を上書きする。

**再発条件**:

- 同一コンポーネントで複数の非同期リクエストが並走する場合
- ユーザーがリトライボタンを連打した場合
- `useEffect` で API を呼び、依存配列が変化して再実行される場合

**解決策**: `useRef` でリクエスト ID をトラッキングし、古いリクエスト結果を無視する。

```typescript
const adapterStatusRequestIdRef = useRef(0);

const refreshAdapterStatuses = useCallback(async (providers: ...) => {
  const requestId = ++adapterStatusRequestIdRef.current;
  // ...非同期処理...
  if (requestId !== adapterStatusRequestIdRef.current) return; // 古いリクエストを無視
  setAdapterStatusMap(result);
}, []);
```

**ポイント**: `useState` ではなく `useRef` を使う理由は、ID の変化が再レンダリングを引き起こすべきでないため。

---

### L-RT-02-002: Promise.allSettled によるプロバイダー独立エラー処理

**カテゴリ**: 非同期 / エラーハンドリング

**課題**: 複数プロバイダーの health check を並列実行する際、1件のエラーが `Promise.all` で全体を止める。

**再発条件**:

- 複数の外部サービスをまとめて呼ぶ場合
- 1件失敗しても他の結果を表示したい場合

**解決策**: `Promise.allSettled` で全結果を収集し、`rejected` 時は個別に `failed` 状態へフォールバック。

```typescript
const results = await Promise.allSettled(
  providers.map((provider) => llmApi.checkHealth(provider)),
);

results.forEach((result, i) => {
  if (result.status === "fulfilled") {
    newMap[providers[i]] = toAdapterStatusEntry(result.value);
  } else {
    newMap[providers[i]] = {
      status: "failed",
      failureReason: String(result.reason),
    };
  }
});
```

**ポイント**: `Promise.allSettled` vs `Promise.all` の使い分け — 全件成功前提なら `all`、部分失敗許容なら `allSettled`。

---

### L-RT-02-003: Partial<Record<K, V>> によるプロバイダー単位 Map 状態管理

**カテゴリ**: 型設計 / React State

**課題**: `isRetrying: boolean` を単一のフラグにすると、プロバイダーAのリトライ中にプロバイダーBのボタンも disabled になる。

**再発条件**:

- 同一画面に複数エンティティの独立した非同期アクションが存在する場合
- リスト UI で各アイテムの状態を独立管理したい場合

**解決策**: `Partial<Record<AIProvider, boolean>>` でプロバイダーごとに状態を分離。

```typescript
const [adapterIsRetrying, setAdapterIsRetrying] = useState<
  Partial<Record<AIProvider, boolean>>
>({});

// 特定プロバイダーのみを更新（他プロバイダーに影響しない）
setAdapterIsRetrying((prev) => ({ ...prev, [provider]: true }));
```

**ポイント**: この Map パターンは `ApiKeySettingsPanel` の `validating` 状態管理でも同様に使用されており、複数エンティティの独立状態管理の標準パターンとして定着している。

---

## 関連リソース

| リソース                                                         | 用途         |
| ---------------------------------------------------------------- | ------------ |
| `apps/desktop/src/renderer/components/atoms/AdapterStatusBadge/` | 実装アンカー |
| `apps/desktop/src/renderer/components/atoms/RetryButton/`        | 実装アンカー |
| `apps/desktop/src/renderer/components/organisms/ApiKeysSection/` | 統合先       |
| `docs/30-workflows/task-rt-02-api-key-ui-adapter-status/`        | タスク仕様書 |
| [task-workflow-completed.md](task-workflow-completed.md)         | 完了記録     |
