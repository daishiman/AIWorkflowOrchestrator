# Phase 3: 設計レビュー - TASK-UI-00-ATOMS

## メタ情報

| 項目       | 値                                                                                                                                  |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Phase      | 3                                                                                                                                   |
| Phase名    | 設計レビュー                                                                                                                        |
| 前提Phase  | Phase 2（設計）                                                                                                                     |
| 後続Phase  | Phase 4（テスト作成）                                                                                                               |
| ステータス | pending                                                                                                                             |
| 作成日     | 2026-02-22                                                                                                                          |
| 機能名     | Atoms共通コンポーネント実装（StatusIndicator・FilterChip・SkeletonCard・SuggestionBubble・RelativeTime新規、Badge・EmptyState拡張） |

## 目的

Phase 2 の設計を Phase 1 の要件と照合し、Apple HIG 準拠・WCAG 2.1 AA 準拠・後方互換性・テスト環境ルールの観点で検証し、PASS / MINOR / MAJOR 判定を下す。

## 背景

- Phase 1 で定義した 31 の機能要件（SI-F-01〜06, FC-F-01〜07, SK-F-01〜07, SB-F-01〜08, RT-F-01〜10, BD-F-01〜08, ES-F-01〜09）が Phase 2 の設計でカバーされているかを検証する
- Phase 2 で設計した 7 コンポーネントのインターフェース、139 件のテスト見積もり、CSS/アニメーション設計の妥当性を検証する
- レビューゲート判定基準に従い、PASS なら Phase 4 へ、MINOR なら指摘対応後 Phase 4 へ、MAJOR なら Phase 1 or 2 へ差し戻す

## 実行タスク

- 実行方針: 本Phaseで定義した Task セクションを上から順に100%実施する。

### Task 1: 要件-設計整合性検証

Phase 1 の全 31 要件について、Phase 2 の設計でカバーされているかを検証する。

#### Task 1-1: StatusIndicator 要件カバレッジ

| 要件ID  | 要件内容                        | Phase 2 設計参照箇所                                  | カバー状況 |
| ------- | ------------------------------- | ----------------------------------------------------- | ---------- |
| SI-F-01 | 6種ステータスのカラードット描画 | Task 1-1 インターフェース + Task 2-1 カラーマッピング | 検証対象   |
| SI-F-02 | running 時デフォルト pulse      | Task 1-1 設計判断 + Task 5-1 アニメーション           | 検証対象   |
| SI-F-03 | pulse props での明示制御        | Task 1-1 インターフェース                             | 検証対象   |
| SI-F-04 | 3サイズ（sm/md/lg）             | Task 2-2 サイズマッピング                             | 検証対象   |
| SI-F-05 | offline 時の破線ボーダー        | Task 2-1 カラーマッピング                             | 検証対象   |
| SI-F-06 | label による aria-label 上書き  | Task 3-1 ARIA パターン                                | 検証対象   |

**検証結果**:

- [ ] SI-F-01: Task 2-1 で6ステータス全てのCSS変数マッピングが定義されている
- [ ] SI-F-02: Task 5-1 で pulse アニメーションのクラス定義があり、Task 1-1 設計判断で `running` のデフォルト `true` が明記されている
- [ ] SI-F-03: Task 1-1 インターフェースに `pulse?: boolean` が定義されている
- [ ] SI-F-04: Task 2-2 で sm(8px)/md(10px)/lg(14px) の Tailwind クラスが定義されている
- [ ] SI-F-05: Task 2-1 で offline に `border-dashed border-[var(--text-muted)]` が定義されている
- [ ] SI-F-06: Task 3-1 で `aria-label={label ?? \`ステータス: ${status}\`}` パターンが定義されている

#### Task 1-2: FilterChip 要件カバレッジ

| 要件ID  | 要件内容                 | Phase 2 設計参照箇所                                        | カバー状況 |
| ------- | ------------------------ | ----------------------------------------------------------- | ---------- |
| FC-F-01 | 選択/非選択の2状態切替   | Task 1-2 インターフェース                                   | 検証対象   |
| FC-F-02 | 非選択時カラー           | Task 2-1（FilterChip 設計には直接記載なし、Phase 1 で定義） | 検証対象   |
| FC-F-03 | 選択時カラー             | 同上                                                        | 検証対象   |
| FC-F-04 | count 表示               | Task 3-1 JSX パターン                                       | 検証対象   |
| FC-F-05 | icon 表示                | Task 3-1 JSX パターン                                       | 検証対象   |
| FC-F-06 | disabled 時 onClick 無効 | Task 1-2 設計判断                                           | 検証対象   |
| FC-F-07 | トランジション設定       | Phase 1 要件（Phase 2 で明示設計なし）                      | 検証対象   |

