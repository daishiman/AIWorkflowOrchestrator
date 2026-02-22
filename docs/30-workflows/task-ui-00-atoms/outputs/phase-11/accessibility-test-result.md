# アクセシビリティテスト結果 -- TASK-UI-00-ATOMS Phase 11

## メタ情報

| 項目     | 値                                  |
| -------- | ----------------------------------- |
| タスクID | TASK-UI-00-ATOMS                    |
| Phase    | 11 -- 手動テスト Task 5             |
| 検証日   | 2026-02-23                          |
| 検証方法 | コード分析ベース + 実機確認要否判定 |

## Task 5-1: スクリーンリーダー（VoiceOver）テスト結果

| #   | テスト項目                             | 期待結果                                            | 判定        | 備考                                                                                                                                                                                                                                                                                                                                                                        |
| --- | -------------------------------------- | --------------------------------------------------- | ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 35  | StatusIndicator の VoiceOver 読み上げ  | 「ステータス: running」のように状態が読み上げられる | CONDITIONAL | `role="status"` と `aria-label="ステータス: {status}"` が実装されている。テストコードで `aria-label` の設定を検証済み（StatusIndicator.test.tsx アクセシビリティ describe）。カスタム `label` props による上書きもテスト済み。ただし VoiceOver の実際の読み上げ文言（`role="status"` との組み合わせ）は実機確認が必要。                                                     |
| 36  | FilterChip の VoiceOver 読み上げ       | 「{label}, チェックボックス, {選択/未選択}」        | CONDITIONAL | `role="checkbox"` と `aria-checked={isSelected}` が実装されている。テストコードで `aria-checked` の true/false 切替を検証済み（FilterChip.test.tsx アクセシビリティ describe）。`aria-disabled` もテスト済み。VoiceOver が `role="checkbox"` + `aria-checked` をどのように読み上げるかは実機確認が必要。                                                                    |
| 37  | Badge (number) の VoiceOver 読み上げ   | 「通知 {count}件」が読み上げられる                  | CONDITIONAL | `role="status"` が設定されている。`content` が `number` 型の場合は `aria-label="{content}件"` が自動設定される（例: `aria-label="42件"`）。テストコードで `content={42}` 時の `aria-label="42件"` と明示的 `aria-label` の優先を検証済み。「通知」という前置詞は実装に含まれず、「{count}件」のみ。VoiceOver での実際の読み上げ（「ステータス、42件」等）は実機確認が必要。 |
| 38  | SkeletonCard の VoiceOver 読み上げ     | 「読み込み中」が読み上げられる                      | CONDITIONAL | `role="status"`、`aria-label="読み込み中"`、`aria-busy="true"` が実装されている。テストコードで3属性全てを検証済み（SkeletonCard.test.tsx アクセシビリティ describe）。VoiceOver が `aria-busy="true"` + `aria-label` をどのように読み上げるかは実機確認が必要。                                                                                                            |
| 39  | SuggestionBubble の VoiceOver 読み上げ | 「{label}, ボタン」が読み上げられる                 | CONDITIONAL | `role="button"` と `tabIndex={0}` が実装されている。テストコードで `role="button"` と `tabindex="0"` を検証済み。`aria-disabled` もテスト済み。VoiceOver が `div[role="button"]` をネイティブ `<button>` と同等に読み上げるかは実機確認が必要。                                                                                                                             |
| 40  | RelativeTime の VoiceOver 読み上げ     | 相対時間が正しく読み上げられる                      | CONDITIONAL | `<time>` 要素の `dateTime` 属性に ISO 8601 形式の値が設定されている。テストコードで `dateTime` 属性と `title` 属性の設定を検証済み。テキストコンテンツ（「5分前」等）は直接表示される。VoiceOver が `<time>` 要素をどのように読み上げるか（テキストのみか、`dateTime` 属性も読むか）は実機確認が必要。不正タイムスタンプ時のフォールバック表示（`"\u2014"`）もテスト済み。  |

## Task 5-2: コントラスト比検証

| #   | テスト項目                                      | 期待結果                  | 判定        | 備考                                                                                                                                                                                                                                                                                                                                                   |
| --- | ----------------------------------------------- | ------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 41  | 全テキスト（通常サイズ）のコントラスト比        | 4.5:1 以上（WCAG 2.1 AA） | CONDITIONAL | テキストは CSS 変数（`--text-primary`, `--text-secondary`, `--text-muted`, `--text-inverse`）で色指定されている。Phase 10 デザイントークン監査で CSS 変数使用率100%を確認済み。ただしコントラスト比の数値検証はコード分析のみでは不可能（CSS変数の実効値はテーマファイルで定義）。DevTools の Accessibility Inspector または専用ツールでの計測が必要。 |
| 42  | 全テキスト（大サイズ / UI部品）のコントラスト比 | 3:1 以上（WCAG 2.1 AA）   | CONDITIONAL | 大サイズテキストは EmptyState の `text-lg`（タイトル）が該当。UI 部品として StatusIndicator のドット、FilterChip の選択状態背景色、Badge のバリアント背景色がある。全て CSS 変数ベースだがコントラスト比の数値は実機計測が必要。                                                                                                                       |
| 43  | StatusIndicator ドットの背景とのコントラスト    | 3:1 以上                  | CONDITIONAL | ドット色は `--status-primary`、`--status-success`、`--status-error`、`--status-warning`、`--text-muted` で定義。背景色は親コンテナに依存。各テーマでの組み合わせにおけるコントラスト比は実機計測が必要。                                                                                                                                               |
| 44  | FilterChip 非選択時テキストのコントラスト       | 4.5:1 以上                | CONDITIONAL | 非選択時: テキスト `text-[var(--text-secondary)]`、背景 `bg-[var(--bg-tertiary)]`。CSS 変数の組み合わせにおけるコントラスト比は、テーマファイルの実効値に依存するため実機計測が必要。Apple HIG System Colors に準拠している場合は基準を満たす設計だが、数値の保証には計測が必要。                                                                      |

