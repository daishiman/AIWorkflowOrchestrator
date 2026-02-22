# 実装ガイド -- TASK-UI-00-ATOMS

| 項目     | 値                                          |
| -------- | ------------------------------------------- |
| タスクID | TASK-UI-00-ATOMS                            |
| Phase    | 12                                          |
| 作成日   | 2026-02-23                                  |
| 対象     | 7 Atoms コンポーネント（新規5 + 既存拡張2） |

---

## Part 1: やさしい解説

### 1.1 Atomic Design って何?

お料理に例えると、とても分かりやすくなります。

- **Atoms（原子）** = 「塩」「砂糖」「卵」のような、それ以上分けられない最小の材料
- **Molecules（分子）** = 「目玉焼き」のように、いくつかの材料を組み合わせた小さな料理
- **Organisms（有機体）** = 「朝食セット」のように、複数の小さな料理を組み合わせた一皿

今回作ったのは **Atoms** です。アプリの画面を構成する一番小さな部品で、ボタンやアイコンと同じ仲間です。これらを後から組み合わせて、もっと大きな画面の部品を作ります。

### 1.2 デザイントークンって何?

学校の制服を思い出してください。「ブレザーは紺色」「ネクタイは赤」「靴下は白」のように、色やサイズのルールが決まっていますよね。デザイントークンは、アプリの「制服のルール表」です。

たとえば「成功を表す色は緑」「エラーは赤」「ふつうの文字は黒」と決めておくと、アプリ全体で色がバラバラにならずに済みます。今回作ったコンポーネントは全て、このルール表（CSS変数）を参照して色を決めています。

ルール表を1か所変えるだけで、アプリ全体の色が一斉に変わります。テーマ切り替え（ライトモード/ダークモード）もこの仕組みで実現しています。

### 1.3 各コンポーネントの紹介

#### StatusIndicator -- 信号機

交差点の信号機は、赤・黄・青の色だけで「止まれ」「注意」「進め」を伝えますよね。StatusIndicator はそれと同じで、小さな丸い点の色でシステムの状態を伝えます。

- 青い点がピカピカ光っていたら「動いている最中」
- 緑の点は「うまくいった」
- 赤い点は「何か問題がある」
- 灰色の点は「休んでいる」または「つながっていない」

#### FilterChip -- 洋服店のサイズタグ

洋服売り場にある「S」「M」「L」のサイズタグを思い浮かべてください。選びたいサイズのタグを手に取ると、そのサイズの服だけが見えるようになります。FilterChip はこのタグと同じで、押すと「選ばれた状態」に変わり、データを絞り込めます。

#### Badge -- 手紙の封蝋（ふうろう）

昔の手紙には赤い蝋（ろう）の印が押してあって、「これは大事な手紙ですよ」と目印になっていました。Badge はこの封蝋のように、数字やラベルを小さな丸い枠に入れて「ここに注目!」と教えてくれます。通知の件数を示す赤い丸もBadge の一種です。

#### SkeletonCard -- レストランのプレースマット

レストランでテーブルに着くと、料理が届く前にお皿やフォークの位置を示すマットが敷いてありますよね。「もうすぐ届きますよ」というサインです。SkeletonCard はそれと同じで、データを読み込んでいる間、「ここにカードが入りますよ」という灰色の枠を表示します。

#### SuggestionBubble -- 店員さんの提案カード

お店で店員さんが「こちらの商品もいかがですか?」と提案してくれることがありますよね。SuggestionBubble はその提案カードと同じで、ユーザーが次にやりたいことを丸いボタンで提案します。押すとそのアクションが実行されます。

#### EmptyState -- 引っ越し直後の部屋

新しい部屋に引っ越した直後は、何もない空っぽの状態です。でも「ここにソファを置くといいですよ」「まずはカーテンから揃えましょう」と案内があると安心しますよね。EmptyState はデータがまだ何もないときに、「こう始めましょう」というガイドを表示します。

#### RelativeTime -- 友達との会話での時間表現

