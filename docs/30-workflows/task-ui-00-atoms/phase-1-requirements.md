# Phase 1: 要件定義 - TASK-UI-00-ATOMS

## メタ情報

| 項目       | 値                                                                                                                                  |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Phase      | 1                                                                                                                                   |
| Phase名    | 要件定義                                                                                                                            |
| 前提Phase  | なし（TASK-UI-00-TOKENS 完了済みが前提条件）                                                                                        |
| 後続Phase  | Phase 2（設計）                                                                                                                     |
| ステータス | pending                                                                                                                             |
| 作成日     | 2026-02-22                                                                                                                          |
| 機能名     | Atoms共通コンポーネント実装（StatusIndicator・FilterChip・SkeletonCard・SuggestionBubble・RelativeTime新規、Badge・EmptyState拡張） |

## 目的

全画面で再利用される最小単位のUIコンポーネント（Atoms）7つの機能要件・非機能要件・後方互換性要件を確定し、Phase 2（設計）の入力として完全な要件セットを提供する。

## 背景

- 現行の Badge / EmptyState は Tailwind 標準カラー（`bg-gray-600`, `bg-green-500`）を使用しており、TASK-UI-00-TOKENS で定義された CSS 変数（`--status-primary`, `--status-success`）への移行が必要
- 新規5コンポーネント（StatusIndicator, FilterChip, SkeletonCard, SuggestionBubble, RelativeTime）は Molecules / Organisms の構成要素であり、上位コンポーネントの実装前に確定する必要がある
- Badge は既存テスト17件、EmptyState は既存テスト6件を維持した上で拡張する必要がある
- 全コンポーネントは Apple HIG 準拠・WCAG 2.1 AA・3テーマ対応（kanagawa-dragon / light / dark）を満たす必要がある

## 実行タスク

- 実行方針: 本Phaseで定義した Task セクションを上から順に100%実施する。

### Task 1: 既存コンポーネント分析

Badge と EmptyState の現状コードを分析し、拡張方針を確定する。

#### Task 1-1: Badge 現状分析

**対象ファイル**:

- `apps/desktop/src/renderer/components/atoms/Badge/index.tsx`（52行）
- `apps/desktop/src/renderer/components/atoms/Badge/Badge.test.tsx`（17テスト）

**分析項目**:

| 分析項目                 | 現状の値                                                   |
| ------------------------ | ---------------------------------------------------------- |
| コンポーネントパターン   | `forwardRef` + `clsx`                                      |
| variant 定義             | `"default" \| "success" \| "warning" \| "error" \| "info"` |
| size 定義                | `"sm" \| "md"`                                             |
| カラー指定方式           | Tailwind 標準クラス（`bg-gray-600`, `bg-green-500` 他）    |
| ARIA 属性                | `role="status"`                                            |
| children の型            | `React.ReactNode`（必須 props）                            |
| displayName              | `"Badge"`                                                  |
| テスト内のアサーション先 | Tailwind クラス名（`toHaveClass("bg-gray-600")`）          |

**テスト影響分析**:

既存17テストのうち、以下がカラー移行で影響を受ける:

| テスト名                                | アサーション内容               | 影響   |
| --------------------------------------- | ------------------------------ | ------ |
| defaultバリアントのスタイルを適用する   | `toHaveClass("bg-gray-600")`   | 要修正 |
| successバリアントのスタイルを適用する   | `toHaveClass("bg-green-500")`  | 要修正 |
| warningバリアントのスタイルを適用する   | `toHaveClass("bg-orange-400")` | 要修正 |
| errorバリアントのスタイルを適用する     | `toHaveClass("bg-red-500")`    | 要修正 |
| infoバリアントのスタイルを適用する      | `toHaveClass("bg-blue-500")`   | 要修正 |
| デフォルトでdefaultバリアントを使用する | `toHaveClass("bg-gray-600")`   | 要修正 |

上記6テストはカラートークン移行時にアサーションを CSS 変数ベースのクラス名に変更する必要がある。残りの11テスト（レンダリング、サイズ、スタイル、ARIA、className、ref、追加props）は影響なし。

#### Task 1-2: EmptyState 現状分析

**対象ファイル**:

- `apps/desktop/src/renderer/components/atoms/EmptyState/index.tsx`（41行）
- `apps/desktop/src/renderer/components/atoms/EmptyState/EmptyState.test.tsx`（6テスト）

**分析項目**:

| 分析項目               | 現状の値                                                  |
| ---------------------- | --------------------------------------------------------- |
| コンポーネントパターン | `React.FC` + `memo` + `clsx`                              |
| props 定義             | `title`, `description?`, `icon?`, `action?`, `className?` |
| Icon 依存              | `../Icon` から `Icon`, `IconName` をインポート            |
| カラー指定方式         | Tailwind 標準クラス（`text-gray-400`, `text-gray-500`）   |
| ARIA 属性              | なし（要追加）                                            |
| displayName            | `"EmptyState"`                                            |
| action 渡し方          | `React.ReactNode`（JSX をそのまま渡す）                   |

**テスト影響分析**:

既存6テストは全てテキスト内容・DOM構造をアサーションしており、カラークラス名をアサーションしていないため、デザイントークン移行による影響はない。

| テスト名                         | アサーション内容        | 影響 |
| -------------------------------- | ----------------------- | ---- |
| タイトルを表示する               | `getByText`             | なし |
| 説明文を表示する                 | `getByText`             | なし |
| 説明文なしでもレンダリングできる | `getByText`             | なし |
| アイコンを表示する               | `getByText`（存在確認） | なし |
| アクションを表示する             | `getByRole("button")`   | なし |
| カスタムclassNameを追加する      | `toHaveClass`           | なし |

ただし `displayName` テストがテストファイルに含まれているため計6件。全件影響なし。

### Task 2: 新規コンポーネント要件定義

#### Task 2-1: StatusIndicator 機能要件

| 要件ID  | カテゴリ | 要件内容                                                                                              | 受入基準                                                    |
| ------- | -------- | ----------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| SI-F-01 | 機能     | 6種のステータス（running/success/error/warning/idle/offline）を視覚的に区別するカラードットを描画する | 各ステータスで異なるカラーが適用されていること              |
| SI-F-02 | 機能     | `running` ステータス時にデフォルトで pulse アニメーションを適用する                                   | `running` の場合に CSS アニメーションクラスが付与されること |
| SI-F-03 | 機能     | `pulse` props で任意のステータスに対してアニメーションの有無を明示制御できる                          | `pulse={true}` で任意ステータスにアニメーション付与         |
| SI-F-04 | 機能     | 3サイズ（sm:8px / md:10px / lg:14px）をサポートし、デフォルトは md                                    | サイズごとに正しいドット直径が適用されること                |
| SI-F-05 | 機能     | `offline` ステータス時に破線ボーダー（`border-dashed`）を表示する                                     | `offline` の場合に `border-dashed` スタイルが適用されること |
| SI-F-06 | 機能     | `label` props が指定された場合、その値を `aria-label` として使用する                                  | `label="稼働中"` → `aria-label="稼働中"`                    |

**ステータスカラーマッピング**:

| ステータス | CSS 変数トークン   | フォールバック色     |
| ---------- | ------------------ | -------------------- |
| running    | `--status-primary` | `#007AFF`            |
| success    | `--status-success` | `#34C759`            |
| error      | `--status-error`   | `#FF3B30`            |
| warning    | `--status-warning` | `#FF9500`            |
| idle       | `--text-muted`     | `rgba(60,60,67,0.3)` |
| offline    | `--text-muted`     | `rgba(60,60,67,0.3)` |

#### Task 2-2: FilterChip 機能要件

| 要件ID  | カテゴリ | 要件内容                                                                       | 受入基準                                            |
| ------- | -------- | ------------------------------------------------------------------------------ | --------------------------------------------------- |
| FC-F-01 | 機能     | ピル形状で選択/非選択の2状態を切り替えられるフィルターコンポーネントを描画する | クリックで `isSelected` に応じたスタイル切替        |
| FC-F-02 | 機能     | 非選択時: `--bg-tertiary` 背景 + `--text-secondary` テキスト                   | 非選択時のカラーが正しいこと                        |
| FC-F-03 | 機能     | 選択時: `--status-primary` 背景 + `--text-inverse` テキスト                    | 選択時のカラーが正しいこと                          |
| FC-F-04 | 機能     | `count` props がある場合、ラベル右に `(count)` を表示する                      | `count={5}` → 「ラベル (5)」が表示されること        |
| FC-F-05 | 機能     | `icon` props がある場合、ラベル左に 16px アイコンを表示する                    | アイコン要素がラベル左に描画されること              |
| FC-F-06 | 機能     | `disabled={true}` 時に `onClick` コールバックが発火しない                      | disabled 状態でクリックしてもコールバック未呼び出し |
| FC-F-07 | 機能     | トランジションは `--duration-fast`（100ms）+ `--ease-default` で適用する       | CSS transition プロパティが設定されていること       |

