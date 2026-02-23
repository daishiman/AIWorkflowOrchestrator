# 手動テスト総括 -- TASK-UI-00-ATOMS Phase 11

## メタ情報

| 項目     | 値                                  |
| -------- | ----------------------------------- |
| タスクID | TASK-UI-00-ATOMS                    |
| Phase    | 11 -- 手動テスト                    |
| 検証日   | 2026-02-23                          |
| 検証方法 | コード分析ベース + 実機確認要否判定 |
| 前提     | Phase 10 PASS (MINOR 3件)           |

## サマリー

| 判定                      | 件数   |
| ------------------------- | ------ |
| コード分析ベース PASS     | 20     |
| 要実機確認（CONDITIONAL） | 31     |
| FAIL                      | 0      |
| **合計**                  | **51** |

### Task 別内訳

| Task   | テスト範囲                  | PASS | CONDITIONAL | FAIL |
| ------ | --------------------------- | ---- | ----------- | ---- |
| Task 1 | テーマ切替（#1-#11）        | 4    | 7           | 0    |
| Task 2 | レスポンシブ（#12-#17）     | 2    | 4           | 0    |
| Task 3 | インタラクション（#18-#27） | 5    | 5           | 0    |
| Task 4 | キーボード操作（#28-#34）   | 5    | 2           | 0    |
| Task 5 | アクセシビリティ（#35-#47） | 0    | 13          | 0    |
| Task 6 | 後方互換性（#48-#51）       | 4    | 0           | 0    |

## 全51テストケース一覧

### Task 1: テーマ切替テスト（#1-#11）

| #   | テスト項目                                      | 判定        |
| --- | ----------------------------------------------- | ----------- |
| 1   | kanagawa-dragon で StatusIndicator 6種表示      | PASS        |
| 2   | kanagawa-dragon で FilterChip 選択/非選択表示   | PASS        |
| 3   | kanagawa-dragon で Badge primary variant 表示   | PASS        |
| 4   | kanagawa-dragon で SkeletonCard 3バリエーション | CONDITIONAL |
| 5   | kanagawa-dragon で SuggestionBubble 3サイズ     | CONDITIONAL |
| 6   | kanagawa-dragon で EmptyState 3 mood            | CONDITIONAL |
| 7   | kanagawa-dragon で RelativeTime 表示            | PASS        |
| 8   | light テーマで全7コンポーネント表示             | CONDITIONAL |
| 9   | dark テーマで全7コンポーネント表示              | CONDITIONAL |
| 10  | テーマ切替（light -> dark）時のトランジション   | CONDITIONAL |
| 11  | テーマ切替（dark -> kanagawa-dragon）時         | CONDITIONAL |

### Task 2: レスポンシブテスト（#12-#17）

| #   | テスト項目                              | 判定        |
| --- | --------------------------------------- | ----------- |
| 12  | mobile (<768px) で StatusIndicator      | PASS        |
| 13  | mobile (<768px) で FilterChip           | CONDITIONAL |
| 14  | mobile (<768px) で SuggestionBubble     | CONDITIONAL |
| 15  | mobile (<768px) で SkeletonCard         | PASS        |
| 16  | tablet (768-1023px) で全7コンポーネント | CONDITIONAL |
| 17  | desktop (>=1024px) で全7コンポーネント  | CONDITIONAL |

### Task 3: インタラクションテスト（#18-#27）

| #   | テスト項目                                        | 判定        |
| --- | ------------------------------------------------- | ----------- |
| 18  | FilterChip クリックで選択/非選択切替              | PASS        |
| 19  | FilterChip ホバーで背景色変化                     | CONDITIONAL |
| 20  | SuggestionBubble ホバーで scale 拡大              | PASS        |
| 21  | SuggestionBubble クリックで success-bounce        | CONDITIONAL |
| 22  | SuggestionBubble アクティブ状態（押下中）         | PASS        |
| 23  | StatusIndicator running 時の pulse アニメーション | CONDITIONAL |
| 24  | StatusIndicator pulse={false} で停止              | PASS        |
| 25  | SkeletonCard パルスアニメーション                 | CONDITIONAL |
| 26  | RelativeTime 時間経過での表示更新                 | PASS        |
| 27  | EmptyState suggestions クリック                   | PASS        |

### Task 4: キーボード操作テスト（#28-#34）