友達と話すとき、「2026年2月23日12時34分56秒に送ったよ」とは言いませんよね。「さっき送ったよ」「3分前に送ったよ」「昨日送ったよ」と言います。RelativeTime はこの「人間らしい時間の言い方」をしてくれるコンポーネントです。

---

## Part 2: 技術者向け実装詳細

### 2.1 ファイル構成

```
apps/desktop/src/renderer/components/atoms/
  index.ts                          # barrel export
  StatusIndicator/
    index.tsx                       # 新規
    StatusIndicator.test.tsx
  FilterChip/
    index.tsx                       # 新規
    FilterChip.test.tsx
  Badge/
    index.tsx                       # 既存拡張
    Badge.test.tsx
  SkeletonCard/
    index.tsx                       # 新規
    SkeletonCard.test.tsx
  SuggestionBubble/
    index.tsx                       # 新規
    SuggestionBubble.test.tsx
  EmptyState/
    index.tsx                       # 既存拡張
    EmptyState.test.tsx
  RelativeTime/
    index.tsx                       # 新規
    RelativeTime.test.tsx
```

### 2.2 全コンポーネントの型定義

#### StatusIndicator

```typescript
export interface StatusIndicatorProps {
  status: "running" | "success" | "error" | "warning" | "idle" | "offline";
  size?: "sm" | "md" | "lg"; // デフォルト: "md"
  pulse?: boolean; // デフォルト: status === "running" の場合 true
  label?: string; // デフォルト: `ステータス: ${status}`
}
```

| Props  | 型                                                                      | 必須 | デフォルト              | 説明                     |
| ------ | ----------------------------------------------------------------------- | ---- | ----------------------- | ------------------------ |
| status | `"running" \| "success" \| "error" \| "warning" \| "idle" \| "offline"` | Yes  | -                       | 表示するステータス       |
| size   | `"sm" \| "md" \| "lg"`                                                  | No   | `"md"`                  | ドットのサイズ           |
| pulse  | `boolean`                                                               | No   | `status === "running"`  | パルスアニメーション有無 |
| label  | `string`                                                                | No   | `ステータス: ${status}` | aria-label の値          |

#### FilterChip

```typescript
export interface FilterChipProps {
  label: string;
  isSelected: boolean;
  count?: number;
  icon?: string;
  onClick: () => void;
  disabled?: boolean; // デフォルト: false
}
```

| Props      | 型           | 必須 | デフォルト | 説明                     |
| ---------- | ------------ | ---- | ---------- | ------------------------ |
| label      | `string`     | Yes  | -          | チップのラベルテキスト   |
| isSelected | `boolean`    | Yes  | -          | 選択状態                 |
| count      | `number`     | No   | -          | 件数表示 `(count)` 形式  |
| icon       | `string`     | No   | -          | Iconコンポーネントのname |
| onClick    | `() => void` | Yes  | -          | クリックハンドラ         |
| disabled   | `boolean`    | No   | `false`    | 無効状態                 |

#### Badge

```typescript
export interface BadgeProps extends Omit<
  React.HTMLAttributes<HTMLSpanElement>,
  "content"
> {
  variant?: "default" | "primary" | "success" | "warning" | "error" | "info";
  size?: "sm" | "md";
  children?: React.ReactNode;
  content?: string | number;
}
```

| Props    | 型                                                                      | 必須 | デフォルト  | 説明                                                            |
| -------- | ----------------------------------------------------------------------- | ---- | ----------- | --------------------------------------------------------------- |
| variant  | `"default" \| "primary" \| "success" \| "warning" \| "error" \| "info"` | No   | `"default"` | 色バリアント                                                    |
| size     | `"sm" \| "md"`                                                          | No   | `"md"`      | サイズ                                                          |
| children | `React.ReactNode`                                                       | No   | -           | 表示内容（content より優先）                                    |
| content  | `string \| number`                                                      | No   | -           | 表示内容。number型の場合 `aria-label="${content}件"` を自動付与 |
| ref      | `Ref<HTMLSpanElement>`                                                  | No   | -           | forwardRef 対応                                                 |

#### SkeletonCard

