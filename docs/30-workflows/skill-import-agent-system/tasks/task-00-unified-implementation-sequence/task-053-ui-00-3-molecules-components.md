# TASK-UI-00-MOLECULES: Molecules共通コンポーネント実装

## メタ情報

| 項目           | 値                                                                                                 |
| -------------- | -------------------------------------------------------------------------------------------------- |
| タスクID       | TASK-UI-00-MOLECULES                                                                               |
| タスク名       | Molecules共通コンポーネント実装（SearchBar・CodeViewer・TabSwitcher・SlideInPanel・ConfirmDialog） |
| 優先度         | 高（Organismsの前提条件）                                                                          |
| 複雑度         | high                                                                                               |
| 依存タスク     | TASK-UI-00-TOKENS, TASK-UI-00-ATOMS                                                                |
| ブロック対象   | TASK-UI-00-ORGANISMS                                                                               |
| 対象パッケージ | apps/desktop                                                                                       |

## 目的

複数のAtomsを組み合わせた機能的UIコンポーネント（Molecules）を実装する。検索、コード表示、タブ切替、サイドパネル、確認ダイアログの5コンポーネントを作成し、後続の画面仕様（02〜09）で再利用可能にする。

## Why（なぜ必要か）

1. **再利用性**: SkillCenter、Workspace、HistorySearch、Settings など複数画面で共通的に使用されるUI部品を一箇所に集約し、画面間の一貫性を確保する
2. **既存コンポーネントの課題解消**: 現在の SkillSearchBar は Tailwind Slate色ベースでスキル専用。Apple HIG System Colors 準拠の汎用 SearchBar が必要
3. **アクセシビリティ基盤**: WCAG 2.1 AA 準拠のフォーカストラップ・キーボード操作・ARIA属性を Molecules レベルで標準化し、Organisms以上のレイヤーで継承する
4. **Atomic Design の中間層**: Atoms（StatusIndicator, FilterChip 等）と Organisms（CardGrid, MasterDetailLayout 等）をつなぐ中間レイヤーとして、適切な粒度の再利用可能コンポーネントを提供する

## 実行タスク

### Task 1: SearchBar（新規作成）

既存の SkillSearchBar（`molecules/SkillSearchBar/`）はスキル専用かつ Slate 色ベース。Apple HIG System Colors 準拠の汎用 SearchBar を新規作成する。

#### インターフェース

```typescript
interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onDebouncedChange?: (value: string) => void;
  debounceMs?: number; // デフォルト: 300ms
  placeholder?: string;
  shortcutHint?: string; // 例: "⌘K"
  autoFocus?: boolean;
}
```

#### 構成要素

- Search アイコン（lucide-react `Search`）+ テキストインプット + クリアボタン（lucide-react `X`、入力がある場合のみ表示）
- ショートカットヒント表示（右端に `shortcutHint` テキスト表示、入力がない場合のみ）

#### デバウンス仕様

- デフォルト 300ms
- `useRef` + `setTimeout` でタイマー管理、`useEffect` クリーンアップで解除
- `onChange` は即座に呼び出し（入力反映用）、`onDebouncedChange` はデバウンス後に呼び出し（検索実行用）

#### スタイル仕様

| 状態             | プロパティ   | 値                                                     |
| ---------------- | ------------ | ------------------------------------------------------ |
| 通常             | 背景         | `var(--bg-tertiary)`                                   |
| 通常             | ボーダー     | `1px solid var(--border-subtle)`                       |
| フォーカス       | ボーダー     | `1px solid var(--status-primary)`                      |
| フォーカス       | アウトライン | `2px solid var(--status-primary); outline-offset: 2px` |
| テキスト         | 色           | `var(--text-primary)`                                  |
| プレースホルダー | 色           | `var(--text-muted)`                                    |
| アイコン         | 色           | `var(--text-secondary)`                                |
| 高さ             | 最小         | `44px`（タッチターゲット確保）                         |
| 角丸             |              | `var(--radius-md)`                                     |
| パディング       | 左           | `var(--spacing-8)`（アイコン分）                       |
| パディング       | 右           | `var(--spacing-8)`（クリアボタン分）                   |

#### キーボード操作

| キー           | 動作                                               |
| -------------- | -------------------------------------------------- |
| `Cmd+K` or `/` | SearchBar にフォーカス（グローバルショートカット） |
| `Escape`       | 入力をクリアし、フォーカスを外す                   |

