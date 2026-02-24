# TASK-UI-00-ATOMS: Atoms共通コンポーネント実装

## メタ情報

| 項目         | 値                                                                                                                                  |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| タスクID     | TASK-UI-00-ATOMS                                                                                                                    |
| タスク名     | Atoms共通コンポーネント実装（StatusIndicator・FilterChip・SkeletonCard・SuggestionBubble・RelativeTime新規、Badge・EmptyState拡張） |
| 優先度       | 高（Molecules/Organismsの前提条件）                                                                                                 |
| 複雑度       | medium                                                                                                                              |
| 依存タスク   | TASK-UI-00-TOKENS                                                                                                                   |
| ブロック対象 | TASK-UI-00-MOLECULES, TASK-UI-00-ORGANISMS                                                                                          |

## 目的

全画面で再利用される最小単位のUIコンポーネント（Atoms）を実装する。新規5コンポーネントの作成と既存2コンポーネントの仕様拡張を行い、Apple HIG準拠・WCAG 2.1 AA・レスポンシブ対応を満たす。

## Why（なぜ必要か）

- **Atomic Design の基盤**: Atoms は Molecules / Organisms の構成要素であり、上位コンポーネントの実装前に確定する必要がある
- **UIの一貫性**: 各画面（Dashboard, AgentView, Workspace, SkillCenter, HistorySearch 等）で再利用されるため、個別に実装すると見た目・挙動のばらつきが発生する
- **Apple HIG 準拠**: 現在の Badge / EmptyState は Tailwind 標準カラー（gray-600, green-500 等）を使用しており、Apple HIG System Colors への移行が必要
- **アクセシビリティ**: StatusIndicator, FilterChip 等のインタラクティブ要素にはARIA属性の統一的な付与が不可欠

## 実行タスク

### Task 1: StatusIndicator（新規作成）

**パス**: `apps/desktop/src/renderer/components/atoms/StatusIndicator/`

#### インターフェース定義

```typescript
interface StatusIndicatorProps {
  status: "running" | "success" | "error" | "warning" | "idle" | "offline";
  size?: "sm" | "md" | "lg";
  pulse?: boolean;
  label?: string;
}
```

#### 外観仕様

- カラードット形状。ステータスに応じたカラーを反映
- `running` 時は pulse アニメーション（CSS `@keyframes pulse`）をデフォルトで適用
- `pulse` props で明示的にアニメーションの有無を制御可能

#### サイズ

| サイズ | ドット直径         |
| ------ | ------------------ |
| sm     | 8px                |
| md     | 10px（デフォルト） |
| lg     | 14px               |

#### ステータスカラーマッピング

| ステータス | カラートークン     | 追加効果                        |
| ---------- | ------------------ | ------------------------------- |
| running    | `--status-primary` | pulse アニメーション            |
| success    | `--status-success` | なし                            |
| error      | `--status-error`   | なし                            |
| warning    | `--status-warning` | なし                            |
| idle       | `--text-muted`     | なし                            |
| offline    | `--text-muted`     | 破線ボーダー（`border-dashed`） |

#### アクセシビリティ

- `role="status"`
- `aria-label="ステータス: {status}"`（`label` props が指定されている場合はその値を優先）

#### 使用画面

- AgentView（エージェント実行状態）
- GlobalNavStrip（通知アイコン横）
- Workspace（ファイル監視状態）

#### テスト対象

- [ ] 6種のステータスそれぞれで正しいカラークラスが適用される
- [ ] pulse アニメーションの有無（running時のデフォルト動作、props による制御）
- [ ] 3サイズ（sm/md/lg）で正しいサイズが適用される
- [ ] ARIA 属性（role="status", aria-label）が仕様通り
- [ ] label props によるaria-label上書き
- [ ] 3テーマ（kanagawa-dragon / light / dark）でレンダリング

---

### Task 2: FilterChip（新規作成）

**パス**: `apps/desktop/src/renderer/components/atoms/FilterChip/`

#### インターフェース定義

```typescript
interface FilterChipProps {
  label: string;
  isSelected: boolean;
  count?: number;
  icon?: string;
  onClick: () => void;
  disabled?: boolean;
}
```

#### 外観仕様