```typescript
export interface SkeletonCardProps {
  height?: string;
  borderRadius?: string;
  variant?: "default" | "stat" | "list-item"; // デフォルト: "default"
  animate?: boolean; // デフォルト: true
}
```

| Props        | 型                                   | 必須 | デフォルト  | 説明                          |
| ------------ | ------------------------------------ | ---- | ----------- | ----------------------------- |
| height       | `string`                             | No   | -           | カスタム高さ（例: `"200px"`） |
| borderRadius | `string`                             | No   | -           | カスタム角丸                  |
| variant      | `"default" \| "stat" \| "list-item"` | No   | `"default"` | レイアウトバリエーション      |
| animate      | `boolean`                            | No   | `true`      | パルスアニメーション有無      |

#### SuggestionBubble

```typescript
export interface SuggestionBubbleProps {
  label: string;
  icon?: string;
  onClick: () => void;
  size?: "sm" | "md" | "lg"; // デフォルト: "md"
  disabled?: boolean; // デフォルト: false
}
```

| Props    | 型                     | 必須 | デフォルト | 説明                     |
| -------- | ---------------------- | ---- | ---------- | ------------------------ |
| label    | `string`               | Yes  | -          | ボタンのラベル           |
| icon     | `string`               | No   | -          | Iconコンポーネントのname |
| onClick  | `() => void`           | Yes  | -          | クリックハンドラ         |
| size     | `"sm" \| "md" \| "lg"` | No   | `"md"`     | ボタンサイズ             |
| disabled | `boolean`              | No   | `false`    | 無効状態                 |

#### EmptyState

```typescript
interface ActionObject {
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary";
}

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: IconName;
  action?: React.ReactNode | ActionObject;
  suggestions?: Array<{ label: string; icon?: string; onClick: () => void }>;
  compact?: boolean; // デフォルト: false
  mood?: "welcoming" | "encouraging" | "celebrating";
  className?: string;
}
```

| Props       | 型                                              | 必須 | デフォルト | 説明                                               |
| ----------- | ----------------------------------------------- | ---- | ---------- | -------------------------------------------------- |
| title       | `string`                                        | Yes  | -          | メインメッセージ                                   |
| description | `string`                                        | No   | -          | 補足説明テキスト                                   |
| icon        | `IconName`                                      | No   | -          | 上部に表示するアイコン                             |
| action      | `React.ReactNode \| ActionObject`               | No   | -          | CTAボタン。オブジェクト形式またはReactNode         |
| suggestions | `Array<{ label; icon?; onClick }>`              | No   | -          | SuggestionBubble 配列                              |
| compact     | `boolean`                                       | No   | `false`    | コンパクト表示（アイコン32px、パディングp-5）      |
| mood        | `"welcoming" \| "encouraging" \| "celebrating"` | No   | -          | アイコンの色テーマ。celebrating 時は bounce アニメ |
| className   | `string`                                        | No   | -          | 追加CSSクラス                                      |

#### RelativeTime

```typescript
export interface RelativeTimeProps {
  timestamp: string;
  format?: "auto" | "short" | "long"; // デフォルト: "auto"
  refreshInterval?: number; // デフォルト: 60000 (ms)
  showAbsoluteOnHover?: boolean; // デフォルト: true
}
```

| Props               | 型                            | 必須 | デフォルト | 説明                            |
| ------------------- | ----------------------------- | ---- | ---------- | ------------------------------- |
| timestamp           | `string`                      | Yes  | -          | ISO 8601 形式のタイムスタンプ   |
| format              | `"auto" \| "short" \| "long"` | No   | `"auto"`   | 表示フォーマット                |
| refreshInterval     | `number`                      | No   | `60000`    | 自動更新間隔（ミリ秒）          |
| showAbsoluteOnHover | `boolean`                     | No   | `true`     | ホバー時に絶対時刻を title 表示 |

**フォーマット別の表示パターン:**

| 経過時間 | auto       | short | long           |
| -------- | ---------- | ----- | -------------- |
| < 1分    | たった今   | 今    | たった今       |
| 5分      | 5分前      | 5m    | 5分前          |
| 3時間    | 3時間前    | 3h    | 3時間前        |
| 1日      | 1日前      | 1d    | 昨日           |
| 3日      | 3日前      | 3d    | 3日前          |
| >= 7日   | YYYY/MM/DD | MM/DD | YYYY年MM月DD日 |