#### ARIA 属性

- `role="searchbox"`
- `aria-label="検索"`（またはprops.placeholder を使用）

#### 使用画面

- HistorySearch（全文検索）
- SkillCenter（スキル名検索）

#### テスト項目

- [ ] 入力値が `onChange` で即座に反映される
- [ ] `onDebouncedChange` が指定 ms 後に呼ばれる
- [ ] デバウンス中の連続入力で最後の値のみ `onDebouncedChange` に渡される
- [ ] クリアボタンクリックで入力値がリセットされる
- [ ] 入力が空の場合クリアボタンが非表示
- [ ] Escape キーで入力クリア
- [ ] 3テーマ（kanagawa-dragon / light / dark）でレンダリング確認

---

### Task 2: CodeViewer（新規作成）

#### インターフェース

```typescript
interface CodeViewerProps {
  code: string;
  language?: string; // "typescript" | "javascript" | "json" | "yaml" | "markdown" 等
  showLineNumbers?: boolean; // デフォルト: true
  maxHeight?: string; // デフォルト: "400px"
  filePath?: string; // ファイルパスヘッダー表示用
  showCopyButton?: boolean; // デフォルト: true
}
```

#### 構成要素

1. **ファイルパスヘッダー**（`filePath` 指定時のみ表示）: ファイル名表示 + 言語ラベル
2. **コード表示エリア**: シンタックスハイライト済みコード + 行番号（オプション）
3. **コピーボタン**: 右上に配置、Copy → Check アイコン切替

#### シンタックスハイライト

- CSS変数 `--syntax-*` を使用してテーマ連動
- 実装方針: 軽量な正規表現ベースのハイライター、または `prism-react-renderer` を検討
  - 初期実装は正規表現ベースで keyword / string / number / comment / function をハイライト
  - 複雑な言語対応が必要になった場合に `prism-react-renderer` へ移行

#### コピー機能

- `navigator.clipboard.writeText()` を使用
- コピー後: lucide-react `Copy` → `Check` アイコンに切替（`--status-success` 色）
- 2秒後に `Copy` アイコンにリセット（`setTimeout` + クリーンアップ）
- コピー失敗時: コンソールにエラー出力（ユーザー通知は将来対応）

#### スタイル仕様

| 要素           | プロパティ     | 値                                    |
| -------------- | -------------- | ------------------------------------- |
| コンテナ       | 背景           | `var(--bg-tertiary)`                  |
| コンテナ       | ボーダー       | `1px solid var(--border-default)`     |
| コンテナ       | 角丸           | `var(--radius-md)`                    |
| コンテナ       | オーバーフロー | `auto`（縦横スクロール対応）          |
| コンテナ       | max-height     | `props.maxHeight`（デフォルト 400px） |
| フォント       |                | `var(--font-mono)`                    |
| フォントサイズ |                | `var(--text-sm)`                      |
| 行番号         | 色             | `var(--text-muted)`                   |
| 行番号         | 幅             | `3em`（右揃え）                       |
| ヘッダー       | 背景           | `var(--bg-secondary)`                 |
| ヘッダー       | ボーダー下     | `1px solid var(--border-default)`     |
| コピーボタン   | 位置           | 絶対配置、右上                        |

#### ARIA 属性

- コードブロック: `aria-label="コード表示"`
- コピーボタン: `aria-label="コードをコピー"` / `aria-label="コピー完了"`

#### 使用画面

- SkillCenter CodeViewTab
- Workspace SourceView

#### テスト項目

- [ ] コード文字列が正しく表示される
- [ ] 行番号が `showLineNumbers=true` で表示、`false` で非表示
- [ ] コピーボタンクリックで `navigator.clipboard.writeText` が呼ばれる
- [ ] コピー後にアイコンが Check に切り替わる
- [ ] `filePath` 指定時にヘッダーが表示される
- [ ] `maxHeight` でスクロール可能
- [ ] 3テーマ（kanagawa-dragon / light / dark）でレンダリング確認

---

### Task 3: TabSwitcher（新規作成）

#### インターフェース

```typescript
interface Tab {
  id: string;
  label: string;
  icon?: string; // lucide-react アイコン名
  badge?: string | number; // バッジ表示（件数等）
  disabled?: boolean;
}

interface TabSwitcherProps {
  tabs: Tab[];
  activeTab: string; // アクティブタブの id
  onTabChange: (tabId: string) => void;
  variant?: "underline" | "pill"; // デフォルト: "underline"
}
```

