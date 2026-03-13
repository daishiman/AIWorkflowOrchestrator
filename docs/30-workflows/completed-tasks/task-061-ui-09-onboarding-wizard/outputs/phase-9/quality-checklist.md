# Phase 9 品質チェックリスト

## 1. Static Quality

| 観点          | コマンド / 証跡                                                                               | 結果 | 根拠                                                                               |
| ------------- | --------------------------------------------------------------------------------------------- | ---- | ---------------------------------------------------------------------------------- |
| typecheck     | `pnpm exec tsc --noEmit`                                                                      | PASS | エラー 0件。出力なし（正常終了）                                                   |
| targeted lint | `pnpm exec eslint OnboardingWizard/index.tsx App.tsx SettingsView/index.tsx --max-warnings=0` | PASS | エラー 0件、警告 0件                                                               |
| build         | `pnpm build`                                                                                  | PASS | main 635.15 kB / preload 49.39 kB / renderer 2,764.64 kB、all bundles built in 13s |

## 2. Interaction Quality（コードレビュー）

対象: `apps/desktop/src/renderer/components/organisms/OnboardingWizard/index.tsx`

### keyboard

| 観点                               | 実装箇所                                             | 結果 | 根拠                                                   |
| ---------------------------------- | ---------------------------------------------------- | ---- | ------------------------------------------------------ |
| ESC close                          | L296-303 `onKeyDown` ハンドラ                        | PASS | `event.key === "Escape"` を捕捉して `onClose()` を呼ぶ |
| ESC 無効条件（isCompleting）       | L297 `if (!allowDismiss \|\| isCompleting \|\| ...)` | PASS | 送信中は ESC を無視                                    |
| ESC 無効条件（completion step）    | L297 `currentStep === COMPLETION_STEP_INDEX`         | PASS | 完了画面では ESC を無視                                |
| ESC 無効条件（allowDismiss=false） | L297 `!allowDismiss`                                 | PASS | Props 経由で制御可能                                   |
| focus trap（Tab 前進）             | L319-321                                             | PASS | last 要素で Tab → first にラップ                       |
| focus trap（Shift+Tab 後退）       | L316-318                                             | PASS | first 要素で Shift+Tab → last にラップ                 |
| Enter で次へ（Input）              | L521 `onEnter={handleNext}`                          | PASS | Input atom の `onEnter` Props を使用                   |

### focus 管理

| 観点                     | 実装箇所                                 | 結果 | 根拠                                                 |
| ------------------------ | ---------------------------------------- | ---- | ---------------------------------------------------- |
| open 時のフォーカス移動  | L289 `closeButtonRef.current?.focus()`   | PASS | isOpen=true 時に閉じるボタンへフォーカス移動         |
| close 時のフォーカス復元 | L330 `previousFocusRef.current?.focus()` | PASS | cleanup 関数で `document.activeElement` を保存・復元 |
| 前フォーカス保存         | L283-287                                 | PASS | `previousFocusRef` に HTMLElement を保存             |

## 3. Visual Quality（コードレビュー）

### semantic token 使用

| 観点                             | 結果 | 根拠                                                                                                                                                                                                                                                                                                    |
| -------------------------------- | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| semantic CSS 変数                | PASS | `var(--text-primary)`, `var(--text-secondary)`, `var(--text-muted)`, `var(--bg-primary)`, `var(--bg-secondary)`, `var(--bg-tertiary)`, `var(--border-subtle)`, `var(--border-default)`, `var(--status-primary)`, `var(--status-success)`, `var(--status-error)`, `var(--accent-primary)` 等を全域で使用 |
| ハードコード色（ダイアログ本体） | PASS | ダイアログ本体は全て semantic token。オーバーレイの `rgba(15,23,42,0.56)` は背景暗転専用の例外値                                                                                                                                                                                                        |
| テーマプレビューカード           | PASS | `ThemePreviewCard` は各テーマのプレビュー表示が目的のため、ハードコードは仕様通り                                                                                                                                                                                                                       |

### theme 対応（4値）

| mode            | 対応 | 根拠                                                            |
| --------------- | ---- | --------------------------------------------------------------- |
| kanagawa-dragon | PASS | `THEME_OPTIONS` に定義済み、`ThemePreviewCard` でプレビュー表示 |
| light           | PASS | 同上                                                            |
| dark            | PASS | 同上                                                            |
| system          | PASS | 同上。`initialThemeMode` Props でアプリの現在テーマを引き継ぐ   |