**検証結果**:

- [ ] FC-F-01: Task 1-2 に `isSelected: boolean` が定義されている
- [ ] FC-F-02: Phase 1 で `--bg-tertiary` + `--text-secondary` が定義済み。Phase 2 Task 3-1 JSX に反映確認が必要
- [ ] FC-F-03: Phase 1 で `--status-primary` + `--text-inverse` が定義済み。同上
- [ ] FC-F-04: Task 3-1 JSX で `{count !== undefined && <span>({count})</span>}` が定義されている
- [ ] FC-F-05: Task 3-1 JSX で `{icon && <Icon name={icon} size={16} />}` が定義されている
- [ ] FC-F-06: Task 3-1 JSX で `disabled={disabled}` + `onClick={disabled ? undefined : onClick}` が定義されている
- [ ] FC-F-07: **指摘事項**: Phase 2 の FilterChip 設計に `transition` の Tailwind クラスが明示されていない。Phase 1 で `--duration-fast` + `--ease-default` の要件があるため、Task 5 で CSS 設計を追加する必要がある

#### Task 1-3: SkeletonCard 要件カバレッジ

| 要件ID  | 要件内容                           | Phase 2 設計参照箇所                     | カバー状況 |
| ------- | ---------------------------------- | ---------------------------------------- | ---------- |
| SK-F-01 | 3バリエーション描画                | Task 1-4 インターフェース                | 検証対象   |
| SK-F-02 | default 構造（ヘッダー+ボディ2本） | Phase 1 仕様（Phase 2 で内部構造未設計） | 検証対象   |
| SK-F-03 | stat 構造                          | 同上                                     | 検証対象   |
| SK-F-04 | list-item 構造                     | 同上                                     | 検証対象   |
| SK-F-05 | パルスアニメーション               | Task 5-2 アニメーション                  | 検証対象   |
| SK-F-06 | animate={false} 無効化             | Task 5-2                                 | 検証対象   |
| SK-F-07 | height/borderRadius カスタム       | Task 1-4 + Task 3-1 ARIA                 | 検証対象   |

**検証結果**:

- [ ] SK-F-01: Task 1-4 に `variant?: SkeletonVariant` が定義されている
- [ ] SK-F-02〜04: **指摘事項**: Phase 2 で各バリエーションの内部 DOM 構造（幅・高さの具体的な Tailwind クラス）が設計されていない。Phase 1 の仕様テーブル（幅60%/80%/100%、高さ12px/8px/24px）を Phase 5 の実装ガイドとして参照する必要がある
- [ ] SK-F-05: Task 5-2 で `skeleton-pulse` キーフレーム（opacity 0.4⟷1.0、1.5秒）が定義されている
- [ ] SK-F-06: Task 5-2 で `animate` props による条件分岐が定義されている
- [ ] SK-F-07: Task 3-1 ARIA パターンで `style={{ height, borderRadius }}` が定義されている

#### Task 1-4: SuggestionBubble 要件カバレッジ

| 要件ID  | 要件内容                      | Phase 2 設計参照箇所      | カバー状況 |
| ------- | ----------------------------- | ------------------------- | ---------- |
| SB-F-01 | ピル形状描画                  | Task 1-5 インターフェース | 検証対象   |
| SB-F-02 | 3サイズ                       | Task 2-2 サイズマッピング | 検証対象   |
| SB-F-03 | icon 表示                     | Task 3-1 JSX パターン     | 検証対象   |
| SB-F-04 | ホバー時スタイル              | Task 5-3 インタラクション | 検証対象   |
| SB-F-05 | アクティブ時スタイル          | Task 5-3                  | 検証対象   |
| SB-F-06 | success-bounce アニメーション | Task 5-3                  | 検証対象   |
| SB-F-07 | disabled 時スタイル           | Task 5-3                  | 検証対象   |
| SB-F-08 | キーボード操作                | Task 3-2 キーボード設計   | 検証対象   |