#### Task 2-3: SkeletonCard 機能要件

| 要件ID  | カテゴリ | 要件内容                                                                                            | 受入基準                                                   |
| ------- | -------- | --------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| SK-F-01 | 機能     | 3バリエーション（default/stat/list-item）のローディングプレースホルダーを描画する                   | 各バリエーションで異なる内部構造がレンダリングされること   |
| SK-F-02 | 機能     | `default` バリエーション: ヘッダーライン（幅60%、高さ12px）+ ボディライン2本（幅80%/100%、高さ8px） | DOM 要素が3つ描画され、各サイズが正しいこと                |
| SK-F-03 | 機能     | `stat` バリエーション: 数値プレースホルダー（幅40%、高さ24px）+ ラベルライン（幅60%、高さ8px）      | DOM 要素が2つ描画され、各サイズが正しいこと                |
| SK-F-04 | 機能     | `list-item` バリエーション: アイコン円（32px）+ テキストライン2本（幅70%/50%、高さ8px）             | 円形要素1つ + ライン要素2つが描画されること                |
| SK-F-05 | 機能     | パルスアニメーション: `opacity: 0.4 ⟷ 1.0`、1.5秒周期で循環する                                     | `animate={true}`（デフォルト）でアニメーションクラスが付与 |
| SK-F-06 | 機能     | `animate={false}` でアニメーションを無効化する                                                      | アニメーションクラスが付与されないこと                     |
| SK-F-07 | 機能     | `height` / `borderRadius` の props でカスタム値を適用する                                           | `height="200px"` → インラインスタイルに反映されること      |

#### Task 2-4: SuggestionBubble 機能要件

| 要件ID  | カテゴリ | 要件内容                                                                                  | 受入基準                                                         |
| ------- | -------- | ----------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| SB-F-01 | 機能     | ピル形状のアクション提案ボタンを描画する                                                  | `--radius-full` の角丸ピル形状がレンダリングされること           |
| SB-F-02 | 機能     | 3サイズ（sm:36px / md:44px / lg:56px）をサポートし、デフォルトは md                       | サイズごとに正しい高さが適用されること                           |
| SB-F-03 | 機能     | `icon` props がある場合、テキスト左にアイコンを表示する                                   | アイコン要素がラベル左に描画されること                           |
| SB-F-04 | 機能     | ホバー時に `scale(var(--scale-hover))` + `--bg-elevated` + `--shadow-sm` を適用する       | ホバー状態で CSS が変化すること                                  |
| SB-F-05 | 機能     | アクティブ時に `scale(var(--scale-active))` を適用する                                    | アクティブ状態で CSS が変化すること                              |
| SB-F-06 | 機能     | タップ後に `success-bounce` アニメーションを再生する                                      | onClick 発火後にアニメーションクラスが一時的に付与される         |
| SB-F-07 | 機能     | `disabled={true}` 時に `opacity: 0.5`、カーソル `not-allowed`、インタラクション無効にする | disabled 状態の CSS が適用され、クリック無効                     |
| SB-F-08 | 機能     | キーボード操作（Enter / Space）で `onClick` を発火する                                    | `fireEvent.keyDown(el, { key: "Enter" })` でコールバック呼び出し |

#### Task 2-5: RelativeTime 機能要件

