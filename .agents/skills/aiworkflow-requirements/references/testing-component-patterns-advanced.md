# コンポーネントテストパターン / advanced specification

> 親仕様書: [testing-component-patterns.md](testing-component-patterns.md)
> 役割: advanced specification

## 13. Atoms コンポーネントテストパターン（TASK-UI-00-ATOMS）

> **実装完了**: 2026-02-23（TASK-UI-00-ATOMS）

### 13.1 Atoms共通テストパターン

Atoms層（基本UIコンポーネント）は外部状態（Zustand Store等）に依存せず、propsのみで動作するため、テストが簡素化される。以下の共通パターンを適用する。

| パターン | 説明 | 例 |
|---|---|---|
| **Props駆動テスト** | Atoms層はZustand Storeに依存せず、propsのみで動作するため、モッキング不要で純粋な入出力検証が可能 | `render(<StatusIndicator status="success" />)` |
| **CSS変数テストアサーション** | `bg-[var(--status-primary)]` のようなTailwind arbitrary valuesのクラス名検証方法 | `expect(el).toHaveClass("bg-[var(--status-primary)]")` |
| **テーマ横断テスト** | `describe.each(["light", "dark", "kanagawa-dragon"])` パターンで全テーマを自動検証 | セクション 12 の `renderWithAllThemes` 参照 |
| **displayName検証** | React DevTools用のコンポーネント識別子を検証 | `expect(Component.displayName).toBe("ComponentName")` |

### 13.2 コンポーネント別必須テストケース

| コンポーネント | 必須テストケース | テスト数 |
|---|---|---|
| **StatusIndicator** | status色（success/warning/error/info/pending/idle）、pulseアニメーション、サイズVariant（sm/md/lg）、aria-label | 25 |
| **FilterChip** | isSelected切替、disabled、count表示、icon、キーボード操作（Enter/Space） | 25 |
| **Badge** | variant 6種（primary/secondary/success/warning/error/info）、size（sm/md/lg）、content（string/number）、後方互換children | 23（新規）+ 17（後方互換）= 40 |
| **SkeletonCard** | variant 3種（default/compact/detailed）、animate制御、aria-busy、role="status" | 18 |
| **SuggestionBubble** | size 3種（sm/md/lg）、ホバー色変化、disabled、キーボード操作（Enter/Space） | 21 |
| **EmptyState** | mood 5種（neutral/confused/sad/encouraged/sleepy）、suggestions配列、compact、action（Node/Object両形式）、後方互換onActionClick | 20（新規）+ 6（後方互換）= 26 |
| **RelativeTime** | フォーマット精度（秒/分/時/日/週/月/年）、自動更新（setInterval）、locale、prefix | 27 |

**合計**: 156 Unit Tests + 7 Theme Tests = 163 Tests

### 13.3 タイマーテストパターン（RelativeTime向け）

RelativeTimeコンポーネントは `setInterval` で定期的に表示を更新する。タイマーテストでは `vi.useFakeTimers()` + `vi.advanceTimersByTime()` パターンを使用する。

```typescript
// ❌ NG: 無限ループ
vi.runAllTimers();

// ✅ OK: 指定時間だけ進める
beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

it("自動更新される", () => {
  const pastDate = new Date(Date.now() - 65000); // 1分5秒前
  render(<RelativeTime date={pastDate} />);

  expect(screen.getByText("1 minute ago")).toBeInTheDocument();

  // 1分進める（1分5秒前 → 2分5秒前）
  act(() => {
    vi.advanceTimersByTime(60000);
  });

  expect(screen.getByText("2 minutes ago")).toBeInTheDocument();
});
```

**参照**: セクション 10（Main Process SDKテスト）のFake Timersパターン

### 13.4 後方互換性テストパターン

既存のPropsを非推奨化する際は、新規Propsと並行動作させ、既存テストを全て維持する。

| コンポーネント | 後方互換Props | 新規Props | 戦略 |
|---|---|---|---|
| **Badge** | `children` → `content` | `content: string \| number` | `children` があれば優先、なければ `content` 使用 |
| **EmptyState** | `onActionClick` → `action` | `action: ReactNode \| { label, onClick }` | `onActionClick` があれば優先、なければ `action` 使用 |