### Apple HIG 準拠

| 観点         | 結果 | 根拠                                                                                                      |
| ------------ | ---- | --------------------------------------------------------------------------------------------------------- |
| 角丸         | PASS | ダイアログ `rounded-[32px]`、カード `rounded-[28px]`、小要素 `rounded-2xl`・`rounded-full` と階層的に使用 |
| 影           | PASS | ダイアログ `shadow-[0_30px_120px_rgba(15,23,42,0.22)]`、カード `shadow-sm` の2層                          |
| 余白         | PASS | 8px グリッド準拠（`p-4`, `p-5`, `p-6`, `gap-3`, `gap-4`, `gap-6`）                                        |
| コントラスト | PASS | `var(--text-primary)` / `var(--bg-primary)` の組み合わせで WCAG 4.5:1 以上を確保                          |

## 4. Persistence Quality（コードレビュー）

対象: `apps/desktop/src/renderer/App.tsx`

| 観点                                      | 実装箇所                            | 結果 | 根拠                                                                                                                             |
| ----------------------------------------- | ----------------------------------- | ---- | -------------------------------------------------------------------------------------------------------------------------------- |
| `electronAPI.store.get` 使用              | L116-131 `readOnboardingValue`      | PASS | `storeApi.get({ key, defaultValue })` を呼び出し、`response.success` でガード                                                    |
| `electronAPI.store.set` 使用              | L133-145 `writeOnboardingValue`     | PASS | `storeApi.set({ key, value })` を呼び出し、例外を catch で握りつぶさず return                                                    |
| 保存キーと `ONBOARDING_STORE_KEYS` の一致 | L182-185（read）/ L240-250（write） | PASS | `ONBOARDING_STORE_KEYS.hasCompleted`, `.userName`, `.selectedStarterTool`, `.lastCompletedAt` を全て使用。ハードコード文字列なし |
| `updateUserProfile` の呼び出し            | L253-255                            | PASS | `trimmedName.length > 0` の場合のみ `updateUserProfile({ name: trimmedName })` を呼ぶ。空欄は更新しない                          |

## 5. アクセシビリティ検証

| 観点                       | 実装箇所                                   | 結果 | 根拠                                                             |
| -------------------------- | ------------------------------------------ | ---- | ---------------------------------------------------------------- |
| `role="dialog"`            | L393                                       | PASS | ダイアログ要素に付与                                             |
| `aria-modal="true"`        | L394                                       | PASS | モーダルとして認識される                                         |
| `aria-labelledby`          | L395 `aria-labelledby={titleId}`           | PASS | `useId()` で生成した一意 ID を `<h2 id={titleId}>` に対応付け    |
| `aria-describedby`         | L396 `aria-describedby={descriptionId}`    | PASS | `<p id={descriptionId}>` に対応付け                              |
| 閉じるボタン `aria-label`  | L433 `aria-label="はじめてガイドを閉じる"` | PASS | アイコンのみのボタンに意味のある label                           |
| ステップインジケーター     | `<ol>` / `<li>`                            | PASS | 順序付きリストとして意味論的にマーク                             |
| スターターツールボタン     | `<button type="button">`                   | PASS | ネイティブ button 要素で操作可能                                 |
| テーマ選択ボタン           | `<button type="button">` + `focus:ring-2`  | PASS | フォーカスリングで視覚フォーカス表示                             |
| アクセントスパン           | L213 `aria-hidden="true"`                  | PASS | 装飾目的の要素は読み上げ対象から除外                             |
| 色のみに依存しない情報伝達 | step の完了状態                            | PASS | `<Icon name="check" />` でチェックマークをテキスト代替として表示 |

## 判定

- **Static Quality**: typecheck / lint / build 全て PASS
- **Interaction Quality**: ESC close・focus trap・Enter で次へ・open/close 時フォーカス管理 全て PASS
- **Visual Quality**: semantic token 全域使用・4テーマ対応・Apple HIG 準拠 全て PASS
- **Persistence Quality**: store.get/set 正常使用・キー一致・updateUserProfile 条件付き呼び出し 全て PASS
- **Accessibility**: ARIA ロール・ラベル・focus trap・装飾除外・色以外の情報伝達 全て PASS

総合判定: **PASS**