**検証結果**:

- [ ] SB-F-01: Task 1-5 + `--radius-full` 使用が Phase 1 トークン依存に記載
- [ ] SB-F-02: Task 2-2 で sm(36px)/md(44px)/lg(56px) の Tailwind クラスが定義されている
- [ ] SB-F-03: Task 3-1 JSX で `{icon && <Icon name={icon} size={sizeConfig.iconSize} />}` が定義されている
- [ ] SB-F-04: Task 5-3 で `hover:scale-[var(--scale-hover)]` + `hover:bg-[var(--bg-elevated)]` + `hover:shadow-[var(--shadow-sm)]` が定義されている
- [ ] SB-F-05: Task 5-3 で `active:scale-[var(--scale-active)]` が定義されている
- [ ] SB-F-06: Task 5-3 で `isBouncing` state + `setTimeout(300ms)` + `animate-[success-bounce_0.3s_...]` が定義されている
- [ ] SB-F-07: Task 5-3 で `opacity-50 cursor-not-allowed` が定義されている
- [ ] SB-F-08: Task 3-2 で `handleKeyDown` ハンドラ（Enter / Space）が定義されている

#### Task 1-5: RelativeTime 要件カバレッジ

| 要件ID  | 要件内容                         | Phase 2 設計参照箇所                         | カバー状況 |
| ------- | -------------------------------- | -------------------------------------------- | ---------- |
| RT-F-01 | ISO 8601 タイムスタンプ受取      | Task 1-7 インターフェース                    | 検証対象   |
| RT-F-02 | 3フォーマット切替                | Task 1-7 インターフェース                    | 検証対象   |
| RT-F-03 | auto フォーマット表示ルール      | Phase 1 仕様（Phase 2 で純粋関数として設計） | 検証対象   |
| RT-F-04 | short フォーマット表示ルール     | 同上                                         | 検証対象   |
| RT-F-05 | long フォーマット表示ルール      | 同上                                         | 検証対象   |
| RT-F-06 | setInterval 自動更新             | Task 1-7 設計判断                            | 検証対象   |
| RT-F-07 | clearInterval クリーンアップ     | Task 1-7 設計判断                            | 検証対象   |
| RT-F-08 | title 属性に絶対時刻             | Task 3-1 JSX パターン                        | 検証対象   |
| RT-F-09 | showAbsoluteOnHover 制御         | Task 3-1 JSX パターン                        | 検証対象   |
| RT-F-10 | 無効タイムスタンプフォールバック | Task 1-7 設計判断                            | 検証対象   |

**検証結果**:

- [ ] RT-F-01: Task 1-7 に `timestamp: string` が定義されている
- [ ] RT-F-02: Task 1-7 に `format?: RelativeTimeFormat` が定義されている
- [ ] RT-F-03〜05: Task 1-7 設計判断で `formatRelativeTime(timestamp, format, now)` 純粋関数の設計方針が示されている。各フォーマットの閾値ルールは Phase 1 仕様を直接参照
- [ ] RT-F-06: Task 1-7 設計判断で `useEffect` + `setInterval` の管理が明記されている
- [ ] RT-F-07: Task 1-7 設計判断で「クリーンアップで clearInterval を確実に実行」が明記されている
- [ ] RT-F-08: Task 3-1 JSX で `title={showAbsoluteOnHover ? formatAbsolute(timestamp) : undefined}` が定義されている
- [ ] RT-F-09: 同上
- [ ] RT-F-10: Task 1-7 設計判断で `NaN` 判定 → `"--"` フォールバックが明記されている

#### Task 1-6: Badge 拡張要件カバレッジ