**テスト戦略**:
- 既存テスト（Badge 17件、EmptyState 6件）を変更せず全PASS維持
- 新規Props追加時: デフォルト値で既存動作を保持するテスト追加
- `@deprecated` JSDocタグで移行期間を明示

### 13.5 テスト実績

| カテゴリ | PASS | FAIL | 備考 |
|---|---|---|---|
| **Unit Tests** | 156 | 0 | 7コンポーネント × 平均22テスト |
| **Theme Tests** | 7 | 0 | 全コンポーネント × 1テーマ横断テスト |
| **Manual Tests** | 20 PASS + 31 CONDITIONAL | 0 | Phase 11手動テスト（条件付き31件は実装後に検証） |

**条件付きテスト（CONDITIONAL）の内訳**:
- StatusIndicator: pulse速度確認（3件）
- FilterChip: ホバー色変化確認（5件）
- Badge: variant色表示確認（6件）
- SkeletonCard: アニメーション確認（3件）
- SuggestionBubble: ホバー色変化確認（5件）
- EmptyState: mood別イラスト表示確認（5件）
- RelativeTime: 自動更新確認（4件）

**参照**:
- **Atoms仕様**: [ui-ux-atoms-specs.md](ui-ux-atoms-specs.md)
- **テーマ横断テスト**: セクション 12（テーマ横断テストヘルパー）
- **タイマーテスト**: セクション 10（Main Process SDKテスト有効化パターン）

---

## 14. Preload Shape 異常系テストパターン（2026-03-07追加）

> **関連タスク**: 09-TASK-FIX-SETTINGS-PRELOAD-SANDBOX-ITERABLE-GUARD-001
> **適用箇所**: ApiKeysSection 6テストケース

### 概要

`window.electronAPI` の部分的欠損（sandbox 障害、preload 部分エラー等）をテストするパターン。`Object.defineProperty` で `window.electronAPI` を差し替え、コンポーネントがクラッシュせずフォールバック動作することを検証する。

### 基本パターン: electronAPI 差し替え

```typescript
let originalElectronAPI: typeof window.electronAPI;

beforeEach(() => {
  originalElectronAPI = window.electronAPI;
});

afterEach(() => {
  Object.defineProperty(window, "electronAPI", {
    value: originalElectronAPI,
    writable: true,
  });
});

it("electronAPI undefined でクラッシュしない", async () => {
  Object.defineProperty(window, "electronAPI", {
    value: undefined,
    writable: true,
  });
  render(<Component />);
  await waitFor(() => {
    expect(screen.getByText(/エラーメッセージ/)).toBeInTheDocument();
  });
});
```

### テストケースマトリクス

| テストケース | electronAPI の状態 | 期待動作 |
| --- | --- | --- |
| namespace undefined | `window.electronAPI = undefined` | エラーメッセージ表示 + 再試行ボタン |
| メソッド namespace undefined | `window.electronAPI = { ...省略, apiKey: undefined }` | エラーメッセージ表示 + 再試行ボタン |
| メソッド undefined | `window.electronAPI = { apiKey: {} }` （list メソッドなし） | エラーメッセージ表示 + 再試行ボタン |
| レスポンス形状不正 | `list` が `{ success: true, data: { providers: "not-array" } }` を返却 | 空配列フォールバック |
| 正常レスポンス | `list` が正常な providers 配列を返却 | 正常描画 |
| エラーレスポンス | `list` が `{ success: false, error: { message: "..." } }` を返却 | null-safe でエラー表示 |

### 注意点

- `Object.defineProperty` で差し替えた `electronAPI` は `afterEach` で必ず復元する
- happy-dom 環境では `fireEvent` を使用する（P39 準拠）
- テスト間で状態がリークしないよう、各テストで独立した electronAPI モックを設定する

---

## 15. SettingsView 統合ハーネスパターン（2026-03-08追加）

> **関連タスク**: 08-TASK-IMP-SETTINGS-INTEGRATION-REGRESSION-COVERAGE-001
> **適用箇所**: `SettingsView.integration.test.tsx` / `settings-test-harness.ts`

### 概要

Store mock と `window.electronAPI` mock を1つのハーネスに集約し、統合テストで real component composition を維持するパターン。