| 要件ID  | カテゴリ | 要件内容                                                                                                                         | 受入基準                                              |
| ------- | -------- | -------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| RT-F-01 | 機能     | ISO 8601 形式のタイムスタンプを受け取り、相対時刻テキストを描画する                                                              | `timestamp="2026-02-22T10:00:00Z"` → 相対テキスト表示 |
| RT-F-02 | 機能     | 3フォーマット（auto/short/long）で異なる表示テキストを出力する                                                                   | フォーマットごとに定義された表示ルールに従うこと      |
| RT-F-03 | 機能     | `auto` フォーマット: < 1分→"たった今"、< 1時間→"N分前"、< 24時間→"N時間前"、< 7日→"N日前"、>= 7日→"YYYY/MM/DD"                   | 各閾値で正しいテキストが出力されること                |
| RT-F-04 | 機能     | `short` フォーマット: < 1分→"今"、< 1時間→"Nm"、< 24時間→"Nh"、< 7日→"Nd"、>= 7日→"MM/DD"                                        | 各閾値で正しいテキストが出力されること                |
| RT-F-05 | 機能     | `long` フォーマット: < 1分→"たった今"、< 1時間→"N分前"、< 24時間→"N時間前"、< 2日→"昨日"、< 7日→"N日前"、>= 7日→"YYYY年MM月DD日" | 各閾値で正しいテキストが出力されること                |
| RT-F-06 | 機能     | `refreshInterval`（デフォルト 60000ms）ごとに `setInterval` で再レンダリングする                                                 | タイマーが指定間隔で発火し、テキストが更新されること  |
| RT-F-07 | 機能     | アンマウント時に `clearInterval` でタイマーを解除する                                                                            | アンマウント後にタイマーが残存しないこと              |
| RT-F-08 | 機能     | `title` 属性に `YYYY/MM/DD HH:mm:ss` 形式の絶対時刻を設定する                                                                    | `title` 属性の値がフォーマット通りであること          |
| RT-F-09 | 機能     | `showAbsoluteOnHover={false}` で `title` 属性を非表示にする                                                                      | `title` 属性が設定されていないこと                    |
| RT-F-10 | 機能     | 無効なタイムスタンプ（不正文字列、空文字列）を受け取った場合にフォールバック表示（`"--"`）を出力する                             | 不正入力時にクラッシュせず `"--"` が表示されること    |

### Task 3: 既存コンポーネント拡張要件定義

#### Task 3-1: Badge 拡張要件

| 要件ID  | カテゴリ   | 要件内容                                                                            | 受入基準                                                     |
| ------- | ---------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| BD-F-01 | 機能拡張   | `primary` variant を追加する（`--status-primary` 背景 + `--text-inverse` テキスト） | `variant="primary"` で正しいカラーが適用されること           |
| BD-F-02 | 機能拡張   | `content` props（`string \| number`）を追加する                                     | `content="New"` で "New" が表示されること                    |
| BD-F-03 | 機能拡張   | `content` が `number` 型の場合、`aria-label="{content}件"` を自動設定する           | `content={5}` → `aria-label="5件"`                           |
| BD-F-04 | 機能拡張   | 明示的な `aria-label` が props で指定された場合は自動設定を上書きする               | `aria-label="未読5件"` が `content` 由来より優先されること   |
| BD-F-05 | 機能拡張   | `content` と `children` の両方が指定された場合は `children` を優先する              | `children` の内容が描画されること                            |
| BD-F-06 | 後方互換性 | `children` を必須 props から任意 props に変更する（`content` が代替を提供するため） | `children` 未指定 + `content` 指定で正常動作すること         |
| BD-F-07 | 後方互換性 | 既存の5 variant（default/success/warning/error/info）の視覚的挙動を維持する         | 既存テスト17件（アサーション修正後）が全て PASS すること     |
| BD-F-08 | 移行       | Tailwind 標準カラーを CSS 変数ベースのデザイントークンに移行する                    | `bg-gray-600` → `var(--status-default)` 相当のスタイルに変更 |

#### Task 3-2: EmptyState 拡張要件

