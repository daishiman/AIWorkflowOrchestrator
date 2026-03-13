# 実装パターン総合ガイド / reference bundle

> 親仕様書: [architecture-implementation-patterns.md](architecture-implementation-patterns.md)
> 役割: reference bundle

## AgentView Enhancement 実装パターン（TASK-UI-03 2026-03-07実装）

### S23: CSS変数定数抽出パターン（TASK-UI-03-AGENT-VIEW-ENHANCEMENT）

**問題**: Tailwind arbitrary values（`bg-[var(--status-primary)]`）をテスト内でハードコード文字列として比較していたため、トークン名変更時に全テストの修正が必要になる（P47派生）。

**解決パターン**: スタイル定数とアニメーション定数をモジュールスコープの `styles.ts` / `animations.ts` に抽出し、コンポーネントとテストの両方から import する。

| ファイル        | 責務                                       | 内容例                                               |
| --------------- | ------------------------------------------ | ---------------------------------------------------- |
| `styles.ts`     | スペーシング・インタラクティブスタイル定数 | `spacing.sectionGap`, `interactiveStyles.iconButton` |
| `animations.ts` | トランジション・アニメーション定数         | `transitions.hover`, `transitions.slideIn`           |

**定数定義の設計原則**:

- `as const` アサーションで型を狭める
- 8px グリッド準拠のスペーシング値を使用（`gap-4` = 16px, `gap-6` = 24px）
- Tailwind arbitrary values（`bg-[var(--xxx)]`）はトークン名と1:1対応させる

```typescript
// styles.ts - コンポーネント外部で定数管理
export const spacing = {
  sectionGap: "gap-6", // 24px (8px x 3)
  chipGap: "gap-4", // 16px (8px x 2)
  containerPadding: "p-6", // 24px
} as const;

export const interactiveStyles = {
  iconButton:
    "p-1.5 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors duration-200",
} as const;

// animations.ts - アニメーション定数管理
export const transitions = {
  hover: "transition-transform duration-200 ease",
  tap: "transition-transform duration-100 ease-in",
  slideIn: "transition-transform duration-300 ease-out",
  slideOut: "transition-transform duration-200 ease-in",
} as const;
```

**テスト側での利用**:

```typescript
// テスト側 - 定数を import して期待値に使用
import { spacing } from "./styles";
expect(container.className).toContain(spacing.sectionGap);
// トークン名変更時は styles.ts の1箇所だけ修正すれば完結
```

**適用タイミング**: UIコンポーネント追加時、Phase 5 実装直後に抽出する（Phase 8 リファクタリングでは遅い — テストが既にハードコード文字列で書かれてしまう）

**関連Pitfall**: P47（CSS変数ベースのスタイルテストアサーション戦略）

---

### S24: backward-compatible fallback パターン（TASK-UI-03-AGENT-VIEW-ENHANCEMENT）

**問題**: 新規 Zustand セレクタを追加した際、既存テストのモックが新セレクタを含んでおらず、テストが一斉に壊れる。大規模リファクタリング時に段階的移行が困難になる。

**解決パターン**: `typeof === "function"` ガード付きフォールバックで、新セレクタが存在しない環境でも安全にデフォルト値を返す。

```typescript
// 段階的移行: 新セレクタ未定義の環境でもクラッシュしない
const recentExecutions =
  typeof useRecentExecutions === "function" ? useRecentExecutions() : [];
```

**適用判断基準**:

| 条件                         | フォールバック使用 | 直接セレクタ使用     |
| ---------------------------- | ------------------ | -------------------- |
| 既存テストモックが多数存在   | 推奨               | 全モック更新が必要   |
| セレクタが段階的に追加される | 推奨               | 移行完了まで使えない |
| セレクタが確実に存在する     | 不要               | 推奨                 |

**注意**: フォールバックは移行期間の一時的措置。移行完了後は `typeof` ガードを除去し、直接セレクタ使用に切り替える。

**適用タイミング**: Zustand Store 拡張時、大規模リファクタリング時

**関連Pitfall**: P31（Zustand Store Hooks 無限ループ）

---

### S25: z-index Phase 2 事前設計パターン（TASK-UI-03-AGENT-VIEW-ENHANCEMENT）

**問題**: UIコンポーネント追加時に z-index 衝突が発生し、オーバーレイやフローティング要素が意図しない表示順序になる。Phase 5 実装中に場当たり的に z-index を調整すると、既存コンポーネントとの衝突が連鎖する。

**解決パターン**: Phase 2（アーキテクチャ設計）で z-index 管理テーブルを事前定義し、全レイヤーの表示順序を確定させる。

| レイヤー       | z-index     | コンポーネント例                   |
| -------------- | ----------- | ---------------------------------- |
| ベース         | z-0 〜 z-10 | ページコンテンツ、カードレイアウト |
| ナビゲーション | z-20        | GlobalNavStrip                     |
| パネル         | z-40        | AdvancedSettingsPanel              |
| フローティング | z-50        | FloatingExecutionBar               |