#### バリエーション

| バリエーション | アクティブ表示                                                                    | 非アクティブ表示            |
| -------------- | --------------------------------------------------------------------------------- | --------------------------- |
| `underline`    | `--status-primary` 色の 2px 下線 + `--text-primary` テキスト                      | `--text-secondary` テキスト |
| `pill`         | `var(--bg-tertiary)` 背景 + `var(--radius-full)` 角丸 + `--text-primary` テキスト | `--text-secondary` テキスト |

#### アニメーション

- `underline` バリエーション: 下線位置の移動を `var(--duration-default)` `var(--ease-out)` でアニメーション
- `pill` バリエーション: 背景色の遷移を `var(--duration-default)` でアニメーション

#### キーボード操作

| キー                       | 動作                                                  |
| -------------------------- | ----------------------------------------------------- |
| `ArrowLeft` / `ArrowRight` | 前後のタブにフォーカス移動（disabled タブはスキップ） |
| `Home`                     | 最初のタブにフォーカス移動                            |
| `End`                      | 最後のタブにフォーカス移動                            |
| `Enter` / `Space`          | フォーカス中のタブをアクティブ化                      |

#### ARIA 属性

| 要素          | 属性                                      |
| ------------- | ----------------------------------------- |
| コンテナ      | `role="tablist"`                          |
| 各タブ        | `role="tab"`, `aria-selected`, `tabindex` |
| disabled タブ | `aria-disabled="true"`                    |

#### レスポンシブ

| ブレークポイント    | 動作                                                     |
| ------------------- | -------------------------------------------------------- |
| desktop (≥1024px)   | 全タブ表示                                               |
| tablet (768-1023px) | 全タブ表示                                               |
| mobile (<768px)     | 横スクロール（`overflow-x: auto`、スクロールバー非表示） |

#### 使用画面

- SkillCenter（Overview / Code / Config タブ）
- Workspace（Source / Preview タブ）

#### テスト項目

- [ ] タブクリックで `onTabChange` が呼ばれる
- [ ] `activeTab` に対応するタブがアクティブスタイルで描画される
- [ ] `disabled` タブがクリック不可
- [ ] `underline` / `pill` バリエーションが正しく描画される
- [ ] `badge` が表示される
- [ ] 矢印キーでタブ間フォーカス移動（disabled スキップ）
- [ ] 3テーマ（kanagawa-dragon / light / dark）でレンダリング確認

---

### Task 4: SlideInPanel（新規作成）

#### インターフェース

```typescript
interface SlideInPanelProps {
  isOpen: boolean;
  onClose: () => void;
  side: "right" | "left";
  width?: string; // デフォルト: "400px"
  title?: string;
  children: React.ReactNode;
  showOverlay?: boolean; // デフォルト: false
}
```

#### アニメーション仕様

| 状態           | プロパティ | 値                                                      |
| -------------- | ---------- | ------------------------------------------------------- |
| 閉じている     | transform  | `translateX(100%)` (right) / `translateX(-100%)` (left) |
| 開いている     | transform  | `translateX(0)`                                         |
| トランジション | duration   | `250ms`                                                 |
| トランジション | easing     | `var(--ease-out)`                                       |
| オーバーレイ   | opacity    | `0` → `1`（250ms）                                      |

#### スタイル仕様

| 要素         | プロパティ | 値                                                                                           |
| ------------ | ---------- | -------------------------------------------------------------------------------------------- |
| パネル       | 背景       | `var(--bg-secondary)`                                                                        |
| パネル       | ボーダー   | `1px solid var(--border-default)`（side="right" なら左ボーダー、side="left" なら右ボーダー） |
| パネル       | 影         | `var(--shadow-xl)`                                                                           |
| パネル       | z-index    | `50`                                                                                         |
| ヘッダー     | パディング | `var(--spacing-4)`                                                                           |
| ヘッダー     | ボーダー下 | `1px solid var(--border-default)`                                                            |
| 閉じるボタン | アイコン   | lucide-react `X`                                                                             |
| オーバーレイ | 背景       | `rgba(0, 0, 0, 0.3)`                                                                         |
| オーバーレイ | z-index    | `49`                                                                                         |

#### フォーカス管理