### 基本方針

- 画面 shell (`SettingsView`) を起点に検証し、子コンポーネントの `vi.mock` を極力禁止する
- `createSettingsTestHarness(options)` で state/action/API 応答を1箇所で制御する
- ケース差分は `HarnessOptions` で注入し、テスト本文のモック分岐を削減する

### 実装テンプレート

```typescript
const harness = createSettingsTestHarness({
  authMode: "subscription",
  apiKeyListResult: { success: true, data: { providers: [] } },
});
harness.render();
await harness.flushAsync();
```

### 非同期安定化ルール

- `apiKey.list()` を伴うテストは `await waitFor(...)` で更新完了を待つ
- `act()` warning が出るケースは専用未タスクへ切り出し、warning 0件化まで追跡する
- 画面系回帰では unit/integration に加え、最低1本の screenshot E2E を確保する

---

## 16. 統合テストハーネスパターン

### S-INT-01: View レベル統合テストハーネス

#### 概要

複数の子コンポーネントを real composition（vi.mock 不使用）でレンダーし、store mock + 外部 API mock を統合ハーネスで管理するパターン。

#### 適用基準

- 3つ以上の子コンポーネントを含む View レベルのコンポーネント
- store セレクタが10個以上使用されている
- 外部 API（electronAPI 等）への依存がある

#### パターン構造

**1. ハーネスファイル（`xxx-test-harness.ts`）**

```typescript
export interface HarnessOptions {
  storeOverrides?: Partial<MockStoreState>;
  apiOverrides?: Partial<MockExternalApi>;
}

export function createXxxHarness(options: HarnessOptions = {}) {
  const storeState = createDefaultStoreState(options.storeOverrides);
  const externalApi = createDefaultExternalApi(options.apiOverrides);

  return {
    storeState,
    externalApi,
    createStoreMockFactory: () => ({ /* vi.mock factory object */ }),
    setupExternalApi: () => {
      Object.defineProperty(window, "electronAPI", {
        value: { apiKey: externalApi },
        writable: true,
        configurable: true,
      });
    },
    updateStoreState: (updates: Partial<MockStoreState>) => {
      Object.assign(storeState, updates);
    },
  };
}
```

**2. テストファイル（vi.mock hoisting パターン）**

```typescript
// ▼ モジュールスコープ変数（vi.mock ファクトリから参照される）
let currentStoreState: MockStoreState;
let currentAuthMode = "subscription" as const;

// ▼ vi.mock（ファイル先頭に hoist される）
vi.mock("../../../store", () => ({
  useAppStore: vi.fn((selector) => selector(currentStoreState)),
  useAuthMode: vi.fn(() => currentAuthMode),
  useSetAuthMode: vi.fn(() => currentSetMode),
}));

// ▼ 通常の import（vi.mock の後に配置しても可。hoist により実質的に vi.mock が先に評価される）
import { TargetView } from "../index";

// ▼ beforeEach で変数を再代入してテストごとの状態を制御
beforeEach(() => {
  const harness = createSettingsHarness();
  currentStoreState = harness.storeState;
  harness.setupElectronApi();
});
```

#### なぜこのパターンが必要か

- `vi.mock` は Vitest によりファイル先頭に hoist されるため、テスト内で動的に設定したモック値をファクトリ関数内で参照できない
- モジュールスコープ変数を介することで、`beforeEach` や個別 `it` 内から動的にモック状態を変更可能
- `createDefaultStoreState(overrides)` パターンにより、テストケースごとに必要なプロパティのみ上書きし、残りはデフォルト値で安全に動作

#### 注意事項

- **P39**: happy-dom 環境では `userEvent` が使用不可。`fireEvent` + `act()` を使用する
- **P31**: 個別セレクタ（`useAuthMode()` 等）を使用し、合成 Hook を避ける
- **M-01**: View が使用する全セレクタのデフォルト値を harness に網羅的に定義する（1つでも欠けると `TypeError` が発生）

#### 実装例

- `apps/desktop/src/renderer/views/SettingsView/__tests__/settings-test-harness.ts`
- `apps/desktop/src/renderer/views/SettingsView/__tests__/SettingsView.integration.test.tsx`

---