- 角丸ピル形状（`--radius-full`）
- **非選択時**: `--bg-tertiary` 背景 + `--text-secondary` テキスト
- **選択時**: `--status-primary` 背景 + `--text-inverse` テキスト
- トランジション: `--duration-fast` `--ease-default`
- `count` がある場合、ラベル右に `(count)` を表示
- `icon` がある場合、ラベル左に16pxアイコンを表示

#### タッチターゲット

- 最小 36×36px（チップ/バッジ基準）

#### アクセシビリティ

- `role="checkbox"`
- `aria-checked={isSelected}`
- `aria-disabled={disabled}`（disabled時）

#### 使用画面

- HistorySearch（期間フィルター）
- SkillCenter（カテゴリフィルター）

#### テスト対象

- [ ] 選択/非選択の切替でスタイルが変わる
- [ ] onClick コールバックが呼ばれる
- [ ] disabled 時に onClick が呼ばれない
- [ ] count 表示
- [ ] icon 表示
- [ ] ARIA 属性（role="checkbox", aria-checked）が仕様通り
- [ ] 3テーマでレンダリング

---

### Task 3: Badge（既存拡張）

**パス**: `apps/desktop/src/renderer/components/atoms/Badge/`

#### 現状のインターフェース

```typescript
// 現在の実装
export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "error" | "info";
  size?: "sm" | "md";
  children: React.ReactNode;
}
```

#### 拡張後のインターフェース

```typescript
export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "primary" | "success" | "warning" | "error" | "info";
  size?: "sm" | "md";
  children?: React.ReactNode;
  content?: string | number;
}
```

#### 拡張内容

1. **`primary` variant の追加**: `--status-primary` 背景 + `--text-inverse` テキスト
2. **`content` props の追加**: `children` の代替として `string | number` を直接指定可能
   - `content` と `children` の両方が指定された場合は `children` を優先
3. **数値の `aria-label` 自動付与**: `content` が `number` 型の場合、`aria-label="{content}件"` を自動設定（明示的な `aria-label` が指定されていればそちらを優先）
4. **デザイントークンへの移行**: 現行の Tailwind 標準カラー（`bg-gray-600`, `bg-green-500` 等）を CSS変数ベースのデザイントークンに移行

#### サイズ

| サイズ | min-width | height |
| ------ | --------- | ------ |
| sm     | 16px      | 16px   |
| md     | 20px      | 20px   |

#### 後方互換性

- 既存の `variant`（`"default" | "success" | "warning" | "error" | "info"`）は全て維持
- `children` ベースの使用法は変更なし
- 既存テスト（全17テスト）が壊れないことを保証

#### 使用画面

- GlobalNavStrip（未読通知カウント）
- SkillCenter（カテゴリ別スキル数）
- Dashboard（統計バッジ）

#### テスト対象

- [ ] 既存テスト17件が全て PASS（後方互換性検証）
- [ ] `primary` variant でのスタイル適用
- [ ] `content` props での表示
- [ ] `content` が `number` 時の `aria-label` 自動付与
- [ ] `content` と `children` 両方指定時の優先順位
- [ ] 3テーマでレンダリング

---

### Task 4: SkeletonCard（新規作成）

**パス**: `apps/desktop/src/renderer/components/atoms/SkeletonCard/`

#### インターフェース定義

```typescript
interface SkeletonCardProps {
  height?: string;
  borderRadius?: string;
  variant?: "default" | "stat" | "list-item";
  animate?: boolean;
}
```

#### 外観仕様

- 背景: `--bg-tertiary`
- パルスアニメーション: `opacity: 0.4 ⟷ 1.0`、1.5秒周期、CSS `@keyframes skeleton-pulse`
- `animate` のデフォルト値は `true`

#### バリエーション構成

| バリエーション | 内部構成                                                                      |
| -------------- | ----------------------------------------------------------------------------- |
| `default`      | ヘッダーライン（幅60%、高さ12px）+ ボディライン2本（幅80%/100%、高さ8px）     |
| `stat`         | 大きな数値プレースホルダー（幅40%、高さ24px）+ ラベルライン（幅60%、高さ8px） |
| `list-item`    | アイコン円（32px）+ テキストライン2本（幅70%/50%、高さ8px）                   |

#### アクセシビリティ

- `role="status"`
- `aria-label="読み込み中"`
- `aria-busy="true"`

#### 使用画面

- CardGrid（ローディング時のプレースホルダー）
- SkillCenter（スキルリスト読み込み）
- Dashboard（統計カードロード中）