1. **フォーカストラップ**: パネル内でフォーカスを閉じ込める（Tab / Shift+Tab でパネル内を循環）
2. **フォーカスリストア**: パネルを閉じた後、開く前にフォーカスしていた要素にフォーカスを戻す
3. **初期フォーカス**: パネルが開いた時、閉じるボタンにフォーカスを移動

#### キーボード操作

| キー        | 動作                                                      |
| ----------- | --------------------------------------------------------- |
| `Escape`    | パネルを閉じる                                            |
| `Tab`       | パネル内の次のフォーカス可能要素に移動（末尾→先頭に循環） |
| `Shift+Tab` | パネル内の前のフォーカス可能要素に移動（先頭→末尾に循環） |

#### ARIA 属性

- `role="dialog"`
- `aria-modal="true"`
- `aria-label={title}` または `aria-labelledby`

#### レスポンシブ

| ブレークポイント    | 動作                                            |
| ------------------- | ----------------------------------------------- |
| desktop (≥1024px)   | 指定 `width` のサイドパネル（デフォルト 400px） |
| tablet (768-1023px) | オーバーレイパネル（`showOverlay` 自動 true）   |
| mobile (<768px)     | フルスクリーン（`width: 100vw`）                |

#### 使用画面

- SkillCenter Inspector パネル
- Settings サイドパネル

#### テスト項目

- [ ] `isOpen=true` でパネルが表示される
- [ ] `isOpen=false` でパネルが非表示になる
- [ ] `side="right"` / `side="left"` で正しい方向からスライドイン
- [ ] Escape キーで `onClose` が呼ばれる
- [ ] `showOverlay=true` でオーバーレイが表示される
- [ ] オーバーレイクリックで `onClose` が呼ばれる
- [ ] フォーカストラップが機能する（Tab で循環）
- [ ] パネル閉じた後にフォーカスが復元される
- [ ] 3テーマ（kanagawa-dragon / light / dark）でレンダリング確認

---

### Task 5: ConfirmDialog（新規作成）

#### インターフェース

```typescript
interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string; // デフォルト: "確認"
  cancelLabel?: string; // デフォルト: "キャンセル"
  isDestructive?: boolean; // デフォルト: false
  isLoading?: boolean; // デフォルト: false
}
```

#### 外観仕様

| 要素         | プロパティ | 値                                             |
| ------------ | ---------- | ---------------------------------------------- |
| ダイアログ   | 幅         | `400px`                                        |
| ダイアログ   | 角丸       | `var(--radius-lg)`                             |
| ダイアログ   | 影         | `var(--shadow-lg)`                             |
| ダイアログ   | 背景       | `var(--bg-primary)`                            |
| ダイアログ   | z-index    | `60`                                           |
| ダイアログ   | 位置       | 画面中央（`position: fixed` + Flexbox center） |
| オーバーレイ | 背景       | `rgba(0, 0, 0, 0.4)`                           |
| オーバーレイ | z-index    | `59`                                           |
| タイトル     | フォント   | `var(--text-lg)`, font-weight: 600             |
| タイトル     | 色         | `var(--text-primary)`                          |
| 説明文       | フォント   | `var(--text-sm)`                               |
| 説明文       | 色         | `var(--text-secondary)`                        |
| パディング   | 内部       | `var(--spacing-6)`                             |
| ボタン領域   | gap        | `var(--spacing-3)`                             |
| ボタン領域   | 配置       | 右寄せ（`justify-content: flex-end`）          |

#### ボタン仕様

| ボタン     | 通常時                                                | 破壊的操作時 (`isDestructive=true`)        |
| ---------- | ----------------------------------------------------- | ------------------------------------------ |
| キャンセル | 背景: `var(--bg-tertiary)`, 色: `var(--text-primary)` | 同左                                       |
| 確認       | 背景: `var(--status-primary)`, 色: `#FFFFFF`          | 背景: `var(--status-error)`, 色: `#FFFFFF` |

#### 破壊的操作モード (`isDestructive=true`)

- タイトル横に lucide-react `AlertTriangle` アイコン（`--status-warning` 色）を表示
- 確認ボタンが `--status-error` 背景に変更

#### ローディングモード (`isLoading=true`)

- 確認ボタン内に lucide-react `Loader2` スピナーを表示（`animate-spin`）
- 確認ボタンを `disabled` に設定
- キャンセルボタンも `disabled` に設定（操作中の離脱防止）

#### フォーカス管理

