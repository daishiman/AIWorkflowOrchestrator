# コンポーネント要件定義 — Phase 1 成果物

## 新規コンポーネント要件

### 1. StatusIndicator

| 要件ID  | 要件内容                                                                          |
| ------- | --------------------------------------------------------------------------------- |
| SI-F-01 | 6種のステータス（running/success/error/warning/idle/offline）をカラードットで描画 |
| SI-F-02 | `running` ステータス時にデフォルトで pulse アニメーションを適用                   |
| SI-F-03 | `pulse` props で任意ステータスのアニメーション有無を明示制御                      |
| SI-F-04 | 3サイズ（sm:8px / md:10px / lg:14px）をサポート、デフォルト md                    |
| SI-F-05 | `offline` ステータス時に破線ボーダー（`border-dashed`）を表示                     |
| SI-F-06 | `label` props 指定時に `aria-label` として使用                                    |

**ステータスカラーマッピング**: running→`--status-primary`, success→`--status-success`, error→`--status-error`, warning→`--status-warning`, idle/offline→`--text-muted`

### 2. FilterChip

| 要件ID  | 要件内容                                                         |
| ------- | ---------------------------------------------------------------- |
| FC-F-01 | ピル形状で選択/非選択の2状態を切り替えるフィルターコンポーネント |
| FC-F-02 | 非選択時: `--bg-tertiary` 背景 + `--text-secondary` テキスト     |
| FC-F-03 | 選択時: `--status-primary` 背景 + `--text-inverse` テキスト      |
| FC-F-04 | `count` props で `(count)` を表示                                |
| FC-F-05 | `icon` props で 16px アイコンを表示                              |
| FC-F-06 | `disabled={true}` 時に `onClick` コールバック無効化              |
| FC-F-07 | トランジション `--duration-fast`（100ms）+ `--ease-default`      |

### 3. SkeletonCard

| 要件ID  | 要件内容                                                                |
| ------- | ----------------------------------------------------------------------- |
| SK-F-01 | 3バリエーション（default/stat/list-item）のローディングプレースホルダー |
| SK-F-02 | default: ヘッダーライン（幅60%, h12px）+ ボディ2本（幅80%/100%, h8px）  |
| SK-F-03 | stat: 数値プレースホルダー（幅40%, h24px）+ ラベル（幅60%, h8px）       |
| SK-F-04 | list-item: アイコン円（32px）+ テキスト2本（幅70%/50%, h8px）           |
| SK-F-05 | パルスアニメーション: opacity 0.4⟷1.0、1.5秒周期                        |
| SK-F-06 | `animate={false}` でアニメーション無効化                                |
| SK-F-07 | `height` / `borderRadius` のカスタム props                              |

### 4. SuggestionBubble

| 要件ID  | 要件内容                                                                   |
| ------- | -------------------------------------------------------------------------- |
| SB-F-01 | ピル形状のアクション提案ボタン（`--radius-full`）                          |
| SB-F-02 | 3サイズ（sm:36px / md:44px / lg:56px）、デフォルト md                      |
| SB-F-03 | `icon` props でテキスト左にアイコン表示                                    |
| SB-F-04 | ホバー時 `scale(var(--scale-hover))` + `--bg-elevated` + `--shadow-sm`     |
| SB-F-05 | アクティブ時 `scale(var(--scale-active))`                                  |
| SB-F-06 | タップ後 `success-bounce` アニメーション                                   |
| SB-F-07 | `disabled={true}` で opacity 0.5、cursor not-allowed、インタラクション無効 |
| SB-F-08 | キーボード操作（Enter/Space）で `onClick` 発火                             |

### 5. RelativeTime