#### テスト対象

- [ ] 3バリエーション（default/stat/list-item）それぞれの内部構造が正しくレンダリングされる
- [ ] パルスアニメーションの有無（`animate` props）
- [ ] `height` / `borderRadius` のカスタム値適用
- [ ] ARIA 属性（role="status", aria-label, aria-busy）が仕様通り
- [ ] 3テーマでレンダリング

---

### Task 5: SuggestionBubble（新規作成）

**パス**: `apps/desktop/src/renderer/components/atoms/SuggestionBubble/`

#### インターフェース定義

```typescript
interface SuggestionBubbleProps {
  label: string;
  icon?: string;
  onClick: () => void;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
}
```

#### 外観仕様

- ピル形状（`--radius-full`）
- 背景: `--bg-tertiary`
- ボーダー: `--border-subtle`
- テキスト: `--text-primary`
- アイコン: テキスト左に配置、`--text-secondary` カラー

#### サイズ

| サイズ           | 高さ | テキスト      | アイコンサイズ |
| ---------------- | ---- | ------------- | -------------- |
| sm               | 36px | `--text-sm`   | 16px           |
| md（デフォルト） | 44px | `--text-sm`   | 16px           |
| lg               | 56px | `--text-base` | 20px           |

#### マイクロインタラクション

| 状態       | 効果                                                          |
| ---------- | ------------------------------------------------------------- |
| ホバー     | `scale(var(--scale-hover))` + `--bg-elevated` + `--shadow-sm` |
| アクティブ | `scale(var(--scale-active))`                                  |
| タップ後   | `success-bounce` アニメーション                               |
| disabled   | `opacity: 0.5`、カーソル `not-allowed`、インタラクション無効  |

#### タッチターゲット

- 最小 44px（全サイズで確保）

#### アクセシビリティ

- `role="button"`
- `tabIndex={0}`
- `aria-disabled={disabled}`（disabled時）
- キーボード: Enter / Space で `onClick` を発火

#### 使用画面

- Dashboard（おすすめアクション）
- Workspace ChatPanel（ゼロステートサジェスト）
- Onboarding（操作ガイド）

#### テスト対象

- [ ] 3サイズ（sm/md/lg）で正しい高さ・テキストサイズが適用される
- [ ] onClick コールバックが呼ばれる
- [ ] disabled 時に onClick が呼ばれない
- [ ] アイコン表示の有無
- [ ] ホバー / アクティブ状態のスタイル変更
- [ ] キーボード操作（Enter / Space）
- [ ] ARIA 属性が仕様通り
- [ ] 3テーマでレンダリング

---

### Task 6: EmptyState（既存拡張）

**パス**: `apps/desktop/src/renderer/components/atoms/EmptyState/`

#### 現状のインターフェース

```typescript
// 現在の実装
export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: IconName;
  action?: React.ReactNode;
  className?: string;
}
```

#### 拡張後のインターフェース

```typescript
export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: IconName;
  action?:
    | React.ReactNode
    | {
        label: string;
        onClick: () => void;
        variant?: "primary" | "secondary";
      };
  suggestions?: Array<{
    label: string;
    icon?: string;
    onClick: () => void;
  }>;
  compact?: boolean;
  mood?: "welcoming" | "encouraging" | "celebrating";
  className?: string;
}
```

#### 拡張内容

1. **`suggestions` props の追加**: SuggestionBubble コンポーネントの配列で描画。サジェスト群は flex-wrap レイアウトで中央揃え
2. **`compact` モードの追加**: アイコン32px、見出し `--text-base`、パディング縮小（通常の60%）
3. **`mood` バリアントの追加**:

| mood         | アイコンカラー     | 背景                                                 | アニメーション                     | 代表的な見出し例             |
| ------------ | ------------------ | ---------------------------------------------------- | ---------------------------------- | ---------------------------- |
| welcoming    | `--status-primary` | 青グラデーション（背景全体の薄い円形グラデーション） | なし                               | 「ようこそ！」               |
| encouraging  | `--status-info`    | ニュートラル（変更なし）                             | なし                               | 「まずはこれを試してみよう」 |
| celebrating  | `--status-success` | 変更なし                                             | `success-bounce`（アイコンに適用） | 「準備完了！」               |
| （未指定時） | `--text-muted`     | 変更なし                                             | なし                               | —                            |