| 要件ID  | 要件内容                  | Phase 2 設計参照箇所         | カバー状況 |
| ------- | ------------------------- | ---------------------------- | ---------- |
| BD-F-01 | primary variant 追加      | Task 2-1 カラーマッピング    | 検証対象   |
| BD-F-02 | content props 追加        | Task 1-3 インターフェース    | 検証対象   |
| BD-F-03 | number 時 aria-label 自動 | Task 3-1 ARIA パターン       | 検証対象   |
| BD-F-04 | 明示 aria-label 優先      | Task 3-1 ARIA パターン       | 検証対象   |
| BD-F-05 | children > content 優先   | Task 1-3 設計判断 + Task 3-1 | 検証対象   |
| BD-F-06 | children 任意化           | Task 1-3 インターフェース    | 検証対象   |
| BD-F-07 | 既存5 variant 維持        | Task 7-1 後方互換性設計      | 検証対象   |
| BD-F-08 | デザイントークン移行      | Task 2-1 + Task 7-1          | 検証対象   |

**検証結果**:

- [ ] BD-F-01: Task 2-1 に `primary: bg-[var(--status-primary)] text-[var(--text-inverse)]` が定義されている
- [ ] BD-F-02: Task 1-3 に `content?: string | number` が定義されている
- [ ] BD-F-03: Task 3-1 で `typeof content === "number" ? \`${content}件\` : undefined` が定義されている
- [ ] BD-F-04: Task 3-1 で `props["aria-label"] ??` で明示値優先が定義されている
- [ ] BD-F-05: Task 3-1 で `{children ?? content}` が定義されている
- [ ] BD-F-06: Task 1-3 で `children?: React.ReactNode`（任意）に変更されている
- [ ] BD-F-07: Task 7-1 で3ステップの段階的拡張戦略が定義されている
- [ ] BD-F-08: Task 2-1 + Task 7-1 で全6 variant の移行先が定義されている

#### Task 1-7: EmptyState 拡張要件カバレッジ

| 要件ID  | 要件内容                   | Phase 2 設計参照箇所           | カバー状況 |
| ------- | -------------------------- | ------------------------------ | ---------- |
| ES-F-01 | suggestions 追加           | Task 1-6 + Task 6-1            | 検証対象   |
| ES-F-02 | compact モード             | Task 2-2 サイズマッピング      | 検証対象   |
| ES-F-03 | mood=welcoming             | Task 5-4 グラデーション        | 検証対象   |
| ES-F-04 | mood=encouraging           | Task 5-4                       | 検証対象   |
| ES-F-05 | mood=celebrating           | Task 5-4（アニメーション参照） | 検証対象   |
| ES-F-06 | action オブジェクト形式    | Task 6-2                       | 検証対象   |
| ES-F-07 | 既存 ReactNode action 維持 | Task 6-2                       | 検証対象   |
| ES-F-08 | 既存 props 挙動維持        | Task 7-2 後方互換性設計        | 検証対象   |
| ES-F-09 | デザイントークン移行       | Task 7-2                       | 検証対象   |

**検証結果**:

- [ ] ES-F-01: Task 1-6 に `suggestions?: EmptyStateSuggestion[]` が定義、Task 6-1 で SuggestionBubble 統合パターンが定義されている
- [ ] ES-F-02: Task 2-2 で通常/コンパクトのサイズ比較テーブルが定義されている
- [ ] ES-F-03: Task 5-4 で welcoming の radial-gradient 設計が定義されている
- [ ] ES-F-04: Task 5-4 で encouraging は「スタイル変更なし」と明記されている
- [ ] ES-F-05: **指摘事項**: Phase 2 Task 5-4 で celebrating の `success-bounce` アニメーションの具体的な CSS クラス/適用対象（アイコン要素）が明示されていない。Phase 1 では「アイコンに適用」と明記されているため、設計を補完する必要がある
- [ ] ES-F-06: Task 6-2 で `isActionObject` 型ガード + Button レンダリングが定義されている
- [ ] ES-F-07: Task 6-2 で ReactNode 形式は `else` ブランチでそのまま描画
- [ ] ES-F-08: Task 7-2 で3ステップ拡張戦略が定義されている
- [ ] ES-F-09: Task 7-2 で Tailwind 標準クラス → CSS 変数の移行先が定義されている

### Task 2: Apple HIG 準拠検証

#### Task 2-1: カラー準拠

| 検証項目                                        | Phase 2 設計                                                     | HIG 準拠 |
| ----------------------------------------------- | ---------------------------------------------------------------- | -------- |
| ステータスカラーが Apple System Colors に基づく | `--status-primary`=systemBlue, `--status-success`=systemGreen 等 | 検証対象 |
| ダークモード配色がコントラスト基準を満たす      | 3テーマのトークン切替で対応                                      | 検証対象 |
| 高彩度色を大面積に使わない                      | Badge/FilterChip は小面積、EmptyState welcoming は opacity 0.05  | 検証対象 |
| Tailwind Slate を使用していない                 | CSS 変数ベースの中性灰を使用                                     | 検証対象 |