**設計時のルール**:

1. z-index は10刻みで割り当てる（中間値の挿入余地を確保）
2. 同一レイヤー内のコンポーネントは同じ z-index を使用し、DOM 順序で制御する
3. 新規コンポーネント追加時は管理テーブルに追記してからコーディングを開始する

**結果**: TASK-UI-03 では z-index 衝突 0 件を達成。

**適用タイミング**: UIコンポーネント追加タスクの Phase 2 設計レビュー時。Phase 2 テンプレートに z-index 管理テーブルを必須項目として含める。

**関連タスク**: TASK-UI-03-AGENT-VIEW-ENHANCEMENT

### S26: 直接IPC→Store個別セレクタ移行パターン（selector migration / TASK-10A-F 2026-03-07策定）

Custom Hookが `window.electronAPI` を直接呼び出している場合の、Store個別セレクタへの移行手順。

#### 移行チェックリスト

| ステップ | 内容                                             | 検証方法                                                         |
| -------- | ------------------------------------------------ | ---------------------------------------------------------------- |
| 1        | Store actionが agentSlice に定義済みか確認       | `grep -n "analyzeSkill\|createSkill" store/slices/agentSlice.ts` |
| 2        | 個別セレクタが store/index.ts にexport済みか確認 | `grep -n "useAnalyzeSkill\|useCreateSkill" store/index.ts`       |
| 3        | ローカル useState を Store セレクタに置換        | State: `useCurrentAnalysis()`, Action: `useAnalyzeSkill()`       |
| 4        | 直接IPC呼び出しを削除                            | `window.electronAPI.skill.*` → Store action 経由                 |
| 5        | try/catch を全ハンドラに追加                     | Store側error処理済みでも UIクラッシュ防止で必須                  |
| 6        | isMountedRef パターンを削除                      | Store action内部で状態更新するため不要                           |
| 7        | テストを Store mock パターンに移行               | `vi.mock("../../../store")` で個別セレクタをmock                 |

#### テスト mock 標準パターン

```typescript
// State用セレクタ: 値を直接返す
// Action用セレクタ: mock関数を返す
const mockAnalyzeSkill = vi.fn();

vi.mock("../../../store", () => ({
  useCurrentAnalysis: () => null, // State
  useIsAnalyzingSkill: () => false, // State
  useAnalyzeSkill: () => mockAnalyzeSkill, // Action
}));

// beforeEach で mockReset
beforeEach(() => {
  mockAnalyzeSkill.mockReset();
});
```

#### 状態分類の判断基準

| 判断基準                         | Store移行 | ローカル維持 |
| -------------------------------- | --------- | ------------ |
| 複数画面で共有される             | ✅        |              |
| Store action 内部で管理される    | ✅        |              |
| UI一時状態（選択状態等）         |           | ✅           |
| コンポーネント固有の表示ロジック |           | ✅           |

#### P31/P48 適用判定

- スカラー値（string, boolean, null）を返すセレクタ → `useShallow` 不要
- `.filter()` / `.map()` で配列を返すセレクタ → `useShallow` 必須（P48）
- 全セレクタは個別セレクタで取得（合成Hook禁止、P31）

#### 関連パターン

- [S18: useShallow 適用条件](同ファイル内)
- P31: Zustand Store Hooks 無限ループ（06-known-pitfalls.md）
- P42: 文字列引数の .trim() バリデーション漏れ（06-known-pitfalls.md）

**関連タスク**: TASK-10A-F

---

### S27: Renderer 境界 5層防御パターン（06-TASK-FIX-SETTINGS-APIKEY-CONTRACT-GUARD-001 2026-03-07実装）

> 追加: 2026-03-07 / 06-TASK-FIX-SETTINGS-APIKEY-CONTRACT-GUARD-001

**問題**: IPC レスポンスの shape が期待と異なる場合、Renderer 側でクラッシュする

**パターン**:

| 層  | 防御内容               | コード例                                     |
| --- | ---------------------- | -------------------------------------------- |
| L1  | API namespace 存在確認 | `window.electronAPI?.apiKey?.list`           |
| L2  | result shape 正規化    | `result?.success && result?.data`            |
| L3  | 配列保証               | `Array.isArray(result.data.providers)`       |
| L4  | 要素 shape フィルタ    | type predicate で必須フィールド検証          |
| L5  | 例外キャッチ           | try-catch でPromise rejection をハンドリング |

**適用基準**: IPC レスポンスを Renderer 側で消費するすべてのコンポーネント

**関連 Pitfall**: P48（non-null assertion）, P19（型キャスト）, P49（type predicate 内 as キャスト）

**type predicate の推奨パターン（`in` 演算子）**:

```typescript
// ✅ 推奨: in 演算子で実行時検証 + 型ナロイング
const isValidItem = (item: unknown): item is ProviderStatus =>
  item != null &&
  typeof item === "object" &&
  "provider" in item &&
  typeof item.provider === "string" &&
  "status" in item &&
  typeof item.status === "string";

// ❌ 非推奨: as キャストで実行時検証バイパス
const isValidItem = (item: unknown): item is ProviderStatus =>
  typeof (item as Record<string, unknown>).provider === "string";
```

**5層防御の完全コード例**:

```typescript
// L1: API namespace 存在確認
if (!window.electronAPI?.apiKey?.list) {
  return [];
}
try {
  // L5: 例外キャッチ
  const result = await window.electronAPI.apiKey.list();
  // L2: result shape 正規化
  if (!result?.success || !result?.data) {
    return [];
  }
  // L3: 配列保証
  const providers = Array.isArray(result.data.providers)
    ? result.data.providers
    : [];
  // L4: 要素 shape フィルタ
  return providers.filter(isValidItem);
} catch {
  return [];
}
```

---

### S28: Main ハンドラ間接テストパターン（ipcMain.handle モック）（06-TASK-FIX-SETTINGS-APIKEY-CONTRACT-GUARD-001 2026-03-07実装）

> 追加: 2026-03-07 / 06-TASK-FIX-SETTINGS-APIKEY-CONTRACT-GUARD-001

**問題**: `ipcMain.handle` + `withValidation` でラップされたハンドラを直接テストできない

**パターン**:

```typescript
// 1. electron をモック
vi.mock("electron", () => ({
  ipcMain: {
    handle: vi.fn(),
    on: vi.fn(),
    removeHandler: vi.fn(),
  },
}));

// 2. ハンドラ登録関数を呼び出し
registerApiKeyHandlers(mockMainWindow, mockApiKeyStorage);

// 3. 登録されたコールバックを取得
const handleCalls = vi.mocked(ipcMain.handle).mock.calls;
const listHandler = handleCalls.find(
  ([channel]) => channel === "apiKey:list",
)?.[1];

// 4. コールバックを直接呼び出してテスト
const result = await listHandler(mockEvent);
expect(result.data.providers).toEqual([]);
```

**適用基準**: `withValidation` ラッパーを使用する IPC ハンドラのユニットテスト

**制約**: `withValidation` 内の sender 検証ロジックはこのパターンではテストされない。sender 検証は Security テスト層で別途検証する（IPC ハンドラー3層テスト分離パターン参照）。

**関連パターン**: IPC ハンドラー3層テスト分離パターン（本ファイル内）

---

### S29: Renderer 境界 providers 正規化パターン（06-TASK-FIX-SETTINGS-APIKEY-CONTRACT-GUARD-001 2026-03-08完了）

> 追加: 2026-03-08 / 06-TASK-FIX-SETTINGS-APIKEY-CONTRACT-GUARD-001

**問題**: IPC 境界を超えたレスポンスでは structured clone により TypeScript 型が消失する。`apiKey.list()` の戻り値 `IPCResponse<ProviderListResult>` は型上 `providers: ProviderStatus[]` だが、実行時には null/undefined/非配列/malformed 要素が混入する可能性がある。

**パターン**: 4層防御

```typescript
// Layer 1: API 存在確認
const apiKeyApi = window.electronAPI?.apiKey;
if (!apiKeyApi?.list) {
  // フォールバック UI
  return;
}

// Layer 2: レスポンス成功確認
const result = await apiKeyApi.list();
if (!result?.success || !result?.data) {
  // エラー UI
  return;
}

// Layer 3: 配列正規化 + type predicate フィルタ（P49準拠）
const rawProviders = Array.isArray(result.data.providers)
  ? result.data.providers
  : [];
const providers = rawProviders.filter(
  (item): item is ProviderStatus =>
    item != null &&
    typeof item === "object" &&
    "provider" in item &&
    typeof item.provider === "string" &&
    "status" in item &&
    typeof item.status === "string",
);

// Layer 4: 正常データで UI 更新
setState((prev) => ({ ...prev, providers, isLoading: false }));
```

**S27（5層防御）との関係**: S27 は汎用的な Renderer 境界防御の全体構造（L1-L5）を定義する。S29 は S27 の L3（配列保証）+ L4（要素フィルタ）を `providers` 配列に特化し、`type predicate` + `.filter()` による正規化の具体的な実装パターンを示す。

**Main 側 配列正規化パターン（補足）**:

Main ハンドラ側でも IPC レスポンスに含める配列を正規化する。外部ストレージや SDK から取得したデータが非配列の場合にも安全にレスポンスを構築する。

```typescript
// Main ハンドラ内での配列正規化
const rawProviders = storageResult?.providers;
const providers = Array.isArray(rawProviders) ? rawProviders : [];
return { success: true, data: { providers } };
```

**適用基準**: IPC 経由で配列を含むオブジェクトを受け取る全コンポーネント

**関連パターン**: S27 Renderer 境界 5層防御、P48 non-null assertion 禁止、P49 type predicate 内 as キャスト禁止

---