| 要件ID  | カテゴリ   | 要件内容                                                                                                        | 受入基準                                                                   |
| ------- | ---------- | --------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| ES-F-01 | 機能拡張   | `suggestions` props（`Array<{ label, icon?, onClick }>`）を追加し、SuggestionBubble で描画する                  | `suggestions` 配列の各要素が SuggestionBubble としてレンダリングされること |
| ES-F-02 | 機能拡張   | `compact` モード（`compact={true}`）でアイコン32px、見出し `--text-base`、パディング20px にする                 | compact 時に各サイズが縮小されること                                       |
| ES-F-03 | 機能拡張   | `mood="welcoming"`: アイコンカラー `--status-primary`、背景に薄い青グラデーション                               | welcoming 時に正しいスタイルが適用されること                               |
| ES-F-04 | 機能拡張   | `mood="encouraging"`: アイコンカラー `--status-info`、ニュートラル背景                                          | encouraging 時に正しいスタイルが適用されること                             |
| ES-F-05 | 機能拡張   | `mood="celebrating"`: アイコンカラー `--status-success`、アイコンに `success-bounce` アニメーション             | celebrating 時にアニメーションクラスが付与されること                       |
| ES-F-06 | 機能拡張   | `action` props にオブジェクト形式（`{ label, onClick, variant? }`）を受け入れ、内部で Button をレンダリングする | オブジェクト形式の action でボタンが描画されること                         |
| ES-F-07 | 後方互換性 | 既存の `action` が `React.ReactNode` の場合はそのままレンダリングする                                           | 既存テスト6件が全て PASS すること                                          |
| ES-F-08 | 後方互換性 | 既存の props（title, description, icon, action, className）の挙動を変更しない                                   | 現行の使い方で視覚的変化が発生しないこと                                   |
| ES-F-09 | 移行       | Tailwind 標準カラー（`text-gray-400`, `text-gray-500`）を CSS 変数ベースに移行する                              | デザイントークンのカラーが適用されること                                   |

### Task 4: デザイントークン依存の確認

TASK-UI-00-TOKENS で定義された以下のトークンと各コンポーネントの対応関係を確定する。

#### カラートークン依存マトリクス

| トークン           | StatusIndicator | FilterChip | Badge | SkeletonCard | SuggestionBubble | EmptyState | RelativeTime |
| ------------------ | :-------------: | :--------: | :---: | :----------: | :--------------: | :--------: | :----------: |
| `--bg-primary`     |                 |            |       |              |                  |            |              |
| `--bg-secondary`   |                 |            |       |              |                  |            |              |
| `--bg-tertiary`    |                 |   **o**    |       |    **o**     |      **o**       |            |              |
| `--bg-elevated`    |                 |            |       |              |      **o**       |            |              |
| `--text-primary`   |                 |            |       |              |      **o**       |            |    **o**     |
| `--text-secondary` |                 |   **o**    |       |              |      **o**       |            |              |
| `--text-muted`     |      **o**      |            |       |              |                  |   **o**    |              |
| `--text-inverse`   |                 |   **o**    | **o** |              |                  |            |              |
| `--border-default` |                 |            |       |              |                  |            |              |
| `--border-subtle`  |                 |            |       |              |      **o**       |            |              |
| `--status-primary` |      **o**      |   **o**    | **o** |              |                  |   **o**    |              |
| `--status-success` |      **o**      |            | **o** |              |                  |   **o**    |              |
| `--status-warning` |      **o**      |            | **o** |              |                  |            |              |
| `--status-error`   |      **o**      |            | **o** |              |                  |            |              |
| `--status-info`    |                 |            | **o** |              |                  |   **o**    |              |

#### アニメーション・レイアウトトークン依存

| トークン             | 使用コンポーネント                                      |
| -------------------- | ------------------------------------------------------- |
| `--radius-full`      | FilterChip, SuggestionBubble                            |
| `--radius-md`        | SkeletonCard                                            |
| `--duration-fast`    | FilterChip                                              |
| `--duration-default` | Badge, SuggestionBubble                                 |
| `--ease-default`     | FilterChip, SuggestionBubble                            |
| `--scale-hover`      | SuggestionBubble                                        |
| `--scale-active`     | SuggestionBubble                                        |
| `--shadow-sm`        | SuggestionBubble                                        |
| `success-bounce`     | SuggestionBubble（タップ後）, EmptyState（celebrating） |

### Task 5: アクセシビリティ要件定義（WCAG 2.1 AA）

#### ARIA 属性マトリクス