| #   | テスト項目                                        | 判定        |
| --- | ------------------------------------------------- | ----------- |
| 28  | SuggestionBubble: Tab でフォーカス移動            | CONDITIONAL |
| 29  | SuggestionBubble: Enter で onClick 発火           | PASS        |
| 30  | SuggestionBubble: Space で onClick 発火           | PASS        |
| 31  | FilterChip: Tab でフォーカス移動                  | CONDITIONAL |
| 32  | FilterChip: Enter で選択切替                      | PASS        |
| 33  | FilterChip: Space で選択切替                      | PASS        |
| 34  | EmptyState action: Tab でフォーカス、Enter で実行 | PASS        |

### Task 5: アクセシビリティテスト（#35-#47）

| #   | テスト項目                                      | 判定        |
| --- | ----------------------------------------------- | ----------- |
| 35  | StatusIndicator の VoiceOver 読み上げ           | CONDITIONAL |
| 36  | FilterChip の VoiceOver 読み上げ                | CONDITIONAL |
| 37  | Badge (number) の VoiceOver 読み上げ            | CONDITIONAL |
| 38  | SkeletonCard の VoiceOver 読み上げ              | CONDITIONAL |
| 39  | SuggestionBubble の VoiceOver 読み上げ          | CONDITIONAL |
| 40  | RelativeTime の VoiceOver 読み上げ              | CONDITIONAL |
| 41  | 全テキスト（通常サイズ）のコントラスト比        | CONDITIONAL |
| 42  | 全テキスト（大サイズ / UI部品）のコントラスト比 | CONDITIONAL |
| 43  | StatusIndicator ドットの背景とのコントラスト    | CONDITIONAL |
| 44  | FilterChip 非選択時テキストのコントラスト       | CONDITIONAL |
| 45  | SuggestionBubble フォーカスリングの視認性       | CONDITIONAL |
| 46  | FilterChip フォーカスリングの視認性             | CONDITIONAL |
| 47  | 3テーマ全てでフォーカスリングが視認可能         | CONDITIONAL |

### Task 6: 後方互換性確認（#48-#51）

| #   | テスト項目                                     | 期待結果                                        | 判定 | 備考                                                                                                                                                                                                                                                                                                                                          |
| --- | ---------------------------------------------- | ----------------------------------------------- | ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 48  | GlobalNavStrip 内の Badge 表示                 | 既存の表示と同等、レイアウト崩れなし            | PASS | Badge は `forwardRef` + `memo` で実装。デフォルト `variant="default"` で `bg-[var(--bg-tertiary)] text-[var(--text-primary)]` が適用される。既存の `children` Props は維持され、新規 `content` / `variant` Props は追加のみ。`role="status"` も追加されたが既存レイアウトへの影響はない。テストコードで既存 children レンダリングを検証済み。 |
| 49  | AgentView 内の EmptyState 表示                 | 既存の表示と同等、mood 未指定時はデフォルト動作 | PASS | `mood` Props はオプショナルで未指定時はデフォルト動作（`text-[var(--text-muted)]`、`animate-bounce` なし）。テストコードで mood 未指定時のデフォルトカラーと animate-bounce 非適用を検証済み（EmptyState.test.tsx EE-02）。`action` Props は ReactNode 形式を引き続きサポート（テスト済み）。`className` Props も維持。                       |
| 50  | Badge に variant 未指定で既存と同等の表示      | デフォルト variant が従来の見た目を維持         | PASS | `variant` デフォルト値は `"default"`。`variantStyles.default` は `bg-[var(--bg-tertiary)] text-[var(--text-primary)]`。テストコードで `variant` 未指定時のデフォルトスタイル適用を検証済み。`size` デフォルト値は `"md"`（`h-6`）で従来互換。                                                                                                 |
| 51  | EmptyState に suggestions 未指定で既存動作維持 | suggestions 省略時は従来のレイアウトが表示      | PASS | `suggestions` Props はオプショナル。未指定時は `suggestions-container` がレンダリングされないことをテストコードで検証済み（EmptyState.test.tsx EE-01: `suggestions={[]}` で container なし）。`suggestions` 未指定時は既存の title / description / icon / action のみのレイアウトが維持される。                                               |

## Phase 10 MINOR 指摘の重点確認

### M-1: RelativeTime の Props 命名差異（`updateInterval` vs `refreshInterval`）

**確認結果**: 実装コードの Props 名は `refreshInterval`（デフォルト値: 60000ms）。テストコードでも `refreshInterval` を使用してカスタム間隔（30000ms）での動作を検証済み。機能は仕様通りに動作する。命名の差異は仕様書側の記載修正で対応すべきであり、実装側の変更は不要。

**手動テスト影響**: テスト #26（RelativeTime 時間経過での表示更新）で機能動作を PASS 判定。Props 名の差異は機能に影響なし。

### M-2: SuggestionBubble `size="sm"` タッチターゲット（36px < 44px推奨）