4. **`action` props のオブジェクト形式対応**: `{ label, onClick, variant }` オブジェクトが渡された場合、内部で Button コンポーネントとしてレンダリング。既存の `React.ReactNode` 形式も引き続きサポート

#### 後方互換性

- 既存の props（`title`, `description`, `icon`, `action`, `className`）は全て維持
- 既存の `action` が `React.ReactNode` の場合はそのままレンダリング
- 既存テスト（全6テスト）が壊れないことを保証

#### 通常モードとコンパクトモードの比較

| 要素           | 通常        | コンパクト    |
| -------------- | ----------- | ------------- |
| アイコンサイズ | 48px        | 32px          |
| 見出しフォント | `--text-lg` | `--text-base` |
| パディング     | 32px        | 20px          |
| 説明文フォント | `--text-sm` | `--text-xs`   |

#### 使用画面

- Dashboard（welcoming / encouraging）
- Workspace（encouraging）
- SkillCenter（welcoming）
- HistorySearch（encouraging）
- Onboarding 完了（celebrating）

#### テスト対象

- [ ] 既存テスト6件が全て PASS（後方互換性検証）
- [ ] suggestions 配列のレンダリング（SuggestionBubble が正しく描画される）
- [ ] compact モードでのサイズ変更
- [ ] 3種の mood バリアントそれぞれでのスタイル適用
- [ ] action のオブジェクト形式（`{ label, onClick, variant }`）でのボタンレンダリング
- [ ] action の ReactNode 形式との両方が動作する
- [ ] 3テーマでレンダリング

---

### Task 7: RelativeTime（新規作成）

**パス**: `apps/desktop/src/renderer/components/atoms/RelativeTime/`

#### インターフェース定義

```typescript
interface RelativeTimeProps {
  timestamp: string;
  format?: "auto" | "short" | "long";
  refreshInterval?: number;
  showAbsoluteOnHover?: boolean;
}
```

#### 表示ルール

##### `auto` フォーマット（デフォルト）

| 経過時間 | 表示                   |
| -------- | ---------------------- |
| < 1分    | "たった今"             |
| < 1時間  | "N分前"                |
| < 24時間 | "N時間前"              |
| < 7日    | "N日前"                |
| >= 7日   | 絶対日付（YYYY/MM/DD） |

##### `short` フォーマット

| 経過時間 | 表示    |
| -------- | ------- |
| < 1分    | "今"    |
| < 1時間  | "Nm"    |
| < 24時間 | "Nh"    |
| < 7日    | "Nd"    |
| >= 7日   | "MM/DD" |

##### `long` フォーマット

| 経過時間 | 表示             |
| -------- | ---------------- |
| < 1分    | "たった今"       |
| < 1時間  | "N分前"          |
| < 24時間 | "N時間前"        |
| < 2日    | "昨日"           |
| < 7日    | "N日前"          |
| >= 7日   | "YYYY年MM月DD日" |

#### 自動更新

- `refreshInterval` のデフォルト値: 60000ms（1分）
- `setInterval` で `refreshInterval` ごとに再レンダリング
- `useEffect` のクリーンアップ関数で `clearInterval` を実行
- コンポーネントのアンマウント時にタイマーを確実に解除

#### ツールチップ

- `title` 属性に `YYYY/MM/DD HH:mm:ss` 形式の絶対時刻を設定
- `showAbsoluteOnHover` が `false` の場合はツールチップを非表示（デフォルト `true`）

#### アクセシビリティ

- `<time>` 要素を使用
- `datetime` 属性に ISO 8601 形式のタイムスタンプを設定

#### 使用画面

- NotificationCenter（通知タイムスタンプ）
- HistorySearch（実行日時）
- Dashboard（最終更新日時）

#### テスト対象

- [ ] 各閾値での相対時刻表示（1分未満、1時間未満、24時間未満、7日未満、7日以上）
- [ ] 3フォーマット（auto/short/long）の切替
- [ ] 自動更新（setInterval が正しい間隔で呼ばれる）
- [ ] クリーンアップ（アンマウント時に clearInterval が呼ばれる）
- [ ] ツールチップ（title 属性に絶対時刻が設定される）
- [ ] `<time>` 要素と `datetime` 属性
- [ ] 無効なタイムスタンプへのフォールバック表示
- [ ] 3テーマでレンダリング