| 要件ID  | 要件内容                                                                                          |
| ------- | ------------------------------------------------------------------------------------------------- |
| RT-F-01 | ISO 8601 タイムスタンプから相対時刻テキストを描画                                                 |
| RT-F-02 | 3フォーマット（auto/short/long）                                                                  |
| RT-F-03 | auto: <1分→"たった今", <1h→"N分前", <24h→"N時間前", <7d→"N日前", ≥7d→"YYYY/MM/DD"                 |
| RT-F-04 | short: <1分→"今", <1h→"Nm", <24h→"Nh", <7d→"Nd", ≥7d→"MM/DD"                                      |
| RT-F-05 | long: <1分→"たった今", <1h→"N分前", <24h→"N時間前", <2d→"昨日", <7d→"N日前", ≥7d→"YYYY年MM月DD日" |
| RT-F-06 | `refreshInterval`（デフォルト60000ms）で自動更新                                                  |
| RT-F-07 | アンマウント時に `clearInterval` でタイマー解除                                                   |
| RT-F-08 | `title` 属性に `YYYY/MM/DD HH:mm:ss` 形式の絶対時刻                                               |
| RT-F-09 | `showAbsoluteOnHover={false}` で `title` 属性非表示                                               |
| RT-F-10 | 無効タイムスタンプ（不正文字列、空文字列）→ フォールバック `"--"`                                 |

## 既存コンポーネント拡張要件

### Badge 拡張要件

| 要件ID  | カテゴリ | 要件内容                                                             |
| ------- | -------- | -------------------------------------------------------------------- |
| BD-F-01 | 機能拡張 | `primary` variant 追加（`--status-primary` 背景 + `--text-inverse`） |
| BD-F-02 | 機能拡張 | `content` props（`string \| number`）追加                            |
| BD-F-03 | 機能拡張 | `content` が number → `aria-label="{content}件"` 自動設定            |
| BD-F-04 | 機能拡張 | 明示的 `aria-label` で自動設定を上書き                               |
| BD-F-05 | 機能拡張 | `content` と `children` 両方指定時は `children` 優先                 |
| BD-F-06 | 後方互換 | `children` を必須→任意に変更（`content` が代替）                     |
| BD-F-07 | 後方互換 | 既存5 variant の視覚的挙動を維持                                     |
| BD-F-08 | 移行     | Tailwind 標準カラー → CSS 変数デザイントークン移行                   |

### EmptyState 拡張要件

| 要件ID  | カテゴリ | 要件内容                                                                            |
| ------- | -------- | ----------------------------------------------------------------------------------- |
| ES-F-01 | 機能拡張 | `suggestions` props（`Array<{label, icon?, onClick}>`）→ SuggestionBubble 描画      |
| ES-F-02 | 機能拡張 | `compact` モード（アイコン32px, 見出し `--text-base`, パディング20px）              |
| ES-F-03 | 機能拡張 | `mood="welcoming"`: `--status-primary` アイコン + 薄い青グラデーション背景          |
| ES-F-04 | 機能拡張 | `mood="encouraging"`: `--status-info` アイコン + ニュートラル背景                   |
| ES-F-05 | 機能拡張 | `mood="celebrating"`: `--status-success` アイコン + `success-bounce` アニメーション |
| ES-F-06 | 機能拡張 | `action` にオブジェクト形式（`{label, onClick, variant?}`）受入                     |
| ES-F-07 | 後方互換 | 既存 `action`（ReactNode）はそのまま描画                                            |
| ES-F-08 | 後方互換 | 既存 props（title, description, icon, action, className）挙動維持                   |
| ES-F-09 | 移行     | Tailwind 標準カラー → CSS 変数デザイントークン移行                                  |

## コンポーネント間依存

| 依存元     | 依存先           | 依存内容                         | 実装順序制約                    |
| ---------- | ---------------- | -------------------------------- | ------------------------------- |
| EmptyState | SuggestionBubble | `suggestions` props の描画に使用 | SuggestionBubble を先に実装する |
| EmptyState | Button（既存）   | `action` オブジェクト形式の描画  | Button は既存（制約なし）       |
| EmptyState | Icon（既存）     | `icon` props の描画              | Icon は既存（制約なし）         |

## 推奨実装順序

1. StatusIndicator, FilterChip, SkeletonCard, RelativeTime（独立、並列実装可能）
2. Badge（独立、並列実装可能）
3. SuggestionBubble（独立だが EmptyState の前に完了が必要）
4. EmptyState（SuggestionBubble に依存）