## Task 5-3: フォーカスインジケーター

| #   | テスト項目                                | 期待結果                            | 判定        | 備考                                                                                                                                                                                                                                                                                                                                                            |
| --- | ----------------------------------------- | ----------------------------------- | ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 45  | SuggestionBubble フォーカスリングの視認性 | 背景色との区別が明確、2px以上の太さ | CONDITIONAL | SuggestionBubble は `div[role="button"][tabIndex={0}]` で実装。カスタムの `:focus-visible` スタイルは実装コードに明示的に定義されていない（Tailwind のデフォルトまたはグローバル CSS に依存）。フォーカスリングの色、太さ、コントラストは実機確認が必要。                                                                                                       |
| 46  | FilterChip フォーカスリングの視認性       | 背景色との区別が明確、2px以上の太さ | CONDITIONAL | FilterChip は `<button>` 要素のためブラウザネイティブのフォーカスリングが適用される。カスタムフォーカススタイルは実装コードに明示的に定義されていない。Electron（Chromium）のデフォルトフォーカスリングの品質を実機確認する必要がある。                                                                                                                         |
| 47  | 3テーマ全てでフォーカスリングが視認可能   | テーマごとにコントラスト確保        | CONDITIONAL | フォーカスリングのスタイルは CSS 変数ベースのカスタム定義ではなく、ブラウザデフォルトまたはグローバル CSS に依存。3テーマ（kanagawa-dragon / light / dark）それぞれの背景色に対してフォーカスリングが視認できるかは実機確認が必要。特に dark テーマと kanagawa-dragon テーマでは背景が暗いため、Chromium デフォルトのフォーカスリングが見えにくい可能性がある。 |

## テスト結果サマリー

### Task 5-1: スクリーンリーダー

| 判定        | 件数 |
| ----------- | ---- |
| PASS        | 0    |
| CONDITIONAL | 6    |
| FAIL        | 0    |

### Task 5-2: コントラスト比

| 判定        | 件数 |
| ----------- | ---- |
| PASS        | 0    |
| CONDITIONAL | 4    |
| FAIL        | 0    |

### Task 5-3: フォーカスインジケーター

| 判定        | 件数 |
| ----------- | ---- |
| PASS        | 0    |
| CONDITIONAL | 3    |
| FAIL        | 0    |

### Task 5 合計

| 判定        | 件数 |
| ----------- | ---- |
| PASS        | 0    |
| CONDITIONAL | 13   |
| FAIL        | 0    |

## 要実機確認項目

### VoiceOver テスト（全6件）

1. **#35 StatusIndicator**: `role="status"` + `aria-label` の読み上げ文言確認
2. **#36 FilterChip**: `role="checkbox"` + `aria-checked` の読み上げ文言確認（「チェックボックス」「選択/未選択」の表現）
3. **#37 Badge**: `role="status"` + `aria-label="{count}件"` の読み上げ文言確認
4. **#38 SkeletonCard**: `role="status"` + `aria-label="読み込み中"` + `aria-busy="true"` の読み上げ確認
5. **#39 SuggestionBubble**: `div[role="button"]` がネイティブ `<button>` と同等に読み上げられるか
6. **#40 RelativeTime**: `<time>` 要素のテキストコンテンツの読み上げ確認

### コントラスト比（全4件）

7. **#41 通常テキスト**: DevTools Accessibility Inspector で 4.5:1 以上を計測
8. **#42 大テキスト / UI 部品**: 3:1 以上を計測
9. **#43 StatusIndicator ドット**: 各ステータス色と背景色の組み合わせを計測
10. **#44 FilterChip 非選択テキスト**: `--text-secondary` / `--bg-tertiary` のコントラスト比を計測

### フォーカスインジケーター（全3件）

11. **#45 SuggestionBubble フォーカスリング**: 視認性と2px以上の太さ確認
12. **#46 FilterChip フォーカスリング**: 視認性と2px以上の太さ確認
13. **#47 3テーマでのフォーカスリング**: 特に dark / kanagawa-dragon テーマでの視認性

## コード分析根拠

### ARIA 属性の実装状況

| コンポーネント   | role     | aria-label                        | その他 ARIA                 | テスト検証 |
| ---------------- | -------- | --------------------------------- | --------------------------- | ---------- |
| StatusIndicator  | status   | ステータス: {status} (カスタム可) | -                           | 済         |
| FilterChip       | checkbox | -                                 | aria-checked, aria-disabled | 済         |
| Badge            | status   | {content}件 (number時自動)        | -                           | 済         |
| SkeletonCard     | status   | 読み込み中                        | aria-busy=true              | 済         |
| SuggestionBubble | button   | -                                 | aria-disabled               | 済         |
| RelativeTime     | -        | - (フォールバック時のみ)          | -                           | 済         |
| EmptyState       | status   | -                                 | -                           | 済         |

### フォーカスリングの潜在的リスク

SuggestionBubble と FilterChip のフォーカスリングはカスタムスタイルが未定義であり、ブラウザ / Electron のデフォルトに依存している。特に以下のリスクがある。

- **dark テーマ**: Chromium のデフォルトフォーカスリング（青色アウトライン）が暗い背景に対して視認性が不十分になる可能性
- **kanagawa-dragon テーマ**: テーマ固有の背景色とフォーカスリング色のコントラストが不確定

これらは実機確認で問題が発見された場合、`focus-visible:ring-2 focus-visible:ring-[var(--status-primary)]` 等のカスタムフォーカススタイルの追加を検討すべきである。