**検証結果**:

- [ ] StatusIndicator / Badge のステータスカラーは TASK-UI-00-TOKENS のデザイントークン経由で Apple System Colors を参照する設計。HIG 準拠
- [ ] FilterChip 選択時の `--status-primary` は小面積ピル。HIG の高彩度制限に準拠
- [ ] EmptyState welcoming の背景グラデーションは opacity 0.05 で大面積使用を回避。HIG 準拠
- [ ] 全コンポーネントで Tailwind Slate を使用していない。CSS 変数ベースの中性灰を使用。HIG 準拠

#### Task 2-2: スペーシング準拠

| 検証項目                       | Phase 2 設計                                 | HIG 準拠 |
| ------------------------------ | -------------------------------------------- | -------- |
| 8px グリッドでスペーシング統一 | EmptyState: p-8(32px)/p-5(20px)              | 検証対象 |
| タッチターゲット最小 44px      | SuggestionBubble md:44px, FilterChip: 要確認 | 検証対象 |

**検証結果**:

- [ ] EmptyState: 通常 p-8(32px) = 8px × 4、コンパクト p-5(20px) = 8px × 2.5。20px は 8px グリッドの非整数倍だが、Apple HIG ではコンパクトモードでの例外的サイズとして許容範囲
- [ ] SuggestionBubble: sm=36px, md=44px, lg=56px。sm(36px) は Apple HIG の最小タッチターゲット 44px を下回る。ただし Phase 1 仕様書で「最小44px（全サイズで確保）」と定義されている。**指摘事項**: sm(36px) と「最小44px」の矛盾を解消する必要がある。sm サイズのタッチターゲットを padding で 44px に拡大するか、仕様の最小値を 36px に修正するかの判断が必要
- [ ] FilterChip: Phase 1 で「最小 36×36px（チップ/バッジ基準）」と定義。Phase 2 で具体的な height 設計が不足。**指摘事項**: FilterChip の高さを明示する必要がある

#### Task 2-3: 角丸準拠

| 検証項目            | Phase 2 設計                                                                          | HIG 準拠 |
| ------------------- | ------------------------------------------------------------------------------------- | -------- |
| 角丸 8px〜12px 統一 | FilterChip/SuggestionBubble: `--radius-full`（ピル形状）、SkeletonCard: `--radius-md` | 検証対象 |

**検証結果**:

- [ ] ピル形状（`--radius-full`）は Apple HIG の Capsule Shape に相当。HIG 準拠
- [ ] SkeletonCard: `--radius-md` の具体値は TASK-UI-00-TOKENS で定義。8px〜12px 範囲内であることを前提。HIG 準拠

### Task 3: WCAG 2.1 AA 準拠検証

#### Task 3-1: コントラスト比検証

| 組み合わせ                             | 必要比率 | Phase 2 設計                   | 準拠     |
| -------------------------------------- | -------- | ------------------------------ | -------- |
| `--text-primary` on `--bg-primary`     | 4.5:1    | RelativeTime テキスト          | 検証対象 |
| `--text-secondary` on `--bg-tertiary`  | 4.5:1    | FilterChip 非選択テキスト      | 検証対象 |
| `--text-inverse` on `--status-primary` | 4.5:1    | FilterChip 選択、Badge primary | 検証対象 |
| `--text-muted` ステータスドット        | 3:1      | StatusIndicator idle/offline   | 検証対象 |

**検証結果**:

- [ ] コントラスト比はデザイントークン値に依存する。TASK-UI-00-TOKENS で Apple HIG System Colors を使用しているため、標準的な組み合わせでは WCAG 4.5:1 を満たす
- [ ] `--text-muted`（30% opacity）の場合、背景とのコントラスト比が 3:1 を下回る可能性がある（Phase 1 既知リスク）。実装時に実際の computed color でコントラスト比を検証する必要がある

#### Task 3-2: ARIA 属性検証