| コンポーネント   | 要素       | role       | aria-label                                         | aria-checked   | aria-disabled | aria-busy | tabIndex |
| ---------------- | ---------- | ---------- | -------------------------------------------------- | -------------- | ------------- | --------- | -------- |
| StatusIndicator  | `<span>`   | `status`   | `"ステータス: {status}"` または `label` props の値 | -              | -             | -         | -        |
| FilterChip       | `<button>` | `checkbox` | -                                                  | `{isSelected}` | `{disabled}`  | -         | `0`      |
| Badge            | `<span>`   | `status`   | `content` が number なら `"{content}件"`           | -              | -             | -         | -        |
| SkeletonCard     | `<div>`    | `status`   | `"読み込み中"`                                     | -              | -             | `true`    | -        |
| SuggestionBubble | `<div>`    | `button`   | -                                                  | -              | `{disabled}`  | -         | `0`      |
| EmptyState       | `<div>`    | -          | -                                                  | -              | -             | -         | -        |
| RelativeTime     | `<time>`   | -          | -                                                  | -              | -             | -         | -        |

#### キーボード操作要件

| コンポーネント   | キー          | 動作                       |
| ---------------- | ------------- | -------------------------- |
| FilterChip       | Enter / Space | `onClick` 発火（選択切替） |
| SuggestionBubble | Enter / Space | `onClick` 発火             |
| SuggestionBubble | Tab           | フォーカス移動             |
| FilterChip       | Tab           | フォーカス移動             |

#### コントラスト比要件

| 組み合わせ                                      | 最小コントラスト比 | 対象                                   |
| ----------------------------------------------- | ------------------ | -------------------------------------- |
| `--text-primary` on `--bg-primary`              | 4.5:1              | 通常テキスト                           |
| `--text-secondary` on `--bg-tertiary`           | 4.5:1              | FilterChip 非選択テキスト              |
| `--text-inverse` on `--status-primary`          | 4.5:1              | FilterChip 選択テキスト、Badge primary |
| `--text-muted`（idle/offline ステータスドット） | 3:1                | UI 部品（StatusIndicator ドット）      |
| `--status-*` カラー                             | 3:1                | UI 部品（StatusIndicator ドット）      |

### Task 6: テーマ横断要件

3テーマ（kanagawa-dragon / light / dark）で全コンポーネントが正しく表示されることを検証する要件。

| テーマ          | ベーステーマ | 検証ポイント                                       |
| --------------- | ------------ | -------------------------------------------------- |
| kanagawa-dragon | dark系       | 暗い背景でのコントラスト、ステータスカラーの視認性 |
| light           | Apple HIG    | `#FFFFFF` 背景でのカラー、ボーダーの視認性         |
| dark            | Apple HIG    | `#000000` 背景でのカラー、ステータスカラーの明度   |

**テーマテスト方式**: 各コンポーネントのテストファイル内で `describe.each` を使用し、`[data-theme]` 属性を切り替えてレンダリングテストを実行する。

### Task 7: コンポーネント間依存の整理

| 依存元     | 依存先           | 依存内容                              | 実装順序制約                    |
| ---------- | ---------------- | ------------------------------------- | ------------------------------- |
| EmptyState | SuggestionBubble | `suggestions` props の描画に使用      | SuggestionBubble を先に実装する |
| EmptyState | Button（既存）   | `action` オブジェクト形式の描画に使用 | Button は既存（制約なし）       |
| EmptyState | Icon（既存）     | `icon` props の描画に使用             | Icon は既存（制約なし）         |

**推奨実装順序**:

1. StatusIndicator, FilterChip, SkeletonCard, RelativeTime（独立、並列実装可能）
2. Badge（独立、並列実装可能）
3. SuggestionBubble（独立だが EmptyState の前に完了が必要）
4. EmptyState（SuggestionBubble に依存）

## 参照資料