1. **フォーカストラップ**: ダイアログ内でフォーカスを閉じ込める
2. **フォーカスリストア**: ダイアログを閉じた後、開く前にフォーカスしていた要素にフォーカスを戻す
3. **初期フォーカス**: ダイアログが開いた時、キャンセルボタンにフォーカス（破壊的操作時の誤操作防止）

#### キーボード操作

| キー     | 動作                                                           |
| -------- | -------------------------------------------------------------- |
| `Escape` | ダイアログを閉じる（`isLoading` 中は無効）                     |
| `Enter`  | 確認実行（フォーカスがキャンセルボタンの場合はキャンセル実行） |
| `Tab`    | ダイアログ内の次のフォーカス可能要素に移動（循環）             |

#### ARIA 属性

- `role="alertdialog"`
- `aria-modal="true"`
- `aria-labelledby={titleId}`
- `aria-describedby={descriptionId}`

#### 使用画面

- SkillCenter（スキル削除確認）
- Workspace（ファイル削除確認）
- Settings（データリセット確認）

#### テスト項目

- [ ] `isOpen=true` でダイアログが表示される
- [ ] `isOpen=false` でダイアログが非表示になる
- [ ] 確認ボタンクリックで `onConfirm` が呼ばれる
- [ ] キャンセルボタンクリックで `onClose` が呼ばれる
- [ ] Escape キーで `onClose` が呼ばれる
- [ ] `isDestructive=true` で確認ボタンが `--status-error` スタイル
- [ ] `isDestructive=true` で AlertTriangle アイコンが表示される
- [ ] `isLoading=true` で Loader2 スピナー表示 + ボタン disabled
- [ ] `isLoading=true` で Escape が無効
- [ ] オーバーレイクリックで `onClose` が呼ばれる
- [ ] フォーカストラップが機能する
- [ ] パネル閉じた後にフォーカスが復元される
- [ ] 3テーマ（kanagawa-dragon / light / dark）でレンダリング確認

---

### 共通仕様（全コンポーネントに適用）

#### lucide-react アイコンマスターリスト

| アイコン名      | 用途            | 使用コンポーネント      |
| --------------- | --------------- | ----------------------- |
| `Search`        | 検索            | SearchBar               |
| `X`             | 閉じる / クリア | SearchBar、SlideInPanel |
| `Copy`          | コピー          | CodeViewer              |
| `Check`         | コピー完了      | CodeViewer              |
| `AlertTriangle` | 警告            | ConfirmDialog           |
| `Loader2`       | ローディング    | ConfirmDialog           |

#### Props駆動設計（P31対策）

全 Molecules コンポーネントは Zustand Store を直接参照しない。必要なデータは全て props 経由で受け取る。

```typescript
// ✅ 正しい: Props駆動
<SearchBar value={searchQuery} onChange={setSearchQuery} />

// ❌ 禁止: Store直接参照
const searchQuery = useSearchQuery(); // Molecules内でStoreを参照しない
```

#### アクセシビリティ（WCAG 2.1 AA 準拠）

- コントラスト比 4.5:1 以上（通常テキスト）、3:1 以上（大テキスト / UI部品）
- キーボード操作で全機能にアクセス可能
- フォーカスリング: `outline: 2px solid var(--status-primary); outline-offset: 2px`
- フォーカストラップ: SlideInPanel / ConfirmDialog 内でフォーカスを閉じ込める
- フォーカスリストア: パネル / ダイアログ閉じた後、開く前の要素にフォーカスを戻す

#### レスポンシブ対応

| コンポーネント | desktop (≥1024px)        | tablet (768-1023px)   | mobile (<768px)        |
| -------------- | ------------------------ | --------------------- | ---------------------- |
| SearchBar      | フル幅                   | フル幅                | フル幅                 |
| CodeViewer     | 指定幅                   | フル幅                | フル幅                 |
| TabSwitcher    | 全タブ表示               | 全タブ表示            | 横スクロール           |
| SlideInPanel   | 右サイドパネル（指定幅） | オーバーレイパネル    | フルスクリーン         |
| ConfirmDialog  | 中央モーダル（400px）    | 中央モーダル（400px） | 中央モーダル（幅90vw） |

#### マイクロインタラクション

- ホバー: `scale(var(--scale-hover))`（ボタン類に適用）
- アクティブ: `scale(var(--scale-active))`（ボタン類に適用）
- トランジション: `var(--duration-default)` + `var(--ease-out)`

#### テスト環境ルール