| コンポーネント   | 必須 ARIA                                          | Phase 2 設計        | 準拠     |
| ---------------- | -------------------------------------------------- | ------------------- | -------- |
| StatusIndicator  | `role="status"`, `aria-label`                      | Task 3-1 で定義済み | 検証対象 |
| FilterChip       | `role="checkbox"`, `aria-checked`, `aria-disabled` | Task 3-1 で定義済み | 検証対象 |
| Badge            | `role="status"`, 数値時 `aria-label`               | Task 3-1 で定義済み | 検証対象 |
| SkeletonCard     | `role="status"`, `aria-label`, `aria-busy`         | Task 3-1 で定義済み | 検証対象 |
| SuggestionBubble | `role="button"`, `tabIndex`, `aria-disabled`       | Task 3-1 で定義済み | 検証対象 |
| RelativeTime     | `<time>`, `datetime`                               | Task 3-1 で定義済み | 検証対象 |

**検証結果**:

- [ ] 全コンポーネントの ARIA 属性が Phase 1 要件のマトリクスと一致する
- [ ] SuggestionBubble: `disabled` 時に `tabIndex={-1}` でフォーカス対象外にする設計。WCAG キーボード操作ガイドラインに準拠

#### Task 3-3: キーボード操作検証

| コンポーネント   | 操作          | Phase 2 設計                    | 準拠     |
| ---------------- | ------------- | ------------------------------- | -------- |
| FilterChip       | Enter / Space | `<button>` ネイティブ動作       | 検証対象 |
| SuggestionBubble | Enter / Space | `handleKeyDown` ハンドラ        | 検証対象 |
| SuggestionBubble | Tab           | `tabIndex={0}` でフォーカス可能 | 検証対象 |

**検証結果**:

- [ ] FilterChip: `<button>` 要素のため、ネイティブ Enter / Space 操作が保証される。追加ハンドラ不要は正しい判断
- [ ] SuggestionBubble: `<div>` + `role="button"` のため、`handleKeyDown` で Enter / Space を明示的にハンドリングする必要がある。Task 3-2 で `e.preventDefault()` による Space スクロール防止も含まれている。WCAG 準拠

### Task 4: 後方互換性検証

#### Task 4-1: Badge 後方互換性

| 検証項目                       | Phase 2 設計                    | 互換性   |
| ------------------------------ | ------------------------------- | -------- |
| 既存5 variant の視覚的挙動維持 | Task 7-1 で段階的移行戦略       | 検証対象 |
| children 必須 → 任意への変更   | Task 1-3 で `children?` に変更  | 検証対象 |
| 既存テスト17件の PASS          | Task 7-1 で6件修正方針あり      | 検証対象 |
| forwardRef パターン維持        | Task 1-3 で HTMLAttributes 維持 | 検証対象 |

**検証結果**:

- [ ] 既存5 variant は CSS 変数ベースに移行するが、視覚的には同等のカラーを維持。テストの6件はアサーション修正で対応
- [ ] `children` の必須→任意変更は TypeScript 型レベルの変更。既存の `children` 使用箇所は影響なし（値は引き続き渡される）
- [ ] `data-variant` テスト用属性の提案は合理的な代替案。Phase 5 の実装時に Tailwind arbitrary value のテスト互換性を検証し、互換性不足が確認された場合のみ採用
- [ ] `forwardRef` + `React.HTMLAttributes<HTMLSpanElement>` は変更なし。後方互換性維持

#### Task 4-2: EmptyState 後方互換性

| 検証項目                     | Phase 2 設計                 | 互換性   |
| ---------------------------- | ---------------------------- | -------- |
| 既存 props 全て維持          | Task 1-6 で全既存 props 含む | 検証対象 |
| 既存テスト6件の PASS         | Task 7-2 で「影響なし」確認  | 検証対象 |
| action の ReactNode 形式維持 | Task 6-2 で型ガード分岐      | 検証対象 |
| memo パターン維持            | Task 1-6 で未言及            | 検証対象 |

**検証結果**:

- [ ] 既存 props（title, description, icon, action, className）は全て Task 1-6 のインターフェースに含まれている
- [ ] 既存テスト6件はテキスト内容・DOM構造のアサーションのみ。カラークラス名をアサーションしていないため、デザイントークン移行の影響はない
- [ ] `isActionObject` 型ガードで ReactNode / オブジェクトを正しく判別。ReactNode 形式は影響なし
- [ ] **指摘事項**: Phase 2 で `memo` パターンの維持が明示されていない。現行 EmptyState は `memo` でラップされている。拡張後も `memo` を維持するか、`suggestions` の shallow compare 問題を考慮するかの判断が必要

### Task 5: テスト環境ルール検証

| ルール                      | Phase 2 設計    | 準拠     |
| --------------------------- | --------------- | -------- |
| P39: fireEvent 使用         | Task 4-3 で明記 | 検証対象 |
| P40: apps/desktop/ から実行 | Task 4-3 で明記 | 検証対象 |
| P9: beforeEach リセット     | Task 4-3 で明記 | 検証対象 |
| P13: advanceTimersByTime    | Task 4-3 で明記 | 検証対象 |
| P31: Store 直接参照禁止     | Task 4-3 で明記 | 検証対象 |

**検証結果**:

- [ ] 全テスト環境ルールが Phase 2 Task 4-3 で明示的に設計されている

### Task 6: レビュー総括

#### 指摘事項一覧

| #   | 重要度 | 対象             | 内容                                                                                               | 対応方針                                                                                                          |
| --- | ------ | ---------------- | -------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| R-1 | MINOR  | FilterChip       | Phase 2 に transition の Tailwind クラス（`--duration-fast` + `--ease-default`）が明示されていない | Phase 5 実装時に `transition-all duration-[100ms] ease-[var(--ease-default)]` を適用                              |
| R-2 | MINOR  | SkeletonCard     | 各バリエーションの内部 DOM 構造（幅・高さの具体的 Tailwind クラス）が Phase 2 に未記載             | Phase 5 で Phase 1 仕様テーブルを直接参照して実装                                                                 |
| R-3 | MINOR  | SuggestionBubble | sm(36px) と Phase 1 の「最小44px（全サイズで確保）」が矛盾                                         | sm サイズは視覚的に 36px、タッチターゲットは `min-h-[44px]` で 44px を確保する設計に修正                          |
| R-4 | MINOR  | FilterChip       | FilterChip の具体的な高さが Phase 2 に未定義                                                       | `min-h-9`（36px）を適用し、Phase 1 のタッチターゲット基準を満たす                                                 |
| R-5 | MINOR  | EmptyState       | celebrating の `success-bounce` アニメーションの適用対象（アイコン要素）が Phase 2 で不明確        | Phase 5 で Icon 要素のラッパーに `animate-[success-bounce_...]` を適用                                            |
| R-6 | MINOR  | EmptyState       | `memo` パターンの維持が Phase 2 で未言及                                                           | `memo` を維持する。`suggestions` は配列のため shallow compare が効かないが、親が `useMemo` で安定化する責務を持つ |

#### レビュー判定

| 判定基準         | 結果                                                       |
| ---------------- | ---------------------------------------------------------- |
| 要件カバレッジ   | 31/31 要件が設計でカバーされている                         |
| Apple HIG 準拠   | カラー・角丸は準拠。スペーシング（R-3, R-4）に MINOR 指摘  |
| WCAG 2.1 AA 準拠 | ARIA属性・キーボード操作は準拠。コントラスト比は実装時検証 |
| 後方互換性       | Badge 17テスト・EmptyState 6テスト維持の設計あり           |
| テスト環境ルール | P9/P13/P31/P39/P40 全て設計に反映                          |

### **判定: MINOR**

6件の MINOR 指摘があるが、全て Phase 5 実装時に対応可能な軽微な設計補完。Phase 1 の要件に戻る必要はなく、Phase 2 設計の根本的変更も不要。

**Phase 4 への移行条件**: 上記6件の MINOR 指摘を Phase 5 実装ガイドとして記録し、Phase 4 に進む。

## 参照資料