### 2.3 使用例

#### StatusIndicator

```tsx
import { StatusIndicator } from "../components/atoms";

// 基本使用
<StatusIndicator status="running" />
<StatusIndicator status="success" />
<StatusIndicator status="error" />

// サイズ指定
<StatusIndicator status="running" size="sm" />
<StatusIndicator status="running" size="lg" />

// パルス制御
<StatusIndicator status="idle" pulse={true} />
<StatusIndicator status="running" pulse={false} />

// カスタムラベル
<StatusIndicator status="running" label="エージェント実行中" />
```

#### FilterChip

```tsx
import { FilterChip } from "../components/atoms";

// 基本使用
<FilterChip label="すべて" isSelected={true} onClick={() => setFilter("all")} />
<FilterChip label="実行中" isSelected={false} onClick={() => setFilter("running")} />

// 件数付き
<FilterChip label="エラー" isSelected={false} count={3} onClick={handleClick} />

// アイコン付き
<FilterChip label="お気に入り" isSelected={true} icon="heart" onClick={handleClick} />

// 無効状態
<FilterChip label="アーカイブ" isSelected={false} disabled={true} onClick={handleClick} />
```

#### Badge

```tsx
import { Badge } from "../components/atoms";

// 基本使用
<Badge>New</Badge>
<Badge variant="primary">重要</Badge>
<Badge variant="success">完了</Badge>
<Badge variant="error">失敗</Badge>

// content props 使用
<Badge content={42} />             {/* 表示: "42", aria-label: "42件" */}
<Badge content="beta" />           {/* 表示: "beta" */}
<Badge content={0} />              {/* 表示: "0", aria-label: "0件" */}

// サイズ指定
<Badge size="sm" variant="error">3</Badge>

// children と content の優先順位
<Badge content={42}>カスタム</Badge>  {/* "カスタム" が表示される */}
```

#### SkeletonCard

```tsx
import { SkeletonCard } from "../components/atoms";

// デフォルト（テキストカード風）
<SkeletonCard />

// 統計カード風
<SkeletonCard variant="stat" />

// リストアイテム風
<SkeletonCard variant="list-item" />

// カスタムサイズ
<SkeletonCard height="200px" borderRadius="16px" />

// アニメーション無効
<SkeletonCard animate={false} />
```

#### SuggestionBubble

```tsx
import { SuggestionBubble } from "../components/atoms";

// 基本使用
<SuggestionBubble label="新しいワークフローを作成" onClick={handleCreate} />

// アイコン付き
<SuggestionBubble label="テンプレートを使う" icon="sparkles" onClick={handleTemplate} />

// サイズ指定
<SuggestionBubble label="小さい" size="sm" onClick={handleClick} />
<SuggestionBubble label="大きい" size="lg" onClick={handleClick} />

// 無効状態
<SuggestionBubble label="準備中" disabled={true} onClick={handleClick} />
```

#### EmptyState

```tsx
import { EmptyState } from "../components/atoms";

// 基本使用
<EmptyState title="データがありません" description="新しいデータを追加してください" />

// アイコン + アクションボタン（オブジェクト形式）
<EmptyState
  title="ワークフローがまだありません"
  description="最初のワークフローを作成しましょう"
  icon="file-text"
  action={{ label: "作成する", onClick: handleCreate, variant: "primary" }}
/>

// アクションボタン（ReactNode形式 -- 後方互換）
<EmptyState
  title="データなし"
  action={<button onClick={handleAdd}>追加する</button>}
/>

// 提案バブル付き
<EmptyState
  title="何から始めましょう?"
  icon="sparkles"
  mood="welcoming"
  suggestions={[
    { label: "チュートリアル", icon: "book", onClick: handleTutorial },
    { label: "テンプレート", icon: "layout", onClick: handleTemplate },
    { label: "インポート", icon: "upload", onClick: handleImport },
  ]}
/>

// コンパクト + mood
<EmptyState
  title="完了!"
  icon="check-circle"
  mood="celebrating"
  compact={true}
/>
```