| ルール                                 | 根拠                                | 対策                                                                  |
| -------------------------------------- | ----------------------------------- | --------------------------------------------------------------------- |
| `fireEvent` を使用（`userEvent` 禁止） | P39: happy-dom 環境で Symbol エラー | `fireEvent.click()`, `await act(async () => { fireEvent.click(el) })` |
| `apps/desktop/` ディレクトリから実行   | P40: テスト実行ディレクトリ依存     | `cd apps/desktop && pnpm vitest run`                                  |
| `beforeEach` で状態リセット            | P9: モジュールスコープ変数リーク    | DOM・Store・タイマーを毎テストリセット                                |
| `advanceTimersByTime` でタイマー制御   | P13: `runAllTimers` 無限ループ      | デバウンスは1ステップずつ進める                                       |

#### テーマテスト

各コンポーネントについて、全3テーマでのレンダリングテストを実施する。

```typescript
describe.each(["kanagawa-dragon", "light", "dark"])("テーマ: %s", (theme) => {
  beforeEach(() => {
    document.documentElement.setAttribute("data-theme", theme);
  });

  it("正しくレンダリングされる", () => {
    // コンポーネント固有のレンダリング確認
  });
});
```

## 成果物

| #   | 成果物                       | パス                                                                                            |
| --- | ---------------------------- | ----------------------------------------------------------------------------------------------- |
| 1   | SearchBar コンポーネント     | `apps/desktop/src/renderer/components/molecules/SearchBar/index.tsx`                            |
| 2   | SearchBar テスト             | `apps/desktop/src/renderer/components/molecules/SearchBar/__tests__/SearchBar.test.tsx`         |
| 3   | CodeViewer コンポーネント    | `apps/desktop/src/renderer/components/molecules/CodeViewer/index.tsx`                           |
| 4   | CodeViewer テスト            | `apps/desktop/src/renderer/components/molecules/CodeViewer/__tests__/CodeViewer.test.tsx`       |
| 5   | TabSwitcher コンポーネント   | `apps/desktop/src/renderer/components/molecules/TabSwitcher/index.tsx`                          |
| 6   | TabSwitcher テスト           | `apps/desktop/src/renderer/components/molecules/TabSwitcher/__tests__/TabSwitcher.test.tsx`     |
| 7   | SlideInPanel コンポーネント  | `apps/desktop/src/renderer/components/molecules/SlideInPanel/index.tsx`                         |
| 8   | SlideInPanel テスト          | `apps/desktop/src/renderer/components/molecules/SlideInPanel/__tests__/SlideInPanel.test.tsx`   |
| 9   | ConfirmDialog コンポーネント | `apps/desktop/src/renderer/components/molecules/ConfirmDialog/index.tsx`                        |
| 10  | ConfirmDialog テスト         | `apps/desktop/src/renderer/components/molecules/ConfirmDialog/__tests__/ConfirmDialog.test.tsx` |

## 完了条件

- [ ] SearchBar の入力反映・デバウンス・クリアボタンが動作する
- [ ] CodeViewer のシンタックスハイライト・コピーボタンが動作する
- [ ] TabSwitcher の underline/pill バリエーションが正しく描画される
- [ ] SlideInPanel のスライドイン/アウト・Escape閉じ・フォーカストラップが動作する
- [ ] ConfirmDialog の開閉・キーボード操作・破壊的操作スタイルが動作する
- [ ] 全コンポーネントが3テーマでレンダリングテスト PASS
- [ ] 全コンポーネントの ARIA 属性が仕様通りに設定されている
- [ ] レスポンシブ動作が3ブレークポイントで確認されている
- [ ] `cd apps/desktop && pnpm vitest run` で全テストが PASS
- [ ] 全コンポーネントが Props 駆動で Store を直接参照していない
- [ ] lucide-react アイコンが正しく使用されている

## 既知の落とし穴・教訓