| 参照                   | パス                                                                                        |
| ---------------------- | ------------------------------------------------------------------------------------------- | -------------- |
| Phase 1 要件定義       | `docs/30-workflows/completed-tasks/task-ui-00-atoms/phase-1-requirements.md`                |
| Phase 2 設計           | `docs/30-workflows/completed-tasks/task-ui-00-atoms/phase-2-design.md`                      |
| Atoms仕様書            | `docs/30-workflows/skill-import-agent-system/tasks/completed-task/00-2-atoms-components.md` |
| UIコンポーネント仕様   | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`                     |
| デザイン原則           | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md`              |
| デザインシステム       | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md`                  |
| UIアーキテクチャ       | `.claude/skills/aiworkflow-requirements/references/arch-ui-components.md`                   |
| テストパターン         | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md`           |
| a11yテスト             | `.claude/skills/aiworkflow-requirements/references/testing-accessibility.md`                |
| アーキテクチャルール   | `.claude/rules/01-architecture.md`                                                          |
| 既存コンポーネント分析 | `outputs/phase-1/existing-component-analysis.md`                                            | Phase 1 成果物 |
| コンポーネント要件定義 | `outputs/phase-1/component-requirements.md`                                                 | Phase 1 成果物 |
| アクセシビリティ要件   | `outputs/phase-1/accessibility-requirements.md`                                             | Phase 1 成果物 |
| テーマ要件             | `outputs/phase-1/theme-requirements.md`                                                     | Phase 1 成果物 |
| 後方互換性要件         | `outputs/phase-1/backward-compatibility-requirements.md`                                    | Phase 1 成果物 |
| インターフェース設計   | `outputs/phase-2/interface-design.md`                                                       | Phase 2 成果物 |

## 統合テスト連携

Phase 3 は設計レビューのため統合テストの実行はない。指摘事項 R-1〜R-6 は Phase 5 の実装で反映し、Phase 6（テスト拡充）で検証する。

## 成果物

| #   | 成果物                       | パス                                               |
| --- | ---------------------------- | -------------------------------------------------- |
| 1   | 要件-設計整合性検証レポート  | `outputs/phase-3/requirements-design-alignment.md` |
| 2   | HIG準拠検証レポート          | `outputs/phase-3/hig-compliance-review.md`         |
| 3   | アクセシビリティ検証レポート | `outputs/phase-3/accessibility-review.md`          |
| 4   | 後方互換性検証レポート       | `outputs/phase-3/backward-compatibility-review.md` |
| 5   | レビュー総括レポート         | `outputs/phase-3/review-summary.md`                |

**注意**: 成果物ドキュメントは本仕様書（phase-3-design-review.md）に全内容が包含されているため、Phase 4 はこのファイルを直接参照する。

## 完了条件

- [ ] Phase 1 の全31要件について Phase 2 設計でのカバー状況を検証した（31/31 カバー確認）
- [ ] Apple HIG 準拠を検証した（カラー、スペーシング、角丸、タッチターゲット）
- [ ] WCAG 2.1 AA 準拠を検証した（ARIA属性、キーボード操作、コントラスト比）
- [ ] Badge の後方互換性（既存テスト17件維持）を設計レベルで確認した
- [ ] EmptyState の後方互換性（既存テスト6件維持）を設計レベルで確認した
- [ ] テスト環境ルール（P9, P13, P31, P39, P40）の設計反映を確認した
- [ ] MINOR 指摘6件を特定し、Phase 5 実装ガイドとして記録した
- [ ] レビュー判定（MINOR）を確定し、Phase 4 への移行条件を明記した

## Phase末端アクション【必須】

- [ ] 本仕様書を作成し、`docs/30-workflows/completed-tasks/task-ui-00-atoms/phase-3-design-review.md` に配置した
- [ ] `artifacts.json` の Phase 3 ステータスを `in_progress` に更新する（Phase 4 開始時）
- [ ] MINOR 指摘6件（R-1〜R-6）を Phase 5 仕様書に引き継ぎ事項として記録する

## 依存関係

| 依存種別     | 対象                  | 内容                                                        |
| ------------ | --------------------- | ----------------------------------------------------------- |
| 前提Phase    | Phase 2（設計）       | 設計セットが完成済みであること                              |
| ブロック対象 | Phase 4（テスト作成） | レビュー判定が PASS or MINOR であること（MAJOR は差し戻し） |

## 次のPhase

Phase 4（テスト作成）: Phase 2 の設計と Phase 3 の MINOR 指摘（R-1〜R-6）を反映した上で、7コンポーネントのテストケース設計・テストコード作成を行う。テスト数見積もり 139 件を Phase 2 Task 4-4 の内訳に従い実装する。