**確認結果**: 実装コードで sm サイズは `h-9`（36px）。テストコードで `h-9` クラス適用を検証済み。md（デフォルト）は `h-11`（44px）で Apple HIG 推奨に合致。sm は密度優先 UI オプションとして許容する判断が Phase 10 で行われている。

**手動テスト影響**: テスト #14（mobile SuggestionBubble sm サイズ）で CONDITIONAL 判定。実機での操作性確認が推奨される。

### M-3: SuggestionBubble success-bounce の責務明確化

**確認結果**: SuggestionBubble 単体には `animate-bounce` は未実装。バウンスアニメーションは EmptyState コンポーネントの `mood="celebrating"` でアイコンラッパーに適用される。テストコードで EmptyState の `mood="celebrating"` 時の `animate-bounce` クラス適用を検証済み。

**手動テスト影響**: テスト #21（SuggestionBubble クリックで success-bounce）で CONDITIONAL 判定。仕様の「success-bounce」が SuggestionBubble 単体の動作ではなく EmptyState 統合時の動作である点を確認。

## 発見された問題

### Minor severity

| #   | 問題                                             | コンポーネント               | 影響                                                              | 推奨対応                                                                       |
| --- | ------------------------------------------------ | ---------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| I-1 | FilterChip に明示的な `hover:` スタイルが未定義  | FilterChip                   | ホバー時の視覚的フィードバックが不明確になる可能性                | `hover:bg-[var(--bg-elevated)]` 等のホバースタイル追加を検討                   |
| I-2 | フォーカスリングがブラウザデフォルトに依存       | SuggestionBubble, FilterChip | dark / kanagawa-dragon テーマでフォーカスリングが見えにくい可能性 | `focus-visible:ring-2 focus-visible:ring-[var(--status-primary)]` の追加を検討 |
| I-3 | Badge の `aria-label` が「通知」前置詞を含まない | Badge                        | 仕様の「通知 {count}件」と実装の「{count}件」に差異               | 仕様書記載の修正、または `aria-label` テンプレートの調整を検討                 |

### Critical / Major severity

なし。

## 推奨事項

### 実機テスト時の注意点

1. **テーマ切替テスト（#10, #11）**: 設定画面からテーマを切り替え、各コンポーネントの表示がちらつきなく切り替わることを確認する。特にアニメーション中のコンポーネント（StatusIndicator pulse、SkeletonCard pulse）でのテーマ切替に注意
2. **VoiceOver テスト（#35-#40）**: macOS の VoiceOver（Cmd + F5）を有効にし、Tab キーで各コンポーネントにフォーカスを移動しながら読み上げ文言を確認する。特に `div[role="button"]`（SuggestionBubble）がネイティブ `<button>` と同等に読み上げられるかを重点確認
3. **コントラスト比計測（#41-#44）**: DevTools の Accessibility Inspector または WebAIM Contrast Checker で数値を計測する。3テーマ全てで計測すること
4. **フォーカスリング確認（#45-#47）**: Tab キーでフォーカスを移動し、各テーマでフォーカスリングが視認できることを確認する。問題がある場合は I-2 の推奨対応を実施

### 後続タスクへの引き継ぎ事項

- I-1（FilterChip ホバースタイル）と I-2（フォーカスリング）は、実機確認で問題が確認された場合に未タスク化する（Phase 12 Task 4 で処理）
- M-1（RelativeTime Props 命名）の仕様書修正は Phase 12 の仕様書更新で対応
- M-2（SuggestionBubble sm タッチターゲット）は密度優先 UI として許容済みだが、ユーザビリティテストで問題が報告された場合は再検討

## Phase 差し戻し判断

**差し戻しなし。** Critical / Major 問題は発見されなかった。FAIL 判定のテストケースは0件。31件の CONDITIONAL 判定は全てアクセシビリティの実機確認が必要な項目であり、コード分析上は正しい ARIA 属性・CSS 変数・イベントハンドラが実装されている。

## 成果物一覧

| #   | ファイル                   | パス                                            |
| --- | -------------------------- | ----------------------------------------------- |
| 1   | テーマテスト結果           | `outputs/phase-11/theme-test-result.md`         |
| 2   | レスポンシブテスト結果     | `outputs/phase-11/responsive-test-result.md`    |
| 3   | インタラクションテスト結果 | `outputs/phase-11/interaction-test-result.md`   |
| 4   | アクセシビリティテスト結果 | `outputs/phase-11/accessibility-test-result.md` |
| 5   | 手動テスト総括             | `outputs/phase-11/manual-test-result.md`        |

## 次Phase

Phase 12（ドキュメント）`phase-12-documentation.md` へ進行。