#### RelativeTime

```tsx
import { RelativeTime } from "../components/atoms";

// 基本使用
<RelativeTime timestamp="2026-02-23T10:30:00Z" />

// short フォーマット
<RelativeTime timestamp="2026-02-23T10:30:00Z" format="short" />

// long フォーマット
<RelativeTime timestamp="2026-02-23T10:30:00Z" format="long" />

// カスタム更新間隔（30秒ごと）
<RelativeTime timestamp="2026-02-23T10:30:00Z" refreshInterval={30000} />

// ホバー時の絶対時刻表示を無効化
<RelativeTime timestamp="2026-02-23T10:30:00Z" showAbsoluteOnHover={false} />
```

### 2.4 デザイントークンマッピング表

各コンポーネントが参照する CSS 変数の一覧です。

| コンポーネント   | 使用するCSS変数                                                                                                                                    |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| StatusIndicator  | `--status-primary`, `--status-success`, `--status-error`, `--status-warning`, `--text-muted`, `--border-default`                                   |
| FilterChip       | `--status-primary`, `--text-inverse`, `--bg-tertiary`, `--text-secondary`, `--duration-fast`                                                       |
| Badge            | `--bg-tertiary`, `--text-primary`, `--status-primary`, `--status-success`, `--status-warning`, `--status-error`, `--status-info`, `--text-inverse` |
| SkeletonCard     | `--bg-tertiary`                                                                                                                                    |
| SuggestionBubble | `--bg-tertiary`, `--border-subtle`, `--text-primary`, `--text-secondary`, `--bg-elevated`                                                          |
| EmptyState       | `--status-primary`, `--status-info`, `--status-success`, `--text-muted`, `--text-secondary`                                                        |
| RelativeTime     | なし（セマンティック HTML `<time>` のみ、スタイルは親要素に委譲）                                                                                  |

### 2.5 サイズマッピング表

#### StatusIndicator

| サイズ | Tailwind クラス     | 実サイズ |
| ------ | ------------------- | -------- |
| sm     | `w-2 h-2`           | 8px      |
| md     | `w-[10px] h-[10px]` | 10px     |
| lg     | `w-[14px] h-[14px]` | 14px     |

#### SuggestionBubble

| サイズ | 高さクラス | テキスト    | 水平パディング | アイコンサイズ |
| ------ | ---------- | ----------- | -------------- | -------------- |
| sm     | `h-9`      | `text-sm`   | `px-4`         | 16px           |
| md     | `h-11`     | `text-sm`   | `px-5`         | 16px           |
| lg     | `h-14`     | `text-base` | `px-6`         | 20px           |

#### Badge

| サイズ | Tailwind クラス           | 高さ |
| ------ | ------------------------- | ---- |
| sm     | `px-2 py-0.5 text-xs h-5` | 20px |
| md     | `px-2.5 py-1 text-sm h-6` | 24px |

### 2.6 ARIA 属性一覧

| コンポーネント   | role       | aria-label                                            | その他 aria 属性                                           |
| ---------------- | ---------- | ----------------------------------------------------- | ---------------------------------------------------------- |
| StatusIndicator  | `status`   | `label` props または `ステータス: ${status}`          | -                                                          |
| FilterChip       | `checkbox` | -                                                     | `aria-checked={isSelected}`, `aria-disabled={disabled}`    |
| Badge            | `status`   | content が number の場合 `${content}件` を自動付与    | -                                                          |
| SkeletonCard     | `status`   | `読み込み中`                                          | `aria-busy="true"`                                         |
| SuggestionBubble | `button`   | -                                                     | `tabIndex={disabled ? -1 : 0}`, `aria-disabled={disabled}` |
| EmptyState       | `status`   | -                                                     | -                                                          |
| RelativeTime     | -          | 不正タイムスタンプ時のみ `aria-label={FALLBACK_TEXT}` | `dateTime={isoString}`, `title={absoluteTime}`             |

