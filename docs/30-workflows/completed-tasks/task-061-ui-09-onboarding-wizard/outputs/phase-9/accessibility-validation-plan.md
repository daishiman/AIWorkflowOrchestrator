# Phase 9 アクセシビリティ検証計画

## 検証観点

| 観点                                   | 方法                                                            | 結果 | 根拠                                                                         |
| -------------------------------------- | --------------------------------------------------------------- | ---- | ---------------------------------------------------------------------------- |
| focus trap（Tab 前進）                 | `OnboardingWizard.test.tsx` の Tab wrap テスト + コードレビュー | PASS | L319-321 でラスト要素 Tab → 先頭要素にラップ                                 |
| focus trap（Shift+Tab 後退）           | `OnboardingWizard.test.tsx` + コードレビュー                    | PASS | L316-318 で先頭要素 Shift+Tab → ラスト要素にラップ                           |
| ESC close                              | `OnboardingWizard.test.tsx` + コードレビュー                    | PASS | L296-303 `event.key === "Escape"` で `onClose()` 呼び出し                    |
| ESC 無効（isCompleting）               | コードレビュー                                                  | PASS | L297 `\|\| isCompleting` で送信中 ESC 無視                                   |
| ESC 無効（completion step）            | コードレビュー                                                  | PASS | L297 `\|\| currentStep === COMPLETION_STEP_INDEX`                            |
| ESC 無効（allowDismiss=false）         | コードレビュー                                                  | PASS | L297 `!allowDismiss`                                                         |
| open 時フォーカス                      | コードレビュー                                                  | PASS | L289 `closeButtonRef.current?.focus()`                                       |
| close 時フォーカス復元                 | コードレビュー                                                  | PASS | L330 cleanup 関数で `previousFocusRef.current?.focus()`                      |
| role="dialog"                          | コードレビュー                                                  | PASS | L393 ダイアログ要素に `role="dialog"`                                        |
| aria-modal="true"                      | コードレビュー                                                  | PASS | L394                                                                         |
| aria-labelledby                        | コードレビュー                                                  | PASS | L395 `useId()` による一意 ID で `<h2>` と対応付け                            |
| aria-describedby                       | コードレビュー                                                  | PASS | L396 `useId()` による一意 ID で `<p>` と対応付け                             |
| button label（閉じる）                 | コードレビュー                                                  | PASS | L433 `aria-label="はじめてガイドを閉じる"`                                   |
| button label（次へ / 完了 / 戻る）     | コードレビュー                                                  | PASS | テキストラベルが直接ボタン内に記述。アイコンのみのボタンはない               |
| ステップインジケーター意味論           | コードレビュー                                                  | PASS | `<ol>` / `<li>` で順序付きリストとして表現                                   |
| スターターツール選択                   | コードレビュー                                                  | PASS | `<button type="button">` + `focus:ring-2 focus:ring-[var(--status-primary)]` |
| テーマ選択                             | コードレビュー                                                  | PASS | `<button type="button">` + `focus:ring-2 focus:ring-[var(--status-primary)]` |
| 装飾要素の非読み上げ                   | コードレビュー                                                  | PASS | L213 アクセントスパン `aria-hidden="true"`                                   |
| 色のみに依存しない情報伝達             | コードレビュー                                                  | PASS | 完了済みステップは `<Icon name="check" />` でテキスト代替を提供              |
| button label（responsive readability） | TC-11-03, TC-11-05                                              | PASS | レスポンシブブレークポイント（sm:）でレイアウト変更あり。情報は欠落しない    |
| コントラスト                           | Apple UI/UX 目視レビュー（semantic token 確認）                 | PASS | `var(--text-primary)` / `var(--bg-primary)` で WCAG 4.5:1 以上を確保         |

## 補足

- screen reader の詳細読み上げは automated semantic check と visible label で担保した。
- `SuggestionBubble` は既存 atom を再利用しているため、task-061 では wrapper の選択状態（border 変化）だけを確認対象とした。
- `getFocusableElements` ユーティリティ（L151-161）は `[tabindex="-1"]` を除外したセレクタで DOM を走査し、確実にインタラクティブ要素のみを取得する。
- `useId()` を使用した `titleId` / `descriptionId` は React 18 の一意 ID 生成により、SSR/CSR 両環境でも重複しない。
- `allowDismiss=false` の場合は閉じるボタン自体が非表示（L426-439）になるため、ESC と UI ボタンの両方で一貫した動作を保証する。