---

## 共通仕様（全コンポーネントに適用）

### デザイントークン依存

全コンポーネントは TASK-UI-00-TOKENS で定義される CSS 変数を使用する。Tailwind の標準カラーではなく、`var(--status-primary)` 等のカスタムプロパティを参照すること。

### アクセシビリティ（WCAG 2.1 AA）

- コントラスト比 4.5:1 以上（通常テキスト）、3:1 以上（大テキスト / UI部品）
- インタラクティブ要素はキーボード操作で全機能にアクセス可能
- ARIA 属性を各 Task の仕様に従い付与
- 色だけで情報を伝えない（テキスト・アイコンを併用）

### レスポンシブ対応

| ブレークポイント | 幅             |
| ---------------- | -------------- |
| mobile           | < 768px        |
| tablet           | 768px - 1023px |
| desktop          | >= 1024px      |

### マイクロインタラクション

インタラクティブ要素（FilterChip, SuggestionBubble 等）には以下のインタラクションを適用:

| 状態                 | 効果                            |
| -------------------- | ------------------------------- |
| ホバー               | `scale(var(--scale-hover))`     |
| アクティブ           | `scale(var(--scale-active))`    |
| 成功フィードバック   | `success-bounce` アニメーション |
| エラーフィードバック | `error-shake` アニメーション    |

### テスト環境ルール

| ルール                          | 根拠                                     | 対策                                                                        |
| ------------------------------- | ---------------------------------------- | --------------------------------------------------------------------------- |
| `fireEvent` を使用              | P39: happy-dom 環境で `userEvent` 非互換 | `fireEvent.click()` / `await act(async () => { fireEvent.click(el) })`      |
| `apps/desktop/` から実行        | P40: テスト実行ディレクトリ依存          | `cd apps/desktop && pnpm vitest run`                                        |
| `beforeEach` で状態リセット     | P9: モジュールスコープ変数リーク         | DOM クリーンアップ + store リセット                                         |
| `vi.useFakeTimers()` で時刻制御 | RelativeTime のタイマーテスト            | `vi.advanceTimersByTime()` で進行（P13: `runAllTimers` は無限ループリスク） |

### テーマテスト

各コンポーネントについて、全3テーマでレンダリングテストを実施:

1. **kanagawa-dragon**（デフォルト）
2. **light**（Apple HIG ライトモード）
3. **dark**（Apple HIG ダークモード）

### atoms/index.ts エクスポート

新規コンポーネント5つ（StatusIndicator, FilterChip, SkeletonCard, SuggestionBubble, RelativeTime）を `atoms/index.ts` にエクスポートとして追加する。

---

## 成果物

| #   | 成果物                             | パス                                                                                    |
| --- | ---------------------------------- | --------------------------------------------------------------------------------------- |
| 1   | StatusIndicator コンポーネント     | `apps/desktop/src/renderer/components/atoms/StatusIndicator/index.tsx`                  |
| 2   | StatusIndicator テスト             | `apps/desktop/src/renderer/components/atoms/StatusIndicator/StatusIndicator.test.tsx`   |
| 3   | FilterChip コンポーネント          | `apps/desktop/src/renderer/components/atoms/FilterChip/index.tsx`                       |
| 4   | FilterChip テスト                  | `apps/desktop/src/renderer/components/atoms/FilterChip/FilterChip.test.tsx`             |
| 5   | Badge コンポーネント（拡張）       | `apps/desktop/src/renderer/components/atoms/Badge/index.tsx`                            |
| 6   | Badge テスト（拡張）               | `apps/desktop/src/renderer/components/atoms/Badge/Badge.test.tsx`                       |
| 7   | SkeletonCard コンポーネント        | `apps/desktop/src/renderer/components/atoms/SkeletonCard/index.tsx`                     |
| 8   | SkeletonCard テスト                | `apps/desktop/src/renderer/components/atoms/SkeletonCard/SkeletonCard.test.tsx`         |
| 9   | SuggestionBubble コンポーネント    | `apps/desktop/src/renderer/components/atoms/SuggestionBubble/index.tsx`                 |
| 10  | SuggestionBubble テスト            | `apps/desktop/src/renderer/components/atoms/SuggestionBubble/SuggestionBubble.test.tsx` |
| 11  | EmptyState コンポーネント（拡張）  | `apps/desktop/src/renderer/components/atoms/EmptyState/index.tsx`                       |
| 12  | EmptyState テスト（拡張）          | `apps/desktop/src/renderer/components/atoms/EmptyState/EmptyState.test.tsx`             |
| 13  | RelativeTime コンポーネント        | `apps/desktop/src/renderer/components/atoms/RelativeTime/index.tsx`                     |
| 14  | RelativeTime テスト                | `apps/desktop/src/renderer/components/atoms/RelativeTime/RelativeTime.test.tsx`         |
| 15  | atoms/index.ts（エクスポート追加） | `apps/desktop/src/renderer/components/atoms/index.ts`                                   |