### 2.7 メモ化・パフォーマンス最適化

全コンポーネントは `React.memo` でメモ化されています。

| コンポーネント   | メモ化方式                    | 備考                            |
| ---------------- | ----------------------------- | ------------------------------- |
| StatusIndicator  | `memo(Component)`             | -                               |
| FilterChip       | `memo(Component)`             | -                               |
| Badge            | `memo(forwardRef(Component))` | forwardRef + memo の組み合わせ  |
| SkeletonCard     | `memo(Component)`             | -                               |
| SuggestionBubble | `memo(Component)`             | -                               |
| EmptyState       | `memo(Component)`             | -                               |
| RelativeTime     | `memo(Component)`             | useState + useEffect で定期更新 |

### 2.8 マイクロインタラクション

| コンポーネント   | インタラクション                                                                              |
| ---------------- | --------------------------------------------------------------------------------------------- |
| StatusIndicator  | `animate-pulse`（running 時デフォルト有効。pulse props で制御可能）                           |
| FilterChip       | `transition-all duration-[var(--duration-fast)]`（選択切替アニメーション）                    |
| Badge            | `transition-colors duration-200`                                                              |
| SkeletonCard     | `animate-pulse`（animate props で制御可能）                                                   |
| SuggestionBubble | `hover:scale-[1.02]`, `active:scale-[0.98]`, `hover:shadow-sm`, `transition-all duration-200` |
| EmptyState       | mood="celebrating" 時に `animate-bounce`（アイコンのみ）                                      |
| RelativeTime     | なし（テキストのみ）                                                                          |

### 2.9 barrel export

`apps/desktop/src/renderer/components/atoms/index.ts` で全コンポーネントをまとめて export しています。

```typescript
export { StatusIndicator, type StatusIndicatorProps } from "./StatusIndicator";
export { FilterChip, type FilterChipProps } from "./FilterChip";
export { Badge, type BadgeProps } from "./Badge";
export { SkeletonCard, type SkeletonCardProps } from "./SkeletonCard";
export {
  SuggestionBubble,
  type SuggestionBubbleProps,
} from "./SuggestionBubble";
export { EmptyState, type EmptyStateProps } from "./EmptyState";
export { RelativeTime, type RelativeTimeProps } from "./RelativeTime";
```

### 2.10 テスト実行コマンド

**P40 対策**: テストは必ず `apps/desktop` ディレクトリから実行してください。プロジェクトルートから実行すると `vitest.config.ts` の happy-dom 設定が読み込まれず `document is not defined` エラーが発生します。

```bash
# 全 7 コンポーネントのテスト一括実行
cd apps/desktop && pnpm vitest run src/renderer/components/atoms/StatusIndicator/StatusIndicator.test.tsx src/renderer/components/atoms/FilterChip/FilterChip.test.tsx src/renderer/components/atoms/Badge/Badge.test.tsx src/renderer/components/atoms/SkeletonCard/SkeletonCard.test.tsx src/renderer/components/atoms/SuggestionBubble/SuggestionBubble.test.tsx src/renderer/components/atoms/EmptyState/EmptyState.test.tsx src/renderer/components/atoms/RelativeTime/RelativeTime.test.tsx

# 個別実行
cd apps/desktop && pnpm vitest run src/renderer/components/atoms/StatusIndicator/StatusIndicator.test.tsx
cd apps/desktop && pnpm vitest run src/renderer/components/atoms/FilterChip/FilterChip.test.tsx
cd apps/desktop && pnpm vitest run src/renderer/components/atoms/Badge/Badge.test.tsx
cd apps/desktop && pnpm vitest run src/renderer/components/atoms/SkeletonCard/SkeletonCard.test.tsx
cd apps/desktop && pnpm vitest run src/renderer/components/atoms/SuggestionBubble/SuggestionBubble.test.tsx
cd apps/desktop && pnpm vitest run src/renderer/components/atoms/EmptyState/EmptyState.test.tsx
cd apps/desktop && pnpm vitest run src/renderer/components/atoms/RelativeTime/RelativeTime.test.tsx

# pnpm --filter による実行（代替）
pnpm --filter @repo/desktop exec vitest run src/renderer/components/atoms/StatusIndicator/StatusIndicator.test.tsx
```