| 参照                 | パス                                                                                     |
| -------------------- | ---------------------------------------------------------------------------------------- |
| Atoms仕様書          | `docs/30-workflows/skill-import-agent-system/tasks/ui-overhaul/00-2-atoms-components.md` |
| 既存Badge実装        | `apps/desktop/src/renderer/components/atoms/Badge/index.tsx`                             |
| 既存Badgeテスト      | `apps/desktop/src/renderer/components/atoms/Badge/Badge.test.tsx`                        |
| 既存EmptyState実装   | `apps/desktop/src/renderer/components/atoms/EmptyState/index.tsx`                        |
| 既存EmptyStateテスト | `apps/desktop/src/renderer/components/atoms/EmptyState/EmptyState.test.tsx`              |
| atoms/index.ts       | `apps/desktop/src/renderer/components/atoms/index.ts`                                    |
| UIコンポーネント仕様 | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`                  |
| デザイン原則         | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md`           |
| デザインシステム     | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md`               |
| UIアーキテクチャ     | `.claude/skills/aiworkflow-requirements/references/arch-ui-components.md`                |
| テストパターン       | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md`        |
| a11yテスト           | `.claude/skills/aiworkflow-requirements/references/testing-accessibility.md`             |
| 状態管理             | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`             |
| アーキテクチャルール | `.claude/rules/01-architecture.md`                                                       |
| 既知の落とし穴       | `.claude/rules/06-known-pitfalls.md`                                                     |

## 統合テスト連携

Phase 1 では統合テストの実行はない。要件レベルでの統合テスト戦略は以下の通り:

- EmptyState → SuggestionBubble の連携テスト: Phase 4（テスト作成）で設計
- atoms/index.ts エクスポート検証: Phase 4 で設計
- 3テーマ横断テスト: Phase 4 で describe.each パターンを設計

## 成果物

| #   | 成果物                             | パス                                                     |
| --- | ---------------------------------- | -------------------------------------------------------- |
| 1   | 既存コンポーネント分析ドキュメント | `outputs/phase-1/existing-component-analysis.md`         |
| 2   | コンポーネント要件定義ドキュメント | `outputs/phase-1/component-requirements.md`              |
| 3   | アクセシビリティ要件ドキュメント   | `outputs/phase-1/accessibility-requirements.md`          |
| 4   | テーマ要件ドキュメント             | `outputs/phase-1/theme-requirements.md`                  |
| 5   | 後方互換性要件ドキュメント         | `outputs/phase-1/backward-compatibility-requirements.md` |

**注意**: 成果物ドキュメントは本仕様書（phase-1-requirements.md）に全内容が包含されているため、Phase 2 はこのファイルを直接参照する。outputs/ ディレクトリへの個別ファイル分割は Phase 2 の設計判断に委ねる。

## 完了条件

- [ ] Badge の現状コード（52行）を分析し、拡張で影響を受けるテスト6件を特定した
- [ ] EmptyState の現状コード（41行）を分析し、既存テスト6件への影響が「なし」であることを確認した
- [ ] 新規5コンポーネント（StatusIndicator, FilterChip, SkeletonCard, SuggestionBubble, RelativeTime）の機能要件を要件IDつきで定義した
- [ ] 既存2コンポーネント（Badge, EmptyState）の拡張要件と後方互換性要件を定義した
- [ ] 全7コンポーネントのデザイントークン依存（カラー・アニメーション・レイアウト）をマトリクスで整理した
- [ ] WCAG 2.1 AA 要件（ARIA属性、キーボード操作、コントラスト比）をマトリクスで定義した
- [ ] 3テーマ横断要件（kanagawa-dragon / light / dark）を定義した
- [ ] コンポーネント間依存（EmptyState → SuggestionBubble）と推奨実装順序を確定した
- [ ] 全テスト環境ルール（P9, P13, P31, P39, P40）を要件に反映した

## Phase末端アクション【必須】

- [ ] 本仕様書を作成し、`task-ui-00-atoms/phase-1-requirements.md` に配置した
- [ ] `artifacts.json` の Phase 1 ステータスを `in_progress` に更新する（Phase 2 開始時）

## 依存関係

| 依存種別     | 対象              | 内容                                         |
| ------------ | ----------------- | -------------------------------------------- |
| 前提タスク   | TASK-UI-00-TOKENS | CSS 変数トークンが定義済みであること         |
| ブロック対象 | Phase 2（設計）   | 本 Phase の要件セットが Phase 2 の入力となる |

## 次のPhase

Phase 2（設計）: 本 Phase で確定した要件をもとに、7コンポーネントのインターフェース設計・デザイントークンマッピング・アクセシビリティ設計・テスト設計概要・アニメーション設計を行う。