| Pitfall ID | 内容                                   | 対策                                                                                               |
| ---------- | -------------------------------------- | -------------------------------------------------------------------------------------------------- |
| P31        | Zustand 合成 Hook 無限ループ           | 共通コンポーネントは Props 駆動。Store 直接参照しない                                              |
| P39        | happy-dom 環境で userEvent 非互換      | `fireEvent` を使用。非同期は `await act(async () => { fireEvent.click(el) })`                      |
| P40        | テスト実行ディレクトリ依存（モノレポ） | `apps/desktop/` から実行。`pnpm --filter @repo/desktop exec vitest run` も可                       |
| P9         | モジュールスコープ変数のテスト間リーク | `beforeEach` で DOM・Store・タイマーを毎テストリセット                                             |
| P13        | タイマーテストの無限ループ             | SearchBar のデバウンスは `advanceTimersByTime` で1ステップずつ進める                               |
| 新規       | `navigator.clipboard` テスト環境非対応 | happy-dom では `navigator.clipboard` 未実装。`Object.defineProperty` でモック必須                  |
| 新規       | フォーカストラップのテスト             | `fireEvent.keyDown(el, { key: 'Tab' })` で Tab 移動をシミュレート。`document.activeElement` で検証 |
| 新規       | CSS アニメーションテスト不可           | happy-dom では CSS transition/animation を検知できない。クラス付与/スタイル変更のみ検証            |

## 実行手順（task-specification-creator準拠）

| Step | 内容                                                                                                                | 実行方式 |
| ---- | ------------------------------------------------------------------------------------------------------------------- | -------- |
| 1    | 依存仕様（`00-1-design-tokens.md` / `00-2-atoms-components.md`）を確認し、再利用コンポーネント境界を固定する        | 直列     |
| 2    | SearchBar/CodeViewer/TabSwitcher/SlideInPanel/ConfirmDialog の本体実装を行う                                        | 並列     |
| 3    | キーボード操作・ARIA属性・レスポンシブ挙動のテストを追加する                                                        | 並列     |
| 4    | 統合テスト連携: コンポーネント群を組み合わせた表示シナリオを検証し、`cd apps/desktop && pnpm vitest run` を実行する | 直列     |
| 5    | 成果物一覧と完了条件を照合し、Store直接参照禁止（P31）を最終確認する                                                | 直列     |

## システム仕様（aiworkflow-requirements）

| 参照仕様                                                                          | 今回抽出した必須要件                                      | 本仕様への反映                             |
| --------------------------------------------------------------------------------- | --------------------------------------------------------- | ------------------------------------------ |
| `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`           | Molecules責務（Atoms合成の機能単位）                      | 目的、Task 1〜5                            |
| `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md`    | Apple HIG準拠、キーボード操作、フォーカス管理             | 各Taskのキーボード/ARIA仕様                |
| `.claude/skills/aiworkflow-requirements/references/arch-ui-components.md`         | Dialog/ComboboxなどUIパターンのrole/aria設計              | SlideInPanel/ConfirmDialog/TabSwitcher仕様 |
| `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md` | happy-domでのイベント発火・非同期検証・Storeモック戦略    | テスト環境ルール、テスト項目               |
| `.claude/skills/aiworkflow-requirements/references/testing-accessibility.md`      | a11y検証（role/aria/フォーカストラップ/ライブリージョン） | ARIA属性・完了条件                         |
| `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`      | P31対策（Props駆動、Store依存回避）                       | 共通仕様（Props駆動設計）                  |
| `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`       | テスト品質基準（RTL/Vitest）                              | 完了条件（Vitest PASS）                    |

## 参照資料

- [00-ui-design-foundation.md](./task-050-ui-00-ui-design-foundation.md) — 親仕様書（デザイン基盤全体）
- [00-1-design-tokens.md](../completed-task/00-1-design-tokens.md) — デザイントークン仕様（CSS変数定義）
- [00-2-atoms-components.md](../completed-task/00-2-atoms-components.md) — Atoms仕様（依存コンポーネント）
- `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md` — Molecules責務定義
- `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md` — Apple HIG/WCAG設計原則
- `.claude/skills/aiworkflow-requirements/references/arch-ui-components.md` — UIアーキテクチャパターン
- `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md` — コンポーネントテストパターン
- `.claude/skills/aiworkflow-requirements/references/testing-accessibility.md` — a11yテスト基準
- `.claude/skills/aiworkflow-requirements/references/arch-state-management.md` — P31対策
- `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` — テスト品質要件
- `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-055-ui-00-foundation-reflection-audit.md` — 分割反映トレーサビリティ監査
- `apps/desktop/src/renderer/components/molecules/SkillSearchBar/` — 既存 SkillSearchBar（SearchBar の参考実装）
- [01-architecture.md](../../../../../.claude/rules/01-architecture.md) — Apple HIG 準拠、Atomic Design 原則
- [06-known-pitfalls.md](../../../../../.claude/rules/06-known-pitfalls.md) — テスト環境の落とし穴（P9, P13, P39, P40）