## 完了条件

- [ ] StatusIndicator が6種のステータスで正しく描画される
- [ ] StatusIndicator の pulse アニメーションが running 時に適用される
- [ ] FilterChip の選択/非選択切替が動作し、onClick が呼ばれる
- [ ] Badge が拡張仕様（content props, primary variant）に対応している
- [ ] Badge の既存テスト17件が全て PASS（後方互換性）
- [ ] SkeletonCard の3バリエーション（default/stat/list-item）が正しく描画される
- [ ] SuggestionBubble の3サイズとインタラクション（ホバー/アクティブ/disabled）が動作する
- [ ] SuggestionBubble がキーボード操作（Enter/Space）に対応している
- [ ] EmptyState が mood（welcoming/encouraging/celebrating）で正しくスタイルが変わる
- [ ] EmptyState の compact モードでサイズが縮小される
- [ ] EmptyState の suggestions が SuggestionBubble で描画される
- [ ] EmptyState の既存テスト6件が全て PASS（後方互換性）
- [ ] RelativeTime の相対時刻表示が各閾値で正しい
- [ ] RelativeTime の自動更新が setInterval で動作する
- [ ] 全コンポーネントが3テーマ（kanagawa-dragon/light/dark）でレンダリングテスト PASS
- [ ] 全コンポーネントの ARIA 属性が仕様通りに設定されている
- [ ] 新規5コンポーネントが `atoms/index.ts` にエクスポートされている
- [ ] `cd apps/desktop && pnpm vitest run` で全テストが PASS

## 既知の落とし穴・教訓

| Pitfall ID | 内容                                    | 対策                                                                                                                                             |
| ---------- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| P31        | Zustand 合成 Hook 無限ループ            | Atoms は props 駆動で設計する。Store を直接参照しない                                                                                            |
| P39        | happy-dom 環境で `userEvent` 非互換     | `fireEvent` を使用する。非同期ハンドラは `await act(async () => { fireEvent.click(el) })`                                                        |
| P40        | テスト実行ディレクトリ依存（モノレポ）  | `cd apps/desktop && pnpm vitest run` で実行する                                                                                                  |
| P9         | モジュールスコープ変数のテスト間リーク  | `beforeEach` で DOM / store を毎回リセットする                                                                                                   |
| P13        | タイマーテストの無限ループ              | RelativeTime テストでは `vi.advanceTimersByTime()` を使用する。`vi.runAllTimers()` は使用禁止                                                    |
| 新規       | 既存 Badge との後方互換性               | 既存の `children` ベース + 5 variant は維持。`content` / `primary` variant を追加する形で拡張                                                    |
| 新規       | 既存 EmptyState との後方互換性          | 既存の `title` / `description` / `icon` / `action`（ReactNode）は維持。新規 props は全てオプショナル                                             |
| 新規       | Apple HIG tertiaryLabel 低コントラスト  | `--text-muted`（30% opacity）は小テキストで WCAG 4.5:1 を満たさない可能性がある。実装時にコントラスト比を検証し、必要に応じて opacity を調整する |
| 新規       | EmptyState 内での SuggestionBubble 依存 | EmptyState の `suggestions` は SuggestionBubble に依存する。Task 5（SuggestionBubble）を先に実装すること                                         |

## 実行手順（task-specification-creator準拠）