#### テスト数サマリー

| コンポーネント   | テスト数 | カバー範囲                                                                                             |
| ---------------- | -------- | ------------------------------------------------------------------------------------------------------ |
| StatusIndicator  | 19       | ステータスカラー、パルス、サイズ、アクセシビリティ、テーマ、エッジケース                               |
| FilterChip       | 17       | レンダリング、選択状態、クリック、count/icon、アクセシビリティ、テーマ、エッジケース                   |
| Badge            | 28       | レンダリング、バリアント(6種)、サイズ、className、ref、content、テーマ、エッジケース                   |
| SkeletonCard     | 13       | バリエーション(3種)、アニメーション、カスタムスタイル、アクセシビリティ、テーマ                        |
| SuggestionBubble | 21       | レンダリング、サイズ、クリック、disabled、アイコン、キーボード、アクセシビリティ、テーマ、エッジケース |
| EmptyState       | 22       | レンダリング、suggestions、compact、mood、action(2形式)、テーマ、エッジケース                          |
| RelativeTime     | 22       | auto/short/long 各フォーマット、自動更新、HTML属性、エラー、テーマ                                     |
| **合計**         | **142**  |                                                                                                        |

### 2.11 既知の落とし穴と対策

#### P39: happy-dom 環境での userEvent 非互換

happy-dom 環境では `@testing-library/user-event` の `userEvent.setup()` が Symbol 操作エラーを起こします。全テストで `fireEvent` を使用してください。

```typescript
// NG: happy-dom で失敗する
const user = userEvent.setup();
await user.click(element);

// OK: fireEvent を使用
fireEvent.click(element);

// OK: 非同期ハンドラの場合
await act(async () => {
  fireEvent.click(element);
});
```

#### P40: テスト実行ディレクトリ依存

モノレポ環境ではプロジェクトルートからテストを実行しないでください。

```bash
# NG: プロジェクトルートから実行
pnpm vitest run apps/desktop/src/renderer/components/atoms/Badge/Badge.test.tsx

# OK: apps/desktop ディレクトリから実行
cd apps/desktop && pnpm vitest run src/renderer/components/atoms/Badge/Badge.test.tsx
```

#### P9: テスト間の状態リーク防止

`vi.fn()` で作成したモックは `beforeEach` で必ずリセットしてください。FilterChip のテストが参考例です。

```typescript
const defaultProps = {
  label: "テスト",
  isSelected: false,
  onClick: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
});
```

#### P13: タイマーテストの無限ループ防止

RelativeTime のテストでは `vi.useFakeTimers()` と `vi.advanceTimersByTime()` を使用しています。`vi.runAllTimers()` は setInterval の無限ループを引き起こすため、使用禁止です。

```typescript
// NG: 無限ループ
vi.runAllTimers();

// OK: 指定時間だけ進める
act(() => {
  vi.advanceTimersByTime(60000);
});
```

#### RelativeTime の cleanup 必須

RelativeTime は `useEffect` 内で `setInterval` を登録するため、テスト終了時に必ず cleanup を呼び出してください。

```typescript
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});
```

### 2.12 依存関係

| コンポーネント   | 内部依存                                     | 外部依存 |
| ---------------- | -------------------------------------------- | -------- |
| StatusIndicator  | `clsx`                                       | -        |
| FilterChip       | `clsx`, `Icon`                               | -        |
| Badge            | `clsx`                                       | -        |
| SkeletonCard     | `clsx`                                       | -        |
| SuggestionBubble | `clsx`, `Icon`                               | -        |
| EmptyState       | `clsx`, `Icon`, `SuggestionBubble`, `Button` | -        |
| RelativeTime     | -                                            | -        |

EmptyState は他の Atoms（SuggestionBubble, Button, Icon）を内部で使用しています。これは Atomic Design の原則上 Molecule に分類すべきとも考えられますが、「空状態」という単一責務のコンポーネントとして Atoms に配置しています。