| Step | 内容                                                                                                             | 実行方式 |
| ---- | ---------------------------------------------------------------------------------------------------------------- | -------- |
| 1    | 依存仕様（`00-1-design-tokens.md` と本書）を確認し、共通トークン制約と後方互換対象（Badge/EmptyState）を固定する | 直列     |
| 2    | 新規5コンポーネント（Task 1/2/4/5/7）を実装する                                                                  | 並列     |
| 3    | 既存拡張2コンポーネント（Task 3/6）を後方互換性を崩さない形で更新する                                            | 並列     |
| 4    | 統合テスト連携: テーマ横断・ARIA・キーボード操作テストを追加し、`cd apps/desktop && pnpm vitest run` を実行する  | 直列     |
| 5    | `atoms/index.ts` エクスポート、成果物パス、完了条件を照合して完了判定する                                        | 直列     |

## システム仕様（aiworkflow-requirements）

| 参照仕様                                                                          | 今回抽出した必須要件                                         | 本仕様への反映                       |
| --------------------------------------------------------------------------------- | ------------------------------------------------------------ | ------------------------------------ |
| `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`           | Atomic Designの責務境界（Atomsの責務固定）                   | 目的、Task 1〜7の責務分割            |
| `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md`    | Apple HIG、WCAG 2.1 AA、44pxタッチターゲット、キーボード操作 | 外観仕様、アクセシビリティ、完了条件 |
| `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md`        | トークン利用原則（ハードコード回避）                         | 共通仕様（デザイントークン依存）     |
| `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md` | happy-dom前提のイベント発火/非同期検証パターン               | テスト環境ルール、各Taskテスト対象   |
| `.claude/skills/aiworkflow-requirements/references/testing-accessibility.md`      | role/aria/キーボード系のa11y検証マトリクス                   | 各TaskのARIA要件、完了条件           |
| `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`      | P31対策（Store直接参照回避、Props駆動）                      | 既知の落とし穴（P31）、共通仕様      |
| `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`       | Vitest実行基準とテスト品質ゲート                             | 完了条件（Vitest PASS）              |

## 参照資料

- [00-ui-design-foundation.md](./00-ui-design-foundation.md) — 親仕様書（UIオーバーホール全体設計）
- [00-1-design-tokens.md](./00-1-design-tokens.md) — デザイントークン仕様（TASK-UI-00-TOKENS）
- `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md` — コンポーネント設計基準
- `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md` — Apple HIG/WCAG設計原則
- `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md` — トークン設計
- `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md` — コンポーネントテストパターン
- `.claude/skills/aiworkflow-requirements/references/testing-accessibility.md` — a11yテスト基準
- `.claude/skills/aiworkflow-requirements/references/arch-state-management.md` — P31対策
- `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` — テスト品質要件
- `docs/30-workflows/skill-import-agent-system/tasks/ui-overhaul/00-foundation-reflection-audit.md` — 分割反映トレーサビリティ監査
- `apps/desktop/src/renderer/components/atoms/Badge/index.tsx` — 既存 Badge 実装
- `apps/desktop/src/renderer/components/atoms/Badge/Badge.test.tsx` — 既存 Badge テスト（17件）
- `apps/desktop/src/renderer/components/atoms/EmptyState/index.tsx` — 既存 EmptyState 実装
- `apps/desktop/src/renderer/components/atoms/EmptyState/EmptyState.test.tsx` — 既存 EmptyState テスト（6件）
- [01-architecture.md](../../../../.claude/rules/01-architecture.md) — Apple HIG 準拠、Atomic Design 原則
- [06-known-pitfalls.md](../../../../.claude/rules/06-known-pitfalls.md) — P9, P13, P31, P39, P40

## 関連未タスク（TASK-UI-00-ATOMS Phase 10 MINOR由来）

| タスクID                           | 内容                                                           | 指示書                                                                                  |
| ---------------------------------- | -------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| UT-UI-ATOMS-PROP-NAMING-001        | RelativeTime Props命名統一（updateInterval → refreshInterval） | `docs/30-workflows/completed-tasks/unassigned-task/task-ui-atoms-prop-naming.md`        |
| UT-UI-ATOMS-TOUCH-TARGET-001       | SuggestionBubble sm タッチターゲット Apple HIG 44px準拠        | `docs/30-workflows/completed-tasks/unassigned-task/task-ui-atoms-touch-target.md`       |
| UT-UI-ATOMS-SPEC-CLARIFICATION-001 | SuggestionBubble success-bounce 責務明確化                     | `docs/30-workflows/completed-tasks/unassigned-task/task-ui-atoms-spec-clarification.md` |
